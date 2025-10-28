import { html, css, LitElement, nothing } from "lit";
import type { PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";
import {
  addDays,
  addHours,
  addMonths,
  addWeeks,
  addYears,
  differenceInDays,
  differenceInHours,
  endOfDay,
  endOfHour,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subHours,
  subMonths,
} from "date-fns";
import {
  fetchStatistics,
  getStatisticMetadata,
  type StatisticValue,
  type Statistics,
  type StatisticsMetaData,
  type StatisticsPeriod,
} from "./data/statistics";
import type {
  EnergyCustomGraphCardConfig,
  EnergyCustomGraphSeriesConfig,
  EnergyCustomGraphPeriodConfig,
  EnergyCustomGraphAxisConfig,
  EnergyCustomGraphStatisticType,
  EnergyCustomGraphCalculationConfig,
  EnergyCustomGraphCalculationTerm,
} from "./types";
import { buildSeries } from "./chart/series-builder";
import type {
  SeriesOption,
  ECOption,
  LegendOption,
  YAxisOption,
  BarSeriesOption,
} from "./types/echarts";
import { BAR_MAX_WIDTH } from "./chart/series-builder";

interface EnergyData {
  start: Date;
  end?: Date;
  startCompare?: Date;
  endCompare?: Date;
}

interface EnergyCollection {
  start: Date;
  end?: Date;
  subscribe(callback: (data: EnergyData) => void): () => void;
  setPeriod?(start: Date, end?: Date): void;
  setCompare?(compare: unknown): void;
}

const DEFAULT_TIMESPAN: EnergyCustomGraphTimespanConfig = { mode: "energy" };

@customElement("energy-custom-graph-card")
export class EnergyCustomGraphCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config?: EnergyCustomGraphCardConfig;
  @state() private _statistics?: Statistics;
  @state() private _metadata?: Record<string, StatisticsMetaData>;
  @state() private _periodStart?: Date;
  @state() private _periodEnd?: Date;
  @state() private _isLoading = false;
  @state() private _chartData: SeriesOption[] = [];
  @state() private _chartOptions?: ECOption;

  private _energyCollection?: EnergyCollection;
  private _energyStart?: Date;
  private _energyEnd?: Date;
  private _activeFetch = 0;
  private _unitsBySeries: Map<string, string | null | undefined> = new Map();
  private _collectionUnsub?: () => void;
  private _collectionPollHandle?: number;
  private _loadTimeout?: number;
  private _loggedEnergyFallback = false;
  private _calculatedSeriesData = new Map<string, StatisticValue[]>();
  private _calculatedSeriesUnits = new Map<string, string | null | undefined>();

  private static readonly FALLBACK_WARNING =
    "[energy-custom-graph-card] Falling back to default period because energy date selection is unavailable.";

  private static readonly DEFAULT_STAT_TYPE = "change";
  private static readonly clampValue = (
    value: number,
    min?: number,
    max?: number
  ): number => {
    let result = value;
    if (min !== undefined) {
      result = Math.max(result, min);
    }
    if (max !== undefined) {
      result = Math.min(result, max);
    }
    return result;
  };

  public connectedCallback(): void {
    super.connectedCallback();
    if (this.hass && this._config) {
      this._syncWithConfig();
    }
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this._teardownEnergyCollection();
    if (this._loadTimeout) {
      clearTimeout(this._loadTimeout);
      this._loadTimeout = undefined;
    }
  }

  public willUpdate(changedProps: PropertyValues): void {
    if (changedProps.has("hass") && this.hass && this._config) {
      this._syncWithConfig();
    }
    if (changedProps.has("_config")) {
      const oldConfig = changedProps.get("_config") as
        | EnergyCustomGraphCardConfig
        | undefined;
      if (this.hass && this._config) {
        this._syncWithConfig(oldConfig);
      }
    }
  }

  private _syncWithConfig(oldConfig?: EnergyCustomGraphCardConfig): void {
    if (!this._config || !this.hass) {
      return;
    }

    const needsEnergyCollection = this._needsEnergyCollection(this._config);
    const neededBefore = this._needsEnergyCollection(oldConfig);

    if (needsEnergyCollection) {
      const collectionKeyChanged =
        oldConfig?.collection_key !== this._config.collection_key;
      const timespanModeChanged =
        oldConfig?.timespan?.mode !== this._config.timespan?.mode;
      if (
        collectionKeyChanged ||
        timespanModeChanged ||
        (!this._energyCollection && !this._collectionPollHandle)
      ) {
        this._setupEnergyCollection();
      }
    } else if (neededBefore) {
      this._teardownEnergyCollection();
    }

    const periodChanged = this._recalculatePeriod();
    const seriesChanged =
      !!oldConfig &&
      JSON.stringify(oldConfig.series) !== JSON.stringify(this._config.series);

    if (periodChanged || seriesChanged || !this._statistics) {
      this._scheduleLoad();
    }
  }

  private _needsEnergyCollection(
    config?: EnergyCustomGraphCardConfig
  ): boolean {
    return config?.timespan?.mode === "energy";
  }

  private _setupEnergyCollection(attempt = 0): void {
    if (this._config?.timespan?.mode !== "energy" || !this.hass) {
      return;
    }

    if (attempt === 0) {
      this._teardownEnergyCollection();
    } else if (this._collectionPollHandle) {
      window.clearTimeout(this._collectionPollHandle);
      this._collectionPollHandle = undefined;
    }

    const key = this._config.collection_key
      ? `_${this._config.collection_key}`
      : "_energy";
    const connection = this.hass.connection as Record<string, unknown> | undefined;
    const candidate = connection?.[key] as EnergyCollection | undefined;

    if (candidate && typeof candidate.subscribe === "function") {
      if (this._collectionUnsub) {
        this._collectionUnsub();
        this._collectionUnsub = undefined;
      }
      this._energyCollection = candidate;
      this._loggedEnergyFallback = false;
      this._collectionUnsub = candidate.subscribe((data) => {
        this._energyStart = data.start;
        this._energyEnd = data.end ?? undefined;
        const periodChanged = this._recalculatePeriod();
        if (periodChanged || !this._statistics) {
          this._scheduleLoad();
        }
      });
      return;
    }

    const MAX_ATTEMPTS = 50;
    if (attempt >= MAX_ATTEMPTS) {
      if (!this._loggedEnergyFallback) {
        console.warn(EnergyCustomGraphCard.FALLBACK_WARNING);
        this._loggedEnergyFallback = true;
      }
      this._energyCollection = undefined;
      this._collectionUnsub = undefined;
      const periodChanged = this._recalculatePeriod();
      if (periodChanged || !this._statistics) {
        this._scheduleLoad();
      }
      this._collectionPollHandle = window.setTimeout(
        () => this._setupEnergyCollection(MAX_ATTEMPTS),
        1000
      );
      return;
    }

    this._collectionPollHandle = window.setTimeout(
      () => this._setupEnergyCollection(attempt + 1),
      200
    );
  }

  private _teardownEnergyCollection(): void {
    if (this._collectionPollHandle) {
      window.clearTimeout(this._collectionPollHandle);
      this._collectionPollHandle = undefined;
    }
    if (this._collectionUnsub) {
      this._collectionUnsub();
      this._collectionUnsub = undefined;
    }
    this._energyCollection = undefined;
    this._energyStart = undefined;
    this._energyEnd = undefined;
  }

  private _recalculatePeriod(): boolean {
    const resolved = this._resolvePeriod();
    if (!resolved) {
      return false;
    }

    const { start, end } = resolved;
    const prevStart = this._periodStart?.getTime();
    const prevEnd = this._periodEnd?.getTime();
    const nextStart = start.getTime();
    const nextEnd = end?.getTime();

    const changed = prevStart !== nextStart || prevEnd !== nextEnd;
    if (changed) {
      this._periodStart = start;
      this._periodEnd = end;
    }
    return changed;
  }

  private _resolvePeriod():
    | { start: Date; end?: Date }
    | undefined {
    if (!this._config) {
      return undefined;
    }
    const timespanConfig = this._config.timespan ?? DEFAULT_TIMESPAN;

    switch (timespanConfig.mode) {
      case "energy": {
        const energyRange = this._getEnergyRange();
        if (!energyRange) {
          if (this._loggedEnergyFallback) {
            return this._defaultEnergyRange();
          }
          return undefined;
        }
        return energyRange;
      }
      case "relative": {
        const base = this._defaultRelativeBase(timespanConfig.period);
        if (!base) {
          return undefined;
        }
        const offset = timespanConfig.offset ?? 0;
        switch (timespanConfig.period) {
          case "hour": {
            const start = addHours(base.start, offset);
            const end = base.end
              ? addHours(base.end, offset)
              : endOfHour(addHours(base.start, offset));
            return { start, end };
          }
          case "day": {
            const start = addDays(base.start, offset);
            const end = base.end
              ? addDays(base.end, offset)
              : endOfDay(addDays(base.start, offset));
            return { start, end };
          }
          case "week": {
            const start = addWeeks(base.start, offset);
            const end = base.end
              ? addWeeks(base.end, offset)
              : endOfWeek(addWeeks(base.start, offset));
            return { start, end };
          }
          case "month": {
            const start = addMonths(base.start, offset);
            const end = base.end
              ? addMonths(base.end, offset)
              : endOfMonth(addMonths(base.start, offset));
            return { start, end };
          }
          case "last_7_days": {
            // Rolling 7-day window: end = now + offset days, start = end - 7 days
            const now = new Date();
            const end = addDays(now, offset);
            const start = subDays(end, 7);
            return { start, end };
          }
          case "last_30_days": {
            // Rolling 30-day window: end = now + offset days, start = end - 30 days
            const now = new Date();
            const end = addDays(now, offset);
            const start = subDays(end, 30);
            return { start, end };
          }
          case "last_12_months": {
            // Rolling 12-month window: end = now + offset months, start = end - 12 months
            const now = new Date();
            const end = addMonths(now, offset);
            const start = subMonths(end, 12);
            return { start, end };
          }
          case "year":
          default: {
            const start = addYears(base.start, offset);
            const end = base.end
              ? addYears(base.end, offset)
              : endOfYear(addYears(base.start, offset));
            return { start, end };
          }
        }
      }
      case "fixed": {
        // Default to today if no start provided
        const startStr = timespanConfig.start;
        const start = startStr ? new Date(startStr) : startOfDay(new Date());
        if (Number.isNaN(start.getTime())) {
          throw new Error("Invalid start date in fixed timespan configuration");
        }

        // Default to end of start day if no end provided
        const endStr = timespanConfig.end;
        const end = endStr ? new Date(endStr) : endOfDay(start);
        if (Number.isNaN(end.getTime())) {
          throw new Error("Invalid end date in fixed timespan configuration");
        }
        return { start, end };
      }
      default:
        return undefined;
    }
  }

  private _getEnergyRange():
    | { start: Date; end?: Date }
    | undefined {
    if (!this._energyStart) {
      return undefined;
    }
    return {
      start: this._energyStart,
      end: this._energyEnd,
    };
  }

  private _defaultEnergyRange(): { start: Date; end: Date } {
    return {
      start: startOfDay(new Date()),
      end: endOfDay(new Date()),
    };
  }

  private _defaultRelativeBase(
    period: "hour" | "day" | "week" | "month" | "year"
  ): { start: Date; end: Date } {
    const now = new Date();
    switch (period) {
      case "hour":
        return {
          start: startOfDay(now),
          end: endOfDay(now),
        };
      case "day":
        return this._defaultEnergyRange();
      case "week":
        return {
          start: startOfWeek(now),
          end: endOfWeek(now),
        };
      case "month":
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
        };
      case "year":
      default:
        return {
          start: startOfYear(now),
          end: endOfYear(now),
        };
    }
  }

  private _scheduleLoad(): void {
    if (this._loadTimeout) {
      clearTimeout(this._loadTimeout);
    }
    this._loadTimeout = window.setTimeout(() => {
      this._loadTimeout = undefined;
      void this._loadStatistics();
    }, 500);
  }

  private async _loadStatistics(): Promise<void> {
    if (!this._config || !this.hass || !this._periodStart) {
      return;
    }

    const statisticIdSet = new Set<string>();
    const statTypeSet = new Set<EnergyCustomGraphStatisticType>();
    this._config.series.forEach((series) => {
      const defaultStatType =
        series.stat_type ?? EnergyCustomGraphCard.DEFAULT_STAT_TYPE;
      if (series.statistic_id && series.statistic_id.trim()) {
        const id = series.statistic_id.trim();
        statisticIdSet.add(id);
        statTypeSet.add(defaultStatType);
      }
      series.calculation?.terms?.forEach((term) => {
        const termStatType =
          term.stat_type ?? defaultStatType ?? EnergyCustomGraphCard.DEFAULT_STAT_TYPE;
        if (term.statistic_id && term.statistic_id.trim()) {
          statisticIdSet.add(term.statistic_id.trim());
          statTypeSet.add(termStatType);
        }
      });
    });

    const statisticIds = Array.from(statisticIdSet);
    const statTypesRaw = Array.from(statTypeSet);
    const statTypes = statTypesRaw.length
      ? statTypesRaw
      : [EnergyCustomGraphCard.DEFAULT_STAT_TYPE];

    const aggregationPlan = this._resolveAggregationPlan(
      this._periodStart,
      this._periodEnd
    );

    const fetchId = ++this._activeFetch;
    const loadingAtStart = !this._statistics;
    if (loadingAtStart) {
      this._isLoading = true;
    }

    try {
      const metadata: Record<string, StatisticsMetaData> = {};

      if (statisticIds.length) {
        try {
          const metadataArray = await getStatisticMetadata(
            this.hass,
            statisticIds
          );
          metadataArray.forEach((item) => {
            metadata[item.statistic_id] = item;
          });
        } catch (error) {
          console.error(
            "[energy-custom-graph-card] Failed to load statistics metadata",
            error
          );
        }
      }

      let statistics: Statistics = {};

      if (statisticIds.length) {
        for (let idx = 0; idx < aggregationPlan.length; idx++) {
          const aggregation = aggregationPlan[idx];
          try {
            const fetched = await fetchStatistics(
              this.hass,
              this._periodStart,
              this._periodEnd,
              statisticIds,
              aggregation,
              undefined,
              statTypes
            );
            statistics = fetched;
            if (this._statisticsHaveData(fetched, statisticIds)) {
              if (idx > 0) {
                console.warn(
                  `[energy-custom-graph-card] Aggregation "${aggregationPlan[0]}" returned no data. Using fallback "${aggregation}".`
                );
              }
              break;
            }
            if (idx < aggregationPlan.length - 1) {
              console.warn(
                `[energy-custom-graph-card] Aggregation "${aggregation}" returned no data. Trying fallback "${aggregationPlan[idx + 1]}".`
              );
            }
          } catch (error) {
            console.error(
              `[energy-custom-graph-card] Failed to load statistics for aggregation "${aggregation}"`,
              error
            );
          }
        }
      }

      if (fetchId !== this._activeFetch) {
        return;
      }

      this._metadata = metadata;
      this._statistics = statistics;
      this._rebuildCalculatedSeries(statistics, metadata);
    } catch (error) {
      if (fetchId === this._activeFetch) {
        console.error(
          "[energy-custom-graph-card] Failed to load statistics",
          error
        );
        this._metadata = undefined;
        this._statistics = undefined;
        this._calculatedSeriesData = new Map();
        this._calculatedSeriesUnits = new Map();
      }
    } finally {
      if (fetchId === this._activeFetch && loadingAtStart) {
        this._isLoading = false;
      }
    }
  }

  private _getCalculationKey(index: number): string {
    return `calculation_${index}`;
  }

  private _rebuildCalculatedSeries(
    statistics: Statistics,
    metadata: Record<string, StatisticsMetaData>
  ): void {
    const data = new Map<string, StatisticValue[]>();
    const units = new Map<string, string | null | undefined>();

    if (!this._config) {
      this._calculatedSeriesData = data;
      this._calculatedSeriesUnits = units;
      return;
    }

    this._config.series.forEach((series, index) => {
      if (!series.calculation) {
        return;
      }
      const result = this._evaluateCalculationSeries(
        series,
        series.calculation,
        statistics,
        metadata,
        index
      );
      if (!result) {
        return;
      }
      const key = this._getCalculationKey(index);
      data.set(key, result.values);
      units.set(key, result.unit);
    });

    this._calculatedSeriesData = data;
    this._calculatedSeriesUnits = units;
  }

  private _evaluateCalculationSeries(
    series: EnergyCustomGraphSeriesConfig,
    calculation: EnergyCustomGraphCalculationConfig,
    statistics: Statistics,
    metadata: Record<string, StatisticsMetaData>,
    seriesIndex: number
  ): { values: StatisticValue[]; unit?: string | null } | undefined {
    if (!calculation.terms?.length) {
      return undefined;
    }

    type TermResolvedData = {
      term: EnergyCustomGraphCalculationTerm;
      data?: Map<
        number,
        { value: number | null; start?: number; end?: number }
      >;
      constant?: number;
      unit?: string | null;
    };

    const timestampSet = new Set<number>();
    const termData: TermResolvedData[] = [];
    const missingStatWarnings = new Set<string>();
    const seriesLabel =
      series.name ??
      series.statistic_id ??
      `series_${seriesIndex}`;

    calculation.terms.forEach((term) => {
      const multiplier = term.multiply ?? 1;
      const addition = term.add ?? 0;

      if (term.statistic_id) {
        const raw = statistics?.[term.statistic_id];
        const statKey =
          term.stat_type ??
          series.stat_type ??
          EnergyCustomGraphCard.DEFAULT_STAT_TYPE;
        const map = new Map<
          number,
          { value: number | null; start?: number; end?: number }
        >();

        if (!raw?.length) {
          if (!missingStatWarnings.has(term.statistic_id)) {
            console.warn(
              `[energy-custom-graph-card] Calculation series "${seriesLabel}" references statistic "${term.statistic_id}" but no data was loaded. Missing values will be treated as zero.`
            );
            missingStatWarnings.add(term.statistic_id);
          }
        } else {
          raw.forEach((entry) => {
            const timestamp = entry.end ?? entry.start;
            if (timestamp === undefined) {
              return;
            }
            const rawValue = entry[statKey];
            const numeric =
              typeof rawValue === "number" && Number.isFinite(rawValue)
                ? rawValue
                : null;
            const processed =
              numeric === null
                ? null
                : EnergyCustomGraphCard.clampValue(
                    numeric * multiplier + addition,
                    term.clip_min,
                    term.clip_max
                  );
            map.set(timestamp, {
              value: processed,
              start: entry.start,
              end: entry.end,
            });
            timestampSet.add(timestamp);
          });
        }

        termData.push({
          term,
          data: map,
          unit:
            metadata?.[term.statistic_id]?.statistics_unit_of_measurement ??
            undefined,
        });
      } else {
        const constantValue = EnergyCustomGraphCard.clampValue(
          (term.constant ?? 0) * multiplier + addition,
          term.clip_min,
          term.clip_max
        );
        termData.push({
          term,
          constant: constantValue,
        });
      }
    });

    const timestamps = Array.from(timestampSet).sort((a, b) => a - b);
    if (!timestamps.length) {
      return undefined;
    }

    const initialValue = calculation.initial_value ?? 0;
    const values: StatisticValue[] = [];
    const missingValueWarnings = new Set<string>();
    let divisionWarningLogged = false;

    timestamps.forEach((timestamp) => {
      let total = initialValue;
      let start: number | undefined;
      let end: number | undefined;
      let valid = true;

      termData.forEach((item) => {
        if (!valid) {
          return;
        }

        let termValue: number;
        if (item.data) {
          const entry = item.data.get(timestamp);
          if (entry?.start !== undefined && start === undefined) {
            start = entry.start;
          }
          if (entry?.end !== undefined && end === undefined) {
            end = entry.end;
          }

          if (entry?.value === null || entry === undefined) {
            termValue = 0;
            const statId = item.term.statistic_id;
            if (statId && !missingValueWarnings.has(statId)) {
              console.warn(
                `[energy-custom-graph-card] Missing value for statistic "${statId}" in calculation series "${seriesLabel}". Using 0 for this timestamp.`
              );
              missingValueWarnings.add(statId);
            }
          } else {
            termValue = entry.value;
          }
        } else {
          termValue = item.constant ?? 0;
        }

        switch (item.term.operation ?? "add") {
          case "subtract":
            total -= termValue;
            break;
          case "multiply":
            total *= termValue;
            break;
          case "divide":
            if (termValue === 0) {
              valid = false;
              if (!divisionWarningLogged) {
                console.warn(
                  `[energy-custom-graph-card] Division by zero encountered in calculation series "${seriesLabel}". The affected timestamp will be rendered as empty.`
                );
                divisionWarningLogged = true;
              }
            } else {
              total /= termValue;
            }
            break;
          case "add":
          default:
            total += termValue;
            break;
        }
      });

      const numericTotal =
        valid && Number.isFinite(total) ? total : null;
      const pointStart = start ?? timestamp;
      const pointEnd = end ?? timestamp;

      values.push({
        start: pointStart,
        end: pointEnd,
        change: numericTotal,
        sum: numericTotal,
        mean: numericTotal,
        min: numericTotal,
        max: numericTotal,
        state: numericTotal,
      });
    });

    const unit =
      calculation.unit ??
      termData.find((item) => item.unit !== undefined)?.unit ??
      null;

    return { values, unit };
  }

  private _statisticsHaveData(
    statistics: Statistics,
    ids: string[]
  ): boolean {
    if (!ids.length) {
      return true;
    }
    return ids.some((id) => statistics?.[id]?.length);
  }

  private _resolveAggregationPlan(
    start: Date,
    end?: Date
  ): StatisticsPeriod[] {
    const cfg = this._config?.aggregation;
    const usesPicker = this._needsEnergyCollection(this._config);
    const auto = this._deriveAutoStatisticsPeriod(start, end);
    const plan: StatisticsPeriod[] = [];

    const pushUnique = (period?: StatisticsPeriod) => {
      if (period && !plan.includes(period)) {
        plan.push(period);
      }
    };

    if (usesPicker) {
      const key = this._getEnergyPickerRangeKey(start, end);
      pushUnique(cfg?.energy_picker?.[key]);
    } else {
      pushUnique(cfg?.manual);
    }

    pushUnique(auto);
    pushUnique(cfg?.fallback);

    return plan.length ? plan : [auto];
  }

  private _deriveAutoStatisticsPeriod(
    start: Date,
    end?: Date
  ): StatisticsPeriod {
    const effectiveEnd = end ?? new Date();
    const dayDifference = Math.max(differenceInDays(effectiveEnd, start), 0);
    if (dayDifference > 35) {
      return "month";
    }
    if (dayDifference > 2) {
      return "day";
    }
    return "hour";
  }

  private _getEnergyPickerRangeKey(
    start: Date,
    end?: Date
  ): "hour" | "day" | "week" | "month" | "year" {
    const effectiveEnd = end ?? new Date();
    const hourDifference = Math.max(
      differenceInHours(effectiveEnd, start),
      0
    );
    const dayDifference = Math.max(
      differenceInDays(effectiveEnd, start),
      0
    );

    if (hourDifference <= 6) {
      return "hour";
    }
    if (dayDifference <= 1) {
      return "day";
    }
    if (dayDifference <= 7) {
      return "week";
    }
    if (dayDifference <= 35) {
      return "month";
    }
    return "year";
  }

  public static getStubConfig(): EnergyCustomGraphCardConfig {
    return {
      type: "custom:energy-custom-graph-card",
      series: [],
    };
  }

  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import("./energy-custom-graph-card-editor");
    return document.createElement("energy-custom-graph-card-editor");
  }

  public setConfig(config: EnergyCustomGraphCardConfig): void {
    if (!config.series || !Array.isArray(config.series) || !config.series.length) {
      throw new Error("At least one series must be configured");
    }

    config.series.forEach((series: EnergyCustomGraphSeriesConfig, index) => {
      if (!series) {
        console.warn(
          `[energy-custom-graph-card] Series at index ${index} is not defined and will be ignored.`
        );
        return;
      }
      const hasStatistic = typeof series.statistic_id === "string" && series.statistic_id.trim() !== "";
      const hasCalculation = !!series.calculation;
      if (hasStatistic && hasCalculation) {
        console.warn(
          `[energy-custom-graph-card] Series at index ${index} defines both statistic_id and calculation. The statistic will be ignored.`
        );
      }
      if (!hasStatistic && !hasCalculation) {
        console.warn(
          `[energy-custom-graph-card] Series at index ${index} is missing both statistic_id and calculation. The series will be skipped until configured.`
        );
      }
      if (hasCalculation) {
        const terms = series.calculation?.terms ?? [];
        if (!terms.length) {
          console.warn(
            `[energy-custom-graph-card] Calculation for series ${index} has no terms. The series will be skipped.`
          );
        }
        terms.forEach((term, termIndex) => {
          if (term.statistic_id === undefined && term.constant === undefined) {
            console.warn(
              `[energy-custom-graph-card] Calculation term ${termIndex} of series ${index} is missing both statistic_id and constant. This term will be ignored.`
            );
          }
        });
      }
    });

    const oldConfig = this._config;
    this._config = {
      ...config,
      timespan: config.timespan ?? DEFAULT_TIMESPAN,
    };
    this._loggedEnergyFallback = false;
    this.requestUpdate("_config", oldConfig);
    if (this.hass) {
      this._syncWithConfig(oldConfig);
    }
  }

  protected updated(changedProps: PropertyValues): void {
    if (
      changedProps.has("_statistics") ||
      changedProps.has("_metadata") ||
      changedProps.has("_periodStart") ||
      changedProps.has("_periodEnd") ||
      changedProps.has("_config")
    ) {
      this._generateChart();
    }
  }

  public getCardSize(): number {
    return 5;
  }

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    return html`
      <ha-card>
        ${this._config.title ? html`<h1 class="card-header">${this._config.title}</h1>` : nothing}
        <div class="content">
          ${this._renderChart()}
        </div>
      </ha-card>
    `;
  }

  private _renderChart() {
    if (this._isLoading) {
      return html`<div class="placeholder">
        ${this.hass.localize?.(
          "ui.components.statistics_charts.loading_statistics"
        ) ?? "Loading statistics…"}
      </div>`;
    }

    const hasData = this._chartData.some((series) => {
      if (!Array.isArray(series.data)) {
        return false;
      }
      return series.data.some((point: any) => {
        if (point === null || point === undefined) {
          return false;
        }
        if (Array.isArray(point)) {
          return point[1] !== null && point[1] !== undefined;
        }
        if (typeof point === "object" && Array.isArray(point.value)) {
          return point.value[1] !== null && point.value[1] !== undefined;
        }
        return false;
      });
    });

    if (!hasData || !this._chartOptions) {
      return html`<div class="placeholder">
        ${this.hass.localize?.(
          "ui.components.statistics_charts.no_statistics_found"
        ) ?? "No statistics available for the selected period"}
      </div>`;
    }

    return html`
      <div class="chart">
        <ha-chart-base
          .hass=${this.hass}
          .data=${this._chartData}
          .options=${this._chartOptions}
          .height=${this._config?.chart_height}
          .expandLegend=${this._config?.expand_legend}
        ></ha-chart-base>
      </div>
    `;
  }

  private _generateChart(): void {
    if (!this._config || !this._statistics || !this._periodStart) {
      this._chartData = [];
      this._chartOptions = undefined;
      this._unitsBySeries = new Map();
      return;
    }

    const computedStyle = this.isConnected
      ? getComputedStyle(this)
      : getComputedStyle(document.documentElement);

    const { series, legend, unitBySeries, seriesById } = buildSeries({
      hass: this.hass,
      statistics: this._statistics,
      metadata: this._metadata,
      configSeries: this._config.series,
      colorPalette: this._config.color_cycle ?? [],
      computedStyle,
      calculatedData: this._calculatedSeriesData,
      calculatedUnits: this._calculatedSeriesUnits,
    });

    this._applyBarStyling(series);

    if (!series.length) {
      this._chartData = [];
      this._chartOptions = undefined;
      this._unitsBySeries = new Map();
      return;
    }

    const { yAxis, axisUnitByIndex } = this._buildYAxisOptions(seriesById, series);

    this._unitsBySeries = new Map();
    series.forEach((item) => {
      const axisIndex = item.yAxisIndex ?? 0;
      const axisUnit =
        axisUnitByIndex.get(axisIndex) ??
        (this._config.show_unit === false ? undefined : unitBySeries.get(item.id ?? ""));
      this._unitsBySeries.set(item.id ?? "", axisUnit);
    });

    const legendOption = this._buildLegendOption(legend);

    const axisMax = this._periodEnd
      ? this._computeSuggestedXAxisMax(this._periodStart, this._periodEnd)
      : (this._periodEnd ?? new Date()).getTime();

    const xAxis = [
      {
        id: "primary",
        type: "time",
        min: this._periodStart,
        max: axisMax,
      },
      {
        id: "secondary",
        type: "time",
        show: false,
      },
    ];

    const tooltipFormatter = (params: unknown) => this._renderTooltip(params);

    const options: ECOption = {
      xAxis,
      yAxis,
      grid: {
        top: 15,
        left: 1,
        right: 1,
        bottom: 0,
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        appendTo: document.body,
        formatter: tooltipFormatter,
        axisPointer: {
          type: "cross",
        },
      },
    };

    if (legendOption) {
      options.legend = legendOption;
    }

    this._chartData = series;
    this._chartOptions = options;
  }

  private _computeSuggestedXAxisMax(start: Date, end: Date): number {
    const dayDifference = differenceInDays(end, start);
    let suggestedMax = new Date(end);

    if (dayDifference > 2 && suggestedMax.getHours() === 0) {
      suggestedMax = subHours(suggestedMax, 1);
    }

    suggestedMax.setMinutes(0, 0, 0);

    if (dayDifference > 35) {
      suggestedMax.setDate(1);
    }
    if (dayDifference > 2) {
      suggestedMax.setHours(0);
    }

    return suggestedMax.getTime();
  }

  private _applyBarStyling(series: SeriesOption[]): void {
    const barSeries = series.filter(
      (item): item is BarSeriesOption => item.type === "bar"
    );

    if (!barSeries.length) {
      return;
    }

    const bucketSet = new Set<number>();

    barSeries.forEach((serie) => {
      if (!Array.isArray(serie.data)) {
        return;
      }
      serie.data = serie.data.map((entry) => {
        if (Array.isArray(entry)) {
          bucketSet.add(Number(entry[0]));
          return { value: [entry[0], entry[1]] };
        }
        if (entry && typeof entry === "object" && "value" in entry) {
          const tuple = Array.isArray((entry as any).value)
            ? (entry as any).value
            : undefined;
          if (tuple) {
            bucketSet.add(Number(tuple[0]));
            return {
              ...(entry as Record<string, unknown>),
              value: [tuple[0], tuple[1]],
            };
          }
          return { ...(entry as Record<string, unknown>) };
        }
        return { value: [entry as number, 0] };
      });
    });

    const buckets = Array.from(bucketSet).sort((a, b) => a - b);

    barSeries.forEach((serie, serieIndex) => {
      const baseItemStyle = {
        ...(serie.itemStyle ?? {}),
      } as Record<string, any>;
      const dataMap = new Map<number, any>();
      (serie.data as any[] | undefined)?.forEach((item) => {
        const tuple = Array.isArray(item?.value) ? item.value : undefined;
        if (!tuple) {
          return;
        }
        dataMap.set(Number(tuple[0]), {
          ...item,
          value: [tuple[0], tuple[1]],
          itemStyle: {
            ...baseItemStyle,
            ...(item.itemStyle ?? {}),
          },
        });
      });

      serie.data = buckets.map((bucket) => {
        const existing = dataMap.get(bucket);
        if (existing) {
          return existing;
        }
        return {
          value: [bucket, 0],
          itemStyle: {
            ...baseItemStyle,
            borderWidth: 0,
            borderRadius: [0, 0, 0, 0],
          },
        };
      });

      // Ensure series color applies to default item style as well.
      serie.itemStyle = {
        ...baseItemStyle,
      };
      serie.barMaxWidth = serie.barMaxWidth ?? BAR_MAX_WIDTH;
    });

    buckets.forEach((_bucket, bucketIndex) => {
      const roundedPositive = new Set<string>();
      const roundedNegative = new Set<string>();

      for (let idx = barSeries.length - 1; idx >= 0; idx--) {
        const serie = barSeries[idx];
        const dataItem = (serie.data as any[])[bucketIndex];
        const tuple = Array.isArray(dataItem?.value)
          ? dataItem.value
          : undefined;
        const value = tuple ? Number(tuple[1] ?? 0) : 0;
        const stackKey = serie.stack ?? `__stack_${idx}`;

        const itemStyle = {
          ...(serie.itemStyle ?? {}),
          ...(dataItem?.itemStyle ?? {}),
        } as Record<string, any>;

        if (!tuple) {
          continue;
        }

        if (!Array.isArray(itemStyle.borderRadius)) {
          itemStyle.borderRadius = [0, 0, 0, 0];
        }

        if (!value) {
          itemStyle.borderWidth = 0;
          itemStyle.borderRadius = [0, 0, 0, 0];
          dataItem.itemStyle = itemStyle;
          continue;
        }

        if (value > 0) {
          if (!roundedPositive.has(stackKey)) {
            itemStyle.borderRadius = [4, 4, 0, 0];
            roundedPositive.add(stackKey);
          } else {
            itemStyle.borderRadius = [0, 0, 0, 0];
          }
        } else if (value < 0) {
          if (!roundedNegative.has(stackKey)) {
            itemStyle.borderRadius = [0, 0, 4, 4];
            roundedNegative.add(stackKey);
          } else {
            itemStyle.borderRadius = [0, 0, 0, 0];
          }
        }

        dataItem.itemStyle = itemStyle;
        (serie.data as any[])[bucketIndex] = dataItem;
      }
    });
  }

  private _buildLegendOption(
    entries: {
      id: string;
      name: string;
      color?: string;
      hidden?: boolean;
    }[]
  ): LegendOption | undefined {
    if (!entries.length) {
      return undefined;
    }

    const sort = this._config?.legend_sort ?? "none";
    const sortedEntries = [...entries];
    if (sort === "asc" || sort === "desc") {
      sortedEntries.sort((a, b) => {
        const compare = a.name.localeCompare(b.name);
        return sort === "asc" ? compare : -compare;
      });
    }

    const data = sortedEntries.map((entry) => ({
      id: entry.id,
      name: entry.name,
      itemStyle: entry.color ? { color: entry.color } : undefined,
    }));

    const selected: Record<string, boolean> = {};
    sortedEntries.forEach((entry) => {
      selected[entry.id] = entry.hidden ? false : true;
    });

    return {
      type: "custom",
      show: !this._config?.hide_legend,
      data,
      selected,
    };
  }

  private _buildYAxisOptions(
    seriesById: Map<string, EnergyCustomGraphSeriesConfig>,
    series: SeriesOption[]
  ): { yAxis: YAxisOption[]; axisUnitByIndex: Map<number, string | undefined> } {
    const axisConfigs = this._config?.y_axes ?? [];
    const leftConfig = axisConfigs.find((axis) => axis.id === "left");
    const rightConfig = axisConfigs.find((axis) => axis.id === "right");

    const usesRight =
      !!rightConfig ||
      Array.from(seriesById.values()).some((series) => series.y_axis === "right");

    const axisUnitByIndex = new Map<number, string | undefined>();
    const yAxis: YAxisOption[] = [];

    const getDataRange = (axisIndex: number): { min: number; max: number } | undefined => {
      const relevantSeries = series.filter(
        (s) => (s.yAxisIndex ?? 0) === axisIndex
      );

      if (!relevantSeries.length) {
        return undefined;
      }

      // Extract value from data point
      const extractValue = (point: any): number | null => {
        if (Array.isArray(point)) {
          return point[1];
        } else if (typeof point === "number") {
          return point;
        } else if (point && typeof point === "object" && "value" in point) {
          const val = point.value;
          if (Array.isArray(val)) {
            return val[1];
          } else if (typeof val === "number") {
            return val;
          }
        }
        return null;
      };

      // Extract timestamp from data point
      const extractTimestamp = (point: any): number | null => {
        if (Array.isArray(point)) {
          return point[0];
        } else if (point && typeof point === "object" && "value" in point) {
          const val = point.value;
          if (Array.isArray(val)) {
            return val[0];
          }
        }
        return null;
      };

      // Group series by stack
      const stackGroups = new Map<string, typeof relevantSeries>();
      const unstackedSeries: typeof relevantSeries = [];

      relevantSeries.forEach((s) => {
        const stackId = s.stack;
        if (stackId) {
          if (!stackGroups.has(stackId)) {
            stackGroups.set(stackId, []);
          }
          stackGroups.get(stackId)!.push(s);
        } else {
          unstackedSeries.push(s);
        }
      });

      let min = Infinity;
      let max = -Infinity;

      // Process unstacked series
      unstackedSeries.forEach((s) => {
        if (!Array.isArray(s.data)) {
          return;
        }
        s.data.forEach((point: any) => {
          const value = extractValue(point);
          if (typeof value === "number" && !Number.isNaN(value) && Number.isFinite(value)) {
            min = Math.min(min, value);
            max = Math.max(max, value);
          }
        });
      });

      // Process stacked series
      stackGroups.forEach((stackedSeries) => {
        // ECharts stacks positive and negative values separately
        // We need to track both stacks independently per timestamp
        const timestampMap = new Map<number, { positive: number; negative: number }>();

        stackedSeries.forEach((s) => {
          if (!Array.isArray(s.data)) {
            return;
          }
          s.data.forEach((point: any) => {
            const timestamp = extractTimestamp(point);
            const value = extractValue(point);
            if (
              timestamp !== null &&
              typeof value === "number" &&
              !Number.isNaN(value) &&
              Number.isFinite(value)
            ) {
              const current = timestampMap.get(timestamp) ?? { positive: 0, negative: 0 };
              if (value >= 0) {
                current.positive += value;
              } else {
                current.negative += value;
              }
              timestampMap.set(timestamp, current);
            }
          });
        });

        // Find min/max of stacked values (positive and negative stacks are separate)
        timestampMap.forEach(({ positive, negative }) => {
          min = Math.min(min, negative);
          max = Math.max(max, positive);
        });
      });

      if (!Number.isFinite(min) || !Number.isFinite(max)) {
        return undefined;
      }

      return { min, max };
    };

    const roundToNiceValue = (value: number): number => {
      if (value === 0) return 1;

      const niceNumbers = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
      const magnitude = Math.pow(10, Math.floor(Math.log10(Math.abs(value))));
      const normalized = Math.abs(value) / magnitude;

      // Find the smallest nice number that is >= normalized
      const nice = niceNumbers.find(n => n >= normalized) ?? 10;

      return nice * magnitude;
    };

    const createAxis = (
      axisConfig: EnergyCustomGraphAxisConfig | undefined,
      index: number
    ): YAxisOption => {
      const fit = axisConfig?.fit_y_data ?? false;
      const centerZero = axisConfig?.center_zero ?? false;
      const logarithmic = axisConfig?.logarithmic_scale ?? false;
      axisUnitByIndex.set(index, axisConfig?.unit);

      let minValue = axisConfig?.min;
      let maxValue = axisConfig?.max;

      if (centerZero) {
        // When center_zero is active, min is ignored
        if (maxValue !== undefined) {
          // Use explicit max for symmetric range
          minValue = -maxValue;
        } else {
          // Calculate symmetric range from data
          const range = getDataRange(index);
          if (range) {
            const maxAbsolute = Math.max(Math.abs(range.min), Math.abs(range.max));
            const rounded = roundToNiceValue(maxAbsolute);
            minValue = -rounded;
            maxValue = rounded;
          }
        }
      }

      return {
        type: logarithmic ? "log" : "value",
        name: axisConfig?.unit,
        nameGap: axisConfig?.unit ? 2 : 0,
        nameTextStyle: {
          align: "left",
        },
        position: index === 0 ? "left" : "right",
        min: minValue,
        max: maxValue,
        splitLine: {
          show: true,
        },
        axisLabel: {
          formatter: (value: number) => this._formatNumber(value),
        },
        scale: fit,
      };
    };

    yAxis.push(createAxis(leftConfig, 0));

    if (usesRight) {
      yAxis.push(createAxis(rightConfig, 1));
    }

    return { yAxis, axisUnitByIndex };
  }

  private _renderTooltip(params: unknown): string {
    if (!Array.isArray(params) || !params.length) {
      return "";
    }

    const items = params as Array<Record<string, any>>;

    const extractTuple = (param: Record<string, any>): [number, number | null] | undefined => {
      const value = param.value ?? param.data ?? param?.value?.value;
      if (Array.isArray(value)) {
        const x = value[0];
        const y = value[value.length - 1];
        return [x, typeof y === "number" ? y : null];
      }
      if (typeof value === "number") {
        return [param.axisValue ?? param.axisValueLabel ?? 0, value];
      }
      if (value && Array.isArray(value.value)) {
        const tuple = value.value as any[];
        const x = tuple[0];
        const y = tuple[tuple.length - 1];
        return [x, typeof y === "number" ? y : null];
      }
      return undefined;
    };

    const firstTuple = extractTuple(items[0]);
    const header = firstTuple
      ? `${this._formatDateTime(new Date(firstTuple[0]))}<br>`
      : "";

    const precision = this._config?.tooltip_precision ?? 2;
    const rendered = new Set<string>();

    const lines = items
      .map((item, index) => {
        const seriesKey = String(
          item.seriesId ?? item.seriesIndex ?? item.seriesName ?? index
        );
        if (rendered.has(seriesKey)) {
          return "";
        }
        rendered.add(seriesKey);

        const tuple = extractTuple(item);
        const value = tuple?.[1];
        if (value === null || value === undefined || Number.isNaN(value)) {
          return "";
        }
        const unit =
          this._config?.show_unit === false
            ? undefined
            : this._unitsBySeries.get(seriesKey);
        const formattedValue = this._formatNumber(value, {
          maximumFractionDigits: precision,
        });
        const unitLabel = unit ? ` ${unit}` : "";
        const marker =
          typeof item.marker === "string"
            ? item.marker
            : item.color
              ? `<span style="display:inline-block;margin-right:4px;border-radius:50%;width:8px;height:8px;background:${item.color}"></span>`
              : "";
        return `${marker} ${item.seriesName ?? ""}: ${formattedValue}${unitLabel}`;
      })
      .filter(Boolean);

    if (!lines.length) {
      return header || "";
    }

    return `${header}${lines.join("<br>")}`;
  }

  private _formatNumber(
    value: number,
    options?: Intl.NumberFormatOptions
  ): string {
    const locale = this.hass?.locale?.language ?? "en-US";
    const numberFormat = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 2,
      ...options,
    });
    return numberFormat.format(value);
  }

  private _formatDateTime(date: Date): string {
    const locale = this.hass?.locale?.language ?? "en-US";
    const localeInfo = this.hass?.locale as any;
    let timeZone: string | undefined = localeInfo?.time_zone;

    if (timeZone === "server") {
      timeZone = this.hass?.config?.time_zone;
    }
    if (!timeZone || timeZone === "local" || timeZone === "system") {
      timeZone = undefined;
    }

    try {
      return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone,
      }).format(date);
    } catch (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _error
    ) {
      return date.toLocaleString();
    }
  }

  static styles = css`
    ha-card {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .card-header {
      margin: 0;
      padding: 16px 16px 0px 16px;
    }

    .content {
      flex: 1;
      padding: 0px 16px 16px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-height: 0;
    }

    .chart {
      flex: 1;
      min-height: 0;
    }

    .placeholder {
      color: var(--secondary-text-color);
      font-style: italic;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
      padding: 16px 8px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "energy-custom-graph-card": EnergyCustomGraphCard;
  }
}

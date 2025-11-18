import { html, css, LitElement, nothing } from "lit";
import type { PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import type { HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";
import {
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addWeeks,
  addYears,
  differenceInDays,
  differenceInHours,
  differenceInMonths,
  differenceInYears,
  endOfDay,
  endOfHour,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfHour,
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
import {
  fetchRawHistoryStates,
  historyStatesToStatistics,
} from "./data/history";
import type { FetchRawHistoryOptions } from "./data/history";
import type {
  EnergyCustomGraphCardConfig,
  EnergyCustomGraphSeriesConfig,
  EnergyCustomGraphAxisConfig,
  EnergyCustomGraphStatisticType,
  EnergyCustomGraphCalculationConfig,
  EnergyCustomGraphCalculationTerm,
  EnergyCustomGraphTimespanConfig,
  EnergyCustomGraphChartType,
  EnergyCustomGraphAggregationTarget,
  EnergyCustomGraphRawOptions,
} from "./types";
import { buildSeries } from "./chart/series-builder";
import type {
  SeriesOption,
  ECOption,
  LegendOption,
  YAxisOption,
  BarSeriesOption,
  XAxisOption,
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

type FetchKey = "main" | "compare" | "main_live" | "compare_live";

interface FetchState {
  inFlight: boolean;
  queued: boolean;
  timeout?: number;
}

interface LovelaceGridOptions {
  columns?: number | "full";
  rows?: number | "auto";
  max_columns?: number;
  min_columns?: number;
  min_rows?: number;
  max_rows?: number;
  fixed_rows?: boolean;
  fixed_columns?: boolean;
}

const DEFAULT_TIMESPAN: EnergyCustomGraphTimespanConfig = { mode: "energy" };
const LOG_PREFIX = "[energy-custom-graph-card]";
const FETCH_TIMEOUT_MS = 60_000;
const VISIBILITY_REFRESH_DELAY_MS = 200;
const ACTIVE_LOG_LEVEL: "debug" | "info" | "warn" | "error" = "warn";
const RAW_DELTA_OVERLAP_MS = 60_000;
const DEFAULT_CHART_HEIGHT = "300px";

class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
  }
}

@customElement("energy-custom-graph-card")
export class EnergyCustomGraphCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config?: EnergyCustomGraphCardConfig;
  @state() private _statistics?: Statistics;
  @state() private _metadata?: Record<string, StatisticsMetaData>;
  @state() private _periodStart?: Date;
  @state() private _periodEnd?: Date;
  @state() private _comparePeriodStart?: Date;
  @state() private _comparePeriodEnd?: Date;
  @state() private _statisticsCompare?: Statistics;
  @state() private _metadataCompare?: Record<string, StatisticsMetaData>;
  @state() private _isLoading = false;
  @state() private _chartData: SeriesOption[] = [];
  @state() private _chartOptions?: ECOption;
  @state() private _disabledMessage?: string;
  @state() private _usesSectionLayout = false;

  private _energyCollection?: EnergyCollection;
  private _energyStart?: Date;
  private _energyEnd?: Date;
  private _energyCompareStart?: Date;
  private _energyCompareEnd?: Date;
  private _unitsBySeries: Map<string, string | null | undefined> = new Map();
  private _collectionUnsub?: () => void;
  private _collectionPollHandle?: number;
  private _autoRefreshTimeout?: number;
  private _liveHourTimeout?: number;
  private _loggedEnergyFallback = false;
  private _calculatedSeriesData = new Map<string, StatisticValue[]>();
  private _calculatedSeriesUnits = new Map<string, string | null | undefined>();
  private _calculatedSeriesDataCompare = new Map<string, StatisticValue[]>();
  private _calculatedSeriesUnitsCompare = new Map<string, string | null | undefined>();
  private _statisticsRange?: { start: number; end: number | null };
  private _statisticsPeriod?: StatisticsPeriod | "raw" | "disabled";
  private _statisticsRangeCompare?: { start: number; end: number | null };
  private _statisticsPeriodCompare?: StatisticsPeriod | "raw" | "disabled";
  private _lastRawEndMain?: number;
  private _lastRawEndCompare?: number;
  private _seriesConfigById: Map<string, EnergyCustomGraphSeriesConfig> = new Map();
  private _liveStatistics?: Statistics;
  private _liveStatisticsCompare?: Statistics;
  private _lastStatisticIds?: string[];
  private _lastStatisticIdsCompare?: string[];
  private _lastStatTypes?: EnergyCustomGraphStatisticType[];
  private _lastStatTypesCompare?: EnergyCustomGraphStatisticType[];
  private _lastRenderedRange?: { start: number; end: number | null };

  private _fetchStates: Map<FetchKey, FetchState> = new Map();
  private _activeFetchCounters: Record<FetchKey, number> = {
    main: 0,
    compare: 0,
    main_live: 0,
    compare_live: 0,
  };
  private _rawAnimationFrame?: number;
  private _isPageVisible =
    typeof document === "undefined"
      ? true
      : document.visibilityState !== "hidden";
  private _visibilityQueuedLoads: Set<FetchKey> = new Set();
  private _pendingVisibilityRefresh?: number;
  private _visibilityListenerAttached = false;
  private _handleVisibilityChange = () => {
    const visible =
      typeof document === "undefined"
        ? true
        : document.visibilityState !== "hidden";
    if (this._isPageVisible === visible) {
      return;
    }
    this._isPageVisible = visible;
    if (!visible) {
      this._log("info", "Document hidden; pausing scheduled refresh", {
        hidden: true,
      });
      this._pauseVisibilityTimers();
    } else {
      this._log("info", "Document visible; scheduling refresh", {
        hidden: false,
      });
      this._scheduleVisibilityResume();
    }
  };

  private static readonly FALLBACK_WARNING =
    "[energy-custom-graph-card] Falling back to default period because energy date selection is unavailable.";

  private static readonly DISABLED_FETCH_MESSAGE =
    "Fetching statistics is disabled for this period. Choose a shorter time range to view data.";

  private _getDisabledMessage(): string {
    const localized = this.hass?.localize?.(
      "ui.components.statistics_charts.choose_shorter_period"
    );
    if (localized && localized.trim().length > 0) {
      return localized;
    }
    return EnergyCustomGraphCard.DISABLED_FETCH_MESSAGE;
  }

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
    if (!this._visibilityListenerAttached && typeof document !== "undefined") {
      document.addEventListener("visibilitychange", this._handleVisibilityChange);
      this._visibilityListenerAttached = true;
      this._isPageVisible = document.visibilityState !== "hidden";
    }
    if (this.hass && this._config) {
      this._syncWithConfig();
    }
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._visibilityListenerAttached && typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this._handleVisibilityChange);
      this._visibilityListenerAttached = false;
    }
    if (this._pendingVisibilityRefresh) {
      clearTimeout(this._pendingVisibilityRefresh);
      this._pendingVisibilityRefresh = undefined;
    }
    this._teardownEnergyCollection();
    if (this._autoRefreshTimeout) {
      clearTimeout(this._autoRefreshTimeout);
      this._autoRefreshTimeout = undefined;
    }
    if (this._liveHourTimeout) {
      clearTimeout(this._liveHourTimeout);
      this._liveHourTimeout = undefined;
    }
    if (this._rawAnimationFrame !== undefined) {
      cancelAnimationFrame(this._rawAnimationFrame);
      this._rawAnimationFrame = undefined;
    }
    for (const state of this._fetchStates.values()) {
      if (state.timeout) {
        clearTimeout(state.timeout);
        state.timeout = undefined;
      }
      state.inFlight = false;
      state.queued = false;
    }
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    // Always update if config changed
    if (changedProps.has("_config")) {
      return true;
    }

    // If only hass changed, check if it's a meaningful change
    if (changedProps.has("hass") && changedProps.size === 1) {
      const oldHass = changedProps.get("hass") as HomeAssistant | undefined;
      if (!oldHass) {
        return true;
      }

      // Only update on meaningful hass changes, not state updates
      if (
        oldHass.connected !== this.hass?.connected ||
        oldHass.themes !== this.hass?.themes ||
        oldHass.locale !== this.hass?.locale ||
        oldHass.config.state !== this.hass?.config.state
      ) {
        return true;
      }

      // Ignore hass.states updates (sensor value changes)
      return false;
    }

    // Update for any other property changes
    return true;
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

    if (!this._shouldUseEnergyCompare()) {
      this._clearCompareTracking();
    }

    const periodChanged = this._recalculatePeriod();
    const compareChanged = this._recalculateComparePeriod();
    const seriesChanged =
      !!oldConfig &&
      JSON.stringify(oldConfig.series) !== JSON.stringify(this._config.series);

    if (periodChanged || seriesChanged || !this._statistics) {
      this._scheduleLoad("main");
    }
    if (
      this._comparePeriodStart &&
      (compareChanged || seriesChanged || !this._statisticsCompare)
    ) {
      this._scheduleLoad("compare");
    }
  }

  private _needsEnergyCollection(
    config?: EnergyCustomGraphCardConfig
  ): boolean {
    return config?.timespan?.mode === "energy";
  }

  private _shouldUseEnergyCompare(): boolean {
    if (!this._config) {
      return false;
    }
    if (this._config.timespan?.mode !== "energy") {
      return false;
    }
    return this._config.allow_compare !== false;
  }

  private _clearCompareTracking(): void {
    this._energyCompareStart = undefined;
    this._energyCompareEnd = undefined;
    if (this._comparePeriodStart || this._comparePeriodEnd || this._statisticsCompare) {
      this._comparePeriodStart = undefined;
      this._comparePeriodEnd = undefined;
      this._resetCompareStatistics();
    }
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
    const connection = this.hass.connection as unknown;
    const candidate =
      typeof connection === "object" && connection !== null
        ? ((connection as Record<string, unknown>)[key] as EnergyCollection | undefined)
        : undefined;

    if (candidate && typeof candidate.subscribe === "function") {
      if (this._collectionUnsub) {
        this._collectionUnsub();
        this._collectionUnsub = undefined;
      }
      this._energyCollection = candidate;
      this._loggedEnergyFallback = false;
      this._collectionUnsub = candidate.subscribe((data) => {
        const useCompare = this._shouldUseEnergyCompare();

        this._energyStart = data.start;
        this._energyEnd = data.end ?? undefined;

        if (useCompare) {
          this._energyCompareStart = data.startCompare ?? undefined;
          this._energyCompareEnd = data.endCompare ?? undefined;
        } else {
          const hadCompareState =
            this._comparePeriodStart !== undefined ||
            this._comparePeriodEnd !== undefined ||
            !!this._statisticsCompare;
          this._energyCompareStart = undefined;
          this._energyCompareEnd = undefined;
          if (hadCompareState) {
            this._clearCompareTracking();
          }
        }

        const periodChanged = this._recalculatePeriod();
        const compareChanged = useCompare
          ? this._recalculateComparePeriod()
          : false;
        const shouldLoadMain = periodChanged || !this._statistics;
        const hasCompareRange = useCompare && !!this._comparePeriodStart;
        const shouldLoadCompare =
          useCompare &&
          hasCompareRange &&
          (compareChanged || !this._statisticsCompare);
        if (shouldLoadMain) {
          this._scheduleLoad("main");
        }
        if (shouldLoadCompare) {
          this._scheduleLoad("compare");
        }
      });
      return;
    }

    const MAX_ATTEMPTS = 50;
    if (attempt >= MAX_ATTEMPTS) {
      if (!this._loggedEnergyFallback) {
        this._log("warn", EnergyCustomGraphCard.FALLBACK_WARNING, {
          hidden: !this._isPageVisible,
        });
        this._loggedEnergyFallback = true;
      }
      this._energyCollection = undefined;
      this._collectionUnsub = undefined;
      if (!this._shouldUseEnergyCompare()) {
        this._clearCompareTracking();
      }
      const periodChanged = this._recalculatePeriod();
      const compareChanged = this._shouldUseEnergyCompare()
        ? this._recalculateComparePeriod()
        : false;
      if (periodChanged || !this._statistics) {
        this._scheduleLoad("main");
      }
      if (
        this._shouldUseEnergyCompare() &&
        compareChanged &&
        this._comparePeriodStart
      ) {
        this._scheduleLoad("compare");
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
    this._energyCompareStart = undefined;
    this._energyCompareEnd = undefined;
    this._clearCompareTracking();
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
      this._lastRawEndMain = undefined;
    }
    return changed;
  }

  private _recalculateComparePeriod(): boolean {
    const resolved = this._resolveComparePeriod();
    const prevStart = this._comparePeriodStart?.getTime();
    const prevEnd = this._comparePeriodEnd?.getTime();

    if (!resolved) {
      if (this._comparePeriodStart || this._comparePeriodEnd) {
        this._comparePeriodStart = undefined;
        this._comparePeriodEnd = undefined;
        this._resetCompareStatistics();
        this._lastRawEndCompare = undefined;
        return true;
      }
      return false;
    }

    const { start, end } = resolved;
    const nextStart = start.getTime();
    const nextEnd = end?.getTime();
    const changed = prevStart !== nextStart || prevEnd !== nextEnd;

    if (changed) {
      this._comparePeriodStart = start;
      this._comparePeriodEnd = end;
      this._resetCompareStatistics();
      this._lastRawEndCompare = undefined;
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
        const offset = timespanConfig.offset ?? 0;
        switch (timespanConfig.period) {
          case "hour": {
            const base = this._defaultRelativeBase("hour");
            const start = addHours(base.start, offset);
            const end = base.end
              ? addHours(base.end, offset)
              : endOfHour(addHours(base.start, offset));
            return { start, end };
          }
          case "day": {
            const base = this._defaultRelativeBase("day");
            const start = addDays(base.start, offset);
            const end = base.end
              ? addDays(base.end, offset)
              : endOfDay(addDays(base.start, offset));
            return { start, end };
          }
          case "week": {
            const base = this._defaultRelativeBase("week");
            const start = addWeeks(base.start, offset);
            const end = base.end
              ? addWeeks(base.end, offset)
              : endOfWeek(addWeeks(base.start, offset));
            return { start, end };
          }
          case "month": {
            const base = this._defaultRelativeBase("month");
            const start = addMonths(base.start, offset);
            const end = base.end
              ? addMonths(base.end, offset)
              : endOfMonth(addMonths(base.start, offset));
            return { start, end };
          }
          case "last_7_days": {
            // Rolling 7-day window: end = now + offset days, start = end - 7 days
            // Rounded to :20 past the hour to prevent constant reloading
            const now = this._getRoundedNow("last_7_days");
            const end = addDays(now, offset);
            const start = subDays(end, 7);
            return { start, end };
          }
          case "last_60_minutes": {
            // Rolling 60-minute window: end = now + offset hours, start = end - 60 minutes
            const now = this._getRoundedNow("last_60_minutes");
            const end = addHours(now, offset);
            const start = addMinutes(end, -60);
            return { start, end };
          }
          case "last_24_hours": {
            // Rolling 24-hour window: end = now + offset days, start = end - 24 hours
            // Rounded to whole minutes so the window only shifts when the aligned time advances
            const now = this._getRoundedNow("last_24_hours");
            const end = addDays(now, offset);
            const start = subHours(end, 24);
            return { start, end };
          }
          case "last_30_days": {
            // Rolling 30-day window: end = now + offset days, start = end - 30 days
            // Rounded to :20 past the hour to prevent constant reloading
            const now = this._getRoundedNow("last_30_days");
            const end = addDays(now, offset);
            const start = subDays(end, 30);
            return { start, end };
          }
          case "last_12_months": {
            // Rolling 12-month window: end = now + offset months, start = end - 12 months
            // Rounded to midnight to prevent constant reloading
            const now = this._getRoundedNow("last_12_months");
            const end = addMonths(now, offset);
            const start = subMonths(end, 12);
            return { start, end };
          }
          case "year":
          default: {
            const base = this._defaultRelativeBase("year");
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

  private _resolveComparePeriod():
    | { start: Date; end?: Date }
    | undefined {
    if (!this._config) {
      return undefined;
    }
    const timespanConfig = this._config.timespan ?? DEFAULT_TIMESPAN;

    switch (timespanConfig.mode) {
      case "energy":
        if (!this._shouldUseEnergyCompare()) {
          return undefined;
        }
        if (!this._energyCompareStart) {
          return undefined;
        }
        return {
          start: this._energyCompareStart,
          end: this._energyCompareEnd,
        };
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

  private _getRoundedNow(period: string): Date {
    const now = new Date();

    switch (period) {
      case "last_60_minutes":
      case "last_hour":
      case "last_24_hours":
        // Short timespans: Round to full minutes
        // Updates every minute
        now.setSeconds(0, 0);
        return now;

      case "last_7_days":
      case "last_30_days":
        // Medium timespans: Round to 20 minutes past the hour
        // Updates hourly (like core energy cards)
        if (now.getMinutes() >= 20) {
          now.setHours(now.getHours() + 1);
        }
        now.setMinutes(20, 0, 0);
        return now;

      case "last_12_months":
      case "last_year":
        // Long timespans: Round to midnight
        // Updates daily
        now.setHours(0, 0, 0, 0);
        return now;

      default:
        return now;
    }
  }

  private _defaultRelativeBase(
    period: "hour" | "day" | "week" | "month" | "year"
  ): { start: Date; end: Date } {
    const now = new Date();
    switch (period) {
      case "hour":
        return {
          start: startOfHour(now),
          end: endOfHour(now),
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

  private _getFetchState(key: FetchKey): FetchState {
    let state = this._fetchStates.get(key);
    if (!state) {
      state = { inFlight: false, queued: false };
      this._fetchStates.set(key, state);
    }
    return state;
  }

  private async _withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    context: string,
    details?: Record<string, unknown>
  ): Promise<T> {
    let timeoutHandle: number | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = window.setTimeout(() => {
        reject(new TimeoutError(`${context} timed out after ${timeoutMs} ms`));
      }, timeoutMs);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } catch (error) {
      const info = {
        ...(details ?? {}),
        context,
        timeoutMs,
      };
      if (error instanceof TimeoutError) {
        this._log("error", error.message, info);
      } else {
        this._log("error", `Request failed in ${context}`, info);
      }
      throw error;
    } finally {
      if (timeoutHandle !== undefined) {
        clearTimeout(timeoutHandle);
      }
    }
  }

  private _scheduleLoad(key: FetchKey = "main"): void {
    const state = this._getFetchState(key);

    if (!this._isPageVisible) {
      state.queued = true;
      if (state.timeout) {
        clearTimeout(state.timeout);
        state.timeout = undefined;
      }
      this._visibilityQueuedLoads.add(key);
      this._log("debug", "Deferring load while page is hidden", {
        key,
      });
      return;
    }

    if (state.inFlight) {
      state.queued = true;
      if (state.timeout) {
        clearTimeout(state.timeout);
        state.timeout = undefined;
      }
      return;
    }

    if (state.timeout) {
      clearTimeout(state.timeout);
    }
    state.timeout = window.setTimeout(() => {
      state.timeout = undefined;
      if (!this._isPageVisible) {
        state.queued = true;
        this._visibilityQueuedLoads.add(key);
        this._log("debug", "Cancelled load execution because page is hidden", {
          key,
        });
        return;
      }
      void this._loadStatistics(key);
    }, 500);
  }

  private _scheduleLiveHourLoad(target: "main" | "compare"): void {
    const key: FetchKey = target === "compare" ? "compare_live" : "main_live";
    const state = this._getFetchState(key);

    if (!this._isPageVisible) {
      state.queued = true;
      if (state.timeout) {
        clearTimeout(state.timeout);
        state.timeout = undefined;
      }
      this._visibilityQueuedLoads.add(key);
      this._log("debug", "Deferring live-hour load while page is hidden", {
        key,
      });
      return;
    }

    if (state.inFlight) {
      state.queued = true;
      return;
    }

    if (state.timeout) {
      clearTimeout(state.timeout);
    }
    state.timeout = window.setTimeout(() => {
      state.timeout = undefined;
      if (!this._isPageVisible) {
        state.queued = true;
        this._visibilityQueuedLoads.add(key);
        this._log("debug", "Cancelled live-hour execution because page is hidden", {
          key,
        });
        return;
      }
      void this._loadLiveHourPatch(target);
    }, 250);
  }

  private _pauseVisibilityTimers(): void {
    if (this._autoRefreshTimeout) {
      clearTimeout(this._autoRefreshTimeout);
      this._autoRefreshTimeout = undefined;
    }
    if (this._liveHourTimeout) {
      clearTimeout(this._liveHourTimeout);
      this._liveHourTimeout = undefined;
    }
    for (const state of this._fetchStates.values()) {
      if (state.timeout) {
        clearTimeout(state.timeout);
        state.timeout = undefined;
      }
    }
  }

  private _scheduleVisibilityResume(): void {
    if (this._pendingVisibilityRefresh) {
      return;
    }
    this._pendingVisibilityRefresh = window.setTimeout(() => {
      this._pendingVisibilityRefresh = undefined;
      if (!this._isPageVisible) {
        return;
      }
      const queued = Array.from(this._visibilityQueuedLoads);
      this._visibilityQueuedLoads.clear();
      this._log("debug", "Resuming after visibility change", {
        queued: queued.join(",") || undefined,
      });
      if (!queued.length) {
        queued.push("main");
        if (this._shouldUseEnergyCompare() && this._comparePeriodStart) {
          queued.push("compare");
        }
      }
      queued.forEach((key) => {
        if (key === "main_live") {
          this._scheduleLiveHourLoad("main");
        } else if (key === "compare_live") {
          this._scheduleLiveHourLoad("compare");
        } else {
          this._scheduleLoad(key);
        }
      });
      if (!queued.includes("main")) {
        this._scheduleLoad("main");
      }
      if (
        this._shouldUseEnergyCompare() &&
        this._comparePeriodStart &&
        !queued.includes("compare")
      ) {
        this._scheduleLoad("compare");
      }
      this._scheduleAutoRefresh();
    }, VISIBILITY_REFRESH_DELAY_MS);
  }

  private async _loadLiveHourPatch(target: "main" | "compare"): Promise<void> {
    if (!this.hass) {
      return;
    }

    if (!this._isPageVisible) {
      this._log("debug", "Aborting live-hour load while hidden", {
        target,
      });
      return;
    }

    const key: FetchKey = target === "compare" ? "compare_live" : "main_live";
    const state = this._getFetchState(key);
    if (state.inFlight) {
      return;
    }

    if (!this._shouldComputeCurrentHour(target)) {
      if (target === "compare") {
        this._liveStatisticsCompare = undefined;
      } else {
        this._liveStatistics = undefined;
        if (this._liveHourTimeout) {
          clearTimeout(this._liveHourTimeout);
          this._liveHourTimeout = undefined;
        }
      }
      return;
    }

    const statisticIds =
      target === "compare" ? this._lastStatisticIdsCompare : this._lastStatisticIds;
    const statTypes =
      target === "compare" ? this._lastStatTypesCompare : this._lastStatTypes;
    if (!statisticIds || !statisticIds.length) {
      return;
    }

    const liveContext = this._computeLiveHourContext(target);
    if (!liveContext) {
      return;
    }

    const requestId = `${key}-${Date.now()}`;
    const requestStarted = performance.now();

    state.inFlight = true;
    state.queued = false;

    const { fetchStart, fetchEnd, currentHourStart } = liveContext;
    const requestContext: Record<string, unknown> = {
      key,
      target,
      hidden: !this._isPageVisible,
      requestId,
      fetchStart: new Date(fetchStart).toISOString(),
      fetchEnd: new Date(fetchEnd).toISOString(),
      stats: statisticIds.length,
    };
    this._log("debug", "Loading live-hour statistics", requestContext);

    try {
      const fetched = await this._withTimeout(
        fetchStatistics(
          this.hass,
          new Date(fetchStart),
          new Date(fetchEnd),
          statisticIds,
          "5minute",
          undefined,
          statTypes
        ),
        FETCH_TIMEOUT_MS,
        "fetchStatistics:liveHour",
        requestContext
      );
      const patch = this._buildLiveHourPatch(target, fetched, liveContext, statisticIds);
      this._applyLiveHourPatch(target, patch);
    } catch (error) {
      this._log("error", "Failed to load live-hour statistics", {
        ...requestContext,
        error: error instanceof Error ? error.message : error,
      });
    } finally {
      state.inFlight = false;
      if (state.queued) {
        state.queued = false;
        this._scheduleLiveHourLoad(target);
      }
      if (target === "main" && this._shouldComputeCurrentHour("main")) {
        this._scheduleNextLiveHourTick();
      }
      const durationMs = Math.round(performance.now() - requestStarted);
      this._log("debug", "Live-hour request completed", {
        ...requestContext,
        durationMs,
      });
    }
  }

  private _computeLiveHourContext(
    target: "main" | "compare"
  ):
    | {
        fetchStart: number;
        fetchEnd: number;
        currentHourStart: number;
        previousHourStart: number;
        periodStartMs?: number;
        periodEndMs?: number;
        nowMs: number;
      }
    | undefined {
    const periodStart =
      target === "compare" ? this._comparePeriodStart : this._periodStart;
    const periodEnd = target === "compare" ? this._comparePeriodEnd : this._periodEnd;

    const now = new Date();
    const nowMs = now.getTime();
    const currentHourStart = startOfHour(now).getTime();
    const previousHourStart = subHours(new Date(currentHourStart), 1).getTime();

    const periodStartMs = periodStart?.getTime();
    const periodEndMs = periodEnd?.getTime();

    const fetchStart = Math.max(
      previousHourStart,
      periodStartMs !== undefined ? periodStartMs : previousHourStart
    );
    const fetchEnd = nowMs;

    if (fetchEnd <= fetchStart) {
      return undefined;
    }

    return {
      fetchStart,
      fetchEnd,
      currentHourStart,
      previousHourStart,
      periodStartMs,
      periodEndMs,
      nowMs,
    };
  }

  private _buildLiveHourPatch(
    target: "main" | "compare",
    fiveMinuteStats: Statistics,
    context: {
      fetchStart: number;
      fetchEnd: number;
      currentHourStart: number;
      previousHourStart: number;
      periodStartMs?: number;
      periodEndMs?: number;
      nowMs: number;
    },
    statisticIds: string[]
  ): Statistics | undefined {
    const baseStatistics =
      target === "compare" ? this._statisticsCompare : this._statistics;
    if (!baseStatistics) {
      return undefined;
    }

    const periodStartMs = context.periodStartMs;
    const periodEndMs = context.periodEndMs;
    const nowMs = context.nowMs;
    const currentHourStart = context.currentHourStart;

    const patch: Statistics = {};
    let hasValues = false;

    const hoursToEvaluate: number[] = [];
    const currentIncluded = this._hourInDisplay(
      currentHourStart,
      periodStartMs,
      periodEndMs
    );
    if (currentIncluded) {
      hoursToEvaluate.push(currentHourStart);
    }

    const previousHourStart = context.previousHourStart;
    if (
      previousHourStart >= context.fetchStart &&
      this._hourInDisplay(previousHourStart, periodStartMs, periodEndMs)
    ) {
      hoursToEvaluate.push(previousHourStart);
    }

    if (!hoursToEvaluate.length) {
      return undefined;
    }

    for (const statisticId of statisticIds) {
      const entries = fiveMinuteStats[statisticId] ?? [];
      const baseEntries = baseStatistics[statisticId] ?? [];
      const perIdPatch: StatisticValue[] = [];

      for (const hourStart of hoursToEvaluate) {
        const hourEndLimit = Math.min(
          hourStart + 60 * 60 * 1000,
          periodEndMs ?? hourStart + 60 * 60 * 1000,
          nowMs
        );

        const existing = baseEntries.find(
          (entry) =>
            typeof entry.start === "number" &&
            Math.abs(entry.start - hourStart) < 30 * 1000
        );

        if (hourStart === currentHourStart) {
          const hasCompleteCurrent =
            existing &&
            typeof existing.end === "number" &&
            existing.end >= hourStart + 59 * 60 * 1000;
          if (hasCompleteCurrent) {
            continue;
          }
        } else if (existing) {
          // Previous hour already available; no patch needed.
          continue;
        }

        const aggregated = this._aggregateFiveMinuteEntries(
          entries,
          hourStart,
          hourEndLimit
        );
        if (aggregated) {
          perIdPatch.push(aggregated);
        }
      }

      if (perIdPatch.length) {
        perIdPatch.sort((a, b) => (a.start ?? 0) - (b.start ?? 0));
        patch[statisticId] = perIdPatch;
        hasValues = true;
      }
    }

    return hasValues ? patch : undefined;
  }

  private _applyLiveHourPatch(target: "main" | "compare", patch?: Statistics): void {
    if (!patch || !Object.keys(patch).length) {
      if (target === "compare") {
        this._liveStatisticsCompare = undefined;
      } else {
        this._liveStatistics = undefined;
      }
      return;
    }

    const baseStatistics =
      target === "compare" ? this._statisticsCompare : this._statistics;
    if (!baseStatistics) {
      return;
    }

    const updated: Statistics = { ...baseStatistics };
    for (const [statisticId, patchValues] of Object.entries(patch)) {
      if (!patchValues || !patchValues.length) {
        continue;
      }
      const patchStarts = new Set(
        patchValues
          .map((item) => (typeof item.start === "number" ? item.start : undefined))
          .filter((item): item is number => item !== undefined)
      );
      const existing = updated[statisticId] ?? [];
      const filteredExisting = existing.filter((entry) => {
        if (typeof entry.start !== "number") {
          return true;
        }
        return !patchStarts.has(entry.start);
      });
      updated[statisticId] = [...filteredExisting, ...patchValues].sort(
        (a, b) => (a.start ?? 0) - (b.start ?? 0)
      );
    }

    if (target === "compare") {
      this._liveStatisticsCompare = patch;
      this._statisticsCompare = updated;
      if (this._metadataCompare) {
        this._rebuildCalculatedSeries(updated, this._metadataCompare, "compare");
      } else {
        this._rebuildCalculatedSeries(updated, {}, "compare");
      }
    } else {
      this._liveStatistics = patch;
      this._statistics = updated;
      if (this._metadata) {
        this._rebuildCalculatedSeries(updated, this._metadata, "main");
      } else {
        this._rebuildCalculatedSeries(updated, {}, "main");
      }
    }
  }

  private _aggregateFiveMinuteEntries(
    entries: StatisticValue[],
    hourStart: number,
    hourEnd: number
  ): StatisticValue | undefined {
    const relevant = entries.filter(
      (entry) =>
        typeof entry.start === "number" &&
        entry.start >= hourStart &&
        entry.start < hourEnd
    );

    if (!relevant.length) {
      return undefined;
    }

    let changeTotal = 0;
    let sumTotal = 0;
    let hasChange = false;
    let hasSum = false;
    let meanWeighted = 0;
    let meanWeight = 0;
    let minValue: number | null = null;
    let maxValue: number | null = null;
    let lastState: number | null = null;

    for (const entry of relevant) {
      const entryStart = typeof entry.start === "number" ? entry.start : hourStart;
      const entryEnd =
        typeof entry.end === "number"
          ? entry.end
          : entryStart + 5 * 60 * 1000;
      const duration = Math.max(0, entryEnd - entryStart);

      if (typeof entry.change === "number" && Number.isFinite(entry.change)) {
        changeTotal += entry.change;
        hasChange = true;
      }
      if (typeof entry.sum === "number" && Number.isFinite(entry.sum)) {
        sumTotal += entry.sum;
        hasSum = true;
      }
      if (typeof entry.min === "number" && Number.isFinite(entry.min)) {
        minValue = minValue === null ? entry.min : Math.min(minValue, entry.min);
      }
      if (typeof entry.max === "number" && Number.isFinite(entry.max)) {
        maxValue = maxValue === null ? entry.max : Math.max(maxValue, entry.max);
      }

      const meanCandidate =
        typeof entry.mean === "number" && Number.isFinite(entry.mean)
          ? entry.mean
          : typeof entry.state === "number" && Number.isFinite(entry.state)
            ? entry.state
            : undefined;
      if (meanCandidate !== undefined && duration > 0) {
        meanWeighted += meanCandidate * duration;
        meanWeight += duration;
      }

      if (typeof entry.state === "number" && Number.isFinite(entry.state)) {
        lastState = entry.state;
      }
    }

    const aggregated: StatisticValue = {
      start: hourStart,
      end: hourEnd,
    } as StatisticValue;

    if (hasChange) {
      aggregated.change = changeTotal;
    }
    if (hasSum) {
      aggregated.sum = sumTotal;
    }
    if (minValue !== null) {
      aggregated.min = minValue;
    }
    if (maxValue !== null) {
      aggregated.max = maxValue;
    }
    if (meanWeight > 0) {
      aggregated.mean = meanWeighted / meanWeight;
    } else if (lastState !== null) {
      aggregated.mean = lastState;
    }
    if (lastState !== null) {
      aggregated.state = lastState;
    }

    return aggregated;
  }

  private _hourInDisplay(
    hourStart: number,
    periodStartMs?: number,
    periodEndMs?: number
  ): boolean {
    const hourEnd = hourStart + 60 * 60 * 1000;
    if (periodEndMs !== undefined && periodEndMs <= hourStart) {
      return false;
    }
    if (periodStartMs !== undefined && periodStartMs >= hourEnd) {
      return false;
    }
    return true;
  }

  private _scheduleNextLiveHourTick(): void {
    if (this._liveHourTimeout) {
      clearTimeout(this._liveHourTimeout);
      this._liveHourTimeout = undefined;
    }
    if (!this._shouldComputeCurrentHour("main")) {
      return;
    }
    const nextRefreshTime = this._getNextAlignedRefreshTime("5minute");
    const delay = Math.max(nextRefreshTime - Date.now(), 30 * 1000);
    this._liveHourTimeout = window.setTimeout(() => {
      this._liveHourTimeout = undefined;
      this._scheduleLiveHourLoad("main");
    }, delay);
  }

  private _getRefreshTiming(
    aggregation: StatisticsPeriod | "raw" | "disabled"
  ): {
    intervalMs: number;
    delayMs: number;
  } {
    if (aggregation === "disabled") {
      return {
        intervalMs: Number.POSITIVE_INFINITY,
        delayMs: 0,
      };
    }
    if (aggregation === "raw") {
      const rawInterval = this._config?.aggregation?.raw_refresh_interval_seconds;
      const intervalMs = Math.max(5, rawInterval ?? 60) * 1000;
      return {
        intervalMs,
        delayMs: 0,
      };
    }
    switch (aggregation) {
      case "5minute":
        return {
          intervalMs: 5 * 60 * 1000,      // Every 5 minutes
          delayMs: 2 * 60 * 1000          // +2 min buffer (refreshes at :02, :07, :12, ...)
        };
      case "hour":
        return {
          intervalMs: 60 * 60 * 1000,     // Hourly
          delayMs: 20 * 60 * 1000         // +20 min buffer (refreshes at :20, like HA Core!)
        };
      case "day":
        return {
          intervalMs: 24 * 60 * 60 * 1000, // Daily
          delayMs: 30 * 60 * 1000          // +30 min buffer (refreshes at 00:30)
        };
      case "week":
      case "month":
        return {
          intervalMs: 7 * 24 * 60 * 60 * 1000, // Weekly
          delayMs: 60 * 60 * 1000              // +1 hour buffer
        };
      default:
        return {
          intervalMs: 60 * 60 * 1000,
          delayMs: 20 * 60 * 1000
        };
    }
  }

  private _getNextAlignedRefreshTime(
    aggregation: StatisticsPeriod | "raw" | "disabled"
  ): number {
    if (aggregation === "disabled") {
      return Number.POSITIVE_INFINITY;
    }
    const now = new Date();
    const timing = this._getRefreshTiming(aggregation);
    let nextRefresh = new Date(now);

    if (aggregation === "raw") {
      nextRefresh = new Date(now.getTime() + timing.intervalMs);
      return nextRefresh.getTime();
    }

    switch (aggregation) {
      case "5minute": {
        // Next 5-minute mark + 2 min delay
        // If now is 10:03, next is 10:07 (10:05 + 2 min)
        // If now is 10:07, next is 10:12 (10:10 + 2 min)
        const minutes = now.getMinutes();
        const nextFiveMin = Math.ceil((minutes + 1) / 5) * 5;
        nextRefresh.setMinutes(nextFiveMin, 0, 0);
        if (nextRefresh <= now) {
          nextRefresh.setMinutes(nextRefresh.getMinutes() + 5);
        }
        nextRefresh.setMinutes(nextRefresh.getMinutes() + 2); // Add 2 min delay
        break;
      }
      case "hour": {
        // Next hour + 20 min
        nextRefresh.setHours(nextRefresh.getHours() + 1, 20, 0, 0);
        if (nextRefresh <= now) {
          nextRefresh.setHours(nextRefresh.getHours() + 1);
        }
        break;
      }
      case "day": {
        // Next day at 00:30
        nextRefresh.setDate(nextRefresh.getDate() + 1);
        nextRefresh.setHours(0, 30, 0, 0);
        if (nextRefresh <= now) {
          nextRefresh.setDate(nextRefresh.getDate() + 1);
        }
        break;
      }
      case "week":
      case "month": {
        // Next week at same time + 1 hour
        nextRefresh = new Date(now.getTime() + timing.intervalMs + timing.delayMs);
        break;
      }
      default:
        nextRefresh = new Date(now.getTime() + timing.intervalMs + timing.delayMs);
    }

    return nextRefresh.getTime();
  }

  private _scheduleAutoRefresh(): void {
    // Clear any existing timer
    if (this._autoRefreshTimeout) {
      clearTimeout(this._autoRefreshTimeout);
      this._autoRefreshTimeout = undefined;
    }

    if (!this._isPageVisible) {
      this._log("debug", "Skipping auto-refresh scheduling while hidden", {
        hidden: true,
      });
      return;
    }

    const timespanConfig = this._config?.timespan;
    if (!timespanConfig) {
      return;
    }

    // For energy mode, skip only when we rely on energy collection stats.
    // If aggregation resolves to raw, we still want our own refresh.
    if (timespanConfig.mode === "energy") {
      // We'll decide below based on resolved aggregation; keep going.
    }

    // For fixed timespan: only refresh if end is in the future
    if (timespanConfig.mode === "fixed") {
      const endDate = timespanConfig.end ? new Date(timespanConfig.end) : null;
      if (!endDate || endDate <= new Date()) {
        return; // Historical data doesn't change
      }
    }

    // Determine aggregation period to decide refresh frequency
    if (!this._periodStart) {
      return;
    }

    const aggregationPlan = this._resolveAggregationPlan(
      this._periodStart,
      this._periodEnd
    );
    const aggregation = aggregationPlan[0];

    if (!aggregation || aggregation === "disabled") {
      return;
    }

    // Calculate next aligned refresh time with buffer delay
    const nextRefreshTime = this._getNextAlignedRefreshTime(aggregation);
    const now = Date.now();
    const msUntilRefresh = nextRefreshTime - now;
    this._log("debug", "Auto-refresh scheduled", {
      aggregation,
      nextRefreshIso: new Date(nextRefreshTime).toISOString(),
      msUntilRefresh,
      mode: this._config?.timespan?.mode,
    });

    if (msUntilRefresh <= 0) {
      // Should not happen, but schedule for 1 minute from now as fallback
      this._log(
        "warn",
        "Calculated refresh time is in the past, using 1 minute fallback",
        {
          hidden: !this._isPageVisible,
        }
      );
      this._autoRefreshTimeout = window.setTimeout(() => {
        this._scheduleAutoRefresh();
      }, 60000);
      return;
    }

    this._autoRefreshTimeout = window.setTimeout(() => {
      this._autoRefreshTimeout = undefined;
      if (!this._isPageVisible) {
        this._log("debug", "Auto-refresh timer fired while hidden", {
          hidden: true,
        });
        return;
      }

      this._log("debug", "Auto-refresh executing", {
        aggregation,
      });

      const periodChanged = this._recalculatePeriod();
      const compareChanged = this._recalculateComparePeriod();
      const currentTimespanConfig = this._config?.timespan;

      // Rolling windows: Only refresh if rounded time changed
      const isRollingWindow = currentTimespanConfig?.mode === "relative" &&
                              currentTimespanConfig.period?.startsWith("last_");

      const primaryAggregation = aggregation;
      const shouldRefresh =
        primaryAggregation === "raw"
          ? true // always reload raw to pick up new samples
          : isRollingWindow
            ? periodChanged
            : true;

      if (shouldRefresh) {
        this._scheduleLoad("main");
        const hasCompare = !!this._comparePeriodStart;
        if (hasCompare && (compareChanged || shouldRefresh)) {
          this._scheduleLoad("compare");
        }
      }

      // Schedule next refresh
      this._scheduleAutoRefresh();
    }, msUntilRefresh);
  }

  private async _loadStatistics(key: FetchKey = "main"): Promise<void> {
    if (!this._config || !this.hass) {
      return;
    }

    const state = this._getFetchState(key);
    if (state.inFlight) {
      state.queued = true;
      return;
    }

    const isCompare = key === "compare";
    const requestId = `${key}-${Date.now()}`;
    const requestStarted = performance.now();
    const requestDetails: Record<string, unknown> = {
      key,
      compare: isCompare,
      hidden: !this._isPageVisible,
    };
    requestDetails.requestId = requestId;

    const periodStart = isCompare ? this._comparePeriodStart : this._periodStart;
    const periodEnd = isCompare ? this._comparePeriodEnd : this._periodEnd;

    if (!periodStart) {
      this._log("debug", "Skipping statistics load; no period defined", {
        ...requestDetails,
      });
      if (isCompare) {
        this._resetCompareStatistics();
      }
      return;
    }

    if (!this._isPageVisible) {
      this._log("debug", "Aborting statistics load while hidden", {
        ...requestDetails,
      });
      return;
    }

    state.inFlight = true;
    state.queued = false;

    const requestedStart = periodStart.getTime();
    const requestedEnd = periodEnd?.getTime() ?? null;
    requestDetails.start = new Date(requestedStart).toISOString();
    requestDetails.end =
      requestedEnd !== null ? new Date(requestedEnd).toISOString() : null;

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
    const allowedStatTypes: EnergyCustomGraphStatisticType[] = [
      "change",
      "sum",
      "mean",
      "min",
      "max",
      "state",
    ];
    let statTypes: EnergyCustomGraphStatisticType[] | undefined;
    if (statTypesRaw.length) {
      const filtered = statTypesRaw.filter(
        (type): type is EnergyCustomGraphStatisticType =>
          allowedStatTypes.includes(type)
      );
      statTypes = filtered.length ? filtered : undefined;
    }
    if (!statTypes) {
      statTypes = [EnergyCustomGraphCard.DEFAULT_STAT_TYPE];
    }
    requestDetails.statistics = statisticIds.length;

    if (isCompare) {
      this._lastStatisticIdsCompare = statisticIds;
      this._lastStatTypesCompare = statTypes;
    } else {
      this._lastStatisticIds = statisticIds;
      this._lastStatTypes = statTypes;
    }

    const aggregationPlan = this._resolveAggregationPlan(
      periodStart,
      periodEnd
    );

    const primaryAggregation = aggregationPlan[0];
    requestDetails.aggregationPlan = aggregationPlan.join(" -> ");
    this._log("info", "Loading statistics", requestDetails);

    if (primaryAggregation === "disabled") {
      state.inFlight = false;
      state.queued = false;

      const range = {
        start: requestedStart,
        end: requestedEnd,
      };

      this._isLoading = false;
      this._log("info", "Aggregation disabled; skipping data load", {
        ...requestDetails,
      });

      if (isCompare) {
        this._liveStatisticsCompare = undefined;
        this._statisticsRangeCompare = range;
        this._statisticsPeriodCompare = "disabled";
        this._metadataCompare = undefined;
        this._statisticsCompare = undefined;
        this._calculatedSeriesDataCompare = new Map();
        this._calculatedSeriesUnitsCompare = new Map();
      } else {
        this._liveStatistics = undefined;
        this._statisticsRange = range;
        this._statisticsPeriod = "disabled";
        this._metadata = undefined;
        this._statistics = undefined;
        this._calculatedSeriesData = new Map();
        this._calculatedSeriesUnits = new Map();
        this._chartData = [];
        this._chartOptions = undefined;
        this._unitsBySeries = new Map();
        this._disabledMessage = this._getDisabledMessage();
        if (this._autoRefreshTimeout) {
          clearTimeout(this._autoRefreshTimeout);
          this._autoRefreshTimeout = undefined;
        }
        if (this._liveHourTimeout) {
          clearTimeout(this._liveHourTimeout);
          this._liveHourTimeout = undefined;
        }
      }

      return;
    }

    if (!isCompare) {
      this._disabledMessage = undefined;
    }

    const fetchId = ++this._activeFetchCounters[key];
    const loadingAtStart = !isCompare && !this._statistics;
    if (loadingAtStart) {
      this._isLoading = true;
    }

    let lastError: unknown;

    try {
      const metadata: Record<string, StatisticsMetaData> = {};

      if (statisticIds.length) {
        try {
          const metadataArray = await this._withTimeout(
            getStatisticMetadata(this.hass, statisticIds),
            FETCH_TIMEOUT_MS,
            "getStatisticMetadata",
            {
              ...requestDetails,
              stats: statisticIds.length,
            }
          );
          metadataArray.forEach((item) => {
            metadata[item.statistic_id] = item;
          });
        } catch (error) {
          if (!(error instanceof TimeoutError)) {
            this._log("error", "Failed to load statistics metadata", {
              ...requestDetails,
              error: error instanceof Error ? error.message : error,
            });
          }
        }
      }

      let statistics: Statistics = {};
      let selectedAggregation: EnergyCustomGraphAggregationTarget | undefined;
      let lastTriedAggregation: EnergyCustomGraphAggregationTarget | undefined;

      if (statisticIds.length) {
        for (let idx = 0; idx < aggregationPlan.length; idx++) {
          const aggregation = aggregationPlan[idx];
          lastTriedAggregation = aggregation;
          if (aggregation === "disabled") {
            selectedAggregation = aggregation;
            break;
          }
          try {
            if (aggregation === "raw") {
              const lastEnd = isCompare
                ? this._lastRawEndCompare
                : this._lastRawEndMain;
              const incrementalFrom =
                lastEnd !== undefined ? lastEnd - RAW_DELTA_OVERLAP_MS : undefined;

              const requestedEndMs = requestedEnd ?? null;
              const safeIncrementalFrom =
                incrementalFrom !== undefined && requestedEndMs !== null && incrementalFrom >= requestedEndMs
                  ? undefined
                  : incrementalFrom;

              const fetched = await this._fetchRawStatistics(
                periodStart,
                periodEnd,
                statisticIds,
                requestDetails,
                safeIncrementalFrom
              );
              statistics = fetched;
              if (this._statisticsHaveData(fetched, statisticIds)) {
                lastError = undefined;
                if (idx > 0) {
                  this._log(
                    "warn",
                    `Aggregation "${aggregationPlan[0]}" returned no data. Using fallback "raw".`,
                    {
                      ...requestDetails,
                      aggregation,
                    }
                  );
                }
                selectedAggregation = aggregation;
                break;
              }
              if (idx < aggregationPlan.length - 1) {
                this._log(
                  "warn",
                  `Aggregation "raw" returned no data. Trying fallback "${aggregationPlan[idx + 1]}".`,
                  {
                    ...requestDetails,
                    aggregation,
                  }
                );
              }
            } else {
              const fetched = await this._withTimeout(
                fetchStatistics(
                  this.hass,
                  periodStart,
                  periodEnd,
                  statisticIds,
                  aggregation,
                  undefined,
                  statTypes
                ),
                FETCH_TIMEOUT_MS,
                `fetchStatistics:${aggregation}`,
                {
                  ...requestDetails,
                  aggregation,
                  stats: statisticIds.length,
                }
              );
              statistics = fetched;
              if (this._statisticsHaveData(fetched, statisticIds)) {
                lastError = undefined;
                if (idx > 0) {
                  this._log(
                    "warn",
                    `Aggregation "${aggregationPlan[0]}" returned no data. Using fallback "${aggregation}".`,
                    {
                      ...requestDetails,
                      aggregation,
                    }
                  );
                }
                selectedAggregation = aggregation;
                break;
              }
              if (idx < aggregationPlan.length - 1) {
                this._log(
                  "warn",
                  `Aggregation "${aggregation}" returned no data. Trying fallback "${aggregationPlan[idx + 1]}".`,
                  {
                    ...requestDetails,
                    aggregation,
                  }
                );
              }
            }
          } catch (error) {
            lastError = error;
            this._log("error", `Failed to load statistics for aggregation "${aggregation}"`, {
              ...requestDetails,
              aggregation,
              error: error instanceof Error ? error.message : error,
            });
          }
        }
      }

      if (fetchId === this._activeFetchCounters[key]) {
        const resolvedAggregation =
          selectedAggregation ??
          lastTriedAggregation ??
          aggregationPlan[0];

        if (isCompare) {
          this._statisticsRangeCompare = {
            start: requestedStart,
            end: requestedEnd,
          };
          this._statisticsPeriodCompare = resolvedAggregation;
          if (resolvedAggregation === "disabled") {
            this._metadataCompare = undefined;
            this._statisticsCompare = undefined;
            this._calculatedSeriesDataCompare = new Map();
            this._calculatedSeriesUnitsCompare = new Map();
            this._lastRawEndCompare = undefined;
          } else {
            if (resolvedAggregation === "raw") {
              const merged =
                lastTriedAggregation === "raw" && this._statisticsCompare
                  ? this._mergeStatistics(this._statisticsCompare, statistics)
                  : statistics;
              const trimmed = this._trimStatisticsToRange(
                merged,
                requestedStart,
                requestedEnd
              );
              this._metadataCompare = metadata;
              this._statisticsCompare = trimmed;
              this._lastRawEndCompare = this._computeMaxEnd(trimmed);
              this._rebuildCalculatedSeries(trimmed, metadata, "compare");
            } else {
              this._metadataCompare = metadata;
              this._statisticsCompare = statistics;
              this._lastRawEndCompare = undefined;
              this._rebuildCalculatedSeries(statistics, metadata, "compare");
            }
            if (!this._shouldComputeCurrentHour("compare")) {
              this._liveStatisticsCompare = undefined;
            }
          }
        } else {
          this._statisticsRange = {
            start: requestedStart,
            end: requestedEnd,
          };
          this._statisticsPeriod = resolvedAggregation;
          if (resolvedAggregation === "disabled") {
            this._metadata = undefined;
            this._statistics = undefined;
            this._calculatedSeriesData = new Map();
            this._calculatedSeriesUnits = new Map();
            this._chartData = [];
            this._chartOptions = undefined;
            this._unitsBySeries = new Map();
            this._disabledMessage = this._getDisabledMessage();
            if (this._autoRefreshTimeout) {
              clearTimeout(this._autoRefreshTimeout);
              this._autoRefreshTimeout = undefined;
            }
            this._lastRawEndMain = undefined;
          } else {
            this._disabledMessage = undefined;
            if (resolvedAggregation === "raw") {
              const merged =
                lastTriedAggregation === "raw" && this._statistics
                  ? this._mergeStatistics(this._statistics, statistics)
                  : statistics;
              const trimmed = this._trimStatisticsToRange(
                merged,
                requestedStart,
                requestedEnd
              );
              this._metadata = metadata;
              this._statistics = trimmed;
              this._lastRawEndMain = this._computeMaxEnd(trimmed);
              this._rebuildCalculatedSeries(trimmed, metadata, "main");
            } else {
              this._metadata = metadata;
              this._statistics = statistics;
              this._lastRawEndMain = undefined;
              this._rebuildCalculatedSeries(statistics, metadata, "main");
            }

            // Schedule auto-refresh for rolling windows and future fixed timespans
            this._scheduleAutoRefresh();

            if (this._shouldComputeCurrentHour("main")) {
              this._scheduleLiveHourLoad("main");
              this._scheduleNextLiveHourTick();
            } else {
              this._liveStatistics = undefined;
              if (this._liveHourTimeout) {
                clearTimeout(this._liveHourTimeout);
                this._liveHourTimeout = undefined;
              }
            }
          }
        }
      }
    } catch (error) {
      lastError = error;
      if (fetchId === this._activeFetchCounters[key]) {
        this._log("error", "Failed to load statistics", {
          ...requestDetails,
          error: error instanceof Error ? error.message : error,
        });
        if (isCompare) {
          this._resetCompareStatistics();
        } else {
          this._metadata = undefined;
          this._statistics = undefined;
          this._statisticsRange = undefined;
          this._statisticsPeriod = undefined;
          this._calculatedSeriesData = new Map();
          this._calculatedSeriesUnits = new Map();
        }
      }
    } finally {
      if (fetchId === this._activeFetchCounters[key]) {
        if (loadingAtStart) {
          this._isLoading = false;
        }
        state.inFlight = false;
        if (state.queued) {
          state.queued = false;
          this._scheduleLoad(key);
        }
        const durationMs = Math.round(performance.now() - requestStarted);
        const resolvedAggregation = isCompare
          ? this._statisticsPeriodCompare
          : this._statisticsPeriod;
        this._log(lastError ? "warn" : "info", "Statistics request completed", {
          ...requestDetails,
          aggregation: resolvedAggregation,
          durationMs,
          status: lastError ? "error" : "success",
        });
      }
    }
  }

  private async _fetchRawStatistics(
    start: Date,
    end: Date | undefined,
    statisticIds: string[],
    contextDetails?: Record<string, unknown>,
    incrementalFrom?: number
  ): Promise<Statistics> {
    if (!this._config || !this.hass || !statisticIds.length) {
      return {};
    }

    const baseStart = incrementalFrom
      ? new Date(Math.max(start.getTime(), incrementalFrom))
      : start;

    const { start: queryStart, end: queryEnd } = this._expandRawQueryWindow(
      baseStart,
      end
    );

    const rawOptions: EnergyCustomGraphRawOptions | undefined =
      this._config.aggregation?.raw_options;

    const options: FetchRawHistoryOptions = {};
    if (rawOptions?.significant_changes_only !== undefined) {
      options.significant_changes_only = rawOptions.significant_changes_only;
    }

    const history = await this._withTimeout(
      fetchRawHistoryStates(
        this.hass,
        queryStart,
        queryEnd,
        statisticIds,
        options
      ),
      FETCH_TIMEOUT_MS,
      "fetchRawHistoryStates",
      {
        ...(contextDetails ?? {}),
        raw: true,
        stats: statisticIds.length,
      }
    );
    return historyStatesToStatistics(history);
  }

  private _expandRawQueryWindow(
    start: Date,
    end?: Date
  ): { start: Date; end?: Date } {
    if (!end) {
      return { start, end };
    }

    const startMs = start.getTime();
    const endMs = end.getTime();
    const spanMs = Math.max(endMs - startMs, 0);
    const buffer = Math.max(60000, spanMs * 0.1);

    const expandedStart = new Date(startMs - buffer);
    const expandedEnd = new Date(endMs + buffer);

    return {
      start: expandedStart,
      end: expandedEnd,
    };
  }

  private _getCalculationKey(index: number): string {
    return `calculation_${index}`;
  }

  private _rebuildCalculatedSeries(
    statistics: Statistics,
    metadata: Record<string, StatisticsMetaData>,
    target: "main" | "compare" = "main"
  ): void {
    const data = new Map<string, StatisticValue[]>();
    const units = new Map<string, string | null | undefined>();

    if (!this._config) {
      if (target === "main") {
        this._calculatedSeriesData = data;
        this._calculatedSeriesUnits = units;
      } else {
        this._calculatedSeriesDataCompare = data;
        this._calculatedSeriesUnitsCompare = units;
      }
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
        index,
        target
      );
      if (!result) {
        return;
      }
      const key = this._getCalculationKey(index);
      data.set(key, result.values);
      units.set(key, result.unit);
    });

    if (target === "main") {
      this._calculatedSeriesData = data;
      this._calculatedSeriesUnits = units;
    } else {
      this._calculatedSeriesDataCompare = data;
      this._calculatedSeriesUnitsCompare = units;
    }
  }

  private _resetCompareStatistics(): void {
    this._statisticsCompare = undefined;
    this._metadataCompare = undefined;
    this._statisticsRangeCompare = undefined;
    this._statisticsPeriodCompare = undefined;
    this._calculatedSeriesDataCompare = new Map();
    this._calculatedSeriesUnitsCompare = new Map();
  }

  private _evaluateCalculationSeries(
    series: EnergyCustomGraphSeriesConfig,
    calculation: EnergyCustomGraphCalculationConfig,
    statistics: Statistics,
    metadata: Record<string, StatisticsMetaData>,
    seriesIndex: number,
    target: "main" | "compare"
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
      timeline?: Array<{
        timestamp: number;
        value: number | null;
        start?: number;
        end?: number;
      }>;
      cursor?: number;
      lastNonNull?: {
        value: number;
        start?: number;
        end?: number;
      };
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
        const timeline: NonNullable<TermResolvedData["timeline"]> = [];

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
            timeline.push({
              timestamp,
              value: processed,
              start: entry.start,
              end: entry.end,
            });
            timestampSet.add(timestamp);
          });
          timeline.sort((a, b) => a.timestamp - b.timestamp);
        }

        termData.push({
          term,
          data: map,
          timeline: timeline.length ? timeline : undefined,
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
    const constantOnly =
      !timestamps.length &&
      termData.every((item) =>
        item.term.statistic_id === undefined &&
        item.constant !== undefined
      );

    if (!timestamps.length) {
      if (!constantOnly) {
        return undefined;
      }
    }

    const initialValue = calculation.initial_value ?? 0;
    const values: StatisticValue[] = [];
    const missingValueWarnings = new Set<string>();
    let divisionWarningLogged = false;

    const processTimestamp = (timestamp: number) => {
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
          const resolved = this._resolveCalculationTermValue(
            item,
            timestamp
          );
          if (resolved) {
            const resolvedStart = resolved.start ?? timestamp;
            const resolvedEnd = resolved.end ?? timestamp;
            if (start === undefined) {
              start = resolvedStart;
            }
            if (end === undefined) {
              end = resolvedEnd;
            }
            termValue = resolved.value;
          } else {
            termValue = 0;
            const statId = item.term.statistic_id;
            if (statId && !missingValueWarnings.has(statId)) {
              console.warn(
                `[energy-custom-graph-card] Missing value for statistic "${statId}" in calculation series "${seriesLabel}". Using 0 for this timestamp.`
              );
              missingValueWarnings.add(statId);
            }
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
    };

    if (timestamps.length) {
      timestamps.forEach(processTimestamp);
    } else if (constantOnly) {
      const context = this._getCalculationTimeContext(target);
      if (context?.start) {
        const seen = new Set<number>();
        const addTimestamp = (ts: number | undefined | null) => {
          if (typeof ts !== "number" || !Number.isFinite(ts)) {
            return;
          }
          if (!seen.has(ts)) {
            seen.add(ts);
            processTimestamp(ts);
          }
        };

        const startTs = context.start.getTime();
        const endTs = context.end?.getTime();
        addTimestamp(startTs);
        if (endTs !== undefined) {
          addTimestamp(endTs);
        }

        if (
          context.period &&
          context.period !== "raw" &&
          context.period !== "disabled" &&
          context.end
        ) {
          const buckets = this._buildBucketSequence(
            startTs,
            context.end.getTime(),
            context.period
          );
          buckets?.forEach(addTimestamp);
        }

        Object.values(statistics).forEach((entries) => {
          entries?.forEach((entry) => {
            addTimestamp(entry.start);
            addTimestamp(entry.end);
          });
        });

        if (seen.size === 1 && endTs === undefined) {
          addTimestamp(startTs + 1);
        }
      }
    }

    const unit =
      calculation.unit ??
      termData.find((item) => item.unit !== undefined)?.unit ??
      null;

    return { values, unit };
  }

  private _resolveCalculationTermValue(
    termData: {
      data?: Map<number, { value: number | null; start?: number; end?: number }>;
      timeline?: Array<{
        timestamp: number;
        value: number | null;
        start?: number;
        end?: number;
      }>;
      cursor?: number;
      lastNonNull?: {
        value: number;
        start?: number;
        end?: number;
      };
      term: EnergyCustomGraphCalculationTerm;
    },
    timestamp: number
  ): { value: number; start?: number; end?: number } | null {
    const direct = termData.data?.get(timestamp);
    if (direct && typeof direct.value === "number" && Number.isFinite(direct.value)) {
      termData.lastNonNull = {
        value: direct.value,
        start: direct.start,
        end: direct.end,
      };
      return {
        value: direct.value,
        start: direct.start,
        end: direct.end,
      };
    }

    const timeline = termData.timeline;
    if (!timeline || !timeline.length) {
      return null;
    }

    if (termData.cursor === undefined) {
      termData.cursor = 0;
    }

    while (
      termData.cursor < timeline.length &&
      timeline[termData.cursor].timestamp <= timestamp
    ) {
      const candidate = timeline[termData.cursor];
      if (typeof candidate.value === "number" && Number.isFinite(candidate.value)) {
        termData.lastNonNull = {
          value: candidate.value,
          start: candidate.start,
          end: candidate.end,
        };
      }
      termData.cursor += 1;
    }

    const fallback = termData.lastNonNull;
    if (fallback) {
      return {
        value: fallback.value,
        start: fallback.start,
        end: fallback.end,
      };
    }

    return null;
  }

  private _getCalculationTimeContext(
    target: "main" | "compare"
  ): {
    start?: Date;
    end?: Date;
    period?: StatisticsPeriod | "raw" | "disabled";
  } {
    if (target === "compare") {
      return {
        start: this._comparePeriodStart,
        end: this._comparePeriodEnd,
        period: this._statisticsPeriodCompare,
      };
    }

    return {
      start: this._periodStart,
      end: this._periodEnd,
      period: this._statisticsPeriod,
    };
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

  private _shouldComputeCurrentHour(target: "main" | "compare"): boolean {
    if (!this._config?.aggregation?.compute_current_hour) {
      return false;
    }
    const period =
      target === "compare" ? this._statisticsPeriodCompare : this._statisticsPeriod;
    if (period !== "hour") {
      return false;
    }
    const periodStart =
      target === "compare" ? this._comparePeriodStart : this._periodStart;
    const periodEnd =
      target === "compare" ? this._comparePeriodEnd : this._periodEnd;
    if (!periodStart) {
      return false;
    }
    const now = new Date();
    if (periodStart > now) {
      return false;
    }
    const currentHourStart = startOfHour(now);
    if (periodEnd && periodEnd <= currentHourStart) {
      return false;
    }
    return true;
  }

  private _resolveAggregationPlan(
    start: Date,
    end?: Date
  ): EnergyCustomGraphAggregationTarget[] {
    const cfg = this._config?.aggregation;
    const usesPicker = this._needsEnergyCollection(this._config);
    const auto = this._deriveAutoStatisticsPeriod(start, end);
    const plan: EnergyCustomGraphAggregationTarget[] = [];

    let stop = false;
    const pushUnique = (period?: EnergyCustomGraphAggregationTarget) => {
      if (stop || !period) {
        return;
      }
      if (!plan.includes(period)) {
        plan.push(period);
      }
      if (period === "disabled") {
        stop = true;
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
    const hourDifference = Math.max(
      differenceInHours(effectiveEnd, start),
      0
    );
    if (hourDifference <= 2) {
      return "5minute";
    }
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
      allow_compare: config.allow_compare ?? true,
    };
    if (
      oldConfig?.aggregation?.compute_current_hour &&
      !this._config.aggregation?.compute_current_hour
    ) {
      this._liveStatistics = undefined;
      this._liveStatisticsCompare = undefined;
      if (this._liveHourTimeout) {
        clearTimeout(this._liveHourTimeout);
        this._liveHourTimeout = undefined;
      }
    }
    this._loggedEnergyFallback = false;
    this.requestUpdate("_config", oldConfig);
    if (this.hass) {
      this._syncWithConfig(oldConfig);
    }
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);

    this._evaluateSectionLayout();

    if (
      changedProps.has("_statistics") ||
      changedProps.has("_metadata") ||
      changedProps.has("_periodStart") ||
      changedProps.has("_periodEnd") ||
      changedProps.has("_statisticsCompare") ||
      changedProps.has("_metadataCompare") ||
      changedProps.has("_comparePeriodStart") ||
      changedProps.has("_comparePeriodEnd") ||
      changedProps.has("_config")
    ) {
      this._generateChart();
    }
  }

  protected firstUpdated(changedProps: PropertyValues): void {
    super.firstUpdated(changedProps);
    this._evaluateSectionLayout();
  }

  public getCardSize(): number {
    return 5;
  }

  public getGridOptions(): LovelaceGridOptions {
    const hasTitle = Boolean(this._config?.title && this._config.title.trim().length);
    const legendVisible = this._config ? this._config.hide_legend !== true : true;
    const legendExpanded = legendVisible && Boolean(this._config?.expand_legend);

    const baseRows = hasTitle ? 5 : 4;
    const baseMinRows = hasTitle ? 4 : 3;
    const legendRows = legendExpanded ? 1 : 0;

    const rows = baseRows + legendRows;
    const minRows = baseMinRows + legendRows;

    return {
      columns: 12,
      min_columns: 6,
      rows,
      min_rows: minRows,
    };
  }

  private _evaluateSectionLayout(): void {
    if (!this.isConnected) {
      return;
    }

    try {
      const layoutFlag = (this as unknown as { layout?: string }).layout;
      const usesSectionLayout = layoutFlag === "grid";
      if (this._usesSectionLayout !== usesSectionLayout) {
        this._usesSectionLayout = usesSectionLayout;
      }
    } catch (_error) {
      // When getComputedStyle fails (e.g., during disconnection), keep previous state.
    }
  }

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    const hasTitle = Boolean(this._config.title && this._config.title.trim().length);
    const contentClasses = {
      content: true,
      "content--no-title": !hasTitle,
    };

    return html`
      <ha-card>
        ${this._config.title ? html`<h1 class="card-header">${this._config.title}</h1>` : nothing}
        <div class=${classMap(contentClasses)}>
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

    const aggregationDisabled = this._statisticsPeriod === "disabled";
    const disabledMessage = aggregationDisabled
      ? this._disabledMessage ?? this._getDisabledMessage()
      : this._disabledMessage;

    if (disabledMessage) {
      return html`<div class="placeholder">
        ${disabledMessage}
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

    const usesSectionLayout = this._usesSectionLayout;
    const chartClass = usesSectionLayout ? "chart chart--section" : "chart";
    const chartHeight = usesSectionLayout
      ? "100%"
      : this._config?.chart_height ?? DEFAULT_CHART_HEIGHT;

    return html`
      <div class=${chartClass}>
        <ha-chart-base
          .hass=${this.hass}
          .data=${this._chartData}
          .options=${this._chartOptions}
          .height=${chartHeight}
          .expandLegend=${this._config?.expand_legend}
        ></ha-chart-base>
      </div>
    `;
  }

  private _generateChart(): void {
    if (!this._config || !this._periodStart) {
      this._chartData = [];
      this._chartOptions = undefined;
      this._unitsBySeries = new Map();
      this._seriesConfigById = new Map();
      return;
    }

    if (!this._statistics || !this._statisticsRange) {
      this._chartData = [];
      this._chartOptions = undefined;
      this._unitsBySeries = new Map();
      this._seriesConfigById = new Map();
      return;
    }

    const currentStart = this._periodStart.getTime();
    const currentEnd = this._periodEnd?.getTime() ?? null;
    const statsStart = this._statisticsRange.start;
    const statsEnd = this._statisticsRange.end ?? null;

    if (statsStart !== currentStart || statsEnd !== currentEnd) {
      return;
    }

    const computedStyle = this.isConnected
      ? getComputedStyle(this)
      : getComputedStyle(document.documentElement);

    const {
      series: mainSeries,
      legend,
      unitBySeries,
      seriesById,
    } = buildSeries({
      hass: this.hass,
      statistics: this._statistics,
      metadata: this._metadata,
      configSeries: this._config.series,
      colorPalette: this._config.color_cycle ?? [],
      computedStyle,
      calculatedData: this._calculatedSeriesData,
      calculatedUnits: this._calculatedSeriesUnits,
    });

    const combinedSeriesById = new Map(seriesById);
    const combinedUnits = new Map<string, string | null | undefined>();
    unitBySeries.forEach((value, key) => combinedUnits.set(key, value));
    const legendSecondaryIds = new Map<string, string[]>();

    const barStackBaseById = new Map<string, string>();
    const normalizedBarStacks = new Map<string, string>();
    const placeholderByBase = new Map<string, BarSeriesOption>();
    const barStackOrder: string[] = [];
    const barStackZByBase = new Map<string, number>();
    const BAR_Z_BASE = 10;
    let generatedBarStackCounter = 0;

    const getBaseKeyForBar = (rawStack?: string): string => {
      const stackName = rawStack?.trim();
      if (stackName) {
        const existing = normalizedBarStacks.get(stackName);
        if (existing) {
          return existing;
        }
        normalizedBarStacks.set(stackName, stackName);
        return stackName;
      }
      generatedBarStackCounter += 1;
      return `series-${generatedBarStackCounter}`;
    };

    const ensurePlaceholder = (baseKey: string, baseZ: number) => {
      const placeholderZ = Math.max(baseZ - 3, 0);
      const existing = placeholderByBase.get(baseKey);
      if (existing) {
        existing.stack = `${baseKey}--current`;
        existing.z = placeholderZ;
        return existing;
      }
      barStackOrder.push(baseKey);
      const placeholder: BarSeriesOption = {
        id: `${baseKey}--compare-placeholder`,
        type: "bar",
        stack: `${baseKey}--current`,
        data: [],
        silent: true,
        tooltip: { show: false },
        itemStyle: {
          color: "transparent",
          borderColor: "transparent",
          borderWidth: 0,
        },
        emphasis: {
          disabled: true,
        },
        barMaxWidth: BAR_MAX_WIDTH,
        z: placeholderZ,
      };
      placeholderByBase.set(baseKey, placeholder);
      return placeholder;
    };

    mainSeries.forEach((serie, index) => {
      if (serie.type !== "bar") {
        return;
      }
      const id = serie.id ?? `bar_${index}`;
      const rawStack =
        typeof serie.stack === "string" && serie.stack.trim() !== ""
          ? serie.stack
          : undefined;
      const baseKey = getBaseKeyForBar(rawStack);
      barStackBaseById.set(id, baseKey);
      const baseZCandidate =
        typeof serie.z === "number" && Number.isFinite(serie.z)
          ? Math.max(serie.z, BAR_Z_BASE)
          : BAR_Z_BASE;
      const resolvedBaseZ = barStackZByBase.has(baseKey)
        ? Math.max(barStackZByBase.get(baseKey)!, baseZCandidate)
        : baseZCandidate;
      serie.z = resolvedBaseZ;
      serie.stack = `${baseKey}--current`;
      barStackZByBase.set(baseKey, resolvedBaseZ);
      ensurePlaceholder(baseKey, resolvedBaseZ);
    });

    let compareSeries: SeriesOption[] = [];
    const hasCompareData =
      this._comparePeriodStart &&
      this._statisticsCompare &&
      this._metadataCompare &&
      this._statisticsRangeCompare &&
      this._statisticsRangeCompare.start === this._comparePeriodStart.getTime() &&
      (this._statisticsRangeCompare.end ?? null) ===
        (this._comparePeriodEnd?.getTime() ?? null);

    if (hasCompareData) {
      const compareResult = buildSeries({
        hass: this.hass,
        statistics: this._statisticsCompare!,
        metadata: this._metadataCompare,
        configSeries: this._config.series,
        colorPalette: this._config.color_cycle ?? [],
        computedStyle,
        calculatedData: this._calculatedSeriesDataCompare,
        calculatedUnits: this._calculatedSeriesUnitsCompare,
      });

      const transformTimestamp = this._createCompareTransform();

      const mapEntry = (entry: any): any => {
        const applyTransform = (timestamp: number) =>
          transformTimestamp ? transformTimestamp(timestamp) : timestamp;

        if (Array.isArray(entry)) {
          const originalTs = Number(entry[0]);
          const mappedTs = applyTransform(originalTs);
          const rest = entry.slice(1);
          return [mappedTs, ...rest, originalTs];
        }
        if (entry && typeof entry === "object" && "value" in entry) {
          const tuple = Array.isArray((entry as any).value)
            ? (entry as any).value
            : undefined;
          if (!tuple) {
            return entry;
          }
          const originalTs = Number(tuple[0]);
          const mappedTs = applyTransform(originalTs);
          const newTuple = [...tuple];
          newTuple[0] = mappedTs;
          newTuple.push(originalTs);
          return {
            ...(entry as Record<string, unknown>),
            value: newTuple,
          };
        }
        return entry;
      };

      const compareSeriesTemp: SeriesOption[] = [];

      compareResult.series.forEach((serie, index) => {
        const baseId = serie.id ?? serie.name ?? `compare_${index}`;
        const compareId = `${baseId}--compare`;
        const cloned: SeriesOption = {
          ...serie,
          id: compareId,
          name: `${serie.name ?? baseId} (Compare)`,
          z: serie.z,
        };

        let baseConfig = compareResult.seriesById.get(baseId);
        if (!baseConfig && baseId.includes("__fill_")) {
          const parentId = baseId.replace(/__fill_(base|area)$/u, "");
          baseConfig = compareResult.seriesById.get(parentId);
        }

        const compareColorRaw = baseConfig?.compare_color?.trim();
        const compareColor =
          compareColorRaw && compareColorRaw !== ""
            ? this._resolveColorToken(compareColorRaw, computedStyle)
            : undefined;

        if (Array.isArray(cloned.data)) {
          cloned.data = cloned.data.map(mapEntry);
        } else if (cloned.data) {
          cloned.data = (cloned.data as any[] | undefined)?.map(mapEntry);
        }

        if (cloned.type === "bar") {
          let baseKey = barStackBaseById.get(baseId);
          if (!baseKey) {
            const rawStack =
              typeof serie.stack === "string" && serie.stack.trim() !== ""
                ? serie.stack
                : undefined;
            baseKey = getBaseKeyForBar(rawStack);
            barStackBaseById.set(baseId, baseKey);
            const fallbackZ = BAR_Z_BASE;
            barStackZByBase.set(baseKey, fallbackZ);
            ensurePlaceholder(baseKey, fallbackZ);
          }
          const candidateZ =
            typeof serie.z === "number" && Number.isFinite(serie.z)
              ? Math.max(serie.z, BAR_Z_BASE)
              : BAR_Z_BASE;
          const storedZ = barStackZByBase.get(baseKey);
          const baseZ = storedZ ? Math.max(storedZ, candidateZ) : candidateZ;
          barStackZByBase.set(baseKey, baseZ);
          ensurePlaceholder(baseKey, baseZ);
          const placeholder = placeholderByBase.get(baseKey);
          if (placeholder) {
            placeholder.stack = `${baseKey}--compare`;
            placeholder.z = Math.max(baseZ - 3, 0);
          }
          cloned.stack = `${baseKey}--compare`;
          cloned.z = Math.max(baseZ, BAR_Z_BASE);
          this._styleCompareSeries(cloned, compareColor);
          compareSeriesTemp.push(cloned);
        } else {
          if (serie.stack && serie.stack.trim() !== "") {
            cloned.stack = `${serie.stack.trim()}--compare`;
          } else {
            cloned.stack = `${compareId}--stack`;
          }
          this._styleCompareSeries(cloned, compareColor);
          compareSeriesTemp.push(cloned);
        }
        combinedUnits.set(compareId, compareResult.unitBySeries.get(baseId));

        if (baseConfig) {
          combinedSeriesById.set(compareId, baseConfig);
        }

        const legendEntryId = legend.find(
          (entry) => entry.id === (serie.id ?? baseId)
        )?.id;
        if (legendEntryId) {
          const secondaryList = legendSecondaryIds.get(legendEntryId) ?? [];
          secondaryList.push(compareId);
          legendSecondaryIds.set(legendEntryId, secondaryList);
        }
      });
      compareSeries = compareSeriesTemp;
    }

    const comparePlaceholders = barStackOrder
      .map((baseKey) => placeholderByBase.get(baseKey))
      .filter(
        (placeholder): placeholder is BarSeriesOption =>
          placeholder !== undefined
      );

    const combinedSeries = [...comparePlaceholders, ...compareSeries, ...mainSeries];
    this._seriesConfigById = new Map(combinedSeriesById);

    const displayEnd =
      this._periodEnd?.getTime() ?? this._statisticsRange.end ?? null;
    const bucketSequence = this._buildBucketSequence(
      currentStart,
      displayEnd,
      this._statisticsPeriod
    );

    if (bucketSequence?.length) {
      this._normalizeLineSeries(combinedSeries, bucketSequence);
    }

    const extendMainToNow = this._statisticsPeriod === "raw";
    const extendCompareToNow = this._statisticsPeriodCompare === "raw";
    this._extendLineSeriesToNow(
      combinedSeries,
      combinedSeriesById,
      displayEnd,
      extendMainToNow,
      extendCompareToNow
    );

    this._applyBarStyling(combinedSeries, bucketSequence);

    if (!combinedSeries.length) {
      this._chartData = [];
      this._chartOptions = undefined;
      this._unitsBySeries = new Map();
      return;
    }

    const { yAxis, axisUnitByIndex } = this._buildYAxisOptions(
      combinedSeriesById,
      combinedSeries
    );

    this._unitsBySeries = new Map();
    combinedSeries.forEach((item) => {
      const axisIndex = item.yAxisIndex ?? 0;
      const axisUnit =
        axisUnitByIndex.get(axisIndex) ??
        (this._config?.show_unit === false
          ? undefined
          : combinedUnits.get(item.id ?? ""));
      this._unitsBySeries.set(item.id ?? "", axisUnit);
    });

    const legendOption = this._buildLegendOption(legend, legendSecondaryIds);

    const axisMax = this._periodEnd
      ? this._computeSuggestedXAxisMax(this._periodStart, this._periodEnd)
      : (this._statisticsRange.end ?? this._periodStart.getTime());

    const xAxis: XAxisOption[] = [
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

    let hasExistingChartData = Array.isArray(this._chartData) && this._chartData.length > 0;
    const rangeChanged =
      !this._lastRenderedRange ||
      this._lastRenderedRange.start !== currentStart ||
      (this._lastRenderedRange.end ?? null) !== (this._periodEnd?.getTime() ?? null);

    // On range switches, avoid ECharts morphing old data into a new domain
    // by treating this as a fresh render (no existing data).
    if (rangeChanged && hasExistingChartData) {
      hasExistingChartData = false;
      this._chartData = [];
    }

    const shouldAnimateFromZero =
      // Range switch: always animate from zero to avoid side-fly transitions
      rangeChanged ||
      // Initial raw/live render when no data yet
      (!hasExistingChartData && (extendMainToNow || extendCompareToNow));

    // Control animation explicitly: only animate when we decided to animate from zero
    options.animation = shouldAnimateFromZero;
    this._chartOptions = options;

    if (shouldAnimateFromZero) {
      const targetRange = { start: currentStart, end: currentEnd };
      const zeroSeries = this._createZeroSeriesSnapshot(combinedSeries);
      this._chartData = zeroSeries;
      this._scheduleRawAnimationCommit(combinedSeries, targetRange);
      return;
    }

    if (this._rawAnimationFrame !== undefined) {
      cancelAnimationFrame(this._rawAnimationFrame);
      this._rawAnimationFrame = undefined;
    }

    this._chartData = combinedSeries;
    this._lastRenderedRange = { start: currentStart, end: currentEnd };
  }

  private _computeSuggestedXAxisMax(start: Date, end: Date): number {
    const dayDifference = differenceInDays(end, start);
    let suggestedMax = new Date(end);

    if (dayDifference > 2 && suggestedMax.getHours() === 0) {
      suggestedMax = subHours(suggestedMax, 1);
    }

    if (dayDifference > 2) {
      suggestedMax.setMinutes(0, 0, 0);
    }

    if (dayDifference > 35) {
      suggestedMax.setDate(1);
    }
    if (dayDifference > 2) {
      suggestedMax.setHours(0);
    }

    return suggestedMax.getTime();
  }

  private _normalizeLineSeries(
    series: SeriesOption[],
    buckets: number[]
  ): void {
    if (!buckets.length) {
      return;
    }

    series.forEach((serie, serieIndex) => {
      if (serie.type !== "line" || !Array.isArray(serie.data)) {
        return;
      }

      const dataMap = new Map<number, number | null>();
      (serie.data as any[]).forEach((item) => {
        if (Array.isArray(item)) {
          const timestamp = Number(item[0]);
          if (!Number.isFinite(timestamp)) {
            return;
          }
          const value =
            item.length > 1 && typeof item[1] === "number"
              ? item[1]
              : item[1] === null
                ? null
                : null;
          dataMap.set(timestamp, value);
          return;
        }
        if (item && typeof item === "object") {
          const tuple = Array.isArray((item as any).value)
            ? (item as any).value
            : undefined;
          if (!tuple) {
            return;
          }
          const timestamp = Number(tuple[0]);
          if (!Number.isFinite(timestamp)) {
            return;
          }
          const value =
            tuple.length > 1 && typeof tuple[1] === "number"
              ? tuple[1]
              : tuple[1] === null
                ? null
                : null;
          dataMap.set(timestamp, value);
        }
      });

      const normalizedData = buckets.map((bucket) => {
        const value = dataMap.has(bucket) ? dataMap.get(bucket) : null;
        return [bucket, value ?? null];
      });

      serie.data = normalizedData;
    });
  }

  private _extendLineSeriesToNow(
    series: SeriesOption[],
    seriesConfigById: Map<string, EnergyCustomGraphSeriesConfig>,
    displayEnd: number | null,
    extendMain: boolean,
    extendCompare: boolean
  ): void {
    const now = Date.now();

    series.forEach((serie) => {
      if (serie.type !== "line" || !Array.isArray(serie.data) || !serie.data.length) {
        return;
      }

      const serieId = typeof serie.id === "string" ? serie.id : undefined;
      const config = serieId ? seriesConfigById.get(serieId) : undefined;
      const chartType = config?.chart_type ?? this._inferChartTypeFromSeriesId(serieId);
      const isCompare = !!serieId && serieId.endsWith("--compare");

      const tuples = this._castSeriesDataPoints(serie.data as unknown[]);
      if (!tuples) {
        return;
      }

      if (chartType === "step") {
        const rangeEnd = isCompare
          ? this._comparePeriodEnd?.getTime() ?? this._statisticsRangeCompare?.end ?? displayEnd
          : displayEnd;
        const rawLimit = typeof rangeEnd === "number" ? rangeEnd : now;
        const limitTime = Math.min(rawLimit, now);
        this._extendStepSeriesToLimit(tuples, limitTime);
        return;
      }

      const effectiveDisplayEnd = isCompare
        ? this._statisticsRangeCompare?.end ?? displayEnd
        : displayEnd;

      if (
        !(chartType === "line" || chartType === undefined) ||
        effectiveDisplayEnd === null ||
        effectiveDisplayEnd <= now
      ) {
        return;
      }

      const shouldExtend =
        (isCompare && extendCompare) || (!isCompare && extendMain);
      if (!shouldExtend) {
        return;
      }

      this._extendRawLineSeriesToNow(tuples, now);
    });
  }

  private _extendRawLineSeriesToNow(
    data: Array<[number, number | null]>,
    now: number
  ): void {
    // Find last non-null point at or before "now"
    let lastValueIndex = -1;
    let lastValue: number | null = null;
    for (let idx = data.length - 1; idx >= 0; idx--) {
      const [timestamp, value] = data[idx];
      if (timestamp > now) {
        continue;
      }
      if (typeof value === "number" && Number.isFinite(value)) {
        lastValueIndex = idx;
        lastValue = value;
        break;
      }
    }

    if (lastValueIndex === -1 || lastValue === null) {
      return;
    }

    // Fill trailing nulls up to "now" with the last known value
    for (let idx = lastValueIndex + 1; idx < data.length; idx++) {
      const point = data[idx];
      const timestamp = point[0];
      if (timestamp > now) {
        break;
      }
      if (point[1] === null) {
        point[1] = lastValue;
      }
    }

    const hasPointAtNow = data.some(
      (point) => Math.abs(point[0] - now) <= 1000
    );

    if (!hasPointAtNow) {
      const insertionPoint = data.findIndex((point) => point[0] > now);
      const newPoint: [number, number] = [now, lastValue];
      if (insertionPoint === -1) {
        data.push(newPoint);
      } else {
        data.splice(insertionPoint, 0, newPoint);
      }
    }
  }

  private _extendStepSeriesToLimit(
    data: Array<[number, number | null]>,
    limitTime: number
  ): void {
    if (!Number.isFinite(limitTime) || !data.length) {
      return;
    }

    let lastValueIndex = -1;
    for (let idx = data.length - 1; idx >= 0; idx--) {
      const [timestamp, value] = data[idx];
      if (timestamp > limitTime) {
        continue;
      }
      if (typeof value === "number" && Number.isFinite(value)) {
        lastValueIndex = idx;
        break;
      }
    }

    if (lastValueIndex === -1) {
      return;
    }

    const lastTimestamp = data[lastValueIndex][0];
    const lastValue = data[lastValueIndex][1];
    if (limitTime <= lastTimestamp) {
      return;
    }
    if (typeof lastValue !== "number" || !Number.isFinite(lastValue)) {
      return;
    }

    for (let idx = lastValueIndex + 1; idx < data.length; idx++) {
      const point = data[idx];
      const timestamp = point[0];
      if (timestamp > limitTime) {
        break;
      }
      if (point[1] === null) {
        point[1] = lastValue;
      }
    }

    const insertionIndex = data.findIndex(([timestamp]) => timestamp >= limitTime);
    if (insertionIndex === -1) {
      data.push([limitTime, lastValue]);
    } else if (data[insertionIndex][0] === limitTime) {
      if (data[insertionIndex][1] === null) {
        data[insertionIndex][1] = lastValue;
      }
    } else {
      data.splice(insertionIndex, 0, [limitTime, lastValue]);
    }
  }

  private _scheduleRawAnimationCommit(
    series: SeriesOption[],
    targetRange?: { start: number; end: number | null }
  ): void {
    if (this._rawAnimationFrame !== undefined) {
      cancelAnimationFrame(this._rawAnimationFrame);
    }
    this._rawAnimationFrame = requestAnimationFrame(() => {
      this._rawAnimationFrame = undefined;
      this._chartData = series;
      if (targetRange) {
        this._lastRenderedRange = targetRange;
      }
    });
  }

  private _createZeroSeriesSnapshot(series: SeriesOption[]): SeriesOption[] {
    const clone = this._cloneSeries(series);
    clone.forEach((serie) => {
      if (!Array.isArray(serie.data)) {
        return;
      }

      if (serie.type === "line") {
        serie.data = (serie.data as Array<[number, number | null]>).map(
          ([timestamp, value]) => [timestamp, value === null ? null : 0]
        );
        return;
      }

      if (serie.type === "bar") {
        serie.data = (serie.data as any[]).map((entry) => {
          if (Array.isArray(entry)) {
            const timestamp = entry[0];
            const value =
              entry.length > 1 && typeof entry[1] === "number"
                ? entry[1]
                : entry[1] === null
                  ? null
                  : null;
            return [timestamp, value === null ? null : 0];
          }

          if (entry && typeof entry === "object" && "value" in entry) {
            const next = { ...(entry as Record<string, unknown>) };
            const tuple = Array.isArray(next.value)
              ? (next.value as [number, number | null])
              : undefined;
            if (tuple) {
              const [timestamp, value] = tuple;
              (next as any).value = [timestamp, value === null ? null : 0];
            }
            return next;
          }

          return entry;
        });
      }
    });
    return clone;
  }

  private _cloneSeries(series: SeriesOption[]): SeriesOption[] {
    if (typeof structuredClone === "function") {
      return structuredClone(series);
    }
    return JSON.parse(JSON.stringify(series)) as SeriesOption[];
  }

  private _computeMaxEnd(statistics: Statistics | undefined): number | undefined {
    if (!statistics) return undefined;
    let maxEnd: number | undefined;
    Object.values(statistics).forEach((entries) => {
      entries?.forEach((entry) => {
        const end = entry.end ?? entry.start;
        if (typeof end === "number") {
          maxEnd = maxEnd === undefined ? end : Math.max(maxEnd, end);
        }
      });
    });
    return maxEnd;
  }

  private _mergeStatistics(
    base: Statistics | undefined,
    patch: Statistics
  ): Statistics {
    if (!base) {
      return patch;
    }
    const merged: Statistics = { ...base };
    Object.entries(patch).forEach(([id, entries]) => {
      const existing = merged[id];
      if (!existing || !existing.length) {
        merged[id] = entries;
        return;
      }
      const byKey = new Map<number, number>();
      const combined: StatisticValue[] = [...existing];
      combined.forEach((entry, idx) => {
        const key = entry.end ?? entry.start ?? idx;
        byKey.set(key, idx);
      });
      entries.forEach((entry) => {
        const key = entry.end ?? entry.start ?? Math.random();
        const idx = byKey.get(key);
        if (idx !== undefined) {
          combined[idx] = entry;
        } else {
          combined.push(entry);
          byKey.set(key, combined.length - 1);
        }
      });
      combined.sort((a, b) => (a.end ?? a.start ?? 0) - (b.end ?? b.start ?? 0));
      merged[id] = combined;
    });
    return merged;
  }

  private _trimStatisticsToRange(
    statistics: Statistics,
    start: number,
    end: number | null
  ): Statistics {
    const trimmed: Statistics = {};
    Object.entries(statistics).forEach(([id, entries]) => {
      if (!entries || !entries.length) {
        trimmed[id] = [];
        return;
      }

      let pre: StatisticValue | undefined;
      let post: StatisticValue | undefined;
      const inRange: StatisticValue[] = [];

      entries.forEach((entry) => {
        const s = entry.start ?? entry.end;
        const e = entry.end ?? entry.start;
        if (s === undefined || e === undefined) {
          return;
        }
        if (end !== null && s > end) {
          if (!post) post = entry;
          return;
        }
        if (e < start) {
          pre = entry;
          return;
        }
        inRange.push(entry);
      });

      if (pre) {
        inRange.unshift(pre);
      }
      if (post) {
        inRange.push(post);
      }

      trimmed[id] = inRange;
    });
    return trimmed;
  }

  private _castSeriesDataPoints(
    rawData: unknown[]
  ): Array<[number, number | null]> | null {
    if (!Array.isArray(rawData)) {
      return null;
    }
    for (const point of rawData) {
      if (!Array.isArray(point) || point.length < 2) {
        return null;
      }
      if (typeof point[0] !== "number") {
        return null;
      }
    }
    return rawData as Array<[number, number | null]>;
  }

  private _inferChartTypeFromSeriesId(
    id: string | undefined
  ): EnergyCustomGraphChartType | undefined {
    if (!id) {
      return undefined;
    }
    const baseId = id.endsWith("--compare") ? id.slice(0, -9) : id;
    const parts = baseId.split(":");
    if (parts.length >= 3) {
      const candidate = parts[2];
      if (
        candidate === "bar" ||
        candidate === "line" ||
        candidate === "step"
      ) {
        return candidate;
      }
    }
    return undefined;
  }

  private _createCompareTransform():
    | ((timestamp: number) => number)
    | undefined {
    if (!this._periodStart || !this._comparePeriodStart) {
      return undefined;
    }

    const start = this._periodStart;
    const compareStart = this._comparePeriodStart;

    const compareYearDiff = differenceInYears(start, compareStart);
    if (
      compareYearDiff !== 0 &&
      start.getTime() === startOfYear(start).getTime()
    ) {
      return (timestamp: number) =>
        addYears(new Date(timestamp), compareYearDiff).getTime();
    }

    const compareMonthDiff = differenceInMonths(start, compareStart);
    if (
      compareMonthDiff !== 0 &&
      start.getTime() === startOfMonth(start).getTime()
    ) {
      return (timestamp: number) =>
        addMonths(new Date(timestamp), compareMonthDiff).getTime();
    }

    const compareDayDiff = differenceInDays(start, compareStart);
    if (
      compareDayDiff !== 0 &&
      start.getTime() === startOfDay(start).getTime()
    ) {
      return (timestamp: number) =>
        addDays(new Date(timestamp), compareDayDiff).getTime();
    }

    const compareOffset = start.getTime() - compareStart.getTime();
    return (timestamp: number) => timestamp + compareOffset;
  }

  private _applyBarStyling(
    series: SeriesOption[],
    predefinedBuckets?: number[]
  ): void {
    const barSeries = series.filter(
      (item): item is BarSeriesOption => item.type === "bar"
    );

    if (!barSeries.length) {
      return;
    }

    const bucketSet = new Set<number>();
    predefinedBuckets?.forEach((bucket) => bucketSet.add(bucket));

    barSeries.forEach((serie) => {
      if (!Array.isArray(serie.data)) {
        return;
      }
      serie.data = serie.data.map((entry) => {
        if (Array.isArray(entry)) {
          const timestamp = Number(entry[0]);
          bucketSet.add(timestamp);
          return {
            value: [timestamp, entry[1]],
          };
        }
        if (entry && typeof entry === "object" && "value" in entry) {
          const tuple = Array.isArray((entry as any).value)
            ? (entry as any).value
            : undefined;
          if (tuple) {
            const timestamp = Number(tuple[0]);
            bucketSet.add(timestamp);
            return {
              ...(entry as Record<string, unknown>),
              value: [timestamp, tuple[1]],
            };
          }
          return { ...(entry as Record<string, unknown>) };
        }
        const timestamp = Number(entry);
        bucketSet.add(timestamp);
        return {
          value: [timestamp, 0],
        };
      });
    });

    const buckets = Array.from(bucketSet).sort((a, b) => a - b);

    barSeries.forEach((serie) => {
      const baseItemStyle = {
        ...(serie.itemStyle ?? {}),
      } as Record<string, any>;
      const dataMap = new Map<number, any>();
      (serie.data as any[] | undefined)?.forEach((item) => {
        const tuple = Array.isArray(item?.value) ? item.value : undefined;
        if (!tuple) {
          return;
        }
        const timestamp = Number(tuple[0]);
        dataMap.set(timestamp, {
          ...item,
          value: [timestamp, tuple[1]],
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

  private _styleCompareSeries(
    serie: SeriesOption,
    overrideColor?: string
  ): void {
    const baseOpacity = 0.6;

    if (overrideColor && overrideColor.trim() !== "") {
      const color = overrideColor.trim();
      if (serie.type === "bar") {
        const existingItemColor =
          typeof serie.itemStyle === "object"
            ? (serie.itemStyle as Record<string, any>).color
            : undefined;
        const resolvedItemColor =
          EnergyCustomGraphCard._colorWithAlpha(
            color,
            EnergyCustomGraphCard._extractAlpha(existingItemColor)
          ) ?? color;
        const itemStyle = {
          ...(serie.itemStyle ?? {}),
          color: resolvedItemColor,
          borderColor: resolvedItemColor,
        } as Record<string, any>;
        serie.itemStyle = itemStyle;
        serie.color = resolvedItemColor;
        const emphasisItemStyle = {
          ...(serie.emphasis?.itemStyle ?? {}),
          color: resolvedItemColor,
        } as Record<string, any>;
        serie.emphasis = {
          ...(serie.emphasis ?? {}),
          itemStyle: emphasisItemStyle,
        } as Record<string, any>;
      } else {
        const existingLineColor =
          typeof serie.lineStyle === "object"
            ? (serie.lineStyle as Record<string, any>).color
            : undefined;
        const resolvedLineColor =
          EnergyCustomGraphCard._colorWithAlpha(
            color,
            EnergyCustomGraphCard._extractAlpha(existingLineColor)
          ) ?? color;
        serie.color = resolvedLineColor;
        serie.lineStyle = {
          ...(serie.lineStyle ?? {}),
          color: resolvedLineColor,
        };
        const existingItemColor =
          typeof serie.itemStyle === "object"
            ? (serie.itemStyle as Record<string, any>).color
            : undefined;
        const resolvedItemColor =
          EnergyCustomGraphCard._colorWithAlpha(
            color,
            EnergyCustomGraphCard._extractAlpha(existingItemColor)
          ) ?? color;
        serie.itemStyle = {
          ...(serie.itemStyle ?? {}),
          color: resolvedItemColor,
        };
        const emphasisItemStyle = {
          ...(serie.emphasis?.itemStyle ?? {}),
          color: resolvedLineColor,
        } as Record<string, any>;
        serie.emphasis = {
          ...(serie.emphasis ?? {}),
          itemStyle: emphasisItemStyle,
        } as Record<string, any>;
        if (serie.areaStyle) {
          const areaStyle = {
            ...(serie.areaStyle as Record<string, any>),
          };
          const existingAreaColor = areaStyle.color;
          const resolvedAreaColor =
            EnergyCustomGraphCard._colorWithAlpha(
              color,
              EnergyCustomGraphCard._extractAlpha(existingAreaColor)
            ) ?? color;
          areaStyle.color = resolvedAreaColor;
          serie.areaStyle = areaStyle;
        }
        (serie as any).connectNulls = false;
      }
    } else {
      if (serie.type === "bar") {
        const itemStyle = {
          ...(serie.itemStyle ?? {}),
          opacity: baseOpacity,
        } as Record<string, any>;
        serie.itemStyle = itemStyle;

        const emphasisItemStyle = {
          ...(serie.emphasis?.itemStyle ?? {}),
          opacity: Math.min(1, baseOpacity + 0.2),
        } as Record<string, any>;
        serie.emphasis = {
          ...(serie.emphasis ?? {}),
          itemStyle: emphasisItemStyle,
        } as Record<string, any>;
      } else {
        serie.lineStyle = {
          ...(serie.lineStyle ?? {}),
          opacity: baseOpacity,
        };
        serie.itemStyle = {
          ...(serie.itemStyle ?? {}),
          opacity: baseOpacity,
        };
        if (serie.areaStyle) {
          const currentOpacity = (serie.areaStyle as any).opacity ?? baseOpacity / 2;
          serie.areaStyle = {
            ...(serie.areaStyle ?? {}),
            opacity: currentOpacity * 0.6,
          };
        }
        (serie as any).connectNulls = false;
      }
    }

    const baseZ = (serie.z ?? 0) - 1;
    serie.z = baseZ < 0 ? 0 : baseZ;
  }

  private _resolveColorToken(
    raw: string,
    computedStyle: CSSStyleDeclaration
  ): string | undefined {
    if (!raw) {
      return undefined;
    }
    let token = raw.trim();
    if (!token) {
      return undefined;
    }
    if (token.startsWith("#") || token.startsWith("rgb")) {
      return token;
    }
    if (token.startsWith("var(") && token.endsWith(")")) {
      token = token.slice(4, -1).trim();
    }
    if (token.startsWith("--")) {
      const resolved = computedStyle.getPropertyValue(token)?.trim();
      if (resolved) {
        return resolved;
      }
      return token;
    }
    const resolved = computedStyle.getPropertyValue(token)?.trim();
    if (resolved) {
      return resolved;
    }
    return token;
  }

  private static _extractAlpha(color: unknown): number | undefined {
    if (typeof color !== "string") {
      return undefined;
    }
    const trimmed = color.trim();
    const rgbaMatch = trimmed.match(/rgba?\(([^)]+)\)/i);
    if (rgbaMatch) {
      const parts = rgbaMatch[1].split(",").map((part) => part.trim());
      if (parts.length === 4) {
        const alpha = Number(parts[3]);
        return Number.isFinite(alpha) ? alpha : undefined;
      }
      if (parts.length === 3) {
        return 1;
      }
    }
    if (trimmed.startsWith("#")) {
      const hex = trimmed.slice(1);
      if (hex.length === 8) {
        return parseInt(hex.slice(6, 8), 16) / 255;
      }
      if (hex.length === 4) {
        return parseInt(hex.slice(3, 4).repeat(2), 16) / 255;
      }
    }
    return undefined;
  }

  private static _colorWithAlpha(
    color: string,
    alpha: number | undefined
  ): string | undefined {
    if (alpha === undefined || alpha >= 1) {
      return color;
    }
    const rgb = EnergyCustomGraphCard._parseColor(color);
    if (!rgb) {
      return color;
    }
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }

  private static _parseColor(
    value: string
  ): { r: number; g: number; b: number } | undefined {
    const trimmed = value.trim();
    const rgbaMatch = trimmed.match(/rgba?\(([^)]+)\)/i);
    if (rgbaMatch) {
      const parts = rgbaMatch[1].split(",").map((part) => Number(part.trim()));
      if (parts.length >= 3) {
        return {
          r: Math.round(parts[0]),
          g: Math.round(parts[1]),
          b: Math.round(parts[2]),
        };
      }
      return undefined;
    }
    if (!trimmed.startsWith("#")) {
      return undefined;
    }
    const hex = trimmed.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return { r, g, b };
    }
    if (hex.length === 6 || hex.length === 8) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return { r, g, b };
    }
    return undefined;
  }

  private _buildBucketSequence(
    start: number,
    end: number | null,
    period?: StatisticsPeriod | "raw" | "disabled"
  ): number[] | undefined {
    if (
      end === null ||
      period === undefined ||
      period === "raw" ||
      period === "disabled"
    ) {
      return undefined;
    }
    if (end < start) {
      return [start];
    }

    const buckets: number[] = [];
    let cursor = this._alignBucketStart(start, period);
    const endDate = new Date(end);
    let safety = 0;
    const maxIterations = 200000;

    while (cursor.getTime() <= endDate.getTime() && safety < maxIterations) {
      buckets.push(cursor.getTime());
      const next = this._advanceBucket(cursor, period);
      if (next.getTime() === cursor.getTime()) {
        break;
      }
      cursor = next;
      safety++;
    }

    return buckets;
  }

  private _advanceBucket(date: Date, period: StatisticsPeriod): Date {
    switch (period) {
      case "5minute":
        return addMinutes(date, 5);
      case "hour":
        return addHours(date, 1);
      case "day":
        return addDays(date, 1);
      case "week":
        return addWeeks(date, 1);
      case "month":
        return addMonths(date, 1);
      default:
        return addHours(date, 1);
    }
  }

  private _alignBucketStart(start: number, period: StatisticsPeriod): Date {
    const date = new Date(start);

    switch (period) {
      case "5minute": {
        const minutes = date.getMinutes();
        const alignedMinutes = Math.floor(minutes / 5) * 5;
        date.setSeconds(0, 0);
        date.setMinutes(alignedMinutes);
        return date;
      }
      case "hour":
        date.setMinutes(0, 0, 0);
        return date;
      case "day":
        return startOfDay(date);
      case "week":
        return startOfWeek(date);
      case "month":
        return startOfMonth(date);
      default:
        date.setMinutes(0, 0, 0);
        return date;
    }
  }

  private _buildLegendOption(
    entries: {
      id: string;
      name: string;
      color?: string;
      fillColor?: string;
      borderColor?: string;
      borderWidth?: number;
      hidden?: boolean;
    }[],
    secondaryIds: Map<string, string[]>
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
      secondaryIds: secondaryIds.get(entry.id) ?? [],
      itemStyle:
        entry.fillColor || entry.color || entry.borderColor
          ? {
              color: entry.fillColor ?? entry.color,
              borderColor: entry.borderColor ?? entry.color,
              borderWidth: entry.borderWidth ?? (entry.borderColor ? 2 : 1),
            }
          : undefined,
    }));

    const selected: Record<string, boolean> = {};
    sortedEntries.forEach((entry) => {
      const isVisible = entry.hidden ? false : true;
      selected[entry.id] = isVisible;
      const linked = secondaryIds.get(entry.id);
      linked?.forEach((secondaryId) => {
        selected[secondaryId] = isVisible;
      });
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
    const precision = this._config?.tooltip_precision ?? 2;
    const includeStackSums = this._config?.show_stack_sums === true;

    const extractTuple = (
      param: Record<string, any>
    ): { display: number; value: number | null; original?: number } | undefined => {
      const value = param.value ?? param.data ?? param?.value?.value;
      if (Array.isArray(value)) {
        const displayTs = Number(value[0]);
        const yVal =
          value.length > 1 && typeof value[1] === "number" ? value[1] : null;
        const originalCandidate =
          value.length > 2 && typeof value[value.length - 1] === "number"
            ? value[value.length - 1]
            : undefined;
        return {
          display: displayTs,
          value: yVal,
          original:
            originalCandidate !== undefined &&
            originalCandidate !== displayTs
              ? originalCandidate
              : undefined,
        };
      }
      if (typeof value === "number") {
        return {
          display: Number(param.axisValue ?? param.axisValueLabel ?? 0),
          value,
        };
      }
      if (value && Array.isArray(value.value)) {
        const tuple = value.value as any[];
        const displayTs = Number(tuple[0]);
        const yVal =
          tuple.length > 1 && typeof tuple[1] === "number" ? tuple[1] : null;
        const originalCandidate =
          tuple.length > 2 && typeof tuple[tuple.length - 1] === "number"
            ? tuple[tuple.length - 1]
            : undefined;
        return {
          display: displayTs,
          value: yVal,
          original:
            originalCandidate !== undefined &&
            originalCandidate !== displayTs
              ? originalCandidate
              : undefined,
        };
      }
      return undefined;
    };

    const toDate = (input: number | string | undefined): Date | undefined => {
      if (typeof input === "number") {
        return Number.isFinite(input) ? new Date(input) : undefined;
      }
      if (typeof input === "string") {
        const parsed = Date.parse(input);
        if (!Number.isNaN(parsed)) {
          return new Date(parsed);
        }
      }
      return undefined;
    };

    const firstTuple = extractTuple(items[0]);
    const headerDate = firstTuple ? toDate(firstTuple.display) : undefined;
    const header = headerDate ? `<strong>${this._formatDateTime(headerDate)}</strong>` : "";

    const rendered = new Set<string>();

    type StackAccumulator = {
      name: string;
      positive: number;
      negative: number;
      count: number;
      unit?: string | null;
      isCompare: boolean;
    };

    const stackTotals = new Map<string, StackAccumulator>();
    const groupData = {
      main: { header: undefined as string | undefined, lines: [] as string[], totals: [] as string[] },
      compare: {
        header: undefined as string | undefined,
        lines: [] as string[],
        totals: [] as string[],
      },
    };

    let firstCompareDisplay: number | undefined;
    let firstCompareOriginal: number | undefined;

    items.forEach((item, index) => {
      const seriesKey =
        (typeof item.seriesId === "string" ? item.seriesId : undefined) ??
        (typeof item.seriesName === "string" ? item.seriesName : undefined) ??
        (typeof item.seriesIndex === "number" ? String(item.seriesIndex) : undefined) ??
        String(index);

      if (rendered.has(seriesKey)) {
        return;
      }
      rendered.add(seriesKey);

      const seriesConfig = this._seriesConfigById.get(seriesKey);
      if (seriesConfig?.show_in_tooltip === false) {
        return;
      }

      const tuple = extractTuple(item);
      if (!tuple) {
        return;
      }
      const { display, value, original } = tuple;
      if (value === null || value === undefined || Number.isNaN(value)) {
        return;
      }

      const isCompare = seriesKey.endsWith("--compare");
      const groupKey = isCompare ? "compare" : "main";

      if (isCompare) {
        if (firstCompareDisplay === undefined) {
          firstCompareDisplay = display;
        }
        if (original !== undefined && firstCompareOriginal === undefined) {
          firstCompareOriginal = original;
        }
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
      groupData[groupKey as "main" | "compare"].lines.push(
        `${marker} ${item.seriesName ?? ""}: ${formattedValue}${unitLabel}`
      );
      if (isCompare && original !== undefined && !groupData.compare.header) {
        const compareDate = toDate(original);
        if (compareDate) {
          groupData.compare.header = `<strong>${this._formatDateTime(compareDate)}</strong>`;
        }
      }

      if (includeStackSums) {
        const stackName = seriesConfig?.stack?.trim();
        if (!stackName || stackName.startsWith("__energy_fill_")) {
          return;
        }
        const totalsKey = `${isCompare ? "compare" : "main"}::${stackName}`;
        const accumulator = stackTotals.get(totalsKey) ?? {
          name: stackName,
          positive: 0,
          negative: 0,
          count: 0,
          unit,
          isCompare,
        };
        if (accumulator.unit === undefined && unit !== undefined) {
          accumulator.unit = unit;
        }
        accumulator.count += 1;
        if (value > 0) {
          accumulator.positive += value;
        } else if (value < 0) {
          accumulator.negative += value;
        }
        stackTotals.set(totalsKey, accumulator);
      }
    });

    if (includeStackSums && stackTotals.size) {
      stackTotals.forEach((accumulator) => {
        if (accumulator.count < 2) {
          return;
        }
        const unitLabel =
          accumulator.unit && this._config?.show_unit !== false
            ? ` ${accumulator.unit}`
            : "";
        const format = (value: number) =>
          this._formatNumber(value, { maximumFractionDigits: precision });
        const prefix = accumulator.isCompare ? " (Compare)" : "";
        const targetGroup = accumulator.isCompare ? "compare" : "main";
        if (accumulator.positive > 0) {
          groupData[targetGroup].totals.push(
            `<strong>Total ${accumulator.name}${prefix} (pos): ${format(accumulator.positive)}${unitLabel}</strong>`
          );
        }
        if (accumulator.negative < 0) {
          groupData[targetGroup].totals.push(
            `<strong>Total ${accumulator.name}${prefix} (neg): ${format(accumulator.negative)}${unitLabel}</strong>`
          );
        }
      });
    }

    if (!groupData.compare.header) {
      const candidateOriginal =
        firstCompareOriginal !== undefined
          ? firstCompareOriginal
          : firstCompareDisplay !== undefined
            ? this._computeCompareOriginalTimestamp(firstCompareDisplay)
            : undefined;
      if (candidateOriginal !== undefined) {
        const compareDate = toDate(candidateOriginal);
        if (compareDate) {
          groupData.compare.header = `<strong>${this._formatDateTime(compareDate)}</strong>`;
        }
      }
    }

    const buildSection = (group: "main" | "compare"): string | undefined => {
      const parts: string[] = [];
      if (groupData[group].header) {
        parts.push(groupData[group].header!);
      }
      if (groupData[group].lines.length) {
        parts.push(groupData[group].lines.join("<br>"));
      }
      if (groupData[group].totals.length) {
        parts.push(groupData[group].totals.join("<br>"));
      }
      if (!parts.length) {
        return undefined;
      }
      return parts.join("<br>");
    };

    const bodySegments: string[] = [];
    const mainSection = buildSection("main");
    const compareSection = buildSection("compare");
    if (mainSection) {
      bodySegments.push(mainSection);
    }
    if (compareSection) {
      bodySegments.push(compareSection);
    }

    if (!bodySegments.length) {
      return header || "";
    }

    const body = bodySegments.join("<br><br>");
    if (!header) {
      return body;
    }
    return `${header}<br>${body}`;
  }

  private _computeCompareOriginalTimestamp(display: number): number | undefined {
    if (!this._periodStart || !this._comparePeriodStart) {
      return undefined;
    }

    const start = this._periodStart;
    const compareStart = this._comparePeriodStart;

    const compareYearDiff = differenceInYears(start, compareStart);
    if (
      compareYearDiff !== 0 &&
      start.getTime() === startOfYear(start).getTime()
    ) {
      return addYears(new Date(display), -compareYearDiff).getTime();
    }

    const compareMonthDiff = differenceInMonths(start, compareStart);
    if (
      compareMonthDiff !== 0 &&
      start.getTime() === startOfMonth(start).getTime()
    ) {
      return addMonths(new Date(display), -compareMonthDiff).getTime();
    }

    const compareDayDiff = differenceInDays(start, compareStart);
    if (
      compareDayDiff !== 0 &&
      start.getTime() === startOfDay(start).getTime()
    ) {
      return addDays(new Date(display), -compareDayDiff).getTime();
    }

    const compareOffset = start.getTime() - compareStart.getTime();
    return display - compareOffset;
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

  private _log(
    level: "debug" | "info" | "warn" | "error",
    message: string,
    details?: Record<string, unknown>
  ): void {
    const levelOrder = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    } as const;
    if (levelOrder[level] < levelOrder[ACTIVE_LOG_LEVEL]) {
      return;
    }
    const logger =
      (((console as unknown as Record<string, (...args: unknown[]) => void>)[level]) ??
        console.log).bind(console);
    if (details && Object.keys(details).length) {
      logger(`${LOG_PREFIX} ${message}`, details);
    } else {
      logger(`${LOG_PREFIX} ${message}`);
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
      display: flex;
      flex-direction: column;
    }

    .content--no-title {
      padding-top: 15px;
    }

    .chart ha-chart-base {
      flex: 1 1 auto;
      min-height: 0;
      width: 100%;
      display: block;
    }

    .chart.chart--section {
      --chart-max-height: none;
    }

    .chart.chart--section ha-chart-base {
      height: 100%;
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

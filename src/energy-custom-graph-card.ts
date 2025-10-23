import { html, css, LitElement, nothing } from "lit";
import type { PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant } from "custom-card-helpers";
import {
  addYears,
  differenceInDays,
  endOfDay,
  endOfYear,
  startOfDay,
  startOfYear,
} from "date-fns";
import {
  fetchStatistics,
  getStatisticMetadata,
  type Statistics,
  type StatisticsMetaData,
  type StatisticsPeriod,
} from "./data/statistics";
import type {
  EnergyCustomGraphCardConfig,
  EnergyCustomGraphSeriesConfig,
  EnergyCustomGraphPeriodConfig,
  EnergyCustomGraphAxisConfig,
} from "./types";
import {
  subscribeEnergyCollection,
  type EnergyCollection,
} from "./energy/collection";
import { buildSeries } from "./chart/series-builder";
import type {
  SeriesOption,
  ECOption,
  LegendOption,
  YAxisOption,
} from "./types/echarts";

const DEFAULT_PERIOD: EnergyCustomGraphPeriodConfig = { mode: "energy" };

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

  private static readonly FALLBACK_WARNING =
    "[energy-custom-graph-card] Falling back to default period because energy date selection is unavailable.";

  private static readonly DEFAULT_STAT_TYPE = "change";

  public connectedCallback(): void {
    super.connectedCallback();
    if (this.hass && this._config) {
      this._syncWithConfig();
    }
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this._teardownEnergyCollection();
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

    if (needsEnergyCollection || neededBefore) {
      const collectionKeyChanged =
        oldConfig?.collection_key !== this._config.collection_key;
      const selectionFlagChanged =
        oldConfig?.energy_date_selection !== this._config.energy_date_selection;
      if (
        collectionKeyChanged ||
        selectionFlagChanged ||
        (!this._energyCollection && needsEnergyCollection)
      ) {
        this._setupEnergyCollection();
      }
    }

    const periodChanged = this._recalculatePeriod();
    const seriesChanged =
      !!oldConfig &&
      JSON.stringify(oldConfig.series) !== JSON.stringify(this._config.series);

    if (periodChanged || seriesChanged || !this._statistics) {
      void this._loadStatistics();
    }
  }

  private _needsEnergyCollection(
    config?: EnergyCustomGraphCardConfig
  ): boolean {
    return Boolean(config?.energy_date_selection);
  }

  private _setupEnergyCollection(): void {
    this._teardownEnergyCollection();
    if (!this._config?.energy_date_selection || !this.hass) {
      return;
    }

    this._energyCollection = subscribeEnergyCollection(
      this.hass,
      (data) => {
        this._energyStart = data.start;
        this._energyEnd = data.end ?? undefined;
        const periodChanged = this._recalculatePeriod();
        if (periodChanged) {
          void this._loadStatistics();
        }
      },
      this._config.collection_key
        ? { key: this._config.collection_key }
        : undefined
    );
  }

  private _teardownEnergyCollection(): void {
    this._energyCollection?.unsubscribe();
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
    const periodConfig = this._config.period ?? DEFAULT_PERIOD;

    switch (periodConfig.mode) {
      case "energy": {
        if (this._config.energy_date_selection) {
          const energyRange = this._getEnergyRange();
          if (!energyRange) {
            return undefined;
          }
          return energyRange;
        }
        if (!this._loggedEnergyFallback) {
          console.warn(EnergyCustomGraphCard.FALLBACK_WARNING);
          this._loggedEnergyFallback = true;
        }
        return this._defaultEnergyRange();
      }
      case "relative": {
        const base = this._config.energy_date_selection
          ? this._getEnergyRange()
          : this._defaultRelativeBase(periodConfig.unit);
        if (!base) {
          return undefined;
        }
        const offset = periodConfig.offset ?? 0;
        if (periodConfig.unit === "year") {
          const start = addYears(base.start, offset);
          const end = base.end
            ? addYears(base.end, offset)
            : endOfYear(addYears(base.start, offset));
          return { start, end };
        }
        return base;
      }
      case "fixed": {
        const start = new Date(periodConfig.start);
        if (Number.isNaN(start.getTime())) {
          throw new Error("Invalid start date in fixed period configuration");
        }
        const end = periodConfig.end ? new Date(periodConfig.end) : undefined;
        if (end && Number.isNaN(end.getTime())) {
          throw new Error("Invalid end date in fixed period configuration");
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

  private _loggedEnergyFallback = false;

  private _defaultRelativeBase(unit: "year"): { start: Date; end: Date } {
    if (unit === "year") {
      const now = new Date();
      return {
        start: startOfYear(now),
        end: endOfYear(now),
      };
    }
    return this._defaultEnergyRange();
  }

  private async _loadStatistics(): Promise<void> {
    if (!this._config || !this.hass || !this._periodStart) {
      return;
    }

    const statisticIds = Array.from(
      new Set(this._config.series.map((item) => item.statistic_id))
    );
    if (!statisticIds.length) {
      this._statistics = undefined;
      this._metadata = undefined;
      return;
    }

    const statTypes = Array.from(
      new Set(
        this._config.series.map(
          (series) => series.stat_type ?? EnergyCustomGraphCard.DEFAULT_STAT_TYPE
        )
      )
    );

    const statsPeriod = this._determineStatisticsPeriod(
      this._periodStart,
      this._periodEnd
    );

    const fetchId = ++this._activeFetch;
    const loadingAtStart = !this._statistics;
    if (loadingAtStart) {
      this._isLoading = true;
    }

    try {
      const [metadataArray, statistics] = await Promise.all([
        getStatisticMetadata(this.hass, statisticIds),
        fetchStatistics(
          this.hass,
          this._periodStart,
          this._periodEnd,
          statisticIds,
          statsPeriod,
          undefined,
          statTypes
        ),
      ]);

      if (fetchId !== this._activeFetch) {
        return;
      }

      const metadata: Record<string, StatisticsMetaData> = {};
      metadataArray.forEach((item) => {
        metadata[item.statistic_id] = item;
      });

      this._metadata = metadata;
      this._statistics = statistics;
    } catch (error) {
      if (fetchId === this._activeFetch) {
        console.error(
          "[energy-custom-graph-card] Failed to load statistics",
          error
        );
        this._metadata = undefined;
        this._statistics = undefined;
      }
    } finally {
      if (fetchId === this._activeFetch && loadingAtStart) {
        this._isLoading = false;
      }
    }
  }

  private _determineStatisticsPeriod(
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

  public static getStubConfig(): EnergyCustomGraphCardConfig {
    return {
      type: "energy-custom-graph-card",
      series: [],
    };
  }

  public setConfig(config: EnergyCustomGraphCardConfig): void {
    if (!config.series || !Array.isArray(config.series) || !config.series.length) {
      throw new Error("At least one series must be configured");
    }

    config.series.forEach((series: EnergyCustomGraphSeriesConfig, index) => {
      if (!series || !series.statistic_id) {
        throw new Error(`Series at index ${index} is missing a statistic_id`);
      }
    });

    const oldConfig = this._config;
    this._config = {
      ...config,
      period: config.period ?? DEFAULT_PERIOD,
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

    const hasData = this._chartData.some(
      (series) =>
        Array.isArray(series.data) &&
        series.data.some(
          (point) =>
            point !== null &&
            point !== undefined &&
            Array.isArray(point) &&
            point[1] !== null &&
            point[1] !== undefined
        )
    );

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
    });

    if (!series.length) {
      this._chartData = [];
      this._chartOptions = undefined;
      this._unitsBySeries = new Map();
      return;
    }

    const { yAxis, axisUnitByIndex } = this._buildYAxisOptions(seriesById);

    this._unitsBySeries = new Map();
    series.forEach((item) => {
      const axisIndex = item.yAxisIndex ?? 0;
      const axisUnit =
        axisUnitByIndex.get(axisIndex) ??
        (this._config.show_unit === false ? undefined : unitBySeries.get(item.id ?? ""));
      this._unitsBySeries.set(item.id ?? "", axisUnit);
    });

    const legendOption = this._buildLegendOption(legend);

    const xAxis = [
      {
        id: "primary",
        type: "time",
        min: this._periodStart,
        max: this._periodEnd ?? new Date(),
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
    seriesById: Map<string, EnergyCustomGraphSeriesConfig>
  ): { yAxis: YAxisOption[]; axisUnitByIndex: Map<number, string | undefined> } {
    const axisConfigs = this._config?.y_axes ?? [];
    const leftConfig = axisConfigs.find((axis) => axis.id === "left");
    const rightConfig = axisConfigs.find((axis) => axis.id === "right");

    const usesRight =
      !!rightConfig ||
      Array.from(seriesById.values()).some((series) => series.y_axis === "right");

    const axisUnitByIndex = new Map<number, string | undefined>();
    const yAxis: YAxisOption[] = [];

    const createAxis = (
      axisConfig: EnergyCustomGraphAxisConfig | undefined,
      index: number
    ): YAxisOption => {
      const fit =
        axisConfig?.fit_y_data ?? this._config?.fit_y_data ?? false;
      const logarithmic = axisConfig?.logarithmic_scale ?? this._config?.logarithmic_scale ?? false;
      axisUnitByIndex.set(index, axisConfig?.unit);
      return {
        type: logarithmic ? "log" : "value",
        name: axisConfig?.unit,
        nameGap: axisConfig?.unit ? 2 : 0,
        nameTextStyle: {
          align: "left",
        },
        position: index === 0 ? "left" : "right",
        min: axisConfig?.min,
        max: axisConfig?.max,
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
      padding: 16px;
    }

    .content {
      flex: 1;
      padding: 16px;
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

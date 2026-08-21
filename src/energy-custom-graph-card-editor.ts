import { css, html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";
import { fireEvent } from "custom-card-helpers";
import type {
  EnergyCustomGraphAggregationConfig,
  EnergyCustomGraphAxisConfig,
  EnergyCustomGraphCalculationConfig,
  EnergyCustomGraphCalculationTerm,
  EnergyCustomGraphCardConfig,
  EnergyCustomGraphChartType,
  EnergyCustomGraphSeriesConfig,
  EnergyCustomGraphStatisticType,
  EnergyCustomGraphTimespanConfig,
  EnergyCustomGraphAggregationTarget,
  EnergyCustomGraphRawOptions,
  EnergyCustomGraphRelativeCalendarPeriod,
  EnergyCustomGraphRelativePeriod,
  EnergyCustomGraphTimeOffsetUnit,
  EnergyCustomGraphHeaderCalculationConfig,
  EnergyCustomGraphHeaderCalculationTermConfig,
  EnergyCustomGraphHeaderChipConfig,
  EnergyCustomGraphHeaderMetricConfig,
  EnergyCustomGraphHeaderReducer,
  EnergyCustomGraphHeaderStackSign,
} from "./types";
import { DEFAULT_COLORS } from "./chart/series-builder";
import { fetchEnergyPreferences } from "./data/energy";
import {
  getStatisticLabel,
  getStatisticMetadata,
  type StatisticsMetaData,
} from "./data/statistics";
import {
  aggregationUsesRaw,
  cleanSeriesForForecast,
  cloneSeriesForDuplicate,
  convertSeriesToCalculation,
  convertSeriesToStatistic,
  formatAggregationTarget,
  getStatisticSourceIssue,
  isStatisticTypeSupported,
  normalizeStatisticId,
  resolveSeriesSource,
  resolveStatisticSourceStatus,
  selectDefaultStatisticType,
  seriesHasTimeOffset,
  type EditorHintSeverity,
  type EditorIssue,
  type StatisticSourceResolution,
} from "./editor-helpers";

const ENERGY_COLOR_PRESETS: Array<{ label: string; value: string }> = [
  { label: "Grid Import • Blue", value: "--energy-grid-consumption-color" },
  { label: "Grid Export • Purple", value: "--energy-grid-return-color" },
  { label: "Solar • Orange", value: "--energy-solar-color" },
  { label: "Battery In • Pink", value: "--energy-battery-in-color" },
  { label: "Battery Out • Teal", value: "--energy-battery-out-color" },
  { label: "Gas • Dark Red", value: "--energy-gas-color" },
  { label: "Water • Cyan", value: "--energy-water-color" },
  { label: "Non-Fossil • Green", value: "--energy-non-fossil-color" },
];

const STAT_TYPE_OPTIONS: Array<{ value: EnergyCustomGraphStatisticType; label: string }> = [
  { value: "change", label: "Change" },
  { value: "sum", label: "Sum" },
  { value: "mean", label: "Mean" },
  { value: "min", label: "Min" },
  { value: "max", label: "Max" },
  { value: "state", label: "State" },
];

const AGGREGATION_OPTIONS: Array<{ value: EnergyCustomGraphAggregationTarget; label: string }> = [
  { value: "5minute", label: "5 minute" },
  { value: "hour", label: "Hour" },
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
  { value: "disabled", label: "Disable fetching" },
  { value: "raw", label: "RAW history" },
];

const TIME_OFFSET_UNIT_OPTIONS: Array<{ value: EnergyCustomGraphTimeOffsetUnit; label: string }> = [
  { value: "hour", label: "Hour" },
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

const HEADER_REDUCER_OPTIONS: Array<{ value: EnergyCustomGraphHeaderReducer; label: string }> = [
  { value: "sum", label: "Sum" },
  { value: "mean", label: "Mean" },
  { value: "min", label: "Min" },
  { value: "max", label: "Max" },
  { value: "first", label: "First" },
  { value: "last", label: "Last" },
];

const HEADER_STACK_SIGN_OPTIONS: Array<{ value: EnergyCustomGraphHeaderStackSign; label: string }> = [
  { value: "signed", label: "Signed" },
  { value: "positive", label: "Positive only" },
  { value: "negative", label: "Negative only" },
  { value: "absolute", label: "Absolute" },
];

const TIME_OFFSET_UNITS = new Set<EnergyCustomGraphTimeOffsetUnit>(
  TIME_OFFSET_UNIT_OPTIONS.map((option) => option.value)
);

const isTimeOffsetUnit = (unit: unknown): unit is EnergyCustomGraphTimeOffsetUnit =>
  typeof unit === "string" && TIME_OFFSET_UNITS.has(unit as EnergyCustomGraphTimeOffsetUnit);

type AggregationPickerKey = "hour" | "day" | "week" | "month" | "year";
const RELATIVE_CALENDAR_PERIODS = new Set<EnergyCustomGraphRelativeCalendarPeriod>([
  "hour",
  "day",
  "week",
  "month",
  "year",
]);

const isRelativeCalendarPeriod = (
  period: EnergyCustomGraphRelativePeriod
): period is EnergyCustomGraphRelativeCalendarPeriod =>
  RELATIVE_CALENDAR_PERIODS.has(period as EnergyCustomGraphRelativeCalendarPeriod);

const COLOR_SELECT_DEFAULT = "__default__";
const COLOR_SELECT_CUSTOM = "__custom__";
const COLOR_SELECT_INHERIT = "__inherit__";

interface EditorTextInputConfig {
  label: string;
  value: string;
  helper?: string;
  type?: string;
  step?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  onInput: (value: string, ev: Event) => void;
}

type SeriesOptionGroup = "source" | "style" | "visibility" | "transform";

const SERIES_OPTION_GROUPS = new Set<SeriesOptionGroup>([
  "source",
  "style",
  "visibility",
  "transform",
]);

@customElement("energy-custom-graph-card-editor")
export class EnergyCustomGraphCardEditor
  extends LitElement
  implements LovelaceCardEditor
{
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config?: EnergyCustomGraphCardConfig;

  @state() private _headerExpanded = false;
  @state() private _chartSettingsExpanded = true;
  @state() private _seriesSectionExpanded = true;
  @state() private _legendExpanded = false;
  @state() private _tooltipExpanded = false;
  @state() private _chartMoreExpanded = false;
  @state() private _headerMetricMoreExpanded = false;
  @state() private _expandedSeries = new Set<number>();
  @state() private _seriesOptionGroupsExpanded = new Map<string, boolean>();
  @state() private _seriesStyleMoreExpanded = new Set<number>();
  @state() private _seriesSourceMoreExpanded = new Set<number>();
  @state() private _expandedTermKeys = new Set<string>();
  @state() private _expandedHeaderTermKeys = new Set<number>();
  @state() private _axesExpanded = false;
  @state() private _aggregationExpanded = true;
  @state() private _customColorDrafts: Map<number, string> = new Map();
  @state() private _colorModeSelections: Map<number, string> = new Map();
  @state() private _compareCustomColorDrafts: Map<number, string> = new Map();
  @state() private _compareColorModeSelections: Map<number, string> = new Map();
  @state() private _metadataByStatisticId: Map<string, StatisticsMetaData | undefined> = new Map();
  @state() private _solarProductionOptions: Array<{ value: string; label: string; hasForecast: boolean }> = [];
  @state() private _solarOptionsLoading = false;
  @state() private _solarOptionsError?: string;

  private _metadataRequests = new Set<string>();

  async connectedCallback() {
    super.connectedCallback();
    void this._preloadEditorElements();
    void this._loadSolarProductionOptions();
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);
    if (changedProps.has("hass")) {
      void this._loadSolarProductionOptions();
      if (this._config) {
        void this._ensureStatisticMetadataForConfig(this._config);
      }
    }
  }

  private async _preloadEditorElements() {
    const needsEntityPicker = !customElements.get("ha-entity-picker");
    const needsStateIcon = !customElements.get("ha-state-icon");
    const needsExpansionPanel = !customElements.get("ha-expansion-panel");
    const needsButtonToggleGroup = !customElements.get("ha-button-toggle-group");
    const needsNativeListElements =
      !customElements.get("ha-button") ||
      !customElements.get("ha-icon-button") ||
      !customElements.get("ha-sortable");
    if (
      !needsEntityPicker &&
      !needsStateIcon &&
      !needsExpansionPanel &&
      !needsButtonToggleGroup &&
      !needsNativeListElements
    ) {
      return;
    }

    try {
      const helpers = await (window as any).loadCardHelpers();
      const preloaders: Promise<void>[] = [];
      if (needsEntityPicker || needsStateIcon) {
        preloaders.push(
          this._preloadCardEditor(helpers, { type: "entities", entities: [] })
        );
      }
      if (needsExpansionPanel || needsButtonToggleGroup || needsNativeListElements) {
        preloaders.push(
          this._preloadCardEditor(helpers, {
            type: "tile",
            entity: "sensor.energy_custom_graph_preload",
          })
        );
      }
      await Promise.allSettled(preloaders);
      if (needsButtonToggleGroup) {
        await this._preloadButtonToggleGroup();
      }
      this.requestUpdate();
    } catch (e) {
      // The editor can still use whatever HA elements are already registered.
      console.debug("Energy Custom Graph: Could not preload editor elements", e);
    }
  }

  private async _preloadCardEditor(
    helpers: any,
    config: Record<string, unknown>
  ) {
    const card = await helpers.createCardElement(config);
    await card.constructor.getConfigElement();
  }

  private async _preloadButtonToggleGroup() {
    if (customElements.get("ha-button-toggle-group") || !this.hass) {
      return;
    }
    if (!customElements.get("ha-selector")) {
      return;
    }

    const selector = document.createElement("ha-selector") as HTMLElement & {
      hass?: HomeAssistant;
      selector?: Record<string, unknown>;
      value?: string;
      required?: boolean;
    };
    selector.hass = this.hass;
    selector.selector = {
      button_toggle: {
        options: [
          { value: "a", label: "A" },
          { value: "b", label: "B" },
        ],
      },
    };
    selector.value = "a";
    selector.required = false;
    selector.style.display = "none";
    selector.style.position = "absolute";
    selector.style.pointerEvents = "none";
    this.appendChild(selector);

    const buttonToggleDefined = customElements
      .whenDefined("ha-button-toggle-group")
      .then(() => this.requestUpdate());
    try {
      await Promise.race([
        buttonToggleDefined,
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);
    } finally {
      selector.remove();
    }
  }

  private async _loadSolarProductionOptions() {
    if (!this.hass) {
      return;
    }
    this._solarOptionsLoading = true;
    try {
      const prefs = await fetchEnergyPreferences(this.hass);
      const options: Array<{ value: string; label: string; hasForecast: boolean }> = [];
      prefs.energy_sources?.forEach((source: any) => {
        if (source?.type !== "solar" || typeof source.stat_energy_from !== "string") {
          return;
        }
        const value = source.stat_energy_from;
        if (!value) {
          return;
        }
        const label = this._formatPvProductionLabel(value);
        const hasForecast = Array.isArray(source.config_entry_solar_forecast)
          ? source.config_entry_solar_forecast.length > 0
          : false;
        options.push({ value, label, hasForecast });
      });
      this._solarProductionOptions = options;
      this._solarOptionsError = undefined;
    } catch (error) {
      this._solarOptionsError = error instanceof Error ? error.message : String(error);
      this._solarProductionOptions = [];
    } finally {
      this._solarOptionsLoading = false;
    }
  }

  private _formatPvProductionLabel(statisticId: string): string {
    if (!statisticId) {
      return "";
    }
    const friendlyName = this.hass?.states?.[statisticId]?.attributes?.friendly_name;
    if (friendlyName && friendlyName.trim().length) {
      return `${friendlyName} (${statisticId})`;
    }
    return statisticId;
  }

  private _collectStatisticIds(
    config: EnergyCustomGraphCardConfig
  ): string[] {
    const ids = new Set<string>();
    (config.series ?? []).forEach((series) => {
      if (this._resolveSeriesSource(series) === "statistic") {
        const id = normalizeStatisticId(series.statistic_id);
        if (id) {
          ids.add(id);
        }
      }
      series.calculation?.terms?.forEach((term) => {
        const id = normalizeStatisticId(term.statistic_id);
        if (id) {
          ids.add(id);
        }
      });
    });
    return Array.from(ids);
  }

  private async _ensureStatisticMetadataForConfig(
    config: EnergyCustomGraphCardConfig
  ) {
    await this._ensureStatisticMetadata(this._collectStatisticIds(config));
  }

  private async _ensureStatisticMetadata(ids: string[]) {
    if (!this.hass) {
      return;
    }

    const missing = ids
      .map((id) => id.trim())
      .filter(
        (id) =>
          id &&
          !this._metadataByStatisticId.has(id) &&
          !this._metadataRequests.has(id)
      );
    if (!missing.length) {
      return;
    }

    missing.forEach((id) => this._metadataRequests.add(id));
    try {
      const metadata = await getStatisticMetadata(this.hass, missing);
      const found = new Map<string, StatisticsMetaData>();
      metadata.forEach((item) => {
        found.set(item.statistic_id, item);
      });
      const next = new Map(this._metadataByStatisticId);
      missing.forEach((id) => next.set(id, found.get(id)));
      this._metadataByStatisticId = next;
    } catch (error) {
      console.debug(
        "Energy Custom Graph: Could not load statistic metadata",
        error
      );
    } finally {
      missing.forEach((id) => this._metadataRequests.delete(id));
    }
  }

  private _getStatisticMetadata(
    statisticId: string | undefined
  ): StatisticsMetaData | undefined {
    const id = normalizeStatisticId(statisticId);
    return id ? this._metadataByStatisticId.get(id) : undefined;
  }

  private _isStatisticMetadataLoaded(statisticId: string | undefined): boolean {
    const id = normalizeStatisticId(statisticId);
    return !id || this._metadataByStatisticId.has(id);
  }

  private _resolveStatisticSource(
    statisticId: string | undefined
  ): StatisticSourceResolution {
    const id = normalizeStatisticId(statisticId);
    return resolveStatisticSourceStatus({
      statisticId: id,
      hasEntity: Boolean(id && this.hass?.states?.[id]),
      metadata: this._getStatisticMetadata(id),
      metadataLoaded: this._isStatisticMetadataLoaded(id),
    });
  }

  private _resolveSeriesSource(series: EnergyCustomGraphSeriesConfig): "statistic" | "calculation" | "forecast" {
    return resolveSeriesSource(series);
  }

  private _renderTextInput({
    label,
    value,
    helper,
    type = "text",
    step,
    min,
    max,
    disabled = false,
    onInput,
  }: EditorTextInputConfig) {
    const handleInput = (ev: Event) => {
      onInput((ev.target as HTMLInputElement).value ?? "", ev);
    };

    return html`
      <div class="field native-text-input">
        <label>${label}</label>
        <input
          .type=${type}
          .value=${value}
          .step=${step ?? ""}
          .min=${min ?? ""}
          .max=${max ?? ""}
          ?disabled=${disabled}
          @input=${handleInput}
        />
        ${helper ? html`<span class="hint">${helper}</span>` : nothing}
      </div>
    `;
  }

  private _renderNativeAddButton(label: string, onClick: (ev: Event) => void) {
    return html`
      <ha-button
        class="native-add-button"
        size="s"
        appearance="filled"
        @click=${onClick}
      >
        <ha-icon slot="start" icon="mdi:plus"></ha-icon>
        ${label}
      </ha-button>
    `;
  }

  private _renderDragHandle(handleClass: string, label: string) {
    return html`
      <span
        class="drag-handle ${handleClass}"
        title=${label}
        @click=${(ev: Event) => ev.stopPropagation()}
      >
        <ha-icon icon="mdi:drag-horizontal-variant"></ha-icon>
      </span>
    `;
  }

  private _normalizeSeriesIds(
    series: EnergyCustomGraphSeriesConfig[]
  ): EnergyCustomGraphSeriesConfig[] {
    const used = new Set<string>();
    return series.map((item, index) => {
      const current =
        typeof item.id === "string" && item.id.trim().length
          ? item.id.trim()
          : undefined;
      const id =
        current && !used.has(current)
          ? current
          : this._createUniqueSeriesId(item, index, used);
      used.add(id);
      return item.id === id ? item : { ...item, id };
    });
  }

  private _createUniqueSeriesId(
    series: EnergyCustomGraphSeriesConfig,
    index: number,
    used: Set<string>
  ): string {
    const base =
      this._sanitizeSeriesId(
        series.statistic_id?.split(".").pop() ??
          series.name ??
          series.pv_production_entity?.split(".").pop() ??
          (series.calculation
            ? "calculation"
            : series.source === "forecast"
              ? "forecast"
              : "series")
      ) || `series_${index + 1}`;
    let candidate = base;
    let suffix = 2;
    while (used.has(candidate)) {
      candidate = `${base}_${suffix}`;
      suffix += 1;
    }
    return candidate;
  }

  private _sanitizeSeriesId(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/gu, "_")
      .replace(/^_+|_+$/gu, "");
  }

  public setConfig(config: EnergyCustomGraphCardConfig): void {
    const hadConfig = this._config !== undefined;
    const normalizedSeries = config.series?.map((item) => {
      const normalized = { ...item };
      if (item.time_offset) {
        normalized.time_offset = { ...item.time_offset };
      }
      if (item.calculation) {
        normalized.calculation = {
          ...item.calculation,
          terms: (item.calculation.terms ?? []).map((term) => ({ ...term })),
        };
      }
      return normalized;
    }) ?? [];
    const normalizedSeriesWithIds = this._normalizeSeriesIds(normalizedSeries);
    const nextConfig: EnergyCustomGraphCardConfig = {
      ...config,
      series: normalizedSeriesWithIds,
    };
    nextConfig.type = "custom:energy-custom-graph-card";
    nextConfig.timespan = config.timespan ?? { mode: "energy" };
    this._config = nextConfig;
    this._syncCustomColorDrafts(normalizedSeriesWithIds);
    this._syncColorSelections(normalizedSeriesWithIds);
    this._syncCompareCustomColorDrafts(normalizedSeriesWithIds);
    this._syncCompareColorSelections(normalizedSeriesWithIds);
    void this._ensureStatisticMetadataForConfig(nextConfig);

    if (!hadConfig) {
      this._expandedSeries = new Set();
      this._expandedTermKeys = new Set();
      this._headerExpanded = false;
    } else {
      this._syncExpandedState(normalizedSeriesWithIds);
    }
  }

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    return html`
      <div class="editor-container">
        ${this._renderCardHeaderEditorSection(this._config)}
        ${this._renderChartSettingsSection(this._config)}
        ${this._renderSeriesEditorSection()}
      </div>
    `;
  }

  private _renderCardHeaderEditorSection(cfg: EnergyCustomGraphCardConfig) {
    const expanded = this._headerExpanded;
    return this._renderEditorSection({
      title: "Card header",
      icon: "mdi:credit-card",
      summary: this._formatCardHeaderSummary(cfg),
      expanded,
      onToggle: () => {
        this._headerExpanded = !expanded;
      },
      body: html`
        <div class="section">
          ${this._renderTextInput({
            label: this.hass.localize("ui.panel.lovelace.editor.card.generic.title"),
            value: cfg.title ?? "",
            onInput: (value) => this._updateConfig("title", value || undefined),
          })}
          ${this._renderHeaderSection(cfg)}
        </div>
      `,
    });
  }

  private _renderChartSettingsSection(cfg: EnergyCustomGraphCardConfig) {
    const expanded = this._chartSettingsExpanded;
    return this._renderEditorSection({
      title: "Chart settings",
      icon: "mdi:cog",
      summary: this._formatChartSettingsSummary(cfg),
      expanded,
      onToggle: () => {
        this._chartSettingsExpanded = !expanded;
      },
      body: html`
        ${this._renderTimespanSection(cfg)}
        ${this._renderAggregationSection(cfg)}
        ${this._renderAxesSection(cfg)}
        ${this._renderLegendSection(cfg)}
        ${this._renderTooltipSection(cfg)}
        ${this._renderChartMoreOptions(cfg)}
      `,
    });
  }

  private _renderSeriesEditorSection() {
    const series = this._config!.series ?? [];
    const expanded = this._seriesSectionExpanded;
    return this._renderExpansionPanel({
      title: "Series",
      icon: "mdi:chart-box-multiple",
      summary: this._formatSeriesSectionSummary(series),
      expanded,
      onToggle: () => {
        this._seriesSectionExpanded = !expanded;
      },
      body: html`
        <div class="series-list">
          ${series.length
            ? html`
                <ha-sortable
                  handle-selector=".series-drag-handle"
                  draggable-selector=".series-sortable-item"
                  @item-moved=${this._handleSeriesMoved}
                >
                  <div class="native-sortable-list">
                    ${series.map(
                      (serie, index) => html`
                        <div class="series-sortable-item">
                          ${this._renderSeriesCard(serie, index)}
                        </div>
                      `
                    )}
                  </div>
                </ha-sortable>
              `
            : html`
                <div class="empty-state">
                  <p class="hint">No series configured yet.</p>
                </div>
              `}
          ${this._renderNativeAddButton("Add series", () => this._addSeries())}
        </div>
      `,
      className: "editor-section series-section",
    });
  }

  private _renderEditorSection({
    title,
    icon,
    summary,
    expanded,
    onToggle,
    body,
  }: {
    title: string;
    icon?: string;
    summary?: unknown;
    expanded: boolean;
    onToggle: () => void;
    body: unknown;
  }) {
    return this._renderExpansionPanel({
      title,
      icon,
      summary,
      expanded,
      onToggle,
      body,
      className: "editor-section",
    });
  }

  private _renderExpansionPanel({
    title,
    icon,
    summary,
    expanded,
    onToggle,
    body,
    actions,
    actionsSlot = "icons",
    leading,
    className,
  }: {
    title: string;
    icon?: string;
    summary?: unknown;
    expanded: boolean;
    onToggle: () => void;
    body: unknown;
    actions?: unknown;
    actionsSlot?: "event" | "icons";
    leading?: unknown;
    className?: string;
  }) {
    return html`
      <ha-expansion-panel
        outlined
        class=${className ?? ""}
        .expanded=${expanded}
        @expanded-changed=${(ev: CustomEvent<{ expanded: boolean }>) =>
          this._handleExpansionChanged(ev, onToggle)}
      >
        ${leading
          ? html`<div slot="leading-icon" class="panel-leading">${leading}</div>`
          : icon
            ? html`<ha-icon slot="leading-icon" icon=${icon}></ha-icon>`
            : nothing}
        <div slot="header" class="panel-heading">
          <div class="panel-title" title=${title}>${title}</div>
          ${summary ? html`<div class="panel-summary">${summary}</div>` : nothing}
        </div>
        ${actions
          ? html`
              <div
                slot=${actionsSlot}
                class="panel-actions"
                @click=${(ev: Event) => ev.stopPropagation()}
                @keydown=${(ev: Event) => ev.stopPropagation()}
              >
                ${actions}
              </div>
            `
          : nothing}
        <div class="panel-body">${body}</div>
      </ha-expansion-panel>
    `;
  }

  private _handleExpansionChanged(
    ev: CustomEvent<{ expanded: boolean }>,
    onToggle: () => void
  ) {
    if (ev.target !== ev.currentTarget) {
      return;
    }
    ev.stopPropagation();
    onToggle();
  }

  private _renderButtonToggleGroup<T extends string>(
    buttons: Array<{ value: T; label: string }>,
    active: T,
    onChange: (value: T) => void
  ) {
    return html`
      <ha-button-toggle-group
        .buttons=${buttons}
        .active=${active}
        size="m"
        .fullWidth=${true}
        @value-changed=${(ev: CustomEvent<{ value: T }>) =>
          onChange(ev.detail.value)}
      ></ha-button-toggle-group>
    `;
  }

  private _renderAggregationSection(cfg: EnergyCustomGraphCardConfig) {
    const isEnergyMode = cfg.timespan?.mode === "energy";
    const aggregationConfig = cfg.aggregation;
    const pickerAggregation = aggregationConfig?.energy_picker ?? {};
    const aggregationExpanded = this._aggregationExpanded;
    const aggregationSummary = this._formatAggregationSummary(
      aggregationConfig,
      isEnergyMode
    );
    return this._renderExpansionPanel({
      title: "Aggregation",
      icon: "mdi:clock-fast",
      summary: aggregationSummary ?? "Automatic",
      expanded: aggregationExpanded,
      onToggle: () => this._toggleAggregationExpanded(),
      body: html`
        <div class="aggregation-body">
          ${isEnergyMode
            ? html`
                ${this._renderAggregationPickerOptions(pickerAggregation)}
                ${this._renderAggregationFallbackField(aggregationConfig)}
              `
            : this._renderAggregationManualOptions(aggregationConfig)}
          ${this._renderRawOptions(aggregationConfig)}
          ${this._renderComputeCurrentHourOption(aggregationConfig)}
        </div>
      `,
      className: "general-collapsible",
    });
  }

  private _renderAggregationFallbackField(
    aggregation: EnergyCustomGraphAggregationConfig | undefined
  ) {
    const current = aggregation?.fallback ?? "";
    return html`
      <div class="section">
        <div class="field">
          <label>Fallback aggregation</label>
          <select
            @change=${(ev: Event) =>
              this._updateAggregation("fallback", (ev.target as HTMLSelectElement).value || "")}
          >
            <option value="" ?selected=${current === ""}>None</option>
            ${AGGREGATION_OPTIONS.map(
              (option) =>
                html`<option value=${option.value} ?selected=${current === option.value}
                  >${option.label}</option
                >`
            )}
          </select>
        </div>
      </div>
    `;
  }

  private _renderChartMoreOptions(cfg: EnergyCustomGraphCardConfig) {
    const count = cfg.chart_height ? 1 : 0;
    const expanded = this._chartMoreExpanded || count > 0;
    return this._renderMoreBlock({
      count,
      expanded,
      onToggle: () => {
        this._chartMoreExpanded = !expanded;
      },
      body: html`
        ${this._renderTextInput({
          label: "Chart height",
          helper: "CSS height, ignored in section layout.",
          value: cfg.chart_height ?? "",
          onInput: (value) =>
            this._updateConfig("chart_height", value || undefined),
        })}
      `,
    });
  }

  private _renderMoreBlock({
    count,
    expanded,
    onToggle,
    body,
  }: {
    count: number;
    expanded: boolean;
    onToggle: () => void;
    body: unknown;
  }) {
    return this._renderExpansionPanel({
      title: count > 0 ? `More · ${count} set` : "More",
      icon: "mdi:dots-horizontal",
      expanded,
      onToggle,
      body,
      className: "more-block",
    });
  }

  private _cardHeaderHasContent(cfg: EnergyCustomGraphCardConfig): boolean {
    return Boolean(cfg.title?.trim() || cfg.header?.chip);
  }

  private _formatCardHeaderSummary(cfg: EnergyCustomGraphCardConfig): string {
    const parts: string[] = [];
    if (cfg.title?.trim()) {
      parts.push(`Title: ${cfg.title.trim()}`);
    } else {
      parts.push("No Title");
    }
    parts.push(cfg.header?.chip ? "Chip on" : "No chip");
    return parts.join(" · ");
  }

  private _formatChartSettingsSummary(cfg: EnergyCustomGraphCardConfig): string {
    const parts = [this._formatTimespanSummary(cfg.timespan ?? { mode: "energy" })];
    const aggregation = this._formatChartAggregationSummary(
      cfg.aggregation,
      cfg.timespan?.mode === "energy"
    );
    if (aggregation) {
      parts.push(aggregation);
    }
    if (cfg.timespan?.mode === "energy" && this._hasAnySeriesTimeOffset()) {
      parts.push("Compare disabled by time offset");
    }
    return parts.join(" · ");
  }

  private _formatChartAggregationSummary(
    aggregation: EnergyCustomGraphAggregationConfig | undefined,
    useEnergyPicker: boolean
  ): string | undefined {
    if (!aggregation || Object.keys(aggregation).length === 0) {
      return undefined;
    }
    if (!useEnergyPicker && aggregation.manual) {
      return `Aggregation: ${this._formatStatisticsPeriod(aggregation.manual)}`;
    }
    if (
      useEnergyPicker &&
      aggregation.energy_picker &&
      Object.keys(aggregation.energy_picker).length
    ) {
      return "Aggregation: picker overrides";
    }
    return undefined;
  }

  private _formatTimespanSummary(timespan: EnergyCustomGraphTimespanConfig): string {
    if (timespan.mode === "fixed") {
      return `Fixed: ${timespan.start ?? "Start"} to ${timespan.end ?? "End"}`;
    }
    if (timespan.mode === "relative") {
      const count =
        isRelativeCalendarPeriod(timespan.period) && timespan.count
          ? `${timespan.count} `
          : "";
      const offset =
        isRelativeCalendarPeriod(timespan.period) && timespan.offset
          ? `, offset ${timespan.offset}`
          : "";
      return `Relative: ${count}${this._formatRelativePeriod(timespan.period)}${offset}`;
    }
    return "Energy date picker";
  }

  private _formatRelativePeriod(period: EnergyCustomGraphRelativePeriod): string {
    switch (period) {
      case "last_60_minutes":
        return "Last 60 minutes";
      case "last_24_hours":
        return "Last 24 hours";
      case "last_7_days":
        return "Last 7 days";
      case "last_30_days":
        return "Last 30 days";
      case "last_12_months":
        return "Last 12 months";
      default:
        return period.charAt(0).toUpperCase() + period.slice(1);
    }
  }

  private _formatSeriesSectionSummary(series: EnergyCustomGraphSeriesConfig[]): string {
    const warnings = series
      .map((item) => this._getSeriesIssue(item))
      .filter((issue): issue is EditorIssue => issue !== undefined).length;
    const count = `${series.length} ${series.length === 1 ? "series" : "series"}`;
    return warnings > 0 ? `${count} · ${warnings} need attention` : count;
  }

  private _hasAnySeriesTimeOffset(): boolean {
    return (this._config?.series ?? []).some((series) => seriesHasTimeOffset(series));
  }

  private _getStatisticIssue(
    statisticId: string | undefined,
    statType: EnergyCustomGraphStatisticType | undefined
  ): EditorIssue | undefined {
    const resolution = this._resolveStatisticSource(statisticId);
    return getStatisticSourceIssue({
      status: resolution.status,
      usesRaw: aggregationUsesRaw(this._config?.aggregation),
      metadata: resolution.metadata,
      statType,
    });
  }

  private _getSeriesIssue(
    series: EnergyCustomGraphSeriesConfig
  ): EditorIssue | undefined {
    const source = this._resolveSeriesSource(series);
    if (source === "forecast") {
      return undefined;
    }
    if (source === "calculation") {
      const terms = series.calculation?.terms ?? [];
      for (const term of terms) {
        if (!normalizeStatisticId(term.statistic_id)) {
          continue;
        }
        const issue = this._getStatisticIssue(
          term.statistic_id,
          term.stat_type ?? series.stat_type
        );
        if (issue) {
          return issue;
        }
      }
      return undefined;
    }
    return this._getStatisticIssue(series.statistic_id, series.stat_type);
  }

  private _renderEditorHelpHint(
    message: string,
    severity: EditorHintSeverity = "info"
  ) {
    return html`
      <p class="editor-hint ${severity}">
        <ha-icon
          icon=${severity === "info"
            ? "mdi:help-circle-outline"
            : severity === "warning"
              ? "mdi:alert"
              : "mdi:alert-circle"}
          role="img"
          aria-label=${severity}
        ></ha-icon>
        <span>${message}</span>
      </p>
    `;
  }

  private _renderSummaryIssue(issue: EditorIssue | undefined) {
    if (!issue) {
      return nothing;
    }
    return html`
      <span class="summary-issue ${issue.severity}">
        <ha-icon
          icon=${issue.severity === "error" ? "mdi:alert-circle" : "mdi:alert"}
          role="img"
          aria-label=${issue.severity}
        ></ha-icon>
        <span>${issue.cause}${issue.action ? html` · ${issue.action}` : nothing}</span>
      </span>
    `;
  }

  private _renderCompactToggle(
    label: string,
    checked: boolean,
    onChange: (checked: boolean) => void,
    disabled = false
  ) {
    return html`
      <div class="compact-toggle ${disabled ? "disabled" : ""}">
        <span class="compact-toggle-label">${label}</span>
        <ha-switch
          .checked=${checked}
          ?disabled=${disabled}
          @change=${(ev: Event) =>
            onChange((ev.target as HTMLInputElement).checked)}
        ></ha-switch>
      </div>
    `;
  }

  private _formatLegendSummary(cfg: EnergyCustomGraphCardConfig): string {
    if (cfg.hide_legend === true) {
      return "Hidden";
    }
    const parts = ["Visible"];
    if (cfg.legend_sort && cfg.legend_sort !== "none") {
      parts.push(`Sort ${cfg.legend_sort}`);
    }
    if (cfg.expand_legend) {
      parts.push("Expanded");
    }
    return parts.join(" · ");
  }

  private _formatTooltipSummary(cfg: EnergyCustomGraphCardConfig): string {
    if (cfg.show_tooltip === false) {
      return "Hidden";
    }
    const parts = ["Visible"];
    const xPointer = cfg.show_x_axis_pointer !== false;
    const yPointer = cfg.show_y_axis_pointer === true;
    if (xPointer && yPointer) {
      parts.push("X+Y Pointer");
    } else if (xPointer) {
      parts.push("X pointer");
    } else if (yPointer) {
      parts.push("Y pointer");
    }
    if (cfg.show_stack_sums) {
      parts.push("Stack sums");
    }
    return parts.join(" · ");
  }

  private _renderLegendSection(cfg: EnergyCustomGraphCardConfig) {
    const legendSort = cfg.legend_sort ?? "none";
    const hideLegend = cfg.hide_legend === true;
    const showLegend = !hideLegend;
    const expanded = this._legendExpanded;
    const buttons: Array<{ value: "none" | "asc" | "desc"; label: string }> = [
      { value: "none", label: "None" },
      { value: "asc", label: "Asc" },
      { value: "desc", label: "Desc" },
    ];
    return this._renderExpansionPanel({
      title: "Legend",
      icon: "mdi:list-box-outline",
      summary: this._formatLegendSummary(cfg),
      expanded,
      onToggle: () => this._toggleLegendExpanded(),
      body: html`
          ${this._renderCompactToggle("Show legend", showLegend, (value) =>
            this._updateBooleanConfig("hide_legend", !value)
          )}
          ${hideLegend
            ? nothing
            : html`
                <div class="field">
                  <label>Legend sort</label>
                  ${this._renderButtonToggleGroup(buttons, legendSort, (value) =>
                    this._setLegendSort(value)
                  )}
                </div>
                ${this._renderCompactToggle(
                  "Expand legend by default",
                  cfg.expand_legend === true,
                  (value) => this._updateBooleanConfig("expand_legend", value)
                )}
              `}
      `,
      className: "general-collapsible",
    });
  }

  private _renderAxesSection(cfg: EnergyCustomGraphCardConfig) {
    const axes = cfg.y_axes ?? [];
    const leftAxis = axes.find((axis) => axis.id === "left");
    const rightAxis = axes.find((axis) => axis.id === "right");

    // Check if any series uses the right axis
    const hasRightAxisSeries = cfg.series?.some((series) => series.y_axis === "right");
    const showRightAxis = !!rightAxis || hasRightAxisSeries;

    const axesExpanded = this._axesExpanded;
    const axesSummary = this._formatAxesSummary(leftAxis, rightAxis, showRightAxis);

    return this._renderExpansionPanel({
      title: "Y Axes",
      icon: "mdi:format-text-rotation-up",
      summary: axesSummary,
      expanded: axesExpanded,
      onToggle: () => this._toggleAxesExpanded(),
      body: html`
        <div class="section">
          ${this._renderAxisConfig("left", leftAxis)}
          ${showRightAxis
            ? html`
                <div class="axis-separator"></div>
                ${this._renderAxisConfig("right", rightAxis)}
              `
            : html`
                <p class="hint axis-hint">
                  The right Y axis will appear automatically when you assign a series to it.
                </p>
              `}
        </div>
      `,
      className: "general-collapsible",
    });
  }

  private _renderAxisConfig(
    axisId: "left" | "right",
    axisConfig: EnergyCustomGraphAxisConfig | undefined
  ) {
    const axisLabel = axisId === "left" ? "Left Y axis" : "Right Y axis";
    const centerZeroActive = axisConfig?.center_zero === true;

    return html`
      <div class="axis-config">
        <span class="subtitle axis-title">${axisLabel}</span>
        <div class="compact-grid">
          ${this._renderTextInput({
            label: "Min value",
            type: "number",
            disabled: centerZeroActive,
            value: axisConfig?.min !== undefined ? String(axisConfig.min) : "",
            helper: centerZeroActive ? "Disabled when center zero is active." : undefined,
            onInput: (value) => this._updateAxisConfig(axisId, "min", value),
          })}
          ${this._renderTextInput({
            label: "Max value",
            type: "number",
            value: axisConfig?.max !== undefined ? String(axisConfig.max) : "",
            helper: centerZeroActive ? "Used for both +max and -max." : undefined,
            onInput: (value) => this._updateAxisConfig(axisId, "max", value),
          })}
          ${this._renderTextInput({
            label: "Unit",
            value: axisConfig?.unit ?? "",
            onInput: (value) => this._updateAxisConfig(axisId, "unit", value),
          })}
        </div>
        <div class="toggle-grid" role="group" aria-label=${`${axisLabel} options`}>
          ${this._renderCompactToggle(
            "Fit to data",
            axisConfig?.fit_y_data === true,
            (value) => this._updateAxisConfig(axisId, "fit_y_data", value)
          )}
          ${this._renderCompactToggle(
            "Center zero",
            axisConfig?.center_zero === true,
            (value) => this._updateAxisConfig(axisId, "center_zero", value)
          )}
        </div>
      </div>
    `;
  }

  private _renderTooltipSection(cfg: EnergyCustomGraphCardConfig) {
    const showTooltip = cfg.show_tooltip !== false;
    const showXAxisPointer = cfg.show_x_axis_pointer !== false;
    const showYAxisPointer = cfg.show_y_axis_pointer === true;
    const expanded = this._tooltipExpanded;

    return this._renderExpansionPanel({
      title: "Tooltip",
      icon: "mdi:tooltip-text-outline",
      summary: this._formatTooltipSummary(cfg),
      expanded,
      onToggle: () => this._toggleTooltipExpanded(),
      body: html`
          ${this._renderCompactToggle("Show tooltip", showTooltip, (value) =>
            this._updateConfig("show_tooltip", value)
          )}
          ${showTooltip
            ? html`
                <div class="toggle-grid" role="group" aria-label="Tooltip details">
                  ${this._renderCompactToggle(
                    "X pointer",
                    showXAxisPointer,
                    (value) => this._updateConfig("show_x_axis_pointer", value)
                  )}
                  ${this._renderCompactToggle(
                    "Y pointer",
                    showYAxisPointer,
                    (value) => this._updateConfig("show_y_axis_pointer", value)
                  )}
                  ${this._renderCompactToggle(
                    "Units",
                    cfg.show_unit !== false,
                    (value) => this._updateConfig("show_unit", value)
                  )}
                  ${this._renderCompactToggle(
                    "Stack sums",
                    cfg.show_stack_sums === true,
                    (value) => this._updateConfig("show_stack_sums", value)
                  )}
                </div>
                ${this._renderTextInput({
                  label: "Tooltip precision",
                  type: "number",
                  value: cfg.tooltip_precision !== undefined ? String(cfg.tooltip_precision) : "",
                  onInput: (value) =>
                    this._updateNumericConfig("tooltip_precision", value),
                })}
              `
            : nothing}
      `,
      className: "general-collapsible",
    });
  }

  private _renderHeaderSection(cfg: EnergyCustomGraphCardConfig) {
    const chip = cfg.header?.chip;
    const enabled = !!chip;
    return html`
      <div class="subsection header-chip-section">
        <span class="subtitle">Header chip</span>
          ${this._renderCompactToggle("Show header chip", enabled, (value) =>
            this._setHeaderChipEnabled(value)
          )}
          ${enabled && chip
            ? html`
                <div class="compact-grid">
                  ${this._renderTextInput({
                    label: "Label",
                    value: chip.label ?? "",
                    onInput: (value) =>
                      this._updateHeaderChipField("label", value || undefined),
                  })}
                  ${this._renderTextInput({
                    label: "Unit",
                    helper: "Leave empty for automatic unit.",
                    value: chip.unit ?? "",
                    onInput: (value) =>
                      this._updateHeaderChipField("unit", value || undefined),
                  })}
                  ${this._renderTextInput({
                    label: "Precision",
                    type: "number",
                    step: "1",
                    min: "0",
                    helper: "Default follows tooltip precision.",
                    value:
                      chip.precision !== undefined
                        ? String(chip.precision)
                        : "",
                    onInput: (value) =>
                      this._updateHeaderChipNumber("precision", value),
                  })}
                </div>
                <span class="subtitle">Metric</span>
                ${this._renderHeaderMetricEditor(
                  chip.metric ?? this._createDefaultHeaderMetric()
                )}
              `
            : nothing}
      </div>
    `;
  }

  private _renderHeaderMetricEditor(
    metric: EnergyCustomGraphHeaderMetricConfig
  ) {
    const mode = this._getHeaderMetricMode(metric);
    const buttons: Array<{
      value: "series" | "stack" | "entity_state" | "calculation";
      label: string;
    }> = [
      { value: "series", label: "Series" },
      { value: "stack", label: "Stack" },
      { value: "entity_state", label: "Entity" },
      { value: "calculation", label: "Calculation" },
    ];

    return html`
      <div class="field full-width">
        <label>Metric</label>
        ${this._renderButtonToggleGroup(buttons, mode, (value) =>
          this._setHeaderMetricMode(value)
        )}
      </div>
      ${mode === "series"
        ? this._renderHeaderSeriesMetric(metric)
        : mode === "stack"
          ? this._renderHeaderStackMetric(metric)
          : mode === "entity_state"
            ? this._renderHeaderEntityStateMetric(metric)
            : this._renderHeaderCalculationMetric(metric)}
      ${this._renderHeaderMetricMore(metric)}
    `;
  }

  private _renderHeaderSeriesMetric(metric: EnergyCustomGraphHeaderMetricConfig) {
    const seriesMetric =
      "source" in metric && metric.source === "series"
        ? metric
        : this._createDefaultHeaderMetric("series");
    const options = this._getSeriesReferenceOptions();
    return html`
      <div class="field">
        <label>Series</label>
        <select
          @change=${(ev: Event) =>
            this._updateHeaderMetric({
              ...seriesMetric,
              series_id:
                (ev.target as HTMLSelectElement).value || undefined,
            })}
        >
          <option value="" ?selected=${!seriesMetric.series_id}>Select series</option>
          ${options.map(
            (option) => html`
              <option
                value=${option.value}
                ?selected=${seriesMetric.series_id === option.value}
              >
                ${option.label}
              </option>
            `
          )}
        </select>
      </div>
      ${this._renderHeaderReducerField(seriesMetric.reducer, (reducer) =>
        this._updateHeaderMetric({ ...seriesMetric, reducer })
      )}
    `;
  }

  private _renderHeaderStackMetric(metric: EnergyCustomGraphHeaderMetricConfig) {
    const stackMetric =
      "source" in metric && metric.source === "stack"
        ? metric
        : this._createDefaultHeaderMetric("stack");
    return html`
      ${this._renderTextInput({
        label: "Stack",
        value: stackMetric.stack ?? "",
        onInput: (value) =>
          this._updateHeaderMetric({
            ...stackMetric,
            stack: value || undefined,
          }),
      })}
      ${this._renderHeaderReducerField(stackMetric.reducer, (reducer) =>
        this._updateHeaderMetric({ ...stackMetric, reducer })
      )}
      ${this._renderHeaderStackSignField(stackMetric.sign, (sign) =>
        this._updateHeaderMetric({ ...stackMetric, sign })
      )}
    `;
  }

  private _renderHeaderEntityStateMetric(
    metric: EnergyCustomGraphHeaderMetricConfig
  ) {
    const entityMetric =
      "source" in metric && metric.source === "entity_state"
        ? metric
        : this._createDefaultHeaderMetric("entity_state");
    return html`
      <ha-entity-picker
        .hass=${this.hass}
        .value=${entityMetric.entity_id}
        .label=${"Entity"}
        allow-custom-entity
        @value-changed=${(ev: CustomEvent) =>
          this._updateHeaderMetric({
            ...entityMetric,
            entity_id: ev.detail.value || undefined,
          })}
      ></ha-entity-picker>
    `;
  }

  private _renderHeaderCalculationMetric(
    metric: EnergyCustomGraphHeaderMetricConfig
  ) {
    const calculationMetric =
      "calculation" in metric
        ? metric
        : this._createDefaultHeaderMetric("calculation");
    const calculation = calculationMetric.calculation;
    return html`
      ${this._renderTextInput({
        label: "Initial value",
        type: "number",
        value:
          calculation.initial_value !== undefined
            ? String(calculation.initial_value)
            : "0",
        onInput: (value) =>
          this._updateHeaderCalculation({
            ...calculation,
            initial_value: value ? Number(value) : 0,
          }),
      })}
      <div class="terms-list">
        ${calculation.terms?.length
          ? html`
              <ha-sortable
                handle-selector=".header-term-drag-handle"
                draggable-selector=".term-sortable-item"
                @item-moved=${this._handleHeaderCalculationTermMoved}
              >
                <div class="native-sortable-list">
                  ${calculation.terms.map(
                    (term, index) => html`
                      <div class="term-sortable-item">
                        ${this._renderHeaderCalculationTerm(term, index)}
                      </div>
                    `
                  )}
                </div>
              </ha-sortable>
            `
          : html`<p class="hint">Add at least one term to build the header metric.</p>`}
        ${this._renderNativeAddButton("Add term", () =>
          this._addHeaderCalculationTerm()
        )}
      </div>
    `;
  }

  private _renderHeaderMetricMore(metric: EnergyCustomGraphHeaderMetricConfig) {
    const count = this._countHeaderTransformFields(metric);
    const expanded = this._headerMetricMoreExpanded || count > 0;
    return this._renderMoreBlock({
      count,
      expanded,
      onToggle: () => {
        this._headerMetricMoreExpanded = !expanded;
      },
      body: this._renderHeaderTransformFields(metric, (key, value) =>
        this._updateHeaderMetric({ ...metric, [key]: value })
      ),
    });
  }

  private _countHeaderTransformFields(
    transform: EnergyCustomGraphHeaderMetricConfig
  ): number {
    return ["multiply", "add", "clip_min", "clip_max"].filter(
      (key) => (transform as Record<string, unknown>)[key] !== undefined
    ).length;
  }

  private _renderHeaderCalculationTerm(
    term: EnergyCustomGraphHeaderCalculationTermConfig,
    index: number
  ) {
    const expanded = this._expandedHeaderTermKeys.has(index);
    const operation = term.operation ?? "add";
    const descriptor = this._formatHeaderTermDescriptor(term);
    return this._renderExpansionPanel({
      title: this._formatOperation(operation),
      leading: this._renderDragHandle(
        "header-term-drag-handle",
        "Drag to reorder term"
      ),
      summary: descriptor,
      expanded,
      onToggle: () => this._toggleHeaderTermExpanded(index),
      actions: html`
          <ha-icon-button
            class="editor-action"
            .label=${"Remove term"}
            @click=${(ev: Event) => {
              ev.stopPropagation();
              this._removeHeaderCalculationTerm(index);
            }}
          >
            <ha-icon icon="mdi:delete"></ha-icon>
          </ha-icon-button>
      `,
      body: html`
        <div class="term-body column">
          ${this._renderHeaderTermOperationField(index, operation)}
          ${this._renderHeaderTermSourceFields(index, term)}
          ${this._renderHeaderTransformFields(term, (key, value) =>
            this._updateHeaderCalculationTerm(index, key, value)
          )}
        </div>
      `,
      className: "term-panel",
    });
  }

  private _renderHeaderTermOperationField(
    index: number,
    operation: EnergyCustomGraphCalculationTerm["operation"]
  ) {
    const current = operation ?? "add";
    return html`
      <div class="field">
        <label>Operation</label>
        <select
          @change=${(ev: Event) =>
            this._updateHeaderCalculationTerm(
              index,
              "operation",
              (ev.target as HTMLSelectElement).value
            )}
        >
          <option value="add" ?selected=${current === "add"}>Add</option>
          <option value="subtract" ?selected=${current === "subtract"}>Subtract</option>
          <option value="multiply" ?selected=${current === "multiply"}>Multiply</option>
          <option value="divide" ?selected=${current === "divide"}>Divide</option>
        </select>
      </div>
    `;
  }

  private _renderHeaderTermSourceFields(
    index: number,
    term: EnergyCustomGraphHeaderCalculationTermConfig
  ) {
    const source = term.source ?? "series";
    const buttons: Array<{
      value: "series" | "stack" | "entity_state" | "constant";
      label: string;
    }> = [
      { value: "series", label: "Series" },
      { value: "stack", label: "Stack" },
      { value: "entity_state", label: "Entity" },
      { value: "constant", label: "Constant" },
    ];
    return html`
      <div class="field full-width">
        <label>Input type</label>
        ${this._renderButtonToggleGroup(buttons, source, (value) =>
          this._setHeaderTermSource(index, value)
        )}
      </div>
      ${source === "series"
        ? this._renderHeaderTermSeriesFields(index, term)
        : source === "stack"
          ? this._renderHeaderTermStackFields(index, term)
          : source === "entity_state"
            ? this._renderHeaderTermEntityFields(index, term)
            : this._renderHeaderTermConstantFields(index, term)}
    `;
  }

  private _renderHeaderTermSeriesFields(
    index: number,
    term: EnergyCustomGraphHeaderCalculationTermConfig
  ) {
    const options = this._getSeriesReferenceOptions();
    return html`
      <div class="field">
        <label>Series</label>
        <select
          @change=${(ev: Event) =>
            this._updateHeaderCalculationTerm(
              index,
              "series_id",
              (ev.target as HTMLSelectElement).value || undefined
            )}
        >
          <option value="" ?selected=${!("series_id" in term) || !term.series_id}>Select series</option>
          ${options.map(
            (option) => html`
              <option
                value=${option.value}
                ?selected=${"series_id" in term && term.series_id === option.value}
              >
                ${option.label}
              </option>
            `
          )}
        </select>
      </div>
      ${this._renderHeaderReducerField(
        "reducer" in term ? term.reducer : undefined,
        (reducer) => this._updateHeaderCalculationTerm(index, "reducer", reducer)
      )}
    `;
  }

  private _renderHeaderTermStackFields(
    index: number,
    term: EnergyCustomGraphHeaderCalculationTermConfig
  ) {
    return html`
      ${this._renderTextInput({
        label: "Stack",
        value: "stack" in term ? term.stack ?? "" : "",
        onInput: (value) =>
          this._updateHeaderCalculationTerm(
            index,
            "stack",
            value || undefined
          ),
      })}
      ${this._renderHeaderReducerField(
        "reducer" in term ? term.reducer : undefined,
        (reducer) => this._updateHeaderCalculationTerm(index, "reducer", reducer)
      )}
      ${this._renderHeaderStackSignField(
        "sign" in term ? term.sign : undefined,
        (sign) => this._updateHeaderCalculationTerm(index, "sign", sign)
      )}
    `;
  }

  private _renderHeaderTermEntityFields(
    index: number,
    term: EnergyCustomGraphHeaderCalculationTermConfig
  ) {
    return html`
      <ha-entity-picker
        .hass=${this.hass}
        .value=${"entity_id" in term ? term.entity_id : undefined}
        .label=${"Entity"}
        allow-custom-entity
        @value-changed=${(ev: CustomEvent) =>
          this._updateHeaderCalculationTerm(
            index,
            "entity_id",
            ev.detail.value || undefined
          )}
      ></ha-entity-picker>
    `;
  }

  private _renderHeaderTermConstantFields(
    index: number,
    term: EnergyCustomGraphHeaderCalculationTermConfig
  ) {
    return this._renderTextInput({
      label: "Constant",
      type: "number",
      value:
        "constant" in term && term.constant !== undefined
          ? String(term.constant)
          : "0",
      onInput: (value) =>
        this._updateHeaderCalculationTerm(
          index,
          "constant",
          value === "" ? undefined : Number(value)
        ),
    });
  }

  private _renderHeaderReducerField(
    reducer: EnergyCustomGraphHeaderReducer | undefined,
    onChange: (reducer: EnergyCustomGraphHeaderReducer) => void
  ) {
    const current = reducer ?? "sum";
    return html`
      <div class="field">
        <label>Reducer</label>
        <select
          @change=${(ev: Event) =>
            onChange((ev.target as HTMLSelectElement).value as EnergyCustomGraphHeaderReducer)}
        >
          ${HEADER_REDUCER_OPTIONS.map(
            (option) => html`
              <option value=${option.value} ?selected=${current === option.value}>
                ${option.label}
              </option>
            `
          )}
        </select>
      </div>
    `;
  }

  private _renderHeaderStackSignField(
    sign: EnergyCustomGraphHeaderStackSign | undefined,
    onChange: (sign: EnergyCustomGraphHeaderStackSign) => void
  ) {
    const current = sign ?? "signed";
    return html`
      <div class="field">
        <label>Sign</label>
        <select
          @change=${(ev: Event) =>
            onChange((ev.target as HTMLSelectElement).value as EnergyCustomGraphHeaderStackSign)}
        >
          ${HEADER_STACK_SIGN_OPTIONS.map(
            (option) => html`
              <option value=${option.value} ?selected=${current === option.value}>
                ${option.label}
              </option>
            `
          )}
        </select>
      </div>
    `;
  }

  private _renderHeaderTransformFields(
    transform: {
      multiply?: number;
      add?: number;
      clip_min?: number;
      clip_max?: number;
    },
    onChange: (
      key: "multiply" | "add" | "clip_min" | "clip_max",
      value: number | undefined
    ) => void
  ) {
    return html`
      <span class="subtitle term-transform-title">Transform</span>
      ${this._renderTextInput({
        label: "Multiply",
        type: "number",
        value: transform.multiply !== undefined ? String(transform.multiply) : "",
        onInput: (value) =>
          onChange("multiply", value === "" ? undefined : Number(value)),
      })}
      ${this._renderTextInput({
        label: "Add",
        type: "number",
        value: transform.add !== undefined ? String(transform.add) : "",
        onInput: (value) =>
          onChange("add", value === "" ? undefined : Number(value)),
      })}
      ${this._renderTextInput({
        label: "Clip min",
        type: "number",
        value: transform.clip_min !== undefined ? String(transform.clip_min) : "",
        onInput: (value) =>
          onChange("clip_min", value === "" ? undefined : Number(value)),
      })}
      ${this._renderTextInput({
        label: "Clip max",
        type: "number",
        value: transform.clip_max !== undefined ? String(transform.clip_max) : "",
        onInput: (value) =>
          onChange("clip_max", value === "" ? undefined : Number(value)),
      })}
    `;
  }

  private _renderAggregationPickerOptions(
    pickerAggregation: NonNullable<EnergyCustomGraphAggregationConfig["energy_picker"]> | {}
  ) {
    const picker = pickerAggregation as Partial<
      Record<AggregationPickerKey, EnergyCustomGraphAggregationTarget>
    >;
    return html`
      <div class="section">
        <p class="hint">
          Override the interval used when requesting statistics via the energy date picker.
        </p>
        <div class="picker-grid">
          ${(["hour", "day", "week", "month", "year"] as AggregationPickerKey[]).map(
            (key) => html`
              <div class="field">
                <label>${`Energy picker → ${key}`}</label>
                ${(() => {
                  const current = picker[key] ?? "";
                  return html`<select
                    @change=${(ev: Event) =>
                      this._updateAggregationPicker(key, (ev.target as HTMLSelectElement).value || "")}
                  >
                    <option value="" ?selected=${current === ""}>Automatic</option>
                    ${AGGREGATION_OPTIONS.map(
                      (option) =>
                        html`<option value=${option.value} ?selected=${current === option.value}
                          >${option.label}</option
                        >`
                    )}
                  </select>`;
                })()}
              </div>
            `
          )}
        </div>
      </div>
    `;
  }

  private _setLegendSort(value: "none" | "asc" | "desc") {
    this._updateConfig("legend_sort", value as any);
  }

  private _renderAggregationManualOptions(
    aggregation: EnergyCustomGraphAggregationConfig | undefined
  ) {
    return html`
      <div class="section">
        <p class="hint">
          Override the interval used when requesting recorder statistics. Leave empty to keep the
          automatic behaviour.
        </p>
        <div class="field">
          <label>Manual aggregation</label>
          ${(() => {
            const current = aggregation?.manual ?? "";
            return html`<select
              @change=${(ev: Event) =>
                this._updateAggregation("manual", (ev.target as HTMLSelectElement).value || "")}
            >
              <option value="" ?selected=${current === ""}>Automatic</option>
              ${AGGREGATION_OPTIONS.map(
                (option) =>
                  html`<option value=${option.value} ?selected=${current === option.value}
                    >${option.label}</option
                  >`
              )}
            </select>`;
          })()}
        </div>
        <div class="field">
          <label>Fallback aggregation</label>
          ${(() => {
            const current = aggregation?.fallback ?? "";
            return html`<select
              @change=${(ev: Event) =>
                this._updateAggregation("fallback", (ev.target as HTMLSelectElement).value || "")}
            >
              <option value="" ?selected=${current === ""}>None</option>
              ${AGGREGATION_OPTIONS.map(
                (option) =>
                  html`<option value=${option.value} ?selected=${current === option.value}
                    >${option.label}</option
                  >`
              )}
            </select>`;
          })()}
        </div>
      </div>
    `;
  }

  private _renderRawOptions(
    aggregation: EnergyCustomGraphAggregationConfig | undefined
  ) {
    if (!this._aggregationUsesRaw(aggregation)) {
      return nothing;
    }

    const options: EnergyCustomGraphRawOptions = {
      ...(aggregation?.raw_options ?? {}),
    };
    const current =
      options.significant_changes_only === undefined
        ? "auto"
        : options.significant_changes_only
          ? "true"
          : "false";
    return html`
      <div class="section">
        <p class="hint">
          Configure how RAW history requests behave. Automatic uses Home Assistant&apos;s default
          behaviour.
        </p>
        <div class="field">
          <label>Significant changes only</label>
          <select
            @change=${(ev: Event) =>
              this._updateRawOption(
                "significant_changes_only",
                (ev.target as HTMLSelectElement).value as "auto" | "true" | "false"
              )}
          >
            <option value="auto" ?selected=${current === "auto"}>Automatic</option>
            <option value="true" ?selected=${current === "true"}>Yes</option>
            <option value="false" ?selected=${current === "false"}>No</option>
          </select>
        </div>
      </div>
    `;
  }

  private _renderComputeCurrentHourOption(
    aggregation: EnergyCustomGraphAggregationConfig | undefined
  ) {
    const enabled = aggregation?.compute_current_hour === true;
    return html`
      <div class="section">
        ${this._renderCompactToggle("Compute current hour value", enabled, (value) =>
          this._updateAggregationFlag("compute_current_hour", value)
        )}
        ${this._renderEditorHelpHint(
          "Home Assistant publishes hourly aggregates after the hour completes; this adds a current-hour estimate from recent 5 minute statistics.",
          "info"
        )}
      </div>
    `;
  }

  private _aggregationUsesRaw(
    aggregation: EnergyCustomGraphAggregationConfig | undefined
  ): boolean {
    if (!aggregation) {
      return false;
    }
    if (aggregation.manual === "raw" || aggregation.fallback === "raw") {
      return true;
    }
    if (aggregation.energy_picker) {
      return Object.values(aggregation.energy_picker).some((value) => value === "raw");
    }
    return false;
  }

  private _updateRawOption(
    key: keyof EnergyCustomGraphRawOptions,
    selection: "auto" | "true" | "false"
  ) {
    const aggregation: EnergyCustomGraphAggregationConfig = {
      ...this._config!.aggregation,
    };
    const options: EnergyCustomGraphRawOptions = {
      ...(aggregation.raw_options ?? {}),
    };

    if (selection === "auto") {
      delete options[key];
    } else {
      options[key] = selection === "true";
    }

    if (Object.keys(options).length) {
      aggregation.raw_options = options;
    } else {
      delete aggregation.raw_options;
    }

    const cleaned = this._cleanupAggregation(aggregation);
    this._updateConfig("aggregation", cleaned);
  }

  private _renderSeriesCard(series: EnergyCustomGraphSeriesConfig, index: number) {
    const expanded = this._expandedSeries.has(index);
    const issue = this._getSeriesIssue(series);

    return this._renderExpansionPanel({
      title: this._formatSeriesTitle(series, index),
      leading: html`
        <span class="series-leading">
          ${this._renderDragHandle(
            "series-drag-handle",
            "Drag to reorder series"
          )}
          ${this._renderSeriesSourceIcon(series)}
        </span>
      `,
      summary: html`
        <span class="series-summary">
          ${this._formatSeriesSummary(series)}
          ${this._renderSummaryIssue(issue)}
        </span>
      `,
      expanded,
      onToggle: () => this._toggleSeriesExpanded(index),
      actionsSlot: "event",
      actions: html`
        <div class="header-actions">
            <ha-icon-button
              class="editor-action"
              .label=${"Duplicate series"}
              @click=${(ev: Event) => {
                ev.stopPropagation();
                this._duplicateSeries(index);
              }}
            >
              <ha-icon icon="mdi:plus-box-multiple"></ha-icon>
            </ha-icon-button>
            <ha-icon-button
              class="editor-action"
              .label=${"Delete series"}
              @click=${(ev: Event) => {
                ev.stopPropagation();
                this._confirmRemoveSeries(index);
              }}
            >
              <ha-icon icon="mdi:delete"></ha-icon>
            </ha-icon-button>
          </div>
      `,
      body: html`
        ${this._renderTextInput({
          label: "Series name",
          helper: "Optional. Empty uses the entity or statistic name.",
          value: series.name ?? "",
          onInput: (value) =>
            this._updateSeries(index, "name", value || undefined),
        })}
        <div class="series-option-groups">
          ${this._renderSeriesOptionGroup(
            series,
            index,
            "source",
            "Source",
            this._formatSeriesSourceSummary(series),
            this._renderSeriesSourceGroup(series, index)
          )}
          ${this._renderSeriesOptionGroup(
            series,
            index,
            "style",
            "Style",
            this._formatSeriesStyleSummary(series),
            this._renderSeriesStyleSegment(series, index)
          )}
          ${this._renderSeriesOptionGroup(
            series,
            index,
            "visibility",
            "Visibility",
            this._formatSeriesVisibilitySummary(series),
            this._renderSeriesVisibilitySegment(series, index)
          )}
          ${this._renderSeriesOptionGroup(
            series,
            index,
            "transform",
            "Transform",
            this._formatSeriesTransformSummary(series),
            this._renderSeriesTransformGroup(series, index)
          )}
        </div>
      `,
      className: "series-card",
    });
  }

  private _seriesHasConfiguredSource(series: EnergyCustomGraphSeriesConfig): boolean {
    const source = this._resolveSeriesSource(series);
    if (source === "calculation") {
      return Boolean(series.calculation?.terms?.length);
    }
    if (source === "forecast") {
      return true;
    }
    return Boolean(normalizeStatisticId(series.statistic_id));
  }

  private _renderSeriesSourceIcon(series: EnergyCustomGraphSeriesConfig) {
    const source = this._resolveSeriesSource(series);
    if (source === "calculation") {
      return html`<ha-icon icon="mdi:calculator-variant"></ha-icon>`;
    }
    if (source === "forecast") {
      return html`<ha-icon icon="mdi:solar-power-variant-outline"></ha-icon>`;
    }
    const statisticId = normalizeStatisticId(series.statistic_id);
    const stateObj = statisticId ? this.hass?.states?.[statisticId] : undefined;
    if (stateObj) {
      return html`<ha-state-icon .stateObj=${stateObj}></ha-state-icon>`;
    }
    return html`<ha-icon icon="mdi:selection-remove"></ha-icon>`;
  }

  private _renderSeriesOptionGroup(
    series: EnergyCustomGraphSeriesConfig,
    index: number,
    group: SeriesOptionGroup,
    title: string,
    summary: string,
    body: unknown
  ) {
    const expanded = this._isSeriesOptionGroupExpanded(series, index, group);
    return this._renderExpansionPanel({
      title,
      icon: this._getSeriesOptionGroupIcon(group),
      summary,
      expanded,
      onToggle: () => this._toggleSeriesOptionGroup(index, group, expanded),
      body,
      className: "series-option-group",
    });
  }

  private _getSeriesOptionGroupIcon(group: SeriesOptionGroup): string {
    switch (group) {
      case "style":
        return "mdi:palette";
      case "visibility":
        return "mdi:eye";
      case "transform":
        return "mdi:function";
      case "source":
      default:
        return "mdi:database-search";
    }
  }

  private _isSeriesOptionGroupExpanded(
    series: EnergyCustomGraphSeriesConfig,
    index: number,
    group: SeriesOptionGroup
  ): boolean {
    const key = this._seriesOptionGroupKey(index, group);
    const explicit = this._seriesOptionGroupsExpanded.get(key);
    if (explicit !== undefined) {
      return explicit;
    }
    const hasSource = this._seriesHasConfiguredSource(series);
    if (group === "source") {
      return !hasSource;
    }
    if (group === "style") {
      return hasSource;
    }
    return false;
  }

  private _toggleSeriesOptionGroup(
    index: number,
    group: SeriesOptionGroup,
    expanded: boolean
  ) {
    this._setSeriesOptionGroupExpanded(index, group, !expanded);
  }

  private _setSeriesOptionGroupExpanded(
    index: number,
    group: SeriesOptionGroup,
    expanded: boolean
  ) {
    const next = new Map(this._seriesOptionGroupsExpanded);
    next.set(this._seriesOptionGroupKey(index, group), expanded);
    this._seriesOptionGroupsExpanded = next;
    this._expandedSeries = new Set(this._expandedSeries).add(index);
  }

  private _seriesOptionGroupKey(index: number, group: SeriesOptionGroup): string {
    return `${index}:${group}`;
  }

  private _parseSeriesOptionGroupKey(
    key: string
  ): { index: number; group: SeriesOptionGroup } | undefined {
    const [indexPart, groupPart] = key.split(":");
    const index = Number(indexPart);
    if (
      Number.isNaN(index) ||
      !SERIES_OPTION_GROUPS.has(groupPart as SeriesOptionGroup)
    ) {
      return undefined;
    }
    return { index, group: groupPart as SeriesOptionGroup };
  }

  private _formatSeriesSummary(series: EnergyCustomGraphSeriesConfig): string {
    const parts: string[] = [];
    if (series.name?.trim()) {
      parts.push(this._formatSeriesSourceDescriptor(series));
    }
    parts.push(this._formatChartType(series.chart_type ?? "bar"));
    parts.push((series.y_axis ?? "left") === "right" ? "Right axis" : "Left axis");
    return parts.join(" · ");
  }

  private _formatSeriesSourceSummary(series: EnergyCustomGraphSeriesConfig): string {
    return this._formatSeriesSourceDescriptor(series);
  }

  private _formatSeriesStyleSummary(series: EnergyCustomGraphSeriesConfig): string {
    const parts = [
      this._formatChartType(series.chart_type ?? "bar"),
      (series.y_axis ?? "left") === "right" ? "Right axis" : "Left axis",
    ];
    if (series.stack?.trim()) {
      parts.push(`Stack: ${series.stack.trim()}`);
    }
    if (series.fill === true) {
      parts.push("Fill");
    }
    return parts.join(" · ");
  }

  private _formatSeriesVisibilitySummary(series: EnergyCustomGraphSeriesConfig): string {
    const hidden: string[] = [];
    if (series.show_in_chart === false) {
      hidden.push("Chart");
    }
    if (series.show_in_legend === false) {
      hidden.push("Legend");
    }
    if (series.show_in_tooltip === false) {
      hidden.push("Tooltip");
    }
    const parts = hidden.length ? [`Hidden: ${hidden.join(", ")}`] : ["Visible"];
    if (series.hidden_by_default === true) {
      parts.push("Hidden by default");
    }
    if (series.show_value_labels === true) {
      parts.push("Value labels");
    }
    return parts.join(" · ");
  }

  private _formatSeriesTransformSummary(series: EnergyCustomGraphSeriesConfig): string {
    const parts: string[] = [];
    if (series.multiply !== undefined) {
      parts.push("Multiply");
    }
    if (series.add !== undefined) {
      parts.push("Add");
    }
    if (series.clip_min !== undefined) {
      parts.push("Clip min");
    }
    if (series.clip_max !== undefined) {
      parts.push("Clip max");
    }
    return parts.length ? parts.join(" · ") : "No transform";
  }

  private _formatSeriesTitle(
    series: EnergyCustomGraphSeriesConfig,
    index: number
  ): string {
    const explicitName = series.name?.trim();
    if (explicitName) {
      return explicitName;
    }
    return this._formatSeriesSourceDescriptor(series) || `Series ${index + 1}`;
  }

  private _formatSeriesSourceDescriptor(
    series: EnergyCustomGraphSeriesConfig
  ): string {
    const source = this._resolveSeriesSource(series);
    if (source === "calculation") {
      const count = series.calculation?.terms?.length ?? 0;
      return count ? `Calculation · ${count} terms` : "Calculation · no terms";
    }
    if (source === "forecast") {
      return series.pv_production_entity
        ? `Forecast · ${series.pv_production_entity}`
        : "Forecast · all solar forecasts";
    }
    const id = normalizeStatisticId(series.statistic_id);
    if (!id) {
      return "No entity selected";
    }
    const metadata = this._getStatisticMetadata(id);
    return getStatisticLabel(this.hass, id, metadata);
  }

  private _formatChartType(type: EnergyCustomGraphChartType): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  private _renderTimespanSection(cfg: EnergyCustomGraphCardConfig) {
    const timespan = cfg.timespan ?? { mode: "energy" };
    const mode = timespan.mode;
    const showCount =
      timespan.mode === "relative" && isRelativeCalendarPeriod(timespan.period);
    const hasTimeOffset = this._hasAnySeriesTimeOffset();
    const relativeKind =
      timespan.mode === "relative" && !isRelativeCalendarPeriod(timespan.period)
        ? "rolling"
        : "calendar";

    return html`
      <div class="section">
        <div class="field">
          <label>Timespan</label>
          ${this._renderButtonToggleGroup(
            [
              { value: "energy", label: "Energy" },
              { value: "relative", label: "Relative" },
              { value: "fixed", label: "Fixed" },
            ],
            mode,
            (value) => this._setTimespanMode(value)
          )}
        </div>

        ${mode === "energy"
          ? html`
              ${this._renderCompactToggle(
                "Allow compare",
                cfg.allow_compare !== false,
                (value) => this._updateConfig("allow_compare", value),
                hasTimeOffset
              )}
              ${hasTimeOffset
                ? this._renderEditorHelpHint(
                    "Series time offset disables the Energy date picker compare mode.",
                    "warning"
                  )
                : nothing}
              ${this._renderTextInput({
                label: "Collection key",
                helper: "Usually only needed for multiple independent Energy date pickers on one dashboard page.",
                value: cfg.collection_key ?? "",
                onInput: (value) =>
                  this._updateConfig("collection_key", value || undefined),
              })}
            `
          : nothing}

        ${mode === "relative"
          ? html`
              <div class="field">
                <label>Relative type</label>
                ${this._renderButtonToggleGroup(
                  [
                    { value: "calendar", label: "Calendar" },
                    { value: "rolling", label: "Rolling" },
                  ],
                  relativeKind,
                  (value) =>
                    this._updateTimespanRelativePeriod(
                      value === "calendar" ? "day" : "last_24_hours"
                    )
                )}
              </div>
              <div class="field">
                <label>Period</label>
                <select
                  @change=${(ev: Event) =>
                    this._updateTimespanRelativePeriod((ev.target as HTMLSelectElement).value as EnergyCustomGraphRelativePeriod)}
                >
                  ${(relativeKind === "calendar"
                    ? [
                        { value: "hour", label: "Hour" },
                        { value: "day", label: "Day" },
                        { value: "week", label: "Week" },
                        { value: "month", label: "Month" },
                        { value: "year", label: "Year" },
                      ]
                    : [
                        { value: "last_60_minutes", label: "Last 60 minutes" },
                        { value: "last_24_hours", label: "Last 24 hours" },
                        { value: "last_7_days", label: "Last 7 days" },
                        { value: "last_30_days", label: "Last 30 days" },
                        { value: "last_12_months", label: "Last 12 months" },
                      ]).map(
                    ({ value, label }) => html`
                      <option
                        value=${value}
                        ?selected=${timespan.mode === "relative" && timespan.period === value}
                      >
                        ${label}
                      </option>
                    `
                  )}
                </select>
              </div>
              ${showCount
                ? this._renderTextInput({
                    label: "Count",
                    type: "number",
                    min: "1",
                    step: "1",
                    value:
                      timespan.mode === "relative"
                        ? String(timespan.count ?? 1)
                        : "1",
                    onInput: (value) =>
                      this._updateTimespanRelativeCount(value),
                  })
                : nothing}
              ${showCount
                ? this._renderTextInput({
                    label: "Offset",
                    type: "number",
                    value: String(timespan.offset ?? 0),
                    onInput: (value) =>
                      this._updateTimespanRelativeOffset(Number(value)),
                  })
                : nothing}
            `
          : nothing}

        ${mode === "fixed"
          ? html`
              <div class="compact-grid two">
                ${this._renderTextInput({
                  label: "Start",
                  helper: "ISO 8601, e.g. 2024-01-01T00:00:00.",
                  value: timespan.mode === "fixed" ? (timespan.start ?? "") : "",
                  onInput: (value) =>
                    this._updateTimespanFixedStart(value || undefined),
                })}
                ${this._renderTextInput({
                  label: "End",
                  helper: "ISO 8601, e.g. 2024-01-31T23:59:59.",
                  value: timespan.mode === "fixed" ? (timespan.end ?? "") : "",
                  onInput: (value) =>
                    this._updateTimespanFixedEnd(value || undefined),
                })}
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private _renderSeriesSourceGroup(series: EnergyCustomGraphSeriesConfig, index: number) {
    const source = this._resolveSeriesSource(series);
    const buttons: Array<{ value: "statistic" | "calculation" | "forecast"; label: string }> = [
      { value: "statistic", label: "Entity" },
      { value: "calculation", label: "Calculation" },
      { value: "forecast", label: "Forecast" },
    ];
    return html`
      <div class="section series-source-body">
          <div class="field full-width">
            ${this._renderButtonToggleGroup(buttons, source, (mode) =>
              this._setSeriesSource(index, mode)
            )}
          </div>
          ${source === "calculation"
            ? this._renderSeriesCalculationContent(series, index)
            : source === "forecast"
              ? this._renderSeriesForecastContent(series, index)
              : this._renderSeriesStatisticContent(series, index)}
          ${this._renderSeriesSourceMore(series, index)}
      </div>
    `;
  }

  private _renderSeriesStatisticContent(series: EnergyCustomGraphSeriesConfig, index: number) {
    if (!this.hass) {
      return html`<p>Loading...</p>`;
    }
    const id = normalizeStatisticId(series.statistic_id);
    const resolution = this._resolveStatisticSource(id);
    const issue = this._getStatisticIssue(id, series.stat_type);
    const metadata = resolution.metadata;
    const statTypeDisabled = !metadata;
    const current = series.stat_type ?? selectDefaultStatisticType(metadata) ?? "";

    return html`
      <ha-entity-picker
        .hass=${this.hass}
        .value=${series.statistic_id}
        .label=${"Entity"}
        allow-custom-entity
        @value-changed=${(ev: CustomEvent) =>
          this._handleSeriesStatisticChanged(index, ev.detail.value || undefined)}
      ></ha-entity-picker>
      <div class="field">
        <label>Statistic type</label>
        <select
          ?disabled=${statTypeDisabled}
          @change=${(ev: Event) =>
            this._updateSeries(
              index,
              "stat_type",
              (ev.target as HTMLSelectElement).value as EnergyCustomGraphStatisticType
            )}
        >
          <option value="" ?selected=${current === ""}>
            Not used
          </option>
          ${STAT_TYPE_OPTIONS.map(
            (option) => {
              const supported = isStatisticTypeSupported(metadata, option.value);
              return html`<option
                value=${option.value}
                ?selected=${current === option.value}
                ?disabled=${!supported}
              >
                ${option.label}
              </option>`;
            }
          )}
        </select>
        ${statTypeDisabled
          ? this._renderEditorHelpHint(
              resolution.status === "raw_only"
                ? "Statistic type does not affect RAW history."
                : "Select an entity with recorder statistics to choose a statistic type.",
              "info"
            )
          : issue
            ? this._renderEditorHelpHint(
                `${issue.cause}${issue.action ? ` · ${issue.action}` : ""}`,
                issue.severity
              )
            : nothing}
      </div>
      ${this._renderSeriesTimeOffsetFields(series, index)}
    `;
  }

  private _renderSeriesTimeOffsetFields(series: EnergyCustomGraphSeriesConfig, index: number) {
    const timeOffsetUnit = isTimeOffsetUnit(series.time_offset?.unit)
      ? series.time_offset.unit
      : "";
    const timeOffsetValue =
      typeof series.time_offset?.value === "number" &&
      Number.isFinite(series.time_offset.value)
        ? String(series.time_offset.value)
        : "";

    return html`
      <div class="field">
        <label>Time offset</label>
        <select
          @change=${(ev: Event) =>
            this._updateSeriesTimeOffsetUnit(
              index,
              (ev.target as HTMLSelectElement).value
            )}
        >
          <option value="" ?selected=${timeOffsetUnit === ""}>None</option>
          ${TIME_OFFSET_UNIT_OPTIONS.map(
            (option) =>
              html`<option value=${option.value} ?selected=${timeOffsetUnit === option.value}
                >${option.label}</option
              >`
          )}
        </select>
      </div>
      ${timeOffsetUnit
        ? this._renderTextInput({
            label: "Offset value",
            helper: "Negative values load past source data.",
            type: "number",
            step: "1",
            value: timeOffsetValue,
            onInput: (value) => this._updateSeriesTimeOffsetValue(index, value),
          })
        : nothing}
    `;
  }

  private _renderSeriesSourceMore(
    series: EnergyCustomGraphSeriesConfig,
    index: number
  ) {
    const chartType = series.chart_type ?? "bar";
    const showValueLabelPrecision =
      chartType === "bar" &&
      (series.show_value_labels === true ||
        series.value_label_precision !== undefined);
    if (!showValueLabelPrecision) {
      return nothing;
    }

    const count = series.value_label_precision !== undefined ? 1 : 0;
    const expanded = this._seriesSourceMoreExpanded.has(index) || count > 0;
    return this._renderMoreBlock({
      count,
      expanded,
      onToggle: () => this._toggleSeriesSourceMore(index, expanded),
      body: this._renderTextInput({
        label: "Value label precision",
        type: "number",
        step: "1",
        min: "0",
        helper: "Default 0, no unit.",
        value:
          series.value_label_precision !== undefined
            ? String(series.value_label_precision)
            : "",
        onInput: (value) =>
          this._updateSeriesNumber(index, "value_label_precision", value),
      }),
    });
  }

  private _renderSeriesForecastContent(series: EnergyCustomGraphSeriesConfig, index: number) {
    const options = this._solarProductionOptions;
    const current = series.pv_production_entity ?? "";
    return html`
      <p class="hint">
        Select the PV production sensor you configured in the Energy dashboard. Leave this field empty
        to use the sum of all available solar forecasts.
      </p>
      <div class="field">
        <label>PV production sensor</label>
        <select
          @change=${(ev: Event) =>
            this._updateSeries(
              index,
              "pv_production_entity",
              (ev.target as HTMLSelectElement).value || undefined
            )}
        >
          <option value="" ?selected=${current === ""}>All forecasts</option>
          ${options.map(
            (option) => html`<option value=${option.value} ?selected=${current === option.value}>
              ${option.label}${option.hasForecast ? "" : " (no forecast)"}
            </option>`
          )}
        </select>
      </div>
      ${this._solarOptionsLoading
        ? html`<p class="hint">Loading solar sources…</p>`
        : options.length === 0
          ? html`<p class="hint">
              No PV production sources with forecasts were found in the Energy dashboard. Configure a
              solar forecast integration there to enable this option.
            </p>`
          : nothing}
      ${this._solarOptionsError
        ? html`<p class="error">${this._solarOptionsError}</p>`
        : nothing}
    `;
  }

  private _renderSeriesCalculationContent(series: EnergyCustomGraphSeriesConfig, index: number) {
    const calculation: EnergyCustomGraphCalculationConfig = series.calculation ?? {
      terms: [],
    };
    return html`
      ${this._renderTextInput({
        label: "Calculation unit",
        value: calculation.unit ?? "",
        onInput: (value) =>
          this._updateCalculation(index, {
            ...calculation,
            unit: value || undefined,
          }),
      })}
      ${this._renderTextInput({
        label: "Initial value",
        type: "number",
        value: calculation.initial_value !== undefined
          ? String(calculation.initial_value)
          : "0",
        onInput: (value) =>
          this._updateCalculation(index, {
            ...calculation,
            initial_value: value ? Number(value) : 0,
          }),
      })}
      ${this._renderSeriesTimeOffsetFields(series, index)}
      <div class="terms-section">
        <div class="terms-header">
          <span class="subtitle">Terms</span>
        </div>
        <div class="terms-list">
          ${calculation.terms?.length
            ? html`
                <ha-sortable
                  handle-selector=".series-term-drag-handle"
                  draggable-selector=".term-sortable-item"
                  @item-moved=${(ev: CustomEvent<{ oldIndex: number; newIndex: number }>) =>
                    this._handleCalculationTermMoved(ev, index)}
                >
                  <div class="native-sortable-list">
                    ${calculation.terms.map(
                      (term, termIndex) => html`
                        <div class="term-sortable-item">
                          ${this._renderCalculationTerm(index, termIndex, term)}
                        </div>
                      `
                    )}
                  </div>
                </ha-sortable>
              `
            : html`<p class="hint">No terms configured yet.</p>`}
          ${this._renderNativeAddButton("Add term", () =>
            this._addCalculationTerm(index)
          )}
        </div>
      </div>
    `;
  }

  private _renderCalculationTerm(
    seriesIndex: number,
    termIndex: number,
    term: EnergyCustomGraphCalculationTerm
  ) {
    const operation = term.operation ?? "add";
    const termKey = `${seriesIndex}-${termIndex}`;
    const expanded = this._expandedTermKeys.has(termKey);
    const operationLabel = this._formatOperation(operation);
    const descriptor = term.statistic_id && term.statistic_id.trim().length
      ? term.statistic_id.trim()
      : term.constant !== undefined
        ? `Constant: ${term.constant}`
        : "No input selected";
    return this._renderExpansionPanel({
      title: operationLabel,
      leading: this._renderDragHandle(
        "series-term-drag-handle",
        "Drag to reorder term"
      ),
      summary: descriptor,
      expanded,
      onToggle: () => this._toggleTermExpanded(termKey),
      actions: html`
          <ha-icon-button
            class="editor-action"
            .label=${"Remove term"}
            @click=${(ev: Event) => {
              ev.stopPropagation();
              this._removeCalculationTerm(seriesIndex, termIndex);
            }}
          >
            <ha-icon icon="mdi:delete"></ha-icon>
          </ha-icon-button>
      `,
      body: html`
        <div class="term-body column">
          ${this._renderTermOperationField(seriesIndex, termIndex, operation)}
          ${this._renderTermSourceFields(seriesIndex, termIndex, term)}
          ${this._renderTermTransformFields(seriesIndex, termIndex, term)}
        </div>
      `,
      className: "term-panel",
    });
  }

  private _renderTermOperationField(
    seriesIndex: number,
    termIndex: number,
    operation: EnergyCustomGraphCalculationTerm["operation"]
  ) {
    const current = operation ?? "add";
    return html`
      <div class="field">
        <label>Operation</label>
        <select
          @change=${(ev: Event) =>
            this._updateTerm(
              seriesIndex,
              termIndex,
              "operation",
              (ev.target as HTMLSelectElement).value as EnergyCustomGraphCalculationTerm["operation"]
            )}
        >
          <option value="add" ?selected=${current === "add"}>Add</option>
          <option value="subtract" ?selected=${current === "subtract"}>Subtract</option>
          <option value="multiply" ?selected=${current === "multiply"}>Multiply</option>
          <option value="divide" ?selected=${current === "divide"}>Divide</option>
        </select>
      </div>
    `;
  }

  private _renderTermSourceFields(
    seriesIndex: number,
    termIndex: number,
    term: EnergyCustomGraphCalculationTerm
  ) {
    if (!this.hass) {
      return html`<p>Loading...</p>`;
    }

    const mode: "statistic" | "constant" =
      term.constant !== undefined ? "constant" : "statistic";
    const buttons: Array<{ value: "statistic" | "constant"; label: string }> = [
      { value: "statistic", label: "Entity" },
      { value: "constant", label: "Constant" },
    ];
    const id = normalizeStatisticId(term.statistic_id);
    const resolution = this._resolveStatisticSource(id);
    const issue = this._getStatisticIssue(id, term.stat_type);
    const metadata = resolution.metadata;
    const statTypeDisabled = !metadata;
    const current = term.stat_type ?? selectDefaultStatisticType(metadata) ?? "";
    return html`
      <div class="field full-width">
        <label>Input type</label>
        ${this._renderButtonToggleGroup(buttons, mode, (value) =>
          this._setTermMode(seriesIndex, termIndex, value)
        )}
      </div>
      ${mode === "statistic"
        ? html`
            <ha-entity-picker
              .hass=${this.hass}
              .value=${term.statistic_id}
              .label=${"Entity"}
              allow-custom-entity
              @value-changed=${(ev: CustomEvent) =>
                this._handleTermStatisticChanged(seriesIndex, termIndex, ev.detail.value || undefined)}
            ></ha-entity-picker>
            <div class="field">
              <label>Statistic type</label>
              <select
                ?disabled=${statTypeDisabled}
                @change=${(ev: Event) =>
                  this._updateTerm(
                    seriesIndex,
                    termIndex,
                    "stat_type",
                    (ev.target as HTMLSelectElement).value as EnergyCustomGraphStatisticType
                  )}
              >
                <option value="" ?selected=${current === ""}>
                  Not used
                </option>
                ${STAT_TYPE_OPTIONS.map(
                  (option) => {
                    const supported = isStatisticTypeSupported(metadata, option.value);
                    return html`<option
                      value=${option.value}
                      ?selected=${current === option.value}
                      ?disabled=${!supported}
                    >
                      ${option.label}
                    </option>`;
                  }
                )}
              </select>
              ${statTypeDisabled
                ? this._renderEditorHelpHint(
                    resolution.status === "raw_only"
                      ? "Statistic type does not affect RAW history."
                      : "Select an entity with recorder statistics to choose a statistic type.",
                    "info"
                  )
                : issue
                  ? this._renderEditorHelpHint(
                      `${issue.cause}${issue.action ? ` · ${issue.action}` : ""}`,
                      issue.severity
                    )
                  : nothing}
            </div>
          `
        : html`
            ${this._renderTextInput({
              label: "Constant",
              helper: "Fixed value added every step",
              type: "number",
              value: term.constant !== undefined ? String(term.constant) : "",
              onInput: (value) =>
                this._updateTermNumber(
                  seriesIndex,
                  termIndex,
                  "constant",
                  value
                ),
            })}
          `}
    `;
  }

  private _renderTermTransformFields(
    seriesIndex: number,
    termIndex: number,
    term: EnergyCustomGraphCalculationTerm
  ) {
    if (term.constant !== undefined) {
      return nothing;
    }
    return html`
      <span class="subtitle term-transform-title">Transform</span>
      ${this._renderTextInput({
        label: "Multiply",
        type: "number",
        value: term.multiply !== undefined ? String(term.multiply) : "",
        onInput: (value) =>
          this._updateTermNumber(
            seriesIndex,
            termIndex,
            "multiply",
            value
          ),
      })}
      ${this._renderTextInput({
        label: "Add",
        type: "number",
        value: term.add !== undefined ? String(term.add) : "",
        onInput: (value) =>
          this._updateTermNumber(seriesIndex, termIndex, "add", value),
      })}
      ${this._renderTextInput({
        label: "Clip min",
        type: "number",
        value: term.clip_min !== undefined ? String(term.clip_min) : "",
        onInput: (value) =>
          this._updateTermNumber(
            seriesIndex,
            termIndex,
            "clip_min",
            value
          ),
      })}
      ${this._renderTextInput({
        label: "Clip max",
        type: "number",
        value: term.clip_max !== undefined ? String(term.clip_max) : "",
        onInput: (value) =>
          this._updateTermNumber(
            seriesIndex,
            termIndex,
            "clip_max",
            value
          ),
      })}
    `;
  }

  private _setTermMode(
    seriesIndex: number,
    termIndex: number,
    mode: "statistic" | "constant"
  ) {
    this._mutateTerm(seriesIndex, termIndex, (draft) => {
      if (mode === "statistic") {
        draft.constant = undefined;
        if (!draft.statistic_id) {
          draft.statistic_id = "";
        }
      } else {
        draft.statistic_id = undefined;
        draft.stat_type = undefined;
        draft.multiply = undefined;
        draft.add = undefined;
        draft.clip_min = undefined;
        draft.clip_max = undefined;
        if (draft.constant === undefined) {
          draft.constant = 0;
        }
      }
    });
  }

  private _renderSeriesStyleSegment(series: EnergyCustomGraphSeriesConfig, index: number) {
    const chartType = series.chart_type ?? "bar";
    const isLineLike = chartType === "line" || chartType === "step";
    const fillActive = isLineLike && series.fill === true;
    const chartButtons: Array<{ value: EnergyCustomGraphChartType; label: string }> = [
      { value: "bar", label: "Bar" },
      { value: "line", label: "Line" },
      { value: "step", label: "Step" },
    ];
    const rawColor =
      typeof series.color === "string" ? series.color.trim() : undefined;
    const presetToken = this._extractPresetToken(rawColor);
    const configColorMode = !rawColor
      ? COLOR_SELECT_DEFAULT
      : presetToken
        ? presetToken
        : COLOR_SELECT_CUSTOM;
    const overrideMode = this._colorModeSelections.get(index);
    const colorMode = overrideMode ?? configColorMode;
    const storedCustom = this._customColorDrafts.get(index);
    const autoColorToken = this._resolveAutoColorToken(index);
    const customTextValue =
      colorMode === COLOR_SELECT_CUSTOM
        ? storedCustom ?? rawColor ?? ""
        : storedCustom ?? "";
    const previewToken =
      colorMode === COLOR_SELECT_DEFAULT
        ? autoColorToken
        : colorMode === COLOR_SELECT_CUSTOM
          ? customTextValue || rawColor || autoColorToken
          : colorMode;
    const previewColor =
      previewToken !== undefined ? this._normalizeColorToken(previewToken) : undefined;
    const customInputValue = colorMode === COLOR_SELECT_CUSTOM ? customTextValue ?? "" : "";

    return html`
      <div class="section">
        <div class="compact-grid two">
          <div class="field">
            <label>Chart type</label>
            ${this._renderButtonToggleGroup(chartButtons, chartType, (value) =>
              this._setSeriesChartType(index, value)
            )}
          </div>
          <div class="field">
            <label>Y axis</label>
            ${this._renderButtonToggleGroup(
              [
                { value: "left", label: "Left" },
                { value: "right", label: "Right" },
              ],
              series.y_axis ?? "left",
              (value) => this._updateSeries(index, "y_axis", value)
            )}
          </div>
        </div>
        <div class="color-row">
          <div class="field">
            <label>Series color</label>
            <div class="color-select-wrapper">
              ${this._renderColorPreview(previewColor, chartType)}
              <select
                .value=${colorMode}
                @change=${(ev: Event) =>
                  this._handleSeriesColorSelect(index, (ev.target as HTMLSelectElement).value)}
              >
                <option
                  value=${COLOR_SELECT_DEFAULT}
                  ?selected=${colorMode === COLOR_SELECT_DEFAULT}
                >
                  Default
                </option>
                ${ENERGY_COLOR_PRESETS.map(
                  (preset) =>
                    html`<option
                      value=${preset.value}
                      ?selected=${colorMode === preset.value}
                    >
                      ${preset.label}
                    </option>`
                )}
                <option
                  value=${COLOR_SELECT_CUSTOM}
                  ?selected=${colorMode === COLOR_SELECT_CUSTOM}
                >
                  Custom
                </option>
              </select>
            </div>
          </div>
        </div>
        ${colorMode === COLOR_SELECT_CUSTOM
          ? html`
              <div class="color-row">
                ${this._renderTextInput({
                  label: "Custom color",
                  value: customInputValue ?? "",
                  onInput: (value) =>
                    this._handleCustomColorInput(index, value),
                })}
              </div>
            `
          : nothing}
        ${this._renderTextInput({
          label: "Stack group",
          helper: "Series using the same name stack together.",
          value: series.stack ?? "",
          onInput: (value) =>
            this._updateSeries(index, "stack", value || undefined),
        })}
        ${isLineLike
          ? html`
              ${this._renderCompactToggle("Fill", series.fill === true, (value) =>
                this._updateSeries(index, "fill", value)
              )}
            `
          : nothing}
        ${this._renderSeriesStyleMore(series, index, fillActive)}
      </div>
    `;
  }

  private _renderSeriesStyleMore(
    series: EnergyCustomGraphSeriesConfig,
    index: number,
    fillActive: boolean
  ) {
    const chartType = series.chart_type ?? "bar";
    const isLineLike = chartType === "line" || chartType === "step";
    const gradientFillActive = fillActive && series.gradient_fill === true;
    const fillOpacityHelper = isLineLike
      ? gradientFillActive
        ? "Default 0.75, zero line 0.25."
        : "Default 0.15 for line fill."
      : "Default 0.5 for bars.";
    const count = this._countSeriesStyleMoreFields(series);
    const expanded = this._seriesStyleMoreExpanded.has(index) || count > 0;
    const compareRawColor =
      typeof series.compare_color === "string" ? series.compare_color.trim() : undefined;
    const comparePresetToken = this._extractPresetToken(compareRawColor);
    const compareConfigMode = !compareRawColor
      ? COLOR_SELECT_INHERIT
      : comparePresetToken
        ? comparePresetToken
        : COLOR_SELECT_CUSTOM;
    const compareOverride = this._compareColorModeSelections.get(index);
    const compareMode = compareOverride ?? compareConfigMode;
    const compareStoredCustom = this._compareCustomColorDrafts.get(index);
    const compareCustomText = compareMode === COLOR_SELECT_CUSTOM
      ? compareStoredCustom ?? compareRawColor ?? ""
      : compareStoredCustom ?? "";
    const baseColor = this._deriveCustomDraftForSeries(index);
    const comparePreviewSource =
      compareMode === COLOR_SELECT_INHERIT
        ? baseColor
        : compareMode === COLOR_SELECT_CUSTOM
          ? compareStoredCustom ?? compareRawColor ?? ""
          : compareMode;
    const comparePreviewColor =
      comparePreviewSource !== undefined
        ? this._normalizeColorToken(comparePreviewSource)
        : undefined;
    const compareColorControl = html`
      <div class="color-row">
        <div class="field">
          <label>Compare series color</label>
          <div class="color-select-wrapper">
            ${this._renderColorPreview(comparePreviewColor, chartType)}
            <select
              .value=${compareMode}
              @change=${(ev: Event) =>
                this._handleCompareColorSelect(
                  index,
                  (ev.target as HTMLSelectElement).value
                )}
            >
              <option
                value=${COLOR_SELECT_INHERIT}
                ?selected=${compareMode === COLOR_SELECT_INHERIT}
              >
                Inherit
              </option>
              ${ENERGY_COLOR_PRESETS.map(
                (preset) =>
                  html`<option
                    value=${preset.value}
                    ?selected=${compareMode === preset.value}
                  >
                    ${preset.label}
                  </option>`
              )}
              <option
                value=${COLOR_SELECT_CUSTOM}
                ?selected=${compareMode === COLOR_SELECT_CUSTOM}
              >
                Custom
              </option>
            </select>
          </div>
        </div>
      </div>
      ${compareMode === COLOR_SELECT_CUSTOM
        ? html`
            <div class="color-row">
              ${this._renderTextInput({
                label: "Custom compare color",
                value: compareCustomText ?? "",
                onInput: (value) =>
                  this._handleCompareCustomColorInput(index, value),
              })}
            </div>
          `
        : nothing}
    `;

    return this._renderMoreBlock({
      count,
      expanded,
      onToggle: () => this._toggleSeriesStyleMore(index, expanded),
      body: html`
        ${fillActive
          ? html`
              ${this._renderCompactToggle(
                "Gradient fill",
                series.gradient_fill === true,
                (value) => this._updateSeries(index, "gradient_fill", value)
              )}
            `
          : nothing}
        ${this._renderTextInput({
          label: "Fill opacity",
          type: "number",
          step: "0.01",
          min: "0",
          max: "1",
          helper: fillOpacityHelper,
          value: series.fill_opacity !== undefined ? String(series.fill_opacity) : "",
          onInput: (value) =>
            this._updateSeriesNumber(index, "fill_opacity", value),
        })}
        ${fillActive
          ? this._renderTextInput({
              label: "Fill to series",
              helper: "Name of the line series to fill towards.",
              value: series.fill_to_series ?? "",
              onInput: (value) =>
                this._updateSeries(index, "fill_to_series", value || undefined),
            })
          : nothing}
        ${this._renderTextInput({
          label: "Line opacity",
          type: "number",
          step: "0.01",
          min: "0",
          max: "1",
          helper: "Default 0.85 for lines, 1.0 for bars.",
          value: series.line_opacity !== undefined ? String(series.line_opacity) : "",
          onInput: (value) =>
            this._updateSeriesNumber(index, "line_opacity", value),
        })}
        ${compareColorControl}
        ${isLineLike
          ? html`
              ${this._renderTextInput({
                label: "Line width",
                type: "number",
                step: "0.5",
                min: "0.5",
                helper: "Default 1.5.",
                value: series.line_width !== undefined ? String(series.line_width) : "",
                onInput: (value) =>
                  this._updateSeriesNumber(index, "line_width", value),
              })}
              <div class="field">
                <label>Line style</label>
                ${this._renderButtonToggleGroup(
                  [
                    { value: "solid", label: "Solid" },
                    { value: "dashed", label: "Dashed" },
                    { value: "dotted", label: "Dotted" },
                  ],
                  series.line_style ?? "solid",
                  (value) => this._setSeriesLineStyle(index, value)
                )}
              </div>
              ${this._renderTextInput({
                label: "Smooth",
                helper: "Boolean or number (0-1). Empty uses default.",
                value: series.smooth !== undefined ? String(series.smooth) : "",
                onInput: (value) =>
                  this._updateSeriesSmooth(index, value),
              })}
            `
          : nothing}
      `,
    });
  }

  private _renderSeriesVisibilitySegment(
    series: EnergyCustomGraphSeriesConfig,
    index: number
  ) {
    const chartType = series.chart_type ?? "bar";
    const showValueLabels = chartType === "bar" && series.show_value_labels === true;
    return html`
      <div class="section">
        <div class="toggle-grid" role="group" aria-label="Series visibility">
          ${this._renderCompactToggle(
            "Chart",
            series.show_in_chart !== false,
            (value) => this._updateSeries(index, "show_in_chart", value)
          )}
          ${this._renderCompactToggle(
            "Legend",
            series.show_in_legend !== false,
            (value) => this._updateSeries(index, "show_in_legend", value)
          )}
          ${this._renderCompactToggle(
            "Tooltip",
            series.show_in_tooltip !== false,
            (value) => this._updateSeries(index, "show_in_tooltip", value)
          )}
          ${this._renderCompactToggle(
            "Hidden by default",
            series.hidden_by_default === true,
            (value) => this._updateSeries(index, "hidden_by_default", value)
          )}
          ${chartType === "bar"
            ? this._renderCompactToggle(
                "Value labels",
                showValueLabels,
                (value) => this._updateSeries(index, "show_value_labels", value)
              )
            : nothing}
        </div>
      </div>
    `;
  }

  private _countSeriesStyleMoreFields(
    series: EnergyCustomGraphSeriesConfig
  ): number {
    return [
      series.compare_color,
      series.gradient_fill === true ? true : undefined,
      series.fill_opacity,
      series.fill_to_series,
      series.line_opacity,
      series.line_width,
      series.line_style && series.line_style !== "solid" ? series.line_style : undefined,
      series.smooth,
    ].filter((value) => value !== undefined && value !== "").length;
  }

  private _toggleSeriesStyleMore(index: number, expanded: boolean) {
    const next = new Set(this._seriesStyleMoreExpanded);
    if (expanded) {
      next.delete(index);
    } else {
      next.add(index);
    }
    this._seriesStyleMoreExpanded = next;
  }

  private _toggleSeriesSourceMore(index: number, expanded: boolean) {
    const next = new Set(this._seriesSourceMoreExpanded);
    if (expanded) {
      next.delete(index);
    } else {
      next.add(index);
    }
    this._seriesSourceMoreExpanded = next;
  }

  private _renderSeriesDisplayGroup(series: EnergyCustomGraphSeriesConfig, index: number) {
    const chartType = series.chart_type ?? "bar";
    const isLineLike = chartType === "line" || chartType === "step";
    const isBar = chartType === "bar";
    const fillEnabled = isLineLike;
    const fillActive = fillEnabled && series.fill === true;
    const gradientFillActive = fillActive && series.gradient_fill === true;
    const fillOpacityHelper = isLineLike
      ? gradientFillActive
        ? "Default 0.75 (zero line 0.25)"
        : "Default 0.15 for line fill"
      : "Default 0.5 for bars";
    const rawColor =
      typeof series.color === "string" ? series.color.trim() : undefined;
    const presetToken = this._extractPresetToken(rawColor);
    const configColorMode = !rawColor
      ? COLOR_SELECT_DEFAULT
      : presetToken
        ? presetToken
        : COLOR_SELECT_CUSTOM;
    const overrideMode = this._colorModeSelections.get(index);
    const colorMode = overrideMode ?? configColorMode;
    const storedCustom = this._customColorDrafts.get(index);
    const autoColorToken = this._resolveAutoColorToken(index);
    const customTextValue =
      colorMode === COLOR_SELECT_CUSTOM
        ? storedCustom ?? rawColor ?? ""
        : storedCustom ?? "";
    const previewToken =
      colorMode === COLOR_SELECT_DEFAULT
        ? autoColorToken
        : colorMode === COLOR_SELECT_CUSTOM
          ? customTextValue || rawColor || autoColorToken
          : colorMode;
    const previewColor =
      previewToken !== undefined ? this._normalizeColorToken(previewToken) : undefined;
    const customInputValue = colorMode === COLOR_SELECT_CUSTOM ? customTextValue ?? "" : "";

    const compareRawColor =
      typeof series.compare_color === "string" ? series.compare_color.trim() : undefined;
    const comparePresetToken = this._extractPresetToken(compareRawColor);
    const compareConfigMode = !compareRawColor
      ? COLOR_SELECT_INHERIT
      : comparePresetToken
        ? comparePresetToken
        : COLOR_SELECT_CUSTOM;
    const compareOverride = this._compareColorModeSelections.get(index);
    const compareMode = compareOverride ?? compareConfigMode;
    const compareStoredCustom = this._compareCustomColorDrafts.get(index);
    const compareCustomText = compareMode === COLOR_SELECT_CUSTOM
      ? compareStoredCustom ?? compareRawColor ?? ""
      : compareStoredCustom ?? "";
    const comparePreviewSource =
      compareMode === COLOR_SELECT_INHERIT
        ? previewToken
        : compareMode === COLOR_SELECT_CUSTOM
          ? compareStoredCustom ?? compareRawColor ?? ""
          : compareMode;
    const comparePreviewColor =
      comparePreviewSource !== undefined
        ? this._normalizeColorToken(comparePreviewSource)
        : undefined;
    return html`
      <div class="group-card">
        <div class="group-header">
          <span class="group-title">Display</span>
        </div>
        <div class="group-body">
          <div class="color-row">
            <div class="field">
              <label>Series color</label>
              <div class="color-select-wrapper">
                ${this._renderColorPreview(previewColor, chartType)}
                <select
                  .value=${colorMode}
                  @change=${(ev: Event) =>
                    this._handleSeriesColorSelect(index, (ev.target as HTMLSelectElement).value)}
                >
                  <option
                    value=${COLOR_SELECT_DEFAULT}
                    ?selected=${colorMode === COLOR_SELECT_DEFAULT}
                  >
                    Default (Auto palette)
                  </option>
                  ${ENERGY_COLOR_PRESETS.map(
                    (preset) =>
                      html`<option
                        value=${preset.value}
                        ?selected=${colorMode === preset.value}
                      >
                        ${preset.label}
                      </option>`
                  )}
                  <option
                    value=${COLOR_SELECT_CUSTOM}
                    ?selected=${colorMode === COLOR_SELECT_CUSTOM}
                  >
                    Custom
                  </option>
                </select>
              </div>
            </div>
          </div>
          ${colorMode === COLOR_SELECT_CUSTOM
            ? html`
                <div class="color-row">
                  ${this._renderTextInput({
                    label: "Custom color",
                    value: customInputValue ?? "",
                    onInput: (value) =>
                      this._handleCustomColorInput(index, value),
                  })}
                </div>
              `
            : nothing}
          <div class="color-row">
            <div class="field">
              <label>Compare series color</label>
              <div class="color-select-wrapper">
                ${this._renderColorPreview(
                  comparePreviewColor,
                  chartType
                )}
                <select
                  .value=${compareMode}
                  @change=${(ev: Event) =>
                    this._handleCompareColorSelect(
                      index,
                      (ev.target as HTMLSelectElement).value
                    )}
                >
                  <option
                    value=${COLOR_SELECT_INHERIT}
                    ?selected=${compareMode === COLOR_SELECT_INHERIT}
                  >
                    Inherit (default)
                  </option>
                  ${ENERGY_COLOR_PRESETS.map(
                    (preset) =>
                      html`<option
                        value=${preset.value}
                        ?selected=${compareMode === preset.value}
                      >
                        ${preset.label}
                      </option>`
                  )}
                  <option
                    value=${COLOR_SELECT_CUSTOM}
                    ?selected=${compareMode === COLOR_SELECT_CUSTOM}
                  >
                    Custom
                  </option>
                </select>
              </div>
            </div>
          </div>
          ${compareMode === COLOR_SELECT_CUSTOM
            ? html`
                <div class="color-row">
                  ${this._renderTextInput({
                    label: "Custom compare color",
                    value: compareCustomText ?? "",
                    onInput: (value) =>
                      this._handleCompareCustomColorInput(index, value),
                  })}
                </div>
              `
            : nothing}
          ${this._renderCompactToggle(
            "Show in legend",
            series.show_in_legend !== false,
            (value) => this._updateSeries(index, "show_in_legend", value)
          )}
          ${this._renderCompactToggle(
            "Hidden by default",
            series.hidden_by_default === true,
            (value) => this._updateSeries(index, "hidden_by_default", value)
          )}
          ${this._renderCompactToggle(
            "Show in chart",
            series.show_in_chart !== false,
            (value) => this._updateSeries(index, "show_in_chart", value)
          )}
          ${this._renderCompactToggle(
            "Show in tooltip",
            series.show_in_tooltip !== false,
            (value) => this._updateSeries(index, "show_in_tooltip", value)
          )}
          ${isBar
            ? html`
                ${this._renderCompactToggle(
                  "Show value labels",
                  series.show_value_labels === true,
                  (value) => this._updateSeries(index, "show_value_labels", value)
                )}
                ${series.show_value_labels === true
                  ? this._renderTextInput({
                      label: "Value label precision",
                      type: "number",
                      step: "1",
                      min: "0",
                      helper: "Default 0, no unit",
                      value:
                        series.value_label_precision !== undefined
                          ? String(series.value_label_precision)
                          : "",
                      onInput: (value) =>
                        this._updateSeriesNumber(
                          index,
                          "value_label_precision",
                          value
                        ),
                    })
                  : nothing}
              `
            : nothing}
          ${fillEnabled
            ? html`
                ${this._renderCompactToggle("Fill area", series.fill === true, (value) =>
                  this._updateSeries(index, "fill", value)
                )}
              `
            : nothing}
          ${fillActive
            ? html`
                ${this._renderCompactToggle(
                  "Gradient fill",
                  series.gradient_fill === true,
                  (value) => this._updateSeries(index, "gradient_fill", value)
                )}
              `
            : nothing}
          ${this._renderTextInput({
            label: "Fill opacity",
            type: "number",
            step: "0.01",
            min: "0",
            max: "1",
            helper: fillOpacityHelper,
            value: series.fill_opacity !== undefined ? String(series.fill_opacity) : "",
            onInput: (value) =>
              this._updateSeriesNumber(
                index,
                "fill_opacity",
                value
              ),
          })}
          ${fillActive
            ? html`
                ${this._renderTextInput({
                  label: "Fill to series",
                  helper: "Name of the line series to fill towards",
                  value: series.fill_to_series ?? "",
                  onInput: (value) =>
                    this._updateSeries(
                      index,
                      "fill_to_series",
                      value || undefined
                    ),
                })}
              `
            : nothing}
          ${this._renderTextInput({
            label: "Line opacity",
            type: "number",
            step: "0.01",
            min: "0",
            max: "1",
            helper: "Default 0.85 for lines, 1.0 for bars",
            value: series.line_opacity !== undefined ? String(series.line_opacity) : "",
            onInput: (value) =>
              this._updateSeriesNumber(index, "line_opacity", value),
          })}
          ${isLineLike
            ? html`
                ${this._renderTextInput({
                  label: "Line width",
                  type: "number",
                  step: "0.5",
                  min: "0.5",
                  helper: "Default 1.5",
                  value: series.line_width !== undefined ? String(series.line_width) : "",
                  onInput: (value) =>
                    this._updateSeriesNumber(
                      index,
                      "line_width",
                      value
                    ),
                })}
                <div class="field">
                  <label>Line style</label>
                  ${this._renderButtonToggleGroup(
                    [
                      { value: "solid", label: "Solid" },
                      { value: "dashed", label: "Dashed" },
                      { value: "dotted", label: "Dotted" },
                    ],
                    series.line_style ?? "solid",
                    (value) => this._setSeriesLineStyle(index, value)
                  )}
                </div>
              `
            : nothing}
          ${this._renderTextInput({
            label: "Stack group",
            helper: "Series using the same name will stack together",
            value: series.stack ?? "",
            onInput: (value) =>
              this._updateSeries(index, "stack", value || undefined),
          })}
        </div>
      </div>
    `;
  }

  private _renderSeriesTransformGroup(series: EnergyCustomGraphSeriesConfig, index: number) {
    return html`
      <div class="section">
          ${this._renderTextInput({
            label: "Multiply",
            type: "number",
            value: series.multiply !== undefined ? String(series.multiply) : "",
            onInput: (value) =>
              this._updateSeriesNumber(index, "multiply", value),
          })}
          ${this._renderTextInput({
            label: "Add",
            type: "number",
            value: series.add !== undefined ? String(series.add) : "",
            onInput: (value) =>
              this._updateSeriesNumber(index, "add", value),
          })}
          ${this._renderTextInput({
            label: "Clip min",
            type: "number",
            value: series.clip_min !== undefined ? String(series.clip_min) : "",
            onInput: (value) =>
              this._updateSeriesNumber(index, "clip_min", value),
          })}
          ${this._renderTextInput({
            label: "Clip max",
            type: "number",
            value: series.clip_max !== undefined ? String(series.clip_max) : "",
            onInput: (value) =>
              this._updateSeriesNumber(index, "clip_max", value),
          })}
      </div>
    `;
  }

  private _setSeriesChartType(index: number, type: EnergyCustomGraphChartType) {
    const series = this._config!.series ?? [];
    if (!series[index] || series[index]?.chart_type === type) {
      return;
    }
    this._updateSeries(index, "chart_type", type);
    if (type !== "line") {
      this._updateSeries(index, "smooth", undefined);
    }
  }

  private _setSeriesLineStyle(index: number, style: "solid" | "dashed" | "dotted") {
    const series = this._config!.series ?? [];
    if (series[index]?.line_style === style) {
      return;
    }
    this._updateSeries(index, "line_style", style);
  }

  private _setSeriesSource(index: number, mode: "statistic" | "calculation" | "forecast") {
    const series = this._config!.series ?? [];
    const current = series[index];
    if (!current) {
      return;
    }
    const currentSource = this._resolveSeriesSource(current);
    if (currentSource === mode) {
      return;
    }
    if (mode === "calculation") {
      this._replaceSeries(index, convertSeriesToCalculation(current));
      this._setSeriesOptionGroupExpanded(index, "source", true);
      return;
    }
    if (mode === "forecast") {
      this._replaceSeries(index, cleanSeriesForForecast(current));
      this._setSeriesOptionGroupExpanded(index, "source", true);
      return;
    }
    this._replaceSeries(index, convertSeriesToStatistic(current));
    this._setSeriesOptionGroupExpanded(index, "source", true);
  }

  private _getSeriesReferenceOptions(): Array<{ value: string; label: string }> {
    return (this._config?.series ?? [])
      .filter((series) => typeof series.id === "string" && series.id.trim().length)
      .map((series, index) => {
        const id = series.id!.trim();
        const label =
          series.name ??
          series.statistic_id ??
          series.pv_production_entity ??
          (series.calculation ? "Calculation series" : `Series ${index + 1}`);
        return {
          value: id,
          label: `${label} (${id})`,
        };
      });
  }

  private _getStackOptions(): string[] {
    const stacks = new Set<string>();
    (this._config?.series ?? []).forEach((series) => {
      const stack = series.stack?.trim();
      if (stack) {
        stacks.add(stack);
      }
    });
    return Array.from(stacks).sort((a, b) => a.localeCompare(b));
  }

  private _createDefaultHeaderMetric(
    mode: "series" | "stack" | "entity_state" | "calculation" = "series"
  ): EnergyCustomGraphHeaderMetricConfig {
    if (mode === "stack") {
      return {
        source: "stack",
        stack: this._getStackOptions()[0],
        reducer: "sum",
        sign: "signed",
      };
    }
    if (mode === "entity_state") {
      return {
        source: "entity_state",
        entity_id: "",
      };
    }
    if (mode === "calculation") {
      return {
        calculation: {
          initial_value: 0,
          terms: [this._createDefaultHeaderCalculationTerm("series")],
        },
      };
    }
    return {
      source: "series",
      series_id: this._getSeriesReferenceOptions()[0]?.value,
      reducer: "sum",
    };
  }

  private _createDefaultHeaderCalculationTerm(
    source: "series" | "stack" | "entity_state" | "constant"
  ): EnergyCustomGraphHeaderCalculationTermConfig {
    if (source === "stack") {
      return {
        operation: "add",
        source: "stack",
        stack: this._getStackOptions()[0],
        reducer: "sum",
        sign: "signed",
      };
    }
    if (source === "entity_state") {
      return {
        operation: "add",
        source: "entity_state",
        entity_id: "",
      };
    }
    if (source === "constant") {
      return {
        operation: "add",
        source: "constant",
        constant: 0,
      };
    }
    return {
      operation: "add",
      source: "series",
      series_id: this._getSeriesReferenceOptions()[0]?.value,
      reducer: "sum",
    };
  }

  private _getHeaderMetricMode(
    metric: EnergyCustomGraphHeaderMetricConfig
  ): "series" | "stack" | "entity_state" | "calculation" {
    if ("calculation" in metric) {
      return "calculation";
    }
    return metric.source;
  }

  private _setHeaderChipEnabled(enabled: boolean) {
    if (!enabled) {
      this._updateConfig("header", undefined);
      return;
    }
    const current = this._config?.header?.chip;
    this._updateHeaderChip(
      current ?? {
        metric: this._createDefaultHeaderMetric(),
      }
    );
  }

  private _updateHeaderChip(chip: EnergyCustomGraphHeaderChipConfig) {
    this._updateConfig("header", {
      ...(this._config?.header ?? {}),
      chip,
    });
  }

  private _updateHeaderChipField(
    key: keyof EnergyCustomGraphHeaderChipConfig,
    value: unknown
  ) {
    const chip = {
      ...(this._config?.header?.chip ?? {
        metric: this._createDefaultHeaderMetric(),
      }),
    };
    if (value === undefined || value === "") {
      delete (chip as any)[key];
    } else {
      (chip as any)[key] = value;
    }
    this._updateHeaderChip(chip);
  }

  private _updateHeaderChipNumber(
    key: keyof EnergyCustomGraphHeaderChipConfig,
    raw: string
  ) {
    this._updateHeaderChipField(
      key,
      raw === "" ? undefined : Number(raw)
    );
  }

  private _updateHeaderMetric(metric: EnergyCustomGraphHeaderMetricConfig) {
    const chip = {
      ...(this._config?.header?.chip ?? {}),
      metric,
    };
    this._updateHeaderChip(chip);
  }

  private _setHeaderMetricMode(
    mode: "series" | "stack" | "entity_state" | "calculation"
  ) {
    const current = this._config?.header?.chip?.metric;
    if (current && this._getHeaderMetricMode(current) === mode) {
      return;
    }
    this._updateHeaderMetric(this._createDefaultHeaderMetric(mode));
    if (mode === "calculation") {
      this._expandedHeaderTermKeys = new Set([0]);
    }
  }

  private _updateHeaderCalculation(
    calculation: EnergyCustomGraphHeaderCalculationConfig
  ) {
    const metric = this._config?.header?.chip?.metric;
    const calculationMetric =
      metric && "calculation" in metric
        ? { ...metric, calculation }
        : {
            ...this._createDefaultHeaderMetric("calculation"),
            calculation,
          };
    this._updateHeaderMetric(calculationMetric);
  }

  private _addHeaderCalculationTerm() {
    const metric = this._config?.header?.chip?.metric;
    const calculation =
      metric && "calculation" in metric
        ? metric.calculation
        : { initial_value: 0, terms: [] };
    const terms = [
      ...(calculation.terms ?? []),
      this._createDefaultHeaderCalculationTerm("series"),
    ];
    this._updateHeaderCalculation({
      ...calculation,
      terms,
    });
    this._expandedHeaderTermKeys = new Set(this._expandedHeaderTermKeys).add(
      terms.length - 1
    );
  }

  private _removeHeaderCalculationTerm(index: number) {
    const metric = this._config?.header?.chip?.metric;
    if (!metric || !("calculation" in metric)) {
      return;
    }
    const terms = [...(metric.calculation.terms ?? [])];
    terms.splice(index, 1);
    this._updateHeaderCalculation({
      ...metric.calculation,
      terms,
    });
    const nextExpanded = new Set<number>();
    this._expandedHeaderTermKeys.forEach((oldIndex) => {
      if (oldIndex === index) {
        return;
      }
      nextExpanded.add(oldIndex > index ? oldIndex - 1 : oldIndex);
    });
    this._expandedHeaderTermKeys = nextExpanded;
  }

  private _moveHeaderCalculationTerm(oldIndex: number, newIndex: number) {
    const metric = this._config?.header?.chip?.metric;
    if (!metric || !("calculation" in metric)) {
      return;
    }
    const terms = [...(metric.calculation.terms ?? [])];
    if (!this._canMoveIndex(terms, oldIndex, newIndex)) {
      return;
    }

    terms.splice(newIndex, 0, terms.splice(oldIndex, 1)[0]);
    this._updateHeaderCalculation({
      ...metric.calculation,
      terms,
    });
    this._expandedHeaderTermKeys = new Set(
      Array.from(this._expandedHeaderTermKeys).map((index) =>
        this._remapMovedIndex(index, oldIndex, newIndex)
      )
    );
  }

  private _setHeaderTermSource(
    index: number,
    source: "series" | "stack" | "entity_state" | "constant"
  ) {
    const metric = this._config?.header?.chip?.metric;
    if (!metric || !("calculation" in metric)) {
      return;
    }
    const current = metric.calculation.terms?.[index];
    const next = {
      ...this._createDefaultHeaderCalculationTerm(source),
      operation: current?.operation ?? "add",
    };
    const terms = [...(metric.calculation.terms ?? [])];
    terms[index] = next;
    this._updateHeaderCalculation({
      ...metric.calculation,
      terms,
    });
    this._expandedHeaderTermKeys = new Set(this._expandedHeaderTermKeys).add(index);
  }

  private _updateHeaderCalculationTerm(
    index: number,
    key: string,
    value: unknown
  ) {
    const metric = this._config?.header?.chip?.metric;
    if (!metric || !("calculation" in metric)) {
      return;
    }
    const terms = [...(metric.calculation.terms ?? [])];
    if (index < 0 || index >= terms.length) {
      return;
    }
    const term = { ...terms[index] } as Record<string, unknown>;
    if (value === undefined || value === "") {
      delete term[key];
    } else {
      term[key] = value;
    }
    terms[index] = term as EnergyCustomGraphHeaderCalculationTermConfig;
    this._updateHeaderCalculation({
      ...metric.calculation,
      terms,
    });
    this._expandedHeaderTermKeys = new Set(this._expandedHeaderTermKeys).add(index);
  }

  private _toggleHeaderTermExpanded(index: number) {
    const next = new Set(this._expandedHeaderTermKeys);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    this._expandedHeaderTermKeys = next;
  }

  private _formatHeaderTermDescriptor(
    term: EnergyCustomGraphHeaderCalculationTermConfig
  ): string {
    if (term.source === "series") {
      const option = this._getSeriesReferenceOptions().find(
        (item) => item.value === term.series_id
      );
      return option?.label ?? term.series_id ?? "No series selected";
    }
    if (term.source === "stack") {
      return term.stack ? `Stack: ${term.stack}` : "No stack selected";
    }
    if (term.source === "entity_state") {
      return term.entity_id ?? "No entity selected";
    }
    if (term.source === "constant") {
      return `Constant: ${term.constant ?? 0}`;
    }
    return "No input selected";
  }

  private _addSeries() {
    const newSeries: EnergyCustomGraphSeriesConfig = {
      statistic_id: "",
      chart_type: "bar",
    };
    const updated = [...(this._config!.series ?? []), newSeries];
    this._updateConfig("series", updated);
    const index = updated.length - 1;
    this._expandedSeries = new Set(this._expandedSeries).add(index);
    this._setSeriesOptionGroupExpanded(index, "source", true);
  }

  private _handleSeriesMoved(
    ev: CustomEvent<{ oldIndex: number; newIndex: number }>
  ): void {
    if (ev.target !== ev.currentTarget) {
      return;
    }
    ev.stopPropagation();
    this._moveSeries(ev.detail.oldIndex, ev.detail.newIndex);
  }

  private _moveSeries(oldIndex: number, newIndex: number) {
    const series = [...(this._config!.series ?? [])];
    if (!this._canMoveIndex(series, oldIndex, newIndex)) {
      return;
    }

    series.splice(newIndex, 0, series.splice(oldIndex, 1)[0]);
    this._moveSeriesIndexState(oldIndex, newIndex);
    this._updateConfig("series", series);
  }

  private _moveSeriesIndexState(oldIndex: number, newIndex: number) {
    const remapIndex = (value: number) =>
      this._remapMovedIndex(value, oldIndex, newIndex);

    this._expandedSeries = new Set(
      Array.from(this._expandedSeries).map(remapIndex)
    );
    this._seriesStyleMoreExpanded = new Set(
      Array.from(this._seriesStyleMoreExpanded).map(remapIndex)
    );
    this._seriesSourceMoreExpanded = new Set(
      Array.from(this._seriesSourceMoreExpanded).map(remapIndex)
    );

    const nextOptionGroups = new Map<string, boolean>();
    this._seriesOptionGroupsExpanded.forEach((expanded, key) => {
      const parsed = this._parseSeriesOptionGroupKey(key);
      if (!parsed) {
        return;
      }
      nextOptionGroups.set(
        this._seriesOptionGroupKey(remapIndex(parsed.index), parsed.group),
        expanded
      );
    });
    this._seriesOptionGroupsExpanded = nextOptionGroups;

    const nextTermKeys: string[] = [];
    this._expandedTermKeys.forEach((key) => {
      const [seriesPart, termPart] = key.split("-");
      const oldSeriesIndex = Number(seriesPart);
      if (Number.isNaN(oldSeriesIndex)) {
        return;
      }
      nextTermKeys.push(`${remapIndex(oldSeriesIndex)}-${termPart}`);
    });
    this._expandedTermKeys = new Set(nextTermKeys);
  }

  private _handleCalculationTermMoved(
    ev: CustomEvent<{ oldIndex: number; newIndex: number }>,
    seriesIndex: number
  ): void {
    ev.stopPropagation();
    this._moveCalculationTerm(seriesIndex, ev.detail.oldIndex, ev.detail.newIndex);
  }

  private _handleHeaderCalculationTermMoved(
    ev: CustomEvent<{ oldIndex: number; newIndex: number }>
  ): void {
    ev.stopPropagation();
    this._moveHeaderCalculationTerm(ev.detail.oldIndex, ev.detail.newIndex);
  }

  private _canMoveIndex<T>(items: T[], oldIndex: number, newIndex: number): boolean {
    return (
      oldIndex !== newIndex &&
      oldIndex >= 0 &&
      newIndex >= 0 &&
      oldIndex < items.length &&
      newIndex < items.length
    );
  }

  private _remapMovedIndex(value: number, oldIndex: number, newIndex: number): number {
    if (value === oldIndex) {
      return newIndex;
    }
    if (oldIndex < newIndex && value > oldIndex && value <= newIndex) {
      return value - 1;
    }
    if (oldIndex > newIndex && value >= newIndex && value < oldIndex) {
      return value + 1;
    }
    return value;
  }

  private _duplicateSeries(index: number) {
    const series = [...(this._config!.series ?? [])];
    const current = series[index];
    if (!current) {
      return;
    }
    const duplicate = cloneSeriesForDuplicate(current);
    series.splice(index + 1, 0, duplicate);
    this._updateConfig("series", series);
    const duplicateIndex = index + 1;
    const nextExpanded = new Set<number>();
    this._expandedSeries.forEach((oldIndex) => {
      nextExpanded.add(oldIndex > index ? oldIndex + 1 : oldIndex);
    });
    nextExpanded.add(duplicateIndex);
    this._expandedSeries = nextExpanded;
    this._setSeriesOptionGroupExpanded(duplicateIndex, "source", true);
  }

  private _confirmRemoveSeries(index: number) {
    const series = this._config?.series?.[index];
    const label = series ? this._formatSeriesTitle(series, index) : `Series ${index + 1}`;
    if (!window.confirm(`Delete ${label}?`)) {
      return;
    }
    this._removeSeries(index);
  }

  private _removeSeries(index: number) {
    const series = [...(this._config!.series ?? [])];
    series.splice(index, 1);
    this._updateConfig("series", series);
    const updatedExpanded = new Set<number>();
    this._expandedSeries.forEach((oldIndex) => {
      if (oldIndex === index) {
        return;
      }
      const newIndex = oldIndex > index ? oldIndex - 1 : oldIndex;
      if (newIndex >= 0 && newIndex < series.length) {
        updatedExpanded.add(newIndex);
      }
    });
    this._expandedSeries = updatedExpanded;

    const updatedTermKeys: string[] = [];
    this._expandedTermKeys.forEach((key) => {
      const [seriesPart, termPart] = key.split("-");
      const oldSeriesIndex = Number(seriesPart);
      if (Number.isNaN(oldSeriesIndex)) {
        return;
      }
      if (oldSeriesIndex === index) {
        return;
      }
      const newSeriesIndex = oldSeriesIndex > index ? oldSeriesIndex - 1 : oldSeriesIndex;
      if (newSeriesIndex >= 0 && newSeriesIndex < series.length) {
        updatedTermKeys.push(`${newSeriesIndex}-${termPart}`);
      }
    });
    this._expandedTermKeys = new Set(updatedTermKeys);
    this._seriesStyleMoreExpanded = new Set(
      Array.from(this._seriesStyleMoreExpanded)
        .filter((oldIndex) => oldIndex !== index)
        .map((oldIndex) => (oldIndex > index ? oldIndex - 1 : oldIndex))
        .filter((newIndex) => newIndex >= 0 && newIndex < series.length)
    );
    this._seriesSourceMoreExpanded = new Set(
      Array.from(this._seriesSourceMoreExpanded)
        .filter((oldIndex) => oldIndex !== index)
        .map((oldIndex) => (oldIndex > index ? oldIndex - 1 : oldIndex))
        .filter((newIndex) => newIndex >= 0 && newIndex < series.length)
    );
    const nextOptionGroups = new Map<string, boolean>();
    this._seriesOptionGroupsExpanded.forEach((expanded, key) => {
      const parsed = this._parseSeriesOptionGroupKey(key);
      if (!parsed || parsed.index === index) {
        return;
      }
      const newIndex = parsed.index > index ? parsed.index - 1 : parsed.index;
      if (newIndex >= 0 && newIndex < series.length) {
        nextOptionGroups.set(
          this._seriesOptionGroupKey(newIndex, parsed.group),
          expanded
        );
      }
    });
    this._seriesOptionGroupsExpanded = nextOptionGroups;
  }

  private _addCalculationTerm(index: number) {
    const series = [...(this._config!.series ?? [])];
    const target = { ...series[index] };
    const calculation: EnergyCustomGraphCalculationConfig = {
      ...(target.calculation ?? { terms: [] }),
      terms: [...(target.calculation?.terms ?? []), { operation: "add" }],
    };
    target.calculation = calculation;
    series[index] = target;
    this._updateConfig("series", series);
    this._expandedSeries = new Set(this._expandedSeries).add(index);
    const newTermIndex = (calculation.terms?.length ?? 1) - 1;
    this._expandedTermKeys = new Set(this._expandedTermKeys).add(`${index}-${newTermIndex}`);
  }

  private _removeCalculationTerm(seriesIndex: number, termIndex: number) {
    const series = [...(this._config!.series ?? [])];
    const target = { ...series[seriesIndex] };
    if (!target.calculation?.terms) {
      return;
    }
    const terms = [...target.calculation.terms];
    terms.splice(termIndex, 1);
    target.calculation = { ...target.calculation, terms };
    series[seriesIndex] = target;
    this._updateConfig("series", series);
    const nextKeys: string[] = [];
    this._expandedTermKeys.forEach((key) => {
      const [seriesPart, termPart] = key.split("-");
      const oldSeriesIndex = Number(seriesPart);
      const oldTermIndex = Number(termPart);
      if (oldSeriesIndex !== seriesIndex || Number.isNaN(oldTermIndex)) {
        nextKeys.push(key);
        return;
      }
      if (oldTermIndex === termIndex) {
        return;
      }
      nextKeys.push(
        `${seriesIndex}-${oldTermIndex > termIndex ? oldTermIndex - 1 : oldTermIndex}`
      );
    });
    this._expandedTermKeys = new Set(nextKeys);
  }

  private _moveCalculationTerm(
    seriesIndex: number,
    oldIndex: number,
    newIndex: number
  ) {
    const series = [...(this._config!.series ?? [])];
    const target = { ...series[seriesIndex] };
    const calculation = target.calculation;
    if (!calculation?.terms) {
      return;
    }
    const terms = [...calculation.terms];
    if (!this._canMoveIndex(terms, oldIndex, newIndex)) {
      return;
    }

    terms.splice(newIndex, 0, terms.splice(oldIndex, 1)[0]);
    target.calculation = { ...calculation, terms };
    series[seriesIndex] = target;
    this._updateConfig("series", series);
    this._expandedSeries = new Set(this._expandedSeries).add(seriesIndex);

    const nextKeys = new Set<string>();
    this._expandedTermKeys.forEach((key) => {
      const [seriesPart, termPart] = key.split("-");
      const oldSeriesIndex = Number(seriesPart);
      const oldTermIndex = Number(termPart);
      if (oldSeriesIndex !== seriesIndex || Number.isNaN(oldTermIndex)) {
        nextKeys.add(key);
        return;
      }
      nextKeys.add(
        `${seriesIndex}-${this._remapMovedIndex(oldTermIndex, oldIndex, newIndex)}`
      );
    });
    this._expandedTermKeys = nextKeys;
  }

  private _updateTerm(
    seriesIndex: number,
    termIndex: number,
    key: keyof EnergyCustomGraphCalculationTerm,
    value: unknown
  ) {
    this._mutateTerm(seriesIndex, termIndex, (draft) => {
      if (key === "constant" && value !== undefined && value !== "") {
        draft.statistic_id = undefined;
        draft.stat_type = undefined;
        draft.multiply = undefined;
        draft.add = undefined;
        draft.clip_min = undefined;
        draft.clip_max = undefined;
      }
      if (key === "statistic_id" && (value === undefined || value === "")) {
        draft.constant = undefined;
      }
      (draft as any)[key] = value === "" ? undefined : value;
    });
  }

  private _updateTermNumber(
    seriesIndex: number,
    termIndex: number,
    key: keyof EnergyCustomGraphCalculationTerm,
    value: string
  ) {
    const parsed = value === "" ? undefined : Number(value);
    this._updateTerm(seriesIndex, termIndex, key, parsed);
  }

  private _mutateTerm(
    seriesIndex: number,
    termIndex: number,
    mutator: (term: EnergyCustomGraphCalculationTerm) => void
  ) {
    const series = [...(this._config!.series ?? [])];
    const target = { ...series[seriesIndex] };
    const calculation = target.calculation;
    if (!calculation?.terms || termIndex < 0 || termIndex >= calculation.terms.length) {
      return;
    }
    const terms = [...calculation.terms];
    const draft = { ...terms[termIndex] };
    mutator(draft);
    terms[termIndex] = draft;
    target.calculation = { ...calculation, terms };
    series[seriesIndex] = target;
    this._updateConfig("series", series);
    this._expandedSeries = new Set(this._expandedSeries).add(seriesIndex);
    this._expandedTermKeys = new Set(this._expandedTermKeys).add(`${seriesIndex}-${termIndex}`);
  }

  private _updateCalculation(index: number, calculation: EnergyCustomGraphCalculationConfig) {
    const series = [...(this._config!.series ?? [])];
    const target = { ...series[index], calculation };
    series[index] = target;
    this._updateConfig("series", series);
    this._expandedSeries = new Set(this._expandedSeries).add(index);
  }

  private _updateSeries(index: number, key: keyof EnergyCustomGraphSeriesConfig, value: unknown) {
    const series = [...(this._config!.series ?? [])];
    const current = { ...series[index] };
    (current as any)[key] = value === "" ? undefined : value;
    if (key === "calculation" && value === undefined) {
      current.calculation = undefined;
    }
    series[index] = current;
    this._updateConfig("series", series);
    this._expandedSeries = new Set(this._expandedSeries).add(index);
  }

  private _replaceSeries(
    index: number,
    nextSeries: EnergyCustomGraphSeriesConfig
  ) {
    const series = [...(this._config!.series ?? [])];
    if (index < 0 || index >= series.length) {
      return;
    }
    series[index] = nextSeries;
    this._updateConfig("series", series);
    this._expandedSeries = new Set(this._expandedSeries).add(index);
  }

  private _handleSeriesStatisticChanged(
    index: number,
    rawStatisticId: string | undefined
  ) {
    const statisticId = normalizeStatisticId(rawStatisticId);
    const series = [...(this._config!.series ?? [])];
    const current = { ...series[index] };
    current.statistic_id = statisticId || undefined;
    delete current.stat_type;
    series[index] = current;
    this._updateConfig("series", series);
    this._expandedSeries = new Set(this._expandedSeries).add(index);
    this._setSeriesOptionGroupExpanded(index, "source", true);
    if (statisticId) {
      void this._autoSelectSeriesStatisticType(index, statisticId);
    }
  }

  private async _autoSelectSeriesStatisticType(index: number, statisticId: string) {
    await this._ensureStatisticMetadata([statisticId]);
    const current = this._config?.series?.[index];
    if (!current || normalizeStatisticId(current.statistic_id) !== statisticId) {
      return;
    }
    const metadata = this._getStatisticMetadata(statisticId);
    const nextType = selectDefaultStatisticType(metadata);
    this._replaceSeries(index, {
      ...current,
      stat_type: nextType,
    });
  }

  private _handleTermStatisticChanged(
    seriesIndex: number,
    termIndex: number,
    rawStatisticId: string | undefined
  ) {
    const statisticId = normalizeStatisticId(rawStatisticId);
    this._mutateTerm(seriesIndex, termIndex, (draft) => {
      draft.statistic_id = statisticId || undefined;
      draft.constant = undefined;
      delete draft.stat_type;
    });
    if (statisticId) {
      void this._autoSelectTermStatisticType(seriesIndex, termIndex, statisticId);
    }
  }

  private async _autoSelectTermStatisticType(
    seriesIndex: number,
    termIndex: number,
    statisticId: string
  ) {
    await this._ensureStatisticMetadata([statisticId]);
    const term = this._config?.series?.[seriesIndex]?.calculation?.terms?.[termIndex];
    if (!term || normalizeStatisticId(term.statistic_id) !== statisticId) {
      return;
    }
    const metadata = this._getStatisticMetadata(statisticId);
    const nextType = selectDefaultStatisticType(metadata);
    this._mutateTerm(seriesIndex, termIndex, (draft) => {
      draft.stat_type = nextType;
    });
  }

  private _updateSeriesNumber(
    index: number,
    key: keyof EnergyCustomGraphSeriesConfig,
    raw: string
  ) {
    const value = raw === "" ? undefined : Number(raw);
    this._updateSeries(index, key, value);
  }

  private _updateSeriesTimeOffsetUnit(index: number, rawUnit: string) {
    if (!isTimeOffsetUnit(rawUnit)) {
      this._updateSeries(index, "time_offset", undefined);
      return;
    }

    const current = this._config?.series?.[index]?.time_offset;
    const value =
      typeof current?.value === "number" &&
      Number.isFinite(current.value) &&
      Number.isInteger(current.value) &&
      current.value !== 0
        ? current.value
        : -1;
    this._updateSeries(index, "time_offset", {
      value,
      unit: rawUnit,
    });
  }

  private _updateSeriesTimeOffsetValue(index: number, raw: string) {
    const current = this._config?.series?.[index]?.time_offset;
    const unit = isTimeOffsetUnit(current?.unit) ? current.unit : undefined;
    if (!unit) {
      return;
    }
    if (raw === "") {
      this._updateSeries(index, "time_offset", undefined);
      return;
    }

    const value = Number(raw);
    if (!Number.isFinite(value) || !Number.isInteger(value)) {
      return;
    }
    if (value === 0) {
      this._updateSeries(index, "time_offset", undefined);
      return;
    }

    this._updateSeries(index, "time_offset", {
      value,
      unit,
    });
  }

  private _updateSeriesSmooth(index: number, raw: string) {
    if (raw === "") {
      this._updateSeries(index, "smooth", undefined);
      return;
    }
    if (raw === "true" || raw === "false") {
      this._updateSeries(index, "smooth", raw === "true");
      return;
    }
    const parsed = Number(raw);
    this._updateSeries(index, "smooth", Number.isNaN(parsed) ? undefined : parsed);
  }

  private _updateAxisConfig(
    axisId: "left" | "right",
    key: keyof Omit<EnergyCustomGraphAxisConfig, "id">,
    value: string | boolean
  ) {
    const axes = [...(this._config?.y_axes ?? [])];
    const existingIndex = axes.findIndex((axis) => axis.id === axisId);

    let numericValue: number | undefined;
    if (key === "min" || key === "max") {
      numericValue = value === "" ? undefined : Number(value);
      if (value !== "" && Number.isNaN(numericValue)) {
        return; // Invalid number input
      }
    }

    const finalValue =
      key === "min" || key === "max"
        ? numericValue
        : key === "unit"
          ? value === ""
            ? undefined
            : (value as string)
          : (value as boolean);

    if (existingIndex >= 0) {
      // Update existing axis
      const updated = { ...axes[existingIndex] };
      (updated as any)[key] = finalValue;

      // Remove undefined values to keep config clean
      if (finalValue === undefined) {
        delete (updated as any)[key];
      }

      axes[existingIndex] = updated;
    } else {
      // Create new axis
      const newAxis: EnergyCustomGraphAxisConfig = {
        id: axisId,
        [key]: finalValue,
      };
      axes.push(newAxis);
    }

    // Clean up empty axis configs
    const cleanedAxes = axes.filter((axis) => {
      const { id, ...rest } = axis;
      return Object.keys(rest).length > 0;
    });

    this._updateConfig("y_axes", cleanedAxes.length > 0 ? cleanedAxes : undefined);
  }

  private _updateAggregation(field: keyof EnergyCustomGraphAggregationConfig, value: string) {
    const aggregation: EnergyCustomGraphAggregationConfig = {
      ...this._config!.aggregation,
    };
    if (value === "") {
      delete aggregation[field];
    } else {
      (aggregation as any)[field] = value as EnergyCustomGraphAggregationTarget;
    }
    const cleaned = this._cleanupAggregation(aggregation);
    this._updateConfig("aggregation", cleaned);
  }

  private _updateAggregationFlag(field: keyof EnergyCustomGraphAggregationConfig, value: boolean) {
    const aggregation: EnergyCustomGraphAggregationConfig = {
      ...this._config!.aggregation,
    };
    if (!value) {
      delete aggregation[field];
    } else {
      (aggregation as any)[field] = value;
    }
    const cleaned = this._cleanupAggregation(aggregation);
    this._updateConfig("aggregation", cleaned);
  }

  private _updateAggregationPicker(key: AggregationPickerKey, value: string) {
    const aggregation: EnergyCustomGraphAggregationConfig = {
      ...this._config!.aggregation,
      energy_picker: {
        ...(this._config!.aggregation?.energy_picker ?? {}),
      },
    };
    if (value === "") {
      delete aggregation.energy_picker?.[key];
    } else {
      aggregation.energy_picker![key] = value as EnergyCustomGraphAggregationTarget;
    }
    const cleaned = this._cleanupAggregation(aggregation);
    this._updateConfig("aggregation", cleaned);
  }

  private _cleanupAggregation(
    aggregation: EnergyCustomGraphAggregationConfig
  ): EnergyCustomGraphAggregationConfig | undefined {
    if (aggregation.energy_picker && Object.keys(aggregation.energy_picker).length === 0) {
      delete aggregation.energy_picker;
    }
    if (aggregation.raw_options && Object.keys(aggregation.raw_options).length === 0) {
      delete aggregation.raw_options;
    }
    return Object.keys(aggregation).length ? aggregation : undefined;
  }

  private _toggleSeriesExpanded(index: number) {
    const expanded = new Set(this._expandedSeries);
    if (expanded.has(index)) {
      expanded.delete(index);
      const filtered: string[] = [];
      this._expandedTermKeys.forEach((key) => {
        if (!key.startsWith(`${index}-`)) {
          filtered.push(key);
        }
      });
      this._expandedTermKeys = new Set(filtered);
    } else {
      expanded.add(index);
    }
    this._expandedSeries = expanded;
  }

  private _toggleTermExpanded(key: string) {
    const expanded = new Set(this._expandedTermKeys);
    if (expanded.has(key)) {
      expanded.delete(key);
    } else {
      expanded.add(key);
    }
    this._expandedTermKeys = expanded;
  }

  private _syncExpandedState(series: EnergyCustomGraphSeriesConfig[]) {
    const validSeries = new Set<number>();
    this._expandedSeries.forEach((index) => {
      if (index >= 0 && index < series.length) {
        validSeries.add(index);
      }
    });
    this._expandedSeries = validSeries;

    const validTerms = new Set<string>();
    this._expandedTermKeys.forEach((key) => {
      const [seriesPart, termPart] = key.split("-");
      const seriesIndex = Number(seriesPart);
      const termIndex = Number(termPart);
      if (
        Number.isNaN(seriesIndex) ||
        Number.isNaN(termIndex) ||
        seriesIndex < 0 ||
        seriesIndex >= series.length
      ) {
        return;
      }
      const termCount = series[seriesIndex]?.calculation?.terms?.length ?? 0;
      if (termIndex >= 0 && termIndex < termCount) {
        validTerms.add(key);
      }
    });
    this._expandedTermKeys = validTerms;

    const validOptionGroups = new Map<string, boolean>();
    this._seriesOptionGroupsExpanded.forEach((expanded, key) => {
      const parsed = this._parseSeriesOptionGroupKey(key);
      if (parsed && parsed.index >= 0 && parsed.index < series.length) {
        validOptionGroups.set(key, expanded);
      }
    });
    this._seriesOptionGroupsExpanded = validOptionGroups;

    this._seriesStyleMoreExpanded = new Set(
      Array.from(this._seriesStyleMoreExpanded).filter(
        (index) => index >= 0 && index < series.length
      )
    );
    this._seriesSourceMoreExpanded = new Set(
      Array.from(this._seriesSourceMoreExpanded).filter(
        (index) => index >= 0 && index < series.length
      )
    );
  }

  private _formatOperation(operation: EnergyCustomGraphCalculationTerm["operation"]): string {
    switch (operation) {
      case "subtract":
        return "Subtract";
      case "multiply":
        return "Multiply";
      case "divide":
        return "Divide";
      case "add":
      default:
        return "Add";
    }
  }

  private _updateConfig<K extends keyof EnergyCustomGraphCardConfig>(
    key: K,
    value: EnergyCustomGraphCardConfig[K]
  ) {
    if (!this._config) {
      return;
    }
    const normalizedValue =
      key === "series" && Array.isArray(value)
        ? this._normalizeSeriesIds(value as EnergyCustomGraphSeriesConfig[])
        : value;
    const config: EnergyCustomGraphCardConfig = {
      ...this._config,
      [key]: normalizedValue,
    };
    if (normalizedValue === undefined) {
      delete (config as any)[key];
    }
    if (key === "aggregation") {
      if (normalizedValue === undefined) {
        delete (config as any).aggregation;
      } else if (
        typeof normalizedValue === "object" &&
        Object.keys(normalizedValue as any).length === 0
      ) {
        delete (config as any).aggregation;
      }
    }
    if (
      key === "header" &&
      (normalizedValue === undefined ||
        (typeof normalizedValue === "object" &&
          Object.keys(normalizedValue as any).length === 0))
    ) {
      delete (config as any).header;
    }
    if (config.timespan?.mode !== "energy") {
      delete config.collection_key;
      delete config.allow_compare;
    }
    if (!config.series?.length) {
      config.series = [];
    }
    this._config = config;
    this._syncCustomColorDrafts(config.series ?? []);
    this._syncColorSelections(config.series ?? []);
    this._syncCompareCustomColorDrafts(config.series ?? []);
    this._syncCompareColorSelections(config.series ?? []);
    if ((key === "title" || key === "header") && !this._cardHeaderHasContent(config)) {
      this._headerExpanded = false;
    }
    fireEvent(this, "config-changed", { config });
  }

  private _syncCustomColorDrafts(series: EnergyCustomGraphSeriesConfig[]) {
    const nextDrafts = new Map<number, string>();
    series.forEach((item, index) => {
      if (!item) {
        return;
      }
      const rawColor =
        typeof item.color === "string" ? item.color.trim() : undefined;
      const presetToken = this._extractPresetToken(rawColor);
      const isPreset =
        presetToken !== undefined &&
        ENERGY_COLOR_PRESETS.some((preset) => preset.value === presetToken);
      if (rawColor && !isPreset) {
        nextDrafts.set(index, rawColor);
        return;
      }
      if (!rawColor && this._customColorDrafts.has(index)) {
        const existing = this._customColorDrafts.get(index);
        if (existing !== undefined) {
          nextDrafts.set(index, existing);
        }
      }
    });
    this._customColorDrafts = nextDrafts;
  }

  private _syncColorSelections(series: EnergyCustomGraphSeriesConfig[]) {
    const nextSelections = new Map<number, string>();
    series.forEach((item, index) => {
      const rawColor =
        typeof item.color === "string" ? item.color.trim() : undefined;
      const presetToken = this._extractPresetToken(rawColor);
      const defaultSelection = !rawColor
        ? COLOR_SELECT_DEFAULT
        : presetToken
          ? presetToken
          : COLOR_SELECT_CUSTOM;
      const existing = this._colorModeSelections.get(index);
      if (existing === COLOR_SELECT_CUSTOM) {
        nextSelections.set(index, COLOR_SELECT_CUSTOM);
        return;
      }
      if (existing && existing === defaultSelection) {
        nextSelections.set(index, existing);
        return;
      }
      nextSelections.set(index, defaultSelection);
    });
    this._colorModeSelections = nextSelections;
  }

  private _syncCompareCustomColorDrafts(series: EnergyCustomGraphSeriesConfig[]) {
    const nextDrafts = new Map<number, string>();
    series.forEach((item, index) => {
      if (!item) {
        return;
      }
      const rawColor =
        typeof item.compare_color === "string" ? item.compare_color.trim() : undefined;
      const presetToken = this._extractPresetToken(rawColor);
      const isPreset =
        presetToken !== undefined &&
        ENERGY_COLOR_PRESETS.some((preset) => preset.value === presetToken);
      if (rawColor && !isPreset) {
        nextDrafts.set(index, rawColor);
        return;
      }
      if (!rawColor && this._compareCustomColorDrafts.has(index)) {
        const existing = this._compareCustomColorDrafts.get(index);
        if (existing !== undefined) {
          nextDrafts.set(index, existing);
        }
      }
    });
    this._compareCustomColorDrafts = nextDrafts;
  }

  private _syncCompareColorSelections(series: EnergyCustomGraphSeriesConfig[]) {
    const nextSelections = new Map<number, string>();
    series.forEach((item, index) => {
      const rawColor =
        typeof item.compare_color === "string" ? item.compare_color.trim() : undefined;
      const presetToken = this._extractPresetToken(rawColor);
      const defaultSelection = !rawColor
        ? COLOR_SELECT_INHERIT
        : presetToken
          ? presetToken
          : COLOR_SELECT_CUSTOM;
      const existing = this._compareColorModeSelections.get(index);
      if (existing === COLOR_SELECT_CUSTOM) {
        nextSelections.set(index, COLOR_SELECT_CUSTOM);
        return;
      }
      if (existing && existing === defaultSelection) {
        nextSelections.set(index, existing);
        return;
      }
      nextSelections.set(index, defaultSelection);
    });
    this._compareColorModeSelections = nextSelections;
  }

  private _updateBooleanConfig(
    key: keyof EnergyCustomGraphCardConfig,
    value: boolean
  ) {
    this._updateConfig(key, value);
  }

  private _updateNumericConfig(
    key: keyof EnergyCustomGraphCardConfig,
    raw: string
  ) {
    const value = raw === "" ? undefined : Number(raw);
    this._updateConfig(key, value as any);
  }

  private _setTimespanMode(mode: "energy" | "relative" | "fixed") {
    const timespan: EnergyCustomGraphTimespanConfig = mode === "energy"
      ? { mode: "energy" }
      : mode === "relative"
      ? { mode: "relative", period: "day", offset: 0 }
      : { mode: "fixed", start: undefined, end: undefined };

    this._updateConfig("timespan", timespan);
  }

  private _updateTimespanRelativePeriod(period: EnergyCustomGraphRelativePeriod) {
    const current = this._config?.timespan;
    if (!current || current.mode !== "relative") return;

    if (!isRelativeCalendarPeriod(period)) {
      const { count: _count, offset: _offset, ...withoutCalendarFields } = current;
      this._updateConfig("timespan", { ...withoutCalendarFields, period });
      return;
    }

    this._updateConfig("timespan", { ...current, period });
  }

  private _updateTimespanRelativeOffset(offset: number) {
    const current = this._config?.timespan;
    if (!current || current.mode !== "relative") return;

    this._updateConfig("timespan", { ...current, offset });
  }

  private _updateTimespanRelativeCount(value: string) {
    const current = this._config?.timespan;
    if (
      !current ||
      current.mode !== "relative" ||
      !isRelativeCalendarPeriod(current.period)
    ) {
      return;
    }

    const parsed = Number(value);
    const count =
      Number.isFinite(parsed) && Number.isInteger(parsed) && parsed >= 1
        ? parsed
        : 1;
    if (count === 1) {
      const { count: _count, ...withoutCount } = current;
      this._updateConfig("timespan", withoutCount);
      return;
    }
    this._updateConfig("timespan", { ...current, count });
  }

  private _updateTimespanFixedStart(start: string | undefined) {
    const current = this._config?.timespan;
    if (!current || current.mode !== "fixed") return;

    this._updateConfig("timespan", { ...current, start });
  }

  private _updateTimespanFixedEnd(end: string | undefined) {
    const current = this._config?.timespan;
    if (!current || current.mode !== "fixed") return;

    this._updateConfig("timespan", { ...current, end });
  }

  private _toggleAggregationExpanded() {
    this._aggregationExpanded = !this._aggregationExpanded;
  }

  private _toggleAxesExpanded() {
    this._axesExpanded = !this._axesExpanded;
  }

  private _toggleLegendExpanded() {
    this._legendExpanded = !this._legendExpanded;
  }

  private _toggleTooltipExpanded() {
    this._tooltipExpanded = !this._tooltipExpanded;
  }

  private _formatAxesSummary(
    leftAxis: EnergyCustomGraphAxisConfig | undefined,
    rightAxis: EnergyCustomGraphAxisConfig | undefined,
    showRightAxis: boolean
  ): string | undefined {
    const parts: string[] = [];

    if (leftAxis) {
      const leftParts: string[] = [];
      if (leftAxis.unit) leftParts.push(leftAxis.unit);
      if (leftAxis.fit_y_data) leftParts.push("fit");
      if (leftAxis.center_zero) leftParts.push("center zero");
      if (leftAxis.min !== undefined || leftAxis.max !== undefined) {
        const range = `${leftAxis.min ?? "auto"}-${leftAxis.max ?? "auto"}`;
        leftParts.push(range);
      }
      if (leftParts.length) {
        parts.push(`Left: ${leftParts.join(", ")}`);
      }
    }

    if (showRightAxis && rightAxis) {
      const rightParts: string[] = [];
      if (rightAxis.unit) rightParts.push(rightAxis.unit);
      if (rightAxis.fit_y_data) rightParts.push("fit");
      if (rightAxis.center_zero) rightParts.push("center zero");
      if (rightAxis.min !== undefined || rightAxis.max !== undefined) {
        const range = `${rightAxis.min ?? "auto"}-${rightAxis.max ?? "auto"}`;
        rightParts.push(range);
      }
      if (rightParts.length) {
        parts.push(`Right: ${rightParts.join(", ")}`);
      }
    }

    return parts.length ? parts.join(" • ") : undefined;
  }

  private _formatAggregationSummary(
    aggregation: EnergyCustomGraphAggregationConfig | undefined,
    useEnergyPicker: boolean
  ): string | undefined {
    if (!aggregation || Object.keys(aggregation).length === 0) {
      return undefined;
    }
    const parts: string[] = [];
    if (!useEnergyPicker && aggregation.manual) {
      parts.push(this._formatStatisticsPeriod(aggregation.manual));
    }
    if (aggregation.fallback) {
      parts.push(`Fallback: ${this._formatStatisticsPeriod(aggregation.fallback)}`);
    }
    if (
      useEnergyPicker &&
      aggregation.energy_picker &&
      Object.keys(aggregation.energy_picker).length
    ) {
      parts.push("Picker overrides");
    }
    if (this._aggregationUsesRaw(aggregation)) {
      parts.push("RAW history");
    }
    if (aggregation.compute_current_hour) {
      parts.push("Compute current hour");
    }
    return parts.length ? parts.join(" • ") : undefined;
  }

  private _formatStatisticsPeriod(value: EnergyCustomGraphAggregationTarget): string {
    return AGGREGATION_OPTIONS.find((option) => option.value === value)?.label ?? formatAggregationTarget(value);
  }

  private _setColorSelection(index: number, mode: string | undefined) {
    const next = new Map(this._colorModeSelections);
    if (mode === undefined) {
      next.delete(index);
    } else {
      next.set(index, mode);
    }
    this._colorModeSelections = next;
  }

  private _setCustomColorDraft(index: number, value: string | undefined) {
    const next = new Map(this._customColorDrafts);
    if (value === undefined) {
      next.delete(index);
    } else {
      const trimmed = value.trim();
      if (trimmed) {
        next.set(index, trimmed);
      } else {
        next.delete(index);
      }
    }
    this._customColorDrafts = next;
  }

  private _setCompareColorSelection(index: number, mode: string | undefined) {
    const next = new Map(this._compareColorModeSelections);
    if (mode === undefined) {
      next.delete(index);
    } else {
      next.set(index, mode);
    }
    this._compareColorModeSelections = next;
  }

  private _setCompareCustomColorDraft(index: number, value: string | undefined) {
    const next = new Map(this._compareCustomColorDrafts);
    if (value === undefined) {
      next.delete(index);
    } else {
      const trimmed = value.trim();
      if (trimmed) {
        next.set(index, trimmed);
      } else {
        next.delete(index);
      }
    }
    this._compareCustomColorDrafts = next;
  }

  private _handleSeriesColorSelect(index: number, rawValue: string) {
    if (!this._config) {
      return;
    }

    const trimmedValue = rawValue.trim();
    const seriesList = this._config.series ?? [];
    const currentEntry = seriesList[index];
    const current =
      typeof currentEntry?.color === "string"
        ? currentEntry.color.trim()
        : undefined;

    if (trimmedValue === COLOR_SELECT_DEFAULT) {
      this._setColorSelection(index, COLOR_SELECT_DEFAULT);
      this._setCustomColorDraft(index, undefined);
      this._updateSeries(index, "color", undefined);
      return;
    }

    if (trimmedValue === COLOR_SELECT_CUSTOM) {
      const fallback =
        this._customColorDrafts.get(index) ??
        current ??
        this._resolveAutoColorToken(index) ??
        "";
      this._setCustomColorDraft(index, fallback);
      this._setColorSelection(index, COLOR_SELECT_CUSTOM);
      if (current && !this._extractPresetToken(current)) {
        this._updateSeries(index, "color", current);
      }
      return;
    }

    this._setColorSelection(index, trimmedValue);
    this._setCustomColorDraft(index, undefined);
    this._updateSeries(index, "color", trimmedValue);
  }

  private _handleCustomColorInput(index: number, raw: string) {
    const value = raw.trim();
    this._setColorSelection(index, COLOR_SELECT_CUSTOM);
    if (value) {
      this._setCustomColorDraft(index, value);
      this._updateSeries(index, "color", value);
    } else {
      this._setCustomColorDraft(index, undefined);
      this._updateSeries(index, "color", undefined);
    }
  }

  private _handleCompareColorSelect(index: number, rawValue: string) {
    if (!this._config) {
      return;
    }

    const trimmedValue = rawValue.trim();
    const seriesList = this._config.series ?? [];
    const currentEntry = seriesList[index];
    const current =
      typeof currentEntry?.compare_color === "string"
        ? currentEntry.compare_color.trim()
        : undefined;

    if (trimmedValue === COLOR_SELECT_INHERIT) {
      this._setCompareColorSelection(index, COLOR_SELECT_INHERIT);
      this._setCompareCustomColorDraft(index, undefined);
      this._updateSeries(index, "compare_color", undefined);
      return;
    }

    if (trimmedValue === COLOR_SELECT_CUSTOM) {
      const fallback =
        this._compareCustomColorDrafts.get(index) ?? current ?? "";
      this._setCompareCustomColorDraft(index, fallback);
      this._setCompareColorSelection(index, COLOR_SELECT_CUSTOM);
      if (current && !this._extractPresetToken(current)) {
        this._updateSeries(index, "compare_color", current);
      }
      return;
    }

    this._setCompareColorSelection(index, trimmedValue);
    this._setCompareCustomColorDraft(index, undefined);
    this._updateSeries(index, "compare_color", trimmedValue);
  }

  private _handleCompareCustomColorInput(index: number, raw: string) {
    const value = raw.trim();
    this._setCompareColorSelection(index, COLOR_SELECT_CUSTOM);
    if (value) {
      this._setCompareCustomColorDraft(index, value);
      this._updateSeries(index, "compare_color", value);
    } else {
      this._setCompareCustomColorDraft(index, undefined);
      this._updateSeries(index, "compare_color", undefined);
    }
  }

  private _deriveCustomDraftForSeries(index: number): string | undefined {
    const series = this._config?.series?.[index];
    if (!series) {
      return undefined;
    }
    const rawColor =
      typeof series.color === "string" ? series.color.trim() : undefined;
    if (rawColor) {
      return rawColor;
    }
    return this._resolveAutoColorToken(index);
  }

  private _resolveAutoColor(index: number): string | undefined {
    const token = this._resolveAutoColorToken(index);
    if (!token) {
      return undefined;
    }
    return this._normalizeColorToken(token);
  }

  private _resolveAutoColorToken(index: number): string | undefined {
    const palette = this._config?.color_cycle ?? [];
    const tokens = palette.length > 0 ? palette : DEFAULT_COLORS;
    if (tokens.length === 0) {
      return undefined;
    }
    return tokens[index % tokens.length];
  }

  private _extractPresetToken(color: string | undefined): string | undefined {
    if (!color) {
      return undefined;
    }
    const trimmed = color.trim();
    if (!trimmed) {
      return undefined;
    }
    if (trimmed.startsWith("var(") && trimmed.endsWith(")")) {
      const inner = trimmed.slice(4, -1).trim();
      const commaIndex = inner.indexOf(",");
      const variable = commaIndex === -1 ? inner : inner.slice(0, commaIndex).trim();
      return variable.startsWith("--") ? variable : undefined;
    }
    if (trimmed.startsWith("--")) {
      return trimmed;
    }
    return undefined;
  }

  private _normalizeColorToken(color: string | undefined): string {
    if (!color) {
      return "";
    }
    const trimmed = color.trim();
    if (!trimmed) {
      return "";
    }
    if (trimmed.startsWith("var(") && trimmed.endsWith(")")) {
      const inner = trimmed.slice(4, -1).trim();
      const commaIndex = inner.indexOf(",");
      const variable = commaIndex === -1 ? inner : inner.slice(0, commaIndex).trim();
      const fallback =
        commaIndex === -1 ? undefined : inner.slice(commaIndex + 1).trim();
      const resolvedVar = this._lookupCssVariable(variable);
      if (resolvedVar) {
        return resolvedVar;
      }
      if (fallback) {
        return this._normalizeColorToken(fallback);
      }
      return trimmed;
    }
    if (trimmed.startsWith("--")) {
      const resolved = this._lookupCssVariable(trimmed);
      return resolved ?? trimmed;
    }
    return trimmed;
  }

  private _lookupCssVariable(token: string | undefined): string | undefined {
    if (!token || !token.startsWith("--")) {
      return undefined;
    }
    const stylesToCheck: CSSStyleDeclaration[] = [];
    try {
      if (this.isConnected) {
        stylesToCheck.push(getComputedStyle(this));
      }
    } catch (_e) {
      // Ignore – getComputedStyle may throw if element is not connected yet.
    }
    stylesToCheck.push(getComputedStyle(document.documentElement));
    for (const style of stylesToCheck) {
      const value = style.getPropertyValue(token)?.trim();
      if (value) {
        return value;
      }
    }
    return undefined;
  }

  private _renderColorPreview(
    colorVar: string | undefined,
    chartType: "bar" | "line" | "step"
  ) {
    if (!colorVar) {
      return nothing;
    }

    const colorValue = this._normalizeColorToken(colorVar);
    if (!colorValue) {
      return nothing;
    }

    // Default opacities from series-builder.ts
    const isLineLike = chartType === "line" || chartType === "step";
    const lineOpacity = isLineLike ? 0.85 : 0.75; // line stroke or bar border
    const fillOpacity = isLineLike ? 0.15 : 0.45; // line area or bar fill

    return html`
      <svg class="color-preview" width="16" height="16" viewBox="0 0 16 16">
        <circle
          cx="8"
          cy="8"
          r="7"
          fill="${colorValue}"
          fill-opacity="${fillOpacity}"
          stroke="${colorValue}"
          stroke-opacity="${lineOpacity}"
          stroke-width="1.5"
        />
      </svg>
    `;
  }

  static styles = css`
    :host {
      display: block;
      color: var(--primary-text-color);
      font-family: var(
        --ha-font-family-body,
        var(--paper-font-body1_-_font-family, Roboto, sans-serif)
      );
      -webkit-font-smoothing: var(--ha-font-smoothing, antialiased);
      -moz-osx-font-smoothing: var(--ha-moz-osx-font-smoothing, grayscale);
    }

    ha-entity-picker {
      display: block;
      width: 100%;
    }

    ha-expansion-panel {
      display: block;
      background: var(--card-background-color, var(--ha-card-background, #fff));
      --expansion-panel-summary-padding: 0 var(--ha-space-4, 16px);
      --expansion-panel-content-padding: 0;
    }

    ha-expansion-panel ha-icon[slot="leading-icon"] {
      color: var(--secondary-text-color);
    }

    ha-expansion-panel::part(summary) {
      min-width: 0;
    }

    ha-button-toggle-group {
      width: 100%;
    }

    ha-sortable {
      display: block;
    }

    .panel-heading {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
      overflow: hidden;
      padding-block: var(--ha-space-2, 8px);
    }

    .panel-title {
      color: var(--primary-text-color);
      font-size: var(--ha-font-size-l, 16px);
      font-weight: var(--ha-font-weight-medium, 500);
      line-height: var(--ha-line-height-condensed, 1.2);
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .panel-summary {
      color: var(--secondary-text-color);
      font-size: var(--ha-font-size-s, 13px);
      font-weight: var(--ha-font-weight-normal, 400);
      line-height: var(--ha-line-height-condensed, 1.2);
    }

    .panel-actions {
      display: flex;
      align-items: center;
      gap: var(--ha-space-1, 4px);
    }

    .panel-leading,
    .series-leading {
      display: flex;
      align-items: center;
      gap: var(--ha-space-2, 8px);
      color: var(--secondary-text-color);
    }

    .series-leading > ha-icon {
      --mdc-icon-size: 20px;
    }

    .series-leading > ha-state-icon {
      --mdc-icon-size: 20px;
    }

    .drag-handle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--secondary-text-color);
      cursor: grab;
      touch-action: none;
    }

    .drag-handle:active {
      cursor: grabbing;
    }

    .drag-handle ha-icon {
      --mdc-icon-size: 24px;
    }

    ha-icon-button.editor-action {
      --ha-icon-button-size: var(--ha-space-9, 36px);
      color: var(--secondary-text-color);
    }

    ha-icon-button.editor-action:hover {
      color: var(--primary-text-color);
    }

    .panel-body {
      display: flex;
      flex-direction: column;
      gap: var(--ha-space-4, 16px);
      padding: var(--ha-space-4, 16px);
      border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    }

    .native-text-input input {
      box-sizing: border-box;
      width: 100%;
    }

    .editor-container {
      padding: var(--ha-space-4, 16px) var(--ha-space-1, 4px) var(--ha-space-4, 16px) 0;
      display: flex;
      flex-direction: column;
      gap: var(--ha-space-5, 20px);
    }

    .section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .compact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
      align-items: start;
    }

    .compact-grid.two {
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .field label {
      font-size: 13px;
      color: var(--secondary-text-color);
    }

    .field select,
    .field input,
    .field textarea {
      font: inherit;
      padding: 6px 8px;
      border-radius: 6px;
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      background: var(--card-background-color, var(--primary-background-color));
      color: var(--primary-text-color);
    }

    .field select:focus,
    .field input:focus,
    .field textarea:focus {
      outline: 2px solid var(--primary-color);
      outline-offset: 1px;
    }

    .subsection {
      display: flex;
      flex-direction: column;
      gap: 12px;
      border-top: 1px solid var(--divider-color);
      padding-top: 12px;
    }

    .subsection:first-of-type {
      border-top: none;
      padding-top: 0;
    }

    .picker-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
    }

    .series-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .native-sortable-list {
      display: flex;
      flex-direction: column;
      gap: var(--ha-space-2, 8px);
    }

    .series-sortable-item,
    .term-sortable-item {
      display: block;
    }

    .native-add-button {
      align-self: flex-start;
      margin-top: var(--ha-space-2, 8px);
    }

    .native-add-button ha-icon {
      --mdc-icon-size: 20px;
    }

    .series-option-groups {
      display: flex;
      flex-direction: column;
      gap: var(--ha-space-2, 8px);
    }

    .series-option-group .panel-body,
    .term-panel .panel-body {
      gap: var(--ha-space-3, 12px);
      padding: var(--ha-space-3, 12px);
    }

    button.outlined {
      padding: 6px 12px;
      border-radius: 6px;
      border: 1px solid var(--primary-color);
      background: transparent;
      color: var(--primary-color);
      font: inherit;
      cursor: pointer;
      align-self: flex-start;
    }

    button.outlined:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    button.text {
      font: inherit;
      color: var(--primary-color);
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
    }

    button.text:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    button.text.warning {
      color: var(--error-color);
    }

    button.text.warning:hover {
      background: rgba(255, 0, 0, 0.08);
    }

    .collapsible {
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      border-radius: 8px;
      background: var(--ha-card-background, var(--card-background-color, #fff));
    }

    .collapsible-header {
      box-sizing: border-box;
      border: none;
      background: none;
      font: inherit;
      display: flex;
      align-items: center;
      width: 100%;
      justify-content: space-between;
      cursor: pointer;
      padding: 14px 16px;
      min-width: 0;
    }

    .section-heading,
    .series-heading {
      gap: 8px;
      cursor: default;
    }

    .section-heading-main,
    .series-heading-main,
    .nested-heading-main {
      border: none;
      background: none;
      font: inherit;
      color: inherit;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      cursor: pointer;
      padding: 0;
      min-width: 0;
      flex: 1 1 auto;
    }

    .section-heading-main .collapsible-title,
    .series-heading-main .collapsible-title,
    .nested-heading-main .nested-title {
      min-width: 0;
    }

    .collapsible-header:hover {
      background: rgba(0, 0, 0, 0.04);
    }

    .collapsible-title {
      display: flex;
      flex-direction: column;
      gap: 4px;
      text-align: left;
      min-width: 0;
    }

    .collapsible-title .title {
      font-weight: 600;
      font-size: 16px;
    }

    .collapsible-title .subtitle {
      color: var(--secondary-text-color);
      font-size: 13px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 0 0 auto;
      margin-inline-start: auto;
    }

    .reorder-buttons {
      display: flex;
      gap: 4px;
    }

    .icon-button {
      border: none;
      background: none;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--secondary-text-color);
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .icon-button:hover:not(.disabled):not(:disabled) {
      background-color: rgba(0, 0, 0, 0.08);
      color: var(--primary-text-color);
    }

    .icon-button.disabled,
    .icon-button:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .icon-button.strong {
      color: var(--primary-color);
    }

    .icon-button.danger {
      color: var(--error-color, #db4437);
    }

    .icon-button ha-icon {
      --mdc-icon-size: 18px;
    }

    .chevron {
      color: var(--secondary-text-color);
      margin-inline-start: 4px;
      display: flex;
      align-items: center;
    }

    .chevron ha-icon {
      --mdc-icon-size: 20px;
    }

    .general-collapsible {
      margin-top: 8px;
    }

    .aggregation-body {
      display: flex;
      flex-direction: column;
      gap: var(--ha-space-4, 16px);
      padding-top: 16px;
    }

    .group-card {
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      border-radius: 8px;
      background: var(--ha-card-background, var(--card-background-color, #fff));
    }

    .editor-section .group-card {
      border: none;
      background: transparent;
      border-radius: 0;
    }

    .group-header {
      padding: 12px 16px 0;
    }

    .group-title {
      font-weight: 600;
      font-size: 15px;
    }

    .group-body {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 12px 16px 16px;
    }

    .collapsible-body {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 0 16px 16px;
    }

    .section-footer,
    .nested-footer {
      display: flex;
      justify-content: flex-end;
    }

    .series-footer {
      margin-top: 12px;
    }

    .hint {
      margin: 0;
      color: var(--secondary-text-color);
      font-size: 13px;
    }

    .editor-hint {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      margin: 0;
      color: var(--secondary-text-color);
      font-size: 13px;
      line-height: 1.35;
    }

    .editor-hint ha-icon {
      --mdc-icon-size: 16px;
      flex: 0 0 auto;
      margin-top: 1px;
    }

    .editor-hint.warning,
    .summary-issue.warning {
      color: var(--warning-color, #f4b400);
    }

    .editor-hint.error,
    .summary-issue.error {
      color: var(--error-color, #db4437);
    }

    .error {
      margin: 0;
      color: var(--error-color, #db4437);
      font-size: 13px;
    }

    .subtitle {
      font-weight: 600;
    }

    .row {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .series-summary {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px;
    }

    .summary-issue {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--secondary-text-color);
    }

    .summary-issue ha-icon {
      --mdc-icon-size: 15px;
    }

    .toggle-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--ha-space-2, 8px) var(--ha-space-4, 16px);
    }

    .compact-toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ha-space-4, 16px);
      min-height: var(--ha-space-10, 40px);
      font-size: var(--ha-font-size-m, 14px);
      line-height: var(--ha-line-height-normal, 1.4);
      color: var(--primary-text-color);
    }

    .compact-toggle.disabled {
      color: var(--disabled-text-color, var(--secondary-text-color));
    }

    .compact-toggle-label {
      min-width: 0;
      overflow-wrap: anywhere;
    }

    .compact-toggle ha-switch {
      flex: 0 0 auto;
    }

    @media (max-width: 420px) {
      .toggle-grid {
        grid-template-columns: 1fr;
      }
    }

    .row.space-between {
      justify-content: space-between;
    }

    .color-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
    }

    .nested-collapsible {
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      border-radius: 8px;
      background: var(--ha-card-background, var(--card-background-color, #fff));
    }

    .nested-header {
      box-sizing: border-box;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      border: none;
      background: none;
      cursor: pointer;
      font: inherit;
    }

    .term-heading {
      gap: 8px;
      cursor: default;
    }

    .terms-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .terms-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .nested-header:hover {
      background: rgba(0, 0, 0, 0.04);
    }

    .nested-title {
      display: flex;
      flex-direction: column;
      gap: 2px;
      text-align: left;
    }

    .nested-title strong {
      font-weight: 600;
    }

    .nested-body {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 12px 16px 16px 20px;
      border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    }

    .term-body {
      display: grid;
      gap: 12px;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }

    .term-body.column {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .term-body .full-width {
      grid-column: 1 / -1;
    }

    .term-transform-title {
      margin-top: 4px;
    }

    .axis-config {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .axis-title {
      font-size: 14px;
      margin-bottom: 4px;
      display: block;
    }

    .axis-separator {
      border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      margin: 8px 0;
    }

    .axis-hint {
      margin-top: 8px;
    }

    .color-select-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .color-select-wrapper select {
      flex: 1;
    }

    .color-preview {
      flex-shrink: 0;
      display: block;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: flex-start;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "energy-custom-graph-card-editor": EnergyCustomGraphCardEditor;
  }
}

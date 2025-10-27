import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
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
} from "./types";
import type { StatisticsPeriod } from "./data/statistics";

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

const AGGREGATION_OPTIONS: Array<{ value: StatisticsPeriod; label: string }> = [
  { value: "5minute", label: "5 minute" },
  { value: "hour", label: "Hour" },
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

type AggregationPickerKey = "hour" | "day" | "week" | "month" | "year";

@customElement("energy-custom-graph-card-editor")
export class EnergyCustomGraphCardEditor
  extends LitElement
  implements LovelaceCardEditor
{
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config?: EnergyCustomGraphCardConfig;

  @state() private _activeTab: "general" | "series" | "advanced" = "general";
  @state() private _expandedSeries = new Set<number>();
  @state() private _expandedTermKeys = new Set<string>();
  @state() private _axesExpanded = false;
  @state() private _aggregationExpanded = false;

  async connectedCallback() {
    super.connectedCallback();
    // Preload ha-entity-picker by loading entities card editor
    this._preloadEntityPicker();
  }

  private async _preloadEntityPicker() {
    try {
      if (!customElements.get("ha-entity-picker")) {
        const helpers = await (window as any).loadCardHelpers();
        const card = await helpers.createCardElement({ type: "entities", entities: [] });
        await card.constructor.getConfigElement();
      }
    } catch (e) {
      // Preloading failed, but that's okay - we'll fall back gracefully
      console.debug("Energy Custom Graph: Could not preload ha-entity-picker", e);
    }
  }

  public setConfig(config: EnergyCustomGraphCardConfig): void {
    const hadConfig = this._config !== undefined;
    const normalizedSeries = config.series?.map((item) => ({ ...item })) ?? [];
    this._config = {
      type: "custom:energy-custom-graph-card",
      energy_date_selection: config.energy_date_selection ?? true,
      period: config.period,
      aggregation: config.aggregation,
      ...config,
      series: normalizedSeries,
    };

    if (!hadConfig) {
      this._expandedSeries = new Set();
      this._expandedTermKeys = new Set();
    } else {
      this._syncExpandedState(normalizedSeries);
    }
  }

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    return html`
      <div class="tab-bar">
        ${this._renderTabButton("general", "General")}
        ${this._renderTabButton("series", "Series")}
        ${this._renderTabButton("advanced", "Advanced")}
      </div>
      <div class="editor-container">
        ${this._activeTab === "general"
          ? this._renderGeneralTab()
          : this._activeTab === "series"
            ? this._renderSeriesTab()
            : this._renderAdvancedTab()}
      </div>
    `;
  }

  private _renderLegendSection(cfg: EnergyCustomGraphCardConfig) {
    const legendSort = cfg.legend_sort ?? "none";
    const hideLegend = cfg.hide_legend === true;
    const buttons: Array<{ value: "none" | "asc" | "desc"; label: string }> = [
      { value: "none", label: "None" },
      { value: "asc", label: "Asc" },
      { value: "desc", label: "Desc" },
    ];
    return html`
      <div class="group-card">
        <div class="group-header">
          <span class="group-title">Legend</span>
        </div>
        <div class="group-body">
          <div class="row">
            <ha-switch
              .checked=${hideLegend}
              @change=${(ev: Event) =>
                this._updateBooleanConfig("hide_legend", (ev.target as HTMLInputElement).checked)}
            ></ha-switch>
            <span>Hide legend</span>
          </div>
          ${hideLegend
            ? nothing
            : html`
                <div class="field">
                  <label>Legend sort</label>
                  <div class="segment-group" role="group" aria-label="Legend sort">
                    ${buttons.map(
                      (button) => html`
                        <button
                          type="button"
                          class=${classMap({
                            "segment-button": true,
                            active: legendSort === button.value,
                          })}
                          @click=${() => this._setLegendSort(button.value)}
                        >
                          ${button.label}
                        </button>
                      `
                    )}
                  </div>
                </div>
                <div class="row">
                  <ha-switch
                    .checked=${cfg.expand_legend === true}
                    @change=${(ev: Event) =>
                      this._updateBooleanConfig(
                        "expand_legend",
                        (ev.target as HTMLInputElement).checked
                      )}
                  ></ha-switch>
                  <span>Expand legend by default</span>
                </div>
              `}
        </div>
      </div>
    `;
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

    return html`
      <div class="collapsible general-collapsible ${axesExpanded ? "expanded" : "collapsed"}">
        <button type="button" class="collapsible-header" @click=${this._toggleAxesExpanded}>
          <div class="collapsible-title">
            <span class="title">Y Axes</span>
            ${axesSummary ? html`<span class="subtitle">${axesSummary}</span>` : nothing}
          </div>
          <span class="chevron">
            <ha-icon icon=${axesExpanded ? "mdi:chevron-down" : "mdi:chevron-right"}></ha-icon>
          </span>
        </button>
        ${axesExpanded
          ? html`
              <div class="collapsible-body">
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
              </div>
            `
          : nothing}
      </div>
    `;
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
        <ha-textfield
          label="Min value"
          type="number"
          .disabled=${centerZeroActive}
          .value=${axisConfig?.min !== undefined ? String(axisConfig.min) : ""}
          @input=${(ev: Event) =>
            this._updateAxisConfig(axisId, "min", (ev.target as HTMLInputElement).value)}
          helper=${centerZeroActive ? "Disabled when center zero is active" : ""}
        ></ha-textfield>
        <ha-textfield
          label="Max value"
          type="number"
          .value=${axisConfig?.max !== undefined ? String(axisConfig.max) : ""}
          @input=${(ev: Event) =>
            this._updateAxisConfig(axisId, "max", (ev.target as HTMLInputElement).value)}
          helper=${centerZeroActive ? "Used for both +max and -max" : ""}
        ></ha-textfield>
        <ha-textfield
          label="Unit"
          .value=${axisConfig?.unit ?? ""}
          @input=${(ev: Event) =>
            this._updateAxisConfig(axisId, "unit", (ev.target as HTMLInputElement).value)}
        ></ha-textfield>
        <div class="row">
          <ha-switch
            .checked=${axisConfig?.fit_y_data === true}
            @change=${(ev: Event) =>
              this._updateAxisConfig(
                axisId,
                "fit_y_data",
                (ev.target as HTMLInputElement).checked
              )}
          ></ha-switch>
          <span>Fit to data</span>
        </div>
        <div class="row">
          <ha-switch
            .checked=${axisConfig?.center_zero === true}
            @change=${(ev: Event) =>
              this._updateAxisConfig(
                axisId,
                "center_zero",
                (ev.target as HTMLInputElement).checked
              )}
          ></ha-switch>
          <span>Center zero</span>
        </div>
        <div class="row">
          <ha-switch
            .checked=${axisConfig?.logarithmic_scale === true}
            @change=${(ev: Event) =>
              this._updateAxisConfig(
                axisId,
                "logarithmic_scale",
                (ev.target as HTMLInputElement).checked
              )}
          ></ha-switch>
          <span>Logarithmic scale</span>
        </div>
      </div>
    `;
  }

  private _renderTooltipSection(cfg: EnergyCustomGraphCardConfig) {
    return html`
      <div class="group-card">
        <div class="group-header">
          <span class="group-title">Tooltip</span>
        </div>
        <div class="group-body">
          <div class="row">
            <ha-switch
              .checked=${cfg.show_unit !== false}
              @change=${(ev: Event) =>
                this._updateConfig("show_unit", (ev.target as HTMLInputElement).checked)}
            ></ha-switch>
            <span>Show units</span>
          </div>
          <ha-textfield
            label="Tooltip precision"
            type="number"
            .value=${cfg.tooltip_precision !== undefined ? String(cfg.tooltip_precision) : ""}
            @input=${(ev: Event) =>
              this._updateNumericConfig(
                "tooltip_precision",
                (ev.target as HTMLInputElement).value
              )}
          ></ha-textfield>
        </div>
      </div>
    `;
  }

  private _renderAggregationPickerOptions(
    pickerAggregation: NonNullable<EnergyCustomGraphAggregationConfig["energy_picker"]> | {}
  ) {
    const picker = pickerAggregation as Partial<Record<AggregationPickerKey, StatisticsPeriod>>;
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
          <label>Manual period aggregation</label>
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

  private _renderTabButton(tab: typeof this._activeTab, label: string) {
    return html`
      <button
        type="button"
        class=${classMap({ tab: true, active: this._activeTab === tab })}
        @click=${() => this._setActiveTab(tab)}
      >
        ${label}
      </button>
    `;
  }

  private _renderGeneralTab() {
    const cfg = this._config!;
    const useEnergyPicker = cfg.energy_date_selection !== false;
    const aggregationConfig = cfg.aggregation;
    const pickerAggregation = aggregationConfig?.energy_picker ?? {};
    const aggregationExpanded = this._aggregationExpanded;
    const aggregationSummary = this._formatAggregationSummary(aggregationConfig, useEnergyPicker);
    return html`
      <div class="section">
        <ha-textfield
          .label=${this.hass.localize("ui.panel.lovelace.editor.card.generic.title")}
          .value=${cfg.title ?? ""}
          @input=${(ev: Event) =>
            this._updateConfig("title", (ev.target as HTMLInputElement).value)}
        ></ha-textfield>
        <ha-textfield
          label="Chart height"
          helper="CSS height (e.g. 320px, 20rem)"
          .value=${cfg.chart_height ?? ""}
          @input=${(ev: Event) =>
            this._updateConfig("chart_height", (ev.target as HTMLInputElement).value || undefined)}
        ></ha-textfield>
        <div class="row">
          <ha-switch
            .checked=${useEnergyPicker}
            @change=${(ev: Event) =>
              this._updateConfig("energy_date_selection", (ev.target as HTMLInputElement).checked)}
          ></ha-switch>
          <span>Use energy date picker</span>
        </div>
        ${useEnergyPicker
          ? html`<ha-textfield
              label="Collection key"
              helper="Optional key when multiple energy pickers are present"
              .value=${cfg.collection_key ?? ""}
              @input=${(ev: Event) =>
                this._updateConfig(
                  "collection_key",
                  (ev.target as HTMLInputElement).value || undefined
                )}
            ></ha-textfield>`
          : nothing}
      </div>
      ${this._renderLegendSection(cfg)}
      ${this._renderTooltipSection(cfg)}
      ${this._renderAxesSection(cfg)}
      <div class="collapsible general-collapsible ${aggregationExpanded ? "expanded" : "collapsed"}">
        <button type="button" class="collapsible-header" @click=${this._toggleAggregationExpanded}>
          <div class="collapsible-title">
            <span class="title">Aggregation</span>
            ${aggregationSummary
              ? html`<span class="subtitle">${aggregationSummary}</span>`
              : nothing}
          </div>
          <span class="chevron">
            <ha-icon icon=${aggregationExpanded ? "mdi:chevron-down" : "mdi:chevron-right"}></ha-icon>
          </span>
        </button>
        ${aggregationExpanded
          ? html`
              <div class="collapsible-body aggregation-body">
                ${useEnergyPicker
                  ? this._renderAggregationPickerOptions(pickerAggregation)
                  : this._renderAggregationManualOptions(aggregationConfig)}
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private _renderSeriesTab() {
    const series = this._config!.series ?? [];
    return html`
      <div class="series-list">
        ${series.length
          ? series.map((serie, index) => this._renderSeriesCard(serie, index))
          : html`<p class="hint">No series configured yet.</p>`}
        <button type="button" class="outlined" @click=${this._addSeries}>Add series</button>
      </div>
    `;
  }

  private _renderSeriesCard(series: EnergyCustomGraphSeriesConfig, index: number) {
    const usingCalculation = !!series.calculation;
    const expanded = this._expandedSeries.has(index);
    const seriesCount = this._config?.series?.length ?? 0;
    const isFirst = index === 0;
    const isLast = index === seriesCount - 1;

    return html`
      <div class="collapsible ${expanded ? "expanded" : "collapsed"}">
        <button
          type="button"
          class="collapsible-header"
          @click=${() => this._toggleSeriesExpanded(index)}
        >
          <div class="collapsible-title">
            <span class="title">${series.name ?? series.statistic_id ?? `Series ${index + 1}`}</span>
            <span class="subtitle">
              ${usingCalculation
                ? "Calculation series"
                : series.statistic_id || "No statistic selected"}
            </span>
          </div>
          <div class="header-actions">
            <div class="reorder-buttons">
              <div
                class="icon-button ${isFirst ? "disabled" : ""}"
                role="button"
                tabindex="0"
                @click=${(ev: Event) => {
                  if (!isFirst) {
                    ev.stopPropagation();
                    this._moveSeriesUp(index);
                  }
                }}
                @keydown=${(ev: KeyboardEvent) => {
                  if (!isFirst && (ev.key === "Enter" || ev.key === " ")) {
                    ev.preventDefault();
                    ev.stopPropagation();
                    this._moveSeriesUp(index);
                  }
                }}
                title="Move up"
              >
                <ha-icon icon="mdi:chevron-up"></ha-icon>
              </div>
              <div
                class="icon-button ${isLast ? "disabled" : ""}"
                role="button"
                tabindex="0"
                @click=${(ev: Event) => {
                  if (!isLast) {
                    ev.stopPropagation();
                    this._moveSeriesDown(index);
                  }
                }}
                @keydown=${(ev: KeyboardEvent) => {
                  if (!isLast && (ev.key === "Enter" || ev.key === " ")) {
                    ev.preventDefault();
                    ev.stopPropagation();
                    this._moveSeriesDown(index);
                  }
                }}
                title="Move down"
              >
                <ha-icon icon="mdi:chevron-down"></ha-icon>
              </div>
            </div>
            <span class="chevron">
              <ha-icon icon=${expanded ? "mdi:chevron-down" : "mdi:chevron-right"}></ha-icon>
            </span>
          </div>
        </button>
        ${expanded
          ? html`
              <div class="collapsible-body">
                ${this._renderSeriesBasicsGroup(series, index)}
                ${this._renderSeriesSourceGroup(series, index)}
                ${this._renderSeriesDisplayGroup(series, index)}
                ${this._renderSeriesTransformGroup(series, index)}
                <div class="section-footer series-footer">
                  <button
                    type="button"
                    class="text warning"
                    @click=${(ev: Event) => {
                      ev.stopPropagation();
                      this._removeSeries(index);
                    }}
                  >
                    Delete series
                  </button>
                </div>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private _renderSeriesBasicsGroup(series: EnergyCustomGraphSeriesConfig, index: number) {
    const chartType = series.chart_type ?? "bar";
    const chartButtons: Array<{ value: EnergyCustomGraphChartType; label: string }> = [
      { value: "bar", label: "Bar" },
      { value: "line", label: "Line" },
    ];
    return html`
      <div class="group-card">
        <div class="group-header">
          <span class="group-title">Basics</span>
        </div>
        <div class="group-body">
          <ha-textfield
            label="Series name"
            .value=${series.name ?? ""}
            @input=${(ev: Event) =>
              this._updateSeries(index, "name", (ev.target as HTMLInputElement).value || undefined)}
          ></ha-textfield>
          <div class="field">
            <label>Chart type</label>
            <div class="segment-group" role="group" aria-label="Chart type">
              ${chartButtons.map(
                (button) => html`
                  <button
                    type="button"
                    class=${classMap({
                      "segment-button": true,
                      active: chartType === button.value,
                    })}
                    @click=${() => this._setSeriesChartType(index, button.value)}
                  >
                    ${button.label}
                  </button>
                `
              )}
            </div>
          </div>
          <div class="field">
            <label>Y axis</label>
            ${(() => {
              const current = series.y_axis ?? "left";
              return html`<select
                @change=${(ev: Event) =>
                  this._updateSeries(
                    index,
                    "y_axis",
                    (ev.target as HTMLSelectElement).value as "left" | "right"
                  )}
              >
                <option value="left" ?selected=${current === "left"}>Left</option>
                <option value="right" ?selected=${current === "right"}>Right</option>
              </select>`;
            })()}
          </div>
        </div>
      </div>
    `;
  }

  private _renderSeriesSourceGroup(series: EnergyCustomGraphSeriesConfig, index: number) {
    const source = series.calculation ? "calculation" : "statistic";
    return html`
      <div class="group-card">
        <div class="group-header">
          <span class="group-title">Data source</span>
        </div>
        <div class="group-body series-source-body">
          <div class="segment-group" role="group" aria-label="Data source">
            ${(["statistic", "calculation"] as const).map(
              (mode) => html`
                <button
                  type="button"
                  class=${classMap({
                    "segment-button": true,
                    active: source === mode,
                  })}
                  @click=${() => this._setSeriesSource(index, mode)}
                >
                  ${mode === "statistic" ? "Statistic" : "Calculation"}
                </button>
              `
            )}
          </div>
          ${source === "calculation"
            ? this._renderSeriesCalculationContent(series, index)
            : this._renderSeriesStatisticContent(series, index)}
        </div>
      </div>
    `;
  }

  private _renderSeriesStatisticContent(series: EnergyCustomGraphSeriesConfig, index: number) {
    if (!this.hass) {
      return html`<p>Loading...</p>`;
    }

    return html`
      <ha-entity-picker
        .hass=${this.hass}
        .value=${series.statistic_id}
        .label=${"Statistic ID"}
        allow-custom-entity
        @value-changed=${(ev: CustomEvent) =>
          this._updateSeries(index, "statistic_id", ev.detail.value || undefined)}
      ></ha-entity-picker>
      <div class="field">
        <label>Statistic type</label>
        ${(() => {
          const current = series.stat_type ?? "change";
          return html`<select
            @change=${(ev: Event) =>
              this._updateSeries(
                index,
                "stat_type",
                (ev.target as HTMLSelectElement).value as EnergyCustomGraphStatisticType
              )}
          >
            ${STAT_TYPE_OPTIONS.map(
              (option) =>
                html`<option value=${option.value} ?selected=${current === option.value}
                  >${option.label}</option
                >`
            )}
          </select>`;
        })()}
      </div>
    `;
  }

  private _renderSeriesCalculationContent(series: EnergyCustomGraphSeriesConfig, index: number) {
    const calculation: EnergyCustomGraphCalculationConfig = series.calculation ?? {
      terms: [],
    };
    return html`
      <ha-textfield
        label="Calculation unit"
        .value=${calculation.unit ?? ""}
        @input=${(ev: Event) =>
          this._updateCalculation(index, {
            ...calculation,
            unit: (ev.target as HTMLInputElement).value || undefined,
          })}
      ></ha-textfield>
      <ha-textfield
        label="Initial value"
        type="number"
        .value=${calculation.initial_value !== undefined
          ? String(calculation.initial_value)
          : "0"}
        @input=${(ev: Event) =>
          this._updateCalculation(index, {
            ...calculation,
            initial_value: (ev.target as HTMLInputElement).value
              ? Number((ev.target as HTMLInputElement).value)
              : 0,
          })}
      ></ha-textfield>
      <div class="terms-list">
        ${calculation.terms?.length
          ? calculation.terms.map((term, termIndex) =>
              this._renderCalculationTerm(index, termIndex, term)
            )
          : html`<p class="hint">Add at least one term to build the calculation.</p>`}
      </div>
      <button type="button" class="outlined" @click=${() => this._addCalculationTerm(index)}>
        Add term
      </button>
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
    return html`
      <div class="nested-collapsible ${expanded ? "expanded" : "collapsed"}">
        <button type="button" class="nested-header" @click=${() => this._toggleTermExpanded(termKey)}>
          <div class="nested-title">
            <strong>${operationLabel}</strong>
            <p class="hint">${descriptor}</p>
          </div>
          <span class="chevron">
            <ha-icon icon=${expanded ? "mdi:chevron-down" : "mdi:chevron-right"}></ha-icon>
          </span>
        </button>
        ${expanded
          ? html`
              <div class="nested-body">
                <div class="term-body column">
                  ${this._renderTermOperationField(seriesIndex, termIndex, operation)}
                  ${this._renderTermSourceFields(seriesIndex, termIndex, term)}
                  ${this._renderTermTransformFields(seriesIndex, termIndex, term)}
                </div>
                <div class="nested-footer">
                  <button
                    type="button"
                    class="text warning"
                    @click=${(ev: Event) => {
                      ev.stopPropagation();
                      this._removeCalculationTerm(seriesIndex, termIndex);
                    }}
                  >
                    Remove term
                  </button>
                </div>
              </div>
            `
          : nothing}
      </div>
    `;
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
      { value: "statistic", label: "Statistic" },
      { value: "constant", label: "Constant" },
    ];
    return html`
      <div class="field full-width">
        <label>Input type</label>
        <div class="segment-group" role="group" aria-label="Term input type">
          ${buttons.map(
            (button) => html`
              <button
                type="button"
                class=${classMap({
                  "segment-button": true,
                  active: mode === button.value,
                })}
                @click=${() => this._setTermMode(seriesIndex, termIndex, button.value)}
              >
                ${button.label}
              </button>
            `
          )}
        </div>
      </div>
      ${mode === "statistic"
        ? html`
            <ha-entity-picker
              .hass=${this.hass}
              .value=${term.statistic_id}
              .label=${"Statistic ID"}
              .helper=${"Recorder statistic (e.g. sensor.energy_import)"}
              allow-custom-entity
              @value-changed=${(ev: CustomEvent) =>
                this._updateTerm(seriesIndex, termIndex, "statistic_id", ev.detail.value || undefined)}
            ></ha-entity-picker>
            <div class="field">
              <label>Statistic type</label>
              <select
                @change=${(ev: Event) =>
                  this._updateTerm(
                    seriesIndex,
                    termIndex,
                    "stat_type",
                    (ev.target as HTMLSelectElement).value as EnergyCustomGraphStatisticType
                  )}
              >
                ${STAT_TYPE_OPTIONS.map(
                  (option) =>
                    html`<option value=${option.value} ?selected=${(term.stat_type ?? "change") === option.value}>
                      ${option.label}
                    </option>`
                )}
              </select>
            </div>
          `
        : html`
            <ha-textfield
              label="Constant"
              helper="Fixed value added every step"
              type="number"
              .value=${term.constant !== undefined ? String(term.constant) : ""}
              @input=${(ev: Event) =>
                this._updateTermNumber(
                  seriesIndex,
                  termIndex,
                  "constant",
                  (ev.target as HTMLInputElement).value
                )}
            ></ha-textfield>
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
      <ha-textfield
        label="Multiply"
        type="number"
        .value=${term.multiply !== undefined ? String(term.multiply) : ""}
        @input=${(ev: Event) =>
          this._updateTermNumber(
            seriesIndex,
            termIndex,
            "multiply",
            (ev.target as HTMLInputElement).value
          )}
      ></ha-textfield>
      <ha-textfield
        label="Add"
        type="number"
        .value=${term.add !== undefined ? String(term.add) : ""}
        @input=${(ev: Event) =>
          this._updateTermNumber(seriesIndex, termIndex, "add", (ev.target as HTMLInputElement).value)}
      ></ha-textfield>
      <ha-textfield
        label="Clip min"
        type="number"
        .value=${term.clip_min !== undefined ? String(term.clip_min) : ""}
        @input=${(ev: Event) =>
          this._updateTermNumber(
            seriesIndex,
            termIndex,
            "clip_min",
            (ev.target as HTMLInputElement).value
          )}
      ></ha-textfield>
      <ha-textfield
        label="Clip max"
        type="number"
        .value=${term.clip_max !== undefined ? String(term.clip_max) : ""}
        @input=${(ev: Event) =>
          this._updateTermNumber(
            seriesIndex,
            termIndex,
            "clip_max",
            (ev.target as HTMLInputElement).value
          )}
      ></ha-textfield>
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
        if (!draft.stat_type) {
          draft.stat_type = "change";
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

  private _renderSeriesDisplayGroup(series: EnergyCustomGraphSeriesConfig, index: number) {
    const chartType = series.chart_type ?? "bar";
    const fillEnabled = chartType === "line";
    const fillActive = fillEnabled && series.fill === true;
    const presetValue =
      ENERGY_COLOR_PRESETS.find((item) => item.value === series.color)?.value ?? "";
    return html`
      <div class="group-card">
        <div class="group-header">
          <span class="group-title">Display</span>
        </div>
        <div class="group-body">
          <div class="color-row">
            <div class="field">
              <label>Preset color</label>
              <div class="color-select-wrapper">
                ${this._renderColorPreview(series.color ?? presetValue, chartType)}
                <select
                  @change=${(ev: Event) =>
                    this._updateSeries(
                      index,
                      "color",
                      (ev.target as HTMLSelectElement).value || undefined
                    )}
                >
                  <option value="" ?selected=${presetValue === ""}>Custom</option>
                  ${ENERGY_COLOR_PRESETS.map(
                    (preset) =>
                      html`<option value=${preset.value} ?selected=${presetValue === preset.value}>
                        ${preset.label}
                      </option>`
                  )}
                </select>
              </div>
            </div>
            ${presetValue === ""
              ? html`<ha-textfield
                  label="Custom color"
                  .value=${series.color ?? ""}
                  @input=${(ev: Event) =>
                    this._updateSeries(
                      index,
                      "color",
                      (ev.target as HTMLInputElement).value || undefined
                    )}
                ></ha-textfield>`
              : nothing}
          </div>
          <div class="row">
            <ha-switch
              .checked=${series.show_legend !== false}
              @change=${(ev: Event) =>
                this._updateSeries(index, "show_legend", (ev.target as HTMLInputElement).checked)}
            ></ha-switch>
            <span>Show in legend</span>
          </div>
          ${fillEnabled
            ? html`
                <div class="row">
                  <ha-switch
                    .checked=${series.fill === true}
                    @change=${(ev: Event) =>
                      this._updateSeries(index, "fill", (ev.target as HTMLInputElement).checked)}
                  ></ha-switch>
                  <span>Fill area</span>
                </div>
              `
            : nothing}
        <ha-textfield
          label="Fill opacity"
          type="number"
          step="0.01"
          min="0"
          max="1"
          helper="Default 0.15 (lines) / 0.5 (bars)"
          .value=${series.fill_opacity !== undefined ? String(series.fill_opacity) : ""}
          @input=${(ev: Event) =>
            this._updateSeriesNumber(
              index,
              "fill_opacity",
              (ev.target as HTMLInputElement).value
            )}
        ></ha-textfield>
        ${fillActive
          ? html`
                <ha-textfield
                  label="Fill to series"
                  helper="Name of the line series to fill towards"
                  .value=${series.fill_to_series ?? ""}
                  @input=${(ev: Event) =>
                    this._updateSeries(
                      index,
                      "fill_to_series",
                      (ev.target as HTMLInputElement).value || undefined
                    )}
                ></ha-textfield>
              `
            : nothing}
          <ha-textfield
            label="Line opacity"
            type="number"
            step="0.01"
            min="0"
            max="1"
            helper="Default 0.85 for lines, 1.0 for bars"
            .value=${series.line_opacity !== undefined ? String(series.line_opacity) : ""}
            @input=${(ev: Event) =>
              this._updateSeriesNumber(index, "line_opacity", (ev.target as HTMLInputElement).value)}
          ></ha-textfield>
          ${chartType === "line"
            ? html`
                <ha-textfield
                  label="Line width"
                  type="number"
                  step="0.5"
                  min="0.5"
                  helper="Default 2"
                  .value=${series.line_width !== undefined ? String(series.line_width) : ""}
                  @input=${(ev: Event) =>
                    this._updateSeriesNumber(
                      index,
                      "line_width",
                      (ev.target as HTMLInputElement).value
                    )}
                ></ha-textfield>
                <div class="field">
                  <label>Line style</label>
                  <div class="segment-group" role="group" aria-label="Line style">
                    ${(["solid", "dashed", "dotted"] as const).map(
                      (style) => html`
                        <button
                          type="button"
                          class=${classMap({
                            "segment-button": true,
                            active: (series.line_style ?? "solid") === style,
                          })}
                          @click=${() => this._setSeriesLineStyle(index, style)}
                        >
                          ${style.charAt(0).toUpperCase() + style.slice(1)}
                        </button>
                      `
                    )}
                  </div>
                </div>
              `
            : nothing}
          <ha-textfield
            label="Stack group"
            helper="Series using the same name will stack together"
            .value=${series.stack ?? ""}
            @input=${(ev: Event) =>
              this._updateSeries(index, "stack", (ev.target as HTMLInputElement).value || undefined)}
          ></ha-textfield>
        </div>
      </div>
    `;
  }

  private _renderSeriesTransformGroup(series: EnergyCustomGraphSeriesConfig, index: number) {
    return html`
      <div class="group-card">
        <div class="group-header">
          <span class="group-title">Transform</span>
        </div>
        <div class="group-body">
          <ha-textfield
            label="Multiply"
            type="number"
            .value=${series.multiply !== undefined ? String(series.multiply) : ""}
            @input=${(ev: Event) =>
              this._updateSeriesNumber(index, "multiply", (ev.target as HTMLInputElement).value)}
          ></ha-textfield>
          <ha-textfield
            label="Add"
            type="number"
            .value=${series.add !== undefined ? String(series.add) : ""}
            @input=${(ev: Event) =>
              this._updateSeriesNumber(index, "add", (ev.target as HTMLInputElement).value)}
          ></ha-textfield>
          <ha-textfield
            label="Smooth"
            helper="Boolean or number (0-1). Leave empty for default."
            .value=${series.smooth !== undefined ? String(series.smooth) : ""}
            @input=${(ev: Event) =>
              this._updateSeriesSmooth(index, (ev.target as HTMLInputElement).value)}
          ></ha-textfield>
          <ha-textfield
            label="Clip min"
            type="number"
            .value=${series.clip_min !== undefined ? String(series.clip_min) : ""}
            @input=${(ev: Event) =>
              this._updateSeriesNumber(index, "clip_min", (ev.target as HTMLInputElement).value)}
          ></ha-textfield>
          <ha-textfield
            label="Clip max"
            type="number"
            .value=${series.clip_max !== undefined ? String(series.clip_max) : ""}
            @input=${(ev: Event) =>
              this._updateSeriesNumber(index, "clip_max", (ev.target as HTMLInputElement).value)}
          ></ha-textfield>
        </div>
      </div>
    `;
  }

  private _setSeriesChartType(index: number, type: EnergyCustomGraphChartType) {
    const series = this._config!.series ?? [];
    if (series[index]?.chart_type === type) {
      return;
    }
    this._updateSeries(index, "chart_type", type);
  }

  private _setSeriesLineStyle(index: number, style: "solid" | "dashed" | "dotted") {
    const series = this._config!.series ?? [];
    if (series[index]?.line_style === style) {
      return;
    }
    this._updateSeries(index, "line_style", style);
  }

  private _setSeriesSource(index: number, mode: "statistic" | "calculation") {
    const series = this._config!.series ?? [];
    const current = series[index];
    if (!current) {
      return;
    }
    const isCalculation = !!current.calculation;
    if (mode === "calculation") {
      if (!isCalculation) {
        this._convertSeriesToCalculation(index);
      }
      return;
    }
    if (isCalculation) {
      this._convertSeriesToStatistic(index);
    }
  }

  private _renderAdvancedTab() {
    return html`
      <div class="section">
        <p class="hint">
          Advanced configuration (such as multiple Y axes or custom color cycles) is currently only
          available in YAML mode. Use the "Show code editor" button in the top-right corner of the
          Lovelace editor to edit the raw configuration.
        </p>
      </div>
    `;
  }

  private _addSeries() {
    const newSeries: EnergyCustomGraphSeriesConfig = {
      statistic_id: "",
      chart_type: "bar",
      stat_type: "change",
    };
    const updated = [...(this._config!.series ?? []), newSeries];
    this._updateConfig("series", updated);
    this._expandedSeries = new Set(this._expandedSeries).add(updated.length - 1);
  }

  private _moveSeriesUp(index: number) {
    if (index === 0) return;

    const series = [...(this._config!.series ?? [])];
    [series[index - 1], series[index]] = [series[index], series[index - 1]];

    // Update expanded state
    const updatedExpanded = new Set<number>();
    this._expandedSeries.forEach((oldIndex) => {
      if (oldIndex === index) {
        updatedExpanded.add(index - 1);
      } else if (oldIndex === index - 1) {
        updatedExpanded.add(index);
      } else {
        updatedExpanded.add(oldIndex);
      }
    });
    this._expandedSeries = updatedExpanded;

    this._updateConfig("series", series);
  }

  private _moveSeriesDown(index: number) {
    const series = [...(this._config!.series ?? [])];
    if (index >= series.length - 1) return;

    [series[index], series[index + 1]] = [series[index + 1], series[index]];

    // Update expanded state
    const updatedExpanded = new Set<number>();
    this._expandedSeries.forEach((oldIndex) => {
      if (oldIndex === index) {
        updatedExpanded.add(index + 1);
      } else if (oldIndex === index + 1) {
        updatedExpanded.add(index);
      } else {
        updatedExpanded.add(oldIndex);
      }
    });
    this._expandedSeries = updatedExpanded;

    this._updateConfig("series", series);
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
  }

  private _convertSeriesToCalculation(index: number) {
    const seriesList = [...(this._config!.series ?? [])];
    const target = { ...seriesList[index] };
    delete target.statistic_id;
    target.calculation = target.calculation ?? { terms: [] };
    seriesList[index] = target;
    this._updateConfig("series", seriesList);
    this._expandedSeries = new Set(this._expandedSeries).add(index);
  }

  private _convertSeriesToStatistic(index: number) {
    const seriesList = [...(this._config!.series ?? [])];
    const target = { ...seriesList[index] };
    delete target.calculation;
    if (!target.statistic_id) {
      target.statistic_id = "";
    }
    seriesList[index] = target;
    this._updateConfig("series", seriesList);
    this._expandedSeries = new Set(this._expandedSeries).add(index);
  }

  private _addCalculationTerm(index: number) {
    const series = [...(this._config!.series ?? [])];
    const target = { ...series[index] };
    const calculation: EnergyCustomGraphCalculationConfig = target.calculation ?? { terms: [] };
    calculation.terms = [...(calculation.terms ?? []), { operation: "add" }];
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
    this._expandedTermKeys = new Set(
      Array.from(this._expandedTermKeys).filter((key) => key !== `${seriesIndex}-${termIndex}`)
    );
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

  private _updateSeriesNumber(
    index: number,
    key: keyof EnergyCustomGraphSeriesConfig,
    raw: string
  ) {
    const value = raw === "" ? undefined : Number(raw);
    this._updateSeries(index, key, value);
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
      (aggregation as any)[field] = value as StatisticsPeriod;
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
      aggregation.energy_picker![key] = value as StatisticsPeriod;
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
    const config: EnergyCustomGraphCardConfig = {
      ...this._config,
      [key]: value,
    };
    if (key === "aggregation") {
      if (value === undefined) {
        delete (config as any).aggregation;
      } else if (
        typeof value === "object" &&
        Object.keys(value as any).length === 0
      ) {
        delete (config as any).aggregation;
      }
    }
    if (!config.energy_date_selection) {
      delete config.collection_key;
    }
    if (!config.series?.length) {
      config.series = [];
    }
    this._config = config;
    fireEvent(this, "config-changed", { config });
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

  private _toggleAggregationExpanded() {
    this._aggregationExpanded = !this._aggregationExpanded;
  }

  private _toggleAxesExpanded() {
    this._axesExpanded = !this._axesExpanded;
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
      if (leftAxis.logarithmic_scale) leftParts.push("log");
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
      if (rightAxis.logarithmic_scale) rightParts.push("log");
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
      parts.push(`Manual: ${this._formatStatisticsPeriod(aggregation.manual)}`);
    }
    if (!useEnergyPicker && aggregation.fallback) {
      parts.push(`Fallback: ${this._formatStatisticsPeriod(aggregation.fallback)}`);
    }
    if (
      useEnergyPicker &&
      aggregation.energy_picker &&
      Object.keys(aggregation.energy_picker).length
    ) {
      parts.push("Picker overrides");
    }
    return parts.length ? parts.join(" • ") : undefined;
  }

  private _formatStatisticsPeriod(value: StatisticsPeriod): string {
    return AGGREGATION_OPTIONS.find((option) => option.value === value)?.label ?? value;
  }

  private _setActiveTab(tab: typeof this._activeTab) {
    if (this._activeTab === tab) {
      return;
    }
    this._activeTab = tab;
  }

  private _renderColorPreview(colorVar: string | undefined, chartType: "bar" | "line") {
    if (!colorVar) {
      return nothing;
    }

    // Get computed color value from CSS variable
    const computedStyle = getComputedStyle(this);
    let colorValue = colorVar;

    if (colorVar.startsWith("--")) {
      colorValue = computedStyle.getPropertyValue(colorVar).trim() || colorVar;
    } else if (colorVar.startsWith("var(")) {
      const extracted = colorVar.slice(4, -1).trim();
      colorValue = computedStyle.getPropertyValue(extracted).trim() || colorVar;
    }

    // Default opacities from series-builder.ts
    const lineOpacity = chartType === "line" ? 0.85 : 0.75; // line stroke or bar border
    const fillOpacity = chartType === "line" ? 0.15 : 0.45; // line area or bar fill

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
    ha-entity-picker {
      display: block;
      width: 100%;
    }

    .tab-bar {
      display: flex;
      gap: 8px;
      margin-top: 16px;
      border-bottom: 1px solid var(--divider-color);
      padding-bottom: 4px;
    }

    .tab {
      border: none;
      background: none;
      font: inherit;
      padding: 8px 12px;
      border-radius: 6px 6px 0 0;
      cursor: pointer;
      color: var(--secondary-text-color);
    }

    .tab.active {
      color: var(--primary-text-color);
      background: var(--card-background-color, rgba(0, 0, 0, 0.05));
      border-bottom: 2px solid var(--primary-color);
    }

    .tab:hover {
      background: var(--card-background-color, rgba(0, 0, 0, 0.08));
    }

    .editor-container {
      padding: 16px 4px 16px 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section {
      display: flex;
      flex-direction: column;
      gap: 12px;
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
      border-radius: 16px;
      background: var(--ha-card-background, var(--card-background-color, #fff));
    }

    .collapsible-header {
      border: none;
      background: none;
      font: inherit;
      display: flex;
      align-items: center;
      width: 100%;
      justify-content: space-between;
      cursor: pointer;
      padding: 14px 16px;
    }

    .collapsible-header:hover {
      background: rgba(0, 0, 0, 0.04);
    }

    .collapsible-title {
      display: flex;
      flex-direction: column;
      gap: 4px;
      text-align: left;
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

    .icon-button:hover:not(.disabled) {
      background-color: rgba(0, 0, 0, 0.08);
      color: var(--primary-text-color);
    }

    .icon-button.disabled {
      opacity: 0.3;
      cursor: not-allowed;
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
      padding-top: 16px;
    }

    .group-card {
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      border-radius: 12px;
      background: var(--ha-card-background, var(--card-background-color, #fff));
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

    .subtitle {
      font-weight: 600;
    }

    .row {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .row.space-between {
      justify-content: space-between;
    }

    .color-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
    }

    .segment-group {
      display: inline-flex;
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      border-radius: 999px;
      overflow: hidden;
    }

    .segment-button {
      background: none;
      border: none;
      padding: 6px 16px;
      font: inherit;
      color: var(--secondary-text-color);
      flex: 1 1 0;
      min-width: 0;
      text-align: center;
      cursor: pointer;
      transition: background 0.2s ease, color 0.2s ease;
    }

    .segment-button + .segment-button {
      border-inline-start: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    }

    .segment-button:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    .segment-button.active {
      background: var(--primary-color);
      color: #fff;
      font-weight: 600;
    }

    .segment-button.active:hover {
      background: var(--primary-color);
    }

    .nested-collapsible {
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      border-radius: 12px;
      background: var(--ha-card-background, var(--card-background-color, #fff));
    }

    .nested-header {
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
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "energy-custom-graph-card-editor": EnergyCustomGraphCardEditor;
  }
}

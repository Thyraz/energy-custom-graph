import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import type { HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";
import { fireEvent } from "custom-card-helpers";
import type {
  EnergyCustomGraphAggregationConfig,
  EnergyCustomGraphCalculationConfig,
  EnergyCustomGraphCalculationTerm,
  EnergyCustomGraphCardConfig,
  EnergyCustomGraphChartType,
  EnergyCustomGraphSeriesConfig,
  EnergyCustomGraphStatisticType,
} from "./types";
import type { StatisticsPeriod } from "./data/statistics";

const ENERGY_COLOR_PRESETS: Array<{ label: string; value: string }> = [
  { label: "Grid consumption", value: "--energy-grid-consumption-color" },
  { label: "Grid return", value: "--energy-grid-return-color" },
  { label: "Solar", value: "--energy-solar-color" },
  { label: "Battery charge", value: "--energy-battery-in-color" },
  { label: "Battery discharge", value: "--energy-battery-out-color" },
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
    const aggregation = cfg.aggregation ?? {};
    const pickerAggregation = aggregation.energy_picker ?? {};
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
            .checked=${cfg.energy_date_selection !== false}
            @change=${(ev: Event) =>
              this._updateConfig("energy_date_selection", (ev.target as HTMLInputElement).checked)}
          ></ha-switch>
          <span>Use energy date picker</span>
        </div>
        <ha-textfield
          label="Collection key"
          helper="Optional key when multiple energy pickers are present"
          .value=${cfg.collection_key ?? ""}
          .disabled=${cfg.energy_date_selection === false}
          @input=${(ev: Event) =>
            this._updateConfig(
              "collection_key",
              (ev.target as HTMLInputElement).value || undefined
            )}
        ></ha-textfield>
        <div class="field">
          <label>Legend sort</label>
          ${(() => {
            const current = cfg.legend_sort ?? "none";
            return html`<select
              @change=${(ev: Event) =>
                this._updateConfig(
                  "legend_sort",
                  (ev.target as HTMLSelectElement).value as any
                )}
            >
              <option value="none" ?selected=${current === "none"}>None</option>
              <option value="asc" ?selected=${current === "asc"}>Ascending</option>
              <option value="desc" ?selected=${current === "desc"}>Descending</option>
            </select>`;
          })()}
        </div>
        <div class="row">
          <ha-switch
            .checked=${cfg.hide_legend === true}
            @change=${(ev: Event) =>
              this._updateBooleanConfig("hide_legend", (ev.target as HTMLInputElement).checked)}
          ></ha-switch>
          <span>Hide legend</span>
        </div>
        <div class="row">
          <ha-switch
            .checked=${cfg.expand_legend === true}
            @change=${(ev: Event) =>
              this._updateBooleanConfig("expand_legend", (ev.target as HTMLInputElement).checked)}
          ></ha-switch>
          <span>Expand legend by default</span>
        </div>
        <div class="row">
          <ha-switch
            .checked=${cfg.fit_y_data === true}
            @change=${(ev: Event) =>
              this._updateBooleanConfig("fit_y_data", (ev.target as HTMLInputElement).checked)}
          ></ha-switch>
          <span>Fit primary Y axis to data</span>
        </div>
        <div class="row">
          <ha-switch
            .checked=${cfg.logarithmic_scale === true}
            @change=${(ev: Event) =>
              this._updateBooleanConfig(
                "logarithmic_scale",
                (ev.target as HTMLInputElement).checked
              )}
          ></ha-switch>
          <span>Primary Y axis logarithmic</span>
        </div>
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
      <div class="section">
        <h4>Aggregation</h4>
        <p class="hint">
          Override the interval used when requesting recorder statistics. Leave empty to keep the
          automatic behaviour.
        </p>
        <div class="field">
          <label>Manual period aggregation</label>
          ${(() => {
            const current = aggregation.manual ?? "";
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
            const current = aggregation.fallback ?? "";
            return html`<select
              @change=${(ev: Event) =>
                this._updateAggregation(
                  "fallback",
                  (ev.target as HTMLSelectElement).value || ""
                )}
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
        ${this._config?.energy_date_selection === false
          ? nothing
          : html`
              <div class="picker-grid">
                ${(["hour", "day", "week", "month", "year"] as AggregationPickerKey[]).map(
                  (key) => html`
                    <div class="field">
                      <label>${`Energy picker → ${key}`}</label>
                      ${(() => {
                        const current = pickerAggregation[key] ?? "";
                        return html`<select
                          @change=${(ev: Event) =>
                            this._updateAggregationPicker(
                              key,
                              (ev.target as HTMLSelectElement).value || ""
                            )}
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
            `}
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
    return html`
      <ha-card outlined class="series-card">
        <div class="series-header">
          <div>
            <h3>${series.name ?? series.statistic_id ?? `Series ${index + 1}`}</h3>
            <p class="hint">
              ${usingCalculation
                ? "Calculation series"
                : series.statistic_id || "No statistic selected"}
            </p>
          </div>
          <div class="series-actions">
            <button type="button" class="text" @click=${() => this._toggleSeriesExpanded(index)}>
              ${expanded ? "Collapse" : "Expand"}
            </button>
            <button type="button" class="text" @click=${() => this._removeSeries(index)}>
              Delete
            </button>
          </div>
        </div>
        ${expanded
          ? html`
              <div class="series-body">
                ${this._renderSeriesBasics(series, index)}
                ${usingCalculation
                  ? this._renderCalculationEditor(series, index)
                  : this._renderStatisticEditor(series, index)}
                ${this._renderDisplayOptions(series, index)}
                ${this._renderTransformOptions(series, index)}
              </div>
            `
          : nothing}
      </ha-card>
    `;
  }

  private _renderSeriesBasics(series: EnergyCustomGraphSeriesConfig, index: number) {
    return html`
      <div class="subsection">
        <ha-textfield
          label="Series name"
          .value=${series.name ?? ""}
          @input=${(ev: Event) =>
            this._updateSeries(index, "name", (ev.target as HTMLInputElement).value || undefined)}
        ></ha-textfield>
        <div class="field">
          <label>Chart type</label>
          ${(() => {
            const current = series.chart_type ?? "bar";
            return html`<select
              @change=${(ev: Event) =>
                this._updateSeries(
                  index,
                  "chart_type",
                  (ev.target as HTMLSelectElement).value as EnergyCustomGraphChartType
                )}
            >
              <option value="bar" ?selected=${current === "bar"}>Bar</option>
              <option value="line" ?selected=${current === "line"}>Line</option>
            </select>`;
          })()}
        </div>
        <div class="row">
          <ha-switch
            .checked=${series.show_legend !== false}
            @change=${(ev: Event) =>
              this._updateSeries(
                index,
                "show_legend",
                (ev.target as HTMLInputElement).checked
              )}
          ></ha-switch>
          <span>Show in legend</span>
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
    `;
  }

  private _renderStatisticEditor(series: EnergyCustomGraphSeriesConfig, index: number) {
    return html`
      <div class="subsection">
          <div class="row space-between">
            <span class="subtitle">Statistic series</span>
            <button
              type="button"
              class="text"
              @click=${() => this._convertSeriesToCalculation(index)}
            >
              Convert to calculation
            </button>
          </div>
        <ha-textfield
          label="Statistic ID"
          .value=${series.statistic_id ?? ""}
          @input=${(ev: Event) =>
            this._updateSeries(
              index,
              "statistic_id",
              (ev.target as HTMLInputElement).value || undefined
            )}
        ></ha-textfield>
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
      </div>
    `;
  }

  private _renderCalculationEditor(series: EnergyCustomGraphSeriesConfig, index: number) {
    const calculation: EnergyCustomGraphCalculationConfig = series.calculation ?? {
      terms: [],
    };
    return html`
      <div class="subsection">
        <div class="row space-between">
          <span class="subtitle">Calculation</span>
          <button
            type="button"
            class="text"
            @click=${() => this._convertSeriesToStatistic(index)}
          >
            Switch to statistic
          </button>
        </div>
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
    return html`
      <ha-card outlined class="term-card">
        <div class="term-header">
          <div class="term-title">
            <strong>${operationLabel}</strong>
            <p class="hint">${descriptor}</p>
          </div>
          <div class="term-actions">
            <button type="button" class="text" @click=${() => this._toggleTermExpanded(termKey)}>
              ${expanded ? "Collapse" : "Expand"}
            </button>
            <button
              type="button"
              class="text"
              @click=${() => this._removeCalculationTerm(seriesIndex, termIndex)}
            >
              Remove
            </button>
          </div>
        </div>
        ${expanded
          ? html`
              <div class="term-body">
                <div class="field">
                  <label>Operation</label>
                  ${(() => {
                    const current = operation;
                    return html`<select
                      @change=${(ev: Event) =>
                        this._updateTerm(
                          seriesIndex,
                          termIndex,
                          "operation",
                          (ev.target as HTMLSelectElement).value as any
                        )}
                    >
                      <option value="add" ?selected=${current === "add"}>Add</option>
                      <option value="subtract" ?selected=${current === "subtract"}
                        >Subtract</option
                      >
                      <option value="multiply" ?selected=${current === "multiply"}
                        >Multiply</option
                      >
                      <option value="divide" ?selected=${current === "divide"}>Divide</option>
                    </select>`;
                  })()}
                </div>
          <ha-textfield
            label="Statistic ID"
            helper="Leave empty to use constant"
            .value=${term.statistic_id ?? ""}
            @input=${(ev: Event) =>
              this._updateTerm(
                seriesIndex,
                termIndex,
                "statistic_id",
                (ev.target as HTMLInputElement).value || undefined
              )}
          ></ha-textfield>
          <div class="field">
            <label>Statistic type</label>
            ${(() => {
              const current = term.stat_type ?? "change";
              return html`<select
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
                    html`<option value=${option.value} ?selected=${current === option.value}
                      >${option.label}</option
                    >`
                )}
              </select>`;
            })()}
          </div>
          <ha-textfield
            label="Constant"
            helper="Used when no statistic is set"
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
              this._updateTermNumber(
                seriesIndex,
                termIndex,
                "add",
                (ev.target as HTMLInputElement).value
              )}
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
              </div>
            `
          : nothing}
      </ha-card>
    `;
  }

  private _renderDisplayOptions(series: EnergyCustomGraphSeriesConfig, index: number) {
    return html`
      <div class="subsection">
        <span class="subtitle">Display</span>
        <div class="color-row">
        <div class="field">
          <label>Preset color</label>
          ${(() => {
            const current = ENERGY_COLOR_PRESETS.find((item) => item.value === series.color)?.value ?? "";
            return html`<select
              @change=${(ev: Event) =>
                this._updateSeries(
                  index,
                  "color",
                  (ev.target as HTMLSelectElement).value || undefined
                )}
            >
              <option value="" ?selected=${current === ""}>Custom</option>
              ${ENERGY_COLOR_PRESETS.map(
                (preset) =>
                  html`<option value=${preset.value} ?selected=${current === preset.value}
                    >${preset.label}</option
                  >`
              )}
            </select>`;
          })()}
        </div>
          <ha-textfield
            label="Custom color"
            .value=${series.color ?? ""}
            @input=${(ev: Event) =>
              this._updateSeries(
                index,
                "color",
                (ev.target as HTMLInputElement).value || undefined
              )}
          ></ha-textfield>
        </div>
        <div class="row">
          <ha-switch
            .checked=${series.fill === true}
            ?disabled=${series.chart_type === "bar"}
            @change=${(ev: Event) =>
              this._updateSeries(index, "fill", (ev.target as HTMLInputElement).checked)}
          ></ha-switch>
          <span>Fill area (lines only)</span>
        </div>
        <ha-textfield
          label="Line opacity"
          type="number"
          helper="Default 0.85 for lines, 0.75 for bars"
          .value=${series.line_opacity !== undefined ? String(series.line_opacity) : ""}
          @input=${(ev: Event) =>
            this._updateSeriesNumber(
              index,
              "line_opacity",
              (ev.target as HTMLInputElement).value
            )}
        ></ha-textfield>
        <ha-textfield
          label="Fill opacity"
          type="number"
          helper="Default 0.15 (lines) / 0.45 (bars)"
          .value=${series.fill_opacity !== undefined ? String(series.fill_opacity) : ""}
          @input=${(ev: Event) =>
            this._updateSeriesNumber(
              index,
              "fill_opacity",
              (ev.target as HTMLInputElement).value
            )}
        ></ha-textfield>
        <ha-textfield
          label="Stack group"
          .value=${series.stack ?? ""}
          @input=${(ev: Event) =>
            this._updateSeries(
              index,
              "stack",
              (ev.target as HTMLInputElement).value || undefined
            )}
        ></ha-textfield>
        <div class="field">
          <label>Stack strategy</label>
          ${(() => {
            const current = series.stack_strategy ?? "";
            return html`<select
              @change=${(ev: Event) =>
                this._updateSeries(
                  index,
                  "stack_strategy",
                  (ev.target as HTMLSelectElement).value || undefined
                )}
            >
              <option value="" ?selected=${current === ""}>Default</option>
              <option value="all" ?selected=${current === "all"}>All</option>
              <option value="samesign" ?selected=${current === "samesign"}
                >Same sign</option
              >
            </select>`;
          })()}
        </div>
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
    `;
  }

  private _renderTransformOptions(series: EnergyCustomGraphSeriesConfig, index: number) {
    return html`
      <div class="subsection">
        <span class="subtitle">Transform</span>
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
      </div>
    `;
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
    const series = [...(this._config!.series ?? [])];
    const target = { ...series[seriesIndex] };
    if (!target.calculation?.terms) {
      return;
    }
    const terms = [...target.calculation.terms];
    const updated: EnergyCustomGraphCalculationTerm = { ...terms[termIndex] };
    (updated as any)[key] = value === "" ? undefined : value;
    terms[termIndex] = updated;
    target.calculation = { ...target.calculation, terms };
    series[seriesIndex] = target;
    this._updateConfig("series", series);
    this._expandedSeries = new Set(this._expandedSeries).add(seriesIndex);
    this._expandedTermKeys = new Set(this._expandedTermKeys).add(`${seriesIndex}-${termIndex}`);
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

  private _setActiveTab(tab: typeof this._activeTab) {
    if (this._activeTab === tab) {
      return;
    }
    this._activeTab = tab;
  }

  static styles = css`
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

    .series-card {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .series-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .series-body {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .series-actions {
      display: flex;
      gap: 8px;
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

    .term-card {
      padding: 12px;
    }

    .term-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .term-title {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .term-actions {
      display: flex;
      gap: 8px;
    }

    .term-body {
      display: grid;
      gap: 12px;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "energy-custom-graph-card-editor": EnergyCustomGraphCardEditor;
  }
}

function e(e,t,i,s){Object.defineProperty(e,t,{get:i,set:s,enumerable:!0,configurable:!0})}var t=globalThis,i={},s={},r=t.parcelRequirec4e1;null==r&&((r=function(e){if(e in i)return i[e].exports;if(e in s){var t=s[e];delete s[e];var r={id:e,exports:{}};return i[e]=r,t.call(r.exports,r,r.exports),r.exports}var a=Error("Cannot find module '"+e+"'");throw a.code="MODULE_NOT_FOUND",a}).register=function(e,t){s[e]=t},t.parcelRequirec4e1=r);var a=r.register;a("c09yQ",function(t,i){e(t.exports,"EnergyCustomGraphCardEditor",()=>b);var s=r("hAmm6");r("fUwgm");var a=r("bBTYI"),o=r("iKGUH"),n=r("2cNIw");r("UE69e");var l=r("esbW4"),d=r("9z3oa"),h=r("ddM75");r("chq2z");var c=r("fxePf"),u=r("e973t"),p=r("glq8a");let m=[{label:"Grid Import • Blue",value:"--energy-grid-consumption-color"},{label:"Grid Export • Purple",value:"--energy-grid-return-color"},{label:"Solar • Orange",value:"--energy-solar-color"},{label:"Battery In • Pink",value:"--energy-battery-in-color"},{label:"Battery Out • Teal",value:"--energy-battery-out-color"},{label:"Gas • Dark Red",value:"--energy-gas-color"},{label:"Water • Cyan",value:"--energy-water-color"},{label:"Non-Fossil • Green",value:"--energy-non-fossil-color"}],_=[{value:"change",label:"Change"},{value:"sum",label:"Sum"},{value:"mean",label:"Mean"},{value:"min",label:"Min"},{value:"max",label:"Max"},{value:"state",label:"State"}],g=[{value:"5minute",label:"5 minute"},{value:"hour",label:"Hour"},{value:"day",label:"Day"},{value:"week",label:"Week"},{value:"month",label:"Month"},{value:"disabled",label:"Disable fetching"},{value:"raw",label:"RAW (history)"}],f="__default__",v="__custom__",y="__inherit__";class b extends n.LitElement{async connectedCallback(){super.connectedCallback(),this._preloadEntityPicker()}async _preloadEntityPicker(){try{if(!customElements.get("ha-entity-picker")){let e=await window.loadCardHelpers(),t=await e.createCardElement({type:"entities",entities:[]});await t.constructor.getConfigElement()}}catch(e){console.debug("Energy Custom Graph: Could not preload ha-entity-picker",e)}}setConfig(e){let t=void 0!==this._config,i=e.series?.map(e=>({...e}))??[],s={...e,series:i};s.type="custom:energy-custom-graph-card",s.timespan=e.timespan??{mode:"energy"},this._config=s,this._syncCustomColorDrafts(i),this._syncColorSelections(i),this._syncCompareCustomColorDrafts(i),this._syncCompareColorSelections(i),t?this._syncExpandedState(i):(this._expandedSeries=new Set,this._expandedTermKeys=new Set)}render(){return this.hass&&this._config?(0,o.html)`
      <div class="tab-bar">
        ${this._renderTabButton("general","General")}
        ${this._renderTabButton("series","Series")}
      </div>
      <div class="editor-container">
        ${"general"===this._activeTab?this._renderGeneralTab():this._renderSeriesTab()}
      </div>
    `:o.nothing}_renderLegendSection(e){let t=e.legend_sort??"none",i=!0===e.hide_legend;return(0,o.html)`
      <div class="group-card">
        <div class="group-header">
          <span class="group-title">Legend</span>
        </div>
        <div class="group-body">
          <div class="row">
            <ha-switch
              .checked=${i}
              @change=${e=>this._updateBooleanConfig("hide_legend",e.target.checked)}
            ></ha-switch>
            <span>Hide legend</span>
          </div>
          ${i?o.nothing:(0,o.html)`
                <div class="field">
                  <label>Legend sort</label>
                  <div class="segment-group" role="group" aria-label="Legend sort">
                    ${[{value:"none",label:"None"},{value:"asc",label:"Asc"},{value:"desc",label:"Desc"}].map(e=>(0,o.html)`
                        <button
                          type="button"
                          class=${(0,c.classMap)({"segment-button":!0,active:t===e.value})}
                          @click=${()=>this._setLegendSort(e.value)}
                        >
                          ${e.label}
                        </button>
                      `)}
                  </div>
                </div>
                <div class="row">
                  <ha-switch
                    .checked=${!0===e.expand_legend}
                    @change=${e=>this._updateBooleanConfig("expand_legend",e.target.checked)}
                  ></ha-switch>
                  <span>Expand legend by default</span>
                </div>
              `}
        </div>
      </div>
    `}_renderAxesSection(e){let t=e.y_axes??[],i=t.find(e=>"left"===e.id),s=t.find(e=>"right"===e.id),r=e.series?.some(e=>"right"===e.y_axis),a=!!s||r,n=this._axesExpanded,l=this._formatAxesSummary(i,s,a);return(0,o.html)`
      <div class="collapsible general-collapsible ${n?"expanded":"collapsed"}">
        <button type="button" class="collapsible-header" @click=${this._toggleAxesExpanded}>
          <div class="collapsible-title">
            <span class="title">Y Axes</span>
            ${l?(0,o.html)`<span class="subtitle">${l}</span>`:o.nothing}
          </div>
          <span class="chevron">
            <ha-icon icon=${n?"mdi:chevron-down":"mdi:chevron-right"}></ha-icon>
          </span>
        </button>
        ${n?(0,o.html)`
              <div class="collapsible-body">
                <div class="section">
                  ${this._renderAxisConfig("left",i)}
                  ${a?(0,o.html)`
                        <div class="axis-separator"></div>
                        ${this._renderAxisConfig("right",s)}
                      `:(0,o.html)`
                        <p class="hint axis-hint">
                          The right Y axis will appear automatically when you assign a series to it.
                        </p>
                      `}
                </div>
              </div>
            `:o.nothing}
      </div>
    `}_renderAxisConfig(e,t){let i="left"===e?"Left Y axis":"Right Y axis",s=t?.center_zero===!0;return(0,o.html)`
      <div class="axis-config">
        <span class="subtitle axis-title">${i}</span>
        <ha-textfield
          label="Min value"
          type="number"
          .disabled=${s}
          .value=${t?.min!==void 0?String(t.min):""}
          @input=${t=>this._updateAxisConfig(e,"min",t.target.value)}
          helper=${s?"Disabled when center zero is active":""}
        ></ha-textfield>
        <ha-textfield
          label="Max value"
          type="number"
          .value=${t?.max!==void 0?String(t.max):""}
          @input=${t=>this._updateAxisConfig(e,"max",t.target.value)}
          helper=${s?"Used for both +max and -max":""}
        ></ha-textfield>
        <ha-textfield
          label="Unit"
          .value=${t?.unit??""}
          @input=${t=>this._updateAxisConfig(e,"unit",t.target.value)}
        ></ha-textfield>
        <div class="row">
          <ha-switch
            .checked=${t?.fit_y_data===!0}
            @change=${t=>this._updateAxisConfig(e,"fit_y_data",t.target.checked)}
          ></ha-switch>
          <span>Fit to data</span>
        </div>
        <div class="row">
          <ha-switch
            .checked=${t?.center_zero===!0}
            @change=${t=>this._updateAxisConfig(e,"center_zero",t.target.checked)}
          ></ha-switch>
          <span>Center zero</span>
        </div>
        <div class="row">
          <ha-switch
            .checked=${t?.logarithmic_scale===!0}
            @change=${t=>this._updateAxisConfig(e,"logarithmic_scale",t.target.checked)}
          ></ha-switch>
          <span>Logarithmic scale</span>
        </div>
      </div>
    `}_renderTooltipSection(e){return(0,o.html)`
      <div class="group-card">
        <div class="group-header">
          <span class="group-title">Tooltip</span>
        </div>
        <div class="group-body">
          <div class="row">
            <ha-switch
              .checked=${!1!==e.show_unit}
              @change=${e=>this._updateConfig("show_unit",e.target.checked)}
            ></ha-switch>
            <span>Show units</span>
          </div>
          <ha-textfield
            label="Tooltip precision"
            type="number"
            .value=${void 0!==e.tooltip_precision?String(e.tooltip_precision):""}
            @input=${e=>this._updateNumericConfig("tooltip_precision",e.target.value)}
          ></ha-textfield>
          <div class="row">
            <ha-switch
              .checked=${!0===e.show_stack_sums}
              @change=${e=>this._updateConfig("show_stack_sums",e.target.checked)}
            ></ha-switch>
            <span>Show stack sums</span>
          </div>
        </div>
      </div>
    `}_renderAggregationPickerOptions(e){return(0,o.html)`
      <div class="section">
        <p class="hint">
          Override the interval used when requesting statistics via the energy date picker.
        </p>
        <div class="picker-grid">
          ${["hour","day","week","month","year"].map(t=>(0,o.html)`
              <div class="field">
                <label>${`Energy picker \u{2192} ${t}`}</label>
                ${(()=>{let i=e[t]??"";return(0,o.html)`<select
                    @change=${e=>this._updateAggregationPicker(t,e.target.value||"")}
                  >
                    <option value="" ?selected=${""===i}>Automatic</option>
                    ${g.map(e=>(0,o.html)`<option value=${e.value} ?selected=${i===e.value}
                          >${e.label}</option
                        >`)}
                  </select>`})()}
              </div>
            `)}
        </div>
      </div>
    `}_setLegendSort(e){this._updateConfig("legend_sort",e)}_renderAggregationManualOptions(e){return(0,o.html)`
      <div class="section">
        <p class="hint">
          Override the interval used when requesting recorder statistics. Leave empty to keep the
          automatic behaviour.
        </p>
        <div class="field">
          <label>Manual period aggregation</label>
          ${(()=>{let t=e?.manual??"";return(0,o.html)`<select
              @change=${e=>this._updateAggregation("manual",e.target.value||"")}
            >
              <option value="" ?selected=${""===t}>Automatic</option>
              ${g.map(e=>(0,o.html)`<option value=${e.value} ?selected=${t===e.value}
                    >${e.label}</option
                  >`)}
            </select>`})()}
        </div>
        <div class="field">
          <label>Fallback aggregation</label>
          ${(()=>{let t=e?.fallback??"";return(0,o.html)`<select
              @change=${e=>this._updateAggregation("fallback",e.target.value||"")}
            >
              <option value="" ?selected=${""===t}>None</option>
              ${g.map(e=>(0,o.html)`<option value=${e.value} ?selected=${t===e.value}
                    >${e.label}</option
                  >`)}
            </select>`})()}
        </div>
      </div>
    `}_renderRawOptions(e){if(!this._aggregationUsesRaw(e))return o.nothing;let t={...e?.raw_options??{}},i=void 0===t.significant_changes_only?"auto":t.significant_changes_only?"true":"false",s=e?.raw_refresh_interval_seconds??60;return(0,o.html)`
      <div class="section">
        <p class="hint">
          Configure how RAW history requests behave. Automatic uses Home Assistant&apos;s default
          behaviour.
        </p>
        <div class="field">
          <label>Significant changes only</label>
          <select
            @change=${e=>this._updateRawOption("significant_changes_only",e.target.value)}
          >
            <option value="auto" ?selected=${"auto"===i}>Automatic</option>
            <option value="true" ?selected=${"true"===i}>Yes</option>
            <option value="false" ?selected=${"false"===i}>No</option>
          </select>
        </div>
        <div class="field">
          <label>RAW auto-refresh interval (seconds)</label>
          <ha-textfield
            type="number"
            min="5"
            helper="Minimum 5 seconds. Default 60s."
            .value=${String(s)}
            @input=${e=>this._updateAggregationNumber("raw_refresh_interval_seconds",e.target.value)}
          ></ha-textfield>
        </div>
      </div>
    `}_renderComputeCurrentHourOption(e){let t=e?.compute_current_hour===!0;return(0,o.html)`
      <div class="section">
        <div class="row">
          <ha-switch
            .checked=${t}
            @change=${e=>this._updateAggregationFlag("compute_current_hour",e.target.checked)}
          ></ha-switch>
          <span>Compute current hour value</span>
        </div>
        <p class="hint">
          Adds a live estimate for the ongoing hour by aggregating recent 5 minute statistics.
          This requires additional database queries, so server load might increase slightly.
        </p>
      </div>
    `}_aggregationUsesRaw(e){return!!e&&("raw"===e.manual||"raw"===e.fallback||!!e.energy_picker&&Object.values(e.energy_picker).some(e=>"raw"===e))}_updateRawOption(e,t){let i={...this._config.aggregation},s={...i.raw_options??{}};"auto"===t?delete s[e]:s[e]="true"===t,Object.keys(s).length?i.raw_options=s:delete i.raw_options;let r=this._cleanupAggregation(i);this._updateConfig("aggregation",r)}_renderTabButton(e,t){return(0,o.html)`
      <button
        type="button"
        class=${(0,c.classMap)({tab:!0,active:this._activeTab===e})}
        @click=${()=>this._setActiveTab(e)}
      >
        ${t}
      </button>
    `}_renderGeneralTab(){let e=this._config,t=e.timespan?.mode==="energy",i=e.aggregation,s=i?.energy_picker??{},r=this._aggregationExpanded,a=this._formatAggregationSummary(i,t);return(0,o.html)`
      <div class="section">
        <ha-textfield
          .label=${this.hass.localize("ui.panel.lovelace.editor.card.generic.title")}
          .value=${e.title??""}
          @input=${e=>this._updateConfig("title",e.target.value)}
        ></ha-textfield>
        <ha-textfield
          label="Chart height"
          helper="CSS height (e.g. 320px, 20rem). Ignored when used in a section layout."
          .value=${e.chart_height??""}
          @input=${e=>this._updateConfig("chart_height",e.target.value||void 0)}
        ></ha-textfield>
${this._renderTimespanSection(e)}
      </div>
      ${this._renderLegendSection(e)}
      ${this._renderTooltipSection(e)}
      ${this._renderAxesSection(e)}
      <div class="collapsible general-collapsible ${r?"expanded":"collapsed"}">
        <button type="button" class="collapsible-header" @click=${this._toggleAggregationExpanded}>
          <div class="collapsible-title">
            <span class="title">Aggregation</span>
            ${a?(0,o.html)`<span class="subtitle">${a}</span>`:o.nothing}
          </div>
          <span class="chevron">
            <ha-icon icon=${r?"mdi:chevron-down":"mdi:chevron-right"}></ha-icon>
          </span>
        </button>
        ${r?(0,o.html)`
              <div class="collapsible-body aggregation-body">
                ${t?this._renderAggregationPickerOptions(s):this._renderAggregationManualOptions(i)}
                ${this._renderRawOptions(i)}
                ${this._renderComputeCurrentHourOption(i)}
              </div>
            `:o.nothing}
      </div>
    `}_renderSeriesTab(){let e=this._config.series??[];return(0,o.html)`
      <div class="series-list">
        ${e.length?e.map((e,t)=>this._renderSeriesCard(e,t)):(0,o.html)`<p class="hint">No series configured yet.</p>`}
        <button type="button" class="outlined" @click=${this._addSeries}>Add series</button>
      </div>
    `}_renderSeriesCard(e,t){let i=!!e.calculation,s=this._expandedSeries.has(t),r=this._config?.series?.length??0,a=0===t,n=t===r-1;return(0,o.html)`
      <div class="collapsible ${s?"expanded":"collapsed"}">
        <button
          type="button"
          class="collapsible-header"
          @click=${()=>this._toggleSeriesExpanded(t)}
        >
          <div class="collapsible-title">
            <span class="title">${e.name??e.statistic_id??`Series ${t+1}`}</span>
            <span class="subtitle">
              ${i?"Calculation series":e.statistic_id||"No statistic selected"}
            </span>
          </div>
          <div class="header-actions">
            <div class="reorder-buttons">
              <div
                class="icon-button ${a?"disabled":""}"
                role="button"
                tabindex="0"
                @click=${e=>{a||(e.stopPropagation(),this._moveSeriesUp(t))}}
                @keydown=${e=>{a||"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),e.stopPropagation(),this._moveSeriesUp(t))}}
                title="Move up"
              >
                <ha-icon icon="mdi:chevron-up"></ha-icon>
              </div>
              <div
                class="icon-button ${n?"disabled":""}"
                role="button"
                tabindex="0"
                @click=${e=>{n||(e.stopPropagation(),this._moveSeriesDown(t))}}
                @keydown=${e=>{n||"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),e.stopPropagation(),this._moveSeriesDown(t))}}
                title="Move down"
              >
                <ha-icon icon="mdi:chevron-down"></ha-icon>
              </div>
            </div>
            <span class="chevron">
              <ha-icon icon=${s?"mdi:chevron-down":"mdi:chevron-right"}></ha-icon>
            </span>
          </div>
        </button>
        ${s?(0,o.html)`
              <div class="collapsible-body">
                ${this._renderSeriesBasicsGroup(e,t)}
                ${this._renderSeriesSourceGroup(e,t)}
                ${this._renderSeriesDisplayGroup(e,t)}
                ${this._renderSeriesTransformGroup(e,t)}
                <div class="section-footer series-footer">
                  <button
                    type="button"
                    class="text warning"
                    @click=${e=>{e.stopPropagation(),this._removeSeries(t)}}
                  >
                    Delete series
                  </button>
                </div>
              </div>
            `:o.nothing}
      </div>
    `}_renderTimespanSection(e){let t=e.timespan??{mode:"energy"},i=t.mode;return(0,o.html)`
      <div class="section">
        <div class="field">
          <label>Mode</label>
          <div class="radio-group">
            ${[{value:"energy",label:"Follow energy date picker"},{value:"relative",label:"Relative time period"},{value:"fixed",label:"Fixed timespan"}].map(e=>(0,o.html)`
                <label class="radio-option">
                  <input
                    type="radio"
                    name="timespan-mode"
                    .value=${e.value}
                    .checked=${i===e.value}
                    @change=${()=>this._setTimespanMode(e.value)}
                  />
                  <span>${e.label}</span>
                </label>
              `)}
          </div>
        </div>

        ${"energy"===i?(0,o.html)`
              <ha-textfield
                label="Collection key"
                helper="Optional key when multiple energy pickers are present"
                .value=${e.collection_key??""}
                @input=${e=>this._updateConfig("collection_key",e.target.value||void 0)}
              ></ha-textfield>
              <div class="row">
                <ha-switch
                  .checked=${!1!==e.allow_compare}
                  @change=${e=>this._updateConfig("allow_compare",e.target.checked)}
                ></ha-switch>
                <span>Follow compare toggle</span>
              </div>
            `:o.nothing}

        ${"relative"===i?(0,o.html)`
              <div class="field">
                <label>Period</label>
                <select
                  @change=${e=>this._updateTimespanRelativePeriod(e.target.value)}
                >
                  ${[{value:"hour",label:"Hour"},{value:"day",label:"Day"},{value:"week",label:"Week"},{value:"month",label:"Month"},{value:"year",label:"Year"},{value:"last_60_minutes",label:"Last 60 minutes"},{value:"last_24_hours",label:"Last 24 hours"},{value:"last_7_days",label:"Last 7 days"},{value:"last_30_days",label:"Last 30 days"},{value:"last_12_months",label:"Last 12 months"}].map(({value:e,label:i})=>(0,o.html)`
                      <option
                        value=${e}
                        ?selected=${"relative"===t.mode&&t.period===e}
                      >
                        ${i}
                      </option>
                    `)}
                </select>
              </div>
              <ha-textfield
                label="Offset"
                type="number"
                .value=${"relative"===t.mode?String(t.offset??0):"0"}
                @input=${e=>this._updateTimespanRelativeOffset(Number(e.target.value))}
              ></ha-textfield>
            `:o.nothing}

        ${"fixed"===i?(0,o.html)`
              <ha-textfield
                label="Start"
                helper="ISO 8601 format (e.g. 2024-01-01T00:00:00)"
                .value=${"fixed"===t.mode?t.start??"":""}
                @input=${e=>this._updateTimespanFixedStart(e.target.value||void 0)}
              ></ha-textfield>
              <ha-textfield
                label="End"
                helper="ISO 8601 format (e.g. 2024-01-31T23:59:59)"
                .value=${"fixed"===t.mode?t.end??"":""}
                @input=${e=>this._updateTimespanFixedEnd(e.target.value||void 0)}
              ></ha-textfield>
            `:o.nothing}
      </div>
    `}_renderSeriesBasicsGroup(e,t){let i=e.chart_type??"bar";return(0,o.html)`
      <div class="group-card">
        <div class="group-header">
          <span class="group-title">Basics</span>
        </div>
        <div class="group-body">
          <ha-textfield
            label="Series name"
            .value=${e.name??""}
            @input=${e=>this._updateSeries(t,"name",e.target.value||void 0)}
          ></ha-textfield>
          <div class="field">
            <label>Chart type</label>
            <div class="segment-group" role="group" aria-label="Chart type">
              ${[{value:"bar",label:"Bar"},{value:"line",label:"Line"},{value:"step",label:"Step"}].map(e=>(0,o.html)`
                  <button
                    type="button"
                    class=${(0,c.classMap)({"segment-button":!0,active:i===e.value})}
                    @click=${()=>this._setSeriesChartType(t,e.value)}
                  >
                    ${e.label}
                  </button>
                `)}
            </div>
          </div>
          <div class="field">
            <label>Y axis</label>
            <div class="segment-group" role="group" aria-label="Y axis">
              ${[{value:"left",label:"Left"},{value:"right",label:"Right"}].map(i=>(0,o.html)`
                  <button
                    type="button"
                    class=${(0,c.classMap)({"segment-button":!0,active:(e.y_axis??"left")===i.value})}
                    @click=${()=>this._updateSeries(t,"y_axis",i.value)}
                  >
                    ${i.label}
                  </button>
                `)}
            </div>
          </div>
        </div>
      </div>
    `}_renderSeriesSourceGroup(e,t){let i=e.calculation?"calculation":"statistic";return(0,o.html)`
      <div class="group-card">
        <div class="group-header">
          <span class="group-title">Data source</span>
        </div>
        <div class="group-body series-source-body">
          <div class="segment-group" role="group" aria-label="Data source">
            ${["statistic","calculation"].map(e=>(0,o.html)`
                <button
                  type="button"
                  class=${(0,c.classMap)({"segment-button":!0,active:i===e})}
                  @click=${()=>this._setSeriesSource(t,e)}
                >
                  ${"statistic"===e?"Statistic":"Calculation"}
                </button>
              `)}
          </div>
          ${"calculation"===i?this._renderSeriesCalculationContent(e,t):this._renderSeriesStatisticContent(e,t)}
        </div>
      </div>
    `}_renderSeriesStatisticContent(e,t){return this.hass?(0,o.html)`
      <ha-entity-picker
        .hass=${this.hass}
        .value=${e.statistic_id}
        .label=${"Statistic ID"}
        allow-custom-entity
        @value-changed=${e=>this._updateSeries(t,"statistic_id",e.detail.value||void 0)}
      ></ha-entity-picker>
      <div class="field">
        <label>Statistic type</label>
        ${(()=>{let i=e.stat_type??"change";return(0,o.html)`<select
            @change=${e=>this._updateSeries(t,"stat_type",e.target.value)}
          >
            ${_.map(e=>(0,o.html)`<option value=${e.value} ?selected=${i===e.value}
                  >${e.label}</option
                >`)}
          </select>`})()}
      </div>
    `:(0,o.html)`<p>Loading...</p>`}_renderSeriesCalculationContent(e,t){let i=e.calculation??{terms:[]};return(0,o.html)`
      <ha-textfield
        label="Calculation unit"
        .value=${i.unit??""}
        @input=${e=>this._updateCalculation(t,{...i,unit:e.target.value||void 0})}
      ></ha-textfield>
      <ha-textfield
        label="Initial value"
        type="number"
        .value=${void 0!==i.initial_value?String(i.initial_value):"0"}
        @input=${e=>this._updateCalculation(t,{...i,initial_value:e.target.value?Number(e.target.value):0})}
      ></ha-textfield>
      <div class="terms-list">
        ${i.terms?.length?i.terms.map((e,i)=>this._renderCalculationTerm(t,i,e)):(0,o.html)`<p class="hint">Add at least one term to build the calculation.</p>`}
      </div>
      <button type="button" class="outlined" @click=${()=>this._addCalculationTerm(t)}>
        Add term
      </button>
    `}_renderCalculationTerm(e,t,i){let s=i.operation??"add",r=`${e}-${t}`,a=this._expandedTermKeys.has(r),n=this._formatOperation(s),l=i.statistic_id&&i.statistic_id.trim().length?i.statistic_id.trim():void 0!==i.constant?`Constant: ${i.constant}`:"No input selected";return(0,o.html)`
      <div class="nested-collapsible ${a?"expanded":"collapsed"}">
        <button type="button" class="nested-header" @click=${()=>this._toggleTermExpanded(r)}>
          <div class="nested-title">
            <strong>${n}</strong>
            <p class="hint">${l}</p>
          </div>
          <span class="chevron">
            <ha-icon icon=${a?"mdi:chevron-down":"mdi:chevron-right"}></ha-icon>
          </span>
        </button>
        ${a?(0,o.html)`
              <div class="nested-body">
                <div class="term-body column">
                  ${this._renderTermOperationField(e,t,s)}
                  ${this._renderTermSourceFields(e,t,i)}
                  ${this._renderTermTransformFields(e,t,i)}
                </div>
                <div class="nested-footer">
                  <button
                    type="button"
                    class="text warning"
                    @click=${i=>{i.stopPropagation(),this._removeCalculationTerm(e,t)}}
                  >
                    Remove term
                  </button>
                </div>
              </div>
            `:o.nothing}
      </div>
    `}_renderTermOperationField(e,t,i){let s=i??"add";return(0,o.html)`
      <div class="field">
        <label>Operation</label>
        <select
          @change=${i=>this._updateTerm(e,t,"operation",i.target.value)}
        >
          <option value="add" ?selected=${"add"===s}>Add</option>
          <option value="subtract" ?selected=${"subtract"===s}>Subtract</option>
          <option value="multiply" ?selected=${"multiply"===s}>Multiply</option>
          <option value="divide" ?selected=${"divide"===s}>Divide</option>
        </select>
      </div>
    `}_renderTermSourceFields(e,t,i){if(!this.hass)return(0,o.html)`<p>Loading...</p>`;let s=void 0!==i.constant?"constant":"statistic";return(0,o.html)`
      <div class="field full-width">
        <label>Input type</label>
        <div class="segment-group" role="group" aria-label="Term input type">
          ${[{value:"statistic",label:"Statistic"},{value:"constant",label:"Constant"}].map(i=>(0,o.html)`
              <button
                type="button"
                class=${(0,c.classMap)({"segment-button":!0,active:s===i.value})}
                @click=${()=>this._setTermMode(e,t,i.value)}
              >
                ${i.label}
              </button>
            `)}
        </div>
      </div>
      ${"statistic"===s?(0,o.html)`
            <ha-entity-picker
              .hass=${this.hass}
              .value=${i.statistic_id}
              .label=${"Statistic ID"}
              .helper=${"Recorder statistic (e.g. sensor.energy_import)"}
              allow-custom-entity
              @value-changed=${i=>this._updateTerm(e,t,"statistic_id",i.detail.value||void 0)}
            ></ha-entity-picker>
            <div class="field">
              <label>Statistic type</label>
              <select
                @change=${i=>this._updateTerm(e,t,"stat_type",i.target.value)}
              >
                ${_.map(e=>(0,o.html)`<option value=${e.value} ?selected=${(i.stat_type??"change")===e.value}>
                      ${e.label}
                    </option>`)}
              </select>
            </div>
          `:(0,o.html)`
            <ha-textfield
              label="Constant"
              helper="Fixed value added every step"
              type="number"
              .value=${void 0!==i.constant?String(i.constant):""}
              @input=${i=>this._updateTermNumber(e,t,"constant",i.target.value)}
            ></ha-textfield>
          `}
    `}_renderTermTransformFields(e,t,i){return void 0!==i.constant?o.nothing:(0,o.html)`
      <span class="subtitle term-transform-title">Transform</span>
      <ha-textfield
        label="Multiply"
        type="number"
        .value=${void 0!==i.multiply?String(i.multiply):""}
        @input=${i=>this._updateTermNumber(e,t,"multiply",i.target.value)}
      ></ha-textfield>
      <ha-textfield
        label="Add"
        type="number"
        .value=${void 0!==i.add?String(i.add):""}
        @input=${i=>this._updateTermNumber(e,t,"add",i.target.value)}
      ></ha-textfield>
      <ha-textfield
        label="Clip min"
        type="number"
        .value=${void 0!==i.clip_min?String(i.clip_min):""}
        @input=${i=>this._updateTermNumber(e,t,"clip_min",i.target.value)}
      ></ha-textfield>
      <ha-textfield
        label="Clip max"
        type="number"
        .value=${void 0!==i.clip_max?String(i.clip_max):""}
        @input=${i=>this._updateTermNumber(e,t,"clip_max",i.target.value)}
      ></ha-textfield>
    `}_setTermMode(e,t,i){this._mutateTerm(e,t,e=>{"statistic"===i?(e.constant=void 0,e.statistic_id||(e.statistic_id=""),e.stat_type||(e.stat_type="change")):(e.statistic_id=void 0,e.stat_type=void 0,e.multiply=void 0,e.add=void 0,e.clip_min=void 0,e.clip_max=void 0,void 0===e.constant&&(e.constant=0))})}_renderSeriesDisplayGroup(e,t){let i=e.chart_type??"bar",s="line"===i||"step"===i,r=s&&!0===e.fill,a="string"==typeof e.color?e.color.trim():void 0,n=this._extractPresetToken(a),l=a?n||v:f,d=this._colorModeSelections.get(t)??l,h=this._customColorDrafts.get(t),u=this._resolveAutoColorToken(t),p=d===v?h??a??"":h??"",_=d===f?u:d===v?p||a||u:d,g=void 0!==_?this._normalizeColorToken(_):void 0,b=d===v?p??"":"",$="string"==typeof e.compare_color?e.compare_color.trim():void 0,S=this._extractPresetToken($),x=$?S||v:y,w=this._compareColorModeSelections.get(t)??x,C=this._compareCustomColorDrafts.get(t),A=w===v?C??$??"":C??"",T=w===y?_:w===v?C??$??"":w,E=void 0!==T?this._normalizeColorToken(T):void 0;return(0,o.html)`
      <div class="group-card">
        <div class="group-header">
          <span class="group-title">Display</span>
        </div>
        <div class="group-body">
          <div class="color-row">
            <div class="field">
              <label>Series color</label>
              <div class="color-select-wrapper">
                ${this._renderColorPreview(g,i)}
                <select
                  .value=${d}
                  @change=${e=>this._handleSeriesColorSelect(t,e.target.value)}
                >
                  <option
                    value=${f}
                    ?selected=${d===f}
                  >
                    Default (Auto palette)
                  </option>
                  ${m.map(e=>(0,o.html)`<option
                        value=${e.value}
                        ?selected=${d===e.value}
                      >
                        ${e.label}
                      </option>`)}
                  <option
                    value=${v}
                    ?selected=${d===v}
                  >
                    Custom
                  </option>
                </select>
              </div>
            </div>
          </div>
          ${d===v?(0,o.html)`
                <div class="color-row">
                  <ha-textfield
                    label="Custom color"
                    .value=${b??""}
                    @input=${e=>{let i=e.target;this._handleCustomColorInput(t,i.value)}}
                  ></ha-textfield>
                </div>
              `:o.nothing}
          <div class="color-row">
            <div class="field">
              <label>Compare series color</label>
              <div class="color-select-wrapper">
                ${this._renderColorPreview(E,i)}
                <select
                  .value=${w}
                  @change=${e=>this._handleCompareColorSelect(t,e.target.value)}
                >
                  <option
                    value=${y}
                    ?selected=${w===y}
                  >
                    Inherit (default)
                  </option>
                  ${m.map(e=>(0,o.html)`<option
                        value=${e.value}
                        ?selected=${w===e.value}
                      >
                        ${e.label}
                      </option>`)}
                  <option
                    value=${v}
                    ?selected=${w===v}
                  >
                    Custom
                  </option>
                </select>
              </div>
            </div>
          </div>
          ${w===v?(0,o.html)`
                <div class="color-row">
                  <ha-textfield
                    label="Custom compare color"
                    .value=${A??""}
                    @input=${e=>{let i=e.target;this._handleCompareCustomColorInput(t,i.value)}}
                  ></ha-textfield>
                </div>
              `:o.nothing}
          <div class="row">
            <ha-switch
              .checked=${!1!==e.show_in_legend}
              @change=${e=>this._updateSeries(t,"show_in_legend",e.target.checked)}
            ></ha-switch>
            <span>Show in legend</span>
          </div>
          <div class="row">
            <ha-switch
              .checked=${!0===e.hidden_by_default}
              @change=${e=>this._updateSeries(t,"hidden_by_default",e.target.checked)}
            ></ha-switch>
            <span>Hidden by default</span>
          </div>
          <div class="row">
            <ha-switch
              .checked=${!1!==e.show_in_tooltip}
              @change=${e=>this._updateSeries(t,"show_in_tooltip",e.target.checked)}
            ></ha-switch>
            <span>Show in tooltip</span>
          </div>
          ${s?(0,o.html)`
                <div class="row">
                  <ha-switch
                    .checked=${!0===e.fill}
                    @change=${e=>this._updateSeries(t,"fill",e.target.checked)}
                  ></ha-switch>
                  <span>Fill area</span>
                </div>
              `:o.nothing}
          <ha-textfield
            label="Fill opacity"
            type="number"
            step="0.01"
            min="0"
            max="1"
            helper="Default 0.15 (lines) / 0.5 (bars)"
            .value=${void 0!==e.fill_opacity?String(e.fill_opacity):""}
            @input=${e=>this._updateSeriesNumber(t,"fill_opacity",e.target.value)}
          ></ha-textfield>
          ${r?(0,o.html)`
                <ha-textfield
                  label="Fill to series"
                  helper="Name of the line series to fill towards"
                  .value=${e.fill_to_series??""}
                  @input=${e=>this._updateSeries(t,"fill_to_series",e.target.value||void 0)}
                ></ha-textfield>
              `:o.nothing}
          <ha-textfield
            label="Line opacity"
            type="number"
            step="0.01"
            min="0"
            max="1"
            helper="Default 0.85 for lines, 1.0 for bars"
            .value=${void 0!==e.line_opacity?String(e.line_opacity):""}
            @input=${e=>this._updateSeriesNumber(t,"line_opacity",e.target.value)}
          ></ha-textfield>
          ${s?(0,o.html)`
                <ha-textfield
                  label="Line width"
                  type="number"
                  step="0.5"
                  min="0.5"
                  helper="Default 1.5"
                  .value=${void 0!==e.line_width?String(e.line_width):""}
                  @input=${e=>this._updateSeriesNumber(t,"line_width",e.target.value)}
                ></ha-textfield>
                <div class="field">
                  <label>Line style</label>
                  <div class="segment-group" role="group" aria-label="Line style">
                    ${["solid","dashed","dotted"].map(i=>(0,o.html)`
                        <button
                          type="button"
                          class=${(0,c.classMap)({"segment-button":!0,active:(e.line_style??"solid")===i})}
                          @click=${()=>this._setSeriesLineStyle(t,i)}
                        >
                          ${i.charAt(0).toUpperCase()+i.slice(1)}
                        </button>
                      `)}
                  </div>
                </div>
              `:o.nothing}
          <ha-textfield
            label="Stack group"
            helper="Series using the same name will stack together"
            .value=${e.stack??""}
            @input=${e=>this._updateSeries(t,"stack",e.target.value||void 0)}
          ></ha-textfield>
        </div>
      </div>
    `}_renderSeriesTransformGroup(e,t){let i=e.chart_type??"bar";return(0,o.html)`
      <div class="group-card">
        <div class="group-header">
          <span class="group-title">Transform</span>
        </div>
        <div class="group-body">
          <ha-textfield
            label="Multiply"
            type="number"
            .value=${void 0!==e.multiply?String(e.multiply):""}
            @input=${e=>this._updateSeriesNumber(t,"multiply",e.target.value)}
          ></ha-textfield>
          <ha-textfield
            label="Add"
            type="number"
            .value=${void 0!==e.add?String(e.add):""}
            @input=${e=>this._updateSeriesNumber(t,"add",e.target.value)}
          ></ha-textfield>
          ${"line"===i?(0,o.html)`
                <ha-textfield
                  label="Smooth"
                  helper="Boolean or number (0-1). Leave empty for default."
                  .value=${void 0!==e.smooth?String(e.smooth):""}
                  @input=${e=>this._updateSeriesSmooth(t,e.target.value)}
                ></ha-textfield>
              `:o.nothing}
          <ha-textfield
            label="Clip min"
            type="number"
            .value=${void 0!==e.clip_min?String(e.clip_min):""}
            @input=${e=>this._updateSeriesNumber(t,"clip_min",e.target.value)}
          ></ha-textfield>
          <ha-textfield
            label="Clip max"
            type="number"
            .value=${void 0!==e.clip_max?String(e.clip_max):""}
            @input=${e=>this._updateSeriesNumber(t,"clip_max",e.target.value)}
          ></ha-textfield>
        </div>
      </div>
    `}_setSeriesChartType(e,t){let i=this._config.series??[];i[e]&&i[e]?.chart_type!==t&&(this._updateSeries(e,"chart_type",t),"line"!==t&&this._updateSeries(e,"smooth",void 0))}_setSeriesLineStyle(e,t){let i=this._config.series??[];i[e]?.line_style!==t&&this._updateSeries(e,"line_style",t)}_setSeriesSource(e,t){let i=(this._config.series??[])[e];if(!i)return;let s=!!i.calculation;if("calculation"===t){s||this._convertSeriesToCalculation(e);return}s&&this._convertSeriesToStatistic(e)}_addSeries(){let e=[...this._config.series??[],{statistic_id:"",chart_type:"bar",stat_type:"change"}];this._updateConfig("series",e),this._expandedSeries=new Set(this._expandedSeries).add(e.length-1)}_moveSeriesUp(e){if(0===e)return;let t=[...this._config.series??[]];[t[e-1],t[e]]=[t[e],t[e-1]];let i=new Set;this._expandedSeries.forEach(t=>{t===e?i.add(e-1):t===e-1?i.add(e):i.add(t)}),this._expandedSeries=i,this._updateConfig("series",t)}_moveSeriesDown(e){let t=[...this._config.series??[]];if(e>=t.length-1)return;[t[e],t[e+1]]=[t[e+1],t[e]];let i=new Set;this._expandedSeries.forEach(t=>{t===e?i.add(e+1):t===e+1?i.add(e):i.add(t)}),this._expandedSeries=i,this._updateConfig("series",t)}_removeSeries(e){let t=[...this._config.series??[]];t.splice(e,1),this._updateConfig("series",t);let i=new Set;this._expandedSeries.forEach(s=>{if(s===e)return;let r=s>e?s-1:s;r>=0&&r<t.length&&i.add(r)}),this._expandedSeries=i;let s=[];this._expandedTermKeys.forEach(i=>{let[r,a]=i.split("-"),o=Number(r);if(Number.isNaN(o)||o===e)return;let n=o>e?o-1:o;n>=0&&n<t.length&&s.push(`${n}-${a}`)}),this._expandedTermKeys=new Set(s)}_convertSeriesToCalculation(e){let t=[...this._config.series??[]],i={...t[e]};delete i.statistic_id,i.calculation=i.calculation??{terms:[]},t[e]=i,this._updateConfig("series",t),this._expandedSeries=new Set(this._expandedSeries).add(e)}_convertSeriesToStatistic(e){let t=[...this._config.series??[]],i={...t[e]};delete i.calculation,i.statistic_id||(i.statistic_id=""),t[e]=i,this._updateConfig("series",t),this._expandedSeries=new Set(this._expandedSeries).add(e)}_addCalculationTerm(e){let t=[...this._config.series??[]],i={...t[e]},s=i.calculation??{terms:[]};s.terms=[...s.terms??[],{operation:"add"}],i.calculation=s,t[e]=i,this._updateConfig("series",t),this._expandedSeries=new Set(this._expandedSeries).add(e);let r=(s.terms?.length??1)-1;this._expandedTermKeys=new Set(this._expandedTermKeys).add(`${e}-${r}`)}_removeCalculationTerm(e,t){let i=[...this._config.series??[]],s={...i[e]};if(!s.calculation?.terms)return;let r=[...s.calculation.terms];r.splice(t,1),s.calculation={...s.calculation,terms:r},i[e]=s,this._updateConfig("series",i),this._expandedTermKeys=new Set(Array.from(this._expandedTermKeys).filter(i=>i!==`${e}-${t}`))}_updateTerm(e,t,i,s){this._mutateTerm(e,t,e=>{"constant"===i&&void 0!==s&&""!==s&&(e.statistic_id=void 0,e.stat_type=void 0,e.multiply=void 0,e.add=void 0,e.clip_min=void 0,e.clip_max=void 0),"statistic_id"===i&&(void 0===s||""===s)&&(e.constant=void 0),e[i]=""===s?void 0:s})}_updateTermNumber(e,t,i,s){let r=""===s?void 0:Number(s);this._updateTerm(e,t,i,r)}_mutateTerm(e,t,i){let s=[...this._config.series??[]],r={...s[e]},a=r.calculation;if(!a?.terms||t<0||t>=a.terms.length)return;let o=[...a.terms],n={...o[t]};i(n),o[t]=n,r.calculation={...a,terms:o},s[e]=r,this._updateConfig("series",s),this._expandedSeries=new Set(this._expandedSeries).add(e),this._expandedTermKeys=new Set(this._expandedTermKeys).add(`${e}-${t}`)}_updateCalculation(e,t){let i=[...this._config.series??[]],s={...i[e],calculation:t};i[e]=s,this._updateConfig("series",i),this._expandedSeries=new Set(this._expandedSeries).add(e)}_updateSeries(e,t,i){let s=[...this._config.series??[]],r={...s[e]};r[t]=""===i?void 0:i,"calculation"===t&&void 0===i&&(r.calculation=void 0),s[e]=r,this._updateConfig("series",s),this._expandedSeries=new Set(this._expandedSeries).add(e)}_updateSeriesNumber(e,t,i){let s=""===i?void 0:Number(i);this._updateSeries(e,t,s)}_updateSeriesSmooth(e,t){if(""===t)return void this._updateSeries(e,"smooth",void 0);if("true"===t||"false"===t)return void this._updateSeries(e,"smooth","true"===t);let i=Number(t);this._updateSeries(e,"smooth",Number.isNaN(i)?void 0:i)}_updateAxisConfig(e,t,i){let s,r=[...this._config?.y_axes??[]],a=r.findIndex(t=>t.id===e);if(("min"===t||"max"===t)&&(s=""===i?void 0:Number(i),""!==i&&Number.isNaN(s)))return;let o="min"===t||"max"===t?s:"unit"===t&&""===i?void 0:i;if(a>=0){let e={...r[a]};e[t]=o,void 0===o&&delete e[t],r[a]=e}else r.push({id:e,[t]:o});let n=r.filter(e=>{let{id:t,...i}=e;return Object.keys(i).length>0});this._updateConfig("y_axes",n.length>0?n:void 0)}_updateAggregation(e,t){let i={...this._config.aggregation};""===t?delete i[e]:i[e]=t;let s=this._cleanupAggregation(i);this._updateConfig("aggregation",s)}_updateAggregationNumber(e,t){let i={...this._config.aggregation},s=Number(t);Number.isFinite(s)?i[e]=s:delete i[e];let r=this._cleanupAggregation(i);this._updateConfig("aggregation",r)}_updateAggregationFlag(e,t){let i={...this._config.aggregation};t?i[e]=t:delete i[e];let s=this._cleanupAggregation(i);this._updateConfig("aggregation",s)}_updateAggregationPicker(e,t){let i={...this._config.aggregation,energy_picker:{...this._config.aggregation?.energy_picker??{}}};""===t?delete i.energy_picker?.[e]:i.energy_picker[e]=t;let s=this._cleanupAggregation(i);this._updateConfig("aggregation",s)}_cleanupAggregation(e){return e.energy_picker&&0===Object.keys(e.energy_picker).length&&delete e.energy_picker,e.raw_options&&0===Object.keys(e.raw_options).length&&delete e.raw_options,Object.keys(e).length?e:void 0}_toggleSeriesExpanded(e){let t=new Set(this._expandedSeries);if(t.has(e)){t.delete(e);let i=[];this._expandedTermKeys.forEach(t=>{t.startsWith(`${e}-`)||i.push(t)}),this._expandedTermKeys=new Set(i)}else t.add(e);this._expandedSeries=t}_toggleTermExpanded(e){let t=new Set(this._expandedTermKeys);t.has(e)?t.delete(e):t.add(e),this._expandedTermKeys=t}_syncExpandedState(e){let t=new Set;this._expandedSeries.forEach(i=>{i>=0&&i<e.length&&t.add(i)}),this._expandedSeries=t;let i=new Set;this._expandedTermKeys.forEach(t=>{let[s,r]=t.split("-"),a=Number(s),o=Number(r);if(Number.isNaN(a)||Number.isNaN(o)||a<0||a>=e.length)return;let n=e[a]?.calculation?.terms?.length??0;o>=0&&o<n&&i.add(t)}),this._expandedTermKeys=i}_formatOperation(e){switch(e){case"subtract":return"Subtract";case"multiply":return"Multiply";case"divide":return"Divide";default:return"Add"}}_updateConfig(e,t){if(!this._config)return;let i={...this._config,[e]:t};"aggregation"===e&&(void 0===t?delete i.aggregation:"object"==typeof t&&0===Object.keys(t).length&&delete i.aggregation),i.timespan?.mode!=="energy"&&(delete i.collection_key,delete i.allow_compare),i.series?.length||(i.series=[]),this._config=i,this._syncCustomColorDrafts(i.series??[]),this._syncColorSelections(i.series??[]),this._syncCompareCustomColorDrafts(i.series??[]),this._syncCompareColorSelections(i.series??[]),(0,u.fireEvent)(this,"config-changed",{config:i})}_syncCustomColorDrafts(e){let t=new Map;e.forEach((e,i)=>{if(!e)return;let s="string"==typeof e.color?e.color.trim():void 0,r=this._extractPresetToken(s),a=void 0!==r&&m.some(e=>e.value===r);if(s&&!a)return void t.set(i,s);if(!s&&this._customColorDrafts.has(i)){let e=this._customColorDrafts.get(i);void 0!==e&&t.set(i,e)}}),this._customColorDrafts=t}_syncColorSelections(e){let t=new Map;e.forEach((e,i)=>{let s="string"==typeof e.color?e.color.trim():void 0,r=this._extractPresetToken(s),a=s?r||v:f,o=this._colorModeSelections.get(i);return o===v?void t.set(i,v):o&&o===a?void t.set(i,o):void t.set(i,a)}),this._colorModeSelections=t}_syncCompareCustomColorDrafts(e){let t=new Map;e.forEach((e,i)=>{if(!e)return;let s="string"==typeof e.compare_color?e.compare_color.trim():void 0,r=this._extractPresetToken(s),a=void 0!==r&&m.some(e=>e.value===r);if(s&&!a)return void t.set(i,s);if(!s&&this._compareCustomColorDrafts.has(i)){let e=this._compareCustomColorDrafts.get(i);void 0!==e&&t.set(i,e)}}),this._compareCustomColorDrafts=t}_syncCompareColorSelections(e){let t=new Map;e.forEach((e,i)=>{let s="string"==typeof e.compare_color?e.compare_color.trim():void 0,r=this._extractPresetToken(s),a=s?r||v:y,o=this._compareColorModeSelections.get(i);return o===v?void t.set(i,v):o&&o===a?void t.set(i,o):void t.set(i,a)}),this._compareColorModeSelections=t}_updateBooleanConfig(e,t){this._updateConfig(e,t)}_updateNumericConfig(e,t){let i=""===t?void 0:Number(t);this._updateConfig(e,i)}_setTimespanMode(e){this._updateConfig("timespan","energy"===e?{mode:"energy"}:"relative"===e?{mode:"relative",period:"day",offset:0}:{mode:"fixed",start:void 0,end:void 0})}_updateTimespanRelativePeriod(e){let t=this._config?.timespan;t&&"relative"===t.mode&&this._updateConfig("timespan",{...t,period:e})}_updateTimespanRelativeOffset(e){let t=this._config?.timespan;t&&"relative"===t.mode&&this._updateConfig("timespan",{...t,offset:e})}_updateTimespanFixedStart(e){let t=this._config?.timespan;t&&"fixed"===t.mode&&this._updateConfig("timespan",{...t,start:e})}_updateTimespanFixedEnd(e){let t=this._config?.timespan;t&&"fixed"===t.mode&&this._updateConfig("timespan",{...t,end:e})}_toggleAggregationExpanded(){this._aggregationExpanded=!this._aggregationExpanded}_toggleAxesExpanded(){this._axesExpanded=!this._axesExpanded}_formatAxesSummary(e,t,i){let s=[];if(e){let t=[];if(e.unit&&t.push(e.unit),e.fit_y_data&&t.push("fit"),e.center_zero&&t.push("center zero"),e.logarithmic_scale&&t.push("log"),void 0!==e.min||void 0!==e.max){let i=`${e.min??"auto"}-${e.max??"auto"}`;t.push(i)}t.length&&s.push(`Left: ${t.join(", ")}`)}if(i&&t){let e=[];if(t.unit&&e.push(t.unit),t.fit_y_data&&e.push("fit"),t.center_zero&&e.push("center zero"),t.logarithmic_scale&&e.push("log"),void 0!==t.min||void 0!==t.max){let i=`${t.min??"auto"}-${t.max??"auto"}`;e.push(i)}e.length&&s.push(`Right: ${e.join(", ")}`)}return s.length?s.join(" • "):void 0}_formatAggregationSummary(e,t){if(!e||0===Object.keys(e).length)return;let i=[];return!t&&e.manual&&i.push(`Manual: ${this._formatStatisticsPeriod(e.manual)}`),!t&&e.fallback&&i.push(`Fallback: ${this._formatStatisticsPeriod(e.fallback)}`),t&&e.energy_picker&&Object.keys(e.energy_picker).length&&i.push("Picker overrides"),i.length?i.join(" • "):void 0}_formatStatisticsPeriod(e){return g.find(t=>t.value===e)?.label??e}_setActiveTab(e){this._activeTab!==e&&(this._activeTab=e)}_setColorSelection(e,t){let i=new Map(this._colorModeSelections);void 0===t?i.delete(e):i.set(e,t),this._colorModeSelections=i}_setCustomColorDraft(e,t){let i=new Map(this._customColorDrafts);if(void 0===t)i.delete(e);else{let s=t.trim();s?i.set(e,s):i.delete(e)}this._customColorDrafts=i}_setCompareColorSelection(e,t){let i=new Map(this._compareColorModeSelections);void 0===t?i.delete(e):i.set(e,t),this._compareColorModeSelections=i}_setCompareCustomColorDraft(e,t){let i=new Map(this._compareCustomColorDrafts);if(void 0===t)i.delete(e);else{let s=t.trim();s?i.set(e,s):i.delete(e)}this._compareCustomColorDrafts=i}_handleSeriesColorSelect(e,t){if(!this._config)return;let i=t.trim(),s=(this._config.series??[])[e],r="string"==typeof s?.color?s.color.trim():void 0;if(i===f){this._setColorSelection(e,f),this._setCustomColorDraft(e,void 0),this._updateSeries(e,"color",void 0);return}if(i===v){let t=this._customColorDrafts.get(e)??r??this._resolveAutoColorToken(e)??"";this._setCustomColorDraft(e,t),this._setColorSelection(e,v),r&&!this._extractPresetToken(r)&&this._updateSeries(e,"color",r);return}this._setColorSelection(e,i),this._setCustomColorDraft(e,void 0),this._updateSeries(e,"color",i)}_handleCustomColorInput(e,t){let i=t.trim();this._setColorSelection(e,v),i?(this._setCustomColorDraft(e,i),this._updateSeries(e,"color",i)):(this._setCustomColorDraft(e,void 0),this._updateSeries(e,"color",void 0))}_handleCompareColorSelect(e,t){if(!this._config)return;let i=t.trim(),s=(this._config.series??[])[e],r="string"==typeof s?.compare_color?s.compare_color.trim():void 0;if(i===y){this._setCompareColorSelection(e,y),this._setCompareCustomColorDraft(e,void 0),this._updateSeries(e,"compare_color",void 0);return}if(i===v){let t=this._compareCustomColorDrafts.get(e)??r??"";this._setCompareCustomColorDraft(e,t),this._setCompareColorSelection(e,v),r&&!this._extractPresetToken(r)&&this._updateSeries(e,"compare_color",r);return}this._setCompareColorSelection(e,i),this._setCompareCustomColorDraft(e,void 0),this._updateSeries(e,"compare_color",i)}_handleCompareCustomColorInput(e,t){let i=t.trim();this._setCompareColorSelection(e,v),i?(this._setCompareCustomColorDraft(e,i),this._updateSeries(e,"compare_color",i)):(this._setCompareCustomColorDraft(e,void 0),this._updateSeries(e,"compare_color",void 0))}_deriveCustomDraftForSeries(e){let t=this._config?.series?.[e];if(!t)return;let i="string"==typeof t.color?t.color.trim():void 0;return i||this._resolveAutoColorToken(e)}_resolveAutoColor(e){let t=this._resolveAutoColorToken(e);if(t)return this._normalizeColorToken(t)}_resolveAutoColorToken(e){let t=this._config?.color_cycle??[],i=t.length>0?t:p.DEFAULT_COLORS;if(0!==i.length)return i[e%i.length]}_extractPresetToken(e){if(!e)return;let t=e.trim();if(t){if(t.startsWith("var(")&&t.endsWith(")")){let e=t.slice(4,-1).trim(),i=e.indexOf(","),s=-1===i?e:e.slice(0,i).trim();return s.startsWith("--")?s:void 0}if(t.startsWith("--"))return t}}_normalizeColorToken(e){if(!e)return"";let t=e.trim();if(!t)return"";if(t.startsWith("var(")&&t.endsWith(")")){let e=t.slice(4,-1).trim(),i=e.indexOf(","),s=-1===i?e:e.slice(0,i).trim(),r=-1===i?void 0:e.slice(i+1).trim(),a=this._lookupCssVariable(s);return a||(r?this._normalizeColorToken(r):t)}return t.startsWith("--")?this._lookupCssVariable(t)??t:t}_lookupCssVariable(e){if(!e||!e.startsWith("--"))return;let t=[];try{this.isConnected&&t.push(getComputedStyle(this))}catch(e){}for(let i of(t.push(getComputedStyle(document.documentElement)),t)){let t=i.getPropertyValue(e)?.trim();if(t)return t}}_renderColorPreview(e,t){if(!e)return o.nothing;let i=this._normalizeColorToken(e);if(!i)return o.nothing;let s="line"===t||"step"===t;return(0,o.html)`
      <svg class="color-preview" width="16" height="16" viewBox="0 0 16 16">
        <circle
          cx="8"
          cy="8"
          r="7"
          fill="${i}"
          fill-opacity="${s?.15:.45}"
          stroke="${i}"
          stroke-opacity="${s?.85:.75}"
          stroke-width="1.5"
        />
      </svg>
    `}static{this.styles=(0,a.css)`
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

    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .radio-option {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .radio-option:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .radio-option input[type="radio"] {
      margin: 0;
      cursor: pointer;
    }

    .radio-option span {
      flex: 1;
    }
  `}constructor(...e){super(...e),this._activeTab="general",this._expandedSeries=new Set,this._expandedTermKeys=new Set,this._axesExpanded=!1,this._aggregationExpanded=!1,this._customColorDrafts=new Map,this._colorModeSelections=new Map,this._compareCustomColorDrafts=new Map,this._compareColorModeSelections=new Map}}(0,s.__decorate)([(0,d.property)({attribute:!1})],b.prototype,"hass",void 0),(0,s.__decorate)([(0,h.state)()],b.prototype,"_config",void 0),(0,s.__decorate)([(0,h.state)()],b.prototype,"_activeTab",void 0),(0,s.__decorate)([(0,h.state)()],b.prototype,"_expandedSeries",void 0),(0,s.__decorate)([(0,h.state)()],b.prototype,"_expandedTermKeys",void 0),(0,s.__decorate)([(0,h.state)()],b.prototype,"_axesExpanded",void 0),(0,s.__decorate)([(0,h.state)()],b.prototype,"_aggregationExpanded",void 0),(0,s.__decorate)([(0,h.state)()],b.prototype,"_customColorDrafts",void 0),(0,s.__decorate)([(0,h.state)()],b.prototype,"_colorModeSelections",void 0),(0,s.__decorate)([(0,h.state)()],b.prototype,"_compareCustomColorDrafts",void 0),(0,s.__decorate)([(0,h.state)()],b.prototype,"_compareColorModeSelections",void 0),b=(0,s.__decorate)([(0,l.customElement)("energy-custom-graph-card-editor")],b)}),a("hAmm6",function(t,i){function s(e,t,i,s){var r,a=arguments.length,o=a<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,i,s);else for(var n=e.length-1;n>=0;n--)(r=e[n])&&(o=(a<3?r(o):a>3?r(t,i,o):r(t,i))||o);return a>3&&o&&Object.defineProperty(t,i,o),o}e(t.exports,"__decorate",()=>s),"function"==typeof SuppressedError&&SuppressedError}),a("fUwgm",function(t,i){e(t.exports,"css",()=>r("bBTYI").css),e(t.exports,"html",()=>r("iKGUH").html),e(t.exports,"LitElement",()=>r("2cNIw").LitElement),e(t.exports,"nothing",()=>r("iKGUH").nothing),r("b2QMl"),r("3Gj0C"),r("2cNIw"),r("kLmv1")}),a("b2QMl",function(e,t){var i,s=r("87XX6");let a=window,o=a.trustedTypes,n=o?o.emptyScript:"",l=a.reactiveElementPolyfillSupport,d={toAttribute(e,t){switch(t){case Boolean:e=e?n:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},h=(e,t)=>t!==e&&(t==t||e==e),c={attribute:!0,type:String,converter:d,reflect:!1,hasChanged:h},u="finalized";class p extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu()}static addInitializer(e){var t;this.finalize(),(null!=(t=this.h)?t:this.h=[]).push(e)}static get observedAttributes(){this.finalize();let e=[];return this.elementProperties.forEach((t,i)=>{let s=this._$Ep(i,t);void 0!==s&&(this._$Ev.set(s,i),e.push(s))}),e}static createProperty(e,t=c){if(t.state&&(t.attribute=!1),this.finalize(),this.elementProperties.set(e,t),!t.noAccessor&&!this.prototype.hasOwnProperty(e)){let i="symbol"==typeof e?Symbol():"__"+e,s=this.getPropertyDescriptor(e,i,t);void 0!==s&&Object.defineProperty(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){return{get(){return this[t]},set(s){let r=this[e];this[t]=s,this.requestUpdate(e,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)||c}static finalize(){if(this.hasOwnProperty(u))return!1;this[u]=!0;let e=Object.getPrototypeOf(this);if(e.finalize(),void 0!==e.h&&(this.h=[...e.h]),this.elementProperties=new Map(e.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){let e=this.properties;for(let t of[...Object.getOwnPropertyNames(e),...Object.getOwnPropertySymbols(e)])this.createProperty(t,e[t])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(e){let t=[];if(Array.isArray(e))for(let i of new Set(e.flat(1/0).reverse()))t.unshift((0,s.getCompatibleStyle)(i));else void 0!==e&&t.push((0,s.getCompatibleStyle)(e));return t}static _$Ep(e,t){let i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}_$Eu(){var e;this._$E_=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null==(e=this.constructor.h)||e.forEach(e=>e(this))}addController(e){var t,i;(null!=(t=this._$ES)?t:this._$ES=[]).push(e),void 0!==this.renderRoot&&this.isConnected&&(null==(i=e.hostConnected)||i.call(e))}removeController(e){var t;null==(t=this._$ES)||t.splice(this._$ES.indexOf(e)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach((e,t)=>{this.hasOwnProperty(t)&&(this._$Ei.set(t,this[t]),delete this[t])})}createRenderRoot(){var e;let t=null!=(e=this.shadowRoot)?e:this.attachShadow(this.constructor.shadowRootOptions);return(0,s.adoptStyles)(t,this.constructor.elementStyles),t}connectedCallback(){var e;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null==(e=this._$ES)||e.forEach(e=>{var t;return null==(t=e.hostConnected)?void 0:t.call(e)})}enableUpdating(e){}disconnectedCallback(){var e;null==(e=this._$ES)||e.forEach(e=>{var t;return null==(t=e.hostDisconnected)?void 0:t.call(e)})}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$EO(e,t,i=c){var s;let r=this.constructor._$Ep(e,i);if(void 0!==r&&!0===i.reflect){let a=(void 0!==(null==(s=i.converter)?void 0:s.toAttribute)?i.converter:d).toAttribute(t,i.type);this._$El=e,null==a?this.removeAttribute(r):this.setAttribute(r,a),this._$El=null}}_$AK(e,t){var i;let s=this.constructor,r=s._$Ev.get(e);if(void 0!==r&&this._$El!==r){let e=s.getPropertyOptions(r),a="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==(null==(i=e.converter)?void 0:i.fromAttribute)?e.converter:d;this._$El=r,this[r]=a.fromAttribute(t,e.type),this._$El=null}}requestUpdate(e,t,i){let s=!0;void 0!==e&&(((i=i||this.constructor.getPropertyOptions(e)).hasChanged||h)(this[e],t)?(this._$AL.has(e)||this._$AL.set(e,t),!0===i.reflect&&this._$El!==e&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(e,i))):s=!1),!this.isUpdatePending&&s&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var e;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach((e,t)=>this[t]=e),this._$Ei=void 0);let t=!1,i=this._$AL;try{(t=this.shouldUpdate(i))?(this.willUpdate(i),null==(e=this._$ES)||e.forEach(e=>{var t;return null==(t=e.hostUpdate)?void 0:t.call(e)}),this.update(i)):this._$Ek()}catch(e){throw t=!1,this._$Ek(),e}t&&this._$AE(i)}willUpdate(e){}_$AE(e){var t;null==(t=this._$ES)||t.forEach(e=>{var t;return null==(t=e.hostUpdated)?void 0:t.call(e)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(e){return!0}update(e){void 0!==this._$EC&&(this._$EC.forEach((e,t)=>this._$EO(t,this[t],e)),this._$EC=void 0),this._$Ek()}updated(e){}firstUpdated(e){}}p[u]=!0,p.elementProperties=new Map,p.elementStyles=[],p.shadowRootOptions={mode:"open"},null==l||l({ReactiveElement:p}),(null!=(i=a.reactiveElementVersions)?i:a.reactiveElementVersions=[]).push("1.6.3")}),a("87XX6",function(t,i){e(t.exports,"adoptStyles",()=>l),e(t.exports,"getCompatibleStyle",()=>d);let s=window,r=s.ShadowRoot&&(void 0===s.ShadyCSS||s.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,a=Symbol(),o=new WeakMap;class n{constructor(e,t,i){if(this._$cssResult$=!0,i!==a)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(r&&void 0===e){let i=void 0!==t&&1===t.length;i&&(e=o.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&o.set(t,e))}return e}toString(){return this.cssText}}let l=(e,t)=>{r?e.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet):t.forEach(t=>{let i=document.createElement("style"),r=s.litNonce;void 0!==r&&i.setAttribute("nonce",r),i.textContent=t.cssText,e.appendChild(i)})},d=r?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t,i="";for(let t of e.cssRules)i+=t.cssText;return new n("string"==typeof(t=i)?t:t+"",void 0,a)})(e):e}),a("3Gj0C",function(t,i){var s;e(t.exports,"noChange",()=>w);let r=window,a=r.trustedTypes,o=a?a.createPolicy("lit-html",{createHTML:e=>e}):void 0,n="$lit$",l=`lit$${(Math.random()+"").slice(9)}$`,d="?"+l,h=`<${d}>`,c=document,u=()=>c.createComment(""),p=e=>null===e||"object"!=typeof e&&"function"!=typeof e,m=Array.isArray,_="[ 	\n\f\r]",g=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,f=/-->/g,v=/>/g,y=RegExp(`>|${_}(?:([^\\s"'>=/]+)(${_}*=${_}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),b=/'/g,$=/"/g,S=/^(?:script|style|textarea|title)$/i,x=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),w=(x(1),x(2),Symbol.for("lit-noChange")),C=Symbol.for("lit-nothing"),A=new WeakMap,T=c.createTreeWalker(c,129,null,!1);function E(e,t){if(!Array.isArray(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==o?o.createHTML(t):t}class k{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let r=0,o=0,c=e.length-1,p=this.parts,[m,_]=((e,t)=>{let i=e.length-1,s=[],r,a=2===t?"<svg>":"",o=g;for(let t=0;t<i;t++){let i=e[t],d,c,u=-1,p=0;for(;p<i.length&&(o.lastIndex=p,null!==(c=o.exec(i)));)p=o.lastIndex,o===g?"!--"===c[1]?o=f:void 0!==c[1]?o=v:void 0!==c[2]?(S.test(c[2])&&(r=RegExp("</"+c[2],"g")),o=y):void 0!==c[3]&&(o=y):o===y?">"===c[0]?(o=null!=r?r:g,u=-1):void 0===c[1]?u=-2:(u=o.lastIndex-c[2].length,d=c[1],o=void 0===c[3]?y:'"'===c[3]?$:b):o===$||o===b?o=y:o===f||o===v?o=g:(o=y,r=void 0);let m=o===y&&e[t+1].startsWith("/>")?" ":"";a+=o===g?i+h:u>=0?(s.push(d),i.slice(0,u)+n+i.slice(u)+l+m):i+l+(-2===u?(s.push(void 0),t):m)}return[E(e,a+(e[i]||"<?>")+(2===t?"</svg>":"")),s]})(e,t);if(this.el=k.createElement(m,i),T.currentNode=this.el.content,2===t){let e=this.el.content,t=e.firstChild;t.remove(),e.append(...t.childNodes)}for(;null!==(s=T.nextNode())&&p.length<c;){if(1===s.nodeType){if(s.hasAttributes()){let e=[];for(let t of s.getAttributeNames())if(t.endsWith(n)||t.startsWith(l)){let i=_[o++];if(e.push(t),void 0!==i){let e=s.getAttribute(i.toLowerCase()+n).split(l),t=/([.?@])?(.*)/.exec(i);p.push({type:1,index:r,name:t[2],strings:e,ctor:"."===t[1]?R:"?"===t[1]?L:"@"===t[1]?U:D})}else p.push({type:6,index:r})}for(let t of e)s.removeAttribute(t)}if(S.test(s.tagName)){let e=s.textContent.split(l),t=e.length-1;if(t>0){s.textContent=a?a.emptyScript:"";for(let i=0;i<t;i++)s.append(e[i],u()),T.nextNode(),p.push({type:2,index:++r});s.append(e[t],u())}}}else if(8===s.nodeType)if(s.data===d)p.push({type:2,index:r});else{let e=-1;for(;-1!==(e=s.data.indexOf(l,e+1));)p.push({type:7,index:r}),e+=l.length-1}r++}}static createElement(e,t){let i=c.createElement("template");return i.innerHTML=e,i}}function M(e,t,i=e,s){var r,a,o;if(t===w)return t;let n=void 0!==s?null==(r=i._$Co)?void 0:r[s]:i._$Cl,l=p(t)?void 0:t._$litDirective$;return(null==n?void 0:n.constructor)!==l&&(null==(a=null==n?void 0:n._$AO)||a.call(n,!1),void 0===l?n=void 0:(n=new l(e))._$AT(e,i,s),void 0!==s?(null!=(o=i._$Co)?o:i._$Co=[])[s]=n:i._$Cl=n),void 0!==n&&(t=M(e,n._$AS(e,t.values),n,s)),t}class N{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){var t;let{el:{content:i},parts:s}=this._$AD,r=(null!=(t=null==e?void 0:e.creationScope)?t:c).importNode(i,!0);T.currentNode=r;let a=T.nextNode(),o=0,n=0,l=s[0];for(;void 0!==l;){if(o===l.index){let t;2===l.type?t=new P(a,a.nextSibling,this,e):1===l.type?t=new l.ctor(a,l.name,l.strings,this,e):6===l.type&&(t=new O(a,this,e)),this._$AV.push(t),l=s[++n]}o!==(null==l?void 0:l.index)&&(a=T.nextNode(),o++)}return T.currentNode=c,r}v(e){let t=0;for(let i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class P{constructor(e,t,i,s){var r;this.type=2,this._$AH=C,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cp=null==(r=null==s?void 0:s.isConnected)||r}get _$AU(){var e,t;return null!=(t=null==(e=this._$AM)?void 0:e._$AU)?t:this._$Cp}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return void 0!==t&&11===(null==e?void 0:e.nodeType)&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){let i;p(e=M(this,e,t))?e===C||null==e||""===e?(this._$AH!==C&&this._$AR(),this._$AH=C):e!==this._$AH&&e!==w&&this._(e):void 0!==e._$litType$?this.g(e):void 0!==e.nodeType?this.$(e):m(i=e)||"function"==typeof(null==i?void 0:i[Symbol.iterator])?this.T(e):this._(e)}k(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}$(e){this._$AH!==e&&(this._$AR(),this._$AH=this.k(e))}_(e){this._$AH!==C&&p(this._$AH)?this._$AA.nextSibling.data=e:this.$(c.createTextNode(e)),this._$AH=e}g(e){var t;let{values:i,_$litType$:s}=e,r="number"==typeof s?this._$AC(e):(void 0===s.el&&(s.el=k.createElement(E(s.h,s.h[0]),this.options)),s);if((null==(t=this._$AH)?void 0:t._$AD)===r)this._$AH.v(i);else{let e=new N(r,this),t=e.u(this.options);e.v(i),this.$(t),this._$AH=e}}_$AC(e){let t=A.get(e.strings);return void 0===t&&A.set(e.strings,t=new k(e)),t}T(e){m(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,i,s=0;for(let r of e)s===t.length?t.push(i=new P(this.k(u()),this.k(u()),this,this.options)):i=t[s],i._$AI(r),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){var i;for(null==(i=this._$AP)||i.call(this,!1,!0,t);e&&e!==this._$AB;){let t=e.nextSibling;e.remove(),e=t}}setConnected(e){var t;void 0===this._$AM&&(this._$Cp=e,null==(t=this._$AP)||t.call(this,e))}}class D{constructor(e,t,i,s,r){this.type=1,this._$AH=C,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=C}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(e,t=this,i,s){let r=this.strings,a=!1;if(void 0===r)(a=!p(e=M(this,e,t,0))||e!==this._$AH&&e!==w)&&(this._$AH=e);else{let s,o,n=e;for(e=r[0],s=0;s<r.length-1;s++)(o=M(this,n[i+s],t,s))===w&&(o=this._$AH[s]),a||(a=!p(o)||o!==this._$AH[s]),o===C?e=C:e!==C&&(e+=(null!=o?o:"")+r[s+1]),this._$AH[s]=o}a&&!s&&this.j(e)}j(e){e===C?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=e?e:"")}}class R extends D{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===C?void 0:e}}let H=a?a.emptyScript:"";class L extends D{constructor(){super(...arguments),this.type=4}j(e){e&&e!==C?this.element.setAttribute(this.name,H):this.element.removeAttribute(this.name)}}class U extends D{constructor(e,t,i,s,r){super(e,t,i,s,r),this.type=5}_$AI(e,t=this){var i;if((e=null!=(i=M(this,e,t,0))?i:C)===w)return;let s=this._$AH,r=e===C&&s!==C||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,a=e!==C&&(s===C||r);r&&this.element.removeEventListener(this.name,this,s),a&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t,i;"function"==typeof this._$AH?this._$AH.call(null!=(i=null==(t=this.options)?void 0:t.host)?i:this.element,e):this._$AH.handleEvent(e)}}class O{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){M(this,e)}}let F=r.litHtmlPolyfillSupport;null==F||F(k,P),(null!=(s=r.litHtmlVersions)?s:r.litHtmlVersions=[]).push("2.8.0")}),a("2cNIw",function(t,i){e(t.exports,"css",()=>r("bBTYI").css),e(t.exports,"ReactiveElement",()=>r("c8jHW").ReactiveElement),e(t.exports,"html",()=>r("iKGUH").html),e(t.exports,"noChange",()=>r("iKGUH").noChange),e(t.exports,"nothing",()=>r("iKGUH").nothing),e(t.exports,"render",()=>r("iKGUH").render),e(t.exports,"LitElement",()=>l);var s,a,o=r("c8jHW"),n=r("iKGUH");o.ReactiveElement;class l extends o.ReactiveElement{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e;let t=super.createRenderRoot();return null!=(e=this.renderOptions).renderBefore||(e.renderBefore=t.firstChild),t}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=(0,n.render)(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),null==(e=this._$Do)||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),null==(e=this._$Do)||e.setConnected(!1)}render(){return n.noChange}}l.finalized=!0,l._$litElement$=!0,null==(s=globalThis.litElementHydrateSupport)||s.call(globalThis,{LitElement:l});let d=globalThis.litElementPolyfillSupport;null==d||d({LitElement:l}),(null!=(a=globalThis.litElementVersions)?a:globalThis.litElementVersions=[]).push("3.3.3")}),a("c8jHW",function(t,i){e(t.exports,"ReactiveElement",()=>m),e(t.exports,"css",()=>r("bBTYI").css);var s,a=r("bBTYI");let o=window,n=o.trustedTypes,l=n?n.emptyScript:"",d=o.reactiveElementPolyfillSupport,h={toAttribute(e,t){switch(t){case Boolean:e=e?l:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},c=(e,t)=>t!==e&&(t==t||e==e),u={attribute:!0,type:String,converter:h,reflect:!1,hasChanged:c},p="finalized";class m extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu()}static addInitializer(e){var t;this.finalize(),(null!=(t=this.h)?t:this.h=[]).push(e)}static get observedAttributes(){this.finalize();let e=[];return this.elementProperties.forEach((t,i)=>{let s=this._$Ep(i,t);void 0!==s&&(this._$Ev.set(s,i),e.push(s))}),e}static createProperty(e,t=u){if(t.state&&(t.attribute=!1),this.finalize(),this.elementProperties.set(e,t),!t.noAccessor&&!this.prototype.hasOwnProperty(e)){let i="symbol"==typeof e?Symbol():"__"+e,s=this.getPropertyDescriptor(e,i,t);void 0!==s&&Object.defineProperty(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){return{get(){return this[t]},set(s){let r=this[e];this[t]=s,this.requestUpdate(e,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)||u}static finalize(){if(this.hasOwnProperty(p))return!1;this[p]=!0;let e=Object.getPrototypeOf(this);if(e.finalize(),void 0!==e.h&&(this.h=[...e.h]),this.elementProperties=new Map(e.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){let e=this.properties;for(let t of[...Object.getOwnPropertyNames(e),...Object.getOwnPropertySymbols(e)])this.createProperty(t,e[t])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(e){let t=[];if(Array.isArray(e))for(let i of new Set(e.flat(1/0).reverse()))t.unshift((0,a.getCompatibleStyle)(i));else void 0!==e&&t.push((0,a.getCompatibleStyle)(e));return t}static _$Ep(e,t){let i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}_$Eu(){var e;this._$E_=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null==(e=this.constructor.h)||e.forEach(e=>e(this))}addController(e){var t,i;(null!=(t=this._$ES)?t:this._$ES=[]).push(e),void 0!==this.renderRoot&&this.isConnected&&(null==(i=e.hostConnected)||i.call(e))}removeController(e){var t;null==(t=this._$ES)||t.splice(this._$ES.indexOf(e)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach((e,t)=>{this.hasOwnProperty(t)&&(this._$Ei.set(t,this[t]),delete this[t])})}createRenderRoot(){var e;let t=null!=(e=this.shadowRoot)?e:this.attachShadow(this.constructor.shadowRootOptions);return(0,a.adoptStyles)(t,this.constructor.elementStyles),t}connectedCallback(){var e;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null==(e=this._$ES)||e.forEach(e=>{var t;return null==(t=e.hostConnected)?void 0:t.call(e)})}enableUpdating(e){}disconnectedCallback(){var e;null==(e=this._$ES)||e.forEach(e=>{var t;return null==(t=e.hostDisconnected)?void 0:t.call(e)})}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$EO(e,t,i=u){var s;let r=this.constructor._$Ep(e,i);if(void 0!==r&&!0===i.reflect){let a=(void 0!==(null==(s=i.converter)?void 0:s.toAttribute)?i.converter:h).toAttribute(t,i.type);this._$El=e,null==a?this.removeAttribute(r):this.setAttribute(r,a),this._$El=null}}_$AK(e,t){var i;let s=this.constructor,r=s._$Ev.get(e);if(void 0!==r&&this._$El!==r){let e=s.getPropertyOptions(r),a="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==(null==(i=e.converter)?void 0:i.fromAttribute)?e.converter:h;this._$El=r,this[r]=a.fromAttribute(t,e.type),this._$El=null}}requestUpdate(e,t,i){let s=!0;void 0!==e&&(((i=i||this.constructor.getPropertyOptions(e)).hasChanged||c)(this[e],t)?(this._$AL.has(e)||this._$AL.set(e,t),!0===i.reflect&&this._$El!==e&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(e,i))):s=!1),!this.isUpdatePending&&s&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var e;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach((e,t)=>this[t]=e),this._$Ei=void 0);let t=!1,i=this._$AL;try{(t=this.shouldUpdate(i))?(this.willUpdate(i),null==(e=this._$ES)||e.forEach(e=>{var t;return null==(t=e.hostUpdate)?void 0:t.call(e)}),this.update(i)):this._$Ek()}catch(e){throw t=!1,this._$Ek(),e}t&&this._$AE(i)}willUpdate(e){}_$AE(e){var t;null==(t=this._$ES)||t.forEach(e=>{var t;return null==(t=e.hostUpdated)?void 0:t.call(e)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(e){return!0}update(e){void 0!==this._$EC&&(this._$EC.forEach((e,t)=>this._$EO(t,this[t],e)),this._$EC=void 0),this._$Ek()}updated(e){}firstUpdated(e){}}m[p]=!0,m.elementProperties=new Map,m.elementStyles=[],m.shadowRootOptions={mode:"open"},null==d||d({ReactiveElement:m}),(null!=(s=o.reactiveElementVersions)?s:o.reactiveElementVersions=[]).push("1.6.3")}),a("bBTYI",function(t,i){e(t.exports,"css",()=>l),e(t.exports,"adoptStyles",()=>d),e(t.exports,"getCompatibleStyle",()=>h);let s=window,r=s.ShadowRoot&&(void 0===s.ShadyCSS||s.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,a=Symbol(),o=new WeakMap;class n{constructor(e,t,i){if(this._$cssResult$=!0,i!==a)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(r&&void 0===e){let i=void 0!==t&&1===t.length;i&&(e=o.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&o.set(t,e))}return e}toString(){return this.cssText}}let l=(e,...t)=>new n(1===e.length?e[0]:t.reduce((t,i,s)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[s+1],e[0]),e,a),d=(e,t)=>{r?e.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet):t.forEach(t=>{let i=document.createElement("style"),r=s.litNonce;void 0!==r&&i.setAttribute("nonce",r),i.textContent=t.cssText,e.appendChild(i)})},h=r?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t,i="";for(let t of e.cssRules)i+=t.cssText;return new n("string"==typeof(t=i)?t:t+"",void 0,a)})(e):e}),a("iKGUH",function(t,i){var s;e(t.exports,"html",()=>w),e(t.exports,"noChange",()=>C),e(t.exports,"nothing",()=>A),e(t.exports,"render",()=>z);let r=window,a=r.trustedTypes,o=a?a.createPolicy("lit-html",{createHTML:e=>e}):void 0,n="$lit$",l=`lit$${(Math.random()+"").slice(9)}$`,d="?"+l,h=`<${d}>`,c=document,u=()=>c.createComment(""),p=e=>null===e||"object"!=typeof e&&"function"!=typeof e,m=Array.isArray,_="[ 	\n\f\r]",g=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,f=/-->/g,v=/>/g,y=RegExp(`>|${_}(?:([^\\s"'>=/]+)(${_}*=${_}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),b=/'/g,$=/"/g,S=/^(?:script|style|textarea|title)$/i,x=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),w=x(1),C=(x(2),Symbol.for("lit-noChange")),A=Symbol.for("lit-nothing"),T=new WeakMap,E=c.createTreeWalker(c,129,null,!1);function k(e,t){if(!Array.isArray(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==o?o.createHTML(t):t}class M{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let r=0,o=0,c=e.length-1,p=this.parts,[m,_]=((e,t)=>{let i=e.length-1,s=[],r,a=2===t?"<svg>":"",o=g;for(let t=0;t<i;t++){let i=e[t],d,c,u=-1,p=0;for(;p<i.length&&(o.lastIndex=p,null!==(c=o.exec(i)));)p=o.lastIndex,o===g?"!--"===c[1]?o=f:void 0!==c[1]?o=v:void 0!==c[2]?(S.test(c[2])&&(r=RegExp("</"+c[2],"g")),o=y):void 0!==c[3]&&(o=y):o===y?">"===c[0]?(o=null!=r?r:g,u=-1):void 0===c[1]?u=-2:(u=o.lastIndex-c[2].length,d=c[1],o=void 0===c[3]?y:'"'===c[3]?$:b):o===$||o===b?o=y:o===f||o===v?o=g:(o=y,r=void 0);let m=o===y&&e[t+1].startsWith("/>")?" ":"";a+=o===g?i+h:u>=0?(s.push(d),i.slice(0,u)+n+i.slice(u)+l+m):i+l+(-2===u?(s.push(void 0),t):m)}return[k(e,a+(e[i]||"<?>")+(2===t?"</svg>":"")),s]})(e,t);if(this.el=M.createElement(m,i),E.currentNode=this.el.content,2===t){let e=this.el.content,t=e.firstChild;t.remove(),e.append(...t.childNodes)}for(;null!==(s=E.nextNode())&&p.length<c;){if(1===s.nodeType){if(s.hasAttributes()){let e=[];for(let t of s.getAttributeNames())if(t.endsWith(n)||t.startsWith(l)){let i=_[o++];if(e.push(t),void 0!==i){let e=s.getAttribute(i.toLowerCase()+n).split(l),t=/([.?@])?(.*)/.exec(i);p.push({type:1,index:r,name:t[2],strings:e,ctor:"."===t[1]?H:"?"===t[1]?U:"@"===t[1]?O:R})}else p.push({type:6,index:r})}for(let t of e)s.removeAttribute(t)}if(S.test(s.tagName)){let e=s.textContent.split(l),t=e.length-1;if(t>0){s.textContent=a?a.emptyScript:"";for(let i=0;i<t;i++)s.append(e[i],u()),E.nextNode(),p.push({type:2,index:++r});s.append(e[t],u())}}}else if(8===s.nodeType)if(s.data===d)p.push({type:2,index:r});else{let e=-1;for(;-1!==(e=s.data.indexOf(l,e+1));)p.push({type:7,index:r}),e+=l.length-1}r++}}static createElement(e,t){let i=c.createElement("template");return i.innerHTML=e,i}}function N(e,t,i=e,s){var r,a,o;if(t===C)return t;let n=void 0!==s?null==(r=i._$Co)?void 0:r[s]:i._$Cl,l=p(t)?void 0:t._$litDirective$;return(null==n?void 0:n.constructor)!==l&&(null==(a=null==n?void 0:n._$AO)||a.call(n,!1),void 0===l?n=void 0:(n=new l(e))._$AT(e,i,s),void 0!==s?(null!=(o=i._$Co)?o:i._$Co=[])[s]=n:i._$Cl=n),void 0!==n&&(t=N(e,n._$AS(e,t.values),n,s)),t}class P{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){var t;let{el:{content:i},parts:s}=this._$AD,r=(null!=(t=null==e?void 0:e.creationScope)?t:c).importNode(i,!0);E.currentNode=r;let a=E.nextNode(),o=0,n=0,l=s[0];for(;void 0!==l;){if(o===l.index){let t;2===l.type?t=new D(a,a.nextSibling,this,e):1===l.type?t=new l.ctor(a,l.name,l.strings,this,e):6===l.type&&(t=new F(a,this,e)),this._$AV.push(t),l=s[++n]}o!==(null==l?void 0:l.index)&&(a=E.nextNode(),o++)}return E.currentNode=c,r}v(e){let t=0;for(let i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class D{constructor(e,t,i,s){var r;this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cp=null==(r=null==s?void 0:s.isConnected)||r}get _$AU(){var e,t;return null!=(t=null==(e=this._$AM)?void 0:e._$AU)?t:this._$Cp}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return void 0!==t&&11===(null==e?void 0:e.nodeType)&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){let i;p(e=N(this,e,t))?e===A||null==e||""===e?(this._$AH!==A&&this._$AR(),this._$AH=A):e!==this._$AH&&e!==C&&this._(e):void 0!==e._$litType$?this.g(e):void 0!==e.nodeType?this.$(e):m(i=e)||"function"==typeof(null==i?void 0:i[Symbol.iterator])?this.T(e):this._(e)}k(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}$(e){this._$AH!==e&&(this._$AR(),this._$AH=this.k(e))}_(e){this._$AH!==A&&p(this._$AH)?this._$AA.nextSibling.data=e:this.$(c.createTextNode(e)),this._$AH=e}g(e){var t;let{values:i,_$litType$:s}=e,r="number"==typeof s?this._$AC(e):(void 0===s.el&&(s.el=M.createElement(k(s.h,s.h[0]),this.options)),s);if((null==(t=this._$AH)?void 0:t._$AD)===r)this._$AH.v(i);else{let e=new P(r,this),t=e.u(this.options);e.v(i),this.$(t),this._$AH=e}}_$AC(e){let t=T.get(e.strings);return void 0===t&&T.set(e.strings,t=new M(e)),t}T(e){m(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,i,s=0;for(let r of e)s===t.length?t.push(i=new D(this.k(u()),this.k(u()),this,this.options)):i=t[s],i._$AI(r),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){var i;for(null==(i=this._$AP)||i.call(this,!1,!0,t);e&&e!==this._$AB;){let t=e.nextSibling;e.remove(),e=t}}setConnected(e){var t;void 0===this._$AM&&(this._$Cp=e,null==(t=this._$AP)||t.call(this,e))}}class R{constructor(e,t,i,s,r){this.type=1,this._$AH=A,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=A}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(e,t=this,i,s){let r=this.strings,a=!1;if(void 0===r)(a=!p(e=N(this,e,t,0))||e!==this._$AH&&e!==C)&&(this._$AH=e);else{let s,o,n=e;for(e=r[0],s=0;s<r.length-1;s++)(o=N(this,n[i+s],t,s))===C&&(o=this._$AH[s]),a||(a=!p(o)||o!==this._$AH[s]),o===A?e=A:e!==A&&(e+=(null!=o?o:"")+r[s+1]),this._$AH[s]=o}a&&!s&&this.j(e)}j(e){e===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=e?e:"")}}class H extends R{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===A?void 0:e}}let L=a?a.emptyScript:"";class U extends R{constructor(){super(...arguments),this.type=4}j(e){e&&e!==A?this.element.setAttribute(this.name,L):this.element.removeAttribute(this.name)}}class O extends R{constructor(e,t,i,s,r){super(e,t,i,s,r),this.type=5}_$AI(e,t=this){var i;if((e=null!=(i=N(this,e,t,0))?i:A)===C)return;let s=this._$AH,r=e===A&&s!==A||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,a=e!==A&&(s===A||r);r&&this.element.removeEventListener(this.name,this,s),a&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t,i;"function"==typeof this._$AH?this._$AH.call(null!=(i=null==(t=this.options)?void 0:t.host)?i:this.element,e):this._$AH.handleEvent(e)}}class F{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){N(this,e)}}let I=r.litHtmlPolyfillSupport;null==I||I(M,D),(null!=(s=r.litHtmlVersions)?s:r.litHtmlVersions=[]).push("2.8.0");let z=(e,t,i)=>{var s,r;let a=null!=(s=null==i?void 0:i.renderBefore)?s:t,o=a._$litPart$;if(void 0===o){let e=null!=(r=null==i?void 0:i.renderBefore)?r:null;a._$litPart$=o=new D(t.insertBefore(u(),e),e,void 0,null!=i?i:{})}return o._$AI(e),o}}),a("kLmv1",function(e,t){}),a("UE69e",function(t,i){e(t.exports,"customElement",()=>r("esbW4").customElement),e(t.exports,"property",()=>r("9z3oa").property),e(t.exports,"state",()=>r("ddM75").state),r("esbW4"),r("9z3oa"),r("ddM75"),r("cloJV"),r("6Wapz"),r("bNDge"),r("gW6Du"),r("ikMfK"),r("jt9Su")}),a("esbW4",function(t,i){e(t.exports,"customElement",()=>s);let s=e=>t=>"function"==typeof t?(customElements.define(e,t),t):((e,t)=>{let{kind:i,elements:s}=t;return{kind:i,elements:s,finisher(t){customElements.define(e,t)}}})(e,t)}),a("9z3oa",function(t,i){e(t.exports,"property",()=>s);function s(e){return(t,i)=>void 0!==i?void t.constructor.createProperty(i,e):"method"!==t.kind||!t.descriptor||"value"in t.descriptor?{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:t.key,initializer(){"function"==typeof t.initializer&&(this[t.key]=t.initializer.call(this))},finisher(i){i.createProperty(t.key,e)}}:{...t,finisher(i){i.createProperty(t.key,e)}}}}),a("ddM75",function(t,i){e(t.exports,"state",()=>a);var s=r("9z3oa");function a(e){return(0,s.property)({...e,state:!0})}}),a("cloJV",function(e,t){r("ea0YP")}),a("ea0YP",function(t,i){e(t.exports,"decorateProperty",()=>s);let s=({finisher:e,descriptor:t})=>(i,s)=>{var r;if(void 0===s){let s=null!=(r=i.originalKey)?r:i.key,a=null!=t?{kind:"method",placement:"prototype",key:s,descriptor:t(i.key)}:{...i,key:s};return null!=e&&(a.finisher=function(t){e(t,s)}),a}{let r=i.constructor;void 0!==t&&Object.defineProperty(i,s,t(s)),null==e||e(r,s)}}}),a("6Wapz",function(e,t){r("ea0YP")}),a("bNDge",function(e,t){r("ea0YP")}),a("gW6Du",function(e,t){r("ea0YP")}),a("ikMfK",function(t,i){e(t.exports,"queryAssignedElements",()=>n);var s,a=r("ea0YP");let o=null!=(null==(s=window.HTMLSlotElement)?void 0:s.prototype.assignedElements)?(e,t)=>e.assignedElements(t):(e,t)=>e.assignedNodes(t).filter(e=>e.nodeType===Node.ELEMENT_NODE);function n(e){let{slot:t,selector:i}=null!=e?e:{};return(0,a.decorateProperty)({descriptor:s=>({get(){var s;let r="slot"+(t?`[name=${t}]`:":not([name])"),a=null==(s=this.renderRoot)?void 0:s.querySelector(r),n=null!=a?o(a,e):[];return i?n.filter(e=>e.matches(i)):n},enumerable:!0,configurable:!0})})}}),a("jt9Su",function(e,t){r("ea0YP"),r("ikMfK")}),a("chq2z",function(t,i){e(t.exports,"classMap",()=>r("fxePf").classMap),r("fxePf")}),a("fxePf",function(t,i){e(t.exports,"classMap",()=>o);var s=r("3Gj0C"),a=r("dHTMW");let o=(0,a.directive)(class extends a.Directive{constructor(e){var t;if(super(e),e.type!==a.PartType.ATTRIBUTE||"class"!==e.name||(null==(t=e.strings)?void 0:t.length)>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter(t=>e[t]).join(" ")+" "}update(e,[t]){var i,r;if(void 0===this.it){for(let s in this.it=new Set,void 0!==e.strings&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter(e=>""!==e))),t)!t[s]||(null==(i=this.nt)?void 0:i.has(s))||this.it.add(s);return this.render(t)}let a=e.element.classList;for(let e in this.it.forEach(e=>{e in t||(a.remove(e),this.it.delete(e))}),t){let i=!!t[e];i===this.it.has(e)||(null==(r=this.nt)?void 0:r.has(e))||(i?(a.add(e),this.it.add(e)):(a.remove(e),this.it.delete(e)))}return s.noChange}})}),a("dHTMW",function(t,i){e(t.exports,"PartType",()=>s),e(t.exports,"directive",()=>r),e(t.exports,"Directive",()=>a);let s={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},r=e=>(...t)=>({_$litDirective$:e,values:t});class a{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}}),a("e973t",function(t,i){e(t.exports,"fireEvent",()=>l),r("4DhYy"),(s=o||(o={})).language="language",s.system="system",s.comma_decimal="comma_decimal",s.decimal_comma="decimal_comma",s.space_comma="space_comma",s.none="none",(a=n||(n={})).language="language",a.system="system",a.am_pm="12",a.twenty_four="24";var s,a,o,n,l=function(e,t,i,s){s=s||{},i=null==i?{}:i;var r=new Event(t,{bubbles:void 0===s.bubbles||s.bubbles,cancelable:!!s.cancelable,composed:void 0===s.composed||s.composed});return r.detail=i,e.dispatchEvent(r),r}}),a("4DhYy",function(t,i){e(t.exports,"selectUnit",()=>r);var s=function(){return(s=Object.assign||function(e){for(var t,i=1,s=arguments.length;i<s;i++)for(var r in t=arguments[i])Object.prototype.hasOwnProperty.call(t,r)&&(e[r]=t[r]);return e}).apply(this,arguments)};function r(e,t,i){void 0===t&&(t=Date.now()),void 0===i&&(i={});var r=s(s({},a),i||{}),o=(e-t)/1e3;if(Math.abs(o)<r.second)return{value:Math.round(o),unit:"second"};var n=o/60;if(Math.abs(n)<r.minute)return{value:Math.round(n),unit:"minute"};var l=o/3600;if(Math.abs(l)<r.hour)return{value:Math.round(l),unit:"hour"};var d=o/86400;if(Math.abs(d)<r.day)return{value:Math.round(d),unit:"day"};var h=new Date(e),c=new Date(t),u=h.getFullYear()-c.getFullYear();if(Math.round(Math.abs(u))>0)return{value:Math.round(u),unit:"year"};var p=12*u+h.getMonth()-c.getMonth();return Math.round(Math.abs(p))>0?{value:Math.round(p),unit:"month"}:{value:Math.round(o/604800),unit:"week"}}var a={second:45,minute:45,hour:22,day:5}}),a("glq8a",function(t,i){e(t.exports,"DEFAULT_COLORS",()=>s),e(t.exports,"BAR_MAX_WIDTH",()=>r),e(t.exports,"buildSeries",()=>n);let s=["--energy-grid-consumption-color","--energy-grid-return-color","--energy-solar-color","--energy-battery-in-color","--energy-battery-out-color","--energy-gas-color","--energy-water-color","--energy-non-fossil-color"],r=50,a=e=>Math.max(0,Math.min(1,Number.isFinite(e)?e:1)),o=(e,t)=>{let i=e.trim(),s=a(t);if(i.startsWith("#")){let e=(e=>{let t=e.replace("#","").trim();if(3===t.length||4===t.length){let e=parseInt(t[0]+t[0],16);return{r:e,g:parseInt(t[1]+t[1],16),b:parseInt(t[2]+t[2],16)}}if(6===t.length||8===t.length){let e=parseInt(t.substring(0,2),16);return{r:e,g:parseInt(t.substring(2,4),16),b:parseInt(t.substring(4,6),16)}}return null})(i);if(e)return`rgba(${e.r}, ${e.g}, ${e.b}, ${s})`}else if(i.startsWith("rgb")){let e=(e=>{let t=e.trim().match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*[\d.]+\s*)?\)/i);return t?{r:Number(t[1]),g:Number(t[2]),b:Number(t[3])}:null})(i);if(e)return`rgba(${e.r}, ${e.g}, ${e.b}, ${s})`}return i},n=({hass:e,statistics:t,metadata:i,configSeries:n,colorPalette:l,computedStyle:d,calculatedData:h,calculatedUnits:c})=>{let u=l.length?l:s,p=[],m=new Map,_=new Map,g=[],f=new Map,v=[],y=new Set,b=(e,t)=>{y.has(e)||(y.add(e),console.warn(`[energy-custom-graph] ${t}`))};return n.forEach((n,l)=>{let y,$,S,x,w=n.statistic_id?.trim(),C=n.calculation?`calculation_${l}`:void 0;if(C){if(y=h?.get(C),$=c?.get(C),!y?.length)return void b(`calculation-empty-${l}`,`Calculation for series "${n.name??C}" produced no data.`)}else if(!w)return void b(`series-misconfigured-${l}`,`Series at index ${l} is missing both statistic_id and calculation.`);else if(y=t?.[w],!y?.length)return void b(`statistics-empty-${w}`,`No statistics available for "${w}".`);let A=w?i?.[w]:void 0,T=n.stat_type??"change",E=n.chart_type??"bar",k="line"===E,M="step"===E,N=k||M,P=n.multiply??1,D=n.add??0,R="number"==typeof n.smooth?Math.max(0,Math.min(1,n.smooth)):n.smooth,H=!0===n.fill,L=n.name??A?.name??(w?e.states[w]?.attributes.friendly_name??w:`Series ${l+1}`),U=n.color??u[l%u.length]??s[l%s.length],O=U;if(U.startsWith("#")||U.startsWith("rgb"))O=U;else if(U.startsWith("var(")){let e=U.slice(4,-1).trim(),t=d.getPropertyValue(e)?.trim();t&&(O=t)}else{let e=d.getPropertyValue(U)?.trim();e&&(O=e)}O=O.trim();let F="number"==typeof n.line_opacity?a(n.line_opacity):void 0,I=void 0!==F?F:.85,z=o(O,I),j=o(O,Math.min(1,I+.15));j===O&&(j=z);let B=w??C??`series_${l}`,W=`${B}:${T}:${E}:${l}`;m.set(W,$??A?.statistics_unit_of_measurement),_.set(W,n);let V=y.map(e=>{var t,i,s;let r,a=e[T],o=e.start??e.end;return"number"!=typeof a||Number.isNaN(a)?[o,null]:[o,(t=a*P+D,i=n.clip_min,s=n.clip_max,r=t,void 0!==i&&(r=Math.max(r,i)),void 0!==s&&(r=Math.min(r,s)),r)]});if(N){let e="number"==typeof n.fill_opacity?a(n.fill_opacity):.15,t=o(O,e),i=n.line_width??1.5,s=n.line_style??"solid",r={id:W,name:L,type:"line",smooth:!M&&((k?R:void 0)??!0),showSymbol:!1,areaStyle:H?{}:void 0,data:V,stack:n.stack,yAxisIndex:+("right"===n.y_axis),z:l,emphasis:{focus:"series",itemStyle:{color:j,borderColor:j}},lineStyle:{width:i,color:z,type:s},itemStyle:{color:z,borderColor:z},color:z};!1===n.show_in_tooltip&&(r.tooltip={...r.tooltip??{},show:!1}),M&&(r.step="end"),H&&(r.areaStyle={...r.areaStyle??{},color:t}),g.push(r),S=H?t:z,x=z,f.has(L)?b(`duplicate-name-${L}`,`Multiple series share the name "${L}". fill_to_series references will be ambiguous.`):f.set(L,{id:W,name:L,config:n,dataPoints:V,lineColor:z,fillColor:t,fillOpacity:e,series:r});let d=n.fill_to_series?.trim();d&&v.push({sourceName:L,targetName:d})}else{let e="number"==typeof n.fill_opacity?a(n.fill_opacity):.5,t=o(O,e),i=o(O,Math.min(1,e+.2)),s=o(O,void 0!==F?F:1),d={id:W,name:L,type:"bar",stack:n.stack,data:V,yAxisIndex:+("right"===n.y_axis),z:l,emphasis:{focus:"series",itemStyle:{color:i,borderColor:s}},itemStyle:{color:t,borderColor:s},color:t,barMaxWidth:r};!1===n.show_in_tooltip&&(d.tooltip={...d.tooltip??{},show:!1}),g.push(d),n.fill_to_series&&b(`fill-bar-${L}`,`Series "${L}" is configured as bar chart and cannot use fill_to_series.`),S=t,x=s}!1!==n.show_in_legend&&p.push({id:W,name:L,color:S,fillColor:S,borderColor:x,borderWidth:N?2:1,hidden:!0===n.hidden_by_default})}),v.forEach(({sourceName:e,targetName:t})=>{let i=f.get(e);if(!i)return void b(`fill-source-missing-${e}`,`Series "${e}" could not be found for fill_to_series processing.`);if(i.config.stack)return void b(`fill-source-stack-${e}`,`Series "${e}" uses stack together with fill_to_series. Stacking is not supported for fill areas.`);let s=f.get(t);if(!s)return void b(`fill-target-missing-${e}-${t}`,`fill_to_series for "${e}" references "${t}", which does not exist or is not a line series.`);if(s.config.stack)return void b(`fill-target-stack-${e}-${t}`,`Series "${t}" uses stack and cannot be used as fill target.`);if(i.name===s.name)return void b(`fill-same-series-${e}`,`Series "${e}" references itself in fill_to_series.`);let r=new Map;i.dataPoints.forEach(([e,t])=>{r.set(e,"number"!=typeof t||Number.isNaN(t)?null:t)});let a=new Map;s.dataPoints.forEach(([e,t])=>{a.set(e,"number"!=typeof t||Number.isNaN(t)?null:t)});let o=new Set;r.forEach((e,t)=>o.add(t)),a.forEach((e,t)=>o.add(t));let n=Array.from(o).sort((e,t)=>e-t),l=[],d=[],h=!1;if(n.forEach(e=>{let t=r.get(e),i=a.get(e);if(void 0===t||void 0===i||null===t||null===i){l.push([e,i??null]),d.push([e,null]);return}let s=t-i;if(s<0){h=!0,l.push([e,i]),d.push([e,0]);return}l.push([e,i]),d.push([e,s])}),!d.some(([,e])=>"number"==typeof e&&e>0))return;h&&b(`fill-clamped-${e}-${t}`,`fill_to_series for "${e}" encountered values below "${t}". Negative differences were clamped to zero.`);let c=`__energy_fill_${i.id}`,u=`${i.id}__fill_base`,p=`${i.id}__fill_area`,m="number"==typeof i.series.z?i.series.z:2,_="number"==typeof s.series.z?s.series.z:2,v=m-.1;v<0&&(v=m+.1);let y=Math.min(v-.01,_-.1);y<0&&(y=Math.max(v-.02,0));let $={id:u,name:`${e}__fill_base`,type:"line",data:l,stack:c,stackStrategy:"all",smooth:s.series.smooth,lineStyle:{width:0,color:s.lineColor},areaStyle:{opacity:0},showSymbol:!1,silent:!0,tooltip:{show:!1},emphasis:{disabled:!0},xAxisIndex:s.series.xAxisIndex,yAxisIndex:s.series.yAxisIndex,z:y,legendHoverLink:!1},S={id:p,name:`${e}__fill_area`,type:"line",data:d,stack:c,stackStrategy:"all",smooth:i.series.smooth,lineStyle:{width:0,color:i.lineColor},areaStyle:{color:i.fillColor},itemStyle:{color:i.fillColor},showSymbol:!1,silent:!0,tooltip:{show:!1},emphasis:{disabled:!0},xAxisIndex:i.series.xAxisIndex,yAxisIndex:i.series.yAxisIndex,z:v,legendHoverLink:!1};g.push($,S)}),{series:g,legend:p,unitBySeries:m,seriesById:_}}});var o=r("hAmm6");r("fUwgm");var n=r("bBTYI"),l=r("iKGUH"),d=r("2cNIw");r("UE69e");var h=r("esbW4"),c=r("9z3oa"),u=r("ddM75");r("chq2z");var p=r("fxePf");function m(e){if(null===e||!0===e||!1===e)return NaN;var t=Number(e);return isNaN(t)?t:t<0?Math.ceil(t):Math.floor(t)}function _(e){return(_="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function g(e,t){if(t.length<e)throw TypeError(e+" argument"+(e>1?"s":"")+" required, but only "+t.length+" present")}function f(e){g(1,arguments);var t=Object.prototype.toString.call(e);return e instanceof Date||"object"===_(e)&&"[object Date]"===t?new Date(e.getTime()):"number"==typeof e||"[object Number]"===t?new Date(e):(("string"==typeof e||"[object String]"===t)&&"undefined"!=typeof console&&(console.warn("Starting with v2.0.0-beta.1 date-fns doesn't accept strings as date arguments. Please use `parseISO` to parse strings. See: https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#string-arguments"),console.warn(Error().stack)),new Date(NaN))}function v(e,t){g(2,arguments);var i=f(e),s=m(t);return isNaN(s)?new Date(NaN):(s&&i.setDate(i.getDate()+s),i)}function y(e,t){return g(2,arguments),new Date(f(e).getTime()+m(t))}function b(e,t){return g(2,arguments),y(e,36e5*m(t))}function $(e,t){return g(2,arguments),y(e,6e4*m(t))}function S(e,t){g(2,arguments);var i=f(e),s=m(t);if(isNaN(s))return new Date(NaN);if(!s)return i;var r=i.getDate(),a=new Date(i.getTime());return(a.setMonth(i.getMonth()+s+1,0),r>=a.getDate())?a:(i.setFullYear(a.getFullYear(),a.getMonth(),r),i)}function x(e,t){return g(2,arguments),v(e,7*m(t))}function w(e,t){return g(2,arguments),S(e,12*m(t))}function C(e){var t=new Date(Date.UTC(e.getFullYear(),e.getMonth(),e.getDate(),e.getHours(),e.getMinutes(),e.getSeconds(),e.getMilliseconds()));return t.setUTCFullYear(e.getFullYear()),e.getTime()-t.getTime()}function A(e){g(1,arguments);var t=f(e);return t.setHours(0,0,0,0),t}function T(e,t){var i=e.getFullYear()-t.getFullYear()||e.getMonth()-t.getMonth()||e.getDate()-t.getDate()||e.getHours()-t.getHours()||e.getMinutes()-t.getMinutes()||e.getSeconds()-t.getSeconds()||e.getMilliseconds()-t.getMilliseconds();return i<0?-1:i>0?1:i}function E(e,t){g(2,arguments);var i=f(e),s=f(t),r=T(i,s),a=Math.abs(function(e,t){g(2,arguments);var i=A(e),s=A(t);return Math.round((i.getTime()-C(i)-(s.getTime()-C(s)))/864e5)}(i,s));i.setDate(i.getDate()-r*a);var o=Number(T(i,s)===-r),n=r*(a-o);return 0===n?0:n}var k={ceil:Math.ceil,round:Math.round,floor:Math.floor,trunc:function(e){return e<0?Math.ceil(e):Math.floor(e)}};function M(e,t,i){g(2,arguments);var s,r=function(e,t){return g(2,arguments),f(e).getTime()-f(t).getTime()}(e,t)/36e5;return((s=null==i?void 0:i.roundingMethod)?k[s]:k.trunc)(r)}function N(e,t){g(2,arguments);var i=f(e),s=f(t),r=i.getTime()-s.getTime();return r<0?-1:r>0?1:r}function P(e){g(1,arguments);var t=f(e);return t.setHours(23,59,59,999),t}function D(e){g(1,arguments);var t=f(e),i=t.getMonth();return t.setFullYear(t.getFullYear(),i+1,0),t.setHours(23,59,59,999),t}function R(e,t){g(2,arguments);var i,s=f(e),r=f(t),a=N(s,r),o=Math.abs(function(e,t){g(2,arguments);var i=f(e),s=f(t);return 12*(i.getFullYear()-s.getFullYear())+(i.getMonth()-s.getMonth())}(s,r));if(o<1)i=0;else{1===s.getMonth()&&s.getDate()>27&&s.setDate(30),s.setMonth(s.getMonth()-a*o);var n=N(s,r)===-a;(function(e){g(1,arguments);var t=f(e);return P(t).getTime()===D(t).getTime()})(f(e))&&1===o&&1===N(e,r)&&(n=!1),i=a*(o-Number(n))}return 0===i?0:i}function H(e,t){g(2,arguments);var i=f(e),s=f(t),r=N(i,s),a=Math.abs(function(e,t){g(2,arguments);var i=f(e),s=f(t);return i.getFullYear()-s.getFullYear()}(i,s));i.setFullYear(1584),s.setFullYear(1584);var o=N(i,s)===-r,n=r*(a-Number(o));return 0===n?0:n}function L(e){g(1,arguments);var t=f(e);return t.setMinutes(59,59,999),t}var U={};function O(e,t){g(1,arguments);var i,s,r,a,o,n,l,d,h=m(null!=(i=null!=(s=null!=(r=null!=(a=null==t?void 0:t.weekStartsOn)?a:null==t||null==(o=t.locale)||null==(n=o.options)?void 0:n.weekStartsOn)?r:U.weekStartsOn)?s:null==(l=U.locale)||null==(d=l.options)?void 0:d.weekStartsOn)?i:0);if(!(h>=0&&h<=6))throw RangeError("weekStartsOn must be between 0 and 6 inclusively");var c=f(e),u=c.getDay();return c.setDate(c.getDate()+((u<h?-7:0)+6-(u-h))),c.setHours(23,59,59,999),c}function F(e){g(1,arguments);var t=f(e),i=t.getFullYear();return t.setFullYear(i+1,0,0),t.setHours(23,59,59,999),t}function I(e){g(1,arguments);var t=f(e);return t.setMinutes(0,0,0),t}function z(e){g(1,arguments);var t=f(e);return t.setDate(1),t.setHours(0,0,0,0),t}function j(e,t){g(1,arguments);var i,s,r,a,o,n,l,d,h=m(null!=(i=null!=(s=null!=(r=null!=(a=null==t?void 0:t.weekStartsOn)?a:null==t||null==(o=t.locale)||null==(n=o.options)?void 0:n.weekStartsOn)?r:U.weekStartsOn)?s:null==(l=U.locale)||null==(d=l.options)?void 0:d.weekStartsOn)?i:0);if(!(h>=0&&h<=6))throw RangeError("weekStartsOn must be between 0 and 6 inclusively");var c=f(e),u=c.getDay();return c.setDate(c.getDate()-(7*(u<h)+u-h)),c.setHours(0,0,0,0),c}function B(e){g(1,arguments);var t=f(e),i=new Date(0);return i.setFullYear(t.getFullYear(),0,1),i.setHours(0,0,0,0),i}function W(e,t){return g(2,arguments),v(e,-m(t))}function V(e,t){return g(2,arguments),b(e,-m(t))}const Y=(e,t,i,s,r="hour",a,o)=>e.callWS({type:"recorder/statistics_during_period",start_time:t.toISOString(),end_time:i?.toISOString(),statistic_ids:s,period:r,units:a,types:o}),q={on:1,open:1,opening:1,true:1,off:0,closed:0,closing:0,false:0};var K=r("glq8a");const G={mode:"energy"},Q="[energy-custom-graph-card]";class J extends Error{constructor(e){super(e),this.name="TimeoutError"}}class X extends d.LitElement{static{this.FALLBACK_WARNING="[energy-custom-graph-card] Falling back to default period because energy date selection is unavailable."}static{this.DISABLED_FETCH_MESSAGE="Fetching statistics is disabled for this period. Choose a shorter time range to view data."}_getDisabledMessage(){let e=this.hass?.localize?.("ui.components.statistics_charts.choose_shorter_period");return e&&e.trim().length>0?e:X.DISABLED_FETCH_MESSAGE}static{this.DEFAULT_STAT_TYPE="change"}static{this.clampValue=(e,t,i)=>{let s=e;return void 0!==t&&(s=Math.max(s,t)),void 0!==i&&(s=Math.min(s,i)),s}}connectedCallback(){super.connectedCallback(),this._visibilityListenerAttached||"undefined"==typeof document||(document.addEventListener("visibilitychange",this._handleVisibilityChange),this._visibilityListenerAttached=!0,this._isPageVisible="hidden"!==document.visibilityState),this.hass&&this._config&&this._syncWithConfig()}disconnectedCallback(){for(let e of(super.disconnectedCallback(),this._visibilityListenerAttached&&"undefined"!=typeof document&&(document.removeEventListener("visibilitychange",this._handleVisibilityChange),this._visibilityListenerAttached=!1),this._pendingVisibilityRefresh&&(clearTimeout(this._pendingVisibilityRefresh),this._pendingVisibilityRefresh=void 0),this._teardownEnergyCollection(),this._autoRefreshTimeout&&(clearTimeout(this._autoRefreshTimeout),this._autoRefreshTimeout=void 0),this._liveHourTimeout&&(clearTimeout(this._liveHourTimeout),this._liveHourTimeout=void 0),void 0!==this._rawAnimationFrame&&(cancelAnimationFrame(this._rawAnimationFrame),this._rawAnimationFrame=void 0),this._fetchStates.values()))e.timeout&&(clearTimeout(e.timeout),e.timeout=void 0),e.inFlight=!1,e.queued=!1}shouldUpdate(e){if(e.has("_config"))return!0;if(e.has("hass")&&1===e.size){let t=e.get("hass");return!t||t.connected!==this.hass?.connected||t.themes!==this.hass?.themes||t.locale!==this.hass?.locale||t.config.state!==this.hass?.config.state}return!0}willUpdate(e){if(e.has("hass")&&this.hass&&this._config&&this._syncWithConfig(),e.has("_config")){let t=e.get("_config");this.hass&&this._config&&this._syncWithConfig(t)}}_syncWithConfig(e){if(!this._config||!this.hass)return;let t=this._needsEnergyCollection(this._config),i=this._needsEnergyCollection(e);if(t){let t=e?.collection_key!==this._config.collection_key,i=e?.timespan?.mode!==this._config.timespan?.mode;(t||i||!this._energyCollection&&!this._collectionPollHandle)&&this._setupEnergyCollection()}else i&&this._teardownEnergyCollection();this._shouldUseEnergyCompare()||this._clearCompareTracking();let s=this._recalculatePeriod(),r=this._recalculateComparePeriod(),a=!!e&&JSON.stringify(e.series)!==JSON.stringify(this._config.series);(s||a||!this._statistics)&&this._scheduleLoad("main"),this._comparePeriodStart&&(r||a||!this._statisticsCompare)&&this._scheduleLoad("compare")}_needsEnergyCollection(e){return e?.timespan?.mode==="energy"}_shouldUseEnergyCompare(){return!!this._config&&this._config.timespan?.mode==="energy"&&!1!==this._config.allow_compare}_clearCompareTracking(){this._energyCompareStart=void 0,this._energyCompareEnd=void 0,(this._comparePeriodStart||this._comparePeriodEnd||this._statisticsCompare)&&(this._comparePeriodStart=void 0,this._comparePeriodEnd=void 0,this._resetCompareStatistics())}_setupEnergyCollection(e=0){if(this._config?.timespan?.mode!=="energy"||!this.hass)return;0===e?this._teardownEnergyCollection():this._collectionPollHandle&&(window.clearTimeout(this._collectionPollHandle),this._collectionPollHandle=void 0);let t=this._config.collection_key?`_${this._config.collection_key}`:"_energy",i=this.hass.connection,s="object"==typeof i&&null!==i?i[t]:void 0;if(s&&"function"==typeof s.subscribe){this._collectionUnsub&&(this._collectionUnsub(),this._collectionUnsub=void 0),this._energyCollection=s,this._loggedEnergyFallback=!1,this._collectionUnsub=s.subscribe(e=>{let t=this._shouldUseEnergyCompare();if(this._energyStart=e.start,this._energyEnd=e.end??void 0,t)this._energyCompareStart=e.startCompare??void 0,this._energyCompareEnd=e.endCompare??void 0;else{let e=void 0!==this._comparePeriodStart||void 0!==this._comparePeriodEnd||!!this._statisticsCompare;this._energyCompareStart=void 0,this._energyCompareEnd=void 0,e&&this._clearCompareTracking()}let i=this._recalculatePeriod(),s=!!t&&this._recalculateComparePeriod(),r=i||!this._statistics,a=t&&!!this._comparePeriodStart,o=t&&a&&(s||!this._statisticsCompare);r&&this._scheduleLoad("main"),o&&this._scheduleLoad("compare")});return}if(e>=50){this._loggedEnergyFallback||(this._log("warn",X.FALLBACK_WARNING,{hidden:!this._isPageVisible}),this._loggedEnergyFallback=!0),this._energyCollection=void 0,this._collectionUnsub=void 0,this._shouldUseEnergyCompare()||this._clearCompareTracking();let e=this._recalculatePeriod(),t=!!this._shouldUseEnergyCompare()&&this._recalculateComparePeriod();(e||!this._statistics)&&this._scheduleLoad("main"),this._shouldUseEnergyCompare()&&t&&this._comparePeriodStart&&this._scheduleLoad("compare"),this._collectionPollHandle=window.setTimeout(()=>this._setupEnergyCollection(50),1e3);return}this._collectionPollHandle=window.setTimeout(()=>this._setupEnergyCollection(e+1),200)}_teardownEnergyCollection(){this._collectionPollHandle&&(window.clearTimeout(this._collectionPollHandle),this._collectionPollHandle=void 0),this._collectionUnsub&&(this._collectionUnsub(),this._collectionUnsub=void 0),this._energyCollection=void 0,this._energyStart=void 0,this._energyEnd=void 0,this._energyCompareStart=void 0,this._energyCompareEnd=void 0,this._clearCompareTracking()}_recalculatePeriod(){let e=this._resolvePeriod();if(!e)return!1;let{start:t,end:i}=e,s=this._periodStart?.getTime(),r=this._periodEnd?.getTime(),a=t.getTime(),o=i?.getTime(),n=s!==a||r!==o;return n&&(this._periodStart=t,this._periodEnd=i),n}_recalculateComparePeriod(){let e=this._resolveComparePeriod(),t=this._comparePeriodStart?.getTime(),i=this._comparePeriodEnd?.getTime();if(!e)return(!!this._comparePeriodStart||!!this._comparePeriodEnd)&&(this._comparePeriodStart=void 0,this._comparePeriodEnd=void 0,this._resetCompareStatistics(),!0);let{start:s,end:r}=e,a=s.getTime(),o=r?.getTime(),n=t!==a||i!==o;return n&&(this._comparePeriodStart=s,this._comparePeriodEnd=r,this._resetCompareStatistics()),n}_resolvePeriod(){if(!this._config)return;let e=this._config.timespan??G;switch(e.mode){case"energy":{let e=this._getEnergyRange();if(!e){if(this._loggedEnergyFallback)return this._defaultEnergyRange();return}return e}case"relative":{let t=e.offset??0;switch(e.period){case"hour":{let e=this._defaultRelativeBase("hour");return{start:b(e.start,t),end:e.end?b(e.end,t):L(b(e.start,t))}}case"day":{let e=this._defaultRelativeBase("day");return{start:v(e.start,t),end:e.end?v(e.end,t):P(v(e.start,t))}}case"week":{let e=this._defaultRelativeBase("week");return{start:x(e.start,t),end:e.end?x(e.end,t):O(x(e.start,t))}}case"month":{let e=this._defaultRelativeBase("month");return{start:S(e.start,t),end:e.end?S(e.end,t):D(S(e.start,t))}}case"last_7_days":{let e=v(this._getRoundedNow("last_7_days"),t);return{start:W(e,7),end:e}}case"last_60_minutes":{let e=b(this._getRoundedNow("last_60_minutes"),t);return{start:$(e,-60),end:e}}case"last_24_hours":{let e=v(this._getRoundedNow("last_24_hours"),t);return{start:V(e,24),end:e}}case"last_30_days":{let e=v(this._getRoundedNow("last_30_days"),t);return{start:W(e,30),end:e}}case"last_12_months":{let e=S(this._getRoundedNow("last_12_months"),t);return{start:function(e,t){return g(2,arguments),S(e,-m(t))}(e,12),end:e}}default:{let e=this._defaultRelativeBase("year");return{start:w(e.start,t),end:e.end?w(e.end,t):F(w(e.start,t))}}}}case"fixed":{let t=e.start,i=t?new Date(t):A(new Date);if(Number.isNaN(i.getTime()))throw Error("Invalid start date in fixed timespan configuration");let s=e.end,r=s?new Date(s):P(i);if(Number.isNaN(r.getTime()))throw Error("Invalid end date in fixed timespan configuration");return{start:i,end:r}}default:return}}_resolveComparePeriod(){if(this._config&&"energy"===(this._config.timespan??G).mode){if(this._shouldUseEnergyCompare()&&this._energyCompareStart)return{start:this._energyCompareStart,end:this._energyCompareEnd}}}_getEnergyRange(){if(this._energyStart)return{start:this._energyStart,end:this._energyEnd}}_defaultEnergyRange(){return{start:A(new Date),end:P(new Date)}}_getRoundedNow(e){let t=new Date;switch(e){case"last_60_minutes":case"last_hour":case"last_24_hours":return t.setSeconds(0,0),t;case"last_7_days":case"last_30_days":return t.getMinutes()>=20&&t.setHours(t.getHours()+1),t.setMinutes(20,0,0),t;case"last_12_months":case"last_year":return t.setHours(0,0,0,0),t;default:return t}}_defaultRelativeBase(e){let t=new Date;switch(e){case"hour":return{start:I(t),end:L(t)};case"day":return this._defaultEnergyRange();case"week":return{start:j(t),end:O(t)};case"month":return{start:z(t),end:D(t)};default:return{start:B(t),end:F(t)}}}_getFetchState(e){let t=this._fetchStates.get(e);return t||(t={inFlight:!1,queued:!1},this._fetchStates.set(e,t)),t}async _withTimeout(e,t,i,s){let r,a=new Promise((e,s)=>{r=window.setTimeout(()=>{s(new J(`${i} timed out after ${t} ms`))},t)});try{return await Promise.race([e,a])}catch(r){let e={...s??{},context:i,timeoutMs:t};throw r instanceof J?this._log("error",r.message,e):this._log("error",`Request failed in ${i}`,e),r}finally{void 0!==r&&clearTimeout(r)}}_scheduleLoad(e="main"){let t=this._getFetchState(e);if(!this._isPageVisible){t.queued=!0,t.timeout&&(clearTimeout(t.timeout),t.timeout=void 0),this._visibilityQueuedLoads.add(e),this._log("debug","Deferring load while page is hidden",{key:e});return}if(t.inFlight){t.queued=!0,t.timeout&&(clearTimeout(t.timeout),t.timeout=void 0);return}t.timeout&&clearTimeout(t.timeout),t.timeout=window.setTimeout(()=>{if(t.timeout=void 0,!this._isPageVisible){t.queued=!0,this._visibilityQueuedLoads.add(e),this._log("debug","Cancelled load execution because page is hidden",{key:e});return}this._loadStatistics(e)},500)}_scheduleLiveHourLoad(e){let t="compare"===e?"compare_live":"main_live",i=this._getFetchState(t);if(!this._isPageVisible){i.queued=!0,i.timeout&&(clearTimeout(i.timeout),i.timeout=void 0),this._visibilityQueuedLoads.add(t),this._log("debug","Deferring live-hour load while page is hidden",{key:t});return}if(i.inFlight){i.queued=!0;return}i.timeout&&clearTimeout(i.timeout),i.timeout=window.setTimeout(()=>{if(i.timeout=void 0,!this._isPageVisible){i.queued=!0,this._visibilityQueuedLoads.add(t),this._log("debug","Cancelled live-hour execution because page is hidden",{key:t});return}this._loadLiveHourPatch(e)},250)}_pauseVisibilityTimers(){for(let e of(this._autoRefreshTimeout&&(clearTimeout(this._autoRefreshTimeout),this._autoRefreshTimeout=void 0),this._liveHourTimeout&&(clearTimeout(this._liveHourTimeout),this._liveHourTimeout=void 0),this._fetchStates.values()))e.timeout&&(clearTimeout(e.timeout),e.timeout=void 0)}_scheduleVisibilityResume(){this._pendingVisibilityRefresh||(this._pendingVisibilityRefresh=window.setTimeout(()=>{if(this._pendingVisibilityRefresh=void 0,!this._isPageVisible)return;let e=Array.from(this._visibilityQueuedLoads);this._visibilityQueuedLoads.clear(),this._log("debug","Resuming after visibility change",{queued:e.join(",")||void 0}),!e.length&&(e.push("main"),this._shouldUseEnergyCompare()&&this._comparePeriodStart&&e.push("compare")),e.forEach(e=>{"main_live"===e?this._scheduleLiveHourLoad("main"):"compare_live"===e?this._scheduleLiveHourLoad("compare"):this._scheduleLoad(e)}),e.includes("main")||this._scheduleLoad("main"),this._shouldUseEnergyCompare()&&this._comparePeriodStart&&!e.includes("compare")&&this._scheduleLoad("compare"),this._scheduleAutoRefresh()},200))}async _loadLiveHourPatch(e){if(!this.hass)return;if(!this._isPageVisible)return void this._log("debug","Aborting live-hour load while hidden",{target:e});let t="compare"===e?"compare_live":"main_live",i=this._getFetchState(t);if(i.inFlight)return;if(!this._shouldComputeCurrentHour(e))return void("compare"===e?this._liveStatisticsCompare=void 0:(this._liveStatistics=void 0,this._liveHourTimeout&&(clearTimeout(this._liveHourTimeout),this._liveHourTimeout=void 0)));let s="compare"===e?this._lastStatisticIdsCompare:this._lastStatisticIds,r="compare"===e?this._lastStatTypesCompare:this._lastStatTypes;if(!s||!s.length)return;let a=this._computeLiveHourContext(e);if(!a)return;let o=`${t}-${Date.now()}`,n=performance.now();i.inFlight=!0,i.queued=!1;let{fetchStart:l,fetchEnd:d,currentHourStart:h}=a,c={key:t,target:e,hidden:!this._isPageVisible,requestId:o,fetchStart:new Date(l).toISOString(),fetchEnd:new Date(d).toISOString(),stats:s.length};this._log("debug","Loading live-hour statistics",c);try{let t=await this._withTimeout(Y(this.hass,new Date(l),new Date(d),s,"5minute",void 0,r),6e4,"fetchStatistics:liveHour",c),i=this._buildLiveHourPatch(e,t,a,s);this._applyLiveHourPatch(e,i)}catch(e){this._log("error","Failed to load live-hour statistics",{...c,error:e instanceof Error?e.message:e})}finally{i.inFlight=!1,i.queued&&(i.queued=!1,this._scheduleLiveHourLoad(e)),"main"===e&&this._shouldComputeCurrentHour("main")&&this._scheduleNextLiveHourTick();let t=Math.round(performance.now()-n);this._log("debug","Live-hour request completed",{...c,durationMs:t})}}_computeLiveHourContext(e){let t="compare"===e?this._comparePeriodStart:this._periodStart,i="compare"===e?this._comparePeriodEnd:this._periodEnd,s=new Date,r=s.getTime(),a=I(s).getTime(),o=V(new Date(a),1).getTime(),n=t?.getTime(),l=i?.getTime(),d=Math.max(o,void 0!==n?n:o);if(!(r<=d))return{fetchStart:d,fetchEnd:r,currentHourStart:a,previousHourStart:o,periodStartMs:n,periodEndMs:l,nowMs:r}}_buildLiveHourPatch(e,t,i,s){let r="compare"===e?this._statisticsCompare:this._statistics;if(!r)return;let a=i.periodStartMs,o=i.periodEndMs,n=i.nowMs,l=i.currentHourStart,d={},h=!1,c=[];this._hourInDisplay(l,a,o)&&c.push(l);let u=i.previousHourStart;if(u>=i.fetchStart&&this._hourInDisplay(u,a,o)&&c.push(u),c.length){for(let e of s){let i=t[e]??[],s=r[e]??[],a=[];for(let e of c){let t=Math.min(e+36e5,o??e+36e5,n),r=s.find(t=>"number"==typeof t.start&&3e4>Math.abs(t.start-e));if(e===l){if(r&&"number"==typeof r.end&&r.end>=e+354e4)continue}else if(r)continue;let d=this._aggregateFiveMinuteEntries(i,e,t);d&&a.push(d)}a.length&&(a.sort((e,t)=>(e.start??0)-(t.start??0)),d[e]=a,h=!0)}return h?d:void 0}}_applyLiveHourPatch(e,t){if(!t||!Object.keys(t).length)return void("compare"===e?this._liveStatisticsCompare=void 0:this._liveStatistics=void 0);let i="compare"===e?this._statisticsCompare:this._statistics;if(!i)return;let s={...i};for(let[e,i]of Object.entries(t)){if(!i||!i.length)continue;let t=new Set(i.map(e=>"number"==typeof e.start?e.start:void 0).filter(e=>void 0!==e)),r=(s[e]??[]).filter(e=>"number"!=typeof e.start||!t.has(e.start));s[e]=[...r,...i].sort((e,t)=>(e.start??0)-(t.start??0))}"compare"===e?(this._liveStatisticsCompare=t,this._statisticsCompare=s,this._metadataCompare?this._rebuildCalculatedSeries(s,this._metadataCompare,"compare"):this._rebuildCalculatedSeries(s,{},"compare")):(this._liveStatistics=t,this._statistics=s,this._metadata?this._rebuildCalculatedSeries(s,this._metadata,"main"):this._rebuildCalculatedSeries(s,{},"main"))}_aggregateFiveMinuteEntries(e,t,i){let s=e.filter(e=>"number"==typeof e.start&&e.start>=t&&e.start<i);if(!s.length)return;let r=0,a=0,o=!1,n=!1,l=0,d=0,h=null,c=null,u=null;for(let e of s){let i="number"==typeof e.start?e.start:t,s=Math.max(0,("number"==typeof e.end?e.end:i+3e5)-i);"number"==typeof e.change&&Number.isFinite(e.change)&&(r+=e.change,o=!0),"number"==typeof e.sum&&Number.isFinite(e.sum)&&(a+=e.sum,n=!0),"number"==typeof e.min&&Number.isFinite(e.min)&&(h=null===h?e.min:Math.min(h,e.min)),"number"==typeof e.max&&Number.isFinite(e.max)&&(c=null===c?e.max:Math.max(c,e.max));let p="number"==typeof e.mean&&Number.isFinite(e.mean)?e.mean:"number"==typeof e.state&&Number.isFinite(e.state)?e.state:void 0;void 0!==p&&s>0&&(l+=p*s,d+=s),"number"==typeof e.state&&Number.isFinite(e.state)&&(u=e.state)}let p={start:t,end:i};return o&&(p.change=r),n&&(p.sum=a),null!==h&&(p.min=h),null!==c&&(p.max=c),d>0?p.mean=l/d:null!==u&&(p.mean=u),null!==u&&(p.state=u),p}_hourInDisplay(e,t,i){return(void 0===i||!(i<=e))&&(void 0===t||!(t>=e+36e5))}_scheduleNextLiveHourTick(){if(this._liveHourTimeout&&(clearTimeout(this._liveHourTimeout),this._liveHourTimeout=void 0),!this._shouldComputeCurrentHour("main"))return;let e=Math.max(this._getNextAlignedRefreshTime("5minute")-Date.now(),3e4);this._liveHourTimeout=window.setTimeout(()=>{this._liveHourTimeout=void 0,this._scheduleLiveHourLoad("main")},e)}_getRefreshTiming(e){if("disabled"===e)return{intervalMs:1/0,delayMs:0};if("raw"===e)return{intervalMs:1e3*Math.max(5,this._config?.aggregation?.raw_refresh_interval_seconds??60),delayMs:0};switch(e){case"5minute":return{intervalMs:3e5,delayMs:12e4};case"hour":default:return{intervalMs:36e5,delayMs:12e5};case"day":return{intervalMs:864e5,delayMs:18e5};case"week":case"month":return{intervalMs:6048e5,delayMs:36e5}}}_getNextAlignedRefreshTime(e){if("disabled"===e)return 1/0;let t=new Date,i=this._getRefreshTiming(e),s=new Date(t);if("raw"===e)return(s=new Date(t.getTime()+i.intervalMs)).getTime();switch(e){case"5minute":{let e=5*Math.ceil((t.getMinutes()+1)/5);s.setMinutes(e,0,0),s<=t&&s.setMinutes(s.getMinutes()+5),s.setMinutes(s.getMinutes()+2);break}case"hour":s.setHours(s.getHours()+1,20,0,0),s<=t&&s.setHours(s.getHours()+1);break;case"day":s.setDate(s.getDate()+1),s.setHours(0,30,0,0),s<=t&&s.setDate(s.getDate()+1);break;default:s=new Date(t.getTime()+i.intervalMs+i.delayMs)}return s.getTime()}_scheduleAutoRefresh(){if(this._autoRefreshTimeout&&(clearTimeout(this._autoRefreshTimeout),this._autoRefreshTimeout=void 0),!this._isPageVisible)return void this._log("debug","Skipping auto-refresh scheduling while hidden",{hidden:!0});let e=this._config?.timespan;if(!e)return;if(e.mode,"fixed"===e.mode){let t=e.end?new Date(e.end):null;if(!t||t<=new Date)return}if(!this._periodStart)return;let t=this._resolveAggregationPlan(this._periodStart,this._periodEnd)[0];if(!t||"disabled"===t)return;let i=this._getNextAlignedRefreshTime(t),s=i-Date.now();if(this._log("debug","Auto-refresh scheduled",{aggregation:t,nextRefreshIso:new Date(i).toISOString(),msUntilRefresh:s,mode:this._config?.timespan?.mode}),s<=0){this._log("warn","Calculated refresh time is in the past, using 1 minute fallback",{hidden:!this._isPageVisible}),this._autoRefreshTimeout=window.setTimeout(()=>{this._scheduleAutoRefresh()},6e4);return}this._autoRefreshTimeout=window.setTimeout(()=>{if(this._autoRefreshTimeout=void 0,!this._isPageVisible)return void this._log("debug","Auto-refresh timer fired while hidden",{hidden:!0});this._log("debug","Auto-refresh executing",{aggregation:t});let e=this._recalculatePeriod(),i=this._recalculateComparePeriod(),s=this._config?.timespan,r=s?.mode==="relative"&&s.period?.startsWith("last_"),a="raw"===t||!r||e;a&&(this._scheduleLoad("main"),this._comparePeriodStart&&(i||a)&&this._scheduleLoad("compare")),this._scheduleAutoRefresh()},s)}async _loadStatistics(e="main"){let t,i;if(!this._config||!this.hass)return;let s=this._getFetchState(e);if(s.inFlight){s.queued=!0;return}let r="compare"===e,a=`${e}-${Date.now()}`,o=performance.now(),n={key:e,compare:r,hidden:!this._isPageVisible};n.requestId=a;let l=r?this._comparePeriodStart:this._periodStart,d=r?this._comparePeriodEnd:this._periodEnd;if(!l){this._log("debug","Skipping statistics load; no period defined",{...n}),r&&this._resetCompareStatistics();return}if(!this._isPageVisible)return void this._log("debug","Aborting statistics load while hidden",{...n});s.inFlight=!0,s.queued=!1;let h=l.getTime(),c=d?.getTime()??null;n.start=new Date(h).toISOString(),n.end=null!==c?new Date(c).toISOString():null;let u=new Set,p=new Set;this._config.series.forEach(e=>{let t=e.stat_type??X.DEFAULT_STAT_TYPE;if(e.statistic_id&&e.statistic_id.trim()){let i=e.statistic_id.trim();u.add(i),p.add(t)}e.calculation?.terms?.forEach(e=>{let i=e.stat_type??t??X.DEFAULT_STAT_TYPE;e.statistic_id&&e.statistic_id.trim()&&(u.add(e.statistic_id.trim()),p.add(i))})});let m=Array.from(u),_=Array.from(p),g=["change","sum","mean","min","max","state"];if(_.length){let e=_.filter(e=>g.includes(e));t=e.length?e:void 0}t||(t=[X.DEFAULT_STAT_TYPE]),n.statistics=m.length,r?(this._lastStatisticIdsCompare=m,this._lastStatTypesCompare=t):(this._lastStatisticIds=m,this._lastStatTypes=t);let f=this._resolveAggregationPlan(l,d),v=f[0];if(n.aggregationPlan=f.join(" -> "),this._log("info","Loading statistics",n),"disabled"===v){s.inFlight=!1,s.queued=!1;let e={start:h,end:c};this._isLoading=!1,this._log("info","Aggregation disabled; skipping data load",{...n}),r?(this._liveStatisticsCompare=void 0,this._statisticsRangeCompare=e,this._statisticsPeriodCompare="disabled",this._metadataCompare=void 0,this._statisticsCompare=void 0,this._calculatedSeriesDataCompare=new Map,this._calculatedSeriesUnitsCompare=new Map):(this._liveStatistics=void 0,this._statisticsRange=e,this._statisticsPeriod="disabled",this._metadata=void 0,this._statistics=void 0,this._calculatedSeriesData=new Map,this._calculatedSeriesUnits=new Map,this._chartData=[],this._chartOptions=void 0,this._unitsBySeries=new Map,this._disabledMessage=this._getDisabledMessage(),this._autoRefreshTimeout&&(clearTimeout(this._autoRefreshTimeout),this._autoRefreshTimeout=void 0),this._liveHourTimeout&&(clearTimeout(this._liveHourTimeout),this._liveHourTimeout=void 0));return}r||(this._disabledMessage=void 0);let y=++this._activeFetchCounters[e],b=!r&&!this._statistics;b&&(this._isLoading=!0);try{let s,a,o={};if(m.length)try{let e;(await this._withTimeout((e=this.hass,e.callWS({type:"recorder/get_statistics_metadata",statistic_ids:m})),6e4,"getStatisticMetadata",{...n,stats:m.length})).forEach(e=>{o[e.statistic_id]=e})}catch(e){e instanceof J||this._log("error","Failed to load statistics metadata",{...n,error:e instanceof Error?e.message:e})}let u={};if(m.length)for(let e=0;e<f.length;e++){let o=f[e];if(a=o,"disabled"===o){s=o;break}try{if("raw"===o){let t=r?this._lastRawEndCompare:this._lastRawEndMain,a=void 0!==t?t-6e4:void 0,h=await this._fetchRawStatistics(l,d,m,n,a);if(u=h,this._statisticsHaveData(h,m)){i=void 0,e>0&&this._log("warn",`Aggregation "${f[0]}" returned no data. Using fallback "raw".`,{...n,aggregation:o}),s=o;break}e<f.length-1&&this._log("warn",`Aggregation "raw" returned no data. Trying fallback "${f[e+1]}".`,{...n,aggregation:o})}else{let r=await this._withTimeout(Y(this.hass,l,d,m,o,void 0,t),6e4,`fetchStatistics:${o}`,{...n,aggregation:o,stats:m.length});if(u=r,this._statisticsHaveData(r,m)){i=void 0,e>0&&this._log("warn",`Aggregation "${f[0]}" returned no data. Using fallback "${o}".`,{...n,aggregation:o}),s=o;break}e<f.length-1&&this._log("warn",`Aggregation "${o}" returned no data. Trying fallback "${f[e+1]}".`,{...n,aggregation:o})}}catch(e){i=e,this._log("error",`Failed to load statistics for aggregation "${o}"`,{...n,aggregation:o,error:e instanceof Error?e.message:e})}}if(y===this._activeFetchCounters[e]){let e=s??a??f[0];if(r)if(this._statisticsRangeCompare={start:h,end:c},this._statisticsPeriodCompare=e,"disabled"===e)this._metadataCompare=void 0,this._statisticsCompare=void 0,this._calculatedSeriesDataCompare=new Map,this._calculatedSeriesUnitsCompare=new Map,this._lastRawEndCompare=void 0;else{if("raw"===e){let e="raw"===a&&this._statisticsCompare?this._mergeStatistics(this._statisticsCompare,u):u,t=this._trimStatisticsToRange(e,h,c);this._metadataCompare=o,this._statisticsCompare=t,this._lastRawEndCompare=this._computeMaxEnd(t),this._rebuildCalculatedSeries(t,o,"compare")}else this._metadataCompare=o,this._statisticsCompare=u,this._lastRawEndCompare=void 0,this._rebuildCalculatedSeries(u,o,"compare");this._shouldComputeCurrentHour("compare")||(this._liveStatisticsCompare=void 0)}else if(this._statisticsRange={start:h,end:c},this._statisticsPeriod=e,"disabled"===e)this._metadata=void 0,this._statistics=void 0,this._calculatedSeriesData=new Map,this._calculatedSeriesUnits=new Map,this._chartData=[],this._chartOptions=void 0,this._unitsBySeries=new Map,this._disabledMessage=this._getDisabledMessage(),this._autoRefreshTimeout&&(clearTimeout(this._autoRefreshTimeout),this._autoRefreshTimeout=void 0),this._lastRawEndMain=void 0;else{if(this._disabledMessage=void 0,"raw"===e){let e="raw"===a&&this._statistics?this._mergeStatistics(this._statistics,u):u,t=this._trimStatisticsToRange(e,h,c);this._metadata=o,this._statistics=t,this._lastRawEndMain=this._computeMaxEnd(t),this._rebuildCalculatedSeries(t,o,"main")}else this._metadata=o,this._statistics=u,this._lastRawEndMain=void 0,this._rebuildCalculatedSeries(u,o,"main");this._scheduleAutoRefresh(),this._shouldComputeCurrentHour("main")?(this._scheduleLiveHourLoad("main"),this._scheduleNextLiveHourTick()):(this._liveStatistics=void 0,this._liveHourTimeout&&(clearTimeout(this._liveHourTimeout),this._liveHourTimeout=void 0))}}}catch(t){i=t,y===this._activeFetchCounters[e]&&(this._log("error","Failed to load statistics",{...n,error:t instanceof Error?t.message:t}),r?this._resetCompareStatistics():(this._metadata=void 0,this._statistics=void 0,this._statisticsRange=void 0,this._statisticsPeriod=void 0,this._calculatedSeriesData=new Map,this._calculatedSeriesUnits=new Map))}finally{if(y===this._activeFetchCounters[e]){b&&(this._isLoading=!1),s.inFlight=!1,s.queued&&(s.queued=!1,this._scheduleLoad(e));let t=Math.round(performance.now()-o),a=r?this._statisticsPeriodCompare:this._statisticsPeriod;this._log(i?"warn":"info","Statistics request completed",{...n,aggregation:a,durationMs:t,status:i?"error":"success"})}}}async _fetchRawStatistics(e,t,i,s,r){if(!this._config||!this.hass||!i.length)return{};let a=r?new Date(Math.max(e.getTime(),r)):e,{start:o,end:n}=this._expandRawQueryWindow(a,t),l=this._config.aggregation?.raw_options,d={};l?.significant_changes_only!==void 0&&(d.significant_changes_only=l.significant_changes_only);var h=await this._withTimeout(((e,t,i,s,r)=>{let a={type:"history/history_during_period",start_time:t.toISOString(),minimal_response:!0,no_attributes:!0};return i&&(a.end_time=i.toISOString()),r?.significant_changes_only!==void 0&&(a.significant_changes_only=r.significant_changes_only),s.length&&(a.entity_ids=s),e.callWS(a)})(this.hass,o,n,i,d),6e4,"fetchRawHistoryStates",{...s??{},raw:!0,stats:i.length});let c={};return Object.entries(h).forEach(([e,t])=>{if(!Array.isArray(t)||0===t.length){c[e]=[];return}let i=[...t].sort((e,t)=>(e.lc??e.lu??0)-(t.lc??t.lu??0)),s=new Set,r=i.map(t=>{let i,r="number"==typeof(i=t.lc??t.lu)?Math.round(1e3*i):void 0,a=(e=>{let t=e.trim().toLowerCase();if(t in q)return q[t];if(""===t||"unknown"===t||"unavailable"===t)return null;let i=Number(e);return Number.isFinite(i)?i:null})(t.s),o=t.s.trim().toLowerCase();null!==a||""===o||"unknown"===o||"unavailable"===o||s.has(o)||(console.warn(`[energy-custom-graph-card] RAW history for "${e}" contains non-numeric state "${t.s}". Rendering as empty.`),s.add(o));let n=r??Date.now();return{start:n,end:n,change:a,sum:a,mean:a,min:a,max:a,state:a}});c[e]=r}),c}_expandRawQueryWindow(e,t){if(!t)return{start:e,end:t};let i=e.getTime(),s=t.getTime(),r=Math.max(6e4,.1*Math.max(s-i,0));return{start:new Date(i-r),end:new Date(s+r)}}_getCalculationKey(e){return`calculation_${e}`}_rebuildCalculatedSeries(e,t,i="main"){let s=new Map,r=new Map;if(!this._config)return void("main"===i?(this._calculatedSeriesData=s,this._calculatedSeriesUnits=r):(this._calculatedSeriesDataCompare=s,this._calculatedSeriesUnitsCompare=r));this._config.series.forEach((a,o)=>{if(!a.calculation)return;let n=this._evaluateCalculationSeries(a,a.calculation,e,t,o,i);if(!n)return;let l=this._getCalculationKey(o);s.set(l,n.values),r.set(l,n.unit)}),"main"===i?(this._calculatedSeriesData=s,this._calculatedSeriesUnits=r):(this._calculatedSeriesDataCompare=s,this._calculatedSeriesUnitsCompare=r)}_resetCompareStatistics(){this._statisticsCompare=void 0,this._metadataCompare=void 0,this._statisticsRangeCompare=void 0,this._statisticsPeriodCompare=void 0,this._calculatedSeriesDataCompare=new Map,this._calculatedSeriesUnitsCompare=new Map}_evaluateCalculationSeries(e,t,i,s,r,a){if(!t.terms?.length)return;let o=new Set,n=[],l=new Set,d=e.name??e.statistic_id??`series_${r}`;t.terms.forEach(t=>{let r=t.multiply??1,a=t.add??0;if(t.statistic_id){let h=i?.[t.statistic_id],c=t.stat_type??e.stat_type??X.DEFAULT_STAT_TYPE,u=new Map,p=[];h?.length?(h.forEach(e=>{let i=e.end??e.start;if(void 0===i)return;let s=e[c],n="number"==typeof s&&Number.isFinite(s)?s:null,l=null===n?null:X.clampValue(n*r+a,t.clip_min,t.clip_max);u.set(i,{value:l,start:e.start,end:e.end}),p.push({timestamp:i,value:l,start:e.start,end:e.end}),o.add(i)}),p.sort((e,t)=>e.timestamp-t.timestamp)):l.has(t.statistic_id)||(console.warn(`[energy-custom-graph-card] Calculation series "${d}" references statistic "${t.statistic_id}" but no data was loaded. Missing values will be treated as zero.`),l.add(t.statistic_id)),n.push({term:t,data:u,timeline:p.length?p:void 0,unit:s?.[t.statistic_id]?.statistics_unit_of_measurement??void 0})}else{let e=X.clampValue((t.constant??0)*r+a,t.clip_min,t.clip_max);n.push({term:t,constant:e})}});let h=Array.from(o).sort((e,t)=>e-t),c=!h.length&&n.every(e=>void 0===e.term.statistic_id&&void 0!==e.constant);if(!h.length&&!c)return;let u=t.initial_value??0,p=[],m=new Set,_=!1,g=e=>{let t,i,s=u,r=!0;n.forEach(a=>{let o;if(r){if(a.data){let s=this._resolveCalculationTermValue(a,e);if(s){let r=s.start??e,a=s.end??e;void 0===t&&(t=r),void 0===i&&(i=a),o=s.value}else{o=0;let e=a.term.statistic_id;e&&!m.has(e)&&(console.warn(`[energy-custom-graph-card] Missing value for statistic "${e}" in calculation series "${d}". Using 0 for this timestamp.`),m.add(e))}}else o=a.constant??0;switch(a.term.operation??"add"){case"subtract":s-=o;break;case"multiply":s*=o;break;case"divide":0===o?(r=!1,_||(console.warn(`[energy-custom-graph-card] Division by zero encountered in calculation series "${d}". The affected timestamp will be rendered as empty.`),_=!0)):s/=o;break;default:s+=o}}});let a=r&&Number.isFinite(s)?s:null,o=t??e,l=i??e;p.push({start:o,end:l,change:a,sum:a,mean:a,min:a,max:a,state:a})};if(h.length)h.forEach(g);else if(c){let e=this._getCalculationTimeContext(a);if(e?.start){let t=new Set,s=e=>{"number"==typeof e&&Number.isFinite(e)&&(t.has(e)||(t.add(e),g(e)))},r=e.start.getTime(),a=e.end?.getTime();if(s(r),void 0!==a&&s(a),e.period&&"raw"!==e.period&&"disabled"!==e.period&&e.end){let t=this._buildBucketSequence(r,e.end.getTime(),e.period);t?.forEach(s)}Object.values(i).forEach(e=>{e?.forEach(e=>{s(e.start),s(e.end)})}),1===t.size&&void 0===a&&s(r+1)}}return{values:p,unit:t.unit??n.find(e=>void 0!==e.unit)?.unit??null}}_resolveCalculationTermValue(e,t){let i=e.data?.get(t);if(i&&"number"==typeof i.value&&Number.isFinite(i.value))return e.lastNonNull={value:i.value,start:i.start,end:i.end},{value:i.value,start:i.start,end:i.end};let s=e.timeline;if(!s||!s.length)return null;for(void 0===e.cursor&&(e.cursor=0);e.cursor<s.length&&s[e.cursor].timestamp<=t;){let t=s[e.cursor];"number"==typeof t.value&&Number.isFinite(t.value)&&(e.lastNonNull={value:t.value,start:t.start,end:t.end}),e.cursor+=1}let r=e.lastNonNull;return r?{value:r.value,start:r.start,end:r.end}:null}_getCalculationTimeContext(e){return"compare"===e?{start:this._comparePeriodStart,end:this._comparePeriodEnd,period:this._statisticsPeriodCompare}:{start:this._periodStart,end:this._periodEnd,period:this._statisticsPeriod}}_statisticsHaveData(e,t){return!t.length||t.some(t=>e?.[t]?.length)}_shouldComputeCurrentHour(e){if(!this._config?.aggregation?.compute_current_hour||"hour"!==("compare"===e?this._statisticsPeriodCompare:this._statisticsPeriod))return!1;let t="compare"===e?this._comparePeriodStart:this._periodStart,i="compare"===e?this._comparePeriodEnd:this._periodEnd;if(!t)return!1;let s=new Date;if(t>s)return!1;let r=I(s);return!i||!(i<=r)}_resolveAggregationPlan(e,t){let i=this._config?.aggregation,s=this._needsEnergyCollection(this._config),r=this._deriveAutoStatisticsPeriod(e,t),a=[],o=!1,n=e=>{!o&&e&&(a.includes(e)||a.push(e),"disabled"===e&&(o=!0))};if(s){let s=this._getEnergyPickerRangeKey(e,t);n(i?.energy_picker?.[s])}else n(i?.manual);return n(r),n(i?.fallback),a.length?a:[r]}_deriveAutoStatisticsPeriod(e,t){let i=t??new Date;if(2>=Math.max(M(i,e),0))return"5minute";let s=Math.max(E(i,e),0);return s>35?"month":s>2?"day":"hour"}_getEnergyPickerRangeKey(e,t){let i=t??new Date,s=Math.max(M(i,e),0),r=Math.max(E(i,e),0);return s<=6?"hour":r<=1?"day":r<=7?"week":r<=35?"month":"year"}static getStubConfig(){return{type:"custom:energy-custom-graph-card",series:[]}}static async getConfigElement(){return await Promise.resolve(r("c09yQ")),document.createElement("energy-custom-graph-card-editor")}setConfig(e){if(!e.series||!Array.isArray(e.series)||!e.series.length)throw Error("At least one series must be configured");e.series.forEach((e,t)=>{if(!e)return void console.warn(`[energy-custom-graph-card] Series at index ${t} is not defined and will be ignored.`);let i="string"==typeof e.statistic_id&&""!==e.statistic_id.trim(),s=!!e.calculation;if(i&&s&&console.warn(`[energy-custom-graph-card] Series at index ${t} defines both statistic_id and calculation. The statistic will be ignored.`),i||s||console.warn(`[energy-custom-graph-card] Series at index ${t} is missing both statistic_id and calculation. The series will be skipped until configured.`),s){let i=e.calculation?.terms??[];i.length||console.warn(`[energy-custom-graph-card] Calculation for series ${t} has no terms. The series will be skipped.`),i.forEach((e,i)=>{void 0===e.statistic_id&&void 0===e.constant&&console.warn(`[energy-custom-graph-card] Calculation term ${i} of series ${t} is missing both statistic_id and constant. This term will be ignored.`)})}});let t=this._config;this._config={...e,timespan:e.timespan??G,allow_compare:e.allow_compare??!0},t?.aggregation?.compute_current_hour&&!this._config.aggregation?.compute_current_hour&&(this._liveStatistics=void 0,this._liveStatisticsCompare=void 0,this._liveHourTimeout&&(clearTimeout(this._liveHourTimeout),this._liveHourTimeout=void 0)),this._loggedEnergyFallback=!1,this.requestUpdate("_config",t),this.hass&&this._syncWithConfig(t)}updated(e){super.updated(e),this._evaluateSectionLayout(),(e.has("_statistics")||e.has("_metadata")||e.has("_periodStart")||e.has("_periodEnd")||e.has("_statisticsCompare")||e.has("_metadataCompare")||e.has("_comparePeriodStart")||e.has("_comparePeriodEnd")||e.has("_config"))&&this._generateChart()}firstUpdated(e){super.firstUpdated(e),this._evaluateSectionLayout()}getCardSize(){return 5}getGridOptions(){let e=!!(this._config?.title&&this._config.title.trim().length),t=+!!((!this._config||!0!==this._config.hide_legend)&&this._config?.expand_legend);return{columns:12,min_columns:6,rows:(e?5:4)+t,min_rows:(e?4:3)+t}}_evaluateSectionLayout(){if(this.isConnected)try{let e=this.layout,t="grid"===e;this._usesSectionLayout!==t&&(this._usesSectionLayout=t)}catch(e){}}render(){if(!this.hass||!this._config)return l.nothing;let e=!!(this._config.title&&this._config.title.trim().length);return(0,l.html)`
      <ha-card>
        ${this._config.title?(0,l.html)`<h1 class="card-header">${this._config.title}</h1>`:l.nothing}
        <div class=${(0,p.classMap)({content:!0,"content--no-title":!e})}>
          ${this._renderChart()}
        </div>
      </ha-card>
    `}_renderChart(){if(this._isLoading)return(0,l.html)`<div class="placeholder">
        ${this.hass.localize?.("ui.components.statistics_charts.loading_statistics")??"Loading statistics…"}
      </div>`;let e="disabled"===this._statisticsPeriod?this._disabledMessage??this._getDisabledMessage():this._disabledMessage;if(e)return(0,l.html)`<div class="placeholder">
        ${e}
      </div>`;if(!this._chartData.some(e=>!!Array.isArray(e.data)&&e.data.some(e=>null!=e&&(Array.isArray(e)?null!==e[1]&&void 0!==e[1]:!!("object"==typeof e&&Array.isArray(e.value))&&null!==e.value[1]&&void 0!==e.value[1])))||!this._chartOptions)return(0,l.html)`<div class="placeholder">
        ${this.hass.localize?.("ui.components.statistics_charts.no_statistics_found")??"No statistics available for the selected period"}
      </div>`;let t=this._usesSectionLayout,i=t?"100%":this._config?.chart_height??"300px";return(0,l.html)`
      <div class=${t?"chart chart--section":"chart"}>
        <ha-chart-base
          .hass=${this.hass}
          .data=${this._chartData}
          .options=${this._chartOptions}
          .height=${i}
          .expandLegend=${this._config?.expand_legend}
        ></ha-chart-base>
      </div>
    `}_generateChart(){if(!this._config||!this._periodStart||!this._statistics||!this._statisticsRange){this._chartData=[],this._chartOptions=void 0,this._unitsBySeries=new Map,this._seriesConfigById=new Map;return}let e=this._periodStart.getTime(),t=this._periodEnd?.getTime()??null,i=this._statisticsRange.start,s=this._statisticsRange.end??null;if(i!==e||s!==t)return;let r=this.isConnected?getComputedStyle(this):getComputedStyle(document.documentElement),{series:a,legend:o,unitBySeries:n,seriesById:l}=(0,K.buildSeries)({hass:this.hass,statistics:this._statistics,metadata:this._metadata,configSeries:this._config.series,colorPalette:this._config.color_cycle??[],computedStyle:r,calculatedData:this._calculatedSeriesData,calculatedUnits:this._calculatedSeriesUnits}),d=new Map(l),h=new Map;n.forEach((e,t)=>h.set(t,e));let c=new Map,u=new Map,p=new Map,m=new Map,_=[],g=new Map,f=0,v=e=>{let t=e?.trim();if(t){let e=p.get(t);return e||(p.set(t,t),t)}return f+=1,`series-${f}`},y=(e,t)=>{let i=Math.max(t-3,0),s=m.get(e);if(s)return s.stack=`${e}--current`,s.z=i,s;_.push(e);let r={id:`${e}--compare-placeholder`,type:"bar",stack:`${e}--current`,data:[],silent:!0,tooltip:{show:!1},itemStyle:{color:"transparent",borderColor:"transparent",borderWidth:0},emphasis:{disabled:!0},barMaxWidth:K.BAR_MAX_WIDTH,z:i};return m.set(e,r),r};a.forEach((e,t)=>{if("bar"!==e.type)return;let i=e.id??`bar_${t}`,s=v("string"==typeof e.stack&&""!==e.stack.trim()?e.stack:void 0);u.set(i,s);let r="number"==typeof e.z&&Number.isFinite(e.z)?Math.max(e.z,10):10,a=g.has(s)?Math.max(g.get(s),r):r;e.z=a,e.stack=`${s}--current`,g.set(s,a),y(s,a)});let b=[];if(this._comparePeriodStart&&this._statisticsCompare&&this._metadataCompare&&this._statisticsRangeCompare&&this._statisticsRangeCompare.start===this._comparePeriodStart.getTime()&&(this._statisticsRangeCompare.end??null)===(this._comparePeriodEnd?.getTime()??null)){let e=(0,K.buildSeries)({hass:this.hass,statistics:this._statisticsCompare,metadata:this._metadataCompare,configSeries:this._config.series,colorPalette:this._config.color_cycle??[],computedStyle:r,calculatedData:this._calculatedSeriesDataCompare,calculatedUnits:this._calculatedSeriesUnitsCompare}),t=this._createCompareTransform(),i=e=>{let i=e=>t?t(e):e;if(Array.isArray(e)){let t=Number(e[0]);return[i(t),...e.slice(1),t]}if(e&&"object"==typeof e&&"value"in e){let t=Array.isArray(e.value)?e.value:void 0;if(!t)return e;let s=Number(t[0]),r=i(s),a=[...t];return a[0]=r,a.push(s),{...e,value:a}}return e},s=[];e.series.forEach((t,a)=>{let n=t.id??t.name??`compare_${a}`,l=`${n}--compare`,p={...t,id:l,name:`${t.name??n} (Compare)`,z:t.z},_=e.seriesById.get(n);if(!_&&n.includes("__fill_")){let t=n.replace(/__fill_(base|area)$/u,"");_=e.seriesById.get(t)}let f=_?.compare_color?.trim(),b=f&&""!==f?this._resolveColorToken(f,r):void 0;if(Array.isArray(p.data)?p.data=p.data.map(i):p.data&&(p.data=p.data?.map(i)),"bar"===p.type){let e=u.get(n);e||(e=v("string"==typeof t.stack&&""!==t.stack.trim()?t.stack:void 0),u.set(n,e),g.set(e,10),y(e,10));let i="number"==typeof t.z&&Number.isFinite(t.z)?Math.max(t.z,10):10,r=g.get(e),a=r?Math.max(r,i):i;g.set(e,a),y(e,a);let o=m.get(e);o&&(o.stack=`${e}--compare`,o.z=Math.max(a-3,0)),p.stack=`${e}--compare`,p.z=Math.max(a,10),this._styleCompareSeries(p,b),s.push(p)}else t.stack&&""!==t.stack.trim()?p.stack=`${t.stack.trim()}--compare`:p.stack=`${l}--stack`,this._styleCompareSeries(p,b),s.push(p);h.set(l,e.unitBySeries.get(n)),_&&d.set(l,_);let $=o.find(e=>e.id===(t.id??n))?.id;if($){let e=c.get($)??[];e.push(l),c.set($,e)}}),b=s}let $=[..._.map(e=>m.get(e)).filter(e=>void 0!==e),...b,...a];this._seriesConfigById=new Map(d);let S=this._periodEnd?.getTime()??this._statisticsRange.end??null,x=this._buildBucketSequence(e,S,this._statisticsPeriod);x?.length&&this._normalizeLineSeries($,x);let w="raw"===this._statisticsPeriod,C="raw"===this._statisticsPeriodCompare;if(this._extendLineSeriesToNow($,d,S,w,C),this._applyBarStyling($,x),!$.length){this._chartData=[],this._chartOptions=void 0,this._unitsBySeries=new Map;return}let{yAxis:A,axisUnitByIndex:T}=this._buildYAxisOptions(d,$);this._unitsBySeries=new Map,$.forEach(e=>{let t=e.yAxisIndex??0,i=T.get(t)??(this._config?.show_unit===!1?void 0:h.get(e.id??""));this._unitsBySeries.set(e.id??"",i)});let E=this._buildLegendOption(o,c),k=this._periodEnd?this._computeSuggestedXAxisMax(this._periodStart,this._periodEnd):this._statisticsRange.end??this._periodStart.getTime(),M=[{id:"primary",type:"time",min:this._periodStart,max:k},{id:"secondary",type:"time",show:!1}],N=e=>this._renderTooltip(e),P={xAxis:M,yAxis:A,grid:{top:15,left:1,right:1,bottom:0,containLabel:!0},tooltip:{trigger:"axis",appendTo:document.body,formatter:N,axisPointer:{type:"cross"}}};E&&(P.legend=E);let D=Array.isArray(this._chartData)&&this._chartData.length>0,R=(w||C)&&!D;if(this._chartOptions=P,R){let e=this._createZeroSeriesSnapshot($);this._chartData=e,this._scheduleRawAnimationCommit($);return}void 0!==this._rawAnimationFrame&&(cancelAnimationFrame(this._rawAnimationFrame),this._rawAnimationFrame=void 0),this._chartData=$}_computeSuggestedXAxisMax(e,t){let i=E(t,e),s=new Date(t);return i>2&&0===s.getHours()&&(s=V(s,1)),i>2&&s.setMinutes(0,0,0),i>35&&s.setDate(1),i>2&&s.setHours(0),s.getTime()}_normalizeLineSeries(e,t){t.length&&e.forEach((e,i)=>{if("line"!==e.type||!Array.isArray(e.data))return;let s=new Map;e.data.forEach(e=>{if(Array.isArray(e)){let t=Number(e[0]);if(!Number.isFinite(t))return;let i=e.length>1&&"number"==typeof e[1]?e[1]:(e[1],null);s.set(t,i);return}if(e&&"object"==typeof e){let t=Array.isArray(e.value)?e.value:void 0;if(!t)return;let i=Number(t[0]);if(!Number.isFinite(i))return;let r=t.length>1&&"number"==typeof t[1]?t[1]:(t[1],null);s.set(i,r)}}),e.data=t.map(e=>{let t=s.has(e)?s.get(e):null;return[e,t??null]})})}_extendLineSeriesToNow(e,t,i,s,r){let a=Date.now();e.forEach(e=>{if("line"!==e.type||!Array.isArray(e.data)||!e.data.length)return;let o="string"==typeof e.id?e.id:void 0,n=o?t.get(o):void 0,l=n?.chart_type??this._inferChartTypeFromSeriesId(o),d=!!o&&o.endsWith("--compare"),h=this._castSeriesDataPoints(e.data);if(!h)return;if("step"===l){let e=d?this._comparePeriodEnd?.getTime()??this._statisticsRangeCompare?.end??i:i,t=Math.min("number"==typeof e?e:a,a);this._extendStepSeriesToLimit(h,t);return}let c=d?this._statisticsRangeCompare?.end??i:i;("line"===l||void 0===l)&&null!==c&&!(c<=a)&&(d&&r||!d&&s)&&this._extendRawLineSeriesToNow(h,a)})}_extendRawLineSeriesToNow(e,t){let i=-1,s=null;for(let r=e.length-1;r>=0;r--){let[a,o]=e[r];if(!(a>t)&&"number"==typeof o&&Number.isFinite(o)){i=r,s=o;break}}if(-1!==i&&null!==s){for(let r=i+1;r<e.length;r++){let i=e[r];if(i[0]>t)break;null===i[1]&&(i[1]=s)}if(!e.some(e=>1e3>=Math.abs(e[0]-t))){let i=e.findIndex(e=>e[0]>t),r=[t,s];-1===i?e.push(r):e.splice(i,0,r)}}}_extendStepSeriesToLimit(e,t){if(!Number.isFinite(t)||!e.length)return;let i=-1;for(let s=e.length-1;s>=0;s--){let[r,a]=e[s];if(!(r>t)&&"number"==typeof a&&Number.isFinite(a)){i=s;break}}if(-1===i)return;let s=e[i][0],r=e[i][1];if(t<=s||"number"!=typeof r||!Number.isFinite(r))return;for(let s=i+1;s<e.length;s++){let i=e[s];if(i[0]>t)break;null===i[1]&&(i[1]=r)}let a=e.findIndex(([e])=>e>=t);-1===a?e.push([t,r]):e[a][0]===t?null===e[a][1]&&(e[a][1]=r):e.splice(a,0,[t,r])}_scheduleRawAnimationCommit(e){void 0!==this._rawAnimationFrame&&cancelAnimationFrame(this._rawAnimationFrame),this._rawAnimationFrame=requestAnimationFrame(()=>{this._rawAnimationFrame=void 0,this._chartData=e})}_createZeroSeriesSnapshot(e){let t=this._cloneSeries(e);return t.forEach(e=>{if(Array.isArray(e.data)){if("line"===e.type){e.data=e.data.map(([e,t])=>[e,null===t?null:0]);return}"bar"===e.type&&(e.data=e.data.map(e=>{if(Array.isArray(e))return[e[0],null===(e.length>1&&"number"==typeof e[1]?e[1]:(e[1],null))?null:0];if(e&&"object"==typeof e&&"value"in e){let t={...e},i=Array.isArray(t.value)?t.value:void 0;if(i){let[e,s]=i;t.value=[e,null===s?null:0]}return t}return e}))}}),t}_cloneSeries(e){return"function"==typeof structuredClone?structuredClone(e):JSON.parse(JSON.stringify(e))}_computeMaxEnd(e){let t;if(e)return Object.values(e).forEach(e=>{e?.forEach(e=>{let i=e.end??e.start;"number"==typeof i&&(t=void 0===t?i:Math.max(t,i))})}),t}_mergeStatistics(e,t){if(!e)return t;let i={...e};return Object.entries(t).forEach(([e,t])=>{let s=i[e];if(!s||!s.length){i[e]=t;return}let r=new Map,a=[...s];a.forEach((e,t)=>{let i=e.end??e.start??t;r.set(i,t)}),t.forEach(e=>{let t=e.end??e.start??Math.random(),i=r.get(t);void 0!==i?a[i]=e:(a.push(e),r.set(t,a.length-1))}),a.sort((e,t)=>(e.end??e.start??0)-(t.end??t.start??0)),i[e]=a}),i}_trimStatisticsToRange(e,t,i){let s={};return Object.entries(e).forEach(([e,r])=>{s[e]=r.filter(e=>{let s=e.start??e.end,r=e.end??e.start;return void 0!==s&&void 0!==r&&(null===i||!(s>i))&&!(r<t)})}),s}_castSeriesDataPoints(e){if(!Array.isArray(e))return null;for(let t of e)if(!Array.isArray(t)||t.length<2||"number"!=typeof t[0])return null;return e}_inferChartTypeFromSeriesId(e){if(!e)return;let t=(e.endsWith("--compare")?e.slice(0,-9):e).split(":");if(t.length>=3){let e=t[2];if("bar"===e||"line"===e||"step"===e)return e}}_createCompareTransform(){if(!this._periodStart||!this._comparePeriodStart)return;let e=this._periodStart,t=this._comparePeriodStart,i=H(e,t);if(0!==i&&e.getTime()===B(e).getTime())return e=>w(new Date(e),i).getTime();let s=R(e,t);if(0!==s&&e.getTime()===z(e).getTime())return e=>S(new Date(e),s).getTime();let r=E(e,t);if(0!==r&&e.getTime()===A(e).getTime())return e=>v(new Date(e),r).getTime();let a=e.getTime()-t.getTime();return e=>e+a}_applyBarStyling(e,t){let i=e.filter(e=>"bar"===e.type);if(!i.length)return;let s=new Set;t?.forEach(e=>s.add(e)),i.forEach(e=>{Array.isArray(e.data)&&(e.data=e.data.map(e=>{if(Array.isArray(e)){let t=Number(e[0]);return s.add(t),{value:[t,e[1]]}}if(e&&"object"==typeof e&&"value"in e){let t=Array.isArray(e.value)?e.value:void 0;if(t){let i=Number(t[0]);return s.add(i),{...e,value:[i,t[1]]}}return{...e}}let t=Number(e);return s.add(t),{value:[t,0]}}))});let r=Array.from(s).sort((e,t)=>e-t);i.forEach(e=>{let t={...e.itemStyle??{}},i=new Map;e.data?.forEach(e=>{let s=Array.isArray(e?.value)?e.value:void 0;if(!s)return;let r=Number(s[0]);i.set(r,{...e,value:[r,s[1]],itemStyle:{...t,...e.itemStyle??{}}})}),e.data=r.map(e=>{let s=i.get(e);return s||{value:[e,0],itemStyle:{...t,borderWidth:0,borderRadius:[0,0,0,0]}}}),e.itemStyle={...t},e.barMaxWidth=e.barMaxWidth??K.BAR_MAX_WIDTH}),r.forEach((e,t)=>{let s=new Set,r=new Set;for(let e=i.length-1;e>=0;e--){let a=i[e],o=a.data[t],n=Array.isArray(o?.value)?o.value:void 0,l=n?Number(n[1]??0):0,d=a.stack??`__stack_${e}`,h={...a.itemStyle??{},...o?.itemStyle??{}};if(n){if(Array.isArray(h.borderRadius)||(h.borderRadius=[0,0,0,0]),!l){h.borderWidth=0,h.borderRadius=[0,0,0,0],o.itemStyle=h;continue}l>0?s.has(d)?h.borderRadius=[0,0,0,0]:(h.borderRadius=[4,4,0,0],s.add(d)):l<0&&(r.has(d)?h.borderRadius=[0,0,0,0]:(h.borderRadius=[0,0,4,4],r.add(d))),o.itemStyle=h,a.data[t]=o}}})}_styleCompareSeries(e,t){if(t&&""!==t.trim()){let i=t.trim();if("bar"===e.type){let t="object"==typeof e.itemStyle?e.itemStyle.color:void 0,s=X._colorWithAlpha(i,X._extractAlpha(t))??i,r={...e.itemStyle??{},color:s,borderColor:s};e.itemStyle=r,e.color=s;let a={...e.emphasis?.itemStyle??{},color:s};e.emphasis={...e.emphasis??{},itemStyle:a}}else{let t="object"==typeof e.lineStyle?e.lineStyle.color:void 0,s=X._colorWithAlpha(i,X._extractAlpha(t))??i;e.color=s,e.lineStyle={...e.lineStyle??{},color:s};let r="object"==typeof e.itemStyle?e.itemStyle.color:void 0,a=X._colorWithAlpha(i,X._extractAlpha(r))??i;e.itemStyle={...e.itemStyle??{},color:a};let o={...e.emphasis?.itemStyle??{},color:s};if(e.emphasis={...e.emphasis??{},itemStyle:o},e.areaStyle){let t={...e.areaStyle},s=t.color;t.color=X._colorWithAlpha(i,X._extractAlpha(s))??i,e.areaStyle=t}e.connectNulls=!1}}else if("bar"===e.type){let t={...e.itemStyle??{},opacity:.6};e.itemStyle=t;let i={...e.emphasis?.itemStyle??{},opacity:.8};e.emphasis={...e.emphasis??{},itemStyle:i}}else{if(e.lineStyle={...e.lineStyle??{},opacity:.6},e.itemStyle={...e.itemStyle??{},opacity:.6},e.areaStyle){let t=e.areaStyle.opacity??.3;e.areaStyle={...e.areaStyle??{},opacity:.6*t}}e.connectNulls=!1}let i=(e.z??0)-1;e.z=i<0?0:i}_resolveColorToken(e,t){if(!e)return;let i=e.trim();if(!i)return;if(i.startsWith("#")||i.startsWith("rgb"))return i;if(i.startsWith("var(")&&i.endsWith(")")&&(i=i.slice(4,-1).trim()),i.startsWith("--")){let e=t.getPropertyValue(i)?.trim();return e||i}let s=t.getPropertyValue(i)?.trim();return s||i}static _extractAlpha(e){if("string"!=typeof e)return;let t=e.trim(),i=t.match(/rgba?\(([^)]+)\)/i);if(i){let e=i[1].split(",").map(e=>e.trim());if(4===e.length){let t=Number(e[3]);return Number.isFinite(t)?t:void 0}if(3===e.length)return 1}if(t.startsWith("#")){let e=t.slice(1);if(8===e.length)return parseInt(e.slice(6,8),16)/255;if(4===e.length)return parseInt(e.slice(3,4).repeat(2),16)/255}}static _colorWithAlpha(e,t){if(void 0===t||t>=1)return e;let i=X._parseColor(e);return i?`rgba(${i.r}, ${i.g}, ${i.b}, ${t})`:e}static _parseColor(e){let t=e.trim(),i=t.match(/rgba?\(([^)]+)\)/i);if(i){let e=i[1].split(",").map(e=>Number(e.trim()));return e.length>=3?{r:Math.round(e[0]),g:Math.round(e[1]),b:Math.round(e[2])}:void 0}if(!t.startsWith("#"))return;let s=t.slice(1);if(3===s.length||4===s.length){let e=parseInt(s[0]+s[0],16);return{r:e,g:parseInt(s[1]+s[1],16),b:parseInt(s[2]+s[2],16)}}if(6===s.length||8===s.length){let e=parseInt(s.substring(0,2),16);return{r:e,g:parseInt(s.substring(2,4),16),b:parseInt(s.substring(4,6),16)}}}_buildBucketSequence(e,t,i){if(null===t||void 0===i||"raw"===i||"disabled"===i)return;if(t<e)return[e];let s=[],r=this._alignBucketStart(e,i),a=new Date(t),o=0;for(;r.getTime()<=a.getTime()&&o<2e5;){s.push(r.getTime());let e=this._advanceBucket(r,i);if(e.getTime()===r.getTime())break;r=e,o++}return s}_advanceBucket(e,t){switch(t){case"5minute":return $(e,5);case"hour":default:return b(e,1);case"day":return v(e,1);case"week":return x(e,1);case"month":return S(e,1)}}_alignBucketStart(e,t){let i=new Date(e);switch(t){case"5minute":{let e=5*Math.floor(i.getMinutes()/5);return i.setSeconds(0,0),i.setMinutes(e),i}case"hour":default:return i.setMinutes(0,0,0),i;case"day":return A(i);case"week":return j(i);case"month":return z(i)}}_buildLegendOption(e,t){if(!e.length)return;let i=this._config?.legend_sort??"none",s=[...e];("asc"===i||"desc"===i)&&s.sort((e,t)=>{let s=e.name.localeCompare(t.name);return"asc"===i?s:-s});let r=s.map(e=>({id:e.id,name:e.name,secondaryIds:t.get(e.id)??[],itemStyle:e.fillColor||e.color||e.borderColor?{color:e.fillColor??e.color,borderColor:e.borderColor??e.color,borderWidth:e.borderWidth??(e.borderColor?2:1)}:void 0})),a={};return s.forEach(e=>{let i=!e.hidden;a[e.id]=i;let s=t.get(e.id);s?.forEach(e=>{a[e]=i})}),{type:"custom",show:!this._config?.hide_legend,data:r,selected:a}}_buildYAxisOptions(e,t){let i=this._config?.y_axes??[],s=i.find(e=>"left"===e.id),r=i.find(e=>"right"===e.id),a=!!r||Array.from(e.values()).some(e=>"right"===e.y_axis),o=new Map,n=[],l=(e,i)=>{let s=e?.fit_y_data??!1,r=e?.center_zero??!1,a=e?.logarithmic_scale??!1;o.set(i,e?.unit);let n=e?.min,l=e?.max;if(r)if(void 0!==l)n=-l;else{let e=(e=>{let i=t.filter(t=>(t.yAxisIndex??0)===e);if(!i.length)return;let s=e=>{if(Array.isArray(e))return e[1];if("number"==typeof e)return e;if(e&&"object"==typeof e&&"value"in e){let t=e.value;if(Array.isArray(t))return t[1];if("number"==typeof t)return t}return null},r=new Map,a=[];i.forEach(e=>{let t=e.stack;t?(r.has(t)||r.set(t,[]),r.get(t).push(e)):a.push(e)});let o=1/0,n=-1/0;if(a.forEach(e=>{Array.isArray(e.data)&&e.data.forEach(e=>{let t=s(e);"number"==typeof t&&!Number.isNaN(t)&&Number.isFinite(t)&&(o=Math.min(o,t),n=Math.max(n,t))})}),r.forEach(e=>{let t=new Map;e.forEach(e=>{Array.isArray(e.data)&&e.data.forEach(e=>{let i=(e=>{if(Array.isArray(e))return e[0];if(e&&"object"==typeof e&&"value"in e){let t=e.value;if(Array.isArray(t))return t[0]}return null})(e),r=s(e);if(null!==i&&"number"==typeof r&&!Number.isNaN(r)&&Number.isFinite(r)){let e=t.get(i)??{positive:0,negative:0};r>=0?e.positive+=r:e.negative+=r,t.set(i,e)}})}),t.forEach(({positive:e,negative:t})=>{o=Math.min(o,t),n=Math.max(n,e)})}),Number.isFinite(o)&&Number.isFinite(n))return{min:o,max:n}})(i);if(e){let t=(e=>{if(0===e)return 1;let t=Math.pow(10,Math.floor(Math.log10(Math.abs(e)))),i=Math.abs(e)/t;return([1,1.2,1.5,2,2.5,3,4,5,6,8,10].find(e=>e>=i)??10)*t})(Math.max(Math.abs(e.min),Math.abs(e.max)));n=-t,l=t}}return{type:a?"log":"value",name:e?.unit,nameGap:2*!!e?.unit,nameTextStyle:{align:"left"},position:0===i?"left":"right",min:n,max:l,splitLine:{show:!0},axisLabel:{formatter:e=>this._formatNumber(e)},scale:s}};return n.push(l(s,0)),a&&n.push(l(r,1)),{yAxis:n,axisUnitByIndex:o}}_renderTooltip(e){let t,i;if(!Array.isArray(e)||!e.length)return"";let s=this._config?.tooltip_precision??2,r=this._config?.show_stack_sums===!0,a=e=>{let t=e.value??e.data??e?.value?.value;if(Array.isArray(t)){let e=Number(t[0]),i=t.length>1&&"number"==typeof t[1]?t[1]:null,s=t.length>2&&"number"==typeof t[t.length-1]?t[t.length-1]:void 0;return{display:e,value:i,original:void 0!==s&&s!==e?s:void 0}}if("number"==typeof t)return{display:Number(e.axisValue??e.axisValueLabel??0),value:t};if(t&&Array.isArray(t.value)){let e=t.value,i=Number(e[0]),s=e.length>1&&"number"==typeof e[1]?e[1]:null,r=e.length>2&&"number"==typeof e[e.length-1]?e[e.length-1]:void 0;return{display:i,value:s,original:void 0!==r&&r!==i?r:void 0}}},o=e=>{if("number"==typeof e)return Number.isFinite(e)?new Date(e):void 0;if("string"==typeof e){let t=Date.parse(e);if(!Number.isNaN(t))return new Date(t)}},n=a(e[0]),l=n?o(n.display):void 0,d=l?`<strong>${this._formatDateTime(l)}</strong>`:"",h=new Set,c=new Map,u={main:{header:void 0,lines:[],totals:[]},compare:{header:void 0,lines:[],totals:[]}};if(e.forEach((e,n)=>{let l=("string"==typeof e.seriesId?e.seriesId:void 0)??("string"==typeof e.seriesName?e.seriesName:void 0)??("number"==typeof e.seriesIndex?String(e.seriesIndex):void 0)??String(n);if(h.has(l))return;h.add(l);let d=this._seriesConfigById.get(l);if(d?.show_in_tooltip===!1)return;let p=a(e);if(!p)return;let{display:m,value:_,original:g}=p;if(null==_||Number.isNaN(_))return;let f=l.endsWith("--compare"),v=f?"compare":"main";f&&(void 0===t&&(t=m),void 0!==g&&void 0===i&&(i=g));let y=this._config?.show_unit===!1?void 0:this._unitsBySeries.get(l),b=this._formatNumber(_,{maximumFractionDigits:s}),$=y?` ${y}`:"",S="string"==typeof e.marker?e.marker:e.color?`<span style="display:inline-block;margin-right:4px;border-radius:50%;width:8px;height:8px;background:${e.color}"></span>`:"";if(u[v].lines.push(`${S} ${e.seriesName??""}: ${b}${$}`),f&&void 0!==g&&!u.compare.header){let e=o(g);e&&(u.compare.header=`<strong>${this._formatDateTime(e)}</strong>`)}if(r){let e=d?.stack?.trim();if(!e||e.startsWith("__energy_fill_"))return;let t=`${f?"compare":"main"}::${e}`,i=c.get(t)??{name:e,positive:0,negative:0,count:0,unit:y,isCompare:f};void 0===i.unit&&void 0!==y&&(i.unit=y),i.count+=1,_>0?i.positive+=_:_<0&&(i.negative+=_),c.set(t,i)}}),r&&c.size&&c.forEach(e=>{if(e.count<2)return;let t=e.unit&&this._config?.show_unit!==!1?` ${e.unit}`:"",i=e=>this._formatNumber(e,{maximumFractionDigits:s}),r=e.isCompare?" (Compare)":"",a=e.isCompare?"compare":"main";e.positive>0&&u[a].totals.push(`<strong>Total ${e.name}${r} (pos): ${i(e.positive)}${t}</strong>`),e.negative<0&&u[a].totals.push(`<strong>Total ${e.name}${r} (neg): ${i(e.negative)}${t}</strong>`)}),!u.compare.header){let e=void 0!==i?i:void 0!==t?this._computeCompareOriginalTimestamp(t):void 0;if(void 0!==e){let t=o(e);t&&(u.compare.header=`<strong>${this._formatDateTime(t)}</strong>`)}}let p=e=>{let t=[];if(u[e].header&&t.push(u[e].header),u[e].lines.length&&t.push(u[e].lines.join("<br>")),u[e].totals.length&&t.push(u[e].totals.join("<br>")),t.length)return t.join("<br>")},m=[],_=p("main"),g=p("compare");if(_&&m.push(_),g&&m.push(g),!m.length)return d||"";let f=m.join("<br><br>");return d?`${d}<br>${f}`:f}_computeCompareOriginalTimestamp(e){if(!this._periodStart||!this._comparePeriodStart)return;let t=this._periodStart,i=this._comparePeriodStart,s=H(t,i);if(0!==s&&t.getTime()===B(t).getTime())return w(new Date(e),-s).getTime();let r=R(t,i);if(0!==r&&t.getTime()===z(t).getTime())return S(new Date(e),-r).getTime();let a=E(t,i);return 0!==a&&t.getTime()===A(t).getTime()?v(new Date(e),-a).getTime():e-(t.getTime()-i.getTime())}_formatNumber(e,t){let i=this.hass?.locale?.language??"en-US";return new Intl.NumberFormat(i,{maximumFractionDigits:2,...t}).format(e)}_formatDateTime(e){let t=this.hass?.locale?.language??"en-US",i=this.hass?.locale,s=i?.time_zone;"server"===s&&(s=this.hass?.config?.time_zone),s&&"local"!==s&&"system"!==s||(s=void 0);try{return new Intl.DateTimeFormat(t,{year:"numeric",month:"short",day:"numeric",hour:"numeric",minute:"2-digit",timeZone:s}).format(e)}catch(t){return e.toLocaleString()}}_log(e,t,i){let s={debug:0,info:1,warn:2,error:3};if(s[e]<s.warn)return;let r=(console[e]??console.log).bind(console);i&&Object.keys(i).length?r(`${Q} ${t}`,i):r(`${Q} ${t}`)}static{this.styles=(0,n.css)`
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
  `}constructor(...e){super(...e),this._isLoading=!1,this._chartData=[],this._usesSectionLayout=!1,this._unitsBySeries=new Map,this._loggedEnergyFallback=!1,this._calculatedSeriesData=new Map,this._calculatedSeriesUnits=new Map,this._calculatedSeriesDataCompare=new Map,this._calculatedSeriesUnitsCompare=new Map,this._seriesConfigById=new Map,this._fetchStates=new Map,this._activeFetchCounters={main:0,compare:0,main_live:0,compare_live:0},this._isPageVisible="undefined"==typeof document||"hidden"!==document.visibilityState,this._visibilityQueuedLoads=new Set,this._visibilityListenerAttached=!1,this._handleVisibilityChange=()=>{let e="undefined"==typeof document||"hidden"!==document.visibilityState;this._isPageVisible!==e&&(this._isPageVisible=e,e?(this._log("info","Document visible; scheduling refresh",{hidden:!1}),this._scheduleVisibilityResume()):(this._log("info","Document hidden; pausing scheduled refresh",{hidden:!0}),this._pauseVisibilityTimers()))}}}(0,o.__decorate)([(0,c.property)({attribute:!1})],X.prototype,"hass",void 0),(0,o.__decorate)([(0,u.state)()],X.prototype,"_config",void 0),(0,o.__decorate)([(0,u.state)()],X.prototype,"_statistics",void 0),(0,o.__decorate)([(0,u.state)()],X.prototype,"_metadata",void 0),(0,o.__decorate)([(0,u.state)()],X.prototype,"_periodStart",void 0),(0,o.__decorate)([(0,u.state)()],X.prototype,"_periodEnd",void 0),(0,o.__decorate)([(0,u.state)()],X.prototype,"_comparePeriodStart",void 0),(0,o.__decorate)([(0,u.state)()],X.prototype,"_comparePeriodEnd",void 0),(0,o.__decorate)([(0,u.state)()],X.prototype,"_statisticsCompare",void 0),(0,o.__decorate)([(0,u.state)()],X.prototype,"_metadataCompare",void 0),(0,o.__decorate)([(0,u.state)()],X.prototype,"_isLoading",void 0),(0,o.__decorate)([(0,u.state)()],X.prototype,"_chartData",void 0),(0,o.__decorate)([(0,u.state)()],X.prototype,"_chartOptions",void 0),(0,o.__decorate)([(0,u.state)()],X.prototype,"_disabledMessage",void 0),(0,o.__decorate)([(0,u.state)()],X.prototype,"_usesSectionLayout",void 0),X=(0,o.__decorate)([(0,h.customElement)("energy-custom-graph-card")],X),r("c09yQ"),window.customCards=window.customCards||[],window.customCards.push({type:"energy-custom-graph-card",name:"Energy Custom Graph",description:"Flexible energy statistics chart with custom stacking, axes, and colors."});
//# sourceMappingURL=energycustomgraph.js.map

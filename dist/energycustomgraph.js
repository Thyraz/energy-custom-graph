let e;function t(e,t,i,r){Object.defineProperty(e,t,{get:i,set:r,enumerable:!0,configurable:!0})}var i=globalThis,r={},s={},a=i.parcelRequirec4e1;null==a&&((a=function(e){if(e in r)return r[e].exports;if(e in s){var t=s[e];delete s[e];var i={id:e,exports:{}};return r[e]=i,t.call(i.exports,i,i.exports),i.exports}var a=Error("Cannot find module '"+e+"'");throw a.code="MODULE_NOT_FOUND",a}).register=function(e,t){s[e]=t},i.parcelRequirec4e1=a);var o=a.register;o("c09yQ",function(e,i){t(e.exports,"EnergyCustomGraphCardEditor",()=>k);var r=a("hAmm6");a("fUwgm");var s=a("bBTYI"),o=a("iKGUH"),n=a("2cNIw");a("UE69e");var l=a("esbW4"),d=a("9z3oa"),c=a("ddM75"),h=a("e973t"),u=a("glq8a"),p=a("hFSrI"),_=a("2PP5g"),m=a("8elkP");let g=[{label:"Grid Import • Blue",value:"--energy-grid-consumption-color"},{label:"Grid Export • Purple",value:"--energy-grid-return-color"},{label:"Solar • Orange",value:"--energy-solar-color"},{label:"Battery In • Pink",value:"--energy-battery-in-color"},{label:"Battery Out • Teal",value:"--energy-battery-out-color"},{label:"Gas • Dark Red",value:"--energy-gas-color"},{label:"Water • Cyan",value:"--energy-water-color"},{label:"Non-Fossil • Green",value:"--energy-non-fossil-color"}],f=[{value:"change",label:"Change"},{value:"sum",label:"Sum"},{value:"mean",label:"Mean"},{value:"min",label:"Min"},{value:"max",label:"Max"},{value:"state",label:"State"}],v=[{value:"5minute",label:"5 minute"},{value:"hour",label:"Hour"},{value:"day",label:"Day"},{value:"week",label:"Week"},{value:"month",label:"Month"},{value:"year",label:"Year"},{value:"disabled",label:"Disable fetching"},{value:"raw",label:"RAW history"}],y=[{value:"hour",label:"Hour"},{value:"day",label:"Day"},{value:"week",label:"Week"},{value:"month",label:"Month"},{value:"year",label:"Year"}],S=[{value:"sum",label:"Sum"},{value:"mean",label:"Mean"},{value:"min",label:"Min"},{value:"max",label:"Max"},{value:"first",label:"First"},{value:"last",label:"Last"}],b=[{value:"signed",label:"Signed"},{value:"positive",label:"Positive only"},{value:"negative",label:"Negative only"},{value:"absolute",label:"Absolute"}],x=new Set(y.map(e=>e.value)),$=e=>"string"==typeof e&&x.has(e),w=new Set(["hour","day","week","month","year"]),C=e=>w.has(e),T="__default__",E="__custom__",M="__inherit__",A=new Set(["source","style","visibility","transform"]);class k extends n.LitElement{async connectedCallback(){super.connectedCallback(),this._preloadEditorElements(),this._loadSolarProductionOptions()}updated(e){super.updated(e),e.has("hass")&&(this._loadSolarProductionOptions(),this._config&&this._ensureStatisticMetadataForConfig(this._config))}async _preloadEditorElements(){let e=!customElements.get("ha-entity-picker"),t=!customElements.get("ha-state-icon"),i=!customElements.get("ha-expansion-panel"),r=!customElements.get("ha-button-toggle-group"),s=!customElements.get("ha-button")||!customElements.get("ha-icon-button")||!customElements.get("ha-sortable");if(e||t||i||r||s)try{let a=await window.loadCardHelpers(),o=[];(e||t)&&o.push(this._preloadCardEditor(a,{type:"entities",entities:[]})),(i||r||s)&&o.push(this._preloadCardEditor(a,{type:"tile",entity:"sensor.energy_custom_graph_preload"})),await Promise.allSettled(o),r&&await this._preloadButtonToggleGroup(),this.requestUpdate()}catch(e){console.debug("Energy Custom Graph: Could not preload editor elements",e)}}async _preloadCardEditor(e,t){let i=await e.createCardElement(t);await i.constructor.getConfigElement()}async _preloadButtonToggleGroup(){if(customElements.get("ha-button-toggle-group")||!this.hass||!customElements.get("ha-selector"))return;let e=document.createElement("ha-selector");e.hass=this.hass,e.selector={button_toggle:{options:[{value:"a",label:"A"},{value:"b",label:"B"}]}},e.value="a",e.required=!1,e.style.display="none",e.style.position="absolute",e.style.pointerEvents="none",this.appendChild(e);let t=customElements.whenDefined("ha-button-toggle-group").then(()=>this.requestUpdate());try{await Promise.race([t,new Promise(e=>setTimeout(e,1e3))])}finally{e.remove()}}async _loadSolarProductionOptions(){if(this.hass){this._solarOptionsLoading=!0;try{let e=await (0,p.fetchEnergyPreferences)(this.hass),t=[];e.energy_sources?.forEach(e=>{if(e?.type!=="solar"||"string"!=typeof e.stat_energy_from)return;let i=e.stat_energy_from;if(!i)return;let r=this._formatPvProductionLabel(i),s=!!Array.isArray(e.config_entry_solar_forecast)&&e.config_entry_solar_forecast.length>0;t.push({value:i,label:r,hasForecast:s})}),this._solarProductionOptions=t,this._solarOptionsError=void 0}catch(e){this._solarOptionsError=e instanceof Error?e.message:String(e),this._solarProductionOptions=[]}finally{this._solarOptionsLoading=!1}}}_formatPvProductionLabel(e){if(!e)return"";let t=this.hass?.states?.[e]?.attributes?.friendly_name;return t&&t.trim().length?`${t} (${e})`:e}_collectStatisticIds(e){let t=new Set;return(e.series??[]).forEach(e=>{if("statistic"===this._resolveSeriesSource(e)){let i=(0,m.normalizeStatisticId)(e.statistic_id);i&&t.add(i)}e.calculation?.terms?.forEach(e=>{let i=(0,m.normalizeStatisticId)(e.statistic_id);i&&t.add(i)})}),Array.from(t)}async _ensureStatisticMetadataForConfig(e){await this._ensureStatisticMetadata(this._collectStatisticIds(e))}async _ensureStatisticMetadata(e){if(!this.hass)return;let t=e.map(e=>e.trim()).filter(e=>e&&!this._metadataByStatisticId.has(e)&&!this._metadataRequests.has(e));if(t.length){t.forEach(e=>this._metadataRequests.add(e));try{let e=await (0,_.getStatisticMetadata)(this.hass,t),i=new Map;e.forEach(e=>{i.set(e.statistic_id,e)});let r=new Map(this._metadataByStatisticId);t.forEach(e=>r.set(e,i.get(e))),this._metadataByStatisticId=r}catch(e){console.debug("Energy Custom Graph: Could not load statistic metadata",e)}finally{t.forEach(e=>this._metadataRequests.delete(e))}}}_getStatisticMetadata(e){let t=(0,m.normalizeStatisticId)(e);return t?this._metadataByStatisticId.get(t):void 0}_isStatisticMetadataLoaded(e){let t=(0,m.normalizeStatisticId)(e);return!t||this._metadataByStatisticId.has(t)}_resolveStatisticSource(e){let t=(0,m.normalizeStatisticId)(e);return(0,m.resolveStatisticSourceStatus)({statisticId:t,hasEntity:!!(t&&this.hass?.states?.[t]),metadata:this._getStatisticMetadata(t),metadataLoaded:this._isStatisticMetadataLoaded(t)})}_resolveSeriesSource(e){return(0,m.resolveSeriesSource)(e)}_renderTextInput({label:e,value:t,helper:i,type:r="text",step:s,min:a,max:n,disabled:l=!1,onInput:d}){return(0,o.html)`
      <div class="field native-text-input">
        <label>${e}</label>
        <input
          .type=${r}
          .value=${t}
          .step=${s??""}
          .min=${a??""}
          .max=${n??""}
          ?disabled=${l}
          @input=${e=>{d(e.target.value??"",e)}}
        />
        ${i?(0,o.html)`<span class="hint">${i}</span>`:o.nothing}
      </div>
    `}_renderColorTextInput({label:e,value:t,onInput:i}){let r=this._toNativeColorValue(t);return(0,o.html)`
      <div class="field native-text-input">
        <label>${e}</label>
        <div class="color-text-control">
          <input
            class="color-value-input"
            type="text"
            .value=${t}
            @input=${e=>{i(e.target.value??"",e)}}
          />
          <input
            class="color-picker-input"
            type="color"
            .value=${r}
            title="Pick color"
            aria-label=${`Pick ${e.toLowerCase()}`}
            @input=${e=>{i(e.target.value??"",e)}}
          />
        </div>
      </div>
    `}_renderNativeAddButton(e,t){return(0,o.html)`
      <ha-button
        class="native-add-button"
        size="s"
        appearance="filled"
        @click=${t}
      >
        <ha-icon slot="start" icon="mdi:plus"></ha-icon>
        ${e}
      </ha-button>
    `}_renderDragHandle(e,t){return(0,o.html)`
      <span
        class="drag-handle ${e}"
        title=${t}
        @click=${e=>e.stopPropagation()}
      >
        <ha-icon icon="mdi:drag-horizontal-variant"></ha-icon>
      </span>
    `}_normalizeSeriesIds(e){let t=new Set;return e.map((e,i)=>{let r="string"==typeof e.id&&e.id.trim().length?e.id.trim():void 0,s=r&&!t.has(r)?r:this._createUniqueSeriesId(e,i,t);return t.add(s),e.id===s?e:{...e,id:s}})}_createUniqueSeriesId(e,t,i){let r=this._sanitizeSeriesId(e.statistic_id?.split(".").pop()??e.name??e.pv_production_entity?.split(".").pop()??(e.calculation?"calculation":"forecast"===e.source?"forecast":"series"))||`series_${t+1}`,s=r,a=2;for(;i.has(s);)s=`${r}_${a}`,a+=1;return s}_sanitizeSeriesId(e){return e.trim().toLowerCase().replace(/[^a-z0-9]+/gu,"_").replace(/^_+|_+$/gu,"")}setConfig(e){let t=void 0!==this._config,i=e.series?.map(e=>{let t={...e};return e.time_offset&&(t.time_offset={...e.time_offset}),e.calculation&&(t.calculation={...e.calculation,terms:(e.calculation.terms??[]).map(e=>({...e}))}),t})??[],r=this._normalizeSeriesIds(i),s={...e,series:r};s.type="custom:energy-custom-graph-card",s.timespan=e.timespan??{mode:"energy"},this._config=s,this._syncCustomColorDrafts(r),this._syncColorSelections(r),this._syncCompareCustomColorDrafts(r),this._syncCompareColorSelections(r),this._ensureStatisticMetadataForConfig(s),t?this._syncExpandedState(r):(this._expandedSeries=new Set,this._expandedTermKeys=new Set,this._headerExpanded=!1)}render(){return this.hass&&this._config?(0,o.html)`
      <div class="editor-container">
        ${this._renderCardHeaderEditorSection(this._config)}
        ${this._renderChartSettingsSection(this._config)}
        ${this._renderSeriesEditorSection()}
      </div>
    `:o.nothing}_renderCardHeaderEditorSection(e){let t=this._headerExpanded;return this._renderEditorSection({title:"Card header",icon:"mdi:credit-card",summary:this._formatCardHeaderSummary(e),expanded:t,onToggle:()=>{this._headerExpanded=!t},body:(0,o.html)`
        <div class="section">
          ${this._renderTextInput({label:this.hass.localize("ui.panel.lovelace.editor.card.generic.title"),value:e.title??"",onInput:e=>this._updateConfig("title",e||void 0)})}
          ${this._renderHeaderSection(e)}
        </div>
      `})}_renderChartSettingsSection(e){let t=this._chartSettingsExpanded;return this._renderEditorSection({title:"Chart settings",icon:"mdi:cog",summary:this._formatChartSettingsSummary(e),expanded:t,onToggle:()=>{this._chartSettingsExpanded=!t},body:(0,o.html)`
        ${this._renderTimespanSection(e)}
        ${this._renderAggregationSection(e)}
        ${this._renderAxesSection(e)}
        ${this._renderLegendSection(e)}
        ${this._renderTooltipSection(e)}
        ${this._renderChartMoreOptions(e)}
      `})}_renderSeriesEditorSection(){let e=this._config.series??[],t=this._seriesSectionExpanded;return this._renderExpansionPanel({title:"Series",icon:"mdi:chart-box-multiple",summary:this._formatSeriesSectionSummary(e),expanded:t,onToggle:()=>{this._seriesSectionExpanded=!t},body:(0,o.html)`
        <div class="series-list">
          ${e.length?(0,o.html)`
                <ha-sortable
                  handle-selector=".series-drag-handle"
                  draggable-selector=".series-sortable-item"
                  @item-moved=${this._handleSeriesMoved}
                >
                  <div class="native-sortable-list">
                    ${e.map((e,t)=>(0,o.html)`
                        <div class="series-sortable-item">
                          ${this._renderSeriesCard(e,t)}
                        </div>
                      `)}
                  </div>
                </ha-sortable>
              `:(0,o.html)`
                <div class="empty-state">
                  <p class="hint">No series configured yet.</p>
                </div>
              `}
          ${this._renderNativeAddButton("Add series",()=>this._addSeries())}
        </div>
      `,className:"editor-section series-section"})}_renderEditorSection({title:e,icon:t,summary:i,expanded:r,onToggle:s,body:a}){return this._renderExpansionPanel({title:e,icon:t,summary:i,expanded:r,onToggle:s,body:a,className:"editor-section"})}_renderExpansionPanel({title:e,icon:t,summary:i,expanded:r,onToggle:s,body:a,actions:n,actionsSlot:l="icons",leading:d,className:c}){return(0,o.html)`
      <ha-expansion-panel
        outlined
        class=${c??""}
        .expanded=${r}
        @expanded-changed=${e=>this._handleExpansionChanged(e,s)}
      >
        ${d?(0,o.html)`<div slot="leading-icon" class="panel-leading">${d}</div>`:t?(0,o.html)`<ha-icon slot="leading-icon" icon=${t}></ha-icon>`:o.nothing}
        <div slot="header" class="panel-heading">
          <div class="panel-title" title=${e}>${e}</div>
          ${i?(0,o.html)`<div class="panel-summary">${i}</div>`:o.nothing}
        </div>
        ${n?(0,o.html)`
              <div
                slot=${l}
                class="panel-actions"
                @click=${e=>e.stopPropagation()}
                @keydown=${e=>e.stopPropagation()}
              >
                ${n}
              </div>
            `:o.nothing}
        <div class="panel-body">${a}</div>
      </ha-expansion-panel>
    `}_handleExpansionChanged(e,t){e.target===e.currentTarget&&(e.stopPropagation(),t())}_renderButtonToggleGroup(e,t,i){return(0,o.html)`
      <ha-button-toggle-group
        .buttons=${e}
        .active=${t}
        size="m"
        .fullWidth=${!0}
        @value-changed=${e=>i(e.detail.value)}
      ></ha-button-toggle-group>
    `}_renderInlineButtonToggleGroup(e,t,i,r){return(0,o.html)`
      <div class="segmented-row">
        <span class="segmented-row-label">${e}</span>
        <div class="segmented-row-control">
          ${this._renderButtonToggleGroup(t,i,r)}
        </div>
      </div>
    `}_renderAggregationSection(e){let t=e.timespan?.mode==="energy",i=e.aggregation,r=i?.energy_picker??{},s=this._aggregationExpanded,a=this._formatAggregationSummary(i,t);return this._renderExpansionPanel({title:"Aggregation",icon:"mdi:clock-fast",summary:a,expanded:s,onToggle:()=>this._toggleAggregationExpanded(),body:(0,o.html)`
        <div class="aggregation-body">
          ${t?(0,o.html)`
                ${this._renderAggregationPickerOptions(r)}
                ${this._renderAggregationFallbackField(i)}
              `:this._renderAggregationManualOptions(i)}
          ${this._renderRawOptions(i)}
          ${this._renderComputeCurrentHourOption(i)}
        </div>
      `,className:"general-collapsible"})}_renderAggregationFallbackField(e){let t=e?.fallback??"";return(0,o.html)`
      <div class="section">
        <div class="field">
          <label>Fallback aggregation</label>
          <select
            @change=${e=>this._updateAggregation("fallback",e.target.value||"")}
          >
            <option value="" ?selected=${""===t}>None</option>
            ${v.map(e=>(0,o.html)`<option value=${e.value} ?selected=${t===e.value}
                  >${e.label}</option
                >`)}
          </select>
        </div>
      </div>
    `}_renderChartMoreOptions(e){let t=+!!e.chart_height,i=this._chartMoreExpanded||t>0;return this._renderMoreBlock({count:t,expanded:i,onToggle:()=>{this._chartMoreExpanded=!i},body:(0,o.html)`
        ${this._renderTextInput({label:"Chart height",helper:"CSS height, ignored in section layout.",value:e.chart_height??"",onInput:e=>this._updateConfig("chart_height",e||void 0)})}
      `})}_renderMoreBlock({count:e,expanded:t,onToggle:i,body:r}){return this._renderExpansionPanel({title:e>0?`More \xb7 ${e} set`:"More",icon:"mdi:dots-horizontal",expanded:t,onToggle:i,body:r,className:"more-block"})}_cardHeaderHasContent(e){return!!(e.title?.trim()||e.header?.chip)}_formatCardHeaderSummary(e){let t=[];return e.title?.trim()?t.push(`Title: ${e.title.trim()}`):t.push("No Title"),t.push(e.header?.chip?"Chip on":"No chip"),t.join(" · ")}_formatChartSettingsSummary(e){let t=[this._formatTimespanSummary(e.timespan??{mode:"energy"})],i=this._formatChartAggregationSummary(e.aggregation,e.timespan?.mode==="energy");return i&&t.push(i),e.timespan?.mode==="energy"&&this._hasAnySeriesTimeOffset()&&t.push("Compare disabled by time offset"),t.join(" · ")}_formatChartAggregationSummary(e,t){if(e&&0!==Object.keys(e).length){if(!t&&e.manual)return`Aggregation: ${this._formatStatisticsPeriod(e.manual)}`;if(t&&e.energy_picker&&Object.keys(e.energy_picker).length)return"Aggregation: picker overrides"}}_formatTimespanSummary(e){if("fixed"===e.mode)return`Fixed: ${e.start??"Start"} to ${e.end??"End"}`;if("relative"===e.mode){let t=C(e.period)&&e.count?`${e.count} `:"",i=C(e.period)&&e.offset?`, offset ${e.offset}`:"";return`Relative: ${t}${this._formatRelativePeriod(e.period)}${i}`}return"Energy date picker"}_formatRelativePeriod(e){switch(e){case"last_60_minutes":return"Last 60 minutes";case"last_24_hours":return"Last 24 hours";case"last_7_days":return"Last 7 days";case"last_30_days":return"Last 30 days";case"last_12_months":return"Last 12 months";default:return e.charAt(0).toUpperCase()+e.slice(1)}}_formatSeriesSectionSummary(e){let t=e.map(e=>this._getSeriesIssue(e)).filter(e=>void 0!==e).length,i=`${e.length} ${(e.length,"series")}`;return t>0?`${i} \xb7 ${t} need attention`:i}_hasAnySeriesTimeOffset(){return(this._config?.series??[]).some(e=>(0,m.seriesHasTimeOffset)(e))}_getStatisticIssue(e,t){let i=this._resolveStatisticSource(e);return(0,m.getStatisticSourceIssue)({status:i.status,usesRaw:(0,m.aggregationUsesRaw)(this._config?.aggregation),metadata:i.metadata,statType:t})}_getSeriesIssue(e){let t=this._resolveSeriesSource(e);if("forecast"!==t){if("calculation"===t){for(let t of e.calculation?.terms??[]){if(!(0,m.normalizeStatisticId)(t.statistic_id))continue;let i=this._getStatisticIssue(t.statistic_id,t.stat_type??e.stat_type);if(i)return i}return}return this._getStatisticIssue(e.statistic_id,e.stat_type)}}_renderEditorHelpHint(e,t="info"){return(0,o.html)`
      <p class="editor-hint ${t}">
        <ha-icon
          icon=${"info"===t?"mdi:help-circle-outline":"warning"===t?"mdi:alert":"mdi:alert-circle"}
          role="img"
          aria-label=${t}
        ></ha-icon>
        <span>${e}</span>
      </p>
    `}_renderSummaryIssue(e){return e?(0,o.html)`
      <span class="summary-issue ${e.severity}">
        <ha-icon
          icon=${"error"===e.severity?"mdi:alert-circle":"mdi:alert"}
          role="img"
          aria-label=${e.severity}
        ></ha-icon>
        <span>${e.cause}${e.action?(0,o.html)` · ${e.action}`:o.nothing}</span>
      </span>
    `:o.nothing}_renderCompactToggle(e,t,i,r=!1){return(0,o.html)`
      <div class="compact-toggle ${r?"disabled":""}">
        <span class="compact-toggle-label">${e}</span>
        <ha-switch
          .checked=${t}
          ?disabled=${r}
          @change=${e=>i(e.target.checked)}
        ></ha-switch>
      </div>
    `}_formatLegendSummary(e){if(!0===e.hide_legend)return"Hidden";let t=["Visible"];return e.legend_sort&&"none"!==e.legend_sort&&t.push(`Sort ${e.legend_sort}`),e.expand_legend&&t.push("Expanded"),t.join(" · ")}_formatTooltipSummary(e){if(!1===e.show_tooltip)return"Hidden";let t=["Visible"],i=!1!==e.show_x_axis_pointer,r=!0===e.show_y_axis_pointer;return i&&r?t.push("X+Y Pointer"):i?t.push("X pointer"):r&&t.push("Y pointer"),e.show_stack_sums&&t.push("Stack sums"),t.join(" · ")}_renderLegendSection(e){let t=e.legend_sort??"none",i=!0===e.hide_legend,r=this._legendExpanded;return this._renderExpansionPanel({title:"Legend",icon:"mdi:list-box-outline",summary:this._formatLegendSummary(e),expanded:r,onToggle:()=>this._toggleLegendExpanded(),body:(0,o.html)`
          ${this._renderCompactToggle("Visible",!i,e=>this._updateBooleanConfig("hide_legend",!e))}
          ${i?o.nothing:(0,o.html)`
                ${this._renderInlineButtonToggleGroup("Sort",[{value:"none",label:"None"},{value:"asc",label:"Asc"},{value:"desc",label:"Desc"}],t,e=>this._setLegendSort(e))}
                ${this._renderCompactToggle("Expand legend by default",!0===e.expand_legend,e=>this._updateBooleanConfig("expand_legend",e))}
              `}
      `,className:"general-collapsible"})}_renderAxesSection(e){let t=e.y_axes??[],i=t.find(e=>"left"===e.id),r=t.find(e=>"right"===e.id),s=e.series?.some(e=>"right"===e.y_axis),a=!!r||s,n=this._axesExpanded,l=this._formatAxesSummary(i,r,a);return this._renderExpansionPanel({title:"Y Axes",icon:"mdi:format-text-rotation-up",summary:l,expanded:n,onToggle:()=>this._toggleAxesExpanded(),body:(0,o.html)`
        <div class="section">
          ${this._renderAxisConfig("left",i)}
          ${a?(0,o.html)`
                <div class="axis-separator"></div>
                ${this._renderAxisConfig("right",r)}
              `:(0,o.html)`
                <p class="hint axis-hint">
                  The right Y axis will appear automatically when you assign a series to it.
                </p>
              `}
        </div>
      `,className:"general-collapsible"})}_renderAxisConfig(e,t){let i="left"===e?"Left Y axis":"Right Y axis",r=t?.center_zero===!0;return(0,o.html)`
      <div class="axis-config">
        <span class="subtitle axis-title">${i}</span>
        <div class="compact-grid">
          ${this._renderTextInput({label:"Min value",type:"number",disabled:r,value:t?.min!==void 0?String(t.min):"",helper:r?"Disabled when center zero is active.":void 0,onInput:t=>this._updateAxisConfig(e,"min",t)})}
          ${this._renderTextInput({label:"Max value",type:"number",value:t?.max!==void 0?String(t.max):"",helper:r?"Used for both +max and -max.":void 0,onInput:t=>this._updateAxisConfig(e,"max",t)})}
          ${this._renderTextInput({label:"Unit",value:t?.unit??"",onInput:t=>this._updateAxisConfig(e,"unit",t)})}
        </div>
        <div class="toggle-grid" role="group" aria-label=${`${i} options`}>
          ${this._renderCompactToggle("Fit to data",t?.fit_y_data===!0,t=>this._updateAxisConfig(e,"fit_y_data",t))}
          ${this._renderCompactToggle("Center zero",t?.center_zero===!0,t=>this._updateAxisConfig(e,"center_zero",t))}
        </div>
      </div>
    `}_renderTooltipSection(e){let t=!1!==e.show_tooltip,i=!1!==e.show_x_axis_pointer,r=!0===e.show_y_axis_pointer,s=this._tooltipExpanded;return this._renderExpansionPanel({title:"Tooltip",icon:"mdi:tooltip-text-outline",summary:this._formatTooltipSummary(e),expanded:s,onToggle:()=>this._toggleTooltipExpanded(),body:(0,o.html)`
          ${this._renderCompactToggle("Visible",t,e=>this._updateConfig("show_tooltip",e))}
          ${t?(0,o.html)`
                <div class="toggle-grid" role="group" aria-label="Tooltip details">
                  ${this._renderCompactToggle("X pointer",i,e=>this._updateConfig("show_x_axis_pointer",e))}
                  ${this._renderCompactToggle("Y pointer",r,e=>this._updateConfig("show_y_axis_pointer",e))}
                  ${this._renderCompactToggle("Units",!1!==e.show_unit,e=>this._updateConfig("show_unit",e))}
                  <div class="toggle-with-hint">
                    ${this._renderCompactToggle("Stack sums",!0===e.show_stack_sums,e=>this._updateConfig("show_stack_sums",e))}
                    <p class="hint">
                      Shows summed values for stacked series in the tooltip.
                    </p>
                  </div>
                </div>
                ${this._renderTextInput({label:"Tooltip precision",type:"number",value:void 0!==e.tooltip_precision?String(e.tooltip_precision):"",onInput:e=>this._updateNumericConfig("tooltip_precision",e)})}
              `:o.nothing}
      `,className:"general-collapsible"})}_renderHeaderSection(e){let t=e.header?.chip,i=!!t;return(0,o.html)`
      <div class="subsection header-chip-section">
        <span class="subtitle">Header chip</span>
          ${this._renderCompactToggle("Enabled",i,e=>this._setHeaderChipEnabled(e))}
          ${i&&t?(0,o.html)`
                <div class="compact-grid">
                  ${this._renderTextInput({label:"Label",value:t.label??"",onInput:e=>this._updateHeaderChipField("label",e||void 0)})}
                  ${this._renderTextInput({label:"Unit",helper:"Leave empty for automatic unit.",value:t.unit??"",onInput:e=>this._updateHeaderChipField("unit",e||void 0)})}
                  ${this._renderTextInput({label:"Precision",type:"number",step:"1",min:"0",helper:"Default follows tooltip precision.",value:void 0!==t.precision?String(t.precision):"",onInput:e=>this._updateHeaderChipNumber("precision",e)})}
                </div>
                <span class="subtitle">Metric</span>
                ${this._renderHeaderMetricEditor(t.metric??this._createDefaultHeaderMetric())}
              `:o.nothing}
      </div>
    `}_renderHeaderMetricEditor(e){let t=this._getHeaderMetricMode(e);return(0,o.html)`
      <div class="segmented-only">
        ${this._renderButtonToggleGroup([{value:"series",label:"Series"},{value:"stack",label:"Stack"},{value:"entity_state",label:"Entity"},{value:"calculation",label:"Calculation"}],t,e=>this._setHeaderMetricMode(e))}
      </div>
      ${"series"===t?this._renderHeaderSeriesMetric(e):"stack"===t?this._renderHeaderStackMetric(e):"entity_state"===t?this._renderHeaderEntityStateMetric(e):this._renderHeaderCalculationMetric(e)}
      ${this._renderHeaderMetricMore(e)}
    `}_renderHeaderSeriesMetric(e){let t="source"in e&&"series"===e.source?e:this._createDefaultHeaderMetric("series"),i=this._getSeriesReferenceOptions();return(0,o.html)`
      <div class="field">
        <label>Series</label>
        <select
          @change=${e=>this._updateHeaderMetric({...t,series_id:e.target.value||void 0})}
        >
          <option value="" ?selected=${!t.series_id}>Select series</option>
          ${i.map(e=>(0,o.html)`
              <option
                value=${e.value}
                ?selected=${t.series_id===e.value}
              >
                ${e.label}
              </option>
            `)}
        </select>
      </div>
      ${this._renderHeaderReducerField(t.reducer,e=>this._updateHeaderMetric({...t,reducer:e}))}
    `}_renderHeaderStackMetric(e){let t="source"in e&&"stack"===e.source?e:this._createDefaultHeaderMetric("stack");return(0,o.html)`
      ${this._renderTextInput({label:"Stack",value:t.stack??"",onInput:e=>this._updateHeaderMetric({...t,stack:e||void 0})})}
      ${this._renderHeaderReducerField(t.reducer,e=>this._updateHeaderMetric({...t,reducer:e}))}
      ${this._renderHeaderStackSignField(t.sign,e=>this._updateHeaderMetric({...t,sign:e}))}
    `}_renderHeaderEntityStateMetric(e){let t="source"in e&&"entity_state"===e.source?e:this._createDefaultHeaderMetric("entity_state");return(0,o.html)`
      <ha-entity-picker
        .hass=${this.hass}
        .value=${t.entity_id}
        .label=${"Entity"}
        allow-custom-entity
        @value-changed=${e=>this._updateHeaderMetric({...t,entity_id:e.detail.value||void 0})}
      ></ha-entity-picker>
    `}_renderHeaderCalculationMetric(e){let t=("calculation"in e?e:this._createDefaultHeaderMetric("calculation")).calculation;return(0,o.html)`
      ${this._renderTextInput({label:"Initial value",type:"number",value:void 0!==t.initial_value?String(t.initial_value):"0",onInput:e=>this._updateHeaderCalculation({...t,initial_value:e?Number(e):0})})}
      <div class="terms-list">
        ${t.terms?.length?(0,o.html)`
              <ha-sortable
                handle-selector=".header-term-drag-handle"
                draggable-selector=".term-sortable-item"
                @item-moved=${this._handleHeaderCalculationTermMoved}
              >
                <div class="native-sortable-list">
                  ${t.terms.map((e,t)=>(0,o.html)`
                      <div class="term-sortable-item">
                        ${this._renderHeaderCalculationTerm(e,t)}
                      </div>
                    `)}
                </div>
              </ha-sortable>
            `:(0,o.html)`<p class="hint">Add at least one term to build the header metric.</p>`}
        ${this._renderNativeAddButton("Add term",()=>this._addHeaderCalculationTerm())}
      </div>
    `}_renderHeaderMetricMore(e){let t=this._countHeaderTransformFields(e),i=this._headerMetricMoreExpanded||t>0;return this._renderMoreBlock({count:t,expanded:i,onToggle:()=>{this._headerMetricMoreExpanded=!i},body:this._renderHeaderTransformFields(e,(t,i)=>this._updateHeaderMetric({...e,[t]:i}))})}_countHeaderTransformFields(e){return["multiply","add","clip_min","clip_max"].filter(t=>void 0!==e[t]).length}_renderHeaderCalculationTerm(e,t){let i=this._expandedHeaderTermKeys.has(t),r=e.operation??"add",s=this._formatHeaderTermDescriptor(e);return this._renderExpansionPanel({title:this._formatOperation(r),leading:this._renderDragHandle("header-term-drag-handle","Drag to reorder term"),summary:s,expanded:i,onToggle:()=>this._toggleHeaderTermExpanded(t),actions:(0,o.html)`
          <ha-icon-button
            class="editor-action"
            .label=${"Remove term"}
            @click=${e=>{e.stopPropagation(),this._removeHeaderCalculationTerm(t)}}
          >
            <ha-icon icon="mdi:delete"></ha-icon>
          </ha-icon-button>
      `,body:(0,o.html)`
        <div class="term-body column">
          ${this._renderHeaderTermOperationField(t,r)}
          ${this._renderHeaderTermSourceFields(t,e)}
          ${this._renderHeaderTransformFields(e,(e,i)=>this._updateHeaderCalculationTerm(t,e,i))}
        </div>
      `,className:"term-panel"})}_renderHeaderTermOperationField(e,t){let i=t??"add";return(0,o.html)`
      <div class="field">
        <label>Operation</label>
        <select
          @change=${t=>this._updateHeaderCalculationTerm(e,"operation",t.target.value)}
        >
          <option value="add" ?selected=${"add"===i}>Add</option>
          <option value="subtract" ?selected=${"subtract"===i}>Subtract</option>
          <option value="multiply" ?selected=${"multiply"===i}>Multiply</option>
          <option value="divide" ?selected=${"divide"===i}>Divide</option>
        </select>
      </div>
    `}_renderHeaderTermSourceFields(e,t){let i=t.source??"series";return(0,o.html)`
      <div class="field full-width">
        <label>Input type</label>
        ${this._renderButtonToggleGroup([{value:"series",label:"Series"},{value:"stack",label:"Stack"},{value:"entity_state",label:"Entity"},{value:"constant",label:"Constant"}],i,t=>this._setHeaderTermSource(e,t))}
      </div>
      ${"series"===i?this._renderHeaderTermSeriesFields(e,t):"stack"===i?this._renderHeaderTermStackFields(e,t):"entity_state"===i?this._renderHeaderTermEntityFields(e,t):this._renderHeaderTermConstantFields(e,t)}
    `}_renderHeaderTermSeriesFields(e,t){let i=this._getSeriesReferenceOptions();return(0,o.html)`
      <div class="field">
        <label>Series</label>
        <select
          @change=${t=>this._updateHeaderCalculationTerm(e,"series_id",t.target.value||void 0)}
        >
          <option value="" ?selected=${!("series_id"in t)||!t.series_id}>Select series</option>
          ${i.map(e=>(0,o.html)`
              <option
                value=${e.value}
                ?selected=${"series_id"in t&&t.series_id===e.value}
              >
                ${e.label}
              </option>
            `)}
        </select>
      </div>
      ${this._renderHeaderReducerField("reducer"in t?t.reducer:void 0,t=>this._updateHeaderCalculationTerm(e,"reducer",t))}
    `}_renderHeaderTermStackFields(e,t){return(0,o.html)`
      ${this._renderTextInput({label:"Stack",value:"stack"in t?t.stack??"":"",onInput:t=>this._updateHeaderCalculationTerm(e,"stack",t||void 0)})}
      ${this._renderHeaderReducerField("reducer"in t?t.reducer:void 0,t=>this._updateHeaderCalculationTerm(e,"reducer",t))}
      ${this._renderHeaderStackSignField("sign"in t?t.sign:void 0,t=>this._updateHeaderCalculationTerm(e,"sign",t))}
    `}_renderHeaderTermEntityFields(e,t){return(0,o.html)`
      <ha-entity-picker
        .hass=${this.hass}
        .value=${"entity_id"in t?t.entity_id:void 0}
        .label=${"Entity"}
        allow-custom-entity
        @value-changed=${t=>this._updateHeaderCalculationTerm(e,"entity_id",t.detail.value||void 0)}
      ></ha-entity-picker>
    `}_renderHeaderTermConstantFields(e,t){return this._renderTextInput({label:"Constant",type:"number",value:"constant"in t&&void 0!==t.constant?String(t.constant):"0",onInput:t=>this._updateHeaderCalculationTerm(e,"constant",""===t?void 0:Number(t))})}_renderHeaderReducerField(e,t){let i=e??"sum";return(0,o.html)`
      <div class="field">
        <label>Reducer</label>
        <select
          @change=${e=>t(e.target.value)}
        >
          ${S.map(e=>(0,o.html)`
              <option value=${e.value} ?selected=${i===e.value}>
                ${e.label}
              </option>
            `)}
        </select>
        <p class="hint">
          Defines how individual values are combined into one total value.
        </p>
      </div>
    `}_renderHeaderStackSignField(e,t){let i=e??"signed";return(0,o.html)`
      <div class="field">
        <label>Sign</label>
        <select
          @change=${e=>t(e.target.value)}
        >
          ${b.map(e=>(0,o.html)`
              <option value=${e.value} ?selected=${i===e.value}>
                ${e.label}
              </option>
            `)}
        </select>
      </div>
    `}_renderHeaderTransformFields(e,t){return(0,o.html)`
      <span class="subtitle term-transform-title">Transform</span>
      ${this._renderTextInput({label:"Multiply",type:"number",value:void 0!==e.multiply?String(e.multiply):"",onInput:e=>t("multiply",""===e?void 0:Number(e))})}
      ${this._renderTextInput({label:"Add",type:"number",value:void 0!==e.add?String(e.add):"",onInput:e=>t("add",""===e?void 0:Number(e))})}
      ${this._renderTextInput({label:"Clip min",type:"number",value:void 0!==e.clip_min?String(e.clip_min):"",onInput:e=>t("clip_min",""===e?void 0:Number(e))})}
      ${this._renderTextInput({label:"Clip max",type:"number",value:void 0!==e.clip_max?String(e.clip_max):"",onInput:e=>t("clip_max",""===e?void 0:Number(e))})}
    `}_renderAggregationPickerOptions(e){return(0,o.html)`
      <div class="section">
        <div class="picker-grid">
          ${["hour","day","week","month","year"].map(t=>(0,o.html)`
              <div class="field">
                <label>${`Energy picker \u{2192} ${t}`}</label>
                ${(()=>{let i=e[t]??"";return(0,o.html)`<select
                    @change=${e=>this._updateAggregationPicker(t,e.target.value||"")}
                  >
                    <option value="" ?selected=${""===i}>Automatic</option>
                    ${v.map(e=>(0,o.html)`<option value=${e.value} ?selected=${i===e.value}
                          >${e.label}</option
                        >`)}
                  </select>`})()}
              </div>
            `)}
        </div>
        <p class="hint">
          Override the interval used when requesting statistics via the energy date picker.
        </p>
      </div>
    `}_setLegendSort(e){this._updateConfig("legend_sort",e)}_renderAggregationManualOptions(e){return(0,o.html)`
      <div class="section">
        <div class="field">
          <label>Manual aggregation</label>
          ${(()=>{let t=e?.manual??"";return(0,o.html)`<select
              @change=${e=>this._updateAggregation("manual",e.target.value||"")}
            >
              <option value="" ?selected=${""===t}>Automatic</option>
              ${v.map(e=>(0,o.html)`<option value=${e.value} ?selected=${t===e.value}
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
              ${v.map(e=>(0,o.html)`<option value=${e.value} ?selected=${t===e.value}
                    >${e.label}</option
                  >`)}
            </select>`})()}
        </div>
        <p class="hint">
          Override the interval used when requesting recorder statistics. Leave empty to keep the
          automatic behaviour.
        </p>
      </div>
    `}_renderRawOptions(e){if(!this._aggregationUsesRaw(e))return o.nothing;let t={...e?.raw_options??{}},i=void 0===t.significant_changes_only?"auto":t.significant_changes_only?"true":"false";return(0,o.html)`
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
      </div>
    `}_renderComputeCurrentHourOption(e){let t=e?.compute_current_hour===!0;return(0,o.html)`
      <div class="section">
        ${this._renderCompactToggle("Compute current hour value",t,e=>this._updateAggregationFlag("compute_current_hour",e))}
        <p class="hint">
          Home Assistant publishes hourly aggregates after the hour completes. This adds a
          current-hour estimate from recent 5 minute statistics.
        </p>
      </div>
    `}_aggregationUsesRaw(e){return!!e&&("raw"===e.manual||"raw"===e.fallback||!!e.energy_picker&&Object.values(e.energy_picker).some(e=>"raw"===e))}_updateRawOption(e,t){let i={...this._config.aggregation},r={...i.raw_options??{}};"auto"===t?delete r[e]:r[e]="true"===t,Object.keys(r).length?i.raw_options=r:delete i.raw_options;let s=this._cleanupAggregation(i);this._updateConfig("aggregation",s)}_renderSeriesCard(e,t){let i=this._expandedSeries.has(t),r=this._getSeriesIssue(e);return this._renderExpansionPanel({title:this._formatSeriesTitle(e,t),leading:(0,o.html)`
        <span class="series-leading">
          ${this._renderDragHandle("series-drag-handle","Drag to reorder series")}
          ${this._renderSeriesSourceIcon(e)}
        </span>
      `,summary:(0,o.html)`
        <span class="series-summary">
          ${this._formatSeriesSummary(e)}
          ${this._renderSummaryIssue(r)}
        </span>
      `,expanded:i,onToggle:()=>this._toggleSeriesExpanded(t),actionsSlot:"event",actions:(0,o.html)`
        <div class="header-actions">
            <ha-icon-button
              class="editor-action"
              .label=${"Duplicate series"}
              @click=${e=>{e.stopPropagation(),this._duplicateSeries(t)}}
            >
              <ha-icon icon="mdi:plus-box-multiple"></ha-icon>
            </ha-icon-button>
            <ha-icon-button
              class="editor-action"
              .label=${"Delete series"}
              @click=${e=>{e.stopPropagation(),this._confirmRemoveSeries(t)}}
            >
              <ha-icon icon="mdi:delete"></ha-icon>
            </ha-icon-button>
          </div>
      `,body:(0,o.html)`
        ${this._renderTextInput({label:"Series name",helper:"Optional. Empty uses the entity or statistic name.",value:e.name??"",onInput:e=>this._updateSeries(t,"name",e||void 0)})}
        <div class="series-option-groups">
          ${this._renderSeriesOptionGroup(e,t,"source","Source",this._formatSeriesSourceSummary(e),this._renderSeriesSourceGroup(e,t))}
          ${this._renderSeriesOptionGroup(e,t,"style","Style",this._formatSeriesStyleSummary(e),this._renderSeriesStyleSegment(e,t))}
          ${this._renderSeriesOptionGroup(e,t,"visibility","Visibility",this._formatSeriesVisibilitySummary(e),this._renderSeriesVisibilitySegment(e,t))}
          ${this._renderSeriesOptionGroup(e,t,"transform","Transform",this._formatSeriesTransformSummary(e),this._renderSeriesTransformGroup(e,t))}
        </div>
      `,className:"series-card"})}_seriesHasConfiguredSource(e){let t=this._resolveSeriesSource(e);return"calculation"===t?!!e.calculation?.terms?.length:"forecast"===t||!!(0,m.normalizeStatisticId)(e.statistic_id)}_renderSeriesSourceIcon(e){let t=this._resolveSeriesSource(e);if("calculation"===t)return(0,o.html)`<ha-icon icon="mdi:calculator-variant"></ha-icon>`;if("forecast"===t)return(0,o.html)`<ha-icon icon="mdi:solar-power-variant-outline"></ha-icon>`;let i=(0,m.normalizeStatisticId)(e.statistic_id),r=i?this.hass?.states?.[i]:void 0;return r?(0,o.html)`<ha-state-icon .stateObj=${r}></ha-state-icon>`:(0,o.html)`<ha-icon icon="mdi:selection-remove"></ha-icon>`}_renderSeriesOptionGroup(e,t,i,r,s,a){let o=this._isSeriesOptionGroupExpanded(e,t,i);return this._renderExpansionPanel({title:r,icon:this._getSeriesOptionGroupIcon(i),summary:s,expanded:o,onToggle:()=>this._toggleSeriesOptionGroup(t,i,o),body:a,className:"series-option-group"})}_getSeriesOptionGroupIcon(e){switch(e){case"style":return"mdi:palette";case"visibility":return"mdi:eye";case"transform":return"mdi:function";default:return"mdi:database-search"}}_isSeriesOptionGroupExpanded(e,t,i){let r=this._seriesOptionGroupKey(t,i),s=this._seriesOptionGroupsExpanded.get(r);if(void 0!==s)return s;let a=this._seriesHasConfiguredSource(e);return"source"===i?!a:"style"===i&&a}_toggleSeriesOptionGroup(e,t,i){this._setSeriesOptionGroupExpanded(e,t,!i)}_setSeriesOptionGroupExpanded(e,t,i){let r=new Map(this._seriesOptionGroupsExpanded);r.set(this._seriesOptionGroupKey(e,t),i),this._seriesOptionGroupsExpanded=r,this._expandedSeries=new Set(this._expandedSeries).add(e)}_seriesOptionGroupKey(e,t){return`${e}:${t}`}_parseSeriesOptionGroupKey(e){let[t,i]=e.split(":"),r=Number(t);if(!Number.isNaN(r)&&A.has(i))return{index:r,group:i}}_formatSeriesSummary(e){let t=[];return e.name?.trim()&&t.push(this._formatSeriesSourceDescriptor(e)),t.push(this._formatChartType(e.chart_type??"bar")),t.push((e.y_axis??"left")==="right"?"Right axis":"Left axis"),t.join(" · ")}_formatSeriesSourceSummary(e){return this._formatSeriesSourceDescriptor(e)}_formatSeriesStyleSummary(e){let t=[this._formatChartType(e.chart_type??"bar"),(e.y_axis??"left")==="right"?"Right axis":"Left axis"];return e.stack?.trim()&&t.push(`Stack: ${e.stack.trim()}`),!0===e.fill&&t.push("Fill"),t.join(" · ")}_formatSeriesVisibilitySummary(e){let t=[];!1===e.show_in_chart&&t.push("Chart"),!1===e.show_in_legend&&t.push("Legend"),!1===e.show_in_tooltip&&t.push("Tooltip");let i=t.length?[`Hidden: ${t.join(", ")}`]:["Visible"];return!0===e.hidden_by_default&&i.push("Hidden by default"),!0===e.show_value_labels&&i.push("Value labels"),i.join(" · ")}_formatSeriesTransformSummary(e){let t=[];return void 0!==e.multiply&&t.push("Multiply"),void 0!==e.add&&t.push("Add"),void 0!==e.clip_min&&t.push("Clip min"),void 0!==e.clip_max&&t.push("Clip max"),t.length?t.join(" · "):"No transform"}_formatSeriesTitle(e,t){let i=e.name?.trim();return i||this._formatSeriesSourceDescriptor(e)||`Series ${t+1}`}_formatSeriesSourceDescriptor(e){let t=this._resolveSeriesSource(e);if("calculation"===t){let t=e.calculation?.terms?.length??0;return t?`Calculation \xb7 ${t} terms`:"Calculation · no terms"}if("forecast"===t)return e.pv_production_entity?`Forecast \xb7 ${e.pv_production_entity}`:"Forecast · all solar forecasts";let i=(0,m.normalizeStatisticId)(e.statistic_id);if(!i)return"No entity selected";let r=this._getStatisticMetadata(i);return(0,_.getStatisticLabel)(this.hass,i,r)}_formatChartType(e){return e.charAt(0).toUpperCase()+e.slice(1)}_renderTimespanSection(e){let t=e.timespan??{mode:"energy"},i=t.mode,r="relative"===t.mode&&C(t.period),s=this._hasAnySeriesTimeOffset(),a="relative"!==t.mode||C(t.period)?"calendar":"rolling";return(0,o.html)`
      <div class="section">
        ${this._renderInlineButtonToggleGroup("Mode",[{value:"energy",label:"Energy"},{value:"relative",label:"Relative"},{value:"fixed",label:"Fixed"}],i,e=>this._setTimespanMode(e))}
        ${"energy"===i?(0,o.html)`
              <p class="hint">
                In Energy mode, the card follows the range selected in the Energy date picker.
              </p>
            `:o.nothing}

        ${"energy"===i?(0,o.html)`
              ${this._renderCompactToggle("Follow date picker compare toggle",!1!==e.allow_compare,e=>this._updateConfig("allow_compare",e),s)}
              ${s?this._renderEditorHelpHint("Series time offset disables the Energy date picker compare mode.","warning"):o.nothing}
              ${this._renderTextInput({label:"Collection key",helper:"Usually only needed for multiple independent Energy date pickers on one dashboard page.",value:e.collection_key??"",onInput:e=>this._updateConfig("collection_key",e||void 0)})}
            `:o.nothing}

        ${"relative"===i?(0,o.html)`
              <div class="field">
                <label>Relative type</label>
                ${this._renderButtonToggleGroup([{value:"calendar",label:"Calendar"},{value:"rolling",label:"Rolling"}],a,e=>this._updateTimespanRelativePeriod("calendar"===e?"day":"last_24_hours"))}
              </div>
              <div class="field">
                <label>Period</label>
                <select
                  @change=${e=>this._updateTimespanRelativePeriod(e.target.value)}
                >
                  ${("calendar"===a?[{value:"hour",label:"Hour"},{value:"day",label:"Day"},{value:"week",label:"Week"},{value:"month",label:"Month"},{value:"year",label:"Year"}]:[{value:"last_60_minutes",label:"Last 60 minutes"},{value:"last_24_hours",label:"Last 24 hours"},{value:"last_7_days",label:"Last 7 days"},{value:"last_30_days",label:"Last 30 days"},{value:"last_12_months",label:"Last 12 months"}]).map(({value:e,label:i})=>(0,o.html)`
                      <option
                        value=${e}
                        ?selected=${"relative"===t.mode&&t.period===e}
                      >
                        ${i}
                      </option>
                    `)}
                </select>
              </div>
              ${r?this._renderTextInput({label:"Count",type:"number",min:"1",step:"1",value:"relative"===t.mode?String(t.count??1):"1",onInput:e=>this._updateTimespanRelativeCount(e)}):o.nothing}
              ${r?this._renderTextInput({label:"Offset",type:"number",value:String(t.offset??0),onInput:e=>this._updateTimespanRelativeOffset(Number(e))}):o.nothing}
            `:o.nothing}

        ${"fixed"===i?(0,o.html)`
              <div class="compact-grid two">
                ${this._renderTextInput({label:"Start",helper:"ISO 8601, e.g. 2024-01-01T00:00:00.",value:"fixed"===t.mode?t.start??"":"",onInput:e=>this._updateTimespanFixedStart(e||void 0)})}
                ${this._renderTextInput({label:"End",helper:"ISO 8601, e.g. 2024-01-31T23:59:59.",value:"fixed"===t.mode?t.end??"":"",onInput:e=>this._updateTimespanFixedEnd(e||void 0)})}
              </div>
            `:o.nothing}
      </div>
    `}_renderSeriesSourceGroup(e,t){let i=this._resolveSeriesSource(e);return(0,o.html)`
      <div class="section series-source-body">
          <div class="field full-width">
            ${this._renderButtonToggleGroup([{value:"statistic",label:"Entity"},{value:"calculation",label:"Calculation"},{value:"forecast",label:"Forecast"}],i,e=>this._setSeriesSource(t,e))}
          </div>
          ${"calculation"===i?this._renderSeriesCalculationContent(e,t):"forecast"===i?this._renderSeriesForecastContent(e,t):this._renderSeriesStatisticContent(e,t)}
          ${this._renderSeriesSourceMore(e,t)}
      </div>
    `}_renderSeriesStatisticContent(e,t){if(!this.hass)return(0,o.html)`<p>Loading...</p>`;let i=(0,m.normalizeStatisticId)(e.statistic_id),r=this._resolveStatisticSource(i),s=this._getStatisticIssue(i,e.stat_type),a=r.metadata,n=!a,l=e.stat_type??(0,m.selectDefaultStatisticType)(a)??"";return(0,o.html)`
      <ha-entity-picker
        .hass=${this.hass}
        .value=${e.statistic_id}
        .label=${"Entity"}
        allow-custom-entity
        @value-changed=${e=>this._handleSeriesStatisticChanged(t,e.detail.value||void 0)}
      ></ha-entity-picker>
      <div class="field">
        <label>Statistic type</label>
        <select
          ?disabled=${n}
          @change=${e=>this._updateSeries(t,"stat_type",e.target.value)}
        >
          <option value="" ?selected=${""===l}>
            Not used
          </option>
          ${f.map(e=>{let t=(0,m.isStatisticTypeSupported)(a,e.value);return(0,o.html)`<option
                value=${e.value}
                ?selected=${l===e.value}
                ?disabled=${!t}
              >
                ${e.label}
              </option>`})}
        </select>
        <p class="hint">
          Home Assistant stores only certain aggregation types depending on the entity.
        </p>
        ${n?this._renderEditorHelpHint("raw_only"===r.status?"Statistic type does not affect RAW history.":"Select an entity with recorder statistics to choose a statistic type.","info"):s?this._renderEditorHelpHint(`${s.cause}${s.action?` \xb7 ${s.action}`:""}`,s.severity):o.nothing}
      </div>
      ${this._renderSeriesTimeOffsetFields(e,t)}
    `}_renderSeriesTimeOffsetFields(e,t){let i=$(e.time_offset?.unit)?e.time_offset.unit:"",r="number"==typeof e.time_offset?.value&&Number.isFinite(e.time_offset.value)?String(e.time_offset.value):"";return(0,o.html)`
      <div class="field">
        <label>Time offset</label>
        <select
          @change=${e=>this._updateSeriesTimeOffsetUnit(t,e.target.value)}
        >
          <option value="" ?selected=${""===i}>None</option>
          ${y.map(e=>(0,o.html)`<option value=${e.value} ?selected=${i===e.value}
                >${e.label}</option
              >`)}
        </select>
      </div>
      ${i?this._renderTextInput({label:"Offset value",helper:"Negative values load past source data.",type:"number",step:"1",value:r,onInput:e=>this._updateSeriesTimeOffsetValue(t,e)}):o.nothing}
    `}_renderSeriesSourceMore(e,t){if("bar"!==(e.chart_type??"bar")||!0!==e.show_value_labels&&void 0===e.value_label_precision)return o.nothing;let i=+(void 0!==e.value_label_precision),r=this._seriesSourceMoreExpanded.has(t)||i>0;return this._renderMoreBlock({count:i,expanded:r,onToggle:()=>this._toggleSeriesSourceMore(t,r),body:this._renderTextInput({label:"Value label precision",type:"number",step:"1",min:"0",helper:"Default 0, no unit.",value:void 0!==e.value_label_precision?String(e.value_label_precision):"",onInput:e=>this._updateSeriesNumber(t,"value_label_precision",e)})})}_renderSeriesForecastContent(e,t){let i=this._solarProductionOptions,r=e.pv_production_entity??"";return(0,o.html)`
      <p class="hint">
        Select the PV production sensor you configured in the Energy dashboard. Leave this field empty
        to use the sum of all available solar forecasts.
      </p>
      <div class="field">
        <label>PV production sensor</label>
        <select
          @change=${e=>this._updateSeries(t,"pv_production_entity",e.target.value||void 0)}
        >
          <option value="" ?selected=${""===r}>All forecasts</option>
          ${i.map(e=>(0,o.html)`<option value=${e.value} ?selected=${r===e.value}>
              ${e.label}${e.hasForecast?"":" (no forecast)"}
            </option>`)}
        </select>
      </div>
      ${this._solarOptionsLoading?(0,o.html)`<p class="hint">Loading solar sources…</p>`:0===i.length?(0,o.html)`<p class="hint">
              No PV production sources with forecasts were found in the Energy dashboard. Configure a
              solar forecast integration there to enable this option.
            </p>`:o.nothing}
      ${this._solarOptionsError?(0,o.html)`<p class="error">${this._solarOptionsError}</p>`:o.nothing}
    `}_renderSeriesCalculationContent(e,t){let i=e.calculation??{terms:[]};return(0,o.html)`
      ${this._renderTextInput({label:"Calculation unit",value:i.unit??"",onInput:e=>this._updateCalculation(t,{...i,unit:e||void 0})})}
      ${this._renderTextInput({label:"Initial value",type:"number",value:void 0!==i.initial_value?String(i.initial_value):"0",onInput:e=>this._updateCalculation(t,{...i,initial_value:e?Number(e):0})})}
      ${this._renderSeriesTimeOffsetFields(e,t)}
      <div class="terms-section">
        <div class="terms-header">
          <span class="subtitle">Terms</span>
        </div>
        <div class="terms-list">
          ${i.terms?.length?(0,o.html)`
                <ha-sortable
                  handle-selector=".series-term-drag-handle"
                  draggable-selector=".term-sortable-item"
                  @item-moved=${e=>this._handleCalculationTermMoved(e,t)}
                >
                  <div class="native-sortable-list">
                    ${i.terms.map((e,i)=>(0,o.html)`
                        <div class="term-sortable-item">
                          ${this._renderCalculationTerm(t,i,e)}
                        </div>
                      `)}
                  </div>
                </ha-sortable>
              `:(0,o.html)`<p class="hint">No terms configured yet.</p>`}
          ${this._renderNativeAddButton("Add term",()=>this._addCalculationTerm(t))}
        </div>
      </div>
    `}_renderCalculationTerm(e,t,i){let r=i.operation??"add",s=`${e}-${t}`,a=this._expandedTermKeys.has(s),n=this._formatOperation(r),l=i.statistic_id&&i.statistic_id.trim().length?i.statistic_id.trim():void 0!==i.constant?`Constant: ${i.constant}`:"No input selected";return this._renderExpansionPanel({title:n,leading:this._renderDragHandle("series-term-drag-handle","Drag to reorder term"),summary:l,expanded:a,onToggle:()=>this._toggleTermExpanded(s),actions:(0,o.html)`
          <ha-icon-button
            class="editor-action"
            .label=${"Remove term"}
            @click=${i=>{i.stopPropagation(),this._removeCalculationTerm(e,t)}}
          >
            <ha-icon icon="mdi:delete"></ha-icon>
          </ha-icon-button>
      `,body:(0,o.html)`
        <div class="term-body column">
          ${this._renderTermOperationField(e,t,r)}
          ${this._renderTermSourceFields(e,t,i)}
          ${this._renderTermTransformFields(e,t,i)}
        </div>
      `,className:"term-panel"})}_renderTermOperationField(e,t,i){let r=i??"add";return(0,o.html)`
      <div class="field">
        <label>Operation</label>
        <select
          @change=${i=>this._updateTerm(e,t,"operation",i.target.value)}
        >
          <option value="add" ?selected=${"add"===r}>Add</option>
          <option value="subtract" ?selected=${"subtract"===r}>Subtract</option>
          <option value="multiply" ?selected=${"multiply"===r}>Multiply</option>
          <option value="divide" ?selected=${"divide"===r}>Divide</option>
        </select>
      </div>
    `}_renderTermSourceFields(e,t,i){if(!this.hass)return(0,o.html)`<p>Loading...</p>`;let r=void 0!==i.constant?"constant":"statistic",s=(0,m.normalizeStatisticId)(i.statistic_id),a=this._resolveStatisticSource(s),n=this._getStatisticIssue(s,i.stat_type),l=a.metadata,d=!l,c=i.stat_type??(0,m.selectDefaultStatisticType)(l)??"";return(0,o.html)`
      <div class="field full-width">
        <label>Input type</label>
        ${this._renderButtonToggleGroup([{value:"statistic",label:"Entity"},{value:"constant",label:"Constant"}],r,i=>this._setTermMode(e,t,i))}
      </div>
      ${"statistic"===r?(0,o.html)`
            <ha-entity-picker
              .hass=${this.hass}
              .value=${i.statistic_id}
              .label=${"Entity"}
              allow-custom-entity
              @value-changed=${i=>this._handleTermStatisticChanged(e,t,i.detail.value||void 0)}
            ></ha-entity-picker>
            <div class="field">
              <label>Statistic type</label>
              <select
                ?disabled=${d}
                @change=${i=>this._updateTerm(e,t,"stat_type",i.target.value)}
              >
                <option value="" ?selected=${""===c}>
                  Not used
                </option>
                ${f.map(e=>{let t=(0,m.isStatisticTypeSupported)(l,e.value);return(0,o.html)`<option
                      value=${e.value}
                      ?selected=${c===e.value}
                      ?disabled=${!t}
                    >
                      ${e.label}
                    </option>`})}
              </select>
              <p class="hint">
                Home Assistant stores only certain aggregation types depending on the entity.
              </p>
              ${d?this._renderEditorHelpHint("raw_only"===a.status?"Statistic type does not affect RAW history.":"Select an entity with recorder statistics to choose a statistic type.","info"):n?this._renderEditorHelpHint(`${n.cause}${n.action?` \xb7 ${n.action}`:""}`,n.severity):o.nothing}
            </div>
          `:(0,o.html)`
            ${this._renderTextInput({label:"Constant",helper:"Fixed value added every step",type:"number",value:void 0!==i.constant?String(i.constant):"",onInput:i=>this._updateTermNumber(e,t,"constant",i)})}
          `}
    `}_renderTermTransformFields(e,t,i){return void 0!==i.constant?o.nothing:(0,o.html)`
      <span class="subtitle term-transform-title">Transform</span>
      ${this._renderTextInput({label:"Multiply",type:"number",value:void 0!==i.multiply?String(i.multiply):"",onInput:i=>this._updateTermNumber(e,t,"multiply",i)})}
      ${this._renderTextInput({label:"Add",type:"number",value:void 0!==i.add?String(i.add):"",onInput:i=>this._updateTermNumber(e,t,"add",i)})}
      ${this._renderTextInput({label:"Clip min",type:"number",value:void 0!==i.clip_min?String(i.clip_min):"",onInput:i=>this._updateTermNumber(e,t,"clip_min",i)})}
      ${this._renderTextInput({label:"Clip max",type:"number",value:void 0!==i.clip_max?String(i.clip_max):"",onInput:i=>this._updateTermNumber(e,t,"clip_max",i)})}
    `}_setTermMode(e,t,i){this._mutateTerm(e,t,e=>{"statistic"===i?(e.constant=void 0,e.statistic_id||(e.statistic_id="")):(e.statistic_id=void 0,e.stat_type=void 0,e.multiply=void 0,e.add=void 0,e.clip_min=void 0,e.clip_max=void 0,void 0===e.constant&&(e.constant=0))})}_renderSeriesStyleSegment(e,t){let i=e.chart_type??"bar",r="line"===i||"step"===i,s=r&&!0===e.fill,a="string"==typeof e.color?e.color.trim():void 0,n=this._extractPresetToken(a),l=a?n||E:T,d=this._colorModeSelections.get(t)??l,c=this._customColorDrafts.get(t),h=this._resolveAutoColorToken(t),u=d===E?c??a??"":c??"",p=d===T?h:d===E?u||a||h:d,_=void 0!==p?this._normalizeColorToken(p):void 0,m=d===E?u??"":"";return(0,o.html)`
      <div class="section">
        <div class="compact-grid two">
          <div class="field">
            <label>Chart type</label>
            ${this._renderButtonToggleGroup([{value:"bar",label:"Bar"},{value:"line",label:"Line"},{value:"step",label:"Step"}],i,e=>this._setSeriesChartType(t,e))}
          </div>
          <div class="field">
            <label>Y axis</label>
            ${this._renderButtonToggleGroup([{value:"left",label:"Left"},{value:"right",label:"Right"}],e.y_axis??"left",e=>this._updateSeries(t,"y_axis",e))}
          </div>
        </div>
        <div class="color-row">
          <div class="field">
            <label>Series color</label>
            <div class="color-select-wrapper">
              ${this._renderColorPreview(_,i)}
              <select
                .value=${d}
                @change=${e=>this._handleSeriesColorSelect(t,e.target.value)}
              >
                <option
                  value=${T}
                  ?selected=${d===T}
                >
                  Default
                </option>
                ${g.map(e=>(0,o.html)`<option
                      value=${e.value}
                      ?selected=${d===e.value}
                    >
                      ${e.label}
                    </option>`)}
                <option
                  value=${E}
                  ?selected=${d===E}
                >
                  Custom
                </option>
              </select>
            </div>
          </div>
        </div>
        ${d===E?(0,o.html)`
              <div class="color-row">
                ${this._renderColorTextInput({label:"Custom color",value:m??"",onInput:e=>this._handleCustomColorInput(t,e)})}
              </div>
            `:o.nothing}
        ${this._renderTextInput({label:"Stack group",helper:"Series using the same name stack together.",value:e.stack??"",onInput:e=>this._updateSeries(t,"stack",e||void 0)})}
        ${r?(0,o.html)`
              ${this._renderCompactToggle("Fill",!0===e.fill,e=>this._updateSeries(t,"fill",e))}
            `:o.nothing}
        ${this._renderSeriesStyleMore(e,t,s)}
      </div>
    `}_renderSeriesStyleMore(e,t,i){let r=e.chart_type??"bar",s="line"===r||"step"===r,a=i&&!0===e.gradient_fill,n=this._countSeriesStyleMoreFields(e),l=this._seriesStyleMoreExpanded.has(t)||n>0,d="string"==typeof e.compare_color?e.compare_color.trim():void 0,c=this._extractPresetToken(d),h=d?c||E:M,u=this._compareColorModeSelections.get(t)??h,p=this._compareCustomColorDrafts.get(t),_=u===E?p??d??"":p??"",m=this._deriveCustomDraftForSeries(t),f=u===M?m:u===E?p??d??"":u,v=void 0!==f?this._normalizeColorToken(f):void 0,y=(0,o.html)`
      <div class="color-row">
        <div class="field">
          <label>Compare series color</label>
          <div class="color-select-wrapper">
            ${this._renderColorPreview(v,r)}
            <select
              .value=${u}
              @change=${e=>this._handleCompareColorSelect(t,e.target.value)}
            >
              <option
                value=${M}
                ?selected=${u===M}
              >
                Inherit
              </option>
              ${g.map(e=>(0,o.html)`<option
                    value=${e.value}
                    ?selected=${u===e.value}
                  >
                    ${e.label}
                  </option>`)}
              <option
                value=${E}
                ?selected=${u===E}
              >
                Custom
              </option>
            </select>
          </div>
        </div>
      </div>
      ${u===E?(0,o.html)`
            <div class="color-row">
              ${this._renderColorTextInput({label:"Custom compare color",value:_??"",onInput:e=>this._handleCompareCustomColorInput(t,e)})}
            </div>
          `:o.nothing}
    `;return this._renderMoreBlock({count:n,expanded:l,onToggle:()=>this._toggleSeriesStyleMore(t,l),body:(0,o.html)`
        ${i?(0,o.html)`
              ${this._renderCompactToggle("Gradient fill",!0===e.gradient_fill,e=>this._updateSeries(t,"gradient_fill",e))}
            `:o.nothing}
        ${this._renderTextInput({label:"Fill opacity",type:"number",step:"0.01",min:"0",max:"1",helper:s?a?"Default 0.75, zero line 0.25.":"Default 0.15 for line fill.":"Default 0.5 for bars.",value:void 0!==e.fill_opacity?String(e.fill_opacity):"",onInput:e=>this._updateSeriesNumber(t,"fill_opacity",e)})}
        ${i?this._renderTextInput({label:"Fill to series",helper:"Name of the line series to fill towards.",value:e.fill_to_series??"",onInput:e=>this._updateSeries(t,"fill_to_series",e||void 0)}):o.nothing}
        ${this._renderTextInput({label:"Line opacity",type:"number",step:"0.01",min:"0",max:"1",helper:"Default 0.85 for lines, 1.0 for bars.",value:void 0!==e.line_opacity?String(e.line_opacity):"",onInput:e=>this._updateSeriesNumber(t,"line_opacity",e)})}
        ${y}
        ${s?(0,o.html)`
              ${this._renderTextInput({label:"Line width",type:"number",step:"0.5",min:"0.5",helper:"Default 1.5.",value:void 0!==e.line_width?String(e.line_width):"",onInput:e=>this._updateSeriesNumber(t,"line_width",e)})}
              <div class="field">
                <label>Line style</label>
                ${this._renderButtonToggleGroup([{value:"solid",label:"Solid"},{value:"dashed",label:"Dashed"},{value:"dotted",label:"Dotted"}],e.line_style??"solid",e=>this._setSeriesLineStyle(t,e))}
              </div>
              ${this._renderTextInput({label:"Smooth",helper:"Boolean or number (0-1). Empty uses default.",value:void 0!==e.smooth?String(e.smooth):"",onInput:e=>this._updateSeriesSmooth(t,e)})}
            `:o.nothing}
      `})}_renderSeriesVisibilitySegment(e,t){let i=e.chart_type??"bar",r="bar"===i&&!0===e.show_value_labels;return(0,o.html)`
      <div class="section">
        <div class="toggle-grid" role="group" aria-label="Series visibility">
          ${this._renderCompactToggle("Chart",!1!==e.show_in_chart,e=>this._updateSeries(t,"show_in_chart",e))}
          ${this._renderCompactToggle("Legend",!1!==e.show_in_legend,e=>this._updateSeries(t,"show_in_legend",e))}
          ${this._renderCompactToggle("Tooltip",!1!==e.show_in_tooltip,e=>this._updateSeries(t,"show_in_tooltip",e))}
          ${this._renderCompactToggle("Hidden by default",!0===e.hidden_by_default,e=>this._updateSeries(t,"hidden_by_default",e))}
          ${"bar"===i?(0,o.html)`
                <div class="toggle-with-hint">
                  ${this._renderCompactToggle("Value labels",r,e=>this._updateSeries(t,"show_value_labels",e))}
                  <p class="hint">
                    Displays values directly above bars. Not compatible with stacked bars.
                  </p>
                </div>
              `:o.nothing}
        </div>
      </div>
    `}_countSeriesStyleMoreFields(e){return[e.compare_color,!0===e.gradient_fill||void 0,e.fill_opacity,e.fill_to_series,e.line_opacity,e.line_width,e.line_style&&"solid"!==e.line_style?e.line_style:void 0,e.smooth].filter(e=>void 0!==e&&""!==e).length}_toggleSeriesStyleMore(e,t){let i=new Set(this._seriesStyleMoreExpanded);t?i.delete(e):i.add(e),this._seriesStyleMoreExpanded=i}_toggleSeriesSourceMore(e,t){let i=new Set(this._seriesSourceMoreExpanded);t?i.delete(e):i.add(e),this._seriesSourceMoreExpanded=i}_renderSeriesDisplayGroup(e,t){let i=e.chart_type??"bar",r="line"===i||"step"===i,s="bar"===i,a=r&&!0===e.fill,n=a&&!0===e.gradient_fill,l="string"==typeof e.color?e.color.trim():void 0,d=this._extractPresetToken(l),c=l?d||E:T,h=this._colorModeSelections.get(t)??c,u=this._customColorDrafts.get(t),p=this._resolveAutoColorToken(t),_=h===E?u??l??"":u??"",m=h===T?p:h===E?_||l||p:h,f=void 0!==m?this._normalizeColorToken(m):void 0,v=h===E?_??"":"",y="string"==typeof e.compare_color?e.compare_color.trim():void 0,S=this._extractPresetToken(y),b=y?S||E:M,x=this._compareColorModeSelections.get(t)??b,$=this._compareCustomColorDrafts.get(t),w=x===E?$??y??"":$??"",C=x===M?m:x===E?$??y??"":x,A=void 0!==C?this._normalizeColorToken(C):void 0;return(0,o.html)`
      <div class="group-card">
        <div class="group-header">
          <span class="group-title">Display</span>
        </div>
        <div class="group-body">
          <div class="color-row">
            <div class="field">
              <label>Series color</label>
              <div class="color-select-wrapper">
                ${this._renderColorPreview(f,i)}
                <select
                  .value=${h}
                  @change=${e=>this._handleSeriesColorSelect(t,e.target.value)}
                >
                  <option
                    value=${T}
                    ?selected=${h===T}
                  >
                    Default (Auto palette)
                  </option>
                  ${g.map(e=>(0,o.html)`<option
                        value=${e.value}
                        ?selected=${h===e.value}
                      >
                        ${e.label}
                      </option>`)}
                  <option
                    value=${E}
                    ?selected=${h===E}
                  >
                    Custom
                  </option>
                </select>
              </div>
            </div>
          </div>
          ${h===E?(0,o.html)`
                <div class="color-row">
                  ${this._renderColorTextInput({label:"Custom color",value:v??"",onInput:e=>this._handleCustomColorInput(t,e)})}
                </div>
              `:o.nothing}
          <div class="color-row">
            <div class="field">
              <label>Compare series color</label>
              <div class="color-select-wrapper">
                ${this._renderColorPreview(A,i)}
                <select
                  .value=${x}
                  @change=${e=>this._handleCompareColorSelect(t,e.target.value)}
                >
                  <option
                    value=${M}
                    ?selected=${x===M}
                  >
                    Inherit (default)
                  </option>
                  ${g.map(e=>(0,o.html)`<option
                        value=${e.value}
                        ?selected=${x===e.value}
                      >
                        ${e.label}
                      </option>`)}
                  <option
                    value=${E}
                    ?selected=${x===E}
                  >
                    Custom
                  </option>
                </select>
              </div>
            </div>
          </div>
          ${x===E?(0,o.html)`
                <div class="color-row">
                  ${this._renderColorTextInput({label:"Custom compare color",value:w??"",onInput:e=>this._handleCompareCustomColorInput(t,e)})}
                </div>
              `:o.nothing}
          ${this._renderCompactToggle("Show in legend",!1!==e.show_in_legend,e=>this._updateSeries(t,"show_in_legend",e))}
          ${this._renderCompactToggle("Hidden by default",!0===e.hidden_by_default,e=>this._updateSeries(t,"hidden_by_default",e))}
          ${this._renderCompactToggle("Show in chart",!1!==e.show_in_chart,e=>this._updateSeries(t,"show_in_chart",e))}
          ${this._renderCompactToggle("Show in tooltip",!1!==e.show_in_tooltip,e=>this._updateSeries(t,"show_in_tooltip",e))}
          ${s?(0,o.html)`
                ${this._renderCompactToggle("Show value labels",!0===e.show_value_labels,e=>this._updateSeries(t,"show_value_labels",e))}
                ${!0===e.show_value_labels?this._renderTextInput({label:"Value label precision",type:"number",step:"1",min:"0",helper:"Default 0, no unit",value:void 0!==e.value_label_precision?String(e.value_label_precision):"",onInput:e=>this._updateSeriesNumber(t,"value_label_precision",e)}):o.nothing}
              `:o.nothing}
          ${r?(0,o.html)`
                ${this._renderCompactToggle("Fill area",!0===e.fill,e=>this._updateSeries(t,"fill",e))}
              `:o.nothing}
          ${a?(0,o.html)`
                ${this._renderCompactToggle("Gradient fill",!0===e.gradient_fill,e=>this._updateSeries(t,"gradient_fill",e))}
              `:o.nothing}
          ${this._renderTextInput({label:"Fill opacity",type:"number",step:"0.01",min:"0",max:"1",helper:r?n?"Default 0.75 (zero line 0.25)":"Default 0.15 for line fill":"Default 0.5 for bars",value:void 0!==e.fill_opacity?String(e.fill_opacity):"",onInput:e=>this._updateSeriesNumber(t,"fill_opacity",e)})}
          ${a?(0,o.html)`
                ${this._renderTextInput({label:"Fill to series",helper:"Name of the line series to fill towards",value:e.fill_to_series??"",onInput:e=>this._updateSeries(t,"fill_to_series",e||void 0)})}
              `:o.nothing}
          ${this._renderTextInput({label:"Line opacity",type:"number",step:"0.01",min:"0",max:"1",helper:"Default 0.85 for lines, 1.0 for bars",value:void 0!==e.line_opacity?String(e.line_opacity):"",onInput:e=>this._updateSeriesNumber(t,"line_opacity",e)})}
          ${r?(0,o.html)`
                ${this._renderTextInput({label:"Line width",type:"number",step:"0.5",min:"0.5",helper:"Default 1.5",value:void 0!==e.line_width?String(e.line_width):"",onInput:e=>this._updateSeriesNumber(t,"line_width",e)})}
                <div class="field">
                  <label>Line style</label>
                  ${this._renderButtonToggleGroup([{value:"solid",label:"Solid"},{value:"dashed",label:"Dashed"},{value:"dotted",label:"Dotted"}],e.line_style??"solid",e=>this._setSeriesLineStyle(t,e))}
                </div>
              `:o.nothing}
          ${this._renderTextInput({label:"Stack group",helper:"Series using the same name will stack together",value:e.stack??"",onInput:e=>this._updateSeries(t,"stack",e||void 0)})}
        </div>
      </div>
    `}_renderSeriesTransformGroup(e,t){return(0,o.html)`
      <div class="section">
          ${this._renderTextInput({label:"Multiply",type:"number",value:void 0!==e.multiply?String(e.multiply):"",onInput:e=>this._updateSeriesNumber(t,"multiply",e)})}
          ${this._renderTextInput({label:"Add",type:"number",value:void 0!==e.add?String(e.add):"",onInput:e=>this._updateSeriesNumber(t,"add",e)})}
          ${this._renderTextInput({label:"Clip min",type:"number",value:void 0!==e.clip_min?String(e.clip_min):"",onInput:e=>this._updateSeriesNumber(t,"clip_min",e)})}
          ${this._renderTextInput({label:"Clip max",type:"number",value:void 0!==e.clip_max?String(e.clip_max):"",onInput:e=>this._updateSeriesNumber(t,"clip_max",e)})}
      </div>
    `}_setSeriesChartType(e,t){let i=this._config.series??[];i[e]&&i[e]?.chart_type!==t&&(this._updateSeries(e,"chart_type",t),"line"!==t&&this._updateSeries(e,"smooth",void 0))}_setSeriesLineStyle(e,t){let i=this._config.series??[];i[e]?.line_style!==t&&this._updateSeries(e,"line_style",t)}_setSeriesSource(e,t){let i=(this._config.series??[])[e];if(i&&this._resolveSeriesSource(i)!==t){if("calculation"===t){this._replaceSeries(e,(0,m.convertSeriesToCalculation)(i)),this._setSeriesOptionGroupExpanded(e,"source",!0);return}if("forecast"===t){this._replaceSeries(e,(0,m.cleanSeriesForForecast)(i)),this._setSeriesOptionGroupExpanded(e,"source",!0);return}this._replaceSeries(e,(0,m.convertSeriesToStatistic)(i)),this._setSeriesOptionGroupExpanded(e,"source",!0)}}_getSeriesReferenceOptions(){return(this._config?.series??[]).filter(e=>"string"==typeof e.id&&e.id.trim().length).map((e,t)=>{let i=e.id.trim(),r=e.name??e.statistic_id??e.pv_production_entity??(e.calculation?"Calculation series":`Series ${t+1}`);return{value:i,label:`${r} (${i})`}})}_getStackOptions(){let e=new Set;return(this._config?.series??[]).forEach(t=>{let i=t.stack?.trim();i&&e.add(i)}),Array.from(e).sort((e,t)=>e.localeCompare(t))}_createDefaultHeaderMetric(e="series"){return"stack"===e?{source:"stack",stack:this._getStackOptions()[0],reducer:"sum",sign:"signed"}:"entity_state"===e?{source:"entity_state",entity_id:""}:"calculation"===e?{calculation:{initial_value:0,terms:[this._createDefaultHeaderCalculationTerm("series")]}}:{source:"series",series_id:this._getSeriesReferenceOptions()[0]?.value,reducer:"sum"}}_createDefaultHeaderCalculationTerm(e){return"stack"===e?{operation:"add",source:"stack",stack:this._getStackOptions()[0],reducer:"sum",sign:"signed"}:"entity_state"===e?{operation:"add",source:"entity_state",entity_id:""}:"constant"===e?{operation:"add",source:"constant",constant:0}:{operation:"add",source:"series",series_id:this._getSeriesReferenceOptions()[0]?.value,reducer:"sum"}}_getHeaderMetricMode(e){return"calculation"in e?"calculation":e.source}_setHeaderChipEnabled(e){if(!e)return void this._updateConfig("header",void 0);let t=this._config?.header?.chip;this._updateHeaderChip(t??{metric:this._createDefaultHeaderMetric()})}_updateHeaderChip(e){this._updateConfig("header",{...this._config?.header??{},chip:e})}_updateHeaderChipField(e,t){let i={...this._config?.header?.chip??{metric:this._createDefaultHeaderMetric()}};void 0===t||""===t?delete i[e]:i[e]=t,this._updateHeaderChip(i)}_updateHeaderChipNumber(e,t){this._updateHeaderChipField(e,""===t?void 0:Number(t))}_updateHeaderMetric(e){let t={...this._config?.header?.chip??{},metric:e};this._updateHeaderChip(t)}_setHeaderMetricMode(e){let t=this._config?.header?.chip?.metric;t&&this._getHeaderMetricMode(t)===e||(this._updateHeaderMetric(this._createDefaultHeaderMetric(e)),"calculation"===e&&(this._expandedHeaderTermKeys=new Set([0])))}_updateHeaderCalculation(e){let t=this._config?.header?.chip?.metric,i=t&&"calculation"in t?{...t,calculation:e}:{...this._createDefaultHeaderMetric("calculation"),calculation:e};this._updateHeaderMetric(i)}_addHeaderCalculationTerm(){let e=this._config?.header?.chip?.metric,t=e&&"calculation"in e?e.calculation:{initial_value:0,terms:[]},i=[...t.terms??[],this._createDefaultHeaderCalculationTerm("series")];this._updateHeaderCalculation({...t,terms:i}),this._expandedHeaderTermKeys=new Set(this._expandedHeaderTermKeys).add(i.length-1)}_removeHeaderCalculationTerm(e){let t=this._config?.header?.chip?.metric;if(!t||!("calculation"in t))return;let i=[...t.calculation.terms??[]];i.splice(e,1),this._updateHeaderCalculation({...t.calculation,terms:i});let r=new Set;this._expandedHeaderTermKeys.forEach(t=>{t!==e&&r.add(t>e?t-1:t)}),this._expandedHeaderTermKeys=r}_moveHeaderCalculationTerm(e,t){let i=this._config?.header?.chip?.metric;if(!i||!("calculation"in i))return;let r=[...i.calculation.terms??[]];this._canMoveIndex(r,e,t)&&(r.splice(t,0,r.splice(e,1)[0]),this._updateHeaderCalculation({...i.calculation,terms:r}),this._expandedHeaderTermKeys=new Set(Array.from(this._expandedHeaderTermKeys).map(i=>this._remapMovedIndex(i,e,t))))}_setHeaderTermSource(e,t){let i=this._config?.header?.chip?.metric;if(!i||!("calculation"in i))return;let r=i.calculation.terms?.[e],s={...this._createDefaultHeaderCalculationTerm(t),operation:r?.operation??"add"},a=[...i.calculation.terms??[]];a[e]=s,this._updateHeaderCalculation({...i.calculation,terms:a}),this._expandedHeaderTermKeys=new Set(this._expandedHeaderTermKeys).add(e)}_updateHeaderCalculationTerm(e,t,i){let r=this._config?.header?.chip?.metric;if(!r||!("calculation"in r))return;let s=[...r.calculation.terms??[]];if(e<0||e>=s.length)return;let a={...s[e]};void 0===i||""===i?delete a[t]:a[t]=i,s[e]=a,this._updateHeaderCalculation({...r.calculation,terms:s}),this._expandedHeaderTermKeys=new Set(this._expandedHeaderTermKeys).add(e)}_toggleHeaderTermExpanded(e){let t=new Set(this._expandedHeaderTermKeys);t.has(e)?t.delete(e):t.add(e),this._expandedHeaderTermKeys=t}_formatHeaderTermDescriptor(e){if("series"===e.source){let t=this._getSeriesReferenceOptions().find(t=>t.value===e.series_id);return t?.label??e.series_id??"No series selected"}return"stack"===e.source?e.stack?`Stack: ${e.stack}`:"No stack selected":"entity_state"===e.source?e.entity_id??"No entity selected":"constant"===e.source?`Constant: ${e.constant??0}`:"No input selected"}_addSeries(){let e=[...this._config.series??[],{statistic_id:"",chart_type:"bar"}];this._updateConfig("series",e);let t=e.length-1;this._expandedSeries=new Set(this._expandedSeries).add(t),this._setSeriesOptionGroupExpanded(t,"source",!0)}_handleSeriesMoved(e){e.target===e.currentTarget&&(e.stopPropagation(),this._moveSeries(e.detail.oldIndex,e.detail.newIndex))}_moveSeries(e,t){let i=[...this._config.series??[]];this._canMoveIndex(i,e,t)&&(i.splice(t,0,i.splice(e,1)[0]),this._moveSeriesIndexState(e,t),this._updateConfig("series",i))}_moveSeriesIndexState(e,t){let i=i=>this._remapMovedIndex(i,e,t);this._expandedSeries=new Set(Array.from(this._expandedSeries).map(i)),this._seriesStyleMoreExpanded=new Set(Array.from(this._seriesStyleMoreExpanded).map(i)),this._seriesSourceMoreExpanded=new Set(Array.from(this._seriesSourceMoreExpanded).map(i));let r=new Map;this._seriesOptionGroupsExpanded.forEach((e,t)=>{let s=this._parseSeriesOptionGroupKey(t);s&&r.set(this._seriesOptionGroupKey(i(s.index),s.group),e)}),this._seriesOptionGroupsExpanded=r;let s=[];this._expandedTermKeys.forEach(e=>{let[t,r]=e.split("-"),a=Number(t);Number.isNaN(a)||s.push(`${i(a)}-${r}`)}),this._expandedTermKeys=new Set(s)}_handleCalculationTermMoved(e,t){e.stopPropagation(),this._moveCalculationTerm(t,e.detail.oldIndex,e.detail.newIndex)}_handleHeaderCalculationTermMoved(e){e.stopPropagation(),this._moveHeaderCalculationTerm(e.detail.oldIndex,e.detail.newIndex)}_canMoveIndex(e,t,i){return t!==i&&t>=0&&i>=0&&t<e.length&&i<e.length}_remapMovedIndex(e,t,i){return e===t?i:t<i&&e>t&&e<=i?e-1:t>i&&e>=i&&e<t?e+1:e}_duplicateSeries(e){let t=[...this._config.series??[]],i=t[e];if(!i)return;let r=(0,m.cloneSeriesForDuplicate)(i);t.splice(e+1,0,r),this._updateConfig("series",t);let s=e+1,a=new Set;this._expandedSeries.forEach(t=>{a.add(t>e?t+1:t)}),a.add(s),this._expandedSeries=a,this._setSeriesOptionGroupExpanded(s,"source",!0)}_confirmRemoveSeries(e){let t=this._config?.series?.[e],i=t?this._formatSeriesTitle(t,e):`Series ${e+1}`;window.confirm(`Delete ${i}?`)&&this._removeSeries(e)}_removeSeries(e){let t=[...this._config.series??[]];t.splice(e,1),this._updateConfig("series",t);let i=new Set;this._expandedSeries.forEach(r=>{if(r===e)return;let s=r>e?r-1:r;s>=0&&s<t.length&&i.add(s)}),this._expandedSeries=i;let r=[];this._expandedTermKeys.forEach(i=>{let[s,a]=i.split("-"),o=Number(s);if(Number.isNaN(o)||o===e)return;let n=o>e?o-1:o;n>=0&&n<t.length&&r.push(`${n}-${a}`)}),this._expandedTermKeys=new Set(r),this._seriesStyleMoreExpanded=new Set(Array.from(this._seriesStyleMoreExpanded).filter(t=>t!==e).map(t=>t>e?t-1:t).filter(e=>e>=0&&e<t.length)),this._seriesSourceMoreExpanded=new Set(Array.from(this._seriesSourceMoreExpanded).filter(t=>t!==e).map(t=>t>e?t-1:t).filter(e=>e>=0&&e<t.length));let s=new Map;this._seriesOptionGroupsExpanded.forEach((i,r)=>{let a=this._parseSeriesOptionGroupKey(r);if(!a||a.index===e)return;let o=a.index>e?a.index-1:a.index;o>=0&&o<t.length&&s.set(this._seriesOptionGroupKey(o,a.group),i)}),this._seriesOptionGroupsExpanded=s}_addCalculationTerm(e){let t=[...this._config.series??[]],i={...t[e]},r={...i.calculation??{terms:[]},terms:[...i.calculation?.terms??[],{operation:"add"}]};i.calculation=r,t[e]=i,this._updateConfig("series",t),this._expandedSeries=new Set(this._expandedSeries).add(e);let s=(r.terms?.length??1)-1;this._expandedTermKeys=new Set(this._expandedTermKeys).add(`${e}-${s}`)}_removeCalculationTerm(e,t){let i=[...this._config.series??[]],r={...i[e]};if(!r.calculation?.terms)return;let s=[...r.calculation.terms];s.splice(t,1),r.calculation={...r.calculation,terms:s},i[e]=r,this._updateConfig("series",i);let a=[];this._expandedTermKeys.forEach(i=>{let[r,s]=i.split("-"),o=Number(r),n=Number(s);if(o!==e||Number.isNaN(n))return void a.push(i);n!==t&&a.push(`${e}-${n>t?n-1:n}`)}),this._expandedTermKeys=new Set(a)}_moveCalculationTerm(e,t,i){let r=[...this._config.series??[]],s={...r[e]},a=s.calculation;if(!a?.terms)return;let o=[...a.terms];if(!this._canMoveIndex(o,t,i))return;o.splice(i,0,o.splice(t,1)[0]),s.calculation={...a,terms:o},r[e]=s,this._updateConfig("series",r),this._expandedSeries=new Set(this._expandedSeries).add(e);let n=new Set;this._expandedTermKeys.forEach(r=>{let[s,a]=r.split("-"),o=Number(s),l=Number(a);if(o!==e||Number.isNaN(l))return void n.add(r);n.add(`${e}-${this._remapMovedIndex(l,t,i)}`)}),this._expandedTermKeys=n}_updateTerm(e,t,i,r){this._mutateTerm(e,t,e=>{"constant"===i&&void 0!==r&&""!==r&&(e.statistic_id=void 0,e.stat_type=void 0,e.multiply=void 0,e.add=void 0,e.clip_min=void 0,e.clip_max=void 0),"statistic_id"===i&&(void 0===r||""===r)&&(e.constant=void 0),e[i]=""===r?void 0:r})}_updateTermNumber(e,t,i,r){let s=""===r?void 0:Number(r);this._updateTerm(e,t,i,s)}_mutateTerm(e,t,i){let r=[...this._config.series??[]],s={...r[e]},a=s.calculation;if(!a?.terms||t<0||t>=a.terms.length)return;let o=[...a.terms],n={...o[t]};i(n),o[t]=n,s.calculation={...a,terms:o},r[e]=s,this._updateConfig("series",r),this._expandedSeries=new Set(this._expandedSeries).add(e),this._expandedTermKeys=new Set(this._expandedTermKeys).add(`${e}-${t}`)}_updateCalculation(e,t){let i=[...this._config.series??[]],r={...i[e],calculation:t};i[e]=r,this._updateConfig("series",i),this._expandedSeries=new Set(this._expandedSeries).add(e)}_updateSeries(e,t,i){let r=[...this._config.series??[]],s={...r[e]};s[t]=""===i?void 0:i,"calculation"===t&&void 0===i&&(s.calculation=void 0),r[e]=s,this._updateConfig("series",r),this._expandedSeries=new Set(this._expandedSeries).add(e)}_replaceSeries(e,t){let i=[...this._config.series??[]];e<0||e>=i.length||(i[e]=t,this._updateConfig("series",i),this._expandedSeries=new Set(this._expandedSeries).add(e))}_handleSeriesStatisticChanged(e,t){let i=(0,m.normalizeStatisticId)(t),r=[...this._config.series??[]],s={...r[e]};s.statistic_id=i||void 0,delete s.stat_type,r[e]=s,this._updateConfig("series",r),this._expandedSeries=new Set(this._expandedSeries).add(e),this._setSeriesOptionGroupExpanded(e,"source",!0),i&&this._autoSelectSeriesStatisticType(e,i)}async _autoSelectSeriesStatisticType(e,t){await this._ensureStatisticMetadata([t]);let i=this._config?.series?.[e];if(!i||(0,m.normalizeStatisticId)(i.statistic_id)!==t)return;let r=this._getStatisticMetadata(t),s=(0,m.selectDefaultStatisticType)(r);this._replaceSeries(e,{...i,stat_type:s})}_handleTermStatisticChanged(e,t,i){let r=(0,m.normalizeStatisticId)(i);this._mutateTerm(e,t,e=>{e.statistic_id=r||void 0,e.constant=void 0,delete e.stat_type}),r&&this._autoSelectTermStatisticType(e,t,r)}async _autoSelectTermStatisticType(e,t,i){await this._ensureStatisticMetadata([i]);let r=this._config?.series?.[e]?.calculation?.terms?.[t];if(!r||(0,m.normalizeStatisticId)(r.statistic_id)!==i)return;let s=this._getStatisticMetadata(i),a=(0,m.selectDefaultStatisticType)(s);this._mutateTerm(e,t,e=>{e.stat_type=a})}_updateSeriesNumber(e,t,i){let r=""===i?void 0:Number(i);this._updateSeries(e,t,r)}_updateSeriesTimeOffsetUnit(e,t){if(!$(t))return void this._updateSeries(e,"time_offset",void 0);let i=this._config?.series?.[e]?.time_offset,r="number"==typeof i?.value&&Number.isFinite(i.value)&&Number.isInteger(i.value)&&0!==i.value?i.value:-1;this._updateSeries(e,"time_offset",{value:r,unit:t})}_updateSeriesTimeOffsetValue(e,t){let i=this._config?.series?.[e]?.time_offset,r=$(i?.unit)?i.unit:void 0;if(!r)return;if(""===t)return void this._updateSeries(e,"time_offset",void 0);let s=Number(t);if(Number.isFinite(s)&&Number.isInteger(s)){if(0===s)return void this._updateSeries(e,"time_offset",void 0);this._updateSeries(e,"time_offset",{value:s,unit:r})}}_updateSeriesSmooth(e,t){if(""===t)return void this._updateSeries(e,"smooth",void 0);if("true"===t||"false"===t)return void this._updateSeries(e,"smooth","true"===t);let i=Number(t);this._updateSeries(e,"smooth",Number.isNaN(i)?void 0:i)}_updateAxisConfig(e,t,i){let r,s=[...this._config?.y_axes??[]],a=s.findIndex(t=>t.id===e);if(("min"===t||"max"===t)&&(r=""===i?void 0:Number(i),""!==i&&Number.isNaN(r)))return;let o="min"===t||"max"===t?r:"unit"===t&&""===i?void 0:i;if(a>=0){let e={...s[a]};e[t]=o,void 0===o&&delete e[t],s[a]=e}else s.push({id:e,[t]:o});let n=s.filter(e=>{let{id:t,...i}=e;return Object.keys(i).length>0});this._updateConfig("y_axes",n.length>0?n:void 0)}_updateAggregation(e,t){let i={...this._config.aggregation};""===t?delete i[e]:i[e]=t;let r=this._cleanupAggregation(i);this._updateConfig("aggregation",r)}_updateAggregationFlag(e,t){let i={...this._config.aggregation};t?i[e]=t:delete i[e];let r=this._cleanupAggregation(i);this._updateConfig("aggregation",r)}_updateAggregationPicker(e,t){let i={...this._config.aggregation,energy_picker:{...this._config.aggregation?.energy_picker??{}}};""===t?delete i.energy_picker?.[e]:i.energy_picker[e]=t;let r=this._cleanupAggregation(i);this._updateConfig("aggregation",r)}_cleanupAggregation(e){return e.energy_picker&&0===Object.keys(e.energy_picker).length&&delete e.energy_picker,e.raw_options&&0===Object.keys(e.raw_options).length&&delete e.raw_options,Object.keys(e).length?e:void 0}_toggleSeriesExpanded(e){let t=new Set(this._expandedSeries);if(t.has(e)){t.delete(e);let i=[];this._expandedTermKeys.forEach(t=>{t.startsWith(`${e}-`)||i.push(t)}),this._expandedTermKeys=new Set(i)}else t.add(e);this._expandedSeries=t}_toggleTermExpanded(e){let t=new Set(this._expandedTermKeys);t.has(e)?t.delete(e):t.add(e),this._expandedTermKeys=t}_syncExpandedState(e){let t=new Set;this._expandedSeries.forEach(i=>{i>=0&&i<e.length&&t.add(i)}),this._expandedSeries=t;let i=new Set;this._expandedTermKeys.forEach(t=>{let[r,s]=t.split("-"),a=Number(r),o=Number(s);if(Number.isNaN(a)||Number.isNaN(o)||a<0||a>=e.length)return;let n=e[a]?.calculation?.terms?.length??0;o>=0&&o<n&&i.add(t)}),this._expandedTermKeys=i;let r=new Map;this._seriesOptionGroupsExpanded.forEach((t,i)=>{let s=this._parseSeriesOptionGroupKey(i);s&&s.index>=0&&s.index<e.length&&r.set(i,t)}),this._seriesOptionGroupsExpanded=r,this._seriesStyleMoreExpanded=new Set(Array.from(this._seriesStyleMoreExpanded).filter(t=>t>=0&&t<e.length)),this._seriesSourceMoreExpanded=new Set(Array.from(this._seriesSourceMoreExpanded).filter(t=>t>=0&&t<e.length))}_formatOperation(e){switch(e){case"subtract":return"Subtract";case"multiply":return"Multiply";case"divide":return"Divide";default:return"Add"}}_updateConfig(e,t){if(!this._config)return;let i="series"===e&&Array.isArray(t)?this._normalizeSeriesIds(t):t,r={...this._config,[e]:i};void 0===i&&delete r[e],"aggregation"===e&&(void 0===i?delete r.aggregation:"object"==typeof i&&0===Object.keys(i).length&&delete r.aggregation),"header"===e&&(void 0===i||"object"==typeof i&&0===Object.keys(i).length)&&delete r.header,r.timespan?.mode!=="energy"&&(delete r.collection_key,delete r.allow_compare),r.series?.length||(r.series=[]),this._config=r,this._syncCustomColorDrafts(r.series??[]),this._syncColorSelections(r.series??[]),this._syncCompareCustomColorDrafts(r.series??[]),this._syncCompareColorSelections(r.series??[]),"title"!==e&&"header"!==e||this._cardHeaderHasContent(r)||(this._headerExpanded=!1),(0,h.fireEvent)(this,"config-changed",{config:r})}_syncCustomColorDrafts(e){let t=new Map;e.forEach((e,i)=>{if(!e)return;let r="string"==typeof e.color?e.color.trim():void 0,s=this._extractPresetToken(r),a=void 0!==s&&g.some(e=>e.value===s);if(r&&!a)return void t.set(i,r);if(!r&&this._customColorDrafts.has(i)){let e=this._customColorDrafts.get(i);void 0!==e&&t.set(i,e)}}),this._customColorDrafts=t}_syncColorSelections(e){let t=new Map;e.forEach((e,i)=>{let r="string"==typeof e.color?e.color.trim():void 0,s=this._extractPresetToken(r),a=r?s||E:T,o=this._colorModeSelections.get(i);return o===E?void t.set(i,E):o&&o===a?void t.set(i,o):void t.set(i,a)}),this._colorModeSelections=t}_syncCompareCustomColorDrafts(e){let t=new Map;e.forEach((e,i)=>{if(!e)return;let r="string"==typeof e.compare_color?e.compare_color.trim():void 0,s=this._extractPresetToken(r),a=void 0!==s&&g.some(e=>e.value===s);if(r&&!a)return void t.set(i,r);if(!r&&this._compareCustomColorDrafts.has(i)){let e=this._compareCustomColorDrafts.get(i);void 0!==e&&t.set(i,e)}}),this._compareCustomColorDrafts=t}_syncCompareColorSelections(e){let t=new Map;e.forEach((e,i)=>{let r="string"==typeof e.compare_color?e.compare_color.trim():void 0,s=this._extractPresetToken(r),a=r?s||E:M,o=this._compareColorModeSelections.get(i);return o===E?void t.set(i,E):o&&o===a?void t.set(i,o):void t.set(i,a)}),this._compareColorModeSelections=t}_updateBooleanConfig(e,t){this._updateConfig(e,t)}_updateNumericConfig(e,t){let i=""===t?void 0:Number(t);this._updateConfig(e,i)}_setTimespanMode(e){this._updateConfig("timespan","energy"===e?{mode:"energy"}:"relative"===e?{mode:"relative",period:"day",offset:0}:{mode:"fixed",start:void 0,end:void 0})}_updateTimespanRelativePeriod(e){let t=this._config?.timespan;if(t&&"relative"===t.mode){if(!C(e)){let{count:i,offset:r,...s}=t;this._updateConfig("timespan",{...s,period:e});return}this._updateConfig("timespan",{...t,period:e})}}_updateTimespanRelativeOffset(e){let t=this._config?.timespan;t&&"relative"===t.mode&&this._updateConfig("timespan",{...t,offset:e})}_updateTimespanRelativeCount(e){let t=this._config?.timespan;if(!t||"relative"!==t.mode||!C(t.period))return;let i=Number(e),r=Number.isFinite(i)&&Number.isInteger(i)&&i>=1?i:1;if(1===r){let{count:e,...i}=t;this._updateConfig("timespan",i);return}this._updateConfig("timespan",{...t,count:r})}_updateTimespanFixedStart(e){let t=this._config?.timespan;t&&"fixed"===t.mode&&this._updateConfig("timespan",{...t,start:e})}_updateTimespanFixedEnd(e){let t=this._config?.timespan;t&&"fixed"===t.mode&&this._updateConfig("timespan",{...t,end:e})}_toggleAggregationExpanded(){this._aggregationExpanded=!this._aggregationExpanded}_toggleAxesExpanded(){this._axesExpanded=!this._axesExpanded}_toggleLegendExpanded(){this._legendExpanded=!this._legendExpanded}_toggleTooltipExpanded(){this._tooltipExpanded=!this._tooltipExpanded}_formatAxesSummary(e,t,i){let r=[];if(e){let t=[];if(e.unit&&t.push(e.unit),e.fit_y_data&&t.push("fit"),e.center_zero&&t.push("center zero"),void 0!==e.min||void 0!==e.max){let i=`${e.min??"auto"}-${e.max??"auto"}`;t.push(i)}t.length&&r.push(`Left: ${t.join(", ")}`)}if(i&&t){let e=[];if(t.unit&&e.push(t.unit),t.fit_y_data&&e.push("fit"),t.center_zero&&e.push("center zero"),void 0!==t.min||void 0!==t.max){let i=`${t.min??"auto"}-${t.max??"auto"}`;e.push(i)}e.length&&r.push(`Right: ${e.join(", ")}`)}return r.length?r.join(" • "):void 0}_formatAggregationSummary(e,t){if(!e||0===Object.keys(e).length)return"Automatic";let i=[];return!t&&e.manual?i.push(this._formatStatisticsPeriod(e.manual)):t&&e.energy_picker&&Object.keys(e.energy_picker).length?i.push("Picker overrides"):i.push("Automatic"),e.fallback&&i.push(`Fallback: ${this._formatStatisticsPeriod(e.fallback)}`),this._aggregationUsesRaw(e)&&i.push("RAW history"),e.compute_current_hour&&i.push("Compute current hour"),i.join(" · ")}_formatStatisticsPeriod(e){return v.find(t=>t.value===e)?.label??(0,m.formatAggregationTarget)(e)}_setColorSelection(e,t){let i=new Map(this._colorModeSelections);void 0===t?i.delete(e):i.set(e,t),this._colorModeSelections=i}_setCustomColorDraft(e,t){let i=new Map(this._customColorDrafts);if(void 0===t)i.delete(e);else{let r=t.trim();r?i.set(e,r):i.delete(e)}this._customColorDrafts=i}_setCompareColorSelection(e,t){let i=new Map(this._compareColorModeSelections);void 0===t?i.delete(e):i.set(e,t),this._compareColorModeSelections=i}_setCompareCustomColorDraft(e,t){let i=new Map(this._compareCustomColorDrafts);if(void 0===t)i.delete(e);else{let r=t.trim();r?i.set(e,r):i.delete(e)}this._compareCustomColorDrafts=i}_handleSeriesColorSelect(e,t){if(!this._config)return;let i=t.trim(),r=(this._config.series??[])[e],s="string"==typeof r?.color?r.color.trim():void 0;if(i===T){this._setColorSelection(e,T),this._setCustomColorDraft(e,void 0),this._updateSeries(e,"color",void 0);return}if(i===E){let t=this._customColorDrafts.get(e)??s??this._resolveAutoColorToken(e)??"";this._setCustomColorDraft(e,t),this._setColorSelection(e,E),s&&!this._extractPresetToken(s)&&this._updateSeries(e,"color",s);return}this._setColorSelection(e,i),this._setCustomColorDraft(e,void 0),this._updateSeries(e,"color",i)}_handleCustomColorInput(e,t){let i=t.trim();this._setColorSelection(e,E),i?(this._setCustomColorDraft(e,i),this._updateSeries(e,"color",i)):(this._setCustomColorDraft(e,void 0),this._updateSeries(e,"color",void 0))}_handleCompareColorSelect(e,t){if(!this._config)return;let i=t.trim(),r=(this._config.series??[])[e],s="string"==typeof r?.compare_color?r.compare_color.trim():void 0;if(i===M){this._setCompareColorSelection(e,M),this._setCompareCustomColorDraft(e,void 0),this._updateSeries(e,"compare_color",void 0);return}if(i===E){let t=this._compareCustomColorDrafts.get(e)??s??"";this._setCompareCustomColorDraft(e,t),this._setCompareColorSelection(e,E),s&&!this._extractPresetToken(s)&&this._updateSeries(e,"compare_color",s);return}this._setCompareColorSelection(e,i),this._setCompareCustomColorDraft(e,void 0),this._updateSeries(e,"compare_color",i)}_handleCompareCustomColorInput(e,t){let i=t.trim();this._setCompareColorSelection(e,E),i?(this._setCompareCustomColorDraft(e,i),this._updateSeries(e,"compare_color",i)):(this._setCompareCustomColorDraft(e,void 0),this._updateSeries(e,"compare_color",void 0))}_deriveCustomDraftForSeries(e){let t=this._config?.series?.[e];if(!t)return;let i="string"==typeof t.color?t.color.trim():void 0;return i||this._resolveAutoColorToken(e)}_resolveAutoColor(e){let t=this._resolveAutoColorToken(e);if(t)return this._normalizeColorToken(t)}_resolveAutoColorToken(e){let t=this._config?.color_cycle??[],i=t.length>0?t:u.DEFAULT_COLORS;if(0!==i.length)return i[e%i.length]}_extractPresetToken(e){if(!e)return;let t=e.trim();if(t){if(t.startsWith("var(")&&t.endsWith(")")){let e=t.slice(4,-1).trim(),i=e.indexOf(","),r=-1===i?e:e.slice(0,i).trim();return r.startsWith("--")?r:void 0}if(t.startsWith("--"))return t}}_normalizeColorToken(e){if(!e)return"";let t=e.trim();if(!t)return"";if(t.startsWith("var(")&&t.endsWith(")")){let e=t.slice(4,-1).trim(),i=e.indexOf(","),r=-1===i?e:e.slice(0,i).trim(),s=-1===i?void 0:e.slice(i+1).trim(),a=this._lookupCssVariable(r);return a||(s?this._normalizeColorToken(s):t)}return t.startsWith("--")?this._lookupCssVariable(t)??t:t}_lookupCssVariable(e){if(!e||!e.startsWith("--"))return;let t=[];try{this.isConnected&&t.push(getComputedStyle(this))}catch(e){}for(let i of(t.push(getComputedStyle(document.documentElement)),t)){let t=i.getPropertyValue(e)?.trim();if(t)return t}}_toNativeColorValue(e){let t=this._normalizeColorToken(e),i=this._normalizeHexColor(t);if(i)return i;let r=this._rgbCssColorToHex(t);return r||"#000000"}_normalizeHexColor(e){let t=e?.trim();if(!t)return;let i=/^#([0-9a-f]{3})$/i.exec(t);if(i)return`#${i[1].split("").map(e=>`${e}${e}`).join("")}`.toLowerCase();let r=/^#([0-9a-f]{6})$/i.exec(t);return r?`#${r[1].toLowerCase()}`:void 0}_rgbCssColorToHex(e){let t=/^rgba?\(\s*([0-9.]+)(?:,|\s)\s*([0-9.]+)(?:,|\s)\s*([0-9.]+)/i.exec(e?.trim()??"");if(!t)return;let i=t.slice(1,4).map(e=>Math.max(0,Math.min(255,Math.round(Number(e)))).toString(16).padStart(2,"0"));return i.every(e=>2===e.length)?`#${i.join("")}`:void 0}_renderColorPreview(e,t){if(!e)return o.nothing;let i=this._normalizeColorToken(e);if(!i)return o.nothing;let r="line"===t||"step"===t;return(0,o.html)`
      <svg class="color-preview" width="16" height="16" viewBox="0 0 16 16">
        <circle
          cx="8"
          cy="8"
          r="7"
          fill="${i}"
          fill-opacity="${r?.15:.45}"
          stroke="${i}"
          stroke-opacity="${r?.85:.75}"
          stroke-width="1.5"
        />
      </svg>
    `}static{this.styles=(0,s.css)`
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

    .color-text-control {
      position: relative;
      min-width: 0;
    }

    .color-text-control .color-value-input {
      padding-inline-end: var(--ha-space-12, 48px);
    }

    .color-text-control .color-picker-input {
      position: absolute;
      inset-inline-end: var(--ha-space-2, 8px);
      top: 50%;
      transform: translateY(-50%);
      box-sizing: border-box;
      width: var(--ha-space-8, 32px);
      height: var(--ha-space-8, 32px);
      padding: 2px;
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      border-radius: var(--ha-border-radius-sm, 6px);
      background: var(--card-background-color, var(--primary-background-color));
      cursor: pointer;
    }

    .color-picker-input::-webkit-color-swatch-wrapper {
      padding: 0;
    }

    .color-picker-input::-webkit-color-swatch {
      border: none;
      border-radius: 4px;
    }

    .color-picker-input::-moz-color-swatch {
      border: none;
      border-radius: 4px;
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

    .segmented-row {
      display: grid;
      grid-template-columns: minmax(72px, max-content) minmax(0, 1fr);
      align-items: center;
      gap: var(--ha-space-3, 12px);
    }

    .segmented-row-label {
      color: var(--primary-text-color);
      font-size: var(--ha-font-size-m, 14px);
      line-height: var(--ha-line-height-normal, 1.4);
    }

    .segmented-row-control,
    .segmented-only {
      min-width: 0;
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
      padding-top: 0;
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
      align-items: start;
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
      width: 100%;
      box-sizing: border-box;
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

    .toggle-with-hint {
      display: flex;
      flex-direction: column;
      gap: var(--ha-space-1, 4px);
      min-width: 0;
      width: 100%;
      align-self: start;
    }

    .toggle-with-hint .compact-toggle {
      min-height: var(--ha-space-10, 40px);
    }

    @media (max-width: 420px) {
      .toggle-grid {
        grid-template-columns: 1fr;
      }

      .segmented-row {
        grid-template-columns: 1fr;
        align-items: stretch;
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
  `}constructor(...e){super(...e),this._headerExpanded=!1,this._chartSettingsExpanded=!0,this._seriesSectionExpanded=!0,this._legendExpanded=!1,this._tooltipExpanded=!1,this._chartMoreExpanded=!1,this._headerMetricMoreExpanded=!1,this._expandedSeries=new Set,this._seriesOptionGroupsExpanded=new Map,this._seriesStyleMoreExpanded=new Set,this._seriesSourceMoreExpanded=new Set,this._expandedTermKeys=new Set,this._expandedHeaderTermKeys=new Set,this._axesExpanded=!1,this._aggregationExpanded=!0,this._customColorDrafts=new Map,this._colorModeSelections=new Map,this._compareCustomColorDrafts=new Map,this._compareColorModeSelections=new Map,this._metadataByStatisticId=new Map,this._solarProductionOptions=[],this._solarOptionsLoading=!1,this._metadataRequests=new Set}}(0,r.__decorate)([(0,d.property)({attribute:!1})],k.prototype,"hass",void 0),(0,r.__decorate)([(0,c.state)()],k.prototype,"_config",void 0),(0,r.__decorate)([(0,c.state)()],k.prototype,"_headerExpanded",void 0),(0,r.__decorate)([(0,c.state)()],k.prototype,"_chartSettingsExpanded",void 0),(0,r.__decorate)([(0,c.state)()],k.prototype,"_seriesSectionExpanded",void 0),(0,r.__decorate)([(0,c.state)()],k.prototype,"_legendExpanded",void 0),(0,r.__decorate)([(0,c.state)()],k.prototype,"_tooltipExpanded",void 0),(0,r.__decorate)([(0,c.state)()],k.prototype,"_chartMoreExpanded",void 0),(0,r.__decorate)([(0,c.state)()],k.prototype,"_headerMetricMoreExpanded",void 0),(0,r.__decorate)([(0,c.state)()],k.prototype,"_expandedSeries",void 0),(0,r.__decorate)([(0,c.state)()],k.prototype,"_seriesOptionGroupsExpanded",void 0),(0,r.__decorate)([(0,c.state)()],k.prototype,"_seriesStyleMoreExpanded",void 0),(0,r.__decorate)([(0,c.state)()],k.prototype,"_seriesSourceMoreExpanded",void 0),(0,r.__decorate)([(0,c.state)()],k.prototype,"_expandedTermKeys",void 0),(0,r.__decorate)([(0,c.state)()],k.prototype,"_expandedHeaderTermKeys",void 0),(0,r.__decorate)([(0,c.state)()],k.prototype,"_axesExpanded",void 0),(0,r.__decorate)([(0,c.state)()],k.prototype,"_aggregationExpanded",void 0),(0,r.__decorate)([(0,c.state)()],k.prototype,"_customColorDrafts",void 0),(0,r.__decorate)([(0,c.state)()],k.prototype,"_colorModeSelections",void 0),(0,r.__decorate)([(0,c.state)()],k.prototype,"_compareCustomColorDrafts",void 0),(0,r.__decorate)([(0,c.state)()],k.prototype,"_compareColorModeSelections",void 0),(0,r.__decorate)([(0,c.state)()],k.prototype,"_metadataByStatisticId",void 0),(0,r.__decorate)([(0,c.state)()],k.prototype,"_solarProductionOptions",void 0),(0,r.__decorate)([(0,c.state)()],k.prototype,"_solarOptionsLoading",void 0),(0,r.__decorate)([(0,c.state)()],k.prototype,"_solarOptionsError",void 0),k=(0,r.__decorate)([(0,l.customElement)("energy-custom-graph-card-editor")],k)}),o("hAmm6",function(e,i){function r(e,t,i,r){var s,a=arguments.length,o=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,i,r);else for(var n=e.length-1;n>=0;n--)(s=e[n])&&(o=(a<3?s(o):a>3?s(t,i,o):s(t,i))||o);return a>3&&o&&Object.defineProperty(t,i,o),o}t(e.exports,"__decorate",()=>r),"function"==typeof SuppressedError&&SuppressedError}),o("fUwgm",function(e,i){t(e.exports,"css",()=>a("bBTYI").css),t(e.exports,"html",()=>a("iKGUH").html),t(e.exports,"LitElement",()=>a("2cNIw").LitElement),t(e.exports,"nothing",()=>a("iKGUH").nothing),a("b2QMl"),a("3Gj0C"),a("2cNIw"),a("kLmv1")}),o("b2QMl",function(e,t){var i,r=a("87XX6");let s=window,o=s.trustedTypes,n=o?o.emptyScript:"",l=s.reactiveElementPolyfillSupport,d={toAttribute(e,t){switch(t){case Boolean:e=e?n:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},c=(e,t)=>t!==e&&(t==t||e==e),h={attribute:!0,type:String,converter:d,reflect:!1,hasChanged:c},u="finalized";class p extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu()}static addInitializer(e){var t;this.finalize(),(null!=(t=this.h)?t:this.h=[]).push(e)}static get observedAttributes(){this.finalize();let e=[];return this.elementProperties.forEach((t,i)=>{let r=this._$Ep(i,t);void 0!==r&&(this._$Ev.set(r,i),e.push(r))}),e}static createProperty(e,t=h){if(t.state&&(t.attribute=!1),this.finalize(),this.elementProperties.set(e,t),!t.noAccessor&&!this.prototype.hasOwnProperty(e)){let i="symbol"==typeof e?Symbol():"__"+e,r=this.getPropertyDescriptor(e,i,t);void 0!==r&&Object.defineProperty(this.prototype,e,r)}}static getPropertyDescriptor(e,t,i){return{get(){return this[t]},set(r){let s=this[e];this[t]=r,this.requestUpdate(e,s,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)||h}static finalize(){if(this.hasOwnProperty(u))return!1;this[u]=!0;let e=Object.getPrototypeOf(this);if(e.finalize(),void 0!==e.h&&(this.h=[...e.h]),this.elementProperties=new Map(e.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){let e=this.properties;for(let t of[...Object.getOwnPropertyNames(e),...Object.getOwnPropertySymbols(e)])this.createProperty(t,e[t])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(e){let t=[];if(Array.isArray(e))for(let i of new Set(e.flat(1/0).reverse()))t.unshift((0,r.getCompatibleStyle)(i));else void 0!==e&&t.push((0,r.getCompatibleStyle)(e));return t}static _$Ep(e,t){let i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}_$Eu(){var e;this._$E_=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null==(e=this.constructor.h)||e.forEach(e=>e(this))}addController(e){var t,i;(null!=(t=this._$ES)?t:this._$ES=[]).push(e),void 0!==this.renderRoot&&this.isConnected&&(null==(i=e.hostConnected)||i.call(e))}removeController(e){var t;null==(t=this._$ES)||t.splice(this._$ES.indexOf(e)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach((e,t)=>{this.hasOwnProperty(t)&&(this._$Ei.set(t,this[t]),delete this[t])})}createRenderRoot(){var e;let t=null!=(e=this.shadowRoot)?e:this.attachShadow(this.constructor.shadowRootOptions);return(0,r.adoptStyles)(t,this.constructor.elementStyles),t}connectedCallback(){var e;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null==(e=this._$ES)||e.forEach(e=>{var t;return null==(t=e.hostConnected)?void 0:t.call(e)})}enableUpdating(e){}disconnectedCallback(){var e;null==(e=this._$ES)||e.forEach(e=>{var t;return null==(t=e.hostDisconnected)?void 0:t.call(e)})}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$EO(e,t,i=h){var r;let s=this.constructor._$Ep(e,i);if(void 0!==s&&!0===i.reflect){let a=(void 0!==(null==(r=i.converter)?void 0:r.toAttribute)?i.converter:d).toAttribute(t,i.type);this._$El=e,null==a?this.removeAttribute(s):this.setAttribute(s,a),this._$El=null}}_$AK(e,t){var i;let r=this.constructor,s=r._$Ev.get(e);if(void 0!==s&&this._$El!==s){let e=r.getPropertyOptions(s),a="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==(null==(i=e.converter)?void 0:i.fromAttribute)?e.converter:d;this._$El=s,this[s]=a.fromAttribute(t,e.type),this._$El=null}}requestUpdate(e,t,i){let r=!0;void 0!==e&&(((i=i||this.constructor.getPropertyOptions(e)).hasChanged||c)(this[e],t)?(this._$AL.has(e)||this._$AL.set(e,t),!0===i.reflect&&this._$El!==e&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(e,i))):r=!1),!this.isUpdatePending&&r&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var e;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach((e,t)=>this[t]=e),this._$Ei=void 0);let t=!1,i=this._$AL;try{(t=this.shouldUpdate(i))?(this.willUpdate(i),null==(e=this._$ES)||e.forEach(e=>{var t;return null==(t=e.hostUpdate)?void 0:t.call(e)}),this.update(i)):this._$Ek()}catch(e){throw t=!1,this._$Ek(),e}t&&this._$AE(i)}willUpdate(e){}_$AE(e){var t;null==(t=this._$ES)||t.forEach(e=>{var t;return null==(t=e.hostUpdated)?void 0:t.call(e)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(e){return!0}update(e){void 0!==this._$EC&&(this._$EC.forEach((e,t)=>this._$EO(t,this[t],e)),this._$EC=void 0),this._$Ek()}updated(e){}firstUpdated(e){}}p[u]=!0,p.elementProperties=new Map,p.elementStyles=[],p.shadowRootOptions={mode:"open"},null==l||l({ReactiveElement:p}),(null!=(i=s.reactiveElementVersions)?i:s.reactiveElementVersions=[]).push("1.6.3")}),o("87XX6",function(e,i){t(e.exports,"adoptStyles",()=>l),t(e.exports,"getCompatibleStyle",()=>d);let r=window,s=r.ShadowRoot&&(void 0===r.ShadyCSS||r.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,a=Symbol(),o=new WeakMap;class n{constructor(e,t,i){if(this._$cssResult$=!0,i!==a)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(s&&void 0===e){let i=void 0!==t&&1===t.length;i&&(e=o.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&o.set(t,e))}return e}toString(){return this.cssText}}let l=(e,t)=>{s?e.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet):t.forEach(t=>{let i=document.createElement("style"),s=r.litNonce;void 0!==s&&i.setAttribute("nonce",s),i.textContent=t.cssText,e.appendChild(i)})},d=s?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t,i="";for(let t of e.cssRules)i+=t.cssText;return new n("string"==typeof(t=i)?t:t+"",void 0,a)})(e):e}),o("3Gj0C",function(e,i){var r;t(e.exports,"noChange",()=>w);let s=window,a=s.trustedTypes,o=a?a.createPolicy("lit-html",{createHTML:e=>e}):void 0,n="$lit$",l=`lit$${(Math.random()+"").slice(9)}$`,d="?"+l,c=`<${d}>`,h=document,u=()=>h.createComment(""),p=e=>null===e||"object"!=typeof e&&"function"!=typeof e,_=Array.isArray,m="[ 	\n\f\r]",g=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,f=/-->/g,v=/>/g,y=RegExp(`>|${m}(?:([^\\s"'>=/]+)(${m}*=${m}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),S=/'/g,b=/"/g,x=/^(?:script|style|textarea|title)$/i,$=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),w=($(1),$(2),Symbol.for("lit-noChange")),C=Symbol.for("lit-nothing"),T=new WeakMap,E=h.createTreeWalker(h,129,null,!1);function M(e,t){if(!Array.isArray(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==o?o.createHTML(t):t}class A{constructor({strings:e,_$litType$:t},i){let r;this.parts=[];let s=0,o=0,h=e.length-1,p=this.parts,[_,m]=((e,t)=>{let i=e.length-1,r=[],s,a=2===t?"<svg>":"",o=g;for(let t=0;t<i;t++){let i=e[t],d,h,u=-1,p=0;for(;p<i.length&&(o.lastIndex=p,null!==(h=o.exec(i)));)p=o.lastIndex,o===g?"!--"===h[1]?o=f:void 0!==h[1]?o=v:void 0!==h[2]?(x.test(h[2])&&(s=RegExp("</"+h[2],"g")),o=y):void 0!==h[3]&&(o=y):o===y?">"===h[0]?(o=null!=s?s:g,u=-1):void 0===h[1]?u=-2:(u=o.lastIndex-h[2].length,d=h[1],o=void 0===h[3]?y:'"'===h[3]?b:S):o===b||o===S?o=y:o===f||o===v?o=g:(o=y,s=void 0);let _=o===y&&e[t+1].startsWith("/>")?" ":"";a+=o===g?i+c:u>=0?(r.push(d),i.slice(0,u)+n+i.slice(u)+l+_):i+l+(-2===u?(r.push(void 0),t):_)}return[M(e,a+(e[i]||"<?>")+(2===t?"</svg>":"")),r]})(e,t);if(this.el=A.createElement(_,i),E.currentNode=this.el.content,2===t){let e=this.el.content,t=e.firstChild;t.remove(),e.append(...t.childNodes)}for(;null!==(r=E.nextNode())&&p.length<h;){if(1===r.nodeType){if(r.hasAttributes()){let e=[];for(let t of r.getAttributeNames())if(t.endsWith(n)||t.startsWith(l)){let i=m[o++];if(e.push(t),void 0!==i){let e=r.getAttribute(i.toLowerCase()+n).split(l),t=/([.?@])?(.*)/.exec(i);p.push({type:1,index:s,name:t[2],strings:e,ctor:"."===t[1]?I:"?"===t[1]?R:"@"===t[1]?F:N})}else p.push({type:6,index:s})}for(let t of e)r.removeAttribute(t)}if(x.test(r.tagName)){let e=r.textContent.split(l),t=e.length-1;if(t>0){r.textContent=a?a.emptyScript:"";for(let i=0;i<t;i++)r.append(e[i],u()),E.nextNode(),p.push({type:2,index:++s});r.append(e[t],u())}}}else if(8===r.nodeType)if(r.data===d)p.push({type:2,index:s});else{let e=-1;for(;-1!==(e=r.data.indexOf(l,e+1));)p.push({type:7,index:s}),e+=l.length-1}s++}}static createElement(e,t){let i=h.createElement("template");return i.innerHTML=e,i}}function k(e,t,i=e,r){var s,a,o;if(t===w)return t;let n=void 0!==r?null==(s=i._$Co)?void 0:s[r]:i._$Cl,l=p(t)?void 0:t._$litDirective$;return(null==n?void 0:n.constructor)!==l&&(null==(a=null==n?void 0:n._$AO)||a.call(n,!1),void 0===l?n=void 0:(n=new l(e))._$AT(e,i,r),void 0!==r?(null!=(o=i._$Co)?o:i._$Co=[])[r]=n:i._$Cl=n),void 0!==n&&(t=k(e,n._$AS(e,t.values),n,r)),t}class H{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){var t;let{el:{content:i},parts:r}=this._$AD,s=(null!=(t=null==e?void 0:e.creationScope)?t:h).importNode(i,!0);E.currentNode=s;let a=E.nextNode(),o=0,n=0,l=r[0];for(;void 0!==l;){if(o===l.index){let t;2===l.type?t=new D(a,a.nextSibling,this,e):1===l.type?t=new l.ctor(a,l.name,l.strings,this,e):6===l.type&&(t=new O(a,this,e)),this._$AV.push(t),l=r[++n]}o!==(null==l?void 0:l.index)&&(a=E.nextNode(),o++)}return E.currentNode=h,s}v(e){let t=0;for(let i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class D{constructor(e,t,i,r){var s;this.type=2,this._$AH=C,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=r,this._$Cp=null==(s=null==r?void 0:r.isConnected)||s}get _$AU(){var e,t;return null!=(t=null==(e=this._$AM)?void 0:e._$AU)?t:this._$Cp}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return void 0!==t&&11===(null==e?void 0:e.nodeType)&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){let i;p(e=k(this,e,t))?e===C||null==e||""===e?(this._$AH!==C&&this._$AR(),this._$AH=C):e!==this._$AH&&e!==w&&this._(e):void 0!==e._$litType$?this.g(e):void 0!==e.nodeType?this.$(e):_(i=e)||"function"==typeof(null==i?void 0:i[Symbol.iterator])?this.T(e):this._(e)}k(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}$(e){this._$AH!==e&&(this._$AR(),this._$AH=this.k(e))}_(e){this._$AH!==C&&p(this._$AH)?this._$AA.nextSibling.data=e:this.$(h.createTextNode(e)),this._$AH=e}g(e){var t;let{values:i,_$litType$:r}=e,s="number"==typeof r?this._$AC(e):(void 0===r.el&&(r.el=A.createElement(M(r.h,r.h[0]),this.options)),r);if((null==(t=this._$AH)?void 0:t._$AD)===s)this._$AH.v(i);else{let e=new H(s,this),t=e.u(this.options);e.v(i),this.$(t),this._$AH=e}}_$AC(e){let t=T.get(e.strings);return void 0===t&&T.set(e.strings,t=new A(e)),t}T(e){_(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,i,r=0;for(let s of e)r===t.length?t.push(i=new D(this.k(u()),this.k(u()),this,this.options)):i=t[r],i._$AI(s),r++;r<t.length&&(this._$AR(i&&i._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){var i;for(null==(i=this._$AP)||i.call(this,!1,!0,t);e&&e!==this._$AB;){let t=e.nextSibling;e.remove(),e=t}}setConnected(e){var t;void 0===this._$AM&&(this._$Cp=e,null==(t=this._$AP)||t.call(this,e))}}class N{constructor(e,t,i,r,s){this.type=1,this._$AH=C,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=s,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=C}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(e,t=this,i,r){let s=this.strings,a=!1;if(void 0===s)(a=!p(e=k(this,e,t,0))||e!==this._$AH&&e!==w)&&(this._$AH=e);else{let r,o,n=e;for(e=s[0],r=0;r<s.length-1;r++)(o=k(this,n[i+r],t,r))===w&&(o=this._$AH[r]),a||(a=!p(o)||o!==this._$AH[r]),o===C?e=C:e!==C&&(e+=(null!=o?o:"")+s[r+1]),this._$AH[r]=o}a&&!r&&this.j(e)}j(e){e===C?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=e?e:"")}}class I extends N{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===C?void 0:e}}let P=a?a.emptyScript:"";class R extends N{constructor(){super(...arguments),this.type=4}j(e){e&&e!==C?this.element.setAttribute(this.name,P):this.element.removeAttribute(this.name)}}class F extends N{constructor(e,t,i,r,s){super(e,t,i,r,s),this.type=5}_$AI(e,t=this){var i;if((e=null!=(i=k(this,e,t,0))?i:C)===w)return;let r=this._$AH,s=e===C&&r!==C||e.capture!==r.capture||e.once!==r.once||e.passive!==r.passive,a=e!==C&&(r===C||s);s&&this.element.removeEventListener(this.name,this,r),a&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t,i;"function"==typeof this._$AH?this._$AH.call(null!=(i=null==(t=this.options)?void 0:t.host)?i:this.element,e):this._$AH.handleEvent(e)}}class O{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){k(this,e)}}let U=s.litHtmlPolyfillSupport;null==U||U(A,D),(null!=(r=s.litHtmlVersions)?r:s.litHtmlVersions=[]).push("2.8.0")}),o("2cNIw",function(e,i){t(e.exports,"css",()=>a("bBTYI").css),t(e.exports,"ReactiveElement",()=>a("c8jHW").ReactiveElement),t(e.exports,"html",()=>a("iKGUH").html),t(e.exports,"noChange",()=>a("iKGUH").noChange),t(e.exports,"nothing",()=>a("iKGUH").nothing),t(e.exports,"render",()=>a("iKGUH").render),t(e.exports,"LitElement",()=>l);var r,s,o=a("c8jHW"),n=a("iKGUH");o.ReactiveElement;class l extends o.ReactiveElement{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e;let t=super.createRenderRoot();return null!=(e=this.renderOptions).renderBefore||(e.renderBefore=t.firstChild),t}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=(0,n.render)(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),null==(e=this._$Do)||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),null==(e=this._$Do)||e.setConnected(!1)}render(){return n.noChange}}l.finalized=!0,l._$litElement$=!0,null==(r=globalThis.litElementHydrateSupport)||r.call(globalThis,{LitElement:l});let d=globalThis.litElementPolyfillSupport;null==d||d({LitElement:l}),(null!=(s=globalThis.litElementVersions)?s:globalThis.litElementVersions=[]).push("3.3.3")}),o("c8jHW",function(e,i){t(e.exports,"ReactiveElement",()=>_),t(e.exports,"css",()=>a("bBTYI").css);var r,s=a("bBTYI");let o=window,n=o.trustedTypes,l=n?n.emptyScript:"",d=o.reactiveElementPolyfillSupport,c={toAttribute(e,t){switch(t){case Boolean:e=e?l:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},h=(e,t)=>t!==e&&(t==t||e==e),u={attribute:!0,type:String,converter:c,reflect:!1,hasChanged:h},p="finalized";class _ extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu()}static addInitializer(e){var t;this.finalize(),(null!=(t=this.h)?t:this.h=[]).push(e)}static get observedAttributes(){this.finalize();let e=[];return this.elementProperties.forEach((t,i)=>{let r=this._$Ep(i,t);void 0!==r&&(this._$Ev.set(r,i),e.push(r))}),e}static createProperty(e,t=u){if(t.state&&(t.attribute=!1),this.finalize(),this.elementProperties.set(e,t),!t.noAccessor&&!this.prototype.hasOwnProperty(e)){let i="symbol"==typeof e?Symbol():"__"+e,r=this.getPropertyDescriptor(e,i,t);void 0!==r&&Object.defineProperty(this.prototype,e,r)}}static getPropertyDescriptor(e,t,i){return{get(){return this[t]},set(r){let s=this[e];this[t]=r,this.requestUpdate(e,s,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)||u}static finalize(){if(this.hasOwnProperty(p))return!1;this[p]=!0;let e=Object.getPrototypeOf(this);if(e.finalize(),void 0!==e.h&&(this.h=[...e.h]),this.elementProperties=new Map(e.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){let e=this.properties;for(let t of[...Object.getOwnPropertyNames(e),...Object.getOwnPropertySymbols(e)])this.createProperty(t,e[t])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(e){let t=[];if(Array.isArray(e))for(let i of new Set(e.flat(1/0).reverse()))t.unshift((0,s.getCompatibleStyle)(i));else void 0!==e&&t.push((0,s.getCompatibleStyle)(e));return t}static _$Ep(e,t){let i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}_$Eu(){var e;this._$E_=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null==(e=this.constructor.h)||e.forEach(e=>e(this))}addController(e){var t,i;(null!=(t=this._$ES)?t:this._$ES=[]).push(e),void 0!==this.renderRoot&&this.isConnected&&(null==(i=e.hostConnected)||i.call(e))}removeController(e){var t;null==(t=this._$ES)||t.splice(this._$ES.indexOf(e)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach((e,t)=>{this.hasOwnProperty(t)&&(this._$Ei.set(t,this[t]),delete this[t])})}createRenderRoot(){var e;let t=null!=(e=this.shadowRoot)?e:this.attachShadow(this.constructor.shadowRootOptions);return(0,s.adoptStyles)(t,this.constructor.elementStyles),t}connectedCallback(){var e;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null==(e=this._$ES)||e.forEach(e=>{var t;return null==(t=e.hostConnected)?void 0:t.call(e)})}enableUpdating(e){}disconnectedCallback(){var e;null==(e=this._$ES)||e.forEach(e=>{var t;return null==(t=e.hostDisconnected)?void 0:t.call(e)})}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$EO(e,t,i=u){var r;let s=this.constructor._$Ep(e,i);if(void 0!==s&&!0===i.reflect){let a=(void 0!==(null==(r=i.converter)?void 0:r.toAttribute)?i.converter:c).toAttribute(t,i.type);this._$El=e,null==a?this.removeAttribute(s):this.setAttribute(s,a),this._$El=null}}_$AK(e,t){var i;let r=this.constructor,s=r._$Ev.get(e);if(void 0!==s&&this._$El!==s){let e=r.getPropertyOptions(s),a="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==(null==(i=e.converter)?void 0:i.fromAttribute)?e.converter:c;this._$El=s,this[s]=a.fromAttribute(t,e.type),this._$El=null}}requestUpdate(e,t,i){let r=!0;void 0!==e&&(((i=i||this.constructor.getPropertyOptions(e)).hasChanged||h)(this[e],t)?(this._$AL.has(e)||this._$AL.set(e,t),!0===i.reflect&&this._$El!==e&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(e,i))):r=!1),!this.isUpdatePending&&r&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var e;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach((e,t)=>this[t]=e),this._$Ei=void 0);let t=!1,i=this._$AL;try{(t=this.shouldUpdate(i))?(this.willUpdate(i),null==(e=this._$ES)||e.forEach(e=>{var t;return null==(t=e.hostUpdate)?void 0:t.call(e)}),this.update(i)):this._$Ek()}catch(e){throw t=!1,this._$Ek(),e}t&&this._$AE(i)}willUpdate(e){}_$AE(e){var t;null==(t=this._$ES)||t.forEach(e=>{var t;return null==(t=e.hostUpdated)?void 0:t.call(e)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(e){return!0}update(e){void 0!==this._$EC&&(this._$EC.forEach((e,t)=>this._$EO(t,this[t],e)),this._$EC=void 0),this._$Ek()}updated(e){}firstUpdated(e){}}_[p]=!0,_.elementProperties=new Map,_.elementStyles=[],_.shadowRootOptions={mode:"open"},null==d||d({ReactiveElement:_}),(null!=(r=o.reactiveElementVersions)?r:o.reactiveElementVersions=[]).push("1.6.3")}),o("bBTYI",function(e,i){t(e.exports,"css",()=>l),t(e.exports,"adoptStyles",()=>d),t(e.exports,"getCompatibleStyle",()=>c);let r=window,s=r.ShadowRoot&&(void 0===r.ShadyCSS||r.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,a=Symbol(),o=new WeakMap;class n{constructor(e,t,i){if(this._$cssResult$=!0,i!==a)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(s&&void 0===e){let i=void 0!==t&&1===t.length;i&&(e=o.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&o.set(t,e))}return e}toString(){return this.cssText}}let l=(e,...t)=>new n(1===e.length?e[0]:t.reduce((t,i,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[r+1],e[0]),e,a),d=(e,t)=>{s?e.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet):t.forEach(t=>{let i=document.createElement("style"),s=r.litNonce;void 0!==s&&i.setAttribute("nonce",s),i.textContent=t.cssText,e.appendChild(i)})},c=s?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t,i="";for(let t of e.cssRules)i+=t.cssText;return new n("string"==typeof(t=i)?t:t+"",void 0,a)})(e):e}),o("iKGUH",function(e,i){var r;t(e.exports,"html",()=>w),t(e.exports,"noChange",()=>C),t(e.exports,"nothing",()=>T),t(e.exports,"render",()=>z);let s=window,a=s.trustedTypes,o=a?a.createPolicy("lit-html",{createHTML:e=>e}):void 0,n="$lit$",l=`lit$${(Math.random()+"").slice(9)}$`,d="?"+l,c=`<${d}>`,h=document,u=()=>h.createComment(""),p=e=>null===e||"object"!=typeof e&&"function"!=typeof e,_=Array.isArray,m="[ 	\n\f\r]",g=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,f=/-->/g,v=/>/g,y=RegExp(`>|${m}(?:([^\\s"'>=/]+)(${m}*=${m}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),S=/'/g,b=/"/g,x=/^(?:script|style|textarea|title)$/i,$=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),w=$(1),C=($(2),Symbol.for("lit-noChange")),T=Symbol.for("lit-nothing"),E=new WeakMap,M=h.createTreeWalker(h,129,null,!1);function A(e,t){if(!Array.isArray(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==o?o.createHTML(t):t}class k{constructor({strings:e,_$litType$:t},i){let r;this.parts=[];let s=0,o=0,h=e.length-1,p=this.parts,[_,m]=((e,t)=>{let i=e.length-1,r=[],s,a=2===t?"<svg>":"",o=g;for(let t=0;t<i;t++){let i=e[t],d,h,u=-1,p=0;for(;p<i.length&&(o.lastIndex=p,null!==(h=o.exec(i)));)p=o.lastIndex,o===g?"!--"===h[1]?o=f:void 0!==h[1]?o=v:void 0!==h[2]?(x.test(h[2])&&(s=RegExp("</"+h[2],"g")),o=y):void 0!==h[3]&&(o=y):o===y?">"===h[0]?(o=null!=s?s:g,u=-1):void 0===h[1]?u=-2:(u=o.lastIndex-h[2].length,d=h[1],o=void 0===h[3]?y:'"'===h[3]?b:S):o===b||o===S?o=y:o===f||o===v?o=g:(o=y,s=void 0);let _=o===y&&e[t+1].startsWith("/>")?" ":"";a+=o===g?i+c:u>=0?(r.push(d),i.slice(0,u)+n+i.slice(u)+l+_):i+l+(-2===u?(r.push(void 0),t):_)}return[A(e,a+(e[i]||"<?>")+(2===t?"</svg>":"")),r]})(e,t);if(this.el=k.createElement(_,i),M.currentNode=this.el.content,2===t){let e=this.el.content,t=e.firstChild;t.remove(),e.append(...t.childNodes)}for(;null!==(r=M.nextNode())&&p.length<h;){if(1===r.nodeType){if(r.hasAttributes()){let e=[];for(let t of r.getAttributeNames())if(t.endsWith(n)||t.startsWith(l)){let i=m[o++];if(e.push(t),void 0!==i){let e=r.getAttribute(i.toLowerCase()+n).split(l),t=/([.?@])?(.*)/.exec(i);p.push({type:1,index:s,name:t[2],strings:e,ctor:"."===t[1]?P:"?"===t[1]?F:"@"===t[1]?O:I})}else p.push({type:6,index:s})}for(let t of e)r.removeAttribute(t)}if(x.test(r.tagName)){let e=r.textContent.split(l),t=e.length-1;if(t>0){r.textContent=a?a.emptyScript:"";for(let i=0;i<t;i++)r.append(e[i],u()),M.nextNode(),p.push({type:2,index:++s});r.append(e[t],u())}}}else if(8===r.nodeType)if(r.data===d)p.push({type:2,index:s});else{let e=-1;for(;-1!==(e=r.data.indexOf(l,e+1));)p.push({type:7,index:s}),e+=l.length-1}s++}}static createElement(e,t){let i=h.createElement("template");return i.innerHTML=e,i}}function H(e,t,i=e,r){var s,a,o;if(t===C)return t;let n=void 0!==r?null==(s=i._$Co)?void 0:s[r]:i._$Cl,l=p(t)?void 0:t._$litDirective$;return(null==n?void 0:n.constructor)!==l&&(null==(a=null==n?void 0:n._$AO)||a.call(n,!1),void 0===l?n=void 0:(n=new l(e))._$AT(e,i,r),void 0!==r?(null!=(o=i._$Co)?o:i._$Co=[])[r]=n:i._$Cl=n),void 0!==n&&(t=H(e,n._$AS(e,t.values),n,r)),t}class D{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){var t;let{el:{content:i},parts:r}=this._$AD,s=(null!=(t=null==e?void 0:e.creationScope)?t:h).importNode(i,!0);M.currentNode=s;let a=M.nextNode(),o=0,n=0,l=r[0];for(;void 0!==l;){if(o===l.index){let t;2===l.type?t=new N(a,a.nextSibling,this,e):1===l.type?t=new l.ctor(a,l.name,l.strings,this,e):6===l.type&&(t=new U(a,this,e)),this._$AV.push(t),l=r[++n]}o!==(null==l?void 0:l.index)&&(a=M.nextNode(),o++)}return M.currentNode=h,s}v(e){let t=0;for(let i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class N{constructor(e,t,i,r){var s;this.type=2,this._$AH=T,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=r,this._$Cp=null==(s=null==r?void 0:r.isConnected)||s}get _$AU(){var e,t;return null!=(t=null==(e=this._$AM)?void 0:e._$AU)?t:this._$Cp}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return void 0!==t&&11===(null==e?void 0:e.nodeType)&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){let i;p(e=H(this,e,t))?e===T||null==e||""===e?(this._$AH!==T&&this._$AR(),this._$AH=T):e!==this._$AH&&e!==C&&this._(e):void 0!==e._$litType$?this.g(e):void 0!==e.nodeType?this.$(e):_(i=e)||"function"==typeof(null==i?void 0:i[Symbol.iterator])?this.T(e):this._(e)}k(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}$(e){this._$AH!==e&&(this._$AR(),this._$AH=this.k(e))}_(e){this._$AH!==T&&p(this._$AH)?this._$AA.nextSibling.data=e:this.$(h.createTextNode(e)),this._$AH=e}g(e){var t;let{values:i,_$litType$:r}=e,s="number"==typeof r?this._$AC(e):(void 0===r.el&&(r.el=k.createElement(A(r.h,r.h[0]),this.options)),r);if((null==(t=this._$AH)?void 0:t._$AD)===s)this._$AH.v(i);else{let e=new D(s,this),t=e.u(this.options);e.v(i),this.$(t),this._$AH=e}}_$AC(e){let t=E.get(e.strings);return void 0===t&&E.set(e.strings,t=new k(e)),t}T(e){_(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,i,r=0;for(let s of e)r===t.length?t.push(i=new N(this.k(u()),this.k(u()),this,this.options)):i=t[r],i._$AI(s),r++;r<t.length&&(this._$AR(i&&i._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){var i;for(null==(i=this._$AP)||i.call(this,!1,!0,t);e&&e!==this._$AB;){let t=e.nextSibling;e.remove(),e=t}}setConnected(e){var t;void 0===this._$AM&&(this._$Cp=e,null==(t=this._$AP)||t.call(this,e))}}class I{constructor(e,t,i,r,s){this.type=1,this._$AH=T,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=s,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=T}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(e,t=this,i,r){let s=this.strings,a=!1;if(void 0===s)(a=!p(e=H(this,e,t,0))||e!==this._$AH&&e!==C)&&(this._$AH=e);else{let r,o,n=e;for(e=s[0],r=0;r<s.length-1;r++)(o=H(this,n[i+r],t,r))===C&&(o=this._$AH[r]),a||(a=!p(o)||o!==this._$AH[r]),o===T?e=T:e!==T&&(e+=(null!=o?o:"")+s[r+1]),this._$AH[r]=o}a&&!r&&this.j(e)}j(e){e===T?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=e?e:"")}}class P extends I{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===T?void 0:e}}let R=a?a.emptyScript:"";class F extends I{constructor(){super(...arguments),this.type=4}j(e){e&&e!==T?this.element.setAttribute(this.name,R):this.element.removeAttribute(this.name)}}class O extends I{constructor(e,t,i,r,s){super(e,t,i,r,s),this.type=5}_$AI(e,t=this){var i;if((e=null!=(i=H(this,e,t,0))?i:T)===C)return;let r=this._$AH,s=e===T&&r!==T||e.capture!==r.capture||e.once!==r.once||e.passive!==r.passive,a=e!==T&&(r===T||s);s&&this.element.removeEventListener(this.name,this,r),a&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t,i;"function"==typeof this._$AH?this._$AH.call(null!=(i=null==(t=this.options)?void 0:t.host)?i:this.element,e):this._$AH.handleEvent(e)}}class U{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){H(this,e)}}let L=s.litHtmlPolyfillSupport;null==L||L(k,N),(null!=(r=s.litHtmlVersions)?r:s.litHtmlVersions=[]).push("2.8.0");let z=(e,t,i)=>{var r,s;let a=null!=(r=null==i?void 0:i.renderBefore)?r:t,o=a._$litPart$;if(void 0===o){let e=null!=(s=null==i?void 0:i.renderBefore)?s:null;a._$litPart$=o=new N(t.insertBefore(u(),e),e,void 0,null!=i?i:{})}return o._$AI(e),o}}),o("kLmv1",function(e,t){}),o("UE69e",function(e,i){t(e.exports,"customElement",()=>a("esbW4").customElement),t(e.exports,"property",()=>a("9z3oa").property),t(e.exports,"state",()=>a("ddM75").state),a("esbW4"),a("9z3oa"),a("ddM75"),a("cloJV"),a("6Wapz"),a("bNDge"),a("gW6Du"),a("ikMfK"),a("jt9Su")}),o("esbW4",function(e,i){t(e.exports,"customElement",()=>r);let r=e=>t=>"function"==typeof t?(customElements.define(e,t),t):((e,t)=>{let{kind:i,elements:r}=t;return{kind:i,elements:r,finisher(t){customElements.define(e,t)}}})(e,t)}),o("9z3oa",function(e,i){t(e.exports,"property",()=>r);function r(e){return(t,i)=>void 0!==i?void t.constructor.createProperty(i,e):"method"!==t.kind||!t.descriptor||"value"in t.descriptor?{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:t.key,initializer(){"function"==typeof t.initializer&&(this[t.key]=t.initializer.call(this))},finisher(i){i.createProperty(t.key,e)}}:{...t,finisher(i){i.createProperty(t.key,e)}}}}),o("ddM75",function(e,i){t(e.exports,"state",()=>s);var r=a("9z3oa");function s(e){return(0,r.property)({...e,state:!0})}}),o("cloJV",function(e,t){a("ea0YP")}),o("ea0YP",function(e,i){t(e.exports,"decorateProperty",()=>r);let r=({finisher:e,descriptor:t})=>(i,r)=>{var s;if(void 0===r){let r=null!=(s=i.originalKey)?s:i.key,a=null!=t?{kind:"method",placement:"prototype",key:r,descriptor:t(i.key)}:{...i,key:r};return null!=e&&(a.finisher=function(t){e(t,r)}),a}{let s=i.constructor;void 0!==t&&Object.defineProperty(i,r,t(r)),null==e||e(s,r)}}}),o("6Wapz",function(e,t){a("ea0YP")}),o("bNDge",function(e,t){a("ea0YP")}),o("gW6Du",function(e,t){a("ea0YP")}),o("ikMfK",function(e,i){t(e.exports,"queryAssignedElements",()=>n);var r,s=a("ea0YP");let o=null!=(null==(r=window.HTMLSlotElement)?void 0:r.prototype.assignedElements)?(e,t)=>e.assignedElements(t):(e,t)=>e.assignedNodes(t).filter(e=>e.nodeType===Node.ELEMENT_NODE);function n(e){let{slot:t,selector:i}=null!=e?e:{};return(0,s.decorateProperty)({descriptor:r=>({get(){var r;let s="slot"+(t?`[name=${t}]`:":not([name])"),a=null==(r=this.renderRoot)?void 0:r.querySelector(s),n=null!=a?o(a,e):[];return i?n.filter(e=>e.matches(i)):n},enumerable:!0,configurable:!0})})}}),o("jt9Su",function(e,t){a("ea0YP"),a("ikMfK")}),o("e973t",function(e,i){t(e.exports,"fireEvent",()=>l),a("4DhYy"),(r=o||(o={})).language="language",r.system="system",r.comma_decimal="comma_decimal",r.decimal_comma="decimal_comma",r.space_comma="space_comma",r.none="none",(s=n||(n={})).language="language",s.system="system",s.am_pm="12",s.twenty_four="24";var r,s,o,n,l=function(e,t,i,r){r=r||{},i=null==i?{}:i;var s=new Event(t,{bubbles:void 0===r.bubbles||r.bubbles,cancelable:!!r.cancelable,composed:void 0===r.composed||r.composed});return s.detail=i,e.dispatchEvent(s),s}}),o("4DhYy",function(e,i){t(e.exports,"selectUnit",()=>s);var r=function(){return(r=Object.assign||function(e){for(var t,i=1,r=arguments.length;i<r;i++)for(var s in t=arguments[i])Object.prototype.hasOwnProperty.call(t,s)&&(e[s]=t[s]);return e}).apply(this,arguments)};function s(e,t,i){void 0===t&&(t=Date.now()),void 0===i&&(i={});var s=r(r({},a),i||{}),o=(e-t)/1e3;if(Math.abs(o)<s.second)return{value:Math.round(o),unit:"second"};var n=o/60;if(Math.abs(n)<s.minute)return{value:Math.round(n),unit:"minute"};var l=o/3600;if(Math.abs(l)<s.hour)return{value:Math.round(l),unit:"hour"};var d=o/86400;if(Math.abs(d)<s.day)return{value:Math.round(d),unit:"day"};var c=new Date(e),h=new Date(t),u=c.getFullYear()-h.getFullYear();if(Math.round(Math.abs(u))>0)return{value:Math.round(u),unit:"year"};var p=12*u+c.getMonth()-h.getMonth();return Math.round(Math.abs(p))>0?{value:Math.round(p),unit:"month"}:{value:Math.round(o/604800),unit:"week"}}var a={second:45,minute:45,hour:22,day:5}}),o("glq8a",function(e,i){t(e.exports,"DEFAULT_COLORS",()=>r),t(e.exports,"BAR_MAX_WIDTH",()=>s),t(e.exports,"buildSeries",()=>d);let r=["--energy-grid-consumption-color","--energy-grid-return-color","--energy-solar-color","--energy-battery-in-color","--energy-battery-out-color","--energy-gas-color","--energy-water-color","--energy-non-fossil-color"],s=50,a=e=>Math.max(0,Math.min(1,Number.isFinite(e)?e:1)),o=e=>{let t=e.replace("#","").trim();if(3===t.length||4===t.length){let e=parseInt(t[0]+t[0],16);return{r:e,g:parseInt(t[1]+t[1],16),b:parseInt(t[2]+t[2],16)}}if(6===t.length||8===t.length){let e=parseInt(t.substring(0,2),16);return{r:e,g:parseInt(t.substring(2,4),16),b:parseInt(t.substring(4,6),16)}}return null},n=e=>{let t=e.trim().match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*[\d.]+\s*)?\)/i);return t?{r:Number(t[1]),g:Number(t[2]),b:Number(t[3])}:null},l=(e,t)=>{let i=e.trim(),r=a(t);if(i.startsWith("#")){let e=o(i);if(e)return`rgba(${e.r}, ${e.g}, ${e.b}, ${r})`}else if(i.startsWith("rgb")){let e=n(i);if(e)return`rgba(${e.r}, ${e.g}, ${e.b}, ${r})`}return i},d=({hass:e,statistics:t,metadata:i,configSeries:d,colorPalette:c,computedStyle:h,calculatedData:u,calculatedUnits:p,forecastData:_,forecastUnits:m,skipForecastSeries:g})=>{let f=c.length?c:r,v=[],y=new Map,S=new Map,b=new Map,x=new Map,$=[],w=new Map,C=[],T=(e=>{let t=new Map;e.forEach((e,i)=>{let r=e.chart_type??"bar",s=e.stack?.trim();if("line"!==r&&"step"!==r||!s)return;let a="right"===e.y_axis?"right":"left",o=`${a}:${s}`,n=t.get(o)??[];n.push(i),t.set(o,n)});let i=new Map;return t.forEach(e=>{e.forEach((t,r)=>{i.set(t,e[e.length-r-1])})}),i})(d),E=new Set,M=(e,t)=>{E.has(e)||(E.add(e),console.warn(`[energy-custom-graph] ${t}`))};return d.forEach((d,c)=>{let E,A,k,H,D=d.source??(d.calculation?"calculation":"statistic");if("forecast"===D&&g)return;let N="statistic"===D?d.statistic_id?.trim():void 0,I="calculation"===D?`calculation_${c}`:void 0,P="forecast"===D?`forecast_${c}`:void 0;if("calculation"===D&&I){if(E=u?.get(I),A=p?.get(I),!E?.length)return void M(`calculation-empty-${c}`,`Calculation for series "${d.name??I}" produced no data.`)}else if("forecast"===D&&P){if(!_?.has(P))return void M(`forecast-missing-${c}`,`No forecast data available for series "${d.name??P}".`);if(E=_.get(P),A=m?.get(P),!E?.length)return void M(`forecast-empty-${c}`,`Forecast series "${d.name??P}" produced no data for the selected range.`)}else if("statistic"!==D||!N)return void M(`series-misconfigured-${c}`,`Series at index ${c} is missing a valid data source.`);else if(E=t?.[N],!E?.length)return void M(`statistics-empty-${N}`,`No statistics available for "${N}".`);let R=N?i?.[N]:void 0,F=d.stat_type??"change",O=d.chart_type??"bar",U="line"===O,L="step"===O,z=U||L,B=d.multiply??1,j=d.add??0,W="number"==typeof d.smooth?Math.max(0,Math.min(1,d.smooth)):d.smooth,G=!0===d.fill,V=d.name??R?.name??(N?e.states[N]?.attributes.friendly_name??N:d.pv_production_entity??("forecast"===D?`Forecast ${c+1}`:`Series ${c+1}`)),K=d.color??f[c%f.length]??r[c%r.length],Y=K;if(K.startsWith("#")||K.startsWith("rgb"))Y=K;else if(K.startsWith("var(")){let e=K.slice(4,-1).trim(),t=h.getPropertyValue(e)?.trim();t&&(Y=t)}else{let e=h.getPropertyValue(K)?.trim();e&&(Y=e)}let q=(e=>{let t=e.trim();if(t.startsWith("#")){let e=o(t);if(e)return`rgb(${e.r}, ${e.g}, ${e.b})`}else if(t.startsWith("rgb")){let e=n(t);if(e)return`rgb(${e.r}, ${e.g}, ${e.b})`}return t})(Y=Y.trim()),X="number"==typeof d.line_opacity?a(d.line_opacity):void 0,Q=void 0!==X?X:.85,Z=l(Y,Q),J=l(Y,Math.min(1,Q+.15));J===Y&&(J=Z);let ee=N??I??P??`series_${c}`,et="string"==typeof d.id&&d.id.trim().length?d.id.trim():void 0,ei=et??`${ee}:${F}:${O}:${c}`,er=A??R?.statistics_unit_of_measurement,es=E.map(e=>{var t,i,r;let s,a=e[F],o=e.start??e.end;return"number"!=typeof a||Number.isNaN(a)?[o,null]:[o,(t=a*B+j,i=d.clip_min,r=d.clip_max,s=t,void 0!==i&&(s=Math.max(s,i)),void 0!==r&&(s=Math.min(s,r)),s)]}),ea=et??ei;if(x.has(ea)&&M(`duplicate-series-id-${ea}`,`Multiple series resolve to id "${ea}". Header metrics referencing this id will be ambiguous.`),x.set(ea,{id:ea,chartSeriesId:ei,name:V,source:D,config:d,data:es,unit:er}),!1!==d.show_in_chart){if(y.set(ei,er),S.set(ei,d),b.set(ei,q),z){let e="number"==typeof d.fill_opacity?a(d.fill_opacity):.15,t=l(Y,e),i=!0===d.gradient_fill?((e,t,i)=>{let r=0,s=0;i.forEach(([,e])=>{"number"==typeof e&&Number.isFinite(e)&&(r=Math.min(r,e),s=Math.max(s,e))});let o=l(e,t),n=l(e,t/3);return{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:0===s&&0===r?[{offset:0,color:n},{offset:1,color:n}]:r>=0?[{offset:0,color:o},{offset:1,color:n}]:s<=0?[{offset:0,color:n},{offset:1,color:o}]:[{offset:0,color:o},{offset:a(s/(s-r)),color:n},{offset:1,color:o}],global:!1}})(Y,"number"==typeof d.fill_opacity?e:.75,es):void 0,r=d.line_width??1.5,s=d.line_style??"solid",o={id:ei,name:V,type:"line",smooth:!L&&((U?W:void 0)??!0),showSymbol:!1,areaStyle:G?{}:void 0,data:es,stack:d.stack,yAxisIndex:+("right"===d.y_axis),z:T.get(c)??c,emphasis:{focus:"series",itemStyle:{color:J,borderColor:J}},lineStyle:{width:r,color:Z,type:s},itemStyle:{color:Z,borderColor:Z},color:Z};!1===d.show_in_tooltip&&(o.tooltip={...o.tooltip??{},show:!1}),L&&(o.step="end"),G&&(o.areaStyle={...o.areaStyle??{},color:i??t}),$.push(o),k=G?t:Z,H=Z,w.has(V)?M(`duplicate-name-${V}`,`Multiple series share the name "${V}". fill_to_series references will be ambiguous.`):w.set(V,{id:ei,name:V,config:d,dataPoints:es,lineColor:Z,fillColor:t,fillOpacity:e,series:o});let n=d.fill_to_series?.trim();n&&C.push({sourceName:V,targetName:n})}else{let e="number"==typeof d.fill_opacity?a(d.fill_opacity):.5,t=l(Y,e),i=l(Y,Math.min(1,e+.2)),r=l(Y,void 0!==X?X:1),o={id:ei,name:V,type:"bar",stack:d.stack,data:es,yAxisIndex:+("right"===d.y_axis),z:c,emphasis:{focus:"series",itemStyle:{color:i,borderColor:r}},itemStyle:{color:t,borderColor:r},color:t,barMaxWidth:s};!1===d.show_in_tooltip&&(o.tooltip={...o.tooltip??{},show:!1}),$.push(o),d.fill_to_series&&M(`fill-bar-${V}`,`Series "${V}" is configured as bar chart and cannot use fill_to_series.`),k=t,H=r}!1!==d.show_in_legend&&v.push({id:ei,name:V,color:k,indicatorColor:k,fillColor:k,borderColor:H,borderWidth:z?2:1,hidden:!0===d.hidden_by_default})}}),C.forEach(({sourceName:e,targetName:t})=>{let i=w.get(e);if(!i)return void M(`fill-source-missing-${e}`,`Series "${e}" could not be found for fill_to_series processing.`);if(i.config.stack)return void M(`fill-source-stack-${e}`,`Series "${e}" uses stack together with fill_to_series. Stacking is not supported for fill areas.`);let r=w.get(t);if(!r)return void M(`fill-target-missing-${e}-${t}`,`fill_to_series for "${e}" references "${t}", which does not exist or is not a line series.`);if(r.config.stack)return void M(`fill-target-stack-${e}-${t}`,`Series "${t}" uses stack and cannot be used as fill target.`);if(i.name===r.name)return void M(`fill-same-series-${e}`,`Series "${e}" references itself in fill_to_series.`);let s=new Map;i.dataPoints.forEach(([e,t])=>{s.set(e,"number"!=typeof t||Number.isNaN(t)?null:t)});let a=new Map;r.dataPoints.forEach(([e,t])=>{a.set(e,"number"!=typeof t||Number.isNaN(t)?null:t)});let o=new Set;s.forEach((e,t)=>o.add(t)),a.forEach((e,t)=>o.add(t));let n=Array.from(o).sort((e,t)=>e-t),l=[],d=[],c=!1;if(n.forEach(e=>{let t=s.get(e),i=a.get(e);if(void 0===t||void 0===i||null===t||null===i){l.push([e,i??null]),d.push([e,null]);return}let r=t-i;if(r<0){c=!0,l.push([e,i]),d.push([e,0]);return}l.push([e,i]),d.push([e,r])}),!d.some(([,e])=>"number"==typeof e&&e>0))return;c&&M(`fill-clamped-${e}-${t}`,`fill_to_series for "${e}" encountered values below "${t}". Negative differences were clamped to zero.`);let h=`__energy_fill_${i.id}`,u=`${i.id}__fill_base`,p=`${i.id}__fill_area`,_="number"==typeof i.series.z?i.series.z:2,m="number"==typeof r.series.z?r.series.z:2,g=_-.1;g<0&&(g=_+.1);let f=Math.min(g-.01,m-.1);f<0&&(f=Math.max(g-.02,0));let v={id:u,name:`${e}__fill_base`,type:"line",data:l,stack:h,stackStrategy:"all",smooth:r.series.smooth,lineStyle:{width:0,color:r.lineColor},areaStyle:{opacity:0},showSymbol:!1,silent:!0,tooltip:{show:!1},emphasis:{disabled:!0},xAxisIndex:r.series.xAxisIndex,yAxisIndex:r.series.yAxisIndex,z:f,legendHoverLink:!1},y={id:p,name:`${e}__fill_area`,type:"line",data:d,stack:h,stackStrategy:"all",smooth:i.series.smooth,lineStyle:{width:0,color:i.lineColor},areaStyle:{color:i.fillColor},itemStyle:{color:i.fillColor},showSymbol:!1,silent:!0,tooltip:{show:!1},emphasis:{disabled:!0},xAxisIndex:i.series.xAxisIndex,yAxisIndex:i.series.yAxisIndex,z:g,legendHoverLink:!1};$.push(v,y)}),{series:$,legend:v,unitBySeries:y,seriesById:S,indicatorColorBySeries:b,resolvedSeriesById:x}}}),o("hFSrI",function(e,i){t(e.exports,"fetchEnergyPreferences",()=>r),t(e.exports,"fetchEnergySolarForecasts",()=>s);let r=e=>e.callWS({type:"energy/get_prefs"}),s=e=>e.callWS({type:"energy/solar_forecast"})}),o("2PP5g",function(e,i){t(e.exports,"getStatisticMetadata",()=>r),t(e.exports,"fetchStatistics",()=>s),t(e.exports,"getStatisticLabel",()=>a);let r=(e,t)=>e.callWS({type:"recorder/get_statistics_metadata",statistic_ids:t}),s=(e,t,i,r,s="hour",a,o)=>e.callWS({type:"recorder/statistics_during_period",start_time:t.toISOString(),end_time:i?.toISOString(),statistic_ids:r,period:s,units:a,types:o}),a=(e,t,i)=>{let r=e.states?.[t];return(r?.attributes?.friendly_name??i?.name)||t}}),o("8elkP",function(e,i){t(e.exports,"normalizeStatisticId",()=>s),t(e.exports,"aggregationUsesRaw",()=>a),t(e.exports,"formatAggregationTarget",()=>o),t(e.exports,"isStatisticTypeSupported",()=>n),t(e.exports,"selectDefaultStatisticType",()=>l),t(e.exports,"resolveStatisticSourceStatus",()=>d),t(e.exports,"getStatisticSourceIssue",()=>c),t(e.exports,"resolveSeriesSource",()=>h),t(e.exports,"seriesHasTimeOffset",()=>u),t(e.exports,"cloneSeriesForDuplicate",()=>p),t(e.exports,"convertSeriesToCalculation",()=>_),t(e.exports,"convertSeriesToStatistic",()=>m),t(e.exports,"cleanSeriesForForecast",()=>g);let r=e=>{let t=e.has_mean;return"number"==typeof e.mean_type?0!==e.mean_type:!!t},s=e=>e?.trim()??"",a=e=>!!e&&("raw"===e.manual||"raw"===e.fallback||!!e.energy_picker&&Object.values(e.energy_picker).some(e=>"raw"===e)),o=e=>{switch(e){case"5minute":return"5 minute";case"hour":return"Hour";case"day":return"Day";case"week":return"Week";case"month":return"Month";case"year":return"Year";case"raw":return"RAW history";case"disabled":return"Disabled"}},n=(e,t)=>!!e&&("change"===t||"sum"===t?!0===e.has_sum:"mean"!==t&&"min"!==t&&"max"!==t||r(e)),l=e=>{if(e)return e.has_sum?"change":r(e)?"mean":"state"},d=({statisticId:e,hasEntity:t,metadata:i,metadataLoaded:r})=>s(e)?r?i&&t?{status:"entity",metadata:i}:i?{status:"external_statistic",metadata:i}:t?{status:"raw_only"}:{status:"unknown"}:{status:"loading"}:{status:"empty"},c=({status:e,usesRaw:t,metadata:i,statType:r})=>"unknown"===e?{severity:"warning",cause:"Unknown entity",action:"Check the ID"}:"raw_only"!==e||t?i&&r&&!n(i,r)?{severity:"warning",cause:"Unsupported statistic type",action:"Choose a supported type"}:void 0:{severity:"warning",cause:"Entity has no aggregated statistics",action:"Enable RAW history"},h=e=>e.source?e.source:e.calculation?"calculation":"statistic",u=e=>"number"==typeof e.time_offset?.value&&Number.isFinite(e.time_offset.value)&&0!==e.time_offset.value,p=e=>{let t={...e,id:void 0,time_offset:e.time_offset?{...e.time_offset}:void 0,calculation:e.calculation?{...e.calculation,terms:(e.calculation.terms??[]).map(e=>({...e}))}:void 0};return e.name&&e.name.trim().length?t.name=`${e.name.trim()} copy`:delete t.name,t},_=e=>{let t=s(e.statistic_id),i=t?[{operation:"add",statistic_id:t,stat_type:e.stat_type}]:[],r=e.calculation??{terms:i},a={...e,source:"calculation",calculation:{...r,terms:(r.terms??[]).map(e=>({...e}))}};return delete a.statistic_id,delete a.stat_type,delete a.pv_production_entity,a},m=e=>{let t=e.calculation?.terms??[],i=1===t.length&&s(t[0].statistic_id)&&void 0===t[0].constant?t[0]:void 0,r={...e};return delete r.source,delete r.calculation,delete r.pv_production_entity,i?.statistic_id?(r.statistic_id=i.statistic_id.trim(),r.stat_type=i.stat_type):s(r.statistic_id)||(r.statistic_id="",delete r.stat_type),r},g=e=>{let t={...e,source:"forecast"};return delete t.statistic_id,delete t.stat_type,delete t.calculation,delete t.time_offset,t}});var n=a("hAmm6");a("fUwgm");var l=a("bBTYI"),d=a("iKGUH"),c=a("2cNIw");a("UE69e");var h=a("esbW4"),u=a("9z3oa"),p=a("ddM75"),_=a("3Gj0C");class m{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}const g=(e=class extends m{constructor(e){var t;if(super(e),1!==e.type||"class"!==e.name||(null==(t=e.strings)?void 0:t.length)>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter(t=>e[t]).join(" ")+" "}update(e,[t]){var i,r;if(void 0===this.it){for(let r in this.it=new Set,void 0!==e.strings&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter(e=>""!==e))),t)!t[r]||(null==(i=this.nt)?void 0:i.has(r))||this.it.add(r);return this.render(t)}let s=e.element.classList;for(let e in this.it.forEach(e=>{e in t||(s.remove(e),this.it.delete(e))}),t){let i=!!t[e];i===this.it.has(e)||(null==(r=this.nt)?void 0:r.has(e))||(i?(s.add(e),this.it.add(e)):(s.remove(e),this.it.delete(e)))}return _.noChange}},(...t)=>({_$litDirective$:e,values:t}));function f(e){if(null===e||!0===e||!1===e)return NaN;var t=Number(e);return isNaN(t)?t:t<0?Math.ceil(t):Math.floor(t)}function v(e){return(v="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function y(e,t){if(t.length<e)throw TypeError(e+" argument"+(e>1?"s":"")+" required, but only "+t.length+" present")}function S(e){y(1,arguments);var t=Object.prototype.toString.call(e);return e instanceof Date||"object"===v(e)&&"[object Date]"===t?new Date(e.getTime()):"number"==typeof e||"[object Number]"===t?new Date(e):(("string"==typeof e||"[object String]"===t)&&"undefined"!=typeof console&&(console.warn("Starting with v2.0.0-beta.1 date-fns doesn't accept strings as date arguments. Please use `parseISO` to parse strings. See: https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#string-arguments"),console.warn(Error().stack)),new Date(NaN))}function b(e,t){y(2,arguments);var i=S(e),r=f(t);return isNaN(r)?new Date(NaN):(r&&i.setDate(i.getDate()+r),i)}function x(e,t){return y(2,arguments),new Date(S(e).getTime()+f(t))}function $(e,t){return y(2,arguments),x(e,36e5*f(t))}function w(e,t){return y(2,arguments),x(e,6e4*f(t))}function C(e,t){y(2,arguments);var i=S(e),r=f(t);if(isNaN(r))return new Date(NaN);if(!r)return i;var s=i.getDate(),a=new Date(i.getTime());return(a.setMonth(i.getMonth()+r+1,0),s>=a.getDate())?a:(i.setFullYear(a.getFullYear(),a.getMonth(),s),i)}function T(e,t){return y(2,arguments),b(e,7*f(t))}function E(e,t){return y(2,arguments),C(e,12*f(t))}function M(e){var t=new Date(Date.UTC(e.getFullYear(),e.getMonth(),e.getDate(),e.getHours(),e.getMinutes(),e.getSeconds(),e.getMilliseconds()));return t.setUTCFullYear(e.getFullYear()),e.getTime()-t.getTime()}function A(e){y(1,arguments);var t=S(e);return t.setHours(0,0,0,0),t}function k(e,t){var i=e.getFullYear()-t.getFullYear()||e.getMonth()-t.getMonth()||e.getDate()-t.getDate()||e.getHours()-t.getHours()||e.getMinutes()-t.getMinutes()||e.getSeconds()-t.getSeconds()||e.getMilliseconds()-t.getMilliseconds();return i<0?-1:i>0?1:i}function H(e,t){y(2,arguments);var i=S(e),r=S(t),s=k(i,r),a=Math.abs(function(e,t){y(2,arguments);var i=A(e),r=A(t);return Math.round((i.getTime()-M(i)-(r.getTime()-M(r)))/864e5)}(i,r));i.setDate(i.getDate()-s*a);var o=Number(k(i,r)===-s),n=s*(a-o);return 0===n?0:n}var D={ceil:Math.ceil,round:Math.round,floor:Math.floor,trunc:function(e){return e<0?Math.ceil(e):Math.floor(e)}};function N(e,t,i){y(2,arguments);var r,s=function(e,t){return y(2,arguments),S(e).getTime()-S(t).getTime()}(e,t)/36e5;return((r=null==i?void 0:i.roundingMethod)?D[r]:D.trunc)(s)}function I(e,t){y(2,arguments);var i=S(e),r=S(t),s=i.getTime()-r.getTime();return s<0?-1:s>0?1:s}function P(e){y(1,arguments);var t=S(e);return t.setHours(23,59,59,999),t}function R(e){y(1,arguments);var t=S(e),i=t.getMonth();return t.setFullYear(t.getFullYear(),i+1,0),t.setHours(23,59,59,999),t}function F(e,t){y(2,arguments);var i,r=S(e),s=S(t),a=I(r,s),o=Math.abs(function(e,t){y(2,arguments);var i=S(e),r=S(t);return 12*(i.getFullYear()-r.getFullYear())+(i.getMonth()-r.getMonth())}(r,s));if(o<1)i=0;else{1===r.getMonth()&&r.getDate()>27&&r.setDate(30),r.setMonth(r.getMonth()-a*o);var n=I(r,s)===-a;(function(e){y(1,arguments);var t=S(e);return P(t).getTime()===R(t).getTime()})(S(e))&&1===o&&1===I(e,s)&&(n=!1),i=a*(o-Number(n))}return 0===i?0:i}function O(e,t){y(2,arguments);var i=S(e),r=S(t),s=I(i,r),a=Math.abs(function(e,t){y(2,arguments);var i=S(e),r=S(t);return i.getFullYear()-r.getFullYear()}(i,r));i.setFullYear(1584),r.setFullYear(1584);var o=I(i,r)===-s,n=s*(a-Number(o));return 0===n?0:n}function U(e){y(1,arguments);var t=S(e);return t.setMinutes(59,59,999),t}var L={};function z(e,t){y(1,arguments);var i,r,s,a,o,n,l,d,c=f(null!=(i=null!=(r=null!=(s=null!=(a=null==t?void 0:t.weekStartsOn)?a:null==t||null==(o=t.locale)||null==(n=o.options)?void 0:n.weekStartsOn)?s:L.weekStartsOn)?r:null==(l=L.locale)||null==(d=l.options)?void 0:d.weekStartsOn)?i:0);if(!(c>=0&&c<=6))throw RangeError("weekStartsOn must be between 0 and 6 inclusively");var h=S(e),u=h.getDay();return h.setDate(h.getDate()+((u<c?-7:0)+6-(u-c))),h.setHours(23,59,59,999),h}function B(e){y(1,arguments);var t=S(e),i=t.getFullYear();return t.setFullYear(i+1,0,0),t.setHours(23,59,59,999),t}function j(e){y(1,arguments);var t=S(e);return t.setMinutes(0,0,0),t}function W(e){y(1,arguments);var t=S(e);return t.setDate(1),t.setHours(0,0,0,0),t}function G(e,t){y(1,arguments);var i,r,s,a,o,n,l,d,c=f(null!=(i=null!=(r=null!=(s=null!=(a=null==t?void 0:t.weekStartsOn)?a:null==t||null==(o=t.locale)||null==(n=o.options)?void 0:n.weekStartsOn)?s:L.weekStartsOn)?r:null==(l=L.locale)||null==(d=l.options)?void 0:d.weekStartsOn)?i:0);if(!(c>=0&&c<=6))throw RangeError("weekStartsOn must be between 0 and 6 inclusively");var h=S(e),u=h.getDay();return h.setDate(h.getDate()-(7*(u<c)+u-c)),h.setHours(0,0,0,0),h}function V(e){y(1,arguments);var t=S(e),i=new Date(0);return i.setFullYear(t.getFullYear(),0,1),i.setHours(0,0,0,0),i}function K(e,t){return y(2,arguments),b(e,-f(t))}function Y(e,t){return y(2,arguments),$(e,-f(t))}var q=a("2PP5g");const X={on:1,open:1,opening:1,true:1,off:0,closed:0,closing:0,false:0},Q=e=>{let t={};return Object.entries(e).forEach(([e,i])=>{if(!Array.isArray(i)||0===i.length){t[e]=[];return}let r=[...i].sort((e,t)=>(e.lc??e.lu??0)-(t.lc??t.lu??0)),s=new Set,a=r.map(t=>{let i,r="number"==typeof(i=t.lc??t.lu)?Math.round(1e3*i):void 0,a=(e=>{let t=e.trim().toLowerCase();if(t in X)return X[t];if(""===t||"unknown"===t||"unavailable"===t)return null;let i=Number(e);return Number.isFinite(i)?i:null})(t.s),o=t.s.trim().toLowerCase();null!==a||""===o||"unknown"===o||"unavailable"===o||s.has(o)||(console.warn(`[energy-custom-graph-card] RAW history for "${e}" contains non-numeric state "${t.s}". Rendering as empty.`),s.add(o));let n=r??Date.now();return{start:n,end:n,change:a,sum:a,mean:a,min:a,max:a,state:a}});t[e]=a}),t};var Z=a("hFSrI"),J=a("glq8a");const ee={mode:"energy"},et="[energy-custom-graph-card]",ei={weekStartsOn:1},er=new Set(["hour","day","week","month","year"]);class es extends Error{constructor(e){super(e),this.name="TimeoutError"}}class ea extends c.LitElement{static{this.FALLBACK_WARNING="[energy-custom-graph-card] Falling back to default period because energy date selection is unavailable."}static{this.DISABLED_FETCH_MESSAGE="Fetching statistics is disabled for this period. Choose a shorter time range to view data."}_getDisabledMessage(){let e=this.hass?.localize?.("ui.components.statistics_charts.choose_shorter_period");return e&&e.trim().length>0?e:ea.DISABLED_FETCH_MESSAGE}static{this.DEFAULT_STAT_TYPE="change"}static{this.clampValue=(e,t,i)=>{let r=e;return void 0!==t&&(r=Math.max(r,t)),void 0!==i&&(r=Math.min(r,i)),r}}connectedCallback(){super.connectedCallback(),this._visibilityListenerAttached||"undefined"==typeof document||(document.addEventListener("visibilitychange",this._handleVisibilityChange),this._visibilityListenerAttached=!0,this._isPageVisible="hidden"!==document.visibilityState),this.hass&&this._config&&this._syncWithConfig()}disconnectedCallback(){for(let e of(super.disconnectedCallback(),this._visibilityListenerAttached&&"undefined"!=typeof document&&(document.removeEventListener("visibilitychange",this._handleVisibilityChange),this._visibilityListenerAttached=!1),this._pendingVisibilityRefresh&&(clearTimeout(this._pendingVisibilityRefresh),this._pendingVisibilityRefresh=void 0),this._teardownEnergyCollection(),this._autoRefreshTimeout&&(clearTimeout(this._autoRefreshTimeout),this._autoRefreshTimeout=void 0),this._liveHourTimeout&&(clearTimeout(this._liveHourTimeout),this._liveHourTimeout=void 0),void 0!==this._rawAnimationFrame&&(cancelAnimationFrame(this._rawAnimationFrame),this._rawAnimationFrame=void 0),this._teardownRawStream("main"),this._teardownRawStream("compare"),this._fetchStates.values()))e.timeout&&(clearTimeout(e.timeout),e.timeout=void 0),e.inFlight=!1,e.queued=!1}shouldUpdate(e){if(e.has("_config"))return!0;if(e.has("hass")&&1===e.size){let t=e.get("hass");return!t||t.connected!==this.hass?.connected||t.themes!==this.hass?.themes||t.locale!==this.hass?.locale||t.config.state!==this.hass?.config.state}return!0}willUpdate(e){if(e.has("hass")&&this.hass&&this._config&&this._syncWithConfig(),e.has("_config")){let t=e.get("_config");this.hass&&this._config&&this._syncWithConfig(t)}}_syncWithConfig(e){if(!this._config||!this.hass)return;let t=this._needsEnergyCollection(this._config),i=this._needsEnergyCollection(e);if(t){let t=e?.collection_key!==this._config.collection_key,i=e?.timespan?.mode!==this._config.timespan?.mode;(t||i||!this._energyCollection&&!this._collectionPollHandle)&&this._setupEnergyCollection()}else i&&this._teardownEnergyCollection();this._shouldUseEnergyCompare()||this._clearCompareTracking();let r=this._recalculatePeriod(),s=this._recalculateComparePeriod(),a=!!e&&JSON.stringify(e.series)!==JSON.stringify(this._config.series);(r||a)&&(this._teardownRawStream("main"),this._clearShiftedSeriesData()),(s||a)&&this._teardownRawStream("compare"),(r||a||!this._statistics)&&this._scheduleLoad("main"),this._comparePeriodStart&&(s||a||!this._statisticsCompare)&&this._scheduleLoad("compare")}_needsEnergyCollection(e){return e?.timespan?.mode==="energy"}_getSeriesSource(e){return e.source?e.source:e.calculation?"calculation":(e.statistic_id,"statistic")}_normalizeSeriesTimeOffset(e){if(e&&"number"==typeof e.value&&Number.isFinite(e.value)&&Number.isInteger(e.value)&&0!==e.value&&["hour","day","week","month","year"].includes(e.unit))return{value:e.value,unit:e.unit}}_getSeriesTimeOffset(e){return this._normalizeSeriesTimeOffset(e.time_offset)}_hasSeriesTimeOffset(e=this._config){return!!e?.series?.some(e=>this._getSeriesTimeOffset(e))}_getStatisticSeriesTimeOffset(e){if("statistic"===this._getSeriesSource(e)&&e.statistic_id?.trim())return this._getSeriesTimeOffset(e)}_getCalculationSeriesTimeOffset(e){if("calculation"===this._getSeriesSource(e)&&e.calculation?.terms?.length)return this._getSeriesTimeOffset(e)}_shiftDateByTimeOffset(e,t,i){let r=t.value*i;switch(t.unit){case"hour":return $(e,r);case"day":return b(e,r);case"week":return T(e,r);case"month":return C(e,r);case"year":return E(e,r);default:return e}}_shiftTimestampByTimeOffset(e,t,i){if(void 0!==e)return this._shiftDateByTimeOffset(new Date(e),t,i).getTime()}_getShiftedStatisticId(e,t){return`__time_offset_${e}__${t}`}_clearShiftedSeriesData(){this._shiftedSeriesData=new Map,this._shiftedSeriesMetadata=new Map,this._shiftedCalculatedSeriesData=new Map,this._shiftedCalculatedSeriesUnits=new Map}_seriesUsesForecast(e){return!!e&&"forecast"===this._getSeriesSource(e)}_hasForecastSeries(e=this._config){return!!e?.series?.some(e=>this._seriesUsesForecast(e))}_getForecastKey(e){return`forecast_${e}`}_shouldUseEnergyCompare(){return!(!this._config||this._config.timespan?.mode!=="energy"||this._hasSeriesTimeOffset())&&!1!==this._config.allow_compare}_clearCompareTracking(){this._energyCompareStart=void 0,this._energyCompareEnd=void 0,(this._comparePeriodStart||this._comparePeriodEnd||this._statisticsCompare)&&(this._comparePeriodStart=void 0,this._comparePeriodEnd=void 0,this._resetCompareStatistics()),this._teardownRawStream("compare"),this._forecastSeriesDataCompare=new Map,this._forecastSeriesUnitsCompare=new Map}_setupEnergyCollection(e=0){if(this._config?.timespan?.mode!=="energy"||!this.hass)return;0===e?this._teardownEnergyCollection():this._collectionPollHandle&&(window.clearTimeout(this._collectionPollHandle),this._collectionPollHandle=void 0);let t=this.hass.connection,i="object"==typeof t&&null!==t?t:void 0,r=i?this._getEnergyCollectionKeys().map(e=>i[e]).find(e=>"object"==typeof e&&null!==e&&"function"==typeof e.subscribe):void 0;if(r&&"function"==typeof r.subscribe){this._collectionUnsub&&(this._collectionUnsub(),this._collectionUnsub=void 0),this._energyCollection=r,this._loggedEnergyFallback=!1,this._collectionUnsub=r.subscribe(e=>{let t=this._shouldUseEnergyCompare();if(this._energyStart=e.start,this._energyEnd=e.end??void 0,t)this._energyCompareStart=e.startCompare??void 0,this._energyCompareEnd=e.endCompare??void 0;else{let e=void 0!==this._comparePeriodStart||void 0!==this._comparePeriodEnd||!!this._statisticsCompare;this._energyCompareStart=void 0,this._energyCompareEnd=void 0,e&&this._clearCompareTracking()}let i=this._recalculatePeriod(),r=!!t&&this._recalculateComparePeriod(),s=i||!this._statistics,a=t&&!!this._comparePeriodStart,o=t&&a&&(r||!this._statisticsCompare);s&&this._scheduleLoad("main"),o&&this._scheduleLoad("compare")});return}if(e>=50){this._loggedEnergyFallback||(this._log("warn",ea.FALLBACK_WARNING,{hidden:!this._isPageVisible}),this._loggedEnergyFallback=!0),this._energyCollection=void 0,this._collectionUnsub=void 0,this._shouldUseEnergyCompare()||this._clearCompareTracking();let e=this._recalculatePeriod(),t=!!this._shouldUseEnergyCompare()&&this._recalculateComparePeriod();(e||!this._statistics)&&this._scheduleLoad("main"),this._shouldUseEnergyCompare()&&t&&this._comparePeriodStart&&this._scheduleLoad("compare"),this._collectionPollHandle=window.setTimeout(()=>this._setupEnergyCollection(50),1e3);return}this._collectionPollHandle=window.setTimeout(()=>this._setupEnergyCollection(e+1),200)}_getEnergyCollectionKeys(){if(this._config?.collection_key)return[`_${this._config.collection_key}`];let e=this.hass?.panelUrl,t=new Set;return e&&t.add(`_energy_${e}`),t.add("_energy"),Array.from(t)}_teardownEnergyCollection(){this._collectionPollHandle&&(window.clearTimeout(this._collectionPollHandle),this._collectionPollHandle=void 0),this._collectionUnsub&&(this._collectionUnsub(),this._collectionUnsub=void 0),this._energyCollection=void 0,this._energyStart=void 0,this._energyEnd=void 0,this._energyCompareStart=void 0,this._energyCompareEnd=void 0,this._clearCompareTracking()}_recalculatePeriod(){let e=this._resolvePeriod();if(!e)return!1;let{start:t,end:i}=e,r=this._periodStart?.getTime(),s=this._periodEnd?.getTime(),a=t.getTime(),o=i?.getTime(),n=r!==a||s!==o;return n&&(this._periodStart=t,this._periodEnd=i,this._lastRawEndMain=void 0),n}_recalculateComparePeriod(){let e=this._resolveComparePeriod(),t=this._comparePeriodStart?.getTime(),i=this._comparePeriodEnd?.getTime();if(!e)return(!!this._comparePeriodStart||!!this._comparePeriodEnd)&&(this._comparePeriodStart=void 0,this._comparePeriodEnd=void 0,this._resetCompareStatistics(),this._lastRawEndCompare=void 0,!0);let{start:r,end:s}=e,a=r.getTime(),o=s?.getTime(),n=t!==a||i!==o;return n&&(this._comparePeriodStart=r,this._comparePeriodEnd=s,this._resetCompareStatistics(),this._lastRawEndCompare=void 0),n}_resolvePeriod(){if(!this._config)return;let e=this._config.timespan??ee;switch(e.mode){case"energy":{let e=this._getEnergyRange();if(!e){if(this._loggedEnergyFallback)return this._defaultEnergyRange();return}return e}case"relative":{let t,i=e.offset??0,r=(t=e.period,er.has(t))?this._normalizeTimespanCount(e.count):1;switch(e.period){case"hour":{let e=this._defaultRelativeBase("hour"),t=$(e.start,i);return{start:$(t,-(r-1)),end:e.end?$(e.end,i):U(t)}}case"day":{let e=this._defaultRelativeBase("day"),t=b(e.start,i);return{start:b(t,-(r-1)),end:e.end?b(e.end,i):P(t)}}case"week":{let e=this._defaultRelativeBase("week"),t=T(e.start,i);return{start:T(t,-(r-1)),end:e.end?T(e.end,i):z(t,ei)}}case"month":{let e=this._defaultRelativeBase("month"),t=C(e.start,i);return{start:C(t,-(r-1)),end:e.end?C(e.end,i):R(t)}}case"last_7_days":{let e=b(this._getRoundedNow("last_7_days"),i);return{start:K(e,7),end:e}}case"last_60_minutes":{let e=$(this._getRoundedNow("last_60_minutes"),i);return{start:w(e,-60),end:e}}case"last_24_hours":{let e=b(this._getRoundedNow("last_24_hours"),i);return{start:Y(e,24),end:e}}case"last_30_days":{let e=b(this._getRoundedNow("last_30_days"),i);return{start:K(e,30),end:e}}case"last_12_months":{let e=C(this._getRoundedNow("last_12_months"),i);return{start:function(e,t){return y(2,arguments),C(e,-f(t))}(e,12),end:e}}default:{let e=this._defaultRelativeBase("year"),t=E(e.start,i);return{start:E(t,-(r-1)),end:e.end?E(e.end,i):B(t)}}}}case"fixed":{let t=e.start,i=t?new Date(t):A(new Date);if(Number.isNaN(i.getTime()))throw Error("Invalid start date in fixed timespan configuration");let r=e.end,s=r?new Date(r):P(i);if(Number.isNaN(s.getTime()))throw Error("Invalid end date in fixed timespan configuration");return{start:i,end:s}}default:return}}_resolveComparePeriod(){if(this._config&&"energy"===(this._config.timespan??ee).mode){if(this._shouldUseEnergyCompare()&&this._energyCompareStart)return{start:this._energyCompareStart,end:this._energyCompareEnd}}}_getEnergyRange(){if(this._energyStart)return{start:this._energyStart,end:this._energyEnd}}_defaultEnergyRange(){return{start:A(new Date),end:P(new Date)}}_normalizeTimespanCount(e){return"number"==typeof e&&Number.isFinite(e)&&Number.isInteger(e)&&!(e<1)?e:1}_getRoundedNow(e){let t=new Date;switch(e){case"last_60_minutes":case"last_hour":case"last_24_hours":return t.setSeconds(0,0),t;case"last_7_days":case"last_30_days":return t.getMinutes()>=20&&t.setHours(t.getHours()+1),t.setMinutes(20,0,0),t;case"last_12_months":case"last_year":return t.setHours(0,0,0,0),t;default:return t}}_defaultRelativeBase(e){let t=new Date;switch(e){case"hour":return{start:j(t),end:U(t)};case"day":return this._defaultEnergyRange();case"week":return{start:G(t,ei),end:z(t,ei)};case"month":return{start:W(t),end:R(t)};default:return{start:V(t),end:B(t)}}}_getFetchState(e){let t=this._fetchStates.get(e);return t||(t={inFlight:!1,queued:!1},this._fetchStates.set(e,t)),t}async _withTimeout(e,t,i,r){let s,a=new Promise((e,r)=>{s=window.setTimeout(()=>{r(new es(`${i} timed out after ${t} ms`))},t)});try{return await Promise.race([e,a])}catch(s){let e={...r??{},context:i,timeoutMs:t};throw s instanceof es?this._log("error",s.message,e):this._log("error",`Request failed in ${i}`,e),s}finally{void 0!==s&&clearTimeout(s)}}_scheduleLoad(e="main"){let t=this._getFetchState(e);if(!this._isPageVisible){t.queued=!0,t.timeout&&(clearTimeout(t.timeout),t.timeout=void 0),this._visibilityQueuedLoads.add(e),this._log("debug","Deferring load while page is hidden",{key:e});return}if(t.inFlight){t.queued=!0,t.timeout&&(clearTimeout(t.timeout),t.timeout=void 0);return}t.timeout&&clearTimeout(t.timeout),t.timeout=window.setTimeout(()=>{if(t.timeout=void 0,!this._isPageVisible){t.queued=!0,this._visibilityQueuedLoads.add(e),this._log("debug","Cancelled load execution because page is hidden",{key:e});return}this._loadStatistics(e)},500)}_scheduleLiveHourLoad(e){let t="compare"===e?"compare_live":"main_live",i=this._getFetchState(t);if(!this._isPageVisible){i.queued=!0,i.timeout&&(clearTimeout(i.timeout),i.timeout=void 0),this._visibilityQueuedLoads.add(t),this._log("debug","Deferring live-hour load while page is hidden",{key:t});return}if(i.inFlight){i.queued=!0;return}i.timeout&&clearTimeout(i.timeout),i.timeout=window.setTimeout(()=>{if(i.timeout=void 0,!this._isPageVisible){i.queued=!0,this._visibilityQueuedLoads.add(t),this._log("debug","Cancelled live-hour execution because page is hidden",{key:t});return}this._loadLiveHourPatch(e)},250)}_pauseVisibilityTimers(){for(let e of(this._autoRefreshTimeout&&(clearTimeout(this._autoRefreshTimeout),this._autoRefreshTimeout=void 0),this._liveHourTimeout&&(clearTimeout(this._liveHourTimeout),this._liveHourTimeout=void 0),this._fetchStates.values()))e.timeout&&(clearTimeout(e.timeout),e.timeout=void 0)}_scheduleVisibilityResume(){this._pendingVisibilityRefresh||(this._pendingVisibilityRefresh=window.setTimeout(()=>{if(this._pendingVisibilityRefresh=void 0,!this._isPageVisible)return;let e=Array.from(this._visibilityQueuedLoads);this._visibilityQueuedLoads.clear(),this._log("debug","Resuming after visibility change",{queued:e.join(",")||void 0}),!e.length&&(e.push("main"),this._shouldUseEnergyCompare()&&this._comparePeriodStart&&e.push("compare")),e.forEach(e=>{"main_live"===e?this._scheduleLiveHourLoad("main"):"compare_live"===e?this._scheduleLiveHourLoad("compare"):this._scheduleLoad(e)}),e.includes("main")||this._scheduleLoad("main"),this._shouldUseEnergyCompare()&&this._comparePeriodStart&&!e.includes("compare")&&this._scheduleLoad("compare"),this._scheduleAutoRefresh()},200))}async _loadLiveHourPatch(e){if(!this.hass)return;if(!this._isPageVisible)return void this._log("debug","Aborting live-hour load while hidden",{target:e});let t="compare"===e?"compare_live":"main_live",i=this._getFetchState(t);if(i.inFlight)return;if(!this._shouldComputeCurrentHour(e))return void("compare"===e?this._liveStatisticsCompare=void 0:(this._liveStatistics=void 0,this._liveHourTimeout&&(clearTimeout(this._liveHourTimeout),this._liveHourTimeout=void 0)));let r="compare"===e?this._lastStatisticIdsCompare:this._lastStatisticIds,s="compare"===e?this._lastStatTypesCompare:this._lastStatTypes;if(!r||!r.length)return;let a=this._computeLiveHourContext(e);if(!a)return;let o=`${t}-${Date.now()}`,n=performance.now();i.inFlight=!0,i.queued=!1;let{fetchStart:l,fetchEnd:d,currentHourStart:c}=a,h={key:t,target:e,hidden:!this._isPageVisible,requestId:o,fetchStart:new Date(l).toISOString(),fetchEnd:new Date(d).toISOString(),stats:r.length};this._log("debug","Loading live-hour statistics",h);try{let t=await this._withTimeout((0,q.fetchStatistics)(this.hass,new Date(l),new Date(d),r,"5minute",void 0,s),6e4,"fetchStatistics:liveHour",h),i=this._buildLiveHourPatch(e,t,a,r);this._applyLiveHourPatch(e,i)}catch(e){this._log("error","Failed to load live-hour statistics",{...h,error:e instanceof Error?e.message:e})}finally{i.inFlight=!1,i.queued&&(i.queued=!1,this._scheduleLiveHourLoad(e)),"main"===e&&this._shouldComputeCurrentHour("main")&&this._scheduleNextLiveHourTick();let t=Math.round(performance.now()-n);this._log("debug","Live-hour request completed",{...h,durationMs:t})}}_computeLiveHourContext(e){let t="compare"===e?this._comparePeriodStart:this._periodStart,i="compare"===e?this._comparePeriodEnd:this._periodEnd,r=new Date,s=r.getTime(),a=j(r).getTime(),o=Y(new Date(a),1).getTime(),n=t?.getTime(),l=i?.getTime(),d=Math.max(o,void 0!==n?n:o);if(!(s<=d))return{fetchStart:d,fetchEnd:s,currentHourStart:a,previousHourStart:o,periodStartMs:n,periodEndMs:l,nowMs:s}}_buildLiveHourPatch(e,t,i,r){let s="compare"===e?this._statisticsCompare:this._statistics;if(!s)return;let a=i.periodStartMs,o=i.periodEndMs,n=i.nowMs,l=i.currentHourStart,d={},c=!1,h=[];this._hourInDisplay(l,a,o)&&h.push(l);let u=i.previousHourStart;if(u>=i.fetchStart&&this._hourInDisplay(u,a,o)&&h.push(u),h.length){for(let e of r){let i=t[e]??[],r=s[e]??[],a=[];for(let e of h){let t=Math.min(e+36e5,o??e+36e5,n),s=r.find(t=>"number"==typeof t.start&&3e4>Math.abs(t.start-e));if(e===l){if(s&&"number"==typeof s.end&&s.end>=e+354e4)continue}else if(s)continue;let d=this._aggregateFiveMinuteEntries(i,e,t);d&&a.push(d)}a.length&&(a.sort((e,t)=>(e.start??0)-(t.start??0)),d[e]=a,c=!0)}return c?d:void 0}}_applyLiveHourPatch(e,t){if(!t||!Object.keys(t).length)return void("compare"===e?this._liveStatisticsCompare=void 0:this._liveStatistics=void 0);let i="compare"===e?this._statisticsCompare:this._statistics;if(!i)return;let r={...i};for(let[e,i]of Object.entries(t)){if(!i||!i.length)continue;let t=new Set(i.map(e=>"number"==typeof e.start?e.start:void 0).filter(e=>void 0!==e)),s=(r[e]??[]).filter(e=>"number"!=typeof e.start||!t.has(e.start));r[e]=[...s,...i].sort((e,t)=>(e.start??0)-(t.start??0))}"compare"===e?(this._liveStatisticsCompare=t,this._statisticsCompare=r,this._metadataCompare?this._rebuildCalculatedSeries(r,this._metadataCompare,"compare"):this._rebuildCalculatedSeries(r,{},"compare")):(this._liveStatistics=t,this._statistics=r,this._metadata?this._rebuildCalculatedSeries(r,this._metadata,"main"):this._rebuildCalculatedSeries(r,{},"main"))}_aggregateFiveMinuteEntries(e,t,i){let r=e.filter(e=>"number"==typeof e.start&&e.start>=t&&e.start<i);if(!r.length)return;let s=0,a=0,o=!1,n=!1,l=0,d=0,c=null,h=null,u=null;for(let e of r){let i="number"==typeof e.start?e.start:t,r=Math.max(0,("number"==typeof e.end?e.end:i+3e5)-i);"number"==typeof e.change&&Number.isFinite(e.change)&&(s+=e.change,o=!0),"number"==typeof e.sum&&Number.isFinite(e.sum)&&(a+=e.sum,n=!0),"number"==typeof e.min&&Number.isFinite(e.min)&&(c=null===c?e.min:Math.min(c,e.min)),"number"==typeof e.max&&Number.isFinite(e.max)&&(h=null===h?e.max:Math.max(h,e.max));let p="number"==typeof e.mean&&Number.isFinite(e.mean)?e.mean:"number"==typeof e.state&&Number.isFinite(e.state)?e.state:void 0;void 0!==p&&r>0&&(l+=p*r,d+=r),"number"==typeof e.state&&Number.isFinite(e.state)&&(u=e.state)}let p={start:t,end:i};return o&&(p.change=s),n&&(p.sum=a),null!==c&&(p.min=c),null!==h&&(p.max=h),d>0?p.mean=l/d:null!==u&&(p.mean=u),null!==u&&(p.state=u),p}_hourInDisplay(e,t,i){return(void 0===i||!(i<=e))&&(void 0===t||!(t>=e+36e5))}_scheduleNextLiveHourTick(){if(this._liveHourTimeout&&(clearTimeout(this._liveHourTimeout),this._liveHourTimeout=void 0),!this._shouldComputeCurrentHour("main"))return;let e=Math.max(this._getNextAlignedRefreshTime("5minute")-Date.now(),3e4);this._liveHourTimeout=window.setTimeout(()=>{this._liveHourTimeout=void 0,this._scheduleLiveHourLoad("main")},e)}_getRefreshTiming(e){if("disabled"===e)return{intervalMs:1/0,delayMs:0};if("raw"===e)return{intervalMs:6e4,delayMs:0};switch(e){case"5minute":return{intervalMs:3e5,delayMs:12e4};case"hour":default:return{intervalMs:36e5,delayMs:12e5};case"day":return{intervalMs:864e5,delayMs:18e5};case"week":case"year":case"month":return{intervalMs:6048e5,delayMs:36e5}}}_getNextAlignedRefreshTime(e){if("disabled"===e)return 1/0;let t=new Date,i=this._getRefreshTiming(e),r=new Date(t);if("raw"===e)return new Date(t.getTime()+i.intervalMs).getTime();switch(e){case"5minute":{let e=5*Math.ceil((t.getMinutes()+1)/5);r.setMinutes(e,0,0),r<=t&&r.setMinutes(r.getMinutes()+5),r.setMinutes(r.getMinutes()+2);break}case"hour":r.setHours(r.getHours()+1,20,0,0),r<=t&&r.setHours(r.getHours()+1);break;case"day":r.setDate(r.getDate()+1),r.setHours(0,30,0,0),r<=t&&r.setDate(r.getDate()+1);break;default:r=new Date(t.getTime()+i.intervalMs+i.delayMs)}return r.getTime()}_scheduleAutoRefresh(){if(this._autoRefreshTimeout&&(clearTimeout(this._autoRefreshTimeout),this._autoRefreshTimeout=void 0),!this._isPageVisible)return void this._log("debug","Skipping auto-refresh scheduling while hidden",{hidden:!0});let e=this._config?.timespan;if(!e)return;if(e.mode,"fixed"===e.mode){let t=e.end?new Date(e.end):null;if(!t||t<=new Date)return}if(!this._periodStart)return;let t=this._resolveAggregationPlan(this._periodStart,this._periodEnd)[0];if(!t||"disabled"===t)return;let i=this._getNextAlignedRefreshTime(t),r=i-Date.now();if(this._log("debug","Auto-refresh scheduled",{aggregation:t,nextRefreshIso:new Date(i).toISOString(),msUntilRefresh:r,mode:this._config?.timespan?.mode}),r<=0){this._log("warn","Calculated refresh time is in the past, using 1 minute fallback",{hidden:!this._isPageVisible}),this._autoRefreshTimeout=window.setTimeout(()=>{this._scheduleAutoRefresh()},6e4);return}this._autoRefreshTimeout=window.setTimeout(()=>{if(this._autoRefreshTimeout=void 0,!this._isPageVisible)return void this._log("debug","Auto-refresh timer fired while hidden",{hidden:!0});this._log("debug","Auto-refresh executing",{aggregation:t});let e=this._recalculatePeriod(),i=this._recalculateComparePeriod(),r=this._config?.timespan,s=!(r?.mode==="relative"&&r.period?.startsWith("last_"))||e,a="raw"===t&&this._hasActiveRawStream("main");if("raw"===t&&a&&(e&&this._applyRollingWindowShift("main"),s=!1),s&&this._scheduleLoad("main"),this._comparePeriodStart){let e="raw"===this._statisticsPeriodCompare&&this._hasActiveRawStream("compare");e&&i?this._applyRollingWindowShift("compare"):!e&&(i||s)&&this._scheduleLoad("compare")}this._scheduleAutoRefresh()},r)}async _loadStatistics(e="main"){let t,i;if(!this._config||!this.hass)return;let r=this._getFetchState(e);if(r.inFlight){r.queued=!0;return}let s="compare"===e,a=`${e}-${Date.now()}`,o=performance.now(),n={key:e,compare:s,hidden:!this._isPageVisible};n.requestId=a;let l=s?this._comparePeriodStart:this._periodStart,d=s?this._comparePeriodEnd:this._periodEnd;if(!l){this._log("debug","Skipping statistics load; no period defined",{...n}),s&&this._resetCompareStatistics();return}if(!this._isPageVisible)return void this._log("debug","Aborting statistics load while hidden",{...n});r.inFlight=!0,r.queued=!1;let c=l.getTime(),h=d?.getTime()??null;n.start=new Date(c).toISOString(),n.end=null!==h?new Date(h).toISOString():null;let u=new Set,p=new Set;this._config.series.forEach(e=>{let t=e.stat_type??ea.DEFAULT_STAT_TYPE;if("statistic"===this._getSeriesSource(e)&&e.statistic_id&&e.statistic_id.trim()&&(s||!this._getStatisticSeriesTimeOffset(e))){let i=e.statistic_id.trim();u.add(i),p.add(t)}"calculation"===this._getSeriesSource(e)&&(s||!this._getCalculationSeriesTimeOffset(e))&&e.calculation?.terms?.forEach(e=>{let i=e.stat_type??t??ea.DEFAULT_STAT_TYPE;e.statistic_id&&e.statistic_id.trim()&&(u.add(e.statistic_id.trim()),p.add(i))})});let _=Array.from(u),m=Array.from(p),g=["change","sum","mean","min","max","state"];if(m.length){let e=m.filter(e=>g.includes(e));t=e.length?e:void 0}t||(t=[ea.DEFAULT_STAT_TYPE]),n.statistics=_.length,s?(this._lastStatisticIdsCompare=_,this._lastStatTypesCompare=t):(this._lastStatisticIds=_,this._lastStatTypes=t);let f=this._resolveAggregationPlan(l,d),v=f[0];if(n.aggregationPlan=f.join(" -> "),this._log("info","Loading statistics",n),"disabled"===v){r.inFlight=!1,r.queued=!1;let e={start:c,end:h};this._isLoading=!1,this._log("info","Aggregation disabled; skipping data load",{...n}),s?(this._liveStatisticsCompare=void 0,this._statisticsRangeCompare=e,this._statisticsPeriodCompare="disabled",this._metadataCompare=void 0,this._statisticsCompare=void 0,this._calculatedSeriesDataCompare=new Map,this._calculatedSeriesUnitsCompare=new Map):(this._liveStatistics=void 0,this._statisticsRange=e,this._statisticsPeriod="disabled",this._metadata=void 0,this._statistics=void 0,this._calculatedSeriesData=new Map,this._calculatedSeriesUnits=new Map,this._chartData=[],this._chartOptions=void 0,this._unitsBySeries=new Map,this._indicatorColorBySeries=new Map,this._clearShiftedSeriesData(),this._disabledMessage=this._getDisabledMessage(),this._autoRefreshTimeout&&(clearTimeout(this._autoRefreshTimeout),this._autoRefreshTimeout=void 0),this._liveHourTimeout&&(clearTimeout(this._liveHourTimeout),this._liveHourTimeout=void 0));return}s||(this._disabledMessage=void 0);let y=++this._activeFetchCounters[e],S=!s&&!this._statistics;S&&(this._isLoading=!0);try{let r,a,o={};if(_.length)try{(await this._withTimeout((0,q.getStatisticMetadata)(this.hass,_),6e4,"getStatisticMetadata",{...n,stats:_.length})).forEach(e=>{o[e.statistic_id]=e})}catch(e){e instanceof es||this._log("error","Failed to load statistics metadata",{...n,error:e instanceof Error?e.message:e})}let u={};if(_.length)for(let e=0;e<f.length;e++){let o=f[e];if(a=o,"disabled"===o){r=o;break}try{if("raw"===o){let t=s?this._lastRawEndCompare:this._lastRawEndMain,a=void 0!==t?t-6e4:void 0,c=h??null,p=void 0!==a&&null!==c&&a>=c?void 0:a,m=await this._fetchRawStatistics(l,d,_,n,p);if(u=m,this._statisticsHaveData(m,_)){i=void 0,e>0&&this._log("warn",`Aggregation "${f[0]}" returned no data. Using fallback "raw".`,{...n,aggregation:o}),r=o;break}e<f.length-1&&this._log("warn",`Aggregation "raw" returned no data. Trying fallback "${f[e+1]}".`,{...n,aggregation:o})}else{let s=await this._withTimeout((0,q.fetchStatistics)(this.hass,l,d,_,o,void 0,t),6e4,`fetchStatistics:${o}`,{...n,aggregation:o,stats:_.length});if(u=s,this._statisticsHaveData(s,_)){i=void 0,e>0&&this._log("warn",`Aggregation "${f[0]}" returned no data. Using fallback "${o}".`,{...n,aggregation:o}),r=o;break}e<f.length-1&&this._log("warn",`Aggregation "${o}" returned no data. Trying fallback "${f[e+1]}".`,{...n,aggregation:o})}}catch(e){i=e,this._log("error",`Failed to load statistics for aggregation "${o}"`,{...n,aggregation:o,error:e instanceof Error?e.message:e})}}if(y===this._activeFetchCounters[e]){let t=r??a??f[0];if(s)if(this._statisticsRangeCompare={start:c,end:h},this._statisticsPeriodCompare=t,"disabled"===t)this._metadataCompare=void 0,this._statisticsCompare=void 0,this._calculatedSeriesDataCompare=new Map,this._calculatedSeriesUnitsCompare=new Map,this._lastRawEndCompare=void 0,this._forecastSeriesDataCompare=new Map,this._forecastSeriesUnitsCompare=new Map;else{if("raw"===t){let e="raw"===a&&this._statisticsCompare?this._mergeStatistics(this._statisticsCompare,u):u,t=this._trimStatisticsToRange(e,c,h);this._metadataCompare=o,this._statisticsCompare=t,this._lastRawEndCompare=this._computeMaxEnd(t),this._rebuildCalculatedSeries(t,o,"compare"),this._restartRawStream("compare")}else this._metadataCompare=o,this._statisticsCompare=u,this._lastRawEndCompare=void 0,this._rebuildCalculatedSeries(u,o,"compare"),this._teardownRawStream("compare");this._shouldComputeCurrentHour("compare")||(this._liveStatisticsCompare=void 0),this._forecastSeriesDataCompare=new Map,this._forecastSeriesUnitsCompare=new Map}else if(this._statisticsRange={start:c,end:h},this._statisticsPeriod=t,"disabled"===t)this._metadata=void 0,this._statistics=void 0,this._calculatedSeriesData=new Map,this._calculatedSeriesUnits=new Map,this._chartData=[],this._chartOptions=void 0,this._unitsBySeries=new Map,this._indicatorColorBySeries=new Map,this._disabledMessage=this._getDisabledMessage(),this._autoRefreshTimeout&&(clearTimeout(this._autoRefreshTimeout),this._autoRefreshTimeout=void 0),this._lastRawEndMain=void 0,this._clearForecastData(),this._clearShiftedSeriesData();else{if(this._disabledMessage=void 0,"raw"===t){let e="raw"===a&&this._statistics?this._mergeStatistics(this._statistics,u):u,t=this._trimStatisticsToRange(e,c,h);this._metadata=o,this._statistics=t,this._lastRawEndMain=this._computeMaxEnd(t),this._rebuildCalculatedSeries(t,o,"main"),this._restartRawStream("main")}else this._metadata=o,this._statistics=u,this._lastRawEndMain=void 0,this._rebuildCalculatedSeries(u,o,"main"),this._teardownRawStream("main");if(await this._loadShiftedStatisticSeries(l,d,n,e,y),y!==this._activeFetchCounters[e]||(await this._refreshForecastData(),y!==this._activeFetchCounters[e]))return;this._generateChart(),this._scheduleAutoRefresh(),this._shouldComputeCurrentHour("main")?(this._scheduleLiveHourLoad("main"),this._scheduleNextLiveHourTick()):(this._liveStatistics=void 0,this._liveHourTimeout&&(clearTimeout(this._liveHourTimeout),this._liveHourTimeout=void 0))}}}catch(t){i=t,y===this._activeFetchCounters[e]&&(this._log("error","Failed to load statistics",{...n,error:t instanceof Error?t.message:t}),s?this._resetCompareStatistics():(this._metadata=void 0,this._statistics=void 0,this._statisticsRange=void 0,this._statisticsPeriod=void 0,this._calculatedSeriesData=new Map,this._calculatedSeriesUnits=new Map,this._clearShiftedSeriesData(),this._clearForecastData()))}finally{if(y===this._activeFetchCounters[e]){S&&(this._isLoading=!1),r.inFlight=!1,r.queued&&(r.queued=!1,this._scheduleLoad(e));let t=Math.round(performance.now()-o),a=s?this._statisticsPeriodCompare:this._statisticsPeriod;this._log(i?"warn":"info","Statistics request completed",{...n,aggregation:a,durationMs:t,status:i?"error":"success"})}}}_getShiftedFetchGroup(e,t,i,r){let s=this._shiftDateByTimeOffset(t,r,1),a=i?this._shiftDateByTimeOffset(i,r,1):void 0,o=[r.value,r.unit,s.getTime(),a?.getTime()??"open"].join(":"),n=e.get(o);return n||(n={key:o,sourceStart:s,sourceEnd:a,offset:r,statisticSeries:[],calculationSeries:[]},e.set(o,n)),n}_getCalculationTermStatisticRequests(e,t){let i=e.stat_type??ea.DEFAULT_STAT_TYPE;return(t.terms??[]).map(e=>({statisticId:e.statistic_id?.trim()??"",statType:e.stat_type??i??ea.DEFAULT_STAT_TYPE})).filter(e=>""!==e.statisticId)}_buildShiftedSeriesFetchGroups(e,t){if(!this._config)return[];let i=new Map;return this._config.series.forEach((r,s)=>{let a=r.statistic_id?.trim(),o=this._getStatisticSeriesTimeOffset(r);o&&a&&this._getShiftedFetchGroup(i,e,t,o).statisticSeries.push({index:s,statisticId:a,statType:r.stat_type??ea.DEFAULT_STAT_TYPE,offset:o});let n=this._getCalculationSeriesTimeOffset(r);n&&r.calculation&&this._getShiftedFetchGroup(i,e,t,n).calculationSeries.push({index:s,series:r,calculation:r.calculation,offset:n})}),Array.from(i.values())}_transformShiftedStatisticValues(e,t){return e.map(e=>({...e,start:this._shiftTimestampByTimeOffset(e.start,t,-1),end:this._shiftTimestampByTimeOffset(e.end,t,-1)}))}async _loadShiftedStatisticSeries(e,t,i,r,s){let a=()=>s===this._activeFetchCounters[r];if(!this.hass){a()&&this._clearShiftedSeriesData();return}let o=this._buildShiftedSeriesFetchGroups(e,t);if(!o.length){a()&&this._clearShiftedSeriesData();return}let n=new Map,l=new Map,d=new Map,c=new Map,h={...this._metadata??{}},u=Array.from(new Set(o.flatMap(e=>[...e.statisticSeries.map(e=>e.statisticId),...e.calculationSeries.flatMap(e=>this._getCalculationTermStatisticRequests(e.series,e.calculation).map(e=>e.statisticId))])));try{let e=u.filter(e=>!h[e]);e.length&&(await this._withTimeout((0,q.getStatisticMetadata)(this.hass,e),6e4,"getStatisticMetadata:timeOffset",{...i,shiftedGroups:o.length,stats:e.length})).forEach(e=>{h[e.statistic_id]=e})}catch(e){if(!a())return;this._log("warn","Failed to load shifted statistics metadata",{...i,shiftedGroups:o.length,error:e instanceof Error?e.message:e})}if(a()){for(let e of o){let t,r,s=Array.from(new Set([...e.statisticSeries.map(e=>e.statisticId),...e.calculationSeries.flatMap(e=>this._getCalculationTermStatisticRequests(e.series,e.calculation).map(e=>e.statisticId))])),o=Array.from(new Set([...e.statisticSeries.map(e=>e.statType),...e.calculationSeries.flatMap(e=>this._getCalculationTermStatisticRequests(e.series,e.calculation).map(e=>e.statType))])),u=this._resolveAggregationPlan(e.sourceStart,e.sourceEnd);for(let n=0;n<u.length;n++){let l=u[n];if("disabled"===l){t=l;break}if("raw"===l){this._log("warn","Series time offset does not support raw aggregation yet",{...i,shiftedGroup:e.key,aggregation:l});continue}if(!s.length){r={},t=l;break}try{let d=await this._withTimeout((0,q.fetchStatistics)(this.hass,e.sourceStart,e.sourceEnd,s,l,void 0,o),6e4,`fetchStatistics:timeOffset:${l}`,{...i,shiftedGroup:e.key,sourceStart:e.sourceStart.toISOString(),sourceEnd:e.sourceEnd?.toISOString()??null,aggregation:l,stats:s.length});if(!a())return;if(this._statisticsHaveData(d,s)){r=d,t=l,n>0&&this._log("warn",`Shifted aggregation "${u[0]}" returned no data. Using fallback "${l}".`,{...i,shiftedGroup:e.key,aggregation:l});break}n<u.length-1&&this._log("warn",`Shifted aggregation "${l}" returned no data. Trying fallback "${u[n+1]}".`,{...i,shiftedGroup:e.key,aggregation:l})}catch(t){if(!a())return;this._log("error",`Failed to load shifted statistics for aggregation "${l}"`,{...i,shiftedGroup:e.key,aggregation:l,error:t instanceof Error?t.message:t})}}r&&"disabled"!==t&&(e.statisticSeries.forEach(e=>{let t=r?.[e.statisticId];t?.length&&(n.set(e.index,this._transformShiftedStatisticValues(t,e.offset)),l.set(e.index,h[e.statisticId]))}),e.calculationSeries.forEach(i=>{let s=this._evaluateCalculationSeries(i.series,i.calculation,r??{},h,i.index,"main",{start:e.sourceStart,end:e.sourceEnd,period:t});if(!s?.values.length)return;let a=this._getCalculationKey(i.index);d.set(a,this._transformShiftedStatisticValues(s.values,i.offset)),c.set(a,s.unit)}))}a()&&(this._shiftedSeriesData=n,this._shiftedSeriesMetadata=l,this._shiftedCalculatedSeriesData=d,this._shiftedCalculatedSeriesUnits=c)}}_buildMainSeriesInputs(){let e={...this._statistics??{}},t={...this._metadata??{}},i=new Map(this._calculatedSeriesData);this._shiftedCalculatedSeriesData.forEach((e,t)=>{i.set(t,e)});let r=new Map(this._calculatedSeriesUnits);this._shiftedCalculatedSeriesUnits.forEach((e,t)=>{r.set(t,e)});let s=(this._config?.series??[]).map((i,r)=>{let s=this._getStatisticSeriesTimeOffset(i),a=i.statistic_id?.trim();if(!s||!a)return i;let o=this._getShiftedStatisticId(r,a);e[o]=this._shiftedSeriesData.get(r)??[];let n=this._shiftedSeriesMetadata.get(r)??this._metadata?.[a];n&&(t[o]={...n,statistic_id:o});let l=i.name??n?.name??this.hass?.states[a]?.attributes.friendly_name??a;return{...i,statistic_id:o,name:l}});return{statistics:e,metadata:t,configSeries:s,calculatedData:i,calculatedUnits:r}}async _fetchRawStatistics(e,t,i,r,s){if(!this._config||!this.hass||!i.length)return{};let a=s?new Date(Math.max(e.getTime(),s)):e,{start:o,end:n}=this._expandRawQueryWindow(a,t),l=this._config.aggregation?.raw_options,d={};return l?.significant_changes_only!==void 0&&(d.significant_changes_only=l.significant_changes_only),Q(await this._withTimeout(((e,t,i,r,s)=>{let a={type:"history/history_during_period",start_time:t.toISOString(),minimal_response:!0,no_attributes:!0};return i&&(a.end_time=i.toISOString()),s?.significant_changes_only!==void 0&&(a.significant_changes_only=s.significant_changes_only),r.length&&(a.entity_ids=r),e.callWS(a)})(this.hass,o,n,i,d),6e4,"fetchRawHistoryStates",{...r??{},raw:!0,stats:i.length}))}_expandRawQueryWindow(e,t){if(!t)return{start:e,end:t};let i=e.getTime(),r=t.getTime(),s=Math.max(6e4,.1*Math.max(r-i,0));return{start:new Date(i-s),end:new Date(r+s)}}_clearForecastData(){this._forecastSeriesData=new Map,this._forecastSeriesUnits=new Map,this._forecastSeriesDataCompare=new Map,this._forecastSeriesUnitsCompare=new Map}async _ensureEnergyPreferences(){if(this.hass&&!this._solarSourcesByStatistic.size)try{let e=await (0,Z.fetchEnergyPreferences)(this.hass),t=new Map;e.energy_sources?.forEach(e=>{e?.type==="solar"&&"string"==typeof e.stat_energy_from&&e.stat_energy_from.trim().length&&t.set(e.stat_energy_from,{type:"solar",stat_energy_from:e.stat_energy_from,config_entry_solar_forecast:e.config_entry_solar_forecast??null})}),this._solarSourcesByStatistic=t}catch(e){this._solarSourcesByStatistic=new Map,this._log("error","Failed to load energy preferences",{error:e instanceof Error?e.message:e})}}async _ensureSolarForecasts(e=!1){if(!this.hass)return;let t=Date.now();if(e||!this._solarForecasts||!this._lastSolarForecastFetch||!(t-this._lastSolarForecastFetch<3e5))try{this._solarForecasts=await (0,Z.fetchEnergySolarForecasts)(this.hass),this._lastSolarForecastFetch=t}catch(e){this._solarForecasts=void 0,this._lastSolarForecastFetch=void 0,this._log("error","Failed to load solar forecasts",{error:e instanceof Error?e.message:e})}}_resolveForecastIds(e){if(!this._solarSourcesByStatistic.size)return[];let t=e.pv_production_entity?.trim();if(t&&t.length){let e=this._solarSourcesByStatistic.get(t);if(!e)return this._log("warn","PV production entity not found for forecast series",{entity:t}),[];let i=e.config_entry_solar_forecast??[];return i.length||this._log("warn","PV production entity has no solar forecast assigned",{entity:t}),i.filter(e=>"string"==typeof e&&e.trim().length>0)}let i=new Set;return this._solarSourcesByStatistic.forEach(e=>{e.config_entry_solar_forecast?.forEach(e=>{"string"==typeof e&&e.trim().length>0&&i.add(e)})}),i.size||this._log("warn","No solar forecasts configured in the energy dashboard",{}),Array.from(i)}_alignForecastBucketStart(e,t){return this._alignBucketStart(e,t).getTime()}_buildForecastStatistics(e,t,i,r){if(!this._solarForecasts||!e.length)return[];let s=new Map;if(e.forEach(e=>{let r=this._solarForecasts?.[e];r?.wh_hours&&Object.entries(r.wh_hours).forEach(([e,r])=>{let a=new Date(e).getTime();!Number.isFinite(a)||a<t||null!==i&&a>i||s.set(a,(s.get(a)??0)+r/1e3)})}),!s.size)return[];let a=Array.from(s.entries()).sort((e,t)=>e[0]-t[0]);if(!r||"raw"===r||"disabled"===r)return a.map(([e,t])=>({start:e,end:e+36e5,change:t,sum:t,mean:t,min:t,max:t,state:t}));let o=new Map;return a.forEach(([e,t])=>{let i=this._alignForecastBucketStart(e,r);o.set(i,(o.get(i)??0)+t)}),Array.from(o.entries()).sort((e,t)=>e[0]-t[0]).map(([e,t])=>{let i=this._advanceBucket(new Date(e),r).getTime();return{start:e,end:i,change:t,sum:t,mean:t,min:t,max:t,state:t}})}async _refreshForecastData(){if(!this._config||!this.hass||!this._periodStart)return void this._clearForecastData();let e=this._config.series.map((e,t)=>({series:e,index:t})).filter(({series:e})=>this._seriesUsesForecast(e));if(!e.length)return void this._clearForecastData();let t=this._statisticsPeriod;if("year"===t){this._clearForecastData(),this._warnedForecastYearAggregation||(this._log("warn","Forecast series are not shown for yearly aggregation",{}),this._warnedForecastYearAggregation=!0);return}if(await this._ensureEnergyPreferences(),!this._solarSourcesByStatistic.size||(await this._ensureSolarForecasts(),!this._solarForecasts))return void this._clearForecastData();let i=this._statisticsRange?.start??this._periodStart.getTime(),r=this._periodEnd?.getTime()??this._statisticsRange?.end??null,s=new Map,a=new Map;e.forEach(({series:e,index:o})=>{let n=this._resolveForecastIds(e);if(!n.length)return;let l=this._buildForecastStatistics(n,i,r,t);if(!l.length)return;let d=this._getForecastKey(o);s.set(d,l),a.set(d,"kWh")}),this._forecastSeriesData=s,this._forecastSeriesUnits=a,this._forecastSeriesDataCompare=new Map,this._forecastSeriesUnitsCompare=new Map}_hasActiveRawStream(e){return"compare"===e?void 0!==this._rawStreamUnsubCompare:void 0!==this._rawStreamUnsubMain}async _restartRawStream(e){await this._teardownRawStream(e),await this._setupRawStream(e)}async _teardownRawStream(e){let t="compare"===e?this._rawStreamUnsubCompare:this._rawStreamUnsubMain;if(t){"compare"===e?this._rawStreamUnsubCompare=void 0:this._rawStreamUnsubMain=void 0;try{let i=await t;"function"==typeof i&&await i(),this._log("debug","Raw history stream unsubscribed",{target:e})}catch(t){this._log("warn","Failed to unsubscribe RAW history stream",{target:e,error:t instanceof Error?t.message:t})}}}async _setupRawStream(e){if(!this.hass||!this._shouldUseRawStream(e))return;let t="compare"===e?this._lastStatisticIdsCompare:this._lastStatisticIds;if(!t?.length)return;let i="compare"===e?this._lastRawEndCompare:this._lastRawEndMain,r="compare"===e?this._statisticsRangeCompare:this._statisticsRange,s="compare"===e?this._comparePeriodStart:this._periodStart,a=r?.start??s?.getTime()??Date.now(),o=a;void 0!==i&&(o=Math.max(i-6e4,a));let n=this._config?.aggregation?.raw_options,l={type:"history/stream",entity_ids:t,start_time:new Date(o).toISOString(),minimal_response:!0,no_attributes:!0};n?.significant_changes_only!==void 0&&(l.significant_changes_only=n.significant_changes_only);let d=this.hass.connection.subscribeMessage(t=>{this._handleRawStreamMessage(e,t)},l).then(i=>(this._log("debug","Subscribed to RAW history stream",{target:e,start:new Date(o).toISOString(),stats:t.length}),i)).catch(t=>{this._log("error","Failed to subscribe to RAW history stream",{target:e,error:t instanceof Error?t.message:t}),"compare"===e?this._rawStreamUnsubCompare=void 0:this._rawStreamUnsubMain=void 0,this._scheduleLoad("compare"===e?"compare":"main")});"compare"===e?this._rawStreamUnsubCompare=d:this._rawStreamUnsubMain=d}_handleRawStreamMessage(e,t){t?.states&&Object.keys(t.states).length&&this._applyRawStreamStates(e,t.states)}_applyRawStreamStates(e,t){if(!this._shouldUseRawStream(e))return;let i=Q(t);if(!Object.values(i).some(e=>e?.length))return;let r="compare"===e?this._metadataCompare:this._metadata,s="compare"===e?this._statisticsCompare:this._statistics,a=this._mergeStatistics(s,i),o="compare"===e?this._comparePeriodStart:this._periodStart,n="compare"===e?this._comparePeriodEnd:this._periodEnd,l="compare"===e?this._statisticsRangeCompare:this._statisticsRange,d=l?.start??o?.getTime(),c=l?.end??n?.getTime()??null,h=void 0!==d?this._trimStatisticsToRange(a,d,c):a;"compare"===e?(this._statisticsCompare=h,this._statisticsRangeCompare=void 0!==d?{start:d,end:c}:this._statisticsRangeCompare,this._lastRawEndCompare=this._computeMaxEnd(h),this._rebuildCalculatedSeries(h,r??{},"compare")):(this._statistics=h,this._statisticsRange=void 0!==d?{start:d,end:c}:this._statisticsRange,this._lastRawEndMain=this._computeMaxEnd(h),this._rebuildCalculatedSeries(h,r??{},"main"))}_applyRollingWindowShift(e){let t="compare"===e?this._statisticsCompare:this._statistics,i="compare"===e?this._comparePeriodStart:this._periodStart;if(!t||!i)return;let r="compare"===e?this._comparePeriodEnd:this._periodEnd,s={start:i.getTime(),end:r?.getTime()??null},a=this._trimStatisticsToRange(t,s.start,s.end);"compare"===e?(this._statisticsCompare=a,this._statisticsRangeCompare=s,this._lastRawEndCompare=this._computeMaxEnd(a),this._rebuildCalculatedSeries(a,this._metadataCompare??{},"compare")):(this._statistics=a,this._statisticsRange=s,this._lastRawEndMain=this._computeMaxEnd(a),this._rebuildCalculatedSeries(a,this._metadata??{},"main"))}_shouldUseRawStream(e){if("compare"===e||!this._isPageVisible||!this.hass||"raw"!==("compare"===e?this._statisticsPeriodCompare:this._statisticsPeriod))return!1;let t="compare"===e?this._lastStatisticIdsCompare:this._lastStatisticIds;return Array.isArray(t)&&t.length>0}_getCalculationKey(e){return`calculation_${e}`}_rebuildCalculatedSeries(e,t,i="main"){let r=new Map,s=new Map;if(!this._config)return void("main"===i?(this._calculatedSeriesData=r,this._calculatedSeriesUnits=s):(this._calculatedSeriesDataCompare=r,this._calculatedSeriesUnitsCompare=s));this._config.series.forEach((a,o)=>{if(!a.calculation||"main"===i&&this._getCalculationSeriesTimeOffset(a))return;let n=this._evaluateCalculationSeries(a,a.calculation,e,t,o,i);if(!n)return;let l=this._getCalculationKey(o);r.set(l,n.values),s.set(l,n.unit)}),"main"===i?(this._calculatedSeriesData=r,this._calculatedSeriesUnits=s):(this._calculatedSeriesDataCompare=r,this._calculatedSeriesUnitsCompare=s)}_resetCompareStatistics(){this._statisticsCompare=void 0,this._metadataCompare=void 0,this._statisticsRangeCompare=void 0,this._statisticsPeriodCompare=void 0,this._calculatedSeriesDataCompare=new Map,this._calculatedSeriesUnitsCompare=new Map}_evaluateCalculationSeries(e,t,i,r,s,a,o){if(!t.terms?.length)return;let n=new Set,l=[],d=new Set,c=e.name??e.statistic_id??`series_${s}`;t.terms.forEach(t=>{let s=t.multiply??1,a=t.add??0;if(t.statistic_id){let o=i?.[t.statistic_id],h=t.stat_type??e.stat_type??ea.DEFAULT_STAT_TYPE,u=new Map,p=[];o?.length?(o.forEach(e=>{let i=e.end??e.start;if(void 0===i)return;let r=e[h],o="number"==typeof r&&Number.isFinite(r)?r:null,l=null===o?null:ea.clampValue(o*s+a,t.clip_min,t.clip_max);u.set(i,{value:l,start:e.start,end:e.end}),p.push({timestamp:i,value:l,start:e.start,end:e.end}),n.add(i)}),p.sort((e,t)=>e.timestamp-t.timestamp)):d.has(t.statistic_id)||(console.warn(`[energy-custom-graph-card] Calculation series "${c}" references statistic "${t.statistic_id}" but no data was loaded. Missing values will be treated as zero.`),d.add(t.statistic_id)),l.push({term:t,data:u,timeline:p.length?p:void 0,unit:r?.[t.statistic_id]?.statistics_unit_of_measurement??void 0})}else{let e=ea.clampValue((t.constant??0)*s+a,t.clip_min,t.clip_max);l.push({term:t,constant:e})}});let h=Array.from(n).sort((e,t)=>e-t),u=!h.length&&l.every(e=>void 0===e.term.statistic_id&&void 0!==e.constant);if(!h.length&&!u)return;let p=t.initial_value??0,_=[],m=new Set,g=!1,f=e=>{let t,i,r=p,s=!0;l.forEach(a=>{let o;if(s){if(a.data){let r=this._resolveCalculationTermValue(a,e);if(r){let s=r.start??e,a=r.end??e;void 0===t&&(t=s),void 0===i&&(i=a),o=r.value}else{o=0;let e=a.term.statistic_id;e&&!m.has(e)&&(console.warn(`[energy-custom-graph-card] Missing value for statistic "${e}" in calculation series "${c}". Using 0 for this timestamp.`),m.add(e))}}else o=a.constant??0;switch(a.term.operation??"add"){case"subtract":r-=o;break;case"multiply":r*=o;break;case"divide":0===o?(s=!1,g||(console.warn(`[energy-custom-graph-card] Division by zero encountered in calculation series "${c}". The affected timestamp will be rendered as empty.`),g=!0)):r/=o;break;default:r+=o}}});let a=s&&Number.isFinite(r)?r:null,o=t??e,n=i??e;_.push({start:o,end:n,change:a,sum:a,mean:a,min:a,max:a,state:a})};if(h.length)h.forEach(f);else if(u){let e=o??this._getCalculationTimeContext(a);if(e?.start){let t=new Set,r=e=>{"number"==typeof e&&Number.isFinite(e)&&(t.has(e)||(t.add(e),f(e)))},s=e.start.getTime(),a=e.end?.getTime();if(r(s),void 0!==a&&r(a),e.period&&"raw"!==e.period&&"disabled"!==e.period&&e.end){let t=this._buildBucketSequence(s,e.end.getTime(),e.period);t?.forEach(r)}Object.values(i).forEach(e=>{e?.forEach(e=>{r(e.start),r(e.end)})}),1===t.size&&void 0===a&&r(s+1)}}return{values:_,unit:t.unit??l.find(e=>void 0!==e.unit)?.unit??null}}_resolveCalculationTermValue(e,t){let i=e.data?.get(t);if(i&&"number"==typeof i.value&&Number.isFinite(i.value))return e.lastNonNull={value:i.value,start:i.start,end:i.end},{value:i.value,start:i.start,end:i.end};let r=e.timeline;if(!r||!r.length)return null;for(void 0===e.cursor&&(e.cursor=0);e.cursor<r.length&&r[e.cursor].timestamp<=t;){let t=r[e.cursor];"number"==typeof t.value&&Number.isFinite(t.value)&&(e.lastNonNull={value:t.value,start:t.start,end:t.end}),e.cursor+=1}let s=e.lastNonNull;return s?{value:s.value,start:s.start,end:s.end}:null}_getCalculationTimeContext(e){return"compare"===e?{start:this._comparePeriodStart,end:this._comparePeriodEnd,period:this._statisticsPeriodCompare}:{start:this._periodStart,end:this._periodEnd,period:this._statisticsPeriod}}_statisticsHaveData(e,t){return!t.length||t.some(t=>e?.[t]?.length)}_shouldComputeCurrentHour(e){if(!this._config?.aggregation?.compute_current_hour||"hour"!==("compare"===e?this._statisticsPeriodCompare:this._statisticsPeriod))return!1;let t="compare"===e?this._comparePeriodStart:this._periodStart,i="compare"===e?this._comparePeriodEnd:this._periodEnd;if(!t)return!1;let r=new Date;if(t>r)return!1;let s=j(r);return!i||!(i<=s)}_resolveAggregationPlan(e,t){let i=this._config?.aggregation,r=this._needsEnergyCollection(this._config),s=this._deriveAutoStatisticsPeriod(e,t),a=[],o=!1,n=e=>{!o&&e&&(a.includes(e)||a.push(e),"disabled"===e&&(o=!0))};if(r){let r=this._getEnergyPickerRangeKey(e,t);n(i?.energy_picker?.[r])}else n(i?.manual);return n(s),n(i?.fallback),a.length?a:[s]}_deriveAutoStatisticsPeriod(e,t){let i=t??new Date;if(2>=Math.max(N(i,e),0))return"5minute";let r=Math.max(H(i,e),0);return r>35?"month":r>2?"day":"hour"}_getEnergyPickerRangeKey(e,t){let i=t??new Date,r=Math.max(N(i,e),0),s=Math.max(H(i,e),0);return r<=6?"hour":s<=1?"day":s<=7?"week":s<=35?"month":"year"}static getStubConfig(){return{type:"custom:energy-custom-graph-card",series:[]}}static async getConfigElement(){return await Promise.resolve(a("c09yQ")),document.createElement("energy-custom-graph-card-editor")}setConfig(e){if(!e.series||!Array.isArray(e.series)||!e.series.length)throw Error("At least one series must be configured");e.series.forEach((e,t)=>{if(!e)return void console.warn(`[energy-custom-graph-card] Series at index ${t} is not defined and will be ignored.`);let i="string"==typeof e.statistic_id&&""!==e.statistic_id.trim(),r=!!e.calculation;if(i&&r&&console.warn(`[energy-custom-graph-card] Series at index ${t} defines both statistic_id and calculation. The statistic will be ignored.`),i||r||console.warn(`[energy-custom-graph-card] Series at index ${t} is missing both statistic_id and calculation. The series will be skipped until configured.`),r){let i=e.calculation?.terms??[];i.length||console.warn(`[energy-custom-graph-card] Calculation for series ${t} has no terms. The series will be skipped.`),i.forEach((e,i)=>{void 0===e.statistic_id&&void 0===e.constant&&console.warn(`[energy-custom-graph-card] Calculation term ${i} of series ${t} is missing both statistic_id and constant. This term will be ignored.`)})}});let t=this._config;t!==e&&this._headerMetricWarnings.clear(),this._config={...e,timespan:e.timespan??ee,allow_compare:e.allow_compare??!0},t?.aggregation?.compute_current_hour&&!this._config.aggregation?.compute_current_hour&&(this._liveStatistics=void 0,this._liveStatisticsCompare=void 0,this._liveHourTimeout&&(clearTimeout(this._liveHourTimeout),this._liveHourTimeout=void 0)),this._loggedEnergyFallback=!1,this.requestUpdate("_config",t),this.hass&&this._syncWithConfig(t)}updated(e){super.updated(e),this._evaluateSectionLayout(),(e.has("_statistics")||e.has("_metadata")||e.has("_periodStart")||e.has("_periodEnd")||e.has("_statisticsCompare")||e.has("_metadataCompare")||e.has("_comparePeriodStart")||e.has("_comparePeriodEnd")||e.has("_config")||e.has("_forecastSeriesData")||e.has("_forecastSeriesDataCompare")||e.has("hass")&&this._headerMetricUsesEntityState())&&this._generateChart();let t=e.get("_config"),i=this._hasForecastSeries();!this._hasForecastSeries(t)&&i?this._refreshForecastData():i&&0===this._forecastSeriesData.size&&(e.has("_periodStart")||e.has("_periodEnd")||e.has("_statistics")||e.has("_config"))&&this._refreshForecastData()}firstUpdated(e){super.firstUpdated(e),this._evaluateSectionLayout()}getCardSize(){return 5}getGridOptions(){let e=!!(this._config?.title&&this._config.title.trim().length),t=+!!((!this._config||!0!==this._config.hide_legend)&&this._config?.expand_legend);return{columns:12,min_columns:6,rows:(e?5:4)+t,min_rows:(e?4:3)+t}}_evaluateSectionLayout(){if(this.isConnected)try{let e=this.layout,t="grid"===e;this._usesSectionLayout!==t&&(this._usesSectionLayout=t)}catch(e){}}render(){if(!this.hass||!this._config)return d.nothing;let e=this._config.title?.trim(),t=this._headerChip,i=!!e||!!t;return(0,d.html)`
      <ha-card>
        ${i?(0,d.html)`
              <div class="card-header">
                <h1 class="card-title">${e??""}</h1>
                ${t?(0,d.html)`
                      <div class="header-chip" title=${t.tooltip}>
                        ${t.text}
                      </div>
                    `:d.nothing}
              </div>
            `:d.nothing}
        <div class=${g({content:!0,"content--no-title":!i})}>
          ${this._renderChart()}
        </div>
      </ha-card>
    `}_renderChart(){if(this._isLoading)return(0,d.html)`<div class="placeholder">
        ${this.hass.localize?.("ui.components.statistics_charts.loading_statistics")??"Loading statistics…"}
      </div>`;let e="disabled"===this._statisticsPeriod?this._disabledMessage??this._getDisabledMessage():this._disabledMessage;if(e)return(0,d.html)`<div class="placeholder">
        ${e}
      </div>`;if(!this._chartData.some(e=>!!Array.isArray(e.data)&&e.data.some(e=>null!=e&&(Array.isArray(e)?null!==e[1]&&void 0!==e[1]:!!("object"==typeof e&&Array.isArray(e.value))&&null!==e.value[1]&&void 0!==e.value[1])))||!this._chartOptions)return(0,d.html)`<div class="placeholder">
        ${this.hass.localize?.("ui.components.statistics_charts.no_statistics_found")??"No statistics available for the selected period"}
      </div>`;let t=this._usesSectionLayout,i=t?"100%":this._config?.chart_height??"300px";return(0,d.html)`
      <div class=${t?"chart chart--section":"chart"}>
        <ha-chart-base
          .hass=${this.hass}
          .data=${this._chartData}
          .options=${this._chartOptions}
          .height=${i}
          .expandLegend=${this._config?.expand_legend}
        ></ha-chart-base>
      </div>
    `}_generateChart(){if(!this._config||!this._periodStart||!this._statistics||!this._statisticsRange){this._chartData=[],this._chartOptions=void 0,this._headerChip=void 0,this._unitsBySeries=new Map,this._indicatorColorBySeries=new Map,this._seriesConfigById=new Map;return}let e=this._periodStart.getTime(),t=this._periodEnd?.getTime()??null,i=this._statisticsRange.start,r=this._statisticsRange.end??null;if(i!==e||r!==t)return;let s=this.isConnected?getComputedStyle(this):getComputedStyle(document.documentElement),a=this._buildMainSeriesInputs(),{series:o,legend:n,unitBySeries:l,seriesById:d,indicatorColorBySeries:c,resolvedSeriesById:h}=(0,J.buildSeries)({hass:this.hass,statistics:a.statistics,metadata:a.metadata,configSeries:a.configSeries,colorPalette:this._config.color_cycle??[],computedStyle:s,calculatedData:a.calculatedData,calculatedUnits:a.calculatedUnits,forecastData:this._forecastSeriesData,forecastUnits:this._forecastSeriesUnits,skipForecastSeries:"year"===this._statisticsPeriod}),u=new Map(d),p=new Map;l.forEach((e,t)=>p.set(t,e));let _=new Map;c.forEach((e,t)=>_.set(t,e));let m=new Map,g=new Map,f=new Map,v=new Map,y=[],S=new Map,b=0,x=e=>{let t=e?.trim();if(t){let e=f.get(t);return e||(f.set(t,t),t)}return b+=1,`series-${b}`},$=(e,t)=>{let i=Math.max(t-3,0),r=v.get(e);if(r)return r.stack=`${e}--current`,r.z=i,r;y.push(e);let s={id:`${e}--compare-placeholder`,type:"bar",stack:`${e}--current`,data:[],silent:!0,tooltip:{show:!1},itemStyle:{color:"transparent",borderColor:"transparent",borderWidth:0},emphasis:{disabled:!0},barMaxWidth:J.BAR_MAX_WIDTH,z:i};return v.set(e,s),s};o.forEach((e,t)=>{if("bar"!==e.type)return;let i=e.id??`bar_${t}`,r=x("string"==typeof e.stack&&""!==e.stack.trim()?e.stack:void 0);g.set(i,r);let s="number"==typeof e.z&&Number.isFinite(e.z)?Math.max(e.z,10):10,a=S.has(r)?Math.max(S.get(r),s):s;e.z=a,e.stack=`${r}--current`,S.set(r,a),$(r,a)});let w=[];if(this._comparePeriodStart&&this._statisticsCompare&&this._metadataCompare&&this._statisticsRangeCompare&&this._statisticsRangeCompare.start===this._comparePeriodStart.getTime()&&(this._statisticsRangeCompare.end??null)===(this._comparePeriodEnd?.getTime()??null)){let e=(0,J.buildSeries)({hass:this.hass,statistics:this._statisticsCompare,metadata:this._metadataCompare,configSeries:a.configSeries,colorPalette:this._config.color_cycle??[],computedStyle:s,calculatedData:this._calculatedSeriesDataCompare,calculatedUnits:this._calculatedSeriesUnitsCompare,forecastData:this._forecastSeriesDataCompare,forecastUnits:this._forecastSeriesUnitsCompare,skipForecastSeries:"year"===this._statisticsPeriodCompare}),t=this._createCompareTransform(),i=e=>{let i=e=>t?t(e):e;if(Array.isArray(e)){let t=Number(e[0]);return[i(t),...e.slice(1),t]}if(e&&"object"==typeof e&&"value"in e){let t=Array.isArray(e.value)?e.value:void 0;if(!t)return e;let r=Number(t[0]),s=i(r),a=[...t];return a[0]=s,a.push(r),{...e,value:a}}return e},r=[];e.series.forEach((t,a)=>{let o=t.id??t.name??`compare_${a}`,l=`${o}--compare`,d={...t,id:l,name:`${t.name??o} (Compare)`,z:t.z},c=e.seriesById.get(o);if(!c&&o.includes("__fill_")){let t=o.replace(/__fill_(base|area)$/u,"");c=e.seriesById.get(t)}let h=c?.compare_color?.trim(),f=h&&""!==h?this._resolveColorToken(h,s):void 0;if(Array.isArray(d.data)?d.data=d.data.map(i):d.data&&(d.data=d.data?.map(i)),"bar"===d.type){let e=g.get(o);e||(e=x("string"==typeof t.stack&&""!==t.stack.trim()?t.stack:void 0),g.set(o,e),S.set(e,10),$(e,10));let i="number"==typeof t.z&&Number.isFinite(t.z)?Math.max(t.z,10):10,s=S.get(e),a=s?Math.max(s,i):i;S.set(e,a),$(e,a);let n=v.get(e);n&&(n.stack=`${e}--compare`,n.z=Math.max(a-3,0)),d.stack=`${e}--compare`,d.z=Math.max(a,10),this._styleCompareSeries(d,f),r.push(d)}else t.stack&&""!==t.stack.trim()?d.stack=`${t.stack.trim()}--compare`:d.stack=`${l}--stack`,this._styleCompareSeries(d,f),r.push(d);p.set(l,e.unitBySeries.get(o));let y=f??e.indicatorColorBySeries.get(o);y&&_.set(l,y),c&&u.set(l,c);let b=n.find(e=>e.id===(t.id??o))?.id;if(b){let e=m.get(b)??[];e.push(l),m.set(b,e)}}),w=r}let C=[...y.map(e=>v.get(e)).filter(e=>void 0!==e),...w,...o];this._seriesConfigById=new Map(u),this._headerChip=this._evaluateHeaderChip(h);let T=this._periodEnd?.getTime()??this._statisticsRange.end??null,E=this._buildBucketSequence(e,T,this._statisticsPeriod);E?.length&&this._normalizeLineSeries(C,E);let M="raw"===this._statisticsPeriod,A="raw"===this._statisticsPeriodCompare;this._extendLineSeriesToNow(C,u,T,M,A);let k=s.getPropertyValue("--primary-text-color").trim()||"#000";if(this._applyBarStyling(C,E,k),!C.length){this._chartData=[],this._chartOptions=void 0,this._unitsBySeries=new Map,this._indicatorColorBySeries=new Map;return}let{yAxis:H,axisUnitByIndex:D}=this._buildYAxisOptions(u,C);this._unitsBySeries=new Map,this._indicatorColorBySeries=new Map(_),C.forEach(e=>{let t=e.yAxisIndex??0,i=D.get(t)??(this._config?.show_unit===!1?void 0:p.get(e.id??""));this._unitsBySeries.set(e.id??"",i)});let N=this._buildLegendOption(n,m),I=this._computeXAxisMax(this._periodStart,this._periodEnd,this._statisticsPeriod,E,this._statisticsRange.end),P=[{id:"primary",type:"time",min:this._periodStart,max:I,...this._buildAggregationXAxisOptions(this._statisticsPeriod)},{id:"secondary",type:"time",show:!1}],R=this._config?.show_tooltip!==!1,F=this._config?.show_x_axis_pointer!==!1,O=this._config?.show_y_axis_pointer===!0,U=F||O,L=R&&!U,z={xAxis:P,yAxis:H,grid:{top:15,left:1,right:1,bottom:0,containLabel:!0}};R||U?z.tooltip={show:!0,trigger:"axis",showContent:R,appendTo:document.body,formatter:R?e=>this._renderTooltip(e):void 0,axisPointer:{type:F&&O?"cross":F||O?"line":"none",axis:F&&O?"auto":F?"x":O?"y":"x"}}:z.tooltip={show:!1,trigger:"none"};let B=P[0].axisPointer??{},j=B.label??{},W=F?"line":L?"none":"line";P[0]={...P[0],axisPointer:{...B,show:F||L,type:W,...L?{label:{...j,show:!1}}:{}}},H.forEach((e,t)=>{let i=e.axisPointer??{};H[t]={...e,axisPointer:{...i,show:O,type:"line"}}}),N&&(z.legend=N);let G=Array.isArray(this._chartData)&&this._chartData.length>0,V=!this._lastRenderedRange||this._lastRenderedRange.start!==e||(this._lastRenderedRange.end??null)!==(this._periodEnd?.getTime()??null);V&&G&&(G=!1,this._chartData=[]);let K=V||!G&&(M||A);if(z.animation=K,this._chartOptions=z,K){let i=this._createZeroSeriesSnapshot(C);this._chartData=i,this._scheduleRawAnimationCommit(C,{start:e,end:t});return}void 0!==this._rawAnimationFrame&&(cancelAnimationFrame(this._rawAnimationFrame),this._rawAnimationFrame=void 0),this._chartData=C,this._lastRenderedRange={start:e,end:t}}_buildAggregationXAxisOptions(e){return"month"===e?{minInterval:24192e5,axisLabel:{formatter:e=>this._formatXAxisMonthLabel(e)}}:"year"===e?{minInterval:31536e6,axisLabel:{formatter:e=>this._formatXAxisYearLabel(e)}}:{}}_computeXAxisMax(e,t,i,r,s){if(("month"===i||"year"===i)&&r&&r.length>1){let t=r[r.length-1];if(t>e.getTime())return t}return t?this._computeSuggestedXAxisMax(e,t):s??e.getTime()}_computeSuggestedXAxisMax(e,t){let i=H(t,e),r=new Date(t);return i>2&&0===r.getHours()&&(r=Y(r,1)),i>2&&r.setMinutes(0,0,0),i>35&&r.setDate(1),i>2&&r.setHours(0),r.getTime()}_normalizeLineSeries(e,t){if(!t.length)return;let i=e=>{if(!e)return!1;let t=this._seriesConfigById.get(e);if(t)return this._seriesUsesForecast(t);if(e.endsWith("--compare")){let t=e.replace(/--compare$/,""),i=this._seriesConfigById.get(t);return!!i&&this._seriesUsesForecast(i)}return!1};e.forEach((e,r)=>{if("line"!==e.type||!Array.isArray(e.data)||i("string"==typeof e.id?e.id:void 0))return;let s=new Map;e.data.forEach(e=>{if(Array.isArray(e)){let t=Number(e[0]);if(!Number.isFinite(t))return;let i=e.length>1&&"number"==typeof e[1]?e[1]:(e[1],null);s.set(t,i);return}if(e&&"object"==typeof e){let t=Array.isArray(e.value)?e.value:void 0;if(!t)return;let i=Number(t[0]);if(!Number.isFinite(i))return;let r=t.length>1&&"number"==typeof t[1]?t[1]:(t[1],null);s.set(i,r)}}),e.data=t.map(e=>{let t=s.has(e)?s.get(e):null;return[e,t??null]})})}_extendLineSeriesToNow(e,t,i,r,s){let a=Date.now();e.forEach(e=>{if("line"!==e.type||!Array.isArray(e.data)||!e.data.length)return;let o="string"==typeof e.id?e.id:void 0,n=o?t.get(o):void 0,l=n?.chart_type??this._inferChartTypeFromSeriesId(o),d=!!o&&o.endsWith("--compare"),c=this._castSeriesDataPoints(e.data);if(!c)return;if("step"===l){let e=d?this._comparePeriodEnd?.getTime()??this._statisticsRangeCompare?.end??i:i,t=Math.min("number"==typeof e?e:a,a);this._extendStepSeriesToLimit(c,t);return}let h=d?this._statisticsRangeCompare?.end??i:i;("line"===l||void 0===l)&&null!==h&&!(h<=a)&&(d&&s||!d&&r)&&this._extendRawLineSeriesToNow(c,a)})}_extendRawLineSeriesToNow(e,t){let i=-1,r=null;for(let s=e.length-1;s>=0;s--){let[a,o]=e[s];if(!(a>t)&&"number"==typeof o&&Number.isFinite(o)){i=s,r=o;break}}if(-1!==i&&null!==r){for(let s=i+1;s<e.length;s++){let i=e[s];if(i[0]>t)break;null===i[1]&&(i[1]=r)}if(!e.some(e=>1e3>=Math.abs(e[0]-t))){let i=e.findIndex(e=>e[0]>t),s=[t,r];-1===i?e.push(s):e.splice(i,0,s)}}}_extendStepSeriesToLimit(e,t){if(!Number.isFinite(t)||!e.length)return;let i=-1;for(let r=e.length-1;r>=0;r--){let[s,a]=e[r];if(!(s>t)&&"number"==typeof a&&Number.isFinite(a)){i=r;break}}if(-1===i)return;let r=e[i][0],s=e[i][1];if(t<=r||"number"!=typeof s||!Number.isFinite(s))return;for(let r=i+1;r<e.length;r++){let i=e[r];if(i[0]>t)break;null===i[1]&&(i[1]=s)}let a=e.findIndex(([e])=>e>=t);-1===a?e.push([t,s]):e[a][0]===t?null===e[a][1]&&(e[a][1]=s):e.splice(a,0,[t,s])}_scheduleRawAnimationCommit(e,t){void 0!==this._rawAnimationFrame&&cancelAnimationFrame(this._rawAnimationFrame),this._rawAnimationFrame=requestAnimationFrame(()=>{this._rawAnimationFrame=void 0,this._chartData=e,t&&(this._lastRenderedRange=t)})}_createZeroSeriesSnapshot(e){let t=this._cloneSeries(e);return t.forEach(e=>{if(Array.isArray(e.data)){if("line"===e.type){e.data=e.data.map(([e,t])=>[e,null===t?null:0]);return}"bar"===e.type&&(e.data=e.data.map(e=>{if(Array.isArray(e))return[e[0],null===(e.length>1&&"number"==typeof e[1]?e[1]:(e[1],null))?null:0];if(e&&"object"==typeof e&&"value"in e){let t={...e},i=Array.isArray(t.value)?t.value:void 0;if(i){let[e,r]=i;t.value=[e,null===r?null:0]}return t}return e}))}}),t}_cloneSeries(e){return"function"==typeof structuredClone?structuredClone(e):JSON.parse(JSON.stringify(e))}_computeMaxEnd(e){let t;if(e)return Object.values(e).forEach(e=>{e?.forEach(e=>{let i=e.end??e.start;"number"==typeof i&&(t=void 0===t?i:Math.max(t,i))})}),t}_mergeStatistics(e,t){if(!e)return t;let i={...e};return Object.entries(t).forEach(([e,t])=>{let r=i[e];if(!r||!r.length){i[e]=t;return}let s=new Map,a=[...r];a.forEach((e,t)=>{let i=e.end??e.start??t;s.set(i,t)}),t.forEach(e=>{let t=e.end??e.start??Math.random(),i=s.get(t);void 0!==i?a[i]=e:(a.push(e),s.set(t,a.length-1))}),a.sort((e,t)=>(e.end??e.start??0)-(t.end??t.start??0)),i[e]=a}),i}_trimStatisticsToRange(e,t,i){let r={};return Object.entries(e).forEach(([e,s])=>{let a,o;if(!s||!s.length){r[e]=[];return}let n=[];s.forEach(e=>{let r=e.start??e.end,s=e.end??e.start;if(void 0!==r&&void 0!==s){if(null!==i&&r>i){o||(o=e);return}if(s<t){a=e;return}n.push(e)}}),a&&n.unshift(a),o&&n.push(o),r[e]=n}),r}_castSeriesDataPoints(e){if(!Array.isArray(e))return null;for(let t of e)if(!Array.isArray(t)||t.length<2||"number"!=typeof t[0])return null;return e}_inferChartTypeFromSeriesId(e){if(!e)return;let t=(e.endsWith("--compare")?e.slice(0,-9):e).split(":");if(t.length>=3){let e=t[2];if("bar"===e||"line"===e||"step"===e)return e}}_createCompareTransform(){if(!this._periodStart||!this._comparePeriodStart)return;let e=this._periodStart,t=this._comparePeriodStart,i=O(e,t);if(0!==i&&e.getTime()===V(e).getTime())return e=>E(new Date(e),i).getTime();let r=F(e,t);if(0!==r&&e.getTime()===W(e).getTime())return e=>C(new Date(e),r).getTime();let s=H(e,t);if(0!==s&&e.getTime()===A(e).getTime())return e=>b(new Date(e),s).getTime();let a=e.getTime()-t.getTime();return e=>e+a}_applyBarStyling(e,t,i="#000"){let r=e.filter(e=>"bar"===e.type);if(!r.length)return;let s=new Set,a=new Set;t?.forEach(e=>a.add(e)),r.forEach(e=>{Array.isArray(e.data)&&(e.data=e.data.map(e=>{if(Array.isArray(e)){let t=Number(e[0]);return a.add(t),{value:[t,e[1]]}}if(e&&"object"==typeof e&&"value"in e){let t=Array.isArray(e.value)?e.value:void 0;if(t){let i=Number(t[0]);return a.add(i),{...e,value:[i,t[1]]}}return{...e}}let t=Number(e);return a.add(t),{value:[t,0]}}))});let o=Array.from(a).sort((e,t)=>e-t);r.forEach(e=>{let t={...e.itemStyle??{}},i=new Map;e.data?.forEach(e=>{let r=Array.isArray(e?.value)?e.value:void 0;if(!r)return;let s=Number(r[0]);i.set(s,{...e,value:[s,r[1]],__energyCustomGraphRealValue:!0,itemStyle:{...t,...e.itemStyle??{}}})}),e.data=o.map(e=>{let r=i.get(e);return r||{value:[e,0],itemStyle:{...t,borderWidth:0,borderRadius:[0,0,0,0]}}}),e.itemStyle={...t},e.barMaxWidth=e.barMaxWidth??J.BAR_MAX_WIDTH}),o.forEach((e,t)=>{let a=new Set,o=new Set;for(let e=r.length-1;e>=0;e--){let n=r[e],l=n.data[t],d=Array.isArray(l?.value)?l.value:void 0,c=d?Number(d[1]??0):0,h=n.stack??`__stack_${e}`,u={...n.itemStyle??{},...l?.itemStyle??{}};if(d){if(Array.isArray(u.borderRadius)||(u.borderRadius=[0,0,0,0]),!c){u.borderWidth=0,u.borderRadius=[0,0,0,0],l.itemStyle=u;continue}c>0?a.has(h)?u.borderRadius=[0,0,0,0]:(u.borderRadius=[4,4,0,0],a.add(h)):c<0&&(o.has(h)?u.borderRadius=[0,0,0,0]:(u.borderRadius=[0,0,4,4],o.add(h))),this._applyBarValueLabel(n,l,d,s,i),l.itemStyle=u,n.data[t]=l}}})}_applyBarValueLabel(e,t,i,r,s){let a="string"==typeof e.id?e.id:void 0;if(!a||!t.__energyCustomGraphRealValue)return;let o=this._seriesConfigById.get(a);if(o?.show_value_labels!==!0)return;if("string"==typeof o.stack&&""!==o.stack.trim()){let t=a.replace(/--compare$/,"");r.has(t)||(console.warn(`[energy-custom-graph-card] Value labels are ignored for stacked bar series "${e.name??a}".`),r.add(t));return}let n=Number(i[1]);if(!Number.isFinite(n)||0===n){t.label={show:!1};return}let l="number"==typeof o.value_label_precision&&Number.isFinite(o.value_label_precision)?Math.max(0,Math.min(20,Math.trunc(o.value_label_precision))):0;t.label={show:!0,position:n>0?"top":"bottom",formatter:this._formatNumber(n,{minimumFractionDigits:l,maximumFractionDigits:l}),color:s,fontSize:11,distance:4},e.labelLayout={...e.labelLayout??{},hideOverlap:!0}}_styleCompareSeries(e,t){if(t&&""!==t.trim()){let i=t.trim();if("bar"===e.type){let t="object"==typeof e.itemStyle?e.itemStyle.color:void 0,r=ea._colorWithAlpha(i,ea._extractAlpha(t))??i,s={...e.itemStyle??{},color:r,borderColor:r};e.itemStyle=s,e.color=r;let a={...e.emphasis?.itemStyle??{},color:r};e.emphasis={...e.emphasis??{},itemStyle:a}}else{let t="object"==typeof e.lineStyle?e.lineStyle.color:void 0,r=ea._colorWithAlpha(i,ea._extractAlpha(t))??i;e.color=r,e.lineStyle={...e.lineStyle??{},color:r};let s="object"==typeof e.itemStyle?e.itemStyle.color:void 0,a=ea._colorWithAlpha(i,ea._extractAlpha(s))??i;e.itemStyle={...e.itemStyle??{},color:a};let o={...e.emphasis?.itemStyle??{},color:r};if(e.emphasis={...e.emphasis??{},itemStyle:o},e.areaStyle){let t={...e.areaStyle},r=t.color;t.color=ea._gradientWithColor(i,r)??ea._colorWithAlpha(i,ea._extractAlpha(r))??i,e.areaStyle=t}e.connectNulls=!1}}else if("bar"===e.type){let t={...e.itemStyle??{},opacity:.6};e.itemStyle=t;let i={...e.emphasis?.itemStyle??{},opacity:.8};e.emphasis={...e.emphasis??{},itemStyle:i}}else{if(e.lineStyle={...e.lineStyle??{},opacity:.6},e.itemStyle={...e.itemStyle??{},opacity:.6},e.areaStyle){let t=e.areaStyle.opacity??.3;e.areaStyle={...e.areaStyle??{},opacity:.6*t}}e.connectNulls=!1}let i=(e.z??0)-1;e.z=i<0?0:i}_resolveColorToken(e,t){if(!e)return;let i=e.trim();if(!i)return;if(i.startsWith("#")||i.startsWith("rgb"))return i;if(i.startsWith("var(")&&i.endsWith(")")&&(i=i.slice(4,-1).trim()),i.startsWith("--")){let e=t.getPropertyValue(i)?.trim();return e||i}let r=t.getPropertyValue(i)?.trim();return r||i}static _extractAlpha(e){if("string"!=typeof e)return;let t=e.trim(),i=t.match(/rgba?\(([^)]+)\)/i);if(i){let e=i[1].split(",").map(e=>e.trim());if(4===e.length){let t=Number(e[3]);return Number.isFinite(t)?t:void 0}if(3===e.length)return 1}if(t.startsWith("#")){let e=t.slice(1);if(8===e.length)return parseInt(e.slice(6,8),16)/255;if(4===e.length)return parseInt(e.slice(3,4).repeat(2),16)/255}}static _colorWithAlpha(e,t){if(void 0===t||t>=1)return e;let i=ea._parseColor(e);return i?`rgba(${i.r}, ${i.g}, ${i.b}, ${t})`:e}static _gradientWithColor(e,t){if(!(!t||"object"!=typeof t||Array.isArray(t))&&"linear"===t.type&&Array.isArray(t.colorStops))return{...t,colorStops:t.colorStops.map(t=>!t||"object"!=typeof t||Array.isArray(t)?t:{...t,color:ea._colorWithAlpha(e,ea._extractAlpha(t.color))??e})}}static _parseColor(e){let t=e.trim(),i=t.match(/rgba?\(([^)]+)\)/i);if(i){let e=i[1].split(",").map(e=>Number(e.trim()));return e.length>=3?{r:Math.round(e[0]),g:Math.round(e[1]),b:Math.round(e[2])}:void 0}if(!t.startsWith("#"))return;let r=t.slice(1);if(3===r.length||4===r.length){let e=parseInt(r[0]+r[0],16);return{r:e,g:parseInt(r[1]+r[1],16),b:parseInt(r[2]+r[2],16)}}if(6===r.length||8===r.length){let e=parseInt(r.substring(0,2),16);return{r:e,g:parseInt(r.substring(2,4),16),b:parseInt(r.substring(4,6),16)}}}_buildBucketSequence(e,t,i){if(null===t||void 0===i||"raw"===i||"disabled"===i)return;if(t<e)return[e];let r=[],s=this._alignBucketStart(e,i),a=new Date(t),o=0;for(;s.getTime()<=a.getTime()&&o<2e5;){r.push(s.getTime());let e=this._advanceBucket(s,i);if(e.getTime()===s.getTime())break;s=e,o++}return r}_advanceBucket(e,t){switch(t){case"5minute":return w(e,5);case"hour":default:return $(e,1);case"day":return b(e,1);case"week":return T(e,1);case"month":return C(e,1);case"year":return E(e,1)}}_alignBucketStart(e,t){let i=new Date(e);switch(t){case"5minute":{let e=5*Math.floor(i.getMinutes()/5);return i.setSeconds(0,0),i.setMinutes(e),i}case"hour":default:return i.setMinutes(0,0,0),i;case"day":return A(i);case"week":return G(i,ei);case"month":return W(i);case"year":return V(i)}}_buildLegendOption(e,t){if(!e.length)return;let i=this._config?.legend_sort??"none",r=[...e];("asc"===i||"desc"===i)&&r.sort((e,t)=>{let r=e.name.localeCompare(t.name);return"asc"===i?r:-r});let s=r.map(e=>({id:e.id,name:e.name,secondaryIds:t.get(e.id)??[],itemStyle:e.indicatorColor||e.color||e.fillColor||e.borderColor?{color:e.indicatorColor??e.color??e.fillColor,borderColor:e.borderColor??e.indicatorColor??e.color,borderWidth:e.borderWidth??(e.borderColor?2:1)}:void 0})),a={};return r.forEach(e=>{let i=!e.hidden;a[e.id]=i;let r=t.get(e.id);r?.forEach(e=>{a[e]=i})}),{type:"custom",show:!this._config?.hide_legend,data:s,selected:a}}_buildYAxisOptions(e,t){let i=this._config?.y_axes??[],r=i.find(e=>"left"===e.id),s=i.find(e=>"right"===e.id),a=!!s||Array.from(e.values()).some(e=>"right"===e.y_axis),o=new Map,n=[],l=(e,i)=>{let r=e?.fit_y_data??!1,s=e?.center_zero??!1,a=e?.logarithmic_scale??!1;o.set(i,e?.unit);let n=e?.min,l=e?.max;if(s)if(void 0!==l)n=-l;else{let e=(e=>{let i=t.filter(t=>(t.yAxisIndex??0)===e);if(!i.length)return;let r=e=>{if(Array.isArray(e))return e[1];if("number"==typeof e)return e;if(e&&"object"==typeof e&&"value"in e){let t=e.value;if(Array.isArray(t))return t[1];if("number"==typeof t)return t}return null},s=new Map,a=[];i.forEach(e=>{let t=e.stack;t?(s.has(t)||s.set(t,[]),s.get(t).push(e)):a.push(e)});let o=1/0,n=-1/0;if(a.forEach(e=>{Array.isArray(e.data)&&e.data.forEach(e=>{let t=r(e);"number"==typeof t&&!Number.isNaN(t)&&Number.isFinite(t)&&(o=Math.min(o,t),n=Math.max(n,t))})}),s.forEach(e=>{let t=new Map;e.forEach(e=>{Array.isArray(e.data)&&e.data.forEach(e=>{let i=(e=>{if(Array.isArray(e))return e[0];if(e&&"object"==typeof e&&"value"in e){let t=e.value;if(Array.isArray(t))return t[0]}return null})(e),s=r(e);if(null!==i&&"number"==typeof s&&!Number.isNaN(s)&&Number.isFinite(s)){let e=t.get(i)??{positive:0,negative:0};s>=0?e.positive+=s:e.negative+=s,t.set(i,e)}})}),t.forEach(({positive:e,negative:t})=>{o=Math.min(o,t),n=Math.max(n,e)})}),Number.isFinite(o)&&Number.isFinite(n))return{min:o,max:n}})(i);if(e){let t=(e=>{if(0===e)return 1;let t=Math.pow(10,Math.floor(Math.log10(Math.abs(e)))),i=Math.abs(e)/t;return([1,1.2,1.5,2,2.5,3,4,5,6,8,10].find(e=>e>=i)??10)*t})(Math.max(Math.abs(e.min),Math.abs(e.max)));n=-t,l=t}}return{type:a?"log":"value",name:e?.unit,nameGap:2*!!e?.unit,nameTextStyle:{align:"left"},position:0===i?"left":"right",min:n,max:l,splitLine:{show:!0},axisLabel:{formatter:e=>this._formatNumber(e)},scale:r}};return n.push(l(r,0)),a&&n.push(l(s,1)),{yAxis:n,axisUnitByIndex:o}}_evaluateHeaderChip(e){let t=this._config?.header?.chip;if(!t?.metric)return;let i=this._evaluateHeaderMetric(t.metric,e);if(!i||!Number.isFinite(i.value))return;let r=this._resolveHeaderChipPrecision(t),s=this._resolveHeaderChipUnit(t,i.unit),a=this._formatNumber(i.value,{maximumFractionDigits:r}),o=s?`${a} ${s}`:a,n=t.label?.trim(),l=n?`${n} ${o}`:o;return{text:l,tooltip:l}}_headerMetricUsesEntityState(e=this._config?.header?.chip?.metric){return!!e&&("calculation"in e?(e.calculation.terms??[]).some(e=>"entity_state"===e.source):"entity_state"===e.source)}_evaluateHeaderMetric(e,t){if("calculation"in e){let i=this._evaluateHeaderCalculation(e.calculation,t);if(!i)return;return this._applyHeaderMetricTransform(i,e)}return this._evaluateHeaderMetricInput(e,t)}_evaluateHeaderCalculation(e,t){let i=e.terms??[];if(!i.length)return void this._warnHeaderMetric("calculation-empty","Header chip calculation has no terms.");let r=e.initial_value??0;for(let[e,s]of i.entries()){let i=this._evaluateHeaderCalculationTerm(s,t,e);if(!i||!Number.isFinite(i.value))return;let a=i.value;switch(s.operation??"add"){case"subtract":r-=a;break;case"multiply":r*=a;break;case"divide":if(0===a)return void this._warnHeaderMetric(`calculation-division-zero-${e}`,"Header chip calculation encountered division by zero.");r/=a;break;default:r+=a}}if(Number.isFinite(r))return{value:r}}_evaluateHeaderCalculationTerm(e,t,i){if("constant"===e.source){let t="number"==typeof e.constant&&Number.isFinite(e.constant)?e.constant:0;return this._applyHeaderMetricTransform({value:t},e)}let r=this._evaluateHeaderMetricInput(e,t,`term-${i}`);if(r)return r}_evaluateHeaderMetricInput(e,t,i="metric"){switch(e.source){case"series":return this._evaluateHeaderSeriesMetric(e,t,i);case"stack":return this._evaluateHeaderStackMetric(e,t,i);case"entity_state":return this._evaluateHeaderEntityStateMetric(e,i);default:return}}_evaluateHeaderSeriesMetric(e,t,i){let r=e.series_id?.trim();if(!r)return void this._warnHeaderMetric(`${i}-series-id-missing`,"Header chip series metric is missing a series_id.");let s=t.get(r);if(!s)return void this._warnHeaderMetric(`${i}-series-missing-${r}`,`Header chip references unknown series "${r}".`);let a=e.reducer??"sum";this._warnIfRawHeaderSum(`${i}-series-${r}`,a);let o=this._reduceHeaderValues(this._headerValuesFromSeries(s.data),a);if(void 0!==o)return this._applyHeaderMetricTransform({value:o,unit:s.unit},e)}_evaluateHeaderStackMetric(e,t,i){let r=e.stack?.trim();if(!r)return void this._warnHeaderMetric(`${i}-stack-missing`,"Header chip stack metric is missing a stack name.");let s=e.reducer??"sum",a=e.sign??"signed",o=[],n=new Set,l=0;if(t.forEach(e=>{e.config.stack?.trim()===r&&(l+=1,e.unit&&e.unit.trim()&&n.add(e.unit.trim()),o.push(...this._headerValuesFromSeries(e.data,a)))}),!l)return void this._warnHeaderMetric(`${i}-stack-unknown-${r}`,`Header chip references unknown stack "${r}".`);this._warnIfRawHeaderSum(`${i}-stack-${r}`,s);let d=this._reduceHeaderValues(o,s);if(void 0===d)return;let c=1===n.size?Array.from(n)[0]:void 0;return this._applyHeaderMetricTransform({value:d,unit:c},e)}_evaluateHeaderEntityStateMetric(e,t){let i=e.entity_id?.trim();if(!i)return void this._warnHeaderMetric(`${t}-entity-missing`,"Header chip entity-state metric is missing an entity_id.");let r=this.hass?.states?.[i];if(!r)return void this._warnHeaderMetric(`${t}-entity-unknown-${i}`,`Header chip references unknown entity "${i}".`);if("unknown"===r.state||"unavailable"===r.state||""===r.state)return;let s=Number(r.state);return Number.isFinite(s)?this._applyHeaderMetricTransform({value:s,unit:r.attributes?.unit_of_measurement},e):void this._warnHeaderMetric(`${t}-entity-nonnumeric-${i}`,`Header chip entity "${i}" has a non-numeric state.`)}_headerValuesFromSeries(e,t="signed"){let i=[];return e.forEach(([,e])=>{if("number"==typeof e&&Number.isFinite(e))switch(t){case"positive":e>0&&i.push(e);break;case"negative":e<0&&i.push(e);break;case"absolute":i.push(Math.abs(e));break;default:i.push(e)}}),i}_reduceHeaderValues(e,t){let i=e.filter(e=>"number"==typeof e&&Number.isFinite(e));if(i.length)switch(t){case"mean":return i.reduce((e,t)=>e+t,0)/i.length;case"min":return Math.min(...i);case"max":return Math.max(...i);case"first":return i[0];case"last":return i[i.length-1];default:return i.reduce((e,t)=>e+t,0)}}_applyHeaderMetricTransform(e,t){let i=e.value*(t.multiply??1)+(t.add??0),r=ea.clampValue(i,t.clip_min,t.clip_max);if(Number.isFinite(r))return{...e,value:r}}_resolveHeaderChipPrecision(e){return Math.max(0,Math.min(20,Math.trunc("number"==typeof e.precision&&Number.isFinite(e.precision)?e.precision:this._config?.tooltip_precision??2)))}_resolveHeaderChipUnit(e,t){return Object.prototype.hasOwnProperty.call(e,"unit")?"string"==typeof e.unit&&e.unit.trim().length?e.unit.trim():void 0:this._config?.show_unit!==!1&&"string"==typeof t&&t.trim().length?t.trim():void 0}_warnIfRawHeaderSum(e,t){"raw"===this._statisticsPeriod&&"sum"===t&&this._warnHeaderMetric(`raw-sum-${e}`,"Header chip uses reducer sum with RAW history. Sample values will be added, which is usually not suitable for energy totals.")}_warnHeaderMetric(e,t,i){this._headerMetricWarnings.has(e)||(this._headerMetricWarnings.add(e),this._log("warn",t,i))}_renderTooltip(e){let t,i;if(!Array.isArray(e)||!e.length)return null;let r=this._config?.tooltip_precision??2,s=this._config?.show_stack_sums===!0,a=e=>{let t=e.value??e.data??e?.value?.value;if(Array.isArray(t)){let e=Number(t[0]),i=t.length>1&&"number"==typeof t[1]?t[1]:null,r=t.length>2&&"number"==typeof t[t.length-1]?t[t.length-1]:void 0;return{display:e,value:i,original:void 0!==r&&r!==e?r:void 0}}if("number"==typeof t)return{display:Number(e.axisValue??e.axisValueLabel??0),value:t};if(t&&Array.isArray(t.value)){let e=t.value,i=Number(e[0]),r=e.length>1&&"number"==typeof e[1]?e[1]:null,s=e.length>2&&"number"==typeof e[e.length-1]?e[e.length-1]:void 0;return{display:i,value:r,original:void 0!==s&&s!==i?s:void 0}}},o=e=>{if("number"==typeof e)return Number.isFinite(e)?new Date(e):void 0;if("string"==typeof e){let t=Date.parse(e);if(!Number.isNaN(t))return new Date(t)}},n=a(e[0]),l=n?o(n.display):void 0,d=l?this._formatDateTime(l):void 0,c=new Set,h=new Map,u={main:{lines:[],totals:[]},compare:{lines:[],totals:[]}};if(e.forEach((e,n)=>{let l=("string"==typeof e.seriesId?e.seriesId:void 0)??("string"==typeof e.seriesName?e.seriesName:void 0)??("number"==typeof e.seriesIndex?String(e.seriesIndex):void 0)??String(n);if(c.has(l))return;c.add(l);let d=this._seriesConfigById.get(l);if(d?.show_in_tooltip===!1)return;let p=a(e);if(!p)return;let{display:_,value:m,original:g}=p;if(null==m||Number.isNaN(m))return;let f=l.endsWith("--compare"),v=f?"compare":"main";f&&(void 0===t&&(t=_),void 0!==g&&void 0===i&&(i=g));let y=this._config?.show_unit===!1?void 0:this._unitsBySeries.get(l),S=this._formatNumber(m,{maximumFractionDigits:r}),b=y?` ${y}`:"",x="string"==typeof e.seriesName?e.seriesName:"",$=this._indicatorColorBySeries.get(l)??("string"==typeof e.color?e.color:void 0);if(u[v].lines.push({color:$,text:`${x}: ${S}${b}`}),f&&void 0!==g&&!u.compare.header){let e=o(g);e&&(u.compare.header=this._formatDateTime(e))}if(s){let e=d?.stack?.trim();if(!e||e.startsWith("__energy_fill_"))return;let t=`${f?"compare":"main"}::${e}`,i=h.get(t)??{name:e,positive:0,negative:0,count:0,unit:y,isCompare:f};void 0===i.unit&&void 0!==y&&(i.unit=y),i.count+=1,m>0?i.positive+=m:m<0&&(i.negative+=m),h.set(t,i)}}),s&&h.size&&h.forEach(e=>{if(e.count<2)return;let t=e.unit&&this._config?.show_unit!==!1?` ${e.unit}`:"",i=e=>this._formatNumber(e,{maximumFractionDigits:r}),s=e.isCompare?" (Compare)":"",a=e.isCompare?"compare":"main";e.positive>0&&u[a].totals.push(`Total ${e.name}${s} (pos): ${i(e.positive)}${t}`),e.negative<0&&u[a].totals.push(`Total ${e.name}${s} (neg): ${i(e.negative)}${t}`)}),!u.compare.header){let e=void 0!==i?i:void 0!==t?this._computeCompareOriginalTimestamp(t):void 0;if(void 0!==e){let t=o(e);t&&(u.compare.header=this._formatDateTime(t))}}let p=document.createElement("div");p.style.display="contents";let _=()=>{p.appendChild(document.createElement("br"))},m=e=>{let t=document.createElement("strong");t.textContent=e,p.appendChild(t)},g=!1,f=!1;return d&&(m(d),g=!0),["main","compare"].forEach(e=>{if(u[e].header||u[e].lines.length||u[e].totals.length){g&&(_(),f&&_());let t=u[e],i=!1,r=()=>{i&&_()};t.header&&(m(t.header),i=!0),t.lines.forEach(e=>{var t;if(r(),e.color){let t=document.createElement("span");t.style.display="inline-block",t.style.marginRight="4px",t.style.borderRadius="50%",t.style.width="8px",t.style.height="8px",t.style.background=e.color,p.appendChild(t)}t=e.text,p.appendChild(document.createTextNode(t)),i=!0}),t.totals.forEach(e=>{r(),m(e),i=!0}),g=!0,f=!0}}),g?p:null}_computeCompareOriginalTimestamp(e){if(!this._periodStart||!this._comparePeriodStart)return;let t=this._periodStart,i=this._comparePeriodStart,r=O(t,i);if(0!==r&&t.getTime()===V(t).getTime())return E(new Date(e),-r).getTime();let s=F(t,i);if(0!==s&&t.getTime()===W(t).getTime())return C(new Date(e),-s).getTime();let a=H(t,i);return 0!==a&&t.getTime()===A(t).getTime()?b(new Date(e),-a).getTime():e-(t.getTime()-i.getTime())}_formatNumber(e,t){let i=this.hass?.locale?.language??"en-US";return new Intl.NumberFormat(i,{maximumFractionDigits:2,...t}).format(e)}_getDateTimeFormatterContext(){let e=this.hass?.locale?.language??"en-US",t=this.hass?.locale,i=t?.time_zone;return"server"===i&&(i=this.hass?.config?.time_zone),i&&"local"!==i&&"system"!==i||(i=void 0),{locale:e,timeZone:i}}_formatDatePart(e,t){let{locale:i,timeZone:r}=this._getDateTimeFormatterContext();try{return new Intl.DateTimeFormat(i,{...t,timeZone:r}).format(e)}catch(t){return e.toLocaleDateString()}}_formatXAxisMonthLabel(e){let t=new Date(e),i=this._formatDatePart(t,0===t.getMonth()?{month:"long",year:"numeric"}:{month:"long"});return 0===t.getMonth()?`{bold|${i}}`:i}_formatXAxisYearLabel(e){return this._formatDatePart(new Date(e),{year:"numeric"})}_formatDateTime(e){let{locale:t,timeZone:i}=this._getDateTimeFormatterContext();try{return new Intl.DateTimeFormat(t,{year:"numeric",month:"short",day:"numeric",hour:"numeric",minute:"2-digit",timeZone:i}).format(e)}catch(t){return e.toLocaleString()}}_log(e,t,i){let r={debug:0,info:1,warn:2,error:3};if(r[e]<r.warn)return;let s=(console[e]??console.log).bind(console);i&&Object.keys(i).length?s(`${et} ${t}`,i):s(`${et} ${t}`)}static{this.styles=(0,l.css)`
    ha-card {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 16px 16px 0px 16px;
    }

    .card-title {
      margin: 0;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: var(--ha-font-size-3xl, 24px);
      font-weight: var(--ha-font-weight-normal, 400);
      line-height: 1.2;
    }

    .header-chip {
      flex: 0 1 auto;
      min-width: 0;
      max-width: 45%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--primary-text-color);
      font-size: var(--ha-font-size-m, 14px);
      font-weight: var(--ha-font-weight-medium, 500);
      line-height: normal;
      padding: var(--ha-space-1, 4px) var(--ha-space-2, 8px);
      border-radius: var(--ha-border-radius-md, 6px);
      border: 1px solid var(--divider-color);
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
  `}constructor(...e){super(...e),this._isLoading=!1,this._chartData=[],this._usesSectionLayout=!1,this._unitsBySeries=new Map,this._indicatorColorBySeries=new Map,this._loggedEnergyFallback=!1,this._calculatedSeriesData=new Map,this._calculatedSeriesUnits=new Map,this._calculatedSeriesDataCompare=new Map,this._calculatedSeriesUnitsCompare=new Map,this._seriesConfigById=new Map,this._headerMetricWarnings=new Set,this._solarSourcesByStatistic=new Map,this._warnedForecastYearAggregation=!1,this._forecastSeriesData=new Map,this._forecastSeriesUnits=new Map,this._forecastSeriesDataCompare=new Map,this._forecastSeriesUnitsCompare=new Map,this._shiftedSeriesData=new Map,this._shiftedSeriesMetadata=new Map,this._shiftedCalculatedSeriesData=new Map,this._shiftedCalculatedSeriesUnits=new Map,this._fetchStates=new Map,this._activeFetchCounters={main:0,compare:0,main_live:0,compare_live:0},this._isPageVisible="undefined"==typeof document||"hidden"!==document.visibilityState,this._visibilityQueuedLoads=new Set,this._visibilityListenerAttached=!1,this._handleVisibilityChange=()=>{let e="undefined"==typeof document||"hidden"!==document.visibilityState;this._isPageVisible!==e&&(this._isPageVisible=e,e?(this._log("info","Document visible; scheduling refresh",{hidden:!1}),this._scheduleVisibilityResume()):(this._log("info","Document hidden; pausing scheduled refresh",{hidden:!0}),this._pauseVisibilityTimers(),this._teardownRawStream("main"),this._teardownRawStream("compare")))}}}(0,n.__decorate)([(0,u.property)({attribute:!1})],ea.prototype,"hass",void 0),(0,n.__decorate)([(0,p.state)()],ea.prototype,"_config",void 0),(0,n.__decorate)([(0,p.state)()],ea.prototype,"_statistics",void 0),(0,n.__decorate)([(0,p.state)()],ea.prototype,"_metadata",void 0),(0,n.__decorate)([(0,p.state)()],ea.prototype,"_periodStart",void 0),(0,n.__decorate)([(0,p.state)()],ea.prototype,"_periodEnd",void 0),(0,n.__decorate)([(0,p.state)()],ea.prototype,"_comparePeriodStart",void 0),(0,n.__decorate)([(0,p.state)()],ea.prototype,"_comparePeriodEnd",void 0),(0,n.__decorate)([(0,p.state)()],ea.prototype,"_statisticsCompare",void 0),(0,n.__decorate)([(0,p.state)()],ea.prototype,"_metadataCompare",void 0),(0,n.__decorate)([(0,p.state)()],ea.prototype,"_isLoading",void 0),(0,n.__decorate)([(0,p.state)()],ea.prototype,"_chartData",void 0),(0,n.__decorate)([(0,p.state)()],ea.prototype,"_chartOptions",void 0),(0,n.__decorate)([(0,p.state)()],ea.prototype,"_headerChip",void 0),(0,n.__decorate)([(0,p.state)()],ea.prototype,"_disabledMessage",void 0),(0,n.__decorate)([(0,p.state)()],ea.prototype,"_usesSectionLayout",void 0),(0,n.__decorate)([(0,p.state)()],ea.prototype,"_forecastSeriesData",void 0),(0,n.__decorate)([(0,p.state)()],ea.prototype,"_forecastSeriesUnits",void 0),(0,n.__decorate)([(0,p.state)()],ea.prototype,"_forecastSeriesDataCompare",void 0),(0,n.__decorate)([(0,p.state)()],ea.prototype,"_forecastSeriesUnitsCompare",void 0),ea=(0,n.__decorate)([(0,h.customElement)("energy-custom-graph-card")],ea),a("c09yQ"),window.customCards=window.customCards||[],window.customCards.push({type:"energy-custom-graph-card",name:"Energy Custom Graph",description:"Flexible energy statistics chart with custom stacking, axes, and colors."});
//# sourceMappingURL=energycustomgraph.js.map

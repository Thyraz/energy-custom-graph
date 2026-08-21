# Energy Custom Graph

This context covers the user-facing language for the Energy Custom Graph Home Assistant custom card.

## Language

**Energy Custom Graph**:
A Home Assistant custom card for visualizing energy and statistics data in Lovelace dashboards.
_Avoid_: Energy Custom Card, Energy Custom Graph Card

**Chart**:
The graph area that displays configured series across the selected period.
_Avoid_: Plot

**Series**:
A configured data stream drawn in the chart and represented in the legend and tooltip.
_Avoid_: Dataset

**Series source**:
The kind of input a series uses: entity, calculation, or forecast.
_Avoid_: Statistic, entity type, data source type

**Series editor**:
The card editor area for adding, ordering, and configuring series.
_Avoid_: Entity editor, dataset editor

**Series option group**:
A collapsible area inside one series editor row that groups related series options, such as source, style, visibility, or transform.
_Avoid_: Series segment, tab

**Duplicate series**:
A card editor action that creates a new series from an existing series configuration.
_Avoid_: Copy series, clone series

**Series time offset**:
A per-series shift of the source timespan; the resulting data is displayed in the chart timespan.
_Avoid_: Render offset

**Series color**:
The configured or resolved color that identifies a series.
_Avoid_: Signal color, base color

**Statistic series**:
A series backed by one Home Assistant statistic ID.
_Avoid_: Long-term series, entity series

**External statistic**:
A Home Assistant statistic that has statistic metadata but no matching entity state.
_Avoid_: Entity, raw-only entity

**Statistic type**:
The statistic value field requested for a statistic series or calculation term, such as change, sum, mean, min, max, or state.
_Avoid_: Entity type, data type

**Calculation series**:
A series computed from one or more terms. A calculation series has a value at a time only when every required calculation term has a value at that time.
_Avoid_: Computed series, calculated series

**Calculation term**:
One ordered input step inside a calculation series; it uses either a statistic ID or a constant.
_Avoid_: Calculation step

**Constant term**:
A calculation term with a fixed number instead of a statistic ID.
_Avoid_: Constant-only calculation

**Forecast series**:
A series backed by Home Assistant energy solar forecast data.
_Avoid_: Solar source

**Raw history**:
Unaggregated Home Assistant recorder history states used as an aggregation interval.
_Avoid_: Raw source

**Raw-only entity**:
A Home Assistant entity that can provide raw history but has no matching statistic metadata.
_Avoid_: Raw-only source, statistic source, entity type

**Unknown entity**:
An editor-entered entity ID or statistic ID with neither entity state nor statistic metadata.
_Avoid_: Raw-only entity, external statistic

**Last-known value**:
The most recent non-empty raw history value reused for a calculation term when no value exists at the exact timestamp.
_Avoid_: Cached value

**Significant changes only**:
A raw history request option that follows Home Assistant's filtering behavior.
_Avoid_: Raw stream filtering

**Current-hour estimate**:
An estimated hourly value for the ongoing hour, built from recent 5-minute statistics until Home Assistant publishes the hourly aggregate.
_Avoid_: Live value, near real-time value

**Card editor**:
Home Assistant's graphical editor for configuring Energy Custom Graph in Lovelace.
_Avoid_: GUI editor, visual editor

**Card preview**:
The Home Assistant-rendered preview of the configured card shown beside or below the card editor.
_Avoid_: Chart preview, editor preview

**Editor section**:
A top-level card editor area that groups related configuration options such as chart settings, card header, or series.
_Avoid_: Settings category, editor panel

**Chart settings**:
The card editor section for options that affect the chart as a whole.
_Avoid_: General settings, graph settings

**Contextual editor option**:
A card editor option whose visibility or enabled state depends on the current configuration.
_Avoid_: Dynamic option, conditional field

**More options**:
The collapsed end-user control that reveals advanced editor options within the current editor context.
_Avoid_: Advanced, expert options

**Editor summary**:
A compact read-only summary shown on a collapsed editor section or series row.
_Avoid_: Preview text, collapsed description

**HA-native editor control**:
A Home Assistant-provided UI control used inside the card editor.
_Avoid_: Custom editor widget, bespoke editor control

**Card header**:
The visible top area of the card containing the title and optional header chip.
_Avoid_: Editor header, graph header

**Header chip**:
A compact value display in the card header beside the title.
_Avoid_: Text field, header value

**Header metric**:
A scalar value shown in a header chip, based on chart data or an entity state.
_Avoid_: Summary value, template text

**Editor help hint**:
A short help explanation for one card editor option, shown beside the option instead of as README-only documentation.
_Avoid_: Tooltip, inline documentation

**Editor hint severity**:
The visual importance of an editor help hint: info, warning, or error.
_Avoid_: Hint type, tooltip severity

**Tooltip**:
The hover or click detail panel that shows chart values at a selected point in time.
_Avoid_: Popup, hover label

**Value label**:
A static value drawn directly on or near a chart data point.
_Avoid_: Tooltip label, bar text

**Axis pointer**:
The hover guide line on the chart that marks the selected X axis position, Y axis value, or both.
_Avoid_: Crosshair

**Legend indicator**:
The colored symbol beside a legend entry.
_Avoid_: Legend marker, legend bullet

**X axis**:
The horizontal date/time axis of the chart.
_Avoid_: Time scale

**Y axis**:
The vertical value axis a series is assigned to; the card supports left and right Y axes.
_Avoid_: Scale

**Axis unit**:
An optional unit label configured on a Y axis; it overrides series metadata units for tooltip and axis display.
_Avoid_: Series unit

**Timespan**:
The visible date/time range that the card displays.
_Avoid_: Period, time range

**Source timespan**:
The date/time range a series uses as its data source.
_Avoid_: Display timespan

**Timespan mode**:
The way the card chooses the timespan: energy, relative, or fixed.
_Avoid_: Range mode

**Timespan count**:
The number of calendar units included by a relative timespan. It applies only when the relative timespan period is hour, day, week, month, or year.
_Avoid_: Multiplier, duration multiplier

**Energy date picker**:
Home Assistant's dashboard date selector that Energy Custom Graph follows in energy timespan mode.
_Avoid_: Date picker

**Collection key**:
The identifier used to bind the card to one energy date picker when a dashboard has multiple pickers.
_Avoid_: Picker key

**Aggregation interval**:
The recorder bucket size used to fetch or derive chart points.
_Avoid_: Period, aggregation period

**Compare timespan**:
The secondary timespan aligned with the primary timespan when Home Assistant's compare toggle is active.
_Avoid_: Compare period, comparison range

**Stack sum**:
A tooltip total for positive or negative values across visible series in the same stack.
_Avoid_: Aggregate

**Fill band**:
The shaded area between a source line series and a target line series.
_Avoid_: Fill stack

**Gradient fill**:
A normal line or step series fill whose opacity fades towards the zero line.
_Avoid_: Gradient band

**Stack**:
A user-configured group where series values are visually accumulated.
_Avoid_: Fill stack

**Draw order**:
The visual layering order for overlapping series in the chart; it does not change series values or stack calculation.
_Avoid_: Stack, z-index

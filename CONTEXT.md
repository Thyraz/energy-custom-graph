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

**Statistic series**:
A series backed by one Home Assistant statistic ID.
_Avoid_: Long-term series

**Calculation series**:
A series computed from one or more terms.
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

**Last-known value**:
The most recent non-empty raw history value reused for a calculation term when no value exists at the exact timestamp.
_Avoid_: Cached value

**Significant changes only**:
A raw history request option that follows Home Assistant's filtering behavior.
_Avoid_: Raw stream filtering

**Current-hour estimate**:
An estimated hourly value for the ongoing hour, built from recent 5-minute statistics until Home Assistant publishes the hourly aggregate.
_Avoid_: Live value, near real-time value

**Tooltip**:
The hover or click detail panel that shows chart values at a selected point in time.
_Avoid_: Popup, hover label

**Y axis**:
The vertical value axis a series is assigned to; the card supports left and right Y axes.
_Avoid_: Scale

**Axis unit**:
An optional unit label configured on a Y axis; it overrides series metadata units for tooltip and axis display.
_Avoid_: Series unit

**Timespan**:
The visible date/time range that the card displays.
_Avoid_: Period, time range

**Timespan mode**:
The way the card chooses the timespan: energy, relative, or fixed.
_Avoid_: Range mode

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

**Stack**:
A user-configured group where series values are visually accumulated.
_Avoid_: Fill stack

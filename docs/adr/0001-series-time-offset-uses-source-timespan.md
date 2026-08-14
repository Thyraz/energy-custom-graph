# ADR 0001: Series time offset uses the source timespan

## Status

Accepted

## Context

Users want to compare related statistics inside the same visible chart timespan, for example this year's monthly values against last year's monthly values.

This is not just a render offset. If the card loaded only the visible timespan and then moved a series on the X axis, the requested comparison data would often be outside the chart range and unavailable.

## Decision

`time_offset` is defined as a per-series source timespan shift.

For a shifted statistic series, the card:

1. Shifts the visible timespan by `time_offset`.
2. Fetches recorder statistics from that shifted source timespan.
3. Projects returned timestamps back by the inverse offset so the series appears in the visible chart timespan.

Example: with `time_offset: { value: -1, unit: year }`, a chart showing 2026 loads that series from 2025 and displays those points aligned onto 2026.

The implementation supports statistic series and whole calculation series in the main chart with recorder statistics aggregation. Raw history and forecast series are not supported. Date picker compare is ignored when any series configures a time offset.

## Consequences

- Series names remain user-controlled; the card does not auto-label shifted dates.
- Legend and tooltip behavior can keep using the existing series identity model.
- Calendar units use calendar-aware date shifts, so month and year offsets stay aligned with calendar buckets.
- Calculation series use one offset for the whole calculation output; individual terms cannot have separate offsets.
- Raw history cannot be used with series time offset because the offset fetch path is tied to aggregated recorder statistics.
- Date picker compare is disabled for charts that configure a series time offset to avoid stacking two independent time transforms.

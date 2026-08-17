# Header chip metrics use resolved series data

Energy Custom Graph will support one optional HA-style header chip that displays a scalar header metric beside the card title. Header metrics may read resolved series data, stack data, entity state, or a calculation over those scalar inputs; they do not use templates, direct extra statistic sources, a separate timespan, or date-picker compare data in the first version.

Resolved series data is the boundary for chart-related header metrics: series transformations, calculation series, forecast series, raw history handling, and series time offsets are applied before the metric reducer runs. Series therefore gain an optional stable `id` for references, the editor creates missing IDs automatically, and `show_in_chart: false` means a series is still loaded and resolved but not rendered in the chart, legend, tooltip, or axis calculation.

This keeps the feature powerful enough for totals, last values, stack summaries, current entity states, and period-based calculations while keeping the GUI editor finite and avoiding a second fetch/template engine.

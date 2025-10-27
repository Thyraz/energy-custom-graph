# Energy Custom Graph

Energy Custom Graph is a lightweight Lovelace card that plugs into Home Assistant's energy date picker. It reuses the built-in ECharts instance shipped with Home Assistant, so you get native styling, minimal overhead, and a layout that mirrors the core energy cards.

Unlike the default energy cards like `energy-usage-graph`, this card is not limited to the energy dashboard entities. Any long-term statistic available in the recorder can be visualised and combined, whether it comes from energy, climate, sensors, ... Each series can pick the statistic type (`change`, `sum`, `mean`, `min`, `max`, `state`) and presentation style.
I know the `Statistics graph card` nowadays also support the energy date picker, but it didn't provide all the features I needed.

## Key Features

- Drops into dashboards that already use the Home Assistant energy date picker (`energy-date-selection`) for instant period syncing.
- Supports any entity that exposes long-term statistics, not only energy sources.
- Shares the core energy colour palette and styling so mixed dashboards look consistent.
- Uses Home Assistant's bundled ECharts runtime – no extra framework needs to be loaded.
- Per-series control over aggregation statistic, chart type (bar or line), stacking, color, unit scaling and offsets.
- Optional fill-between-rendering for line series to highlight the space between two signals.
- Optional manual period selection (fixed ranges or relative day/week/month/year offsets) when you do not want to use the energy picker.

## Installation

### HACS (recommended)

1. In Home Assistant, open *HACS > Frontend* and click the three-dot menu in the top right.
2. Choose *Custom repositories*, add `https://github.com/Thyraz/energy-custom-graph`, and leave the category set to *Lovelace*.
3. Search for "Energy Custom Graph" in HACS, install the latest release, and let HACS add the resource to your dashboard automatically.
4. Reload the browser or clear the Lovelace cache if the new card type is not immediately available.

### Manual installation

1. Download the latest `energycustomgraph.js` from the repository release or the `dist/` folder.
2. Copy it into your Home Assistant config directory, e.g. `config/www/community/energy-custom-graph/energycustomgraph.js`.
3. Add the resource to Lovelace (Settings → Dashboards → Resources → **+ ADD RESOURCE**):
   - URL: `/local/community/energy-custom-graph/energycustomgraph.js`
   - Resource type: `JavaScript Module`
4. Reload your browser cache.

## Usage

Add the card to a dashboard via YAML or the raw editor:

```yaml
type: custom:energy-custom-graph-card
title: Custom energy overview
series:
  - statistic_id: sensor.energy_grid_import
  - statistic_id: sensor.energy_grid_export
    stat_type: change
    chart_type: line
    fill: true
```

The card supports the energy date picker out of the box. Place an `energy-date-selection` control on the same view, set `timespan.mode: "energy"` (which is the default), and the card will mirror the currently selected range. For other timespan modes, see the `timespan` configuration below.

## Configuration Reference

By default the card mirrors the core energy cards and automatically selects the recorder statistics period (5-minute, hourly, daily, or monthly) based on the chosen timeframe so every series shares aligned buckets. You can override this behaviour via the `aggregation` options described below.

### Card options

| Key | Type | Default | Description |
| --- | ---- | ------- | ----------- |
| `type` | string | – | Must be `custom:energy-custom-graph-card`. |
| `title` | string | – | Optional card header. |
| `series` | list | – | One or more series definitions (see below). |
| `timespan` | object | `{mode: "energy"}` | Controls the time range displayed (see below). |
| `collection_key` | string | – | Custom key when multiple energy date pickers are present (only for `timespan.mode: "energy"`). |
| `chart_height` | string | – | CSS height (e.g. `300px`, `20rem`). |
| `color_cycle` | list | – | Custom palette of CSS variables or colours applied cyclically to series. |
| `legend_sort` | `"asc"`, `"desc"`, `"none"` | `"none"` | Sort order for the legend entries. |
| `hide_legend` | boolean | `false` | Hide the legend entirely. |
| `expand_legend` | boolean | `false` | Expand the legend by default. |
| `y_axes` | list | – | Y axis configuration for both left and right axes (see below). |
| `tooltip_precision` | number | – | Override numeric precision in the tooltip. |
| `show_unit` | boolean | `true` | Show units derived from statistics metadata (per series) in tooltips and axes. |
| `aggregation` | object | auto | Control recorder aggregation intervals. See below. |

### `series` options

| Key | Type | Default | Description |
| --- | ---- | ------- | ----------- |
| `statistic_id` | string | – | Recorder statistic identifier (`sensor.entity_id` etc.). Required unless `calculation` is provided. |
| `name` | string | entity name | Display name shown in tooltip and legend. |
| `stat_type` | `"change"`, `"sum"`, `"mean"`, `"min"`, `"max"`, `"state"` | `"change"` | Statistic sampled from Home Assistant. |
| `chart_type` | `"bar"`, `"line"` | `"bar"` | Presentation type. |
| `fill` | boolean | `false` | Fill the area underneath the line. |
| `stack` | string | – | Stack key for combining series; identical keys stack together. |
| `color` | string | palette order | Specific colour (supports hex/hex-alpha, `rgb()`, `rgba()`, or CSS variables). |
| `line_opacity` | number | style default | Override stroke opacity (0–1). Defaults to 0.85 for line charts and 1.0 for bar outlines. |
| `line_width` | number | `2` | Line thickness in pixels (line charts only). |
| `line_style` | `"solid"`, `"dashed"`, `"dotted"` | `"solid"` | Line pattern style (line charts only). |
| `fill_opacity` | number | style default | Override fill opacity (0–1). Defaults to 0.15 for line areas and 0.5 for bars. |
| `y_axis` | `"left"`, `"right"` | `"left"` | Axis assignment. |
| `show_legend` | boolean | `true` | Hide or show this series in the legend. |
| `multiply` | number | `1` | Apply a multiplier to the statistic value. |
| `add` | number | `0` | Apply an additive offset after multiplication. |
| `clip_min` | number | – | Clamp the processed value to be no lower than this threshold. |
| `clip_max` | number | – | Clamp the processed value to be no higher than this threshold. |
| `smooth` | boolean or number | `true` | Control line smoothing. Use `false` to disable, or a value between 0 and 1 to tune the spline tightness. |
| `fill_to_series` | string | – | For line charts only: name of another line series to fill towards. Both series must avoid stacking. |
| `calculation` | object | – | Build a derived series from multiple statistics (see below). |

#### Fill between line series

Set `fill_to_series` on a line series to shade the area between it and another line. The value must match the `name` of the target series. Requirements:

- Both series must be rendered as lines (no bars) and must not use `stack`.
- The referenced `name` has to be unique within the card.
- When the upper series drops below the lower one, the card clamps the fill to zero and logs a warning so you can inspect the data.
- The fill area inherits the upper series' `fill_opacity` (or its default if unspecified).

#### Calculated series

Define `calculation` to synthesise a series from multiple statistics. Terms are processed sequentially, starting from `initial_value` (default `0`).

| Key | Type | Default | Description |
| --- | ---- | ------- | ----------- |
| `terms` | list | – | Ordered list of calculation steps. |
| `initial_value` | number | `0` | Seed value before the first term runs. |
| `unit` | string | inferred | Unit for the resulting series (falls back to the first statistic). |

Each term accepts the following options:

| Key | Type | Default | Description |
| --- | ---- | ------- | ----------- |
| `statistic_id` | string | – | Statistic to read. Mutually exclusive with `constant`. |
| `stat_type` | `"change"`, `"sum"`, `"mean"`, `"min"`, `"max"`, `"state"` | inherit | Field to read from the statistic. Only used when `statistic_id` is set. |
| `multiply` | number | `1` | Multiply the statistic before applying the operation. Only used for statistics. |
| `add` | number | `0` | Offset applied after multiplication. Only used for statistics. |
| `clip_min` | number | – | Clamp the statistic value to be no lower than this threshold. |
| `clip_max` | number | – | Clamp the statistic value to be no higher than this threshold. |
| `operation` | `"add"`, `"subtract"`, `"multiply"`, `"divide"` | `"add"` | Operation applied to the running total. |
| `constant` | number | – | Constant that replaces the statistic. Mutually exclusive with `statistic_id`. |

### Timespan options

The `timespan` configuration controls the time range displayed by the card. It supports three modes:

**Mode: `energy` (default)**
```yaml
timespan:
  mode: energy
```
Follow the energy date picker on the dashboard. The card automatically mirrors the selected range.

**Mode: `relative`**
```yaml
timespan:
  mode: relative
  period: day        # hour, day, week, month, or year
  offset: -1         # Optional offset (e.g., -1 for yesterday, 0 for today)
```
Display a relative time period. The `period` defines the unit and `offset` shifts it (e.g., `-1` for the previous period, `0` for current).

**Mode: `fixed`**
```yaml
timespan:
  mode: fixed
  start: "2024-01-01T00:00:00"   # Optional, defaults to start of today
  end: "2024-01-31T23:59:59"     # Optional, defaults to end of start day
```
Display a fixed time range. Dates use ISO 8601 format. If omitted, `start` defaults to the beginning of today and `end` defaults to the end of the start day.

### Aggregation options

Override the recorder aggregation interval if needed. By default, the card mirrors HA’s energy cards (hours for daily ranges, days for weekly/monthly views, months for yearly views). Use the `aggregation` block to customise this behaviour:

```yaml
aggregation:
  manual: hour          # Used when the card is not linked to the energy date picker
  fallback: day         # Used if the preferred aggregation returns no data
  energy_picker:
    day: 5minute
    week: hour
    month: day
    year: month
```

- `manual` applies when the timespan mode is `relative` or `fixed` (i.e., not following the energy picker).
- `energy_picker` sets the aggregation used when the energy date picker selects `hour`, `day`, `week`, `month`, or `year` ranges. Any range not listed keeps the automatic behaviour.
- `fallback` is used if the preferred interval yields no data. Omit it to keep the current error behaviour.
- Valid intervals: `"5minute"`, `"hour"`, `"day"`, `"week"`, `"month"`.

Tip: use very fine intervals (e.g. 5 minutes) only for short ranges to avoid excessive data volumes.

### `y_axes` options

Configure both left and right Y axes individually. The right axis appears automatically when a series uses `y_axis: right` or when an explicit `right` axis configuration exists.

| Key | Type | Default | Description |
| --- | ---- | ------- | ----------- |
| `id` | `"left"`, `"right"` | – | Axis selector to override (`left` is primary). |
| `min` | number | auto | Minimum axis value. **Note:** Ignored when `center_zero` is active. |
| `max` | number | auto | Maximum axis value. When `center_zero` is active, this value is used for both positive and negative bounds (e.g., `max: 10` creates range -10 to +10). |
| `fit_y_data` | boolean | `false` | Force this axis to fit its data range tightly. |
| `center_zero` | boolean | `false` | Center the axis around zero by making min/max symmetric (e.g., -10 to +10). Useful for visualizing positive and negative values with zero aligned. If `max` is set, uses ±max; otherwise calculates from data. |
| `logarithmic_scale` | boolean | `false` | Apply logarithmic scaling to this axis. |
| `unit` | string | metadata | Override unit label for this axis. |

## Examples

### 1. Manual fixed window with dual axes

```yaml
type: custom:energy-custom-graph-card
title: Heating performance snapshot
timespan:
  mode: fixed
  start: 2024-01-01T00:00:00Z
  end: 2024-01-08T00:00:00Z
y_axes:
  - id: left
    unit: kWh
    fit_y_data: true
  - id: right
    unit: °C
    min: -10
    max: 30
series:
  - statistic_id: sensor.heat_pump_energy
    name: Heat pump energy
    stat_type: change
    chart_type: bar
  - statistic_id: sensor.outdoor_temperature
    name: Outdoor temperature
    stat_type: mean
    chart_type: line
    y_axis: right
```

### 1a. Centered zero axis for grid import/export comparison

```yaml
type: custom:energy-custom-graph-card
title: Grid power balance
y_axes:
  - id: left
    unit: kW
    center_zero: true
    max: 5  # Optional: forces range to -5 to +5, otherwise auto-calculated
series:
  - statistic_id: sensor.grid_import
    name: Import
    stat_type: mean
    chart_type: line
  - statistic_id: sensor.grid_export
    name: Export
    stat_type: mean
    chart_type: line
    multiply: -1
```

### 2. Shift the period for a previous year view

```yaml
type: custom:energy-custom-graph-card
title: Solar production (last year)
timespan:
  mode: relative
  period: year
  offset: -1
series:
  - statistic_id: sensor.solar_total_energy
    name: Solar production
    stat_type: change
```

### 3. Fill the range between minimum and maximum

```yaml
type: custom:energy-custom-graph-card
title: Outdoor temperature band
series:
  - statistic_id: sensor.outdoor_temperature
    name: Max temperature
    stat_type: max
    chart_type: line
    fill_to_series: Min temperature
    smooth: 0
  - statistic_id: sensor.outdoor_temperature
    name: Min temperature
    stat_type: min
    chart_type: line
    smooth: 0
```

### 4. Recreate the energy dashboard usage card

```yaml
type: custom:energy-custom-graph-card
hide_legend: true
series:
  - name: Solar self consumed
    chart_type: bar
    color: "--energy-solar-color"
    stack: energy
    clip_min: 0   # self-consumption should never get negative. Clip in case the value should be zero and gets a little bit negative due to rounding errors
    calculation:  # self-consumption is: total pv production - export to grid - battery charge
      unit: kWh
      terms:
        - statistic_id: sensor.total_solar_production
          operation: add
        - statistic_id: sensor.total_grid_export
          operation: subtract
        - statistic_id: sensor.total_battery_charge
          operation: subtract
  - statistic_id: sensor.total_grid_import
    name: Imported
    chart_type: bar
    color: "--energy-grid-consumption-color"
    stack: energy
  - statistic_id: sensor.total_battery_discharge
    name: Battery discharge
    chart_type: bar
    color: "--energy-battery-out-color"
    stack: energy
  - statistic_id: sensor.total_grid_export
    name: Exported
    chart_type: bar
    multiply: -1
    color: "--energy-grid-return-color"
    stack: energy
  - statistic_id: sensor.total_battery_charge
    name: Battery charge
    chart_type: bar
    multiply: -1
    color: "--energy-battery-in-color"
    stack: energy
```

## Tips

- Ensure recorder and long-term statistics are enabled for every entity you plan to plot.
- Use the relative period mode with positive or negative offsets to jump by whole days, weeks, months, or years.
- When using `fill_to_series`, keep `name` values unique and avoid stacking on the involved series.
- Mix solid line colours with partial `fill_opacity` to highlight envelopes without hiding underlying charts; rgba/hex-alpha colours are fully supported.
- When using multiple energy date pickers on a single dashboard, provide the appropriate `collection_key` so the card links to the correct selection.
- Combine `multiply` and `add` to convert units (e.g. Wh to kWh) without creating extra template sensors.

## Support

If you encounter issues or have feature requests, open an issue or pull request on the repository. Contributions that expand documentation, add new configuration helpers, or improve parity with core energy cards are always welcome.

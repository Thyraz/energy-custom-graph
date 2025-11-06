# Energy Custom Graph
This card provides a lightweight graph that supports the Home Assistant energy date picker for time range selection. It reuses the built-in ECharts instance shipped with Home Assistant, so you get native styling with minimal overhead.

Unlike the default energy cards like `energy-usage-graph`, this card is not limited to the energy dashboard entities. Any long-term statistic available in the recorder database can be used, as well as the short-term 'raw' history. For aggregated statistics you can choose the type (`change`, `sum`, `mean`, `min`, `max`, `state`) for each series separately.
I know the `Statistics graph card` nowadays also support the energy date picker, but it didn't provide all the features I needed.

## Key Features

- This card has an full-featured graphical editor, so almost all settings can be done through the UI.
- Displayed timespan sync with the energy date picker (`energy-date-selection`).
- Supports any entity that exposes long-term statistics, as well as the short-term 'raw' history.
- Allows to compute values for the current running hour before HA provides the final aggregation.
- Uses Home Assistant's bundled ECharts runtime – no extra framework needs to be loaded.
- Override the energy date pickers default aggregation periods, to e.g. display hourly instead of daily bars when viewing a monthly report.
- Per-series control over aggregation type, chart type (bar, line or step), stacking, color, unit, scaling and offsets.
- Optional fill-between-rendering for line series to fill the space e.g. between min / max line-charts
- Optional manual timespan selection (fixed ranges or relative day/week/month/year offsets) when you don't want to use the energy date picker.
- Support for calculated series, so you can e.g. add and subtract sensor values as a computed signal
- Quick access to colors from the HA energy color palette and native styles so mixed dashboards look consistent.

## Screenshots

<p>
  <img
    src="docs/img/1 mixed-line-and-bar-charts.jpg"
    width="797"
    height="356"
    alt="Mix of bar and line charts with stacked series"
  />
</p>
<p>
  <img
    src="docs/img/2 line-charts.jpg"
    width="806"
    height="309"
    alt="Multiple line charts displayed together"
  />
</p>
<p>
  <img
    src="docs/img/3 step-chart.jpg"
    width="793"
    height="323"
    alt="Step chart visualizing a binary sensor"
  />
</p>
<p>
  <img
    src="docs/img/4 fill-area-between-signals.jpg"
    width="787"
    height="352"
    alt="Filled area between two line series"
  />
</p>
<p>
  <img
    src="docs/img/5 compare-different-color.jpg"
    width="1015"
    height="295"
    alt="Compare mode using different highlight colors"
  />
</p>
<p>
  <img
    src="docs/img/6 editor.jpg"
    width="799"
    height="481"
    alt="Graphical editor for configuring the card"
  />
</p>

## Installation

### HACS (recommended)

1. In Home Assistant, open *HACS > Frontend* and click the three-dot menu in the top right.
2. Choose *Custom repositories*, add `https://github.com/Thyraz/energy-custom-graph`, and leave the category set to *Lovelace*.
3. Search for "Energy Custom Graph" in HACS, install the latest release.
4. Reload the browser and clear the Browser cache if the card won't show up immediately.

### Manual installation

1. Download the latest `energycustomgraph.js` from the repository release or the `dist/` folder.
2. Copy it into your Home Assistant config directory, e.g. `config/www/community/energy-custom-graph/energycustomgraph.js`.
3. Add the resource to Lovelace (Settings → Dashboards → Resources → **+ ADD RESOURCE**):
   - URL: `/local/community/energy-custom-graph/energycustomgraph.js`
   - Resource type: `JavaScript Module`
4. Clear your browser cache and Reload the page.

## Usage

Add the card to a dashboard using the graphical card editor or via YAML:

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

The card supports the energy date picker for timespan selection. Set `timespan.mode: "energy"` (which is the default) and place an `energy-date-selection` control on the same dashboard. For other timespan modes, see the `timespan` configuration below.

## Configuration

By default the card mirrors the core energy cards and automatically selects the recorder statistics period (5-minute, hourly, daily, or monthly) based on the chosen timespan. You can override this behaviour via the `aggregation` options described below.

### Generic card options

| Key | Type | Default | Description |
| --- | ---- | ------- | ----------- |
| `type` | string | – | Must be `custom:energy-custom-graph-card`. |
| `title` | string | – | Optional card header. |
| `chart_height` | string | – | CSS height (e.g. `300px`). Ignored when the card is used inside a section layout (the grid rows control the height). |
| `timespan` | object | `{mode: "energy"}` | Controls the time range displayed (see below). |
| `collection_key` | string | – | Custom key when multiple energy date pickers are present (only for `timespan.mode: "energy"`). <br>[More Info](https://www.home-assistant.io/dashboards/energy/#using-multiple-collections) |
| `allow_compare` | boolean | `true` | For energy date picker mode: Respects the compare toggle when `true`. Set to `false` to disable this behavior. |
| `hide_legend` | boolean | `false` | Hide the legend entirely. |
| `legend_sort` | `"asc"`, `"desc"`, `"none"` | `"none"` | Sort order for the legend entries. |
| `expand_legend` | boolean | `false` | Expand the legend by default. |
| `tooltip_precision` | number | – | Override numeric precision in the tooltip. |
| `show_unit` | boolean | `true` | Show corresponding units from the recorder database when available in tooltips and axes. |
| `y_axes` | list | – | Y axis configuration for both left and right axes (see below). |
| `aggregation` | object | auto | Control recorder aggregation intervals. See below. |
| `series` | list | – | One or more series definitions (see below). |

### Timespan options

The `timespan` configuration controls the time range displayed by the card. Currently three modes are supported::

**Mode: `energy` (default)**
```yaml
timespan:
  mode: energy
```
Use a energy date picker on the same dashboard. The card automatically follows the selected range.

**Mode: `relative`**
```yaml
timespan:
  mode: relative
  period: day        # hour, day, week, month, year, last_60_minutes, last_24_hours, last_7_days, last_30_days, or last_12_months
  offset: -1         # Optional offset (e.g., -1 for yesterday/previous period)
```
Displays a relative time period. The card supports two types, inspired by the options in the energy date picker:

***Calendar-based periods*** (`hour`, `day`, `week`, `month`, `year`):
- "day" would mean today from 00:00 to 23:59 as base date
- `offset` shifts by complete periods (e.g., `-1` for yesterday, `-7` for same day last week)

***Rolling window periods*** (`last_60_minutes`, `last_24_hours`, `last_7_days`, `last_30_days`, `last_12_months`):
- End date is "now"
- `last_60_minutes`: Previous 60 minutes (offset shifts by full hours)
- `last_7_days`: Previous 7 days
- `last_24_hours`: Previous 24 hours (offset shifts by full days)
- `last_30_days`: Previous 30 days
- `last_12_months`: Previous 12 months
- `offset` shifts den gesamten Zeitraum (Stunden für `last_60_minutes`, Tage für `last_24_hours`/`last_7_days`, Monate für `last_12_months`).

**Mode: `fixed`**
```yaml
timespan:
  mode: fixed
  start: "2024-01-01T00:00:00"   # Optional, defaults to start of today
  end: "2024-01-31T23:59:59"     # Optional, defaults to end of start day
```
Display a fixed time range. Dates use ISO 8601 format. If omitted, `start` defaults to the beginning of today and `end` defaults to the end of the start day.

### `series` options - Configure the entities to use

| Key | Type | Default | Description |
| --- | ---- | ------- | ----------- |
| `name` | string | entity name | Display name shown in tooltip and legend. |
| `statistic_id` | string | – | Entity with long term statistics (e.g. `sensor.entity_id`). Required unless series uses a `calculation` instead. |
| `stat_type` | `"change"`, `"sum"`, `"mean"`, `"min"`, `"max"`, `"state"` | `"change"` | Statistic type to display for this entity. Not used when `calculation` is provided, as each subseries has it's own setting there. |
| `calculation` | object | – | Build a computed series from multiple statistics / terms (see below). |
| `chart_type` | `"bar"`, `"line"`, `"step"` | `"bar"` | Chart type. Use `step` for staircase lines that hold a value until the next change. |
| `stack` | string | – | Stack key for combining series. Series with identical keys will get stacked on top of each other. |
| `y_axis` | `"left"`, `"right"` | `"left"` | Axis assignment. |
| `show_in_legend` | boolean | `true` | Whether to display this series in the legend. If `false`, the series remains visible in the chart but has no legend entry. |
| `show_in_tooltip` | boolean | `true` | Controls whether the series appears in the tooltip. Set to `false` to keep the graph visible while hiding numbers from the hover tooltip. |
| `hidden_by_default` | boolean | `false` | Whether the series is initially hidden when the chart loads. The series can still be toggled via the legend. |
| `color` | string | next in palette | Specific color (supports `#rrggbb`, `rgb()` or CSS variables). |
| `compare_color` | string | inherit | Optional color for compare series. Defaults to the base series color with reduced opacity. |
| `line_opacity` | number | style default | Override stroke opacity (0–1). Defaults to 0.85 for line charts and 1.0 for bar outlines. |
| `line_width` | number | `1.5` | Line thickness in pixels (line charts only). |
| `line_style` | `"solid"`, `"dashed"`, `"dotted"` | `"solid"` | Line pattern style (line charts only). |
| `fill` | boolean | `false` | Fill the area underneath the line. |
| `fill_opacity` | number | style default | Override fill opacity (0–1). Defaults to 0.15 for line charts and 0.5 for bars. |
| `fill_to_series` | string | – | For line charts only: name of another line series to fill towards. Both series must not be stacked. |
| `smooth` | boolean or number | `true` | Line smoothing. Use `false` to disable and true for the default HA behavior. Or provide a value between 0 and 1 for finer control. |
| `multiply` | number | `1` | Apply a multiplier to each series value. |
| `add` | number | `0` | Apply an additive offset after multiplication. |
| `clip_min` | number | – | Values will be set to this value if they are smaller. |
| `clip_max` | number | – | Values will be set to this value if they are larger. |

#### Calculated series

Configure `calculation` instead of `statistic_id` to compute a series from multiple entity statistics. Terms are processed sequentially, starting with the `initial_value` (default `0`).

> **RAW data behaviour:** When you combine raw history series, the card reuses the most recent available value for each term at the evaluated timestamp. This “last-known value” fallback keeps calculations stable even if sensors don’t report at identical times.
>
> **Constant-only calculations:** If every term is a constant (multiply/add/clip allowed), the card creates simulated points across the visible time range. That makes it easy to draw horizontal reference lines or to use as a baseline for filling signals stacked on top.

| Key | Type | Default | Description |
| --- | ---- | ------- | ----------- |
| `terms` | list | – | Ordered list of calculation steps. |
| `initial_value` | number | `0` | Start value before the first term. |
| `unit` | string | inferred | Unit for the resulting series (inferring looks for the first statistic used). |

Each term accepts the following options:

| Key | Type | Default | Description |
| --- | ---- | ------- | ----------- |
| `operation` | `"add"`, `"subtract"`, `"multiply"`, `"divide"` | `"add"` | Operation applied in this step of the calculation. |
| `constant` | number | – | Constant number to use in this term. Use alternatively to providing a `statistic_id`. All keys below in this section are ignored in this case. |
| `statistic_id` | string | – | Entity with long term statistics (e.g. `sensor.entity_id`). Do not use in combination with setting `constant` in the same term. |
| `stat_type` | `"change"`, `"sum"`, `"mean"`, `"min"`, `"max"`, `"state"` | inherit | Statistic type to display for this entity. |
| `multiply` | number | `1` | Apply a multiplier to each series value. |
| `add` | number | `0` | Apply an additive offset after multiplication. |
| `clip_min` | number | – | Values will be set to this value if they are smaller. |
| `clip_max` | number | – | Values will be set to this value if they are larger. |

#### Fill between line series

Set `fill_to_series` on a line series to fill the area between this and the targeted line. The value must match the `name` of the target series. Requirements:

- Both series must be rendered as lines (no bars) and must not use stacking.
- The referenced `name` has to be unique within the configuration.
- When the upper series drops below the lower one, the card sets the fill to zero and logs a warning.
- The fill_opacity used is the one configured on the upper series' `fill_opacity` (or the default if unspecified).

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

### Aggregation options

Possibility to override the aggregation interval. By default, the card mirrors HA’s energy cards (hours for daily, days for weekly/monthly, months for yearly ranges).

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

- `manual` applies when the timespan mode is `relative` or `fixed` (energy date picker not used).
- `energy_picker` sets the aggregation used when the energy date picker selects `hour`, `day`, `week`, `month`, or `year` ranges. Any range not listed keeps the default value.
- `fallback` Optional. Is used if the preferred interval returns no data.
- Valid intervals: `"5minute"`, `"hour"`, `"day"`, `"week"`, `"month"`, `"raw"`, `"disabled"`.
- Use `"raw"` to fetch recorder history states without aggregation. Use `"disabled"` to skip the request entirely and show a “choose a shorter period” message instead.
- `compute_current_hour` (boolean) creates a live estimate for the ongoing hour by combining the most recent 5 minute statistics until Home Assistant publishes the official hourly aggregate.

> **Heads up:** Enabling `compute_current_hour` issues an extra 5 minute statistics query every few minutes while the current hour is visible. This increases database load slightly, so only enable it when you need near real-time hourly numbers.

Tip: use fine intervals only for short ranges to avoid excessive resource usage and loading times.

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

### 2a. Rolling window for last 30 days

```yaml
type: custom:energy-custom-graph-card
title: Energy consumption (last 30 days)
timespan:
  mode: relative
  period: last_30_days
series:
  - statistic_id: sensor.home_energy_consumption
    name: Consumption
    stat_type: change
    chart_type: bar
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
  - statistic_id: sensor.outdoor_temperature
    name: Min temperature
    stat_type: min
    chart_type: line
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

### 5. Binary sensor with short ranges in RAW and disabled long ranges

This setup draws a step line for a binary sensor. RAW history is used for the shortest two picker ranges, while longer ranges disable fetching and prompt the user to select a shorter period.

```yaml
type: custom:energy-custom-graph-card
title: Garage door activity
series:
  - statistic_id: binary_sensor.garage_door
    name: Garage door
    stat_type: state
    chart_type: step
    smooth: false
aggregation:
  energy_picker:
    hour: raw
    day: raw
    week: disabled
    month: disabled
    year: disabled
```

### 6. Hourly consumption with live current hour

```yaml
type: custom:energy-custom-graph-card
title: Consumption
aggregation:
  energy_picker:
    hour: hour
    day: day
  compute_current_hour: true
series:
  - statistic_id: sensor.energy_import
    name: Import
    stat_type: change
    chart_type: bar
  - statistic_id: sensor.energy_solar
    name: Solar
    stat_type: change
    chart_type: bar
```

With `compute_current_hour` enabled the card keeps the current hour up to date using 5 minute statistics, while historical hours continue to come from Home Assistant’s long-term database.

## Tips

- Ensure recorder and long-term statistics are enabled for every entity you plan to use.
- Use the relative period mode with positive or negative offsets to jump by whole days, weeks, months, or years.
- When using `fill_to_series`, keep `name` values unique and avoid stacking for the involved series.
- When using multiple energy date pickers on a single dashboard, provide the appropriate `collection_key` so the card links to the correct selection.
- Combine `multiply` and `add` to convert units (e.g. Wh to kWh) without the need for extra template sensors.

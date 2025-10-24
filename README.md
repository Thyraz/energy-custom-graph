# Energy Custom Graph

Energy Custom Graph is a lightweight Lovelace card that plugs straight into Home Assistant's energy date picker. It reuses the built-in ECharts instance shipped with Home Assistant, so you get native styling, minimal overhead, and a layout that mirrors the core energy cards.

Unlike the default `energy-usage-graph`, this card is not limited to the energy dashboard entities. Any long-term statistic available in the recorder can be visualised and combined, whether it comes from energy, climate, sensors, or custom integrations. Each series can pick the statistic type (`change`, `sum`, `mean`, `min`, `max`, `state`) and presentation style so you always see the numbers you care about.

## Key Features

- Drops into dashboards that already use the Home Assistant energy date picker (`energy-date-selection`) for instant period syncing.
- Supports any entity that exposes long-term statistics, not only energy sources.
- Shares the core energy colour palette and styling so mixed dashboards look consistent.
- Uses Home Assistant's bundled ECharts runtime – no extra frameworks are loaded.
- Per-series control over aggregation statistic, chart type (bar or line), stacking, colour, unit scaling, and offsets.
- Optional fill-between-rendering for line series to highlight the space between two signals.
- Optional manual period selection (fixed ranges or relative day/week/month/year offsets) when you do not want to use the energy picker.

## Installation

### HACS (recommended)

1. Ensure [HACS](https://hacs.xyz) is installed and configured.
2. In HACS, open **Frontend → Explore & Download Repositories**.
3. Search for **Energy Custom Graph**, select it, and choose **Download**.
4. After installation, reload your browser or press "Reload resources" in Lovelace.

> The HACS listing tracks this GitHub repository, so updates remain in sync automatically.

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
energy_date_selection: true
series:
  - statistic_id: sensor.energy_grid_import
  - statistic_id: sensor.energy_grid_export
    stat_type: change
    chart_type: line
    area: true
```

The card supports the energy date picker out of the box. Place an `energy-date-selection` control on the same view, set `energy_date_selection: true` (which is the default), and the card will mirror the currently selected range. If you prefer manual control, set the flag to `false` and configure the `period` section instead.

## Configuration Reference

The card automatically selects the recorder statistics period (5-minute, hourly, daily, or monthly) based on the chosen timeframe so every series shares aligned buckets.

### Card options

| Key | Type | Default | Description |
| --- | ---- | ------- | ----------- |
| `type` | string | – | Must be `custom:energy-custom-graph-card`. |
| `title` | string | – | Optional card header. |
| `series` | list | – | One or more series definitions (see below). |
| `period` | object | `{mode: energy}` | Controls the aggregation window when not driven by the energy picker. |
| `energy_date_selection` | boolean | `false` | Subscribe to the global energy date picker on the dashboard. |
| `collection_key` | string | – | Custom key when multiple energy date pickers are present; matches Home Assistant's energy collections. |
| `chart_height` | string | – | CSS height (e.g. `300px`, `20rem`). |
| `color_cycle` | list | – | Custom palette of CSS variables or colours applied cyclically to series. |
| `legend_sort` | `"asc"`, `"desc"`, `"none"` | `"none"` | Sort order for the legend entries. |
| `hide_legend` | boolean | `false` | Hide the legend entirely. |
| `expand_legend` | boolean | `false` | Expand the legend by default. |
| `fit_y_data` | boolean | `false` | Fit the primary Y axis tightly to its data. |
| `logarithmic_scale` | boolean | `false` | Use logarithmic scaling on the primary Y axis. |
| `y_axes` | list | – | Additional axis overrides (see below). |
| `tooltip_precision` | number | – | Override numeric precision in the tooltip. |
| `show_unit` | boolean | `true` | Show units derived from statistics metadata (per series) in tooltips and axes. |

### `series` options

| Key | Type | Default | Description |
| --- | ---- | ------- | ----------- |
| `statistic_id` | string | – | Required recorder statistic identifier (`sensor.entity_id` etc.). |
| `name` | string | entity name | Display name shown in tooltip and legend. |
| `stat_type` | `"change"`, `"sum"`, `"mean"`, `"min"`, `"max"`, `"state"` | `"change"` | Statistic sampled from Home Assistant. |
| `chart_type` | `"bar"`, `"line"` | `"bar"` | Presentation type. |
| `area` | boolean | `false` | Fill the area underneath line charts. |
| `stack` | string | – | Stack key for combining series; identical keys stack together. |
| `stack_strategy` | `"all"`, `"samesign"` | `"all"` | ECharts stacking behaviour. |
| `color` | string | palette order | Specific colour (hex, rgb, CSS variable). |
| `y_axis` | `"left"`, `"right"` | `"left"` | Axis assignment. |
| `show_legend` | boolean | `true` | Hide or show this series in the legend. |
| `multiply` | number | `1` | Apply a multiplier to the statistic value. |
| `add` | number | `0` | Apply an additive offset after multiplication. |
| `smooth` | boolean or number | `true` | Control line smoothing. Use `false` to disable, or a value between 0 and 1 to tune the spline tightness. |
| `fill_to_series` | string | – | For line charts only: name of another line series to fill towards. Both series must avoid stacking. |

#### Fill between line series

Set `fill_to_series` on a line series to shade the area between it and another line. The value must match the `name` of the target series. Requirements:

- Both series must be rendered as lines (no bars) and must not use `stack`.
- The referenced `name` has to be unique within the card.
- When the upper series drops below the lower one, the card clamps the fill to zero and logs a warning so you can inspect the data.

### `y_axes` options

| Key | Type | Default | Description |
| --- | ---- | ------- | ----------- |
| `id` | `"left"`, `"right"` | – | Axis selector to override (`left` is primary). |
| `min` | number | auto | Minimum axis value. |
| `max` | number | auto | Maximum axis value. |
| `fit_y_data` | boolean | `false` | Force this axis to fit its data range. |
| `logarithmic_scale` | boolean | `false` | Apply log scaling to this axis only. |
| `unit` | string | metadata | Override unit label for this axis. |

### `period` modes

| Mode | Description |
| ---- | ----------- |
| `energy` | Follows the energy date picker when enabled; otherwise falls back to the current day. |
| `relative` | Uses the energy range (or a default period) and offsets it by whole day, week, month, or year steps. |
| `fixed` | Static timestamps for start/end (ISO strings). Useful for fixed comparison dashboards or snapshots. |

#### Relative period options

| Key | Type | Default | Description |
| --- | ---- | ------- | ----------- |
| `unit` | `"day"`, `"week"`, `"month"`, `"year"` | – | Step size applied when calculating offsets. |
| `offset` | number | `0` | Number of steps to shift the base range (negative for past periods). |

## Examples

### 1. Mirror the energy dashboard

```yaml
type: custom:energy-custom-graph-card
title: Daily energy breakdown
energy_date_selection: true
series:
  - statistic_id: sensor.grid_import_kwh
    name: Grid import
    stat_type: change
  - statistic_id: sensor.solar_yield_kwh
    name: Solar production
    stat_type: change
    stack: solar
  - statistic_id: sensor.home_consumption_kwh
    name: Consumption
    stat_type: sum
```

### 2. Manual fixed window with dual axes

```yaml
type: custom:energy-custom-graph-card
title: Heating performance snapshot
energy_date_selection: false
period:
  mode: fixed
  start: 2024-01-01T00:00:00Z
  end: 2024-01-08T00:00:00Z
y_axes:
  - id: left
    unit: kWh
  - id: right
    unit: °C
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

### 3. Shift the period for a previous year view

```yaml
type: custom:energy-custom-graph-card
title: Solar production (last year)
energy_date_selection: false
period:
  mode: relative
  unit: year
  offset: -1
series:
  - statistic_id: sensor.solar_total_energy
    name: Solar production
    stat_type: change
```

### 4. Fill the range between minimum and maximum

```yaml
type: custom:energy-custom-graph-card
title: Outdoor temperature band
energy_date_selection: true
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

## Tips

- Ensure recorder and long-term statistics are enabled for every entity you plan to plot.
- Use the relative period mode with positive or negative offsets to jump by whole days, weeks, months, or years.
- When using `fill_to_series`, keep `name` values unique and avoid stacking on the involved series.
- When using multiple energy date pickers on a single dashboard, provide the appropriate `collection_key` so the card links to the correct selection.
- Combine `multiply` and `add` to convert units (e.g. Wh to kWh) without creating extra template sensors.

## Support

If you encounter issues or have feature requests, open an issue or pull request on the repository. Contributions that expand documentation, add new configuration helpers, or improve parity with core energy cards are always welcome.

import type { LovelaceCardConfig } from "custom-card-helpers";
import type { StatisticsPeriod } from "./data/statistics";

export type EnergyCustomGraphChartType = "bar" | "line" | "step";

export type EnergyCustomGraphStatisticType =
  | "change"
  | "sum"
  | "mean"
  | "min"
  | "max"
  | "state";

export type EnergyCustomGraphCalculationOperation =
  | "add"
  | "subtract"
  | "multiply"
  | "divide";

export type EnergyCustomGraphHeaderReducer =
  | "sum"
  | "mean"
  | "min"
  | "max"
  | "first"
  | "last";

export type EnergyCustomGraphHeaderStackSign =
  | "signed"
  | "positive"
  | "negative"
  | "absolute";

export interface EnergyCustomGraphHeaderMetricTransform {
  multiply?: number;
  add?: number;
  clip_min?: number;
  clip_max?: number;
}

export interface EnergyCustomGraphCalculationTerm {
  statistic_id?: string;
  stat_type?: EnergyCustomGraphStatisticType;
  multiply?: number;
  add?: number;
  operation?: EnergyCustomGraphCalculationOperation;
  constant?: number;
  clip_min?: number;
  clip_max?: number;
}

export interface EnergyCustomGraphCalculationConfig {
  terms: EnergyCustomGraphCalculationTerm[];
  initial_value?: number;
  unit?: string | null;
}

export type EnergyCustomGraphSeriesSource = "statistic" | "calculation" | "forecast";

export type EnergyCustomGraphTimeOffsetUnit =
  | "hour"
  | "day"
  | "week"
  | "month"
  | "year";

export interface EnergyCustomGraphTimeOffsetConfig {
  value: number;
  unit: EnergyCustomGraphTimeOffsetUnit;
}

export interface EnergyCustomGraphSeriesConfig {
  id?: string;
  source?: EnergyCustomGraphSeriesSource;
  statistic_id?: string;
  name?: string;
  stat_type?: EnergyCustomGraphStatisticType;
  chart_type?: EnergyCustomGraphChartType;
  fill?: boolean;
  stack?: string;
  color?: string;
  compare_color?: string;
  y_axis?: "left" | "right";
  show_in_legend?: boolean;
  show_in_tooltip?: boolean;
  show_value_labels?: boolean;
  value_label_precision?: number;
  show_in_chart?: boolean;
  hidden_by_default?: boolean;
  multiply?: number;
  add?: number;
  smooth?: boolean | number;
  line_opacity?: number;
  line_width?: number;
  line_style?: "solid" | "dashed" | "dotted";
  fill_opacity?: number;
  gradient_fill?: boolean;
  fill_to_series?: string;
  calculation?: EnergyCustomGraphCalculationConfig;
  clip_min?: number;
  clip_max?: number;
  time_offset?: EnergyCustomGraphTimeOffsetConfig;
  pv_production_entity?: string;
}

export interface EnergyCustomGraphHeaderSeriesMetricConfig
  extends EnergyCustomGraphHeaderMetricTransform {
  source: "series";
  series_id?: string;
  reducer?: EnergyCustomGraphHeaderReducer;
}

export interface EnergyCustomGraphHeaderStackMetricConfig
  extends EnergyCustomGraphHeaderMetricTransform {
  source: "stack";
  stack?: string;
  reducer?: EnergyCustomGraphHeaderReducer;
  sign?: EnergyCustomGraphHeaderStackSign;
}

export interface EnergyCustomGraphHeaderEntityStateMetricConfig
  extends EnergyCustomGraphHeaderMetricTransform {
  source: "entity_state";
  entity_id?: string;
}

export interface EnergyCustomGraphHeaderConstantMetricConfig
  extends EnergyCustomGraphHeaderMetricTransform {
  source: "constant";
  constant?: number;
}

export type EnergyCustomGraphHeaderMetricInputConfig =
  | EnergyCustomGraphHeaderSeriesMetricConfig
  | EnergyCustomGraphHeaderStackMetricConfig
  | EnergyCustomGraphHeaderEntityStateMetricConfig;

export type EnergyCustomGraphHeaderCalculationTermConfig =
  (
    | EnergyCustomGraphHeaderMetricInputConfig
    | EnergyCustomGraphHeaderConstantMetricConfig
  ) & {
    operation?: EnergyCustomGraphCalculationOperation;
  };

export interface EnergyCustomGraphHeaderCalculationConfig {
  terms: EnergyCustomGraphHeaderCalculationTermConfig[];
  initial_value?: number;
}

export interface EnergyCustomGraphHeaderCalculationMetricConfig
  extends EnergyCustomGraphHeaderMetricTransform {
  calculation: EnergyCustomGraphHeaderCalculationConfig;
}

export type EnergyCustomGraphHeaderMetricConfig =
  | EnergyCustomGraphHeaderMetricInputConfig
  | EnergyCustomGraphHeaderCalculationMetricConfig;

export interface EnergyCustomGraphHeaderChipConfig {
  label?: string;
  unit?: string | null;
  precision?: number;
  metric?: EnergyCustomGraphHeaderMetricConfig;
}

export interface EnergyCustomGraphHeaderConfig {
  chip?: EnergyCustomGraphHeaderChipConfig;
}

export interface EnergyCustomGraphRawOptions {
  significant_changes_only?: boolean;
}

export type EnergyCustomGraphAggregationTarget =
  | StatisticsPeriod
  | "raw"
  | "disabled";

export interface EnergyCustomGraphAggregationConfig {
  manual?: EnergyCustomGraphAggregationTarget;
  fallback?: EnergyCustomGraphAggregationTarget;
  energy_picker?: Partial<
    Record<"hour" | "day" | "week" | "month" | "year", EnergyCustomGraphAggregationTarget>
  >;
  raw_options?: EnergyCustomGraphRawOptions;
  compute_current_hour?: boolean;
}

export type EnergyCustomGraphRelativeCalendarPeriod =
  | "hour"
  | "day"
  | "week"
  | "month"
  | "year";

export type EnergyCustomGraphRelativeRollingPeriod =
  | "last_60_minutes"
  | "last_24_hours"
  | "last_7_days"
  | "last_30_days"
  | "last_12_months";

export type EnergyCustomGraphRelativePeriod =
  | EnergyCustomGraphRelativeCalendarPeriod
  | EnergyCustomGraphRelativeRollingPeriod;

export type EnergyCustomGraphTimespanConfig =
  | { mode: "energy" }
  | {
      mode: "relative";
      period: EnergyCustomGraphRelativePeriod;
      offset?: number;
      count?: number;
    }
  | {
      mode: "fixed";
      start?: string;
      end?: string;
    };

export interface EnergyCustomGraphAxisConfig {
  id: "left" | "right";
  min?: number;
  max?: number;
  fit_y_data?: boolean;
  center_zero?: boolean;
  logarithmic_scale?: boolean;
  unit?: string;
}

export interface EnergyCustomGraphCardConfig extends LovelaceCardConfig {
  type: string;
  title?: string;
  timespan?: EnergyCustomGraphTimespanConfig;
  series: EnergyCustomGraphSeriesConfig[];
  chart_height?: string;
  hide_legend?: boolean;
  expand_legend?: boolean;
  color_cycle?: string[];
  legend_sort?: "asc" | "desc" | "none";
  collection_key?: string;
  allow_compare?: boolean;
  header?: EnergyCustomGraphHeaderConfig;
  y_axes?: EnergyCustomGraphAxisConfig[];
  show_tooltip?: boolean;
  show_x_axis_pointer?: boolean;
  show_y_axis_pointer?: boolean;
  tooltip_precision?: number;
  show_unit?: boolean;
  aggregation?: EnergyCustomGraphAggregationConfig;
  show_stack_sums?: boolean;
}

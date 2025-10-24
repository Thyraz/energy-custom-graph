import type { LovelaceCardConfig } from "custom-card-helpers";

export type EnergyCustomGraphChartType = "bar" | "line";

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

export interface EnergyCustomGraphSeriesConfig {
  statistic_id?: string;
  name?: string;
  stat_type?: EnergyCustomGraphStatisticType;
  chart_type?: EnergyCustomGraphChartType;
  fill?: boolean;
  stack?: string;
  stack_strategy?: "all" | "samesign";
  color?: string;
  y_axis?: "left" | "right";
  show_legend?: boolean;
  multiply?: number;
  add?: number;
  smooth?: boolean | number;
  line_opacity?: number;
  fill_opacity?: number;
  fill_to_series?: string;
  calculation?: EnergyCustomGraphCalculationConfig;
  clip_min?: number;
  clip_max?: number;
}

export type EnergyCustomGraphPeriodConfig =
  | { mode: "energy" }
  | {
      mode: "relative";
      unit: "day" | "week" | "month" | "year";
      offset?: number;
    }
  | {
      mode: "fixed";
      start: string;
      end?: string;
    };

export interface EnergyCustomGraphAxisConfig {
  id: "left" | "right";
  min?: number;
  max?: number;
  fit_y_data?: boolean;
  logarithmic_scale?: boolean;
  unit?: string;
}

export interface EnergyCustomGraphCardConfig extends LovelaceCardConfig {
  type: string;
  title?: string;
  period?: EnergyCustomGraphPeriodConfig;
  series: EnergyCustomGraphSeriesConfig[];
  chart_height?: string;
  hide_legend?: boolean;
  expand_legend?: boolean;
  fit_y_data?: boolean;
  logarithmic_scale?: boolean;
  color_cycle?: string[];
  legend_sort?: "asc" | "desc" | "none";
  energy_date_selection?: boolean;
  collection_key?: string;
  y_axes?: EnergyCustomGraphAxisConfig[];
  tooltip_precision?: number;
  show_unit?: boolean;
}

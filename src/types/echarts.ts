export interface BaseSeriesOption {
  id?: string;
  name?: string;
  type: "line" | "bar";
  data?: Array<any>;
  z?: number;
  stack?: string;
  stackStrategy?: "all" | "samesign";
  yAxisIndex?: number;
  emphasis?: Record<string, unknown>;
  itemStyle?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface LineSeriesOption extends BaseSeriesOption {
  type: "line";
  smooth?: boolean | number;
  step?: boolean | "start" | "middle" | "end";
  areaStyle?: Record<string, unknown>;
  lineStyle?: Record<string, unknown>;
}

export interface BarSeriesOption extends BaseSeriesOption {
  type: "bar";
  barMaxWidth?: number;
}

export type SeriesOption = LineSeriesOption | BarSeriesOption;

export interface TooltipOption {
  formatter?: (params: unknown) => string;
  trigger?: string;
  appendTo?: HTMLElement | Document | string;
  [key: string]: unknown;
}

export interface LegendDataEntry {
  id?: string;
  name: string;
  secondaryIds?: string[];
  itemStyle?: Record<string, unknown>;
  hidden?: boolean;
}

export interface LegendOption {
  type?: string;
  data?: LegendDataEntry[];
  show?: boolean;
  selected?: Record<string, boolean>;
  [key: string]: unknown;
}

export interface YAxisOption {
  type?: "value" | "log";
  name?: string;
  nameGap?: number;
  nameTextStyle?: Record<string, unknown>;
  position?: "left" | "right";
  min?: number | ((values: { min: number }) => number);
  max?: number | ((values: { max: number }) => number);
  axisLabel?: Record<string, unknown>;
  splitLine?: Record<string, unknown>;
  scale?: boolean;
  [key: string]: unknown;
}

export interface XAxisOption {
  id?: string;
  type?: "time" | "category" | "value";
  min?: Date | number;
  max?: Date | number;
  show?: boolean;
  [key: string]: unknown;
}

export interface GridOption {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  containLabel?: boolean;
  [key: string]: unknown;
}

export interface ECOption {
  series?: SeriesOption[];
  tooltip?: TooltipOption;
  legend?: LegendOption;
  xAxis?: XAxisOption | XAxisOption[];
  yAxis?: YAxisOption | YAxisOption[];
  grid?: GridOption;
  [key: string]: unknown;
}

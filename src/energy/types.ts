export type Statistics = Record<string, StatisticValue[]>;

export interface StatisticValue {
  start: number;
  end: number;
  change?: number | null;
  last_reset?: number | null;
  max?: number | null;
  mean?: number | null;
  min?: number | null;
  sum?: number | null;
  state?: number | null;
}

export interface StatisticsMetaData {
  statistics_unit_of_measurement: string | null;
  statistic_id: string;
  source: string;
  name?: string | null;
  has_sum: boolean;
  mean_type: number;
  unit_class: string | null;
}

export interface StatisticsUnitConfiguration {
  energy?: "Wh" | "kWh" | "MWh" | "GJ";
  power?: "W" | "kW";
  pressure?:
    | "Pa"
    | "hPa"
    | "kPa"
    | "bar"
    | "cbar"
    | "mbar"
    | "inHg"
    | "psi"
    | "mmHg";
  temperature?: "°C" | "°F" | "K";
  volume?: (typeof VOLUME_UNITS)[number];
}

export const VOLUME_UNITS = ["L", "gal", "ft³", "m³", "CCF", "MCF"] as const;

export type EnergySourceType =
  | "solar"
  | "grid"
  | "battery"
  | "gas"
  | "water";

export interface FlowFromGridSourceEnergyPreference {
  stat_energy_from: string;
  stat_cost: string | null;
  entity_energy_price: string | null;
  number_energy_price: number | null;
}

export interface FlowToGridSourceEnergyPreference {
  stat_energy_to: string;
  stat_compensation: string | null;
  entity_energy_price: string | null;
  number_energy_price: number | null;
}

export interface GridSourceTypeEnergyPreference {
  type: "grid";
  flow_from: FlowFromGridSourceEnergyPreference[];
  flow_to: FlowToGridSourceEnergyPreference[];
  cost_adjustment_day: number;
}

export interface SolarSourceTypeEnergyPreference {
  type: "solar";
  stat_energy_from: string;
  config_entry_solar_forecast: string[] | null;
}

export interface BatterySourceTypeEnergyPreference {
  type: "battery";
  stat_energy_from: string;
  stat_energy_to: string;
}

export interface GasSourceTypeEnergyPreference {
  type: "gas";
  stat_energy_from: string;
  stat_cost: string | null;
  entity_energy_price: string | null;
  number_energy_price: number | null;
  unit_of_measurement?: string | null;
}

export interface WaterSourceTypeEnergyPreference {
  type: "water";
  stat_energy_from: string;
  stat_cost: string | null;
  entity_energy_price: string | null;
  number_energy_price: number | null;
  unit_of_measurement?: string | null;
}

export type EnergySource =
  | SolarSourceTypeEnergyPreference
  | GridSourceTypeEnergyPreference
  | BatterySourceTypeEnergyPreference
  | GasSourceTypeEnergyPreference
  | WaterSourceTypeEnergyPreference;

export interface DeviceConsumptionEnergyPreference {
  stat_consumption: string;
  name?: string;
  included_in_stat?: string;
}

export interface EnergyPreferences {
  energy_sources: EnergySource[];
  device_consumption: DeviceConsumptionEnergyPreference[];
}

export interface EnergyInfo {
  cost_sensors: Record<string, string>;
  solar_forecast_domains: string[];
}

export interface EnergyData {
  start: Date;
  end?: Date;
  startCompare?: Date;
  endCompare?: Date;
  compareMode?: CompareMode;
  prefs: EnergyPreferences;
  info: EnergyInfo;
  stats: Statistics;
  statsMetadata: Record<string, StatisticsMetaData>;
  statsCompare?: Statistics;
  waterUnit: string;
  gasUnit: string;
  co2SignalEntity?: string;
  fossilEnergyConsumption?: FossilEnergyConsumption;
  fossilEnergyConsumptionCompare?: FossilEnergyConsumption;
}

export const enum CompareMode {
  NONE = "",
  PREVIOUS = "previous",
  YOY = "yoy",
}

export type FossilEnergyConsumption = Record<string, number>;

export interface EnergySumDataTotals {
  to_grid?: number;
  from_grid?: number;
  to_battery?: number;
  from_battery?: number;
  solar?: number;
}

export interface EnergySumData {
  to_grid?: Record<number, number>;
  from_grid?: Record<number, number>;
  to_battery?: Record<number, number>;
  from_battery?: Record<number, number>;
  solar?: Record<number, number>;
  timestamps: number[];
  total: EnergySumDataTotals;
}

export interface EnergyConsumptionTotals {
  used_total: number;
  grid_to_battery: number;
  battery_to_grid: number;
  solar_to_battery: number;
  solar_to_grid: number;
  used_solar: number;
  used_grid: number;
  used_battery: number;
}

export interface EnergyConsumptionData {
  used_total: Record<number, number>;
  grid_to_battery: Record<number, number>;
  battery_to_grid: Record<number, number>;
  solar_to_battery: Record<number, number>;
  solar_to_grid: Record<number, number>;
  used_solar: Record<number, number>;
  used_grid: Record<number, number>;
  used_battery: Record<number, number>;
  total: EnergyConsumptionTotals;
}

export interface EnergyDataCollectionConfig {
  key?: string;
}


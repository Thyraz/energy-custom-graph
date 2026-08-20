import type { StatisticsMetaData } from "./data/statistics";
import type {
  EnergyCustomGraphAggregationConfig,
  EnergyCustomGraphAggregationTarget,
  EnergyCustomGraphCalculationTerm,
  EnergyCustomGraphSeriesConfig,
  EnergyCustomGraphSeriesSource,
  EnergyCustomGraphStatisticType,
} from "./types";

export type EditorHintSeverity = "info" | "warning" | "error";

export type StatisticSourceStatus =
  | "empty"
  | "loading"
  | "entity"
  | "raw_only"
  | "external_statistic"
  | "unknown";

export interface EditorIssue {
  severity: EditorHintSeverity;
  cause: string;
  action?: string;
}

export interface StatisticSourceResolution {
  status: StatisticSourceStatus;
  metadata?: StatisticsMetaData;
}

const hasMeanStatistics = (metadata: StatisticsMetaData): boolean => {
  const legacyHasMean = (metadata as StatisticsMetaData & { has_mean?: unknown })
    .has_mean;
  if (typeof metadata.mean_type === "number") {
    return metadata.mean_type !== 0;
  }
  return Boolean(legacyHasMean);
};

export const normalizeStatisticId = (statisticId: string | undefined): string =>
  statisticId?.trim() ?? "";

export const aggregationUsesRaw = (
  aggregation: EnergyCustomGraphAggregationConfig | undefined
): boolean => {
  if (!aggregation) {
    return false;
  }
  if (aggregation.manual === "raw" || aggregation.fallback === "raw") {
    return true;
  }
  if (aggregation.energy_picker) {
    return Object.values(aggregation.energy_picker).some((value) => value === "raw");
  }
  return false;
};

export const formatAggregationTarget = (
  value: EnergyCustomGraphAggregationTarget
): string => {
  switch (value) {
    case "5minute":
      return "5 minute";
    case "hour":
      return "Hour";
    case "day":
      return "Day";
    case "week":
      return "Week";
    case "month":
      return "Month";
    case "year":
      return "Year";
    case "raw":
      return "RAW history";
    case "disabled":
      return "Disabled";
  }
};

export const isStatisticTypeSupported = (
  metadata: StatisticsMetaData | undefined,
  statType: EnergyCustomGraphStatisticType
): boolean => {
  if (!metadata) {
    return false;
  }
  if (statType === "change" || statType === "sum") {
    return metadata.has_sum === true;
  }
  if (statType === "mean" || statType === "min" || statType === "max") {
    return hasMeanStatistics(metadata);
  }
  return true;
};

export const selectDefaultStatisticType = (
  metadata: StatisticsMetaData | undefined
): EnergyCustomGraphStatisticType | undefined => {
  if (!metadata) {
    return undefined;
  }
  if (metadata.has_sum) {
    return "change";
  }
  if (hasMeanStatistics(metadata)) {
    return "mean";
  }
  return "state";
};

export const resolveStatisticSourceStatus = ({
  statisticId,
  hasEntity,
  metadata,
  metadataLoaded,
}: {
  statisticId: string | undefined;
  hasEntity: boolean;
  metadata?: StatisticsMetaData;
  metadataLoaded: boolean;
}): StatisticSourceResolution => {
  const id = normalizeStatisticId(statisticId);
  if (!id) {
    return { status: "empty" };
  }
  if (!metadataLoaded) {
    return { status: "loading" };
  }
  if (metadata && hasEntity) {
    return { status: "entity", metadata };
  }
  if (metadata) {
    return { status: "external_statistic", metadata };
  }
  if (hasEntity) {
    return { status: "raw_only" };
  }
  return { status: "unknown" };
};

export const getStatisticSourceStatusLabel = (
  status: StatisticSourceStatus
): string => {
  switch (status) {
    case "entity":
      return "Entity";
    case "raw_only":
      return "Raw only";
    case "external_statistic":
      return "External statistic";
    case "unknown":
      return "Unknown entity";
    case "loading":
      return "Checking";
    case "empty":
      return "No entity";
  }
};

export const getStatisticSourceIssue = ({
  status,
  usesRaw,
  metadata,
  statType,
}: {
  status: StatisticSourceStatus;
  usesRaw: boolean;
  metadata?: StatisticsMetaData;
  statType?: EnergyCustomGraphStatisticType;
}): EditorIssue | undefined => {
  if (status === "unknown") {
    return {
      severity: "warning",
      cause: "Unknown entity",
      action: "Check the ID",
    };
  }
  if (status === "raw_only" && !usesRaw) {
    return {
      severity: "warning",
      cause: "Entity has no aggregated statistics",
      action: "Enable RAW history",
    };
  }
  if (
    metadata &&
    statType &&
    !isStatisticTypeSupported(metadata, statType)
  ) {
    return {
      severity: "warning",
      cause: "Unsupported statistic type",
      action: "Choose a supported type",
    };
  }
  return undefined;
};

export const resolveSeriesSource = (
  series: EnergyCustomGraphSeriesConfig
): EnergyCustomGraphSeriesSource => {
  if (series.source) {
    return series.source;
  }
  if (series.calculation) {
    return "calculation";
  }
  return "statistic";
};

export const seriesHasTimeOffset = (
  series: EnergyCustomGraphSeriesConfig
): boolean =>
  typeof series.time_offset?.value === "number" &&
  Number.isFinite(series.time_offset.value) &&
  series.time_offset.value !== 0;

export const cloneSeriesForDuplicate = (
  series: EnergyCustomGraphSeriesConfig
): EnergyCustomGraphSeriesConfig => {
  const duplicate: EnergyCustomGraphSeriesConfig = {
    ...series,
    id: undefined,
    time_offset: series.time_offset ? { ...series.time_offset } : undefined,
    calculation: series.calculation
      ? {
          ...series.calculation,
          terms: (series.calculation.terms ?? []).map((term) => ({ ...term })),
        }
      : undefined,
  };

  if (series.name && series.name.trim().length) {
    duplicate.name = `${series.name.trim()} copy`;
  } else {
    delete duplicate.name;
  }

  return duplicate;
};

export const convertSeriesToCalculation = (
  series: EnergyCustomGraphSeriesConfig
): EnergyCustomGraphSeriesConfig => {
  const statisticId = normalizeStatisticId(series.statistic_id);
  const initialTerms: EnergyCustomGraphCalculationTerm[] = statisticId
    ? [
        {
          operation: "add",
          statistic_id: statisticId,
          stat_type: series.stat_type,
        },
      ]
    : [];
  const calculation = series.calculation ?? { terms: initialTerms };
  const next: EnergyCustomGraphSeriesConfig = {
    ...series,
    source: "calculation",
    calculation: {
      ...calculation,
      terms: (calculation.terms ?? []).map((term) => ({ ...term })),
    },
  };
  delete next.statistic_id;
  delete next.stat_type;
  delete next.pv_production_entity;
  return next;
};

export const convertSeriesToStatistic = (
  series: EnergyCustomGraphSeriesConfig
): EnergyCustomGraphSeriesConfig => {
  const terms = series.calculation?.terms ?? [];
  const soleEntityTerm =
    terms.length === 1 &&
    normalizeStatisticId(terms[0].statistic_id) &&
    terms[0].constant === undefined
      ? terms[0]
      : undefined;
  const next: EnergyCustomGraphSeriesConfig = { ...series };
  delete next.source;
  delete next.calculation;
  delete next.pv_production_entity;
  if (soleEntityTerm?.statistic_id) {
    next.statistic_id = soleEntityTerm.statistic_id.trim();
    next.stat_type = soleEntityTerm.stat_type;
  } else if (!normalizeStatisticId(next.statistic_id)) {
    next.statistic_id = "";
    delete next.stat_type;
  }
  return next;
};

export const cleanSeriesForForecast = (
  series: EnergyCustomGraphSeriesConfig
): EnergyCustomGraphSeriesConfig => {
  const next: EnergyCustomGraphSeriesConfig = {
    ...series,
    source: "forecast",
  };
  delete next.statistic_id;
  delete next.stat_type;
  delete next.calculation;
  delete next.time_offset;
  return next;
};

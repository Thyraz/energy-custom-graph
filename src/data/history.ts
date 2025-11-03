import type { HomeAssistant } from "custom-card-helpers";
import type { Statistics, StatisticValue } from "./statistics";

interface EntityHistoryState {
  s: string;
  a?: Record<string, unknown>;
  lc?: number;
  lu: number;
}

export type HistoryStates = Record<string, EntityHistoryState[]>;

export interface FetchRawHistoryOptions {
  significant_changes_only?: boolean;
}

const BINARY_STATE_MAP: Record<string, number> = {
  on: 1,
  open: 1,
  "opening": 1,
  true: 1,
  off: 0,
  closed: 0,
  closing: 0,
  false: 0,
};

const normalizeTimestamp = (value?: number): number | undefined =>
  typeof value === "number" ? Math.round(value * 1000) : undefined;

const normalizeStateValue = (raw: string): number | null => {
  const key = raw.trim().toLowerCase();
  if (key in BINARY_STATE_MAP) {
    return BINARY_STATE_MAP[key];
  }

  if (key === "" || key === "unknown" || key === "unavailable") {
    return null;
  }

  const numeric = Number(raw);
  return Number.isFinite(numeric) ? numeric : null;
};

export const fetchRawHistoryStates = (
  hass: HomeAssistant,
  startTime: Date,
  endTime: Date | undefined,
  entityIds: string[],
  options?: FetchRawHistoryOptions
) => {
  const payload: {
    type: "history/history_during_period";
    start_time: string;
    end_time?: string;
    minimal_response: true;
    no_attributes: true;
    significant_changes_only?: boolean;
    entity_ids?: string[];
  } = {
    type: "history/history_during_period",
    start_time: startTime.toISOString(),
    minimal_response: true,
    no_attributes: true,
  };

  if (endTime) {
    payload.end_time = endTime.toISOString();
  }

  if (options?.significant_changes_only !== undefined) {
    payload.significant_changes_only = options.significant_changes_only;
  }

  if (entityIds.length) {
    payload.entity_ids = entityIds;
  }

  return hass.callWS<HistoryStates>(payload);
};

export const historyStatesToStatistics = (
  history: HistoryStates
): Statistics => {
  const statistics: Statistics = {};

  Object.entries(history).forEach(([entityId, states]) => {
    if (!Array.isArray(states) || states.length === 0) {
      statistics[entityId] = [];
      return;
    }

    const sorted = [...states].sort((a, b) => {
      const aTs = (a.lc ?? a.lu) ?? 0;
      const bTs = (b.lc ?? b.lu) ?? 0;
      return aTs - bTs;
    });

    const warnedStates = new Set<string>();
    const values: StatisticValue[] = sorted.map((entry) => {
      const timestamp = normalizeTimestamp(entry.lc ?? entry.lu);
      const numeric = normalizeStateValue(entry.s);
      const normalizedState = entry.s.trim().toLowerCase();

      if (
        numeric === null &&
        normalizedState !== "" &&
        normalizedState !== "unknown" &&
        normalizedState !== "unavailable" &&
        !warnedStates.has(normalizedState)
      ) {
        console.warn(
          `[energy-custom-graph-card] RAW history for "${entityId}" contains non-numeric state "${entry.s}". Rendering as empty.`
        );
        warnedStates.add(normalizedState);
      }

      const resolvedTimestamp = timestamp ?? Date.now();

      return {
        start: resolvedTimestamp,
        end: resolvedTimestamp,
        change: numeric,
        sum: numeric,
        mean: numeric,
        min: numeric,
        max: numeric,
        state: numeric,
      };
    });

    statistics[entityId] = values;
  });

  return statistics;
};

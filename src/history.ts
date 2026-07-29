import type { HassEntity, HistoryPoint, HomeAssistant } from "./types";
import { numericAttribute, numericState } from "./values";

type HistoryResponse = HassEntity[][];

const BUCKET_COUNT = 25;

function seriesByEntity(
  response: HistoryResponse,
  entityId: string
): HassEntity[] {
  return (
    response.find((series) => series.some((state) => state.entity_id === entityId)) ??
    []
  );
}

function timeOf(state: HassEntity): number {
  return Date.parse(state.last_changed ?? state.last_updated ?? "");
}

function valueAt(
  series: HassEntity[],
  timestamp: number,
  valueFor: (state: HassEntity) => number | undefined
): number | undefined {
  if (series.length === 0) return undefined;

  let before = series[0];
  let after = series.at(-1) ?? series[0];

  for (const state of series) {
    const stateTime = timeOf(state);
    if (!Number.isFinite(stateTime)) continue;
    if (stateTime <= timestamp) before = state;
    if (stateTime >= timestamp) {
      after = state;
      break;
    }
  }

  const beforeValue = valueFor(before);
  const afterValue = valueFor(after);
  if (beforeValue === undefined) return afterValue;
  if (afterValue === undefined) return beforeValue;

  const beforeTime = timeOf(before);
  const afterTime = timeOf(after);
  if (
    !Number.isFinite(beforeTime) ||
    !Number.isFinite(afterTime) ||
    beforeTime === afterTime
  ) {
    return beforeValue;
  }

  const progress = Math.min(
    1,
    Math.max(0, (timestamp - beforeTime) / (afterTime - beforeTime))
  );
  return beforeValue + (afterValue - beforeValue) * progress;
}

export async function fetchClimateHistory(
  hass: HomeAssistant,
  climateEntityId: string,
  humidityEntityId: string | undefined,
  hours: number,
  now = new Date()
): Promise<HistoryPoint[]> {
  const end = now;
  const safeHours = Math.min(24, Math.max(1, hours));
  const start = new Date(end.getTime() - safeHours * 60 * 60 * 1000);
  const entityIds = Array.from(
    new Set([climateEntityId, humidityEntityId].filter(Boolean))
  ) as string[];
  const path =
    `history/period/${encodeURIComponent(start.toISOString())}` +
    `?end_time=${encodeURIComponent(end.toISOString())}` +
    `&filter_entity_id=${encodeURIComponent(entityIds.join(","))}` +
    "&significant_changes_only=0";

  const response = await hass.callApi<HistoryResponse>("GET", path);
  const climate = seriesByEntity(response, climateEntityId);
  const humidity = humidityEntityId
    ? seriesByEntity(response, humidityEntityId)
    : climate;

  return Array.from({ length: BUCKET_COUNT }, (_, index) => {
    const timestamp =
      start.getTime() +
      (index / (BUCKET_COUNT - 1)) * (end.getTime() - start.getTime());
    return {
      timestamp,
      temperature: valueAt(
        climate,
        timestamp,
        (state) => numericAttribute(state, "current_temperature")
      ),
      humidity: valueAt(
        humidity,
        timestamp,
        humidityEntityId
          ? (state) => numericState(state)
          : (state) => numericAttribute(state, "current_humidity")
      )
    };
  });
}

import type { HassEntity, HomeAssistant } from "./types";

const UNAVAILABLE_STATES = ["unknown", "unavailable", "none", ""];

export function entity(
  hass: HomeAssistant | undefined,
  entityId: string | undefined
): HassEntity | undefined {
  return entityId ? hass?.states[entityId] : undefined;
}

export function numericState(state: HassEntity | undefined): number | undefined {
  if (!state || UNAVAILABLE_STATES.includes(state.state.toLowerCase())) {
    return undefined;
  }
  const value = Number(state.state);
  return Number.isFinite(value) ? value : undefined;
}

export function numericAttribute(
  state: HassEntity | undefined,
  attribute: string
): number | undefined {
  const value = state?.attributes[attribute];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function currentTemperature(
  state: HassEntity | undefined
): number | undefined {
  return numericAttribute(state, "current_temperature");
}

export function targetTemperature(
  state: HassEntity | undefined
): number | undefined {
  return (
    numericAttribute(state, "temperature") ??
    numericAttribute(state, "target_temp_high") ??
    numericAttribute(state, "target_temp_low")
  );
}

export function currentHumidity(
  climate: HassEntity | undefined,
  humiditySensor?: HassEntity
): number | undefined {
  return (
    numericState(humiditySensor) ??
    numericAttribute(climate, "current_humidity") ??
    numericAttribute(climate, "humidity")
  );
}

export function temperatureUnit(
  hass: HomeAssistant | undefined,
  climate: HassEntity | undefined
): string {
  return (
    (climate?.attributes.temperature_unit as string | undefined) ??
    hass?.config?.unit_system?.temperature ??
    "°C"
  );
}

export function formatNumber(
  value: number | undefined,
  locale?: string,
  maximumFractionDigits = 0
): string {
  if (value === undefined || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(locale, { maximumFractionDigits }).format(value);
}

export function formatTemperature(
  value: number | undefined,
  unit: string,
  locale?: string,
  maximumFractionDigits = 1
): string {
  if (value === undefined) return "—";
  return `${formatNumber(value, locale, maximumFractionDigits)}${unit}`;
}

export function formatEntityValue(
  state: HassEntity | undefined,
  locale?: string,
  fallbackUnit = ""
): string {
  if (!state || UNAVAILABLE_STATES.includes(state.state.toLowerCase())) return "—";
  const numeric = Number(state.state);
  const unit = state.attributes.unit_of_measurement ?? fallbackUnit;
  if (Number.isFinite(numeric)) {
    const digits = Math.abs(numeric) < 10 ? 1 : 0;
    return `${formatNumber(numeric, locale, digits)}${unit ? ` ${unit}` : ""}`;
  }
  return state.state;
}

export function labelForOption(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

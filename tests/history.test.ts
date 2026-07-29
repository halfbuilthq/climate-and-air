import { describe, expect, it } from "vitest";
import { fetchClimateHistory } from "../src/history";
import type { HassEntity, HomeAssistant } from "../src/types";

describe("climate history", () => {
  it("interpolates temperature attributes and humidity sensor states", async () => {
    const start = new Date("2026-07-28T00:00:00.000Z");
    const end = new Date("2026-07-28T06:00:00.000Z");
    const climate = (time: Date, temperature: number): HassEntity => ({
      entity_id: "climate.room",
      state: "dry",
      last_changed: time.toISOString(),
      attributes: { current_temperature: temperature }
    });
    const humidity = (time: Date, value: number): HassEntity => ({
      entity_id: "sensor.room_humidity",
      state: String(value),
      last_changed: time.toISOString(),
      attributes: { unit_of_measurement: "%" }
    });
    const hass = {
      states: {},
      async callApi<T>() {
        return [
          [climate(start, 27), climate(end, 23)],
          [humidity(start, 76), humidity(end, 60)]
        ] as T;
      },
      async callService() {}
    } as HomeAssistant;

    const points = await fetchClimateHistory(
      hass,
      "climate.room",
      "sensor.room_humidity",
      6,
      end
    );
    expect(points).toHaveLength(25);
    expect(points[0]).toMatchObject({ temperature: 27, humidity: 76 });
    expect(points[12].temperature).toBeCloseTo(25);
    expect(points[12].humidity).toBeCloseTo(68);
    expect(points.at(-1)).toMatchObject({ temperature: 23, humidity: 60 });
  });

  it("ignores target humidity when no current humidity source exists", async () => {
    const now = new Date("2026-07-28T06:00:00.000Z");
    const climate: HassEntity = {
      entity_id: "climate.room",
      state: "cool",
      last_changed: now.toISOString(),
      attributes: {
        current_temperature: 23,
        humidity: 63
      }
    };
    const hass = {
      states: {},
      async callApi<T>() {
        return [[climate]] as T;
      },
      async callService() {}
    } as HomeAssistant;

    const points = await fetchClimateHistory(
      hass,
      "climate.room",
      undefined,
      6,
      now
    );
    expect(points.every((point) => point.humidity === undefined)).toBe(true);
  });
});

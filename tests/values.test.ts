import { describe, expect, it } from "vitest";
import {
  currentHumidity,
  currentTemperature,
  formatEntityValue,
  labelForOption,
  targetTemperature
} from "../src/values";
import type { HassEntity } from "../src/types";

function climate(attributes: HassEntity["attributes"]): HassEntity {
  return {
    entity_id: "climate.room",
    state: "cool",
    attributes
  };
}

describe("climate and air values", () => {
  it("reads climate temperatures and built-in humidity", () => {
    const state = climate({
      current_temperature: 25.4,
      temperature: 22.5,
      current_humidity: 64
    });
    expect(currentTemperature(state)).toBe(25.4);
    expect(targetTemperature(state)).toBe(22.5);
    expect(currentHumidity(state)).toBe(64);
  });

  it("prefers the configured humidity sensor", () => {
    const state = climate({ current_humidity: 64 });
    const sensor: HassEntity = {
      entity_id: "sensor.humidity",
      state: "58",
      attributes: { unit_of_measurement: "%" }
    };
    expect(currentHumidity(state, sensor)).toBe(58);
  });

  it("does not treat a target humidity attribute as a current reading", () => {
    const state = climate({ humidity: 63 });
    expect(currentHumidity(state)).toBeUndefined();
  });

  it("formats numeric and text sensors", () => {
    expect(
      formatEntityValue({
        entity_id: "sensor.co2",
        state: "860",
        attributes: { unit_of_measurement: "ppm" }
      })
    ).toBe("860 ppm");
    expect(
      formatEntityValue({
        entity_id: "sensor.voc",
        state: "Good",
        attributes: {}
      })
    ).toBe("Good");
  });

  it("creates readable service option labels", () => {
    expect(labelForOption("fan_only")).toBe("Fan Only");
    expect(labelForOption("heat_cool")).toBe("Heat Cool");
  });
});

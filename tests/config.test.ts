import { describe, expect, it } from "vitest";
import {
  getConfigForm,
  getStubConfig,
  normalizeConfig,
  validateConfig
} from "../src/config";
import type { HomeAssistant } from "../src/types";

describe("climate air card config", () => {
  it("requires a climate entity", () => {
    expect(() =>
      validateConfig({ type: "custom:climate-air-card", entity: "" })
    ).toThrow("Climate control is required");
    expect(() =>
      validateConfig({
        type: "custom:climate-air-card",
        entity: "sensor.temperature"
      })
    ).toThrow("must be a climate entity");
  });

  it("applies chart defaults", () => {
    expect(
      normalizeConfig({
        type: "custom:climate-air-card",
        entity: "climate.family_room"
      })
    ).toMatchObject({
      history_hours: 6,
      show_history: true
    });
  });

  it("only selects a climate entity for the preview", () => {
    const hass = {
      states: {
        "climate.family_room": {
          entity_id: "climate.family_room",
          state: "cool",
          attributes: { friendly_name: "Family Room" }
        },
        "sensor.family_room_humidity": {
          entity_id: "sensor.family_room_humidity",
          state: "61",
          attributes: { device_class: "humidity" }
        },
        "sensor.family_room_co2": {
          entity_id: "sensor.family_room_co2",
          state: "820",
          attributes: { device_class: "carbon_dioxide" }
        },
        "sensor.family_room_pm25": {
          entity_id: "sensor.family_room_pm25",
          state: "7",
          attributes: { device_class: "pm25" }
        },
        "sensor.family_room_voc": {
          entity_id: "sensor.family_room_voc",
          state: "Good",
          attributes: { friendly_name: "Family Room VOC" }
        }
      },
      async callApi<T>() {
        return [] as T;
      },
      async callService() {}
    } as HomeAssistant;

    expect(getStubConfig(hass)).toEqual({
      type: "custom:climate-air-card",
      entity: "climate.family_room",
      title: "",
      history_hours: 6,
      show_history: true
    });
  });

  it("exposes the native Home Assistant configuration schema", () => {
    const form = getConfigForm();
    expect(form.schema).toHaveLength(5);
    expect(() =>
      form.assertConfig({
        type: "custom:climate-air-card",
        entity: "climate.family_room"
      })
    ).not.toThrow();
  });
});

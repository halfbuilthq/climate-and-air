import type { ClimateAirCardConfig, HassEntity, HomeAssistant } from "./types";

export const DEFAULT_CONFIG: Partial<ClimateAirCardConfig> = {
  title: "",
  history_hours: 6,
  show_history: true
};

const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  entity: "Climate control",
  humidity_entity: "Humidity",
  co2_entity: "Carbon dioxide (CO₂)",
  pm25_entity: "Fine particles (PM2.5)",
  voc_entity: "Volatile organic compounds (VOC)",
  history_hours: "Trend period",
  show_history: "Show temperature and humidity trend"
};

const FIELD_HELPERS: Record<string, string> = {
  title: "Optional. The climate entity name is used when this is blank.",
  entity: "Required. Provides temperature, target, mode, fan and AC controls.",
  humidity_entity: "Optional if the climate entity already reports current humidity.",
  co2_entity: "Optional indoor CO₂ sensor.",
  pm25_entity: "Optional PM2.5 concentration sensor.",
  voc_entity: "Optional VOC index, concentration or text sensor.",
  history_hours: "Number of hours displayed in the trend chart."
};

export function getConfigForm() {
  return {
    schema: [
      { name: "title", selector: { text: {} } },
      {
        name: "entity",
        required: true,
        selector: { entity: { domain: "climate" } }
      },
      {
        type: "grid",
        name: "",
        flatten: true,
        column_min_width: "220px",
        schema: [
          {
            name: "humidity_entity",
            selector: { entity: { domain: "sensor", device_class: "humidity" } }
          },
          {
            name: "co2_entity",
            selector: {
              entity: { domain: "sensor", device_class: "carbon_dioxide" }
            }
          }
        ]
      },
      {
        type: "grid",
        name: "",
        flatten: true,
        column_min_width: "220px",
        schema: [
          {
            name: "pm25_entity",
            selector: { entity: { domain: "sensor", device_class: "pm25" } }
          },
          {
            name: "voc_entity",
            selector: { entity: { domain: "sensor" } }
          }
        ]
      },
      {
        type: "grid",
        name: "",
        flatten: true,
        column_min_width: "220px",
        schema: [
          {
            name: "history_hours",
            selector: {
              number: {
                min: 1,
                max: 24,
                step: 1,
                unit_of_measurement: "hours",
                mode: "box"
              }
            }
          },
          { name: "show_history", selector: { boolean: {} } }
        ]
      }
    ],
    computeLabel: (schema: { name?: string }) =>
      schema.name ? FIELD_LABELS[schema.name] : undefined,
    computeHelper: (schema: { name?: string }) =>
      schema.name ? FIELD_HELPERS[schema.name] : undefined,
    assertConfig: (config: ClimateAirCardConfig) => validateConfig(config)
  };
}

export function validateConfig(config: ClimateAirCardConfig): void {
  if (!config.entity || typeof config.entity !== "string") {
    throw new Error("Climate control is required.");
  }
  if (!config.entity.startsWith("climate.")) {
    throw new Error("Climate control must be a climate entity.");
  }
  if (
    config.history_hours !== undefined &&
    (config.history_hours < 1 || config.history_hours > 24)
  ) {
    throw new Error("Trend period must be between 1 and 24 hours.");
  }
}

export function normalizeConfig(config: ClimateAirCardConfig): ClimateAirCardConfig {
  return {
    ...DEFAULT_CONFIG,
    ...config,
    type: config.type || "custom:climate-air-card"
  } as ClimateAirCardConfig;
}

function findEntity(
  states: HassEntity[],
  predicate: (state: HassEntity, searchText: string) => boolean
): string | undefined {
  const match = states.find((state) => {
    const searchText =
      `${state.entity_id} ${state.attributes.friendly_name ?? ""}`.toLowerCase();
    return predicate(state, searchText);
  });
  return match?.entity_id;
}

export function getStubConfig(hass?: HomeAssistant): ClimateAirCardConfig {
  const states = Object.values(hass?.states ?? {});
  const climate = states.find((state) => state.entity_id.startsWith("climate."));
  const humidity = findEntity(
    states,
    (state, text) =>
      state.attributes.device_class === "humidity" || text.includes("humidity")
  );
  const co2 = findEntity(
    states,
    (state, text) =>
      state.attributes.device_class === "carbon_dioxide" ||
      text.includes("co2") ||
      text.includes("carbon dioxide")
  );
  const pm25 = findEntity(
    states,
    (state, text) =>
      state.attributes.device_class === "pm25" ||
      text.includes("pm2.5") ||
      text.includes("pm25")
  );
  const voc = findEntity(
    states,
    (_state, text) => text.includes("voc") || text.includes("volatile organic")
  );

  return normalizeConfig({
    type: "custom:climate-air-card",
    entity: climate?.entity_id ?? "",
    humidity_entity: humidity,
    co2_entity: co2,
    pm25_entity: pm25,
    voc_entity: voc
  });
}

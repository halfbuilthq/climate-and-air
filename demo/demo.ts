import "../src/climate-air-card";
import type { ClimateAirCard } from "../src/climate-air-card";
import type { HassEntity, HomeAssistant } from "../src/types";
import "./styles.css";

function climateState(
  currentTemperature: number,
  currentHumidity: number,
  mode = "dry",
  target = 23,
  time = new Date()
): HassEntity {
  return {
    entity_id: "climate.family_room",
    state: mode,
    last_changed: time.toISOString(),
    attributes: {
      friendly_name: "Family Room",
      current_temperature: currentTemperature,
      current_humidity: currentHumidity,
      temperature: target,
      temperature_unit: "°C",
      hvac_modes: ["off", "cool", "dry", "fan_only", "auto"],
      fan_modes: ["auto", "low", "medium", "high"],
      fan_mode: "low",
      min_temp: 16,
      max_temp: 30,
      target_temp_step: 0.5
    }
  };
}

function sensor(
  entityId: string,
  state: string | number,
  friendlyName: string,
  unit: string,
  deviceClass?: string,
  time = new Date()
): HassEntity {
  return {
    entity_id: entityId,
    state: String(state),
    last_changed: time.toISOString(),
    attributes: {
      friendly_name: friendlyName,
      unit_of_measurement: unit,
      device_class: deviceClass
    }
  };
}

const states: Record<string, HassEntity> = {
  "climate.family_room": climateState(26.2, 68),
  "sensor.family_room_humidity": sensor(
    "sensor.family_room_humidity",
    68,
    "Family room humidity",
    "%",
    "humidity"
  ),
  "sensor.family_room_co2": sensor(
    "sensor.family_room_co2",
    860,
    "Family room CO₂",
    "ppm",
    "carbon_dioxide"
  ),
  "sensor.family_room_pm25": sensor(
    "sensor.family_room_pm25",
    9,
    "Family room PM2.5",
    "µg/m³",
    "pm25"
  ),
  "sensor.family_room_voc": sensor(
    "sensor.family_room_voc",
    "Good",
    "Family room VOC",
    ""
  )
};

let hass: HomeAssistant;

function updateCard(): void {
  card.hass = {
    ...hass,
    states: { ...states }
  };
}

hass = {
  states,
  locale: {
    language: "en-AU",
    number_format: "language",
    time_format: "12"
  },
  config: {
    unit_system: {
      temperature: "°C"
    }
  },
  async callApi<T>() {
    const now = Date.now();
    const temperatures = [26.4, 26.1, 25.8, 25.5, 25.2, 24.9, 24.6, 24.3, 24.0, 23.8, 23.4, 23.0];
    const humidities = [75, 73, 71, 69, 67, 65, 64, 63, 62, 61, 60, 58];
    const climateHistory = temperatures.map((value, index) =>
      climateState(
        value,
        humidities[index] ?? 68,
        "dry",
        23,
        new Date(now - (temperatures.length - 1 - index) * (6 * 60 * 60 * 1000) / 11)
      )
    );
    const humidityHistory = humidities.map((value, index) =>
      sensor(
        "sensor.family_room_humidity",
        value,
        "Family room humidity",
        "%",
        "humidity",
        new Date(now - (humidities.length - 1 - index) * (6 * 60 * 60 * 1000) / 11)
      )
    );
    return [climateHistory, humidityHistory] as T;
  },
  async callService(_domain, service, serviceData) {
    const climate = states["climate.family_room"];
    if (!climate) return;
    if (service === "set_temperature" && typeof serviceData?.temperature === "number") {
      climate.attributes.temperature = serviceData.temperature;
    }
    if (service === "set_hvac_mode" && typeof serviceData?.hvac_mode === "string") {
      climate.state = serviceData.hvac_mode;
    }
    if (service === "set_fan_mode" && typeof serviceData?.fan_mode === "string") {
      climate.attributes.fan_mode = serviceData.fan_mode;
    }
    updateCard();
  }
};

const card = document.querySelector("climate-air-card") as ClimateAirCard;
card.setConfig({
  type: "custom:climate-air-card",
  title: "Family Room",
  entity: "climate.family_room",
  humidity_entity: "sensor.family_room_humidity",
  co2_entity: "sensor.family_room_co2",
  pm25_entity: "sensor.family_room_pm25",
  voc_entity: "sensor.family_room_voc",
  history_hours: 6,
  show_history: true
});
updateCard();

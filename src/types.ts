export interface HassEntity {
  entity_id: string;
  state: string;
  last_changed?: string;
  last_updated?: string;
  attributes: {
    friendly_name?: string;
    unit_of_measurement?: string;
    device_class?: string;
    current_temperature?: number;
    temperature?: number;
    target_temp_low?: number;
    target_temp_high?: number;
    current_humidity?: number;
    humidity?: number;
    hvac_modes?: string[];
    fan_modes?: string[];
    fan_mode?: string;
    min_temp?: number;
    max_temp?: number;
    target_temp_step?: number;
    [key: string]: unknown;
  };
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  callApi<T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    path: string,
    parameters?: unknown
  ): Promise<T>;
  callService(
    domain: string,
    service: string,
    serviceData?: Record<string, unknown>,
    target?: Record<string, unknown>
  ): Promise<unknown>;
  locale?: {
    language?: string;
    number_format?: string;
    time_format?: string;
  };
  language?: string;
  config?: {
    unit_system?: {
      temperature?: string;
    };
  };
}

export interface ClimateAirCardConfig {
  type: string;
  entity: string;
  title?: string;
  humidity_entity?: string;
  co2_entity?: string;
  pm25_entity?: string;
  voc_entity?: string;
  history_hours?: number;
  show_history?: boolean;
}

export interface HistoryPoint {
  timestamp: number;
  temperature?: number;
  humidity?: number;
}

declare global {
  interface Window {
    customCards?: Array<{
      type: string;
      name: string;
      preview?: boolean;
      description?: string;
      documentationURL?: string;
    }>;
  }

  interface HTMLElementTagNameMap {
    "climate-air-card": HTMLElement;
  }
}

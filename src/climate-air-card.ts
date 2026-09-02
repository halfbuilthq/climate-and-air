import {
  mdiAirFilter,
  mdiBlur,
  mdiFan,
  mdiLeaf,
  mdiMinus,
  mdiMoleculeCo2,
  mdiPlus,
  mdiWaterPercent,
  mdiWeatherWindy
} from "@mdi/js";
import { LitElement, html, nothing, svg, type PropertyValues } from "lit";
import {
  getConfigForm,
  getStubConfig,
  normalizeConfig,
  validateConfig
} from "./config";
import {
  chartPositionPercent,
  chartTooltipPosition,
  nearestChartPointIndex
} from "./chart";
import { fetchClimateHistory } from "./history";
import { cardStyles } from "./styles";
import type {
  ClimateAirCardConfig,
  HassEntity,
  HistoryPoint,
  HomeAssistant
} from "./types";
import {
  currentHumidity,
  currentTemperature,
  entity,
  formatEntityValue,
  formatNumber,
  labelForOption,
  targetTemperature,
  temperatureUnit
} from "./values";

const CHART_WIDTH = 560;
const CHART_HEIGHT = 150;
const HISTORY_REFRESH_MS = 10 * 60 * 1000;
type ChartPointer = ReturnType<typeof chartTooltipPosition>;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function smoothPath(points: Array<[number, number]>): string {
  if (points.length === 0) return "";
  if (points.length === 1) {
    return `M 0 ${points[0][1]} L ${CHART_WIDTH} ${points[0][1]}`;
  }
  return points.slice(1).reduce((path, [x, y], index) => {
    const [previousX, previousY] = points[index];
    const midpoint = (previousX + x) / 2;
    return `${path} C ${midpoint} ${previousY}, ${midpoint} ${y}, ${x} ${y}`;
  }, `M ${points[0][0]} ${points[0][1]}`);
}

function optionList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function flatHistory(
  temperature: number | undefined,
  humidity: number | undefined,
  hours: number,
  now = Date.now()
): HistoryPoint[] {
  return Array.from({ length: 25 }, (_, index) => ({
    timestamp: now - (24 - index) * (hours * 60 * 60 * 1000) / 24,
    temperature,
    humidity
  }));
}

function statusFor(climate: HassEntity | undefined): {
  label: string;
  className: string;
} {
  if (!climate || climate.state === "unavailable" || climate.state === "unknown") {
    return { label: "Unavailable", className: "unavailable" };
  }
  switch (climate.state) {
    case "off":
      return { label: "Off", className: "off" };
    case "cool":
      return { label: "Cooling", className: "active" };
    case "heat":
      return { label: "Heating", className: "heating" };
    case "dry":
      return { label: "Balancing", className: "active" };
    case "fan_only":
      return { label: "Ventilating", className: "active" };
    default:
      return { label: "Balancing", className: "active" };
  }
}

function humidityStatus(value: number | undefined): string {
  if (value === undefined) return "Humidity unavailable";
  if (value >= 65) return "Humidity high";
  if (value <= 30) return "Humidity low";
  return "Humidity balanced";
}

function sensorQuality(
  type: "co2" | "pm25" | "voc",
  sensor: HassEntity | undefined
): "good" | "warning" | "poor" | "unknown" {
  if (!sensor || ["unknown", "unavailable", ""].includes(sensor.state.toLowerCase())) {
    return "unknown";
  }
  const value = Number(sensor.state);
  if (!Number.isFinite(value)) {
    const normalized = sensor.state.toLowerCase();
    if (["good", "excellent", "low", "clean"].includes(normalized)) return "good";
    if (["moderate", "fair", "medium"].includes(normalized)) return "warning";
    if (["poor", "high", "very high", "hazardous"].includes(normalized)) return "poor";
    return "unknown";
  }
  if (type === "co2") return value >= 1_500 ? "poor" : value >= 1_000 ? "warning" : "good";
  if (type === "pm25") return value >= 35 ? "poor" : value >= 12 ? "warning" : "good";
  return value >= 250 ? "poor" : value >= 100 ? "warning" : "good";
}

export class ClimateAirCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _history: { state: true },
    _historyLoading: { state: true },
    _historyFailed: { state: true },
    _controlPending: { state: true },
    _activeChartIndex: { state: true },
    _chartPointer: { state: true }
  };

  static styles = cardStyles;

  hass?: HomeAssistant;
  private _config?: ClimateAirCardConfig;
  private _history: HistoryPoint[] = [];
  private _historyLoading = false;
  private _historyFailed = false;
  private _controlPending = false;
  private _activeChartIndex?: number;
  private _chartPointer?: ChartPointer;
  private _lastHistoryKey = "";
  private _lastHistoryFetch = 0;

  static getConfigForm() {
    return getConfigForm();
  }

  static getStubConfig(hass?: HomeAssistant) {
    return getStubConfig(hass);
  }

  setConfig(config: ClimateAirCardConfig): void {
    validateConfig(config);
    this._config = normalizeConfig({ ...config });
  }

  getCardSize(): number {
    const config = this._config;
    if (!config) return 7;
    const hasAirQuality = Boolean(
      config.co2_entity || config.pm25_entity || config.voc_entity
    );
    return (config.show_history === false ? 5 : 9) + (hasAirQuality ? 2 : 0);
  }

  getGridOptions() {
    return {
      columns: 12,
      min_columns: 3
    };
  }

  protected updated(changedProperties: PropertyValues): void {
    if (changedProperties.has("hass") || changedProperties.has("_config")) {
      queueMicrotask(() => void this._loadHistoryIfNeeded());
    }
  }

  private async _loadHistoryIfNeeded(): Promise<void> {
    const config = this._config;
    const hass = this.hass;
    if (!config || !hass || config.show_history === false) return;

    const hours = clamp(config.history_hours ?? 6, 1, 24);
    const key = `${config.entity}|${config.humidity_entity ?? ""}|${hours}`;
    const now = Date.now();
    if (
      this._historyLoading ||
      (key === this._lastHistoryKey && now - this._lastHistoryFetch < HISTORY_REFRESH_MS)
    ) {
      return;
    }

    this._historyLoading = true;
    this._historyFailed = false;
    this._lastHistoryKey = key;
    this._lastHistoryFetch = now;

    try {
      this._history = await fetchClimateHistory(
        hass,
        config.entity,
        config.humidity_entity,
        hours
      );
    } catch {
      this._history = [];
      this._historyFailed = true;
    } finally {
      this._historyLoading = false;
    }
  }

  private _openMoreInfo(entityId: string | undefined): void {
    if (!entityId) return;
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId },
        bubbles: true,
        composed: true
      })
    );
  }

  private async _callClimateService(
    service: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const hass = this.hass;
    const entityId = this._config?.entity;
    if (!hass || !entityId || this._controlPending) return;

    this._controlPending = true;
    try {
      await hass.callService("climate", service, {
        entity_id: entityId,
        ...data
      });
    } finally {
      this._controlPending = false;
    }
  }

  private _adjustTemperature(direction: -1 | 1): void {
    const climate = entity(this.hass, this._config?.entity);
    const currentTarget = targetTemperature(climate);
    if (currentTarget === undefined) return;
    const step =
      typeof climate?.attributes.target_temp_step === "number"
        ? climate.attributes.target_temp_step
        : 0.5;
    const minimum =
      typeof climate?.attributes.min_temp === "number"
        ? climate.attributes.min_temp
        : 7;
    const maximum =
      typeof climate?.attributes.max_temp === "number"
        ? climate.attributes.max_temp
        : 35;
    const temperature = clamp(currentTarget + direction * step, minimum, maximum);
    void this._callClimateService("set_temperature", { temperature });
  }

  private _changeMode(event: Event): void {
    const hvac_mode = (event.target as HTMLSelectElement).value;
    void this._callClimateService("set_hvac_mode", { hvac_mode });
  }

  private _changeFan(event: Event): void {
    const fan_mode = (event.target as HTMLSelectElement).value;
    void this._callClimateService("set_fan_mode", { fan_mode });
  }

  private _inspectChart(event: PointerEvent, pointCount: number): void {
    const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this._chartPointer = chartTooltipPosition(
      event.clientX - bounds.left,
      event.clientY - bounds.top,
      bounds.width,
      bounds.height
    );
    const index = nearestChartPointIndex(
      event.clientX,
      bounds.left,
      bounds.width,
      pointCount
    );
    if (index !== this._activeChartIndex) this._activeChartIndex = index;
  }

  private _leaveChart(event: PointerEvent): void {
    if (event.pointerType === "mouse") this._clearChartInspection();
  }

  private _clearChartInspection(): void {
    this._activeChartIndex = undefined;
    this._chartPointer = undefined;
  }

  private _navigateChart(event: KeyboardEvent, pointCount: number): void {
    this._chartPointer = undefined;
    if (event.key === "Escape") {
      this._activeChartIndex = undefined;
      return;
    }
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

    event.preventDefault();
    const current = this._activeChartIndex ?? pointCount - 1;
    this._activeChartIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? pointCount - 1
          : clamp(current + (event.key === "ArrowLeft" ? -1 : 1), 0, pointCount - 1);
  }

  private _renderChart(
    points: HistoryPoint[],
    unit: string,
    showHumidity: boolean
  ) {
    const temperatures = points
      .map((point) => point.temperature)
      .filter((value): value is number => value !== undefined);
    const humidities = showHumidity
      ? points
          .map((point) => point.humidity)
          .filter((value): value is number => value !== undefined)
      : [];
    const temperatureMinimum =
      temperatures.length > 0 ? Math.floor(Math.min(...temperatures) - 1) : 18;
    const temperatureMaximum =
      temperatures.length > 0 ? Math.ceil(Math.max(...temperatures) + 1) : 28;
    const temperatureRange = Math.max(2, temperatureMaximum - temperatureMinimum);
    const humidityMinimum =
      humidities.length > 0
        ? Math.max(0, Math.floor((Math.min(...humidities) - 10) / 20) * 20)
        : 20;
    const humidityMaximum =
      humidities.length > 0
        ? Math.min(100, Math.ceil((Math.max(...humidities) + 5) / 20) * 20)
        : 80;
    const humidityRange = Math.max(20, humidityMaximum - humidityMinimum);
    const xFor = (index: number) =>
      (index / Math.max(1, points.length - 1)) * CHART_WIDTH;
    const temperatureCoordinates = points
      .map((point, index) =>
        point.temperature === undefined
          ? undefined
          : ([
              xFor(index),
              ((temperatureMaximum - point.temperature) / temperatureRange) *
                CHART_HEIGHT
            ] as [number, number])
      )
      .filter((point): point is [number, number] => point !== undefined);
    const humidityCoordinates = showHumidity
      ? points
          .map((point, index) =>
            point.humidity === undefined
              ? undefined
              : ([
                  xFor(index),
                  ((humidityMaximum - point.humidity) / humidityRange) *
                    CHART_HEIGHT
                ] as [number, number])
          )
          .filter((point): point is [number, number] => point !== undefined)
      : [];
    const activeIndex =
      this._activeChartIndex === undefined
        ? undefined
        : clamp(this._activeChartIndex, 0, points.length - 1);
    const activePoint =
      activeIndex === undefined ? undefined : points[activeIndex];
    const activeX =
      activeIndex === undefined
        ? undefined
        : (activeIndex / Math.max(1, points.length - 1)) * CHART_WIDTH;
    const activePosition =
      activeIndex === undefined
        ? undefined
        : chartPositionPercent(activeIndex, points.length);
    const activeTemperatureY =
      activePoint?.temperature === undefined
        ? undefined
        : ((temperatureMaximum - activePoint.temperature) / temperatureRange) *
          CHART_HEIGHT;
    const activeHumidityY =
      !showHumidity || activePoint?.humidity === undefined
        ? undefined
        : ((humidityMaximum - activePoint.humidity) / humidityRange) * CHART_HEIGHT;
    const tooltipPlacement =
      this._chartPointer?.placement ??
      (activePosition !== undefined && activePosition > 64
        ? "place-left"
        : "place-right");
    const tooltipStyle = this._chartPointer
      ? `left: ${this._chartPointer.x}px; top: ${this._chartPointer.top}px`
      : `left: ${activePosition ?? 0}%`;
    const tooltipTime = activePoint
      ? new Intl.DateTimeFormat(this._locale, {
          hour: "numeric",
          minute: "2-digit"
        }).format(activePoint.timestamp)
      : "";

    return html`
      <div class="chart-layout ${showHumidity ? "" : "temperature-only"}">
        <div class="y-axis temperature-axis" aria-hidden="true">
          <span>${temperatureMaximum}${unit}</span>
          <span>${Math.round(temperatureMinimum + temperatureRange / 2)}${unit}</span>
          <span>${temperatureMinimum}${unit}</span>
        </div>
        <div
          class="chart-wrap"
          role="group"
          tabindex="0"
          aria-label=${showHumidity
            ? "Inspect temperature and humidity history"
            : "Inspect temperature history"}
          @pointerdown=${(event: PointerEvent) => this._inspectChart(event, points.length)}
          @pointermove=${(event: PointerEvent) => this._inspectChart(event, points.length)}
          @pointerleave=${this._leaveChart}
          @pointercancel=${this._clearChartInspection}
          @keydown=${(event: KeyboardEvent) => this._navigateChart(event, points.length)}
          @blur=${this._clearChartInspection}
        >
          <svg
            viewBox="0 0 ${CHART_WIDTH} ${CHART_HEIGHT}"
            role="img"
            aria-label=${showHumidity
              ? "Temperature and humidity history"
              : "Temperature history"}
            preserveAspectRatio="none"
          >
            ${[0, 1, 2].map((index) => {
              const y = (index / 2) * CHART_HEIGHT;
              return svg`<line class="grid-line" x1="0" y1=${y} x2=${CHART_WIDTH} y2=${y}></line>`;
            })}
            ${[0, 1, 2, 3, 4, 5, 6].map((index) => {
              const x = (index / 6) * CHART_WIDTH;
              return svg`<line class="grid-line" x1=${x} y1="0" x2=${x} y2=${CHART_HEIGHT}></line>`;
            })}
            <path class="temperature-line" d=${smoothPath(temperatureCoordinates)}></path>
            ${showHumidity
              ? svg`<path class="humidity-line" d=${smoothPath(humidityCoordinates)}></path>`
              : nothing}
            ${temperatureCoordinates.map(
              ([x, y]) => svg`<circle class="temperature-dot" cx=${x} cy=${y} r="3"></circle>`
            )}
            ${showHumidity
              ? humidityCoordinates.map(
                  ([x, y]) =>
                    svg`<circle class="humidity-dot" cx=${x} cy=${y} r="3"></circle>`
                )
              : nothing}
            ${activeX === undefined
              ? nothing
              : svg`
                  <line
                    class="inspection-line"
                    x1=${activeX}
                    y1="0"
                    x2=${activeX}
                    y2=${CHART_HEIGHT}
                  ></line>
                  ${activeTemperatureY === undefined
                    ? nothing
                    : svg`
                        <circle
                          class="inspection-dot temperature-series"
                          cx=${activeX}
                          cy=${activeTemperatureY}
                          r="5"
                        ></circle>
                      `}
                  ${activeHumidityY === undefined
                    ? nothing
                    : svg`
                        <circle
                          class="inspection-dot humidity-series"
                          cx=${activeX}
                          cy=${activeHumidityY}
                          r="5"
                        ></circle>
                      `}
                `}
          </svg>
          ${activePoint && activePosition !== undefined
            ? html`
                <div
                  class="chart-tooltip ${tooltipPlacement}"
                  style=${tooltipStyle}
                  aria-live="polite"
                >
                  <time>${tooltipTime}</time>
                  <div class="tooltip-item temperature-series">
                    <span><i></i>Temperature</span>
                    <strong>
                      ${activePoint.temperature === undefined
                        ? "—"
                        : `${formatNumber(activePoint.temperature, this._locale, 1)}${unit}`}
                    </strong>
                  </div>
                  ${showHumidity
                    ? html`
                        <div class="tooltip-item humidity-series">
                          <span><i></i>Humidity</span>
                          <strong>
                            ${activePoint.humidity === undefined
                              ? "—"
                              : `${formatNumber(activePoint.humidity, this._locale)}%`}
                          </strong>
                        </div>
                      `
                    : nothing}
                </div>
              `
            : nothing}
        </div>
        ${showHumidity
          ? html`
              <div class="y-axis humidity-axis" aria-hidden="true">
                <span>${humidityMaximum}%</span>
                <span>${Math.round(humidityMinimum + humidityRange / 2)}%</span>
                <span>${humidityMinimum}%</span>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private _sensorTile(
    type: "co2" | "pm25" | "voc",
    label: string,
    sensor: HassEntity | undefined,
    entityId: string,
    iconPath: string,
    fallbackUnit: string
  ) {
    const quality = sensorQuality(type, sensor);
    return html`
      <button
        class="sensor"
        type="button"
        @click=${() => this._openMoreInfo(entityId)}
        aria-label=${`Open ${label} details`}
      >
        <span class="sensor-icon ${quality}" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d=${iconPath}></path></svg>
        </span>
        <span class="sensor-copy">
          <span class="sensor-label">${label}</span>
          <strong class="${type} ${quality}">
            ${formatEntityValue(sensor, this._locale, fallbackUnit)}
          </strong>
        </span>
      </button>
    `;
  }

  private get _locale(): string | undefined {
    return this.hass?.locale?.language ?? this.hass?.language;
  }

  protected render() {
    const config = this._config;
    if (!config) return nothing;

    const climate = entity(this.hass, config.entity);
    const humiditySensor = entity(this.hass, config.humidity_entity);
    const co2 = entity(this.hass, config.co2_entity);
    const pm25 = entity(this.hass, config.pm25_entity);
    const voc = entity(this.hass, config.voc_entity);
    const current = currentTemperature(climate);
    const target = targetTemperature(climate);
    const humidity = currentHumidity(humiditySensor);
    const hasHumidity = Boolean(config.humidity_entity);
    const humidityProgress = clamp(humidity ?? 0, 0, 100);
    const unit = temperatureUnit(this.hass, climate);
    const title =
      config.title ||
      climate?.attributes.friendly_name ||
      "Climate & Air";
    const status = statusFor(climate);
    const mode = climate?.state ?? "off";
    const modes = optionList(climate?.attributes.hvac_modes);
    const fanMode =
      typeof climate?.attributes.fan_mode === "string"
        ? climate.attributes.fan_mode
        : "";
    const fanModes = optionList(climate?.attributes.fan_modes);
    const hasFanControl = fanModes.length > 0 || fanMode.length > 0;
    const hasTargetControl = target !== undefined;
    const configuredSensorCount = [
      config.co2_entity,
      config.pm25_entity,
      config.voc_entity
    ].filter(Boolean).length;
    const hasAirReadings = hasHumidity || configuredSensorCount > 0;
    const hours = clamp(config.history_hours ?? 6, 1, 24);
    const history =
      this._history.some(
        (point) => point.temperature !== undefined || point.humidity !== undefined
      )
        ? this._history
        : flatHistory(current, humidity, hours);
    const currentModeLabel = labelForOption(mode);
    const guidance =
      mode === "dry"
        ? "Dry mode reducing humidity"
        : mode === "cool"
          ? "Cooling toward the target temperature"
          : mode === "heat"
            ? "Heating toward the target temperature"
            : mode === "fan_only"
              ? "Air circulation is running"
              : mode === "off"
                ? "Climate control is off"
                : `${currentModeLabel} mode balancing comfort`;

    return html`
      <ha-card>
        <div class="card">
          <header class="header">
            <button
              class="title-group"
              type="button"
              @click=${() => this._openMoreInfo(config.entity)}
              aria-label="Open climate entity details"
            >
              <span class="icon-tile" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d=${mdiWeatherWindy}></path></svg>
              </span>
              <span class="title-copy">
                <h1>${title}</h1>
                <span class="subtitle">
                  ${hasAirReadings ? "Comfort & air" : "Climate control"}
                </span>
              </span>
            </button>
            <div class="status ${status.className}">
              <span class="dot"></span>
              ${status.label}
            </div>
          </header>

          <section class="hero ${hasHumidity ? "" : "temperature-only"}">
            <div class="thermostat ${hasTargetControl ? "" : "no-target"}">
              <div class="current-block">
                <span class="eyebrow">Current</span>
                <strong class="current-temperature">
                  <span>${current === undefined ? "—" : formatNumber(current, this._locale, 1)}</span>
                  ${current === undefined ? nothing : html`<small>${unit}</small>`}
                </strong>
              </div>

              ${hasTargetControl
                ? html`
                    <div class="target-block">
                      <span class="eyebrow">Target</span>
                      <div class="target-controls">
                        <button
                          type="button"
                          class="temperature-button"
                          ?disabled=${this._controlPending}
                          @click=${() => this._adjustTemperature(-1)}
                          aria-label="Lower target temperature"
                        >
                          <svg viewBox="0 0 24 24"><path d=${mdiMinus}></path></svg>
                        </button>
                        <strong class="target-temperature">
                          <span>${formatNumber(target, this._locale, 1)}</span>
                          <small>${unit}</small>
                        </strong>
                        <button
                          type="button"
                          class="temperature-button"
                          ?disabled=${this._controlPending}
                          @click=${() => this._adjustTemperature(1)}
                          aria-label="Raise target temperature"
                        >
                          <svg viewBox="0 0 24 24"><path d=${mdiPlus}></path></svg>
                        </button>
                      </div>
                    </div>
                  `
                : nothing}

              <div class="climate-options ${hasFanControl ? "" : "single"}">
                <label class="option">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d=${mdiWaterPercent}></path>
                  </svg>
                  <span>
                    <small>Mode</small>
                    <select
                      aria-label="Climate mode"
                      ?disabled=${modes.length === 0 || this._controlPending}
                      @change=${this._changeMode}
                    >
                      ${modes.length > 0
                        ? modes.map(
                            (item) =>
                              html`<option value=${item} ?selected=${item === mode}>
                                ${labelForOption(item)}
                              </option>`
                          )
                        : html`<option>${currentModeLabel}</option>`}
                    </select>
                  </span>
                </label>
                ${hasFanControl
                  ? html`
                      <label class="option">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d=${mdiFan}></path>
                        </svg>
                        <span>
                          <small>Fan</small>
                          <select
                            aria-label="Fan mode"
                            ?disabled=${fanModes.length === 0 || this._controlPending}
                            @change=${this._changeFan}
                          >
                            ${fanModes.length > 0
                              ? fanModes.map(
                                  (item) =>
                                    html`<option
                                      value=${item}
                                      ?selected=${item === fanMode}
                                    >
                                      ${labelForOption(item)}
                                    </option>`
                                )
                              : html`<option>${labelForOption(fanMode)}</option>`}
                          </select>
                        </span>
                      </label>
                    `
                  : nothing}
              </div>
            </div>

            ${hasHumidity
              ? html`
                  <button
                    class="humidity"
                    type="button"
                    @click=${() => this._openMoreInfo(config.humidity_entity)}
                    aria-label="Open humidity details"
                    style="--humidity-progress: ${humidityProgress}"
                  >
                    <svg class="humidity-ring" viewBox="0 0 140 140" aria-hidden="true">
                      <circle class="ring-track" cx="70" cy="70" r="58"></circle>
                      <circle class="ring-value" cx="70" cy="70" r="58"></circle>
                    </svg>
                    <span class="humidity-content">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d=${mdiWaterPercent}></path>
                      </svg>
                      <span>${humidityStatus(humidity)}</span>
                      <strong>${formatNumber(humidity, this._locale)}%</strong>
                      <small>Indoor humidity</small>
                    </span>
                  </button>
                `
              : nothing}
          </section>

          ${config.show_history === false
            ? nothing
            : html`
                <section class="history">
                  <div class="history-heading">
                    <div class="guidance">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d=${mdiAirFilter}></path>
                      </svg>
                      <span>${guidance}</span>
                    </div>
                    <div class="legend" aria-label="Chart legend">
                      <span><i class="temperature-key"></i>Temperature</span>
                      ${hasHumidity
                        ? html`<span><i class="humidity-key"></i>Humidity</span>`
                        : nothing}
                    </div>
                  </div>
                  ${this._renderChart(history, unit, hasHumidity)}
                  <div
                    class="x-axis ${hasHumidity ? "" : "temperature-only"}"
                    aria-hidden="true"
                  >
                    ${[hours, hours - hours / 6, hours - (2 * hours) / 6, hours / 2, (2 * hours) / 6, hours / 6, 0].map(
                      (remaining, index) =>
                        html`<span>
                          ${index === 6
                            ? "Now"
                            : `${Math.round(remaining * 10) / 10}h ago`}
                        </span>`
                    )}
                  </div>
                  ${this._historyLoading
                    ? html`<p class="history-note">Loading Home Assistant history…</p>`
                    : this._historyFailed
                      ? html`<p class="history-note">History unavailable · showing current readings</p>`
                      : nothing}
                </section>
              `}

          ${configuredSensorCount > 0
            ? html`
                <section
                  class="sensors"
                  aria-label="Indoor air quality"
                  style="--sensor-count: ${configuredSensorCount}"
                >
                  ${config.co2_entity
                    ? this._sensorTile(
                        "co2",
                        "CO₂",
                        co2,
                        config.co2_entity,
                        mdiMoleculeCo2,
                        "ppm"
                      )
                    : nothing}
                  ${config.pm25_entity
                    ? this._sensorTile(
                        "pm25",
                        "PM2.5",
                        pm25,
                        config.pm25_entity,
                        mdiBlur,
                        "µg/m³"
                      )
                    : nothing}
                  ${config.voc_entity
                    ? this._sensorTile(
                        "voc",
                        "VOC",
                        voc,
                        config.voc_entity,
                        mdiLeaf,
                        ""
                      )
                    : nothing}
                </section>
              `
            : nothing}
        </div>
      </ha-card>
    `;
  }
}

if (!customElements.get("climate-air-card")) {
  customElements.define("climate-air-card", ClimateAirCard);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === "climate-air-card")) {
  window.customCards.push({
    type: "climate-air-card",
    name: "Climate & Air Card",
    preview: true,
    description: "Climate controls, comfort trends and indoor air quality in one card.",
    documentationURL: "https://github.com/halfbuilthq/climate-and-air"
  });
}

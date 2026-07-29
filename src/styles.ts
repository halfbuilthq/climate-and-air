import { css } from "lit";

export const cardStyles = css`
  :host {
    --climate-teal: #0d9ca2;
    --climate-teal-dark: #08787e;
    --climate-blue: #1268dc;
    --climate-green: #198b2f;
    --climate-soft: color-mix(in srgb, var(--climate-teal) 10%, transparent);
    display: block;
    container-type: inline-size;
  }

  * {
    box-sizing: border-box;
  }

  button,
  select {
    font: inherit;
  }

  button {
    color: inherit;
  }

  ha-card {
    display: block;
    overflow: hidden;
    border-radius: var(--ha-card-border-radius, 24px);
    color: var(--primary-text-color, #101827);
    background:
      radial-gradient(circle at 94% 3%, var(--climate-soft), transparent 36%),
      var(--ha-card-background, var(--card-background-color, #fff));
  }

  .card {
    padding: clamp(18px, 4.6cqw, 30px);
  }

  h1,
  p {
    margin: 0;
  }

  .header,
  .title-group,
  .status,
  .history-heading,
  .guidance,
  .legend,
  .legend span,
  .option,
  .sensor {
    display: flex;
    align-items: center;
  }

  .header {
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 24px;
  }

  .title-group {
    min-width: 0;
    gap: 14px;
    padding: 0;
    border: 0;
    text-align: left;
    background: transparent;
    cursor: pointer;
  }

  .icon-tile {
    display: grid;
    width: 48px;
    height: 48px;
    flex: 0 0 auto;
    place-items: center;
    border: 1px solid color-mix(in srgb, var(--climate-teal) 14%, transparent);
    border-radius: 16px;
    color: var(--climate-teal);
    background: var(--climate-soft);
  }

  .icon-tile svg {
    width: 28px;
    height: 28px;
    fill: currentColor;
  }

  .title-copy {
    min-width: 0;
  }

  h1 {
    overflow: hidden;
    color: var(--primary-text-color, #101827);
    font-size: clamp(22px, 5.2cqw, 30px);
    font-weight: 760;
    letter-spacing: -0.8px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .subtitle {
    display: block;
    margin-top: 3px;
    color: var(--secondary-text-color, #61708a);
    font-size: 14px;
  }

  .status {
    flex: 0 0 auto;
    gap: 9px;
    min-height: 36px;
    padding: 0 15px;
    border: 1px solid color-mix(in srgb, var(--climate-teal) 16%, transparent);
    border-radius: 999px;
    color: var(--climate-teal-dark);
    background: var(--climate-soft);
    font-size: 13px;
    font-weight: 720;
  }

  .status .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
  }

  .status.off {
    color: var(--secondary-text-color, #61708a);
    background: color-mix(in srgb, var(--secondary-text-color, #61708a) 10%, transparent);
  }

  .status.heating {
    color: #b95f15;
    background: color-mix(in srgb, #ed8b32 13%, transparent);
  }

  .status.unavailable {
    color: var(--error-color, #c83232);
    background: color-mix(in srgb, var(--error-color, #c83232) 11%, transparent);
  }

  .hero {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(220px, 0.9fr);
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--climate-teal) 18%, var(--divider-color, #dfe6eb));
    border-radius: 22px;
    background: color-mix(
      in srgb,
      var(--ha-card-background, var(--card-background-color, #fff)) 96%,
      var(--climate-teal) 4%
    );
  }

  .hero.temperature-only {
    grid-template-columns: minmax(0, 1fr);
  }

  .thermostat {
    min-width: 0;
    padding: clamp(22px, 5cqw, 32px);
    border-right: 1px solid var(--divider-color, #dfe6eb);
  }

  .hero.temperature-only .thermostat {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: clamp(24px, 7cqw, 56px);
    align-items: start;
    border-right: 0;
  }

  .hero.temperature-only .target-block {
    margin-top: 0;
  }

  .hero.temperature-only .climate-options {
    grid-column: 1 / -1;
  }

  .hero.temperature-only .thermostat.no-target .current-block {
    grid-column: 1 / -1;
  }

  .current-block,
  .target-block {
    text-align: center;
  }

  .eyebrow {
    display: block;
    margin-bottom: 6px;
    color: var(--secondary-text-color, #61708a);
    font-size: 14px;
    font-weight: 650;
  }

  .current-temperature {
    display: flex;
    align-items: baseline;
    justify-content: center;
    color: var(--primary-text-color, #101827);
    font-size: clamp(48px, 11cqw, 68px);
    font-weight: 790;
    letter-spacing: -3px;
    line-height: 1;
  }

  .current-temperature small {
    margin-left: 5px;
    font-size: 0.38em;
    font-weight: 720;
    letter-spacing: -0.4px;
  }

  .target-block {
    margin-top: 23px;
  }

  .target-controls {
    display: grid;
    grid-template-columns: 44px minmax(100px, 1fr) 44px;
    gap: 16px;
    align-items: center;
  }

  .target-temperature {
    display: flex;
    align-items: baseline;
    justify-content: center;
    color: var(--climate-teal);
    font-size: clamp(39px, 8.8cqw, 55px);
    font-weight: 780;
    letter-spacing: -2.4px;
    line-height: 1;
  }

  .target-temperature small {
    margin-left: 4px;
    font-size: 0.42em;
    font-weight: 720;
    letter-spacing: -0.3px;
  }

  .temperature-button {
    display: grid;
    width: 44px;
    height: 44px;
    padding: 0;
    border: 1px solid color-mix(in srgb, var(--secondary-text-color, #61708a) 34%, transparent);
    place-items: center;
    border-radius: 12px;
    color: var(--climate-teal-dark);
    background: var(--ha-card-background, var(--card-background-color, #fff));
    cursor: pointer;
    transition:
      border-color 160ms ease,
      background 160ms ease,
      transform 160ms ease;
  }

  .temperature-button:hover:not(:disabled) {
    border-color: var(--climate-teal);
    background: var(--climate-soft);
  }

  .temperature-button:active:not(:disabled) {
    transform: scale(0.95);
  }

  .temperature-button:disabled {
    cursor: not-allowed;
    opacity: 0.42;
  }

  .temperature-button svg {
    width: 24px;
    height: 24px;
    fill: currentColor;
  }

  .climate-options {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-top: 25px;
    padding-top: 18px;
    border-top: 1px solid var(--divider-color, #dfe6eb);
  }

  .climate-options.single {
    grid-template-columns: minmax(0, 1fr);
  }

  .climate-options.single .option:first-child {
    border-right: 0;
  }

  .option {
    min-width: 0;
    gap: 12px;
    padding: 0 16px;
  }

  .option:first-child {
    padding-left: 0;
    border-right: 1px solid var(--divider-color, #dfe6eb);
  }

  .option:last-child {
    padding-right: 0;
  }

  .option > svg {
    width: 27px;
    height: 27px;
    flex: 0 0 auto;
    fill: var(--climate-teal);
  }

  .option > span {
    min-width: 0;
  }

  .option small {
    display: block;
    color: var(--secondary-text-color, #61708a);
    font-size: 11px;
    line-height: 1;
  }

  .option select {
    width: 100%;
    margin: 4px 0 0;
    padding: 0 20px 0 0;
    overflow: hidden;
    border: 0;
    border-radius: 0;
    color: var(--primary-text-color, #101827);
    background: transparent;
    font-size: 17px;
    font-weight: 720;
    text-overflow: ellipsis;
    cursor: pointer;
  }

  .option select:disabled {
    cursor: default;
    opacity: 1;
  }

  .humidity {
    position: relative;
    display: grid;
    min-height: 300px;
    padding: 28px;
    border: 0;
    place-items: center;
    background: transparent;
    cursor: pointer;
  }

  .humidity:disabled {
    cursor: default;
  }

  .humidity-ring {
    width: min(100%, 222px);
    height: auto;
    transform: rotate(-90deg);
  }

  .humidity-ring circle {
    fill: none;
    stroke-width: 10;
  }

  .ring-track {
    stroke: color-mix(in srgb, var(--secondary-text-color, #61708a) 13%, transparent);
  }

  .ring-value {
    stroke: var(--climate-teal);
    stroke-dasharray: 364.42;
    stroke-dashoffset: calc(364.42 - (364.42 * var(--humidity-progress, 0) / 100));
    stroke-linecap: round;
    transition: stroke-dashoffset 500ms ease;
  }

  .humidity-content {
    position: absolute;
    top: 50%;
    left: 50%;
    display: flex;
    width: 68%;
    flex-direction: column;
    align-items: center;
    transform: translate(-50%, -50%);
  }

  .humidity-content > svg {
    width: 29px;
    height: 29px;
    margin-bottom: 8px;
    fill: var(--climate-teal);
  }

  .humidity-content > span {
    color: var(--secondary-text-color, #61708a);
    font-size: 13px;
    font-weight: 650;
    text-align: center;
  }

  .humidity-content strong {
    margin-top: 5px;
    color: var(--climate-teal);
    font-size: clamp(40px, 9.5cqw, 58px);
    font-weight: 790;
    letter-spacing: -2px;
    line-height: 1;
  }

  .humidity-content small {
    margin-top: 6px;
    color: var(--secondary-text-color, #61708a);
    font-size: 11px;
  }

  .history {
    margin-top: 26px;
  }

  .history-heading {
    justify-content: space-between;
    gap: 22px;
    min-height: 28px;
    margin-bottom: 16px;
  }

  .guidance {
    min-width: 0;
    gap: 9px;
    color: var(--climate-teal);
    font-size: 13px;
    font-weight: 730;
  }

  .guidance svg {
    width: 22px;
    height: 22px;
    flex: 0 0 auto;
    fill: currentColor;
  }

  .legend {
    flex: 0 0 auto;
    gap: 18px;
    color: var(--secondary-text-color, #61708a);
    font-size: 12px;
  }

  .legend span {
    gap: 7px;
  }

  .legend i {
    display: block;
    width: 24px;
    height: 3px;
    border-radius: 999px;
  }

  .temperature-key {
    background: var(--climate-teal);
  }

  .humidity-key {
    background:
      repeating-linear-gradient(
        90deg,
        var(--climate-blue) 0 5px,
        transparent 5px 8px
      );
  }

  .chart-layout {
    display: grid;
    grid-template-columns: 45px minmax(0, 1fr) 40px;
    gap: 8px;
    align-items: stretch;
  }

  .chart-layout.temperature-only {
    grid-template-columns: 45px minmax(0, 1fr);
  }

  .chart-wrap {
    position: relative;
    height: 150px;
    border-radius: 5px;
    outline: none;
    touch-action: pan-y;
    user-select: none;
  }

  .chart-wrap:focus-visible {
    outline: 2px solid var(--climate-blue);
    outline-offset: 3px;
  }

  .chart-wrap svg {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
    pointer-events: none;
  }

  .grid-line {
    stroke: var(--divider-color, #dfe6eb);
    stroke-width: 1;
    vector-effect: non-scaling-stroke;
  }

  .temperature-line,
  .humidity-line {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 3;
    vector-effect: non-scaling-stroke;
  }

  .temperature-line {
    stroke: var(--climate-teal);
  }

  .humidity-line {
    stroke: var(--climate-blue);
    stroke-dasharray: 7 6;
  }

  .temperature-dot {
    fill: var(--climate-teal);
  }

  .humidity-dot {
    fill: var(--climate-blue);
  }

  .inspection-line {
    stroke: var(--primary-text-color, #101827);
    stroke-dasharray: 3 4;
    stroke-opacity: 0.42;
    stroke-width: 1.5;
    vector-effect: non-scaling-stroke;
  }

  .inspection-dot {
    stroke: var(--ha-card-background, var(--card-background-color, #fff));
    stroke-width: 2.5;
    vector-effect: non-scaling-stroke;
  }

  .inspection-dot.temperature-series {
    fill: var(--climate-teal);
  }

  .inspection-dot.humidity-series {
    fill: var(--climate-blue);
  }

  .chart-tooltip {
    position: absolute;
    z-index: 3;
    width: 154px;
    padding: 9px 10px;
    border: 1px solid
      color-mix(in srgb, var(--primary-text-color, #101827) 14%, transparent);
    border-radius: 10px;
    color: var(--primary-text-color, #101827);
    background: color-mix(
      in srgb,
      var(--ha-card-background, var(--card-background-color, #fff)) 95%,
      transparent
    );
    box-shadow: 0 7px 22px rgba(18, 26, 42, 0.18);
    pointer-events: none;
    backdrop-filter: blur(8px);
  }

  .chart-tooltip.place-right {
    margin-left: 14px;
  }

  .chart-tooltip.place-left {
    margin-left: -14px;
    transform: translateX(-100%);
  }

  .chart-tooltip time {
    display: block;
    margin-bottom: 5px;
    color: var(--secondary-text-color, #61708a);
    font-size: 10px;
    font-weight: 700;
  }

  .tooltip-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 9px;
    font-size: 11px;
  }

  .tooltip-item + .tooltip-item {
    margin-top: 4px;
  }

  .tooltip-item span {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 700;
  }

  .tooltip-item i {
    width: 7px;
    height: 7px;
    flex: 0 0 auto;
    border-radius: 50%;
    background: currentColor;
  }

  .tooltip-item.temperature-series {
    color: var(--climate-teal);
  }

  .tooltip-item.humidity-series {
    color: var(--climate-blue);
  }

  .tooltip-item strong {
    color: var(--primary-text-color, #101827);
    font-size: 11px;
    white-space: nowrap;
  }

  .y-axis {
    display: flex;
    height: 150px;
    flex-direction: column;
    justify-content: space-between;
    color: var(--secondary-text-color, #61708a);
    font-size: 11px;
  }

  .temperature-axis {
    align-items: flex-end;
  }

  .humidity-axis {
    align-items: flex-start;
  }

  .x-axis {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    margin: 7px 47px 0 53px;
    color: var(--secondary-text-color, #61708a);
    font-size: 10px;
  }

  .x-axis.temperature-only {
    margin-right: 0;
  }

  .x-axis span {
    text-align: center;
  }

  .x-axis span:first-child {
    text-align: left;
  }

  .x-axis span:last-child {
    text-align: right;
  }

  .history-note {
    margin: 9px 48px 0;
    color: var(--secondary-text-color, #61708a);
    font-size: 11px;
  }

  .sensors {
    display: grid;
    grid-template-columns: repeat(var(--sensor-count, 3), minmax(0, 1fr));
    margin-top: 24px;
    padding-top: 22px;
    border-top: 1px solid var(--divider-color, #dfe6eb);
  }

  .sensor {
    min-width: 0;
    gap: 13px;
    padding: 0 22px;
    border: 0;
    border-right: 1px solid var(--divider-color, #dfe6eb);
    text-align: left;
    background: transparent;
    cursor: pointer;
  }

  .sensor:first-child {
    padding-left: 12px;
  }

  .sensor:last-child {
    padding-right: 12px;
    border-right: 0;
  }

  .sensor:disabled {
    cursor: default;
  }

  .sensor-icon {
    display: grid;
    width: 46px;
    height: 46px;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 50%;
    color: var(--climate-green);
    background: color-mix(in srgb, var(--climate-green) 10%, transparent);
  }

  .sensor-icon.warning {
    color: #b66e00;
    background: color-mix(in srgb, #ef9b14 14%, transparent);
  }

  .sensor-icon.poor {
    color: var(--error-color, #c83232);
    background: color-mix(in srgb, var(--error-color, #c83232) 12%, transparent);
  }

  .sensor-icon.unknown {
    color: var(--secondary-text-color, #61708a);
    background: color-mix(in srgb, var(--secondary-text-color, #61708a) 10%, transparent);
  }

  .sensor-icon svg {
    width: 27px;
    height: 27px;
    fill: currentColor;
  }

  .sensor-copy {
    min-width: 0;
  }

  .sensor-label {
    display: block;
    color: var(--secondary-text-color, #61708a);
    font-size: 12px;
    font-weight: 650;
  }

  .sensor strong {
    display: block;
    overflow: hidden;
    margin-top: 4px;
    color: var(--primary-text-color, #101827);
    font-size: clamp(18px, 4.4cqw, 24px);
    font-weight: 760;
    letter-spacing: -0.5px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sensor strong.voc.good {
    color: var(--climate-green);
  }

  .sensor strong.warning {
    color: #a96600;
  }

  .sensor strong.poor {
    color: var(--error-color, #c83232);
  }

  button:focus-visible,
  select:focus-visible {
    outline: 2px solid var(--climate-blue);
    outline-offset: 3px;
  }

  @container (max-width: 520px) {
    .hero {
      grid-template-columns: minmax(0, 1fr) minmax(170px, 0.76fr);
    }

    .thermostat {
      padding: 22px 18px;
    }

    .target-controls {
      grid-template-columns: 40px minmax(78px, 1fr) 40px;
      gap: 9px;
    }

    .temperature-button {
      width: 40px;
      height: 40px;
    }

    .humidity {
      min-height: 276px;
      padding: 18px;
    }

    .option {
      gap: 8px;
      padding: 0 10px;
    }

    .option > svg {
      width: 23px;
      height: 23px;
    }

    .sensor {
      flex-direction: column;
      align-items: flex-start;
      gap: 9px;
      padding: 0 14px;
    }
  }

  @container (max-width: 440px) {
    .header {
      align-items: flex-start;
    }

    .status {
      min-height: 31px;
      padding: 0 11px;
      font-size: 11px;
    }

    .hero {
      grid-template-columns: 1fr;
    }

    .thermostat {
      border-right: 0;
      border-bottom: 1px solid var(--divider-color, #dfe6eb);
    }

    .hero.temperature-only .thermostat {
      display: block;
      border-bottom: 0;
    }

    .hero.temperature-only .target-block {
      margin-top: 23px;
    }

    .humidity {
      min-height: 240px;
    }

    .humidity-ring {
      width: 200px;
    }

    .history-heading {
      align-items: flex-start;
      flex-direction: column;
      gap: 10px;
    }

    .chart-layout {
      grid-template-columns: 38px minmax(0, 1fr) 34px;
      gap: 5px;
    }

    .chart-layout.temperature-only {
      grid-template-columns: 38px minmax(0, 1fr);
    }

    .x-axis {
      margin-right: 39px;
      margin-left: 43px;
    }

    .x-axis.temperature-only {
      margin-right: 0;
    }

    .x-axis span:nth-child(even) {
      visibility: hidden;
    }

    .sensors {
      grid-template-columns: 1fr;
      gap: 0;
    }

    .sensor,
    .sensor:first-child,
    .sensor:last-child {
      min-height: 72px;
      flex-direction: row;
      align-items: center;
      padding: 12px 8px;
      border-right: 0;
      border-bottom: 1px solid var(--divider-color, #dfe6eb);
    }

    .sensor:last-child {
      border-bottom: 0;
    }
  }
`;

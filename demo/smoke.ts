import "./demo";
import type { ClimateAirCard } from "../src/climate-air-card";

declare global {
  interface Window {
    __climateAirSmokeErrors?: string[];
  }
}

const card = document.querySelector("climate-air-card") as ClimateAirCard;
const result = document.querySelector("#result") as HTMLPreElement;

setTimeout(async () => {
  const root = card.shadowRoot;
  const plus = root?.querySelector<HTMLButtonElement>(
    'button[aria-label="Raise target temperature"]'
  );
  const mode = root?.querySelector<HTMLSelectElement>('select[aria-label="Climate mode"]');
  const fan = root?.querySelector<HTMLSelectElement>('select[aria-label="Fan mode"]');

  plus?.click();
  await new Promise((resolve) => setTimeout(resolve, 30));
  if (mode) {
    mode.value = "cool";
    mode.dispatchEvent(new Event("change", { bubbles: true }));
  }
  await new Promise((resolve) => setTimeout(resolve, 30));
  if (fan) {
    fan.value = "high";
    fan.dispatchEvent(new Event("change", { bubbles: true }));
  }

  setTimeout(() => {
    const text = root?.textContent ?? "";
    const passed =
      text.includes("23.5") &&
      text.includes("Cooling") &&
      mode?.value === "cool" &&
      fan?.value === "high" &&
      (window.__climateAirSmokeErrors?.length ?? 0) === 0;
    document.body.dataset.smoke = passed ? "passed" : "failed";
    document.body.dataset.consoleErrors = String(
      window.__climateAirSmokeErrors?.length ?? 0
    );
    result.textContent = passed
      ? "passed: temperature, HVAC mode and fan mode controls"
      : "failed: one or more climate controls did not update";
  }, 100);
}, 100);

import "./demo";
import type { ClimateAirCard } from "../src/climate-air-card";

const card = document.querySelector("climate-air-card") as ClimateAirCard;
const nearRightEdge = new URLSearchParams(window.location.search).has("edge");

setTimeout(() => {
  const chart = card.shadowRoot?.querySelector<HTMLElement>(".chart-wrap");
  if (!chart) return;
  const bounds = chart.getBoundingClientRect();
  chart.dispatchEvent(
    new PointerEvent("pointermove", {
      bubbles: true,
      pointerType: "mouse",
      clientX: bounds.left + bounds.width * (nearRightEdge ? 0.92 : 0.53),
      clientY: bounds.top + bounds.height * 0.52
    })
  );
  document.body.dataset.hoverReady = "true";
}, 150);

import { describe, expect, it } from "vitest";
import {
  chartPositionPercent,
  chartTooltipPosition,
  nearestChartPointIndex
} from "../src/chart";

describe("climate chart inspection", () => {
  it("selects the nearest history point and clamps to the chart", () => {
    expect(nearestChartPointIndex(100, 100, 560, 25)).toBe(0);
    expect(nearestChartPointIndex(380, 100, 560, 25)).toBe(12);
    expect(nearestChartPointIndex(900, 100, 560, 25)).toBe(24);
  });

  it("positions the selected point as a percentage", () => {
    expect(chartPositionPercent(0, 25)).toBe(0);
    expect(chartPositionPercent(24, 25)).toBe(100);
    expect(chartPositionPercent(4, 1)).toBe(0);
  });

  it("keeps the tooltip beside the pointer and flips before the right edge", () => {
    expect(chartTooltipPosition(240, 75, 560, 150)).toMatchObject({
      x: 240,
      placement: "place-right"
    });
    expect(chartTooltipPosition(460, 75, 560, 150)).toMatchObject({
      x: 460,
      placement: "place-left"
    });
  });
});

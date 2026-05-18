import { describe, expect, it } from "vitest";
import { formatSeconds } from "@/lib/format";

describe("formatSeconds", () => {
  it("formats playback time with hours minutes and seconds", () => {
    expect(formatSeconds(3665)).toBe("1 giờ 1 phút 5 giây");
    expect(formatSeconds(65)).toBe("0 giờ 1 phút 5 giây");
    expect(formatSeconds(null)).toBe("0 giờ 0 phút 0 giây");
  });
});

import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AnalyticsTracker from ".";
import api from "api/axios";
import { ANALYTICS_STORAGE_KEYS } from "utils/analytics";

vi.mock("api/axios", () => ({ default: vi.fn() }));

const storage = () => {
  const values = new Map();
  return {
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, String(value)),
  };
};

describe("AnalyticsTracker privacy boundary", () => {
  beforeEach(() => {
    api.mockReset();
    vi.stubGlobal("localStorage", storage());
    vi.stubGlobal("sessionStorage", storage());
    localStorage.clear();
    sessionStorage.clear();
    api.mockResolvedValue({ data: {} });
    Object.defineProperty(navigator, "doNotTrack", { configurable: true, value: "0" });
    Object.defineProperty(navigator, "globalPrivacyControl", { configurable: true, value: false });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("sends pathname and anonymous UUIDs without query data", async () => {
    vi.stubEnv("VITE_ANALYTICS_ENABLED", "true");

    render(<MemoryRouter initialEntries={["/san-pham?q=private"]}><AnalyticsTracker /></MemoryRouter>);

    await waitFor(() => expect(api).toHaveBeenCalledTimes(1));
    const payload = api.mock.calls[0][0].data;
    expect(payload.path).toBe("/san-pham");
    expect(payload.path).not.toContain("private");
    expect(payload.visitor_id).toMatch(/^[0-9a-f-]{36}$/i);
    expect(payload.session_id).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it.each([
    ["feature flag", "false", "0", null],
    ["Do Not Track", "true", "1", null],
    ["local opt out", "true", "0", "1"],
  ])("does not send when %s blocks tracking", async (_, flag, dnt, optOut) => {
    vi.stubEnv("VITE_ANALYTICS_ENABLED", flag);
    Object.defineProperty(navigator, "doNotTrack", { configurable: true, value: dnt });
    if (optOut) localStorage.setItem(ANALYTICS_STORAGE_KEYS.optOut, optOut);

    render(<MemoryRouter><AnalyticsTracker /></MemoryRouter>);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(api).not.toHaveBeenCalled();
  });
});

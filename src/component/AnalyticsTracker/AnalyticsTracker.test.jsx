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
    api
      .mockResolvedValueOnce({
        token: "server-issued-token",
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      })
      .mockResolvedValue({});
    Object.defineProperty(navigator, "doNotTrack", { configurable: true, value: "0" });
    Object.defineProperty(navigator, "globalPrivacyControl", { configurable: true, value: false });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("requests a server session then sends pathname with the signed token", async () => {
    vi.stubEnv("VITE_ANALYTICS_ENABLED", "true");

    render(<MemoryRouter initialEntries={["/san-pham?q=private"]}><AnalyticsTracker /></MemoryRouter>);

    await waitFor(() => expect(api).toHaveBeenCalledTimes(2));
    expect(api.mock.calls[0][0]).toEqual(expect.objectContaining({
      url: "/analytics/session",
      method: "POST",
    }));
    const request = api.mock.calls[1][0];
    const payload = request.data;
    expect(payload.path).toBe("/san-pham");
    expect(payload.path).not.toContain("private");
    expect(payload).not.toHaveProperty("visitor_id");
    expect(payload).not.toHaveProperty("session_id");
    expect(request.headers["X-Analytics-Token"]).toBe("server-issued-token");
  });

  it("reissues the analytics session once when the server binding changes", async () => {
    vi.stubEnv("VITE_ANALYTICS_ENABLED", "true");
    api.mockReset()
      .mockResolvedValueOnce({
        token: "stale-token",
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      })
      .mockRejectedValueOnce({ response: { status: 401 } })
      .mockResolvedValueOnce({
        token: "replacement-token",
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      })
      .mockResolvedValueOnce({});

    render(<MemoryRouter initialEntries={["/san-pham"]}><AnalyticsTracker /></MemoryRouter>);

    await waitFor(() => expect(api).toHaveBeenCalledTimes(4));
    expect(api.mock.calls[2][0]).toEqual(expect.objectContaining({
      url: "/analytics/session",
      method: "POST",
    }));
    expect(api.mock.calls[3][0].headers["X-Analytics-Token"]).toBe("replacement-token");
    expect(JSON.parse(sessionStorage.getItem(ANALYTICS_STORAGE_KEYS.session)).token).toBe("replacement-token");
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

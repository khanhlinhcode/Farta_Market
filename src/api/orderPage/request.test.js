import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "api/axios";
import { createVNPayPaymentAPI, postOrderAPI } from "./request";

vi.mock("api/axios", () => ({ default: vi.fn() }));

describe("order analytics attribution header", () => {
  beforeEach(() => axios.mockReset());

  it.each([
    [postOrderAPI, "/order"],
    [createVNPayPaymentAPI, "/payment/create"],
  ])("keeps idempotency and adds the optional signed analytics token", async (request, url) => {
    await request({ products: [] }, "idem-1", "server-issued-token");

    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      url,
      headers: expect.objectContaining({
        "X-Idempotency-Key": "idem-1",
        "X-Analytics-Token": "server-issued-token",
      }),
    }));
  });

  it("omits analytics attribution when tracking is disabled", async () => {
    await postOrderAPI({ products: [] }, "idem-2", null);
    expect(axios.mock.calls[0][0].headers).not.toHaveProperty("X-Analytics-Token");
  });
});

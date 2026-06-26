import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "api/axios";
import { getAdminProductsAPI } from "./request";

vi.mock("api/axios", () => ({
  default: vi.fn(),
}));

describe("getAdminProductsAPI", () => {
  beforeEach(() => {
    axios.mockReset();
  });

  it("requests the selected admin product page instead of a fixed first 50 items", async () => {
    axios.mockResolvedValue({
      data: [],
      meta: { current_page: 3, last_page: 4, total: 75 },
    });

    await getAdminProductsAPI({ page: 3, per_page: 20 });

    expect(axios).toHaveBeenCalledWith({
      url: "/admin/products",
      method: "GET",
      params: {
        page: 3,
        per_page: 20,
      },
    });
  });
});


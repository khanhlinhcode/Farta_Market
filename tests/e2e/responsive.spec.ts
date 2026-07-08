import { expect, test } from "@playwright/test";

const viewports = [
  { width: 320, height: 740 },
  { width: 768, height: 900 },
  { width: 1024, height: 900 },
  { width: 1440, height: 1000 },
];

async function expectNoHorizontalOverflow(page) {
  const hasOverflow = await page.evaluate(() => {
    const documentWidth = document.documentElement.scrollWidth;
    const viewportWidth = document.documentElement.clientWidth;

    return documentWidth > viewportWidth + 2;
  });

  expect(hasOverflow).toBe(false);
}

for (const viewport of viewports) {
  test(`responsive smoke at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);

    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Farta Market" }).first()).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.goto("/gio-hang");
    await expectNoHorizontalOverflow(page);

    await page.goto("/thanh-toan");
    await expect(page.locator(".checkout__order")).toBeVisible();
    await expect(page.locator(".checkout__payment-method label").first()).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.goto("/san-pham/chi-tiet/1");
    await expect(page.locator(".product-detail-layout")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
}

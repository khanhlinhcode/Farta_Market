import { expect, test } from "@playwright/test";

test("chat responds to product query", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("chat-bubble").click();
  await page.getByTestId("chat-input").fill("Cam tươi còn không?");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("chat-message-bot").last()).toContainText(
    "Cam",
    { timeout: 15_000 }
  );
});

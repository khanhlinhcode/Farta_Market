import { expect, test } from "@playwright/test";

type Box = { x: number; y: number; width: number; height: number };

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

function boxesOverlap(first: Box, second: Box) {
  return (
    first.x < second.x + second.width &&
    first.x + first.width > second.x &&
    first.y < second.y + second.height &&
    first.y + first.height > second.y
  );
}

function parseCssRgb(color: string) {
  const channels = color.match(/[\d.]+/g)?.slice(0, 3).map(Number);

  if (!channels || channels.length !== 3) {
    throw new Error(`Unsupported CSS color: ${color}`);
  }

  return channels;
}

function relativeLuminance(color: string) {
  const [red, green, blue] = parseCssRgb(color).map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground: string, background: string) {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));

  return (lighter + 0.05) / (darker + 0.05);
}

for (const viewport of viewports) {
  test(`responsive smoke at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);

    await page.goto("/");
    await expect(page.getByRole("heading", { name: /^Farta\s*Market$/i }).first()).toBeVisible();
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

test("product detail keeps a stable skeleton while data is loading", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.route("**/api/products/1", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 900));
    await route.continue();
  });

  await page.goto("/san-pham/chi-tiet/1");
  const skeleton = page.locator(".product-detail-skeleton");
  await expect(skeleton).toBeVisible();
  await expect(skeleton).toHaveAttribute("aria-busy", "true");
  await expect(page.locator("h1.product__detail__state")).toHaveCount(0);
  expect(await skeleton.evaluate((element) => element.getBoundingClientRect().height))
    .toBeGreaterThanOrEqual(700);
  await expect(page.locator(".product-detail-layout")).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

for (const viewport of [
  { width: 320, height: 740 },
  { width: 390, height: 844 },
]) {
  test(`chat bubble clears visible product actions at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");

    await expect(page.locator(".featured--recommended .featured__item")).toHaveCount(4);
    const bubbleBox = await page.getByTestId("chat-bubble").boundingBox();
    const actionBoxes = await page
      .locator(".featured--recommended .featured__item__action")
      .evaluateAll((elements) =>
        elements
          .filter((element) => {
            const styles = getComputedStyle(element);
            return styles.display !== "none" && styles.visibility !== "hidden";
          })
          .map((element) => {
            const box = element.getBoundingClientRect();
            return { x: box.x, y: box.y, width: box.width, height: box.height };
          })
      );

    expect(bubbleBox).not.toBeNull();
    expect(actionBoxes.length).toBeGreaterThan(0);
    for (const actionBox of actionBoxes) {
      expect(boxesOverlap(bubbleBox, actionBox)).toBe(false);
    }
  });
}

test("storefront navigation, cards and chat adapt without overlap", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.locator(".search-bar input")).toHaveAccessibleName(/.+/);
  const newsletterInput = page.locator(".footer .input-group input");
  await expect(newsletterInput).toHaveAccessibleName(/.+/);
  await newsletterInput.fill("customer@example.com");
  await page.locator(".footer .button-submit").click();
  await expect(page.locator(".footer__message")).toHaveAttribute("aria-live", "polite");

  const logo = page.locator(".header__main__logo");
  const menuButton = page.locator(".header-mobile-menu-button");
  const [logoBox, menuBox] = await Promise.all([logo.boundingBox(), menuButton.boundingBox()]);
  expect(logoBox).not.toBeNull();
  expect(menuBox).not.toBeNull();
  expect(logoBox.x + logoBox.width).toBeLessThanOrEqual(menuBox.x);

  const mobileCategoryButton = page.locator(".hero__categories__all");
  const mobileCategoryList = page.locator("#product-category-list");
  await mobileCategoryButton.click();
  await expect(mobileCategoryList).toBeVisible();
  const [mobileCategoryButtonBox, mobileCategoryListBox] = await Promise.all([
    mobileCategoryButton.boundingBox(),
    mobileCategoryList.boundingBox(),
  ]);
  expect(mobileCategoryButtonBox).not.toBeNull();
  expect(mobileCategoryListBox).not.toBeNull();
  expect(Math.abs(mobileCategoryButtonBox.x - mobileCategoryListBox.x))
    .toBeLessThanOrEqual(1);
  expect(Math.abs(mobileCategoryButtonBox.width - mobileCategoryListBox.width))
    .toBeLessThanOrEqual(1);
  await mobileCategoryButton.click();

  const mobileRecommendedCards = page.locator(
    ".featured--recommended .featured__item"
  );
  await expect(mobileRecommendedCards).toHaveCount(4);
  const [mobileFirstCardBox, mobileSecondCardBox] = await Promise.all([
    mobileRecommendedCards.nth(0).boundingBox(),
    mobileRecommendedCards.nth(1).boundingBox(),
  ]);
  expect(mobileFirstCardBox).not.toBeNull();
  expect(mobileSecondCardBox).not.toBeNull();
  expect(mobileSecondCardBox.x - (mobileFirstCardBox.x + mobileFirstCardBox.width))
    .toBeGreaterThanOrEqual(12);

  await page.getByTestId("chat-bubble").click();
  const chatPanel = page.locator(".chat-widget__panel");
  const chatInput = chatPanel.locator("textarea");
  const [chatBox, chatInputBox, panelBackground] = await Promise.all([
    chatPanel.boundingBox(),
    chatInput.boundingBox(),
    chatPanel.evaluate((element) => getComputedStyle(element).backgroundColor),
  ]);
  expect(chatBox).not.toBeNull();
  expect(chatInputBox).not.toBeNull();
  expect(chatBox.x).toBeGreaterThanOrEqual(0);
  expect(chatBox.x + chatBox.width).toBeLessThanOrEqual(390);
  expect(chatBox.width / 390).toBeGreaterThanOrEqual(0.9);
  expect(chatInputBox.y + chatInputBox.height).toBeLessThanOrEqual(844);
  expect(chatInputBox.x).toBeGreaterThanOrEqual(chatBox.x);
  expect(chatInputBox.x + chatInputBox.width).toBeLessThanOrEqual(chatBox.x + chatBox.width);
  expect(panelBackground).toBe("rgb(255, 255, 255)");

  await page.goto("/san-pham");
  await page.locator(".product-filter-toggle").click();
  await expect(page.locator("#product-filter-sidebar")).toBeVisible();
  await expect(page.locator(".product-filter-search input")).toHaveAccessibleName(/.+/);
  const priceInputs = page.locator('.price-range-wrap input[type="number"]');
  await expect(priceInputs).toHaveCount(2);
  await expect(priceInputs.nth(0)).toHaveAccessibleName(/.+/);
  await expect(priceInputs.nth(1)).toHaveAccessibleName(/.+/);
  await page.locator(".product-filter-mobile-header button").click();

  const breadcrumbColors = await page.locator(".breadcrumb li").last().evaluate((element) => ({
    foreground: getComputedStyle(element).color,
    background: getComputedStyle(element.closest(".breadcrumb")).backgroundColor,
  }));
  expect(contrastRatio(breadcrumbColors.foreground, breadcrumbColors.background))
    .toBeGreaterThanOrEqual(4.5);

  const firstCard = page.locator(".product-grid .featured__item").first();
  const firstCardLink = firstCard.locator(".featured__item__primary-link");
  await expect(firstCardLink).toBeVisible();
  const [cardBox, cardLinkBox, imageBox] = await Promise.all([
    firstCard.boundingBox(),
    firstCardLink.boundingBox(),
    firstCard.locator(".featured__item__pic").boundingBox(),
  ]);
  expect(cardBox).not.toBeNull();
  expect(cardLinkBox).not.toBeNull();
  expect(imageBox).not.toBeNull();
  expect(Math.abs(cardBox.width - cardLinkBox.width)).toBeLessThanOrEqual(2);
  expect(Math.abs(imageBox.width - imageBox.height)).toBeLessThanOrEqual(1);
  await firstCardLink.click();
  await expect(page).toHaveURL(/\/san-pham\/chi-tiet\/\d+$/);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const desktopOverlay = page.locator(".hunberger__menu__overlay");
  await expect(desktopOverlay).toBeHidden();
  const headerTopBox = await page.locator(".header__top").boundingBox();
  expect(headerTopBox).not.toBeNull();
  expect(headerTopBox.y).toBe(0);
  const headerMainSurface = await page.locator(".header__main").evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      backgroundColor: styles.backgroundColor,
      borderTopWidth: styles.borderTopWidth,
      backdropFilter: styles.backdropFilter,
    };
  });
  expect(headerMainSurface).toEqual({
    backgroundColor: "rgba(0, 0, 0, 0)",
    borderTopWidth: "0px",
    backdropFilter: "none",
  });

  const [desktopCategoryButtonBox, desktopCategoryListBox] = await Promise.all([
    page.locator(".hero__categories__all").boundingBox(),
    page.locator("#product-category-list").boundingBox(),
  ]);
  expect(desktopCategoryButtonBox).not.toBeNull();
  expect(desktopCategoryListBox).not.toBeNull();
  expect(Math.abs(desktopCategoryButtonBox.x - desktopCategoryListBox.x))
    .toBeLessThanOrEqual(1);
  expect(Math.abs(desktopCategoryButtonBox.width - desktopCategoryListBox.width))
    .toBeLessThanOrEqual(1);
  expect(Math.abs(
    desktopCategoryButtonBox.y + desktopCategoryButtonBox.height - desktopCategoryListBox.y
  )).toBeLessThanOrEqual(1);

  const desktopRecommendedCards = page.locator(
    ".featured--recommended .featured__item"
  );
  const [desktopFirstCardBox, desktopSecondCardBox] = await Promise.all([
    desktopRecommendedCards.nth(0).boundingBox(),
    desktopRecommendedCards.nth(1).boundingBox(),
  ]);
  expect(desktopFirstCardBox).not.toBeNull();
  expect(desktopSecondCardBox).not.toBeNull();
  expect(desktopSecondCardBox.x - (desktopFirstCardBox.x + desktopFirstCardBox.width))
    .toBeGreaterThanOrEqual(18);

  await page.goto("/san-pham");
  await expect(page.locator("nav.header__menu .header__menu__dropdown")).toHaveCount(0);
  const wishlistButton = firstCard.locator(".featured__item__wishlist-button");
  await wishlistButton.focus();
  await expect(wishlistButton).toBeFocused();
  await expect(firstCard.locator(".featured__item__pic__hover")).toHaveCSS("opacity", "1");
  expect(await firstCard.locator(".featured__item__pic").evaluate((element) => element.scrollTop))
    .toBe(0);
  const columns = await page.locator(".product-grid").evaluate((element) =>
    getComputedStyle(element).gridTemplateColumns.split(" ").filter(Boolean).length
  );
  expect(columns).toBe(3);
  await expectNoHorizontalOverflow(page);
});

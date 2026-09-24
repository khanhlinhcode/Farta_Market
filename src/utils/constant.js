export const SESSION_KEYS = {
  CART: "cart",
  CART_OWNER: "farta_cart_owner",
  WISHLIST_IDS: "farta_wishlist_ids",
};

export const CART_SESSION_TTL_MS = 60 * 60 * 1000;

export const MAX_CART_LINE_QUANTITY = 100;
export const getCartLineLimit = (inventory) => {
  const stock = Number(inventory);
  return Number.isFinite(stock) ? Math.max(0, Math.min(Math.floor(stock), MAX_CART_LINE_QUANTITY)) : 0;
};

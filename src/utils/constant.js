export const SESSION_KEYS = {
  CART: "cart",
  LAST_ORDER_SUCCESS: "farta_last_order_success",
  WISHLIST_IDS: "farta_wishlist_ids",
};

export const MAX_CART_LINE_QUANTITY = 100;
export const getCartLineLimit = (inventory) => {
  const stock = Number(inventory);
  return Number.isFinite(stock) ? Math.max(0, Math.min(Math.floor(stock), MAX_CART_LINE_QUANTITY)) : 0;
};

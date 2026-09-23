import { useCallback, useEffect } from "react";
import { useDispatch, useStore } from "react-redux";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { calculateCart, emptyCart, normalizeCart, setCart } from "../redux/cartSlice";
import { CART_SESSION_TTL_MS, getCartLineLimit, SESSION_KEYS } from "../utils/constant";
import {
  getExpiringSessionItem,
  removeSessionItem,
  setExpiringSessionItem,
} from "utils/session";

const useShoppingCart = () => {
  const dispatch = useDispatch();
  const store = useStore();
  const { t } = useTranslation();

  const persistCart = useCallback((products) => {
    const cart = calculateCart(products);
    setExpiringSessionItem(SESSION_KEYS.CART, cart, CART_SESSION_TTL_MS);
    dispatch(setCart(cart));
    return cart;
  }, [dispatch]);

  const getCart = useCallback(() => {
    const stored = getExpiringSessionItem(SESSION_KEYS.CART, emptyCart);
    const cart = normalizeCart(stored);
    if (JSON.stringify(stored) !== JSON.stringify(cart)) {
      persistCart(cart.products);
      toast(t("cart.adjusted"));
    }
    return cart;
  }, [persistCart, t]);

  useEffect(() => {
    const cart = getCart();
    if (JSON.stringify(store.getState().commonSlide.cart) !== JSON.stringify(cart)) {
      dispatch(setCart(cart));
    }
  }, [dispatch, getCart, store]);

  const addToCart = (product, quantity, { notify = true } = {}) => {
    const cart = getCart();
    const maxInventory = getCartLineLimit(product?.inventory);
    const id = Number(product?.id);
    const valid = product && Number.isInteger(id) && id > 0 &&
      Number.isInteger(quantity) && quantity > 0 && Number.isFinite(Number(product.price)) && Number(product.price) >= 0;
    const products = [...cart.products];
    const index = products.findIndex((item) => item.product.id === id);
    const currentQuantity = index >= 0 ? products[index].quantity : 0;
    const totalQuantity = valid ? Math.min(currentQuantity + quantity, maxInventory) : currentQuantity;
    const addedCount = valid ? Math.max(0, totalQuantity - currentQuantity) : 0;
    let newCart = cart;

    if (valid && maxInventory > 0) {
      const line = { product: { ...product, id }, quantity: totalQuantity };
      if (index >= 0) products[index] = line;
      else products.push(line);
      newCart = persistCart(products);
    } else if (valid && index >= 0) {
      newCart = persistCart(products.filter((item) => item.product.id !== id));
    }

    if (notify) {
      if (addedCount === 0) toast.error(t("cart.nothingAdded"));
      else toast.success(t(addedCount < quantity ? "cart.partiallyAdded" : "cart.addedCount", {
        count: addedCount, requested: quantity,
      }));
    }
    return { cart: newCart, addedCount, totalQuantity, maxInventory };
  };

  const removeCart = (id) => persistCart(getCart().products.filter(({ product }) => product.id !== Number(id)));

  const updateCartQuantity = (id, quantity) => {
    const cart = getCart();
    if (!Number.isInteger(quantity) || quantity < 1) return cart;
    return persistCart(cart.products.map((item) => item.product.id === Number(id)
      ? { ...item, quantity: Math.min(quantity, getCartLineLimit(item.product.inventory)) }
      : item));
  };

  const clearCart = () => {
    removeSessionItem(SESSION_KEYS.CART);
    dispatch(setCart(emptyCart));
    return emptyCart;
  };

  return { addToCart, removeCart, updateCartQuantity, clearCart, getCart, emptyCart };
};
export default useShoppingCart;

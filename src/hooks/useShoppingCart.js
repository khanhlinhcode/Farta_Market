import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { calculateCart, emptyCart, normalizeCart, setCart } from "../redux/cartSlice";
import { CART_SESSION_TTL_MS, getCartLineLimit, SESSION_KEYS } from "../utils/constant";
import {
  getExpiringSessionItem,
  removeSessionItem,
  setExpiringSessionItem,
} from "utils/session";
import { selectAuthBootstrapped, selectCustomerUser } from "../redux/authSlice";
import { ROUTERS } from "utils/router";

const useShoppingCart = () => {
  const dispatch = useDispatch();
  const store = useStore();
  const { t } = useTranslation();
  const currentUser = useSelector(selectCustomerUser);
  const isBootstrapped = useSelector(selectAuthBootstrapped);
  const redirectingRef = useRef(false);
  const ownerId = Number(currentUser?.id || 0);

  const clearCart = useCallback(() => {
    removeSessionItem(SESSION_KEYS.CART);
    removeSessionItem(SESSION_KEYS.CART_OWNER);
    dispatch(setCart(emptyCart));
    return emptyCart;
  }, [dispatch]);

  const redirectToLogin = useCallback(() => {
    if (redirectingRef.current || typeof window === "undefined") return;
    redirectingRef.current = true;
    const candidate = `${window.location.pathname || "/"}${window.location.search || ""}`;
    const redirect = candidate.startsWith("/") && !candidate.startsWith("//") ? candidate : "/";
    const target = `${ROUTERS.USER.LOGIN}?redirect=${encodeURIComponent(redirect)}`;
    window.history.pushState({}, "", target);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, []);

  const requireCartAuth = useCallback(({ notify = true, redirect = true } = {}) => {
    if (!isBootstrapped) {
      if (notify) toast.error(t("cart.sessionChecking"));
      return { ok: false, reason: "AUTH_PENDING", addedCount: 0 };
    }
    if (!currentUser) {
      if (notify) toast.error(t("cart.loginRequired"));
      if (redirect) redirectToLogin();
      return { ok: false, reason: "AUTH_REQUIRED", addedCount: 0 };
    }

    return { ok: true, reason: null };
  }, [currentUser, isBootstrapped, redirectToLogin, t]);

  const persistCart = useCallback((products) => {
    if (!isBootstrapped || !currentUser) {
      return emptyCart;
    }
    const cart = calculateCart(products);
    setExpiringSessionItem(SESSION_KEYS.CART, cart, CART_SESSION_TTL_MS);
    setExpiringSessionItem(SESSION_KEYS.CART_OWNER, ownerId, CART_SESSION_TTL_MS);
    dispatch(setCart(cart));
    return cart;
  }, [currentUser, dispatch, isBootstrapped, ownerId]);

  const getCart = useCallback(() => {
    if (!isBootstrapped || !currentUser) return emptyCart;
    if (Number(getExpiringSessionItem(SESSION_KEYS.CART_OWNER, 0)) !== ownerId) return emptyCart;
    const stored = getExpiringSessionItem(SESSION_KEYS.CART, emptyCart);
    const cart = normalizeCart(stored);
    if (JSON.stringify(stored) !== JSON.stringify(cart)) {
      persistCart(cart.products);
      toast(t("cart.adjusted"));
    }
    return cart;
  }, [currentUser, isBootstrapped, ownerId, persistCart, t]);

  useEffect(() => {
    if (!isBootstrapped) return;
    redirectingRef.current = false;
    if (!currentUser || Number(getExpiringSessionItem(SESSION_KEYS.CART_OWNER, 0)) !== ownerId) {
      clearCart();
      return;
    }
    const cart = getCart();
    if (JSON.stringify(store.getState().commonSlide.cart) !== JSON.stringify(cart)) {
      dispatch(setCart(cart));
    }
  }, [clearCart, currentUser, dispatch, getCart, isBootstrapped, ownerId, store]);

  const addToCart = (product, quantity, { notify = true } = {}) => {
    const gate = requireCartAuth({ notify });
    if (!gate.ok) return { ...gate, cart: emptyCart, totalQuantity: 0, maxInventory: 0 };
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
    return { ok: true, reason: null, cart: newCart, addedCount, totalQuantity, maxInventory };
  };

  const removeCart = (id) => {
    const gate = requireCartAuth();
    if (!gate.ok) return { ...gate, cart: emptyCart, addedCount: 0 };
    return { ok: true, reason: null, cart: persistCart(getCart().products.filter(({ product }) => product.id !== Number(id))), addedCount: 0 };
  };

  const updateCartQuantity = (id, quantity) => {
    const gate = requireCartAuth();
    if (!gate.ok) return { ...gate, cart: emptyCart, addedCount: 0 };
    const cart = getCart();
    if (!Number.isInteger(quantity) || quantity < 1) return { ok: false, reason: "INVALID_QUANTITY", cart, addedCount: 0 };
    return { ok: true, reason: null, cart: persistCart(cart.products.map((item) => item.product.id === Number(id)
      ? { ...item, quantity: Math.min(quantity, getCartLineLimit(item.product.inventory)) }
      : item)), addedCount: 0 };
  };

  return {
    addToCart,
    removeCart,
    updateCartQuantity,
    clearCart,
    getCart,
    requireCartAuth,
    canMutateCart: isBootstrapped && Boolean(currentUser),
    authPending: !isBootstrapped,
    emptyCart,
  };
};
export default useShoppingCart;

import { useDispatch } from "react-redux";
import { setCart } from "../redux/commonSlide";
import { SESSION_KEYS } from "../utils/constant";
import { getSessionItem, removeSessionItem, setSessionItem } from "utils/session";

const emptyCart = {
  products: [],
  totalPrice: 0,
  totalQuantity: 0,
};

const calculateCart = (products) => ({
  products,
  totalPrice: products.reduce((sum, item) => {
    return sum + Number(item.product.price || 0) * Number(item.quantity || 0);
  }, 0),
  totalQuantity: products.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
});

const useShoppingCart = () => {
  const dispatch = useDispatch();
  const getCart = () => getSessionItem(SESSION_KEYS.CART, emptyCart);

  const persistCart = (products) => {
    const newCart = calculateCart(products);
    setSessionItem(SESSION_KEYS.CART, newCart);
    dispatch(setCart(newCart));

    return newCart;
  };

  const addToCart = (product, quantity) => {
    if (!product || quantity < 1) {
      return getCart();
    }

    const maxInventory = Number(product.inventory || 0);
    if (maxInventory <= 0) {
      return getCart();
    }

    const cart = getCart();
    const products = [...cart.products];
    const producstIndex = products?.findIndex(
      (c) => c.product.id === product.id
    );

    if (producstIndex >= 0) {
      const currentQuantity = Number(products[producstIndex].quantity || 0);
      products[producstIndex] = {
        ...products[producstIndex],
        product,
        quantity: Math.min(currentQuantity + quantity, maxInventory),
      };
    } else {
      products.push({
        product,
        quantity: Math.min(quantity, maxInventory),
      });
    }

    return persistCart(products);
  };

  const removeCart = (id) => {
    const cart = getCart();
    if (window.confirm("Bạn có chắc chắn muốn xoá khỏi giỏ hàng không")) {
      const products = cart.products.filter(({ product }) => product.id !== id);

      return persistCart(products);
    }

    return cart;
  };

  const updateCartQuantity = (id, quantity) => {
    const cart = getCart();
    const products = cart.products.map((item) =>
      item.product.id === id
        ? {
            ...item,
            quantity: Math.min(
              Math.max(1, Number(quantity) || 1),
              Number(item.product.inventory || 1)
            ),
          }
        : item
    );

    return persistCart(products);
  };

  const clearCart = () => {
    removeSessionItem(SESSION_KEYS.CART);
    dispatch(setCart(emptyCart));

    return emptyCart;
  };

  return { addToCart, removeCart, updateCartQuantity, clearCart, emptyCart };
};
export default useShoppingCart;

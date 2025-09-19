import { ReactSession } from "react-client-session";
import { SESSION_KEYS } from "../utils/constant";
const useShoppingCart = () => {
  const addToCart = (product, quantity) => {
    const cart = ReactSession.get(SESSION_KEYS.CART);
    const products = cart ? cart.products : [];
    const producstIndex = products?.findIndex(
      (c) => c.product.id === product.id
    );
    if (producstIndex >= 0) {
      products[producstIndex].quantity += quantity;
    } else {
      products.push({
        product,
        quantity,
      });
    }
    const totalPrice = products.reduce((sum, item) => {
      return sum + item.product.price*item.quantity;
    },0);

    const newCart = {
        totalQuantity: products.lenght,
        totalPrice,
        products,
    };
      ReactSession.set(SESSION_KEYS.CART, newCart);
      alert('Đã Thêm Sản phẩm vào giỏ hàng')
  };
  return { addToCart };
};
export default useShoppingCart;

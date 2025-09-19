import useShoppingCart from "hooks/useShoppingCart";
import React, { memo, useState } from "react";
import "./style.scss";
import { SESSION_KEYS } from "utils/constant";
import { ReactSession } from "react-client-session";
const Quantity = ({ hasAddToCart = true, product }) => {
  const { addToCart } = useShoppingCart();
  const [quantity, setQuantity] = useState(1); // Sửa chỗ này

  const incrementQuantity = (isPlus) => {
    if (!isPlus && quantity === 0) {
      return;
    }
    setQuantity(isPlus ? quantity + 1 : quantity - 1);
  };

  return (
    <div className="quantity-container">
      <div className="quantity">
        <span className="qtybtn" onClick={() => incrementQuantity(false)}>
          -
        </span>
        <input type="number" value={quantity} readOnly />
        <span className="qtybtn" onClick={() => incrementQuantity(true)}>
          +
        </span>
      </div>
      {hasAddToCart && (
        <button
          type="button"
          className="button-submit"
          onClick={() => {
            addToCart(product, quantity); // gửi đúng quantity người dùng chọn
            const curCart = ReactSession.get(SESSION_KEYS.CART);
            console.log(curCart);
          }}
        >
          Thêm Giỏ Hàng
        </button>
      )}
    </div>
  );
};

export default memo(Quantity);

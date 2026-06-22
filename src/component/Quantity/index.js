import useShoppingCart from "hooks/useShoppingCart";
import React, { memo, useState } from "react";
import "./style.scss";
const Quantity = ({
  hasAddToCart = true,
  product,
  initQuantity,
  maxQuantity,
  onChange,
}) => {
  const { addToCart } = useShoppingCart();
  const max = Math.max(1, Number(maxQuantity || product?.inventory || 1));
  const [quantity, setQuantity] = useState(Math.min(initQuantity || 1, max));

  const incrementQuantity = (isPlus) => {
    if (!isPlus && quantity <= 1) {
      return;
    }

    if (isPlus && quantity >= max) {
      return;
    }

    const nextQuantity = isPlus ? quantity + 1 : quantity - 1;
    setQuantity(nextQuantity);
    onChange?.(nextQuantity);
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
          disabled={!product || Number(product.inventory || 0) <= 0}
          onClick={() => {
            addToCart(product, quantity); // gửi đúng quantity người dùng chọn
          }}
        >
          {Number(product?.inventory || 0) > 0 ? "Thêm Giỏ Hàng" : "Hết Hàng"}
        </button>
      )}
    </div>
  );
};

export default memo(Quantity);

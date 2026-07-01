import useShoppingCart from "hooks/useShoppingCart";
import React, { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import "./style.scss";
const Quantity = ({
  hasAddToCart = true,
  product,
  initQuantity,
  maxQuantity,
  onChange,
}) => {
  const { t } = useTranslation();
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
        <button
          type="button"
          className="qtybtn"
          disabled={quantity <= 1}
          onClick={() => incrementQuantity(false)}
        >
          -
        </button>
        <input type="number" value={quantity} readOnly />
        <button
          type="button"
          className="qtybtn"
          disabled={quantity >= max}
          onClick={() => incrementQuantity(true)}
        >
          +
        </button>
      </div>
      {hasAddToCart && (
        <button
          type="button"
          className="button-submit"
          data-testid="add-to-cart"
          disabled={!product || Number(product.inventory || 0) <= 0}
          onClick={() => {
            addToCart(product, quantity);
            toast.success(t("cart.added"));
          }}
        >
          {Number(product?.inventory || 0) > 0
            ? t("productDetail.addToCart")
            : t("productDetail.outOfStock")}
        </button>
      )}
    </div>
  );
};

export default memo(Quantity);

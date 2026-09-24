import useShoppingCart from "hooks/useShoppingCart";
import React, { memo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./style.scss";
import { getCartLineLimit, MAX_CART_LINE_QUANTITY } from "utils/constant";
const Quantity = ({
  hasAddToCart = true,
  product,
  initQuantity,
  maxQuantity,
  onChange,
}) => {
  const { t } = useTranslation();
  const { addToCart, authPending } = useShoppingCart();
  const max = Math.min(getCartLineLimit(product?.inventory), maxQuantity === undefined ? MAX_CART_LINE_QUANTITY : getCartLineLimit(maxQuantity));
  const initial = Number.isInteger(initQuantity) && initQuantity > 0 ? initQuantity : 1;
  const [quantity, setQuantity] = useState(Math.min(initial, max));

  useEffect(() => setQuantity(Math.min(initial, max)), [initial, max, product?.id]);

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
        <input type="number" value={quantity} min={max === 0 ? 0 : 1} max={max} disabled={max === 0} readOnly />
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
          disabled={!product || max === 0 || authPending}
          onClick={() => {
            addToCart(product, quantity);
          }}
        >
          {authPending
            ? t("cart.sessionChecking")
            : Number(product?.inventory || 0) > 0
            ? t("productDetail.addToCart")
            : t("productDetail.outOfStock")}
        </button>
      )}
    </div>
  );
};

export default memo(Quantity);

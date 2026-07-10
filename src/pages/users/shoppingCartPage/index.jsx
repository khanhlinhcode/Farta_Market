import { memo } from "react";
import Breadcrumb from "../theme/breadcrumb";
import "./style.scss";
import { formatter } from "utils/fomater";
import { Button, ConfirmModal, Quantity } from "component";
import { AiOutlineClose } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { ROUTERS } from "utils/router";
import { SESSION_KEYS } from "utils/constant";
import { useState } from "react";
import useShoppingCart from "hooks/useShoppingCart";
import { resolveProductImage } from "utils/productImages";
import { getSessionItem } from "utils/session";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { translateProductName } from "utils/i18nLabels";
const ShoppingCartPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { removeCart, updateCartQuantity, emptyCart } = useShoppingCart();
  const [cart, setCart] = useState(getSessionItem(SESSION_KEYS.CART, emptyCart));
  const [pendingRemoveId, setPendingRemoveId] = useState(null);
  const hasProducts = cart.products.length > 0;
  const pendingProduct = cart.products.find(
    (item) => item.product.id === pendingRemoveId
  )?.product;

  return (
    <>
      <Breadcrumb name={t("cart.title")} />
      {hasProducts ? (
        <div className="container">
          <div className="table__cart">
            <table>
              <thead>
                <tr>
                  <th>{t("cart.name")}</th>
                  <th>{t("cart.price")}</th>
                  <th>{t("cart.quantity")}</th>
                  <th>{t("cart.lineTotal")}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {cart?.products.map(({ product, quantity }, key) => (
                  <tr key={key}>
                    <td className="shopping__cart__item">
                      <img
                        src={resolveProductImage(product.img)}
                        alt={translateProductName(product, t)}
                      />
                      <h4>{translateProductName(product, t)}</h4>
                    </td>
                    <td>{formatter(product.price)}</td>
                    <td>
                      <Quantity
                        product={product}
                        initQuantity={quantity}
                        maxQuantity={product.inventory}
                        hasAddToCart={false}
                        onChange={(nextQuantity) =>
                          setCart(updateCartQuantity(product.id, nextQuantity))
                        }
                      />
                    </td>
                    <td>{formatter(product.price * quantity)}</td>
                    <td
                      className="icon_close"
                      onClick={() => setPendingRemoveId(product.id)}
                    >
                      <AiOutlineClose />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="row">
            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <div className="shopping__checkout">
                <h2>{t("cart.orderTotal")}</h2>
                <ul>
                  <li>
                    {t("cart.quantity")}: <span>{cart.totalQuantity}</span>
                  </li>
                  <li>
                    {t("cart.lineTotal")}: <span>{formatter(cart.totalPrice)}</span>
                  </li>
                </ul>
                <Button
                  type="button"
                  variant="primary"
                  className="button-submit"
                  data-testid="checkout-btn"
                  onClick={() => navigate(ROUTERS.USER.CHECKOUT)}
                >
                  {t("cart.checkout")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="container">
          <div className="product-list-state">{t("cart.empty")}</div>
        </div>
      )}
      <ConfirmModal
        isOpen={Boolean(pendingRemoveId)}
        title={t("cart.confirmRemoveTitle")}
        message={t("cart.confirmRemoveMessage", {
          name: pendingProduct
            ? translateProductName(pendingProduct, t)
            : t("common.productFallback"),
        })}
        onConfirm={() => {
          setCart(removeCart(pendingRemoveId));
          setPendingRemoveId(null);
          toast.success(t("cart.removed"));
        }}
        onCancel={() => setPendingRemoveId(null)}
      />
    </>
  );
};
export default memo(ShoppingCartPage);

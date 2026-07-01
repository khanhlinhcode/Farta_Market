import { memo, useEffect, useMemo } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Breadcrumb from "../theme/breadcrumb";
import { SESSION_KEYS } from "utils/constant";
import { getSessionItem } from "utils/session";
import { formatter } from "utils/fomater";
import { ROUTERS } from "utils/router";
import useShoppingCart from "hooks/useShoppingCart";
import "./style.scss";

const getOrderTotal = (order) => {
  if (order?.total !== undefined && order?.total !== null) {
    return Number(order.total);
  }

  return (order?.details || []).reduce(
    (sum, detail) => sum + Number(detail.line_total || 0),
    0
  );
};

const OrderSuccessPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { clearCart } = useShoppingCart();
  const [searchParams] = useSearchParams();
  const order = useMemo(
    () =>
      location.state?.order ||
      getSessionItem(SESSION_KEYS.LAST_ORDER_SUCCESS, null),
    [location.state]
  );
  const orderId = order?.id || searchParams.get("orderId") || "";
  const paymentMethod =
    searchParams.get("payment") === "vnpay"
      ? "vnpay"
      : order?.payment_method || "cod";
  const paymentStatus =
    order?.payment_status || (paymentMethod === "vnpay" ? "paid" : "pending");

  useEffect(() => {
    if (orderId) {
      clearCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  return (
    <>
      <Breadcrumb name={t("order.successTitle")} />
      <main className="order-success">
        <div className="container">
          <section className="order-success__panel">
            <div className="order-success__icon" aria-hidden="true">
              ✓
            </div>
            <h1>{t("order.successTitle")}</h1>
            <p>{t("order.successMessage")}</p>

            <div className="order-success__summary">
              <div>
                <span>{t("order.orderCode")}</span>
                <strong>{orderId ? `#${orderId}` : t("common.noData")}</strong>
              </div>
              <div>
                <span>{t("order.total")}</span>
                <strong>{formatter(getOrderTotal(order))}</strong>
              </div>
              <div>
                <span>{t("order.deliveryAddress")}</span>
                <strong>{order?.address || t("common.noData")}</strong>
              </div>
              <div>
                <span>{t("order.paymentMethod")}</span>
                <strong>
                  {t(`order.paymentMethods.${paymentMethod}`)}
                  {paymentStatus === "paid" && (
                    <i className="order-success__paid-badge">
                      {t("order.paidBadge")}
                    </i>
                  )}
                </strong>
              </div>
            </div>

            <div className="order-success__actions">
              <Link className="order-success__button" to={ROUTERS.USER.PRODUCTS}>
                {t("order.continueShopping")}
              </Link>
              <Link
                className="order-success__button order-success__button--ghost"
                to={ROUTERS.USER.MY_ORDERS}
              >
                {t("order.viewOrder")}
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default memo(OrderSuccessPage);

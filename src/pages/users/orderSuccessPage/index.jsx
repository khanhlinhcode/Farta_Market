import { memo, useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Breadcrumb from "../theme/breadcrumb";
import { formatter } from "utils/formatter";
import { ROUTERS } from "utils/router";
import useShoppingCart from "hooks/useShoppingCart";
import "./style.scss";
import { getMyOrderAPI } from "api/orderPage";

const getOrderTotal = (order) => {
  if (!order) {
    return null;
  }

  if (order?.grand_total !== undefined && order?.grand_total !== null) {
    return Number(order.grand_total);
  }

  if (order?.total !== undefined && order?.total !== null) {
    return Number(order.total);
  }

  return (order.details || []).reduce(
    (sum, detail) => sum + Number(detail.line_total || 0),
    0
  );
};

const OrderSuccessPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { clearCart } = useShoppingCart();
  const [searchParams] = useSearchParams();
  const initialOrder = location.state?.order || null;
  const orderId = searchParams.get("orderId") || initialOrder?.id || "";
  const [order, setOrder] = useState(null);
  const [checking, setChecking] = useState(true);
  const paymentMethod = order?.payment_method || "cod";
  const paymentStatus = order?.payment_status || "pending";
  const orderTotal = getOrderTotal(order);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setOrder(null);
    setChecking(true);
    const verify = async () => {
      try {
        // COD reaches here with the actual POST response; payment redirects must be verified on the server.
        if (initialOrder?.payment_method === "cod" && String(initialOrder.id) === String(orderId)) {
          if (active) setOrder(initialOrder);
          return;
        }
        if (!/^[1-9]\d*$/.test(String(orderId))) return;
        const verified = await getMyOrderAPI(orderId, controller.signal);
        if (!active || verified.status === "cancelled" || String(verified.id) !== String(orderId)) return;
        if (verified.payment_method === "vnpay" && verified.payment_status !== "paid") return;
        setOrder(verified);
        if (verified.payment_method === "vnpay") clearCart();
      } catch {
        // Missing, foreign or unpaid orders cannot confirm payment or clear the cart.
      } finally {
        if (active) setChecking(false);
      }
    };
    verify();
    return () => { active = false; controller.abort(); };
    // clearCart only runs for this verified payment, not again on cart or locale updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, initialOrder]);

  if (!order) {
    return <>
      <Breadcrumb name={t("order.verificationTitle")} />
      <main className="order-success"><div className="container"><section className="order-success__panel">
        <h1>{t("order.verificationTitle")}</h1>
        <p>{t(checking ? "order.verificationChecking" : "order.verificationFailed")}</p>
        <Link to={ROUTERS.USER.MY_ORDERS}>{t("order.viewOrder")}</Link>
      </section></div></main>
    </>;
  }

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
                <strong>{orderTotal === null ? t("common.noData") : formatter(orderTotal)}</strong>
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

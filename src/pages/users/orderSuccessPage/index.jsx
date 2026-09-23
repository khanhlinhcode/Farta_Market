import { memo, useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Breadcrumb from "../theme/breadcrumb";
import { formatter } from "utils/formatter";
import { ROUTERS } from "utils/router";
import useShoppingCart from "hooks/useShoppingCart";
import "./style.scss";
import { getMyOrderAPI, getSepayPaymentStatusAPI } from "api/orderPage";

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
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { clearCart } = useShoppingCart();
  const [searchParams] = useSearchParams();
  const initialOrder = location.state?.order || null;
  const initialPayment = location.state?.payment || null;
  const orderId = searchParams.get("orderId") || initialOrder?.id || "";
  const requestedPaymentMethod =
    searchParams.get("payment") || initialOrder?.payment_method || "";
  const [order, setOrder] = useState(initialOrder);
  const [payment, setPayment] = useState(initialPayment);
  const [checking, setChecking] = useState(true);
  const paymentMethod = order?.payment_method || requestedPaymentMethod || "cod";
  const paymentStatus = order?.payment_status || "pending";
  const orderTotal = getOrderTotal(order);
  const paymentExpired = Boolean(
    payment?.expires_at && Date.parse(payment.expires_at) <= Date.now()
  );

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let pollTimer;
    setOrder(initialOrder);
    setPayment(initialPayment);
    setChecking(true);

    const verify = async () => {
      try {
        if (!/^[1-9]\d*$/.test(String(orderId))) {
          return;
        }

        if (
          initialOrder?.payment_method === "cod" &&
          String(initialOrder.id) === String(orderId)
        ) {
          setOrder(initialOrder);
          return;
        }

        if (requestedPaymentMethod === "sepay") {
          const response = await getSepayPaymentStatusAPI(orderId, controller.signal);
          const verified = response?.data;
          if (!active || String(verified?.id) !== String(orderId)) {
            return;
          }

          setOrder(verified);
          setPayment(response?.payment || null);
          setChecking(false);

          if (
            verified.payment_status === "paid" &&
            verified.status !== "cancelled"
          ) {
            clearCart();
            return;
          }

          const expiresAt = Date.parse(response?.payment?.expires_at || "");
          if (
            verified.payment_status === "pending" &&
            verified.status === "pending" &&
            (!Number.isFinite(expiresAt) || expiresAt > Date.now())
          ) {
            pollTimer = window.setTimeout(verify, 3000);
          }
          return;
        }

        const verified = await getMyOrderAPI(orderId, controller.signal);
        if (
          !active ||
          verified.status === "cancelled" ||
          String(verified.id) !== String(orderId)
        ) {
          return;
        }
        if (verified.payment_method === "vnpay" && verified.payment_status !== "paid") {
          return;
        }
        setOrder(verified);
        if (verified.payment_method === "vnpay") {
          clearCart();
        }
      } catch {
        // Missing, foreign or unpaid orders never confirm payment or clear the cart.
        if (active) {
          setChecking(false);
        }
      } finally {
        if (active && requestedPaymentMethod !== "sepay") {
          setChecking(false);
        }
      }
    };

    verify();
    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(pollTimer);
    };
    // clearCart is intentionally limited to a server-verified paid response.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, requestedPaymentMethod, initialOrder, initialPayment]);

  if (
    order?.payment_method === "sepay" &&
    paymentStatus === "pending" &&
    order.status === "pending" &&
    payment &&
    !paymentExpired
  ) {
    return (
      <>
        <Breadcrumb name={t("order.sepayTitle")} />
        <main className="order-success">
          <div className="container">
            <section
              className="order-success__panel order-success__panel--payment"
              aria-live="polite"
            >
              <div className="order-success__payment-status" role="status">
                <span aria-hidden="true" />
                {t("order.sepayWaiting")}
              </div>
              <h1>{t("order.sepayTitle")}</h1>
              <p>{t("order.sepayInstructions")}</p>
              <div className="order-success__payment-grid">
                <img
                  className="order-success__qr"
                  src={payment.qr_url}
                  alt={t("order.sepayQrAlt")}
                  width="360"
                  height="360"
                  referrerPolicy="no-referrer"
                />
                <dl className="order-success__payment-details">
                  <div>
                    <dt>{t("order.sepayBank")}</dt>
                    <dd>{payment.bank_code}</dd>
                  </div>
                  <div>
                    <dt>{t("order.sepayAccount")}</dt>
                    <dd>{payment.account_number}</dd>
                  </div>
                  {payment.account_holder && (
                    <div>
                      <dt>{t("order.sepayAccountHolder")}</dt>
                      <dd>{payment.account_holder}</dd>
                    </div>
                  )}
                  <div>
                    <dt>{t("order.total")}</dt>
                    <dd>{formatter(payment.amount)}</dd>
                  </div>
                  <div>
                    <dt>{t("order.sepayReference")}</dt>
                    <dd className="order-success__reference">{payment.reference}</dd>
                  </div>
                  <div>
                    <dt>{t("order.sepayExpires")}</dt>
                    <dd>
                      {new Intl.DateTimeFormat(i18n.language, {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(new Date(payment.expires_at))}
                    </dd>
                  </div>
                </dl>
              </div>
              <p className="order-success__payment-note">
                {checking ? t("order.verificationChecking") : t("order.sepayAutoCheck")}
              </p>
              <div className="order-success__actions">
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
  }

  if (
    order?.payment_method === "sepay" &&
    (paymentStatus === "failed" || order.status === "cancelled" || paymentExpired)
  ) {
    return (
      <>
        <Breadcrumb name={t("order.paymentExpiredTitle")} />
        <main className="order-success">
          <div className="container">
            <section className="order-success__panel" role="alert">
              <h1>{t("order.paymentExpiredTitle")}</h1>
              <p>{t("order.paymentExpiredMessage")}</p>
              <Link to={ROUTERS.USER.MY_ORDERS}>{t("order.viewOrder")}</Link>
            </section>
          </div>
        </main>
      </>
    );
  }

  if (
    !order ||
    (order.payment_method === "sepay" && order.payment_status !== "paid")
  ) {
    return (
      <>
        <Breadcrumb name={t("order.verificationTitle")} />
        <main className="order-success">
          <div className="container">
            <section className="order-success__panel">
              <h1>{t("order.verificationTitle")}</h1>
              <p>
                {t(checking ? "order.verificationChecking" : "order.verificationFailed")}
              </p>
              <Link to={ROUTERS.USER.MY_ORDERS}>{t("order.viewOrder")}</Link>
            </section>
          </div>
        </main>
      </>
    );
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
                <strong>
                  {orderTotal === null ? t("common.noData") : formatter(orderTotal)}
                </strong>
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

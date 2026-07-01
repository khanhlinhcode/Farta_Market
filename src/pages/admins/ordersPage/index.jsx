import { memo, useEffect, useMemo, useState } from "react";
import { getAdminOrdersAPI, updateAdminOrderStatusAPI } from "api/admin";
import { formatter } from "utils/fomater";
import { useTranslation } from "react-i18next";
import "../admin.scss";

const STATUS_OPTIONS = [
  { value: "", labelKey: "admin.orders.allStatus" },
  { value: "ORDERED", labelKey: "admin.orders.ordered" },
  { value: "PENDING_PAYMENT", labelKey: "admin.orders.pendingPayment" },
  { value: "PREPARING", labelKey: "admin.orders.preparing" },
  { value: "DELIVERING", labelKey: "admin.orders.delivering" },
  { value: "CANCELLED", labelKey: "admin.orders.cancelled" },
  { value: "PAYMENT_FAILED", labelKey: "admin.orders.paymentFailed" },
];

const statusLabel = (status, t) => {
  const option = STATUS_OPTIONS.find((item) => item.value === status);
  return option ? t(option.labelKey) : status;
};

const getOrderTotal = (order) => {
  if (order.total !== undefined && order.total !== null) {
    return Number(order.total);
  }

  return (order.details || []).reduce((sum, detail) => {
    return sum + Number(detail.line_total || 0);
  }, 0);
};

const AdminOrdersPage = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [status, setStatus] = useState("");
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const totals = useMemo(() => {
    return {
      totalOrders: orders.length,
      ordered: orders.filter((order) => order.status === "ORDERED").length,
      revenue: orders
        .filter((order) => order.status !== "CANCELLED")
        .reduce((sum, order) => sum + getOrderTotal(order), 0),
    };
  }, [orders]);

  const loadOrders = async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await getAdminOrdersAPI({
        status: status || undefined,
        q: keyword || undefined,
      });
      setOrders(data);
    } catch (err) {
      setError(err?.response?.data?.message || t("admin.orders.loadError"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleStatusChange = async (orderId, nextStatus) => {
    setMessage("");
    setError("");

    try {
      const updatedOrder = await updateAdminOrderStatusAPI(orderId, nextStatus);
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? updatedOrder : order))
      );
      setMessage(t("admin.orders.statusUpdated"));
    } catch (err) {
      setError(err?.response?.data?.message || t("admin.orders.statusUpdateError"));
    }
  };

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-page__header">
          <div>
            <h1 className="admin-page__title">{t("admin.orders.title")}</h1>
            <p className="admin-page__subtitle">
              {t("admin.orders.subtitle")}
            </p>
          </div>
          <button className="admin-page__button" onClick={loadOrders}>
            {t("admin.common.refresh")}
          </button>
        </div>

        {message && <div className="admin-page__message">{message}</div>}
        {error && <div className="admin-page__message admin-page__message--error">{error}</div>}

        <div className="admin-page__toolbar">
          <span className="admin-page__badge">
            {t("admin.orders.totalOrders", { count: totals.totalOrders })}
          </span>
          <span className="admin-page__badge">
            {t("admin.orders.newOrders", { count: totals.ordered })}
          </span>
          <span className="admin-page__badge">
            {t("admin.orders.revenue", { amount: formatter(totals.revenue) })}
          </span>
        </div>

        <div className="admin-page__panel">
          <div className="admin-page__toolbar">
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {t(item.labelKey)}
                </option>
              ))}
            </select>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={t("admin.orders.searchPlaceholder")}
            />
            <button className="admin-page__button" onClick={loadOrders}>
              {t("admin.common.search")}
            </button>
          </div>

          <div className="admin-page__table-wrap">
            <table className="admin-page__table">
              <thead>
                <tr>
                  <th>{t("admin.common.code")}</th>
                  <th>{t("admin.orders.customer")}</th>
                  <th>{t("admin.orders.contact")}</th>
                  <th>{t("admin.orders.totalPrice")}</th>
                  <th>{t("admin.orders.status")}</th>
                  <th>{t("admin.common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>
                      <strong>{order.fullname}</strong>
                      <br />
                      <span>{order.address || t("admin.orders.noAddress")}</span>
                    </td>
                    <td>
                      <span>{order.phone || t("admin.orders.noPhone")}</span>
                      <br />
                      <span>{order.email || t("admin.orders.noEmail")}</span>
                    </td>
                    <td>{formatter(getOrderTotal(order))}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        {STATUS_OPTIONS.filter((item) => item.value).map((item) => (
                          <option key={item.value} value={item.value}>
                            {t(item.labelKey)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        className="admin-page__button admin-page__button--ghost"
                        onClick={() =>
                          setExpandedId(expandedId === order.id ? null : order.id)
                        }
                      >
                        {expandedId === order.id
                          ? t("admin.orders.hide")
                          : t("admin.orders.detail")}
                      </button>
                      {expandedId === order.id && (
                        <div className="admin-page__details">
                          <div className="admin-page__details-list">
                            {(order.details || []).map((detail) => (
                              <div key={detail.id}>
                                {detail.product_name ||
                                  detail.product?.name ||
                                  t("admin.orders.deletedProduct")}{" "}
                                x {detail.quantity}
                                {" - "}
                                {formatter(Number(detail.line_total || 0))}
                              </div>
                            ))}
                            {order.note && (
                              <div>
                                {t("admin.orders.note")}: {order.note}
                              </div>
                            )}
                            <div>
                              {t("admin.orders.currentStatus")}:{" "}
                              {statusLabel(order.status, t)}
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {!orders.length && !isLoading && (
                  <tr>
                      <td colSpan={6} className="admin-page__empty">
                        {t("admin.orders.empty")}
                      </td>
                  </tr>
                )}
                {isLoading && (
                  <tr>
                      <td colSpan={6} className="admin-page__empty">
                        {t("admin.common.loadingData")}
                      </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};

export default memo(AdminOrdersPage);

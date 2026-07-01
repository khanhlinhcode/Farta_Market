import { memo, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Breadcrumb from "../theme/breadcrumb";
import { cancelMyOrderAPI, getMyOrdersAPI } from "api/orderPage";
import { ConfirmModal } from "component";
import { formatter } from "utils/fomater";
import "./style.scss";

const STATUS_META = {
  ORDERED: {
    labelKey: "myOrders.status.pending",
    className: "pending",
  },
  PENDING_PAYMENT: {
    labelKey: "myOrders.status.pendingPayment",
    className: "pending",
  },
  PREPARING: {
    labelKey: "myOrders.status.processing",
    className: "processing",
  },
  DELIVERING: {
    labelKey: "myOrders.status.delivered",
    className: "delivered",
  },
  CANCELLED: {
    labelKey: "myOrders.status.cancelled",
    className: "cancelled",
  },
  PAYMENT_FAILED: {
    labelKey: "myOrders.status.paymentFailed",
    className: "cancelled",
  },
};

const getOrderTotal = (order) => {
  if (order.total !== undefined && order.total !== null) {
    return Number(order.total);
  }

  return (order.details || []).reduce(
    (sum, detail) => sum + Number(detail.line_total || 0),
    0
  );
};

const MyOrdersPage = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [expandedId, setExpandedId] = useState(null);
  const [pendingCancelId, setPendingCancelId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const pendingOrder = useMemo(
    () => orders.find((order) => order.id === pendingCancelId),
    [orders, pendingCancelId]
  );

  const loadOrders = async (page = 1) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getMyOrdersAPI({ page });
      setOrders(response.data || []);
      setMeta({
        current_page: response.current_page || 1,
        last_page: response.last_page || 1,
        total: response.total || 0,
      });
    } catch (err) {
      setError(err?.response?.data?.message || t("myOrders.loadError"));
      toast.error(t("common.error"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = async () => {
    if (!pendingCancelId) {
      return;
    }

    try {
      const updatedOrder = await cancelMyOrderAPI(pendingCancelId);
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
      toast.success(t("myOrders.cancelSuccess"));
    } catch (err) {
      toast.error(err?.response?.data?.message || t("common.error"));
    } finally {
      setPendingCancelId(null);
    }
  };

  return (
    <>
      <Breadcrumb name={t("myOrders.title")} />
      <main className="my-orders">
        <div className="container">
          <div className="my-orders__header">
            <div>
              <h1>{t("myOrders.title")}</h1>
              <p>{t("myOrders.subtitle", { count: meta.total })}</p>
            </div>
            <button type="button" onClick={() => loadOrders(meta.current_page)}>
              {t("common.retry")}
            </button>
          </div>

          {error && <div className="my-orders__state is-error">{error}</div>}
          {isLoading && <div className="my-orders__state">{t("common.loading")}</div>}
          {!isLoading && !error && orders.length === 0 && (
            <div className="my-orders__state">{t("myOrders.empty")}</div>
          )}

          <div className="my-orders__list">
            {orders.map((order) => {
              const status = STATUS_META[order.status] || STATUS_META.ORDERED;
              const isExpanded = expandedId === order.id;

              return (
                <article className="my-orders__card" key={order.id}>
                  <button
                    type="button"
                    className="my-orders__summary"
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  >
                    <span>
                      <b>#{order.id}</b>
                      <small>
                        {order.created_at
                          ? new Date(order.created_at).toLocaleDateString("vi-VN")
                          : t("common.noData")}
                      </small>
                    </span>
                    <span>{formatter(getOrderTotal(order))}</span>
                    <i className={`my-orders__badge is-${status.className}`}>
                      {t(status.labelKey)}
                    </i>
                  </button>

                  {isExpanded && (
                    <div className="my-orders__details">
                      <div className="my-orders__address">
                        <b>{t("order.deliveryAddress")}:</b>{" "}
                        {order.address || t("common.noData")}
                      </div>
                      {(order.details || []).map((detail) => (
                        <div className="my-orders__line" key={detail.id}>
                          <span>{detail.product_name || detail.product?.name}</span>
                          <span>
                            {formatter(detail.unit_price)} x {detail.quantity}
                          </span>
                          <b>{formatter(detail.line_total)}</b>
                        </div>
                      ))}
                      {order.status === "ORDERED" && (
                        <button
                          type="button"
                          className="my-orders__cancel"
                          onClick={() => setPendingCancelId(order.id)}
                        >
                          {t("myOrders.cancel")}
                        </button>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {meta.last_page > 1 && (
            <div className="my-orders__pagination">
              <button
                type="button"
                disabled={meta.current_page <= 1}
                onClick={() => loadOrders(meta.current_page - 1)}
              >
                {t("products.previous")}
              </button>
              <span>
                {meta.current_page}/{meta.last_page}
              </span>
              <button
                type="button"
                disabled={meta.current_page >= meta.last_page}
                onClick={() => loadOrders(meta.current_page + 1)}
              >
                {t("products.next")}
              </button>
            </div>
          )}
        </div>
      </main>
      <ConfirmModal
        isOpen={Boolean(pendingCancelId)}
        title={t("myOrders.confirmCancelTitle")}
        message={t("myOrders.confirmCancelMessage", {
          id: pendingOrder?.id || "",
        })}
        onConfirm={handleCancel}
        onCancel={() => setPendingCancelId(null)}
      />
    </>
  );
};

export default memo(MyOrdersPage);

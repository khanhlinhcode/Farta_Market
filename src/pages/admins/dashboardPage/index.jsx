import { memo, useEffect, useMemo, useState } from "react";
import {
  exportAdminOrdersAPI,
  getAdminDashboardAPI,
  getAdminQueueHealthAPI,
  getAdminRevenueChartAPI,
} from "api/admin";
import { formatter } from "utils/fomater";
import { useTranslation } from "react-i18next";
import "../admin.scss";

const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [range, setRange] = useState("7d");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [queueHealth, setQueueHealth] = useState(null);

  const chartData = data?.revenue_chart || data?.orders_by_day || [];
  const hasQueueWarning =
    Number(queueHealth?.pending_jobs || 0) > 10 ||
    Number(queueHealth?.oldest_pending_age_seconds || 0) > 300;
  const maxRevenue = Math.max(
    1,
    ...chartData.map((item) => Number(item.revenue || 0))
  );

  const cards = useMemo(
    () => [
      {
        label: t("admin.dashboard.todayRevenue"),
        value: formatter(data?.revenue_today ?? data?.today_revenue ?? 0),
      },
      {
        label: t("admin.dashboard.monthRevenue"),
        value: formatter(data?.revenue_this_month ?? 0),
      },
      {
        label: t("admin.dashboard.ordersToday"),
        value: data?.orders_today ?? data?.new_orders ?? 0,
      },
      {
        label: t("admin.dashboard.pendingOrders"),
        value: data?.orders_pending_count ?? data?.pending_orders ?? 0,
      },
    ],
    [data, t]
  );

  const loadDashboard = async (nextRange = range) => {
    setIsLoading(true);
    setError("");

    try {
      const [dashboard, revenueChart, queueHealthResponse] = await Promise.all([
        getAdminDashboardAPI(),
        getAdminRevenueChartAPI({ range: nextRange }),
        getAdminQueueHealthAPI().catch(() => null),
      ]);
      setData({
        ...dashboard,
        revenue_chart: revenueChart,
      });
      setQueueHealth(queueHealthResponse);
    } catch (err) {
      setError(err?.response?.data?.message || t("admin.dashboard.loadError"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const handleExport = async () => {
    try {
      const blob = await exportAdminOrdersAPI();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "orders.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err?.response?.data?.message || t("common.error"));
    }
  };

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-page__header">
          <div>
            <h1 className="admin-page__title">{t("admin.dashboard.title")}</h1>
            <p className="admin-page__subtitle">{t("admin.dashboard.subtitle")}</p>
          </div>
          <div className="admin-page__actions">
            <button
              type="button"
              className="admin-page__button admin-page__button--ghost"
              onClick={handleExport}
            >
              {t("admin.orders.exportCsv")}
            </button>
            <button className="admin-page__button" onClick={() => loadDashboard()}>
              {t("admin.common.refresh")}
            </button>
          </div>
        </div>

        {error && (
          <div className="admin-page__message admin-page__message--error">
            {error}
          </div>
        )}
        {isLoading && (
          <div className="admin-page__message">{t("admin.common.loadingData")}</div>
        )}

        <section className="admin-page__stats">
          {cards.map((card) => (
            <div className="admin-page__stat-card" key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </div>
          ))}
        </section>

        {!!data?.low_stock_products?.length && (
          <section className="admin-page__alert">
            <strong>{t("admin.dashboard.lowStockWarning")}</strong>
            <span>
              {data.low_stock_products
                .map((product) => `${product.name} (${product.inventory})`)
                .join(", ")}
            </span>
          </section>
        )}

        {hasQueueWarning && (
          <section className="admin-page__alert admin-page__alert--danger">
            <strong>{t("admin.dashboard.queueWarning")}</strong>
            <span>
              {t("admin.dashboard.queueWarningDetail", {
                pending: queueHealth?.pending_jobs || 0,
                age: queueHealth?.oldest_pending_age_seconds || 0,
              })}
            </span>
          </section>
        )}

        <div className="admin-page__grid admin-page__grid--balanced">
          <section className="admin-page__panel">
            <div className="admin-page__panel-head">
              <h2 className="admin-page__panel-title">
                {t("admin.dashboard.revenueChart")}
              </h2>
              <select
                value={range}
                onChange={(event) => setRange(event.target.value)}
              >
                <option value="7d">{t("admin.dashboard.range7d")}</option>
                <option value="30d">{t("admin.dashboard.range30d")}</option>
                <option value="12m">{t("admin.dashboard.range12m")}</option>
              </select>
            </div>
            <div className="admin-page__chart">
              {chartData.map((item) => (
                <div className="admin-page__chart-item" key={item.date}>
                  <span
                    style={{
                      height: `${Math.max(
                        8,
                        (Number(item.revenue || 0) / maxRevenue) * 120
                      )}px`,
                    }}
                  />
                  <small>{item.date}</small>
                  <b>{formatter(item.revenue || 0)}</b>
                </div>
              ))}
              {!chartData.length && <p>{t("admin.dashboard.noData")}</p>}
            </div>
          </section>

          <section className="admin-page__panel">
            <h2 className="admin-page__panel-title">
              {t("admin.dashboard.topProducts")}
            </h2>
            <div className="admin-page__mini-table">
              {(data?.top_products || []).map((product) => (
                <div key={`${product.product_id}-${product.product_name}`}>
                  <span>{product.product_name}</span>
                  <b>
                    {t("admin.dashboard.quantitySold")}: {product.quantity_sold}
                  </b>
                </div>
              ))}
              {!data?.top_products?.length && (
                <p>{t("admin.dashboard.noData")}</p>
              )}
            </div>
          </section>
        </div>

        <div className="admin-page__grid admin-page__grid--balanced">
          <section className="admin-page__panel">
            <h2 className="admin-page__panel-title">
              {t("admin.dashboard.lowStock")}
            </h2>
            <div className="admin-page__mini-table">
              {(data?.low_stock_products || []).map((product) => (
                <div key={product.id}>
                  <span>{product.name}</span>
                  <b>{product.inventory}</b>
                </div>
              ))}
              {!data?.low_stock_products?.length && (
                <p>{t("admin.dashboard.noData")}</p>
              )}
            </div>
          </section>

          <section className="admin-page__panel">
            <h2 className="admin-page__panel-title">
              {t("admin.dashboard.latestOrders")}
            </h2>
            <div className="admin-page__mini-table">
              {(data?.latest_orders || []).map((order) => (
                <div key={order.id}>
                  <span>
                    #{order.id} - {order.fullname}
                  </span>
                  <b>{formatter(order.grand_total || order.total || 0)}</b>
                </div>
              ))}
              {!data?.latest_orders?.length && (
                <p>{t("admin.dashboard.noData")}</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default memo(AdminDashboardPage);

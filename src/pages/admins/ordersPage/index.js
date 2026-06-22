import { memo, useEffect, useMemo, useState } from "react";
import { getAdminOrdersAPI, updateAdminOrderStatusAPI } from "api/admin";
import { formatter } from "utils/fomater";
import "../admin.scss";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "ORDERED", label: "Đã đặt" },
  { value: "PREPARING", label: "Đang chuẩn bị" },
  { value: "DELIVERING", label: "Đang giao" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const statusLabel = (status) => {
  return STATUS_OPTIONS.find((item) => item.value === status)?.label || status;
};

const getOrderTotal = (order) => {
  return (order.details || []).reduce((sum, detail) => {
    return sum + Number(detail.product?.price || 0) * Number(detail.quantity || 0);
  }, 0);
};

const AdminOrdersPage = () => {
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
      setError(err?.response?.data?.message || "Không tải được danh sách đơn hàng.");
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
      setMessage("Đã cập nhật trạng thái đơn hàng.");
    } catch (err) {
      setError(err?.response?.data?.message || "Không cập nhật được trạng thái.");
    }
  };

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-page__header">
          <div>
            <h1 className="admin-page__title">Quản lý đơn hàng</h1>
            <p className="admin-page__subtitle">
              Theo dõi đơn mới, kiểm tra chi tiết sản phẩm và cập nhật trạng thái xử lý.
            </p>
          </div>
          <button className="admin-page__button" onClick={loadOrders}>
            Làm mới
          </button>
        </div>

        {message && <div className="admin-page__message">{message}</div>}
        {error && <div className="admin-page__message admin-page__message--error">{error}</div>}

        <div className="admin-page__toolbar">
          <span className="admin-page__badge">Đơn: {totals.totalOrders}</span>
          <span className="admin-page__badge">Đơn mới: {totals.ordered}</span>
          <span className="admin-page__badge">Doanh thu: {formatter(totals.revenue)}</span>
        </div>

        <div className="admin-page__panel">
          <div className="admin-page__toolbar">
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo tên, số điện thoại, email"
            />
            <button className="admin-page__button" onClick={loadOrders}>
              Tìm kiếm
            </button>
          </div>

          <div className="admin-page__table-wrap">
            <table className="admin-page__table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Khách hàng</th>
                  <th>Liên hệ</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>
                      <strong>{order.fullname}</strong>
                      <br />
                      <span>{order.address || "Chưa có địa chỉ"}</span>
                    </td>
                    <td>
                      <span>{order.phone || "Chưa có SĐT"}</span>
                      <br />
                      <span>{order.email || "Chưa có email"}</span>
                    </td>
                    <td>{formatter(getOrderTotal(order))}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        {STATUS_OPTIONS.filter((item) => item.value).map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
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
                        {expandedId === order.id ? "Ẩn" : "Chi tiết"}
                      </button>
                      {expandedId === order.id && (
                        <div className="admin-page__details">
                          <div className="admin-page__details-list">
                            {(order.details || []).map((detail) => (
                              <div key={detail.id}>
                                {detail.product?.name || "Sản phẩm đã xoá"} x {detail.quantity}
                                {" - "}
                                {formatter(
                                  Number(detail.product?.price || 0) *
                                    Number(detail.quantity || 0)
                                )}
                              </div>
                            ))}
                            {order.note && <div>Ghi chú: {order.note}</div>}
                            <div>Trạng thái hiện tại: {statusLabel(order.status)}</div>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {!orders.length && !isLoading && (
                  <tr>
                    <td colSpan={6} className="admin-page__empty">
                      Chưa có đơn hàng phù hợp.
                    </td>
                  </tr>
                )}
                {isLoading && (
                  <tr>
                    <td colSpan={6} className="admin-page__empty">
                      Đang tải dữ liệu...
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

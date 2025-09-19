import { memo, useEffect, useState } from "react";
import "./style.scss";
import { formatter } from "utils/fomater";
const STATUS = {
  ORDERED: {
    key: "ORDERED",
    label: "Da Dat",
    className: "orders__dropdown-item",
  },
  PREPARING: {
    key: "PREPARING",
    label: "Len Don",
    className: "orders__dropdown-item",
  },
  DIVIVERED: {
    key: "DIVIVERED",
    label: "Da giao hang",
    className: "orders__dropdown-item",
  },
  CANCELLED: {
    key: "CANCELLED",
    label: "huy don",
    className: "orders__dropdown-item orders__dropdown-item--danger",
  },
};
const OrderAdPage = () => {
  const orders = [
    {
      id: 1,
      total: 200000,
      customerName: "John",
      date: "10 / 5 / 2025",
      status: "Dang Len Don",
    },
    {
      id: 2,
      total: 200000,
      customerName: "mery",
      date: "10 / 5 / 2025",
      status: "Dang Len Don",
    },
  ];
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isDropdown = event.target.closest("orders__dropdown");
      if (!isDropdown) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);
  return (
    <div className="container">
      <div className="orders">
        <h2>Quan Ly Don Hang: </h2>
        <div className="orders__content">
          <table className="orders__table">
            <thead>
              <tr>
                <th>Ma Don Hang</th>
                <th>Tong Don Hang</th>
                <th>Khach Hang</th>
                <th>Ngay Dat</th>
                <th>Trang Thai</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((item, i) => (
                <tr key={i}>
                  <td>
                    <span>{item.id}</span>
                  </td>
                  <td>{formatter(item.total)}</td>
                  <td>{item.customerName}</td>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td>
                    <div className="orders__dropdown">
                      <button
                        className={`orders__active-button`}
                        onClick={() => setActiveDropdown(item.id)}
                      >
                        Da dat
                        <span className="arrow">▼</span>
                      </button>
                      {activeDropdown === item.id && (
                        <div className="orders__dropdown-menu">
                          {Object.values(STATUS).map((status) => (
                            <button
                              key={status.key}
                              className={status.className}
                              onClick={() => setActiveDropdown(null)}
                            >
                              {status.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="orders__footer">
          <div className="orders__pagination">
            <div className="orders__page-numbers">
              <button type="button" className="orders__page-btn">
                &#9665;
              </button>
              <button
                type="button"
                className="orders__page-btn orders__page-btn--active"
              >
                1
              </button>
              <button className="orders__page-btn">2</button>
              <button className="orders__page-btn">3</button>
              <button className="orders__page-btn">4</button>
              <button className="orders__page-btn">5</button>
              <button className="orders__page-btn">&#9654;</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default memo(OrderAdPage);

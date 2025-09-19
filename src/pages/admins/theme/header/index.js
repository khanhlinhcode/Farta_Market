import { memo } from "react";
import { AiOutlineLogout, AiOutlineShoppingCart } from "react-icons/ai";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTERS } from "utils/router";
import "./style.scss";
const HeaderAD = ({ children, ...props }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = [
    {
      path: ROUTERS.ADMIN.ORDERS,
      onClick: () => navigate(ROUTERS.ADMIN.ORDERS),
      label: "Đặt Hàng",
      icon: <AiOutlineShoppingCart />,
    },
    {
      path: ROUTERS.ADMIN.LOGOUT,
      onClick: () => {},
      label: "Đăng Xuất",
      icon: <AiOutlineLogout />,
    },
  ];

  return (
    <div className="admin__header container" {...props}>
      <nav className="admin__header__nav">
        {navItems.map(({ path, onClick, label, icon }) => (
          <div
            key={path}
            className={`admin__header__nav-item ${
              location.pathname.includes(path)
                ? "admin__header__nav-item--active"
                : ""
            }`}
            onClick={onClick} // <- chú ý chữ 'onClick'
          >
            <span className="admin__header__nav-icon">{icon}</span>{" "}
            {/* nhúng icon */}
            <span>{label}</span> {/* nhúng label */}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default memo(HeaderAD);

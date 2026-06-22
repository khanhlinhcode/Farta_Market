import { memo } from "react";
import {
  AiOutlineAppstore,
  AiOutlineLogout,
  AiOutlineShoppingCart,
  AiOutlineTags,
} from "react-icons/ai";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTERS } from "utils/router";
import "./style.scss";
import { SESSION_KEYS } from "utils/constant";
import { logoutAdminAPI } from "api/admin";

const HeaderAD = ({ children, ...props }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await logoutAdminAPI();
    } catch (error) {
      // Token local vẫn được xoá để người dùng thoát khỏi admin trên máy hiện tại.
    } finally {
      localStorage.removeItem(SESSION_KEYS.ADMIN_TOKEN);
      navigate(ROUTERS.ADMIN.LOGIN, { replace: true });
    }
  };

  const navItems = [
    {
      path: ROUTERS.ADMIN.ORDERS,
      onClick: () => navigate(ROUTERS.ADMIN.ORDERS),
      label: "Đặt Hàng",
      icon: <AiOutlineShoppingCart />,
    },
    {
      path: ROUTERS.ADMIN.PRODUCTS,
      onClick: () => navigate(ROUTERS.ADMIN.PRODUCTS),
      label: "Sản Phẩm",
      icon: <AiOutlineAppstore />,
    },
    {
      path: ROUTERS.ADMIN.CATEGORIES,
      onClick: () => navigate(ROUTERS.ADMIN.CATEGORIES),
      label: "Danh Mục",
      icon: <AiOutlineTags />,
    },
    {
      path: ROUTERS.ADMIN.LOGOUT,
      onClick: handleLogout,
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
              path !== ROUTERS.ADMIN.LOGOUT && location.pathname.startsWith(path)
                ? "admin__header__nav-item--active"
                : ""
            }`}
            onClick={onClick}
          >
            <span className="admin__header__nav-icon">{icon}</span>{" "}
            <span>{label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default memo(HeaderAD);

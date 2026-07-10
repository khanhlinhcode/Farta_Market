import { memo } from "react";
import {
  AiOutlineDashboard,
  AiOutlineAppstore,
  AiOutlineLogout,
  AiOutlineShoppingCart,
  AiOutlineTags,
  AiOutlineUser,
} from "react-icons/ai";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTERS } from "utils/router";
import "./style.scss";
import { logoutAdminAPI } from "api/admin";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { clearAdminSession, isAdmin } from "utils/adminAuth";
import {
  clearAuth,
  selectAdminUser,
} from "../../../../redux/authSlice";

const HeaderAD = ({ children, ...props }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const adminUser = useSelector(selectAdminUser);
  const handleLogout = async () => {
    try {
      await logoutAdminAPI();
    } catch (error) {
      // Local token is still cleared so this browser exits the admin area.
    } finally {
      clearAdminSession();
      dispatch(clearAuth());
      navigate(ROUTERS.ADMIN.LOGIN, { replace: true });
    }
  };

  const navItems = [
    {
      path: ROUTERS.ADMIN.DASHBOARD,
      onClick: () => navigate(ROUTERS.ADMIN.DASHBOARD),
      label: t("admin.nav.dashboard"),
      icon: <AiOutlineDashboard />,
    },
    {
      path: ROUTERS.ADMIN.ORDERS,
      onClick: () => navigate(ROUTERS.ADMIN.ORDERS),
      label: t("admin.nav.orders"),
      icon: <AiOutlineShoppingCart />,
    },
    {
      path: ROUTERS.ADMIN.PRODUCTS,
      onClick: () => navigate(ROUTERS.ADMIN.PRODUCTS),
      label: t("admin.nav.products"),
      icon: <AiOutlineAppstore />,
    },
    {
      path: ROUTERS.ADMIN.CATEGORIES,
      onClick: () => navigate(ROUTERS.ADMIN.CATEGORIES),
      label: t("admin.nav.categories"),
      icon: <AiOutlineTags />,
    },
    {
      path: ROUTERS.ADMIN.COUPONS,
      onClick: () => navigate(ROUTERS.ADMIN.COUPONS),
      label: t("admin.nav.coupons"),
      icon: <AiOutlineTags />,
    },
    ...(isAdmin(adminUser)
      ? [
          {
            path: ROUTERS.ADMIN.USERS,
            onClick: () => navigate(ROUTERS.ADMIN.USERS),
            label: t("admin.nav.users"),
            icon: <AiOutlineUser />,
          },
        ]
      : []),
    {
      path: ROUTERS.ADMIN.LOGOUT,
      onClick: handleLogout,
      label: t("admin.nav.logout"),
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

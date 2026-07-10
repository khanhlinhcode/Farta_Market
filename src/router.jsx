import React, { Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { ADMIN_PATH, ROUTERS } from "./utils/router";
import MasterLayout from "./pages/users/theme/masterLayout";
import MasterAdLayout from "pages/admins/theme/masterAdLayout";
import {
  ADMIN_ROLES,
  hasAdminRole,
} from "utils/adminAuth";
import {
  selectAdminUser,
  selectAuthBootstrapped,
} from "./redux/authSlice";

const HomePage = React.lazy(() => import("./pages/users/homePage"));
const ProfilePage = React.lazy(() => import("./pages/users/profilePage"));
const UserLoginPage = React.lazy(() => import("./pages/users/loginPage"));
const ProductsPage = React.lazy(() => import("./pages/users/productsPage"));
const ProductDetailPage = React.lazy(() =>
  import("./pages/users/productDetailPage")
);
const ShoppingCartPage = React.lazy(() => import("pages/users/shoppingCartPage"));
const CheckoutPage = React.lazy(() => import("pages/users/checkoutPage"));
const OrderSuccessPage = React.lazy(() => import("pages/users/orderSuccessPage"));
const MyOrdersPage = React.lazy(() => import("pages/users/myOrdersPage"));
const WishlistPage = React.lazy(() => import("pages/users/wishlistPage"));
const LoginAdPage = React.lazy(() => import("pages/admins/loginPage"));
const AdminDashboardPage = React.lazy(() =>
  import("pages/admins/dashboardPage")
);
const AdminOrdersPage = React.lazy(() => import("pages/admins/ordersPage"));
const AdminProductsPage = React.lazy(() => import("pages/admins/productsPage"));
const AdminCategoriesPage = React.lazy(() =>
  import("pages/admins/categoriesPage")
);
const AdminCouponsPage = React.lazy(() => import("pages/admins/couponsPage"));
const AdminUsersPage = React.lazy(() => import("pages/admins/usersPage"));

class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="route-error-state">
          <strong>{this.props.title}</strong>
          <button type="button" onClick={() => window.location.reload()}>
            {this.props.retryLabel}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const RequireRole = ({ allowedRoles, children }) => {
  const adminUser = useSelector(selectAdminUser);
  const isBootstrapped = useSelector(selectAuthBootstrapped);

  if (!isBootstrapped) {
    return null;
  }

  if (!hasAdminRole(adminUser, allowedRoles)) {
    return <Navigate to={ROUTERS.ADMIN.LOGIN} replace />;
  }

  return children;
};

export const RequireAdmin = ({ children }) => (
  <RequireRole allowedRoles={[ADMIN_ROLES.ADMIN]}>{children}</RequireRole>
);

const RequireAdminOrStaff = ({ children }) => (
  <RequireRole allowedRoles={[ADMIN_ROLES.ADMIN, ADMIN_ROLES.STAFF]}>
    {children}
  </RequireRole>
);
const renderUserRouter = (fallback, errorTitle, retryLabel, resetKey) => {
  const userRouters = [
    {
      path: ROUTERS.USER.HOME,
      component: <HomePage />,
    },
    {
      path: ROUTERS.USER.PROFILE,
      component: <ProfilePage />,
    },
    {
      path: ROUTERS.USER.PRODUCTS,
      component: <ProductsPage />,
    },
    {
      path: ROUTERS.USER.PRODUCT,
      component: <ProductDetailPage />,
    },
    {
      path: ROUTERS.USER.SHOPPING_CART,
      component: <ShoppingCartPage />,
    },
    {
      path: ROUTERS.USER.CHECKOUT,
      component: <CheckoutPage />,
    },
    {
      path: ROUTERS.USER.ORDER_SUCCESS,
      component: <OrderSuccessPage />,
    },
    {
      path: ROUTERS.USER.MY_ORDERS,
      component: <MyOrdersPage />,
    },
    {
      path: ROUTERS.USER.WISHLIST,
      component: <WishlistPage />,
    },
    {
      path: ROUTERS.USER.LOGIN,
      component: <UserLoginPage />,
    },
  ];

  return (
    <MasterLayout>
      <RouteErrorBoundary title={errorTitle} retryLabel={retryLabel} resetKey={resetKey}>
        <Suspense fallback={fallback}>
          <Routes>
            {userRouters.map((item, key) => (
              <Route key={key} path={item.path} element={item.component} />
            ))}
          </Routes>
        </Suspense>
      </RouteErrorBoundary>
    </MasterLayout>
  );
};

const renderAdminRouter = (fallback, errorTitle, retryLabel, resetKey) => {
  const adminRouters = [
    {
      path: ROUTERS.ADMIN.LOGIN,
      component: <LoginAdPage />,
    },
    {
      path: ROUTERS.ADMIN.DASHBOARD,
      component: (
        <RequireAdminOrStaff>
          <AdminDashboardPage />
        </RequireAdminOrStaff>
      ),
    },
    {
      path: ROUTERS.ADMIN.ORDERS,
      component: (
        <RequireAdminOrStaff>
          <AdminOrdersPage />
        </RequireAdminOrStaff>
      ),
    },
    {
      path: ROUTERS.ADMIN.PRODUCTS,
      component: (
        <RequireAdminOrStaff>
          <AdminProductsPage />
        </RequireAdminOrStaff>
      ),
    },
    {
      path: ROUTERS.ADMIN.CATEGORIES,
      component: (
        <RequireAdminOrStaff>
          <AdminCategoriesPage />
        </RequireAdminOrStaff>
      ),
    },
    {
      path: ROUTERS.ADMIN.COUPONS,
      component: (
        <RequireAdminOrStaff>
          <AdminCouponsPage />
        </RequireAdminOrStaff>
      ),
    },
    {
      path: ROUTERS.ADMIN.USERS,
      component: (
        <RequireAdmin>
          <AdminUsersPage />
        </RequireAdmin>
      ),
    },
  ];
  return (
    <MasterAdLayout>
      <RouteErrorBoundary title={errorTitle} retryLabel={retryLabel} resetKey={resetKey}>
        <Suspense fallback={fallback}>
          <Routes>
            {adminRouters.map((item, key) => (
              <Route key={key} path={item.path} element={item.component} />
            ))}
          </Routes>
        </Suspense>
      </RouteErrorBoundary>
    </MasterAdLayout>
  );
};
const RouterCustom = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isAdminRouters = location.pathname.startsWith(ADMIN_PATH);
  const fallback = t("common.loading");
  const errorTitle = t("common.error");
  const retryLabel = t("common.retry");

  return isAdminRouters
    ? renderAdminRouter(fallback, errorTitle, retryLabel, location.pathname)
    : renderUserRouter(fallback, errorTitle, retryLabel, location.pathname);
};
export default RouterCustom;

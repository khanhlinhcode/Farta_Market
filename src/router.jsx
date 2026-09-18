import React, { Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTERS } from "./utils/router";
import MasterLayout from "./pages/users/theme/masterLayout";
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
const VerifyEmailPage = React.lazy(() => import("pages/users/verifyEmailPage"));
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
    {
      path: ROUTERS.USER.VERIFY_EMAIL,
      component: <VerifyEmailPage />,
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
            <Route path="*" element={<Navigate to={ROUTERS.USER.HOME} replace />} />
          </Routes>
        </Suspense>
      </RouteErrorBoundary>
    </MasterLayout>
  );
};

const RouterCustom = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const fallback = t("common.loading");
  const errorTitle = t("common.error");
  const retryLabel = t("common.retry");

  return renderUserRouter(fallback, errorTitle, retryLabel, location.pathname);
};
export default RouterCustom;

import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/users/homePage";
import { ADMIN_PATH, ROUTERS } from "./utils/router";
import { SESSION_KEYS } from "utils/constant";
import MasterLayout from "./pages/users/theme/masterLayout";
import ProfilePage from "./pages/users/profilePage";
import ProductsPage from "./pages/users/productsPage";
import ProductDetailPage from "./pages/users/productDetailPage";
import ShoppingCartPage from "pages/users/shoppingCartPage";
import CheckoutPage from "pages/users/checkoutPage";
import LoginAdPage from "pages/admins/loginPage";
import AdminOrdersPage from "pages/admins/ordersPage";
import AdminProductsPage from "pages/admins/productsPage";
import AdminCategoriesPage from "pages/admins/categoriesPage";
import MasterAdLayout from "pages/admins/theme/masterAdLayout";

const RequireAdmin = ({ children }) => {
  const hasToken = Boolean(localStorage.getItem(SESSION_KEYS.ADMIN_TOKEN));

  if (!hasToken) {
    return <Navigate to={ROUTERS.ADMIN.LOGIN} replace />;
  }

  return children;
};
const renderUserRouter = () => {
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
  ];

  return (
    <MasterLayout>
      <Routes>
        {userRouters.map((item, key) => (
          <Route key={key} path={item.path} element={item.component} />
        ))}
      </Routes>
    </MasterLayout>
  );
};

const renderAdminRouter = () => {
  const adminRouters = [
    {
      path: ROUTERS.ADMIN.LOGIN,
      component: <LoginAdPage />,
    },
    {
      path: ROUTERS.ADMIN.ORDERS,
      component: (
        <RequireAdmin>
          <AdminOrdersPage />
        </RequireAdmin>
      ),
    },
    {
      path: ROUTERS.ADMIN.PRODUCTS,
      component: (
        <RequireAdmin>
          <AdminProductsPage />
        </RequireAdmin>
      ),
    },
    {
      path: ROUTERS.ADMIN.CATEGORIES,
      component: (
        <RequireAdmin>
          <AdminCategoriesPage />
        </RequireAdmin>
      ),
    },
  ];
  return (
    <MasterAdLayout>
      <Routes>
        {adminRouters.map((item, key) => (
          <Route key={key} path={item.path} element={item.component} />
        ))}
      </Routes>
    </MasterAdLayout>
  );
};
const RouterCustom = () => {
  const location = useLocation();
  const isAdminRouters = location.pathname.startsWith(ADMIN_PATH);
  return isAdminRouters ? renderAdminRouter() : renderUserRouter();
};
export default RouterCustom;

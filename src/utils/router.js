export const ADMIN_PATH = "/quan-tri";
export const ROUTERS = {
  USER: {
    HOME: "/",
    PROFILE: "thongtincanhan",
    PRODUCTS: "/san-pham",
    PRODUCT: "/san-pham/chi-tiet/:id",
    SHOPPING_CART: "/gio-hang",
      CHECKOUT: "/thanh-toan",
      ORDER_SUCCESS: "/dat-hang-thanh-cong",
      MY_ORDERS: "/don-hang-cua-toi",
      WISHLIST: "/yeu-thich",
      LOGIN: "/dang-nhap",
  },
  ADMIN: {
    LOGIN: `${ADMIN_PATH}/dang-nhap`,
    ORDERS: `${ADMIN_PATH}/dat-hang`,
    PRODUCTS: `${ADMIN_PATH}/san-pham`,
    CATEGORIES: `${ADMIN_PATH}/danh-muc`,
    USERS: `${ADMIN_PATH}/nguoi-dung`,
    LOGOUT: `${ADMIN_PATH}/dang-xuat`,
  },
};

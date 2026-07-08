import axios, { getCsrfCookieAPI } from "api/axios";

export const loginAdminAPI = async (data) => {
  await getCsrfCookieAPI();

  return await axios({
    url: "/admin/login",
    method: "POST",
    data,
  });
};

export const getAdminMeAPI = async () => {
  return await axios({
    url: "/admin/me",
    method: "GET",
  });
};

export const logoutAdminAPI = async () => {
  await getCsrfCookieAPI();

  return await axios({
    url: "/admin/logout",
    method: "POST",
  });
};

export const getAdminOrdersAPI = async (params = {}) => {
  return await axios({
    url: "/admin/orders",
    method: "GET",
    params,
  });
};

export const getAdminDashboardAPI = async () => {
  return await axios({
    url: "/admin/dashboard",
    method: "GET",
  });
};

export const getAdminDashboardSummaryAPI = async () => {
  return await axios({
    url: "/admin/dashboard/summary",
    method: "GET",
  });
};

export const getAdminRevenueChartAPI = async (params = {}) => {
  return await axios({
    url: "/admin/dashboard/revenue-chart",
    method: "GET",
    params,
  });
};

export const getAdminTopProductsAPI = async (params = {}) => {
  return await axios({
    url: "/admin/dashboard/top-products",
    method: "GET",
    params,
  });
};

export const getAdminQueueHealthAPI = async () => {
  return await axios({
    url: "/admin/system/queue-health",
    method: "GET",
  });
};

export const exportAdminOrdersAPI = async (params = {}) => {
  return await axios({
    url: "/admin/orders/export.csv",
    method: "GET",
    params,
    responseType: "blob",
  });
};

export const updateAdminOrderStatusAPI = async (id, status, note = "") => {
  return await axios({
    url: `/admin/orders/${id}/status`,
    method: "PATCH",
    data: { status, note },
  });
};

export const getAdminProductsAPI = async (params = {}) => {
  return await axios({
    url: "/admin/products",
    method: "GET",
    params: {
      ...params,
      page: params.page || 1,
      per_page: params.per_page || 20,
    },
  });
};

export const uploadAdminProductImageAPI = async (id, file) => {
  const formData = new FormData();
  formData.append("image", file);

  return await axios({
    url: `/admin/products/${id}/image`,
    method: "POST",
    data: formData,
  });
};

export const uploadAdminProductImagesAPI = async (id, files = []) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("images[]", file));

  return await axios({
    url: `/admin/products/${id}/images`,
    method: "POST",
    data: formData,
  });
};

export const deleteAdminProductImageAPI = async (id) => {
  return await axios({
    url: `/admin/product-images/${id}`,
    method: "DELETE",
  });
};

export const createAdminProductAPI = async (data) => {
  return await axios({
    url: "/admin/products",
    method: "POST",
    data,
  });
};

export const updateAdminProductAPI = async (id, data) => {
  return await axios({
    url: `/admin/products/${id}`,
    method: "PUT",
    data,
  });
};

export const deleteAdminProductAPI = async (id) => {
  return await axios({
    url: `/admin/products/${id}`,
    method: "DELETE",
  });
};

export const getAdminCategoriesAPI = async () => {
  return await axios({
    url: "/admin/categories",
    method: "GET",
  });
};

export const createAdminCategoryAPI = async (data) => {
  return await axios({
    url: "/admin/categories",
    method: "POST",
    data,
  });
};

export const updateAdminCategoryAPI = async (id, data) => {
  return await axios({
    url: `/admin/categories/${id}`,
    method: "PUT",
    data,
  });
};

export const deleteAdminCategoryAPI = async (id) => {
  return await axios({
    url: `/admin/categories/${id}`,
    method: "DELETE",
  });
};

export const getAdminUsersAPI = async (params = {}) => {
  return await axios({
    url: "/admin/users",
    method: "GET",
    params,
  });
};

export const updateAdminUserRoleAPI = async (id, role) => {
  return await axios({
    url: `/admin/users/${id}/role`,
    method: "PATCH",
    data: { role },
  });
};

export const getAdminUserOrdersAPI = async (id, params = {}) => {
  return await axios({
    url: `/admin/users/${id}/orders`,
    method: "GET",
    params,
  });
};

export const disableAdminUserAPI = async (id) => {
  return await axios({
    url: `/admin/users/${id}`,
    method: "DELETE",
  });
};

export const getAdminCouponsAPI = async (params = {}) => {
  return await axios({
    url: "/admin/coupons",
    method: "GET",
    params,
  });
};

export const createAdminCouponAPI = async (data) => {
  return await axios({
    url: "/admin/coupons",
    method: "POST",
    data,
  });
};

export const updateAdminCouponAPI = async (id, data) => {
  return await axios({
    url: `/admin/coupons/${id}`,
    method: "PUT",
    data,
  });
};

export const deleteAdminCouponAPI = async (id) => {
  return await axios({
    url: `/admin/coupons/${id}`,
    method: "DELETE",
  });
};

export const getAdminCouponStatsAPI = async (id) => {
  return await axios({
    url: `/admin/coupons/${id}/usage-stats`,
    method: "GET",
  });
};

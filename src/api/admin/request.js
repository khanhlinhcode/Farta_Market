import axios from "api/axios";

export const loginAdminAPI = async (data) => {
  return await axios({
    url: "/admin/login",
    method: "POST",
    data,
  });
};

export const logoutAdminAPI = async () => {
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

export const updateAdminOrderStatusAPI = async (id, status) => {
  return await axios({
    url: `/admin/orders/${id}/status`,
    method: "PATCH",
    data: { status },
  });
};

export const getAdminProductsAPI = async () => {
  return await axios({
    url: "/admin/products",
    method: "GET",
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

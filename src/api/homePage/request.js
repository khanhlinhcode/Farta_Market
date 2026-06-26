import axios from "api/axios";

const END_POINT = {
  CATEGORIES: "categories",
  PRODUCTS: "products",
};

export const getCategoriesAPI = async () => {
  return await axios.request({
    url: END_POINT.CATEGORIES,
    method: "GET",
  });
};
export const getProductsAPI = async (params = {}) => {
  return await axios.request({
    url: END_POINT.PRODUCTS,
    method: "GET",
    params,
  });
};

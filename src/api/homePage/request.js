import axios from "api/axios";

const END_POINT = {
  CATEGORIES: "categories",
  PRODUCTS: "products",
  SITE_CONTENT: "site-content",
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

export const getProductSuggestionsAPI = async (q) => {
  return await axios.request({
    url: `${END_POINT.PRODUCTS}/suggest`,
    method: "GET",
    params: { q },
  });
};

export const getRecommendedProductsAPI = async () => {
  return await axios.request({
    url: `${END_POINT.PRODUCTS}/recommended`,
    method: "GET",
  });
};

export const getSiteContentAPI = async () => {
  return await axios.request({
    url: END_POINT.SITE_CONTENT,
    method: "GET",
  });
};

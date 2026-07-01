import axios from "api/axios";

const END_POINT = {
  PRODUCTS: "products",
};

export const getProductDetaiAPI = async (id) => {
  return await axios.request({
    url: `${END_POINT.PRODUCTS}/${id}`,
    method: "GET",
  });
};

export const getProductReviewsAPI = async (id, params = {}) => {
  return await axios.request({
    url: `${END_POINT.PRODUCTS}/${id}/reviews`,
    method: "GET",
    params,
  });
};

export const getProductReviewEligibilityAPI = async (id) => {
  return await axios.request({
    url: `${END_POINT.PRODUCTS}/${id}/reviews/eligibility`,
    method: "GET",
  });
};

export const postProductReviewAPI = async (id, payload) => {
  return await axios.request({
    url: `${END_POINT.PRODUCTS}/${id}/reviews`,
    method: "POST",
    data: payload,
  });
};

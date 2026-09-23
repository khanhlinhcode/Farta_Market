import axios from "api/axios";

export const postOrderAPI = async (data, idempotencyKey, analyticsToken) => {
  return await axios({
    url: "/order",
    method: "POST",
    data,
    headers: {
      "Content-Type": "application/json",
      "X-Idempotency-Key": idempotencyKey,
      ...(analyticsToken ? { "X-Analytics-Token": analyticsToken } : {}),
    },
  });
};

export const createSepayPaymentAPI = async (data, idempotencyKey, analyticsToken) => {
  return await axios({
    url: "/payment/create",
    method: "POST",
    data,
    headers: {
      "Content-Type": "application/json",
      "X-Idempotency-Key": idempotencyKey,
      ...(analyticsToken ? { "X-Analytics-Token": analyticsToken } : {}),
    },
  });
};

export const getSepayPaymentStatusAPI = async (id, signal) => {
  return await axios({
    url: `/payment/${id}/status`,
    method: "GET",
    signal,
  });
};

export const validateCouponAPI = async (data) => {
  return await axios({
    url: "/coupons/validate",
    method: "POST",
    data,
  });
};

export const getMyOrdersAPI = async (params = {}) => {
  return await axios({
    url: "/my-orders",
    method: "GET",
    params,
  });
};

export const cancelMyOrderAPI = async (id) => {
  return await axios({
    url: `/my-orders/${id}/cancel`,
    method: "PATCH",
  });
};

export const getMyOrderAPI = async (id, signal) => axios({ signal, url: `/my-orders/${id}`, method: "GET" });

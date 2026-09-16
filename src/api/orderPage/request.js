import axios from "api/axios";

export const postOrderAPI = async (data, idempotencyKey, analyticsSessionId) => {
  return await axios({
    url: "/order",
    method: "POST",
    data,
    headers: {
      "Content-Type": "application/json",
      "X-Idempotency-Key": idempotencyKey,
      ...(analyticsSessionId ? { "X-Analytics-Session": analyticsSessionId } : {}),
    },
  });
};

export const createVNPayPaymentAPI = async (data, idempotencyKey, analyticsSessionId) => {
  return await axios({
    url: "/payment/create",
    method: "POST",
    data,
    headers: {
      "Content-Type": "application/json",
      "X-Idempotency-Key": idempotencyKey,
      ...(analyticsSessionId ? { "X-Analytics-Session": analyticsSessionId } : {}),
    },
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

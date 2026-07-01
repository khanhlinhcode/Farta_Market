import axios from "api/axios";

export const postOrderAPI = async (data, idempotencyKey) => {
  return await axios({
    url: "/order",
    method: "POST",
    data,
    headers: {
      "Content-Type": "application/json",
      "X-Idempotency-Key": idempotencyKey,
    },
  });
};

export const createVNPayPaymentAPI = async (data, idempotencyKey) => {
  return await axios({
    url: "/payment/create",
    method: "POST",
    data,
    headers: {
      "Content-Type": "application/json",
      "X-Idempotency-Key": idempotencyKey,
    },
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

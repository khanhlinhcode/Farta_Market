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

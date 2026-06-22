import axios from "api/axios";

export const postOrderAPI = async (data) => {
  return await axios({
    url: "/order",
    method: "POST",
    data,
  });
};

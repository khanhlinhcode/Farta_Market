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

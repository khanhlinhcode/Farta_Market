import axios from "api/axios";

const END_POINT = {
  WISHLIST: "wishlist",
};

export const getWishlistAPI = async () => {
  return await axios.request({
    url: END_POINT.WISHLIST,
    method: "GET",
  });
};

export const addWishlistAPI = async (productId) => {
  return await axios.request({
    url: `${END_POINT.WISHLIST}/${productId}`,
    method: "POST",
  });
};

export const removeWishlistAPI = async (productId) => {
  return await axios.request({
    url: `${END_POINT.WISHLIST}/${productId}`,
    method: "DELETE",
  });
};

export const syncGuestWishlistAPI = async (ids = []) => {
  const productIds = [...new Set(ids.map(Number).filter(Boolean))];

  return await Promise.allSettled(
    productIds.map((productId) => addWishlistAPI(productId))
  );
};

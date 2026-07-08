import { useQuery } from "@tanstack/react-query";
import { optionUseQuery } from "utils/common";
import {
  getFrequentlyBoughtWithAPI,
  getProductDetaiAPI,
  getRelatedProductsAPI,
} from "./request";

export const useProductDetailUS = (id, option) => {
  return useQuery({
    queryKey: ["GetProductDetaiAPI", id],
    queryFn: () => getProductDetaiAPI(id),
    enabled: Boolean(id),
    ...optionUseQuery,
    ...option,
  });
};

export const useRelatedProductsUS = (id, option) => {
  return useQuery({
    queryKey: ["GetRelatedProductsAPI", id],
    queryFn: () => getRelatedProductsAPI(id),
    enabled: Boolean(id),
    select: (response) => response?.data || [],
    ...optionUseQuery,
    ...option,
  });
};

export const useFrequentlyBoughtWithUS = (id, option) => {
  return useQuery({
    queryKey: ["GetFrequentlyBoughtWithAPI", id],
    queryFn: () => getFrequentlyBoughtWithAPI(id),
    enabled: Boolean(id),
    select: (response) => response?.data || [],
    ...optionUseQuery,
    ...option,
  });
};

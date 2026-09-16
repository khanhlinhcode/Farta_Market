import { useQuery } from "@tanstack/react-query";
import {
  getCategoriesAPI,
  getProductsAPI,
  getRecommendedProductsAPI,
  getSiteContentAPI,
} from "./request";
import { optionUseQuery } from "utils/common";
export const useGetCategoriesUS = (option) => {
  return useQuery({
    queryKey: ["GetCategoriesAPI"],
    queryFn: () => getCategoriesAPI(),
    ...optionUseQuery,
    ...option,
  });
};

export const useGetProductsUS = (params = {}, option = {}) => {
  const { raw = false, ...queryOptions } = option;

  return useQuery({
    queryKey: ["GetProductsAPI", params],
    queryFn: () => getProductsAPI(params),
    select: raw ? undefined : (response) => response?.data || [],
    ...optionUseQuery,
    ...queryOptions,
  });
};

export const useRecommendedProductsUS = (option = {}) => {
  return useQuery({
    queryKey: ["GetRecommendedProductsAPI"],
    queryFn: () => getRecommendedProductsAPI(),
    select: (response) => response?.data || [],
    ...optionUseQuery,
    ...option,
  });
};

export const useGetSiteContentUS = (option = {}) => {
  return useQuery({
    queryKey: ["GetSiteContentAPI"],
    queryFn: getSiteContentAPI,
    staleTime: 5 * 60 * 1000,
    ...optionUseQuery,
    ...option,
  });
};

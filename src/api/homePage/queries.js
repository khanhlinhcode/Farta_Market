import { useQuery } from "@tanstack/react-query";
import { getCategoriesAPI, getProductsAPI } from "./request";
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

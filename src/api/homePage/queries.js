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

export const useGetProductsUS = (option) => {
  return useQuery({
    queryKey: ["GetProductsAPI"],
    queryFn: () => getProductsAPI(),
    ...optionUseQuery,
    ...option,
  });
};

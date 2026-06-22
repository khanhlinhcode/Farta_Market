import { useQuery } from "@tanstack/react-query";
import { optionUseQuery } from "utils/common";
import { getProductDetaiAPI } from "./request";
export const useProductDetailUS = (id, option) => {
  return useQuery({
    queryKey: ["GetProductDetaiAPI", id],
    queryFn: () => getProductDetaiAPI(id),
    enabled: Boolean(id),
    ...optionUseQuery,
    ...option,
  });
};

import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addWishlistAPI,
  getWishlistAPI,
  removeWishlistAPI,
} from "api/wishlist";
import {
  addToWishlist,
  removeFromWishlist,
  setWishlist,
} from "../redux/wishlistSlice";
import { SESSION_KEYS } from "utils/constant";
import { ROUTERS } from "utils/router";

const isAuthenticated = () =>
  typeof window !== "undefined" &&
  Boolean(window.localStorage.getItem(SESSION_KEYS.ADMIN_TOKEN));

const useWishlist = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const ids = useSelector((state) => state.wishlist?.ids || []);
  const loggedIn = isAuthenticated();

  const wishlistQuery = useQuery({
    queryKey: ["wishlist"],
    queryFn: getWishlistAPI,
    enabled: loggedIn,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (wishlistQuery.data?.ids) {
      dispatch(setWishlist(wishlistQuery.data.ids));
    }
  }, [dispatch, wishlistQuery.data]);

  const idSet = useMemo(() => new Set(ids), [ids]);

  const isWishlisted = useCallback(
    (productId) => idSet.has(Number(productId)),
    [idSet]
  );

  const toggleWishlist = useCallback(
    async (product) => {
      if (!product?.id) {
        return false;
      }

      if (!isAuthenticated()) {
        toast.error(t("wishlist.loginRequired"));
        const redirect = `${location.pathname}${location.search}`;
        navigate(
          `${ROUTERS.USER.LOGIN}?redirect=${encodeURIComponent(redirect)}`
        );
        return false;
      }

      const productId = Number(product.id);
      const wasActive = idSet.has(productId);

      if (wasActive) {
        dispatch(removeFromWishlist(productId));
      } else {
        dispatch(addToWishlist(productId));
      }

      try {
        if (wasActive) {
          await removeWishlistAPI(productId);
          toast.success(t("wishlist.removed"));
        } else {
          await addWishlistAPI(productId);
          toast.success(t("wishlist.added"));
        }

        queryClient.invalidateQueries({ queryKey: ["wishlist"] });
        return true;
      } catch (error) {
        if (wasActive) {
          dispatch(addToWishlist(productId));
        } else {
          dispatch(removeFromWishlist(productId));
        }

        toast.error(error?.response?.data?.message || t("common.error"));
        return false;
      }
    },
    [dispatch, idSet, location.pathname, location.search, navigate, queryClient, t]
  );

  return {
    ids,
    isLoading: wishlistQuery.isLoading,
    isWishlisted,
    loggedIn,
    toggleWishlist,
  };
};

export default useWishlist;

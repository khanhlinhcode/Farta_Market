import { memo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { generatePath, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  AiFillHeart,
  AiOutlineEye,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import Breadcrumb from "../theme/breadcrumb";
import { getWishlistAPI } from "api/wishlist";
import useShoppingCart from "hooks/useShoppingCart";
import useWishlist from "hooks/useWishlist";
import { formatter } from "utils/fomater";
import { resolveProductImage } from "utils/productImages";
import { SESSION_KEYS } from "utils/constant";
import { ROUTERS } from "utils/router";
import "./style.scss";

const WishlistPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToCart } = useShoppingCart();
  const { toggleWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isLoggedIn =
    typeof window !== "undefined" &&
    Boolean(window.localStorage.getItem(SESSION_KEYS.ADMIN_TOKEN));

  const loadWishlist = async () => {
    if (!isLoggedIn) {
      navigate(ROUTERS.USER.LOGIN, { replace: true });
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await getWishlistAPI();
      setProducts(response.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || t("wishlist.loadError"));
      toast.error(t("common.error"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemove = async (product) => {
    setProducts((currentProducts) =>
      currentProducts.filter((item) => item.id !== product.id)
    );

    const success = await toggleWishlist(product);
    if (!success) {
      setProducts((currentProducts) => [product, ...currentProducts]);
    }
  };

  const handleAddToCart = (product) => {
    if (Number(product.inventory || 0) <= 0) {
      toast.error(t("productCard.outOfStockNotice"));
      return;
    }

    addToCart(product, 1);
    toast.success(t("cart.added"));
  };

  return (
    <>
      <Breadcrumb name={t("wishlist.title")} />
      <main className="wishlist-page">
        <div className="container">
          <div className="wishlist-page__header">
            <div>
              <h1>{t("wishlist.title")}</h1>
              <p>{t("wishlist.subtitle", { count: products.length })}</p>
            </div>
            <button type="button" onClick={loadWishlist}>
              {t("common.retry")}
            </button>
          </div>

          {isLoading && (
            <div className="wishlist-page__state">{t("common.loading")}</div>
          )}
          {error && (
            <div className="wishlist-page__state is-error">{error}</div>
          )}
          {!isLoading && !error && products.length === 0 && (
            <div className="wishlist-page__empty">
              <AiFillHeart />
              <h2>{t("wishlist.emptyTitle")}</h2>
              <p>{t("wishlist.empty")}</p>
              <Link to={ROUTERS.USER.PRODUCTS}>{t("wishlist.continueShopping")}</Link>
            </div>
          )}

          <div className="wishlist-page__grid">
            {products.map((product) => {
              const reviewCount = Number(
                product.review_count || product.reviews_count || 0
              );
              const avgRating = Number(product.avg_rating || 0);
              const isOutOfStock = Number(product.inventory || 0) <= 0;

              return (
                <article className="wishlist-card" key={product.id}>
                  <Link
                    className="wishlist-card__image"
                    to={generatePath(ROUTERS.USER.PRODUCT, { id: product.id })}
                  >
                    <img
                      src={resolveProductImage(product.img)}
                      alt={product.name}
                    />
                  </Link>
                  <div className="wishlist-card__body">
                    <div>
                      <h2>
                        <Link
                          to={generatePath(ROUTERS.USER.PRODUCT, {
                            id: product.id,
                          })}
                        >
                          {product.name}
                        </Link>
                      </h2>
                      <p>
                        {reviewCount > 0
                          ? `★ ${avgRating.toFixed(1)} (${reviewCount})`
                          : t("reviews.noReviewsShort")}
                      </p>
                    </div>
                    <strong>{formatter(product.price)}</strong>
                    <div className="wishlist-card__actions">
                      <Link
                        to={generatePath(ROUTERS.USER.PRODUCT, { id: product.id })}
                        aria-label={t("productDetail.breadcrumb")}
                      >
                        <AiOutlineEye />
                        <span>{t("productDetail.breadcrumb")}</span>
                      </Link>
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => handleAddToCart(product)}
                      >
                        <AiOutlineShoppingCart />
                        <span>{t("productCard.addToCart")}</span>
                      </button>
                      <button
                        type="button"
                        className="is-danger"
                        onClick={() => handleRemove(product)}
                      >
                        <AiFillHeart />
                        <span>{t("wishlist.remove")}</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
};

export default memo(WishlistPage);

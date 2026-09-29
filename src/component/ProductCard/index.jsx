import { memo, useEffect, useState } from "react";
import "./style.scss";
import {
  AiFillHeart,
  AiOutlineEye,
  AiOutlineHeart,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { generatePath, Link } from "react-router-dom";
import { formatter } from "utils/formatter";
import { ROUTERS } from "utils/router";
import { resolveProductImage } from "utils/productImages";
import useShoppingCart from "hooks/useShoppingCart";
import useWishlist from "hooks/useWishlist";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { translateProductName } from "utils/i18nLabels";

const ProductCard = ({ product }) => {
  const { t } = useTranslation();
  const { addToCart, authPending } = useShoppingCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const isOutOfStock = Number(product.inventory || 0) <= 0;
  const reviewCount = Number(product.review_count || product.reviews_count || 0);
  const avgRating = Number(product.avg_rating || 0);
  const wishlisted = isWishlisted(product.id);
  const productName = translateProductName(product, t);
  const productImage = resolveProductImage(product.img);
  const productPath = generatePath(ROUTERS.USER.PRODUCT, { id: product.id });
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
  }, [productImage]);

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error(t("productCard.outOfStockNotice"));
      return;
    }

    addToCart(product, 1);
  };

  return (
    <>
      <article className="featured__item pl-r-10">
        <Link
          className="featured__item__primary-link"
          to={productPath}
          aria-label={t("productCard.viewDetails", { name: productName })}
          data-testid="product-card"
        />
        <div
          className={`featured__item__pic${imageLoaded ? " is-loaded" : " is-loading"}`}
        >
          <img
            className="featured__item__image"
            src={productImage}
            alt=""
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
          />
          <ul className="featured__item__pic__hover">
            <li>
              <button
                type="button"
                className={`featured__item__action featured__item__wishlist-button${
                  wishlisted ? " is-active" : ""
                }`}
                onClick={() => toggleWishlist(product)}
                title={t("wishlist.toggle")}
                aria-label={t("wishlist.toggle")}
              >
                {wishlisted ? <AiFillHeart /> : <AiOutlineHeart />}
              </button>
            </li>
            <li>
              <Link
                className="featured__item__action"
                to={productPath}
                title={t("productDetail.breadcrumb")}
                aria-label={t("productDetail.breadcrumb")}
              >
                <AiOutlineEye />
              </Link>
            </li>
            <li>
              <button
                type="button"
                className="featured__item__action featured__item__cart-button"
                disabled={isOutOfStock || authPending}
                onClick={handleAddToCart}
                title={
                  authPending
                    ? t("cart.sessionChecking")
                    : isOutOfStock
                    ? t("productCard.outOfStockNotice")
                    : t("productCard.addToCart")
                }
                aria-label={
                  authPending
                    ? t("cart.sessionChecking")
                    : isOutOfStock
                    ? t("productCard.outOfStockNotice")
                    : t("productCard.addToCart")
                }
              >
                <AiOutlineShoppingCart />
              </button>
            </li>
          </ul>
          <span
            className={`featured__item__stock${
              isOutOfStock ? " featured__item__stock--out" : ""
            }`}
          >
            {isOutOfStock
              ? t("productCard.outOfStock")
              : t("productCard.stockRemaining", { count: product.inventory })}
          </span>
        </div>
        <div className="featured__item__text">
          <h3>
            <span className="featured__item__name">{productName}</span>
          </h3>
          <div className="featured__item__rating">
            {reviewCount > 0 ? (
              <>
                <span aria-hidden="true">★</span>
                {avgRating.toFixed(1)} <small>({reviewCount})</small>
              </>
            ) : (
              <small>{t("reviews.noReviewsShort")}</small>
            )}
          </div>
          <p className="featured__item__price">{formatter(product.price)}</p>
        </div>
      </article>
    </>
  );
};

export default memo(ProductCard);

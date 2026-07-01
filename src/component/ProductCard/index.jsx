import { memo } from "react";
import "./style.scss";
import {
  AiFillHeart,
  AiOutlineEye,
  AiOutlineHeart,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { generatePath, Link } from "react-router-dom";
import { formatter } from "utils/fomater";
import { ROUTERS } from "utils/router";
import { resolveProductImage } from "utils/productImages";
import useShoppingCart from "hooks/useShoppingCart";
import useWishlist from "hooks/useWishlist";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

const ProductCard = ({ product }) => {
  const { t } = useTranslation();
  const { addToCart } = useShoppingCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const isOutOfStock = Number(product.inventory || 0) <= 0;
  const reviewCount = Number(product.review_count || product.reviews_count || 0);
  const avgRating = Number(product.avg_rating || 0);
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error(t("productCard.outOfStockNotice"));
      return;
    }

    addToCart(product, 1);
    toast.success(t("cart.added"));
  };

  return (
    <>
      <div className="featured__item pl-r-10">
        <div
          className="featured__item__pic"
          style={{ backgroundImage: `url(${resolveProductImage(product.img)})` }}
        >
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
                to={generatePath(ROUTERS.USER.PRODUCT, { id: product.id })}
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
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                title={
                  isOutOfStock
                    ? t("productCard.outOfStockNotice")
                    : t("productCard.addToCart")
                }
                aria-label={
                  isOutOfStock
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
          <h6>
            <Link
              to={generatePath(ROUTERS.USER.PRODUCT, { id: product.id })}
              data-testid="product-card"
            >
              {product.name}
            </Link>
          </h6>
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
          <h5>{formatter(product.price)}</h5>
        </div>
      </div>
    </>
  );
};

export default memo(ProductCard);

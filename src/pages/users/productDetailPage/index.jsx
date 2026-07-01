import { memo, useEffect, useMemo, useState } from "react";
import Breadcrumb from "../theme/breadcrumb";
import "./style.scss";
import {
  AiOutlineEye,
  AiOutlineFacebook,
  AiOutlineInstagram,
  AiOutlineLinkedin,
  AiOutlineTwitter,
} from "react-icons/ai";
import { formatter } from "utils/fomater";
import { ProductCard, Quantity, SafeHtml } from "component";
import { useProductDetailUS } from "api/productDetailPage";
import { useGetProductsUS } from "api/homePage";
import { useParams } from "react-router-dom";
import { resolveProductImage } from "utils/productImages";
import { useTranslation } from "react-i18next";
import { translateCategoryName } from "utils/i18nLabels";
import {
  getProductReviewEligibilityAPI,
  getProductReviewsAPI,
  postProductReviewAPI,
} from "api/productDetailPage";
import { SESSION_KEYS } from "utils/constant";
import toast from "react-hot-toast";

const renderStars = (rating, interactive = false, onSelect = null) =>
  [1, 2, 3, 4, 5].map((value) => {
    const active = value <= Number(rating || 0);

    if (!interactive) {
      return (
        <span key={value} className={active ? "is-active" : ""}>
          ★
        </span>
      );
    }

    return (
      <button
        type="button"
        key={value}
        className={active ? "is-active" : ""}
        onClick={() => onSelect?.(value)}
        aria-label={`${value} sao`}
      >
        ★
      </button>
    );
  });

const ProductDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: product, isLoading, isError } = useProductDetailUS(id);
  const { data: products = [] } = useGetProductsUS();
  const [reviews, setReviews] = useState([]);
  const [reviewMeta, setReviewMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const [reviewSummary, setReviewSummary] = useState({
    avg_rating: 0,
    review_count: 0,
  });
  const [reviewEligibility, setReviewEligibility] = useState({
    has_purchased: false,
    has_reviewed: false,
    can_review: false,
  });
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const relatedProducts = useMemo(() => {
    if (!product) {
      return [];
    }

    return products
      .filter(
        (item) =>
          item.id !== product.id && item.category_id === product.category_id
      )
      .slice(0, 4);
  }, [product, products]);

  const isLoggedIn =
    typeof window !== "undefined" &&
    Boolean(window.localStorage.getItem(SESSION_KEYS.ADMIN_TOKEN));

  const loadReviews = async (page = 1, append = false) => {
    if (!id) {
      return;
    }

    setReviewsLoading(true);
    setReviewError("");

    try {
      const response = await getProductReviewsAPI(id, { page });
      setReviews((currentReviews) =>
        append ? [...currentReviews, ...(response.data || [])] : response.data || []
      );
      setReviewMeta(
        response.meta || { current_page: 1, last_page: 1, total: 0 }
      );
      setReviewSummary(response.summary || { avg_rating: 0, review_count: 0 });
    } catch (err) {
      setReviewError(err?.response?.data?.message || t("reviews.loadError"));
    } finally {
      setReviewsLoading(false);
    }
  };

  const loadReviewEligibility = async () => {
    if (!id || !isLoggedIn) {
      setReviewEligibility({
        has_purchased: false,
        has_reviewed: false,
        can_review: false,
      });
      return;
    }

    try {
      const response = await getProductReviewEligibilityAPI(id);
      setReviewEligibility(response);
    } catch (err) {
      setReviewEligibility({
        has_purchased: false,
        has_reviewed: false,
        can_review: false,
      });
    }
  };

  useEffect(() => {
    setReviews([]);
    setReviewMeta({ current_page: 1, last_page: 1, total: 0 });
    setReviewSummary({ avg_rating: 0, review_count: 0 });
    loadReviews();
    loadReviewEligibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isLoggedIn]);

  const effectiveSummary = {
    avg_rating:
      Number(reviewSummary.avg_rating) || Number(product?.avg_rating || 0),
    review_count:
      Number(reviewSummary.review_count) ||
      Number(product?.review_count || product?.reviews_count || 0),
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setReviewError("");

    if (!reviewEligibility.can_review) {
      return;
    }

    if (!reviewComment.trim()) {
      setReviewError(t("reviews.commentRequired"));
      return;
    }

    setReviewSubmitting(true);

    try {
      const response = await postProductReviewAPI(id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setReviews((currentReviews) => [response.data, ...currentReviews].slice(0, 5));
      setReviewSummary(response.summary || effectiveSummary);
      setReviewEligibility((current) => ({
        ...current,
        has_reviewed: true,
        can_review: false,
      }));
      setReviewComment("");
      setReviewRating(5);
      toast.success(t("reviews.submitSuccess"));
      loadReviews(1);
    } catch (err) {
      const message = err?.response?.data?.message || t("reviews.submitError");
      setReviewError(message);
      toast.error(message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <>
      <Breadcrumb name={t("productDetail.breadcrumb")} />
      {isLoading && (
        <h1 className="product__detail__state">{t("productDetail.loading")}</h1>
      )}
      {isError && (
        <h1 className="product__detail__state">{t("productDetail.loadError")}</h1>
      )}
      {!isLoading && product && (
        <div className="container">
          <div className="product-detail-layout">
            <div className="product__detail__pic">
              <img src={resolveProductImage(product.img)} alt={product.name} />
              <div className="main">
                <img src={resolveProductImage(product.img)} alt={product.name} />
              </div>
            </div>
            <div className="product__detail__text">
              <h2>{product.name}</h2>
              <div className="seen-icon">
                <AiOutlineEye />
                {t("productDetail.viewCount", { count: 10 })}
              </div>
              <div className="product__detail__rating">
                <span className="product__detail__stars">
                  {renderStars(Math.round(effectiveSummary.avg_rating))}
                </span>
                <span>
                  {t("reviews.summary", {
                    rating: Number(effectiveSummary.avg_rating || 0).toFixed(1),
                    count: effectiveSummary.review_count,
                  })}
                </span>
              </div>
              <h3>{formatter(product.price)}</h3>
              <p>{product.sort_description}</p>
              <Quantity product={product} maxQuantity={product.inventory} />
              <ul>
                <li>
                  <b>{t("productDetail.status")}:</b>{" "}
                  <span>
                    {product.inventory > 0
                      ? t("productDetail.inStock")
                      : t("productDetail.outOfStock")}
                  </span>
                </li>
                <li>
                  <b>{t("productDetail.quantity")}:</b> <span>{product.inventory}</span>
                </li>
                <li>
                  <b>{t("productDetail.category")}:</b>{" "}
                  <span>
                    {product.category?.name
                      ? translateCategoryName(product.category.name, t)
                      : t("common.noCategory")}
                  </span>
                </li>
                <li>
                  <b>{t("productDetail.share")}:</b>{" "}
                  <span>
                    <AiOutlineFacebook />
                    <AiOutlineInstagram />
                    <AiOutlineLinkedin />
                    <AiOutlineTwitter />
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div className="product__detail__tab">
            <h4>{t("productDetail.detailInfo")}</h4>
            <SafeHtml html={product.description} />
          </div>
          <section className="product__reviews">
            <div className="product__reviews__header">
              <div>
                <h4>{t("reviews.title")}</h4>
                <p>
                  <span className="product__detail__stars">
                    {renderStars(Math.round(effectiveSummary.avg_rating))}
                  </span>
                  {t("reviews.summary", {
                    rating: Number(effectiveSummary.avg_rating || 0).toFixed(1),
                    count: effectiveSummary.review_count,
                  })}
                </p>
              </div>
            </div>

            {reviewError && (
              <div className="product__reviews__state is-error">{reviewError}</div>
            )}
            {reviewsLoading && reviews.length === 0 && (
              <div className="product__reviews__state">{t("common.loading")}</div>
            )}
            {!reviewsLoading && reviews.length === 0 && (
              <div className="product__reviews__state">
                {t("reviews.empty")}
              </div>
            )}

            <div className="product__reviews__list">
              {reviews.map((review) => (
                <article className="product__review" key={review.id}>
                  <div>
                    <b>{review.user?.name || t("reviews.customer")}</b>
                    <span className="product__detail__stars">
                      {renderStars(review.rating)}
                    </span>
                  </div>
                  <p>{review.comment}</p>
                  <small>
                    {review.created_at
                      ? new Date(review.created_at).toLocaleDateString("vi-VN")
                      : ""}
                  </small>
                </article>
              ))}
            </div>

            {reviewMeta.current_page < reviewMeta.last_page && (
              <button
                type="button"
                className="product__reviews__more"
                disabled={reviewsLoading}
                onClick={() => loadReviews(reviewMeta.current_page + 1, true)}
              >
                {reviewsLoading ? t("common.loading") : t("reviews.loadMore")}
              </button>
            )}

            <div className="product__reviews__form-wrap">
              {reviewEligibility.can_review ? (
                <form className="product__reviews__form" onSubmit={handleReviewSubmit}>
                  <h5>{t("reviews.writeReview")}</h5>
                  <div className="product__reviews__rating-input">
                    {renderStars(reviewRating, true, setReviewRating)}
                  </div>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(event) => setReviewComment(event.target.value)}
                    placeholder={t("reviews.commentPlaceholder")}
                  />
                  <button type="submit" disabled={reviewSubmitting}>
                    {reviewSubmitting ? t("common.loading") : t("reviews.submit")}
                  </button>
                </form>
              ) : (
                <div className="product__reviews__hint">
                  {!isLoggedIn
                    ? t("reviews.loginToReview")
                    : reviewEligibility.has_reviewed
                    ? t("reviews.alreadyReviewed")
                    : t("reviews.purchaseRequired")}
                </div>
              )}
            </div>
          </section>
          <div className="section-title">
            <h2>{t("productDetail.relatedProducts")}</h2>
          </div>
          <div className="row">
            {relatedProducts.map((item) => (
              <div key={item.id} className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
                <ProductCard product={item} />
              </div>
            ))}
            {!relatedProducts.length && (
              <div className="product__detail__state">
                {t("productDetail.noRelated")}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default memo(ProductDetailPage);

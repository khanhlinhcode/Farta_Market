import { memo } from "react";
import "./style.scss";

const ProductCardSkeleton = () => (
  <div className="product-card-skeleton" aria-hidden="true">
    <div className="product-card-skeleton__image skeleton-pulse" />
    <div className="product-card-skeleton__line product-card-skeleton__line--name skeleton-pulse" />
    <div className="product-card-skeleton__line product-card-skeleton__line--price skeleton-pulse" />
  </div>
);

export default memo(ProductCardSkeleton);

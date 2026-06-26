import { memo, useMemo } from "react";
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

const ProductDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: product, isLoading, isError } = useProductDetailUS(id);
  const { data: products = [] } = useGetProductsUS();

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
                  <span>{product.category?.name || t("common.noCategory")}</span>
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

import { memo } from "react";
import Breadcrumb from "../theme/breadcrumb";
import "./style.scss";
import cat1Img from "assets/users/images/categories/cat-1.png";
import cat2Img from "assets/users/images/categories/cat-2.png";
import cat3Img from "assets/users/images/categories/cat-3.png";
import {
  AiOutlineEye,
  AiOutlineFacebook,
  AiOutlineInstagram,
  AiOutlineLinkedin,
  AiOutlineTwitter,
} from "react-icons/ai";
import { formatter } from "utils/fomater";
import { ProductCard, Quantity, SafeHtml } from "component";
import { featProducts } from "utils/common";
import { useProductDetailUS } from "api/productDetailPage";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  translateProductDescription,
  translateProductName,
  translateProductShortDescription,
} from "utils/i18nLabels";

const ProductDetailPage = () => {
  const { t } = useTranslation();
  const imgs = [cat1Img, cat2Img, cat3Img];
  const { id } = useParams();
  const { data: product, isLoading } = useProductDetailUS(id);
  const productName = product ? translateProductName(product, t) : "";

  return (
    <>
      <Breadcrumb name={t("productDetail.breadcrumb")} />
      {isLoading && <h1>{t("common.loading")}</h1>}
      {!isLoading && (
        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-xl-12 col-md-12 col-sm-12 col-xs-12 product__detail__pic">
              <img src={cat3Img} alt="product-pic" />
              <div className="main">
                {imgs.map((item, key) => (
                  <img src={item} alt="product-pic " key={key} />
                ))}
              </div>
            </div>
            <div className="col-lg-6 col-xl-12 col-md-12 col-sm-12 col-xs-12 product__detail__text">
              <h2>{productName}</h2>
              <div className="seen-icon">
                <AiOutlineEye />
                {t("productDetail.viewCount", { count: 10 })}
              </div>
              <h3>{formatter(product.price)}</h3>
              <p>{translateProductShortDescription(product, t)}</p>
              <Quantity product={product} />
              <ul>
                <li>
                  <b>{t("productDetail.status")}:</b>{" "}
                  <span>{t("productDetail.inStock")}</span>
                </li>
                <li>
                  <b>{t("productDetail.quantity")}:</b>{" "}
                  <span>{product.inventory}</span>
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
            <SafeHtml html={translateProductDescription(product, t)} />
          </div>
          <div className="section-title">
            <h2>{t("productDetail.relatedProducts")}</h2>
          </div>
          <div className="row">
            {featProducts.all.product.map((item, key) => (
              <div key={key} className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
                <ProductCard product={item} />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
export default memo(ProductDetailPage);

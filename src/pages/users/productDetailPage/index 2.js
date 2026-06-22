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
import { ProductCard, Quantity } from "component";
import { useProductDetailUS } from "api/productDetailPage";
import { useGetProductsUS } from "api/homePage";
import { useParams } from "react-router-dom";
import { resolveProductImage } from "utils/productImages";

const ProductDetailPage = () => {
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
      <Breadcrumb name="Chi Tiết Sản Phẩm" />
      {isLoading && <h1 className="product__detail__state">Đang tải...</h1>}
      {isError && <h1 className="product__detail__state">Không tải được sản phẩm.</h1>}
      {!isLoading && product && (
        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-xl-12 col-md-12 col-sm-12 col-xs-12 product__detail__pic">
              <div className="product__detail__image-frame">
                <img src={resolveProductImage(product.img)} alt={product.name} />
              </div>
              <div className="product__detail__thumbs">
                <button type="button" className="product__detail__thumb active">
                  <img src={resolveProductImage(product.img)} alt={product.name} />
                </button>
              </div>
            </div>
            <div className="col-lg-6 col-xl-12 col-md-12 col-sm-12 col-xs-12 product__detail__text">
              <h2>{product.name}</h2>
              <div className="seen-icon">
                <AiOutlineEye />
                {`10 (Lượt đã xem)`}
              </div>
              <h3>{formatter(product.price)}</h3>
              <p>{product.sort_description}</p>
              <Quantity product={product} maxQuantity={product.inventory} />
              <ul>
                <li>
                  <b>Tình trạng:</b>{" "}
                  <span>{product.inventory > 0 ? "Còn hàng" : "Hết hàng"}</span>
                </li>
                <li>
                  <b>Số Lượng:</b> <span>{product.inventory}</span>
                </li>
                <li>
                  <b>Danh mục:</b> <span>{product.category?.name || "Chưa có"}</span>
                </li>
                <li>
                  <b>Chia Sẻ:</b>{" "}
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
            <h4>Thông Tin Chi Tiết</h4>
            <div dangerouslySetInnerHTML={{ __html: product.description }} />
          </div>
          <div className="section-title">
            <h2>Sản Phẩm Tương Tự</h2>
          </div>
          <div className="row">
            {relatedProducts.map((item) => (
              <div key={item.id} className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
                <ProductCard product={item} />
              </div>
            ))}
            {!relatedProducts.length && (
              <div className="product__detail__state">Chưa có sản phẩm tương tự.</div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default memo(ProductDetailPage);

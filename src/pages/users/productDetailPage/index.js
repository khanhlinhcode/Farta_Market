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
import { ProductCard, Quantity } from "component";
import { featProducts } from "utils/common";
import { useProductDetailUS } from "api/productDetailPage";
import { useParams } from "react-router-dom";
const ProductDetailPage = () => {
  const imgs = [cat1Img, cat2Img, cat3Img];
  const { id } = useParams();
  const { data: product, isLoading } = useProductDetailUS(id);
  console.log(product);
  return (
    <>
      <Breadcrumb name="Chi Tiết Sản Phẩm" />
      {isLoading && <h1>Loading</h1>}
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
              <h2>{product.name}</h2>
              <div className="seen-icon">
                <AiOutlineEye />
                {`10(Lượt đã xem)`}
              </div>
              <h3>{formatter(product.price)}</h3>
              <p>{product.sort_description}</p>
              <Quantity product={product} />
              <ul>
                <li>
                  <b>Tình trạng:</b> <span>Còn Hàng</span>
                </li>
                <li>
                  <b>Số Lượng:</b> <span>{product.inventory}</span>
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

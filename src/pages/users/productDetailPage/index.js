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
const ProductDetailPage = () => {
  const imgs = [cat1Img, cat2Img, cat3Img];
  return (
    <>
      <Breadcrumb name="Chi Tiet San Pham" />
      <div className="container">
        <div className="row">
          <div className="col-lg-6 product__detail__pic">
            <img src={cat3Img} alt="product-pic" />
            <div className="main">
              {imgs.map((item, key) => (
                <img src={item} alt="product-pic " key={key} />
              ))}
            </div>
          </div>
          <div className="col-lg-6 product__detail__text">
            <h2>Rau Củ Xanh</h2>
            <div className="seen-icon">
              <AiOutlineEye />
              {`10(Lượt đã xem)`}
            </div>
            <h3>{formatter(200000)}</h3>
            <p>
              Farta Market là một trong những hệ thống cửa hàng hoa quả nhập
              khẩu ở Đà Nẵng cung cấp cho quý khách hàng những trái dưa lưới
              Egarden tươi ngon nhất như các loại hoa quả nhập khẩu, hoa quả
              vùng miền khác.
            </p>
            <ul>
              <li>
                <b>Tình trạng:</b> <span>Còn Hàng</span>
              </li>
              <li>
                <b>Số Lượng:</b> <span>20</span>
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
      </div>
    </>
  );
};
export default memo(ProductDetailPage);

import { memo } from "react";
import Breadcrumb from "../theme/breadcrumb";
import "./style.scss";
import { formatter } from "utils/fomater";
import { Quantity } from "component";
import { AiOutlineClose } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { ROUTERS } from "utils/router";
import { ReactSession } from "react-client-session";
import { SESSION_KEYS } from "utils/constant";
import { useState } from "react";
const ShoppingCartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(ReactSession.get(SESSION_KEYS.CART));

  return (
    <>
      <Breadcrumb name="Giỏ hàng" />
      <div className="container">
        <div className="table__cart">
          <table>
            <thead>
              <tr>
                <th>Tên</th>
                <th>Giá</th>
                <th>Số Lượng</th>
                <th>Thành Tiền</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {cart?.products.map(({ product, quantity }) => (
                <tr key={product.id}>
                  <td className="shopping__cart__item">
                    <img src={product.img} alt="product-pic" />
                    <h4>{product.name}</h4>
                  </td>
                  <td>{formatter(product.price)}</td>
                  <td>
                    <Quantity quantity={quantity} hasAddToCart={false} />
                  </td>
                  <td>{formatter(product.price * quantity)}</td>
                  <td className="icon_close">
                    <AiOutlineClose />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="row">
          <div className="col-lg-6 col-md-12 col-sm-12 col-xs-12">
            <div className="shopping__continue">
              <h3>MÃ Giảm Giá</h3>
              <div className="shopping_discount">
                <input placeholder="Nhap Ma Giam Gia" />
                <button type="button" className="button-submit">
                  Áp Dụng
                </button>
              </div>
            </div>
          </div>
          <div className="col-lg-6 col-md-12 col-sm-12 col-xs-12">
            <div className="shopping__checkout">
              <h2>Tổng Đơn</h2>
              <ul>
                <li>
                  Số Lượng: <span>2</span>
                  Thành Tiền: <span>{formatter(200000)}</span>
                </li>
              </ul>
              <button
                type="button"
                className="button-submit"
                onClick={() => navigate(ROUTERS.USER.CHECKOUT)}
              >
                Thanh Toán
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default memo(ShoppingCartPage);

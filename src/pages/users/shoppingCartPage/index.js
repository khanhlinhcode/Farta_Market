import { memo } from "react";
import Breadcrumb from "../theme/breadcrumb";
import "./style.scss";
import { formatter } from "utils/fomater";
import { Quantity } from "component";
import { AiOutlineClose } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { ROUTERS } from "utils/router";
import { SESSION_KEYS } from "utils/constant";
import { useState } from "react";
import useShoppingCart from "hooks/useShoppingCart";
import { resolveProductImage } from "utils/productImages";
import { getSessionItem } from "utils/session";
const ShoppingCartPage = () => {
  const navigate = useNavigate();
  const { removeCart, updateCartQuantity, emptyCart } = useShoppingCart();
  const [cart, setCart] = useState(getSessionItem(SESSION_KEYS.CART, emptyCart));
  const hasProducts = cart.products.length > 0;

  return (
    <>
      <Breadcrumb name="Giỏ hàng" />
      {hasProducts ? (
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
                {cart?.products.map(({ product, quantity }, key) => (
                  <tr key={key}>
                    <td className="shopping__cart__item">
                      <img src={resolveProductImage(product.img)} alt="product-pic" />
                      <h4>{product.name}</h4>
                    </td>
                    <td>{formatter(product.price)}</td>
                    <td>
                      <Quantity
                        initQuantity={quantity}
                        hasAddToCart={false}
                        onChange={(nextQuantity) =>
                          setCart(updateCartQuantity(product.id, nextQuantity))
                        }
                      />
                    </td>
                    <td>{formatter(product.price * quantity)}</td>
                    <td
                      className="icon_close"
                      onClick={() => setCart(removeCart(product.id))}
                    >
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
                    Số Lượng: <span>{cart.totalQuantity}</span>
                  </li>
                  <li>
                    Thành Tiền: <span>{formatter(cart.totalPrice)}</span>
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
      ) : (
        <div className="container">
          <div className="product-list-state">Giỏ hàng đang trống.</div>
        </div>
      )}
    </>
  );
};
export default memo(ShoppingCartPage);

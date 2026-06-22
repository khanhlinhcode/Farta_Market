import { memo, useState } from "react";
import "./style.scss";
import { AiOutlineEye, AiOutlineShoppingCart } from "react-icons/ai";
import { generatePath, Link } from "react-router-dom";
import { formatter } from "utils/fomater";
import { ROUTERS } from "utils/router";
import { resolveProductImage } from "utils/productImages";
import useShoppingCart from "hooks/useShoppingCart";

const ProductCard = ({ product }) => {
  const { addToCart } = useShoppingCart();
  const [notice, setNotice] = useState("");
  const isOutOfStock = Number(product.inventory || 0) <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      setNotice("Sản phẩm đã hết hàng");
      return;
    }

    addToCart(product, 1);
    setNotice("Đã thêm vào giỏ");
    window.setTimeout(() => setNotice(""), 1200);
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
              <Link to={generatePath(ROUTERS.USER.PRODUCT, { id: product.id })}>
                <AiOutlineEye />
              </Link>
            </li>
            <li>
              <button
                type="button"
                className="featured__item__cart-button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                title={isOutOfStock ? "Sản phẩm đã hết hàng" : "Thêm vào giỏ"}
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
            {isOutOfStock ? "Hết hàng" : `Còn ${product.inventory}`}
          </span>
        </div>
        <div className="featured__item__text">
          <h6>
            <Link to={generatePath(ROUTERS.USER.PRODUCT, { id: product.id })}>
              {product.name}
            </Link>
          </h6>
          <h5>{formatter(product.price)}</h5>
          {notice && <div className="featured__item__notice">{notice}</div>}
        </div>
      </div>
    </>
  );
};

export default memo(ProductCard);

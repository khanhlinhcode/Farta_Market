import { memo } from "react";
import "./style.scss";
import { AiOutlineEye, AiOutlineShoppingCart } from "react-icons/ai";
import { generatePath, Link } from "react-router-dom";
import { formatter } from "utils/fomater";
import { ROUTERS } from "utils/router";

const ProductCard = ({ product }) => {
  return (
    <>
      <div className="featured__item pl-r-10">
        <div
          className="featured__item__pic"
          style={{ backgroundImage: `url(${generatePath(product.img)})` }}
        >
          <ul className="featured__item__pic__hover">
            <li>
              <AiOutlineEye />
            </li>
            <li>
              <AiOutlineShoppingCart />
            </li>
          </ul>
        </div>
        <div className="featured__item__text">
          <h6>
            <Link to={generatePath(ROUTERS.USER.PRODUCT, { id: product.id })}>
              {product.name}
            </Link>
          </h6>
          <h5>{formatter(product.price)}</h5>
        </div>
      </div>
    </>
  );
};

export default memo(ProductCard);

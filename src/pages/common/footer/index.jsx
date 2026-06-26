import { memo } from "react";
import "./style.scss";
import { Link } from "react-router-dom";
import {
  AiOutlineFacebook,
  AiOutlineInstagram,
  AiOutlineLinkedin,
  AiFillTwitterSquare,
} from "react-icons/ai";
import { useTranslation } from "react-i18next";
const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-lg-3 col-md-6 col-sm-6 col-xs-12">
            <div className="footer__about">
              <h1 className="footer__about__logo">{t("brand.name")}</h1>
              <ul>
                <li>{t("footer.addressLabel")}: 213 Trương Đình Nghệ</li>
                <li>Phone: 0977-232-232</li>
                <li>Email: FartaMarket@gmail.com</li>
              </ul>
            </div>
          </div>
          <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
            <div className="footer__widget">
              <h6>{t("footer.shop")}</h6>
              <ul>
                <li>
                  <Link to="#">{t("footer.contact")}</Link>
                </li>
                <li>
                  <Link to="">{t("footer.about")}</Link>
                </li>
                <li>
                  <Link to="">{t("footer.businessProducts")}</Link>
                </li>
              </ul>
              <ul>
                <li>
                  <Link to="">{t("footer.accountInfo")}</Link>
                </li>
                <li>
                  <Link to="">{t("footer.cart")}</Link>
                </li>
                <li>
                  <Link to="">{t("footer.wishlist")}</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-lg-3 col-md-12 col-sm-12 col-xs-12">
            <div className="footer__widget">
              <h6>{t("footer.promotion")}</h6>
              <p>{t("footer.subscribeText")}</p>
              <form action="#">
                <div className="input-group">
                  <input type="text" placeholder={t("footer.emailPlaceholder")} />
                  <button type="submit" className="button-submit">
                    {t("footer.subscribe")}
                  </button>
                </div>
                <div className="footer__widget__social">
                  <div>
                    <AiOutlineFacebook />
                  </div>
                  <div>
                    <AiOutlineInstagram />
                  </div>
                  <div>
                    <AiOutlineLinkedin />
                  </div>
                  <div>
                    <AiFillTwitterSquare />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default memo(Footer);

import { memo, useState } from "react";
import "./style.scss";
import { Link } from "react-router-dom";
import {
  AiOutlineFacebook,
  AiOutlineInstagram,
  AiOutlineLinkedin,
  AiFillTwitterSquare,
} from "react-icons/ai";
import { useTranslation } from "react-i18next";
import { ROUTERS } from "utils/router";
import { useGetSiteContentUS } from "api/homePage";
import { localizedValue } from "utils/siteContent";

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com",
    field: "facebook_url",
    Icon: AiOutlineFacebook,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com",
    field: "instagram_url",
    Icon: AiOutlineInstagram,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com",
    field: "linkedin_url",
    Icon: AiOutlineLinkedin,
  },
  {
    label: "Twitter",
    href: "https://www.twitter.com",
    field: "twitter_url",
    Icon: AiFillTwitterSquare,
  },
];

const Footer = () => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [subscribeMessage, setSubscribeMessage] = useState("");

  const profilePath = ROUTERS.USER.PROFILE.startsWith("/")
    ? ROUTERS.USER.PROFILE
    : `/${ROUTERS.USER.PROFILE}`;
  const { data: siteContent } = useGetSiteContentUS();
  const settings = siteContent?.settings || {};
  const address = localizedValue(settings, "address", i18n.resolvedLanguage, t("footer.addressValue"));
  const phone = settings.contact_phone || "0977232232";
  const contactEmail = settings.contact_email || "FartaMarket@gmail.com";
  const brandName = settings.brand_name || t("brand.name");
  const footerDescription = localizedValue(settings, "footer_description", i18n.resolvedLanguage);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const configuredSocialLinks = socialLinks
    .map((item) => ({ ...item, href: siteContent ? settings[item.field] : item.href }))
    .filter((item) => item.href);

  const handleSubscribe = (event) => {
    event.preventDefault();

    const nextEmail = email.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail);

    if (!isValidEmail) {
      setSubscribeMessage(t("footer.emailInvalid"));
      return;
    }

    setSubscribeMessage(t("footer.subscribeSuccess"));
    setEmail("");
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-lg-3 col-md-6 col-sm-6 col-xs-12">
            <div className="footer__about">
              <Link className="footer__about__logo" to={ROUTERS.USER.HOME}>
                {brandName}
              </Link>
              {footerDescription && <p>{footerDescription}</p>}
              <ul>
                <li>
                  {t("footer.addressLabel")}:{" "}
                  <a href={mapsUrl} target="_blank" rel="noreferrer">
                    {address}
                  </a>
                </li>
                <li>
                  {t("footer.phoneLabel")}:{" "}
                  <a href={`tel:${phone}`}>{phone}</a>
                </li>
                <li>
                  {t("footer.emailLabel")}:{" "}
                  <a href={`mailto:${contactEmail}`}>
                    {contactEmail}
                  </a>
                </li>
              </ul>
              <div className="footer__social" aria-label={t("footer.socialLinks")}>
                {configuredSocialLinks.map(({ label, href, Icon }) => (
                  <a
                    href={href}
                    key={label}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
            <div className="footer__widget">
              <h6>{t("footer.shop")}</h6>
              <ul>
                <li>
                  <a href={`tel:${phone}`}>{t("footer.contact")}</a>
                </li>
                <li>
                  <Link to={ROUTERS.USER.HOME}>{t("footer.about")}</Link>
                </li>
                <li>
                  <Link to={ROUTERS.USER.PRODUCTS}>
                    {t("footer.businessProducts")}
                  </Link>
                </li>
              </ul>
              <ul>
                <li>
                  <Link to={profilePath}>{t("footer.accountInfo")}</Link>
                </li>
                <li>
                  <Link to={ROUTERS.USER.SHOPPING_CART}>{t("footer.cart")}</Link>
                </li>
                <li>
                  <Link to={ROUTERS.USER.WISHLIST}>{t("footer.wishlist")}</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-lg-3 col-md-12 col-sm-12 col-xs-12">
            <div className="footer__widget">
              <h6>{t("footer.promotion")}</h6>
              <p>{t("footer.subscribeText")}</p>
              <form onSubmit={handleSubscribe}>
                <div className="input-group">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setSubscribeMessage("");
                    }}
                    placeholder={t("footer.emailPlaceholder")}
                  />
                  <button type="submit" className="button-submit">
                    {t("footer.subscribe")}
                  </button>
                </div>
                {subscribeMessage && (
                  <p className="footer__message">{subscribeMessage}</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default memo(Footer);

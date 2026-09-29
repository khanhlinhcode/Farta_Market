import "./style.scss";
import { ROUTERS } from "utils/router";
import { BiUser } from "react-icons/bi";
import { MdEmail } from "react-icons/md";
import { formatter } from "utils/formatter";
import { useGetCategoriesUS, useGetSiteContentUS } from "api/homePage";
import { LanguageSwitcher, SearchBar } from "component";
import { useDispatch, useSelector } from "react-redux";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useShoppingCart from "hooks/useShoppingCart";
import bannerImg from "assets/users/images/hero/Banner.png";
import { translateCategoryName } from "utils/i18nLabels";
import { clearUserSession, getUserName } from "utils/userAuth";
import { logoutUserAPI } from "api/auth";
import {
  isExternalUrl,
  localizedValue,
  resolveCustomerPhone,
} from "utils/siteContent";
import {
  clearCustomerUser,
  selectCustomerUser,
} from "../../../../redux/authSlice";
import {
  AiOutlineFacebook,
  AiOutlineInstagram,
  AiOutlineLinkedin,
  AiFillTwitterSquare,
  AiOutlineMail,
  AiOutlineShoppingCart,
  AiOutlineMenu,
  AiOutlinePhone,
  AiOutlineDownCircle,
  AiOutlineUpCircle,
  AiOutlineClose,
  AiOutlineAppstore,
} from "react-icons/ai";

const CONTACT_EMAIL = "FartaMarket@gmail.com";
const isCompactViewport = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(max-width: 991px)").matches;
const SOCIAL_LINKS = [
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

const Header = () => {
  const { t, i18n } = useTranslation();
  const { clearCart } = useShoppingCart();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isShowHumberger, setShowHumberger] = useState(false);
  const [activeMobileMenu, setActiveMobileMenu] = useState(null);
  const [isHome, setIsHome] = useState(location.pathname.length <= 1);
  const [isCompactNavigation, setIsCompactNavigation] = useState(isCompactViewport);
  const [isShowCategories, setShowCategories] = useState(
    () => isHome && !isCompactViewport()
  );
  const drawerRef = useRef(null);
  const closeButtonRef = useRef(null);
  const menuButtonRef = useRef(null);
  const { cart: cartRedux } = useSelector((state) => state.commonSlide);
  const currentUser = useSelector(selectCustomerUser);
  const isLoggedIn = Boolean(currentUser);
  const userName = getUserName(currentUser);
  const accountName = userName || t("navbar.account");

  useEffect(() => {
    const isHome = location.pathname.length <= 1;
    setIsHome(isHome);
    setShowCategories(isHome && !isCompactNavigation);
  }, [isCompactNavigation, location.pathname]);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return undefined;

    const mediaQuery = window.matchMedia("(max-width: 991px)");
    const handleViewportChange = (event) => setIsCompactNavigation(event.matches);
    mediaQuery.addEventListener?.("change", handleViewportChange);

    return () => mediaQuery.removeEventListener?.("change", handleViewportChange);
  }, []);

  useEffect(() => {
    if (!isShowHumberger) return undefined;

    const previousOverflow = document.body.style.overflow;
    const drawer = drawerRef.current;
    const focusable = drawer?.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusable?.[0];
    const lastFocusable = focusable?.[focusable.length - 1];
    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 0);
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowHumberger(false);
        return;
      }

      if (event.key !== "Tab" || !firstFocusable || !lastFocusable) return;
      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(focusTimer);
      menuButtonRef.current?.focus();
    };
  }, [isShowHumberger]);

  const { data: categories } = useGetCategoriesUS();
  const { data: siteContent, isLoading: isSiteContentLoading } = useGetSiteContentUS();
  const settings = siteContent?.settings || {};
  const contactEmail = settings.contact_email || CONTACT_EMAIL;
  const customerPhone = isSiteContentLoading
    ? ""
    : resolveCustomerPhone(settings);
  const freeShippingThreshold = Number(settings.free_shipping_threshold ?? 200000);
  const brandName = settings.brand_name || t("brand.name");
  const socialLinks = SOCIAL_LINKS.map((item) => ({
    ...item,
    href: siteContent ? settings[item.field] : item.href,
  })).filter((item) => item.href);
  const heroBanner = (siteContent?.banners || []).find(
    (banner) => banner.placement === "hero"
  );
  const heroTitle = localizedValue(heroBanner, "title", i18n.resolvedLanguage);
  const heroSubtitle = localizedValue(
    heroBanner,
    "subtitle",
    i18n.resolvedLanguage,
    t("home.hero.subtitle")
  );
  const heroButton = localizedValue(
    heroBanner,
    "button_label",
    i18n.resolvedLanguage,
    t("home.hero.cta")
  );
  const heroAlt = localizedValue(
    heroBanner,
    "alt_text",
    i18n.resolvedLanguage,
    heroTitle || t("home.hero.titleLine1")
  );
  const heroPath = heroBanner?.link_url || ROUTERS.USER.PRODUCTS;
  const heroImage = heroBanner?.image_url || bannerImg;
  const menus = useMemo(() => {
    const categoryItems =
      categories?.map((category) => ({
        key: `category-${category.id}`,
        name: translateCategoryName(category.name, t),
        path: `${ROUTERS.USER.PRODUCTS}?category_id=${category.id}`,
      })) || [];

    return [
      {
        key: "home",
        name: t("navbar.home"),
        path: ROUTERS.USER.HOME,
      },
      {
        key: "shop",
        name: t("navbar.shop"),
        path: ROUTERS.USER.PRODUCTS,
        child: categoryItems,
      },
      {
        key: "deals",
        name: t("navbar.deals"),
        path: `${ROUTERS.USER.PRODUCTS}?max_price=50000&sort=price_asc`,
      },
      {
        key: "in-stock",
        name: t("navbar.inStock"),
        path: `${ROUTERS.USER.PRODUCTS}?in_stock=1`,
      },
      {
        key: "contact",
        name: t("navbar.contact"),
        href: customerPhone ? `tel:${customerPhone}` : "",
        pending: !customerPhone,
      },
    ];
  }, [categories, customerPhone, t]);

  const handleUserLogout = async () => {
    try {
      await logoutUserAPI();
    } catch (error) {
      // The local UI still exits the account state if the server session is gone.
    } finally {
      clearUserSession();
      clearCart();
      dispatch(clearCustomerUser());
      setShowHumberger(false);
      navigate(ROUTERS.USER.HOME);
    }
  };

  const isMenuActive = (menu) => {
    if (menu.href || menu.pending) {
      return false;
    }

    if (menu.path === ROUTERS.USER.HOME) {
      return location.pathname === "/";
    }

    if (!location.pathname.startsWith(ROUTERS.USER.PRODUCTS)) {
      return false;
    }

    const currentParams = new URLSearchParams(location.search);
    const menuQuery = menu.path.includes("?")
      ? new URLSearchParams(menu.path.split("?")[1])
      : null;
    const isDealFilter =
      currentParams.get("max_price") === "50000" &&
      currentParams.get("sort") === "price_asc";
    const isStockFilter = currentParams.get("in_stock") === "1";

    if (menuQuery) {
      return [...menuQuery.entries()].every(
        ([key, value]) => currentParams.get(key) === value
      );
    }

    return (
      menu.key === "shop" &&
      !isDealFilter &&
      !isStockFilter
    );
  };

  const renderMenuLink = (menu, children, onClick) => {
    if (menu.pending) {
      return (
        <span className="header__menu__pending" aria-busy="true">
          {children}
        </span>
      );
    }

    if (menu.href) {
      return (
        <a href={menu.href} onClick={onClick}>
          {children}
        </a>
      );
    }

    return (
      <Link to={menu.path} onClick={onClick}>
        {children}
      </Link>
    );
  };

  return (
    <>
      <button
        type="button"
        className={`hunberger__menu__overlay${
          isShowHumberger ? " active" : ""
        }`}
        aria-label={t("navbar.closeMenu")}
        tabIndex={-1}
        onClick={() => setShowHumberger(false)}
      />
      <div
        ref={drawerRef}
        id="mobile-navigation"
        className={`hunberger__menu__wrapper${isShowHumberger ? " show" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={t("navbar.mobileMenu")}
        aria-hidden={!isShowHumberger}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="hunberger__menu__close"
          aria-label={t("navbar.closeMenu")}
          onClick={() => setShowHumberger(false)}
        >
          <AiOutlineClose aria-hidden="true" />
        </button>
        <div className="header__logo">
          <Link to={ROUTERS.USER.HOME} onClick={() => setShowHumberger(false)}>
            <h1>{brandName}</h1>
          </Link>
        </div>
        <div className="hunberger__menu__cart">
          <LanguageSwitcher />
          <ul>
            <li>
              <Link to={ROUTERS.USER.SHOPPING_CART}>
                <AiOutlineShoppingCart /> <span>{cartRedux.totalQuantity}</span>
              </Link>
            </li>
          </ul>
          <div className="header__cart__price">
            {t("navbar.cart")} <span>{formatter(cartRedux.totalPrice)}</span>
          </div>
        </div>
        <div className="hunberger__menu__widget">
          <div className="header__top__right__auth">
            {isLoggedIn ? (
              <div className="header-account-chip header-account-chip--mobile">
                <span className="header-account-chip__icon">
                  <BiUser />
                </span>
                <Link
                  className="header-account-chip__name"
                  to={ROUTERS.USER.MY_ORDERS}
                  onClick={() => setShowHumberger(false)}
                  title={t("navbar.myOrders")}
                >
                  {accountName}
                </Link>
                <button type="button" onClick={handleUserLogout}>
                  {t("navbar.logout")}
                </button>
              </div>
            ) : (
              <Link to={ROUTERS.USER.LOGIN} onClick={() => setShowHumberger(false)}>
                <BiUser /> {t("navbar.login")}
              </Link>
            )}
          </div>
        </div>
        <div className="hunberger__menu__nav">
          <ul>
            {menus.map((menu, menuKey) => (
              <li key={`${menu.key}-${menu.href || menu.path}`}>
                {menu.child?.length ? (
                  <button
                    type="button"
                    className="hunberger__menu__toggle"
                    aria-expanded={activeMobileMenu === menu.path}
                    aria-controls={`mobile-submenu-${menu.key}`}
                    onClick={() =>
                      setActiveMobileMenu(
                        activeMobileMenu === menu.path ? null : menu.path
                      )
                    }
                  >
                    {menu.name}
                    {activeMobileMenu === menu.path ? (
                      <AiOutlineUpCircle aria-hidden="true" />
                    ) : (
                      <AiOutlineDownCircle aria-hidden="true" />
                    )}
                  </button>
                ) : (
                  renderMenuLink(menu, menu.name, () => setShowHumberger(false))
                )}
                {menu.child && (
                  <ul
                    id={`mobile-submenu-${menu.key}`}
                    className={`header__menu__dropdown ${
                      activeMobileMenu === menu.path ? "show__submenu" : ""
                    }`}
                  >
                    {menu.child.map((childItem, childKey) => (
                      <li key={`${menuKey}-${childKey}`}>
                        <Link
                          to={childItem.path}
                          onClick={() => setShowHumberger(false)}
                        >
                          {childItem.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="header__top__right__social">
          {socialLinks.map(({ label, href, Icon }) => (
            <a href={href} key={label} target="_blank" rel="noreferrer" aria-label={label}>
              <Icon />
            </a>
          ))}
        </div>
        <div className="hunberger__menu__contact">
          <ul>
            <li>
              <MdEmail />
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            </li>
            <li>{t("navbar.freeShipping", { amount: formatter(freeShippingThreshold) })}</li>
          </ul>
        </div>
      </div>

      <div className="header__top">
        <div className="container">
          <div className="row">
            <div className="col-6 header__top_left">
              <ul>
                <li>
                  <AiOutlineMail />
                  <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
                </li>
                <li>{t("navbar.freeShipping", { amount: formatter(freeShippingThreshold) })}</li>
              </ul>
            </div>
            <div className="col-6 header__top_right">
              <ul>
                {socialLinks.map(({ label, href, Icon }) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noreferrer" aria-label={label}>
                      <Icon />
                    </a>
                  </li>
                ))}
                <li className="header__top__auth">
                  {isLoggedIn ? (
                    <div className="header-account-chip">
                      <span className="header-account-chip__icon">
                        <BiUser />
                      </span>
                      <Link
                        className="header-account-chip__name"
                        to={ROUTERS.USER.MY_ORDERS}
                        title={t("navbar.myOrders")}
                      >
                        {accountName}
                      </Link>
                      <button type="button" onClick={handleUserLogout}>
                        {t("navbar.logout")}
                      </button>
                    </div>
                  ) : (
                    <>
                      <BiUser />
                      <button
                        type="button"
                        className="header-login-button"
                        onClick={() => navigate(ROUTERS.USER.LOGIN)}
                      >
                        {t("navbar.login")}
                      </button>
                    </>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row header__main">
          <div className="col-lg-3 header__main__logo">
            <div className="header__logo">
              <Link to={ROUTERS.USER.HOME}>
                <h1>{brandName}</h1>
              </Link>
            </div>
          </div>
          <div className="col-lg-6 header__main__nav">
            <nav className="header__menu">
              <ul>
                {menus?.map((menu) => (
                  <li
                    key={`${menu.key}-${menu.href || menu.path}`}
                    className={isMenuActive(menu) ? "active" : ""}
                  >
                    {renderMenuLink(menu, menu.name)}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="col-lg-3 header__main__actions">
            <div className="header__cart">
              <div className="nav-right">
                <LanguageSwitcher />
                <span className="nav-right__divider" aria-hidden="true" />
                <Link className="cart-chip" to={ROUTERS.USER.SHOPPING_CART}>
                  <span className="cart-chip__price">
                    {formatter(cartRedux.totalPrice)}
                  </span>
                  <AiOutlineShoppingCart />
                  <span className="cart-badge">{cartRedux.totalQuantity}</span>
                </Link>
              </div>
            </div>
            <div className="humberger__open">
              <button
                ref={menuButtonRef}
                type="button"
                className="header-mobile-menu-button"
                aria-label={t("navbar.openMenu")}
                aria-expanded={isShowHumberger}
                aria-controls="mobile-navigation"
                onClick={() => setShowHumberger(true)}
              >
                <AiOutlineMenu aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row hero__categories_container">
          <div className="col-lg-3 col-md-12 col-sm-12 col-xs-12 hero__categories">
            <button
              type="button"
              className="hero__categories__all"
              onClick={() => setShowCategories(!isShowCategories)}
              aria-expanded={isShowCategories}
              aria-controls="product-category-list"
            >
              <AiOutlineAppstore aria-hidden="true" />
              <p>{t("navbar.productList")}</p>
            </button>
            <ul id="product-category-list" className={isShowCategories ? "" : "hidden"}>
              {categories?.map((category) => (
                <li key={category.id}>
                  <Link to={`${ROUTERS.USER.PRODUCTS}?category_id=${category.id}`}>
                    {translateCategoryName(category.name, t)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-lg-9 col-md-12 col-sm-12 col-xs-12  hero__search_container">
            <div className="hero__search">
              <div className="hero__search__form">
                <SearchBar />
              </div>
              <div className="hero__search__phone">
                <div className="hero__search__phone__icon">
                  <AiOutlinePhone />
                </div>
                <div className="hero__search__phone__text">
                  <p>
                    {customerPhone ? (
                      <a href={`tel:${customerPhone}`}>{customerPhone}</a>
                    ) : (
                      <span
                        className="phone-loading-placeholder"
                        aria-label={t("common.loading")}
                        aria-busy="true"
                      />
                    )}
                  </p>
                  <span>{t("navbar.support")}</span>
                </div>
              </div>
            </div>
            {isHome && (
              <div
                className={`hero__item${isSiteContentLoading ? " hero__item--loading" : ""}`}
                style={isSiteContentLoading ? undefined : { backgroundImage: `url(${heroImage})` }}
                role={isSiteContentLoading ? "status" : "img"}
                aria-label={isSiteContentLoading ? t("common.loading") : heroAlt}
                aria-busy={isSiteContentLoading}
              >
                {isSiteContentLoading ? (
                  <span className="hero__loading-label">{t("common.loading")}</span>
                ) : (
                  <div className="hero__text">
                    <span>{t("home.hero.eyebrow")}</span>
                    <h2>{heroTitle || <>{t("home.hero.titleLine1")} <br />{t("home.hero.titleLine2")}</>}</h2>
                    <p>{heroSubtitle}</p>
                    {isExternalUrl(heroPath) ? (
                      <a href={heroPath} className="primary-btn" target="_blank" rel="noreferrer">{heroButton}</a>
                    ) : (
                      <Link to={heroPath} className="primary-btn">{heroButton}</Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
export default memo(Header);

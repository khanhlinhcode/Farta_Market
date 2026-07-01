import "./style.scss";
import { ROUTERS } from "utils/router";
import { BiUser } from "react-icons/bi";
import { MdEmail } from "react-icons/md";
import { formatter } from "utils/fomater";
import { setCart } from "../../../../redux/commonSlide";
import { SESSION_KEYS } from "utils/constant";
import { useGetCategoriesUS } from "api/homePage";
import { LanguageSwitcher } from "component";
import { useDispatch, useSelector } from "react-redux";
import React, { memo, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getSessionItem } from "utils/session";
import bannerImg from "assets/users/images/hero/Banner.png";
import { translateCategoryName } from "utils/i18nLabels";
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
} from "react-icons/ai";

const Header = () => {
  const { t } = useTranslation();
  const contactPhone = "0393886668";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isShowHumberger, setShowHumberger] = useState(false);
  const [activeMobileMenu, setActiveMobileMenu] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isHome, setIsHome] = useState(location.pathname.length <= 1);
  const [isShowCategories, setShowCategories] = useState(isHome);
  const { cart: cartRedux } = useSelector((state) => state.commonSlide);
  const isLoggedIn =
    typeof window !== "undefined" &&
    Boolean(window.localStorage.getItem(SESSION_KEYS.ADMIN_TOKEN));

  useEffect(() => {
    const isHome = location.pathname.length <= 1;
    setIsHome(isHome);
    setShowCategories(isHome);
    setSearchKeyword(new URLSearchParams(location.search).get("q") || "");
  }, [location]);

  useEffect(() => {
    const cart = getSessionItem(SESSION_KEYS.CART);
    if (cart) {
      dispatch(setCart(cart));
    }
  }, [dispatch]);

  const { data: categories } = useGetCategoriesUS();
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
      ...(isLoggedIn
        ? [
            {
              key: "my-orders",
              name: t("navbar.myOrders"),
              path: ROUTERS.USER.MY_ORDERS,
            },
          ]
        : []),
      {
        key: "contact",
        name: t("navbar.contact"),
        href: `tel:${contactPhone}`,
      },
    ];
  }, [categories, contactPhone, isLoggedIn, t]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const keyword = searchKeyword.trim();

    navigate(
      keyword
        ? `${ROUTERS.USER.PRODUCTS}?q=${encodeURIComponent(keyword)}`
        : ROUTERS.USER.PRODUCTS
    );
  };

  const isMenuActive = (menu) => {
    if (menu.href) {
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
      <div
        className={`hunberger__menu__overlay${
          isShowHumberger ? " active" : ""
        }`}
        onClick={() => setShowHumberger(false)}
      />
      <div
        className={`hunberger__menu__wrapper${isShowHumberger ? " show" : ""}`}
      >
        <div className="header__logo">
          <Link to={ROUTERS.USER.HOME} onClick={() => setShowHumberger(false)}>
            <h1>{t("brand.name")}</h1>
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
            <Link to={ROUTERS.ADMIN.LOGIN} onClick={() => setShowHumberger(false)}>
              <BiUser /> {t("navbar.login")}
            </Link>
          </div>
        </div>
        <div className="hunberger__menu__nav">
          <ul>
            {menus.map((menu, menuKey) => (
              <li key={`${menu.key}-${menu.href || menu.path}`}>
                {renderMenuLink(
                  menu,
                  <>
                    {menu.name}
                    {menu.child &&
                      (activeMobileMenu === menu.path ? (
                        <AiOutlineDownCircle />
                      ) : (
                        <AiOutlineUpCircle />
                      ))}
                  </>,
                  (e) => {
                    if (menu.child?.length) {
                      e.preventDefault();
                      setActiveMobileMenu(
                        activeMobileMenu === menu.path ? null : menu.path
                      );
                      return;
                    }

                    setShowHumberger(false);
                  }
                )}
                {menu.child && (
                  <ul
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
          <Link to={"https://www.facebook.com"}>
            <AiOutlineFacebook />
          </Link>

          <Link to={"https://www.instagram.com"}>
            <AiOutlineInstagram />
          </Link>
          <Link to={"https://www.linkedin.com"}>
            <AiOutlineLinkedin />
          </Link>
          <Link to={"https://www.twitter.com"}>
            <AiFillTwitterSquare />
          </Link>
        </div>
        <div className="hunberger__menu__contact">
          <ul>
            <li>
              <MdEmail /> khanhlinh@gmail.com
            </li>
            <li>{t("navbar.freeShipping", { amount: formatter(200000) })}</li>
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
                  KhanhLinh@gmail.com
                </li>
                <li>{t("navbar.freeShipping", { amount: formatter(200000) })}</li>
              </ul>
            </div>
            <div className="col-6 header__top_right">
              <ul>
                <li>
                  <Link to={"https://www.facebook.com"}>
                    <AiOutlineFacebook />
                  </Link>
                </li>
                <li>
                  <Link to={"https://www.instagram.com"}>
                    <AiOutlineInstagram />
                  </Link>
                </li>
                <li>
                  <Link to={"https://www.linkedin.com"}>
                    <AiOutlineLinkedin />
                  </Link>
                </li>
                <li>
                  <Link to={"https://www.twitter.com"}>
                    <AiFillTwitterSquare />
                  </Link>
                </li>
                <li>
                  <BiUser />
                  <span onClick={() => navigate(ROUTERS.ADMIN.LOGIN)}>
                    {t("navbar.login")}
                  </span>
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
                <h1>{t("brand.name")}</h1>
              </Link>
            </div>
          </div>
          <div className="col-lg-6 header__main__nav">
            <nav className="header__menu">
              <ul>
                {menus?.map((menu, menuKey) => (
                  <li
                    key={`${menu.key}-${menu.href || menu.path}`}
                    className={isMenuActive(menu) ? "active" : ""}
                  >
                    {renderMenuLink(menu, menu.name)}
                    {menu.child?.length > 0 && (
                      <ul className="header__menu__dropdown">
                        {menu.child.map((childItem, childKey) => (
                          <li key={`${menuKey}-${childKey}`}>
                            <Link to={childItem.path}>{childItem.name}</Link>
                          </li>
                        ))}
                      </ul>
                    )}
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
              <AiOutlineMenu onClick={() => setShowHumberger(true)} />
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row hero__categories_container">
          <div className="col-lg-3 col-md-12 col-sm-12 col-xs-12 hero__categories">
            <div
              className="hero__categories__all"
              onClick={() => setShowCategories(!isShowCategories)}
            >
              <AiOutlineMenu />
              <p>{t("navbar.productList")}</p>
            </div>
            <ul className={isShowCategories ? "" : "hidden"}>
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
                <form onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder={t("navbar.searchPlaceholder")}
                  />
                  <button type="submit">{t("navbar.searchButton")}</button>
                </form>
              </div>
              <div className="hero__search__phone">
                <div className="hero__search__phone__icon">
                  <AiOutlinePhone />
                </div>
                <div className="hero__search__phone__text">
                  <p>0393.886. 668</p>
                  <span>{t("navbar.support")}</span>
                </div>
              </div>
            </div>
            {isHome && (
              <div
                className="hero__item"
                style={{ backgroundImage: `url(${bannerImg})` }}
              >
                <div className="hero__text">
                  <span>{t("home.hero.eyebrow")}</span>
                  <h2>
                    {t("home.hero.titleLine1")} <br />
                    {t("home.hero.titleLine2")}
                  </h2>
                  <p>{t("home.hero.subtitle")}</p>
                  <Link to={ROUTERS.USER.PRODUCTS} className="primary-btn">
                    {t("home.hero.cta")}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
export default memo(Header);

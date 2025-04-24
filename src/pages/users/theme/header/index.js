import { memo, useEffect, useState } from "react";
import "./style.scss";
import { Link, useLocation } from "react-router-dom";
import {
  AiOutlineFacebook,
  AiOutlineInstagram,
  AiOutlineLinkedin,
  AiFillTwitterSquare,
  AiOutlineGlobal,
  AiOutlineUser,
  AiOutlineMail,
  AiOutlineShoppingCart,
  AiOutlineMenu,
  AiOutlinePhone,
  AiOutlineDownCircle,
  AiOutlineUpCircle,
} from "react-icons/ai";
import { MdEmail } from "react-icons/md";
import { BiUser } from "react-icons/bi";
import { formatter } from "utils/fomater";
import { ROUTERS } from "utils/router";
export const categories = [
  "Thịt Tươi",
  "Rau Củ",
  "Nước Trái Cây",
  "Trái Cây",
  "Hải Sản",
];
const Header = () => {
  const location = useLocation();
  const [isShowHumberger, setShowHumberger] = useState(false);
  const [isHome, setIsHome] = useState(location.pathname.length <= 1);
  const [isShowCategories, setShowCategories] = useState(isHome);
  const [menus, setMenus] = useState([
    {
      name: "Trang chủ",
      path: ROUTERS.USER.HOME,
    },
    {
      name: "Cửa Hàng",
      path: ROUTERS.USER.PRODUCTS,
    },
    {
      name: "Sản Phẩm",
      path: "",
      isShowSubmenu: false,
      child: [
        {
          name: "Thịt",
          path: "",
        },
        {
          name: "Rau Củ",
          path: "",
        },
        {
          name: "Thức Ăn Nhanh",
          path: "",
        },
      ],
    },
    {
      name: "Bài Viết",
      path: "",
    },
    {
      name: "Liên Hệ",
      path: "",
    },
  ]);

  useEffect(() => {
    const isHome = location.pathname.length <= 1;
    setIsHome(isHome);
    setShowCategories(isHome);
  }, [location]);
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
          <h1>Farta Market</h1>
        </div>
        <div className="hunberger__menu__cart">
          <ul>
            <li>
              <Link to="">
                <AiOutlineShoppingCart /> <span>1</span>
              </Link>
            </li>
          </ul>
          <div className="header__cart__price">
            Giỏ Hàng <span>{formatter(1001230)}</span>
          </div>
        </div>
        <div className="hunberger__menu__widget">
          <div className="header__top__right__auth">
            <Link to="">
              <BiUser /> Đăng Nhập
            </Link>
          </div>
        </div>
        <div className="hunberger__menu__nav">
          <ul>
            {menus.map((menu, menuKey) => (
              <li key={menuKey} to={menu.path}>
                <Link
                  to={menu.path}
                  onClick={() => {
                    const newMenus = [...menus];
                    newMenus[menuKey].isShowSubmenu =
                      !newMenus[menuKey].isShowSubmenu;

                    setMenus(newMenus);
                  }}
                >
                  {menu.name}
                  {menu.child &&
                    (menu.isShowSubmenu ? (
                      <AiOutlineDownCircle />
                    ) : (
                      <AiOutlineUpCircle />
                    ))}
                </Link>
                {menu.child && (
                  <ul
                    className={`header__menu__dropdown ${
                      menu.isShowSubmenu ? "show__submenu" : ""
                    }`}
                  >
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
          <Link to={"https://www.google.com"}>
            <AiOutlineGlobal />
          </Link>
          <Link to={"https://www.google.com"}>
            <AiOutlineUser />
          </Link>
        </div>
        <div className="hunberger__menu__contact">
          <ul>
            <li>
              <MdEmail /> khanhlinh@gmail.com
            </li>
            <li>Miễn phí ship từ {formatter(200000)}</li>
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
                <li>Miễn phí ship từ {formatter(200000)}</li>
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
                  <Link to={"https://www.google.com"}>
                    <AiOutlineGlobal />
                  </Link>
                </li>
                <li>
                  <Link to={"https://www.google.com"}>
                    <AiOutlineUser />
                  </Link>
                  <span>Đăng Nhập</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row">
          <div className="col-lg-3">
            <div className="header__logo">
              <h1>Farta Market</h1>
            </div>
          </div>
          <div className="col-lg-6">
            <nav className="header__menu">
              <ul>
                {menus?.map((menu, menuKey) => (
                  <li key={menuKey} className={menuKey === 0 ? "active" : ""}>
                    <Link to="menu?.path">{menu?.name}</Link>
                    {menu.child && (
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
          <div className="col-lg-3">
            <div className="header__cart">
              <div className="header__cart__price">
                <span>{formatter(1001230)}</span>
              </div>
              <ul>
                <li>
                  <Link to="#">
                    <AiOutlineShoppingCart /> <span>5</span>
                  </Link>
                </li>
              </ul>
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
              <p>DANH SÁCH SẢN PHẨM</p>
            </div>
            <ul className={isShowCategories ? "" : "hidden"}>
              {categories.map((category, key) => (
                <li key={key}>
                  <Link to={ROUTERS.USER.PRODUCTS}>{category}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-lg-9 col-md-12 col-sm-12 col-xs-12  hero__search_container">
            <div className="hero__search">
              <div className="hero__search__form">
                <form>
                  <input type="text" placeholder="Bạn đang tìm kiếm gì ?" />
                  <button type="submit">Tìm Kiếm</button>
                </form>
              </div>
              <div className="hero__search__phone">
                <div className="hero__search__phone__icon">
                  <AiOutlinePhone />
                </div>
                <div className="hero__search__phone__text">
                  <p>0393.886. 668</p>
                  <span>Hộ Trợ 24/7</span>
                </div>
              </div>
            </div>
            {isHome && (
              <div className="hero__item">
                <div className="hero__text">
                  <span>Trái cây tươi</span>
                  <h2>
                    Rau quả <br />
                    Sạch 100%
                  </h2>
                  <p>Miễn phí giao hàng tận nơi</p>
                  <Link to="" className="primary-btn">
                    Mua Ngay
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

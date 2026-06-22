import { memo } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

//img categories
import cat1Img from "assets/users/images/categories/cat-1.png";
import cat2Img from "assets/users/images/categories/cat-2.png";
import cat3Img from "assets/users/images/categories/cat-3.png";
import cat4Img from "assets/users/images/categories/cat-4.png";
import cat5Img from "assets/users/images/categories/cat-5.png";

//imgbanner
import bannerImg from "assets/users/images/banner/banner.png";
import banner2Img from "assets/users/images/banner/banner2.png";
import ProductCard from "component/ProductCard";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { featProducts } from "utils/common";
import "./style.scss";
import { useGetCategoriesUS, useGetProductsUS } from "api/homePage";
import { Link } from "react-router-dom";
import { ROUTERS } from "utils/router";

const HomPage = () => {
  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 5,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 4,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 3,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 2,
    },
  };

  const sliderItems = [
    {
      bgImg: cat1Img,
      name: "Cam Tươi",
      keyword: "Cam Tươi",
    },
    {
      bgImg: cat2Img,
      name: "Hoa Quả Khô",
      keyword: "Hoa Quả Khô",
    },
    {
      bgImg: cat3Img,
      name: "Rau Củ Tươi",
      keyword: "Rau Củ Tươi",
    },
    {
      bgImg: cat4Img,
      name: "Sữa Hộp",
      keyword: "Sữa Hộp",
    },
    {
      bgImg: cat5Img,
      name: "Thịt Bò",
      keyword: "Thịt Bò",
    },
  ];
  const bannerItems = [
    {
      img: bannerImg,
      label: "Xem sản phẩm còn hàng",
      path: `${ROUTERS.USER.PRODUCTS}?stock=in-stock`,
    },
    {
      img: banner2Img,
      label: "Xem sản phẩm giá tốt",
      path: `${ROUTERS.USER.PRODUCTS}?max=50000&sort=price-asc`,
    },
  ];

  const { data: categories } = useGetCategoriesUS();
  const { data: products } = useGetProductsUS();
  const getSliderPath = (item) => {
    const params = new URLSearchParams();

    if (item.keyword) {
      params.set("q", item.keyword);
    }

    return `${ROUTERS.USER.PRODUCTS}?${params.toString()}`;
  };

  const renderFeaturedProducts = (data) => {
    const tabList = [];
    const tabPanels = [];

    tabList.push(
      categories?.map((categery) => (
        <Tab key={categery.id}>{categery.name}</Tab>
      ))
    );

    //   Object.keys(data).forEach((key, index) => {
    //     tabList.push(<Tab key={index}>{data[key].title}</Tab>);
    //     const tabPanel = [];
    //     data[key].product.forEach((item, j) =>
    //       tabPanel.push(
    //         <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12" key={j}>
    //           <ProductCard name={item.name} img={item.img} price={item.price} />
    //         </div>
    //       )
    //     );
    //     tabPanels.push(tabPanel);
    //   });

    categories?.forEach((category) => {
      tabPanels.push(
        products
          ?.filter((product) => product.category_id === category.id)
          .map((product) => (
            <div
              className="col-lg-3 col-md-4 col-sm-6 col-xs-12"
              key={product.id}
            >
              <ProductCard product={product} />
            </div>
          ))
      );
    });

    return (
      <Tabs>
        <TabList>{tabList}</TabList>

        {tabPanels.map((item, key) => (
          <TabPanel key={key}>
            <div className="row">{item}</div>
          </TabPanel>
        ))}
      </Tabs>
    );
  };
  return (
    <>
      {/*categories Begin*/}
      <div className="container container__categories_slider">
        <Carousel responsive={responsive} className="categories_slider">
          {sliderItems.map((item, key) => (
            <Link
              to={getSliderPath(item)}
              className="categories_slider_item"
              style={{ backgroundImage: `url(${item.bgImg})` }}
              key={key}
            >
              <p>{item.name}</p>
            </Link>
          ))}
        </Carousel>
      </div>
      {/*categories end */}
      {/* Featured Begin */}
      <div className="container">
        <div className="featured">
          <div className="section-title">
            <h2>Sản Phẩm Nổi Bật</h2>
          </div>
          {renderFeaturedProducts(featProducts)}
        </div>
      </div>
      {/* Featured End */}
      {/* banner Begin */}
      <div className="container">
        <div className="banner">
          {bannerItems.map((item) => (
            <Link className="banner__pic" to={item.path} key={item.path}>
              <img src={item.img} alt={item.label} />
            </Link>
          ))}
        </div>
      </div>
      {/* banner End */}
    </>
  );
};
export default memo(HomPage);

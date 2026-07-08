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
import ProductCardSkeleton from "component/Skeleton";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { featProducts } from "utils/common";
import "./style.scss";
import {
  useGetCategoriesUS,
  useGetProductsUS,
  useRecommendedProductsUS,
} from "api/homePage";
import { Link } from "react-router-dom";
import { ROUTERS } from "utils/router";
import { useTranslation } from "react-i18next";
import { translateCategoryName } from "utils/i18nLabels";

const HomPage = () => {
  const { t } = useTranslation();
  const responsive = {
    desktop: {
      breakpoint: { max: 4000, min: 1024 },
      items: 4,
    },
    tablet: {
      breakpoint: { max: 1023.99, min: 768 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 767.99, min: 0 },
      items: 1,
    },
  };

  const categoryImages = [cat1Img, cat2Img, cat3Img, cat4Img, cat5Img];
  const bannerItems = [
    {
      img: bannerImg,
      label: t("home.banners.inStock"),
      path: `${ROUTERS.USER.PRODUCTS}?in_stock=1`,
    },
    {
      img: banner2Img,
      label: t("home.banners.deals"),
      path: `${ROUTERS.USER.PRODUCTS}?max_price=50000&sort=price_asc`,
    },
  ];

  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useGetCategoriesUS();
  const {
    data: products,
    isLoading: isProductsLoading,
    isError: isProductsError,
    refetch: refetchProducts,
  } = useGetProductsUS();
  const { data: recommendedProducts = [] } = useRecommendedProductsUS();
  const isLoading = isCategoriesLoading || isProductsLoading;
  const isError = isCategoriesError || isProductsError;
  const refetchHomeData = () => {
    refetchCategories();
    refetchProducts();
  };
  const sliderItems = (categories || [])
    .filter((category) => Number(category.products_count || 0) > 0)
    .map((category, index) => ({
      id: category.id,
      bgImg: categoryImages[index % categoryImages.length],
      name: translateCategoryName(category.name, t),
      path: `${ROUTERS.USER.PRODUCTS}?category_id=${category.id}`,
    }));

  const renderFeaturedProducts = (data) => {
    const tabList = [];
    const tabPanels = [];

    tabList.push(
      categories?.map((category) => (
        <Tab key={category.id}>{translateCategoryName(category.name, t)}</Tab>
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
  if (isLoading) {
    return (
      <div className="container homepage-state homepage-state--loading">
        <div className="row">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              className="col-lg-3 col-md-4 col-sm-6 col-xs-12"
              key={index}
            >
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container homepage-state homepage-state--error">
        <p>{t("common.error")}</p>
        <button type="button" onClick={refetchHomeData}>
          {t("common.retry")}
        </button>
      </div>
    );
  }

  return (
    <>
      {/*categories Begin*/}
      {sliderItems.length > 0 && (
        <div className="container container__categories_slider">
          <Carousel responsive={responsive} className="categories_slider">
          {sliderItems.map((item) => (
            <Link
              to={item.path}
              className="categories_slider_item"
              style={{ backgroundImage: `url(${item.bgImg})` }}
              key={item.id}
            >
              <p>{item.name}</p>
            </Link>
          ))}
          </Carousel>
        </div>
      )}
      {/*categories end */}
      {/* Featured Begin */}
      <div className="container">
          <div className="featured">
          <div className="section-title">
            <h2>{t("home.featuredProducts")}</h2>
          </div>
          {renderFeaturedProducts(featProducts)}
        </div>
      </div>
      {/* Featured End */}
      {recommendedProducts.length >= 4 && (
        <div className="container">
          <div className="featured featured--recommended">
            <div className="section-title">
              <h2>{t("home.recommendedProducts")}</h2>
            </div>
            <div className="row">
              {recommendedProducts.slice(0, 4).map((product) => (
                <div
                  className="col-lg-3 col-md-4 col-sm-6 col-xs-12"
                  key={product.id}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
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

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
import "./style.scss";
import {
  useGetCategoriesUS,
  useGetProductsUS,
  useGetSiteContentUS,
  useRecommendedProductsUS,
} from "api/homePage";
import { Link } from "react-router-dom";
import { ROUTERS } from "utils/router";
import { useTranslation } from "react-i18next";
import { translateCategoryName } from "utils/i18nLabels";
import { isExternalUrl, localizedValue } from "utils/siteContent";

const HomPage = () => {
  const { t, i18n } = useTranslation();
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
  const fallbackBanners = [
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
  const {
    data: siteContent,
    isLoading: isSiteContentLoading,
  } = useGetSiteContentUS();
  const settings = siteContent?.settings || {};
  const cmsBanners = (siteContent?.banners || [])
    .filter((banner) => banner.placement === "home_promo")
    .map((banner) => ({
      id: banner.id,
      img: banner.image_url,
      label: localizedValue(banner, "alt_text", i18n.resolvedLanguage, t("home.banners.inStock")),
      path: banner.link_url || ROUTERS.USER.PRODUCTS,
    }));
  const bannerItems = cmsBanners.length ? cmsBanners : fallbackBanners;
  const isLoading = isCategoriesLoading || isProductsLoading || isSiteContentLoading;
  const isError = isCategoriesError || isProductsError;
  const refetchHomeData = () => {
    refetchCategories();
    refetchProducts();
  };
  const sliderItems = (categories || [])
    .filter((category) => Number(category.products_count || 0) > 0)
    .map((category, index) => ({
      id: category.id,
      bgImg: category.image_url || categoryImages[index % categoryImages.length],
      name: translateCategoryName(category.name, t),
      path: `${ROUTERS.USER.PRODUCTS}?category_id=${category.id}`,
    }));

  const renderFeaturedProducts = () => {
    const tabList = [];
    const tabPanels = [];

    tabList.push(
      categories?.map((category) => (
        <Tab key={category.id}>{translateCategoryName(category.name, t)}</Tab>
      ))
    );

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
      <main
        className="container homepage-state homepage-state--loading"
        aria-busy="true"
        aria-label={t("common.loading")}
      >
        <div className="homepage-loading__categories" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="homepage-loading__category skeleton-pulse" key={index} />
          ))}
        </div>
        <div className="homepage-loading__heading skeleton-pulse" aria-hidden="true" />
        <div className="row homepage-loading__products" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              className="col-lg-3 col-md-4 col-sm-6 col-xs-12"
              key={index}
            >
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
        <div className="homepage-loading__banners" aria-hidden="true">
          <div className="homepage-loading__banner skeleton-pulse" />
          <div className="homepage-loading__banner skeleton-pulse" />
        </div>
      </main>
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
            <h2>{localizedValue(settings, "featured_title", i18n.resolvedLanguage, t("home.featuredProducts"))}</h2>
          </div>
          {renderFeaturedProducts()}
        </div>
      </div>
      {/* Featured End */}
      {recommendedProducts.length >= 4 && (
        <div className="container">
          <div className="featured featured--recommended">
            <div className="section-title">
              <h2>{localizedValue(settings, "recommended_title", i18n.resolvedLanguage, t("home.recommendedProducts"))}</h2>
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
          {bannerItems.map((item, index) =>
            isExternalUrl(item.path) ? (
              <a className="banner__pic" href={item.path} key={item.id || `${item.path}-${index}`} target="_blank" rel="noreferrer">
                <img src={item.img} alt={item.label} loading="lazy" decoding="async" />
              </a>
            ) : (
              <Link className="banner__pic" to={item.path} key={item.id || `${item.path}-${index}`}>
                <img src={item.img} alt={item.label} loading="lazy" decoding="async" />
              </Link>
            )
          )}
        </div>
      </div>
      {/* banner End */}
    </>
  );
};
export default memo(HomPage);

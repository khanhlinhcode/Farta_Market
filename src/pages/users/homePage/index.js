import { memo } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

//img categories
import cat1Img from "assets/users/images/categories/cat-1.png";
import cat2Img from "assets/users/images/categories/cat-2.png";
import cat3Img from "assets/users/images/categories/cat-3.png";
import cat4Img from "assets/users/images/categories/cat-4.png";
import cat5Img from "assets/users/images/categories/cat-5.png";

//img featured
import feature1Img from "assets/users/images/featured/feature-1.png";
import feature2Img from "assets/users/images/featured/feature-2.png";
import feature3Img from "assets/users/images/featured/feature-3.png";
import feature4Img from "assets/users/images/featured/feature-4.png";
import feature5Img from "assets/users/images/featured/feature-5.png";
import feature6Img from "assets/users/images/featured/feature-6.png";
import feature7Img from "assets/users/images/featured/feature-7.png";
import feature8Img from "assets/users/images/featured/feature-8.png";
//imgbanner
import bannerImg from "assets/users/images/banner/banner.png";
import banner2Img from "assets/users/images/banner/banner2.png";
import "./style.scss";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import ProductCard from "component/ProductCard";

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
    },
    {
      bgImg: cat2Img,
      name: "Hoa Quả Khô",
    },
    {
      bgImg: cat3Img,
      name: "Rau Củ Tươi",
    },
    {
      bgImg: cat4Img,
      name: "Sữa Hộp",
    },
    {
      bgImg: cat5Img,
      name: "THịt Bò",
    },
  ];
  const featProducts = {
    all: {
      title: "Toàn Bộ",
      product: [
        {
          img: feature1Img,
          name: "Thịt Bò",
          price: 20000,
        },
        {
          img: feature2Img,
          name: "Chuối",
          price: 17800,
        },
        {
          img: feature3Img,
          name: "Ổi",
          price: "25000",
        },
        {
          img: feature4Img,
          name: "Dưa Hấu",
          price: "44020",
        },
        {
          img: feature5Img,
          name: "Nho Tím",
          price: "120000",
        },
        {
          img: feature6Img,
          name: "Hamburger",
          price: "86000",
        },
        {
          img: feature7Img,
          name: "Xoài Keo",
          price: "69000",
        },
        {
          img: feature8Img,
          name: "Táo Úc",
          price: "53000",
        },
      ],
    },
    freshMeat: {
      title: "Thịt Tươi",
      product: [
        {
          img: feature1Img,
          name: "Thịt Bò",
          price: 20000,
        },
      ],
    },

    fruits: {
      title: "Trái Cây",
      product: [
        {
          img: feature2Img,
          name: "Chuối",
          price: 17800,
        },
        {
          img: feature3Img,
          name: "Ổi",
          price: "25000",
        },
        {
          img: feature4Img,
          name: "Dưa Hấu",
          price: "44020",
        },
        {
          img: feature5Img,
          name: "Nho Tím",
          price: "120000",
        },
        {
          img: feature7Img,
          name: "Xoài Keo",
          price: "69000",
        },
        {
          img: feature8Img,
          name: "Táo Úc",
          price: "53000",
        },
      ],
    },
    fastFood: {
      title: "Thức Ăn Nhanh",
      product: [
        {
          img: feature6Img,
          name: "Hamburger",
          price: "86000",
        },
      ],
    },
  };

  const renderFeaturedProducts = (data) => {
    const tabList = [];
    const tabPanels = [];

    Object.keys(data).forEach((key, index) => {
      tabList.push(<Tab key={index}>{data[key].title}</Tab>);

      const tabPanel = [];
      data[key].product.forEach((item, j) =>
        tabPanel.push(
          <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12" key={j}>
            <ProductCard name={item.name} img={item.img} price={item.price} />
          </div>
        )
      );
      tabPanels.push(tabPanel);
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
            <div
              className="categories_slider_item"
              style={{ backgroundImage: `url(${item.bgImg})` }}
              key={key}
            >
              <p>{item.name}</p>
            </div>
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
          <div className="banner__pic">
            <img src={bannerImg} alt="banner" />
          </div>
          <div className="banner__pic">
            <img src={banner2Img} alt="banner" />
          </div>
        </div>
      </div>
      {/* banner End */}
    </>
  );
};
export default memo(HomPage);

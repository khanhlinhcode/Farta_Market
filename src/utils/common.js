//img featured
import feature1Img from "assets/users/images/featured/feature-1.png";
import feature2Img from "assets/users/images/featured/feature-2.png";
import feature3Img from "assets/users/images/featured/feature-3.png";
import feature4Img from "assets/users/images/featured/feature-4.png";
import feature5Img from "assets/users/images/featured/feature-5.png";
import feature6Img from "assets/users/images/featured/feature-6.png";
import feature7Img from "assets/users/images/featured/feature-7.png";
import feature8Img from "assets/users/images/featured/feature-8.png";
export const featProducts = {
  all: {
    titleKey: "products.allProducts",
    product: [
      {
        id: 1,
        img: feature1Img,
        name: "Lean Beef",
        translation_key: "leanBeef",
        price: 20000,
      },
      {
        id: 2,
        img: feature2Img,
        name: "Banana",
        translation_key: "banana",
        price: 17800,
      },
      {
        id: 3,
        img: feature3Img,
        name: "Guava",
        translation_key: "guava",
        price: "25000",
      },
      {
        id: 4,
        img: feature4Img,
        name: "Watermelon",
        translation_key: "watermelon",
        price: "44020",
      },
      {
        id: 5,
        img: feature5Img,
        name: "Purple Grapes",
        translation_key: "purpleGrapes",
        price: "120000",
      },
      {
        id: 6,
        img: feature6Img,
        name: "Hamburger",
        price: "86000",
      },
      {
        id: 7,
        img: feature7Img,
        name: "Green Mango",
        translation_key: "greenMango",
        price: "69000",
      },
      {
        id: 8,
        img: feature8Img,
        name: "Australian Apple",
        translation_key: "australianApple",
        price: "53000",
      },
    ],
  },
  freshMeat: {
    titleKey: "categories.freshMeat",
    product: [
      {
        id: 9,
        img: feature1Img,
        name: "Lean Beef",
        translation_key: "leanBeef",
        price: 20000,
      },
    ],
  },

  fruits: {
    titleKey: "categories.fruit",
    product: [
      {
        id: 10,
        img: feature2Img,
        name: "Banana",
        translation_key: "banana",
        price: 17800,
      },
      {
        id: 11,
        img: feature3Img,
        name: "Guava",
        translation_key: "guava",
        price: "25000",
      },
      {
        id: 12,
        img: feature4Img,
        name: "Watermelon",
        translation_key: "watermelon",
        price: "44020",
      },
      {
        id: 13,
        img: feature5Img,
        name: "Purple Grapes",
        translation_key: "purpleGrapes",
        price: "120000",
      },
      {
        id: 14,
        img: feature7Img,
        name: "Green Mango",
        translation_key: "greenMango",
        price: "69000",
      },
      {
        id: 15,
        img: feature8Img,
        name: "Australian Apple",
        translation_key: "australianApple",
        price: "53000",
      },
    ],
  },
  fastFood: {
    titleKey: "categories.fastFood",
    product: [
      {
        id: 16,
        img: feature6Img,
        name: "Hamburger",
        price: "86000",
      },
    ],
  },
};

export const optionUseQuery = {
  retry: 0,
  refetchOnWindowFocus: false,
};

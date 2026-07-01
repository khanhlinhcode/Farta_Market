const CATEGORY_TRANSLATION_KEYS = {
  "rau cu": "categories.vegetables",
  "rau cu tuoi": "categories.freshVegetables",
  sua: "categories.milk",
  "sua hop": "categories.milkBox",
  "thit tuoi": "categories.freshMeat",
  "thit bo": "categories.beef",
  "thit bo nat": "categories.leanBeef",
  "thuc an nhanh": "categories.fastFood",
  "trai cay": "categories.fruit",
  "cam tuoi": "categories.freshOrange",
  "hoa qua kho": "categories.driedFruit",
};

export const normalizeVietnameseLabel = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

export const translateCategoryName = (name, t) => {
  const key = CATEGORY_TRANSLATION_KEYS[normalizeVietnameseLabel(name)];

  return key ? t(key) : name;
};

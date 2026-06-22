import { memo, useEffect, useMemo, useState } from "react";
import Breadcrumb from "../theme/breadcrumb";
import "./style.scss";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "component";
import { useGetCategoriesUS, useGetProductsUS } from "api/homePage";

const sortOptions = [
  { label: "Mới nhất", value: "newest" },
  { label: "Cũ nhất", value: "oldest" },
  { label: "Giá thấp đến cao", value: "price-asc" },
  { label: "Giá cao đến thấp", value: "price-desc" },
  { label: "Tên A-Z", value: "name-asc" },
  { label: "Tên Z-A", value: "name-desc" },
  { label: "Tồn kho nhiều", value: "stock-desc" },
];

const stockOptions = [
  { label: "Tất cả", value: "all" },
  { label: "Còn hàng", value: "in-stock" },
  { label: "Hết hàng", value: "out-stock" },
];

const pricePresets = [
  { label: "Dưới 50K", min: "", max: "50000" },
  { label: "50K - 100K", min: "50000", max: "100000" },
  { label: "100K - 200K", min: "100000", max: "200000" },
  { label: "Trên 200K", min: "200000", max: "" },
];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [draftKeyword, setDraftKeyword] = useState(searchParams.get("q") || "");
  const { data: products = [], isLoading: isLoadingProducts } = useGetProductsUS();
  const { data: categories = [] } = useGetCategoriesUS();

  const filters = useMemo(
    () => ({
      keyword: searchParams.get("q") || "",
      categoryId: searchParams.get("category") || "",
      minPrice: searchParams.get("min") || "",
      maxPrice: searchParams.get("max") || "",
      stock: searchParams.get("stock") || "all",
      sort: searchParams.get("sort") || "newest",
    }),
    [searchParams]
  );

  const selectedCategory = categories.find(
    (category) => category.id === Number(filters.categoryId)
  );
  const hasInvalidPriceRange =
    filters.minPrice !== "" &&
    filters.maxPrice !== "" &&
      Number(filters.minPrice) > Number(filters.maxPrice);

  useEffect(() => {
    setDraftKeyword(filters.keyword);
  }, [filters.keyword]);

  const updateFilter = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const isDefault =
        value === "" ||
        (key === "sort" && value === "newest") ||
        (key === "stock" && value === "all");

      if (isDefault) {
        next.delete(key);
      } else {
        next.set(key, value);
      }

      return next;
    });
  };

  const updatePricePreset = (preset) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);

      if (preset.min) {
        next.set("min", preset.min);
      } else {
        next.delete("min");
      }

      if (preset.max) {
        next.set("max", preset.max);
      } else {
        next.delete("max");
      }

      return next;
    });
  };

  const handleKeywordSubmit = (e) => {
    e.preventDefault();
    updateFilter("q", draftKeyword.trim());
  };

  const resetFilters = () => {
    setDraftKeyword("");
    setSearchParams({});
  };

  const filteredProducts = useMemo(() => {
    const normalizedKeyword = filters.keyword.trim().toLowerCase();

    return [...products]
      .filter((product) => {
        const matchKeyword =
          !normalizedKeyword ||
          product.name?.toLowerCase().includes(normalizedKeyword) ||
          product.sort_description?.toLowerCase().includes(normalizedKeyword);
        const matchCategory =
          !filters.categoryId || product.category_id === Number(filters.categoryId);
        const matchMin =
          filters.minPrice === "" || Number(product.price) >= Number(filters.minPrice);
        const matchMax =
          filters.maxPrice === "" || Number(product.price) <= Number(filters.maxPrice);
        const matchStock =
          filters.stock === "all" ||
          (filters.stock === "in-stock" && Number(product.inventory || 0) > 0) ||
          (filters.stock === "out-stock" && Number(product.inventory || 0) <= 0);

        return matchKeyword && matchCategory && matchMin && matchMax && matchStock;
      })
      .sort((a, b) => {
        if (filters.sort === "price-asc") {
          return Number(a.price) - Number(b.price);
        }
        if (filters.sort === "price-desc") {
          return Number(b.price) - Number(a.price);
        }
        if (filters.sort === "oldest") {
          return Number(a.id) - Number(b.id);
        }
        if (filters.sort === "name-asc") {
          return a.name.localeCompare(b.name, "vi");
        }
        if (filters.sort === "name-desc") {
          return b.name.localeCompare(a.name, "vi");
        }
        if (filters.sort === "stock-desc") {
          return Number(b.inventory || 0) - Number(a.inventory || 0);
        }

        return Number(b.id) - Number(a.id);
      });
  }, [filters, products]);

  const activeFilters = [
    filters.keyword && { key: "q", label: `Từ khóa: ${filters.keyword}` },
    selectedCategory && { key: "category", label: `Danh mục: ${selectedCategory.name}` },
    filters.minPrice && { key: "min", label: `Từ ${Number(filters.minPrice).toLocaleString("vi-VN")}đ` },
    filters.maxPrice && { key: "max", label: `Đến ${Number(filters.maxPrice).toLocaleString("vi-VN")}đ` },
    filters.stock !== "all" && {
      key: "stock",
      label: stockOptions.find((item) => item.value === filters.stock)?.label,
    },
    filters.sort !== "newest" && {
      key: "sort",
      label: sortOptions.find((item) => item.value === filters.sort)?.label,
    },
  ].filter(Boolean);

  return (
    <>
      <Breadcrumb name="Danh Sách Sản Phẩm" />
      <div className="container">
        <div className="row">
          <div className="col-lg-3 col-md-12 col-sm-12 col-xs-12">
            <div className="sidebar">
              <div className="sidebar__item">
                <h2>Tìm Kiếm</h2>
                <form className="product-filter-search" onSubmit={handleKeywordSubmit}>
                  <input
                    type="text"
                    value={draftKeyword}
                    onChange={(e) => setDraftKeyword(e.target.value)}
                    placeholder="Tên hoặc mô tả sản phẩm"
                  />
                  <button type="submit">Tìm</button>
                </form>
              </div>
              <div className="sidebar__item">
                <h2>Mức Giá</h2>
                <div className="tags">
                  {pricePresets.map((preset) => {
                    const isActive =
                      filters.minPrice === preset.min && filters.maxPrice === preset.max;

                    return (
                      <button
                        type="button"
                        className={`tag${isActive ? " active" : ""}`}
                        key={preset.label}
                        onClick={() => updatePricePreset(preset)}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
                <div className="price-range-wrap">
                  <div>
                    <p>Từ:</p>
                    <input
                      type="number"
                      min={0}
                      value={filters.minPrice}
                      onChange={(e) => updateFilter("min", e.target.value)}
                    />
                  </div>
                  <div>
                    <p>Đến:</p>
                    <input
                      type="number"
                      min={0}
                      value={filters.maxPrice}
                      onChange={(e) => updateFilter("max", e.target.value)}
                    />
                  </div>
                </div>
                {hasInvalidPriceRange && (
                  <span className="product-filter-error">
                    Giá bắt đầu không được lớn hơn giá kết thúc.
                  </span>
                )}
              </div>
              <div className="sidebar__item">
                <h2>Tình Trạng</h2>
                <div className="tags">
                  {stockOptions.map((item) => (
                    <button
                      type="button"
                      className={`tag${filters.stock === item.value ? " active" : ""}`}
                      key={item.value}
                      onClick={() => updateFilter("stock", item.value)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sidebar__item">
                <h2>Sắp Xếp</h2>
                <div className="tags">
                  {sortOptions.map((item) => (
                    <button
                      type="button"
                      className={`tag${filters.sort === item.value ? " active" : ""}`}
                      key={item.value}
                      onClick={() => updateFilter("sort", item.value)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sidebar__item">
                <h2>Danh Mục</h2>
                <ul>
                  <li>
                    <button
                      type="button"
                      className={!filters.categoryId ? "active" : ""}
                      onClick={() => updateFilter("category", "")}
                    >
                      Tất cả sản phẩm
                    </button>
                  </li>
                  {categories.map((category) => (
                    <li key={category.id}>
                      <button
                        type="button"
                        className={
                          filters.categoryId === String(category.id) ? "active" : ""
                        }
                        onClick={() => updateFilter("category", String(category.id))}
                      >
                        {category.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                className="product-filter-reset"
                onClick={resetFilters}
                disabled={!activeFilters.length}
              >
                Xóa toàn bộ lọc
              </button>
            </div>
          </div>
          <div className="col-lg-9 col-md-12 col-sm-12 col-xs-12">
            <div className="product-list-toolbar">
              <div>
                <h2>Sản phẩm</h2>
                <p>
                  Hiển thị {filteredProducts.length}/{products.length} sản phẩm
                </p>
              </div>
              <div className="product-filter-chips">
                {activeFilters.map((filter) => (
                  <button
                    type="button"
                    key={filter.key}
                    onClick={() => updateFilter(filter.key, "")}
                  >
                    {filter.label} <span>x</span>
                  </button>
                ))}
              </div>
            </div>
            {isLoadingProducts && <div className="product-list-state">Đang tải sản phẩm...</div>}
            {!isLoadingProducts && !filteredProducts.length && (
              <div className="product-list-state">
                Không tìm thấy sản phẩm phù hợp. Hãy thử nới điều kiện lọc.
              </div>
            )}
            <div className="row">
              {filteredProducts.map((item) => (
                <div className="col-lg-4 col-md-4 col-sm-6 col-xs-12" key={item.id}>
                  <ProductCard product={item} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(ProductsPage);

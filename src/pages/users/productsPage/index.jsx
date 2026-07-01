import { memo, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard, ProductCardSkeleton } from "component";
import { useGetCategoriesUS, useGetProductsUS } from "api/homePage";
import Breadcrumb from "../theme/breadcrumb";
import { useTranslation } from "react-i18next";
import { AiOutlineClose, AiOutlineFilter } from "react-icons/ai";
import { translateCategoryName } from "utils/i18nLabels";
import "./style.scss";

const SORT_OPTIONS = [
  { labelKey: "products.newest", value: "newest" },
  { labelKey: "products.priceAsc", value: "price_asc" },
  { labelKey: "products.priceDesc", value: "price_desc" },
];

const STOCK_OPTIONS = [
  { labelKey: "products.all", value: "" },
  { labelKey: "products.inStock", value: "1" },
  { labelKey: "products.outOfStock", value: "0" },
];

const PRICE_PRESETS = [
  { labelKey: "products.priceUnder50", min: "", max: "50000" },
  { labelKey: "products.price50To100", min: "50000", max: "100000" },
  { labelKey: "products.price100To200", min: "100000", max: "200000" },
  { labelKey: "products.priceOver200", min: "200000", max: "" },
];

const Pagination = memo(({ meta, onPageChange }) => {
  const { t } = useTranslation();
  const currentPage = Number(meta?.current_page || 1);
  const lastPage = Number(meta?.last_page || 1);

  if (lastPage <= 1) {
    return null;
  }

  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(lastPage, currentPage + 2);
  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index
  );

  return (
    <div className="products-pagination">
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        {t("products.previous")}
      </button>
      {pages.map((page) => (
        <button
          type="button"
          className={page === currentPage ? "active" : ""}
          key={page}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        disabled={currentPage >= lastPage}
        onClick={() => onPageChange(currentPage + 1)}
      >
        {t("products.next")}
      </button>
    </div>
  );
});

const ProductsPage = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [draftKeyword, setDraftKeyword] = useState(searchParams.get("q") || "");
  const [showFilter, setShowFilter] = useState(false);
  const { data: categories = [] } = useGetCategoriesUS();
  const sortOptions = useMemo(
    () =>
      SORT_OPTIONS.map((item) => ({
        ...item,
        label: t(item.labelKey),
      })),
    [t]
  );
  const stockOptions = useMemo(
    () =>
      STOCK_OPTIONS.map((item) => ({
        ...item,
        label: t(item.labelKey),
      })),
    [t]
  );

  const filters = useMemo(
    () => ({
      keyword: searchParams.get("q") || "",
      categoryId: searchParams.get("category_id") || "",
      minPrice: searchParams.get("min_price") || "",
      maxPrice: searchParams.get("max_price") || "",
      inStock: searchParams.get("in_stock") ?? "",
      sort: searchParams.get("sort") || "newest",
      page: Number(searchParams.get("page") || 1),
      perPage: Number(searchParams.get("per_page") || 15),
    }),
    [searchParams]
  );

  const apiParams = useMemo(() => {
    const params = {
      page: filters.page,
      per_page: filters.perPage,
      sort: filters.sort,
    };

    if (filters.keyword) params.q = filters.keyword;
    if (filters.categoryId) params.category_id = filters.categoryId;
    if (filters.minPrice) params.min_price = filters.minPrice;
    if (filters.maxPrice) params.max_price = filters.maxPrice;
    if (filters.inStock !== "") params.in_stock = filters.inStock;

    return params;
  }, [filters]);

  const {
    data: productsResponse,
    isLoading: isLoadingProducts,
    isError: isProductsError,
  } = useGetProductsUS(apiParams, { raw: true });

  const products = productsResponse?.data || [];
  const meta = productsResponse?.meta || {
    current_page: 1,
    last_page: 1,
    total: 0,
  };

  const selectedCategory = categories.find(
    (category) => category.id === Number(filters.categoryId)
  );
  const selectedCategoryName = selectedCategory
    ? translateCategoryName(selectedCategory.name, t)
    : "";
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
      const shouldDelete =
        value === "" ||
        value === null ||
        value === undefined ||
        (key === "sort" && value === "newest") ||
        (key === "per_page" && String(value) === "15");

      if (shouldDelete) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }

      if (key !== "page") {
        next.delete("page");
      }

      return next;
    });
  };

  const updatePricePreset = (preset) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);

      if (preset.min) {
        next.set("min_price", preset.min);
      } else {
        next.delete("min_price");
      }

      if (preset.max) {
        next.set("max_price", preset.max);
      } else {
        next.delete("max_price");
      }

      next.delete("page");

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

  const activeFilters = [
    filters.keyword && {
      key: "q",
      label: t("products.keywordChip", { keyword: filters.keyword }),
      clearValue: "",
    },
    selectedCategory && {
      key: "category_id",
      label: t("products.categoryChip", { category: selectedCategoryName }),
      clearValue: "",
    },
    filters.minPrice && {
      key: "min_price",
      label: t("products.fromChip", {
        price: Number(filters.minPrice).toLocaleString("vi-VN"),
      }),
      clearValue: "",
    },
    filters.maxPrice && {
      key: "max_price",
      label: t("products.toChip", {
        price: Number(filters.maxPrice).toLocaleString("vi-VN"),
      }),
      clearValue: "",
    },
    filters.inStock !== "" && {
      key: "in_stock",
      label: stockOptions.find((item) => item.value === filters.inStock)?.label,
      clearValue: "",
    },
    filters.sort !== "newest" && {
      key: "sort",
      label: sortOptions.find((item) => item.value === filters.sort)?.label,
      clearValue: "newest",
    },
  ].filter(Boolean);

  return (
    <>
      <Breadcrumb name={t("products.title")} />
      <div className="container">
        <button
          type="button"
          className="product-filter-toggle"
          aria-expanded={showFilter}
          aria-controls="product-filter-sidebar"
          onClick={() => setShowFilter(true)}
        >
          <AiOutlineFilter />
          {t("products.filter")}
        </button>
        <button
          type="button"
          className={`product-filter-overlay${showFilter ? " open" : ""}`}
          aria-label={t("common.close")}
          onClick={() => setShowFilter(false)}
        />
        <div className="row">
          <div className="col-lg-3 col-md-12 col-sm-12 col-xs-12">
            <aside
              id="product-filter-sidebar"
              className={`sidebar${showFilter ? " open" : ""}`}
            >
              <div className="product-filter-mobile-header">
                <h2>{t("products.filter")}</h2>
                <button
                  type="button"
                  aria-label={t("common.close")}
                  onClick={() => setShowFilter(false)}
                >
                  <AiOutlineClose />
                </button>
              </div>
              <div className="sidebar__item">
                <h2>{t("products.search")}</h2>
                <form className="product-filter-search" onSubmit={handleKeywordSubmit}>
                  <input
                    type="text"
                    value={draftKeyword}
                    onChange={(e) => setDraftKeyword(e.target.value)}
                    placeholder={t("products.searchPlaceholder")}
                  />
                  <button type="submit">{t("products.searchButton")}</button>
                </form>
              </div>

              <div className="sidebar__item">
                <h2>{t("products.priceRange")}</h2>
                <div className="tags">
                  {PRICE_PRESETS.map((preset) => {
                    const isActive =
                      filters.minPrice === preset.min && filters.maxPrice === preset.max;

                    return (
                      <button
                        type="button"
                        className={`tag${isActive ? " active" : ""}`}
                        key={preset.labelKey}
                        onClick={() => updatePricePreset(preset)}
                      >
                        {t(preset.labelKey)}
                      </button>
                    );
                  })}
                </div>
                <div className="price-range-wrap">
                  <div>
                    <p>{t("products.from")}:</p>
                    <input
                      type="number"
                      min={0}
                      value={filters.minPrice}
                      onChange={(e) => updateFilter("min_price", e.target.value)}
                    />
                  </div>
                  <div>
                    <p>{t("products.to")}:</p>
                    <input
                      type="number"
                      min={0}
                      value={filters.maxPrice}
                      onChange={(e) => updateFilter("max_price", e.target.value)}
                    />
                  </div>
                </div>
                {hasInvalidPriceRange && (
                  <span className="product-filter-error">
                    {t("products.invalidPriceRange")}
                  </span>
                )}
              </div>

              <div className="sidebar__item">
                <h2>{t("products.status")}</h2>
                <div className="tags">
                  {stockOptions.map((item) => (
                    <button
                      type="button"
                      className={`tag${filters.inStock === item.value ? " active" : ""}`}
                      key={item.value || "all"}
                      onClick={() => updateFilter("in_stock", item.value)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sidebar__item">
                <h2>{t("products.sort")}</h2>
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
                <h2>{t("products.category")}</h2>
                <ul>
                  <li>
                    <button
                      type="button"
                      className={!filters.categoryId ? "active" : ""}
                      onClick={() => updateFilter("category_id", "")}
                    >
                      {t("products.allProducts")}
                    </button>
                  </li>
                  {categories.map((category) => (
                    <li key={category.id}>
                      <button
                        type="button"
                        className={
                          filters.categoryId === String(category.id) ? "active" : ""
                        }
                        onClick={() => updateFilter("category_id", category.id)}
                      >
                        {translateCategoryName(category.name, t)}
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
                {t("products.resetFilters")}
              </button>
            </aside>
          </div>

          <div className="col-lg-9 col-md-12 col-sm-12 col-xs-12">
            <div className="product-list-toolbar">
              <div>
                <h2>{t("products.heading")}</h2>
                <p>
                  {t("products.showing", {
                    shown: products.length,
                    total: meta.total || 0,
                  })}
                </p>
              </div>
              <div className="product-filter-chips">
                {activeFilters.map((filter) => (
                  <button
                    type="button"
                    key={filter.key}
                    onClick={() => updateFilter(filter.key, filter.clearValue)}
                  >
                    {filter.label} <span>x</span>
                  </button>
                ))}
              </div>
            </div>

            {isProductsError && (
              <div className="product-list-state">
                {t("products.loadError")}
              </div>
            )}
            {!isLoadingProducts && !isProductsError && !products.length && (
              <div className="product-list-state">
                {t("products.notFound")}
              </div>
            )}

            <div className="product-grid">
              {isLoadingProducts &&
                Array.from({ length: 8 }, (_, index) => (
                  <div className="product-grid__item" key={`skeleton-${index}`}>
                    <ProductCardSkeleton />
                  </div>
                ))}
              {products.map((item) => (
                <div className="product-grid__item" key={item.id}>
                  <ProductCard product={item} />
                </div>
              ))}
            </div>

            <Pagination meta={meta} onPageChange={(page) => updateFilter("page", page)} />
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(ProductsPage);

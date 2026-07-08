import { memo, useEffect, useMemo, useRef, useState } from "react";
import debounce from "lodash.debounce";
import { generatePath, useLocation, useNavigate } from "react-router-dom";
import { getProductSuggestionsAPI } from "api/homePage";
import { formatter } from "utils/fomater";
import { ROUTERS } from "utils/router";
import { resolveProductImage } from "utils/productImages";
import { useTranslation } from "react-i18next";
import { translateProductName } from "utils/i18nLabels";
import "./style.scss";

const SearchBar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const wrapperRef = useRef(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const goToSearch = (keyword = query) => {
    const nextKeyword = keyword.trim();
    setIsOpen(false);

    navigate(
      nextKeyword
        ? `${ROUTERS.USER.PRODUCTS}?q=${encodeURIComponent(nextKeyword)}`
        : ROUTERS.USER.PRODUCTS
    );
  };

  const goToProduct = (product) => {
    if (!product?.id) {
      return;
    }

    setIsOpen(false);
    navigate(generatePath(ROUTERS.USER.PRODUCT, { id: product.id }));
  };

  const debouncedFetch = useMemo(
    () =>
      debounce(async (keyword) => {
        const normalized = keyword.trim();

        if (!normalized) {
          setSuggestions([]);
          setIsOpen(false);
          return;
        }

        try {
          const response = await getProductSuggestionsAPI(normalized);
          const nextSuggestions = response?.data || [];
          setSuggestions(nextSuggestions);
          setIsOpen(true);
          setActiveIndex(nextSuggestions.length ? 0 : -1);
        } catch (error) {
          setSuggestions([]);
          setIsOpen(false);
        }
      }, 300),
    []
  );

  useEffect(() => () => debouncedFetch.cancel(), [debouncedFetch]);

  useEffect(() => {
    setQuery(new URLSearchParams(location.search).get("q") || "");
    setIsOpen(false);
    setActiveIndex(-1);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isOpen && activeIndex >= 0 && suggestions[activeIndex]) {
      goToProduct(suggestions[activeIndex]);
      return;
    }

    goToSearch();
  };

  const handleChange = (event) => {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    debouncedFetch(nextQuery);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      return;
    }

    if (!isOpen || suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        (current) => (current - 1 + suggestions.length) % suggestions.length
      );
    }
  };

  return (
    <div className="search-bar" ref={wrapperRef}>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={t("navbar.searchPlaceholder")}
          autoComplete="off"
        />
        <button type="submit">{t("navbar.searchButton")}</button>
      </form>
      {isOpen && query.trim() && (
        <div className="search-bar__dropdown">
          {suggestions.length > 0 ? (
            suggestions.map((product, index) => (
              <button
                type="button"
                key={product.id}
                className={index === activeIndex ? "is-active" : ""}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  goToProduct(product);
                }}
              >
                <img
                  src={resolveProductImage(product.image_url || product.img)}
                  alt={translateProductName(product, t)}
                />
                <span>{translateProductName(product, t)}</span>
                <b>{formatter(product.price)}</b>
              </button>
            ))
          ) : (
            <div className="search-bar__empty">{t("search.noSuggestions")}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(SearchBar);

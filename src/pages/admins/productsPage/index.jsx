import { memo, useEffect, useState } from "react";
import {
  createAdminProductAPI,
  deleteAdminProductAPI,
  getAdminCategoriesAPI,
  getAdminProductsAPI,
  updateAdminProductAPI,
} from "api/admin";
import { ConfirmModal, ImageUpload } from "component";
import { formatter } from "utils/fomater";
import { PRODUCT_IMAGE_OPTIONS, resolveProductImage } from "utils/productImages";
import { useTranslation } from "react-i18next";
import { isAdmin } from "utils/adminAuth";
import "../admin.scss";

const emptyProductForm = {
  name: "",
  img: PRODUCT_IMAGE_OPTIONS[0].value,
  price: 0,
  inventory: 0,
  category_id: "",
  sort_description: "",
  description: "",
  facebook: "",
  twitter: "",
  instagram: "",
  linkedin: "",
};

const AdminProductsPage = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyProductForm);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pendingDeleteProduct, setPendingDeleteProduct] = useState(null);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const canDelete = isAdmin();

  const loadData = async (page = 1) => {
    setIsLoading(true);
    setError("");

    try {
      const [productsResponse, categoriesData] = await Promise.all([
        getAdminProductsAPI({ page, per_page: 20 }),
        getAdminCategoriesAPI(),
      ]);
      const productItems = Array.isArray(productsResponse)
        ? productsResponse
        : productsResponse?.data || [];
      setProducts(productItems);
      setMeta(
        productsResponse?.meta || {
          current_page: 1,
          last_page: 1,
          total: productItems.length,
        }
      );
      setCategories(categoriesData);
      setForm((prev) => ({
        ...prev,
        category_id: prev.category_id || categoriesData[0]?.id || "",
      }));
    } catch (err) {
      setError(err?.response?.data?.message || t("admin.products.loadError"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      ...emptyProductForm,
      category_id: categories[0]?.id || "",
    });
  };

  const toPayload = () => ({
    ...form,
    price: Number(form.price),
    inventory: Number(form.inventory),
    category_id: Number(form.category_id),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      if (editingId) {
        await updateAdminProductAPI(editingId, toPayload());
        setMessage(t("admin.products.updated"));
      } else {
        await createAdminProductAPI(toPayload());
        setMessage(t("admin.products.created"));
      }

      resetForm();
      loadData(editingId ? meta.current_page : 1);
    } catch (err) {
      setError(err?.response?.data?.message || t("admin.products.saveError"));
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      img: product.img || PRODUCT_IMAGE_OPTIONS[0].value,
      price: product.price || 0,
      inventory: product.inventory || 0,
      category_id: product.category_id || "",
      sort_description: product.sort_description || "",
      description: product.description || "",
      facebook: product.facebook || "",
      twitter: product.twitter || "",
      instagram: product.instagram || "",
      linkedin: product.linkedin || "",
    });
  };

  const handleDelete = async (product) => {
    setPendingDeleteProduct(product);
  };

  const confirmDeleteProduct = async () => {
    if (!pendingDeleteProduct) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await deleteAdminProductAPI(pendingDeleteProduct.id);
      setMessage(t("admin.products.deleted"));
      setPendingDeleteProduct(null);
      const nextPage =
        products.length === 1 && meta.current_page > 1
          ? meta.current_page - 1
          : meta.current_page;
      loadData(nextPage);
    } catch (err) {
      setError(err?.response?.data?.message || t("admin.products.deleteError"));
    }
  };

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-page__header">
          <div>
            <h1 className="admin-page__title">{t("admin.products.title")}</h1>
            <p className="admin-page__subtitle">
              {t("admin.products.subtitle")}
            </p>
          </div>
          <button
            className="admin-page__button"
            onClick={() => loadData(meta.current_page)}
          >
            {t("admin.common.refresh")}
          </button>
        </div>

        {message && <div className="admin-page__message">{message}</div>}
        {error && <div className="admin-page__message admin-page__message--error">{error}</div>}

        <div className="admin-page__grid">
          <div className="admin-page__panel">
            <h2 className="admin-page__panel-title">
              {editingId ? t("admin.products.updateTitle") : t("admin.products.createTitle")}
            </h2>
            <form className="admin-page__form" onSubmit={handleSubmit}>
              <label>
                {t("admin.products.name")}
                <input name="name" value={form.name} onChange={handleChange} required />
              </label>
              <label>
                {t("admin.products.image")}
                <select name="img" value={form.img} onChange={handleChange}>
                  {!PRODUCT_IMAGE_OPTIONS.some((item) => item.value === form.img) && (
                    <option value={form.img}>{t("admin.common.uploadedImage")}</option>
                  )}
                  {PRODUCT_IMAGE_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <ImageUpload
                productId={editingId}
                value={form.img}
                onUploaded={(imageUrl) => {
                  setForm((prev) => ({
                    ...prev,
                    img: imageUrl,
                  }));
                  setProducts((prev) =>
                    prev.map((product) =>
                      product.id === editingId ? { ...product, img: imageUrl } : product
                    )
                  );
                }}
              />
              <label>
                {t("admin.products.category")}
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  required
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t("admin.products.price")}
                <input
                  name="price"
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                {t("admin.products.inventory")}
                <input
                  name="inventory"
                  type="number"
                  min="0"
                  value={form.inventory}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                {t("admin.products.shortDescription")}
                <textarea
                  name="sort_description"
                  value={form.sort_description}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                {t("admin.products.description")}
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </label>
              <div className="admin-page__actions">
                <button className="admin-page__button" type="submit">
                  {editingId
                    ? t("admin.common.saveChanges")
                    : t("admin.products.createButton")}
                </button>
                {editingId && (
                  <button
                    className="admin-page__button admin-page__button--ghost"
                    type="button"
                    onClick={resetForm}
                  >
                    {t("admin.common.cancel")}
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="admin-page__panel">
            <h2 className="admin-page__panel-title">{t("admin.products.listTitle")}</h2>
            <div className="admin-page__table-wrap">
              <table className="admin-page__table">
                <thead>
                  <tr>
                    <th>{t("admin.common.image")}</th>
                    <th>{t("admin.products.name")}</th>
                    <th>{t("admin.products.category")}</th>
                    <th>{t("admin.products.price")}</th>
                    <th>{t("admin.products.stockShort")}</th>
                    <th>{t("admin.common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <img
                          className="admin-page__image"
                          src={resolveProductImage(product.img)}
                          alt={product.name}
                        />
                      </td>
                      <td>
                        <strong>{product.name}</strong>
                        <br />
                        <span>{product.sort_description}</span>
                      </td>
                      <td>{product.category?.name || t("common.noCategory")}</td>
                      <td>{formatter(product.price)}</td>
                      <td>{product.inventory}</td>
                      <td>
                        <div className="admin-page__actions">
                          <button
                            className="admin-page__button admin-page__button--ghost"
                            onClick={() => handleEdit(product)}
                          >
                            {t("admin.common.edit")}
                          </button>
                          {canDelete && (
                            <button
                              className="admin-page__button admin-page__button--danger"
                              onClick={() => handleDelete(product)}
                            >
                              {t("admin.common.delete")}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!products.length && !isLoading && (
                    <tr>
                      <td colSpan={6} className="admin-page__empty">
                        {t("admin.products.empty")}
                      </td>
                    </tr>
                  )}
                  {isLoading && (
                    <tr>
                      <td colSpan={6} className="admin-page__empty">
                        {t("admin.common.loadingData")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {meta.last_page > 1 && (
              <div className="admin-page__pagination">
                <button
                  type="button"
                  disabled={meta.current_page <= 1 || isLoading}
                  onClick={() => loadData(meta.current_page - 1)}
                >
                  {t("admin.common.previous")}
                </button>
                <span>
                  {t("admin.common.pageStatus", {
                    current: meta.current_page,
                    last: meta.last_page,
                    total: meta.total,
                  })}
                </span>
                <button
                  type="button"
                  disabled={meta.current_page >= meta.last_page || isLoading}
                  onClick={() => loadData(meta.current_page + 1)}
                >
                  {t("admin.common.next")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={Boolean(pendingDeleteProduct)}
        title={t("admin.products.confirmDeleteTitle")}
        message={t("admin.products.confirmDeleteMessage", {
          name: pendingDeleteProduct?.name || "",
        })}
        onConfirm={confirmDeleteProduct}
        onCancel={() => setPendingDeleteProduct(null)}
      />
    </main>
  );
};

export default memo(AdminProductsPage);

import { memo, useEffect, useState } from "react";
import {
  createAdminCategoryAPI,
  deleteAdminCategoryAPI,
  getAdminCategoriesAPI,
  updateAdminCategoryAPI,
} from "api/admin";
import { ConfirmModal } from "component";
import { useTranslation } from "react-i18next";
import { isAdmin } from "utils/adminAuth";
import { translateCategoryName } from "utils/i18nLabels";
import "../admin.scss";

const AdminCategoriesPage = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState(null);
  const canDelete = isAdmin();

  const loadCategories = async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await getAdminCategoriesAPI();
      setCategories(data);
    } catch (err) {
      setError(err?.response?.data?.message || t("admin.categories.loadError"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setName("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      if (editingId) {
        await updateAdminCategoryAPI(editingId, { name });
        setMessage(t("admin.categories.updated"));
      } else {
        await createAdminCategoryAPI({ name });
        setMessage(t("admin.categories.created"));
      }

      resetForm();
      loadCategories();
    } catch (err) {
      setError(err?.response?.data?.message || t("admin.categories.saveError"));
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setName(category.name);
  };

  const handleDelete = async (category) => {
    setPendingDeleteCategory(category);
  };

  const confirmDeleteCategory = async () => {
    if (!pendingDeleteCategory) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await deleteAdminCategoryAPI(pendingDeleteCategory.id);
      setMessage(t("admin.categories.deleted"));
      setPendingDeleteCategory(null);
      loadCategories();
    } catch (err) {
      setError(err?.response?.data?.message || t("admin.categories.deleteError"));
    }
  };

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-page__header">
          <div>
            <h1 className="admin-page__title">{t("admin.categories.title")}</h1>
            <p className="admin-page__subtitle">
              {t("admin.categories.subtitle")}
            </p>
          </div>
        </div>

        {message && <div className="admin-page__message">{message}</div>}
        {error && <div className="admin-page__message admin-page__message--error">{error}</div>}

        <div className="admin-page__grid">
          <div className="admin-page__panel">
            <h2 className="admin-page__panel-title">
              {editingId
                ? t("admin.categories.updateTitle")
                : t("admin.categories.createTitle")}
            </h2>
            <form className="admin-page__form" onSubmit={handleSubmit}>
              <label>
                {t("admin.categories.name")}
                <input value={name} onChange={(e) => setName(e.target.value)} required />
              </label>
              <div className="admin-page__actions">
                <button className="admin-page__button" type="submit">
                  {editingId
                    ? t("admin.common.saveChanges")
                    : t("admin.categories.createButton")}
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
            <h2 className="admin-page__panel-title">
              {t("admin.categories.listTitle")}
            </h2>
            <div className="admin-page__table-wrap">
              <table className="admin-page__table">
                <thead>
                  <tr>
                    <th>{t("admin.common.code")}</th>
                    <th>{t("admin.common.name")}</th>
                    <th>{t("admin.categories.productCount")}</th>
                    <th>{t("admin.common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>#{category.id}</td>
                      <td>{translateCategoryName(category.name, t)}</td>
                      <td>{category.products_count || 0}</td>
                      <td>
                        <div className="admin-page__actions">
                          <button
                            className="admin-page__button admin-page__button--ghost"
                            onClick={() => handleEdit(category)}
                          >
                            {t("admin.common.edit")}
                          </button>
                          {canDelete && (
                            <button
                              className="admin-page__button admin-page__button--danger"
                              onClick={() => handleDelete(category)}
                            >
                              {t("admin.common.delete")}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!categories.length && !isLoading && (
                    <tr>
                      <td colSpan={4} className="admin-page__empty">
                        {t("admin.categories.empty")}
                      </td>
                    </tr>
                  )}
                  {isLoading && (
                    <tr>
                      <td colSpan={4} className="admin-page__empty">
                        {t("admin.common.loadingData")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={Boolean(pendingDeleteCategory)}
        title={t("admin.categories.confirmDeleteTitle")}
        message={t("admin.categories.confirmDeleteMessage", {
          name: pendingDeleteCategory?.name || "",
        })}
        onConfirm={confirmDeleteCategory}
        onCancel={() => setPendingDeleteCategory(null)}
      />
    </main>
  );
};

export default memo(AdminCategoriesPage);

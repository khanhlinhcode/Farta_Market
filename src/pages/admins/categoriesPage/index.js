import { memo, useEffect, useState } from "react";
import {
  createAdminCategoryAPI,
  deleteAdminCategoryAPI,
  getAdminCategoriesAPI,
  updateAdminCategoryAPI,
} from "api/admin";
import "../admin.scss";

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadCategories = async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await getAdminCategoriesAPI();
      setCategories(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Không tải được danh mục.");
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
        setMessage("Đã cập nhật danh mục.");
      } else {
        await createAdminCategoryAPI({ name });
        setMessage("Đã tạo danh mục.");
      }

      resetForm();
      loadCategories();
    } catch (err) {
      setError(err?.response?.data?.message || "Không lưu được danh mục.");
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setName(category.name);
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Xoá danh mục "${category.name}"?`)) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await deleteAdminCategoryAPI(category.id);
      setMessage("Đã xoá danh mục.");
      loadCategories();
    } catch (err) {
      setError(err?.response?.data?.message || "Không xoá được danh mục.");
    }
  };

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-page__header">
          <div>
            <h1 className="admin-page__title">Quản lý danh mục</h1>
            <p className="admin-page__subtitle">
              Tạo nhóm sản phẩm và kiểm soát danh mục đang dùng trên website.
            </p>
          </div>
        </div>

        {message && <div className="admin-page__message">{message}</div>}
        {error && <div className="admin-page__message admin-page__message--error">{error}</div>}

        <div className="admin-page__grid">
          <div className="admin-page__panel">
            <h2 className="admin-page__panel-title">
              {editingId ? "Cập nhật danh mục" : "Thêm danh mục"}
            </h2>
            <form className="admin-page__form" onSubmit={handleSubmit}>
              <label>
                Tên danh mục
                <input value={name} onChange={(e) => setName(e.target.value)} required />
              </label>
              <div className="admin-page__actions">
                <button className="admin-page__button" type="submit">
                  {editingId ? "Lưu thay đổi" : "Tạo danh mục"}
                </button>
                {editingId && (
                  <button
                    className="admin-page__button admin-page__button--ghost"
                    type="button"
                    onClick={resetForm}
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="admin-page__panel">
            <h2 className="admin-page__panel-title">Danh sách danh mục</h2>
            <div className="admin-page__table-wrap">
              <table className="admin-page__table">
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Tên</th>
                    <th>Số sản phẩm</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>#{category.id}</td>
                      <td>{category.name}</td>
                      <td>{category.products_count || 0}</td>
                      <td>
                        <div className="admin-page__actions">
                          <button
                            className="admin-page__button admin-page__button--ghost"
                            onClick={() => handleEdit(category)}
                          >
                            Sửa
                          </button>
                          <button
                            className="admin-page__button admin-page__button--danger"
                            onClick={() => handleDelete(category)}
                          >
                            Xoá
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!categories.length && !isLoading && (
                    <tr>
                      <td colSpan={4} className="admin-page__empty">
                        Chưa có danh mục.
                      </td>
                    </tr>
                  )}
                  {isLoading && (
                    <tr>
                      <td colSpan={4} className="admin-page__empty">
                        Đang tải dữ liệu...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default memo(AdminCategoriesPage);

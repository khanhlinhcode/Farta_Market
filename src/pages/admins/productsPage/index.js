import { memo, useEffect, useState } from "react";
import {
  createAdminProductAPI,
  deleteAdminProductAPI,
  getAdminCategoriesAPI,
  getAdminProductsAPI,
  updateAdminProductAPI,
} from "api/admin";
import { formatter } from "utils/fomater";
import { PRODUCT_IMAGE_OPTIONS, resolveProductImage } from "utils/productImages";
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
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyProductForm);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [productsData, categoriesData] = await Promise.all([
        getAdminProductsAPI(),
        getAdminCategoriesAPI(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setForm((prev) => ({
        ...prev,
        category_id: prev.category_id || categoriesData[0]?.id || "",
      }));
    } catch (err) {
      setError(err?.response?.data?.message || "Không tải được dữ liệu sản phẩm.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
        setMessage("Đã cập nhật sản phẩm.");
      } else {
        await createAdminProductAPI(toPayload());
        setMessage("Đã tạo sản phẩm.");
      }

      resetForm();
      loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "Không lưu được sản phẩm.");
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
    if (!window.confirm(`Xoá sản phẩm "${product.name}"?`)) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await deleteAdminProductAPI(product.id);
      setMessage("Đã xoá sản phẩm.");
      loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "Không xoá được sản phẩm.");
    }
  };

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-page__header">
          <div>
            <h1 className="admin-page__title">Quản lý sản phẩm</h1>
            <p className="admin-page__subtitle">
              Cập nhật thông tin bán hàng, tồn kho, hình ảnh và danh mục sản phẩm.
            </p>
          </div>
          <button className="admin-page__button" onClick={loadData}>
            Làm mới
          </button>
        </div>

        {message && <div className="admin-page__message">{message}</div>}
        {error && <div className="admin-page__message admin-page__message--error">{error}</div>}

        <div className="admin-page__grid">
          <div className="admin-page__panel">
            <h2 className="admin-page__panel-title">
              {editingId ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
            </h2>
            <form className="admin-page__form" onSubmit={handleSubmit}>
              <label>
                Tên sản phẩm
                <input name="name" value={form.name} onChange={handleChange} required />
              </label>
              <label>
                Hình ảnh
                <select name="img" value={form.img} onChange={handleChange}>
                  {PRODUCT_IMAGE_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Danh mục
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
                Giá
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
                Tồn kho
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
                Mô tả ngắn
                <textarea
                  name="sort_description"
                  value={form.sort_description}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Mô tả chi tiết
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </label>
              <div className="admin-page__actions">
                <button className="admin-page__button" type="submit">
                  {editingId ? "Lưu thay đổi" : "Tạo sản phẩm"}
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
            <h2 className="admin-page__panel-title">Danh sách sản phẩm</h2>
            <div className="admin-page__table-wrap">
              <table className="admin-page__table">
                <thead>
                  <tr>
                    <th>Ảnh</th>
                    <th>Sản phẩm</th>
                    <th>Danh mục</th>
                    <th>Giá</th>
                    <th>Tồn</th>
                    <th>Thao tác</th>
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
                      <td>{product.category?.name || "Chưa có"}</td>
                      <td>{formatter(product.price)}</td>
                      <td>{product.inventory}</td>
                      <td>
                        <div className="admin-page__actions">
                          <button
                            className="admin-page__button admin-page__button--ghost"
                            onClick={() => handleEdit(product)}
                          >
                            Sửa
                          </button>
                          <button
                            className="admin-page__button admin-page__button--danger"
                            onClick={() => handleDelete(product)}
                          >
                            Xoá
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!products.length && !isLoading && (
                    <tr>
                      <td colSpan={6} className="admin-page__empty">
                        Chưa có sản phẩm.
                      </td>
                    </tr>
                  )}
                  {isLoading && (
                    <tr>
                      <td colSpan={6} className="admin-page__empty">
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

export default memo(AdminProductsPage);

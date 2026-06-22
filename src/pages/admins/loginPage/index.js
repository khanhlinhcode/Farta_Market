import { memo, useEffect, useState } from "react";
import "./style.scss";
import { useNavigate } from "react-router-dom";
import { ROUTERS } from "utils/router";
import { SESSION_KEYS } from "utils/constant";
import { loginAdminAPI } from "api/admin";

const LoginAdPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "test@example.com",
    password: "password",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(SESSION_KEYS.ADMIN_TOKEN)) {
      navigate(ROUTERS.ADMIN.ORDERS, { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const hanldeSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await loginAdminAPI(form);
      localStorage.setItem(SESSION_KEYS.ADMIN_TOKEN, response.token);
      navigate(ROUTERS.ADMIN.ORDERS, { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message || "Không đăng nhập được, vui lòng kiểm tra lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="login__container">
        <h2 className="login__title">Truy Cập Hệ Thống Quản Trị</h2>
        <form className="login__form" onSubmit={hanldeSubmit}>
          <div className="login__form-group">
            <label htmlFor="email" className="login__label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="login__form-group">
            <label htmlFor="password" className="login__label">
              Mật Khẩu
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          {error && <p className="login__error">{error}</p>}
          <button type="submit" className="login__button">
            {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
          </button>
        </form>
      </div>
    </div>
  );
};
export default memo(LoginAdPage);

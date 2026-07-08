import { memo, useEffect, useState } from "react";
import "./style.scss";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTERS } from "utils/router";
import { loginAdminAPI } from "api/admin";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  clearAdminSession,
  hasAdminAccess,
} from "utils/adminAuth";
import {
  selectAdminUser,
  setAuthenticatedUser,
} from "../../../redux/authSlice";

const LoginAdPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const adminUser = useSelector(selectAdminUser);
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    clearAdminSession();

    if (hasAdminAccess(adminUser)) {
      navigate(getSafeRedirectPath(redirectPath) || ROUTERS.ADMIN.ORDERS, {
        replace: true,
      });
    }
  }, [adminUser, navigate, redirectPath]);

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
      dispatch(setAuthenticatedUser(response.user));
      navigate(getSafeRedirectPath(redirectPath) || ROUTERS.ADMIN.ORDERS, {
        replace: true,
      });
    } catch (err) {
      setError(
        err?.response?.data?.message || t("admin.login.error")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="login__container">
        <h2 className="login__title">{t("admin.login.title")}</h2>
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
              {t("admin.login.password")}
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
            {isLoading ? t("admin.login.loading") : t("admin.login.button")}
          </button>
        </form>
      </div>
    </div>
  );
};
export default memo(LoginAdPage);

const getSafeRedirectPath = (path) => {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "";
  }

  return path;
};

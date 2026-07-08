import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { loginUserAPI, registerUserAPI } from "api/auth";
import { syncGuestWishlistAPI } from "api/wishlist";
import { SESSION_KEYS } from "utils/constant";
import { ROUTERS } from "utils/router";
import { setAuthenticatedUser } from "../../../redux/authSlice";
import "./style.scss";

const UserLoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const redirectPath = getSafeRedirectPath(searchParams.get("redirect"));
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const payload =
        mode === "register"
          ? form
          : { email: form.email, password: form.password };
      const response =
        mode === "register"
          ? await registerUserAPI(payload)
          : await loginUserAPI(payload);

      dispatch(setAuthenticatedUser(response.user));

      const wishlistIds = getStoredWishlistIds();
      if (wishlistIds.length) {
        try {
          await syncGuestWishlistAPI(wishlistIds);
          localStorage.removeItem(SESSION_KEYS.WISHLIST_IDS);
        } catch (syncError) {
          toast.error(
            syncError?.response?.data?.message || t("wishlist.syncError")
          );
        }
      }

      toast.success(
        mode === "register" ? t("auth.registerSuccess") : t("auth.loginSuccess")
      );
      navigate(redirectPath || ROUTERS.USER.HOME, { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        Object.values(err?.response?.data?.errors || {})?.flat()?.[0] ||
        t("auth.error");
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="user-login">
      <section className="user-login__card">
        <div className="user-login__tabs">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            {t("auth.loginTitle")}
          </button>
          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
          >
            {t("auth.registerTitle")}
          </button>
        </div>

        <form className="user-login__form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <label>
              <span>{t("auth.name")}</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>
          )}
          <label>
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            <span>{t("auth.password")}</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
            {mode === "register" && (
              <small className="user-login__hint">
                {t("auth.passwordHint")}
              </small>
            )}
          </label>
          {mode === "register" && (
            <label>
              <span>{t("auth.passwordConfirmation")}</span>
              <input
                type="password"
                name="password_confirmation"
                value={form.password_confirmation}
                onChange={handleChange}
                required
              />
            </label>
          )}

          {error && <p className="user-login__error">{error}</p>}

          <button type="submit" className="user-login__submit" disabled={isLoading}>
            {isLoading
              ? t("auth.loading")
              : mode === "register"
              ? t("auth.registerButton")
              : t("auth.loginButton")}
          </button>
        </form>

        <Link className="user-login__back" to={ROUTERS.USER.PRODUCTS}>
          {t("auth.continueShopping")}
        </Link>
      </section>
    </main>
  );
};

const getSafeRedirectPath = (path) => {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "";
  }

  return path;
};

const getStoredWishlistIds = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEYS.WISHLIST_IDS) || "[]");
  } catch (error) {
    return [];
  }
};

export default memo(UserLoginPage);

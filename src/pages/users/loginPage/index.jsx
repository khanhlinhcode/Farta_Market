import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { FiEye, FiEyeOff } from "react-icons/fi";
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
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setError("");
    toast.remove();
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
            aria-pressed={mode === "login"}
            onClick={() => handleModeChange("login")}
          >
            {t("auth.loginTitle")}
          </button>
          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            aria-pressed={mode === "register"}
            onClick={() => handleModeChange("register")}
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
          <div className="user-login__field">
            <label htmlFor="user-login-password">
              <span>{t("auth.password")}</span>
            </label>
            <div className="user-login__password-field">
              <input
                id="user-login-password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="user-login__password-toggle"
                aria-label={
                  showPassword ? t("auth.hidePassword") : t("auth.showPassword")
                }
                aria-pressed={showPassword}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? (
                  <FiEyeOff aria-hidden="true" />
                ) : (
                  <FiEye aria-hidden="true" />
                )}
              </button>
            </div>
            {mode === "register" && (
              <small className="user-login__hint">
                {t("auth.passwordHint")}
              </small>
            )}
          </div>
          {mode === "register" && (
            <div className="user-login__field">
              <label htmlFor="user-login-password-confirmation">
                <span>{t("auth.passwordConfirmation")}</span>
              </label>
              <div className="user-login__password-field">
                <input
                  id="user-login-password-confirmation"
                  type={showPassword ? "text" : "password"}
                  name="password_confirmation"
                  value={form.password_confirmation}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
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

        <div className="user-login__links">
          <Link className="user-login__back" to={ROUTERS.USER.PRODUCTS}>
            {t("auth.continueShopping")}
          </Link>
          <Link className="user-login__admin-link" to={ROUTERS.ADMIN.LOGIN}>
            {t("auth.adminLogin")}
          </Link>
        </div>
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

import { memo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { forgotPasswordAPI, resetPasswordAPI } from "api/auth";
import { ROUTERS } from "utils/router";
import "../loginPage/style.scss";

const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function PasswordRecoveryPage({ mode }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetting = mode === "reset";
  const [token] = useState(() => (resetting ? searchParams.get("token") || "" : ""));
  const [form, setForm] = useState({
    email: resetting ? searchParams.get("email") || "" : "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(resetting && !token ? t("auth.resetLinkInvalid") : "");
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (resetting && window.location.search) {
      window.history.replaceState(window.history.state, "", window.location.pathname);
    }
  }, [resetting]);

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setFieldErrors((current) => ({ ...current, [event.target.name]: "" }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (loading) return;
    setError("");
    setFieldErrors({});
    setMessage("");

    if (resetting && !token) {
      setError(t("auth.resetLinkInvalid"));
      return;
    }
    if (resetting && !STRONG_PASSWORD.test(form.password)) {
      setError(t("auth.passwordHint"));
      return;
    }
    if (resetting && form.password !== form.password_confirmation) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    setLoading(true);
    try {
      if (resetting) {
        await resetPasswordAPI({ ...form, token });
        setForm({ email: "", password: "", password_confirmation: "" });
        toast.success(t("auth.resetPasswordSuccess"));
        navigate(ROUTERS.USER.LOGIN, { replace: true });
      } else {
        await forgotPasswordAPI({ email: form.email });
        setMessage(t("auth.forgotPasswordSent"));
      }
    } catch (requestError) {
      const errors = requestError?.response?.data?.errors;
      if (errors) {
        setFieldErrors(Object.fromEntries(Object.entries(errors).map(([field, messages]) => [field, messages[0]])));
      } else {
        setError(requestError?.response?.data?.message || t(resetting ? "auth.resetPasswordError" : "auth.forgotPasswordError"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="user-login">
      <section className="user-login__card" aria-labelledby="password-recovery-title">
        <div className="user-login__intro">
          <h1 id="password-recovery-title">
            {t(resetting ? "auth.resetPasswordTitle" : "auth.forgotPasswordTitle")}
          </h1>
          <p>{t(resetting ? "auth.resetPasswordDetail" : "auth.forgotPasswordDetail")}</p>
        </div>

        <form className="user-login__form" onSubmit={submit}>
          <label htmlFor="password-recovery-email">
            <span>Email</span>
            <input
              id="password-recovery-email"
              type="email"
              name="email"
              autoComplete="email"
              maxLength={255}
              value={form.email}
              onChange={update}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "password-recovery-email-error" : undefined}
              required
            />
            {fieldErrors.email && <small id="password-recovery-email-error" className="user-login__field-error" role="alert">{fieldErrors.email}</small>}
          </label>

          {resetting && (
            <>
              <div className="user-login__field">
                <label htmlFor="password-recovery-password">
                  <span>{t("auth.newPassword")}</span>
                </label>
                <input
                  id="password-recovery-password"
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={update}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? "password-recovery-hint password-recovery-password-error" : "password-recovery-hint"}
                  required
                />
                <small id="password-recovery-hint" className="user-login__hint">
                  {t("auth.passwordHint")}
                </small>
                {fieldErrors.password && <small id="password-recovery-password-error" className="user-login__field-error" role="alert">{fieldErrors.password}</small>}
              </div>
              <label htmlFor="password-recovery-confirmation">
                <span>{t("auth.passwordConfirmation")}</span>
                <input
                  id="password-recovery-confirmation"
                  type="password"
                  name="password_confirmation"
                  autoComplete="new-password"
                  value={form.password_confirmation}
                  onChange={update}
                  aria-invalid={Boolean(fieldErrors.password_confirmation)}
                  aria-describedby={fieldErrors.password_confirmation ? "password-recovery-confirmation-error" : undefined}
                  required
                />
                {fieldErrors.password_confirmation && <small id="password-recovery-confirmation-error" className="user-login__field-error" role="alert">{fieldErrors.password_confirmation}</small>}
              </label>
            </>
          )}

          {error && <p className="user-login__error" role="alert">{error}</p>}
          {message && <p className="user-login__status" role="status" aria-live="polite">{message}</p>}

          <button className="user-login__submit" type="submit" disabled={loading || (resetting && !token)}>
            {loading
              ? t("auth.loading")
              : t(resetting ? "auth.resetPasswordButton" : "auth.sendResetLink")}
          </button>
        </form>

        <div className="user-login__links">
          <Link className="user-login__back" to={ROUTERS.USER.LOGIN}>
            {t("auth.backToLogin")}
          </Link>
        </div>
      </section>
    </main>
  );
}

export default memo(PasswordRecoveryPage);

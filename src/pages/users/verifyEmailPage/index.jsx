import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiCheck, FiMail, FiRefreshCw, FiShield } from "react-icons/fi";
import {
  getEmailVerificationStatusAPI,
  resendEmailVerificationAPI,
} from "api/auth";
import AuthBrand from "component/AuthBrand";
import { ROUTERS } from "utils/router";
import "./style.scss";

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [verified, setVerified] = useState(searchParams.get("status") === "success");
  const [message, setMessage] = useState(
    location.state?.verificationEmailUnavailable
      ? t("auth.verificationError")
      : ""
  );
  const [messageType, setMessageType] = useState(
    location.state?.verificationEmailUnavailable ? "error" : ""
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getEmailVerificationStatusAPI()
      .then((response) => setVerified(Boolean(response.email_verified)))
      .catch(() => {});
  }, []);

  const resend = async () => {
    setLoading(true);
    setMessage("");
    setMessageType("");
    try {
      const response = await resendEmailVerificationAPI();
      setVerified(Boolean(response.email_verified));
      setMessage(response.message || t("auth.verificationSent"));
      setMessageType("success");
    } catch (error) {
      setMessage(error?.response?.data?.message || t("auth.verificationError"));
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="verify-email">
      <section className="verify-email__card" aria-labelledby="verify-email-title">
        <div className="verify-email__brand">
          <AuthBrand />
        </div>

        <div className={`verify-email__icon${verified ? " verify-email__icon--success" : ""}`} aria-hidden="true">
          {verified ? <FiCheck /> : <FiMail />}
        </div>

        <div className="verify-email__heading">
          <span><FiShield aria-hidden="true" /> {t("auth.accountSecurity")}</span>
          <h1 id="verify-email-title">
            {verified ? t("auth.verificationSuccess") : t("auth.verifyEmailTitle")}
          </h1>
          <p>{verified ? t("auth.verificationSuccessDetail") : t("auth.verifyEmailDetail")}</p>
        </div>

        {message && (
          <p
            className={`verify-email__message verify-email__message--${messageType}`}
            role={messageType === "error" ? "alert" : "status"}
            aria-live="polite"
          >
            {message}
          </p>
        )}

        <div className="verify-email__actions">
          {!verified && (
            <button type="button" onClick={resend} disabled={loading}>
              <FiRefreshCw aria-hidden="true" />
              {loading ? t("common.loading") : t("auth.resendVerification")}
            </button>
          )}
          <Link to={ROUTERS.USER.HOME}>
            {verified ? t("navbar.home") : t("auth.continueShopping")}
          </Link>
        </div>

        {!verified && <p className="verify-email__tip">{t("auth.verificationInboxTip")}</p>}
      </section>
    </main>
  );
}

import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiCheck, FiMail, FiRefreshCw, FiShield } from "react-icons/fi";
import { useDispatch } from "react-redux";
import {
  getMeAPI,
  getEmailVerificationStatusAPI,
  resendEmailVerificationAPI,
} from "api/auth";
import AuthBrand from "component/AuthBrand";
import { clearAuth, setAuthenticatedUser } from "../../../redux/authSlice";
import { ROUTERS } from "utils/router";
import "./style.scss";

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const verificationSucceeded = searchParams.get("status") === "success";
  const [verified, setVerified] = useState(verificationSucceeded);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [message, setMessage] = useState(
    location.state?.verificationEmailUnavailable
      ? t("auth.verificationError")
      : ""
  );
  const [messageType, setMessageType] = useState(
    location.state?.verificationEmailUnavailable ? "error" : ""
  );
  const [loading, setLoading] = useState(false);

  const restoreVerifiedCustomer = useCallback(async () => {
    const response = await getMeAPI();
    dispatch(setAuthenticatedUser(response.user || response));
  }, [dispatch]);

  useEffect(() => {
    getEmailVerificationStatusAPI()
      .then(async (response) => {
        const isVerified = Boolean(response.email_verified);
        setVerified(isVerified);
        if (isVerified) {
          await restoreVerifiedCustomer();
        }
      })
      .catch((error) => {
        if (error?.response?.status === 401 && !verificationSucceeded) {
          dispatch(clearAuth());
          setSessionExpired(true);
        }
      });
  }, [dispatch, restoreVerifiedCustomer, verificationSucceeded]);

  const resend = async () => {
    setLoading(true);
    setMessage("");
    setMessageType("");
    try {
      const response = await resendEmailVerificationAPI();
      const isVerified = Boolean(response.email_verified);
      setVerified(isVerified);
      if (isVerified) {
        await restoreVerifiedCustomer();
      }
      setMessage(response.message || t("auth.verificationSent"));
      setMessageType("success");
    } catch (error) {
      if (error?.response?.status === 401) {
        dispatch(clearAuth());
        setSessionExpired(true);
        return;
      }
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
            {verified
              ? t("auth.verificationSuccess")
              : sessionExpired
                ? t("auth.verificationSessionExpired")
                : t("auth.verifyEmailTitle")}
          </h1>
          <p>
            {verified
              ? t("auth.verificationSuccessDetail")
              : sessionExpired
                ? t("auth.verificationSessionExpiredDetail")
                : t("auth.verifyEmailDetail")}
          </p>
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
          {!verified && !sessionExpired && (
            <button type="button" onClick={resend} disabled={loading}>
              <FiRefreshCw aria-hidden="true" />
              {loading ? t("common.loading") : t("auth.resendVerification")}
            </button>
          )}
          <Link to={sessionExpired ? ROUTERS.USER.LOGIN : ROUTERS.USER.HOME}>
            {sessionExpired
              ? t("auth.backToLogin")
              : verified
                ? t("navbar.home")
                : t("auth.continueShopping")}
          </Link>
        </div>

        {!verified && !sessionExpired && (
          <p className="verify-email__tip">{t("auth.verificationInboxTip")}</p>
        )}
      </section>
    </main>
  );
}

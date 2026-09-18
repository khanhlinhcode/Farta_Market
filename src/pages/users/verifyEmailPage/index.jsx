import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  getEmailVerificationStatusAPI,
  resendEmailVerificationAPI,
} from "api/auth";
import { ROUTERS } from "utils/router";
import "./style.scss";

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [verified, setVerified] = useState(searchParams.get("status") === "success");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getEmailVerificationStatusAPI()
      .then((response) => setVerified(Boolean(response.email_verified)))
      .catch(() => {});
  }, []);

  const resend = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await resendEmailVerificationAPI();
      setVerified(Boolean(response.email_verified));
      setMessage(response.message || t("auth.verificationSent"));
    } catch (error) {
      setMessage(error?.response?.data?.message || t("auth.verificationError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="verify-email">
      <section className="verify-email__card">
        <h1>{verified ? t("auth.verificationSuccess") : t("auth.verifyEmailTitle")}</h1>
        <p>{verified ? t("auth.verificationSuccessDetail") : t("auth.verifyEmailDetail")}</p>
        {message && <p role="status">{message}</p>}
        {!verified && (
          <button type="button" onClick={resend} disabled={loading}>
            {loading ? t("common.loading") : t("auth.resendVerification")}
          </button>
        )}
        <Link to={verified ? ROUTERS.USER.HOME : ROUTERS.USER.LOGIN}>
          {verified ? t("navbar.home") : t("auth.loginTitle")}
        </Link>
      </section>
    </main>
  );
}

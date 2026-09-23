import { memo } from "react";
import { useTranslation } from "react-i18next";
import { FiShoppingBag } from "react-icons/fi";
import { Link } from "react-router-dom";
import { ROUTERS } from "utils/router";
import "./style.scss";

function AuthBrand() {
  const { t } = useTranslation();

  return (
    <Link className="auth-brand" to={ROUTERS.USER.HOME} aria-label={t("auth.brandHomeLabel")}>
      <span className="auth-brand__mark" aria-hidden="true">
        <FiShoppingBag />
      </span>
      <span className="auth-brand__copy">
        <strong>Farta Market</strong>
        <small>{t("auth.brandTagline")}</small>
      </span>
    </Link>
  );
}

export default memo(AuthBrand);

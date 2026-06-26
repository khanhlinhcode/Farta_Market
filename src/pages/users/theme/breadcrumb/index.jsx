import { memo } from "react";
import "./style.scss";
import { Link } from "react-router-dom";
import { ROUTERS } from "utils/router";
import { useTranslation } from "react-i18next";
const Breadcrumb = (props) => {
  const { t } = useTranslation();

  return (
    <div className="breadcrumb">
      <div className="breadcrumb__text">
        <h2>{t("brand.name")}</h2>
        <div className="breadcrumb__option">
          <ul>
            <li className="link">
              <Link to={ROUTERS.USER.HOME}>{t("navbar.home")}</Link>
            </li>
            <li>{props.name}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
export default memo(Breadcrumb);

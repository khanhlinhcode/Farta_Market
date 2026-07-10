import { memo } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import Button from "../Button";
import "./style.scss";

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  const { t } = useTranslation();

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
      <div className="confirm-modal__backdrop" onClick={onCancel} />
      <div className="confirm-modal__content">
        <h2 id="confirm-modal-title">{title || t("confirm.title")}</h2>
        <p>{message || t("confirm.message")}</p>
        <div className="confirm-modal__actions">
          <Button type="button" variant="ghost" className="confirm-modal__button" onClick={onCancel}>
            {t("confirm.cancel")}
          </Button>
          <Button type="button" variant="destructive" className="confirm-modal__button" onClick={onConfirm}>
            {t("confirm.confirm")}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default memo(ConfirmModal);

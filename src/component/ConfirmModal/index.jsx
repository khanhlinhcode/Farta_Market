import { memo } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
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
          <button type="button" className="confirm-modal__button confirm-modal__button--ghost" onClick={onCancel}>
            {t("confirm.cancel")}
          </button>
          <button type="button" className="confirm-modal__button confirm-modal__button--danger" onClick={onConfirm}>
            {t("confirm.confirm")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default memo(ConfirmModal);

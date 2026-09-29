import { memo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import "./style.scss";

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  const { t } = useTranslation();
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previous = document.activeElement;
    cancelRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onCancel();
      if (event.key !== "Tab") return;

      const buttons = [...dialogRef.current.querySelectorAll("button:not(:disabled)")];
      if (!buttons.length) return;
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previous?.focus();
    };
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div ref={dialogRef} className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
      <div className="confirm-modal__backdrop" onClick={onCancel} />
      <div className="confirm-modal__content">
        <h2 id="confirm-modal-title">{title || t("confirm.title")}</h2>
        <p>{message || t("confirm.message")}</p>
        <div className="confirm-modal__actions">
          <button ref={cancelRef} type="button" className="confirm-modal__button confirm-modal__button--ghost" onClick={onCancel}>
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

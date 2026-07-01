import { memo, useEffect, useState } from "react";
import { uploadAdminProductImageAPI } from "api/admin";
import { resolveProductImage } from "utils/productImages";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import "./style.scss";

const ImageUpload = ({ productId, value, onUploaded, disabled = false }) => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleFileChange = (event) => {
    setError("");
    setFile(event.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!productId || !file) {
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const response = await uploadAdminProductImageAPI(productId, file);
      onUploaded?.(response.image_url);
      toast.success(t("admin.uploadSuccess"));
      setFile(null);
    } catch (err) {
      const nextError =
        err?.response?.data?.errors?.image?.[0] ||
          err?.response?.data?.message ||
          t("admin.products.uploadError");
      setError(nextError);
      toast.error(nextError);
    } finally {
      setIsUploading(false);
    }
  };

  const imageSrc = previewUrl || (value ? resolveProductImage(value) : "");

  return (
    <div className="image-upload">
      {imageSrc && <img src={imageSrc} alt={t("admin.products.imagePreviewAlt")} />}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={disabled}
      />
      <button
        type="button"
        className="admin-page__button admin-page__button--ghost"
        onClick={handleUpload}
        disabled={disabled || !productId || !file || isUploading}
      >
        {isUploading ? t("admin.products.uploading") : t("admin.products.uploadImage")}
      </button>
      {!productId && <span>{t("admin.products.saveBeforeUpload")}</span>}
      {error && <span className="image-upload__error">{error}</span>}
    </div>
  );
};

export default memo(ImageUpload);

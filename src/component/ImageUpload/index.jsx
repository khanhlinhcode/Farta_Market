import { memo, useEffect, useState } from "react";
import { resolveProductImage } from "utils/productImages";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import "./style.scss";

const ImageUpload = ({
  value,
  multiple = false,
  onUploaded,
  uploadHandler,
  disabled = false,
  uploadText,
  uploadingText,
  saveBeforeUploadText,
  previewAlt,
}) => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const previewFile = Array.isArray(file) ? file[0] : file;

    if (!previewFile) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(previewFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleFileChange = (event) => {
    setError("");
    const files = Array.from(event.target.files || []);
    setFile(multiple ? files : files[0] || null);
  };

  const handleUpload = async () => {
    const selectedFiles = multiple ? file || [] : file ? [file] : [];

    if (!uploadHandler || selectedFiles.length === 0) {
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const response = await uploadHandler(multiple ? selectedFiles : selectedFiles[0]);
      const imageUrl =
        response.image_url ||
        response.avatar_url ||
        response.data?.avatar_url ||
        response.product?.img ||
        response.images?.[0]?.url ||
        value;
      onUploaded?.(imageUrl, response.product || response.data, response);
      toast.success(t("admin.uploadSuccess"));
      setFile(multiple ? [] : null);
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
  const hasFile = multiple ? Boolean(file?.length) : Boolean(file);

  return (
    <div className="image-upload">
      {imageSrc && <img src={imageSrc} alt={previewAlt || t("admin.products.imagePreviewAlt")} />}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        onChange={handleFileChange}
        disabled={disabled || isUploading}
      />
      <button
        type="button"
        className="admin-page__button admin-page__button--ghost"
        onClick={handleUpload}
        disabled={disabled || !uploadHandler || !hasFile || isUploading}
      >
        {isUploading
          ? uploadingText || t("admin.products.uploading")
          : uploadText ||
          (multiple
          ? t("admin.products.uploadImages")
          : t("admin.products.uploadImage"))}
      </button>
      {!uploadHandler && (
        <span>{saveBeforeUploadText || t("admin.products.saveBeforeUpload")}</span>
      )}
      {error && <span className="image-upload__error">{error}</span>}
    </div>
  );
};

export default memo(ImageUpload);

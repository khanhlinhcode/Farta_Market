import { memo, useEffect, useState } from "react";
import {
  deleteAdminProductImageAPI,
  uploadAdminProductImageAPI,
  uploadAdminProductImagesAPI,
} from "api/admin";
import { resolveProductImage } from "utils/productImages";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import "./style.scss";

const ImageUpload = ({
  productId,
  value,
  images = [],
  multiple = false,
  onUploaded,
  onDeleted,
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

    if ((!productId && !uploadHandler) || selectedFiles.length === 0) {
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const response = uploadHandler
        ? await uploadHandler(multiple ? selectedFiles : selectedFiles[0])
        : multiple
        ? await uploadAdminProductImagesAPI(productId, selectedFiles)
        : await uploadAdminProductImageAPI(productId, selectedFiles[0]);
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

  const handleDeleteImage = async (imageId) => {
    if (!imageId || disabled) {
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const response = await deleteAdminProductImageAPI(imageId);
      onDeleted?.(response.product);
      toast.success(t("cart.removed"));
    } catch (err) {
      const nextError = err?.response?.data?.message || t("common.error");
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
        disabled={disabled}
      />
      <button
        type="button"
        className="admin-page__button admin-page__button--ghost"
        onClick={handleUpload}
        disabled={disabled || (!productId && !uploadHandler) || !hasFile || isUploading}
      >
        {isUploading
          ? uploadingText || t("admin.products.uploading")
          : uploadText ||
          (multiple
          ? t("admin.products.uploadImages")
          : t("admin.products.uploadImage"))}
      </button>
      {!productId && !uploadHandler && (
        <span>{saveBeforeUploadText || t("admin.products.saveBeforeUpload")}</span>
      )}
      {multiple && images.length > 0 && (
        <div className="image-upload__gallery">
          {images.map((image) => (
            <div key={image.id}>
              <img
                src={resolveProductImage(image.url || image.path)}
                alt={t("admin.products.imagePreviewAlt")}
              />
              <button
                type="button"
                onClick={() => handleDeleteImage(image.id)}
                disabled={disabled || isUploading}
              >
                {t("admin.products.deleteImage")}
              </button>
            </div>
          ))}
        </div>
      )}
      {error && <span className="image-upload__error">{error}</span>}
    </div>
  );
};

export default memo(ImageUpload);

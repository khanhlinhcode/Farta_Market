import { memo, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import Breadcrumb from "../theme/breadcrumb";
import {
  createAddressAPI,
  deleteAddressAPI,
  getAddressesAPI,
  getProfileAPI,
  setDefaultAddressAPI,
  updateAddressAPI,
  updateProfileAPI,
  updateProfilePasswordAPI,
  uploadProfileAvatarAPI,
} from "api/profile";
import { ConfirmModal, ImageUpload } from "component";
import { ROUTERS } from "utils/router";
import { clearUserSession } from "utils/userAuth";
import {
  clearCustomerUser,
  selectAuthBootstrapped,
  selectCustomerUser,
  setAuthenticatedUser,
} from "../../../redux/authSlice";
import "./style.scss";

const emptyPasswordForm = {
  current_password: "",
  new_password: "",
  new_password_confirmation: "",
};

const emptyAddressForm = {
  label: "",
  recipient_name: "",
  phone: "",
  address_line: "",
  is_default: false,
};

const ProfilePage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCustomerUser);
  const isBootstrapped = useSelector(selectAuthBootstrapped);
  const [activeTab, setActiveTab] = useState("personal");
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [deleteAddressId, setDeleteAddressId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [error, setError] = useState("");

  const isLoggedIn = Boolean(currentUser);

  const createdAt = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(
        i18n.language === "en" ? "en-US" : "vi-VN"
      )
    : "";

  const pendingDeleteAddress = useMemo(
    () => addresses.find((address) => address.id === deleteAddressId),
    [addresses, deleteAddressId]
  );

  const loadProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const [profileData, addressResponse] = await Promise.all([
        getProfileAPI(),
        getAddressesAPI(),
      ]);
      setProfile(profileData);
      setForm({
        name: profileData?.name || "",
        phone: profileData?.phone || "",
      });
      setAddresses(addressResponse?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || t("profile.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isBootstrapped) {
      return;
    }

    if (!isLoggedIn) {
      navigate(
        `${ROUTERS.USER.LOGIN}?redirect=${encodeURIComponent(
          ROUTERS.USER.PROFILE
        )}`,
        { replace: true }
      );
      return;
    }

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBootstrapped, isLoggedIn, navigate]);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const data = await updateProfileAPI(form);
      setProfile(data);
      dispatch(setAuthenticatedUser(data));
      toast.success(t("profile.updateSuccess"));
    } catch (err) {
      const message = err?.response?.data?.message || t("profile.updateError");
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUploaded = (imageUrl, nextProfile) => {
    const profileData = nextProfile || { ...profile, avatar_url: imageUrl };
    setProfile(profileData);
    dispatch(setAuthenticatedUser(profileData));
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (passwordForm.new_password.length < 8) {
      toast.error(t("profile.passwordMin"));
      return;
    }

    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      toast.error(t("profile.passwordMismatch"));
      return;
    }

    setPasswordSaving(true);

    try {
      await updateProfilePasswordAPI(passwordForm);
      toast.success(t("profile.passwordChanged"));
      setPasswordForm(emptyPasswordForm);
      clearUserSession();
      dispatch(clearCustomerUser());
      navigate(ROUTERS.USER.LOGIN, { replace: true });
    } catch (err) {
      const message = err?.response?.data?.message || t("profile.passwordError");
      setError(message);
      toast.error(message);
    } finally {
      setPasswordSaving(false);
    }
  };

  const openAddressModal = (address = null) => {
    setEditingAddress(address);
    setIsAddressModalOpen(true);
    setAddressForm(
      address
        ? {
            label: address.label || "",
            recipient_name: address.recipient_name || "",
            phone: address.phone || "",
            address_line: address.address_line || "",
            is_default: Boolean(address.is_default),
          }
        : emptyAddressForm
    );
  };

  const closeAddressModal = () => {
    setEditingAddress(null);
    setIsAddressModalOpen(false);
    setAddressForm(emptyAddressForm);
  };

  const handleAddressSubmit = async (event) => {
    event.preventDefault();
    setAddressSaving(true);

    try {
      if (editingAddress) {
        await updateAddressAPI(editingAddress.id, addressForm);
        toast.success(t("profile.addressUpdated"));
      } else {
        await createAddressAPI(addressForm);
        toast.success(t("profile.addressCreated"));
      }
      closeAddressModal();
      const response = await getAddressesAPI();
      setAddresses(response?.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || t("common.error"));
    } finally {
      setAddressSaving(false);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await setDefaultAddressAPI(addressId);
      const response = await getAddressesAPI();
      setAddresses(response?.data || []);
      toast.success(t("profile.defaultUpdated"));
    } catch (err) {
      toast.error(err?.response?.data?.message || t("common.error"));
    }
  };

  const handleDeleteAddress = async () => {
    if (!deleteAddressId) {
      return;
    }

    try {
      await deleteAddressAPI(deleteAddressId);
      setAddresses((current) =>
        current.filter((address) => address.id !== deleteAddressId)
      );
      toast.success(t("profile.addressDeleted"));
    } catch (err) {
      toast.error(err?.response?.data?.message || t("common.error"));
    } finally {
      setDeleteAddressId(null);
    }
  };

  return (
    <>
      <Breadcrumb name={t("profile.title")} />
      <main className="profile-page">
        <div className="container">
          <div className="profile-page__header">
            <div>
              <h1>{t("profile.title")}</h1>
              <p>{t("profile.subtitle")}</p>
            </div>
            <div className="profile-page__links">
              <Link to={ROUTERS.USER.MY_ORDERS}>{t("profile.myOrders")}</Link>
              <Link to={ROUTERS.USER.WISHLIST}>{t("profile.wishlist")}</Link>
            </div>
          </div>

          <div className="profile-page__tabs">
            {["personal", "password", "addresses"].map((tab) => (
              <button
                type="button"
                className={activeTab === tab ? "is-active" : ""}
                key={tab}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "personal" && t("profile.personalInfo")}
                {tab === "password" && t("profile.changePassword")}
                {tab === "addresses" && t("profile.addressBook")}
              </button>
            ))}
          </div>

          {loading && <div className="profile-page__state">{t("common.loading")}</div>}
          {error && <div className="profile-page__state is-error">{error}</div>}

          {!loading && profile && activeTab === "personal" && (
            <section className="profile-page__panel">
              <div className="profile-page__personal">
                <div className="profile-page__avatar">
                  <div className="profile-page__avatar-preview">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.name} />
                    ) : (
                      <span>{(profile.name || profile.email || "U").slice(0, 1)}</span>
                    )}
                  </div>
                  <ImageUpload
                    value={profile.avatar_url}
                    uploadHandler={uploadProfileAvatarAPI}
                    onUploaded={handleAvatarUploaded}
                    uploadText={t("profile.uploadAvatar")}
                    uploadingText={t("admin.products.uploading")}
                    previewAlt={t("profile.avatarAlt")}
                  />
                </div>
                <form className="profile-page__form" onSubmit={handleProfileSubmit}>
                  <label>
                    {t("profile.name")}
                    <input
                      name="name"
                      value={form.name}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, name: event.target.value }))
                      }
                      required
                    />
                  </label>
                  <label>
                    {t("profile.phone")}
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, phone: event.target.value }))
                      }
                      placeholder="0901234567"
                    />
                  </label>
                  <label>
                    {t("profile.email")}
                    <input value={profile.email || ""} disabled />
                  </label>
                  <div className="profile-page__summary">
                    <span>{t("profile.createdAt")}</span>
                    <b>{createdAt || t("common.noData")}</b>
                  </div>
                  <button type="submit" disabled={saving}>
                    {saving ? t("common.loading") : t("profile.save")}
                  </button>
                </form>
              </div>
            </section>
          )}

          {!loading && profile && activeTab === "password" && (
            <section className="profile-page__panel profile-page__panel--narrow">
              <h2>{t("profile.changePassword")}</h2>
              <form className="profile-page__form" onSubmit={handlePasswordSubmit}>
                <label>
                  {t("profile.currentPassword")}
                  <input
                    name="current_password"
                    type="password"
                    value={passwordForm.current_password}
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        current_password: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label>
                  {t("profile.newPassword")}
                  <input
                    name="new_password"
                    type="password"
                    value={passwordForm.new_password}
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        new_password: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label>
                  {t("profile.confirmPassword")}
                  <input
                    name="new_password_confirmation"
                    type="password"
                    value={passwordForm.new_password_confirmation}
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        new_password_confirmation: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <button type="submit" disabled={passwordSaving}>
                  {passwordSaving ? t("common.loading") : t("profile.updatePassword")}
                </button>
              </form>
            </section>
          )}

          {!loading && profile && activeTab === "addresses" && (
            <section className="profile-page__panel">
              <div className="profile-page__section-head">
                <h2>{t("profile.addressBook")}</h2>
                <button type="button" onClick={() => openAddressModal()}>
                  {t("profile.addAddress")}
                </button>
              </div>
              <div className="profile-page__address-list">
                {addresses.map((address) => (
                  <article className="profile-page__address-card" key={address.id}>
                    <div>
                      <strong>{address.label}</strong>
                      {address.is_default && (
                        <span>{t("profile.defaultBadge")}</span>
                      )}
                    </div>
                    <p>{address.recipient_name}</p>
                    <p>{address.phone}</p>
                    <p>{address.address_line}</p>
                    <div className="profile-page__address-actions">
                      {!address.is_default && (
                        <button type="button" onClick={() => handleSetDefault(address.id)}>
                          {t("profile.setDefault")}
                        </button>
                      )}
                      <button type="button" onClick={() => openAddressModal(address)}>
                        {t("admin.common.edit")}
                      </button>
                      <button type="button" onClick={() => setDeleteAddressId(address.id)}>
                        {t("admin.common.delete")}
                      </button>
                    </div>
                  </article>
                ))}
                {!addresses.length && (
                  <div className="profile-page__state">{t("profile.addressEmpty")}</div>
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      {isAddressModalOpen ? (
        <div className="profile-page__modal" role="dialog" aria-modal="true">
          <form className="profile-page__address-form" onSubmit={handleAddressSubmit}>
            <h2>
              {editingAddress ? t("profile.editAddress") : t("profile.addAddress")}
            </h2>
            <label>
              {t("profile.addressLabel")}
              <input
                value={addressForm.label}
                onChange={(event) =>
                  setAddressForm((current) => ({ ...current, label: event.target.value }))
                }
                placeholder={t("profile.addressLabelPlaceholder")}
                required
              />
            </label>
            <label>
              {t("profile.recipientName")}
              <input
                value={addressForm.recipient_name}
                onChange={(event) =>
                  setAddressForm((current) => ({
                    ...current,
                    recipient_name: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label>
              {t("profile.phone")}
              <input
                value={addressForm.phone}
                onChange={(event) =>
                  setAddressForm((current) => ({ ...current, phone: event.target.value }))
                }
                required
              />
            </label>
            <label>
              {t("checkout.address")}
              <textarea
                value={addressForm.address_line}
                onChange={(event) =>
                  setAddressForm((current) => ({
                    ...current,
                    address_line: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label className="profile-page__checkbox">
              <input
                type="checkbox"
                checked={addressForm.is_default}
                onChange={(event) =>
                  setAddressForm((current) => ({
                    ...current,
                    is_default: event.target.checked,
                  }))
                }
              />
              {t("profile.defaultBadge")}
            </label>
            <div className="profile-page__modal-actions">
              <button type="button" onClick={closeAddressModal}>
                {t("admin.common.cancel")}
              </button>
              <button type="submit" disabled={addressSaving}>
                {addressSaving ? t("common.loading") : t("admin.common.save")}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <ConfirmModal
        isOpen={Boolean(deleteAddressId)}
        title={t("profile.confirmDeleteAddressTitle")}
        message={t("profile.confirmDeleteAddressMessage", {
          label: pendingDeleteAddress?.label || "",
        })}
        onConfirm={handleDeleteAddress}
        onCancel={() => setDeleteAddressId(null)}
      />
    </>
  );
};

export default memo(ProfilePage);

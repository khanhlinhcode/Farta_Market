import "./style.scss";
import { memo, useEffect, useRef, useState } from "react";
import { formatter } from "utils/fomater";
import Breadcrumb from "../theme/breadcrumb";
import { SESSION_KEYS } from "utils/constant";
import { useMutation } from "@tanstack/react-query";
import { ROUTERS } from "utils/router";
import {
  createVNPayPaymentAPI,
  postOrderAPI,
  validateCouponAPI,
} from "api/orderPage";
import { useNavigate, useSearchParams } from "react-router-dom";
import useShoppingCart from "hooks/useShoppingCart";
import { getSessionItem, setSessionItem } from "utils/session";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { translateProductName } from "utils/i18nLabels";
import { getAddressesAPI, getProfileAPI } from "api/profile";
import { selectCustomerUser } from "../../../redux/authSlice";

const CheckoutPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useShoppingCart();
  const cart = getSessionItem(SESSION_KEYS.CART, {
    products: [],
    totalPrice: 0,
    totalQuantity: 0,
  });

  const [orderError, setOrderError] = useState("");
  const idempotencyKeyRef = useRef(
    globalThis.crypto?.randomUUID?.() ||
      `order-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

  const { mutate: submitOrder, isPending } = useMutation({
    mutationFn: ({ payload, idempotencyKey, paymentMethod }) =>
      paymentMethod === "vnpay"
        ? createVNPayPaymentAPI(payload, idempotencyKey)
        : postOrderAPI(payload, idempotencyKey),
    onSuccess: (response, variables) => {
      const order = response?.data;

      if (variables.paymentMethod === "vnpay") {
        setSessionItem(SESSION_KEYS.LAST_ORDER_SUCCESS, order);
        window.location.href = response.payment_url;
        return;
      }

      toast.success(t("order.success"));
      setSessionItem(SESSION_KEYS.LAST_ORDER_SUCCESS, order);
      clearCart();
      navigate(`${ROUTERS.USER.ORDER_SUCCESS}?orderId=${order?.id || ""}`, {
        state: { order },
      });
    },
    onError: (err) => {
      setOrderError(
        err?.response?.data?.message || t("checkout.orderError")
      );
      toast.error(t("common.error"));
    },
  });

  //   || {
  //   product: [],
  //   totalPrice: 0,
  //   totalQuantity: 0,
  // };

  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [useManualAddress, setUseManualAddress] = useState(false);
  const currentUser = useSelector(selectCustomerUser);
  const isLoggedIn = Boolean(currentUser);
  const subtotal = Number(cart.totalPrice || 0);
  const shippingFee = subtotal > 0 && subtotal < 200000 ? 20000 : 0;
  const grandTotal = subtotal + shippingFee;
  const finalTotal = Math.max(grandTotal - couponDiscount, 0);

  const [errors, setErrors] = useState({
    fullName: "",
    address: "",
    phone: "",
    email: "",
    note: "",
    paymentMethod: "",
  });

  useEffect(() => {
    if (searchParams.get("error") === "payment_failed") {
      setOrderError(t("checkout.paymentFailed"));
      toast.error(t("checkout.paymentFailed"));
    }
  }, [searchParams, t]);

  const applySavedAddress = (savedAddress, profile = {}) => {
    if (!savedAddress) {
      return;
    }

    setSelectedAddressId(String(savedAddress.id));
    setUseManualAddress(false);
    setFullName(savedAddress.recipient_name || profile?.name || "");
    setPhone(savedAddress.phone || profile?.phone || "");
    setAddress(savedAddress.address_line || profile?.default_address || "");
  };

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    const loadProfile = async () => {
      try {
        const [profile, addressResponse] = await Promise.all([
          getProfileAPI(),
          getAddressesAPI().catch(() => ({ data: [] })),
        ]);
        const addresses = addressResponse?.data || [];
        const defaultAddress =
          addresses.find((item) => item.is_default) || addresses[0];

        setSavedAddresses(addresses);
        setFullName((current) => current || profile?.name || "");
        setPhone((current) => current || profile?.phone || "");
        setEmail((current) => current || profile?.email || "");

        if (defaultAddress) {
          setSelectedAddressId(String(defaultAddress.id));
          setFullName((current) =>
            current || defaultAddress.recipient_name || profile?.name || ""
          );
          setPhone((current) =>
            current || defaultAddress.phone || profile?.phone || ""
          );
          setAddress((current) =>
            current || defaultAddress.address_line || profile?.default_address || ""
          );
        } else {
          setAddress((current) => current || profile?.default_address || "");
        }
      } catch (err) {
        // Keep checkout usable if the profile request fails.
      }
    };

    loadProfile();
  }, [isLoggedIn]);

  const handleSavedAddressChange = (event) => {
    const nextAddress = savedAddresses.find(
      (item) => String(item.id) === event.target.value
    );
    applySavedAddress(nextAddress);
  };

  const handleCouponChange = (event) => {
    const nextCode = event.target.value;
    setCouponCode(nextCode);
    setCouponError("");

    if (appliedCouponCode && nextCode.trim().toUpperCase() !== appliedCouponCode) {
      setAppliedCouponCode("");
      setCouponDiscount(0);
      setCouponMessage("");
    }
  };

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();

    setCouponError("");
    setCouponMessage("");

    if (!code) {
      setCouponError(t("checkout.couponRequired"));
      return;
    }

    if (!isLoggedIn) {
      setCouponError(t("checkout.loginForCoupon"));
      return;
    }

    setIsApplyingCoupon(true);

    try {
      const response = await validateCouponAPI({
        code,
        order_amount: subtotal,
      });
      setAppliedCouponCode(code);
      setCouponDiscount(Number(response.discount_amount || 0));
      setCouponMessage(response.message || t("checkout.couponApplied"));
    } catch (err) {
      setAppliedCouponCode("");
      setCouponDiscount(0);
      setCouponError(err?.response?.data?.message || t("checkout.couponInvalid"));
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const validateForm = () => {
    const newErrors = {
      fullName: "",
      address: "",
      phone: "",
      email: "",
      note: "",
      paymentMethod: "",
    };
    let isValid = true;

    if (!fullName) {
      newErrors.fullName = t("checkout.validation.fullNameRequired");
      isValid = false;
    }
    if (!address) {
      newErrors.address = t("checkout.validation.addressRequired");
      isValid = false;
    } else if (address.trim().length < 10) {
      newErrors.address = t("checkout.validation.addressMinLength");
      isValid = false;
    }
    if (!phone) {
      newErrors.phone = t("checkout.validation.phoneRequired");
      isValid = false;
    } else if (!/^[0-9]{10,11}$/.test(phone)) {
      newErrors.phone = t("checkout.validation.phoneInvalid");
      isValid = false;
    }
    if (!email) {
      newErrors.email = t("checkout.validation.emailRequired");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t("checkout.validation.emailInvalid");
      isValid = false;
    }
    if (!isValid) {
      setErrors(newErrors);
      return false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setOrderError("");

    if (!cart.products.length) {
      setOrderError(t("checkout.emptyCart"));
      return;
    }

    if (validateForm()) {
      if (
        paymentMethod === "vnpay" &&
        !isLoggedIn
      ) {
        setOrderError(t("checkout.loginForVnpay"));
        navigate(
          `${ROUTERS.USER.LOGIN}?redirect=${encodeURIComponent(
            ROUTERS.USER.CHECKOUT
          )}`
        );
        return;
      }

      submitOrder({
        idempotencyKey: idempotencyKeyRef.current,
        paymentMethod,
        payload: {
          fullname: fullName,
          customer_name: fullName,
          address,
          phone,
          customer_phone: phone,
          email,
          note,
          payment_method: paymentMethod,
          coupon_code: appliedCouponCode || undefined,
          products: cart.products.map(({ product, quantity }) => ({
            product_id: product.id,
            quantity,
          })),
        },
      });
      setErrors({
        fullName: "",
        address: "",
        phone: "",
        email: "",
      });
    }
  };

  return (
    <>
      <Breadcrumb name={t("checkout.title")} />
      <div className="container">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-lg-6 col-md-12 col-sm-12 col-xs-12">
              {savedAddresses.length > 0 && (
                <div className="checkout__saved-address">
                  {!useManualAddress ? (
                    <>
                      <label htmlFor="saved-address">
                        {t("checkout.savedAddress")}
                      </label>
                      <div>
                        <select
                          id="saved-address"
                          value={selectedAddressId}
                          onChange={handleSavedAddressChange}
                        >
                          {savedAddresses.map((savedAddress) => (
                            <option key={savedAddress.id} value={savedAddress.id}>
                              {savedAddress.label} - {savedAddress.address_line}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setUseManualAddress(true)}
                        >
                          {t("checkout.enterDifferentAddress")}
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const selectedAddress = savedAddresses.find(
                          (item) => String(item.id) === selectedAddressId
                        );
                        applySavedAddress(selectedAddress || savedAddresses[0]);
                      }}
                    >
                      {t("checkout.useSavedAddress")}
                    </button>
                  )}
                </div>
              )}
              <div className="checkout__input">
                <label htmlFor="">
                  {t("checkout.fullName")}: <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="customer_name"
                  placeholder={t("checkout.fullNamePlaceholder")}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                {errors.fullName && (
                  <span className="error">{errors.fullName}</span>
                )}
              </div>
              <div className="checkout__input">
                <label htmlFor="">
                  {t("checkout.address")}: <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder={t("checkout.addressPlaceholder")}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                {errors.address && (
                  <span className="error">{errors.address}</span>
                )}
              </div>
              <div className="checkout__input__group">
                <div className="checkout__input">
                  <label htmlFor="">
                    {t("checkout.phone")}: <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="customer_phone"
                    placeholder={t("checkout.phonePlaceholder")}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  {errors.phone && (
                    <span className="error">{errors.phone}</span>
                  )}
                </div>
                <div className="checkout__input">
                  <label htmlFor="">
                    {t("checkout.email")}: <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="email"
                    placeholder={t("checkout.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.email && (
                    <span className="error">{errors.email}</span>
                  )}
                </div>
              </div>
              <div className="checkout__input">
                <label htmlFor="">{t("checkout.note")}:</label>
                <textarea
                  name="note"
                  rows={15}
                  placeholder={t("checkout.notePlaceholder")}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                {errors.note && <span className="error">{errors.note}</span>}
              </div>
            </div>
            <div className="col-lg-6 col-md-12 col-sm-12 col-xs-12">
              <div className="checkout__order">
                <h3>{t("checkout.order")}</h3>
                <ul>
                  {cart.products.map(({ product, quantity }) => (
                    <li key={product.id}>
                      <span>{translateProductName(product, t)}</span>
                      <b>
                        {formatter(product.price)} ({quantity})
                      </b>
                    </li>
                  ))}
                  <li className="checkout__order__subtotal">
                    <span>{t("checkout.subtotal")}</span>
                    <b>{formatter(subtotal)}</b>
                  </li>
                  <li className="checkout__order__subtotal">
                    <span>{t("checkout.shippingFee")}</span>
                    <b>
                      {shippingFee === 0
                        ? t("checkout.freeShipping")
                        : formatter(shippingFee)}
                    </b>
                  </li>
                  {couponDiscount > 0 && (
                    <li className="checkout__order__subtotal checkout__order__subtotal--discount">
                      <span>{t("checkout.discountAmount")}</span>
                      <b>-{formatter(couponDiscount)}</b>
                    </li>
                  )}
                  <li className="checkout__order__subtotal checkout__order__subtotal--grand">
                    <h3>{t("checkout.grandTotal")}</h3>
                    <b>{formatter(finalTotal)}</b>
                  </li>
                </ul>
                <div className="checkout__coupon">
                  <label htmlFor="coupon-code">{t("checkout.couponCode")}</label>
                  <div className="checkout__coupon-row">
                    <input
                      id="coupon-code"
                      value={couponCode}
                      onChange={handleCouponChange}
                      placeholder={t("checkout.couponPlaceholder")}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || subtotal <= 0}
                    >
                      {isApplyingCoupon ? t("common.loading") : t("cart.apply")}
                    </button>
                  </div>
                  {couponMessage && (
                    <span className="checkout__coupon-success">
                      {couponMessage}
                    </span>
                  )}
                  {couponError && (
                    <span className="checkout__coupon-error">{couponError}</span>
                  )}
                </div>
                <div className="checkout__payment-method">
                  <h4>{t("checkout.paymentMethod")}</h4>
                  <label>
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(event) => setPaymentMethod(event.target.value)}
                    />
                    <span>
                      <b>{t("checkout.paymentMethods.cod")}</b>
                      <small>{t("checkout.paymentDescriptions.cod")}</small>
                    </span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="payment_method"
                      value="vnpay"
                      checked={paymentMethod === "vnpay"}
                      onChange={(event) => setPaymentMethod(event.target.value)}
                    />
                    <span>
                      <b>{t("checkout.paymentMethods.vnpay")}</b>
                      <small>{t("checkout.paymentDescriptions.vnpay")}</small>
                    </span>
                  </label>
                </div>
                {orderError && <span className="error">{orderError}</span>}
                <button
                  type="submit"
                  className="button-submit"
                  data-testid="place-order"
                  disabled={isPending}
                >
                  {isPending && <span className="checkout-spinner" aria-hidden="true" />}
                  <span>
                    {isPending
                      ? t("checkout.placing")
                      : paymentMethod === "vnpay"
                      ? t("checkout.payWithVnpay")
                      : t("checkout.placeOrder")}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};
export default memo(CheckoutPage);

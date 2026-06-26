import "./style.scss";
import { memo, useRef, useState } from "react";
import { formatter } from "utils/fomater";
import Breadcrumb from "../theme/breadcrumb";
import { SESSION_KEYS } from "utils/constant";
import { useMutation } from "@tanstack/react-query";
import { ROUTERS } from "utils/router";
import { postOrderAPI } from "api/orderPage";
import { useNavigate } from "react-router-dom";
import useShoppingCart from "hooks/useShoppingCart";
import { getSessionItem } from "utils/session";
import { useTranslation } from "react-i18next";

const CheckoutPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  const { mutate: postOrder, isPending } = useMutation({
    mutationFn: ({ payload, idempotencyKey }) =>
      postOrderAPI(payload, idempotencyKey),
    onSuccess: () => {
      alert(t("checkout.success"));
      clearCart();
      navigate(ROUTERS.USER.HOME);
    },
    onError: (err) => {
      setOrderError(
        err?.response?.data?.message || t("checkout.orderError")
      );
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
  // const [paymentMethod, setPaymentMethod] = useState("");

  const [errors, setErrors] = useState({
    fullName: "",
    address: "",
    phone: "",
    email: "",
    note: "",
    paymentMethod: "",
  });

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
    // if (!paymentMethod) {
    //   newErrors.paymentMethod = "Vui lòng nhập phương thức thanh toán";
    //   isValid = false;
    // }
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
      postOrder({
        idempotencyKey: idempotencyKeyRef.current,
        payload: {
          fullname: fullName,
          customer_name: fullName,
          address,
          phone,
          customer_phone: phone,
          email,
          note,
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
              <div className="checkout__input">
                <label htmlFor="">
                  {t("checkout.fullName")}: <span className="required">*</span>
                </label>
                <input
                  type="text"
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
                      <span>{product.name}</span>
                      <b>
                        {formatter(product.price)} ({quantity})
                      </b>
                    </li>
                  ))}
                  <li className="checkout__order__subtotal">
                    <h3>{t("checkout.totalOrder")}</h3>
                    <b>{formatter(cart.totalPrice)}</b>
                  </li>
                </ul>
                {orderError && <span className="error">{orderError}</span>}
                <button type="submit" className="button-submit" disabled={isPending}>
                  {isPending && <span className="checkout-spinner" aria-hidden="true" />}
                  <span>
                    {isPending ? t("checkout.placing") : t("checkout.placeOrder")}
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

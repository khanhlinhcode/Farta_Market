import "./style.scss";
import { memo, useState } from "react";
import { formatter } from "utils/fomater";
import Breadcrumb from "../theme/breadcrumb";
import { SESSION_KEYS } from "utils/constant";
import { useMutation } from "@tanstack/react-query";
import { ROUTERS } from "utils/router";
import { postOrderAPI } from "api/orderPage";
import { useNavigate } from "react-router-dom";
import useShoppingCart from "hooks/useShoppingCart";
import { getSessionItem } from "utils/session";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { clearCart } = useShoppingCart();
  const cart = getSessionItem(SESSION_KEYS.CART, {
    products: [],
    totalPrice: 0,
    totalQuantity: 0,
  });

  const [orderError, setOrderError] = useState("");

  const { mutate: postOrder, isPending } = useMutation({
    mutationFn: postOrderAPI,
    onSuccess: () => {
      alert("Đặt hàng thành công");
      clearCart();
      navigate(ROUTERS.USER.HOME);
    },
    onError: (err) => {
      setOrderError(
        err?.response?.data?.message || "Không đặt được hàng, vui lòng thử lại."
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
      newErrors.fullName = "Vui lòng nhập họ và tên";
      isValid = false;
    }
    if (!address) {
      newErrors.address = "Vui lòng nhập địa chỉ";
      isValid = false;
    }
    if (!phone) {
      newErrors.phone = "Vui lòng nhập sđt";
      isValid = false;
    } else if (!/^[0-9]+$/.test(phone)) {
      newErrors.phone = "Số điện thoại chỉ được chứa số";
      isValid = false;
    }
    if (!email) {
      newErrors.email = "Vui lòng nhập email";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email không hợp lệ";
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
      setOrderError("Giỏ hàng đang trống.");
      return;
    }

    if (validateForm()) {
      postOrder({
        fullname: fullName,
        address,
        phone,
        email,
        note,
        products: cart.products.map(({ product, quantity }) => ({
          product_id: product.id,
          quantity,
        })),
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
      <Breadcrumb name="Thanh Toán" />
      <div className="container">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-lg-6 col-md-12 col-sm-12 col-xs-12">
              <div className="checkout__input">
                <label htmlFor="">
                  Họ và Tên: <span className="required">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nhập họ tên"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                {errors.fullName && (
                  <span className="error">{errors.fullName}</span>
                )}
              </div>
              <div className="checkout__input">
                <label htmlFor="">
                  Địa Chỉ: <span className="required">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nhập địa chỉ"
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
                    Điện Thoại: <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập số điện thoại"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  {errors.phone && (
                    <span className="error">{errors.phone}</span>
                  )}
                </div>
                <div className="checkout__input">
                  <label htmlFor="">
                    Email: <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.email && (
                    <span className="error">{errors.email}</span>
                  )}
                </div>
              </div>
              <div className="checkout__input">
                <label htmlFor="">Ghi Chú:</label>
                <textarea
                  rows={15}
                  placeholder="Nhập ghi chú"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                {errors.note && <span className="error">{errors.note}</span>}
              </div>
            </div>
            <div className="col-lg-6 col-md-12 col-sm-12 col-xs-12">
              <div className="checkout__order">
                <h3>Don hàng</h3>
                <ul>
                  {cart.products.map(({ product, quantity }) => (
                    <li key={product.id}>
                      <span>{product.name}</span>
                      <b>
                        {formatter(product.price)} ({quantity})
                      </b>
                    </li>
                  ))}
                  <li>
                    <h4>Giảim Giá</h4>
                    <b>SVC783</b>
                  </li>
                  <li className="checkout__order__subtotal">
                    <h3>Tổng Đơn Hàng</h3>
                    <b>{formatter(cart.totalPrice)}</b>
                  </li>
                </ul>
                {orderError && <span className="error">{orderError}</span>}
                <button type="submit" className="button-submit" disabled={isPending}>
                  {isPending ? "Đang đặt hàng..." : "Đặt Hàng"}
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

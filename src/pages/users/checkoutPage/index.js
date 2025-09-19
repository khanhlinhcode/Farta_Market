import { memo } from "react";
import Breadcrumb from "../theme/breadcrumb";
import "./style.scss";
import { formatter } from "utils/fomater";
const CheckoutPage = () => {
  return (
    <>
      <Breadcrumb name="Thanh Toán" />
      <div className="container">
        <div className="row">
          <div className="col-lg-6 col-md-12 col-sm-12 col-xs-12">
            <div className="checkout__input">
              <label htmlFor="">
                Ho va Ten: <span className="required">*</span>
              </label>
              <input type="text" placeholder="Nhập họ tên" />
            </div>
            <div className="checkout__input">
              <label htmlFor="">
                Dia chi: <span className="required">*</span>
              </label>
              <input type="text" placeholder="Nhập địa chỉ" />
            </div>
            <div className="checkout__input__group">
              <div className="checkout__input">
                <label htmlFor="">
                  Dien thoai: <span className="required">*</span>
                </label>
                <input type="text" placeholder="Nhập số điện thoại" />
              </div>
              <div className="checkout__input">
                <label htmlFor="">
                  Email: <span className="required">*</span>
                </label>
                <input type="text" placeholder="Nhập email" />
              </div>
            </div>
            <div className="checkout__input">
              <label htmlFor="">Ghi chu:</label>
              <textarea rows={15} placeholder="Nhập ghi chú" />
            </div>
          </div>
          <div className="col-lg-6 col-md-12 col-sm-12 col-xs-12">
            <div className="checkout__order">
              <h3>Don hàng</h3>
              <ul>
                <li>
                  <span>San Pham 1</span>
                  <b>{formatter(100000)} (2)</b>
                </li>
                <li>
                  <span>San Pham 2</span>
                  <b>{formatter(324000)} (1)</b>
                </li>
                <li>
                  <span>San Pham 3</span>
                  <b>{formatter(55000)} (3)</b>
                </li>
                <li>
                  <span>San Pham 4</span>
                  <b>{formatter(465000)} (2)</b>
                </li>
                <li>
                  <span>San Pham 5</span>
                  <b>{formatter(30000)} (5)</b>
                </li>
                <li>
                  <h4>Giam gia</h4>
                  <b>SVC783</b>
                </li>
                <li className="checkout__order__subtotal">
                  <h3>Tong Don</h3>
                  <b>{formatter(200000)}</b>
                </li>
              </ul>
              <button type="submit" className="button-submit">
                Dat Hang
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default memo(CheckoutPage);

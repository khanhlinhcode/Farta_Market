import { memo } from "react";
import "./style.scss";
import { useNavigate } from "react-router-dom";
import { ROUTERS } from "utils/router";
const LoginAdPage = () => {
  const navigate = useNavigate();
  const hanldeSubmit = (e) => {
    e.preventDefault();
    navigate(ROUTERS.ADMIN.ORDERS);
  };
  return (
    <div className="login">
      <div className="login__container">
        <h2 className="login__title">Truy Cập Hệ Thống Quản Trị</h2>
        {/* form */}
        <form className="login__form" onSubmit={hanldeSubmit}>
          <div className="login__form-group">
            <label htmlFor="username" className="login__label">
              Tên Đăng Nhập
            </label>
            <input type="text" id="username" name="username" required />
          </div>
          <div className="login__form-group">
            <label htmlFor="password" className="login__label">
              Mật Khẩu
            </label>
            <input type="password" id="username" name="password" required />
          </div>
          <button type="submit" className="login__button">
            Đăng Nhập
          </button>
        </form>
      </div>
    </div>
  );
};
export default memo(LoginAdPage);

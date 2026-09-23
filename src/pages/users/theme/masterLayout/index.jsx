import { memo } from "react";
import Header from "../header";
import Footer from "../../../common/footer";
import AnalyticsTracker from "component/AnalyticsTracker";
import "./style.scss";

const MasterLayout = ({ children, className = "", ...props }) => {
  return (
    <div className={`site-shell ${className}`.trim()} {...props}>
      <AnalyticsTracker />
      <Header />
      <div className="site-shell__content">{children}</div>
      <Footer />
    </div>
  );
};
export default memo(MasterLayout);

import { memo } from "react";
import Header from "../header";
import Footer from "../../../common/footer";
import AnalyticsTracker from "component/AnalyticsTracker";

const MasterLayout = ({ children, ...props }) => {
  return (
    <div {...props}>
      <AnalyticsTracker />
      <Header />
      {children}
      <Footer />
    </div>
  );
};
export default memo(MasterLayout);

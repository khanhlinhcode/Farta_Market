import { memo } from "react";
import Header from "../header";
import Footer from "../../../common/footer";

const MasterLayout = ({ children, ...props }) => {
  return (
    <div {...props}>
      <Header />
      {children}
      <Footer />
    </div>
  );
};
export default memo(MasterLayout);

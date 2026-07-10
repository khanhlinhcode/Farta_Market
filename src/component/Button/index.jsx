import { memo } from "react";
import "./style.scss";

const Button = ({
  children,
  className = "",
  iconOnly = false,
  variant = "primary",
  ...props
}) => {
  const classes = [
    "fm-button",
    `fm-button--${variant}`,
    iconOnly ? "fm-button--icon-only" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

export default memo(Button);

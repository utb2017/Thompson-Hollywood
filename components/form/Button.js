import PropTypes from "prop-types";
import { useEffect, useState, useRef } from "react";

Button.propTypes = {
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  text: PropTypes.string,
  className: PropTypes.string,
  type: PropTypes.oneOf(["button", "submit"]),
  variant: PropTypes.oneOf(["primary", "secondary", "auth"]),
};
Button.defaultProps = {
  type: "submit",
  variant: "primary",
};

function Button({
  disabled = false,
  loading = false,
  text,
  className,
  type,
  variant = "primary",
}) {
  const buttonRef = useRef(null);

  /** Button CSS **/
  useEffect(() => {
    const button = ["button-base"];
    if (disabled || loading) button.push("disabled");
    if (className) button.push(className.toString());
    if (variant) button.push(variant.toString());
    else {
     // if (className) button.push(className.toString());
     // if (variant) button.push(variant.toString());
    }
    buttonRef.current.className = button.join(" ");
  }, [disabled, loading, variant, className, buttonRef]);
  
  return (
    <div>
      <button
        type={type}
        className={"button-base"}
        disabled={loading}
        ref={buttonRef}
      >
        {!loading && text}
        {loading && (
          <div className="inline-loading">
            <div className="spinner" />
          </div>
        )}
      </button>
    </div>
  );
}


export default Button;

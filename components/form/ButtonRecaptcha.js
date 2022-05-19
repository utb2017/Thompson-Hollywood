import PropTypes from "prop-types";
import { useEffect, useState, useRef, forwardRef } from "react";


const ButtonRecaptcha = forwardRef(({
  disabled = false,
  loading = false,
  text,
  className,
  type = 'submit',
  variant = "primary",
}, ref ) => {
  //const buttonRef = useRef(null);

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
    ref && (ref.current.className = button.join(" "))
  }, [disabled, loading, variant, className, ref]);
  
  return (

      <button
        type={type}
        className={"button-base"}
        disabled={loading}
        ref={ref}
      >
        {!loading && text}
        {loading && (
          <div className="inline-loading">
            <div className="spinner" />
          </div>
        )}
      </button>
  );
})

ButtonRecaptcha.propTypes = {
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  text: PropTypes.string,
  className: PropTypes.string,
  type: PropTypes.oneOf(["button", "submit"]),
  variant: PropTypes.oneOf(["primary", "secondary", "auth"]),
};
ButtonRecaptcha.defaultProps = {
  type: "submit",
  variant: "primary",
};


export default ButtonRecaptcha;

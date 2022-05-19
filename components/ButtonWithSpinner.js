import PropTypes from "prop-types";
import {
  useEffect,
  useState,
} from "react";


ButtonWithSpinner.propTypes = {
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  text: PropTypes.string,
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit']),
  variant: PropTypes.oneOf(['button-base', 'border-button']),
  onClick: PropTypes.func,
};
ButtonWithSpinner.defaultProps = {
    type:"submit",
    variant:"button-base",
};


function ButtonWithSpinner ({
      disabled = false,
      loading = false,
      text,
      className,
      type,
      variant = "button-base",
      onClick,
      spinnerClass,
    }) {
    const [style, setStyle] = useState("button-base");

/** ButtonWithSpinner CSS **/
useEffect(() => {
    const button = [];
    
    if(variant)button.push(variant.toString()); 
    if(className)button.push(className.toString()); 
    if (disabled || loading) {

        button.push("disabled");

    }
    setStyle(button.join(" "));
}, [disabled, loading, variant]);

    return (

            <button
              type={type}
              className={style}
              disabled={loading}
              onClick={onClick}
          >
            {!loading && text}
            {loading &&
              <div className="inline-loading" >
                  <div className={spinnerClass?`spinner ${spinnerClass}`:"spinner"}  />
                  {/* <span >Loading...</span> */}
              </div>
            }
            </button>
    );
}
ButtonWithSpinner.whyDidYouRender = true


export default ButtonWithSpinner;
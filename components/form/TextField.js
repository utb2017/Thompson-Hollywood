import PropTypes from "prop-types";
import ServerError from "./ServerError";
import {
  useEffect,
  useState,
  useRef
} from "react";



TextField.propTypes = {
  /** Name of the field */
  name: PropTypes.string.isRequired,

  /** HTML autocomplete attribute */
  autoComplete: PropTypes.string,

  /** DefaultValue for non controlled component */
  defaultValue: PropTypes.any,

  /** Disable the text field */
  disabled: PropTypes.bool,

  /** Text of label that will animate when TextField is focused */
  floatingLabelText: PropTypes.string,

  /** Sets width to 100% */
  fullWidth: PropTypes.bool,

  /** Sets width to 162px */
  halfWidth: PropTypes.bool,

  /** FormComponent error for validation */
  hasError: PropTypes.bool,

  /** Helper text will show up in bottom right corner below TextField */
  helperText: PropTypes.string,

  /** Hint text will show up when input is focused and there is no value */
  hintText: PropTypes.string,

  /** Uniq id for input */
  id: PropTypes.string,

  /** Style for input */
  inputStyle: PropTypes.object,

  /** Style for input label */
  labelStyle: PropTypes.object,

  /** Set by FormComponent by default.   */
  isValid: PropTypes.bool,

  /** onFocus callback */
  onFocus: PropTypes.func,

  /** onChange callback */
  onChange: PropTypes.func,

  /** onBlur callback */
  onBlur: PropTypes.func,

  /** onKeyDown callback */
  onKeyDown: PropTypes.func,

  /** Mark the field as required.  */
  required: PropTypes.bool,

  /** Error from server to show ServerError message */
  serverError: PropTypes.string,

  /** Wrapper styles */
  style: PropTypes.object,

  /** Input type ie. 'text', 'email', password, etc..  */
  type: PropTypes.string,

  /** Text to show for validation error  */
  validationErrorText: PropTypes.string,

  /** Value will make TextField a controlled component  */
  value: PropTypes.string,

  /** Snacks theme attributes provided by `Themer` */
  //snacksTheme: defaultTheme,

  /** Any additonal props to add to the element (e.g. data attributes) */
  //elementAttributes: PropTypes.object,
};

function TextField ({
      autoComplete = "on",
      defaultValue = '',
      disabled = false,
      floatingLabelText,
      hasError,
      helperText,
      hintText,
      id,
      inputStyle,
      isValid,
      labelStyle,
      name,
      onBlur,
      onChange,
      onFocus,
      onKeyDown,
      required,
      serverError,
      style,
      type = "text",
      validationErrorText,
    }) 
    {
    const [value, setValue] = useState(defaultValue);
    const [hasFocus, setFocus] = useState(false);
    const labelRef = useRef(null);
    const hintRef = useRef(null);
    const inputRef = useRef(null);
    const errorRef = useRef(null);

    const handleChange = (event) => {
      setValue(event.target.value);
      onChange && onChange(event.target.value);
    };
    const handleFocus = (e) => {
      setFocus(true);
      onFocus && onFocus(e);
    };
    const handleBlur = (e) => {
      setFocus(false);
      onBlur && onBlur(e);
    };
    const handleKeyDown = (e) => {
      onKeyDown && onKeyDown(e);
    };

    /** Floating Label CSS **/
    useEffect(() => {
      const label = ["label"];
      if (value.length || hasFocus) label.push("label-up");
      if (hasError) label.push("label-error");
      else if (disabled) label.push("label-disabled");
      else if (hasFocus) label.push("label-focus");
      labelRef.current.className = label.join(" ");
    }, [hasError, hasFocus, value, disabled, labelRef]);




    /** Hint CSS **/
    useEffect(() => {
      const hint = ["hint"];
      if (hasFocus && !value.length) hint.push("hint-visible");
      hintRef.current.className = hint.join(" ");
    }, [hasFocus, value, hintRef]);



    /** Input CSS **/
    useEffect(() => {
      const input = ["input"];
      if (disabled) input.push("input-disabled");
      else if (hasError) input.push("input-error");
      else if (hasFocus) input.push("input-focus");
      inputRef.current.className = input.join(" ");
    }, [hasError, hasFocus, disabled, inputRef]);


    /** Error CSS **/
    useEffect(() => {
      const error = ["error"];
      if (!isValid) error.push("error-show");
      errorRef.current.className = error.join(" ");
    }, [isValid, errorRef]);

    return (
      <div className="input-container" style={style}>
        {serverError && <ServerError text={serverError} />}
        <div className="input-border">
          <label ref={labelRef} htmlFor={name} className="label" style={labelStyle}>
            {floatingLabelText}
          </label>
          <div ref={hintRef} id={`hint_${name}`} className={"hint"}>
            {hintText}
          </div>
          <input
            ref={inputRef}
            id={id || name}
            name={name}
            type={type}
            aria-invalid={hasError}
            aria-describedby={`hint_${name}`}
            autoComplete={autoComplete}
            placeholder=''
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={"input"}
            disabled={disabled}
            style={inputStyle}
            required={required}
          />
        </div>
        <div
          ref={errorRef}
          aria-live='assertive'
          aria-atomic='true'
          id={`error_${name}`}
          className={"error"}
        >
          {validationErrorText}
        </div>
        {helperText && <div className="helper">{helperText}</div>}
      </div>
    );
}

//TextField.whyDidYouRender = true

export default TextField;

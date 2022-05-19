import PropTypes from "prop-types";
import ServerError from "./ServerError";
import {
  useEffect,
  useState,
  useRef,
  forwardRef
} from "react";

const convertPhone = (v) => {
  let phone = v.replace(/^\+[0-9]/, '');
  phone = phone.replace(/\D/g, '')
  const isNumber = Boolean(parseFloat(phone) == phone)
  const isEmpty = Boolean(v === "")
  const match =  phone.match(/^(\d{1,3})(\d{0,3})(\d{0,4})$/)
  const ifUnderMax = Boolean(phone.length<=10)

  if( !isNumber && !isEmpty){
    return
  } else if(ifUnderMax && match){
    phone = `${match[1]}${match[2] ? '-' : ''}${match[2]}${match[3] ? '-' : ''}${match[3]}`;
  } else if ( isEmpty ) {
    phone = v
  }else{
    phone = v.slice(0, -1)
  }
  if(!phone){
    return ''
  }
  return phone;
}

const PhoneField = ({
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
      type = "tel",
      validationErrorText,
    })  => {
    const [value, setValue] = useState(convertPhone(defaultValue));
    const [hasFocus, setFocus] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const [error, setError] = useState(hasError);
    const [maskValue, setMaskValue] = useState(false);
    const [validationError, setValidationError] = useState(validationErrorText);
    const labelRef = useRef(null);
    const hintRef = useRef(null);
    const inputRef = useRef(null);
    const errorRef = useRef(null);





    const handleChange = (event) => {

      const { value } = event.target
      let phone = convertPhone(value)
      // let phone = value.replace(/\D/g, '')
      // const isNumber = Boolean(parseFloat(phone) == phone)
      // const isEmpty = Boolean(value === "")
      // const match =  phone.match(/^(\d{1,3})(\d{0,3})(\d{0,4})$/)
      // const ifUnderMax = Boolean(phone.length<=10)

      // if( !isNumber && !isEmpty){
      //   return
      // } else if(ifUnderMax && match){
      //   phone = `${match[1]}${match[2] ? '-' : ''}${match[2]}${match[3] ? '-' : ''}${match[3]}`;
      // } else if ( isEmpty ) {
      //   phone = value
      // } else {
      //   phone = maskValue
      // }

      if (value && !hasValue) {
        setHasValue(true)
      } else if (!value && hasValue) {
        setHasValue(false)
      }
      setMaskValue(phone)
      setValue(value)
      onChange && onChange(phone);
    };


    const handleFocus = (e) => {
      setFocus(true);
      onFocus && onFocus(e);
    };
    const handleBlur = (e) => {
      // const { value } = e.target
      // const vl = value.length
      // const incomplete = Boolean(vl>0&&vl<12)
      // let str;
      // if(incomplete){
      //   str = "required*"
      // }
      // setError(Boolean(str))
      // setValidationError(str)
      setFocus(false)
      onBlur && onBlur(e)
    };
    const handleKeyDown = (e) => {
      onKeyDown && onKeyDown(e);
    };

    /** Floating Label CSS **/
    useEffect(() => {
      const label = ["label"];
      if (value.length || hasFocus) label.push("label-up");
      if (hasError || error) label.push("label-error");
      else if (disabled) label.push("label-disabled");
      else if (hasFocus) label.push("label-focus");
      labelRef.current.className = label.join(" ");
    }, [hasError, hasFocus, value, disabled, labelRef, error]);




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
      else if (hasError||error) input.push("input-error");
      else if (hasFocus) input.push("input-focus");
      inputRef.current.className = input.join(" ");
    }, [hasError, hasFocus, disabled, inputRef, error]);


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
            value={maskValue||value}
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
          {validationError}
        </div>
        {helperText && <div className="helper">{helperText}</div>}
      </div>
    );
}

PhoneField.propTypes = {
  /** Name of the field */
  name: PropTypes.string.isRequired,

  /** HTML autocomplete attribute */
  autoComplete: PropTypes.string,

  /** DefaultValue for non controlled component */
  defaultValue: PropTypes.any,

  /** Disable the text field */
  disabled: PropTypes.bool,

  /** Text of label that will animate when PhoneField is focused */
  floatingLabelText: PropTypes.string,

  /** Sets width to 100% */
  fullWidth: PropTypes.bool,

  /** Sets width to 162px */
  halfWidth: PropTypes.bool,

  /** FormComponent error for validation */
  hasError: PropTypes.bool,

  /** Helper text will show up in bottom right corner below PhoneField */
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

  /** Value will make PhoneField a controlled component  */
  value: PropTypes.string,

  /** Snacks theme attributes provided by `Themer` */
  //snacksTheme: defaultTheme,

  /** Any additonal props to add to the element (e.g. data attributes) */
  //elementAttributes: PropTypes.object,
};



export default PhoneField;

import React, { useState, useEffect, useRef } from "react"
import ReactGoogleMapLoader from "react-google-maps-loader"
import ReactGooglePlacesSuggest from "react-google-places-suggest"
import Spinner from "../../components/Buttons/Spinner"
import spacing from "../../styles/spacing"
import { colors } from "../../styles"
import ValidationError from "./ValidationError"
import FloatingLabel from "./FloatingLabel"
import TextFieldHint from "./TextFieldHint"
import ServerError from "./ServerError"
import HelperText from "./HelperText"
import { defaultTheme } from "../../styles/themer/utils"
import { useAuth } from "../../context/authContext"
import { useUser } from "../../context/userContext"
import { polygon, point } from "@turf/helpers"
import booleanPointInPolygon from "@turf/boolean-point-in-polygon"
import { useForm } from "../../context/formContext"
import SVGIcon from "../SVGIcon"

const MY_API_KEY = "AIzaSyA7Csmb-D5XwrDjEIriQc5VeZCMH2qD0bg" // fake

const styles = {
  label: {
    ...spacing.PADDING_X_SM,
    paddingTop: 0,
    paddingBottom: 0,
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
    backgroundColor: "#ffffff",
    ...spacing.PADDING_Y_SM,
  },
  clear: {
    cursor: "auto",
    position: "absolute",
    right:12,
    top:17
  },
  wrapper: {
    cursor: "auto",
    display: "inline-block",
    position: "relative",
    width: "343px",
  },
  inputContainer: {
    borderRadius: "4px",
    position: "relative",
  },
  input: {
    backgroundColor: "#FFF",
    border: `solid 1px ${colors.GRAY_74}`,
    borderRadius: "4px",
    boxSizing: "border-box",
    color: colors.GRAY_20,
    fontSize: "16px",
    height: "56px",
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
    paddingTop: "25px",
    ...spacing.PADDING_X_XS,
    paddingBottom: spacing.XS,
    position: "relative",
    width: "100%",
    WebkitOpacity: 1,
    WebkitTapHighlightColor: "rgba(0,0,0,0)",
  },
  inputDisabled: {
    border: `1px solid ${colors.GRAY_74}`,
    backgroundColor: colors.GRAY_93,
    color: colors.GRAY_46,
    cursor: "not-allowed",
  },
  inputError: {
    border: `1px solid ${colors.RED_700}`,
    backgroundColor: "#FDE6EB",
  },
  fullWidth: {
    width: "100%",
  },
  halfWidth: {
    width: "162px",
  },
}

const getSnackStyles = (snacksTheme) => {
  const { action } = snacksTheme.colors
  return {
    highlight: {
      border: `1px solid ${action}`,
    },
  }
}

const AddressSuggest = ({
  /** Name of the field */
  name = "",
  /** HTML autocomplete attribute */
  autoComplete = "on",
  /** DefaultValue for non controlled component */
  defaultValue = null,
  /** Disable the text field */
  disabled = false,
  /** Text of label that will animate when TextField is focused */
  floatingLabelText = "",
  /** Sets width to 100% */
  fullWidth = false,
  /** Sets width to 162px */
  halfWidth = false,
  /** FormComponent error for validation */
  hasError = false,
  /** Helper text will show up in bottom right corner below TextField */
  helperText = "",
  /** Hint text will show up when input is focused and there is no value */
  hintText = "",
  /** Uniq id for input */
  id = "",
  /** Style for input */
  inputStyle = {},
  /** Style for input label */
  labelStyle = {},
  /** Set by FormComponent by default.   */
  isValid = false,
  /** Mark the field as required.  */
  required = false,
  /** Error from server to show ServerError message */
  serverError = "",
  /** Wrapper styles */
  style = {},
  /** Input type ie. 'text', 'email', password, etc..  */
  type = "text",
  /** Text to show for validation error  */
  validationErrorText = "",
  onSelect,
  onClear
}) => {
  const [state, setState] = useState({
    search: "",
    value: "",
  })

  //const { hasValue } = state
  const { form, setForm, error, setError } = useForm()
  const { fireSettings, zone, setZone } = useUser()
  const snacksStyles = getSnackStyles(defaultTheme)
  const inputId = id
 
  const isFirstRun = useRef(true)
  const [loading, setLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)
  const [search, setSearch] = useState(null)

  //const showHintText = hintText && !hasValue && isFocused 

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }
    if (!disabled) {
      //setForm((oldForm) => ({ ...oldForm, ...{ isFocused: false } }))
      setIsFocused(false)
     // alert('isFocused false 1')
    }
    if (form?.address || form?.search) {
     // setForm((oldForm) => ({ ...oldForm, ...{ isFocused: true } }))
     // alert('isFocused true 2')
      setIsFocused(true)
    }
  }, [disabled, form.address, isFirstRun])

  const handleInputChange = (e) => {
    const eValue = e.target.value

    //const { hasValue } = state
    setSearch(`${eValue||''}`)
    if (e.target.value && !hasValue) {
      setState((prevState) => ({ ...prevState, ...{ hasValue: true } }))
      setHasValue(true)
    } else if (!e.target.value && hasValue) {
      setState((prevState) => ({ ...prevState, ...{ hasValue: false } }))
      setHasValue(false)
    }
    // setForm((oldForm) => ({
    //   ...oldForm,
    //   ...{ search: `${eValue||''}`, address: `${eValue||''}` },
    // }))
  }
  const handleInputFocus = (e) => {
    //setForm((oldForm) => ({ ...oldForm, ...{ isFocused: true } }))
    setIsFocused(true)
    //alert('isFocused true')
  }
// useEffect(() => {
//   alert('isFocused')
//   alert(isFocused)
// }, [isFocused]);


  const handleSelectSuggest = async (geocodedPrediction) => {
    //setLoading(true)
    //alert('drt load')
    const { location } = geocodedPrediction.geometry
    const poly = polygon([zone])
    const coords = [location.lng(), location.lat()]
    const pt = point(coords)
    const inRange = booleanPointInPolygon(pt, poly, { ignoreBoundary: false })
    //alert('isFocused false 2')
    //setIsFocused(false)
    setSearch(null)

    if(!inRange){
      setError((oldError)=>({...oldError, ...{serverError:{code:'range',message:'This address is out of range'}}  }))
      //setError((oldError) => ({...{...oldError}, ...{code:'range', message:'This address is out of range.'}})
    }

    setForm((oldForm) => ({
      ...oldForm,
      ...{
        //search: "",
        address: geocodedPrediction.formatted_address,
        isFocused: false,
        inRange,
        coords,
      },
    }))
    onSelect && onSelect({        
      address: geocodedPrediction.formatted_address,
      inRange,
      coords 
    })
  }
  const handleNoResult = () => {
    //console.log("No results for ", (form?.search||''))
    setLoading(false)
  }
  const handleStatusUpdate = (status) => {
    console.log(status)
   // setLoading(false)
   // alert('drtload false')
  }
  const handleClear = () => {
    onClear && onClear()
  }

  return (
    <ReactGoogleMapLoader
      params={{
        key: MY_API_KEY,
        libraries: "places,geocode",
      }}
      render={(googleMaps) =>
        (googleMaps && zone && !loading) ? (
          <ReactGooglePlacesSuggest
            googleMaps={googleMaps}
            autocompletionRequest={{
              input: `${search||''}`,
              // Optional options
              // https://developers.google.com/maps/documentation/javascript/reference?hl=fr#AutocompletionRequest
            }}
            // Optional props
            onNoResult={handleNoResult}
            onSelectSuggest={handleSelectSuggest}
            onStatusUpdate={handleStatusUpdate}
            textNoResults='My custom no results text' // null or "" if you want to disable the no results item
            customRender={(prediction) => (
              <div className='customWrapper'>
                {prediction ? (
                  <div style={styles.label}>{prediction?.description?prediction?.description?.split(',')[0]:''  }</div>
                ) : (
                  "My custom no results text"
                )}
              </div>
            )}>
            <div
              style={{
                ...styles.wrapper,
                ...(fullWidth && styles.fullWidth),
                ...(halfWidth && styles.halfWidth),
                ...style,
              }}>
              {serverError && !disabled && !isValid && (
                <ServerError text={serverError} />
              )}

              <div style={styles.inputContainer}>
                {floatingLabelText && (
                  <FloatingLabel
                    text={floatingLabelText}
                    float={hasValue || isFocused || form?.address}
                    disabled={disabled}
                    isActive={isFocused}
                    hasError={hasError}
                    htmlFor={inputId}
                    snacksTheme={defaultTheme}
                    style={labelStyle}
                  />
                )}

                {hintText && !form?.address && (
                  <TextFieldHint
                    inputId={`hint_${inputId}`}
                    text={hintText}
                    show={hintText && !hasValue && isFocused }
                    disabled={disabled}
                  />
                )}

                <input
                  value={`${ search || form?.address?.split(',')[0] || ''}`}
                  id={inputId}
                  // defaultValue={
                  //   form?.address !== undefined ? undefined : defaultValue
                  // }
                  disabled={disabled}
                  name={name}
                  type={type}
                  aria-required={required}
                  aria-invalid={hasError}
                  aria-describedby={[
                    hasError ? `error_${inputId}` : null,
                    hintText ? `hint_${inputId}` : null,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{
                    ...styles.input,
                    ...inputStyle,
                    ...(disabled && styles.inputDisabled),
                    ...(!disabled && hasError && styles.inputError),
                    ...(isFocused && snacksStyles.highlight),
                  }}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  autoComplete={autoComplete}
                  placeholder=''
                />


                {( hasValue || form?.address ) && <button onClick={handleClear} style={styles.clear} className='button-base' >
                  <SVGIcon  name='x' />
                </button>}


              </div>

              <ValidationError
                text={validationErrorText}
                show={!isValid && !serverError}
                inputId={inputId}
              />

              <HelperText helperText={helperText} />
            </div>
          </ReactGooglePlacesSuggest>
        ) : (
          <div
            style={{
              width: "100%",
              height: "56px",
              display: "flex",
              marginBottom: "21px",
            }}>
            <Spinner />
          </div>
        )
      }
    />
  )
}
export default AddressSuggest

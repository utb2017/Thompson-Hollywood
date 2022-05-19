import React, { useState, useEffect, useRef, useCallback } from "react"
import TextField from "../components/Forms/TextField"
import ButtonTS from "../components/Buttons/ButtonTS"
import AuthLayout from "../layouts/AuthLayout"
import ServerError from "../components/Forms/ServerError"
import { useUser } from "../context/userContext"
import { withRouter } from "next/router"
//import { normalizeInput } from "../helpers"
// import firebase, { reCaptcha } from "../firebase/clientApp"
import firebase, { 
  updateFirestore, 
  getUserByPhone, 
  deleteAuthUser, 
  mergeFirestore,
  updateFirestoreGroup,
  fireCloud,
  addCredit,
  findAddCustomer
} from "../firebase/clientApp"
import { useAuth } from "../context/authContext"
//import AddressField from "../../components/Forms/AddressField"
import { useRouting } from "../context/routingContext"
import parsePhoneNumber, {
  AsYouType,
} from "libphonenumber-js"


const signinProps = {
  showCrumbs: false,
  title: "Enter number.",
  caption: "Enter you cell number to sign in or create an account.",
}

const SignIn = ({ router }) => {
  const { user, loadingUser } = useUser()
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState('')
  const [disabled, setDisabled] = useState(false)
  const [error, setError] = useState(null)
  const {form, setForm} = useAuth()
  const reCaptchaRef = useRef(null)
  const recaptchaVerifier = useRef(null)
  const recaptchaWidgetId = useRef(null)
  const {setNavLoading} = useRouting()

  useEffect(() => {
    return () => {
      setInput('')
    };
  }, []);

  useEffect(() => {
    if (!loadingUser && user?.photoURL && user?.phoneNumber) {
      // router.push(`/${user?.uid}/`)
    }
  }, [user, loadingUser, router])

  // const reCaptchaMount = useCallback(
  //   (reCaptchaRef) => {
  //     firebase.auth().settings.appVerificationDisabledForTesting = true
  //     recaptchaVerifier.current = new reCaptcha(reCaptchaRef.current, {
  //       size: "invisible",
  //       callback: (response) => {
  //         console.log("🔥reCAPTCHA Solved🔥: " + response)
  //       },
  //     })
  //     recaptchaVerifier.current.render().then((widgetId) => {
  //       console.log("🔥reCAPTCHA Rendered🔥:" + widgetId)
  //       recaptchaWidgetId.current = widgetId
  //     })
  //   },
  //   [reCaptchaRef, recaptchaVerifier, recaptchaWidgetId]
  // )

  // const reCaptchaReset = useCallback(
  //   () =>
  //     recaptchaVerifier.current &&
  //     (recaptchaVerifier.current.clear(),
  //     console.log("🔥reCAPTCHA Reset🔥"),
  //     reCaptchaMount(reCaptchaRef)),
  //   [recaptchaVerifier, reCaptchaRef]
  // )

  // useEffect(() => {
  //   if (reCaptchaRef.current) {
  //     reCaptchaMount(reCaptchaRef)
  //   }
  // }, [reCaptchaRef])


  // useEffect(() => {
  //   return () => {
  //     setForm((oldForm) => ({
  //       ...oldForm,
  //       ...{ phoneNumberMask: null, phoneNumber: null },
  //     }))
  //   };
  // }, []);



  // const handleSubmit = useCallback(async () => {
  //   const appVerifier = recaptchaVerifier.current
  //   const { phoneNumber } = form

  //   if (!phoneNumber || phoneNumber === "" || phoneNumber.length < 10) {
  //     return setError({
  //       code: "TOO_SHORT",
  //       message: "Your number is too short.",
  //     })
  //   }
  //   if (appVerifier === null) {
  //     let code = "reCaptcha/error"
  //     let message = "reCaptcha hasn't loaded. Refresh your page."
  //     const e = { code, message }
  //     return setError(e)
  //   }
  //   setLoading(true)
  //   try {
  //     const confirmationResult = await firebase
  //       .auth()
  //       .signInWithPhoneNumber(`+1${phoneNumber}`, appVerifier)
  //     window.confirmationResult = confirmationResult
  //     const { verificationId } = confirmationResult
  //     if (verificationId) {
  //       setForm((oldForm) => ({...oldForm,...{ confirmationResult }}))
  //       router.push({
  //         pathname: "/user/code",
  //       })
  //     }
  //   } catch (e) {
  //     setError(e)
  //     setLoading(false)
  //     reCaptchaReset()
  //   }
  //   return
  // }, [form, recaptchaVerifier])

  const handleManager = useCallback(async () => {
    setInput(`(706) 615-2562`)
  }, [])

  const handleDriver = useCallback(async () => {
    setInput(`(209) 627-5650`)
  }, [])

  useEffect(() => {
    //alert(input.length)
    if(typeof input === 'string' && input.length){
      const phoneNumber = parsePhoneNumber(input, 'US')
      if(phoneNumber && phoneNumber.isValid()){
        //alert("submit") 
        handleClick()
      }     
    }

  }, [input]);



  const verifyToken = async (token) => {

    try{
      const userCredential = await firebase.auth().signInWithCustomToken(token)
      const user = userCredential.user
      //alert(JSON.stringify(user))
      return user
    }catch(error){
        setLoading(false)
        //alert("Error finding ID")
        setError(error.message)
    }
    
    // .then((userCredential) => {
    //   // Signed in
    //   const user = userCredential.user;
    //   // ...
    // })
    // .catch((error) => {
    //   const errorCode = error.code;
    //   const errorMessage = error.message;
    //   // ...
    // });

    // const phoneNumber = parsePhoneNumber(input, 'US')
    // setLoading(true)
    // try{
    //   const response = await findAddCustomer({phoneNumber:phoneNumber.number})
    //   alert(JSON.stringify(response?.data?.uid))
    //   alert(JSON.stringify(response?.data?.customToken))
    //   return
    //   if(response?.data?.uid){
    //     setCustomerID(response.data.uid)
    //     //setLoading(false)
    //     closeModal()
    //   }else{
    //     setLoading(false)
    //     //alert("Error finding ID")
    //     setError("Error finding ID")
    //   }
    // }catch(error){
    //   setError(error.message)
    //   setLoading(false)
    //   setInput('')
    //   //alert(error.message)
    // }
    
  }


  const handleClick = async () => {
    const phoneNumber = parsePhoneNumber(input, 'US')
    setLoading(true)
    try{
      const response = await findAddCustomer({phoneNumber:phoneNumber.number})
      //alert(JSON.stringify(response?.data?.uid))
      //alert(JSON.stringify(response?.data?.customToken))
      return verifyToken(response?.data?.customToken)
      // if(response?.data?.uid){
      //   setCustomerID(response.data.uid)
      //   //setLoading(false)
      //   closeModal()
      // }else{
      //   setLoading(false)
      //   //alert("Error finding ID")
      //   setError("Error finding ID")
      // }
    }catch(error){
      setError(error.message)
      setLoading(false)
      setInput('')
      //alert(error.message)
    }
    
  }

  const formatPhoneNumber = (value) => {
    if (!value) return ""
    value = value.toString()
    if (value.includes("(") && !value.includes(")")) {
      return value.replace("(", "")
    }
    // if (value.length && value.length > 14) {
    //   return value.slice(0, -1)
    // }
    return new AsYouType("US").input(value)
  }







  return (
    <>
      <AuthLayout {...signinProps}>
        {error && <ServerError text={error.message} />}



        <TextField
              style={{ marginBottom: "16px" }}
              disabled={loading}
              hasError={Boolean(error)}
              validationErrorText={error}
              onFocus={() => setError(null)}
              id='phoneNumber'
              name='phoneNumber'
              type='text'
              floatingLabelText='Enter a new phone number.'
              hintText='Enter phone number.'
              fullWidth
              onChange={({ target: { value } }) =>
                setInput(formatPhoneNumber(value))
              }
              value={input || ""}
              //readOnly={true}
            />
{/* <div style={{display:'flex'}}> */}
  <ButtonTS
            disabled={loading}
            loading={loading}
            onClick={handleManager}
            text='Manager Demo'
            style={{marginBottom:'12px'}}
            //ref={reCaptchaRef}
          /> 
  <ButtonTS
            disabled={loading}
            loading={loading}
            onClick={handleDriver}
            text='Driver Demo'
            //ref={reCaptchaRef}
          /> 
{/* </div> */}


        {/* <TextField
          onFocus={() => error && setError(false)}
          hasError={Boolean(error)}
          id='phoneNumber'
          name='phoneNumber'
          type='tel'
          floatingLabelText='Phone Number'
          hintText='Enter Phone number.'
          disabled={loading}
          fullWidth
          onChange={({ target: { value } }) => {
            const mask = (normalizeInput(value, form.phoneNumber)||null)
            const strip = mask?(mask||value).replace(/[^\d]/g, ""):null
            return setForm((oldForm) => ({
              ...oldForm,
              ...{ phoneNumberMask: mask, phoneNumber: strip },
            }))
          }}
          value={form.phoneNumberMask || ""}
        />
        <Button
          disabled={loading}
          loading={loading}
          onClick={handleSubmit}
          text='Send Code'
          ref={reCaptchaRef}
        /> */}
      </AuthLayout>
    </>
  )
}
export default withRouter(SignIn)

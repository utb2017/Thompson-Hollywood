import { useRouter } from "next/router"
import SVGIcon from "../../components/SVGIcon"
import { useState, useEffect, useCallback } from "react"
import style from "../../styles/page/products/create.module.scss"
import TextField from "../../components/Forms/TextField"
import UserPreview from "../../components/UserPreview"
import { useDispatchModal } from "../../context/modalContext"
import ServerError from "../../components/Forms/ServerError"
import Button from "../../components/Buttons/Button"
import {
  Footer,
  PrimaryPane,
  FormPane,
  SidePane,
  FormInput,
} from "../../components/Console"
import { NotificationManager } from "react-notifications"
import { Upload } from "../../components/Modals"
import { createAuthUser } from "../../firebase/clientApp"
import { useRouting } from "../../context/routingContext"
import { isEmpty } from "../../helpers"
import parsePhoneNumber, { AsYouType } from "libphonenumber-js"
import { useForm } from "../../context/formContext"
import isEqual from "lodash.isequal"

const isEmailValid = (mail) => {
  if (
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
      mail
    )
  ) {
    return true
  }
  return false
}

const CreateUser = () => {
  const router = useRouter()
  const [serverError, setServerError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { modalDispatch, modalState } = useDispatchModal()
  const { setNavLoading } = useRouting()
  const { form, setForm, error, setError } = useForm()

  const defaultForm = {
    displayName: "",
    phoneNumber: "",
    email: "",
    photoURL: "",
  }

  useEffect(() => {
    setNavLoading(false)
    setForm({ ...defaultForm })
    return () => {
      setForm({})
      setError({})
    }
  }, [])

  const openModal = useCallback((component) => {
    modalDispatch({
      type: "MODAL_UPDATE",
      payload: {
        modal: {
          isOpen: true,
          key: [],
          component,
        },
      },
    })
  }, [])
  const editLicense = useCallback(() => {
    const uploadProps = {
      formKey: "photoURL",
      storage: "License",
      label: "Add License",
      imgType: ["jpeg", "jpg", "png", "gif"],
    }
    const component = () => <Upload {...uploadProps} />
    openModal(component)
  }, [])

  const formatPhoneNumber = useCallback((value) => {
    if (!value) return ""
    value = value.toString()
    if (value.includes("(") && !value.includes(")")) {
      return value.replace("(", "")
    }
    if (value.length && value.length > 14) {
      return value.slice(0, -1)
    }
    return new AsYouType("US").input(value)
  }, [])

  const submitForm = useCallback(async () => {
    const _form = { ...form }
    const _error = { ...error }

    if (isEmpty(`${_form?.displayName||''}`)) {
      _error.displayName = "Name required."
      NotificationManager.error(_error.displayName)
      return setError({ ..._error })
    }
    if (isEmpty(`${_form?.phoneNumber||''}`)) {
      _error.phoneNumber = "Phone required."
      NotificationManager.error(_error.phoneNumber)
      return setError({ ..._error })
    }

    const phoneNumber = parsePhoneNumber(`${_form?.phoneNumber || ""}`, `US`)
    if (!phoneNumber || !phoneNumber.isValid()) {
      _error.phoneNumber = "Phone invalid."
      NotificationManager.error(_error.phoneNumber)
      return setError({ ..._error })
    }
    _form.phoneNumber = phoneNumber.format("E.164")

    if (!_form?.email || !isEmailValid(_form?.email)) {
      delete _form.email
    }

    if (!_form?.photoURL) {
      delete _form.photoURL
    }
    setLoading(true)
    try {
      await createAuthUser(_form)
      NotificationManager.success("User created.")
      router.back()
    } catch (error) {
      if (error?.message) {
        setServerError(error?.message)
        NotificationManager.error(error?.message)
      } else {
        NotificationManager.error("An error has occurred.")
      }
      setLoading(false)
    }
  }, [form, error])

  const handleInputChange = (e, v) => {
    setForm({ ...{ ...form }, ...{ [`${e?.target?.name || "error"}`]: v } })
  }

  return (
    <>
      {/* OUTLET */}
      <PrimaryPane id='discounts-create' reverse={false}>
        {/* SETTINGS CONTENT */}
        <FormPane>
          {/* SERVER ERROR */}
          {Boolean(serverError) && <ServerError text={`${serverError}`} />}
          {/* NAME */}
          <FormInput label={"Display Name"} stack={false}>
            <TextField
              hasError={Boolean(error?.displayName)}
              validationErrorText={`${error?.displayName || ""}`}
              onFocus={() => {
                setError({ ...error, displayName: null })
                setServerError(null)
              }}
              id='displayName'
              name='displayName'
              type='text'
              floatingLabelText='Display Name'
              hintText='ex. Jack Herrer'
              fullWidth
              onChange={handleInputChange}
              value={`${form?.displayName || ""}`}
            />
          </FormInput>
          {/**/}
          {/* PHONE */}
          <FormInput label={"Phone"} stack={false}>
            <TextField
              hasError={Boolean(error?.phoneNumber)}
              validationErrorText={`${error?.phoneNumber || ""}`}
              onFocus={() => {
                setError({ ...error, phoneNumber: null })
                setServerError(null)
              }}
              id='phoneNumber'
              name='phoneNumber'
              type='tel'
              floatingLabelText='Phone Number'
              hintText='ex. 555-867-5309  '
              fullWidth
              onChange={({ target: { value } }) => {
                return setForm({
                  ...{ ...form },
                  ...{ phoneNumber: formatPhoneNumber(value || "") },
                })
              }}
              value={`${form?.phoneNumber|| ""}` }
            />
          </FormInput>
          {/**/}
          {/* EMAIL */}
          {/* <FormInput label={"Email"} stack={false}>
            <TextField
              hasError={Boolean(error?.email)}
              validationErrorText={`${error?.email || ""}`}
              onFocus={() => {
                setError({ ...{ ...error }, ...{ email: null } })
                setServerError(null)
              }}
              id='email'
              name='email'
              type='email'
              floatingLabelText='Email'
              hintText='ex. h.jack@gmail.com'
              onChange={handleInputChange}
              value={`${form?.email|| ""}` }
              fullWidth
            />
          </FormInput> */}
          {/**/}
          {/* LICENSE */}
          <FormInput label={"License"} stack={false}>
            <>
              <div className={style["product-image-box"]}>
                {Boolean(form?.photoURL) ? (
                  <img src={form.photoURL} alt={"License"} />
                ) : (
                  <div className='form-image-placeholder'>
                    <SVGIcon name='photo' />
                  </div>
                )}
              </div>
              <div className={style["upload-btn-box"]}>
                <button onClick={editLicense} className={style["image-button"]}>
                  {" "}
                  Upload License{" "}
                </button>
              </div>
            </>
          </FormInput>
        </FormPane>
        {/* SIDE */}
        <SidePane
          style={{ flex: "0 0 254px" }}
          innerStyle={{ alignItems: "center" }}
          title='User Preview'>
          <UserPreview {...{ ...form }} />
        </SidePane>
      </PrimaryPane>
      {/* SUBMIT */}
      <Footer isShowing={true}>
        <Button
          disabled={
            loading || isEmpty(form) || isEqual({ ...form }, { ...defaultForm })
          }
          loading={loading}
          onClick={submitForm}
          text='Create User'
        />
      </Footer>
    </>
  )
}

export default CreateUser

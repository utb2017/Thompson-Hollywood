import React, { useState, useEffect, useCallback, useRef } from "react"
import TextField from "../../components/Forms/TextField"
import AddressField from "../../components/Forms/AddressField"
import RangeError from "../../components/Forms/RangeError"
import Button from "../../components/Buttons/Button"
import AuthLayout from "../../layouts/AuthLayout"
import { useUser } from "../../context/userContext"
import { useAuth } from "../../context/authContext"
import { updateFirestore } from "../../firebase/clientApp"

const signinProps = {
  showCrumbs: true,
  title: "Add your address.",
  caption: "Enter your address to see if your in range.",
  crumbs: ["selected", null],
  callout: <RangeError />,
}
const DisplayName = () => {
  const { user, setUser, } = useUser()
  const [loading, setLoading] = useState(false)
  const {form, setForm, error, setError} = useAuth()

  const handleSubmit = useCallback(async () => {
      const {uid} = user;
      const {displayName} = form;
      setLoading(true)
      try{
       await updateFirestore("users", uid, {displayName})
       setUser({...user, ...{displayName}})
      }catch(e){
        setError(oldErrors=>({...oldErrors,...{address:e}}))
        setLoading(false)
      }
  }, [form, user])

  return (
    <>
      <AuthLayout {...signinProps}>
        <form autocomplete="off">
        <AddressField
            //onFocus={() => error && setError(false)}
            hasError={Boolean(error.address)}
            id='address'
            name='address'
            type='text'
            floatingLabelText='Enter Address'
            hintText='6325 Western St'
            //disabled={loading}
            fullWidth
            //onChange={({ target: { value } }) => setForm((oldForm) => ({...oldForm, ...{ displayName: value } }))}
            value={form.address || ""}
            //style={{marginBottom:"12px"}}
            onChange={({ target: { value } }) => setForm((oldForm) => ({...oldForm, ...{address: value } }))}
            autoComplete='off'
        />
        <div style={{display:"flex"}}>
        <TextField
          //onFocus={() => error && setError(false)}
          //hasError={Boolean(error)}
          id='apt'
          name='apt'
          type='number  '
          floatingLabelText='Apt #'
          hintText='Apt #'
          disabled={loading}
          halfWidth
          onChange={({ target: { value } }) => setForm((oldForm) => ({...oldForm, ...{ aptNumber: value } }))}
          value={form.displayName || ""}
          style={{marginRight:"12px"}}
          autoComplete='off'
        />
        <TextField
          //onFocus={() => error && setError(false)}
          //hasError={Boolean(error)}
          id='doorCode'
          name='doorCode'
          type='number  '
          floatingLabelText='Door Code'
          hintText='Apt #'
          disabled={loading}
          halfWidth
          onChange={({ target: { value } }) => setForm((oldForm) => ({...oldForm, ...{ doorCode: value } }))}
          value={form.displayName || ""}
        />
        </div>
        </form>
        <Button
          disabled={loading}
          loading={loading}
          onClick={handleSubmit}
          text='Submit'
        />
      </AuthLayout>
    </>
  )
}
export default DisplayName

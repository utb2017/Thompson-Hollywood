import React, { useState, useEffect, useCallback } from "react"
import TextField from "../../components/Forms/TextField"
import Button from "../../components/Buttons/Button"
import AuthLayout from "../../layouts/AuthLayout"
import ServerError from "../../components/Forms/ServerError"
import { useUser } from "../../context/userContext"
import { useAuth } from "../../context/authContext"
import { updateFirestore } from "../../firebase/clientApp"

const signinProps = {
  showCrumbs: true,
  title: "Enter name.",
  caption: "Enter full name.",
  crumbs: ["selected", null],
}
const DisplayName = () => {
  const { user, setUser } = useUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const {form, setForm} = useAuth()

  useEffect(()=>{
    console.log("user")
    console.log(user)
  },[user])

  const handleSubmit = useCallback(async () => {
      const {uid} = user;
      const {displayName} = form;
      setLoading(true)
      try{
       await updateFirestore("users", uid, {displayName})
       setUser({...user, ...{displayName}})
      }catch(e){
        setError(e)
        setLoading(false)
      }
  }, [form, user])

  return (
    <>
      <AuthLayout {...signinProps}>
        {error && <ServerError text={error.message} />}
        <TextField
          onFocus={() => error && setError(false)}
          hasError={Boolean(error)}
          id='displayName'
          name='displayName'
          type='text'
          floatingLabelText='Full Name'
          hintText='Enter Full Name.'
          disabled={loading}
          fullWidth
          onChange={({ target: { value } }) => setForm((oldForm) => ({...oldForm, ...{ displayName: value } }))}
          value={form.displayName || ""}
        />
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

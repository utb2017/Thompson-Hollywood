import React, { useState, useCallback, useEffect } from "react"
import TextField from "../../components/Forms/TextField"
import Button from "../../components/Buttons/Button"
import AuthLayout from "../../layouts/AuthLayout"
import ServerError from "../../components/Forms/ServerError"
import { useUser } from "../../context/userContext"
import { withRouter } from "next/router"
import { useAuth } from "../../context/authContext"


const codeProps = {
  showCrumbs: false,
  title: "Enter code.",
  caption: "Enter the code we sent to your phone.",
  href:'/',
  as:'/',
  leftIconName:'arrowLeft',
}

const ConfirmCode = ({ router }) => {
  const { user, loadingUser } = useUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  //const [form, setForm] = useState(defaultForm)
  const {form, setForm} = useAuth()

  const handleSubmit = useCallback(async () => {
    const { code, confirmationResult } = form;
    setLoading(true)
    try{
      await confirmationResult.confirm(code)
    }catch(error){
      setError(error)
      setLoading(false)
    }
    return
  }, [form])

  
  useEffect(() => {
    return () => {
      setForm((oldForm) => ({...oldForm, ...{ code: null, confirmationResult:null } }))
    };
  }, []);


  return (
    <>
      <AuthLayout {...codeProps}>
        {error && <ServerError text={error.message} />}
        <TextField
          onFocus={() => error && setError(false)}
          hasError={Boolean(error)}
          id='phoneCode'
          name='phoneCode'
          type='tel'
          floatingLabelText='Code'
          hintText='Enter Code.'
          disabled={loading}
          fullWidth
          onChange={({ target: { value } }) => setForm((oldForm) => ({...oldForm, ...{ code: value } }))}
          value={form.code || ""}
        />
        <Button
          disabled={loading}
          loading={loading}
          onClick={handleSubmit}
          text='Confirm Code'
        />
      </AuthLayout>
    </>
  )
}
export default withRouter(ConfirmCode)

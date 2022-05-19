import React, {useState, useEffect, useRef, useCallback, useMemo} from 'react'
import TextField from '../../components/form/TextField'
import PhoneField from '../../components/form/PhoneField'
import Button from '../../components/form/Button'
import ButtonRecaptcha from '../../components/form/ButtonRecaptcha'
import Form from '../../components/form/Form'
import AuthFlow from '../../components/layout/AuthFlow'
import {useUser} from '../../context/userContext'
import ServerError from '../../components/form/ServerError'
import AuthFlowContainer from '../../components/AuthFlowContainer'
import firebase, {
  sendCode,
  updateAuth,
  updateFirestore,
  reCaptcha,
  reAuthenticateAuth,
  updateAuthEmail,
  updateAuthPassword,
  updateAuthPhone,
} from '../../firebase/clientApp'

const EMAIL_ERRORS = [
  'auth/email-already-in-use',
  'auth/invalid-email',
  'auth/operation-not-allowed',
  'auth/requires-recent-login',
]
const PASSWORD_ERRORS = ['auth/weak-password', 'auth/wrong-password']
const NAME_ERRORS = ['auth/display-name']
const AUTH_PASSWORD_ERRORS = ['auth/wrong-password']
const NEW_PASSWORD_ERRORS = ['auth/weak-password']
const PHONE_ERRORS = [
  'auth/captcha-check-failed',
  'auth/invalid-phone-number',
  'auth/missing-phone-number',
  'auth/quota-exceeded',
  'auth/user-disabled',
  'auth/operation-not-allowed',
  'phone/length',
  'reCaptcha/error',
]
const CODE_ERRORS = [
  'auth/provider-already-linked',
  'auth/invalid-credential',
  'auth/credential-already-in-use',
  'auth/email-already-in-use',
  'auth/operation-not-allowed',
  'auth/invalid-email',
  'auth/wrong-password',
  'auth/invalid-verification-code',
  'auth/invalid-verification-id',
]
const UPDATE_SUCCESS = 'Your profile was updated successfully.'

const Profile = () => {
  const {setUser, user} = useUser()
  const [codeSent, setCodeSent] = useState(null)

  const [email, setContactEmail] = useState(user?.email)
  const [phoneNumber, setContactPhone] = useState(user?.phoneNumber)
  const [name, setName] = useState(user?.displayName)

  const [profileError, setProfileError] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(false)

  const [emailError, setEmailError] = useState(false)
  const [loadingEmail, setLoadingEmail] = useState(false)

  const [phoneError, setPhoneError] = useState(false)
  const [loadingPhone, setLoadingPhone] = useState(false)
  const [mounted, setMounted] = useState(false)

  const [passwordError, setPasswordError] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)

  const [codeError, setCodeError] = useState(false)
  const [loadingCode, setLoadingCode] = useState(false)

  const flashRef = useRef(null)
  const reCaptchaRef = useRef(null)
  const recaptchaVerifier = useRef(null)
  const recaptchaWidgetId = useRef(null)

  useMemo(() => {
    setContactEmail(user?.email)
    setContactPhone(user?.phoneNumber)
    setName(user?.displayName)
  }, [user])

  useEffect(() => {
   (codeSent === false) && reCaptchaReset()
  }, [codeSent])

  useEffect(() => {
    if (reCaptchaRef.current && !mounted) {
      reCaptchaMount(reCaptchaRef)
      setMounted(true)
    }
  }, [reCaptchaRef, mounted])

  useEffect(() => {
    if (profileError) {
      flash('err', profileError?.message)
    } else if (emailError) {
      flash('err', emailError?.message)
    } else if (phoneError) {
      flash('err', phoneError?.message)
    } else if (passwordError) {
      flash('err', passwordError?.message)
    } 
    
    (loadingProfile && profileError) && setLoadingProfile(false)
    (loadingEmail && emailError) && setLoadingEmail(false)
    (loadingPhone && phoneError) && setLoadingPhone(false)
    (loadingPassword && passwordError) && setLoadingPassword(false)
  }, [
    profileError,
    emailError,
    phoneError,
    passwordError,
    loadingProfile,
    loadingPassword,
    loadingPhone,
    loadingEmail,
  ])

  const flash = useCallback(
    (status, msg) => {
      const css = ['flash', 'flash-global']
      css.push(status)
      css.push('is-visible')
      flashRef.current && (flashRef.current.className = css.join(' '))
      flashRef.current && (flashRef.current.innerHTML = msg)
      setTimeout(() => {
        const _css = ['flash', 'flash-global']
        _css.push(status)
        flashRef.current && (flashRef.current.className = _css.join(' '))
        flashRef.current && (flashRef.current.innerHTML = '')
      }, 4500)
    },
    [flashRef]
  )

  const reCaptchaReset = useCallback(
    () =>
      recaptchaVerifier.current &&
      (recaptchaVerifier.current.clear(), reCaptchaMount(reCaptchaRef)),
    [recaptchaVerifier, reCaptchaRef]
  )

  const reCaptchaMount = useCallback(
    (reCaptchaRef) => {
      firebase.auth().settings.appVerificationDisabledForTesting = true
      recaptchaVerifier.current = new reCaptcha(reCaptchaRef.current, {
        size: 'invisible',
        callback: (response) => {
          console.log('➰reCAPTCHA SOLVED➰: ' + response)
        },
      })
      recaptchaVerifier.current.render().then((widgetId) => {
        console.log('➰rendered➰:' + widgetId)
        recaptchaWidgetId.current = widgetId
      })
    },
    [reCaptchaRef, recaptchaVerifier, recaptchaWidgetId]
  )

  const removeAllErrors = () => (
    setProfileError(false),
    setPasswordError(false),
    setEmailError(false),
    setPhoneError(false)
  )

  const updateProfile = useCallback((data) => {
    removeAllErrors()
    setLoadingProfile(true)
    const regName = /^[a-zA-Z]+ [a-zA-Z]+$/
    if (!regName.test(data.displayName)) {
      return (setProfileError({ code: 'auth/display-name', message: 'Invalid name given.' }),setLoadingProfile(false))  
    }
    updateAuth(data)
      .then((res) => updateFirestore('users', user.uid, res))
      .then((displayName) => (setUser({...user, ...displayName}), flash('success', UPDATE_SUCCESS)))
      .catch((e) => setProfileError(e))
      .finally(() => setLoadingProfile(false))
  })

  const updateEmail = useCallback(
    (data) => {
      removeAllErrors()
      setLoadingEmail(true)
      const {newEmail, password} = data
      const {email} = user
      reAuthenticateAuth({email, password})
        .then(({uid, displayName, photoURL, phoneNumber}) =>
          updateAuthEmail({
            ...{uid, displayName, photoURL, phoneNumber},
            ...{email: newEmail},
          })
        )
        .then((_user) => updateFirestore('users', _user.uid, _user))
        .then((_user) => (setUser(_user),flash('success', UPDATE_SUCCESS)))
        .catch((e) => setEmailError(e))
        .finally(() => setLoadingEmail(false))
    },
    [user]
  )

  const updatePassword = useCallback(
    (data) => {
      removeAllErrors()
      setLoadingPassword(true)
      const {currentPassword} = data
      const {email} = user
      reAuthenticateAuth({email, password: currentPassword})
        .then(() => updateAuthPassword(data))
        .then(() => flash('success', UPDATE_SUCCESS))
        .catch((e) => setPasswordError(e))
        .finally(() => setLoadingPassword(false))
    },
    [user]
  )

  const updatePhone = useCallback(
    (data) => {
      console.log(data)
      removeAllErrors()
      setLoadingPhone(true)
      let appVerifier = recaptchaVerifier.current
      let phoneNumber = `+1${data.phoneNumber.replace(/\D/g, '')}`
      if (phoneNumber.length < 12) {
        return setPhoneError({
          code: 'TOO_SHORT',
          message: 'Your number is too short.',
        })
      }
      if (appVerifier === null) {
        let code = 'reCaptcha/error'
        let message = "reCaptcha hasn't loaded. Refresh your page."
        const e = {code, message}
        return setPhoneError(e)
      }
      sendCode(phoneNumber, appVerifier)
        .then(() => (setCodeSent(true),flash('success', 'We sent you a code.')))
        .catch((e) => setPhoneError(e))
        .finally(() => setLoadingPhone(false))
    },
    [recaptchaVerifier]
  )

  const confirmCode = useCallback((data) => {
    console.log(data)
    removeAllErrors()
    setLoadingCode(true)
    updateAuthPhone(data.code)
      .then(
        ({uid, displayName, photoURL, phoneNumber, email}) =>
          updateFirestore('users', uid, {
            uid,
            displayName,
            photoURL,
            phoneNumber,
            email,
          })
      )
      .then((_user) => (setUser(_user), setCodeSent(false),flash('success', UPDATE_SUCCESS)))
      .catch((e) => setCodeError(e))
      .finally(() => setLoadingCode(false))
  })

  return (
    <>
     <div ref={flashRef} className='flash success flash-global' />
    <AuthFlow
      href={"/[adminID]/"} 
      as={`/${user?.uid}/`}
      scroll={false}
      leftIconName={'arrowLeft'}
      crumbs={['selected', null, null]}
      leftIconColor={'rgb(0,200,5)'}
      showCrumbs={'hidden'}
      profile
    >
      <AuthFlowContainer
        title={'Update Profile'}
        caption={'Change your profile information.'}
      >
        <Form
          onSubmit={updateProfile}
          className='new-user-form auth-flow-form'
          method='POST'
        >
          {profileError && <ServerError text={profileError.message} />}
          {name ? (
            <TextField
              id='displayName'
              name='displayName'
              type='text'
              floatingLabelText='Full Name'
              hintText={'ex. Joe Biden'}
              onFocus={() => removeAllErrors()}
              hasError={NAME_ERRORS.includes(profileError?.code)}
              defaultValue={name}
            />
          ) : (
            <div className='holder'>
              <div style={{height: '56px', marginBottom: '12px'}} />
            </div>
          )}
          <Button
            type='submit'
            variant='auth'
            text={'Update Profile!'}
            disabled={!name}
            loading={loadingProfile}
            className='new-user-form-submit-button'
          />
        </Form>
      </AuthFlowContainer>
      <hr className='user-profile-separator' />

      <AuthFlowContainer
        title={'Update Email'}
        caption={
          'Update your Email. You must verify your current password to update this information.'
        }
      >
        <Form
          onSubmit={updateEmail}
          className='new-user-form auth-flow-form'
          method='POST'
        >
          {emailError && <ServerError text={emailError.message} />}
          {email ? (
            <TextField
              id='newEmail'
              name='newEmail'
              type='email'
              floatingLabelText='Email'
              hintText='ex. og@kush.com'
              fullWidth
              onFocus={() => removeAllErrors()}
              hasError={EMAIL_ERRORS.includes(emailError?.code)}
              defaultValue={email}
            />
          ) : (
            <div className='holder'>
              <div style={{height: '56px', marginBottom: '12px'}} />
            </div>
          )}
          {email ? (
            <TextField
              id='password'
              name='password'
              type='password'
              floatingLabelText='Password'
              hintText='Enter password'
              onFocus={() => removeAllErrors()}
              hasError={PASSWORD_ERRORS.includes(emailError?.code)}
            />
          ) : (
            <div className='holder'>
              <div style={{height: '56px', marginBottom: '12px'}} />
            </div>
          )}
          <Button
            type='submit'
            variant='auth'
            text={'Update Email!'}
            disabled={!email}
            loading={loadingEmail}
            className='new-user-form-submit-button'
          />
        </Form>
      </AuthFlowContainer>
      <hr className='user-profile-separator' />
      <AuthFlowContainer
        title={!codeSent ? 'Update Phone' : 'Confirm Code'}
        caption={
          !codeSent
            ? 'Update your Phone. We will send a code to your new number.'
            : 'We sent you a message. Please enter the 6-digit code we sent to your phone.'
        }
      >
        {!codeSent && (
          <Form
            onSubmit={updatePhone}
            className='new-user-form auth-flow-form'
            method='POST'
          >
            {phoneError && <ServerError text={phoneError.message} />}
            {typeof phoneNumber === 'string' ? (
              <PhoneField
                id='phone'
                name='phoneNumber'
                type='tel'
                floatingLabelText='Phone Number'
                hintText='ex. 555-867-5309'
                onFocus={() => removeAllErrors()}
                hasError={PHONE_ERRORS.includes(phoneError?.code)}
                onChange={(v) => setContactPhone(v)}
                defaultValue={phoneNumber}
              />
            ) : (
              <div className='holder'>
                <div style={{height: '56px', marginBottom: '12px'}} />
              </div>
            )}
            <ButtonRecaptcha
              type='submit'
              variant='auth'
              text={'Send Code!'}
              disabled={typeof phoneNumber !== 'string'}
              loading={loadingPhone}
              className='new-user-form-submit-button'
              ref={reCaptchaRef}
            />
          </Form>
        )}
        {codeSent && (
          <Form
            onSubmit={confirmCode}
            className='new-user-form auth-flow-form'
            method='POST'
          >
            {codeError && <ServerError text={codeError.message} />}
            {phoneNumber ? (
              <TextField
                id='code'
                name='code'
                type='text'
                floatingLabelText='6-digit Code'
                hintText='Enter 6-digit code.'
                hasError={CODE_ERRORS.includes(codeError?.code)}
                onFocus={() => codeError && setCodeError(false)}
              />
            ) : (
              <div className='holder'>
                <div style={{height: '56px', marginBottom: '12px'}} />
              </div>
            )}
            <Button
              type='submit'
              variant='auth'
              text={'Verify Code'}
              disabled={!phoneNumber}
              loading={loadingCode}
              className='new-user-form-submit-button'
            />
            <a
              onClick={() => setCodeSent(false)}
              className='button-base auth-flow-form-tertiary-button'
            >
              Resend Code?
            </a>
          </Form>
        )}
      </AuthFlowContainer>
      <hr className='user-profile-separator' />
      <AuthFlowContainer
        title={'Update Password'}
        caption={`To update your password type in your current password and the password you'd like to replace it. Take special care to enter your new password correctly.`}
      >
        <Form
          onSubmit={updatePassword}
          className='new-user-form auth-flow-form'
          method='POST'
        >
          {passwordError && <ServerError text={passwordError.message} />}
          {email ? (
            <TextField
              id='currentPassword'
              name='currentPassword'
              type='password'
              floatingLabelText='Current Password'
              hintText='Current Password'
              onFocus={() => removeAllErrors()}
              hasError={AUTH_PASSWORD_ERRORS.includes(passwordError?.code)}
            />
          ) : (
            <div className='holder'>
              <div style={{height: '56px', marginBottom: '12px'}} />
            </div>
          )}
          {email ? (
            <TextField
              id='newPassword'
              name='newPassword'
              type='password'
              floatingLabelText='Password'
              hintText='Enter password'
              onFocus={() => removeAllErrors()}
              hasError={NEW_PASSWORD_ERRORS.includes(passwordError?.code)}
            />
          ) : (
            <div className='holder'>
              <div style={{height: '56px', marginBottom: '12px'}} />
            </div>
          )}
          <Button
            type='submit'
            variant='auth'
            text={'Update Password!'}
            disabled={!email}
            loading={loadingPassword}
            className='new-user-form-submit-button'
          />
        </Form>
      </AuthFlowContainer>
    </AuthFlow>
    </>
  )
}
export default Profile
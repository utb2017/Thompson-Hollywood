import React, { useState, useRef, useCallback } from "react"
import Button from "../../../components/Buttons/Button"
import AuthLayout from "../../../layouts/AuthLayout"
import ServerError from "../../../components/Forms/ServerError"
import Security from "../../../components/Forms/Security"
import { useUser } from "../../../context/userContext"
import { useAuth } from "../../../context/authContext"
import { updateFirestore } from "../../../firebase/clientApp"
import UploadFile from "../../../components/Forms/UploadFile"
import Callout from "../../../components/Forms/Callout"
import firebase from '../../../firebase/clientApp'

const signinProps = {
  showCrumbs: true,
  crumbs: ["completed", "selected"],
  title: "Upload a photo ID.",
  caption: `To verify your identity, we'll need a government-issued photo ID. 
  Please upload a photo of your driver’s license, passport, or other 
  valid ID.`,
  callout: <Callout />,
}






const License = () => {
  const { user, setUser } = useUser()
  const [loading, setLoading] = useState(false)
  const { form, setForm, error, setError } = useAuth()
  const taskRef = useRef(null)

  const uploadImgComplete = useCallback( async () => {
    const prop = {
      licenseUpdateAt: firebase.firestore.FieldValue.serverTimestamp(),
      status:'pending'
    }
    setLoading(true)
    try{
      const photoURL  = await taskRef.current.snapshot.ref.getDownloadURL()
      await updateFirestore('users', user.uid, { ...{photoURL}, ...prop })
      setUser({ ...user, ...{photoURL} })
    }catch(error){
      setError(oldErrors=>({...oldErrors,...{photoURL:error}}))
    }finally{
      setForm( (oldForm) => ({...oldForm,...{uploadProgress:null,uploadImg:null}})) 
      setLoading(false)
    }
    return;
  }, [user, taskRef])
  const uploadImgError = (e) => setError(e)
  const uploadImgNext = (snap) => {
    return setForm( (oldForm) => ({...oldForm,...{uploadProgress:((snap.bytesTransferred / snap.totalBytes) * 100)}}));

  }

  const handleSubmit = useCallback(() => {
      setLoading(true)
      const { uploadImg } = form
      const { uid } = user
      taskRef.current = firebase
        .storage()
        .ref()
        .child(`${'Test'}/${uid}`)
        //.child(`${'Test'}/${uid}-${"license"}`)
        .put(uploadImg, { contentType: uploadImg.type })

      taskRef.current.on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        uploadImgNext,
        uploadImgError,
        uploadImgComplete
      )
    },
    [taskRef, user, form]
  )


  return (
      <AuthLayout {...signinProps}>
        {error?.photoURL && <ServerError text={error.photoURL.message} />}
        <UploadFile fileType={/(\.jpg|\.jpeg|\.png|\.gif)$/i} />
        <Button
          disabled={loading}
          loading={loading}
          onClick={handleSubmit}
          text='Upload ID'
        />
        <Security />
      </AuthLayout>
  )
}
export default License

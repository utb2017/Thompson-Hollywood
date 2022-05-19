import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import Button from '../../../components/form/Button'
import Form from '../../../components/form/Form'
import AuthFlow from '../../../components/layout/AuthFlow'
import SVGIcon from '../../../components/SVGIcon'
// import FileInput from "../../../components/form/FileInput"
import Callout from '../../../components/Callout'
import firebase, {
  updateAuth,
  updateFirestore,
} from '../../../firebase/clientApp'
import ServerError from '../../../components/form/ServerError'
import { useUser } from '../../../context/userContext'
import { useRouter } from 'next/router'
import { useFirestoreQuery } from '../../../hooks/useFirestoreQuery'
import { useDispatchModal } from '../../../context/modalContext'
import { Logout } from '../../../components/Modal'

const imgError = { code: 'storage/invalid', message: 'Not a valid image.' }

const UploadLicense = () => {
  const router = useRouter()
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [image, setImage] = useState(null)
  const [progress, setProgress] = useState(null)
  const [processComplete, setProcessComplete] = useState(null)
  //const [style, setStyle] = useState(['user-form-file-upload-input'])
  const [text, setText] = useState('Add image')
  const [locked, setLocked] = useState(true)
  const [lastUpload, setLastUpload] = useState(null)
  const { user, setUser, loadingUser } = useUser()
  const taskRef = useRef(null)
  const fileInputRef = useRef(null)
  const { modalDispatch, modalState } = useDispatchModal()
  const profile = useFirestoreQuery(
    user?.uid && firebase.firestore().collection('users').doc(user.uid)
  )
  const { query = {} } = router

  useEffect(() => {
    if ('logout' in query) {
      openModal()
    } else {
      closeModal()
    }
    return () => {
      closeModal()
    }
  }, [query])

  const openModal = () => {
    modalDispatch({
      type: 'MODAL_UPDATE',
      payload: {
        modal: {
          isOpen: true,
          key: [],
          component: Logout,
        },
      },
    })
  }
  const closeModal = () => {
    modalDispatch({
      type: 'MODAL_UPDATE',
      payload: {
        modal: {
          isOpen: false,
          key: [],
          component: null,
        },
      },
    })
  }



  /** Last Update State **/
  useMemo(() => {
    profile.data?.licenseUpdateAt &&
      setLastUpload(
        new Date(profile.data?.licenseUpdateAt.toDate()).toLocaleTimeString(
          [],
          {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }
        )
      )
  }, [profile])
  /** Button Lock State **/
  useEffect(() => {
    setLocked(loading || !image)
  }, [loading, image])
  /** Button Loading State **/
  useEffect(() => {
    error && setLoading(false)
  }, [error])
  /** Page Navigation **/
  useEffect(() => {
    if(!loadingUser && !user){
      router.push('/sign-in')

    }else if(processComplete){
      router.push('/')
    }
  }, [processComplete, user, loadingUser])

  useEffect(() => {
    const css = ['user-form-file-upload-input']
    let str = 'Add image'

    if (progress) {
      css.push('hasFile')
      str = `${parseInt(progress)}%`
    } else if (image) {
      css.push('hasFile')
      str = image
    }
    setText(str)
    //setStyle(css.join(' '))
    fileInputRef && (fileInputRef.current.className = css.join(' '))
    return () => {
      //setStyle(['user-form-file-upload-input'])
      setText('Add image')
    }
  }, [image, progress])

  const handleChange = (e) => {
    e.stopPropagation()
    const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i
    allowedExtensions.exec(e.target.files[0]?.name)
      ? (setImage(e.target.files[0].name), setError(false))
      : setError(imgError)
  }

  const uploadImgComplete = useCallback(() => {
    const time = {
      licenseUpdateAt: firebase.firestore.FieldValue.serverTimestamp(),
    }
    return (
      taskRef.current.snapshot.ref
        .getDownloadURL()
        .then((photoURL) => updateAuth({ photoURL }))
        .then((photoURL) =>
          updateFirestore('users', user.uid, { ...photoURL, ...time })
        )
        .then((photoURL) => setUser({ ...user, ...photoURL }))
        .then(() => setProcessComplete(true))
        //add twillio 📞📞
        .catch((e) => setError(e))
        .finally(() => {
          setImage(null)
          setLoading(false)
          setProgress(null)
        })
    )
  }, [user])
  const uploadImgError = (e) => setError(e)
  const uploadImgNext = (snap) => {
    return setProgress((snap.bytesTransferred / snap.totalBytes) * 100)
  }

  const uploadImgToFireStorage = useCallback(
    (data) => {
      setLoading(true)
      const file = data.license
      const { uid } = user
      taskRef.current = firebase
        .storage()
        .ref()
        .child(`${'Ids'}/${uid}-${file.name}`)
        .put(file, { contentType: file.type })

      taskRef.current.on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        uploadImgNext,
        uploadImgError,
        uploadImgComplete
      )
    },
    [taskRef, user]
  )

  return (
    <AuthFlow
      //link={'?logout'}
      showCrumbs={user?.photoURL && 'hidden'}
      link={ (!user?.photoURL)?'?logout':(!user?.phoneNumber)?'/add-phone':'/'}
      leftIconName={'arrowLeft'}
      leftIconColor={'rgb(0,200,5)'}
      crumbs={['completed', 'completed', 'selected']}
      title={'Upload a photo ID.'}
      caption={`To verify your identity, we'll need a government-issued photo ID. 
        Please upload a photo of your driver’s license, passport, or other 
        valid ID.`}
      infoChildren={
        lastUpload && (
          <Callout>
            <span>You last updated your license on </span>
            <span>{lastUpload}</span>
          </Callout>
        )
      }>
      <Form
        onSubmit={(data) => uploadImgToFireStorage(data)}
        className='new-user-form auth-flow-form'
        method='POST'>
        {error && <ServerError text={error.message} />}
        <div ref={fileInputRef} className='user-form-file-upload-input'>
          <span className='user-form-file-upload-input-plus-sign'>+</span>
          <span className='user-form-file-upload-input-label'>{text}</span>
          <input type='file' name='license' onChange={handleChange} />
        </div>

        <Button
          type='submit'
          variant='auth'
          text={'Upload ID'}
          className='new-user-form-submit-button'
          disabled={locked}
          loading={loading}
        />
        <div className='auth-flow-secure-text'>
          <div className='auth-flow-lock'>
            <SVGIcon name={'lockFilled'} color={'#1a1229'} />
          </div>
          All documents are stored securely in a HIPAA-compliant database.
        </div>
      </Form>
    </AuthFlow>
  )
}
export default UploadLicense

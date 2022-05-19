import TextField from '../../../components/Forms/TextField'
import Switch from '../../../components/Buttons/Switch'
import {useForm} from '../../../context/formContext'
import {useUser} from '../../../context/userContext'
import {useEffect, useState, useCallback} from 'react'
import {
  PrimaryPane,
  FormPane,
  FormInput,
  FormSection,
  Footer
} from '../../../components/Console'
import {
  ModalPreview, 
} from '../../../components/Modals'
import {useDispatchModal} from '../../../context/modalContext'
import Button from '../../../components/Buttons/Button'
import isEqual from 'lodash.isequal'
import {useRouting} from '../../../context/routingContext'
import { isEmpty } from "../../../helpers"
import {NotificationManager} from 'react-notifications';
import {updateFirestore} from '../../../firebase/clientApp'



const NotificationSettings = () => {
  const {form, setForm, error, setError, setAnnouncement } = useForm()
  const {fireSettings} = useUser()
  const { modalDispatch, modalState } = useDispatchModal()
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState(null)
  const [defaultData, setDefaultData] = useState({})
  const { navLoading, setNavLoading } = useRouting()

  const defaultNotifications = {
    popupTitle: '',
    popupMessage: '',
    popupImg: '',
    hasPopup: false,
    announcement: '',
    hasAnnouncement: false,
    announcementColor: '#1a73e8',
  }

  const openModal = (component) => {
    modalDispatch({
      type: 'MODAL_UPDATE',
      payload: {
        modal: {
          isOpen: true,
          key: [],
          component,
        },
      },
    })
  }
  const handlePreviewButton = () => {
    const modalProps = {
      title: form.popupTitle,
      emoji: form.popupImg,
      message: form.popupMessage,
    }
    const component = () => <ModalPreview {...modalProps} />
    openModal(component)
  }
  const handleFormChange = (e, v) => {
    setForm({ ...{...form}, ...{[`${e?.target?.name||''}`]:(v||'')}})
  }

  const handleColorChange = (e) => {
    setForm({ ...{...form}, ...{[`${e?.target?.name||''}`]:(`${e?.target?.value||''}`)}})
  }





  const handleSwitchChange = (e) => {
    const {checked, id} = e.target
    setForm({...{...form}, ...{[id]: checked}})
  }



    /* SET UP FORM */
    useEffect(() => {
      if (Boolean(fireSettings?.data)) {
        const tempForm = {}
        const fireNotifications = {...fireSettings.data}
        for (const key in defaultNotifications) {
          if (key in fireNotifications) {
            tempForm[key] = fireNotifications[key]
          }else{
            tempForm[key] = ''
          }
        }
        setForm({...tempForm})
        setDefaultData({...tempForm})
      }
      return () => {
        setForm({})
        setError({})
        setAnnouncement(false)
      }
    }, [fireSettings])



    const updateNotifications = useCallback( async () => {
      const _form = { ...form }
      const _error = { ...error }
      if(Boolean(_form?.hasPopup)){
        if (isEmpty(`${_form?.popupTitle||''}`)) {
          _error.popupTitle = 'Popup title required to go live.'
          NotificationManager.error(_error.popupTitle)
          return setError({ ..._error })
        }
        if (isEmpty(`${_form?.popupMessage||''}`)) {
          _error.popupMessage = 'Popup message required to go live.'
          NotificationManager.error(_error.popupMessage)
          return setError({ ..._error })
        }
        if (isEmpty(`${_form?.popupImg||''}`)) {
          _error.popupImg = 'Emoji required to go live.'
          NotificationManager.error(_error.popupImg)
          return setError({ ..._error })
        }
      }
      if(Boolean(_form?.hasAnnouncement)){
        if (isEmpty(`${_form?.announcement||''}`)) {
          _error.announcement = 'Announcement required to go live.'
          NotificationManager.error(_error.announcement)
          return setError({ ..._error })
        }
        if (isEmpty(`${_form?.announcementColor||''}`)) {
          _error.announcementColor = 'Color required to go live.'
          NotificationManager.error(_error.announcementColor)
          return setError({ ..._error })
        }
      }
      setNavLoading(true)
      setLoading(true)
      try {
          await updateFirestore('admin', 'store', {..._form})
          NotificationManager.success('Notifications updated.');
        } catch (e) {
          if (error?.message) {
            //setServerError(error?.message)
            NotificationManager.error(error?.message)
          } else {
            NotificationManager.error("An error has occurred.")
          }
        } finally {
          setLoading(false)
          setNavLoading(false)
        }
  },[form]
  )



  return (
    <>
      {/* OUTLET */}
      <PrimaryPane id='settings-collection' reverse={false} column={true}>
        
        {/* FORM */}
        <FormPane>
          {/* SERVER ERROR */}
          {/* {Boolean(form.serverError) && <ServerError text={serverError} />} */}
          {/* SECTION POPUP */}
          <FormSection
            title={'Popup'}
            toggle={
              <>
                <label htmlFor='switchLive' className='form-switch-label'>
                  Set Live?
                </label>
                <Switch
                  hasEdit={Boolean(defaultData?.hasPopup !== form?.hasPopup)}
                  onChange={handleSwitchChange}
                  id='hasPopup'
                  isSelected={Boolean(form?.hasPopup)}
                />
              </>
            }>
            {/*Modal Title*/}
            <FormInput label={'Title'} stack={false}>
              <TextField
                hasEdit={Boolean(`${defaultData?.popupTitle||''}` !== `${form?.popupTitle||''}`)}
                hasError={Boolean(error?.popupTitle)}
                validationErrorText={error?.popupTitle || ''}
                onFocus={() => setError({...error, ...{serverError: null, popupTitle: false}})}
                id='popupTitle'
                name='popupTitle'
                type='text'
                floatingLabelText='Popup Title'
                hintText='Popup Title'
                fullWidth
                onChange={handleFormChange}
                value={`${form?.popupTitle||''}`}
              />
            </FormInput>
            {/*Modal Message*/}
            <FormInput label={'Emoji'} stack={false}>
              <TextField
                hasError={Boolean(error?.popupImg)}
                hasEdit={Boolean(`${defaultData?.popupImg||''}` !== `${form?.popupImg||''}`)}
                validationErrorText={error?.popupImg || ''}
                onFocus={() => setError({...error, ...{serverError: null, popupImg: false}})}
                id='popupImg'
                name='popupImg'
                type='text'
                floatingLabelText='Popup Emoji'
                hintText='Paste an Emoji'
                halfWidth
                onChange={handleFormChange}
                value={`${form?.popupImg||''}`}
              />
            </FormInput>
            {/*Modal Message*/}
            <FormInput label={'Message'} stack={false}>
              <TextField
                hasError={Boolean(error?.popupMessage)}
                hasEdit={Boolean(`${defaultData?.popupMessage||''}` !== `${form?.popupMessage||''}`)}
                validationErrorText={error?.popupMessage || ''}
                onFocus={() => setError({...error, ...{serverError: null, popupMessage: false}})}
                id='popupMessage'
                name='popupMessage'
                type='text'
                floatingLabelText='Popup Message'
                hintText='Popup Message'
                fullWidth
                onChange={handleFormChange}
                value={`${form?.popupMessage||''}`}
              />
            </FormInput>
            {/* POPUP IMAGE */}
            {/* <FormInput label={'Image'} stack={false}>
              <button onClick={handleModalUpload} className='form-image-input'>
                {form?.popupImg && form?.popupImg.length
                ?<img
                  className='form-img'
                  src={form.popupImg}
                  alt={'Modal Image'}
                />
                :<div className='form-image-placeholder'>
                    <SVGIcon color={'#8ab4f8'} name='photo'/>
                 </div>}
              </button>
            </FormInput> */}
            {/* POPUP IMAGE */}
            <FormInput stack={false}>
              <button onClick={handlePreviewButton} className='button-base form-preview-label'>
                Preview
              </button>
            </FormInput>
          </FormSection>
        </FormPane>
        <FormPane>
        {/*SECTION ANOUNCEMENT*/}
        <FormSection
            title={'Announcement'}
            toggle={
              <>
                <label htmlFor='switchAnnouncment' className='form-switch-label'>
                  Set Live?
                </label>
                <Switch
                  hasEdit={Boolean(defaultData?.hasAnnouncement !== form?.hasAnnouncement)}
                  //hasEdit={Boolean(`${defaultData?.hasAnnouncement||''}` !== `${form?.hasAnnouncement||''}`)}
                  onChange={handleSwitchChange}
                  id='hasAnnouncement'
                  isSelected={Boolean(form?.hasAnnouncement)}
                />
              </>
            }>
            {/*Announcement Message*/}
            <FormInput label={'Message'} stack={false}>
              <TextField
                hasEdit={Boolean(`${defaultData?.announcement||''}` !== `${form?.announcement||''}`)}
                hasError={Boolean(error?.announcement)}
                validationErrorText={error?.announcement || ''}
                onFocus={() => setError({...error, ...{serverError: null, announcement: false}})}
                id='announcement'
                name='announcement'
                type='text'
                floatingLabelText='Announcement'
                hintText='Announcement'
                fullWidth
                onChange={handleFormChange}
                value={`${form?.announcement||''}`}
              />
            </FormInput>
            {/*Announcement Color*/}
            <FormInput label={'Color'} stack={false}>
              <input
               {...(Boolean(`${defaultData?.announcementColor||''}` !== `${form?.announcementColor||''}`)&&{className:'has-edits'})}
                type='color'
                id='announcementColor'
                name='announcementColor'
                style={{height: '40px', marginTop: '4px'}}
                onChange={handleColorChange}
                value={`${form?.announcementColor||'#1a73e8'}`}
              />
            </FormInput>
            {/*Announcement Preview*/}
            <FormInput stack={false}>
              <button onClick={()=>setAnnouncement(true)} className='button-base form-preview-label'>
                Preview
              </button>
            </FormInput>
          </FormSection>
          {/*SECTION BANNER*/}
          {/* <div className='form-pane-section'>
            <div className='form-title-box'>
              <div className='form-card-title'>Banner</div>
            </div>
            <FormInput label={'Title'} stack={false}>
              <TextField
                id='bannerTitle'
                name='bannerTitle'
                type='text'
                floatingLabelText='Banner Title'
                hintText='Banner Title'
                fullWidth
                onChange={handleFormChange}
                value={form?.bannerTitle || ''}
              />
            </FormInput>
            <FormInput label={'Message'} stack={false}>
              <TextField
                id='bannerMessage'
                name='bannerMessage'
                type='text'
                floatingLabelText='Banner Message'
                hintText='Banner Message'
                fullWidth
                onChange={handleFormChange}
                value={form?.bannerMessage || ''}
              />
            </FormInput>
            <FormInput label={'Image'} stack={false}>
              <button onClick={handleBannerUpload} className='form-image-input banner'>
                {form?.bannerImg && form?.bannerImg.length
                ?<img
                  className='form-img'
                  src={form.bannerImg}
                  alt={'Modal Image'}
                />
                :<div className='form-image-placeholder'>
                    <SVGIcon color={'#8ab4f8'} name='photo'/>
                 </div>}
              </button>
            </FormInput>
          </div> */}
        </FormPane>
        {/* SIDE */}
      </PrimaryPane>
      <Footer  isShowing={!isEqual({ ...form }, { ...defaultData })}>
        <Button
          disabled={
            loading || navLoading || isEmpty(form) || isEqual({ ...form }, { ...defaultData })
          }
          loading={loading}
          onClick={updateNotifications}
          text='Save Changes'
        />
      </Footer>
    </>
  )
}

export default NotificationSettings






//   const handleBannerUpload = () => {
//     const uploadProps = {
//       formKey: 'bannerImg',
//       storage: 'banner',
//       label: 'Add Banner',
//       imgType: ['jpeg', 'jpg', 'png', 'gif'],
//     }
//     const component = () => <Upload {...uploadProps} />
//     openModal(component)
//   }
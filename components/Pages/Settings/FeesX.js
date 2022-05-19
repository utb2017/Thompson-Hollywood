import ServerError from '../../../components/Forms/ServerError'
import {useEffect, useState, useCallback} from 'react'
import TextField from '../../../components/Forms/TextField'
import {useForm} from '../../../context/formContext'
import {useUser} from '../../../context/userContext'
import {Footer} from '../../../components/Console'
import {PrimaryPane, FormPane, FormInput} from '../../../components/Console'
import Button from '../../../components/Buttons/Button'
import isEqual from 'lodash.isequal'
import {useRouting} from '../../../context/routingContext'
import { isEmpty } from "../../../helpers"
import {NotificationManager} from 'react-notifications';
import {updateFirestore} from '../../../firebase/clientApp'


const style = {
  field: {
    flex: '1 1 0',
    minWidth: 0,
  },
}
const FeeSettings = () => {
  const {form, setForm, error, setError} = useForm()
  const {fireSettings} = useUser()
  const stack = true
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState(null)
  const [defaultData, setDefaultData] = useState({})
  const { navLoading, setNavLoading } = useRouting()

  const defaultFees = {
    deliveryFee: '',
    serviceFee: '',
    freeDeliveryMin: '',
    minOrder: '',
    exciseTax: '',
    stateTax: '',
    localTax: '',
  }


  const handleFormChange = (e, v) => {
    setForm({ ...{...form}, ...{[`${e?.target?.name||''}`]:(v||'')}})
  }

  /* SET UP FORM */
  useEffect(() => {
    if (Boolean(fireSettings?.data)) {
      const tempForm = {}
      const fireFees = {...fireSettings.data}
      for (const key in defaultFees) {
        if (key in fireFees) {
          tempForm[key] = `${fireFees[key]||''}`
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
    }
  }, [fireSettings])


  const updateFees = useCallback( async (e) => {
    const _form = { ...form }
    const _error = { ...error }

    if (isEmpty(`${_form?.deliveryFee||''}`)) {
      _error.deliveryFee = 'Minimum 0 required.'
      NotificationManager.error(_error.deliveryFee)
      return setError({ ..._error })
    }

    if (isEmpty(`${_form?.serviceFee||''}`)) {
      _error.serviceFee = 'Minimum 0 required.'
      NotificationManager.error(_error.serviceFee)
      return setError({ ..._error })
    }

    if (isEmpty(`${_form?.freeDeliveryMin||''}`)) {
      _error.freeDeliveryMin = 'Minimum 0 required.'
      NotificationManager.error(_error.freeDeliveryMin)
      return setError({ ..._error })
    }

    if (isEmpty(`${_form?.minOrder||''}`)) {
      _error.minOrder = 'Minimum 0 required.'
      NotificationManager.error(_error.minOrder)
      return setError({ ..._error })
    }

    if (isEmpty(`${_form?.exciseTax||''}`)) {
      _error.exciseTax = 'Minimum 0 required.'
      NotificationManager.error(_error.exciseTax)
      return setError({ ..._error })
    }

    if (isEmpty(`${_form?.stateTax||''}`)) {
      _error.stateTax = 'Minimum 0 required.'
      NotificationManager.error(_error.stateTax)
      return setError({ ..._error })
    }

    if (isEmpty(`${_form?.localTax||''}`)) {
      _error.stateTax = 'Minimum 0 required.'
      NotificationManager.error(_error.stateTax)
      return setError({ ..._error })
    }

    for(const key in _form){
       _form[key] = parseFloat(_form[key])
    }

    setLoading(true)
    setNavLoading(true)
    try {
      await updateFirestore('admin', 'store', _form)
      NotificationManager.success('Fees updated.');
    } catch (error) {
      if (error?.message) {
        setServerError(error?.message)
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
      <PrimaryPane id='settings-collection'>
        {/* FORM PANE */}
        <FormPane>
          {/* SERVER ERROR */}
          <FormInput {...{stack}}>
            {Boolean(serverError) && <ServerError text={`${serverError}`} />}
          </FormInput>
          {/*Delivery Fee*/}
          <FormInput label={"Fee's"} {...{stack}}>
            <div className='dual-input'>
              <TextField
                hasEdit={Boolean(`${defaultData?.deliveryFee||''}` !== `${form?.deliveryFee||''}`)}
                hasError={Boolean(error?.deliveryFee)}
                validationErrorText={error?.deliveryFee || ''}
                onFocus={() => setError({...{...error}, ...{serverError: null, deliveryFee: false}})}
                style={style.field}
                id='deliveryFee'
                name='deliveryFee'
                type='number'
                floatingLabelText='Delivery Fee'
                hintText='Delivery Fee'
                halfWidth
                rate='$'
                onChange={handleFormChange}
                disabled={loading || navLoading}
                value={`${form?.deliveryFee||''}`}
              />
              <div className='dual-spacer' />
              <TextField
                hasEdit={Boolean(`${defaultData?.serviceFee||''}` !== `${form?.serviceFee||''}`)}
                hasError={Boolean(error?.serviceFee)}
                validationErrorText={error?.serviceFee || ''}
                onFocus={() => setError({...{...error}, ...{serverError: null, serviceFee: false}})}
                style={style.field}
                id='serviceFee'
                name='serviceFee'
                type='number'
                floatingLabelText='Service Fee'
                hintText='Service Fee'
                halfWidth
                rate='$'
                onChange={handleFormChange}
                disabled={loading || navLoading}
                value={`${form?.serviceFee||''}`}
              />
            </div>
          </FormInput>
          {/*minimumz*/}
          <FormInput label="Minimum's" {...{stack}}>
            <div className='dual-input'>
              <TextField
                hasEdit={Boolean(`${defaultData?.freeDeliveryMin||''}` !== `${form?.freeDeliveryMin||''}`)}
                hasError={Boolean(error?.freeDeliveryMin)}
                validationErrorText={error?.freeDeliveryMin || ''}
                style={style.field}
                onFocus={() => setError({...{...error}, ...{serverError: null, freeDeliveryMin: false}})}
                id='freeDeliveryMin'
                name='freeDeliveryMin'
                type='number'
                floatingLabelText='Free Minimum'
                hintText='Free Minimum'
                halfWidth
                rate='$'
                disabled={loading || navLoading}
                onChange={handleFormChange}
                value={`${form?.freeDeliveryMin||''}`}
              />
              <div className='dual-spacer' />
              <TextField
                hasEdit={Boolean(`${defaultData?.minOrder||''}` !== `${form?.minOrder||''}`)}
                hasError={Boolean(error?.minOrder)}
                validationErrorText={error?.minOrder || ''}
                style={style.field}
                onFocus={() => setError({...{...error}, ...{serverError: null, minOrder: false}})}
                id='minOrder'
                name='minOrder'
                type='number'
                floatingLabelText='Minimum Order'
                hintText='Minimum Order'
                halfWidth
                rate='$'
                disabled={loading || navLoading}
                onChange={handleFormChange}
                value={`${form?.minOrder||''}`}
              />
            </div>
          </FormInput>
          {/*Excise Tax*/}
          <FormInput label='Taxes' {...{stack}}>
            <div className='dual-input'>
              <TextField
                hasEdit={Boolean(`${defaultData?.exciseTax||''}` !== `${form?.exciseTax||''}`)}
                hasError={Boolean(error?.exciseTax)}
                validationErrorText={error?.exciseTax || ''}
                onFocus={() => setError({...{...error}, ...{serverError: null, exciseTax: false}})}
                style={style.field}
                id='exciseTax'
                name='exciseTax'
                type='number'
                floatingLabelText='Excise Tax'
                hintText='Excise Tax'
                halfWidth
                rate='%'
                disabled={loading || navLoading}
                onChange={handleFormChange}
                value={`${form?.exciseTax||''}`}
              />

              {/*Local Tax*/}
              <div className='dual-spacer' />
              <TextField
                hasError={Boolean(error?.localTax)}
                hasEdit={Boolean(`${defaultData?.localTax||''}` !== `${form?.localTax||''}`)}
                validationErrorText={error?.localTax || ''}
                onFocus={() => setError({...{...error}, ...{serverError: null, localTax: false}})}
                style={style.field}
                id='localTax'
                name='localTax'
                type='number'
                floatingLabelText='Local Tax'
                hintText='Local Tax'
                halfWidth
                disabled={loading || navLoading}
                rate='%'
                onChange={handleFormChange}
                value={`${form?.localTax||''}`}
              />
            </div>
          </FormInput>
          {/*State Tax*/}
          <FormInput>
            <div className='dual-input'>
              <TextField
                hasError={Boolean(error?.stateTax)}
                hasEdit={Boolean(`${defaultData?.stateTax||''}` !== `${form?.stateTax||''}`)}
                validationErrorText={error?.stateTax || ''}
                onFocus={() => setError({...{...error}, ...{serverError: null, stateTax: false}})}
                style={style.field}
                id='stateTax'
                name='stateTax'
                type='number'
                floatingLabelText='State Tax'
                hintText='State Tax'
                halfWidth
                rate='%'
                onChange={handleFormChange}
                value={`${form?.stateTax||''}`}
              />
              <div className='dual-spacer' />
              <div style={style.field} />
            </div>
          </FormInput>
        </FormPane>
      </PrimaryPane>
      <Footer isShowing={!isEqual({ ...form }, { ...defaultData })}>
        <Button
          disabled={
            loading || navLoading || isEmpty(form) || isEqual({ ...form }, { ...defaultData })
          }
          loading={loading}
          onClick={updateFees}
          text='Save Changes'
        />
      </Footer>
   
   
    </>
  )
}
export default FeeSettings

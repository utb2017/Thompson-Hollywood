import ServerError from '../../components/Forms/ServerError'
import {useEffect} from 'react'
import TextField from '../../components/Forms/TextField'
import {useForm} from '../../context/formContext'
import {useUser} from '../../context/userContext'
import {PrimaryPane, FormPane, FormInput} from '../../components/Console'
const defaultFees = {
  deliveryFee: '',
  serviceFee: '',
  freeDeliveryMin: '',
  minOrder: '',
  exciseTax: '',
  stateTax: '',
  localTax: '',
}
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


  const handleFormChange = (e, v) => {
    const {name} = e.target
    setForm({...form, ...{[name]: v}})
  }

  
  {/* SET UP FORM */}
  useEffect(() => {
    if (fireSettings.status === 'success' && Boolean(fireSettings.data)) {
      const {data} = fireSettings
      const tempForm = {}
      const notifications = JSON.parse(JSON.stringify(data))
      for (const key in notifications) {
        if (key in defaultFees) {
          tempForm[key] = notifications[key].toString()
        }
      }
      setForm(tempForm)
    }
  }, [fireSettings])


  return (
    <>
      {/* OUTLET */}
      <PrimaryPane id='settings-collection'>
        {/* FORM PANE */}
        <FormPane>
          {/* SERVER ERROR */}
          <FormInput {...{stack}}>
            {Boolean(error?.serverError) && <ServerError text={error.serverError.message} />}
          </FormInput>
          {/*Delivery Fee*/}
          <FormInput label={"Fee's"} {...{stack}}>
            <div className='dual-input'>
              <TextField
                hasError={Boolean(error?.deliveryFee)}
                validationErrorText={error?.deliveryFee || ''}
                onFocus={() => setError({...error, ...{serverError: null, deliveryFee: false}})}
                style={style.field}
                id='deliveryFee'
                name='deliveryFee'
                type='number'
                floatingLabelText='Delivery Fee'
                hintText='Delivery Fee'
                halfWidth
                rate='$'
                onChange={handleFormChange}
                value={form?.deliveryFee || ''}
              />
              <div className='dual-spacer' />
              <TextField
                hasError={Boolean(error?.serviceFee)}
                validationErrorText={error?.serviceFee || ''}
                onFocus={() => setError({...error, ...{serverError: null, serviceFee: false}})}
                style={style.field}
                id='serviceFee'
                name='serviceFee'
                type='number'
                floatingLabelText='Service Fee'
                hintText='Service Fee'
                halfWidth
                rate='$'
                onChange={handleFormChange}
                value={form?.serviceFee || ''}
              />
            </div>
          </FormInput>
          {/*minimumz*/}
          <FormInput label="Minimum's" {...{stack}}>
            <div className='dual-input'>
              <TextField
                hasError={Boolean(error?.freeDeliveryMin)}
                validationErrorText={error?.freeDeliveryMin || ''}
                style={style.field}
                onFocus={() => setError({...error, ...{serverError: null, freeDeliveryMin: false}})}
                id='freeDeliveryMin'
                name='freeDeliveryMin'
                type='number'
                floatingLabelText='Free Minimum'
                hintText='Free Minimum'
                halfWidth
                rate='$'
                onChange={handleFormChange}
                value={form?.freeDeliveryMin || ''}
              />
              <div className='dual-spacer' />
              <TextField
                hasError={Boolean(error?.minOrder)}
                validationErrorText={error?.minOrder || ''}
                style={style.field}
                onFocus={() => setError({...error, ...{serverError: null, minOrder: false}})}
                id='minOrder'
                name='minOrder'
                type='number'
                floatingLabelText='Minimum Order'
                hintText='Minimum Order'
                halfWidth
                rate='$'
                onChange={handleFormChange}
                value={form?.minOrder || ''}
              />
            </div>
          </FormInput>
          {/*Excise Tax*/}
          <FormInput label='Taxes' {...{stack}}>
            <div className='dual-input'>
              <TextField
                hasError={Boolean(error?.exciseTax)}
                validationErrorText={error?.exciseTax || ''}
                onFocus={() => setError({...error, ...{serverError: null, exciseTax: false}})}
                style={style.field}
                id='exciseTax'
                name='exciseTax'
                type='number'
                floatingLabelText='Excise Tax'
                hintText='Excise Tax'
                halfWidth
                rate='%'
                onChange={handleFormChange}
                value={form?.exciseTax || ''}
              />

              {/*Local Tax*/}
              <div className='dual-spacer' />
              <TextField
                hasError={Boolean(error?.localTax)}
                validationErrorText={error?.localTax || ''}
                onFocus={() => setError({...error, ...{serverError: null, localTax: false}})}
                style={style.field}
                id='localTax'
                name='localTax'
                type='number'
                floatingLabelText='Local Tax'
                hintText='Local Tax'
                halfWidth
                rate='%'
                onChange={handleFormChange}
                value={form?.localTax || ''}
              />
            </div>
          </FormInput>
          {/*State Tax*/}
          <FormInput>
            <div className='dual-input'>
              <TextField
                hasError={Boolean(error?.stateTax)}
                validationErrorText={error?.stateTax || ''}
                onFocus={() => setError({...error, ...{serverError: null, stateTax: false}})}
                style={style.field}
                id='stateTax'
                name='stateTax'
                type='number'
                floatingLabelText='State Tax'
                hintText='State Tax'
                halfWidth
                rate='%'
                onChange={handleFormChange}
                value={form?.stateTax || ''}
              />
              <div className='dual-spacer' />
              <div style={style.field} />
            </div>
          </FormInput>
        </FormPane>
      </PrimaryPane>
    </>
  )
}
export default FeeSettings

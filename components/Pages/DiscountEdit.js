import ServerError from "../../components/Forms/ServerError"
import { useState, useEffect, useCallback, useRef } from "react"
import Button from "../../components/Buttons/Button"
import Switch from "../../components/Buttons/Switch"
import { useWindowSize } from "../../hooks/useWindowSize"
import MenuItem from "../../components/Menus/MenuItem"
import SuggestionMenu from "../../components/Menus/SuggestionMenu"
import TextField from "../../components/Forms/TextField"
import Select from "../../components/Forms/Select"
import { capitalize, isEmpty } from "../../helpers"
import firebase from "../../firebase/clientApp"
import { useRouter } from "next/router"
import Tag from "../../components/Pill/Tag"
import { useUser } from "../../context/userContext"
import useOnClickOutside from "../../hooks/useOnClickOutside"
import { useRouting } from "../../context/routingContext"
import { Footer } from "../../components/Console"
import { PrimaryPane, FormPane, FormInput } from "../../components/Console"
import { NotificationManager } from "react-notifications"
import isEqual from "lodash.isequal"
import { useForm } from "../../context/formContext"
import { useDispatchModal } from "../../context/modalContext"
import { DeleteDiscount } from "../../components/Modals"


const isDate = (date) => {
  return Boolean(new Date(date) !== "Invalid Date" && !isNaN(new Date(date)))
}

const todaysDate = new Date().toJSON().slice(0, 10)

const generateTime = () => {
  const dt = new Date(1970, 0, 1)
  const rc = []
  while (dt.getDate() === 1) {
    //console.log(dt.getHours())
    if (dt.getHours() >= 9 && dt.getHours() <= 22) {
      rc.push({
        label: dt
          .toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
          .toLowerCase(),
        value: dt.getHours(),
      })
    }

    dt.setMinutes(dt.getMinutes() + 60)
  }

  return rc
}
const styles = {
  field: {
    flex: "1 1 0",
    minWidth: 0,
  },
}

const EditDiscount = ({ fireMenuBrands, fireDiscount }) => {
  const { width, height } = useWindowSize()
  const { fireCollection, user, fireUser } = useUser()
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [serverError, setServerError] = useState(null)
  const { form, setForm, error, setError } = useForm()
  const [defaultData, setDefaultForm] = useState({})
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const [suggestions, setSuggestions] = useState([])
  const [brandSuggestions, setBrandSuggestions] = useState([])
  const [collectionSuggestions, setCollectionSuggestions] = useState([])
  const [tags, setTags] = useState([])
  const [filteredSuggestions, setFilteredSuggestions] = useState([])
  const [timeList, setTimeList] = useState(generateTime())
  const ref = useRef()
  const { modalDispatch, modalState } = useDispatchModal()
  const { setNavLoading } = useRouting()

  const closeModal = () => {
    modalDispatch({
      type: "MODAL_UPDATE",
      payload: {
        modal: {
          isOpen: false,
          key: [],
          component: null,
        },
      },
    })
  }

  useEffect(() => {
    alert('ok')
    return () => {
      setForm({})
      setError({})
      closeModal()
    }
  }, [])



  useEffect(() => {
    if (fireDiscount.status === "success" && Boolean(fireDiscount.data)) {
      //const _data = JSON.parse(JSON.stringify(data))
      const _data = { ...fireDiscount.data }
      //console.log("_data")
      //console.log(_data)

      if (typeof _data.dateStart === "object" && _data.dateStart !== null) {
        let dateStart = new Date(1970, 0, 1) // Epoch
        dateStart.setSeconds(_data.dateStart.seconds)
        _data.dateStart = dateStart.toJSON().slice(0, 10)
      }
      if (typeof _data.dateEnd === "object" && _data.dateEnd !== null) {
        let dateEnd = new Date(1970, 0, 1) // Epoch
        dateEnd.setSeconds(_data.dateEnd.seconds)
        _data.dateEnd = dateEnd.toJSON().slice(0, 10)
      }
      if (_data.dateEnd === false) {
        _data.dateEnd = ""
      }
      _data.rate = `${_data?.rate}`
      setDefaultForm({...{ ..._data }, ...{filterSearch:''}})
      setForm({...{ ..._data }, ...{filterSearch:''}})
      //console.log("{ ..._data }")
      //console.log({ ..._data })
      setDisabled(false)
    }
  }, [fireDiscount])

  useOnClickOutside(
    ref,
    useCallback(() => {
      console.log("ONCLICK OPEN FALSE")
      setOpen(false)
    })
  )
  useEffect(() => {
    setSuggestions([...collectionSuggestions, ...brandSuggestions])
  }, [brandSuggestions, collectionSuggestions])

  useEffect(() => {
    if (
      fireMenuBrands?.status === "success" &&
      Boolean(fireMenuBrands?.data)
    ) {
      let tempSuggestions = []
      let { data } = fireMenuBrands
      console.log("Object.entries(data)")
      data = Object.entries(data)
      if (data.length > 0) {
        for (const [key, value] of data) {
          if (
            !["id", "order"].includes(key.toLowerCase()) &&
            parseInt(value) > 0
          ) {
            tempSuggestions.push(key.toLowerCase())
          }
        }
      }
      setBrandSuggestions(tempSuggestions)
    }
  }, [fireMenuBrands])

  useEffect(() => {
    if (!open) {
      setForm((oldForm) => ({ ...{ ...oldForm }, ...{ filterSearch: "" } }))
    }
  }, [open])

  useEffect(() => {
    let tempSuggestions = []
    if (fireCollection.length > 0) {
      for (const key in fireCollection) {
        tempSuggestions.push(fireCollection[key])
      }
    }
    setCollectionSuggestions(tempSuggestions)
  }, [fireCollection])

  useEffect(() => {
    const tempTags = []
    if (form?.filters?.length) {
      for (const key in form.filters) {
        tempTags.push(
          <Tag
            key={key}
            label={capitalize(form.filters[key])}
            value={form.filters[key]}
            onClick={handleTagClick}
          />
        )
      }
    }
    setTags(tempTags)
  }, [form])

  useEffect(() => {
    let tempArray = []
    if (form?.filterSearch?.length > 0) {
      const suggestionSearchFilter = suggestions.filter(
        (suggestion) =>
          suggestion.toLowerCase().substring(0, form.filterSearch.length) ===
          form.filterSearch.toLowerCase()
      )
      const removeSelectedFilters = suggestionSearchFilter.filter(
        (filter) => !form.filters.includes(filter)
      )
      tempArray = removeSelectedFilters
    }

    if (tempArray.length) {
      !open && setOpen(true)
    }
    setFilteredSuggestions(tempArray)
  }, [suggestions, form])

  /* open modal */
  const openModal = (component) => {
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
  }
  const deleteDiscount = () => {
    if (router?.query?.id) {
      const component = () => <DeleteDiscount id={router.query.id} />
      openModal(component)
    } else {
      NotificationManager.error("An error has occurred")
    }
  }
  const handleActiveSwitch = (e) => {
    const { checked } = e.target
    setForm({ ...form, ...{ active: checked } })
  }
  const handleMethodSelect = (_, method) => {
    let methodProps = {}
    if (method.value === "credit") {
      methodProps = {
        type: { label: "Flat Rate", value: "flatRate" },
        rate: "",
      }
    }
    if (method.value === "event") {
      methodProps = { type: { label: "Percent", value: "percent" }, rate: "" }
    }
    setForm({ ...form, ...{ method }, ...methodProps })
  }
  const handleTypeSelect = (_, type) => {
    setForm({ ...form, ...{ type }, ...{ rate: "" } })
  }
  const handleAlertSwitch = (e) => {
    const { checked } = e.target
    setForm({ ...form, ...{ alert: checked } })
  }
  const handleEventDaySelect = (_, eventDay) => {
    setForm({ ...form, ...{ eventDay } })
  }
  const handleFilterSelect = (_, filters) => {
    if (filters.value === "all") {
      form.filters = ["all"]
    } else {
      form.filters.push(filters.value)
      form.filters = form.filters.filter((tag) => tag !== "all")
    }
    setForm((oldForm) => ({ ...oldForm, ...{ filterSearch: "" } }))
    setOpen(false)
  }
  const handleFilterFocus = () => {
    clearErrors()
  }
  const handleFilterBlur = () => {}
  const clearErrors = () => {
    setServerError(false)
  }
  const handleTagClick = (_, value) => {
    const filters = form.filters.filter((tag) => tag !== value)
    setForm({ ...form, ...{ filters } })
  }
  const handleTimeEndSelect = (_, timeEnd) => {
    setForm({ ...form, ...{ timeEnd } })
  }
  const handleTimeStartSelect = (_, timeStart) => {
    setForm({ ...form, ...{ timeStart } })
  }
  const updateDiscount = useCallback(
    async (e) => {
      // const discount = JSON.parse(JSON.stringify(form))

      const _form = { ...form }
      const _error = { ...error }

      if (isEmpty(_form?.title)) {
        _error.title = "Discount name required."
        NotificationManager.error(_error.title)
        return setError({ ..._error })
      }

      if (_form?.method?.value === "coupon" && isEmpty(_form?.code)) {
        _error.code = "Code required."
        NotificationManager.error(_error.code)
        return setError({ ..._error })
      }

      if (isEmpty(_form?.rate)) {
        _error.rate = "Rate required."
        NotificationManager.error(_error.rate)
        return setError({ ..._error })
      }

      let discountRate = null
      if (_form?.type?.value === "flatRate") {
        const parseFloatRate = parseFloat(_form?.rate)
        if (parseFloatRate > 100 || parseFloatRate < 1) {
          _error.rate = "Invalid rate."
          NotificationManager.error(_error.rate)
          return setError({ ..._error })
        }
        discountRate = parseFloatRate
      } else {
        const parseIntRate = parseInt(_form?.rate)
        if (parseIntRate > 50 || parseIntRate <= 1) {
          _error.rate = "Invalid rate."
          NotificationManager.error(_error.rate)
          return setError({ ..._error })
        }
        discountRate = parseIntRate
      }
      _form.rate = discountRate

      if (isEmpty(_form?.filters)) {
        _error.filters = "Choose 'Cart Total' if no filter required"
        NotificationManager.error(_error.filters)
        return setError({ ..._error })
      }

      if (_form?.method?.value !== "event" && !isDate(_form?.dateStart)) {
        _error.dateStart = "Invalid date."
        NotificationManager.error(_error.dateStart)
        return setError({ ..._error })
      }

      //   if (
      //     _form?.method?.value !== "event" &&
      //     todaysDate > _form?.dateStart
      //   ) {
      //     _error.dateStart = "Invalid date."
      //     NotificationManager.error(_error.dateStart)
      //     return setError({ ..._error })
      //   }

      if (
        _form?.method?.value === "event" &&
        parseInt(_form?.timeStart?.value) >= parseInt(_form?.timeEnd?.value)
      ) {
        _error.time = "Invalid time."
        NotificationManager.error(_error.time)
        return setError({ ..._error })
      }

      if (_form?.method?.value !== "event") {
        delete _form.eventDay
        delete _form.timeStart
        delete _form.timeEnd
        if (isEmpty(_form?.dateEnd)) {
          _form.dateEnd = false
        } else if (isDate(_form?.dateEnd)) {
        //   if (todaysDate >= _form?.dateEnd) {
        //     _error.dateEnd = "Invalid date."
        //     NotificationManager.error(_error.dateEnd)
        //     return setError({ ..._error })
        //   }
          _form.dateEnd = firebase.firestore.Timestamp.fromDate(
            new Date(_form?.dateEnd)
          )
        }
        _form.dateStart = firebase.firestore.Timestamp.fromDate(
          new Date(_form?.dateStart)
        )
      } else {
        delete _form?.dateEnd
        delete _form?.dateStart
      }

      if (_form?.method?.value !== "coupon") {
        delete _form.code
      }

      delete _form.filterSearch
      _form.rate = parseFloat(_form?.rate)
      _form.sort = _form?.method?.value
      _form.kind = _form?.type?.value


      setLoading(true)
      setNavLoading(true)
      try {
        const db = firebase.firestore()
        await db.collection("discounts").doc(router.query.id).update(_form)
        NotificationManager.success("Saved Changes")
        router.push(`/${user?.uid}/discounts`)
      } catch (error) {
        if (error?.message) {
          setServerError(error?.message)
          NotificationManager.error(error?.message)
        } else {
          setServerError("An error has occurred.")
          NotificationManager.error("An error has occurred.")
        }
        setNavLoading(false)
        setLoading(false)
      }
    },
    [form, fireDiscount, router, defaultData]
  )
  const handleInputChange = (e, v) => {
    setForm({ ...{ ...form }, ...{ [`${e?.target?.name || "error"}`]: v } })
  }

  const isCoupon = Boolean((form?.method?.value || "") === "coupon")
  const isEvent = Boolean((form?.method?.value || "") === "event")
  const isFlatRate = Boolean((form?.type?.value || "") === "flatRate")
  const isMobile = Boolean(width <= 1024 && height <= 768)
  const isTypeDisabled = Boolean(
    ["credit", "event"].includes(form?.method?.value || "")
  )
  const stack = false
  return (
    <>
      {/* OUTLET */}
      <PrimaryPane
        id='discount-edit'
        mountToBottom={
          <div
            style={{ maxWidth: "706px" }}
            className='primary-no-card-section'>
            <div className='no-card-title'>Discount Removal</div>
            <p className='no-card-paragraph'>This action cannot be undone.</p>
            <Button
              variant='delete'
              disabled={loading}
              loading={loading}
              onClick={deleteDiscount}
              text='Delete Discount'
            />
          </div>
        }>
        {/* SETTINGS CONTENT */}
        <FormPane>
          {/* SERVER ERROR */}
          {Boolean(serverError) && <ServerError text={serverError?.message} />}
          {/** Live */}
          <FormInput>
            <div style={{ marginBottom: "16px" }}>
              <div className='switch-position'>
                <label htmlFor='switchLive' className='form-switch-label'>
                  Set Live?
                </label>
                <Switch
                  hasEdit={Boolean(defaultData?.active !== form?.active)}
                  onChange={handleActiveSwitch}
                  id='switchLive'
                  isSelected={form?.active}
                />
              </div>
            </div>
          </FormInput>
          {/** Title */}
          <FormInput label={"Discount Name"} stack={stack}>
            <TextField
              id='title'
              name='title'
              type='text'
              floatingLabelText='Discount Name'
              hintText='$10 off of all products'
              fullWidth
              helperText='This will be shown to the customer when applied.'
              validationErrorText={error?.title || ""}
              hasError={Boolean(error?.title)}
              onFocus={clearErrors}
              onChange={handleInputChange}
              value={`${form?.title}` || ""}
              hasEdit={Boolean(`${defaultData?.title||''}` !== `${form?.title||''}`)}
            />
          </FormInput>
          {/** Method */}
          <FormInput label={"Method"} stack={stack}>
            <div className='dual-input'>
              <Select
                hasEdit={Boolean(`${defaultData?.method?.value||''}` !== `${form?.method?.value||''}`)}
                style={styles.field}
                id='method'
                name='method'
                disabled={true}
                floatingLabelText='Select Method'
                hintText='Coupon/Credit'
                halfWidth
                selectedOption={form?.method}
                onSelect={handleMethodSelect}>
                <MenuItem label={"Coupon"} value={"coupon"} />
                <MenuItem label={"Credit"} value={"credit"} />
                <MenuItem label={"Event"} value={"event"} />
              </Select>

              {isCoupon && (
                <>
                  <div className='dual-spacer' />
                  <TextField
                    style={styles.field}
                    id='code'
                    name='code'
                    type='text'
                    floatingLabelText='Code'
                    hintText='BUD10'
                    halfWidth
                    //onChange={handleCodeChange}
                    onChange={handleInputChange}
                    validationErrorText={error?.code || ""}
                    hasError={Boolean(error?.code)}
                    onFocus={clearErrors}
                    value={`${form?.code}` || ""}
                    hasEdit={Boolean(`${defaultData?.code||''}` !== `${form?.code||''}`)}
                  />
                </>
              )}
            </div>
          </FormInput>
          {/*Type*/}
          <FormInput label={"Type"} stack={stack}>
            <div className='dual-input'>
              <Select
                style={styles.field}
                id='type'
                name='type'
                floatingLabelText='Select Type'
                hintText='Flat Rate'
                halfWidth
                disabled={isTypeDisabled}
                helperText='Customers will enter this at checkout.'
                selectedOption={form?.type}
                hasEdit={Boolean(`${defaultData?.type?.value||''}` !== `${form?.type?.value||''}`)}
                onSelect={handleTypeSelect}>
                <MenuItem label={"Flat Rate"} value={"flatRate"} />
                <MenuItem label={"Percent"} value={"percent"} />
              </Select>
              <div className='dual-spacer' />
              <TextField
                style={styles.field}
                id='rate'
                name='rate'
                type='number'
                floatingLabelText={isFlatRate ? "Amount" : "Percent"}
                helperText={isFlatRate ? "Max $100.00" : "Max 50%"}
                hintText={isFlatRate ? "10.00" : "10"}
                halfWidth
                onChange={handleInputChange}
                validationErrorText={error?.rate || ""}
                hasError={Boolean(error?.rate)}
                onFocus={clearErrors}
                value={`${form?.rate}` || ""}
                rate={isFlatRate ? "$" : "%"}
                hasEdit={Boolean(`${defaultData?.rate||''}` !== `${form?.rate||''}`)}
              />
            </div>
          </FormInput>
          {/**  Applies to */}
          <FormInput label={"Applies to"} stack={stack}>
            <TextField
              id='filterSearch'
              name='filterSearch'
              type='text'
              floatingLabelText='Applies to'
              hintText='Cart Total'
              fullWidth
              style={{ marginBottom: 0 }}
              //helperText='This will be shown to the customer when applied.'
              validationErrorText={error?.filters || ""}
              hasError={Boolean(error?.filters)}
              onFocus={handleFilterFocus}
              onBlur={handleFilterBlur}
              onChange={handleInputChange}
              value={`${form?.filterSearch || ""}`}
              autoComplete='off'
              hasEdit={Boolean(`${defaultData?.filters||''}` !== `${form?.filters||''}`)}
            />
            <SuggestionMenu
              {...{ open }}
              onSelect={handleFilterSelect}
              forwardRef={ref}
              triggerElement={
                <div id={"suggestions"} style={{ position: "relative" }} />
              }>
              {filteredSuggestions.length ? (
                filteredSuggestions.map((x) => (
                  <MenuItem
                    id={`suggestion_${x}`}
                    key={`suggestion_${x}`}
                    label={capitalize(x)}
                    value={x}
                  />
                ))
              ) : (
                <MenuItem
                  label={"Cart Total"}
                  value={"all"}
                  id={`suggestion_all_products`}
                  key={`suggestion_all_products`}
                />
              )}
            </SuggestionMenu>
            <div
              style={{
                display: "flex",
                minHeight: "16px",
                flexWrap: "wrap",
              }}>
              {tags}
            </div>
          </FormInput>
         
          {/*Schedule*/}
          <FormInput label={"Schedule"} stack={stack}>
            <div className='dual-input'>
              {!isEvent && (
                <>
                  <Select
                    style={styles.field}
                    id='recurring'
                    name='recurring'
                    floatingLabelText='Select Frequency'
                    hintText='ex. One Time'
                    halfWidth
                    //disabled={isTypeDisabled}
                    //helperText='Customers will enter this at checkout.'
                    selectedOption={form.recurring?{label:'Recurring',value:true}:{label:'One Time',value:false}}
                    //onOpen={handleSelectOpen}
                    //onClose={handleSelectClose}
                    onSelect={(_, recurring) =>  
                      setForm(oldForm=>({ ...oldForm, ...{recurring:recurring?.value } })) 
                    }
                    >
                    <MenuItem label={"One Time"} value={false} />
                    <MenuItem label={"Recurring"} value={true} />
                  </Select>
                  {/* <TextField
                    style={styles.field}
                    name='startDate'
                    type={"date"}
                    floatingLabelText='Start Date'
                    required
                    halfWidth
                    id='startDate'
                    hintText={Boolean(isMobile) ? "mm/dd/yyyy" : ""}
                    onChange={handleStartChange}
                    validationErrorText={error?.dateStart || ""}
                    hasError={Boolean(error.dateStart)}
                    onFocus={clearErrors}
                    value={`${form?.dateStart||''}`}
                  /> */}

                  <div className='dual-spacer' />
                  <TextField
                    style={styles.field}
                    name='dateEnd'
                    type='date'
                    floatingLabelText='End Date'
                    required
                    halfWidth
                    id='dateEnd'
                    hintText={Boolean(isMobile) ? "mm/dd/yyyy" : ""}
                    onChange={handleInputChange}
                    validationErrorText={error?.dateEnd || ""}
                    hasError={Boolean(error?.dateEnd)}
                    onFocus={clearErrors}
                    value={`${form?.dateEnd}` || ""}
                    hasEdit={Boolean(`${defaultData?.dateEnd||''}` !== `${form?.dateEnd||''}`)}
                  />
                </>
              )}
              {/* {isEvent && (
                <>
                  <Select
                    style={styles.field}
                    id='startTime'
                    name='startTime'
                    floatingLabelText='Start Time'
                    hintText='9:00 am'
                    halfWidth
                    //disabled={isTypeDisabled}
                    hasEdit={Boolean(`${defaultData?.timeStart?.value||''}` !== `${form?.timeStart?.value||''}`)}
                    selectedOption={form?.timeStart}
                    onSelect={handleTimeStartSelect}>
                    {Object.keys(timeList).map((key) => {
                      const { label, value } = timeList[key]
                      return <MenuItem key={key} label={label} value={value} />
                    })}
                  </Select>

                  <div className='dual-spacer' />
                  <Select
                    style={styles.field}
                    id='endTime'
                    name='endTime'
                    floatingLabelText='End Time'
                    hintText='10:00 pm'
                    halfWidth
                    onOpen={clearErrors}
                    //disabled={isTypeDisabled}
                    selectedOption={form?.timeEnd}
                    hasEdit={Boolean(`${defaultData?.timeEnd?.value||''}` !== `${form?.timeEnd?.value||''}`)}
                    onSelect={handleTimeEndSelect}
                    validationErrorText={error?.time || ""}
                    hasError={Boolean(error?.time)}>
                    {Object.keys(timeList).map((key) => {
                      const { label, value } = timeList[key]
                      return <MenuItem key={key} label={label} value={value} />
                    })}
                  </Select>
                </>
              )} */}
            </div>
          </FormInput>
          {/**Alert */}
          <FormInput>
            <div className='switch-position'>
              <label htmlFor='switchAlert' className='form-switch-label'>
                Alert Customers?
              </label>
              <Switch
                onChange={handleAlertSwitch}
                id='switchAlert'
                isSelected={Boolean(form?.alert)}
                hasEdit={Boolean(defaultData?.alert !== form?.alert)}
              />
            </div>
          </FormInput>
          {/**/}
        </FormPane>
        {/* PREVIEW */}
      </PrimaryPane>
      {/* SUBMIT */}
      <Footer isShowing={true}>
        <Button
          //disabled={loading}
          loading={loading}
          disabled={
            !Boolean(fireDiscount?.data) ||
            loading ||
            isEmpty(form) ||
            isEqual({ ...form }, { ...defaultData })
          }
          onClick={updateDiscount}
          text='Save Changes'
        />
      </Footer>
    </>
  )
}
export default EditDiscount

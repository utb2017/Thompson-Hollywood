import ServerError from "../../components/Forms/ServerError"
import { useState, useEffect, useCallback, useRef } from "react"
import Switch from "../../components/Buttons/Switch"
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
import { useFirestoreQuery } from "../../hooks/useFirestoreQuery"
import { Footer } from "../../components/Console"
import { useRouting } from "../../context/routingContext"
import Button from "../../components/Buttons/Button"
import { useWindowSize } from "../../hooks/useWindowSize"
import { PrimaryPane, FormPane, FormInput } from "../../components/Console"
import { NotificationManager } from "react-notifications"
import { useForm } from "../../context/formContext"
import Spinner from "../../components/Buttons/Spinner"
import isEqual from "lodash.isequal"

const styles = {
  field: {
    flex: "1 1 0",
    minWidth: 0,
  },
}

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
const defaultError = {
  /** Bool -  Will disable coupons or remove credits from accounts  */
  active: false,
  /** String - This will be shown to the customer when applied.  */
  title: false,
  /** String - Can be "credit" or "coupon"  */
  method: false,
  /** String - Needed if "coupon" method is selected."  */
  code: false,
  /** Obj - Can be "flatRate" or "percent"  */
  type: false,
  /** Number -  Can be a flat rate or percent  */
  rate: false,
  /** Date -  Will be the start date - This is required.  */
  // dateStart: false,
  /** Date -  Will be the end date - This is NOT required.  */
  dateEnd: false,
  /** Date -  Will be the end date - This is NOT required.  */
  time: false,
  /** Date -  Will be the end date - This is NOT required.  */
  filter: false,
}

const CreateDiscount = () => {
  const { width, height } = useWindowSize()
  const { fireCollection, user, fireUser, fireMenuBrands } = useUser()
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState(null)
  const { form, setForm, error, setError } = useForm()
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const [suggestions, setSuggestions] = useState([])
  const [brandSuggestions, setBrandSuggestions] = useState([])
  const [collectionSuggestions, setCollectionSuggestions] = useState([])
  const [tags, setTags] = useState([])
  const [filteredSuggestions, setFilteredSuggestions] = useState([])
  const [isSelectOpen, setIsSelectOpen] = useState(false)
  const timeList = useRef(generateTime())
  const { setNavLoading, navLoading } = useRouting()
  const ref = useRef()

  const defaultForm = {
    /** Bool -  Will disable coupons or remove credits from accounts  */
    active: false,
    /** String - This will be shown to the customer when applied.  */
    title: "",
    /** String - Can be "credit" or "coupon"  */
    method: { label: "Coupon", value: "coupon" },
    /** String - Needed if "coupon" method is selected."  */
    code: "",
    /** Obj - Can be "flatRate" or "percent"  */
    type: { label: "Flat Rate", value: "flatRate" },
    /** Number -  Can be a flat rate or percent  */
    rate: "",
    /** Date -  Will be the start date - This is required.  */
    //dateStart: todaysDate,
    /** Date -  Will be the end date - This is NOT required.  */
    dateEnd: "",
    /**  */
    alert: false,
    /**  */
    alertSent: false,
    /**  */
    eventDay: { label: "Sunday", value: [0] },
    /**  */
    filters: ["all"],
    /**  */
    filterSearch: "",
    /**  */
    recurring: false,
    /**  */
    days: [],
  }
  useOnClickOutside(
    ref,
    useCallback(() => {
      console.log("ONCLICK OPEN FALSE")
      setOpen(false)
    })
  )
  /* form setup */
  useEffect(() => {
    setForm({ ...defaultForm })
    return () => {
      setForm({})
      setError({})
    }
  }, [])

  useEffect(() => {
    console.log("todaysDate")
    console.log(todaysDate)
  }, [todaysDate])

  useEffect(() => {
    setSuggestions([...collectionSuggestions, ...brandSuggestions])
  }, [brandSuggestions, collectionSuggestions])

  useEffect(() => {
    if (fireMenuBrands.status === "success" && Boolean(fireMenuBrands.data)) {
      let tempSuggestions = []
      let { data } = fireMenuBrands
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
        (filter) => !form?.filters?.includes(filter)
      )
      tempArray = removeSelectedFilters
    }

    if (tempArray.length) {
      !open && setOpen(true)
    }
    setFilteredSuggestions(tempArray)
  }, [suggestions, form])

  const handleActiveSwitch = (e) => {
    const { checked } = e.target
    setForm({ ...form, ...{ active: checked } })
  }
  const handleTitleChange = (_, title) => {
    setForm({ ...form, ...{ title } })
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
  const handleCodeChange = (_, code) => {
    setForm({ ...form, ...{ code } })
  }
  const handleTypeSelect = (_, type) => {
    setForm({ ...form, ...{ type }, ...{ rate: "" } })
  }
  const handleRateChange = (_, rate) => {
    setForm({ ...form, ...{ rate } })
  }
  // const handleStartChange = (_, dateStart) => {
  //   setForm({ ...form, ...{ dateStart } })
  // }
  const handleEndChange = (_, dateEnd) => {
    setForm({ ...form, ...{ dateEnd } })
  }
  const handleAlertSwitch = (e) => {
    const { checked } = e.target
    setForm({ ...form, ...{ alert: checked } })
  }
  const handleEventDaySelect = (_, eventDay) => {
    setForm({ ...form, ...{ eventDay } })
  }
  const handleFilterChange = (_, filterSearch) => {
    setForm({ ...form, ...{ filterSearch } })
  }
  const handleFilterSelect = (_, filters) => {
    if (filters.value === "all") {
      form.filters = ["all"]
    } else {
      form.filters.push(filters.value)
      form.filters = form.filters.filter((tag) => tag !== "all")
    }
    setForm((oldForm)=>({ ...oldForm, ...{ filterSearch: "" } }))
    setOpen(false)
  }
  const handleFilterFocus = () => {
    clearErrors()
  }
  const handleFilterBlur = () => {}
  const clearErrors = () => {
    setError(defaultError)
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
  const handleSelectOpen = () => {
    setIsSelectOpen(true)
  }
  const handleSelectClose = () => {
    setIsSelectOpen(false)
  }

  const createDiscount = useCallback(
    async (e) => {
      const _form = { ...form }
      const _error = { ...error }

      console.log("_form")
      console.log(_form)

      if (isEmpty(_form?.title)) {
        _error.title = "Discount name required."
        NotificationManager.error(_error.title)
        return setError({ ..._error })
      }
      if (_form?.method?.value !== "credit" && isEmpty(_form?.code)) {
        _error.code = "Code required."
        NotificationManager.error(_error.code)
        return setError({ ..._error })
      }
      if (isEmpty(_form?.rate) && _form?.type?.value !== "taxFree") {
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



      if (
        _form?.method?.value === "event" &&
        parseInt(_form?.timeStart?.value) >= parseInt(_form?.timeEnd?.value)
      ) {
        _error.time = "Invalid time."
        NotificationManager.error(_error.time)
        return setError({ ..._error })
      }

      if (_form?.recurring === false) {
        //one time
        if (isEmpty(_form?.dateEnd)) {
          _form.dateEnd = false
        } else if (isDate(_form?.dateEnd)) {
          if (todaysDate >= _form?.dateEnd) {
            _error.dateEnd = "Invalid date."
            NotificationManager.error(_error.dateEnd)
            return setError({ ..._error })
          }
          _form.dateEnd = firebase.firestore.Timestamp.fromDate(
            new Date(_form?.dateEnd)
          )
        }
      } else {
        //recurring
        _form.dateEnd = false
      }

      if (_form?.method?.value === "credit") {
        delete _form?.code
      }
      delete _form.filterSearch
      _form.days = _form?.eventDay?.value || []
      _form.sort = _form?.method?.value || ''
      _form.kind = _form?.type?.value || ''
      _form.used = false
      _form.usedTotal = 0

      //return;
      setLoading(true)
      setNavLoading(true)
      try {
        const ref = firebase.firestore().collection("discounts").doc()
        _form.id = ref.id
        await ref.set(_form)
        NotificationManager.success("Discount created.")
        router.push(`/${user?.uid}/discounts`)
      } catch (error) {
        if (error?.message) {
          setServerError(error?.message)
          NotificationManager.error(error?.message)
        } else {
          setServerError("An error has occurred.")
          NotificationManager.error("An error has occurred.")
        }
        setLoading(false)
        setNavLoading(false)
      }
    },
    [form, user, error]
  )
  const isCoupon = Boolean((form?.method?.value || "") === "coupon")
  // const isEvent = Boolean((form?.method?.value || "") === "event")
  const isFlatRate = Boolean((form?.type?.value || "") === "flatRate")
  const isMobile = Boolean(width <= 1024 && height <= 768)
  const isTypeDisabled = Boolean(
    ["credit", "event"].includes(form?.method?.value || "")
  )

  return (
    <>
      {/* OUTLET */}
      <PrimaryPane id='discounts-create' reverse={false}>
        {/* SETTINGS CONTENT */}
        <FormPane>
          {/* SERVER ERROR */}
          {Boolean(serverError) && <ServerError text={serverError.message} />}
          {/** Live */}
          <FormInput>
            <div style={{marginTop:18, marginBottom:8}} className='switch-position'>
              <label htmlFor='switchLive' className='form-switch-label'>
                Set Live?
              </label>
              <Switch
                onChange={handleActiveSwitch}
                id='switchLive'
                isSelected={form.active}
              />
            </div>
          </FormInput>
          {/** Title */}
          <FormInput label={"Discount Name !"} stack={true}>
            <TextField
              id='DiscountName'
              name='DiscountName'
              type='text'
              floatingLabelText='Discount Name'
              hintText='$10 off of all products'
              fullWidth
              helperText='This will be shown to the customer when applied.'
              validationErrorText={error.title || ""}
              hasError={Boolean(error.title)}
              onFocus={clearErrors}
              onChange={handleTitleChange}
              value={`${form?.title||''}`}
            />
          </FormInput>
          {/** Method */}
          <FormInput label={"Method"} stack={true}>
            <div className='dual-input'>
              <Select
                style={styles.field}
                id='method'
                name='method'
                floatingLabelText='Select Method'
                hintText='Coupon/Credit'
                halfWidth
                selectedOption={form.method}
                //onOpen={handleSelectOpen}
                //onClose={handleSelectClose}
                onSelect={handleMethodSelect}>
                <MenuItem label={"Coupon"} value={"coupon"} />
                <MenuItem label={"Credit"} value={"credit"} />
                {/* <MenuItem label={"Event"} value={"event"} /> */}
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
                    onChange={handleCodeChange}
                    validationErrorText={error.code || ""}
                    hasError={Boolean(error.code)}
                    onFocus={clearErrors}
                  />
                </>
              )}

              {/* {isEvent && (
                <>
                  <div className='dual-spacer' />
                  <Select
                    style={styles.field}
                    id='eventDay'
                    name='eventDay'
                    floatingLabelText='Select Day'
                    hintText='Thursday'
                    halfWidth
                    selectedOption={form.eventDay}
                    //onOpen={handleSelectOpen}
                    //onClose={handleSelectClose}
                    onSelect={handleEventDaySelect}>
                    <MenuItem label={"Sundays"} value={0} />
                    <MenuItem label={"Mondays"} value={1} />
                    <MenuItem label={"Tuesdays"} value={2} />
                    <MenuItem label={"Wednesdays"} value={3} />
                    <MenuItem label={"Thursdays"} value={4} />
                    <MenuItem label={"Fridays"} value={5} />
                    <MenuItem label={"Saturdays"} value={6} />
                    <MenuItem label={"Everyday"} value={7} />
                    <MenuItem label={"Weekends"} value={8} />
                    <MenuItem label={"Weekdays"} value={9} />
                  </Select>
                </>
              )} */}
            </div>
          </FormInput>
          {/* Type */}
          <FormInput label={"Type"} stack={true}>
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
                selectedOption={form.type}
                onOpen={handleSelectOpen}
                onClose={handleSelectClose}
                onSelect={handleTypeSelect}>
                <MenuItem label={"Flat Rate"} value={"flatRate"} />
                <MenuItem label={"Percent"} value={"percent"} />
                <MenuItem label={"Tax Free"} value={"taxFree"} />
              </Select>
              {form?.type?.value !== 'taxFree' && <>
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
                onChange={handleRateChange}
                validationErrorText={error.rate || ""}
                hasError={Boolean(error.rate)}
                onFocus={clearErrors}
                value={`${form?.rate||''}`}
                //rate='%'
                rate={isFlatRate ? "$" : "%"}
              />
              </>}
            </div>
          </FormInput>
          {/** Applies to */}
          <FormInput label={"Applies to"} stack={true}>
            <TextField
              id='filter'
              name='filter'
              type='text'
              floatingLabelText='Applies to'
              hintText='Cart Total'
              fullWidth
              style={{ marginBottom: 0 }}
              //helperText='This will be shown to the customer when applied.'
              validationErrorText={error.filters || ""}
              hasError={Boolean(error.filters)}
              onFocus={handleFilterFocus}
              onBlur={handleFilterBlur}
              onChange={handleFilterChange}
              value={`${form?.filterSearch||''}`}
              autoComplete='off'
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
          <FormInput label={"Frequency"} stack={true}>
            <div className='dual-input'>
     
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
                  {!form?.recurring && (<TextField
                    style={styles.field}
                    name='endDate'
                    type='date'
                    floatingLabelText='End Date'
                    required
                    halfWidth
                    id='endDate'
                    hintText={Boolean(isMobile) ? "mm/dd/yyyy" : ""}
                    onChange={handleEndChange}
                    validationErrorText={error.dateEnd || ""}
                    hasError={Boolean(error.dateEnd)}
                    onFocus={clearErrors}
                  />)}
                  {form?.recurring && (
                    <Select
                      style={styles.field}
                      id='eventDay'
                      name='eventDay'
                      floatingLabelText='Select Day'
                      hintText='Thursday'
                      halfWidth
                      selectedOption={form.eventDay}
                      //onOpen={handleSelectOpen}
                      //onClose={handleSelectClose}
                      onSelect={handleEventDaySelect}>
                        <MenuItem label={"Sundays"} value={[0]} />
                        <MenuItem label={"Mondays"} value={[1]} />
                        <MenuItem label={"Tuesdays"} value={[2]} />
                        <MenuItem label={"Wednesdays"} value={[3]} />
                        <MenuItem label={"Thursdays"} value={[4]} />
                        <MenuItem label={"Fridays"} value={[5]} />
                        <MenuItem label={"Saturdays"} value={[6]} />
                        <MenuItem label={"Weekends"} value={[1,2,3,4,5]} />
                        <MenuItem label={"Weekdays"} value={[6,0]} />
                    </Select>
                  )}

                </>
              
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
                    onOpen={handleSelectOpen}
                    onClose={handleSelectClose}
                    selectedOption={form.timeStart}
                    onSelect={handleTimeStartSelect}>
                    {Object.keys(timeList.current).map((key) => {
                      const { label, value } = timeList.current[key]
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
                    onOpen={handleSelectOpen}
                    onClose={handleSelectClose}
                    selectedOption={form.timeEnd}
                    onSelect={handleTimeEndSelect}
                    validationErrorText={error.time || ""}
                    hasError={Boolean(error.time)}>
                    {Object.keys(timeList.current).map((key) => {
                      const { label, value } = timeList.current[key]
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
              />
            </div>
          </FormInput>
          {/**/}
        </FormPane>
       
      {/* PREVIEW */}
      </PrimaryPane>
       <div style={{width:'100%',height:250}}/> 
      {/* SUBMIT */}
      <Footer isShowing={true}>
        <Button
          //disabled={loading}
          disabled={
            navLoading || loading || !fireMenuBrands?.data || isEmpty(form) || isEqual({ ...form }, { ...defaultForm })
          }
          loading={loading}
          onClick={createDiscount}
          text='Create Discount'
        />
      </Footer>
    </>
  )
}
export default CreateDiscount
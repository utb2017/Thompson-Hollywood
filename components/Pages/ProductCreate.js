import { useRouter } from "next/router"
import SVGIcon from "../../components/SVGIcon"
import { useState, useEffect, useCallback } from "react"
import { useUser } from "../../context/userContext"
import style from "../../styles/page/products/create.module.scss"
import Select from "../../components/Forms/Select"
import Filter from "../../components/Forms/Filter"
import MenuItem from "../../components/Menus/MenuItem"
import TextField from "../../components/Forms/TextField"
import { useDispatchModal } from "../../context/modalContext"
import ServerError from "../../components/form/ServerError"
import Button from "../../components/Buttons/Button"
import { Upload } from "../../components/Modals"
import firebase from "../../firebase/clientApp"
import presetImgObject from "../../helpers/presetImageObject"
import { useForm } from "../../context/formContext"
import { useRouting } from "../../context/routingContext"
import { NotificationManager } from "react-notifications"
import { capitalize, GENMOME, EFFECTS, isEmpty } from "../../helpers"
import { useFirestoreQuery } from "../../hooks/useFirestoreQuery"
import {
  Footer,
  FormInput,
  FormPane,
  PrimaryPane,
  SidePane,
  FormProductPreview,
} from "../../components/Console"
import isEqual from "lodash.isequal"
import Switch from "../Buttons/Switch"

const CreateProduct = () => {
  const { user, fireUser } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { modalDispatch, modalState } = useDispatchModal()
  const { form, setForm, error, setError } = useForm()
  const { setNavLoading, navLoading } = useRouting()
  const [serverError, setServerError] = useState(null)


  const fireCollections = useFirestoreQuery(
    user?.uid && firebase.firestore().collection("collections")
  )
  const fireBrands = useFirestoreQuery(
    user?.uid && firebase.firestore().collection("brands")
  )

  const defaultForm = {
    active: false,
    brand: null,
    cbd: null,
    collections: [],
    description: "No description provided",
    genome: null,
    id: null,
    img:null,
    inventory: null,
    key: null,
    name: null,
    onSale: false,
    price: null,
    saleCode: null,
    saleRate: null,
    saleTitle: null,
    sold: 0,
    thc: null,
    weight: null,
    wholesale: null,
  }

  useEffect(() => {
console.log("frm")
console.log(form)
  }, [form]);


  
  /* form setup */
  useEffect(() => {
    setNavLoading(false)
    setForm({ ...defaultForm })
    return () => {
      setForm({})
      setError({})
    }
  }, [])

  /* set image when type change */
  // useEffect(() => {
  //   console.log("form.collection")
  //   if (form?.collections instanceof Array && form?.collections?.length ) {
  //     setForm({ ...form, img: presetImgObject[form?.collection] })
  //   }
  // }, [form?.collections])

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
  /* edit image */
  const addProductPhoto = () => {
    const uploadProps = {
      formKey: "img",
      storage: "Products",
      label: "Add Photo",
      imgType: ["jpeg", "jpg", "png", "gif"],
    }
    const component = () => <Upload {...uploadProps} />
    openModal(component)
  }

  const handleInputChange = (e, v) => {
    setForm({ ...{ ...form }, ...{ [`${e?.target?.name || "error"}`]: v } })
  }
  const handleActiveSwitch = (e) => {
    const { checked } = e.target
    setForm({ ...form, ...{ active: checked } })
  }









  const submitForm = useCallback(async () => {
    const _form = { ...form }
    const _error = { ...error }


    if (isEmpty(`${form?.name||''}`)) {
      _error.name = "Name required."
      NotificationManager.error(_error.name)
      return setError({ ..._error })
    }

    if (isEmpty(`${form?.brand||''}`)) {
      _error.brand = "Brand required."
      NotificationManager.error(_error.brand)
      return setError({ ..._error })
    }

    if (isEmpty(`${form?.price||''}`)) {
      _error.price = "Price required."
      NotificationManager.error(_error.price)
      return setError({ ..._error })
    }

    if (isEmpty(`${form?.wholesale||''}`)) {
      _error.wholesale = "Wholesale required."
      NotificationManager.error(_error.wholesale)
      return setError({ ..._error })
    }

    if (isEmpty(`${form?.inventory||''}`)) {
      _error.inventory = "Inventory required."
      NotificationManager.error(_error.inventory)
      return setError({ ..._error })
    }

    if (isEmpty(`${form?.description||''}`)) {
      _form.description = `No description available.`
    }
    //TODO: Rename type to collection in the database
    //_form.type = _form.collection
    _form.inventory = parseInt(_form?.inventory||0)
    _form.price = parseFloat(_form?.price||0)
    _form.wholesale = parseFloat(_form?.wholesale||0)
    // _form.brandID =  `${_form?.brand?.value||''}`
    // //_form.genomeID =  `${_form?.genome?.value||''}`


    // if (form.collections instanceof Array && form.collections.length) {
    //   const tempArray = []
    //   for(const key in form.collections){
    //       const collection = form.collections[key]
    //       if(typeof collection.value === 'string'){
    //         tempArray.push(collection.value)
    //       }
    //   }
    //   _form.collectionIDs = tempArray
    // }


    

    setLoading(true)
    setNavLoading(true)
    try {
      const createProduct = firebase.functions().httpsCallable("createProduct")
      const response = await createProduct(_form)
      console.log("createProduct")
      console.log(response?.data)
      if (response?.data?.success === true) {
        NotificationManager.success("Product created.")
        setForm({ ...defaultForm })
        //closeModal()
      }
    } catch (e) {
      setError(`${e?.message || e}`)
      NotificationManager.error(`${e?.message || e}`)
    } finally {
      setLoading(false)
      setNavLoading(false)
    }
  }, [form, error])

  return (
    <>
      {/* OUTLET */}
      <PrimaryPane>
        <FormPane>
          {/* SERVER ERROR */}
          {Boolean(serverError) && <ServerError text={`${serverError}`} />}
          {/** Live */}
          <FormInput>
            <div style={{ marginTop: 18, marginBottom: 18 }} className='switch-position'>
              <label htmlFor='switchLive' className='form-switch-label'>
                Set Live?
              </label>
              <Switch onChange={handleActiveSwitch} id='switchLive' isSelected={form.active} />
            </div>
          </FormInput>
          {/**/}
          {/* NAME */}
          <FormInput label={"Name"} stack={false}>
            <TextField
              hasError={Boolean(error?.name)}
              validationErrorText={`${error?.name || ""}`}
              onFocus={() => setError({})}
              id='name'
              name='name'
              type='text'
              floatingLabelText='Product Name'
              hintText='Enter product name.'
              autoComplete='off'
              fullWidth
              onChange={handleInputChange}
              value={`${form?.name||''}`}
            />
          </FormInput>
          {/**/}
          {/* Collections */}
          <FormInput label={"Collections"} stack={false}>

            <Filter
              id='collection'
              name='collection'
              onFocus={() =>
                setError({})
              }
              hasError={Boolean(error?.collections)}
              validationErrorText={`${error?.collections || ""}`}
              floatingLabelText='Collection(s)'
              hintText='Select a Collection'
              bottomMenu={{
                label: "Create collection",
                link: `/${user?.uid}/menu/collections`,
              }}
              disabled={!Boolean(fireCollections?.data?.length > 0)}
              // onRemove={(e, v) =>{
              //   setForm({ ...{ ...form }, ...{ collections: v || "" } })
              //   console.log("v")
              //   console.log(v)
              // }}
              selectedOption={form?.collections||undefined}
              onSelect={(e, v) =>{
                setForm({ ...{ ...form }, ...{ collections: v || "" } })
                console.log("v")
                console.log(v)
              }}
              fullWidth>
                {Boolean(fireCollections?.data?.length)?fireCollections.data.map((x) => {
                  if(!(form?.collections||[]).some( y => `${y?.value}` === `${x?.key}` )){
                    return(
                        <MenuItem
                          id={`suggestion_${x?.title||``}`}
                          key={`suggestion_${x?.title||``}`}
                          label={`${capitalize(x?.title||``)}`}
                          value={`${x?.id||``}`}
                        />
                    )
                  }else{
                    return <></>
                  }
                  }): <></> }
            </Filter>
          </FormInput>
          {/**/}
          {/* BRAND */}
          <FormInput label={"Brand"} stack={false}>
            <Select
              id='brand'
              name='brand'
              hasError={Boolean(error?.brand)}
              validationErrorText={`${error?.brand || ""}`}
              onFocus={() => setError({})}
              floatingLabelText='Brand'
              hintText='Select a brand'
              bottomMenu={{
                label: "Create brand",
                link: `/${user?.uid}/menu/brands`,
              }}
              selectedOption={form?.brand||undefined}
              disabled={!Boolean(fireBrands.data) || !Boolean(fireBrands.data?.length > 0)}
              onSelect={(e, v) =>{
                console.log('v')
                console.log(v)
                setForm(oldForm => ({ ...{ ...oldForm }, ...{ brand: v } }))
              }}
              fullWidth>
              {/* {fireBrands.map((x, i) => (
                <MenuItem
                  key={i}
                  label={x ? `${capitalize(x)}` : ""}
                  value={x ? `${x}` : ""}
                />
              ))} */}
                {Boolean(fireBrands?.data?.length)?fireBrands.data.map((x) => {
                    return(
                        <MenuItem
                          id={`suggestion_${x?.title||``}`}
                          key={`suggestion_${x?.title||``}`}
                          label={`${capitalize(x?.title||``)}`}
                          value={`${x?.id||``}`}
                        />
                    )
                  }): <></> }
            </Select>
          </FormInput>
          {/**/}
          {/* GENOME */}
          <FormInput label={"Type"} stack={false}>
            <Select
              id='genome'
              name='genome'
              hasError={Boolean(error?.genome)}
              validationErrorText={`${error?.genome || ""}`}
              onFocus={() => setError({ ...{ ...error }, ...{ genome: null } })}
              floatingLabelText='Type'
              hintText='Select a type'
              disabled={false}
              onSelect={(e, v) =>
                setForm({ ...{ ...form }, ...{ genome: (v || {label:``,value:``} ) } })
              }
              halfWidth>
              {GENMOME.map((x, i) => (
                <MenuItem
                  key={i}
                  label={x ? `${x}` : ""}
                  value={x ? `${x.toLowerCase()}` : ""}
                />
              ))}
            </Select>
          </FormInput> 
          {/**/}
          {/* IMAGE */}
          <FormInput label={"Photo"} stack={false}>
            <>
              <div className={style["product-image-box"]}>
                {Boolean(form?.img) ? (
                  <img src={form.img} alt={"Product"} />
                ) : (
                  <div className='form-image-placeholder'>
                    <SVGIcon name='photo' />
                  </div>
                )}
              </div>
              <div className={style["upload-btn-box"]}>
                <button
                  onClick={addProductPhoto}
                  className={style["image-button"]}>
                  {" "}
                  Upload Photo{" "}
                </button>
              </div>
            </>
          </FormInput>
          {/* Price */}
          <FormInput label={"Price"} stack={false}>
            <TextField
              hasError={Boolean(error?.price)}
              validationErrorText={`${error?.price || ""}`}
              onFocus={() => setError({ ...{ ...error }, ...{ price: null } })}
              id='price'
              name='price'
              type='number'
              floatingLabelText='Price'
              hintText='i.e. 50.00'
              halfWidth
              rate={"$"}
              onChange={handleInputChange}
              value={`${form?.price||''}`}
            />
          </FormInput>
          {/**/}
          {/* Sale */}
          <FormInput label={<span className='sale'>{"Sale"}</span>} stack={false}>
            <TextField
              hasError={Boolean(error?.sale)}
              validationErrorText={`${error?.sale || ""}`}
              onFocus={() => setError({ })}
              id='sale'
              name='sale'
              type='number'
              floatingLabelText='Sale'
              hintText='i.e. 10 or 0.10'
              halfWidth
              rate={"-"}
              onChange={handleInputChange}
              value={`${form?.sale||''}`}
              helperText={'*ex. 0.10 = %, 10 = $'}
            />
          </FormInput>
          {/**/}
          {/* Wholesale */}
          <FormInput label={"Wholesale"} stack={false}>
            <TextField
              hasError={Boolean(error?.wholesale)}
              validationErrorText={`${error?.wholesale || ""}`}
              onFocus={() =>
                setError({ ...{ ...error }, ...{ wholesale: null } })
              }
              id='wholesale'
              name='wholesale'
              type='number'
              floatingLabelText='Wholesale'
              hintText='i.e. 50.00'
              halfWidth
              rate={"$"}
              onChange={handleInputChange}
              value={`${form?.wholesale||''}`}
            />
          </FormInput>
          {/**/}
          {/*Inventory*/}
          <FormInput label={"Inventory"} stack={false}>
            <TextField
              hasError={Boolean(error?.inventory)}
              validationErrorText={`${error?.inventory || ""}`}
              onFocus={() =>
                setError({ ...{ ...error }, ...{ inventory: null } })
              }
              id='inventory'
              name='inventory'
              type='number'
              floatingLabelText='Inventory'
              hintText='ex. 20'
              halfWidth
              onChange={handleInputChange}
              value={`${form?.inventory||''}`}
            />
          </FormInput>
          {/**/}
          {/*THC CONTENT*/}
          <FormInput label={"THC"} stack={false}>
            <TextField
              hasError={Boolean(error?.thc)}
              validationErrorText={`${error?.thc || ""}`}
              onFocus={() => setError({ ...{ ...error }, ...{ thc: null } })}
              id='thc'
              name='thc'
              type='number'
              floatingLabelText='THC'
              hintText='Enter THC'
              halfWidth
              rate={"%"}
              onChange={handleInputChange}
              value={`${form?.thc||''}`}
            />
          </FormInput>
          {/**/}
          {/*CBD Content*/}
          <FormInput label={"CBD"} stack={false}>
            <TextField
              hasError={Boolean(error?.cbd)}
              validationErrorText={`${error?.cbd || ""}`}
              onFocus={() => setError({ ...{ ...error }, ...{ cbd: null } })}
              id='cbd'
              name='cbd'
              type='number'
              floatingLabelText='CBD'
              hintText='Enter CBD.'
              halfWidth
              rate={"%"}
              onChange={handleInputChange}
              value={`${form?.cbd||''}`}
            />
          </FormInput>
          {/**/}
          {/*WEIGHT*/}
          <FormInput label={"Weight"} stack={false}>
            <TextField
              hasError={Boolean(error?.weight)}
              validationErrorText={`${error?.weight || ""}`}
              onFocus={() => setError({ ...{ ...error }, ...{ weight: null } })}
              id='weight'
              name='weight'
              type='text'
              floatingLabelText='Weight'
              hintText='ex. 1g'
              halfWidth
              //rate={<SVGIcon style={{transform:'scale(0.8)', height:'18px', width:'18px'}} name='weight' />}
              onChange={handleInputChange}
              value={`${form?.weight||''}`}
            />
          </FormInput>
          {/**/}
          {/*Description*/}
          <FormInput
            label={"Description"}
            style={{ marginBottom: "16px" }}
            stack={false}>
            <textarea
              placeholder='Write a detailed description.'
              maxLength={200}
              className={style["input-description"]}
              onChange={({ target: { value } }) =>
                setForm({ ...{ ...form }, ...{ description: value || "" } })
              }
              value={`${form?.description||''}`}
            />
          </FormInput>
          {/**/}
          {/*EFFECTS*/}
          {/* <FormInput label={"Effects"} stack={true}>
            <Select
              id='effect_one'
              name='effect_1'
              floatingLabelText='Effect'
              hintText='Select Effect'
              disabled={false}
              onSelect={(_, x) =>
                setForm((oldForm) => ({
                  ...oldForm,
                  ...{
                    effects: {
                      ...oldForm.effects,
                      0: { ...{ [x.value]: 0 } },
                    },
                  },
                }))
              }
              halfWidth>
              {EFFECTS.map((x, i) => (
                <MenuItem key={i} value={x} label={x} />
              ))}
            </Select>
            <input
              style={{
                display: "block",
                marginBottom: "32px",
                width: "100%",
              }}
              type='range'
              max={100}
              disabled={form?.effects && !Boolean(form?.effects[0])}
              onChange={({ target }) => {
                form.effects[0][Object.keys(form.effects[0])[0]] = target.value
                setForm({ ...form })
              }}
              step={10}
              value={
                form?.effects && form?.effects[0]
                  ? Object.values(form?.effects[0])[0]
                  : 0
              }
            />
            <Select
              id='effect_one'
              name='effect_two'
              floatingLabelText='Effect'
              hintText='Select Effect'
              disabled={false}
              onSelect={(_, x) =>
                setForm((oldForm) => ({
                  ...oldForm,
                  ...{
                    effects: {
                      ...oldForm.effects,
                      1: { ...{ [x.value]: 0 } },
                    },
                  },
                }))
              }
              halfWidth>
              {EFFECTS.map((x, i) => (
                <MenuItem key={i} value={x} label={x} />
              ))}
            </Select>
            <input
              style={{
                display: "block",
                marginBottom: "32px",
                width: "100%",
              }}
              type='range'
              min={0}
              max={100}
              disabled={form?.effects && !Boolean(form?.effects[1])}
              onChange={({ target }) => {
                form.effects[1][Object.keys(form.effects[1])[0]] = target.value
                setForm({ ...form })
              }}
              step={10}
              value={
                form?.effects && form?.effects[1]
                  ? Object.values(form?.effects[1])[0]
                  : 0
              }
            />
            <Select
              id='effect_three'
              name='effect_3'
              floatingLabelText='Effect'
              hintText='Select Effect'
              disabled={false}
              onSelect={(_, x) =>
                setForm((oldForm) => ({
                  ...oldForm,
                  ...{
                    effects: {
                      ...oldForm.effects,
                      2: { ...{ [x.value]: 0 } },
                    },
                  },
                }))
              }
              halfWidth>
              {EFFECTS.map((x, i) => (
                <MenuItem key={i} value={x} label={x} />
              ))}
            </Select>
            <input
              style={{
                display: "block",
                marginBottom: "32px",
                width: "100%",
              }}
              type='range'
              min={0}
              max={100}
              disabled={form?.effects && !Boolean(form?.effects[2])}
              onChange={({ target }) => {
                form.effects[2][Object.keys(form.effects[2])[0]] = target.value
                setForm({ ...form })
              }}
              step={10}
              value={
                form?.effects && form?.effects[2]
                  ? Object.values(form?.effects[2])[0]
                  : 0
              }
            />
            <Select
              id='effect_four'
              name='effect_4'
              floatingLabelText='Effect'
              hintText='Select Effect'
              disabled={false}
              onSelect={(_, x) =>
                setForm((oldForm) => ({
                  ...oldForm,
                  ...{
                    effects: {
                      ...oldForm.effects,
                      3: { ...{ [x.value]: 0 } },
                    },
                  },
                }))
              }
              halfWidth>
              {EFFECTS.map((x, i) => (
                <MenuItem key={i} value={x} label={x} />
              ))}
            </Select>
            <input
              style={{
                display: "block",
                marginBottom: "32px",
                width: "100%",
              }}
              type='range'
              min={0}
              max={100}
              disabled={form?.effects && !Boolean(form?.effects[3])}
              onChange={({ target }) => {
                form.effects[3][Object.keys(form.effects[3])[0]] = target.value
                setForm({ ...form })
              }}
              step={10}
              value={
                form?.effects && form?.effects[3]
                  ? Object.values(form?.effects[3])[0]
                  : 0
              }
            />
          </FormInput>
       */}
        </FormPane>
        {/* SIDE */}
        <SidePane
          style={{ flex: "0 0 260px" }}
          innerStyle={{ alignItems: "center" }}
          title='Product Preview'>
          <FormProductPreview {...{ ...form }} />
        </SidePane>
      </PrimaryPane>
      {/* FOOTER */}
      <Footer isShowing={true}>
        <Button
          disabled={
          navLoading || isEmpty(form) ||  isEmpty(defaultForm) || isEqual({ ...form }, { ...defaultForm })
          }
          loading={loading}
          onClick={submitForm}
          text='Create Product'
        />
      </Footer>
    </>
  )
}

export default CreateProduct

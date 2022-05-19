import { useRouter } from "next/router"
import SVGIcon from "../../components/SVGIcon"
import { useState, useEffect, useRef, useCallback, createRef } from "react"
import { useFirestoreQuery } from "../../hooks/useFirestoreQuery"
import { useUser } from "../../context/userContext"
import Link from "next/link"
import style from "../../styles/page/products/create.module.scss"
import Select from "../../components/Forms/Select"
import Filter from "../../components/Forms/Filter"
import MenuItem from "../../components/Menus/MenuItem"
import TextField from "../../components/Forms/TextField"
//import ProductPreview from "../../components/ProductPreview"
import { useDispatchModal } from "../../context/modalContext"
//import Form from "../../components/form/Form"
import ServerError from "../../components/form/ServerError"
import Button from "../../components/Buttons/Button"
import { useForm } from "../../context/formContext"
import { useRouting } from "../../context/routingContext"
import { NotificationManager } from "react-notifications"
// import {
//   useEditProduct,
//   defaultForm,
//   defaultErrors,
// } from "../../context/editProductContext"
import firebase, {updateProduct} from "../../firebase/clientApp"
//import presetImgObject from "../../helpers/presetImageObject"
import {
  capitalize,
  //scrollToRef,
  GENMOME,
  //imgError,
  //EFFECTS,
  isEmpty,
} from "../../helpers"
import isEqual from "lodash.isequal"
import Switch from "../Buttons/Switch"

import {
  Footer,
  FormInput,
  FormPane,
  PrimaryPane,
  SidePane,
  FormProductPreview,
} from "../../components/Console"
// import Spinner from "../Buttons/Spinner"
import { DeleteProduct, Upload } from "../../components/Modals"

const EditProduct = ({ fireProduct }) => {
  const { user } = useUser()
  const router = useRouter()
  const [serverError, setServerError] = useState(null)
  const { form, setForm, error, setError } = useForm()
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(true)
  const { modalDispatch, modalState } = useDispatchModal()
  const { setNavLoading } = useRouting()
  const [defaultForm, setDefaultForm] = useState({})



  const fireProducts = useFirestoreQuery(
    user?.uid && firebase.firestore().collection("collections")
  )
  const fireBrands = useFirestoreQuery(
    user?.uid && firebase.firestore().collection("brands")
  )

  
  const submitForm = useCallback(async () => {
    const _form = { ...form }
    const _error = { ...error }

    _form.qty = 0
    if (isEmpty(`${_form?.name||''}`)) {
      _error.name = "Name required."
      NotificationManager.error(_error.name)
      return setError({ ..._error })
    }

    if (isEmpty(`${_form?.brand||''}`)) {
      _error.brand = "Brand required."
      NotificationManager.error(_error.brand)
      return setError({ ..._error })
    }

    if (isEmpty(`${_form?.price||''}`)) {
      _error.price = "Price required."
      NotificationManager.error(_error.price)
      return setError({ ..._error })
    }

    if (isEmpty(`${_form?.wholesale||''}`)) {
      _error.wholesale = "Wholesale required."
      NotificationManager.error(_error.wholesale)
      return setError({ ..._error })
    }

    if (isEmpty(`${_form?.inventory||''}`)) {
      _error.inventory = "Inventory required."
      NotificationManager.error(_error.inventory)
      return setError({ ..._error })
    }

    console.log(_form)
    console.log('_form')

    //TODO: Rename type to collection in the database
    //_form.type = _form.collection
    //_form.inventory = parseInt(_form.inventory)
    //_form.price = parseFloat(_form.price)

    
    setLoading(true)
    setNavLoading(true)
    try {
      const response = await updateProduct(_form)
      console.log("updateProduct")
      console.log(response?.data)
      NotificationManager.success("Product updated.")
      //setForm({ ...defaultForm })
        //closeModal()
    } catch (e) {
      setError(`${e?.message || e}`)
      NotificationManager.error(`${e?.message || e}`)
      console.log(e)
    } finally {
      setLoading(false)
      setNavLoading(false)
    }
  }, [form, router, user])





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
  // const setDefaultPic = useCallback(() => {
  //   if (form?.type && form?.img) {
  //     //if has pic and pic not apart of object
  //     let isCustom = true
  //     for (const key in presetImgObject) {
  //       if (form.img[0] === presetImgObject[key][0]) {
  //         isCustom = false
  //       }
  //     }
  //     if (!isCustom) {
  //       setForm({ ...form, ...{ img: presetImgObject[form.type] } })
  //     }
  //   }
  // }, [form])

  // useEffect(() => {
  //   setDefaultPic()
  // }, [form.type])

  useEffect(() => {
    if (fireProduct?.status === "success" && Boolean(fireProduct?.data)) {
      setDefaultForm({...fireProduct.data})
      setForm({...fireProduct.data})
    }
  }, [fireProduct?.data])

  useEffect(() => {
    return () => {
      setForm({})
      setError({})
    }
  }, [])
  const handleActiveSwitch = (e) => {
    const { checked } = e.target
    setForm({ ...form, ...{ active: checked } })
  }

  const deleteProduct = () => {
    if (router?.query?.id) {
      const component = () => <DeleteProduct id={router.query.id} />
      openModal(component)
    } else {
      NotificationManager.error("An error has occurred")
    }
  }

  const handleInputChange = (e, v) => {
    setForm({ ...{ ...form }, ...{ [`${e?.target?.name || "error"}`]: v } })
  }


// useEffect(() => {
//   console.log('form')
//   console.log(form)

// }, [form]);
  
// useEffect(() => {
//   console.log('fireProduct')
//   console.log(fireProduct)

// }, [fireProduct?.data]);



  return (
    <>
      {/* OUTLET */}
      <PrimaryPane
        id='primary_product_pane'
        reverse={false}
        mountToBottom={
          <div className='primary-no-card-section'>
            <div className='no-card-title'>Product Removal</div>
            <p className='no-card-paragraph'>This action cannot be undone.</p>
            <Button
              variant='delete'
              disabled={loading}
              loading={loading}
              onClick={deleteProduct}
              text='Delete Product'
            />
          </div>
        }>
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
              disabled={!Boolean(fireProducts?.data?.length > 0)}
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
                {Boolean(fireProducts?.data?.length)?fireProducts.data.map((x) => {
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
              selectedOption={form?.genome||undefined}
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
       
       
       
        </FormPane>
        {/* SIDE */}
        <SidePane
          style={{ flex: "0 0 260px" }}
          innerStyle={{ alignItems: "center" }}
          title='Product Preview'>
          <FormProductPreview {...{ ...form }} />
        </SidePane>
      </PrimaryPane>
      {/* SUBMIT */}
      <Footer isShowing={true}>
        <Button
          //disabled={loading}
          loading={loading}
          disabled={
            !Boolean(fireProduct?.data) ||
            loading ||
            isEmpty(form) ||
            isEqual({ ...form }, { ...defaultForm })
          }
          onClick={submitForm}
          text='Save Changes'
        />
      </Footer>
    </>
  )
}

export default EditProduct

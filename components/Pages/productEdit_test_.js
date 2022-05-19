import { useRouter } from "next/router"
import SVGIcon from "../../components/SVGIcon"
import { useState, useEffect, useRef, useCallback, createRef } from "react"
import { useFirestoreQuery } from "../../hooks/useFirestoreQuery"
import { useUser } from "../../context/userContext"
import Link from "next/link"
import style from "../../styles/page/products/create.module.scss"
import Select from "../../components/Forms/Select"
import MenuItem from "../../components/Menus/MenuItem"
import TextField from "../../components/Forms/TextField"
import ProductPreview from "../../components/ProductPreview"
import { useDispatchModal } from "../../context/modalContext"
import Form from "../../components/form/Form"
import ServerError from "../../components/form/ServerError"
import Button from "../../components/Buttons/Button"
import { useForm } from "../../context/formContext"
import { useRouting } from "../../context/routingContext"
import {
  useEditProduct,
  defaultForm,
  defaultErrors,
} from "../../context/editProductContext"
import firebase from "../../firebase/clientApp"
import presetImgObject from "../../helpers/presetImageObject"
import {
  capitalize,
  scrollToRef,
  GENMOME,
  imgError,
  EFFECTS,
  isEmpty
} from "../../helpers"
import isEqual from "lodash.isequal"

import {
    Footer,
    FormInput,
    FormPane,
    PrimaryPane,
    SidePane,
    FormProductPreview,
} from "../../components/Console"
import Spinner from "../Buttons/Spinner"
import { DeleteProduct, Upload } from "../../components/Modals"


const EditProduct = ({fireProduct}) => {
  const { user, fireCollection, fireBrands } = useUser()
  const router = useRouter()
  const [serverError, setServerError] = useState(null)
  const { form, setForm, error, setError } = useForm()
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(true)
  const { modalDispatch, modalState } = useDispatchModal()
  const collectionRef = useRef(null)
  const nameRef = useRef(null)
  const typeRef = useRef(null)
  const brandRef = useRef(null)
  const priceRef = useRef(null)
  const sizeRef = useRef(null)
  const inventoryRef = useRef(null)


  const submitForm = useCallback(async () => {
    setLoading(true)

    const { data } = fireProduct

    if (isEqual(form, data)) {
      setLoading(false)
      return router.back()
    }
    if (form.type === null) {
      error.type = "Pick a collection."
      setError({ ...error })
      setLoading(false)
      return scrollToRef(collectionRef)
    }
    if (form.name.length < 1) {
      error.name = "Name required."
      setError({ ...error })
      setLoading(false)
      return scrollToRef(nameRef)
    }
    if (
      form.genome === null &&
      !Boolean(["accessories", "cbd", "edibles"].includes(form.type))
    ) {
      error.genome = "Type required."
      setError({ ...error })
      setLoading(false)
      return scrollToRef(typeRef)
    }
    if (form.brand.length < 1) {
      error.brand = "Brand required."
      setError({ ...error })
      setLoading(false)
      return scrollToRef(brandRef)
    }
    if (form.price < 1) {
      error.price = "Price required."
      setError({ ...error })
      setLoading(false)
      return scrollToRef(priceRef)
    }
    if (
      form.size.length < 1 &&
      !Boolean(["accessories", "cbd", "edibles"].includes(form.type))
    ) {
      error.size = "Size required."
      setError({ ...error })
      return scrollToRef(sizeRef)
    }
    if (form.inventory.length < 1) {
      error.inventory = "Inventory required."
      setError({ ...error })
      setLoading(false)
      return scrollToRef(inventoryRef)
    }
    if (form.description.length < 1) {
      form.description = "No description available."
    }

    const db = firebase.firestore()
    await db.collection("products").doc(router.query.id).update(form)
    router.back()
  }, [form, fireProduct, router])

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
  const setDefaultPic = useCallback(() => {
    if (form?.type && form?.img) {
      //if has pic and pic not apart of object
      let isCustom = true
      for (const key in presetImgObject) {
        if (form.img[0] === presetImgObject[key][0]) {
          isCustom = false
        }
      }
      if (!isCustom) {
        setForm({ ...form, ...{ img: presetImgObject[form.type] } })
      }
    }
  }, [form])

  useEffect(() => {
    setDefaultPic()
  }, [form.type])

  useEffect(() => {
    const { data, status } = fireProduct
    if (status === "success" && Boolean(data)) {
      setForm({ ...form, ...data })
      setDisabled(false)
    }
  }, [fireProduct])

  useEffect(() => {
    return () => {
      setForm(defaultForm)
      setError(defaultErrors)
    }
  }, [])

  const deleteProductX = useCallback(async () => {
    setLoading(true)
    const db = firebase.firestore()
    await db.collection("products").doc(router.query.id).delete()
    setLoading(false)
    router.back()
  }, [router])


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
          {/**/}
          {/* CATEGORY */}
          <FormInput label={"Collection"} stack={false}>
            <Select
              id='collection'
              name='collection'
              onFocus={() =>
                setError({ ...{ ...error }, ...{ collection: null } })
              }
              hasError={Boolean(error?.collection)}
              validationErrorText={`${error?.collection || ""}`}
              floatingLabelText='Collection'
              hintText='Select a Collection'
              bottomMenu={{
                label: "Create collection",
                link: `/${user?.uid}/settings/collections`,
              }}
              disabled={!Boolean(fireCollection.length > 0)}
              onSelect={(e, v) =>
                setForm({ ...{ ...form }, ...{ collection: v?.value || "" } })
              }
              fullWidth>
              {fireCollection.map((x, i) => (
                <MenuItem
                  key={i}
                  label={x ? `${capitalize(x)}` : ""}
                  value={x ? `${x}` : ""}
                />
              ))}
            </Select>
          </FormInput>
          {/**/}
          {/* NAME */}
          <FormInput label={"Name"} stack={false}>
            <TextField
              hasError={Boolean(error?.name)}
              validationErrorText={`${error?.name || ""}`}
              onFocus={() => setError({ ...{ ...error }, ...{ name: null } })}
              id='name'
              name='name'
              type='text'
              floatingLabelText='Product Name'
              hintText='Enter product name.'
              autoComplete='off'
              fullWidth
              onChange={handleInputChange}
              value={`${form?.name}` || ""}
            />
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
                setForm({ ...{ ...form }, ...{ genome: v?.value || "" } })
              }
              fullWidth>
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
          {/* BRAND */}
          <FormInput label={"Brand"} stack={false}>
            <Select
              id='brand'
              name='brand'
              hasError={Boolean(error?.brand)}
              validationErrorText={`${error?.brand || ""}`}
              onFocus={() => setError({ ...{ ...error }, ...{ brand: null } })}
              floatingLabelText='Brand'
              hintText='Select a brand'
              bottomMenu={{
                label: "Create brand",
                link: `/${user?.uid}/settings/brands`,
              }}
              disabled={!Boolean(fireBrands) || !Boolean(fireBrands.length > 0)}
              onSelect={(e, v) =>
                setForm({ ...{ ...form }, ...{ brand: v?.value || "" } })
              }
              fullWidth>
              {fireBrands.map((x, i) => (
                <MenuItem
                  key={i}
                  label={x ? `${capitalize(x)}` : ""}
                  value={x ? `${x}` : ""}
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
              value={`${form?.thc}` || ""}
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
              value={`${form?.cbd}` || ""}
            />
          </FormInput>
          {/**/}
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
              value={`${form?.price}` || ""}
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
              value={`${form?.wholesale}` || ""}
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
              value={`${form?.weight}` || ""}
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
              value={`${form?.inventory}` || ""}
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
              value={`${form?.description}` || ""}
            />
          </FormInput>
          {/**/}
          {/*EFFECTS*/}
          <FormInput label={"Effects"} stack={true}>
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
          // disabled={
          //     !Boolean(fireDiscount?.data) || loading || isEmpty(form) || isEqual({ ...form }, { ...defaultForm })
          // }
          onClick={submitForm}
          text='Save Changes'
        />
      </Footer>
    </>
  )
}

export default EditProduct

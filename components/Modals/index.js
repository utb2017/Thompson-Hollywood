import { useRouter } from "next/router"
import { useEffect, useState, useCallback, useRef } from "react"
import SVGIcon from "../../components/SVGIcon"
import { useRouting } from "../../context/routingContext"
import { useDispatchModal } from "../../context/modalContext"
import { useDispatchModalBase } from "../../context/Modal"
import { useUser } from "../../context/userContext"
import Button from "../../components/Buttons/Button"
import Spinner from "../../components/Buttons/Spinner"
import ServerError from "../../components/Forms/ServerError"
import { useForm } from "../../context/formContext"
import ButtonTS from "../../components/Buttons/ButtonTS"
import firebase, { 
  updateFirestore, 
  getUserByPhone, 
  deleteAuthUser, 
  mergeFirestore,
  updateFirestoreGroup,
  fireCloud,
  addCredit,
  findAddCustomer
} from "../../firebase/clientApp"
import { capitalize } from "../../helpers"
import Checkbox from "../Buttons/Checkbox"
import TextField from "../Forms/TextField"
import { FileInput } from "../Console"
import isEmpty from "lodash.isempty"
import { NotificationManager } from "react-notifications"

import Select from "../../components/Forms/Select"
import MenuItem from "../../components/Menus/MenuItem"
import CartItem from "../../components/CartItem"
import AddressField from "../../components/Forms/AddressField"
import parsePhoneNumber, {
  AsYouType,
} from "libphonenumber-js"
import { toCents } from '../../helpers/typeScriptHelpers'
import { isNum, isStr } from "../../helpers"
import { useFirestore } from "../../hooks/useFirestore"




function validateEmail(mail) {
  if (
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
      mail
    )
  ) {
    return true
  }
  //alert("You have entered an invalid email address!")
  return false
}


export const ReturnsCompleteModal = ({ fireCustomer }) => {
  const { modalDispatch, modalState } = useDispatchModal()
  const [loading, setLoading] = useState(false)
  const clearOwedItems = async () => {
    const customer = { ...fireCustomer }
    customer.data.refundActive = false
    customer.data.refundItems = []
    try {
      setLoading(true)
      await updateFirestore("users", customer.data.uid, customer.data)
      NotificationManager.success("Refunds Updated")
    } catch (error) {
      NotificationManager.error("An error occurred.")
      closeModal()
    } finally {
      setLoading(false)
      closeModal()
    }
  }
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
  return (
    <Modal>
      <div className='standard-modal-card'>
        <div className='standard-modal-content'>
          <div className={"standard-modal-feature"}>
            <h2 className='standard-modal-title'>Returns</h2>
            <div className='standard-modal-subtitle'>
              Where the returns collected?
            </div>
          </div>
          {Boolean(fireCustomer?.data) ? (
            Boolean(fireCustomer?.data?.refundItems) &&
            fireCustomer?.data?.refundItems.map(
              (
                { genome, pid, img, inventory, name, price, size, type, qty, wholesale },
                i
              ) => (
                <CartItem
                  key={i}
                  qty={parseInt(qty)}
                  genome={genome}
                  pid={pid}
                  img={img}
                  inventory={inventory}
                  name={name}
                  price={price}
                  size={size}
                  type={type}
                  disableChange={true}
                  wholesale={wholesale||0}
                />
              )
            )
          ) : (
            <div className='spinner-box'>
              <Spinner />
            </div>
          )}
        </div>
        <Button
          //loading={loading}
          //onClick={closeModal}
          onClick={clearOwedItems}
          fullWidth={true}
          text='Mark Returned'
        />
      </div>
    </Modal>
  )
}
export const ReturnsModal = ({ fireCustomer }) => {
  const { modalDispatch, modalState } = useDispatchModal()
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
  return (
    <Modal>
      <div className='standard-modal-card'>
        <div className='standard-modal-content'>
          <div className={"standard-modal-feature"}>
            <h2 className='standard-modal-title'>Returns</h2>
            <div className='standard-modal-subtitle'>
              Please try and collect these refunded items from the customer.
            </div>
          </div>
          {Boolean(fireCustomer?.data) ? (
            Boolean(fireCustomer?.data?.refundItems) &&
            fireCustomer?.data?.refundItems.map(
              (
                { genome, pid, img, inventory, name, price, size, type, qty, wholesale },
                i
              ) => (
                <CartItem
                  key={i}
                  qty={parseInt(qty)}
                  genome={genome}
                  pid={pid}
                  img={img}
                  inventory={inventory}
                  name={name}
                  price={price}
                  size={size}
                  type={type}
                  disableChange={true}
                  wholesale={wholesale||0}
                />
              )
            )
          ) : (
            <div className='spinner-box'>
              <Spinner />
            </div>
          )}
        </div>
        <Button
          //loading={loading}
          onClick={closeModal}
          fullWidth={true}
          text='Got it'
        />
      </div>
    </Modal>
  )
}
export const ProgressModal = ({ fireOrder }) => {
  //const {form, setForm, error, setError} = useForm()
  //const {fireSettings} = useUser()
  const { modalDispatch, modalState } = useDispatchModal()
  //const {setNavLoading} = useRouting()
  const [loading, setLoading] = useState(false)
  // const [disabled, setDisabled] = useState(false)
  const [selectedProgress, setSelectedProgress] = useState({
    label: capitalize(fireOrder.data?.progress),
    value: fireOrder.data?.progress,
  })

  useEffect(() => {
    setSelectedProgress({
      label: capitalize(fireOrder.data?.progress),
      value: fireOrder.data?.progress,
    })
  }, [fireOrder])

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

  const handleClick = async () => {
    const fieldUpdate = { progress: selectedProgress.value }
    try {
      setLoading(true)
      // setNavLoading(true)
      await updateFirestore("orders", fireOrder.data.id, fieldUpdate)
      NotificationManager.success("Progress Updated.")
    } catch (e) {
      //setNavLoading(false)
      NotificationManager.error(e.message)
    } finally {
      setLoading(false)
      closeModal()
    }
  }

  // useEffect(() => {
  //   setForm({refundItems: []})
  //   return () => setForm({})
  // }, [])
  //const selectedProgress = { label:fireOrder.data?.progress,value:fireOrder.data?.progress }
  //const [selectedProgress, setSelectedProgress] = useState(false)

  return (
    // <Modal>
    //   <div className='modal-card'>
    //     <button onClick={closeModal} className='button-base card-close'>
    //       <SVGIcon color={defaultTheme.colors.action} name={'arrowLeft'} />
    //     </button>
    //     <div className='card-content'>
    //       <div className={'card-feature'}>
    //         <h2 className='card-title'>Edit Order Progress</h2>
    //         <div className='card-sub-title'>Manualy override the progress.</div>
    //       </div>

    //       {Boolean(fireOrder?.data?.progress) ? (
    //         <>

    //         <Select
    //           id='selectedProgress'
    //           name='selectedProgress'
    //           floatingLabelText='Progress'
    //           hintText='Select progress'
    //           disabled={loading}
    //           onSelect={(_, v) => setSelectedProgress({ label:v.label,value:v.value })}
    //           selectedOption={selectedProgress}
    //           fullWidth>
    //             <MenuItem label={'Assigned'} value={'assigned'} />
    //             <MenuItem label={'Pickup'} value={'pickup'} />
    //             <MenuItem label={'Warning'} value={'warning'} />
    //             <MenuItem label={'Arrived'} value={'arrived'} />
    //             <MenuItem label={'Complete'} value={'complete'} />
    //         </Select>
    //          </>
    //       ) : (
    //         <div>
    //           <Spinner />
    //         </div>
    //       )}

    //     </div>
    //     <Button
    //       loading={loading}
    //       disabled={Boolean(fireOrder.data?.progress === selectedProgress.value) || loading}
    //       onClick={handleClick}
    //       fullWidth={false}
    //       text='Update'
    //     />
    //   </div>
    // </Modal>

    <Modal>
      <div className='standard-modal-card'>
        <div className='standard-modal-content'>
          <div className={"standard-modal-feature"}>
            <h2 className='standard-modal-title'>Edit Order Progress</h2>
            <div className='standard-modal-subtitle'>
              Manualy override the progress.
            </div>
          </div>
          {Boolean(fireOrder?.data?.progress) ? (
            <>
              <Select
                id='selectedProgress'
                name='selectedProgress'
                floatingLabelText='Progress'
                hintText='Select progress'
                disabled={loading}
                onSelect={(_, v) =>
                  setSelectedProgress({ label: v.label, value: v.value })
                }
                selectedOption={selectedProgress}
                fullWidth>
                <MenuItem label={"Assigned"} value={"assigned"} />
                <MenuItem label={"Pickup"} value={"pickup"} />
                <MenuItem label={"Warning"} value={"warning"} />
                <MenuItem label={"Arrived"} value={"arrived"} />
                <MenuItem label={"Complete"} value={"complete"} />
              </Select>
            </>
          ) : (
            <div>
              <Spinner />
            </div>
          )}
        </div>
        <Button
          loading={loading}
          disabled={
            Boolean(fireOrder.data?.progress === selectedProgress.value) ||
            loading
          }
          onClick={handleClick}
          fullWidth={false}
          text='Update'
        />
      </div>
    </Modal>
  )
}
export const RefundItem = ({ item, index }) => {
  const { form, setForm } = useForm()
  const { name, img, price, size, pid, type } = item

  const onChange = (event, props) => {
    let formClone = { ...form }
    let itemClone = { ...item }

    if (props.isSelected) {
      if (isEmpty(formClone)) {
        formClone.refundItems = []
      }
      itemClone.qty = 1
      formClone.refundItems[parseInt(props.name)] = itemClone
    } else {
      if (formClone?.refundItems) {
        const itemsClone = []
        for (const key in formClone.refundItems) {
          if (parseInt(key) !== parseInt(props.name)) {
            itemsClone[parseInt(key)] = formClone.refundItems[key]
          }
        }
        formClone.refundItems = itemsClone
      }
    }

    setForm(formClone)
  }

  return (
    <li className='refund-item-row'>
      <div className='refund-item-checkbox'>
        <Checkbox
          name={index.toString()}
          id={`${pid}_${index}`}
          onChange={onChange}
          isSelected={Boolean(form?.refundItems?.[index])}
        />
        {/* Spinner if loading*/}
      </div>
      <div className='refund-item-info'>
        <div className='refund-item-image'>
          <img src={img[0]} alt='alt' />
        </div>
        <div className='refund-item-details'>
          <span className='refund-item-name'>{name || ""}</span>
          <span className='refund-item-weight'>{`${size || ""} - ${
            capitalize(type) || ""
          }`}</span>
        </div>
        <div className='refund-item-price'>
          <span>
            {price.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </span>
        </div>
      </div>
    </li>
  )
}
export const RefundItems = ({ fireOrder }) => {
  const [components, setComponents] = useState([])

  useEffect(() => {
    const tempItems = []
    if (fireOrder?.data?.cart?.items) {
      const { items } = fireOrder.data.cart
      let index = 0
      for (const key in items) {
        const times = parseInt(items[key].qty)
        for (let i = 0; i < times; i++) {
          tempItems.push(
            <RefundItem index={index} key={index} item={items[key]} />
          )
          index++
        }
      }
    }
    setComponents(tempItems)
  }, [fireOrder])

  return <ul className='refund-item-scroll'>{components}</ul>
}
export const Modal = ({ children, noClose=false }) => {
  const { modalDispatch, modalState } = useDispatchModal()
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
  return (
    <div className='upload-modal-container'>
      <div  onClick={!noClose ? closeModal : undefined} className='upload-modal-background' />
      {children}
    </div>
  )
}
export const ModalBaseContainer = ({ children, noClose=false }) => {
  const { modalBaseDispatch, modalBaseState } = useDispatchModalBase()
  const closeModal = () => {
    modalBaseDispatch({
      type: "MODAL_UPDATE",
      payload: {
        modalBase: {
          isOpen: false,
          key: [],
          component: null,
        },
      },
    })
  }
  return (
    <div className='upload-modal-container'>
      <div  onClick={!noClose ? closeModal : undefined} className='upload-modal-background' />
      {children}
    </div>
  )
}
export const Upload = ({
  formKey = "photoURL",
  storage = "photos",
  label = "Add image",
  fileType = ["jpeg", "jpg", "png"]
}) => {
  const { modalDispatch, modalState } = useDispatchModal()
  const { form, setForm } = useForm()
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [progress, setProgress] = useState(null)
  const [file, setFile] = useState(null)
  const { user, fireCustomer } = useUser()
  const taskRef = useRef(null)
  const [photoURL, setPhotoURL] = useState(null)

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
  const handleChange = (e, v) => {
    e.stopPropagation()
    setData(e.target.files[0])
    setFile(e.target.files[0].name)
    setError(false)
    setPhotoURL(URL.createObjectURL(e.target.files[0]))
  }
  const updateProfile = async (photoURL) =>{
    setLoading(true)
    try {
      const fieldUpdate = { photoURL }
      await updateFirestore("users", fireCustomer?.data?.uid, fieldUpdate)
      NotificationManager.success("License Updated")
      closeModal()
    } catch (e) {
      setLoading(false)
      setError(`${e?.message||e||'ERROR'}`)
      NotificationManager.error(e.message)
    }
  }
  // const uploadImgComplete = async (filePath) => {
  //   (`${storage}/${file.name}`)
  //   try {
  //     const photoURL = await taskRef.current.snapshot.ref.getDownloadURL()
  //     setForm({ ...form, ...{ [formKey]: photoURL, filePath:`${filePath}` } })
  //     Boolean(fireCustomer?.data?.uid) && updateProfile(photoURL)
  //     closeModal()
  //     return
  //   } catch (e) {
  //     setError(`${e?.message||e||'ERROR'}`)
  //     setLoading(false)
  //     return
  //   }
  // }
  const uploadImgError = (e) => (setError(`${e?.message||e||'ERROR'}`), setLoading(false))
  const uploadImgNext = (snap) => {
    return setProgress((snap.bytesTransferred / snap.totalBytes) * 100)
  }
  const uploadImgToFireStorage = useCallback(() => {
    setLoading(true)
    const file = data
    const filePath = `${storage}/${file.name}`
    taskRef.current = firebase
      .storage()
      .ref()
      .child(filePath)
      .put(file, { contentType: file.type })

    taskRef.current.on(
      firebase.storage.TaskEvent.STATE_CHANGED,
      uploadImgNext,
      uploadImgError,
      async ()=> {
        try {
          const photoURL = await taskRef.current.snapshot.ref.getDownloadURL()
          setForm({ ...form, ...{ [formKey]: photoURL, filePath } })
          Boolean(fireCustomer?.data?.uid) && updateProfile(photoURL)
          closeModal()
          return
        } catch (e) {
          setError(`${e?.message||e||'ERROR'}`)
          setLoading(false)
          return
        }
      }
    )
  }, [taskRef, user, data])

  return (
    <Modal>
      {/* FORM */}
      <div className='upload-modal-form'>
        {/* PREVIEW */}
        <div className='image-preview'>
          <div className='image-box'>
            {photoURL && photoURL.length ? (
              <img className='form-img' src={photoURL} alt={"Modal Image"} />
            ) : (
              <div className='form-image-placeholder'>
                <SVGIcon color={"rgba(0,0,0,0.2)"} name='photo' />
              </div>
            )}
          </div>
        </div>
        {error && (
          <ServerError style={{ width: "100%" }} text={error.message} />
        )}
        <FileInput
          {...{ fileType }}
          onChange={handleChange}
          onError={setError}
          {...{ progress }}
          text={label}
        />
        <Button
          text={"Upload"}
          disabled={!file || loading}
          loading={loading}
          onClick={uploadImgToFireStorage}
        />
        <div className='image-security'>
          <div className='security-lock'>
            <SVGIcon name={"lockFilled"} color={"rgba(0,0,0,0.87)"} />
          </div>
          All documents are stored securely in a HIPAA-compliant database.
        </div>
      </div>
    </Modal>
  )
}
export const ModalPreview = () => {
  const { form } = useForm()
  const { modalDispatch, modalState } = useDispatchModal()
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
  return (
    <Modal>
      {/* FORM */}
      <div className='preview-modal-form'>
        {/* IMAGE */}
        {/* TITLE */}
        {/* MESSAGE */}
        <div className='preview-content'>
          {form?.popupTitle && (
            <div className='preview-title'>
              {form?.popupTitle || "No Title"}
            </div>
          )}
          {form?.popupImg && (
            <div className='preview-image'>{form?.popupImg || "❓"}</div>
          )}
          {form?.popupMessage && (
            <p className='preview-message'>
              {form?.popupMessage || "No message."}
            </p>
          )}
        </div>
        <Button onClick={closeModal} fullWidth={true} text='Thanks!' />
      </div>
    </Modal>
  )
}
export const RefundModal = ({ fireOrder }) => {
  const router = useRouter()
  const { form, setForm } = useForm()
  const { fireSettings } = useUser()
  const { modalDispatch, modalState } = useDispatchModal()
  const { setNavLoading } = useRouting()
  const [loading, setLoading] = useState(false)
  
  const FieldValue = firebase.firestore.FieldValue
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
    return () => {
      closeModal()
    };
  }, []);

  const handleClick = async () => {
    const { salesTax, localTax, exciseTax } = fireSettings.data
    const _form = {...form}
    const _data = {...fireOrder.data}
    const { cart } = { ..._data }
    const { items } = cart
    const { refundItems } = { ..._form }
    let { grandTotal, subtotal } = cart
    let refundSubTotal = 0
    let refundTotal = 0
    let soldItemsSalesTaxTotal = parseFloat(cart.salesTax)
    let soldItemsLocalTaxTotal = parseFloat(cart.localTax)
    let soldItemsExciseTaxTotal = parseFloat(cart.exciseTax)
    let refundItemsSalesTaxTotal = 0
    let refundItemsLocalTaxTotal = 0
    let refundItemsExciseTaxTotal = 0
    let refundedItems = 0
    for (const key in refundItems) {
      const refundID = refundItems[key].pid
      refundedItems++
      for (const key2 in items) {
        const itemID = items[key2].pid
        /// if ids match reduce qty
        if (itemID === refundID) {
          //*** ITEM REMOVAL */
          items[key2].qty = parseInt(items[key2].qty) - 1
          //***  TAG GENERATION  */
          const itemPrice = parseFloat(items[key2].price)
          const itemExciseTaxtotal = itemPrice * parseFloat(exciseTax)
          const itemLocalTaxtotal = itemPrice * parseFloat(localTax)
          const itemSalesTaxtotal = itemPrice * parseFloat(salesTax)
          const itemGrandTotal =
            itemPrice +
            itemExciseTaxtotal +
            itemLocalTaxtotal +
            itemSalesTaxtotal
          //***  REDUCE SOLD ITEMS TOTALS  */
          subtotal = subtotal - itemPrice
          grandTotal = grandTotal - itemGrandTotal
          soldItemsSalesTaxTotal = soldItemsSalesTaxTotal - itemSalesTaxtotal
          soldItemsLocalTaxTotal = soldItemsLocalTaxTotal - itemLocalTaxtotal
          soldItemsExciseTaxTotal = soldItemsExciseTaxTotal - itemExciseTaxtotal
          //***  INCREASE REFUnd ITEMS TOTALS  */
          refundSubTotal = refundSubTotal + itemPrice
          refundTotal = refundTotal + itemGrandTotal
          refundItemsSalesTaxTotal =
            refundItemsSalesTaxTotal + itemSalesTaxtotal
          refundItemsLocalTaxTotal =
            refundItemsLocalTaxTotal + itemLocalTaxtotal
          refundItemsExciseTaxTotal =
            refundItemsExciseTaxTotal + itemExciseTaxtotal
          if (items[key2].qty < 1) {
            delete items[key2]
          }
        }
      }
    }

    const update = { ...fireOrder.data }

    const arrayOfPid = []
    const combinedItems = []

    for (const key in _form.refundItems) {
      const refundItem = _form.refundItems[key]
      console.log("refundItem")
      console.log(refundItem)
      const { pid } = _form.refundItems[key]
      if (arrayOfPid.includes(pid)) {
        for (const _key in combinedItems) {
          const combinedItem = combinedItems[_key]
          if (combinedItem.pid === pid) {
            combinedItem.qty = parseInt(combinedItem.qty) + 1
          }
        }
      } else {
        combinedItems.push(refundItem)
        arrayOfPid.push(pid)
      }
    }

  
    //DECREASE
    update.cart.items = items.filter((value) => Object.keys(value).length !== 0)
    update.cart.totalItemsSold =FieldValue.increment(-Math.abs(isNum(refundedItems)))
    update.cart.grandTotal =FieldValue.increment(-Math.abs(isNum(refundTotal)))
    update.cart.subtotal =FieldValue.increment(-Math.abs(isNum(refundSubTotal)))
    update.cart.salesTax =FieldValue.increment(-Math.abs(isNum(refundItemsSalesTaxTotal)))
    update.cart.localTax =FieldValue.increment(-Math.abs(isNum(refundItemsLocalTaxTotal)))
    update.cart.exciseTax =FieldValue.increment(-Math.abs(isNum(refundItemsExciseTaxTotal)))

    //IBCREASE
    update.cart.refundItems = combinedItems
    update.cart.totalItemsRefunded =FieldValue.increment(isNum(refundedItems))
    update.cart.refundSubTotal =FieldValue.increment(isNum(refundSubTotal))
    update.cart.refundTotal =FieldValue.increment(isNum(refundTotal))
    update.cart.refundsalesTax =FieldValue.increment(isNum(refundItemsSalesTaxTotal))
    update.cart.refundLocalTax =FieldValue.increment(isNum(refundItemsLocalTaxTotal))
    update.cart.refundExciseTax =FieldValue.increment(isNum(refundItemsExciseTaxTotal))

    update.refund = true
    update.refundActive = true

    delete update.start
    delete update.end


    setNavLoading(true)
    setLoading(true)
    try {
      await updateFirestoreGroup("users", router.query.uid, "Orders", router.query.oid, update)
      NotificationManager.success("Order refunded.")
      closeModal()
    } catch (e) {
      NotificationManager.error("An error occurred.")
      Boolean(e?.message) && NotificationManager.error(e.message)
      console.log(e.message)
      setError({ ...error, ...{ serverError: e } })
    } finally {
      setNavLoading(false)
      return setLoading(false)
    }
  }

  useEffect(() => {
    setForm({ refundItems: [] })
    return () => setForm({})
  }, [])

  return (
    <Modal>
      <div className='standard-modal-card'>
        <div className='standard-modal-content'>
          {fireOrder?.status === "success" ? (
            <RefundItems {...{ fireOrder }} />
          ) : (
            <div className='spinner-box'>
              <Spinner />
            </div>
          )}
        </div>
        <Button
          loading={loading}
          disabled={
            !Boolean(form?.refundItems && form.refundItems?.length) || loading
          }
          onClick={handleClick}
          fullWidth={true}
          text='Refund Selected'
        />
      </div>
    </Modal>
  )
}
export const EditDisplayName = ({noClose=false}) => {
  //alert(modal)
  //const {form, setForm, error, setError} = useForm()
  //const [form, setForm] = useState({displayName:''})
  const {fireCustomer} = useUser()
  const [input, setInput] = useState(fireCustomer?.data?.displayName || "")
  const [error, setError] = useState(null)
  
  const { modalDispatch, modalState } = useDispatchModal()
  //const {setNavLoading} = useRouting()
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)

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

  const handleClick = useCallback(async () => {
    if (input.length) {
      setLoading(true)
      try {
        const fieldUpdate = { displayName: input }
        await updateFirestore("users", fireCustomer.data.uid, fieldUpdate)
        NotificationManager.success("Display Name Updated")
        closeModal()
      } catch (e) {
        setLoading(false)
        setError(e.message)
        NotificationManager.error(e.message)
      }
    }
  }, [input, fireCustomer])

  return (
    <Modal {...{noClose}}>
      <div className='standard-modal-card'>
        <div className='standard-modal-content'>
          <div className={"standard-modal-feature"}>
            <h2 className='standard-modal-title'>Edit Display Name</h2>
            <div className='standard-modal-subtitle'>
              Enter a new display name.
            </div>
          </div>
          {Boolean(fireCustomer?.data) ? (
            <TextField
              style={{ marginBottom: "16px" }}
              disabled={disabled}
              hasError={Boolean(error)}
              validationErrorText={error}
              onFocus={() => setError(null)}
              id='displayName'
              name='displayName'
              type='text'
              floatingLabelText='Change your display name.'
              hintText='Enter display name.'
              fullWidth
              onChange={({ target: { value } }) => setInput(value)}
              value={input || ""}
            />
          ) : (
            <div className='spinner-box'>
              <Spinner />
            </div>
          )}
          <Button
            loading={loading}
            disabled={
              (fireCustomer?.data?.displayName || "") === (input || "") ||
              loading
            }
            style={{float:'right'}}
            onClick={handleClick}
            fullWidth={false}
            text='Save Changes'
          />
        </div>
      </div>
    </Modal>
  )
}
export const EditPhoneNumber = ({ fireCustomer }) => {
  //const {form, setForm, error, setError} = useForm()
  //const [form, setForm] = useState({displayName:''})
  const phoneNumber = parsePhoneNumber(fireCustomer?.data?.phoneNumber|| "")
  const [input, setInput] = useState(phoneNumber.formatNational())
  const [error, setError] = useState(null)
  //const {fireSettings} = useUser()
  const { modalDispatch, modalState } = useDispatchModal()
  //const {setNavLoading} = useRouting()
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)

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
  const phoneButtonDisabled = () => {

      const phoneNumber = parsePhoneNumber(`${input}`, `US`)
      if(phoneNumber){
        if(phoneNumber.isValid()){
          return false
        }else{
          return true
        }
      }
      return true
  }

  const handleClick = async () => {
    const phoneNumber = parsePhoneNumber(`${input}`, `US`)
    if(phoneNumber.isValid()){
      setLoading(true)
      try{
        const data = await getUserByPhone({phone:phoneNumber.format("E.164")})
        if(data){
          setLoading(false)
          setError('Phone number in use.')         
          NotificationManager.error('Phone number in use.')
        }
      }catch(e){    
        try{
          const fieldUpdate = { phoneNumber:phoneNumber.format("E.164") }
          await updateFirestore("users", fireCustomer.data.uid, fieldUpdate)
           NotificationManager.success('Updated phone number.')
           closeModal()
        }catch(err){
          NotificationManager.error('An error occurred.')
        }
      }
    }else{
      NotificationManager.error('Phone number invalid.')
    }
  }

  const formatPhoneNumber = (value) => {
    if (!value) return ""
    value = value.toString()
    if (value.includes("(") && !value.includes(")")) {
      return value.replace("(", "")
    }
    if (value.length && value.length > 14) {
      return value.slice(0, -1)
    }
    return new AsYouType("US").input(value)
  }

  return (
    <>   
    <Modal>
      <div className='standard-modal-card'>
        <div className='standard-modal-content'>
          <div className={"standard-modal-feature"}>
            <h2 className='standard-modal-title'>Edit Phone Number</h2>
            <div className='standard-modal-subtitle'>
              Enter a new phone number.
            </div>
          </div>
          {Boolean(fireCustomer?.data) ? (
              <TextField
              style={{ marginBottom: "16px" }}
              disabled={disabled}
              hasError={Boolean(error)}
              validationErrorText={error}
              onFocus={() => setError(null)}
              id='phoneNumber'
              name='phoneNumber'
              type='text'
              floatingLabelText='Enter a new phone number.'
              hintText='Enter phone number.'
              fullWidth
              onChange={({ target: { value } }) =>
                setInput(formatPhoneNumber(value))
              }
              value={input || ""}
              //readOnly={true}
            />
          ) : (
            <div className='spinner-box'>
              <Spinner />
            </div>
          )}
          <Button
            loading={loading}
            style={{float:'right'}}
            disabled={
              loading || (phoneNumber.formatNational()|| "") === (input || "") || phoneButtonDisabled()
            // phoneNumber.isEqual(input)
            }
            onClick={handleClick}
            fullWidth={false}
            text='Save Changes'
          />
        </div>
      </div>
    </Modal>
    </>

 
 )
}
export const EditEmail = ({ fireCustomer }) => {
  //const {form, setForm, error, setError} = useForm()
  //const [form, setForm] = useState({displayName:''})
  const [input, setInput] = useState(fireCustomer?.data?.email || "")
  const [error, setError] = useState(null)
  //const {fireSettings} = useUser()
  const { modalDispatch, modalState } = useDispatchModal()
  //const {setNavLoading} = useRouting()
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)

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

  const handleClick = useCallback(async () => {
    if (validateEmail(input)) {
      setLoading(true)
      try {
        const fieldUpdate = { email: input }
        await updateFirestore("users", fireCustomer.data.uid, fieldUpdate)
        NotificationManager.success("Display Name Updated")
        closeModal()
      } catch (e) {
        setLoading(false)
        setError(e.message)
        NotificationManager.error(e.message)
      }
    } else {
      NotificationManager.error("invalid Email")
      setError("Invalid Email")
    }
  }, [input, fireCustomer])

  return (
    <Modal>
      <div className='standard-modal-card'>
        <div className='standard-modal-content'>
          <div className={"standard-modal-feature"}>
            <h2 className='standard-modal-title'>Edit Email</h2>
            <div className='standard-modal-subtitle'>
              Enter a new email address.
            </div>
          </div>
          {Boolean(fireCustomer?.data) ? (
            <TextField
              style={{ marginBottom: "16px" }}
              disabled={disabled}
              hasError={Boolean(error)}
              validationErrorText={error}
              onFocus={() => setError(null)}
              id='displayName'
              name='displayName'
              type='text'
              floatingLabelText='Enter a new email address.'
              hintText='Enter email address.'
              fullWidth
              onChange={({ target: { value } }) => setInput(value)}
              value={input || ""}
            />
          ) : (
            <div className='spinner-box'>
              <Spinner />
            </div>
          )}
          <Button          
            style={{float:'right'}}
            loading={loading}
            disabled={
              (fireCustomer?.data?.email || "") === (input || "") || loading
            }
            onClick={handleClick}
            fullWidth={false}
            text='Save Changes'
          />
        </div>
      </div>
    </Modal>
  )
}
export const EditStatus = ({ fireCustomer }) => {
  const { form, setForm, error, setError } = useForm()
  const { fireSettings } = useUser()
  const { modalDispatch, modalState } = useDispatchModal()
  const { setNavLoading } = useRouting()
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [selected, setSelected] = useState({
    label: capitalize(fireCustomer.data?.status),
    value: fireCustomer.data?.status,
  })
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
    setSelected({
      label: capitalize(fireCustomer.data?.status),
      value: fireCustomer.data?.status,
    })
  }, [fireCustomer])

 // const handleClick = async () => {}
  const handleClick = useCallback(async () => {
    if (selected?.value && selected?.value.length) {
      setLoading(true)
      try {
        const fieldUpdate = { status: selected.value }
        await updateFirestore("users", fireCustomer.data.uid, fieldUpdate)
        NotificationManager.success("Status Updated")
        closeModal()
      } catch (e) {
        setLoading(false)
        setError(e.message)
        NotificationManager.error(e.message)
      }
    }
  }, [selected, fireCustomer])

  return (
    <Modal>
      <div className='standard-modal-card'>
        <div className='standard-modal-content'>
          <div className={"standard-modal-feature"}>
            <h2 className='standard-modal-title'>Edit Status</h2>
            <div className='standard-modal-subtitle'>
              Accept or decline the users ability to place orders.
            </div>
          </div>
          {Boolean(fireCustomer?.data?.status) ? (
            <>
              <Select
                id='selectedProgress'
                name='selectedProgress'
                floatingLabelText='Progress'
                hintText='Select progress'
                disabled={loading}
                onSelect={(_, v) =>
                  setSelected({ label: v.label, value: v.value })
                }
                selectedOption={selected}
                fullWidth>
                <MenuItem label={"Accepted"} value={"accepted"} />
                <MenuItem label={"Pending"} value={"pending"} />
                <MenuItem label={"Disabled"} value={"disabled"} />
              </Select>
            </>
          ) : (
            <div>
              <Spinner />
            </div>
          )}
          <Button
            style={{float:'right'}}
            loading={loading}
            disabled={
              (fireCustomer.data?.status || "") === (selected?.value || "") ||
              loading
            }
            onClick={handleClick}
            fullWidth={false}
            text='Save Changes'
          />
        </div>
      </div>
    </Modal>
  )
}
export const EditRole = ({ fireCustomer }) => {
  const { form, setForm, error, setError } = useForm()
  //const {fireSettings, fireUser } = useUser()
  const { modalDispatch, modalState } = useDispatchModal()
  const { setNavLoading } = useRouting()
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [selected, setSelected] = useState({
    label: capitalize(fireCustomer?.data?.role),
    value: fireCustomer?.data?.role,
  })
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
    if (fireCustomer?.data?.role) {
      setSelected({
        label: capitalize(fireCustomer?.data?.role),
        value: fireCustomer?.data?.role,
      })
    }
  }, [fireCustomer])

  const handleClick = useCallback(async () => {
    if (selected?.value && selected?.value.length) {
      setLoading(true)
      try {
        const fieldUpdate = { role: selected.value }
        await updateFirestore("users", fireCustomer.data.uid, fieldUpdate)
        NotificationManager.success("Role Updated")
        closeModal()
      } catch (e) {
        setLoading(false)
        setError(e.message)
        NotificationManager.error(e.message)
      }
    }
  }, [selected, fireCustomer])

  return (
    <Modal>
      <div className='standard-modal-card'>
        <div className='standard-modal-content'>
          <div className={"standard-modal-feature"}>
            <h2 className='standard-modal-title'>Edit Role</h2>
            <div className='standard-modal-subtitle'>
              Edit what the user sees and does on this site.
            </div>
          </div>
          {Boolean(fireCustomer?.data?.status) ? (
            <>
              <Select
                id='selectedProgress'
                name='selectedProgress'
                floatingLabelText='Progress'
                hintText='Select progress'
                disabled={loading}
                onSelect={(_, v) =>
                  setSelected({ label: v.label, value: v.value })
                }
                selectedOption={selected}
                fullWidth>
                <MenuItem label={"Driver"} value={"driver"} />
                <MenuItem label={"Manager"} value={"manager"} />
                <MenuItem label={"Customer"} value={"customer"} />
                <MenuItem label={"Dispatch"} value={"dispatch"} />
              </Select>
            </>
          ) : (
            <div>
              <Spinner />
            </div>
          )}
          <Button
            style={{float:'right'}}
            loading={loading}
            disabled={
              (fireCustomer.data?.role || "") === (selected?.value || "") 
              || loading
            }
            onClick={handleClick}
            fullWidth={false}
            text='Save Changes'
          />
        </div>
      </div>
    </Modal>
  )
}
export const DeleteAccount = ({ fireCustomer }) => {
  //const { form, setForm, error, setError } = useForm()
  const { fireSettings, fireUser } = useUser()
  const { modalDispatch, modalState } = useDispatchModal()
  const { setNavLoading } = useRouting()
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const router = useRouter()

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

  const handleClick = async () => {
    console.log("user")
    console.log(fireCustomer?.data)
    setLoading(true)
    try{
      await deleteAuthUser(fireCustomer?.data)
      NotificationManager.success("Customer deleted")
      closeModal()
      router.back()
    }catch(e){
      NotificationManager.error(e.message)
      //NotificationManager.error("An error has occurred")
      closeModal()
    }
    
  }

  return (
    <Modal>
      <div className='standard-modal-card'>
        <div className='standard-modal-content'>
          <div className={"standard-modal-feature"}>
            <h2 className='standard-modal-title'>Delete Account</h2>
            <div className='standard-modal-subtitle'>
              This action cannot be undone.
            </div>
          </div>
          {/* stuff */}
          <Button
            loading={loading}
            //disabled={!['manager','admin', 'customer'].includes(fireUser?.data?.role||'') }
            onClick={handleClick}  
            variant='delete'
            style={{float:'right'}}
            fullWidth={false}
            spinnerColor={'rgb(212, 54, 132)'}
            text='Delete'
          />
        </div>
      </div>
    </Modal>
  )
}
export const DeleteDiscount = ({ id }) => {
  //const { form, setForm, error, setError } = useForm()
  const { fireSettings, fireUser } = useUser()
  const { modalDispatch, modalState } = useDispatchModal()
  const { setNavLoading } = useRouting()
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const router = useRouter()
  const { user } = useUser()

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

  const handleClick = 
    async (e) => {
      setLoading(true)
      setNavLoading(true)
      try {
        const _deleteDiscount = fireCloud("deleteDiscount")
        const response = await _deleteDiscount(router.query.id)
        console.log("deleteDiscount")
        console.log(response?.data)
        if (response?.data?.success === true) {
          NotificationManager.success("Discount removed.")
          //setTotalsLoading(true)
          closeModal()
        }
      } catch (e) {
    
        setError(`${e?.message || e}`)
        NotificationManager.error(`${e?.message || e}`)
      }finally{
        setLoading(false)
        setNavLoading(false)            
      }
    }


  return (
    <Modal>
      <div className='standard-modal-card'>
        <div className='standard-modal-content'>
          <div className={"standard-modal-feature"}>
            <h2 className='standard-modal-title'>Delete Discount</h2>
            <div className='standard-modal-subtitle'>
              This action cannot be undone.
            </div>
          </div>
          {/* stuff */}
          {Boolean(error) && <ServerError text={`${error?.message||error||''}`} />}
          <Button
            loading={loading}
            disabled={loading}
            //disabled={!['manager','admin', 'customer'].includes(fireUser?.data?.role||'') }
            onClick={handleClick}  
            variant='delete'
            style={{float:'right'}}
            fullWidth={false}
            spinnerColor={'rgb(212, 54, 132)'}
            text='Delete'
          />
        </div>
      </div>
    </Modal>
  )
}
export const DeleteProduct = ({ id }) => {
  const { setNavLoading } = useRouting()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user } = useUser()
  const { modalDispatch, modalState } = useDispatchModal()
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
  const handleClick = async () => {
    setLoading(true)
    setNavLoading(true)
    const db = firebase.firestore()
    try {
      await db.collection("products").doc(id).delete()
      NotificationManager.success("Product deleted.")
      //router.push(`/${user?.uid}/products/all`)
      closeModal()
    } catch (error) {
      if (error?.message) {
        setServerError(error?.message)
        NotificationManager.error(error?.message)
      } else {
        setServerError("An error has occurred.")
        NotificationManager.error("An error has occurred.")
      }

    }finally{
      setLoading(false)
      setNavLoading(false)      
    }
    
  }

  return (
    <Modal>
      <div className='standard-modal-card'>
        <div className='standard-modal-content'>
          <div className={"standard-modal-feature"}>
            <h2 className='standard-modal-title'>Delete Product</h2>
            <div className='standard-modal-subtitle'>
              This action cannot be undone.
            </div>
          </div>
          {/* stuff */}
          <Button
            loading={loading}
            disabled={loading}
            //disabled={!['manager','admin', 'customer'].includes(fireUser?.data?.role||'') }
            onClick={handleClick}  
            variant='delete'
            style={{float:'right'}}
            fullWidth={false}
            spinnerColor={'rgb(212, 54, 132)'}
            text='Delete'
          />
        </div>
      </div>
    </Modal>
  )
}
export const EditAddress = ({onSelect, onClear, noClose=false}) => {
  const { form, setForm, error, setError } = useForm()
  const { fireCustomer } = useUser()
  const [willClose, setWillClose] = useState(noClose);

  useEffect(() => {
    let _noClose = noClose
    if(fireCustomer?.data && fireCustomer?.data?.address && fireCustomer?.data?.inRange === true){
      _noClose = false
    }
    setWillClose(_noClose)

  }, [noClose, fireCustomer.data]);


  const handleSelect =  async (x) => {

    // send this data to the server account
    // need customerID
    // store the address data
    const AddressForm = {
      address: x?.address,
      coords: x?.coords,
      inRange: x?.inRange,
      customerID: customerID
    };
   setTotalsLoading(true)

    try {
      const _storeAddressData = fireCloud("storeAddressData")
      //const form = {discountID,userID}
      const response = await _storeAddressData(AddressForm)
      //console.log("deleteDiscount")
      //console.log(response?.data)
      if (response?.data?.success === true) {
        NotificationManager.success("Address updated.")
        //setTotalsLoading(true)
      }
    } catch (e) {
      NotificationManager.error(`${e?.message || e}`)
      //setTotalsLoading(false)
    }


    if(!x?.inRange){
      setError((oldError)=>({...oldError, ...{serverError:{code:'range',message:'This address is out of range'}}  }))
      //setError((oldError) => ({...{...oldError}, ...{code:'range', message:'This address is out of range.'}})
    }
    setForm(oldForm=>({...oldForm, ...{search:x?.address}}))
    onSelect && onSelect(x)
    //return alert(x?.address||'')
  }
  const handleClear =  (x) => {
    onClear && onClear()
  }

  return (
    <Modal {...{noClose:willClose}}>  
      <div className='standard-modal-card'>
        <div className='standard-modal-content'>
          <div className={"standard-modal-feature"}>
            <h2 className='standard-modal-title'><SVGIcon style={{transform:'scale(0.78) translate3d(-1px, 3px, 0px)'}} name='locationMarkerFilled' />Delivery location</h2>
            {/* <div className='standard-modal-subtitle'>
              Enter Delivery Address.
            </div> */}
            {Boolean(error?.serverError) && <ServerError text={error?.serverError?.message} />}
          </div>
          <AddressField
            onFocus={() => setError(oldError=>({...oldError,...{}}))}
            hasError={Boolean(error?.address || error?.serverError)}
            id='address'
            name='address'
            type='text'
            floatingLabelText='Enter Address'
            hintText='6325 Western St'
            onSelect={handleSelect}
            onClear={handleClear}
            fullWidth
            value={`${form?.search|| ""}`}
            onChange={({ target: { value } }) => setForm((oldForm) => ({...oldForm, ...{search: value } }))}
            autoComplete='off'
        />
        </div>
      </div>
    </Modal>
  )
}
export const AddPromoCode = ({fireFeature}) => {
  //const {form, setForm, error, setError} = useForm()
  //const [form, setForm] = useState({displayName:''})
  const [input, setInput] = useState(fireFeature?.data?.[0]?.code || "")
  const [error, setError] = useState(null)
  //const {fireSettings} = useUser()
  const { modalDispatch, modalState } = useDispatchModal()
  //const {setNavLoading} = useRouting()
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const { user,
    totalsLoading, 
    setTotalsLoading, customerID } = useUser()


  

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

  const handleClick = useCallback(async () => {
    const code = isStr(input)
    if (code?.length) {
      setLoading(true)
      try {  
        const applyDiscount = firebase.functions().httpsCallable("applyDiscount");
        const { data } = await applyDiscount({uid:customerID,code:code})
        console.log('applyDiscount');
        console.log( data );
        //console.log( data.dateStart.toJSON() );
        console.log( data.dateStart );
        if(data?.discountAdded === true){
          NotificationManager.success("Discount applied.")
          
          setTotalsLoading(true)
          closeModal()
        }

       // NotificationManager.success("Display Name Updated")
       // closeModal()
      } catch (e) {
        if(e?.message){
          setError(e)
          NotificationManager.error(e.message)          
        }else{
          setError(`${e}`)
        }
      }
      finally {
        setLoading(false)
      }
    }
  }, [input, customerID])



  return (
    <Modal>
      <div className='standard-modal-card'>
        <div className='standard-modal-content'>
          <div className={"standard-modal-feature"}>
            <h2 className='standard-modal-title'>Enter your promo code.</h2>
          </div>
            {error && (
            <ServerError style={{ width: "100%" }} text={error?.message||''} />
          )}
            <TextField
              style={{ marginBottom: "16px" }}
              disabled={disabled}
              hasError={Boolean(error)}
              validationErrorText={error?.message||''}
              onFocus={() => setError(null)}
              id='promoCode'
              name='promoCode'
              type='text'
              floatingLabelText='Promo code.'
              hintText='ex. BUD420'
              fullWidth
              onChange={({ target: { value } }) => setInput(value)}
              value={input || ''}
            />

          <Button
            loading={loading}
            disabled={loading}
            style={{float:'right', width:'148px'}}
            variant='green'
            onClick={handleClick}
            fullWidth={false}
            text='Apply Code'
          />
        </div>
      </div>
    </Modal>
  )
}
export const DeletePromo = ({discount}) => {
  //const { setNavLoading } = useRouting()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user,
    totalsLoading, 
    setTotalsLoading, customerID } = useUser()
  const [serverError, setServerError] = useState(null)
  const { modalDispatch, modalState } = useDispatchModal()
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


  const handleClick = async () => {
    if(discount?.id && customerID){
      setLoading(true)
      //setNavLoading(true)
      const db = firebase.firestore()
      const userRef = db.collection('users')
      try {  
        await userRef.doc(`${customerID}`).collection('Totals').doc('cart').set({
          loading: true
        }, { merge: true });
        await db.collection("users")
        .doc(`${customerID||''}`)
        .collection('Discounts')
        .doc(`${discount?.id||''}`).delete()
        NotificationManager.success("Promo removed.")
        closeModal()
        setTotalsLoading(true)
      } catch (error) {
        if (error?.message) {
          setServerError(error?.message)
          NotificationManager.error(error?.message)
        } else {
          setServerError("An error has occurred.")
          NotificationManager.error("An error has occurred.")
        }
        setLoading(false)
        //setNavLoading(false)
      }
    }else{
      NotificationManager.error("Error getting discount info.")
    }

    
  }

  return (
    <Modal>
      <div className='standard-modal-card'>
        <div className='standard-modal-content'>
          <div className={"standard-modal-feature"}>
            <h2 className='standard-modal-title'>Remove Promo</h2>
            <div className='standard-modal-subtitle'>
            {`You are removing, ${discount.title}?`}
            </div>
          </div>
          {/* stuff */}
          {serverError && (
            <ServerError style={{ width: "100%" }} text={serverError||'Error'} />)}
          <Button
            loading={loading}
            disabled={loading}
            //disabled={!['manager','admin', 'customer'].includes(fireUser?.data?.role||'') }
            onClick={handleClick}  
            variant='delete'
            style={{float:'right'}}
            fullWidth={false}
            spinnerColor={'rgb(212, 54, 132)'}
            text='Remove'
          />
        </div>
      </div>
    </Modal>
  )
}
export const DeleteCredit = ({discount}) => {
  //const { setNavLoading } = useRouting()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user,
    totalsLoading, 
    setTotalsLoading, customerID } = useUser()
  const [serverError, setServerError] = useState(null)
  const { modalDispatch, modalState } = useDispatchModal()
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


  const handleClick = async () => {
    if(discount?.id && customerID){
      setLoading(true)
      //setNavLoading(true)
      const db = firebase.firestore()
      const userRef = db.collection('users')
      try {  
        // await userRef.doc(`${customerID}`).collection('Totals').doc('cart').set({
        //   loading: true
        // }, { merge: true });
        await db.collection("users")
        .doc(`${customerID||''}`)
        .collection('Credits')
        .doc(`${discount?.id||''}`).delete()
        NotificationManager.success("Credit removed.")
        closeModal()
        //setTotalsLoading(true)
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
        setTotalsLoading(false)
      }
    }else{
      NotificationManager.error("Error getting discount info.")
    }

    
  }

  return (
    <Modal>
      <div className='standard-modal-card'>
        <div className='standard-modal-content'>
          <div className={"standard-modal-feature"}>
            <h2 className='standard-modal-title'>Remove Credit</h2>
            <div className='standard-modal-subtitle'>
            {`You are removing, ${discount.title}? This can not be undone.`}
            </div>
          </div>
          {/* stuff */}
          {serverError && (
            <ServerError style={{ width: "100%" }} text={serverError||'Error'} />)}
          <Button
            loading={loading}
            disabled={loading}
            //disabled={!['manager','admin', 'customer'].includes(fireUser?.data?.role||'') }
            onClick={handleClick}  
            variant='delete'
            style={{float:'right'}}
            fullWidth={false}
            spinnerColor={'rgb(212, 54, 132)'}
            text='Remove'
          />
        </div>
      </div>
    </Modal>
  )
}

export const DeleteCollection = () => {
  //const { form, setForm, error, setError } = useForm()
  
  const { form, setForm } = useForm()
  //const { fireSettings, fireUser } = useUser()
  const { modalDispatch, modalState } = useDispatchModal()
  const { setNavLoading } = useRouting()
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const router = useRouter()
  //const { user } = useUser()

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

  const handleClick = 
    async (e) => {
      setLoading(true)
      setNavLoading(true)
      try {
        const _deleteCollection = fireCloud("deleteCollection")
        const response = await _deleteCollection(form)
        console.log("deleteCollection")
        console.log(response?.data)
        if (response?.data?.success === true) {
          NotificationManager.success("Collection removed.")
          //setTotalsLoading(true)
          closeModal()
        }
      } catch (e) {
    
        setError(`${e?.message || e}`)
        NotificationManager.error(`${e?.message || e}`)
      }finally{
        setLoading(false)
        setNavLoading(false)            
      }
    }


  return (
    <Modal>
      <div className='standard-modal-card'>
        <div className='standard-modal-content'>
          <div className={"standard-modal-feature"}>
            <h2 className='standard-modal-title'>Delete Collection</h2>
            <div className='standard-modal-subtitle'>
              This action cannot be undone.
            </div>
          </div>
          {/* stuff */}
          {Boolean(error) && <ServerError text={`${error?.message||error||''}`} />}
          <Button
            loading={loading}
            disabled={loading}
            //disabled={!['manager','admin', 'customer'].includes(fireUser?.data?.role||'') }
            onClick={handleClick}  
            variant='delete'
            style={{float:'right'}}
            fullWidth={false}
            spinnerColor={'rgb(212, 54, 132)'}
            text='Delete Collection'
          />
        </div>
      </div>
    </Modal>
  )
}
export const DeleteBrand = ({ id }) => {
  //const { form, setForm, error, setError } = useForm()
  const { fireSettings, fireUser } = useUser()
  const { modalDispatch, modalState } = useDispatchModal()
  const { setNavLoading } = useRouting()
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const router = useRouter()
  const { user } = useUser()

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

  const handleClick = 
    async (e) => {
      setLoading(true)
      setNavLoading(true)
      try {
        const _deleteBrand = fireCloud("deleteBrand")
        const response = await _deleteBrand(router.query.id)
        console.log("deleteBrand")
        console.log(response?.data)
        if (response?.data?.success === true) {
          NotificationManager.success("Brand removed.")
          //setTotalsLoading(true)
          closeModal()
        }
      } catch (e) {
    
        setError(`${e?.message || e}`)
        NotificationManager.error(`${e?.message || e}`)
      }finally{
        setLoading(false)
        setNavLoading(false)            
      }
    }


  return (
    <Modal>
      <div className='standard-modal-card'>
        <div className='standard-modal-content'>
          <div className={"standard-modal-feature"}>
            <h2 className='standard-modal-title'>Delete Brand</h2>
            <div className='standard-modal-subtitle'>
              This action cannot be undone.
            </div>
          </div>
          {/* stuff */}
          {Boolean(error) && <ServerError text={`${error?.message||error||''}`} />}
          <Button
            loading={loading}
            disabled={loading}
            //disabled={!['manager','admin', 'customer'].includes(fireUser?.data?.role||'') }
            onClick={handleClick}  
            variant='delete'
            style={{float:'right'}}
            fullWidth={false}
            spinnerColor={'rgb(212, 54, 132)'}
            text='Delete Brand'
          />
        </div>
      </div>
    </Modal>
  )
}
export const AddUserCredit = ({fireCustomer}) => {
  //const {form, setForm, error, setError} = useForm()
  //const [form, setForm] = useState({displayName:''})
  const [inputTitle, setInputTitle] = useState('')
  const [input, setInput] = useState(0)
  const [error, setError] = useState(null)
  //const {fireSettings} = useUser()
  const { modalDispatch, modalState } = useDispatchModal()
  //const {setNavLoading} = useRouting()
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const {setNavLoading} = useRouting()
  // const { user,
  //   totalsLoading, 
  //   setTotalsLoading } = useUser()


  

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

  const handleClick = useCallback(async () => {
    const creditTitle = isStr(inputTitle)
    const creditTotal = isStr(input)
    const userID = isStr(fireCustomer?.data?.uid)

    

    if (!(creditTitle && creditTitle?.length > 0)) {
      return alert("no title")  
    }
    if (!(creditTotal && creditTotal?.length > 0)) {
      return alert("no total")  
    }
    if (!(userID && userID.length > 0)) {
      return alert("no id")
    }
    setLoading(true)
    setNavLoading(true)
    //return alert(`{user:${userID}, amount:${toCents(creditTotal)}, title:${creditTitle}}`)
    try {  


      const call = firebase.functions().httpsCallable("addCredit");
      const response = await call({user:userID, amount:creditTotal, title:creditTitle})
      if (response?.data?.success === true) {
        NotificationManager.success("Coupon created.")
      }

    } catch (e) {   
      setNavLoading(false)
      const _e = e?.message || e || 'Error'
      //setError(_e)
      NotificationManager.error(_e)        
    } finally {
      setLoading(false)
      setNavLoading(false)
      closeModal()
    }

  }, [input, inputTitle, fireCustomer])



  return (
    <Modal>
      <div className='standard-modal-card'>
        <div className='standard-modal-content'>
          <div className={"standard-modal-feature"}>
            <h2 className='standard-modal-title'>Enter credit details.</h2>
          </div>
            {error && (
            <ServerError style={{ width: "100%" }} text={error?.message||''} />
          )}
          <TextField
            style={{ marginBottom: "16px" }}
            disabled={disabled}
            hasError={Boolean(error)}
            validationErrorText={error?.message||''}
            onFocus={() => setError(null)}
            id='creditTitle'
            name='creditTitle'
            type='text'
            floatingLabelText='Credit Title'
            hintText='ex. Pax Pod Refund'
            fullWidth
            onChange={({ target: { value } }) => setInputTitle(value)}
            value={inputTitle || ''}
          />
          <TextField
            style={{ marginBottom: "16px" }}
            disabled={disabled}
            hasError={Boolean(error)}
            validationErrorText={error?.message||''}
            onFocus={() => setError(null)}
            id='creditTotal'
            name='creditTotal'
            type='number'
            floatingLabelText='Credit Total'
            hintText='ex. 48.52'
            halfWidth
            onChange={({ target: { value } }) => setInput(value)}
            value={input || ''}
            />

          <Button
            loading={loading}
            disabled={loading}
            style={{float:'right', width:'148px'}}
            //variant='green'
            onClick={handleClick}
            fullWidth={false}
            text='Add Credit'
          />
        </div>
      </div>
    </Modal>
  )
}
// export const EditUserCredit = ({fireCustomer}) => {
//   //const {form, setForm, error, setError} = useForm()
//   //const [form, setForm] = useState({displayName:''})
//   const [inputTitle, setInputTitle] = useState('')
//   const [input, setInput] = useState(0)
//   const [error, setError] = useState(null)
//   //const {fireSettings} = useUser()
//   const { modalDispatch, modalState } = useDispatchModal()
//   //const {setNavLoading} = useRouting()
//   const [loading, setLoading] = useState(false)
//   const [disabled, setDisabled] = useState(false)
//   const {setNavLoading} = useRouting()
//   // const { user,
//   //   totalsLoading, 
//   //   setTotalsLoading } = useUser()


  

//   const closeModal = () => {
//     modalDispatch({
//       type: "MODAL_UPDATE",
//       payload: {
//         modal: {
//           isOpen: false,
//           key: [],
//           component: null,
//         },
//       },
//     })
//   }

//   const handleClick = useCallback(async () => {
//     const creditTitle = isStr(inputTitle)
//     const creditTotal = isStr(input)
//     const userID = isStr(fireCustomer?.data?.uid)

    

//     if (!(creditTitle && creditTitle?.length > 0)) {
//       return alert("no title")  
//     }
//     if (!(creditTotal && creditTotal?.length > 0)) {
//       return alert("no total")  
//     }
//     if (!(userID && userID.length > 0)) {
//       return alert("no id")
//     }
//     setLoading(true)
//     setNavLoading(true)
//     //return alert(`{user:${userID}, amount:${toCents(creditTotal)}, title:${creditTitle}}`)
//     try {  


//       const call = firebase.functions().httpsCallable("addCredit");
//       const response = await call({user:userID, amount:creditTotal, title:creditTitle})
//       if (response?.data?.success === true) {
//         NotificationManager.success("Coupon created.")
//       }

//     } catch (e) {   
//       setNavLoading(false)
//       const _e = e?.message || e || 'Error'
//       //setError(_e)
//       NotificationManager.error(_e)        
//     } finally {
//       setLoading(false)
//       setNavLoading(false)
//       closeModal()
//     }

//   }, [input, inputTitle, fireCustomer])



//   return (
//     <Modal>
//       <div className='standard-modal-card'>
//         <div className='standard-modal-content'>
//           <div className={"standard-modal-feature"}>
//             <h2 className='standard-modal-title'>Enter credit details.</h2>
//           </div>
//             {error && (
//             <ServerError style={{ width: "100%" }} text={error?.message||''} />
//           )}
//           <TextField
//             style={{ marginBottom: "16px" }}
//             disabled={disabled}
//             hasError={Boolean(error)}
//             validationErrorText={error?.message||''}
//             onFocus={() => setError(null)}
//             id='creditTitle'
//             name='creditTitle'
//             type='text'
//             floatingLabelText='Credit Title'
//             hintText='ex. Pax Pod Refund'
//             fullWidth
//             onChange={({ target: { value } }) => setInputTitle(value)}
//             value={inputTitle || ''}
//           />
//           <TextField
//             style={{ marginBottom: "16px" }}
//             disabled={disabled}
//             hasError={Boolean(error)}
//             validationErrorText={error?.message||''}
//             onFocus={() => setError(null)}
//             id='creditTotal'
//             name='creditTotal'
//             type='number'
//             floatingLabelText='Credit Total'
//             hintText='ex. 48.52'
//             halfWidth
//             onChange={({ target: { value } }) => setInput(value)}
//             value={input || ''}
//             />

//           <Button
//             loading={loading}
//             disabled={loading}
//             style={{float:'right', width:'148px'}}
//             //variant='green'
//             onClick={handleClick}
//             fullWidth={false}
//             text='Add Credit'
//           />
//         </div>
//       </div>
//     </Modal>
//   )
// }
export const FindAccount = ({noClose=false}) => {
  //const {form, setForm, error, setError} = useForm()
  //const [form, setForm] = useState({displayName:''})
  //const phoneNumber = parsePhoneNumber(fireCustomer?.data?.phoneNumber|| "")


  const [willClose, setWillClose] = useState(noClose);
  const { fireCustomer } = useUser()

  useEffect(() => {
    let _noClose = noClose
    if(fireCustomer?.data && fireCustomer?.data?.address && fireCustomer?.data?.inRange === true){
      _noClose = false
    }
    setWillClose(_noClose)

  }, [noClose, fireCustomer.data]);



  const {setCustomerID, customerID } = useUser();
  
  //const {fireSettings} = useUser()
  const { modalDispatch, modalState } = useDispatchModal()
  const {setNavLoading} = useRouting()
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    //alert(input.length)
    if(typeof input === 'string' && input.length){
      const phoneNumber = parsePhoneNumber(input, 'US')
      if(phoneNumber && phoneNumber.isValid()){
        //alert("submit") 
        handleClick()
      }     
    }

  }, [input]);

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
  // const phoneButtonDisabled = () => {

  //     const phoneNumber = parsePhoneNumber(`${input}`, `US`)
  //     if(phoneNumber){
  //       if(phoneNumber.isValid()){
  //         return false
  //       }else{
  //         return true
  //       }
  //     }
  //     return true
  // }
useEffect(() => {
  return () => {
    setLoading(false)
  };
}, []);


  const handleClick = async () => {
    const phoneNumber = parsePhoneNumber(input, 'US')
    setLoading(true)
    try{
      const response = await findAddCustomer({phoneNumber:phoneNumber.number})
      //alert(JSON.stringify(response?.data?.uid))
      //alert(JSON.stringify(response?.data?.customToken))
      //return
      if(response?.data?.uid){
        setCustomerID(response.data.uid)
        //setLoading(false)
        closeModal()
      }else{
        setLoading(false)
        //alert("Error finding ID")
        setError("Error finding ID")
      }
    }catch(error){
      setError(error.message)
      //alert(error.message)
    }
    
  }
  const handleSubmit = useCallback(async () => {
    setInput(`(706) 564-6465`)
  }, [])

  const formatPhoneNumber = (value) => {
    if (!value) return ""
    value = value.toString()
    if (value.includes("(") && !value.includes(")")) {
      return value.replace("(", "")
    }
    // if (value.length && value.length > 14) {
    //   return value.slice(0, -1)
    // }
    return new AsYouType("US").input(value)
  }

  return (
    <>   
    <Modal {...{noClose:willClose}} >
      <div className='standard-modal-card'>
        <div className='standard-modal-content'>
          <div className={"standard-modal-feature"}>
            {/* <h2 className='standard-modal-title'>Phone Number</h2> */}
            <h2 className='standard-modal-title'><SVGIcon style={{transform:'scale(1) translate3d(0px, 3px, 0px)'}} name='callFilled' />Phone Number</h2>
            {/* <div className='standard-modal-subtitle'>
              Enter a phone number.
            </div> */}
          </div>

              <TextField
              style={{ marginBottom: "16px" }}
              disabled={disabled || loading}
              hasError={Boolean(error)}
              validationErrorText={error}
              onFocus={() => setError(null)}
              id='phoneNumber'
              name='phoneNumber'
              type='text'
              floatingLabelText='Enter a new phone number.'
              hintText='Enter phone number.'
              fullWidth
              onChange={({ target: { value } }) =>
                setInput(formatPhoneNumber(value))
              }
              value={input || ""}
              //readOnly={true}
            />
{/* 
          <Button
            loading={loading}
            style={{float:'right'}}
            disabled={
              loading || phoneButtonDisabled()
            // phoneNumber.isEqual(input)
            }
            onClick={handleClick}
            fullWidth={false}
            text='Next'
          /> */}
          <ButtonTS
          disabled={loading}
          loading={loading}
          onClick={handleSubmit}
          text='Demo Customer'
          //ref={reCaptchaRef}
        /> 
        </div>
      </div>
    </Modal>
    </>

 
 )
}
export const DeleteCollectionBase = () => {
  //const { form, setForm, error, setError } = useForm()
  

  //const { fireSettings, fireUser } = useUser()
  const { modalDispatch, modalState } = useDispatchModal()
  const { setNavLoading } = useRouting()
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const { modalBaseDispatch, modalBaseState } = useDispatchModalBase()
  const router = useRouter()
  //const { user } = useUser()

  const closeModal = () => {
    modalBaseDispatch({
      type: "MODAL_UPDATE",
      payload: {
        modalBase: {
          isOpen: false,
          key: [],
          component: null,
        },
      },
    })
  }


  return (
    <ModalBaseContainer>
      <div className='standard-modal-card'>
        <div className='standard-modal-content'>
          <div className={"standard-modal-feature"}>
            <h2 className='standard-modal-title'>Delete Collection</h2>
            <div className='standard-modal-subtitle'>
              This action cannot be undone.
            </div>
          </div>
          {/* stuff */}
          {Boolean(error) && <ServerError text={`${error?.message||error||''}`} />}
          <Button
            loading={loading}
            disabled={loading}
            on
            //disabled={!['manager','admin', 'customer'].includes(fireUser?.data?.role||'') }
            variant='delete'
            style={{float:'right'}}
            fullWidth={false}
            spinnerColor={'rgb(212, 54, 132)'}
            text='Delete Collection'
          />
        </div>
      </div>
    </ModalBaseContainer>
  )
}
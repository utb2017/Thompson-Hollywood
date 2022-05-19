import { useRouter } from "next/router"
import { useUser } from "../../context/userContext"
import React, { createRef, useState, useEffect, useMemo, useCallback, useRef } from "react"
import SVGIcon from "../../components/SVGIcon"
import { addPromo, AddPromoCode, DeletePromo } from "../../components/Modals"
import Link from "next/link"  
import { useDispatchModal } from "../../context/modalContext"
import TextField from "../../components/Forms/TextField"
import { useWindowSize } from "../../hooks/useWindowSize"
import ServerError from "../../components/Forms/ServerError"
import * as d3 from "d3-ease"

import Spinner from "../../components/Buttons/Spinner"
import { NotificationManager } from "react-notifications"
import ReactMapGL, {
  Marker,
  FlyToInterpolator,
  //WebMercatorViewport,
} from "react-map-gl"
import { useCreateOrder } from "../../context/createOrderContext"
import firebase, {
  getUserByPhone,
  createAuthUser,
  getFireUserByPhone,
  createFirestoreUser,
  placeAnOrder,
  getFirestoreDocument,
} from "../../firebase/clientApp"
import { presetImgObject, getMapSize, isEmpty } from "../../helpers"
import { normalizeInput, TOKEN, defaultMap, scrollToRef } from "../../helpers"
import { useRouting } from "../../context/routingContext"
import Button from "../Buttons/Button"
import { useForm } from "../../context/formContext"
import parsePhoneNumber, { AsYouType } from "libphonenumber-js"
import { SplitWindow, InfoPane, MapPane, InfoHeader, MapHeader, ProgressFooter, SlideButton, TotalsRow } from "../Split"
import styles from "./Checkout.module.scss"
import { useFirestoreQuery } from "../../hooks/useFirestoreQuery"




import CartItem from "../../components/Cart/CartItem"
import CartItemSkeleton from "../../components/Cart/CartItemSkeleton"
import CartTotalsSkeleton from "../../components/Cart/CartTotalsSkeleton"



const CartList = ({ fireCartTotals }) => {
  const [cartComponentList, setCartComponentList] = useState([])
  const { fireCart } = useUser()

  useEffect(() => {
    console.log("fireCartTotals")
    console.log(fireCartTotals)
    const tempArray = []
    if (fireCartTotals?.data && fireCart?.data) {
      for (const key in fireCart?.data) {
        const fireProduct = fireCart?.data[key]

        console.log("fireProduct")
        console.log(fireProduct)
        console.log("key")
        console.log(key)
        if (typeof fireProduct === "object" && fireProduct !== null) {
          if(fireProduct?.id !== 'items' && fireProduct?.id !=='totals'){
           tempArray.push(<CartItem {...{ fireProduct }} />)
          }
          
        }
      }
      if (tempArray?.length <= 0) {
        tempArray.push(
          <div className='empty-cart'>
            <div className='empty-bag'>
              <SVGIcon name='bag' />
            </div>
            <h2>Empty Cart</h2>
          </div>
        )
      }
    }
    if (fireCartTotals.status === "loading") {
      const dummy = [0, 1, 2]
      for (const key in dummy) {
       tempArray.push(<CartItemSkeleton key={key} />)
      }
    }

    setCartComponentList(tempArray)
  }, [fireCart?.data, fireCartTotals])

  return cartComponentList
}


let isNum = (x) => {
  const y = 0
  if (x === undefined) return y
  if (x === null) return y
  if (x === NaN) return y
  x = parseFloat(x)
  return isNaN(x) ? y : x
}

let isStr = (x) => {
  const y = ''
  if (x === undefined) return y
  if (x === null) return y
  if (x === NaN) return y
  if (typeof x === 'string' || x instanceof String){
    return x
  }else{
    return y
  }
}

let isCurr = (x) => {
  const y = '$0.00'
  if (x === undefined) return y
  if (x === null) return y
  if (x === NaN) return y
  if (isNum(x)>0){
    return x.toLocaleString(
      "en-US",
      {
        style: "currency",
        currency: "USD",
      }
    )
  }else{
    return y
  }
}

const RemoveButton = ({ onClick }) => {
  const handleClick = (e) => {
    Boolean(onClick) && onClick(e)
  }
  return (
    <button onClick={handleClick} className='button-base'>
      <svg
        width='18px'
        height='18px'
        viewBox='0 0 24 24'
        aria-hidden='true'
        fill='currentColor'
        style={{
          color: "rgb(212, 54, 132)",
          fontSize: "12px",
          marginLeft: "6px",
        }}>
        <path d='M15 4h4.504c.274 0 .496.216.496.495v2.01a.498.498 0 0 1-.496.495H19v13.006A2 2 0 0 1 16.994 22H7.006A2.001 2.001 0 0 1 5 20.006V7h-.504A.492.492 0 0 1 4 6.505v-2.01C4 4.222 4.226 4 4.496 4H9V2.999A1 1 0 0 1 9.99 2h4.02c.546 0 .99.443.99.999V4zm-.491 1H5v1h14V5h-4.491zM6 7.105v12.888C6 20.55 6.449 21 7.002 21h9.996A1.01 1.01 0 0 0 18 19.993V7.105A.1.1 0 0 0 17.896 7H6.104A.109.109 0 0 0 6 7.105zm4-3.997V5h4V3.108c0-.059-.044-.108-.099-.108H10.1c-.054 0-.099.048-.099.108zM9 10.5c0-.276.232-.5.5-.5.276 0 .5.23.5.5v7c0 .276-.232.5-.5.5-.276 0-.5-.23-.5-.5v-7zm5 0c0-.276.232-.5.5-.5.276 0 .5.23.5.5v7c0 .276-.232.5-.5.5-.276 0-.5-.23-.5-.5v-7z' />
      </svg>
    </button>
  )
}

const Checkout = () => {
  const {
    inZone,
    setInZone,
    addressData,
    setAddressData,
    //error,
    //setError,
    displayName,
    setDisplayName,
    phoneNumber,
    setPhoneNumber,
    email,
    setEmail,
    instructions,
    setInstructions,
    phoneNumberMask,
    setPhoneNumberMask,
  } = useCreateOrder()
  const {
    user,
    cartItems,
    cart,
    salesTax,
    localTax,
    exciseTax,
    deliveryFee,
    grandTotal,
    feeWave,
    subtotal,
    feeTotal,
    fireSettings, 
    totalsLoading, 
    setTotalsLoading,
    fireCart,
    customerID
  } = useUser()

  const fireFeature = useFirestoreQuery(
    user?.uid && fireSettings?.data?.day && 
      firebase
        .firestore()
        .collection("discounts")
        .where("featured", "==", true)
        .where("recurring", "==", true)
        .where("active", "==", true)
        .where("days", "array-contains", fireSettings?.data?.day)
  )


  const router = useRouter()
  const [disabled, setDisabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const { width, height } = useWindowSize()
  const { form, setForm, error, setError } = useForm()
  const { setNavLoading, navLoading } = useRouting()
  const { modalDispatch, modalState } = useDispatchModal()


  const fireCartTotals = useFirestoreQuery(
    user?.uid && firebase.firestore().collection('users').doc(user.uid).collection('Cart').doc('totals')
  ) 
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
  const addPromo = () => {
    const component = () => <AddPromoCode {...{fireFeature}} />
    openModal(component)
  }
  const removePromo = () => {
    const component = () => <DeletePromo {...{ fireCartTotals }} />
    openModal(component)
  }

  useEffect(() => {
    console.log("fireSettings")
    console.log(fireSettings)
  }, [fireSettings])


  useEffect(() => {
    return () => {
      setError({})    
      // setForm((oldForm) => ({
      //   ...oldForm,
      //   ...{
      //     search: '',
      //     address: false,
      //     coords: false,
      //   },
      // }))
    };
  }, [])


  const [view, setView] = useState({
    ...{
      latitude: 34.103729,
      longitude: -118.328613,
      zoom: 9,
    },
    ...getMapSize(width, height),
  })

  useEffect(() => {
    if (Boolean(height) && Boolean(width)) {
      setView({ ...{ ...view }, ...getMapSize(width, height) })
    }
  }, [width, height])




  const submitOrderX = 
    async (e) => {
      const _form = { ...form }
     // const _error = { ...error }

      setLoading(true)

      setNavLoading(true)

      try {
        const createOrder = firebase
          .functions()
          .httpsCallable("placeOrder")
        const response = await createOrder(_form)
        console.log("createOrder")
        console.log(response?.data)
        if (response?.data?.success === true) {
          NotificationManager.success("Order created.")
          //closeModal()
        }
        if (response?.data?.order === true) {
          console.log("Order OBJECT")
          console.log(response?.data?.order)
        }
      } catch (e) {
        setError(`${e?.message || e}`)
        NotificationManager.error(`${e?.message || e}`)
      } finally {
        setLoading(false)
        setNavLoading(false)
      }
    }







  /* Place order */
  const submitOrder = async () => {

    const _form = { ...form }

    _form.phoneNumber = parsePhoneNumber(`${_form?.phoneNumber||''}`, `US`)

    console.log('fireCartTotals?.data')
    console.log(fireCartTotals?.data)
    console.log('_form')
    console.log(_form)

    if (isEmpty(_form?.address)) {
      const serverError = "No address."
      NotificationManager.error(serverError)
      return setError((oldError) => ({ ...oldError, ...{ serverError } }))
    }
    if (isEmpty(_form?.coords)) {
      const serverError = "No address coordinates."
      NotificationManager.error(serverError)
      return setError((oldError) => ({ ...oldError, ...{ serverError } }))
    }
    if (_form?.inRange === false) {
      const serverError = "Out of delivery range."
      NotificationManager.error(serverError)
      return setError((oldError) => ({ ...oldError, ...{ serverError } }))
    }
    if (!fireCart.data) {
      const serverError = "No items in cart."
      NotificationManager.error(serverError)
      return setError((oldError) => ({ ...oldError, ...{ serverError } }))
    }
    if (fireCartTotals?.data?.subtotal < isNum(fireSettings?.data?.minOrder)) {
      const serverError = `Order minimum is ${fireSettings?.data?.minOrder}.`
      NotificationManager.error(serverError)
      return setError((oldError) => ({ ...oldError, ...{ serverError } }))
    }

    if (isEmpty(_form?.displayName)) {
      error.displayName = "Name required."
      NotificationManager.error(error.displayName)
      return setError({ ...error })
    }

    if (typeof _form?.phoneNumber === undefined ){
      error.phoneNumber = "Phone required."
      NotificationManager.error(error.phoneNumber)
      return setError({ ...error })
    }
    if ( typeof _form?.phoneNumber === 'object' && _form?.phoneNumber.isValid() ){
      _form.phoneNumber = _form.phoneNumber.format("E.164")
    }else{
      error.phoneNumber = "Invalid number."
      NotificationManager.error(error.phoneNumber)
      return setError({ ...error }) 
    }

//return;



    let userRecord = null
    let fireRecord = null
    let newFireRecord = null
    let authRecord = {
      displayName:_form?.displayName,
      phoneNumber:_form?.phoneNumber,
    }
    setLoading(true)
    try {
      const phone =`${ _form?.phoneNumber||''}`
      userRecord = await getUserByPhone({ phone })
    } catch (error) {
      userRecord = null
      NotificationManager.info('Creating new user.')
    }
    if (userRecord) {
      try {
       fireRecord = await getFirestoreDocument('users', `${userRecord?.uid||''}`)
      }catch(error){
        setLoading(false)
        const serverError = "Error finding user."
        NotificationManager.error(serverError)
        if (error?.message) {
          const serverError = `${isStr(error?.message)}`
          return setError((oldError) => ({ ...oldError, ...{ serverError } }))
        } else {
          const serverError = `${isStr(error)}`
          return setError((oldError) => ({ ...oldError, ...{ serverError } }))
        }
      }
    } else {
      try {
        await createAuthUser(authRecord)
        NotificationManager.success('New customer created.')
      } catch (error) {
        setLoading(false)
        const serverError = "Error creating user."
        NotificationManager.error(serverError)
        if (error?.message) {
          const serverError = `${isStr(error?.message)}`
          return setError((oldError) => ({ ...oldError, ...{ serverError } }))
        } else {
          const serverError = `${isStr(error)}`
          return setError((oldError) => ({ ...oldError, ...{ serverError } }))
        }
      }
    }

    let totalItemsSold = 0
    for (const key in cartItems) {
      let cartItem = cartItems[key]
      const itemQty = isNum(cartItem?.qty)
      totalItemsSold += isNum(itemQty)
    }

    const tempArray = []
    if (fireCartTotals?.data && fireCart?.data) {
      for (const key in fireCart?.data) {
        const fireProduct = fireCart?.data[key]
        if (typeof fireProduct === "object" && fireProduct !== null) {
          if(fireProduct?.id !== 'items' && fireProduct?.id !=='totals'){
            tempArray.push(fireProduct)
          }
          
        }
      }
      if (tempArray?.length <= 0) {
        error.cart = "Items required."
        NotificationManager.error(error.cart)
        return setError({ ...error })
      }
    }
 const cart_order ={ ...{
  deliveryFee:fireCartTotals?.data?.deliveryFee,
  discount:(fireCartTotals?.data?.couponsTotal||0),
  discountID:fireCartTotals?.data?.couponId,
  discountTitle:fireCartTotals?.data?.couponCode,
  exciseTax:fireCartTotals?.data?.exciseTaxTotal,
  localTax:fireCartTotals?.data?.localTaxTotal,
  grandTotal:fireCartTotals?.data?.grandTotal,
  discountID:fireCartTotals?.data?.couponId || false,
  refundExciseTax:0,
  refundLocalTax:0,
  refundSubTotal:0,
  refundTotal:0,
  refundItems:[],
  refundsalesTax:0,
  salesTax:fireCartTotals?.data?.salesTaxTotal,
  serviceFee:fireCartTotals?.data?.serviceFee,
  subtotal:fireCartTotals?.data?.subtotal,
  totalItemsRefunded:0,
  totalItemsSold:fireCartTotals?.data?.productsTotal,
 }, ...fireCartTotals?.data}
 
    const orderObject = {
      user: fireRecord?.uid || newFireRecord?.uid || 'error',
      phoneNumber: fireRecord?.phoneNumber || newFireRecord?.phoneNumber || 'error',
      displayName: fireRecord?.displayName || newFireRecord?.displayName || 'error',
      photoURL: fireRecord?.photoURL || newFireRecord?.photoURL || 'error',
      refund: false,
      cart: {...cart_order, ...{items:tempArray}},
      address: _form?.address,
      coordinates: _form?.coords,
      instructions:`${_form?.instructions||`No instructions.`}`,
      progress: "received",
      start: new Date(),
      end: false,
      settled: false,
    }



    console.log("orderObject")
    console.log(orderObject)

    setNavLoading(true)
    setLoading(false)
    try {
     // alert('hey')
      const createOrder = firebase
        .functions()
        .httpsCallable("placeOrder")
      const response = await createOrder(orderObject)
      console.log("createOrder")
      console.log(response?.data)
      if (response?.data?.success === true) {
        NotificationManager.success("Order created.")
        //router.push(`/${customerID}/orders/selected/${response?.data?.id}`)
        //alert(response?.data?.id)
        //closeModal()
      }
      if (response?.data?.order === true) {
        console.log("Order OBJECT")
        console.log(response?.data?.order)
      }
    } catch (e) {
      setError(`${e?.message || e}`)
      NotificationManager.error(`${e?.message || e}`)
    } finally {
      setLoading(false)
      setNavLoading(false)
    }




    // setNavLoading(true)
    // setLoading(false)
    // try {
    //   const { id } = await placeAnOrder(orderObject)
    //   router.push(`/${user?.uid}/orders/selected/${id}`)
    // } catch (error) {
    //   setNavLoading(false)
    //   const serverError = "Error placing order."
    //   NotificationManager.error(serverError)
    //   if (error?.message) {
    //     const serverError = `${isStr(error?.message)}`
    //     return setError((oldError) => ({ ...oldError, ...{ serverError } }))
    //   } else {
    //     const serverError = `${isStr(error)}`
    //     return setError((oldError) => ({ ...oldError, ...{ serverError } }))
    //   }
    //   //setServerError(error.message)
    // }
    // return
  }

  useEffect(() => {
    if (form?.coords && form?.coords?.length === 2) {
      console.log(form)
      setView((oldView) => ({ ...oldView, ...{ latitude: form?.coords[1], longitude: form?.coords[0], zoom: 13 } }))
    }
  }, [form?.coords])

  const formatPhoneNumber = useCallback((value) => {
    if (!value) return ""
    value = value.toString()
    if (value.includes("(") && !value.includes(")")) {
      return value.replace("(", "")
    }
    if (value.length && value.length > 14) {
      return value.slice(0, -1)
    }
    return new AsYouType("US").input(value)
  }, [])

  const handleInputChange = (e, v) => {
    setForm({ ...{ ...form }, ...{ [`${e?.target?.name || "error"}`]: v } })
  }

  return (
    <SplitWindow>
      <InfoPane
      back={`/${user?.uid}/create-order/menu`}
      noDrawer={true}
        mapComponent={
          user?.uid ? (
            <>
              <div className={styles["selected-map-container"]}>
                <ReactMapGL
                  mapStyle='mapbox://styles/mapbox/streets-v11'
                  mapboxApiAccessToken={TOKEN}
                  onViewportChange={setView}
                  transitionDuration={1000}
                  transitionInterpolator={new FlyToInterpolator()}
                  transitionEasing={d3.easeCubic}
                  containerStyle={{
                    height: "100%",
                    width: "100%",
                  }}
                  {...view}>

                {Boolean(form?.coords) && Boolean(form?.coords?.length === 2) &&
                                  
                                  <Marker

                        offsetTop={-24}
                        offsetLeft={-24}
                        latitude={form?.coords[1]}
                        longitude={form?.coords[0]}
                        {...{view}}
                      >
                          <SVGIcon style={{transform: 'scale(1.4)',}} name={'locationMarkerFilled'} color={'rgb(0,200,5)'} />
                          
                      </Marker>
                  
                  } 


                  </ReactMapGL>
              </div>
            </>
          ) : (
            <div className='nav-loader map-width'>
              <Spinner />
            </div>
          )
        }
        {...{ user }}>
        <div className='info-form'>
          <>
            <h1 style={{ marginBottom: "30px", marginTop: "86px" }}>Checkout</h1>

            {/**/}
            {/* SERVER ERROR */}
            <div>{Boolean(form?.serverError) && <ServerError text={`${form?.serverError||''}`} />}</div>
            {/* ADDRESS */}
            <section className={styles["outline-section"]}>
              <div className={styles["outline-area"]}>
                <div className={styles["content-area"]}>
                  <SVGIcon className={styles["content-icon"]} color={"rgb(0,200,5)"} name={"locationMarker"} />
                  <span>{form?.address ? `${form?.address?.split(',')[0]  }`  : (
                  <Link href={"/[adminID]/create-order/menu"} as={`/${user?.uid}/create-order/menu`} scroll={false}>
                    <u style={{ color: "rgb(0,200,5)" }}>Add address</u>
                  </Link>
                )}</span>&nbsp;
                </div>
              </div>
            </section>
            {/* NAME */}
            <TextField
              hasError={Boolean(error?.displayName)}
              validationErrorText={`${error?.displayName || ""}`}
              onFocus={() => { setError({}) }}
              id='displayName'
              name='displayName'
              type='text'
              floatingLabelText='Display Name'
              hintText='ex. Jack Herrer'
              fullWidth
              onChange={handleInputChange}
              value={`${form?.displayName || ""}`}
            />
            {/**/}
            {/* PHONE */}
            <TextField
              hasError={Boolean(error?.phoneNumber)}
              validationErrorText={`${error?.phoneNumber || ""}`}
              onFocus={() => { setError({}) }}
              id='phoneNumber'
              name='phoneNumber'
              type='tel'
              floatingLabelText='Phone Number'
              hintText='ex. 555-867-5309  '
              fullWidth
              onChange={({ target: { value } }) => {
                return setForm({
                  ...{ ...form },
                  ...{ phoneNumber: formatPhoneNumber(value || "") },
                })
              }}
              value={`${form?.phoneNumber || ""}`}
            />
            {/* Instructions */}
            <section className={styles["outline-section"]}>
                <textarea
                  placeholder='add order instructions (e.g. Unit B)'
                  maxLength={100}
                  className={styles["outline-area"]}
                  style={{ minHeight: "76px" }}
                  spellCheck='false'
                  onChange={({ target: { value } }) =>  setForm({
                      ...{ ...form },
                      ...{ instructions:`${value||''}`},
                    })
                  }
                  value={`${form?.instructions||''}`}
                />
            </section>
            {/* Payment */}
            <section className={styles["outline-section"]}>
              <div className={styles["outline-area"]}>
                <p>Payment will be made upon delivery. We accept the following payment methods:</p>
                <div className={styles["content-area"]}>
                  <SVGIcon className={styles["content-icon"]} color={"rgb(0,200,5)"} name={"money"} /><span>Cash</span>&nbsp;
                </div>
              </div>
            </section>
            <>




            <CartList {...{ fireCartTotals }} />
                  {/* Totals */}  
                  {fireCartTotals?.status === "success" && fireCartTotals.data?.productsTotal > 0 && (
                    <div className='cart-total-section'>
                      <section>
                        <div className='border-line' />
                        <div className='section-flex'>
                          <div className='cart-margin'>
                            <div className='totals-list'>
                              <div className={`totals-overlay${totalsLoading ? "" : ` fadeOut`}`}>
                                <Spinner color={"rgb(0,200,5)"} />
                              </div>
                              {fireCartTotals?.data?.hasCoupon && (
                                <TotalsRow
                                  label={
                                    <>
                                      {`Coupon `}
                                      <RemoveButton onClick={removePromo} />
                                    </>
                                  }
                                  value={<>{`-${isCurr(fireCartTotals?.data?.couponsTotal)}`} </>}
                                  //variant='green'
                                />
                              )}
                              {fireCartTotals?.data?.hasCredit && (
                                <TotalsRow
                                  label={<>{`Credit `}</>}
                                  variant='green'
                                  value={<>{`-${isCurr(fireCartTotals?.data?.creditTotal)}`} </>}
                                />
                              )}
                              <TotalsRow
                                label={"Subtotal"}
                                value={
                                  fireCartTotals?.data?.hasCoupon && !fireCartTotals?.data?.taxFree ? (
                                    <>
                                      {`${isCurr(fireCartTotals?.data?.subtotal)}`}
                                      {` `}&nbsp;
                                      <strike>{`${isCurr(fireCartTotals?.data?.productsPrice)}`}</strike>
                                    </>
                                  ) : (
                                    isCurr(fireCartTotals?.data?.subtotal)
                                  )
                                }
                              />
                              <TotalsRow
                                label={"Delivery Fee"}
                                value={
                                  fireCartTotals?.data?.freeDelivery ? (
                                    <>
                                      {`${isCurr(fireCartTotals?.data?.deliveryTotal)}`}
                                      {` `}&nbsp;
                                      <strike>{`${isCurr(fireCartTotals?.data?.deliveryFee)}`}</strike>
                                    </>
                                  ) : (
                                    `+${isCurr(fireCartTotals?.data?.deliveryTotal)}`
                                  )
                                }
                              />
                              <TotalsRow label={"Service Fee"} value={`+${isCurr(fireCartTotals?.data?.serviceFee)}`} />
                              <TotalsRow
                                label={`${fireCartTotals?.data?.exciseTaxRate * 100}% Excise Tax`}
                                //value={`+${isCurr(fireCartTotals?.data?.exciseTaxTotal)}` }
                                value={
                                  fireCartTotals?.data?.taxFree ? (
                                    <>
                                      {`${isCurr(0)}`}
                                      {` `}&nbsp;
                                      <strike>{`${isCurr(fireCartTotals?.data?.exciseTaxTotal)}`}</strike>
                                    </>
                                  ) : (
                                    `+${isCurr(fireCartTotals?.data?.exciseTaxTotal)}`
                                  )
                                }
                              />

                              <TotalsRow
                                label={`${fireCartTotals?.data?.localTaxRate * 100}% Local Tax`}
                                value={
                                  fireCartTotals?.data?.taxFree ? (
                                    <>
                                      {`${isCurr(0)}`}
                                      {` `}&nbsp;
                                      <strike>{`${isCurr(fireCartTotals?.data?.localTaxTotal)}`}</strike>
                                    </>
                                  ) : (
                                    `+${isCurr(fireCartTotals?.data?.localTaxTotal)}`
                                  )
                                }
                              />

                              <TotalsRow
                                label={`${fireCartTotals?.data?.salesTaxRate * 100}% Sales Tax`}
                                value={
                                  fireCartTotals?.data?.taxFree ? (
                                    <>
                                      {`${isCurr(0)}`}
                                      {` `}&nbsp;
                                      <strike>{`${isCurr(fireCartTotals?.data?.salesTaxTotal)}`}</strike>
                                    </>
                                  ) : (
                                    `+${isCurr(fireCartTotals?.data?.salesTaxTotal)}`
                                  )
                                }
                              />

                              <TotalsRow
                                variant='bold'
                                label={"Total"}
                                value={`${isCurr(fireCartTotals?.data?.grandTotal)}`}
                              />

                              <TotalsRow
                                variant='red'
                                label={"You saved"}
                                value={`${isCurr(fireCartTotals?.data?.totalSaved)}`}
                              />
                              <div className='cart-margin'>
                                <Button
                                  disabled={fireCartTotals?.data?.hasCoupon}
                                  loading={false}
                                  onClick={addPromo}
                                  variant='green-outline'
                                  fullWidth
                                  text={
                                    fireCartTotals?.data?.hasCoupon
                                      ? `${fireCartTotals?.data?.couponCode} Applied!`
                                      : "Add Promo"
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                      <div style={{ width: "100%", height: "185px" }} />
                    </div>
                  )}
                  {fireCartTotals?.status !== "success" && (
                    <div className='cart-total-section'>
                      <section>
                        <div className='border-line' />
                        <div style={{ marginTop: "26px" }} className='section-flex'>
                          <CartTotalsSkeleton />
                          <CartTotalsSkeleton />
                          <CartTotalsSkeleton />
                        </div>
                      </section>
                    </div>
                  )}
            </>

            <div style={{ width: "100%", height: "200px" }} />
          </>
        </div>
      </InfoPane>
      <ProgressFooter style={{height:74}}>
        <Button
          onClick={submitOrder}
          loading={loading}
          spinnerColor={'rgb(0, 200, 5)'}
          disabled={
            disabled 
            || loading 
            || !form?.address 
            || !form?.displayName 
            || !form?.phoneNumber
          }
          variant='green'
          //style={{color:'rgb(0, 200, 5)'}}
          text='Checkout'></Button>
      </ProgressFooter>
    </SplitWindow>
  )
}

export default Checkout

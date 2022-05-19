import styles from "./selectedOrder.module.scss"
import {
  SplitWindow,
  InfoPane,
  MapPane,
  InfoHeader,
  MapHeader,
  ProgressFooter,
  SlideButton,
  TotalsRow,
} from "../Split"
import { useUser } from "../../context/userContext"
import firebase, {
  updateFirestore,
  getMatrix,
} from "../../firebase/clientApp"
import { useRouter } from "next/router"
import Spinner from "../../components/Buttons/Spinner"
import Select from "../../components/Forms/Select"
import OrderMenu from "../../components/Console/OrderMenu"
import { useForm } from "../../context/formContext"
import { useEffect, useState, useCallback, useRef } from "react"
import MenuItem from "../../components/Menus/MenuItem"
import * as d3 from "d3-ease"
import FitBoundsSVG from "../../assets/FitBounds"
import ReactMapGL, {
  FlyToInterpolator,
  WebMercatorViewport,
  Marker,
  Popup,
} from "react-map-gl"
import {
  TOKEN,
  defaultMap,
  capitalize,
  colorObject,
  orderProgressObject,
  PROGRESS,
  drivingIconObject,
  progressPercent,
  drivingObject,
  secondsToHms,
  getMapSize
} from "../../helpers"
import SVGIcon from "../SVGIcon"
import Button from "../Buttons/Button"
import CartItem from "../../components/CartItem"
import { useOrder } from "../../context/orderContext"
import { points } from "@turf/helpers"
import center from "@turf/center"
import bbox from "@turf/bbox"
import { useWindowSize } from "../../hooks/useWindowSize"
import { OrderMarkers, MapPopup } from "../../components/MapBox"
import { useRouting } from "../../context/routingContext"

import {useDispatchModal} from '../../context/modalContext'
import {ReturnsModal, ReturnsCompleteModal} from '../../components/Modals'
import { NotificationManager } from "react-notifications"
import { defaultTheme } from "../../styles/themer/utils"
import Link from "next/link"
import copy from "copy-to-clipboard"

Date.prototype.addHours = function (h) {
  this.setTime(this.getTime() + h * 60 * 60 * 1000)
  return this
}

const progressValue = {
  received: (100 / 7) * 1,
  pending: (100 / 7) * 2,
  assigned: (100 / 7) * 3,
  pickup: (100 / 7) * 4,
  warning: (100 / 7) * 5,
  arrived: (100 / 7) * 6,
  complete: (100 / 7) * 7,
  paid: (100 / 7) * 7,
  cancel: (100 / 7) * 7,
  refund: (100 / 7) * 7,
}

const progressButton = {
  received: "Dispatch Order",
  pending: "Mark Assigned",
  assigned: "Complete Pickup",
  pickup: "10-min Warning",
  warning: "Mark Arrived",
  arrived: "Mark Delivered",
  complete: "Mark Paid",
  refund: "Order Refunded",
  paid: "Order Paid",

  loading: "Loading...",
  cancel: "Order Canceled",
}
const progressTitle = {
  received: "Order Received",
  pending: "Pending Driver",
  warning: "Order Warning",
  arrived: "Driver Arrived",
  cancel: "Order Canceled",
  refund: "Order Refund",
  assigned: "Order Assigned",
  complete: "Order Delivered",
  paid: "Order Paid",
  pickup: "Order Pickup",
  loading: "Loading...",
}




const SelectedOrder = ({ fireCustomer, fireOrder }) => {
  //need to load user
  /// neeed to load acount
  /// need to load drivers
  const router = useRouter()
  const { width, height } = useWindowSize()
  const { user, fireSettings, fireDrivers } = useUser()
  const { form, setForm } = useForm()
  const [disabled, setDisabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setNavLoading } = useRouting()  
  const { modalDispatch, modalState } = useDispatchModal()


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

  const [active, setActive] = useState("cart")


  
  const [view, setView] = useState({...{
    latitude: 34.103729,
    longitude: -118.328613,
    zoom: 9,
  }, ...getMapSize(width,height)})

  const {
    selectedDriver,
    setSelectedDriver,
    bounds,
    setBounds,
    matrix,
    setMatrix,
    distanceTime,
    setDistanceTime,
    stops,
    setStops,
    // view,
    // setView,
  } = useOrder()
  //   const [isVisible, setIsVisible] = useState(true)
  //   const [selected, setSelected] = useState({point:[-118.328613,34.103729]})
  //   const [data, setData] = useState(false)

  //   const onClose = React.useCallback(() => {
  //     setIsVisible(false)
  //   }, [])

//   useEffect(() => {
//     console.log("view!!!!!!!!!!!s")
//     console.log(view)
//   }, [view])

  /* SET MAP HEIGHT AND WIDTH */
  useEffect(() => {
    if (Boolean(height) && Boolean(width)) {
      const size = { height, width }
      if (width > 919) {
        size.width = width - (350 + 256)
      } else {
        size.height = 280
      }
      console.log("RESIZE VIEW !!!!!!!!!")
      console.log({ ...view, ...size })
      setView({ ...view, ...size })
    }
  }, [width, height])

  /* SET DEFAULT SELECTED DRIVER */
  useEffect(() => {
    let value = null
    let label = null
    if (fireOrder?.data?.driver) {
      value = fireOrder.data.driver
      label = fireOrder.data.driverName
      // driverRef && collapse(driverRef)
      if (value !== selectedDriver?.value) {
        setSelectedDriver(label && value ? { label, value } : null)
      }
    } else {
      //driverRef && expand(driverRef)
    }
  }, [selectedDriver, fireOrder])

  useEffect(() => {
    let tempView = { ...view }
    if (bounds.length === 1) {
      tempView = {
        ...tempView,
        ...{ latitude: bounds[0][1], longitude: bounds[0][0], zoom: 11 },
      }
    } else if (bounds.length > 1) {
      const features = points(bounds)
      const cent = center(features)
      const _bbox = bbox(features)
      const newViewport = new WebMercatorViewport(tempView)
      const { longitude, latitude, zoom } = newViewport.fitBounds(
        [
          [_bbox[0], _bbox[1]],
          [_bbox[2], _bbox[3]],
        ],
        { padding: { top: 180, bottom: 30, left: 30, right: 30 } }
      )
      tempView = { ...tempView, ...{ longitude, latitude, zoom } }
    }
    setView(tempView)
  }, [bounds, width])

  useEffect(() => {
    if (fireOrder?.data?.driver) {
      const { driver } = fireOrder.data
      setForm({ ...form, ...{ selectedDriver: driver } })
    }
  }, [fireOrder])

  //   const handleSelectDriver = (_, v) => {
  //     return
  //   }

  const handleUpdate = useCallback(async () => {
    setLoading(true)
    let { value, label } = selectedDriver
    if (!selectedDriver?.value) {
      setLoading(false)
      return NotificationManager.error("Select a driver.")
    }
    let p = fireOrder.data?.progress

    if ([PROGRESS[7], PROGRESS[8]].includes(p)) {
      router.push(`/${user?.uid}/orders/active`)
    } else if ([PROGRESS[0]].includes(p)) {
      setNavLoading(true)
      setTimeout(async () => {
        try {
          await updateFirestore("orders", router.query.oid, {
            progress: PROGRESS[PROGRESS.indexOf(p) + 1],
            driver:selectedDriver?.value,
            driverName:selectedDriver?.label
            // driver: fireDrivers.data.map(
            //   (user) => user.uid === value && user
            // )[0],
          })
          NotificationManager.success("Message Sent.")
          setLoading(false)
          setNavLoading(false)
        } catch (error) {
          NotificationManager.error("An error occured.")
        }
      }, 2000)
    } else {
      setNavLoading(true)
      setTimeout(async () => {
        try {
          await updateFirestore("orders", router.query.oid, {
            progress: PROGRESS[PROGRESS.indexOf(p) + 1],
          })
          NotificationManager.success("Order Updated.")
          setLoading(false)
          setNavLoading(false)


          console.log('(fireCustomer)')
          console.log(fireCustomer)
          console.log('(PROGRESS[5] === p)')
          console.log((PROGRESS[4] === p))
          console.log('(fireCustomer?.data?.refundActive === true)')
          console.log((fireCustomer?.data?.refundActive === true))
          console.log('(fireCustomer?.data?.refundItems)')
          console.log((fireCustomer?.data?.refundItems))

          if( (PROGRESS[4] === p) && (fireCustomer?.data?.refundActive === true) && (fireCustomer?.data?.refundItems) ){
            const component = () => <ReturnsModal {...{fireCustomer}} />
            openModal(component)
          }
          if( (PROGRESS[5] === p) && (fireCustomer?.data?.refundActive === true) && (fireCustomer?.data?.refundItems) ){
            const component = () => <ReturnsCompleteModal {...{fireCustomer}} />
            openModal(component)
          }
        } catch (error) {
          NotificationManager.error("An error occured.")
        }
      }, 2000)
    }
  }, [fireOrder, selectedDriver, router, fireDrivers, fireCustomer])

  const getDistanceTime = useCallback(async () => {
    const { origins, destinations } = matrix
    let timeValue = 0
    console.log("origins, destinations")
    console.log(origins)
    console.log(destinations)
    getMatrix({ origins, destinations })
      .then((r) => {
        console.log("r")
        console.log(r)
        const { rows } = r.data
        for (const key in rows) {
          const { elements } = rows[key]
          const { value, text } = elements[key].duration
          timeValue = timeValue + value
        }
        setDistanceTime(secondsToHms(timeValue))
      })
      .catch((e) => (console.log("e"), console.log(e)))
  }, [matrix])

  useEffect(() => {
    const { origins, destinations } = matrix
    if (origins.length && destinations.length) {
      getDistanceTime()
    } else {
      setDistanceTime("--")
    }
  }, [matrix])

  const collapsable = (e) => {
    if (e.target.id === active) {
      setActive("cart")
    } else {
      setActive(e.target.id)
    }
    return
    // const _this = e.target
    // setActive(e.target.id)
    // _this.classList.toggle("active");
    // var content = _this.nextElementSibling;
    // if (content.style.display === "block") {
    //   content.style.display = "none";
    // } else {
    //   content.style.display = "block";
    //   content.style.overflow = "unset";
    // }
  }
  // const collapse = (e) => {
  //     console.log('collapse')
  //     console.log(e)
  //     const _this = e
  //     _this.classList.remove("active");
  //     var content = _this.nextElementSibling;
  //     content.style.display = "none";

  // }
  // const expand = (e) => {
  //     const _this = e
  //     _this.classList.add("active");
  //     var content = _this.nextElementSibling;
  //     content.style.display = "block";
  //     content.style.overflow = "unset";
  // }
  const expandable = (e) => {
    const _this = e.target
    _this.classList.toggle("active")
    var content = _this.nextElementSibling
    if (content.style.display === "block") {
      content.style.display = "none"
    } else {
      content.style.display = "block"
      content.style.overflow = "unset"
    }
  }

  const clearOwedItems = async () => {
    const customer = { ...fireCustomer }
    customer.data.refundActive = false
    customer.data.refundItems = []
    try {
      setNavLoading(true)
      await updateFirestore("users", customer.data.uid, customer.data)
      NotificationManager.success("User Updated.")
    } catch (error) {
      NotificationManager.error("An error occurred.")
    } finally {
      setNavLoading(false)
    }
  }

  useEffect(() => {
    setNavLoading(false)
    return () => {
      setSelectedDriver(null)
      // setNavLoading(false)
    }
  }, [])


  useEffect(() => {
      console.log("fireCustomer")
      console.log(fireCustomer)
  }, [fireCustomer]);

  //push driver bounds // not if complete // paid // cancel
  const isComplete = Boolean(
    [...orderProgressObject.complete, ...orderProgressObject.cancel].includes(
      fireOrder?.data?.progress || ""
    )
  )

  return (
    <SplitWindow>
      <OrderMenu {...{ fireOrder }} {...{ fireCustomer }} />
      <InfoPane
        mapComponent={
            fireOrder?.data 
          && fireDrivers?.data 
          && fireSettings?.data 
          //&& fireCustomer?.data 
          && user?.uid 
          ? (
            
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
                <MapPopup {...{ fireOrder }} />
                <OrderMarkers {...{ fireOrder }} />
              </ReactMapGL>
            </div>
            </>
          ) : (
            <div className='nav-loader map-width'>
              <Spinner />
            </div>
          )
        }
        {...{ fireOrder, fireDrivers, fireSettings, fireCustomer, user }}>
        <div className='info-form'>
          {
          fireOrder?.data 
          && fireDrivers?.data 
          && fireSettings?.data 
          //&& fireCustomer?.data 
          && user?.uid 
          ? (
            <>
              {/* Progress  */}
              <section className={styles["order-info-section"]}>
                <h1>
                  {progressTitle[fireOrder.data.progress] || "No progress."}
                </h1>
                <h4>
                  {fireOrder.data?.address.split(",")[0] ||
                    "No Address"}
                </h4>
                {!isComplete && (
                  <p>
                    {Boolean(fireOrder?.data?.start)
                      ? `Due by ${new Date(fireOrder?.data?.start.toDate())
                          .addHours(fireSettings.data?.waitTime)
                          .toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          .toLowerCase()}`
                      : "--"}
                  </p>
                )}
                {/* <input
                className="e-range"
                type='range'
                //defaultValue={progressValue[fireOrder.data.progress]}  
                value={progressValue[fireOrder.data.progress]}
                onChange={()=>{}}
                min='0'
                max='100'
              /> */}
                <div className='progress-order'>
                  <div className='progress-bar-order'>
                    <span
                      className='progress-bar-prder-fill'
                      style={{
                        width: `${progressValue[fireOrder.data.progress]}%`,
                      }}
                    />
                  </div>
                </div>
              </section>
              {/* Driver  */}
              <section className={styles["order-info-section"]}>
                <button
                  className={`collapsible${
                    !Boolean(fireOrder?.data?.driver) ? ` active` : ``
                  }`}>
                  <SVGIcon name='car' />
                  {fireOrder.data?.driverName || "Assign a driver"}
                </button>
                <div
                  className={`collapsible-content margin${
                    (!Boolean(fireOrder?.data?.driver) && Boolean(fireCustomer?.data)) ? ` visible` : ``
                  }`}>
                  {!Boolean(fireOrder?.data?.driver) ? (
                    <Select
                      id='selectedDriver'
                      name='selectedDriver'
                      floatingLabelText='Driver'
                      hintText='Select a driver'
                      disabled={
                        (Boolean(fireDrivers.status === "success") &&
                        Boolean(fireOrder.status === "success") )
                          ? !Boolean(fireOrder.data?.progress === "received")
                          : true
                      }
                      onSelect={(_, v) => setSelectedDriver(v)}
                      selectedOption={selectedDriver}
                      fullWidth>
                      {(fireDrivers?.data || []).map(
                        ({ displayName, uid, online }, i) =>
                          online && (
                            <MenuItem key={i} label={displayName} value={uid} />
                          )
                      )}
                    </Select>
                  ) : (
                    <div>
                      <Spinner />
                    </div>
                  )}
                </div>
              </section>
              {/* Address  */}
              <section className={styles["order-info-section"]}>
                <button
                  id='address'
                  onClick={collapsable}
                  className={`collapsible arrow${
                    active === "address" ? ` active` : ``
                  }`}>
                  <SVGIcon name='home' />
                  {fireOrder.data?.address.split(",")[0] ||
                    "No Address"}
                </button>
                <div
                  className={`collapsible-content margin${
                    active === "address" ? ` visible` : ``
                  }`}>
                  <a
                    href={`https://www.google.com/maps/dir/current+location/${fireOrder.data?.address}`}
                    target='_blank'>
                    <Button
                      className={styles["collapse-button"]}
                      fullWidth={true}
                      text='Get Directions'
                    />
                  </a>

                  <Button
                    onClick={() =>
                      copy(fireOrder.data?.location?.address, {
                        onCopy: NotificationManager.success("Copied"),
                      })
                    }
                    fullWidth={true}
                    className={styles["collapse-button"]}
                    text='Copy Address'
                  />
                </div>
              </section>
              {/* Instructions  */}
              <section className={styles["order-info-section"]}>
                <button
                  id='address'
                  onClick={collapsable}
                  className='collapsible active'>
                  <SVGIcon name='instructions' />
                  {"Instructions"}
                </button>
                <div className={`collapsible-content margin visible`}>
                    {fireOrder?.data?.instructions||"No Instructions"}


                </div>
              </section>       
              {/* Phone  */}
              <section className={styles["order-info-section"]}>
                <button
                  id='phone'
                  onClick={collapsable}
                  className={`collapsible arrow${
                    active === "phone" ? ` active` : ``
                  }`}>
                  <SVGIcon name='phone' />
                  {fireCustomer?.data?.phoneNumber || "No phone number"}
                </button>
                <div
                  className={`collapsible-content margin${
                    active === "phone" ? ` visible` : ``
                  }`}>
                  {width <= 768 && (
                    <>
                      <a href={`tel:${fireCustomer?.data?.phoneNumber}`}>
                        <Button
                          fullWidth={true}
                          className={styles["collapse-button"]}
                          text='Call'
                        />
                      </a>
                      <a href={`sms:${fireCustomer?.data?.phoneNumber}`}>
                        <Button
                          fullWidth={true}
                          className={styles["collapse-button"]}
                          text='Message'
                        />
                      </a>
                    </>
                  )}
                  <Button
                    onClick={() =>
                      copy(fireOrder.data?.user?.phoneNumber, {
                        onCopy: NotificationManager.success("Copied"),
                      })
                    }
                    fullWidth={true}
                    className={styles["collapse-button"]}
                    text='Copy Phone'
                  />
                </div>
              </section>
              {/* User - License  */}
              {<section className={styles["order-info-section"]}>
                <button
                  id='license'
                  onClick={collapsable}
                  className={`collapsible${Boolean(fireCustomer?.data)?` arrow`:''}${
                    active === "license" ? ` active` : ``
                  }`}>
                  <SVGIcon name='person' />
                  {  Boolean(fireCustomer?.data) ? (fireCustomer?.data?.displayName || `No user `):'User not found'}
                  {Boolean(fireCustomer.data?.refundActive) ? (
                    <span className='customer-items'>{`, ${fireCustomer.data?.refundItems.length} Item(s) Owed`}</span>
                  ) : (
                    ""
                  )}
                </button>
                <div
                  className={`collapsible-content margin${
                    (active === "license" && Boolean(fireCustomer?.data)) ? ` visible` : ``
                  }`}>
                   <div className='items-owed'>{`${fireCustomer?.data?.orders ||`No`} Order(s)`}</div>   
                   <div className='items-owed'>{`${fireCustomer?.data?.refunds||`No`} Refund(s)`}</div>                       
                   <div className='items-owed'>{`License`}</div>   
                  <div className={styles["order-img"]}>
                    <img src={fireOrder.data?.photoURL||'https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2Fplaceholder-images-image_large.png?alt=media&token=9dcb7b69-aee4-43ad-9a16-f984510b9703'} />
                  </div>

                  {Boolean(fireCustomer?.data?.refundActive) && (
                    <>
                      <div className='items-owed'>
                          {`${(fireCustomer?.data?.refundItems && fireCustomer?.data?.refundItems.length)||'No '} Item(s) Owed`}
                      </div>
                      {Boolean(fireCustomer?.data?.refundItems) &&
                        fireCustomer?.data?.refundItems.map(
                          (
                            {
                              genome,
                              pid,
                              img,
                              inventory,
                              name,
                              price,
                              size,
                              type,
                              qty,
                            },
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
                            />
                          )
                        )}
                      <Button
                        fullWidth={true}
                        className={styles["collapse-button"]}
                        onClick={clearOwedItems}
                        text='Mark Recieved'
                      />
                    </>
                  )}
                  {/* <Button fullWidth={true}  className={styles['collapse-button']} text='Update ID' />  */}
                </div>
              </section>}
              {/*  Items CART  */}
              <section className={styles["order-info-section"]}>
                <button
                  id='cart'
                  onClick={collapsable}
                  className={`collapsible arrow${
                    active === "cart" ? ` active` : ``
                  }`}>
                  <SVGIcon name='orderReview' />
                  {fireOrder?.data?.cart?.items?.length + " Item(s)" ||
                    "No Items"}
                </button>
                <div
                  className={`collapsible-content cart${
                    active === "cart" ? ` visible` : ``
                  }`}>
                  {Boolean(fireOrder?.data?.cart?.items) &&
                    fireOrder.data.cart.items.map(
                      (
                        {
                          genome,
                          pid,
                          img,
                          inventory,
                          name,
                          price,
                          size,
                          type,
                          qty,
                        },
                        i
                      ) => (
                        <CartItem
                          key={i}
                          qty={qty}
                          genome={genome}
                          pid={pid}
                          img={img}
                          inventory={inventory}
                          name={name}
                          price={price}
                          size={size}
                          type={type}
                          disableChange={true}
                        />
                      )
                    )}

                  {/* <Button fullWidth={true}  className={styles['collapse-button']} text='Remove Item' />  */}
                </div>
              </section>
              {/* REFUND Items CART */}
              {Boolean(fireOrder?.data?.refund) && (
                <section className={styles["order-info-section"]}>
                  <button
                    id='refund'
                    onClick={expandable}
                    className={`collapsible arrow refund`}>
                    <SVGIcon name='orderIssue' />
                    {fireOrder?.data?.cart?.refundItems?.length +
                      " Refunded Item(s)" || "No Refunded Items"}
                  </button>
                  <div className={`collapsible-content cart`}>
                    {Boolean(fireOrder?.data?.cart?.refundItems) &&
                      fireOrder.data.cart.refundItems.map(
                        (
                          {
                            genome,
                            pid,
                            img,
                            inventory,
                            name,
                            price,
                            size,
                            type,
                            qty,
                          },
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
                            price={parseFloat(price)}
                            size={size}
                            type={type}
                            disableChange={true}
                          />
                        )
                      )}

                    {/* <Button fullWidth={true}  className={styles['collapse-button']} text='Remove Item' />  */}
                  </div>
                </section>
              )}
              {/* REFUND TOTALS  */}
              {Boolean(fireOrder?.data?.refund) && (
                <section className={styles["order-info-section"]}>
                  <button
                    id='totals'
                    onClick={expandable}
                    className={`collapsible arrow refund`}>
                    <SVGIcon name='refund' />
                    {`${
                      Boolean(fireOrder?.data?.cart?.refundTotal)
                        ? fireOrder?.data.cart.refundTotal.toLocaleString(
                            "en-US",
                            {
                              style: "currency",
                              currency: "USD",
                            }
                          )
                        : "--"
                    } Refunded`}
                  </button>
                  <div className={`collapsible-content`}>
                    <div className='totals-list'>
                      <TotalsRow
                        label={"Subtotal"}
                        variant={"refund"}
                        value={
                          Boolean(fireOrder?.data?.cart?.refundTotal)
                            ? (
                                parseFloat(fireOrder?.data.cart.refundTotal) -
                                (parseFloat(
                                  fireOrder?.data.cart.refundExciseTax
                                ) +
                                  parseFloat(
                                    fireOrder?.data.cart.refundLocalTax
                                  ) +
                                  parseFloat(
                                    fireOrder?.data.cart.refundsalesTax
                                  ))
                              ).toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                              })
                            : "--"
                        }
                      />
                      <TotalsRow
                        label={"Excise Tax"}
                        variant={"refund"}
                        value={
                          Boolean(fireOrder?.data?.cart?.refundExciseTax)
                            ? fireOrder?.data.cart.refundExciseTax.toLocaleString(
                                "en-US",
                                {
                                  style: "currency",
                                  currency: "USD",
                                }
                              )
                            : "--"
                        }
                      />
                      <TotalsRow
                        label={"Local Tax"}
                        variant={"refund"}
                        value={
                          Boolean(fireOrder?.data?.cart?.refundLocalTax)
                            ? fireOrder?.data.cart.refundLocalTax.toLocaleString(
                                "en-US",
                                {
                                  style: "currency",
                                  currency: "USD",
                                }
                              )
                            : "--"
                        }
                      />
                      <TotalsRow
                        label={"Sales Tax"}
                        variant={"refund"}
                        value={
                          Boolean(fireOrder?.data?.cart?.refundsalesTax)
                            ? fireOrder?.data.cart.refundsalesTax.toLocaleString(
                                "en-US",
                                {
                                  style: "currency",
                                  currency: "USD",
                                }
                              )
                            : "--"
                        }
                      />
                    </div>
                  </div>
                </section>
              )}
              {/* TOTALS  */}
              <section className={styles["order-info-section"]}>
                <button
                  id='totals'
                  //onClick={collapsable}
                  className={`collapsible active`}>
                  <SVGIcon name='money' />
                  Cash
                </button>
                <div className='totals-list'>
                  <TotalsRow
                    label={"Subtotal"}
                    value={
                      Boolean(fireOrder?.data?.cart?.subtotal)
                        ? fireOrder?.data.cart.subtotal.toLocaleString(
                            "en-US",
                            {
                              style: "currency",
                              currency: "USD",
                            }
                          )
                        : "--"
                    }
                  />
                  <TotalsRow
                    label={"Excise Tax"}
                    value={
                      Boolean(fireOrder?.data?.cart?.exciseTax)
                        ? fireOrder?.data.cart.exciseTax.toLocaleString(
                            "en-US",
                            {
                              style: "currency",
                              currency: "USD",
                            }
                          )
                        : "--"
                    }
                  />
                  <TotalsRow
                    label={"Local Tax"}
                    value={
                      Boolean(fireOrder?.data?.cart?.localTax)
                        ? fireOrder?.data.cart.localTax.toLocaleString(
                            "en-US",
                            {
                              style: "currency",
                              currency: "USD",
                            }
                          )
                        : "--"
                    }
                  />
                  <TotalsRow
                    label={"Sales Tax"}
                    value={
                      Boolean(fireOrder?.data?.cart?.salesTax)
                        ? fireOrder?.data.cart.salesTax.toLocaleString(
                            "en-US",
                            {
                              style: "currency",
                              currency: "USD",
                            }
                          )
                        : "--"
                    }
                  />
                  {Boolean(fireOrder?.data?.cart?.deliveryFee) && (
                    <TotalsRow
                      label={"Delivery Fee"}
                      value={
                        Boolean(fireOrder?.data?.cart?.deliveryFee)
                          ? fireOrder?.data.cart.deliveryFee.toLocaleString(
                              "en-US",
                              {
                                style: "currency",
                                currency: "USD",
                              }
                            )
                          : "--"
                      }
                    />
                  )}
                  {Boolean(fireOrder?.data?.cart?.serviceFee) && (
                    <TotalsRow
                      label={"Service Fee"}
                      value={
                        Boolean(fireOrder?.data?.cart?.serviceFee)
                          ? fireOrder?.data.cart.serviceFee.toLocaleString(
                              "en-US",
                              {
                                style: "currency",
                                currency: "USD",
                              }
                            )
                          : "--"
                      }
                    />
                  )}
                  <TotalsRow
                    label={"Discount"}
                    value={
                      Boolean(fireOrder?.data?.cart?.discount)
                        ? fireOrder?.data.cart.discount.toLocaleString(
                            "en-US",
                            {
                              style: "currency",
                              currency: "USD",
                            }
                          )
                        : "--"
                    }
                  />
                </div>
              </section>
              {/* TOTAL  */}
              {
                  
                <TotalsRow
                  label={"Grand Total"}
                  variant='total'
                  value={
                    Boolean(fireOrder?.data?.cart?.grandTotal)
                      ? fireOrder?.data.cart.grandTotal.toLocaleString(
                          "en-US",
                          {
                            style: "currency",
                            currency: "USD",
                          }
                        )
                      : "--"
                  }
                />
                
              }
            </>
          ) : (
            <div className='nav-loader info-width'>
              <Spinner />
            </div>
          )}
        </div>
      </InfoPane>
      {!["paid", "cancel"].includes(fireOrder.data?.progress) && (
        <ProgressFooter>
          {Boolean(fireOrder.status === "success") &&
          Boolean(fireOrder.data?.progress) ? (
            <SlideButton
              disabled={disabled || loading || !Boolean(selectedDriver?.value) || !Boolean(fireCustomer?.data)}
              text={progressButton[fireOrder.data?.progress]}
              onUnlock={handleUpdate}
            />
          ) : (
            <Spinner />
          )}
        </ProgressFooter>
      )}
    </SplitWindow>
  )
}

export default SelectedOrder

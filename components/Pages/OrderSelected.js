import styles from "./OrderSelected.module.scss";
import {
  SplitWindow,
  InfoPane,
  //MapPane,
  //InfoHeader,
  //MapHeader,
  ProgressFooter,
  SlideButton,
  TotalsRow,
} from "../Split";
import { useUser } from "../../context/userContext";
import firebase, {
  updateFirestore,
  getMatrix,
  //getMapboxDirectionsX,
  updateFirestoreGroup,
} from "../../firebase/clientApp";
import { useRouter } from "next/router";
import Spinner from "../Buttons/Spinner";
import Select from "../Forms/Select";
import OrderMenu from "../Console/OrderMenu";
import { useForm } from "../../context/formContext";
import { useEffect, useState, useCallback, useRef } from "react";
import MenuItem from "../Menus/MenuItem";
import * as d3 from "d3-ease";
import FitBoundsSVG from "../../assets/FitBounds";
import ReactMapGL, { FlyToInterpolator, WebMercatorViewport, Marker, Popup } from "react-map-gl";
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
  getMapSize,
} from "../../helpers";
import SVGIcon from "../SVGIcon";
import Button from "../Buttons/Button";
import CartItem from "../CartItem";
import { useOrder } from "../../context/orderContext";
import { points } from "@turf/helpers";
import center from "@turf/center";
import bbox from "@turf/bbox";
import { useWindowSize } from "../../hooks/useWindowSize";
import { OrderMarkers, MapPopup } from "../MapBox";
import { useRouting } from "../../context/routingContext";

import { useDispatchModal } from "../../context/modalContext";
import { ReturnsModal, ReturnsCompleteModal } from "../Modals";
import { NotificationManager } from "react-notifications";
import { defaultTheme } from "../../styles/themer/utils";
import Link from "next/link";
import copy from "copy-to-clipboard";
import { useFirestoreQuery } from "../../hooks/useFirestoreQuery";
import { useHistory } from "../../context/History";

Date.prototype.addHours = function (h) {
  this.setTime(this.getTime() + h * 60 * 60 * 1000);
  return this;
};
let isNum = (x) => {
  const y = 0;
  if (x === undefined) return y;
  if (x === null) return y;
  if (x === NaN) return y;
  x = parseFloat(x);
  return isNaN(x) ? y : x;
};

let isStr = (x) => {
  const y = "";
  if (x === undefined) return y;
  if (x === null) return y;
  if (x === NaN) return y;
  if (typeof x === "string" || x instanceof String) {
    return x;
  } else {
    return y;
  }
};

let isCurr = (x) => {
  const y = "$0.00";
  if (x === undefined) return y;
  if (x === null) return y;
  if (x === NaN) return y;
  if (isNum(x) > 0) {
    return x.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  } else {
    return y;
  }
};
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
};
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
};
const progressButtonDriver = {
  received: "Dispatch Order",
  pending: "Accept Order",
  assigned: "Pickup Order",
  pickup: "10-min Warning",
  warning: "Mark Arrived",
  arrived: "Mark Delivered",
  complete: "Mark Paid",
  refund: "Order Refunded",
  paid: "Order Paid",
  loading: "Loading...",
  cancel: "Order Canceled",
};
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
};

const progressTitleDriver = {
  received: "Order Received",
  pending: "Pending Order",
  warning: "Order Warning",
  arrived: "Driver Arrived",
  cancel: "Order Canceled",
  refund: "Order Refund",
  assigned: "Order Accepted",
  complete: "Order Delivered",
  paid: "Order Paid",
  pickup: "Order Pickup",
  loading: "Loading...",
};
const Strike = ({ children }) => {
  return <div style={{ textDecorationLine: "line-through" }}>{children}</div>;
};

const SelectedOrder = ({ fireCustomer, fireOrder }) => {
  //need to load user
  /// neeed to load acount
  /// need to load drivers
  const router = useRouter();
  const { width, height } = useWindowSize();
  const { user, fireSettings, fireUser } = useUser();
  const { form, setForm } = useForm();
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setNavLoading } = useRouting();
  const { modalDispatch, modalState } = useDispatchModal();
  const { history, back } = useHistory();

  const fireDrivers = useFirestoreQuery(
    user?.uid &&
      firebase
        .firestore()
        .collection("users")
        .where("online", "==", true)
        .where("role", "in", ["driver", "dispatcher", "manager"])
  );

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
    });
  };

  const [active, setActive] = useState("cart");

  const [view, setView] = useState({
    ...{
      latitude: 34.103729,
      longitude: -118.328613,
      zoom: 9,
    },
    ...getMapSize(width, height),
  });

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
  } = useOrder();

  useEffect(() => {
    if (Boolean(height) && Boolean(width)) {
      setView({ ...{ ...view }, ...getMapSize(width, height) });
    }
    //alert('high')
  }, [width, height]);

  /* SET DEFAULT SELECTED DRIVER */
  useEffect(() => {
    let value = null;
    let label = null;
    if (fireOrder?.data?.driver) {
      value = fireOrder.data.driver;
      label = fireOrder.data.driverName;
      // driverRef && collapse(driverRef)
      if (value !== selectedDriver?.value) {
        setSelectedDriver(label && value ? { label, value } : null);
      }
    } else {
      //driverRef && expand(driverRef)
    }
  }, [selectedDriver, fireOrder]);

  useEffect(() => {
    let tempView = { ...view };
    if (bounds.length === 1) {
      tempView = {
        ...tempView,
        ...{ latitude: bounds[0][1], longitude: bounds[0][0], zoom: 11 },
      };
    } else if (bounds.length > 1) {
      const features = points(bounds);
      const cent = center(features);
      const _bbox = bbox(features);
      const newViewport = new WebMercatorViewport(tempView);
      const { longitude, latitude, zoom } = newViewport.fitBounds(
        [
          [_bbox[0], _bbox[1]],
          [_bbox[2], _bbox[3]],
        ],
        { padding: { top: 180, bottom: 30, left: 30, right: 30 } }
      );
      tempView = { ...tempView, ...{ longitude, latitude, zoom } };
    }
    setView(tempView);
  }, [bounds, width]);

  useEffect(() => {
    //alert(JSON.stringify(fireOrder));
    if (fireOrder?.data?.driver) {
      const { driver } = fireOrder.data;
      setForm({ ...form, ...{ selectedDriver: driver } });
    }
  }, [fireOrder]);

  //   const handleSelectDriver = (_, v) => {
  //     return
  //   }

  const handleUpdate = useCallback(async () => {
    if (!router?.query?.uid) {
      return alert("coding error ghjyp");
    }
    if (!router?.query?.oid) {
      return alert("coding error yujkh");
    }

    setLoading(true);
    let { value, label } = selectedDriver;
    if (!selectedDriver?.value) {
      setLoading(false);
      return NotificationManager.error("Select a driver.");
    }
    let p = fireOrder.data?.progress;

    if ([PROGRESS[7], PROGRESS[8]].includes(p)) {
      router.push(`/${user?.uid}/orders/active`);
    } else if ([PROGRESS[0]].includes(p)) {
      setNavLoading(true);
      setTimeout(async () => {
        try {
          await updateFirestoreGroup("users", router.query.uid, "Orders", router.query.oid, {
            progress: PROGRESS[PROGRESS.indexOf(p) + 1],
            driver: selectedDriver?.value,
            driverName: selectedDriver?.label,
            // driver: fireDrivers.data.map(
            //   (user) => user.uid === value && user
            // )[0],
          });
          NotificationManager.success("Message Sent.");
          setLoading(false);
          setNavLoading(false);
        } catch (error) {
          NotificationManager.error("An error occured.");
        }
      }, 2000);
    } else {
      setNavLoading(true);
      setTimeout(async () => {
        try {
          await updateFirestoreGroup("users", router.query.uid, "Orders", router.query.oid, {
            progress: PROGRESS[PROGRESS.indexOf(p) + 1],
          });
          NotificationManager.success("Order Updated.");
          setLoading(false);
          setNavLoading(false);

          if (PROGRESS[4] === p && fireCustomer?.data?.refundActive === true && fireCustomer?.data?.refundItems) {
            const component = () => <ReturnsModal {...{ fireCustomer }} />;
            openModal(component);
          }
          if (PROGRESS[5] === p && fireCustomer?.data?.refundActive === true && fireCustomer?.data?.refundItems) {
            const component = () => <ReturnsCompleteModal {...{ fireCustomer }} />;
            openModal(component);
          }
        } catch (error) {
          NotificationManager.error("An error occured.");
        }
      }, 2000);
    }
  }, [fireOrder, selectedDriver, router, fireDrivers, fireCustomer]);

  const getDistanceTime = useCallback(async () => {
    const { origins, destinations } = matrix;
    let timeValue = 0;
    console.log("origins, destinations");
    console.log(origins);
    console.log(destinations);
    getMatrix({ origins, destinations })
      .then((r) => {
        console.log("r");
        console.log(r);
        const { rows } = r.data;
        for (const key in rows) {
          const { elements } = rows[key];
          const { value, text } = elements[key].duration;
          timeValue = timeValue + value;
        }
        setDistanceTime(secondsToHms(timeValue));
      })
      .catch((e) => (console.log("e"), console.log(e)));
  }, [matrix]);

  useEffect(() => {
    const { origins, destinations } = matrix;
    if (origins.length && destinations.length) {
      getDistanceTime();
    } else {
      setDistanceTime("--");
    }
  }, [matrix]);

  const collapsable = (e) => {
    if (e.target.id === active) {
      setActive("cart");
    } else {
      setActive(e.target.id);
    }
    return;
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
  };
  const expandable = (e) => {
    const _this = e.target;
    _this.classList.toggle("active");
    var content = _this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
      content.style.overflow = "unset";
    }
  };
  const clearOwedItems = async () => {
    const customer = { ...fireCustomer };
    customer.data.refundActive = false;
    customer.data.refundItems = [];
    try {
      setNavLoading(true);
      await updateFirestore("users", customer.data.uid, customer.data);
      NotificationManager.success("User Updated.");
    } catch (error) {
      NotificationManager.error("An error occurred.");
    } finally {
      setNavLoading(false);
    }
  };

  useEffect(() => {
    setNavLoading(false);
    return () => {
      setSelectedDriver(null);
    };
  }, []);

  useEffect(() => {
    const todaysDate = new Date().toJSON().slice(0, 10);
    console.log("todaysDate");
    console.log(todaysDate);
  }, []);

  //push driver bounds // not if complete // paid // cancel
  const isComplete = Boolean(
    [...orderProgressObject.complete, ...orderProgressObject.cancel].includes(fireOrder?.data?.progress || "")
  );

  return (
    <SplitWindow>
      {["manager", "admin", "dispatcher"].includes(`${fireUser?.data?.role}`) && (
        <OrderMenu {...{ fireOrder }} {...{ fireCustomer }} {...{ fireUser }} />
      )}
      <InfoPane
        back={history.length > 1 ? history[history.length - 2] : `/${user?.uid}/orders/active`}
        //back={back}
        mapComponent={
          fireOrder?.data &&
          fireDrivers?.data &&
          fireSettings?.data &&
          //&& fireCustomer?.data
          user?.uid ? (
            <>
              <div className={styles["selected-map-container"]}>
                <ReactMapGL
                  mapStyle="mapbox://styles/mapbox/streets-v11"
                  mapboxApiAccessToken={TOKEN}
                  onViewportChange={setView}
                  transitionDuration={1000}
                  transitionInterpolator={new FlyToInterpolator()}
                  transitionEasing={d3.easeCubic}
                  containerStyle={{
                    height: "100%",
                    width: "100%",
                  }}
                  {...view}
                >
                  <MapPopup {...{ fireOrder }} />
                  <OrderMarkers {...{ fireOrder }} />
                </ReactMapGL>
              </div>
            </>
          ) : (
            <div className="nav-loader map-width">
              <Spinner />
            </div>
          )
        }
        {...{ fireOrder, fireDrivers, fireSettings, fireCustomer, user }}
      >
        <div className="info-form">
          {fireOrder?.data && fireDrivers?.data && fireSettings?.data && fireUser?.data && user?.uid ? (
            <>
              {/* Progress  */}
              <section style={{ marginTop: "20px" }} className={styles["order-info-section"]}>
                <h1>
                  {["driver"].includes(`${fireUser?.data?.role}`)
                    ? progressTitleDriver[fireOrder.data.progress]
                    : progressTitle[fireOrder.data.progress]}
                </h1>
                <h4>{fireOrder.data?.address.split(",")[0] || "No Address"}</h4>
                {!isComplete && (
                  <p>
                    {Boolean(fireOrder?.data?.start?.length)
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
                <div className="progress-order">
                  <div className="progress-bar-order">
                    <span
                      className="progress-bar-prder-fill"
                      style={{
                        width: `${progressValue[fireOrder.data.progress]}%`,
                      }}
                    />
                  </div>
                </div>
              </section>
              {/* Driver  */}
              <section className={styles["order-info-section"]}>
                <button className={`collapsible${!Boolean(fireOrder?.data?.driver) ? ` active` : ``}`}>
                  <SVGIcon name="car" />
                  {fireOrder.data?.driverName || "Assign a driver"}
                </button>
                <div
                  className={`collapsible-content margin${
                    !Boolean(fireOrder?.data?.driver) && Boolean(fireCustomer?.data) ? ` visible` : ``
                  }`}
                >
                  {!Boolean(fireOrder?.data?.driver) ? (
                    <Select
                      id="selectedDriver"
                      name="selectedDriver"
                      floatingLabelText="Driver"
                      hintText="Select a driver"
                      disabled={
                        Boolean(fireDrivers.status === "success") && Boolean(fireOrder.status === "success")
                          ? !Boolean(fireOrder.data?.progress === "received")
                          : true
                      }
                      onSelect={(_, v) => setSelectedDriver(v)}
                      selectedOption={selectedDriver}
                      fullWidth
                    >
                      {(fireDrivers?.data || []).map(
                        ({ displayName, uid, online }, i) =>
                          online && <MenuItem key={i} label={displayName} value={uid} />
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
                  id="address"
                  onClick={collapsable}
                  className={`collapsible arrow${active === "address" ? ` active` : ``}`}
                >
                  <SVGIcon name="home" />
                  {fireOrder.data?.address.split(",")[0] || "No Address"}
                </button>
                <div className={`collapsible-content margin${active === "address" ? ` visible` : ``}`}>
                  <a
                    href={`https://www.google.com/maps/dir/current+location/${fireOrder.data?.address}`}
                    target="_blank"
                  >
                    <Button className={styles["collapse-button"]} fullWidth={true} text="Get Directions" />
                  </a>

                  <Button
                    onClick={() =>
                      copy(fireOrder.data?.location?.address, {
                        onCopy: NotificationManager.success("Copied"),
                      })
                    }
                    fullWidth={true}
                    className={styles["collapse-button"]}
                    text="Copy Address"
                  />
                </div>
              </section>
              {/* Instructions  */}
              <section className={styles["order-info-section"]}>
                <button id="address" onClick={collapsable} className="collapsible active">
                  <SVGIcon name="instructions" />
                  {"Instructions"}
                </button>
                <div className={`collapsible-content margin visible`}>
                  {fireOrder?.data?.instructions || "No Instructions"}
                </div>
              </section>
              {/* Phone  */}
              <section className={styles["order-info-section"]}>
                <button
                  id="phone"
                  onClick={collapsable}
                  className={`collapsible arrow${active === "phone" ? ` active` : ``}`}
                >
                  <SVGIcon name="phone" />
                  {fireCustomer?.data?.phoneNumber || "No phone number"}
                </button>
                <div className={`collapsible-content margin${active === "phone" ? ` visible` : ``}`}>
                  {width <= 768 && (
                    <>
                      <a href={`tel:${fireCustomer?.data?.phoneNumber}`}>
                        <Button fullWidth={true} className={styles["collapse-button"]} text="Call" />
                      </a>
                      <a href={`sms:${fireCustomer?.data?.phoneNumber}`}>
                        <Button fullWidth={true} className={styles["collapse-button"]} text="Message" />
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
                    text="Copy Phone"
                  />
                </div>
              </section>
              {/* User - License  */}
              {
                <section className={styles["order-info-section"]}>
                  <button
                    id="license"
                    onClick={collapsable}
                    className={`collapsible${Boolean(fireCustomer?.data) ? ` arrow` : ""}${
                      active === "license" ? ` active` : ``
                    }`}
                  >
                    <SVGIcon name="person" />
                    {Boolean(fireCustomer?.data) ? fireCustomer?.data?.displayName || `No user ` : "User not found"}
                    {Boolean(fireCustomer.data?.refundActive) ? (
                      <span className="customer-items">{`, ${fireCustomer.data?.refundItems.length} Item(s) Owed`}</span>
                    ) : (
                      ""
                    )}
                  </button>
                  <div
                    className={`collapsible-content margin${
                      active === "license" && Boolean(fireCustomer?.data) ? ` visible` : ``
                    }`}
                  >
                    <div className="items-owed">{`${fireCustomer?.data?.orders || `No`} Order(s)`}</div>
                    <div className="items-owed">{`${fireCustomer?.data?.refunds || `No`} Refund(s)`}</div>
                    <div className="items-owed">{`License`}</div>
                    <div className={styles["order-img"]}>
                      <img
                        src={
                          fireOrder.data?.photoURL ||
                          "https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2Fplaceholder-images-image_large.png?alt=media&token=9dcb7b69-aee4-43ad-9a16-f984510b9703"
                        }
                      />
                    </div>

                    {Boolean(fireCustomer?.data?.refundActive) && (
                      <>
                        <div className="items-owed">
                          {`${
                            (fireCustomer?.data?.refundItems && fireCustomer?.data?.refundItems.length) || "No "
                          } Item(s) Owed`}
                        </div>
                        {Boolean(fireCustomer?.data?.refundItems) &&
                          fireCustomer?.data?.refundItems.map(
                            ({ genome, pid, img, inventory, name, price, size, type, qty, wholesale }, i) => (
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
                                wholesale={wholesale || 0}
                              />
                            )
                          )}
                        <Button
                          fullWidth={true}
                          className={styles["collapse-button"]}
                          onClick={clearOwedItems}
                          text="Mark Recieved"
                        />
                      </>
                    )}
                    {/* <Button fullWidth={true}  className={styles['collapse-button']} text='Update ID' />  */}
                  </div>
                </section>
              }
              {/*  Items CART  */}
              <section className={styles["order-info-section"]}>
                <button
                  id="cart"
                  onClick={collapsable}
                  className={`collapsible arrow${active === "cart" ? ` active` : ``}`}
                >
                  <SVGIcon name="orderReview" />
                  {`${fireOrder?.data?.cartItems?.length || 0} Item(s)`}
                </button>
                <div className={`collapsible-content cart${active === "cart" ? ` visible` : ``}`}>
                  {Boolean(fireOrder?.data?.cartItems?.length) &&
                    fireOrder?.data?.cartItems.map(
                      ({ genome, pid, img, inventory, name, price, size, type, qty, wholesale, filePath }, i) => (
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
                          wholesale={wholesale || 0}
                          filePath={filePath}
                        />
                      )
                    )}

                  {/* <Button fullWidth={true}  className={styles['collapse-button']} text='Remove Item' />  */}
                </div>
              </section>
              {/* REFUND Items CART */}
              {/* {Boolean(fireOrder?.data?.refund) && (
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
                            wholesale
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
                            wholesale={wholesale||0}
                          />
                        )
                      )}

                  </div>
                </section>
              )} */}
              {/* REFUND TOTALS  */}
              {/* {Boolean(fireOrder?.data?.refund) && (
                <section className={styles["order-info-section"]}>
                  <button
                    id='totals'
                    onClick={expandable}
                    className={`collapsible arrow refund`}>
                    <SVGIcon name='refund' />
                    {`${
                      Boolean(fireOrder?.data?.cart?.refundTotal)
                       ? isCurr(fireOrder?.data.cart.refundTotal)
                       : '$-.--'
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
                          Boolean(fireOrder?.data?.cartTotals?.refundsalesTax)
                            ? fireOrder?.data.cartTotals.refundsalesTax.toLocaleString(
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
              )} */}
              {/* TOTALS  */}
              <section className={styles["order-info-section"]}>
                <button
                  id="totals"
                  //onClick={collapsable}
                  className={`collapsible active`}
                >
                  <SVGIcon name="money" />
                  Cash
                </button>
                <div className="totals-list">
                  {/* //fireDisc */}
                  {Boolean(fireOrder?.data?.discounts?.length) &&
                    fireOrder?.data?.discounts.map((discount) => (
                      <div
                        style={{
                          alignItems: "center",
                          display: "flex",
                          padding: "10px",
                          borderRadius: "8px",
                          width: "100%",
                          color: "white",
                          margin: "0 0 16px 0",
                          backgroundColor: "rgb(212, 54, 132)",
                          boxShadow: "0 1px 2px 0 rgb(60 64 67 / 30%), 0 1px 3px 1px rgb(60 64 67 / 15%)",
                          backgroundImage:
                            "url(https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2FDollarBillsYall2.png?alt=media&token=ba79a182-7cfa-4e3a-bac9-2eb45921bfff)",
                        }}
                      >
                        <div style={{ flex: 3 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              fontWeight: 500,
                            }}
                          >
                            {`${discount.title}${String.fromCharCode(160)}`}
                            {discount.stackable && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="18px"
                                viewBox="0 0 24 24"
                                width="18px"
                                fill="#FFFFFF"
                              >
                                <path d="M0 0h24v24H0V0z" fill="none" />
                                <path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16zm0-11.47L17.74 9 12 13.47 6.26 9 12 4.53z" />
                              </svg>
                            )}
                          </div>

                          {fireOrder?.data?.cartTotals?.discountsTotal && (
                            <div style={{ fontSize: "12px" }}>
                              You saved {isCurr(fireOrder?.data?.cartTotals?.discountsTotal)}
                            </div>
                          )}
                          {/* {discount.methodID === "bogo" && (
                                          <div style={{ fontSize: "12px" }}>You saved {isCurr(discount.rate)}</div>
                                        )}
                                        {discount.methodID === "flatRate" && (
                                          <div style={{ fontSize: "12px" }}>You saved {isCurr(flatRateSaved)}</div>
                                        )}
                                        {taxesSaved > 0 && <div style={{ fontSize: "12px" }}>You saved {isCurr(taxesSaved)}</div>}
                                        {discount.methodID === "percent" && discount.stackable === false && (
                                          <div style={{ fontSize: "12px" }}>You saved {isCurr(discountState)}</div>
                                        )} */}
                        </div>
                      </div>
                    ))}
                  {/* //fireCredits */}
                  {Boolean(fireOrder?.data?.credits?.length) &&
                    fireOrder?.data?.credits.map((discount) => (
                      <div
                        style={{
                          alignItems: "center",
                          display: "flex",
                          padding: "10px",
                          borderRadius: "8px",
                          width: "100%",
                          color: "white",
                          margin: "0 0 16px 0",
                          backgroundColor: "rgb(212, 54, 132)",
                          boxShadow: "0 1px 2px 0 rgb(60 64 67 / 30%), 0 1px 3px 1px rgb(60 64 67 / 15%)",
                          backgroundImage:
                            "url(https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2FDollarBillsYall2.png?alt=media&token=ba79a182-7cfa-4e3a-bac9-2eb45921bfff)",
                        }}
                      >
                        <div style={{ flex: 3 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              fontWeight: 500,
                            }}
                          >{`${discount.title}${String.fromCharCode(160)}`}</div>
                          <div style={{ fontSize: "12px" }}>{`Using ${isCurr(
                            +fireOrder?.data?.cartTotals?.creditTotal
                          )} of ${isCurr(+discount.initialAmount)}.`}</div>
                        </div>
                      </div>
                    ))}

                  {/* <div className={`totals-overlay${fireCartTotals?.data?.loading ? "" : ` fadeOut`}`}>
                                <Spinner color={"rgb(0,200,5)"} style={null} />
                              </div> */}
                  <TotalsRow
                    label={"Subtotal"}
                    variant={false}
                    value={
                      Boolean(fireOrder?.data?.taxableSubtotal < fireOrder?.data?.subtotal) ? (
                        <>
                          <span>
                            {fireOrder?.data?.taxableSubtotal.toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                            })}
                          </span>
                          {`${String.fromCharCode(160)}`}
                          <Strike>
                            {fireOrder?.data?.subtotal.toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                            })}
                          </Strike>
                        </>
                      ) : (
                        <span>
                          {fireOrder?.data?.subtotal
                            ? fireOrder?.data?.subtotal.toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                              })
                            : `$0.00`}
                        </span>
                      )
                    }
                  />
                  {/* <TotalsRow
                                label={"Delivery Fee"}
                                variant={false}
                                value={
                                  priceTotal >= Number(fireSettings?.data?.freeDeliveryMin) ? (
                                    <>
                                      {`${isCurr(0)}`}
                                      {`${String.fromCharCode(160)}`}
                                      <Strike>{`${isCurr(fireSettings?.data?.deliveryFee)}`}</Strike>
                                    </>
                                  ) : (
                                    `+${isCurr(fireSettings?.data?.deliveryFee)}`
                                  )
                                }
                              /> */}
                  {Boolean(fireOrder?.data?.deliveryFee) && (
                    <TotalsRow
                      variant={null}
                      label={"Delivery Fee"}
                      value={
                        Boolean(fireOrder?.data?.deliveryTotal < fireOrder?.data?.deliveryFee) ? (
                          <>
                            <span>
                              {fireOrder?.data?.deliveryTotal.toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                              })}
                            </span>
                            {`${String.fromCharCode(160)}`}
                            <Strike>
                              {fireOrder?.data?.deliveryFee.toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                              })}
                            </Strike>
                          </>
                        ) : (
                          <span>
                            {fireOrder?.data?.deliveryFee
                              ? fireOrder?.data?.deliveryFee.toLocaleString("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                })
                              : `$0.00`}
                          </span>
                        )
                      }
                    />
                  )}
                  {Boolean(fireOrder?.data?.serviceFee) && (
                    <TotalsRow
                      variant={null}
                      label={"Service Fee"}
                      value={
                        Boolean(fireOrder?.data?.serviceFeeTotal < fireOrder?.data?.serviceFee) ? (
                          <>
                            <span>
                              {fireOrder?.data?.serviceFeeTotal.toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                              })}
                            </span>
                            <span>
                              {`${String.fromCharCode(160)}`}
                              <Strike>
                                {fireOrder?.data?.serviceFee.toLocaleString("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                })}
                              </Strike>
                            </span>
                          </>
                        ) : (
                          <span>
                            {fireOrder?.data?.serviceFee
                              ? fireOrder?.data?.serviceFee.toLocaleString("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                })
                              : `$0.00`}
                          </span>
                        )
                      }
                    />
                  )}
                  {/* <TotalsRow
                                variant={false}
                                label={"Service Fee"}
                                value={`+${isCurr(fireSettings?.data?.serviceFee)}`}
                              /> */}
                  <TotalsRow
                    variant={false}
                    label={`Excise Tax ${fireOrder?.data?.exciseTax * 100}%`}
                    value={`+${isCurr(fireOrder?.data?.exciseTaxTotal)}`}
                  />
                  <TotalsRow
                    variant={false}
                    label={`Local Tax ${fireOrder?.data?.localTax * 100}%`}
                    value={`+${isCurr(fireOrder?.data?.localTaxTotal)}`}
                  />
                  <TotalsRow
                    variant={false}
                    label={`State Tax ${fireOrder?.data?.stateTax * 100}%`}
                    value={`+${isCurr(fireOrder?.data?.stateTaxTotal)}`}
                  />
                  {/* <TotalsRow
                                variant="bold"
                                label={"Total"}
                                value={`${
                                  // isTaxFree
                                  //   ? isCurr(fromCents(+subTotalState, 2))
                                  //   : isCurr(grandTotal)
                                  isCurr(fireOrder?.data?.grandTotal)
                                }`}
                              /> */}
                  {/* <TotalsRow variant="red" label={"You saved"} value={`${isCurr(fireOrder?.data?.totalSaved)}`} /> */}
                </div>
              </section>
              {/* TOTAL  */}

              <div className="cart-margin">
                {
                  <TotalsRow
                    label={"Grand Total"}
                    variant="total"
                    value={
                      Boolean(fireOrder?.data.cartTotals.grandTotal)
                        ? fireOrder?.data.cartTotals.grandTotal.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })
                        : "$0.00"
                    }
                  />
                }

                {Boolean(fireOrder?.data?.cartTotals?.totalSaved) && (
                  <TotalsRow
                    variant={"red"}
                    label={"Customer saved"}
                    value={`${fireOrder?.data?.cartTotals?.totalSaved.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}`}
                  />
                )}
              </div>

              <div style={{ width: "100%", height: "200px" }} />
            </>
          ) : (
            <div className="nav-loader info-width">
              <Spinner />
            </div>
          )}
        </div>
      </InfoPane>
      {!["paid", "cancel"].includes(fireOrder.data?.progress) &&
        !(["complete"].includes(fireOrder.data?.progress) && ["driver"].includes(`${fireUser?.data?.role}`)) && (
          <ProgressFooter>
            {Boolean(fireOrder.status === "success") && Boolean(fireOrder.data?.progress) ? (
              <SlideButton
                disabled={disabled || loading || !Boolean(selectedDriver?.value) || !Boolean(fireCustomer?.data)}
                text={
                  ["driver"].includes(`${fireUser?.data?.role}`)
                    ? progressButtonDriver[fireOrder.data?.progress]
                    : progressButton[fireOrder.data?.progress]
                }
                onUnlock={handleUpdate}
              />
            ) : (
              <Spinner />
            )}
          </ProgressFooter>
        )}
    </SplitWindow>
  );
};

export default SelectedOrder;

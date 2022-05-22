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
} from "../../Split";

import { Delete } from "baseui/icon";
import { Check, ChevronRight, DeleteAlt } from 'baseui/icon';
import { ListItem, ListItemLabel } from 'baseui/list';
import { useUser } from "../../../context/userContext";
import { Button, KIND, SHAPE } from "baseui/button";
import firebase, {
  updateFirestore,
  getMatrix,
  //getMapboxDirectionsX,
  updateFirestoreGroup,
} from "../../../firebase/clientApp";
import { useRouter } from "next/router";
import Spinner from "../../Buttons/Spinner";
import { Select, TYPE } from "baseui/select";
import OrderMenu from "../../Console/OrderMenu";
import { useForm } from "../../../context/formContext";
import { useEffect, useState, useCallback, useRef } from "react";
import MenuItem from "../../Menus/MenuItem";
import * as d3 from "d3-ease";
import FitBoundsSVG from "../../../assets/FitBounds";
import ReactMapGL, {
  FlyToInterpolator,
  WebMercatorViewport,
  Marker,
  Popup,
} from "react-map-gl";
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
} from "../../../helpers";
import SVGIcon from "../../SVGIcon";
//import Button from "../../Buttons/Button";
import CartItem from "./CartItem";
import { useOrder } from "../../../context/orderContext";
import { points } from "@turf/helpers";
import center from "@turf/center";
import bbox from "@turf/bbox";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { OrderMarkers, MapPopup } from "../../MapBox";
import { useRouting } from "../../../context/routingContext";

import { FormControl } from "baseui/form-control";
import { useDispatchModal } from "../../../context/modalContext";
import { ReturnsModal, ReturnsCompleteModal } from "../../Modals";
import { NotificationManager } from "react-notifications";
import { defaultTheme } from "../../../styles/themer/utils";
import Link from "next/link";
import copy from "copy-to-clipboard";
import { useFirestoreQuery } from "../../../hooks/useFirestoreQuery";
import { useHistory } from "../../../context/History";
import { useStyletron } from "baseui";
import { styled } from "baseui";
import { H5, H6, Label1, Label2, Paragraph2 } from "baseui/typography";
//import { Button, KIND, SIZE, SHAPE } from "baseui/button";
import * as React from "react";
import { StatelessAccordion, Panel } from "baseui/accordion";
import { ProgressBar, SIZE } from "baseui/progress-bar";
import { Img } from "react-image";
import { useScreen } from "../../../context/screenContext";
import { Drawer, ANCHOR } from "baseui/drawer";
import { useSnackbar, DURATION } from "baseui/snackbar";

const InfoBackground = styled("div", ({ $theme }) => {
  return {
    backgroundColor: $theme.colors.background,
    //borderLeft: `1px solid ${$theme.borders.border600.borderColor}`,
  };
});

const ProgressSection = styled("section", ({ $theme }) => {
  return {
    marginTop: $theme.sizing.scale1600,
    "@media (max-width: 919px)": {
      marginTop: $theme.sizing.scale200,
    },
  };
});

//TS
function addHoursToDate(date: Date, hours: number): Date {
  return new Date(new Date(date).setHours(date.getHours() + hours));
}

let myDate = new Date();

console.log(myDate);
console.log(addHoursToDate(myDate, 2));

type Selected = {
  label: string | number | Date;
  value: string | number | Date;
};

class DriverClass {
  driver: Selected;
  constructor(driver: Selected) {
    this.driver = driver;
  }
}

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

  const { enqueue, dequeue } = useSnackbar();
  const { toggleTheme, themeState } = useScreen();
  const {
    form,
    setForm,
    error,
    setError,
    loading,
    setLoading,
    isSideOpen,
    setIsSideOpen,
  } = useForm();
  const [disabled, setDisabled] = useState(false);
  //const [loading, setLoading] = useState(false);
  const [mapSize, setMapSize] = useState({ height: 0, width: 0 });
  const { setNavLoading } = useRouting();
  const { modalDispatch, modalState } = useDispatchModal();
  const { history, back } = useHistory();

  const [isOpen, setIsOpen] = useState(false);
  const [css] = useStyletron();

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
      const _mapSize = getMapSize(width, height);
      setView({ ...{ ...view }, ..._mapSize });
      setMapSize(_mapSize);
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
      if (value !== form?.driver?.value) {
        // setSelectedDriver(label && value ? { label, value } : null);
        // setForm((oldForm)=>({...oldForm, ...{driver:[{ label, value }]} }))
      }
    } else {
      //driverRef && expand(driverRef)
    }
  }, [form?.driver, fireOrder]);

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
      const { driver, driverName } = fireOrder.data;
      setForm({
        ...form,
        ...{ driver: [{ label: driverName, value: driver }] },
      });
    }
  }, [fireOrder]);

  const handleUpdate = useCallback(async () => {
    if (!router?.query?.uid) {
      return alert("coding error ghjyp");
    }
    if (!router?.query?.oid) {
      return alert("coding error yujkh");
    }

    setLoading(true);
    let { value, label } = form?.driver[0];
    if (!form?.driver.length) {
      setLoading(false);
      return NotificationManager.error("Select a driver.");
    }
    let p = fireOrder.data?.progress;

    if ([PROGRESS[7], PROGRESS[8]].includes(p)) {
      router.push(`/${user?.uid}/orders/active`);
    } else if ([PROGRESS[0]].includes(p)) {
      setLoading(true);
      enqueue({ message: "Assigning order", progress: true }, DURATION.infinite);
      setTimeout(async () => {
        try {
          await updateFirestoreGroup(
            "users",
            router.query.uid,
            "Orders",
            router.query.oid,
            {
              progress: PROGRESS[PROGRESS.indexOf(p) + 1],
              driver: form?.driver[0]?.value,
              driverName: form?.driver[0]?.label,
            }
          );
          dequeue();
          enqueue({ message: "Order sent.", startEnhancer: ({ size }) => <Check size={size} /> }, DURATION.short);
          setLoading(false);
          setNavLoading(false);
        } catch (error:any) {
          //setError(`${e?.message || e}`);
          setError((oldError) => ({ ...oldError, ...{ server: `Error sending order.`} }));
          dequeue();
          //showToast(`${error?.message || error}`);
          enqueue({ message: `Error sending order`, startEnhancer: ({ size }) => <DeleteAlt size={size} /> }, DURATION.short);
        }finally {
          setLoading(false);
          //setNavLoading(false);
        }
      }, 2000);
    } else {
      //setNavLoading(true);
      setLoading(true);
      enqueue({ message: "Updating progress", progress: true }, DURATION.infinite);
      setTimeout(async () => {
        try {
          await updateFirestoreGroup(
            "users",
            router.query.uid,
            "Orders",
            router.query.oid,
            {
              progress: PROGRESS[PROGRESS.indexOf(p) + 1],
            }
          );
          dequeue();
          enqueue({ message: "Progress updated.", startEnhancer: ({ size }) => <Check size={size} /> }, DURATION.short);
          setLoading(false);
          setNavLoading(false);
       } catch (error:any) {
          //setError(`${e?.message || e}`);
          setError((oldError) => ({ ...oldError, ...{ server: `Error updating progress`} }));
          dequeue();
          //showToast(`${error?.message || error}`);
          enqueue({ message: `Error updating progress`, startEnhancer: ({ size }) => <DeleteAlt size={size} /> }, DURATION.short);
         }finally {
          setLoading(false);
          //setNavLoading(false);
        }

      }, 2000);
    }
  }, [fireOrder, form?.driver, router, fireDrivers, fireCustomer]);

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
  };

  const clearOwedItems = async () => {
    const customer = { ...fireCustomer };
    customer.data.refundActive = false;
    customer.data.refundItems = [];
    try {
      setNavLoading(true);
      await updateFirestore("users", customer.data.uid, customer.data);
      NotificationManager.success("User Updated.");
    } catch (error:any) {
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
    [...orderProgressObject.complete, ...orderProgressObject.cancel].includes(
      fireOrder?.data?.progress || ""
    )
  );
  const [expanded, setExpanded] = React.useState<React.Key[]>([
    //"driver",
    "items",
  ]);

  const handleQuit = async () => {
    //setNavLoading(true)
    setLoading(true)
    try {
      await updateFirestoreGroup("users", router.query.uid, "Orders", router.query.oid, {
        progress: 'cancel',
      })
      NotificationManager.warning('Order Canceled.')
    } catch (e) {
      NotificationManager.error('An error occured.')
    } finally {
      //setNavLoading(false)
      setLoading(false)
    }

  }
  const handleReset = async () => {
    setLoading(true)
    enqueue({ message: "Reseting order", progress: true }, DURATION.infinite);
    setTimeout(async () => {
      try {
        //const FieldValue = firebase.firestore.FieldValue
        await updateFirestoreGroup("users", router.query.uid, "Orders", router.query.oid, {
          progress: 'received',
          driver: false,
          driverName: false,
        })
        setIsSideOpen(false)
        dequeue();
        enqueue({ message: "Order reset", startEnhancer: ({ size }) => <Check size={size} /> }, DURATION.short);
      } catch (e) {
        setError((oldError) => ({ ...oldError, ...{ server: `Error reseting order.` } }));
        dequeue();
        //showToast(`${error?.message || error}`);
        enqueue({ message: `Error reseting order`, startEnhancer: ({ size }) => <DeleteAlt size={size} /> }, DURATION.short);
      } finally {
        setLoading(false)
      }
    }, 2000);
  }
  return (
    <SplitWindow>
      {["manager", "admin", "dispatcher"].includes(
        `${fireUser?.data?.role}`
      ) && (
          // <OrderMenu {...{ fireOrder }} {...{ fireCustomer }} {...{ fireUser }} />

          <Drawer
            isOpen={isSideOpen}
            autoFocus
            onClose={() => setIsSideOpen(false)}
            anchor={ANCHOR.right}
            overrides={{
              Root: { style: ({ $theme }) => ({ zIndex: 100 }) },
              DrawerContainer: {
                style: ({ $theme }) => ({ maxWidth: "414px", width: '100%', paddingTop: '16px' })
              }
            }}
          >
            <>
              <ul>
                {/** HEADER */}
                {fireOrder.status === "success" &&
                  fireCustomer.status === "success" ? (
                  <>
                    {/** FEATURE */}
                    {/* <li className='order-menu-item'>
                <SVGIcon style={{marginRight: 12}} name='locationMarker' color={action} />
                <span>{fireOrder.data?.location.address.split(',')[0] || ''}</span>
              </li> */}

                    {/** DECLINE */}
                    <ListItem
                      // onClick={handleQuit}
                      artwork={() => (
                        <SVGIcon style={{ marginRight: 12 }} name="x" />
                      )}

                    //endEnhancer={() => <SVGIcon name="arrowRightSmall" />}
                    >
                      <ListItemLabel >
                        <Button
                          disabled={loading}
                          kind={KIND.tertiary}
                          overrides={{
                            BaseButton: {
                              style: ({ $theme }) => ({
                                width: "100%",
                                display: 'flex',
                                minWidth: "160px",
                                maxWidth: "100%",
                                textAlign: 'left',
                                justifyContent: 'start'

                                //smarginBottom: "16px",
                              }),
                            },
                          }}
                        // endEnhancer={
                        //   <SVGIcon style={{ marginLeft: 12 }} name="arrowRightSmall" />
                        // }
                        //onClick={handleQuit}
                        //</li>disabled={quitDisabled}
                        >
                          Quit Order
                        </Button></ListItemLabel>
                    </ListItem>


                    {/** RFeset */}
                    <ListItem
                      // onClick={handleQuit}
                      artwork={() => (
                        <SVGIcon style={{ marginRight: 12, transform: "scaleX(-1)" }}
                          name="refund" />
                      )}

                    //endEnhancer={() => <SVGIcon name="arrowRightSmall" />}
                    >
                      <ListItemLabel >
                        <Button
                          disabled={loading}
                          kind={KIND.tertiary}
                          overrides={{
                            BaseButton: {
                              style: ({ $theme }) => ({
                                width: "100%",
                                display: 'flex',
                                minWidth: "160px",
                                maxWidth: "100%",
                                textAlign: 'left',
                                justifyContent: 'start'

                                //smarginBottom: "16px",
                              }),
                            },
                          }}
                          // endEnhancer={
                          //   <SVGIcon style={{ marginLeft: 12 }} name="arrowRightSmall" />
                          // }
                          onClick={handleReset}
                        //</li>disabled={quitDisabled}
                        >
                          Reset Order
                        </Button></ListItemLabel>
                    </ListItem>


                    {/**  Edet */}
                    <ListItem
                      // onClick={handleQuit}
                      artwork={() => (
                        <SVGIcon style={{ marginRight: 12 }}
                          name="pencil" />
                      )}

                    //endEnhancer={() => <SVGIcon name="arrowRightSmall" />}
                    >
                      <ListItemLabel >
                        <Button
                          disabled={loading}
                          kind={KIND.tertiary}
                          overrides={{
                            BaseButton: {
                              style: ({ $theme }) => ({
                                width: "100%",
                                display: 'flex',
                                minWidth: "160px",
                                maxWidth: "100%",
                                textAlign: 'left',
                                justifyContent: 'start'

                                //smarginBottom: "16px",
                              }),
                            },
                          }}
                        // endEnhancer={
                        //   <SVGIcon style={{ marginLeft: 12 }} name="arrowRightSmall" />
                        // }
                        //onClick={handleQuit}
                        //</li>disabled={quitDisabled}
                        >
                          Edit Progress
                        </Button></ListItemLabel>
                    </ListItem>



                    {/* {["manager", "admin", "dispatcher"].includes(
                      `${fireUser?.data?.role}`
                    ) && (
                        <li>
                          <Button
                            startEnhancer={
                              <SVGIcon style={{ marginRight: 12 }} name="x" />
                            }
                          //onClick={handleQuit}
                          //</li>disabled={quitDisabled}
                          >
                            <span>Quit Order</span>
                          </Button>
                        </li>
                      )} */}
                    {/** RESET */}
                    {/* <li>
                      <Button
                      //onClick={handleReset}
                      //className='button-base'
                      //disabled={resetDisabled}
                      >
                        <SVGIcon
                          style={{ marginRight: 12, transform: "scaleX(-1)" }}
                          name="refund"
                        //color={resetDisabled ? disabled : action}
                        />
                        <span>Reset Order</span>
                      </Button>
                    </li> */}
                    {/** REFUND */}
                    {/* <li>
                      <button
                        //onClick={handleRefund}
                        //className="button-base"
                        //disabled={refundDisabled}
                      >
                        <SVGIcon
                          style={{ marginRight: 12 }}
                          name="replacement"
                          color={refundDisabled ? disabled : action}
                        />
                        <span>Refund Order</span>
                      </button>
                  </li> */}
                    {/** Edit Progress */}
                    {/* <li>
                      <Button
                      //onClick={handleProgress}
                      //className="button-base"
                      //disabled={progressDisabled}
                      >
                        <SVGIcon
                          style={{ marginRight: 12 }}
                          name="pencil"
                        //color={progressDisabled ? disabled : action}
                        />
                        <span>Edit Progress</span>
                      </Button>
                    </li> */}
                  </>
                ) : (
                  <div className="spinner-box">
                    <Spinner />
                  </div>
                )}
              </ul>
            </>
          </Drawer>
        )}
      <InfoPane
        back={
          history.length > 1
            ? history[history.length - 2]
            : `/${user?.uid}/orders/active`
        }
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
                  mapStyle={
                    themeState?.dark
                      ? "mapbox://styles/mapbox/dark-v10"
                      : "mapbox://styles/mapbox/light-v10"
                  }
                  mapboxApiAccessToken={TOKEN}
                  onViewportChange={setView}
                  transitionDuration={1000}
                  transitionInterpolator={new FlyToInterpolator()}
                  transitionEasing={d3.easeCubic}
                  containerStyle={{
                    height: mapSize.height,
                    width: mapSize.width,
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
        <InfoBackground className="info-form">
          {fireOrder?.data &&
            fireDrivers?.data &&
            fireSettings?.data &&
            fireUser?.data &&
            user?.uid ? (
            <>
              {/* Progress  */}
              <ProgressSection
              //style={{ marginTop: "20px" }}
              //className={styles["order-info-section"]}
              >
                <H6>{fireOrder.data?.address.split(",")[0] || "No Address"}</H6>
                <Label2>
                  {["driver"].includes(`${fireUser?.data?.role}`)
                    ? progressTitleDriver[fireOrder.data.progress]
                    : progressTitle[fireOrder.data.progress]}
                </Label2>
                {!isComplete && (
                  <Paragraph2>
                    {Boolean(fireOrder?.data?.start)
                      ? `Due by
                        ${addHoursToDate(
                        new Date(fireOrder?.data?.start.toDate()),
                        1
                      )
                        .toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        .toLowerCase()}`
                      : "--"}
                  </Paragraph2>
                )}

                <ProgressBar
                  value={progressValue[fireOrder.data.progress]}
                  size={SIZE.large}
                  successValue={100}
                  overrides={{
                    Root: {
                      style: ({ $theme }) => ({
                        marginLeft: "-12px",
                        marginRight: "-12px",
                        marginBottom: "36px",
                      }),
                    },
                  }}
                />
              </ProgressSection>

              <StatelessAccordion
                expanded={[
                  ...expanded,
                  ...["items"],
                  ...(!form?.driver ? ["driver"] : []),
                ]}
                onChange={({ key, expanded }) => {
                  console.log(key);
                  setExpanded(expanded);
                }}
              >
                <Panel
                  disabled={!form?.driver}
                  key="driver"
                  title={
                    <div
                      className={css({ display: "flex", alignItems: "center" })}
                    >
                      <SVGIcon
                        className={css({ marginRight: "12px" })}
                        name="car"
                      />
                      {form?.driver?.length
                        ? `${form?.driver[0]?.label || ""}`
                        : "Driver"}
                    </div>
                  }
                >
                  <FormControl>
                    <Select
                      //required
                      disabled={loading || fireOrder?.data?.driver?.length}
                      // onChange={(e) => {
                      //   const str = e?.currentTarget?.value;
                      //   setForm((oldForm: DriverClass) => ({ ...oldForm, ...{ driver: str } }));
                      // }}
                      value={form?.driver}
                      // onFocus={() => (
                      //   //executeScroll(titleRef),
                      //   setError({})
                      // )}
                      key="driver"
                      id="driver"
                      labelKey="label"
                      valueKey="value"
                      //name="driver"
                      error={Boolean(error?.driver)}
                      options={(fireDrivers?.data || []).map(
                        ({ displayName, uid, online }, i) =>
                          online && { label: displayName, value: uid }
                      )}
                      onChange={(params) =>
                        setForm((oldForm: DriverClass) => ({
                          ...oldForm,
                          ...{ driver: params?.value },
                        }))
                      }
                      placeholder="Driver"
                      clearable={false}
                      //clearOnEscape
                      overrides={{
                        // Root: {
                        //   style: ({ $theme }) => ({
                        //     //marginBottom: "16px",
                        //     //minWidth: '260px'
                        //     width: "100%",
                        //   }),
                        // },
                        Popover: {
                          props: {
                            overrides: {
                              Body: {
                                style: ({ $theme }) => ({ zIndex: 100 }),
                              },
                            },
                          },
                        },
                      }}
                    />
                  </FormControl>
                  <Button
                    disabled={!fireOrder?.data?.driver?.length}
                    overrides={{
                      BaseButton: {
                        style: ({ $theme }) => ({
                          width: "100%",
                          marginBottom: "16px",
                        }),
                      },
                    }}
                    onClick={() => {
                      return;
                    }}
                  //fullWidth={true}
                  //className={styles["collapse-button"]}
                  // text="Copy Address"
                  >
                    {"Remove Driver"}
                  </Button>
                </Panel>
                <Panel
                  key="address"
                  title={
                    <div
                      className={css({ display: "flex", alignItems: "center" })}
                    >
                      <SVGIcon
                        className={css({ marginRight: "12px" })}
                        name="home"
                      />
                      {fireOrder.data?.address.split(",")[0] || "No Address"}
                    </div>
                  }
                >
                  <>
                    <a
                      href={`https://www.google.com/maps/dir/current+location/${fireOrder.data?.address}`}
                      target="_blank"
                    >
                      <Button
                        overrides={{
                          BaseButton: {
                            style: ({ $theme }) => ({
                              width: "100%",
                              marginBottom: "16px",
                            }),
                          },
                        }}
                      >
                        {"Get Directions"}
                      </Button>
                    </a>

                    <Button
                      overrides={{
                        BaseButton: {
                          style: ({ $theme }) => ({
                            width: "100%",
                            marginBottom: "16px",
                          }),
                        },
                      }}
                      onClick={() =>
                        copy(fireOrder.data?.location?.address, {
                          onCopy: NotificationManager.success("Copied"),
                        })
                      }
                    //fullWidth={true}
                    //className={styles["collapse-button"]}
                    // text="Copy Address"
                    >
                      {"Copy Address"}
                    </Button>
                  </>
                </Panel>
                <Panel
                  key="instructions"
                  title={
                    <div
                      className={css({ display: "flex", alignItems: "center" })}
                    >
                      <SVGIcon
                        className={css({ marginRight: "12px" })}
                        name="instructions"
                      />
                      Instructions
                    </div>
                  }
                >
                  {fireOrder?.data?.instructions || "No Instructions"}
                </Panel>
                <Panel
                  key="phone"
                  title={
                    <div
                      className={css({ display: "flex", alignItems: "center" })}
                    >
                      <SVGIcon
                        className={css({ marginRight: "12px" })}
                        name="phone"
                      />
                      {fireCustomer?.data?.phoneNumber || "No phone number"}
                    </div>
                  }
                >
                  <>
                    {width <= 768 && (
                      <>
                        <a href={`tel:${fireCustomer?.data?.phoneNumber}`}>
                          <Button
                            overrides={{
                              BaseButton: {
                                style: ({ $theme }) => ({
                                  width: "100%",
                                  marginBottom: "16px",
                                }),
                              },
                            }}
                          >
                            {"Call"}
                          </Button>
                        </a>
                        <a href={`sms:${fireCustomer?.data?.phoneNumber}`}>
                          <Button
                            overrides={{
                              BaseButton: {
                                style: ({ $theme }) => ({
                                  width: "100%",
                                  marginBottom: "16px",
                                }),
                              },
                            }}
                          >
                            {"Message"}
                          </Button>
                        </a>
                      </>
                    )}
                    <Button
                      overrides={{
                        BaseButton: {
                          style: ({ $theme }) => ({
                            width: "100%",
                            // marginBottom: "16px"
                          }),
                        },
                      }}
                      onClick={() =>
                        copy(fireOrder.data?.user?.phoneNumber, {
                          onCopy: NotificationManager.success("Copied"),
                        })
                      }
                    //fullWidth={true}
                    //className={styles["collapse-button"]}
                    //text="Copy Phone"
                    >
                      {"Copy Phone"}
                    </Button>
                  </>
                </Panel>
                <Panel
                  key="user"
                  title={
                    <div
                      className={css({ display: "flex", alignItems: "center" })}
                    >
                      <SVGIcon
                        className={css({ marginRight: "12px" })}
                        name="person"
                      />
                      {Boolean(fireCustomer?.data)
                        ? fireCustomer?.data?.displayName || `No name`
                        : "User not found"}
                    </div>
                  }
                >
                  <>
                    <Img
                      style={{ width: "100%" }}
                      src={
                        fireOrder.data?.photoURL ||
                        "https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2Fplaceholder-images-image_large.png?alt=media&token=9dcb7b69-aee4-43ad-9a16-f984510b9703"
                      }
                    />
                  </>
                </Panel>
                <Panel
                  key="items"
                  disabled={true}
                  title={
                    <div
                      className={css({ display: "flex", alignItems: "center" })}
                    >
                      <SVGIcon
                        className={css({ marginRight: "12px" })}
                        name="order"
                      />
                      {`${fireOrder?.data?.cartItems?.length || 0} Item(s)`}
                    </div>
                  }
                >
                  <>
                    {Boolean(fireOrder?.data?.cartItems?.length) &&
                      fireOrder?.data?.cartItems.map((fireProduct, i) => (
                        <CartItem {...{ fireProduct }} />
                      ))}
                  </>
                </Panel>
                <Panel
                  key="totals"
                  title={
                    <div
                      className={css({ display: "flex", alignItems: "center" })}
                    >
                      <SVGIcon
                        className={css({ marginRight: "12px" })}
                        name="money"
                      />
                      {Boolean(fireOrder?.data.cartTotals.grandTotal)
                        ? fireOrder?.data.cartTotals.grandTotal.toLocaleString(
                          "en-US",
                          {
                            style: "currency",
                            currency: "USD",
                          }
                        )
                        : "Total"}
                    </div>
                  }
                >
                  <>
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
                            boxShadow:
                              "0 1px 2px 0 rgb(60 64 67 / 30%), 0 1px 3px 1px rgb(60 64 67 / 15%)",
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
                                You saved{" "}
                                {isCurr(
                                  fireOrder?.data?.cartTotals?.discountsTotal
                                )}
                              </div>
                            )}
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
                            boxShadow:
                              "0 1px 2px 0 rgb(60 64 67 / 30%), 0 1px 3px 1px rgb(60 64 67 / 15%)",
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
                            >{`${discount.title}${String.fromCharCode(
                              160
                            )}`}</div>
                            <div style={{ fontSize: "12px" }}>{`Using ${isCurr(
                              +fireOrder?.data?.cartTotals?.creditTotal
                            )} of ${isCurr(+discount.initialAmount)}.`}</div>
                          </div>
                        </div>
                      ))}
                    <TotalsRow
                      label={"Subtotal"}
                      variant={false}
                      value={
                        Boolean(
                          fireOrder?.data?.taxableSubtotal <
                          fireOrder?.data?.subtotal
                        ) ? (
                          <>
                            <span>
                              {fireOrder?.data?.taxableSubtotal.toLocaleString(
                                "en-US",
                                {
                                  style: "currency",
                                  currency: "USD",
                                }
                              )}
                            </span>
                            {`${String.fromCharCode(160)}`}
                            <Strike>
                              {fireOrder?.data?.subtotal.toLocaleString(
                                "en-US",
                                {
                                  style: "currency",
                                  currency: "USD",
                                }
                              )}
                            </Strike>
                          </>
                        ) : (
                          <span>
                            {fireOrder?.data?.subtotal
                              ? fireOrder?.data?.subtotal.toLocaleString(
                                "en-US",
                                {
                                  style: "currency",
                                  currency: "USD",
                                }
                              )
                              : `$0.00`}
                          </span>
                        )
                      }
                    />
                    {Boolean(fireOrder?.data?.deliveryFee) && (
                      <TotalsRow
                        variant={null}
                        label={"Delivery Fee"}
                        value={
                          Boolean(
                            fireOrder?.data?.deliveryTotal <
                            fireOrder?.data?.deliveryFee
                          ) ? (
                            <>
                              <span>
                                {fireOrder?.data?.deliveryTotal.toLocaleString(
                                  "en-US",
                                  {
                                    style: "currency",
                                    currency: "USD",
                                  }
                                )}
                              </span>
                              {`${String.fromCharCode(160)}`}
                              <Strike>
                                {fireOrder?.data?.deliveryFee.toLocaleString(
                                  "en-US",
                                  {
                                    style: "currency",
                                    currency: "USD",
                                  }
                                )}
                              </Strike>
                            </>
                          ) : (
                            <span>
                              {fireOrder?.data?.deliveryFee
                                ? fireOrder?.data?.deliveryFee.toLocaleString(
                                  "en-US",
                                  {
                                    style: "currency",
                                    currency: "USD",
                                  }
                                )
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
                          Boolean(
                            fireOrder?.data?.serviceFeeTotal <
                            fireOrder?.data?.serviceFee
                          ) ? (
                            <>
                              <span>
                                {fireOrder?.data?.serviceFeeTotal.toLocaleString(
                                  "en-US",
                                  {
                                    style: "currency",
                                    currency: "USD",
                                  }
                                )}
                              </span>
                              <span>
                                {`${String.fromCharCode(160)}`}
                                <Strike>
                                  {fireOrder?.data?.serviceFee.toLocaleString(
                                    "en-US",
                                    {
                                      style: "currency",
                                      currency: "USD",
                                    }
                                  )}
                                </Strike>
                              </span>
                            </>
                          ) : (
                            <span>
                              {fireOrder?.data?.serviceFee
                                ? fireOrder?.data?.serviceFee.toLocaleString(
                                  "en-US",
                                  {
                                    style: "currency",
                                    currency: "USD",
                                  }
                                )
                                : `$0.00`}
                            </span>
                          )
                        }
                      />
                    )}
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
                  </>
                  {/* <div className="cart-margin">
                {
                  <TotalsRow
                    label={"Grand Total"}
                    variant="total"
                    value={
                      Boolean(fireOrder?.data.cartTotals.grandTotal)
                        ? fireOrder?.data.cartTotals.grandTotal.toLocaleString(
                          "en-US",
                          {
                            style: "currency",
                            currency: "USD",
                          }
                        )
                        : "$0.00"
                    }
                  />
                }

                {Boolean(fireOrder?.data?.cartTotals?.totalSaved) && (
                  <TotalsRow
                    variant={"red"}
                    label={"Customer saved"}
                    value={`${fireOrder?.data?.cartTotals?.totalSaved.toLocaleString(
                      "en-US",
                      {
                        style: "currency",
                        currency: "USD",
                      }
                    )}`}
                  />
                )}
              </div> */}
                </Panel>
              </StatelessAccordion>

              <div style={{ width: "100%", height: "200px" }} />
            </>
          ) : (
            <div className="nav-loader info-width">
              <Spinner />
            </div>
          )}
        </InfoBackground>
      </InfoPane>
      {!["paid", "cancel"].includes(fireOrder.data?.progress) &&
        !(
          ["complete"].includes(fireOrder.data?.progress) &&
          ["driver"].includes(`${fireUser?.data?.role}`)
        ) && (
          <ProgressFooter>
            {Boolean(fireOrder.status === "success") &&
              Boolean(fireOrder.data?.progress) ? (
              // <SlideButton
              //   disabled={
              //     disabled ||
              //     loading ||
              //     !Boolean(form?.driver) ||
              //     !Boolean(fireCustomer?.data)
              //   }
              //   text={
              //     ["driver"].includes(`${fireUser?.data?.role}`)
              //       ? progressButtonDriver[fireOrder.data?.progress]
              //       : progressButton[fireOrder.data?.progress]
              //   }
              //   onUnlock={handleUpdate}
              // />
              <Button
              isLoading={loading}
              onClick={handleUpdate}
              size={SIZE.large}
                disabled={
                  disabled ||
                  loading ||
                  !Boolean(form?.driver) ||
                  !Boolean(fireCustomer?.data)
                }
                overrides={{
                  BaseButton: {
                    style: ({ $theme }) => ({
                      width: "100%",
                      marginBottom: "16px"
                    }),
                  },
                }}
              >
                   {["driver"].includes(`${fireUser?.data?.role}`)
                     ? progressButtonDriver[fireOrder.data?.progress]
                     : progressButton[fireOrder.data?.progress]}
              
              </Button>
            ) : (
              <Spinner />
            )}
          </ProgressFooter>
        )}
    </SplitWindow>
  );
};

export default SelectedOrder;

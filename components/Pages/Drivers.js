import SVGIcon from "../../components/SVGIcon"
import MarkerSVG from "../../components/MapBox/MarkerSVG"
import React, {
  useEffect,
  useState,
  useCallback,
  createRef,
} from "react"
import { useUser } from "../../context/userContext"
import ReactMapGL, {
  Marker,
  Popup,
  NavigationControl,
  FlyToInterpolator,
  FullscreenControl,
  WebMercatorViewport,
} from "react-map-gl"
import Grow from "../../components/Transitions/Grow"
import Fade from "../../components/Transitions/Fade"
import { getReverseGeocode, triggerSync } from "../../firebase/clientApp"
import * as d3 from "d3-ease"
import { useWindowSize } from "../../hooks/useWindowSize"
import colorObject from "../../styles/colorObject"
import Spinner from "../../components/Buttons/Spinner"
import {
  TOKEN,
  delay,
  convertTimestamp,
  injectURL,
  drivingObject,
  drivingIconObject,
  defaultOrders,
  orderProgressObject,
  getMapSize,
  isEmpty,
  setPercent
} from "../../helpers"
import { useVehicle } from "../../context/vehicleContext"
import { points } from "@turf/helpers"
import center from "@turf/center"
import bbox from "@turf/bbox"
import {
  SplitWindow,
  InfoPane,
} from "../Split"
import styles from "./Drivers.module.scss"

const _styles = {
  transitionContainer: {
    paddingTop: "2px",
    paddingRight: "5px",
    paddingBottom: "5px",
    paddingLeft: "5px",
    width: "100%",
    transform: "translateX(-5px)",
  },
}
const FetchAddress = () => {
  const { selected } = useVehicle()
  const [address, setAddress] = useState(null)

  const getAddress = useCallback(
    async (point) => {
      const { data } = await getReverseGeocode(point)
      if (data.status === "OK") {
        const frmt = data.results[0].formatted_address
        setAddress(frmt)
      }
    },
    [selected]
  )
  useEffect(() => {
    if (Boolean(selected)) {
      const { point } = selected.vehicle.vehicle_location
      getAddress(point)
    }
  }, [selected])
  return address || "Loading..."
}
const DriverItem = ({ driver, color = "#00c1de" }) => {
  const {
    selected,
    setSelected,
    orders,
    filter,
    setFilter,
    view,
    setView,
  } = useVehicle()

  const { vehicle, displayName } = driver
  const {
    vehicle_location,
    make_name,
    model_name,
    model_year,
    image_url,
  } = vehicle
  const { motion_status, speed_mph, timestamp } = vehicle_location

  return (
    <div
      role='button'
      onClick={() => (
        setSelected(!selected ? driver : null),
        setView((v) => ({ ...v, ...{ zoom: 14 } }))
      )}
      className='driver-list-item'>
      <div className='driver-list-item-content'>
        <div
          className='q-mr-sm border text-center'
          style={{
            height: 47,
            width: 47,
            borderColor: colorObject[motion_status],
          }}>
          <div
            role='img'
            className='image q-img overflow-hidden'
            style={{ width: 39, height: 39 }}>
            <div style={{ paddingBottom: "100%" }} />
            <div
              className='q-img__image absolute-full'
              style={{
                backgroundSize: "cover",
                backgroundPosition: "50% 50%",
                backgroundImage: `url(${injectURL({ image_url })})`,
              }}
            />
            <div className='q-img__content absolute-full' />
          </div>
        </div>
        {/**/}
        {/**/}
        <div className='col mt-med'>
          <div
            aria-hidden={Boolean(selected) ? "true" : "false"}
            role='presentation'
            className='material-icons q-icon notranslate text-grey-7 expand-icon'
            style={{ fontSize: 22 }}>
            <SVGIcon
              style={{
                transform: `rotate(${Boolean(selected) ? 90 : 0}deg)`,
                transition: "transform 0.2s ease-out",
              }}
              color={color}
              name={"arrowDownSmall"}
            />
          </div>
          <strong data-t='nickname' className='nickname row justify-start'>
            <div className='column'>
              <span>{displayName}</span>
              <div className='text-caption text-grey-7'>
                <span>{`${model_year} ${make_name} ${model_name}`}</span>
              </div>
            </div>
          </strong>
          <div id='details' className='text-grey-9 q-my-xs'>
            {/**/}
            {convertTimestamp({ timestamp })}
            <Grow
              in={Boolean(selected)}
              axis='y'
              style={_styles.transitionContainer}
              offset={30}>
              <Fade in={Boolean(selected)} transitionTime={200}>
                <div>
                  <div className='details q-mt-xs'>
                    {speed_mph === 0 ? "Stopped" : drivingObject[motion_status]}
                    {speed_mph > 0 && (
                      <span>
                        {`(${speed_mph} mph)`}
                        <br />
                      </span>
                    )}
                    {/* {speed_mph === 0 && (
                      <span>
                        {`Stopped`}
                        <br />
                      </span>
                    )} */}
                    <div className='text-cursor'>
                      <div className='row no-wrap'>
                        <span>
                          <FetchAddress />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='q-mt-sm q-mr-sm q-pb-sm q-mb-xs quick-stats-border'>
                    <div className='row' style={{ margin: "0 12px" }}>
                      <div className='col row items-center'>
                        <button
                          onClick={(e) => (
                            e.stopPropagation(),
                            setFilter(filter === "active" ? "none" : "active")
                          )}
                          className='button-base svg-wrapper'>
                          <SVGIcon
                            className={"mr-xs"}
                            color={"rgb(0, 193, 222)"}
                            name={filter === "active" ? "bagFilled" : "bag"}
                          />
                        </button>
                        <span style={{ color: "rgb(0, 193, 222)" }}>
                          {orders?.active}
                        </span>
                      </div>
                      <div
                        data-t='batteryVolts'
                        className='col row items-center'>
                        <button
                          onClick={(e) => (
                            e.stopPropagation(),
                            setFilter(
                              filter === "complete" ? "none" : "complete"
                            )
                          )}
                          className='button-base svg-wrapper'>
                          <SVGIcon
                            color={"#1a73e8"}
                            className={"mr-xs"}
                            name={
                              filter === "complete"
                                ? "orderReviewFilled"
                                : "orderReview"
                            }
                          />
                        </button>
                        <span style={{ color: "#1a73e8" }}>
                          {orders?.complete}
                        </span>
                      </div>
                      <div className='col-auto row items-center relative'>
                        <button
                          onClick={(e) => (
                            e.stopPropagation(),
                            setFilter(filter === "cancel" ? "none" : "cancel")
                          )}
                          className='button-base svg-wrapper'>
                          <SVGIcon
                            color={"rgb(230, 0, 61)"}
                            className={"mr-xs"}
                            name={
                              filter === "cancel" ? "xCircleFilled" : "xCircle"
                            }
                          />
                        </button>
                        <span style={{ color: "rgb(230, 0, 61)" }}>
                          {orders?.cancel}
                        </span>
                        {/**/}
                      </div>
                    </div>
                  </div>
                </div>
              </Fade>
            </Grow>
          </div>
        </div>
      </div>
    </div>
  )
}
const DriverList = () => {
  const { fireOrders, fireDrivers } = useUser()
  const { data, status, error } = fireDrivers

  switch (status) {
    case "idle":
      return <span className='load-box'>Loading Account...</span>
    case "loading":
      return <span className='load-box'>Loading Drivers...</span>
    case "success":
      const list = []
      for (const key in data) {
        const driver = data[key]
        const props = { driver }
        list.push(<DriverItem key={key} {...props} />)
      }
      return list
    case "error":
      return <span className='load-box'>{`Error: ${error.message}`}</span>
    default:
      return <span className='load-box'>{`Error.`}</span>
  }
}
const MapMarkers = () => {
  const { fireOrders, fireDrivers } = useUser()

  const {
    selected,
    setSelected,
    orders,
    filter,
    setFilter,
    setBounds,
  } = useVehicle()
  const [markers, setMarkers] = useState([])

  useEffect(() => {
    const marker = []
    const boundaries = []

    console.log(fireOrders)
    console.log("fireOrders")


    if (Boolean(selected?.uid)) {
        const { uid } = selected
      // add selected orders markers and marker bounds
      if (fireOrders.status === "success" && fireOrders.data) {
        const { data } = fireOrders
        
        for (const key in data) {
          const did = data[key]?.driver

          //if active order progress includes active order array
          if (did === uid) {
            if (orderProgressObject[filter].includes(data[key]?.progress)) {
              const props = {
                color: colorObject[data[key]?.progress],
                icon: drivingIconObject[data[key]?.progress],
              }
              boundaries.push(data[key]?.coordinates)
              marker.push(
                <Marker
                    key={key}
                  offsetLeft={-20}
                  offsetTop={-55}
                  latitude={data[key]?.coordinates[1]}
                  longitude={data[key]?.coordinates[0]}>
                  <MarkerSVG {...props} />
                </Marker>
              )
            }
          }
        }
      }
      // add selected driver marker and bounds
      console.log("SELCTED OBJECT")
      console.log(selected)
      const { vehicle, displayName } = selected
      const {
        point,
        motion_status,
        heading,
        speed_mph,
      } = vehicle.vehicle_location
      const { lat, lon } = point
      if (lat && lon) {
        const props = {
          heading,
          motion_status,
          color: colorObject[motion_status],
          icon: drivingIconObject[motion_status],
          speed_mph,
        }

        boundaries.push([lon, lat])
        marker.push(
          <Marker
            key={uid}
            offsetLeft={-20}
            offsetTop={-55}
            latitude={lat}
            longitude={lon}>
            <div onClick={() => setSelected(selected ? null : data[key])}>
              <MarkerSVG {...props} />
            </div>
            <div className='marker-name'>{displayName}</div>
          </Marker>
        )
      }
    } else {
      // not selected
      //add drivers and driver bounds
      if (fireDrivers?.status === "success" && fireDrivers?.data) {
        const { data, status, error } = fireDrivers
        for (const key in data) {
          const { vehicle, displayName } = data[key]
          const {
            point,
            motion_status,
            heading,
            speed_mph,
          } = vehicle.vehicle_location
          const { lat, lon } = point
          if (lat && lon) {
            const props = {
              heading,
              motion_status,
              color: colorObject[motion_status],
              icon: drivingIconObject[motion_status],
              speed_mph,
            }

            boundaries.push([lon, lat])
            marker.push(
              <Marker
              key={key}
                offsetLeft={-20}
                offsetTop={-55}
                latitude={lat}
                longitude={lon}>
                <div onClick={() => setSelected(selected ? null : data[key])}>
                  <MarkerSVG {...props} />
                </div>
                <div className='marker-name'>{displayName}</div>
              </Marker>
            )
          }
        }
      }
    }

    setBounds(boundaries)
    setMarkers(marker)
  }, [selected, filter, fireOrders, fireDrivers])

  return markers
}
const MapMarkersX = ({
    selectedOrder = {},
    selectedDriver = {},
    fireDrivers = {status:'idle', data:undefined, error:undefined},
    fireOrders = {status:'idle', data:undefined, error:undefined},
}) => {   
    const boundaries = [],
          components = [];

    if( !isEmpty(selectedOrder) ){
        //add Order Marker
        //add Order Bounds
        if(selectedOrder?.driver && fireDrivers?.data){
            //add Driver Marker
            //add Driver Bounds
        }
    }
    return;
  }
  

function Drivers() {
  const {
    selected,
    setSelected,
    setFilter,
    bounds,
    setOrders,
  } = useVehicle()


  const [view, setView] = useState({...{
    latitude: 34.103729,
    longitude: -118.328613,
    zoom: 9,
  }, ...getMapSize(width,height)})


  const [timer, setTimer] = useState("")
  const [percent, setPercent] = useState(0)
  const { width, height } = useWindowSize()
  const { user, fireOrders, fireDrivers, fireSettings } = useUser()
  const [timeOut, setTimeOut] = useState(false)


  const timeStringToFloat = (time) => {
    const hoursMinutes = time.split(/[.:]/)
    const hours = parseInt(hoursMinutes[0], 10)
    const minutes = hoursMinutes[1] ? parseInt(hoursMinutes[1], 10) : 0
    let remainingTime = parseFloat(hours + minutes / 60).toFixed(2)
    remainingTime = remainingTime * 20
    return remainingTime
  }

  const secondPassed = useCallback(() => {
    //const cur_date = new Date( Date.now() - 1000 * 60 );
    const cur_date = new Date()
    const minutes = cur_date.getMinutes()
    const seconds = cur_date.getSeconds()
    const time =
      4 - (minutes % 5) + ":" + (seconds >= 50 ? "0" : "") + (59 - seconds)
    const timePercent = timeStringToFloat(time)
    //console.log(time)
    //console.log(timePercent)
    setPercent(timePercent)
    setTimer(time)
  }, [])

  useEffect(() => {
    const run = setInterval(secondPassed, 5000)
    return () => clearInterval(run)
  }, [])

  const slowMode = async () => {
    await delay(60000)
    setTimeOut(false)
  }
  const refreshSelected = useCallback(() => {
    const { data, status, error } = fireDrivers
    if (status === "success") {
      if (Boolean(selected)) {
        for (const key in data) {
          const driver = data[key]
          if (selected.vehicle.nickname === driver.vehicle.nickname) {
            const selectedTimeStamp = new Date(
              selected.vehicle.vehicle_location.timestamp
            )
            const driverTimeStamp = new Date(
              driver.vehicle.vehicle_location.timestamp
            )
            if (selectedTimeStamp !== driverTimeStamp) {
              console.log("refresh selected driver")
              setSelected(driver)
            }
          }
        }
      }
    }
  }, [fireDrivers, selected])

  const setOrderTotals = useCallback(() => {
    const orderTotals = {
      active: 0,
      complete: 0,
      cancel: 0,
    }
    const { data, status, error } = fireOrders
    if (status === "success") {
      if (Boolean(selected)) {
        const { uid } = selected
        for (const key in data) {
          const { progress } = data[key]
          const did = data[key].driver
          if (did === uid) {
            if (orderProgressObject.active.includes(progress)) {
              orderTotals.active++
            } else if (orderProgressObject.complete.includes(progress)) {
              orderTotals.complete++
            } else if (orderProgressObject.cancel.includes(progress)) {
              orderTotals.cancel++
            }
          }
        }
      }
    }
    setOrders(orderTotals)
  }, [selected, fireOrders])


  /* FitBounds */
  const fitBounds = () => {
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
      tempView = { ...{...tempView}, ...{ longitude, latitude, zoom }}
    }
    setView({...{...tempView}, ...{transitionDuration:1000, transitionInterpolator:new FlyToInterpolator(), transitionEasing:d3.easeCubic}})
  }

  /* WatchBounds */
  useEffect(() => {
    fitBounds()
  }, [bounds, width])

  useEffect(() => {
   // refreshSelected()
  }, [selected])

  useEffect(() => {
    setOrderTotals()
  }, [selected, fireOrders])

  useEffect(() => {
    !selected && setFilter("active")
  }, [selected])

  useEffect(() => {
    timeOut && slowMode()
  }, [timeOut])

  /* SET MAP HEIGHT AND WIDTH */
  useEffect(() => {
    if (Boolean(height) && Boolean(width)) {
      setView({ ...{...view}, ...getMapSize(width,height) })
    }
  }, [width, height])


  return (
    <SplitWindow>
      <InfoPane
        noDrawer={true}
        mapComponent={
          fireOrders?.data &&
          fireDrivers?.data &&
          fireSettings?.data &&
          user?.uid ? (
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
                  {/* <MapPopup {...{ fireOrder }} />*/}
                  <MapMarkers />
                </ReactMapGL>
              </div>
          ) : (
            <div className='nav-loader map-width'>
              <Spinner />
            </div>
          )
        }
        {...{ fireOrders, fireDrivers, fireSettings, user }}>
        <div className='driver-form'>
          {fireOrders?.data &&
          fireDrivers?.data &&
          fireSettings?.data &&
          user?.uid ? (
            <>
              <DriverList />
            </>
          ) : (
            <div className='nav-loader info-width'>
              <Spinner />
            </div>
          )}
        </div>
      </InfoPane>
    </SplitWindow>
  )
}
export default Drivers




        //   {/* Info Container */}

        //   <header className='info-header'>
        //     <div className='info-map-header-btn-container'>
        //       <Link
        //         href={`${pathname}?menu`}
        //         as={`${asPath}?menu`}
        //         scroll={false}>
        //         <button className='button-base info-header-button left'>
        //           <div className='svg-wrapper'>
        //             <SVGIcon
        //               className={'i5-scale'}
        //               //color={progressColor}
        //               name={'menu'}
        //             />
        //           </div>
        //         </button>
        //       </Link>
        //     </div>
        //     <div className='info-header-title'>Drivers</div>
        //     <div className='info-map-header-btn-container' />
        //   </header>

        //   <div
        //     ref={ipadScrollRef}
        //     id='ipad-scroll-container'
        //     className='info-container'>
        //     <div className='info-list'>
        //       <DriverList />
        //     </div>
        //   </div>
        //   {/* Map Container */}
        //   <div className='map-container'>
        //     <header className='map-header'>
        //       <div className='info-map-header-btn-container'>
        //         <Link
        //           href={`${pathname}?menu`}
        //           as={`${asPath}?menu`}
        //           scroll={false}>
        //           <button className='button-base info-header-button left'>
        //             <div className='svg-wrapper'>
        //               <SVGIcon
        //                 className={'i5-scale'}
        //                 //color={progressColor}
        //                 name={'menu'}
        //               />
        //             </div>
        //           </button>
        //         </Link>
        //       </div>
        //       <div className='map-header-title'>Drivers</div>
        //       <div className='info-map-header-btn-container' />
        //     </header>
        //     <div className='css-17taute eeu551e0'>
        //       <div className='css-5sdfw9 eeu551e1'>
        //           {/* MAP HERE */}
        //           <ReactMapGL
        //             mapStyle='mapbox://styles/mapbox/streets-v9'
        //             mapboxApiAccessToken={TOKEN}
        //             onViewportChange={setView}
        //             transitionDuration={1000}
        //             transitionInterpolator={new FlyToInterpolator()}
        //             transitionEasing={d3.easeCubic}
        //             //fitBounds
        //             {...view}>
        //             {/* <progress
        //               className='progress-bar'
        //               value={percent}
        //               max='100'></progress> */}

        //             <div className="progress-bar-simple">
        //               <span className="progress-bar-fill" style={{width: `${percent}%`}} />
        //             </div>

        //             <div className='map-button-refresh'>
        //               <div className='mapboxgl-ctrl mapboxgl-ctrl-group '>
        //                 <button
        //                   disabled={timeOut}
        //                   onClick={() => (setTimeOut(true), triggerSync())}
        //                   className='mapboxgl-ctrl-icon mapboxgl-ctrl-fullscreen'
        //                   type='button'
        //                   title='Toggle fullscreen'>
        //                   <div className='svg-wrapper'>
        //                     <svg
        //                       xmlns='http://www.w3.org/2000/svg'
        //                       enable-background='new 0 0 24 24'
        //                       viewBox='0 0 24 24'
        //                       fill='black'
        //                       width='24px'
        //                       height='24px'>
        //                       <g>
        //                         <rect
        //                           fill='none'
        //                           height='24'
        //                           width='24'
        //                           x='0'
        //                         />
        //                       </g>
        //                       <g>
        //                         <g>
        //                           <g>
        //                             <path d='M21,10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-0.1c-2.73,2.71-2.73,7.08,0,9.79s7.15,2.71,9.88,0 C18.32,15.65,19,14.08,19,12.1h2c0,1.98-0.88,4.55-2.64,6.29c-3.51,3.48-9.21,3.48-12.72,0c-3.5-3.47-3.53-9.11-0.02-12.58 s9.14-3.47,12.65,0L21,3V10.12z M12.5,8v4.25l3.5,2.08l-0.72,1.21L11,13V8H12.5z' />
        //                           </g>
        //                         </g>
        //                       </g>
        //                     </svg>
        //                   </div>
        //                 </button>
        //               </div>
        //             </div>
        //             <div className='map-button-zoom'>
        //               <NavigationControl />
        //             </div>
        //             <div className='map-button-fullscreen'>
        //               <FullscreenControl />
        //             </div>
        //             <div className='map-button-fit'>
        //               <div className='mapboxgl-ctrl mapboxgl-ctrl-group '>
        //                 <button
        //                   onClick={() => fitBounds({zoom: 14})}
        //                   className='mapboxgl-ctrl-icon mapboxgl-ctrl-fullscreen'
        //                   type='button'
        //                   title='Toggle fullscreen'>
        //                   <div className='svg-wrapper'>
        //                     <svg
        //                       xmlns='http://www.w3.org/2000/svg'
        //                       xmlnsXlink='http://www.w3.org/1999/xlink'
        //                       width={29}
        //                       height={29}>
        //                       <defs>
        //                         <path
        //                           d='M4.46 4.55h14.37v14.37H4.46V4.55z'
        //                           id='a'
        //                         />
        //                         <path
        //                           d='M1.81 3.85h16.78v16.77H1.81V3.85z'
        //                           id='b'
        //                         />
        //                         <path
        //                           d='M9.39 9.49h6.91v6.9H9.39v-6.9z'
        //                           id='c'
        //                         />
        //                         <path
        //                           d='M17.79 9.71h-6.58c-.39 0-.72.25-.85.61-.08.24-.5 1.43-1.24 3.58v4.79c0 .33.27.6.6.6h.59c.33 0 .6-.27.6-.6v-.6h7.18v.6c0 .33.27.6.6.6h.59c.33 0 .6-.27.6-.6V13.9l-1.24-3.58c-.3-.41-.59-.61-.85-.61zm-7.48 5.69c0-.5.4-.9.9-.9a.896.896 0 110 1.79c-.5 0-.9-.4-.9-.89zm6.58 0c0-.5.4-.9.9-.9a.896.896 0 110 1.79c-.5 0-.9-.4-.9-.89zm-5.68-4.79h6.58l.9 2.69h-8.38l.9-2.69z'
        //                           id='d'
        //                         />
        //                         <path
        //                           d='M5.94 4.55c.25 0 .45.2.45.45v7.19c0 .25-.2.45-.45.45H4.91c-.25 0-.45-.2-.45-.45V5c0-.25.2-.45.45-.45h1.03z'
        //                           id='e'
        //                         />
        //                         <path
        //                           d='M12.55 6.03c0 .25-.2.45-.45.45H4.91c-.25 0-.45-.2-.45-.45V5c0-.25.2-.45.45-.45h7.19c.25 0 .45.2.45.45v1.03z'
        //                           id='f'
        //                         />
        //                         <path
        //                           d='M24.73 6.03c0 .25-.2.45-.45.45h-7.19c-.25 0-.45-.2-.45-.45V5c0-.25.2-.45.45-.45h7.19c.25 0 .45.2.45.45v1.03z'
        //                           id='g'
        //                         />
        //                         <path
        //                           d='M24.4 4.55c.25 0 .45.2.45.45v7.19c0 .25-.2.45-.45.45h-1.03c-.25 0-.45-.2-.45-.45V5c0-.25.2-.45.45-.45h1.03z'
        //                           id='h'
        //                         />
        //                         <path
        //                           d='M24.28 16.73c.25 0 .45.2.45.45v7.19c0 .25-.2.45-.45.45h-1.03c-.25 0-.45-.2-.45-.45v-7.19c0-.25.2-.45.45-.45h1.03z'
        //                           id='i'
        //                         />
        //                         <path
        //                           d='M24.73 24.37c0 .25-.2.45-.45.45h-7.19c-.25 0-.45-.2-.45-.45v-1.03c0-.25.2-.45.45-.45h7.19c.25 0 .45.2.45.45v1.03z'
        //                           id='j'
        //                         />
        //                         <path
        //                           d='M12.55 24.37c0 .25-.2.45-.45.45H4.91c-.25 0-.45-.2-.45-.45v-1.03c0-.25.2-.45.45-.45h7.19c.25 0 .45.2.45.45v1.03z'
        //                           id='k'
        //                         />
        //                         <path
        //                           d='M5.94 16.73c.25 0 .45.2.45.45v7.19c0 .25-.2.45-.45.45H4.91c-.25 0-.45-.2-.45-.45v-7.19c0-.25.2-.45.45-.45h1.03z'
        //                           id='l'
        //                         />
        //                       </defs>
        //                       <use xlinkHref='#a' fillOpacity={0} />
        //                       <use
        //                         xlinkHref='#a'
        //                         fillOpacity={0}
        //                         stroke='#000'
        //                         strokeOpacity={0}
        //                       />
        //                       <use xlinkHref='#b' fillOpacity={0} />
        //                       <use
        //                         xlinkHref='#b'
        //                         fillOpacity={0}
        //                         stroke='#000'
        //                         strokeOpacity={0}
        //                       />
        //                       <use xlinkHref='#c' fillOpacity={0} />
        //                       <use
        //                         xlinkHref='#c'
        //                         fillOpacity={0}
        //                         stroke='#000'
        //                         strokeOpacity={0}
        //                       />
        //                       <use xlinkHref='#d' fill='#333' />
        //                       <use
        //                         xlinkHref='#d'
        //                         fillOpacity={0}
        //                         stroke='#000'
        //                         strokeOpacity={0}
        //                       />
        //                       <use xlinkHref='#e' fill='#333' />
        //                       <use xlinkHref='#f' fill='#333' />
        //                       <use xlinkHref='#g' fill='#333' />
        //                       <use xlinkHref='#h' fill='#333' />
        //                       <g>
        //                         <use xlinkHref='#i' fill='#333' />
        //                       </g>
        //                       <g>
        //                         <use xlinkHref='#j' fill='#333' />
        //                       </g>
        //                       <g>
        //                         <use xlinkHref='#k' fill='#333' />
        //                       </g>
        //                       <g>
        //                         <use xlinkHref='#l' fill='#333' />
        //                       </g>
        //                     </svg>
        //                   </div>
        //                 </button>
        //               </div>
        //             </div>
        //             {/* {selected && <MapPopup fireOrder={selected} /> } */}
        //             {/* <DriverMarkers fireDrivers={fireDrivers} />
        //             <OrderMarkers /> */}
        //             <MapMarkers  />
        //             {/* <MapPopup /> */}
        //           </ReactMapGL>

        //       </div>
        //     </div>
        //   </div>
   
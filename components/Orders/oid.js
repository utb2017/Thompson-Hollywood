import Link from 'next/link'
import SVGIcon from '../../../../components/SVGIcon'
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  createRef,
  createContext,
  useContext,
  useMemo,
} from 'react'
import {useUser} from '../../../../context/userContext'
import ReactMapGL, {
  Marker,
  Popup,
  FlyToInterpolator,
  WebMercatorViewport,
} from 'react-map-gl'
import CartItem from '../../../../components/CartItem'
import CartItemSkeleton from '../../../../components/CartItemSkeleton'
import firebase, {updateFirestore, getMatrix} from '../../../../firebase/clientApp'
import {useRouter} from 'next/router'
import {useFirestoreQuery} from '../../../../hooks/useFirestoreQuery'
import ProgressBar from '../../../../components/ProgressBar'
//import OrderMenu from '../../../../components/OrderMenu'
import OrderMenu from '../../../../components/Console/OrderMenu'
import ConsoleLayout from '../../../../layouts/ConsoleLayout'
import Select from '../../../../components/Forms/Select'
import MenuItem from '../../../../components/Menus/MenuItem'
import {useWindowSize} from '../../../../hooks/useWindowSize'
import MarkerSVG from '../../../../components/MapBox/MarkerSVG'
import {
  disableBodyScroll,
  clearAllBodyScrollLocks,
  enableBodyScroll,
} from 'body-scroll-lock'
import * as d3 from 'd3-ease'
import FitBoundsSVG from '../../../../assets/FitBounds'
import {defaultTheme} from '../../../../styles/themer/utils'
import {useOrder} from '../../../../context/orderContext'


import {
  TOKEN,
  defaultMap,
  capitalize,
  colorObject,
  orderProgressObject,
  PROGRESS,
  drivingIconObject,
  progressPercent,
  drivingObject
} from '../../../../helpers'



Date.prototype.addHours = function (h) {
  this.setTime(this.getTime() + h * 60 * 60 * 1000)
  return this
}





const CancelSVG = ({color = 'black', data}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill={colorObject[data.progress]}
      width='24px'
      height='24px'>
      <path d='M0 0h24v24H0V0z' fill='none' />
      <path d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z' />
    </svg>
  )
}
const PrioritySVG = ({color = 'black', data}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      //fill='black'
      fill={colorObject[data.progress]}
      height='24px'>
      <path d='M0 0h24v24H0V0z' fill='none' />
      <circle cx={12} cy={19} r={2} />
      <path d='M10 3h4v12h-4z' />
    </svg>
  )
}
const BagSVG = ({color = 'black', data}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      enableBackground='new 0 0 24 24'
      viewBox='0 0 24 24'
      fill={colorObject[data.progress]}
      width='24px'
      height='24px'>
      <g>
        <rect fill='none' height={24} width={24} />
        <path d='M18,6h-2c0-2.21-1.79-4-4-4S8,3.79,8,6H6C4.9,6,4,6.9,4,8v12c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V8C20,6.9,19.1,6,18,6z M12,4c1.1,0,2,0.9,2,2h-4C10,4.9,10.9,4,12,4z M18,20H6V8h2v2c0,0.55,0.45,1,1,1s1-0.45,1-1V8h4v2c0,0.55,0.45,1,1,1s1-0.45,1-1V8 h2V20z' />
      </g>
    </svg>
  )
}
const MarkerOrder = ({
  color = 'rgb(0,200,5)',
  heading = null,
  motion_status = 'stale',
  speed_mph,
  icon,
  num,
  data,
}) => {
  return (
    <>
      <svg
        name='CenterPin'
        width='54px'
        height='87px'
        viewBox='0 0 54 87'
        version='1.1'
        xmlnsXlink='http://www.w3.org/1999/xlink'
        //style={{height: '55px', width: '40px', transition: 'all 200ms ease'}}
        style={{
          height: '70px',
          width: '42px',
          transition: 'all 200ms ease',
          zIndex: 200,
        }}>
        <g
          transform='translate(0.0, 0.0)'
          stroke='none'
          strokeWidth={1}
          fill='none'
          fillRule='evenodd'>
          <path
            d='M51.3 38.901c1.736-3.571 2.7-7.626 2.7-11.873C54 12.066 41.946 0 27 0S0 12.066 0 27.028c0 4.247.964 8.205 2.796 11.873l.29.58c.193.386.385.675.578.965.772 1.351 1.736 3.185 2.218 3.957 2.604 4.055 5.69 7.267 7.618 10.453C16.2 59.2 20.636 68.37 22.468 73.1 23.818 76.478 27 87 27 87s3.279-10.425 4.532-13.9c1.832-4.73 6.268-13.997 8.968-18.244 2.025-3.186 5.014-6.398 7.618-10.453a59.148 59.148 0 0 0 2.218-3.957c.193-.29.385-.676.578-.966.29-.386.386-.579.386-.579z'
            fill={colorObject[data.progress]}
            fillRule='nonzero'
            shapeRendering='optimizeQuality'
          />
          <circle fill='#FFF' cx={27} cy={27} r={22} />
        </g>
      </svg>
      <div className={'marker-icon-order'}>{icon}</div>
    </>
  )
}
const secondsToHms = (seconds) => {
  if (!seconds) return ''

  let duration = seconds
  let hours = duration / 3600
  duration = duration % 3600

  let min = parseInt(duration / 60)
  duration = duration % 60

  let sec = parseInt(duration)

  if (sec < 10) {
    sec = `0${sec}`
  }
  if (min < 10) {
    min = `0${min}`
  }

  if (parseInt(hours, 10) > 0) {
    return `${parseInt(hours, 10)}h ${min}m`
  } else if (min == 0) {
    return `${sec}s`
  } else {
    return `${min}m`
  }
}
const DriverPopUp = ({
  lat,
  lon,
  motion_status,
  speed_mph,
  displayName,
  make_name,
  model_name,
  model_year,
}) => {
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
  } = useOrder()
  return (
    <Popup
      // key={key}
      latitude={lat}
      longitude={lon}
      closeButton={true}
      closeOnClick={false}
      offsetTop={-55}
      tipSize={10}
      closeButton={false}
      //onClose={() => setSelected(null)}
      anchor='bottom'>
      <div className='roboto-medium'>
        <div className='nickname text-weight-regular block q-mr-lg'>{displayName}</div>
        <div className='text-weight-regular text-caption text-grey-7 q-mr-lg'>
          {`${model_year} ${make_name} ${model_name}`}
        </div>
        <div className='location-details text-grey-9'>
          {drivingObject[motion_status]}
          {speed_mph && (
            <span>
              {`(${speed_mph} mph)`}
              <br />
            </span>
          )}
          {/* <div className='row no-wrap'>
            <span>{`Stops: ${stops}`}</span>
          </div>
          <div className='row no-wrap'>
            <span>{`Time: ${distanceTime}`}</span>
          </div> */}
        </div>
      </div>
    </Popup>
  )
}
const OrderPopUp = ({data}) => {
  const {coordinates, address} = data.location
  const {progress} = data
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
  } = useOrder()
  return (
    <Popup
      // key={key}
      latitude={coordinates[1]}
      longitude={coordinates[0]}
      closeButton={true}
      closeOnClick={false}
      offsetTop={-70}
      tipSize={10}
      closeButton={false}
      //onClose={() => setSelected(null)}
      anchor='bottom'>
      <div className='roboto-medium'>
        <div className='nickname text-weight-regular block q-mr-lg'>
          {address.split(',')[0]}
        </div>
        <div className='location-details text-grey-9'>
          <div className='row no-wrap'>
            <span>{`Progress: `}</span>
            <span style={{color: colorObject[progress]}}>{capitalize(progress)}</span>
          </div>
          <div className='row no-wrap'>
            <span>{`Stops: ${stops}`}</span>
          </div>
          <div className='row no-wrap'>
            <span>{`Time: ${distanceTime}`}</span>
          </div>
        </div>
      </div>
    </Popup>
  )
}
const MapPopup = ({fireOrder}) => {
  const {
    selectedDriver,
    setMatrix,
    setStops,
  } = useOrder()
  const {fireDrivers, fireOrders} = useUser()
  const [popup, setPopup] = useState([])

  useEffect(() => {
    let stop = 0
    const origins = []
    // origins driver coords and list the rest of the stops
    const destinations = []
    //destinations all the stops then this order location
    //const destinations = ['New York NY', '41.8337329,-87.7321554'];
    const pop = []
    ///push selected driver pop up
    if (
      fireOrder.status === 'success' &&
      orderProgressObject.active.includes(fireOrder.data.progress)
    ) {
      if (selectedDriver && fireDrivers.status === 'success') {
        //{value: "jOnVtqr6NSOX8AIGWORTlCVm3ls2", label: "Dylan Best"}
        // clcle through drivers and find this one by uid
        // make a marker with his coordinates and add them to the boundaries
        const {data, status, error} = fireDrivers
        for (const key in data) {
          const {uid, displayName} = data[key]
          if (selectedDriver?.value === uid) {
            const {lat, lon} = data[key]?.vehicle.vehicle_location.point
            const {make_name, model_name, model_year} = data[key]?.vehicle
            const {motion_status, speed_mph} = data[key]?.vehicle.vehicle_location
            if (lat && lon) {
              //push driver origin
              origins.push(`${lat},${lon}`)
              pop.push(
                <DriverPopUp
                  {...{
                    lat,
                    lon,
                    motion_status,
                    speed_mph,
                    displayName,
                    key,
                    make_name,
                    model_name,
                    model_year,
                  }}
                />
              )
            }
          }
        }
      }

      if (fireOrder.status === 'success') {
        const {data, status, error} = fireOrder
        if (data?.coordinates) {
          pop.push(<OrderPopUp {...{data}} />)
        }
      }

      if (
        selectedDriver &&
        fireOrders.status === 'success' &&
        fireOrder.status === 'success'
      ) {
        //orderProgressObject.active
        //selectedDriver.value
        // cycle through orders and get all ACTIVE orders for this driver
        const aid = fireOrder.data.id
        const sid = selectedDriver.value
        const {data, status, error} = fireOrders
        const selectedTimestamp = new Date(fireOrder.data?.start.toDate())
        console.log('selected order timestamp')
        console.log(selectedTimestamp)

        for (const key in data) {
          const {driver, location, progress, id} = data[key]
          const did = data[key].driver?.id
          const uid = selectedDriver.value
          const {coordinates} = location

          //if active order progress includes active order array
          if (sid === did && id !== aid) {
            if (orderProgressObject.active.includes(progress)) {
              /// this orders timespamp
              /// slected order timestamp
              console.log('other orders timeSTamp')
              const otherOrderTimestamp = new Date(data[key]?.start.toDate())
              console.log(otherOrderTimestamp)
              if (otherOrderTimestamp < selectedTimestamp) {
                console.log('other order less then selected')

                origins.push(`${coordinates[1]},${coordinates[0]}`)
                destinations.push(`${coordinates[1]},${coordinates[0]}`)
                stop++
              } else if (otherOrderTimestamp > selectedTimestamp) {
                console.log('other order greater then selected')
              }
            }
          }
        }
        const {coordinates} = fireOrder.data?.location
        destinations.push(`${coordinates[1]},${coordinates[0]}`)
      }
    }

    //stopsRef.current = stop
    setStops(stop)
    setMatrix({origins, destinations})
    setPopup(pop)
  }, [fireDrivers, selectedDriver, fireOrders, fireOrder])

  return popup
}
const StopSVG = ({
  color = 'rgb(0,200,5)',
  heading = null,
  motion_status = 'stale',
  speed_mph,
  icon,
  stop,
}) => {
  // const {selected} = useVehicle()
  // let pinGrow = {transform: 'scale(1.5) translateY(-9px)'}
  // let iconGrow = {transform: 'scale(2) translateY(-11px)'}
  return (
    <>
      <svg
        name='CenterPin'
        width='54px'
        height='87px'
        viewBox='0 0 54 87'
        version='1.1'
        xmlnsXlink='http://www.w3.org/1999/xlink'
        style={{height: '55px', width: '40px', transition: 'all 200ms ease'}}>
        <g
          transform='translate(0.0, 0.0)'
          stroke='none'
          strokeWidth={1}
          fill='none'
          fillRule='evenodd'>
          <path
            d='M51.3 38.901c1.736-3.571 2.7-7.626 2.7-11.873C54 12.066 41.946 0 27 0S0 12.066 0 27.028c0 4.247.964 8.205 2.796 11.873l.29.58c.193.386.385.675.578.965.772 1.351 1.736 3.185 2.218 3.957 2.604 4.055 5.69 7.267 7.618 10.453C16.2 59.2 20.636 68.37 22.468 73.1 23.818 76.478 27 87 27 87s3.279-10.425 4.532-13.9c1.832-4.73 6.268-13.997 8.968-18.244 2.025-3.186 5.014-6.398 7.618-10.453a59.148 59.148 0 0 0 2.218-3.957c.193-.29.385-.676.578-.966.29-.386.386-.579.386-.579z'
            fill={color}
            fillRule='nonzero'
            shapeRendering='optimizeQuality'
          />
          <circle fill='#FFF' cx={27} cy={27} r={22} />
        </g>
      </svg>
      <div className={'markerTxt'}>
        <b style={{color}}>{`#${stop}`}</b>
      </div>
    </>
  )
}
const OrderMarkers = ({fireOrder}) => {
  const {fireDrivers, fireOrders} = useUser()
  const {selectedDriver, setBounds} = useOrder()
  const [markers, setMarkers] = useState([])

  useEffect(() => {
    const markers = []
    const boundaries = []

    if ( fireOrder.status === 'success' && orderProgressObject.active.includes(fireOrder.data.progress) ) {
      //push driver bounds
      if (selectedDriver && fireDrivers.status === 'success') {
        //{value: "jOnVtqr6NSOX8AIGWORTlCVm3ls2", label: "Dylan Best"}
        const {data, status, error} = fireDrivers
        for (const key in data) {
          const {uid} = data[key]
          if (selectedDriver.value === uid) {
            const {vehicle} = data[key]
            const {point, motion_status, heading, speed_mph} = vehicle.vehicle_location
            const {lat, lon} = point
            if (lat && lon) {
              const props = {
                heading,
                motion_status,
                color: colorObject[motion_status],
                icon: drivingIconObject[motion_status],
                speed_mph,
              }
              boundaries.push([lon, lat])
              markers.push(
                <Marker
                  key={key}
                  offsetLeft={-20}
                  offsetTop={-55}
                  latitude={lat}
                  longitude={lon}
                  //style={{zIndex:300}}
                  >
                  <MarkerSVG {...props} />
                </Marker>
              )
            }
          }
        }
      }


      //push stops bounds
      if ( selectedDriver && fireOrders.status === 'success' && fireOrder.status === 'success' ) {
        //orderProgressObject.active
        //selectedDriver.value
        // cycle through orders and get all ACTIVE orders for this driver
        // store to bounds and add a marker with a key

        const aid = fireOrder.data.id
        const sid = selectedDriver.value
        const selectedTimestamp = new Date(fireOrder.data?.start.toDate())

        const {data, status, error} = fireOrders
        let stop = 0
        for (const key in data) {
          const {driver, location, progress, id} = data[key]
          const did = data[key].driver?.id
          //const uid = selectedDriver.value
          const {coordinates} = location
          //if active order progress includes active order array
          //sid === did && id !== aid
          if (did === sid && id !== aid) {
            if (orderProgressObject.active.includes(progress)) {
              /// if order does not equal  the current one
              const otherOrderTimestamp = new Date(data[key]?.start.toDate())

              if (otherOrderTimestamp < selectedTimestamp) {
                console.log('other order less then selected')
                stop++
                const props = {
                  color: 'rgb(147, 96, 168)',
                  icon: 'bag',
                  stop,
                }
               boundaries.push([coordinates[0], coordinates[1]])
                markers.push(
                  <Marker
                    key={id}
                    offsetLeft={-20}
                    offsetTop={-55}
                    // width={'100%'}
                    // height={'100%'}
                    latitude={coordinates[1]}
                    longitude={coordinates[0]}
                    zoom={8}>
                    <div>
                      <StopSVG {...props} />
                      {/* <MarkerSVG {...props} />
                      <div className="marker-name">
                      {`Stop ${stop}`}
                      </div> */}
                    </div>
                  </Marker>
                )
              } else if (otherOrderTimestamp > selectedTimestamp) {
              }
            }
          }
        }
      }

    }



    // set this orders marker and add location bounds
    if (fireOrder.status === 'success') {
      const {data, status, error} = fireOrder
      const {coordinates, address} = data?.location
      const {progress} = data
      //[-118.3287023, 34.1037767]
      console.log('THIS ORDER BOUNDS')
      console.log(coordinates)
      ///console.log(data)
      boundaries.push(coordinates)
      markers.push(
        <Marker
          key={data.user.uid}
          offsetLeft={-21}
          offsetTop={-70}
          // width={'100%'}
          // height={'100%'}
          latitude={coordinates[1]}
          longitude={coordinates[0]}>
          <MarkerOrder
            icon={
              ['received', 'pending'].includes(progress) ? (
                <PrioritySVG {...{data}} />
              ) : ['cancel'].includes(progress) ? (
                <CancelSVG {...{data}} />
              ) : (
                <BagSVG {...{data}} />
              )
            }
            {...{data}}
          />
        </Marker>
      )
    }
    console.log("SETTING BOUNDS TOTAL")
    console.log(boundaries)
    setBounds(boundaries)
    setMarkers(markers)
  }, [selectedDriver, fireDrivers, fireOrders, fireOrder])

  return markers
}


function ActiveOrder() {
  const router = useRouter()
  const {query} = useRouter()
  const {user, fireSettings, fireDrivers} = useUser()
  const {selectedDriver,
    setSelectedDriver,
    bounds,
    setBounds,
    matrix,
    setMatrix,
    distanceTime,
    setDistanceTime,
    stops,
    setStops,
    view,
    setView,} = useOrder()
  // const [selectedDriver, setSelectedDriver] = useState(null)
  // const [view, setView] = useState(defaultMap)
  // const [bounds, setBounds] = useState([
  //   [defaultMap.longitude, defaultMap.latitude],
  // ])
  const [disabled, setDisabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [progressColor, setProgressColor] = useState('rgb(0,200,5)')
  const [progressButtonColor, setProgressButtonColor] = useState(
    'rgb(224, 224, 224)'
  )
  const [progressButtonText, setProgressButtonText] = useState('Loading')
  const [spinnerColor, setSpinnerColor] = useState('rgb(27, 58, 87)')
  const mapSet = useRef(false)
  const ipadScrollRef = createRef(null)
  const mobileScrollRef = createRef(null)
  // const [matrix, setMatrix] = useState({origins: [], destinations: []})
  // const [stops, setStops] = useState(0)
  // const [distanceTime, setDistanceTime] = useState('--')
  const {width, height} = useWindowSize()
  //const posRef = useRef(null)

  const [hidden, setHidden] = useState('')

  // const scrollToRef = (ref) =>
  //   ref.current.scrollIntoView({behavior: 'smooth', block: 'start'})
  // const executeScroll = () => width < 767 && scrollToRef(posRef)
  // const scrollToBottom = (ref) =>
  //   ref.current.scrollIntoView({behavior: 'smooth', block: 'end'})
  // const scrollBack = () => width < 767 && scrollToBottom(posRef)

  // useEffect(() => {
  //   return () => {
  //     setView(defaultMap)
  //     setBounds([[defaultMap.longitude, defaultMap.latitude]])
  //   };
  // }, []);



  /* IOS scroll fix */
  useEffect(() => {
    if (width > 767) {
      // Ipad width
      disableBodyScroll(ipadScrollRef.current)
      enableBodyScroll(mobileScrollRef.current)
    } else {
      // Phone width
      disableBodyScroll(mobileScrollRef.current)
      enableBodyScroll(ipadScrollRef.current)
    }
    return () => {
      clearAllBodyScrollLocks()
    }
  }, [width])

  const fireOrder = useFirestoreQuery(
    user?.uid &&
      router.query?.oid &&
      firebase.firestore().collection('orders').doc(router.query.oid)
  )
    const fireCustomer = useFirestoreQuery(
      fireOrder?.data?.user?.uid && 
      firebase.firestore()
      .collection('users')
      .doc(fireOrder.data.user.uid)
  )

  const getDistanceTime = useCallback(async () => {
    const {origins, destinations} = matrix
    let timeValue = 0
    console.log('origins, destinations')
    console.log(origins)
    console.log(destinations)
    getMatrix({origins, destinations})
      .then((r) => {
        console.log('r')
        console.log(r)
        const {rows} = r.data
        for (const key in rows) {
          const {elements} = rows[key]
          const {value, text} = elements[key].duration
          timeValue = timeValue + value
        }
        setDistanceTime(secondsToHms(timeValue))
      })
      .catch((e) => (console.log('e'), console.log(e)))
  }, [matrix])

  useEffect(() => {
    console.log("lpc1")
    const {origins, destinations} = matrix
    if (origins.length && destinations.length) {
      getDistanceTime()
    } else {
      setDistanceTime('--')
    }
  }, [matrix])

  /* FitBounds */
  const fitBounds = useCallback(() => {
    if (view.width && view.height && view.latitude && view.longitude) {
      if (bounds.length === 1) {
        setView((oldView) => {
          return {
            ...oldView,
            ...{latitude: bounds[0][1], longitude: bounds[0][0]},
          }
        })
      } else if (bounds.length > 1) {
        const newViewport = new WebMercatorViewport(view)
        const {longitude, latitude, zoom} = newViewport.fitBounds(
          [bounds[0], bounds[bounds.length - 1]],
          {
            padding: {top: 185, bottom: 60, left: 60, right: 60},
          }
        )
        setView((oldView) => {
          return {...oldView, ...{longitude, latitude, zoom}}
        })
      }
    }
  }, [bounds, height, width, view])

  /* WatchBounds */
  useEffect(() => {
    if (width && height && fireOrder.data) {
      fitBounds()
    }
  }, [bounds, width, height, fireOrder])

  useEffect(() => {
    console.log(view)
  }, [view])

  /* Set MapSize */
  useMemo(() => {
    //alert(width)
    if (width <= 735) {
      //MOBILE
      setView((oldView) => {
        return {...oldView, ...{width: width, height: 420}}
      })
    } else if (width > 735 && width < 919) {
      //IPAD
      setView((oldView) => {
        return {...oldView, ...{width: width - 350, height}}
      })
    } else if (width >= 919) {
      //DESKTOP
      setView((oldView) => {
        return {...oldView, ...{width: width - (350 + 256), height}}
      })
    } else if (width >= 1366) {
      //HD
      setView((oldView) => {
        return {...oldView, ...{width: width - (350 + 460), height}}
      })
    } else {
      //DEFAULT
      setView((oldView) => {
        return {...oldView, ...{width, height}}
      })
    }
  }, [width, height])

  useEffect(() => {
    let text = ''
    let buttonColor = colorObject['loading']
    let spinnerColor = 'rgb(27, 58, 87)'
    let color = buttonColor
    let value = null
    let label = null
    let disable = true

    if (fireOrder.status === 'success' && Boolean(fireOrder?.data?.progress)) {
      const { progress } = fireOrder.data
      let p = progress
      color = colorObject[p]
      if ([PROGRESS[7], PROGRESS[8]].includes(progress)) {
        text = 'Exit'
        buttonColor = colorObject[p]
        spinnerColor = buttonColor
        disable = false
      } else if ([PROGRESS[0]].includes(p)) {
        text = 'Select Driver'
        if (selectedDriver) {
          //alert("selected driver")
          buttonColor = colorObject[p]
          text = 'Assign Order'
          disable = false
        }
      } else if ([PROGRESS[1]].includes(p)) {
        buttonColor = colorObject[p]
        p = PROGRESS[PROGRESS.indexOf(p) + 1]
        text = `Mark ${capitalize(p)}`
        spinnerColor = buttonColor
        disable = false
      } else {
        p = PROGRESS[PROGRESS.indexOf(p) + 1]
        text = `Mark ${capitalize(p)}`
        buttonColor = colorObject[p]
        spinnerColor = buttonColor
        disable = false
      }
    }
    if (loading) {
      buttonColor = colorObject['loading']
      spinnerColor = 'rgb(27, 58, 87)'
      disable = true
    }
    if (fireOrder.data?.driver) {
      value = fireOrder.data.driver.uid
      label = fireOrder.data.driver.displayName
      if (value !== selectedDriver?.value) {
        setSelectedDriver(label && value ? {label, value} : null)
      }
    }
    setDisabled(disable)
    setProgressColor(color)
    setProgressButtonColor(buttonColor)
    setProgressButtonText(text)
    setSpinnerColor(spinnerColor)
  }, [fireOrder, loading, selectedDriver])

  const handleUpdate = useCallback(async () => {
    setLoading(true)
    let {value} = selectedDriver
    if (!value) {
      setLoading(false)
      return alert('no driver')
    }
    let p = fireOrder.data?.progress
    if ([PROGRESS[7], PROGRESS[8]].includes(p)) {
      router.push(`/${user?.uid}/orders/active`)
    } else if ([PROGRESS[0]].includes(p)) {
      setTimeout(async () => {
        await updateFirestore('orders', router.query.oid, {
          progress: PROGRESS[PROGRESS.indexOf(p) + 1],
          driver: fireDrivers.data.map((user) => user.uid === value && user)[0],
        })
        setLoading(false)
      }, 2000)
    } else {
      setTimeout(async () => {
        await updateFirestore('orders', router.query.oid, {
          progress: PROGRESS[PROGRESS.indexOf(p) + 1],
        })
        setLoading(false)
      }, 2000)
    }
  }, [fireOrder, selectedDriver, router, fireDrivers])

  return (

      <div data-e2eid='checkoutPage' className='info-map-page'>
        <OrderMenu
          {...{fireOrder}}
          {...{fireCustomer}}
          //color={progressColor}
          //address={fireOrder.data?.location.address.split(',')[0]}
          //progress={fireOrder.data?.progress}
          //as={`/${user?.uid}/orders/selected/${query.oid}`}
          //href={`/[adminID]/orders/selected/[oid]`}
          //scroll={false}
        />
        <div
          id='order-page'
          ref={mobileScrollRef}
          className={`info-map-container`}>
          {/* Info Header */}
          <header className='info-header'>
            <div className='info-map-header-btn-container'>
              <Link
                href={'/[adminID]/orders/active'}
                as={`/${user?.uid}/orders/active`}
                scroll={false}>
                <button className='button-base info-header-button left'>
                  <div className='svg-wrapper'>
                    <SVGIcon
                      className={'i5-scale'}
                      color={defaultTheme.colors.action}
                      name={'arrowLeft'}
                    />
                  </div>
                </button>
              </Link>
            </div>
            <div style={{color:defaultTheme.colors.action}} className='info-header-title'>
              {fireOrder.data?.location.address
                ? fireOrder.data?.location.address.split(',')[0]
                : 'Order'}
            </div>
            <div className='info-map-header-btn-container'>
              <Link
                as={`/${user?.uid}/orders/selected/${query.oid}?more`}
                href={`/[adminID]/orders/selected/[oid]?more`}
                scroll={false}>
                <button className='button-base info-header-button right'>
                  <div className='svg-wrapper'>
                    <SVGIcon
                      className={'i5-scale'}
                      color={defaultTheme.colors.action}
                      name={'moreFilled'}
                    />
                  </div>
                </button>
              </Link>
            </div>
          </header>
          {/* Info Container */}
          <div ref={ipadScrollRef} className={`info-container ${hidden}`}>
            <div className='info-list'>
              <h1 className='delivery-title'>Order</h1>
              <div
                //ref={posRef}
                style={{
                  fontWeight: 'bold',
                  marginBottom: '12px',
                  marginTop: '8px',
                  color: 'rgb(66, 66, 66)',
                  fontSize: '16px',
                }}>
                Assigned to
              </div>

              <Select
                id='country'
                name='country'
                floatingLabelText='Driver'
                hintText='Select a driver'
                //onClose={() => scrollBack()}
                onClose={() => setHidden('')}
                onOpen={() => setHidden('overflow-hidden')}
                //onOpen={() => executeScroll()}
                //onBlur={()=>scrollBack()}
                onSelect={(_, v) => setSelectedDriver(v)}
                selectedOption={selectedDriver}
                disabled={
                  Boolean(fireDrivers.status === 'success') &&
                  Boolean(fireOrder.status === 'success')
                    ? !Boolean(fireOrder.data?.progress === 'received')
                    : true
                }
                //serverError='Error'
                style={{marginBottom: '12px'}}
                fullWidth>
                {(fireDrivers.data || []).map(
                  ({displayName, uid, online}, i) => {
                    if (online) {
                      return (
                        <MenuItem
                          //leftIcon={'person'}
                          key={i}
                          label={displayName}
                          value={uid}
                        />
                      )
                    }
                  }
                )}
              </Select>
              {/* PROGRESS ADDRESS */}

              <div className='order-progress-container flex-box'>
                <div className='order-address-box'>
                  {fireOrder?.status === 'success' ? (
                    <div className='module-wrapper module-wrapper'>
                      <section style={{padding: '0 0px'}}>
                        <div className='css-1v3870x e9mvujh0'>
                          <div style={{position: 'relative'}}>
                            <div className='css-1fh9ug8 e1m3c6hs1'>
                              <div className='css-1ofqig9 ej2tyaj0'>
                                <div
                                  type='faded'
                                  className='css-1woe1iy ey3gvnc0'>
                                  <div className='css-95g4uk ey3gvnc2'>
                                    <div
                                      className='css-1vd84sn ey3gvnc5'
                                      style={{marginBottom: 16}}>
                                      <span style={{marginRight: 12}}>
                                        <SVGIcon
                                          className={'i5-scale'}
                                          color={'rgb(66, 66, 66)'}
                                          name={'clockFilled'}
                                        />
                                      </span>

                                      <span
                                        style={{
                                          fontWeight: 'bold',
                                          marginBottom: '8px',
                                        }}>
                                        {fireOrder?.data?.start &&
                                        fireSettings?.status === 'success'
                                          ? `Today by ${new Date(
                                              fireOrder?.data?.start.toDate()
                                            )
                                              .addHours(
                                                fireSettings.data?.waitTime
                                              )
                                              .toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                              })
                                              .toLowerCase()}`
                                          : '--'}
                                      </span>
                                      <div className='css-77vupy ey3gvnc1' />
                                    </div>
                                  </div>

                                  <div className='css-95g4uk ey3gvnc2'>
                                    <div
                                      className='css-1vd84sn ey3gvnc5'
                                      style={{marginBottom: 16}}>
                                      <span style={{marginRight: 12}}>
                                        <SVGIcon
                                          className={'i5-scale'}
                                          color={'rgb(66, 66, 66)'}
                                          name={'locationMarkerFilled'}
                                        />{' '}
                                      </span>
                                      <div>
                                        <div style={{fontWeight: 'bold'}}>
                                          { Boolean(fireOrder?.data?.location?.address)
                                            ? fireOrder?.data.location.address.split(
                                                ','
                                              )[0]
                                            : '--'}
                                        </div>
                                        <div style={{fontSize: '12px'}}>
                                          {'No instructions'}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className='css-95g4uk ey3gvnc2'>
                                    <div className='css-1vd84sn ey3gvnc5'>
                                      <span style={{marginRight: 12}}>
                                        <SVGIcon
                                          className={'i5-scale'}
                                          color={'rgb(66, 66, 66)'}
                                          name={'callFilled'}
                                        />{' '}
                                      </span>
                                      <div>
                                        <div style={{fontWeight: 'bold'}}>
                                          {fireOrder.data?.user.phoneNumber
                                            ? fireOrder.data?.user.phoneNumber
                                            : '--'}
                                        </div>
                                        <div style={{fontSize: '12px'}}>
                                          {fireOrder.data?.user?.displayName
                                            ? fireOrder.data?.user?.displayName
                                            : '--'}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className='css-m0iina e17qz39z0' />
                          </div>
                        </div>
                      </section>
                    </div>
                  ) : (
                    <div className='module-wrapper module-wrapper'>
                      <section style={{padding: '0 0px'}}>
                        <div className='css-1v3870x e9mvujh0'>
                          <div style={{position: 'relative'}}>
                            <div className='css-1fh9ug8 e1m3c6hs1'>
                              <div className='css-1ofqig9 ej2tyaj0'>
                                <div
                                  type='faded'
                                  className='css-1woe1iy ey3gvnc0'>
                                  <div className='css-95g4uk ey3gvnc2'>
                                    <div
                                      className='css-1vd84sn ey3gvnc5'
                                      style={{marginBottom: 16}}>
                                      <span style={{marginRight: 12}}>
                                        <SVGIcon
                                          className={'i5-scale'}
                                          color={'rgb(66, 66, 66)'}
                                          name={'clockFilled'}
                                        />
                                      </span>

                                      <span
                                        style={{
                                          fontWeight: 'bold',
                                          marginBottom: '8px',
                                          color: 'rgb(228,233,237)',
                                        }}>
                                        ----
                                      </span>
                                      <div className='css-77vupy ey3gvnc1' />
                                    </div>
                                  </div>

                                  <div className='css-95g4uk ey3gvnc2'>
                                    <div
                                      className='css-1vd84sn ey3gvnc5'
                                      style={{marginBottom: 16}}>
                                      <span style={{marginRight: 12}}>
                                        <SVGIcon
                                          className={'i5-scale'}
                                          color={'rgb(66, 66, 66)'}
                                          name={'locationMarkerFilled'}
                                        />{' '}
                                      </span>
                                      <div>
                                        <div
                                          style={{
                                            fontWeight: 'bold',
                                            color: 'rgb(228,233,237)',
                                          }}>
                                          ----
                                        </div>
                                        <div
                                          style={{
                                            fontSize: '12px',
                                            color: 'rgb(228,233,237)',
                                          }}>
                                          --
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className='css-95g4uk ey3gvnc2'>
                                    <div className='css-1vd84sn ey3gvnc5'>
                                      <span style={{marginRight: 12}}>
                                        <SVGIcon
                                          className={'i5-scale'}
                                          color={'rgb(66, 66, 66)'}
                                          name={'callFilled'}
                                        />{' '}
                                      </span>
                                      <div>
                                        <div
                                          style={{
                                            fontWeight: 'bold',
                                            color: 'rgb(228,233,237)',
                                          }}>
                                          ----
                                        </div>
                                        <div
                                          style={{
                                            fontSize: '12px',
                                            color: 'rgb(228,233,237)',
                                          }}>
                                          --
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className='css-m0iina e17qz39z0' />
                          </div>
                        </div>
                      </section>
                    </div>
                  )}
                </div>
                <div className='order-progress-box'>
                  {fireOrder?.status === 'success' ? (
                    <ProgressBar
                      size={100}
                      progress={progressPercent[fireOrder.data?.progress] || 0}
                      strokeWidth={4}
                      circleOneStroke={
                        colorObject['light'] || 'rgb(228,233,237)'
                      }
                      circleTwoStroke={progressColor}
                      current={fireOrder.data?.progress}
                    />
                  ) : (
                    <div className='order-progress-holder' />
                  )}
                </div>
              </div>

              {/* PHONE */}

              <div className='identification-b1'>
                {fireOrder?.status === 'success' ? (
                  <img src={fireOrder.data?.user.photoURL}/>
                ) : (
                  <div className={'holder'}>
                    <div className={'img-height'} />
                  </div>
                )}
              </div>

              {/* CART */}

              {fireOrder.status === 'success' && Boolean( fireOrder?.data?.cart?.items )
                ? fireOrder.data.cart.items.map(
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
                        wholesale={wholesale||0}
                      />
                    )
                  )
                : [0, 1, 2, 4].map((i) => <CartItemSkeleton key={i} />)}

              {/* Totals */}

              {fireOrder?.status === 'success' ? (
                <div className='module-wrapper module-wrapper'>
                  <section>
                    <div className='css-149ghmn e17qz39z0' />
                    <div className='css-1v3870x e9mvujh0'>
                      <div style={{position: 'relative'}}>
                        <div className='css-1fh9ug8 e1m3c6hs1'>
                          <div className='css-1ofqig9 ej2tyaj0'>
                            <div type='faded' className='css-1woe1iy ey3gvnc0'>
                              <div
                                className='css-95g4uk ey3gvnc2'
                                style={{fontSize: '16px'}}>
                                <div
                                  className='css-1vd84sn ey3gvnc5'
                                  style={{fontWeight: 'bold'}}>
                                  Total
                                  <div className='css-77vupy ey3gvnc1' />
                                </div>
                                <div
                                  className='css-vqyk7m ey3gvnc3'
                                  style={{fontWeight: 'bold'}}>
                                  {Boolean(fireOrder?.data?.cart?.grandTotal)
                                    ? fireOrder?.data.cart.grandTotal.toLocaleString(
                                        'en-US',
                                        {
                                          style: 'currency',
                                          currency: 'USD',
                                        }
                                      )
                                    : '--'}
                                </div>
                              </div>
                              <div className='css-95g4uk ey3gvnc2'>
                                <div className='css-1vd84sn ey3gvnc5'>
                                  Cash
                                  <div className='css-77vupy ey3gvnc1' />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className='css-m0iina e17qz39z0' />
                      </div>
                    </div>
                  </section>
                </div>
              ) : (
                <div className='module-wrapper module-wrapper'>
                  <section style={{padding: '1.5rem 0px'}}>
                    <div className='css-149ghmn e17qz39z0' />
                    <div className='css-1v3870x e9mvujh0'>
                      <div style={{position: 'relative'}}>
                        <div className='css-1fh9ug8 e1m3c6hs1'>
                          <div className='css-1ofqig9 ej2tyaj0'>
                            <div type='faded' className='css-1woe1iy ey3gvnc0'>
                              <div className='css-95g4uk ey3gvnc2'>
                                <div className='ey3gvnc5 holder'>
                                  <div className='width-30' />
                                </div>
                                <div
                                  className='holder'
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                  }}>
                                  <div className='width-30' />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className='css-m0iina e17qz39z0' />
                      </div>
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>

          {/* Map Container */}
          <div className='map-container'>
            {/* MAP HEADER */}
            <header className='map-header'>
              <div className='info-map-header-btn-container'>
                <Link
                  href={'/[adminID]/orders/active'}
                  as={`/${user?.uid}/orders/active`}
                  scroll={false}>
                  <button className='button-base map-header-button left'>
                    <div className='svg-wrapper'>
                      <SVGIcon
                        className={'i5-scale'}
                        color={defaultTheme.colors.action}
                        name={'arrowLeft'}
                      />
                    </div>
                  </button>
                </Link>
              </div>
              <div style={{color:defaultTheme.colors.action}} className='map-header-title'>
                {fireOrder.data?.location.address
                  ? fireOrder.data?.location.address.split(',')[0]
                  : 'Order'}
              </div>
              <div className='info-map-header-btn-container right'>
                <Link
                  as={`/${user?.uid}/orders/selected/${query.oid}?more`}
                  href={`/[adminID]/orders/selected/[oid]?more`}
                  scroll={false}>
                  <button className='button-base map-header-button right'>
                    <div className='svg-wrapper'>
                      <SVGIcon
                        className={'i5-scale'}
                        color={defaultTheme.colors.action}
                        name={'moreFilled'}
                      />
                    </div>
                  </button>
                </Link>
              </div>
            </header>
            {/* MAP HERE */}

            <div className='css-17taute eeu551e0'>
              <div className='css-5sdfw9 eeu551e1'>
                <ReactMapGL
                  mapStyle='mapbox://styles/mapbox/streets-v9'
                  mapboxApiAccessToken={TOKEN}
                  onViewportChange={setView}
                  transitionDuration={1000}
                  transitionInterpolator={new FlyToInterpolator()}
                  transitionEasing={d3.easeCubic}
                  {...view}>
                  <div className='map-button-fit'>
                    <div className='mapboxgl-ctrl mapboxgl-ctrl-group '>
                      <button
                        onClick={() => fitBounds()}
                        className='mapboxgl-ctrl-icon mapboxgl-ctrl-fullscreen'
                        type='button'
                        title='Toggle fullscreen'>
                        <div className='svg-wrapper'>
                          <FitBoundsSVG />
                        </div>
                      </button>
                    </div>
                  </div>
                  <MapPopup {...{fireOrder}} />
                  <OrderMarkers {...{fireOrder}} />
                </ReactMapGL>
              </div>
            </div>
          </div>
          <div className='admin-bottom-button-box'>
            <div className='css-1pbc9y4 e1fkx5wq0'>
             
             
              <button
                onClick={handleUpdate}
                disabled={disabled || loading}
                data-bypass='false'
                data-radium='true'
                className={`button-base progress-bottom-button${Boolean(fireOrder?.data?.progress?` ${fireOrder.data.progress}`:`''`)}`}
                style={{
                  backgroundColor: progressButtonColor,
                  borderColor: progressButtonColor,
                  height: '48px',
                  fontSize: '18px',
                  borderRadius: '25px',
                  textAlign: 'center',
                  fontWeight: 600,
                  position: 'relative',
                  display: 'block',
                  padding: '10px 18px',
                  color: 'rgb(255, 255, 255)',
                  width: '100%',
                }}>
                <div className='rmq-a26a37a6' data-radium='true'>
                  {!loading && progressButtonText}
                  {loading && (
                    <div className='inline-loading'>
                      <div
                        style={{borderLeft: `3px solid ${spinnerColor}`}}
                        className='spinner'
                      />
                    </div>
                  )}

                  <span
                    data-radium='true'
                    style={{
                      fontSize: 20,
                      color: 'rgb(255, 255, 255)',
                      display: 'none',
                    }}>
                    <svg
                      width='24px'
                      height='24px'
                      viewBox='0 0 24 24'
                      aria-hidden='true'
                      fill='currentColor'>
                      <path d='M15.711 11.272l-5-4.979a.999.999 0 0 0-1.415.002c-.39.39-.384 1.03 0 1.413l4.296 4.276-4.3 4.306a1.008 1.008 0 0 0-.002 1.416.998.998 0 0 0 1.415 0l5.006-5.013c.185-.185.282-.429.29-.676a.999.999 0 0 0-.29-.745z' />
                    </svg>
                  </span>
                </div>
                <div
                  data-radium='true'
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                  <div
                    data-radium='true'
                    style={{
                      background:
                        'linear-gradient(rgba(20, 20, 20, 0.2), rgba(20, 20, 20, 0.2))',
                      padding: '4px 7px',
                      borderRadius: '20px',
                    }}>
                    {fireOrder?.status === 'success' ? (
                      fireOrder.data?.cart.grandTotal > 0 ? (
                        fireOrder.data?.cart.grandTotal.toLocaleString(
                          'en-US',
                          {
                            style: 'currency',
                            currency: 'USD',
                          }
                        )
                      ) : (
                        '--.--'
                      )
                    ) : (
                      <div className='inline-loading'>
                        <div className='spinner' />
                      </div>
                    )}
                  </div>
                </div>
              </button>
           
           
           
            </div>
          </div>
      
        </div>
      </div>
    
  )
}





///export const OrderContext = createContext()
///export const useOrder = () => useContext(OrderContext)
ActiveOrder.Layout = ConsoleLayout
export default ActiveOrder

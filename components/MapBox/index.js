/* Mapbox Parts  */
import {useEffect, useState, useCallback, forwardRef, createRef, useRef} from 'react'
import { useUser } from '../../context/userContext'
import {useOrder} from '../../context/orderContext'
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
  } from '../../helpers'
  import ReactMapGL, {
    FlyToInterpolator,
    WebMercatorViewport,
    Marker,
    Popup,
  } from "react-map-gl"
  //import {useVehicle} from '../../pages/[adminID]/drivers'

// Selected Driver Marker
// Drivers other active order markers
// Selected Order Marker


export const OrderMarkers = ({ fireOrder }) => {
    const { fireDrivers, fireOrders } = useUser()
    const { selectedDriver, setBounds } = useOrder()
    const [markers, setMarkers] = useState([])
  
    useEffect(() => {
      const markers = []
      const boundaries = []
  
      if (
        Boolean(fireOrder?.data) &&
        Boolean(fireOrders?.data) &&
        Boolean(fireDrivers?.data) 
        //&& orderProgressObject.active.includes(fireOrder.data.progress)
      ) {


        //push driver bounds // not if complete // paid // cancel
        const isComplete = Boolean([...orderProgressObject.complete, ...orderProgressObject.cancel].includes(fireOrder.data.progress))
       
        if (Boolean(selectedDriver) && !isComplete ) {
          //{value: "jOnVtqr6NSOX8AIGWORTlCVm3ls2", label: "Dylan Best"}
          const { data, status, error } = fireDrivers
          for (const key in data) {
            const { uid } = data[key]
            if (selectedDriver.value === uid && Boolean(data[key]?.vehicle)) {
              const { vehicle } = data[key]
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
        if (Boolean(selectedDriver) && !isComplete) {
          //orderProgressObject.active
          //selectedDriver.value
          // cycle through orders and get all ACTIVE orders for this driver
          // store to bounds and add a marker with a key
  
          const aid = fireOrder.data.id
          const sid = selectedDriver.value
          const selectedTimestamp = Boolean(fireOrder.data?.start.length) ? new Date(fireOrder.data?.start.toDate()) : new Date()
  
          const { data, status, error } = fireOrders
          let stop = 0
          for (const key in data) {
            const { driver, coordinates, progress, id } = data[key]
            const did = data[key].driver?.id
            //const uid = selectedDriver.value

            //if active order progress includes active order array
            //sid === did && id !== aid
            if (did === sid && id !== aid) {
              if (orderProgressObject.active.includes(progress)) {
                /// if order does not equal  the current one
                const otherOrderTimestamp = new Date(data[key]?.start.toDate())
  
                if (otherOrderTimestamp < selectedTimestamp) {
                  console.log("other order less then selected")
                  stop++
                  const props = {
                    color: "rgb(147, 96, 168)",
                    icon: "bag",
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
  

        // set this orders marker and add location bounds
        

        //[-118.3287023, 34.1037767]
        console.log("THIS ORDER BOUNDS")
        console.log(fireOrder?.data?.coordinates)

        boundaries.push(fireOrder?.data?.coordinates)
        markers.push(
        <Marker
            key={fireOrder?.data?.user?.uid}
            offsetLeft={-21}
            offsetTop={-70}
            latitude={fireOrder?.data?.coordinates[1]}
            longitude={fireOrder?.data?.coordinates[0]}>
            <MarkerOrder
            icon={
                ["received", "pending"].includes(fireOrder?.data?.progress) ? (
                <PrioritySVG color={colorObject[fireOrder?.data?.progress]} {...{...fireOrder}} />
                ) : ["cancel"].includes(fireOrder?.data?.progress) ? (
                <CancelSVG color={colorObject[fireOrder?.data?.progress]} {...{...fireOrder}} />
                ) : (
                <BagSVG color={colorObject[fireOrder?.data?.progress]} {...{...fireOrder}} />
                )
            }
            {...{...fireOrder}}
            />
        </Marker>
        )
   
  
        console.log("SETTING BOUNDS TOTAL")
        console.log(boundaries)
  
        setBounds(boundaries)
        setMarkers(markers)
      }



    }, [selectedDriver, fireDrivers, fireOrders, fireOrder])
    return <>{markers}</>
  }
  
 export const MarkerOrder = ({
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
              fill={colorObject[data?.progress]}
              fillRule='nonzero'
              shapeRendering='optimizeQuality'
            />
            <circle fill='#FFF' cx={27} cy={27} r={22} />
          </g>
        </svg>
        <div style={{color:colorObject[data?.progress] }} className={'marker-icon-order'}>{icon}</div>
      </>
    )
}

export const PrioritySVG = ({color = 'black', data}) => {
    return (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 24 24'
        //fill='black'
        fill={colorObject[data?.progress]}
        height='24px'>
        <path d='M0 0h24v24H0V0z' fill='none' />
        <circle cx={12} cy={19} r={2} />
        <path d='M10 3h4v12h-4z' />
      </svg>
    )
}





const BagSVG = ({color = 'black'}) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" viewBox="0 0 24 24" fill={color} width="24px" height="24px">
      <g>
        <rect fill="none" height={24} width={24} />
        <path d="M18,6h-2c0-2.21-1.79-4-4-4S8,3.79,8,6H6C4.9,6,4,6.9,4,8v12c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V8C20,6.9,19.1,6,18,6z M12,4c1.1,0,2,0.9,2,2h-4C10,4.9,10.9,4,12,4z M18,20H6V8h2v2c0,0.55,0.45,1,1,1s1-0.45,1-1V8h4v2c0,0.55,0.45,1,1,1s1-0.45,1-1V8 h2V20z" />
      </g>
    </svg>
  )
}


const NavigationSVG = ({color = 'black', heading = 0 }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill={color}
      style={{transform: `rotate(${heading}deg)`}}
      width='24px'
      height='24px'>
      <path d='M0 0h24v24H0z' fill='none' />
      <path d='M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z' />
    </svg>
  )
}
const StoppedSVG = ({color = 'black', style}) => {
  return (
    <svg
      style={style}
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill={color}
      width='24px'
      height='24px'>
      <path d='M0 0h24v24H0z' fill='none' />
      <path d='M6 6h12v12H6z' />
    </svg>
  )
}
const PausedSVG = ({color = 'black'}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill={color}
      width='24px'
      height='24px'>
      <path d='M0 0h24v24H0z' fill='none' />
      <path d='M6 19h4V5H6v14zm8-14v14h4V5h-4z' />
    </svg>
  )
}

export const MarkerSVG = ({
  color = 'rgb(0,200,5)',
  heading = null,
  motion_status = 'stale',
  speed_mph,
  icon
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
        {((heading !== null) && (speed_mph > 0)) && (
          <NavigationSVG
            color={color}
            heading={heading}
          />
        )}
        {motion_status === 'stopped' && (
          <StoppedSVG
            color={color}
          />
        )}
        {(motion_status === 'moving' && !speed_mph) && (
          <PausedSVG
            color={color}
          />
        )}
        {icon === "bag" && (
          <BagSVG
            color={color}
          />
        ) }
      </div>
    </>
  )
}



export const OrderPopUp = ({fireOrder}) => {
 
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
      Boolean(fireOrder.data?.coordinates) && <Popup
        latitude={fireOrder.data?.coordinates[1]}
        longitude={fireOrder.data?.coordinates[0]}
        closeButton={true}
        closeOnClick={false}
        offsetTop={-70}
        tipSize={10}
        closeButton={false}
        //onClose={() => setSelected(null)}
        anchor='bottom'>
        <div className='roboto-medium'>
          <div className='nickname text-weight-regular block q-mr-lg'>
            {fireOrder?.data?.location?.address.split(',')[0]}
          </div>
          <div className='location-details text-grey-9'>
            <div className='row no-wrap'>
              <span>{`Progress: `}</span>
              <span style={{color: colorObject[fireOrder?.data?.progress]}}>{capitalize(fireOrder?.data?.progress)}</span>
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
  export const MapPopup = ({fireOrder}) => {
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
        Boolean(fireOrder?.data?.progress) &&
        orderProgressObject.active.includes(fireOrder.data.progress)
      ) {
        if (selectedDriver && fireDrivers.status === 'success') {
          //{value: "jOnVtqr6NSOX8AIGWORTlCVm3ls2", label: "Dylan Best"}
          // clcle through drivers and find this one by uid
          // make a marker with his coordinates and add them to the boundaries
          const {data, status, error} = fireDrivers
          for (const key in data) {
            const {uid, displayName} = data[key]
            if (selectedDriver?.value === uid && data[key]?.vehicle ) {
              const {lat, lon} = data[key]?.vehicle.vehicle_location.point
              const {make_name, model_name, model_year} = data[key]?.vehicle
              const {motion_status, speed_mph} = data[key]?.vehicle.vehicle_location
              if (lat && lon) {
                //push driver origin
                origins.push(`${lat},${lon}`)
                pop.push(
                  <DriverPopUp
                    key={key}
                    {...{
                      lat,
                      lon,
                      motion_status,
                      speed_mph,
                      displayName,
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
  
        if (Boolean(fireOrder?.data?.user?.uid)) {
          if (fireOrder.data?.coordinates) {
            pop.push(<OrderPopUp  
                key={fireOrder?.data?.user?.uid||'error'} 
                {...{...fireOrder}} />)
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
          const selectedTimestamp = Boolean(fireOrder.data?.start.length) ? new Date(fireOrder.data?.start.toDate()) : new Date()
          console.log('selected order timestamp')
          console.log(selectedTimestamp)
  
          for (const key in data) {
            const {driver, coordinates, progress, id} = data[key]
            const did = data[key].driver?.id
            const uid = selectedDriver.value
            //data[key].coordinates
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
          //const {coordinates} = fireOrder.data?.location
          destinations.push(`${fireOrder.data?.coordinates[1]},${fireOrder.data?.coordinates[0]}`)
        }
      }
  
      //stopsRef.current = stop
      setStops(stop)
      setMatrix({origins, destinations})
      setPopup(pop)
    }, [fireDrivers, selectedDriver, fireOrders, fireOrder])
  
    return <>{popup}</>
  }
  export const DriverPopUp = ({
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
  export const StopSVG = ({
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
import React from "react"
import SVGIcon from "../../components/SVGIcon"
import Link from "next/link"
import PropTypes from "prop-types"
// //mport NavBar from "../NavBar"
// import SideMenu from "../SideMenu"
// import OrderMenu from "../OrderMenu"
import Map from "../dynamic/Map"

DeliveryFlow.propTypes = {
  leftIconName: PropTypes.string,
  leftIconColor: PropTypes.string,
  rightIconName: PropTypes.string,
  rightIconColor: PropTypes.string,
  rightIconName: PropTypes.string,
  rightIconColor: PropTypes.string,
}
DeliveryFlow.defaultProps = {}

function DeliveryFlow({
  children,
  leftHref,
  rightHref,
  leftAs,
  rightAs,
  leftIconName,
  leftIconColor,
  rightIconName,
  rightIconColor,
  screen,
  leftMenu,
  rightMenu,
}) {


  return (
    <div className={`delivery-flow`}>
      <div className="delivery-flow-app-bar">
        <div className="delivery-flow-toolbar">
          <div className="delivery-flow-btns">
            <Link href={leftHref} as={leftAs} >
              <button className="button-base">
                {leftIconName.length && (
                  <SVGIcon color={leftIconColor} name={leftIconName} />
                )}
              </button>
            </Link>
          </div>
          <h1 className={`delivery-flow-logo`}>{""}</h1>
          <div className="delivery-flow-btns">
            {/* <Link href="/order/[id]" as={`/order/${rightLink}?menu`}> */}
            <Link href={rightHref} as={rightAs}>
              <button className="button-base">
                {rightIconName.length && (
                  <SVGIcon color={rightIconColor} name={rightIconName} />
                )}
              </button>
            </Link>
          </div>
        </div>
      </div>
      <div className={`delivery-flow-wrapper`}>
        <div className={`delivery-flow-orders`}>
          {/* <h1 className="delivery-title">Orders</h1>
          <NavBar /> */}
          {children}
        </div>
        { screen === "desktop" && (
          <>
            {/* <span className="gap" /> */}
            <div className="delivery-flow-map">
            <div className={`delivery-map`}>
               <Map />
            </div>
            </div>
          </>
        )}
      </div>  
      {leftMenu}
      {rightMenu}
    </div>
  )
}

export default DeliveryFlow

import React, {useEffect, useState} from "react";
import SVGIcon from "../../components/SVGIcon";
import Link from "next/link";
// import PropTypes from "prop-types";
import Map from "../dynamic/Map";

// DeliveryFlow.propTypes = {
//   leftHref: PropTypes.string,
//   rightHref: PropTypes.string,
//   leftAs: PropTypes.string,
//   rightAs: PropTypes.string,
//   iconColor: PropTypes.string,
//   leftIconName: PropTypes.string,
//   rightIconName: PropTypes.string,
//   leftMenu: PropTypes.elementType,
//   rightMenu: PropTypes.elementType,
// };

// DeliveryFlow.defaultProps = {};

function DeliveryFlow({
  children,
  leftHref,
  rightHref,
  leftAs,
  rightAs,
  leftIconName,
  rightIconName,
  leftMenu,
  rightMenu,
  screen,
  iconColor,
  cartTotal,
  id="default"
}) {


  return (
    <div id={id} scoll-container="true" className="delivery-flow">
      <div className="delivery-flow-app-bar">
        <div className="delivery-flow-toolbar">
          <div className="delivery-flow-btns left">
            <Link scroll={false} href={leftHref} as={leftAs}>
              <button className="button-base">
                <SVGIcon color={iconColor} name={leftIconName} />
              </button>
            </Link>
          </div>
          <h1 className="delivery-flow-logo" />
          <div className="delivery-flow-btns">
            <span className="MuiBadge-root">
            <Link  scroll={false} href={rightHref} as={rightAs}>
              <button className="button-base">
                <SVGIcon color={iconColor} name={rightIconName} />
              </button>
            </Link>
            {(cartTotal>0) && <span class="MuiBadge-badge MuiBadge-colorPrimary">{cartTotal}</span>}
          </span>
          </div>
        </div>
      </div>
      <div className="delivery-flow-wrapper">
        <div className="delivery-flow-orders">{children}</div>
      </div>
      {leftMenu}
      {rightMenu}
    </div>
  );
}

export default DeliveryFlow;

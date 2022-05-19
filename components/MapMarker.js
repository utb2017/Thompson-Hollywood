import React from "react";


export default function MapMarker({progressColor, text}) {
  return (  
    <div  className='markerContainer'>
        <svg name="CenterPin" width="54px" height="87px"  viewBox="0 0 54 87" version="1.1" xlink="http://www.w3.org/1999/xlink" className={'markerSVG'} >
            <g transform="translate(-161.000000, -253.000000) translate(160.000000, 253.000000) translate(1.000000, 0.000000)" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" >
                <path 
                    d="M51.3 38.901c1.736-3.571 2.7-7.626 2.7-11.873C54 12.066 41.946 0 27 0S0 12.066 0 27.028c0 4.247.964 8.205 2.796 11.873l.29.58c.193.386.385.675.578.965.772 1.351 1.736 3.185 2.218 3.957 2.604 4.055 5.69 7.267 7.618 10.453C16.2 59.2 20.636 68.37 22.468 73.1 23.818 76.478 27 87 27 87s3.279-10.425 4.532-13.9c1.832-4.73 6.268-13.997 8.968-18.244 2.025-3.186 5.014-6.398 7.618-10.453a59.148 59.148 0 0 0 2.218-3.957c.193-.29.385-.676.578-.966.29-.386.386-.579.386-.579z"
                    fill={progressColor}
                    fillRule="nonzero"
                >
                </path>
                <circle fill="#FFF" cx="27" cy="27" r="22"></circle>
            </g>
        </svg>
        <div className={'markerTxt'}>{text}</div>
    </div>
  )}
import {useVehicle} from '../../pages/[adminID]/drivers'


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

const MarkerSVG = ({
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
export default MarkerSVG

//   <>
//   <svg
//     name='CenterPin'
//     width='54px'
//     height='87px'
//     viewBox='0 0 54 87'
//     version='1.1'
//     xmlnsXlink='http://www.w3.org/1999/xlink'
//     style={{
//       height: '41px',
//       width: '27px',
//     }}>
//     <g
//       //transform='translate(-161.000000, -253.000000) translate(160.000000, 253.000000) translate(1.000000, 0.000000)'
//       stroke='none'
//       strokeWidth={1}
//       fill='none'
//       fillRule='evenodd'>
//       <path
//         d='M51.3 38.901c1.736-3.571 2.7-7.626 2.7-11.873C54 12.066 41.946 0 27 0S0 12.066 0 27.028c0 4.247.964 8.205 2.796 11.873l.29.58c.193.386.385.675.578.965.772 1.351 1.736 3.185 2.218 3.957 2.604 4.055 5.69 7.267 7.618 10.453C16.2 59.2 20.636 68.37 22.468 73.1 23.818 76.478 27 87 27 87s3.279-10.425 4.532-13.9c1.832-4.73 6.268-13.997 8.968-18.244 2.025-3.186 5.014-6.398 7.618-10.453a59.148 59.148 0 0 0 2.218-3.957c.193-.29.385-.676.578-.966.29-.386.386-.579.386-.579z'
//         fill='#F05B4B'
//         fillRule='nonzero'
//       />
//       <circle fill='#FFF' cx={27} cy={27} r={22} />
//     </g>
//   </svg>
//   <div className={"markerTxt"}>
//      <SVGIcon name={'menu'} color={"#252a2d"} />
//   </div>
//   </>

//   <svg display='block' height='41px' width='27px' viewBox='0 0 27 41'>
//     <g fillRule='nonzero'>
//       <g transform='translate(3.0, 29.0)' fill='#000000'>
//         <ellipse
//           opacity='0.04'
//           cx='10.5'
//           cy='5.80029008'
//           rx='10.5'
//           ry='5.25002273'
//         />
//         <ellipse
//           opacity='0.04'
//           cx='10.5'
//           cy='5.80029008'
//           rx='10.5'
//           ry='5.25002273'
//         />
//         <ellipse
//           opacity='0.04'
//           cx='10.5'
//           cy='5.80029008'
//           rx='9.5'
//           ry='4.77275007'
//         />
//         <ellipse
//           opacity='0.04'
//           cx='10.5'
//           cy='5.80029008'
//           rx='8.5'
//           ry='4.29549936'
//         />
//         <ellipse
//           opacity='0.04'
//           cx='10.5'
//           cy='5.80029008'
//           rx='7.5'
//           ry='3.81822308'
//         />
//         <ellipse
//           opacity='0.04'
//           cx='10.5'
//           cy='5.80029008'
//           rx='6.5'
//           ry='3.34094679'
//         />
//         <ellipse
//           opacity='0.04'
//           cx='10.5'
//           cy='5.80029008'
//           rx='5.5'
//           ry='2.86367051'
//         />
//         <ellipse
//           opacity='0.04'
//           cx='10.5'
//           cy='5.80029008'
//           rx='4.5'
//           ry='2.38636864'
//         />
//       </g>
//       <g fill={color}>
//         <path d='M27,13.5 C27,19.074644 20.250001,27.000002 14.75,34.500002 C14.016665,35.500004 12.983335,35.500004 12.25,34.500002 C6.7499993,27.000002 0,19.222562 0,13.5 C0,6.0441559 6.0441559,0 13.5,0 C20.955844,0 27,6.0441559 27,13.5 Z' />
//       </g>
//       <g opacity='0.25' fill='#000000'>
//         <path d='M13.5,0 C6.0441559,0 0,6.0441559 0,13.5 C0,19.222562 6.7499993,27 12.25,34.5 C13,35.522727 14.016664,35.500004 14.75,34.5 C20.250001,27 27,19.074644 27,13.5 C27,6.0441559 20.955844,0 13.5,0 Z M13.5,1 C20.415404,1 26,6.584596 26,13.5 C26,15.898657 24.495584,19.181431 22.220703,22.738281 C19.945823,26.295132 16.705119,30.142167 13.943359,33.908203 C13.743445,34.180814 13.612715,34.322738 13.5,34.441406 C13.387285,34.322738 13.256555,34.180814 13.056641,33.908203 C10.284481,30.127985 7.4148684,26.314159 5.015625,22.773438 C2.6163816,19.232715 1,15.953538 1,13.5 C1,6.584596 6.584596,1 13.5,1 Z' />
//       </g>
//       <g transform='translate(6.0, 7.0)' fill='#FFFFFF' />
//       <g transform='translate(8.0, 8.0)'>
//         <circle
//           fill='#000000'
//           opacity='0.25'
//           cx='5.5'
//           cy='5.5'
//           r='5.4999962'
//         />
//         <circle fill='#FFFFFF' cx='5.5' cy='5.5' r='5.4999962' />
//       </g>
//     </g>
//   </svg>

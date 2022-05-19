import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';

const ProgressCircle = props => {
    
    const [offset, setOffset] = useState(0);
    const circleRef = useRef(null);
    const {
        size,
        progress,
        strokeWidth,
        circleOneStroke,
        circleTwoStroke,
        current
    } = props;

    const center = size / 2;
    const radius = size / 2 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;

    useEffect(() => {
        const progressOffset = ((100 - progress) / 100) * circumference;
        setOffset(progressOffset);

        circleRef.current.style = 'transition: stroke-dashoffset 850ms ease-in-out';

    }, [setOffset, progress, circumference, offset]);


    return (
        <>
            <svg
                className="svg"
                width={size}
                height={size}
            >
                <circle
                    className="svg-circle-bg"
                    stroke={circleOneStroke}
                    cx={center}
                    cy={center}
                    r={radius}
                    strokeWidth={strokeWidth}
                />
                <circle
                    className="svg-circle"
                    ref={circleRef}
                    stroke={circleTwoStroke}
                    cx={center}
                    cy={center}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    // stroke-linecap="round"
                />

                <text 
                    x={`${center}`} 
                    y={`${center+4}`} 
                    className={`svg-circle-text`}>
                        {current}
                </text>
            </svg>
        </>
    );
}

ProgressCircle.propTypes = {
    size: PropTypes.number.isRequired,
    progress: PropTypes.number.isRequired,
    strokeWidth: PropTypes.number.isRequired,
    circleOneStroke: PropTypes.string.isRequired,
    circleTwoStroke: PropTypes.string.isRequired
}

export default ProgressCircle;


                /* <circle
                    className="svg-circle"
                    ref={circleRef}
                    stroke={"rgba(0,200,5,1)"}
                    cx={center}
                    cy={center}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={ ((100 - (progress<20?progress:18) ) / 100) * (circumference)}
                    stroke-linecap="round"
                    transform={`rotate(75, ${size/2}, ${size/2})`}
                />
                <circle
                    className="svg-circle"
                    ref={circleRef}
                    stroke={"rgba(0,200,5,1)"}
                    cx={center}
                    cy={center}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={ ((100 - (progress<20?progress:18) ) / 100) * (circumference)}
                    stroke-linecap="round"
                    transform={`rotate(150, ${size/2}, ${size/2})`}
                />
                <circle
                    className="svg-circle"
                    ref={circleRef}
                    stroke={"rgba(0,200,5,1)"}
                    cx={center}
                    cy={center}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={ ((100 - (progress<20?progress:18) ) / 100) * (circumference)}
                    stroke-linecap="round"
                    transform={`rotate(225, ${size/2}, ${size/2})`}
                />
                                <circle
                    className="svg-circle"
                    ref={circleRef}
                    stroke={"rgba(0,200,5,1)"}
                    cx={center}
                    cy={center}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={ ((100 - (progress<20?progress:18) ) / 100) * (circumference)}
                    stroke-linecap="round"
                    transform={`rotate(300, ${size/2}, ${size/2})`}
                /> */
                /* <circle
                    ref={circleRef}
                    className="svg-no-fill"
                    stroke={"red"}
                    cx={center}
                    cy={center}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={offset}
                    stroke-linecap="round"
                    transform={`rotate(-50, ${size/2}, ${size/2})`}
                /> */
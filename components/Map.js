import { useState, useRef, forwardRef, useEffect, useMemo } from "react";
import ReactMapGL, { Layer } from "react-map-gl";
import dynamic from 'next/dynamic'


// import * as turf from '@turf/turf'
import { polygon, point } from "@turf/helpers";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";

import { useUser } from "../context/userContext";
const Geocoder = dynamic(() => import('react-map-gl-geocoder'))
const TOKEN = `pk.eyJ1IjoidGFsbGd1eWh5ZHJvIiwiYSI6ImNrZTExNGIzejJ5NjQydG51M3duZmRkMTkifQ.-iT4qHj-fRqA8aFLHrSUTg`;
const PROXIMITY = { latitude: 34.103729, longitude: -118.328613 };
const MARKER = false;

const laCoords = [
  [
    [-118.5687542, 34.0412107],
    [-118.4082538, 33.8727824],
    [-118.3717758, 33.8729961],
    [-118.3688574, 33.9671539],
    [-118.3363247, 33.9894178],
    [-118.2811303, 34.0096732],
    [-118.1707964, 34.0336193],
    [-118.0576271, 34.0671419],
    [-118.0600304, 34.1575335],
    [-118.1163354, 34.2083719],
    [-118.5152764, 34.2268251],
    [-118.5687542, 34.0412107],
  ],
];

const poly = polygon(laCoords);



const parkLayer = {
  id: "maine",
  type: "fill",
  source: {
    type: "geojson",
    data: {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: laCoords,
      },
    },
  },
  layout: {},
  paint: {
    "fill-color": "#088",
    "fill-opacity": 0.1,
  },
};

const Map = forwardRef((props, ref) => {
  const state = {
    width: "100%",
    height: "100%",
    latitude: 34.103729,
    longitude: -118.328613,
    zoom: 8,
  };
  const mapRef = useRef();
  const [view, setView] = useState(state);
  const [disable, setDisable] = useState(null);
  const [addressData, setAddressData] = useState(null);


  // useEffect(() => {

  //   console.log("address")
  //   console.log(address)
  //   console.log("inZone");
  //   console.log(inZone);

  //  // setDisable(address && inZone)


  // }, [address, inZone]);

  // useEffect(() => {
  //   console.log("address");
  //   console.log(address);
  //   if (address?.result) {
  //     console.log("address.result.center");
  //     console.log(address.result.center);
  //     const pt = point(address.result.center);
  //     setInZone(booleanPointInPolygon(pt, poly, { ignoreBoundary: false }))
  //     // const inZone = booleanPointInPolygon(address.result.center, laCoords)

  //   }else{

  //     console.log("address clear");

  //   }

  //   //
  //   //turf.booleanPointInPolygon(pt, laCoords);
  // }, [address]);

  return (
    <ReactMapGL
      ref={mapRef}
      mapStyle="mapbox://styles/mapbox/streets-v9"
      mapboxApiAccessToken={TOKEN}
      onViewportChange={setView}
      // dragPan={false}
      // dragRotate={false}
      // doubleClickZoom={false}
      // touchZoom={false}
      // touchRotate={false}
      // scrollZoom={false}
      {...view}
    >
      <Geocoder
        mapRef={mapRef}
        onViewportChange={setView}
        containerRef={ref}
        mapboxApiAccessToken={TOKEN}
        countries={"US"}
        proximity={PROXIMITY}
        position="top-left"
        // marker={MARKER}
        placeholder={"Enter address"}
        onResult={setAddressData}
        onClear={setAddressData}
      />
      <Layer {...parkLayer} />
    </ReactMapGL>
  );
});

export default Map;

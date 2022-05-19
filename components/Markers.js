import { Marker } from "react-map-gl";
import { useStateMap } from "../hooks/mapHook";
import SVGIcon from "../components/SVGIcon"
export const Markers = () => {
  const { markers } = useStateMap();
  return (
    <>
      {markers?.map((marker, index) => {
      return(
        <Marker
          key={index}
          offsetTop={-24}
          offsetLeft={-24}
          latitude={marker[1]}
          longitude={marker[0]}
       >
           <SVGIcon name={marker[2]} color={marker[3]} />
        </Marker>
      )}
      
      
      )}
    </>
  );
};



   {/* <img src="https://img.icons8.com/color/48/000000/marker.png" /> */}
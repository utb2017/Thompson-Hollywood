// mapHook.js
import { createContext, useContext, useReducer } from "react";
const MapStateContext = createContext();
const MapDispatchContext = createContext();
export const MapProvider = ({ children }) => {
  const [state, dispatch] = useReducer(MapReducer, { markers: [] });
  return (
    <MapStateContext.Provider value={state}>
      <MapDispatchContext.Provider value={dispatch}>
        {children}
      </MapDispatchContext.Provider>
    </MapStateContext.Provider>
  );
};
export const useStateMap = () => {
  const context = useContext(MapStateContext);
  if (context === undefined) {
    throw new Error("place useStateMap within MapProvider");
  }
  return context;
};
export const useDispatchMap = () => {
  const context = useContext(MapDispatchContext);
  if (context === undefined) {
    throw new Error("place useDispatchMap within MapProvider");
  }
  return context;
};

// mapHook.js
export const MapReducer = (state, action) => {
    switch (action.type) {
      case "ADD_MARKER":
        return {
          ...state,
          markers: [...state.markers, action.payload.marker]
        };
      case "CLEAR_MARKERS":
        return {
          ...state,
          markers: []
        };
      case "REMOVE_MARKER":
        return {
          ...state,
          markers: [...state.markers.filter(x =>
            x[0] !== action.payload.marker[0] &&
            x[1] !== action.payload.marker[1]
          )]
        };
      default:
        return state;
    }
    return state;
  }
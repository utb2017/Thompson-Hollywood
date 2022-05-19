// mapHook.js
import { createContext, useContext, useReducer } from "react"

export const ACTIVE_ORDERS = [
  "pending",
  "assigned",
  "pickup",
  "warning",
  "arrived",
]
export const COMPLETE_ORDERS = ["complete"]
export const CANCEL_ORDERS = ["cancel"]

const FilterStateContext = createContext()
const FilterDispatchContext = createContext()

export const FilterProvider = ({ children }) => {
  const [state, dispatch] = useReducer(FilterReducer, { filter: ACTIVE_ORDERS })
  return (
    <FilterStateContext.Provider value={state}>
      <FilterDispatchContext.Provider value={dispatch}>
        {children}
      </FilterDispatchContext.Provider>
    </FilterStateContext.Provider>
  )
}
export const useStateFilter = () => {
  const context = useContext(FilterStateContext)
  if (context === undefined) {
    throw new Error("place useStateMap within FilterProvider")
  }
  return context
}
export const useDispatchFilter = () => {
  const context = useContext(FilterDispatchContext)
  if (context === undefined) {
    throw new Error("place useDispatchMap within FilterProvider")
  }
  return context
}

// filterHook.js
export const FilterReducer = (state, action) => {
  switch (action.type) {
    case "FILTER_ACTIVE":
      return {
        ...state,
        filter: ACTIVE_ORDERS,
      }
    case "FILTER_COMPLETE":
      return {
        ...state,
        filter: COMPLETE_ORDERS,
      }
    case "FILTER_CANCEL":
      return {
        ...state,
        filter: CANCEL_ORDERS,
      }
  }
  return state
}
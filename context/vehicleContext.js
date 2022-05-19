import {useState, createContext, useContext} from 'react'
export const VehicleContext = createContext()
import { defaultMap, defaultOrders,} from '../helpers'
  
export default function VehicleContextComp({children}) {

  const [selected, setSelected] = useState(null)
  const [view, setView] = useState(defaultMap)
  const [orders, setOrders] = useState(defaultOrders)
  const [filter, setFilter] = useState('active')
  const [bounds, setBounds] = useState([[defaultMap.longitude, defaultMap.latitude]])



  return (
    <VehicleContext.Provider value={{
        selected, 
        setSelected, 
        orders, 
        filter, 
        setFilter, 
        view, 
        setView, 
        bounds, 
        setBounds,
        setOrders
      }}>
      {children}
    </VehicleContext.Provider>
  )
}
export const useVehicle = () => useContext(VehicleContext)

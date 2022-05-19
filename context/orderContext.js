import {useState, createContext, useContext} from 'react'
export const OrderContext = createContext()
import { defaultMap} from '../helpers'
  
export default function OrderContextComp({children}) {

  const [selectedDriver, setSelectedDriver] = useState(null)
  const [view, setView] = useState(defaultMap)
  const [bounds, setBounds] = useState([
    [defaultMap.longitude, defaultMap.latitude],
  ])
  const [matrix, setMatrix] = useState({origins: [], destinations: []})
  const [stops, setStops] = useState(0)
  const [distanceTime, setDistanceTime] = useState('--')



  return (
    <OrderContext.Provider value={{
        selectedDriver,
        setSelectedDriver,
        bounds,
        setBounds,
        matrix,
        setMatrix,
        distanceTime,
        setDistanceTime,
        stops,
        setStops,
        view,
        setView,
      }}>
      {children}
    </OrderContext.Provider>
  )
}
export const useOrder = () => useContext(OrderContext)

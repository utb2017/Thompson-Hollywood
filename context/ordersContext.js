import {useState, createContext, useContext} from 'react'
export const OrdersContext = createContext()
export default function OrdersContextComp({children}) {
  const [bounds, setBounds] = useState([])
  return (
    <OrdersContext.Provider value={{bounds, setBounds}}>
      {children}
    </OrdersContext.Provider>
  )
}
export const useOrders = () => useContext(OrdersContext)

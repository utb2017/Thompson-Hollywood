import {useState, createContext, useContext} from 'react'
export const DiscountsContext = createContext()

export default function DiscountsContextComp({children}) {
  const [lastID, setLastID] = useState(null)
  const [firstID, setFirstID] = useState(null)
  const [reverse, setReverse] = useState(false)
  return (
    <DiscountsContext.Provider
      value={{
        firstID,
        setFirstID,
        lastID,
        setLastID,
        reverse,
        setReverse,
      }}>
      {children}
    </DiscountsContext.Provider>
  )
}

export const useDiscounts = () => useContext(DiscountsContext)

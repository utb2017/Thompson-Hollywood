import {useState, createContext, useContext} from 'react'
export const ProductContext = createContext()

export default function ProductContextComp({children}) {
  const [lastID, setLastID] = useState(null)
  const [firstID, setFirstID] = useState(null)
  const [reverse, setReverse] = useState(false)
  return (
    <ProductContext.Provider
      value={{
        firstID,
        setFirstID,
        lastID,
        setLastID,
        reverse,
        setReverse,
      }}>
      {children}
    </ProductContext.Provider>
  )
}

export const useProducts = () => useContext(ProductContext)

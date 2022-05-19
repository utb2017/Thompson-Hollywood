import {useState, createContext, useContext} from 'react'
export const UsersContext = createContext()

export default function UsersContextComp({children}) {
  const [lastID, setLastID] = useState(null)
  const [firstID, setFirstID] = useState(null)
  const [reverse, setReverse] = useState(false)
  return (
    <UsersContext.Provider
      value={{
        firstID,
        setFirstID,
        lastID,
        setLastID,
        reverse,
        setReverse,
      }}>
      {children}
    </UsersContext.Provider>
  )
}

export const useUsers = () => useContext(UsersContext)

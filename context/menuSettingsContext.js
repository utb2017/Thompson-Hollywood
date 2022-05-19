import {useState, createContext, useContext} from 'react'
export const MenuSettingsContext = createContext()


export default function MenuSettingsContextComp({children}) {
    const [sortableObject, setSortableObject] = useState([])
    const [sortableArray, setSortableArray] = useState([])
    const [sortableComponents, setSortableComponents] = useState([])
    const [addCollectionItem, setAddCollectionItem ] = useState(null)
   // alert("Menu Settings Mount")

  return (
    <MenuSettingsContext.Provider value={{
            sortableObject, 
            setSortableObject,
            sortableArray, 
            setSortableArray,
            sortableComponents, 
            setSortableComponents,
            addCollectionItem, 
            setAddCollectionItem
        }}>
        {children}
    </MenuSettingsContext.Provider>
  )
}

export const useMenuSettings = () => useContext(MenuSettingsContext)


// mapHook.js
import { createContext, useContext, useReducer, useEffect } from "react"
import ModalBase from '../components/Modals/ModalBase';
import { useRouter } from "next/router";



const ModalBaseStateContext = createContext()
const ModalBaseDispatchContext = createContext()

export const ModalBaseProvider = ({ children }) => {
   const router = useRouter()

  const [modalBaseState, modalBaseDispatch] = useReducer(ModalBaseReducer, { modalBase: { 
        isOpen:false,
        component:null,
        key:[],
        hasSquareBottom:false
    } })


    useEffect(() => {
      modalBaseDispatch({
          type: "MODAL_UPDATE",
          payload: { modalBase: {
            isOpen:false,
            key:[],
            component:null,
            hasSquareBottom:false

          } },
        }) 
    }, [router])

  return (
    <ModalBaseStateContext.Provider value={modalBaseState}>
      <ModalBaseDispatchContext.Provider value={{modalBaseDispatch, modalBaseState}}>      
        {children} 
        <ModalBase modalBase={modalBaseState}/>
      </ModalBaseDispatchContext.Provider>
    </ModalBaseStateContext.Provider>
  )
}
export const useStateModalBase = () => {
  const context = useContext(ModalBaseStateContext)
  if (context === undefined) {
    throw new Error("place useStateMap within ModalBaseProvider")
  }
  return context
}
export const useDispatchModalBase = () => {
  const context = useContext(ModalBaseDispatchContext)
  if (context === undefined) {
    throw new Error("place useDispatchMap within ModalBaseProvider")
  }
  return context
}

// ModalBaseHook.js
export const ModalBaseReducer = (state, action) => {
  switch (action.type) {
    case "MODAL_UPDATE":
      return {
        ...state,
        ...action.payload.modalBase
      }
  }
  return state
}
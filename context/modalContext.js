// mapHook.js
import { createContext, useContext, useReducer, useEffect } from "react"
import Modal from '../components/Modal';
import { useRouter } from "next/router";



const ModalStateContext = createContext()
const ModalDispatchContext = createContext()

export const ModalProvider = ({ children }) => {
   const router = useRouter()

  const [modalState, modalDispatch] = useReducer(ModalReducer, { modal: { 
        isOpen:false,
        component:null,
        key:[]
    } })


    useEffect(() => {
      modalDispatch({
          type: "MODAL_UPDATE",
          payload: { modal: {
            isOpen:false,
            key:[],
            component:null,
          } },
        }) 
    }, [router])

  return (
    <ModalStateContext.Provider value={modalState}>
      <ModalDispatchContext.Provider value={{modalDispatch, modalState}}>
        {children}
        <Modal modal={modalState}/>
      </ModalDispatchContext.Provider>
    </ModalStateContext.Provider>
  )
}
export const useStateModal = () => {
  const context = useContext(ModalStateContext)
  if (context === undefined) {
    throw new Error("place useStateMap within ModalProvider")
  }
  return context
}
export const useDispatchModal = () => {
  const context = useContext(ModalDispatchContext)
  if (context === undefined) {
    throw new Error("place useDispatchMap within ModalProvider")
  }
  return context
}

// ModalHook.js
export const ModalReducer = (state, action) => {
  switch (action.type) {
    case "MODAL_UPDATE":
      return {
        ...state,
        ...action.payload.modal
      }
  }
  return state
}
import {useState, createContext, useContext} from 'react'
import {presetImgObject} from '../helpers'
export const CreateUserContext = createContext()


export const defaultErrors = {
  role:null,
  displayName:null,
  phoneNumber:null,
  email:null,
  photoURL:null,
}

export const defaultForm = {
  role:null,
  displayName:null,
  phoneNumber:null,
  email:null,
  photoURL:presetImgObject["license"],  
  phoneNumberMask:null,
}


export default function userEditContextComp({children}) {
  const [form, setForm] = useState(defaultForm)
  const [error, setError] = useState(defaultErrors)
  return (
    <CreateUserContext.Provider value={{form, setForm, error, setError}}>
        {children}
    </CreateUserContext.Provider>
  )
}
export const useEditUser = () => useContext(CreateUserContext)


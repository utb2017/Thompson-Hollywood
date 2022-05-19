import {useState, createContext, useContext} from 'react'
import {presetImgObject} from '../helpers'
export const UserCreateContext = createContext()


export const defaultErrors = {
  //role:null,
  displayName:null,
  phoneNumber:null,
  email:null,
  photoURL:null,
}

export const defaultForm = {
  //role:null,
  displayName:'',
  phoneNumber:'',
  email:'',
  photoURL:'',  
  //phoneNumberMask:null,
}




export default function CreateUserContextComp({children}) {
    const [form, setForm] = useState(defaultForm)
    const [error, setError] = useState(defaultErrors)
  return (
    <UserCreateContext.Provider value={{form, setForm, error, setError}}>
        {children}
    </UserCreateContext.Provider>
  )
}

export const useCreateUser = () => useContext(UserCreateContext)


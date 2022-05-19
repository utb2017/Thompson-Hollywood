import {useState, createContext, useContext} from 'react'
import presetImgObject from '../helpers/presetImageObject'
export const ProductCreateContext = createContext()


export const defaultErrors = {
    type:null,
    name:null,
    genome:null,
    brand:null,
    img:null,
    thc:null,
    cbd:null,
    price:null,
    size:null,
    inventory:null,
    description:null,
    effects:null
}

export const defaultForm = {
  type:null,
  name:null,
  genome:null,
  brand:null,
  img: presetImgObject["default"],
  thc:null,
  cbd:null,
  price:null,
  size:null,
  inventory:null,
  description:null,
  effects:{}
}


export default function CreateProductContextComp({children}) {
    const [form, setForm] = useState(defaultForm)
    const [error, setError] = useState(defaultErrors)
  
  return (
    <ProductCreateContext.Provider value={{form, setForm, error, setError}}>
        {children}
    </ProductCreateContext.Provider>
  )
}

export const useCreateProduct = () => useContext(ProductCreateContext)


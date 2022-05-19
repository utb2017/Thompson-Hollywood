import {useState, createContext, useContext, useEffect} from 'react'
import {useRouter} from 'next/router'
import {useUser} from '../context/userContext'
//import {deleteFirestoreCart} from '../firebase/clientApp'

export const CreateOrderContext = createContext()

const defaultErrors = {
    displayName:null,
    phoneNumber:null,
    email:null,
}
//const pages = ['/[adminID]/create-order/[page]'];

export default function CreateOrderContextComp({children}) {

    const {user, setCustomerID} = useUser()
    const [inZone, setInZone] = useState(null)
    const [addressData, setAddressData] = useState(null);
    const [error, setError] = useState(defaultErrors)
    const [displayName, setDisplayName] = useState(null)
    const [phoneNumber, setPhoneNumber] = useState(null)
    const [email, setEmail] = useState(null)
    const [instructions, setInstructions] = useState(null)
    const [phoneNumberMask, setPhoneNumberMask] = useState(null)

    //const {pathname} = useRouter()

    // useEffect(() => {
    //     if(!pages.includes(pathname)){
    //         setAddressData(null)
    //         setInZone(null)
    //         deleteFirestoreCart(user.uid)
    //         setDisplayName(null)
    //         setPhoneNumber(null)
    //         setEmail(null)
    //         setInstructions(null)
    //         setPhoneNumberMask(null)
    //         setError(defaultErrors)
    //         setCustomerID(null)
    //     }
    // }, [pathname, addressData]);
  
  return (
    <CreateOrderContext.Provider value={{ 
        error, 
        setError, 
        inZone, 
        setInZone, 
        addressData, 
        setAddressData,
        displayName, 
        setDisplayName,
        phoneNumber, 
        setPhoneNumber,
        email, 
        setEmail,
        instructions, 
        setInstructions,
        phoneNumberMask, 
        setPhoneNumberMask
    }}>
        {children}
    </CreateOrderContext.Provider>
  )
}

export const useCreateOrder = () => useContext(CreateOrderContext)


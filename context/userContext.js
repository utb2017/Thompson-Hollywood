import {
  useState,
  useEffect,
  createContext,
  useContext,
} from 'react'
import firebase from '../firebase/clientApp'
import {useFirestoreQuery} from '../hooks/useFirestoreQuery'
import Spinner from '../components/Buttons/Spinner'
import { useRouter } from "next/router"

export const UserContext = createContext()
let isNum = function ( x ) {
  x = parseFloat(x)
  return isNaN( x ) ? 0 : parseFloat(x);
};
export default function UserContextComp({children}) {
  const [user, setUser] = useState(null)
  // const [cart, setCart] = useState(null)
  // const [salesTax, setSalesTax] = useState(null)
  // const [localTax, setLocalTax] = useState(null)
  // const [exciseTax, setExciseTax] = useState(null)
  // const [deliveryFee, setDeliveryFee] = useState(null)
  // const [grandTotal, setGrandTotal] = useState(null)
  // const [feeTotal, setFeeTotal] = useState(null)
  // const [feeWave, setFeeWave] = useState(100)
  //const [fireBrands, setFireBrands] = useState([])
  //const [fireCollections, setFireCollection] = useState([])
  // const [cartItems, setCartItems] = useState([])
  const [loadingUser, setLoadingUser] = useState(true) // Helpful, to update the UI accordingly.
  const [orders, setOrders] = useState(null)
  const [loadingOrders, setLoadingOrders] = useState(true)
  // const [cartTotal, setCartTotal] = useState(0)
  // const [subtotal, setTotal] = useState(null)
  const [zone,setZone] = useState(null)
  const [ totalsLoading,  setTotalsLoading] = useState(false)
  const router = useRouter()
  const [customerID, setCustomerID] = useState(null)


  const [cartTotal, setCartTotal] = useState(0)
  const [subtotal, setTotal] = useState(null)
  const [isDark, setIsDark] = useState(false)


  
useEffect(() => {
  setTotalsLoading(false)
}, [router]);


  const startOfToday = new Date();
  startOfToday.setHours(0,0,0,0);
  const endOfToday = new Date();
  endOfToday.setHours(23,59,59,999);
  const [queryDate, setQueryDate] = useState({start:startOfToday, end:endOfToday})
 
 


  //BASIC DATA REQUESTS
  // ++ FireUser
  // ++ FireTotals
  // ++ fireSettings
  // ++ FireCollection
  // ++ FireBrands
  // ++ FireCart
  const fireUser = useFirestoreQuery(
    user?.uid && firebase.firestore().collection('users').doc(user.uid)
  )
  // const fireCartX = useFirestoreQuery(
  //   user?.uid && firebase.firestore().collection('cart').doc(user.uid)
  // )   
  // const fireCartXX = useFirestoreQuery(
  //   user?.uid && firebase.firestore().collection('users').doc(user.uid).collection('Cart').doc('items')
  // )   
  const fireCustomer = useFirestoreQuery(
    customerID && firebase.firestore().collection('users').doc(customerID)
  ) 
  const fireCart = useFirestoreQuery(
    customerID && firebase.firestore().collection('users').doc(customerID).collection('Cart')
  )  
  const fireCartTotals = useFirestoreQuery(
    customerID && firebase.firestore().collection("users").doc(customerID).collection("Totals").doc("cart")
  )    
  const fireDiscounts = useFirestoreQuery(
    customerID && firebase.firestore().collection('users').doc(customerID).collection('Discounts').where('active', '==', true).where('used', '==', false)
  )     
  const fireCredits = useFirestoreQuery(
    customerID && firebase.firestore().collection('users').doc(customerID).collection('Credits').where('used', '==', false)
  ) 
  const fireTotalsUnsettled = useFirestoreQuery(
    !loadingUser && firebase.firestore().collection('totals').doc('unsettled')
  )
  const fireTotals = useFirestoreQuery(
    !loadingUser && firebase.firestore().collection('shortcuts').doc('totals')
  )
  // const fireMenuBrands = useFirestoreQuery(
  //   !loadingUser && firebase.firestore().collection('menu').doc('brands')
  // )
  // const fireMenuCollections = useFirestoreQuery(
  //   !loadingUser && firebase.firestore().collection('menu').doc('collections')
  // )
  const fireSettings = useFirestoreQuery(
    !loadingUser && firebase.firestore().collection('admin').doc('store')
  )  
  const fireCollections = useFirestoreQuery(
    !loadingUser && firebase.firestore().collection('collections').orderBy("menuOrder", "asc")
  )   
  const fireBrands = useFirestoreQuery(
    !loadingUser && firebase.firestore().collection('brands').orderBy("menuOrder", "asc")
  ) 




  //Will remove?
  const fireOrders = useFirestoreQuery(
    user?.uid &&
      firebase
        .firestore()
        .collectionGroup('Orders')
        .where("settled", "==", false)
  )
  //Will remove?
  const fireDrivers = useFirestoreQuery(
    user?.uid &&
      firebase
        .firestore()
        .collection('users')
        .where('online', '==', true)
        .where('role', 'in', ['driver', 'dispatcher'])
  )




  /* SET BRANDS ARRAY */
  // useEffect(() => {
  //   const {data, status} = fireBrands
  //   let tempCollection = []
  //   if (status === 'success') {
  //     for (const key in data) {
  //       if (key === 'order') {
  //         tempCollection = data[key]
  //       }
  //     }
  //   }
  //   setFireBrands(tempCollection)
  // }, [fireBrands])
  
  /* SET COLLECTION ARRAY */
  // useEffect(() => {
  //   const {data, status} = fireCollection
  //   let tempCollection = []
  //   if (status === 'success') {
  //     for (const key in data) {
  //       if (key === 'order') {
  //         tempCollection = data[key]
  //       }
  //     }
  //   }
  //   setFireCollection(tempCollection)
  // }, [fireCollection])
 
  /* SET ZONE */
  useEffect(() => {
    let tempZone = []
    if (fireSettings.status === "success" && Boolean(fireSettings.data)) {
      let { zone } = fireSettings.data
      zone = JSON.parse(JSON.stringify(zone))
      for (const key in zone) {
        const { longitude, latitude } = zone[key]
        tempZone.push([longitude, latitude])
      }
    }
    setZone(tempZone)
  }, [fireSettings])
 



  useEffect(() => {
    // Look for Orders if logged in
    const unsubscriber = firebase.auth().onAuthStateChanged(async (user) => {
      // console.log('user')
      // console.log(user)
      try {
        if (user) {
          // User is signed in.
          const {uid, displayName, email, photoURL, phoneNumber} = user
          console.log('user')
          console.log(user)
          // You could also look for the user doc in your Firestore (if you have one):
          // const userDoc = await firebase.firestore().doc(`users/${uid}`).get()
          setUser({uid, displayName, email, photoURL, phoneNumber})
        } else setUser(null)
      } catch (error) {
        // Most probably a connection error. Handle appropriately.
      } finally {
        setLoadingUser(false)
      }
    })

    return () => unsubscriber()
  }, [])


  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loadingUser,
        orders,
        setOrders,
        loadingOrders,
        fireUser,
        fireOrders,
        fireSettings,
        fireDrivers,
        //fireMenuCollections,
        //fireCollections,
        fireDiscounts,
        queryDate, 
        setQueryDate,
        zone,
        setZone,
        fireBrands,
        fireTotals,
        //fireMenuBrands,
        fireCart,
        totalsLoading, 
        setTotalsLoading,
        fireTotalsUnsettled,
        fireCartTotals,
        fireCustomer,
        setCustomerID,
        customerID,
        fireCredits,
        isDark, 
        setIsDark,
        fireCollections
      }}>
      <>


      {/* LOADING */}
      {(Boolean(fireTotals?.status === "loading") ||
        Boolean(fireBrands?.status === "loading") ||
        Boolean(fireCollections?.status === "loading") ||
        Boolean(fireSettings?.status === "loading")) && (
        <div className='center-spinner'>
          <Spinner />
        </div>
      )}


      {/* OUTLET */}
      { Boolean(fireTotals?.status === "success" && fireTotals?.data) &&
        Boolean(fireBrands?.status === "success" && fireBrands?.data) &&
        Boolean(fireCollections?.status === "success" && fireCollections?.data) &&
        Boolean(fireSettings?.status === "success" && fireSettings?.data) 
            && (<>{children}</>)}


      {/* NO DATA */}
      { Boolean(fireTotals?.status === "success") &&
        Boolean(fireSettings?.status === "success") &&
        Boolean(fireBrands?.status === "success") &&
        Boolean(fireCollections?.status === "success") &&
        (!Boolean(fireCollections?.data) ||
        !Boolean(fireSettings?.data) ||
        !Boolean(fireTotals?.data) ||
        !Boolean(fireBrands?.data)) && (
          <div className='nav-denied' style={{flexDirection:'column', padding:'64px', margin:'auto', overflowWrap:'anywhere'}}>
            <h2>Missing Data.</h2><br/>
            {!Boolean(fireTotals?.data) && <><p>{`Fire Totals`}</p><br/></>}
            {!Boolean(fireSettings?.data) && <><p>{`Fire Settings.`}</p><br/></>}
            {!Boolean(fireBrands?.data) && <><p>{`Fire Brands.`}</p><br/></>}
            {!Boolean(fireCollections?.data) && <><p>{`Fire Collections.`}</p><br/></>}
          </div>
        )}


      {/* ERROR */}
      { (Boolean(fireTotals?.status === "error") ||
        Boolean(fireBrands?.status === "error") ||
        Boolean(fireCollections?.status === "error") ||
        Boolean(fireSettings?.status === "error")) && (
          <div className='nav-denied' style={{flexDirection:'column', padding:'64px', margin:'auto', overflowWrap:'anywhere'}}>
            <h2>An error occurred.</h2><br/>
            {fireTotals?.error && <><p>{`Fire Totals. ${fireTotals?.error?.message || "An error occurred."}`}</p><br/></>}
            {fireSettings?.error && <><p>{`Fire Settings. ${fireSettings?.error?.message || "An error occurred."}`}</p><br/></>}
            {fireBrands?.error && <><p>{`Fire Brands. ${fireBrands?.error?.message || "An error occurred."}`}</p><br/></>}
            {fireCollections?.error && <><p>{`Fire Collections. ${fireCollections?.error?.message || "An error occurred."}`}</p><br/></>}
          </div>
        )}
     </>
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)






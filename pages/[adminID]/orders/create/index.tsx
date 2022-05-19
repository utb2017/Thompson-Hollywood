import ConsoleLayout from "../../../../layouts/ConsoleLayout"
import { useState, useEffect } from "react"
import { useRouting } from "../../../../context/routingContext"
//import {disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock'
import dynamic from "next/dynamic"
import { useRouter } from "next/router"
import Spinner from "../../../../components/Buttons/Spinner"
import { useForm } from "../../../../context/formContext"
import { useUser } from "../../../../context/userContext"

import {deleteFirestoreCart} from '../../../../firebase/clientApp'

import { styled } from "baseui";
import { H2 } from "baseui/typography"

const Background = styled("div", ({ $theme }) => {
  return {
    backgroundColor: $theme.colors.backgroundOverlayLight,
  };
});


const MenuPage = dynamic(() => import("../../../../components/Pages/Orders/Menu"), {
  loading: () => (
    <Background className='nav-loader'>
      <Spinner />
    </Background>
  ),
})



const Settings = () => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { page } = router.query
  const { form, setForm, error, setError } = useForm()
  const { fireUser, user, fireSettings, fireMenuCollections } = useUser()
  const blackList = ["driver"]
  const { setNavLoading, navLoading } = useRouting()

  useEffect(() => {
    setNavLoading(false)
  }, [])

  useEffect(() => {
    return () => {
      setForm({})
      setError({})
      deleteFirestoreCart(user?.uid)
    }
  }, [])


  return (
    <>
    
      {/* LOADING */}
      {(   Boolean(fireUser?.status === "loading")
       // || Boolean(fireSettings?.status === "loading")   
       // || Boolean(fireMenuCollections?.status === "loading")     
      ) && (
        <div className='nav-loader'>
          <Spinner />
        </div>
      )}

      {/* DENIED */}
      {Boolean(fireUser?.data?.role && blackList.includes(fireUser?.data?.role || "")) && (
        <div className='nav-denied'>
          <H2>Permision Denied</H2>
        </div>
      )}

      {/* OUTLET */}
      {Boolean(fireUser?.data) &&
       //Boolean(fireSettings?.data) &&
      // Boolean(fireMenuCollections?.data) &&
        Boolean(fireUser?.data?.role && !blackList.includes(fireUser?.data?.role || "")) && (
          <MenuPage {...{ page }} {...{ fireSettings }} {...{ fireMenuCollections }} />
        )}

      {/* NO DATA */}
      {(Boolean(fireUser?.status === "success") && !Boolean(fireUser?.data) 
       // || Boolean(fireSettings?.status === "success") && !Boolean(fireSettings?.data) 
       // || Boolean(fireMenuCollections?.status === "success") && !Boolean(fireMenuCollections?.data) 
      ) && (
        <div
          className='nav-denied'
          style={{
            flexDirection: "column",
            padding: "64px",
            margin: "auto",
            overflowWrap: "anywhere",
          }}>
          <h2>Data not found.</h2>
          <br />
          {!Boolean(fireUser?.data) && (
            <>
              <p>{`Fire User.`}</p>
              <br />
            </>
          )}
        </div>
      )}

      {/* ERROR */}
      {(Boolean(fireUser?.status === "error") 
       // || Boolean(fireSettings?.status === "error") 
      //  || Boolean(fireMenuCollections?.status === "error") 
      ) && (
        <div
          className='nav-denied'
          style={{
            flexDirection: "column",
            padding: "64px",
            margin: "auto",
            overflowWrap: "anywhere",
          }}>
          <h2>An error occurred.</h2>
          <br />
          {fireUser?.error && (
            <>
              <p>{`Fire User. ${fireUser?.error?.message || "An error occurred."}`}</p>
              <br />
            </>
          )}
        </div>
      )}
    </>
  )
}

Settings.Layout = ConsoleLayout
export default Settings

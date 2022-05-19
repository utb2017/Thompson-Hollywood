import ConsoleLayout from "../../../../../layouts/ConsoleLayout"
import { useState, createRef, useEffect, useCallback } from "react"
import { useRouting } from "../../../../../context/routingContext"
import dynamic from "next/dynamic"
import { useRouter } from "next/router"
import Spinner from "../../../../../components/Buttons/Spinner"
import firebase from "../../../../../firebase/clientApp"
import { useUser } from "../../../../../context/userContext"
import { useFirestoreQuery } from "../../../../../hooks/useFirestoreQuery"


import { styled } from "baseui";

const Background = styled("div", ({ $theme }) => {
  return {
    backgroundColor: $theme.colors.backgroundOverlayLight,
  };
});
const SelectedOrderPage = dynamic(() => import("../../../../../components/Pages/Orders/OrderSelected"), {
  loading: () => (
    <Background className='nav-loader'>
      <Spinner />
    </Background>
  ),
})

const SelectedOrder = () => {
  const { navLoading, setNavLoading } = useRouting()
  const router = useRouter()
  const { user, fireUser } = useUser()
  const blackList = ["customer"]

  useEffect(() => {
    setNavLoading(false)
  }, [])

  const fireOrder = useFirestoreQuery(
    user?.uid &&
      router.query?.oid &&
      router.query?.uid &&
      firebase.firestore().collection("users").doc(router.query?.uid).collection("Orders").doc(router.query.oid)
  )
  const fireCustomer = useFirestoreQuery(
    fireOrder?.data?.user && firebase.firestore().collection("users").doc(fireOrder.data.user)
  )

  return (
    <>
      {/* LOADING */}
      {(Boolean(fireUser?.status === "loading") ||
        //Boolean(fireCustomer?.status === "loading") ||
        Boolean(fireOrder?.status === "loading")) && (
        <div className='nav-loader'>
          <Spinner />
        </div>
      )}

      {/* DENIED */}
      {Boolean(fireUser?.data?.role && blackList.includes(fireUser?.data?.role || "")) && (
        <div className='nav-denied'>
          <h2>Permision Denied</h2>
        </div>
      )}

      {/* OUTLET */}
      { Boolean(fireUser?.data) &&
        Boolean(fireOrder?.data) &&
        //Boolean(fireCustomer?.data) &&
        !blackList.includes(fireUser?.data?.role || "") && (
          <SelectedOrderPage {...{ fireOrder }} {...{ fireCustomer }} {...{ fireUser }} />
        )}

      {/* NO DATA */}
      {(Boolean(fireUser?.status === "success") && !Boolean(fireUser?.data) ||
        //Boolean(fireCustomer?.status === "success") && !Boolean(fireCustomer?.data) ||
        Boolean(fireOrder?.status === "success") && !Boolean(fireOrder?.data) ) && (
        <div className='nav-denied' style={{ width:'100%',flexDirection:'column'}}>
          <h2>Data not found.</h2>
          <br />
          {!Boolean(fireOrder?.data) && ( <><p>{`Order not found.`}</p><br /></> )}
          {!Boolean(fireUser?.data) && ( <><p>{`Authentication not found.`}</p><br /></> )}
        </div>
      )}

      {/* ERROR */}
      {(Boolean(fireUser?.status === "error") ||
       // Boolean(fireCustomer?.status === "error") ||
        Boolean(fireOrder?.status === "error")) && (
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
          {fireUser?.error && ( <><p>{`Fire User. ${fireUser?.error?.message || "An error occurred."}`}</p><br /></> )}
          {fireOrder?.error && ( <><p>{`Fire Order. ${fireOrder?.error?.message || "An error occurred."}`}</p><br /></> )}
          {fireCustomer?.error && ( <><p>{`Fire Customer. ${fireCustomer?.error?.message || "An error occurred."}`}</p><br /></> )}
        </div>
      )}
    </>
  )
}

SelectedOrder.Layout = ConsoleLayout
export default SelectedOrder

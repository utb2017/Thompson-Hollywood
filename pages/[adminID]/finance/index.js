import dynamic from "next/dynamic"
import ConsoleLayout from "../../../layouts/ConsoleLayout"
import Spinner from "../../../components/Buttons/Spinner"
import { Console } from "../../../components/Console"
import { useUser } from "../../../context/userContext"
import { useRouting } from "../../../context/routingContext"
import { useFirestoreQuery } from "../../../hooks/useFirestoreQuery"
import { useEffect } from "react"
import { useRouter } from "next/router"
import firebase from "../../../firebase/clientApp"


import { styled } from "baseui";

const Background = styled("div", ({ $theme }) => {
  return {
    backgroundColor: $theme.colors.backgroundOverlayLight,
  };
});
const FinancePage = dynamic(
  () => import("../../../components/Pages/Finance/index"),
  {
    loading: () => (
      <Background className='nav-loader'>
        <Spinner />
      </Background>
    ),
  }
)

const index = () => {
  const { user, fireCollection, fireUser } = useUser()
  const blackList = ["driver"]
  const { setNavLoading } = useRouting()
  const router = useRouter()
  useEffect(() => {
    setNavLoading(false)
  }, [])


  return (
    <Console
      id='finance-page'
      title={`Finance`}
      noNav={true}
      >

      {/* LOADING */}
      {Boolean(fireUser?.status === 'loading') && (
        <div className='nav-loader'>
          <Spinner />
        </div>
      )}

      {/* OUTLET */}
      {
       Boolean( fireUser?.data?.role) &&  
       Boolean(!blackList.includes(fireUser?.data?.role || "") ) && (
        <FinancePage />
      )}


      {/* ERROR */}
      {Boolean(fireUser?.error) && (
        <div className='nav-denied'>
          <h2>Error has occured.</h2>
        </div>
      )}


      {/* Not Found */}
      {Boolean(fireUser?.status === 'success') && 
        !Boolean(blackList.includes(fireUser?.data?.role || "")) && 
        !Boolean(fireUser?.data) && (
        <div className='nav-denied'>
          <h2>Data not found.</h2>
        </div>
      )}


      {/* DENIED */}
      {Boolean(
        fireUser?.data?.role && blackList.includes(fireUser?.data?.role || "")
      ) && (
        <div className='nav-denied'>
          <h2>Permision Denied</h2>
        </div>
      )}
    </Console>
  )
}

index.Layout = ConsoleLayout
export default index

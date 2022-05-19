import dynamic from "next/dynamic"
import ConsoleLayout from "../../../layouts/ConsoleLayout"
import Spinner from "../../../components/Buttons/Spinner"
import { Console } from "../../../components/Console"
import { useUser } from "../../../context/userContext"
import { useRouting } from "../../../context/routingContext"
import { useEffect } from "react"
import { useFirestoreQuery } from "../../../hooks/useFirestoreQuery"
import firebase from "../../../firebase/clientApp"
import { capitalize, isCurr, isNum } from "../../../helpers"
import { useRouter } from "next/router"


import { styled } from "baseui";

const Background = styled("div", ({ $theme }) => {
  return {
    backgroundColor: $theme.colors.backgroundOverlayLight,
  };
});
const UsersPage = dynamic(() => import("../../../components/Pages/Users/Users"), {
  loading: () => (
    <Background className='nav-loader'>
      <Spinner />
    </Background>
  ),
})
const index = () => {
  const { user, fireUser } = useUser()
  const blackList = ["driver"]
  const { setNavLoading } = useRouting()
  const router = useRouter()
  useEffect(() => {
    setNavLoading(false)
  }, [])

  const fireCollectionsTotal = useFirestoreQuery(
    user?.uid && firebase.firestore().collection("totals").doc("users")
  )

  const collectionTotal = isNum(fireCollectionsTotal.data?.[router.query.role]) 
  const links = [
    {
      label: `Customers (${fireCollectionsTotal.data?.['customer']||0})`,
      href: "/[adminID]/users/[role]",
      as: `/${user?.uid}/users/customer`,
    },
    {
      label: `Drivers (${fireCollectionsTotal.data?.['driver']||0})`,
      href: "/[adminID]/users/[role]",
      as: `/${user?.uid}/users/driver`,
    },
    {
      label: `Dispatchers (${fireCollectionsTotal.data?.['dispatcher']||0})`,
      href: "/[adminID]/users/[role]",
      as: `/${user?.uid}/users/dispatcher`,
    },
    {
      label: `Managers (${fireCollectionsTotal.data?.['manager']||0})`,
      href: "/[adminID]/users/[role]",
      as: `/${user?.uid}/users/manager`,
    },
    {
      label: `Pending (${fireCollectionsTotal.data?.['pending']||0})`,
      href: "/[adminID]/users/[role]",
      as: `/${user?.uid}/users/pending`,
    },
  ]

  return (
    <Console id='users-page' title={"Users"} links={links}>
      {/* LOADING */}
      {!Boolean(fireUser?.data?.role) && (
        <div className='nav-loader'>
          <Spinner />
        </div>
      )}
      {/* OUTLET */}
      {Boolean(
        fireUser?.data?.role && !blackList.includes(fireUser?.data?.role || "")
      ) && <UsersPage fireCollectionsTotal={fireCollectionsTotal} />}

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

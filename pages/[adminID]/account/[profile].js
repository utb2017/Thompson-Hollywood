import ConsoleLayout from "../../../layouts/ConsoleLayout"
import { Console } from "../../../components/Console"
import dynamic from "next/dynamic"
import { useRouter } from "next/router"
import Spinner from "../../../components/Buttons/Spinner"
import firebase from "../../../firebase/clientApp"
import { useUser } from "../../../context/userContext"
import { useFirestoreQuery } from "../../../hooks/useFirestoreQuery"
import { useRouting } from "../../../context/routingContext"
import { useEffect } from "react"
import { styled } from "baseui";

const Background = styled("div", ({ $theme }) => {
  return {
    backgroundColor: $theme.colors.backgroundOverlayLight,
  };
});

const ProfilePage = dynamic(
  () => import("../../../components/Pages/Account/Profile"),
  {
    loading: () => (
      <Background className='nav-loader'>
        <Spinner />
      </Background>
    ),
  }
)
// const OrdersPage = dynamic(
//   () => import("../../../components/Pages/UserEdit/Orders"),
//   {
//     loading: () => (
//       <div className='nav-loader'>
//         <Spinner />
//       </div>
//     ),
//   }
// )
const ProfileRouter = ({ profile, fireUser }) => {
  switch (profile) {
    case "profile":
      return <ProfilePage filter={['role','status']} noDelete={true} fireCustomer={fireUser}  />
    // case "orders":
    //   return <OrdersPage fireCustomer={fireUser} />
    default:
      return <div>Error</div>
  }
}
const Settings = () => {
  const router = useRouter()
  const { user, fireUser } = useUser()
  const blackList = []
  const { setNavLoading } = useRouting()

  useEffect(() => {
    //alert('hey')
    setNavLoading(false)
  }, [])



  const navLinks = [
    {
      label: "Profile",
      href: "/[adminID]/account/[profile]",
      as: `/${user?.uid}/account/profile`,
    },
    {
      label: "Orders",
      href: "/[adminID]/account/[profile]",
      as: `/${user?.uid}/account/orders`,
    },
  ]
  return (
    <>
      <Console
        id={`profile_page`}
        noNav={true}
        title={`${
          fireUser?.data?.displayName ||
          fireUser?.data?.phoneNumber ||
          "Profile"
        }`}
        //links={navLinks}
        //back={`/${user?.uid}/users/customer`}
        >


        {/* LOADING */}
        {Boolean(fireUser?.status !== 'success') && 
         Boolean(fireUser?.status !== 'success') && (
          <div className='nav-loader'>
            <Spinner />
          </div>
        )}
        {/* OUTLET */}
        {Boolean(fireUser?.data?.role) && 
         Boolean(!blackList.includes(fireUser?.data?.role || "")) && 
         Boolean(fireUser?.data?.uid) && (
          <ProfileRouter
            profile={router?.query?.profile}
            {...{ fireUser }}
          />
        )}

        {/* NO DATA */}
        {Boolean(fireUser?.data?.role) && 
         Boolean(fireUser?.status === 'success') && 
         !Boolean(blackList.includes(fireUser?.data?.role || "")) && 
         !Boolean(fireUser?.data?.uid) && (
          <div className='nav-denied'>
            <h2>Data not found.</h2>
          </div>
        )}

        {/* DENIED */}
        {Boolean(fireUser?.data?.role) && 
         Boolean(fireUser?.status === 'success') && 
         Boolean(blackList.includes(fireUser?.data?.role || "")
        ) && (
          <div className='nav-denied'>
            <h2>Permision Denied</h2>
          </div>
        )}
      </Console>
    </>
  )
}

Settings.Layout = ConsoleLayout
export default Settings

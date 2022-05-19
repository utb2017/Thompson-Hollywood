import ConsoleLayout from "../../../../../layouts/ConsoleLayout"
import { Console } from "../../../../../components/Console"
import dynamic from "next/dynamic"
import { useRouter } from "next/router"
import Spinner from "../../../../../components/Buttons/Spinner"
import firebase from "../../../../../firebase/clientApp"
import { useUser } from "../../../../../context/userContext"
import { useFirestoreQuery } from "../../../../../hooks/useFirestoreQuery"
import { useRouting } from "../../../../../context/routingContext"
import { useEffect } from "react"
import { fake } from "faker"


import { styled } from "baseui";

const Background = styled("div", ({ $theme }) => {
  return {
    backgroundColor: $theme.colors.backgroundOverlayLight,
  };
});

const ProfilePage = dynamic(
  () => import("../../../../../components/Pages/Users/UserEdit"),
  {
    loading: () => (
      <Background className='nav-loader'>
        <Spinner />
      </Background>
    ),
  }
)
const FinancePage = dynamic(
  () => import("../../../../../components/Pages/Users/UserFinance"),
  {
    loading: () => (
      <Background className='nav-loader'>
        <Spinner />
      </Background>
    ),
  }
)
const OrdersPage = dynamic(
  () => import("../../../../../components/Pages/Users/UserFinance"),
  {
    loading: () => (
      <Background className='nav-loader'>
        <Spinner />
      </Background>
    ),
  }
)
const DiscountsPage = dynamic(
  () => import("../../../../../components/Pages/Users/UserDiscounts"),
  {
    loading: () => (
      <Background className='nav-loader'>
        <Spinner />
      </Background>
    ),
  }
)
const CreditsPage = dynamic(
  () => import("../../../../../components/Pages/Users/UserCredit"),
  {
    loading: () => (
      <Background className='nav-loader'>
        <Spinner />
      </Background>
    ),
  }
)
const ProfileRouter = ({ profile, fireCustomer }) => {
  switch (profile) {
    case "profile":
      return <ProfilePage {...{ fireCustomer }} />
    case "orders":
      return <OrdersPage {...{ fireCustomer }} />
    case "discounts":
      return <DiscountsPage {...{ fireCustomer }} />
    case "credits":
      return <CreditsPage {...{ fireCustomer }} />
    case "finance":
      return <FinancePage view={'History'}  {...{ fireCustomer }} />
    default:
      return <div>Error</div>
  }
}
const Settings = () => {
  const router = useRouter()
  const { user, fireUser, setCustomerID, fireCustomer } = useUser()
  const blackList = ["driver"]
  const { setNavLoading } = useRouting()

  useEffect(() => {
    setNavLoading(false)
  }, [])


  useEffect(() => {
    //alert(router?.query?.id)
    setCustomerID(router?.query?.id)
    return () => {
      setCustomerID(null)
    };
  }, [router]);


  // const fireCustomer = useFirestoreQuery(
  //   user?.uid &&
  //     router?.query?.id &&
  //     firebase.firestore().collection("users").doc(router?.query?.id)
  // )

  const navLinks = [
    {
      label: "Profile",
      href: "/[adminID]/users/edit/[id]/[profile]",
      as: `/${user?.uid}/users/edit/${router?.query?.id}/profile`,
    },
    {
      label: "Credits",
      href: "/[adminID]/users/edit/[id]/[profile]",
      as: `/${user?.uid}/users/edit/${router?.query?.id}/credits`,
    },
    {
      label: "Settled Orders",
      href: "/[adminID]/users/edit/[id]/[profile]",
      as: `/${user?.uid}/users/edit/${router?.query?.id}/finance`,
    },
    {
      label: "Used Discounts",
      href: "/[adminID]/users/edit/[id]/[profile]",
      as: `/${user?.uid}/users/edit/${router?.query?.id}/discounts`,
    },
    // {
    //   label: "Active Totals",
    //   href: "/[adminID]/users/edit/[id]/[profile]",
    //   as: `/${user?.uid}/users/edit/${router?.query?.id}/orders`,
    // },
    // {
    //   label: "Discount Blacklist",
    //   href: "/[adminID]/users/edit/[id]/[profile]",
    //   as: `/${user?.uid}/users/edit/${router?.query?.id}/discounts`,
    // },
  ]
  return (
    <>
      <Console
        id={`profile_page`}
        title={`${
          fireCustomer?.data?.displayName ||
          fireCustomer?.data?.phoneNumber ||
          "Profile"
        }`}
        links={navLinks}
        back={`/${user?.uid}/users/customer`}>


        {/* LOADING */}
        {Boolean(fireUser?.status !== 'success') && 
         Boolean(fireCustomer?.status !== 'success') && (
          <div className='nav-loader'>
            <Spinner />
          </div>
        )}
        {/* OUTLET */}
        {Boolean(fireUser?.data?.role) && 
         Boolean(!blackList.includes(fireUser?.data?.role || "")) && 
         Boolean(fireCustomer?.data?.uid) && (
          <ProfileRouter
            profile={router?.query?.profile}
            {...{ fireCustomer }}
          />
        )}

        {/* NO DATA */}
        {Boolean(fireUser?.data?.role) && 
         Boolean(fireCustomer?.status === 'success') && 
         !Boolean(blackList.includes(fireUser?.data?.role || "")) && 
         !Boolean(fireCustomer?.data?.uid) && (
          <div className='nav-denied'>
            <h2>Data not found.</h2>
          </div>
        )}

        {/* DENIED */}
        {Boolean(fireUser?.data?.role) && 
         Boolean(fireCustomer?.status === 'success') && 
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

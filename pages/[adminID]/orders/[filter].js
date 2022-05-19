import dynamic from "next/dynamic"
import ConsoleLayout from "../../../layouts/ConsoleLayout"
import Spinner from "../../../components/Buttons/Spinner"
import { Console } from "../../../components/Console"
import { useUser } from "../../../context/userContext"
import { useRouting } from "../../../context/routingContext"
import { useEffect } from "react"
import { useRouter } from "next/router"


import { styled } from "baseui";

const Background = styled("div", ({ $theme }) => {
  return {
    backgroundColor: $theme.colors.backgroundOverlayLight,
  };
});
const OrdersPage = dynamic(() => import("../../../components/Pages/Orders/Orders"), {
  loading: () => (
    <Background className='nav-loader'>
      <Spinner />
    </Background>
  ),
})
const index = () => {
  const { user, fireUser, fireTotals, fireOrders, fireSettings, fireTotalsUnsettled } = useUser()
  const blackList = []
  const { setNavLoading } = useRouting()
  const router = useRouter()

  useEffect(() => {
    setNavLoading(false)
  }, [])

  const links = [
    {
      label: `(${fireUser?.data?.role === 'driver' ? (fireUser?.data?.activeOrders || 0) : (
        + (fireTotalsUnsettled?.data?.pending || 0)
        + (fireTotalsUnsettled?.data?.assigned || 0)
        + (fireTotalsUnsettled?.data?.pickup || 0)
        + (fireTotalsUnsettled?.data?.warning || 0)
        + (fireTotalsUnsettled?.data?.arrived || 0)
        + (fireTotalsUnsettled?.data?.received || 0)
      )}) Active`,
      href: "/[adminID]/orders/[filter]",
      as: `/${user?.uid}/orders/active`,
    },
    {
      label: `(${fireUser?.data?.role === 'driver' ? (fireUser?.data?.completeOrders || 0) : (fireTotalsUnsettled?.data?.complete || 0)}) Unpaid`,
      href: "/[adminID]/orders/[filter]",
      as: `/${user?.uid}/orders/complete`,
    },
    {
      label: `(${fireUser?.data?.role === 'driver' ? (fireUser?.data?.paidOrders || 0) : (fireTotalsUnsettled?.data?.paid || 0)}) Paid`,
      href: "/[adminID]/orders/[filter]",
      as: `/${user?.uid}/orders/paid`,
    },
    // {
    //   label: `(${fireUser?.data?.role === 'driver' ? (fireUser?.data?.cancelOrders || 0) : (fireTotalsUnsettled?.data?.cancel || 0)}) Canceled`,
    //   href: "/[adminID]/orders/[filter]",
    //   as: `/${user?.uid}/orders/cancel`,
    // }
  ]

  if(fireUser?.data?.role === 'driver'){
    links.pop()
  }

  return (
    <Console id='orders-page' title={('displayName' in router.query)?router?.query?.displayName:"Orders"} links={links}>
      {/* LOADING */}
      {Boolean(fireUser?.status === "loading") && (
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
      {Boolean(fireUser?.data) &&
        Boolean(fireUser?.data?.role && !blackList.includes(fireUser?.data?.role || "")) && (
          <OrdersPage {...{ fireUser }} {...{ fireTotals }} {...{ fireSettings }} />
        )}

      {/* NO DATA */}
      {Boolean(fireUser?.status === "success") && !Boolean(fireUser?.data) && (
        <div className='nav-denied'>
          <h2>User data not found.</h2>
        </div>
      )}

      {/* ERROR */}
      {Boolean(fireUser?.status === "error") && (
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
    </Console>
  )
}
index.Layout = ConsoleLayout
export default index

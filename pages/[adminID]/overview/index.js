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
const OverviewPage = dynamic(() => import("../../../components/Pages/Overview"), {
  loading: () => (
    <Background className='nav-loader'>
      <Spinner />
    </Background>
  ),
})
const index = () => {
  const { fireUser } = useUser()
  const blackList = []
  const { setNavLoading } = useRouting()
  const router = useRouter()

  useEffect(() => {
    setNavLoading(false)
  }, [])



  return (
    <Console id='orders-page' title={"Overview"} noNav={true} >
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
          <OverviewPage />
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

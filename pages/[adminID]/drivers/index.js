import dynamic from "next/dynamic"
import ConsoleLayout from "../../../layouts/ConsoleLayout"
import Spinner from "../../../components/Buttons/Spinner"
import { useUser } from "../../../context/userContext"
import { useEffect } from "react"
import { useRouting } from "../../../context/routingContext"

import { styled } from "baseui";

const Background = styled("div", ({ $theme }) => {
  return {
    backgroundColor: $theme.colors.backgroundOverlayLight,
  };
});
const DriversPage = dynamic(() => import("../../../components/Pages/Drivers"), {
  loading: () => (
    <Background className='nav-loader'>
      <Spinner />
    </Background>
  ),
})
const index = () => {
  const { fireUser } = useUser()
  const blackList = ["driver"]
  const { setNavLoading } = useRouting()
  useEffect(() => {
    setNavLoading(false)
  }, [])
  return (
    <>
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
          <DriversPage />
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

    </>
  )
}
index.Layout = ConsoleLayout
export default index

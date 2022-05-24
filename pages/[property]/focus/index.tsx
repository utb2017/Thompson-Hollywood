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
const OverviewPage = dynamic(() => import("../../../components/Pages/Focus"), {
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
    <Console id='orders-page' title={"Daily Focus"} noNav={true} >
      {/* LOADING */}
      <OverviewPage />
    </Console>
  )
}
index.Layout = ConsoleLayout
export default index

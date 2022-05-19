import dynamic from "next/dynamic"
import ConsoleLayout from "../../../layouts/ConsoleLayout"
import Spinner from "../../../components/Buttons/Spinner"
import { Console } from "../../../components/Console"
import { useUser } from "../../../context/userContext"
import { useRouting } from "../../../context/routingContext"
import { useEffect } from "react"

import { styled } from "baseui";

const Background = styled("div", ({ $theme }) => {
  return {
    backgroundColor: $theme.colors.backgroundOverlayLight,
  };
});


const CollectionsPage = dynamic(
  () => import("../../../components/Pages/Collection/Collection"),
  {
    loading: () => (
      <Background className='nav-loader'>
        <Spinner />
      </Background>
    ),
  }
)



const index = () => {
  const { user, fireUser } = useUser()
  const blackList = ["driver"]
  const { setNavLoading } = useRouting()
  const discountLinks = [
    {
      label: 'Collections',
      href: '/[adminID]/menu/[sort]',
      as: `/${user?.uid}/menu/collections`,
    },
    {
      label: 'Brands',
      href: '/[adminID]/menu/[sort]',
      as: `/${user?.uid}/menu/brands`,
    }
  ]
  useEffect(() => {
    setNavLoading(false)
  }, [])
  return (
    <Console
      id='collections-page'
      title={"Collections"}
      noNav={true}
      //links={discountLinks}
      >
      {/* LOADING */}
      {( fireUser?.status === "loading" ) && (
        <div className='nav-loader'>
          <Spinner />
        </div>
      )}
      {/* OUTLET */}
      {fireUser?.status === "success" && Boolean(
        fireUser?.data?.role && !blackList.includes(fireUser?.data?.role || "")
      ) && <CollectionsPage />}

      {/* DENIED */}
      {fireUser?.status === "success" && Boolean(
        fireUser?.data?.role && blackList.includes(fireUser?.data?.role || "")
      ) && (
        <div className='nav-denied'>
          <h2>Permision Denied</h2>
        </div>
      )}
      {/* ERROR */}
      {fireUser?.status === "error" && Boolean(fireUser?.error) && (
        <div className='nav-denied'>
          <h2>Error has occured.</h2>
          <p>{`${fireUser?.error}`}</p>
        </div>
      )}
    </Console>
  )
}
index.Layout = ConsoleLayout
export default index

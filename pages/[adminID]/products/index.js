import dynamic from "next/dynamic"
import ConsoleLayout from "../../../layouts/ConsoleLayout"
import Spinner from "../../../components/Buttons/Spinner"
import { Console } from "../../../components/Console"
import { useUser } from "../../../context/userContext"
import { useState, useEffect } from "react"
import { capitalize } from "../../../helpers"
import { useRouting } from "../../../context/routingContext"
import { useRouter } from "next/router"


import { styled } from "baseui";

const Background = styled("div", ({ $theme }) => {
  return {
    backgroundColor: $theme.colors.backgroundOverlayLight,
  };
});
const ProductsPage = dynamic(
  () => import("../../../components/Pages/Product/Products"),
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
  const [links, setLinks] = useState([])
  const blackList = ["driver"]
  const { setNavLoading } = useRouting()
  const router = useRouter()
  useEffect(() => {
    setNavLoading(false)
  }, [])
  // useEffect(() => {
  //   const tempLinks = []
  //   for (const key in fireCollection) {
  //     const link = fireCollection[key]
  //     const obj = {
  //       label: capitalize(link),
  //       href: "/[adminID]/products/[collection]",
  //       as: `/${user?.uid}/products/${link}`,
  //     }
  //     tempLinks.push(obj)
  //   }
  //   setLinks(tempLinks)
  // }, [fireCollection, user])
  return (
    <Console id='product-page' title={"Products"} 
    noNav={true}
    // crumbs={[
    //   {
    //     href: "/[adminID]/overview",
    //     as: `/${user?.uid}/overview`,
    //     label: "Home",
    //   },
    // ]}
    >

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
          <ProductsPage />
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

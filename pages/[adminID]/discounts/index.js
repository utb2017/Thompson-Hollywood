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
import {
  Label1,
  Label2,
  Label3,
  Label4,
  Paragraph1,
  Paragraph2,
  Paragraph3,
  Paragraph4,H1, H2, H3, H4, H5, H6
} from 'baseui/typography';

import { styled } from "baseui";

const Background = styled("div", ({ $theme }) => {
  return {
    backgroundColor: $theme.colors.backgroundOverlayLight,
  };
});
const FinancePage = dynamic(
  () => import("../../../components/Pages/Discount/Discounts"),
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
      title={`Discounts`}
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
          <H2>Error has occured.</H2>
        </div>
      )}


      {/* Not Found */}
      {Boolean(fireUser?.status === 'success') && 
        !Boolean(blackList.includes(fireUser?.data?.role || "")) && 
        !Boolean(fireUser?.data) && (
        <div className='nav-denied'>
          <H2>Data not found.</H2>
        </div>
      )}


      {/* DENIED */}
      {Boolean(
        fireUser?.data?.role && blackList.includes(fireUser?.data?.role || "")
      ) && (
        <div className='nav-denied'>
          <H2>Permision Denied</H2>
        </div>
      )}
    </Console>
  )
}

index.Layout = ConsoleLayout
export default index

// import dynamic from "next/dynamic"
// import ConsoleLayout from "../../../layouts/ConsoleLayout"
// import Spinner from "../../../components/Buttons/Spinner"
// import { Console } from "../../../components/Console"
// import { useUser } from "../../../context/userContext"
// import { useRouting } from "../../../context/routingContext"
// import { useEffect } from "react"


// const DiscountsPage = dynamic(
//   () => import("../../../components/Pages/Products"),
//   {
//     loading: () => (
//       <div className='nav-loader'>
//         <Spinner />
//       </div>
//     ),
//   }
// )



// const index = () => {
//   const { user, fireUser } = useUser()
//   const blackList = ["driver"]
//   const { setNavLoading } = useRouting()
//   // const discountLinks = [
//   //   {
//   //     label: 'Coupons',
//   //     href: '/[adminID]/discounts/[sort]',
//   //     as: `/${user?.uid}/discounts/coupon`,
//   //   },
//     // {
//     //   label: 'Sale',
//     //   href: '/[adminID]/discounts/[sort]',
//     //   as: `/${user?.uid}/discounts/sale`,
//     // },
//     // {
//     //   label: 'Credits',
//     //   href: '/[adminID]/discounts/[sort]',
//     //   as: `/${user?.uid}/discounts/credit`,
//     // }
//   // ]
//   useEffect(() => {
//     setNavLoading(false)
//   }, [])
//   return (<div>
    
//     <Console
//       //id='discounts-page'
//       //title={"Discounts"}
//       id='product-page' 
//       title={"Discounts"}
//       //noNav={true}
//       crumbs={[
//         {
//           href: "/[adminID]/overview",
//           as: `/${user?.uid}/overview`,
//           label: "Home",
//         },
//       ]}
//       //links={discountLinks}
//       >
//       {/* LOADING */}
//       {( fireUser?.status === "loading" ) && (
//         <div className='nav-loader'>
//           <Spinner />
//         </div>
//       )}
//       {/* OUTLET */}
//       {fireUser?.status === "success" && Boolean(
//         fireUser?.data?.role && !blackList.includes(fireUser?.data?.role || "")
//       ) && <DiscountsPage />}

//       {/* DENIED */}
//       {fireUser?.status === "success" && Boolean(
//         fireUser?.data?.role && blackList.includes(fireUser?.data?.role || "")
//       ) && (
//         <div className='nav-denied'>
//           <H2>Permision Denied</H2>
//         </div>
//       )}
//       {/* ERROR */}
//       {fireUser?.status === "error" && Boolean(fireUser?.error) && (
//         <div className='nav-denied'>
//           <H2>Error has occured.</H2>
//           <p>{`${fireUser?.error}`}</p>
//         </div>
//       )}
//     </Console>
//     </div>
//   )
// }
// index.Layout = ConsoleLayout
// export default index

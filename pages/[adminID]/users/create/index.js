import dynamic from "next/dynamic"
import ConsoleLayout from "../../../../layouts/ConsoleLayout"
import Spinner from "../../../../components/Buttons/Spinner"
import { Console } from "../../../../components/Console"
import { useUser } from "../../../../context/userContext"
import { useRouting } from "../../../../context/routingContext"
import { useEffect } from "react"


import { styled } from "baseui";

const Background = styled("div", ({ $theme }) => {
  return {
    backgroundColor: $theme.colors.backgroundOverlayLight,
  };
});
const UserCreatePage = dynamic(
  () => import("../../../../components/Pages/UserCreate"),
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
  useEffect(() => {
    setNavLoading(false)
  }, [])
  return (
    <Console
      id='user-create-page'
      title={"Create User"}
      back={`/${user?.uid}/users/customer`}
      crumbs={[
        {
          href: "/[adminID]/users/customer",
          as: `/${user?.uid}/users/customer`,
          label: "Users",
        },
      ]}>
      {/* LOADING */}
      {!Boolean(fireUser?.data?.role) && (
        <div className='nav-loader'>
          <Spinner />
        </div>
      )}

      {/* OUTLET */}
      {Boolean(
        fireUser?.data?.role && !blackList.includes(fireUser?.data?.role || "")
      ) && <UserCreatePage />}

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

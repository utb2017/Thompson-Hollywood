// import dynamic from "next/dynamic";
import ConsoleLayout from "../../../components/Console/ConsoleLayout";
import { Console } from "../../../components/Console";
import { useRouting } from "../../../context/routingContext";
import { useEffect, useState } from "react";
// import { styled } from "baseui";
import { useRouter } from "next/router";
// import { Spinner } from "baseui/spinner";
import StaticVIPsPage from "../../../components/Pages/VIPS"


// const Background = styled("div", ({ $theme }) => {
//   return {
//     backgroundColor: $theme.colors.backgroundOverlayLight,
//   };
// });
// const VIPsPage = dynamic(() => import("../../../components/Pages/VIPS"), {
//   loading: () => (
//     <Background className="nav-loader">
//       <Spinner />
//     </Background>
//   ),
// });
const index = () => {
  const { setNavLoading } = useRouting();
  const router = useRouter();
  
  const [linkList, setLinkList] = useState([]);



  useEffect(() => {
    //alert(router?.query?.property)
    setNavLoading(false);
    if(router?.query?.property){
      const links = [
        {
          label: `Arriving`,
          href: "/[property]/vip/[filter]",
          as: `/${router?.query?.property}/vip/arriving`,
        },
        {
          label: `In House`,
          href: "/[property]/vip/[filter]",
          as: `/${router?.query?.property}/vip/inhouse`,
        },
        {
          label: `Due Out`,
          href: "/[property]/vip/[filter]",
          as: `/${router?.query?.property}/vip/dueout`,
        },
        {
          label: `All`,
          href: "/[property]/vip/[filter]",
          as: `/${router?.query?.property}/vip/all`,
        },
      ];
      setLinkList(links)
    }else{
      setLinkList([])
    }
    
  }, [router]);



  return (
    <Console id="orders-page" title={`VIP's`} links={linkList}>
      {/* <VIPsPage /> */}
      <StaticVIPsPage />
    </Console>
  );
};
index.Layout = ConsoleLayout;
export default index;

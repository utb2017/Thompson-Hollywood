// import dynamic from "next/dynamic";
import ConsoleLayout from "../../../components/Console/ConsoleLayout";
import { Console } from "../../../components/Console";
import { useRouting } from "../../../context/routingContext";
import { useEffect, useState } from "react";
// import { styled } from "baseui";
import { useRouter } from "next/router";
// import { Spinner } from "baseui/spinner";
import StaticReportsPage from "../../../components/Pages/Reports"



const index = () => {
  const { setNavLoading } = useRouting();
  const router = useRouter();
  


  useEffect(() => {
    //alert(router?.query?.property)
    setNavLoading(false);
    
  }, [router]);



  return (
    <Console id="orders-page" title={`Reports`}>
      {/* <VIPsPage /> */}
      <StaticReportsPage />
    </Console>
  );
};
index.Layout = ConsoleLayout;
export default index;

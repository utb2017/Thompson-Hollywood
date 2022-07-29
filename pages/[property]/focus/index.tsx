// import dynamic from "next/dynamic";
import ConsoleLayout from "../../../components/Console/ConsoleLayout";
import { Console } from "../../../components/Console";
import { useRouting } from "../../../context/routingContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import StaticDailyFocus from "../../../components/Pages/Focus"


const index = () => {
  const { setNavLoading } = useRouting();
  useEffect(() => {
    setNavLoading(false);
  }, []);
  return (
    <Console id="orders-page" title={`Daily Focus`} >
      {/* <VIPsPage /> */}
      <StaticDailyFocus />
    </Console>
  );
};
index.Layout = ConsoleLayout;
export default index;

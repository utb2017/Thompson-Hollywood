import dynamic from "next/dynamic";
import ConsoleLayout from "../../../components/Console/ConsoleLayout";
import Spinner from "../../../TRASH/Buttons/Spinner";
import { Console } from "../../../components/Console";
import { useRouting } from "../../../context/routingContext";
import { useEffect } from "react";
import { styled } from "baseui";

const Background = styled("div", ({ $theme }) => {
  return {
    backgroundColor: $theme.colors.backgroundOverlayLight,
  };
});

const VIPsPage = dynamic(() => import("../../../components/Pages/VIPS"), {
  loading: () => (
    <Background className="nav-loader">
      <Spinner />
    </Background>
  ),
});
const index = () => {
  const { setNavLoading } = useRouting();

  useEffect(() => {
    setNavLoading(false);
  }, []);

  const links = [
    {
      label: `Arriving`,
      href: "/[property]/vip/[filter]",
      as: `/${`LAXTH`}/vip/arriving`,
    },
    {
      label: `In House`,
      href: "/[property]/vip/[filter]",
      as: `/${`LAXTH`}/vip/inhouse`,
    },
    {
      label: `Due Out`,
      href: "/[property]/vip/[filter]",
      as: `/${`LAXTH`}/vip/dueout`,
    },
    {
      label: `All`,
      href: "/[property]/vip/[filter]",
      as: `/${`LAXTH`}/vip/all`,
    },
  ];

  return (
    <Console id="orders-page" title={`VIP's`} links={links}>
      <VIPsPage />
    </Console>
  );
};
index.Layout = ConsoleLayout;
export default index;

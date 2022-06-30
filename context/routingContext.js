import { useState, createContext, useContext } from 'react'
//import Spinner from '../components/Buttons/Spinner'
import { styled } from "baseui";
import { Spinner } from "baseui/spinner";
export const RoutingContext = createContext()

const NavLoader = styled("div", ({ $theme, $isDark = false, $loading = true }) => {
  return {
    position: "fixed",
    top: 0,
    left: "256px",
    width: "calc(100% - 256px)",
    height: "100%",
    display: "flex",
    backgroundColor: $theme.colors.backgroundOverlayDark,
    zIndex: 2000,
    WebkitAnimationDuration: "0.2s",
    animationDuration: "0.2s",
    animationTimingFunction: "ease-in-out",
    animationFillMode: "forwards",
    WebkitAnimationName: $loading ? "fadeIn" : 'fadeOut', 
    animationName: $loading ? "fadeIn" : 'fadeOut',
    //opacity: $loading ? 1 : 0, 
    //visibility: $loading ? 'visible' : 'hidden',
    justifyContent: "center", 
    alignItems: "center",
    "@media (max-width: 919px)": { 
      left: "0", 
      width: "100%" },
    "@media (min-width: 1025px)": {
      left: "302px",
      width: "calc(100% - 302px)"
    },
    "@media (min-width: 1441px)": {
      left: "348px",
      width: "calc(100% - 348px)"
    },
    "@media (min-width: 2561px)": {
      left: "404px",
      width: "calc(100% - 404px)"
    },
    "@keyframes fadeIn": {
      "0%": { opacity: 0, visibility: "hidden" },
      "100%": { opacity: 1, visibility: "visible" }
    },
    "@keyframes fadeOut": {
      "0%": { opacity: 0, visibility: "hidden" },
      "100%": { opacity: 0, visibility: "hidden" }
    }
  };
});

export default function RoutingContextComp({ children }) {
  const [navLoading, setNavLoading] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [cartLoading, setCartLoading] = useState(false)
  return (
    <RoutingContext.Provider
      value={{ navLoading, setNavLoading, cartOpen, setCartOpen, cartLoading, setCartLoading }}>
      <>
        {children}

        <NavLoader $loading={navLoading} >
          <Spinner />
        </NavLoader>

      </>
    </RoutingContext.Provider>
  )
}
export const useRouting = () => useContext(RoutingContext)

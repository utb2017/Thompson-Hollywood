import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ActiveConsoleLink } from ".";
import { useStyletron } from "baseui";
import { styled } from "baseui";
import { HeadingMedium, LabelMedium, LabelSmall } from "baseui/typography";
import SVGIcon from "../SVGIcon";
//import { H5, Label1, Label4 } from "baseui/typography";

const FireNav = styled("div", ({ $theme }) => {
  return {
    borderRight: `1px solid ${$theme.borders.border600.borderColor}`,
  };
});
const FireLogoBox = styled("div", ({ $theme }) => {
  return {
    borderBottom: `1px solid ${$theme.borders.border600.borderColor}`,
    boxShadow: "unset",
    height: "48px",
    display: 'flex',
    width: '100%',
    justifyContent: "center",
  };
});
const LockContainer = styled("div", () => {
  return {
    marginBottom: "139px",
    borderBottom:'none'
  };
});
const NavHeader = styled("div", () => {
  return {
    paddingBottom:`10px`
  };
});
const NavList = styled("div", () => {
  return {
    borderBottom:'none'
  };
});
const Nav = styled("nav", ({ $theme }) => {
  return {
    backgroundColor: $theme.colors.backgroundPrimary
  };
});
const LogoLockBox = styled("div", ({ $theme }) => {
  return {
    padding: "0 20px",
    alignItems: 'center',
    display: 'flex',
    height: '48px',
  };
});
export default function ConsoleLayout({ children }) {

  const router = useRouter();
  const { asPath, pathname, query } = router;
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [css, theme] = useStyletron();

  useEffect(() => {
    if ("menu" in query) {
      setIsCollapsed(false);
    } else {
      setIsCollapsed(true);
    }
  }, [query]);

  return (
    <>
      <div
        style={{ backgroundColor: theme.colors.backgroundPrimary }}
        className={`console-home${"oid" in query || "page" in query ? ` split` : ``}`}
      >
        
        <FireNav className="fire-navbar">
          {!isCollapsed && (
            <Link href={`${pathname.split("?")[0]}`} as={`${asPath.split("?")[0]}`} scroll={false}>
              <div
                //onClick={() => setIsCollapsed(true)}
                className="mobile-backdrop"
              />
            </Link>
          )}
          <Nav className={`navbar${isCollapsed ? ` is-collapsed` : ``}`}>
            {/* LOGO */}
            {/* LOGO href={"/[adminID]/settings/store"} as={`/${user?.uid}/settings/store`} */}
            {/* <Link href={"/[adminID]/overview"} as={`/${user?.uid}/overview`} scroll={false}> */}
              <FireLogoBox
                className="firebase-logo-lockup fire-router-link-host"
                aria-label="Go to project list"
                style={{ cursor: "pointer" }}
              >
                <LogoLockBox> 
                  <Link href={"/"} scroll={false}> 
                    <HeadingMedium>{router?.query?.property === `LAXTH`?<SVGIcon size={'standard'} name={'thompsonMin'}/>:`tommie`}</HeadingMedium>
                  </Link>
                </LogoLockBox>
              </FireLogoBox>
            {/* </Link> */}
            {/*NAV-CONTAINER*/}
            <LockContainer className="nav-groups-container" role="tree" tabIndex={0}>
              {/* {fireUser?.status === "success" && fireCollections?.status === "success" ? ( */}
                <>
                  <NavList className="nav-group is-expanded">
                    <div className="group-header">
                      <NavHeader className="group-header-label">
                        <LabelMedium>{"REPORTS"}</LabelMedium>
                      </NavHeader>
                      <div>


                        <ActiveConsoleLink blackList={[]} name="shield" href={"/[property]/vip/[filter]"} as={`/${router?.query?.property}/vip/arriving`}>
                          VIP's
                        </ActiveConsoleLink>



                      </div>
                    </div>
                  </NavList>

                  </>
            </LockContainer>
            {/**/}
          </Nav>
        </FireNav>
        {children}
      </div>
    </>
  );
}

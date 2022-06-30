import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ActiveConsoleLink } from ".";
import { useStyletron } from "baseui";
import { styled } from "baseui";
import { HeadingMedium, LabelMedium, LabelSmall } from "baseui/typography";
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
                <div className="fire-logo-lockup">
                  {/**/}
                  {/* <img
                    className="fire-logo"
                    role="presentation"
                    src="https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/Logos%2FchyllLogo.png?alt=media&token=e97f8afe-3b0d-4f21-8d71-f320dcae2d05"
                    style={{ height: 28, marginRight:`12px` }}
                  /> */}
                  <Link href={"/"} scroll={false}> 
                  <HeadingMedium>{`${router?.query?.property === `LAXTH`?`Thompson`:`tommie`}`}</HeadingMedium>
                  </Link>
                  {/* <img
                    alt="Firebase logo"
                    className="firebase-logo-text"
                    src="https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/Logos%2FChyll-Admin.svg?alt=media&token=9d0e94b7-fbbe-4e2c-8fbd-224ac7fe2b19"
                    style={{}}
                  /> */}
                  <span style={{ color: "white", paddingLeft: "5px" }}><LabelSmall> {`${String.fromCharCode(160)} Beta `}</LabelSmall></span>
                </div>
              </FireLogoBox>
            {/* </Link> */}
            {/*NAV-CONTAINER*/}
            <LockContainer 
            //ref={lockRef} 
            className="nav-groups-container" role="tree" tabIndex={0}>
              {/* {fireUser?.status === "success" && fireCollections?.status === "success" ? ( */}
                <>
                  <NavList className="nav-group is-expanded">
                    <div className="group-header">
                      <NavHeader className="group-header-label">
                        <LabelMedium>{"REPORTS"}</LabelMedium>
                      </NavHeader>
                      <div>
                        {/* <ActiveConsoleLink blackList={[]} name="graph" href={"/[property]/focus"} as={`/${'LAXTH'}/focus`}>
                          Focus
                        </ActiveConsoleLink> */}

                        <ActiveConsoleLink blackList={[]} name="shield" href={"/[property]/vip/[filter]"} as={`/${router?.query?.property}/vip/arriving`}>
                          VIP's
                        </ActiveConsoleLink>

                        {/* <ActiveConsoleLink blackList={[]} name="personAdd" href={"/[property]/incidents"} as={`/${'LAXTH'}/incidents`}>
                          Groups
                        </ActiveConsoleLink>

                        <ActiveConsoleLink blackList={[]} name="ticket" href={"/[property]/incidents"} as={`/${'LAXTH'}/incidents`}>
                          Events
                        </ActiveConsoleLink>

                        <ActiveConsoleLink blackList={[]} name="warning" href={"/[property]/incidents"} as={`/${'LAXTH'}/incidents`}>
                          Incidents
                        </ActiveConsoleLink>    

                        <ActiveConsoleLink blackList={[]} name="calendar" href={"/[property]/incidents"} as={`/${'LAXTH'}/incidents`}>
                          14-day forecast
                        </ActiveConsoleLink>     */}
                        

  
                                                                
                        {/* <ActiveConsoleLink blackList={[]} name="homeFilled" href={"/[property]/focus"} as={`/${'LAXTH'}/focus`}>
                          House
                        </ActiveConsoleLink> */}
                        {/**/}

                      </div>
                    </div>
                  </NavList>
                  {/**/}

                  {/* <RootLinks className="root-links"> */}
                    {/**/}
                    {/* <ActiveConsoleLink
                      style={{
                        boxShadow: "0 -1px 0 rgba(255,255,255,0.1) inset",
                        display: "flex",
                        flex: "none",
                        height: "60px",
                      }}
                      name="account"
                      href={"/[adminID]/account/[profile]"}
                      as={`/${user?.uid}/account/profile`}
                    >
                      Account
                    </ActiveConsoleLink> */}
                                          {/* <Button
                      kind={KIND.tertiary}
                      startEnhancer={ <SVGIcon style={{ transform: "scale(1)" }} name={"account"} />}
                        onClick={() => router.push("/[adminID]/account/[profile]",`/${user?.uid}/account/profile`)}
                        //className="button-base root-link nav-item mat-tooltip-trigger fire-router-link-host ng-tns-c2-0 ng-star-inserted"
                        style={{ 
                          cursor:"pointer", 
                          width: "100%", 
                          paddingLeft:theme.sizing.scale950,
                          height:theme.sizing.scale1600,
                          justifyContent:`flex-start`,
                          borderBottom: `1px solid ${theme.borders.border600.borderColor}`,
                         }}
                      >
                        Account
                      </Button> */}
                    {/**/}
{/* 
                    {!user?.uid && (
                      <Link href={"/sign-in"} scroll={false}>
                        <a
                          className="root-link nav-item mat-tooltip-trigger fire-router-link-host ng-tns-c2-0 ng-star-inserted"
                          mattooltipposition="right"
                          //href='#'
                          style={{ cursor: "pointer" }}
                        >
                          <span className="gmp-icons" aria-hidden="true">
                            <SVGIcon style={{ transform: "scale(1)" }} color={"rgba(255,255,255,0.7)"} name={"logout"} />
                          </span>
                          <div className="link-name" style={{ marginTop: 0 }}>
                            Sign In
                          </div>
                        </a>
                      </Link>
                    )} */}
 {/* <Button onClick={() => alert("click")}>Hello</Button> */}
                    {/* {user?.uid && (
                      <Button
                        kind={KIND.tertiary}
                        startEnhancer={ <SVGIcon style={{ transform: "scale(1)" }} name={"logout"} />}
                        onClick={() => firebase.auth().signOut()}
                        //className="button-base root-link nav-item mat-tooltip-trigger fire-router-link-host ng-tns-c2-0 ng-star-inserted"
                        style={{ 
                          cursor:"pointer", 
                          width: "100%", 
                          paddingLeft:theme.sizing.scale950,
                          height:theme.sizing.scale1600,
                          justifyContent:`flex-start`
                         }} 
                      >
                        Logout
                      </Button>
                    )} */}

                    {/**/}
                  {/* </RootLinks> */}
                </>
              {/* ) : (
                <div className="center-spinner">
                  <Spinner />{" "}
                </div>
              )} */}
            </LockContainer>
            {/**/}
          </Nav>
        </FireNav>

        {children}
      </div>
    </>
  );
}

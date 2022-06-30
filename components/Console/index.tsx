import Link from "next/link";
import { useRouter } from "next/router";
import {
  useEffect,
  useState,
  useCallback,
  forwardRef,
  ReactElement,
} from "react";
import { useThrottle } from "@react-hook/throttle";
import SVGIcon from "../SVGIcon";
import { useRouting } from "../../context/routingContext";
import { capitalize, array_move, isCurr } from "../../helpers";
import { useStyletron } from "baseui";
import { Navigation } from "baseui/side-navigation";
import VIP_END_OF_DAY from "../Modals/VIP_END_OF_DAY";
import { Card } from "baseui/card";
import { Tabs, Tab } from "baseui/tabs-motion";
import { Label3, H4 } from "baseui/typography";
import { styled } from "baseui";
import { useScreen } from "../../context/screenContext";
import { useDispatchModalBase } from "../../context/Modal";

const FlexContainer = styled("div", () => {
  return {
    display: "flex",
    width: "100%",
  };
});
const IconSpan = styled("span", ({ $theme }) => {
  return {
    marginRight: $theme.sizing.scale400,
  };
});
const LabelSpan = styled("span", ({ $theme }) => {
  return {
    lineHeight: $theme.sizing.scale800,
  };
});
export const Feature = ({ children }) => {
  return (
    <div className="console-feature">
      <div className="console-feature-spacing">
        <div className="console-feature-content">{children}</div>
      </div>
    </div>
  );
};
export const Title = ({ title = "No Title" }: any) => {
  return (
    <div className="console-feature-title-row canvas-theme-container">
      <div className="console-feature-title-lockup stretch-across">
        <div className="console-feature-title">
          <div className="console-feature-title-text">{<H4>{title}</H4>}</div>
        </div>
      </div>
    </div>
  );
};
export const ActiveLink = ({ children, href, style, as, index }) => {
  const router = useRouter();
  //const { setNavLoading } = useRouting()
  return (
    <Link href={href} as={as} scroll={true}>
      <button
        //onClick={()=>setNavLoading(true)}
        tabIndex={index || 0}
        aria-disabled="false"
        aria-current="page"
        style={style}
        className={`button-base console-link-base link-tabs ${
          router.asPath === as ? "console-link-active" : ""
        }`}
      >
        {children}
      </button>
    </Link>
  );
};
export const ActiveConsoleLink = ({
  children,
  href = "/[adminID]/orders/[filter]",
  style = { cursor: "pointer" },
  as,
  index,
  name = "ordersFilled",
  blackList = [],
}: any) => {
  const router = useRouter();
  const { setNavLoading } = useRouting();
  //const { user, fireUser } = useUser()
  const { asPath, pathname } = router;

  return (
    <Navigation
      items={[
        {
          title: (
            <FlexContainer>
              {" "}
              <IconSpan>
                <SVGIcon style={{ transform: "scale(0.8)" }} name={name} />
              </IconSpan>
              <LabelSpan>{children}</LabelSpan>
            </FlexContainer>
          ),
          itemId: href,
          //as: as,
        },
      ]}
      activeItemId={pathname}
      onChange={({ event, item }) => {
        event.preventDefault();
        if (href === pathname) {
          return;
        }
        setNavLoading(true);
        router.push(`${item.itemId}`, `${as}`);
      }}
    />
  );
};
export const Nav = ({ links }) => {
  const [linkList, setLinkList] = useState([]);
  const router = useRouter();
  const [activeKey, setActiveKey] = useState(null);

  useEffect(() => {
    const tempLinks = [];
    for (const key in links) {
      const { as, label, href, role } = links[key];
      // if (role && !Boolean(role.includes(fireUser?.data?.role))) {
      //   return
      // }
      tempLinks.push(
        <Tab
          //style={{whiteSpace: "nowrap"}}
          overrides={{
            Tab: {
              style: ({ $theme }) => ({
                whiteSpace: "nowrap",
              }),
            },
          }}
          // onClick={(e) => {
          //   router.push(`${href}`, `${as}`)
          //   alert(`${href} ${as}`)
          // }}
          key={key}
          title={label}
        >
          <></>
        </Tab>
        // <ActiveLink key={key} index={key} href={href} as={as}>
        //   {label}
        // </ActiveLink>
      );
    }

    setLinkList(tempLinks);
  }, [links]);

  useEffect(() => {
    let i = 0;
    for (const key in links) {
      const { as } = links[key];
      const { asPath } = router;
      // alert(as)
      // alert(asPath)
      if (as === asPath) {
        //alert(`active ${i}`)
        setActiveKey(`${i}`);
      }
      i++;
    }
  }, [router, links]);

  useEffect(() => {
    return () => {
      setActiveKey(null);
    };
  }, []);
  return (
    <Tabs
      activeKey={`${activeKey}`}
      onChange={(props) => {
        //alert(JSON.stringify(props));
        if (props.activeKey === `0`) {
          let href = `/[property]/vip/[filter]`;
          let as = `/LAXTH/vip/arriving`;
          router.push(`${href}`, `${as}`);
        }
        if (props.activeKey === `1`) {
          let href = `/[property]/vip/[filter]`;
          let as = `/LAXTH/vip/inhouse`;
          router.push(`${href}`, `${as}`);
        }
        if (props.activeKey === `2`) {
          let href = `/[property]/vip/[filter]`;
          let as = `/LAXTH/vip/dueout`;
          router.push(`${href}`, `${as}`);
        }
        if (props.activeKey === `3`) {
          let href = `/[property]/vip/[filter]`;
          let as = `/LAXTH/vip/all`;
          router.push(`${href}`, `${as}`);
        }
      }}
      overrides={{
        TabBorder: {
          style: ({ $theme }) => ({ height: "2px" }),
        },
        TabHighlight: {
          style: ({ $theme }) => ({
            //outline: `${$theme.colors.primary} solid`,
            //borderTop:`solid`,
            //borderTopWidth:`8px`,
            //borderTopColor: $theme.colors.primary,
            //backgroundColor: `${$theme.colors.accent600}`,
            //background: `transparent`,
            //zIndex:950,
            //trasnform:`translateZ(42px)`,
            height: `3px`,
            bottom: `5px`,
          }),
        },
      }}
      activateOnFocus
      // overrides={{
      //   TabHighlight: {
      //     style: ({ $theme }) => ({
      //       outline: `${$theme.colors.warning600} solid`,
      //       backgroundColor: $theme.colors.warning600
      //     })
      //   }
      // }}
    >
      {/* <Tab title="First">Content 1</Tab>
        <Tab title="Second">Content 2</Tab>
        <Tab title="Third">Content 3</Tab> */}
      {linkList}
    </Tabs>
    // <div className='console-feature-tabs'>
    //   <nav className='console-feature-nav'>
    //     <ScrollTrack
    //     //styles={{Track: {height: '54px', padding: '10px 0'}}}
    //     >

    //      {linkList}

    //     </ScrollTrack>
    //   </nav>
    // </div>
  );
};
export const Crumbs = ({ crumbs = [], title = null }) => {
  const [links, setLinks] = useState([]);
  const { setNavLoading } = useRouting();
  const handleClick = () => {
    setNavLoading(true);
  };
  useEffect(() => {
    const tempCrumbs = [];
    if (crumbs.length) {
      for (const key in crumbs) {
        const { href, as, label } = crumbs[key];
        tempCrumbs.push(
          <li key={key}>
            <Link href={href} as={as}>
              <a onClick={handleClick}>{label}</a>
            </Link>
          </li>
        );
      }
    }
    if (title) {
      tempCrumbs.push(<li key={title}>{title}</li>);
    }
    setLinks(tempCrumbs);
  }, []);
  return (
    <div style={{ height: "46px" }}>
      <ul className="breadcrumb">{links}</ul>
    </div>
  );
};
const AppBar = styled("div", ({ $theme, $isScrolled }) => {
  return $isScrolled
    ? {
        borderBottom: `1px solid ${$theme.borders.border600.borderColor}`,
        backgroundColor: $theme.colors.background,
      }
    : undefined;
});
export const Header = ({
  title = "default",
  id = "console-header",
  isScrolled = false,
  back = false,
}: any) => {
  const [css, theme] = useStyletron();
  const router = useRouter();
  const { asPath, pathname } = router;
  //const { user } = useUser()
  const { setNavLoading } = useRouting();
  const { themeState, toggleTheme } = useScreen();
  const { modalBaseDispatch, modalBaseState } = useDispatchModalBase();
  const openModalBase = (
    component: () => ReactElement,
    hasSquareBottom: boolean
  ) => {
    modalBaseDispatch({
      type: "MODAL_UPDATE",
      payload: {
        modalBase: {
          isOpen: true,
          key: [],
          component,
          hasSquareBottom,
        },
      },
    });
  };
  const END_OF_DAY = () => {
    const component: () => ReactElement = () => <VIP_END_OF_DAY />;
    openModalBase(component, true);
  };

  return (
    <>
      <header id={id}>
        <div className="console-appbar-grid">
          <AppBar
            $isScrolled={isScrolled}
            //style={isScrolled?{backgroundColor:theme.colors.background}:undefined}
            //className={`console-appbar${isScrolled ? ` is-scrolled-void` : ''}`}
            className={`console-appbar`}
          >
            <div className="left-navigation">
              {!Boolean(back) && (
                <Link
                  href={`${pathname}?menu`}
                  as={`${asPath}?menu`}
                  scroll={false}
                >
                  <button aria-label="Open navigation Menu">
                    <span>
                      <SVGIcon
                        color={theme.colors.primary}
                        name={"menu"}
                        style={{ transform: "scale(1)" }}
                      />
                    </span>
                  </button>
                </Link>
              )}
              {
                Boolean(back) && (
                  //  <Link href={"/[adminID]/users/[users]"} as={`/${user?.uid}/users/customer`} scroll={false}>
                  <button
                    onClick={() => (
                      back ? router.push(back) : router.back(),
                      setNavLoading(true)
                    )}
                    className="visible"
                    aria-label="Open navigation Menu"
                  >
                    <span>
                      <SVGIcon
                        color={theme.colors.primary}
                        name={"arrowLeft"}
                        style={{ transform: "scale(1)" }}
                      />
                    </span>
                  </button>
                )
                // </Link>
              }
            </div>
            <div className="center-crumbs">
              <div className="appbar-crumbs">
                <div className={`animation${isScrolled ? ` is-scrolled` : ""}`}>
                  <span className="console-crumb">
                    <a href="#">
                      {<Label3>{title || "Missing Title"}</Label3>}
                    </a>
                  </span>
                </div>
              </div>
            </div>
            <div className="right-navigation" style={{ marginRight: "-15px" }}>
              <button onClick={toggleTheme} aria-label="Dark Mode Toggle">
                <span>
                  <SVGIcon
                    style={{ transform: "scale(1)" }}
                    color={theme.colors.primary}
                    name={themeState?.dark ? "lightbulbFilled" : "lightbulb"}
                  />
                </span>
              </button>
              {/* <Link href={`${pathname}?alert`} as={`${asPath}?alert`}> */}
              <button
                onClick={() => END_OF_DAY()}
                aria-label="Open Quick Settings"
              >
                <span>
                  <SVGIcon
                    style={{ transform: "rotate(90deg)" }}
                    color={theme.colors.primary}
                    name={"replacement"}
                  />
                </span>
              </button>
              {/* </Link> */}
            </div>
          </AppBar>
        </div>
      </header>
    </>
  );
};
export const Footer = ({ isShowing = true, children }) => {
  return (
    <div className={`fixed-bottom-console${isShowing ? ` showing` : ""}`}>
      {children}
    </div>
  );
};
export const Main = forwardRef(
  (
    {
      links = false,
      title = "No Title",
      crumbs,
      children,
      onScroll,
      id = "main-products",
      noNav = "false",
    }: any,
    ref: any
  ) => {
    const [scrollPos, setScrollPos] = useThrottle(0, 10, false);
    useEffect(() => {
      onScroll && onScroll(scrollPos);
    }, [scrollPos]);
    const handleScroll = useCallback((e) => {
      setScrollPos(e.currentTarget.scrollTop);
    }, []);
    return (
      <main
        {...{ id }}
        className="console-main canvas-theme-container"
        onScroll={handleScroll}
        ref={ref}
      >
        <Feature>
          {title && <Title {...{ title }} />}
          <div style={{ height: noNav ? "8px" : "46px" }}>
            {links && <Nav {...{ links }} />}
            {crumbs && <Crumbs {...{ crumbs }} {...{ title }} />}
          </div>
        </Feature>
        {children}
      </main>
    );
  }
);
export const Console = forwardRef(
  (
    {
      links,
      title = "No Title",
      crumbs = false,
      children,
      id = "console",
      back = false,
      noNav = false,
    }: any,
    ref
  ) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const handleScroll = useCallback(
      (scrollPos) => {
        if (scrollPos <= 0) {
          isScrolled && setIsScrolled(false);
        } else {
          !isScrolled && setIsScrolled(true);
        }
      },
      [isScrolled]
    );
    const props = { id, title, links, crumbs, noNav };
    return (
      <>
        <Header {...{ back }} isScrolled={isScrolled} {...{ title }} />
        <Main ref={ref} {...props} onScroll={handleScroll}>
          <div className="router-outlet">{children}</div>
        </Main>
      </>
    );
  }
);
export const PrimaryPane = ({
  children,
  id = "primary-pane",
  reverse = false,
  column = false,
  mountToBottom = <div />,
  style = undefined,
}) => {
  return (
    <>
      <div
        {...{ id }}
        {...{ style }}
        className={`primary-pane${reverse ? ` reverse` : ""}${
          column ? ` column` : ""
        }`}
      >
        {children}
      </div>
      {mountToBottom}
      <div style={{ width: "100%", height: "120px" }} />
    </>
  );
};
export const FormPane = ({
  children,
  id = "form-pane",
  noPadding = false,
  style = undefined,
}) => {
  return (
    <div {...{ id }} className="form-pane" {...{ style }}>
      {/* CARD  */}
      <Card
        overrides={{
          Root: {
            style: ({ $theme }) => ({ width: "100%" }),
          },
          Contents: {
            style: ({ $theme }) =>
              noPadding && { margin: `0px`, padding: `0px` },
          },
          Body: {
            style: ({ $theme }) => noPadding && { margin: `0px` },
          },
        }}
      >
        {children}
      </Card>
    </div>
  );
};
export const SidePane = ({
  children,
  id = "side-pane",
  title = undefined,
  style = undefined,
  innerStyle = undefined,
}) => {
  return (
    <div {...{ id }} {...{ style }} className="side-pane">
      <div className="side-pane-sticky">
        <Card>
          <div className="side-pane-box">
            <div className="side-pane-label">{title}</div>
            <div style={innerStyle} className="side-pane-flex">
              {children}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
export const FormInput = ({
  children,
  label = undefined,
  stack = false,
  style = undefined,
}) => {
  return (
    <div style={style} className="form-input-break">
      <div
        className={`form-input-label${stack ? ` stack` : ""}${
          !label ? ` no-label` : ""
        }`}
      >
        <span>{label}</span>
      </div>
      <div className="form-input">{children}</div>
    </div>
  );
};
export const FileInput = ({
  fileType = ["jpg", "jpeg", ".png"],
  text = "Add Image",
  onChange = undefined,
  onError = undefined,
  progress = 0,
}: any) => {
  const [fileName, setFileName] = useState(null);
  const fileError = {
    code: "invalid-file-type",
    message: "Invalid file type.",
  };
  const re = /(?:\.([^.]+))?$/;

  const handleChange = useCallback(
    (e) => {
      e.stopPropagation();
      let tempFile = null;
      let tempError = fileError;
      const ext = re.exec(e.target.files[0].name.toLowerCase())[1];
      if (fileType.includes(ext)) {
        //if (fileType.exec(e.target.files[0].name)) {
        console.log("valid file");
        tempFile = e.target.files[0];
        tempError = null;
      }
      onChange && onChange(e, tempFile);
      onError && onError(tempError);
      setFileName(tempFile?.name);
    },
    [fileType]
  );

  return (
    <>
      <div className={`upload-file-container${fileName ? ` has-file` : ``} `}>
        <span className="plus-sign">+</span>
        <span className="upload-file-label">
          {(progress && `${parseInt(progress)}%`) || fileName || text}
        </span>
        <input
          type="file"
          name="file"
          onChange={handleChange}
          disabled={progress > 0}
        />
      </div>
    </>
  );
};
export const FormSection = ({
  children,
  title = undefined,
  toggle = undefined,
}) => {
  return (
    <div className="form-pane-section">
      <div className="form-title-box">
        {title && <div className="form-card-title">{title}</div>}
        <div className="switch-position">{toggle}</div>
      </div>
      {children}
    </div>
  );
};


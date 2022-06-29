//import ScrollTrack from '../ScrollTrack/ScrollTrack'
import Link from 'next/link'
import router, { useRouter } from 'next/router'
import { useEffect, useState, useCallback, forwardRef, ReactElement } from 'react'
import { useThrottle } from '@react-hook/throttle'
import SVGIcon from '../SVGIcon'
import SettingsAlertMenu from '../SettingsAlertMenu'
import { useRouting } from '../../context/routingContext'
import { useForm } from '../../context/formContext'
import { useMenuSettings } from '../../context/menuSettingsContext'
import { capitalize, array_move, isEmpty, isCurr } from '../../helpers'
import { defaultTheme } from '../../styles/themer/utils'
import Button from '../Buttons/Button'
import { useUser } from '../../context/userContext'
import isEqual from 'lodash.isequal'
import { useStyletron } from 'baseui';
import { Navigation } from 'baseui/side-navigation';
import VIP_END_OF_DAY from '../Modals/VIP_END_OF_DAY'
import {
  Card,
  StyledBody,
  StyledAction
} from "baseui/card";
import { Tabs, Tab } from "baseui/tabs-motion";

import {
  Label1,
  Label2,
  Label3,
  Label4,
  Paragraph1,
  Paragraph2,
  Paragraph3,
  Paragraph4, H1, H2, H3, H4, H5, H6
} from 'baseui/typography';
import { styled } from "baseui";
import { useScreen } from '../../context/screenContext'
import { useDispatchModalBase } from '../../context/Modal'

const FeatureDiv = styled("div", ({ $theme }) => {
  return {
    ':after': {
      content: '""',
      backgroundColor: $theme.borders.border600.borderColor,
      bottom: '0',
      height: '1px',
      left: '24px',
      right: '24px',
      position: 'absolute',
    },
  };
});
const FlexContainer = styled("div", ({ $theme }) => {
  return {
    display: 'flex',
    width: '100%'
  };
});
const IconSpan = styled("span", ({ $theme }) => {
  return {
    marginRight: $theme.sizing.scale400
  };
});

const LabelSpan = styled("span", ({ $theme }) => {
  return {
    lineHeight: $theme.sizing.scale800
  };
});
export const Feature = ({ children }) => {
  return (
    <div className='console-feature'>
      <div className='console-feature-spacing'>
        <div className='console-feature-content'>{children}</div>
      </div>
    </div>
  )
}
export const Title = ({ title = 'No Title' }:any) => {
  return (
    <div className='console-feature-title-row canvas-theme-container'>
      <div className='console-feature-title-lockup stretch-across'>
        <div className='console-feature-title'>
          <div className='console-feature-title-text'>{<H4>{title}</H4>}</div>
        </div>
      </div>
    </div>
  )
}
export const ActiveLink = ({ children, href, style, as, index }) => {
  const router = useRouter()
  const { asPath, pathname } = router
  const { setNavLoading } = useRouting()
  return (
    <Link href={href} as={as} scroll={true} >
      <button
        //onClick={()=>setNavLoading(true)}
        tabIndex={index || 0}
        aria-disabled='false'
        aria-current='page'
        style={style}
        className={`button-base console-link-base link-tabs ${router.asPath === as ? 'console-link-active' : ''
          }`}>
        {children}
      </button>
    </Link>
  )
}



export const ActiveConsoleLink = ({
  children,
  href = "/[adminID]/orders/[filter]",
  style = { cursor: 'pointer' },
  as,
  index,
  name = 'ordersFilled',
  blackList = [],
}) => {
  const router = useRouter()
  const { setNavLoading } = useRouting()
  //const { user, fireUser } = useUser()
  const { asPath, pathname } = router


  return (

    <Navigation
      items={[
        {
          title: <FlexContainer> <IconSpan >
            <SVGIcon
              style={{ transform: 'scale(0.8)' }}
              name={name}
            />
          </IconSpan><LabelSpan>{children}</LabelSpan>
          </FlexContainer>,
          itemId: href,
          //as: as,
        },
      ]}
      activeItemId={pathname}
      onChange={({ event, item }) => {
        event.preventDefault();
        if(href === pathname){
          
          return
        }
        setNavLoading(true)
        router.push(`${item.itemId}`, `${as}`);
      }}
    />
  )
}
export const ActiveConsoleLinkX = ({
  children,
  href = "/[adminID]/orders/[filter]",
  style = { cursor: 'pointer' },
  as,
  index,
  name = 'ordersFilled',
}) => {
  const router = useRouter()
  const { setNavLoading } = useRouting()
  //const { user, fireUser } = useUser()
  const { asPath, pathname } = router


  return (
    <Link href={href} {...(as && { as })} scroll={false}>
      <a
        onClick={() => Boolean(pathname !== href) && setNavLoading(true)}
        style={style}
        className={`console-link${pathname === href ? ` active` : ``
          }`}
        tabIndex={-1}
      //style={{cursor: 'pointer'}}
      >
        <span aria-hidden='true'>
          <SVGIcon
            style={{ transform: 'scale(0.8)' }}
            name={name}
          />
        </span>
        <div className='console-link-name'>{children}</div>
      </a>
    </Link>
  )
}

export const Nav = ({ links }) => {
  const [linkList, setLinkList] = useState([])
  const router = useRouter()
  const [activeKey, setActiveKey] = useState(null);

  useEffect(() => {
    const tempLinks = []
    for (const key in links) {
      const { as, label, href, role } = links[key]
      // if (role && !Boolean(role.includes(fireUser?.data?.role))) {
      //   return
      // }
      tempLinks.push(
        <Tab 
        //style={{whiteSpace: "nowrap"}}
        overrides={{
          Tab: {
            style: ({ $theme }) => ({
              whiteSpace: "nowrap"
            })
          }
        }}
        onClick={(e) => {
          router.push(`${href}`, `${as}`)
        }} 
        key={key} title={label} 
        >
          <>
          </>
          </Tab>
        // <ActiveLink key={key} index={key} href={href} as={as}>
        //   {label}
        // </ActiveLink>
      )
    }

    setLinkList(tempLinks)
  }, [links])


  useEffect(() => {
    let i = 0
    for (const key in links) {
      const { as } = links[key]
      const { asPath } = router
     // alert(as)
     // alert(asPath)
      if(as === asPath){   
        //alert(`active ${i}`) 
        setActiveKey(`${i}`)
      }
      i++
    }
  }, [router, links]);
  
  
  useEffect(() => {
    return () => {
      setActiveKey(null)
    };
  }, []);
  return (
    <Tabs
      activeKey={`${activeKey}`}
      // onChange={(props) => {
      //   setActiveKey(activeKey);
      // }}
      overrides={{
        TabBorder: {
          style: ({ $theme }) => ({ height: "2px" })
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
            height:`3px`,
            bottom:`5px`
          })
        }
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
  )
}
export const Crumbs = ({ crumbs = [], title = null }) => {
  const [links, setLinks] = useState([])
  const { setNavLoading } = useRouting()
  const handleClick = () => {
    setNavLoading(true)
  }
  useEffect(() => {
    const tempCrumbs = []
    if (crumbs.length) {
      for (const key in crumbs) {
        const { href, as, label } = crumbs[key];
        tempCrumbs.push(
          <li key={key}>
            <Link href={href} as={as}>
              <a onClick={handleClick}>{label}</a>
            </Link>
          </li>
        )
      }
    }
    if (title) {
      tempCrumbs.push(<li key={title}>{title}</li>)
    }
    setLinks(tempCrumbs)
  }, [])
  return (
    <div style={{ height: '46px' }}>
      <ul className='breadcrumb'>
        {links}
      </ul>
    </div>
  )
}
const AppBar = styled("div", ({ $theme, $isScrolled }) => {
  return $isScrolled ? {
    borderBottom: `1px solid ${$theme.borders.border600.borderColor}`,
    backgroundColor: $theme.colors.background,
  } : undefined
});
export const Header = ({ title = 'default', id = 'console-header', isScrolled = false, back = false }:any) => {
  const [css, theme] = useStyletron();
  const router = useRouter()
  const { asPath, pathname } = router
  const { announcement } = useForm()
  //const { user } = useUser()
  const { setNavLoading } = useRouting()
  const { themeState, toggleTheme } = useScreen()
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
    const component: () => ReactElement = () => <VIP_END_OF_DAY/>;
    openModalBase(component, true);
  };

  return (
    <>
      <header id={id}>
        <div className='console-appbar-grid'>
          <AppBar
            $isScrolled={isScrolled}
            //style={isScrolled?{backgroundColor:theme.colors.background}:undefined}
            //className={`console-appbar${isScrolled ? ` is-scrolled-void` : ''}`}
            className={`console-appbar`}
          >
            <div className='left-navigation'>
              {!Boolean(back) &&
                <Link href={`${pathname}?menu`} as={`${asPath}?menu`} scroll={false}>
                  <button  aria-label='Open navigation Menu'>
                    <span>
                      <SVGIcon
                        color={theme.colors.primary}
                        name={'menu'}
                        style={{ transform: 'scale(1)' }}
                      />
                    </span>
                  </button>
                </Link>
              }
              {Boolean(back) &&
                //  <Link href={"/[adminID]/users/[users]"} as={`/${user?.uid}/users/customer`} scroll={false}>
                <button onClick={() => ((back) ? router.push(back) : router.back(), setNavLoading(true))} className='visible' aria-label='Open navigation Menu'>
                  <span>
                    <SVGIcon
                      color={theme.colors.primary}
                      name={'arrowLeft'}
                      style={{ transform: 'scale(1)' }}
                    />
                  </span>
                </button>
                // </Link>
              }
            </div>
            <div className='center-crumbs'>
              <div className='appbar-crumbs'>
                <div className={`animation${isScrolled ? ` is-scrolled` : ''}`}>
                  <span className='console-crumb'>
                    <a href='#'>{<Label3>{title || 'Missing Title'}</Label3>}</a>
                  </span>
                </div>
              </div>
            </div>
            <div className='right-navigation' style={{ marginRight: '-15px' }}>
              <button onClick={toggleTheme} aria-label='Dark Mode Toggle'>
                <span>
                  <SVGIcon
                    style={{ transform: 'scale(1)' }}
                    color={theme.colors.primary}
                    name={themeState?.dark ? 'lightbulbFilled' : 'lightbulb'}
                  />
                </span>
              </button>
              {/* <Link href={`${pathname}?alert`} as={`${asPath}?alert`}> */}
                <button onClick={()=>END_OF_DAY()} aria-label='Open Quick Settings'>
                  <span>
                    <SVGIcon
                      style={{ transform: 'rotate(90deg)' }}
                      color={theme.colors.primary}
                      name={'replacement'}
                    />
                  </span>
                </button>
              {/* </Link> */}
            </div>
          </AppBar>
        </div>
      </header>
    </>
  )
}
export const Footer = ({ isShowing = true, children }) => {
  return (
    <div className={`fixed-bottom-console${isShowing ? ` showing` : ''}`}>
      {children}
    </div>
  )
}

export const Main = forwardRef(
  ({ links = false, title = 'No Title', crumbs, children, onScroll, id = 'main-products', noNav = 'false' }:any, ref:any) => {
    const [scrollPos, setScrollPos] = useThrottle(0, 10, false)
    useEffect(() => {
      onScroll && onScroll(scrollPos)
    }, [scrollPos])
    const handleScroll = useCallback((e) => {
      setScrollPos(e.currentTarget.scrollTop)
    }, [])
    return (
      <main {...{ id }} className='console-main canvas-theme-container' onScroll={handleScroll} ref={ref}>
        <Feature>
          {title && <Title {...{ title }} />}
          <div style={{ height: noNav ? '8px' : '46px' }}>
            {links && <Nav {...{ links }} />}
            {crumbs && <Crumbs {...{ crumbs }} {...{ title }} />}
          </div>
        </Feature>
        {children}
      </main>
    )
  }
)
export const Console = forwardRef(
  ({ links, title = 'No Title', crumbs = false, children, id = 'console', back = false, noNav = false }:any, ref) => {
    const [isScrolled, setIsScrolled] = useState(false)
    const handleScroll = useCallback(
      (scrollPos) => {
        if (scrollPos <= 0) {
          isScrolled && setIsScrolled(false)
        } else {
          !isScrolled && setIsScrolled(true)
        }
      },
      [isScrolled]
    )
    const props = { id, title, links, crumbs, noNav }
    return (
      <>
        <Header {...{ back }} isScrolled={isScrolled} {...{ title }} />
        <Main ref={ref} {...props} onScroll={handleScroll}>
          <div className='router-outlet'>
            {children}
          </div>
        </Main>
      </>
    )
  }
)
export const PrimaryPane = ({ children, id = 'primary-pane', reverse = false, column = false, mountToBottom = <div />, style=undefined }) => {
  return (
    <>
      <div {...{ id }}  {...{ style }} className={`primary-pane${reverse ? ` reverse` : ''}${column ? ` column` : ''}`}>
        {children}
      </div>
      {mountToBottom}
      <div style={{ width: '100%', height: '120px' }} />
    </>
  )
}
export const FormPane = ({ children, id = 'form-pane', noPadding = false, style = undefined }) => {
  return (
    <div {...{ id }} className='form-pane' {...{ style }}>
      {/* CARD  */}
      <Card 
      overrides={{
        Root: {
          style: ({ $theme }) => ({width:'100%' })
        }, 
        Contents: {
          style: ({ $theme }) => (noPadding && { margin: `0px`, padding:`0px` })
        },
        Body: {
          style: ({ $theme }) => (noPadding && { margin: `0px` })
        }
      }} >{children}</Card>
    </div>
  )
}
export const SidePane = ({ children, id = 'side-pane', title = undefined, style = undefined, innerStyle= undefined }) => {
  return (
    <div {...{ id }} {...{ style }} className='side-pane'>
      <div className='side-pane-sticky'>
      <Card>
          <div className='side-pane-box'>
            <div className='side-pane-label'>{title}</div>
            <div style={innerStyle} className='side-pane-flex'>
              {children}
            </div>
          </div>
          </Card>

      </div>

    </div>
  )
}
export const FormInput = ({ children, label = undefined, stack = false, style = undefined }) => {
  return (
    <div style={style} className='form-input-break'>
      <div className={`form-input-label${stack ? ` stack` : ''}${!label ? ` no-label` : ''}`}>
        <span >{label}</span>
      </div>
      <div className='form-input'>
        {children}
      </div>
    </div>
  )
}
export const FileInput = ({
  fileType = ["jpg", "jpeg", ".png"],
  text = "Add Image",
  onChange = undefined,
  onError = undefined,
  progress = 0,
}:any) => {
  const [fileName, setFileName] = useState(null)
  const fileError = { code: "invalid-file-type", message: "Invalid file type." }
  const re = /(?:\.([^.]+))?$/;

  const handleChange = useCallback(
    (e) => {
      e.stopPropagation()
      let tempFile = null
      let tempError = fileError
      const ext = re.exec(e.target.files[0].name.toLowerCase())[1]
      if (fileType.includes(ext)) {
        //if (fileType.exec(e.target.files[0].name)) {
        console.log("valid file")
        tempFile = e.target.files[0]
        tempError = null
      }
      onChange && onChange(e, tempFile)
      onError && onError(tempError)
      setFileName(tempFile?.name)
    },
    [fileType]
  )



  return (
    <>
      <div className={`upload-file-container${fileName ? ` has-file` : ``} `}>
        <span className='plus-sign'>+</span>
        <span className='upload-file-label'>
          {(progress && `${parseInt(progress)}%`) || fileName || text}
        </span>
        <input type='file' name='file' onChange={handleChange} disabled={progress > 0} />
      </div>
    </>
  )
}
export const FormSection = ({ children, title = undefined, toggle = undefined }) => {
  return (
    <div className='form-pane-section'>
      <div className='form-title-box'>
        {title && <div className='form-card-title'>{title}</div>}
        <div className='switch-position'>
          {toggle}
        </div>
      </div>
      {children}
    </div>
  )
}
export const AnnouncementBar = ({ message = 'Enter Announcement', backgroundColor = '#1a73e8' }) => {
  const { setAnnouncement, form } = useForm()

  return (
    <div className='announcement-bar'
      style={{
        ...{ backgroundColor },
        ...(form?.announcementColor && { backgroundColor: form?.announcementColor })
      }}>
      <div className='announcement-text' >{form?.announcement || message}</div>
      <button style={{ width: '30px' }} onClick={() => setAnnouncement(false)}><SVGIcon color={'#fff'} name='xSmall' /></button>
    </div>
  )
}
export const SortableItem = ({ collection = 'N/A', index }) => {
  const { setSortableObject, sortableArray, setSortableArray } = useMenuSettings()

  const moveItemUp = useCallback(() => {
    const arr = sortableArray
    const i = parseInt(index)
    const incSortableArray = array_move(arr, i, i - 1)
    const tempSortableObject = []
    if (incSortableArray.length) {
      incSortableArray.forEach((collection, index) => {
        tempSortableObject.push({ id: `item_${index}`, content: capitalize(collection) })
      })
    }
    setSortableObject(tempSortableObject)
    setSortableArray(incSortableArray)
  }, [sortableArray, collection, index])

  const moveItemDown = useCallback(() => {
    const arr = sortableArray
    const i = parseInt(index)
    const incSortableArray = array_move(arr, i, i + 1)
    const tempSortableObject = []
    if (incSortableArray.length) {
      incSortableArray.forEach((collection, index) => {
        tempSortableObject.push({ id: `item_${index}`, content: capitalize(collection) })
      })
    }
    setSortableObject(tempSortableObject)
    setSortableArray(incSortableArray)
  }, [sortableArray, collection, index])

  const removeItem = useCallback(() => {
    const arr = sortableArray
    const i = parseInt(index)
    arr.splice(i, 1)
    const tempSortableObject = []
    if (arr.length) {
      arr.forEach((collection, index) => {
        tempSortableObject.push({ id: `item_${index}`, content: capitalize(collection) })
      })
    }
    setSortableObject(tempSortableObject)
    setSortableArray(arr)
  }, [sortableArray, index])

  return (
    <li className='collection-item-container'>
      <div className='collection-item-flex'>
        <div className='collection-item-label-container'>
          <label className='collection-item-label'>{`${(parseInt(index) + 1)}. ${capitalize(collection)}`}</label>
        </div>
        <div className='collection-item-button-container'>
          <button onClick={removeItem} className='collection-item-button'>
            <SVGIcon color={('#878787' || '#ff5252')} name={'xSmall'} />
          </button>
        </div>
        <div className='collection-item-button-container'>
          <button
            onClick={moveItemDown}
            disabled={Boolean(sortableArray.length == parseInt(index) + 1)}
            className='collection-item-button'>
            <SVGIcon color={Boolean(sortableArray.length == parseInt(index) + 1) ? '#9e9e9e' : '#8ab4f8'} name={'arrowDownSmall'} />
          </button>
        </div>
        <div className='collection-item-button-container'>
          {<button
            onClick={moveItemUp}
            disabled={Boolean(parseInt(index) === 0)}
            className='collection-item-button'>
            <SVGIcon color={Boolean(parseInt(index) === 0) ? '#9e9e9e' : '#8ab4f8'} name={'arrowUpSmall'} />
          </button>}
        </div>
      </div>
    </li>
  )
}
export const FormProductPreview = ({
  img,
  price,
  name,
  brand,
  genome,
  size,
  weight,
  sale
}) => {
  return (
    <>
      <div className='side-license-preview'>
        {Boolean(img) ? (
          <img className='' src={img} alt={"license"} />
        ) : (
          <div className='side-license-icon'>
            <SVGIcon name='photo' />
          </div>
        )}
      </div>
      <div style={{ padding: 12 }} className='item-info'>
        <div className='item-name item-row'>
          <div style={{ display: "flex" }}>
            <div className='item-price'>
              <span>
                <span>{isCurr(price)}</span>
                {/* <span className="font-size">
                          &nbsp;{size||''}  
                        </span>   */}
                {` `}
                {sale && <span className='price-discount'>{isCurr(price)}</span>}
              </span>
            </div>
          </div>
          {sale && <span className='item-discount'>
            <span>$0.50 off</span>
          </span>}
          <span className='full-item-name'>
            <span aria-label={name}>
              {name}
              {(brand?.label) ? ` | ` : <wbr />}
              {`${brand?.label || ''}`}
            </span>
          </span>
          <span aria-label={genome} className='item-genome'>
            {weight || size}
            {(genome?.label) ? ` | ` : <wbr />}
            {`${genome?.label || ''}`}
          </span>
        </div>
      </div>
    </>
  )
}
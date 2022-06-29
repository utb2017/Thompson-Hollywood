import {useUser} from '../context/userContext'
import {useRouter} from 'next/router'
import Link from 'next/link'
import ConsoleHeader from "../components/Headers/ConsoleHeader"
import {
  createRef,
  useEffect,
  useRef,
  useState,
  useCallback
} from 'react'
import {useWindowSize} from '../hooks/useWindowSize'
import { capitalize } from '../helpers'
import { colors } from "../styles"
import { defaultTheme } from '../styles/themer/utils'
//import ScrollTrack from "../components/ScrollTrack/ScrollTrack"
import { useThrottle } from "@react-hook/throttle"

const ActiveLink = ({children, href, className, as}) => {
  const router = useRouter()
  return (
    <Link href={href} as={as} scroll={true}>
      <a
        tabIndex={0}
        aria-disabled='false'
        aria-current='page'
        style={{cursor: 'pointer'}}
        className={`${
          className ? className : ''
        } mat-tab-label mat-tab-link mat-focus-indicator fire-router-link-host ${
          router.asPath === as ? 'mat-tab-label-active' : ''
        }`.trim()}>
        {children}
      </a>
    </Link>
  )
}

const SettingsLayout = ({children, notificationBar, noNav, title="Settings" }) => {
  const router = useRouter()
  const {width, height} = useWindowSize()
  const {user, fireCollection, fireMenuCollections} = useUser()
  const scrollRef = createRef(null)
  const elementRef = useRef(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [links, setLinks] = useState([])

  const [scrollPos, setScrollPos] = useThrottle(0, 20, false)




  const handleScroll = useCallback((e) => {
    console.log("!!!!!!!!!")
    setScrollPos(e.currentTarget.scrollTop)
  }, [])

  useEffect(() => {
    if (scrollPos <= 0) {
      isScrolled && setIsScrolled(false)
    } else {
      !isScrolled && setIsScrolled(true)
    }
  }, [scrollPos])

  return (
    <>
        <ConsoleHeader propScroll={isScrolled} isScrolled={isScrolled} title={title} {...{notificationBar}} />
        <main 
          ref={scrollRef}
          id='main-products'
          className='content c5e-nav-expanded canvas-theme-container'
          onScroll={handleScroll}
        >
          <div ref={elementRef} className='fire-feature-bar'>
            <div className='feature-bar-page-margins canvas-theme-container'>

              <div className='feature-bar-content'>
                <div className='feature-bar-primary-row'>
                  <div className='feature-title-lockup stretch-across'>
                    <div className='fire-feature-bar-title'>
                        <h1 className='fire-feature-bar-title'>{title}</h1>

                    </div>
                  </div>
                </div>
{   !noNav &&           <div className='fire-feature-bar-tabs'>
                  <div>
                    <nav className='mat-tab-nav-bar mat-tab-header mat-primary'>
                      <div className='mat-tab-link-container'>


                              <ScrollTrack
                                styles={{ Track: { height: '54px', padding: '10px 0' },}}
                              >

                           

                            <ActiveLink
                              href={'/[adminID]/settings/store'}
                              as={`/${user?.uid}/settings/store`}>
                              Fees
                            </ActiveLink>
                            <ActiveLink
                              href={'/[adminID]/settings/discounts'}
                              as={`/${user?.uid}/settings/discounts`}>
                              Discounts
                            </ActiveLink>
                            <ActiveLink
                              href={'/[adminID]/settings/notifications'}
                              as={`/${user?.uid}/settings/notifications`}>
                              Notifications
                            </ActiveLink>

                            <ActiveLink
                              href={'/[adminID]/settings/menu'}
                              as={`/${user?.uid}/settings/menu`}>
                              Menu
                            </ActiveLink>

                            <ActiveLink
                              href={'/[adminID]/settings/zone'}
                              as={`/${user?.uid}/settings/zone`}>
                              Zone
                            </ActiveLink>





                          </ScrollTrack>
                            {/* <ActiveLink
                              href={'/[adminID]/settings/banner'}
                              as={`/${user?.uid}/settings/banner`}>
                              Banner
                            </ActiveLink> */}
        
                      </div>
                    </nav>
                  </div>
                </div>}
                { noNav && 
                
                  <ul className="breadcrumb">
                    <li><a href="#">Discounts</a></li>
                    <li>Create</li>
                  </ul>

                
                }
              </div>
            </div>
          </div>
          {/* <div className='feature-bar-page-margins canvas-theme-container'> */}
          <div>{children}</div>
          {/* </div> */}

        </main>
        <style jsx>{`

.fixed-bottom-settings {
  padding-right: 18px;
  text-align: right;
  display: flex;
  position: fixed;
  bottom: 0;
  height: 76px;
  background-color: #fff;
  width: calc(100% - 256px);
  left: 256px;
  right: 0px;
  border-top: 1px solid #bdbdbd;
  z-index: 500;
  -webkit-flex-direction: row;
  flex-direction: row;
  align-items: center;
  padding: 0 22px;
}
@media only screen and (max-width: 919px) {
  .fixed-bottom-settings {
    width: 100%;
    left: 0px;
  }
}
        .main {
          overflow: hidden;
          overflow-y: scroll;
          width: 100%;
          height: 100%;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 120px;
        }

ul.breadcrumb {
  padding: 10px 2px;
  list-style: none;
  color: ${defaultTheme.colors.action};
}


ul.breadcrumb li {
  display: inline;
  font-size: 16px;
}

ul.breadcrumb li+li:before {
  padding: 8px;
  color: ${defaultTheme.colors.action};
  content: "/";
}


ul.breadcrumb li a {
  color: ${colors.LIGHT_BLUE_600};
  text-decoration: none;
}


ul.breadcrumb li a:hover {
  color: #01447e;
  text-decoration: underline;
}
      `}</style>


    </>
  )
}

export default SettingsLayout
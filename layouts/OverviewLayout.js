import {useUser} from '../context/userContext'
import {useRouter} from 'next/router'
import Link from 'next/link'
import Header from '../layouts/Header'
import {
  disableBodyScroll,
  clearAllBodyScrollLocks,
  enableBodyScroll,
} from 'body-scroll-lock'
import {
  createRef,
  useEffect,
  useRef,
  useState
} from 'react'
import {useWindowSize} from '../hooks/useWindowSize'
import { capitalize } from '../helpers'
import Select from '../components/Forms/Select'
import MenuItem from '../components/Menus/MenuItem'

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

const ProductsLayout = ({children, notificationBar}) => {
  const router = useRouter()
  const {width, height} = useWindowSize()
  const {user, fireCollection, fireMenuCollections} = useUser()
  const scrollRef = createRef(null)
  const elementRef = useRef(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [links, setLinks] = useState([])



  useEffect(() => {
    disableBodyScroll(scrollRef.current)
    return () => clearAllBodyScrollLocks()
  }, [scrollRef, width])



  return (
    <>
        <Header propScroll={isScrolled} title={'Overview'} {...{notificationBar}} />
        <main 
          ref={scrollRef}
          id='main-products'
          className='content c5e-nav-expanded canvas-theme-container'
          onScroll={(e) => {
            if(e.currentTarget.scrollTop === 0){
              setIsScrolled(false)
            }else{
              setIsScrolled(true)
            }
          }}
        >
          <div ref={elementRef} className='fire-feature-bar'>
            <div className='feature-bar-page-margins canvas-theme-container'>
              <div className='feature-bar-crumbs' />
              <div className='feature-bar-content'>
                <div className='feature-bar-primary-row'>
                  <div className='feature-title-lockup stretch-across'>
                    <div className='fire-feature-bar-title'>
                      <h1 className='fire-feature-bar-title'>Overview</h1>
                      <div className='feature-title-badge' />
                    </div>
                  </div>
              {/* <div className='fire-finance-date'>
                      <Select
        id='dates'
        name='dates'
        // validationErrorText={error?.role}
        floatingLabelText='Date'
        hintText='Select a date'
        // onSelect={(_, {value}) =>
        //   setForm((oldForm) => ({...oldForm, ...{role: value}}))
        // }
        halfWidth>
        <MenuItem label={'Today'} value={'today'} />
        <MenuItem label={'Yesterday'} value={'driver'} />
        <MenuItem label={'Last 7 Days'} value={'dispatcher'} />
        <MenuItem label={'Last Week'} value={'manager'} />
        <MenuItem label={'Month to Date'} value={'manager'} />
        <MenuItem label={'Previous Month'} value={'manager'} />
        <MenuItem label={'Year to Date'} value={'manager'} />
      </Select>
                </div>     */}

                </div>
                <div className='fire-feature-bar-tabs'>
                  <div>
                    <nav className='mat-tab-nav-bar mat-tab-header mat-primary'>
                      <div className='mat-tab-link-container'>
                        <div
                          className='mat-tab-list'
                          style={{transform: 'translateX(0px)'}}>
                          <div className='mat-tab-links'>
                            {/**/}
                            {/* <ActiveLink
                              href={'/[adminID]/settings/store'}
                              as={`/${user?.uid}/settings/store`}>
                              Fees
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
                            </ActiveLink> */}

                            {/* <ActiveLink
                              href={'/[adminID]/settings/banner'}
                              as={`/${user?.uid}/settings/banner`}>
                              Banner
                            </ActiveLink> */}
                          </div>
                        </div>
                      </div>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* <div className='feature-bar-page-margins canvas-theme-container'> */}
          <div>{children}</div>
          {/* </div> */}
          
        </main>
    </>
  )
}

export default ProductsLayout
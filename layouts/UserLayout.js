import {useUser} from '../context/userContext'
import {useRouter} from 'next/router'
import Link from 'next/link'
import Header from '../layouts/Header'
import {
  disableBodyScroll,
  clearAllBodyScrollLocks,
} from 'body-scroll-lock'
import {createRef, useEffect, useState} from 'react'
import {useWindowSize} from '../hooks/useWindowSize'

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

const UsersLayout = ({children}) => {
  const {width} = useWindowSize()
  const {user} = useUser()
  const ipadScrollRef = createRef(null)
  const mobileScrollRef = createRef(null)
  const [isScrolled, setIsScrolled] = useState(false)

  /* IOS scroll fix */
  // useEffect(() => {
  //   disableBodyScroll(mobileScrollRef.current)
  //   return () => {
  //     clearAllBodyScrollLocks()
  //   }
  // }, [ipadScrollRef, mobileScrollRef, width])

  return (
    <>
      <Header propScroll={isScrolled} title={'Users'} />
      <main
        ref={mobileScrollRef}
        id='main-products'
        className='content c5e-nav-expanded canvas-theme-container'
        onScroll={(e) => {
          console.log(e.currentTarget.scrollTop)
          if (e.currentTarget.scrollTop === 0) {
            setIsScrolled(false)
          } else {
            setIsScrolled(true)
          }
        }}>
        <div className='fire-feature-bar'>
          <div className='feature-bar-page-margins canvas-theme-container'>
            <div className='feature-bar-crumbs' />
            <div className='feature-bar-content'>
              <div className='feature-bar-primary-row'>
                <div className='feature-title-lockup stretch-across'>
                  <div className='fire-feature-bar-title'>
                    <h1 className='fire-feature-bar-title'>Users</h1>
                    <div className='feature-title-badge' />
                  </div>
                </div>
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
                          <ActiveLink
                            href={'/[adminID]/users/[users]'}
                            as={`/${user?.uid}/users/customer`}>
                            Customers
                          </ActiveLink>
                          <ActiveLink
                            href={'/[adminID]/users/[users]'}
                            as={`/${user?.uid}/users/driver`}>
                            Drivers
                          </ActiveLink>
                          <ActiveLink
                            href={'/[adminID]/users/[users]'}
                            as={`/${user?.uid}/users/dispatcher`}>
                            Dispatchers
                          </ActiveLink>
                          <ActiveLink
                            href={'/[adminID]/users/[users]'}
                            as={`/${user?.uid}/users/manager`}>
                            Managers
                          </ActiveLink>
                          <ActiveLink
                            href={'/[adminID]/users/[users]'}
                            as={`/${user?.uid}/users/pending`}>
                            Pending
                          </ActiveLink>
                        </div>
                      </div>
                    </div>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>{children}</div>
      </main>
    </>
  )
}

export default UsersLayout

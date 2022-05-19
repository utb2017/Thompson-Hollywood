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

const ProductsLayout = ({children}) => {
  const router = useRouter()
  const {width, height} = useWindowSize()
  const {user, fireCollection, fireMenuCollections} = useUser()
  const scrollRef = createRef(null)
  const elementRef = useRef(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [links, setLinks] = useState([])


  useEffect(() => {
    let tempLinks = []
    if(fireCollection.length && user?.uid){
      fireCollection.forEach((collection, index) => {
        tempLinks.push(
          <ActiveLink
            key={index}
            href={'/[adminID]/products/[collection]'}
            as={`/${user.uid}/products/${collection}`}
          >
            {capitalize(collection)}
          </ActiveLink>
        )
      });
    }
    setLinks(tempLinks)

  }, [fireCollection, user]) 



  useEffect(() => {
    disableBodyScroll(scrollRef.current)
    return () => clearAllBodyScrollLocks()
  }, [scrollRef, width])



  return (
    <>
        <Header propScroll={isScrolled} title={'Products'} />
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
                      <h1 className='fire-feature-bar-title'>Products</h1>
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
                            {links}
                            {/**/}
                            {/* <ActiveLink
                              href={'/[adminID]/products/[collection]'}
                              as={`/${user?.uid}/products/flower`}>
                              Flower
                            </ActiveLink>
                            <ActiveLink
                              href={'/[adminID]/products/[collection]'}
                              as={`/${user?.uid}/products/vaporizers`}>
                              Vaporizers
                            </ActiveLink>

                            <ActiveLink
                              href={'/[adminID]/products/[collection]'}
                              as={`/${user?.uid}/products/edibles`}>
                              Edibles
                            </ActiveLink>

                            <ActiveLink
                              href={'/[adminID]/products/[collection]'}
                              as={`/${user?.uid}/products/prerolls`}>
                              Prerolls
                            </ActiveLink>

                            <ActiveLink
                              href={'/[adminID]/products/[collection]'}
                              as={`/${user?.uid}/products/concentrates`}>
                              Concentrates
                            </ActiveLink>

                            <ActiveLink
                              href={'/[adminID]/products/[collection]'}
                              as={`/${user?.uid}/products/cbd`}>
                              CBD
                            </ActiveLink>

                            <ActiveLink
                              href={'/[adminID]/products/[collection]'}
                              as={`/${user?.uid}/products/accessories`}>
                              Accessories
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
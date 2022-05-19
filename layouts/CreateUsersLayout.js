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


const CreateProductsLayout = ({children, title = 'default'}) => {
  const router = useRouter()
  const {width, height} = useWindowSize()
  const {user} = useUser()
  const scrollRef = createRef(null)
  const elementRef = useRef(null)
  
  const [isScrolled, setIsScrolled] = useState(false)


  useEffect(() => {
    disableBodyScroll(scrollRef.current)
    return () => clearAllBodyScrollLocks()
  }, [scrollRef, width])



  return (
    <>
        <Header propScroll={isScrolled} title={title} />
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
                      <h1 className='fire-feature-bar-title'>{title}</h1>
                      <div className='feature-title-badge' />
                    </div>
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

export default CreateProductsLayout
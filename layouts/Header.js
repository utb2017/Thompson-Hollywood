import SVGIcon from '../components/SVGIcon'
import {useState, useEffect, useRef} from 'react'
import {useScrollPosition} from '../hooks/useScrollPosition'
import {useWindowSize} from '../hooks/useWindowSize'
import {useUser} from '../context/userContext'
import Link from 'next/link'
import {useRouter} from 'next/router'
import {disableBodyScroll, clearAllBodyScrollLocks} from 'body-scroll-lock'
import Switch from '../components/Buttons/Switch'
import SettingsAlertMenu from '../components/SettingsAlertMenu'

export default function Header({children, title = 'default', id, propScroll = false}) {
  const router = useRouter()
  const { asPath, pathname } = router
  const {user} = useUser()
  const size = useWindowSize()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(true)
  const scrollRef = useRef(null)
  const widthRef = useRef(null)
  //const collapseRef = useRef(null)
  // const lockRef = useRef(null)


  useEffect(() => {
      setIsScrolled(propScroll)
  }, [propScroll])


  // useEffect(() => {
  //   if (!isCollapsed) {
  //     disableBodyScroll(lockRef.current)
  //   } else {
  //     clearAllBodyScrollLocks()
  //   }
  // }, [isCollapsed, lockRef])

  useEffect(() => {
    if (isScrolled) {
      scrollRef.current.className = `${scrollRef.current.className} is-scrolled`
    } else {
      const prefix = 'is-scrolled'
      const classes = scrollRef.current.className
        .split(' ')
        .filter((c) => !c.startsWith(prefix))
      scrollRef.current.className = classes.join(' ').trim()
    }
  }, [isScrolled, scrollRef])


  // useScrollPosition(
  //   ({currPos}) => {
  //     const isTop = currPos.y != 0
  //     if (isTop !== isScrolled) setIsScrolled(isTop)
  //   },
  //   [isScrolled]
  // )

  // useEffect(() => {
  //   //console.log(size)

  //   if (size.width <= 919 && size.width >= 600) {
  //     //setIsCollapsed(true)
  //   }
  // }, [size])


  return (
<>
    <header id={id} className='fire-header'>
     
      <div className='fire-appbar'>
        <div
          //ref={appBarRef}
          ref={scrollRef}
          className='app-bar canvas-theme-container'
          style={{
            background: isScrolled ? 'rgb(255, 255, 255)' : 'transparent',
          }}>
          <div className='left'>
            <Link  
              href={`${pathname}?menu`}
              as={`${asPath}?menu`}
              scroll={false}
            >
            <button
              //onClick={() => setIsCollapsed(false)}
              aria-label='Open navigation menu'
              className='button-base mat-icon-button mobile-navbar-toggle'>
              <span className='button-wrapper'>
                <SVGIcon color={'#476282'} name={'menu'} />
              </span>
            </button>
             </Link>
          </div>

          <div className='middle'>
            <div
              //ref={appBtnRef}
              ref={scrollRef}
              className='fire-appbar-crumbs'>
              <div className='container'>
                <span className='crumb page-crumb'>
                  <Link
                    href={`${pathname}`}
                    as={`${asPath}`}
                    scroll={true}>
                    <a href='#'>{title}</a>
                  </Link>
                </span>
              </div>
            </div>
          </div>

          {/* <div className='right'>
          <Link  
              href={`${pathname}?alert`}
              as={`${asPath}?alert`}
              scroll={false}
            >
                <button className='button-base'>
                   <span className='gmp-icons' aria-hidden='true'>
                      <SVGIcon
                        style={{transform: 'scale(1)'}}
                        color={'#476282'}
                        name={'bellFilled'}
                      />
                    </span>
                </button>
            </Link>
          </div> */}
        </div>
      </div>
    </header>
    <SettingsAlertMenu/>
    </>
  )
}
const PendingOrders = () => {
  const onChange = (event, props) => {
    event.stopPropagation()
    //alert(`This button is ${props.isSelected ? '' : 'not '}selected`)
  }
  return(
  <span className='wait-label'>{`(${0}) Pending Orders`}</span>
  )
}
const OpenClose = () => {
  const onChange = (event, props) => {
    event.stopPropagation()
    //alert(`This button is ${props.isSelected ? '' : 'not '}selected`)
  }
  return(
    <div
    aria-label="product"
    role="group"
    data-radium="true"
    style={{
      display: "flex",
      position: "relative",
      padding: "12px 0px",
    }}
  >
    <span className='wait-label'>Close/Open</span>
    <Switch style={{button:{marginLeft:"34px"}}} onClick={onChange} id='switch1' isSelected />
  </div>
  )
}


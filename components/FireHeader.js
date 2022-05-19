import SVGIcon from '../components/SVGIcon'
import {useState, useEffect, useRef} from 'react'
import {useScrollPosition} from '../hooks/useScrollPosition'
import Link from 'next/link'

export default function FireHeader({
  title = 'Orders',
  href = '/[adminID]/orders/active',
  as = null,
}) {
  const [isScrolled, setIsScrolled] = useState(false)
  const scrollRef = useRef(null)

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

  useScrollPosition(
    ({currPos}) => {
      const isTop = currPos.y != 0
      if (isTop !== isScrolled) setIsScrolled(isTop)
    },
    [isScrolled]
  )

  return (
    <header className='fire-header'>
      <div className='fire-appbar'>
        <div
          ref={scrollRef}
          className='app-bar canvas-theme-container'
          style={{
            background: isScrolled ? 'rgb(246, 247, 249)' : 'transparent',
          }}>
          <div className='left'>
            <button
              onClick={() => setIsCollapsed(false)}
              aria-label='Open navigation menu'
              className='button-base mat-icon-button mobile-navbar-toggle'>
              <span className='button-wrapper'>
                <SVGIcon color={'#476282'} name={'menu'} />
              </span>
            </button>
          </div>

          <div className='middle'>
            <div ref={scrollRef} className='fire-appbar-crumbs'>
              <div className='container'>
                <span className='crumb page-crumb'>
                  <Link href={href} as={as} scroll={true}>
                    <a>{title}</a>
                  </Link>
                </span>
              </div>
            </div>
          </div>

          <div className='right'>
            <span className='gmp-icons' aria-hidden='true'>
              <SVGIcon
                style={{transform: 'scale(1)'}}
                color={'#476282'}
                name={'bellFilled'}
              />
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

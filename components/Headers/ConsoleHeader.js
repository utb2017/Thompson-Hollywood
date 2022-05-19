import SVGIcon from '../../components/SVGIcon'
import Link from 'next/link'
import {useRouter} from 'next/router'
import SettingsAlertMenu from '../../components/SettingsAlertMenu'
export default function ConsoleHeader({
  title = 'default',
  id = 'console-header',
  isScrolled = false,
}) {
  const router = useRouter()
  const {asPath, pathname} = router
  return (
    <>
      <header id={id}>
        <div className='fire-appbar'>
          <div
            className={`app-bar canvas-theme-container${
              isScrolled ? ` is-scrolled` : ''
            }`}
            style={{
              background: isScrolled ? 'rgb(255, 255, 255)' : 'transparent',
            }}>
            <div className='left'>
              <Link
                href={`${pathname}?menu`}
                as={`${asPath}?menu`}
                scroll={false}>
                <button
                  aria-label='Open navigation menu'
                  className='button-base mat-icon-button mobile-navbar-toggle'>
                  <span className='button-wrapper'>
                    <SVGIcon color={'#476282'} name={'menu'} />
                  </span>
                </button>
              </Link>
            </div>
            <div className='middle'>
              <div className='fire-appbar-crumbs'>
                <div className='container'>
                  <span className='crumb page-crumb'>
                    <Link href={`${pathname}`} as={`${asPath}`}>
                      <a href='#'>{title || 'Missing Title'}</a>
                    </Link>
                  </span>
                </div>
              </div>
            </div>
            <div className='right'>
              <Link href={`${pathname}?alert`} as={`${asPath}?alert`}>
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
            </div>
          </div>
        </div>
      </header>
      <SettingsAlertMenu />
    </>
  )
}

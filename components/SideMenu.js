import React, { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import SVGIcon from '../components/SVGIcon'
import { useUser } from '../context/userContext'
import { logout } from '../firebase/clientApp'

function SideMenu() {
  const { query = {} } = useRouter()
  const overlayRef = useRef(null)
  const menuRef = useRef(null)
  const nameRef = useRef(null)
  const { user, loadingUser } = useUser()

  /** CSS **/
  useEffect(() => {
    const overlay = ['product-list-side-menu-overlay', 'button-base']
    const menu = ['side-menu', 'left']
    if ('menu' in query) {
      overlay.push('is-visible')
      menu.push('is-visible')
    }
    overlayRef.current.className = overlay.join(' ')
    menuRef.current.className = menu.join(' ')
  }, [query, overlayRef, menuRef])

  /*Display Name*/
  useEffect(() => {
    let text = 'Not signed in.'
    if (!loadingUser && user) {
      if (user.displayName) {
        text = user.displayName
      } else {
        text = user.email
      }
    }
    nameRef.current.innerHTML = text
  }, [user, loadingUser, nameRef])

  const handleLogout = (e) => logout()

  return (
    <>
      <Link href='/'>
        <button
          ref={overlayRef}
          className='product-list-side-menu-overlay button-base'
        />
      </Link>
      <ul ref={menuRef} className='side-menu left'>
        <li className='side-menu-header-bar'>
          <Link href='/'>
            <button className='navigation-bar-button left button-base back'>
              <SVGIcon name='x' color='rgb(0,200,5)' />
            </button>
          </Link>
          <h3>Menu</h3>
        </li>
        <li className='side-menu-item side-menu-header'>
          <div>
            <p className='side-menu-title'>Hello!</p>
            <p ref={nameRef}>Not signed in.</p>
          </div>
        </li>
        {!user ? (
          <>
            <li className='side-menu-item'>
              <Link href='/sign-up'>
                <a>Sign Up</a>
              </Link>
            </li>
            <li className='side-menu-item side-menu-item-no-border'>
              <Link href='/sign-in'>
                <a>Sign In</a>
              </Link>
            </li>
          </>
        ) : (
          <>
            <li className='side-menu-item side-menu-item-no-border'>
              <Link href='/user/profile'>
                <a>Update Profile</a>
              </Link>
            </li>
            <li className='side-menu-item side-menu-item-no-border'>
              <Link href='/user/documents/license'>
                <a>Update Photo ID</a>
              </Link>
            </li>
            <li className='side-menu-item'>
              <button className='button-base red' onClick={handleLogout}>
                Sign Out
              </button>
            </li>
          </>
        )}
      </ul>
    </>
  )
}

export default SideMenu
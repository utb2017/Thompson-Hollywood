import React, {useRef, useEffect, useMemo} from 'react'
import {
  useDispatchFilter,
  useStateFilter,
  ACTIVE_ORDERS,
  COMPLETE_ORDERS,
  CANCEL_ORDERS,
  DEDUCTION_ORDERS,
} from '../context/filterContext'
import {useScreen} from '../context/screenContext'
import {useUser} from '../context/userContext'
import Link from 'next/link'
import {useRouter} from 'next/router'

function NavBar() {
  const {user} = useUser()
  const filterDispatch = useDispatchFilter()
  const {asPath, pathname, query} = useRouter()
  const {filter} = useStateFilter()
  const activeRef = useRef(null)
  const completeRef = useRef(null)
  const cancelRef = useRef(null)

  useEffect(() => {
    let activeClass = ''
    let completeClass = ''
    let cancelClass = ''
    if (query?.filter === 'active') {
      activeClass = 'is-active'
    } else if (query?.filter === 'complete') {
      completeClass = 'is-active positive'
    } else if (query?.filter === 'cancel') {
      cancelClass = 'is-active negative'
    }
    activeRef.current.className = activeClass
    completeRef.current.className = completeClass
    cancelRef.current.className = cancelClass
  }, [query])

  return (
    <div className='tabs is-centered'>
      <ul>
        <li ref={activeRef}>
          <Link href={`/${user?.uid}/orders/active`} scroll={false}>
            <button
              className='button-base'
            >
              Active
            </button>
          </Link>
        </li>

        <li ref={completeRef}>
          <Link href={`/${user?.uid}/orders/complete`} scroll={false}>
            <button
              className='button-base'
            >
              Complete
            </button>
          </Link>
        </li>
        <li ref={cancelRef}>
          <Link href={`/${user?.uid}/orders/cancel`} scroll={false}>
            <button
              className={'button-base'}
            >
              Canceled
            </button>
          </Link>
        </li>
      </ul>
    </div>
  )
}

export default NavBar

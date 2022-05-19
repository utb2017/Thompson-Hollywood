import React, { useEffect, useState, useMemo, useRef, useLayoutEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import SVGIcon from '../components/SVGIcon'
import { useUser } from '../context/userContext'
import { updateDatabase } from '../firebase/clientApp'
import OrderList from '../components/OrderList'
import { ACTIVE_ORDERS } from '../context/filterContext'



const COMPLETE = `complete`
const DRIVER = `driver`
const ERROR = `error`
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]
const dateStr = (x) => `${MONTHS[parseInt(x[0]) - 1]} ${x[1]}`
const formatDate = (d) =>
  `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`
const usCurrency = (x) =>
  x.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
const getCashOwed = ({ orders = {}, filter = [], variant }) => {
  const x = Object.entries(orders || {})
  let y = 0
  for (let i = 0; i < x.length; i++) {
    const { cart = {}, driver = {}, progress = {} } = x[i][1]
    const { grandTotal = 0 } = cart
    const { pay = 0 } = driver
    const { current = '' } = progress
    if (filter.includes(current)) {
      let z = variant === DRIVER ? pay : grandTotal - pay
      y += z
    }
  }
  return y
}
const getOrderKeys = ({ orders = {}, filter = [] }) => {
  const x = Object.entries(orders || {})
  let y = []
  for (let i = 0; i < x.length; i++) {
    const { progress = {}, key = ERROR } = x[i][1]
    const { current } = progress
    if (filter.length) {
      filter.includes(current) && y.push(key)
    } else {
      y.push(key)
    }
  }
  return y
}
const getTimeSpan = ({ orders, filter = COMPLETE }) => {
  const x = Object.entries(orders || {})
  const date = formatDate(new Date())
  let y = [date]
  let r = `${dateStr(date.split(`-`))}`
  for (let i = 0; i < x.length; i++) {
    const {
      time: { date = {} },
      progress: { current = {} },
    } = x[i][1]
    if (filter.includes(current)) {
      let z = formatDate(new Date(date))
      y.push(z)
    }
  }
  if (y.length > 1) {
    y.sort((a, b) => new Date(b) - new Date(a))
    let l = dateStr(y[0].split(`-`))
    let f = dateStr(y[y.length - 1].split(`-`))
    r = `${f} - ${l}`
  }
  return r
}

function CartMenu() {
  const { query = {} } = useRouter()
  const { orders, user } = useUser()

  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [timeSpan, setTimeSpan] = useState(
    dateStr(formatDate(new Date()).split(`-`))
  )
  const [completeOrders, setCompleteOrders] = useState(0)
  const [disabled, setDisabled] = useState(true)
  const [cashOwed, setCashOwed] = useState('$0.00')
  const [hasActiveOrders, setHasActiveOrders] = useState(false)
  const [cashoutText, setCashoutText] = useState(false)

  // const [subTotal, setSubTotal] = useState(false)
  // const [tax, setTax] = useState(false)
  // const [discount, setDiscount] = useState(false)
  // const [fee, setFee] = useState(false)
  // const [grandTotal, setGrandTotal] = useState(false)

  const overlayRef = useRef(null)
  const menuRef = useRef(null)
  const orderSumRef = useRef(null)

  const cashoutButtonRef = useRef(null)

  //useLockBodyScroll();

  /** TimeSpan State && Complete order Sum && cash owed**/
  useMemo(() => {
    const span = getTimeSpan({ orders })
    const total = getOrderKeys({ orders, filter: [COMPLETE] }).length
    const owed = usCurrency(getCashOwed({ orders, filter: [COMPLETE] }))
    const active = Boolean(
      getOrderKeys({ orders, filter: ACTIVE_ORDERS }).length
    )
    setTimeSpan(span)
    setCompleteOrders(total)
    setCashOwed(owed)
    setHasActiveOrders(active)
  }, [orders])

  /** Open Close Drawer **/
  useEffect(() => {
    const overlay = ['product-list-side-menu-overlay', 'button-base']
    const menu = ['side-menu', 'right']
    if ('cart' in query) {
      overlay.push('is-visible')
      menu.push('is-visible')
      setMounted(true)
    }else{
      setMounted(false)
    }
    overlayRef.current.className = overlay.join(' ')
    menuRef.current.className = menu.join(' ')
  }, [query])



  /** Disable Cash Button **/
  useEffect(() => {
    const css = ['button-base progress-button auth']
    let btnTxt = 'Checkout'
    const isDisabled = loading || !user || !completeOrders || hasActiveOrders
    if (isDisabled) {
      css.push('disabled')
      if(hasActiveOrders){
        btnTxt = 'Complete Orders to Unlock'
      }
    }
    setCashoutText(btnTxt) 
    setDisabled(isDisabled)
    cashoutButtonRef.current.className = css.join(' ')
  }, [loading, user, completeOrders, hasActiveOrders])

  const handleCashout = () => {
    setLoading(true)
    const { displayName, uid, phoneNumber = '7066152562', email } = user
    const date = formatDate(new Date())
    const key = `${date}-${displayName?.replace(/\s/g, '-') || uid}`
    const variant = DRIVER
    setTimeout(() => {
      //remove uid from driver to take orders off list
      let orderUpdates = {}
      for (let i = 0; i < orders.length; i++) {
        orderUpdates[`/${orders[i].key}/driver`] = {
          email,
          displayName,
          phoneNumber,
          uid,
          pay: orders[i].driver.pay,
        }
        orderUpdates[`/${orders[i].key}/settlement`] = {
          displayName,
          email,
          phoneNumber,
          uid,
          date,
          pay: orders[i].driver.pay,
          key,
        }
      }
      const cashout = {
        uid,
        cashOwed,
        completeOrders,
        phoneNumber,
        orders: getOrderKeys({ orders }),
        pay: usCurrency(getCashOwed({ orders, filter: [COMPLETE], variant })),
        displayName,
        date,
      }
      updateDatabase({
        ref: `Orders/`,
        update: orderUpdates,
      })
        .then(() =>
          updateDatabase({
            ref: `Cashouts/${key}`,
            update: cashout,
          })
        )
        .finally(() => setLoading(false))
    }, 2000)
  }

  return (
    <>
      <Link href='/'>
        <button
          ref={overlayRef}
          className='product-list-side-menu-overlay button-base'
        />
      </Link>
      <ul ref={menuRef} className='side-menu right'>
        <li className='side-menu-header-bar'>
          <Link href='/'>
            <button className='navigation-bar-button right button-base back'>
              <SVGIcon name='x' color='rgb(0,200,5)' />
            </button>
          </Link>
          <h3>Cart</h3>
        </li>
        {/* <li className='side-menu-item side-menu-header'>
          <div>
            <h3>Total</h3>
            <p ref={cashOwedRef} className='menu-item-green'>
              $0.00
            </p>
          </div>
        </li> */}
        {mounted && <OrderList filter={['complete']} />}

        <div className='absolute-bottom flex-box progress-button-box align-items-center'>
          <div className='flex-one flex-box progress-b2'>
            <button
              ref={cashoutButtonRef}
              className='button-base progress-button auth disable'
              disabled={disabled}
              onClick={handleCashout}
            >
              {!loading 
                ? cashoutText
                : (
                  <div className='inline-loading'>
                    <div className='spinner' />
                  </div>
                )}
            </button>
          </div>
        </div>
      </ul>
    </>
  )
}

export default CartMenu

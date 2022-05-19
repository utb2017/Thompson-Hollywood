import Link from 'next/link'
import {useRouter} from 'next/router'
import {useUser} from '../context/userContext'
import {forwardRef, useState} from 'react'
import SVGIcon from '../components/SVGIcon'
import CartItem from '../components/CartItem'
import CartItemSkeleton from '../components/CartItemSkeleton'
import Header from './Header'

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
          router.pathname === href ? 'mat-tab-label-active' : ''
        }`.trim()}>
        {children}
      </a>
    </Link>
  )
}

const CreateOrdersLayout = forwardRef(({children, location, customer, menu}, ref) => {
  const {
    user,
    cartItems,
    cart,
    salesTax,
    localTax,
    exciseTax,
    deliveryFee,
    grandTotal,
    feeWave,
    subtotal,
    feeTotal,
    fireUser,
  } = useUser()

  const [disabled, setDisabled] = useState(false)
  const [loading, setLoading] = useState(false)
  return (
    <>
      <Header title={'Products'} />
      <div className={'container__Container-bmcn2o-0 AoYhE'}>
        <main
          style={{width: '100%', flex: '1 0 0%'}}
          className='content c5e-nav-expanded canvas-theme-container'
          id='main'>
          <div className='fire-feature-bar'>
            <div className='feature-bar-page-margins canvas-theme-container'>
              <div className='feature-bar-crumbs' />
              <div className='feature-bar-content'>
                <div className='feature-bar-primary-row'>
                  <div className='feature-title-lockup stretch-across'>
                    <div className='fire-feature-bar-title'>
                      <h1 className='fire-feature-bar-title'>Create Order</h1>
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
                              href={'/[adminID]/create-order/location'}
                              as={`/${user?.uid}/create-order/location`}>
                              Location
                            </ActiveLink>
                            <ActiveLink
                              href={'/[adminID]/create-order/customer'}
                              as={`/${user?.uid}/create-order/customer`}>
                              Info
                            </ActiveLink>

                            <ActiveLink
                              href={'/[adminID]/create-order/products'}
                              as={`/${user?.uid}/create-order/products?collection=flower`}>
                              Menu
                            </ActiveLink>
                          </div>
                          {/* <div
                        className='mat-ink-bar'
                        style={{visibility: 'visible', left: 24, width: 37}}
                      /> */}
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

        <div className='container__Overview-bmcn2o-2 iNgkYK'>
          <div className='sc-AxjAm confirmation__ConfirmationWrap-a8sj4-0 iYTVmj'>
            <div className='sc-AxjAm confirmation__ConfirmationBox-a8sj4-1 dUWBDY'>
              {location && (
                <>
                  <div
                    style={{
                      position: 'relative',
                    }}>
                    <span
                      className='rmq-d2ed06c rmq-aac9c2ff'
                      data-radium='true'
                      style={{
                        position: 'absolute',
                        top: 0,
                        cursor: 'pointer',
                        border: 'none',
                        background: 'none',
                        left: 3,
                      }}>
                      <SVGIcon
                        style={{transform: 'scale(0.9)'}}
                        color={'#476282'}
                        name={'locationMarkerFilled'}
                      />
                    </span>

                    <div
                      className='rmq-28f9c13a'
                      data-radium='true'
                      style={{marginBottom: 15, marginLeft: 42}}>
                      <div>
                        <h2
                          style={{
                            margin: 0,
                            fontSize: '1rem',
                            color: 'rgb(27, 58, 87)',
                          }}>
                          <b>Add delivery address</b>
                        </h2>
                        <div />
                        <small>
                          <i />
                        </small>
                      </div>
                    </div>
                  </div>

                  <div
                    ref={ref}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '12px',
                    }}
                  />
                  <section
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '18px',
                    }}>
                    <div className='css-onh085 e10a4my48' style={{height: 76}}>
                      <textarea
                        placeholder='add order instructions (e.g. Unit B)'
                        maxLength={100}
                        className='css-1c4smj5 e10a4my49'
                        style={{height: '76px !important'}}
                        spellCheck='false'
                        defaultValue={'add order instructions (e.g. Unit B)'}
                      />
                    </div>
                  </section>

                  <button
                    //onClick={placeOrder}
                    disabled={disabled || loading}
                    data-bypass='false'
                    data-radium='true'
                    className='button-base'
                    style={{
                      backgroundColor:
                        disabled || loading ? 'rgb(224, 224, 224)' : 'rgb(27, 58, 87)',
                      borderColor:
                        disabled || loading ? 'rgb(224, 224, 224)' : 'rgb(27, 58, 87)',
                      height: '48px',
                      fontSize: '18px',
                      borderRadius: '5px',
                      textAlign: 'center',
                      fontWeight: 600,
                      position: 'relative',
                      display: 'block',
                      padding: '10px 18px',
                      color: 'rgb(255, 255, 255)',
                      width: '100%',
                    }}>
                    <div className='rmq-a26a37a6' data-radium='true'>
                      {!loading && 'Confirm Address'}
                      {loading && (
                        <div className='inline-loading'>
                          <div className='spinner' />
                        </div>
                      )}

                      <span
                        data-radium='true'
                        style={{
                          fontSize: 20,
                          color: 'rgb(255, 255, 255)',
                          display: 'none',
                        }}>
                        <svg
                          width='24px'
                          height='24px'
                          viewBox='0 0 24 24'
                          aria-hidden='true'
                          fill='currentColor'>
                          <path d='M15.711 11.272l-5-4.979a.999.999 0 0 0-1.415.002c-.39.39-.384 1.03 0 1.413l4.296 4.276-4.3 4.306a1.008 1.008 0 0 0-.002 1.416.998.998 0 0 0 1.415 0l5.006-5.013c.185-.185.282-.429.29-.676a.999.999 0 0 0-.29-.745z' />
                        </svg>
                      </span>
                    </div>
                  </button>
                </>
              )}
              {customer && (
                <>
                  <div
                    style={{
                      position: 'relative',
                    }}>
                    <span
                      className='rmq-d2ed06c rmq-aac9c2ff'
                      data-radium='true'
                      style={{
                        position: 'absolute',
                        top: 0,
                        cursor: 'pointer',
                        border: 'none',
                        background: 'none',
                        left: 3,
                      }}>
                      <SVGIcon
                        style={{transform: 'scale(0.9)'}}
                        color={'#476282'}
                        name={'locationMarkerFilled'}
                      />
                    </span>

                    <div
                      className='rmq-28f9c13a'
                      data-radium='true'
                      style={{marginBottom: 15, marginLeft: 42}}>
                      <div>
                        <h2
                          style={{
                            margin: 0,
                            fontSize: '1rem',
                            color: 'rgb(27, 58, 87)',
                          }}>
                          <b>Delivery address</b>
                        </h2>
                        <div />
                        6358 Yucca St.
                      </div>
                    </div>
                  </div>
                </>
              )}
              {menu && (
                <>
                  <div
                    style={{
                      position: 'relative',
                    }}>
                    <span
                      className='rmq-d2ed06c rmq-aac9c2ff'
                      data-radium='true'
                      style={{
                        position: 'absolute',
                        top: 0,
                        cursor: 'pointer',
                        border: 'none',
                        background: 'none',
                        left: 3,
                      }}>
                      <SVGIcon
                        style={{transform: 'scale(0.9)'}}
                        color={'#476282'}
                        name={'locationMarkerFilled'}
                      />
                    </span>

                    <div
                      className='rmq-28f9c13a'
                      data-radium='true'
                      style={{marginBottom: 15, marginLeft: 42}}>
                      <div>
                        <h2
                          style={{
                            margin: 0,
                            fontSize: '1rem',
                            color: 'rgb(27, 58, 87)',
                          }}>
                          <b>Delivery address</b>
                        </h2>
                        <div />
                        6358 Yucca St.
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      position: 'relative',
                    }}>
                    <span
                      className='rmq-d2ed06c rmq-aac9c2ff'
                      data-radium='true'
                      style={{
                        position: 'absolute',
                        top: 0,
                        cursor: 'pointer',
                        border: 'none',
                        background: 'none',
                        left: 3,
                      }}>
                      <SVGIcon
                        style={{transform: 'scale(0.9)'}}
                        color={'#476282'}
                        name={'personFilled'}
                      />
                    </span>

                    <div
                      className='rmq-28f9c13a'
                      data-radium='true'
                      style={{marginBottom: 15, marginLeft: 42}}>
                      <div>
                        <h2
                          style={{
                            margin: 0,
                            fontSize: '1rem',
                            color: 'rgb(27, 58, 87)',
                          }}>
                          <b>Customer</b>
                        </h2>
                        <div />
                        +17066152562
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      position: 'relative',
                    }}>
                    <span
                      className='rmq-d2ed06c rmq-aac9c2ff'
                      data-radium='true'
                      style={{
                        position: 'absolute',
                        top: 0,
                        cursor: 'pointer',
                        border: 'none',
                        background: 'none',
                        left: 3,
                      }}>
                      <SVGIcon
                        style={{transform: 'scale(0.9)'}}
                        color={'#476282'}
                        name={'cartFilled'}
                      />
                    </span>

                    <div
                      className='rmq-28f9c13a'
                      data-radium='true'
                      style={{marginBottom: 15, marginLeft: 42}}>
                      <div>
                        <h2
                          style={{
                            margin: 0,
                            fontSize: '1rem',
                            color: 'rgb(27, 58, 87)',
                          }}>
                          <b>Items</b>
                        </h2>
                        <div />
                      </div>
                    </div>
                  </div>

                  {/* Product */}
                  {cart?.status === 'success'
                    ? cartItems.map(
                        (
                          {genome, pid, img, inventory, name, price, size, type, qty, wholesale},
                          i
                        ) => (
                          <CartItem
                            //disableChange={loading}
                            key={i}
                            qty={qty}
                            genome={genome}
                            pid={pid}
                            img={img}
                            inventory={inventory}
                            name={name}
                            price={price}
                            size={size}
                            type={type}
                            wholesale={wholesale||0}
                          />
                        )
                      )
                    : [0, 1, 2, 4].map((i) => <CartItemSkeleton key={i} />)}

                  {/* Totals */}
                  {cart?.status === 'success' ? (
                    <div className='module-wrapper module-wrapper'>
                      <section style={{padding: '1.5rem 0px'}}>
                        <div className='css-149ghmn e17qz39z0' />
                        <div className='css-1v3870x e9mvujh0'>
                          <div style={{position: 'relative'}}>
                            <div className='css-1fh9ug8 e1m3c6hs1'>
                              <div className='css-1ofqig9 ej2tyaj0'>
                                <div type='faded' className='css-1woe1iy ey3gvnc0'>
                                  <div className='css-95g4uk ey3gvnc2'>
                                    <div className='css-1vd84sn ey3gvnc5'>
                                      Subtotal
                                      <div className='css-77vupy ey3gvnc1' />
                                    </div>
                                    <div className='css-vqyk7m ey3gvnc3'>
                                      {subtotal
                                        ? subtotal.toLocaleString('en-US', {
                                            style: 'currency',
                                            currency: 'USD',
                                          })
                                        : '--'}
                                    </div>
                                  </div>
                                </div>
                                <div type='faded' className='css-1woe1iy ey3gvnc0'>
                                  <div className='css-95g4uk ey3gvnc2'>
                                    <div className='css-1vd84sn ey3gvnc5'>
                                      Taxes &amp; Fees
                                      <div className='css-77vupy ey3gvnc1'>
                                        <Link
                                          scroll={false}
                                          href={`?taxes=true&sales=${salesTax}&local=${localTax}&excise=${exciseTax}`}>
                                          <a
                                            data-e2eid='TaxesAndFeesButton'
                                            style={{verticalAlign: 'text-top'}}>
                                            <svg
                                              width='16px'
                                              height='16px'
                                              viewBox='0 0 16 16'
                                              version='1.1'
                                              xmlns='http://www.w3.org/2000/svg'
                                              xmlnsXlink='http://www.w3.org/1999/xlink'
                                              aria-labelledby='more-info-title'
                                              role='img'>
                                              <title id='more-info-title'>
                                                More Info
                                              </title>
                                              <g
                                                id='more-info'
                                                stroke='none'
                                                strokeWidth={1}
                                                fill='none'
                                                fillRule='evenodd'>
                                                <g
                                                  id='noun_Info_932469'
                                                  fill='rgb(0,200,5)'>
                                                  <path
                                                    d='M7.40571429,6.53428571 L8.59142857,6.53428571 L8.59142857,11.6771429 L7.40571429,11.6771429 L7.40571429,6.53428571 Z M7.40571429,4.32285714 L8.59142857,4.32285714 L8.59142857,5.52 L7.40571429,5.52 L7.40571429,4.32285714 Z M8,16 C3.581722,16 1.77635684e-15,12.418278 1.77635684e-15,8 C7.61295788e-16,3.581722 3.581722,0 8,0 C12.418278,-1.01506105e-15 16,3.581722 16,8 C16,12.418278 12.418278,16 8,16 Z M8,1.18857143 C4.23815188,1.18857143 1.18857143,4.23815188 1.18857143,8 C1.18857143,11.7618481 4.23815188,14.8114286 8,14.8114286 C11.7618481,14.8114286 14.8114286,11.7618481 14.8114286,8 C14.8082777,4.23945778 11.7605422,1.19172228 8,1.18857143 Z'
                                                    id='Combined-Shape'
                                                  />
                                                </g>
                                              </g>
                                            </svg>
                                          </a>
                                        </Link>
                                      </div>
                                    </div>
                                    <div className='css-vqyk7m ey3gvnc3'>
                                      {feeTotal
                                        ? feeTotal.toLocaleString('en-US', {
                                            style: 'currency',
                                            currency: 'USD',
                                          })
                                        : '--'}
                                    </div>
                                  </div>
                                </div>
                                <div type='faded' className='css-1woe1iy ey3gvnc0'>
                                  <div className='css-95g4uk ey3gvnc2'>
                                    <div className='css-1vd84sn ey3gvnc5'>
                                      Delivery
                                      <div className='css-77vupy ey3gvnc1' />
                                    </div>
                                    <div
                                      className='css-17yp4d9 ey3gvnc3'
                                      style={
                                        subtotal >= 100
                                          ? {textDecoration: 'line-through'}
                                          : {}
                                      }>
                                      {subtotal > 0
                                        ? deliveryFee.toLocaleString('en-US', {
                                            style: 'currency',
                                            currency: 'USD',
                                          })
                                        : '--'}
                                    </div>
                                  </div>
                                  <div type='green' className='css-yulum8 ey3gvnc6'>
                                    {` Free delivery for $${feeWave}+ orders!`}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className='css-m0iina e17qz39z0' />
                          </div>
                        </div>
                      </section>
                    </div>
                  ) : (
                    <div className='module-wrapper module-wrapper'>
                      <section style={{padding: '1.5rem 0px'}}>
                        <div className='css-149ghmn e17qz39z0' />
                        <div className='css-1v3870x e9mvujh0'>
                          <div style={{position: 'relative'}}>
                            <div className='css-1fh9ug8 e1m3c6hs1'>
                              <div className='css-1ofqig9 ej2tyaj0'>
                                <div type='faded' className='css-1woe1iy ey3gvnc0'>
                                  <div className='css-95g4uk ey3gvnc2'>
                                    <div className='ey3gvnc5 holder'>
                                      <div className='width-30' />
                                    </div>
                                    <div
                                      className='holder'
                                      style={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                      }}>
                                      <div className='width-30' />
                                    </div>
                                  </div>
                                </div>
                                <div
                                  type='faded'
                                  className='css-1woe1iy ey3gvnc0'
                                  style={{marginTop: '4px'}}>
                                  <div className='css-95g4uk ey3gvnc2'>
                                    <div className='ey3gvnc5 holder'>
                                      <div className='width-40' />
                                    </div>
                                    <div
                                      className='holder'
                                      style={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                      }}>
                                      <div className='width-30' />
                                    </div>
                                  </div>
                                </div>
                                <div
                                  type='faded'
                                  className='css-1woe1iy ey3gvnc0'
                                  style={{marginTop: '4px'}}>
                                  <div className='css-95g4uk ey3gvnc2'>
                                    <div className='ey3gvnc5 holder'>
                                      <div className='width-30' />
                                    </div>
                                    <div
                                      className='holder'
                                      style={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                      }}>
                                      <div className='width-30' />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className='css-m0iina e17qz39z0' />
                          </div>
                        </div>
                      </section>
                    </div>
                  )}

                  <button
                    //onClick={placeOrder}
                    disabled={disabled || loading}
                    data-bypass='false'
                    data-radium='true'
                    className='button-base'
                    style={{
                      backgroundColor:
                        disabled || loading ? 'rgb(224, 224, 224)' : 'rgb(27, 58, 87)',
                      borderColor:
                        disabled || loading ? 'rgb(224, 224, 224)' : 'rgb(27, 58, 87)',
                      height: '48px',
                      fontSize: '18px',
                      borderRadius: '5px',
                      textAlign: 'center',
                      fontWeight: 600,
                      position: 'relative',
                      display: 'block',
                      padding: '10px 18px',
                      color: 'rgb(255, 255, 255)',
                      width: '100%',
                    }}>
                    <div className='rmq-a26a37a6' data-radium='true'>
                      {!loading && 'Place Order'}
                      {loading && (
                        <div className='inline-loading'>
                          <div className='spinner' />
                        </div>
                      )}

                      <span
                        data-radium='true'
                        style={{
                          fontSize: 20,
                          color: 'rgb(255, 255, 255)',
                          display: 'none',
                        }}>
                        <svg
                          width='24px'
                          height='24px'
                          viewBox='0 0 24 24'
                          aria-hidden='true'
                          fill='currentColor'>
                          <path d='M15.711 11.272l-5-4.979a.999.999 0 0 0-1.415.002c-.39.39-.384 1.03 0 1.413l4.296 4.276-4.3 4.306a1.008 1.008 0 0 0-.002 1.416.998.998 0 0 0 1.415 0l5.006-5.013c.185-.185.282-.429.29-.676a.999.999 0 0 0-.29-.745z' />
                        </svg>
                      </span>
                    </div>
                    <div
                      data-radium='true'
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                      }}>
                      <div
                        data-radium='true'
                        style={{
                          background:
                            'linear-gradient(rgba(20, 20, 20, 0.2), rgba(20, 20, 20, 0.2))',
                          padding: '4px 7px',
                          borderRadius: '5px',
                          fontSize: '14px',
                        }}>
                        {cart?.status === 'success' ? (
                          grandTotal > 0 ? (
                            grandTotal.toLocaleString('en-US', {
                              style: 'currency',
                              currency: 'USD',
                            })
                          ) : (
                            '--.--'
                          )
                        ) : (
                          <div className='inline-loading'>
                            <div className='spinner' />
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
})

export default CreateOrdersLayout

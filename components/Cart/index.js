import React, { useEffect, useRef, useState, createRef } from "react"
import { useRouter } from "next/router"
import { useUser } from "../../context/userContext"
import Link from "next/link"
import SVGIcon from "../../components/SVGIcon"
import { disableBodyScroll, clearAllBodyScrollLocks } from "body-scroll-lock"
import CartItem from "./CartItem"
import CartItemSkeleton from "./CartItemSkeleton"
import CartTotalsSkeleton from "./CartTotalsSkeleton"
import { isCurr, isNum, isStr } from "../../helpers"
import { useDispatchModal } from "../../context/modalContext"
import { addPromo, AddPromoCode, DeletePromo } from "../../components/Modals"
import { useFirestoreQuery } from "../../hooks/useFirestoreQuery"
import firebase from "../../firebase/clientApp"
import Button from "../Buttons/Button"
import { TotalsRow } from "../Split"
import Spinner from "../Buttons/Spinner"

const getGrandTotal = (cartTotals) => {
  //subtotal + taxTotal
  return
}
const isCurrX = (x) => {
  const y = "Error"
  if (!["string", "number"].includes(typeof x)) return y
  if (x === undefined) return y
  if (x === null) return y
  if (x === NaN) return y
  if (isNum(x) > 0) {
    return x.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })
  } else {
    return y
  }
}

const CartList = ({ fireCartTotals }) => {
  const [cartComponentList, setCartComponentList] = useState([])
  const { fireCart } = useUser()

  useEffect(() => {
    console.log("fireCartTotals")
    console.log(fireCartTotals)
    const tempArray = []
    if (fireCartTotals?.data && fireCart?.data) {
      for (const key in fireCart?.data) {
        const fireProduct = fireCart?.data[key]

        console.log("fireProduct")
        console.log(fireProduct)
        console.log("key")
        console.log(key)
        if (typeof fireProduct === "object" && fireProduct !== null) {
          if(fireProduct?.id !== 'items' && fireProduct?.id !=='totals'){
            tempArray.push(<CartItem {...{ fireProduct }} />)
          }
          
        }
      }
      if (tempArray?.length <= 0) {
        tempArray.push(
          <div className='empty-cart'>
            <div className='empty-bag'>
              <SVGIcon name='bag' />
            </div>
            <h2>Empty Cart</h2>
          </div>
        )
      }
    }
    if (fireCartTotals.status === "loading") {
      const dummy = [0, 1, 2]
      for (const key in dummy) {
        tempArray.push(<CartItemSkeleton key={key} />)
      }
    }

    setCartComponentList(tempArray)
  }, [fireCart?.data, fireCartTotals])

  return cartComponentList
}
const RemoveButton = ({ onClick }) => {
  const handleClick = (e) => {
    Boolean(onClick) && onClick(e)
  }
  return (
    <button onClick={handleClick} className='button-base'>
      <svg
        width='18px'
        height='18px'
        viewBox='0 0 24 24'
        aria-hidden='true'
        fill='currentColor'
        style={{
          color: "rgb(212, 54, 132)",
          fontSize: "12px",
          marginLeft: "6px",
        }}>
        <path d='M15 4h4.504c.274 0 .496.216.496.495v2.01a.498.498 0 0 1-.496.495H19v13.006A2 2 0 0 1 16.994 22H7.006A2.001 2.001 0 0 1 5 20.006V7h-.504A.492.492 0 0 1 4 6.505v-2.01C4 4.222 4.226 4 4.496 4H9V2.999A1 1 0 0 1 9.99 2h4.02c.546 0 .99.443.99.999V4zm-.491 1H5v1h14V5h-4.491zM6 7.105v12.888C6 20.55 6.449 21 7.002 21h9.996A1.01 1.01 0 0 0 18 19.993V7.105A.1.1 0 0 0 17.896 7H6.104A.109.109 0 0 0 6 7.105zm4-3.997V5h4V3.108c0-.059-.044-.108-.099-.108H10.1c-.054 0-.099.048-.099.108zM9 10.5c0-.276.232-.5.5-.5.276 0 .5.23.5.5v7c0 .276-.232.5-.5.5-.276 0-.5-.23-.5-.5v-7zm5 0c0-.276.232-.5.5-.5.276 0 .5.23.5.5v7c0 .276-.232.5-.5.5-.276 0-.5-.23-.5-.5v-7z' />
      </svg>
    </button>
  )
}

function Cart({ as, href, fireFeature }) {
  const router = useRouter()
  const { query } = router
  const { user, totalsLoading, setTotalsLoading } = useUser()

  const scrollRef = createRef(null)
  const [mounted, setMounted] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const { modalDispatch, modalState } = useDispatchModal()

  const fireCartTotals = useFirestoreQuery(
    user?.uid &&
      "cart" in query &&
      firebase.firestore().collection("users").doc(user.uid).collection("Totals").doc("cart")
  )

  useEffect(() => {
    setTotalsLoading(false)
  }, [fireCartTotals])

  // useEffect(() => {
  //   if (mounted) {
  //     disableBodyScroll(scrollRef.current)
  //   } else {
  //     clearAllBodyScrollLocks()
  //   }
  // }, [mounted, scrollRef])

  //   useEffect(() => {
  //     console.log("fireCart")
  //     console.log(fireCart?.data)
  //     console.log(typeof fireCart?.data)

  //   }, [fireCart])

  const goToCheckout = () => {
    router.push("/checkout")
  }

  const openModal = (component) => {
    modalDispatch({
      type: "MODAL_UPDATE",
      payload: {
        modal: {
          isOpen: true,
          key: [],
          component,
        },
      },
    })
  }
  const addPromo = () => {
    const component = () => <AddPromoCode {...{fireFeature}} />
    openModal(component)
  }
  const removePromo = () => {
    const component = () => <DeletePromo {...{ fireCartTotals }} />
    openModal(component)
  }
  const collapsable = (e) => {
    if (e.target.id === active) {
      setActive("cart")
    } else {
      setActive(e.target.id)
    }
    return
    // const _this = e.target
    // setActive(e.target.id)
    // _this.classList.toggle("active");
    // var content = _this.nextElementSibling;
    // if (content.style.display === "block") {
    //   content.style.display = "none";
    // } else {
    //   content.style.display = "block";
    //   content.style.overflow = "unset";
    // }
  }
  const expandable = (e) => {
    const _this = e.target
    _this.classList.toggle("active")
    var content = _this.nextElementSibling
    if (content.style.display === "block") {
      content.style.display = "none"
    } else {
      content.style.display = "block"
      content.style.overflow = "unset"
    }
  }
  return (
    <>
      <Link href={href} as={as}>
        <button className={`button-base side-menu-backdrop${"cart" in query ? ` is-visible` : ""}`} />
      </Link>
      <div className={`side-menu right cart-container${"cart" in query ? ` is-visible` : ``}`}>
        <div className='cart-container-inner'>
          <div className='module-flex'>
            <div className='cart-header-wrapper'>
              <div className='cart-header-flex'>
                <div className='center-cart-header'>
                  <h2>Cart</h2>
                </div>
                <div className='left-cart-header'/>
                <div className='right-cart-header'>
                  <Link href={href} as={as}>
                    <button className='button-base'>
                      <SVGIcon name='x' color='rgb(0,200,5)' />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
           

            <div
              ref={scrollRef}
              style={{
                flexGrow: 1,
                overflow: "hidden auto",
                paddingTop: "30px",
                paddingLeft: "16px",
                paddingRight: "16px",
              }}>
              <div
                className='rmq-e9fd10a8 rmq-94de0125 rmq-b2f0735a rmq-55b48a0d rmq-157a0342 rmq-2e961129'
                data-radium='true'
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}>
                <div
                  className='rmq-47bf30d rmq-e8b5057c rmq-bd9ace2b rmq-c413b6e4 rmq-dd3ac64f'
                  data-radium='true'
                  style={{ maxWidth: "100%" }}>

                  {/* Product */}

                  <CartList {...{ fireCartTotals }} />


                  {/* Totals */}  
                  {fireCartTotals?.status === "success" && fireCartTotals.data?.productsSold > 0 && (
                    <div className='cart-total-section'>
                      <section>
                        <div className='border-line' />
                        <div className='section-flex'>
                          <div className='cart-margin'>
                            <div className='totals-list'>
                              <div className={`totals-overlay${totalsLoading ? "" : ` fadeOut`}`}>
                                <Spinner color={"rgb(0,200,5)"} />
                              </div>
                              {fireCartTotals?.data?.hasCoupon && (
                                <TotalsRow
                                  label={
                                    <>
                                      {`Coupon `}
                                      <RemoveButton onClick={removePromo} />
                                    </>
                                  }
                                  value={<>{`-${isCurr(fireCartTotals?.data?.couponsTotal)}`} </>}
                                  //variant='green'
                                />
                              )}
                              {fireCartTotals?.data?.hasCredit && (
                                <TotalsRow
                                  label={<>{`Credit `}</>}
                                  variant='green'
                                  value={<>{`-${isCurr(fireCartTotals?.data?.creditTotal)}`} </>}
                                />
                              )}
                              <TotalsRow
                                label={"Subtotal"}
                                value={
                                  fireCartTotals?.data?.hasCoupon && !fireCartTotals?.data?.taxFree ? (
                                    <>
                                      {`${isCurr(fireCartTotals?.data?.subtotal)}`}
                                      {` `}&nbsp;
                                      <strike>{`${isCurr(fireCartTotals?.data?.productsPrice)}`}</strike>
                                    </>
                                  ) : (
                                    isCurr(fireCartTotals?.data?.subtotal)
                                  )
                                }
                              />
                              <TotalsRow
                                label={"Delivery Fee"}
                                value={
                                  fireCartTotals?.data?.freeDelivery ? (
                                    <>
                                      {`${isCurr(fireCartTotals?.data?.deliveryTotal)}`}
                                      {` `}&nbsp;
                                      <strike>{`${isCurr(fireCartTotals?.data?.deliveryFee)}`}</strike>
                                    </>
                                  ) : (
                                    `+${isCurr(fireCartTotals?.data?.deliveryTotal)}`
                                  )
                                }
                              />
                              <TotalsRow label={"Service Fee"} value={`+${isCurr(fireCartTotals?.data?.serviceFee)}`} />
                              <TotalsRow
                                label={`${fireCartTotals?.data?.exciseTaxRate * 100}% Excise Tax`}
                                //value={`+${isCurr(fireCartTotals?.data?.exciseTaxTotal)}` }
                                value={
                                  fireCartTotals?.data?.taxFree ? (
                                    <>
                                      {`${isCurr(0)}`}
                                      {` `}&nbsp;
                                      <strike>{`${isCurr(fireCartTotals?.data?.exciseTaxTotal)}`}</strike>
                                    </>
                                  ) : (
                                    `+${isCurr(fireCartTotals?.data?.exciseTaxTotal)}`
                                  )
                                }
                              />

                              <TotalsRow
                                label={`${fireCartTotals?.data?.localTaxRate * 100}% Local Tax`}
                                value={
                                  fireCartTotals?.data?.taxFree ? (
                                    <>
                                      {`${isCurr(0)}`}
                                      {` `}&nbsp;
                                      <strike>{`${isCurr(fireCartTotals?.data?.localTaxTotal)}`}</strike>
                                    </>
                                  ) : (
                                    `+${isCurr(fireCartTotals?.data?.localTaxTotal)}`
                                  )
                                }
                              />

                              <TotalsRow
                                label={`${fireCartTotals?.data?.salesTaxRate * 100}% Sales Tax`}
                                value={
                                  fireCartTotals?.data?.taxFree ? (
                                    <>
                                      {`${isCurr(0)}`}
                                      {` `}&nbsp;
                                      <strike>{`${isCurr(fireCartTotals?.data?.salesTaxTotal)}`}</strike>
                                    </>
                                  ) : (
                                    `+${isCurr(fireCartTotals?.data?.salesTaxTotal)}`
                                  )
                                }
                              />

                              <TotalsRow
                                variant='bold'
                                label={"Total"}
                                value={`${getGrandTotal(fireCartTotals?.data)}`}
                              />

                              <TotalsRow
                                variant='red'
                                label={"You saved"}
                                value={`${isCurr(fireCartTotals?.data?.totalSaved)}`}
                              />
                              <div className='cart-margin'>
                                <Button
                                  disabled={fireCartTotals?.data?.hasCoupon}
                                  loading={false}
                                  onClick={addPromo}
                                  variant='green-outline'
                                  fullWidth
                                  text={
                                    fireCartTotals?.data?.hasCoupon
                                      ? `${fireCartTotals?.data?.couponCode} Applied!`
                                      : "Add Promo"
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                      <div style={{ width: "100%", height: "185px" }} />
                    </div>
                  )}
                  {fireCartTotals?.status !== "success" && (
                    <div className='cart-total-section'>
                      <section>
                        <div className='border-line' />
                        <div style={{ marginTop: "26px" }} className='section-flex'>
                          <CartTotalsSkeleton />
                          <CartTotalsSkeleton />
                          <CartTotalsSkeleton />
                        </div>
                      </section>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {
              <div
                className='rmq-e9fd10a8 rmq-94de0125 rmq-b2f0735a rmq-55b48a0d rmq-157a0342 rmq-2e961129'
                data-radium='true'
                style={{ paddingBottom: 0 }}>
                <div className='rmq-47bf30d rmq-e8b5057c rmq-bd9ace2b rmq-c413b6e4 rmq-dd3ac64f' data-radium='true'>
                  <div className='module-wrapper module-wrapper' style={{ marginBottom: 0 }}>
                    <div
                      data-radium='true'
                      style={{ position: "relative", padding: "8px", borderTop: "1px solid rgb(236, 238, 239)" }}>
                      <div aria-disabled='false' data-radium='true'>
                        <div className='dual-input'>
                          {/* <Button
                            disabled={false}
                            loading={false}
                            onClick={addPromo}
                            variant='green-outline'
                            fullWidth
                            text='Add Promo'
                          /> */}
                          {/* <div className='dual-spacer' /> */}
                          <Link href={"/[adminID]/create-order/checkout"} as={`/${user?.uid}/create-order/checkout`}>
                            <Button
                              disabled={false}
                              loading={["idle", "loading"].includes(fireCartTotals.status)}
                              spinnerColor={
                                ["idle", "loading"].includes(fireCartTotals.status)
                                  ? "rgba(255,255,255,0.87)"
                                  : "rgb(0,200,5)"
                              }
                              // onClick={()=>{}}
                              fullWidth
                              variant='green'
                              text='Checkout'
                            />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </>
  )
}

export default Cart

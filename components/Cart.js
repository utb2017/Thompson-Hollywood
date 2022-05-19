import React, { useEffect, useRef, useState, createRef } from "react";
import { useRouter } from "next/router";
import { useUser } from "../context/userContext";
import Link from "next/link";
import SVGIcon from "../components/SVGIcon";
import { disableBodyScroll, clearAllBodyScrollLocks } from "body-scroll-lock";
import CartItem from "./CartItem";
import CartItemSkeleton from "./CartItemSkeleton";
import { isNum, isStr } from "../helpers"
import Button from "./Buttons/Button";
import { useDispatchModal } from "../context/modalContext"
import { addPromo, AddPromoCode } from "../components/Modals"
import { useFirestoreQuery } from "../hooks/useFirestoreQuery"
import firebase from "../firebase/clientApp"


const CartList = () => {
  const [cartComponentList, setCartComponentList] = useState([]);
  const {
    user,
    fireCart,
  } = useUser()
  useEffect(() => {
    const tempArray = []
    for(const key in fireCart?.data){
      const cartItemObject = fireCart?.data[key]
      if(typeof cartItemObject === 'object' && cartItemObject !== null ){
          tempArray.push(<CartItem {...cartItemObject} />)
      }
    }
    setCartComponentList(tempArray)
  }, [fireCart?.data]);
  return cartComponentList
}









function Cart({as, href}) {
  const router = useRouter();
  const {  query } = router;
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
    fireCart,
  } = useUser()
  const scrollRef = createRef(null);

  const [mounted, setMounted] = useState(false);
  const [disabled, setDisabled] = useState(false);
  //const [subtotal, setTotal] = useState(null);
  const [quickAdd, setQuickAdd] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const { modalDispatch, modalState } = useDispatchModal()


  // const fireUserCart = useFirestoreQuery(
  //   (user?.uid && "cart" in query)&& firebase.firestore().collection('cart').doc(user.uid)
  // )   
  const fireCartTotals = useFirestoreQuery(
    user?.uid && "cart" in query && firebase.firestore().collection('users').doc(user.uid).collection('Cart').doc('totals')
  ) 


  
  /** Open Close Drawer **/
  useEffect(() => {
    if ("cart" in query) {
      setTimeout(function () {
        setMounted(true);
      }, 400);
    } else {
      setTimeout(function () {
        setMounted(false);
      }, 400);
    }
  }, [query]);

  useEffect(() => {
    if (mounted) {
      disableBodyScroll(scrollRef.current);
    } else {
      clearAllBodyScrollLocks();
    }
  }, [mounted, scrollRef]);



useEffect(() => {

  console.log("fireCart")

  console.log(fireCart?.data)
  console.log(typeof fireCart?.data)
 // ? fireCart?.data?.map(


}, [fireCart]);


  const goToCheckout = () => {
    router.push('/checkout')
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
    const component = () => <AddPromoCode />
    openModal(component)
  }


  return (
    <>
      <Link href={href} as={as}>
        <button
         // className={`product-list-side-menu-overlay button-base${"cart" in query? ` is-visible`:``}`}
          className={`button-base side-menu-backdrop${('cart' in query)?` is-visible`:''}`}
        />
      </Link>
      <div className={`side-menu right cart-container${"cart" in query? ` is-visible`:``}`}>

        <div className="cart-container-inner">
          <div className="module-renderer" style={{ paddingBottom: 0 }}>
            <div >
              <div
                className="rmq-47bf30d rmq-e8b5057c rmq-bd9ace2b rmq-c413b6e4 rmq-dd3ac64f"
                data-radium="true"
              >
                <div
                  className="module-wrapper module-wrapper"
                  style={{ marginBottom: 0 }}
                >
                  <div
                    className="cart-header-wrapper"
                    data-radium="true"
                    style={{ borderBottom: "1px solid rgb(236, 238, 239)", height: "48px"}}
                  >
                    <div data-radium="true">
                      <div
                        className="rmq-9cd1ef43"
                        data-radium="true"
                        style={{ padding: "12px 15px", display: "flex" }}
                      >
                        <div
                          data-radium="true"
                          style={{
                            order: 1,
                            flex: "1 1 0%",
                            textAlign: "center",
                          }}
                        >
                          <h2
                            className="rmq-3f12454a"
                            data-radium="true"
                            style={{
                              color: "rgb(0,200,5)",
                              fontSize: 16,
                              fontWeight: 600,
                              margin: 0,
                              whiteSpace: "nowrap",
                              textOverflow: "ellipsis",
                              overflow: "hidden",
                              maxWidth: 225,
                              display: "inline-block",
                            }}
                          >
                            Cart
                          </h2>
                          {/* <div
                            className="rmq-9484430c"
                            data-radium="true"
                            style={{
                              marginTop: "-5px",
                              color: "rgb(117, 117, 117)",
                              fontSize: 14,
                              fontWeight: 600,
                            }}
                          >
                            Subtotal: $241.34
                          </div> */}
                        </div>
                        <div
                          className="rmq-f788410 rmq-380c9586"
                          data-radium="true"
                          style={{
                            order: 0,
                            width: "15%",
                            flexBasis: "100px",
                            fontSize: 14,
                            lineHeight: "1px",
                            fontWeight: 600,
                            display: "flex",
                            justifyContent: "center",
                            flexDirection: "column",
                            alignItems: "flex-start",
                          }}
                        >
                          {/* <a
                            href="#"
                            data-bypass="false"
                            data-radium="true"
                            style={{
                              color: "rgb(0,200,5)",
                              cursor: "pointer",
                            }}
                          >
                            My Carts
                          </a> */}
                        </div>
                        <div
                          className="rmq-7d70bc76 rmq-c0ac648c"
                          data-radium="true"
                          style={{
                            order: 2,
                            flexBasis: "100px",
                            justifyContent: "flex-end",
                            paddingRight: "5px",
                            display:"flex",
                          }}
                        >
                          <Link href={href} as={as}>
                            <button className="button-base">
                              <SVGIcon name="x" color="rgb(0,200,5)" />
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              ref={scrollRef}
              style={{ flexGrow: 1, overflow: "hidden auto", paddingTop: "30px", paddingLeft:"16px", paddingRight:"16px" }}
            >
              <div
                className="rmq-e9fd10a8 rmq-94de0125 rmq-b2f0735a rmq-55b48a0d rmq-157a0342 rmq-2e961129"
                data-radium="true"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  //backgroundColor: "rgb(247, 247, 247)",
                }}
              >
                <div
                  className="rmq-47bf30d rmq-e8b5057c rmq-bd9ace2b rmq-c413b6e4 rmq-dd3ac64f"
                  style={{ maxWidth: "100%" }}
                >
                  {/* Product */}
                  <CartList/>
                  {/* {fireCart?.status === "success" && Boolean(fireCart?.data) && false
                    ? fireCart?.data?.map(
                        ({
                          genome,
                          pid,
                          img,
                          inventory,
                          name,
                          price,
                          size,
                          type,
                          qty,
                          wholesale,
                        }) => (
                          <CartItem
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
                    : [0, 1, 2, 4].map((i) => <CartItemSkeleton key={i} />)} */}
                  {/* Totals */}
                  {mounted && cart?.status === "success" ? (
                    <div className="module-wrapper module-wrapper">
                      <section style={{ padding: "1.5rem 0px" }}>
                        <div className="css-149ghmn e17qz39z0" />
                        <div className="css-1v3870x e9mvujh0">
                          <div style={{ position: "relative" }}>
                            <div className="css-1fh9ug8 e1m3c6hs1">
                              <div className="css-1ofqig9 ej2tyaj0">
                                <div
                                  type="faded"
                                  className="css-1woe1iy ey3gvnc0"
                                >
                                  <div className="css-95g4uk ey3gvnc2">
                                    <div className="css-1vd84sn ey3gvnc5">
                                      Subtotal
                                      <div className="css-77vupy ey3gvnc1" />
                                    </div>
                                    <div className="css-vqyk7m ey3gvnc3">
                                      {subtotal &&
                                        subtotal.toLocaleString("en-US", {
                                          style: "currency",
                                          currency: "USD",
                                        })}
                                    </div>
                                  </div>
                                </div>
                                <div
                                  type="faded"
                                  className="css-1woe1iy ey3gvnc0"
                                >
                                  <div className="css-95g4uk ey3gvnc2">
                                    <div className="css-1vd84sn ey3gvnc5">
                                      Taxes &amp; Fees
                                      <div className="css-77vupy ey3gvnc1">
                                      <Link scroll={false} href={`?cart&taxes=true&sales=${salesTax}&local=${localTax}&excise=${exciseTax}`}>
                                        <a
                                          data-e2eid="TaxesAndFeesButton"
                                          style={{ verticalAlign: "text-top" }}
                                        >
                                          <svg
                                            width="16px"
                                            height="16px"
                                            viewBox="0 0 16 16"
                                            version="1.1"
                                            xmlns="http://www.w3.org/2000/svg"
                                            xmlnsXlink="http://www.w3.org/1999/xlink"
                                            aria-labelledby="more-info-title"
                                            role="img"
                                          >
                                            <title id="more-info-title">
                                              More Info
                                            </title>
                                            <g
                                              id="more-info"
                                              stroke="none"
                                              strokeWidth={1}
                                              fill="none"
                                              fillRule="evenodd"
                                            >
                                              <g
                                                id="noun_Info_932469"
                                                fill="#948A91"
                                              >
                                                <path
                                                  d="M7.40571429,6.53428571 L8.59142857,6.53428571 L8.59142857,11.6771429 L7.40571429,11.6771429 L7.40571429,6.53428571 Z M7.40571429,4.32285714 L8.59142857,4.32285714 L8.59142857,5.52 L7.40571429,5.52 L7.40571429,4.32285714 Z M8,16 C3.581722,16 1.77635684e-15,12.418278 1.77635684e-15,8 C7.61295788e-16,3.581722 3.581722,0 8,0 C12.418278,-1.01506105e-15 16,3.581722 16,8 C16,12.418278 12.418278,16 8,16 Z M8,1.18857143 C4.23815188,1.18857143 1.18857143,4.23815188 1.18857143,8 C1.18857143,11.7618481 4.23815188,14.8114286 8,14.8114286 C11.7618481,14.8114286 14.8114286,11.7618481 14.8114286,8 C14.8082777,4.23945778 11.7605422,1.19172228 8,1.18857143 Z"
                                                  id="Combined-Shape"
                                                />
                                              </g>
                                            </g>
                                          </svg>
                                        </a>
                                        </Link>
                                      </div>
                                    </div>
                                    <div className="css-vqyk7m ey3gvnc3">
                                      $22.52
                                    </div>
                                  </div>
                                </div>
                                <div
                                  type="faded"
                                  className="css-1woe1iy ey3gvnc0"
                                >
                                  <div className="css-95g4uk ey3gvnc2">
                                    <div className="css-1vd84sn ey3gvnc5">
                                      Delivery
                                      <div className="css-77vupy ey3gvnc1" />
                                    </div>
                                    <div className="css-17yp4d9 ey3gvnc3">
                                      $5.00
                                    </div>
                                  </div>
                                  <div
                                    type="green"
                                    className="css-yulum8 ey3gvnc6"
                                  >
                                    Free delivery for $50+ orders!
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="css-m0iina e17qz39z0" />
                          </div>
                        </div>
                      </section>
                    </div>
                  ) : (
                    <div className="module-wrapper module-wrapper">
                      <section style={{ padding: "1.5rem 0px" }}>
                        <div className="css-149ghmn e17qz39z0" />
                        <div className="css-1v3870x e9mvujh0">
                          <div style={{ position: "relative" }}>
                            <div className="css-1fh9ug8 e1m3c6hs1">
                              <div className="css-1ofqig9 ej2tyaj0">
                                <div
                                  type="faded"
                                  className="css-1woe1iy ey3gvnc0"
                                >
                                  <div className="css-95g4uk ey3gvnc2">
                                    <div className="ey3gvnc5 holder">
                                      <div className="width-30" />
                                    </div>
                                    <div
                                      className="holder"
                                      style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                      }}
                                    >
                                      <div className="width-30" />
                                    </div>
                                  </div>
                                </div>
                                <div
                                  type="faded"
                                  className="css-1woe1iy ey3gvnc0"
                                  style={{ marginTop: "4px" }}
                                >
                                  <div className="css-95g4uk ey3gvnc2">
                                    <div className="ey3gvnc5 holder">
                                      <div className="width-40" />
                                    </div>
                                    <div
                                      className="holder"
                                      style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                      }}
                                    >
                                      <div className="width-30" />
                                    </div>
                                  </div>
                                </div>
                                <div
                                  type="faded"
                                  className="css-1woe1iy ey3gvnc0"
                                  style={{ marginTop: "4px" }}
                                >
                                  <div className="css-95g4uk ey3gvnc2">
                                    <div className="ey3gvnc5 holder">
                                      <div className="width-30" />
                                    </div>
                                    <div
                                      className="holder"
                                      style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                      }}
                                    >
                                      <div className="width-30" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="css-m0iina e17qz39z0" />
                          </div>
                        </div>
                      </section>
                    </div>
                  )}
                  {/* <div className="module-wrapper module-wrapper">
                    <div
                      style={{
                        height: 8,
                        //backgroundColor: "rgb(247, 247, 247)",
                      }}
                    />
                  </div> */}
                </div>
              </div>
            </div>
            { (
              <div
                className="rmq-e9fd10a8 rmq-94de0125 rmq-b2f0735a rmq-55b48a0d rmq-157a0342 rmq-2e961129"
                data-radium="true"
                style={{ paddingBottom: 0 }}
              >
                <div
                  className="rmq-47bf30d rmq-e8b5057c rmq-bd9ace2b rmq-c413b6e4 rmq-dd3ac64f"
                  data-radium="true"
                >
                  <div
                    className="module-wrapper module-wrapper"
                    style={{ marginBottom: 0 }}
                  >
                    <div
                      data-radium="true"
                      style={{ position: "relative", padding: '8px', borderTop: '1px solid rgb(236, 238, 239)' }}
                    >
                      <div aria-disabled="false" data-radium="true">


                      <div className='dual-input'>
                
                         <Button
                          disabled={false}
                          loading={false}
                          onClick={addPromo}
                          variant='green-outline'
                          fullWidth
                          text='Add Promo'
                        />
                         <div className='dual-spacer' />
                       <Link
                          href={"/[adminID]/create-order/checkout"} 
                          as={`/${user?.uid}/create-order/checkout`} 
                        >                        
                        <Button
                          disabled={false}
                          loading={['idle','loading'].includes(fireCartTotals.status)}
                          spinnerColor={['idle','loading'].includes(fireCartTotals.status)?'rgba(255,255,255,0.87)':'rgb(0,200,5)'}
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
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Cart;

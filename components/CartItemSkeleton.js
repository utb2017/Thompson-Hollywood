import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useUser } from "../context/userContext";
import useOnClickOutside from "../hooks/useOnClickOutside";
import {
    removeFromFirestoreCart,
    incrementFirestoreCart,
  } from "../firebase/clientApp";

const flowerChart = [
    '1/8oz',
    '1/4oz',
    '3/8oz',
    '1/2oz',
    '5/8oz',
    '3/4oz',
    '7/8oz',
    '1oz',
]




function CartItemSkeleton({genome, pid, img, inventory, name, price, size, type, qty}) {

const { orders, user, cart } = useUser();
  const [quickAdd, setQuickAdd] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [_size, setSize] = useState(size);
  const ref = useRef();

useEffect(() => {
    if( (type==='flower')){
        setSize(flowerChart[qty-1])
    }
}, [type, qty]);





useOnClickOutside( ref, useCallback(() => setQuickAdd(false)));

  const addCart = useCallback(async () => {
    const update = { name, price, pid, type, img, genome, inventory, qty: 1, size };
    await addToFirestoreCart(user.uid, update);
    //setQuantity(1);
    setQuickAdd(true)
  });
  const increaseCart = useCallback(async () => {

    await incrementFirestoreCart(1, user.uid, pid);
    // setQuantity(quantity + 1);
    // setAddToOrderQuickAdd(false)
  });
  const decreaseCart = useCallback(async () => {
    await incrementFirestoreCart(-1, user.uid, pid);
    //setQuantity(quantity - 1);
  });
  const removeFromCart = useCallback(async () => {
    await removeFromFirestoreCart(user.uid, pid);
    //setQuantity(0);
    setQuickAdd(false)
  });


  return (
    <div className="module-wrapper module-wrapper">
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


        <div
          data-radium="true"
          style={{
            lineHeight: "50px",
            width: "18%",
            marginTop: "2px",
          }}
        >
          <div data-radium="true" className='holder' style={{ margin: "0px auto", width: "50px" }}>

              <div style={{ width: "50px", height:'48px' }} />

          </div>
        </div>
        <div
          className="rmq-9151282f"
          data-radium="true"
          style={{
            fontSize: "13px",
            width: "82%",
            display: "flex",
            color: "rgb(117, 117, 117)",
          }}
        >
          <div
            className="rmq-3d3589b"
            data-radium="true"
            style={{
              width: "84%",
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            <div data-radium="true" style={{ width: "100%", display: "flex" }}>
              <div
                className="rmq-a40185f5"
                data-radium="true"
                style={{ width: "75%" }}
              >
                <div data-radium="true">

                    <div
                      id="cart_item_470815636"
                      className="rmq-9484430c clamped-name holder"
                      data-radium="true"
                      style={{ width: "100%" }}
                    >
                      <div className='width-90' style={{marginTop:'2px'}}/>
                    </div>
                </div>
                <div
                  data-testid="cartItemSizing"
                  className="rmq-10c8c9ce holder"
                  data-radium="true"
                  style={{ fontSize: "12px" }}
                >
                  <div className='width-40' style={{marginTop:'8px'}} />
                </div>
              </div>
              <div
                className="rmq-ec61a5f1"
                data-radium="true"
                style={{ width: "25%", textAlign: "center" }}
              >
                <div      
                  aria-label="Quantity: 2. Change quantity"
                  aria-live="polite"
                  aria-atomic="true"
                  className="rmq-1687e5cd"
                  data-radium="true"
                  style={{
                    position: "relative",
                    cursor: "pointer",
                    height: "44px",
                    width: "56px",
                    border: "1px solid rgb(224, 224, 224)",
                    margin: "0px auto",
                    padding: "0px",
                    lineHeight: "40px",
                    borderRadius: "4px",
                    fontSize: "16px",
                    color: "rgb(117, 117, 117)",
                    fontWeight: 600,
                    zIndex: 100,
                    backgroundColor: "transparent",
                  }}
                >
                  {""}
                </div>
              </div>
            </div>
          </div>
          <div
            className="rmq-9484430c rmq-3630089a"
            data-radium="true"
            style={{
              position: "relative",
              width: "16%",
              fontSize: "14px",
              color: "rgb(66, 66, 66)",
              textAlign: "right",
              paddingRight: "12px",
              height: "44px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              tabIndex={0}
              aria-label="Price is $9.98"
              data-radium="true"
              style={{ margin: "0px 0px 0px auto" }}
              className="holder"
            >
              <div data-radium="true"  style={{ lineHeight: "18px" }}>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default CartItemSkeleton;

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useUser } from "../context/userContext";
import useOnClickOutside from "../hooks/useOnClickOutside";
import firebase, {
    removeFromFirestoreCart,
    incrementFirestoreCart,  
    addToFirestoreCart,
  } from "../firebase/clientApp";
import { defaultTheme } from "../styles/themer/utils";


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

function CartItem({  
  qty = 0,
  name = "Error",
  prc = undefined,
  pid = undefined,
  type = undefined,
  img = ["https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2Fstock-placeholder-blue.png?alt=media&token=fe1924a0-8bff-43f6-858d-b6d5e3e8ff27"],
  genome = undefined,
  inventory = undefined,
  price = undefined,
  size = undefined,
  fireCollection = [],
  wholesale = undefined,
  disableChange = undefined,
  collection = undefined,
  filePath = undefined,
}) {




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
    const update = { name, price, pid, type, img, genome, inventory, qty: 1, size, wholesale };
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







  
  const [imgURL, setImgURL] = useState(null)
  const [loading, setLoading] = useState(false)
  

  const getImgURL = async (filePath) => {
    if (user?.uid) {
      const storage = user.uid && firebase.storage()
      const storageRef = storage && storage.ref()
      let url = null
      // "https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2Fstock-placeholder.png?alt=media&token=57d6b3da-4408-4867-beb7-7957669937dd"
      if (
        typeof filePath === "string" &&
        filePath.length > 0 &&
        storage
      ) {
        try {
          url = await storageRef
            .child(`${typeof filePath === "string" ? filePath : ""}`)
            .getDownloadURL()
        } catch (e) {
          console.log("error")
          console.log(e)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
      return setImgURL(url)
    }
  }

  useEffect(() => {
    filePath && typeof filePath === 'string' && getImgURL(filePath)
  }, [filePath])



  return (
    <div className="module-wrapper module-wrapper">
      <div
        aria-label="product"
        role="group"
        
        style={{
          display: "flex",
          position: "relative",
          padding: "12px 12px",
        }}
      >
        {quickAdd && (
          <>
            <div
              
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                zIndex: 5,
                backgroundColor: "white",
                opacity: "0.7",
              }}
            />

            <div
              ref={ref}
              
              style={{
                position: "absolute",
                right: 32,
                display: "flex",
                zIndex: 150,
                borderRadius: 4,
                backgroundColor: "rgb(255, 255, 255)",
                boxShadow: "rgb(117, 117, 117) 0px 0px 10px",
                flexDirection: "column",
              }}
            >
              <div  style={{ display: "flex" }}>
                {qty > 1 && (
                  <button
                    onClick={() => decreaseCart() }
                    aria-label="Decrement quantity of Food Should Taste Good Tortilla Chips, Blue Corn in cart"
                    tabIndex={0}
                    
                    style={{
                      width: 45,
                      height: 45,
                      padding: 0,
                      border: 0,
                      color: defaultTheme.colors.action,
                      backgroundColor: "rgb(255, 255, 255)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: "4px 0px 0px 4px",
                      alignSelf: "flex-start",
                    }}
                  >
                    <svg
                      width="24px"
                      height="24px"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      fill="currentColor"
                    >
                      <path d="M5.007 11C4.45 11 4 11.448 4 12c0 .556.451 1 1.007 1h13.986C19.55 13 20 12.552 20 12c0-.556-.451-1-1.007-1H5.007z" />
                    </svg>
                  </button>
                )}
                {qty < 2 && (
                  <button
                    onClick={() => removeFromCart()}
                    aria-label="Remove Food Should Taste Good Tortilla Chips, Blue Corn from cart"
                    tabIndex={0}
                    
                    style={{
                      width: 45,
                      height: 45,
                      padding: 0,
                      border: 0,
                      color: defaultTheme.colors.action,
                      backgroundColor: "rgb(255, 255, 255)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: "4px 0px 0px 4px",
                      alignSelf: "flex-start",
                    }}
                  >
                    <svg
                      width="24px"
                      height="24px"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      fill="currentColor"
                      style={{ height: 20, width: 20 }}
                    >
                      <path d="M15 4h4.504c.274 0 .496.216.496.495v2.01a.498.498 0 0 1-.496.495H19v13.006A2 2 0 0 1 16.994 22H7.006A2.001 2.001 0 0 1 5 20.006V7h-.504A.492.492 0 0 1 4 6.505v-2.01C4 4.222 4.226 4 4.496 4H9V2.999A1 1 0 0 1 9.99 2h4.02c.546 0 .99.443.99.999V4zm-.491 1H5v1h14V5h-4.491zM6 7.105v12.888C6 20.55 6.449 21 7.002 21h9.996A1.01 1.01 0 0 0 18 19.993V7.105A.1.1 0 0 0 17.896 7H6.104A.109.109 0 0 0 6 7.105zm4-3.997V5h4V3.108c0-.059-.044-.108-.099-.108H10.1c-.054 0-.099.048-.099.108zM9 10.5c0-.276.232-.5.5-.5.276 0 .5.23.5.5v7c0 .276-.232.5-.5.5-.276 0-.5-.23-.5-.5v-7zm5 0c0-.276.232-.5.5-.5.276 0 .5.23.5.5v7c0 .276-.232.5-.5.5-.276 0-.5-.23-.5-.5v-7z" />
                    </svg>
                  </button>
                )}
                <span
                  aria-label={`Current quantity of ${qty} in cart`}
                  aria-live="polite"
                  aria-atomic="true"
                  
                  style={{
                    height: 45,
                    width: 54,
                    fontSize: 17,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "rgb(117, 117, 117)",
                  }}
                >
                  {qty}
                </span>
                <button
                  onClick={() => increaseCart()}
                  aria-label="Increment quantity of Food Should Taste Good Tortilla Chips, Blue Corn in cart"
                  tabIndex={0}
                  
                  style={{
                    width: 45,
                    height: 45,
                    padding: 0,
                    border: 0,
                    color: defaultTheme.colors.action,
                    backgroundColor: "rgb(255, 255, 255)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "0px 4px 4px 0px",
                    alignSelf: "flex-end",
                  }}
                >
                  <svg
                    width="24px"
                    height="24px"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    fill="currentColor"
                  >
                    <path d="M13 5.007C13 4.45 12.552 4 12 4c-.556 0-1 .451-1 1.007V11H5.007C4.45 11 4 11.448 4 12c0 .556.451 1 1.007 1H11v5.993c0 .557.448 1.007 1 1.007.556 0 1-.451 1-1.007V13h5.993C19.55 13 20 12.552 20 12c0-.556-.451-1-1.007-1H13V5.007z" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}

        <div
          
          style={{
            lineHeight: "50px",
            width: "18%",
            marginTop: "2px",
          }}
        >
          <div  style={{ margin: "0px auto", width: "50px" }}>
            {/* <a
              //href="items/item_470815636?item_card_impression_id=cart&source_type=cart&source_value=dynamic_list_coupons"
              style={{
                color: defaultTheme.colors.action,
                cursor: "pointer",
              }}
            > */}



              {imgURL && (
                  <img
                    className='no-aliasing-image'
                    src={imgURL}
                    alt={"menu-item"}
                  />
                )}
              {!imgURL && <div className='shimmerBG img-line'  style={{ width: "52px", height:'52px' }}></div>}



              {/* <img
                src={img[0]}
                alt="img"
                style={{ width: "50px" }}
              /> */}


{/* 
            </a> */}
          </div>
        </div>
        <div
          className="rmq-9151282f"
          style={{
            fontSize: "13px",
            width: "82%",
            display: "flex",
            color: "rgb(117, 117, 117)",
          }}
        >
          <div
            className="rmq-3d3589b"
            style={{
              width: "84%",
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            <div style={{ width: "100%", display: "flex" }}>
              <div
                className="rmq-a40185f5"
                style={{ width: "60%" }}
              >
                <div >
                  <a
                    className="rmq-9484430c"
                    //href="items/item_470815636?item_card_impression_id=cart&source_type=cart&source_value=dynamic_list_coupons"
                    style={{
                      color: "rgb(50, 50, 50)",
                      fontSize: "16px",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      id="cart_item_470815636"
                      className="rmq-9484430c clamped-name"
                      style={{ width: "100%" }}
                    >
                      {name}
                    </div>
                  </a>
                </div>
                <div
                  data-testid="cartItemSizing"
                  className="rmq-10c8c9ce"
                  style={{ fontSize: "12px" }}
                >
                  {_size}
                </div>
              </div>
              <div
                className="rmq-ec61a5f1"
                style={{ width: "25%", textAlign: "center" }}
              >
                <button
                  onClick={() => !disableChange && setQuickAdd(true)}
                  aria-label="Quantity: 2. Change quantity"
                  aria-live="polite"
                  aria-atomic="true"
                  className="rmq-1687e5cd"
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
                  {qty}
                </button>
              </div>
            </div>
            {!disableChange && <div style={{ width: "100%" }}>
              <div
                style={{ marginTop: "2px", display: "flex" }}
              >

                <button
                  onClick={() => removeFromCart()}
                  aria-describedby={`cart_item_${pid}`}
                  style={{
                    fontSize: "12px",
                    backgroundColor: "transparent",
                    border: "0",
                    padding: "0",
                    marginRight: "15px",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <svg
                    width="18px"
                    height="18px"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    fill="currentColor"
                    style={{
                      color: defaultTheme.colors.DutchieColorError,
                      fontSize: "12px",
                      marginRight: "6px",
                    }}
                  >
                    <path d="M15 4h4.504c.274 0 .496.216.496.495v2.01a.498.498 0 0 1-.496.495H19v13.006A2 2 0 0 1 16.994 22H7.006A2.001 2.001 0 0 1 5 20.006V7h-.504A.492.492 0 0 1 4 6.505v-2.01C4 4.222 4.226 4 4.496 4H9V2.999A1 1 0 0 1 9.99 2h4.02c.546 0 .99.443.99.999V4zm-.491 1H5v1h14V5h-4.491zM6 7.105v12.888C6 20.55 6.449 21 7.002 21h9.996A1.01 1.01 0 0 0 18 19.993V7.105A.1.1 0 0 0 17.896 7H6.104A.109.109 0 0 0 6 7.105zm4-3.997V5h4V3.108c0-.059-.044-.108-.099-.108H10.1c-.054 0-.099.048-.099.108zM9 10.5c0-.276.232-.5.5-.5.276 0 .5.23.5.5v7c0 .276-.232.5-.5.5-.276 0-.5-.23-.5-.5v-7zm5 0c0-.276.232-.5.5-.5.276 0 .5.23.5.5v7c0 .276-.232.5-.5.5-.276 0-.5-.23-.5-.5v-7z" />
                  </svg>
                  Remove
                </button>
              </div>
            </div>}
          </div>
          <div
            className="rmq-9484430c rmq-3630089a"
            
            style={{
              position: "relative",
              //width: "16%",
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
              
              style={{ margin: "0px 0px 0px auto" }}
            >
              <div  style={{ lineHeight: "18px" }}>
        <span>{((qty||1)*price).toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartItem;

import React, { useEffect, useState, useMemo, useCallback, useRef, ReactElement, FC } from "react"
import { useUser } from "../../context/userContext"
import useOnClickOutside from "../../hooks/useOnClickOutside"
import { defaultTheme } from "../../styles/themer/utils"
import firebase, { cartRemove_v2, cartIncrement_v2 } from "../../firebase/clientApp"
import { NotificationManager } from "react-notifications"
import { isCurr, isNum } from "../../helpers"
import SVGIcon from "../SVGIcon"
import { useRouting } from "../../context/routingContext";
import { Caption2, Label2, Label4 } from "baseui/typography"
import { useStyletron } from "baseui";
import { Button, KIND, SIZE, SHAPE } from "baseui/button";
import { Spinner } from "baseui/spinner"

const Strike: FC = ({ children }): ReactElement => {
  return <div style={{ textDecorationLine: "line-through" }}>{children}</div>;
};
function CartItem({ fireProduct, disableChange = false }) {
  const [css, theme] = useStyletron();
  const { 
    user, 
    customerID,
  } = useUser()
  const { setNavLoading, cartOpen, setCartOpen, navLoading, cartLoading, setCartLoading } = useRouting();
  const [quickAdd, setQuickAdd] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const ref = useRef()
  //const [cartLoading, setCartLoading] = useState(false)
  const [imgURL, setImgURL] = useState(null)
  const [salePrice, setSalePrice] = useState(null)
  const [saved, setSaved] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saleTitle, setSaleTitle] = useState(false)
useEffect(() => {
//alert(`sale title ${saleTitle}`)
}, [saleTitle]);

  useEffect(() => {
    let tempTitle:any = false
    if(typeof fireProduct?.saleTitle === 'string'){
      tempTitle = fireProduct?.saleTitle
    }
    if(fireProduct?.saleTitle && Array.isArray(fireProduct?.saleTitle)){
      tempTitle = fireProduct?.saleTitle.join(' + ')
    }
    if( !tempTitle && fireProduct?.saleRate ){
     
      if(fireProduct?.saleRate < 1 && fireProduct?.saleRate > 0){
        //percent
        tempTitle = `${(fireProduct?.saleRate * 100)}% off.`
         //alert(tempTitle)
      }else if(fireProduct?.saleRate > 0){
        
        tempTitle = `$${(fireProduct?.saleRate)} off.`
        //flat rate
      }
    }
    //alert(tempTitle)
    setSaleTitle(tempTitle)
    return () => {
      setSaleTitle(false)
    };
  }, [fireProduct])



  useOnClickOutside(
    ref,
    useCallback(() => setQuickAdd(false),[])
  )

  const getImgURL = async (filePath) => {
    if (user?.uid) {
      const storage = user.uid && firebase.storage()
      const storageRef = storage && storage.ref()
      let url = null
      // "https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2Fstock-placeholder.png?alt=media&token=57d6b3da-4408-4867-beb7-7957669937dd"
      if (typeof filePath === "string" && filePath.length > 0 && storage) {
        try {
          url = await storageRef.child(`${typeof filePath === "string" ? filePath : ""}`).getDownloadURL()
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


  const increaseCart = async () => {
    setCartLoading(true)
    try {
      await cartIncrement_v2({uid:customerID,pid:fireProduct.id,inc:1})
    } catch (e) {
      NotificationManager.error(
        e?.message || e || "Something went wrong."
      )
    } finally {
      //setCartLoading(false)
    }
  }
  const decreaseCart = async () => {
    setCartLoading(true)
    try {
      await cartIncrement_v2({uid:customerID,pid:fireProduct.id,inc:-1})
    } catch (e) {
      NotificationManager.error(
        e?.message || e || "Something went wrong."
      )
    } finally {
     // setCartLoading(false)
    }
  }
  const removeFromCart = async () => {
    setCartLoading(true)
    try {
      await cartRemove_v2({uid:customerID,pid:fireProduct.id})
      firebase.analytics().logEvent(firebase.analytics.EventName.REMOVE_FROM_CART, fireProduct)
    } catch (e) {
      NotificationManager.error(e?.message || e || "Something went wrong.")
    } finally {
     // setCartLoading(false)
    }
  }  

  useEffect(() => {
    fireProduct?.filePath && getImgURL(fireProduct?.filePath)
  }, [fireProduct?.filePath, user])

  useEffect(() => {
    let _qty = 0
    if (fireProduct?.id) {
      setLoading(false)
        _qty = isNum(fireProduct?.qty)
    }
    setQuantity(_qty)
  }, [fireProduct])

  useEffect(() => {
    //alert(fireProduct?.onSale)
    if (fireProduct?.onSale && fireProduct?.saleRate && fireProduct?.qty, fireProduct?.price) {
      const thisItemTotalPrice = fireProduct?.price * fireProduct?.qty
      if (typeof fireProduct?.saleRate === 'number') {

        // console.log("rate fuck me fuck me")
        // console.log(fireProduct?.saleRate)
        // console.log("thisItemTotalPrice")
        // console.log(thisItemTotalPrice)
        // console.log("setSalePrice")
        // console.log(thisItemTotalPrice - fireProduct?.saleRate)

        setSaved(fireProduct?.saleRate)
        let x = 0
        if(fireProduct?.saleRate >= 1){
          x = thisItemTotalPrice - fireProduct?.saleRate
        } else if(fireProduct?.saleRate > 0 && fireProduct?.saleRate < 1){
          x = thisItemTotalPrice - (thisItemTotalPrice * fireProduct?.saleRate)
        }
        setSalePrice(x)
        //alert(thisItemTotalPrice - fireProduct?.saleRate)
      }
    }
  }, [fireProduct?.onSale, fireProduct?.saleRate, fireProduct?.price, fireProduct?.qty])







  return (
    <div className='cart-item-wrapper'>
      <div aria-label='product' role='group' className='cart-item-flex'>
        {quickAdd && (
          <>
            <div className='cart-quick-add-overlay' />
            <div ref={ref} className='cart-quick-add-bar'>
              <div style={{ display: "flex" }}>
                {quantity > 1 && (
                  <button
                    onClick={() => decreaseCart()}
                    aria-label={`Decrement quantity of ${fireProduct?.name} `}
                    disabled={cartLoading}
                    tabIndex={0}
                    style={{
                      width: 45,
                      height: 45,
                      alignSelf: "flex-start",
                    }}
                    className='qty-quick-buttons'>
                    <svg width='24px' height='24px' viewBox='0 0 24 24' aria-hidden='true' fill='currentColor'>
                      <path d='M5.007 11C4.45 11 4 11.448 4 12c0 .556.451 1 1.007 1h13.986C19.55 13 20 12.552 20 12c0-.556-.451-1-1.007-1H5.007z' />
                    </svg>
                  </button>
                )}
                {quantity < 2 && (
                  <button
                    onClick={() => removeFromCart()}
                    aria-label={`Remove ${fireProduct?.name} `}
                    tabIndex={0}
                    disabled={cartLoading}
                    className='qty-quick-buttons red'
                    style={{
                      width: 45,
                      height: 45,
                      alignSelf: "flex-start",
                     //color:"rgb(212, 54, 132)",
                    }}>
                    <svg
                      width='24px'
                      height='24px'
                      viewBox='0 0 24 24'
                      aria-hidden='true'
                      fill='currentColor'
                      style={{ height: 20, width: 20 }}>
                      <path d='M15 4h4.504c.274 0 .496.216.496.495v2.01a.498.498 0 0 1-.496.495H19v13.006A2 2 0 0 1 16.994 22H7.006A2.001 2.001 0 0 1 5 20.006V7h-.504A.492.492 0 0 1 4 6.505v-2.01C4 4.222 4.226 4 4.496 4H9V2.999A1 1 0 0 1 9.99 2h4.02c.546 0 .99.443.99.999V4zm-.491 1H5v1h14V5h-4.491zM6 7.105v12.888C6 20.55 6.449 21 7.002 21h9.996A1.01 1.01 0 0 0 18 19.993V7.105A.1.1 0 0 0 17.896 7H6.104A.109.109 0 0 0 6 7.105zm4-3.997V5h4V3.108c0-.059-.044-.108-.099-.108H10.1c-.054 0-.099.048-.099.108zM9 10.5c0-.276.232-.5.5-.5.276 0 .5.23.5.5v7c0 .276-.232.5-.5.5-.276 0-.5-.23-.5-.5v-7zm5 0c0-.276.232-.5.5-.5.276 0 .5.23.5.5v7c0 .276-.232.5-.5.5-.276 0-.5-.23-.5-.5v-7z' />
                    </svg>
                  </button>
                )}
                <span
                  aria-label={`Current quantity of ${quantity} in cart`}
                  aria-live='polite'
                  aria-atomic='true'
                  style={{
                    height: 45,
                    width: 54,
                    fontSize: 17,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "rgb(117, 117, 117)",
                  }}>
                  {/* {qty} */}
                  {cartLoading ? <Spinner color='rgb(0, 200, 5)' /> : quantity}
                </span>
                <button
                  onClick={() => increaseCart()}
                  aria-label={`Increment quantity of ${fireProduct?.name} `}
                  disabled={cartLoading}
                  tabIndex={0}
                  className='qty-quick-buttons'
                  style={{
                    width: 45,
                    height: 45,
                    alignSelf: "flex-start",
                  }}>
                  <svg width='24px' height='24px' viewBox='0 0 24 24' aria-hidden='true' fill='currentColor'>
                    <path d='M13 5.007C13 4.45 12.552 4 12 4c-.556 0-1 .451-1 1.007V11H5.007C4.45 11 4 11.448 4 12c0 .556.451 1 1.007 1H11v5.993c0 .557.448 1.007 1 1.007.556 0 1-.451 1-1.007V13h5.993C19.55 13 20 12.552 20 12c0-.556-.451-1-1.007-1H13V5.007z' />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}

        <div
          style={{
            // lineHeight: "60px",
            width: "18%",
            marginTop: "2px",
          }}>
          <div style={{ margin: "0px auto", width: "50px"}}>
            <a
              //href="items/item_470815636?item_card_impression_id=cart&source_type=cart&source_value=dynamic_list_coupons"
              data-bypass='false'
              style={{
                color: defaultTheme.colors.action,
                cursor: "pointer",
                
              }}>
              {imgURL && <img src={imgURL} alt='img' style={{ width: "50px" }} />}
              {!imgURL && <div  style={{ width:"50px", flex:1, height:50 }} className="shimmerBG image-column" />}
            </a>
          </div>
        </div>
        <div
          className='rmq-9151282f'
          style={{
            fontSize: "13px",
            width: "82%",
            display: "flex",
            color: "rgb(117, 117, 117)",
          }}>

          <div
            style={{
              width: "84%",
              display: "flex",
              flexWrap: "wrap",
            }}>
            <div style={{ width: "100%", display: "flex" }}>
              <div style={{ width: "60%" }}>
                <div>
                  <a
                    className='rmq-9484430c'
                    //href="items/item_470815636?item_card_impression_id=cart&source_type=cart&source_value=dynamic_list_coupons"
                    style={{
                      color: "rgb(50, 50, 50)",
                      fontSize: "14px",
                      cursor: "pointer",
                    }}>
                    <div className='rmq-9484430c clamped-name' style={{ width: "100%" }}>
                     <Label4>{`${fireProduct?.name || ""} - ${fireProduct?.brand.label || ""}`}</Label4> 
                    </div>
                  </a>
                </div>
                {/* <div style={{ fontSize: "12px" }}>
                  {`${fireProduct?.brand.label || ""}`}
                </div> */}
                <div style={{ fontSize: "12px" }}>
                  <Caption2>{`${fireProduct?.weight} x ${fireProduct?.qty}`}</Caption2>
                </div>
                {saleTitle && <div style={{ 
                  fontSize: "12px", 
                  color:'rgb(212, 54, 132)',
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: '20px',
                }}>
                  
                  <SVGIcon  style={{transform: 'scale(0.5)'}} name='coupons' color='rgb(212, 54, 132)' />{`${saleTitle}`}
                {/* <SVGIcon  style={{transform: 'scale(0.5)'}} name='coupons' color='rgb(212, 54, 132)' />{`${fireProduct?.saleTitle||(fireProduct?.saleRate>=1?`$${fireProduct?.saleRate} off`:`${fireProduct?.saleRate*100}% off`)}${fireProduct?.appliedSaleQty?`- ${fireProduct?.appliedSaleQty}/${fireProduct?.requiredSaleQty}`:``}`} */}
                </div> }   
                {/* {fireProduct?.saleRate > 0 && <div style={{ fontSize: "12px" }}>
                  {`You saved ${ isCurr(fireProduct?.saleRate) }`}
                </div> }      */}
              </div>
              <div className='rmq-ec61a5f1' style={{ width: "25%", textAlign: "center" }}>
                <button
                  onClick={() => !disableChange && setQuickAdd(true)}
                  aria-label='Quantity: 2. Change quantity'
                  aria-live='polite'
                  aria-atomic='true'
                  disabled={cartLoading}
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
                    color: theme.colors.contentPrimary,
                    fontWeight: 600,
                    zIndex: 100,
                    backgroundColor: "transparent",
                    display: 'flex',
                    justifyContent:'center'
                  }}>
                  {/* {qty} */}
                  {cartLoading ? <Spinner size={24} /> : quantity}
                </button>
              </div>
            </div>
            
            {!disableChange && (
              <div style={{ width: "100%" }}>
                <div style={{ marginTop: "2px", display: "flex" }}>
                  <Button
                  
                  kind={KIND.tertiary}
                  size={SIZE.mini} 
                    startEnhancer={ <SVGIcon name='delete' style={{ transform:'scale(0.8)', overflow:'visible', width:'16px' }} color={theme.colors.negative300} /> }
                    onClick={() => removeFromCart()}
                    //aria-describedby={`cart_item_${fireProduct?.id}`}
                    disabled={cartLoading}
                    overrides={{
                      BaseButton: {
                        style: ({ $theme }) => ({
                          fontSize: "12px",
                          //backgroundColor: "transparent",
                          border: "0",
                          padding: "2px 8px 2px 8px",
                          marginRight: "15px",
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          fontWeight: 'unset',
                        })
                      }
                    }}
                    // style={{
                    //   fontSize: "12px",
                    //   //backgroundColor: "transparent",
                    //   border: "0",
                    //   padding: "2px 8px 2px 8px",
                    //   marginRight: "15px",
                    //   display: "flex",
                    //   flexDirection: "row",
                    //   alignItems: "center",
                    //   fontWeight: 'unset',
                    // }}
                    >
                   
                    Remove
                  </Button>
                </div>
              </div>
            )}
              {/* <div style={{backgroundColor:"red", width:'100%'}}>HIh</div>  */}
          </div>
          
          <div className='price-column'>
            {(fireProduct?.onSale && (salePrice > 0)) && <div
              tabIndex={0}
              className='price-sale'
              aria-label={`Sale price is ${isCurr(salePrice)}`}>
              <div style={{ lineHeight: "18px" }}>
                <span><Caption2>{isCurr(salePrice)}</Caption2></span>
              </div>
            </div>}
            {(!fireProduct?.onSale || (fireProduct?.onSale && salePrice === 0)) && <div
              tabIndex={0}
              aria-label={`Price is ${isCurr((quantity) * fireProduct?.price)}`}>
              <div style={{ lineHeight: "18px" }}>
                <span><Caption2>{isCurr((quantity) * fireProduct?.price)}</Caption2></span>
              </div>
            </div>}
            {(fireProduct?.onSale && (salePrice > 0)) && <div
              tabIndex={0}
              className='price-discount'
              aria-label={`Old price is ${isCurr((quantity) * fireProduct?.price)}`}>
              <div style={{ lineHeight: "18px" }}>
                <Caption2><Strike>{isCurr((quantity) * fireProduct?.price)}</Strike></Caption2>
              </div>
            </div>}
          </div>
         
        </div>
  
      </div>

    </div>
  )
}

export default CartItem

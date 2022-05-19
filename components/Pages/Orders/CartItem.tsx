import React, { useEffect, useState, useMemo, useCallback, useRef, ReactElement, FC } from "react"
import { useUser } from "../../../context/userContext"
import useOnClickOutside from "../../../hooks/useOnClickOutside"
import { defaultTheme } from "../../../styles/themer/utils"
import firebase, { cartRemove_v2, cartIncrement_v2 } from "../../../firebase/clientApp"
import { NotificationManager } from "react-notifications"
import { isCurr, isNum } from "../../../helpers"
import SVGIcon from "../../SVGIcon"
import { useRouting } from "../../../context/routingContext";
import { Caption2, Label2, Label4 } from "baseui/typography"
import { useStyletron } from "baseui";
import { Button, KIND, SIZE, SHAPE } from "baseui/button";
import { Spinner } from "baseui/spinner"

import {Avatar} from 'baseui/avatar';
//import {useStyletron} from 'baseui';
import {expandBorderStyles} from 'baseui/styles';


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


        <div
          style={{
            // lineHeight: "60px",
            width: "20%",
            marginTop: "2px",
          }}>
              

                  <Avatar
                    overrides={{
                      Avatar: {
                        style: ({$theme}) => ({
                          borderTopLeftRadius: $theme.borders.radius100,
                          borderTopRightRadius: $theme.borders.radius100,
                          borderBottomRightRadius: $theme.borders.radius100,
                          borderBottomLeftRadius: $theme.borders.radius100,
                        }),
                      },
                      Root: {
                        style: ({$theme}) => ({
                          borderTopLeftRadius: $theme.borders.radius100,
                          borderTopRightRadius: $theme.borders.radius100,
                          borderBottomRightRadius: $theme.borders.radius100,
                          borderBottomLeftRadius: $theme.borders.radius100,
                        }),
                      },
                    }}
                    name={fireProduct?.data?.displayName}
                    size="scale1400"
                    src={imgURL}
                  />
             
              {/* {imgURL && <img src={imgURL} alt='img' style={{ width: "48px" }} />}
              {!imgURL && <div  style={{ width:"48px", flex:1, height:'48px' }} className="shimmerBG image-column" />} */}

        </div>
        <div
          style={{
            fontSize: "13px",
            width: "80%",
            display: "flex",
            color: "rgb(117, 117, 117)",
            alignItems: 'center',
          }}>

          <div
            style={{
              width: "100%",
              display: "flex",
              flexWrap: "wrap",
            }}>
            <div style={{ width: "100%", display: "flex" }}>
              <div style={{ width: "70%" }}>
                <div>
                    <div style={{ width: "100%", marginLeft:'6px' }}>
                     <Label4>{`${fireProduct?.name || ""} - ${fireProduct?.brand.label || ""}`}</Label4> 
                    </div>
                </div>
                {/* <div style={{ fontSize: "12px" }}>
                  {`${fireProduct?.brand.label || ""}`}
                </div> */}
                <div style={{ width: "100%", marginLeft:'6px' }}>
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
              <div    style={{ width: "25%", textAlign: "center" }}>
                <div
                  style={{
                    position: "relative",
                    cursor: "pointer",
                    height: "44px",
                    width: "46px",
                    border: "1px solid rgb(224, 224, 224)",
                    margin: "0px auto",
                    padding: "0px",
                    lineHeight: "40px",
                    borderRadius: "4px",
                    fontSize: "16px",
                    //color: theme.colors.contentPrimary,
                    fontWeight: 600,
                    zIndex: 100,
                    backgroundColor: "transparent",
                    display: 'flex',
                    justifyContent:'center',
                    alignItems:'center'
                  }}>
                  {/* {qty} */}
                  {cartLoading ? <Spinner size={24} /> : <Label2>{quantity}</Label2>}
                </div>
              </div>
            </div>
            
              {/* <div style={{backgroundColor:"red", width:'100%'}}>HIh</div>  */}
          </div>
          
          <div className='price-column' style={{paddingRight:'0px'}}>
            {(fireProduct?.onSale && (salePrice > 0)) && <div
              tabIndex={0}
              //className='price-sale'
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





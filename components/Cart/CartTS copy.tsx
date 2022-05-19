import React, { useEffect, useState, FC, ReactElement } from "react"
import { useRouter } from "next/router"
import { useUser } from "../../context/userContext"
import Link from "next/link"
import SVGIcon from "../SVGIcon"
import CartItem from "./CartItem"
import CartItemSkeleton from "./CartItemSkeleton"
import CartTotalsSkeleton from "./CartTotalsSkeleton"
import { isCurr } from "../../helpers"
import { useDispatchModal } from "../../context/modalContext"
import { AddPromoCode, DeletePromo } from "../Modals"
// import { useFirestoreQuery } from "../../hooks/useFirestoreQuery"
// import firebase from "../../firebase/clientApp"
import Button from "../Buttons/ButtonTS"
import { TotalsRow } from "../Split"
import Spinner from "../Buttons/Spinner"



type CartDiscount = {
  hasDiscount?:boolean,
  discountMethod?:"flatRate" | "percent" | "taxFree" | "bogo",
  discountRate?:any,
  discountID?:string,
  loading?:boolean,
}
interface TotalsCart extends CartDiscount {
  subtotal: number,
  localTax: number,
  exciseTax: number,
  stateTax: number,
  discountTotal?: number,
  minOrder?: number,
  freeDeliveryMin?: number,
  deliveryFee?:number,
  serviceFee?:number,
  taxTotal:number,
  wholesale?:number,
  priceTotal:number,
  productsSold:number,
  profit?:number,
  profitWithDelivery?:number,
  profitWithDeliveryMinusFee?:number,
  taxedSubtotal?:number,
  loading?:boolean,
}
type QueryError = {
  message?: string,
  code?: string,
}
type QueryCartData = {
  data?: TotalsCart,
  status: string,
  error?: QueryError,
}
type CartTotalsProps = {
  fireCartTotals:QueryCartData
}
type Selected = {
  label:string,
  value:string
}
type Discount = {
  active: boolean;
  featured: boolean;
  alert: boolean;
  alertSent: boolean;
  code?: string;
  dateEnd: string | any | null;
  dateStart: string | any | null;
  filters: string[] | null;
  collections: Selected[];
  //queryIDs: string[];
  collectionIDs: string[];
  id: string;
  uid: string | null;
  methodID: "flatRate" | "percent" | "taxFree" | "bogo";
  method:Selected;
  rate?: number;
  bogoQty?: number;
  sort?: "credit" | "coupon" | "refund";
  title: string | null;
  type: { [k: string]: any } | undefined;
  used: boolean;
  recurring: boolean;
  recurringDays: Selected[] | undefined;
  days: string[];
  stackable: boolean;
}
type CartItems = {
  id: string;
  img: string[];
  genome: string;
  inventory: number;
  name: string;
  pid: string;
  uid: string;
  price: number;
  qty: number;
  size: string;
  type: string;
  //collection: string;
  discountRate: number;
  hasDiscount: boolean;
  discountTotal: number;
  wholesale: number;
  onSale: boolean | null;
  saleRate: number | null;
  couponID?: string;
  brand: Selected;
  queryIDs: string[];
  collections: Selected[];
  collectionIDs: string[];
  saleTitle: string;
}
const roundTo = function(num: number, places: number) {
  const factor = 10 ** places;
  return Math.round(num * factor) / factor;
};
const fromCents = (num: number, places: number):number => {
  const cents = num / 100
  const factor = 10 ** places;
  const decimal = Math.round(cents * factor) / factor;
  return decimal
};
const toCents = (num: number):number => {
  const cents = num * 100
  return cents
};
const getGrandTotal = ( subtotal:number, stateTax:number, exciseTax:number, localTax:number, serviceFee:number ):number => {
 return ((subtotal*stateTax) + (subtotal*localTax) + (subtotal*exciseTax) + subtotal) + toCents(serviceFee)
}



const Strike: FC = ({children}): ReactElement => { 
  return(
    <div style={{ textDecorationLine: 'line-through' }}>
      {children}
    </div>
  )
};
const EmptyCart: FC = (): ReactElement => { 
  return(
  <div className='empty-cart'>
    <div className='empty-bag'>
     <SVGIcon name='bag' size='standard' color={`rgb(0 180 5)`} />
    </div>
    <h2>Empty Cart</h2>
 </div>    
  )
};
const CartList:FC = (): ReactElement => {

  const [cartComponentList, setCartComponentList] = useState<ReactElement[]>([])
  const { fireCart, fireCartTotals, fireDiscounts } = useUser()
  useEffect(() => {
    const tempArray:ReactElement[] = []
    const defaultCart:CartItems[] = []
    if (fireCartTotals?.data && fireCart.data) {
      fireCart.data.map((cartItem:CartItems)=>{
        defaultCart.push({...cartItem})
      })
      defaultCart.map((cartItem:CartItems)=>{
        fireDiscounts?.data.map((discount:Discount)=>{ 
          discount.collectionIDs.map((collectionID:string)=>{
            if(cartItem.queryIDs.includes(collectionID) || collectionID === 'ALL_PRODUCTS' ){
              const customRate = roundTo((cartItem.price*cartItem.qty)*(+discount.rate/100), 2)
              cartItem.saleRate = customRate
              cartItem.onSale = true
              cartItem.saleTitle = discount.title
            }
          })
        }) 
      })
      for (const key in defaultCart) {
        const fireProduct:CartItems = defaultCart[key]
        if (typeof fireProduct === "object" && fireProduct !== null) {
          if(fireProduct?.id !== 'items' && fireProduct?.id !=='totals'){
            tempArray.push(<CartItem {...{ fireProduct }} />)
          }
        }
      }
      if (tempArray?.length <= 0) {
        tempArray.push(<EmptyCart/>)
      }
    }
    if (fireCartTotals.status === "loading") {
      const dummy = [0, 1, 2]
      for (const key in dummy) {
        tempArray.push(<CartItemSkeleton key={key} />)
      }
    }
    setCartComponentList(tempArray)
  }, [fireCart.data, fireCartTotals.data, fireDiscounts.data])
  return <>{cartComponentList}</>
}
const RemoveButton = ({ onClick }) => {
  const handleClick = (e:any) => {
    Boolean(onClick) && onClick(e)
  }
  return (
    <button onClick={handleClick} className='button-base'>
      <SVGIcon name='delete' color='rgb(255,255,255)' size='standard' />
    </button>
  )
}





function Cart({ as, href, fireFeature }) {

  const router = useRouter()
  const { query } = router
  const { user, fireDiscounts, fireSettings, fireCartTotals, fireCart } = useUser()
  const { modalDispatch, modalState } = useDispatchModal()

  const [subTotalState, setSubTotalState] = useState(0)
  const [discountState, setDiscountState] = useState(0)
  const [isTaxFree, setIsTaxFree] = useState(false)
  const [youSaved, setYouSaved] = useState(0)
  const [taxesSaved, setTaxesSaved] = useState(0)

  useEffect(() => {
    (typeof fireCartTotals?.data?.subtotal === 'number' && typeof discountState === 'number') && setSubTotalState(fireCartTotals?.data?.subtotal - discountState)
    return () => setSubTotalState(0)
  }, [fireCartTotals, discountState]);

  useEffect(() => {
    let _discount:number = 0
    //let _savedTaxes:number = 0
  
    fireDiscounts?.data.map((discount:Discount)=>{
      
      if(discount.method.label === 'bogo'){
        _discount += toCents(+discount.rate)
      }
      if(discount.methodID === 'taxFree'){
        setIsTaxFree(true) 
        const e = fireSettings.data.exciseTax*fromCents(+subTotalState, 2)
        const l = fireSettings.data.localTax*fromCents(+subTotalState, 2)
        const s = fireSettings.data.stateTax*fromCents(+subTotalState, 2)
        const t = e + l + s
        const newSaved = toCents(t)
        setTaxesSaved(newSaved)
      }
      if(discount.methodID === 'flatRate'){
        _discount += toCents(+discount.rate)
      }
      if(discount.methodID === 'percent'){
        ///INCLUDE ALL PRODUVTS IN THIS EQUATION
       
        fireCart?.data.map((cartItem:CartItems)=>{
          
          discount.collectionIDs.map((collectionID:string)=>{
             alert(collectionID)
            if(cartItem.queryIDs.includes(collectionID) || collectionID === 'ALL_PRODUCTS'){
              const customRate = roundTo((cartItem.price*cartItem.qty)*(+discount.rate/100), 2)
              _discount += toCents(+customRate)
            }
          })
        })
      }
    })
    setDiscountState(_discount)
    return () => (setDiscountState(0),setIsTaxFree(false), setTaxesSaved(0))
  }, [fireDiscounts, fireCart, fireSettings, subTotalState]);

  useEffect(() => {
    let _saved:number = 0
    if(discountState){
      _saved += discountState
    }
    if(subTotalState >= fireSettings.data.freeDeliveryMin){
      _saved += toCents(fireSettings.data.deliveryFee)
    }
    setYouSaved(_saved + taxesSaved)
    return () => setYouSaved(0)
  }, [fireSettings, discountState, subTotalState, taxesSaved]);



  const openModal = (component:FC) => {
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
    //alert('hi')
    const component = () => <AddPromoCode {...{fireFeature}} />
    openModal(component)
  }
  const removePromo = (discount:Discount) => {
    const component = () => <DeletePromo {...{ discount }} />
    openModal(component)
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
                      <SVGIcon name='x' color='rgb(0,200,5)' size='standard' />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            <div className='cart-scroll-containter'>
              <div className='display-block-mw735 cart-flex-containter'>
                <div style={{ maxWidth: "100%" }}>

                  {/* Product */}
                  <CartList />
                  {/* Discounts */}  
                    {/* {fireDiscounts?.data && <div className='cart-total-section'>
                      <section> */}
                        {/* <div className='border-line' /> */}
                        {/* <div className='section-flex'> */}
                          {/* <div className='cart-margin'> */}
                            {/*
                             List the data aher eand ahe componenet with a remove button. 
                             fireDiscounts.data
                             .map
                             css
                            
                            
                            */}
                            {/* <div style={{fontSize:'16px', marginBottom:'12px', fontWeight:500}} >Discounts</div> */}
                            {/* {fireDiscounts?.data.map((discount:Discount)=>
                            
                            <div style={{ 
                              alignItems:'center', 
                              display:'flex',
                              padding:'12px', 
                              borderRadius:'8px', 
                              width:'100%',
                              color:'white', 
                              backgroundColor:'rgb(212, 54, 132)', 
                              boxShadow: '0 1px 2px 0 rgb(60 64 67 / 30%), 0 1px 3px 1px rgb(60 64 67 / 15%)',
                              backgroundImage: 'url(https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2FDollarBillsYall2.png?alt=media&token=ba79a182-7cfa-4e3a-bac9-2eb45921bfff)'}}>
                            <div style={{flex:3}} >
                              <div>{discount.title}</div>
                              <div style={{fontSize:'12px'}}>You saved {isCurr(discount.rate)}</div>                              
                            </div>
                            <div style={{flex:0,padding:'2px', backgroundColor:'rgba(212, 54, 132, 1)', borderRadius:'25px'}}>
                              <SVGIcon name='delete' color='rgb(255,255,255)' size='standard' />  
                            </div>                         
                          </div>
                            )} */}
                            {/* Discounts Show Here 
                            background-image: url(https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2FDollarBillsYall2.png?alt=media&token=ba79a182-7cfa-4e3a-bac9-2eb45921bfff);
                            */}
                          {/* </div> */}
                       
                       
                       
                       
                       
                        {/* </div> */}
                      {/* </section>
                    </div>} */}
                  {/* Totals */}  
                  {fireCartTotals?.status === "success" && fireCartTotals.data?.subtotal > 0 && (
                    <div className='cart-total-section'>
                      <section>
                        <div className='border-line' />
                        <div className='section-flex'>
                          <div className='cart-margin'>
                          {fireDiscounts?.data &&
                          <div style={{ margin: '0 10px 0 10px'}}>
                          {fireDiscounts?.data.map((discount:Discount)=>  
                            <div style={{ 
                              alignItems:'center', 
                              display:'flex',
                              padding:'10px', 
                              borderRadius:'8px', 
                              width:'100%',
                              color:'white', 
                              margin: '0 0 16px 0',
                              backgroundColor:'rgb(212, 54, 132)', 
                              boxShadow: '0 1px 2px 0 rgb(60 64 67 / 30%), 0 1px 3px 1px rgb(60 64 67 / 15%)',
                              backgroundImage: 'url(https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2FDollarBillsYall2.png?alt=media&token=ba79a182-7cfa-4e3a-bac9-2eb45921bfff)'}}>
                            <div style={{flex:3}} >
                              <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              fontWeight:500,
                            }}>{`${discount.title}${String.fromCharCode(160)}`}{discount.stackable && <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 0 24 24" width="18px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16zm0-11.47L17.74 9 12 13.47 6.26 9 12 4.53z"/></svg>}</div>
                              {discount.methodID === 'bogo' && <div style={{fontSize:'12px'}}>You saved {isCurr(discount.rate)}</div>  } 
                              {discount.methodID === 'flatRate' && <div style={{fontSize:'12px'}}>You saved {isCurr(discount.rate)}</div>  } 
                              {taxesSaved > 0 && <div style={{fontSize:'12px'}}>You saved {isCurr(fromCents(taxesSaved,2))}</div>  } 
                              {discount.methodID === 'percent' && discount.stackable === false && <div style={{fontSize:'12px'}}>You saved {isCurr(fromCents(discountState,2))}</div> }                           
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '6px',
                              backgroundColor: 'rgba(255, 255, 255, 0.35)',
                              height: '35px',
                              borderRadius: '10px',
                              width: '35px',
                              justifyContent: 'center',
                            }}>
                              {/* <SVGIcon name='delete' color='rgb(255,255,255)' size='standard' />   */}
                              <RemoveButton onClick={()=>removePromo(discount)} />
                            </div>                         
                          </div>
                            )}

                          </div>}


                            <div className='totals-list'>
                              <div className={`totals-overlay${fireCartTotals?.data?.loading ? "" : ` fadeOut`}`}>
                                <Spinner color={"rgb(0,200,5)"} style={null} />
                              </div>

                              {/* {fireCartTotals?.data?.discountRate && fireCartTotals?.data?.discountRate > 0 && (
                                <TotalsRow
                                  //variant={false}
                                  label={
                                    <>
                                      {`Discount`}
                                      <RemoveButton onClick={removePromo} />
                                    </>
                                  }
                                  value={<>{`-${isCurr(fromCents((Number(fireCartTotals?.data?.discountRate)||0),2) )}`} </>}
                                  variant='red'
                                />
                              )} */}
                              <TotalsRow
                                label={"Subtotal"}
                                variant={false}
                                value={
                                    `${isCurr(fromCents(+subTotalState,2) )}`
                                }
                              />
                              <TotalsRow
                                label={"Delivery Fee"}
                                variant={false}
                                value={
                                  ( fromCents(subTotalState,2) >= Number(fireSettings?.data?.freeDeliveryMin)) ? (
                                    <>
                                      {`${isCurr(0)}`}
                                      {`${String.fromCharCode(160)}`}
                                      <Strike>{`${isCurr(fireSettings?.data?.deliveryFee)}`}</Strike>
                                    </>
                                  ) : (
                                    `+${isCurr(fireCartTotals?.data?.deliveryFee)}`
                                  )
                                }
                              />
                              <TotalsRow 
                                variant={false} label={"Service Fee"} value={`+${isCurr(fireSettings?.data?.serviceFee)}`} />
                              <TotalsRow          
                                variant={false}
                                label={`Excise Tax ${fireSettings.data.exciseTax*100}%`}
                                value={  
                                  isTaxFree
                                    ?`+${isCurr(0)}`
                                    :`+${isCurr(fireSettings.data.exciseTax*fromCents(+subTotalState, 2))}`}
                              />
                              <TotalsRow          
                                variant={false}
                                label={`Local Tax ${fireSettings.data.localTax*100}%`}
                                value={ 
                                  isTaxFree
                                    ?`+${isCurr(0)}`
                                    :`+${isCurr(fireSettings.data.localTax*fromCents(+subTotalState, 2))}`
                                }
                              />
                              <TotalsRow          
                                variant={false}
                                label={`State Tax ${fireSettings.data.stateTax*100}%`}
                                value={  
                                  isTaxFree
                                    ?`+${isCurr(0)}`
                                    :`+${isCurr(fireSettings.data.stateTax*fromCents(+subTotalState, 2))}`}
                              />
                              <TotalsRow
                                variant='bold'
                                label={"Total"}
                                value={`${
                                  isTaxFree 
                                    ?isCurr(fromCents(+subTotalState,2))
                                    :isCurr(
                                      fromCents(
                                        getGrandTotal( 
                                          +subTotalState, 
                                          fireSettings.data.stateTax, 
                                          fireSettings.data.exciseTax, 
                                          fireSettings.data.localTax, 
                                          fireSettings.data.serviceFee
                                        )
                                      ,2)
                                    )
                                  
                              }`}
                              />
                              <TotalsRow
                                variant='red'
                                label={"You saved"}
                                value={`${isCurr(fromCents(youSaved,2) )}`}
                              />
                              <div className='cart-margin'>
                                <Button          
                                  disabled={false}
                                  loading={false}
                                  onClick={addPromo}
                                  variant='green-outline'
                                  fullWidth
                                  text={
                                    //fireCartTotals?.data?.hasCoupon
                                    false
                                      ? `${`"Coupon code"`} applied!`
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
              <div className='display-block-mw735' style={{ paddingBottom: 0 }}>
                <div className='module-wrapper module-wrapper' style={{ marginBottom: 0 }}>
                  <div className='cart-button-bottom-border'>
                    <div className='dual-input'>
                      <Link href={"/[adminID]/create-order/checkout"} as={`/${user?.uid}/create-order/checkout`}>
                        <Button
                          disabled={false}
                          loading={["idle", "loading"].includes(fireCartTotals.status)}
                          //onClick={addPromo}
                          spinnerColor={
                            ["idle", "loading"].includes(fireCartTotals.status)
                              ? "rgba(255,255,255,0.87)"
                              : "rgb(0,200,5)"
                          }
                          fullWidth
                          variant='green'
                          text='Checkout'
                        />
                      </Link>
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

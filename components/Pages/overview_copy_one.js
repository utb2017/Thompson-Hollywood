import style from "./Overview.module.scss"
import { useState, useEffect, useRef, useCallback } from "react"
import { useUser } from "../../context/userContext"
import SVGIcon from "../SVGIcon"
import { FormSection } from "../Console"
import Link from "next/link"
import {useRouting} from '../../context/routingContext'


const toMoney = (x) =>{
    let y = parseFloat(x) || `$0.00`
    if(y && parseFloat(y) === y){
        y = y.toLocaleString(
        "en-US",
        {
          style: "currency",
          currency: "USD",
        }
      )
    }
    return y
}


const Overview = () => {
  //const [loading, setLoading] = useState(false)
  const { user, fireTotals } = useUser()
  const { setNavLoading } = useRouting()
  const handleClick = () => {
    setNavLoading(true)
  }




  return (
    <>
      <div className={style["settings-container"]}>
        <div className={style["select-container"]}>
          <div className='mat-tab-link-container'>
            <div className={style["mat-tab-list"]} style={{ transform: "translateX(0px)" }}>
              <div className='mat-tab-links'>
                <div className={style["overview-totals-flex"]}>
                    <Link href={"/[adminID]/orders/[filter]"} as={`/${user?.uid}/orders/active`}>
                        <button onClick={handleClick} className={`button-base ${style["overview-totals-box"]} ${style["blue"]}`}>
                            <div className={style["overview-totals-inner"]}>
                            <div className={style["overview-totals-value"]}>{`${
                                fireTotals?.data?.active || 0
                            }`}</div>
                            <div className={style["overview-totals-label"]}>Active</div>
                            </div>
                        </button>
                    </Link>
                    <Link href={"/[adminID]/orders/[filter]"} as={`/${user?.uid}/orders/complete`}>
                        <button onClick={handleClick} className={`button-base ${style["overview-totals-box"]} ${style["purple"]}`}>
                            <div className={style["overview-totals-inner"]}>
                            <div className={style["overview-totals-value"]}>{`${
                                fireTotals?.data?.complete || 0
                            }`}</div>
                            <div className={style["overview-totals-label"]}>Unpaid</div>
                            </div>
                        </button>
                  
                  </Link>
                    <Link href={"/[adminID]/orders/[filter]"} as={`/${user?.uid}/orders/paid`}>
                  <button onClick={handleClick} className={`button-base ${style["overview-totals-box"]} ${style["green"]}`}>
                    <div className={style["overview-totals-inner"]}>
                      <div className={style["overview-totals-value"]}>{`${
                        fireTotals?.data?.paid || 0
                      }`}</div>
                      <div className={style["overview-totals-label"]}>Paid</div>
                    </div>
                  </button>
                  </Link>

                  
                  <Link href={"/[adminID]/orders/[filter]"} as={`/${user?.uid}/orders/cancel`}>
                  <button onClick={handleClick}  className={`button-base ${style["overview-totals-box"]} ${style["red"]}`}>
                    <div className={style["overview-totals-inner"]}>
                      <div className={style["overview-totals-value"]}>{`${
                        fireTotals?.data?.cancel || 0
                      }`}</div>
                      <div className={style["overview-totals-label"]}>Canceled</div>
                    </div>
                  </button>

                  </Link>

                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={style["overview-sales-total-container"]}>
          <div className={style["sales-total-list"]}>
            <div className={style["sales-total-row"]}>
              <FormSection title='Sales'>
                <div className={style["sales-total-flex"]}>
                  <div>
                    {" "}
                    <SVGIcon name='carFilled' />{" "}
                  </div>{" "}
                  <div className={style["sales-total-total"]}>{`${toMoney(fireTotals?.data?.grandTotal||'$0.00')}`}</div>
                </div>
              </FormSection>
            </div>
            <div className={style["sales-total-row"]}>
              <FormSection title='Tax'>
                <div className={style["sales-total-flex"]}>
                  <div>
                    {" "}
                    <SVGIcon name='moneyFilled' />{" "}
                  </div>{" "}
                  <div className={style["sales-total-total"]}>{`${toMoney(fireTotals?.data?.taxTotal||'$0.00')}`}</div>
                </div>
              </FormSection>
            </div>
            <div className={style["sales-total-row"]}>
              <FormSection title='Refunds'>
                <div className={style["sales-total-flex"]}>
                  <div>
                    {" "}
                    <SVGIcon name='refund' />{" "}
                  </div>{" "}
                  <div className={style["sales-total-total"]}>{`${toMoney(fireTotals?.data?.refundTotal||'$0.00')}`}</div>
                </div>
              </FormSection>
            </div>
            <div className={style["sales-total-row"]}>
              <FormSection title='Discounts'>
                <div className={style["sales-total-flex"]}>
                  <div>
                    {" "}
                    <SVGIcon name='couponsFilled' />{" "}
                  </div>{" "}
                  <div className={style["sales-total-total"]}>{`${toMoney(fireTotals?.data?.discountTotal||'$0.00')}`}</div>
                </div>
              </FormSection>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Overview

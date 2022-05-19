import style from "./Overview.module.scss"
import { useState, useEffect, useRef, useCallback } from "react"
import { useUser } from "../../context/userContext"
import SVGIcon from "../SVGIcon"
import { FormSection } from "../Console"
import Link from "next/link"
import { useRouting } from '../../context/routingContext'
import { LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, Cell, LabelList } from 'recharts';
import { useWindowSize } from "../../hooks/useWindowSize";
import { useStyletron } from "baseui";
import {
  Card,
  StyledBody,
  StyledAction
} from "baseui/card";
import { Label1 } from "baseui/typography"

const data = [
  { name: '12am', Orders: 0 },
  { name: '1pm', Orders: 0, },
  { name: '2pm', Orders: 6, },
  { name: '3pm', Orders: 4, },
  { name: '4am', Orders: 5, },
  { name: '5pm', Orders: 0, },
  { name: '6pm', Orders: 0, },
  { name: '7pm', Orders: 0, },
  { name: '8pm', Orders: 0, },
  { name: '9pm', Orders: 0, },
  { name: '10pm', Orders: 0, },

];
const drivers = [
  { name: 'Dylan Best', Orders: 12 },
  { name: 'McLovin', Orders: 2, },

];

const renderCustomizedLabel = (props) => {
  const { x, y, width, height, value } = props;
  const radius = 10;

  return (
    <g>
      <circle cx={x + width / 2} cy={y - radius} r={radius} fill="#8884d8" />
      <text x={x + width / 2} y={y - radius} fill="#fff" textAnchor="middle" dominantBaseline="middle">
        {value.split(' ')[1]}
      </text>
    </g>
  );
};
const toMoney = (x) => {
  let y = parseFloat(x) || `$0.00`
  if (y && parseFloat(y) === y) {
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
  const { user, fireTotals, fireUser, fireTotalsUnsettled } = useUser()
  const { setNavLoading } = useRouting()
  const { width, height } = useWindowSize()
  const [chartWidth, setChartWidth] = useState(false)
  const [css, theme] = useStyletron();
  const handleClick = () => {
    setNavLoading(true)
  }

  const ref = useRef(null);
  useEffect(() => {
    //alert(`width ${ref.current ? ref.current.offsetWidth : 0}`);
    setChartWidth(ref.current ? ref.current.offsetWidth : 0)
  }, [width, ref.current]);

  return (
    <>
      <div className={style["settings-container"]}>
        <div className={style["select-container"]}>
          <div style={{ padding: '0px 6px 0px 6px' }} className='mat-tab-link-container'>
            <div className={style["mat-tab-list"]} style={{ transform: "translateX(0px)" }}>
              <div className='mat-tab-links'>
                <div className={style["overview-totals-flex"]}>
                  <Link href={"/[adminID]/orders/[filter]"} as={`/${user?.uid}/orders/active`}>
                    <button onClick={handleClick} className={`button-base ${style["overview-totals-box"]} ${style["blue"]}`}>
                      <div className={style["overview-totals-inner"]}>
                        <div className={style["overview-totals-value"]}>{`${fireUser?.data?.role === 'driver' ? (fireUser?.data?.activeOrders || 0) : (
                          + (fireTotalsUnsettled?.data?.pending || 0)
                          + (fireTotalsUnsettled?.data?.assigned || 0)
                          + (fireTotalsUnsettled?.data?.pickup || 0)
                          + (fireTotalsUnsettled?.data?.warning || 0)
                          + (fireTotalsUnsettled?.data?.arrived || 0)
                          + (fireTotalsUnsettled?.data?.received || 0)
                        )}`}</div>
                        <div className={style["overview-totals-label"]}>Active</div>
                      </div>
                    </button>
                  </Link>
                  <Link href={"/[adminID]/orders/[filter]"} as={`/${user?.uid}/orders/complete`}>
                    <button onClick={handleClick} className={`button-base ${style["overview-totals-box"]} ${style["purple"]}`}>
                      <div className={style["overview-totals-inner"]}>
                        <div className={style["overview-totals-value"]}>{`${fireUser?.data?.role === 'driver' ? (fireUser?.data?.completeOrders || 0) : (fireTotalsUnsettled?.data?.complete || 0)}`}</div>
                        <div className={style["overview-totals-label"]}>Unpaid</div>
                      </div>
                    </button>

                  </Link>
                  <Link href={"/[adminID]/orders/[filter]"} as={`/${user?.uid}/orders/paid`}>
                    <button onClick={handleClick} className={`button-base ${style["overview-totals-box"]} ${style["green"]}`}>
                      <div className={style["overview-totals-inner"]}>
                        <div className={style["overview-totals-value"]}>{`${fireUser?.data?.role === 'driver' ? (fireUser?.data?.paidOrders || 0) : (fireTotalsUnsettled?.data?.paid || 0)}`}</div>
                        <div className={style["overview-totals-label"]}>Paid</div>
                      </div>
                    </button>
                  </Link>
                  {
                    ['manager', 'admin', 'dispatcher'].includes(`${fireUser?.data?.role}`) &&
                    <Link href={"/[adminID]/orders/[filter]"} as={`/${user?.uid}/orders/cancel`}>
                      <button onClick={handleClick} className={`button-base ${style["overview-totals-box"]} ${style["red"]}`}>
                        <div className={style["overview-totals-inner"]}>
                          <div className={style["overview-totals-value"]}>{`${fireUser?.data?.role === 'driver' ? (fireUser?.data?.cancelOrders || 0) : (fireTotalsUnsettled?.data?.cancel || 0)}`}</div>
                          <div className={style["overview-totals-label"]}>Canceled</div>
                        </div>
                      </button>
                    </Link>}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ margin: '0px 0px 77px 0px' }} className={style["overview-sales-total-container"]}>
          <div className={style["sales-total-list"]}>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              <Card style={{ margin: '0px 6px 24px 6px', flex: '1 1', minWidth: '180px' }} className={style["sales-total-row"]}>
                <FormSection title={<Label1>{'Cash Owed'}</Label1>}>
                  <div className={style["sales-total-flex"]}>
                    <div>
                      {" "}
                      <SVGIcon color={theme.colors.negative300} name='money' />{" "}
                    </div>{" "}
                    <div className={style["sales-total-total"]}><Label1>{`${toMoney(((fireTotalsUnsettled?.data?.owed || 0) / 100))
                      }`}</Label1></div>
                  </div>
                </FormSection>
              </Card>
              <Card style={{ margin: '0px 6px 24px 6px', flex: '1 1', minWidth: '180px' }} className={style["sales-total-row"]}>
                <FormSection title={<Label1>{'Cash Paid'}</Label1>}>
                  <div className={style["sales-total-flex"]}>
                    <div>
                      {" "}
                      <SVGIcon name='money' color={theme.colors.positive300} />{" "}
                    </div>{" "}
                    <div className={style["sales-total-total"]}><Label1>{`${toMoney(((fireTotalsUnsettled?.data?.grandTotal || 0) / 100))
                      }`}</Label1></div>
                  </div>
                </FormSection>
              </Card>
            </div>

            {/* <div className={style["sales-total-row"]}>
              <FormSection title='New Users'>
                <div className={style["sales-total-flex"]}>
                  <div>
                    {" "}
                    <SVGIcon name='person'  />{" "}
                  </div>{" "}
                  <div className={style["sales-total-total"]}>{`${0}`}</div>
                </div>
              </FormSection>
            </div> */}
            <div style={{ display: 'flex' }}>
              <div ref={ref} style={{ margin: '0px 6px 24px 6px' }} className={style["sales-total-row"]}>
                <Card>
                  <FormSection title={<Label1>{'Order Activity WIP'}</Label1>}>
                    <LineChart width={(chartWidth - 60)} height={(190)} data={data}>
                      <Line type="monotone" dataKey="Orders" stroke="#1a73e8" strokeWidth={2} fill="#1a73e8" />
                      <XAxis dataKey="name" />
                      {/* <YAxis /> */}
                      <Tooltip />
                    </LineChart>
                  </FormSection>

                </Card>

              </div>
            </div>
            <div style={{ display: 'flex' }}>
              <div ref={ref} style={{ margin: '0px 6px 24px 6px' }} className={style["sales-total-row"]}>
                <Card>
                  <FormSection title={<Label1>{'Driver Activity WIP'}</Label1>}>
                    <BarChart width={(chartWidth - 60)} height={(190)} barSize={20} data={drivers}>

                      <Tooltip />
                      <Bar dataKey="Orders" fill="#1a73e8" />

                      <XAxis dataKey="name" />
                      {/* <YAxis /> */}
                      {/* <Tooltip /> */}
                    </BarChart>
                  </FormSection>

                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Overview

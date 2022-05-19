import ConsoleLayout from '../../../layouts/ConsoleLayout'
import FinanceLayout from '../../../layouts/FinanceLayout'
import style from './Finance.module.scss'
import ServerError from '../../../components/Forms/ServerError'
import {useState, useEffect, useRef, useCallback} from 'react'
//import Select from "../../../components/Forms/Select";
import {Select} from 'baseui/select'
//import MenuItem from "../../../components/Menus/MenuItem";
import SVGIcon from '../../../components/SVGIcon'
import OrdersTable from './OrdersTable'
import {SIZE} from 'baseui/input'
// import Button from "../../../components/Buttons/Button";
import {Button} from 'baseui/button'
import {useUser} from '../../../context/userContext'
import {Footer} from '../../../components/Console'
import {NotificationManager} from 'react-notifications'
import firebase from '../../../firebase/clientApp'
import {useFirestoreQuery} from '../../../hooks/useFirestoreQuery'
import {useStyletron} from 'baseui'
import {Card, StyledBody, StyledAction, StyledTitle} from 'baseui/card'
import {weekNumberYearSun} from 'weeknumber'
import {useWindowSize} from '../../../hooks/useWindowSize'
import {LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, Cell, LabelList} from 'recharts'
import {useRouting} from '../../../context/routingContext'
import {pdfMakeTable} from '../../../helpers/PdfMakeTable'
import TableTemplate from '../../../components/Table/TableTemplate'
import {Caption1} from 'baseui/typography'
import {useQuery} from '../../../context/Query'

interface Params {
  value: any[]
  option: any
  type: 'clear' | 'select'
}
const _data = [
  {name: '12am', Orders: 0},
  {name: '1pm', Orders: 0},
  {name: '2pm', Orders: 6},
  {name: '3pm', Orders: 4},
  {name: '4am', Orders: 5},
  {name: '5pm', Orders: 0},
  {name: '6pm', Orders: 0},
  {name: '7pm', Orders: 0},
  {name: '8pm', Orders: 0},
  {name: '9pm', Orders: 0},
  {name: '10pm', Orders: 0},
]
const toMoney = (x: any) => {
  let y = Number(x) || `-- --`
  if (y && Number(y) === y) {
    y = y.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    })
  }
  return y
}
let isNum = function (x) {
  x = parseFloat(x)
  return isNaN(x) ? 0 : x
}

const Finances = (props) => {
  //alert(JSON.stringify(props.fireCustomer.data.id))
  const [serverError, setServerError] = useState(null)
  const [loading, setLoading] = useState(false)
  const {fireTotals, fireTotalsUnsettled} = useUser()
  const {width, height} = useWindowSize()
  const [chartWidth, setChartWidth] = useState(false)
  const [form, setForm] = useState({label: 'Today', value: 'today'})
  const [query, setQuery] = useState(null)
  const {setNavLoading} = useRouting()
  const [css, theme] = useStyletron()
  const [value, setValue] = useState([{label: 'Today', value: 'today'}])

  const {
    setTotalsField,
    setQueryCollection,
    setLimit,
    setOrderBy,
    setTotalsCollection,
    setTotalsDoc,
    setWhere,
    setQueryGroupCollection,
    setQuerySubCollection,
    fireStoreQueryTotals,
    fireStoreQueryTotal,
    // dataList,
    // queryLoader,
  } = useQuery()

  /* add shit to the query questions*/
  useEffect(() => {
    const options = {timeZone: 'America/Los_Angeles'}

    const d = new Date().toLocaleString('en-US', options)

    let y_d = new Date(d)
    y_d.setDate(y_d.getDate() - 1)

    // .setMonth(current.getMonth()-1);
    let l_m: any = new Date(d)
    l_m.setMonth(l_m.getMonth() - 1)
    l_m = new Date(l_m).toLocaleString('en-US', options)
    const l_o = l_m.split(',')
    const l_splitDate = l_o[0].split('/')
    const l_year = parseInt(l_splitDate[2])
    const l_month = parseInt(l_splitDate[0])
    //const l_date = parseInt(l_splitDate[1]);
    //const l_formatted_date = `${l_date}-${l_month}-${l_year}`

    const l_formatted_month = `${l_month}-${l_year}`
    //const l_formatted_year = `${l_year}`

    const y = new Date(y_d).toLocaleString('en-US', options)

    const date_data = weekNumberYearSun(new Date(d))
    const o = d.split(',')
    const splitDate = o[0].split('/')
    const year = parseInt(splitDate[2])
    const month = parseInt(splitDate[0])
    const date = parseInt(splitDate[1])

    const _l_year = parseInt(splitDate[2]) - 1

    const formatted_date = `${date}-${month}-${year}`
    const formatted_week = `${year}-${date_data.week}`
    const formatted_month = `${month}-${year}`
    const formatted_year = `${year}`
    const all = `all`

    //const y_date_data = weekNumberYearSun(new Date(y_d));
    const y_o = y.split(',')
    const y_splitDate = y_o[0].split('/')
    const y_year = parseInt(y_splitDate[2])
    const y_month = parseInt(y_splitDate[0])
    const y_date = parseInt(y_splitDate[1])

    const y_formatted_date = `${y_date}-${y_month}-${y_year}`
    const y_formatted_week = `${year}-${date_data.week === 1 ? 144 : date_data.week - 1}`
    //const y_formatted_month = `${y_month}-${y_year}`;
    const y_formatted_year = `${_l_year}`

    if (form?.value === 'today') {

  

      setTotalsCollection("totals")
      setTotalsDoc("unsettled");
      setTotalsField("total");

      //setQuery(firebase.firestore().collection("totals").doc("unsettled"));

      setQueryGroupCollection('Orders')
      setWhere([['progress', '==', 'paid']])
      setOrderBy('id')


    } else if (form?.value === 'yesterday') {


        //firebase.firestore().collection("statements").doc(`${y_formatted_date}`)

        setTotalsCollection("statements")
        setTotalsDoc(`${y_formatted_date}`);
        setTotalsField("total");

      setQueryGroupCollection('Orders')
      setWhere([
        ['dateFormat', '==', `${y_formatted_date}`],
        ['settled', '==', true],
        ['progress', '==', 'paid'],
      ])
      setOrderBy('id')
    } else if (form?.value === 'this_week') {

        setTotalsCollection("statements")
        setTotalsDoc(`${formatted_week}`);
        setTotalsField("total");

      setQueryGroupCollection('Orders')
      setWhere([
        ['week', '==', +date_data.week],
        ['year', '==', +date_data.year],
        ['settled', '==', true],
        ['progress', '==', 'paid'],
      ])
      setOrderBy('id')
    } else if (form?.value === 'last_week') {


        setTotalsCollection("statements")
        setTotalsDoc(`${y_formatted_week}`);
        setTotalsField("total");


      setQueryGroupCollection('Orders')
      setWhere([
        ['week', '==', +(date_data.week === 1) ? 144 : date_data.week - 1],
        ['year', '==', +date_data.year],
        ['settled', '==', true],
        ['progress', '==', 'paid'],
      ])
      setOrderBy('id')
    } else if (form?.value === 'this_month') {

       // firebase.firestore().collection("statements").doc(`${formatted_month}`)


       setTotalsCollection("statements")
       setTotalsDoc(`${formatted_month}`);
       setTotalsField("total");

      setQueryGroupCollection('Orders')
      setWhere([
        ['year', '==', +year],
        ['month', '==', +month],
        ['settled', '==', true],
        ['progress', '==', 'paid'],
      ])
      setOrderBy('id')
    } else if (form?.value === 'last_month') {
       // setQuery(firebase.firestore().collection("statements").doc(`${l_formatted_month}`));
      setTotalsCollection("statements")
      setTotalsDoc(`${l_formatted_month}`);
      setTotalsField("total");

      setQueryGroupCollection('Orders')
      setWhere([
        ['year', '==', year],
        ['month', '==', +(month === 0 ? 11 : month - 1)],
        ['settled', '==', true],
        ['progress', '==', 'paid'],
      ])
      setOrderBy('id')
    } else if (form?.value === 'this_year') {


        setTotalsCollection("statements")
        setTotalsDoc(`${formatted_year}`);
        setTotalsField("total");



      setQueryGroupCollection('Orders')
      setWhere([
        ['year', '==', year],
        ['settled', '==', true],
        ['progress', '==', 'paid'],
      ])
      setOrderBy('id')
    } else if (form?.value === 'last_year') {
        setTotalsCollection("statements")
        setTotalsDoc(`${y_formatted_year}`);
        setTotalsField("total");
      setQueryGroupCollection('Orders')
      setWhere([
        ['year', '==', +(year - 1)],
        ['settled', '==', true],
        ['progress', '==', 'paid'],
      ])
      setOrderBy('id')
    } else if (form?.value === 'all') {
        setTotalsCollection("statements")
        setTotalsDoc(`all`);
        setTotalsField("total");
      setQueryGroupCollection('Orders')
      setWhere([
        ['settled', '==', true],
        ['progress', '==', 'paid'],
      ])
      setOrderBy('id')
    }
    return () => {
      setTotalsField(null)
      setTotalsDoc(null)
      setTotalsCollection(null)
      setQueryGroupCollection(null)
      setQuerySubCollection(null)
      setQueryCollection(null)
      setLimit(5)
      setOrderBy(null)
      setWhere(null)
    }
  }, [form])

  const data = useFirestoreQuery(query)

  useEffect(() => {
    let _loading = false
    if (data?.status === 'loading') {
      _loading = true
    }
    setNavLoading(_loading)
    setLoading(_loading)
  }, [data])

  useEffect(() => {
    return () => {
      setForm({label: 'Today', value: 'today'})
    }
  }, [])

  const settleOrders = async () => {
    setLoading(true)
    try {
      const _settleOrders = firebase.functions().httpsCallable('settleOrders')
      const response = await _settleOrders()
      console.log('_settleOrders')
      console.log(response?.data)
      if (response?.data?.success === true) {
        NotificationManager.success('_settleOrders.')
        //closeModal()
      }
    } catch (e) {
      //alert(`${e?.message || e}`)
      //NotificationManager.error(`${e?.message || e}`)
    } finally {
      setLoading(false)
    }
  }

  const ref = useRef(null)
  useEffect(() => {
    //alert(`width ${ref.current ? ref.current.offsetWidth : 0}`);
    setChartWidth(ref.current ? ref.current.offsetWidth : 0)
  }, [width, ref.current])

  const _exportPdfTable = () => {
    // change this number to generate more or less rows of data
   // alert(`me? ${JSON.stringify(fireStoreQueryTotals?.data)}`)
    pdfMakeTable(20, fireStoreQueryTotals)
  }

  return (
    <>
      <div id='settings-store' className={style['settings-page']}>
        <div className={style['settings-container']}>
          {/* <div className={style["select-container"]}>
                        <Select
                            id="dates"
                            name="dates"
                            selectedOption={form}
                            disabled={loading}
                            // validationErrorText={error?.role}
                            style={{ maxWidth: '375px' }}
                            floatingLabelText="Date"
                            hintText="Select a date"
                            onSelect={(_, x) => setForm(x)}
                            fullWidth
                        >
                            <MenuItem label={"Today"} value={"today"} />
                            <MenuItem label={"Yesterday"} value={"yesterday"} />
                            <MenuItem label={"This Week"} value={"this_week"} />
                            <MenuItem label={"Last Week"} value={"last_week"} />
                            <MenuItem label={"This Month"} value={"this_month"} />
                            <MenuItem label={"Last Month"} value={"last_month"} />
                            <MenuItem label={"This Year"} value={"this_year"} />
                            <MenuItem label={"Last Year"} value={"last_year"} />
                            <MenuItem label={"All of it"} value={"all"} /> 
                        </Select>
                    </div> */}

          <div
            className={css({
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: theme.sizing.scale600,
            })}>
            <div
              className={css({
                maxWidth: '340px',
                width: '100px',
                flex: 'auto',
                minWidth: '160px',
              })}>
              <Select
                size={width < 375 ? SIZE.compact : SIZE.default}
                options={[
                  {label: 'Today', value: 'today'},
                  {label: 'Yesterday', value: 'yesterday'},
                  {label: 'This Week', value: 'this_week'},
                  {label: 'Last Week', value: 'last_week'},
                  {label: 'This Month', value: 'this_month'},
                  {label: 'Last Month', value: 'last_month'},
                  {label: 'This Year', value: 'this_year'},
                  {label: 'Last Year', value: 'last_year'},
                  {label: 'All of it', value: 'all'},
                ]}
                value={[form]}
                labelKey="label"
                valueKey="value"
                clearable={false}
                placeholder='Filter'
                onChange={({value, type, option}: Params) => {
                  //setValue(value)
                  setForm(value[0])
                  // if (type === 'select') {
                  //   // alert([`collectionIDs`, "array-contains", `${option.value}`])
                  //   setWhere([[`collectionIDs`, "array-contains", `${option.value}`]])
                  //   setTotalsCollection("collections")
                  //   setTotalsDoc(`${option.value}`);
                  //   setTotalsField("total");
                  // }
                  // if (type === 'clear') {
                  //   //alert('clear')
                  //   setWhere([])
                  //   setTotalsCollection("totals")
                  //   setTotalsDoc("menu");
                  //   setTotalsField("products");

                  // }
                }}
                overrides={{
                  SelectArrow: {
                    props: {
                      overrides: {
                        Svg: {
                          component: (props) => <SVGIcon name='sort' />,
                        },
                      },
                    },
                  },
                }}
              />
            </div>
            <div
              className={css({
                height: '10px',
                width: '10px',
                flex: '0',
                display: 'flex',
              })}
            />

            <Button
              size={width < 375 ? SIZE.compact : SIZE.default}
              //kind={themeState?.dark ? KIND.secondary : undefined}
              onClick={_exportPdfTable}
              isLoading={Boolean(loading)}
              disabled={Boolean(loading)}>
              <div
                className={css({
                  paddingLeft: theme.sizing.scale200,
                  paddingRight: theme.sizing.scale200,
                })}>
                Export
              </div>
            </Button>
          </div>

          <div className={style['finances-container']}>
            <div className={style['finances-flex']}>
              <div className={style['finances-box']}>
                <Card>
                  {/* <div className={style["finances-box-inner"]}> */}
                  <StyledTitle>{`${form.label}'s Sales`}</StyledTitle>
                  <StyledBody>
                    <ul className={style['finances-list-container']}>
                      <li className={style['finances-list-item']}>
                        <div className={style['finances-title-box']}>Subtotal</div>
                        <div className={style['finances-value-box']}>
                          <Caption1>{toMoney(fireStoreQueryTotals?.data?.productsTotal / 100)}</Caption1>
                        </div>
                      </li>
                      <li className={style['finances-list-item']}>
                        <div className={style['finances-title-box']}>Discount</div>
                        <div className={style['finances-value-box']}>
                          <Caption1>-{toMoney(fireStoreQueryTotals?.data?.discountTotal / 100)}</Caption1>
                        </div>
                      </li>
                      <li className={style['finances-list-item']}>
                        <div className={style['finances-title-box']}>Delivery</div>
                        <div className={style['finances-value-box']}>
                          <Caption1>{toMoney(fireStoreQueryTotals?.data?.deliveryTotal / 100)}</Caption1>
                        </div>
                      </li>
                      <li className={style['finances-list-item']}>
                        <div className={style['finances-title-box']}>Credit</div>
                        <div className={style['finances-value-box']}>
                          <Caption1>{toMoney(fireStoreQueryTotals?.data?.creditTotal / 100)}</Caption1>
                        </div>
                      </li>
                      <li className={style['finances-list-item']}>
                        <div className={style['finances-title-box']}>Service Fee</div>
                        <div className={style['finances-value-box']}>
                          <Caption1>{toMoney(fireStoreQueryTotals?.data?.serviceFee / 100)}</Caption1>
                        </div>
                      </li>
                      <li className={style['finances-list-item']}>
                        <div className={style['finances-title-box']}>State Tax</div>
                        <div className={style['finances-value-box']}>
                          <Caption1>{toMoney(fireStoreQueryTotals?.data?.stateTax / 100)}</Caption1>
                        </div>
                      </li>
                      <li className={style['finances-list-item']}>
                        <div className={style['finances-title-box']}>Local Tax</div>
                        <div className={style['finances-value-box']}>
                          <Caption1>{toMoney(fireStoreQueryTotals?.data?.localTax / 100)}</Caption1>
                        </div>
                      </li>
                      <li className={style['finances-list-item']}>
                        <div className={style['finances-title-box']}>Excise Tax</div>
                        <div className={style['finances-value-box']}>
                          <Caption1>{toMoney(fireStoreQueryTotals?.data?.exciseTax / 100)}</Caption1>
                        </div>
                      </li>

                      <div className={style['gray-line']} />
                      <li className={style['finances-list-item']}>
                        <div className={style['finances-title-box']}>
                          <b>Total Sales</b>
                        </div>
                        <div className={style['finances-value-box']}><Caption1>{toMoney(fireStoreQueryTotals?.data?.grandTotal / 100)}</Caption1></div>
                      </li>
                    </ul>
                  </StyledBody>

                  {/* </div> */}
                </Card>
              </div>

              <div className={style['finances-box']}>
                <Card>
                  <StyledTitle>{`${form.label}'s Totals`}</StyledTitle>
                  <StyledBody>
                    <ul className={style['finances-list-container']}>
                      <li className={style['finances-list-item']}>
                        <div className={style['finances-title-box']}>Products Sold</div>
                        <div className={style['finances-value-box']}>
                          <Caption1>{fireStoreQueryTotals?.data?.productsSold || 0}</Caption1>
                        </div>
                      </li>
                      <li className={style['finances-list-item']}>
                        <div className={style['finances-title-box']}>Product Total</div>
                        <div className={style['finances-value-box']}>
                          <Caption1>{toMoney(fireStoreQueryTotals?.data?.productsTotal / 100)}</Caption1>
                        </div>
                      </li>
                      <div className={style['gray-line']} />
                      <li className={style['finances-list-item']}>
                        <div className={style['finances-title-box']}>Credits Applied</div>
                        <div className={style['finances-value-box']}>
                          <Caption1>{fireStoreQueryTotals?.data?.creditsApplied || 0}</Caption1>
                        </div>
                      </li>
                      <li className={style['finances-list-item']}>
                        <div className={style['finances-title-box']}>Credit Total</div>
                        <div className={style['finances-value-box']}>
                          <Caption1>{toMoney(fireStoreQueryTotals?.data?.creditTotal / 100)}</Caption1>
                        </div>
                      </li>
                      <div className={style['gray-line']} />
                      <li className={style['finances-list-item']}>
                        <div className={style['finances-title-box']}>Discounts Applied</div>
                        <div className={style['finances-value-box']}>
                          <Caption1>{fireStoreQueryTotals?.data?.discountsApplied || 0}</Caption1>
                        </div>
                      </li>
                      <li className={style['finances-list-item']}>
                        <div className={style['finances-title-box']}>Discount Total</div>
                        <div className={style['finances-value-box']}>
                          <Caption1>{toMoney(fireStoreQueryTotals?.data?.discountTotal / 100)}</Caption1>
                        </div>
                      </li>
                      <div className={style['gray-line']} />
                      <li className={style['finances-list-item']}>
                        <div className={style['finances-title-box']}>Wholesale Total</div>
                        <div className={style['finances-value-box']}>
                          <Caption1>{toMoney(fireStoreQueryTotals?.data?.wholesale / 100)}</Caption1>
                        </div>
                      </li>
                      <li className={style['finances-list-item']}>
                        <div className={style['finances-title-box']}>Profit Total</div>
                        <div className={style['finances-value-box']}>
                          <Caption1>{toMoney(fireStoreQueryTotals?.data?.profit / 100)}</Caption1>
                        </div>
                      </li>
                      <div className={style['gray-line']} />
                      <li className={style['finances-list-item']}>
                        <div className={style['finances-title-box']}>
                          <b>Total Orders</b>
                        </div>
                        <div className={style['finances-value-box']}>
                          <Caption1>{fireStoreQueryTotals?.data?.total || 0}</Caption1>
                        </div>
                      </li>
                    </ul>
                  </StyledBody>
                </Card>
              </div>
            </div>
          </div>
          <OrdersTable form={form} />
          {/* <TableTemplate view={view} form={form} fireCustomer={props?.fireCustomer} collectionTotal={fireStoreQueryTotals?.data?.total} /> */}
        </div>
      </div>
    </>
  )
}

export default Finances

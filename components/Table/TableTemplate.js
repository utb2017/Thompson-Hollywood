import {useState, useEffect, useCallback, createRef, useMemo, useRef} from 'react'
import {useFirestoreQuery} from '../../hooks/useFirestoreQuery'
import firebase from '../../firebase/clientApp'
import {useUser} from '../../context/userContext'
import {useUsers} from '../../context/usersContext'
import Link from 'next/link'
import {colors} from '../../styles'
import Spinner from '../../components/Buttons/Spinner'
import Button from '../../components/Buttons/Button'
import {useRouting} from '../../context/routingContext'
import { weekNumberYearSun } from "weeknumber";
import {TableCell, HeaderCell, TableRow, HeaderRow, TableOutlet, TableHeader, TableContent} from '../../components/Table'
//import { fire } from '../SVGIcon/icons'
import { capitalize, isNum, isEmpty } from '../../helpers'
import { useRouter } from "next/router"

import { useHistory } from '../../context/History'
Date.prototype.addHours = function (h) {
  this.setTime(this.getTime() + h * 60 * 60 * 1000)
  return this
}

const OrdersRow = ({
  progress = "N/A",
  address = "N/A",
  start,
  id,
  photoURL = "https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2Fplaceholder-images-image_large.png?alt=media&token=9dcb7b69-aee4-43ad-9a16-f984510b9703",
  phoneNumber = "N/A",
  displayName = "N/A",
  //totalItemsSold = 0,
  cartTotals,
  user,
  dateFormat = undefined
}) => {
  const { user:{uid}, fireSettings } = useUser()
  //alert(JSON.stringify(cartTotals))
  return (
    <TableRow
      key={id}
      as={`/${uid}/orders/selected/${user}/${id}`}
      href={`/[adminID]/orders/selected/[uid]/[oid]`}>
      <TableCell
        id='t-photoURL'
        img={
          photoURL ||
          "https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2Fplaceholder-images-image_large.png?alt=media&token=9dcb7b69-aee4-43ad-9a16-f984510b9703"
        }
        maxWidth={90}
        mobileHide={true}
      />
      <TableCell
        id='date'
        minWidth={150}
        flex={1}
        text={<>{dateFormat?`${dateFormat}`:`${`N/A`}`}</>}
        mobileHide={false}
      />
      {/* <TableCell
        id='t-start'
        flex={1}
        text={
          typeof start === Date
            ? `${new Date(start.toDate())
                .addHours(fireSettings.data?.waitTime)
                .toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
                .toLowerCase()}`
            : "--"
        }
        mobileHide={true}
      /> */}
      <TableCell
        id='t-start'
        flex={2}
        text={
          <>
            {`${displayName || ""}`}
            <br />
            {`${phoneNumber || ""}`}
          </>
        }
        mobileHide={true}
      />
      <TableCell id='t-totalItemsSold' flex={1} text={`${cartTotals?.totalItemsSold||`0`}`} mobileHide={true} />
      <TableCell id='t-end' flex={1} text={cartTotals?.grandTotal} mobileHide={false} />




    </TableRow>
  )
}
const OrdersList = ({ fireCollections }) => {
  const [products, setProducts] = useState([])
  const { setLastID, setFirstID, reverse } = useUsers()

  useEffect(() => {
    let tempProducts = []
    let tempIDs = []
    const { data, status } = fireCollections
    if (status === "success") {
      for (const key in data) {
        tempIDs.push(data[key].id)
        tempProducts.push(<OrdersRow {...data[key]} key={key} />)
      }
      if (reverse) {
        tempProducts.reverse()
        tempIDs.reverse()
      }
    }
    setFirstID(tempIDs[0])
    setLastID(tempIDs.pop())
    setProducts(tempProducts)
  }, [fireCollections])
  return products
}
  const _default = {
    'settled': ['settled'],
    'received': ['received'],
    'cancel': ['cancel'],
    'complete': ['complete'],
    'paid': ['paid'],
    'active': ['received', 'pending', 'assigned', 'pickup', 'warning','arrived'],
    'none': [],
    'undefined':[],
    'null':[],
    'false':[],
    '':[],
  }
const Orders = (props) => {
  const router = useRouter()
  const [searchState, setSearchState] = useState("")
  const [searchValue, setSearchValue] = useState("")
  const [searchUser, setSearchUser] = useState([])
  const { user, fireTotals, fireUser, fireTotalsUnsettled } = useUser()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(5)
  //const [collectionTotal, setCollectionTotal] = useState(0)
  const { lastID, setLastID, firstID, setFirstID, setReverse } = useUsers()
  const [disableNext, setDisableNext] = useState(true)
  const [disablePrev, setDisablePrev] = useState(true)
  const [maxPage, setMaxPage] = useState(0)
  const [ref, setRef] = useState(null)
  const [query, setQuery] = useState(null)
  const [loading, setLoading] = useState(false)
  const {  setNavLoading } = useRouting()
  const [ orderProgressObject ] = useState(_default)
  const [totalsQuery, setTotalsQuery] = useState(null)
  //const { history, back } = useHistory()

  // useEffect(() => {
  //   return () => {
  //     back()
  //   };
  // }, []);


//   const fireCollectionsTotal = useFirestoreQuery(
//     user?.uid && query && firebase.firestore().collection("users").doc(router.query.id).collection('Totals').doc('history')
//   )

  
  //const collectionTotal = isNum(fireCollectionsTotal.data?.total) 
  const collectionTotal = (props?.collectionTotal || 0)
  const fireCollections = useFirestoreQuery(query)

// useEffect(() => {
//   alert(props?.form?.value)
// }, [props?.form?.value]);

  useEffect(() => {



    setLastID(null)
    setFirstID(null)
    setPage(1)
    setDisableNext(true)
    setDisablePrev(true)
    //setCollectionTotal(0)
    setMaxPage(1)
    setReverse(false)


    const options = { timeZone: "America/Los_Angeles" };

    const d = new Date().toLocaleString("en-US", options);

    let y_d = new Date(d);
    y_d.setDate(y_d.getDate() - 1);

    // .setMonth(current.getMonth()-1);
    let l_m = new Date(d);
    l_m.setMonth(l_m.getMonth() - 1);
    l_m = new Date(l_m).toLocaleString("en-US", options);
    const l_o = l_m.split(",");
    const l_splitDate = l_o[0].split("/");
    const l_year = parseInt(l_splitDate[2]);
    const l_month = parseInt(l_splitDate[0]);
    //const l_date = parseInt(l_splitDate[1]);
    //const l_formatted_date = `${l_date}-${l_month}-${l_year}`

    const l_formatted_month = `${l_month}-${l_year}`;
    //const l_formatted_year = `${l_year}`

    const y = new Date(y_d).toLocaleString("en-US", options);

    const date_data = weekNumberYearSun(new Date(d));
    const o = d.split(",");
    const splitDate = o[0].split("/");
    const year = parseInt(splitDate[2]);
    const month = parseInt(splitDate[0]);
    const date = parseInt(splitDate[1]);

    const _l_year = parseInt(splitDate[2]) - 1;

    const formatted_date = `${date}-${month}-${year}`;
    const formatted_week = `${year}-${date_data.week}`;
    const formatted_month = `${month}-${year}`;
    const formatted_year = `${year}`;
    const all = `all`;

    //const y_date_data = weekNumberYearSun(new Date(y_d));
    const y_o = y.split(",");
    const y_splitDate = y_o[0].split("/");
    const y_year = parseInt(y_splitDate[2]);
    const y_month = parseInt(y_splitDate[0]);
    const y_date = parseInt(y_splitDate[1]);

    const y_formatted_date = `${y_date}-${y_month}-${y_year}`;
    const y_formatted_week = `${year}-${date_data.week === 1 ? 144 : date_data.week - 1}`;
    //const y_formatted_month = `${y_month}-${y_year}`;
    const y_formatted_year = `${_l_year}`;


    if (props?.form?.value === "today") {
      
      //alert(props?.view)
      //alert(props?.fireCustomer?.id)
      if(props?.view === 'History' && props?.fireCustomer?.data?.id){
        //alert("hey")
        //i want user orders that are settled on todays date
        setRef(
            firebase
            .firestore()
            .collection("users")
            .doc(props?.fireCustomer?.data?.id)
            .collection('Orders')
            .where('dateFormat', '==', `${formatted_date}`)
            .where('settled', '==', false)
            .where('progress', '==', 'paid')
        )
        //setRef(firebase.firestore().collection("users").doc(props.fireCustomer.data.id).collection("History").doc(`${formatted_date}`) );
      }else{
        //setRef(firebase.firestore().collection("totals").doc("unsettled"));
        setRef(
            firebase
            .firestore()
            .collectionGroup('Orders')
            .where('dateFormat', '==', `${formatted_date}`)
            .where('settled', '==', false)
            .where('progress', '==', 'paid')
        )
      }
      
    } else if (props?.form?.value === "yesterday") {
      if(props?.view === 'History' && props?.fireCustomer?.data?.id){
        setRef(
            firebase
            .firestore()
            .collection("users")
            .doc(props?.fireCustomer?.data?.id)
            .collection('Orders')
            .where('dateFormat', '==', `${y_formatted_date}`)
            .where('settled', '==', true)
            .where('progress', '==', 'paid')
        )
      }else{
        setRef(
            firebase
            .firestore()
            .collectionGroup('Orders')
            .where('dateFormat', '==', `${y_formatted_date}`)
            .where('settled', '==', true)
            .where('progress', '==', 'paid')
        )
      }
    } else if (props?.form?.value === "this_week") {
      if(props?.view === 'History' && props?.fireCustomer?.data?.id){
        setRef(
            firebase
            .firestore()
            .collection("users")
            .doc(props?.fireCustomer?.data?.id)
            .collection('Orders')
            .where('week', '==', +date_data.week)
            .where('year', '==', +date_data.year)
            .where('settled', '==', true)
            .where('progress', '==', 'paid')
        )
      }else{
       // alert(date_data.week)
        //alert(date_data.year)
        setRef(
            firebase
            .firestore()
            .collectionGroup('Orders')
            .where('week', '==', +date_data.week)
            .where('year', '==', +date_data.year)
            .where('settled', '==', true)
            .where('progress', '==', 'paid')
        )
      }
    } else if (props?.form?.value === "last_week") {
      if(props?.view === 'History' && props?.fireCustomer?.data?.id){     
        setRef(
          firebase
          .firestore()
          .collection("users")
          .doc(props?.fireCustomer?.data?.id)
          .collection('Orders')
          .where('week', '==', +(date_data.week === 1) ? 144 : (date_data.week - 1))
          .where('year', '==', +date_data.year)
          .where('settled', '==', true)
          .where('progress', '==', 'paid')
      )
      }else{
        setRef(
          firebase
          .firestore()
          .collectionGroup('Orders')
          .where('week', '==', +(date_data.week === 1) ? 144 : (date_data.week - 1))
          .where('year', '==', +date_data.year)
          .where('settled', '==', true)
          .where('progress', '==', 'paid')
      )
      }
    } else if (props?.form?.value === "this_month") {
      if(props?.view === 'History' && props?.fireCustomer?.data?.id){
       // alert(month)
        setRef(
            firebase
            .firestore()
            .collection("users")
            .doc(props?.fireCustomer?.data?.id)
            .collection('Orders')
            .where('year', '==', +year)
            .where('month', '==', +month)
            .where('settled', '==', true)
            .where('progress', '==', 'paid')
        )
      }else{
        setRef(
            firebase
            .firestore()
            .collectionGroup('Orders')
            .where('year', '==', +year)
            .where('month', '==', +month)
            .where('settled', '==', true)
            .where('progress', '==', 'paid')
        )
      }
    } else if (props?.form?.value === "last_month") {
      if(props?.view === 'History' && props?.fireCustomer?.data?.id){
          //alert(y_month)
        setRef(
            firebase
            .firestore()
            .collection("users")
            .doc(props?.fireCustomer?.data?.id)
            .collection('Orders')
            .where('year', '==', +year)
            .where('month', '==', +(month === 0 ? 11: month-1))
            .where('settled', '==', true)
            .where('progress', '==', 'paid')
        )
      }else{
        setRef(
            firebase
            .firestore()
            .collectionGroup('Orders')
            .where('year', '==', year)
            .where('month', '==', +(month === 0 ? 11: month-1))
            .where('settled', '==', true)
            .where('progress', '==', 'paid')
        )
      }
    } else if (props?.form?.value === "this_year") {
        if(props?.view === 'History' && props?.fireCustomer?.data?.id){
            setRef(
                firebase
                .firestore()
                .collection("users")
                .doc(props?.fireCustomer?.data?.id)
                .collection('Orders')
                .where('year', '==', +year)
                .where('settled', '==', true)
                .where('progress', '==', 'paid')
                //.where('month', '==', y_month)
            )
          }else{
            setRef(
                firebase
                .firestore()
                .collectionGroup('Orders')
                .where('year', '==', +year)
                .where('settled', '==', true)
                .where('progress', '==', 'paid')
                //.where('month', '==', y_month)
            )
          }
    } else if (props?.form?.value === "last_year") {
        if(props?.view === 'History' && props?.fireCustomer?.data?.id){
            setRef(
                firebase
                .firestore()
                .collection("users")
                .doc(props?.fireCustomer?.data?.id)
                .collection('Orders')
                .where('year', '==', +(year-1))
                .where('settled', '==', true)
                .where('progress', '==', 'paid')
                //.where('month', '==', y_month)
            )
          }else{
            setRef(
                firebase
                .firestore()
                .collectionGroup('Orders')
                .where('year', '==', +(year-1))
                .where('settled', '==', true)
                .where('progress', '==', 'paid')
                //.where('month', '==', y_month)
            )
          }
    } else if (props?.form?.value === "all") {
        if(props?.view === 'History' && props?.fireCustomer?.data?.id){
            setRef(
                firebase
                .firestore()
                .collection("users")
                .doc(props?.fireCustomer?.data?.id)
                .collection('Orders')
                .where('settled', '==', true)
                .where('progress', '==', 'paid')
                //.where('month', '==', y_month)
            )
          }else{
            setRef(
                firebase
                .firestore()
                .collectionGroup('Orders')
                .where('settled', '==', true)
                .where('progress', '==', 'paid')
                //.where('month', '==', y_month)
            )
          }
    }





    // user?.uid &&
    //   setRef(
    //     firebase
    //       .firestore()
    //       .collection("users")
    //       .doc(router.query.id)
    //       .collection('Orders')
    //       .where('settled', '==', true)
    //   )

    //Driver



    return () => {
      setLastID(null);
      setFirstID(null);
      setPage(1);
      setDisableNext(true);
      setDisablePrev(true);
      //setCollectionTotal(0)
      setMaxPage(1);
      setReverse(false);
    };

  }, [user?.uid, props?.form?.value])

  useEffect(() => {

    if (collectionTotal > 0) {
      setMaxPage(Math.ceil(collectionTotal / limit))
    } else {
      setMaxPage(0)
    }
  }, [collectionTotal, limit, props?.form?.value])

  useEffect(() => {
    if (page === maxPage) {
      setDisableNext(true)
    } else {
      setDisableNext(false)
    }
  }, [page, maxPage, props?.form?.value])

  useEffect(() => {
    setDisablePrev(!Boolean(page > 1))
  }, [page, router, props?.form?.value])

  useEffect(() => {
    ref && setQuery(ref.orderBy("id", "asc").limit(limit))
  }, [ref, props?.form?.value])

  const nextPage = useCallback(() => {
    setReverse(false)
    setQuery(ref.orderBy("id", "asc").startAfter(lastID).limit(limit))
    setPage((p) => parseInt(p) + 1)
  }, [lastID, limit, props?.form?.value])

  const prevPage = useCallback(() => {
    setReverse(true)
    setQuery(ref.orderBy("id", "desc").startAfter(firstID).limit(limit))
    setPage((p) => parseInt(p) - 1)
  }, [firstID, limit, props?.form?.value])


  const handleCreateClick = () => {
    setNavLoading(true)
  }





  return (
    <>
      {/* OUTLET */}
      <div style={{margin:'0 -20px'}}>
      <TableOutlet variation='white'>
        <>
        <TableHeader variation='white'>
            <div
                style={{
                  display: "flex",
                  flex: "wrap",
                  width: "100%",
                  padding: "8px",
                  flexWrap: "wrap",
                 // flexDirection: "row-reverse",
                }}
              >
                <div style={{ 
                    margin: "8px",
                    color: '#2C384A',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    lineHeight: 1,
                    marginBottom: '20px',
                    display: 'block',
                    //fontFamily: '-apple-system',
                
                }}>
                { `${props?.form?.label}'s Orders` }
                </div>
                {/* <div style={{ flex: 2, margin: "8px", minWidth: "180px" }}>
                </div> */}
              </div>
            </TableHeader>
            {fireCollections?.status === "success" && Boolean(fireCollections?.data.length > 0) && (
      
          <>
            <TableContent>
              {/* HEADER */}
              <HeaderRow variation='white'>
                <HeaderCell id='h-type' maxWidth={90} mobileHide={true} />
                <HeaderCell
                  id='h-title'
                  minWidth={150}
                  flex={1}
                  text={"Date"}
                  mobileHide={false}
                />
                {/* <HeaderCell id='start' flex={1} text={"Due by"} mobileHide={true} /> */}
                <HeaderCell id='amount' flex={2} text={"User"} mobileHide={true} />
                <HeaderCell id='items' flex={1} text={"Items Sold"} mobileHide={true} />
                <HeaderCell id='end' flex={1} text={"Total"} mobileHide={false} />
              </HeaderRow>
              {/* DATA LIST */}
              {Boolean(fireCollections?.data && !isEmpty(fireCollections?.data) && !loading) && (
                <>
                  {!loading &&
                    (searchValue?.length < 1 || searchValue.length > 13) &&
                    fireCollections.status === "success" &&
                    fireCollections?.data?.length > 0 
                       && <OrdersList {...{ fireCollections }} />}
                </>
              )}
            </TableContent>
            {/* PAGINATION */}
            {(fireCollections.status === "success" && ( collectionTotal > 0) ) && (
              <div className='card-actions'>
                <div className='user-paginator'>
                  <div id='mat-paginator' className='mat-paginator'>
                    <div className='mat-paginator-outer-container'>
                      <div className='mat-paginator-container'>
                        {/**/}
                        <div className='mat-paginator-page-size '></div>
                        <div className='mat-paginator-range-actions'>
                          <div className='mat-paginator-range-label'>
                            {` ${page * limit - limit + 1 || page} - ${
                              page * limit < collectionTotal ? page * limit : collectionTotal
                            } of ${collectionTotal} `}
                          </div>
                          <button
                            style={{ backgroundColor: "unset" }}
                            onClick={prevPage}
                            className='mat-paginator-navigation-previous mat-focus-indicator mat-tooltip-trigger mat-icon-button mat-button-base'
                            type='button'
                            aria-label='Previous page'
                            disabled={disablePrev}>
                            <span className='mat-button-wrapper'>
                              <svg
                                className='mat-paginator-icon'
                                focusable='false'
                                viewBox='0 0 24 24'>
                                <path d='M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z' />
                              </svg>
                            </span>
                          </button>
                          <button
                            style={{ backgroundColor: "unset" }}
                            onClick={nextPage}
                            className='mat-paginator-navigation-next mat-focus-indicator mat-tooltip-trigger mat-icon-button mat-button-base'
                            type='button'
                            aria-label='Next page'
                            disabled={disableNext}>
                            <span className='mat-button-wrapper'>
                              <svg
                                className='mat-paginator-icon'
                                focusable='false'
                                viewBox='0 0 24 24'>
                                <path d='M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z' />
                              </svg>
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
          {/* ERROR */}
          {Boolean(fireCollections?.status === "error") && (
            <div
              className='nav-denied'
              style={{
                flexDirection: "column",
                padding: "64px",
                margin: "auto",
                overflowWrap: "anywhere",
              }}>
              <h2>An error occurred.</h2>
              <br />
              {fireCollections?.error && (
                <>
                  <p>{`Fire Orders. ${fireCollections?.error?.message || "An error occurred."}`}</p>
                  <br />
                </>
              )}
            </div>
          )}

          {/* LOADING */}
          {(Boolean(fireCollections?.status === "loading") ||
            Boolean(fireCollections?.status === "idle") ||
            loading ||
            Boolean((searchValue || "").length > 0 && (searchValue || "").length < 14)) && (
            <div className='table-spinner-container white'>
              <Spinner />
            </div>
          )}

          {/* NO DATA */}
          {((fireCollections.status === "success" &&
            fireCollections.data?.length === 0 &&
            (searchValue || "").length === 0) ||
            (!loading && searchValue?.length > 13 && fireCollections.data?.length === 0)) && (
            <div className='table-spinner-container white'>
              <div className='noResult'>No Results</div>
            </div>
          )}
        </>
      </TableOutlet>
      </div> 
    </>
  )
}

export default Orders

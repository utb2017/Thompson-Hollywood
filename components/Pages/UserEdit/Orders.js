import {useState, useEffect, useCallback, createRef, useMemo, useRef} from 'react'
import {useFirestoreQuery} from '../../../hooks/useFirestoreQuery'
import firebase from '../../../firebase/clientApp'
import {useUser} from '../../../context/userContext'
import {useUsers} from '../../../context/usersContext'
import Link from 'next/link'
import {colors} from '../../../styles'
import Spinner from '../../../components/Buttons/Spinner'
import Button from '../../../components/Buttons/Button'
import {useRouting} from '../../../context/routingContext'
import {TableCell, HeaderCell, TableRow, HeaderRow, TableOutlet, TableHeader, TableContent} from '../../../components/Table'
//import { fire } from '../SVGIcon/icons'
import { capitalize, isNum, isEmpty } from '../../../helpers'
import { useRouter } from "next/router"
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
  cart,
  user,
}) => {
  const { user:{uid}, fireSettings } = useUser()
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
        id='t-user'
        minWidth={184}
        flex={1}
        text={<>{address.split(",")[0] || "N/A"}</>}
        mobileHide={false}
      />
      <TableCell
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
      />
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
      <TableCell id='t-totalItemsSold' flex={1} text={`${cart?.totalItemsSold||`0`}`} mobileHide={true} />
      <TableCell id='t-end' flex={1} text={capitalize(progress)} mobileHide={false} />




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
const Orders = () => {
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



  const fireCollectionsTotal = useFirestoreQuery(
    user?.uid && query && firebase.firestore().collection("users").doc(router.query.id).collection('Totals').doc('history')
  )
  const collectionTotal = isNum(fireCollectionsTotal.data?.total) 
  const fireCollections = useFirestoreQuery(query)



  useEffect(() => {

    user?.uid &&
      setRef(
        firebase
          .firestore()
          .collection("users")
          .doc(router.query.id)
          .collection('Orders')
          .where('settled', '==', true)
      )

    //Driver


    setLastID(null)
    setFirstID(null)
    setPage(1)
    setDisableNext(true)
    setDisablePrev(true)
    //setCollectionTotal(0)
    setMaxPage(1)
    setReverse(false)
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

  }, [user?.uid, router?.query?.filter])

  useEffect(() => {

    if (collectionTotal > 0) {
      setMaxPage(Math.ceil(collectionTotal / limit))
    } else {
      setMaxPage(0)
    }
  }, [collectionTotal, limit, router?.query?.filter])

  useEffect(() => {
    if (page === maxPage) {
      setDisableNext(true)
    } else {
      setDisableNext(false)
    }
  }, [page, maxPage, router?.query?.filter])

  useEffect(() => {
    setDisablePrev(!Boolean(page > 1))
  }, [page, router?.query?.filter])

  useEffect(() => {
    ref && setQuery(ref.orderBy("id", "asc").limit(limit))
  }, [ref])

  const nextPage = useCallback(() => {
    setReverse(false)
    setQuery(ref.orderBy("id", "asc").startAfter(lastID).limit(limit))
    setPage((p) => parseInt(p) + 1)
  }, [lastID, limit, router?.query?.filter])

  const prevPage = useCallback(() => {
    setReverse(true)
    setQuery(ref.orderBy("id", "desc").startAfter(firstID).limit(limit))
    setPage((p) => parseInt(p) - 1)
  }, [firstID, limit, router?.query?.filter])


  const handleCreateClick = () => {
    setNavLoading(true)
  }





  return (
    <>
      {/* OUTLET */}
      <TableOutlet >
        <>
          {/* <div className='user-card-header'>
            <div id='user-search-bar'>
                <div className='simple-action-bar'>
                  {['manager', 'admin', 'dispatcher'].includes(`${fireUser?.data?.role}`) && <Link
                    // href={"/[adminID]/users/create"}
                    // as={`/${user?.uid}/users/create`}
                    href={"/[adminID]/create-order/menu"}
                    as={`/${user?.uid}/create-order/menu`}
                    scroll={false}>
                    <button
                      onClick={() => setNavLoading(true)}
                      className='mat-focus-indicator mat-raised-button mat-button-base mat-primary'
                      color='primary'
                      data-test-id='add-user-button'>
                      <span className='mat-button-wrapper'> Create order </span>
                    </button>
                  </Link>}
                </div>

            </div>
          </div> */}

          <TableHeader>
            {/* <div
                style={{
                  display: "flex",
                  flex: "wrap",
                  width: "100%",
                  padding: "8px",
                  flexWrap: "wrap",
                  flexDirection: "row-reverse",
                }}
              >
                <div style={{ margin: "8px" }}>
                  <Link 
                    href={"/[adminID]/create-order/menu"}
                    as={`/${user?.uid}/create-order/menu`}
                  >
                    <Button
                      onClick={handleCreateClick}
                      loading={loading}
                      disabled={loading}
                      text={`New Order`}
                      style={{
                        height: 54,
                        //width: 10,
                        //margin: "12px 0",
                        // padding: "0 12px",
                        fontSize: "16px",
                        fontWeight: "400",
                      }}
                    />
                  </Link>
                </div>
                <div style={{ flex: 2, margin: "8px", minWidth: "180px" }}>
                </div>
              </div> */}
            </TableHeader>

            {fireCollections?.status === "success" && Boolean(fireCollections?.data.length > 0) && (
      
          <>
            <TableContent>
              {/* HEADER */}
              <HeaderRow>
                <HeaderCell id='h-type' maxWidth={90} mobileHide={true} />
                <HeaderCell
                  id='h-title'
                  minWidth={184}
                  flex={1}
                  text={"Address"}
                  mobileHide={false}
                />
                <HeaderCell id='start' flex={1} text={"Due by"} mobileHide={true} />
                <HeaderCell id='amount' flex={2} text={"User"} mobileHide={true} />
                <HeaderCell id='items' flex={1} text={"Sold"} mobileHide={true} />
                <HeaderCell id='end' flex={1} text={"Status"} mobileHide={false} />
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
            {((!searchValue && fireCollections.status === "success" && fireCollections.data?.length !== 0) ||
              (!loading && searchValue?.length > 13 && fireCollections.data?.length > 0)) && (
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
            <div className='table-spinner-container'>
              <Spinner />
            </div>
          )}

          {/* NO DATA */}
          {((fireCollections.status === "success" &&
            fireCollections.data?.length === 0 &&
            (searchValue || "").length === 0) ||
            (!loading && searchValue?.length > 13 && fireCollections.data?.length === 0)) && (
            <div className='table-spinner-container'>
              <div className='noResult'>No Results</div>
            </div>
          )}
        </>
      </TableOutlet>
    </>
  )
}

export default Orders

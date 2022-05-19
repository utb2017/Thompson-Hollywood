import { useState, useEffect, useCallback, useMemo } from "react"
import { useFirestoreQuery } from "../../hooks/useFirestoreQuery"
import firebase from "../../firebase/clientApp"
import { useUser } from "../../context/userContext"
import { useUsers } from "../../context/usersContext"
import Link from "next/link"
import { colors } from "../../styles"
import Spinner from "../../components/Buttons/Spinner"
import Button from "../../components/Buttons/ButtonTS"
import { useRouting } from "../../context/routingContext"
import { useRouter } from "next/router"
import {
  TableCell,
  HeaderCell,
  TableRow,
  HeaderRow,
  TableOutlet,
  TableHeader,
  TableContent,
} from "../../components/Table"
import { capitalize, isNum } from "../../helpers"

const DiscountsRow = ({
  active = false,
  code = "N/A",
  id = "N/A",
  rate = "N/A",
  dateStart,
  dateEnd,
  timeStart = { label: "N/A", value: "N/A" },
  timeEnd = { label: "N/A", value: "N/A" },
  title = "N/A",
  type = { label: "N/A" },
  method = { label: "N/A", value: "N/A" },
  eventDay = { label: "N/A", value: "N/A" },
}) => {

  const router = useRouter()


  const { user } = useUser()
  const typeText =
    method?.value === "event"
      ? eventDay?.label
      : method?.value === "coupon"
      ? code
      : method?.label
  const amount =
    rate && type?.value
      ? `${type.value === "percent" ? '' : "$"}${rate}${type.value === "percent" ? '%' : ""}`
      : "N/A"
      console.log('dateStart')
      console.log(dateStart)
  const start =
    method?.value === "event"
      ? timeStart?.label
      : Boolean(dateStart)
        ? dateStart
        : "No Start"
  const end =
    method.value === "event"
      ? timeEnd.label
      : Boolean(dateEnd)
      ? dateEnd
      : "No End"

  return (
    <TableRow
      key={id}
      as={`/${user?.uid}/discounts/edit/${router.query?.sort||'error'}/${id}`}
      href={`/[adminID]/discounts/edit/[sort]/[id]`}>
      <TableCell
        id='t-active'
        maxWidth={40}
        text={
          <div
            style={{
              height: 10,
              width: 10,
              borderRadius: "100%",
              backgroundColor: active ? colors.GREEN_500 : colors.GRAY_74,
            }}
          />
        }
        mobileHide={false}
      />
      <TableCell id='t-title' width={200} text={title} mobileHide={false} />
      <TableCell id='t-type' maxWidth={80} text={typeText} mobileHide={false} />
      <TableCell id='t-amount' flex={1} text={amount} mobileHide={true} />
      <TableCell id='t-start' flex={2} text={start} mobileHide={true} />
      <TableCell id='t-end' flex={2} text={end} mobileHide={true} />
    </TableRow>
  )
}
const DiscountsList = ({ fireDiscounts }) => {
  const [products, setProducts] = useState([])
  const { setLastID, firstID, setFirstID, reverse } = useUsers()
  useEffect(() => {
    let tempProducts = []
    let tempIDs = []
    if (fireDiscounts?.status === "success" && Boolean(fireDiscounts?.data)) {
      const { data } = fireDiscounts
      for (const key in data) {
        const item = {...data[key]}
        tempIDs.push(item?.id)
        if (item?.dateStart) {
            item.dateStart = item.dateStart.toDate().toJSON().slice(0, 10)
        }
        if (item?.dateEnd) {
            item.dateEnd = item.dateEnd.toDate().toJSON().slice(0, 10)
        }
        tempProducts.push(<DiscountsRow {...item} key={key} />)
      }
      if (reverse) {
        tempProducts.reverse()
        tempIDs.reverse()
      }
    }
    setFirstID(tempIDs[0])
    setLastID(tempIDs.pop())
    setProducts(tempProducts)
  }, [fireDiscounts])
  return products
}
const Discounts = () => {
  const [limit] = useState(5)
  const router = useRouter()
  const { lastID, setLastID, firstID, setFirstID, setReverse } = useUsers()
  const [page, setPage] = useState(1)
  const { user, fireOrders } = useUser()
  const [loading, setLoading] = useState(0)
  //const [collectionTotal, setCollectionTotal] = useState(0)
  const [disableNext, setDisableNext] = useState(true)
  const [disablePrev, setDisablePrev] = useState(true)
  const [maxPage, setMaxPage] = useState(0)
  const [query, setQuery] = useState(null)
  const [ref, setRef] = useState(null)
  const { setNavLoading } = useRouting()

  const fireDiscounts = useFirestoreQuery(query)

  const fireDiscountsTotal = useFirestoreQuery(
    user?.uid && firebase.firestore().collection("totals").doc("discounts")
  )
  const collectionTotal = isNum(fireDiscountsTotal.data?.[router.query.sort]) 



  useEffect(() => {
    user?.uid &&
      setRef(
        firebase
          .firestore()
          .collection("discounts")
          .where("sort", "==", router.query.sort)
      )
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
  }, [user, router?.query?.sort])

  useEffect(() => {
    if (collectionTotal > 0) {
      setMaxPage(Math.ceil(collectionTotal / limit))
    } else {
      setMaxPage(0)
    }
  }, [collectionTotal, limit, router?.query?.sort])

  useEffect(() => {
    if (page === maxPage) {
      setDisableNext(true)
    } else {
      setDisableNext(false)
    }
  }, [page, maxPage, router?.query?.sort])

  useEffect(() => {
    setDisablePrev(!Boolean(page > 1))
  }, [page, router?.query?.sort])

  useEffect(() => {
    ref && setQuery(ref.orderBy("id", "asc").limit(limit))
  }, [ref])

  const nextPage = useCallback(() => {
    setReverse(false)
    setQuery(ref.orderBy("id", "asc").startAfter(lastID).limit(limit))
    setPage((p) => parseInt(p) + 1)
  }, [lastID, limit, router?.query?.sort])

  const prevPage = useCallback(() => {
    setReverse(true)
    setQuery(ref.orderBy("id", "desc").startAfter(firstID).limit(limit))
    setPage((p) => parseInt(p) - 1)
  }, [firstID, limit, router?.query?.sort])


  const handleCreateClick = () => {
    setNavLoading(true)

    //setLoading(true)
    //router.query.sort
  }

  return (
    <>
      {/* OUTLET */}
      <TableOutlet>
        <TableHeader>
          
          {/* <div id='user-search-bar'>
            <div id='fire-card-action-bar'></div>
            <div className='search-bar-actions'>
              <Link
                as={`/${user?.uid}/discounts/create/${router.query.sort}`}
                href={`/[adminID]/discounts/create/[sort]`}
                scroll={false}
                >
                <Button
                  onClick={handleCreateClick}
                  loading={loading}
                  disabled={loading}
                  text={`New ${capitalize(router.query.sort)}`}
                  style={{
                    height: 36,
                    margin: "12px 0",
                    padding: "0 12px",
                    fontSize: "14px",
                    fontWeight: "400",
                  }}
                />
              </Link>
            </div>
          </div>
         */}

        <div
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
                as={`/${user?.uid}/discounts/create/${router.query.sort}`}
                href={`/[adminID]/discounts/create/[sort]`}
                scroll={false}
              >
                <Button
                  onClick={handleCreateClick}
                  loading={loading}
                  disabled={loading}
                  text={`New Discount`}
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
            {/* <div style={{ flex: 2, margin: "8px", minWidth: "180px" }}>
            </div> */}
          </div>

        
        
        </TableHeader>
        {fireDiscounts?.status === "success" && Boolean(fireDiscounts?.data.length > 0) && (
          <>
            {/**/}
            <TableContent>
              <HeaderRow>


                <HeaderCell
                  id='h-type'
                  maxWidth={40}
                  text={""}
                  mobileHide={false}
                />                
                <HeaderCell
                  id='h-title'
                  width={200}
                  text={"Discount Title"}
                  mobileHide={false}
                />
                 <HeaderCell
                  id='h-type'
                  maxWidth={80}
                  text={"Code"}
                  mobileHide={false}
                />               
                <HeaderCell
                  id='amount'
                  flex={1}
                  text={"Amount"}
                  mobileHide={true}
                />
                <HeaderCell
                  id='start'
                  flex={2}
                  text={"Start"}
                  mobileHide={true}
                />
                <HeaderCell id='end' flex={2} text={"End"} mobileHide={true} />
              </HeaderRow>
              {/**/}
              <DiscountsList {...{ fireDiscounts }} />
              {/**/}
              {/**/}
            </TableContent>
            {fireDiscounts?.status === "success" &&
              fireDiscounts.data.length > 0 && (
                <div className='card-actions'>
                  {/**/}
                  {/**/}
                  {/**/}
                  <div className='user-paginator'>
                    <div id='mat-paginator' className='mat-paginator'>
                      <div className='mat-paginator-outer-container'>
                        <div className='mat-paginator-container'>
                          {/**/}
                          <div className='mat-paginator-page-size '></div>
                          <div className='mat-paginator-range-actions'>
                            <div className='mat-paginator-range-label'>
                              {` ${page * limit - limit + 1 || page} - ${
                                page * limit < collectionTotal
                                  ? page * limit
                                  : collectionTotal
                              } of ${collectionTotal} `}
                            </div>
                            {/* mat-button-disabled */}
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
                            {/**/}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/**/}
                  {/**/}
                </div>
              )}
          </>
        )}
        {fireDiscounts?.status === "loading" && (
          <div className='table-spinner-container'>
            <Spinner />
          </div>
        )}
        {fireDiscounts?.status === "success" && fireDiscounts?.data?.length === 0 && (
          <div style={{padding:32}} className='table-spinner-container'>
            <div className='noResult'>No Results</div>
          </div>
        )}
        {fireDiscounts?.status === "error" && fireDiscounts.error && (
          <div style={{padding:32}} className='table-spinner-container'>
            <br/><h2 >Error</h2><br/>
            <p style={{overflowWrap:'anywhere'}}>{`${fireDiscounts.error}`}</p>
          </div>
        )}
      </TableOutlet>
    </>
  )
}

export default Discounts

import {useState, useEffect, useCallback, createRef, useMemo, useRef} from 'react'
import {useFirestoreQuery} from '../../../hooks/useFirestoreQuery'
import firebase, {deleteBlacklisting} from '../../../firebase/clientApp'
import {useUser} from '../../../context/userContext'
import {useUsers} from '../../../context/usersContext'
import {colors} from '../../../styles'
import Spinner from '../../Buttons/Spinner'
import {useRouting} from '../../../context/routingContext'
import {TableCell, HeaderCell, TableRow, HeaderRow, TableOutlet, TableHeader, TableContent, TableRowNoLink} from '../../Table'
import { useRouter } from "next/router"
import { capitalize, isNum } from "../../../helpers"
import SVGIcon from '../../../components/SVGIcon'

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
  userID
}) => {
  const {setNavLoading} = useRouting()

  const router = useRouter()


  const { user } = useUser()

  const _deleteBlackist = useCallback(() => {
    setNavLoading(true)
    try{
      deleteBlacklisting({discountID:id, userID:userID})
      
    }catch(e){
      alert(e?.message || e || 'Error deleting credit' )
    }finally{  
      setNavLoading(false)
    }
    

  }, [userID, id])





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
    <TableRowNoLink
      key={id}
      // as={`/${user?.uid}/discounts/edit/${router.query?.sort||'error'}/${id}`}
      // href={`/[adminID]/discounts/edit/[sort]/[id]`}
      >
      <TableCell
        id='t-active'
        maxWidth={40}
        text={
          <div
            style={{
              height: 10,
              width: 10,
              borderRadius: "100%",
              backgroundColor: 'rgb(212, 54, 132)',
            }}
          />
        }
        mobileHide={false}
      />
      <TableCell id='t-title' width={200} text={title} mobileHide={false} />
      <TableCell id='t-type' maxWidth={80} text={typeText} mobileHide={false} />
      <TableCell id='t-amount' flex={1} text={amount} mobileHide={true} />
      <TableCell id='t-start' flex={1} text={start} mobileHide={true} />
      {/* <TableCell id='t-end' flex={2} text={end} mobileHide={true} />      */}
      <TableCell
        id='t-active'
        maxWidth={80}
        text={
          <button disabled={Boolean(amount <= 0)} className="button-base" onClick={()=>_deleteBlackist({creditID:id, userID:userID})}>
            <SVGIcon name='delete' color={Boolean(amount <= 0)?colors.GRAY_74:'rgb(212, 54, 132)'} />
          </button>
          
        }
        mobileHide={false}
      />
    </TableRowNoLink>
  )
}
const DiscountsList = ({fireUserDiscounts, fireCustomer}) => {
  const [products, setProducts] = useState([])
  const {setLastID, firstID, setFirstID, reverse} = useUsers()

  useEffect(() => {
    let tempProducts = []
    let tempIDs = []

    if (fireUserDiscounts?.status === 'success' && Boolean(fireUserDiscounts?.data)) {
      const {data, status} = fireUserDiscounts
      for (const key in data) {
        //const product = data[key]
        console.log('data')
        console.log('data')
        console.log(data[key])
        const item = {...data[key]}
        tempIDs.push(item?.id)
        if (item?.dateStart) {
            item.dateStart = item.dateStart.toDate().toJSON().slice(0, 10)
        }
        if (item?.dateEnd) {
            item.dateEnd = item.dateEnd.toDate().toJSON().slice(0, 10)
        }
        item.userID = fireCustomer.data.uid
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
  }, [fireUserDiscounts])
  return products
}

const UserOrders = ({fireCustomer}) => {
  const [limit] = useState(5)
  const { lastID, setLastID, firstID, setFirstID, setReverse } = useUsers()
  const [page, setPage] = useState(1)
  const {user, fireOrders, fireCartTotals} = useUser()
  //const [collectionTotal, setCollectionTotal] = useState(0)
  const [disableNext, setDisableNext] = useState(true)
  const [disablePrev, setDisablePrev] = useState(true)
  const [maxPage, setMaxPage] = useState(0)
  const [query, setQuery] = useState(null)
  const [queryTotal, setQueryTotal] = useState(null)
  const [ref, setRef] = useState(null)
  const [refTotal, setRefTotal] = useState(null)
  const {setNavLoading} = useRouting()
  const router = useRouter()

  // useMemo(() => {
  //   if (fireCustomer?.data?.uid) {
  //     setRef(firebase.firestore().collection('users').doc(`${fireCustomer?.data?.uid||''}`).collection('Blacklist'))
  //     setRefTotal(firebase.firestore().collection('users').doc(`${fireCustomer?.data?.uid||''}`).collection('Totals'))
  //   }
  // }, [fireCustomer])

  const fireUserDiscounts = useFirestoreQuery(query)

  const fireDiscountsTotal = useFirestoreQuery(
    user?.uid && fireCustomer?.data?.uid && firebase.firestore().collection('users').doc(`${fireCustomer?.data?.uid||''}`).collection("Totals").doc("blacklist")
  )
  const collectionTotal = isNum(fireDiscountsTotal.data?.['total']) 


    // useEffect(() => {
    //   alert(JSON.stringify(fireDiscountsTotal))
    // }, [fireDiscountsTotal]);


  useEffect(() => {
    user?.uid && 
    fireCustomer?.data?.uid &&
      setRef(
        firebase
          .firestore()
          .collection('users')
          .doc(`${fireCustomer?.data?.uid||''}`)
          .collection("Blacklist")
          //.where("sort", "==", router.query.sort)
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
  }, [user, router, fireCustomer])

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
        {/* <TableHeader>

        </TableHeader> */}
        {fireUserDiscounts?.status === 'success' && Boolean(fireUserDiscounts?.data.length > 0) && (
          <div >
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
                  width={160}
                  text={"Discount Title"}
                  mobileHide={false}
                />
                <HeaderCell
                  id='h-type'
                  //maxWidth={80}
                  flex={1}
                  text={"Amount"}
                  mobileHide={true}
                />
                <HeaderCell
                  id='amount'
                  flex={1}
                  text={"Remaining"}
                  mobileHide={false}
                />
                <HeaderCell
                  id='start'
                  flex={1}
                  text={"Date"}
                  mobileHide={true}
                />
                <HeaderCell id='end' flex={1} text={"Time"} mobileHide={true} /> 
                <HeaderCell
                  id='h-delete'
                  maxWidth={80}
                  text={""}
                  mobileHide={false}
                />
              </HeaderRow>
              {/**/}
              <DiscountsList {...{ fireUserDiscounts, fireCustomer }} />
              {/**/}
              {/**/}
            </TableContent>
            {fireUserDiscounts?.status === 'success' && fireUserDiscounts.data.length > 0 && (
              <div className='card-actions'>
                <div className='user-paginator'>
                  <div id='mat-paginator' className='mat-paginator'>
                    <div className='mat-paginator-outer-container'>
                      <div className='mat-paginator-container'>
                        {/**/}
                        <div className='mat-paginator-page-size '></div>
                        <div className='mat-paginator-range-actions'>
                          <div className='mat-paginator-range-label'>
                            {` ${page * limit - limit + 1 || page} - ${page * limit < collectionTotal ? page * limit : collectionTotal
                              } of ${collectionTotal} `}
                          </div>
                          {/* mat-button-disabled */}
                          <button
                            style={{ backgroundColor: 'unset' }}
                            onClick={prevPage}
                            className='mat-paginator-navigation-previous mat-focus-indicator mat-tooltip-trigger mat-icon-button mat-button-base'
                            type='button'
                            aria-label='Previous page'
                            disabled={disablePrev}>
                            <span className='mat-button-wrapper'>
                              <svg className='mat-paginator-icon' focusable='false' viewBox='0 0 24 24'>
                                <path d='M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z' />
                              </svg>
                            </span>
                          </button>
                          <button
                            style={{ backgroundColor: 'unset' }}
                            onClick={nextPage}
                            className='mat-paginator-navigation-next mat-focus-indicator mat-tooltip-trigger mat-icon-button mat-button-base'
                            type='button'
                            aria-label='Next page'
                            disabled={disableNext}>
                            <span className='mat-button-wrapper'>
                              <svg className='mat-paginator-icon' focusable='false' viewBox='0 0 24 24'>
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

          </div>
        )}
        {fireUserDiscounts?.status !== 'success' && (
          <div className='table-spinner-container'>
            <Spinner />
          </div>
        )}
        {fireUserDiscounts?.status === 'success' && fireUserDiscounts?.data?.length === 0 && (
          <div className='table-spinner-container'>
            <div className='noResult'>No Discounts Blocked</div>
          </div>
        )}

          
      </TableOutlet>
    </>
  )
}

export default UserOrders

import { useState, useEffect, useCallback } from 'react'
import { useFirestoreQuery } from '../../../hooks/useFirestoreQuery'
import firebase, { deleteCredit } from '../../../firebase/clientApp'
import { useUser } from '../../../context/userContext'
import { useUsers } from '../../../context/usersContext'
import { colors } from '../../../styles'
import Spinner from '../../Buttons/Spinner'
import { useRouting } from '../../../context/routingContext'
import { TableCell, HeaderCell, TableRowNoLink, HeaderRow, TableOutlet, TableHeader, TableContent } from '../../Table'
import { useRouter } from "next/router"
import { useDispatchModal } from "../../../context/modalContext"
//import Link from "next/link"
import { isCurr, isNum } from "../../../helpers"
import {
  AddUserCredit
} from "../../../components/Modals"
//import { fromCents } from '../../../helpers/typeScriptHelpers'
import SVGIcon from '../../SVGIcon'
import Button from "../../../components/Buttons/Button"


const DiscountsRow = ({
  used = false,
  //active = false,
  //code = "N/A",
  id = null,
  //rate = "N/A",
  //dateStart,
  //dateEnd,
  //timeStart = { label: "N/A", value: "N/A" },
  //timeEnd = { label: "N/A", value: "N/A" },
  title = "N/A",
  //type = { label: "N/A" },
  //method = { label: "N/A", value: "N/A" },
  //eventDay = { label: "N/A", value: "N/A" },
  amount = null,
  initialAmount = null,
  created = null,
  userID
}) => {

  const router = useRouter()
  const { user } = useUser()
  const typeText = 'Credit'
  const date = created.toDate().toDateString()
  const time = created.toDate().toLocaleTimeString('en-US')
  
  const { setNavLoading } = useRouting()

  const _deleteCredit = useCallback(() => {
    setNavLoading(true)
    try{
      deleteCredit({creditID:id, userID:userID})
      
    }catch(e){
      alert(e?.message || e || 'Error deleting credit' )
    }finally{  
      setNavLoading(false)
    }
    

  }, [userID, id])

  return (
    <TableRowNoLink key={id}>
      <TableCell
        id='t-active'
        maxWidth={40}
        text={
          <div
            style={{
              height: 10,
              width: 10,
              borderRadius: "100%",
              backgroundColor: !used ? colors.GREEN_500 : colors.GRAY_74,
            }}
          />
        }
        mobileHide={false}
      />
      <TableCell id='t-title' width={160} text={title} mobileHide={false} />
      <TableCell id='t-type'  flex={1} text={initialAmount ? isCurr(initialAmount) : 'error'} mobileHide={false} />
      <TableCell id='t-amount' flex={1} text={isCurr(amount)} mobileHide={true} />
      <TableCell id='t-start' flex={1} text={date} mobileHide={true} />
      <TableCell id='t-end' flex={1} text={time} mobileHide={true} />     
      <TableCell
        id='t-active'
        maxWidth={80}
        text={
          <button disabled={Boolean(amount <= 0)} className="button-base" onClick={()=>_deleteCredit({creditID:id, userID:userID})}>
            <SVGIcon name='delete' color={Boolean(amount <= 0)?colors.GRAY_74:'rgb(212, 54, 132)'} />
          </button>
          
        }
        mobileHide={false}
      />
    </TableRowNoLink>
  )
}

const DiscountsList = ({ fireUserDiscounts, fireCustomer }) => {
  const [products, setProducts] = useState([])
  const { setLastID, setFirstID, reverse } = useUsers()

  useEffect(() => {
    let tempProducts = []
    let tempIDs = []

    if (fireUserDiscounts?.status === 'success' && Boolean(fireUserDiscounts?.data)) {
      const { data, status } = fireUserDiscounts
      for (const key in data) {
        //const product = data[key]
        const item = { ...data[key] }
        tempIDs.push(item?.created)
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

const UserOrders = ({ fireCustomer }) => {
  const router = useRouter()
  const [limit] = useState(5)
  //const { lastID, firstID, setReverse } = useUsers()
  const [page, setPage] = useState(1)
  const { lastID, setLastID, firstID, setFirstID, setReverse } = useUsers()
  const { user, fireTotals, fireUser, fireTotalsUnsettled } = useUser()
  //const [collectionTotal, setCollectionTotal] = useState(0)
  const [disableNext, setDisableNext] = useState(true)
  const [disablePrev, setDisablePrev] = useState(true)
  const [maxPage, setMaxPage] = useState(0)
  const [query, setQuery] = useState(null)
  const [queryTotal, setQueryTotal] = useState(null)
  const [ref, setRef] = useState(null)
  const [refTotal, setRefTotal] = useState(null)
  const { setNavLoading } = useRouting()
  const { modalDispatch, modalState } = useDispatchModal();
  const [loading, setLoading] = useState(false)

  // useEffect(() => {
  //  alert(`mmodal state = ${JSON.stringify(modalState)}`)
  // }, [modalState]);

  // useEffect(() => {
  //   if (fireCustomer?.data?.uid) {
  //     setRef(firebase.firestore().collection('users').doc(`${fireCustomer?.data?.uid || ''}`).collection('Credits'))
  //     setRefTotal(firebase.firestore().collection('users').doc(`${fireCustomer?.data?.uid || ''}`).collection('Totals'))
  //   }
  // }, [fireCustomer])

  // useEffect(() => {
  //   if (collectionTotal > 0) {
  //     setMaxPage(Math.ceil(collectionTotal / limit))
  //   } else {
  //     setMaxPage(0)
  //   }
  // }, [collectionTotal, limit])

  // useEffect(() => {
  //   if (page === maxPage) {
  //     setDisableNext(true)
  //   } else {
  //     setDisableNext(false)
  //   }
  // }, [page, maxPage])

  // useEffect(() => {
  //   setDisablePrev(!Boolean(page > 1))
  // }, [page])

  // useEffect(() => {
  //   (ref && fireCustomer?.data?.id) && setQuery(ref.orderBy('created', 'desc').limit(limit))
  // }, [ref, fireCustomer])

  // useEffect(() => {
  //   (refTotal && fireCustomer?.data?.id) && setQueryTotal(refTotal.doc('cart'))
  // }, [refTotal, fireCustomer])

  // const nextPage = useCallback(() => {
  //   setReverse(false)
  //   setQuery(ref.orderBy('created', 'desc').startAfter(lastID).limit(limit))
  //   setPage((p) => parseInt(p) + 1)
  // }, [lastID, limit])

  // const prevPage = useCallback(() => {
  //   setReverse(true)
  //   setQuery(ref.orderBy('created', 'asc').startAfter(firstID).limit(limit))
  //   setPage((p) => parseInt(p) - 1)
  // }, [firstID, limit])


  // const fireUserDiscounts = useFirestoreQuery(query)
  // const fireCustomerCartTotal = useFirestoreQuery(queryTotal)


  // // firebase.firestore().collection('users').doc(`${fireCustomer?.data?.uid||''}`).collection('Totals')
  // useEffect(() => {
  //   if (fireCustomerCartTotal?.data && fireCustomerCartTotal?.data?.creditTotal) {
  //     setCollectionTotal(fireCustomerCartTotal.data.creditTotal)
  //   } else {
  //     setCollectionTotal(0)
  //   }
  //   setNavLoading(fireCustomerCartTotal?.data?.loading)
  // }, [fireCustomerCartTotal])

  // useEffect(() => {
  //   return () => {
  //     setReverse(false)
  //   };
  // }, []);



  
  const fireCollectionsTotal = useFirestoreQuery(
    user?.uid && query && firebase.firestore().collection("users").doc(router.query.id).collection('Totals').doc('cart')
  )
  const collectionTotal = isNum(fireCollectionsTotal.data?.creditTotal) 
  const fireUserDiscounts = useFirestoreQuery(query)



  useEffect(() => {

    user?.uid &&
    router?.query?.id &&
      setRef(
        firebase
          .firestore()
          .collection("users")
          .doc(router.query.id)
          .collection('Credits')
          //.where('settled', '==', true)
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
    ref && setQuery(ref.orderBy("created", "desc").limit(limit))
  }, [ref])

  const nextPage = useCallback(() => {
    setReverse(false)
    setQuery(ref.orderBy("created", "desc").startAfter(lastID).limit(limit))
    setPage((p) => parseInt(p) + 1)
  }, [lastID, limit, router?.query?.filter])

  const prevPage = useCallback(() => {
    setReverse(true)
    setQuery(ref.orderBy("created", "asc").startAfter(firstID).limit(limit))
    setPage((p) => parseInt(p) - 1)
  }, [firstID, limit, router?.query?.filter])


  const handleCreateClick = () => {
    setNavLoading(true)
  }





  useEffect(() => {
    setNavLoading(false)
  }, [])

  const openModal = (component) => {
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
  const addCredit = () => {
    const component = () => <AddUserCredit {...{ fireCustomer }} />
    openModal(component)
  }


  return (
    <>
      {/* OUTLET */}
      <TableOutlet>
        <TableHeader>
          <div id='user-search-bar'>
            <div className='simple-action-bar'>
              {['manager', 'admin', 'dispatcher'].includes(`${fireUser?.data?.role}`) &&
                // <Link
                //   // href={"/[adminID]/users/create"}
                //   // as={`/${user?.uid}/users/create`}
                //   href={"/[adminID]/create-order/menu"}
                //   as={`/${user?.uid}/create-order/menu`}
                //   scroll={false}>
                // <button
                //   onClick={() => addCredit()}
                //   className='mat-focus-indicator mat-raised-button mat-button-base mat-primary'
                // >
                //   <span className='mat-button-wrapper'> Add Credit </span>
                // </button>
                // </Link>
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
                  {/* <Link                 
                    as={`/${user?.uid}/discounts/create/${router.query.sort}`}
                    href={`/[adminID]/discounts/create/[sort]`}
                    scroll={false}
                  > */}
                    <Button
                      onClick={addCredit}
                      loading={loading}
                      disabled={loading}
                      text={`Add Credit`}
                      style={{
                        height: 54,
                        //width: 10,
                        //margin: "12px 0",
                        // padding: "0 12px",
                        fontSize: "16px",
                        fontWeight: "400",
                      }}
                    />
                  {/* </Link> */}
                </div>
              </div>
              }
              {/**/}
            </div>

          </div>
        </TableHeader>
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
            <div className='noResult'>No Credits</div>
          </div>
        )}


      </TableOutlet>
    </>
  )
}

export default UserOrders

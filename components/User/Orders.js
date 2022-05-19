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
import {TableCell, HeaderCell, TableRow, HeaderRow, TableOutlet, TableHeader, TableContent} from '../../components/Table'
//import { fire } from '../SVGIcon/icons'
import { capitalize } from '../../helpers'

const DiscountsRow = ({
  progress = "N/A",
  address = "N/A",
  start ="N/A",
  id,
  photoURL = "https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2Fplaceholder-images-image_large.png?alt=media&token=9dcb7b69-aee4-43ad-9a16-f984510b9703",
  phoneNumber = "N/A",
  displayName = "N/A",
  grandTotal= "N/A",
}) => {
  const {user} = useUser()
  // const typeText = method?.value === 'event' ? eventDay?.label : method?.value === 'coupon' ? code : method?.label
  // const amount = rate && type?.value ? `${type.value === 'percent' ? '%' : '$'}${rate}` : 'N/A'
  // const start = method?.value === 'event' ? timeStart?.label : dateStart
  // const end = method.value === 'event' ? timeEnd.label : dateEnd || 'No End'
  return (
    <TableRow
      key={id}
      as={`/${user?.uid}/orders/selected/${id}`}
      href={`/[adminID]/orders/selected/[oid]`}>
      {/* <TableCell
        id='t-active'
        maxWidth={40}
        text={
          <div
            style={{
              height: 10,
              width: 10,
              borderRadius: '100%',
              backgroundColor: active ? colors.GREEN_500 : colors.GRAY_74,
            }}
          />
        }
        mobileHide={false}
      /> */}
      <TableCell id='t-photoURL'  maxWidth={20} mobileHide={true} />
      <TableCell id='t-address' width={200} text={address} mobileHide={false} />
      <TableCell id='t-start' flex={1} text={start.toDate().toJSON().slice(0, 10)} mobileHide={true} />
      <TableCell id='t-start' flex={1} text={capitalize(progress)} mobileHide={false} />
      <TableCell id='t-end' flex={1} text={
                    Boolean(grandTotal)
                      ? grandTotal.toLocaleString(
                          "en-US",
                          {
                            style: "currency",
                            currency: "USD",
                          }
                        )
                      : "--"
                  } mobileHide={true} />
    </TableRow>
  )
}
const DiscountsList = ({fireUserOrders}) => {
  const [products, setProducts] = useState([])
  const {setLastID, firstID, setFirstID, reverse} = useUsers()

  useEffect(() => {
    let tempProducts = []
    let tempIDs = []

    if (fireUserOrders?.status === 'success' && Boolean(fireUserOrders?.data)) {
      const {data, status} = fireUserOrders
      for (const key in data) {
        //const product = data[key]
        console.log('data')
        console.log('data')
        console.log(data)
        const {
          progress,
          address,
          start,
          id,
          photoURL,
          phoneNumber,
          displayName,
          cart:{grandTotal},
        } = data[key]
        tempIDs.push(id)

        tempProducts.push(
          <DiscountsRow
            {...{
              progress,
              address,
              start,
              id,
              photoURL,
              phoneNumber,
              displayName,
              grandTotal
            }}
            key={key}
          />
        )
      }
      if (reverse) {
        tempProducts.reverse()
        tempIDs.reverse()
      }
    }
    setFirstID(tempIDs[0])
    setLastID(tempIDs.pop())
    setProducts(tempProducts)
  }, [fireUserOrders])
  return products
}

const UserOrders = ({fireCustomer}) => {
  const [limit] = useState(5)
  const {lastID, setLastID, firstID, setFirstID, setReverse} = useUsers()
  const [page, setPage] = useState(1)
  const {user, fireOrders} = useUser()
  const [loading, setLoading] = useState(0)
  const [collectionTotal, setCollectionTotal] = useState(0)
  const [disableNext, setDisableNext] = useState(true)
  const [disablePrev, setDisablePrev] = useState(true)
  const [maxPage, setMaxPage] = useState(0)
  const [query, setQuery] = useState(null)
  const [ref, setRef] = useState(null)
  const {setNavLoading} = useRouting()

  useMemo(() => {
    if (user?.uid) {
      setRef(firebase.firestore().collection('orders'))
    }
  }, [user])
  useEffect(() => {
    if (collectionTotal > 0) {
      setMaxPage(Math.ceil(collectionTotal / limit))
    } else {
      setMaxPage(0)
    }
  }, [collectionTotal, limit])
  useEffect(() => {
    if (page === maxPage) {
      setDisableNext(true)
    } else {
      setDisableNext(false)
    }
  }, [page, maxPage])
  useEffect(() => {
    setDisablePrev(!Boolean(page > 1))
  }, [page])
  useEffect(() => {
    (ref && fireCustomer?.data?.id) && setQuery(ref.where('user', '==', fireCustomer.data.id).orderBy('id', 'asc').limit(limit))
  }, [ref, fireCustomer])
  const nextPage = useCallback(() => {
    setReverse(false)
    setQuery(ref.where('user', '==', fireCustomer.data.id).orderBy('id', 'asc').startAfter(lastID).limit(limit))
    setPage((p) => parseInt(p) + 1)
  }, [lastID, limit])
  const prevPage = useCallback(() => {
    setReverse(true)
    setQuery(ref.where('user', '==', fireCustomer.data.id).orderBy('id', 'desc').startAfter(firstID).limit(limit))
    setPage((p) => parseInt(p) - 1)
  }, [firstID, limit])
  const fireUserOrders = useFirestoreQuery(query)

  useEffect(() => {
console.log('fireUserOrders')
console.log(fireUserOrders)

console.log('fireCustomer.data.id')
console.log(fireCustomer?.data?.id)



  }, [fireUserOrders, fireCustomer]);

  //const unFilteredFireTotal = useFirestoreQuery(user?.uid && firebase.firestore().collection('shortcuts').doc('totals'))

  useEffect(() => {
    if (fireCustomer?.status === 'success' && fireCustomer?.data) {
      const {data} = fireCustomer
      const total = data?.orders
      setCollectionTotal(total)
    } else {
      setCollectionTotal(0)
    }
  }, [fireCustomer])

  useEffect(() => {
    setNavLoading(false)
  }, [])

  const handleCreateClick = () => {
    setNavLoading(true)
    setLoading(true)
  }

  return (
    <>
      {/* OUTLET */}
      <TableOutlet>
        {/* <TableHeader>

        </TableHeader> */}
          {fireOrders?.status === 'success' && Boolean(fireOrders?.data) && (
            <div >
              {/**/}
              <TableContent>
                    <HeaderRow>
                      {/* <HeaderCell id='h-type' maxWidth={40} text={''} mobileHide={false} /> */}
                      <HeaderCell id='h-type' maxWidth={20} mobileHide={true} />
                      <HeaderCell id='h-title' width={200} text={'Address'} mobileHide={false} />
                      <HeaderCell id='amount' flex={1} text={'Date'} mobileHide={true} />
                      <HeaderCell id='start' flex={1} text={'Status'} mobileHide={false} />
                      <HeaderCell id='end' flex={1} text={'Amount'} mobileHide={true} />
                    </HeaderRow>
                    {/**/}
                    <DiscountsList {...{fireUserOrders}} />
                    {/**/}
                    {/**/}
              </TableContent>
              {fireUserOrders?.status === 'success' && fireUserOrders.data.length > 0 && (
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
                            {/* mat-button-disabled */}
                            <button
                              style={{backgroundColor: 'unset'}}
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
                              style={{backgroundColor: 'unset'}}
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
          {fireUserOrders?.status !== 'success' && (
            <div className='table-spinner-container'>
                <Spinner />
            </div>
          )}
          {fireUserOrders?.status === 'success' && fireUserOrders?.data?.length === 0 && (
            <div className='table-spinner-container'>
              <div className='noResult'>No Orders</div>
            </div>
          )}

          
      </TableOutlet>
    </>
  )
}

export default UserOrders

import { useState, useEffect, useCallback, useMemo } from "react"
import { useFirestoreQuery } from "../../hooks/useFirestoreQuery"
import firebase from "../../firebase/clientApp"
import { useUser } from "../../context/userContext"
import { useUsers } from "../../context/usersContext"
import Link from "next/link"
import { colors } from "../../styles"
import Spinner from "../../components/Buttons/Spinner"
import Button from "../../components/Buttons/Button"
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
import { capitalize, isCurr, isNum } from "../../helpers"

const DiscountsRow = ({
    active=false,
    title='',
    description='',
    brandsTotal=0,
    total=0,
    onSale=false,
    saleRate=false,
    menuOrder=0,
    featured=false,
    sales=0,
    sold=0,
    id=null
}) => {

  const router = useRouter()


  const { user } = useUser()


  return (
    <TableRow
      //key={id}
      as={`/${user?.uid}/menu/edit/${router.query?.sort||'error'}/${id}`}
      href={`/[adminID]/menu/edit/[sort]/[id]`}>
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
      <TableCell id='t-title'flex={2} text={`${title}`} mobileHide={false} />
      <TableCell id='t-type' flex={1} text={`${total}`} mobileHide={false} />
      <TableCell id='t-amount' flex={1} text={`${sold}`} mobileHide={false} />
      <TableCell id='t-sales' flex={1} text={`${isCurr(sales)}`} mobileHide={true} />
    </TableRow>
  )
}
const DiscountsList = ({ fireCollections }) => {
  const [products, setProducts] = useState([])
  const { setLastID, firstID, setFirstID, reverse } = useUsers()
  useEffect(() => {
    let tempProducts = []
    let tempIDs = []
    if (fireCollections?.status === "success" && Boolean(fireCollections?.data)) {
      const { data } = fireCollections
      for (const key in data) {
        const item = {...data[key]}
        console.log('item')
        console.log(item?.menuOrder)
        tempIDs.push(item?.menuOrder)
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
  }, [fireCollections])
  return products
}
const Collections = () => {
  const [limit] = useState(5)
  const router = useRouter()
  const { lastID, setLastID, firstID, setFirstID, setReverse } = useUsers()
  const [page, setPage] = useState(1)
  const { user, fireOrders } = useUser()
  const [loading, setLoading] = useState(false)
  //const [collectionTotal, setCollectionTotal] = useState(0)
  const [disableNext, setDisableNext] = useState(true)
  const [disablePrev, setDisablePrev] = useState(true)
  const [maxPage, setMaxPage] = useState(0)
  const [query, setQuery] = useState(null)
  const [ref, setRef] = useState(null)
  const { setNavLoading } = useRouting()

  const fireCollectionsTotal = useFirestoreQuery(
    user?.uid && query && firebase.firestore().collection("totals").doc('menu')
  )
  const collectionTotal = isNum(fireCollectionsTotal.data?.[router.query.sort]) 
  const fireCollections = useFirestoreQuery(query)



  useEffect(() => {
    user?.uid &&
      setRef(
        firebase
          .firestore()
          .collection(`${router.query.sort}`)
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

  }, [user?.uid, router?.query?.sort])

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
    ref && setQuery(ref.orderBy("menuOrder", "asc").limit(limit))
  }, [ref])

  const nextPage = useCallback(() => {
    setReverse(false)
    setQuery(ref.orderBy("menuOrder", "asc").startAfter(lastID).limit(limit))
    setPage((p) => parseInt(p) + 1)
  }, [lastID, limit, router?.query?.sort])

  const prevPage = useCallback(() => {
    setReverse(true)
    setQuery(ref.orderBy("menuOrder", "desc").startAfter(firstID).limit(limit))
    setPage((p) => parseInt(p) - 1)
  }, [firstID, limit, router?.query?.sort])


  const handleCreateClick = () => {
    setNavLoading(true)
  }

  return (
    <>
      {/* OUTLET */}
      <TableOutlet>
        <TableHeader>
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
              <Link                 as={`/${user?.uid}/menu/create/${router.query.sort}`}
                href={`/[adminID]/menu/create/[sort]`} scroll={false}>
                <Button
                  onClick={handleCreateClick}
                  loading={loading}
                  disabled={loading}
                  text={`Add ${capitalize(router.query.sort).slice(0, -1)}`}
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
        {fireCollections?.status === "success" && Boolean(fireCollections?.data.length > 0) && (
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
                  flex={2}
                  text={"Title"}
                  mobileHide={false}
                />
                 <HeaderCell
                  id='h-type'
                  flex={1}
                  text={"Total"}
                  mobileHide={false}
                />               
                <HeaderCell
                  id='amount'
                  flex={1}
                  text={"Sold"}
                  mobileHide={false}
                />            
                <HeaderCell
                  id='sales'
                  flex={1}
                  text={"Sales"}
                  mobileHide={true}
                />
              </HeaderRow>
              {/**/}
              <DiscountsList {...{ fireCollections }} />
              {/**/}
              {/**/}
            </TableContent>
            {fireCollections?.status === "success" &&
              fireCollections.data.length > 0 && (
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
        {fireCollections?.status === "loading" && (
          <div className='table-spinner-container'>
            <Spinner />
          </div>
        )}
        {fireCollections?.status === "success" && fireCollections?.data?.length === 0 && (
          <div style={{padding:32}} className='table-spinner-container'>
            <div className='noResult'>No Results</div>
          </div>
        )}
        {fireCollections?.status === "error" && fireCollections.error && (
          <div style={{padding:32}} className='table-spinner-container'>
            <br/><h2 >Error</h2><br/>
            <p style={{overflowWrap:'anywhere'}}>{`${fireCollections.error}`}</p>
          </div>
        )}
      </TableOutlet>
    </>
  )
}

export default Collections

import { useRouter } from "next/router"
import SVGIcon from "../../components/SVGIcon"
import { useState, useEffect, useCallback } from "react"
import { useFirestoreQuery } from "../../hooks/useFirestoreQuery"
import firebase from "../../firebase/clientApp"
import { useUser } from "../../context/userContext"
import { useUsers } from "../../context/usersContext"
import Link from "next/link"
import Spinner from "../../components/Buttons/Spinner"
import { useRouting } from "../../context/routingContext"
import { NotificationManager } from "react-notifications"
import Button from "../../components/Buttons/Button"
import TextField from "../../components/Forms/TextField"
import {
  TableCell,
  HeaderCell,
  TableRow,
  HeaderRow,
  TableOutlet,
  TableHeader,
  TableContent,
} from "../../components/Table"
import parsePhoneNumber, {
  AsYouType,
} from "libphonenumber-js"
import { capitalize, isCurr, isNum } from "../../helpers"

const roleToIcon = {
  driver: "carFilled",
  dispatch: "callFilled",
  customer: "personFilled",
  manager: "fireFilled",
}

const UsersRow = ({
  status = "N/A",
  uid = "",
  photoURL = false,
  phoneNumber = "N/A",
  displayName = "N/A",
  //email = "N/A",
  orders = 0,
  creationTime = "N/A",
  //metadata = { creationTime: "N/A" },
  role,
}) => {
  const { user } = useUser()
  return (
    <TableRow
      href={"/[adminID]/users/edit/[id]/[profile]"}
      as={`/${user?.uid}/users/edit/${uid}/profile`}
      >
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
        text={
          <>
            {`${displayName||''}`}
            <br />
            {`${phoneNumber||''}`}
          </>
        }
        mobileHide={false}
      />
      <TableCell
        id='t-start'
        flex={1}
        text={<SVGIcon name={roleToIcon[role.toString()]} />}
        mobileHide={true}
      />
      <TableCell
        id='t-start'
        flex={1}
        text={'date'}
        //text={creationTime && creationTime.toDate().toJSON().slice(0, 10)}
        mobileHide={true}
      />
      <TableCell id='t-start' flex={1} text={orders.toString()} mobileHide={true} />
      <TableCell id='t-end' flex={1} text={capitalize(status)} mobileHide={false} />
    </TableRow>
  )
}

const UsersList = ({ fireCollection }) => {
  const [products, setProducts] = useState([])
  const { lastID, setLastID, firstID, setFirstID, reverse, setReverse } = useUsers()

  useEffect(() => {
    let tempProducts = []
    let tempIDs = []
    const { data, status } = fireCollection
    if (status === "success") {
      for (const key in data) {
        //const product = data[key]
        tempIDs.push(data[key].uid)
        tempProducts.push(<UsersRow {...data[key]} key={key} />)
      }
      if (reverse) {
        tempProducts.reverse()
        tempIDs.reverse()
      }
    }
    setFirstID(tempIDs[0])
    setLastID(tempIDs.pop())
    setProducts(tempProducts)
  }, [fireCollection])
  return products
}

const Users = ({fireCollectionsTotal}) => {
  const [searchState, setSearchState] = useState("")
  const [searchValue, setSearchValue] = useState("")
  const [searchUser, setSearchUser] = useState([])
  const [limit, setLimit] = useState(5)
  const { lastID, setLastID, firstID, setFirstID, setReverse } = useUsers()
  const [page, setPage] = useState(1)
  const { user, fireUser } = useUser()
  const router = useRouter()
  //const [collectionTotal, setCollectionTotal] = useState(0)
  const [disableNext, setDisableNext] = useState(true)
  const [disablePrev, setDisablePrev] = useState(true)
  const [maxPage, setMaxPage] = useState(0)
  const [query, setQuery] = useState(null)
  const [ref, setRef] = useState(null)
  const { setNavLoading } = useRouting()
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState(null)


  // const fireCollectionsTotal = useFirestoreQuery(
  //   user?.uid && firebase.firestore().collection("totals").doc("users")
  // )
  const collectionTotal = isNum(fireCollectionsTotal.data?.[router.query.role]) 
  const fireCollections = useFirestoreQuery(query)

  useEffect(() => {

    user?.uid &&
      setRef(
        firebase
          .firestore()
          .collection("users")
          .where(router.query?.role === "pending"?"status":"role", "==", router?.query?.role)
      )
    setLastID(null)
    setFirstID(null)
    setPage(1)
    setDisableNext(true)
    setDisablePrev(true)
    //setCollectionTotal(0)
    setMaxPage(1)
    setReverse(false)
          
    setSearchUser([])
    setInput('')
    return () => {
      setLastID(null);
      setFirstID(null);
      setPage(1);
      setDisableNext(true);
      setDisablePrev(true);
      //setCollectionTotal(0)
      setMaxPage(1);
      setReverse(false);
      
      setSearchUser([])
      setInput('')
    };

  }, [user?.uid, router?.query?.role])

  useEffect(() => {

    if (collectionTotal > 0) {
      setMaxPage(Math.ceil(collectionTotal / limit))
    } else {
      setMaxPage(0)
    }
  }, [collectionTotal, limit, router?.query?.role])

  useEffect(() => {
    if (page === maxPage) {
      setDisableNext(true)
    } else {
      setDisableNext(false)
    }
  }, [page, maxPage, router?.query?.role])

  useEffect(() => {
    setDisablePrev(!Boolean(page > 1))
  }, [page, router?.query?.role])

  useEffect(() => {
    ref && setQuery(ref.orderBy("uid", "asc").limit(limit))
  }, [ref])

  const nextPage = useCallback(() => {
    setReverse(false)
    setQuery(ref.orderBy("uid", "asc").startAfter(lastID).limit(limit))
    setPage((p) => parseInt(p) + 1)
  }, [lastID, limit, router?.query?.role])

  const prevPage = useCallback(() => {
    setReverse(true)
    setQuery(ref.orderBy("uid", "desc").startAfter(firstID).limit(limit))
    setPage((p) => parseInt(p) - 1)
  }, [firstID, limit, router?.query?.role])


  const handleCreateClick = () => {
    setNavLoading(true)
  }

useEffect(() => {
  setSearchUser([])
  setInput('')
  return () => {
    setSearchUser([])
    setInput('')
  };
}, [router?.query?.role]);

useEffect(() => {
  setSearchUser([])
  setInput('')
  return () => {
    setSearchUser([])
    setInput('')
  };
}, []);


  useEffect(() => {
    //alert(input.length)
    if(typeof input === 'string' && input.length){
      const phoneNumber = parsePhoneNumber(input, 'US')
      if(phoneNumber && phoneNumber.isValid()){
        //alert("submit") 
        //handleClick()
        findUser()
      }else{
        setSearchUser([])
      }
    }
  }, [input]);



  const findUser = async () => {
    const searchItems = []
    const phoneNumber = parsePhoneNumber(`${input}`, `US`)
    if (phoneNumber && phoneNumber.isValid()) {
      try {
        const db = firebase.firestore()
        const usersRef = db.collection("users")
        setLoading(true)
        const snapshot = await usersRef
          .where("phoneNumber", "==", phoneNumber.format("E.164"))
          .get()
        if (snapshot.empty) {
          console.log("No matching documents.")

          NotificationManager.warning("No user found.")
          return
        }

        snapshot.forEach((doc) => {
          console.log(doc.id, "=>", doc.data())
          searchItems.push(doc.data())
        })
        if (searchItems.length > 0) {
          NotificationManager.success("User found.")
        }
        setSearchUser(searchItems)
      } catch (e) {
        console.log(e)
        NotificationManager.error("An error occurred.")
      } finally {
        setLoading(false)
      }
    } else {
      NotificationManager.error("Phone number invalid.")
    }
  }


  const formatPhoneNumber = (value) => {
    if (!value) return ""
    value = value.toString()

    if (value && value.length > 14) {
      return `${value}`.slice(0, -1)
    }
    if (value.includes("(") && !value.includes(")")) {
      return value.replace("(", "")
    }
    return new AsYouType("US").input(value)
  }

  // const showLoading = () => {
  //   if (
  //     loading ||
  //     fireCollection.status !== "success" ||
  //     Boolean((searchValue || "").length > 0 && (searchValue || "").length < 14)
  //   ) {
  //     return true
  //   } else {
  //     return false
  //   }
  // }
  // const showNoResult = () => {
  //   if (
  //     (fireCollection.status === "success" &&
  //       fireCollection.data?.length === 0 &&
  //       (searchValue || "").length === 0) ||
  //     (!loading && searchValue.length > 13 && searchUser.length === 0)
  //   ) {
  //     return true
  //   } else {
  //     return false
  //   }
  // }

//   const handleBlur = () => {
//     if(searchValue?.length === 0){
//      setSearchState("")
//     }else{
//      setSearchState("showing-result")
//     }
//     if(searchValue?.length > 0){
//         const phoneNumber = parsePhoneNumber(`${searchValue}`, `US`)
//         if (!phoneNumber || !phoneNumber.isValid()) {
//             setSearchValue('')
//         }   
//     }
//   }
// useEffect(() => {
// alert(searchUser.length)
// }, [searchUser]);

  return (
<>
        <TableOutlet>
          <>
   
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
              <Link  
                  href={"/[adminID]/users/create"}
                  as={`/${user?.uid}/users/create`}
                  scroll={false}
                >
                <Button
                  onClick={handleCreateClick}
                  loading={loading}
                  disabled={loading}
                  text={`Add User`}
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
              <TextField
                style={{ marginBottom: "16px" }}
                disabled={disabled || loading}
                hasError={Boolean(error)}
                validationErrorText={error}
                onFocus={() => setError(null)}
                id='phoneNumber'
                name='phoneNumber'
                type='text'
                floatingLabelText='Search by phone'
                hintText='Enter phone'
                fullWidth
                onChange={({ target: { value } }) =>
                  setInput(formatPhoneNumber(value))
                }
                value={input || ""}
                //readOnly={true}
              />
            </div>
          </div>
        </TableHeader>
        
       <>
            {(fireCollections?.status === "success" && Boolean(fireCollections?.data.length > 0) || (searchUser.length > 0)) && (
              <>
                {<TableContent>
                  <HeaderRow>
                    {/* <HeaderCell id='h-type' maxWidth={40} text={''} mobileHide={false} /> */}
                    <HeaderCell id='h-type' maxWidth={90} mobileHide={true} />
                    <HeaderCell
                      id='h-title'
                      minWidth={184}
                      flex={1}
                      text={"User"}
                      mobileHide={false}
                    />
                    <HeaderCell id='start' flex={1} text={"Role"} mobileHide={true} />
                    <HeaderCell id='amount' flex={1} text={"Created"} mobileHide={true} />
                    <HeaderCell id='start' flex={1} text={"Orders"} mobileHide={true} />
                    <HeaderCell id='end' flex={1} text={"Status"} mobileHide={false} />
                  </HeaderRow>
                {((fireCollections.status === "success" && Boolean(fireCollections.data.length > 0) || (searchUser.length > 0) )) && (
                <>
                  <UsersList {...{ fireCollection:(searchUser.length>0)?{ status: "success", data: searchUser }:fireCollections }} />

                  {/* {!searchValue && } */}
                  {/* {(searchValue && searchUser.length > 0) && (
                    <UsersList fireCollection={{ status: "success", data: searchUser }} />
                  )} */}
                  </>
 )}

                </TableContent>}
                </>
                )}

                {(!searchUser.length>0 &&
                  fireCollections.status === "success" &&
                  fireCollections.data?.length !== 0) && (
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
                                    page * limit < collectionTotal
                                      ? page * limit
                                      : collectionTotal
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
           

              {(fireCollections?.status === "loading" || loading) && (
          <div className='table-spinner-container'>
            <Spinner />
          </div>
        )}
        {fireCollections?.status === "success" && fireCollections?.data?.length === 0 && !searchUser.length>0 && (
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
          </>
        </TableOutlet>

      </>

  )
}


export default Users

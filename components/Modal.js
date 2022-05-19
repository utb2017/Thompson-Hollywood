import React, { useState, useEffect, useRef } from "react"
import { assignOrders, logout } from "../firebase/clientApp"
import { usePosition } from "use-position"
import ButtonWithSpinner from "../components/ButtonWithSpinner"
import Form from "../components/form/Form"
import Button from "../components/form/Button"
import SVGIcon from "../components/SVGIcon"
import { useDispatchModal } from "../context/modalContext"
import Link from "next/link"
import firebase from "../firebase/clientApp"
import { disableBodyScroll, clearAllBodyScrollLocks } from "body-scroll-lock"
import { useRouter } from "next/router"
// import { useUser } from "../context/userContext"
import { useFirestoreQuery } from "../hooks/useFirestoreQuery"

export const NewOrder = ({ modal }) => {
  const { latitude, longitude } = usePosition(true)

  const [loading, setloading] = useState(false)

  const updateOrders = (data) => {
    setloading(true)
    assignOrders(data).finally(() => setloading(false))
  }

  return (
    <div className='modal-container'>
      <div className='modal-background' />
      <div className='modal-content'>
        <div className='new-order-modal'>
          <h2>
            <SVGIcon
              style={{ margin: "0 3px -3px 0" }}
              name={"ordersFilled"}
              color={"rgb(0,200,5)"}
            />
            <span> New Order!</span>
          </h2>
          <p>
            {`You have been assigned ${modal.key?.length} new order${
              modal.key?.length > 1 ? "s" : ""
            }.`}
          </p>
          <ButtonWithSpinner
            //disabled={false}
            loading={loading}
            text={"Ok"}
            className={"new-order-button"}
            type={"button"}
            variant={"border-button"}
            onClick={() =>
              updateOrders({
                current: "assigned",
                latitude,
                longitude,
                id: modal.key,
              })
            }
          />
        </div>
      </div>
    </div>
  )
}

export const Error = ({ state }) => {
  const { pathname, query } = useRouter()

  return (
    <div className='modal-container'>
      <Link href={pathname}>
        <div className='modal-background' />
      </Link>
      <div className='modal-content'>
        <div className='new-order-modal'>
          <h2>Error!</h2>
          <p>No modal defined.</p>
        </div>
      </div>
    </div>
  )
}

export const CheckoutModal = ({ state }) => {
  const { pathname, query } = useRouter()

  return (
    <div className='modal-container'>
        <div className='modal-background' />
      <div className='modal-content'>
        <div className='new-order-modal'>
          <h2>Ordering...</h2>
          <div className="inline-loading" style={{margin: "24px 0"}}>
                <div className="spinner" style= {{ height: '24px', width: '24px' }} />
            </div>
        </div>
      </div>
    </div>
  )
}



export const Taxes = () => {
  const { pathname, query } = useRouter()
  const [returnPage, setReturnPage] = useState(pathname)

  useEffect(() => {
   // alert('cart')
    let page = pathname
    if("cart" in query)(page = `${pathname}?cart`);
   // alert('cart')
    setReturnPage(page);
    return () => setReturnPage(pathname);
  }, [pathname, query])

  return (
    <div className='modal-container'>
      <Link href={returnPage}>
        <div className='modal-background' />
      </Link>
      <div className='modal-content-tax'>
        <div className='new-order-modal taxes-modal'>
          <h2>{`Taxes`}</h2>
          {/* Totals */}
          {query?.taxes ? (
            <div className='module-wrapper module-wrapper'>
              <section style={{ padding: "1rem 0px" }}>
                <div className='css-149ghmn e17qz39z0' />
                <div className='css-1v3870x e9mvujh0'>
                  <div style={{ position: "relative" }}>
                    <div className='css-1fh9ug8 e1m3c6hs1'>
                      <div className='css-1ofqig9 ej2tyaj0'>
                        <div type='faded' className='css-1woe1iy ey3gvnc0'>
                          <div className='css-95g4uk ey3gvnc2'>
                            <div className='css-1vd84sn ey3gvnc5'>
                              Sales Tax
                              <div className='css-77vupy ey3gvnc1' />
                            </div>
                            <div className='css-vqyk7m ey3gvnc3'>
                              {query?.sales &&
                                parseFloat(query.sales).toLocaleString(
                                  "en-US",
                                  {
                                    style: "currency",
                                    currency: "USD",
                                  }
                                )}
                            </div>
                          </div>
                        </div>
                        <div type='faded' className='css-1woe1iy ey3gvnc0'>
                          <div className='css-95g4uk ey3gvnc2'>
                            <div className='css-1vd84sn ey3gvnc5'>
                              Local Tax
                            </div>
                            <div className='css-vqyk7m ey3gvnc3'>
                              {query?.local &&
                                parseFloat(query.local).toLocaleString(
                                  "en-US",
                                  {
                                    style: "currency",
                                    currency: "USD",
                                  }
                                )}
                            </div>
                          </div>
                        </div>
                        <div type='faded' className='css-1woe1iy ey3gvnc0'>
                          <div className='css-95g4uk ey3gvnc2'>
                            <div className='css-1vd84sn ey3gvnc5'>
                              Excise Tax
                              <div className='css-77vupy ey3gvnc1' />
                            </div>
                            <div className='css-17yp4d9 ey3gvnc3'>
                              {query?.excise &&
                                parseFloat(query.excise).toLocaleString(
                                  "en-US",
                                  {
                                    style: "currency",
                                    currency: "USD",
                                  }
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <Link href={returnPage}>
                <button className='new-user-form-submit-button button-base auth' children={'GOT IT'}/>
              </Link>
            </div>
          ) : (
            <div className='module-wrapper module-wrapper'>
              <section style={{ padding: "1.5rem 0px" }}>
                <div className='css-149ghmn e17qz39z0' />
                <div className='css-1v3870x e9mvujh0'>
                  <div style={{ position: "relative" }}>
                    <div className='css-1fh9ug8 e1m3c6hs1'>
                      <div className='css-1ofqig9 ej2tyaj0'>
                        <div type='faded' className='css-1woe1iy ey3gvnc0'>
                          <div className='css-95g4uk ey3gvnc2'>
                            <div className='ey3gvnc5 holder'>
                              <div className='width-30' />
                            </div>
                            <div
                              className='holder'
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                              }}>
                              <div className='width-30' />
                            </div>
                          </div>
                        </div>
                        <div
                          type='faded'
                          className='css-1woe1iy ey3gvnc0'
                          style={{ marginTop: "4px" }}>
                          <div className='css-95g4uk ey3gvnc2'>
                            <div className='ey3gvnc5 holder'>
                              <div className='width-40' />
                            </div>
                            <div
                              className='holder'
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                              }}>
                              <div className='width-30' />
                            </div>
                          </div>
                        </div>
                        <div
                          type='faded'
                          className='css-1woe1iy ey3gvnc0'
                          style={{ marginTop: "4px" }}>
                          <div className='css-95g4uk ey3gvnc2'>
                            <div className='ey3gvnc5 holder'>
                              <div className='width-30' />
                            </div>
                            <div
                              className='holder'
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                              }}>
                              <div className='width-30' />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='css-m0iina e17qz39z0' />
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const Logout = ({ state }) => {
  const { pathname } = useRouter()

  const { modalDispatch, modalState } = useDispatchModal()

  return (
    <div className='modal-container'>
      <Link href={pathname}>
        <div className='modal-background' />
      </Link>
      <div className='modal-content red'>
        <div className='logout-modal'>
          <h2>Warning!</h2>
          <p>
            Leaving this page without providing required information will log
            you out. You will return here if you log back in.
          </p>
          <ButtonWithSpinner
            //disabled={false}
            loading={false}
            text={"Logout"}
            className={"logout-button"}
            type={"button"}
            variant={"border-button"}
            onClick={logout}
          />
        </div>
      </div>
    </div>
  )
}

export const Product = ({ state }) => {
  const scrollRef = useRef(null)
  const { pathname, query } = useRouter()
  const { modalDispatch, modalState } = useDispatchModal()
  const [key, setKey] = useState(false)
  const [info, setInfo] = useState(false)

  const productInfo = useFirestoreQuery(
    key && firebase.firestore().collection(key.collection).doc(key.product)
  )

  useEffect(() => {
    disableBodyScroll(scrollRef.current)
    return () => {
      clearAllBodyScrollLocks()
    }
  }, [scrollRef])

  useEffect(() => {
    if ("product" in query) {
      //const { product, collection } = query
      setKey(query)
    } else {
      setKey(false)
    }
  }, [query])

  useEffect(() => {
    //console.log("productInfo")
   // console.log(productInfo)
   // setInfo(productInfo.data)
  }, [productInfo])

  return (
    <div className='modal-container-product'>
      <Link scroll={false} href={pathname}>
        <div className='modal-background' />
      </Link>
      <div ref={scrollRef} className='modal-product-container'>
        <div className={"bgColor"}>
          <div className={"imgContainer"}>
            <div color='#FFF8F5' className={"fitCont"}>
              {/* <Img src={img2} alt="product_image" className={"imgM"} loader={<LoadingBox shape="square" background="light" style={{ height: "100%", width: "100%", objectFit: "contain", display: "block" }} />} /> */}
              {info?.img ? (
                <img
                  className='imgM'
                  width={409}
                  height={291}
                  src={info?.img[0]}
                  alt='product_image'
                />
              ) : (
                <div className='holder'>
                  <div
                    style={{
                      height: "375px",
                      width: "100%",
                      borderRadius: "0px",
                    }}
                  />
                </div>
              )}
            </div>
            <div className={"addDesk"}>
              <div className={"addDeskFW"}>
                {/* <MenuProductControl product={product} /> */}
              </div>
            </div>
          </div>
          <div className={"bottomAndLeftContainer"}>
            <div className={"mobileVisible"}>
              <div className={"abs"}></div>
              <div className={"desktopOnScrollHeader"} style={{ opacity: 0 }}>
                <span className={"onScrollSpan"} style={{ opacity: 1 }}>
                  {/* {info?.name} */}
                  {!info?.name ? (
                    info?.name
                  ) : (
                    <div className='holder'>
                      <div style={{ height: "35px", width: "20%" }} />
                    </div>
                  )}
                </span>
              </div>
            </div>
            <div className={"bottomMargin4rem"}>
              <h2 className={"productTitle"}>
                {" "}
                {info?.name ? (
                  info?.name
                ) : (
                  <div className='holder'>
                    <div style={{ height: "35px", width: "30%" }} />
                  </div>
                )}
              </h2>
              <h5 className={"productSubTitleBrand"}>{"brand"}</h5>
              <div className={"productSubTitlePrice"}>
                {info?.price ? (
                  info?.price.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })
                ) : (
                  <div className='holder'>
                    <div style={{ height: "41px", width: "20%" }} />
                  </div>
                )}
              </div>
              <div className={"productDescriptionContainer"}>
                <p>
                  {
                    "description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description hey  hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey hey"
                  }
                </p>
              </div>
              <div className={"flexbox"}>{"ListedObj"}</div>
            </div>
            {/* {(type !== "accessories" && type !== "edibles" && type !== "cbd" && type !== "prerolls") && <MenuStrainChart chart={chart} />} */}
          </div>
        </div>
      </div>
    </div>
  )
}

function Modal(props) {
  
  //alert('Modal(props')
  //alert(JSON.stringify(props))
  const Component = props?.modal.component || Error
  return <span>{props?.modal.isOpen && <Component modal={props.modal} />}</span>
}

export default Modal

import { useState, useEffect, useRef, createRef, ReactElement } from "react";
import { useRouter } from "next/router";
import Cart from "../../../components/Cart/CartTS";
import { useDispatchModalBase } from "../../../context/Modal";
import { useFirestoreQuery } from "../../../hooks/useFirestoreQuery";
import firebase, { fireCloud } from "../../../firebase/clientApp";
import Link from "next/link";
import { useUser } from "../../../context/userContext";
import SVGIcon from "../../../components/SVGIcon";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { TOKEN, isNum } from "../../../helpers";
import ReactMapGL, { FlyToInterpolator, Marker } from "react-map-gl";
import * as d3 from "d3-ease";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer } from "@deck.gl/layers";
import { useDispatchModal } from "../../../context/modalContext";
import { EditAddress, FindAccount } from "../../../components/Modals/index";
import PhoneNumber from "./modals/PhoneNumber";
import Address from "./modals/Location";
import ProductSection from "../../../components/Menu/ProductSection";
import { useForm } from "../../../context/formContext";
import { useRouting } from "../../../context/routingContext";

import { NotificationManager } from "react-notifications"
import { styled } from "baseui";
import { Button, KIND, SIZE } from "baseui/button";
import { Caption2, Label2, Label3 } from "baseui/typography";
import { useScreen } from "../../../context/screenContext";

// Date.prototype.addHours = function (h) {
//   this.setTime(this.getTime() + h * 60 * 60 * 1000);
//   return this;
// };

const BaseBackGround = styled("div", ({ $theme }) => {
  return {
    backgroundColor: $theme.colors.background,
    borderBottom: `1px solid ${$theme.borders.border600.borderColor}`,
    boxShadow: "unset",
    zIndex: 2,
    height: '48px',
  };
});

const UserInfoSection = styled("div", ({ $theme }) => {
  return {
    //fontWeight: 600,
    //color: "rgb(66, 66, 66)",
    //paddingTop: 6,
    //paddingBottom: 4,
    //borderBottom: "1px solid rgb(238, 238, 238)",
    padding:'0 14px',
    display: 'flex',
    alignItems:'center',
    justifyContent: "space-between",
    backgroundColor: $theme.colors.background,
    borderBottom: `1px solid ${$theme.borders.border600.borderColor}`,
    boxShadow: "unset",
    zIndex: 1,
    height: '42px',
  };
});

const InfoSection = styled("div", ({ $theme }) => {
  return {
    fontSize: "15px",
    //background: "white",
    borderBottom: `1px solid ${$theme.borders.border600.borderColor}`,
    borderTop: `1px solid ${$theme.borders.border600.borderColor}`,
    padding: 0,
  };
});

const ButtonSection = styled("div", ({ $theme }) => {
  return {
    //fontSize: "15px",
    height: "100%",
    display: "flex",
    //flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: 0,
  };
});

const _now_ = new Date().toLocaleString("en-US", {
  timeZone: "America/Los_Angeles",
});
const _d_ = new Date(_now_);
const _day_ = _d_.getDay();

function Menu({ fireSettings }) {
  const { user, zone, fireCart, fireCustomer, setCustomerID, customerID } = useUser();
  const router = useRouter();
  const { asPath, pathname, query } = useRouter();
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<any>(false);

  //const { width, height } = useWindowSize()
  const [view, setView] = useState({ ...fireSettings?.data?.defaultMap });
  const mapRef = useRef();
  const { modalDispatch, modalState } = useDispatchModal();
  const { form, setForm, error, setError } = useForm();
  const { setNavLoading, navLoading, cartOpen, setCartOpen } = useRouting();
  const [badgeQty, setBadgeQty] = useState(0);
  const { modalBaseDispatch } = useDispatchModalBase();

  const { toggleTheme, themeState } = useScreen();
  useEffect(() => {
    return () => {
      //alert('eraise')
      setCustomerID(null)
    };
  }, []);

  useEffect(() => {
    if (modalState?.modal) {
      // alert( JSON.stringify( modalState?.modal.isOpen ) )
    }
  }, [modalState]);

  const fireDiscounts = useFirestoreQuery(
    user?.uid &&
    firebase
      .firestore()
      .collection("discounts")
      .where("featured", "==", false)
      .where("recurring", "==", false)
      .where("active", "==", true)
    //.where("days", "array-contains", fireSettings?.data?.day)
  );

  const fireFeature = useFirestoreQuery(
    user?.uid &&
    fireSettings?.data?.day &&
    firebase
      .firestore()
      .collection("discounts")
      .where("featured", "==", true)
      .where("recurring", "==", true)
      .where("active", "==", true)
      .where("days", "array-contains", fireSettings?.data?.day)
  );

  const fireMenuCollections = useFirestoreQuery(
    user?.uid &&
    query &&
    firebase
      .firestore()
      .collection("collections")
      .orderBy("menuOrder", "asc")
      .limit(50)
  );

  useEffect(() => {
    setNavLoading(false);
    return () => {
      setError({});
    };
  }, []);

  useEffect(() => {
    let tempTotal = 0;
    for (const key in fireCart?.data) {
      const cartItemQty = isNum(fireCart?.data?.[key]?.qty);
      tempTotal += cartItemQty;
    }
    setBadgeQty(tempTotal);
  }, [fireCart]);

  useEffect(() => {
    if (form?.coords && form?.coords?.length === 2) {
      setView((oldView) => ({
        ...oldView,
        ...{ latitude: form?.coords[1], longitude: form?.coords[0], zoom: 13 },
      }));
    }
  }, [form]);

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
    });
  };
  const closeModal = () => {
    modalDispatch({
      type: "MODAL_UPDATE",
      payload: {
        modal: {
          isOpen: false,
          key: [],
          component: null,
        },
      },
    });
  };
  const openModalBase = (component: () => ReactElement, hasSquareBottom: boolean, closeable: boolean) => {
    modalBaseDispatch({
      type: "MODAL_UPDATE",
      payload: {
        modalBase: {
          isOpen: true,
          key: [],
          component,
          hasSquareBottom,
          closeable,
        },
      },
    });
  };

  const closeModalBase = () => {
    modalBaseDispatch({
      type: "MODAL_UPDATE",
      payload: {
        modalBase: {
          isOpen: false,
          key: [],
          component: null,
          hasSquareBottom: false,
          closeable: true,
        },
      },
    });
  };
  const _editAddress = () => {
    const component = () => (
      <EditAddress noClose={true} onSelect={addressSelect} onClear={clear} />
    );
    openModal(component);
  };
  const _editAddressBase = (flat=false, willClose=true) => {
    const component = () => (
      <Address />
    );
    openModalBase(component, flat,  willClose);
  };
  const _getUser = () => {
    const component = () => (
      <FindAccount noClose={true} />
    );
    openModal(component);
  };
  const _getUserBase = (flat=false, willClose=true) => {
    const component = () => (
      <PhoneNumber />
    );
    openModalBase(component, flat,  willClose);
  };



  const addressSelect = async (x) => {

    const AddressForm = {
      address: x?.address,
      coords: x?.coords,
      inRange: x?.inRange,
      customerID: customerID
    };

    if (x?.inRange) {
      setNavLoading(true)
      try {
        const _storeAddressData = fireCloud("storeAddressData")
        //const form = {discountID,userID}
        const response = await _storeAddressData(AddressForm)
        //console.log("deleteDiscount")
        //console.log(response?.data)
        if (response?.data?.success === true) {
          NotificationManager.success("Address updated.")
          //setTotalsLoading(true)
        }
      } catch (e) {
        NotificationManager.error(`${e?.message || e}`)
        //setTotalsLoading(false)
      } finally {
        setNavLoading(false)
      }
    }



    //setTotalsLoading(true)

    // setForm((oldForm) => ({ ...oldForm, ...x }));
    // setView((oldView) => ({
    //   ...oldView,
    //   ...{ latitude: x?.coords[1], longitude: x?.coords[0], zoom: 13 },
    // }));


  };
  useEffect(() => {
    if (fireCustomer?.data?.coords && Array.isArray(fireCustomer?.data?.coords) && fireCustomer?.data?.coords.length === 2 && typeof fireCustomer?.data?.coords[0] === 'string' && typeof fireCustomer?.data?.coords[1] === 'string') {
      setView((oldView) => ({
        ...oldView,
        ...{ latitude: fireCustomer?.data?.coords[1], longitude: fireCustomer?.data?.coords[0], zoom: 13 },
      }));
      setForm((oldForm) => ({
        ...oldForm,
        ...{ coords: fireCustomer?.data?.coords,
        },
      }));
    }
  }, [fireCustomer.data]);

useEffect(()=>{
//alert(JSON.stringify(view))
console.log(JSON.stringify(view))
},[view])

  useEffect(() => {


    //    alert(customerID)



    if (!customerID) {
      _getUserBase(false, false)
    } else if (fireCustomer?.data && customerID && (!fireCustomer.data?.inRange || !fireCustomer.data?.coords || !fireCustomer.data?.address) && !navLoading) {
      _editAddressBase();
    } else if (fireCustomer?.data?.inRange && fireCustomer?.data?.coords && fireCustomer?.data?.address && customerID) {
      closeModal();
    }
    return () => {
      closeModal();
    };
  }, [navLoading, customerID, fireCustomer.data, modalState?.modal]);

  // useEffect(() => {
  // if (form?.inRange && form?.coords && form?.address && !customerID) {
  //    _getUser()
  //   } else if (form?.inRange && form?.coords && form?.address && customerID) {
  //     closeModal();
  //   }
  // }, [form?.coords, form?.address, form?.inRange, customerID]);

  const clear = () => {
    setView((oldView) => ({ ...oldView, ...fireSettings?.data?.defaultMap }));
    setError((oldError) => ({ ...oldError, ...{} }));
    setForm((oldForm) => ({
      ...oldForm,
      ...{
        search: "",
        address: "",
        isFocused: false,
        inRange: null,
        coords: [],
      },
    }));
  };

  useEffect(() => {
    const { status, data } = fireMenuCollections;
    if (status === "success" && data) {
      const components = [];
      for (const key in data) {
        if (data[key]?.active === true && data[key]?.total > 0) {
          components.push(
            <ProductSection
              key={key}
              collection={data[key]}
              {...{ fireFeature }}
              {...{ fireDiscounts }}
            />
          );
        }
      }
      setCollections(components);
    }
  }, [fireMenuCollections, fireFeature, fireDiscounts]);

  return (
    <div id="create-order-menu" className="delivery-flow">
      <BaseBackGround className="delivery-flow-app-bar">
        <div className="delivery-flow-toolbar">
          <div className="delivery-flow-btns left">
            <Link
              scroll={false}
              href={`${pathname}?menu`}
              as={`${asPath}?menu`}
            >
              <Button 
                kind={KIND.minimal}
                size={SIZE.compact}>
                <SVGIcon name={"menu"} />
              </Button>
            </Link>
          </div>
          <h1 className="delivery-flow-logo" />
          <div className="delivery-flow-btns">
            <span className="MuiBadge-root">
              {/* <Link
                scroll={false}
                href={"/[adminID]/create-order/menu?cart"}
                as={`/${customerID}/create-order/menu?cart`}
              > */}
              <Button
                kind={KIND.minimal}
                size={SIZE.compact} onClick={() => setCartOpen(true)} disabled={badgeQty < 1}>
                <SVGIcon
                  //color={badgeQty < 1 ? "rgb(117, 117, 117)" : "rgb(0,200,5)"}
                  name={"cart"}
                />
                {isNum(badgeQty) > 0 && (
                  <span className="MuiBadge-badge MuiBadge-colorPrimary">
                    {badgeQty}
                  </span>
                )}
              </Button>
              {/* </Link> */}
            </span>
          </div>
        </div>
      </BaseBackGround>

      <div className="delivery-flow-wrapper">
        <div className="delivery-flow-orders">
          {/** HEADER MAP */}
          <header id="menu-header" role="banner">
            <div className="menu-header-map">
              <ReactMapGL
                {...view}
                ref={mapRef}
                mapStyle={themeState?.dark ? "mapbox://styles/mapbox/dark-v10" : "mapbox://styles/mapbox/light-v10"}
                mapboxApiAccessToken={TOKEN}
                onViewportChange={setView}
                dragPan={false}
                dragRotate={false}
                doubleClickZoom={false}
                touchZoom={false}
                touchRotate={false}
                scrollZoom={false}
                transitionDuration={1000}
                transitionInterpolator={new FlyToInterpolator()}
                transitionEasing={d3.easeCubic}
                width={"100%"}
                height={"100%"}
              >
                {view && view?.latitude && view?.longitude && (
                  <Marker
                    offsetTop={-24}
                    offsetLeft={-24}
                    latitude={view?.latitude}
                    longitude={view?.longitude}
                    {...{ view }}
                  >
                    <SVGIcon
                      style={{ transform: "scale(1.4)" ,zIndex:2 }}
                      name={"locationMarkerFilled"}
                      color={"rgb(212, 54, 132)"}
                    />
                  </Marker>
                )}
                {zone && (
                  <DeckGL
                    viewState={view}
                    layers={[
                      new GeoJsonLayer({
                        id: "geojson-layer",
                        data: {
                          type: "Feature",
                          geometry: {
                            type: "Polygon",
                            coordinates: [zone],
                          },
                          properties: {
                            name: "Delivery Range",
                          },
                        },
                        stroked: false,
                        filled: true,
                        lineWidthScale: 20,
                        lineWidthMinPixels: 2,
                        getFillColor: [5, 30, 52, 50],
                        // getLineColor: (d) =>
                        //   colorToRGBArray(d.properties.color),
                        getRadius: 100,
                        getLineWidth: 1,
                      }),
                    ]}
                    getTooltip={({ object }) =>
                      object &&
                      (object.properties.name || object.properties.station)
                    }
                  />
                )}
              </ReactMapGL>
            </div>
          </header>

          {/** ADDRESS */}
          <InfoSection>
            <UserInfoSection>
              <Label3>Customer</Label3>
              <Label3>Address</Label3>
            </UserInfoSection>


            <ButtonSection>
              <Button
                onClick={()=>_getUserBase(false, true)}
                kind={KIND.tertiary}
                endEnhancer={<SVGIcon style={{ marginLeft:'-10px' }} name={'arrowDownSmall'} />}
                overrides={{
                  BaseButton: {
                    style: ({ $theme }) => ({
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    })
                  }
                }}
              >
                {fireCustomer?.data?.phoneNumber ? fireCustomer?.data?.phoneNumber : "No User"}
              </Button>
              <Button
                onClick={()=>_editAddressBase(false, true)}
                kind={KIND.tertiary}
                startEnhancer={<SVGIcon style={{ marginRight:'-10px' }} name={'arrowDownSmall'} />}
                overrides={{
                  BaseButton: {
                    style: ({ $theme }) => ({
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    })
                  }
                }}
              >
                {fireCustomer?.data?.address ? fireCustomer?.data?.address.split(",")[0] : "No address"}

              </Button>


            </ButtonSection>
          </InfoSection>

          {/**DISCOUNT */}
          {Boolean(fireFeature?.data?.length) && (
            <div className="discount-card-container">
              <div className="discount-card">
                <div className="discount-title-line">
                  {`Todays' Deal: ${fireFeature?.data?.[0]?.title}`}
                </div>
                <div className="discount-code-line">
                  {`Use code: ${fireFeature?.data?.[0]?.code}`}
                </div>
              </div>
            </div>
          )}

          {/**MENU */}
          <div style={{ margin: "0px auto" }} className="rmq-2e8763ff">
            {/* Products */}
            {/* {collections &&
              collections.map((k,v) => <ProductSection collection={k} total={v} />)} */}
            {collections}
          </div>
        </div>
      </div>

      <Cart
        {...{ fireDiscounts }}
        {...{ fireFeature }}
        as={`/${customerID}/create-order/menu`}
        href={"/[adminID]/create-order/menu"}
        scroll={false}
      />
    </div>
  );
}

export default Menu;

import React, { useEffect, useState, FC, ReactElement, useCallback, memo } from "react";
import { useRouter } from "next/router";
import { useUser } from "../../context/userContext";
import Link from "next/link";
import SVGIcon from "../SVGIcon";
import CartItem from "./CartItem";
import CartItemSkeleton from "./CartItemSkeleton";
import CartTotalsSkeleton from "./CartTotalsSkeleton";
import { isCurr } from "../../helpers";
import { useDispatchModal } from "../../context/modalContext";
import { AddPromoCode, DeletePromo, EditDisplayName, DeleteCredit } from "../Modals";
import PromoModal from "../Modals/Promo";
import { useDispatchModalBase } from "../../context/Modal";
import { useFirestoreQuery } from "../../hooks/useFirestoreQuery";
import firebase, { fireCloud } from "../../firebase/clientApp";
//import Button from "../Buttons/ButtonTS";
import { TotalsRow } from "../Split";
import Spinner from "../Buttons/Spinner";
import { NotificationManager } from "react-notifications";
import { useMemo } from "react";
import { useRouting } from "../../context/routingContext";
import getTotals from "./hooks/getTotals";
import { Accordion, Panel } from "baseui/accordion";
import { useStyletron } from "baseui";
import { styled } from "baseui";
import { H5, H6, Label1 } from "baseui/typography";
import { Button, KIND, SIZE, SHAPE } from "baseui/button";

const CartBackground = styled("div", ({ $theme }) => {
  return {
    backgroundColor: $theme.colors.background,
    borderLeft: `1px solid ${$theme.borders.border600.borderColor}`,
    //marginTop:$theme.sizing.scale1600
  };
});


const Line = styled("div", ({ $theme }) => {
  return {
    borderTop: `1px solid ${$theme.borders.border600.borderColor}`,
    height: "1px",
    width: "100%",
    padding: "0",
    marginTop: "12px"
  };
});


const Header = styled("div", ({ $theme }) => {
  return {
    borderBottom: `1px solid ${$theme.borders.border600.borderColor}`,
  };
});
const Footer = styled("div", ({ $theme }) => {
  return {
    borderTop: `1px solid ${$theme.borders.border600.borderColor}`,
  };
});

//import { useFirestoreQuery } from "../../hooks/useFirestoreQuery"

type CartDiscount = {
  hasDiscount?: boolean;
  discountMethod?: "flatRate" | "percent" | "taxFree" | "bogo";
  discountRate?: any;
  discountID?: string;
  loading?: boolean;
};
interface TotalsCart extends CartDiscount {
  subtotal: number;
  localTax: number;
  exciseTax: number;
  stateTax: number;
  discountTotal?: number;
  minOrder?: number;
  freeDeliveryMin?: number;
  deliveryFee?: number;
  serviceFee?: number;
  taxTotal: number;
  wholesale?: number;
  priceTotal: number;
  productsSold: number;
  profit?: number;
  profitWithDelivery?: number;
  profitWithDeliveryMinusFee?: number;
  taxedSubtotal?: number;
  loading?: boolean;
}
type QueryError = {
  message?: string;
  code?: string;
};
type QueryCartData = {
  data?: TotalsCart;
  status: string;
  error?: QueryError;
};
type Selected = {
  label: string;
  value: string;
};
type Discount = {
  active: boolean;
  featured: boolean;
  alert: boolean;
  alertSent: boolean;
  code?: string;
  dateEnd: string | any | null;
  dateStart: string | any | null;
  filters: string[] | null;
  collections: Selected[];
  //queryIDs: string[];
  collectionIDs: string[];
  id: string;
  uid: string | null;
  methodID: "flatRate" | "percent" | "taxFree" | "bogo";
  method: Selected;
  rate?: number;
  bogoQty?: number;
  sort?: "credit" | "coupon" | "refund";
  title: string | null;
  type: { [k: string]: any } | undefined;
  used: boolean;
  recurring: boolean;
  recurringDays: Selected[] | undefined;
  days: string[];
  stackable: boolean;
};

type CartItems = {
  id: string;
  img: string[];
  genome: string;
  inventory: number;
  name: string;
  pid: string;
  uid: string;
  price: number;
  qty: number;
  size: string;
  type: string;
  //collection: string;
  discountRate: number;
  hasDiscount: boolean;
  discountTotal: number;
  wholesale: number;
  onSale: boolean | null;
  saleRate: number | null;
  couponID?: string;
  brand: Selected;
  brandID: string;
  queryIDs: string[];
  collections: Selected[];
  collectionIDs: string[];
  saleTitle: string | string[];
};
export class CartTotals {
  subtotal: number;
  deliveryFee: number;
  deliveryTotal: number;
  stateTax: number;
  localTax: number;
  exciseTax: number;
  grandTotal: number;
  serviceFee: number;
  totalItemsSold: number;
  minOrder: number;
  freeDeliveryMin: number;
  productsTotal: number;
  //productsPrice: number;
  taxableSubtotal: number;
  stateTaxTotal: number;
  exciseTaxTotal: number;
  localTaxTotal: number;
  combinedTaxTotal: number;
  wholesaleTotal: number;
  profitTotal: number;
  freeDelivery: boolean;
  discountsApplied: number;
  discountsTotal: number;
  totalSaved: number;
  creditsApplied: number;
  creditTotal: number;
  creditRemainder: number;
  serviceFeeTotal: number;
  savedTaxTotal: number;
  initialCredit: number;
  //discount: number;

  constructor(
    subtotal: number,
    deliveryFee: number,
    deliveryTotal: number,
    stateTax: number,
    localTax: number,
    exciseTax: number,
    grandTotal: number,
    serviceFee: number,
    totalItemsSold: number,
    minOrder: number,
    freeDeliveryMin: number,
    productsTotal: number,
    //productsPrice: number,
    taxableSubtotal: number,
    stateTaxTotal: number,
    exciseTaxTotal: number,
    localTaxTotal: number,
    combinedTaxTotal: number,
    wholesaleTotal: number,
    profitTotal: number,
    discountsTotal: number,
    discountsApplied: number,
    freeDelivery: boolean,
    totalSaved: number,
    creditsApplied: number,
    creditTotal: number,
    creditRemainder: number,
    serviceFeeTotal: number,
    savedTaxTotal: number,
    initialCredit: number
    //discount: number
  ) {
    this.stateTax = stateTax || 0;
    this.exciseTax = exciseTax || 0;
    this.localTax = localTax || 0;
    this.subtotal = subtotal || 0;
    this.deliveryFee = deliveryFee || 0;
    this.deliveryTotal = deliveryTotal || 0;
    this.grandTotal = grandTotal || 0;
    this.serviceFee = serviceFee || 0;
    this.totalItemsSold = totalItemsSold || 0;
    this.minOrder = minOrder || 0;
    this.freeDeliveryMin = freeDeliveryMin || 0;
    this.productsTotal = productsTotal || 0;
    //this.productsPrice = productsPrice;
    this.taxableSubtotal = taxableSubtotal || 0;
    this.stateTaxTotal = stateTaxTotal || 0;
    this.exciseTaxTotal = exciseTaxTotal || 0;
    this.localTaxTotal = localTaxTotal || 0;
    this.combinedTaxTotal = combinedTaxTotal || 0;
    this.wholesaleTotal = wholesaleTotal || 0;
    this.profitTotal = profitTotal || 0;
    this.discountsApplied = discountsApplied || 0;
    this.discountsTotal = discountsTotal || 0;
    this.freeDelivery = freeDelivery || false;
    this.totalSaved = totalSaved || 0;
    this.creditsApplied = creditsApplied || 0;
    this.creditTotal = creditTotal || 0;
    this.creditRemainder = creditRemainder || 0;
    this.serviceFeeTotal = serviceFeeTotal || 0;
    this.savedTaxTotal = savedTaxTotal || 0;
    this.initialCredit = initialCredit || 0;
    //this.discount = discount;
  }
}

type Credits = {
  amount: number;
  initialAmount: number;
  created: firebase.firestore.FieldValue;
  id: string;
  title: string;
  used: boolean;
  user: string;
};

const roundTo = function (num: number, places: number) {
  const factor = 10 ** places;
  return Math.round(num * factor) / factor;
};
// const fromCents = (num: number, places: number): number => {
//   const cents = num / 100;
//   const factor = 10 ** places;
//   const decimal = Math.round(cents * factor) / factor;
//   return decimal;
// };
// const toCents = (num: number): number => {
//   const cents = Number(num) * 100;
//   return cents;
// };
// const getGrandTotal = (
//  subtotal: number, // +subTotalState,
//  stateTax: number, // fireSettings.data.stateTax,
//  exciseTax: number, // fireSettings.data.exciseTax,
//  localTax: number, // fireSettings.data.localTax,
//  serviceFee: number, // fireSettings.data.serviceFee,
//  unTaxed: number, // unTaxedTotal,
//  freeDeliveryMin: number, // fireSettings?.data?.freeDeliveryMin,
//  deliveryFee: number, // fireSettings?.data?.deliveryFee,
//  discount: number, // discountState,
//  credit: number, // creditTotal
// ): number => {
//   alert(`serviceFee:${serviceFee}`)
//   alert(`deliveryFee:${deliveryFee}`)
//   alert(`unTaxed:${unTaxed}`)
//   return (
//     (subtotal - unTaxed) * stateTax +
//     (subtotal - unTaxed) * localTax +
//     (subtotal - unTaxed) * exciseTax +
//     subtotal +
//     serviceFee +
//     deliveryFee +
//     credit
//   );
// };

const Strike: FC = ({ children }): ReactElement => {
  return <div style={{ textDecorationLine: "line-through" }}>{children}</div>;
};
const EmptyCart: FC = (): ReactElement => {
  return (
    <div className="empty-cart">
      <div className="empty-bag">
        <SVGIcon name="bag" size="standard" color={`rgb(0 180 5)`} />
      </div>
      <h2>Empty Cart</h2>
    </div>
  );
};
type DiscountForm = {
  userID: string;
  discountID: string;
};

const CartList: FC = (): ReactElement => {
  const [cartComponentList, setCartComponentList] = useState<ReactElement[]>([]);
  const { fireCart, fireCartTotals, fireDiscounts, fireCustomer, setTotalsLoading } = useUser();

  const removeUserDiscount = useCallback(async (discountID: string, userID: string) => {
    setTotalsLoading(true);
    try {
      const _deleteDiscount = fireCloud("removeUserDiscount");
      const form: DiscountForm = { discountID, userID };
      const response = await _deleteDiscount(form);
      //console.log("deleteDiscount")
      //console.log(response?.data)
      if (response?.data?.success === true) {
        NotificationManager.error("Discount removed.");
        //setTotalsLoading(true)
      }
    } catch (e) {
      NotificationManager.error(`${e?.message || e}`);
      setTotalsLoading(false);
    }
  }, []);

  useEffect(() => {
    let bogoTally = 0;
    let foundBogos = 0;
    let reqBogos = 0;
    //let removed = false
    const tempArray: ReactElement[] = [];
    const defaultCart: CartItems[] = [];
    const defaultDiscounts: Discount[] = [];
    if (fireCartTotals.data && fireCart.data && fireDiscounts.data && fireCustomer.data) {
      const cartData = fireCart.data;
      const discountData = fireDiscounts.data;
      cartData.sort((a: CartItems, b: CartItems) => a.brandID.localeCompare(b.brandID));

      cartData.map((cartItem: CartItems) => {
        defaultCart.push({ ...cartItem });
      });
      discountData.map((discountItem: Discount) => {
        defaultDiscounts.push({ ...discountItem });
      });

      //alert(cartItem.name)
      defaultDiscounts.map((discount: Discount) => {
        // bogoTally = 0
        reqBogos = 0;
        foundBogos = 0;
        //removed = false
        // alert(discount.title)
        defaultCart.map((cartItem: CartItems) => {
          let applied = false;
          let tempTitleArray = [];
          discount.collectionIDs.map((collectionID: string) => {
            //pre loop primary loop
            if (cartItem.queryIDs.includes(collectionID) || collectionID === "ALL_PRODUCTS") {
              //alert('THIS ITEM NEEDS DISCOUNTING')
              //useless
              if (collectionID !== "ALL_PRODUCTS") {
                // IS SPECIFIC
                if (discount.methodID === "taxFree") {
                  cartItem.saleRate = 0;
                  cartItem.onSale = true;
                  cartItem.saleTitle = discount.title;
                }
                if (!applied && discount.methodID === "flatRate") {
                  //const customRate = roundTo(cartItem.qty * +discount.rate, 2);
                  let tempDiscountRate = roundTo(cartItem.qty * +discount.rate, 2);
                  applied = true;
                  let percent = false;
                  if (cartItem.saleRate > 0 && cartItem.saleRate < 1) {
                    percent = true;
                  }

                  if (cartItem.onSale && !cartItem?.saleTitle) {
                    let tTitle = "";
                    if (percent) {
                      tTitle = `${cartItem.saleRate * 100}% off`;
                    } else {
                      tTitle = `$${cartItem.saleRate} off`;
                    }

                    //alert(tTitle)
                    tempTitleArray.push(tTitle);
                  }

                  //alert( ` ${1} ${cartItem.saleRate}`)

                  if (!cartItem.saleRate) {
                    cartItem.saleRate = 0;
                  }
                  if (cartItem.saleRate > 0 && cartItem.saleRate < 1) {
                    cartItem.saleRate = cartItem.saleRate * (cartItem.price * cartItem.qty);
                  }
                  if (!tempDiscountRate) {
                    tempDiscountRate = 0;
                  }
                  if (tempDiscountRate > 0) {
                    cartItem.saleRate += tempDiscountRate;
                  }
                  if (typeof cartItem?.saleTitle === "string") {
                    tempTitleArray.push(cartItem.saleTitle);
                  }
                  if (discount.title) {
                    if (Array.isArray(tempTitleArray)) {
                      tempTitleArray.push(discount.title);
                    }
                    if (!tempTitleArray) {
                      tempTitleArray.push(discount.title);
                    }
                  }
                  cartItem.saleTitle = tempTitleArray;
                  cartItem.onSale = true;
                }

                if (!applied && discount.methodID === "percent") {
                  applied = true;
                  let tempDiscountRate = +discount.rate;
                  let percent = false;
                  if (cartItem.saleRate > 0 && cartItem.saleRate < 1) {
                    percent = true;
                  }
                  if (cartItem.onSale && !cartItem?.saleTitle) {
                    let tTitle = "";
                    if (percent) {
                      tTitle = `${cartItem.saleRate * 100}% off`;
                    } else {
                      tTitle = `$${cartItem.saleRate} off`;
                    }
                    tempTitleArray.push(tTitle);
                  }
                  if (!cartItem.saleRate) {
                    cartItem.saleRate = 0;
                  }
                  if (cartItem.saleRate > 0 && cartItem.saleRate < 1) {
                    cartItem.saleRate = cartItem.saleRate * (cartItem.price * cartItem.qty);
                  }
                  if (!tempDiscountRate) {
                    tempDiscountRate = 0;
                  }
                  if (tempDiscountRate > 1) {
                    tempDiscountRate = tempDiscountRate / 100;
                  }
                  if (tempDiscountRate < 1 && tempDiscountRate > 0) {
                    tempDiscountRate = tempDiscountRate * (cartItem.price * cartItem.qty);
                  }
                  if (tempDiscountRate > 0) {
                    cartItem.saleRate += tempDiscountRate;
                  }
                  if (discount.title) {
                    if (Array.isArray(tempTitleArray)) {
                      tempTitleArray.push(discount.title);
                    }
                    if (!tempTitleArray) {
                      tempTitleArray.push(discount.title);
                    }
                  }
                  cartItem.saleTitle = tempTitleArray;
                  cartItem.onSale = true;
                }
                if (!applied && discount.methodID === "bogo") {
                  applied = true;
                  foundBogos += cartItem.qty;
                  reqBogos = discount.bogoQty;
                }
              } else {
                if (discount.methodID === "taxFree") {
                  cartItem.saleTitle = discount.title;
                }
              }
            }
          });
        });

        if (foundBogos && foundBogos >= reqBogos) {
          bogoTally = 0;
          defaultCart.map((cartItem: CartItems) => {
            let applied = false;
            discount.collectionIDs.map((collectionID: string) => {
              if (cartItem.queryIDs.includes(collectionID)) {
                if (!applied && discount.methodID === "bogo") {
                  if (bogoTally < discount.bogoQty && cartItem.qty < discount.bogoQty) {
                    let multiplyer = cartItem.qty;
                    if (cartItem.qty > discount.bogoQty - bogoTally) {
                      multiplyer = discount.bogoQty - bogoTally;
                    }
                    const customRate = (+discount.rate / +discount.bogoQty) * multiplyer;
                    cartItem.saleRate = customRate;
                    cartItem.onSale = true;
                    cartItem.saleTitle = discount.title;
                    bogoTally += Number(cartItem.qty);
                    applied = true;
                  }
                  if (bogoTally < discount.bogoQty && cartItem.qty >= discount.bogoQty) {
                    const customRate = (+discount.rate / +discount.bogoQty) * (discount.bogoQty - bogoTally);
                    cartItem.saleRate = customRate;
                    cartItem.onSale = true;
                    cartItem.saleTitle = discount.title;
                    bogoTally += +cartItem.qty;
                    applied = true;
                  }
                }
              }
            });
          });
        } else if (foundBogos && foundBogos < reqBogos) {

        }
      });

      for (const key in defaultCart) {
        const fireProduct: CartItems = defaultCart[key];
        if (typeof fireProduct === "object" && fireProduct !== null) {
          if (fireProduct?.id !== "items" && fireProduct?.id !== "totals") {
            tempArray.push(<CartItem {...{ fireProduct }} />);
          }
        }
      }
      if (tempArray?.length <= 0) {
        tempArray.push(<EmptyCart />);
      }
    }
    if (fireCartTotals.status === "loading") {
      const dummy = [0, 1, 2];
      for (const key in dummy) {
        tempArray.push(<CartItemSkeleton key={key} />);
      }
    }
    setCartComponentList(tempArray);
    //}, [fireCart.data, fireCartTotals.data, fireDiscounts.data])
  }, [fireCart.data, fireCartTotals.data, fireDiscounts.data, fireCustomer.data]);
  return <>{cartComponentList}</>;
};

const RemoveButton = ({ onClick }) => {
  const handleClick = (e: any) => {
    Boolean(onClick) && onClick(e);
  };
  return (
    <button onClick={handleClick} className="button-base">
      <SVGIcon name="delete" color="rgb(255,255,255)" size="standard" />
    </button>
  );
};
// const defaultTotals = new CartTotals(
//   0, // subtotal:number,
//   0, // deliveryFee:number,
//   0, //deliveryTotal
//   0, // stateTax: number,
//   0, // localTax: number,
//   0, // exciseTax: number,
//   0, // grandTotal: number,
//   0, // serviceFee: number,
//   0, // totalItemsSold: number,
//   0, // minOrder: number,
//   0, // freeDeliveryMin: number,
//   //settingsData.freeDeliveryMin, // productsTotal: number,
//   0, // productsPrice: number,
//   0, // taxableSubtotal: number,
//   0, // stateTaxTotal: number,
//   0, // exciseTaxTotal: number,
//   0, // localTaxTotal: number,
//   0, // combinedTaxTotal: number,
//   0, // wholesaleTotal: number,
//   0, // profitTotal: number,
//   0, // discountsTotal: number,
//   0, // discountsApplied: number,
//   false, // freeDelivery: boolean,
//   0, // totalSaved: number,
//   0, // creditsApplied: number,
//   0, // creditTotal: number,
//   0,
//   0, // discount: number,
//   0,
//   0
// );


function Cart({ as, href, fireFeature, scroll }) {
  const router = useRouter();
  const { query } = router;
  const {
    user,
    fireDiscounts,
    fireSettings,
    fireCartTotals,
    fireCart,
    customerID,
    setCustomerID,
    fireCustomer,
    setTotalsLoading,
    fireCredits,
  } = useUser();

  const [css, theme] = useStyletron();
  // const fireCredits = useFirestoreQuery(
  //   customerID && firebase.firestore().collection("users").doc(customerID).collection("Credits").where("used", "==", false)
  // );

  const { modalBaseDispatch } = useDispatchModalBase();
  const { modalDispatch, modalState } = useDispatchModal();

  const { setNavLoading, cartOpen, setCartOpen, navLoading, cartLoading, setCartLoading } = useRouting();
  const [checkingOut, setCheckingOut] = useState(false);

  //const [cartTotals, setCartTotals] = useState<CartTotals>({ ...defaultTotals });

  const cartTotals = getTotals()
  //alert(totals)



  useEffect(() => {
    if (fireCartTotals?.data?.loading) {
      setCartLoading(fireCartTotals?.data?.loading);
    }
    return () => {
      setCartLoading(false);
    };
  }, [fireCartTotals?.data]);

  useEffect(() => {
    return () => {
     // alert('cartTs erase')
      setCustomerID(null);
    };
  }, []);

 
  const openModal = (component: FC) => {
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
  const addPromoX = () => {
    //alert('hi')
    const component = () => <AddPromoCode {...{ fireFeature }} />;
    openModal(component);
  };
  const addPromo = () => {
    //alert('hi')
    const component = () => <PromoModal />;
    openModalBase(component, false, true);
  };
  const removePromoX = (discount: Discount) => {
    const component = () => <DeletePromo {...{ discount }} />;
    openModal(component);
  };
  const removePromo = (discount: Discount) => {
    const component = () => <DeletePromo {...{ discount }} />;
    openModalBase(component, false, true);
  };
  const removeCreditX = (discount: Credits) => {
    const component = () => <DeleteCredit {...{ discount }} />;
    openModal(component);
  };
  const removeCredit = (discount: Credits) => {
    const component = () => <DeleteCredit {...{ discount }} />;
    openModalBase(component, false, true);
  };
  const updateNameX = () => {
    const component = () => <EditDisplayName noClose={true} />;
    openModal(component);
  };
  const updateName = () => {
    const component = () => <EditDisplayName noClose={true} />;
    openModalBase(component, false, true);
  };

  // useEffect(() => {
  //   effect
  //   return () => {
  //     cleanup
  //   };
  // }, [fireCustomer?.data]);

  useEffect(() => {
    // if(checkingOut && !fireCustomer?.data?.coords){
    //   alert('no address')
    // }

    // if(checkingOut && !fireCustomer?.data?.phoneNumber){
    //   alert('no  phone')
    // }
    //const router = useRouter()
    //alert(JSON.stringify(router))
    setCartOpen(false);
    // if(checkingOut && modalState?.modal?.isOpen === false){
    //   //router.push("/[adminID]/create-order/menu", `/${user?.uid}/create-order/menu`, { shallow: true })
    // }

    if (checkingOut && modalState?.modal?.isOpen === false && !fireCustomer?.data?.displayName) {
      updateName();
    }

    if (
      checkingOut &&
      modalState?.modal?.isOpen === false &&
      fireCustomer?.data?.displayName &&
      fireCustomer?.data?.phoneNumber &&
      fireCustomer?.data?.coords
    ) {
      checkout();
    }
    // return () => {
    //   setCheckingOut(false)
    // };
  }, [checkingOut, modalState?.modal, fireCustomer?.data]);

  const checkout = async () => {
    setNavLoading(true);

    try {
      const _checkout = fireCloud("checkout");
      //const form = {discountID,userID}
      const response = await _checkout({ customerID: customerID });
      //console.log("deleteDiscount")
      //console.log(response?.data)
      if (response?.data?.success === true) {
        NotificationManager.success("Order Placed.");

        // alert(response?.data?.id)
        //bSMdsEafNfcyBoGszWdJCGUwHJV2/orders/selected/bSMdsEafNfcyBoGszWdJCGUwHJV2/7QezVDb3PBBArRT3rZLi
        router.push(`/${user.uid}/orders/selected/${customerID}/${response?.data?.id}`);

        //setTotalsLoading(true)
      }
    } catch (e) {
      NotificationManager.error(`${e?.message || e}`);
      //setTotalsLoading(false)
      // alert(e?.message)
    } finally {
      setNavLoading(false);
    }

    setCheckingOut(false);
  };
  useEffect(() => {
    setCheckingOut(false);
    return () => {
      setCheckingOut(false);
    };
  }, []);

  return (
    <>
      {/* <Link href={href} as={as}> */}
      <button
        onClick={() => setCartOpen(false)}
        className={`button-base side-menu-backdrop${cartOpen ? ` is-visible` : ``}`}
      />
      {/* </Link> */}
      <CartBackground className={`side-menu right cart-container${cartOpen ? ` is-visible` : ``}`}>
        <div className="cart-container-inner">
          <div className="module-flex">
            <Header className="cart-header-wrapper">
              <div className="cart-header-flex">
                <div className="center-cart-header">
                  <Label1>Cart</Label1>
                </div>
                <div className="left-cart-header" />
                <div className="right-cart-header">
                  {/* <Link href={href} as={as}> */}
                  <Button onClick={() => setCartOpen(false)} 
                    kind={KIND.secondary}
                    size={SIZE.mini}  
                    shape={SHAPE.square}
                    >
                    <SVGIcon name="x" />
                  </Button>
                  {/* </Link> */}
                </div>
              </div>
            </Header>
            <div className="cart-scroll-containter">
              <div className="display-block-mw735 cart-flex-containter">
                <div style={{ maxWidth: "100%" }}>
                  {/* Product */}
                  <CartList />
                  {/* Totals */}
                  {fireCart?.status === "success" && fireCart.data?.length > 0 && (
                    <div className="cart-total-section" style={{ position: "relative" }}>
                      <section>
                        <div className={`totals-overlay${cartLoading ? "" : ` fadeOut`}`}>
                          <Spinner color={"rgb(0,200,5)"} style={null} />
                        </div>
                        <Line className="border-line" />
                        <div className="section-flex">
                          <div className="cart-margin">
                            {(fireDiscounts?.data || fireCredits?.data) && (
                              <div style={{ margin: "0 10px 0 10px" }}>
                                {/* //fireCredits */}
                                {fireCredits?.data &&
                                  fireCredits?.data.map((discount: Credits) => (
                                    <div
                                      style={{
                                        alignItems: "center",
                                        display: "flex",
                                        padding: "10px",
                                        borderRadius: "8px",
                                        width: "100%",
                                        color: "white",
                                        margin: "0 0 16px 0",
                                        backgroundColor: "rgb(212, 54, 132)",
                                        boxShadow: "0 1px 2px 0 rgb(60 64 67 / 30%), 0 1px 3px 1px rgb(60 64 67 / 15%)",
                                        backgroundImage:
                                          "url(https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2FDollarBillsYall2.png?alt=media&token=ba79a182-7cfa-4e3a-bac9-2eb45921bfff)",
                                      }}
                                    >
                                      <div style={{ flex: 3 }}>
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            fontWeight: 500,
                                          }}
                                        >{`${discount.title}${String.fromCharCode(160)}`}</div>
                                        <div style={{ fontSize: "12px" }}>{`Using ${isCurr(
                                          +cartTotals.initialCredit - +cartTotals.creditRemainder
                                        )} of ${isCurr(+cartTotals.initialCredit)}.`}</div>
                                      </div>
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          padding: "6px",
                                          backgroundColor: "rgba(255, 255, 255, 0.35)",
                                          height: "35px",
                                          borderRadius: "10px",
                                          width: "35px",
                                          justifyContent: "center",
                                        }}
                                      >
                                        {/* <SVGIcon name="refund" size="standard" color="#fff" /> */}
                                        <RemoveButton onClick={() => removeCredit(discount)} />
                                      </div>
                                    </div>
                                  ))}

                                {fireDiscounts?.data &&
                                  fireDiscounts?.data.map((discount: Discount) => (
                                    <div
                                      style={{
                                        alignItems: "center",
                                        display: "flex",
                                        padding: "10px",
                                        borderRadius: "8px",
                                        width: "100%",
                                        color: "white",
                                        margin: "0 0 16px 0",
                                        backgroundColor: "rgb(212, 54, 132)",
                                        boxShadow: "0 1px 2px 0 rgb(60 64 67 / 30%), 0 1px 3px 1px rgb(60 64 67 / 15%)",
                                        backgroundImage:
                                          "url(https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2FDollarBillsYall2.png?alt=media&token=ba79a182-7cfa-4e3a-bac9-2eb45921bfff)",
                                      }}
                                    >
                                      <div style={{ flex: 3 }}>
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            fontWeight: 500,
                                          }}
                                        >
                                          {`${discount.title}${String.fromCharCode(160)}`}
                                          {discount.stackable && (
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              height="18px"
                                              viewBox="0 0 24 24"
                                              width="18px"
                                              fill="#FFFFFF"
                                            >
                                              <path d="M0 0h24v24H0V0z" fill="none" />
                                              <path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16zm0-11.47L17.74 9 12 13.47 6.26 9 12 4.53z" />
                                            </svg>
                                          )}
                                        </div>

                                        {cartTotals?.discountsTotal && (
                                          <div style={{ fontSize: "12px" }}>
                                            You saved {isCurr(cartTotals.discountsTotal)}
                                          </div>
                                        )}
                                        {/* {discount.methodID === "bogo" && (
                                          <div style={{ fontSize: "12px" }}>You saved {isCurr(discount.rate)}</div>
                                        )}
                                        {discount.methodID === "flatRate" && (
                                          <div style={{ fontSize: "12px" }}>You saved {isCurr(flatRateSaved)}</div>
                                        )}
                                        {taxesSaved > 0 && <div style={{ fontSize: "12px" }}>You saved {isCurr(taxesSaved)}</div>}
                                        {discount.methodID === "percent" && discount.stackable === false && (
                                          <div style={{ fontSize: "12px" }}>You saved {isCurr(discountState)}</div>
                                        )} */}
                                      </div>
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          padding: "6px",
                                          backgroundColor: "rgba(255, 255, 255, 0.35)",
                                          height: "35px",
                                          borderRadius: "10px",
                                          width: "35px",
                                          justifyContent: "center",
                                        }}
                                      >
                                        {/* <SVGIcon name='delete' color='rgb(255,255,255)' size='standard' />   */}
                                        <RemoveButton onClick={() => removePromo(discount)} />
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}

                            <div className="totals-list">
                              {/* <div className={`totals-overlay${fireCartTotals?.data?.loading ? "" : ` fadeOut`}`}>
                                <Spinner color={"rgb(0,200,5)"} style={null} />
                              </div> */}
                              <TotalsRow
                                label={"Subtotal"}
                                variant={false}
                                value={
                                  Boolean(cartTotals?.taxableSubtotal < cartTotals?.subtotal) ? (
                                    <>
                                      <span>
                                        {cartTotals?.taxableSubtotal.toLocaleString("en-US", {
                                          style: "currency",
                                          currency: "USD",
                                        })}
                                      </span>
                                      {`${String.fromCharCode(160)}`}
                                      <Strike>
                                        {cartTotals?.subtotal.toLocaleString("en-US", {
                                          style: "currency",
                                          currency: "USD",
                                        })}
                                      </Strike>
                                    </>
                                  ) : (
                                    <span>
                                      {cartTotals?.subtotal
                                        ? cartTotals?.subtotal.toLocaleString("en-US", {
                                            style: "currency",
                                            currency: "USD",
                                          })
                                        : `$0.00`}
                                    </span>
                                  )
                                }
                              />
                              {/* <TotalsRow
                                label={"Delivery Fee"}
                                variant={false}
                                value={
                                  priceTotal >= Number(fireSettings?.data?.freeDeliveryMin) ? (
                                    <>
                                      {`${isCurr(0)}`}
                                      {`${String.fromCharCode(160)}`}
                                      <Strike>{`${isCurr(fireSettings?.data?.deliveryFee)}`}</Strike>
                                    </>
                                  ) : (
                                    `+${isCurr(fireSettings?.data?.deliveryFee)}`
                                  )
                                }
                              /> */}
                              {Boolean(cartTotals?.deliveryFee) && (
                                <TotalsRow
                                  variant={null}
                                  label={"Delivery Fee"}
                                  value={
                                    Boolean(cartTotals?.deliveryTotal < cartTotals?.deliveryFee) ? (
                                      <>
                                        <span>
                                          {cartTotals?.deliveryTotal.toLocaleString("en-US", {
                                            style: "currency",
                                            currency: "USD",
                                          })}
                                        </span>
                                        {`${String.fromCharCode(160)}`}
                                        <Strike>
                                          {cartTotals?.deliveryFee.toLocaleString("en-US", {
                                            style: "currency",
                                            currency: "USD",
                                          })}
                                        </Strike>
                                      </>
                                    ) : (
                                      <span>
                                        {cartTotals?.deliveryFee
                                          ? cartTotals?.deliveryFee.toLocaleString("en-US", {
                                              style: "currency",
                                              currency: "USD",
                                            })
                                          : `$0.00`}
                                      </span>
                                    )
                                  }
                                />
                              )}
                              {Boolean(cartTotals?.serviceFee) && (
                                <TotalsRow
                                  variant={null}
                                  label={"Service Fee"}
                                  value={
                                    Boolean(cartTotals?.serviceFeeTotal < cartTotals?.serviceFee) ? (
                                      <>
                                        <span>
                                          {cartTotals?.serviceFeeTotal.toLocaleString("en-US", {
                                            style: "currency",
                                            currency: "USD",
                                          })}
                                        </span>
                                        <span>
                                          {`${String.fromCharCode(160)}`}
                                          <Strike>
                                            {cartTotals?.serviceFee.toLocaleString("en-US", {
                                              style: "currency",
                                              currency: "USD",
                                            })}
                                          </Strike>
                                        </span>
                                      </>
                                    ) : (
                                      <span>
                                        {cartTotals?.serviceFee
                                          ? cartTotals?.serviceFee.toLocaleString("en-US", {
                                              style: "currency",
                                              currency: "USD",
                                            })
                                          : `$0.00`}
                                      </span>
                                    )
                                  }
                                />
                              )}
                              {/* <TotalsRow
                                variant={false}
                                label={"Service Fee"}
                                value={`+${isCurr(fireSettings?.data?.serviceFee)}`}
                              /> */}
                              <TotalsRow
                                variant={false}
                                label={`Excise Tax ${cartTotals.exciseTax * 100}%`}
                                value={`+${isCurr(cartTotals.exciseTaxTotal)}`}
                              />
                              <TotalsRow
                                variant={false}
                                label={`Local Tax ${cartTotals.localTax * 100}%`}
                                value={`+${isCurr(cartTotals.localTaxTotal)}`}
                              />
                              <TotalsRow
                                variant={false}
                                label={`State Tax ${cartTotals.stateTax * 100}%`}
                                value={`+${isCurr(cartTotals.stateTaxTotal)}`}
                              />
                              <TotalsRow
                                variant="bold"
                                label={"Total"}
                                value={`${
                                  // isTaxFree
                                  //   ? isCurr(fromCents(+subTotalState, 2))
                                  //   : isCurr(grandTotal)
                                  isCurr(cartTotals.grandTotal)
                                }`}
                              />
                              <TotalsRow variant="red" label={"You saved"} value={`${isCurr(cartTotals.totalSaved)}`} />
                              <div className="cart-margin">
                                <Button
                                  //disabled={navLoading}
                                  isLoading={false}
                                  onClick={addPromo}
                                  //variant="green-outline"
                                  disabled={Boolean(fireDiscounts?.data?.length) || Boolean(fireCredits?.data?.length)}
                                  //fullWidth
                                  
                        overrides={{
                          BaseButton: {
                            style: ({ $theme }) => ({
                              width:'100%'
                            })
                          }
                        }}
                                >{
                                    //fireCartTotals?.data?.hasCoupon
                                    Boolean(fireCredits?.data?.length)
                                      ? ` Credit Applied `
                                      : fireDiscounts?.data?.length
                                      ? "Discount Applied"
                                      : "Add Promo"
                                  }</Button>
                              </div>
                            </div>
                          
                          </div>
                        </div>
                      </section>
                      <div style={{ width: "100%", height: "185px" }} />
                    </div>
                  )}

                  {cartTotals && 
                  <Accordion >
                      <Panel title="Dev Totals">{
                        <>
                          {
                            cartTotals &&
                            Object.keys(cartTotals).map(function (key, index) {
                              //alert(fireProductDefault[key])
                              return <div>{`${key} : ${JSON.stringify(cartTotals[key])}`}</div>;
                            })
                          }
                        </>
                      }</Panel>
                    </Accordion>}

                  {/* Loading */}
                  {fireCartTotals?.status !== "success" && (
                    <div className="cart-total-section">
                      <section>
                        <Line className="border-line" />
                        <div style={{ marginTop: "26px" }} className="section-flex">
                          <CartTotalsSkeleton />
                          <CartTotalsSkeleton />
                          <CartTotalsSkeleton />
                        </div>
                      </section>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {
              <div className="display-block-mw735" style={{ paddingBottom: 0 }}>
                <div className="module-wrapper module-wrapper" style={{ marginBottom: 0 }}>
                  <Footer className="cart-button-bottom-border">
                    <div className="dual-input">
                      {/* <Link href={"/[adminID]/create-order/menu"} as={`/${user?.uid}/create-order/menu`} > */}
                      <Button
                        disabled={navLoading || fireCartTotals?.data?.loading}
                        isLoading={["idle", "loading"].includes(fireCartTotals.status)}
                        onClick={() => setCheckingOut(true)}
                        overrides={{
                          BaseButton: {
                            style: ({ $theme }) => ({
                              width:'100%'
                            })
                          }
                        }}
                        // spinnerColor={
                        //   ["idle", "loading"].includes(fireCartTotals.status)
                        //     ? "rgba(255,255,255,0.87)"
                        //     : "rgb(0,200,5)"
                        // }
                        // fullWidth
                        // variant="green"
                      >{"Place Order"}</Button>
                      {/* </Link> */}
                    </div>
                  </Footer>
                </div>
              </div>
            }
          </div>
        </div>
      </CartBackground>
    </>
  );
}

export default Cart
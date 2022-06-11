import React, { useEffect } from "react";
import { withStyle, useStyletron } from "baseui";
import { Block } from "baseui/block";
import firebase, {
  updateFirestore,
  getMatrix,
  //getMapboxDirectionsX,
  updateFirestoreGroup,
} from "../../../firebase/clientApp";
import { Check, DeleteAlt } from 'baseui/icon';
import { ChevronRight, ChevronLeft } from "baseui/icon";
//import { StyledHead, StyledHeadCell, StyledBody, StyledRow, StyledCell, StyledAction } from "baseui/table";
import SVGIcon from "../../SVGIcon";
import { useDispatchModalBase } from "../../../context/Modal";
import { StyledTable, StyledHead, StyledHeadCell, StyledBody, StyledRow, StyledCell, StyledAction } from "baseui/table";
import { Caption1, Caption2, Display, H3, H5, Label1, Label2, Label4, Paragraph1, Paragraph2, Paragraph3 } from "baseui/typography";
import { Theme } from "baseui/theme";
import { styled } from "baseui";
import { TriangleDown } from "baseui/icon";
import { StatefulMenu } from "baseui/menu";
import { Pagination, StatefulPagination } from "baseui/pagination";
import { StatefulPopover, PLACEMENT } from "baseui/popover";
import { Button, KIND, SIZE, SHAPE } from "baseui/button";
import { useQuery } from "../../../context/Query";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { expandBorderStyles } from "baseui/styles";
import { capitalize, isCurr } from "../../../helpers";
import { Spinner, StyledSpinnerNext } from "baseui/spinner";
import { ReactElement } from "react";
import { Tag, VARIANT, KIND as _KIND } from "baseui/tag";
import { useScreen } from "../../../context/screenContext";
import { useRouter } from "next/router"
import { useUser } from "../../../context/userContext"
import { useUsers } from "../../../context/usersContext";



import { Avatar } from 'baseui/avatar';
import Driver from "./modals/Driver";
import ChangeDriver from "./modals/ChangeDriver";
import ChangeProgress from "./modals/ChangeProgress";
import ResetOrder from "./modals/ResetOrder";
import Paid from "./modals/Paid";
import { useForm } from "../../../context/formContext";
import { useSnackbar, DURATION } from "baseui/snackbar";
import { VIPClass } from "../../../classes";
// interface CallableContext {
//   auth?: {
//     uid: string;
//     token: admin.auth.DecodedIdToken;
//   };
//   instanceIdToken?: string;
//   //rawRequest: Request;
// }
type OrderForm = {
  customerID: string;
};
type Selected = {
  label: string;
  value: string;
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
  saleTitle: string;
  comparePrice: number | null;
};
type Discounts = {
  active: boolean;
  alert: boolean;
  alertSent: boolean;
  bogoQty?: number;
  code: string;
  collectionIDs: string[];
  collections: Selected[];
  dateEnd?: any;
  dateStart: any;
  days: string[];
  featured: boolean;
  filters: string[] | null;
  id: string;
  method: Selected;
  methodID: "flatRate" | "percent" | "taxFree" | "bogo";
  rate: number;
  recurring: boolean;
  recurringDays: Selected[] | undefined;
  sort: "credit" | "coupon" | "refund";
  stackable: boolean;
  title: string | null;
  type: { [k: string]: any } | undefined;
  uid: string | null;
  used: boolean;
  //queryIDs: string[];
};
class CartTotals {
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
    //this.discount = discount;
  }
}
interface Customer {
  name: string;
  uid: string;
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  phoneNumber: string;
  disabled: boolean;
  metadata: { creationTime: Date };
  role: "manager" | "customer" | "dispatcher" | "driver";
  status: "accepted" | "pending" | "denied";
  address: string;
  coords: number[];
  inRange: boolean;
}

type Credits = {
  amount: number;
  initialAmount: number;
  created: any;
  id: string;
  title: string;
  used: boolean;
  user: string;
};

class OrderClass {
  user: string;
  id?: string;
  phoneNumber: string;
  displayName: string | false;
  photoURL: string | false;
  address: string;
  coordinates: number[];
  cartTotals: CartTotals;
  cartItems: CartItems[];
  discounts: Discounts[] | [];
  credits: Credits[] | [];
  instructions: string | false;
  progress: string;
  start: any;
  end?: any;
  settled: boolean;
  driver: string | false;
  driverName?: string | false;
  driverPhone?: string | false;
  refund: boolean;
  constructor(
    user: string,
    //id:string,
    phoneNumber: string,
    displayName: string | false,
    photoURL: string | false,
    address: string,
    coords: number[],
    cartTotals: CartTotals,
    cartItems: CartItems[],
    discounts: Discounts[] | [],
    credits: Credits[] | [],
    start: any,
  ) {
    //this.id = id;
    this.user = user;
    this.phoneNumber = phoneNumber;
    this.displayName = displayName;
    this.photoURL = photoURL;
    this.address = address;
    this.coordinates = coords;
    this.cartTotals = cartTotals;
    this.cartItems = cartItems;
    this.discounts = discounts;
    this.credits = credits;
    this.instructions = false;
    this.progress = "received";
    this.start = start;
    this.end = false;
    this.settled = false;
    this.driver = false;
    this.driverName = false;
    this.driverPhone = false;
    this.refund = false;
  }
}

const Indicator = styled("div", ({ $isActive = false, $theme, $featured = false }) => {
  return {
    height: "8px",
    width: "8px",
    borderRadius: "100%",
    backgroundColor: $isActive ? $theme.colors.positive300 : $theme.colors.positive50,
  };
});
const CellWrapper = styled("div", ({ $theme }) => {
  return {
    justifyContent:'center',
    minHeight: "100%",
    width: "100%",
    display: "flex",
    //minHeight: "46px",
    height: "46px",
    alignItems: "center",
    "@media (max-width: 450px)": {
      minHeight: "100%",
      //minHeight: "40px",
      height: "40px",
    },
  };
});
// const PageNum = styled("div", ({ $theme }) => {
//     return {

//     };
//   });

const TagWrapper = styled("div", ({ $theme }) => {
  return {
    minHeight: "100%",
    width: "100%",
    display: "flex",
    //minHeight: "46px",
    height: "78px",
    alignItems: "center",
    "@media (max-width: 450px)": {
      minHeight: "100%",
      //minHeight: "40px",
      height: "40px",
    },
  };
});
const QueryLoader = styled("div", ({ $theme, $isDark }) => {
  return {
    position: "absolute",
    width: "100%",
    display: "flex",
    //height:'auto',
    backgroundColor: $isDark ? `rgba(51, 51, 51, 0.5)` : `rgba(255, 255, 255, 0.6)`,
    //bottom:'85px',
    top: "45px",
    alignItems: "center",
    justifyContent: "center",
    transition: `background-color 0.2s ease`,
    zIndex: 20,
  };
});
const Results = styled("div", ({ $theme, $isDark }) => {
  return {
    position: "absolute",
    width: "100%",
    display: "flex",
    //height:'auto',
    //backgroundColor: $isDark ? `rgba(51, 51, 51, 0.5)` : `rgba(255, 255, 255, 0.6)`,
    //bottom:'85px',
    top: "45px",
    alignItems: "center",
    justifyContent: "center",
    transition: `background-color 0.2s ease`,
    zIndex: 20,
  };
});

const StyledHeadCellMod = styled(StyledHeadCell, ({ $theme, $isDark }) => {
  return {
    justifyContent: "center!important",
    padding:'0px',
    height:'32px',
    display:'flex',
    alignItems:'center',
    alignContent:'center',
    //justifyContent:'center',
  };
});
const StyledBorderCell = withStyle<typeof StyledCell, Theme>(StyledCell, ({ $theme }) => ({
  borderBottom: `1px solid ${$theme.borders.border600.borderColor}`,
  borderRight: `1px solid ${$theme.borders.border600.borderColor}`,
  height: '79px',
  padding:'0px'
}));
const CustomTable = withStyle<typeof StyledTable, Theme>(StyledTable, ({ $theme }) => ({
  marginBottom: '0px'
}));

export default function VIPSTable() {
  const [css, theme] = useStyletron();
  const [dataState, setDataState] = React.useState([]);
  const { modalBaseDispatch, modalBaseState } = useDispatchModalBase();
  const { toggleTheme, themeState } = useScreen();
  const router = useRouter()
  const { user } = useUser()
  const { enqueue, dequeue } = useSnackbar();
  //const router = useRouter()
  //const [page, setPage] = React.useState(1);
  //const [limit, setLimit] = React.useState(12);
  const {
    form,
    setForm,
    error,
    setError,
    loading,
    setLoading,
    isSideOpen,
    setIsSideOpen,
  } = useForm();
  const { width, height } = useWindowSize();
  const isMobile = Boolean(width < 620);
  const {
    maxPage,
    disableNext,
    disablePrev,
    page,
    limit,
    setLimit,
    orderBy,
    setOrderBy,
    nextPage,
    prevPage,
    dataList,
    setTotalsField,
    queryLoader,
    setTotalsDoc,
    setTotalsCollection,
    setQueryGroupCollection,
    setWhere,
    setQueryCollection,
    fireStoreQuery,
  } = useQuery();

  React.useEffect(() => {
    if (dataList.length && !queryLoader) {
      setDataState(dataList);
    } else if (!dataList.length && !queryLoader) {
      setDataState([]);
    }
  }, [dataList, queryLoader]);


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


  const addDriver = (row: OrderClass) => {

    //alert('hi')
    const component = () => <Driver order={row} />;
    openModalBase(component, false, true);
  };

  const changeDriver = (row: OrderClass) => {

    //alert('hi')
    const component = () => <ChangeDriver order={row} />;
    openModalBase(component, false, true);
  };

  const changeProgress = (row: OrderClass) => {

    //alert('hi')
    const component = () => <ChangeProgress order={row} />;
    openModalBase(component, false, true);
  };
  
  const resetOrder = (row: OrderClass) => {
    const component = () => <ResetOrder order={row} />;
    openModalBase(component, false, true);
  };
  
  const markPaid = (row: OrderClass) => {
    const component = () => <Paid order={row} />;
    openModalBase(component, false, true);
  };
  const handleReset = async (order: OrderClass) => {
    setLoading(true)
    enqueue({ message: "Reseting order", progress: true }, DURATION.infinite);
    setTimeout(async () => {
      try {
        //const FieldValue = firebase.firestore.FieldValue
        await updateFirestoreGroup("users", order.user, "Orders", order.id, {
          progress: 'received',
          driver: false,
          driverName: false,
        })
        setIsSideOpen(false)
        dequeue();
        enqueue({ message: "Order reset", startEnhancer: ({ size }) => <Check size={size} /> }, DURATION.short);
      } catch (e) {
        setError((oldError) => ({ ...oldError, ...{ server: `Error reseting order.` } }));
        dequeue();
        //showToast(`${error?.message || error}`);
        enqueue({ message: `Error reseting order`, startEnhancer: ({ size }) => <DeleteAlt size={size} /> }, DURATION.short);
      } finally {
        setLoading(false)
      }
    }, 2000);
  }


  /* add shit to the query questions*/
  useEffect(() => {
    setTotalsField(`total`);
    setTotalsDoc("ArrivalVIPs");
    setTotalsCollection("Totals")
    
    setQueryCollection("ArrivalVIPs");
    setOrderBy("firstName");
    // if(router?.query?.filter){
    //   setWhere([["progress", "in", orderProgressObject[`${router?.query?.filter}`] ], ["settled", "==", false]])
    // }
    setLimit(5);
    return () => {
      setTotalsField(null);
      setTotalsDoc(null);
      setTotalsCollection(null)
      setQueryGroupCollection(null);
      setQueryCollection(null);
      setLimit(5);
      setOrderBy(null);
      setWhere(null)
    };
    // }, [router]);
  }, [router]);

  useEffect(() => {
    console.log(`fireStoreQuery`)
    console.log(fireStoreQuery)
  }, [fireStoreQuery]);

  return (

    <CustomTable>
      <StyledHead $width="100%">
        {/* {!isMobile && <StyledHeadCell style={{ minWidth: "80px", flex: 0 }}>{""}</StyledHeadCell>} */}
        <StyledHeadCellMod style={{ flex: 2 }}> <Label4>Name</Label4></StyledHeadCellMod>
        {/* {!isMobile && <StyledHeadCell style={{ flex: 2 }}>Schedule</StyledHeadCell>} */}
        {<StyledHeadCellMod style={{ flex: 1 }}> <Label4>Room</Label4></StyledHeadCellMod>}
        {!isMobile && <StyledHeadCellMod style={{ flex: 1 }}> <Label4>Arrival</Label4></StyledHeadCellMod>}
        {!isMobile && <StyledHeadCellMod style={{ flex: 1 }}> <Label4>Departure</Label4></StyledHeadCellMod>}
        {!isMobile && <StyledHeadCellMod style={{ flex: 1 }}> <Label4>Code</Label4></StyledHeadCellMod>}
        {!isMobile && <StyledHeadCellMod style={{ flex: 3 }}> <Label4>Notes</Label4></StyledHeadCellMod>}
        {<StyledHeadCellMod style={{ flex: 1 }}> <Label4>Status</Label4></StyledHeadCellMod>}
        {/* {!isMobile && <StyledHeadCell style={{ flex: 1 }}>Items</StyledHeadCell>} */}
        {/* <StyledHeadCell style={{ minWidth: "80px", flex: 0 }}>{""}</StyledHeadCell> */}
      </StyledHead>
      <StyledBody $width="100%" style={{ minHeight: `${limit * (width > 450 ? 79 : 73)}px` }}>
        {queryLoader && (
          <QueryLoader $isDark={themeState?.dark} style={{ minHeight: `${limit * (width > 450 ? 79 : 73) - 2}px` }}>
            <StyledSpinnerNext size={32} />
          </QueryLoader>
        )}
        {(!queryLoader && dataState.length === 0) && (
          <Results $isDark={themeState?.dark} style={{ minHeight: `${limit * (width > 450 ? 79 : 73) - 2}px` }}>
            <Paragraph2>{`No results`}</Paragraph2>
          </Results>
        )}
        {dataState &&
          dataState.map((row: VIPClass, index: number) => (
            <StyledRow key={index}>
              {!isMobile && <StyledBorderCell style={{ flex: 2 }}>
                <CellWrapper>
                  <Label4>{`${row?.lastName}, ${row?.firstName}`}</Label4>
                </CellWrapper>
              </StyledBorderCell>}
              {!isMobile && <StyledBorderCell style={{ flex: 1 }}>
                <CellWrapper>
                  <Label4>{`${row?.roomNumber}`}</Label4>
                </CellWrapper>
              </StyledBorderCell>}
              {!isMobile && <StyledBorderCell style={{ flex: 1 }}>
                <CellWrapper>
                  <Label4>{`${`${row?.arrival}`.substring(4)}`}</Label4>
                </CellWrapper>
              </StyledBorderCell>}
              {!isMobile && <StyledBorderCell style={{ flex: 1 }}>
                <CellWrapper>
                  <Label4>{`${`${row?.departure}`.substring(4)}`}</Label4>
                </CellWrapper>
              </StyledBorderCell>}
              {!isMobile && <StyledBorderCell style={{ flex: 1 }}>
                <CellWrapper>
                  <Label4>{`${row?.rateCode}`}</Label4>
                </CellWrapper>
              </StyledBorderCell>}
              {!isMobile && <StyledBorderCell style={{ flex: 3 }}>
                <CellWrapper>
                  <Label4>{`${row?.notes}`}</Label4>
                </CellWrapper>
              </StyledBorderCell>}
              {!isMobile && <StyledBorderCell style={{ flex: 1 }}>
                <CellWrapper>
                  <Label4>{`${row?.vipStatus}`}</Label4>
                </CellWrapper>
              </StyledBorderCell>}
            </StyledRow>
          ))}
      </StyledBody>
      <div
        className={css({
          paddingTop: theme.sizing.scale600,
          paddingBottom: theme.sizing.scale200,
          paddingRight: theme.sizing.scale400,
          paddingLeft: theme.sizing.scale800,
          display: "flex",
          justifyContent: "space-between",
          "@media (max-width: 620px)": {
            justifyContent: "flex-end",
          },
        })}
      >
        {!isMobile && (
          <StatefulPopover
            content={({ close }) => (
              <StatefulMenu
                items={Array.from({ length: 3 }, (_, i) => ({
                  label: (i + 1) * 5,
                }))}
                onItemSelect={({ item }) => {
                  setLimit(Number(item.label));
                  close();
                }}
                overrides={{
                  List: {
                    style: { height: "150px", width: "100px" },
                  },
                }}
              />
            )}
            placement={PLACEMENT.bottom}
          >
            <Button kind={KIND.tertiary} endEnhancer={TriangleDown}>
              {`${limit} Rows`}
            </Button>
          </StatefulPopover>
        )}
        <Pagination
          numPages={maxPage}
          currentPage={page}
          overrides={{
            PrevButton: {
              component: ({ onClick }: any) => (
                <Button kind={KIND.minimal} size={SIZE.compact} disabled={disablePrev} onClick={prevPage}>
                  <ChevronLeft size={24} />
                </Button>
              ),
            },
            NextButton: {
              component: ({ onClick }: any) => (
                <Button disabled={disableNext} kind={KIND.minimal} size={SIZE.compact} onClick={nextPage}>
                  <ChevronRight size={24} />
                </Button>
              ),
            },
            MaxLabel: {
              style: ({ $theme }) => ({
                ...$theme.typography.font300,
                marginRight: $theme.sizing.scale600,
                marginLeft: `5px`,
              }),
            },
            DropdownContainer: {
              style: ({ $theme }) => ({
                marginLeft: $theme.sizing.scale600,
              }),
            },
            Select: {
              component: ({ onClick }: any) => <div style={{ width: `0px`, fontWeight: 400 }}>{`${page}`}</div>,
              props: {
                overrides: {
                  Root: {
                    style: ({ $theme, $disabled, $isFocused, $isPseudoFocused, $error }: any) => ({
                      marginRight: "0px",
                      fontWeight: 100,
                    }),
                  },
                  ValueContainer: {
                    style: ({ $theme }) => ({
                      marginRight: `0px`,
                    }),
                  },
                  // ControlContainer: {
                  //   style: ({ $theme, $disabled, $isFocused, $isPseudoFocused, $error }: any) => ({
                  //     height: "45px",
                  //     borderLeftColor: "transparent",
                  //     borderRightColor: "transparent",
                  //     borderTopColor: "transparent",
                  //     borderBottomColor: "transparent",
                  //     boxShadow: "none",
                  //     backgroundColor: $disabled
                  //       ? $theme.colors.buttonDisabledFill
                  //       : $isFocused || $isPseudoFocused
                  //         ? $theme.colors.buttonSecondaryHover
                  //         : $error
                  //           ? $theme.colors.negative50
                  //           : $theme.colors.buttonSecondaryFill,
                  //   }),
                  // },
                  // SingleValue: {
                  //   style: ({ $theme }: any) => ({
                  //     position: "relative",
                  //     paddingTop: "0",
                  //     paddingBottom: "0",
                  //     paddingLeft: $theme.sizing.scale200,
                  //     paddingRight: $theme.sizing.scale500,
                  //     color: $theme.colors.buttonTertiaryText,
                  //     ...$theme.typography.font350,
                  //   }),
                  // },
                  // SelectArrow: {
                  //   style: ({ $theme }: any) => ({
                  //     width: "24px",
                  //     height: "24px",
                  //     color: $theme.colors.buttonTertiaryText,
                  //   }),
                  // },
                },
              },
            },
          }}
        />
      </div>
    </CustomTable>

  );
}

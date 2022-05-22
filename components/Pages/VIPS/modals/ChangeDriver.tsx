import { useState, useEffect, useRef, Fragment, useCallback } from "react";
import { capitalize, isEmpty, PROGRESS } from "../../../../helpers";
import firebase, {
  updateFirestore,
  getUserByPhone,
  deleteAuthUser,
  mergeFirestore,
  updateFirestoreGroup,
  fireCloud,
  addCredit,
  findAddCustomer,
  createAuthUser
} from "../../../../firebase/clientApp"
import parsePhoneNumber, { AsYouType } from "libphonenumber-js"
import { Card, StyledBody, StyledAction } from 'baseui/card';
import { useUser } from "../../../../context/userContext";
import { useFirestoreQuery } from "../../../../hooks/useFirestoreQuery";
import { useRouting } from "../../../../context/routingContext";
import { useWindowSize } from "../../../../hooks/useWindowSize";
import { FormInput } from "../../../Console";
import { NotificationManager } from "react-notifications";
import { useForm } from "../../../../context/formContext";
import { Label2, Paragraph4 } from "baseui/typography";
import { Checkbox, LABEL_PLACEMENT } from "baseui/checkbox";
import { styled } from "baseui";
import { ModalHeader, ModalBody, ModalFooter, ModalButton } from "baseui/modal";
import { KIND as ButtonKind } from "baseui/button";
import { Button } from "baseui/button";
import { ButtonGroup, MODE } from "baseui/button-group";
import { Input } from "baseui/input";
import { Check, Delete, DeleteAlt } from "baseui/icon";
import { DatePicker } from "baseui/datepicker";
import { TimePicker } from "baseui/timepicker";
import { ThemeProvider, createTheme, lightThemePrimitives } from "baseui";
import { FormControl } from "baseui/form-control";
import { Select, TYPE } from "baseui/select";
import { useSnackbar, DURATION } from "baseui/snackbar";
import { useDispatchModalBase } from "../../../../context/Modal";
import { Toast, KIND, ToasterContainer, toaster, PLACEMENT } from "baseui/toast";
import { Tag, VARIANT } from "baseui/tag";
import SVGIcon from "../../../SVGIcon";
import { useQuery } from "../../../../context/Query";
import { Accordion, Panel } from 'baseui/accordion';
import { PhoneInputNext, COUNTRIES, PhoneInputLite } from 'baseui/phone-input';
import { FileUploader } from "baseui/file-uploader";

const options = { timeZone: "America/Los_Angeles" };
let d: any = new Date().toLocaleString("en-US", options);
const start = new Date(d);
const end = new Date(d);
start.setUTCHours(0, 0, 0, 0);
end.setUTCHours(1, 0, 0, 0);


interface Collection {
  active: boolean | null;
  cartLimit: number | null;
  description: string | null;
  featured: boolean | null;
  flower: boolean | null;
  genome: boolean | null;
  id?: string | null;
  img: string | null;
  filePath: string | null;
  key: string | null;
  menuOrder?: number | null;
  onSale: boolean | null;
  saleCode: string | null;
  saleTitle: string | null;
  saleRate: number | null;
  sales?: number | null;
  sold?: number | null;
  title: string | null;
  total?: number | null;
  weight: boolean | null;
}
interface Brand {
  //key?:string,
  active: boolean | null;
  title: string | null;
  description: string | null;
  total?: number | null;
  cartLimit: number | null;
  onSale: boolean | null;
  saleRate: number | null;
  menuOrder?: number | null;
  featured: boolean | null;
  sold?: number | null;
  sales?: number | null;
  id?: string | null;
  img: string | null;
  filePath: string | null;
}
type Selected = {
  label: string | number | Date;
  value: string | number | Date;
};

class DriverClass {
  driver: Selected;
  constructor(
    driver: Selected,
  ) {
    this.driver = driver;
  }
}
interface Errors {
  title?: string;
  code?: string;
  method?: string;
  collections?: string;
  dateStart?: string;
  dateEnd?: string;
  time?: string;
  endHour?: string;
  startHour?: string;
  recurringDays?: string;
  server?: string;
}


const methods: Selected[] = [
  { value: "flatRate", label: "Flat" },
  { value: "percent", label: "Percent" },
  { value: "taxFree", label: "No Tax" },
  { value: "bogo", label: "Bogo" },
];
const formStyle = {
  width: `424px`,
  maxWidth: "100%",
  margin: "auto",
};
// const FormSection = styled("section", {
//   width: `100%`,
//   maxWidth: "100%",
//   marginBottom: "36px",
//   paddingTop: "18px",
//   //marginTop:'18px',
//   //height:'120px',
//   borderTop: `1px solid rgb(238, 238, 238)`,
//   "@media (max-width: 450px)": {
//     paddingTop: "4px",
//   },
// });
const FormSection = styled("div", ({ $theme }) => {
  return {
    width: `100%`,
    maxWidth: "100%",
    marginBottom: "36px",
    paddingTop: "18px",
    //marginTop:'18px',
    //height:'120px',
    borderTop: `1px solid ${$theme.borders.border600.borderColor}`,
    "@media (max-width: 450px)": {
      paddingTop: "4px",
    },
  };
});
const Flex1 = styled("div", {
  flex: 1,
  width: `100%`,
  textAlign: "center",
  display: "flex",
  alignContent: "center",
  alignItems: "center",
  justifyContent: "center",
});
const TaxFreeSpacer = styled("div", {
  width: `100%`,
  height: "47px",
});
const HappyHourSpacer = styled("div", {
  width: `100%`,
  height: "60px",
});





type INullableReactText = React.ReactText | null;

interface TimeStamp {
  seconds: number,
  nanoSeconds: number
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

const Driver = ({order}:{order:OrderClass}) => {
  const {
    lastID,
    setLastID,
    firstID,
    setFirstID,
    setReverse,
    setTotalsField,
    setQueryCollection,
    maxPage,
    setMaxPage,
    disableNext,
    setDisableNext,
    disablePrev,
    setDisablePrev,
    fireStoreQuery,
    fireStoreQueryTotals,
    fireStoreQueryTotal,
    page,
    setPage,
    limit,
    setLimit,
    orderBy,
    setOrderBy,
    nextPage,
    prevPage,
    dataList,
    queryLoader,
    setDataList
  } = useQuery();
  const titleRef = useRef<HTMLDivElement>(null);
  const phoneNumberRef = useRef<HTMLDivElement>(null);
  const methodRef = useRef(null);
  const collectionRef = useRef(null);
  const frequencyRef = useRef(null);
  const timeRef = useRef(null);
  const { width, height } = useWindowSize();

  const executeScroll = (ref: { current: HTMLDivElement | null }) => {
    width < 450 && ref && ref.current.scrollIntoView();
  };
  const { user, fireBrands, fireCollections, fireCustomer, fireDrivers } = useUser();
  //const [loading, setLoading] = useState(false);
  const { form, setForm, error, setError, loading, setLoading } = useForm();
  const [collectionList, setCollectionList] = useState([]);
  const { setNavLoading, navLoading } = useRouting();
  const { modalBaseDispatch, modalBaseState } = useDispatchModalBase();
  const { enqueue, dequeue } = useSnackbar();
  //const fireCollections = useFirestoreQuery(user?.uid && firebase.firestore().collection("collections"));
  //const fireBrands = useFirestoreQuery(user?.uid && firebase.firestore().collection("brands"));
  const defaultForm = new DriverClass(
    fireCustomer?.data?.driver, // driver:string,
  );

  useEffect(() => {
    console.log('fireCustomer')
    console.log(fireCustomer)
  }, [fireCustomer]);


  

  const [toastKey, setToastKey] = useState<INullableReactText>(null);
  const showToast = (x: string) => setToastKey(toaster.negative(`${x}`, {}));
  const closeModal = () => {
    modalBaseDispatch({
      type: "MODAL_UPDATE",
      payload: {
        modalBase: {
          isOpen: false,
          key: [],
          component: null,
          hasSquareBottom: false,
        },
      },
    });
  };
  const closeToast = () => {
    if (toastKey) {
      toaster.clear(toastKey);
      setToastKey(null);
    }
  };



  /* form setup */
  useEffect(() => {
    setForm({ ...defaultForm } as DriverClass);
    return () => {
      setForm({});
      setError({});
    };
  }, []);



  /* reset errors */
  useEffect(() => {
    closeToast();
    setError({});
    return () => {
      closeToast();
      setError({});
    };
  }, [form]);



  useEffect(() => {
    return () => {
      setLoading(false)
    };
  }, []);

  const handleClick = useCallback(async () => {
    //alert(JSON.stringify(form?.driver[0]))
    if (form?.driver[0]?.label && form?.driver[0]?.value) {
     // setNavLoading(true);
      
    setLoading(true);
    enqueue({ message: "Assigning order", progress: true }, DURATION.infinite);
      setTimeout(async () => {
        try {
          await updateFirestoreGroup("users", order.user, "Orders", order.id, {
            progress: PROGRESS[PROGRESS.indexOf(order.progress) + 1],
            driver: form?.driver[0]?.value,
            driverName: form?.driver[0]?.label,
          });
          dequeue();
          enqueue({ message: "Order sent.", startEnhancer: ({ size }) => <Check size={size} /> }, DURATION.short);
          closeModal() 
        } catch (error:any) {
          //setError(`${e?.message || e}`);
          setError((oldError: Errors) => ({ ...oldError, ...{ server: `Error sending order.`} }));
          dequeue();
          //showToast(`${error?.message || error}`);
          enqueue({ message: `Error sending order`, startEnhancer: ({ size }) => <DeleteAlt size={size} /> }, DURATION.short);
        }finally {
          setLoading(false);
          //setNavLoading(false);
        }
      }, 2000);
    }else{
      enqueue({ message: `No driver selected`, startEnhancer: ({ size }) => <DeleteAlt size={size} /> }, DURATION.short);
    }
  }, [form, fireCustomer])


  return (
    <>
      <ModalHeader>Change Driver</ModalHeader>
      <ModalBody>
        {/** Title */}
        {/* <FormSection ref={titleRef}>
          <FormInput style={formStyle} label={<Label2>{"User Driver"}</Label2>} stack={true}> */}
        <FormControl error={error?.driver}>
          <Select
            //required
            disabled={loading}
            // onChange={(e) => {
            //   const str = e?.currentTarget?.value;
            //   setForm((oldForm: DriverClass) => ({ ...oldForm, ...{ driver: str } }));
            // }}
            value={form?.driver}
            onFocus={() => (
              //executeScroll(titleRef), 
              setError({})
            )}
            key="driver"
            id="driver"
            labelKey="label"
            valueKey="value"
            //name="driver"
            error={Boolean(error?.driver)}
            options={
              //   [
              //   { label: "Customer", value: "customer" },
              //   { label: "Manager", value: "manager" },
              //   { label: "Dispatcher", value: "dispatch" },
              //   { label: "Driver", value: "driver" },
              // ]


              (fireDrivers?.data || []).map(
                ({ displayName, uid, online }, i) =>
                  online && { label: displayName, value: uid }
              )





            }
            //value={value}
            //required
            //placeholder="Select color"
            onChange={params => setForm((oldForm: DriverClass) => ({ ...oldForm, ...{ driver: params?.value } }))}
            placeholder="Driver"
            clearable={false}
            //clearOnEscape
            overrides={{
              Root: {
                style: ({ $theme }) => ({
                  marginBottom: "16px",
                  minWidth: '260px'
                }),
              },
              Popover: {
                props: {
                  overrides: {
                    Body: {
                      style: ({ $theme }) => ({ zIndex: 100 }),
                    },
                  },
                },
              },
            }}
          />
        </FormControl>
        <>
          <ToasterContainer
            placement={PLACEMENT.topRight}
            overrides={{
              Root: { style: ({ $theme }) => ({ zIndex: 50 }) },
            }}
            usePortal={true}
          />
        </>
      </ModalBody>
      <ModalFooter>
        {/* <ModalButton onClick={closeModal} kind={ButtonKind.tertiary}>Cancel</ModalButton> */}
        <ModalButton
          disabled={!form?.driver?.length} 
          isLoading={loading} 
          onClick={()=>handleClick()}
        >
          Update
        </ModalButton>
      </ModalFooter>
    </>
  );
};
export default Driver;

import { useState, useEffect, useRef, Fragment, ReactElement } from "react";
import A_LiveSwitch from "./components/A_LiveSwitch";
import { isEmpty } from "../../../helpers";
import firebase from "../../../firebase/clientApp";
import { useUser } from "../../../context/userContext";
import { useFirestoreQuery } from "../../../hooks/useFirestoreQuery";
import { useRouting } from "../../../context/routingContext";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { FormInput } from "../../Console";
import { NotificationManager } from "react-notifications";
import { useForm } from "../../../context/formContext";
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
import { useDispatchModalBase } from "../../../context/Modal";
import { Toast, KIND, ToasterContainer, toaster, PLACEMENT } from "baseui/toast";
import { Tag, VARIANT } from "baseui/tag";
import SVGIcon from "../../SVGIcon";
import { FC } from "react";
import { strict as assert } from "assert";
import { useQuery } from "../../../context/Query";
import { Accordion, Panel } from 'baseui/accordion';
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
class DiscountClass {
  active: boolean;
  alert: boolean;
  alertSent: boolean;
  bogoQty?: number;
  code: string | null;
  collectionIDs: string[];
  collections: Selected[];
  dateEnd?: any;
  dateStart: any;
  days: string[];
  featured: boolean;
  filters: string[] | null;
  id: string | null;
  method: Selected;
  methodID: "flatRate" | "percent" | "taxFree" | "bogo";
  rate: number | null;
  recurring: boolean;
  recurringDays: Selected[] | undefined;
  sort: "coupon";
  stackable: boolean;
  title: string | null;
  type: { [k: string]: any } | undefined;
  uid: string | null;
  used: boolean;
  happyHour: boolean;
  startHour: Selected;
  endHour: Selected;
  //queryIDs: string[];

  constructor(
    active: boolean,
    alert: boolean,
    bogoQty: number,
    code: string | null,
    collectionIDs: string[],
    collections: Selected[],
    dateEnd: any | null,
    dateStart: any,
    days: string[],
    featured: boolean,
    id: string | null,
    method: Selected,
    methodID: "flatRate" | "percent" | "taxFree" | "bogo",
    rate: number,
    recurring: boolean,
    recurringDays: Selected[] | undefined,
    //sort: "coupon",
    stackable: boolean,
    title: string | null,
    //type: { [k: string]: any } | undefined,
    uid: string | null,
    used: boolean,
    happyHour: boolean,
    startHour: Selected,
    endHour: Selected
  ) {
    this.active = active || false;
    this.alert = alert || false;
    this.alertSent = false;
    this.bogoQty = bogoQty || 2;
    this.code = code || null;
    this.collectionIDs = collectionIDs || [];
    this.collections = collections || [];
    this.dateEnd = dateEnd || null;
    this.dateStart = dateStart || null;
    this.days = days || [];
    this.featured = featured || false;
    this.filters = [];
    this.id = id || null;
    this.method = method || { label: `Flat rate`, value: "flatRate" };
    this.methodID = methodID || `flatRate`;
    this.rate = rate || null;
    this.recurring = recurring || false;
    this.recurringDays = recurringDays || [];
    this.sort = "coupon";
    this.stackable = stackable || false;
    this.title = title || null;
    this.type = { label: "Coupon", value: "coupon" };
    this.uid = uid || null;
    this.used = used || false;
    this.happyHour = happyHour || false;
    this.startHour = startHour || null;
    this.endHour = endHour || null;
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
interface DiscountProps {
  fireDiscount: DiscountClass;
}
const defaultForm = new DiscountClass(
  true, // active: boolean,
  false, // alert: boolean,
  2, // bogoQty: number,
  null, // code: string,
  ["ALL_PRODUCTS"], // collectionIDs: string[],
  [{ label: "Cart Total", value: "ALL_PRODUCTS" }], // collections: Selected[],
  null, // dateEnd: firebase.firestore.FieldValue | null,
  new Date(d), // dateStart: firebase.firestore.FieldValue,
  ["0"], // days: string[],
  false, // featured: boolean,
  null, // id: string,
  { label: "Flat Rate", value: "flatRate" }, // method: Selected,
  "flatRate", // methodID: "flatRate" | "percent" | "taxFree" | "bogo",
  null, // rate: number,
  false, // recurring: boolean,
  [], // recurringDays: Selected[] | undefined,
  //"coupon", // sort: "coupon",
  false, // stackable: boolean,
  null, // title: string | null,
  //{ label: "Coupon", value: "coupon" }, // type: { [k: string]: any } | undefined,
  null, // uid: string | null,
  false, // used: boolean,
  false, //happyhour
  { value: new Date(start.toUTCString()), label: 17 }, /// start hour
  { value: new Date(end.toUTCString()), label: 18 } //endHour
);

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
  seconds: number;
  nanoSeconds: number;
}
const convertTimestamp = (timeStamp: TimeStamp | Date, hours:number | null): Date | null | Date[] => {
  if(!timeStamp){
    return null
  }
  if (Array.isArray(timeStamp)) {
    return timeStamp;
  }
  if (timeStamp instanceof Date) {
    return timeStamp;
  }
  if (typeof timeStamp === "string" && Date.parse(timeStamp)) {
    return new Date(timeStamp);
  }
  let d = null;
  if(typeof timeStamp === "object"){
    for (const [key, value] of Object.entries(timeStamp)) {
      if(key.includes('seconds') && !key.includes('nano')){ 
        d = new Date(1970, 0, 1);
        d.setSeconds(Number(value));
        if(hours){
          d.setHours(Number(hours));
        }
      }
    }
  }
  if(d instanceof Date){
    return d;
  }
  return null;
};
const convertTimestampX = (timeStamp: TimeStamp | Date): Date | null | Date[] => {

  //alert(JSON.stringify(timeStamp))
  if (timeStamp && Array.isArray(timeStamp)) {
    return timeStamp;
  }
  if (timeStamp && timeStamp instanceof Date) {
    return timeStamp;
  }
  if (timeStamp && typeof timeStamp === "string" && Date.parse(timeStamp)) {
    return new Date(timeStamp);
  }
  if (
    timeStamp &&
    !(timeStamp instanceof Date) &&
    typeof timeStamp === "object" &&
    timeStamp?.seconds &&
    (typeof timeStamp.seconds === "number" || typeof timeStamp.seconds === "string")
  ) {
    let dateStart = new Date(1970, 0, 1); // Epoch
    dateStart.setSeconds(Number(timeStamp.seconds));
    return dateStart;
  }
  //alert(JSON.stringify(timeStamp))
  // if(typeof timeStamp === "object" && timeStamp){

  // }

  if (
    !(timeStamp instanceof Date) &&
    typeof timeStamp === "object" &&
    timeStamp?.seconds &&
    (typeof timeStamp.seconds === "number" || typeof timeStamp.seconds === "string")
  ) {
    let dateStart = new Date(1970, 0, 1); // Epoch
    dateStart.setSeconds(Number(timeStamp.seconds));
    return dateStart;
  }
  return null;
};
const defaultDays: Selected[] = [
  { label: "Sundays", value: 0 },
  { label: "Mondays", value: 1 },
  { label: "Tuesdays", value: 2 },
  { label: "Wednesdays", value: 3 },
  { label: "Thursdays", value: 4 },
  { label: "Fridays", value: 5 },
  { label: "Saturdays", value: 6 },
]
const EditDiscount = ({ fireDiscount }): ReactElement => {
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

  //const [fireDiscountState, setFireDiscountState] = useState<DiscountClass>(fireDiscount);
  const [fireDiscountDefault, setFireDiscountDefault] = useState<DiscountClass>({ ...fireDiscount });

  useEffect(() => {
    //alert(JSON.stringify(fireStoreQuery))
    const thisDiscountLive = (fireStoreQuery?.data || []).filter((x: DiscountClass) => x.id === fireDiscount.id)
    //alert('update default' )  

    setFireDiscountDefault({ ...defaultForm, ...thisDiscountLive[0] })
  }, [fireStoreQuery.data]);


  //alert(JSON.stringify(fireDiscount))
  //save this too a state
  const titleRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const methodRef = useRef(null);
  const collectionRef = useRef(null);
  const frequencyRef = useRef(null);
  const timeRef = useRef(null);
  const { width, height } = useWindowSize();
  const executeScroll = (ref: { current: HTMLDivElement | null }) => {
    width < 450 && ref && ref.current.scrollIntoView();
  };
  const { user, fireBrands, fireCollections } = useUser();
  //const [loading, setLoading] = useState(false);
  const { form, setForm, error, setError, loading, setLoading } = useForm();
  const [collectionList, setCollectionList] = useState([]);
  const [changeError, setChangeError] = useState(null);
  const [availableDays, setAvailableDays] = useState(defaultDays);
  const { setNavLoading, navLoading } = useRouting();
  const { modalBaseDispatch, modalBaseState } = useDispatchModalBase();
  const { enqueue, dequeue } = useSnackbar();

  const [toastKey, setToastKey] = useState<INullableReactText>(null);
  const showToast = (x: string) => setToastKey(toaster.negative(`${x}`, {}));

  const [hasChanges, setHasChanges] = useState(false);

  /* Changes Checker*/
  useEffect(() => {
    //form?.dateEnd.toDate().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    // if(form?.endHour){
    //  // alert(JSON.stringify(form?.endHour))
    // }
    console.log("Changes Checker");
    //alert(new Date(form?.dateStart.toDate().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })))
    //let changes:boolean = !deepEqual(fireDiscountDefault, form)
    let changes: boolean = false;
    const _default: DiscountClass = { ...fireDiscountDefault };
    const _state: DiscountClass = { ...form };

    try {
      const _deepEqual = assert.deepStrictEqual(_default, _state);
      changes = false;
      //alert(JSON.stringify(_deepEqual))
    } catch (e) {
      //alert(JSON.stringify(`error - ${e}`))
      setChangeError(e)
      changes = true;
    }

    // if(!deepEqual(fireDiscountDefault, form)){
    //   changes = true
    // }
    setHasChanges(changes);
    return () => {
      setHasChanges(false);
    };
  }, [fireDiscountDefault, form]);

  /* Day Set up*/
  useEffect(() => {
    let _days: Selected[] = defaultDays
    let _filtered = []

    console.log("Day set up");
    if (fireStoreQueryTotals?.status === 'success') {
      for (const key in fireStoreQueryTotals?.data) {
        // alert(JSON.stringify(`${key}: ${fireStoreQueryTotals?.data[key]}`))
        if (!fireStoreQueryTotals?.data[key]) {
          let matchedDay: Selected | null = null
          for (const day of _days) {
            if (day.value === Number(key)) {
              if (day && typeof day === 'object') {
                matchedDay = day
              }

            }
          }
          if (matchedDay && typeof matchedDay === 'object') {
            _filtered.push(matchedDay)
          }

        }
        // console.log(`${key}: ${user[key]}`);
      }

    }


    //alert(JSON.stringify(_filtered))

    setAvailableDays(_filtered)

    return () => {
      setAvailableDays(defaultDays)
    };
  }, [fireStoreQueryTotals]);


  useEffect(() => {
    //  alert(hasChanges)
  }, [hasChanges]);

  const closeToast = () => {
    if (toastKey) {
      toaster.clear(toastKey);
      setToastKey(null);
    }
  };

  /* collection setup */
  useEffect(() => {

    console.log("collection setup");
    let list: Selected[] = [];
    const collections = fireCollections.data as Collection;
    const brands = fireBrands.data as Brand;
    if (collections && brands) {
      for (const key in collections) {
        list.push({ value: collections[key].id, label: collections[key].title });
      }
      for (const key in brands) {
        list.push({ value: brands[key].id, label: brands[key].title });
      }
    }
    setCollectionList(list);
    return () => {
      setCollectionList([]);
    };
  }, [fireCollections.data, fireBrands.data, form?.method?.value]);
  /* form setup */
  useEffect(() => {

    console.log("form setup");
    const thisDiscountLive = (fireStoreQuery?.data || []).filter((x: DiscountClass) => x.id === fireDiscount.id)
    setForm({ ...defaultForm, ...thisDiscountLive[0] });
    return () => {
      setForm({});
      setError({});
    };
  }, [defaultForm, fireStoreQuery?.data]);
  /* flat rate = Cart Total */
  useEffect(() => {

    console.log("flat rate parameters");
    if (Array.isArray(form.collections)) {
      if (form?.method?.value === "flatRate") {
        setForm({
          ...form,
          ...{ collectionIDs: ["ALL_PRODUCTS"], collections: [{ label: "Cart Total", value: "ALL_PRODUCTS" }] },
        });
      }
    }
  }, [form?.method?.value]);
  /* empty collection = Cart Total */
  useEffect(() => {

    console.log("empty collection parameters");
    if (Array.isArray(form.collections)) {
      if (form.collections.length === 0) {
        setForm({
          ...form,
          ...{ collectionIDs: ["ALL_PRODUCTS"], collections: [{ label: "Cart Total", value: "ALL_PRODUCTS" }] },
        });
      }
    }
  }, [form?.collections]);
  /* dont stack cart totals */
  useEffect(() => {

    console.log("no stack with cart total parameters");
    if (Array.isArray(form.collections)) {
      if (form.collections.length > 1 && form.collections.filter((x: Selected) => x.value === "ALL_PRODUCTS").length > 0) {
        const filteredObject = [];
        const filteredArray = [];
        const collection = form.collections;
        for (const key in collection) {
          if (collection[key].value !== "ALL_PRODUCTS") {
            filteredObject.push(collection[key]);
            filteredArray.push(collection[key].value);
          }
        }
        setForm({
          ...form,
          ...{ collectionIDs: filteredArray, collections: filteredObject },
        });
      }
    }
  }, [form?.collections]);
  /* reset errors */
  useEffect(() => {

    console.log("error resert");
    closeToast();
    setError({});
    return () => {
      closeToast();
      setError({});
    };
  }, [form]);
  /* feature defaults */
  useEffect(() => {

    console.log("set featured parameters");
    if (form?.featured) {
      setForm((oldForm: DiscountClass) => ({ ...oldForm, ...{ happyHour: false } }));
    }
  }, [form?.featured]);
  useEffect(() => {

    console.log("recurring parameters");
    if (form?.recurring === false) {
      setForm((oldForm: DiscountClass) => ({ ...oldForm, ...{ happyHour: false, featured: false } }));
    }
  }, [form?.recurring]);

  const updateDiscount = async () => {
    const _form: DiscountClass = { ...form };
    // ** TITLE **
    if (isEmpty(_form?.title)) {
      titleRef.current.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
      setError((oldError: Errors) => ({ ...oldError, ...{ title: "Title Required" } }));
      return;
    }
    // ** CODE **
    if (isEmpty(_form?.code)) {
      codeRef.current.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
      setError((oldError: Errors) => ({ ...oldError, ...{ code: "Code Required" } }));
      return;
    }
    // ** METHOD / RATE **
    if (_form?.method?.value !== "taxFree" && isEmpty(_form?.rate)) {
      methodRef.current.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
      setError((oldError: Errors) => ({ ...oldError, ...{ rate: "Rate Required" } }));
      return;
    }
    if (_form?.method?.value === "flatRate" && (+_form?.rate > 25 || +_form?.rate <= 0)) {
      methodRef.current.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
      setError((oldError: Errors) => ({ ...oldError, ...{ rate: "Max:$25, Min:$1" } }));
      return;
    }
    if (_form?.method?.value === "percent" && (+_form?.rate > 50 || +_form?.rate <= 0)) {
      methodRef.current.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
      setError((oldError: Errors) => ({ ...oldError, ...{ rate: "Max:50%, Min:1%" } }));
      return;
    }
    if (_form?.method?.value === "bogo" && (+_form?.rate > 25 || +_form?.rate <= 0)) {
      methodRef.current.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
      setError((oldError: Errors) => ({ ...oldError, ...{ rate: "Max:$25, Min:$1" } }));
      return;
    }
    // ** COLLECTION **
    if (!_form.collections) {
      collectionRef.current.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
      setError((oldError: Errors) => ({ ...oldError, ...{ collections: "Please select a collection" } }));
      return;
    }
    // ** SCHEDULE **
    if (!_form?.recurring) {
      if (!_form.dateStart) {
        //alert(1);
        frequencyRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        setError((oldError: Errors) => ({ ...oldError, ...{ dateStart: "Start date required." } }));
        return;
      } else {
        if (_form.dateEnd) {
          const s = new Date(_form.dateStart);
          const e = new Date(_form.dateEnd);
          if (s >= e) {
            frequencyRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
            setError((oldError: Errors) => ({ ...oldError, ...{ dateEnd: "Too low." } }));
            return;
          }
        }
      }
    } else {
      if (!_form.recurringDays || (_form.recurringDays && !_form.recurringDays.length)) {
        frequencyRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        setError((oldError: Errors) => ({ ...oldError, ...{ recurringDays: "Choose a day." } }));
        return;
      }
    }
    // ** TIME **
    if (_form?.happyHour) {
      _form.endHour.value = Number(_form?.endHour?.value)
      if ( _form?.endHour?.value > 23 || _form?.endHour?.value < 1 || typeof _form?.endHour?.value !== 'number') {
        timeRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        setError((oldError: Errors) => ({ ...oldError, ...{ endHour: "Invalid end hours" } }));
        return;
      }

      if(_form?.endHour?.label instanceof Date){
        _form.endHour.label = _form.endHour.label.toString()
      }


  
      _form.startHour.value = Number(_form?.startHour?.value)
      if (_form?.startHour?.value > 23 || _form?.startHour?.value < 1 || typeof _form?.startHour?.value !== 'number') {
        timeRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        setError((oldError: Errors) => ({ ...oldError, ...{ startHour: "Invalid startHour" } }));
        return;
      }
      if(_form?.startHour?.label instanceof Date){
        _form.startHour.label = _form.startHour.label.toString()
      }


      if (_form?.endHour?.value <= _form?.startHour?.value) {
        timeRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        setError((oldError: Errors) => ({ ...oldError, ...{ endHour: "Too Low" } }));
        return;
      }
    }
    setLoading(true);
    enqueue({ message: "Updating Discount", progress: true }, DURATION.infinite);
    try {
      const updateDiscount = firebase.functions().httpsCallable("updateDiscount");
      const response = await updateDiscount(_form);
      dequeue();
      enqueue({ message: "Discount Updated", startEnhancer: ({ size }) => <Check size={size} /> }, DURATION.short);
      if (response?.data?.success === true && response?.data?.form) {
        //alert(`${response?.data?.form}`)
        console.log(response?.data?.form)
        //setFireDiscountDefault({...response?.data?.form});
        //setForm({...response?.data?.form});
      }
    } catch (e) {
      //setError(`${e?.message || e}`);
      setError((oldError: Errors) => ({ ...oldError, ...{ server: `Discount not updated` } }));
      dequeue();
      showToast(`${e?.message || e}`);
      enqueue({ message: `Your discount wasn't updated`, startEnhancer: ({ size }) => <DeleteAlt size={size} /> }, DURATION.short);
    } finally {
      setLoading(false);
    }
  };
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
  return (
    <>
      <ModalHeader>Edit Discount</ModalHeader>
      <ModalBody>
        {/** Live */}
        <A_LiveSwitch />
        {/** Title */}
        <FormSection ref={titleRef}>
          <FormInput style={formStyle} label={<Label2>{"Discount Name"}</Label2>} stack={true}>
            <FormControl error={error?.title}>
              <Input
                required
                disabled={loading}
                onChange={(e) => {
                  const str = e?.currentTarget?.value;
                  setForm((oldForm: DiscountClass) => ({ ...oldForm, ...{ title: str } }));
                }}
                value={form?.title}
                onFocus={() => (
                  //executeScroll(titleRef), 
                  setError({})
                )}
                key="title"
                id="title"
                name="title"
                error={Boolean(error?.title)}
                type="text"
                placeholder="Tax Free Thursday"
                overrides={{
                  Root: {
                    style: ({ $theme }) => ({
                      marginBottom: "16px",
                    }),
                  },
                }}
              />
            </FormControl>
          </FormInput>
        </FormSection>
        {/** Code*/}
        <FormSection ref={codeRef}>
          <FormInput style={formStyle} label={<Label2>{"Code"}</Label2>} stack={true}>
            <FormControl error={error?.code}>
              <Input
                startEnhancer={
                  <SVGIcon style={{ transform: "scale(0.8)", height: "23px", width: "2px", overflow: "unset" }} name={"lock"} />
                }
                required
                disabled={true}
                id="code"
                name="code"
                type="text"
                error={Boolean(error.code)}
                onFocus={() => (
                  //executeScroll(codeRef), 
                  setError({})
                )}
                onChange={(e) => {
                  const str = e?.currentTarget?.value;
                  const res = str.toUpperCase();
                  setForm((oldForm: DiscountClass) => ({ ...oldForm, ...{ code: res } }));
                }}
                value={form?.code}
                placeholder="ex. BUD10"
                overrides={{
                  Root: {
                    style: ({ $theme }) => ({
                      width: "162px",
                      minWidth: "0px",
                      marginBottom: "16px",
                    }),
                  },
                }}
              />
            </FormControl>
          </FormInput>
        </FormSection>
        {/* Method */}
        <FormSection style={{ minHeight: `175px` }} ref={methodRef}>
          <FormInput style={formStyle} label={<Label2>{"Method"}</Label2>} stack={true}>
            <ButtonGroup
              disabled={loading}
              mode={MODE.radio}
              selected={methods.findIndex((x) => x?.value === form?.method?.value)}
              overrides={{
                Root: {
                  style: ({ $theme }) => ({
                    //marginBottom: `16px`,
                  }),
                },
              }}
              onClick={(_event, index) => {
                const method: Selected = methods[index];
                setForm((oldForm: DiscountClass) => ({ ...oldForm, method }));
              }}
            >
              <Button>Flat</Button>
              <Button>Percent</Button>
              <Button>No Tax</Button>
              <Button>Bogo</Button>
            </ButtonGroup>
          </FormInput>
          {/* Rate */}
          {
            <FormInput style={formStyle} label={""} stack={true}>
              {/* Rate not bogo */}
              {form?.method?.value === "taxFree" && <TaxFreeSpacer />}
              {form?.method?.value !== "taxFree" && form?.method?.value !== "bogo" && (
                <>
                  <FormControl
                    error={error?.rate}
                  //label="Input label"
                  //caption="Input caption"
                  >
                    <Input
                      id="rate"
                      name="rate"
                      type="tel"
                      disabled={loading}
                      error={Boolean(error.rate)}
                      onChange={(event) => setForm({ ...form, ...{ rate: event.currentTarget.value } })}
                      value={form?.rate}
                      onFocus={() => (
                        //executeScroll(methodRef), 
                        setError({})
                      )}
                      startEnhancer={form?.method?.value === "flatRate" ? "$" : ` `}
                      endEnhancer={form?.method?.value === "flatRate" ? ".00" : "%"}
                      placeholder="10"
                      overrides={{
                        Root: {
                          style: ({ $theme }) => ({
                            width: "162px",
                            minWidth: "0px",
                          }),
                        },
                      }}
                    />
                  </FormControl>
                </>
              )}

              {/* Rate bogo */}
              {form?.method?.value === "bogo" && (
                <>
                  <div className="dual-input">
                    <>
                      <Flex1 style={{ height: "48px" }}>
                        <Label2>{"Buy 2 and save"}</Label2>
                      </Flex1>
                      <FormControl
                        error={error?.rate}
                        //label="Input label"
                        //caption="Input caption"
                        overrides={{
                          ControlContainer: {
                            style: ({ $theme }) => ({
                              width: "100%",
                              flex: 1,
                              //display:'flex'
                            }),
                          },
                        }}
                      >
                        <Input
                          disabled={loading}
                          id="rate"
                          name="rate"
                          type="tel"
                          error={Boolean(error.rate)}
                          onChange={(event) => setForm({ ...form, ...{ rate: event.currentTarget.value } })}
                          value={form?.rate}
                          startEnhancer={"$"}
                          endEnhancer={".00"}
                          placeholder="10"
                          onFocus={() => (
                            //executeScroll(methodRef), 
                            setError({})
                          )}
                        />
                      </FormControl>
                    </>
                  </div>
                </>
              )}
            </FormInput>
          }
        </FormSection>
        {/* Collections */}
        <FormSection style={{ minHeight: `100px` }} ref={collectionRef}>
          <FormInput style={formStyle} label={<Label2>{"Applies to"}</Label2>} stack={true}>
            <Select
              id="collections"
              //name="collections"
              //type="number"
              error={Boolean(error.collections)}
              maxDropdownHeight={`220px`}
              //onChange={(event)=>setForm({ ...form, ...{rate:event.currentTarget.value} })}
              //value={form?.rate}
              //clearable={false}
              disabled={Boolean(form?.method?.value === "flatRate") || loading}
              //onFocus={() => executeScroll(collectionRef)}
              options={collectionList}
              labelKey="label"
              valueKey="value"
              placeholder="Choose a Collection"
              onBlurResetsInput={true}
              onChange={({ value }: { value: Selected[] }) => {
                //if its going to empty replace with all produvts here
                //alert(JSON.stringify(value))
                const hasAll = (value?.filter((item: Selected) => item.value === "ALL_PRODUCTS") || []).length;

                if (hasAll) {
                  const removeIndex = (value || []).findIndex((item: Selected) => item.value === "ALL_PRODUCTS");
                  //const hasCartTotal = _form?.collections.findIndex( (item:Selected) => item.value === 'ALL_PRODUCTS' );
                  // remove object
                  value.splice(removeIndex, 1);
                }

                setForm((oldForm: DiscountClass) => ({ ...oldForm, collections: value }));
              }}
              //maxDropdownHeight="300px"
              type={TYPE.search}
              multi
              overrides={{
                Popover: {
                  props: {
                    overrides: {
                      Body: {
                        style: ({ $theme }) => ({ zIndex: 100 }),
                      },
                    },
                  },
                },
                SearchIcon: Boolean(form?.method?.value === "flatRate") && {
                  component: (props) => (
                    <></>
                  ),
                },
                ClearIcon: Boolean(form?.method?.value === "flatRate")
                  ? {
                    props: {
                      overrides: {
                        Svg: {
                          component: (props) => <></>,
                        },
                      },
                    },
                  }
                  : (form?.collections?.filter((item: Selected) => item.value === "ALL_PRODUCTS") || []).length
                    ? {
                      props: {
                        overrides: {
                          Svg: {
                            component: (props) => (
                              <SVGIcon
                                style={{
                                  transform: "scale(0.7) translate3d(-7px, 0px, 0px)",
                                  overflow: "visible",
                                  width: "12px",
                                }}
                                name="arrowDownSmall"
                              />
                            ),
                          },
                        },
                      },
                    }
                    : {
                      props: {
                        overrides: {
                          Svg: {
                            component: (props) => (
                              <SVGIcon
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  //alert("covid")
                                  const _form = { ...form };

                                  _form.collections = [{ label: "Cart Total", value: "ALL_PRODUCTS" }];
                                  _form.collectionIDs = ["ALL_PRODUCTS"];

                                  setForm((oldForm: DiscountClass) => ({ ...oldForm, ..._form }));
                                }}
                                style={{
                                  transform: "scale(0.7) translate3d(-7px, 0px, 0px)",
                                  overflow: "visible",
                                  width: "12px",
                                }}
                                name="xCircleFilled"
                              />
                            ),
                          },
                        },
                      },
                    },
                Tag: {
                  component: (props) => (
                    <>
                      <Tag
                        overrides={{
                          ActionIcon: Boolean(props?.value?.value === "ALL_PRODUCTS") &&
                            Boolean(form?.method?.value === "flatRate") && {
                            component: (props) => (
                              <>
                                <SVGIcon
                                  style={{
                                    transform: "scale(0.7) translate3d(-7px, 0px, 0px)",
                                    overflow: "visible",
                                    width: "12px",
                                  }}
                                  name="lock"
                                />
                              </>
                            ),
                          },
                        }}
                        onActionClick={() => {
                          //alert(JSON.stringify(props));
                          //alert(JSON.stringify(props));
                          if (Boolean(props?.value?.value === "ALL_PRODUCTS") && Boolean(form?.method?.value === "flatRate")) {
                            return;
                          }
                          const _form = { ...form };
                          const removeIndex = _form?.collections.findIndex((item: Selected) => item.value === props?.value?.value);
                          //const hasCartTotal = _form?.collections.findIndex( (item:Selected) => item.value === 'ALL_PRODUCTS' );
                          // remove object
                          _form?.collections.splice(removeIndex, 1);
                          //alert(JSON.stringify(_form?.collections))
                          if (!_form?.collections?.length) {
                            _form.collections = [{ label: "Cart Total", value: "ALL_PRODUCTS" }];
                            _form.collectionIDs = ["ALL_PRODUCTS"];
                          }
                          setForm((oldForm: DiscountClass) => ({ ...oldForm, ..._form }));
                        }}
                        // startEnhancer={
                        //   (Boolean(props?.value?.value === 'ALL_PRODUCTS') &&
                        //    Boolean(form?.method?.value === "flatRate"))
                        //   ?()=><SVGIcon  style={{transform:'scale(0.7) translate3d(6px, 0px, 0px)'}}  name='lock'/>
                        //   :undefined
                        // }
                        closeable={Boolean(props?.value?.value !== "ALL_PRODUCTS") || Boolean(form?.method?.value === "flatRate")}
                      >
                        {`${props?.value?.label || "empty"}`}
                      </Tag>
                    </>
                  ),
                  props: {
                    overrides: {
                      Root: {
                        style: ({ $theme }) => ({
                          backgroundColor: $theme.colors.contentOnColorInverse,
                          color: $theme.colors.contentOnColor,
                          borderColor: $theme.colors.contentOnColorInverse,
                        }),
                      },
                    },
                  },
                },
              }}
              //setForm((oldForm: DiscountClass) => ({ ...oldForm, happyHour }));

              //onChange={({value}) => setValue(value)}
              value={form?.collections}
            />
          </FormInput>
        </FormSection>
        {/*Schedule*/}
        <FormSection style={{ minHeight: `210px` }} ref={frequencyRef}>
          <FormInput style={formStyle} label={<Label2>{"Schedule"}</Label2>} stack={true}>
            <ButtonGroup
              disabled={loading}
              mode={MODE.radio}
              selected={Boolean(form?.recurring) ? 1 : 0}
              overrides={{
                Root: {
                  style: ({ $theme }) => ({
                    //marginBottom: `22px`,
                  }),
                },
              }}
              onClick={(_event, index) => {
                //let selection = { label: "Recurring", value: true }
                let recurring = true;
                if (index === 0) {
                  //selection = { label: "One Time", value: false }
                  recurring = false;
                }
                setForm((oldForm: DiscountClass) => ({ ...oldForm, recurring }));
              }}
            >
              <Button>One-Time</Button>
              <Button>Recurring</Button>
            </ButtonGroup>
          </FormInput>
          {!form?.recurring && (
            <>
              <FormInput style={formStyle} label={""} stack={true}>
                <div className="dual-input">
                  <>
                    <FormControl error={error?.dateStart} caption="Start">
                      <DatePicker
                        error={Boolean(error?.dateStart)}
                        disabled={true}
                        overrides={{
                          Popover: {
                            props: {
                              overrides: {
                                Body: {
                                  style: ({ $theme }) => ({
                                    zIndex: 100,
                                  }),
                                },
                              },
                            },
                          },
                        }}
                        //value={ form?.dateStart instanceof Object ? form?.dateStart.toDate().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }) : form?.dateStart }
                        value={convertTimestamp(form?.dateStart, null)}
                        onChange={({ date }) => (
                          setForm((oldForm: DiscountClass) => ({ ...oldForm, dateStart: Array.isArray(date) ? date : [date] })),
                          setError({})
                        )}
                      />
                    </FormControl>
                    <div className="dual-spacer" />
                    <FormControl error={error?.dateEnd} caption="End *Not Required">
                      <DatePicker
                        //onChange={()=>setError({})}
                        disabled={loading}
                        value={convertTimestamp(form?.dateEnd, null)}
                        //value={ form?.dateEnd instanceof Object ? null : form?.dateEnd }
                        onChange={({ date }) => (
                          setForm((oldForm: DiscountClass) => ({ ...oldForm, dateEnd: Array.isArray(date) ? date : [date] })), setError({})
                        )}
                        error={Boolean(error?.dateEnd)}
                        overrides={{
                          Popover: {
                            props: {
                              overrides: {
                                Body: {
                                  style: ({ $theme }) => ({
                                    zIndex: 100,
                                  }),
                                },
                              },
                            },
                          },
                        }}
                      />
                    </FormControl>
                  </>
                </div>
                {/* <FrequencySpacer /> */}
              </FormInput>
            </>
          )}
          {form?.recurring && (
            <>
              {/* Days */}
              <FormInput style={formStyle} label={<Label2>{""}</Label2>} stack={true}>
                <FormControl error={error?.recurringDays}>
                  <Select
                    disabled={loading}
                    options={defaultDays}
                    //onFocus={() => (
                    //executeScroll(frequencyRef), 
                    //setError({})
                    //)}
                    error={Boolean(error.recurringDays)}
                    labelKey="label"
                    valueKey="value"
                    placeholder="Choose Days"
                    maxDropdownHeight="280px"
                    type={TYPE.search}
                    multi
                    overrides={{
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
                    onChange={(props) => {
                      const filteredDays = [];
                      const filteredSelected = []
                      const { option, value, type } = props
                      let filteredValue = null
                      if (type === 'remove') {
                        filteredValue = ((value || []).filter((x: Selected) => Number(x.value) !== Number(option.value)))
                      } else if (type === 'select') {
                        filteredValue = value
                      } else if (type === 'clear') {
                        filteredValue = []
                      }
                      for (const key in filteredValue) {
                        const filteredSelect: Selected = { value: '', label: '' }
                        filteredSelect.value = `${value[key].value}`
                        filteredSelect.label = `${value[key].label}`
                        filteredDays.push(Number(value[key].value));
                        filteredSelected.push(filteredSelect);
                      }
                      setForm((oldForm: DiscountClass) => ({ ...oldForm, recurringDays: filteredSelected, days: filteredDays }));
                    }}
                    //onChange={({value}) => setValue(value)}
                    value={form?.recurringDays}
                  />
                </FormControl>
              </FormInput>
              <FormInput style={formStyle} label={""} stack={true}>
                <div style={{ marginTop: `0px` }}>
                  <Checkbox
                    disabled={loading}
                    checked={form.featured}
                    onChange={(e: any) => setForm((oldForm: DiscountClass) => ({ ...oldForm, ...{ featured: e.target.checked } }))}
                    labelPlacement={LABEL_PLACEMENT.right}
                  >
                    <Paragraph4>Feature discount at the top of menu?</Paragraph4>
                  </Checkbox>
                </div>
              </FormInput>
            </>
          )}
        </FormSection>
        {/* Time */}
        <FormSection style={{ minHeight: `175px` }} ref={timeRef}>
          <FormInput style={formStyle} label={<Label2>{"Time"}</Label2>} stack={true}>
            <ButtonGroup
              disabled={loading}
              mode={MODE.radio}
              selected={Boolean(form?.happyHour) ? 1 : 0}
              //selected={Boolean(form?.featured) ? 0 : (Boolean(form.happyHour) ?1 :0)}
              onClick={(_event, index) => {
                let happyHour = true;
                if (index === 0) {
                  happyHour = false;
                }
                setForm((oldForm: DiscountClass) => ({ ...oldForm, happyHour }));
              }}
            >
              <Button>All Day</Button>
              <Button
                startEnhancer={
                  Boolean(form.featured) || Boolean(!form.recurring)
                    ? () => <SVGIcon style={{ transform: "scale(0.8)", height: "20px", width: "10px", overflow: "unset" }} name={"lock"} />
                    : undefined
                }
                disabled={Boolean(form.featured) || Boolean(!form.recurring)}
              >
                Happy Hour
              </Button>
            </ButtonGroup>
          </FormInput>
          {form?.happyHour ? (
            <>
              <FormInput style={formStyle} label={<Label2>{""}</Label2>} stack={true}>
                <div className="dual-input">
                  <FormControl error={error?.startHour}>
                    <TimePicker
                      disabled={loading}
                      value={(convertTimestamp(form?.startHour?.label, form?.startHour?.value) as Date | null) || start}
                      //value={form?.startHour?.value}
                      error={Boolean(error?.startHour || null)}
                      onChange={(date) =>
                        setForm((oldForm: DiscountClass) => ({ ...oldForm, startHour: { value: date.getHours(), label: date } }))
                      }
                      overrides={{
                        Select: {
                          props: {
                            overrides: {
                              Popover: {
                                props: {
                                  overrides: {
                                    Body: {
                                      style: ({ $theme }) => ({
                                        zIndex: 100,
                                      }),
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      }}
                      step={3600}
                    />
                  </FormControl>
                  <div className="dual-spacer" />
                  <FormControl error={error?.endHour}>
                    <TimePicker
                      disabled={loading}
                      error={Boolean(error?.endHour)}
                      value={(convertTimestamp(form?.endHour?.label, form?.endHour?.value) as Date | null) || end}
                      //value={form?.endHour?.value}
                      onChange={(date) =>
                        setForm((oldForm: DiscountClass) => ({ ...oldForm, endHour: { value: date.getHours(), label: date } }))
                      }
                      overrides={{
                        Select: {
                          props: {
                            overrides: {
                              Popover: {
                                props: {
                                  overrides: {
                                    Body: {
                                      style: ({ $theme }) => ({
                                        zIndex: 100,
                                      }),
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      }}
                      step={3600}
                    />
                  </FormControl>
                </div>
              </FormInput>
            </>
          ) : (
            <>
              <HappyHourSpacer />
            </>
          )}
        </FormSection>
        {/* <div style={{ width: "100%", height: 65 }}></div> */}
        {/* {form && JSON.stringify(form)} */}
        {/* {fireDiscountDefault && JSON.stringify(fireDiscountDefault)} */}


        <Accordion>
          <Panel title="Form Dev">{<>
            {
              form &&
              Object.keys(form).map(function (key, index) {
                //alert(fireDiscountDefault[key])
                return <div>{`${key} : ${JSON.stringify(form[key])}`}</div>;
              })
            }
          </>}</Panel>
          <Panel title="Database Dev">{<>
            {
              fireDiscountDefault &&
              Object.keys(fireDiscountDefault).map(function (key, index) {
                //alert(fireDiscountDefault[key])
                return <div>{`${key} : ${JSON.stringify(fireDiscountDefault[key])}`}</div>;
              })
            }
          </>}</Panel>
          <Panel title="Change Error">{<>
            {
              JSON.stringify(changeError)
            }
          </>}</Panel>


        </Accordion>
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
        <ModalButton onClick={closeModal} kind={ButtonKind.tertiary}>Cancel</ModalButton>
        <ModalButton disabled={!hasChanges} isLoading={loading} onClick={updateDiscount}>
          Update
        </ModalButton>
      </ModalFooter>
    </>
  );
};
export default EditDiscount;

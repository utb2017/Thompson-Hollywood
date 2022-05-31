import { useState, useEffect, useRef, Fragment, useCallback } from "react";
import { isEmpty } from "../../helpers";
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
} from "../../firebase/clientApp"
import { useUser } from "../../context/userContext";
import { useFirestoreQuery } from "../../hooks/useFirestoreQuery";
import { useRouting } from "../../context/routingContext";
import { useWindowSize } from "../../hooks/useWindowSize";
import { FormInput } from "../Console";
import { NotificationManager } from "react-notifications";
import { useForm } from "../../context/formContext";
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
import { useDispatchModalBase } from "../../context/Modal";
import { Toast, KIND, ToasterContainer, toaster, PLACEMENT } from "baseui/toast";
import { Tag, VARIANT } from "baseui/tag";
import SVGIcon from "../SVGIcon";
import { useQuery } from "../../context/Query";
import { Accordion, Panel } from 'baseui/accordion';
import { Textarea } from "baseui/textarea";

import { Card, StyledBody, StyledAction } from 'baseui/card';
//import { ProductClass } from "./types";

import { FileUploader } from "baseui/file-uploader";
const options = { timeZone: "America/Los_Angeles" };
let d: any = new Date().toLocaleString("en-US", options);
const start = new Date(d);
const end = new Date(d);
start.setUTCHours(0, 0, 0, 0);
end.setUTCHours(1, 0, 0, 0);


interface Params {
  value: any[],
  option: any,
  type: "clear" | 'select' | 'remove'
}
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
class ProductClass {
  id: string | null;
  genome: Selected;
  brandID: string;
  collectionIDs: string[];
  sold: number;
  genomeID: string;
  wholesale: number;
  active: boolean;
  price: number;
  comparePrice: number;
  //effects: object;
  //collection: string;
  thc: number;
  onSale: boolean;
  inventory: number;
  saleTitle: string;
  weight: string;
  queryIDs: string[];
  saleRate: null | number | string;
  //brandID: string;
  type: Selected;
  typeID: string;
  filePath: string;
  cbd: number | string;
  img: string;
  collections: Selected[];
  key: string;
  description: string;
  brand: Selected;
  saleCode: string;
  size: string;
  name: string;
  qty?: number;
  uid?: string;

  constructor(
    id: string | null,
    genome: Selected,
    //brandID: string,
    collectionIDs: string[],
    sold: number,
    genomeID: string,
    wholesale: number,
    active: boolean,
    price: number,
    comparePrice: number,
    //effects: object,
    //collection: string,
    thc: number,
    onSale: boolean,
    inventory: number,
    saleTitle: string,
    weight: string,
    queryIDs: string[],
    saleRate: null | number | string,
    brandID: string,
    type: Selected,
    typeID: string,
    filePath: string,
    cbd: number | string,
    img: string,
    collections: Selected[],
    key: string,
    description: string,
    brand: Selected,
    saleCode: string,
    size: string,
    name: string,
    qty?: number,
    uid?: string,
  ) {
    this.id = id;
    this.genome = genome;
    //this.brandID = brandID;
    this.collectionIDs = collectionIDs;
    this.sold = sold;
    this.genomeID = genomeID;
    this.wholesale = wholesale;
    this.active = active;
    this.price = price;
    this.comparePrice = comparePrice;
    //this.effects = effects;
    //this.collection = collection;
    this.thc = thc;
    this.onSale = onSale;
    this.inventory = inventory;
    this.saleTitle = saleTitle;
    this.weight = weight;
    this.queryIDs = queryIDs;
    this.saleRate = saleRate;
    this.brandID = brandID;
    this.type = type;
    this.typeID = typeID;
    this.filePath = filePath;
    this.cbd = cbd;
    this.img = img;
    this.collections = collections;
    this.key = key;
    this.description = description;
    this.brand = brand;
    this.saleCode = saleCode;
    this.size = size;
    this.name = name;
    this.qty = qty;
    this.uid = uid;
  }
}
interface Errors {
  name?: string;
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
interface ProductProps {
  fireProduct: ProductClass;
}
const defaultForm = new ProductClass(
  null, // id: string,
  null, // genome: Selected,
  //null, // brandID: string,
  [], // collectionIDs: string[],
  0, // sold: number,
  null, // genomeID: string,
  null, // wholesale: number,
  false, // active: boolean,
  null, // price: number,
  null, // comparePrice: number,
  //{}, // effects: object,
  //null, // collection: string,
  null, // thc: number,
  false, // onSale: boolean,
  null, // inventory: number,
  null, // saleTitle: string,
  null, // weight: string,
  [], // queryIDs: string[],
  null, // saleRate: null|number|string,
  null, // brandID: string,
  null, // type: string,
  null, // typeID: string,
  null, // filePath: string,
  null, // cbd: number|string,
  null, // img: string,
  null, // collections: Selected[],
  null, // key:string,
  null, // description: string,
  null, // brand: Selected,
  null, // saleCode: string,
  null, // size: string,
  null, // name: string,
  0,
  null,
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
  seconds: number,
  nanoSeconds: number
}


const isValidObject = (x: any) => {
  return Boolean(
    x &&
    (typeof x === "object" || typeof x === "function") &&
    x.hasOwnProperty("value") &&
    x.hasOwnProperty("label") &&
    (typeof x.value === "string" || typeof x.value === "number") && (typeof x.label === "string" || typeof x.value === "number")
  );
};
const convertTimestamp = (timeStamp: TimeStamp | Date): Date | null | Date[] => {

  if (timeStamp && Array.isArray(timeStamp)) {
    return timeStamp
  }
  if (timeStamp && timeStamp instanceof Date) {
    return timeStamp
  }
  if (timeStamp && typeof timeStamp === 'string' && Date.parse(timeStamp)) {
    return new Date(timeStamp)
  }
  if (!(timeStamp instanceof Date) && typeof timeStamp === "object" && timeStamp?.seconds && (typeof timeStamp.seconds === 'number' || typeof timeStamp.seconds === 'string')) {
    let dateStart = new Date(1970, 0, 1); // Epoch
    dateStart.setSeconds(Number(timeStamp.seconds));
    return dateStart
  }
  return null
}
const defaultDays: Selected[] = [
  { label: "Sundays", value: 0 },
  { label: "Mondays", value: 1 },
  { label: "Tuesdays", value: 2 },
  { label: "Wednesdays", value: 3 },
  { label: "Thursdays", value: 4 },
  { label: "Fridays", value: 5 },
  { label: "Saturdays", value: 6 },
]
const defaultGenome: Selected[] = [
  { label: "Sativa", value: 'sativa' },
  { label: "Hybrid", value: 'hybrid' },
  { label: "Indica", value: 'indica' },
  { label: "CBD", value: 'cbd' },
];
const FlexSpacer = styled("div", ({ $theme, $width = `16px` }) => {
  return {
    height: '100%',
    width: $width,
  };
});
const FlexContainer = styled("div", ({ $theme }) => {
  return {
    width: `100%`,
    //textAlign: "center",
    display: "flex",
    alignContent: "space-between",
    alignItems: "center",
    justifyContent: "center",
  };
});

const CreateProduct = () => {
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

  const nameRef = useRef<HTMLDivElement>(null);
  const collectionRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const { width, height } = useWindowSize();
  const [availableDays, setAvailableDays] = useState(defaultDays);
  const executeScroll = (ref: { current: HTMLDivElement | null }) => {
    width < 450 && ref && ref.current.scrollIntoView();
  };
  const { user } = useUser();
  //const [loading, setLoading] = useState(false);
  const { form, setForm, error, setError, loading, setLoading } = useForm();
  const [collectionList, setCollectionList] = useState([]);
  const [brandList, setBrandList] = useState([]);
  const { setNavLoading, navLoading } = useRouting();
  const { modalBaseDispatch, modalBaseState } = useDispatchModalBase();
  const { enqueue, dequeue } = useSnackbar();
  const fireCollections = useFirestoreQuery(user?.uid && firebase.firestore().collection("collections"));
  const fireBrands = useFirestoreQuery(user?.uid && firebase.firestore().collection("brands"));

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

  /* collection setup */
  useEffect(() => {
    console.log("collection setup");
    let _collections: Selected[] = [];
    console.log(fireCollections.data);
    const collections = fireCollections.data as Collection;
    console.log(collections);

    if (collections) {
      for (const key in collections) {
        _collections.push({ value:`${collections[key].id}`, label:`${collections[key].title}` });
      }
    }

    setCollectionList(_collections);
    return () => {
      setCollectionList([]);
    };
  }, [fireCollections]);

  /* brand setup */
  useEffect(() => {
    let _brands: Selected[] = [];
    const brands = fireBrands.data as Brand;
    if (brands) {
      for (const key in brands) {
        _brands.push({ value: brands[key].id, label: brands[key].title });
      }
    }
    setBrandList(_brands);
    return () => {
      setBrandList([]);
    };
  }, [fireBrands.data]);




  /* form setup */
  useEffect(() => {
    console.log("form setup");
    setForm({ ...defaultForm } as ProductClass);
    return () => {
      setForm({});
      setError({});
    };
  }, [defaultForm]);





  const createProduct = async () => {
    const _form: ProductClass = { ...form };
    // ** NAME **
    if (isEmpty(_form?.name)) {
      nameRef.current.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
      setError((oldError: Errors) => ({ ...oldError, ...{ name: "Name Required" } }));
      return;
    }
    // ** COLLECTION **
    if (!(_form.collections && _form.collections.length)) {
      collectionRef.current.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
      setError((oldError: Errors) => ({ ...oldError, ...{ collections: "Collection Required" } }));
      return;
    }
    // ** BRAND **
    //alert(JSON.stringify(_form.brand))
    if (!(_form.brand instanceof Array && isValidObject(_form.brand[0]))) {

      brandRef.current.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
      setError((oldError: Errors) => ({ ...oldError, ...{ brand: "Brand Required" } }));
      return;
    }
    _form.brand = _form.brand[0]
    // ** PRICE **
    if (isEmpty(_form?.price)) {
      priceRef.current.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
      setError((oldError: Errors) => ({ ...oldError, ...{ price: "Price Required" } }));
      return;
    }
    // ** WHOLESALE **
    if (isEmpty(_form?.wholesale)) {
      priceRef.current.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
      setError((oldError: Errors) => ({ ...oldError, ...{ wholesale: "Wholesale Required" } }));
      return;
    }
    // ** WHOLESALE **
    if (isEmpty(_form?.inventory)) {
      priceRef.current.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
      setError((oldError: Errors) => ({ ...oldError, ...{ inventory: "Inventory Required" } }));
      return;
    }


    setLoading(true);
    enqueue({ message: "Creating Product", progress: true }, DURATION.infinite);
    try {
      const updateProduct = firebase.functions().httpsCallable("createProduct");
      const response = await updateProduct(_form);
      dequeue();
      enqueue({ message: "Product Created", startEnhancer: ({ size }) => <Check size={size} /> }, DURATION.short);
      closeModal()
      if (response?.data?.success === true) {
        //alert(`${response?.data?.form}`)
        //console.log(response?.data?.form);
        //setFireProductDefault({...response?.data?.form});
        //setForm({...response?.data?.form});
      }
    } catch (e) {
      //setError(`${e?.message || e}`);
      setError((oldError: Errors) => ({ ...oldError, ...{ server: `Product not created.` } }));
      dequeue();
      showToast(`${e?.message || e}`);
      enqueue({ message: `Your product wasn't created`, startEnhancer: ({ size }) => <DeleteAlt size={size} /> }, DURATION.short);
    } finally {
      setLoading(false);
    }
  };



  const [data, setData] = useState(null)
  const [progress, setProgress] = useState(null)
  const [file, setFile] = useState(null)
  const { fireCustomer } = useUser()
  const taskRef = useRef(null)
  const [photoURL, setPhotoURL] = useState(null)


  // useEffect(() => {
  //   alert(JSON.stringify(collectionList))
  // }, [collectionList]);


  const handleChange = (acceptedFiles) => {
    //e.stopPropagation()
    //alert(JSON.stringify(acceptedFiles))
    setData(acceptedFiles[0])
    setFile(acceptedFiles[0].name)
    setError(false)
    setPhotoURL(URL.createObjectURL(acceptedFiles[0]))
  }
  const updateProfile = async (photoURL) => {
    setLoading(true)
    try {
      const fieldUpdate = { photoURL }
      await updateFirestore("users", fireCustomer?.data?.uid, fieldUpdate)
      NotificationManager.success("License Updated")
      closeModal()
    } catch (e) {
      setLoading(false)
      setError(`${e?.message || e || 'ERROR'}`)
      NotificationManager.error(e.message)
    }
  }
  // const uploadImgComplete = async (filePath) => {
  //   (`${storage}/${file.name}`)
  //   try {
  //     const photoURL = await taskRef.current.snapshot.ref.getDownloadURL()
  //     setForm({ ...form, ...{ [formKey]: photoURL, filePath:`${filePath}` } })
  //     Boolean(fireCustomer?.data?.uid) && updateProfile(photoURL)
  //     closeModal()
  //     return
  //   } catch (e) {
  //     setError(`${e?.message||e||'ERROR'}`)
  //     setLoading(false)
  //     return
  //   }
  // }
  const uploadImgError = (e) => (setError(`${e?.message || e || 'ERROR'}`), setLoading(false))
  const uploadImgNext = (snap) => {
    return setProgress(~~((snap.bytesTransferred / snap.totalBytes) * 100))
  }
  const uploadImgToFireStorage = useCallback((acceptedFiles) => {
    setLoading(true)
    const file = acceptedFiles[0]
    const filePath = `${"Products"}/${file.name}_${new Date().getTime()}`
    taskRef.current = firebase
      .storage()
      .ref()
      .child(filePath)
      .put(file, { contentType: file.type })

    taskRef.current.on(
      firebase.storage.TaskEvent.STATE_CHANGED,
      uploadImgNext,
      uploadImgError,
      async () => {
        try {
          const photoURL = await taskRef.current.snapshot.ref.getDownloadURL()
          setForm((oldForm:ProductClass) => ({ ...oldForm, ...{ photoURL: photoURL, filePath } }))
          Boolean(fireCustomer?.data?.uid) && updateProfile(photoURL)
          setProgress(0)
          setLoading(false)
          //closeModal()
          return
        } catch (e) {
          setError(`${e?.message || e || 'ERROR'}`)
          setLoading(false)
          return
        }
      }
    )
  }, [taskRef, user, data])




  const [imgURL, setImgURL] = useState(null)
  const [arrivalState, setArrivalState] = useState([new Date()])



  const getImgURL = async () => {
    const filePath = `placeholders/placeholder-images-image_license.png`
    if (user?.uid) {
      const storage = user.uid && firebase.storage()
      const storageRef = storage && storage.ref()
      let url = null
      // "https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2Fstock-placeholder.png?alt=media&token=57d6b3da-4408-4867-beb7-7957669937dd"
      if (
        typeof filePath === "string" &&
        filePath.length > 0 &&
        storage
      ) {
        try {
          url = await storageRef
            .child(`${typeof filePath === "string" ? filePath : ""}`)
            .getDownloadURL()
        } catch (e) {
          console.log("error")
          console.log(e)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
      return setImgURL(url)
    }
  }

  useEffect(() => {
    getImgURL()
  }, [])


  return (
    <>
      <ModalHeader>Create VIP</ModalHeader>
      <ModalBody>

        {/** Name */}
        <FormSection ref={nameRef}>
          <FormInput style={formStyle} label={<Label2>{"Name"}</Label2>} stack={true}>
            <FormControl error={error?.name}>
              <Input
                required
                disabled={loading}
                onChange={(e) => {
                  const str = e?.currentTarget?.value;
                  setForm((oldForm: ProductClass) => ({ ...oldForm, ...{ name: str } }));
                }}
                value={form?.name}
                onFocus={() =>
                  //executeScroll(nameRef),
                  setError({})
                }
                key="name"
                id="name"
                name="name"
                error={Boolean(error?.name)}
                type="text"
                placeholder="ex. Jack Herrer"
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
        {/** Collection **/}
        <FormSection ref={collectionRef}>
          <FormInput style={formStyle} label={<Label2>{"Dates"}</Label2>} stack={true}>
            Arrival
            <FormControl error={error?.collections}>
  
            <DatePicker
              value={arrivalState}
              onChange={({ date }) =>
                setArrivalState(Array.isArray(date) ? date : [date])
              }
            />

            </FormControl>
            Arrival
            <FormControl error={error?.collections}>
  
            <DatePicker
              value={arrivalState}
              onChange={({ date }) =>
                setArrivalState(Array.isArray(date) ? date : [date])
              }
            />

            </FormControl>
          </FormInput>
        </FormSection>
        {/** Brand **/}
        <FormSection ref={brandRef}>
          <FormInput style={formStyle} label={<Label2>{"Brand"}</Label2>} stack={true}>
            <FormControl error={error?.brand}>
              <Select
                //size={(width < 375) ? SIZE.compact : SIZE.default}
                options={brandList}
                //multi
                clearable={false}
                value={form?.brand || []}
                labelKey="label"
                valueKey="value"
                placeholder="Select brand"
                maxDropdownHeight={`240px`}
                onChange={(props: Params) => {
                  const filteredString = [];
                  const filteredSelected = []
                  const { option, value, type } = props
                  let filteredValue = value
                  if (type === 'remove') {
                    //filteredValue = ((value||[]).filter((x: Selected) => Number(x.value) !== Number(option.value))) 
                  } else if (type === 'select') {
                    //filteredValue = value
                  } else if (type === 'clear') {
                    //filteredValue = []
                  }
                  // for (const key in filteredValue) {
                  //   const filteredSelect: Selected = { value: '', label: '' }
                  //   filteredSelect.value = `${value[key].value}`
                  //   filteredSelect.label = `${value[key].label}`
                  //   filteredString.push(`${value[key].value}`);
                  //   filteredSelected.push(filteredSelect);
                  // }
                  setForm((oldForm: ProductClass) => ({ ...oldForm, brand: value }));

                }}
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
              />
            </FormControl>
          </FormInput>
        </FormSection>
        {/** Image **/}
        <FormSection ref={imageRef}>
          <FormInput style={formStyle} label={<Label2>{"Image"}</Label2>} stack={true}>
          {
              <Card
              overrides={{
                Root: { style: { width: '100%' } },
                HeaderImage: {
                  style: ({ $theme }) => ({ minHeight: "193px" })
                }
              }}
                headerImage={
                  (photoURL && photoURL.length) ? photoURL : imgURL
                }
              // phoneNumber="Example card"
              >
                <StyledBody>
                  <FileUploader

                    // progressAmount is a number from 0 - 100 which indicates the percent of file transfer completed
                    accept={["image/jpeg", "image/jpg", 'image/png']}
                    onCancel={()=>{
                      taskRef.current.cancel()
                      setProgress(0)
                      getImgURL()
                      setPhotoURL(null)
                    }}
                    progressAmount={progress}
                    progressMessage={
                      progress
                        ? `Uploading... ${progress}% of 100%`
                        : ''
                    }
                    onDrop={(acceptedFiles, rejectedFiles) => {
                      // handle file upload...
                      console.log(acceptedFiles, rejectedFiles)
                      if (acceptedFiles.length) {
                        handleChange(acceptedFiles)
                        uploadImgToFireStorage(acceptedFiles)
                      }
                      if(rejectedFiles.length){
                        setError((oldError)=>({
                          ...oldError,
                          ...{phoneNumber:'Invalid type'}
                        }))
                      }
                      

                    }}
                    errorMessage={error?.photoURL}
                  />
                </StyledBody>

              </Card>}
     
          </FormInput>
        </FormSection>
        {/** PRICE */}
        <FormSection ref={priceRef}>
          <FormInput style={formStyle} label={<Label2>{"Pricing"}</Label2>} stack={true}>
            <FlexContainer>
              <FormControl
                error={error?.price}
                caption={() => "Price"}
                overrides={{
                  Caption: {
                    style: ({ $theme }) => ({

                    })
                  }
                }}
              >
                <Input
                  required
                  startEnhancer='$'
                  disabled={loading}
                  onChange={(e) => {
                    const str = e?.currentTarget?.value;
                    setForm((oldForm: ProductClass) => ({ ...oldForm, ...{ price: Number(str) || '' } }));
                  }}
                  value={form?.price}
                  onFocus={() =>
                    //executeScroll(priceRef),
                    setError({})
                  }
                  key="price"
                  id="price"
                  name="price"
                  error={Boolean(error?.price)}
                  type="number"
                  placeholder="0.00"
                  overrides={{
                    Root: {
                      style: ({ $theme }) => ({
                        //marginBottom: "16px",
                      }),
                    },
                  }}
                />
              </FormControl>
              <FlexSpacer />
              <FormControl caption={() => 'Compare price'} error={error?.comparePrice}>
                <Input
                  //required
                  startEnhancer='$'
                  disabled={loading}
                  onChange={(e) => {
                    const str = e?.currentTarget?.value;
                    setForm((oldForm: ProductClass) => ({ ...oldForm, ...{ comparePrice: Number(str) || '' } }));
                  }}
                  value={form?.comparePrice}
                  onFocus={() =>
                    //executeScroll(comparePriceRef),
                    setError({})
                  }
                  key="comparePrice"
                  id="comparePrice"
                  name="comparePrice"
                  error={Boolean(error?.comparePrice)}
                  type="number"
                  placeholder="0.00"
                  overrides={{
                    Root: {
                      style: ({ $theme }) => ({
                        //marginBottom: "16px",
                      }),
                    },
                  }}
                />
              </FormControl>
            </FlexContainer>
            <FlexContainer>

              <FormControl caption={() => 'Wholesale'} error={error?.wholesale}>
                <Input
                  required
                  disabled={loading}
                  startEnhancer='$'
                  onChange={(e) => {
                    const str = e?.currentTarget?.value;
                    setForm((oldForm: ProductClass) => ({ ...oldForm, ...{ wholesale: Number(str) || '' } }));
                  }}
                  value={form?.wholesale}
                  onFocus={() =>
                    //executeScroll(wholesaleRef),
                    setError({})
                  }
                  key="wholesale"
                  id="wholesale"
                  name="wholesale"
                  error={Boolean(error?.wholesale)}
                  type="number"
                  placeholder="0.00"
                  overrides={{
                    Root: {
                      style: ({ $theme }) => ({
                        // marginBottom: "16px",
                      }),
                    },
                  }}
                />
              </FormControl>


              <FlexSpacer />
              <FormControl
                error={error?.inventory}
                caption={() => "Inventory"}
                overrides={{
                  Caption: {
                    style: ({ $theme }) => ({

                    })
                  }
                }}
              >
                <Input
                  required
                  //startEnhancer='$'
                  disabled={loading}
                  onChange={(e) => {
                    const str = e?.currentTarget?.value;
                    setForm((oldForm: ProductClass) => ({ ...oldForm, ...{ inventory: Number(str) || '' } }));
                  }}
                  value={form?.inventory}
                  onFocus={() =>
                    //executeScroll(inventoryRef),
                    setError({})
                  }
                  key="inventory"
                  id="inventory"
                  name="inventory"
                  error={Boolean(error?.inventory)}
                  type="number"
                  placeholder="0"
                  overrides={{
                    Root: {
                      style: ({ $theme }) => ({
                        //marginBottom: "16px",
                      }),
                    },
                  }}
                />
              </FormControl>
            </FlexContainer>
          </FormInput>
        </FormSection>
        {/** Details */}
        <FormSection ref={detailsRef}>
          <FormInput style={formStyle} label={<Label2>{"Details"}</Label2>} stack={true}>
            <FlexContainer>
              <FormControl caption={() => 'Type'} error={error?.type}>
                <Select
                  //size={(width < 375) ? SIZE.compact : SIZE.default}
                  options={defaultGenome}
                  //multi
                  //clearable={false}
                  value={form?.genome || []}
                  labelKey="label"
                  valueKey="value"
                  placeholder="Select type"
                  maxDropdownHeight={`240px`}
                  onChange={(props: Params) => {
                    const filteredString = [];
                    const filteredSelected = []
                    const { option, value, type } = props
                    let filteredValue = value
                    if (type === 'remove') {
                      //filteredValue = ((value||[]).filter((x: Selected) => Number(x.value) !== Number(option.value))) 
                    } else if (type === 'select') {
                      //filteredValue = value
                    } else if (type === 'clear') {
                      //filteredValue = []
                    }
                    // for (const key in filteredValue) {
                    //   const filteredSelect: Selected = { value: '', label: '' }
                    //   filteredSelect.value = `${value[key].value}`
                    //   filteredSelect.label = `${value[key].label}`
                    //   filteredString.push(`${value[key].value}`);
                    //   filteredSelected.push(filteredSelect);
                    // }
                    setForm((oldForm: ProductClass) => ({ ...oldForm, genome: value}));

                  }}
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
                />
              </FormControl>
              <FlexSpacer />
              <FormControl caption={() => 'Weight'} error={error?.weight}>
                <Input
                  required
                  disabled={loading}
                  onChange={(e) => {
                    const str = e?.currentTarget?.value;
                    setForm((oldForm: ProductClass) => ({ ...oldForm, ...{ weight: str } }));
                  }}
                  value={form?.weight}
                  onFocus={() =>
                    //executeScroll(weightRef),
                    setError({})
                  }
                  key="weight"
                  id="weight"
                  name="weight"
                  error={Boolean(error?.weight)}
                  type="text"
                  placeholder="1g"
                  overrides={{
                    Root: {
                      style: ({ $theme }) => ({
                        //marginBottom: "16px",
                      }),
                    },
                  }}
                />
              </FormControl>
            </FlexContainer>
            <FlexContainer>
              <FormControl caption={() => 'THC'} error={error?.thc}>
                <Input
                  //required
                  disabled={loading}
                  onChange={(e) => {
                    const str = e?.currentTarget?.value;
                    setForm((oldForm: ProductClass) => ({ ...oldForm, ...{ thc: str } }));
                  }}
                  value={form?.thc}
                  onFocus={() =>
                    //executeScroll(thcRef),
                    setError({})
                  }
                  key="thc"
                  id="thc"
                  name="thc"
                  error={Boolean(error?.thc)}
                  type="text"
                  placeholder="00.0"
                  overrides={{
                    Root: {
                      style: ({ $theme }) => ({
                        // marginBottom: "16px",
                      }),
                    },
                  }}
                />
              </FormControl>
              <FlexSpacer />
              <FormControl caption={() => 'CBD'} error={error?.cbd}>
                <Input
                  required
                  disabled={loading}
                  onChange={(e) => {
                    const str = e?.currentTarget?.value;
                    setForm((oldForm: ProductClass) => ({ ...oldForm, ...{ cbd: str } }));
                  }}
                  value={form?.cbd}
                  onFocus={() =>
                    //executeScroll(cbdRef),
                    setError({})
                  }
                  key="cbd"
                  id="cbd"
                  name="cbd"
                  error={Boolean(error?.cbd)}
                  type="text"
                  placeholder="00.0"
                  overrides={{
                    Root: {
                      style: ({ $theme }) => ({
                        // marginBottom: "16px",
                      }),
                    },
                  }}
                />
              </FormControl>
            </FlexContainer>
            <Textarea
              value={form?.description}
              onChange={(e) => {
                const str = e?.currentTarget?.value;
                setForm((oldForm: ProductClass) => ({ ...oldForm, ...{ description: str } }));
              }}
              placeholder="Product description"
              clearOnEscape
            />
          </FormInput>
        </FormSection>


        {/* <div style={{ width: "100%", height: 65 }}></div> */}
        <Accordion>
          <Panel title="Form Dev">{
            <>
              {
                form &&
                Object.keys(form).map(function (key, index) {
                  //alert(fireProductDefault[key])
                  return <div>{`${key} : ${JSON.stringify(form[key])}`}</div>;
                })
              }
            </>
          }</Panel>
        </Accordion>
        {/* {form && JSON.stringify(form)} */}
        {/* {fireProductDefault && JSON.stringify(fireProductDefault)} */}

        {
          <>
            {/*   <div>Form</div>
             {
                // Object.entries(fireProductDefault).map(function(key, value) {
                //     <>{`${key} : ${value}`}</>
                // })
                form &&
                  Object.keys(form).map(function (key, index) {
                    //alert(fireProductDefault[key])
                    return <div>{`${key} : ${JSON.stringify(form[key])}`}</div>;
                  })
              } */}
          </>
        }
        {/*    <div style={{ width: "100%", height: 65 }}></div>

              {
                  <>
                    <div>Default</div>
                    {
                    // Object.entries(fireProductDefault).map(function(key, value) {
                    //     <>{`${key} : ${value}`}</>
                    // })  
                    fireProductDefault && Object.keys(fireProductDefault).map(function(key, index) {
                      //alert(fireProductDefault[key])
                      return <div>{`${key} : ${JSON.stringify(fireProductDefault[key])}`}</div>
                    })
                    }                
                  
                  </>
              } */}
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
        <ModalButton isLoading={loading} onClick={createProduct}>
          Create
        </ModalButton>
      </ModalFooter>
    </>
  );
};
export default CreateProduct;

import { useState, useEffect, useRef, Fragment, useCallback } from "react";
import { isEmpty } from "../../../../helpers";
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

class InventoryClass {
  inventory:number;
  constructor(
    inventory:number,
  ) {
    this.inventory = inventory;
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
  brandId: string;
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

  constructor(
    id: string | null,
    genome: Selected,
    brandID: string,
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
    brandId: string,
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
  ) {
    this.id = id;
    this.genome = genome;
    this.brandID = brandID;
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
    this.brandId = brandId;
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
  }
}

const Inventory = ({product}:{product:ProductClass}) => {
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
  const { user, fireBrands, fireCollections, fireCustomer } = useUser();
  //const [loading, setLoading] = useState(false);
  const { form, setForm, error, setError, loading, setLoading } = useForm();
  const [collectionList, setCollectionList] = useState([]);
  const { setNavLoading, navLoading } = useRouting();
  const { modalBaseDispatch, modalBaseState } = useDispatchModalBase();
  const { enqueue, dequeue } = useSnackbar();
  //const fireCollections = useFirestoreQuery(user?.uid && firebase.firestore().collection("collections"));
  //const fireBrands = useFirestoreQuery(user?.uid && firebase.firestore().collection("brands"));
  const defaultForm = new InventoryClass(
    product.inventory, // inventory:string,
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
    setForm({ ...defaultForm } as InventoryClass);
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



  const createUser = useCallback(async () => {
    const _form = { ...form }
    const _error = { ...error }

    if (isEmpty(_form?.inventory)) {
      _error.inventory = "Name required."
      return setError({ ..._error })
    }
    if (isEmpty(`${_form?.phoneNumber||''}`)) {
      _error.phoneNumber = "Phone required."
      return setError({ ..._error })
    }

    const phoneNumber = parsePhoneNumber(`${_form?.phoneNumber || ""}`, `US`)
    if (!phoneNumber || !phoneNumber.isValid()) {
      _error.phoneNumber = "Phone invalid."
      return setError({ ..._error })
    }
    _form.phoneNumber = phoneNumber.format("E.164")

    if (!_form?.photoURL) {
      delete _form.photoURL
    }

    setLoading(true);
    enqueue({ message: "Creating User", progress: true }, DURATION.infinite);
    try {
      await createAuthUser(_form)
      dequeue();
      enqueue({ message: "User Created", startEnhancer: ({ size }) => <Check size={size} /> }, DURATION.short);
      closeModal()
    } catch (error:any) {
        //setError(`${e?.message || e}`);
        setError((oldError: Errors) => ({ ...oldError, ...{ server: `User not created` } }));
        dequeue();
        showToast(`${error?.message || error}`);
        enqueue({ message: `User wasn't added`, startEnhancer: ({ size }) => <DeleteAlt size={size} /> }, DURATION.short);
    } finally {
      setLoading(false);
    }
  }, [form, error])



  const updateProfile = async (photoURL) => {
    setLoading(true)
    try {
      const fieldUpdate = { photoURL }
      await updateFirestore("users", fireCustomer?.data?.uid, fieldUpdate)
      //NotificationManager.success("License Updated")
      closeModal()
    } catch (e) {
      setLoading(false)
      setError(`${e?.message || e || 'ERROR'}`)
      //NotificationManager.error(e.message)
    }
  }

  useEffect(() => {
      return () => {   
        setLoading(false)
      };
  }, []);

  const handleClick = useCallback(async (product:ProductClass) => {
      form.inventory = +form.inventory
    if (typeof form.inventory === 'number' && form.inventory !== NaN) {
      setLoading(true)
      //alert(form.inventory)
      //alert(product.id)
      //return
    enqueue({ message: "Updating inventory", progress: true }, DURATION.infinite);
    setTimeout(async () => {
      try {
        const fieldUpdate = { inventory: form?.inventory }
        await updateFirestore("products", product.id, fieldUpdate)
        //NotificationManager.success("Inventory Updated")
        //alert('k')
      dequeue();
      enqueue({ message: "Inventory Updated", startEnhancer: ({ size }) => <Check size={size} /> }, DURATION.short);
      closeModal()
      } catch (e) {
        setLoading(false)
        showToast(`${error?.message || error}`);
        setError((oldError: Errors) => ({ ...oldError, ...{ server: `Inventory not updated` } }));
        dequeue();
        enqueue({ message: `Inventory not updated`, startEnhancer: ({ size }) => <Check size={size} /> }, DURATION.short);
        //NotificationManager.error(e.message)
      }finally{ 
        setLoading(false)
      }
    }, 2000);
    }else{
      enqueue({ message: `Invalid number`, startEnhancer: ({ size }) => <Check size={size} /> }, DURATION.short);
    }
  }, [form, fireCustomer])


  return (
    <>
      <ModalHeader>{`Edit ${product.name} inventory`}</ModalHeader>
      <ModalBody>
        {/** Title */}
        {/* <FormSection ref={titleRef}>
          <FormInput style={formStyle} label={<Label2>{"User Name"}</Label2>} stack={true}> */}
            <FormControl error={error?.inventory}>
              <Input
                required
                disabled={loading}
                onChange={(e) => {
                  const str = e?.currentTarget?.value;
                  setForm((oldForm: InventoryClass) => ({ ...oldForm, ...{ inventory: str } }));
                }}
                value={form?.inventory}
                onFocus={() => (
                  //executeScroll(titleRef), 
                  setError({})
                )}
                key="inventory"
                id="inventory"
                name="inventory"
                error={Boolean(error?.inventory)}
                type="tel"
                placeholder="Inventory"
                clearable
                clearOnEscape
                overrides={{
                  Root: {
                    style: ({ $theme }) => ({
                      marginBottom: "16px",
                      minWidth:'260px'
                    }),
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
        <ModalButton disabled={loading} onClick={closeModal} kind={ButtonKind.tertiary}>Cancel</ModalButton>
        <ModalButton disabled={fireCustomer?.data?.inventory === form?.inventory || !form?.inventory?.length || loading } isLoading={loading} 
        onClick={()=>handleClick(product)}>
          Save
        </ModalButton>
      </ModalFooter>
    </>
  );
};
export default Inventory;

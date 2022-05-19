import { useState, useEffect, useRef, Fragment, ReactElement } from "react";
import LiveSwitch from "./components/LiveSwitch";
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
import { Accordion, Panel } from "baseui/accordion";
import { SIZE } from 'baseui/input';
import { Textarea } from "baseui/textarea";

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
interface Brand {
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
class BrandClass {
  active: boolean;
  cartLimit: number | null;
  description: string | null;
  featured: boolean;
  filePath: string | null;
  flower: boolean;
  genome: string | null;
  id: string | null;
  img: string | null;
  key: string | null;
  menuOrder: number | null;
  onSale: boolean;
  productsTotal: number | null;
  saleCode: string | null;
  saleRate: number | null;
  saleTitle: string | null;
  sales: number | null;
  sold: number | null;
  title: string | null;
  total: number | null;
  weight: boolean;

  constructor(
    active: boolean,
    cartLimit: number | null,
    description: string | null,
    featured: boolean,
    filePath: string | null,
    flower: boolean,
    genome: string | null,
    id: string | null,
    img: string | null,
    key: string | null,
    menuOrder: number | null,
    onSale: boolean,
    productsTotal: number | null,
    saleCode: string | null,
    saleRate: number | null,
    saleTitle: string | null,
    sales: number | null,
    sold: number | null,
    title: string | null,
    total: number | null,
    weight: boolean,
  ) {
    this.active = active
    this.cartLimit = cartLimit
    this.description = description
    this.featured = featured
    this.filePath = filePath
    this.flower = flower
    this.genome = genome
    this.id = id
    this.img = img
    this.key = key
    this.menuOrder = menuOrder
    this.onSale = onSale
    this.productsTotal = productsTotal
    this.saleCode = saleCode
    this.saleRate = saleRate
    this.saleTitle = saleTitle
    this.sales = sales
    this.sold = sold
    this.title = title
    this.total = total
    this.weight = weight
  }
}
interface Errors {
  title?: string;
  description?: string;
}

interface BrandProps {
  fireBrand: BrandClass;
}


const defaultForm = new BrandClass(
  false,// active: boolean,
  null,// cartLimit: number | null,
  null,// description: string | null,
  false,// featured: boolean,
  null,// filePath: string | null,
  null,// flower: boolean,
  null,// genome: string | null,
  null,// id: string | null,
  null,// img: string | null,
  null,// key: string | null,
  null,// menuOrder: number | null,
  false,// onSale: boolean,
  null,// productsTotal: number | null,
  null,// saleCode: string | null,
  null,// saleRate: number | null,
  null,// saleTitle: string | null,
  null,// sales: number | null,
  null,// sold: number | null,
  null,// title: string | null,
  null,// total: number | null,
  false,// weight: boolean,
  //null
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
const TaxFreeSpacer = styled("div", {
  width: `100%`,
  height: "47px",
});
const HappyHourSpacer = styled("div", {
  width: `100%`,
  height: "60px",
});
const HappyHourSpacerTwo = styled("div", {
  width: `100%`,
  height: "60px",
});

type INullableReactText = React.ReactText | null;

interface TimeStamp {
  seconds: number;
  nanoSeconds: number;
}


const defaultDays: Selected[] = [
  { label: "Sundays", value: 0 },
  { label: "Mondays", value: 1 },
  { label: "Tuesdays", value: 2 },
  { label: "Wednesdays", value: 3 },
  { label: "Thursdays", value: 4 },
  { label: "Fridays", value: 5 },
  { label: "Saturdays", value: 6 },
];

const EditBrand = ({ fireBrand }): ReactElement => {
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
    setDataList,
  } = useQuery();

  //const [fireBrandState, setFireBrandState] = useState<BrandClass>(fireBrand);
  const [fireBrandDefault, setFireBrandDefault] = useState<BrandClass>({ ...fireBrand });

  const [value, setValue] = useState([]);
  useEffect(() => {
    //alert(JSON.stringify(fireStoreQuery))
    const thisBrandLive = (fireStoreQuery?.data || []).filter((x: BrandClass) => x.id === fireBrand.id);
    //alert('update default' )

    setFireBrandDefault({ ...defaultForm, ...thisBrandLive[0] });
  }, [fireStoreQuery.data]);

  //alert(JSON.stringify(fireBrand))
  //save this too a state

  const titleRef = useRef<HTMLDivElement>(null);

  const detailsRef = useRef<HTMLDivElement>(null);


  const { width, height } = useWindowSize();
  const executeScroll = (ref: { current: HTMLDivElement | null }) => {
    width < 450 && ref && ref.current.scrollIntoView();
  };
  const { user, fireCollections, fireBrands } = useUser();
  //const [loading, setLoading] = useState(false);
  const { form, setForm, error, setError, loading, setLoading } = useForm();
  const [collectionList, setCollectionList] = useState([]);
  const [brandList, setBrandList] = useState([]);
  const [changeError, setChangeError] = useState(null);
  const [availableDays, setAvailableDays] = useState(defaultDays);
  const { setNavLoading, navLoading } = useRouting();
  const { modalBaseDispatch, modalBaseState } = useDispatchModalBase();
  const { enqueue, dequeue } = useSnackbar();



  const [toastKey, setToastKey] = useState<INullableReactText>(null);
  const showToast = (x: string) => setToastKey(toaster.negative(`${x}`, {}));
  const [searchBrands, setSearchBrands] = useState([]);

  const [hasChanges, setHasChanges] = useState(false);



  /* Changes Checker*/
  useEffect(() => {
    //form?.dateEnd.toDate().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    // if(form?.endHour){
    //  // alert(JSON.stringify(form?.endHour))
    // }
    console.log("Changes Checker");
    //alert(new Date(form?.dateStart.toDate().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })))
    //let changes:boolean = !deepEqual(fireBrandDefault, form)
    let changes: boolean = false;
    const _default: BrandClass = { ...fireBrandDefault };
    const _state: BrandClass = { ...form };

    try {
      const _deepEqual = assert.deepStrictEqual(_default, _state);
      changes = false;
      //alert(JSON.stringify(_deepEqual))
    } catch (e) {
      //alert(JSON.stringify(`error - ${e}`))
      setChangeError(e);
      changes = true;
    }

    // if(!deepEqual(fireBrandDefault, form)){
    //   changes = true
    // }
    setHasChanges(changes);
    return () => {
      setHasChanges(false);
    };
  }, [fireBrandDefault, form]);



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
    let _collections: Selected[] = [];
    console.log(fireBrands.data);
    const collections = fireBrands.data as Brand;
    console.log(collections);

    if (collections) {
      for (const key in collections) {
        _collections.push({ value: collections[key].id, label: collections[key].title });
      }
    }

    setBrandList(_collections);
    return () => {
      setBrandList([]);
    };
  }, [fireBrands]);

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
    const thisBrandLive = (fireStoreQuery?.data || []).filter((x: BrandClass) => x.id === fireBrand.id);
    setForm({ ...defaultForm, ...thisBrandLive[0] } as BrandClass);
    console.log(JSON.stringify({ ...thisBrandLive[0] }))
    return () => {
      setForm({});
      setError({});
    };
  }, [defaultForm, fireStoreQuery?.data]);



  const updateBrand  = async () => {
    const _form: BrandClass = { ...form };

    // ** NAME **
    if (isEmpty(_form?.title)) {
      setError((oldError: Errors) => ({ ...oldError, ...{ title: "Title Required" } }));
      return;
    }
    // ** DESCRIPTION **
    if (isEmpty(_form?.description)) {
      setError((oldError: Errors) => ({ ...oldError, ...{ description: "Brief description required" } }));
      return;
    }
    // ** ID **
    if (isEmpty(_form?.id)) {
      showToast(`No Id provided`);
      return;
    }
    //return
    setLoading(true);
    enqueue({ message: "Updating Brand", progress: true }, DURATION.infinite);
    try {
      const updateBrand = firebase.functions().httpsCallable("updateBrand");
      const response = await updateBrand(_form);
      dequeue();
      enqueue({ message: "Brand Updated", startEnhancer: ({ size }) => <Check size={size} /> }, DURATION.short);
      closeModal()
      if (response?.data?.success === true) {
        //alert(`${response?.data?.form}`)
        //console.log(response?.data?.form);
        //setFireBrandDefault({...response?.data?.form});
        //setForm({...response?.data?.form});
      }
    } catch (e) {
      //setError(`${e?.message || e}`);
      setError((oldError: Errors) => ({ ...oldError, ...{ server: `Brand not created` } }));
      dequeue();
      showToast(`${e?.message || e}`);
      enqueue({ message: `Your brand wasn't created`, startEnhancer: ({ size }) => <DeleteAlt size={size} /> }, DURATION.short);
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
      <ModalHeader>Edit Brand</ModalHeader>


      <ModalBody>

        {/** Live */}
        <LiveSwitch />
        {/** Title */}
        <FormSection ref={titleRef}>
          <FormInput style={formStyle} label={<Label2>{"Title"}</Label2>} stack={true}>
            <FormControl error={error?.title}>
              <Input
                required
                disabled={loading}
                onChange={(e) => {
                  const str = e?.currentTarget?.value;
                  setForm((oldForm: BrandClass) => ({ ...oldForm, ...{ title: str } }));
                }}
                value={form?.title}
                onFocus={() =>
                  //executeScroll(titleRef),
                  setError({})
                }
                key="title"
                id="title"
                name="title"
                error={Boolean(error?.title)}
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
        {/** Details */}
        <FormSection ref={detailsRef}>
          <FormInput style={formStyle} label={<Label2>{"Details"}</Label2>} stack={true}>
            <Textarea
              value={form?.description}
              onChange={(e) => {
                const str = e?.currentTarget?.value;
                setForm((oldForm: BrandClass) => ({ ...oldForm, ...{ description: str } }));
              }}
              placeholder="Brand description"
              clearOnEscape
            />
          </FormInput>
        </FormSection>
        <Accordion>
          <Panel title="Form Dev">
            {
              <>
                {form &&
                  Object.keys(form).map(function (key, index) {
                    //alert(fireBrandDefault[key])
                    return <div>{`${key} : ${JSON.stringify(form[key])}`}</div>;
                  })}
              </>
            }
          </Panel>
          <Panel title="Database Dev">
            {
              <>
                {fireBrandDefault &&
                  Object.keys(fireBrandDefault).map(function (key, index) {
                    //alert(fireBrandDefault[key])
                    return <div>{`${key} : ${JSON.stringify(fireBrandDefault[key])}`}</div>;
                  })}
              </>
            }
          </Panel>
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
        <ModalButton onClick={closeModal} kind={ButtonKind.tertiary}>
          Cancel
        </ModalButton>
        <ModalButton disabled={!hasChanges} isLoading={loading} onClick={updateBrand}>
          Update
        </ModalButton>
      </ModalFooter>
    </>
  );
};
export default EditBrand;

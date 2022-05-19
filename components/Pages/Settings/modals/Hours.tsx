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
  createAuthUser,
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
import { Checkbox, LABEL_PLACEMENT, STYLE_TYPE } from "baseui/checkbox";
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
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid';
import { BlockProps } from 'baseui/block';

import { strict as assert } from "assert";
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
type OpenType = {
  open: {
    label: any,
    value: any
  },
  close: {
    label: any,
    value: any
  }
}
class HoursClass {
  sunday: OpenType | false;
  monday: OpenType | false;
  tuesday: OpenType | false;
  wednesday: OpenType | false;
  thursday: OpenType | false;
  friday: OpenType | false;
  saturday: OpenType | false;
  constructor(
    sunday: OpenType | false,
    monday: OpenType | false,
    tuesday: OpenType | false,
    wednesday: OpenType | false,
    thursday: OpenType | false,
    friday: OpenType | false,
    saturday: OpenType | false,
  ) {
    this.sunday = sunday;
    this.monday = monday;
    this.tuesday = tuesday;
    this.wednesday = wednesday;
    this.thursday = thursday;
    this.friday = friday;
    this.saturday = saturday;
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


const flexProps: BlockProps = {
  backgroundColor: 'mono300',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};
const selectProps: BlockProps = {
  //backgroundColor: 'mono300',
 // height: '56px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '10px'
};
const labelProps: BlockProps = {
  //backgroundColor: 'mono300',
  height: '48px',
  display: 'flex',
  alignItems: 'center',
  //justifyContent: 'center',
  paddingRight: '15px',
  marginBottom: '10px'
};

const override = {
  Popover: {
    props: {
      overrides: {
        Body: {
          style: ({ $theme }) => ({ zIndex: 100 }),
        },
      },
    },
  },
}


type INullableReactText = React.ReactText | null;

interface TimeStamp {
  seconds: number,
  nanoSeconds: number
}


const hoursList = [
  //{ label: "24 hours", value: 24 },
  { label: "12:00 AM", value: 0 },
  //{label:'12:30 AM',value:0.5},
  { label: "1:00 AM", value: 1 },
  //{label:'1:30 AM',value:1.5},
  { label: "2:00 AM", value: 2 },
  //{label:'2:30 AM',value:2.5},
  { label: "3:00 AM", value: 3 },
  //{label:'3:30 AM',value:3.5},
  { label: "4:00 AM", value: 4 },
  //{label:'4:30 AM',value:4.5},
  { label: "5:00 AM", value: 5 },
  //{label:'5:30 AM',value:4.5},
  { label: "6:00 AM", value: 6 },
  //{label:'6:30 AM',value:4.5},
  { label: "7:00 AM", value: 7 },
  //{label:'7:30 AM',value:4.5},
  { label: "8:00 AM", value: 8 },
  //{label:'8:30 AM',value:4.5},
  { label: "9:00 AM", value: 9 },
  //{label:'9:30 AM',value:4.5},
  { label: "10:00 AM", value: 10 },
  //{label:'10:30 AM',value:4.5},
  { label: "11:00 AM", value: 11 },
  //{label:'11:30 AM',value:4.5},
  { label: "12:00 PM", value: 12 },
  //{label:'12:30 PM',value:4.5},
  { label: "1:00 PM", value: 13 },
  //{label:'1:30 AM',value:1.5},
  { label: "2:00 PM", value: 14 },
  //{label:'2:30 AM',value:2.5},
  { label: "3:00 PM", value: 15 },
  //{label:'3:30 AM',value:3.5},
  { label: "4:00 PM", value: 16 },
  //{label:'4:30 AM',value:4.5},
  { label: "5:00 PM", value: 17 },
  //{label:'5:30 AM',value:4.5},
  { label: "6:00 PM", value: 18 },
  //{label:'6:30 AM',value:4.5},
  { label: "7:00 PM", value: 19 },
  //{label:'7:30 AM',value:4.5},
  { label: "8:00 PM", value: 20 },
  //{label:'8:30 AM',value:4.5},
  { label: "9:00 PM", value: 21 },
  //{label:'9:30 AM',value:4.5},
  { label: "10:00 PM", value: 22 },
  //{label:'10:30 AM',value:4.5},
  { label: "11:00 PM", value: 23 },
  //{ label: "12:00 PM", value: 24 },
  //{label:'11:30 AM',value:4.5},
];
const DeliveryFee = () => {
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
  const { user, fireBrands, fireCollections, fireUser, fireSettings } = useUser();
  //const [loading, setLoading] = useState(false);
  const { form, setForm, error, setError, loading, setLoading } = useForm();
  const [collectionList, setCollectionList] = useState([]);
  const [defaultHours, setDefaultHours] = useState<HoursClass>(null);
  const { setNavLoading, navLoading } = useRouting();
  const { modalBaseDispatch, modalBaseState } = useDispatchModalBase();
  const [value, setValue] = useState<any>([]);
  const { enqueue, dequeue } = useSnackbar();
  const [checkboxes, setCheckboxes] = useState([
    false,
    false,
  ]);
  

  const [changeError, setChangeError] = useState(null);
  
  //const fireCollections = useFirestoreQuery(user?.uid && firebase.firestore().collection("collections"));
  //const fireBrands = useFirestoreQuery(user?.uid && firebase.firestore().collection("brands"));
  const defaultForm = new HoursClass(
    fireSettings?.data?.sunday, //sunday:string,
    fireSettings?.data?.monday, //monday:string,
    fireSettings?.data?.tuesday, //tuesday:string,
    fireSettings?.data?.wednesday, //wednesday:string,
    fireSettings?.data?.thursday, //thursday:string,
    fireSettings?.data?.friday, //friday:string,
    fireSettings?.data?.saturday, //saturday:string,
  );


  useEffect(() => {
    const _defaultForm = new HoursClass(
      fireSettings?.data?.sunday, //sunday:string,
      fireSettings?.data?.monday, //monday:string,
      fireSettings?.data?.tuesday, //tuesday:string,
      fireSettings?.data?.wednesday, //wednesday:string,
      fireSettings?.data?.thursday, //thursday:string,
      fireSettings?.data?.friday, //friday:string,
      fireSettings?.data?.saturday, //saturday:string,
    );


    setDefaultHours(_defaultForm)
  }, [fireSettings?.data]);



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
      const _default: HoursClass = { ...defaultHours };
      const _state: HoursClass = { ...form };
  
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
    }, [defaultHours, form]);


  useEffect(() => {
    console.log('fireUser')
    console.log(fireUser)
  }, [fireUser]);

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
    setForm({ ...defaultForm } as HoursClass);
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

  const handleClick = async () => {
    const _error = { ...error }
    const _form = { ...form }

    ///create an extensive day checker
    if (!(_form.sunday === false || (_form.sunday.close && _form.sunday.open))) {
      showToast(`Sunday Invalid`);
      return
    }
    if (!(_form.monday === false || (_form.monday.close && _form.monday.open))) {
      showToast(`Monday Invalid`);
      return
    }
    if (!(_form.tuesday === false || (_form.tuesday.close && _form.tuesday.open))) {
      showToast(`Tuesday Invalid`);
      return
    }
    if (!(_form.wednesday === false || (_form.wednesday.close && _form.wednesday.open))) {
      showToast(`Wednesday Invalid`);
      return
    }
    if (!(_form.thursday === false || (_form.thursday.close && _form.thursday.open))) {
      showToast(`Thursday Invalid`);
      return
    }
    if (!(_form.friday === false || (_form.friday.close && _form.friday.open))) {
      showToast(`Friday Invalid`);
      return
    }
    if (!(_form.saturday === false || (_form.saturday.close && _form.saturday.open))) {
      showToast(`Saturday Invalid`);
      return
    }



    //alert(JSON.stringify(_form))



    //return
    setLoading(true);
    //enqueue({ message: "Updating Hours", progress: true }, DURATION.infinite);
    try {
      await mergeFirestore("admin", 'store', _form)
      //NotificationManager.success("Hours Updated")
      setLoading(false)
     // dequeue();
      enqueue({ message: "Hours Updated", startEnhancer: ({ size }) => <Check size={size} /> }, DURATION.short);
      closeModal()
    } catch (e) {
      setLoading(false)
      showToast(`${error?.message || error}`);
      setError((oldError: Errors) => ({ ...oldError, ...{ server: `Hours not updated` } }));
      dequeue();
      //NotificationManager.error(e.message)
    } finally {
      // setLoading(false)
    }
  }


  return (
    <>
      <ModalHeader>Edit Store Hours</ModalHeader>
      <ModalBody>




        <FlexGrid
          flexGridColumnCount={[1, 1, 2]}
          //flexGridColumnGap="scale800"
          //flexGridRowGap="scale800"
          $style={{ margin: '10px', maxWidth: '660px' }}
        >

          {/* Sunday */}
          <FlexGridItem {...labelProps}>
            <Label2>{"Sunday"}</Label2>
            <Checkbox
              checked={Boolean(form?.sunday)}
              onChange={e => {
                const nextCheckboxes = [...checkboxes];
                nextCheckboxes[0] = e.currentTarget.checked;
                if (nextCheckboxes[0]) {
                  setForm((oldForm: HoursClass) => ({
                    ...oldForm, ...{
                      sunday: {
                        open: {
                          label: "12:00 AM",
                          value: 0
                        },
                        close: {
                          label: "12:00 PM",
                          value: 24
                        }
                      }
                    }
                  }))
                } else {
                  setForm((oldForm: HoursClass) => ({ ...oldForm, ...{ sunday: false } }))
                }

                //setCheckboxes(nextCheckboxes);
              }}
              checkmarkType={STYLE_TYPE.toggle_round}
              labelPlacement="right"
            >
              {`${Boolean(form?.sunday) ? 'Open' : 'Closed'}`}
            </Checkbox>
          </FlexGridItem>
          <FlexGridItem {...selectProps}>
            {form?.sunday ? <><Select
              options={hoursList}
              value={form?.sunday?.open}
              placeholder={!form?.sunday ? "Open" : ''}
              labelKey="label"
              valueKey="value"
              onChange={params =>
                setForm((oldForm: HoursClass) => ({ ...oldForm, ...{ sunday: { open: params?.value[0], close: form.sunday ? form.sunday.close : '' } } }))
              }
              overrides={override}
              clearable={false}
              maxDropdownHeight={'260px'}
            /><div ><SVGIcon style={{ transform: 'scale(0.6)', margin: '0 4px' }} name='minus' /></div>
              <Select
                options={hoursList}
                value={form?.sunday?.close}
                placeholder={!form?.sunday ? "Close" : ''}
                labelKey="label"
                valueKey="value"
                onChange={params =>
                  setForm((oldForm: HoursClass) => ({ ...oldForm, ...{ sunday: { close: params?.value[0], open: form.sunday ? form.sunday.open : '' } } }))
                }
                overrides={override}
                clearable={false}
                maxDropdownHeight={'260px'}
              /></> : <></>}
          </FlexGridItem>





          {/* Monday */}
          <FlexGridItem {...labelProps}>
            <Label2>{"Monday"}</Label2>
            <Checkbox
              checked={Boolean(form?.monday)}
              onChange={e => {
                const nextCheckboxes = [...checkboxes];
                nextCheckboxes[0] = e.currentTarget.checked;
                if (nextCheckboxes[0]) {
                  setForm((oldForm: HoursClass) => ({
                    ...oldForm, ...{
                      monday: {
                        open: {
                          label: "12:00 AM",
                          value: 0
                        },
                        close: {
                          label: "12:00 PM",
                          value: 24
                        }
                      }
                    }
                  }))
                } else {
                  setForm((oldForm: HoursClass) => ({ ...oldForm, ...{ monday: false } }))
                }

                //setCheckboxes(nextCheckboxes);
              }}
              checkmarkType={STYLE_TYPE.toggle_round}
              labelPlacement="right"
            >
              {`${Boolean(form?.monday) ? 'Open' : 'Closed'}`}
            </Checkbox>
          </FlexGridItem>
          <FlexGridItem {...selectProps}>
            {form?.monday && <><Select
              options={hoursList}
              value={form?.monday?.open}
              placeholder={!form?.monday ? "Open" : ''}
              labelKey="label"
              valueKey="value"
              onChange={params =>
                setForm((oldForm: HoursClass) => ({ ...oldForm, ...{ monday: { open: params?.value[0], close: form.monday ? form.monday.close : '' } } }))
              }
              overrides={override}
              clearable={false}
              maxDropdownHeight={'260px'}
            /><div ><SVGIcon style={{ transform: 'scale(0.6)', margin: '0 4px' }} name='minus' /></div>
              <Select
                options={hoursList}
                value={form?.monday?.close}

                placeholder={!form?.monday ? "Close" : ''}
                labelKey="label"
                valueKey="value"
                onChange={params =>
                  setForm((oldForm: HoursClass) => ({ ...oldForm, ...{ monday: { close: params?.value[0], open: form.monday ? form.monday.open : '' } } }))
                }
                overrides={override}
                clearable={false}
                maxDropdownHeight={'260px'}
              /></>}
          </FlexGridItem>





          {/* Tuesday */}
          <FlexGridItem {...labelProps}>
            <Label2>{"Tuesday"}</Label2>
            <Checkbox
              checked={Boolean(form?.tuesday)}
              onChange={e => {
                const nextCheckboxes = [...checkboxes];
                nextCheckboxes[0] = e.currentTarget.checked;
                if (nextCheckboxes[0]) {
                  setForm((oldForm: HoursClass) => ({
                    ...oldForm, ...{
                      tuesday: {
                        open: {
                          label: "12:00 AM",
                          value: 0
                        },
                        close: {
                          label: "12:00 PM",
                          value: 24
                        }
                      }
                    }
                  }))
                } else {
                  setForm((oldForm: HoursClass) => ({ ...oldForm, ...{ tuesday: false } }))
                }

                //setCheckboxes(nextCheckboxes);
              }}
              checkmarkType={STYLE_TYPE.toggle_round}
              labelPlacement="right"
            >
              {`${Boolean(form?.tuesday) ? 'Open' : 'Closed'}`}
            </Checkbox>
          </FlexGridItem>
          <FlexGridItem {...selectProps}>
            {form?.tuesday && <><Select
              options={hoursList}
              value={form?.tuesday?.open}

              placeholder={!form?.tuesday ? "Open" : ''}
              labelKey="label"
              valueKey="value"
              onChange={params =>
                setForm((oldForm: HoursClass) => ({ ...oldForm, ...{ tuesday: { open: params?.value[0], close: form.tuesday ? form.tuesday.close : '' } } }))
              }
              overrides={override}
              clearable={false}
              maxDropdownHeight={'260px'}
            /><div ><SVGIcon style={{ transform: 'scale(0.6)', margin: '0 4px' }} name='minus' /></div>
              <Select
                options={hoursList}
                value={form?.tuesday?.close}
                placeholder={!form?.tuesday ? "Close" : ''}
                labelKey="label"
                valueKey="value"
                onChange={params =>
                  setForm((oldForm: HoursClass) => ({ ...oldForm, ...{ tuesday: { close: params?.value[0], open: form.tuesday ? form.tuesday.open : '' } } }))
                }
                overrides={override}
                clearable={false}
                maxDropdownHeight={'260px'}
              /></>}
          </FlexGridItem>











          {/* Wednesday */}
          <FlexGridItem {...labelProps}>
            <Label2>{"Wednesday"}</Label2>
            <Checkbox
              checked={Boolean(form?.wednesday)}
              onChange={e => {
                const nextCheckboxes = [...checkboxes];
                nextCheckboxes[0] = e.currentTarget.checked;
                if (nextCheckboxes[0]) {
                  setForm((oldForm: HoursClass) => ({
                    ...oldForm, ...{
                      wednesday: {
                        open: {
                          label: "12:00 AM",
                          value: 0
                        },
                        close: {
                          label: "12:00 PM",
                          value: 24
                        }
                      }
                    }
                  }))
                } else {
                  setForm((oldForm: HoursClass) => ({ ...oldForm, ...{ wednesday: false } }))
                }

                //setCheckboxes(nextCheckboxes);
              }}
              checkmarkType={STYLE_TYPE.toggle_round}
              labelPlacement="right"
            >
              {`${Boolean(form?.wednesday) ? 'Open' : 'Closed'}`}
            </Checkbox>
          </FlexGridItem>
          <FlexGridItem {...selectProps}>
            {form?.wednesday && <> <Select
              options={hoursList}
              value={form?.wednesday?.open}

              placeholder={!form?.wednesday ? "Open" : ''}
              labelKey="label"
              valueKey="value"
              onChange={params => {
                setForm((oldForm: HoursClass) => ({ ...oldForm, ...{ wednesday: { open: params?.value[0], close: ((form?.wednesday) ? (form.wednesday.close) : '') } } }))
              }}
              overrides={override}
              clearable={false}
              maxDropdownHeight={'260px'}
            /><div ><SVGIcon style={{ transform: 'scale(0.6)', margin: '0 4px' }} name='minus' /></div>
              <Select
                options={hoursList}
                value={form?.wednesday?.close}

                placeholder={!form?.wednesday ? "Close" : ''}
                labelKey="label"
                valueKey="value"
                onChange={params =>
                  setForm((oldForm: HoursClass) => ({ ...oldForm, ...{ wednesday: { close: params?.value[0], open: ((form?.wednesday)?(form.wednesday.open):'') } } }))
                }
                overrides={override}
                clearable={false}
                maxDropdownHeight={'260px'}
              /></>}
          </FlexGridItem>












          {/* Thursday */}
          <FlexGridItem {...labelProps}>
            <Label2>{"Thursday"}</Label2>
            <Checkbox
              checked={Boolean(form?.thursday)}
              onChange={e => {
                const nextCheckboxes = [...checkboxes];
                nextCheckboxes[0] = e.currentTarget.checked;
                if (nextCheckboxes[0]) {
                  setForm((oldForm: HoursClass) => ({
                    ...oldForm, ...{
                      thursday: {
                        open: {
                          label: "12:00 AM",
                          value: 0
                        },
                        close: {
                          label: "12:00 PM",
                          value: 24
                        }
                      }
                    }
                  }))
                } else {
                  setForm((oldForm: HoursClass) => ({ ...oldForm, ...{ thursday: false } }))
                }

                //setCheckboxes(nextCheckboxes);
              }}
              checkmarkType={STYLE_TYPE.toggle_round}
              labelPlacement="right"
            >
              {`${Boolean(form?.thursday) ? 'Open' : 'Closed'}`}
            </Checkbox>
          </FlexGridItem>
          <FlexGridItem {...selectProps}>
            {form?.thursday && <> <Select
              options={hoursList}
              value={form?.thursday?.open}
              placeholder={!form?.thursday ? "Open" : ''}
              labelKey="label"
              valueKey="value"
              onChange={params =>
                setForm((oldForm: HoursClass) => ({ ...oldForm, ...{ thursday: { open: params?.value[0], close: form.thursday ? form.thursday.close : '' } } }))
              }
              overrides={override}
              clearable={false}
              maxDropdownHeight={'260px'}
            /><div ><SVGIcon style={{ transform: 'scale(0.6)', margin: '0 4px' }} name='minus' /></div>
              <Select
                options={hoursList}
                value={form?.thursday?.close}
                placeholder={!form?.thursday ? "Close" : ''}
                labelKey="label"
                valueKey="value"
                onChange={params =>
                  setForm((oldForm: HoursClass) => ({ ...oldForm, ...{ thursday: { close: params?.value[0], open: form.thursday ? form.thursday.open : '' } } }))
                }
                overrides={override}
                clearable={false}
                maxDropdownHeight={'260px'}
              /></>}
          </FlexGridItem>












          {/* Friday */}
          <FlexGridItem {...labelProps}>
            <Label2>{"Friday"}</Label2>
            <Checkbox
              checked={Boolean(form?.friday)}
              onChange={e => {
                const nextCheckboxes = [...checkboxes];
                nextCheckboxes[0] = e.currentTarget.checked;
                if (nextCheckboxes[0]) {
                  setForm((oldForm: HoursClass) => ({
                    ...oldForm, ...{
                      friday: {
                        open: {
                          label: "12:00 AM",
                          value: 0
                        },
                        close: {
                          label: "12:00 PM",
                          value: 24
                        }
                      }
                    }
                  }))
                } else {
                  setForm((oldForm: HoursClass) => ({ ...oldForm, ...{ friday: false } }))
                }

                //setCheckboxes(nextCheckboxes);
              }}
              checkmarkType={STYLE_TYPE.toggle_round}
              labelPlacement="right"
            >
              {`${Boolean(form?.friday) ? 'Open' : 'Closed'}`}
            </Checkbox>
          </FlexGridItem>
          <FlexGridItem {...selectProps}>
            {form?.friday && <> <Select
              options={hoursList}
              value={form?.friday?.open}
              placeholder={!form?.friday ? "Open" : ''}
              labelKey="label"
              valueKey="value"
              onChange={params =>
                setForm((oldForm: HoursClass) => ({ ...oldForm, ...{ friday: { open: params?.value[0], close: form.friday ? form.friday.close : '' } } }))
              }
              overrides={override}
              clearable={false}
              maxDropdownHeight={'260px'}
            /><div ><SVGIcon style={{ transform: 'scale(0.6)', margin: '0 4px' }} name='minus' /></div>
              <Select
                options={hoursList}
                value={form?.friday?.close}
                placeholder={!form?.friday ? "Close" : ''}
                labelKey="label"
                valueKey="value"
                onChange={params =>
                  setForm((oldForm: HoursClass) => ({ ...oldForm, ...{ friday: { close: params?.value[0], open: form.friday ? form.friday.open : '' } } }))
                }
                overrides={override}
                clearable={false}
                maxDropdownHeight={'260px'}
              /></>}
          </FlexGridItem>











          {/* Saturday */}
          <FlexGridItem {...labelProps}>
            <Label2>{"Saturday"}</Label2>
            <Checkbox
              checked={Boolean(form?.saturday)}
              onChange={e => {
                const nextCheckboxes = [...checkboxes];
                nextCheckboxes[0] = e.currentTarget.checked;
                if (nextCheckboxes[0]) {
                  setForm((oldForm: HoursClass) => ({
                    ...oldForm, ...{
                      saturday: {
                        open: {
                          label: "12:00 AM",
                          value: 0
                        },
                        close: {
                          label: "12:00 PM",
                          value: 24
                        }
                      }
                    }
                  }))
                } else {
                  setForm((oldForm: HoursClass) => ({ ...oldForm, ...{ saturday: false } }))
                }

                //setCheckboxes(nextCheckboxes);
              }}
              checkmarkType={STYLE_TYPE.toggle_round}
              labelPlacement="right"
            >
              {`${Boolean(form?.saturday) ? 'Open' : 'Closed'}`}
            </Checkbox>
          </FlexGridItem>
          <FlexGridItem {...selectProps}>
            {form?.saturday && <> <Select
              options={hoursList}
              value={form?.saturday?.open}
              placeholder={!form?.saturday ? "Open" : ''}
              labelKey="label"
              valueKey="value"
              onChange={params =>
                setForm((oldForm: HoursClass) => ({ ...oldForm, ...{ saturday: { open: params?.value[0], close: form.saturday ? form.saturday.close : '' } } }))
              }
              overrides={override}
              clearable={false}
              maxDropdownHeight={'260px'}
            /><div ><SVGIcon style={{ transform: 'scale(0.6)', margin: '0 4px' }} name='minus' /></div>
              <Select
                options={hoursList}
                value={form?.saturday?.close}
                placeholder={!form?.saturday ? "Close" : ''}
                labelKey="label"
                valueKey="value"
                onChange={params =>
                  setForm((oldForm: HoursClass) => ({ ...oldForm, ...{ saturday: { close: params?.value[0], open: form.saturday ? form.saturday.open : '' } } }))
                }
                overrides={override}
                clearable={false}
                maxDropdownHeight={'260px'}
              /> </>}
          </FlexGridItem>










        </FlexGrid>



        {/* <Accordion>
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
              defaultHours &&
              Object.keys(defaultHours).map(function (key, index) {
                //alert(fireDiscountDefault[key])
                return <div>{`${key} : ${JSON.stringify(defaultHours[key])}`}</div>;
              })
            }
          </>}</Panel>


        </Accordion> */}


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
        <ModalButton
          //disabled={true} 
          disabled={!hasChanges} 
          isLoading={loading}
          onClick={handleClick}

        >
          Save
        </ModalButton>
      </ModalFooter>
    </>
  );
};
export default DeliveryFee;

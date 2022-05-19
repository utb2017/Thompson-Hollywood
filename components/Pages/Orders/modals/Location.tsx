import { useState, useEffect, useRef, Fragment, useCallback } from "react";
import ReactGoogleMapLoader from "react-google-maps-loader"
import ReactGooglePlacesSuggest from "react-google-places-suggest"
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
import parseAddress, { AsYouType } from "libphonenumber-js"
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
import { Spinner } from "baseui/spinner";

import {Notification, KIND as NKIND} from 'baseui/notification';
import { DatePicker } from "baseui/datepicker";
import { TimePicker } from "baseui/timepicker";
import { ThemeProvider, createTheme, lightThemePrimitives } from "baseui";
import { FormControl } from "baseui/form-control";
import { Select, StyledDropdownListItem, TYPE } from "baseui/select";
import { useSnackbar, DURATION } from "baseui/snackbar";
import { useDispatchModalBase } from "../../../../context/Modal";
import { Toast, KIND, ToasterContainer, toaster, PLACEMENT } from "baseui/toast";
import { Tag, VARIANT } from "baseui/tag";
import SVGIcon from "../../../SVGIcon";
import { useQuery } from "../../../../context/Query";
import { Accordion, Panel } from 'baseui/accordion';
import { PhoneInputNext, COUNTRIES, PhoneInputLite } from 'baseui/phone-input';
import { FileUploader } from "baseui/file-uploader";
import AddressField from "../../../../components/Forms/AddressField"
import { polygon, point } from "@turf/helpers"
import booleanPointInPolygon from "@turf/boolean-point-in-polygon"

const MY_API_KEY = "AIzaSyA7Csmb-D5XwrDjEIriQc5VeZCMH2qD0bg" // fake
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

class AddressClass {
  address: string;
  constructor(
    address: string,
  ) {
    this.address = address;
  }
}
interface Errors {
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



const Address = () => {



  const { user, fireBrands, fireCollections, fireCustomer, setCustomerID, customerID } = useUser();
  //const [loading, setLoading] = useState(false);
  const { form, setForm, loading, setLoading } = useForm();
  const [collectionList, setCollectionList] = useState([]);
  const { setNavLoading, navLoading } = useRouting();
  const { modalBaseDispatch, modalBaseState } = useDispatchModalBase();
  const { enqueue, dequeue } = useSnackbar();
  const [input, setInput] = useState('')
  const [error, setError] = useState(null)
  //const fireCollections = useFirestoreQuery(user?.uid && firebase.firestore().collection("collections"));
  //const fireBrands = useFirestoreQuery(user?.uid && firebase.firestore().collection("brands"));
  const defaultForm = new AddressClass(
    fireCustomer?.data?.address, // address:string,
  );

  useEffect(() => {
    console.log('fireCustomer')
  //  console.log(fireCustomer)
  }, [fireCustomer]);

  const [toastKey, setToastKey] = useState<INullableReactText>(null);
  const showToast = (x: string) => setToastKey(toaster.negative(`${x}`, {}));
  const closeModal = () => {
    //alert('hey')
    setForm((oldForm) => ({
      ...oldForm,
      ...{
        //isFocused: false,
        inRange:fireCustomer.data.inRange,
        coords:fireCustomer.data.coords,
      },
    }))
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
    setForm({ ...defaultForm } as AddressClass);
    return () => {
      setForm({});
      //setError({});
      //setCustomerID(null)
    };
  }, []);



  /* reset errors */
  useEffect(() => {
    closeToast();
    //setError({});
    return () => {
      closeToast();
      //setError({});
    };
  }, [form]);




  useEffect(() => {
  // alert(error.server)
  // console.log('error')
  //  console.log(error:any)
  //  JSON.stringify('error')
  //  JSON.stringify(error:any)
  }, [error]);



  useEffect(() => {
    return () => {
      setLoading(false)
      
      // setForm((oldForm: AddressClass) => ({ ...oldForm, ...{
      //   inRange:fireCustomer.data.inRange,
      //   coords:fireCustomer.data.coords, } }));
    };
  }, []);




  const { fireSettings, zone, setZone } = useUser()



  const [search, setSearch] = useState(null)

  const handleSelectSuggest = async (geocodedPrediction) => {



    // if(geocodedPrediction.formatted_address === fireCustomer.address){
    //   closeModal()
    // }
      setLoading(true);
    enqueue({ message: "Updating address", progress: true }, DURATION.infinite);  
    //setLoading(true)
    //alert('drt load')
    setForm((oldForm) => ({
      ...oldForm,
      ...{
        search: "",
        address: geocodedPrediction.formatted_address,
      },
    }))
    const { location } = geocodedPrediction.geometry
    const poly = polygon([zone])
    const coords = [location.lng(), location.lat()]
    const pt = point(coords)
    const inRange = booleanPointInPolygon(pt, poly, { ignoreBoundary: false })
    //alert('isFocused false 2')
    //setIsFocused(false)
   // setSearch(null)


    setForm((oldForm) => ({
      ...oldForm,
      ...{
       // isFocused: false,
        inRange,
       // coords,
      },
    }))


    if (!inRange) {
       setError({server: `Out of Range`})
     // alert(JSON.stringify({server: `Out of Range`}))
      dequeue();
      setLoading(false)
      //showToast(`${error?.message || error}`);
      enqueue({ message: `Out of Range`, startEnhancer: ({ size }) => <DeleteAlt size={size} /> }, DURATION.short);
      return

    // return setError((oldError) => ({ ...oldError, ...{ serverError: { code: 'range', message: 'This address is out of range' } } }))
      //setError((oldError) => ({...{...oldError}, ...{code:'range', message:'This address is out of range.'}})
    }

//// save results
    // send this data to the server account
    // need customerID
    // store the address data



    const AddressForm = {
      address: geocodedPrediction.formatted_address,
      coords,
      inRange,
      customerID: customerID
    };
  //  setTotalsLoading(true)

    try {
      const _storeAddressData = fireCloud("storeAddressData")
      //const form = {discountID,userID}
      const response = await _storeAddressData(AddressForm)
      dequeue();
      enqueue({ message: "Address updated", startEnhancer: ({ size }) => <Check size={size} /> }, DURATION.short);
          setForm((oldForm) => ({
      ...oldForm,
      ...{
       isFocused: false,
      //inRange,
        coords,
      },
    }))
      closeModal()
      //console.log("deleteDiscount")
      //console.log(response?.data)
      // if (response?.data?.success === true) {
      //   NotificationManager.success("Address updated.")
      //   //setTotalsLoading(true)
      // }
    } catch (e) {
      //NotificationManager.error(`${e?.message || e}`)
      dequeue();
      enqueue({ message: `Address not Updated`, startEnhancer: ({ size }) => <Check size={size} /> }, DURATION.short);
      //setTotalsLoading(false)
    }finally{
      
     // closeModal()
    }


  //   if(!x?.inRange){
  //     setError((oldError)=>({...oldError, ...{serverError:{code:'range',message:'This address is out of range'}}  }))
  //     //setError((oldError) => ({...{...oldError}, ...{code:'range', message:'This address is out of range.'}})
  //   }
  //   setForm(oldForm=>({...oldForm, ...{search:x?.address}}))
  //   onSelect && onSelect(x)

  }
  const handleNoResult = () => {
    //console.log("No results for ", (form?.search||''))
    setLoading(false)
  }
  const handleStatusUpdate = (status) => {
    console.log(status)
    // setLoading(false)
    // alert('drtload false')
  }
  // const handleClear = () => {

  // }



  return (
    <>
      <ModalHeader>Customer Address</ModalHeader>
      

      <ModalBody>
       {/* {Boolean(error?.server) && <Notification kind={NKIND.negative}>
        {`${error?.server}`}
      </Notification>}        */}
        {/** Title */}
        {/* <FormSection ref={titleRef}>
          <FormInput style={formStyle} label={<Label2>{"User Name"}</Label2>} stack={true}> */}
        <FormControl error= {Boolean(error?.server) && <Notification kind={NKIND.negative}>
        {`${error?.server}`}
      </Notification>}       >
          <ReactGoogleMapLoader
            params={{
              key: MY_API_KEY,
              libraries: "places,geocode",
            }}
            render={(googleMaps) =>
              (googleMaps && zone && !loading) ? (
                
                <ReactGooglePlacesSuggest
                  googleMaps={googleMaps}
                  autocompletionRequest={{
                    input: `${form.search || ''}`,
                    // Optional options
                    // https://developers.google.com/maps/documentation/javascript/reference?hl=fr#AutocompletionRequest
                  }}
                  // Optional props
                  onNoResult={handleNoResult}
                  onSelectSuggest={handleSelectSuggest}
                  onStatusUpdate={handleStatusUpdate}
                  textNoResults='My custom no results text' // null or "" if you want to disable the no results item
                  customRender={(prediction) => (
                    <StyledDropdownListItem>
                       {prediction ? ( prediction?.description ? prediction?.description?.split(',')[0] : ''
                    ) : (
                        "My custom no results text"
                      )}
                    </StyledDropdownListItem>
                    // <div className='customWrapper'>
                    //   {prediction ? (
                    //     <div style={{
                    //       //...spacing.PADDING_X_SM,
                    //       paddingTop: 0,
                    //       paddingBottom: 0,
                    //       whiteSpace: "nowrap",
                    //       textOverflow: "ellipsis",
                    //       overflow: "hidden",
                    //       backgroundColor: "#ffffff",
                    //       //...spacing.PADDING_Y_SM,
                    //     }}>{prediction?.description ? prediction?.description?.split(',')[0] : ''}</div>
                    //   ) : (
                    //     "My custom no results text"
                    //   )}
                    // </div>
                  )}>




                      <Input
                        required
                        
                        disabled={loading}
                        autoComplete='off'
                        onChange={(e) => {
                          const str = e?.currentTarget?.value;

                          
                          setError({})
                          setForm((oldForm: AddressClass) => ({ ...oldForm, ...{ address: str, search: str,
                          // inRange:fireCustomer.data.inRange,
                          //  coords:fireCustomer.data.coords, 
                          } }));
                        }}
                        //value={form?.address}
                        value={form?.address ? form?.address.split(",")[0] : ``}
                        onFocus={() => (
                          //executeScroll(titleRef), 
                          setError({})
                        )}
                        key="address"
                        id="address"
                        name="address"
                        error={Boolean(error?.server)}
                        type="text"
                        placeholder="Address"
                        clearable
                        clearOnEscape
                        overrides={{
                          Root: {
                            style: ({ $theme }) => ({
                              marginBottom: "16px",
                              minWidth: '260px'
                            }),
                          },
                        }}
                      />



                </ReactGooglePlacesSuggest>
              ) : (
                <div
                  style={{
                    width: "100%",
                    minWidth:'260px',
                    height: "48px",
                    display: "flex",
                    marginBottom: "21px",
                    justifyContent:'center',
                    alignContent:'center',
                    alignItems:'center',
                  }}>
                  <Spinner size={21} />
                </div>
                
              )
            }
          />
          {/* <Input
                required
                disabled={loading}
                onChange={(e) => {
                  const str = e?.currentTarget?.value;
                  setForm((oldForm: AddressClass) => ({ ...oldForm, ...{ address: str } }));
                }}
                value={form?.address}
                onFocus={() => (
                  //executeScroll(titleRef), 
                  setError({})
                )}
                key="address"
                id="address"
                name="address"
                error={Boolean(error?.address)}
                type="text"
                placeholder="Address"
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
              /> */}

        </FormControl>
        {/* </FormInput>
        </FormSection> */}
        {/** Phone Number */}

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

    </>
  );
};
export default Address;

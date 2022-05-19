import { useState, useEffect, useRef, Fragment, useCallback } from "react";
import A_LiveSwitch from "../components/A_LiveSwitch";
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

class UserClass {
  displayName:string;
  phoneNumber:string;
  photoURL:string;
  constructor(
    displayName:string,
    phoneNumber:string,
    photoURL:string,
  ) {
    this.displayName = displayName;
    this.phoneNumber = phoneNumber;
    this.photoURL = photoURL;
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

const defaultForm = new UserClass(
  null, // displayName:string,
  null, // phoneNumber:number[],
  null, // photoURL:any,
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


const convertTimestamp = (timeStamp: TimeStamp | Date, hours: number | null): Date | null | Date[] => {
  if (!timeStamp) {
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
  if (typeof timeStamp === "object") {
    for (const [key, value] of Object.entries(timeStamp)) {
      if (key.includes('seconds') && !key.includes('nano')) {
        d = new Date(1970, 0, 1);
        d.setSeconds(Number(value));
        if (hours) {
          d.setHours(Number(hours));
        }
      }
    }
  }
  if (d instanceof Date) {
    return d;
  }
  return null;
};
const convertTimestampX = (timeStamp: TimeStamp | Date): Date | null | Date[] => {

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

const CreateUser = () => {
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
  const [availableDays, setAvailableDays] = useState(defaultDays);
  const executeScroll = (ref: { current: HTMLDivElement | null }) => {
    width < 450 && ref && ref.current.scrollIntoView();
  };
  const { user, fireBrands, fireCollections } = useUser();
  //const [loading, setLoading] = useState(false);
  const { form, setForm, error, setError, loading, setLoading } = useForm();
  const [collectionList, setCollectionList] = useState([]);
  const { setNavLoading, navLoading } = useRouting();
  const { modalBaseDispatch, modalBaseState } = useDispatchModalBase();
  const { enqueue, dequeue } = useSnackbar();
  //const fireCollections = useFirestoreQuery(user?.uid && firebase.firestore().collection("collections"));
  //const fireBrands = useFirestoreQuery(user?.uid && firebase.firestore().collection("brands"));

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
    setForm({ ...defaultForm } as UserClass);
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


  const formatPhoneNumber = useCallback((value) => {
    if (!value) return ""
     let max = 14
    if(value.charAt(0) === '1'){
      max = 16
    }   
    value = value.toString()
    if (value.includes("(") && !value.includes(")")) {
      return value.replace("(", "")
    }

    if (value.length && value.length > max) {
      return value.slice(0, -1)
    }
    return new AsYouType("US").input(value)
  }, [])

  const createUser = useCallback(async () => {
    const _form = { ...form }
    const _error = { ...error }

    if (isEmpty(_form?.displayName)) {
      _error.displayName = "Name required."
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



  const [text, setText] = useState('');
  const [country, setCountry] = useState(COUNTRIES.US);




  const [data, setData] = useState(null)
  const [progress, setProgress] = useState(null)
  const [file, setFile] = useState(null)
  const { fireCustomer } = useUser()
  const taskRef = useRef(null)
  const [photoURL, setPhotoURL] = useState(null)



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
      //NotificationManager.success("License Updated")
      closeModal()
    } catch (e) {
      setLoading(false)
      setError(`${e?.message || e || 'ERROR'}`)
      //NotificationManager.error(e.message)
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
    const filePath = `${"License"}/${file.name}_${new Date().getTime()}`
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
          setForm((oldForm:UserClass) => ({ ...oldForm, ...{ photoURL: photoURL, filePath } }))
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
      <ModalHeader>Create User</ModalHeader>
      <ModalBody>
        {/** Title */}
        <FormSection ref={titleRef}>
          <FormInput style={formStyle} label={<Label2>{"User Name"}</Label2>} stack={true}>
            <FormControl error={error?.displayName}>
              <Input
                required
                disabled={loading}
                onChange={(e) => {
                  const str = e?.currentTarget?.value;
                  setForm((oldForm: UserClass) => ({ ...oldForm, ...{ displayName: str } }));
                }}
                value={form?.displayName}
                onFocus={() => (
                  //executeScroll(titleRef), 
                  setError({})
                )}
                key="displayName"
                id="displayName"
                name="displayName"
                error={Boolean(error?.displayName)}
                type="text"
                placeholder="Display Name"
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
        {/** Phone Number */}
        <FormSection ref={phoneNumberRef}>
          <FormInput style={formStyle} label={<Label2>{"Phone Number"}</Label2>} stack={true}>
            <FormControl error={error?.phoneNumber}>
              
            <Input
                required
                disabled={loading}
                onChange={(e) => {
                  const str = e?.currentTarget?.value;
                  setForm((oldForm: UserClass) => ({ ...oldForm, ...{ phoneNumber:  formatPhoneNumber(str || "") } }));
                }}
                value={form?.phoneNumber}
                onFocus={() => (
                  //executeScroll(phoneNumberRef), 
                  setError({})
                )}
                startEnhancer={'+1'}
                key="phoneNumber"
                id="phoneNumber"
                name="phoneNumber"
                error={Boolean(error?.phoneNumber)}
                type="phone"
                placeholder="Phone"
                overrides={{
                  Root: {
                    style: ({ $theme }) => ({
                      marginBottom: "16px",
                    }),
                  },
                }}
              />
              {/* <PhoneInputNext
                maxDropdownHeight="220x"
                text={text}
                country={country}
                onTextChange={event => {
                  setText(event.currentTarget.value);
                }}
                onCountryChange={(event: any) => {
                  setCountry(event.option);
                }}
                overrides={{
                  CountrySelect: {
                    props: {
                      overrides: {
                        Root: {
                          style: ({ $theme }) => ({ zIndex: 500 })
                        },
                        Popover: {
                          props: {
                            overrides: {
                              Body: {
                                style: ({ $theme }) => ({
                                  zIndex: 500
                                })
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }}
              /> */}
            </FormControl>
          </FormInput>
        </FormSection>
        {/** Image **/}
        <FormSection >
          <FormInput style={formStyle} label={<Label2>{"License"}</Label2>} stack={true}>
            {/* {photoURL && photoURL.length ? (
              <img className='form-img' src={photoURL} alt={"Modal Image"} />
            ) : (
              <div className='form-image-placeholder'>
                <SVGIcon color={"rgba(0,0,0,0.2)"} name='photo' />
              </div>
            )} */}
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

                  // overrides={{
                  //   FileDragAndDrop: {
                  //     style: ({ $theme }) => ({
                  //       backgroundImage: `url(${photoURL})`,
                  //       backgroundRepeat: `no-repeat`,
                  //       backgroundSize: `auto 100%`,
                  //       //backgroundAttachment: `fixed`,
                  //       backgroundPosition: `center`,

                  //     })
                  //   }
                  // }}
                  />
                </StyledBody>

              </Card>}
            {/* <FormControl error={error?.genome}>
              <FileUploader
                onDrop={(acceptedFiles, rejectedFiles) => {
                  // handle file upload...
                  console.log(acceptedFiles, rejectedFiles)
                  if (acceptedFiles) {
                    handleChange(acceptedFiles)
                  }

                }}
                errorMessage={''}

              // overrides={{
              //   FileDragAndDrop: {
              //     style: ({ $theme }) => ({
              //       backgroundImage: `url(${photoURL})`,
              //       backgroundRepeat: `no-repeat`,
              //       backgroundSize: `auto 100%`,
              //       //backgroundAttachment: `fixed`,
              //       backgroundPosition: `center`,

              //     })
              //   }
              // }}
              />
            </FormControl>
           */}

          </FormInput>
        </FormSection>
        <Accordion>
          <Panel title="Form Dev">{<>
            {
              form &&
              Object.keys(form).map(function (key, index) {
                //alert(fireUserDefault[key])
                return <div>{`${key} : ${JSON.stringify(form[key])}`}</div>;
              })
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
        <ModalButton isLoading={loading} onClick={createUser}>
          Create
        </ModalButton>
      </ModalFooter>
    </>
  );
};
export default CreateUser;

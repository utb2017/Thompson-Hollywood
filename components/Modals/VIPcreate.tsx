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
  createAuthUser,
} from "../../firebase/clientApp";
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
import {
  Toast,
  KIND,
  ToasterContainer,
  toaster,
  PLACEMENT,
} from "baseui/toast";
import { Tag, VARIANT } from "baseui/tag";
import SVGIcon from "../SVGIcon";
import { useQuery } from "../../context/Query";
import { Accordion, Panel } from "baseui/accordion";
import { Textarea } from "baseui/textarea";
import dateFormat from "dateformat";
import { Card, StyledBody, StyledAction } from "baseui/card";
//import { VIPClass } from "./types";

import { FileUploader } from "baseui/file-uploader";
const options = { timeZone: "America/Los_Angeles" };
let d: any = new Date().toLocaleString("en-US", options);
const start = new Date(d);
const end = new Date(d);
start.setUTCHours(0, 0, 0, 0);
end.setUTCHours(1, 0, 0, 0);

interface Params {
  value: any[];
  option: any;
  type: "clear" | "select" | "remove";
}
type Selected = {
  label: string | number | Date;
  value: string | number | Date;
};
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
class VIPClass {
  arrival?: string;
  departure?: string;
  details?: string;
  fileName?: string;
  firstName?: string;
  id?: string;
  image?: string;
  lastName?: string;
  notes?: string;
  rateCode?: string;
  reservationStatus?:
    | "DUEIN"
    | "DUEOUT"
    | "CHECKEDIN"
    | "CHECKEDOUT"
    | "RESERVED"
    | "NOSHOW"
    | "CANCEL";
  roomNumber?: string;
  roomStatus?: [];
  vipStatus?: [];
  stays?: number;
  constructor(
    arrival?: string,
    departure?: string,
    details?: string,
    fileName?: string,
    firstName?: string,
    id?: string,
    image?: string,
    lastName?: string,
    notes?: string,
    rateCode?: string,
    reservationStatus?:
      | "DUEIN"
      | "DUEOUT"
      | "CHECKEDIN"
      | "CHECKEDOUT"
      | "RESERVED"
      | "NOSHOW"
      | "CANCEL",
    roomNumber?: string,
    roomStatus?: [],
    vipStatus?: [],
    stays?: number
  ) {
    this.arrival = arrival;
    this.departure = departure;
    this.details = details;
    this.firstName = firstName;
    this.fileName = fileName;
    this.id = id;
    this.image = image;
    this.lastName = lastName;
    this.notes = notes;
    this.rateCode = rateCode;
    this.reservationStatus = reservationStatus;
    this.roomNumber = roomNumber;
    this.roomStatus = roomStatus;
    this.vipStatus = vipStatus;
    this.stays = stays;
  }
}
const defaultForm = new VIPClass(
  null, // arrival?: string,
  null, // departure?: string,
  null, // details?: string,
  null, // fileName?: string
  null, // firstName?: string,
  null, // id?: string,
  null, // image?: string,
  null, // lastName?: string,
  null, // notes?: string,
  null, // rateCode?: string,
  null, // reservationStatus?:'DUEIN'|'DUEOUT'|'CHECKEDIN'|'CHECKEDOUT'|'RESERVED'|'NOSHOW'|'CANCEL',
  null, // roomNumber?: string,
  null, // roomStatus?: [],
  null, // vipStatus?: [],
  null, // stays?:number,
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

const isValidString = (x: any) => {
  return Boolean(x && typeof x === "string" && x.length > 0);
};
const isValidObject = (x: any) => {
  return Boolean(
    x &&
      (typeof x === "object" || typeof x === "function") &&
      x.hasOwnProperty("value") &&
      x.hasOwnProperty("label") &&
      (typeof x.value === "string" || typeof x.value === "number") &&
      (typeof x.label === "string" || typeof x.value === "number")
  );
};
const convertTimestamp = (
  timeStamp: TimeStamp | Date
): Date | null | Date[] => {
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
    !(timeStamp instanceof Date) &&
    typeof timeStamp === "object" &&
    timeStamp?.seconds &&
    (typeof timeStamp.seconds === "number" ||
      typeof timeStamp.seconds === "string")
  ) {
    let dateStart = new Date(1970, 0, 1); // Epoch
    dateStart.setSeconds(Number(timeStamp.seconds));
    return dateStart;
  }
  return null;
};

const FlexSpacer = styled("div", ({ $theme, $width = `16px` }) => {
  return {
    height: "100%",
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
    setDataList,
  } = useQuery();

  const nameRef = useRef<HTMLDivElement>(null);
  const collectionRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const { width, height } = useWindowSize();
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
  const VIPCollection = useFirestoreQuery(
    firebase.firestore().collection("VIPS")
  );

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
    console.log("form setup");
    setForm({ ...defaultForm } as VIPClass);
    return () => {
      setForm({});
      setError({});
    };
  }, [defaultForm]);

  const createProduct = async () => {
    const _form: VIPClass = { ...form };
    // ** NAME **
    if (isEmpty(_form?.firstName)) {
      setError((oldError: Errors) => ({
        ...oldError,
        ...{ firstName: "First Name Required" },
      }));
      return;
    }
    // ** NAME **
    if (isEmpty(_form?.lastName)) {
      setError((oldError: Errors) => ({
        ...oldError,
        ...{ lastName: "Last Name Required" },
      }));
      return;
    }
    // ** Arrival **
    if (isEmpty(_form?.arrival)) {
      setError((oldError: Errors) => ({
        ...oldError,
        ...{ arrival: "Arrival Required" },
      }));
      return;
    }
    // ** Departure **
    if (isEmpty(_form?.departure)) {
      setError((oldError: Errors) => ({
        ...oldError,
        ...{ departure: "Departure Required" },
      }));
      return;
    }
    // ** Rate **
    if (isEmpty(_form?.rateCode)) {
      setError((oldError: Errors) => ({
        ...oldError,
        ...{ rateCode: "Rate Code Required" },
      }));
      return;
    }
    // ** Vip STatus **
    if (isEmpty(_form?.vipStatus)) {
      setError((oldError: Errors) => ({
        ...oldError,
        ...{ vipStatus: "Rate Code Required" },
      }));
      return;
    }

    



    const clientData = { ..._form }

    // FirstName
    if (!isValidString(clientData.firstName)) {
      setError((oldError: Errors) => ({
        ...oldError,
        ...{ firstName: "First Name Required" },
      }));
    }
    // LastName
    if (!isValidString(clientData.lastName)) {
      setError((oldError: Errors) => ({
        ...oldError,
        ...{ lastName: "Last Name Required" },
      }));
     }
    // Rate
    if (!isValidString(clientData.rateCode)) {
      setError((oldError: Errors) => ({
        ...oldError,
        ...{ rateCode: "Rate Code Required" },
      }));
    }
    // Arrival
    if (!Array.isArray(clientData.arrival)) {
      setError((oldError: Errors) => ({
        ...oldError,
        ...{ arrival: "Arrival Date Required" },
      }));
    }
    
    clientData.arrival = dateFormat((Array.isArray(clientData.arrival) ? clientData.arrival[0] : clientData.arrival), 'ddd dd mmm');

    // Departure
    if (!Array.isArray(clientData.departure)) {
      setError((oldError: Errors) => ({
        ...oldError,
        ...{ departure: "Departure Date Required" },
      }));
    }
    clientData.departure = dateFormat((Array.isArray(clientData.departure) ? clientData.departure[0] : clientData.departure), 'ddd dd mmm');
   
    // Image
    if (!isValidString(clientData.image)) {
      setError((oldError: Errors) => ({
        ...oldError,
        ...{ image: "Image Required" },
      }));
    }
    // FileName
    if (!isValidString(clientData.fileName)) {
      setError((oldError: Errors) => ({
        ...oldError,
        ...{ fileName: "File Name Required" },
      }));
    }
    // VIPStatus
    if (!Array.isArray(clientData.vipStatus)) {
      setError((oldError: Errors) => ({
        ...oldError,
        ...{ vipStatus: "Status Required" },
      }));
    }

    //alert(JSON.stringify(clientData))


    setLoading(true);
    enqueue({ message: "Creating VIP", progress: true }, DURATION.infinite);
    try {
      const createVIP = firebase.functions().httpsCallable("createVIP");
      const response = await createVIP(clientData);
      dequeue();
      enqueue(
        {
          message: "VIP Created",
          startEnhancer: ({ size }) => <Check size={size} />,
        },
        DURATION.short
      );
      closeModal();
      if (response?.data?.success === true) {
        //alert(`${response?.data?.form}`)
        //console.log(response?.data?.form);
        //setFireProductDefault({...response?.data?.form});
        //setForm({...response?.data?.form});
      }
    } catch (e) {
      //setError(`${e?.message || e}`);
      setError((oldError: Errors) => ({
        ...oldError,
        ...{ server: `VIP not created.` },
      }));
      dequeue();
      showToast(`${e?.message || e}`);
      enqueue(
        {
          message: `Your VIP wasn't created`,
          startEnhancer: ({ size }) => <DeleteAlt size={size} />,
        },
        DURATION.short
      );
    } finally {
      setLoading(false);
    }
  };

  const [data, setData] = useState(null);
  const [progress, setProgress] = useState(null);
  const [file, setFile] = useState(null);
  const { fireCustomer } = useUser();
  const taskRef = useRef(null);
  const [photoURL, setPhotoURL] = useState(null);

  // useEffect(() => {
  //   alert(JSON.stringify(collectionList))
  // }, [collectionList]);

  const handleChange = (acceptedFiles) => {
    //e.stopPropagation()
    //alert(JSON.stringify(acceptedFiles))
    setData(acceptedFiles[0]);
    setFile(acceptedFiles[0].name);
    setError(false);
    setPhotoURL(URL.createObjectURL(acceptedFiles[0]));
  };
  const updateProfile = async (photoURL) => {
    setLoading(true);
    try {
      const fieldUpdate = { photoURL };
      await updateFirestore("users", fireCustomer?.data?.uid, fieldUpdate);
      NotificationManager.success("License Updated");
      closeModal();
    } catch (e) {
      setLoading(false);
      setError(`${e?.message || e || "ERROR"}`);
      NotificationManager.error(e.message);
    }
  };
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
  const uploadImgError = (e) => (
    setError(`${e?.message || e || "ERROR"}`), setLoading(false)
  );
  const uploadImgNext = (snap) => {
    return setProgress(~~((snap.bytesTransferred / snap.totalBytes) * 100));
  };
  const uploadImgToFireStorage = useCallback(
    (acceptedFiles) => {
      setLoading(true);
      const file = acceptedFiles[0];
      const filePath = `${"VIPs"}/${file.name}_${new Date().getTime()}`;
      taskRef.current = firebase
        .storage()
        .ref()
        .child(filePath)
        .put(file, { contentType: file.type });

      taskRef.current.on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        uploadImgNext,
        uploadImgError,
        async () => {
          try {
            const photoURL =
              await taskRef.current.snapshot.ref.getDownloadURL();
            setForm((oldForm: VIPClass) => ({
              ...oldForm,
              ...{ image: photoURL, filePath },
            }));
            //Boolean(fireCustomer?.data?.uid) && updateProfile(photoURL)
            setProgress(0);
            setLoading(false);
            //closeModal()
            return;
          } catch (e) {
            setError(`${e?.message || e || "ERROR"}`);
            setLoading(false);
            return;
          }
        }
      );
    },
    [taskRef, user, data]
  );

  const [imgURL, setImgURL] = useState(null);

  const getImgURL = async () => {
    const filePath = `810-8105444_male-placeholder.png`;
    if (true) {
      const storage = firebase.storage();
      const storageRef = storage && storage.ref();
      let url = null;
      // "https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2Fstock-placeholder.png?alt=media&token=57d6b3da-4408-4867-beb7-7957669937dd"
      if (typeof filePath === "string" && filePath.length > 0 && storage) {
        try {
          url = await storageRef
            .child(`${typeof filePath === "string" ? filePath : ""}`)
            .getDownloadURL();
        } catch (e) {
          console.log("error");
          console.log(e);
          alert(JSON.stringify(e));
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
      
      setForm((oldForm: VIPClass) => ({
        ...oldForm,
        ...{ image:url, fileName:filePath },
      }));
      return setImgURL(url);
    }
  };

  useEffect(() => {
    getImgURL();
  }, []);

  return (
    <>
      <ModalHeader>Create VIP</ModalHeader>
      <ModalBody>
        {/** Name */}
        <FormSection ref={nameRef}>
          <FormInput
            style={formStyle}
            label={<Label2>{"Name"}</Label2>}
            stack={true}
          >
            <FormControl error={error?.firstName}>
              <Input
                required
                disabled={loading}
                onChange={(e) => {
                  const str = e?.currentTarget?.value;
                  setForm((oldForm: VIPClass) => ({
                    ...oldForm,
                    ...{ firstName: str },
                  }));
                }}
                value={form?.firstName}
                onFocus={() =>
                  //executeScroll(firstNameRef),
                  setError({})
                }
                key="firstName"
                id="firstName"
                name="firstName"
                error={Boolean(error?.firstName)}
                type="text"
                placeholder="First Name"
                overrides={{
                  Root: {
                    style: ({ $theme }) => ({
                      marginBottom: "16px",
                    }),
                  },
                }}
              />
            </FormControl>
            <FormControl error={error?.lastName}>
              <Input
                required
                disabled={loading}
                onChange={(e) => {
                  const str = e?.currentTarget?.value;
                  setForm((oldForm: VIPClass) => ({
                    ...oldForm,
                    ...{ lastName: str },
                  }));
                }}
                value={form?.lastName}
                onFocus={() =>
                  //executeScroll(lastNameRef),
                  setError({})
                }
                key="lastName"
                id="lastName"
                name="lastName"
                error={Boolean(error?.lastName)}
                type="text"
                placeholder="Last Name"
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
          <FormInput
            style={formStyle}
            label={<Label2>{"Dates"}</Label2>}
            stack={true}
          >
            Arrival
            <FormControl error={error?.arrival}>
              <DatePicker
                value={form?.arrival||[]}
                onChange={({ date }) => {
                  const arrival = Array.isArray(date) ? date : [date];
                  setForm((oldForm: VIPClass) => ({
                    ...oldForm,
                    ...{ arrival },
                  }));
                }}
                //quickSelect
                overrides={{
                  Popover: {
                    props: {
                      overrides: {
                        Body: {
                          style: ({ $theme }) => ({ zIndex: 1000 }),
                        },
                      },
                    },
                  },
                }}
              />
            </FormControl>
            Departure
            <FormControl error={error?.departure}>
              <DatePicker
                value={form?.departure}
                onChange={({ date }) => {
                  const departure = Array.isArray(date) ? date : [date];
                  setForm((oldForm: VIPClass) => ({
                    ...oldForm,
                    ...{ departure },
                  }));
                }}
                overrides={{
                  Popover: {
                    props: {
                      overrides: {
                        Body: {
                          style: ({ $theme }) => ({ zIndex: 1000 }),
                        },
                      },
                    },
                  },
                }}
              />
            </FormControl>
          </FormInput>
        </FormSection>
        {/** Details */}
        <FormSection ref={detailsRef}>
          <FormInput
            style={formStyle}
            label={<Label2>{"Details"}</Label2>}
            stack={true}
          >
            <FlexContainer>
              <FormControl caption={() => "Room"} error={error?.roomNumber}>
                <Input
                  //required
                  disabled={loading}
                  onChange={(e) => {
                    const str = e?.currentTarget?.value;
                    setForm((oldForm: VIPClass) => ({
                      ...oldForm,
                      ...{ roomNumber: str },
                    }));
                  }}
                  value={form?.roomNumber}
                  onFocus={() =>
                    //executeScroll(thcRef),
                    setError({})
                  }
                  key="room"
                  id="room"
                  name="room"
                  error={Boolean(error?.roomNumber)}
                  type="text"
                  placeholder="0402"
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
                caption={() => "Room Status"}
                error={error?.roomStatus}
              >
                <Select
                  options={[
                    { label: "INSPECTED", id: "INSPECTED" },
                    { label: "DIRTY", id: "DIRTY" },
                    { label: "CLEAN", id: "CLEAN" },
                    { label: "PICKUP", id: "PICKUP" },
                    { label: "OO", id: "OO" },
                  ]}
                  value={form?.roomStatus}
                  placeholder="INSPECTED"
                  onChange={(params) => {
                    const roomStatus = params.value;
                    setForm((oldForm: VIPClass) => ({
                      ...oldForm,
                      ...{ roomStatus },
                    }));
                  }}
                  overrides={{
                    Popover: {
                      props: {
                        overrides: {
                          Body: {
                            style: ({ $theme }) => ({ zIndex: 10000 }),
                          },
                        },
                      },
                    },
                  }}
                />
              </FormControl>
            </FlexContainer>
            <FlexContainer>
              <FormControl caption={() => "Rate Code"} error={error?.rateCode}>
                <Input
                  required
                  disabled={loading}
                  onChange={(e) => {
                    const str = e?.currentTarget?.value;
                    setForm((oldForm: VIPClass) => ({
                      ...oldForm,
                      ...{ rateCode: str },
                    }));
                  }}
                  value={form?.rateCode}
                  onFocus={() =>
                    //executeScroll(cbdRef),
                    setError({})
                  }
                  key="rateCode"
                  id="rateCode"
                  name="rateCode"
                  error={Boolean(error?.rateCode)}
                  type="text"
                  placeholder="WZRCK"
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
                caption={() => "VIP Status"}
                error={error?.vipStatus}
              >
                <Select
                  options={[
                    { label: "GLOB", id: "GLOB" },
                    { label: "LGLO", id: "LGLO" },
                    { label: "MP", id: "MP" },
                    { label: "V1", id: "V1" },
                    { label: "V2", id: "V2" },
                    { label: "V3", id: "V3" },
                    { label: "V4", id: "V4" },
                    { label: "V5", id: "V5" },
                    { label: "V6", id: "V6" },
                    { label: "V7", id: "V7" },
                    { label: "V8", id: "V8" },
                  ]}
                  value={form?.vipStatus}
                  placeholder="V6"
                  onChange={(params) => {
                    const vipStatus = params.value;
                    setForm((oldForm: VIPClass) => ({
                      ...oldForm,
                      ...{ vipStatus },
                    }));
                  }}
                  overrides={{
                    Popover: {
                      props: {
                        overrides: {
                          Body: {
                            style: ({ $theme }) => ({ zIndex: 10000 }),
                          },
                        },
                      },
                    },
                  }}
                />
              </FormControl>
            </FlexContainer>

            <Textarea
              value={form?.notes}
              onChange={(e) => {
                const str = e?.currentTarget?.value;
                setForm((oldForm: VIPClass) => ({
                  ...oldForm,
                  ...{ notes: str },
                }));
              }}
              placeholder="Notes"
              clearOnEscape
            />
          </FormInput>
        </FormSection>

        {/** Image **/}
        <FormSection ref={imageRef}>
          <FormInput
            style={formStyle}
            label={<Label2>{"Image"}</Label2>}
            stack={true}
          >
            {
              <Card
                overrides={{
                  Root: { style: { width: "100%" } },
                  HeaderImage: {
                    style: ({ $theme }) => ({
                      width: "100%",
                      minHeight: "120px",
                      padding: "20px 20px 12px 20px",
                    }),
                  },
                }}
                headerImage={
                  form?.image && (form?.image).length ? form.image : imgURL
                }
                // phoneNumber="Example card"
              >
                <StyledBody>
                  <FileUploader
                    // progressAmount is a number from 0 - 100 which indicates the percent of file transfer completed
                    accept={["image/jpeg", "image/jpg", "image/png"]}
                    onCancel={() => {
                      taskRef.current.cancel();
                      setProgress(0);
                      getImgURL();
                      setPhotoURL(null);
                    }}
                    progressAmount={progress}
                    progressMessage={
                      progress ? `Uploading... ${progress}% of 100%` : ""
                    }
                    onDrop={(acceptedFiles, rejectedFiles) => {
                      // handle file upload...
                      console.log(acceptedFiles, rejectedFiles);
                      if (acceptedFiles.length) {
                        handleChange(acceptedFiles);
                        uploadImgToFireStorage(acceptedFiles);
                      }
                      if (rejectedFiles.length) {
                        setError((oldError) => ({
                          ...oldError,
                          ...{ phoneNumber: "Invalid type" },
                        }));
                      }
                    }}
                    errorMessage={error?.photoURL}
                  />
                </StyledBody>
              </Card>
            }
          </FormInput>
        </FormSection>

        {/* <div style={{ width: "100%", height: 65 }}></div> */}
        <Accordion>
          <Panel title="Form Dev">
            {
              <>
                {form &&
                  Object.keys(form).map(function (key, index) {
                    //alert(fireProductDefault[key])
                    return <div>{`${key} : ${JSON.stringify(form[key])}`}</div>;
                  })}
              </>
            }
          </Panel>
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
        <ModalButton onClick={closeModal} kind={ButtonKind.tertiary}>
          Cancel
        </ModalButton>
        <ModalButton isLoading={loading} onClick={createProduct}>
          Create
        </ModalButton>
      </ModalFooter>
    </>
  );
};
export default CreateProduct;

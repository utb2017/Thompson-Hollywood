import { useState, useEffect, useRef, Fragment, useCallback, ReactElement } from "react";
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
import { styled } from "baseui";
import { ModalHeader, ModalBody, ModalFooter, ModalButton } from "baseui/modal";
import { KIND as ButtonKind } from "baseui/button";
import { Button } from "baseui/button";
import { ButtonGroup, MODE } from "baseui/button-group";
import { Input } from "baseui/input";
import { Check, Delete, DeleteAlt } from "baseui/icon";
import { Calendar, DatePicker, StatefulCalendar } from "baseui/datepicker";
import { TimePicker } from "baseui/timepicker";
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
import { Accordion, Panel } from "baseui/accordion";
import { Textarea } from "baseui/textarea";
//import dateFormat from "dateformat";
import { Card, StyledBody, StyledAction } from "baseui/card";
//import { VIPClass } from "./types";

import { FileUploader } from "baseui/file-uploader";
import { formatDate } from "../../helpers/formatDate";
import { VIPClass } from "../../classes";
import { Spinner } from "baseui/spinner";
import ArrivalVIPdelete from "./ArrivalVIPdelete";

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
  null // stays?:number,
);

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
const LoadHeader = styled(ModalHeader, ({ $theme }) => {
  return {
    display: "flex",
  };
});
const LoadBlock = styled("div", ({ $theme }) => {
  return {
    position: "relative",
    height: "28px",
    width: "auto",
  };
});
const LoadBox = styled("div", ({ $theme }) => {
  return {
    //position:'absolute',
    height: "30px",
    width: "35px",
    //textAlign: "center",
    display: "flex",
    alignContent: "space-between",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "2001",
  };
});
const ModalButtonRed = styled(ModalButton, ({ $theme }) => {
  return {
    border:"solid 1px #C8102E",
    color:"#C8102E"
  };
});

type INullableReactText = React.ReactText | null;

const isValidString = (x: any) => {
  return Boolean(x && typeof x === "string" && x.length > 0);
};
const isValidNumber = (x: any): boolean => {
  return Boolean(typeof x === "number" && x > -1);
};
const isValidDate = (x: Date): boolean => {
  return Boolean(x.getTime());
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

type Query = {
  data: VIPClass;
  status: string;
  error: any;
};
const unformatDate = (formattedDate: string | Date): Date => {
  const thisYear: number = new Date().getFullYear(),
    numericDate: number = new Date(formattedDate).setFullYear(thisYear),
    unformattedDate: Date = new Date(numericDate);
  return unformattedDate;
};
const VIP_Edit = ({ id, collection }: { id: string; collection: string }) => {
  const nameRef = useRef<HTMLDivElement>(null);
  const collectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const { width, height } = useWindowSize();
  const { user } = useUser();
  //const [loading, setLoading] = useState(false);
  const { form, setForm, error, setError, loading, setLoading } = useForm();
  const { modalBaseDispatch, modalBaseState } = useDispatchModalBase();
  const { enqueue, dequeue } = useSnackbar();
  const [toastKey, setToastKey] = useState<INullableReactText>(null);
  const [changeForm, setChangeForm] = useState<any>({});
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
  const openModalBase = (
    component: () => ReactElement,
    hasSquareBottom: boolean
  ) => {
    modalBaseDispatch({
      type: "MODAL_UPDATE",
      payload: {
        modalBase: {
          isOpen: true,
          key: [],
          component,
          hasSquareBottom,
        },
      },
    });
  };
  const _VIPdelete = () => {
    const component: () => ReactElement = () => <ArrivalVIPdelete clientData={form} />;
    openModalBase(component, true);
  };
  const closeToast = () => {
    if (toastKey) {
      toaster.clear(toastKey);
      setToastKey(null);
    }
  };



  
  const updateVIP = async () => {

    //const clientData: VIPClass = { ...form };
    const clientData = { ...changeForm };
    clientData.id = form.id
    const updateData: VIPClass = {};

    alert(JSON.stringify(clientData))
  //  return




    let x:
      | `firstName`
      | `lastName`
      | `rateCode`
      | `arrival`
      | `departure`
      | `image`
      | `fileName`
      | `vipStatus`
      | `roomStatus`
      | "roomNumber"
      | `notes`
      | `details`
      | `stays`
      | `reservationStatus`
      | `id`;
    //const y: string = `VIP`;
    alert(JSON.stringify(clientData))

    // firstName
    x = `firstName`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        return setError((oldError: Errors) => ({
          ...oldError,
          ...{ [x]: "First Name Required" },
        }));
      } else {
        updateData[x] = clientData[x];
      }
    }
    // lastName
    x = `lastName`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        return setError((oldError: Errors) => ({
          ...oldError,
          ...{ [x]: "Last Name Required" },
        }));
      } else {
        updateData[x] = clientData[x];
      }
    }
    
 
    // rateCode
    x = `rateCode`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        return setError((oldError: Errors) => ({
          ...oldError,
          ...{ [x]: "Rate Code Required" },
        }));
      } else {
        updateData[x] = clientData[x];
      }
    }
    // arrival
    x = `arrival`;
    if (clientData[x] != undefined) {
      if (!isValidDate(clientData[x])) {
        return setError((oldError: Errors) => ({
          ...oldError,
          ...{ [x]: "Arrival Date Required" },
        }));
      } else {
        updateData[x] = clientData[x];
      }
      clientData[x] = formatDate((Array.isArray(clientData[x]) ? clientData[x][0] : clientData[x]), ' EEE dd MMM');
      if (!isValidString(clientData[x])) {
        return setError((oldError: Errors) => ({
          ...oldError,
          ...{ [x]: "Failed to convert arrival" },
        }));
      } else {
        updateData[x] = clientData[x];
      }
    }
    // departure
    x = `departure`;
    if (clientData[x] != undefined) {
      if (!isValidDate(clientData[x])) {
        return setError((oldError: Errors) => ({
          ...oldError,
          ...{ [x]: "Departure Date Required" },
        }));
      } else {
        updateData[x] = clientData[x];
      }
      clientData[x] = formatDate((Array.isArray(clientData[x]) ? clientData[x][0] : clientData[x]), ' EEE dd MMM');
      if (!isValidString(clientData[x])) {
        return setError((oldError: Errors) => ({
          ...oldError,
          ...{ [x]: "Failed to convert departure" },
        }));
      } else {
        updateData[x] = clientData[x];
      }

    }

    // const unformatDate = (formattedDate: string | Date): Date => {
    //   const thisYear: number = new Date().getFullYear(),
    //     numericDate: number = new Date(formattedDate).setFullYear(thisYear),
    //     unformattedDate: Date = new Date(numericDate);
    //   return unformattedDate;
    // };
    // const dayOfYear = (date:any):number =>{
    //   const fullYear:any = new Date(date.getFullYear(), 0, 0)
    //   return Math.floor((date - fullYear) / 1000 / 60 / 60 / 24);
    // }
    // x = `reservationStatus`;

    // if (clientData[x] != undefined) {
    //   const arrDate:Date = unformatDate(`${updateData['arrival']}`),
    //   depDate:Date = unformatDate(`${updateData['departure']}`),
    //   todDate:Date = new Date(),
    //   a = dayOfYear(arrDate),
    //   d = dayOfYear(depDate),
    //   t = dayOfYear(todDate);
    //   updateData[x] = 
    //     (t < a)
    //       ?`RESERVED`
    //       :(t === a)
    //         ? `DUEIN`
    //         : (t > a && t < d)
    //           ? `CHECKEDIN`
    //           : (t > a && t === d)
    //             ? `DUEOUT`
    //             : (t > a && t > d)
    //               ? `CHECKEDOUT`
    //               : `ERROR`;
    // }


  
    // image
    x = `image`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        updateData[
          x
        ] = `https://firebasestorage.googleapis.com/v0/b/thompson-hollywood.appspot.com/o/810-8105444_male-placeholder.png?alt=media&token=a206d607-c609-4d46-9a9a-0fc14a8053f1`;
        
      } else {
        updateData[x] = clientData[x];
      }
    }
    // fileName
    x = `fileName`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        updateData[x] = `810-8105444_male-placeholder.png`;
      } else {
        updateData[x] = clientData[x];
      }
    }
    // vipStatus
    x = `vipStatus`;
    if (clientData[x] != undefined) {
      if (!Array.isArray(clientData[x])) {
        return setError((oldError: Errors) => ({
          ...oldError,
          ...{ [x]: "VIP Status Required" },
        })); 
      } else {
        updateData[x] = clientData[x];
      }
    }
    // roomStatus
    x = `roomStatus`;
    if (clientData[x] != undefined) {
      if (Array.isArray(clientData[x])) {
        updateData[x] = clientData[x];
      }
    }
    // roomNumber
    x = `roomNumber`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
      }
    }
    // notes
    x = `notes`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
      }
    }
    // details
    x = `details`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
      }
    }
    // stays
    x = `stays`;
    if (clientData[x] != undefined) {
      if (isValidNumber(clientData[x])) {
        updateData[x] = clientData[x];
      }
    }
    // id
    x = `id`;
    if (!isValidString(clientData[x])) {
      return setError((oldError: Errors) => ({
        ...oldError,
        ...{ [x]: "ID Required" },
      }));
    }else{
      updateData[x] = clientData[x];
    }

    alert(JSON.stringify(updateData))

    setLoading(true);
    enqueue({ message: "Updating VIP", progress: true }, DURATION.infinite);
    try {
      const updateVIP = firebase.functions().httpsCallable("updateArrivalVIP");
      const response = await updateVIP(updateData);
      dequeue();
      enqueue(
        {
          message: "VIP Updated",
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
        ...{ server: `VIP not updated.` },
      }));
      dequeue();
      alert(`${e?.message || e}`)
      showToast(`${e?.message || e}`);
      enqueue(
        {
          message: `Your VIP wasn't updated`,
          startEnhancer: ({ size }) => <DeleteAlt size={size} />,
        },
        DURATION.short
      );
    } finally {
      setLoading(false);
    }
  };
  //STATE
  const [data, setData] = useState(null);
  const [progress, setProgress] = useState(null);
  const [file, setFile] = useState(null);
  const { fireCustomer } = useUser();
  const taskRef = useRef(null);
  const [photoURL, setPhotoURL] = useState(null);
  const [query, setQuery] = useState(null);
  //HOOKS
  const fireStoreQuery: Query = useFirestoreQuery(query);
  useEffect(() => {
    if (firebase) {
      setQuery(firebase.firestore().collection(collection).doc(id));
    }
    return () => {
      setQuery(null);
    };
  }, [firebase]);
  useEffect(() => {
    if (fireStoreQuery.data) {
      const {
        arrival,
        departure,
        details,
        fileName,
        firstName,
        image,
        lastName,
        notes,
        rateCode,
        reservationStatus,
        roomNumber,
        roomStatus,
        vipStatus,
        stays,
      }: VIPClass = { ...fireStoreQuery.data };
      const defaultForm = new VIPClass(
        unformatDate(arrival),
        unformatDate(departure),
        details,
        fileName,
        firstName,
        id,
        image,
        lastName,
        notes,
        rateCode,
        reservationStatus,
        roomNumber,
        roomStatus,
        vipStatus,
        stays
      );

      setForm({ ...defaultForm } as VIPClass);
    }

    return () => {
      setForm({});
      setError({});
      setChangeForm({});
    };
  }, [defaultForm, id, fireStoreQuery]);
  //FUNCTIONS
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
            setChangeForm((oldForm: VIPClass) => ({
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
          //alert(JSON.stringify(e));
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }

      setForm((oldForm: VIPClass) => ({
        ...oldForm,
        ...{ image: url, fileName: filePath },
      }));
      return setImgURL(url);
    }
  };

  useEffect(() => {
   // getImgURL();

    //alert(formatDate(new Date(), ' EEE dd MMM'))
  }, []);


  useEffect(() => {

    console.log(`changeForm`);

    console.log(changeForm);
  }, [changeForm]);


const getRange = ({arrival, departure, changeArrival, changeDeparture}):(Date | Date[]) => {
  //alert(JSON.stringify({arrival, departure, changeArrival, changeDeparture}))
  const Arrival = (changeArrival || arrival);
  const Departure = (((changeArrival && changeDeparture)?changeDeparture:((!changeArrival && departure)?departure:null)));
  if(Departure && Arrival){
    return [Arrival, Departure]
  }else if(Arrival){
    return [Arrival]
  }else{
    return []
  }
}
  
  console.log("render");
  return (  
    <>
      <LoadHeader>
        <div>{`Edit VIP `}</div>
        {(fireStoreQuery.status === "loading" || loading) && (
          <div>
            <LoadBox>
              <Spinner size={"18px"} color={"rgb(23,55,94)"} />
            </LoadBox>
          </div>
        )}
      </LoadHeader>
      <ModalBody>
        {/** Name */}
        <FormSection>
          <FormInput
            style={formStyle}
            label={<Label2>{"Name"}</Label2>}
            stack={true}
          >
            <FormControl error={error?.firstName}>
              <Input
                required
                disabled={fireStoreQuery.status === "loading" || loading}
                onChange={(e) => {
                  const str = e?.currentTarget?.value;
                  // setForm((oldForm: VIPClass) => ({
                  //   ...oldForm,
                  //   ...{ firstName: str },
                  // }));
                  setChangeForm((oldForm: VIPClass) => ({
                    ...oldForm,
                    ...{ firstName: str },
                  }));
                }}
                value={changeForm?.firstName || form?.firstName}
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
                disabled={fireStoreQuery.status === "loading" || loading}
                onChange={(e) => {
                  const str = e?.currentTarget?.value;
                  // setForm((oldForm: VIPClass) => ({
                  //   ...oldForm,
                  //   ...{ lastName: str },
                  // }));
                  setChangeForm((oldForm: VIPClass) => ({
                    ...oldForm,
                    ...{ lastName: str },
                  }));
                }}
                value={changeForm?.lastName || form?.lastName}
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
        {/** Dates **/}
        <FormSection>
          <FormInput
            style={formStyle}
            label={<Label2>{"Dates"}</Label2>}
            stack={true}
          >
           
            <FormControl error={error?.arrival}>
            <Calendar
              //onChange={({date}) => console.log(date)}
              range
              //value={[form?.arrival, form?.departure]}
              value={getRange({
                arrival:form?.arrival, 
                departure:form?.departure, 
                changeArrival:changeForm?.arrival, 
                changeDeparture:changeForm?.departure
              })}
              // value={():Date|Date[]=>{
              //   const d = new Date()
              //   return d
              // }}
              //value={((form?.arrival && form?.departure) || (changeForm?.arrival && changeForm?.departure)) ? [(changeForm?.arrival || form.arrival), (changeForm?.departure || form.departure)]:((changeForm?.arrival || form?.arrival))?[(changeForm?.arrival || form?.arrival)]:(changeForm?.departure || form.departure)?[(changeForm?.departure || form.departure)]:[]}
              onChange={({ date }) => {
                const arrival = Array.isArray(date) ? date[0] : [date];
                const departure = (Array.isArray(date) && date.length>1) ? (date[1]||null) : null;
                //alert(JSON.stringify({arrival,departure}))
                setChangeForm((oldForm: VIPClass) => ({
                  ...oldForm,
                  ...{ arrival  , departure },
                }));
              }}
            
            />
            </FormControl>
          </FormInput>
        </FormSection>
        {/** Details */}
        <FormSection>
          <FormInput
            style={formStyle}
            label={<Label2>{"Details"}</Label2>}
            stack={true}
          >
            <FlexContainer>
              <FormControl caption={() => "Room"} error={error?.roomNumber}>
                <Input
                  //required
                  disabled={fireStoreQuery.status === "loading" || loading}
                  onChange={(e) => {
                    const str = e?.currentTarget?.value;
                    // setForm((oldForm: VIPClass) => ({
                    //   ...oldForm,
                    //   ...{ roomNumber: str },
                    // }));
                    setChangeForm((oldForm: VIPClass) => ({
                      ...oldForm,
                      ...{ roomNumber: str },
                    }));
                  }}
                  value={changeForm?.roomNumber || form?.roomNumber}
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
                  value={changeForm?.roomStatus || form?.roomStatus}
                  disabled={fireStoreQuery.status === "loading" || loading}
                  placeholder="INSPECTED"
                  onChange={(params) => {
                    const roomStatus = params.value;
                    // setForm((oldForm: VIPClass) => ({
                    //   ...oldForm,
                    //   ...{ roomStatus },
                    // }));
                    setChangeForm((oldForm: VIPClass) => ({
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
                  disabled={fireStoreQuery.status === "loading" || loading}
                  onChange={(e) => {
                    const str = e?.currentTarget?.value;
                    // setForm((oldForm: VIPClass) => ({
                    //   ...oldForm,
                    //   ...{ rateCode: str },
                    // }));
                    setChangeForm((oldForm: VIPClass) => ({
                      ...oldForm,
                      ...{ rateCode: str },
                    }));
                  }}
                  value={changeForm?.rateCode || form?.rateCode}
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
                  value={changeForm?.vipStatus || form?.vipStatus}
                  disabled={fireStoreQuery.status === "loading" || loading}
                  placeholder="V6"
                  onChange={(params) => {
                    const vipStatus = params.value;
                    // setForm((oldForm: VIPClass) => ({
                    //   ...oldForm,
                    //   ...{ vipStatus },
                    // }));
                    setChangeForm((oldForm: VIPClass) => ({
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
            <FlexContainer>
              <FormControl caption={() => "Location"} error={error?.rateCode}>
                <Input
                  required
                  disabled={fireStoreQuery.status === "loading" || loading}
                  onChange={(e) => {
                    const str = e?.currentTarget?.value;
                    // setForm((oldForm: VIPClass) => ({
                    //   ...oldForm,
                    //   ...{ rateCode: str },
                    // }));
                    setChangeForm((oldForm: VIPClass) => ({
                      ...oldForm,
                      ...{ details: str },
                    }));
                  }}
                  value={changeForm?.details || form?.details}
                  onFocus={() =>
                    //executeScroll(cbdRef),
                    setError({})
                  }
                  key="details"
                  id="details"
                  name="details"
                  error={Boolean(error?.details)}
                  type="text"
                  placeholder="Los Angeles, United States"
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
              value={changeForm?.notes || form?.notes}
              disabled={fireStoreQuery.status === "loading" || loading}
              onChange={(e) => {
                const str = e?.currentTarget?.value;
                // setForm((oldForm: VIPClass) => ({
                //   ...oldForm,
                //   ...{ notes: str },
                // }));
                setChangeForm((oldForm: VIPClass) => ({
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
        <FormSection>
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
                  (changeForm?.image && (changeForm?.image).length)?changeForm?.image:(form?.image && (form?.image).length) ? form.image : imgURL
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
        <Accordion>
          <Panel title="Change Form Dev">
            {
              <>
                {changeForm &&
                  Object.keys(changeForm).map(function (key, index) {
                    //alert(fireProductDefault[key])
                    return <div>{`${key} : ${JSON.stringify(form[key])}`}</div>;
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
        <ModalButtonRed
          disabled={fireStoreQuery.status === "loading" || loading}
          onClick={_VIPdelete}
          kind={ButtonKind.tertiary}
          
        >
          Remove
        </ModalButtonRed>
        <ModalButton
          disabled={fireStoreQuery.status === "loading" || loading || Object.keys(changeForm).length === 0}
          isLoading={loading}
          onClick={updateVIP}
        >
          Update
        </ModalButton>
      </ModalFooter>
    </>
  );
};
export default VIP_Edit;

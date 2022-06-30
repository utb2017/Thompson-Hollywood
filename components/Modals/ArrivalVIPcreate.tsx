import { useState, useEffect, useRef, useCallback } from "react";
import firebase from "../../firebase/clientApp";
import { FormInput } from "../Console";
import { Label2 } from "baseui/typography";
import { styled } from "baseui";
import { ModalHeader, ModalBody, ModalFooter, ModalButton } from "baseui/modal";
import { KIND as ButtonKind } from "baseui/button";
import { Input } from "baseui/input";
import { Check, DeleteAlt } from "baseui/icon";
import { FormControl } from "baseui/form-control";
import { Select } from "baseui/select";
import { useSnackbar, DURATION } from "baseui/snackbar";
import { useDispatchModalBase } from "../../context/Modal";
import {
 ToasterContainer,
  toaster,
  PLACEMENT,
} from "baseui/toast";
import { Textarea } from "baseui/textarea";
import { Card, StyledBody } from "baseui/card";
import {StatefulCalendar} from 'baseui/datepicker';
import { FileUploader } from "baseui/file-uploader";
import { formatDate } from "../../helpers/formatDate";
import { VIPClass } from "../../classes";
import { useForm } from "../../context/formContext";



const dayOfYear = (date:any):number =>{
  const fullYear:any = new Date(date.getFullYear(), 0, 0)
  return Math.floor((date - fullYear) / 1000 / 60 / 60 / 24);
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

type INullableReactText = React.ReactText | null;


const isValidString = (x: any) => {
  return Boolean(x && typeof x === "string" && x.length > 0);
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

const CreateVIP = () => {

  const nameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  //const { user } = useUser();
  //const [loading, setLoading] = useState(false);
  const { form, setForm, error, setError, loading, setLoading } = useForm();
  const { modalBaseDispatch, modalBaseState } = useDispatchModalBase();
  const { enqueue, dequeue } = useSnackbar();
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

  const createVIP = async () => {




    const clientData: VIPClass = { ...form };
    const updateData: VIPClass = {};
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

    // firstName
    x = `firstName`;
    if (!isValidString(clientData[x])) {
      return setError((oldError: Errors) => ({
        ...oldError,
        ...{ [x]: "First Name Required" },
      }));
    } else {
      updateData[x] = clientData[x];
    }
    // lastName
    x = `lastName`;
    if (!isValidString(clientData[x])) {
      return setError((oldError: Errors) => ({
        ...oldError,
        ...{ [x]: "Last Name Required" },
      }));
    } else {
      updateData[x] = clientData[x];
    }
    // rateCode
    x = `rateCode`;
    if (!isValidString(clientData[x])) {
      return setError((oldError: Errors) => ({
        ...oldError,
        ...{ [x]: "Rate Code Required" },
      }));
    } else {
      updateData[x] = clientData[x];
    }
    // roomNumber
    x = `roomNumber`;
    if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
    } else {
        updateData[x] = `TBD`;
    }
    // arrival
    x = `arrival`;
    if (!(clientData[x] instanceof Date)) {
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
        ...{ [x]: "Failed to convert" },
      }));
    } else {
      updateData[x] = clientData[x];
    }
    // departure
    x = `departure`;
    if (!(clientData[x] instanceof Date)) {
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
        ...{ [x]: "Failed to convert" },
      }));
    } else {
      updateData[x] = clientData[x];
    }
    // image
    x = `image`;
    if (!isValidString(clientData[x])) {
        updateData[
          x
        ] = `https://firebasestorage.googleapis.com/v0/b/thompson-hollywood.appspot.com/o/810-8105444_male-placeholder.png?alt=media&token=a206d607-c609-4d46-9a9a-0fc14a8053f1`;
        // return setError((oldError: Errors) => ({
        //   ...oldError,
        //   ...{ [x]: "Image Required" },
        // }));
    } else {
      updateData[x] = clientData[x];
    }
    // fileName
    x = `fileName`;
    if (!isValidString(clientData[x])) {
      updateData[x] = `810-8105444_male-placeholder.png`;
      // return setError((oldError: Errors) => ({
      //   ...oldError,
      //   ...{ [x]: "Image File Name Required" },
      // }));
    } else {
      updateData[x] = clientData[x];
    }
    // vipStatus
    x = `vipStatus`;
    if (Array.isArray(clientData[x]) && clientData[x].length ) {
      updateData[x] = clientData[x];
    } else {
      return setError((oldError: Errors) => ({
        ...oldError,
        ...{ [x]: "VIP Status Required" },
      }));      
    }
    // roomStatus
    x = `roomStatus`;
    if (Array.isArray(clientData[x]) && clientData[x].length ) {
      updateData[x] = clientData[x];
    }else{
      updateData[x] = undefined;
    }
    // notes
    x = `notes`;
    if (!isValidString(clientData[x])) {
      updateData[x] = `No Notes`;
    }else{
      updateData[x] = clientData[x];
    }
    // details
    x = `details`;
    if (!isValidString(clientData[x])) {
      updateData[x] = `No Location`;
    }else{
      updateData[x] = clientData[x];
    }
    // stays
    x = `stays`;
    updateData[x] = 0;
    // reservationStatus
    x = `reservationStatus`;
    updateData[x] = null;
    // id
    x = `id`;
    updateData[x] = null;

      
    const completeVIP = new VIPClass(
      updateData.arrival, // arrival?: string,
      updateData.departure, // departure?: string,
      updateData.details, // details?: string,
      updateData.fileName, // fileName?: string
      updateData.firstName, // firstName?: string,
      updateData.id, // id?: string,
      updateData.image, // image?: string,
      updateData.lastName, // lastName?: string,
      updateData.notes, // notes?: string,
      updateData.rateCode, // rateCode?: string,
      updateData.reservationStatus, // reservationStatus?:'DUEIN'|'DUEOUT'|'CHECKEDIN'|'CHECKEDOUT'|'RESERVED'|'NOSHOW'|'CANCEL',
      updateData.roomNumber, // roomNumber?: string,
      updateData.roomStatus, // roomStatus?: [],
      updateData.vipStatus, // vipStatus?: [],
      updateData.stays, // stays?:number,
    );
   



    setLoading(true);
    enqueue({ message: "Creating VIP", progress: true }, DURATION.infinite);
    try {
      const createVIP = firebase.functions().httpsCallable("createArrivalVIP");
      const response = await createVIP(completeVIP);
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
  // //const { fireCustomer } = useUser();
   const taskRef = useRef(null);
  const [photoURL, setPhotoURL] = useState(null);


  const handleChange = (acceptedFiles) => {
    //e.stopPropagation()
    //alert(JSON.stringify(acceptedFiles))
    setData(acceptedFiles[0]);
    setFile(acceptedFiles[0].name);
    setError(false);
    setPhotoURL(URL.createObjectURL(acceptedFiles[0]));
  };
  // const updateProfile = async (photoURL) => {
  //   setLoading(true);
  //   try {
  //     const fieldUpdate = { photoURL };
  //     await updateFirestore("users", fireCustomer?.data?.uid, fieldUpdate);
  //     NotificationManager.success("License Updated");
  //     closeModal();
  //   } catch (e) {
  //     setLoading(false);
  //     setError(`${e?.message || e || "ERROR"}`);
  //     NotificationManager.error(e.message);
  //   }
  // };
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
    [taskRef, data]
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
        ...{ image:url, fileName:filePath },
      }));
      return setImgURL(url);
    }
  };

  useEffect(() => {
    getImgURL();
    
  //alert(formatDate(new Date(), ' EEE dd MMM'))
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
        {/** Dates **/}
        <FormSection>
         
        <FormInput
            style={formStyle}
            label={<Label2>{"Dates"}</Label2>}
            stack={true}
          >
        <FormControl error={error?.arrival}>

        <StatefulCalendar
    //onChange={({date}) => console.log(date)}
    range
    value={(form?.arrival && form?.departure)?[form.arrival, form.departure]:(form?.arrival)?[form?.arrival]:(form?.departure)?[form?.departure]:[]}
    onChange={({ date }) => {
      const arrival = Array.isArray(date) ? date[0] : [date];
      const departure = (Array.isArray(date) && date.length>1) ? (date[1]||null) : null;
      setForm((oldForm: VIPClass) => ({
        ...oldForm,
        ...{ arrival, departure },
      }));
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
            <FlexContainer>
              <FormControl caption={() => "City, State Country"} error={error?.rateCode}>
                <Input
                  required
                  disabled={loading}
                  onChange={(e) => {
                    const str = e?.currentTarget?.value;
                    // setForm((oldForm: VIPClass) => ({
                    //   ...oldForm,
                    //   ...{ rateCode: str },
                    // }));
                    setForm((oldForm: VIPClass) => ({
                      ...oldForm,
                      ...{ details: str },
                    }));
                  }}
                  value={form?.details}
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
        {/* <Accordion>
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
        </Accordion> */}
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
        <ModalButton isLoading={loading} onClick={createVIP}>
          Create
        </ModalButton>
      </ModalFooter>
    </>
  );
};
export default CreateVIP;

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

class RoleClass {
  role:string;
  constructor(
    role:string,
  ) {
    this.role = role;
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



const Role = () => {
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
  const { user, fireBrands, fireCollections, fireUser } = useUser();
  //const [loading, setLoading] = useState(false);
  const { form, setForm, error, setError, loading, setLoading } = useForm();
  const [collectionList, setCollectionList] = useState([]);
  const { setNavLoading, navLoading } = useRouting();
  const { modalBaseDispatch, modalBaseState } = useDispatchModalBase();
  const { enqueue, dequeue } = useSnackbar();
  //const fireCollections = useFirestoreQuery(user?.uid && firebase.firestore().collection("collections"));
  //const fireBrands = useFirestoreQuery(user?.uid && firebase.firestore().collection("brands"));
  const defaultForm = new RoleClass(
    fireUser?.data?.role, // role:string,
  );

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
    setForm({ ...defaultForm } as RoleClass);
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

    if (isEmpty(_form?.role)) {
      _error.role = "Role required."
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
      await updateFirestore("users", fireUser?.data?.uid, fieldUpdate)
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

  const handleClick = useCallback(async () => {
    if (form?.role?.length) {
      setLoading(true)
      try {
        await deleteAuthUser(fireUser?.data)
        //NotificationManager.success("Role Updated")
      dequeue();
      enqueue({ message: "Account deleted", startEnhancer: ({ size }) => <Check size={size} /> }, DURATION.short);
      closeModal()
      } catch (e) {
        setLoading(false)
        showToast(`${error?.message || error}`);
        setError((oldError: Errors) => ({ ...oldError, ...{ server: `Account not deleted` } }));
        dequeue();
        //NotificationManager.error(e.message)
      }finally{ 
       // setLoading(false)
      }
    }
  }, [form, fireUser])



  return (
    <>
      <ModalHeader>Remove User</ModalHeader>
      <ModalBody>
        This action cannot be undone. You will remove all data for this user.
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
        //disabled={fireUser?.data?.role === form?.role || !form?.role?.length }
         isLoading={loading}
          onClick={handleClick}
         // kind={KIND.primary}
          overrides={{
              BaseButton: {
                  style: ({ $theme }) => ({
                      backgroundColor: $theme.colors.negative300,
                      color: '#fff'
                  })
              }
          }}
          
          >
          Remove
        </ModalButton>
      </ModalFooter>
    </>
  );
};
export default Role;

import { useState, useEffect, useRef, Fragment } from "react";
import { isEmpty } from "../../../helpers";
import firebase from "../../../firebase/clientApp";
import { useUser } from "../../../context/userContext";
import { useRouting } from "../../../context/routingContext";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { useForm } from "../../../context/formContext";
import { styled } from "styletron-react";
import { ModalHeader, ModalBody, ModalFooter, ModalButton } from "baseui/modal";
import { KIND as ButtonKind } from "baseui/button";
import { Check, Delete, DeleteAlt } from "baseui/icon";
import { ThemeProvider, createTheme, lightThemePrimitives } from "baseui";
import { useSnackbar, DURATION } from "baseui/snackbar";
import { useDispatchModalBase } from "../../../context/Modal";
import { Toast, ToasterContainer, toaster, PLACEMENT } from "baseui/toast";
import {Notification, KIND} from 'baseui/notification';

type Selected = {
  label: string | number;
  value: string | Date;
};
interface CollectionClass {
  active: boolean | null;
  cartLimit: number | null;
  description: string | null;
  featured: boolean | null;
  flower: boolean | null;
  genome: boolean | null;
  id: string | null;
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

type INullableReactText = React.ReactText | null;

const CollectionDelete = ({ fireCollection }) => {
  const { form, setForm, error, setError, loading, setLoading } = useForm();
  const { setNavLoading, navLoading } = useRouting();
  const { modalBaseDispatch, modalBaseState } = useDispatchModalBase();
  const { enqueue, dequeue } = useSnackbar();

  const [toastKey, setToastKey] = useState<INullableReactText>(null);
  const showToast = (x: string) => setToastKey(toaster.negative(`${x}`, {}));

  useEffect(() => {
    
    console.log("form setup");
    setForm({ ...fireCollection });
    return () => {
      setForm({});
      setError({});
    };
  }, []);

  const closeToast = () => {
    if (toastKey) {
      toaster.clear(toastKey);
      setToastKey(null);
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
          hasSquareBottom:false
          
        },
      },
    });
  };

  const deleteCollection = async () => {
    const _form: CollectionClass = { ...form };
    // ** TITLE **
    //return
    setLoading(true);
    enqueue({ message: "Deleting Collection", progress: true }, DURATION.infinite);
    try {
      const deleteCollection = firebase.functions().httpsCallable("deleteCollection");
      const response = await deleteCollection(_form);
      dequeue();
      enqueue({ message: "Collection Deleted", startEnhancer: ({ size }) => <Check size={size} /> }, DURATION.short);
      closeModal()
      //if (response?.data?.success === true) {}
    } catch (e) {
      //setError(`${e?.message || e}`);
      setError((oldError: Errors) => ({ ...oldError, ...{ server: `${e?.message || e}`   } }));
      dequeue();
      showToast(`${e?.message || e}`);
      enqueue({ message: `Your collection wasn't deleted`, startEnhancer: ({ size }) => <DeleteAlt size={size} /> }, DURATION.short);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

        <ModalHeader>Delete Collection</ModalHeader>
        
        <ModalBody>

        {`Are you sure you want to delete ${form?.title|| 'this collection'}?`}

        <>
          <ToasterContainer
            placement={PLACEMENT.topRight}
            overrides={{
              Root: { style: ({ $theme }) => ({ zIndex: 50 }) },
            }}
            usePortal={true}
          />
        </>

          {/* <div>Are you sure you want to delete this collection?</div>
          {error?.server && <Notification kind={KIND.negative}>
        {`${error?.server }`}
      </Notification>}           */}
        </ModalBody>
        <ModalFooter>
          <ModalButton onClick={closeModal} kind={ButtonKind.tertiary}>Cancel</ModalButton>
          <ModalButton
            isLoading={loading}
            onClick={deleteCollection}
            // overrides={{
            //   BaseButton: {
            //     style: ({ $theme }) => ({
            //       backgroundColor: $theme.colors.negative300
            //     })
            //   }
            // }}
          >
            Delete
          </ModalButton>
        </ModalFooter>

    </>
  );
};
export default CollectionDelete;

import { useState, useEffect} from "react";
//import { isEmpty } from "../../helpers";
import firebase from "../../firebase/clientApp";
//import { useUser } from "../../context/userContext";
//import { useRouting } from "../../context/routingContext";
//import { useForm } from "../../context/formContext";
import { ModalHeader, ModalBody, ModalFooter, ModalButton } from "baseui/modal";
import { KIND as ButtonKind } from "baseui/button";
import { Check, Delete, DeleteAlt } from "baseui/icon";
//import { ThemeProvider, createTheme, lightThemePrimitives } from "baseui";
import { useSnackbar, DURATION } from "baseui/snackbar";
import { useDispatchModalBase } from "../../context/Modal";
import { Toast, ToasterContainer, toaster, PLACEMENT } from "baseui/toast";
//import {Notification, KIND} from 'baseui/notification';
import { VIPClass } from "../../classes";
import { styled } from "baseui";
import { useRouter } from "next/router";


const ModalButtonRed = styled(ModalButton, ({ $theme }) => {
  return {
    //border:"solid 1px #C8102E",
    //color:"#C8102E"
    backgroundColor:"#C8102E"
  };
});

type INullableReactText = React.ReactText | null;

const VIPDelete = () => {

  const { modalBaseDispatch, modalBaseState } = useDispatchModalBase();
  const { enqueue, dequeue } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [toastKey, setToastKey] = useState<INullableReactText>(null);
  const showToast = (x: string) => setToastKey(toaster.negative(`${x}`, {}));
  const router = useRouter()

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

  const removeArrivalVIP = async () => {
    setLoading(true);
    enqueue({ message: "Updating...", progress: true }, DURATION.infinite);
    try {
      const rqp = router?.query?.property as "LAXTH" | "LAXTE"
      const deleteArrivalVIP:any = firebase.functions().httpsCallable(`updateVIPs_${rqp}`);
      const res:{data:{success:boolean,id:string}} = await deleteArrivalVIP();
      if(res?.data?.success === true){
        dequeue();
        enqueue({ message: "VIP's Updated.", startEnhancer: ({ size }) => <Check size={size} /> }, DURATION.short);
        closeModal()        
      }
      //if (response?.data?.success === true) {}
    } catch (e) {
      //setError(`${e?.message || e}`);
      //setError((oldError: Errors) => ({ ...oldError, ...{ server: `${e?.message || e}`   } }));
      dequeue();
      showToast(`${e?.message || e}`);
      enqueue({ message: `VIP's weren't updated.`, startEnhancer: ({ size }) => <DeleteAlt size={size} /> }, DURATION.short);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

        <ModalHeader>Update...</ModalHeader>
        
        <ModalBody>

        {`Update the reservation status?`}

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
            disabled={loading}
            onClick={removeArrivalVIP}
            // overrides={{
            //   BaseButton: {
            //     style: ({ $theme }) => ({
            //       backgroundColor: $theme.colors.negative300
            //     })
            //   }
            // }}
          >
            Update
          </ModalButton>
        </ModalFooter>

    </>
  );
};
export default VIPDelete;

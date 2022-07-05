import { useState, useEffect} from "react";
//import { isEmpty } from "../../helpers";
import firebase from "../../firebase/clientApp";
//import { useUser } from "../../context/userContext";
//import { useRouting } from "../../context/routingContext";
//import { useForm } from "../../context/formContext";
import { ModalHeader, ModalBody, ModalFooter, ModalButton } from "baseui/modal";
import { Check, Delete, DeleteAlt } from "baseui/icon";
//import { ThemeProvider, createTheme, lightThemePrimitives } from "baseui";
import { useSnackbar, DURATION } from "baseui/snackbar";
import { useDispatchModalBase } from "../../context/Modal";
import { Toast, ToasterContainer, toaster, PLACEMENT } from "baseui/toast";
//import {Notification, KIND} from 'baseui/notification';
import Link from 'next/link'


type INullableReactText = React.ReactText | null;

const VIPOpenPrint = ({ url }:{url:URL}) => {

  const { modalBaseDispatch, modalBaseState } = useDispatchModalBase();
  const { enqueue, dequeue } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [toastKey, setToastKey] = useState<INullableReactText>(null);




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



  return (
    <>

        <ModalHeader>Detailed VIP</ModalHeader>
        
        <ModalBody>
          <div style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
            <div><Check size={42} /></div>
            <div style={{minWidth:'220px'}} >
                    {`Your PDF was created!`}
            </div>
          </div>

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
      
            {/* <ModalButton onClick={closeModal} kind={ButtonKind.tertiary}>Cancel</ModalButton>    */}
        
          <Link href={url}>
          <a target="_blank">
            <ModalButton
              isLoading={loading}
              disabled={loading}
              onClick={closeModal}
            >
              Open
            </ModalButton>     
            </a>       
          </Link>

        </ModalFooter>

    </>
  );
};
export default VIPOpenPrint;

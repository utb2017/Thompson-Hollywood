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
class BrandClass {
  active: boolean;
  cartLimit: number | null;
  description: string | null;
  featured: boolean;
  filePath: string | null;
  flower: boolean;
  genome: string | null;
  id: string | null;
  img: string | null;
  key: string | null;
  menuOrder: number | null;
  onSale: boolean;
  productsTotal: number | null;
  saleCode: string | null;
  saleRate: number | null;
  saleTitle: string | null;
  sales: number | null;
  sold: number | null;
  title: string | null;
  total: number | null;
  weight: boolean;
  createdBy: string | null;

  constructor(
    active: boolean,
    cartLimit: number | null,
    description: string | null,
    featured: boolean,
    filePath: string | null,
    flower: boolean,
    genome: string | null,
    id: string | null,
    img: string | null,
    key: string | null,
    menuOrder: number | null,
    onSale: boolean,
    productsTotal: number | null,
    saleCode: string | null,
    saleRate: number | null,
    saleTitle: string | null,
    sales: number | null,
    sold: number | null,
    title: string | null,
    total: number | null,
    weight: boolean,
    createdBy: string | null
  ) {
    this.active = active
    this.cartLimit = cartLimit
    this.description = description
    this.featured = featured
    this.filePath = filePath
    this.flower = flower
    this.genome = genome
    this.id = id
    this.img = img
    this.key = key
    this.menuOrder = menuOrder
    this.onSale = onSale
    this.productsTotal = productsTotal
    this.saleCode = saleCode
    this.saleRate = saleRate
    this.saleTitle = saleTitle
    this.sales = sales
    this.sold = sold
    this.title = title
    this.total = total
    this.weight = weight
    this.createdBy = createdBy
  }
}
interface Errors {
  title?: string;
  description?: string;
}


type INullableReactText = React.ReactText | null;

const BrandDelete = ({ fireBrand }) => {
  const { form, setForm, error, setError, loading, setLoading } = useForm();
  const { setNavLoading, navLoading } = useRouting();
  const { modalBaseDispatch, modalBaseState } = useDispatchModalBase();
  const { enqueue, dequeue } = useSnackbar();

  const [toastKey, setToastKey] = useState<INullableReactText>(null);
  const showToast = (x: string) => setToastKey(toaster.negative(`${x}`, {}));

  useEffect(() => {
    
    console.log("form setup");
    setForm({ ...fireBrand });
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

  const deleteBrand = async () => {
    //return
    const _form: BrandClass = { ...form };
    // ** TITLE **

    setLoading(true);
    enqueue({ message: "Deleting Brand", progress: true }, DURATION.infinite);
    try {
      const deleteBrand = firebase.functions().httpsCallable("deleteBrand");
      const response = await deleteBrand(_form);
      dequeue();
      enqueue({ message: "Brand Deleted", startEnhancer: ({ size }) => <Check size={size} /> }, DURATION.short);
      closeModal()
      //if (response?.data?.success === true) {}
    } catch (e) {
      //setError(`${e?.message || e}`);
      setError((oldError: Errors) => ({ ...oldError, ...{ server: `${e?.message || e}`   } }));
      dequeue();
      showToast(`${e?.message || e}`);
      enqueue({ message: `Your brand wasn't deleted`, startEnhancer: ({ size }) => <DeleteAlt size={size} /> }, DURATION.short);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

        <ModalHeader>Delete Brand</ModalHeader>
        
        <ModalBody>

        {`Are you sure you want to delete ${form?.title || 'this brand'}?`}

        <>
          <ToasterContainer
            placement={PLACEMENT.topRight}
            overrides={{
              Root: { style: ({ $theme }) => ({ zIndex: 50 }) },
            }}
            usePortal={true}
          />
        </>

          {/* <div>Are you sure you want to delete this brand?</div>
          {error?.server && <Notification kind={KIND.negative}>
        {`${error?.server }`}
      </Notification>}           */}
        </ModalBody>
        <ModalFooter>
          <ModalButton onClick={closeModal} kind={ButtonKind.tertiary}>Cancel</ModalButton>
          <ModalButton
            isLoading={loading}
            onClick={deleteBrand}
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
export default BrandDelete;

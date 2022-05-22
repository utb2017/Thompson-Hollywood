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
class ProductClass {
  id: string | null;
  genome: Selected;
  brandID: string;
  collectionIDs: string[];
  sold: number;
  genomeID: string;
  wholesale: number;
  active: boolean;
  price: number;
  comparePrice: number;
  //effects: object;
  //collection: string;
  thc: number;
  onSale: boolean;
  inventory: number;
  saleTitle: string;
  weight: string;
  queryIDs: string[];
  saleRate: null | number | string;
  //brandID: string;
  type: Selected;
  typeID: string;
  filePath: string;
  cbd: number | string;
  img: string;
  collections: Selected[];
  key: string;
  description: string;
  brand: Selected;
  saleCode: string;
  size: string;
  name: string;
  qty?: number;
  uid?: string;

  constructor(
    id: string | null,
    genome: Selected,
    //brandID: string,
    collectionIDs: string[],
    sold: number,
    genomeID: string,
    wholesale: number,
    active: boolean,
    price: number,
    comparePrice: number,
    //effects: object,
    //collection: string,
    thc: number,
    onSale: boolean,
    inventory: number,
    saleTitle: string,
    weight: string,
    queryIDs: string[],
    saleRate: null | number | string,
    brandID: string,
    type: Selected,
    typeID: string,
    filePath: string,
    cbd: number | string,
    img: string,
    collections: Selected[],
    key: string,
    description: string,
    brand: Selected,
    saleCode: string,
    size: string,
    name: string,
    qty?: number,
    uid?: string,
  ) {
    this.id = id;
    this.genome = genome;
    //this.brandID = brandID;
    this.collectionIDs = collectionIDs;
    this.sold = sold;
    this.genomeID = genomeID;
    this.wholesale = wholesale;
    this.active = active;
    this.price = price;
    this.comparePrice = comparePrice;
    //this.effects = effects;
    //this.collection = collection;
    this.thc = thc;
    this.onSale = onSale;
    this.inventory = inventory;
    this.saleTitle = saleTitle;
    this.weight = weight;
    this.queryIDs = queryIDs;
    this.saleRate = saleRate;
    this.brandID = brandID;
    this.type = type;
    this.typeID = typeID;
    this.filePath = filePath;
    this.cbd = cbd;
    this.img = img;
    this.collections = collections;
    this.key = key;
    this.description = description;
    this.brand = brand;
    this.saleCode = saleCode;
    this.size = size;
    this.name = name;
    this.qty = qty;
    this.uid = uid;
  }
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

const ProductDelete = ({ fireProduct }) => {
  const { form, setForm, error, setError, loading, setLoading } = useForm();
  const { setNavLoading, navLoading } = useRouting();
  const { modalBaseDispatch, modalBaseState } = useDispatchModalBase();
  const { enqueue, dequeue } = useSnackbar();

  const [toastKey, setToastKey] = useState<INullableReactText>(null);
  const showToast = (x: string) => setToastKey(toaster.negative(`${x}`, {}));

  useEffect(() => {
    
    console.log("form setup");
    setForm({ ...fireProduct });
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

  const deleteProduct = async () => {
    const _form: ProductClass = { ...form };
    // ** TITLE **

    setLoading(true);
    enqueue({ message: "Deleting Product", progress: true }, DURATION.infinite);
    try {
      const deleteProduct = firebase.functions().httpsCallable("deleteProduct");
      const response = await deleteProduct(_form);
      dequeue();
      enqueue({ message: "Product Deleted", startEnhancer: ({ size }) => <Check size={size} /> }, DURATION.short);
      closeModal()
      //if (response?.data?.success === true) {}
    } catch (e) {
      //setError(`${e?.message || e}`);
      setError((oldError: Errors) => ({ ...oldError, ...{ server: `${e?.message || e}`   } }));
      dequeue();
      showToast(`${e?.message || e}`);
      enqueue({ message: `Your product wasn't deleted`, startEnhancer: ({ size }) => <DeleteAlt size={size} /> }, DURATION.short);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

        <ModalHeader>Delete Product</ModalHeader>
        
        <ModalBody>

        {`Are you sure you want to delete ${form?.name || 'this product'}?`}

        <>
          <ToasterContainer
            placement={PLACEMENT.topRight}
            overrides={{
              Root: { style: ({ $theme }) => ({ zIndex: 50 }) },
            }}
            usePortal={true}
          />
        </>

          {/* <div>Are you sure you want to delete this product?</div>
          {error?.server && <Notification kind={KIND.negative}>
        {`${error?.server }`}
      </Notification>}           */}
        </ModalBody>
        <ModalFooter>
          <ModalButton onClick={closeModal} kind={ButtonKind.tertiary}>Cancel</ModalButton>
          <ModalButton
            isLoading={loading}
            onClick={deleteProduct}
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
export default ProductDelete;

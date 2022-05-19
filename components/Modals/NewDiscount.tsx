import { useRouter } from "next/router";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouting } from "../../context/routingContext";
import { useDispatchModal } from "../../context/modalContext";
import { useDispatchModalBase } from "../../context/Modal";
import ModalBaseContainer from "../../components/Modals/ModalBaseContainer";
import Button from "../../components/Buttons/ButtonTS";
import ServerError from "../../components/Forms/ServerError";
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalButton, SIZE, ROLE } from "baseui/modal";
import { KIND as ButtonKind } from "baseui/button";
import CouponCreateModal from "../Pages/Discount/DiscountCreate";

const DeleteCollectionBase = (props) => {
  //const { form, setForm, error, setError } = useForm()

  //const { fireSettings, fireUser } = useUser()
  //const { modalDispatch, modalState } = useDispatchModal()
  //const { setNavLoading } = useRouting()
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  //const [disabled, setDisabled] = useState(false)
  const { modalBaseDispatch, modalBaseState } = useDispatchModalBase();
  //const router = useRouter()
  //const { user } = useUser()

  const closeModal = () => {
    modalBaseDispatch({
      type: "MODAL_UPDATE",
      payload: {
        modalBase: {
          isOpen: false,
          key: [],
          component: null,
        },
      },
    });
  };

  return (
    <>
      <CouponCreateModal/>
    </>
  );
};

export default DeleteCollectionBase;
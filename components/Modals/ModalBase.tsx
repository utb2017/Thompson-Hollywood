import React, { useState, useEffect, createRef } from "react";
import { useDispatchModalBase } from "../../context/Modal";
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalButton, SIZE, ROLE } from "baseui/modal";
import {styled} from 'baseui';

import { FC } from "react";
const responsive = {
  left: `0px`,
  position: `absolute`,
  //marginBottom: "160px",
  zIndex:100,
  background:"transparent",
  backgroundColor:"transparent",
  "@media (max-width: 450px)": {
    paddingBottom: "0px",
    marginBottom: "0px",
  },

  "@media (min-width: 919px)": {
    left: `256px`,
    width: `calc(100% - 256px)`,
  },
  "@media (min-width: 1025px)": {
    left: `302px`,
    width: `calc(100% - 302px)`,
  },
  "@media (min-width: 1441px)": {
    left: `348px`,
    width: `calc(100% - 348px)`,
  },
  "@media (min-width: 2561px)": {
    left: `404px`,
    width: `calc(100% - 404px)`,
  },
};

const ModalBase = (props)  => {
  const Component = props?.modalBase?.component || Error;
  const { modalBaseDispatch, modalBaseState } = useDispatchModalBase();
  const closeModal = () => {
    modalBaseDispatch({
      type: "MODAL_UPDATE",
      payload: {
        modalBase: {
          isOpen: false,
          key: [],
          component: null,
          hasSquareBottom: false,
          closeable: true,
        },
      },
    });
  };
  const BackDrop = styled("div", ({ $theme }) => {
    return {
      height:`100%`,
      position:`fixed`,
      width:`100%`,
      zIndex:29,
      backgroundColor:$theme.colors.backgroundOverlayDark,
      //opacity: 0.9,
      backdropFilter:`blur(3px)`,
    };
  });
  const roundBottom = props?.modalBase?.hasSquareBottom
    ? {
        "@media (max-width: 450px)": {
          borderBottomRightRadius: "0px",
          borderBottomLeftRadius: "0px",
          paddingBottom: "180px",
          marginBottom: "0px",
          margin: "0px",
          marginTop:'16px'
        },
      }
    : undefined;

  return (
    <>
      {props?.modalBase?.isOpen && props?.modalBase?.component && (
        <div >
          {/* <BackDrop  /> */}

          <Modal
            onClose={() => closeModal()}
            unstable_ModalBackdropScroll
            closeable={props?.modalBase?.closeable}
            isOpen={Boolean(props?.modalBase?.isOpen && props?.modalBase?.component)}
            animate
            autoFocus
            size={SIZE.auto}
            role={ROLE.dialog}
            overrides={{
              Root: {
                style: () => responsive,
              },
              Backdrop: {
                style: () => ({
                  zIndex: 30,
                  //position: `fixed`,
                  //background:"transparent",
                  //backgroundColor:"transparent"
                }),
              },
              DialogContainer: {

                style: () => ({
                  zIndex: 30,
                }),
              },
              Dialog: {

                style: () => ({
                  zIndex: 30,
                  marginTop:'42px',
                  marginBottom:'120px',
                  minWidth:'60%'
                }),
              },
            }}
          >
            {props?.modalBase?.isOpen && props?.modalBase?.component && <Component modalBase={props.modalBase} />}
          </Modal>
        </div>
      )}
    </>
  );
}
export default ModalBase;

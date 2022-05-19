import { useDispatchModalBase } from "../../context/Modal"
import React, { useState } from "react"
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalButton,
    SIZE,
    ROLE
  } from "baseui/modal";
  import { KIND as ButtonKind } from "baseui/button";

const responsive = {
    width: `100%`,
    left: `0px`,
    display: `flex`,
    position: `fixed`,
    '@media (min-width: 919px)':{
        left: `256px`,
        width: `calc(100% - 256px)`,
      },
      '@media (min-width: 1025px)':{
        left: `302px`,
        width: `calc(100% - 302px)`,
      }, 
      '@media (min-width: 1441px)':{
        left: `348px`,
        width: `calc(100% - 348px)`,
      },
      '@media (min-width: 2561px)':{
        left: `404px`,
        width: `calc(100% - 404px)`,
      },
  }

const ModalBaseContainer = ({ children, noClose=false, modalBase }) => {
    const { modalBaseDispatch, modalBaseState } = useDispatchModalBase()
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
      })
    }
    return children
    // return (
    //     <Modal
    //         onClose={closeModal}
    //         closeable
    //         isOpen={true}
    //         animate
    //         autoFocus
    //         size={SIZE.default}
    //         role={ROLE.dialog}
    //         overrides={{
    //         DialogContainer: {
    //             style: () => (responsive)
    //         }
    //         }}
    //     >
    //        {children}
    //     </Modal>

    //   )

    //{props?.modalBase?.isOpen && props?.modalBase?.component && <Component modalBase={props?.modalBase} />}

    // return (
    //   <div className='upload-modal-container'>
    //     <div  onClick={!noClose ? closeModal : undefined} className='upload-modal-background' />
    //     {children}
    //   </div>
    // )
  }
  export default ModalBaseContainer





// import React, { useState } from "react"
// import {
//     Modal,
//     ModalHeader,
//     ModalBody,
//     ModalFooter,
//     ModalButton,
//     SIZE,
//     ROLE
//   } from "baseui/modal";
//   import { KIND as ButtonKind } from "baseui/button";
// const responsive = {
//     width: `100%`,
//     left: `0px`,
//     display: `flex`,
//     position: `fixed`,
//     '@media (min-width: 919px)':{
//         left: `256px`,
//         width: `calc(100% - 256px)`,
//       },
//       '@media (min-width: 1025px)':{
//         left: `302px`,
//         width: `calc(100% - 302px)`,
//       }, 
//       '@media (min-width: 1441px)':{
//         left: `348px`,
//         width: `calc(100% - 348px)`,
//       },
//       '@media (min-width: 2561px)':{
//         left: `404px`,
//         width: `calc(100% - 404px)`,
//       },
//   }
// const ModalBase = (props) => {
//   const Component = props?.modalBase?.component || Error
//   return (<>
//   <Modal
//      //onClose={close}
//      closeable
//      isOpen={props?.modalBase?.isOpen}
//      animate
//      autoFocus
//      size={SIZE.default}
//      role={ROLE.dialog}
//      overrides={{
//        DialogContainer: {
//          style: () => (responsive)
//        }
//      }}
//    ><>{props?.modalBase?.isOpen && props?.modalBase?.component && <Component modalBase={props?.modalBase} />}</>
//    </Modal>
//    </>)
// }

// export default ModalBase




  
// import React, { FC, ReactElement, useState } from "react"
// import {
//     Modal,
//     ModalHeader,
//     ModalBody,
//     ModalFooter,
//     ModalButton,
//     SIZE,
//     ROLE
//   } from "baseui/modal";
//   import { KIND as ButtonKind } from "baseui/button";
// const responsive = {
//     width: `100%`,
//     left: `0px`,
//     display: `flex`,
//     position: `fixed`,
//     '@media (min-width: 919px)':{
//         left: `256px`,
//         width: `calc(100% - 256px)`,
//       },
//       '@media (min-width: 1025px)':{
//         left: `302px`,
//         width: `calc(100% - 302px)`,
//       }, 
//       '@media (min-width: 1441px)':{
//         left: `348px`,
//         width: `calc(100% - 348px)`,
//       },
//       '@media (min-width: 2561px)':{
//         left: `404px`,
//         width: `calc(100% - 404px)`,
//       },
//   }
// const NewDiscount:FC = ():ReactElement => {
//   const [isOpen, setIsOpen] = useState<boolean>(true);
//   function close() {
//     setIsOpen(false);
//   }
//   return (
//     <div>
//       <ModalHeader>Hello world</ModalHeader>
//       <ModalBody>
//         Proin ut dui sed metus pharetra hend rerit vel non
//         mi. Nulla ornare faucibus ex, non facilisis nisl.
//         Maecenas aliquet mauris ut tempus.
//       </ModalBody>
//       <ModalFooter>
//         <ModalButton kind={ButtonKind.tertiary}>
//           Cancel
//         </ModalButton>
//         <ModalButton>Okay</ModalButton>
//       </ModalFooter>
//     </div>
//   );
// }
// export default NewDiscount
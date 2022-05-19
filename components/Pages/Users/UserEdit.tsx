import React, { ReactElement } from "react"
//import ServerError from '../../../components/Forms/ServerError'
import { useState, useEffect, useCallback } from "react"
import { capitalize } from "../../../helpers"
import { useUser } from "../../../context/userContext"
import { Button, SHAPE, KIND, SIZE } from "baseui/button";
import Spinner from "../../../components/Buttons/Spinner"
import { PrimaryPane, FormPane, SidePane } from "../../../components/Console"
import PhoneNumber from "./modals/PhoneNumber";
import DisplayName from "./modals/DisplayName";
import Email from "./modals/Email";
import Status from "./modals/Status";
import Role from "./modals/Role";
import Remove from "./modals/Remove";
import SVGIcon from "../../SVGIcon"

import { Skeleton } from 'baseui/skeleton';
import {
    EditDisplayName,
    EditPhoneNumber,
    EditEmail,
    EditStatus,
    EditRole,
    Upload,
    DeleteAccount,
} from "../../../components/Modals"
import { useDispatchModal } from "../../../context/modalContext"
import parsePhoneNumber from "libphonenumber-js"
import { useRouting } from "../../../context/routingContext"
import { useRouter } from "next/router"
import { Caption1, Caption2, Display, Label2, Paragraph1, Paragraph2, Paragraph3 } from "baseui/typography"
import { useStyletron } from "baseui"
import { FileUploader } from "baseui/file-uploader";
import { useDispatchModalBase } from "../../../context/Modal";
//import {Button} from 'baseui/button';
import { DeleteAlt, Delete, Plus } from 'baseui/icon';
import License from "./modals/License";
import { Img } from "react-image";
const Profile = ({ filter = [], noDelete = false }) => {

    const { fireUser, setCustomerID, fireCustomer } = useUser()
    const { modalDispatch, modalState } = useDispatchModal()
    const { setNavLoading } = useRouting()
    const router = useRouter()
    const { modalBaseDispatch } = useDispatchModalBase();

    const [css, theme] = useStyletron();




    useEffect(() => {
        //alert(JSON.stringify())
        setNavLoading(false)
    }, [])

    const openModal = (component) => {
        modalDispatch({
            type: "MODAL_UPDATE",
            payload: {
                modal: {
                    isOpen: true,
                    key: [],
                    component,
                },
            },
        })
    }
    const editDisplayName = () => {
        const component = () => <EditDisplayName />
        openModal(component)
    }
    const editPhoneNumber = () => {
        const component = () => <EditPhoneNumber {...{ fireCustomer }} />
        openModal(component)
    }
    const editEmail = () => {
        const component = () => <EditEmail {...{ fireCustomer }} />
        openModal(component)
    }
    const editStatus = () => {
        const component = () => <EditStatus {...{ fireCustomer }} />
        openModal(component)
    }
    const editRole = () => {
        const component = () => <EditRole {...{ fireCustomer }} />
        openModal(component)
    }
    const editLicense = () => {
        const uploadProps = {
            formKey: "photoURL",
            storage: "License",
            label: "Add License",
            imgType: ["jpeg", "jpg", "png", "gif"],
        }
        const component = () => <Upload {...uploadProps} />
        openModal(component)
    }
    const deleteAccount = () => {
        if (fireCustomer?.data?.uid) {
            const component = () => <DeleteAccount {...{ fireCustomer }} />
            openModal(component)
        }
    }

    let phoneNumber: any = ""
    if (fireCustomer?.data?.phoneNumber) {
        phoneNumber = parsePhoneNumber(fireCustomer?.data?.phoneNumber || "")
    }
    const openModalBase = (component: () => ReactElement, hasSquareBottom: boolean) => {
        modalBaseDispatch({
            type: "MODAL_UPDATE",
            payload: {
                modalBase: {
                    isOpen: true,
                    key: [],
                    component,
                    hasSquareBottom,
                },
            },
        });
    };
    const _displayName = () => {
        const component: () => ReactElement = () => <DisplayName />;
        openModalBase(component, false);
    };

    const _phoneNumber = () => {
        const component: () => ReactElement = () => <PhoneNumber />;
        openModalBase(component, false);
    };

    const _email = () => {
        const component: () => ReactElement = () => <Email />;
        openModalBase(component, false);
    };

    const _status = () => {
        const component: () => ReactElement = () => <Status />;
        openModalBase(component, false);
    };

    const _role = () => {
        const component: () => ReactElement = () => <Role />;
        openModalBase(component, false);
    };

    const _delete = () => {
        const component: () => ReactElement = () => <Remove />;
        openModalBase(component, false);
    };

    const _license = () => {
        const component: () => ReactElement = () => <License />;
        openModalBase(component, false);
    };


    return (
        <>
            {/* OUTLET */}
            <PrimaryPane
                id='settings-collection'
                reverse={false}
                mountToBottom={!noDelete &&
                    <div className='primary-no-card-section'>
                        <div className='no-card-title'><Label2>Account Removal</Label2></div>
                        <div style={{ marginBottom: '12px' }}><Paragraph3 >
                            This action cannot be undone.
                        </Paragraph3></div>

                        <Button
                            onClick={_delete}
                            //style={{backgroundColor:theme.colors.negative300}}
                            kind={KIND.primary}
                            overrides={{
                                BaseButton: {
                                    style: ({ $theme }) => ({
                                        backgroundColor: $theme.colors.negative300,
                                        color: '#fff'
                                    })
                                }
                            }}

                        >Delete</Button>
                    </div>
                }>
                {/* CARD */}
                <FormPane>
                    <div className='user-profile-outlet'>
                        <ul className='list'>
                            {/* LIST DATA */}

                            {/* NAME */}
                            <li className='item-flex'>
                                <div className='box-one'>
                                    <div className='profile-label'><Caption2 >Display Name</Caption2> </div>
                                    <div className='profile-data'>
                                        <Label2>{fireCustomer?.data?.displayName || `No name`}</Label2>
                                    </div>
                                </div>
                                <div >

                                    <Button
                                        //color={theme.colors.accent}
                                        // overrides={{
                                        //     BaseButton: {
                                        //         style: ({ $theme }) => ({
                                        //             backgroundColor: $theme.colors.accent,
                                        //             color: '#fff'
                                        //         })
                                        //     }
                                        // }}
                                        kind={KIND.tertiary}
                                        onClick={_displayName}
                                    ><SVGIcon name='pencilFilled' /></Button>
                                </div>
                            </li>
                            {/* NUMBER */}
                            <li className='item-flex'>
                                <div className='box-one'>
                                    <div className='profile-label'><Caption2 >Phone Number</Caption2></div>
                                    <div className='profile-data'>
                                        {/* {phoneNumber && phoneNumber.formatNational()} */}
                                        <Label2>{phoneNumber && phoneNumber.formatNational()}</Label2>
                                    </div>
                                </div>
                                <div >
                                    <Button
                                        //color={theme.colors.accent}
                                        // overrides={{
                                        //     BaseButton: {
                                        //         style: ({ $theme }) => ({
                                        //             backgroundColor: $theme.colors.accent,
                                        //             color: '#fff'
                                        //         })
                                        //     }
                                        // }}
                                        kind={KIND.minimal}
                                        onClick={_phoneNumber}
                                    ><SVGIcon name='pencilFilled' /></Button>
                                </div>
                            </li>
                            {/* EMAIL */}
                            <li className='item-flex'>
                                <div className='box-one'>
                                    <div className='profile-label'><Caption2 >Email</Caption2></div>
                                    <div className='profile-data'>
                                        {/* {fireCustomer?.data?.email || `No email`} */}
                                        <Label2>{fireCustomer?.data?.email || `No email`}</Label2>
                                    </div>
                                </div>
                                <div >
                                    <Button
                                        //color={theme.colors.accent}
                                        // overrides={{
                                        //     BaseButton: {
                                        //         style: ({ $theme }) => ({
                                        //             backgroundColor: $theme.colors.accent,
                                        //             color: '#fff'
                                        //         })
                                        //     }
                                        // }}
                                        kind={KIND.minimal}
                                        onClick={_email}
                                    ><SVGIcon name='pencilFilled' /></Button>
                                </div>
                            </li>
                            {/* STATUS */}
                            <li className='item-flex'>
                                <div className='box-one'>
                                    <div className='profile-label'><Caption2 >Status</Caption2></div>
                                    <div className='profile-data'>
                                        <Label2>{capitalize(fireCustomer?.data?.status) || `No status`}</Label2>
                                        {/* {capitalize(fireCustomer?.data?.status) || `No status`} */}
                                    </div>
                                </div>
                                <div>
                                    {!filter.includes('status') &&
                                        (<Button
                                            //color={theme.colors.accent}
                                            // overrides={{
                                            //     BaseButton: {
                                            //         style: ({ $theme }) => ({
                                            //             backgroundColor: $theme.colors.accent,
                                            //             color: '#fff'
                                            //         })
                                            //     }
                                            // }}
                                            kind={KIND.minimal}
                                            onClick={_status}
                                        ><SVGIcon name='pencilFilled' /></Button>)}
                                </div>
                            </li>

                            {/* ROLE */}

                            <li className='item-flex'>
                                <div className='box-one'>
                                    <div className='profile-label'><Caption2 >Role</Caption2></div>
                                    <div className='profile-data'>
                                        {/* {capitalize(fireCustomer?.data?.role) || `No role`} */}
                                        <Label2>{capitalize(fireCustomer?.data?.role) || `No role`}</Label2>
                                    </div>
                                </div>
                                <div >
                                    {["manager", "admin", "customer", "driver"].includes(fireUser?.data?.role) &&
                                        !filter.includes('role') && (<Button
                                            //color={theme.colors.accent}
                                            // overrides={{
                                            //     BaseButton: {
                                            //         style: ({ $theme }) => ({
                                            //             backgroundColor: $theme.colors.accent,
                                            //             color: '#fff'
                                            //         })
                                            //     }
                                            // }}
                                            kind={KIND.minimal}
                                            onClick={_role}
                                        ><SVGIcon name='pencilFilled' /></Button>
                                        )}
                                </div>
                            </li>

                        </ul>
                    </div>
                </FormPane>
                {/* SIDE */}
                <SidePane style={{ flex: "0 0 320px" }} title={<div style={{ marginBottom: '8px' }}><Label2>Drivers License</Label2></div>}>
                    {/* <button
            onClick={editLicense}
            className='button-base side-pane-license-edit'>
            Edit
          </button> */}
                    <div className='side-pane-license'>
                        {Boolean(fireCustomer?.data?.photoURL) ? (
                            <>

                                {/* <Button shape={SHAPE.circle} size={SIZE.mini}
                                    overrides={{
                                        BaseButton: {
                                            style: ({ $theme }) => ({
                                                position: 'absolute', top: '-6px', right: '-6px', height:'22px', width:'22px',
                                                //backgroundColor:$theme.colors.accent
                                            })
                                        }
                                    }}>
                                    <Delete size={18} />
                                </Button> */}

                                <Button shape={SHAPE.circle} size={SIZE.compact}
                                    onClick={_license}
                                    overrides={{
                                        BaseButton: {
                                            style: ({ $theme }) => ({
                                                position: 'absolute', bottom: '-4px', right: '-4px',
                                                //backgroundColor:$theme.colors.accent
                                            })
                                        }
                                    }}>
                                    <SVGIcon style={{ transform: 'scale(0.8)' }} name='pencilFilled' />
                                </Button>

                                <Img src={fireCustomer?.data?.photoURL} style={{minHeight:'180px'}}  loader={<Skeleton width={'100%'} height={'180px'} />} />
                                {/* <img style={{minHeight:'180px'}} src={fireCustomer?.data?.photoURL || ``} /> */}
                            </>
                        ) : (
                            <>

                                {/* <Button shape={SHAPE.circle} size={SIZE.mini}
                                    overrides={{
                                        BaseButton: {
                                            style: ({ $theme }) => ({
                                                position: 'absolute', top: '-6px', right: '-6px', height:'22px', width:'22px',
                                                //backgroundColor:$theme.colors.accent
                                            })
                                        }
                                    }}>
                                    <Delete size={18} />
                                </Button> */}


                                <Button shape={SHAPE.circle} size={SIZE.compact}
                                    onClick={_license}
                                    overrides={{
                                        BaseButton: {
                                            style: ({ $theme }) => ({
                                                position: 'absolute', bottom: '-4px', right: '-4px',
                                                //backgroundColor:$theme.colors.accent
                                            })
                                        }
                                    }}>
                                    <SVGIcon style={{ transform: 'scale(0.8)' }} name='pencilFilled' />
                                </Button>


                                <Skeleton
                                    overrides={{
                                        Root: {
                                            style: ({ $theme }) => ({
                                                borderRadius: "10px"
                                            })
                                        }
                                    }} height="260px" width="100%" />
                            </>
                        )}
                    </div>
                    {/* <FileUploader

                        // progressAmount is a number from 0 - 100 which indicates the percent of file transfer completed
                        accept={["image/jpeg", "image/jpg", 'image/png']}
                    // onCancel={()=>{
                    //   taskRef.current.cancel()
                    //   setProgress(0)
                    //   getImgURL()
                    //   setPhotoURL(null)
                    // }}
                    // progressAmount={progress}
                    // progressMessage={
                    //   progress
                    //     ? `Uploading... ${progress}% of 100%`
                    //     : ''
                    // }
                    // onDrop={(acceptedFiles, rejectedFiles) => {
                    //   // handle file upload...
                    //   console.log(acceptedFiles, rejectedFiles)
                    //   if (acceptedFiles.length) {
                    //     handleChange(acceptedFiles)
                    //     uploadImgToFireStorage(acceptedFiles)
                    //   }
                    //   if(rejectedFiles.length){
                    //     setError((oldError)=>({
                    //       ...oldError,
                    //       ...{phoneNumber:'Invalid type'}
                    //     }))
                    //   }


                    // }}
                    // errorMessage={error?.photoURL}
                    /> */}
                </SidePane>
            </PrimaryPane>
        </>
    )
}
export default Profile

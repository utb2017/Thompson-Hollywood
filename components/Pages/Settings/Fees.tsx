import React, { ReactElement } from "react"
//import ServerError from '../../../components/Forms/ServerError'
import { useState, useEffect, useCallback } from "react"
import { capitalize, isCurr } from "../../../helpers"
import { useUser } from "../../../context/userContext"
import { Button, SHAPE, KIND, SIZE } from "baseui/button";
import Spinner from "../../../components/Buttons/Spinner"
import { PrimaryPane, FormPane, SidePane } from "../../../components/Console"
import PhoneNumber from "./modals/PhoneNumber";
import DisplayName from "./modals/DisplayName";
import DeliveryFee from "./modals/DeliveryFee";
import MinOrder from "./modals/MinOrder";
import FeeMinimum from "./modals/FeeMinimum";
import Email from "./modals/Email";
import Status from "./modals/Status";
import ExciseTax from "./modals/ExciseTax";
import LocalTax from "./modals/LocalTax";
import StateTax from "./modals/StateTax";
import Role from "./modals/Role";
import Remove from "./modals/Remove";
import SVGIcon from "../../SVGIcon"
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
} from "../../../firebase/clientApp"

import { Skeleton } from 'baseui/skeleton';
import { useDispatchModal } from "../../../context/modalContext"
import parsePhoneNumber from "libphonenumber-js"
import { useRouting } from "../../../context/routingContext"
import { useRouter } from "next/router"
import { Caption1, Caption2, Display, Label1, Label2, Paragraph1, Paragraph2, Paragraph3 } from "baseui/typography"
import { useStyletron } from "baseui"
import { FileUploader } from "baseui/file-uploader";
import { useDispatchModalBase } from "../../../context/Modal";
//import {Button} from 'baseui/button';
import { DeleteAlt, Delete, Plus } from 'baseui/icon';
import License from "./modals/License";
import { Img } from "react-image";
import { useForm } from "../../../context/formContext";
import Image from 'next/image'
const Fees = () => {

    const { fireUser, setCustomerID, fireCustomer, fireSettings } = useUser()
    const { form, setForm, error, setError, loading, setLoading } = useForm();
    const { modalDispatch, modalState } = useDispatchModal()
    const { setNavLoading } = useRouting()
    const router = useRouter()
    const { modalBaseDispatch } = useDispatchModalBase();

    const [css, theme] = useStyletron();




    useEffect(() => {
        //alert(JSON.stringify())
        setCustomerID(router.query.adminID)
        setNavLoading(false)
        return () => {
            setCustomerID(null)
        };
    }, [router])




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
    const _deliveryFee = () => {
        const component: () => ReactElement = () => <DeliveryFee />;
        openModalBase(component, false);
    };
    const _freeDeliveryMin = () => {
        const component: () => ReactElement = () => <FeeMinimum />;
        openModalBase(component, false);
    };
    const _minOrder = () => {
        const component: () => ReactElement = () => <MinOrder />;
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

    const _exciseTax = () => {
        const component: () => ReactElement = () => <ExciseTax />;
        openModalBase(component, false);
    };
    const _localTax = () => {
        const component: () => ReactElement = () => <LocalTax />;
        openModalBase(component, false);
    };
    const _stateTax = () => {
        const component: () => ReactElement = () => <StateTax />;
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
                //style={{ maxWidth: '768px' }}
                reverse={false}>
                {/* CARD */}
                <FormPane>
                    <div className='user-profile-outlet'>
                        <ul className='list'>
                            {/* LIST DATA */}

                            {/* NAME */}
                            <li className='item-flex'>
                                <div className='box-one'>
                                    <div className='profile-label'><Caption2 >Delivery Fee</Caption2> </div>
                                    <div className='profile-data'>
                                        <Label2>{fireSettings?.data?.deliveryFee? isCurr(fireSettings?.data?.deliveryFee) :`Free delivery`}</Label2>
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
                                        onClick={_deliveryFee}
                                    ><SVGIcon name='pencilFilled' /></Button>
                                </div>
                            </li>
                            {/* NUMBER */}
                            <li className='item-flex'>
                                <div className='box-one'>
                                    <div className='profile-label'><Caption2 >Free Delivery - Minimum</Caption2></div>
                                    <div className='profile-data'>
                                        {/* {phoneNumber && phoneNumber.formatNational()} */}
                                        <Label2>{fireSettings?.data?.freeDeliveryMin ? isCurr(fireSettings?.data?.freeDeliveryMin) : `No Free Delivery`}</Label2>
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
                                        onClick={_freeDeliveryMin}
                                    ><SVGIcon name='pencilFilled' /></Button>
                                </div>
                            </li>
                            {/* OPrder Miniimum */}
                            <li className='item-flex'>
                                <div className='box-one'>
                                    <div className='profile-label'><Caption2 >Order Minimum</Caption2></div>
                                    <div className='profile-data'>
                                        {/* {fireCustomer?.data?.email || `No email`} */}
                                        <Label2>{fireSettings?.data?.minOrder? isCurr(fireSettings?.data?.minOrder) :`No minimum`}</Label2>
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
                                        onClick={_minOrder}
                                    ><SVGIcon name='pencilFilled' /></Button>
                                </div>
                            </li>
                            {/* EXCISE */}
                            <li className='item-flex'>
                                    <div className='box-one'>
                                        <div className='profile-label'> <Caption2 >Excise Tax</Caption2>  </div>
                                        <div className='profile-data'>   <Label2>{fireSettings?.data?.exciseTax? `${fireSettings?.data?.exciseTax*100}%` :`No excise tax`}</Label2>
                                            {/* {capitalize(fireCustomer?.data?.exciseTax) || `No exciseTax`} */}
                                        </div>
                                    </div>
                                <div>
                                    {/* {!filter.includes('exciseTax') &&
                                        ( */}

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
                                        onClick={_exciseTax}
                                    ><SVGIcon name='pencilFilled' /></Button>
                                    {/*                                         
                                        )} */}
                                </div>
                            </li>
                            {/* LOCAL */}
                            <li className='item-flex'>
                                <div className='box-one'>
                                    <div className='profile-label'><Caption2 >Local Tax</Caption2></div>
                                    <div className='profile-data'>   <Label2>{fireSettings?.data?.localTax? `${fireSettings?.data?.localTax*100}%` :`No local tax`}</Label2>
                                        {/* {capitalize(fireCustomer?.data?.exciseTax) || `No exciseTax`} */}
                                    </div>
                                </div>
                                <div>
                                    {/* {!filter.includes('exciseTax') &&
                                        ( */}

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
                                        onClick={_localTax}
                                    ><SVGIcon name='pencilFilled' /></Button>
                                    {/*                                         
                                        )} */}
                                </div>
                            </li>
                            {/* STATE */}
                            <li className='item-flex'>
                                <div className='box-one'>
                                    <div className='profile-label'><Caption2 >State Tax</Caption2></div>
                                    <div className='profile-data'>   <Label2>{fireSettings?.data?.stateTax? `${fireSettings?.data?.stateTax*100}%` :`No State Tax`}</Label2>
                                        {/* {capitalize(fireCustomer?.data?.exciseTax) || `No exciseTax`} */}
                                    </div>
                                </div>
                                <div>
                                    {/* {!filter.includes('exciseTax') &&
                                        ( */}

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
                                        onClick={_stateTax}
                                    ><SVGIcon name='pencilFilled' /></Button>
                                    {/*                                         
                                        )} */}
                                </div>
                            </li>
                        </ul>
                    </div>
                </FormPane>
                {/* SIDE */}
                                
                <SidePane style={{ flex: "0 0 320px" }} title={<div style={{ marginBottom: '8px', display:'flex', width:'100%', justifyContent:'space-between', alignContent:'center'  }}><Label1>Hours</Label1>                                    <Button
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
                                        onClick={_stateTax}
                                    ><SVGIcon style={{transform:'scale(0.9)'}} name='pencilFilled' /></Button></div>}>

          
                    {/* <div className='side-pane-license'>
                        {Boolean(imgURL) ? (
                            <>


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
                                    <SVGIcon style={{transform:'scale(0.9)'}} style={{ transform: 'scale(0.8)' }} name='pencilFilled' />
                                </Button>

                                <Img src={imgURL} style={{minHeight:'180px'}}  loader={<Skeleton width={'100%'} height={'180px'} />} />
                            
                            </>
                        ) : (
                            <>
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
                                    <SVGIcon style={{transform:'scale(0.9)'}} style={{ transform: 'scale(0.8)' }} name='pencilFilled' />
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
             */}
                </SidePane>
         

            </PrimaryPane>
        </>
    )
}
export default Fees

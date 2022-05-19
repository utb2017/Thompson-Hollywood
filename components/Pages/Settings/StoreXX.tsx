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
import Hours from "./modals/Hours";
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
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid';
import { BlockProps } from 'baseui/block';
import { Skeleton } from 'baseui/skeleton';
import { useDispatchModal } from "../../../context/modalContext"
import parsePhoneNumber from "libphonenumber-js"
import { useRouting } from "../../../context/routingContext"
import { useRouter } from "next/router"
import { Caption1, Caption2, Display, Label1, Label2, Label3, Paragraph1, Paragraph2, Paragraph3 } from "baseui/typography"
import { useStyletron } from "baseui"
import { FileUploader } from "baseui/file-uploader";
import { useDispatchModalBase } from "../../../context/Modal";
//import {Button} from 'baseui/button';
import { DeleteAlt, Delete, Plus } from 'baseui/icon';
import License from "./modals/License";
import { Img } from "react-image";
import { useForm } from "../../../context/formContext";
import Image from 'next/image'
const itemProps: BlockProps = {
    backgroundColor: 'mono300',
    // height: 'scale1000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};
const dayCol: BlockProps = {
    //backgroundColor: 'mono300',
    // height: 'scale1000',
    //display: 'flex',
    //alignItems: 'center',
    //flex:0
    //justifyContent: 'center',
};
const dayLabelCol: BlockProps = {
    //backgroundColor: 'mono300',
    // height: 'scale1000',
    //  display: 'flex',
    //alignItems: 'center',
    //flex:5
    //justifyContent: 'center',
};


const Stores = () => {

    const { fireUser, setCustomerID, fireCustomer, fireSettings } = useUser()
    const { form, setForm, error, setError, loading, setLoading } = useForm();
    const { modalDispatch, modalState } = useDispatchModal()
    const { setNavLoading } = useRouting()
    const router = useRouter()
    const { modalBaseDispatch } = useDispatchModalBase();

    const [css, theme] = useStyletron();




    // useEffect(() => {
    //     //alert(JSON.stringify())
    //     setCustomerID(router.query.adminID)
    //     setNavLoading(false)
    //     return () => {
    //         setCustomerID(null)
    //     };
    // }, [router])




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

    const _hours = () => {
        const component: () => ReactElement = () => <Hours />;
        openModalBase(component, true);
    };




    return (
        <>
            {/* OUTLET */}
            {/* <PrimaryPane
                id='settings-collection'
                //style={{ maxWidth: 'unset' }}
                reverse={false}> */}
                      <div
        className={css({
          paddingBottom: theme.sizing.scale200,
          paddingRight: theme.sizing.scale400,
          paddingLeft: theme.sizing.scale400,
          paddingTop: theme.sizing.scale400,
          width: "100%",
          display:'flex',
          flexWrap:'wrap',
          "@media (max-width: 920px)": {
           display:'block'
          },
        })}
      >
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
                                        <Label2>{fireSettings?.data?.deliveryFee ? isCurr(fireSettings?.data?.deliveryFee) : `Free delivery`}</Label2>
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
                                    ><SVGIcon  style={{ transform: 'scale(0.8)' }} name='pencilFilled' /></Button>
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
                                    ><SVGIcon style={{ transform: 'scale(0.8)' }} name='pencilFilled' /></Button>
                                </div>
                            </li>
                            {/* OPrder Miniimum */}
                            <li className='item-flex'>
                                <div className='box-one'>
                                    <div className='profile-label'><Caption2 >Order Minimum</Caption2></div>
                                    <div className='profile-data'>
                                        {/* {fireCustomer?.data?.email || `No email`} */}
                                        <Label2>{fireSettings?.data?.minOrder ? isCurr(fireSettings?.data?.minOrder) : `No minimum`}</Label2>
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
                                    ><SVGIcon style={{ transform: 'scale(0.8)' }} name='pencilFilled' /></Button>
                                </div>
                            </li>
                            {/* EXCISE */}
                            <li className='item-flex'>
                                <div className='box-one'>
                                    <div className='profile-label'> <Caption2 >Excise Tax</Caption2>  </div>
                                    <div className='profile-data'>   <Label2>{fireSettings?.data?.exciseTax ? `${fireSettings?.data?.exciseTax * 100}%` : `No excise tax`}</Label2>
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
                                    ><SVGIcon style={{ transform: 'scale(0.8)' }} name='pencilFilled' /></Button>
                                    {/*                                         
                                        )} */}
                                </div>
                            </li>
                            {/* LOCAL */}
                            <li className='item-flex'>
                                <div className='box-one'>
                                    <div className='profile-label'><Caption2 >Local Tax</Caption2></div>
                                    <div className='profile-data'>   <Label2>{fireSettings?.data?.localTax ? `${fireSettings?.data?.localTax * 100}%` : `No local tax`}</Label2>
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
                                    ><SVGIcon style={{ transform: 'scale(0.8)' }} name='pencilFilled' /></Button>
                                    {/*                                         
                                        )} */}
                                </div>
                            </li>
                            {/* STATE */}
                            <li className='item-flex'>
                                <div className='box-one'>
                                    <div className='profile-label'><Caption2 >State Tax</Caption2></div>
                                    <div className='profile-data'>   <Label2>{fireSettings?.data?.stateTax ? `${fireSettings?.data?.stateTax * 100}%` : `No State Tax`}</Label2>
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
                                    ><SVGIcon style={{ transform: 'scale(0.8)' }} name='pencilFilled' /></Button>
                                    {/*                                         
                                        )} */}
                                </div>
                            </li>
                      

                            {/* Address */}
                            {/* <li className='item-flex'>
                                <div className='box-one'>
                                    <div className='profile-label'><Caption2 > Store Address</Caption2></div>
                                    <div className='profile-data'>   <Label2>{fireSettings?.data?.address ? `${fireSettings?.data?.address}%` : `No address`}</Label2>
                                    </div>
                                </div>
                                <div>
                                    <Button
                                        kind={KIND.minimal}
                                        onClick={_stateTax}
                                    ><SVGIcon style={{ transform: 'scale(0.8)' }} name='pencilFilled' /></Button>
                                </div>
                            </li> */}
                      
                      
                            {/* Phone */}
                            {/* <li className='item-flex'>
                                <div className='box-one'>
                                    <div className='profile-label'><Caption2 >Phone Number</Caption2></div>
                                    <div className='profile-data'>   <Label2>{fireSettings?.data?.address ? `${fireSettings?.data?.address}%` : `No address`}</Label2>
                                    </div>
                                </div>
                                <div>

                                    <Button
                                        kind={KIND.minimal}
                                        onClick={_stateTax}
                                    ><SVGIcon style={{ transform: 'scale(0.8)' }} name='pencilFilled' /></Button>
                                </div>
                            </li> */}
                      
                      
                      
                      
                        </ul>
                    </div>
                </FormPane>
                {/* SIDE */}

                <SidePane
                    style={{ flex: "0 0 320px" }}
                    title={
                        <div style={{ marginBottom: '16px', display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', placeContent: 'center space-between' }}>
                            <Label1>Hours</Label1>
                            <Button kind={KIND.minimal} onClick={_hours}>
                                <SVGIcon style={{ transform: 'scale(0.8)' }} name='pencilFilled' />
                            </Button>
                        </div>}
                >
                    <FlexGrid
                        flexGridColumnCount={2}
                        //flexGridColumnGap="scale200"
                        flexGridRowGap="scale300"
                    >
                        <FlexGridItem {...dayCol}><Label3>Sunday</Label3></FlexGridItem>
                        <FlexGridItem {...dayLabelCol}><Paragraph3>{fireSettings?.data?.sunday ? `${fireSettings?.data?.sunday.open.label}-${fireSettings?.data?.sunday.close.label}`.replace(/\s/g,'') : 'Closed'}</Paragraph3></FlexGridItem>
                        <FlexGridItem {...dayCol}><Label3>Monday</Label3></FlexGridItem>
                        <FlexGridItem {...dayLabelCol}><Paragraph3>{fireSettings?.data?.monday ? `${fireSettings?.data?.monday.open.label}-${fireSettings?.data?.monday.close.label}`.replace(/\s/g,'') : 'Closed'}</Paragraph3></FlexGridItem>
                        <FlexGridItem {...dayCol}><Label3>Tuesday</Label3></FlexGridItem>
                        <FlexGridItem {...dayLabelCol}><Paragraph3>{fireSettings?.data?.tuesday ? `${fireSettings?.data?.tuesday.open.label}-${fireSettings?.data?.tuesday.close.label}`.replace(/\s/g,'') : 'Closed'}</Paragraph3></FlexGridItem>
                        <FlexGridItem {...dayCol}><Label3>Wednesday</Label3></FlexGridItem>
                        <FlexGridItem {...dayLabelCol}><Paragraph3>{fireSettings?.data?.wednesday ? `${fireSettings?.data?.wednesday.open.label}-${fireSettings?.data?.wednesday.close.label}`.replace(/\s/g,'') : 'Closed'}</Paragraph3></FlexGridItem>
                        <FlexGridItem {...dayCol}><Label3>Thursday</Label3></FlexGridItem>
                        <FlexGridItem {...dayLabelCol}><Paragraph3>{fireSettings?.data?.thursday ? `${fireSettings?.data?.thursday.open.label}-${fireSettings?.data?.thursday.close.label}`.replace(/\s/g,'') : 'Closed'}</Paragraph3></FlexGridItem>
                        <FlexGridItem {...dayCol}><Label3>Friday</Label3></FlexGridItem>
                        <FlexGridItem {...dayLabelCol}><Paragraph3>{fireSettings?.data?.friday ? `${fireSettings?.data?.friday.open.label}-${fireSettings?.data?.friday.close.label}`.replace(/\s/g,'') : 'Closed'}</Paragraph3></FlexGridItem>
                        <FlexGridItem {...dayCol}><Label3>Saturday</Label3></FlexGridItem>
                        <FlexGridItem {...dayLabelCol}><Paragraph3>{fireSettings?.data?.saturday ? `${fireSettings?.data?.saturday.open.label}-${fireSettings?.data?.saturday.close.label}`.replace(/\s/g,'') : 'Closed'}</Paragraph3></FlexGridItem>

                    </FlexGrid>
                </SidePane>

                </div>
            {/* </PrimaryPane> */}
        </>
    )
}
export default Stores

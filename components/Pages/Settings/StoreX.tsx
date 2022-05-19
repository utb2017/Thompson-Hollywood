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
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid';
import { BlockProps } from 'baseui/block';
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
import { Card } from "baseui/card";

const itemProps: BlockProps = {
    backgroundColor: 'mono300',
    // height: 'scale1000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const buttonRowProps = {
    Block: {
        style: ({ $theme }) => ({
            flex:0
        }),
    },
};
const Stores = () => {

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
            <FlexGrid
                flexGridColumnCount={[1, 2]}
                //flexGridColumnGap="scale800"
                //flexGridRowGap="scale800"
                //marginBottom="scale800"
                overrides={{
                    Block: {
                        style: ({ $theme }) => ({
                            justifyContent:'space-between'
                        }),
                    },
                }}
            >
                <FlexGridItem
                    overrides={{
                        Block: {
                            style: ({ $theme }) => ({
                                flex:1
                            }),
                        },
                    }}
                >
                    <Card>
                        <FlexGrid
                            flexGridColumnCount={2}
                            flexGridColumnGap="scale800"
                            flexGridRowGap="scale800"
                            marginBottom="scale800"
                        >
                            <FlexGridItem>
                                <Caption2 >Delivery Fee</Caption2>
                                <Label2>{fireSettings?.data?.deliveryFee ? isCurr(fireSettings?.data?.deliveryFee) : `Free delivery`}</Label2>
                            </FlexGridItem>
                            <FlexGridItem overrides={buttonRowProps}>
                                <Button kind={KIND.tertiary} onClick={_deliveryFee} >
                                    <SVGIcon name='pencilFilled' />
                                </Button>
                            </FlexGridItem>
                            <FlexGridItem >
                                <Caption2 >Free Delivery - Minimum</Caption2>
                                <Label2>{fireSettings?.data?.freeDeliveryMin ? isCurr(fireSettings?.data?.freeDeliveryMin) : `No Free Delivery`}</Label2>
                            </FlexGridItem>
                            <FlexGridItem overrides={buttonRowProps}>
                                <Button kind={KIND.tertiary} onClick={_freeDeliveryMin} >
                                    <SVGIcon name='pencilFilled' />
                                </Button>
                            </FlexGridItem>
                            <FlexGridItem>
                                <Caption2 >Order Minimum</Caption2>
                                <Label2>{fireSettings?.data?.minOrder ? isCurr(fireSettings?.data?.minOrder) : `No minimum`}</Label2>
                            </FlexGridItem>
                            <FlexGridItem overrides={buttonRowProps}>
                                <Button kind={KIND.tertiary} onClick={_minOrder} >
                                    <SVGIcon name='pencilFilled' />
                                </Button>
                            </FlexGridItem>
                            <FlexGridItem>
                                <Caption2 >Excise Tax</Caption2>
                                <Label2>{fireSettings?.data?.exciseTax ? `${fireSettings?.data?.exciseTax * 100}%` : `No excise tax`}</Label2>
                            </FlexGridItem>
                            <FlexGridItem overrides={buttonRowProps}>
                                <Button kind={KIND.tertiary} onClick={_exciseTax} >
                                    <SVGIcon name='pencilFilled' />
                                </Button>
                            </FlexGridItem>
                            <FlexGridItem>
                                <Caption2 >Local Tax</Caption2>
                                <Label2>{fireSettings?.data?.localTax ? `${fireSettings?.data?.localTax * 100}%` : `No local tax`}</Label2>
                            </FlexGridItem>
                            <FlexGridItem overrides={buttonRowProps}>
                                <Button kind={KIND.tertiary} onClick={_localTax} >
                                    <SVGIcon name='pencilFilled' />
                                </Button>
                            </FlexGridItem>
                            <FlexGridItem>
                                <Caption2 >State Tax</Caption2>
                                <Label2>{fireSettings?.data?.stateTax ? `${fireSettings?.data?.stateTax * 100}%` : `No State Tax`}</Label2>
                            </FlexGridItem>
                            <FlexGridItem overrides={buttonRowProps}>
                                <Button kind={KIND.tertiary} onClick={_stateTax} >
                                    <SVGIcon name='pencilFilled' />
                                </Button>
                            </FlexGridItem>
                        </FlexGrid>
                    </Card>
                </FlexGridItem>

                <FlexGridItem
                    overrides={{
                        Block: {
                            style: ({ $theme }) => ({
                                flex: '0 0 300px'
                            }),
                        },
                    }}
                >
                    <FlexGrid
                        flexGridColumnCount={2}
                        flexGridColumnGap="scale800"
                    //flexGridRowGap="scale800"
                    >
                        <FlexGridItem {...itemProps}>1</FlexGridItem>
                        <FlexGridItem {...itemProps}>2</FlexGridItem>

                    </FlexGrid>
                </FlexGridItem>

            </FlexGrid>
        </>
    )
}
export default Stores

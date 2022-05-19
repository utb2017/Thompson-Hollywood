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
import { Caption1, Caption2, Display, Label2, Paragraph1, Paragraph2, Paragraph3 } from "baseui/typography"
import { useStyletron } from "baseui"
import { FileUploader } from "baseui/file-uploader";
import { useDispatchModalBase } from "../../../context/Modal";
//import {Button} from 'baseui/button';
import { DeleteAlt, Delete, Plus } from 'baseui/icon';
import License from "./modals/License";
import { Img } from "react-image";
import { useForm } from "../../../context/formContext";
import Image from 'next/image'
const Profile = () => {

    const { fireUser, setCustomerID, fireCustomer } = useUser()
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



    const [imgURL, setImgURL] = useState(null)



    const getImgURL = async () => {
      const filePath = null
      if (fireUser?.data?.uid && fireUser?.data?.photoURL ) {
        const storage = fireUser?.data?.uid && firebase.storage()
        const storageRef = storage && storage.ref()
      //  alert(fireUser?.data?.photoURL)
        const httpsReference = storage.refFromURL(fireUser?.data?.photoURL);  
        let url = null
        // "https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2Fstock-placeholder.png?alt=media&token=57d6b3da-4408-4867-beb7-7957669937dd"
        // if (
        //   typeof filePath === "string" &&
        //   filePath.length > 0 &&
        //   storage
        // ) {
          try {
            url = await httpsReference.getDownloadURL()
         //   alert(url)
          } catch (e) {
          //  alert(e.message)
            console.log(e)
            console.log(e)
          } finally {
            setLoading(false)
          }
        // } else {
        //   setLoading(false)
        // }
        return setImgURL(url)
      }
    }
  
    useEffect(() => {
      getImgURL()
    }, [fireUser?.data])
  
    return (
        <>
            {/* OUTLET */}
            <PrimaryPane
                id='settings-collection'
                style={{marginTop:'38px'}}
                reverse={false}>
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
                                    {/* {!filter.includes('status') &&
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
                                            onClick={_status}
                                        ><SVGIcon name='pencilFilled' /></Button>
{/*                                         
                                        )} */}
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
                                    {/* {["manager", "admin", "customer", "driver"].includes(fireUser?.data?.role) &&
                                        !filter.includes('role') && ( */}
                                        
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
                                            onClick={_role}
                                        ><SVGIcon name='pencilFilled' /></Button>

{/* 
                                     )} */}
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
                        {Boolean(imgURL) ? (
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

                                <Img src={imgURL} style={{minHeight:'180px'}}  loader={<Skeleton width={'100%'} height={'180px'} />} />
                                {/* <Image src={imgURL|| "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='115.2' height='68.6' viewBox='0 0 115.2 68.6'%3E%3Cimage width='480' height='286' transform='scale(0.24)' xlink:href='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAeAAAAEeCAIAAADdLlGrAAAACXBIWXMAAC4jAAAuIwF4pT92AAAF8mlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4wLWMwMDAgNzkuMTM1N2M5ZSwgMjAyMS8wNy8xNC0wMDozOTo1NiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIyLjUgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyMS0wOS0xM1QyMzoxMDowMy0wNzowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjEtMDktMTNUMjM6MTQ6MTEtMDc6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjEtMDktMTNUMjM6MTQ6MTEtMDc6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MWFiMGRhNWUtZWEwOS1jNTQyLWI4Y2UtMDQxNWY4Nzk0NDJiIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6YzI1ZWZhY2UtMWJkMy03ZDQ2LTk2MWQtYmZlNWZkMzczYWNlIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6MWE0M2FmNDEtOWU1Yy0zYTQxLTkyNmMtYWJiZWI5NmUzOGM3Ij4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDoxYTQzYWY0MS05ZTVjLTNhNDEtOTI2Yy1hYmJlYjk2ZTM4YzciIHN0RXZ0OndoZW49IjIwMjEtMDktMTNUMjM6MTA6MDMtMDc6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMi41IChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MWFiMGRhNWUtZWEwOS1jNTQyLWI4Y2UtMDQxNWY4Nzk0NDJiIiBzdEV2dDp3aGVuPSIyMDIxLTA5LTEzVDIzOjE0OjExLTA3OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjIuNSAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+bTL0NAAAFEBJREFUeJzt3X1MVfUfwPHzcLl4oZIwCbOiqRU+JtkyM0KlK2itdFmmaYl/mNbKVXPlmn+0tWrZWrVVlstEzCXrQVuZ5VPqfJxaYWChaYSkJEagQHDPuef3x3ee3YGCv/v4ob1ffzRDHo7s+ubr93y/36M7jqMBAOQxEn0BAIDzI9AAIBSBBgChCDQACEWgAUAoAg0AQhFoABCKQAOAUAQaAIQi0AAgFIEGAKEINAAIRaABQCgCDQBCEWgAEIpAA4BQBBoAhCLQACAUgQYAoQg0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hUZDFG4SIubU3bbhw4dv3bp16tSps2bNWrhw4bhx466++uq///5769atlZWVaWlpn3/++eTJkyPc593JzMb/dbWq0VOnTi0tLdU0jXUdSAgCjXhwG/3DDz8UFxcvWbLkk08+UVurr7vuukWLFj3xxBNXXnllLOp8kWPnjldLo5FwBBpxourm8/nmzZs3b968xsbGpqam5OTkyy+/XNf1yM+Djnzs3PFqaTQSi0AjftQMr3p+ymWXXXbZZZdpmqbeouajw/7M0a2ze7U0GonFiwxxpW4PqlIHg0H3GSuRLNuI1sxGR53cM4zFcU5AOwQaiaFOYY58HHqhsbM6tS5yF2q0FvLcWyBGCDS6sXZ1/uijj6I1dg7F2jskCoFGd9VxN8qsWbOiOHYO1bHRDz/8MI1GrBFodEuR7EYJT7tGc14H4oBAo/tRdT5x4kS7u4KxGDuHchv9ySefMNeBOCDQ6GbOe85GHOqsqEYnJSUxH404INDoTi60oi4+dVaYj0bcEGgknrsmOhgMdrK+ONYr6i4e89GIDwKNRLJtWx39bJyj9oBYltWu1LHbjRIe1t4hDtjqjcRQo2a1vbu1tbWmpubMmTNJSUmZmZnp6ekejyf0dI7wzneOtQvtBedps4gWRtBIADWVYZrmnj17ZsyY0adPn/79++fk5AwePDgjI+O222774IMPWlpaTNNUQ+w4r6i7eOwzREwxgka8qZOGGhsbn3zyyRUrVmiaNnTo0KlTp/bu3fvMmTM//PDD7t27H3vssddee23p0qVjx47VNO3EiROFhYVyxs6hOo6jLcv67LPPIjn7CVAINOJKDYdPnz49ceLEvXv33n///S+99FJ2drbjOGr2Wdf12trat956a/HixePGjVu1atXEiRPz8/MPHTokauwcql2jP//88yeeeCI5OVnTNM5UQiQINOLHrXNBQcH+/fvffffdefPmOY6jppvV+xiG0bt375dffnnChAn33XffnDlzMjIyjh49+uGHH0obO4cKbfSUKVPefffd1NRUn8/n/rmAMDAHjThx61xYWLh///6SkpJ58+YFAgH3xFFFnW8XCARyc3M3bNiQmpp69OjR5557bvbs2a2trTLrrLjz0Z9++umkSZOampriv/4P/zEEGvGg6lxbWzt+/Ph9+/aVlJTMmDFDLWHuOFdrGEZSUpJlWSNGjFi3bl16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'/%3E%3C/svg%3E"} layout={'fill'}/> */}
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

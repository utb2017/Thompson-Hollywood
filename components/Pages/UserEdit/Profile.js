import React from "react"
//import ServerError from '../../../components/Forms/ServerError'
import { useState, useEffect, useCallback } from "react"
import { capitalize } from "../../../helpers"
import { useUser } from "../../../context/userContext"
import { Button, SHAPE, KIND } from "baseui/button";
import Spinner from "../../../components/Buttons/Spinner"
import { PrimaryPane, FormPane, SidePane } from "../../../components/Console"
import SVGIcon from "../../SVGIcon"
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
import { Caption1, Caption2, Label2, Paragraph1, Paragraph2, Paragraph3 } from "baseui/typography"
import { useStyletron } from "baseui"
import { FileUploader } from "baseui/file-uploader";

const Profile = ({ filter=[], noDelete=false }) => {

  const { fireUser, setCustomerID, fireCustomer } = useUser()
  const { modalDispatch, modalState } = useDispatchModal()
  const { setNavLoading } = useRouting()
  const router = useRouter()
  
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
    } else {
      NotificationManager.error("An error has occurred")
    }
  }

  let phoneNumber = ""
  if (fireCustomer?.data?.phoneNumber) {
    phoneNumber = parsePhoneNumber(fireCustomer?.data?.phoneNumber || "")
  }

  return  (
    <>
      {/* OUTLET */}
      <PrimaryPane
        id='settings-collection'
        reverse={false}
        mountToBottom={!noDelete &&
          <div className='primary-no-card-section'>
            <div className='no-card-title'><Label2>Account Removal</Label2></div>
            <Paragraph3 style={{marginBottom:'12px'}}>
              You can disable the account above. This action cannot be undone.
            </Paragraph3>
            <Button
              onClick={deleteAccount}
              style={{backgroundColor:theme.colors.negative300}} 
              kind={KIND.primary}
              text={"Delete Account"}

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
                  <div className='profile-label'><Label2 style={{color:theme.colors.accent}}>Display Name</Label2> </div>
                  <div className='profile-data'>
                    <Paragraph2>{fireCustomer?.data?.displayName}</Paragraph2> 
                  </div>
                </div>
                <div >
                  
                  <Button
                  //color={theme.colors.accent}
                  style={{backgroundColor:theme.colors.accent}} 
                  kind={KIND.primary} 
                    onClick={editDisplayName}
                  >Edit</Button>
                </div>
              </li>
              {/* NUMBER */}
              <li className='item-flex'>
                <div className='box-one'>
                  <div className='profile-label'><Label2 style={{color:theme.colors.accent}}>Phone Number</Label2></div>
                  <div className='profile-data'>
                    {/* {phoneNumber && phoneNumber.formatNational()} */}
                    <Paragraph2>{phoneNumber && phoneNumber.formatNational()}</Paragraph2> 
                  </div>
                </div>
                <div >
                  <Button
                  style={{backgroundColor:theme.colors.accent}} 
                  kind={KIND.primary} 
                    onClick={editPhoneNumber}
                  >Edit</Button>
                </div>
              </li>
              {/* EMAIL */}
              <li className='item-flex'>
                <div className='box-one'>
                  <div className='profile-label'><Label2 style={{color:theme.colors.accent}}>Email</Label2></div>
                  <div className='profile-data'>
                    {/* {fireCustomer?.data?.email || `No email`} */}                
                    <Paragraph2>{fireCustomer?.data?.email || `No email`}</Paragraph2> 
                  </div>
                </div>
                <div >
                  <Button
                    //text={fireCustomer?.data?.email ? "Edit" : "Add"}
                  style={{backgroundColor:theme.colors.accent}} 
                  kind={KIND.primary} 

                    onClick={editEmail}
                  >
                    {fireCustomer?.data?.email ? "Edit" : "Add"}
                  </Button>
                </div>
              </li>
              {/* STATUS */}
              <li className='item-flex'>
                <div className='box-one'>
                  <div className='profile-label'><Label2 style={{color:theme.colors.accent}}>Status</Label2></div>
                  <div className='profile-data'>
                    <Paragraph2>{capitalize(fireCustomer?.data?.status) || `No status`}</Paragraph2> 
                    {/* {capitalize(fireCustomer?.data?.status) || `No status`} */}
                  </div>
                </div>
                <div>
                {!filter.includes('status') &&
               (<Button  
                style={{backgroundColor:theme.colors.accent}} 
                kind={KIND.primary}  onClick={editStatus} >{
                 'Edit'
               }</Button>)}
                </div>
              </li>
             
              {/* ROLE */}

                <li className='item-flex'>
                  <div className='box-one'>
                    <div className='profile-label'><Label2 style={{color:theme.colors.accent}}>Role</Label2></div>
                    <div className='profile-data'>
                      {/* {capitalize(fireCustomer?.data?.role) || `No role`} */}
                      <Paragraph2>{capitalize(fireCustomer?.data?.role) || `No role`}</Paragraph2> 
                    </div>
                  </div>
                  <div >
                  {["manager", "admin", "customer", "driver"].includes(fireUser?.data?.role) && 
                      !filter.includes('role') && ( <Button 
                        style={{backgroundColor:theme.colors.accent}} 
                        kind={KIND.primary}   onClick={editRole} >Edit</Button>
                      )}
                  </div>
                </li>

            </ul>
          </div>
        </FormPane>
        {/* SIDE */}
        <SidePane style={{ flex: "0 0 320px" }} title={<Label2 style={{color:theme.colors.accent, marginBottom:'8px'}}>Drivers License</Label2>}>
          {/* <button
            onClick={editLicense}
            className='button-base side-pane-license-edit'>
            Edit
          </button> */}
          <div className='side-pane-license'>
            {Boolean(fireCustomer?.data?.photoURL) ? (
              <img src={fireCustomer?.data?.photoURL || ``} />
            ) : (
              <div>
                <SVGIcon
                  color={"rgba(0,0,0,0.2)"}
                  style={{ transform: "scale(2)" }}
                  name='photo'
                />
              </div>
            )}
          </div>
          <FileUploader

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
            />
        </SidePane>
      </PrimaryPane>
    </>
  )
}
export default Profile

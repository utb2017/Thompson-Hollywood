import React from 'react';
import ServerError from '../../components/Forms/ServerError'
import {useState, useEffect, useCallback} from 'react'
import TextField from '../../components/Forms/TextField'
import {capitalize} from '../../helpers'
import {useUser} from '../../context/userContext'
import {useMenuSettings} from '../../context/menuSettingsContext'
import Button from '../../components/Buttons/Button'
import Spinner from '../../components/Buttons/Spinner'
import {PrimaryPane, FormPane, SidePane, SortableItem} from '../../components/Console'
import SVGIcon from '../SVGIcon';
import { EditDisplayName, EditPhoneNumber, EditEmail, EditStatus, EditRole, Upload, DeleteAccount } from '../../components/Modals'
import {useDispatchModal} from '../../context/modalContext'
import parsePhoneNumber, { AsYouType, formatIncompletePhoneNumber } from 'libphonenumber-js'
import { scaleToZoom } from '@math.gl/web-mercator';
import { updateFirestore } from '../../firebase/clientApp';
import {useRouting} from '../../context/routingContext'


const Profile = ({fireCustomer}) => {
    console.log('fireCustomer')
    console.log(fireCustomer)
    const {fireSettings, fireUser } = useUser()
    const { modalDispatch, modalState } = useDispatchModal()
    const { setNavLoading } = useRouting()


    useEffect(() => {
      setNavLoading(false)
    }, [])

    const openModal = (component) => {
        modalDispatch({
          type: 'MODAL_UPDATE',
          payload: {
            modal: {
              isOpen: true,
              key: [],
              component,
            },
          },
        })
      }
      const closeModal = () => {
        modalDispatch({
          type: "MODAL_UPDATE",
          payload: {
            modal: {
              isOpen: false,
              key: [],
              component: null,
            },
          },
        })
      }
      const editDisplayName = () => {
        const component = () => <EditDisplayName {...{fireCustomer}}  />
        openModal(component)
      }
      const editPhoneNumber = () => {
        const component = () => <EditPhoneNumber {...{fireCustomer}} />
        openModal(component)
      }
      const editEmail = () => {
        const component = () => <EditEmail {...{fireCustomer}} />
        openModal(component)
      }
      const editStatus = () => {
        const component = () => <EditStatus {...{fireCustomer}} />
        openModal(component)
      }
      const editRole = () => {
        const component = () => <EditRole {...{fireCustomer}} />
        openModal(component)
      }
      const editLicense = () => {
        const uploadProps = {
          formKey: 'photoURL',
          storage: 'License',
          label: 'Add License',
          imgType: ['jpeg', 'jpg', 'png', 'gif'],
        }
        const component = () => <Upload {...uploadProps} />
        openModal(component)
      }
  
      const deleteAccount = () => {
        if(fireCustomer?.data?.uid){
          const component = () => < DeleteAccount {...{fireCustomer}}  />
          openModal(component)
        }else{
          NotificationManager.error('An error has occurred')
        }
  
      }


    let phoneNumber = ''
    if(fireCustomer?.data?.phoneNumber){
      phoneNumber = parsePhoneNumber(fireCustomer?.data?.phoneNumber||'')
    }
    

    return (fireCustomer.status === "success" && Boolean(fireCustomer?.data?.uid)) ? (
        <>
        {/* OUTLET */}
        <PrimaryPane id='settings-collection' reverse={false} mountToBottom={
          <div className='primary-no-card-section'>
            <div className='no-card-title' >Account Removal</div>
            <p className='no-card-paragraph' >You can disable the account above. This action cannot be undone.</p>
            <Button onClick={deleteAccount} variant='delete' text={'Delete Account'}/>
          </div>
        }>
          {/* CARD */}
          <FormPane>
              <div className='user-profile-outlet'>
              <ul className='list'>
                  {/* LIST DATA */}
                   
                    <li className='item-flex'>
                        <div className='box-one' >
                            <div className='profile-label'>Display Name</div>
                            <div className='profile-data'>{fireCustomer?.data?.displayName}</div> 
                        </div>
                        <div className='box-two' >
                            <Button          
                              text='Edit'
                              fullWidth={true}
                              onClick={editDisplayName}
                            />
                        </div>
                    </li>
                   <li className='item-flex'>
                       <div className='box-one' >
                           <div className='profile-label'>Phone Number</div>
                           <div className='profile-data'>{phoneNumber.formatNational()}</div> 
                       </div>
                       <div className='box-two' >
                           <Button          
                             text='Edit'
                             fullWidth={true}
                             onClick={editPhoneNumber}
                           />
                       </div>
                   </li>
                   <li className='item-flex'>
                       <div className='box-one' >
                           <div className='profile-label'>Email</div>
                           <div className='profile-data'>{fireCustomer?.data?.email||`No email`}</div> 
                       </div>
                       <div className='box-two' >
                           <Button          
                             text={fireCustomer?.data?.email?'Edit':'Add'}
                             fullWidth={true}
                             onClick={editEmail}
                           />
                       </div>
                   </li>
                   <li className='item-flex'>
                       <div className='box-one' >
                           <div className='profile-label'>Status</div>
                           <div className='profile-data'>{capitalize(fireCustomer?.data?.status)||`No status`}</div> 
                       </div>
                       <div className='box-two' >
                           <Button          
                             text='Edit'
                             fullWidth={true}
                             onClick={editStatus}
                           />
                       </div>
                   </li>
                   {['manager','admin', 'customer','driver'].includes(fireUser?.data?.role) && <li className='item-flex'>
                       <div className='box-one' >
                           <div className='profile-label'>Role</div>
                           <div className='profile-data'>{capitalize(fireCustomer?.data?.role)||`No role`}</div> 
                       </div>
                       <div className='box-two' >
                           <Button          
                             text='Edit'
                             fullWidth={true}
                             onClick={editRole}
                           />
                       </div>
                   </li>}



              </ul>
              </div>

          </FormPane>
          {/* SIDE */}
          <SidePane style={{flex:'0 0 320px'}} title='Drivers Licence'>
              <button onClick={editLicense} className='button-base side-pane-license-edit'>Edit</button>
              <div className='side-pane-license'>
                {Boolean(fireCustomer?.data?.photoURL)?<img src={fireCustomer?.data?.photoURL||``} />:
                 (<div><SVGIcon color={"rgba(0,0,0,0.2)"} style={{transform: 'scale(2)'}} name='photo'/></div>)}
              </div>
  
          </SidePane>
        </PrimaryPane>
      </>
    ):(<div className='nav-loader'><Spinner /></div>);
}

export default Profile;


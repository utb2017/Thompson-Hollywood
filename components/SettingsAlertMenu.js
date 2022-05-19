import React, {useEffect, useState, useRef, useCallback} from 'react'
import {useRouter} from 'next/router'
import Link from 'next/link'
import SVGIcon from '../components/SVGIcon'
import useOnClickOutside from '../hooks/useOnClickOutside'
import firebase, {updateFirestore} from '../firebase/clientApp'
import {useUser} from '../context/userContext'
import Spinner from '../components/Buttons/Spinner'

import {NotificationManager} from 'react-notifications';
import Switch from '../components/Buttons/Switch'
import { Caption1, Caption2, H3, H6, Label2, Label3, Paragraph1, Paragraph2, Paragraph4 } from 'baseui/typography'

import { styled } from "baseui";
import { Button, KIND } from 'baseui/button'
const Background = styled("ul", ({ $theme }) => {
  return {
    backgroundColor:$theme.colors.background
}});
function SettingsAlertMenu({color, address, progress, as, href, scroll}) {
  const router = useRouter()
  const {asPath, pathname, query} = router

  const {fireSettings} = useUser()


  return (
    <>
      {/* <Link
        href={`${pathname.split('?')[0]}`}
        as={`${asPath.split('?')[0]}`}
        scroll={false}> */}
        <button
        onClick={()=>router.back()}
          className={`button-base side-menu-backdrop${('alert' in query)?` is-visible`:''}`}
        />
      {/* </Link> */}
      <Background 
      className={`side-menu right flex-direction-column${('alert' in query)?` is-visible`:''}`}>
        <li className='side-menu-header-bar'>
          {/* <Link  as={as} href={href} scroll={scroll}> */}
          {/* <Link
            href={`${pathname.split('?')[0]}`}
            as={`${asPath.split('?')[0]}`}
            scroll={false}> */}
            <Button 
            onClick={()=>router.back()} 
            kind={KIND.minimal}
            className='navigation-bar-button right button-base back'>
              <span className={'svg-wrapper'}>
                <SVGIcon name='x' />
              </span>
            </Button>
          {/* </Link> */}
          <H3>Quick Links</H3>
        </li>
        


        
{ fireSettings.status === 'success'?     
 (<> <li className='side-menu-item flex'>
          <WaitTime />
        </li>
        <li className='side-menu-item side-menu-item-no-border flex'>
          <OpenClose />
        </li>
        <li className='side-menu-item side-menu-item-no-border flex'>
          <PendingUsers />
        </li>
        <li className='side-menu-item side-menu-item-no-border flex'>
          <PendingOrders />
        </li>
        {/* <li className='side-menu-item side-menu-item-no-border flex'>
          <DriverMode />
        </li> */}
        
        </>):(<Spinner />)
        }
     
     
     
      </Background>
    </>
  )
}

export default SettingsAlertMenu

const WaitTime = () => {
  const [quickAdd, setQuickAdd] = useState(false)

  const [qty, setQty] = useState(1)

  const ref = useRef()

  useOnClickOutside(
    ref,
    useCallback(() => setQuickAdd(false))
  )




  const [loading, setLoading] = useState(false)


  const {fireSettings} = useUser()



  const updateWaitTime = async (inc) => {
    const increment = firebase.firestore.FieldValue.increment(inc);
    setLoading(true)
    try {
      await updateFirestore('admin', 'store', {waitTime:increment})
      if(inc === 1){
        NotificationManager.warning("Wait time increased by 1 hour.");
      }else{
        NotificationManager.info("Wait time reduced by 1 hour.");
      }
    } catch (e) {
      NotificationManager.error(e.message);
    } finally {
      return setLoading(false)
    }
  }



  return (
    <div
      aria-label='product'
      role='group'
      data-radium='true'
      style={{
        display: 'flex',
        position: 'relative',
        padding: '0px 0px',
        alignItems: 'center',
        width: '100%',
      }}>
      <SVGIcon style={{marginRight: 12}} name='clock' color={'#1a73e8'} />
      {quickAdd && (
        <>
          <div
            data-radium='true'
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              zIndex: 5,
              backgroundColor: 'white',
              opacity: '0.7',
            }}
          />

          <div
            ref={ref}
            data-radium='true'
            style={{
              position: 'absolute',
              top: '-5px',
              left: '45px',
              display: 'flex',
              zIndex: 150,
              borderRadius: 4,
              backgroundColor: 'rgb(255, 255, 255)',
              boxShadow: 'rgb(117, 117, 117) 0px 0px 10px',
              flexDirection: 'column',
            }}>
            <div data-radium='true' style={{display: 'flex'}}>
              <button
                disabled={!Boolean(fireSettings?.data?.waitTime )|| fireSettings?.data?.waitTime <= 1}
                id={'decrement'}
                onClick={()=>updateWaitTime(-1)}
                aria-label='Decrement quantity of Food Should Taste Good Tortilla Chips, Blue Corn in cart'
                tabIndex={0}
                data-radium='true'
                style={{
                  width: 45,
                  height: 45,
                  padding: 0,
                  border: 0,
                  color: !Boolean(fireSettings?.data?.waitTime)|| fireSettings?.data?.waitTime <= 1?'#e0e0e0':'#1a73e8',
                  backgroundColor: 'rgb(255, 255, 255)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '4px 0px 0px 4px',
                  alignSelf: 'flex-start',
                }}>
                <svg
                  width='24px'
                  height='24px'
                  viewBox='0 0 24 24'
                  aria-hidden='true'
                  fill='currentColor'>
                  <path d='M5.007 11C4.45 11 4 11.448 4 12c0 .556.451 1 1.007 1h13.986C19.55 13 20 12.552 20 12c0-.556-.451-1-1.007-1H5.007z' />
                </svg>
              </button>
              <span
                aria-label={`Current quantity of ${fireSettings?.data?.waitTime||''} in cart`}
                aria-live='polite'
                aria-atomic='true'
                data-radium='true'
                style={{
                  height: 45,
                  width: 54,
                  fontSize: 17,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: 'rgb(117, 117, 117)',
                }}>
                {!fireSettings?.data?.waitTime||loading?<Spinner/>:fireSettings?.data?.waitTime}
              </span>

              
              <button
                //onClick={() => increaseCart()}
                disabled={!Boolean(fireSettings?.data?.waitTime )|| fireSettings?.data?.waitTime >= 4}
                id='increment'
                onClick={()=>updateWaitTime(1)}
                aria-label='Increment quantity of Food Should Taste Good Tortilla Chips, Blue Corn in cart'
                tabIndex={0}
                data-radium='true'
                style={{
                  width: 45,
                  height: 45,
                  padding: 0,
                  border: 0,
                  color: !Boolean(fireSettings?.data?.waitTime )|| fireSettings?.data?.waitTime >= 4?'#e0e0e0':'#1a73e8',
                  backgroundColor: 'rgb(255, 255, 255)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '0px 4px 4px 0px',
                  alignSelf: 'flex-end',
                }}>
                <svg
                  width='24px'
                  height='24px'
                  viewBox='0 0 24 24'
                  aria-hidden='true'
                  fill='currentColor'>
                  <path d='M13 5.007C13 4.45 12.552 4 12 4c-.556 0-1 .451-1 1.007V11H5.007C4.45 11 4 11.448 4 12c0 .556.451 1 1.007 1H11v5.993c0 .557.448 1.007 1 1.007.556 0 1-.451 1-1.007V13h5.993C19.55 13 20 12.552 20 12c0-.556-.451-1-1.007-1H13V5.007z' />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
      {/* <span className='wait-label'> Wait Time</span> */}
      <div
        className='rmq-ec61a5f1'
        data-radium='true'
        style={{width: '25%', textAlign: 'center'}}>
        <button
          onClick={(e) => (e.stopPropagation(), setQuickAdd(true))}
          aria-label='Quantity: 2. Change quantity'
          aria-live='polite'
          aria-atomic='true'
          className='rmq-1687e5cd'
          data-radium='true'
          style={{
            position: 'relative',
            cursor: 'pointer',
            height: '34px',
            width: '46px',
            border: '1px solid rgb(224, 224, 224)',
            margin: '0px auto',
            padding: '0px',
            lineHeight: '34px',
            borderRadius: '4px',
            fontSize: '16px',
            color: 'rgb(117, 117, 117)',
            fontWeight: 600,
            zIndex: 100,
            backgroundColor: 'transparent',
            textAlign: 'center',
          }}>
          {fireSettings?.data?.waitTime||''}
        </button>
      </div>
      <span className='hour-label'><Paragraph2>{`  hour wait time.`}</Paragraph2></span>
    </div>
  )
}

const OpenClose = () => {


  const [loading, setLoading] = useState(false)


  const {fireSettings} = useUser()



  const onChange = async (event, props) => {
    event.stopPropagation()
    setLoading(true)
    try {
      await updateFirestore('admin', 'store', {isOpen:!fireSettings?.data?.isOpen})
      if(!fireSettings?.data?.isOpen){
        NotificationManager.info('Store is now open.');
      }else{
        NotificationManager.warning('Store has been closed.');
      }
    } catch (e) {
      NotificationManager.error(e.message);
    } finally {
      return setLoading(false)
    }
  }
  return (
    <div
      aria-label='product'
      role='group'
      data-radium='true'
      style={{
        display: 'flex',
        position: 'relative',
        padding: '0px 0px',
        width: '100%',
      }}>
      <SVGIcon
        style={{marginRight: 12, width: '62px'}}
        name='store'
        color={'#1a73e8'}
      />
      <div className='wait-label'><Paragraph2>Close/Open</Paragraph2></div>
      {!loading?<Switch
        style={{button: {marginLeft: '34px'}}}
        onChange={onChange}
        id='isOpen'
        isSelected={Boolean(fireSettings?.data?.isOpen)}
      />:<div style={{width: '34px',display:'flex'}}><Spinner  /></div>}
    </div>
  )
}

const PendingUsers = () => {
  
  const {user} = useUser()

  return (
    <Link href={"/[adminID]/users/[users]"} as={`/${user?.uid}/users/pending`} scroll={false}>
    <div
      aria-label='product'
      role='group'
      data-radium='true'
      style={{
        display: 'flex',
        position: 'relative',
        padding: '0px 0px',
        width: '100%',
      }}>
      <SVGIcon
        style={{marginRight: 12, width: '62px'}}
        name='personAdd'
        color={'#1a73e8'}
      />
      <div className='wait-label'><Paragraph2>{`${0} pending users`}</Paragraph2></div>
      <SVGIcon
          style={{button: {marginLeft: '34px'}}}
          name='arrowRightSmall'
          color={'#476282'}
        />
    </div>
    </Link>
  )
}

const PendingOrders = () => {
  const {user} = useUser()
    return (
      <Link href={"/[adminID]/orders/active"} as={`/${user?.uid}/orders/active`} scroll={false}>
      <div
        aria-label='product'
        role='group'
        data-radium='true'
        style={{
          display: 'flex',
          position: 'relative',
          padding: '0px 0px',
          width: '100%',
        }}>
        <SVGIcon
          style={{marginRight: 12, width: '62px'}}
          name='orderIssue'
          color={'#1a73e8'}
        />
        <div className='wait-label'><Paragraph2>{`${0} pending orders`}</Paragraph2></div>
        <SVGIcon
          style={{button: {marginLeft: '34px'}}}
          name='arrowRightSmall'
          color={'#476282'}
        />
      </div>
      </Link>
    )
  }
  const DriverMode = () => {


    const [loading, setLoading] = useState(false)
  
  
    const {fireUser, user} = useUser()
  
  
  
    const onChange = async (event, props) => {
      event.stopPropagation()
      setLoading(true)
      try {
        
        if(fireUser?.data?.role !== 'driver'){
          await updateFirestore('users', user?.uid, {role:'driver'})
          NotificationManager.info('Driver Mode Enabled');
        }else{
          NotificationManager.warning('Driver Mode Disabled.');
          await updateFirestore('users', user?.uid, {role:'manager'})
        }
        
      } catch (e) {
        NotificationManager.error(e.message);
      } finally {
        setLoading(false)
      }
    }

    
    return (
      <div
        aria-label='product'
        role='group'
        data-radium='true'
        style={{
          display: 'flex',
          position: 'relative',
          padding: '0px 0px',
          width: '100%',
        }}>
        <SVGIcon
          style={{marginRight: 12, width: '62px'}}
          name='car'
          color={'#1a73e8'}
        />
        <div className='wait-label'>Driver Mode</div>
        {(!loading && user?.uid)?<Switch
          style={{button: {marginLeft: '34px'}}}
          onChange={onChange}
          id='isOpen'
          isSelected={Boolean(fireUser?.data?.role==='driver')}
        />:<div style={{width: '34px',display:'flex'}}><Spinner  /></div>}
      </div>
    )
  }
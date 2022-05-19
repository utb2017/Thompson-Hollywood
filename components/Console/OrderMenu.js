import React, {useRef, useCallback, useEffect } from 'react'
import {useRouter} from 'next/router'
import Link from 'next/link'
import SVGIcon from '../../components/SVGIcon'
import firebase, {updateFirestore, updateFirestoreGroup} from '../../firebase/clientApp'
import PROGRESS from '../../helpers/PROGRESS'
import {defaultTheme} from '../../styles/themer/utils'
import {useDispatchModal} from '../../context/modalContext'
import {RefundModal, ProgressModal} from '../../components/Modals'
import Spinner from '../Buttons/Spinner'
import {useRouting} from '../../context/routingContext'
import {NotificationManager} from 'react-notifications';

function OrderMenu({fireOrder, fireCustomer, fireUser}) {
  const router = useRouter()
  const {asPath, pathname, query} = router
  const { modalDispatch, modalState } = useDispatchModal()
  const {setNavLoading} = useRouting()


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
  const handleRefund = () => {
    
    const component = () => <RefundModal {...{fireOrder}} />
    openModal(component)
  }
  const handleQuit = useCallback(async () => {
    setNavLoading(true)
    try{
      await updateFirestoreGroup("users", router.query.uid, "Orders", router.query.oid, {
      progress: 'cancel',
    })  
    NotificationManager.warning('Order Canceled.')  
    }catch(e){
      NotificationManager.error('An error occured.')
    }finally{  
      setNavLoading(false)
      }

  }, [router])
  const handleReset = useCallback(async () => {
    setNavLoading(true)
    try{
      const FieldValue = firebase.firestore.FieldValue
      await updateFirestoreGroup("users", router.query.uid, "Orders", router.query.oid, {
        progress: 'received',
        driver:false,
        driverName:false,
      })
      NotificationManager.warning('Order Reset.')  
    }catch(e){
      NotificationManager.error('An error occured.')
    }finally{  
    setNavLoading(false)
    }
  }, [router])

// useEffect(() => {
//   if('more' in query){
//      router.push(asPath.split('?')[0]) 
//   }
// }, []);

  const handleProgress = () => {
    const component = () => <ProgressModal {...{fireOrder}} />
    openModal(component)
  }

  const progress = fireOrder?.data?.progress
  const refundActive = fireOrder?.data?.refundActive
  const {action, disabled} = defaultTheme.colors
  const resetDisabled = !progress || PROGRESS[0] === progress || PROGRESS[7] === progress || Boolean(refundActive) || !Boolean(fireCustomer?.data)
  const quitDisabled = !progress || [PROGRESS[6], PROGRESS[7], PROGRESS[8]].includes(progress) || !Boolean(fireCustomer?.data)
  const refundDisabled = !progress || ![PROGRESS[6], PROGRESS[7]].includes(progress) || fireCustomer?.data?.refundActive || Boolean(refundActive) || !Boolean(fireCustomer?.data)
  const progressDisabled = ![PROGRESS[2],PROGRESS[3],PROGRESS[4],PROGRESS[5],PROGRESS[6]].includes(progress) || !Boolean(fireCustomer?.data)

  return (
    <>
      {/* <Link href={`${pathname.split('?')[0]}`} as={`${asPath.split('?')[0]}`} scroll={false}> */}
        <button  onClick={()=>router.back()} className={`button-base side-menu-backdrop${'more' in query ? ` is-visible` : ''}`} />
      {/* </Link> */}
      <ul className={`order-menu-right ${'more' in query ? ` is-visible` : ''}`}>
        {/** HEADER */}

        <li className='order-menu-header'>
          {/* <Link href={`${pathname.split('?')[0]}`} as={`${asPath.split('?')[0]}`} scroll={false}> */}
            <button onClick={()=>router.back()} className='nav-button button-base'>
              <SVGIcon name='x' color={action} />
            </button>
          {/* </Link> */}
          <h3>OPTIONS</h3>
        </li>
        {fireOrder.status === 'success' && fireCustomer.status === 'success' ? (
          <>
            {/** FEATURE */}
              {/* <li className='order-menu-item'>
                <SVGIcon style={{marginRight: 12}} name='locationMarker' color={action} />
                <span>{fireOrder.data?.location.address.split(',')[0] || ''}</span>
              </li> */}
             {/** DECLINE */}
            {['manager', 'admin', 'dispatcher'].includes(`${fireUser?.data?.role}`) && <li>
              <Link href={`${pathname.split('?')[0]}`} as={`${asPath.split('?')[0]}`} scroll={false}>
                <button  onClick={handleQuit} className='button-base' disabled={quitDisabled}>
                  <SVGIcon style={{marginRight: 12}} name='x' color={quitDisabled ? disabled : action} />
                  <span>Quit Order</span>
                </button>
              </Link>
            </li>}
            {/** RESET */}
            <li>
              <Link href={`${pathname.split('?')[0]}`} as={`${asPath.split('?')[0]}`} scroll={false}>
                <button  onClick={handleReset} className='button-base' disabled={resetDisabled}>
                  <SVGIcon
                    style={{marginRight: 12, transform: 'scaleX(-1)'}}
                    name='refund'
                    color={resetDisabled ? disabled : action}
                  />
                  <span>Reset Order</span>
                </button>
              </Link>
            </li>
            {/** REFUND */}
            <li>
              <Link href={`${pathname.split('?')[0]}`} as={`${asPath.split('?')[0]}`} scroll={false}>
                <button  onClick={handleRefund} className='button-base' 
                 disabled={refundDisabled}
                >
                  <SVGIcon style={{marginRight: 12}} name='replacement' color={refundDisabled ? disabled : action} />
                  <span>Refund Order</span>
                </button>
              </Link>
            </li>
            {/** Edit Progress */}
            <li>
              <Link href={`${pathname.split('?')[0]}`} as={`${asPath.split('?')[0]}`} scroll={false}>
                <button onClick={handleProgress} className='button-base' 
                 disabled={progressDisabled}
                >
                  <SVGIcon style={{marginRight: 12}} name='pencil' color={progressDisabled ? disabled : action} />
                  <span>Edit Progress</span>
                </button>
              </Link>
            </li>
          </>
        ) : (
          <div className='spinner-box'>
            <Spinner />
          </div>
        )}
      </ul>
    </>
  )
}

export default OrderMenu

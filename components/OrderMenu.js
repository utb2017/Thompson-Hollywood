import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import SVGIcon from '../components/SVGIcon'
import firebase, { updateFirestore } from '../firebase/clientApp'
import PROGRESS from '../helpers/PROGRESS'
import {defaultTheme} from '../styles/themer/utils'
import {useDispatchModal} from '../context/modalContext'
import {RefundModal} from '../components/Modals'



function OrderMenu({ color, address, progress, as, href, scroll }) {

  const router = useRouter()
  const { asPath, pathname, query } = router
  const { modalDispatch, modalState } = useDispatchModal()


  const [quitDisabled, setQuitDisabled] = useState(true)
  const [resetDisabled, setResetDisabled] = useState(true)
  const [refundDisabled, setRefundDisabled] = useState(true)

  const overlayRef = useRef(null)
  const menuRef = useRef(null)
  const quitRef = useRef(null)
  const resetRef = useRef(null)
  const refundRef = useRef(null)


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


  const handleRefundClick = () => {
    const modalProps = {
      items:[]
    }
    const component = () => <RefundModal {...modalProps} />
    openModal(component)
  }


  /** Check to disable link Buttons **/
  useEffect(() => {
    const quitClass = ['button-base', 'flex', 'align-items-center']
    const resetClass = ['button-base', 'flex', 'align-items-center']
    const refundClass = ['button-base', 'flex', 'align-items-center']
    const isResetDisabled = !progress || PROGRESS[0] === progress
    const isQuitDisabled = !progress || [PROGRESS[6], PROGRESS[7]].includes(progress)
    const isRefundDisabled =  !progress || ![PROGRESS[6], PROGRESS[7]].includes(progress)

    if (isResetDisabled) {
      resetClass.push('disabled-link')
    } else {
      resetClass.push(progress)
    }
    if (isQuitDisabled) {
      quitClass.push('disabled-link')
    } else {
      quitClass.push('red')
    }
    if (isRefundDisabled) {
      refundClass.push('disabled-link')
    } else {
      refundClass .push('red')
    }
    setQuitDisabled(isQuitDisabled)
    setResetDisabled(isResetDisabled)
    setRefundDisabled(isRefundDisabled)
    quitRef.current.className = quitClass.join(' ')
    resetRef.current.className = resetClass.join(' ')
    refundRef.current.className = refundClass.join(' ')
  }, [progress, quitDisabled, resetDisabled, refundDisabled])


  const handleQuit = useCallback( async () => {
    await updateFirestore('orders', router.query.oid, {
      progress:'cancel',
    })
  }, [router])

  const handleReset = useCallback( async () => {
    const FieldValue = firebase.firestore.FieldValue;
    await updateFirestore('orders', router.query.oid, {
      progress:'received',
      driver: FieldValue.delete()
    })
  }, [router])




  const {action, disabled} = defaultTheme.colors




  return (
    <>
      <Link
        href={`${pathname.split('?')[0] }`}
        as={`${asPath.split('?')[0]}`}
        scroll={false}
      >
        <button className={`button-base side-menu-backdrop${('more' in query)?` is-visible`:''}`}/>
      </Link>
      <ul ref={menuRef} className={`side-menu right flex-direction-column${('more' in query)?` is-visible`:''}`}>
        <li className='side-menu-header-bar'>
          <Link  as={as} href={href} scroll={scroll}>
            <button className='navigation-bar-button right button-base back'>
              <span className={"svg-wrapper"}>
                <SVGIcon name='x' color={action} />
              </span>
              
            </button>
          </Link>
          <h3 style={{ color:action }}>Options</h3>
        </li>
        <li className='side-menu-item side-menu-header'>
            <p className='side-menu-title min-22'>Order</p>
            {address
              ? ( <p >{address}</p> )
              : ( <p className='holder flex-box column'>
                    <span className='width-90'><wbr/></span>
                    <span className='width-30'><wbr/></span>
                  </p>
            )}
        </li>
        <li className='side-menu-item flex'>
         
          <Link as={as} href={href} scroll={scroll}>
            <button
              ref={resetRef}
              onClick={handleReset}
              className='button-base disabled-link flex align-items-center'
              disabled={resetDisabled}
              style={{ color:resetDisabled?disabled:color }}
            >
               <SVGIcon  style={{marginRight:12,transform: 'scaleX(-1)'}} name='refund' color={resetDisabled?disabled:action} />
             <span>Reset Order</span> 
            </button>
          </Link>
        </li>
        <li className='side-menu-item side-menu-item-no-border flex'>
        <Link as={as} href={href} scroll={scroll}>
          <button
            ref={quitRef}
            onClick={handleQuit}
            className='button-base disabled-link flex align-items-center'
            disabled={quitDisabled}
          >
            <SVGIcon style={{marginRight:12}} name='x' color={quitDisabled?disabled:action} />
            <span>Decline Order</span> 
          </button>
          </Link>
        </li>
        <li className='side-menu-item side-menu-item-no-border flex'>
        <Link as={as} href={href} scroll={scroll}>
          <button
            ref={refundRef}
            onClick={handleRefundClick}
            className='button-base disabled-link flex align-items-center'
            disabled={refundDisabled}
          >
            <SVGIcon style={{marginRight:12}} name='replacement' color={refundDisabled?disabled:action} />
            <span>Refund Order</span> 
          </button>
          </Link>
        </li>
      </ul>
    </>
  )
}

export default OrderMenu

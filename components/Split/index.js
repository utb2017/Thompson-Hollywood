/* Split Layout - Not Dynamic */
import {useRouter} from 'next/router'
import {useEffect, useState, useCallback, forwardRef, createRef, useRef} from 'react'
import SVGIcon from '../../components/SVGIcon'
import { defaultTheme } from '../../styles/themer/utils'
//import {disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock'
import { useUser } from '../../context/userContext'
import { Button, KIND, SIZE, SHAPE } from "baseui/button";
import Spinner from '../Buttons/Spinner'
import Link from 'next/link'
import { useRouting } from '../../context/routingContext'
import { Label1, Label4, Paragraph4 } from 'baseui/typography'
import { useStyletron } from "baseui";
import { styled } from "baseui";
import { useForm } from '../../context/formContext'


export const InfoPane = ({ children, mapHeight = "small", mapComponent, noDrawer=false, back }) => {
    const scrollRef = createRef(null)
    /* IOS scroll fix */
    //   useEffect(() => {
    //   disableBodyScroll(scrollRef.current)
    //   return () => clearAllBodyScrollLocks()
    // }, [scrollRef])
  
    return (
      <div ref={scrollRef} className='split-scroll'>
        <InfoHeader  title='' {...{back}} />  
        <div className='info-pane'>
          <div className='info-grid'>{children}</div>
        </div>
        <div className={`map-pane ${mapHeight || ""}`}>
          <MapHeader noDrawer={noDrawer} />
          <div
            style={{
              width: "100%",
              height: "100%",
              margin: 0,
              padding: 0,
              position: "relative",
            }}>
            <div
              style={{
                width: "100%",
                height: "100%",
                left: 0,
                top: 0,
                margin: 0,
                padding: 0,
                position: "absolute",
                overflow: "hidden",
              }}>
              <div
                style={{
                  height: "100%",
                  width: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  backgroundColor: "rgb(229, 227, 223)",
                }}>
                {mapComponent}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
export const MapPaneV = ({children, mapHeight='small'}) => {
    return (
        <div className={`map-pane ${mapHeight||''}`}>
            {children}
        </div>
    );
}

export const SplitWindow = ({children = undefined, mapHeight = undefined }) => {
    const windowProps = {
        mapHeight:mapHeight||'small'||'medium'||'large',
    }
    return (
        <div className={`split-window ${windowProps?.mapHeight||''} canvas-theme-container`}>
           {children}
        </div>
    );
}
const InfoAppBar = styled("header", ({ $theme }) => {
  return {
    backgroundColor: $theme.colors.background,
    borderBottom: `1px solid ${$theme.borders.border600.borderColor}`,
  };
});

export const InfoHeader = ({title='', back}) => {
    const router = useRouter()
    const {query} = router
    const { user } = useUser()
    const {  setNavLoading } = useRouting()
    
  const [css, theme] = useStyletron();
    return (
      <InfoAppBar className='info-pane-header'>
        <div className='info-header-appbar'>
            <div className='flex-grid'>
            {/* <Link
                href={!prevPage?'/[adminID]/orders/active':prevPage}
                {...(!prevPage && {as:`/${user?.uid}/orders/active`})}
                scroll={false}> */}
                
                <Button 
                onClick={()=>((typeof back === 'string' || back instanceof String)?router.push(back):router.back(),setNavLoading(true))} 
                //onClick={} 
                //className='button-base'
                
                kind={KIND.tertiary}
                size={SIZE.compact}  
                shape={SHAPE.square}
                
                >
                    <SVGIcon name='arrowLeft' />
                </Button>
                {/* </Link> */}
            </div>
            <div className='flex-grid'>
                <h4 >{title}</h4>
            </div>
            <div className='flex-grid'>
            {/* <Link
                as={`/${user?.uid}/orders/selected/${query.uid}/${query.oid}?more`}
                href={`/[adminID]/orders/selected/[uid]/[oid]?more`}
                scroll={false}>
                <button className='button-base'>
                    <SVGIcon color={defaultTheme.colors.action} name='moreFilled' />
                </button>
                </Link> */}
                                <Button
                onClick={()=>setIsSideOpen(true)}
                kind={KIND.tertiary}
                size={SIZE.compact}  
                shape={SHAPE.square}  >{<SVGIcon name='moreFilled' />}</Button>
            </div>
        </div>
      </InfoAppBar>
    )
}
  

export const MapHeader = ({title='', noDrawer=false, }) => {
    const router = useRouter()
    const {query} = router
    const { user, fireUser } = useUser()
    const { form, setForm, error, setError, loading, setLoading, isSideOpen, setIsSideOpen } = useForm();

    if(! ['manager', 'admin', 'dispatcher'].includes(`${fireUser?.data?.role}`) ){
      noDrawer = true
    }

    return (
        <header className='map-pane-header'>
        <div className='map-header-appbar'>
            <div className='flex-grid'>
                            <Link
                href={'/[adminID]/orders/active'}
                as={`/${user?.uid}/orders/active`}
                scroll={false}>
            <Button 
                //onClick={()=>setIsSideOpen(true)}
                kind={KIND.tertiary}
                size={SIZE.compact}  
                shape={SHAPE.square} >{<SVGIcon  name='arrowLeft' />}</Button>
                
                 </Link> 
            </div>
            <div className='flex-grid'>
                <h4 >{title}</h4>
            </div>
            <div className='flex-grid'>
            {!noDrawer &&
            //  <Link
            //     as={`/${user?.uid}/orders/selected/${query.uid}/${query.oid}?more`}
            //     href={`/[adminID]/orders/selected/[uid]/[oid]?more`}
            //     scroll={false}>

                <Button
                onClick={()=>setIsSideOpen(true)}
                kind={KIND.tertiary}
                size={SIZE.compact}  
                shape={SHAPE.square}  >{<SVGIcon name='moreFilled' />}</Button>
 }
               
                {/* </Link>  */}
                
            </div>
        </div>
      </header>
    )
}


const FooterBar = styled("header", ({ $theme }) => {
  return {
    backgroundColor: $theme.colors.background,
    borderTop: `1px solid ${$theme.borders.border600.borderColor}`,
  };
});

export const ProgressFooter = ({children, style=undefined}) => {
    return (
      <FooterBar {...{style}} className='progress-footer'>
        <div className='progress-footer-app-bar'>
        {children}
        </div>
      </FooterBar>
    );
}


export const SlideButton = ({onUnlock, text, disabled}) => {
    const pulleeRef = useRef(null)

    //inputRange =  pulleeRef.current,
    let maxValue = 150, // the higher the smoother when dragging
    speed = 12, // thanks to @pixelass for this
    currValue = undefined, rafID = undefined;




    useEffect(() => {
            // set min/max value
            if(pulleeRef.current){
                pulleeRef.current.value = 0;
                pulleeRef.current.min = 0;
                pulleeRef.current.max = maxValue;
            }


    }, [pulleeRef]);




    function unlockStartHandler() {
        // clear raf if trying again
        window.cancelAnimationFrame(rafID);
        
        // set to desired value
        currValue = +pulleeRef.current.value;
    }
    
    function unlockEndHandler() {
        
        // store current value
        currValue = +pulleeRef.current.value;
        
        // determine if we have reached success or not
        if(currValue >= maxValue) {
            successHandler();
        }
        else {
            rafID = window.requestAnimationFrame(animateHandler);
        }
    }
    
    // handle range animation
    function animateHandler() {
        
        // update input range
        pulleeRef.current.value = currValue;
        
        // determine if we need to continue
        if(currValue > -1) {
            window.requestAnimationFrame(animateHandler);   
        }
        
        // decrement value
        currValue = currValue - speed;
    }
    
    // handle successful unlock
    function successHandler() {
       setTimeout(() => {
        rafID = window.requestAnimationFrame(animateHandler);
      }, 1000);
      onUnlock && onUnlock()
        // reset input range
 
    };


    // listen for unlock
    function unlockStartHandler() {
        // clear raf if trying again
        window.cancelAnimationFrame(rafID);
        
        // set to desired value
        currValue = +pulleeRef.current.value;
    }




    return (
        <div className="center-xy">
            <label className="progress-label">{text||''}</label>
            <div className='progress-gaurd'/>
            <input 
            onMouseDown={unlockStartHandler} 
            onMouseDownCapture={unlockStartHandler}
            //onTouchStart={unlockStartHandler}
            onMouseUp={unlockEndHandler}
            onTouchEnd={unlockEndHandler}
            ref={pulleeRef} 
            type="range" 
            disabled={disabled}
            //onChange={(e)=> pulleeRef.current.value = e.target.value}
            //value={pulleeRef?.current?.value||'0'}
            className="pullee" />
        </div>
    );
}

export const TotalsRow =  ({label, value, variant}) => {
    return !(!value && value !== 0) && (
      <div className={`primary-cart-row ${variant||''}`}>
          <div className='cart-row-flex'>
              <div className='cart-row-label'>
                <Label4>{label}</Label4> 
              </div>
              <div className='cart-row-value'>
               <Paragraph4 style={{display:'flex'}}>{value}</Paragraph4> 
              </div>      
          </div>                             
          <div className='secondary-label'>
  
          </div>                            
      </div>         
    )
  }


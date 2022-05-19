import Spinner from "./Spinner"
import {forwardRef } from "react";
import styles from '../Buttons/button.module.scss';

interface RefObject<T> {
  readonly current: T | null
}
interface StyleObject {
  readonly [k:string]:string|number
}

interface Props {
  loading:Boolean;
  onClick?:(x:any) => void;
  disabled:Boolean;
  type?:"button" | "submit" | "reset";
  text?:string;
  spinnerColor?:string;
  style?:StyleObject;
  variant?:string;
  fullWidth?:Boolean;
  className?:string;
}
const Button = forwardRef(({
  loading = false,
  onClick = null,
  disabled = false,
  type = "submit",
  text = "Submit",
  spinnerColor = '#1a73e8',
  style = null,
  variant='primary',
  fullWidth = false,
  className = null,
}:Props, ref:RefObject<HTMLButtonElement>) => {
  style = {...style,...(fullWidth&&{width:'100%'})}
  const handleClick = (e:any) => {
      onClick && onClick(e)
  }
  return (
      <button 
        style={style}
        type={type}
        onClick={handleClick}
        className={`button-base${className?` ${className}`:``}${variant?` ${styles[variant]}`:``}`}
        disabled={Boolean(disabled)}
        ref={ref}
      >
        {loading ? <Spinner style={null} color={spinnerColor} /> : text}
      </button>
  )
})  
export default Button

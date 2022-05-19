import Spinner from "./Spinner"
import {forwardRef } from "react";
import styles from '../../components/Buttons/button.module.scss'

const Button = forwardRef(({
  loading = false,
  onClick = null,
  disabled = false,
  type = "submit",
  text = "Submit",
  spinnerColor = '#1a73e8',
  style = {},
  variant='primary',
  fullWidth = false,
  className = ''
}, ref) => {
  style = {...style,...(fullWidth&&{width:'100%'})}
  const handleClick = (e) => {
      //e && e.preventDefault()
      onClick && onClick(e)
  }
  const props = { disabled, type, ref, style }
  return (
      <button 
        {...props}
        onClick={handleClick}
        className={['button-base', className, styles[variant]].join(' ')}
      >
        {loading ? <Spinner color={spinnerColor} /> : text}
      </button>
  )
})  
export default Button

import Link from "next/link"
import { useRouting } from "../../context/routingContext"
import { StyledBaseButton } from "baseui/button";

export const HeaderCell = ({
  id = undefined,
  style = undefined,
  text = undefined,
  maxWidth = undefined,
  minWidth = undefined,
  flex = 3,
  lineHeight = undefined,
  width = undefined,
  mobileHide = false,
}) => {
  const options = {
    ...{ maxWidth },
    ...{ width },
    ...{ minWidth },
    ...(!width && { flex }),
    ...{ lineHeight },
  }

  return (
    <div
      name='header-cell'
      className={`header-cell${mobileHide ? ` hide` : ""}`}
      style={{
        ...options,
        ...style,
      }}>
      <div className='cell-wrapper'>{text && text}</div>
    </div>
  )
}
export const HeaderRow = ({ children, variation=false }) => {
  return (
    <div className={`header-row${variation?` ${variation}`:``}`} role='row'>
      {children}
    </div>
  )
}
export const TableCell = ({
  id = undefined,
  style = undefined,
  text = undefined,
  maxWidth = undefined,
  minWidth = undefined,
  flex = 3,
  lineHeight = undefined,
  width = undefined,
  mobileHide = false,
  img = false,
  onClick = undefined,
}) => {
  const options = {
    ...{ maxWidth },
    ...{ width },
    ...{ minWidth },
    ...(!width && { flex }),
    ...{ lineHeight },
  }

  return (
    <StyledBaseButton
      onClick={onClick}
      name='table-cell'
      className={`button-base table-cell${mobileHide ? ` hide` : ""} `}
      style={{
        ...options,
        ...style,
      }}
      >
      {text && <div className='cell-wrapper'>{text}</div>}
      {img && (
        <div className='img-wrapper'>
          <img src={img} alt='license' />
        </div>
      )}
    </StyledBaseButton>
  )
}
export const TableRowNoLink = ({ children }) => {
  return (
      <div className='table-row'>
        {children}
      </div>
  )
}
export const TableRow = ({ children, as = "/", href = "/" }) => {
  const { setNavLoading } = useRouting()
  const handleClick = () => {
    setNavLoading(true)
  }
  return (
    <Link as={as} href={href} scroll={false}>
      <button className='button-base table-row' onClick={handleClick} role='row'>
        {children}
      </button>
    </Link>
  )
}
export const TableOutlet = ({ children, variation = false }) => {
  return (
    <div className='table-form-outlet'>
      <div className={`table-card${variation?` ${variation}`:``}`}>{children}</div>
    </div>
  )
}
export const TableHeader = ({ children, variation = false }) => {
  return <div className={`table-header${variation?` ${variation}`:``}`}>{children}</div>
}

export const TableContent = ({ children }) => {
  return (
    <div className='card-content'>
      <div className='table'>{children}</div>
    </div>
  )
}

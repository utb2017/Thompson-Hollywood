import React from 'react'
import colors from '../../styles/colors'
import SVGIcon from '../../components/SVGIcon'

const styles = {
  button:{
    display: 'flex',
    fontWeight: 600,
    fontSize: 14,
    height: 34,
    lineHeight: '34px',
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#1967d2',
    color: colors.WHITE,
    marginTop: 4,
    marginBottom: 4,
    marginLeft: '4px',
    marginRight: '4px',
    backgroundColor: '#1a73e8',
    alignItems:'center',
    paddingLeft: '16px',
    paddingRight: '4px',
    
  }
}
const Tag = ({style, elementAttributes, onClick, label, color='#CC0033', value=''}) => {
  const handleClick = (e) => {
    //e.stopImmediatePropagation()
    e.stopPropagation()
    e.preventDefault()
    
    onClick && onClick(e, value)
  }
  return (
    <button  onClick={handleClick} style={{...styles.button, ...style}} {...elementAttributes}>
         <span style={{marginRight:'6px'}}>{label}</span>
         {value !== 'ALL_PRODUCTS' && <span style={{display:'flex'}}><SVGIcon name='xSmall'/></span>}
         {value === 'ALL_PRODUCTS' && <span style={{display:'flex', width:"6px"}}></span>}
    </button>
  )
}
export default Tag

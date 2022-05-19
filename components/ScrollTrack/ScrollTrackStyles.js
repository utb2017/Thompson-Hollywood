import spacing from '../../styles/spacing'
import zIndex from '../../styles/zIndex'

export default {
  containerStyles: {
    overflow: 'hidden',
    position: 'relative',
  },
  innerContainerStyles: {
    whiteSpace: 'nowrap',
    position: 'relative',
  },
  collapsed:{
    left: 'inherit',
    overflowX: 'scroll',
    display: 'block',
    msOverflowStyle: 'none',
    overflow: '-moz-scrollbars-none',
    WebkitOverflowScrolling: 'touch',
  },
  slideButtonStyles: {
    default: {
      position: 'absolute',
      //bottom: '1px',
      //right:'0px',
      display: 'none',
      //height:'40px',
      //width:'38px',
      //verticalAlign:'middle',
      //textAlign:'center',
      //borderRadius:'0px',
     // backgroundColor:'rgba(0,0,0,0.05)',
      //borderLeft:'1px solid #c3cfdd',
     // boxShadow:'none',
     // color:'rgba(255,255,255,0.07)',
      //...zIndex.Z_INDEX1,
      zIndex:1
    },
    left: {
          left:'6px',
     // ...spacing.LEFT_XS
    },
    right: {
    
    right:'6px',
    //...spacing.RIGHT_XS
  },
  },
}

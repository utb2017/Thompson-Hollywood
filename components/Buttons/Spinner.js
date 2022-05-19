
const Spinner = ({color = undefined, style = undefined}) => {
    return (
      <>
        <div style={{...style, ...{borderLeftColor:color}}} className='spinner'/>
      </>
    )
  }
  export default Spinner
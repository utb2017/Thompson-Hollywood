import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"

Callout.propTypes = {
    variant: PropTypes.oneOf(["callout-info"]),
}

function Callout({variant = "callout-info", children}) {

    const [style, setStyle] = useState("callout")
  
    useEffect(() => {
      const css = ["callout"]
      if (variant) {
        css.push(variant)
      }
      setStyle(css.join(" "))
      return () => {
        setStyle("callout")
      }
    }, [variant])
  
  return (
    <p className={style}>
      {children}
    </p>
  )
}

export default Callout


import React from 'react'
import PropTypes from 'prop-types'
import * as icons from './icons'

const sizes = { small: '18px', standard: '24px', large: '36px', xLarge:'42px' }

SVGIcon.propTypes = {
  color: PropTypes.string,
  name: PropTypes.oneOf(Object.keys(icons)).isRequired,
  size: PropTypes.oneOf(Object.keys(sizes)),
}

SVGIcon.defaultProps = {
  color: 'currentColor',
  size: 'standard',
}

function SVGIcon({ color=undefined, name, size=undefined, ...props }) {
  const Component = icons[name]
  return <Component aria-hidden fill={color} height={sizes[size]} {...props} />
}

export default SVGIcon
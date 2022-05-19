import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { colors } from '../../styles'
import { defaultTheme } from '../../styles/themer/utils'

const styles = {
    root: {
      position: "absolute",
      left: 10,
      top: 0,
      bottom: 0,
      margin: 'auto 0',
      lineHeight: '56px',
      marginTop: '9px',
      //color: `${colors.GRAY_74}`,
      cursor: 'inherit',
      fontSize: '16px',
      opacity: 0,
      transformOrigin: 'left top',
      transition: 'visibility 200ms linear 200ms, opacity 200ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
      pointerEvents: 'none',
      zIndex: 1,
      visibility: 'hidden',
    },
    show: {
      opacity: 1,
      visibility: 'visible',
    },
    disabled: {
      cursor: 'not-allowed',
    },
  }

  const getSnackStyles = snacksTheme => {
    const { action } = snacksTheme.colors
    return {
      active: {
        color: action,
      },
    }
  }


class Rate extends Component {
  static propTypes = {
    /** Hint Text */
    text: PropTypes.string.isRequired,
    /** Disabled styling */
    disabled: PropTypes.bool,
    /** Show the hint text */
    show: PropTypes.bool,
    /** Override styles */
    style: PropTypes.object,
    /** A uniq id */
    inputId: PropTypes.string,
    /** Is the input in an active state */
    isActive: PropTypes.bool,
  }

  static defaultProps = {
    disabled: false,
  }

  render() {
    const { disabled, show, style, text, inputId, isActive } = this.props

    const snacksStyles = getSnackStyles(defaultTheme)

    return (
      <div
        id={inputId}
        style={{
            ...styles.root, 
            ...style, 
            ...(disabled && styles.disabled), 
            ...(show && styles.show),
            ...(isActive && snacksStyles.active),
        }}
      >
        {text}
      </div>
    )
  }
}

export default Rate


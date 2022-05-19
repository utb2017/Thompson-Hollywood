import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { colors } from '../../styles'

const styles = {
  root: {
    backgroundColor: 'rgb(255, 245, 250)',
    borderRadius: '4px',
    color: 'rgb(212, 54, 132)',
    fontSize: '15px',
    marginBottom: '12px',
    paddingTop: '15px',
    paddingRight: '15px',
    paddingBottom: '15px',
    paddingLeft: '15px',
    border:`1px solid rgb(212, 54, 132)`
  },
}

class ServerError extends Component {
  static propTypes = {
    /** Override styles */
    style: PropTypes.object,
    /** Error text */
    text: PropTypes.string,
  }

  render() {
    const { style, text } = this.props

    return (
      <div style={{...styles.root, ...style}} aria-live={'assertive'} aria-atomic>
        {text}
      </div>
    )
  }
}

export default ServerError
import React from "react";
import PropTypes from "prop-types";
ServerError.propTypes = {
  /** Override styles */
  style: PropTypes.object,
  /** Error text */
  text: PropTypes.string
};
function ServerError({ style, text }) {
  return (
    <div className="server-error" style={style}>
      {text}
    </div>
  );
}
export default ServerError;

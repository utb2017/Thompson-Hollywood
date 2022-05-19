import React from "react";
import PropTypes from "prop-types";

SignUpValueProps.propTypes = {
  device: PropTypes.oneOf(["mobile", "desktop"]).isRequired,
};

function SignUpValueProps({ device }) {
  return (
    <ul className={`sign-up-value-props ${device}`}>
      <li>
        <h2>Fast</h2>
        <p>Get delivery in an hour or less.</p>
      </li>
      <li>
        <h2>Easy</h2>
        <p>Browse inventory and checkout in minutes.</p>
      </li>
      <li>
        <h2>Safe</h2>
        <p>Store your documents securely in a HIPAA-compliant database.</p>
      </li>
    </ul>
  );
}

export default SignUpValueProps;

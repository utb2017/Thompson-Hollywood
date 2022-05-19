import React from "react";
import PropTypes from "prop-types";

AuthFlowContainer.propTypes = {
  title: PropTypes.string,
  caption: PropTypes.string,
  infoChildren: PropTypes.node,
};

function AuthFlowContainer({ children, title, caption, infoChildren }) {
  return (

      <section className='user-profile-profile-section user-profile-section' >
        <div className="user-profile-profile-info user-profile-info">
          <h2>{title}</h2>
          <p>{caption}</p>
          {infoChildren}
        </div>
        {children}
      </section>
  );
}
export default AuthFlowContainer;

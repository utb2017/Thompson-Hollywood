import React from "react";
import SVGIcon from "../../components/SVGIcon";
import Link from "next/link";
import PropTypes from "prop-types";


const AuthContainer = ({children, infoChildren, title, caption}) => {
  return(
    <div className="auth-flow-container">
    <div className="auth-flow-content">
      <div className="auth-flow-info">
        <h1>{title}</h1>
        <p>{caption}</p>
        {infoChildren}
      </div>
      {children}
    </div>
  </div>
  )
}

const ProfileContainer = ({children}) => {
  return(
    <div className="user-profile">
      {children}
  </div>
  )
}

AuthFlow.propTypes = {
  link: PropTypes.string,
  leftIconName: PropTypes.string,
  leftIconColor: PropTypes.string,
  page: PropTypes.string,
  showCrumbs: PropTypes.oneOf(["hidden"]),
  crumbs: PropTypes.array,
};


function AuthFlow({
  href="/[adminID]/", 
  as,
  scroll=false,
  children,
  showCrumbs,
  link,
  leftIconName,
  leftIconColor,
  crumbs = [null, null, null],
  title, 
  caption, 
  infoChildren,
  profile = false
}) {

  
  
  return (
    <div className={`auth-flow mobile`}>
      <div className='auth-flow-breadcrumbs'>
        <ul className={`auth-flow-breadcrumbs-list ${showCrumbs||""}`.trim()}>
          <li className={crumbs[0]}>
            <span>1</span>
            <span className="auth-flow-breadcrumbs-list-text">
              . Create Account
            </span>
          </li>
          <li className={crumbs[1]}>
            <span>2</span>
            <span className="auth-flow-breadcrumbs-list-text">
              . Verify Phone
            </span>
          </li>
          <li className={crumbs[2]}>
            <span>3</span>
            <span className="auth-flow-breadcrumbs-list-text">
              . Upload ID
            </span>
          </li>
        </ul>
        <Link             href={href} 
            as={as}
            scroll={false}>
          <button className="button-base arrow-left">
            {leftIconName && (
              <SVGIcon color={leftIconColor} name={leftIconName} />
            )}
          </button>
        </Link>
      </div>
      {!profile && <AuthContainer children={children} infoChildren={infoChildren} title={title} caption={caption}/>}
      {profile && <ProfileContainer children={children} infoChildren={infoChildren} title={title} caption={caption}/>}
    </div>
  );
}

export default AuthFlow;
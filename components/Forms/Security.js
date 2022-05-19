import React from "react"
import SVGIcon from "../../components/SVGIcon"

const Security = () => {
  return (
    <>
      <div className='license-footer'>
        <div className='license-lock-icon'>
          <SVGIcon name={"lockFilled"} color={"#1a1229"} />
        </div>
        All documents are stored securely in a HIPAA-compliant database.
      </div>
      <style jsx>{`
        .license-footer {
          display: -webkit-box;
          display: -ms-flexbox;
          display: flex;
          color: #929497;
          font-size: 12px;
          margin-top: 24px;
        }
        .license-lock-icon {
          padding-top: 4px;
          margin-right: 10px;
        }
      `}</style>
    </>
  )
}
export default Security

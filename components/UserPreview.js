import { capitalize, presetImgObject } from "../helpers"
import SVGIcon from "../components/SVGIcon"

function UserPreview({
  displayName,
  email,
  photoURL,
  phoneNumber,
  role,
}) {
  return (
    <>
      <div className='side-license-preview'>
        {Boolean(photoURL) ? (
          <img className='' src={photoURL} alt={"license"} />
        ) : (
          <div className='side-license-icon'>
            <SVGIcon name='photo' />
          </div>
        )}
      </div>
      <div className='side-license-info'>
        {role && (
          <div className='side-license-info-item'>
            {Boolean((role || "").length) ? capitalize(role) : "Role"}
          </div>
        )}
        <div className='side-license-info-item' aria-label={ Boolean((displayName || "").length) ? capitalize(displayName) : "Name"}>
          {Boolean((displayName || "").length) ? capitalize(displayName) : "Name"}
        </div>

        <div className='side-license-info-item' aria-label={ Boolean((phoneNumber || "").length) ? phoneNumber : "Phone"}>
           {Boolean((phoneNumber || "").length) ? phoneNumber : "Phone"}
        </div>

        <div className='side-license-info-item' aria-label={ Boolean((email || "").length) ? capitalize(email) : "Email"}>
          {Boolean((email || "").length) ? capitalize(email) : "Email"}
        </div>
      </div>
    </>
  )
}

export default UserPreview

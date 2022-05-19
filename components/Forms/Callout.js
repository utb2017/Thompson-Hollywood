import { useState, useMemo } from 'react'
import firebase from '../../firebase/clientApp'
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery'
import { useUser } from '../../context/userContext'
import colors from "../../styles/colors"
import {defaultTheme} from "../../styles/themer/utils"

const UploadLicense = () => {

  const [lastUpload, setLastUpload] = useState(null)
  const { user } = useUser()
  const profile = useFirestoreQuery(
    user?.uid && firebase.firestore().collection('users').doc(user.uid)
  )
  /** Last Update State **/
  useMemo(() => {
    profile.data?.licenseUpdateAt &&
      setLastUpload(
        new Date(profile.data?.licenseUpdateAt.toDate()).toLocaleTimeString(
          [],
          {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }
        )
      )
  }, [profile])
  
  return (
        <>
        {lastUpload && (
            <p className='callout-box'>
            <span>You last updated your license on </span>
            <span>{lastUpload}</span>
            </p>)}
            <style jsx>{`
                .callout-box {
                    margin: 15px 0;
                    padding: 10px 15px;
                    border-radius: 5px;
                    border: 1px solid ${defaultTheme.colors.secondaryColor};
                    background: ${defaultTheme.colors.secondaryColorLight};
                    color: ${defaultTheme.colors.secondaryColor};
                }
        `}</style>
        </>
  )
}
export default UploadLicense

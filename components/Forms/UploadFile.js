import { useCallback } from "react"
import { useAuth } from "../../context/authContext"
import colors from "../../styles/colors"
import {defaultTheme} from "../../styles/themer/utils"
const imgError = { code: "storage/invalid", message: "Not a valid image." }

const UploadFile = ({
    fileType=/(\.jpg|\.jpeg|\.png|\.gif)$/i,
    text = "Add Image"
}) => {
  const {form, setForm, setError} = useAuth()
  const { uploadImg, uploadProgress } = form

  const handleChange = useCallback((e) => {
    e.stopPropagation()
    const uploadImg = e.target.files[0]
    if(fileType.exec(uploadImg?.name)){
        setForm( oldForm => ({...oldForm,...{uploadImg}}))
        setError( oldErrors => ({...oldErrors,...{photoURL:null}}))
    }else{
        setError( oldErrors => ({...oldErrors,...{photoURL:imgError}}))
        setForm( oldForm => ({...oldForm,...{uploadImg:null}}))
    }
  },[fileType])


  return (
    <>
      <div className='upload-file-container'>
        <span className='plus-sign'>+</span>
        <span className='upload-file-label'>
         { (uploadProgress && `${parseInt(uploadProgress)}%`) || uploadImg?.name  || text }
        </span>
        <input type='file' name='license' onChange={handleChange} />
      </div>
      <style jsx>{`
        .upload-file-container {
          background: #1a1229;
          border-radius: 5px;
          height: 54px;
          position: relative;
          text-align: center;
          transition: color 0.15s ease-in;
          width: 100%;
          margin-bottom: 16px;
          padding: 0 12px;
          overflow: hidden;

        }
        .upload-file-container span {
          line-height: 53px;
          vertical-align: middle;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .plus-sign {
          font-size: 24px;
          margin-right: 12px;
          display:${uploadImg ? 'none' : 'inline-block'};
          color:${colors.WHITE};
        }
        .upload-file-label {
          font-size: 16px;
          letter-spacing: 1px;
          text-transform: uppercase;
          color:${uploadImg ? defaultTheme.colors.secondaryBackground : colors.WHITE };
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: ${uploadImg ? 'block' : 'inline-block'};
        }
        .upload-file-container > input {
          cursor: pointer;
          font-size: 200px;
          left: 0;
          opacity: 0;
          -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";
          filter: alpha(opacity=0);
          position: absolute;
          top: 0;
        }
      `}</style>
    </>
  )
}
export default UploadFile

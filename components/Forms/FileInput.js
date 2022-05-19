import { useCallback } from "react"
import colors from "../../styles/colors"
import { defaultTheme } from "../../styles/themer/utils"
import { useState } from "react"

const fileError = { code: "invalid-file-type", message: "Invalid file type." }
const re = /(?:\.([^.]+))?$/;

const FileInput = ({
  fileType = ["jpg", "jpeg", ".png"],
  text = "Add Image",
  onChange = () => {},
  onError = () => {},
  progress = 0,
}) => {
  const [fileName, setFileName] = useState(null)

  const handleChange = useCallback(
    (e) => {
      e.stopPropagation()
      let tempFile = null
      let tempError = fileError
      const ext = re.exec(e.target.files[0].name.toLowerCase())[1]
      if (fileType.includes(ext)) {
      //if (fileType.exec(e.target.files[0].name)) {
        console.log("valid file")
        tempFile = e.target.files[0]
        tempError = null
      }
      onChange && onChange(e, tempFile)
      onError && onError(tempError)
      setFileName(tempFile?.name)
    },
    [fileType]
  )

  return (
    <>
      <div className='upload-file-container'>
        <span className='plus-sign'>+</span>
        <span className='upload-file-label'>
          {(progress && `${parseInt(progress)}%`) || fileName || text}
        </span>
        <input type='file' name='file' onChange={handleChange} />
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
          display: ${fileName ? "none" : "inline-block"};
          color: ${colors.WHITE};
        }
        .upload-file-label {
          font-size: 16px;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: ${fileName
            ? defaultTheme.colors.secondaryBackground
            : colors.WHITE};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: ${fileName ? "block" : "inline-block"};
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
export default FileInput

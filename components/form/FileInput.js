import { useEffect, useState } from "react"

function FileInput() {
  const [image, setImage] = useState(null)
  const [style, setStyle] = useState(["user-form-file-upload-input"])
  const [text, setText] = useState("Add image")

  const handleChange = (e) => {
    e.stopPropagation()
    const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i
    console.log("image  ", e.target.files[0].name)
    allowedExtensions.exec(e.target.files[0].name)
      ? setImage(e.target.files[0].name)
      : console.log("not a image")
  }

  useEffect(() => {
    const css = ["user-form-file-upload-input"]
    let str = "Add image"
    if (image) {
      css.push("hasFile")
      str = image
    }
    setText(str)
    setStyle(css.join(" "))
    return () => {
      setStyle(["user-form-file-upload-input"])
      setText("Add image")
    }
  }, [image])

  return (
    <div className={style}>
      <span className="user-form-file-upload-input-plus-sign">+</span>
      <span className="user-form-file-upload-input-label">{text}</span>
      <input type="file" name="fileInput" onChange={handleChange} />
    </div>
  )
}
export default FileInput

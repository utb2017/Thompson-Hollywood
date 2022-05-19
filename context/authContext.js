import { useState, createContext, useContext, useEffect } from "react"
import { EFFECTS, presetImgObject } from "../helpers"
import { useUser } from "../context/userContext"
import { withRouter } from "next/router"

export const AuthContext = createContext()


export const defaultErrors = {
  address: null,
  role: null,
  displayName: null,
  phoneNumber: null,
  email: null,
  photoURL: null,
  confirmationResult: null,
  code: null,
}

export const defaultForm = {
  address:null,
  coords:null,
  search:'',
  isFocused:false,
  inRange: null,
  role: null,
  displayName: null,
  phoneNumber: null,
  email: null,
  photoURL: null,
  uploadImg:null,
  uploadProgress:null,
  phoneNumberMask: null,
  confirmationResult: {},
  code: null,
  uploading:false,
}
const userPages = ["/user/name","/user/documents/license","/user/email",'/user/code','/sign-in','/'];

const AuthContextComp = ({ children, router }) => {
  const { pathname, push } = router
  const [form, setForm] = useState(defaultForm)
  const [error, setError] = useState(defaultErrors)
  const { user, loadingUser } = useUser()


    useEffect(() => {
        if(form.inRange === false){
        const error = {code:'out-of-range',message:'This address is out of delivery range.'}
        setError(oldErrors=>({...oldErrors,...{address:error}}))      
        }else{
        setError(oldErrors=>({...oldErrors,...{address:null}}))
        }
    }, [form.inRange]);


  useEffect(() => {
    if (!loadingUser) {
      if (user?.uid) {
        const { photoURL, displayName, email } = user
        // if (!displayName) {
        //   Boolean(pathname !== userPages[0]) &&
        //     push({
        //       pathname: userPages[0],
        //     })
        // } else if (!photoURL) {
        //   Boolean(pathname !== userPages[1]) &&
        //     push({
        //       pathname: userPages[1],
        //     })
        // } else
         if(userPages.includes(pathname)) {
            setError(defaultErrors)
            setForm(defaultForm)
            push(`/${user.uid}/overview`)
            // push({
            //   pathname: "/[adminID]/overview",
            //   query: { adminID: user.uid },
            //   as: `/${user.uid}/overview`,
            // })

        }
      } else {
        Boolean(pathname !== "/") &&
          push({
            pathname: "/",
          })
      }
    }
  }, [user, loadingUser])

  return (
    <AuthContext.Provider value={{ form, setForm, error, setError }}>
      {children}
    </AuthContext.Provider>
  )
}
export default withRouter(AuthContextComp)

export const useAuth = () => useContext(AuthContext)


// else {
//   Boolean(pathname !== "/user/email") &&
//     push({
//       pathname: "/[adminID]/",
//       query: { adminID: user.uid },
//     })
// }


// asPath: "/kNRPqLyXvXcQdM7DiUOuGcnD7Jm2/overview"
// back: ƒ ()
// basePath: ""
// beforePopState: ƒ ()
// components: {/[adminID]/overview: {…}, /_app: {…}}
// defaultLocale: undefined
// events: {on: ƒ, off: ƒ, emit: ƒ}
// isFallback: false
// locale: undefined
// locales: undefined
// pathname: "/[adminID]/overview"
// prefetch: ƒ ()
// push: ƒ ()
// query: {adminID: "kNRPqLyXvXcQdM7DiUOuGcnD7Jm2"}
//route: "/[adminID]/overview"

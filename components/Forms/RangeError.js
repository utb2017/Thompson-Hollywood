import ServerError from "./ServerError"
import { useAuth } from "../../context/authContext"
const RangeError = () => {
  const { error } = useAuth()
  return <div style={{marginTop:"16px"}}>{error?.address && <ServerError text={error?.address?.message} />}</div>
}
export default RangeError

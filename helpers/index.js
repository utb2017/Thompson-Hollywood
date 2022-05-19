const EFFECTS = [
  "Anxious",
  "Aroused",
  "Creative",
  "Energetic",
  "Euphoric",
  "Focused",
  "Giggly",
  "Happy",
  "Hungry",
  "Relaxed",
  "Sleepy",
  "Talkative",
  "Tingly",
  "Uplifted",
]

const TOKEN = `pk.eyJ1IjoidGFsbGd1eWh5ZHJvIiwiYSI6ImNrZTExNGIzejJ5NjQydG51M3duZmRkMTkifQ.-iT4qHj-fRqA8aFLHrSUTg`

const GENMOME = ["Sativa", "Hybrid", "Indica", "CBD"]

const imgError = { code: "storage/invalid", message: "Not a valid image." }

const defaultMap = {
  width: "100%",
  height: "100%",
  latitude: 34.103729,
  longitude: -118.328613,
  zoom: 10,
}

const drivingObject = {
  stale: "Stale",
  disconnected: "Disconnected",
  stopped: "Parked",
  moving: "Driving",
}

const drivingIconObject = {
  stale: "help",
  disconnected: "xCircle",
  stopped: "parking",
  moving: "arrowUpSmall",
  received: "bag",
  pending: "bag",
  warning: "bag",
  arrived: "bag",
  cancel: "bag",
  assigned: "bag",
  complete: "bag",
  pickup: "bag",
}

const defaultOrders = {
  active: 0,
  complete: 0,
  cancel: 0,
}

const orderProgressObject = {
  settled: ["settled"],
  received: ["received"],
  cancel: ["cancel"],
  complete: ["complete"],
  paid: ["paid"],
  active: ["received", "pending", "assigned", "pickup", "warning", "arrived"],
  none: [],
  undefined: [],
  null: [],
  false: [],
  "": [],
}
const colorObject = {
  stale: "rgb(228,233,237)",
  disconnected: "rgb(230, 0, 61)",
  stopped: "#00c1de",
  moving: "rgb(0,200,5)",
  received: "rgb(230, 0, 61)",
  pending: "rgb(255,80,0)",
  warning: "#2C384A",
  arrived: "#2C384A",
  cancel: "rgb(230, 0, 61)",
  assigned: "#2C384A",
  complete: "rgb(0,200,5)",
  paid: "rgb(0,200,5)",
  pickup: "#2C384A",
  loading: "rgb(228,233,237)",
}

const PROGRESS = ["received", "pending", "assigned", "pickup", "warning", "arrived", "complete", "paid", "cancel"]
const progressPercent = {
  received: 0,
  pending: 20,
  assigned: 20,
  pickup: 40,
  warning: 60,
  arrived: 80,
  complete: 100,
  cancel: 100,
  paid: 100,
}
const presetImgObject = {
  flower: [
    "https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2Fsquare%2Fstock-flower-square.jpg?alt=media&token=638ed5cc-4af4-46a6-876f-ca1987fa9223",
  ],
  edibles: [
    "https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2Fsquare%2Fstock-edibles-square.jpg?alt=media&token=f22b3b5e-2c42-4858-a6eb-bc6bcbfc5301",
  ],
  vaporizers: [
    "https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2Fsquare%2Fstock-vaporizer-square.jpg?alt=media&token=5abc413c-f441-4254-b939-0e6d762a5f46",
  ],
  cbd: [
    "https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2Fsquare%2Fstock-cbd-square.jpg?alt=media&token=a40de1b8-e3d4-46ac-a72d-ed7726d28063",
  ],
  prerolls: [
    "https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2Fsquare%2Fstock-preroll-square.jpg?alt=media&token=a12ff4e5-3824-4c98-bb67-db7228cab8fc",
  ],
  concentrates: [
    "https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2Fsquare%2Fstock-concentrates-square.jpg?alt=media&token=d259ccf5-6189-4c05-973e-50cc3f725300",
  ],
  accessories: [
    "https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2Fsquare%2Fstock-accessories-square.jpg?alt=media&token=ff2bf3cb-bcc3-436a-adfa-b5d62a29dd36",
  ],
  default: [
    "https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2Fstock-placeholder-blue.png?alt=media&token=fe1924a0-8bff-43f6-858d-b6d5e3e8ff27",
  ],
  license:
    "https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2Fsquare%2Flicense-placeholder.jpg?alt=media&token=ce473b5b-ba13-4ed8-9fd5-3677d01d7aef",
  banner:
    "https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2Fplaceholder-banner.png?alt=media&token=022eae5a-f56f-40ea-993d-49b321070887",
}
const ipad = 919
const ipadConsoleNav = 256
const ipadConsoleInfo = 350
const laptop = 1025
const laptopConsoleNav = 302
const laptopConsoleInfo = 420
const laptopL = 1441
const laptopLConsoleNav = 348
const laptopLConsoleInfo = 480
const fourK = 2561
const fourKConsoleNav = 404
const fourKConsoleInfo = 680
const mobileMapSmall = 260
const getMapSize = (sw, sh) => {
  const screenHeight = sh || window?.innerHeight || 0
  const screenWidth = sw || window?.innerWidth || 0
  const _width =
    screenWidth > fourK
      ? screenWidth - (fourKConsoleInfo + fourKConsoleNav)
      : screenWidth > laptopL
      ? screenWidth - (laptopLConsoleInfo + laptopLConsoleNav)
      : screenWidth > laptop
      ? screenWidth - (laptopConsoleInfo + laptopConsoleNav)
      : screenWidth >= ipad
      ? screenWidth - (ipadConsoleNav + ipadConsoleInfo)
      : screenWidth

  const _height = screenWidth <= ipad ? mobileMapSmall : screenHeight

  return { width: _width, height: _height }
}
function array_move(arr, old_index, new_index) {
  if (new_index >= arr.length) {
    var k = new_index - arr.length + 1
    while (k--) {
      arr.push(undefined)
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0])
  return arr // for testing
}
const capitalize = (s) => {
  if (typeof s !== "string") return ""
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const scrollToRef = (ref) => ref.current.scrollIntoView({ behavior: "smooth", block: "center" })

const isObject = (x) => typeof x === "object"

//const isEmpty = (obj) => Object.keys(obj).length === 0
function isEmpty(value) {
  if (value === "") return true
  if (value === "0") return true
  const type = typeof val
  if ((value !== null && type === "object") || type === "function") {
    const properties = Object.keys(value)
    if (properties.length === 0 || properties.size === 0) {
      return true
    }
  }
  return !value
}
const hasData = (obj) => Object.keys(obj).length > 0

const isObjHasData = (obj) => (isObject(obj) ? hasData(obj) : false)

const normalizeInput = (value, previousValue) => {
  // return nothing if no value
  if (!value) return value
  const strip = value.replace(/^\+[0-9]/, "")
  // only allows 0-9 inputs
  const currentValue = strip.replace(/[^\d]/g, "")
  const cvLength = currentValue.length
  if (!previousValue || value.length > previousValue.length) {
    // returns: "x", "xx", "xxx"
    if (cvLength < 4) return currentValue
    // returns: "(xxx)", "(xxx) x", "(xxx) xx", "(xxx) xxx",
    if (cvLength < 7) return `(${currentValue.slice(0, 3)}) ${currentValue.slice(3)}`
    // returns: "(xxx) xxx-", (xxx) xxx-x", "(xxx) xxx-xx", "(xxx) xxx-xxx", "(xxx) xxx-xxxx"
    return `(${currentValue.slice(0, 3)}) ${currentValue.slice(3, 6)}-${currentValue.slice(6, 10)}`
  }
}

const datesAreOnSameDay = (first, second) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate()

const convertTimestamp = ({ timestamp }) => {
  const today = new Date()
  const yesterday = new Date(today.setDate(today.getDate() - 1))
  const stamp = new Date(timestamp)
  const yesterstamp = new Date(stamp.setDate(stamp.getDate() - 1))

  //return timestamp;
  if (datesAreOnSameDay(today, stamp)) {
    return `Today ${stamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`
  } else if (datesAreOnSameDay(yesterday, yesterstamp)) {
    return `Yesterday ${stamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`
  } else {
    return stamp.toLocaleTimeString([], {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }
}

const injectURL = ({ image_url, injection = "c_pad,g_center,h_58,w_58" }) => {
  const url = image_url.split("/fetch")
  return `${url[0]}/fetch/${injection}${url[1]}`
}
function isValidDate(str) {
  // STRING FORMAT yyyy-mm-dd
  if (str == "" || str == null) {
    return false
  }

  // m[1] is year 'YYYY' * m[2] is month 'MM' * m[3] is day 'DD'
  var m = str.match(/(\d{4})-(\d{2})-(\d{2})/)

  // STR IS NOT FIT m IS NOT OBJECT
  if (m === null || typeof m !== "object") {
    return false
  }

  // CHECK m TYPE
  if (typeof m !== "object" && m !== null && m.size !== 3) {
    return false
  }

  var ret = true //RETURN VALUE
  var thisYear = new Date().getFullYear() //YEAR NOW
  var minYear = 1999 //MIN YEAR

  // YEAR CHECK
  if (m[1].length < 4 || m[1] < minYear || m[1] > thisYear) {
    ret = false
  }
  // MONTH CHECK
  if (m[2].length < 2 || m[2] < 1 || m[2] > 12) {
    ret = false
  }
  // DAY CHECK
  if (m[3].length < 2 || m[3] < 1 || m[3] > 31) {
    ret = false
  }

  return ret
}

const secondsToHms = (seconds) => {
  if (!seconds) return ""

  let duration = seconds
  let hours = duration / 3600
  duration = duration % 3600

  let min = parseInt(duration / 60)
  duration = duration % 60

  let sec = parseInt(duration)

  if (sec < 10) {
    sec = `0${sec}`
  }
  if (min < 10) {
    min = `0${min}`
  }

  if (parseInt(hours, 10) > 0) {
    return `${parseInt(hours, 10)}h ${min}m`
  } else if (min == 0) {
    return `${sec}s`
  } else {
    return `${min}m`
  }
}

const isNum = (x) => {
  const y = 0
  if (x === undefined) return y
  if (x === null) return y
  if (x === NaN) return y
  x = parseFloat(x)
  return isNaN(x) ? y : x
}

const isStr = (x) => {
  const y = ""
  if (x === undefined) return y
  if (x === null) return y
  if (x === NaN) return y
  if (typeof x === "string" || x instanceof String) {
    return x
  } else {
    return y
  }
}

const isCurr = (x) => {
  const y = "$0.00"
  if (!["string", "number"].includes(typeof x)) return y
  if (x === undefined) return y
  if (x === null) return y
  if (x === NaN) return y
  if (isNum(x) > 0) {
    return x.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })
  } else {
    return y
  }
}

const getNumberWithOrdinal = (n) => {
  const s = ["th", "st", "nd", "rd"],
    v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

export {
  EFFECTS,
  TOKEN,
  GENMOME,
  imgError,
  defaultMap,
  drivingObject,
  drivingIconObject,
  defaultOrders,
  orderProgressObject,
  colorObject,
  PROGRESS,
  progressPercent,
  presetImgObject,
  array_move,
  capitalize,
  delay,
  isObject,
  isEmpty,
  hasData,
  isObjHasData,
  normalizeInput,
  scrollToRef,
  datesAreOnSameDay,
  convertTimestamp,
  injectURL,
  secondsToHms,
  getMapSize,
  isValidDate,
  isStr,
  isCurr,
  isNum,
  getNumberWithOrdinal,
}

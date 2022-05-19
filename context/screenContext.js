import { useState, createContext, useContext } from "react"

export const ScreenContext = createContext()

export default function ScreenContextComp({ children, value }) {
  const { themeState, toggleTheme } = value
  const [isDark, setDark] = useState(false)
  //alert(JSON.stringify(value))

  return (
    <ScreenContext.Provider value={{ isDark, setDark, themeState, toggleTheme}}>
      {children}
    </ScreenContext.Provider>
  )
}

export const useScreen = () => useContext(ScreenContext)

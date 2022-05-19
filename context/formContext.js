import { useRouter } from 'next/router'
import {useState, createContext, useContext, useEffect } from 'react'
export const FormContext = createContext()
const defaultMap = {
  latitude: 34.103729,
  longitude: -118.328613,
  zoom: 9,
}
export default function FormContextComp({children}) {
  const [form, setForm] = useState(null)
  const [error, setError] = useState(null)
  const [view, setView] = useState(defaultMap)
  const [loading, setLoading] = useState(false)
  const [isSideOpen, setIsSideOpen] = useState(false);
  const router = useRouter()
  const [announcement, setAnnouncement] = useState(false)
  useEffect(() => {
    setError(null)
    setForm(null)
    setLoading(false)
  }, [router]);
  return (
    <FormContext.Provider value={{form, setForm, error, setError, announcement, setAnnouncement, view, setView, loading, setLoading, isSideOpen, setIsSideOpen}}>
      {children}
    </FormContext.Provider>
  )
}
export const useForm = () => useContext(FormContext)

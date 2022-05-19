import ConsoleLayout from '../../../layouts/ConsoleLayout'
import {useState, createRef, useEffect, useCallback} from 'react'
import {Console, Footer} from '../../../components/Console'
import {useRouting} from '../../../context/routingContext'
import Button from '../../../components/Buttons/Button'
import {useWindowSize} from '../../../hooks/useWindowSize'
import {disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import Spinner from '../../../components/Buttons/Spinner'
import {capitalize} from '../../../helpers'
import {useForm} from '../../../context/formContext'
import {updateFirestore, GeoPoint} from '../../../firebase/clientApp'
import {useUser} from '../../../context/userContext'
import {NotificationManager} from 'react-notifications';
import isEqual from 'lodash.isequal'
import {useMenuSettings} from '../../../context/menuSettingsContext'


import { styled } from "baseui";

const Background = styled("div", ({ $theme }) => {
  return {
    backgroundColor: $theme.colors.backgroundOverlayLight,
  };
});
// import ZonePage from '../../../components/Pages/Settings/Zone'
// import FeesPage from '../../../components/Pages/Settings/Fees'
// import HoursPage from '../../../components/Pages/Settings/Hours'
// import NotificationsPage from '../../../components/Pages/Settings/Notifications'

 

 const ZonePage = dynamic(
    () => import('../../../components/Pages/Settings/Zone'),
    { loading: () => <Background className='nav-loader'><Spinner /></Background> }
 )
 const FeesPage = dynamic(
    () => import('../../../components/Pages/Settings/Fees'),
    { loading: () => <Background className='nav-loader'><Spinner /></Background> }
 )
 const StorePage = dynamic(
    () => import('../../../components/Pages/Settings/Store'),
    { loading: () => <Background className='nav-loader'><Spinner /></Background> }
 )
//  const DiscountsPage = dynamic(
//     () => import('../../../components/Settings/Discounts'),
//     { loading: () => <div className='nav-loader'><Spinner /></div> }
//  )
//  const CollectionsPage = dynamic(
//     () => import('../../../components/Pages/Settings/Collections'),
//     { loading: () => <div className='nav-loader'><Spinner /></div> }
//  )

const HoursPage = dynamic(
  () => import('../../../components/Pages/Settings/Hours'),
  { loading: () => <Background className='nav-loader'><Spinner /></Background> }
)

//  const BrandsPage = dynamic(
//     () => import('../../../components/Pages/Settings/Brands'),
//     { loading: () => <div className='nav-loader'><Spinner /></div> }
//  )
 const NotificationsPage = dynamic(
    () => import('../../../components/Pages/Settings/Notifications'),
    { loading: () => <div className='nav-loader'><Spinner /></div> }
 )

const SettingsRouter = ({settings}) => {
    switch (settings) {
        case 'fees':
          return <FeesPage />
        // case 'discounts':
        //   return <DiscountsPage/>
        // case 'collections':
        //   return <CollectionsPage/>
        // case 'brands':
        //   return <BrandsPage/>        
        case 'hours':
          return <HoursPage/>        
          case 'store':
            return <StorePage/>
        // case 'notifications':
        //   return <NotificationsPage/>
        case 'zone':
          return <ZonePage/>
        default:
          return <div>Error</div>
      }
}

const Settings = () => {
  const {width} = useWindowSize()
  const [loading, setLoading] = useState(false)
  //const scrollRef = createRef(null)
  const { navLoading } = useRouting()
  const router = useRouter()
  const { settings } = router.query
  const {form, setForm, error, setError } = useForm()
  const {zone, fireSettings, fireCollection, fireBrands, user, fireUser} = useUser()
  const {sortableArray} = useMenuSettings()
  const blackList = ["driver"]
  const { setNavLoading } = useRouting()


  useEffect(() => {
    setNavLoading(false)
  }, [router])
  

const settingsLinks = [
  {
    label: 'Store',
    href: '/[adminID]/settings/[settings]',
    as: `/${user?.uid}/settings/store`,
  },
  // {
  //   label: 'Hours',
  //   href: '/[adminID]/settings/[settings]',
  //   as: `/${user?.uid}/settings/hours`,
  // },
  // {
  //   label: 'Collections',
  //   href: '/[adminID]/settings/collections',
  //   as: `/${user?.uid}/settings/collections`,
  // },
  // {
  //   label: 'Brands',
  //   href: '/[adminID]/settings/brands',
  //   as: `/${user?.uid}/settings/brands`,
  // },
  {
    label: 'Zone',
    href: '/[adminID]/settings/[settings]',
    as: `/${user?.uid}/settings/zone`,
  },
  // {
  //   label: 'Notifications',
  //   href: '/[adminID]/settings/[settings]',
  //   as: `/${user?.uid}/settings/notifications`,
  // },
]

// useEffect(() => {
//   disableBodyScroll(scrollRef.current)
//   return () => clearAllBodyScrollLocks()
// }, [scrollRef])



  return (
    <>
      <Console
        id={`${settings}_page`}
        //ref={scrollRef}
        title={` Edit ${capitalize(settings||'')}`}
        links={settingsLinks}>  

        {/* LOADING */}
        {Boolean(fireUser?.status !== 'success') &&  (
          <div className='nav-loader'>
            <Spinner />
          </div>
        )}

        {/* OUTLET */}
        {Boolean(fireUser?.data?.role) && 
         Boolean(!blackList.includes(fireUser?.data?.role || "")) &&  (
          <SettingsRouter {...{settings}}/>
        )}


        {/* DENIED */}
        {Boolean(fireUser?.data?.role) && 
         Boolean(blackList.includes(fireUser?.data?.role || "")
        ) && (
          <div className='nav-denied'>
            <h2>Permision Denied</h2>
          </div>
        )}

      </Console>
    </>
  )
}

Settings.Layout = ConsoleLayout
export default Settings

import {useUser} from '../context/userContext'

const DriversLayout = ({children}) => {
  const {user} = useUser()
  return (
    <div className='max-w-xl mx-auto px-8'>
      <h1 className='text-2xl text-gray-900 font-semibold'>Drivers</h1>

      <div
        className='mt-6 flex overflow-x-auto scrollbar-none'
        style={{boxShadow: 'inset 0 -2px 0 #edf2f7'}}
      />
      <div>{children}</div>
    </div>
  )
}

export default DriversLayout
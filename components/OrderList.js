import {useUser} from '../context/userContext'
import Link from 'next/link'
import colorObject from '../styles/colorObject'

Date.prototype.addHours = function (h) {
  this.setTime(this.getTime() + h * 60 * 60 * 1000)
  return this
}
const OrderList = ({filter}) => {
  const {user, fireOrders, fireSettings} = useUser()
  return (
    <div className='order-list-container'>
      {fireOrders.status === 'success' && fireSettings.status === 'success' ? (
        fireOrders.data.map((x, i) => {
          if (filter.includes(x.progress)) {
            return (
              <Link key={i} href={`/${user?.uid}/orders/selected/${x.id}`}>
                <a className='list-item'>
                  <div
                    style={{borderBottom: '1px solid #ECEFF1'}}
                    className='list-details'>
                    <div className='list-info'>
                      <div className='list-time'>{`#${i + 1} - Today by ${new Date(
                        x.time.start.toDate()
                      )
                        .addHours(fireSettings.data?.waitTime)
                        .toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                        .toLowerCase()}`}</div>
                      <div className='list-address'>{`${
                        x.location.address.split(',')[0]
                      }`}</div>
                      {x.driver?.displayName ? (
                        <div className='list-items'>{x.driver.displayName}</div>
                      ) : (
                        x.cart.items?.length && (
                          <div className='list-items'>{`Item(s): ${x.cart.items?.length}`}</div>
                        )
                      )}
                    </div>
                    <div className='list-progress'>
                      <div
                        style={{backgroundColor: colorObject[x.progress]}}
                        className={`list-current`}>
                        {x.progress}
                      </div>
                    </div>
                  </div>
                </a>
              </Link>
            )
          }
          return
        })
      ) : (
        <>
          <div className='list-item'>
            <div className='list-details'>
              <div className='list-info holder'>
                <div className='list-time width-30'>
                  <wbr />
                </div>
                <div className='list-address'>
                  <wbr />
                </div>
                <div className='list-items width-20'>
                  <wbr />
                </div>
              </div>
              <div className='list-progress'>
                <div className={`list-current loading`}>
                  <wbr />
                </div>
              </div>
            </div>
          </div>
          <div className='list-item'>
            <div className='list-details'>
              <div className='list-info holder'>
                <div className='list-time width-30'>
                  <wbr />
                </div>
                <div className='list-address'>
                  <wbr />
                </div>
                <div className='list-items width-20'>
                  <wbr />
                </div>
              </div>
              <div className='list-progress'>
                <div className={`list-current loading`}>
                  <wbr />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default OrderList

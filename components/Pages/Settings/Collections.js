import ServerError from '../../../components/Forms/ServerError'
import {useState, useEffect, useCallback} from 'react'
import TextField from '../../../components/Forms/TextField'
import {capitalize} from '../../../helpers'
import {useUser} from '../../../context/userContext'
import {useMenuSettings} from '../../../context/menuSettingsContext'
import Button from '../../../components/Buttons/Button'
import {PrimaryPane, FormPane, SidePane, SortableItem, Footer} from '../../../components/Console'
import {useDispatchModal} from '../../../context/modalContext'
import isEqual from 'lodash.isequal'
import {useRouting} from '../../../context/routingContext'
import { isEmpty } from "../../../helpers"
import {NotificationManager} from 'react-notifications';
import {updateFirestore} from '../../../firebase/clientApp'



const CollectionSettings = () => {
  const [serverError, setServerError] = useState(null)
  const [defaultData, setDefaultData] = useState({})
  const [loading, setLoading] = useState(false)
  const { navLoading, setNavLoading } = useRouting()
  const {
    sortableObject,
    setSortableObject,
    sortableArray,
    setSortableArray, 
    sortableComponents,
    setSortableComponents,
    addCollectionItem,
    setAddCollectionItem,
  } = useMenuSettings()
  const {fireCollection} = useUser()

  
  const addNewCollection = useCallback(() => {
    const tempNewArray = sortableArray
    tempNewArray.push(addCollectionItem)
    const tempSortableObject = []
    if (tempNewArray.length) {
      tempNewArray.forEach((collection, index) => {
        tempSortableObject.push({id: `item_${index}`, content: capitalize(collection)})
      })
    }
    setSortableObject(tempSortableObject)
    setSortableArray(tempNewArray)
    setAddCollectionItem(null)
  }, [addCollectionItem, sortableArray])


  useEffect(() => {
    const tempSortableObject = []
    const tempSortableArray = []
    if (fireCollection.length) {
      fireCollection.forEach((collection, index) => {
        tempSortableObject.push({id: `item_${index}`, content: capitalize(collection)})
        tempSortableArray.push(collection)
      })
    }
    setDefaultData(tempSortableObject)
    setSortableObject(tempSortableObject)
    setSortableArray(tempSortableArray)


    return () => {
      setDefaultData({})
      setSortableObject({})
      setSortableArray([])
    }

  }, [fireCollection])

  useEffect(() => {
    const tempSortableComponents = []
    if (sortableObject.length) {
      for (const key in sortableObject) {
        const {id, content} = sortableObject[key]
        tempSortableComponents.push(
          <SortableItem key={key} index={key} id={id} collection={content} />
        )
      }
    }
    setSortableComponents(tempSortableComponents)
  }, [sortableObject])



  const updateCollections = useCallback( async () => {
    setNavLoading(true)
    setLoading(true)
    try {
        await updateFirestore('menu', 'collection', {order:sortableArray})
        NotificationManager.success('Collections updated.');
      }catch (error) {
        if (error?.message) {
          //setServerError(error?.message)
          NotificationManager.error(error?.message)
        } else {
          NotificationManager.error("An error has occurred.")
        }
      } finally {
        setLoading(false)
        setNavLoading(false)
      }
    },[sortableArray, fireCollection])



  return (
    <>
      {/* OUTLET */}
      <PrimaryPane id='settings-collection' reverse={true}>
        {/* FORM */}
        <FormPane>
          <label className='form-card-label'>Collections</label>
          {/* SERVER ERROR */}
          {Boolean(serverError) && <ServerError text={serverError} />}
          {/* COLLECTION LIST */}
          <ul id='collection-list'>{sortableComponents}</ul>
        </FormPane>
        {/* SIDE */}
        <SidePane title='Add Collection'>
          <div className='add-collection-input'>
            <TextField
              id='NewCollection'
              name='NewCollection'
              type='text'
              floatingLabelText='New Collection'
              hintText='Add Collection'
              fullWidth
              onChange={({target: {value}}) => setAddCollectionItem(value)}
              value={addCollectionItem || ''}
            />
          </div>
          <div className='add-collection-button'>
            <Button
              //disabled={loading}
              //loading={loading}
              onClick={addNewCollection}
              text='Add'
            />
          </div>
        </SidePane>
      </PrimaryPane>
      <Footer isShowing={!isEqual({ ...defaultData }, { ...sortableObject })}>
        <Button
          disabled={      
            loading || navLoading || isEqual({ ...defaultData }, { ...sortableObject })
          }
          loading={loading}
          onClick={updateCollections}
          text='Save Changes'
        />
      </Footer>
    </>
  )
}

export default CollectionSettings

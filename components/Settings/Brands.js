import ServerError from '../../components/Forms/ServerError'
import {useState, useEffect,useCallback} from 'react'
import TextField from '../../components/Forms/TextField'
import {capitalize} from '../../helpers'
import {useUser} from '../../context/userContext'
import {useMenuSettings} from '../../context/menuSettingsContext'
import Button from '../../components/Buttons/Button'
import {PrimaryPane, FormPane, SidePane, SortableItem} from '../../components/Console'

const CollectionSettings = () => {
  const [serverError, setServerError] = useState(null)
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

  const {fireBrands} = useUser()



  useEffect(() => {
    const tempSortableObject = []
    const tempSortableArray = []
    if (fireBrands.length) {
      fireBrands.forEach((collection, index) => {
        tempSortableObject.push({id: `item_${index}`, content: capitalize(collection)})
        tempSortableArray.push(collection)
      })
    }
    setSortableObject(tempSortableObject)
    setSortableArray(tempSortableArray)
  }, [fireBrands])
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

  return (
    <>
      {/* OUTLET */}
      <PrimaryPane id='settings-brands' reverse={true}>
        {/* FORM */}
        <FormPane>
          <label className='form-card-label'>Brands</label>
          {/* SERVER ERROR */}
          {Boolean(serverError) && <ServerError text={serverError} />}
          {/* COLLECTION LIST */}
          <ul id='collection-list'>{sortableComponents}</ul>
        </FormPane>
        {/* SIDE */}
        <SidePane title='Add Brand'>
          <div className='add-collection-input'>
            <TextField
              id='newBrand'
              name='newBrand'
              type='text'
              floatingLabelText='New Brand'
              hintText='Add Brand'
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
    </>
  )
}

export default CollectionSettings

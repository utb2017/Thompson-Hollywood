import ServerError from '../../components/Forms/ServerError'
import {useState, useEffect, useCallback} from 'react'
import {TOKEN} from '../../helpers'
import {useUser} from '../../context/userContext'
import ReactMapGL, {FlyToInterpolator} from 'react-map-gl'
import DeckGL from '@deck.gl/react'
import {GeoJsonLayer} from '@deck.gl/layers'
import {useForm} from '../../context/formContext'
import * as d3 from 'd3-ease'
import {polygon} from '@turf/helpers'
import centroid from '@turf/centroid'
import {PrimaryPane, FormPane, SidePane, FileInput} from '../../components/Console'

const polyError = {code: 'invalid-poly', message: 'Unable to find a polygon.'}
const parseError = {
  code: 'invalid-parse',
  message: 'Unable to parse this polygon.',
}
const defaultMap = {
  width: '100%',
  height: '100%',
  latitude: 34.103729,
  longitude: -118.328613,
  zoom: 9,
}

const ZoneSettings = () => {
  const {fireSettings} = useUser()
  const [file, setFile] = useState(false)
  const [view, setView] = useState(defaultMap)
  const {form, setForm, error, setError } = useForm()
  

  const onReaderLoad = useCallback((event) => {
    const obj = JSON.parse(event.target.result)
    if (Boolean(obj?.features[0]?.geometry?.type !== 'Polygon')) {
      return setError({...error, ...{zone:polyError}})
    }
    if (Boolean(obj?.features[0]?.geometry?.coordinates[0])) {
      const zone = obj?.features[0]?.geometry?.coordinates[0]
      centerMap(zone)
      setForm({zone})
    } else {
      return setError({...error, ...{zone:parseError}})
    }
  }, [])
  const centerMap = useCallback((z) => {
    const poly = polygon([z])
    const {coordinates} = centroid(poly).geometry
    setView((oldView) => ({
      ...oldView,
      ...{longitude: coordinates[0], latitude: coordinates[1]},
    }))
  }, [])
  const handleInputError = (e) => {
    if(e){
       return setError({...error, ...{zone:e}})
    }
  }
  const handleFileInputChange = (e,v) => {
    setFile(v)
    setError({...error, ...{zone:false}})
  }


  {/* SET UP FORM */}
  useEffect(() => {
    const tempZone = []
    if (fireSettings?.status === "success" && Boolean(fireSettings?.data)) {
      let { zone } = fireSettings.data
      zone = JSON.parse(JSON.stringify(zone))
      for (const key in zone) {
        const { longitude, latitude } = zone[key]
        tempZone.push([longitude, latitude])
      }
    }
    setForm({zone:tempZone})
  }, [fireSettings])
  {/*On File Change*/}
  useEffect(() => {
    if (file) {
      var reader = new FileReader()
      reader.onload = onReaderLoad
      reader.readAsText(file)
    }
  }, [file])
  {/*Center Map on Zone Change*/}
  useEffect(() => {
    if (Boolean(form.zone) && form.zone.length) {
      centerMap(form.zone)
    }
  }, [form.zone])
  


  return (
    <>
      {/* OUTLET */}
      <PrimaryPane id='settings-zone'>
        {/* FORM */}
        <FormPane noPadding={true}>
          <div className='form-map-container'>
            <ReactMapGL
              mapStyle='mapbox://styles/mapbox/streets-v9'
              mapboxApiAccessToken={TOKEN}
              onViewportChange={setView}
              transitionDuration={1000}
              transitionInterpolator={new FlyToInterpolator()}
              transitionEasing={d3.easeCubic}
              {...view}>
              {(form?.zone && form?.zone.length) ? (
                <DeckGL
                  viewState={view}
                  layers={[
                    new GeoJsonLayer({
                      id: 'geojson-layer',
                      data: {
                        type: 'Feature',
                        geometry: {
                          type: 'Polygon',
                          coordinates: [form.zone],
                        },
                        properties: {
                          name: 'Delivery Range',
                        },
                      },
                      stroked: false,
                      filled: true,
                      lineWidthScale: 20,
                      lineWidthMinPixels: 2,
                      getFillColor: [5, 30, 52, 50],
                      getLineColor: (d) => colorToRGBArray(d.properties.color),
                      getRadius: 100,
                      getLineWidth: 1,
                    }),
                  ]}
                  getTooltip={({object}) =>
                    object && (object.properties.name || object.properties.station)
                  }
                />
              ):<div/>}
            </ReactMapGL>
          </div>    

        </FormPane>
        {/* SIDE */}
        <SidePane title='Add Geojson File'>
          {(error?.zone) && <ServerError style={{width: '100%'}} text={error.zone.message} />}
          <FileInput
            fileType={['geojson']}
            onChange={handleFileInputChange}
            onError={handleInputError}
            text='Add GeoJson'
          />
          <div className='form-preview-label'>
            <a href='https://geojson.io/' target='_blank'>
              Create Geojson file
            </a>
          </div>
        </SidePane>
      </PrimaryPane>
    </>
  )
}

export default ZoneSettings

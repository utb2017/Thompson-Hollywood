
function MapLayout({children, staticMarker}) {
  return (
          <div className='map-container eloutvv5'>
            <div className='css-17taute eeu551e0'>
              <div className='css-5sdfw9 eeu551e1'>
                <div className='css-ooq5aw emqdmf50'>
                  {staticMarker}
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    margin: 0,
                    padding: 0,
                    position: 'relative',
                  }}>
                  {/* MAP HERE */}
                  {children}    
                </div>
              </div>
            </div>
          </div>
  )
}
export default MapLayout

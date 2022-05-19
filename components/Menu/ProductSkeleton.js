

function ProductSkeleton() {
  return (
    <li className="item-card in-cart">
      <div
        style={{
          position: "relative",
          paddingBottom: 16,
          height: "100%",
          overflow: "visible",
        }}
      >

          <div>
            <div className="item-card-contents" >
         
                    <div className='img-wrap' >
                      <div className="shimmerBG img-line"></div>      
                    </div>
                 
              <div className="item-info">
                <div className="item-name item-row" >
              
                    <div style={{flex:1, width:'80%'}}>
                      <div className="shimmerBG title-line"></div>
                      <div className="shimmerBG subtitle-line"></div>
                      <div className="shimmerBG subtitle-line end"></div>        
                    </div>
                
                </div>
              </div>
            </div>
          </div>
      </div>
    </li>
  );
}

export default ProductSkeleton;




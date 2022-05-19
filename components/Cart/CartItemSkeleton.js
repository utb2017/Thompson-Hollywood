

function CartItemSkeleton() {
  return (
    <div className="p-32">
      <div style={{flex:1}} className="shimmerBG image-column"></div>
      <div style={{flex:4}}>
        <div className="shimmerBG title-line"></div>
        <div className="shimmerBG title-line end"></div>        
      </div>
    </div>
  );
}


export default CartItemSkeleton;

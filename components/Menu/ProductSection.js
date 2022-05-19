import { useState, useEffect, useRef } from "react"
import firebase from "../../firebase/clientApp"
import { useUser } from "../../context/userContext"
import ScrollTrack from "../ScrollTrack/ScrollTrack"
import Product from "./Product"
import ProductSkeleton from "./ProductSkeleton"
import { useFirestoreQuery } from "../../hooks/useFirestoreQuery"
import SVGIcon from "../SVGIcon"
import { H3, H4, H5, H6, Paragraph3 } from "baseui/typography"

function ProductSection({ collection, fireFeature, fireDiscounts}) {
  const { user } = useUser()
  // const router = useRouter();
  const elementRef = useRef(null)
  const [load, setLoad] = useState(true)
  const [products, setProducts] = useState(Array.from(Array(5).keys()).map((i) => <ProductSkeleton key={i} />))
  const [loading, setloading] = useState(false)
  const [activeCollection, setActiveCollection] = useState(false)

  const fireCollection = useFirestoreQuery(
    user?.uid &&
      firebase
        .firestore()
        .collection("products")
        .where("collectionIDs", "array-contains", `${collection.id}`)
        .where("inventory", ">", 0)
        //.where("active", "==", true)
        //.orderBy("inventory", "asc")
        //.orderBy("brand", "asc")
        .limit(10)
  )

// useEffect(() => {

//   console.log('fireCollection')
//   console.log(fireCollection)
//   console.log('collection.id')
//   console.log(collection.id)
//   console.log('fireFeature')
//   console.log(fireFeature)
//   console.log('fireDiscounts')
//   console.log(fireDiscounts)



// }, [fireCollection, collection, fireFeature, fireDiscounts]);




  useEffect(() => {

    let productArray = []
    const { data, status, error } = fireCollection
    let z = 0
    if(status==='success' && data){
      for (let k in data) {
        const { inventory, active} = data[k]
          if(inventory > 0 && active){
            delete data[k].key
            console.log("fireProduct 4444")

            console.log(data[k])
            productArray.push( <Product key={`${k}_${data[k].title}`}  {...{fireProduct:data[k]}}   {...{fireCollection}} {...{fireFeature}} {...{fireDiscounts}}/>)
          }
      }
      if(error){
        productArray.push(
          <div>
            <h2>{`${error}`}</h2>
          </div>
        )     
      }
    }

    setProducts(productArray)
  }, [fireCollection, fireFeature, fireDiscounts]);

  // useEffect(() => {
  //   let productArray = []
  //   for (let step = 0; step < 4; step++) {
  //     productArray.push(<ProductSkeleton key={step}/>)
  //   }
  //   setProducts(productArray)
  // }, []);

  return (
    <div className='product-section-primary'>
      <div className='product-section-header'>
        <div>
          <H5> {`${collection?.title || "Untitled"}`}</H5>
          {collection?.description && <Paragraph3>{`${collection?.description || ""}`}</Paragraph3>}
        </div>
        {/* <div className='product-section-see-all'>
          {Boolean(collection?.total) && (
            <>
              {`See All ${collection?.total || ""}`}
              <SVGIcon name='arrowRightSmall' />
            </>
          )}
        </div> */}
      </div>
      <div className='product-section-body'>
        
        <ScrollTrack styles={{ Track: { minHeight: "220px", padding: "10px 0", display:'flex' } }}>{
          <>
            {/* <>{fireCollection.status === 'error' && <pre style={{ whiteSpace:'pre-wrap', padding:'20px'}}>{`${fireCollection?.error?.message||'Error'}`}</pre>}</> */}
            <>{fireCollection.status === 'error' && <textarea className='error-box' defaultValue={`${fireCollection?.error?.message||'Error'}`} />}</>
            <>{fireCollection.status !== 'error' && <>{products}</>}</>
          </>
        
        
        }</ScrollTrack>
      </div>
    </div>
  )
}

export default ProductSection

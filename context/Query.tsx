import { useState, createContext, useContext, useEffect, useCallback } from "react";
import { useFirestoreQuery } from "../hooks/useFirestoreQuery";
import { useUser } from "./userContext";
import firebase from "../firebase/clientApp";
import { isNum } from "../helpers";
import { useRouter } from "next/router";
import { WhereFilterOp } from '@firebase/firestore-types';
//import { DiscountClass } from '../components/Pages/Discount/types';

interface Query {
  data: any;
  status: string;
  error: any;
}
interface QueryValidation {
  firstID: string | null;
  setFirstID(data: string | null): void;
  lastID: string | null;
  setLastID(data: string | null): void;
  reverse: boolean;
  setReverse(data: boolean): void;
  page: number;
  setPage(data: number): void;
  orderBy: string;
  setOrderBy(data: string): void;
  prevPage: () => void;
  nextPage: () => void;
  fireStoreQuery: Query;
  fireStoreQueryTotals: Query;
  fireStoreQueryTotal: number | null;
  disableNext: boolean;
  setDisableNext(data: boolean): void;
  disablePrev: boolean;
  setDisablePrev(data: boolean): void;
  totalsField: string | null;
  setTotalsField(data: string | null): void;
  totalsCollection: string | null;
  setTotalsCollection(data: string | null): void;
  totalsDoc: string | null;
  setTotalsDoc(data: string | null): void;
  totalsSubCollection: [string, string, string] | null;
  setTotalsSubCollection(data: [string, string, string] | null): void;
  //querySubCollectionTotals: [string, string, string, string] | null;
  //setQuerySubCollectionTotals(data: [string, string, string, string] | null): void;
  queryCollection: string | null;
  setQueryCollection(data: string | null): void;
  queryGroupCollection: string | null;
  setQueryGroupCollection(data: string | null): void;
  querySubCollection: [string, string, string] | null;
  setQuerySubCollection(data: [string, string, string] | null): void;
  querySubCollectionDoc: [string, string, string, string] | null;
  setQuerySubCollectionDoc(data: [string, string, string, string] | null): void;
  maxPage: number;
  setMaxPage(data: number): void;
  limit: number;
  setLimit(data: number): void;
  dataList: object[];
  setDataList(data: object[]): void;
  queryLoader: boolean;
  setQueryLoader(data: boolean): void;
  where: [string, WhereFilterOp, string | boolean | number | string[]][] | [];
  setWhere(data: [string, WhereFilterOp, string | boolean | number | string[]][] | []): void;
}
const QueryContext = createContext<QueryValidation>({} as QueryValidation);
//export const QueryContext = createContext()

export default function QueryContextComp({ children }) {
  const router = useRouter();
  const { user, fireCustomer } = useUser();
  const [lastID, setLastID] = useState<string | null>(null);
  const [firstID, setFirstID] = useState<string | null>(null);
  const [reverse, setReverse] = useState<boolean>(false);
  const [queryLoader, setQueryLoader] = useState<boolean>(false);
  const [orderBy, setOrderBy] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(5);
  const [disableNext, setDisableNext] = useState<boolean>(true);
  const [disablePrev, setDisablePrev] = useState<boolean>(true);
  const [maxPage, setMaxPage] = useState<number>(0);
  const [totalsField, setTotalsField] = useState<string | null>(null);
  const [totalsCollection, setTotalsCollection] = useState<string | null>(null);
  const [totalsDoc, setTotalsDoc] = useState<string | null>(null);
  const [queryCollection, setQueryCollection] = useState<string | null>(null);
  const [queryGroupCollection, setQueryGroupCollection] = useState<string | null>(null);
  const [querySubCollection, setQuerySubCollection] = useState<[string, string, string] | null>(null);
  const [querySubCollectionDoc, setQuerySubCollectionDoc] = useState<[string, string, string, string] | null>(null);
  const [totalsSubCollection, setTotalsSubCollection] = useState<[string, string, string] | null>(null);
  const [where, setWhere] = useState<[string, WhereFilterOp, string | boolean | number | string[]][] | []>([]);
  const [dataList, setDataList] = useState<object[]>([]);
  const [ref, setRef] = useState(null);

  const [query, setQuery] = useState(null);
  const [totalQuery, setTotalQuery] = useState(null);
  
  // const fireStoreQueryTotals = useFirestoreQuery(
  //   user?.uid && totalsDoc && totalsCollection && firebase.firestore().collection(totalsCollection).doc(totalsDoc)
  // );
  const fireStoreQuery: Query = useFirestoreQuery(query);
  const fireStoreQueryTotals = useFirestoreQuery(totalQuery);

  useEffect(() => {
    let z:any = null
    if(totalsDoc && totalsSubCollection && totalsSubCollection.length === 3){
      setTotalQuery(firebase.firestore().collection(totalsSubCollection[0]).doc(totalsSubCollection[1]).collection(totalsSubCollection[2]).doc(totalsDoc))
    }else if(totalsDoc && totalsCollection){
      setTotalQuery(firebase.firestore().collection(totalsCollection).doc(totalsDoc))
    }else{
      setTotalQuery(null)
    }
    // return () => {
    //   setTotalQuery(null)
    // };
  }, [totalsSubCollection, totalsCollection, totalsDoc, user, router, fireCustomer]);

  const fireStoreQueryTotal = isNum(fireStoreQueryTotals?.data?.[totalsField]);

  // useEffect(() => {
  //  alert(JSON.stringify('fireStoreQuery'))
  //  alert(JSON.stringify(fireStoreQuery))
  // }, [fireStoreQuery]);


  useEffect(() => {
    console.log(`fireStoreQuery`)
    console.log(fireStoreQuery)
  }, [fireStoreQuery]);

  useEffect(() => {
    let z:any = null
    if(queryCollection){
    // alert(`${queryCollection}`)
      z = firebase.firestore().collection(`${queryCollection}`)
    }
    if(queryGroupCollection){
   //  alert("grpup")
      alert(`${queryGroupCollection}`)
      z = firebase.firestore().collectionGroup(`${queryGroupCollection}`)
    }
    if(querySubCollection && querySubCollection.length === 3){
   //   alert("sub")
      z = firebase.firestore().collection(`${querySubCollection[0]}`).doc(`${querySubCollection[1]}`).collection(`${querySubCollection[2]}`)
    }
    if(querySubCollectionDoc && querySubCollectionDoc.length === 4){
     // alert("sub")
      z = firebase.firestore().collection(`${querySubCollectionDoc[0]}`).doc(`${querySubCollectionDoc[1]}`).collection(`${querySubCollectionDoc[2]}`).doc(`${querySubCollectionDoc[3]}`)
    }



    
    if (( queryCollection || queryGroupCollection || querySubCollection ) && (where || []).length) {
      
   //   alert("where")
      
      where.forEach((y,i)=>{
      // alert("where") 
      z = z.where(`${y[0]}`,y[1], y[2])
      }) 
    }


   // alert(JSON.stringify('z'))
   // console.log(z)


    setRef(z);
    setLastID(null);
    setFirstID(null);
    setPage(1);
    setDisableNext(true);
    setDisablePrev(true);
    setMaxPage(1);
    setReverse(false);
    //setLimit(5)
    return () => {
      // setLimit(5)
      setRef(null)
      setLastID(null);
      setFirstID(null);
      setPage(1);
      setDisableNext(true);
      setDisablePrev(true);
      setMaxPage(1);
      setReverse(false);
      setQuery(null);
    };
  }, [user, router, queryCollection, limit, where, queryGroupCollection, fireCustomer, querySubCollection]);

  useEffect(() => {
    let load = false;
    if (fireStoreQuery?.status === "loading" || fireStoreQuery?.status === "idle") {
      load = true;
    }
    setQueryLoader(load);
    return () => {
      setQueryLoader(false);
    };
  }, [fireStoreQuery]);

  useEffect(() => {
    if (fireStoreQueryTotal > 0) {
      setMaxPage(Math.ceil(fireStoreQueryTotal / limit));
    } else {
      setMaxPage(0);
    }
  }, [fireStoreQueryTotal, limit, router, where]);

  useEffect(() => {
    if (page === maxPage) {
      setDisableNext(true);
    } else {
      setDisableNext(false);
    }
    if(!maxPage){
      setDisableNext(true);
    }
  }, [page, maxPage, router, limit, where]);

  useEffect(() => {
    setDisablePrev(!Boolean(page > 1));
  }, [page, router, limit, where]);

  useEffect(() => {
    if (orderBy) {
      ref && setQuery(ref.orderBy(orderBy, "asc").limit(limit));
    }
  }, [ref, orderBy, limit, where]);

  useEffect(() => {
    //alert(` CONTEXT ${JSON.stringify(fireStoreQuery)}`)
  }, [fireStoreQuery]);
  useEffect(() => {
    //alert(` CONTEXT ${JSON.stringify(fireStoreQueryTotal)}`)
  }, [fireStoreQueryTotal]);

  const nextPage = () => {
    if (orderBy) {
      setReverse(false);
      ///alert(`${lastID}`)
      setQuery(ref.orderBy(orderBy, "asc").startAfter(lastID).limit(limit));
      setPage((p: number) => Number(p) + 1);
    }
  };

  const prevPage = () => {
    if (orderBy) {
      setReverse(true);
      setQuery(ref.orderBy(orderBy, "desc").startAfter(firstID).limit(limit));
      setPage((p: number) => Number(p) - 1);
    }
  };

  useEffect(() => {
    let tempProducts = [];
    let tempIDs = [];
    if (fireStoreQuery?.status === "success" && Boolean(fireStoreQuery?.data)) {
      const { data } = fireStoreQuery;
      for (const key in data) {
        const item = { ...data[key] };
        tempIDs.push(item[orderBy]);
        tempProducts.push(item);
      }
      if (reverse) {
        tempProducts.reverse();
        tempIDs.reverse();
      }
    }
    setFirstID(tempIDs[0]);
    setLastID(tempIDs.pop());
    setDataList(tempProducts);
  }, [fireStoreQuery, limit, where, orderBy]);

  return (
    <QueryContext.Provider
      value={{
        firstID,
        setFirstID,
        lastID,
        setLastID,
        reverse,
        setReverse,
        page,
        setPage,
        orderBy,
        setOrderBy,
        prevPage,
        nextPage,
        fireStoreQuery,
        fireStoreQueryTotals,
        fireStoreQueryTotal,
        disableNext,
        setDisableNext,
        disablePrev,
        setDisablePrev,
        totalsField,
        setTotalsField,
        queryCollection,
        setQueryCollection,
        maxPage,
        setMaxPage,
        limit,
        setLimit,
        dataList,
        setDataList,
        queryLoader,
        setQueryLoader,
        setWhere,
        where,
        totalsCollection,
        setTotalsCollection,
        totalsSubCollection,
        setTotalsSubCollection,
        totalsDoc,
        setTotalsDoc,
        queryGroupCollection, 
        setQueryGroupCollection,
        querySubCollection, 
        setQuerySubCollection,
        querySubCollectionDoc, 
        setQuerySubCollectionDoc,
      }}
    >
      {children}
    </QueryContext.Provider>
  );
}

export const useQuery = () => useContext(QueryContext);

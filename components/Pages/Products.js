import { useState, useEffect, useCallback, useMemo } from "react";
import { useFirestoreQuery } from "../../hooks/useFirestoreQuery";
import firebase from "../../firebase/clientApp";
import { useUser } from "../../context/userContext";
import { useUsers } from "../../context/usersContext";
import Link from "next/link";
import { colors } from "../../styles";
import Spinner from "../../components/Buttons/Spinner";
import Button from "../../components/Buttons/Button";
import { useRouting } from "../../context/routingContext";
import { useRouter } from "next/router";

import {
  TableCell,
  HeaderCell,
  TableRow,
  HeaderRow,
  TableOutlet,
  TableHeader,
  TableContent,
} from "../../components/Table";
import { capitalize, isCurr, isNum } from "../../helpers";
import Select from "../Forms/Select";
import MenuItem from "../Menus/MenuItem";

const DiscountsRow = ({ genome, id, img, inventory, name, brand, price, active = false, filePath }) => {
  const { user } = useUser();
  const [imgURL, setImgURL] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusColor, setStatusColor] = useState(colors.GRAY_74);

  const getImgURL = async (filePath) => {
    if (user?.uid) {
      const storage = user.uid && firebase.storage();
      const storageRef = storage && storage.ref();
      let url =
        "https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2Fstock-placeholder.png?alt=media&token=57d6b3da-4408-4867-beb7-7957669937dd";
      if (typeof filePath === "string" && filePath.length > 0 && storage) {
        try {
          url = await storageRef.child(`${typeof filePath === "string" ? filePath : ""}`).getDownloadURL();
        } catch (e) {
          console.log("error");
          console.log(e);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
      return setImgURL(url);
    }
  };

  useEffect(() => {
    getImgURL(filePath);
  }, [filePath, user]);

  useEffect(() => {
    let color = colors.GRAY_74
    if (active && (inventory >= 10)) {
      color = (colors.GREEN_500)
    } else if (active && (inventory < 10 && inventory >= 1)) {
      color = (colors.DEEP_ORANGE_300)
    } else if (active && (inventory < 1)) {
      color = ('rgb(212, 54, 132)')
    } else {
      color = (colors.GRAY_74)
    }
    setStatusColor(color)
    return () => {
      setStatusColor(colors.GRAY_74)
    };
  }, [active, inventory]);

  return (
    <TableRow key={id} as={`/${user?.uid}/products/edit/${id}`} href={`/[adminID]/products/edit/[id]`}>
      <TableCell
        id="t-active"
        maxWidth={40}
        text={
          <div
            style={{
              height: 10,
              width: 10,
              borderRadius: "100%",
              backgroundColor: statusColor,
            }}
          />
        }
        mobileHide={false}
      />
      <TableCell
        id="t-photoURL"
        img={
          img instanceof Array
            ? img[0]
            : typeof imgURL === "string"
              ? imgURL
              : "https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2Fplaceholder-images-image_large.png?alt=media&token=9dcb7b69-aee4-43ad-9a16-f984510b9703"
        }
        maxWidth={80}
        mobileHide={false}
      />
      <TableCell id="t-user" minWidth={155} flex={2} text={`${name || "No name"}`} mobileHide={false} />
      <TableCell id="t-start" flex={1} text={inventory || "0"} mobileHide={true} />
      <TableCell
        id="t-brand"
        flex={1}
        text={`${typeof brand === "object" && brand.label && typeof brand.label === "string"
            ? brand.label
            : typeof brand === "string"
              ? brand
              : ""
          }`}
        mobileHide={true}
      />
      <TableCell id="t-price" flex={1} text={`${isCurr(price)}`} mobileHide={true} />
    </TableRow>
  );
};
const DiscountsList = ({ fireDiscounts }) => {
  const [products, setProducts] = useState([]);
  const { setLastID, firstID, setFirstID, reverse } = useUsers();
  useEffect(() => {
    let tempProducts = [];
    let tempIDs = [];
    if (Boolean(fireDiscounts?.data)) {
      const { data } = fireDiscounts;
      for (const key in data) {
        const item = { ...data[key] };
        tempIDs.push(item?.id);
        tempProducts.push(<DiscountsRow {...item} key={key} />);
      }
      if (reverse) {
        tempProducts.reverse();
        tempIDs.reverse();
      }
    }
    setFirstID(tempIDs[0]);
    setLastID(tempIDs.pop());
    setProducts(tempProducts);
  }, [fireDiscounts]);
  return products;
};

const Collections = () => {
  const [limit] = useState(5);
  const router = useRouter();
  const { lastID, setLastID, firstID, setFirstID, setReverse } = useUsers();
  const [page, setPage] = useState(1);
  const { user, fireOrders } = useUser();
  const [loading, setLoading] = useState(0);
  //const [collectionTotal, setCollectionTotal] = useState(0)
  const [disableNext, setDisableNext] = useState(true);
  const [disablePrev, setDisablePrev] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState({ label: "All Products", value: "all" });
  const [selectedTotal, setSelectedTotal] = useState(0);
  const [maxPage, setMaxPage] = useState(0);
  const [query, setQuery] = useState(null);
  const [ref, setRef] = useState(null);
  const { setNavLoading } = useRouting();

  const fireProductsTotal = useFirestoreQuery(
    user?.uid && query && firebase.firestore().collection("totals").doc("menu")
  );
  const fireCollections = useFirestoreQuery(user?.uid && firebase.firestore().collection("collections"));
  useEffect(() => {
    if (fireCollections.data) {
      const { data } = fireCollections;
      for (const key in data) {
        const collection = data[key];
        if (selectedCollection.value === collection.key) {
          setSelectedTotal(isNum(collection.total));
        }
      }
    }
  }, [fireCollections, selectedCollection]);

  useEffect(() => {
    if (fireCollections.data) {
      const { data } = fireCollections;
      for (const key in data) {
        const collection = data[key];
        if (router.query?.collection === collection?.id) {
          setSelectedCollection({ label: `${collection?.title}`, value: `${collection?.id}` });
          setSelectedTotal(isNum(collection?.total));
        }
      }
    }
  }, [router]);

  const collectionTotal = router.query.collection === "all" ? isNum(fireProductsTotal?.data?.products) : selectedTotal;

  // useEffect(() => {}, [router, fireDiscounts, fireProductsTotal, collectionTotal, fireCollections, selectedCollection]);

  const fireDiscounts = useFirestoreQuery(query);

  useEffect(() => {
    if (router.query.collection === "all") {
      user?.uid &&
        setRef(
          firebase.firestore().collection(`${"products"}`)
          //.where("sort", "==", router.query.sort)
        );
    } else {
      user?.uid &&
        router.query.collection &&
        setRef(
          firebase
            .firestore()
            .collection(`${"products"}`)
            .where(`collectionIDs`, "array-contains", `${router.query.collection}`)
        );
    }

    setLastID(null);
    setFirstID(null);
    setPage(1);
    setDisableNext(true);
    setDisablePrev(true);
    //setCollectionTotal(0)
    setMaxPage(1);
    setReverse(false);
    return () => {
      setLastID(null);
      setFirstID(null);
      setPage(1);
      setDisableNext(true);
      setDisablePrev(true);
      //setCollectionTotal(0)
      setMaxPage(1);
      setReverse(false);
    };
  }, [user, router]);

  useEffect(() => {
    if (collectionTotal > 0) {
      setMaxPage(Math.ceil(collectionTotal / limit));
    } else {
      setMaxPage(0);
    }
  }, [collectionTotal, limit]);

  useEffect(() => {
    if (page === maxPage) {
      setDisableNext(true);
    } else {
      setDisableNext(false);
    }
  }, [page, maxPage]);

  useEffect(() => {
    setDisablePrev(!Boolean(page > 1));
  }, [page]);

  useEffect(() => {
    ref && setQuery(ref.orderBy("id", "asc").limit(limit));
  }, [ref]);

  const nextPage = useCallback(() => {
    setReverse(false);
    setQuery(ref.orderBy("id", "asc").startAfter(lastID).limit(limit));
    setPage((p) => parseInt(p) + 1);
  }, [lastID, limit]);

  const prevPage = useCallback(() => {
    setReverse(true);
    setQuery(ref.orderBy("id", "desc").startAfter(firstID).limit(limit));
    setPage((p) => parseInt(p) - 1);
  }, [firstID, limit]);

  const handleCreateClick = () => {
    setNavLoading(true);

    //setLoading(true)
    //router.query.sort
  };
  const handleCollectionSelect = (_, res) => {
    console.log(res);
    setSelectedCollection(res);
    router.push(`/${user.uid}/products/${res.value}`);
  };
  return (
    <>
      {/* OUTLET */}
      <TableOutlet>
        <TableHeader>
          <div
            style={{
              display: "flex",
              flex: "wrap",
              width: "100%",
              padding: "8px",
              flexWrap: "wrap",
              flexDirection: "row-reverse",
            }}
          >
            <div style={{ margin: "8px" }}>
              <Link as={`/${user?.uid}/products/create`} href={`/[adminID]/products/create`} scroll={false}>
                <Button
                  onClick={handleCreateClick}
                  loading={loading}
                  disabled={loading}
                  text={`Add Product`}
                  style={{
                    height: '54px',
                    fontSize: "16px",
                    fontWeight: "400",
                  }}
                />
              </Link>
            </div>
            <div style={{ flex: 2, margin: "8px", minWidth: "180px" }}>
              <Select
                // style={styles.field}
                id="sort"
                name="sort"
                floatingLabelText="Collection"
                hintText="ex. Flower"
                fullWidth
                //height={48}
                style={{ maxWidth: "380px" }}
                selectedOption={selectedCollection}
                onSelect={handleCollectionSelect}
              >
                {/* <CollectionList {...{fireCollections}}/> */}
                <MenuItem label={"All Products"} value={`all`} />
                {/* {fireCollections.data && fireCollections.data?.map((x,i)=>
                        <MenuItem  label={`${x?.title||``}`} value={`${x?.key||``}`} />
                      ) } */}
                {fireCollections.data ? (
                  fireCollections.data.map((x) => (
                    <MenuItem
                      id={`suggestion_${x.title}`}
                      key={`suggestion_${x.title}`}
                      label={`${capitalize(x.title)}`}
                      value={`${x.id}`}
                    />
                  ))
                ) : (
                  <></>
                )}
              </Select>
            </div>
          </div>
        </TableHeader>
        {fireDiscounts?.status === "success" && Boolean(fireDiscounts?.data.length > 0) && (
          <>
            {/**/}
            <TableContent>
              <HeaderRow>
                <HeaderCell id="h-type" maxWidth={40} text={""} mobileHide={false} />
                <HeaderCell id="h-type" maxWidth={80} mobileHide={false} />
                <HeaderCell id="h-title" minWidth={155} flex={2} text={"Name"} mobileHide={false} />
                <HeaderCell id="start" flex={1} text={"Inventory"} mobileHide={true} />
                <HeaderCell id="start" flex={1} text={"Brand"} mobileHide={true} />
                <HeaderCell id="end" flex={1} text={"Price"} mobileHide={true} />
              </HeaderRow>
              {/**/}
              <DiscountsList {...{ fireDiscounts }} />
              {/**/}
              {/**/}
            </TableContent>
            {fireDiscounts?.status === "success" && fireDiscounts.data.length > 0 && (
              <div className="card-actions">
                {/**/}
                {/**/}
                {/**/}
                <div className="user-paginator">
                  <div id="mat-paginator" className="mat-paginator">
                    <div className="mat-paginator-outer-container">
                      <div className="mat-paginator-container">
                        {/**/}
                        <div className="mat-paginator-page-size "></div>
                        <div className="mat-paginator-range-actions">
                          <div className="mat-paginator-range-label">
                            {` ${page * limit - limit + 1 || page} - ${page * limit < collectionTotal ? page * limit : collectionTotal
                              } of ${collectionTotal} `}
                          </div>
                          {/* mat-button-disabled */}
                          <button
                            style={{ backgroundColor: "unset" }}
                            onClick={prevPage}
                            className="mat-paginator-navigation-previous mat-focus-indicator mat-tooltip-trigger mat-icon-button mat-button-base"
                            type="button"
                            aria-label="Previous page"
                            disabled={disablePrev}
                          >
                            <span className="mat-button-wrapper">
                              <svg className="mat-paginator-icon" focusable="false" viewBox="0 0 24 24">
                                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                              </svg>
                            </span>
                          </button>
                          <button
                            style={{ backgroundColor: "unset" }}
                            onClick={nextPage}
                            className="mat-paginator-navigation-next mat-focus-indicator mat-tooltip-trigger mat-icon-button mat-button-base"
                            type="button"
                            aria-label="Next page"
                            disabled={disableNext}
                          >
                            <span className="mat-button-wrapper">
                              <svg className="mat-paginator-icon" focusable="false" viewBox="0 0 24 24">
                                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                              </svg>
                            </span>
                          </button>
                          {/**/}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/**/}
                {/**/}
              </div>
            )}
          </>
        )}
        {fireDiscounts?.status === "loading" && (
          <div className="table-spinner-container">
            <Spinner />
          </div>
        )}
        {fireDiscounts?.status === "success" && fireDiscounts?.data?.length === 0 && (
          <div style={{ padding: 32 }} className="table-spinner-container">
            <div className="noResult">No Results</div>
          </div>
        )}
        {fireDiscounts?.status === "error" && fireDiscounts.error && (
          <div style={{ padding: 32 }} className="table-spinner-container">
            <br />
            <h2>Error</h2>
            <br />
            <p style={{ overflowWrap: "anywhere" }}>{`${fireDiscounts.error}`}</p>
          </div>
        )}
      </TableOutlet>
    </>
  );
};

export default Collections;

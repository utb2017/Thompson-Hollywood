import { useState, useEffect, FC, ReactElement } from "react";
import { useDispatchModalBase } from "../../../context/Modal";
import ProductCreate from "./ProductCreate";
import { Button } from "baseui/button";
import { useStyletron } from "baseui";
import { Card } from "baseui/card";
import ProductTable from "./ProductTable";
import { useQuery } from "../../../context/Query";
import { useScreen } from "../../../context/screenContext";
import * as React from "react";
import { KIND } from "baseui/button";
import { Select } from "baseui/select";

import { SIZE } from 'baseui/input';
import { useWindowSize } from "../../../hooks/useWindowSize";
import { useUser } from "../../../context/userContext";
import SVGIcon from "../../SVGIcon";

type Selected = {
  label: string | number | Date;
  value: string | number | Date;
};

class ProductClass {
  active: boolean;
  alert: boolean;
  alertSent: boolean;
  bogoQty?: number;
  code: string;
  collectionIDs: string[];
  collections: Selected[];
  dateEnd?: any;
  dateStart: any;
  days: string[];
  featured: boolean;
  filters: string[] | null;
  id: string;
  method: Selected;
  methodID: "flatRate" | "percent" | "taxFree" | "bogo";
  rate: number;
  recurring: boolean;
  recurringDays: Selected[] | undefined;
  sort: "coupon";
  stackable: boolean;
  title: string | null;
  type: { [k: string]: any } | undefined;
  uid: string | null;
  used: boolean;
  happyHour: boolean;
  startHour: Selected;
  endHour: Selected;
  //queryIDs: string[];

  constructor(
    active: boolean,
    alert: boolean,
    bogoQty: number,
    code: string | null,
    collectionIDs: string[],
    collections: Selected[],
    dateEnd: any | null,
    dateStart: any,
    days: string[],
    featured: boolean,
    id: string | null,
    method: Selected,
    methodID: "flatRate" | "percent" | "taxFree" | "bogo",
    rate: number,
    recurring: boolean,
    recurringDays: Selected[] | undefined,
    //sort: "coupon",
    stackable: boolean,
    title: string | null,
    //type: { [k: string]: any } | undefined,
    uid: string | null,
    used: boolean,
    happyHour: boolean,
    startHour: Selected,
    endHour: Selected
  ) {
    this.active = active || false;
    this.alert = alert || false;
    this.alertSent = false;
    this.bogoQty = bogoQty || 2;
    this.code = code || null;
    this.collectionIDs = collectionIDs || [];
    this.collections = collections || [];
    this.dateEnd = dateEnd || null;
    this.dateStart = dateStart || null;
    this.days = days || [];
    this.featured = featured || false;
    this.filters = [];
    this.id = id || null;
    this.method = method || { label: `Flat rate`, value: "flatRate" };
    this.methodID = methodID || `flatRate`;
    this.rate = rate || null;
    this.recurring = recurring || false;
    this.recurringDays = recurringDays || [];
    this.sort = "coupon";
    this.stackable = stackable || false;
    this.title = title || null;
    this.type = { label: "Coupon", value: "coupon" };
    this.uid = uid || null;
    this.used = used || false;
    this.happyHour = happyHour || false;
    this.startHour = startHour || null;
    this.endHour = endHour || null;
  }
}
interface ProductClassMod extends ProductClass {
  fireProduct: ProductClass;
}
type Query = {
  data: any;
  status: string;
  error: any;
};
interface Params {
  value: any[],
  option: any,
  type: "clear" | 'select'
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
  queryCollection: string | null;
  setQueryCollection(data: string | null): void;
  maxPage: number;
  setMaxPage(data: number): void;
}

const Products: FC = (): ReactElement => {
  const {
    setTotalsField,
    setQueryCollection,
    setLimit,
    setOrderBy,
    setWhere,
    setTotalsCollection,
    setTotalsDoc
  } = useQuery();

  const { themeState } = useScreen();
  const [loading, setLoading] = useState<boolean>(false);
  const { modalBaseDispatch } = useDispatchModalBase();
  const [css, theme] = useStyletron();
  const { width, height } = useWindowSize();
  const [value, setValue] = React.useState([]);
  const [searchCollections, setSearchCollections] = React.useState([]);
  const { user, fireCollections } = useUser();



  useEffect(() => {
    const tempCollectionList = []
    if (fireCollections.data) {
      const { data } = fireCollections;
      //alert(JSON.stringify(data))
      for (const key in data) {
        const collection = data[key];
        tempCollectionList.push({ label: `${collection?.title}`, value: `${collection?.id}` })
        // if (router.query?.collection === collection?.id) {
        //   setSelectedCollection({ label: `${collection?.title}`, value: `${collection?.id}` });
        //   setSelectedTotal(isNum(collection?.total));
        // }
      }
    }
    //alert(JSON.stringify(tempCollectionList))
    setSearchCollections(tempCollectionList)
  }, [fireCollections]);

  /* add shit to the query questions*/
  useEffect(() => {

    setTotalsCollection("totals")
    setTotalsDoc("menu");
    setTotalsField("products");


    setQueryCollection("products");
    setOrderBy("id");

    //setWhere([`collectionIDs`, "array-contains", `${router.query.collection}`])
    setLimit(5);
    return () => {
      setTotalsField(null);
      setTotalsDoc(null);
      setTotalsCollection(null)
      //setQueryGroupCollection(null);
      setQueryCollection(null);
      setLimit(5);
      setOrderBy(null);
      setWhere(null)
      //setValue([])
    };
  }, []);


  useEffect(() => {
    if ((value || []).length === 1) {
      //setWhere([`collectionIDs`, "array-contains", `${router.query.collection}`])
    }
  }, [value]);

  const openModalBase = (component: () => ReactElement, hasSquareBottom: boolean) => {
    modalBaseDispatch({
      type: "MODAL_UPDATE",
      payload: {
        modalBase: {
          isOpen: true,
          key: [],
          component,
          hasSquareBottom,
        },
      },
    });
  };
  const _discountCreate = () => {
    const component: () => ReactElement = () => <ProductCreate />;
    openModalBase(component, true);
  };

  return (
    <>
      <div
        className={css({
          paddingBottom: theme.sizing.scale600,
          paddingRight: theme.sizing.scale800,
          paddingLeft: theme.sizing.scale800,
          paddingTop: theme.sizing.scale800,
          width: "100%",
          "@media (max-width: 450px)": {
            paddingBottom: theme.sizing.scale600,
            paddingRight: theme.sizing.scale600,
            paddingLeft: theme.sizing.scale600,
            paddingTop: theme.sizing.scale600,
          },
        })}
      >

        
        <div
          className={css({
            display: "flex",
            justifyContent: "space-between",
            paddingBottom: theme.sizing.scale600,
          })}
        >
          <div
            className={css({
              maxWidth: '340px',
              width: '100px',
              flex: 'auto',
              minWidth: '160px'
            })}>
            <Select
              size={(width < 375) ? SIZE.compact : SIZE.default}
              options={searchCollections}
              value={value}
              labelKey="label"
              valueKey="value"
              placeholder="Filter collection"
              onChange={({ value, type, option }: Params) => {
                setValue(value)
                if (type === 'select') {
                  // alert([`collectionIDs`, "array-contains", `${option.value}`])
                  setWhere([[`collectionIDs`, "array-contains", `${option.value}`]])
                  setTotalsCollection("collections")
                  setTotalsDoc(`${option.value}`);
                  setTotalsField("total");
                }
                if (type === 'clear') {
                  //alert('clear')
                  setWhere([])
                  setTotalsCollection("totals")
                  setTotalsDoc("menu");
                  setTotalsField("products");
              

                }

              }}
              overrides={{
                SelectArrow: {
                  props: {
                    overrides: {
                      Svg: {
                        component: (props) => <SVGIcon name='sort' />,
                      },
                    }
                  }
                }
              }}
            />
          </div>
          <div
            className={css({
              height: '10px',
              width: '10px',
              flex: '0',
              display: 'flex'
            })} />
          <Button

            size={(width < 375) ? SIZE.compact : SIZE.default}
            kind={themeState?.dark ? KIND.secondary : undefined}
            onClick={_discountCreate}
            isLoading={Boolean(loading)}
            disabled={Boolean(loading)}
          >
            <div
              className={css({
                paddingLeft: theme.sizing.scale200,
                paddingRight: theme.sizing.scale200,
              })}
            >
              Add Product
            </div>
          </Button>
        </div>
      
      
      
        {/* OUTLET */}
        <Card
          overrides={{
            Root: {
              style: ({ $theme }) => ({
                position: "relative",
                display: "block",
                padding: 0,
                width: "100%",
                marginBottom: `0px`
              }),
            },
            Contents: {
              style: ({ $theme }) => ({
                marginBottom: "0px",
                marginRight: "0px",
                marginLeft: "0px",
                marginTop: "0px",
                paddingBottom: "0px",
                paddingRight: "0px",
                paddingLeft: "0px",
                paddingTop: "0px",
              }),
            },
            Body: {
              style: ({ $theme }) => ({
                marginBottom: `0px`
              })
            }

          }}
        >
          <ProductTable />
        </Card>
      </div>
    </>
  );
};

export default Products;

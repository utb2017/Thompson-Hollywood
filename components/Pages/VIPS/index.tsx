import { useState, useEffect, FC, ReactElement } from "react";
import { useDispatchModalBase } from "../../../context/Modal";
import { Button } from "baseui/button";
import { useStyletron } from "baseui";
import { Card } from "baseui/card";
import VIPSTable from "./VIPSTable";
import { useQuery } from "../../../context/Query";
import { useScreen } from "../../../context/screenContext";
import * as React from "react";
import { KIND } from "baseui/button";
import { useRouter } from "next/router";
import { useUser } from "../../../context/userContext";
import { useRouting } from "../../../context/routingContext";
import VIPCreate from "../../Modals/ArrivalVIPcreate";

type Selected = {
  label: string | number;
  value: string | Date;
};

class DiscountClass {
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
interface DiscountClassMod extends DiscountClass {
  fireDiscount: DiscountClass;
}
type Query = {
  data: any;
  status: string;
  error: any;
};

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
const orderProgressObject = {
  'settled': ['settled'],
  'received': ['received'],
  'cancel': ['cancel'],
  'complete': ['complete'],
  'paid': ['paid'],
  'active': ['received', 'pending', 'assigned', 'pickup', 'warning','arrived'],
  'none': [],
  'undefined':[],
  'null':[],
  'false':[],
  '':[],
}
const Orders: FC = (): ReactElement => {
  const {
    setTotalsField,
    setQueryCollection,
    setLimit,
    setOrderBy,
    setTotalsCollection,
    setTotalsDoc,
    setWhere,
    setQueryGroupCollection,

  } = useQuery();

  const { themeState } = useScreen();
  const [loading, setLoading] = useState<boolean>(false);
  const { modalBaseDispatch } = useDispatchModalBase();
  const [css, theme] = useStyletron();
  const router = useRouter()
  const { user } = useUser()
  const {  setNavLoading } = useRouting()



  /* add shit to the query questions*/
  // useEffect(() => {
  //   setTotalsField(`${router?.query?.filter}`);
  //   setTotalsDoc("unsettled");
  //   setTotalsCollection("totals")
    
  //   setQueryGroupCollection("Orders");
  //   setOrderBy("start");
  //   if(router?.query?.filter){
  //     setWhere([["progress", "in", orderProgressObject[`${router?.query?.filter}`] ], ["settled", "==", false]])
  //   }
  //   setLimit(5);
  //   // return () => {
  //   //   setTotalsField(null);
  //   //   setTotalsDoc(null);
  //   //   setTotalsCollection(null)
  //   //   setQueryGroupCollection(null);
  //   //   setQueryCollection(null);
  //   //   setLimit(5);
  //   //   setOrderBy(null);
  //   //   setWhere(null)
  //   // };
  // }, [router]);


  useEffect(() => {
    return () => {
      setTotalsField(null);
      setTotalsDoc(null);
      setTotalsCollection(null)
      setQueryGroupCollection(null);
      setQueryCollection(null);
      setLimit(5);
      setOrderBy(null);
      setWhere(null)
    };
  }, []);

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


  const _VIPCreate = () => {
    const component: () => ReactElement = () => <VIPCreate />;
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
            justifyContent: "right",
            paddingBottom: theme.sizing.scale600,
          })}
        >
          <div>{""}</div>
          <Button
            kind={themeState?.dark ? KIND.secondary : undefined}
            onClick={_VIPCreate}
            isLoading={Boolean(loading)}
            disabled={Boolean(loading)}
          >
            <div
              className={css({
                paddingLeft: theme.sizing.scale600,
                paddingRight: theme.sizing.scale600,
              })}
            >
              Add VIP
            </div>
          </Button>
          <div style={{width:'12px'}} ></div>
          <Button
            kind={themeState?.dark ? KIND.secondary : undefined}
            onClick={_VIPCreate}
            isLoading={Boolean(loading)}
            disabled={Boolean(loading)}
          >
            <div
            >
              Export
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
                marginBottom:`0px`
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
                marginBottom:`0px`
              })
            }
            
          }}
        >
          <VIPSTable />
        </Card>
      </div>
    </>
  );
};

export default Orders;

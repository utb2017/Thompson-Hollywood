import { useState, useEffect, FC, ReactElement } from "react";
import { useDispatchModalBase } from "../../../context/Modal";
import UserCreate from "./modals/UserCreate";
import { Button } from "baseui/button";
import { useStyletron } from "baseui";
import { Card } from "baseui/card";
import CreditTable from "./CreditTable";
import CreateCredit from "./modals/CreateCredit";
import { useQuery } from "../../../context/Query";
import { useScreen } from "../../../context/screenContext";
import * as React from "react";
import { KIND } from "baseui/button";
import {useRouter} from 'next/router'


type Selected = {
  label: string | number;
  value: string | Date;
};

class UserClass {
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
interface UserClassMod extends UserClass {
  fireUser: UserClass;
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

const Users: FC = (): ReactElement => {
  const {
    setTotalsField,
    setQueryCollection,
    setLimit,
    setOrderBy,
    setTotalsCollection,
    setTotalsDoc,
    setWhere,
    setQueryGroupCollection,
    setQuerySubCollection,
    setTotalsSubCollection,
  } = useQuery();

  const { themeState } = useScreen();
  const [loading, setLoading] = useState<boolean>(false);
  const { modalBaseDispatch } = useDispatchModalBase();
  const [css, theme] = useStyletron();
  const router = useRouter()

  /* add shit to the query questions*/
  useEffect(() => {

      
      //setTotalsDoc("users");
     // setTotalsCollection("totals")
      //  alert(`${router.query.id}`)
      setTotalsSubCollection(["users", `${router.query.id}`, 'Totals'])
      setTotalsDoc("cart");
      setTotalsField(`creditTotal`);


      setQuerySubCollection(["users", `${router.query.id}`, 'Credits'])
      setOrderBy("id");
      setLimit(5);

    // return () => {
    //   setTotalsField(null);
    //   setTotalsDoc(null);
    //   setTotalsCollection(null)
    //   //setQueryGroupCollection(null);
    //   setQueryCollection(null);
    //   setLimit(5);
    //   setOrderBy(null);
    //   setWhere(null)
    // };
  }, [router]);


  useEffect(() => {
    return () => {
      setTotalsSubCollection(null)
      setTotalsDoc(null);
      setTotalsField(null);
      setQuerySubCollection(null)
      setOrderBy(null);
      setLimit(5);
      
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
  const _userCreate = () => {
    const component: () => ReactElement = () => <CreateCredit />;
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
          <div>{""}</div>
          <Button
            kind={themeState?.dark ? KIND.secondary : undefined}
            onClick={_userCreate}
            isLoading={Boolean(loading)}
            disabled={Boolean(loading)}
          >
            <div
              className={css({
                paddingLeft: theme.sizing.scale600,
                paddingRight: theme.sizing.scale600,
              })}
            >
              Add Credit
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
          <CreditTable />
        </Card>
      </div>
    </>
  );
};

export default Users;

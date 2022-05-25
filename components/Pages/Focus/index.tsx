import { useState, useEffect, FC, ReactElement } from "react";
import { useDispatchModalBase } from "../../../context/Modal";
import { Button } from "baseui/button";
import { useStyletron } from "baseui";
import { Card } from "baseui/card";
import { useQuery } from "../../../context/Query";
import { useScreen } from "../../../context/screenContext";
import * as React from "react";
import { KIND } from "baseui/button";
import { useRouter } from "next/router";
import { useUser } from "../../../context/userContext";
import { useRouting } from "../../../context/routingContext";
import { styled } from "baseui";

import { ChevronDown } from "baseui/icon";
import { StatefulPopover, PLACEMENT } from "baseui/popover";
import { StatefulMenu } from "baseui/menu";
import { FlexGrid, FlexGridItem } from "baseui/flex-grid";
import { BlockProps } from "baseui/block";
import { Img } from "react-image";
import { H5, Label1 } from "baseui/typography";

const ITEMS = [
  { label: "Item One" },
  { label: "Item Two" },
  { label: "Item Three" },
  { label: "Item Four" },
  { label: "Item Five" },
  { label: "Item Six" },
  { label: "Item Seven" },
  { label: "Item Eight" },
  { label: "Item Nine" },
  { label: "Item Ten" },
  { label: "Item Eleven" },
  { label: "Item Twelve" },
];
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
  settled: ["settled"],
  received: ["received"],
  cancel: ["cancel"],
  complete: ["complete"],
  paid: ["paid"],
  active: ["received", "pending", "assigned", "pickup", "warning", "arrived"],
  none: [],
  undefined: [],
  null: [],
  false: [],
  "": [],
};

const itemProps: BlockProps = {
  backgroundColor: "mono300",
  height: "scale1000",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const titleProps: BlockProps = {
  //backgroundColor: 'mono300',
  height: "scale3200",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const quoteProps: BlockProps = {
  //backgroundColor: 'mono300',
  height: "scale3200",
  display: "flex",
  alignItems: "center",
  justifyContent: "start",
};
const outlookProps: BlockProps = {
  backgroundColor: `rgb(23,55,94)`,
  //height: "scale3200",
  //display: "flex",
  //alignItems: "center",
  width:`100%`,
  //justifyContent: "start",
};
const outlookTitleProps: BlockProps = {
  //height: "scale600",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
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
  const router = useRouter();
  const { user } = useUser();
  const { setNavLoading } = useRouting();

  /* add shit to the query questions*/
  useEffect(() => {
    setTotalsField(`${router?.query?.filter}`);
    setTotalsDoc("unsettled");
    setTotalsCollection("totals");

    setQueryGroupCollection("Orders");
    setOrderBy("start");
    if (router?.query?.filter) {
      setWhere([
        ["progress", "in", orderProgressObject[`${router?.query?.filter}`]],
        ["settled", "==", false],
      ]);
    }
    setLimit(5);
    // return () => {
    //   setTotalsField(null);
    //   setTotalsDoc(null);
    //   setTotalsCollection(null)
    //   setQueryGroupCollection(null);
    //   setQueryCollection(null);
    //   setLimit(5);
    //   setOrderBy(null);
    //   setWhere(null)
    // };
  }, [router]);

  useEffect(() => {
    return () => {
      setTotalsField(null);
      setTotalsDoc(null);
      setTotalsCollection(null);
      setQueryGroupCollection(null);
      setQueryCollection(null);
      setLimit(5);
      setOrderBy(null);
      setWhere(null);
    };
  }, []);

  const openModalBase = (
    component: () => ReactElement,
    hasSquareBottom: boolean
  ) => {
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

  return (
    <>
      <div
        className={css({
          paddingBottom: theme.sizing.scale600,
          paddingRight: theme.sizing.scale800,
          paddingLeft: theme.sizing.scale800,
          paddingTop: theme.sizing.scale200,
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
          <StatefulPopover
            focusLock
            placement={PLACEMENT.bottomLeft}
            content={({ close }) => (
              <StatefulMenu
                items={ITEMS}
                onItemSelect={() => close()}
                overrides={{
                  List: { style: { height: "150px", width: "138px" } },
                }}
              />
            )}
          >
            <Button endEnhancer={() => <ChevronDown size={24} />}>
              Import
            </Button>
          </StatefulPopover>
          <Spacer />
          <Button
            kind={themeState?.dark ? KIND.secondary : undefined}
            onClick={() => {
              router.push(
                `${"/[adminID]/orders/create"}`,
                `/${user?.uid}/orders/create`
              );
              setNavLoading(true);
            }}
            isLoading={Boolean(loading)}
            disabled={Boolean(loading)}
          >
            <div
              className={css({
                paddingLeft: theme.sizing.scale600,
                paddingRight: theme.sizing.scale600,
              })}
            >
              Export
            </div>
          </Button>
        </div>
        {/* OUTLET */}
        <div          style={{
            ...{
              border:`solid 16px rgb(23,55,94)`,
              borderRadius: theme.borders.radius400,
              padding: `${theme.sizing.scale400} ${theme.sizing.scale400}`,

            },
          }}>
        <FlexGrid
          flexGridColumnCount={[1, 1, 2]}
          flexGridColumnGap="scale800"
          flexGridRowGap="scale800"
        >
          <FlexGridItem flexDirection={"column"} {...titleProps}>
            <Img
              src={`https://www.relevantgroup.com/wp-content/uploads/2017/03/TH_Hollywood-crop.jpg`}
              width={`180px`}
            ></Img>
            <div
              style={{
                ...theme.typography.HeadingXSmall,
                ...{
                  backgroundColor: `rgb(23,55,94)`,
                  display: `flex`,
                  justifyContent: `center`,
                  borderRadius: theme.borders.radius200,
                  color: theme.colors.white,
                  padding: `${theme.sizing.scale400} ${theme.sizing.scale1200}`,
                },
              }}
            >
              Mon 11 Apr
            </div>
          </FlexGridItem>
          <FlexGridItem flexDirection={"column"} {...quoteProps}>
            <div
              style={{
                ...theme.typography.HeadingXSmall,
                ...{
                  backgroundColor: `rgb(198,217,241)`,
                  display: `flex`,
                  width: `100%`,
                  justifyContent: `center`,
                  borderRadius: theme.borders.radius200,
                  padding: theme.sizing.scale400,
                },
              }}
            >
              Quote of the Day:
            </div>
            <div
              style={{
                ...theme.typography.MonoLabelMedium,
                ...{ padding: theme.sizing.scale400 },
              }}
            >
              Life's tough, get a helment.
            </div>
          </FlexGridItem>
        </FlexGrid>
        <SpacerH />
        <FlexGrid
          flexGridColumnCount={[1, 1, 2]}
          flexGridColumnGap="scale800"
          flexGridRowGap="scale800"
        >
          <FlexGridItem {...outlookProps}>
            <FlexGrid
              flexGridColumnCount={[3, 3, 3]}

            >
              <FlexGridItem {...outlookTitleProps} flex={`4`}> {``} </FlexGridItem>
              <FlexGridItem {...outlookTitleProps} color={theme.colors.white} flex={`2`}> Today </FlexGridItem>
              <FlexGridItem {...outlookTitleProps} color={theme.colors.white} flex={`2`}> Yesterday </FlexGridItem>
            </FlexGrid>  
          </FlexGridItem>
          <FlexGridItem {...itemProps}>
            <FlexGrid
            flexGridColumnCount={[3, 3, 3]}
          >
            <FlexGridItem {...itemProps}> OUTLOOK 3C </FlexGridItem>
            <FlexGridItem {...itemProps}> WEATHER 2C </FlexGridItem>
            <FlexGridItem {...itemProps}> FORECAST 4C </FlexGridItem>
          </FlexGrid>  
          </FlexGridItem>
          <FlexGridItem {...itemProps}> WEATHER 2C </FlexGridItem>
          <FlexGridItem {...itemProps}> FORECAST 4C </FlexGridItem>
          <FlexGridItem {...itemProps}> SCHEDULE </FlexGridItem>
        </FlexGrid>
        <SpacerH />
        <FlexGrid
          flexGridColumnCount={[1, 1, 1]}
          flexGridColumnGap="scale800"
          flexGridRowGap="scale800"
        >
          <FlexGridItem {...itemProps}> VIP 1C </FlexGridItem>
        </FlexGrid>
        <SpacerH />
        <FlexGrid
          flexGridColumnCount={[1, 1, 1]}
          flexGridColumnGap="scale800"
          flexGridRowGap="scale800"
        >
          <FlexGridItem {...itemProps}> GROUPS 1C </FlexGridItem>
        </FlexGrid>
        <SpacerH />
        <FlexGrid
          flexGridColumnCount={[1, 1, 1]}
          flexGridColumnGap="scale800"
          flexGridRowGap="scale800"
        >
          <FlexGridItem {...itemProps}> EVENTS 1C</FlexGridItem>
        </FlexGrid>
        <SpacerH />
        <FlexGrid
          flexGridColumnCount={[1, 1, 1]}
          flexGridColumnGap="scale800"
          flexGridRowGap="scale800"
        >
          <FlexGridItem {...itemProps}> METRICS 1C</FlexGridItem>
        </FlexGrid>
     </div>
     
      </div>
    </>
  );
};
const Spacer = styled("div", ({ $theme }) => {
  return {
    display: `flex`,
    width: `20px`,
    height: "100%",
  };
});

const SpacerH = styled("div", ({ $theme }) => {
  return {
    display: `flex`,
    width: `100%`,
    height: "24px",
  };
});
export default Orders;

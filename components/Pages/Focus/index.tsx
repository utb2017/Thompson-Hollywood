import { useState, useEffect, FC, ReactElement } from "react";
import { useDispatchModalBase } from "../../../context/Modal";
import { Button, SHAPE, KIND } from "baseui/button";
import { useStyletron } from "baseui";
import { Card } from "baseui/card";
import { useQuery } from "../../../context/Query";
import { useScreen } from "../../../context/screenContext";
import VIPcreate from "../../Modals/ArrivalVIPcreate";
import * as React from "react";
import { useFirestoreQuery } from "../../../hooks/useFirestoreQuery";
import Plus from "baseui/icon/plus";
import { useRouter } from "next/router";
import { useUser } from "../../../context/userContext";
import { useRouting } from "../../../context/routingContext";
import { styled } from "baseui";
import ReactWeather, { useOpenWeather } from "react-open-weather";
import { Input, SIZE } from "baseui/input";
import Quote from "inspirational-quotes";
import { ChevronDown } from "baseui/icon";
import { StatefulPopover, PLACEMENT } from "baseui/popover";
import { StatefulMenu } from "baseui/menu";
import { FlexGrid, FlexGridItem } from "baseui/flex-grid";
import { BlockProps } from "baseui/block";
import { Img } from "react-image";
import { H5, Label1 } from "baseui/typography";
import firebase from "../../../firebase/clientApp";
import { VIPClass } from "../../../classes";
import QueryVIPArrivals from "./QueryVIPArrivals";
import QueryGroupArrivals from "./QueryGroupArrivals";
import QueryUpcomingEvents from "./QueryUpcomingEvents";



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


type QueryVIP = {
  data:[VIPClass];
  status: string;
  error: any;
};


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

const weatherTitleProps: BlockProps = {
  //backgroundColor: `rgb(23,55,94)`,
  //height: "scale1000",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: `100%`,
};
const itemProps: BlockProps = {
  //backgroundColor: "mono300",
  height: "scale800",
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
  //backgroundColor:`rgb(23,55,94)`,
  width: `100%`,
  //padding: `4px`,
};
const outlookTitleProps: BlockProps = {
  //height: "scale600",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: `rgb(23,55,94)`,
};
const outlookSubTitleProps: BlockProps = {
  //height: "scale600",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: `rgb(198,217,241)`,
};
const outlookCellProps: BlockProps = {
  //height: "scale600",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  //backgroundColor: `rgb(198,217,241)`,
  height: `24px`,
};
const weatherCellProps: BlockProps = {
  //height: "scale600",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  //backgroundColor: `rgb(198,217,241)`,
  height: `100%`,
};
const  FakeVipData = [{"id":1,"firstName":"Viola","lastName":"Lutton","arrival":"8/17/2021","notes":"etiam faucibus cursus urna ut","roomNumber":8,"status":null,"departure":"8/24/2021"},
{"id":2,"firstName":"Ashlie","lastName":"Battle","arrival":"4/27/2022","notes":"mauris vulputate elementum nullam varius","roomNumber":77,"status":null,"departure":"12/22/2021"},
{"id":3,"firstName":"Nanny","lastName":"Widdecombe","arrival":"6/22/2021","notes":null,"roomNumber":82,"status":null,"departure":"1/31/2022"},
{"id":4,"firstName":"Claudine","lastName":"Kettel","arrival":"8/20/2021","notes":"suspendisse ornare","roomNumber":80,"status":null,"departure":"6/3/2021"},
{"id":5,"firstName":"Petronia","lastName":"Gabriel","arrival":"5/9/2022","notes":"erat eros viverra eget congue","roomNumber":96,"status":null,"departure":"1/12/2022"}]







const DailyFocus: FC = (): ReactElement => {
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


  const [vips, setVips] = useState<[VIPClass]>(null);



  const [queryVIP, setQueryVIP] = useState(null);
  const [queryTotalVIP, setQueryTotalVIP] = useState(null);
  const fireStoreQueryVIP: QueryVIP = useFirestoreQuery(queryVIP);
  //const fireStoreQueryVIPTotals: QueryTotal = useFirestoreQuery(queryTotalVIP);


  useEffect(() => {
    if(firebase){
      setQueryVIP(firebase.firestore().collection('VIPS'))
      //setQueryTotalVIP(firebase.firestore().collection('Totals').doc('vips'))
    }
    return () => {
      setQueryVIP(null)
    };
  }, [firebase]);

  useEffect(() => {
   console.log('fireStoreQueryVIP')
   console.log(fireStoreQueryVIP)
   if(fireStoreQueryVIP?.data && fireStoreQueryVIP?.data.length){
    setVips(fireStoreQueryVIP.data)
   }else{
    setVips(null)
   }
  }, [fireStoreQueryVIP]);


  
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
  const _VIPcreate = () => {
    const component: () => ReactElement = () => <VIPcreate />;
    openModalBase(component, true);
  };
  const { text, author } = Quote.getQuote();
  const { data, isLoading, errorMessage } = useOpenWeather({
    key: "238fa4fa54496e5d50a9e3afa87bdd2b",
    lat: "34.092808",
    lon: "-118.328659",
    lang: "en",
    unit: "imperial", // values are (metric, standard, imperial)
  });

  let todaysDate: any = new Date();
  let dateForecastOne: any = new Date();
  let dateForecastTwo: any = new Date();
  let dateForecastThree: any = new Date();

  dateForecastOne.setDate(dateForecastOne.getDate() + 1);
  dateForecastTwo.setDate(dateForecastTwo.getDate() + 2);
  dateForecastThree.setDate(dateForecastThree.getDate() + 3);
  dateForecastOne = dateForecastOne.toLocaleDateString("en-us", {
    month: "short",
    day: "numeric",
  });
  dateForecastTwo = dateForecastTwo.toLocaleDateString("en-us", {
    month: "short",
    day: "numeric",
  });
  dateForecastThree = dateForecastThree.toLocaleDateString("en-us", {
    month: "short",
    day: "numeric",
  });
  todaysDate = todaysDate.toLocaleDateString("en-us", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
        <div
          style={{
            ...{
              border: `solid 16px rgb(23,55,94)`,
              borderRadius: theme.borders.radius400,
              padding: `${theme.sizing.scale400} ${theme.sizing.scale400}`,
            },
          }}
        >
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
                {todaysDate}
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
              <QuoteOutput>{text && `${text} - ${author}`}</QuoteOutput>
            </FlexGridItem>
          </FlexGrid>
          <SpacerH />

          <FlexGrid
            flexGridColumnCount={[1, 1, 2]}
            flexGridColumnGap="scale800"
            flexGridRowGap="scale800"
            height={`100%`}
          >
            {/*   OUTLOOK  */}
            <FlexGridItem height={`100%`} {...outlookProps}>
              <div
                style={{
                  ...{
                    border: `solid 10px rgb(23,55,94)`,
                    borderRadius: theme.borders.radius400,
                    //padding: `${theme.sizing.scale400} ${theme.sizing.scale400}`,
                    overflow: `hidden`,
                  },
                }}
              >
                <FlexGrid height={`100%`} flexGridColumnCount={[1, 1, 1]}>
                  <FlexGridItem
                    height={`30px`}
                    {...outlookTitleProps}
                    color={theme.colors.white}
                    flex={`2`}
                  >
                    {" "}
                    Outlook{" "}
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[3, 3, 3]}>
                  <FlexGridItem {...outlookSubTitleProps} flex={`5`}>
                    <OutlookCellTitle> </OutlookCellTitle>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookSubTitleProps}
                    //color={theme.colors.white}
                    flex={`3`}
                  >
                    <OutlookCellTitle>{"Today"}</OutlookCellTitle>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookSubTitleProps}
                    //color={theme.colors.white}
                    flex={`3`}
                  >
                    <OutlookCellTitle>{"Yesterday"}</OutlookCellTitle>
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[3, 3, 3]}>
                  <FlexGridItem {...outlookSubTitleProps} flex={`5`}>
                    <OutlookCell style={{ paddingLeft: `4px` }}>
                      {`Total Occupied Rooms`}
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`3`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`3`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[3, 3, 3]}>
                  <FlexGridItem {...outlookSubTitleProps} flex={`5`}>
                    <OutlookCell style={{ paddingLeft: `4px` }}>
                      {`Forecasted Occupied Rooms`}
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`3`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`3`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[3, 3, 3]}>
                  <FlexGridItem {...outlookSubTitleProps} flex={`5`}>
                    <OutlookCell style={{ paddingLeft: `4px` }}>
                      {`Total Guests`}
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`3`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`3`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[3, 3, 3]}>
                  <FlexGridItem {...outlookSubTitleProps} flex={`5`}>
                    <OutlookCell style={{ paddingLeft: `4px` }}>
                      {`Arrivals`}
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`3`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`3`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[3, 3, 3]}>
                  <FlexGridItem {...outlookSubTitleProps} flex={`5`}>
                    <OutlookCell style={{ paddingLeft: `4px` }}>
                      {`Departures`}
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`3`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`3`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[3, 3, 3]}>
                  <FlexGridItem {...outlookSubTitleProps} flex={`5`}>
                    <OutlookCell style={{ paddingLeft: `4px` }}>
                      {`Occupancy %`}
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`3`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`3`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[3, 3, 3]}>
                  <FlexGridItem {...outlookSubTitleProps} flex={`5`}>
                    <OutlookCell style={{ paddingLeft: `4px` }}>
                      {`Forecasted Occ. %`}
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`3`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`3`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[3, 3, 3]}>
                  <FlexGridItem {...outlookSubTitleProps} flex={`5`}>
                    <OutlookCell style={{ paddingLeft: `4px` }}>
                      {`Vacant Clean/Inspected Rooms`}
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`3`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`3`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[3, 3, 3]}>
                  <FlexGridItem {...outlookSubTitleProps} flex={`5`}>
                    <OutlookCell style={{ paddingLeft: `4px` }}>
                      {`Rate of the day/ ADR`}
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`3`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`3`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[3, 3, 3]}>
                  <FlexGridItem {...outlookSubTitleProps} flex={`5`}>
                    <OutlookCell style={{ paddingLeft: `4px` }}>
                      {`No Show Rooms`}
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`3`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`3`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                </FlexGrid>
              </div>
            </FlexGridItem>
            {/*  WEATHER  */}
            <FlexGridItem width={`100%`} height={`100%`} {...weatherTitleProps}>
              <div
                style={{
                  ...{
                    border: `solid 10px rgb(23,55,94)`,
                    borderRadius: theme.borders.radius400,
                    //padding: `${theme.sizing.scale400} ${theme.sizing.scale400}`,
                    overflow: `hidden`,
                    width: `100%`,
                  },
                }}
              >
                <FlexGrid flexGridColumnCount={[2, 2, 2]} width={`100%`}>
                  <FlexGridItem
                    backgroundColor={`rgb(23,55,94)`}
                    flex={`1`}
                    color={theme.colors.white}
                    {...itemProps}
                    height={`30px`}
                  >
                    {" "}
                    Today{" "}
                  </FlexGridItem>
                  <FlexGridItem
                    backgroundColor={`rgb(23,55,94)`}
                    flex={`1`}
                    color={theme.colors.white}
                    {...itemProps}
                    height={`30px`}
                  >
                    {" "}
                    Tomorrow{" "}
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid flexGridColumnCount={[4, 4, 4]} width={`100%`}>
                  <FlexGridItem
                    height={`24px`}
                    backgroundColor={`rgb(23,55,94)`}
                    flex={`1`}
                    color={theme.colors.white}
                    {...itemProps}
                  >
                    {" "}
                    High{" "}
                  </FlexGridItem>
                  <FlexGridItem
                    height={`24px`}
                    backgroundColor={`rgb(23,55,94)`}
                    flex={`1`}
                    color={theme.colors.white}
                    {...itemProps}
                  >
                    {" "}
                    Low{" "}
                  </FlexGridItem>
                  <FlexGridItem
                    height={`24px`}
                    backgroundColor={`rgb(23,55,94)`}
                    flex={`1`}
                    color={theme.colors.white}
                    {...itemProps}
                  >
                    {" "}
                    High{" "}
                  </FlexGridItem>
                  <FlexGridItem
                    height={`24px`}
                    backgroundColor={`rgb(23,55,94)`}
                    flex={`1`}
                    color={theme.colors.white}
                    {...itemProps}
                  >
                    {" "}
                    Low{" "}
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[4, 4, 4]}>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCell>
                      <LightBlue>
                        {!isLoading && data
                          ? data.forecast[0].temperature.max
                          : `Loading`}
                      </LightBlue>
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCell>
                      <LightBlue>
                        {!isLoading && data
                          ? data.forecast[0].temperature.min
                          : `Loading`}
                      </LightBlue>
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCell>
                      <LightBlue>
                        {!isLoading && data
                          ? data.forecast[1].temperature.max
                          : `Loading`}
                      </LightBlue>
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCell>
                      <LightBlue>
                        {!isLoading && data
                          ? data.forecast[1].temperature.min
                          : `Loading`}
                      </LightBlue>
                    </OutlookCell>
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[2, 2, 2]}>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCell>
                      <LightBlue>
                        {!isLoading && data
                          ? data.forecast[0].description
                          : `Loading`}
                      </LightBlue>
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCell>
                      <LightBlue>
                        {!isLoading && data
                          ? data.forecast[1].description
                          : `Loading`}
                      </LightBlue>
                    </OutlookCell>
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[2, 2, 2]}>
                  <FlexGridItem
                    {...weatherCellProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <WeatherCell>
                      {!isLoading && data ? (
                        <svg
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          width="80"
                          height="80"
                          viewBox="0 -5 35 40"
                        >
                          <title>{data.forecast[0].description}</title>
                          <path d={data.forecast[0].icon}></path>
                        </svg>
                      ) : (
                        `Loading`
                      )}
                    </WeatherCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...weatherCellProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <WeatherCell>
                      {!isLoading && data ? (
                        <svg
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          width="80"
                          height="80"
                          viewBox="0 -5 35 40"
                        >
                          <title>{data.forecast[1].description}</title>
                          <path d={data.forecast[1].icon}></path>
                        </svg>
                      ) : (
                        `Loading`
                      )}
                    </WeatherCell>
                  </FlexGridItem>
                </FlexGrid>
              </div>
            </FlexGridItem>
          </FlexGrid>

          <SpacerH />
          {/*  ROW 3  */}
          <FlexGrid
            flexGridColumnCount={[1, 1, 2]}
            flexGridColumnGap="scale800"
            flexGridRowGap="scale800"
            height={`100%`}
          >
            {/*   FORECAST  */}
            <FlexGridItem height={`100%`} {...outlookProps}>
              <div
                style={{
                  ...{
                    border: `solid 10px rgb(23,55,94)`,
                    borderRadius: theme.borders.radius400,
                    //padding: `${theme.sizing.scale400} ${theme.sizing.scale400}`,
                    overflow: `hidden`,
                  },
                }}
              >
                <FlexGrid height={`100%`} flexGridColumnCount={[1, 1, 1]}>
                  <FlexGridItem
                    height={`30px`}
                    {...outlookTitleProps}
                    color={theme.colors.white}
                    flex={`2`}
                  >
                    {" "}
                    3-Day Forecast{" "}
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[4, 4, 4]}>
                  <FlexGridItem {...outlookSubTitleProps} flex={`1`}>
                    <OutlookCellTitle>{` `}</OutlookCellTitle>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookSubTitleProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCellTitle>{`${dateForecastOne}`}</OutlookCellTitle>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookSubTitleProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCellTitle>{`${dateForecastTwo}`}</OutlookCellTitle>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookSubTitleProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCellTitle>{`${dateForecastThree}`}</OutlookCellTitle>
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[4, 4, 4]}>
                  <FlexGridItem {...outlookSubTitleProps} flex={`1`}>
                    <OutlookCell style={{ paddingLeft: `4px` }}>
                      {`Arrivals`}
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[4, 4, 4]}>
                  <FlexGridItem {...outlookSubTitleProps} flex={`1`}>
                    <OutlookCell style={{ paddingLeft: `4px` }}>
                      {`Departures`}
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[4, 4, 4]}>
                  <FlexGridItem {...outlookSubTitleProps} flex={`1`}>
                    <OutlookCell style={{ paddingLeft: `4px` }}>
                      {`Total Guests`}
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[4, 4, 4]}>
                  <FlexGridItem {...outlookSubTitleProps} flex={`1`}>
                    <OutlookCell style={{ paddingLeft: `4px` }}>
                      {`Occ Rooms`}
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[4, 4, 4]}>
                  <FlexGridItem {...outlookSubTitleProps} flex={`1`}>
                    <OutlookCell style={{ paddingLeft: `4px` }}>
                      {`Occupancy % `}
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[4, 4, 4]}>
                  <FlexGridItem {...outlookSubTitleProps} flex={`1`}>
                    <OutlookCell style={{ paddingLeft: `4px` }}>
                      {`Forecasted Occ. %`}
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[4, 4, 4]}>
                  <FlexGridItem {...outlookSubTitleProps} flex={`1`}>
                    <OutlookCell style={{ paddingLeft: `4px` }}>
                      {`ADR`}
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCell>
                      <InputCell></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                </FlexGrid>
              </div>
            </FlexGridItem>
            {/*  SCHEDULE  */}
            <FlexGridItem width={`100%`} height={`100%`} {...weatherTitleProps}>
              <div
                style={{
                  ...{
                    border: `solid 10px rgb(23,55,94)`,
                    borderRadius: theme.borders.radius400,
                    //padding: `${theme.sizing.scale400} ${theme.sizing.scale400}`,
                    overflow: `hidden`,
                    width: `100%`,
                  },
                }}
              >
                <FlexGrid flexGridColumnCount={[1, 1, 1]} width={`100%`}>
                  <FlexGridItem
                    backgroundColor={`rgb(23,55,94)`}
                    flex={`1`}
                    color={theme.colors.white}
                    {...itemProps}
                    height={`30px`}
                  >
                    {" "}
                    Lead Schedule{" "}
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[2, 2, 2]}>
                  <FlexGridItem {...outlookSubTitleProps} flex={`1`}>
                    <OutlookCell style={{ paddingLeft: `4px` }}>
                      {`AM:`}
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`3`}
                  >
                    <OutlookCell>
                      <InputCell textAlign="left"></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[2, 2, 2]}>
                  <FlexGridItem {...outlookSubTitleProps} flex={`1`}>
                    <OutlookCell style={{ paddingLeft: `4px` }}>
                      {`PM:`}
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`3`}
                  >
                    <OutlookCell>
                      <InputCell textAlign="left"></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[2, 2, 2]}>
                  <FlexGridItem {...outlookSubTitleProps} flex={`1`}>
                    <OutlookCell style={{ paddingLeft: `4px` }}>
                      {`ON:`}
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`3`}
                  >
                    <OutlookCell>
                      <InputCell textAlign="left"></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid flexGridColumnCount={[1, 1, 1]} width={`100%`}>
                  <FlexGridItem
                    backgroundColor={`rgb(23,55,94)`}
                    flex={`1`}
                    color={theme.colors.white}
                    {...itemProps}
                    height={`24px`}
                  >
                    {" "}
                    Security Schedule{" "}
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[2, 2, 2]}>
                  <FlexGridItem {...outlookSubTitleProps} flex={`1`}>
                    <OutlookCell style={{ paddingLeft: `4px` }}>
                      {`Manager:`}
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`3`}
                  >
                    <OutlookCell>
                      <InputCell textAlign="left"></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[2, 2, 2]}>
                  <FlexGridItem {...outlookSubTitleProps} flex={`1`}>
                    <OutlookCell style={{ paddingLeft: `4px` }}>
                      {`AM:`}
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`3`}
                  >
                    <OutlookCell>
                      <InputCell textAlign="left"></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[2, 2, 2]}>
                  <FlexGridItem {...outlookSubTitleProps} flex={`1`}>
                    <OutlookCell style={{ paddingLeft: `4px` }}>
                      {`PM:`}
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`3`}
                  >
                    <OutlookCell>
                      <InputCell textAlign="left"></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[2, 2, 2]}>
                  <FlexGridItem {...outlookSubTitleProps} flex={`1`}>
                    <OutlookCell style={{ paddingLeft: `4px` }}>
                      {`ON:`}
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookCellProps}
                    //color={theme.colors.white}
                    flex={`3`}
                  >
                    <OutlookCell>
                      <InputCell textAlign="left"></InputCell>
                    </OutlookCell>
                  </FlexGridItem>
                </FlexGrid>
              </div>
            </FlexGridItem>
          </FlexGrid>
          <SpacerH />
  {/*   VIP ARRIVALS  */}
          
          <FlexGrid
            flexGridColumnCount={[1, 1, 1]}
            flexGridColumnGap="scale800"
            flexGridRowGap="scale800"
          >
                      
                        <FlexGridItem height={`100%`} {...outlookProps}>
              <div
                style={{
                  ...{
                    border: `solid 10px rgb(23,55,94)`,
                    borderRadius: theme.borders.radius400,
                    //padding: `${theme.sizing.scale400} ${theme.sizing.scale400}`,
                    overflow: `hidden`,
                  },
                }}
              >
                <FlexGrid height={`100%`} flexGridColumnCount={[1, 1, 1]}>
                  <FlexGridItem
                    height={`30px`}
                    {...outlookTitleProps}
                    color={theme.colors.white}
                    flex={`2`}
                  >
                    {" "}
                    VIP Arrivals{" "}
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[7, 7, 7]}>
                  <FlexGridItem {...outlookSubTitleProps} flex={`2`}>
                    <OutlookCellTitle>{` Last Name & First  `}</OutlookCellTitle>
                  </FlexGridItem>
                  <FlexGridItem {...outlookSubTitleProps} flex={`1`}>
                    <OutlookCellTitle>{` Room `}</OutlookCellTitle>
                  </FlexGridItem>
                  <FlexGridItem {...outlookSubTitleProps} flex={`1`}>
                    <OutlookCellTitle>{` Arrival `}</OutlookCellTitle>
                  </FlexGridItem>
                  <FlexGridItem {...outlookSubTitleProps} flex={`1`}>
                    <OutlookCellTitle>{` Departure `}</OutlookCellTitle>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookSubTitleProps}
                    //color={theme.colors.white}
                    flex={`3`}
                  >
                    <OutlookCellTitle>{` Notes `}</OutlookCellTitle>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookSubTitleProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCellTitle>{` Rate/Code `}</OutlookCellTitle>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookSubTitleProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCellTitle>{` Type of VIP `}</OutlookCellTitle>
                  </FlexGridItem>
                </FlexGrid>


                <QueryVIPArrivals/>

                



              </div>
            </FlexGridItem>
          </FlexGrid>

          <CenterLineBox>
            <CenterLine/>
            <Button
              onClick={() => _VIPcreate()}
              shape={SHAPE.circle}
              kind={KIND.tertiary}
              size={SIZE.compact}
              overrides={{
                BaseButton: {
                  style: ({ $theme }) => ({
                    border: `solid 4px rgb(23,55,94)`
                  })
                }
              }}
            >
             
               <Plus color="rgb(23,55,94)" size={56} />
            </Button>
          </CenterLineBox>



          <SpacerH />










  {/*   GROUP ARRIVALS  */}
          <FlexGrid
            flexGridColumnCount={[1, 1, 1]}
            flexGridColumnGap="scale800"
            flexGridRowGap="scale800"
          >
                      
                        <FlexGridItem height={`100%`} {...outlookProps}>
              <div
                style={{
                  ...{
                    border: `solid 10px rgb(23,55,94)`,
                    borderRadius: theme.borders.radius400,
                    //padding: `${theme.sizing.scale400} ${theme.sizing.scale400}`,
                    overflow: `hidden`,
                  },
                }}
              >
                <FlexGrid height={`100%`} flexGridColumnCount={[1, 1, 1]}>
                  <FlexGridItem
                    height={`30px`}
                    {...outlookTitleProps}
                    color={theme.colors.white}
                    flex={`2`}
                  >
                    {" "}
                    Group Arrivals{" "}
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[7, 7, 7]}>
                  <FlexGridItem {...outlookSubTitleProps} flex={`2`}>
                    <OutlookCellTitle>{` Last Name & First  `}</OutlookCellTitle>
                  </FlexGridItem>
                  <FlexGridItem {...outlookSubTitleProps} flex={`1`}>
                    <OutlookCellTitle>{` Room `}</OutlookCellTitle>
                  </FlexGridItem>
                  <FlexGridItem {...outlookSubTitleProps} flex={`1`}>
                    <OutlookCellTitle>{` Arrival `}</OutlookCellTitle>
                  </FlexGridItem>
                  <FlexGridItem {...outlookSubTitleProps} flex={`1`}>
                    <OutlookCellTitle>{` Departure `}</OutlookCellTitle>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookSubTitleProps}
                    //color={theme.colors.white}
                    flex={`3`}
                  >
                    <OutlookCellTitle>{` Notes `}</OutlookCellTitle>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookSubTitleProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCellTitle>{` Rate/Code `}</OutlookCellTitle>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookSubTitleProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCellTitle>{` Type of VIP `}</OutlookCellTitle>
                  </FlexGridItem>
                </FlexGrid>


                <QueryGroupArrivals/>

                



              </div>
            </FlexGridItem>
          </FlexGrid>

<CenterLineBox>
  <CenterLine/>
  <Button
    onClick={() => alert("click")}
    shape={SHAPE.circle}
    kind={KIND.tertiary}
    size={SIZE.compact}
    overrides={{
      BaseButton: {
        style: ({ $theme }) => ({
          border: `solid 4px rgb(23,55,94)`
        })
      }
    }}
  >
   
     <Plus color="rgb(23,55,94)" size={56} />
  </Button>
</CenterLineBox>
          <SpacerH />
  {/*   EVENT ARRIVALS  */}
          <FlexGrid
            flexGridColumnCount={[1, 1, 1]}
            flexGridColumnGap="scale800"
            flexGridRowGap="scale800"
          >
                      
                        <FlexGridItem height={`100%`} {...outlookProps}>
              <div
                style={{
                  ...{
                    border: `solid 10px rgb(23,55,94)`,
                    borderRadius: theme.borders.radius400,
                    //padding: `${theme.sizing.scale400} ${theme.sizing.scale400}`,
                    overflow: `hidden`,
                  },
                }}
              >
                <FlexGrid height={`100%`} flexGridColumnCount={[1, 1, 1]}>
                  <FlexGridItem
                    height={`30px`}
                    {...outlookTitleProps}
                    color={theme.colors.white}
                    flex={`2`}
                  >
                    {" "}
                    Event Outlook{" "}
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[7, 7, 7]}>
                  <FlexGridItem {...outlookSubTitleProps} flex={`2`}>
                    <OutlookCellTitle>{` Last Name & First  `}</OutlookCellTitle>
                  </FlexGridItem>
                  <FlexGridItem {...outlookSubTitleProps} flex={`1`}>
                    <OutlookCellTitle>{` Room `}</OutlookCellTitle>
                  </FlexGridItem>
                  <FlexGridItem {...outlookSubTitleProps} flex={`1`}>
                    <OutlookCellTitle>{` Arrival `}</OutlookCellTitle>
                  </FlexGridItem>
                  <FlexGridItem {...outlookSubTitleProps} flex={`1`}>
                    <OutlookCellTitle>{` Departure `}</OutlookCellTitle>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookSubTitleProps}
                    //color={theme.colors.white}
                    flex={`3`}
                  >
                    <OutlookCellTitle>{` Notes `}</OutlookCellTitle>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookSubTitleProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCellTitle>{` Rate/Code `}</OutlookCellTitle>
                  </FlexGridItem>
                  <FlexGridItem
                    {...outlookSubTitleProps}
                    //color={theme.colors.white}
                    flex={`1`}
                  >
                    <OutlookCellTitle>{` Type of VIP `}</OutlookCellTitle>
                  </FlexGridItem>
                </FlexGrid>


               <QueryUpcomingEvents/>



              </div>
            </FlexGridItem>
          </FlexGrid>

<CenterLineBox>
  <CenterLine/>
  <Button
    onClick={() => _VIPcreate()}
    shape={SHAPE.circle}
    kind={KIND.tertiary}
    size={SIZE.compact}
    overrides={{
      BaseButton: {
        style: ({ $theme }) => ({
          border: `solid 4px rgb(23,55,94)`
        })
      }
    }}
  >
   
     <Plus color="rgb(23,55,94)" size={56} />
  </Button>
</CenterLineBox>
          <SpacerH />
         
         

        </div>
      </div>
    </>
  );
};
const CenterLine = styled("div", ({ $theme }) => {
  return {
    display: `flex`,
    width: `3px`,
    height: "40px",
    backgroundColor: "rgb(23,55,94)",
    //justifyContent: "center",
    //alignContent: "center",
    //alignItems: "center",
  };
});
const CenterLineBox = styled("div", ({ $theme }) => {
  return {
    display: `flex`,
    width: `100%`,
    height: "56px",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    flexDirection:'column'
  };
});
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
 
const LightBlue = styled("div", ({ $theme }) => {
  return {
    display: `flex`,
    width: `100%`,
    height: "100%",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    backgroundColor: "rgb(198,217,241)",
  };
});
const QuoteOutput = styled("div", ({ $theme }) => {
  return {
    ...$theme.typography.MonoLabelMedium,
    ...{
      display: `flex`,
      width: `100%`,
      height: "100%",
      justifyContent: "center",
      alignContent: "center",
      alignItems: "center",
      textAlign: "center",
      //backgroundColor: "rgb(198,217,241)",
      padding: $theme.sizing.scale400,
    },
  };
});

const VIPCell = styled("div", ({ $theme }) => {
  return {
    borderRight: `solid 1px rgb(23,55,94)`,
    borderBottom: `solid 1px rgb(23,55,94)`,
    overflow: `hidden`,
    width: `100%`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: $theme.sizing.scale500,
    fontWeight: "500",
    lineHeight: $theme.sizing.scale600,
    height: $theme.sizing.scale1200,
    alignText:'center'
    //backgroundColor:'red'
    //paddingLeft: $theme.sizing.scale100,
  };
});

const OutlookCell = styled("div", ({ $theme }) => {
  return {
    borderRight: `solid 1px rgb(23,55,94)`,
    borderBottom: `solid 1px rgb(23,55,94)`,
    overflow: `hidden`,
    width: `100%`,
    display: "flex",
    alignItems: "center",
    justifyContent: "left",
    fontSize: $theme.sizing.scale500,
    fontWeight: "500",
    lineHeight: $theme.sizing.scale600,
    height: $theme.sizing.scale800,
    //paddingLeft: $theme.sizing.scale100,
  };
});

const WeatherCell = styled("div", ({ $theme }) => {
  return {
    borderRight: `solid 1px rgb(23,55,94)`,
    borderBottom: `solid 1px rgb(23,55,94)`,
    overflow: `hidden`,
    width: `100%`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: $theme.sizing.scale500,
    fontWeight: "500",
    lineHeight: $theme.sizing.scale600,
    height: `192px`,
    //paddingLeft: $theme.sizing.scale100,
  };
});
const OutlookCellTitle = styled("div", ({ $theme }) => {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRight: `solid 1px rgb(23,55,94)`,
    borderBottom: `solid 1px rgb(23,55,94)`,
    //overflow: `hidden`,
    width: `100%`,
    height: $theme.sizing.scale800,
    textAlign: `center`,
    fontSize: $theme.sizing.scale500,
    fontWeight: "500",
    lineHeight: $theme.sizing.scale600,
  };
});
interface TestProps {
  textAlign?: 'center' | 'left';
  id?: string;
}
const InputCell = ({textAlign = 'center', id = 'McGee'}: TestProps) => {
  const [value, setValue] = React.useState("");

  const [isActive, setIsActive] = useState(false);
  return (
    <Input
      value={value}
      onFocus={() => setIsActive(true)}
      onBlur={() => setIsActive(false)}
      onChange={(event) => setValue(event.currentTarget.value)}
      size={SIZE.mini}
      placeholder=""
      clearOnEscape
      overrides={{
        Root: {
          style: ({ $theme }) => ({
            borderColor: isActive
              ? `rgb(23,55,94)`
              : $theme.colors.contentInversePrimary,
            height: `23px`,
          }),
        },
        Input: {
          style: ({ $theme }) => ({
            textAlign: textAlign,
          }),
        },
        InputContainer: {
          style: ({ $theme }) => ({
            backgroundColor: $theme.colors.contentInversePrimary,
          }),
        },
      }}
    />
  );
};
export default DailyFocus;

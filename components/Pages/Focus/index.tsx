import { useState, useEffect, FC, ReactElement } from "react";
import { useDispatchModalBase } from "../../../context/Modal";
import { Button, SHAPE, KIND } from "baseui/button";
import { useStyletron } from "baseui";
import { Card } from "baseui/card";
import { useQuery } from "../../../context/Query";
import { useScreen } from "../../../context/screenContext";
import VIPcreate from "../../Modals/VIPcreate";
import * as React from "react";
import { useFirestoreQuery } from "../../../hooks/useFirestoreQuery";
import Plus from "baseui/icon/plus";
import { useRouter } from "next/router";
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
import firebase, { mergeFirestore, updateFirestore } from "../../../firebase/clientApp";
import { VIPClass } from "../../../classes";
import QueryVIPArrivals from "./QueryVIPArrivals";
import QueryGroupArrivals from "./QueryGroupArrivals";
import QueryUpcomingEvents from "./QueryUpcomingEvents";
import { useUser } from "../../../context/Auth";

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
  data: [VIPClass];
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
  width: `100%`,
};
const outlookSubTitleProps: BlockProps = {
  //height: "scale600",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: `rgb(198,217,241)`,
  width: `100% !important`,
};
const socialMediaCell: BlockProps = {
  //height: "scale600",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: `100%`,
  //backgroundColor: `rgb(198,217,241)`,
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
const FakeVipData = [
  {
    id: 1,
    firstName: "Viola",
    lastName: "Lutton",
    arrival: "8/17/2021",
    notes: "etiam faucibus cursus urna ut",
    roomNumber: 8,
    status: null,
    departure: "8/24/2021",
  },
  {
    id: 2,
    firstName: "Ashlie",
    lastName: "Battle",
    arrival: "4/27/2022",
    notes: "mauris vulputate elementum nullam varius",
    roomNumber: 77,
    status: null,
    departure: "12/22/2021",
  },
  {
    id: 3,
    firstName: "Nanny",
    lastName: "Widdecombe",
    arrival: "6/22/2021",
    notes: null,
    roomNumber: 82,
    status: null,
    departure: "1/31/2022",
  },
  {
    id: 4,
    firstName: "Claudine",
    lastName: "Kettel",
    arrival: "8/20/2021",
    notes: "suspendisse ornare",
    roomNumber: 80,
    status: null,
    departure: "6/3/2021",
  },
  {
    id: 5,
    firstName: "Petronia",
    lastName: "Gabriel",
    arrival: "5/9/2022",
    notes: "erat eros viverra eget congue",
    roomNumber: 96,
    status: null,
    departure: "1/12/2022",
  },
];

interface Query {
  data: any;
  status: string;
  error: any;
}
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
  //sconst { user } = useUser();
  const { setNavLoading } = useRouting();

  const [vips, setVips] = useState<[VIPClass]>(null);

  const { loadingUser } = useUser()
  const [queryVIP, setQueryVIP] = useState(null);
  const [queryTotalVIP, setQueryTotalVIP] = useState(null);
  const [dateState, setDateState] = useState(false);
  const fireStoreQueryVIP: QueryVIP = useFirestoreQuery(queryVIP);

  // const fireStoreQueryForecast = useFirestoreQuery(firebase && firebase.firestore().collection(`${router?.query?.property}_Forecast`));
  // useEffect(() => {
  //   console.log('fireStoreQueryForecast');
  //   console.log(fireStoreQueryForecast);
  // }, [fireStoreQueryForecast]);
  useEffect(() => {
    if (firebase) {
      setQueryVIP(firebase.firestore().collection("VIPS"));
      //setQueryTotalVIP(firebase.firestore().collection('Totals').doc('vips'))
    }
    return () => {
      setQueryVIP(null);
    };
  }, [firebase]);

  useEffect(() => {
    console.log("fireStoreQueryVIP");
    console.log(fireStoreQueryVIP);
    if (fireStoreQueryVIP?.data && fireStoreQueryVIP?.data.length) {
      setVips(fireStoreQueryVIP.data);
    } else {
      setVips(null);
    }
  }, [fireStoreQueryVIP]);
const rqp = router?.query?.property as "LAXTH" | "LAXTE";
  const fireStoreQuery: Query = useFirestoreQuery(!loadingUser && firebase.firestore().collection('PROPERTY').doc(rqp))

  
  // useEffect(() => {
    
  //   if(firebase?.apps?.length){
  //     setQuery(firebase.firestore().collection('PROPERTY').doc(rqp))
  //   }else{
  //     setQuery(null)
  //   }
    
  // }, [firebase, rqp]);
  
  useEffect(() => {
    console.log(fireStoreQuery)
    if(fireStoreQuery?.data?.date){
      setDateState(fireStoreQuery.data.date)
      console.log(rqp)
      console.log(fireStoreQuery?.data?.date)
    }else{
      setDateState(false)
    }
  }, [fireStoreQuery, rqp]);

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
          {/* <div>{""}</div>
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
          <Spacer />*/}
          <Button
            kind={themeState?.dark ? KIND.secondary : undefined}
            onClick={() => {
              return;
            }}
            isLoading={Boolean(loading)}
            disabled={true || Boolean(loading)}
          >
            <div
              className={css({
                paddingLeft: theme.sizing.scale600,
                paddingRight: theme.sizing.scale600,
                width: "180px",
              })}
            >
              Export Daily Focus
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
              maxWidth:`1100px`,
              display:'flex',
              justifyContent:'center',
              flexDirection:'column',
              margin:'auto'
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
            <FlexGridItem width={'100%'} flexDirection={"column"} {...quoteProps}>
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
            <FlexGridItem width={`100%`}  height={`100%`} {...outlookProps}>
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
                  <FlexGridItemHundred width={`100%`} 
                    height={`30px`}
                    {...outlookTitleProps}
                    color={theme.colors.white}
                    flex={`2`}
                  >
                    {" "}
                    Outlook{" "}
                  </FlexGridItemHundred>
                </FlexGrid>

                <FlexGrid
                  height={`100%`}
                  width={"100%"}
                  flex={5}
                  flexGridColumnCount={[3, 3, 3]}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 5,
                    }}
                  >
                    <FlexGridItemHundred width={`100%`}  {...outlookSubTitleProps} flex={`5`}>
                      <OutlookCellTitle> </OutlookCellTitle>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`}  {...outlookSubTitleProps} flex={`5`}>
                      <OutlookCell style={{ paddingLeft: `4px` }}>
                        {`Total Occupied Rooms`}
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`}  {...outlookSubTitleProps} flex={`5`}>
                      <OutlookCell style={{ paddingLeft: `4px` }}>
                        {`Forecasted Occupied Rooms`}
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`}  {...outlookSubTitleProps} flex={`5`}>
                      <OutlookCell style={{ paddingLeft: `4px` }}>
                        {`Total Guests`}
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`}  {...outlookSubTitleProps} flex={`5`}>
                      <OutlookCell style={{ paddingLeft: `4px` }}>
                        {`Arrivals`}
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`}  {...outlookSubTitleProps} flex={`5`}>
                      <OutlookCell style={{ paddingLeft: `4px` }}>
                        {`Departures`}
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`}  {...outlookSubTitleProps} flex={`5`}>
                      <OutlookCell style={{ paddingLeft: `4px` }}>
                        {`Occupancy %`}
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`}  {...outlookSubTitleProps} flex={`5`}>
                      <OutlookCell style={{ paddingLeft: `4px` }}>
                        {`Forecasted Occ. %`}
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`}  {...outlookSubTitleProps} flex={`5`}>
                      <OutlookCell style={{ paddingLeft: `4px` }}>
                        {`Vacant Clean/ Inspected Rooms`}
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`}  {...outlookSubTitleProps} flex={`5`}>
                      <OutlookCell style={{ paddingLeft: `4px` }}>
                        {`Rate of the day/ ADR`}
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`}  {...outlookSubTitleProps} flex={`5`}>
                      <OutlookCell style={{ paddingLeft: `4px` }}>
                        {`No Show Rooms`}
                      </OutlookCell>
                    </FlexGridItemHundred>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 3,
                    }}
                  >
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookSubTitleProps}
                      
                    >
                      <OutlookCellTitle>{"Today"}</OutlookCellTitle>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell dateState={`${dateState}`} id={'today_total_occupied_rooms'}></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 3,
                    }}
                  >
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookSubTitleProps}
                      
                    >
                      <OutlookCellTitle>{"Yesterday"}</OutlookCellTitle>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                  </div>
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
                  <FlexGridItemHundred width={`100%`} 
                    backgroundColor={`rgb(23,55,94)`}
                    flex={`1`}
                    color={theme.colors.white}
                    {...itemProps}
                    height={`30px`}
                  >
                    {" "}
                    Today{" "}
                  </FlexGridItemHundred>
                  <FlexGridItemHundred width={`100%`} 
                    backgroundColor={`rgb(23,55,94)`}
                    flex={`1`}
                    color={theme.colors.white}
                    {...itemProps}
                    height={`30px`}
                  >
                    {" "}
                    Tomorrow{" "}
                  </FlexGridItemHundred>
                </FlexGrid>

                <FlexGrid flexGridColumnCount={[4, 4, 4]} width={`100%`}>
                  <FlexGridItemHundred width={`100%`} 
                    height={`24px`}
                    backgroundColor={`rgb(23,55,94)`}
                    flex={`1`}
                    color={theme.colors.white}
                    {...itemProps}
                  >
                    {" "}
                    High{" "}
                  </FlexGridItemHundred>
                  <FlexGridItemHundred width={`100%`} 
                    height={`24px`}
                    backgroundColor={`rgb(23,55,94)`}
                    flex={`1`}
                    color={theme.colors.white}
                    {...itemProps}
                  >
                    {" "}
                    Low{" "}
                  </FlexGridItemHundred>
                  <FlexGridItemHundred width={`100%`} 
                    height={`24px`}
                    backgroundColor={`rgb(23,55,94)`}
                    flex={`1`}
                    color={theme.colors.white}
                    {...itemProps}
                  >
                    {" "}
                    High{" "}
                  </FlexGridItemHundred>
                  <FlexGridItemHundred width={`100%`} 
                    height={`24px`}
                    backgroundColor={`rgb(23,55,94)`}
                    flex={`1`}
                    color={theme.colors.white}
                    {...itemProps}
                  >
                    {" "}
                    Low{" "}
                  </FlexGridItemHundred>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[4, 4, 4]}>
                  <FlexGridItemHundred width={`100%`} 
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
                  </FlexGridItemHundred>
                  <FlexGridItemHundred width={`100%`} 
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
                  </FlexGridItemHundred>
                  <FlexGridItemHundred width={`100%`} 
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
                  </FlexGridItemHundred>
                  <FlexGridItemHundred width={`100%`} 
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
                  </FlexGridItemHundred>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[2, 2, 2]}>
                  <FlexGridItemHundred width={`100%`} 
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
                  </FlexGridItemHundred>
                  <FlexGridItemHundred width={`100%`} 
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
                  </FlexGridItemHundred>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[2, 2, 2]}>
                  <FlexGridItem width={`100%`} 
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
                  <FlexGridItem width={`100%`} 
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
            <FlexGridItem width={`100%`}  height={`100%`} {...outlookProps}>
              <div
                style={{
                  ...{
                    border: `solid 10px rgb(23,55,94)`,
                    borderRadius: theme.borders.radius400,
                    //padding: `${theme.sizing.scale400} ${theme.sizing.scale400}`,
                    overflow: `hidden`,
                    width:`100%`
                  },
                }}
              >
                <FlexGrid width={`100%`} height={`100%`} flexGridColumnCount={[1, 1, 1]}>
                  <FlexGridItemHundred 
                    width={`100%`} 
                    height={`30px`}
                    {...outlookTitleProps}
                    color={theme.colors.white}
                    flex={`1`}
                  >
                    {" "}
                    3-Days Forecast
                  </FlexGridItemHundred>
                </FlexGrid>

                <FlexGrid
                  height={`100%`}
                  width={"100%"}
                  flex={5}
                  flexGridColumnCount={[4, 4, 4]}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      width:`100%`
                    }}
                  >
                    <FlexGridItemHundred width={`100%`}  {...outlookSubTitleProps} flex={`5`}>
                      <OutlookCellTitle> </OutlookCellTitle>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`}  {...outlookSubTitleProps} flex={`5`}>
                      <OutlookCell style={{ paddingLeft: `4px` }}>
                        {`Arrivals`}
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`}  {...outlookSubTitleProps} flex={`5`}>
                      <OutlookCell style={{ paddingLeft: `4px` }}>
                        {`Departures `}
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`}  {...outlookSubTitleProps} flex={`5`}>
                      <OutlookCell style={{ paddingLeft: `4px` }}>
                        {`Total Guests`}
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`}  {...outlookSubTitleProps} flex={`5`}>
                      <OutlookCell style={{ paddingLeft: `4px` }}>
                        {`Occ Rooms`}
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`}  {...outlookSubTitleProps} flex={`5`}>
                      <OutlookCell style={{ paddingLeft: `4px` }}>
                        {`Occupancy %`}
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`}  {...outlookSubTitleProps} flex={`5`}>
                      <OutlookCell style={{ paddingLeft: `4px` }}>
                        {`Forecasted Occ. % `}
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`}  {...outlookSubTitleProps} flex={`5`}>
                      <OutlookCell style={{ paddingLeft: `4px` }}>
                        {`ADR `}
                      </OutlookCell>
                    </FlexGridItemHundred>
                
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      width:`100%`
                    }}
                  >
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookSubTitleProps}
                      
                    >
                      <OutlookCellTitle>{"Today"}</OutlookCellTitle>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      width:`100%`
                    }}
                  >
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookSubTitleProps}
                      
                    >
                      <OutlookCellTitle>{"Yesterday"}</OutlookCellTitle>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}

                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}

                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      width:`100%`
                    }}
                  >
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookSubTitleProps}
                      
                    >
                      <OutlookCellTitle>{"Yesterday"}</OutlookCellTitle>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                    <FlexGridItemHundred width={`100%`} 
                      {...outlookCellProps}
                      
                    >
                      <OutlookCell>
                        <InputCell></InputCell>
                      </OutlookCell>
                    </FlexGridItemHundred>
                  </div>

                                
              
              
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
                  <FlexGridItem width={`100%`} 
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
                  <FlexGridItem width={`100%`}  {...outlookSubTitleProps} flex={`1`}>
                    <OutlookCell style={{ paddingLeft: `4px` }}>
                      {`AM:`}
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem width={`100%`} 
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
                  <FlexGridItem width={`100%`}  {...outlookSubTitleProps} flex={`1`}>
                    <OutlookCell style={{ paddingLeft: `4px` }}>
                      {`PM:`}
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem width={`100%`} 
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
                  <FlexGridItem width={`100%`}  {...outlookSubTitleProps} flex={`1`}>
                    <OutlookCell style={{ paddingLeft: `4px` }}>
                      {`ON:`}
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem width={`100%`} 
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
                  <FlexGridItem width={`100%`} 
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
                  <FlexGridItem width={`100%`}  {...outlookSubTitleProps} flex={`1`}>
                    <OutlookCell style={{ paddingLeft: `4px` }}>
                      {`Manager:`}
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem width={`100%`} 
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
                  <FlexGridItem width={`100%`}  {...outlookSubTitleProps} flex={`1`}>
                    <OutlookCell style={{ paddingLeft: `4px` }}>
                      {`AM:`}
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem width={`100%`} 
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
                  <FlexGridItem width={`100%`}  {...outlookSubTitleProps} flex={`1`}>
                    <OutlookCell style={{ paddingLeft: `4px` }}>
                      {`PM:`}
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem width={`100%`} 
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
                  <FlexGridItem width={`100%`}  {...outlookSubTitleProps} flex={`1`}>
                    <OutlookCell style={{ paddingLeft: `4px` }}>
                      {`ON:`}
                    </OutlookCell>
                  </FlexGridItem>
                  <FlexGridItem width={`100%`} 
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

                <QueryVIPArrivals />
              </div>
            </FlexGridItem>
          </FlexGrid>

          <CenterLineBox>
            <CenterLine />
            <Button
              onClick={() => _VIPcreate()}
              shape={SHAPE.circle}
              kind={KIND.tertiary}
              size={SIZE.compact}
              disabled={true}
              overrides={{
                BaseButton: {
                  style: ({ $theme }) => ({
                    border: `solid 4px rgb(23,55,94)`,
                  }),
                },
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
    disabled={true}
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
    disabled={true}
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
                    Social Media Metrics{" "}
                  </FlexGridItem>
                </FlexGrid>

                <FlexGrid height={`100%`} flexGridColumnCount={[6, 6, 6]}>
                  <FlexGridItemNoBorder {...socialMediaCell} flex={`1`}>
                    < SocialMediaCellTitle>
                      <ReviewLogo>
                        <svg width="120px" height="80px" viewBox="0 -30 512 200" version="1.1" xmlns="http://www.w3.org/2000/svg" >
                          <g>
                            <path d="M496.052455,102.672055 L510.255737,112.140909 C505.6459,118.931075 494.619668,130.580258 475.557368,130.580258 C451.885231,130.580258 434.255719,112.2655 434.255719,88.967133 C434.255719,64.1736841 452.072116,47.3540078 473.563925,47.3540078 C495.180323,47.3540078 505.77049,64.5474546 509.19672,73.8294242 L511.065574,78.5638516 L455.373756,101.613038 C459.609823,109.960581 466.213103,114.196648 475.557368,114.196648 C484.901633,114.196648 491.380323,109.586811 496.052455,102.672055 L496.052455,102.672055 Z M452.383592,87.6589359 L489.573765,72.2097517 C487.518026,67.0392586 481.413107,63.3638478 474.124581,63.3638478 C464.842612,63.3638478 451.947526,71.5868007 452.383592,87.6589359 L452.383592,87.6589359 Z" fill="#FF302F"></path>
                            <path d="M407.406531,4.93104632 L425.347519,4.93104632 L425.347519,126.780257 L407.406531,126.780257 L407.406531,4.93104632 L407.406531,4.93104632 Z" fill="#20B15A"></path>
                            <path d="M379.124557,50.5933528 L396.442594,50.5933528 L396.442594,124.599929 C396.442594,155.311412 378.314721,167.957316 356.885207,167.957316 C336.701596,167.957316 324.554051,154.376986 320.00651,143.350753 L335.891759,136.747473 C338.757334,143.537639 345.67209,151.573706 356.885207,151.573706 C370.652424,151.573706 379.124557,143.039278 379.124557,127.091732 L379.124557,121.111404 L378.501606,121.111404 C374.39013,126.095011 366.540947,130.580258 356.573731,130.580258 C335.767169,130.580258 316.704869,112.452385 316.704869,89.0917231 C316.704869,65.6064713 335.767169,47.2917126 356.573731,47.2917126 C366.478652,47.2917126 374.39013,51.7146646 378.501606,56.5736822 L379.124557,56.5736822 L379.124557,50.5933528 L379.124557,50.5933528 Z M380.370459,89.0917231 C380.370459,74.3900801 370.590128,63.6753233 358.131109,63.6753233 C345.547499,63.6753233 334.957333,74.3900801 334.957333,89.0917231 C334.957333,103.606481 345.547499,114.134352 358.131109,114.134352 C370.590128,114.196648 380.370459,103.606481 380.370459,89.0917231 L380.370459,89.0917231 Z" fill="#3686F7"></path>
                            <path d="M218.21632,88.7802476 C218.21632,112.763861 199.527791,130.393373 176.603195,130.393373 C153.678599,130.393373 134.990069,112.701565 134.990069,88.7802476 C134.990069,64.6720448 153.678599,47.1048274 176.603195,47.1048274 C199.527791,47.1048274 218.21632,64.6720448 218.21632,88.7802476 L218.21632,88.7802476 Z M200.026151,88.7802476 C200.026151,73.8294242 189.186804,63.5507331 176.603195,63.5507331 C164.019585,63.5507331 153.180238,73.8294242 153.180238,88.7802476 C153.180238,103.606481 164.019585,114.009763 176.603195,114.009763 C189.186804,114.009763 200.026151,103.606481 200.026151,88.7802476 L200.026151,88.7802476 Z" fill="#FF302F"></path>
                            <path d="M309.104867,88.967133 C309.104867,112.950746 290.416338,130.580258 267.491742,130.580258 C244.567146,130.580258 225.878617,112.950746 225.878617,88.967133 C225.878617,64.8589302 244.567146,47.3540078 267.491742,47.3540078 C290.416338,47.3540078 309.104867,64.796635 309.104867,88.967133 L309.104867,88.967133 Z M290.852404,88.967133 C290.852404,74.0163095 280.013057,63.7376184 267.429447,63.7376184 C254.845837,63.7376184 244.00649,74.0163095 244.00649,88.967133 C244.00649,103.793366 254.845837,114.196648 267.429447,114.196648 C280.075352,114.196648 290.852404,103.731071 290.852404,88.967133 L290.852404,88.967133 Z" fill="#FFBA40"></path>
                            <path d="M66.5900525,112.327794 C40.4884066,112.327794 20.0556146,91.2720515 20.0556146,65.1704056 C20.0556146,39.0687598 40.4884066,18.0130168 66.5900525,18.0130168 C80.6687446,18.0130168 90.9474357,23.5572805 98.5474373,30.6589216 L111.068752,18.137607 C100.478585,7.98350613 86.3375984,0.258913997 66.5900525,0.258913997 C30.8326666,0.258913997 0.744134408,29.4130196 0.744134408,65.1704056 C0.744134408,100.927792 30.8326666,130.081897 66.5900525,130.081897 C85.9015328,130.081897 100.478585,123.727797 111.878588,111.891729 C123.590067,100.180251 127.203183,83.7343447 127.203183,70.4031939 C127.203183,66.2294223 126.704822,61.9310606 126.144166,58.7540106 L66.5900525,58.7540106 L66.5900525,76.0720477 L109.013014,76.0720477 C107.767112,86.9113947 104.340882,94.3245113 99.2949785,99.3704142 C93.1900592,105.537629 83.534319,112.327794 66.5900525,112.327794 L66.5900525,112.327794 L66.5900525,112.327794 Z" fill="#3686F7"></path>
                          </g>
                        </svg>  
                      </ReviewLogo>
                      <ReviewRank>{`4`}</ReviewRank>
                      <ReviewCount>{`102 Reviews`}</ReviewCount>
                    </ SocialMediaCellTitle>
                  </FlexGridItemNoBorder>
                  <FlexGridItemNoBorder {...socialMediaCell} flex={`1`}>
                    < SocialMediaCellTitle>
                      <ReviewLogo>
                      <svg
  width="118.5995px"
  height="118.5995px"
  viewBox="0 -35 118.5995 118.5995"
  xmlns="http://www.w3.org/2000/svg"
>
  <defs>
    <clipPath id="f">
      <path d="M589.5 28.972H684V12.937h-94.5v16.035z" />
    </clipPath>
    <clipPath id="g">
      <path d="M589.5 12.937H684v16.035h-94.5V12.937z" />
    </clipPath>
    <clipPath id="c">
      <path d="M589.5 28.972H684V12.937h-94.5v16.035z" />
    </clipPath>
    <clipPath id="d">
      <path d="M589.5 28.656h94.48V12.958H589.5v15.698z" />
    </clipPath>
    <clipPath id="e">
      <path d="M589.5 12.937H684v16.035h-94.5V12.937z" />
    </clipPath>
    <clipPath id="a">
      <path d="M589.5 28.972H684V12.937h-94.5v16.035z" />
    </clipPath>
    <clipPath id="b">
      <path d="M589.5 12.937H684v16.035h-94.5V12.937z" />
    </clipPath>
  </defs>
  <g clip-path="url(#a)" transform="matrix(1.25 0 0 -1.25 -736.625 36.07)">
    <g clip-path="url(#b)">
      <path
        d="M626.558 27.217a1.436 1.436 0 1 0 2.872 0 1.437 1.437 0 0 0-2.872 0"
        fill="#273b7d"
      />
      <path
        d="M649.215 17.64c0 .797.642 1.441 1.433 1.441a1.44 1.44 0 0 0 0-2.88c-.79 0-1.433.645-1.433 1.44"
        fill="#499fdd"
      />
      <path
        d="M602.991 18.263c-1.236 0-2.096.982-2.096 2.386 0 1.403.86 2.384 2.097 2.384 1.243 0 2.112-.981 2.112-2.384 0-1.426-.85-2.386-2.113-2.386zm0 6.867c-2.616 0-4.515-1.885-4.515-4.481 0-2.597 1.9-4.481 4.515-4.481 2.627 0 4.533 1.884 4.533 4.48 0 2.597-1.906 4.482-4.532 4.482M623.777 20.424a2.136 2.136 0 0 1-.342.483l-.08.083.084.08c.12.127.243.277.361.451l2.31 3.432h-2.804l-1.735-2.685c-.098-.144-.296-.216-.593-.216h-.395v5.076c0 1.015-.633 1.153-1.316 1.153h-1.17L618.1 16.3h2.484v3.594h.233c.283 0 .475-.033.564-.187l1.37-2.586c.383-.702.764-.821 1.482-.821h1.903l-1.418 2.344-.94 1.78M635.835 25.15c-1.264 0-2.07-.562-2.522-1.037l-.15-.152-.054.207c-.132.509-.58.788-1.253.788h-1.113l.007-8.653h2.467v3.988c0 .39.05.728.154 1.037.274.935 1.04 1.516 1.997 1.516.77 0 1.071-.407 1.071-1.457v-3.769c0-.896.415-1.315 1.312-1.315h1.174l-.004 5.504c0 2.186-1.067 3.342-3.086 3.342M628.024 24.953h-1.169l.008-6.691V16.3h1.247l.044-.002.582.002h.578v.003h.004l.005 7.335c0 .885-.423 1.314-1.298 1.314M612.68 18.263c-1.236 0-2.097.982-2.097 2.386 0 1.403.861 2.384 2.098 2.384 1.24 0 2.112-.981 2.112-2.384 0-1.426-.85-2.386-2.112-2.386zm0 6.867c-2.618 0-4.518-1.885-4.518-4.481 0-2.597 1.9-4.481 4.519-4.481 2.623 0 4.533 1.884 4.533 4.48 0 2.597-1.91 4.482-4.533 4.482"
        fill="#273b7d"
      />
    </g>
  </g>
  <g clip-path="url(#c)" transform="matrix(1.25 0 0 -1.25 -736.625 36.07)">
    <g clip-path="url(#d)">
      <g clip-path="url(#e)">
        <path
          d="M665.555 18.263c-1.236 0-2.098.982-2.098 2.386 0 1.403.862 2.384 2.098 2.384 1.242 0 2.113-.981 2.113-2.384 0-1.426-.85-2.386-2.113-2.386zm0 6.867c-2.618 0-4.517-1.885-4.517-4.481 0-2.597 1.899-4.481 4.517-4.481 2.624 0 4.533 1.884 4.533 4.48 0 2.597-1.91 4.482-4.533 4.482"
          fill="#499fdd"
        />
        <path
          d="M644.122 18.644c-1.349 0-1.829 1.176-1.829 2.279 0 .486.123 2.069 1.7 2.069.783 0 1.826-.224 1.826-2.15 0-1.817-.923-2.198-1.697-2.198zm2.978 6.332c-.468 0-.828-.187-1.009-.528l-.068-.132-.114.1c-.398.344-1.112.753-2.271.753-2.307 0-3.86-1.733-3.86-4.31 0-2.576 1.607-4.376 3.906-4.376.785 0 1.406.184 1.898.556l.19.143v-.24c0-1.156-.747-1.794-2.102-1.794-.659 0-1.258.16-1.66.306-.522.158-.83.027-1.041-.498l-.196-.484-.277-.708.171-.091c.868-.46 1.997-.735 3.017-.735 2.1 0 4.554 1.075 4.554 4.101l.009 7.937H647.1"
          fill="#273b7d"
        />
      </g>
    </g>
  </g>
  <g clip-path="url(#f)" transform="matrix(1.25 0 0 -1.25 -736.625 36.07)">
    <g clip-path="url(#g)">
      <path
        d="M593.805 18.362l-2.008.002v2.4c0 .514.199.78.638.842h1.37c.977 0 1.609-.616 1.61-1.613-.001-1.024-.617-1.63-1.61-1.63zm-2.008 6.476v.632c0 .553.234.816.747.85h1.028c.881 0 1.409-.527 1.409-1.41 0-.672-.362-1.457-1.377-1.457h-1.807v1.385zm4.572-2.396l-.363.204.317.271c.369.317.986 1.03.986 2.26 0 1.884-1.46 3.1-3.721 3.1h-2.874a1.26 1.26 0 0 1-1.214-1.244v-10.69h4.139c2.513 0 4.135 1.368 4.135 3.487 0 1.141-.524 2.116-1.405 2.612"
        fill="#273b7d"
      />
      <path
        d="M681.107 25.121a3.4 3.4 0 0 1-2.648-1.283l-.178-.226-.14.253c-.458.833-1.244 1.256-2.337 1.256-1.147 0-1.916-.64-2.273-1.02l-.234-.253-.09.333c-.13.48-.557.743-1.203.743h-1.037l-.01-8.62h2.355v3.805c0 .334.042.663.125 1.008.225.92.843 1.909 1.882 1.81.64-.062.954-.557.954-1.513v-5.11h2.372v3.805c0 .417.039.729.133 1.041.19.878.836 1.778 1.838 1.778.726 0 .994-.41.994-1.514v-3.85c0-.87.388-1.26 1.259-1.26h1.108l.002 5.503c0 2.199-.968 3.314-2.872 3.314M659.673 19.297c-.007-.009-1.02-1.077-2.355-1.077-1.216 0-2.444.746-2.444 2.411 0 1.438.952 2.443 2.316 2.443.442 0 .946-.158 1.025-.425l.011-.045a.866.866 0 0 1 .84-.637l1.29-.002v1.128c0 1.488-1.893 2.028-3.166 2.028-2.724 0-4.7-1.896-4.7-4.508 0-2.61 1.954-4.504 4.65-4.504 2.338 0 3.61 1.537 3.622 1.552l.068.084-1.022 1.695-.135-.143"
        fill="#499fdd"
      />
    </g>
  </g>
</svg>  
                      </ReviewLogo>
                      <ReviewRank>{`4`}</ReviewRank>
                      <ReviewCount>{`102 Reviews`}</ReviewCount>
                    </ SocialMediaCellTitle>
                  </FlexGridItemNoBorder>
                  <FlexGridItemNoBorder {...socialMediaCell} flex={`1`}>
                    < SocialMediaCellTitle>
                      <ReviewLogo>


<svg 
xmlns="http://www.w3.org/2000/svg" 
id="svg2" viewBox="0 0 1016.5 400.7" width="100" height="100">
  <style>{`.st0{fill:'#072f54';}.st1{fill:#fbc108;}`}</style>
<path id="path4354" className="st0" d="M488.6 225.1H457c-.2 0-.2 0-.3-.1l-27.2-33.2-27.2 33.2c-.1.1-.2.1-.3.1h-25.3c-.2 0-.3-.1-.4-.2 0-.1 0-.3.1-.4l40.1-49.2-39.6-48.7c-.1-.2-.1-.3-.1-.5.1-.1.2-.2.3-.2h31.6c.1 0 .2.1.3.2l23.9 29.6 24.3-29.6c.1-.1.2-.2.3-.2h25.7c.1 0 .3.1.4.2.1.2 0 .3-.1.5L446 171.7l43 52.8c.1.1.1.3.1.4-.2.2-.3.2-.5.2"/>
<path id="path4358" className="st0" d="M659.5 143.3c-14 0-23.5 8.5-26.3 23.2h47.6v-1c0-11.7-8.7-22.2-21.3-22.2m45.8 38.4c-.1.1-.2.2-.3.2h-72.3c1.5 16.8 12.4 26.4 30.1 26.4 10.9 0 22.5-3.7 38.8-12.4.3-.2.6.1.6.4v22.2c0 .2-.1.3-.2.3-15.2 6.4-30.5 10.8-42.5 10.8-31.1 0-53.7-22.7-53.7-53.9s22.6-53.9 53.7-53.9c28.4 0 46.6 19.1 46.6 45.4 0 4.3-.7 14.2-.8 14.5"/><path id="path4362" className="st0" d="M852.1 105.3c-8.9 0-16.1-7.1-16.1-15.8 0-9 7.2-16.3 16.1-16.3 8.9 0 16.1 7.3 16.1 16.3 0 8.7-7.2 15.8-16.1 15.8m-13 119.8c-.3 0-.4-.1-.4-.4v-98.5c0-.2.1-.4.3-.4h26.1c.2 0 .3.2.3.4v98.5c0 .3-.2.4-.4.4h-25.9z"/><path id="path4366" className="st0" d="M536.4 210.3c-4.7 0-9.5-.7-15.1-2.1l.1-63.2c6.5-2.1 12.1-3 17.7-3 18.1 0 30.2 13.3 30.2 33.2 0 21.3-12.9 35.1-32.9 35.1m7.1-88.5c-7.4 0-14.8 1.3-22.6 4h-26c-.2 0-.4.2-.4.4v161.5c7.8-1.1 17.4-3.9 26.8-10.5v-49.1c6.4.9 11.7 1.5 16.8 1.5 35.6 0 58.6-21.3 58.6-54.3 0-31.5-21.9-53.5-53.2-53.5"/><path id="path4370" className="st0" d="M791.6 202.1c-8.1 4.3-15.4 6.3-22.2 6.3-16.1 0-25.8-11.4-25.8-30.5 0-22 12.3-36.3 31.4-36.3 5.3 0 10.4 1.3 16.6 4.1v56.4zm0-128.4v51.5c-7.6-2.2-14.3-3.2-21.1-3.2-31 0-54.3 23.3-54.3 54.3 0 30.8 20.6 53.2 49 53.2 9.8 0 19-2.5 29.8-8v8.9c7.1-1.4 15.3-4.2 23.4-10V63.1c-7.9 1.1-17.3 3.8-26.8 10.6"/><path id="path4374" className="st0" d="M955.9 201.9c-7.9 4.5-14.6 6.7-20.6 6.7-17.3 0-27.6-11.4-27.6-30.5 0-21.7 12.2-36.3 30.3-36.3 4.8 0 10.7 1.9 17.9 5.7v54.4zm26.8-77.3c0-.6-.5-1.1-1.1-1.1h-21.1c-.6 0-1.2.5-1.2 1.1v3.6h-.5c-9.7-4.3-18.1-6.2-26.2-6.2-29.2 0-52.1 24.2-52.1 55.2 0 31.3 20.5 52.3 51 52.3 8.1 0 18.6-.6 28.4-11.8v12.7c6.9-1.5 15.1-4.4 22.8-10v-95.8z"/><path id="path4378" className="st0" d="M304.5 200.5H370c-1 7.3-3.5 15.9-9.1 24.6H292.8c-8.3 0-15.2-6.5-16-14.6 0-.1-.1-.2-.1-.4V80.9c0-.1.1-.2.1-.3.8-8.2 7.7-14.7 16-14.7H369.9c-1 7.3-3.5 16.1-9.2 24.8h-56.2v35.2h55.7c.2 0 .4.2.4.4v24.4c0 .2-.2.4-.4.4h-55.7v49.4z"/><path id="path4382" className="st0" d="M222.5 227.2c-6.5 0-10.5-5.1-10.5-11.3 0-6.6 4.6-11.3 10.5-11.3 5.8 0 10.4 4.6 10.4 11.3s-4.6 11.3-10.4 11.3m0-23.8c-6.6 0-12.3 5-12.3 12.5 0 7.1 5.1 12.5 12.3 12.5 6.5 0 12.2-5 12.2-12.5s-5.6-12.5-12.2-12.5"/><path id="path4386" className="st0" d="M219.6 214.9v-4.6h3.1c1.6 0 3.4.2 3.4 2.1 0 2.3-1.7 2.4-3.6 2.4-.1.1-2.9.1-2.9.1zm8.7-2.2c0-3-1.8-4.3-5.4-4.3h-5.6v14.8h2.4v-6.3h2.3l3.8 6.3h2.8l-4.1-6.5c2.2-.2 3.8-1.3 3.8-4"/><path id="path4390" className="st0" d="M1004.3 142.2c-6.5 0-10.5-5.1-10.5-11.3 0-6.6 4.6-11.3 10.5-11.3 5.8 0 10.4 4.6 10.4 11.3 0 6.7-4.6 11.3-10.4 11.3m0-23.7c-6.6 0-12.3 5-12.3 12.5 0 7.1 5.1 12.5 12.3 12.5 6.5 0 12.2-5 12.2-12.5 0-7.6-5.7-12.5-12.2-12.5"/><path id="path4394" className="st0" d="M1001.3 129.9v-4.5h3.1c1.6 0 3.4.2 3.4 2.1 0 2.3-1.7 2.4-3.6 2.4h-2.9zm8.8-2.1c0-3-1.8-4.3-5.4-4.3h-5.6v14.8h2.4V132h2.3l3.8 6.3h2.8l-4.1-6.5c2.1-.2 3.8-1.3 3.8-4"/><path id="path4398" className="st0" d="M138 90.6l-4.7-13.4-40.4-53.9 7.2-1.8 69.5 60.1 40.9-11.7c4.8-1.2 10.3-1.5 14.4-1.5-12.8-27.7-36.4-50.5-67.4-61.5C96.2-15 28.7 17.1 6.9 78.5c-6.8 19-8.3 38.6-5.5 57.2l97.9-34L138 90.6z"/><path id="path4402" className="st0" d="M229.3 79c-3.6 2.3-8.9 5.4-14.1 7.1l-41 11.7-27.3 87.8-7.1 2.3 5.8-67-3.2-13.9-38.4 11L2.4 141.7c8.1 39 35.7 73.1 76 87.4 61.4 21.9 128.8-10.2 150.7-71.6 9.4-26.3 8.8-53.9.2-78.5"/><path id="path4406" className="st1" d="M142.3 106.9l3.2 13.9-5.8 67 7.1-2.3 27.3-87.8 41-11.7c5.2-1.7 10.5-4.7 14.1-7.1-1.3-3.6-2.7-7.1-4.3-10.6-4.2 0-9.6.2-14.4 1.5l-40.9 11.7-69.5-60.1-7.2 1.8 40.3 53.9 4.7 13.4-38.7 11.1-97.9 34c.3 2 .7 4.1 1.1 6.1l101.5-23.9 38.4-10.9z"/></svg>
                      </ReviewLogo>
                      <ReviewRank>{`4`}</ReviewRank>
                      <ReviewCount>{`102 Reviews`}</ReviewCount>
                    </ SocialMediaCellTitle>
                  </FlexGridItemNoBorder>
                  <FlexGridItemNoBorder {...socialMediaCell} flex={`1`}>
                    < SocialMediaCellTitle>
                      <ReviewLogo>
                        <svg width="120px" height="80px" viewBox="0 -30 512 200" version="1.1" xmlns="http://www.w3.org/2000/svg" >
                          <g>
                            <path d="M496.052455,102.672055 L510.255737,112.140909 C505.6459,118.931075 494.619668,130.580258 475.557368,130.580258 C451.885231,130.580258 434.255719,112.2655 434.255719,88.967133 C434.255719,64.1736841 452.072116,47.3540078 473.563925,47.3540078 C495.180323,47.3540078 505.77049,64.5474546 509.19672,73.8294242 L511.065574,78.5638516 L455.373756,101.613038 C459.609823,109.960581 466.213103,114.196648 475.557368,114.196648 C484.901633,114.196648 491.380323,109.586811 496.052455,102.672055 L496.052455,102.672055 Z M452.383592,87.6589359 L489.573765,72.2097517 C487.518026,67.0392586 481.413107,63.3638478 474.124581,63.3638478 C464.842612,63.3638478 451.947526,71.5868007 452.383592,87.6589359 L452.383592,87.6589359 Z" fill="#FF302F"></path>
                            <path d="M407.406531,4.93104632 L425.347519,4.93104632 L425.347519,126.780257 L407.406531,126.780257 L407.406531,4.93104632 L407.406531,4.93104632 Z" fill="#20B15A"></path>
                            <path d="M379.124557,50.5933528 L396.442594,50.5933528 L396.442594,124.599929 C396.442594,155.311412 378.314721,167.957316 356.885207,167.957316 C336.701596,167.957316 324.554051,154.376986 320.00651,143.350753 L335.891759,136.747473 C338.757334,143.537639 345.67209,151.573706 356.885207,151.573706 C370.652424,151.573706 379.124557,143.039278 379.124557,127.091732 L379.124557,121.111404 L378.501606,121.111404 C374.39013,126.095011 366.540947,130.580258 356.573731,130.580258 C335.767169,130.580258 316.704869,112.452385 316.704869,89.0917231 C316.704869,65.6064713 335.767169,47.2917126 356.573731,47.2917126 C366.478652,47.2917126 374.39013,51.7146646 378.501606,56.5736822 L379.124557,56.5736822 L379.124557,50.5933528 L379.124557,50.5933528 Z M380.370459,89.0917231 C380.370459,74.3900801 370.590128,63.6753233 358.131109,63.6753233 C345.547499,63.6753233 334.957333,74.3900801 334.957333,89.0917231 C334.957333,103.606481 345.547499,114.134352 358.131109,114.134352 C370.590128,114.196648 380.370459,103.606481 380.370459,89.0917231 L380.370459,89.0917231 Z" fill="#3686F7"></path>
                            <path d="M218.21632,88.7802476 C218.21632,112.763861 199.527791,130.393373 176.603195,130.393373 C153.678599,130.393373 134.990069,112.701565 134.990069,88.7802476 C134.990069,64.6720448 153.678599,47.1048274 176.603195,47.1048274 C199.527791,47.1048274 218.21632,64.6720448 218.21632,88.7802476 L218.21632,88.7802476 Z M200.026151,88.7802476 C200.026151,73.8294242 189.186804,63.5507331 176.603195,63.5507331 C164.019585,63.5507331 153.180238,73.8294242 153.180238,88.7802476 C153.180238,103.606481 164.019585,114.009763 176.603195,114.009763 C189.186804,114.009763 200.026151,103.606481 200.026151,88.7802476 L200.026151,88.7802476 Z" fill="#FF302F"></path>
                            <path d="M309.104867,88.967133 C309.104867,112.950746 290.416338,130.580258 267.491742,130.580258 C244.567146,130.580258 225.878617,112.950746 225.878617,88.967133 C225.878617,64.8589302 244.567146,47.3540078 267.491742,47.3540078 C290.416338,47.3540078 309.104867,64.796635 309.104867,88.967133 L309.104867,88.967133 Z M290.852404,88.967133 C290.852404,74.0163095 280.013057,63.7376184 267.429447,63.7376184 C254.845837,63.7376184 244.00649,74.0163095 244.00649,88.967133 C244.00649,103.793366 254.845837,114.196648 267.429447,114.196648 C280.075352,114.196648 290.852404,103.731071 290.852404,88.967133 L290.852404,88.967133 Z" fill="#FFBA40"></path>
                            <path d="M66.5900525,112.327794 C40.4884066,112.327794 20.0556146,91.2720515 20.0556146,65.1704056 C20.0556146,39.0687598 40.4884066,18.0130168 66.5900525,18.0130168 C80.6687446,18.0130168 90.9474357,23.5572805 98.5474373,30.6589216 L111.068752,18.137607 C100.478585,7.98350613 86.3375984,0.258913997 66.5900525,0.258913997 C30.8326666,0.258913997 0.744134408,29.4130196 0.744134408,65.1704056 C0.744134408,100.927792 30.8326666,130.081897 66.5900525,130.081897 C85.9015328,130.081897 100.478585,123.727797 111.878588,111.891729 C123.590067,100.180251 127.203183,83.7343447 127.203183,70.4031939 C127.203183,66.2294223 126.704822,61.9310606 126.144166,58.7540106 L66.5900525,58.7540106 L66.5900525,76.0720477 L109.013014,76.0720477 C107.767112,86.9113947 104.340882,94.3245113 99.2949785,99.3704142 C93.1900592,105.537629 83.534319,112.327794 66.5900525,112.327794 L66.5900525,112.327794 L66.5900525,112.327794 Z" fill="#3686F7"></path>
                          </g>
                        </svg>  
                      </ReviewLogo>
                      <ReviewRank>{`4`}</ReviewRank>
                      <ReviewCount>{`102 Reviews`}</ReviewCount>
                    </ SocialMediaCellTitle>
                  </FlexGridItemNoBorder>
                  <FlexGridItemNoBorder {...socialMediaCell} flex={`1`}>
                    < SocialMediaCellTitle>
                      <ReviewLogo>
                        <svg width="120px" height="80px" viewBox="0 -30 512 200" version="1.1" xmlns="http://www.w3.org/2000/svg" >
                          <g>
                            <path d="M496.052455,102.672055 L510.255737,112.140909 C505.6459,118.931075 494.619668,130.580258 475.557368,130.580258 C451.885231,130.580258 434.255719,112.2655 434.255719,88.967133 C434.255719,64.1736841 452.072116,47.3540078 473.563925,47.3540078 C495.180323,47.3540078 505.77049,64.5474546 509.19672,73.8294242 L511.065574,78.5638516 L455.373756,101.613038 C459.609823,109.960581 466.213103,114.196648 475.557368,114.196648 C484.901633,114.196648 491.380323,109.586811 496.052455,102.672055 L496.052455,102.672055 Z M452.383592,87.6589359 L489.573765,72.2097517 C487.518026,67.0392586 481.413107,63.3638478 474.124581,63.3638478 C464.842612,63.3638478 451.947526,71.5868007 452.383592,87.6589359 L452.383592,87.6589359 Z" fill="#FF302F"></path>
                            <path d="M407.406531,4.93104632 L425.347519,4.93104632 L425.347519,126.780257 L407.406531,126.780257 L407.406531,4.93104632 L407.406531,4.93104632 Z" fill="#20B15A"></path>
                            <path d="M379.124557,50.5933528 L396.442594,50.5933528 L396.442594,124.599929 C396.442594,155.311412 378.314721,167.957316 356.885207,167.957316 C336.701596,167.957316 324.554051,154.376986 320.00651,143.350753 L335.891759,136.747473 C338.757334,143.537639 345.67209,151.573706 356.885207,151.573706 C370.652424,151.573706 379.124557,143.039278 379.124557,127.091732 L379.124557,121.111404 L378.501606,121.111404 C374.39013,126.095011 366.540947,130.580258 356.573731,130.580258 C335.767169,130.580258 316.704869,112.452385 316.704869,89.0917231 C316.704869,65.6064713 335.767169,47.2917126 356.573731,47.2917126 C366.478652,47.2917126 374.39013,51.7146646 378.501606,56.5736822 L379.124557,56.5736822 L379.124557,50.5933528 L379.124557,50.5933528 Z M380.370459,89.0917231 C380.370459,74.3900801 370.590128,63.6753233 358.131109,63.6753233 C345.547499,63.6753233 334.957333,74.3900801 334.957333,89.0917231 C334.957333,103.606481 345.547499,114.134352 358.131109,114.134352 C370.590128,114.196648 380.370459,103.606481 380.370459,89.0917231 L380.370459,89.0917231 Z" fill="#3686F7"></path>
                            <path d="M218.21632,88.7802476 C218.21632,112.763861 199.527791,130.393373 176.603195,130.393373 C153.678599,130.393373 134.990069,112.701565 134.990069,88.7802476 C134.990069,64.6720448 153.678599,47.1048274 176.603195,47.1048274 C199.527791,47.1048274 218.21632,64.6720448 218.21632,88.7802476 L218.21632,88.7802476 Z M200.026151,88.7802476 C200.026151,73.8294242 189.186804,63.5507331 176.603195,63.5507331 C164.019585,63.5507331 153.180238,73.8294242 153.180238,88.7802476 C153.180238,103.606481 164.019585,114.009763 176.603195,114.009763 C189.186804,114.009763 200.026151,103.606481 200.026151,88.7802476 L200.026151,88.7802476 Z" fill="#FF302F"></path>
                            <path d="M309.104867,88.967133 C309.104867,112.950746 290.416338,130.580258 267.491742,130.580258 C244.567146,130.580258 225.878617,112.950746 225.878617,88.967133 C225.878617,64.8589302 244.567146,47.3540078 267.491742,47.3540078 C290.416338,47.3540078 309.104867,64.796635 309.104867,88.967133 L309.104867,88.967133 Z M290.852404,88.967133 C290.852404,74.0163095 280.013057,63.7376184 267.429447,63.7376184 C254.845837,63.7376184 244.00649,74.0163095 244.00649,88.967133 C244.00649,103.793366 254.845837,114.196648 267.429447,114.196648 C280.075352,114.196648 290.852404,103.731071 290.852404,88.967133 L290.852404,88.967133 Z" fill="#FFBA40"></path>
                            <path d="M66.5900525,112.327794 C40.4884066,112.327794 20.0556146,91.2720515 20.0556146,65.1704056 C20.0556146,39.0687598 40.4884066,18.0130168 66.5900525,18.0130168 C80.6687446,18.0130168 90.9474357,23.5572805 98.5474373,30.6589216 L111.068752,18.137607 C100.478585,7.98350613 86.3375984,0.258913997 66.5900525,0.258913997 C30.8326666,0.258913997 0.744134408,29.4130196 0.744134408,65.1704056 C0.744134408,100.927792 30.8326666,130.081897 66.5900525,130.081897 C85.9015328,130.081897 100.478585,123.727797 111.878588,111.891729 C123.590067,100.180251 127.203183,83.7343447 127.203183,70.4031939 C127.203183,66.2294223 126.704822,61.9310606 126.144166,58.7540106 L66.5900525,58.7540106 L66.5900525,76.0720477 L109.013014,76.0720477 C107.767112,86.9113947 104.340882,94.3245113 99.2949785,99.3704142 C93.1900592,105.537629 83.534319,112.327794 66.5900525,112.327794 L66.5900525,112.327794 L66.5900525,112.327794 Z" fill="#3686F7"></path>
                          </g>
                        </svg>  
                      </ReviewLogo>
                      <ReviewRank>{`4`}</ReviewRank>
                      <ReviewCount>{`102 Reviews`}</ReviewCount>
                    </ SocialMediaCellTitle>
                  </FlexGridItemNoBorder>
                  <FlexGridItemNoBorder {...socialMediaCell} flex={`1`}>
                    < SocialMediaCellTitle>
                      <ReviewLogo>
                        <svg width="120px" height="80px" viewBox="0 -30 512 200" version="1.1" xmlns="http://www.w3.org/2000/svg" >
                          <g>
                            <path d="M496.052455,102.672055 L510.255737,112.140909 C505.6459,118.931075 494.619668,130.580258 475.557368,130.580258 C451.885231,130.580258 434.255719,112.2655 434.255719,88.967133 C434.255719,64.1736841 452.072116,47.3540078 473.563925,47.3540078 C495.180323,47.3540078 505.77049,64.5474546 509.19672,73.8294242 L511.065574,78.5638516 L455.373756,101.613038 C459.609823,109.960581 466.213103,114.196648 475.557368,114.196648 C484.901633,114.196648 491.380323,109.586811 496.052455,102.672055 L496.052455,102.672055 Z M452.383592,87.6589359 L489.573765,72.2097517 C487.518026,67.0392586 481.413107,63.3638478 474.124581,63.3638478 C464.842612,63.3638478 451.947526,71.5868007 452.383592,87.6589359 L452.383592,87.6589359 Z" fill="#FF302F"></path>
                            <path d="M407.406531,4.93104632 L425.347519,4.93104632 L425.347519,126.780257 L407.406531,126.780257 L407.406531,4.93104632 L407.406531,4.93104632 Z" fill="#20B15A"></path>
                            <path d="M379.124557,50.5933528 L396.442594,50.5933528 L396.442594,124.599929 C396.442594,155.311412 378.314721,167.957316 356.885207,167.957316 C336.701596,167.957316 324.554051,154.376986 320.00651,143.350753 L335.891759,136.747473 C338.757334,143.537639 345.67209,151.573706 356.885207,151.573706 C370.652424,151.573706 379.124557,143.039278 379.124557,127.091732 L379.124557,121.111404 L378.501606,121.111404 C374.39013,126.095011 366.540947,130.580258 356.573731,130.580258 C335.767169,130.580258 316.704869,112.452385 316.704869,89.0917231 C316.704869,65.6064713 335.767169,47.2917126 356.573731,47.2917126 C366.478652,47.2917126 374.39013,51.7146646 378.501606,56.5736822 L379.124557,56.5736822 L379.124557,50.5933528 L379.124557,50.5933528 Z M380.370459,89.0917231 C380.370459,74.3900801 370.590128,63.6753233 358.131109,63.6753233 C345.547499,63.6753233 334.957333,74.3900801 334.957333,89.0917231 C334.957333,103.606481 345.547499,114.134352 358.131109,114.134352 C370.590128,114.196648 380.370459,103.606481 380.370459,89.0917231 L380.370459,89.0917231 Z" fill="#3686F7"></path>
                            <path d="M218.21632,88.7802476 C218.21632,112.763861 199.527791,130.393373 176.603195,130.393373 C153.678599,130.393373 134.990069,112.701565 134.990069,88.7802476 C134.990069,64.6720448 153.678599,47.1048274 176.603195,47.1048274 C199.527791,47.1048274 218.21632,64.6720448 218.21632,88.7802476 L218.21632,88.7802476 Z M200.026151,88.7802476 C200.026151,73.8294242 189.186804,63.5507331 176.603195,63.5507331 C164.019585,63.5507331 153.180238,73.8294242 153.180238,88.7802476 C153.180238,103.606481 164.019585,114.009763 176.603195,114.009763 C189.186804,114.009763 200.026151,103.606481 200.026151,88.7802476 L200.026151,88.7802476 Z" fill="#FF302F"></path>
                            <path d="M309.104867,88.967133 C309.104867,112.950746 290.416338,130.580258 267.491742,130.580258 C244.567146,130.580258 225.878617,112.950746 225.878617,88.967133 C225.878617,64.8589302 244.567146,47.3540078 267.491742,47.3540078 C290.416338,47.3540078 309.104867,64.796635 309.104867,88.967133 L309.104867,88.967133 Z M290.852404,88.967133 C290.852404,74.0163095 280.013057,63.7376184 267.429447,63.7376184 C254.845837,63.7376184 244.00649,74.0163095 244.00649,88.967133 C244.00649,103.793366 254.845837,114.196648 267.429447,114.196648 C280.075352,114.196648 290.852404,103.731071 290.852404,88.967133 L290.852404,88.967133 Z" fill="#FFBA40"></path>
                            <path d="M66.5900525,112.327794 C40.4884066,112.327794 20.0556146,91.2720515 20.0556146,65.1704056 C20.0556146,39.0687598 40.4884066,18.0130168 66.5900525,18.0130168 C80.6687446,18.0130168 90.9474357,23.5572805 98.5474373,30.6589216 L111.068752,18.137607 C100.478585,7.98350613 86.3375984,0.258913997 66.5900525,0.258913997 C30.8326666,0.258913997 0.744134408,29.4130196 0.744134408,65.1704056 C0.744134408,100.927792 30.8326666,130.081897 66.5900525,130.081897 C85.9015328,130.081897 100.478585,123.727797 111.878588,111.891729 C123.590067,100.180251 127.203183,83.7343447 127.203183,70.4031939 C127.203183,66.2294223 126.704822,61.9310606 126.144166,58.7540106 L66.5900525,58.7540106 L66.5900525,76.0720477 L109.013014,76.0720477 C107.767112,86.9113947 104.340882,94.3245113 99.2949785,99.3704142 C93.1900592,105.537629 83.534319,112.327794 66.5900525,112.327794 L66.5900525,112.327794 L66.5900525,112.327794 Z" fill="#3686F7"></path>
                          </g>
                        </svg>  
                      </ReviewLogo>
                      <ReviewRank>{`4`}</ReviewRank>
                      <ReviewCount>{`102 Reviews`}</ReviewCount>
                    </ SocialMediaCellTitle>
                  </FlexGridItemNoBorder>

   
                </FlexGrid>


      



              </div>
            </FlexGridItem>
          </FlexGrid>

        </div>
      </div>
 
    </>
  );
};

const ReviewLogo = styled('div', ({ $theme }) => {
  return {
    width: `100%`,
    height:`80px`,

    overflow:`hidden`,
  };
});
const ReviewRank = styled('div', ({ $theme }) => {
  return {
    width: `100%`,
    overflow: `hidden`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: $theme.sizing.scale1200,
    fontWeight: 400,
    lineHeight: $theme.sizing.scale600,
    height: $theme.sizing.scale1200,
    alignText: "center",
  };
});
const ReviewCount = styled('div', ({ $theme }) => {
  return {
    width: `100%`,
    overflow: `hidden`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: $theme.sizing.scale600,
    fontWeight: 400,
    lineHeight: $theme.sizing.scale600,
    height: $theme.sizing.scale1200,
    alignText: "center",
  };
});
const FlexGridItemHundred = styled(FlexGridItem, ({ $theme }) => {
  return {
    width: `100% !important`,
    height: `100% !important`,
  };
});
const SocialMediaCellTitle = styled("div", ({ $theme }) => {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection:"column",
    //orderRight: `solid 1px rgb(23,55,94)`,
    //borderBottom: `solid 1px rgb(23,55,94)`,
    //overflow: `hidden`,
    width: `100%`,
    // /height: $theme.sizing.scale800,
    textAlign: `center`,
    fontSize: $theme.sizing.scale500,
    fontWeight: 500,
    lineHeight: $theme.sizing.scale600,
  };
});
const FlexGridItemNoBorder = styled(FlexGridItem, ({ $theme }) => {
  return {
    border:'none !important',
    // display: `flex`,
    // width: `3px`,
    // height: "40px",
    // backgroundColor: "rgb(23,55,94)",
    //justifyContent: "center",
    //alignContent: "center",
    //alignItems: "center",
  };
});
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
    flexDirection: "column",
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
    fontWeight: 500,
    lineHeight: $theme.sizing.scale600,
    height: $theme.sizing.scale1200,
    alignText: "center",
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
    fontWeight: 500,
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
    fontWeight: 500,
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
    fontWeight: 500,
    lineHeight: $theme.sizing.scale600,
  };
});
interface TestProps {
  textAlign?: "center" | "left";
  id?: string;
  dateState?: string;
}
const InputCell = ({ textAlign = "center", id = "McGee", dateState = '01.01.22' }: TestProps) => {
  
  const router = useRouter();
  const [value, setValue] = React.useState("");
  const saveData = () => {
    mergeFirestore(router.query.property, dateState, {[id]:`${value}`})
  }
  const [isActive, setIsActive] = useState(false);
  return (
    <Input
      value={value}
      onFocus={() => setIsActive(true)}
      onBlur={saveData}
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

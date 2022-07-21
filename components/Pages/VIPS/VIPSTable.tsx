import React, { useEffect } from "react";
import { withStyle, useStyletron } from "baseui";
import { ChevronRight, ChevronLeft } from "baseui/icon";
import { useDispatchModalBase } from "../../../context/Modal";
import { StyledTable, StyledHead, StyledHeadCell, StyledBody, StyledRow, StyledCell } from "baseui/table";
import { LabelSmall, LabelMedium, ParagraphMedium } from "baseui/typography";
import { Theme } from "baseui/theme";
import { styled } from "baseui";
import { TriangleDown } from "baseui/icon";
import { StatefulMenu } from "baseui/menu";
import { Pagination } from "baseui/pagination";
import { StatefulPopover, PLACEMENT } from "baseui/popover";
import { Button, KIND, SIZE} from "baseui/button";
import { useQuery } from "../../../context/Query";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { Spinner } from "baseui/spinner";
import { ReactElement } from "react";
import { KIND as _KIND } from "baseui/tag";
import { useScreen } from "../../../context/screenContext";
import { useRouter } from "next/router"
import VIP_Edit from "../../Modals/VIPedit";
import { useSnackbar } from "baseui/snackbar";
import { VIPClass } from "../../../classes";
import { WhereFilterOp } from '@firebase/firestore-types';
import SVGIcon from "../../SVGIcon";



const CellWrapper = styled("div", () => {
  return {
    justifyContent:'center',
    minHeight: "100%",
    width: "100%",
    display: "flex",
    //minHeight: "46px",
    height: "46px",
    alignItems: "center",
    "@media (max-width: 450px)": {
      minHeight: "100%",
      //minHeight: "40px",
      height: "40px",
    },
  };
});



const QueryLoader = styled("div", ({ $theme }) => {
  return {
    position: "absolute",
    width: "100%",
    display: "flex",
    //height:'auto',
    //backgroundColor: $isDark ? `rgba(51, 51, 51, 0.5)` : `rgba(255, 255, 255, 0.6)`,
    //bottom:'85px',
    top: "45px",
    alignItems: "center",
    justifyContent: "center",
    transition: `background-color 0.2s ease`,
    zIndex: 20,
  };
});
const Results = styled("div", ({ $theme }) => {
  return {
    position: "absolute",
    width: "100%",
    display: "flex",
    //height:'auto',
    //backgroundColor: $isDark ? `rgba(51, 51, 51, 0.5)` : `rgba(255, 255, 255, 0.6)`,
    //bottom:'85px',
    top: "45px",
    alignItems: "center",
    justifyContent: "center",
    transition: `background-color 0.2s ease`,
    zIndex: 20,
  };
});

const StyledHeadCellMod = styled(StyledHeadCell, ({ $theme }) => {
  return {
    justifyContent: "center!important",
    padding:`0px!important`,
    height:'32px',
    display:'flex',
    alignItems:'center',
    alignContent:'center',
    //backgroundColor:`#c6d9f1`,
    fontWeight:'bold',
    //justifyContent:'center',
  };
});
const LabelSmallMod = styled(LabelSmall, ({ $theme }) => {
  return {
    fontWeight:'bold',
    //justifyContent:'center',
  };
});
const StyledBorderCell = withStyle<typeof StyledCell, Theme>(StyledCell, ({ $theme }) => ({
  borderBottom: `1px solid ${$theme.borders.border300.borderColor}`,
  borderRight: `1px solid ${$theme.borders.border300.borderColor}`,
  height: '79px',
  padding:`0px!important`,
}));
const StyledBorderCellEnd = withStyle<typeof StyledCell, Theme>(StyledCell, ({ $theme }) => ({
  borderBottom: `1px solid ${$theme.borders.border300.borderColor}`,
  borderRight: `none`,
  height: '79px',
  padding:'0px'
}));
const CustomTable = withStyle<typeof StyledTable, Theme>(StyledTable, ({ $theme }) => ({
  marginBottom: '0px',
  border:'none'
}));
const CellButton = styled(Button, ({ $theme }) => {
  return {
    //backgroundColor:`white`,
    width:`100%`,
    padding:`0px!important`,
    border: `none`,
    display:'block',
  };
});

export default function VIPSTable() {
  const [css, theme] = useStyletron();
  const [dataState, setDataState] = React.useState([]);
  const { modalBaseDispatch, modalBaseState } = useDispatchModalBase();
  const { toggleTheme, themeState } = useScreen();
  const router = useRouter()
  //const { user } = useUser()
  const { enqueue, dequeue } = useSnackbar();
  //const router = useRouter()
  //const [page, setPage] = React.useState(1);
  //const [limit, setLimit] = React.useState(12);
  const { width, height } = useWindowSize();
  const isMobile = Boolean(width < 620);
  const {
    maxPage,
    disableNext,
    disablePrev,
    page,
    limit,
    setLimit,
    orderBy,
    setOrderBy,
    nextPage,
    prevPage,
    dataList,
    setTotalsField,
    queryLoader,
    setTotalsDoc,
    setTotalsCollection,
    setQueryGroupCollection,
    setWhere,
    setQueryCollection,
    fireStoreQuery,
  } = useQuery();

  React.useEffect(() => {
    if (dataList.length && !queryLoader) {
      setDataState(dataList);
    } else if (!dataList.length && !queryLoader) {
      setDataState([]);
    }
  }, [dataList, queryLoader]);


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
  const _VIPedit = (id:string) => {
    const component: () => ReactElement = () => <VIP_Edit collection={"ArrivalVIPs"} id={id} />;
    openModalBase(component, true);
  };



/* add shit to the query questions*/
useEffect(() => {
  const arr = "arriving",
    inh = "inhouse",
    out = "dueout",
    all = "all",
    IN = "DUEIN",
    OUT = "DUEOUT",
    CHK = "CHECKEDIN",
    tot = "total",
    rqf = router?.query?.filter as
      | "arriving"
      | "inhouse"
      | "dueout"
      | "all"
      | null,
    tot_field =
      rqf === arr
        ? IN
        : rqf === inh
        ? inh
        : rqf === out
        ? OUT
        : rqf === all
        ? tot
        : null,
    rqp = router?.query?.property as "LAXTH" | "LAXTE",
    tot_doc = `${rqp}_VIPs`,
    rS = "reservationStatus",
    where = (
      rqf === arr
        ? [[rS, "==", IN]]
        : rqf === inh
        ? [[rS, "in", [CHK, OUT]]]
        : rqf === out
        ? [[rS, "==", OUT]]
        : null
    ) as [string, WhereFilterOp, string | boolean | number | string[]][] | [];

  setTotalsCollection("Totals");
  setTotalsDoc(tot_doc);
  setTotalsField(tot_field);
  setQueryCollection(`${rqp}_VIPs`);
  setOrderBy("firstName");
  setWhere(where);
  setLimit(5);
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
}, [router]);








  useEffect(() => {
    console.log(`fireStoreQuery`)
    console.log(fireStoreQuery)
  }, [fireStoreQuery]);

  return (

    <CustomTable>
      <StyledHead $width="100%">
        {/* {!isMobile && <StyledHeadCell style={{ minWidth: "80px", flex: 0 }}>{""}</StyledHeadCell>} */}
        <StyledHeadCellMod style={{ flex: 2 }}> <LabelSmallMod>Name</LabelSmallMod></StyledHeadCellMod>
        {/* {!isMobile && <StyledHeadCell style={{ flex: 2 }}>Schedule</StyledHeadCell>} */}
        {<StyledHeadCellMod style={{ flex: 1 }}> <LabelSmallMod>Room</LabelSmallMod></StyledHeadCellMod>}
        {!isMobile && <StyledHeadCellMod style={{ flex: 1 }}> <LabelSmallMod>Arrival</LabelSmallMod></StyledHeadCellMod>}
        {!isMobile && <StyledHeadCellMod style={{ flex: 1 }}> <LabelSmallMod>Departure</LabelSmallMod></StyledHeadCellMod>}
        {!isMobile && <StyledHeadCellMod style={{ flex: 1 }}> <LabelSmallMod>Code</LabelSmallMod></StyledHeadCellMod>}
        {!isMobile && <StyledHeadCellMod style={{ flex: 3 }}> <LabelSmallMod>Notes</LabelSmallMod></StyledHeadCellMod>}
        {<StyledHeadCellMod style={{ flex: 1 }}> <LabelSmallMod>Status</LabelSmallMod></StyledHeadCellMod>}
        {/* {!isMobile && <StyledHeadCell style={{ flex: 1 }}>Items</StyledHeadCell>} */}
        {/* <StyledHeadCell style={{ minWidth: "80px", flex: 0 }}>{""}</StyledHeadCell> */}
      </StyledHead>
      <StyledBody $width="100%" style={{ minHeight: `${limit * (width > 450 ? 79 : 73)}px` }}>
        {queryLoader && (
          <QueryLoader style={{ minHeight: `${limit * (width > 450 ? 79 : 73) - 2}px` }}>
            <Spinner size={32} />
          </QueryLoader>
        )}
        {(!queryLoader && dataState.length === 0) && (
          <Results style={{ minHeight: `${limit * (width > 450 ? 79 : 73) - 2}px` }}>
            <ParagraphMedium>{`No results`}</ParagraphMedium>
          </Results>
        )}
        {dataState &&
          dataState.map((row: VIPClass, index: number) => (
            <CellButton 
              onClick={()=>_VIPedit(row?.id)} 
              kind={KIND.tertiary} 
              key={`${index}-vip`}
            >
            <StyledRow key={index}>
              {<StyledBorderCell style={{ flex: 2 }}>
                <CellWrapper>
                  <LabelMedium>{`${row?.lastName}, ${row?.firstName}`}</LabelMedium>
                </CellWrapper>
              </StyledBorderCell>}
              {<StyledBorderCell style={{ flex: 1 }}>
                <CellWrapper>
                  <LabelSmall>{`${row?.roomNumber}`}</LabelSmall>
                </CellWrapper>
              </StyledBorderCell>}
              {!isMobile && <StyledBorderCell style={{ flex: 1 }}>
                <CellWrapper>
                  <LabelSmall>{`${`${row?.arrival}`.substring(4)}`}</LabelSmall>
                </CellWrapper>
              </StyledBorderCell>}
              {!isMobile && <StyledBorderCell style={{ flex: 1 }}>
                <CellWrapper>
                  <LabelSmall>{`${`${row?.departure}`.substring(4)}`}</LabelSmall>
                </CellWrapper>
              </StyledBorderCell>}
              {!isMobile && <StyledBorderCell style={{ flex: 1 }}>
                <CellWrapper>
                  <LabelSmall>{`${row?.rateCode}`}</LabelSmall>
                </CellWrapper>
              </StyledBorderCell>}
              {!isMobile && <StyledBorderCell style={{ flex: 3 }}>
                <CellWrapper>
                  <LabelSmall>{`${row?.notes}`}</LabelSmall>
                </CellWrapper>
              </StyledBorderCell>}
              {<StyledBorderCellEnd style={{ flex: 1 }}>
                <CellWrapper>
                  {/* <LabelSmall>{`${row?.vipStatus[0].label || `n/a`}`}</LabelSmall> */}
                  <LabelSmall>{row?.vipStatus[0].label?<SVGIcon size={'standard'} name={row?.vipStatus[0].label} />:'n/a'} </LabelSmall>
                </CellWrapper>
              </StyledBorderCellEnd>}
            </StyledRow>                
            </CellButton>

          ))}
      </StyledBody>
      <div
        className={css({
          paddingTop: theme.sizing.scale600,
          paddingBottom: theme.sizing.scale200,
          paddingRight: theme.sizing.scale400,
          paddingLeft: theme.sizing.scale800,
          display: "flex",
          justifyContent: "space-between",
          "@media (max-width: 620px)": {
            justifyContent: "flex-end",
          },
        })}
      >
        {!isMobile && (
          <StatefulPopover
            content={({ close }) => (
              <StatefulMenu
                items={Array.from({ length: 3 }, (_, i) => ({
                  label: (i + 1) * 5,
                }))}
                onItemSelect={({ item }) => {
                  setLimit(Number(item.label));
                  close();
                }}
                overrides={{
                  List: {
                    style: { height: "150px", width: "100px" },
                  },
                }}
              />
            )}
            placement={PLACEMENT.bottom}
          >
            <Button kind={KIND.tertiary} endEnhancer={TriangleDown}>
              {`${limit} Rows`}
            </Button>
          </StatefulPopover>
        )}
        <Pagination
          numPages={maxPage}
          currentPage={page}
          overrides={{
            PrevButton: {
              component: ({ onClick }: any) => (
                <Button kind={KIND.tertiary} size={SIZE.compact} disabled={disablePrev} onClick={prevPage}>
                  <ChevronLeft size={24} />
                </Button>
              ),
            },
            NextButton: {
              component: ({ onClick }: any) => (
                <Button disabled={disableNext} kind={KIND.tertiary} size={SIZE.compact} onClick={nextPage}>
                  <ChevronRight size={24} />
                </Button>
              ),
            },
            MaxLabel: {
              style: ({ $theme }) => ({
                ...$theme.typography.font300,
                marginRight: $theme.sizing.scale600,
                marginLeft: `5px`,
              }),
            },
            DropdownContainer: {
              style: ({ $theme }) => ({
                marginLeft: $theme.sizing.scale600,
              }),
            },
            Select: {
              component: ({ onClick }: any) => <div style={{ width: `0px`, fontWeight: 400 }}>{`${page}`}</div>,
              props: {
                overrides: {
                  Root: {
                    style: ({ $theme, $disabled, $isFocused, $isPseudoFocused, $error }: any) => ({
                      marginRight: "0px",
                      fontWeight: 100,
                    }),
                  },
                  ValueContainer: {
                    style: ({ $theme }) => ({
                      marginRight: `0px`,
                    }),
                  },
                },
              },
            },
          }}
        />
      </div>
    </CustomTable>

  );
}

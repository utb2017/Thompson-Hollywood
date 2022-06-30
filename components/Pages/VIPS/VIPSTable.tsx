import React, { useEffect } from "react";
import { withStyle, useStyletron } from "baseui";
import { Block } from "baseui/block";
import firebase, {
  updateFirestore,
  getMatrix,
  //getMapboxDirectionsX,
  updateFirestoreGroup,
} from "../../../firebase/clientApp";
import { Check, DeleteAlt } from 'baseui/icon';
import { ChevronRight, ChevronLeft } from "baseui/icon";
//import { StyledHead, StyledHeadCell, StyledBody, StyledRow, StyledCell, StyledAction } from "baseui/table";
import SVGIcon from "../../SVGIcon";
import { useDispatchModalBase } from "../../../context/Modal";
import { StyledTable, StyledHead, StyledHeadCell, StyledBody, StyledRow, StyledCell, StyledAction } from "baseui/table";
import { Caption1, Caption2, Display, H3, H5, Label1, Label2, Label3, Label4, Paragraph1, Paragraph2, Paragraph3 } from "baseui/typography";
import { Theme } from "baseui/theme";
import { styled } from "baseui";
import { TriangleDown } from "baseui/icon";
import { StatefulMenu } from "baseui/menu";
import { Pagination, StatefulPagination } from "baseui/pagination";
import { StatefulPopover, PLACEMENT } from "baseui/popover";
import { Button, KIND, SIZE, SHAPE } from "baseui/button";
import { useQuery } from "../../../context/Query";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { expandBorderStyles } from "baseui/styles";
import { capitalize, isCurr } from "../../../helpers";
import { Spinner, StyledSpinnerNext } from "baseui/spinner";
import { ReactElement } from "react";
import { Tag, VARIANT, KIND as _KIND } from "baseui/tag";
import { useScreen } from "../../../context/screenContext";
import { useRouter } from "next/router"
import { useUser } from "../../../context/userContext"
import { useUsers } from "../../../context/usersContext";
import {ChevronDown} from 'baseui/icon';

import VIP_Edit from "../../Modals/ArrivalVIPedit";



import { useForm } from "../../../context/formContext";
import { useSnackbar, DURATION } from "baseui/snackbar";
import { VIPClass } from "../../../classes";



const CellWrapper = styled("div", ({ $theme }) => {
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



const QueryLoader = styled("div", ({ $theme, $isDark }) => {
  return {
    position: "absolute",
    width: "100%",
    display: "flex",
    //height:'auto',
    backgroundColor: $isDark ? `rgba(51, 51, 51, 0.5)` : `rgba(255, 255, 255, 0.6)`,
    //bottom:'85px',
    top: "45px",
    alignItems: "center",
    justifyContent: "center",
    transition: `background-color 0.2s ease`,
    zIndex: 20,
  };
});
const Results = styled("div", ({ $theme, $isDark }) => {
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

const StyledHeadCellMod = styled(StyledHeadCell, ({ $theme, $isDark }) => {
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
const Label3Mod = styled(Label3, ({ $theme, $isDark }) => {
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
  const {
    form,
    setForm,
    error,
    setError,
    loading,
    setLoading,
    isSideOpen,
    setIsSideOpen,
  } = useForm();
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
    if(router?.query?.filter === 'arriving'){
      setTotalsField('DUEIN');
    }
    if(router?.query?.filter === 'inhouse'){
      setTotalsField(router?.query?.filter);
    }
    if(router?.query?.filter === 'dueout'){
      setTotalsField('DUEOUT');
    }
    if(router?.query?.filter === 'all'){
      setTotalsField('total');
    }
    setTotalsDoc("ArrivalVIPs");
    setTotalsCollection("Totals")
    
    setQueryCollection("ArrivalVIPs");
    setOrderBy("firstName");
    if(router?.query?.filter === 'arriving'){
      setWhere([["reservationStatus", "==", 'DUEIN']])
    }
    if(router?.query?.filter === 'inhouse'){
      setWhere([["reservationStatus", "in", ['CHECKEDIN','DUEOUT']]])
    }
    if(router?.query?.filter === 'dueout'){
      setWhere([["reservationStatus", "==", 'DUEOUT']])
    }
    if(router?.query?.filter === 'all'){
      setWhere(null)
    }
    setLimit(5);
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
    // }, [router]);
  }, [router]);

  useEffect(() => {
    console.log(`fireStoreQuery`)
    console.log(fireStoreQuery)
  }, [fireStoreQuery]);

  return (

    <CustomTable>
      <StyledHead $width="100%">
        {/* {!isMobile && <StyledHeadCell style={{ minWidth: "80px", flex: 0 }}>{""}</StyledHeadCell>} */}
        <StyledHeadCellMod style={{ flex: 2 }}> <Label3Mod>Name</Label3Mod></StyledHeadCellMod>
        {/* {!isMobile && <StyledHeadCell style={{ flex: 2 }}>Schedule</StyledHeadCell>} */}
        {<StyledHeadCellMod style={{ flex: 1 }}> <Label3Mod>Room</Label3Mod></StyledHeadCellMod>}
        {!isMobile && <StyledHeadCellMod style={{ flex: 1 }}> <Label3Mod>Arrival</Label3Mod></StyledHeadCellMod>}
        {!isMobile && <StyledHeadCellMod style={{ flex: 1 }}> <Label3Mod>Departure</Label3Mod></StyledHeadCellMod>}
        {!isMobile && <StyledHeadCellMod style={{ flex: 1 }}> <Label3Mod>Code</Label3Mod></StyledHeadCellMod>}
        {!isMobile && <StyledHeadCellMod style={{ flex: 3 }}> <Label3Mod>Notes</Label3Mod></StyledHeadCellMod>}
        {<StyledHeadCellMod style={{ flex: 1 }}> <Label3Mod>Status</Label3Mod></StyledHeadCellMod>}
        {/* {!isMobile && <StyledHeadCell style={{ flex: 1 }}>Items</StyledHeadCell>} */}
        {/* <StyledHeadCell style={{ minWidth: "80px", flex: 0 }}>{""}</StyledHeadCell> */}
      </StyledHead>
      <StyledBody $width="100%" style={{ minHeight: `${limit * (width > 450 ? 79 : 73)}px` }}>
        {queryLoader && (
          <QueryLoader $isDark={themeState?.dark} style={{ minHeight: `${limit * (width > 450 ? 79 : 73) - 2}px` }}>
            <StyledSpinnerNext size={32} />
          </QueryLoader>
        )}
        {(!queryLoader && dataState.length === 0) && (
          <Results $isDark={themeState?.dark} style={{ minHeight: `${limit * (width > 450 ? 79 : 73) - 2}px` }}>
            <Paragraph2>{`No results`}</Paragraph2>
          </Results>
        )}
        {dataState &&
          dataState.map((row: VIPClass, index: number) => (
            <CellButton 
              onClick={()=>_VIPedit(row?.id)} 
              kind={KIND.tertiary}  
            >
            <StyledRow key={index}>
              {isMobile && <StyledBorderCell style={{ flex: 2 }}>
                <CellWrapper>
                  <Label4>{`${row?.lastName}, ${row?.firstName}`}</Label4>
                </CellWrapper>
              </StyledBorderCell>}
              {isMobile && <StyledBorderCell style={{ flex: 1 }}>
                <CellWrapper>
                  <Label3>{`${row?.roomNumber}`}</Label3>
                </CellWrapper>
              </StyledBorderCell>}
              {!isMobile && <StyledBorderCell style={{ flex: 1 }}>
                <CellWrapper>
                  <Label3>{`${`${row?.arrival}`.substring(4)}`}</Label3>
                </CellWrapper>
              </StyledBorderCell>}
              {!isMobile && <StyledBorderCell style={{ flex: 1 }}>
                <CellWrapper>
                  <Label3>{`${`${row?.departure}`.substring(4)}`}</Label3>
                </CellWrapper>
              </StyledBorderCell>}
              {!isMobile && <StyledBorderCell style={{ flex: 1 }}>
                <CellWrapper>
                  <Label3>{`${row?.rateCode}`}</Label3>
                </CellWrapper>
              </StyledBorderCell>}
              {!isMobile && <StyledBorderCell style={{ flex: 3 }}>
                <CellWrapper>
                  <Label3>{`${row?.notes}`}</Label3>
                </CellWrapper>
              </StyledBorderCell>}
              {isMobile && <StyledBorderCellEnd style={{ flex: 1 }}>
                <CellWrapper>
                  <Label3>{`${row?.vipStatus[0].label || `n/a`}`}</Label3>
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
                <Button kind={KIND.minimal} size={SIZE.compact} disabled={disablePrev} onClick={prevPage}>
                  <ChevronLeft size={24} />
                </Button>
              ),
            },
            NextButton: {
              component: ({ onClick }: any) => (
                <Button disabled={disableNext} kind={KIND.minimal} size={SIZE.compact} onClick={nextPage}>
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
                  // ControlContainer: {
                  //   style: ({ $theme, $disabled, $isFocused, $isPseudoFocused, $error }: any) => ({
                  //     height: "45px",
                  //     borderLeftColor: "transparent",
                  //     borderRightColor: "transparent",
                  //     borderTopColor: "transparent",
                  //     borderBottomColor: "transparent",
                  //     boxShadow: "none",
                  //     backgroundColor: $disabled
                  //       ? $theme.colors.buttonDisabledFill
                  //       : $isFocused || $isPseudoFocused
                  //         ? $theme.colors.buttonSecondaryHover
                  //         : $error
                  //           ? $theme.colors.negative50
                  //           : $theme.colors.buttonSecondaryFill,
                  //   }),
                  // },
                  // SingleValue: {
                  //   style: ({ $theme }: any) => ({
                  //     position: "relative",
                  //     paddingTop: "0",
                  //     paddingBottom: "0",
                  //     paddingLeft: $theme.sizing.scale200,
                  //     paddingRight: $theme.sizing.scale500,
                  //     color: $theme.colors.buttonTertiaryText,
                  //     ...$theme.typography.font350,
                  //   }),
                  // },
                  // SelectArrow: {
                  //   style: ({ $theme }: any) => ({
                  //     width: "24px",
                  //     height: "24px",
                  //     color: $theme.colors.buttonTertiaryText,
                  //   }),
                  // },
                },
              },
            },
          }}
        />
      </div>
    </CustomTable>

  );
}

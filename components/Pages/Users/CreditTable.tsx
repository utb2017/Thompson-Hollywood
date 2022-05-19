import React from "react";
import { withStyle, useStyletron } from "baseui";
import { Block } from "baseui/block";
import { ArrowUp, ArrowDown, Search, Plus, Delete, Overflow, ChevronRight, ChevronLeft } from "baseui/icon";
//import { StyledHead, StyledHeadCell, StyledBody, StyledRow, StyledCell, StyledAction } from "baseui/table";
import SVGIcon from "../../SVGIcon";
import firebase, { deleteCredit } from '../../../firebase/clientApp'
import { useDispatchModalBase } from "../../../context/Modal";
import { StyledTable, StyledHead, StyledHeadCell, StyledBody, StyledRow, StyledCell, StyledAction } from "baseui/table";
import { Caption1, Caption2, Label1, Label2, Paragraph1, Paragraph2, Paragraph3 } from "baseui/typography";
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
import { useRouting } from '../../../context/routingContext'
// import CreditDelete from "./CreditDelete";
// import CreditCreate from "./CreditCreate";
// import CreditEdit from "./CreditEdit";
import { Tag, VARIANT } from "baseui/tag";
import { useScreen } from "../../../context/screenContext";
import RemoveCredit from "./modals/RemoveCredit";
//import router from "next/router";
import {useRouter} from 'next/router'


type Selected = {
  label: string | number;
  value: string | Date;
};
type CreditClass  = {
  active:boolean,
  featured:boolean,
  amount: number;
  initialAmount: number;
  created: any;
  id: string;
  title: string;
  used: boolean;
  user: string;
};
class CreditClassX {
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
interface CreditClassMod extends CreditClass {
  fireCredit: CreditClass;
}
type Query = {
  data: any;
  status: string;
  error: any;
};

const Indicator = styled("div", ({ $isActive = false, $theme, $featured = false }) => {
  return {
    height: "8px",
    width: "8px",
    borderRadius: "100%",
    backgroundColor: $isActive ? $theme.colors.positive300 : $theme.colors.positive50,
  };
});
const CellWrapper = styled("div", ({ $theme }) => {
  return {
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
// const PageNum = styled("div", ({ $theme }) => {
//     return {

//     };
//   });

const TagWrapper = styled("div", ({ $theme }) => {
  return {
    minHeight: "100%",
    width: "100%",
    display: "flex",
    //minHeight: "46px",
    height: "78px",
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

const StyledBorderCell = withStyle<typeof StyledCell,Theme >(StyledCell, ({$theme}) => ({
  borderBottom: `1px solid ${$theme.borders.border600.borderColor}`,
  height:'79px'
}));
const CustomTable = withStyle<typeof StyledTable,Theme >(StyledTable, ({$theme}) => ({
  marginBottom:'0px'
}));

export default function Example() {
  const [css, theme] = useStyletron();
  const [dataState, setDataState] = React.useState([]);
  const { modalBaseDispatch, modalBaseState } = useDispatchModalBase();
  const { toggleTheme, themeState } = useScreen();
  //const [page, setPage] = React.useState(1);
  //const [limit, setLimit] = React.useState(12);

  const router = useRouter()
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
    queryLoader,
  } = useQuery();

  React.useEffect(() => {
    if (dataList.length) {
      setDataState(dataList);
    }
  }, [dataList]);

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
  const _editCredit = (fireCredit: CreditClass) => {
   // const component = () => <CreditEdit fireCredit={fireCredit} />;
   // openModalBase(component, true);
  };

  // const _deleteCredit = (id: string) => {
  //  const component: () => ReactElement = () => <RemoveCredit />;
  //  openModalBase(component, false);
  // };
    

  const _deleteCredit = (id:string) => {
    const component: () => ReactElement = () => <RemoveCredit id={id} />;
    openModalBase(component, false);
};
  const { setNavLoading } = useRouting()

  // const _deleteCredit = (id:string) => {
  //   setNavLoading(true)
  //   try{
  //     deleteCredit({creditID:id, userID:`${router.query.id}`})
      
  //   }catch(e){
  //     alert(e?.message || e || 'Error deleting credit' )
  //   }finally{  
  //     setNavLoading(false)
  //   }
    

  // }

  return (

      <CustomTable>
        <StyledHead $width="100%">
          <StyledHeadCell style={{ minWidth: "40px", flex: 0 }}>{""}</StyledHeadCell>
          <StyledHeadCell style={{ flex: 2 }}>Title</StyledHeadCell>
          {!isMobile && <StyledHeadCell style={{ flex: 1 }}>Amount</StyledHeadCell>}
          {!isMobile && <StyledHeadCell style={{ flex: 1 }}>Remaining</StyledHeadCell>}
          {/* {!isMobile && <StyledHeadCell style={{ flex: 1 }}>Code</StyledHeadCell>} */}
          <StyledHeadCell style={{ minWidth: "80px", flex: 0 }}>{""}</StyledHeadCell>
        </StyledHead>
        <StyledBody $width="100%" style={{ minHeight: `${limit * (width > 450 ? 79 : 73)}px` }}>
          {queryLoader && (
            <QueryLoader $isDark={themeState?.dark} style={{ minHeight: `${limit * (width > 450 ? 79 : 73) - 2}px` }}>
              <StyledSpinnerNext size={32} />
            </QueryLoader>
          )}
          {dataState &&
            dataState.map((row: CreditClass, index: number) => (
              <StyledRow key={index}>
                <StyledBorderCell  style={{ minWidth: "40px", flex: 0 }}>
                  <CellWrapper>
                    <Indicator $isActive={row?.active} $featured={row?.featured} />
                  </CellWrapper>
                </StyledBorderCell>
                <StyledBorderCell  style={{ flex: 2 }}>
                  <CellWrapper>{row?.title}</CellWrapper>
                </StyledBorderCell>
                {!isMobile && (
                  <StyledBorderCell style={{ flex: 1 }}>
                    <CellWrapper>{`${isCurr(row.initialAmount)}`}</CellWrapper>
                  </StyledBorderCell>
                )}
                {!isMobile && (
                  <StyledBorderCell style={{ flex: 1 }}>
                    <CellWrapper>{`${isCurr(row.amount)}`}</CellWrapper>
                  </StyledBorderCell>
                )}
                {/* {!isMobile && (
                  <StyledBorderCell onClick={() => _editCredit(row)} style={{ flex: 1 }}>
                    <CellWrapper>{`${row?.code || ``}`}</CellWrapper>
                  </StyledBorderCell>
                )} */}
                <StyledBorderCell style={{ minWidth: "80px", flex: 0 }}>
                  <StyledAction style={{ width: "100%" }} onClick={()=>_deleteCredit(row.id)}>
                    <CellWrapper style={{ justifyContent: "center" }}>
                      {/* <Button   kind={KIND.minimal} size={SIZE.compact} shape={SHAPE.circle} key={index}> */}
                      <SVGIcon name="delete" color={theme.colors.negative300} />
                      {/* </Button> */}
                    </CellWrapper>
                  </StyledAction>
                </StyledBorderCell>
              </StyledRow>
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
                component: ({ onClick }: any) => <div style={{ width: `0px`, fontWeight:400 }}>{`${page}`}</div>,
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

import React, { useEffect } from "react";
import { withStyle, useStyletron } from "baseui";
import { ChevronRight, ChevronLeft, Upload, ArrowDown } from "baseui/icon";
import { useDispatchModalBase } from "../../../context/Modal";
import { StyledTable, StyledHead, StyledHeadCell, StyledBody, StyledRow, StyledCell } from "baseui/table";
import { LabelSmall, LabelMedium, ParagraphMedium } from "baseui/typography";
import { Theme } from "baseui/theme";
import { styled } from "baseui";
import { TriangleDown } from "baseui/icon";
import { StatefulMenu } from "baseui/menu";
import { Pagination } from "baseui/pagination";
import { StatefulPopover, PLACEMENT } from "baseui/popover";
import { Button, KIND, SHAPE, SIZE} from "baseui/button";
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
import firebase from "firebase";
import { useFirestoreQuery } from "../../../hooks/useFirestoreQuery";
import { useUser } from "../../../context/Auth";



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

const CellWrapperFirst = styled("div", () => {
  return {
    justifyContent:'left',
    paddingLeft:'2.5%',
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
const CellButton = styled('div', ({ $theme }) => {
  return {
    //backgroundColor:`white`,
    width:`100%`,
    padding:`0px!important`,
    border: `none`,
    display:'block',
  };
});
interface Query {
  data: any;
  status: string;
  error: any;
}
export default function ReportsTable({tblDate}) {
  console.log(tblDate)
  const [css, theme] = useStyletron();
  const [dataState, setDataState] = React.useState([]);
  const [dateState, setDateState] = React.useState(false);
  const { modalBaseDispatch, modalBaseState } = useDispatchModalBase();
  const { toggleTheme, themeState } = useScreen();
  const router = useRouter()
  const { loadingUser } = useUser()
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
    setDataList
  } = useQuery();

  const rqp = router?.query?.property as "LAXTH" | "LAXTE";



  // React.useEffect(() => {
    
  //   if(!loadingUser && tblDate && !dataState?.length){
      
  //     const getList = async (d,p) => {
  //       const list = [];
  //       const storage = firebase.storage();
  //       const folderRef = storage.ref(`${p}/reports/${d}`);
  //       const folder = await folderRef.listAll();
  //       folder.items.map(async (item, i) => {
  //           const file = await item.getMetadata();
  //           const newFile = {...file}
  //           newFile.key = i
  //           console.log( newFile)
  //           //let tmpState = [...dataState]
  //           //tmpState.push(file)
  //           //setDataState(tmpState)
  //           //setDataState(current => [...current, file]);
  //           //setDataState(existing => existing.map(c => c.name === item.name ? {...c,quantityAchete: parseInt(e.target.value)} : c))
  //           return list.push(newFile)
  //       })
  //       setDataState(arr1 => [...arr1, ...list]);
   
        
  //       //alert(`set`)
        
  //      // setDataState(list)
   
  //       //setDataState(existing => existing.map(c => c.id === id ? {...c,quantityAchete: parseInt(e.target.value)} : c))
  
      
  //       console.log(list)
  //     }
  //     //alert("get")
  //     getList(tblDate, rqp)
  //   }
   
  //   // return ()=>{
  //   //   setDataState([])  //whenever the component removes it will executes
  //   // }
  // }, [tblDate, rqp, loadingUser]);


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

  useEffect(() => {
    console.log(`dataState`)
    console.log(dataState)
  }, [dataState]);

/* add shit to the query questions*/
useEffect(() => {

  setQueryCollection(`${rqp}_Reports_${tblDate}`);
  setOrderBy("fileName");
  setLimit(15);


}, [rqp, tblDate, router]);


useEffect(() => {
  if (dataList?.length && !queryLoader) {
    setDataState(dataList);
  } else if (!dataList?.length && !queryLoader) {
    setDataState([]);
  }
}, [dataList, queryLoader, router]);

useEffect(() => {
  return () => {
    setQueryCollection(null);
    setOrderBy(null);
    setLimit(5);
  };
}, []);



// useEffect(() => {  
//   return () => {
//     setTotalsCollection(null);
//     setTotalsDoc(null);
//     setTotalsField(null);
//     setQueryCollection(null);
//     setOrderBy(null);
//     setWhere(null);
//     setLimit(5);
//     setDataList([{}])
//     setDataState([{}]);
//   };
// }, []);


  useEffect(() => {
    console.log(`fireStoreQuery`)
    console.log(fireStoreQuery)
  }, [fireStoreQuery]);

  return (

    <CustomTable>
      <StyledHead $width="100%">
        {/* {!isMobile && <StyledHeadCell style={{ minWidth: "80px", flex: 0 }}>{""}</StyledHeadCell>} */}
        <StyledHeadCellMod style={{ flex: 4 }}> <LabelSmallMod>Name</LabelSmallMod></StyledHeadCellMod>
        {/* {!isMobile && <StyledHeadCell style={{ flex: 2 }}>Schedule</StyledHeadCell>} */}
        {!isMobile && <StyledHeadCellMod style={{ flex: 1 }}> <LabelSmallMod>Type</LabelSmallMod></StyledHeadCellMod>}
        {!isMobile && <StyledHeadCellMod style={{ flex: 1 }}> <LabelSmallMod>Property</LabelSmallMod></StyledHeadCellMod>}
        {<StyledHeadCellMod style={{ flex:'1 1 40px' }}> <LabelSmallMod>Action</LabelSmallMod></StyledHeadCellMod>}
        {/* {!isMobile && <StyledHeadCellMod style={{ flex: 1 }}> <LabelSmallMod>Code</LabelSmallMod></StyledHeadCellMod>}
        {!isMobile && <StyledHeadCellMod style={{ flex: 1 }}> <LabelSmallMod>Notes</LabelSmallMod></StyledHeadCellMod>} */}
        {/* {<StyledHeadCellMod style={{ flex: 1 }}> <LabelSmallMod>Status</LabelSmallMod></StyledHeadCellMod>} */}
        {/* {!isMobile && <StyledHeadCell style={{ flex: 1 }}>Items</StyledHeadCell>} */}
        {/* <StyledHeadCell style={{ minWidth: "80px", flex: 0 }}>{""}</StyledHeadCell> */}
      </StyledHead>
      <StyledBody $width="100%" style={{ minHeight: `${1 * (width > 450 ? 79 : 73)}px` }}>
        {(fireStoreQuery?.status === 'loading' || fireStoreQuery?.status === 'idle') && (
          <QueryLoader style={{ minHeight: `${limit * (width > 450 ? 79 : 73) - 2}px` }}>
            <Spinner size={32} />
          </QueryLoader>
        )}
        {(!queryLoader && fireStoreQuery?.data?.length === 0) && (
          <Results style={{ minHeight: `${limit * (width > 450 ? 79 : 73) - 2}px` }}>
            <ParagraphMedium>{`No results`}</ParagraphMedium>
          </Results>
        )}
        {!queryLoader && dataState &&
          (dataState || []).map((row: any, index: number) => (
            <CellButton 
              //onClick={()=>_VIPedit(row?.id)} 
              //kind={KIND.tertiary} 
              key={`${index}-vip`}
            >
            <StyledRow key={index}>
              {<StyledBorderCell style={{ flex: 4 }}>
                <CellWrapperFirst>
                  <LabelMedium>{`${row?.fileName || 'N/A'}`}</LabelMedium>
                </CellWrapperFirst>
              </StyledBorderCell>}
              {!isMobile && <StyledBorderCell style={{ flex: 1 }}>
                <CellWrapper>
                <LabelSmall>{`${`${row?.fileType || 'N/A'}`}`}</LabelSmall>
                </CellWrapper>
              </StyledBorderCell>}
              {!isMobile && <StyledBorderCell style={{ flex: 1 }}>
                <CellWrapper>
                  <LabelSmall>{`${`${row?.property || 'N/A'}`}`}</LabelSmall>
                </CellWrapper>
              </StyledBorderCell>}
              {<StyledBorderCellEnd style={{ flex:'1 1 40px' }}>
              <CellWrapper>
              <Button 
              //shape={SHAPE.circle} 
              disabled
      kind={KIND.tertiary}>
          Download
        </Button>
                </CellWrapper>
              </StyledBorderCellEnd>}
            </StyledRow>                
            </CellButton>

          ))}
      </StyledBody>
      {/* <div
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
      </div> */}
    </CustomTable>

  );
}

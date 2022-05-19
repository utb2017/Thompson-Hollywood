import React, { useEffect, useState } from "react";
import { withStyle, useStyletron } from "baseui";
import { Block } from "baseui/block";
import { ChevronRight, ChevronLeft, Hide, Show } from "baseui/icon";
import SVGIcon from "../../SVGIcon";
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
import { Spinner, StyledSpinnerNext } from "baseui/spinner";
import { ReactElement } from "react";
import BrandDelete from "./BrandDelete";
import BrandCreate from "./BrandCreate";
import BrandEdit from "./BrandEdit";
import { Tag, VARIANT } from "baseui/tag";
import { useScreen } from "../../../context/screenContext";
import { isCurr } from "../../../helpers";
import { useSnackbar, DURATION } from "baseui/snackbar";
import { Check, Delete, DeleteAlt } from "baseui/icon";
import { Toast, ToasterContainer, toaster } from "baseui/toast";
import isEqual from "lodash.isequal"
import firebase from "../../../firebase/clientApp";
import {
  List,
  arrayMove,
  arrayRemove
} from "baseui/dnd-list";
import { useUser } from "../../../context/userContext";
type Selected = {
  label: string | number | Date;
  value: string | number | Date;
};
interface BrandClass {
  active: boolean | null;
  cartLimit: number | null;
  description: string | null;
  featured: boolean | null;
  flower: boolean | null;
  genome: boolean | null;
  id: string | null;
  img: string | null;
  filePath: string | null;
  key: string | null;
  menuOrder?: number | null;
  onSale: boolean | null;
  saleCode: string | null;
  saleTitle: string | null;
  saleRate: number | null;
  sales?: number | null;
  sold?: number | null;
  title: string | null;
  total?: number | null;
  weight: boolean | null;
}
interface BrandClassMod extends BrandClass {
  fireBrand: BrandClass;
}
type Query = {
  data: any;
  status: string;
  error: any;
};

const Indicator = styled("div", ({ $active = false, $theme, $inventory = null }) => {
  //$isActive ? $theme.colors.positive300 : $theme.colors.positive50
  let color = $theme.colors.positive50
  if ($active && ($inventory >= 10)) {
    color = $theme.colors.positive300
  } else if ($active && ($inventory < 10 && $inventory >= 1)) {
    color = $theme.colors.warning300
  } else if ($active && ($inventory < 1)) {
    color = $theme.colors.negative300
  }


  return {
    height: "8px",
    width: "8px",
    borderRadius: "100%",
    backgroundColor: color,
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
const PaginationWrapper = styled("div", ({ $theme }) => {
  return {
    height: "48px",
    width: `100%`,
    //borderTop: `1px solid ${$theme.borders.border600.borderColor}`,
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

const StyledBorderCell = withStyle<typeof StyledCell, Theme>(StyledCell, ({ $theme }) => ({
  borderLeft: 'none',
  borderRight: 'none',
  borderBottom: `1px solid ${$theme.borders.border600.borderColor}`,
  height: "79px",
}));
const CustomTable = withStyle<typeof StyledTable, Theme>(StyledTable, ({ $theme }) => ({
  marginBottom: "0px",
  borderLeft: 'none',
  borderRight: 'none',
  borderTop: 'none',
  borderBottom: 'none',
}));


type INullableReactText = React.ReactText | null;
export default function BrandTable({ sortFilter }) {
  const [css, theme] = useStyletron();
  const [dataState, setDataState] = useState<BrandClass[] | []>([]);
  const [listState, setListState] = useState<string[] | []>([]);
  const { modalBaseDispatch, modalBaseState } = useDispatchModalBase();
  const { toggleTheme, themeState } = useScreen();
  const [searchBrands, setSearchBrands] = React.useState([]);
  const { user, fireBrands } = useUser();
  const { enqueue, dequeue } = useSnackbar();
  const [first, setFirst] = React.useState(true);
  const [defaultOrder, setDefaultOrder] = React.useState([]);
  const [toastKey, setToastKey] = useState<INullableReactText>(null);
  const showToast = (x: string) => setToastKey(toaster.negative(`${x}`, {}));

  const saveOrder = React.useCallback( async () => {
    if (isEqual(defaultOrder, searchBrands)) {

      //return alert('no changes')
    } else {
      //key=key.replace(/\s+/g,"_")
      const newOrderIDstr = []
      for (const orderNameStr of searchBrands) {
        //alert(JSON.stringify(orderNameStr))
        for (const key in fireBrands.data) {
          const original = fireBrands.data[key]
          //alert(JSON.stringify(original?.title))
          if (original.title === orderNameStr) {
            newOrderIDstr.push(original.id)
          }

        }

      }

      if (Array.isArray(newOrderIDstr) && newOrderIDstr.length) {
        //return
        //setLoading(true);
        enqueue({ message: "Updating brands sort", progress: true }, DURATION.infinite);
        try {
         const updateBrandOrder = firebase.functions().httpsCallable("updateBrandOrder");
          const response = await updateBrandOrder(newOrderIDstr);
          dequeue();
          enqueue({ message: "Brands updated", startEnhancer: ({ size }) => <Check size={size} /> }, DURATION.short);
          
          // if (response?.data?.success === true) {
          //   //alert(`${response?.data?.form}`)
          //   //console.log(response?.data?.form);
          //   //setFireBrandDefault({...response?.data?.form});
          //   //setForm({...response?.data?.form});
          // }
        } catch (e) {
          //setError(`${e?.message || e}`);
          //setError((oldError: Errors) => ({ ...oldError, ...{ server: `Brand not updated` } }));
          dequeue();
          showToast(`${e?.message || e}`);
          enqueue({ message: `Your brands weren't updated`, startEnhancer: ({ size }) => <DeleteAlt size={size} /> }, DURATION.short);
        } finally {
          //setLoading(false);
        }


      }
    }
  }, [defaultOrder, searchBrands, fireBrands])
  useEffect(() => {

    if (first) {
      setFirst(false)
    } else {
      if (!sortFilter) {
        console.log('dataState')
        console.log(dataState)
        saveOrder()
      }
    }
  }, [sortFilter]);
  useEffect(() => {
    return () => {
      setFirst(true)
    };
  }, []);
  useEffect(() => {
    const tempBrandList = []
    if (fireBrands.data) {
      const { data } = fireBrands;
      //alert(JSON.stringify(data))
      for (const key in data) {
        const collection = data[key];
        tempBrandList.push(`${collection?.title}`)
        // if (router.query?.collection === collection?.id) {
        //   setSelectedBrand({ label: `${collection?.title}`, value: `${collection?.id}` });
        //   setSelectedTotal(isNum(collection?.total));
        // }
      }
    }
    //alert(JSON.stringify(tempBrandList))
    setSearchBrands(tempBrandList)
  }, [fireBrands]);


  //const [page, setPage] = React.useState(1);
  //const [limit, setLimit] = React.useState(12);

  const { width, height } = useWindowSize();
  const isMobile = Boolean(width < 620);
  const { maxPage, disableNext, disablePrev, page, limit, setLimit, orderBy, setOrderBy, nextPage, prevPage, dataList, queryLoader } =
    useQuery();
  const [items, setItems] = React.useState([
    "Item 1",
    "Item 2",
    "Item 3"
  ]);


  useEffect(() => {
    if (dataList.length) {
      const x = dataList as BrandClass[]
      setDataState(x);
    } else {
      if (!queryLoader) {
        setDataState([]);
      }
    }
  }, [dataList, queryLoader]);

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
  const _editBrand = (fireBrand: BrandClass) => {
    const component = () => <BrandEdit fireBrand={fireBrand} />;
    openModalBase(component, true);
  };

  const _deleteBrand = (fireBrand: BrandClass) => {
    const component: () => ReactElement = () => <BrandDelete fireBrand={fireBrand} />;
    openModalBase(component, false);
  };
  return (

    <div >
      <CustomTable>
        <StyledHead className={css({ zIndex: 20 })} $width="100%">
          <StyledHeadCell style={{ minWidth: "48px", flex: 0 }}>{""}</StyledHeadCell>
          <StyledHeadCell style={{ flex: 2 }}>Name</StyledHeadCell>
          {/* {!isMobile && !sortFilter && <StyledHeadCell style={{ flex: 2 }}>Discounts</StyledHeadCell>} */}
          {!isMobile && !sortFilter && <StyledHeadCell style={{ flex: 1 }}>Items</StyledHeadCell>}
          {!isMobile && !sortFilter && <StyledHeadCell style={{ flex: 1 }}>Sold</StyledHeadCell>}
          <StyledHeadCell style={{ minWidth: "80px", flex: 0 }}>{""}</StyledHeadCell>
        </StyledHead>
        <StyledBody $width="100%" style={{ minHeight: `${limit * (width > 450 ? 79 : 79)}px` }}>
          {queryLoader && (
            <QueryLoader $isDark={themeState?.dark} style={{ minHeight: `${limit * (width > 450 ? 79 : 79) - 2}px` }}>
              <StyledSpinnerNext size={26} />
            </QueryLoader>
          )}
          {dataState && !sortFilter &&
            dataState.map((row: BrandClass, index: number) => (
              <StyledRow style={{ zIndex: 3 }} key={index}>
                <StyledBorderCell onClick={() => _editBrand(row)} style={{ minWidth: "48px", flex: 0 }}>
                  <CellWrapper>
                    {row.active ? <Show /> : <Hide />}
                  </CellWrapper>
                </StyledBorderCell>
                <StyledBorderCell onClick={() => _editBrand(row)} style={{ flex: 2 }}>
                  <CellWrapper onClick={() => _editBrand(row)}>{row.title}</CellWrapper>
                </StyledBorderCell>
                {/* {!isMobile && (
                  <StyledBorderCell style={{ flex: 2, paddingTop: `0px`, paddingBottom: "0px" }} onClick={() => _editBrand(row)}>
                    <TagWrapper style={{ flexDirection: "column", overflow: "scroll", justifyContent: "center", alignItems: "flex-start" }}>
                      {row?.collections ? (
                        (row?.collections || []).map((collectionSelect: Selected, index: number) => {
                          return (
                            <Tag
                              key={`${index}_tag`}
                              //color={`${theme.colors.rating400}`}
                              //variant={VARIANT.solid}
                              overrides={{
                                Root: {
                                  style: ({ $theme }) => ({
                                    marginBottom: "0px",
                                    marginRight: "0px",
                                    marginLeft: "0px",
                                    marginTop: "3px",
                                    maxWidth: `115px`,
                                  }),
                                },
                              }}
                              closeable={false}
                            >
                              {`${collectionSelect?.label}`}
                            </Tag>
                          );
                        })
                      ) : (
                        <></>
                      )}
                    </TagWrapper>
                  </StyledBorderCell>
                )} */}
                {!isMobile && (
                  <StyledBorderCell onClick={() => _editBrand(row)} style={{ flex: 1 }}>
                    <CellWrapper>{`${row?.total}`}</CellWrapper>
                  </StyledBorderCell>
                )}
                {!isMobile && (
                  <StyledBorderCell onClick={() => _editBrand(row)} style={{ flex: 1 }}>
                    <CellWrapper>{`${row?.sold}`}</CellWrapper>
                  </StyledBorderCell>
                )}
                <StyledBorderCell style={{ minWidth: "80px", flex: 0 }}>
                  <StyledAction style={{ width: "100%" }} onClick={() => _deleteBrand(row)}>
                    <CellWrapper style={{ justifyContent: "center" }}>
                      {/* <Button   kind={KIND.minimal} size={SIZE.compact} shape={SHAPE.circle} key={index}> */}
                      <SVGIcon name="delete" color={theme.colors.negative300} />
                      {/* </Button> */}
                    </CellWrapper>
                  </StyledAction>
                </StyledBorderCell>
              </StyledRow>
            ))}

          {sortFilter && <List

            overrides={{
              Item: {
                style: ({ $theme }) => ({
                  height: `79px`,
                  width: "70%"
                  //borderBottom: `1px solid ${theme.borders.border600.borderColor}`,
                  //borderBottomColor: theme.borders.border300.borderColor,
                })
              }
            }}
            items={searchBrands}
            onChange={({ oldIndex, newIndex }) =>
              setSearchBrands(
                newIndex === -1
                  ? arrayRemove(searchBrands, oldIndex)
                  : arrayMove(searchBrands, oldIndex, newIndex)
              )
              // setItems(
              //   newIndex === -1
              //     ? arrayRemove(items, oldIndex)
              //     : arrayMove(items, oldIndex, newIndex)
              // )
            }
          />}
        </StyledBody>
        <div
          className={css({
            paddingTop: theme.sizing.scale600,
            paddingBottom: theme.sizing.scale200,
            paddingRight: theme.sizing.scale400,
            paddingLeft: theme.sizing.scale800,
            display: "flex",
            borderTop: sortFilter ? `1px solid ${theme.borders.border600.borderColor}` : 'unset',
            borderTopColor: sortFilter ? theme.borders.border600.borderColor : 'unset',
            justifyContent: "space-between",
            "@media (max-width: 620px)": {
              justifyContent: "flex-end",
            },
          })}
        >
          {sortFilter && <PaginationWrapper />}
          {!sortFilter && (
            <>
              {!isMobile &&
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
              }
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
            </>
          )}

        </div>
      </CustomTable>
      <ToasterContainer
        placement={PLACEMENT.topRight}
        overrides={{
          Root: { style: ({ $theme }) => ({ zIndex: 50 }) },
        }}
        usePortal={true}
      />
    </div>
  );
}

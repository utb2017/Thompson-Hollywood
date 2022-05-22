import React, { useEffect, useState } from "react";
import { withStyle, useStyletron } from "baseui";
import { Block } from "baseui/block";
import { ChevronRight, ChevronLeft } from "baseui/icon";
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
import ProductDelete from "./ProductDelete";
import ProductCreate from "./ProductCreate";
import ProductEdit from "./ProductEdit";
import { Tag, VARIANT } from "baseui/tag";
import { useScreen } from "../../../context/screenContext";
import { isCurr } from "../../../helpers";
import Inventory from "./modals/Inventory";


type Selected = {
  label: string | number | Date;
  value: string | number | Date;
};
class ProductClass {
  id: string | null;
  genome: Selected;
  brandID: string;
  collectionIDs: string[];
  sold: number;
  genomeID: string;
  wholesale: number;
  active: boolean;
  price: number;
  comparePrice: number;
  //effects: object;
  //collection: string;
  thc: number;
  onSale: boolean;
  inventory: number;
  saleTitle: string;
  weight: string;
  queryIDs: string[];
  saleRate: null | number | string;
  brandId: string;
  type: Selected;
  typeID: string;
  filePath: string;
  cbd: number | string;
  img: string;
  collections: Selected[];
  key: string;
  description: string;
  brand: Selected;
  saleCode: string;
  size: string;
  name: string;

  constructor(
    id: string | null,
    genome: Selected,
    brandID: string,
    collectionIDs: string[],
    sold: number,
    genomeID: string,
    wholesale: number,
    active: boolean,
    price: number,
    comparePrice: number,
    //effects: object,
    //collection: string,
    thc: number,
    onSale: boolean,
    inventory: number,
    saleTitle: string,
    weight: string,
    queryIDs: string[],
    saleRate: null | number | string,
    brandId: string,
    type: Selected,
    typeID: string,
    filePath: string,
    cbd: number | string,
    img: string,
    collections: Selected[],
    key: string,
    description: string,
    brand: Selected,
    saleCode: string,
    size: string,
    name: string,
  ) {
    this.id = id;
    this.genome = genome;
    this.brandID = brandID;
    this.collectionIDs = collectionIDs;
    this.sold = sold;
    this.genomeID = genomeID;
    this.wholesale = wholesale;
    this.active = active;
    this.price = price;
    this.comparePrice = comparePrice;
    //this.effects = effects;
    //this.collection = collection;
    this.thc = thc;
    this.onSale = onSale;
    this.inventory = inventory;
    this.saleTitle = saleTitle;
    this.weight = weight;
    this.queryIDs = queryIDs;
    this.saleRate = saleRate;
    this.brandId = brandId;
    this.type = type;
    this.typeID = typeID;
    this.filePath = filePath;
    this.cbd = cbd;
    this.img = img;
    this.collections = collections;
    this.key = key;
    this.description = description;
    this.brand = brand;
    this.saleCode = saleCode;
    this.size = size;
    this.name = name;
  }
}
interface ProductClassMod extends ProductClass {
  fireProduct: ProductClass;
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

export default function ProductTable() {
  const [css, theme] = useStyletron();
  const [dataState, setDataState] = useState<ProductClass[] | []>([]);
  const { modalBaseDispatch, modalBaseState } = useDispatchModalBase();
  const { toggleTheme, themeState } = useScreen();

  //const [page, setPage] = React.useState(1);
  //const [limit, setLimit] = React.useState(12);

  const { width, height } = useWindowSize();
  const isMobile = Boolean(width < 620);
  const { maxPage, disableNext, disablePrev, page, limit, setLimit, orderBy, setOrderBy, nextPage, prevPage, dataList, queryLoader } =
    useQuery();



  useEffect(() => {
    if (dataList.length) {
      const x = dataList as ProductClass[]
      setDataState(x);
    } else {
      if (!queryLoader) {
        setDataState([]);
      }

    }

  }, [dataList, queryLoader]);

  const openModalBase = (component: () => ReactElement, hasSquareBottom: boolean, closeable: boolean) => {
    modalBaseDispatch({
      type: "MODAL_UPDATE",
      payload: {
        modalBase: {
          isOpen: true,
          key: [],
          component,
          hasSquareBottom,
          closeable,
        },
      },
    });
  };
  const _editProduct = (fireProduct: ProductClass) => {
    const component = () => <ProductEdit fireProduct={fireProduct} />;
    openModalBase(component, true, true);
  };

  const _deleteProduct = (fireProduct: ProductClass) => {
    const component: () => ReactElement = () => <ProductDelete fireProduct={fireProduct} />;
    openModalBase(component, false, true);
  };
  const changeInventory = (row: ProductClass) => {
    //alert('hi')
    const component = () => <Inventory product={row} />;
    openModalBase(component, false, true);
  };
  return (
    <CustomTable>
      <StyledHead $width="100%">
        <StyledHeadCell style={{ minWidth: "40px", flex: 0 }}>{""}</StyledHeadCell>
        <StyledHeadCell style={{ flex: 2 }}>Name</StyledHeadCell>
        {!isMobile && <StyledHeadCell style={{ flex: 2 }}>Collection</StyledHeadCell>}
        { <StyledHeadCell style={{ flex: 1 }}>Inventory</StyledHeadCell>}
        {!isMobile && <StyledHeadCell style={{ flex: 1 }}>Price</StyledHeadCell>}
        <StyledHeadCell style={{ minWidth: "80px", flex: 0 }}>{""}</StyledHeadCell>
      </StyledHead>
      <StyledBody $width="100%" style={{ minHeight: `${limit * (width > 450 ? 79 : 73)}px` }}>
        {queryLoader && (
          <QueryLoader $isDark={themeState?.dark} style={{ minHeight: `${limit * (width > 450 ? 79 : 79) - 2}px` }}>
            <StyledSpinnerNext size={28} />
          </QueryLoader>
        )}
        {dataState &&
          dataState.map((row: ProductClass, index: number) => (
            <StyledRow key={index}>
              <StyledBorderCell onClick={() => _editProduct(row)} style={{ minWidth: "40px", flex: 0 }}>
                <CellWrapper>
                  <Indicator $inventory={row.inventory} $active={row?.active} />
                </CellWrapper>
              </StyledBorderCell>
              <StyledBorderCell onClick={() => _editProduct(row)} style={{ flex: 2 }}>
                <CellWrapper onClick={() => _editProduct(row)}>{row.name}<br/>{(row?.brand?.label || '')}</CellWrapper>
              </StyledBorderCell>
              {!isMobile && (
                <StyledBorderCell style={{ flex: 2, paddingTop: `0px`, paddingBottom: "0px" }} onClick={() => _editProduct(row)}>
                  {/* <CellWrapper >{capitalize(`${row.recurring}`)}</CellWrapper> */}
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
                                  maxWidth:`115px`
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
              )}
              {(
                <StyledBorderCell  style={{ flex: 1 }}>
                  <CellWrapper><Button 
                  //endEnhancer={<SVGIcon style={{ transform: 'scale(0.8)' }} name='pencil' />}
                  
                  onClick={() => changeInventory(row)} 
                      size={SIZE.compact}
                      kind={KIND.secondary}>{`${ (typeof row?.inventory === 'number' && row.inventory !== NaN)?`${row.inventory}`:'--'}`}</Button></CellWrapper>
                </StyledBorderCell>
              )}
              {!isMobile && (
                <StyledBorderCell onClick={() => _editProduct(row)} style={{ flex: 1 }}>
                  <CellWrapper>{`${ isCurr(row?.price)  || ``}`}</CellWrapper>
                </StyledBorderCell>
              )}
              <StyledBorderCell style={{ minWidth: "80px", flex: 0 }}>
                <StyledAction style={{ width: "100%" }} onClick={() => _deleteProduct(row)}>
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

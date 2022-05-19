import React, { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "../../context/userContext";
import firebase, {
  addCart_v2,
  cartRemove_v2,
  cartIncrement_v2,
} from "../../firebase/clientApp";
import useOnClickOutside from "../../hooks/useOnClickOutside";
import { NotificationManager } from "react-notifications";
import { isCurr, isNum } from "../../helpers";
import { Spinner } from "baseui/spinner";
import SVGIcon from "../SVGIcon";
import { Card, StyledBody } from "baseui/card";
import { Caption1, Caption2, Label1, Label2 } from "baseui/typography";
import { Button, KIND, SIZE, SHAPE } from "baseui/button";
import { useStyletron } from "baseui";
import { styled } from "baseui";
import { useSnackbar, DURATION } from "baseui/snackbar";
import { Check, Delete, DeleteAlt } from "baseui/icon";


const QuickAddOverlay = styled("div", ({ $theme }) => {
  return {
    width: `100%`,
    height: `100%`,
    top: `0`,
    left: `0`,
    right: `0`,
    bottom: `0`,
    position: `absolute`,
    backgroundColor: $theme.colors.backgroundOverlayDark,
  };
});
const QuickAddFlex = styled("div", ({ $theme }) => {
  return {
    display: "flex",
    height: "4em",
  };
});

const QuickAddBarCard = styled("div", ({ $theme }) => {
  return {
    backgroundColor: $theme.colors.backgroundSecondary,
    borderRadius: $theme.borders.radius300,
    border: `1px solid ${$theme.borders.border600.borderColor}`,
    width: "90%",
    height: "4em",
    display: "flex",
    position: "absolute",
    top: "12px",
    right: "0",
    left: "0",
    margin: "auto",
    zIndex: 1,
    userSelect: "none",
    flexDirection: "column",
    overflow:'hidden'
  };
});

function Product({ fireProduct, fireCollection, fireFeature, fireDiscounts }) {
  const [css, theme] = useStyletron();
  const { user, fireCart, customerID } = useUser();
  const ref = useRef();
  const [quantity, setQuantity] = useState(0);
  const [addToOrderQuickAdd, setAddToOrderQuickAdd] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [salePrice, setSalePrice] = useState(null);
  const [saved, setSaved] = useState(null);
  const [isPercent, setIsPercent] = useState(false);
  const [coupon, setCoupon] = useState(false);
  const [imgURL, setImgURL] = useState(null);

  const { enqueue, dequeue } = useSnackbar();
  useEffect(() => {
    let isFound: any = false;
    let couponIDs = [];
    if (fireFeature?.data instanceof Array && fireProduct) {
      const coupon = fireFeature?.data?.[0];

      if (coupon?.collectionIDs instanceof Array && coupon?.collectionIDs) {
        couponIDs = coupon?.collectionIDs;
      }

      const thisProductIDs = [
        ...[`${fireProduct?.brandID}`],
        ...fireProduct?.collectionIDs,
      ];

      for (const thisID of thisProductIDs) {
        for (const couponID of couponIDs) {
          if (`${thisID}` === `${couponID}`) {
            isFound = `${coupon?.code}`;
          }
        }
      }
      if (!isFound) {
        for (const couponID of couponIDs) {
          if (couponID === "ALL_PRODUCTS") {
            isFound = `${coupon?.code}`;
          }
        }
      }
      if (!isFound) {
        //look for regular discounts
        // alert("loooked")
        if (
          fireDiscounts?.data instanceof Array &&
          fireDiscounts?.data?.length > 0
        ) {
          for (const k1 in fireDiscounts?.data) {
            const individualDiscount = fireDiscounts?.data?.[k1];
            for (const individualIDs of individualDiscount.collectionIDs) {
              for (const thisID of thisProductIDs) {
                if (`${thisID}` === `${individualIDs}`) {
                  isFound = `${individualDiscount?.code}`;
                }
              }
            }
          }
        }
      }
    }

    setCoupon(isFound);
  }, [fireFeature, fireProduct, fireDiscounts]);

  useOnClickOutside(
    ref,
    useCallback(() => setAddToOrderQuickAdd(false), [])
  );

  const getImgURL = async (filePath) => {
    if (user?.uid) {
      const storage = user.uid && firebase.storage();
      const storageRef = storage && storage.ref();
      let url = null;
      // "https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2Fstock-placeholder.png?alt=media&token=57d6b3da-4408-4867-beb7-7957669937dd"
      if (typeof filePath === "string" && filePath.length > 0 && storage) {
        try {
          url = await storageRef
            .child(`${typeof filePath === "string" ? filePath : ""}`)
            .getDownloadURL();
        } catch (e) {
          console.log("error");
          console.log(e);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
      return setImgURL(url);
    }
  };

  useEffect(() => {
    fireProduct?.filePath && getImgURL(fireProduct?.filePath);
  }, [fireProduct?.filePath]);

  const addCart = async () => {

    if (customerID) {
      setCartLoading(true);
      
    setLoading(true)
    //enqueue({ message: "Reseting order", progress: true }, DURATION.infinite);


    
      try {
        const res = await addCart_v2({
          uid: customerID,
          pid: fireProduct.id,
          qty: 1,
        });
        //NotificationManager.success(`${fireProduct?.name} added to cart.`);
        enqueue({ message: `${fireProduct?.name} added to cart.`, startEnhancer: ({ size }) => <Check size={size} /> }, DURATION.short);
        setAddToOrderQuickAdd(true);
        firebase
          .analytics()
          .logEvent(firebase.analytics.EventName.ADD_TO_CART, fireProduct);
      } catch (e) {
        //NotificationManager.error(e?.message || e || "Something went wrong.");
        enqueue({ message: e?.message || e || "Something went wrong.", startEnhancer: ({ size }) => <DeleteAlt size={size} /> }, DURATION.short);
      } finally {
        setCartLoading(false);
      }
    } else {
     //enqueue({ message: `No customer selected.`, startEnhancer: ({ size }) => <Check size={size} /> }, DURATION.short);
      enqueue({ message: `No customer selected.`, startEnhancer: ({ size }) => <DeleteAlt size={size} /> }, DURATION.short);
    }
  };
  const increaseCart = async () => {
    if (customerID) {
      setCartLoading(true);
      try {
        await cartIncrement_v2({
          uid: customerID,
          pid: fireProduct.id,
          inc: 1,
        });
      } catch (e) {
        NotificationManager.error(e?.message || e || "Something went wrong.");
      } finally {
        setCartLoading(false);
      }
    } else {
      NotificationManager.error(`Error: No Customer ID`);
    }
  };
  const decreaseCart = async () => {
    if (customerID) {
      setCartLoading(true);
      try {
        await cartIncrement_v2({
          uid: customerID,
          pid: fireProduct.id,
          inc: -1,
        });
      } catch (e) {
        NotificationManager.error(e?.message || e || "Something went wrong.");
      } finally {
        setCartLoading(false);
      }
    } else {
      NotificationManager.error(`Error: No Customer ID`);
    }
  };
  const removeFromCart = async () => {
    if (customerID) {
      setCartLoading(true);
      try {
        await cartRemove_v2({ uid: customerID, pid: fireProduct.id });
        firebase
          .analytics()
          .logEvent(firebase.analytics.EventName.REMOVE_FROM_CART, fireProduct);
        setAddToOrderQuickAdd(false);
      } catch (e) {
        NotificationManager.error(e?.message || e || "Something went wrong.");
      } finally {
        setCartLoading(false);
      }
    } else {
      NotificationManager.error(`Error: No Customer ID`);
    }
  };

  useEffect(() => {
    if (fireProduct?.id && fireCart?.data) {
      setLoading(false);

      let _qty = 0;

      for (const key in fireCart?.data) {
        const fireCartItem = fireCart?.data?.[key];

        if (fireCartItem.id === fireProduct?.id) {
          _qty = isNum(fireCartItem?.qty);
        }
      }
      setQuantity(_qty);
    }
  }, [fireCart.data, fireCollection, fireProduct]);

  useEffect(() => {
    if (fireProduct?.onSale && fireProduct?.saleRate) {
      if (fireProduct?.saleRate < 1 && fireProduct?.saleRate > 0) {
        const discount = fireProduct?.price * fireProduct?.saleRate;
        setSaved(discount);
        setIsPercent(true);
        setSalePrice(fireProduct?.price - discount);
      } else if (fireProduct?.saleRate > 1 && fireProduct?.saleRate < 100) {
        const discount = fireProduct?.price - fireProduct?.saleRate;
        setSaved(fireProduct?.saleRate);
        setIsPercent(false);
        setSalePrice(fireProduct?.price - discount);
      }
    }
  }, [fireProduct?.onSale, fireProduct?.saleRate, fireProduct?.price]);

  return (
    <>
      {
        <Card
          overrides={{
            Root: {
              style: ({ $theme }) => ({
                display: "inline-block",
                position: "relative",
                margin: "12px",
                width: "202px",
                minWidth: "202px",
                minHeight: "300px",
                height: "100%",
                padding: 0,
                whiteSpace: "normal",
                "@media (max-width: 735px)": {
                  width: "48vw",
                  minWidth: "48vw",
                  margin: "4px",
                },
              }),
            },
            HeaderImage: {
              style: ({ $theme }) => ({
                minHeight: "200px",
                backgroundColor: "white",
              }),
            },
          }}
          headerImage={
            imgURL
              ? imgURL
              : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='115.2' height='68.6' viewBox='0 0 115.2 68.6'%3E%3Cimage width='480' height='286' transform='scale(0.24)' xlink:href='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAeAAAAEeCAIAAADdLlGrAAAACXBIWXMAAC4jAAAuIwF4pT92AAAF8mlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4wLWMwMDAgNzkuMTM1N2M5ZSwgMjAyMS8wNy8xNC0wMDozOTo1NiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIyLjUgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyMS0wOS0xM1QyMzoxMDowMy0wNzowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjEtMDktMTNUMjM6MTQ6MTEtMDc6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjEtMDktMTNUMjM6MTQ6MTEtMDc6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MWFiMGRhNWUtZWEwOS1jNTQyLWI4Y2UtMDQxNWY4Nzk0NDJiIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6YzI1ZWZhY2UtMWJkMy03ZDQ2LTk2MWQtYmZlNWZkMzczYWNlIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6MWE0M2FmNDEtOWU1Yy0zYTQxLTkyNmMtYWJiZWI5NmUzOGM3Ij4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDoxYTQzYWY0MS05ZTVjLTNhNDEtOTI2Yy1hYmJlYjk2ZTM4YzciIHN0RXZ0OndoZW49IjIwMjEtMDktMTNUMjM6MTA6MDMtMDc6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMi41IChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MWFiMGRhNWUtZWEwOS1jNTQyLWI4Y2UtMDQxNWY4Nzk0NDJiIiBzdEV2dDp3aGVuPSIyMDIxLTA5LTEzVDIzOjE0OjExLTA3OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjIuNSAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+bTL0NAAAFEBJREFUeJzt3X1MVfUfwPHzcLl4oZIwCbOiqRU+JtkyM0KlK2itdFmmaYl/mNbKVXPlmn+0tWrZWrVVlstEzCXrQVuZ5VPqfJxaYWChaYSkJEagQHDPuef3x3ee3YGCv/v4ob1ffzRDHo7s+ubr93y/36M7jqMBAOQxEn0BAIDzI9AAIBSBBgChCDQACEWgAUAoAg0AQhFoABCKQAOAUAQaAIQi0AAgFIEGAKEINAAIRaABQCgCDQBCEWgAEIpAA4BQBBoAhCLQACAUgQYAoQg0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hUZDFG4SIubU3bbhw4dv3bp16tSps2bNWrhw4bhx466++uq///5769atlZWVaWlpn3/++eTJkyPc593JzMb/dbWq0VOnTi0tLdU0jXUdSAgCjXhwG/3DDz8UFxcvWbLkk08+UVurr7vuukWLFj3xxBNXXnllLOp8kWPnjldLo5FwBBpxourm8/nmzZs3b968xsbGpqam5OTkyy+/XNf1yM+Djnzs3PFqaTQSi0AjftQMr3p+ymWXXXbZZZdpmqbeouajw/7M0a2ze7U0GonFiwxxpW4PqlIHg0H3GSuRLNuI1sxGR53cM4zFcU5AOwQaiaFOYY58HHqhsbM6tS5yF2q0FvLcWyBGCDS6sXZ1/uijj6I1dg7F2jskCoFGd9VxN8qsWbOiOHYO1bHRDz/8MI1GrBFodEuR7EYJT7tGc14H4oBAo/tRdT5x4kS7u4KxGDuHchv9ySefMNeBOCDQ6GbOe85GHOqsqEYnJSUxH404INDoTi60oi4+dVaYj0bcEGgknrsmOhgMdrK+ONYr6i4e89GIDwKNRLJtWx39bJyj9oBYltWu1LHbjRIe1t4hDtjqjcRQo2a1vbu1tbWmpubMmTNJSUmZmZnp6ekejyf0dI7wzneOtQvtBedps4gWRtBIADWVYZrmnj17ZsyY0adPn/79++fk5AwePDgjI+O222774IMPWlpaTNNUQ+w4r6i7eOwzREwxgka8qZOGGhsbn3zyyRUrVmiaNnTo0KlTp/bu3fvMmTM//PDD7t27H3vssddee23p0qVjx47VNO3EiROFhYVyxs6hOo6jLcv67LPPIjn7CVAINOJKDYdPnz49ceLEvXv33n///S+99FJ2drbjOGr2Wdf12trat956a/HixePGjVu1atXEiRPz8/MPHTokauwcql2jP//88yeeeCI5OVnTNM5UQiQINOLHrXNBQcH+/fvffffdefPmOY6jppvV+xiG0bt375dffnnChAn33XffnDlzMjIyjh49+uGHH0obO4cKbfSUKVPefffd1NRUn8/n/rmAMDAHjThx61xYWLh///6SkpJ58+YFAgH3xFFFnW8XCARyc3M3bNiQmpp69OjR5557bvbs2a2trTLrrLjz0Z9++umkSZOampriv/4P/zEEGvGg6lxbWzt+/Ph9+/aVlJTMmDFDLWHuOFdrGEZSUpJlWSNGjFi3bl16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'/%3E%3C/svg%3E"
          }
        >
          <StyledBody>
            {
              <>
                <Label2>
                  {isCurr(fireProduct?.onSale ? salePrice : fireProduct?.price)}
                </Label2>
                <Label2>{`
                  ${`${fireProduct?.name || ""}`} 
              
              `}</Label2>
                <Caption1>{`${fireProduct?.brand?.label || ""}`}</Caption1>
                <Caption2>
                  {`${fireProduct?.genome?.label || ""}`}
                  {` | `}
                  {`${fireProduct?.weight || ""}`}
                </Caption2>
                {/* <Caption2>
                     {
                `${fireProduct?.genome?.label || ""}`}
         
                  </Caption2>   */}
                <div style={{ textAlign: "left", marginTop: "12px" }}>
                  {" "}
                  {Boolean(coupon) && (
                    <Button
                      onClick={() => alert("click")}
                      kind={KIND.secondary}
                      size={SIZE.mini}
                      startEnhancer={
                        <>
                          <SVGIcon
                            style={{
                              transform: "scale(0.6)",
                              width: "12px",
                              overflow: "visible",
                            }}
                            name="couponsFilled"
                          />
                        </>
                      }
                      //startEnhancer={<SVGIcon name='couponFilled' />}
                    >
                      {`${coupon}`}
                    </Button>
                  )}
                </div>
              </>
            }
          </StyledBody>
          {/* </Link> */}
          <span>
            {/* ADD TO CART */}
            {!addToOrderQuickAdd && quantity === 0 && (
              <Button
                onClick={() => addCart()}
                disabled={cartLoading}
                isLoading={cartLoading}
                //className='add-to-cart-button'
                kind={KIND.tertiary}
                size={SIZE.mini}
                shape={SHAPE.circle}
                overrides={{
                  BaseButton: {
                    style: ({ $theme }) => ({
                      border: `${$theme.colors.accent} solid 2px`,
                      color: `${$theme.colors.accent}`,
                      fontSize: "16px",
                      position: "absolute",
                      top: "14px",
                      right: "14px",
                      //backgroundColor:'transparent'
                    }),
                  },
                }}
              >
                <SVGIcon name={"plus"} color={theme.colors.accent} />
              </Button>
            )}
            {/* HAS ITEM IN CART */}
            {!addToOrderQuickAdd && quantity > 0 && (
              <Button
                onClick={() => setAddToOrderQuickAdd(true)}
                disabled={cartLoading}
                isLoading={cartLoading}
                //className='qty-quick-add-button'
                kind={KIND.primary}
                size={SIZE.mini}
                shape={SHAPE.circle}
                overrides={{
                  BaseButton: {
                    style: ({ $theme }) => ({
                      //border: `${$theme.colors.accent} solid 2px`,
                      color: `${$theme.colors.white}`,
                      backgroundColor:`${$theme.colors.accent}`,
                      fontSize: "16px",
                      position: "absolute",
                      top: "14px",
                      right: "14px",
                      ":hover": {
                        backgroundColor:`${$theme.colors.accent400}`,
                        //border: `${$theme.colors.accent600} solid 2px`,
                      },
                    }),
                  },
                }}
              >
                {`${quantity}`}
              </Button>
            )}
            {/* QUICK ADD BAR */}
            {addToOrderQuickAdd && (
              <QuickAddBarCard ref={ref}>
                <QuickAddFlex>
                  {/* TRASH */}
                  {quantity < 2 && (
                    <Button
                      onClick={() => removeFromCart()}
                      disabled={cartLoading}
                      //isLoading={cartLoading}
                      //className='qty-quick-add-button'
                      kind={KIND.minimal}
                      size={SIZE.mini}
                      shape={SHAPE.square}
                      //className='qty-quick-buttons'
                      overrides={{
                        BaseButton: {
                          style: ({ $theme }) => ({
                            width: "30%",
                            color: $theme.colors.negative300,
                            height: "100%",
                          }),
                        },
                      }}
                    >
                      <SVGIcon name={"delete"} />
                    </Button>
                  )}
                  {/* MINUS */}
                  {quantity > 1 && (
                    <Button
                      onClick={() => decreaseCart()}
                      disabled={cartLoading}
                      //isLoading={cartLoading}
                      //className='qty-quick-add-button'
                      kind={KIND.minimal}
                      size={SIZE.mini}
                      shape={SHAPE.square}
                      //className='qty-quick-buttons'
                      overrides={{
                        BaseButton: {
                          style: ({ $theme }) => ({
                            width: "30%",
                            color: $theme.colors.accent,
                            height: "100%",
                          }),
                        },
                      }}
                    >
                      <SVGIcon name={"minus"} />
                    </Button>
                  )}
                  {/* OUTLET */}
                  <div className="quick-qty-outlet">
                    {cartLoading ? (
                      <>
                        <Spinner
                          overrides={{
                            Svg: {
                              style: ({ $theme }) => ({
                                position:'absolute'
                              })
                            }
                          }}
                          size={30}
                          //style={{ position: "absolute" }}
                          //olor='rgb(0, 200, 5)'
                        />
                        <span
                          style={{
                            color: theme.colors.contentStateDisabled,
                            fontSize: "20px",
                            fontWeight: 600,
                          }}
                        >
                          {quantity}
                        </span>
                      </>
                    ) : (
                      <span
                        style={{
                          color: theme.colors.accent,
                          fontSize: "20px",
                          fontWeight: 600,
                        }}
                      >
                        {quantity}
                      </span>
                    )}
                    {/* <span data-radium="true"> {cartLoading?<Spinner color='rgb(0, 200, 5)'/>:quantity} </span> */}
                  </div>
                  {/*PLUS */}
                  <Button
                    onClick={() => increaseCart()}
                    disabled={cartLoading}
                    //isLoading={cartLoading}
                    //className='qty-quick-add-button'
                    kind={KIND.minimal}
                    size={SIZE.mini}
                    shape={SHAPE.square}
                    //className='qty-quick-buttons'
                    overrides={{
                      BaseButton: {
                        style: ({ $theme }) => ({
                          width: "30%",
                          color: $theme.colors.accent,
                          height: "100%",
                        }),
                      },
                    }}
                  >
                    <SVGIcon name={"plus"} />
                  </Button>
                </QuickAddFlex>
              </QuickAddBarCard>
            )}

            {/* BACKGROUND */}
            {addToOrderQuickAdd && <QuickAddOverlay />}
          </span>
        </Card>
      }
    </>
  );
}

export default Product;

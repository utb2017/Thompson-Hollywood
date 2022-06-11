import { useState, useEffect, FC, ReactElement } from "react";
import firebase from "../../../firebase/clientApp";
import { useFirestoreQuery } from "../../../hooks/useFirestoreQuery";
import { FlexGrid, FlexGridItem } from "baseui/flex-grid";
import { VIPClass } from "../../../classes";
import { styled } from "baseui";
import { BlockProps } from "baseui/block";
import { Spinner } from "baseui/spinner";
import { Label4 } from "baseui/typography";
import { Button, KIND } from "baseui/button";
import { useDispatchModalBase } from "../../../context/Modal";
import VIP_Edit from "../../Modals/ArrivalVIPedit";

const Cell = styled(Label4, ({ $theme }) => {
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
    alignText: "center",
  };
});
const CellButton = styled(Button, ({ $theme }) => {
  return {
    //backgroundColor:`white`,
    width:`100%`,
    padding:`0px`,
    border: `none`,
  };
});
const Props: BlockProps = {
  //height: "scale600",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: `24px`,
};
type Query = {
  data: [VIPClass];
  status: string;
  error: any;
};

const QueryVIPArrivals: FC = (): ReactElement => {
  //STATE
  const [query, setQuery] = useState(null);
  //HOOKS
  const fireStoreQuery: Query = useFirestoreQuery(query);
  const { modalBaseDispatch } = useDispatchModalBase();
  useEffect(() => {
    if (firebase) {
      setQuery(firebase.firestore().collection("ArrivalVIPs"));
    }
    return () => {
      setQuery(null);
    };
  }, [firebase]);
  //FUNCTIONS
  const getStatus = (objectArray?: [{ label: string; id: string }]): string => {
    if (objectArray != undefined) {
      return `${objectArray[0].label}`;
    } else {
      return `n/a`;
    }
  };
  const getBackgroundColor = (
    objectArray?: [
      {
        label: string;
        id: `DIRTY` | `CLEAN` | `INSPECTED` | `OO` | `OS` | `PICKUP`;
      }
    ]
  ): string => {
    if (objectArray != undefined) {
      if (objectArray[0].id === "CLEAN") {
        return `blue`;
      } else if (objectArray[0].id === "DIRTY") {
        return `red`;
      } else if (objectArray[0].id === "INSPECTED") {
        return `green`;
      } else if (objectArray[0].id === "PICKUP") {
        return `yellow`;
      } else if (objectArray[0].id === "OS") {
        return `red`;
      } else if (objectArray[0].id === "OO") {
        return `red`;
      } else {
        return `white`;
      }
    } else {
      return `white`;
    }
  };
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
  //OUTPUT
  if (fireStoreQuery.status === "loading") {
    return (
      <FlexGrid height={`100%`} flexGridColumnCount={[1, 1, 1]}>
        <FlexGridItem
          {...Props}
          //color={theme.colors.white}
          flex={`1`}
          height={`100%`}
        >
          <Cell>
            <Spinner size={"22px"} color={"rgb(23,55,94)"} />
          </Cell>
        </FlexGridItem>
      </FlexGrid>
    );
  }
  if (fireStoreQuery.status === "error") {
    return (
      <FlexGrid height={`100%`} flexGridColumnCount={[1, 1, 1]}>
        <FlexGridItem
          {...Props}
          //color={theme.colors.white}
          flex={`1`}
          height={`100%`}
        >
          <Cell>{`${fireStoreQuery.error.message}`}</Cell>
        </FlexGridItem>
      </FlexGrid>
    );
  }
  return (
    <>
      {fireStoreQuery.data && fireStoreQuery.data.length ? (
        <FlexGrid height={`100%`} flexGridColumnCount={[7, 7, 7]}>
          {fireStoreQuery.data.map((vip) => {
            return (
              <>
              <CellButton onClick={()=>_VIPedit(vip.id)} 
      kind={KIND.tertiary} >
                <FlexGridItem
                  {...Props}
                  //color={theme.colors.white}
                  flex={`2`}
                  height={`100%`}
                 
                >
                  <Cell>{`${vip.firstName} ${vip.lastName}`}</Cell>
                </FlexGridItem>
                <FlexGridItem
                  {...Props}
                  backgroundColor={getBackgroundColor(vip.roomStatus)}
                  //color={theme.colors.white}
                  flex={`1`}
                  height={`100%`}
                >
                  <Cell>{`${vip.roomNumber}`}</Cell>
                </FlexGridItem>
                <FlexGridItem
                  {...Props}
                  //color={theme.colors.white}
                  flex={`1`}
                  height={`100%`}
                >
                  <Cell>{`${`${vip.arrival}`.substring(4)}`}</Cell>
                </FlexGridItem>
                <FlexGridItem
                  {...Props}
                  //color={theme.colors.white}
                  flex={`1`}
                  height={`100%`}
                >
                  <Cell>{`${`${vip.departure}`.substring(4)}`}</Cell>
                </FlexGridItem>
                <FlexGridItem
                  {...Props}
                  //color={theme.colors.white}
                  flex={`3`}
                  height={`100%`}
                >
                  <Cell>{`${vip.notes || `No Notes`}`}</Cell>
                </FlexGridItem>
                <FlexGridItem
                  {...Props}
                  //color={theme.colors.white}
                  flex={`1`}
                  height={`100%`}
                >
                  <Cell>{`${vip.rateCode || `n/a`}`}</Cell>
                </FlexGridItem>
                <FlexGridItem
                  {...Props}
                  //color={theme.colors.white}
                  flex={`1`}
                  height={`100%`}
                >
                  <Cell>{`${getStatus(vip.vipStatus)}`}</Cell>
                </FlexGridItem>
                </CellButton>
              </>
            );
          })}
        </FlexGrid>
      ) : (
        <FlexGrid height={`100%`} flexGridColumnCount={[1, 1, 1]}>
          <FlexGridItem
            {...Props}
            //color={theme.colors.white}
            flex={`2`}
            height={`100%`}
          >
            <Cell>
              <Label4> {`No Arrivals`}</Label4>
            </Cell>
          </FlexGridItem>
        </FlexGrid>
      )}
    </>
  );
};

export default QueryVIPArrivals;

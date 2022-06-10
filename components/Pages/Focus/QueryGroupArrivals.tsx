import { useState, useEffect, FC, ReactElement } from "react";
import firebase from "../../../firebase/clientApp";
import { useFirestoreQuery } from "../../../hooks/useFirestoreQuery";
import { FlexGrid, FlexGridItem } from "baseui/flex-grid";
import { VIPClass } from "../../../classes";
import { styled } from "baseui";
import { BlockProps } from "baseui/block";
import { Spinner } from "baseui/spinner";
import { Label4 } from "baseui/typography";

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

const QueryArrivalGroups: FC = (): ReactElement => {
  //STATE
  const [query, setQuery] = useState(null);
  //HOOKS
  const fireStoreQuery: Query = useFirestoreQuery(query);
  useEffect(() => {
    if (firebase) {
      setQuery(firebase.firestore().collection("ArrivalGroups"));
    }
    return () => {
      setQuery(null);
    };
  }, [firebase]);
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
        fireStoreQuery.data.map((vip) => {
          return (
            <FlexGrid height={`100%`} flexGridColumnCount={[7, 7, 7]}>
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
                <Cell>{`${vip.arrival}`}</Cell>
              </FlexGridItem>
              <FlexGridItem
                {...Props}
                //color={theme.colors.white}
                flex={`1`}
                height={`100%`}
              >
                <Cell>{`${vip.departure}`}</Cell>
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
                <Cell>{`MGCM`}</Cell>
              </FlexGridItem>
              <FlexGridItem
                {...Props}
                //color={theme.colors.white}
                flex={`1`}
                height={`100%`}
              >
                <Cell>{`${vip.vipStatus}`}</Cell>
              </FlexGridItem>
            </FlexGrid>
          );
        })
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

export default QueryArrivalGroups;

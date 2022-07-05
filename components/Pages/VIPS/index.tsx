import { useState, FC, ReactElement, useMemo } from "react";
import { useDispatchModalBase } from "../../../context/Modal";
import { Button, SHAPE, SIZE } from "baseui/button";
import { styled } from "baseui";
import { Card } from "baseui/card";
import VIPSTable from "./VIPSTable";
import { useScreen } from "../../../context/screenContext";
import { KIND } from "baseui/button";
import { useRouter } from "next/router";
import VIPCreate from "../../Modals/ArrivalVIPcreate";
import firebase from "../../../firebase/clientApp";
import { useSnackbar, DURATION } from "baseui/snackbar";
import { Check, DeleteAlt, Plus } from "baseui/icon";
import OpenPrintDetailedVIP from "../../Modals/OpenPrintDetailedVIP";
const VIPs: FC = (): ReactElement => {
  const { themeState } = useScreen();
  const [loading, setLoading] = useState<boolean>(false);
  const { modalBaseDispatch } = useDispatchModalBase();
  const router = useRouter();
  const { enqueue, dequeue } = useSnackbar();
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
  const _VIPCreate = () => {
    const component: () => ReactElement = () => <VIPCreate />;
    openModalBase(component, true);
  };
  const _VIPOpenPrint = (url: URL) => {
    const component: () => ReactElement = () => (
      <OpenPrintDetailedVIP url={url} />
    );
    openModalBase(component, true);
  };
  const exportVIPs = async () => {
    setLoading(true);
    enqueue(
      { message: "Creating Detailed VIP's.", progress: true },
      DURATION.infinite
    );
    try {
      const rqp = router?.query?.property as "LAXTH" | "LAXTE";
      const createVIP = firebase
        .functions()
        .httpsCallable(`exportAdobeDetailedVip_${rqp}`);
      const response = await createVIP();
      dequeue();
      //closeModal();
      console.log(JSON.stringify(response));
      if (response?.data?.success === true) {
        _VIPOpenPrint(response?.data?.url);
        enqueue(
          {
            message: "VIP Exported",
            startEnhancer: ({ size }) => <Check size={size} />,
          },
          DURATION.short
        );
      }
    } catch (e) {
      console.log(`${e?.message || e}`);
      dequeue();
      enqueue(
        {
          message: `Your VIPs weren't exported`,
          startEnhancer: ({ size }) => <DeleteAlt size={size} />,
        },
        DURATION.short
      );
    } finally {
      setLoading(false);
    }
  };
  const exportRH = useMemo(() => async () => {
    setLoading(true);
    enqueue(
      { message: "Creating RH VIP's.", progress: true },
      DURATION.infinite
    );
    try {
      const rqp = router?.query?.property as "LAXTH" | "LAXTE";
      const createRH = firebase
        .functions()
        .httpsCallable(`exportAdobeRHVip_${rqp}`);
      const response = await createRH();
      dequeue();
      //closeModal();
      console.log(JSON.stringify(response));
      if (response?.data?.success === true) {
        _VIPOpenPrint(response?.data?.url);
        enqueue(
          {
            message: "RH Exported",
            startEnhancer: ({ size }) => <Check size={size} />,
          },
          DURATION.short
        );
      }
    } catch (e) {
      console.log(`${e?.message || e}`);
      dequeue();
      enqueue(
        {
          message: `Your RH wasn't exported`,
          startEnhancer: ({ size }) => <DeleteAlt size={size} />,
        },
        DURATION.short
      );
    } finally {
      setLoading(false);
    }
  },[router]) 
  const BottomRightFixed = styled("div", () => {
    return {
      position: "fixed",
      bottom: "6%",
      right: "22px",
      zIndex: 10,
    };
  });
  const Padding = styled("div", ({$theme}) => {
    return {
      paddingBottom: $theme.sizing.scale800,
      paddingRight: $theme.sizing.scale800,
      paddingLeft: $theme.sizing.scale800,
      paddingTop: $theme.sizing.scale800,
      width: "100%",
      "@media (max-width: 450px)": {
        paddingBottom: $theme.sizing.scale4800,
        paddingRight: $theme.sizing.scale600,
        paddingLeft: $theme.sizing.scale600,
        paddingTop: $theme.sizing.scale600,
      },
    };
  });
  const CenterFlex = styled("div", ({ $theme }) => {
    return {
      display: "flex",
      justifyContent: "right",
      paddingBottom: $theme.sizing.scale600,
    };
  });
  const Spacer = styled("div", () => {
    return {
      width: "12px",
    };
  });
  const kind = themeState?.dark ? KIND.secondary : undefined;
  const isLoading = Boolean(loading);
  const disabled = isLoading;
  const BottomRightButtonProps = {
    kind,
    onClick: _VIPCreate,
    isLoading,
    disabled,
    shape: SHAPE.circle,
    size: SIZE.large,
    children: <Plus size={30} />,
  };
  const ExportDetailedButtonProps = {
    kind,
    onClick: exportVIPs,
    isLoading,
    disabled,
    //size: SIZE.compact,
    children: "Export Detailed VIP",
  };
  const ExportRHButtonProps = {
    kind,
    onClick: exportRH,
    isLoading,
    disabled,
    //size: SIZE.compact,
    children: "Export RH VIP",
  };
  return (
    <>
      <BottomRightFixed>
        <Button {...BottomRightButtonProps} />
      </BottomRightFixed>
      <Padding>
        <CenterFlex>
          <Spacer />
          <Button {...ExportDetailedButtonProps} />
          <Spacer />
          <Button {...ExportRHButtonProps} />
        </CenterFlex>
        <Card
          overrides={{
            Root: {
              style: () => ({
                position: "relative",
                display: "block",
                padding: 0,
                width: "100%",
                marginBottom: `0px`,
              }),
            },
            Contents: {
              style: () => ({
                marginBottom: "0px",
                marginRight: "0px",
                marginLeft: "0px",
                marginTop: "0px",
                paddingBottom: "0px",
                paddingRight: "0px",
                paddingLeft: "0px",
                paddingTop: "0px",
              }),
            },
            Body: {
              style: () => ({
                marginBottom: `0px`,
              }),
            },
          }}
        >
          <VIPSTable />
        </Card>
      </Padding>
    </>
  );
};
export default VIPs;

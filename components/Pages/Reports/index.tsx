import { useState, FC, ReactElement, useMemo } from "react";
import { useDispatchModalBase } from "../../../context/Modal";
import { Button, SHAPE, SIZE } from "baseui/button";
import { styled } from "baseui";
import { Card } from "baseui/card";
import ReportsTable from "./ReportsTable";
import { useScreen } from "../../../context/screenContext";
import { KIND } from "baseui/button";
import { useRouter } from "next/router";
import VIPCreate from "../../Modals/VIPcreate";
import firebase from "../../../firebase/clientApp";
import { useSnackbar, DURATION } from "baseui/snackbar";
import { Check, DeleteAlt, Plus } from "baseui/icon";
import OpenPrintDetailedVIP from "../../Modals/OpenPrintDetailedVIP";
import { formatDate } from "../../../helpers/formatDate";
import { useEffect } from "react";
import { downloadFolderAsZip } from "../../../helpers";
import { useFirestoreQuery } from "../../../hooks/useFirestoreQuery";
import { useUser } from "../../../context/Auth";


const VIPs: FC = (): ReactElement => {
  const { themeState } = useScreen();
  const [loading, setLoading] = useState<boolean>(false);
  const { modalBaseDispatch } = useDispatchModalBase();
  const [dateState, setDateState] = useState(false);
  const [query, setQuery] = useState(null);
  const router = useRouter();
  const { loadingUser } = useUser()
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
  interface Query {
    data: any;
    status: string;
    error: any;
  }
  

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
  const isLoading = Boolean(loading) || !dateState;
  const disabled = isLoading || !dateState;
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
  const rqp = router?.query?.property as "LAXTH" | "LAXTE";
  const fireStoreQuery: Query = useFirestoreQuery(!loadingUser && firebase.firestore().collection('PROPERTY').doc(rqp))

  // useEffect(() => {
    
  //   if(firebase?.apps?.length){
  //     setQuery(firebase.firestore().collection('PROPERTY').doc(rqp))
  //   }else{
  //     setQuery(null)
  //   }
    
  // }, [firebase, rqp]);
  
  useEffect(() => {
    console.log(fireStoreQuery)
    if(fireStoreQuery?.data?.date){
      setDateState(fireStoreQuery.data.date)
      console.log(rqp)
      console.log(fireStoreQuery?.data?.date)
    }else{
      setDateState(false)
    }
  }, [fireStoreQuery, rqp]);
  const DownloadReportsProps = {
    kind,
    onClick: ()=>downloadFolderAsZip(`${rqp}`, `${dateState}`),
    isLoading,
    disabled,
    //size: SIZE.compact,
    children: "Download Reports",
  };
  // useEffect(() => {
  //     const fd = formatDate(new Date(), "MM.dd.yy")
  // }, []);


  
  return (
    <>
      <BottomRightFixed>
        <Button {...BottomRightButtonProps} />
      </BottomRightFixed>
      <Padding>
        <CenterFlex>
          {/* <Spacer />
          <Button {...ExportDetailedButtonProps} /> */}
          <Spacer />
          <Button {...DownloadReportsProps} />
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
          <ReportsTable {...{tblDate:dateState}} />
        </Card>
      </Padding>
    </>
  );
};
export default VIPs;

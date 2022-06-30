import { useState, useEffect, FC, ReactElement } from "react";
import { useDispatchModalBase } from "../../../context/Modal";
import { Button, SHAPE, SIZE } from "baseui/button";
import { styled, useStyletron } from "baseui";
import { Card } from "baseui/card";
import VIPSTable from "./VIPSTable";
import { useQuery } from "../../../context/Query";
import { useScreen } from "../../../context/screenContext";
import * as React from "react";
import { KIND } from "baseui/button";
import { useRouter } from "next/router";
import { useRouting } from "../../../context/routingContext";
import VIPCreate from "../../Modals/ArrivalVIPcreate";
import firebase from "../../../firebase/clientApp";
import { useSnackbar, DURATION } from "baseui/snackbar";
import { Check, DeleteAlt } from "baseui/icon";
import { Toast, ToasterContainer, toaster, PLACEMENT } from "baseui/toast";
import OpenPrintDetailedVIP from "../../Modals/OpenPrintDetailedVIP";
import { Upload } from "baseui/icon";

type INullableReactText = React.ReactText | null;

const ITEMS = [{ label: "Detailed VIP" }, { label: "RH VIP" }];

const VIPs: FC = (): ReactElement => {
  const {
    setTotalsField,
    setQueryCollection,
    setLimit,
    setOrderBy,
    setTotalsCollection,
    setTotalsDoc,
    setWhere,
    setQueryGroupCollection,
  } = useQuery();

  const { themeState } = useScreen();
  const [loading, setLoading] = useState<boolean>(false);
  const { modalBaseDispatch } = useDispatchModalBase();
  const [css, theme] = useStyletron();
  const router = useRouter();
  //const { user } = useUser()
  const { setNavLoading } = useRouting();
  const { enqueue, dequeue } = useSnackbar();
  const [toastKey, setToastKey] = useState<INullableReactText>(null);
  const showToast = (x: string) => setToastKey(toaster.negative(`${x}`, {}));

  /* add shit to the query questions*/
  // useEffect(() => {
  //   setTotalsField(`${router?.query?.filter}`);
  //   setTotalsDoc("unsettled");
  //   setTotalsCollection("totals")

  //   setQueryGroupCollection("VIPs");
  //   setOrderBy("start");
  //   if(router?.query?.filter){
  //     setWhere([["progress", "in", orderProgressObject[`${router?.query?.filter}`] ], ["settled", "==", false]])
  //   }
  //   setLimit(5);
  //   // return () => {
  //   //   setTotalsField(null);
  //   //   setTotalsDoc(null);
  //   //   setTotalsCollection(null)
  //   //   setQueryGroupCollection(null);
  //   //   setQueryCollection(null);
  //   //   setLimit(5);
  //   //   setOrderBy(null);
  //   //   setWhere(null)
  //   // };
  // }, [router]);

  useEffect(() => {
    return () => {
      setTotalsField(null);
      setTotalsDoc(null);
      setTotalsCollection(null);
      setQueryGroupCollection(null);
      setQueryCollection(null);
      setLimit(5);
      setOrderBy(null);
      setWhere(null);
    };
  }, []);

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
  const closeModal = () => {
    modalBaseDispatch({
      type: "MODAL_UPDATE",
      payload: {
        modalBase: {
          isOpen: false,
          key: [],
          component: null,
          hasSquareBottom: false,
        },
      },
    });
  };
  const _VIPCreate = () => {
    const component: () => ReactElement = () => <VIPCreate />;
    openModalBase(component, true);
  };

  const _VIPOpenPrint = (url) => {
    const component: () => ReactElement = () => (
      <OpenPrintDetailedVIP url={url} />
    );
    openModalBase(component, true);
  };
  const exportVIPs = async () => {
    setLoading(true);
    //enqueue({ message: "Creating VIP", progress: true }, DURATION.infinite);
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
        //alert(`${response?.data?.form}`)
        //console.log(response?.data?.form);
        //setFireProductDefault({...response?.data?.form});
        //setForm({...response?.data?.form});
        //window.open(response?.data?.url, null, null);

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
      //setError(`${e?.message || e}`);
      // setError((oldError: Errors) => ({
      //   ...oldError,
      //   ...{ server: `VIP not created.` },
      // }));
      console.log(`${e?.message || e}`);
      dequeue();
      //showToast(`${e?.message || e}`);
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
  const exportRH = async () => {
    setLoading(true);
    //enqueue({ message: "Creating VIP", progress: true }, DURATION.infinite);
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
        //alert(`${response?.data?.form}`)
        //console.log(response?.data?.form);
        //setFireProductDefault({...response?.data?.form});
        //setForm({...response?.data?.form});
        //window.open(response?.data?.url, null, null);

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
      //setError(`${e?.message || e}`);
      // setError((oldError: Errors) => ({
      //   ...oldError,
      //   ...{ server: `VIP not created.` },
      // }));
      console.log(`${e?.message || e}`);
      dequeue();
      //showToast(`${e?.message || e}`);
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
  };

  return (
    <>
      <div
        className={css({
          position: "fixed",
          bottom: "6%",
          right: "22px",
          zIndex: 10,
        })}
      >
        <Button
          kind={themeState?.dark ? KIND.secondary : undefined}
          onClick={_VIPCreate}
          isLoading={Boolean(loading)}
          disabled={Boolean(loading)}
          shape={SHAPE.circle}
          size={SIZE.large}
        >
          <Upload size={30} />
          {/* <div
                className={css({
                  paddingLeft: theme.sizing.scale600,
                  paddingRight: theme.sizing.scale600,
                })}
              >
                Add VIP
              </div> */}
        </Button>
      </div>
      <div
        className={css({
          paddingBottom: theme.sizing.scale800,
          paddingRight: theme.sizing.scale800,
          paddingLeft: theme.sizing.scale800,
          paddingTop: theme.sizing.scale800,
          width: "100%",
          "@media (max-width: 450px)": {
            paddingBottom: theme.sizing.scale4800,
            paddingRight: theme.sizing.scale600,
            paddingLeft: theme.sizing.scale600,
            paddingTop: theme.sizing.scale600,
          },
        })}
      >
        <div
          className={css({
            display: "flex",
            justifyContent: "right",
            paddingBottom: theme.sizing.scale600,
          })}
        >
          <div style={{ width: "12px" }}></div>
          {/* <StatefulPopover
      //focusLock
      placement={PLACEMENT.bottomLeft}
      content={({close}) => (
        <StatefulMenu
          items={ITEMS}
          onItemSelect={() => close()}
          // overrides={{
          //   List: {style: {height: '100px', width: '138px'}},
          // }}
        />
      )}
    >
      <Button endEnhancer={() => <ChevronDown size={24} />}>
        Open Menu
      </Button>
    </StatefulPopover> */}

          <Button
            kind={themeState?.dark ? KIND.secondary : undefined}
            onClick={exportVIPs}
            isLoading={Boolean(loading)}
            disabled={Boolean(loading)}
            size={SIZE.compact}
          >
            <div>Export Detailed</div>
          </Button>

          <div style={{ width: "12px" }}></div>
          <Button
            kind={themeState?.dark ? KIND.secondary : undefined}
            onClick={exportRH}
            isLoading={Boolean(loading)}
            disabled={Boolean(loading)}
            size={SIZE.compact}
          >
            <div>Export RH</div>
          </Button>
        </div>
        {/* OUTLET */}
        <Card
          overrides={{
            Root: {
              style: ({ $theme }) => ({
                position: "relative",
                display: "block",
                padding: 0,
                width: "100%",
                marginBottom: `0px`,
              }),
            },
            Contents: {
              style: ({ $theme }) => ({
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
              style: ({ $theme }) => ({
                marginBottom: `0px`,
              }),
            },
          }}
        >
          <VIPSTable />
        </Card>
      </div>
    </>
  );
};

export default VIPs;

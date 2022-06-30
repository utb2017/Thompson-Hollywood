import React from "react";
import App from "next/app";
import RoutingContext from "../context/routingContext";

import FormContext from "../context/formContext";
import { ModalBaseProvider } from "../context/Modal";
import ScreenContext from "../context/screenContext";

import QueryProvider from "../context/Query";
import UserProvider from "../context/Auth";

import { Provider as StyletronProvider } from "styletron-react";
import { styletron } from "../styletron";
import "../styles/globals.css";
import "../styles/styles.scss";
import "../components/Console/console.scss";
import { SnackbarProvider, PLACEMENT } from "baseui/snackbar";
import { BaseProvider, LightTheme, DarkTheme } from "baseui";
import { NotificationContainer } from "react-notifications";
//import { createTheme } from "baseui";
//import { createDarkTheme } from "baseui";

// const primitives = {
//   negative: "rgb(212, 54, 132)", // hot pink
//   red: "rgb(212, 54, 132)", // hot pink
//   negative300: "rgb(212, 54, 132)", // hot pink
//   positive: "rgb(0,200,5)", // hot pink
//   positive300: "rgb(0,200,5)", // hot pink
//   accent: "#039BE5", // hot pink
// };
const theme = LightTheme;
const darkTheme = DarkTheme;

const Noop = ({ children }) => children;

export default class Admin extends App {
  state = {
    dark: false,
  };
  toggleTheme = () => {
    this.setState({ dark: !this.state.dark });
  };

  render() {
    const { Component, pageProps } = this.props;
    const Layout = Component.Layout || Noop;
    return (
      <>
        <UserProvider>
          <QueryProvider>
            <FormContext>
              <ScreenContext
                value={{
                  themeState: this.state,
                  toggleTheme: this.toggleTheme,
                }}
              >
                <StyletronProvider value={styletron}>
                  <BaseProvider theme={this.state.dark ? darkTheme : theme}>
                    <RoutingContext>
                      {/* <ModalProvider> */}
                      <SnackbarProvider
                        overrides={{
                          PlacementContainer: {
                            style: ({ $theme }) => ({
                              zIndex: 200,
                            }),
                          },
                        }}
                        placement={PLACEMENT.bottomRight}
                      >
                        <ModalBaseProvider>
                          <Layout>
                            <Component {...pageProps} />
                          </Layout>
                        </ModalBaseProvider>
                      </SnackbarProvider>
                    </RoutingContext>
                  </BaseProvider>
                </StyletronProvider>
              </ScreenContext>
            </FormContext>
          </QueryProvider>
        </UserProvider>
        <NotificationContainer />
      </>
    );
  }
}

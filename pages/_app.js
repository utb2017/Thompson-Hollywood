import React from "react";
import App from "next/app";
//USER
import UserProvider from "../context/userContext";
//ORDERS
import OrderProvider from "../context/orderContext";
import OrdersProvider from "../context/ordersContext";
import CreateOrderContext from "../context/createOrderContext";
//PRODUCTS
import CreateProductContext from "../context/createProductContext";
import EditProductContext from "../context/editProductContext";
import ProductContext from "../context/productContext";
//USERS
import CreateUserContext from "../context/createUsersContext";
import EditUserContext from "../context/editUsersContext";
import UsersContext from "../context/usersContext";
//DISCOUNT
import DiscountsContext from "../context/discountsContext";
//AUTH
import AuthContext from "../context/authContext";
//ROUTING
import RoutingContext from "../context/routingContext";
//FORM
import FormContext from "../context/formContext";
//MODAL
import { ModalProvider } from "../context/modalContext";
import { ModalBaseProvider } from "../context/Modal";

//VEHICLE
import VehicleContext from "../context/vehicleContext";
import ScreenContext from "../context/screenContext";

import { HistoryProvider } from "../context/History";
import QueryProvider from "../context/Query";

import MenuSettingsContext from "../context/menuSettingsContext";
import { FilterProvider } from "../context/filterContext";

import { Provider as StyletronProvider } from "styletron-react";
import { styletron } from "../styletron";

import "../styles/globals.css";
//import 'react-notifications/lib/notifications.css';
import "../styles/styles.scss";
import "../components/Console/console.scss";
import "../components/Split/split.scss";
import "../components/Modals/modals.scss";
import "../components/Table/table.scss";
import "../components/Menu/Menu.scss";
import { SnackbarProvider, PLACEMENT } from "baseui/snackbar";

// import {LightTheme, ThemeProvider} from 'baseui';
import { BaseProvider, LightTheme, DarkTheme } from "baseui";

import { NotificationContainer } from "react-notifications";
import { createTheme } from "baseui";
import { createDarkTheme } from "baseui";
const primitives = {
  negative: "rgb(212, 54, 132)", // hot pink
  red: "rgb(212, 54, 132)", // hot pink
  negative300: "rgb(212, 54, 132)", // hot pink
  positive: "rgb(0,200,5)", // hot pink
  positive300: "rgb(0,200,5)", // hot pink
  accent: "#039BE5", // hot pink
};
const theme = createTheme(primitives);
const darkTheme = createDarkTheme(primitives);

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
            <EditUserContext>
              <CreateUserContext>
                <UsersContext>
                  <DiscountsContext>
                    <EditProductContext>
                      <CreateProductContext>
                        <ProductContext>
                          <CreateOrderContext>
                            <OrdersProvider>
                              <OrderProvider>
                                <MenuSettingsContext>
                                  <AuthContext>
                                    <VehicleContext>
                                      <FilterProvider>
                                        <HistoryProvider>
                                          <ScreenContext
                                            value={{
                                              themeState: this.state,
                                              toggleTheme: this.toggleTheme,
                                            }}
                                          >
                                            <StyletronProvider
                                              value={styletron}
                                            >
                                              <BaseProvider
                                                theme={
                                                  this.state.dark
                                                    ? darkTheme
                                                    : theme
                                                }
                                              >
                                                <FormContext>
                                                  <RoutingContext>
                                                    <ModalProvider>
                                                      <SnackbarProvider
                                                        overrides={{
                                                          PlacementContainer: {
                                                            style: ({
                                                              $theme,
                                                            }) => ({
                                                              zIndex: 200,
                                                            }),
                                                          },
                                                        }}
                                                        placement={
                                                          PLACEMENT.bottomRight
                                                        }
                                                      >
                                                        <ModalBaseProvider>
                                                          <Layout>
                                                            <Component
                                                              {...pageProps}
                                                            />
                                                          </Layout>
                                                        </ModalBaseProvider>
                                                      </SnackbarProvider>
                                                    </ModalProvider>
                                                  </RoutingContext>
                                                </FormContext>
                                              </BaseProvider>
                                            </StyletronProvider>
                                          </ScreenContext>
                                        </HistoryProvider>
                                      </FilterProvider>
                                    </VehicleContext>
                                  </AuthContext>
                                </MenuSettingsContext>
                              </OrderProvider>
                            </OrdersProvider>
                          </CreateOrderContext>
                        </ProductContext>
                      </CreateProductContext>
                    </EditProductContext>
                  </DiscountsContext>
                </UsersContext>
              </CreateUserContext>
            </EditUserContext>
          </QueryProvider>
        </UserProvider>
        <NotificationContainer />
      </>
    );
  }
}

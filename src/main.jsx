import React from "react";
import "./i18n";
import "./style/style.scss";
import store from "./redux/store";
import RouterCustom from "./router";
import ChatWidget from "./component/ChatWidget";
import { AuthBootstrap } from "./component";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const root = ReactDOM.createRoot(document.getElementById("root"));
const queryClient = new QueryClient();

root.render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthBootstrap />
        <RouterCustom />
        <ChatWidget />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 2600,
            style: {
              fontFamily: "inherit",
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </Provider>
);

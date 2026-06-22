import React from "react";
import "./style/style.scss";
import store from "./redux/store";
import RouterCustom from "./router";
import { Provider } from "react-redux";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const root = ReactDOM.createRoot(document.getElementById("root"));

// Tạo instance của QueryClient
const queryClient = new QueryClient();

root.render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <RouterCustom />
      </BrowserRouter>
    </QueryClientProvider>
  </Provider>
);

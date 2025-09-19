import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // Thêm dòng này
import RouterCustom from "./router";
import "./style/style.scss";
import { ReactSession } from "react-client-session";
const root = ReactDOM.createRoot(document.getElementById("root"));
// Tạo instance của QueryClient
const queryClient = new QueryClient();

ReactSession.setStoreType("sessionStorage");

root.render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <RouterCustom />
    </BrowserRouter>
  </QueryClientProvider>
);

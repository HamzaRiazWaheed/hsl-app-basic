import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import "./styles/app.scss";
import { ApolloProvider } from "@apollo/client";
import client from "./apollo/client";

import { createRoot } from "react-dom/client";
import { Provider } from "./components/ui/provider";
import { HashRouter, Route, Routes } from "react-router-dom";
import Stations from "./pages/Stations";
import HSLRoutes from "./pages/HSLRoutes";

const element = document.getElementById("root");
const root = createRoot(element!);

root.render(
  <HashRouter>
    <ApolloProvider client={client}>
      <Provider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/stations" element={<Stations />} />
          <Route path="/routes" element={<HSLRoutes />} />
        </Routes>
      </Provider>
    </ApolloProvider>
  </HashRouter>
);

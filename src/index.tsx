/// <reference types="vite/client" />

/* @refresh reload */
import { render } from "solid-js/web";

import App from "./App";
import "./index.css";

const root = document.getElementById("root");

if (root == null) {
  throw new Error("Root element not found");
}

render(() => <App />, root);

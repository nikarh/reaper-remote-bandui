/// <reference types="vite/client" />

/* @refresh reload */
// First, so that Tailwind's cascade layers are declared in its order (theme, base, components, utilities) before the
// components' stylesheets add to them.
import "./index.css";

import { render } from "solid-js/web";
import App from "./App";

import favicon from "./favicon-32x32.png";

const link = document.createElement("link");
link.rel = "icon";
link.href = favicon;
document.head.appendChild(link);

const root = document.getElementById("root");

if (root == null) {
  throw new Error("Root element not found");
}

render(() => <App />, root);

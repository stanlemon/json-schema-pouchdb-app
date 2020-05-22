import "react-hot-loader";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import PouchDB from "pouchdb";
import App from "./components/App";

const db = new PouchDB("local");

ReactDOM.render(
  <Router basename={PUBLIC_PATH}>
    <App db={db} />
  </Router>,
  document.getElementById("app")
);

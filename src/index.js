import "react-hot-loader";
import React from "react";
import ReactDOM from "react-dom";
import { HashRouter as Router } from "react-router-dom";
import App from "./components/App";
import Database from "./util/Database";

const db = new Database();

ReactDOM.render(
  <Router basename={PUBLIC_PATH}>
    <App db={db} />
  </Router>,
  document.getElementById("app")
);

import React from "react";
import { hot } from "react-hot-loader/root";

export function App({ name }) {
  return <h1>Hello {name}!</h1>;
}

export default hot(App);

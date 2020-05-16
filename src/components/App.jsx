import React from "react";
import { hot } from "react-hot-loader/root";
import loadable from "@loadable/component";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { CssBaseline, Container } from "@material-ui/core";
import PouchDB from "pouchdb-browser";
import "typeface-roboto";
import SchemaList from "./SchemaList";

const SchemaEditor = loadable(() => import("./SchemaEditor"));

export class App extends React.Component {
  db = new PouchDB("test");

  render() {
    return (
      <>
        <CssBaseline>
          <Container>
            <Router>
              <Switch>
                <Route path="/schema/:id">
                  <SchemaEditor db={this.db} />
                </Route>
                <Route path="/">
                  <SchemaList db={this.db} />
                </Route>
              </Switch>
            </Router>
          </Container>
        </CssBaseline>
      </>
    );
  }
}

export default hot(App);

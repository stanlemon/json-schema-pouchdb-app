import React from "react";
import { hot } from "react-hot-loader/root";
import loadable from "@loadable/component";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { CssBaseline, Container } from "@material-ui/core";
import PouchDB from "pouchdb-browser";
import "typeface-roboto";
import SchemaList from "./SchemaList";

const SchemaEditor = loadable(() => import("./SchemaEditor"));
const DocumentList = loadable(() => import("./DocumentList"));
const DocumentEditor = loadable(() => import("./DocumentEditor"));

export class App extends React.Component {
  db = new PouchDB("test");

  render() {
    return (
      <>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <CssBaseline>
            <Container>
              <Router>
                <Switch>
                  <Route path="/document/:id" exact>
                    <DocumentList db={this.db} />
                  </Route>
                  <Route path="/document/:schema/:document">
                    <DocumentEditor db={this.db} />
                  </Route>
                  <Route path="/schema/:id" exact>
                    <SchemaEditor db={this.db} />
                  </Route>
                  <Route path="/" exact>
                    <SchemaList db={this.db} />
                  </Route>
                </Switch>
              </Router>
            </Container>
          </CssBaseline>
        </SnackbarProvider>
      </>
    );
  }
}

export default hot(App);

import React from "react";
import { hot } from "react-hot-loader/root";
import loadable from "@loadable/component";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import PouchDB from "pouchdb-browser";
import "typeface-roboto";
import SchemaList from "./SchemaList";
import DocumentList from "./DocumentList";

const SchemaEditor = loadable(() =>
  import(/* webpackChunkName: "SchemaEditor" */ "./SchemaEditor")
);
const DocumentEditor = loadable(() =>
  import(/* webpackChunkName: "DocumentEditor" */ "./DocumentEditor")
);

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
              <Router basename={PUBLIC_PATH}>
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

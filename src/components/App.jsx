import React from "react";
import { hot } from "react-hot-loader/root";
import loadable from "@loadable/component";
import { Switch, Route, Link } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import "typeface-roboto";
import SchemaList from "./SchemaList";
import DocumentList from "./DocumentList";

const SchemaEditor = loadable(() =>
  import(/* webpackChunkName: "SchemaEditor" */ "./SchemaEditor")
);
const DocumentEditor = loadable(() =>
  import(/* webpackChunkName: "DocumentEditor" */ "./DocumentEditor")
);

export function App({ db }) {
  return (
    <SnackbarProvider
      maxSnack={3}
      autoHideDuration={3000}
      disableWindowBlurListener={true}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <CssBaseline>
        <Container>
          <Switch>
            <Route path="/document/:id" exact>
              <DocumentList db={db} />
            </Route>
            <Route path="/document/:schema/:document">
              <DocumentEditor db={db} />
            </Route>
            <Route path="/schema/:id" exact>
              <SchemaEditor db={db} />
            </Route>
            <Route path="/" exact>
              <SchemaList db={db} />
            </Route>
          </Switch>
        </Container>
      </CssBaseline>
    </SnackbarProvider>
  );
}

export default hot(App);

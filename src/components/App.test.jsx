import React from "react";
import { withRouter, MemoryRouter as Router } from "react-router-dom";
import { render, cleanup, waitFor, screen } from "@testing-library/react";
import PouchDB from "pouchdb";
import App from "./App";

PouchDB.plugin(require("pouchdb-adapter-memory"));

afterEach(cleanup);

test("e2e", async () => {
  // Helpful for debugging and seeing where we are at
  const LocationDisplay = withRouter(({ location }) => (
    <div data-testid="location-display">{location.pathname}</div>
  ));

  const db = new PouchDB("test", { adapter: "memory" });

  render(
    <Router initialEntries={["/"]}>
      <App db={db} />
      <LocationDisplay />
    </Router>
  );

  await waitFor(() => screen.getByText("Schemas"));
});

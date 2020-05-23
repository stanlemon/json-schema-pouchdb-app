import React from "react";
import { withRouter, MemoryRouter as Router } from "react-router-dom";
import {
  render,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect";
import PouchDB from "pouchdb";
import App from "./App";
import stringify from "../util/stringify";
import { SAMPLE_DATA } from "../util/Database";

PouchDB.plugin(require("pouchdb-adapter-memory"));

test("e2e", async () => {
  // Helpful for debugging and seeing where we are at
  const LocationDisplay = withRouter(({ location }) => (
    <div data-testid="location-pathname">{location.pathname}</div>
  ));

  const db = new PouchDB("test", { adapter: "memory" });

  const { debug, getByText, getByTestId, getByLabelText, findByText } = render(
    <Router initialEntries={["/"]}>
      <App db={db} />
      <LocationDisplay />
    </Router>
  );

  // Wait until the component is loaded and the title says Schemas
  await waitFor(() => getByText("Schemas"));

  expect(await findByText("Schemas")).toBeInTheDocument();

  const schemaName = "My Test Schema Name";
  const schemaId = "my-test-schema-name";

  // Create our first schema
  // Fill in the schema name
  userEvent.type(getByTestId("create-schema-name"), schemaName);

  // Click the save button
  userEvent.click(getByTestId("create-schema-button"));

  // Wait for the new schema to appear in the list
  await waitFor(() => getByTestId("schema-" + schemaId));

  // Click on the edit button for the new schema
  userEvent.click(getByTestId(`edit-schema-button-${schemaId}`));

  await waitFor(() => getByTestId("schema-name"));

  // The editor has our sample data set in it.
  expect(ace.edit("ace-editor").getValue()).toEqual(stringify(SAMPLE_DATA));

  const schemaData = {
    type: "object",
    required: [...SAMPLE_DATA.required],
    properties: {
      ...SAMPLE_DATA.properties,
      email: {
        type: "string",
        title: "Email Address",
      },
      isArchived: {
        type: "boolean",
        title: "Is Archived?",
      },
    },
  };

  // Change the value of the schema
  ace.edit("ace-editor").setValue(stringify(schemaData));

  // Wait for the schema to be saved, check for the form to update it's preview
  // Note: The state is probably not finished being updated when this appears
  await waitFor(() => getByText("Is Archived?"));

  // Navigate back to the schema list
  userEvent.click(getByTestId("return-to-schema-list"));

  expect(await findByText("Schemas")).toBeInTheDocument();

  // Click the button to create a new document for the schema we just made
  userEvent.click(getByTestId("create-document-button-" + schemaId));

  // Wait for the page to navigate to the document editor
  const documentId = await waitFor(() => {
    expect(getByTestId("location-pathname")).toContainHTML(
      "/document/" + schemaId + "/" // The UUID comes after this
    );
    const location = getByTestId("location-pathname").innerHTML.trim();
    return location.replace("/document/" + schemaId + "/", "");
  });

  expect(await findByText(schemaName)).toBeInTheDocument();

  // Find the form for our document
  await waitFor(() => {
    expect(
      getByText((content, element) => {
        return element.tagName.toLowerCase() === "form";
      })
    ).toBeInTheDocument();
  });

  // Fill in the properties of our schema
  const firstName = getByLabelText(/First Name/);
  await userEvent.type(firstName, "Stan");
  expect(firstName).toHaveAttribute("value", "Stan");

  const lastName = getByLabelText(/Last Name/);
  await userEvent.type(lastName, "Lemon");
  expect(lastName).toHaveAttribute("value", "Lemon");

  // Click the button to save the schema
  userEvent.click(getByTestId("document-save-button"));

  // A 'snack' (aka) toast indicating we saved the document
  await waitFor(async () => {
    expect(await findByText("Document saved.")).toBeInTheDocument();
  });

  // Click the link to return to our list of documents
  userEvent.click(getByTestId("return-to-document-list"));

  await waitFor(async () => {
    expect(await findByText(schemaName)).toBeInTheDocument();
  });

  // Click to edit the document we just created
  userEvent.click(getByTestId(`edit-document-button-${documentId}`));

  await waitFor(() => {
    expect(
      getByText((content, element) => {
        return element.tagName.toLowerCase() === "form";
      })
    ).toBeInTheDocument();
  });

  // Change the first name field of our document
  userEvent.clear(getByLabelText(/First Name/));
  await userEvent.type(getByLabelText(/First Name/), "Stanley");
  expect(getByLabelText(/First Name/)).toHaveAttribute("value", "Stanley", {
    allAtOnce: true,
  });

  // Click the button to save our document
  userEvent.click(getByTestId("document-save-button"));

  // A 'snack' (aka) toast indicating we saved the document
  await waitFor(async () => {
    expect(await findByText("Document saved.")).toBeInTheDocument();
  });

  // Return to the document list
  userEvent.click(getByTestId("return-to-document-list"));

  await waitFor(() => {
    expect(getByTestId("document-list")).toBeInTheDocument();
  });

  expect(getByTestId(`document-${documentId}`)).toBeInTheDocument();

  // Click the delete button to remove our document
  userEvent.click(getByTestId(`delete-document-button-${documentId}`));
  await waitForElementToBeRemoved(getByTestId(`document-${documentId}`));

  // All the rows have been removed
  expect(getByTestId("document-list-rows").childNodes).toHaveLength(0);

  // Return to the schema list
  userEvent.click(getByTestId("return-to-schema-list"));

  await waitFor(() => {
    expect(getByTestId("schema-list")).toBeInTheDocument();
  });

  // Make sure our schema is present
  expect(getByTestId(`schema-${schemaId}`)).toBeInTheDocument();

  // Delete our schema
  userEvent.click(getByTestId(`delete-schema-button-${schemaId}`));

  await waitForElementToBeRemoved(getByTestId(`schema-${schemaId}`));

  // Verify we have no schemas left
  expect(getByTestId("schema-list").childNodes).toHaveLength(0);
});

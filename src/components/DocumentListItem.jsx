import React from "react";
import { withRouter } from "react-router-dom";
import IconButton from "@material-ui/core/IconButton";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import Tooltip from "@material-ui/core/Tooltip";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import ConfirmButton from "./ConfirmButton";

export function DocumentListItem({
  history,
  schemaId,
  columns,
  item,
  deleteDocument,
}) {
  const { id: documentId, index, lastUpdated, created, ...data } = item;
  const deleteDocumentHandler = () => deleteDocument(documentId);

  return (
    <TableRow
      hover={true}
      data-testid={`document-${documentId}`}
      // In order to make it clear that these rows are clickable
      style={{ cursor: "pointer" }}
    >
      <TableCell
        align="right"
        onClick={() => history.push(`/document/${schemaId}/${documentId}`)}
      >
        {index + 1}
      </TableCell>
      {columns.map(({ key }) => (
        <TableCell
          key={`${documentId}-${key}`}
          onClick={() => history.push(`/document/${schemaId}/${documentId}`)}
        >
          {toString(data[key])}
        </TableCell>
      ))}
      <TableCell align="right">
        <Tooltip title="Edit Document">
          <IconButton
            edge="end"
            aria-label="edit"
            onClick={() => history.push(`/document/${schemaId}/${documentId}`)}
            color="primary"
            data-testid={`edit-document-button-${documentId}`}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Document">
          <ConfirmButton
            component={IconButton}
            message="Delete Document"
            description="Are you sure you want to delete this document? This action is permanent."
            edge="end"
            aria-label="delete"
            onConfirm={deleteDocumentHandler}
            color="secondary"
            data-testid={`delete-document-button-${documentId}`}
          >
            <DeleteIcon />
          </ConfirmButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

function toString(value) {
  if (value === undefined || value === null) {
    return "";
  } else if (typeof value === "string") {
    return value;
  } else if (typeof value === "boolean") {
    return value ? "true" : "false";
  } else if (Array.isArray(value)) {
    return value.map(toString);
  } else if (Object.keys(value).length > 0) {
    return Object.values(value).join(", ");
  } else {
    return "";
  }
}

export default withRouter(DocumentListItem);

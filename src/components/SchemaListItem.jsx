import React from "react";
import { Link } from "react-router-dom";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Tooltip from "@material-ui/core/Tooltip";
import FolderIcon from "@material-ui/icons/Folder";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import PostAddIcon from "@material-ui/icons/PostAdd";
import ConfirmButton from "./ConfirmButton";

export default function SchemaListItem({
  createDocument,
  deleteSchema,
  id,
  title,
}) {
  const createDocumentHandler = () => createDocument(id);
  const deleteSchemaHandler = () => deleteSchema(id);

  return (
    <>
      <ListItem
        button
        key={id}
        component={Link}
        to={`/document/${id}`}
        data-testid={`schema-${id}`}
      >
        <ListItemAvatar>
          <Avatar>
            <FolderIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={title} data-testid={`document-list-${id}`} />
        <ListItemSecondaryAction>
          <Tooltip title="Create Document">
            <IconButton
              edge="end"
              aria-label="new"
              color="default"
              onClick={createDocumentHandler}
              data-testid={`create-document-button-${id}`}
            >
              <PostAddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Schema">
            <IconButton
              edge="end"
              aria-label="edit"
              color="primary"
              component={Link}
              to={`/schema/${id}`}
              data-testid={`edit-schema-button-${id}`}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Schema">
            <ConfirmButton
              component={IconButton}
              message="Delete Schema"
              description="Are you sure you want to delete this schema? All associated documents will be deleted and this action is permanent."
              edge="end"
              aria-label="delete"
              color="secondary"
              onConfirm={deleteSchemaHandler}
              data-testid={`delete-schema-button-${id}`}
            >
              <DeleteIcon />
            </ConfirmButton>
          </Tooltip>
        </ListItemSecondaryAction>
      </ListItem>
    </>
  );
}

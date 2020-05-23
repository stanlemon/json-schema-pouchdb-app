import React from "react";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import FolderIcon from "@material-ui/icons/Folder";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import PostAddIcon from "@material-ui/icons/PostAdd";
import { Helmet } from "react-helmet";
import { withSnackbar } from "notistack";
import Spacer from "./Spacer";

export class SchemaList extends React.Component {
  state = {
    loaded: false,
    title: "",
    schemas: {},
  };

  reset = async () => {
    try {
      await this.props.db.reset();

      this.setState({
        title: "",
        schemas: {},
      });
    } catch (err) {
      console.error(err);
    }
  };

  async componentDidMount() {
    try {
      const schemas = await this.props.db.getSchemas();

      this.setState({
        loaded: true,
        schemas,
      });
    } catch (error) {
      console.error(error);
      this.reset();
    }
  }

  updateTitle = (event) => {
    const { value: title } = event.target;

    this.setState({
      title,
    });
  };

  createSchema = async () => {
    if (!this.state.title) {
      return;
    }

    try {
      await this.props.db.createSchema(this.state.title);

      const schemas = await this.props.db.getSchemas();

      this.setState({
        schemas,
        title: "",
      });
    } catch (error) {
      console.error(error);
    }
  };

  deleteSchema = async (id) => {
    try {
      await this.props.db.deleteSchema(id);

      const schemas = await this.props.db.getSchemas();

      this.setState({
        schemas,
      });

      this.props.enqueueSnackbar("Schema deleted.", { variant: "error" });
    } catch (error) {
      console.error(error);
    }
  };

  createDocument = async (schemaId) => {
    try {
      const id = await this.props.db.createDocument(schemaId);

      this.props.history.push(`/document/${schemaId}/${id}`);
    } catch (error) {
      console.error(error);
    }
  };

  render() {
    const { loaded, schemas, title } = this.state;

    if (!loaded) {
      return <div />;
    }

    return (
      <>
        <Helmet>
          <title>Schemas</title>
        </Helmet>
        <Typography variant="h3" component="h1">
          Schemas
        </Typography>
        <List data-testid="schema-list">
          {Object.values(schemas).map((schema) => (
            <ListItem
              button
              key={schema.id}
              component={Link}
              to={`/document/${schema.id}`}
              data-testid={`schema-${schema.id}`}
            >
              <ListItemAvatar>
                <Avatar>
                  <FolderIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={schema.title}
                data-testid={`document-list-${schema.id}`}
              />
              <ListItemSecondaryAction>
                {/* TODO: Fix this binding */}
                <IconButton
                  edge="end"
                  aria-label="new"
                  onClick={async () => await this.createDocument(schema.id)}
                  data-testid={`create-document-button-${schema.id}`}
                >
                  <PostAddIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  component={Link}
                  to={`/schema/${schema.id}`}
                  color="secondary"
                  data-testid={`edit-schema-button-${schema.id}`}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={async () => await this.deleteSchema(schema.id)}
                  data-testid={`delete-schema-button-${schema.id}`}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <Grid container spacing={2}>
          <Grid item xs>
            <TextField
              fullWidth
              id="schema-name"
              label="Schema Name"
              onChange={this.updateTitle}
              value={title}
              size="small"
              variant="outlined"
              inputProps={{
                "data-testid": "create-schema-name",
              }}
            />
          </Grid>
          <Grid item xs={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={this.createSchema}
              data-testid="create-schema-button"
            >
              Save
            </Button>
          </Grid>
        </Grid>
        <Spacer />
        <Button
          variant="contained"
          color="secondary"
          startIcon={<DeleteIcon />}
          onClick={this.reset}
          data-testid="reset-all-schemas"
        >
          Reset All Schemas
        </Button>
      </>
    );
  }
}

export default withRouter(withSnackbar(SchemaList));

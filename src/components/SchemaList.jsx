import React from "react";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import {
  Grid,
  Button,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
} from "@material-ui/core";
import FolderIcon from "@material-ui/icons/Folder";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import PostAddIcon from "@material-ui/icons/PostAdd";
import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";
import Ajv from "ajv";
import { Helmet } from "react-helmet";
import { withSnackbar } from "notistack";
import dayjs from "dayjs";
import Spacer from "./Spacer";

const sampleData = {
  required: ["firstName", "lastName"],
  properties: {
    firstName: {
      title: "First Name",
      type: "string",
    },
    lastName: {
      title: "Last Name",
      type: "string",
    },
  },
};

const ajv = new Ajv({
  removeAdditional: true,
  useDefaults: "empty",
});

export class SchemaList extends React.Component {
  state = {
    loaded: false,
    title: "",
    schemas: {},
    rev: null,
  };

  reset = async () => {
    try {
      let doc = await this.props.db.get("schemas");

      doc = await this.props.db.put({
        _id: "schemas",
        _rev: doc._rev,
        schemas: {},
      });

      this.setState({
        title: "",
        schemas: {},
        rev: doc.rev,
      });
    } catch (err) {
      console.error(err);
    }
  };

  async componentDidMount() {
    try {
      const doc = await this.props.db.get("schemas");

      // If something is wrong, reset the database
      if (!doc.schemas) {
        await this.reset();
        return;
      }

      this.setState({
        loaded: true,
        schemas: doc.schemas,
        rev: doc._rev,
      });
    } catch (err) {
      if (err.status !== 404) {
        console.error(status);
        return;
      }

      const doc = await this.props.db.put({
        _id: "schemas",
        schemas: {},
      });

      this.setState({
        loaded: true,
        schemas: {},
        rev: doc.rev,
      });
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

    const id = slugify(this.state.title, { lower: true });
    // Append the new schema
    const schemas = {
      ...this.state.schemas,
      [id]: { id, title: this.state.title, schema: sampleData },
    };

    const doc = await this.props.db.put({
      _id: "schemas",
      schemas,
      // If we have a revision supply it (we won't for the very first schema)
      ...(this.state.rev ? { _rev: this.state.rev } : {}),
    });

    this.setState({
      schemas,
      title: "",
      rev: doc.rev,
    });
  };

  deleteSchema = async (id) => {
    // Append the new schema
    const { [id]: deleted, ...schemas } = this.state.schemas;

    const doc = await this.props.db.put({
      _id: "schemas",
      _rev: this.state.rev,
      schemas,
    });

    this.props.enqueueSnackbar("Schema deleted.", { variant: "error" });

    this.setState({
      schemas,
      rev: doc.rev,
    });
  };

  createDocument = async (id) => {
    const { schema } = this.state.schemas[id];

    let data = {};
    ajv.validate(schema, data); // Will fill in defaults

    const now = dayjs().toISOString();

    const row = { id: uuidv4(), ...data, created: now, lastUpdated: now };

    try {
      const { _rev, rows } = await this.props.db.get(id);

      const doc = await this.props.db.put({
        _id: id,
        _rev,
        rows: [...rows, row],
      });

      this.props.history.push(`/document/${id}/${row.id}`);

      return doc;
    } catch (err) {
      if (err.status !== 404) {
        console.error(status);
        return;
      }

      // Create a new document for our schema
      const doc = await this.props.db.put({
        _id: id,
        rows: [row],
      });

      this.props.history.push(`/document/${id}/${row.id}`);

      return doc;
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
        <List>
          {Object.values(schemas).map((schema) => (
            <ListItem
              button
              key={schema.id}
              component={Link}
              to={`/document/${schema.id}`}
            >
              <ListItemAvatar>
                <Avatar>
                  <FolderIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={schema.title} />
              <ListItemSecondaryAction>
                {/* TODO: Fix this binding */}
                <IconButton
                  edge="end"
                  aria-label="new"
                  onClick={async () => await this.createDocument(schema.id)}
                >
                  <PostAddIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  component={Link}
                  to={`/schema/${schema.id}`}
                  color="secondary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={async () => await this.deleteSchema(schema.id)}
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
            />
          </Grid>
          <Grid item xs={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={this.createSchema}
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
        >
          Reset All Schemas
        </Button>
      </>
    );
  }
}

export default withRouter(withSnackbar(SchemaList));

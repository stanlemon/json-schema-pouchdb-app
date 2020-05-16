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
import slugify from "slugify";
import { Helmet } from "react-helmet";
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
        rev: doc._rev,
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
    const id = slugify(this.state.title, { lower: true });
    // Append the new schema
    const schemas = {
      ...this.state.schemas,
      [id]: { id, title: this.state.title, schema: sampleData },
    };

    const doc = await this.props.db.put({
      _id: "schemas",
      _rev: this.state.rev,
      schemas,
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

    console.log(id, deleted, schemas);

    const doc = await this.props.db.put({
      _id: "schemas",
      _rev: this.state.rev,
      schemas,
    });

    this.setState({
      schemas,
      rev: doc.rev,
    });
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
              to={`/schema/${schema.id}`}
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

export default withRouter(SchemaList);

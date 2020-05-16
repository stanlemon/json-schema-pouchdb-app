import React from "react";
import Ajv from "ajv";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-twilight";
import Form from "@rjsf/material-ui";
import { Link, Grid, Button, TextField, Typography } from "@material-ui/core";
import { withRouter } from "react-router";
import { Link as RouterLink } from "react-router-dom";
import { Helmet } from "react-helmet";
import Spacer from "./Spacer";

export class SchemaEditor extends React.Component {
  ajv = new Ajv();

  state = {
    loaded: false,
    rev: null,
    schemas: {}, // All of the schemas, needed for saves
    title: "",
    schema: {},
    value: this.stringify({}),
    data: {},
  };

  stringify(data) {
    return JSON.stringify(data, null, "  ");
  }

  getId() {
    const { id } = this.props.match.params;
    return id;
  }

  async componentDidMount() {
    const { _rev: rev, schemas } = await this.props.db.get("schemas");
    const id = this.getId();
    const { title, schema } = schemas[id];

    this.setState({
      loaded: true,
      rev,
      schemas,
      title,
      schema,
      value: this.stringify(schema),
    });
  }

  updateTitle = (event) => {
    const { value: title } = event.target;

    this.setState(
      {
        title,
      },
      () => this.save()
    );
  };

  updateSchema = (value) => {
    // Update the value even if there are syntax errors
    this.setState({ value });

    try {
      const schema = JSON.parse(value);

      if (!this.ajv.validateSchema(schema)) {
        console.warn("Invalid schema");
        return;
      }

      // Only update the schema and save it if it is valid
      this.setState(
        {
          schema: JSON.parse(value),
        },
        () => this.save()
      );
    } catch (e) {
      // Occurs a lot while typing
      console.warn(e);
    }
  };

  save = () => {
    const id = this.getId();

    this.props.db
      .put({
        _id: "schemas",
        _rev: this.state.rev,
        schemas: {
          ...this.state.schemas,
          [id]: {
            id,
            title: this.state.title,
            schema: this.state.schema,
          },
        },
      })
      .then(({ rev }) => this.setState({ rev }));
  };

  render() {
    const { loaded, id, title, value, schema } = this.state;

    if (!loaded) {
      return <div />;
    }

    return (
      <>
        <Helmet>
          <title>{`Edit ${title}`}</title>
        </Helmet>
        <Typography variant="h3" component="h1">
          Edit {title}
        </Typography>
        <Link component={RouterLink} to="/">
          Return to Schema List
        </Link>
        <Spacer />
        <Grid container spacing={2}>
          <Grid item xs>
            <Grid container>
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
            </Grid>

            <Spacer />

            <AceEditor
              onChange={this.updateSchema}
              value={value}
              width="100%"
              mode="json"
              theme="twilight"
            />

            <Spacer />
          </Grid>
          <Grid item xs>
            <Form schema={schema}>
              <Button variant="contained" color="primary">
                Submit
              </Button>
            </Form>
          </Grid>
        </Grid>
      </>
    );
  }
}

export default withRouter(SchemaEditor);

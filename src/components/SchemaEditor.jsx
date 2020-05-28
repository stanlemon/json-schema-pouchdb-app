import React from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-twilight";
import Form from "@rjsf/material-ui";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Alert from "@material-ui/lab/Alert";
import { withRouter } from "react-router";
import { Link as RouterLink } from "react-router-dom";
import Spacer from "./Spacer";
import DocumentTitle from "./DocumentTitle";
import stringify from "../util/stringify";

export class SchemaEditor extends React.Component {
  state = {
    loaded: false,
    title: "",
    schema: {},
    value: stringify({}),
    error: null,
  };

  getId() {
    const { id } = this.props.match.params;
    return id;
  }

  async componentDidMount() {
    const { title, schema } = await this.props.db.getSchema(this.getId());

    this.setState({
      loaded: true,
      title,
      schema,
      value: stringify(schema),
    });
  }

  updateTitle = (event) => {
    const { value: title } = event.target;

    this.setState({ title }, () => this.save());
  };

  updateSchema = async (value, x, y) => {
    // Update the value even if there are syntax errors
    this.setState({ value });

    // If the editor has been cleared skip trying to parse and validate it
    if (value.trim() === "") {
      return;
    }

    try {
      const schema = JSON.parse(value);

      await this.save();

      // Only update the schema and save it if it is valid
      this.setState(
        {
          error: null,
          schema,
        },
        () => this.save()
      );
    } catch (e) {
      // Occurs a lot while typing
      console.warn(e);
    }
  };

  save = async () => {
    const id = this.getId();

    await this.props.db.saveSchema(id, this.state.title, this.state.schema);
  };

  render() {
    const { loaded, title, value, schema, error } = this.state;

    if (!loaded) {
      return <div />;
    }

    return (
      <>
        <DocumentTitle title={`Edit ${title}`} />
        <Typography variant="h3" component="h1">
          Edit {title}
        </Typography>
        <p>
          <Link
            component={RouterLink}
            to="/"
            data-testid="return-to-schema-list"
          >
            Return to Schema List
          </Link>
        </p>
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
              data-testid="schema-name"
            />

            <Spacer />

            {error && (
              <>
                <Alert severity="error" data-testid="schema-error">
                  {error}
                </Alert>
                <Spacer />
              </>
            )}

            <AceEditor
              onChange={this.updateSchema}
              value={value}
              width="100%"
              mode="json"
              theme="twilight"
              data-testid="schema-editor"
            />

            <Spacer />
          </Grid>
          <Grid item xs>
            <Form disabled={true} schema={schema} data-testid="schema-preview">
              <Button
                variant="contained"
                color="primary"
                data-testid="save-schema-button"
              >
                Submit
              </Button>
            </Form>
          </Grid>
        </Grid>
        <Spacer />
      </>
    );
  }
}

export default withRouter(SchemaEditor);

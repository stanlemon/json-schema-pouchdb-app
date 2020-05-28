import React from "react";
import { withRouter } from "react-router";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import DeleteIcon from "@material-ui/icons/Delete";
import { withSnackbar } from "notistack";
import Spacer from "./Spacer";
import DocumentTitle from "./DocumentTitle";
import ConfirmButton from "./ConfirmButton";
import SchemaListItem from "./SchemaListItem";

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

  deleteSchema = async (schemaId) => {
    try {
      await this.props.db.deleteSchema(schemaId);

      const schemas = await this.props.db.getSchemas();

      this.setState({ schemas });

      this.props.enqueueSnackbar("Schema deleted.", {
        variant: "error",
      });
    } catch (error) {
      console.error(error);
    }
  };

  createDocument = async (schemaId) => {
    try {
      const documentId = await this.props.db.createDocument(schemaId);

      this.props.history.push(`/document/${schemaId}/${documentId}`);
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
        <DocumentTitle title="Schemas" />
        <Typography variant="h3" component="h1">
          Schemas
        </Typography>
        <List data-testid="schema-list">
          {Object.values(schemas).map((schema) => (
            <SchemaListItem
              key={schema.id}
              {...schema}
              createDocument={this.createDocument}
              deleteSchema={this.deleteSchema}
            />
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
        <Spacer height={2} />
        <ConfirmButton
          message="Reset Database"
          description="Are you sure you want to reset your database? All of your schemas and their documents will be deleted and this action is permanent."
          variant="contained"
          color="secondary"
          startIcon={<DeleteIcon />}
          onConfirm={this.reset}
          data-testid="reset-all-schemas"
        >
          Reset Database
        </ConfirmButton>
      </>
    );
  }
}

export default withRouter(withSnackbar(SchemaList));

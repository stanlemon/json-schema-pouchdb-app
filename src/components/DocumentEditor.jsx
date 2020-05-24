import React from "react";
import { withRouter } from "react-router";
import { Link as RouterLink } from "react-router-dom";
import { Helmet } from "react-helmet";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Link from "@material-ui/core/Link";
import Form from "@rjsf/material-ui";
import { withSnackbar } from "notistack";
import Spacer from "./Spacer";

export class DocumentEditor extends React.Component {
  state = {
    loaded: false,
  };

  getSchemaId() {
    const { schema } = this.props.match.params;
    return schema;
  }

  getDocumentId() {
    const { document } = this.props.match.params;
    return document;
  }

  async componentDidMount() {
    try {
      const schemaId = this.getSchemaId();
      const documentId = this.getDocumentId();

      const schema = await this.props.db.getSchema(schemaId);
      const data = await this.props.db.getDocument(schemaId, documentId);

      this.setState({
        loaded: true,
        schema,
        data,
      });
    } catch (error) {
      console.error(error);
      return;
    }
  }

  onChange = ({ formData: data }) => {
    this.setState({ data: { ...this.state.data, ...data } });
  };

  onSubmit = async ({ formData }) => {
    try {
      const data = await this.props.db.saveDocument(
        this.getSchemaId(),
        this.getDocumentId(),
        formData
      );

      this.setState({ data });

      this.props.enqueueSnackbar("Document saved.", {
        variant: "success",
      });
    } catch (error) {
      console.error(error);
    }
  };

  render() {
    const { loaded, schema, data } = this.state;

    if (!loaded) {
      return <div />;
    }

    return (
      <>
        <Helmet>
          <title>{schema.title}</title>
        </Helmet>
        <Typography variant="h3" component="h1">
          {schema.title}
        </Typography>
        <p>
          <Link
            component={RouterLink}
            to={`/document/${schema.id}`}
            data-testid="return-to-document-list"
          >
            Return to Document List
          </Link>
        </p>
        <Form
          schema={schema.schema}
          formData={data}
          onChange={this.onChange}
          onSubmit={this.onSubmit}
          data-testid="document-form"
        >
          <Button
            type="submit"
            variant="contained"
            color="primary"
            data-testid="document-save-button"
          >
            Save
          </Button>
        </Form>
        <Spacer />
        <div>
          <div>Created: {data.created}</div>
          <div>Last Updated: {data.lastUpdated}</div>
        </div>
        <Spacer />
      </>
    );
  }
}

export default withRouter(withSnackbar(DocumentEditor));

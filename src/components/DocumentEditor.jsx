import React from "react";
import { withRouter } from "react-router";
import { Link as RouterLink } from "react-router-dom";
import { Helmet } from "react-helmet";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Link from "@material-ui/core/Link";
import Form from "@rjsf/material-ui";
import Spacer from "./Spacer";
import { withSnackbar } from "notistack";

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

      const { schemas } = await this.props.db.get("schemas");
      const doc = await this.props.db.get(schemaId);
      const data = doc.rows.filter((row) => row.id === documentId)[0];

      this.setState({
        loaded: true,
        schema: schemas[schemaId],
        rev: doc._rev,
        data,
        doc,
      });
    } catch (err) {
      if (err.status !== 404) {
        console.error(err);
        return;
      }

      // Do something for a 404
    }
  }

  onChange = ({ formData: data }) => {
    this.setState({ data });
  };

  onSubmit = async ({ formData: data }) => {
    this.setState({ data });

    const documentId = this.getDocumentId();

    const rows = [
      ...this.state.doc.rows.map((row) => {
        if (row.id === documentId) {
          return this.state.data;
        }
        return row;
      }),
    ];

    const { rev } = await this.props.db.put({
      ...this.state.doc,
      _id: this.getSchemaId(),
      _rev: this.state.rev,
      rows,
    });

    this.props.enqueueSnackbar("Document saved.", { variant: "success" });

    this.setState({
      rev,
    });
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
        <Link component={RouterLink} to={`/document/${schema.id}`}>
          Return to Document List
        </Link>
        <Spacer />
        <Form
          schema={schema.schema}
          formData={data}
          onChange={this.onChange}
          onSubmit={this.onSubmit}
        >
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </Form>
      </>
    );
  }
}

export default withRouter(withSnackbar(DocumentEditor));

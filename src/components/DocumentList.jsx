import React from "react";
import { withRouter } from "react-router";
import { Link as RouterLink } from "react-router-dom";
import Link from "@material-ui/core/Link";
import IconButton from "@material-ui/core/IconButton";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import PostAddIcon from "@material-ui/icons/PostAdd";
import { withSnackbar } from "notistack";
import DocumentTitle from "./DocumentTitle";
import DocumentListItem from "./DocumentListItem";

export class DocumentList extends React.Component {
  state = {
    loaded: false,
  };

  getId() {
    const { id } = this.props.match.params;
    return id;
  }

  async componentDidMount() {
    const id = this.getId();

    try {
      const schema = await this.props.db.getSchema(id);
      const data = await this.props.db.getDocuments(id);

      this.setState({
        loaded: true,
        schema,
        data,
      });
    } catch (error) {
      console.error(error);
    }
  }

  createDocument = async () => {
    try {
      const schemaId = this.getId();
      const id = await this.props.db.createDocument(schemaId);

      this.props.history.push(`/document/${schemaId}/${id}`);
    } catch (error) {
      console.error(error);
    }
  };

  deleteDocument = async (id) => {
    try {
      await this.props.db.deleteDocument(this.getId(), id);
      const data = await this.props.db.getDocuments(this.getId());
      this.setState({ data });
    } catch (error) {
      console.error(error);
    }
  };

  render() {
    const { loaded, data: items } = this.state;

    if (!loaded) {
      return <div />;
    }
    const { id: schemaId, schema, title } = this.state.schema;

    const columns = Object.entries(schema.properties)
      .filter((property) => property.type !== "object" && property !== "array")
      .map(([key, property]) => ({
        key,
        label: property.title,
      }));

    return (
      <>
        <DocumentTitle title={title} />
        <Typography variant="h3" component="h1">
          {title}
        </Typography>
        <Grid container alignItems="baseline">
          <Grid item xs>
            <Link
              component={RouterLink}
              to="/"
              data-testid="return-to-schema-list"
            >
              Return to Schema List
            </Link>
          </Grid>
          <Grid item xs align="right">
            <Tooltip title="Create Document">
              <IconButton
                edge="end"
                aria-label="new"
                color="default"
                onClick={this.createDocument}
                data-testid={`create-document-button-${schema.id}`}
              >
                <PostAddIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
        {items.length === 0 && (
          <Typography align="center" data-testid="document-list-empty">
            <em>
              You haven't created any documents yet. Click the button to the
              upper right to get started.
            </em>
          </Typography>
        )}
        {items.length > 0 && (
          <TableContainer component={Paper}>
            <Table size="small" data-testid="document-list">
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  {columns.map((column) => (
                    <TableCell key={column.key}>{column.label}</TableCell>
                  ))}
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody data-testid="document-list-items">
                {items.map((item, index) => (
                  <DocumentListItem
                    key={index}
                    schemaId={schemaId}
                    item={{ index, ...item }}
                    deleteDocument={this.deleteDocument}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </>
    );
  }
}

export default withRouter(withSnackbar(DocumentList));

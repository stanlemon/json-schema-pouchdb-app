import React from "react";
import { withRouter } from "react-router";
import { Link as RouterLink } from "react-router-dom";
import { Helmet } from "react-helmet";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import IconButton from "@material-ui/core/IconButton";
import Grid from "@material-ui/core/Grid";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import PostAddIcon from "@material-ui/icons/PostAdd";
import { withSnackbar } from "notistack";
import Spacer from "./Spacer";

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

  async deleteDocument(id) {
    try {
      await this.props.db.deleteDocument(this.getId(), id);
      const data = await this.props.db.getDocuments(this.getId());
      this.setState({ data });
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    const { loaded, data: rows } = this.state;

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
        <Helmet>
          <title>{title}</title>
        </Helmet>
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
          <Grid item xs justify="flex-end" align="right">
            <IconButton
              edge="end"
              aria-label="new"
              color="default"
              onClick={this.createDocument}
              data-testid={`create-document-button-${schema.id}`}
            >
              <PostAddIcon />
            </IconButton>
          </Grid>
        </Grid>
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
            <TableBody data-testid="document-list-rows">
              {rows.map((row, i) => (
                <TableRow
                  hover={true}
                  key={row.id}
                  data-testid={`document-${row.id}`}
                >
                  <TableCell
                    align="right"
                    onClick={() =>
                      this.props.history.push(`/document/${schemaId}/${row.id}`)
                    }
                  >
                    {i + 1}
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell
                      key={`${row.id}-${column.key}`}
                      onClick={() =>
                        this.props.history.push(
                          `/document/${schemaId}/${row.id}`
                        )
                      }
                    >
                      {row[column.key]}
                    </TableCell>
                  ))}
                  <TableCell align="right">
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() =>
                        this.props.history.push(
                          `/document/${schemaId}/${row.id}`
                        )
                      }
                      color="primary"
                      data-testid={`edit-document-button-${row.id}`}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={async () => await this.deleteDocument(row.id)}
                      color="secondary"
                      data-testid={`delete-document-button-${row.id}`}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  }
}

export default withRouter(withSnackbar(DocumentList));

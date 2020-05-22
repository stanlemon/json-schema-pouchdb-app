import React from "react";
import { withRouter } from "react-router";
import { Link as RouterLink } from "react-router-dom";
import { Helmet } from "react-helmet";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import IconButton from "@material-ui/core/IconButton";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
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
    const { schemas } = await this.props.db.get("schemas");

    try {
      const { _rev: rev, _id, ...data } = await this.props.db.get(id);

      this.setState({
        loaded: true,
        schema: schemas[id],
        rev,
        data,
      });
    } catch (err) {
      if (err.status !== 404) {
        console.error(err);
      }

      const doc = await this.props.db.put({
        _id: id,
        rows: [],
      });

      this.setState({
        loaded: true,
        schema: schemas[id],
        rev: doc.rev,
        data: {
          rows: [],
        },
      });
    }
  }

  async deleteDocument(id) {
    const rows = this.state.data.rows.filter((r) => r.id !== id);
    const { rev } = await this.props.db.put({
      _id: this.getId(),
      _rev: this.state.rev,
      ...this.state.data,
      rows,
    });

    this.setState({ rev, data: { ...this.state.data, rows } });

    this.props.enqueueSnackbar("Document deleted.", { variant: "error" });
  }

  render() {
    const { loaded, schema, data } = this.state;

    if (!loaded) {
      return <div />;
    }

    const { rows } = data;

    const columns = Object.entries(schema.schema.properties)
      .filter((property) => property.type !== "object" && property !== "array")
      .map(([key, property]) => ({
        key,
        label: property.title,
      }));

    return (
      <>
        <Helmet>
          <title>{schema.title}</title>
        </Helmet>
        <Typography variant="h3" component="h1">
          {schema.title}
        </Typography>
        <Link component={RouterLink} to="/" data-testid="return-to-schema-list">
          Return to Schema List
        </Link>
        <Spacer />
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
                      this.props.history.push(
                        `/document/${schema.id}/${row.id}`
                      )
                    }
                  >
                    {i + 1}
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell
                      key={`${row.id}-${column.key}`}
                      onClick={() =>
                        this.props.history.push(
                          `/document/${schema.id}/${row.id}`
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
                          `/document/${schema.id}/${row.id}`
                        )
                      }
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

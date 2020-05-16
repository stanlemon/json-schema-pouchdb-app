import React from "react";
import { withRouter } from "react-router";
import { Link as RouterLink } from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { Helmet } from "react-helmet";
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
    try {
      const id = this.getId();
      const { schemas } = await this.props.db.get("schemas");
      const { _rev: rev, _id, ...data } = await this.props.db.get(id);

      this.setState({
        loaded: true,
        schema: schemas[id],
        rev,
        data,
      });
    } catch (err) {
      if (err.status !== 404) {
        console.error(status);
        return;
      }

      // Do something for a 404
    }
  }

  render() {
    const { loaded, schema, data } = this.state;

    if (!loaded) {
      return <div />;
    }

    const { rows } = data;

    return (
      <>
        <Helmet>
          <title>{schema.title}</title>
        </Helmet>
        <Typography variant="h3" component="h1">
          {schema.title}
        </Typography>
        <Link component={RouterLink} to="/">
          Return to Schema List
        </Link>
        <Spacer />
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Id</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={row.id}>
                  <TableCell align="right">{i + 1}</TableCell>
                  <TableCell
                    component={RouterLink}
                    to={`/document/${schema.id}/${row.id}`}
                  >
                    {row.id}
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

export default withRouter(DocumentList);

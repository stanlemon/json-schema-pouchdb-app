import React from "react";
import PropTypes from "prop-types";

export default class DocumentTitle extends React.Component {
  componentDidMount() {
    document.title = this.props.title;
  }

  render() {
    return null;
  }
}

DocumentTitle.propTypes = {
  title: PropTypes.string.isRequired,
};

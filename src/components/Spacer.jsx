import React from "react";
import PropTypes from "prop-types";

export default function Spacer({ height = 1 }) {
  const em = 2 * height;
  return <div style={{ minHeight: `${em}em` }} />;
}

Spacer.propTypes = {
  height: PropTypes.number,
};

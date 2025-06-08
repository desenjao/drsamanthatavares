import React from 'react';
import PropTypes from 'prop-types';

const GingivalContour = ({ width = 50, height = 50, gumColor = '#e91e63', toothColor = '#fff' }) => (
  <svg width={width} height={height} viewBox="0 0 50 50">
    <path
      d="M10 30 C 15 20, 35 20, 40 30 L 40 40 L 10 40 Z"
      fill={gumColor}
    /> {/* Forma de gengiva */}
    <path
      d="M20 30 L 20 10 L 30 10 L 30 30 Z"
      fill={toothColor}
    /> {/* Dente */}
  </svg>
);

GingivalContour.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  gumColor: PropTypes.string,
  toothColor: PropTypes.string,
};

export default GingivalContour;
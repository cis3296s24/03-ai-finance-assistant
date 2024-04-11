import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-basic-dist';

const StockPlot = ({ data }) => {
  const plotContainer = useRef(null);

  useEffect(() => {
    if (data) {
      Plotly.react(plotContainer.current, data, {});
    }
  }, [data]);

  return <div ref={plotContainer} style={{ width: "100%", height: "100%" }} />;
};

export default StockPlot;

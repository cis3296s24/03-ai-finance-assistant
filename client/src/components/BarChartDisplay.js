import React, { useEffect, useState } from "react";
import axios from "axios";
import Plot from "react-plotly.js";

function BarChartDisplay() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios.get("/get_transaction_data");
      const plotData = [];
      for (const month of Object.keys(result.data)) {
        // loop through each month's data
        const monthData = result.data[month];
        // selecting the data of the first month.
        for (const item of monthData) {
          // for each piece of data in month
          const existingSeries = plotData.find(
            (serie) => serie.name === item.Category
          );
          // if the data exists then we push it for that month, and add it to the total amount.
          if (existingSeries) {
            existingSeries.x.push(month);
            existingSeries.y.push(item.Amount);
          } else {
            plotData.push({
              x: [month],
              y: [item.Amount],
              type: "bar",
              name: item.Category,
            });
          }
        }
      }
      setData(plotData);
    };
    fetchData();
  }, []);

  return (
    <div className="BarGraph">
      <header className="Bar-header">
        <h1> Transaction Data </h1>
        {data && data.length > 0 ? (
          <Plot
            data={data}
            layout={{
              width: 920,
              height: 540,
              title: "Monthly Spending by Category",
              barmode: "group",
            }}
          />
        ) : null}{" "}
        {}
      </header>
    </div>
  );
}

export default BarChartDisplay;

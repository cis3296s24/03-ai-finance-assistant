import React, { useState } from 'react';
import axios from 'axios';

const Stocks = ({ onForecastData }) => {
  const [selectedStock, setSelectedStock] = useState('AAPL'); // Default stock symbol
  const [years, setYears] = useState(2); // Default number of years

  const handleForecast = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/get_stock', {
        params: {
          stock: selectedStock,
          years: years
        }
      });
      onForecastData(response.data);
    } catch (error) {
      console.error('Error fetching forecast data:', error);
    }
  };

  return (
    <div>
      <label>
        Select stock:
        <select value={selectedStock} onChange={e => setSelectedStock(e.target.value)}>
          <option value="GOOG">GOOG</option>
          <option value="AAPL">AAPL</option>
          <option value="MSFT">MSFT</option>
          <option value="GME">GME</option>
        </select>
      </label>
      <label>
        Select years of prediction:
        <input
          type="number"
          value={years}
          onChange={e => setYears(parseInt(e.target.value))}
          min="1"
          max="4"
        />
      </label>
      <button onClick={handleForecast}>Get Forecast</button>
    </div>
  );
};

export default Stocks;
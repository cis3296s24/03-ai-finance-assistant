import React, { useState } from "react";
import LoginPage from "./loginPage"; // Adjust the path as necessary
import Navbar from "./navbar"; // Ensure the path is correct
import MainContent from "./MainContent";
import FinancialDashboard from "./financialDashboard";
import Stocks from "./Stocks";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/js/bootstrap.bundle.min";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const handleLogin = (loginStatus) => {
    setIsLoggedIn(loginStatus);
  };

  const [forecastData, setForecastData] = useState(null);
  const [error, setError] = useState(null);

  const handleForecastData = (data) => {
    setForecastData(data);
  };

  return (
    <div>
      {isLoggedIn ? (
        <>
          <Navbar />
          <MainContent /> {}
          <FinancialDashboard />
        </>
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
      <div>
        <h1>Stock Forecast</h1>
        <Stocks onForecastData={handleForecastData}/>
        {error && <p>Error: {error}</p>}
        {forecastData && (
          <div>
            {/* Render the forecast data */}
            <pre>{JSON.stringify(forecastData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

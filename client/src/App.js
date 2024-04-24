import React, { useState } from "react";
import LoginPage from "./pages/loginPage.js"; // Adjust the path as necessary
import Navbar from "./components/navbar.js"; // Ensure the path is correct
//import MainContent from './MainContent';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StockPage from "./pages/StockPage.js";
import Home from "./pages/Home.js";
import LandingPage from "./pages/LandingPage.js";
import CurrentFinancialInformation from "./components/CurrentFinancialInformation.js";
import FinancialAdvice from "./components/FinancialAdvice.js";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (loginStatus) => {
    setIsLoggedIn(loginStatus);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <div>
        {isLoggedIn ? (
          <>
            <Navbar onLogout={handleLogout} />
            <Routes>
              <Route path="/stocks" element={<StockPage />} />
              <Route path="/home" element={<Home />} />
              <Route path="/logout" element={<LoginPage />} />
              <Route path="/Current Financial Information" element={<CurrentFinancialInformation />} />
              <Route path="/Financial Advice" element = {<FinancialAdvice/>} />
              {/* Default path goes to home page  */}
              <Route path="/" element={<Home />} />
            </Routes>
          </>
        ) : (
          <>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route
                path="/login"
                element={<LoginPage onLogin={handleLogin} />}
              />
            </Routes>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;

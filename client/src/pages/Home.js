import React, { useState } from "react";
import Navbar from "../components/navbar"; // Ensure the path is correct
//import MainContent from './MainContent';
import FinancialDashboard from "../components/financialDashboard";
import DataFetcher from "../components/PiechartDataFetch";
import IncomeForm from "../components/Income";
import PieChartDisplay from "../components/PiechartDisplay";
import BarChartDisplay from "../components/BarChartDisplay";

function Home() {
  const [transactionData, setTransactionData] = useState({});

  return (
    <div>
      <IncomeForm />
      <FinancialDashboard />
      <DataFetcher onDataFetched={setTransactionData} />
      <PieChartDisplay data={transactionData} />
      <BarChartDisplay />
    </div>
  );
}

export default Home;

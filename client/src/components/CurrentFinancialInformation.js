
import React, { useState } from "react";
import DataFetcher from "../components/PiechartDataFetch";
import PieChartDisplay from "../components/PiechartDisplay";
import BarChartDisplay from "../components/BarChartDisplay";


function CurrentFinancialInformation() {
    const [transactionData, setTransactionData] = useState({});

    return (
        <div>
            <DataFetcher onDataFetched={setTransactionData} />
            <PieChartDisplay data={transactionData} />
            <BarChartDisplay/>
        </div>
    )
}



export default CurrentFinancialInformation

import React, { useState, useEffect } from "react";
import axios from 'axios';
import "./FinancialAdvice.css";


function FinancialAdvice() {
    const [userIncome, setUserIncome] = useState(0);
    const [period, setPeriod] = useState('monthly');
    const [income, setIncome] = useState(0);
    const [transactions, setTransactions] = useState({});
    const [monthlyAdvice, setMonthlyAdvice] = useState([]);
    const [predictions, setPredictions] = useState({});


    useEffect(() => {
        if (income > 0) {
            const fetchTransactions = async () => {
                try {
                    const { data } = await axios.get('/get_transaction_data');
                    setTransactions(data);
                } catch (error) {
                    console.error('Failed to fetch transactions:', error);
                }
            };
            fetchTransactions();
        }
    }, [income]); // Fetch transactions whenever income is set

    useEffect(() => {
        if (income > 0 && Object.keys(transactions).length) {
            calculateBudget(); // Recalculate budget whenever income or transactions change
        }
    }, [income, transactions]);

    useEffect(() => {
        const fetchPrediction = async () => {
            try {
                const { data } = await axios.get('/get_predicted_data');
                console.log(data)
                setPredictions(data);
            } catch (error) {
                console.error('Failed to fetch transactions:', error);
            }
        };
        fetchPrediction();
      }, []);
        

    const handleIncomeSubmit = () => {
        const monthlyIncome = period === 'yearly' ? userIncome / 12 : userIncome;
        setIncome(monthlyIncome);
    };

    const calculateBudget = () => {
        const needsCategories = ['Gasoline', 'Education', 'Services', 'Supermarkets']; // Added Supermarkets as it seems like a need
    const wantsCategories = ['Merchandise', 'Restaurants', 'Travel/Entertainment'];

    const monthlyAdviceArray = [];

    Object.keys(transactions).forEach(month => {
        let totalNeeds = 0;
        let totalWants = 0;

        // Process each transaction in the month
        transactions[month].forEach(transaction => {
            const amount = transaction.Amount;
            const category = transaction.Category;

            // Accumulate totals based on category
            if (needsCategories.includes(category)) {
                totalNeeds += amount;
            } else if (wantsCategories.includes(category)) {
                totalWants += amount;
            } else {
                totalNeeds += amount;
            }
        });

        // Calculate budgets based on the 50/30/20 rule
        const budgetNeeds = income * 0.50;
        const budgetWants = income * 0.30;

        // Generate advice for each category
        const needsAdvice = `For ${month}, totalNeeds = ${totalNeeds}. The user's needs spending was ${totalNeeds <= budgetNeeds ? 'under' : 'over'} budget by $${Math.abs(totalNeeds - budgetNeeds).toFixed(2)}.`;
        const wantsAdvice = `For ${month}, totalWants was = ${totalWants}. The user's wants spending was ${totalWants <= budgetWants ? 'under' : 'over'} budget by $${Math.abs(totalWants - budgetWants).toFixed(2)}.`;
        // Push the monthly advice into the array
        monthlyAdviceArray.push({ month, needsAdvice, wantsAdvice });
    });

    // Update state with the newly calculated advice for all months
        setMonthlyAdvice(monthlyAdviceArray);
    };

    return (
 
        <div class="advicePage">
      <header className="adviceHeader">
        <h1>Financial Advice</h1>
        <p>
          Our Financial Advice is based upon the
          <strong> 50 30 20 philospohy</strong>, which is a budget strategy to
          empower financial growth
        </p>
        <p>
          <strong>50% of your money goes towards NEEDS </strong>, this would
          include Gasoline, Education, Insurance, etc
        </p>
        <p>
          <strong>30% of your money goes towards WANTS </strong>, this would
          include Merchandise, Restaurants, Travel/Entertainment, etc
        </p>

        <p>
          <strong>20% of your income needs to go toward INVESTMENTS</strong>{" "}
          STOCKS, BONDS, ETFS etc.
        </p>
      </header>
      <div className="adviceForm">
        <div className="adviceFormGroup">
          <label htmlFor="incomeEntry">Enter Income:</label>
          <input
            type="number"
            value={userIncome}
            className="incomeInput"
            onChange={(e) => setUserIncome(parseFloat(e.target.value))}
            placeholder="Enter your income"
          />
        </div>
        <div className="adviceFormGroup">
          <label htmlFor="periodSelect">Select period:</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button className="submitIncome" onClick={handleIncomeSubmit}>
            Submit Income
          </button>
        </div>
      </div>
      <div className="financial-summary">
        <h2>Your ideal spending given your ${income} monthly salary should be:</h2>
        <h2>NEEDS: ${income * 0.5}, WANTS: ${income * 0.3}, INVESTMENT: ${income * 0.2}</h2>

        {monthlyAdvice.map((advice, index) => (
            <div className="monthly-advice" key={index}>
            <h4>{advice.month}</h4>
            <p>{advice.needsAdvice}</p>
            <p>{advice.wantsAdvice}</p>
            </div>
        ))}

        <div className="ml-model-output">
            <h2>From our Machine Learning model, we have calculated your expenditure for the next month:</h2>
            <h1>Predicted Transactions</h1>
            <ul>
            {Object.entries(predictions).map(([category, amount]) => (
                <li key={category}>{category}: ${amount.toFixed(2)}</li>
            ))}
            </ul>
            <h1>Head over to our stocks page to find what stocks to invest in</h1>
        </div>
        </div>
    </div>
    );
}

//            <h2> NEEDS: ${income * 0.5}, WANTS: ${income * 0.3} and INVESTMENT = ${income * 0.2}</h2>

export default FinancialAdvice;

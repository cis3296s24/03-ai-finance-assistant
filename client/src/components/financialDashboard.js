import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "./financialDashboard.css";

function FinancialDashboard() {
  const navigate = useNavigate();

  const [documentLines, setDocumentLines] = useState([
    createNewLine("statement"),
  ]);
  // we will keep track of the uploads done by the user.
  const [successfulUploads, setSuccessfulUploads] = useState(0);

  function createNewLine(documentType) {
    return {
      file: null,
      documentType: documentType,
      startDate: "",
      endDate: "",
      amount: "",
      date: "",
    };
  }

  const handleDocumentTypeChange = (index, documentType) => {
    const newLines = [...documentLines];
    newLines[index] = createNewLine(documentType);
    setDocumentLines(newLines);
  };

  const handleFieldChange = (index, field, value) => {
    const newLines = [...documentLines];
    newLines[index][field] = value;
    setDocumentLines(newLines);
  };

  const handleFileChange = (index, file) => {
    if (file.type !== "application/pdf") {
      alert("Please select a PDF file.");
      return;
    }
    handleFieldChange(index, "file", file);
  };

  const handleFileUpload = async (index) => {
    const line = documentLines[index];
    if (line.documentType === "statement" && !line.file) {
      alert("Please select a PDF file first");
      return;
    }

    const formData = new FormData();
    if (line.file) {
      formData.append("file", line.file);
    }
    formData.append("documentType", line.documentType);
    if (line.startDate) formData.append("startDate", line.startDate);
    if (line.endDate) formData.append("endDate", line.endDate);
    if (line.amount) formData.append("amount", line.amount);
    if (line.date) formData.append("date", line.date);

    try {
      const response = await axios.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response.data);
      alert("Data uploaded successfully");
      // icrementing success count
      setSuccessfulUploads((prevCount) => prevCount + 1);
    } catch (error) {
      console.error("Error uploading data: ", error);
      alert("Error uploading data");
    }
  };

  const handleFinalSubmit = async () => {
    try {
      const response = await axios.post("/final-submit", {
        message: "Upload complete",
      });
      console.log(response.data);
      alert("All documents have been successfully submitted.");
      navigate("/Current Financial Information");
    } catch (error) {
      console.error("Error on final submission: ", error);
      alert("Error on final submission");
    }
  };

  const addUploadLine = () => {
    setDocumentLines([...documentLines, createNewLine("statement")]);
  };

  return (
    <div>
      <header>
        <h1>Upload Your Financial Document</h1>
      </header>
      <main>
        {documentLines.map((line, index) => (
          <div key={index} className="form-group">
            <select
              value={line.documentType}
              onChange={(e) => handleDocumentTypeChange(index, e.target.value)}
            >
              <option value="statement">Statement</option>
              <option value="income">Income</option>
              <option value="cashSpending">Cash Spending</option>
            </select>

            {line.documentType === "statement" && (
              <>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(index, e.target.files[0])}
                />
                <div>
                  <input
                    type="date"
                    placeholder="Start Date"
                    value={line.startDate}
                    onChange={(e) =>
                      handleFieldChange(index, "startDate", e.target.value)
                    }
                  />
                  <input
                    type="date"
                    placeholder="End Date"
                    value={line.endDate}
                    onChange={(e) =>
                      handleFieldChange(index, "endDate", e.target.value)
                    }
                  />
                </div>
                <button class="button" onClick={() => handleFileUpload(index)}>
                  Upload Data
                </button>
              </>
            )}

            {(line.documentType === "income" ||
              line.documentType === "cashSpending") && (
              <>
                <input
                  type="number"
                  placeholder="Amount"
                  value={line.amount}
                  onChange={(e) =>
                    handleFieldChange(index, "amount", e.target.value)
                  }
                />
                <input
                  type="date"
                  placeholder="Date"
                  value={line.date}
                  onChange={(e) =>
                    handleFieldChange(index, "date", e.target.value)
                  }
                />
                <button class="button2" onClick={() => handleFileUpload(index)}>
                  Upload Data
                </button>
              </>
            )}
          </div>
        ))}
        <button onClick={addUploadLine}>Add Another Document</button>
        {successfulUploads >= 5 && (
          <button onClick={handleFinalSubmit}>Submit All Documents</button>
        )}
      </main>
      <footer>{/* <p>&copy; 2024 MoneyTree</p> */}</footer>
    </div>
  );
}

export default FinancialDashboard;

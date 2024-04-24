import React, { useState } from 'react';
import axios from 'axios';
import './financialDashboard.css'; // Ensure this points to the actual CSS file location

function FinancialDashboard() {
  const [documentLines, setDocumentLines] = useState([createNewLine('statement')]);

  function createNewLine(documentType) {
    return {
      file: null,
      documentType: documentType,
      startDate: '',
      endDate: '',
      amount: '',
      date: ''
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
    if (file.type !== 'application/pdf') {
      alert("Please select a PDF file.");
      return;
    }
    handleFieldChange(index, 'file', file);
  };

  const handleFileUpload = async (index) => {
    const line = documentLines[index];
    if (line.documentType === 'statement' && !line.file) {
      alert("Please select a PDF file first");
      return;
    }

    const formData = new FormData();
    if (line.file) {
      formData.append('file', line.file);
    }
    formData.append('documentType', line.documentType);
    if (line.startDate) formData.append('startDate', line.startDate);
    if (line.endDate) formData.append('endDate', line.endDate);
    if (line.amount) formData.append('amount', line.amount);
    if (line.date) formData.append('date', line.date);

    try {
      const response = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response.data);
      alert("Data uploaded successfully");
    } catch (error) {
      console.error("Error uploading data: ", error);
      alert("Error uploading data");
    }
  };

  const addUploadLine = () => {
    setDocumentLines([...documentLines, createNewLine('statement')]);
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
            </select>

            {line.documentType === 'statement' && (
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
                    onChange={(e) => handleFieldChange(index, 'startDate', e.target.value)}
                  />
                  <input
                    type="date"
                    placeholder="End Date"
                    value={line.endDate}
                    onChange={(e) => handleFieldChange(index, 'endDate', e.target.value)}
                  />
                </div>
                <button class="button" onClick={() => handleFileUpload(index)}>Upload Data</button>
              </>
            )}

          </div>
        ))}
        <button class="button" onClick={addUploadLine}>Add Another Document</button>
      </main>
      <footer>
        <p>&copy; 2024 Your Company Name</p>
      </footer>
    </div>
  );
}

export default FinancialDashboard;

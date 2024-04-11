import React, { useState } from 'react';

// The Axios library, a promise-based HTTP client used to make requests to external
//resources, in this case, your backedn, server.
import axios from 'axios';

function FinancialDashboard() {
  const [name, setName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null)
  // initialize name with empty string. setName will be used to update

  const handleSubmit = async (event) => {
    // an asynchronus function named handleSubmit that wull be called when the form is submitted.
    // It will await the response from an HTTP request made using Axios.
    event.preventDefault();
    try {
      const response = await axios.post('/message', { name });
      // Makes a post request to the '/message' endpoint, sending an object with a 
      // name property. It waits for the request to complete and stores the response in the 
      // "response" variable. This is where the form data is sent to the server. 
      console.log(response.data); // Log the response from the server
      alert('Name submitted successfully');
    } catch (error) {
      console.error('There was an error submitting the form:', error);
      alert('Error submitting name');
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0])
  } 

  const handleFileUpload = async () => {
    if (!selectedFile) {
        alert("Please select a file first");
        return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile)

    try {
        const r = await axios.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log(r.data)
        alert("File uploaded successfully");
    } catch (error) {
        console.error("Error uploading file: ", error)
        alert("Error uploading file")
    }
};



  return (
    <div>
        <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name:</label>
        <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">Submit</button>
        </form>
        <div>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleFileUpload}>Upload File</button>
      </div>
    </div>

  );
};

export default FinancialDashboard;

import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import SignUpForm from './SignUpForm';

const LoginPage = ({ onLogin }) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    //const [contact, setContact] = useState("")

    // NEW**
    const [showSignUp, setShowSignUp] = useState(false);

    const navigate = useNavigate();


    const handleSubmit = async (e) => {
      e.preventDefault();
      const isAuthenticated = true; // need to verify from the databse
      if(isAuthenticated) {
        onLogin(true); // Inform App component about successful login



        // updateContact function is responsible for sending the user's email and password to the backend for authentication. 
        // It's used when a user submits their login credentials. (user authentication)
        // const updateContact = {
        //   email: email,
        //   password: password
        // }
        // const response = await axios.post('/contacts', { contact: updateContact });
        // console.log(response)
        navigate("/home"); // Navigate to home after successful login

        //localStorage.setItem('userInfo', credentialsJson);

      } else {
        alert('Login Failed');
      }
    };
  
    // NEW******
    const handleNewButtonClick = () => {
      setShowSignUp(true);
    };

    const handleSignUpClose = () => {
      setShowSignUp(false);
    };


    // Inline styles
    const formStyle = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh', 
    };
  
    const inputStyle = {
      marginBottom: '10px', 
      padding: '10px', 
      border: '2px solid black', 
      borderRadius: '5px',
      width: '20%', 
      minWidth: '250px', 
    };
  
    const welcomeTextStyle = {
      margin: '0px', 
      fontSize: '32px', 
      fontWeight: 'bold',
      textAlign: "center",
    };
  
    return (
      <main>
        <div style={welcomeTextStyle}>Welcome to the AI Financial Assistant</div>
        <form onSubmit={handleSubmit} style={formStyle}>
          <input
            type="text"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password" 
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                    <button type="submit" style={{ padding: '10px', 
                                                  border: '2px solid black', 
                                                  borderRadius: '5px', 
                                                  cursor: 'pointer', 
                                                  marginRight: '10px' }}>Login</button>
                    <button type="button" onClick={handleNewButtonClick} style={{ padding: '10px', 
                                                                                  border: '2px solid black', 
                                                                                  borderRadius: '5px', 
                                                                                  cursor: 'pointer' }}>Sign Up</button>
                </div>
        </form>
        {showSignUp && <SignUpForm onClose={handleSignUpClose} />}
      </main>
    );

};

// need a fetch in this file

export default LoginPage;

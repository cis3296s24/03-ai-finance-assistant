import React from 'react';

function Navbar() {
  // Inline style for the links
  const linkStyle = {
    color: 'white', // Text color white
    marginRight: '20px', // Space to the right of each link
    fontSize: '24px', // Increases font size
    textDecoration: 'none', // Removes underline from links
    padding: '10px', // Adds padding to make each link bigger
  };

  return (
    <>
      <style>
        {`
          .navbar a:hover {
            color: blue !important; /* Ensures this rule has higher specificity, changes text to blue on hover */
          }
        `}
      </style>
      <div className="navbar" style={{ padding: '50px 0', backgroundColor: 'black', textAlign: 'center' }}>
        <a href="#home" style={linkStyle}>Home</a>
        {/* <a href="#news" style={linkStyle}>News</a> */}
        {/* <a href="#contact" style={linkStyle}>Contact</a> */}
        {/* <a href="#about" style={linkStyle}>About</a> */}
        <a href="#logout" style={linkStyle}>Logout</a>
      </div>
    </>
  );
};

export default Navbar;
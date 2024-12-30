import React, { useState } from 'react';

const FetchEmailsButton = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginClick = () => {
    setIsFormVisible(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/fetch-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(`Fetched ${data.unreadCount} unread emails.`);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonStyles = {
    backgroundColor: '#0078d4',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s ease',
  };

  const hoverStyles = {
    backgroundColor: '#005ea6',
  };

  const activeStyles = {
    backgroundColor: '#004e8c',
  };

  const formContainerStyles = {
    display: 'flex',
    justifyContent: 'center',
    // alignItems: 'center',
    // minHeight: '100vh', // Center vertically
    backgroundColor: 'white', // Set background color to white
    margin: 0, // Remove any margin
  };

  const formStyles = {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
    width: '300px', // Set a fixed width for the form
    textAlign: 'center',
  };

  const inputStyles = {
    padding: '10px',
    margin: '10px 0',
    width: '100%',
    borderRadius: '5px',
    border: '1px solid #ddd',
    boxSizing: 'border-box',
  };

  const submitButtonStyles = {
    ...buttonStyles,
    width: '100%',
  };

  return (
    <div>
      <h1 style={{ padding: "20px", fontFamily: "Arial" }}>Azure API with React and Node.js</h1>
      <div style={formContainerStyles}>
      {!isFormVisible ? (
        <button
          style={buttonStyles}
          onMouseOver={(e) => (e.target.style.backgroundColor = hoverStyles.backgroundColor)}
          onMouseOut={(e) => (e.target.style.backgroundColor = buttonStyles.backgroundColor)}
          onMouseDown={(e) => (e.target.style.backgroundColor = activeStyles.backgroundColor)}
          onMouseUp={(e) => (e.target.style.backgroundColor = hoverStyles.backgroundColor)}
          onClick={handleLoginClick}
        >
          Login with Azure
        </button>
      ) : (
        <form style={formStyles} onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your Outlook email"
              required
              style={inputStyles}
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={inputStyles}
            />
          </div>
          <button
            type="submit"
            style={submitButtonStyles}
            onMouseOver={(e) => (e.target.style.backgroundColor = hoverStyles.backgroundColor)}
            onMouseOut={(e) => (e.target.style.backgroundColor = buttonStyles.backgroundColor)}
            onMouseDown={(e) => (e.target.style.backgroundColor = activeStyles.backgroundColor)}
            onMouseUp={(e) => (e.target.style.backgroundColor = hoverStyles.backgroundColor)}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Loading...' : 'Submit'}
          </button>
        </form>
      )}
    </div>
    </div>
  );
};

export default FetchEmailsButton;

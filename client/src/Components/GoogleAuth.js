import React, { useState, useEffect } from "react";

const CLIENT_ID = process.env.REACT_APP_GMAIL_CLIENT_ID;
const SCOPES = "https://www.googleapis.com/auth/gmail.readonly";

const GoogleAuth = () => {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

  // Function to fetch latest email from the backend
  const fetchLatestEmail = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/gmail/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: token,  // Send the access token in the body with the correct key
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch latest email');
      }

      const data = await response.json();
      console.log('Latest email data:', data);
      setMessages(data.messages); // Update state with the fetched email
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Handle Google login
  const handleLoginClick = () => {
    if (window.google) {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        access_type: 'offline', // Request offline access
        prompt: 'consent', // Force consent every time
        callback: (response) => {
          if (response.error) {
            console.error("OAuth Error:", response.error);
            setStatus("Login failed!");
            return;
          }

          // Set access token
          setAccessToken(response.access_token);
          setStatus("Login successful!");

          // Fetch the latest email after successful login
          fetchLatestEmail(response.access_token);
        },
      });

      // Request the access token
      client.requestAccessToken();
    }
  };

  // Handle logout
  const handleLogoutClick = () => {
    setAccessToken(null);
    setMessages([]);
    setStatus("Logged out successfully!");
  };

  useEffect(() => {
    if (accessToken) {
      console.log("Access Token:", accessToken);
    }
  }, [accessToken]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Gmail API with React and Node.js</h1>

      {accessToken ? (
        <div>
          <button onClick={handleLogoutClick} style={buttonStyle}>Logout</button>
          <div style={{ marginTop: "20px" }}>
            <h3>Latest Email:</h3>
            {messages.length > 0 ? (
              <div>
                <p><strong>Subject:</strong> {messages[0].subject}</p>
                <p><strong>From:</strong> {messages[0].senderEmail}</p>
                <p><strong>Content:</strong> {messages[0].content}</p>
              </div>
            ) : (
              <p>No email available</p>
            )}
          </div>
        </div>
      ) : (
        <div>
          <button onClick={handleLoginClick} style={buttonStyle}>Login with Google</button>
          <p>Don't have an account? <button onClick={() => setIsSignup(true)}>Sign Up</button></p>
        </div>
      )}

      <div style={{ marginTop: "20px", fontWeight: "bold" }}>
        Status: {status}
      </div>

      {/* Debugging output */}
      <div style={{ marginTop: "20px" }}>
        <p><strong>Access Token:</strong> {accessToken}</p>
      </div>
    </div>
  );
};

const buttonStyle = {
  padding: "10px 20px",
  backgroundColor: "#4CAF50",
  color: "white",
  border: "none",
  cursor: "pointer",
  fontSize: "16px",
};

export default GoogleAuth;

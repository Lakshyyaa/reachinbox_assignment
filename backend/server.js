const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { google } = require("googleapis");
const nodemailer = require("nodemailer");
const OpenAI = require("openai");
const axios = require('axios');
const { Client } = require('@microsoft/microsoft-graph-client');
const bodyParser = require('body-parser');
const imap = require('imap-simple'); 
const Imap = require('imap');
const { simpleParser } = require('mailparser');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json()); 
app.use(bodyParser.json());

const apikey =process.env.OPENAI_KEY;   
const openai = new OpenAI({ apiKey: apikey });

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Hello From Server.");
});

app.post("/gmail/messages", async (req, res) => {
  const { accessToken } = req.body;  // Changed accessToken to match the request body key

  if (!accessToken) {
    return res.status(400).json({ error: "Access token is required." });
  }

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: "v1", auth });

    // Get the list of message IDs
    const listResponse = await gmail.users.messages.list({
      userId: "me",
      maxResults: 1,
      q: "is:unread",
    });

    if (!listResponse.data.messages) {
      return res.status(200).json({ messages: [] });
    }

    // Fetch message content for each message ID
    const messagePromises = listResponse.data.messages.map(async (message) => {
      try {
        const messageResponse = await gmail.users.messages.get({
          userId: "me",
          id: message.id,
        });

        const profileResponse = await gmail.users.getProfile({
          userId: "me", // "me" refers to the authenticated user
        });
    
        // Extract and return the email address
        const userEmail = profileResponse.data.emailAddress;

        const payload = messageResponse.data.payload;
        const headers = payload.headers;

        // Extract subject from headers
        const subject = headers.find((header) => header.name === "Subject")?.value || "No subject available";
        const fromHeader = headers.find((header) => header.name === "From")?.value || "No sender email available";
        const senderEmail = fromHeader.replace(/^.*<(.+)>$/, '$1');

        // Decode message content
        const parts = payload?.parts;
        let decodedMessage = "No content available.";
        //decodedMessage
        if (parts) {
          const textPart = parts.find((part) => part.mimeType === "text/plain");
          if (textPart && textPart.body && textPart.body.data) {
            decodedMessage = Buffer.from(textPart.body.data, "base64").toString("utf-8");
          }
        }

        // Send a reply email
        const sub = "Re : "+subject;
        const ans = await runPrompt(decodedMessage);
        sendEmail(userEmail, senderEmail,sub,ans);

        return {
          id: message.id,
          subject: subject,
          senderEmail: senderEmail,
          userEmail: userEmail,
          content: decodedMessage,
        };
      } catch (error) {
        console.error("Error processing message:", message.id, error);
        return { id: message.id, error: "Failed to process message." };
      }
    });

    const messages = await Promise.all(messagePromises);
    res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching Gmail messages:", error);
    res.status(500).json({
      error: "Failed to fetch Gmail messages",
      details: error.message,
    });
  }
});

const runPrompt = async (text) => {
  const prompt1 = `Classify this as Interested, Not Interested, or More information: ${text}, ans should be the label only.`;
  const prompt2 = `Form Reply for this: ${text}, in under 50 words.`;

  try {
    // First API call for classification (label)
    const labelResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt1 },
      ],
    });

    const label = labelResponse.choices[0].message.content.trim();  // Get the label from the response

    // Second API call for reply generation
    const replyResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt2 },
      ],
    });

    const reply = replyResponse.choices[0].message.content.trim();  // Get the reply from the response

    // Format the final response
    const result = `
      Label Assigned: ${label}
      Automated Reply: ${reply}
    `;

    // Log and return the result
    console.log(result);
    return result; // The final result will be returned
  } catch (error) {
    console.error("Error calling OpenAI API:", error.response?.data || error.message);
    throw new Error("An error occurred while processing the request");
  }
};

async function sendEmail(userEmail, senderEmail, sub, ans) {
  // Create a transporter using SMTP
  const transporter = nodemailer.createTransport({
    service: "gmail", // Using Gmail's SMTP server
    auth: {
      user: "lakshyasinghrox@gmail.com", // Your email address
      pass: process.env.nodemailer_pass, // Your app-specific password (use an env variable)
    },
  });

  // Define the email options
  const mailOptions = {
    from: `${userEmail}`, // Sender address
    to: `${senderEmail}`, // Recipient's email address
    subject: sub, // Subject line
    text: ans, // Plain text body
  };

  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: " + info.response);
  } catch (error) {
    console.error("Error sending email: " + error);
  }
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.post('/fetch-emails', async (req, res) => {
  const { email, password } = req.body;
  console.log('Email:', email);

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // IMAP configuration
  const imapConfig = {
    user: email,
    password: password,
    host: 'outlook.office365.com',
    port: 993,
    tls: true,
  };

  const imapConnection = new Imap(imapConfig);

  try {
    console.log('Connecting to IMAP...');
    imapConnection.connect();

    imapConnection.once('ready', () => {
      console.log('IMAP connection established');

      imapConnection.openBox('INBOX', false, (err, box) => {
        if (err) {
          console.error('Error opening inbox:', err);
          return res.status(500).json({ message: 'Error opening inbox' });
        }

        const fetch = imapConnection.fetch('1:*', { bodies: ['HEADER.FIELDS (FROM SUBJECT DATE)', 'TEXT'] });
        let emails = [];

        fetch.on('message', (msg) => {
          msg.on('body', (stream) => {
            simpleParser(stream, (err, parsed) => {
              if (err) {
                console.log('Error parsing email:', err);
                return;
              }

              emails.push({
                subject: parsed.subject,
                from: parsed.from.text,
                date: parsed.date,
                text: parsed.text,
              });
            });
          });
        });

        fetch.once('end', () => {
          imapConnection.end();
          res.json({ emails });
        });
      });
    });

    imapConnection.once('error', (err) => {
      console.error('IMAP connection error:', err);
      res.status(500).json({ message: 'IMAP connection error' });
    });

    imapConnection.once('end', () => {
      console.log('IMAP connection ended');
    });
  } catch (err) {
    console.error('Error during IMAP connection:', err);
    res.status(500).json({ message: 'IMAP connection error' });
  }
});
# ReachInBox assignment: Mail Automation with ChatGPT

A simple MERN application that accesses user Gmail/Outlook using the APIs, automates email labeling, and sends automated replies using the ChatGPT API.

---

## Features

- Access Gmail using Google Cloud Console's Gmail API.
- Azure account to enable APIS and microsoft-graph
- Automate email labeling and replies.
- Powered by ChatGPT API.

---

## Prerequisites
**OpenAI Account:** Create an account on [OpenAI](https://platform.openai.com/signup/) and get an API key.  

---

## Setup

### Clone the Repository
git clone <repository-url>
cd <repository-folder>

## Run backend
cd backend
npm install
node server.js

## Run frontend
cd client
npm install
npm start

## Create .env in frontend
replace the following
REACT_APP_GMAIL_CLIENT_ID=

## Create .env in backend
replace the following
OPENAI_KEY=
nodemailer_pass=


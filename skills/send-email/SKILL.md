---
name: send-email
description: Sends an email to a specified recipient using Nodemailer.
---

# Send Email Skill

This skill allows the bot to send emails.

## Configuration
Requires `nodemailer` package.
Environment variables for SMTP must be set in `.env` or passed via inputs (less secure).

## Usage
```javascript
const sendEmail = require('./index.js');
await sendEmail({
    to: 'recipient@example.com',
    subject: 'Hello',
    text: 'This is a test email.'
});
```

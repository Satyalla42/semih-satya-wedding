const { google } = require('googleapis');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Google Sheets configuration
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'Sheet1'; // Change if your sheet has a different name

// Email configuration
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;

// Track the last processed row
let lastProcessedRow = 0;

// Initialize Google Sheets API
async function getGoogleSheetsClient() {
  let auth;
  
  // Check if using P12 key or JSON key
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY && process.env.GOOGLE_SERVICE_ACCOUNT_KEY.endsWith('.p12')) {
    // P12 format
    auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
  } else {
    // JSON format (default)
    auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY || 'service-account-key.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
  }

  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient });
  return sheets;
}

// Initialize Gmail transporter
function getGmailTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_PASS,
    },
  });
}

// Send email function
async function sendEmail(to, subject, message) {
  const transporter = getGmailTransporter();
  
  const mailOptions = {
    from: `"Satya & Semih" <${GMAIL_USER}>`,
    to: to,
    subject: subject,
    html: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    return false;
  }
}

// Check for new rows and process them
async function checkForNewRows() {
  try {
    const sheets = await getGoogleSheetsClient();
    
    // Get all data from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:Z`, // Adjust range as needed
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      console.log('No data rows found');
      return;
    }

    // Skip header row and process only new rows
    const newRows = rows.slice(Math.max(lastProcessedRow, 1));
    
    for (let i = 0; i < newRows.length; i++) {
      const rowIndex = lastProcessedRow + i + 1;
      const row = newRows[i];
      
      // Map row data (adjust indices based on your sheet structure)
      const name = row[0] || '';
      const email = row[1] || '';
      const zusage = row[2] || '';
      const guests = row[3] || '';
      const comment = row[4] || '';
      
      if (!email) {
        console.log(`Row ${rowIndex}: No email found, skipping`);
        continue;
      }

      console.log(`Processing row ${rowIndex}: ${name} (${email}) - ${zusage}`);

      // Check if "Zusage zu welcher Hochzeit?" equals "neither"
      if (zusage.toLowerCase() === 'neither') {
        // Send "That's a pity" email
        await sendEmail(
          email,
          'Das ist schade! ',
          '<p>Das ist schade, dass du nicht kommen kannst.</p><p>Wir werden dich dort sehr vermissen!</p><p>🫶🏼</p>'
        );
      } else {
        // Send "Thank you for coming" email
        await sendEmail(
          email,
          'Vielen Dank für deine Zusage zu unserer Hochzeit 💍 ',
          '<p>Vielen lieben Dank für deine Antwort ☺️!</p> <p>Wir freuen uns riesig, dass du an unserem Hochzeitstag dabei sein wirst. Es bedeutet uns echt viel, diesen besonderen Tag nicht nur als Paar 👩🏻‍❤️‍💋‍👨🏽 zu erleben, sondern mit den Menschen zu feiern, die uns wichtig sind.</p> <p>Wir können es kaum erwarten, gemeinsam anzustoßen, zu tanzen und einfach eine richtig großartige Zeit miteinander zu haben. </p><p>Schön, dass du ein Teil davon sein wirst!💍👰🏻‍♀️🤵🏽🌷</p>'
        );
      }
    }

    // Update last processed row
    lastProcessedRow = rows.length - 1;
    console.log(`Processed up to row ${lastProcessedRow}`);

  } catch (error) {
    console.error('Error checking for new rows:', error);
  }
}

// Run the check every minute
function startPolling() {
  console.log('Starting workflow polling...');
  console.log(`Monitoring sheet: ${SPREADSHEET_ID}`);
  
  // Initial check
  checkForNewRows();
  
  // Check every minute
  setInterval(checkForNewRows, 60000); // 60000ms = 1 minute
}

// Start the workflow
if (require.main === module) {
  startPolling();
}

module.exports = { checkForNewRows, sendEmail };


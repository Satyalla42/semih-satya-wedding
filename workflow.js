const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
require('dotenv').config();

const LAST_PROCESSED_ROW_FILE = path.join(__dirname, '.last-processed-row');
const PROCESSED_EMAILS_FILE = path.join(__dirname, '.processed-emails.json');

// Google Sheets configuration
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'Sheet1'; // Change if your sheet has a different name

// Email configuration
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;

// Load last processed row from file (persists between runs)
function loadLastProcessedRow() {
  try {
    if (fs.existsSync(LAST_PROCESSED_ROW_FILE)) {
      const content = fs.readFileSync(LAST_PROCESSED_ROW_FILE, 'utf8').trim();
      const row = parseInt(content, 10);
      return isNaN(row) ? 0 : row;
    }
  } catch (error) {
    console.error('Error loading last processed row:', error);
  }
  return 0;
}

// Save last processed row to file
function saveLastProcessedRow(row) {
  try {
    fs.writeFileSync(LAST_PROCESSED_ROW_FILE, row.toString(), 'utf8');
  } catch (error) {
    console.error('Error saving last processed row:', error);
  }
}

// Load saved row count from file
function loadRowCount() {
  try {
    if (fs.existsSync(ROW_COUNT_FILE)) {
      const content = fs.readFileSync(ROW_COUNT_FILE, 'utf8').trim();
      const count = parseInt(content, 10);
      return isNaN(count) ? null : count;
    }
  } catch (error) {
    console.error('Error loading row count:', error);
  }
  return null;
}

// Save row count to file
function saveRowCount(count) {
  try {
    fs.writeFileSync(ROW_COUNT_FILE, count.toString(), 'utf8');
  } catch (error) {
    console.error('Error saving row count:', error);
  }
}

// Load processed emails from file
function loadProcessedEmails() {
  try {
    if (fs.existsSync(PROCESSED_EMAILS_FILE)) {
      const content = fs.readFileSync(PROCESSED_EMAILS_FILE, 'utf8').trim();
      if (content) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          return new Set(parsed);
        }
      }
    }
  } catch (error) {
    console.error('Error loading processed emails:', error);
  }
  return new Set();
}

// Save processed emails to file
function saveProcessedEmails(emailSet) {
  try {
    const arr = Array.from(emailSet);
    fs.writeFileSync(PROCESSED_EMAILS_FILE, JSON.stringify(arr, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving processed emails:', error);
  }
}

// Track the last processed row (loaded from file)
let lastProcessedRow = loadLastProcessedRow();

// Track emails that have already received emails (to prevent duplicates)
const processedEmails = new Set();
const persistentProcessedEmails = loadProcessedEmails();

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
  
  // Path to the image file
  const imagePath = path.join(__dirname, 'just_married2.png');
  
  // Check if image file exists
  let attachments = [];
  if (fs.existsSync(imagePath)) {
    attachments = [
      {
        filename: 'just_married2.png',
        path: imagePath,
        cid: 'just_married_image' // Content-ID for inline image
      }
    ];
    console.log(`Image file found at ${imagePath}`);
  } else {
    console.warn(`Image file not found at ${imagePath}, sending email without image`);
  }
  
  const mailOptions = {
    from: `"Satya & Semih" <${GMAIL_USER}>`,
    to: to,
    subject: subject,
    html: message,
    attachments: attachments
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    console.error(`Error details:`, error.message);
    if (error.response) {
      console.error(`SMTP response:`, error.response);
    }
    return false;
  }
}

// Check for new rows and process them
async function checkForNewRows() {
  try {
    const sheets = await getGoogleSheetsClient();
    
    // Get all data from the sheet
    // Try without sheet name first, or use the actual sheet name
    let response;
    try {
      // Try with sheet name
      response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:Z`,
      });
    } catch (error) {
      // If that fails, try without sheet name (uses first sheet)
      try {
        response = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: 'A:Z',
        });
      } catch (err2) {
        // Try getting sheet names first
        const sheetInfo = await sheets.spreadsheets.get({
          spreadsheetId: SPREADSHEET_ID,
        });
        const firstSheetName = sheetInfo.data.sheets[0].properties.title;
        response = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: `${firstSheetName}!A:Z`,
        });
      }
    }

    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      console.log('No data rows found');
      return;
    }

    // Get current total row count (including header)
    const currentRowCount = rows.length;
    
    console.log(`Current row count: ${currentRowCount}, Last processed row: ${lastProcessedRow}`);
    console.log(`Processed emails count: ${persistentProcessedEmails.size}`);

    // Only process new rows (rows after lastProcessedRow)
    if (rows.length <= lastProcessedRow + 1) {
      console.log('No new rows to process');
      return;
    }

    // Skip header row and process only new rows
    const newRows = rows.slice(Math.max(lastProcessedRow + 1, 1));
    
    console.log(`Found ${newRows.length} new row(s) to process (starting from row ${lastProcessedRow + 2})`);
    
    let processedAnyNew = false;
    
    for (let i = 0; i < newRows.length; i++) {
      const rowIndex = lastProcessedRow + i + 2; // +2 because: lastProcessedRow is 0-indexed, +1 for header, +1 for next row
      const row = newRows[i];
      
      // Map row data (adjust indices based on your sheet structure)
      const name = row[0] || '';
      const email = row[1] || '';
      const zusage = row[2] || '';
      const guests = row[3] || '';
      const comment = row[4] || '';
      
      if (!email) {
        console.log(`Row ${rowIndex}: No email found, skipping`);
        // Still update lastProcessedRow even if no email
        lastProcessedRow = rowIndex - 1;
        saveLastProcessedRow(lastProcessedRow);
        continue;
      }

      // Normalize email to lowercase for comparison
      const emailLower = email.toLowerCase().trim();
      
      // ALWAYS check if we've already sent an email to this address (primary duplicate prevention)
      if (persistentProcessedEmails.has(emailLower) || processedEmails.has(emailLower)) {
        console.log(`Row ${rowIndex}: Email ${emailLower} already processed before, skipping to prevent duplicate`);
        // Still update lastProcessedRow to skip this row in future runs
        lastProcessedRow = rowIndex - 1;
        saveLastProcessedRow(lastProcessedRow);
        continue;
      }

      console.log(`Processing row ${rowIndex}: ${name} (${email}) - ${zusage}`);

      // Check if "Zusage zu welcher Hochzeit?" equals "neither"
      let emailSent = false;
      if (zusage.toLowerCase() === 'neither') {
        // Send "That's a pity" email
        emailSent = await sendEmail(
          email,
          'Das ist schade! ',
          '<p>Das ist schade, dass du nicht kommen kannst.</p><p>Wir werden dich dort sehr vermissen!</p><p>🫶🏼</p><br><img src="cid:just_married_image" alt="Just Married" style="max-width: 100%; height: auto; margin: 20px 0;">'
        );
      } else {
        // Send "Thank you for coming" email
        emailSent = await sendEmail(
          email,
          'Vielen Dank für deine Zusage zu unserer Hochzeit 💍 ',
          '<p>Vielen lieben Dank für deine Antwort ☺️!</p> <p>Wir freuen uns riesig, dass du an unserem Hochzeitstag dabei sein wirst. Es bedeutet uns echt viel, diesen besonderen Tag nicht nur als Paar 👩🏻‍❤️‍💋‍👨🏽 zu erleben, sondern mit den Menschen zu feiern, die uns wichtig sind.</p> <p>Wir können es kaum erwarten, gemeinsam anzustoßen, zu tanzen und einfach eine richtig großartige Zeit miteinander zu haben. </p><p>Schön, dass du ein Teil davon sein wirst!💍👰🏻‍♀️🤵🏽🌷</p><br><img src="cid:just_married_image" alt="Just Married" style="max-width: 100%; height: auto; margin: 20px 0;">'
        );
      }

      // Mark email as processed only if email was sent successfully
      if (emailSent) {
        processedEmails.add(emailLower);
        persistentProcessedEmails.add(emailLower);
        saveProcessedEmails(persistentProcessedEmails);
        console.log(`Marked ${emailLower} as processed`);
        processedAnyNew = true;
      }
      
      // Update last processed row after processing this row (whether email was sent or not)
      lastProcessedRow = rowIndex - 1;
      saveLastProcessedRow(lastProcessedRow);
    }

    if (processedAnyNew) {
      console.log(`Finished processing. Last processed row: ${lastProcessedRow}`);
      console.log(`Total processed emails: ${persistentProcessedEmails.size}`);
    } else {
      console.log(`No new emails sent. Last processed row: ${lastProcessedRow}`);
    }

  } catch (error) {
    console.error('Error checking for new rows:', error);
  }
}

// Run the check every minute (for local development)
function startPolling() {
  console.log('Starting workflow polling...');
  console.log(`Monitoring sheet: ${SPREADSHEET_ID}`);
  
  // Initial check
  checkForNewRows();
  
  // Check every minute
  setInterval(checkForNewRows, 60000); // 60000ms = 1 minute
}

// Run once (for GitHub Actions)
async function runOnce() {
  console.log('=== Starting RSVP Email Workflow ===');
  console.log(`Gmail User: ${GMAIL_USER ? 'Set' : 'NOT SET'}`);
  console.log(`Gmail Pass: ${GMAIL_PASS ? 'Set' : 'NOT SET'}`);
  console.log(`Spreadsheet ID: ${SPREADSHEET_ID ? 'Set' : 'NOT SET'}`);
  console.log(`Last processed row: ${lastProcessedRow}`);
  console.log(`Monitoring sheet: ${SPREADSHEET_ID}`);
  
  try {
    await checkForNewRows();
    console.log('=== Check complete ===');
    process.exit(0);
  } catch (error) {
    console.error('=== Workflow failed ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Start the workflow
if (require.main === module) {
  // Check if running in GitHub Actions (CI environment)
  if (process.env.CI || process.env.GITHUB_ACTIONS) {
    runOnce();
  } else {
    // Local development - run continuously
    startPolling();
  }
}

module.exports = { checkForNewRows, sendEmail };


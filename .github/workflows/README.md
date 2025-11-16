# GitHub Actions Setup

This workflow automatically checks for new RSVP submissions and sends emails.

## Setup Instructions

### 1. Add Secrets to GitHub

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

1. **GOOGLE_SHEET_ID**
   - Value: Your Google Sheet ID (from the URL)
   - Example: `1yS3U3m6A-NDCnAxYKfWp9LbLIMypP4f4lneSWmL0Sl8`

2. **GOOGLE_SERVICE_ACCOUNT_KEY**
   - Value: The entire contents of your `xxx-735d9813c721.json` file
   - Copy and paste the entire JSON content

3. **GMAIL_USER**
   - Value: Your Gmail address
   - Example: `x@gmail.com`

4. **GMAIL_PASS**
   - Value: Your Gmail App Password (16 characters, no spaces)
   - Generate at: https://myaccount.google.com/apppasswords

### 2. Workflow Schedule

The workflow runs every 2 minutes automatically. You can also trigger it manually:
- Go to Actions tab → RSVP Email Workflow → Run workflow

### 3. How It Works

1. GitHub Actions runs the workflow every 2 minutes
2. It checks your Google Sheet for new rows
3. If new RSVPs are found, it sends the appropriate email
4. It tracks which rows have been processed to avoid duplicates

### 4. Monitoring

- Check the Actions tab to see workflow runs
- View logs to see if emails were sent
- The workflow will show errors if something goes wrong


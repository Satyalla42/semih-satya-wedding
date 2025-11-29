# 💍 Semih & Satya – Wedding Website

A simple and elegant wedding website built to share our story, event details, and allow guests to RSVP online.

## 🌸 Overview

This repository contains the source code for our wedding website, including:

- A main invitation page  
- Image gallery  
- Event schedule & location information  
- An online RSVP system connected via **Google Apps Script**  
- Static assets such as images and video

The site is lightweight and fully static, making it easy to deploy anywhere.

---

## 📝 RSVP Integration (Google Apps Script)

Our RSVP form is powered by **Google Apps Script**, which connects directly to a Google Sheet.

### ✔ How it works


1. A custom HTML form on the website collects guest information.  
2. The data is sent to a Google Apps Script web endpoint.  
3. The Apps Script writes the submission directly into a Google Sheet.  
4. We can manage and review all guest responses inside Google Sheets.

### ✔ Why Google Apps Script?

- No backend server needed  
- Free hosting of the serverless script  
- Automatic storage in Google Sheets  
- Easy to edit, expand, and monitor  
- Secure and reliable  
- Great for handling RSVPs, guest counts, and dietary preferences  

If you want to update the script or endpoint:

- Open **Google Apps Script**  
- Update your `doPost` function or spreadsheet ID  
- Update the endpoint URL inside `index.html` or your form JavaScript

---

## 📁 Project Structure

- `index.html` – Main landing page  
- `Gallery_img*.jpg` – Gallery images  
- `*.jpg` / `*.png` – Decorative images, backgrounds  
- `proposal.mov` – Engagement/proposal video  
- `package.json` – Optional build/tooling configuration  
- Other static assets used by the site  

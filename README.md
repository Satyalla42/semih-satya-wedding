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

For the optional **Google Sheet → email** worker (GitHub Actions / `npm start`), see [`docs/README-workflow.md`](docs/README-workflow.md).

---

## 📁 Project structure

| Path | Purpose |
|------|---------|
| `index.html` | Main site (GitHub Pages entry; keep at repo root with `CNAME`) |
| `assets/images/backgrounds/` | UI backgrounds (e.g. navbar) |
| `assets/images/hero/` | Hero / invitation art |
| `assets/images/gallery/` | Gallery photos |
| `assets/images/witnesses/` | Witness photos |
| `assets/images/archive/` | Extra design assets not wired into the page |
| `assets/media/` | Video (e.g. proposal clip) |
| `automation/workflow.js` | RSVP sheet → email worker (used by GitHub Actions & `npm start`) |
| `tools/` | Helper scripts (PDF invite, setup notes) |
| `docs/` | Workflow / integration documentation |
| `package.json` | Node deps for the RSVP automation |

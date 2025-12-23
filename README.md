# Student AI Hub Skeleton (Linkfarm Worksheet)

This project rebuilds the provided AI Hub Linkfarm PDF as a static, interactive worksheet. Contributors can browse the guidance, add multiple links across sections, and submit everything to a Google Sheet via a Google Apps Script endpoint.

## Project structure

- `index.html` — Page markup and section content (mirrors the PDF structure).
- `styles.css` — Layout and worksheet styling; responsive with sticky navigation and identity panel.
- `app.js` — Vanilla JavaScript for row creation, validation, local storage for Name/Email, and Google Apps Script submissions.

## Configure the Apps Script URL

1. Deploy a Google Apps Script as a **web app** that accepts `POST` requests (simple `doPost(e)` handler is enough).
2. Copy the deployed **web app URL**.
3. Open `app.js` and set:
   ```js
   const SCRIPT_WEB_APP_URL = "https://your-script-url-here";
   ```

### Expected Google Sheet columns (order)

The receiving sheet should have these columns in order:

1. Timestamp
2. Section
3. Title
4. URL
5. Description
6. Type
7. Source
8. Tags
9. Submitted By
10. Email

> The app sends fields: `timestamp`, `section`, `title`, `url`, `description`, `type`, `source`, `tags`, `name` (Submitted By), `email`, and the honeypot `website` value.

## Running locally

No build steps are required. Open `index.html` directly in your browser, or serve the folder with a simple static server for cleaner local URLs:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000/`.

## Deployment (GitHub Pages)

1. Commit your changes to the repository.
2. In GitHub, go to **Settings → Pages** and choose the branch (e.g., `main`) with the root folder (`/`).
3. Save. GitHub Pages will publish the static site at the provided URL.

## How submissions work

- Name and Email (stored in localStorage) are required for every submission.
- Each section has a worksheet table with inline fields and an **Add row** button.
- The **Submit All Rows** buttons gather every non-empty row across sections.
- Validation: Name, Email, and per-row Title/URL/Description are required; empty rows are skipped.
- Each row is posted individually to the Apps Script endpoint using `FormData` (compatible with Apps Script). A hidden honeypot field named `website` is included.
- On successful submission, submitted rows are cleared while your saved Name/Email remain.

## Accessibility & behavior notes

- Left navigation and identity panel are sticky for quick jumping between sections.
- Mobile layout collapses sidebars to keep everything readable.
- Inline editing uses plain inputs/selects for a lightweight Google Sheets feel.

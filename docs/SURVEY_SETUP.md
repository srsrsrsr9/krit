# Wire the feedback survey to Google Sheets (5 minutes)

The single-file gallery (`public/prototype/embeddings/krit-deep-dives.html`) ships
with a feedback tab. Survey submissions POST to a Google Apps Script Web App URL
that appends rows to a Sheet you own. No third-party service, no Sheets API key,
no monthly cost.

If the endpoint isn't configured, submissions still save to the user's
`localStorage` under `krit.deep-dives.session.v1` — they're never lost — but
you'd have to pull them by hand. Set this up once and you can forget about it.

---

## Step 1 · Make a Google Sheet

1. Open [sheets.new](https://sheets.new) (signed in to the Google account you
   want the data to live in).
2. Rename it something like **"Krit Deep Dives — User Testing"**. The sheet's
   only tab can stay called `Sheet1` — the script will write to whichever tab
   is active.

## Step 2 · Open Apps Script

1. In the Sheet, go to **Extensions → Apps Script**.
2. Delete the placeholder `function myFunction() {}`.
3. Paste this whole block:

```javascript
// Krit Deep Dives — Feedback receiver
// Deployed as a Web App with "Anyone" access. Receives POST bodies of JSON
// (sent as text/plain so the browser doesn't trigger a CORS preflight) and
// appends them to whichever sheet is currently active.

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // Add a header row on first write so the columns are self-describing.
  const HEADERS = [
    'Submitted (server)',
    'Submitted (client)',
    'Name',
    'Role / context',
    'Interested topic',
    'Visited tabs',
    'Session started at',
    'Finished prototypes',
    'Most surprising',
    'Bounced where',
    'Pay ₹800?',
    'Pay which',
    'NPS (0–10)',
    'Would cut',
    'Would add',
    'Contact email',
    'User agent',
    'Page href',
  ];
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);

  let data = {};
  try { data = JSON.parse(e.postData.contents); }
  catch (err) { data = { _parseError: String(err), raw: e.postData ? e.postData.contents : '' }; }

  sheet.appendRow([
    new Date(),
    data.submittedAt || '',
    data.name || '',
    data.role || '',
    data.interestedTopic || '',
    data.visited ? JSON.stringify(data.visited) : '',
    data.sessionStartedAt ? new Date(data.sessionStartedAt).toISOString() : '',
    data.finishedProtos || '',
    data.mostSurprising || '',
    data.bouncedWhere || '',
    data.payTen || '',
    data.payWhich || '',
    data.nps !== null && data.nps !== undefined ? data.nps : '',
    data.wouldCut || '',
    data.wouldAdd || '',
    data.contactEmail || '',
    data.userAgent || '',
    data.pageHref || '',
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService.createTextOutput(
    'Krit Deep Dives feedback receiver. POST JSON to this URL.'
  );
}
```

4. Hit the **Save** icon (or `Cmd+S`). Name the project anything.

## Step 3 · Deploy as a Web App

1. Click **Deploy → New deployment** (top-right).
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in the deploy form:
   - **Description:** `Krit feedback receiver v1` (optional)
   - **Execute as:** `Me (your-email@gmail.com)`
   - **Who has access:** **`Anyone`** ← this is the critical setting. "Anyone with Google account" won't work for unsigned-in raters.
4. Click **Deploy**.
5. The first time you deploy, Google asks you to authorise the script. Click
   through the dialog: "Review permissions" → pick your account → it'll show
   "Google hasn't verified this app" → click **Advanced → Go to (project name)
   unsafe** → **Allow**. (This is the standard scary-looking screen for any
   self-hosted Apps Script. It's only "unsafe" because Google didn't review
   the script — you wrote it.)
6. Copy the **Web app URL**. It looks like:
   `https://script.google.com/macros/s/AKfycb...long-string.../exec`

## Step 4 · Paste the URL into the HTML

In `public/prototype/embeddings/krit-deep-dives.html`, near the top of `<head>`:

```html
<meta name="krit-feedback-endpoint" content="REPLACE_WITH_YOUR_APPS_SCRIPT_URL">
```

Replace `REPLACE_WITH_YOUR_APPS_SCRIPT_URL` with the URL you copied. Save the
file. If you've already shared the file before this step, re-share the updated
version.

## Step 5 · Smoke-test

1. Open the HTML file (locally or on whatever host you put it on).
2. Click tab 05 (Feedback). Fill the survey out with junk. Hit Submit.
3. You should see the green "Thanks — your read shaped this." status under
   the submit button.
4. Open the Sheet. A new row should appear within a few seconds.

If the row doesn't appear:

- **Re-check that "Who has access" was set to `Anyone`** in the deployment.
  This is the #1 cause of silent failures. Apps Script's default is "Only
  myself."
- Check the Sheet tab is the same one the script is writing to. The script
  uses `getActiveSheet()`, so whichever tab was visible at deploy time is the
  target.
- Apps Script execution logs live at **Executions** in the left sidebar of
  the Apps Script editor. Errors show up there even when the browser sees no
  response.
- If you're testing from `file://` (double-clicked HTML), some browsers
  silently block cross-origin POSTs. The fetch in the page uses `mode:
  'no-cors'` which usually works, but Safari is the strictest. Host the
  file on Netlify Drop / Vercel / anywhere with `https://` and test from
  there if local-file testing fails.

## What you get in the sheet

| Column | Source |
|---|---|
| Submitted (server) | `new Date()` on the Apps Script side |
| Submitted (client) | The reader's browser time at submit |
| Name | Welcome tab — optional |
| Role / context | Welcome tab — optional |
| Interested topic | Welcome tab — one of 4 prototypes, optional |
| Visited tabs | JSON object showing how many times each tab was opened in their session |
| Finished prototypes | Comma-separated list from survey Q1 |
| Most surprising | Survey Q2 |
| Bounced where | Survey Q3 (free text) |
| Pay ₹800? | Survey Q4 (yes / maybe / no) |
| Pay which | Survey Q5 — which prototype |
| NPS | Survey Q6 (0–10) |
| Would cut | Survey Q7 (free text) |
| Would add | Survey Q8 (free text) |
| Contact email | Survey Q9 — optional |
| User agent | Reader's browser string |
| Page href | URL the reader was on (useful if you A/B host) |

## Updating the script later

If you change the `doPost` code (e.g., add more columns), you need to
**re-deploy a new version**, not save:

1. Apps Script editor → **Deploy → Manage deployments**
2. Click the pencil icon on the existing deployment.
3. **Version: New version**, then **Deploy**.

The URL stays the same. Saving without re-deploying means the old code keeps
serving.

## If you'd rather use Formspree, Tally, or Typeform

The endpoint just needs to accept a POST with `Content-Type: text/plain` and
a JSON body matching the shape described above. Any service that does that
works — paste their endpoint URL into the `<meta>` tag instead. Formspree
and Tally both work out of the box; their dashboards present the data more
nicely than a Sheet at the cost of monthly limits on free tiers.

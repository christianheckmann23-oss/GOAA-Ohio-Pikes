# GOAA Website — Setup & Deployment Guide
## For: Non-technical site administrators

---

## What you have

This folder contains a complete website with a built-in CMS (content management system).
Once deployed, an editor can log into `/admin` and update everything through a simple dashboard — no coding required.

**Files:**
```
pike-site/
├── index.html              ← The main website
├── netlify.toml            ← Deployment config
├── admin/
│   ├── index.html          ← CMS dashboard page
│   └── config.yml          ← Defines all editable content
└── _data/
    ├── settings.json       ← Site-wide settings (alumni count, dues, etc.)
    ├── exec_board.json     ← Executive board officers
    ├── advisory_board.json ← Advisory board members
    ├── presidents.json     ← Chapter presidents list
    ├── scholarship_sutherin.json
    ├── scholarship_banfield.json
    ├── missing_alumni.json
    ├── housing_donors.json
    ├── businesses.json
    ├── news/               ← One .md file per news post
    ├── events/             ← One .md file per event
    └── awards/             ← One .md file per award
```

---

## Step 1: Create a GitHub account and repository

1. Go to **github.com** and create a free account (or log in)
2. Click the **+** in the top right → "New repository"
3. Name it: `pike-goaa-site` (or anything you like)
4. Set it to **Public**
5. Click **Create repository**
6. Upload all the files from this folder into the repository
   - Click "Add file" → "Upload files"
   - Drag everything in, click "Commit changes"

---

## Step 2: Deploy on Netlify (free)

1. Go to **netlify.com** and sign up with your GitHub account
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub**, select your `pike-goaa-site` repository
4. Leave all build settings blank (it's a static site)
5. Click **"Deploy site"**
6. Netlify will give you a URL like `https://amazing-name-123.netlify.app`
   - You can change this to something nicer in Site Settings → Domain management
   - Or connect your own domain (e.g. `gopike-ou.com`) if you buy one

---

## Step 3: Enable Netlify Identity (this is what powers the CMS login)

1. In your Netlify dashboard, click your site
2. Go to **Site configuration** → **Identity**
3. Click **"Enable Identity"**
4. Under **Registration**, select **"Invite only"** (so only people you invite can log in)
5. Scroll to **Services** → **Git Gateway** → Click **"Enable Git Gateway"**
   - This is what allows the CMS to save changes back to GitHub

---

## Step 4: Invite editors

1. Still in Netlify Identity, click **"Invite users"**
2. Enter the email address of whoever will manage the site
3. They'll receive an email with a link to set their password
4. That's it — they can now log in at `yoursite.netlify.app/admin`

---

## Step 5: Using the CMS dashboard

Once logged in at `/admin`, editors will see a sidebar with:

| Section | What you can edit |
|---|---|
| ⚙️ Site Settings | Alumni count, dues amount, address, contact email |
| 📰 News Posts | Add, edit, or delete news stories |
| 📅 Events | Add upcoming events with dates, location, RSVP links |
| 🎓 Scholarships | Update criteria, add new recipients each year |
| 🏆 Awards | Update recent recipients, add past winners |
| 🏛️ Executive Board | Update officer names each semester |
| 👥 Advisory Board | Add/remove board members |
| 📋 Chapter Presidents | Add new presidents to the historical list |
| 🔍 Missing Alumni | Add/remove names from the missing list |
| 🏠 Housing Corp Donors | Update donor recognition lists |
| 💼 Pike Businesses | Add alumni businesses or job postings |

### How to add a news post (example):
1. Click "📰 News Posts" in the sidebar
2. Click "New News Posts"
3. Fill in Title, Date, Category, and Excerpt (the short preview shown on the homepage)
4. Optionally write a longer full story
5. Make sure "Published" is toggled ON
6. Click "Publish" — the site updates automatically within ~30 seconds

---

## Step 6: Set up a custom domain (optional, ~$12/year)

1. Buy a domain at **namecheap.com** (e.g. `gopike-ou.com`)
2. In Netlify → Domain management → Add custom domain
3. Follow the instructions to point your domain's DNS to Netlify
4. Netlify automatically adds a free SSL certificate (https://)

---

## Keeping things updated

- **Events**: Add new events when announced, delete past events when done
- **News**: Add a post for any notable chapter achievement, scholarship award, or alumni news
- **Executive Board**: Update at the start of each academic year
- **Scholarship Recipients**: Add the new recipient each spring
- **Dues amount**: Update in Site Settings if it ever changes

---

## Need help?

- Netlify docs: **docs.netlify.com**
- Decap CMS docs: **decapcms.org/docs**
- GitHub basics: **docs.github.com**

For site code changes beyond what the CMS covers, contact your web administrator.

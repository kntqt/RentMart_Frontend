# RentMart — Hostinger Frontend Deployment Guide

> **Domain:** `https://rentmart.bscs4b.com` (or `http://rentmart.bscs4b.com`)  
> **Backend:** Running locally on your computer (`http://localhost:5000`)

---

## 1. What Has Been Prepared For You

1. **Clean Directory Restored:** The frontend code is located inside `RentMart_Frontend/frontend/`.
2. **Production Build Created:** The production build is compiled and ready inside `RentMart_Frontend/frontend/dist/`.
3. **Apache `.htaccess` Configured:** Inside `dist/`, a `.htaccess` file is pre-packaged with URL rewrite rules so refreshing pages (like `/admin/dashboard`, `/login`, etc.) will NOT cause a 404 error on Hostinger.
4. **Backend CORS Configured:** Your backend (`backend/server/server.js`) is pre-configured to automatically allow requests from `rentmart.bscs4b.com`.
5. **Dynamic API Configuration:** The frontend (`frontend/src/services/api.js`) connects to `http://localhost:5000/api` by default, but also allows you to override it at runtime via browser console (`localStorage.setItem('rentmart_api_url', '...')`) without re-uploading files!

---

## 2. Step-by-Step: Deploy to Hostinger

### Step 1: Open Hostinger File Manager
1. Log in to [Hostinger hPanel](https://hpanel.hostinger.com).
2. Go to **Websites** and click **Manage** next to `rentmart.bscs4b.com`.
3. Under the **Files** section, click **File Manager**.
4. Open the `public_html` directory for `rentmart.bscs4b.com`.
5. If there is an existing `default.php` or placeholder `index.html`, select and delete them.

### Step 2: Upload the Build Files
Navigate on your computer to:
```
c:\Users\KENT ANDREI\Documents\RentMart_Frontend\frontend\dist\
```

Upload **all contents** inside `dist/` into `public_html`:
- `assets/` (the whole folder with JS, CSS, and images)
- `index.html`
- `.htaccess` *(make sure hidden files are visible in Hostinger File Manager if needed)*
- `favicon.jpg`
- `logo.jpg`
- `_redirects`

> ⚠️ **IMPORTANT:** Upload the **contents** of `dist`, NOT the `dist` folder itself.  
> Your Hostinger path must be `public_html/index.html`, **NOT** `public_html/dist/index.html`.

---

## 3. Step-by-Step: Running Your Backend on Localhost

When you want to use the app, start your local backend server:

1. Open a terminal (PowerShell or Command Prompt).
2. Navigate to your backend server directory:
   ```powershell
   cd "C:\Users\KENT ANDREI\Documents\RentMart_Backend\backend\server"
   ```
3. Start the server:
   ```powershell
   node server.js
   ```
4. You will see:
   ```
   =======================================================
    RentMart CSS Backend running on port 5000
    Hostinger domain: https://rentmart.bscs4b.com
    Health check: http://localhost:5000/api/health
   =======================================================
   ```

---

## 4. Connecting Hostinger Frontend to Localhost

### Important Note on HTTP vs. HTTPS

Because your frontend is hosted on Hostinger (`rentmart.bscs4b.com`) and your backend is on `http://localhost:5000`:

#### Option A: Access via HTTP (Easiest)
Open your browser and visit:
```
http://rentmart.bscs4b.com
```
Because both the frontend and your localhost backend are over standard HTTP, modern browsers will allow the requests without any mixed-content blocking.

#### Option B: If Accessing via HTTPS (`https://rentmart.bscs4b.com`)
If Hostinger automatically forces HTTPS (`https://rentmart.bscs4b.com`), browsers block `http://localhost:5000` under **Mixed Content Protection** (an HTTPS site calling an insecure HTTP API).

You have two simple solutions:

1. **Allow Insecure Content in Chrome/Edge (10 seconds):**
   - In your browser address bar on `https://rentmart.bscs4b.com`, click the **Site Settings / Tune icon** (left of the URL).
   - Click **Site settings**.
   - Find **Insecure content** and change it from *Block* to **Allow**.
   - Reload the page. It will now connect to `http://localhost:5000` smoothly!

2. **OR Use ngrok (Public HTTPS Tunnel):**
   - Open a terminal and run:
     ```powershell
     ngrok http 5000
     ```
   - Copy the forwarding URL (e.g. `https://abc123.ngrok-free.app`).
   - On `https://rentmart.bscs4b.com`, press `F12` to open DevTools Console, and run:
     ```javascript
     localStorage.setItem('rentmart_api_url', 'https://abc123.ngrok-free.app/api');
     location.reload();
     ```
   - Done! You don't even need to rebuild or re-upload anything.

---

## 5. Seeded Login Accounts for Testing

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@duero.com` | `Admin1234` |
| **Staff** | `staff@duero.com` | `Staff1234` |
| **Renter** | `juandelacruz@duero.com` | `Juan1234` |

---

## 6. How to Rebuild After Making Future Code Changes

Whenever you modify any code in `RentMart_Frontend/frontend/src/`:

```powershell
cd "C:\Users\KENT ANDREI\Documents\RentMart_Frontend\frontend"
npm run build
```
Then upload the updated contents of `frontend/dist/` to Hostinger's `public_html/`.

# Troubleshooting: Firebase Network Request Failed

## Error: `Firebase: Error (auth/network-request-failed)`

This error usually means Firebase can't connect to your project. Here's how to fix it:

---

## ✅ Solution 1: Enable Authentication (Most Common Fix)

**This is the #1 cause of this error!**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **doctor-e1640**
3. Click **"Authentication"** in the left menu
4. If you see "Get started", click it
5. Go to **"Sign-in method"** tab
6. Click on **"Email/Password"**
7. **Enable** the first toggle (Email/Password provider)
8. Click **"Save"**

**Try again after enabling this!**

---

## ✅ Solution 2: Create Firestore Database

1. In Firebase Console, click **"Firestore Database"** in the left menu
2. If you see "Create database", click it
3. Choose **"Start in test mode"**
4. Select a **location** (choose closest to you, e.g., "us-central" or "asia-south1")
5. Click **"Enable"**
6. Wait for the database to be created (takes 1-2 minutes)

---

## ✅ Solution 3: Check API Key Restrictions

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: **doctor-e1640**
3. Go to **"APIs & Services"** > **"Credentials"**
4. Find your API key (starts with "AIzaSy...")
5. Click on it to edit
6. Under **"API restrictions"**, make sure:
   - Either "Don't restrict key" is selected, OR
   - "Restrict key" includes:
     - Identity Toolkit API
     - Firebase Installations API
7. Under **"Application restrictions"**, select **"None"** (for development)
8. Click **"Save"**

---

## ✅ Solution 4: Check Browser Console for Detailed Errors

1. Open your browser's Developer Tools (Press **F12**)
2. Go to **"Console"** tab
3. Try to sign up again
4. Look for any red error messages
5. Share the exact error message you see

Common errors you might see:
- `auth/configuration-not-found` - Configuration issue
- `auth/api-key-not-valid` - API key problem
- `auth/network-request-failed` - Network/connectivity issue

---

## ✅ Solution 5: Verify Firebase Project Status

1. Go to Firebase Console
2. Check if your project status is **"Active"**
3. Make sure you're using the correct project (doctor-e1640)
4. Verify the project hasn't been deleted or suspended

---

## ✅ Solution 6: Check Network/Firewall

- Make sure you have internet connection
- Try a different network (mobile hotspot)
- Disable VPN if you're using one
- Check if your firewall is blocking Firebase domains

---

## ✅ Solution 7: Clear Browser Cache

1. Press **Ctrl + Shift + Delete** (Windows) or **Cmd + Shift + Delete** (Mac)
2. Select "Cached images and files"
3. Click "Clear data"
4. Refresh the page and try again

---

## Quick Checklist

Run through this checklist:

- [ ] Authentication is enabled (Email/Password)
- [ ] Firestore Database is created
- [ ] API key has no restrictions (or correct restrictions)
- [ ] Project is active in Firebase Console
- [ ] Internet connection is working
- [ ] Browser console shows no other errors
- [ ] You're accessing via `http://localhost:8000` (not `file://`)

---

## Still Not Working?

If none of the above works, try this:

1. **Create a new Firebase project** (fresh start)
2. **Copy the new configuration** to `js/firebase-config.js`
3. **Enable Authentication** and **create Firestore**
4. **Try again**

---

## Need More Help?

Share:
1. The exact error message from browser console (F12)
2. Screenshot of Firebase Console > Authentication page
3. Whether Authentication shows as "Enabled"


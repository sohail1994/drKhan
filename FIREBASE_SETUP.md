# Firebase Setup Guide - Step by Step

## What Data You Need to Provide

You need **6 values** from your Firebase project to configure the application. Here's what each one means and where to find it:

### Required Firebase Configuration Values:

1. **apiKey** - Your Firebase API key
2. **authDomain** - Your authentication domain (usually: `YOUR_PROJECT_ID.firebaseapp.com`)
3. **projectId** - Your Firebase project ID
4. **storageBucket** - Your storage bucket (usually: `YOUR_PROJECT_ID.appspot.com`)
5. **messagingSenderId** - Your messaging sender ID (numeric)
6. **appId** - Your web app ID

---

## Step-by-Step: How to Get These Values

### Step 1: Go to Firebase Console
1. Open your browser and go to: **https://console.firebase.google.com/**
2. Sign in with your Google account
3. Select your project (or create a new one if you haven't)

### Step 2: Access Project Settings
1. Click the **gear icon (⚙️)** in the top left (next to "Project Overview")
2. Click **"Project settings"** from the dropdown menu

### Step 3: Register Your Web App
1. Scroll down to the **"Your apps"** section
2. If you don't have a web app yet:
   - Click the **web icon `</>`** (it says "Add app" or shows a web icon)
   - Enter an app nickname (e.g., "Doctor App" or "Patient Management")
   - **DO NOT** check "Also set up Firebase Hosting" (unless you want to use it)
   - Click **"Register app"**

### Step 4: Copy Your Configuration
After registering, you'll see a code block that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "my-project-12345.firebaseapp.com",
  projectId: "my-project-12345",
  storageBucket: "my-project-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

**This is exactly what you need!**

### Step 5: Copy Each Value
Copy each value from the Firebase console and paste it into `js/firebase-config.js`:

| Firebase Console | Your firebase-config.js |
|-----------------|------------------------|
| `apiKey: "AIzaSyC..."` | `apiKey: "AIzaSyC..."` |
| `authDomain: "..."` | `authDomain: "..."` |
| `projectId: "..."` | `projectId: "..."` |
| `storageBucket: "..."` | `storageBucket: "..."` |
| `messagingSenderId: "..."` | `messagingSenderId: "..."` |
| `appId: "..."` | `appId: "..."` |

---

## Example: What Your Config Should Look Like

**Before (placeholder):**
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

**After (with real values):**
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyC7xYz123abc456def789ghi",
    authDomain: "doctor-app-abc123.firebaseapp.com",
    projectId: "doctor-app-abc123",
    storageBucket: "doctor-app-abc123.appspot.com",
    messagingSenderId: "987654321098",
    appId: "1:987654321098:web:abc123def456ghi789"
};
```

---

## Additional Setup Required

### 1. Enable Authentication

1. In Firebase Console, go to **"Authentication"** in the left menu
2. Click **"Get started"** (if first time)
3. Go to **"Sign-in method"** tab
4. Click on **"Email/Password"**
5. **Enable** the first toggle (Email/Password)
6. Click **"Save"**

### 2. Create Firestore Database

1. In Firebase Console, go to **"Firestore Database"** in the left menu
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
   - ⚠️ **Important**: Update security rules later (see README.md)
4. Select a **location** (choose closest to you)
5. Click **"Enable"**

### 3. Set Up Security Rules (Important!)

1. Go to **Firestore Database** > **Rules** tab
2. Replace the default rules with the security rules from README.md
3. Click **"Publish"**

---

## Quick Checklist

- [ ] Firebase project created
- [ ] Web app registered in Firebase Console
- [ ] Configuration values copied from Firebase Console
- [ ] `js/firebase-config.js` updated with real values
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore Database created
- [ ] Security rules updated

---

## Troubleshooting

### "I can't find the configuration"
- Make sure you've registered a **web app** (not iOS or Android)
- Check the "Your apps" section in Project Settings
- If you see multiple apps, use the web app one

### "Where is the apiKey?"
- It's in the `firebaseConfig` object in Firebase Console
- It starts with "AIzaSy" usually
- It's safe to use in client-side code (Firebase handles security)

### "Do I need to hide these values?"
- **No**, these values are meant to be public in client-side code
- Firebase security is handled through **Security Rules**, not by hiding these values
- However, don't commit them to public repositories if you're concerned

### "What if I have multiple projects?"
- Each Firebase project has its own configuration
- Make sure you're copying from the correct project
- You can have multiple projects for development/production

---

## Visual Guide Locations

In Firebase Console, the configuration is found at:
```
Firebase Console
  └─ Project Settings (⚙️ icon)
      └─ Your apps section
          └─ Web app (</> icon)
              └─ SDK setup and configuration
                  └─ Config object (what you need!)
```

---

## Need Help?

If you're stuck:
1. Check the Firebase Console - the configuration is always visible there
2. Make sure you're in the correct Firebase project
3. Verify you registered a **web app**, not a mobile app
4. The values are long strings - make sure you copy them completely

Once you have these 6 values, paste them into `js/firebase-config.js` and you're ready to go! 🚀


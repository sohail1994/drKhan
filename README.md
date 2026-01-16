# Doctor Patient Management System

A responsive web application for doctors to manage their patients, appointments, and follow-ups. Built with HTML, Bootstrap 5, and Firebase.

## Features

- 🔐 **User Authentication** - Secure login and signup
- 👥 **Patient Management** - Add, edit, delete, and search patients
- 📅 **Appointment Scheduling** - Manage appointments with date/time tracking
- 🔔 **Follow-up Reminders** - Track patient follow-ups and reminders
- 📊 **Dashboard** - Overview of statistics and recent activities
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices

## Technology Stack

- **Frontend**: HTML5, CSS3, Bootstrap 5
- **Backend**: Firebase (Firestore Database, Authentication)
- **JavaScript**: Vanilla JavaScript (ES6 Modules)

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable the following services:
   - **Authentication**: 
     - Go to Authentication > Sign-in method
     - Enable "Email/Password"
   - **Firestore Database**:
     - Go to Firestore Database > Create database
     - Start in **test mode** (for development)
     - Choose a location closest to you

### 2. Get Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ > **Project settings**
2. Scroll down to "Your apps" section
3. Click the web icon `</>` to add a web app
4. Register your app (give it a name like "Doctor App")
5. Copy the Firebase configuration object

### 3. Configure the Application

1. Open `js/firebase-config.js`
2. Replace the placeholder values with your Firebase configuration:

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

### 4. Firestore Security Rules (Important!)

After setting up, update your Firestore security rules to secure your data:

1. Go to Firestore Database > Rules
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Doctors collection - users can only read/write their own document
    match /doctors/{doctorId} {
      allow read, write: if request.auth != null && request.auth.uid == doctorId;
    }
    
    // Patients collection - users can only access their own patients
    match /patients/{patientId} {
      allow read, write: if request.auth != null && 
        resource.data.doctorId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.doctorId == request.auth.uid;
    }
    
    // Appointments collection - users can only access their own appointments
    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null && 
        resource.data.doctorId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.doctorId == request.auth.uid;
    }
    
    // Followups collection - users can only access their own follow-ups
    match /followups/{followupId} {
      allow read, write: if request.auth != null && 
        resource.data.doctorId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.doctorId == request.auth.uid;
    }
  }
}
```

### 5. Run the Application

#### Option 1: Local Server (Recommended)

Since the app uses ES6 modules, you need to run it on a local server:

**Using Python:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Using Node.js (http-server):**
```bash
npx http-server -p 8000
```

**Using VS Code:**
- Install "Live Server" extension
- Right-click on `index.html` > "Open with Live Server"

Then open your browser and go to: `http://localhost:8000`

#### Option 2: Firebase Hosting (Production)

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project:
```bash
firebase init hosting
```

4. Deploy:
```bash
firebase deploy
```

## Project Structure

```
doctor/
├── index.html          # Login/Signup page
├── dashboard.html      # Main dashboard
├── patients.html       # Patient management
├── appointments.html   # Appointment scheduling
├── follow-ups.html     # Follow-up management
├── css/
│   └── style.css      # Custom styles
├── js/
│   ├── firebase-config.js  # Firebase configuration
│   ├── auth.js             # Authentication logic
│   ├── dashboard.js        # Dashboard functionality
│   ├── patients.js         # Patient management
│   ├── appointments.js     # Appointment management
│   └── followups.js        # Follow-up management
└── README.md           # This file
```

## Usage

1. **Sign Up**: Create a new doctor account
2. **Add Patients**: Go to Patients page and add patient information
3. **Schedule Appointments**: Create appointments for patients
4. **Set Follow-ups**: Create follow-up reminders for patients
5. **View Dashboard**: See statistics and recent activities

## Features in Detail

### Patient Management
- Add patient details (name, age, gender, contact info)
- Store medical history
- Search and filter patients
- Edit and delete patients

### Appointment Management
- Schedule appointments with date and time
- View appointments by date (today, upcoming, past)
- Update appointment status (Scheduled, Completed, Cancelled)
- Link appointments to patients

### Follow-up Management
- Create follow-up reminders
- Track pending and completed follow-ups
- Mark follow-ups as complete
- View overdue follow-ups

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Security Notes

- Always update Firestore security rules before deploying to production
- Never commit your Firebase configuration with real API keys to public repositories
- Use environment variables or Firebase Hosting environment config for production

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Make sure you've updated `firebase-config.js` with your Firebase configuration

### "Firebase: Missing or insufficient permissions"
- Check your Firestore security rules
- Make sure you're authenticated

### "CORS error" or "Module not found"
- Make sure you're running the app on a local server, not opening HTML files directly

### Data not loading
- Check browser console for errors
- Verify Firestore database is created and rules are set
- Ensure Authentication is enabled

## License

This project is open source and available for personal and commercial use.

## Support

For issues or questions, please check:
- Firebase Documentation: https://firebase.google.com/docs
- Bootstrap Documentation: https://getbootstrap.com/docs

---

**Note**: This application uses Firebase's free tier, which is sufficient for small to medium practices. For larger deployments, consider upgrading to Firebase's Blaze plan.


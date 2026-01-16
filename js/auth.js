// Authentication Module
import { auth } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    doc, 
    setDoc, 
    getDoc 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { db } from './firebase-config.js';

// Check if user is logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, redirect to dashboard
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
            window.location.href = 'dashboard.html';
        }
    } else {
        // User is signed out, redirect to login
        if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/' && !window.location.pathname.endsWith('/')) {
            window.location.href = 'index.html';
        }
    }
});

// Toggle between login and signup forms
document.getElementById('showSignup')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginForm').classList.add('d-none');
    document.getElementById('signupForm').classList.remove('d-none');
});

document.getElementById('showLogin')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('signupForm').classList.add('d-none');
    document.getElementById('loginForm').classList.remove('d-none');
});

// Login form handler
document.getElementById('loginFormElement')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    try {
        errorDiv.classList.add('d-none');
        await signInWithEmailAndPassword(auth, email, password);
        // Redirect handled by onAuthStateChanged
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('d-none');
    }
});

// Signup form handler
document.getElementById('signupFormElement')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const errorDiv = document.getElementById('signupError');
    
    try {
        errorDiv.classList.add('d-none');
        
        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Save user profile to Firestore
        await setDoc(doc(db, 'doctors', user.uid), {
            name: name,
            email: email,
            createdAt: new Date().toISOString()
        });
        
        // Redirect handled by onAuthStateChanged
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('d-none');
    }
});

// Logout handler (for other pages)
document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
});

// Get current user info for display
export async function getCurrentUser() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, 'doctors', user.uid));
                if (userDoc.exists()) {
                    resolve({ ...user, ...userDoc.data() });
                } else {
                    resolve(user);
                }
            } else {
                resolve(null);
            }
        });
    });
}


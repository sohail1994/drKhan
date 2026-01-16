// Dashboard Module
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { collection, query, getDocs, where, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getCurrentUser } from './auth.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Check authentication
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'index.html';
    } else {
        loadUserInfo();
        loadDashboardData();
    }
});

// Load user info
async function loadUserInfo() {
    const user = await getCurrentUser();
    if (user && user.name) {
        document.getElementById('userName').textContent = user.name;
    }
}

// Logout handler
document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
});

// Load dashboard statistics
async function loadDashboardData() {
    try {
        const userId = auth.currentUser.uid;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];
        
        // Get total patients
        const patientsSnapshot = await getDocs(collection(db, 'patients'));
        const totalPatients = patientsSnapshot.size;
        document.getElementById('totalPatients').textContent = totalPatients;
        
        // Get today's appointments
        const appointmentsQuery = query(
            collection(db, 'appointments'),
            where('doctorId', '==', userId),
            where('date', '==', todayStr)
        );
        const todayAppointmentsSnapshot = await getDocs(appointmentsQuery);
        document.getElementById('todayAppointments').textContent = todayAppointmentsSnapshot.size;
        
        // Get pending follow-ups
        const followupsQuery = query(
            collection(db, 'followups'),
            where('doctorId', '==', userId),
            where('status', '==', 'Pending')
        );
        const followupsSnapshot = await getDocs(followupsQuery);
        document.getElementById('pendingFollowups').textContent = followupsSnapshot.size;
        
        // Get this month's appointments
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        const monthAppointmentsQuery = query(
            collection(db, 'appointments'),
            where('doctorId', '==', userId),
            where('date', '>=', monthStart)
        );
        const monthAppointmentsSnapshot = await getDocs(monthAppointmentsQuery);
        document.getElementById('monthAppointments').textContent = monthAppointmentsSnapshot.size;
        
        // Load recent patients
        await loadRecentPatients();
        
        // Load upcoming appointments
        await loadUpcomingAppointments();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Load recent patients
async function loadRecentPatients() {
    try {
        const userId = auth.currentUser.uid;
        const patientsQuery = query(
            collection(db, 'patients'),
            where('doctorId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(5)
        );
        
        const snapshot = await getDocs(patientsQuery);
        const tableBody = document.getElementById('recentPatientsTable');
        
        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No patients yet</td></tr>';
            return;
        }
        
        tableBody.innerHTML = '';
        snapshot.forEach((doc) => {
            const patient = doc.data();
            const row = document.createElement('tr');
            const lastVisit = patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'Never';
            
            row.innerHTML = `
                <td>${patient.name}</td>
                <td>${patient.phone || 'N/A'}</td>
                <td>${lastVisit}</td>
                <td><a href="patients.html" class="btn btn-sm btn-outline-primary">View</a></td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading recent patients:', error);
    }
}

// Load upcoming appointments
async function loadUpcomingAppointments() {
    try {
        const userId = auth.currentUser.uid;
        const today = new Date().toISOString().split('T')[0];
        
        const appointmentsQuery = query(
            collection(db, 'appointments'),
            where('doctorId', '==', userId),
            where('date', '>=', today),
            where('status', '==', 'Scheduled'),
            orderBy('date', 'asc'),
            orderBy('time', 'asc'),
            limit(5)
        );
        
        const snapshot = await getDocs(appointmentsQuery);
        const container = document.getElementById('upcomingAppointments');
        
        if (snapshot.empty) {
            container.innerHTML = '<p class="text-muted text-center">No upcoming appointments</p>';
            return;
        }
        
        container.innerHTML = '';
        snapshot.forEach((doc) => {
            const appointment = doc.data();
            const appointmentDate = new Date(appointment.date + 'T' + appointment.time);
            const dateStr = appointmentDate.toLocaleDateString();
            const timeStr = appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const card = document.createElement('div');
            card.className = 'card mb-2 appointment-card';
            card.innerHTML = `
                <div class="card-body p-3">
                    <h6 class="card-title mb-1">${appointment.patientName}</h6>
                    <p class="card-text mb-0 small">
                        <i class="bi bi-calendar"></i> ${dateStr}<br>
                        <i class="bi bi-clock"></i> ${timeStr}
                    </p>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading upcoming appointments:', error);
        document.getElementById('upcomingAppointments').innerHTML = '<p class="text-danger text-center">Error loading appointments</p>';
    }
}


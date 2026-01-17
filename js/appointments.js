// Appointments Module
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    getDocs, 
    query, 
    where, 
    orderBy 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getCurrentUser } from './auth.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

let appointments = [];
let patients = [];
let editingAppointmentId = null;

// Check authentication
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'index.html';
    } else {
        loadUserInfo();
        loadPatients();
        loadAppointments();
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

// Load patients for autocomplete
async function loadPatients() {
    try {
        const userId = auth.currentUser.uid;
        const patientsQuery = query(
            collection(db, 'patients'),
            where('doctorId', '==', userId)
        );
        
        const snapshot = await getDocs(patientsQuery);
        patients = [];
        snapshot.forEach((doc) => {
            patients.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by name
        patients.sort((a, b) => {
            const nameA = (a.name || '').toLowerCase();
            const nameB = (b.name || '').toLowerCase();
            return nameA.localeCompare(nameB);
        });
        
        // Setup autocomplete for appointment patient
        setupAutocomplete('appointmentPatient', 'appointmentPatientId', 'appointmentPatientSuggestions');
    } catch (error) {
        console.error('Error loading patients:', error);
    }
}

// Setup autocomplete functionality
function setupAutocomplete(inputId, hiddenId, suggestionsId) {
    const input = document.getElementById(inputId);
    const hidden = document.getElementById(hiddenId);
    const suggestions = document.getElementById(suggestionsId);
    let selectedIndex = -1;
    
    if (!input || !hidden || !suggestions) return;
    
    input.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        hidden.value = '';
        selectedIndex = -1;
        
        if (searchTerm === '') {
            suggestions.classList.remove('show');
            return;
        }
        
        // Filter patients
        const filtered = patients.filter(patient => 
            patient.name?.toLowerCase().includes(searchTerm) ||
            patient.phone?.includes(searchTerm) ||
            patient.email?.toLowerCase().includes(searchTerm)
        );
        
        if (filtered.length === 0) {
            suggestions.innerHTML = '<div class="autocomplete-suggestion">No patients found</div>';
            suggestions.classList.add('show');
            return;
        }
        
        // Display suggestions
        suggestions.innerHTML = '';
        filtered.forEach((patient, index) => {
            const div = document.createElement('div');
            div.className = 'autocomplete-suggestion';
            div.innerHTML = `
                <div class="patient-name">${patient.name || 'N/A'}</div>
                <div class="patient-info">Age: ${patient.age || 'N/A'} | Phone: ${patient.phone || 'N/A'}</div>
            `;
            div.addEventListener('click', () => {
                selectPatient(patient, input, hidden, suggestions);
            });
            div.addEventListener('mouseenter', () => {
                selectedIndex = index;
                updateSelection();
            });
            suggestions.appendChild(div);
        });
        
        suggestions.classList.add('show');
    });
    
    input.addEventListener('keydown', (e) => {
        const visibleSuggestions = suggestions.querySelectorAll('.autocomplete-suggestion');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, visibleSuggestions.length - 1);
            updateSelection();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelection();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && visibleSuggestions[selectedIndex]) {
                const patient = patients.find(p => 
                    p.name?.toLowerCase().includes(input.value.toLowerCase())
                );
                if (patient) {
                    selectPatient(patient, input, hidden, suggestions);
                }
            }
        } else if (e.key === 'Escape') {
            suggestions.classList.remove('show');
        }
    });
    
    function updateSelection() {
        const visibleSuggestions = suggestions.querySelectorAll('.autocomplete-suggestion');
        visibleSuggestions.forEach((item, index) => {
            if (index === selectedIndex) {
                item.classList.add('selected');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('selected');
            }
        });
    }
    
    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !suggestions.contains(e.target)) {
            suggestions.classList.remove('show');
        }
    });
}

function selectPatient(patient, input, hidden, suggestions) {
    input.value = patient.name;
    hidden.value = patient.id;
    suggestions.classList.remove('show');
    selectedIndex = -1;
}

// Load appointments
async function loadAppointments() {
    try {
        const userId = auth.currentUser.uid;
        const appointmentsQuery = query(
            collection(db, 'appointments'),
            where('doctorId', '==', userId)
        );
        
        const snapshot = await getDocs(appointmentsQuery);
        appointments = [];
        snapshot.forEach((doc) => {
            appointments.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by date and time (descending - most recent first)
        appointments.sort((a, b) => {
            if (a.date !== b.date) {
                return b.date.localeCompare(a.date); // Descending
            }
            return b.time.localeCompare(a.time); // Descending
        });
        
        displayAppointments(appointments);
        displayTodayAppointments();
        displayUpcomingAppointments();
        displayPastAppointments();
    } catch (error) {
        console.error('Error loading appointments:', error);
    }
}

// Display appointments in table
function displayAppointments(appointmentsToShow) {
    const tableBody = document.getElementById('appointmentsTable');
    
    if (appointmentsToShow.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No appointments found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = '';
    appointmentsToShow.forEach((appointment) => {
        const row = document.createElement('tr');
        const date = new Date(appointment.date + 'T' + appointment.time);
        const dateStr = date.toLocaleDateString();
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        let statusClass = 'bg-secondary';
        if (appointment.status === 'Completed') statusClass = 'bg-success';
        else if (appointment.status === 'Cancelled') statusClass = 'bg-danger';
        else if (appointment.status === 'Scheduled') statusClass = 'bg-primary';
        
        row.innerHTML = `
            <td>${dateStr} ${timeStr}</td>
            <td>${appointment.patientName}</td>
            <td>${appointment.patientPhone || 'N/A'}</td>
            <td>${appointment.reason || 'N/A'}</td>
            <td><span class="badge ${statusClass}">${appointment.status}</span></td>
            <td>
                <button class="btn btn-sm btn-primary me-1" onclick="editAppointment('${appointment.id}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteAppointment('${appointment.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Display today's appointments
function displayTodayAppointments() {
    const today = new Date().toISOString().split('T')[0];
    const todayApps = appointments.filter(apt => apt.date === today);
    const container = document.getElementById('todayAppointmentsList');
    
    if (todayApps.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No appointments today</p>';
        return;
    }
    
    container.innerHTML = '';
    todayApps.forEach(appointment => {
        const date = new Date(appointment.date + 'T' + appointment.time);
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const card = document.createElement('div');
        card.className = 'card mb-2 appointment-card';
        card.innerHTML = `
            <div class="card-body p-3">
                <h6 class="card-title mb-1">${appointment.patientName}</h6>
                <p class="card-text mb-1 small"><i class="bi bi-clock"></i> ${timeStr}</p>
                <p class="card-text mb-0 small text-muted">${appointment.reason || 'No reason specified'}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// Display upcoming appointments
function displayUpcomingAppointments() {
    const today = new Date().toISOString().split('T')[0];
    const upcoming = appointments.filter(apt => apt.date >= today && apt.status === 'Scheduled')
        .sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.time.localeCompare(b.time);
        });
    const container = document.getElementById('upcomingAppointmentsList');
    
    if (upcoming.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No upcoming appointments</p>';
        return;
    }
    
    container.innerHTML = '';
    upcoming.forEach(appointment => {
        const date = new Date(appointment.date + 'T' + appointment.time);
        const dateStr = date.toLocaleDateString();
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const card = document.createElement('div');
        card.className = 'card mb-2 appointment-card';
        card.innerHTML = `
            <div class="card-body p-3">
                <h6 class="card-title mb-1">${appointment.patientName}</h6>
                <p class="card-text mb-1 small"><i class="bi bi-calendar"></i> ${dateStr}</p>
                <p class="card-text mb-0 small"><i class="bi bi-clock"></i> ${timeStr}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// Display past appointments
function displayPastAppointments() {
    const today = new Date().toISOString().split('T')[0];
    const past = appointments.filter(apt => apt.date < today || apt.status === 'Completed')
        .sort((a, b) => {
            if (a.date !== b.date) return b.date.localeCompare(a.date);
            return b.time.localeCompare(a.time);
        });
    const container = document.getElementById('pastAppointmentsList');
    
    if (past.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No past appointments</p>';
        return;
    }
    
    container.innerHTML = '';
    past.forEach(appointment => {
        const date = new Date(appointment.date + 'T' + appointment.time);
        const dateStr = date.toLocaleDateString();
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const card = document.createElement('div');
        card.className = 'card mb-2 appointment-card completed';
        card.innerHTML = `
            <div class="card-body p-3">
                <h6 class="card-title mb-1">${appointment.patientName}</h6>
                <p class="card-text mb-1 small"><i class="bi bi-calendar"></i> ${dateStr}</p>
                <p class="card-text mb-0 small"><i class="bi bi-clock"></i> ${timeStr}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// Make functions global for onclick handlers
window.editAppointment = function(appointmentId) {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) return;
    
    editingAppointmentId = appointmentId;
    document.getElementById('appointmentId').value = appointmentId;
    
    // Set autocomplete values
    const patient = patients.find(p => p.id === appointment.patientId);
    if (patient) {
        document.getElementById('appointmentPatient').value = patient.name;
        document.getElementById('appointmentPatientId').value = patient.id;
    }
    
    document.getElementById('appointmentDate').value = appointment.date;
    document.getElementById('appointmentTime').value = appointment.time;
    document.getElementById('appointmentReason').value = appointment.reason || '';
    document.getElementById('appointmentStatus').value = appointment.status;
    
    document.getElementById('appointmentModalTitle').textContent = 'Edit Appointment';
    const modal = new bootstrap.Modal(document.getElementById('appointmentModal'));
    modal.show();
};

window.deleteAppointment = async function(appointmentId) {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    
    try {
        await deleteDoc(doc(db, 'appointments', appointmentId));
        loadAppointments();
    } catch (error) {
        console.error('Error deleting appointment:', error);
        alert('Error deleting appointment. Please try again.');
    }
};

// Add/Edit appointment form handler
document.getElementById('addAppointmentBtn')?.addEventListener('click', () => {
    editingAppointmentId = null;
    document.getElementById('appointmentForm').reset();
    document.getElementById('appointmentId').value = '';
    document.getElementById('appointmentPatientId').value = '';
    document.getElementById('appointmentStatus').value = 'Scheduled';
    document.getElementById('appointmentModalTitle').textContent = 'New Appointment';
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').value = today;
    
    // Hide suggestions
    document.getElementById('appointmentPatientSuggestions').classList.remove('show');
});

document.getElementById('saveAppointmentBtn')?.addEventListener('click', async () => {
    const form = document.getElementById('appointmentForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const patientId = document.getElementById('appointmentPatientId').value;
    const patient = patients.find(p => p.id === patientId);
    
    if (!patient || !patientId) {
        alert('Please select a patient from the list');
        return;
    }
    
    const appointmentData = {
        patientId: patientId,
        patientName: patient.name,
        patientPhone: patient.phone || '',
        date: document.getElementById('appointmentDate').value,
        time: document.getElementById('appointmentTime').value,
        reason: document.getElementById('appointmentReason').value.trim(),
        status: document.getElementById('appointmentStatus').value,
        doctorId: auth.currentUser.uid,
        createdAt: editingAppointmentId ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    try {
        if (editingAppointmentId) {
            await updateDoc(doc(db, 'appointments', editingAppointmentId), appointmentData);
        } else {
            await addDoc(collection(db, 'appointments'), appointmentData);
        }
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('appointmentModal'));
        modal.hide();
        form.reset();
        loadAppointments();
    } catch (error) {
        console.error('Error saving appointment:', error);
        alert('Error saving appointment. Please try again.');
    }
});


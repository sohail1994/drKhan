// Follow-ups Module
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

let followups = [];
let patients = [];
let editingFollowupId = null;

// Check authentication
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'index.html';
    } else {
        loadUserInfo();
        loadPatients();
        loadFollowups();
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
        
        // Setup autocomplete for followup patient
        setupAutocomplete('followupPatient', 'followupPatientId', 'followupPatientSuggestions');
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

// Load follow-ups
async function loadFollowups() {
    try {
        const userId = auth.currentUser.uid;
        const followupsQuery = query(
            collection(db, 'followups'),
            where('doctorId', '==', userId)
        );
        
        const snapshot = await getDocs(followupsQuery);
        followups = [];
        snapshot.forEach((doc) => {
            followups.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by date (descending - most recent first)
        followups.sort((a, b) => b.date.localeCompare(a.date));
        
        displayPendingFollowups();
        displayCompletedFollowups();
        displayAllFollowups();
    } catch (error) {
        console.error('Error loading follow-ups:', error);
    }
}

// Display pending follow-ups
function displayPendingFollowups() {
    const today = new Date().toISOString().split('T')[0];
    const pending = followups.filter(f => f.status === 'Pending' && f.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date));
    const container = document.getElementById('pendingFollowupsList');
    
    if (pending.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No pending follow-ups</p>';
        return;
    }
    
    container.innerHTML = '';
    pending.forEach(followup => {
        const date = new Date(followup.date);
        const dateStr = date.toLocaleDateString();
        const isOverdue = followup.date < today;
        
        const card = document.createElement('div');
        card.className = `card mb-2 followup-card ${isOverdue ? 'border-danger' : ''}`;
        card.innerHTML = `
            <div class="card-body p-3">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h6 class="card-title mb-0">${followup.patientName}</h6>
                    ${isOverdue ? '<span class="badge bg-danger">Overdue</span>' : ''}
                </div>
                <p class="card-text mb-1 small">
                    <i class="bi bi-calendar"></i> ${dateStr}
                </p>
                <p class="card-text mb-2 small">${followup.notes}</p>
                <div>
                    <button class="btn btn-sm btn-success me-1" onclick="completeFollowup('${followup.id}')">
                        <i class="bi bi-check"></i> Complete
                    </button>
                    <button class="btn btn-sm btn-primary me-1" onclick="editFollowup('${followup.id}')">
                        <i class="bi bi-pencil"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteFollowup('${followup.id}')">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Display completed follow-ups
function displayCompletedFollowups() {
    const completed = followups.filter(f => f.status === 'Completed')
        .sort((a, b) => b.date.localeCompare(a.date));
    const container = document.getElementById('completedFollowupsList');
    
    if (completed.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No completed follow-ups</p>';
        return;
    }
    
    container.innerHTML = '';
    completed.forEach(followup => {
        const date = new Date(followup.date);
        const dateStr = date.toLocaleDateString();
        
        const card = document.createElement('div');
        card.className = 'card mb-2 followup-card completed';
        card.innerHTML = `
            <div class="card-body p-3">
                <h6 class="card-title mb-1">${followup.patientName}</h6>
                <p class="card-text mb-1 small">
                    <i class="bi bi-calendar"></i> ${dateStr}
                </p>
                <p class="card-text mb-0 small">${followup.notes}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// Display all follow-ups in table
function displayAllFollowups() {
    const tableBody = document.getElementById('allFollowupsTable');
    
    if (followups.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No follow-ups found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = '';
    followups.forEach((followup) => {
        const row = document.createElement('tr');
        const date = new Date(followup.date);
        const dateStr = date.toLocaleDateString();
        
        let statusClass = 'bg-warning';
        if (followup.status === 'Completed') statusClass = 'bg-success';
        
        row.innerHTML = `
            <td>${dateStr}</td>
            <td>${followup.patientName}</td>
            <td>${followup.patientPhone || 'N/A'}</td>
            <td>${followup.notes}</td>
            <td><span class="badge ${statusClass}">${followup.status}</span></td>
            <td>
                <button class="btn btn-sm btn-primary me-1" onclick="editFollowup('${followup.id}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteFollowup('${followup.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Make functions global for onclick handlers
window.editFollowup = function(followupId) {
    const followup = followups.find(f => f.id === followupId);
    if (!followup) return;
    
    editingFollowupId = followupId;
    document.getElementById('followupId').value = followupId;
    
    // Set autocomplete values
    const patient = patients.find(p => p.id === followup.patientId);
    if (patient) {
        document.getElementById('followupPatient').value = patient.name;
        document.getElementById('followupPatientId').value = patient.id;
    }
    
    document.getElementById('followupDate').value = followup.date;
    document.getElementById('followupNotes').value = followup.notes || '';
    document.getElementById('followupStatus').value = followup.status;
    
    document.getElementById('followupModalTitle').textContent = 'Edit Follow-up';
    const modal = new bootstrap.Modal(document.getElementById('followupModal'));
    modal.show();
};

window.deleteFollowup = async function(followupId) {
    if (!confirm('Are you sure you want to delete this follow-up?')) return;
    
    try {
        await deleteDoc(doc(db, 'followups', followupId));
        loadFollowups();
    } catch (error) {
        console.error('Error deleting follow-up:', error);
        alert('Error deleting follow-up. Please try again.');
    }
};

window.completeFollowup = async function(followupId) {
    try {
        await updateDoc(doc(db, 'followups', followupId), {
            status: 'Completed',
            updatedAt: new Date().toISOString()
        });
        loadFollowups();
    } catch (error) {
        console.error('Error completing follow-up:', error);
        alert('Error completing follow-up. Please try again.');
    }
};

// Add/Edit follow-up form handler
document.getElementById('addFollowupBtn')?.addEventListener('click', () => {
    editingFollowupId = null;
    document.getElementById('followupForm').reset();
    document.getElementById('followupId').value = '';
    document.getElementById('followupPatientId').value = '';
    document.getElementById('followupStatus').value = 'Pending';
    document.getElementById('followupModalTitle').textContent = 'New Follow-up';
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('followupDate').value = today;
    
    // Hide suggestions
    document.getElementById('followupPatientSuggestions').classList.remove('show');
});

document.getElementById('saveFollowupBtn')?.addEventListener('click', async () => {
    const form = document.getElementById('followupForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const patientId = document.getElementById('followupPatientId').value;
    const patient = patients.find(p => p.id === patientId);
    
    if (!patient || !patientId) {
        alert('Please select a patient from the list');
        return;
    }
    
    // Prepare follow-up data - build differently for create vs update
    let followupData;
    
    if (editingFollowupId) {
        // UPDATE: Don't include createdAt
        followupData = {
            patientId: patientId,
            patientName: patient.name,
            patientPhone: patient.phone || '',
            date: document.getElementById('followupDate').value,
            notes: document.getElementById('followupNotes').value.trim(),
            status: document.getElementById('followupStatus').value,
            doctorId: auth.currentUser.uid,
            updatedAt: new Date().toISOString()
        };
    } else {
        // CREATE: Include createdAt
        followupData = {
            patientId: patientId,
            patientName: patient.name,
            patientPhone: patient.phone || '',
            date: document.getElementById('followupDate').value,
            notes: document.getElementById('followupNotes').value.trim(),
            status: document.getElementById('followupStatus').value,
            doctorId: auth.currentUser.uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }
    
    // Remove any undefined values (safety check)
    Object.keys(followupData).forEach(key => {
        if (followupData[key] === undefined) {
            delete followupData[key];
        }
    });
    
    console.log('Saving follow-up - editingFollowupId:', editingFollowupId);
    console.log('Follow-up data:', JSON.stringify(followupData, null, 2));
    
    try {
        if (editingFollowupId) {
            await updateDoc(doc(db, 'followups', editingFollowupId), followupData);
        } else {
            await addDoc(collection(db, 'followups'), followupData);
        }
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('followupModal'));
        modal.hide();
        form.reset();
        loadFollowups();
    } catch (error) {
        console.error('Error saving follow-up:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Follow-up data that failed:', followupData);
        alert(`Error saving follow-up: ${error.message || 'Please check the console for details'}`);
    }
});


// Patients Module
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

let patients = [];
let editingPatientId = null;

// Check authentication
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'index.html';
    } else {
        loadUserInfo();
        loadPatients();
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

// Load patients from Firestore
async function loadPatients() {
    try {
        const userId = auth.currentUser.uid;
        const patientsQuery = query(
            collection(db, 'patients'),
            where('doctorId', '==', userId),
            orderBy('name', 'asc')
        );
        
        const snapshot = await getDocs(patientsQuery);
        patients = [];
        snapshot.forEach((doc) => {
            patients.push({ id: doc.id, ...doc.data() });
        });
        
        displayPatients(patients);
    } catch (error) {
        console.error('Error loading patients:', error);
        document.getElementById('patientsTable').innerHTML = 
            '<tr><td colspan="7" class="text-center text-danger">Error loading patients</td></tr>';
    }
}

// Display patients in table
function displayPatients(patientsToShow) {
    const tableBody = document.getElementById('patientsTable');
    
    if (patientsToShow.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No patients found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = '';
    patientsToShow.forEach((patient) => {
        const row = document.createElement('tr');
        const lastVisit = patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'Never';
        
        row.innerHTML = `
            <td>${patient.name}</td>
            <td>${patient.age || 'N/A'}</td>
            <td>${patient.gender || 'N/A'}</td>
            <td>${patient.phone || 'N/A'}</td>
            <td>${patient.email || 'N/A'}</td>
            <td>${lastVisit}</td>
            <td>
                <button class="btn btn-sm btn-primary me-1" onclick="editPatient('${patient.id}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deletePatient('${patient.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Make functions global for onclick handlers
window.editPatient = function(patientId) {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;
    
    editingPatientId = patientId;
    document.getElementById('patientId').value = patientId;
    document.getElementById('patientName').value = patient.name || '';
    document.getElementById('patientAge').value = patient.age || '';
    document.getElementById('patientGender').value = patient.gender || '';
    document.getElementById('patientPhone').value = patient.phone || '';
    document.getElementById('patientEmail').value = patient.email || '';
    document.getElementById('patientAddress').value = patient.address || '';
    document.getElementById('patientMedicalHistory').value = patient.medicalHistory || '';
    
    document.getElementById('patientModalTitle').textContent = 'Edit Patient';
    const modal = new bootstrap.Modal(document.getElementById('patientModal'));
    modal.show();
};

window.deletePatient = async function(patientId) {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    
    try {
        await deleteDoc(doc(db, 'patients', patientId));
        loadPatients();
    } catch (error) {
        console.error('Error deleting patient:', error);
        alert('Error deleting patient. Please try again.');
    }
};

// Add/Edit patient form handler
document.getElementById('addPatientBtn')?.addEventListener('click', () => {
    editingPatientId = null;
    document.getElementById('patientForm').reset();
    document.getElementById('patientId').value = '';
    document.getElementById('patientModalTitle').textContent = 'Add New Patient';
});

document.getElementById('savePatientBtn')?.addEventListener('click', async () => {
    const form = document.getElementById('patientForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const patientData = {
        name: document.getElementById('patientName').value.trim(),
        age: parseInt(document.getElementById('patientAge').value),
        gender: document.getElementById('patientGender').value,
        phone: document.getElementById('patientPhone').value.trim(),
        email: document.getElementById('patientEmail').value.trim(),
        address: document.getElementById('patientAddress').value.trim(),
        medicalHistory: document.getElementById('patientMedicalHistory').value.trim(),
        doctorId: auth.currentUser.uid,
        createdAt: editingPatientId ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    try {
        if (editingPatientId) {
            // Update existing patient
            await updateDoc(doc(db, 'patients', editingPatientId), patientData);
        } else {
            // Add new patient
            await addDoc(collection(db, 'patients'), patientData);
        }
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('patientModal'));
        modal.hide();
        form.reset();
        loadPatients();
    } catch (error) {
        console.error('Error saving patient:', error);
        alert('Error saving patient. Please try again.');
    }
});

// Search functionality
document.getElementById('searchInput')?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        displayPatients(patients);
        return;
    }
    
    const filtered = patients.filter(patient => 
        patient.name?.toLowerCase().includes(searchTerm) ||
        patient.phone?.includes(searchTerm) ||
        patient.email?.toLowerCase().includes(searchTerm)
    );
    
    displayPatients(filtered);
});


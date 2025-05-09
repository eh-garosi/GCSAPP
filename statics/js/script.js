// Global Variables
const API_URL = 'http://localhost:5000/api';
let gcsChart = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set default language
    document.body.classList.add('lang-en');
    
    // Initialize navigation
    initNavigation();
    
    // Initialize language toggle
    initLanguageToggle();
    
    // Initialize page-specific functionality
    initHomePage();
    initPatientsPage();
    initCalculatorPage();
    initHistoryPage();
    
    // Load patients for dropdowns
    loadPatients();
}

// Mock Data Functions (for development without server)
// =================================================

// Mock patient data
const mockPatients = [
    {
        id: 1,
        name: 'John Doe',
        age: 45,
        gender: 'male',
        medical_history: 'Hypertension, Type 2 Diabetes',
        admission_date: '2025-05-01'
    },
    {
        id: 2,
        name: 'Jane Smith',
        age: 32,
        gender: 'female',
        medical_history: 'Head trauma from motor vehicle accident',
        admission_date: '2025-05-04'
    },
    {
        id: 3,
        name: 'Ahmad Rahimi',
        age: 56,
        gender: 'male',
        medical_history: 'Cerebral hemorrhage',
        admission_date: '2025-05-07'
    }
];

// Mock GCS scores
const mockGcsScores = {
    1: [
        {
            id: 1,
            patient_id: 1,
            timestamp: '2025-05-01T08:30:00.000Z',
            eye_score: 2,
            verbal_score: 3,
            motor_score: 4,
            total_score: 9,
            notes: 'Initial assessment after admission'
        },
        {
            id: 2,
            patient_id: 1,
            timestamp: '2025-05-02T08:30:00.000Z',
            eye_score: 3,
            verbal_score: 3,
            motor_score: 5,
            total_score: 11,
            notes: 'Improvement in responsiveness'
        },
        {
            id: 3,
            patient_id: 1,
            timestamp: '2025-05-03T08:30:00.000Z',
            eye_score: 3,
            verbal_score: 4,
            motor_score: 5,
            total_score: 12,
            notes: 'Continued improvement'
        }
    ],
    2: [
        {
            id: 4,
            patient_id: 2,
            timestamp: '2025-05-04T09:15:00.000Z',
            eye_score: 1,
            verbal_score: 2,
            motor_score: 3,
            total_score: 6,
            notes: 'Critical condition on admission'
        },
        {
            id: 5,
            patient_id: 2,
            timestamp: '2025-05-05T09:15:00.000Z',
            eye_score: 2,
            verbal_score: 2,
            motor_score: 4,
            total_score: 8,
            notes: 'Slight improvement in motor response'
        }
    ],
    3: [
        {
            id: 6,
            patient_id: 3,
            timestamp: '2025-05-07T10:00:00.000Z',
            eye_score: 3,
            verbal_score: 4,
            motor_score: 5,
            total_score: 12,
            notes: 'Admitted with moderate impairment'
        }
    ]
};

// Use mock patients (when server is not available)
function useMockPatients() {
    renderPatientsList(mockPatients);
    populatePatientDropdowns(mockPatients);
}

// Mock add patient
function mockAddPatient(patientData) {
    // Generate a new ID
    const newId = Math.max(...mockPatients.map(p => p.id)) + 1;
    
    // Create new patient with ID
    const newPatient = {
        id: newId,
        ...patientData
    };
    
    // Add to mock data
    mockPatients.push(newPatient);
    
    // Initialize empty scores array
    mockGcsScores[newId] = [];
    
    // Refresh UI
    renderPatientsList(mockPatients);
    populatePatientDropdowns(mockPatients);
    
    // Close modal
    document.getElementById('patient-modal').style.display = 'none';
    
    console.log('Added mock patient:', newPatient);
}

// Mock update patient
function mockUpdatePatient(patientId, patientData) {
    // Find patient index
    const index = mockPatients.findIndex(p => p.id == patientId);
    
    if (index !== -1) {
        // Update patient
        mockPatients[index] = {
            ...mockPatients[index],
            ...patientData
        };
        
        // Refresh UI
        renderPatientsList(mockPatients);
        populatePatientDropdowns(mockPatients);
        
        // Close modal
        document.getElementById('patient-modal').style.display = 'none';
        
        console.log('Updated mock patient:', mockPatients[index]);
    }
}

// Mock save GCS score
function mockSaveGcsScore(patientId, scoreData) {
    // Generate a new ID for the score
    let newId = 1;
    
    // Find highest ID across all scores
    Object.values(mockGcsScores).forEach(scores => {
        if (scores.length > 0) {
            const maxId = Math.max(...scores.map(s => s.id));
            if (maxId >= newId) {
                newId = maxId + 1;
            }
        }
    });
    
    // Create total score
    const totalScore = parseInt(scoreData.eye_score) + parseInt(scoreData.verbal_score) + parseInt(scoreData.motor_score);
    
    // Create new score object
    const newScore = {
        id: newId,
        patient_id: parseInt(patientId),
        timestamp: scoreData.timestamp,
        eye_score: parseInt(scoreData.eye_score),
        verbal_score: parseInt(scoreData.verbal_score),
        motor_score: parseInt(scoreData.motor_score),
        total_score: totalScore,
        notes: scoreData.notes
    };
    
    // Add to mock data
    if (!mockGcsScores[patientId]) {
        mockGcsScores[patientId] = [];
    }
    
    mockGcsScores[patientId].push(newScore);
    
    // Show success message
    alert(document.body.classList.contains('lang-en') 
        ? `GCS score saved successfully: ${totalScore}` 
        : `امتیاز GCS با موفقیت ذخیره شد: ${totalScore}`);
    
    // Reset calculator
    resetCalculator();
    
    console.log('Saved mock GCS score:', newScore);
}

// Mock load patient history
function mockLoadPatientHistory(patientId) {
    const historyContent = document.getElementById('history-content');
    const selectPatientMessage = document.querySelector('#history-content .select-patient-message');
    const noHistoryMessage = document.querySelector('.no-history-message');
    
    // Hide select patient message
    selectPatientMessage.style.display = 'none';
    
    // Get mock scores for this patient
    const scores = mockGcsScores[patientId] || [];
    
    // Show no history message if no data
    if (scores.length === 0) {
        noHistoryMessage.style.display = 'block';
        document.querySelector('.chart-container').style.display = 'none';
        document.querySelector('.history-table').style.display = 'none';
        return;
    }
    
    // Hide no history message, show chart and table
    noHistoryMessage.style.display = 'none';
    document.querySelector('.chart-container').style.display = 'block';
    document.querySelector('.history-table').style.display = 'block';
    
    // Create chart
    createGcsChart(scores);
    
    // Populate history table
    populateHistoryTable(scores);
    
    console.log('Loaded mock GCS history:', scores);
});

// Navigation
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons and pages
            navButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show corresponding page
            const pageName = this.getAttribute('data-page');
            document.getElementById(`${pageName}-page`).classList.add('active');
        });
    });
    
    // Home page buttons
    document.getElementById('start-calculator').addEventListener('click', function() {
        navigateTo('calculator');
    });
    
    document.getElementById('view-patients').addEventListener('click', function() {
        navigateTo('patients');
    });
}

function navigateTo(pageName) {
    // Remove active class from all buttons and pages
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    
    // Add active class to specific button
    document.querySelector(`.nav-btn[data-page="${pageName}"]`).classList.add('active');
    
    // Show corresponding page
    document.getElementById(`${pageName}-page`).classList.add('active');
}

// Language Toggle
function initLanguageToggle() {
    const enToggle = document.getElementById('en-toggle');
    const faToggle = document.getElementById('fa-toggle');
    
    enToggle.addEventListener('click', function() {
        document.body.classList.remove('lang-fa');
        document.body.classList.add('lang-en');
        enToggle.classList.add('active');
        faToggle.classList.remove('active');
    });
    
    faToggle.addEventListener('click', function() {
        document.body.classList.remove('lang-en');
        document.body.classList.add('lang-fa');
        faToggle.classList.add('active');
        enToggle.classList.remove('active');
    });
}

// Home Page
function initHomePage() {
    // No specific functionality needed for the home page
}

// Patients Page
function initPatientsPage() {
    const addPatientBtn = document.getElementById('add-patient-btn');
    const patientModal = document.getElementById('patient-modal');
    const closeBtn = patientModal.querySelector('.close');
    const cancelBtn = document.getElementById('cancel-patient');
    const patientForm = document.getElementById('patient-form');
    const patientSearch = document.getElementById('patient-search');
    
    // Open modal when Add Patient button is clicked
    addPatientBtn.addEventListener('click', function() {
        // Clear form
        patientForm.reset();
        document.getElementById('patient-id').value = '';
        
        // Update modal title
        document.getElementById('modal-title').textContent = 'Add New Patient';
        document.getElementById('modal-title-fa').textContent = 'افزودن بیمار جدید';
        
        // Set current date as default admission date
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('admission-date').value = today;
        
        // Show modal
        patientModal.style.display = 'block';
    });
    
    // Close modal when X is clicked
    closeBtn.addEventListener('click', function() {
        patientModal.style.display = 'none';
    });
    
    // Close modal when Cancel button is clicked
    cancelBtn.addEventListener('click', function() {
        patientModal.style.display = 'none';
    });
    
    // Close modal when clicking outside the content
    window.addEventListener('click', function(event) {
        if (event.target === patientModal) {
            patientModal.style.display = 'none';
        }
    });
    
    // Handle form submission
    patientForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Get form values
        const patientId = document.getElementById('patient-id').value;
        const name = document.getElementById('patient-name').value;
        const age = document.getElementById('patient-age').value;
        const gender = document.getElementById('patient-gender').value;
        const medicalHistory = document.getElementById('patient-history').value;
        const admissionDate = document.getElementById('admission-date').value;
        
        // Create patient object
        const patientData = {
            name,
            age: age ? parseInt(age) : '',
            gender,
            medical_history: medicalHistory,
            admission_date: admissionDate
        };
        
        // Determine if this is an add or update operation
        if (patientId) {
            // Update existing patient
            updatePatient(patientId, patientData);
        } else {
            // Add new patient
            addPatient(patientData);
        }
    });
    
    // Search functionality
    patientSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filterPatients(searchTerm);
    });
}

// Load all patients
async function loadPatients() {
    try {
        const response = await fetch(`${API_URL}/patients`);
        
        // Check if server is running, if not, use mock data for development
        if (!response.ok) {
            console.warn('Server not available, using mock data');
            return useMockPatients();
        }
        
        const patients = await response.json();
        renderPatientsList(patients);
        populatePatientDropdowns(patients);
    } catch (error) {
        console.error('Error loading patients:', error);
        useMockPatients();
    }
}

// Render patients in the patients list
function renderPatientsList(patients) {
    const patientsList = document.getElementById('patients-list');
    const noPatientMessage = document.querySelector('.no-patients-message');
    
    // Clear current list
    while (patientsList.firstChild) {
        if (patientsList.firstChild === noPatientMessage) {
            break;
        }
        patientsList.removeChild(patientsList.firstChild);
    }
    
    // Show message if no patients
    if (patients.length === 0) {
        noPatientMessage.style.display = 'block';
        return;
    }
    
    // Hide message if there are patients
    noPatientMessage.style.display = 'none';
    
    // Add patient cards
    patients.forEach(patient => {
        const patientCard = document.createElement('div');
        patientCard.className = 'patient-card';
        patientCard.dataset.id = patient.id;
        
        const admissionDate = new Date(patient.admission_date).toLocaleDateString();
        
        patientCard.innerHTML = `
            <div class="patient-name">${patient.name}</div>
            <div class="patient-details">
                <div><span class="en">Age:</span><span class="fa">سن:</span> ${patient.age || '-'}</div>
                <div><span class="en">Gender:</span><span class="fa">جنسیت:</span> 
                    <span class="en">${formatGender(patient.gender, 'en')}</span>
                    <span class="fa">${formatGender(patient.gender, 'fa')}</span>
                </div>
                <div><span class="en">Admitted:</span><span class="fa">تاریخ پذیرش:</span> ${admissionDate}</div>
            </div>
            <div class="patient-actions">
                <button class="btn secondary edit-patient">
                    <i class="fas fa-edit"></i>
                    <span class="en">Edit</span>
                    <span class="fa">ویرایش</span>
                </button>
                <button class="btn primary calculate-gcs">
                    <i class="fas fa-calculator"></i>
                    <span class="en">GCS</span>
                    <span class="fa">GCS</span>
                </button>
            </div>
        `;
        
        patientsList.insertBefore(patientCard, noPatientMessage);
        
        // Add event listeners to card buttons
        patientCard.querySelector('.edit-patient').addEventListener('click', function() {
            editPatient(patient);
        });
        
        patientCard.querySelector('.calculate-gcs').addEventListener('click', function() {
            navigateTo('calculator');
            document.getElementById('selected-patient').value = patient.id;
            loadCalculator();
        });
    });
}

// Filter patients based on search term
function filterPatients(searchTerm) {
    const patientCards = document.querySelectorAll('.patient-card');
    
    patientCards.forEach(card => {
        const patientName = card.querySelector('.patient-name').textContent.toLowerCase();
        
        if (patientName.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Format gender for display
function formatGender(gender, language) {
    if (language === 'en') {
        return gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : 'Other';
    } else {
        return gender === 'male' ? 'مرد' : gender === 'female' ? 'زن' : 'سایر';
    }
}

// Populate patient dropdowns
function populatePatientDropdowns(patients) {
    const calculatorDropdown = document.getElementById('selected-patient');
    const historyDropdown = document.getElementById('history-patient');
    
    // Clear existing options except the placeholder
    while (calculatorDropdown.options.length > 1) {
        calculatorDropdown.remove(1);
    }
    
    while (historyDropdown.options.length > 1) {
        historyDropdown.remove(1);
    }
    
    // Add patient options
    patients.forEach(patient => {
        // For calculator dropdown
        const calcOption = document.createElement('option');
        calcOption.value = patient.id;
        calcOption.textContent = patient.name;
        calculatorDropdown.appendChild(calcOption);
        
        // For history dropdown
        const histOption = document.createElement('option');
        histOption.value = patient.id;
        histOption.textContent = patient.name;
        historyDropdown.appendChild(histOption);
    });
}

// Add a new patient
async function addPatient(patientData) {
    try {
        const response = await fetch(`${API_URL}/patients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(patientData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to add patient');
        }
        
        const result = await response.json();
        
        // Reload patients
        loadPatients();
        
        // Close modal
        document.getElementById('patient-modal').style.display = 'none';
        
    } catch (error) {
        console.error('Error adding patient:', error);
        // For demo/development without server
        mockAddPatient(patientData);
    }
}

// Update an existing patient
async function updatePatient(patientId, patientData) {
    try {
        const response = await fetch(`${API_URL}/patients/${patientId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(patientData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update patient');
        }
        
        // Reload patients
        loadPatients();
        
        // Close modal
        document.getElementById('patient-modal').style.display = 'none';
        
    } catch (error) {
        console.error('Error updating patient:', error);
        // For demo/development without server
        mockUpdatePatient(patientId, patientData);
    }
}

// Edit patient (opens modal with data)
function editPatient(patient) {
    // Fill form with patient data
    document.getElementById('patient-id').value = patient.id;
    document.getElementById('patient-name').value = patient.name;
    document.getElementById('patient-age').value = patient.age || '';
    document.getElementById('patient-gender').value = patient.gender || 'male';
    document.getElementById('patient-history').value = patient.medical_history || '';
    document.getElementById('admission-date').value = patient.admission_date || '';
    
    // Update modal title
    document.getElementById('modal-title').textContent = 'Edit Patient';
    document.getElementById('modal-title-fa').textContent = 'ویرایش بیمار';
    
    // Show modal
    document.getElementById('patient-modal').style.display = 'block';
}

// Calculator Page
function initCalculatorPage() {
    const selectedPatient = document.getElementById('selected-patient');
    const calculatorContent = document.getElementById('calculator-content');
    const eyeScoreInputs = document.querySelectorAll('input[name="eye-score"]');
    const verbalScoreInputs = document.querySelectorAll('input[name="verbal-score"]');
    const motorScoreInputs = document.querySelectorAll('input[name="motor-score"]');
    const saveScoreBtn = document.getElementById('save-score-btn');
    const resetCalculatorBtn = document.getElementById('reset-calculator-btn');
    
    // Patient selection change
    selectedPatient.addEventListener('change', loadCalculator);
    
    // Score inputs change
    [...eyeScoreInputs, ...verbalScoreInputs, ...motorScoreInputs].forEach(input => {
        input.addEventListener('change', calculateTotalScore);
    });
    
    // Save score button
    saveScoreBtn.addEventListener('click', saveGcsScore);
    
    // Reset calculator button
    resetCalculatorBtn.addEventListener('click', resetCalculator);
}

// Load calculator based on selected patient
function loadCalculator() {
    const selectedPatient = document.getElementById('selected-patient');
    const calculatorContent = document.getElementById('calculator-content');
    const selectPatientMessage = document.querySelector('.select-patient-message');
    
    if (selectedPatient.value) {
        // Hide message, show calculator
        selectPatientMessage.style.display = 'none';
    } else {
        // Show message, hide calculator
        selectPatientMessage.style.display = 'flex';
    }
    
    // Reset calculator
    resetCalculator();
}

// Calculate total GCS score
function calculateTotalScore() {
    const eyeScore = getSelectedRadioValue('eye-score');
    const verbalScore = getSelectedRadioValue('verbal-score');
    const motorScore = getSelectedRadioValue('motor-score');
    
    // Update component displays
    document.getElementById('eye-result').textContent = eyeScore ? `E${eyeScore}` : 'E?';
    document.getElementById('verbal-result').textContent = verbalScore ? `V${verbalScore}` : 'V?';
    document.getElementById('motor-result').textContent = motorScore ? `M${motorScore}` : 'M?';
    
    // Calculate total if all components are selected
    if (eyeScore && verbalScore && motorScore) {
        const totalScore = parseInt(eyeScore) + parseInt(verbalScore) + parseInt(motorScore);
        document.getElementById('total-score').textContent = totalScore;
        
        // Update interpretation
        updateInterpretation(totalScore);
        
        // Enable save button
        document.getElementById('save-score-btn').disabled = false;
    } else {
        document.getElementById('total-score').textContent = '--';
        document.getElementById('score-interpretation').textContent = '--';
        document.getElementById('save-score-btn').disabled = true;
    }
}

// Get selected radio value
function getSelectedRadioValue(name) {
    const selectedRadio = document.querySelector(`input[name="${name}"]:checked`);
    return selectedRadio ? selectedRadio.value : null;
}

// Update score interpretation
function updateInterpretation(totalScore) {
    const interpretationElement = document.getElementById('score-interpretation');
    const isEnglish = document.body.classList.contains('lang-en');
    
    if (totalScore >= 13) {
        interpretationElement.textContent = isEnglish ? 'Mild brain injury' : 'آسیب مغزی خفیف';
        interpretationElement.style.color = '#48bb78'; // Green
    } else if (totalScore >= 9) {
        interpretationElement.textContent = isEnglish ? 'Moderate brain injury' : 'آسیب مغزی متوسط';
        interpretationElement.style.color = '#ed8936'; // Orange
    } else {
        interpretationElement.textContent = isEnglish ? 'Severe brain injury' : 'آسیب مغزی شدید';
        interpretationElement.style.color = '#e53e3e'; // Red
    }
}

// Save GCS score
async function saveGcsScore() {
    const patientId = document.getElementById('selected-patient').value;
    const eyeScore = getSelectedRadioValue('eye-score');
    const verbalScore = getSelectedRadioValue('verbal-score');
    const motorScore = getSelectedRadioValue('motor-score');
    const notes = document.getElementById('gcs-notes').value;
    
    const scoreData = {
        eye_score: eyeScore,
        verbal_score: verbalScore,
        motor_score: motorScore,
        notes: notes,
        timestamp: new Date().toISOString()
    };
    
    try {
        const response = await fetch(`${API_URL}/patients/${patientId}/scores`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(scoreData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save GCS score');
        }
        
        const result = await response.json();
        
        // Show success message
        alert(document.body.classList.contains('lang-en') 
            ? `GCS score saved successfully: ${result.total_score}` 
            : `امتیاز GCS با موفقیت ذخیره شد: ${result.total_score}`);
        
        // Reset calculator
        resetCalculator();
        
    } catch (error) {
        console.error('Error saving GCS score:', error);
        // For demo/development without server
        mockSaveGcsScore(patientId, scoreData);
    }
}

// Reset calculator
function resetCalculator() {
    // Uncheck all radio buttons
    document.querySelectorAll('input[name="eye-score"]').forEach(input => {
        input.checked = false;
    });
    
    document.querySelectorAll('input[name="verbal-score"]').forEach(input => {
        input.checked = false;
    });
    
    document.querySelectorAll('input[name="motor-score"]').forEach(input => {
        input.checked = false;
    });
    
    // Clear notes
    document.getElementById('gcs-notes').value = '';
    
    // Reset displays
    document.getElementById('eye-result').textContent = 'E?';
    document.getElementById('verbal-result').textContent = 'V?';
    document.getElementById('motor-result').textContent = 'M?';
    document.getElementById('total-score').textContent = '--';
    document.getElementById('score-interpretation').textContent = '--';
    
    // Disable save button
    document.getElementById('save-score-btn').disabled = true;
}

// History Page
function initHistoryPage() {
    const historyPatient = document.getElementById('history-patient');
    
    // Patient selection change
    historyPatient.addEventListener('change', loadPatientHistory);
}

// Load patient history
async function loadPatientHistory() {
    const patientId = document.getElementById('history-patient').value;
    const historyContent = document.getElementById('history-content');
    const selectPatientMessage = document.querySelector('#history-content .select-patient-message');
    const noHistoryMessage = document.querySelector('.no-history-message');
    
    if (!patientId) {
        selectPatientMessage.style.display = 'flex';
        return;
    }
    
    // Hide message, prepare to show content
    selectPatientMessage.style.display = 'none';
    
    try {
        const response = await fetch(`${API_URL}/patients/${patientId}/trends`);
        
        if (!response.ok) {
            throw new Error('Failed to load GCS trends');
        }
        
        const trends = await response.json();
        
        // Show no history message if no data
        if (trends.length === 0) {
            noHistoryMessage.style.display = 'block';
            document.querySelector('.chart-container').style.display = 'none';
            document.querySelector('.history-table').style.display = 'none';
            return;
        }
        
        // Hide no history message, show chart and table
        noHistoryMessage.style.display = 'none';
        document.querySelector('.chart-container').style.display = 'block';
        document.querySelector('.history-table').style.display = 'block';
        
        // Create chart
        createGcsChart(trends);
        
        // Populate history table
        populateHistoryTable(trends);
        
    } catch (error) {
        console.error('Error loading GCS trends:', error);
        // For demo/development without server
        mockLoadPatientHistory(patientId);
    }
}

// Create GCS chart
function createGcsChart(data) {
    const ctx = document.getElementById('gcs-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (gcsChart) {
        gcsChart.destroy();
    }
    
    // Prepare data for chart
    const labels = data.map(item => {
        const date = new Date(item.timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });
    
    const totalScores = data.map(item => item.total_score);
    const eyeScores = data.map(item => item.eye_score);
    const verbalScores = data.map(item => item.verbal_score);
    const motorScores = data.map(item => item.motor_score);
    
    // Create new chart
    gcsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Total GCS',
                    data: totalScores,
                    backgroundColor: 'rgba(74, 85, 175, 0.2)',
                    borderColor: 'rgba(74, 85, 175, 1)',
                    borderWidth: 2,
                    tension: 0.1
                },
                {
                    label: 'Eye (E)',
                    data: eyeScores,
                    backgroundColor: 'rgba(72, 187, 120, 0.2)',
                    borderColor: 'rgba(72, 187, 120, 1)',
                    borderWidth: 2,
                    tension: 0.1
                },
                {
                    label: 'Verbal (V)',
                    data: verbalScores,
                    backgroundColor: 'rgba(237, 137, 54, 0.2)',
                    borderColor: 'rgba(237, 137, 54, 1)',
                    borderWidth: 2,
                    tension: 0.1
                },
                {
                    label: 'Motor (M)',
                    data: motorScores,
                    backgroundColor: 'rgba(229, 62, 62, 0.2)',
                    borderColor: 'rgba(229, 62, 62, 1)',
                    borderWidth: 2,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 15,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Populate history table
function populateHistoryTable(data) {
    const tableBody = document.querySelector('#history-table tbody');
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add rows in reverse order (newest first)
    [...data].reverse().forEach(item => {
        const row = document.createElement('tr');
        const date = new Date(item.timestamp);
        const dateTimeString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        row.innerHTML = `
            <td>${dateTimeString}</td>
            <td>${item.eye_score}</td>
            <td>${item.verbal_score}</td>
            <td>${item.motor_score}</td>
            <td>${item.total_score}</td>
            <td>${item.notes || '-'}</td>
        `;
        
        tableBody.appendChild(row);
    });
}
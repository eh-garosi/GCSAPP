// Global Variables
const API_URL = 'http://localhost:5000/api';
let gcsChart = null;
let patientsList = [];
let mockPatientId = 1;
let mockScoreId = 1;

// Mock database for offline development
const mockDb = {
    patients: [],
    scores: []
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Application initialized');
    
    // Initialize navigation
    initNavigation();
    
    // Initialize page-specific functionality
    initHomePage();
    initPatientsPage();
    initCalculatorPage();
    initHistoryPage();
    initGuidePage();
    
    // Initialize modals
    initModals();
    
    // Load patients data
    loadPatients();
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
    
    // Quick action buttons
    document.getElementById('add-patient-action')?.addEventListener('click', function() {
        navigateTo('patients');
        openAddPatientModal();
    });
    
    document.getElementById('new-assessment-action')?.addEventListener('click', function() {
        navigateTo('calculator');
    });
    
    document.getElementById('view-reports-action')?.addEventListener('click', function() {
        navigateTo('history');
    });
}

function navigateTo(pageName) {
    // Simulate click on navigation button
    document.querySelector(`.nav-btn[data-page="${pageName}"]`).click();
}

// Home Page
function initHomePage() {
    // Add first patient button
    document.querySelector('.add-first-patient')?.addEventListener('click', function() {
        openAddPatientModal();
    });
}

// Patients Page
function initPatientsPage() {
    const addPatientBtn = document.getElementById('add-patient-btn');
    const patientForm = document.getElementById('patient-form');
    const patientSearch = document.getElementById('patient-search');
    
    // Open modal when Add Patient button is clicked
    addPatientBtn?.addEventListener('click', function() {
        openAddPatientModal();
    });
    
    // Handle form submission
    patientForm?.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Get form values
        const patientId = document.getElementById('patient-id').value;
        const name = document.getElementById('patient-name').value;
        const age = document.getElementById('patient-age').value;
        const gender = document.getElementById('patient-gender').value;
        const department = document.getElementById('patient-department').value;
        const bedNumber = document.getElementById('bed-number').value;
        const medicalHistory = document.getElementById('patient-history').value;
        const diagnosis = document.getElementById('patient-diagnosis').value;
        const admissionDate = document.getElementById('admission-date').value;
        
        // Create patient object
        const patientData = {
            name,
            age: age ? parseInt(age) : null,
            gender,
            department,
            bed_number: bedNumber,
            medical_history: medicalHistory,
            diagnosis,
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
    patientSearch?.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filterPatients(searchTerm);
    });
}

// Open Add Patient Modal
function openAddPatientModal() {
    // Clear form
    const patientForm = document.getElementById('patient-form');
    patientForm.reset();
    document.getElementById('patient-id').value = '';
    
    // Set current date as default admission date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('admission-date').value = today;
    
    // Update modal title
    document.getElementById('modal-title').textContent = 'افزودن بیمار جدید';
    
    // Show modal
    const patientModal = document.getElementById('patient-modal');
    patientModal.style.display = 'block';
}

// Initialize Modals
function initModals() {
    // Get all close buttons
    const closeButtons = document.querySelectorAll('.close');
    
    // Add click event to all close buttons
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Find parent modal
            const modal = this.closest('.modal');
            modal.style.display = 'none';
        });
    });
    
    // Close modals when clicking outside content
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // Cancel patient button
    document.getElementById('cancel-patient')?.addEventListener('click', function() {
        document.getElementById('patient-modal').style.display = 'none';
    });
    
    // Help modal
    document.querySelectorAll('.help-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const helpType = this.getAttribute('data-help');
            openHelpModal(helpType);
        });
    });
    
    // Close help button
    document.getElementById('close-help-btn')?.addEventListener('click', function() {
        document.getElementById('help-modal').style.display = 'none';
    });
}

// Open Help Modal
function openHelpModal(helpType) {
    // Show the relevant help section, hide others
    document.querySelectorAll('.help-section').forEach(section => {
        section.style.display = 'none';
    });
    
    document.getElementById(`${helpType}-help`).style.display = 'block';
    
    // Show modal
    document.getElementById('help-modal').style.display = 'block';
}

// Calculator Page
function initCalculatorPage() {
    const selectedPatient = document.getElementById('selected-patient');
    const saveGcsBtn = document.getElementById('save-gcs-btn');
    const resetGcsBtn = document.getElementById('reset-gcs-btn');
    const backToPatientBtn = document.getElementById('back-to-patient-btn');
    
    // Patient selection change
    selectedPatient?.addEventListener('change', loadCalculator);
    
    // Radio buttons for GCS components
    document.querySelectorAll('.radio-option').forEach(option => {
        option.addEventListener('click', function() {
            // Find radio input within this option and select it
            const radioInput = this.querySelector('input[type="radio"]');
            radioInput.checked = true;
            
            // Calculate scores
            calculateTotalScore();
        });
    });
    
    // Save GCS score button
    saveGcsBtn?.addEventListener('click', saveGcsScore);
    
    // Reset calculator button
    resetGcsBtn?.addEventListener('click', resetGcsCalculator);
    
    // Back to patient button
    backToPatientBtn?.addEventListener('click', function() {
        navigateTo('patients');
    });
    initImageGcsOptions();
    initHelpModal();
}

// Initialize GCS image options
function initImageGcsOptions() {
    const imageOptions = document.querySelectorAll('.image-option');

    imageOptions.forEach(option => {
        option.addEventListener('click', function () {
            const component = this.getAttribute('data-component');
            const score = this.getAttribute('data-score');

            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;

            document.querySelectorAll(`.image-option[data-component="${component}"]`).forEach(opt => {
                opt.classList.remove('selected');
            });

            this.classList.add('selected');
            updateComponentScore(component, score);
            calculateTotalScore();
        });
    });

    document.querySelectorAll('.option-image img, .help-image img').forEach(img => {
        img.addEventListener('error', function () {
            console.warn(`Failed to load image: ${this.src}`);
        });
    });
}

function updateComponentScore(component, score) {
    const scoreElement = document.getElementById(`${component}-score`);
    if (scoreElement) {
        scoreElement.textContent = score;
    }
}

function initHelpModal() {
    const helpButtons = document.querySelectorAll('.help-btn');

    helpButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const helpType = this.getAttribute('data-help');
            document.querySelectorAll('.help-section').forEach(section => {
                section.style.display = 'none';
            });

            const helpSection = document.getElementById(`${helpType}-help`);
            if (helpSection) helpSection.style.display = 'block';

            document.getElementById('help-modal').style.display = 'block';
        });
    });

    const closeHelpBtn = document.getElementById('close-help-btn');
    if (closeHelpBtn) {
        closeHelpBtn.addEventListener('click', function () {
            document.getElementById('help-modal').style.display = 'none';
        });
    }
}


// History Page
function initHistoryPage() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all tab buttons and content
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab button and content
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Generate report button
    document.getElementById('generate-report-btn')?.addEventListener('click', function() {
        generateReport();
    });
}

// Guide Page
function initGuidePage() {
    // No specific functionality needed
}

// Load all patients
async function loadPatients() {
    try {
        const response = await fetch(`${API_URL}/patients`);
        
        if (!response.ok) {
            throw new Error('Server not available, using mock data');
        }
        
        const patients = await response.json();
        patientsList = patients;
        
        renderPatientsList(patients);
        populatePatientDropdowns(patients);
        updateDashboardStats();
        
    } catch (error) {
        console.warn('Using mock data:', error);
        // Use mock data if server not available
        useMockData();
    }
}

// Use mock data for development without server
function useMockData() {
    // Create some mock patients if none exist
    if (mockDb.patients.length === 0) {
        mockDb.patients = [
            {
                id: 1,
                name: 'علی محمدی',
                age: 45,
                gender: 'male',
                department: 'neurology',
                bed_number: 'N-12',
                medical_history: 'سابقه فشار خون بالا، تصادف با وسیله نقلیه موتوری',
                diagnosis: 'آسیب تروماتیک مغزی',
                admission_date: '2025-05-01'
            },
            {
                id: 2,
                name: 'زهرا کریمی',
                age: 32,
                gender: 'female',
                department: 'emergency',
                bed_number: 'E-05',
                medical_history: 'سقوط از ارتفاع',
                diagnosis: 'خونریزی زیر عنکبوتیه',
                admission_date: '2025-05-04'
            },
            {
                id: 3,
                name: 'محمد رضایی',
                age: 67,
                gender: 'male',
                department: 'icu',
                bed_number: 'ICU-03',
                medical_history: 'سکته مغزی قبلی، دیابت نوع 2',
                diagnosis: 'خونریزی داخل مغزی',
                admission_date: '2025-05-07'
            }
        ];
        
        // Create some mock GCS scores
        mockDb.scores = [
            {
                id: 1,
                patient_id: 1,
                timestamp: '2025-05-01T08:30:00',
                eye_score: 2,
                verbal_score: 3,
                motor_score: 4,
                total_score: 9,
                notes: 'ارزیابی اولیه پس از پذیرش'
            },
            {
                id: 2,
                patient_id: 1,
                timestamp: '2025-05-02T08:30:00',
                eye_score: 3,
                verbal_score: 3,
                motor_score: 5,
                total_score: 11,
                notes: 'بهبود در پاسخگویی'
            },
            {
                id: 3,
                patient_id: 1,
                timestamp: '2025-05-03T08:30:00',
                eye_score: 3,
                verbal_score: 4,
                motor_score: 5,
                total_score: 12,
                notes: 'بهبود مداوم'
            },
            {
                id: 4,
                patient_id: 2,
                timestamp: '2025-05-04T09:15:00',
                eye_score: 1,
                verbal_score: 2,
                motor_score: 3,
                total_score: 6,
                notes: 'وضعیت بحرانی در زمان پذیرش'
            },
            {
                id: 5,
                patient_id: 2,
                timestamp: '2025-05-05T09:15:00',
                eye_score: 2,
                verbal_score: 2,
                motor_score: 4,
                total_score: 8,
                notes: 'بهبود جزئی در پاسخ حرکتی'
            },
            {
                id: 6,
                patient_id: 3,
                timestamp: '2025-05-07T10:00:00',
                eye_score: 3,
                verbal_score: 4,
                motor_score: 5,
                total_score: 12,
                notes: 'پذیرش با اختلال متوسط'
            }
        ];
    }
    
    // Use mock data for UI
    patientsList = mockDb.patients;
    renderPatientsList(mockDb.patients);
    populatePatientDropdowns(mockDb.patients);
    updateDashboardStats();
}

// Render patients in the list
function renderPatientsList(patients) {
    const patientsList = document.getElementById('patients-list');
    const noPatientMessage = document.querySelector('.no-patients-message');
    
    if (!patientsList) return;
    
    // Clear current list except no-patients-message
    const itemsToRemove = [];
    for (let i = 0; i < patientsList.children.length; i++) {
        if (!patientsList.children[i].classList.contains('no-patients-message')) {
            itemsToRemove.push(patientsList.children[i]);
        }
    }
    
    itemsToRemove.forEach(item => item.remove());
    
    // Show message if no patients
    if (patients.length === 0) {
        if (noPatientMessage) noPatientMessage.style.display = 'flex';
        return;
    }
    
    // Hide message if there are patients
    if (noPatientMessage) noPatientMessage.style.display = 'none';
    
    // Add patient cards
    patients.forEach(patient => {
        const patientCard = document.createElement('div');
        patientCard.className = 'patient-card';
        patientCard.dataset.id = patient.id;
        
        // Get latest GCS score for this patient
        const latestScore = getLatestGcsScore(patient.id);
        let severityClass = '';
        
        if (latestScore) {
            if (latestScore.total_score <= 8) {
                severityClass = 'severe';
            } else if (latestScore.total_score <= 12) {
                severityClass = 'moderate';
            } else {
                severityClass = 'mild';
            }
            patientCard.classList.add(severityClass);
        }
        
        const admissionDate = new Date(patient.admission_date).toLocaleDateString('fa-IR');
        
        patientCard.innerHTML = `
            <div class="patient-name">${patient.name}</div>
            <div class="patient-details">
                <div>شناسه: ${patient.id}</div>
                <div>سن: ${patient.age || '-'}</div>
                <div>جنسیت: ${formatGender(patient.gender)}</div>
                <div>بخش: ${formatDepartment(patient.department)}</div>
                <div>تاریخ پذیرش: ${admissionDate}</div>
            </div>
            <div class="patient-actions">
                <button class="btn secondary edit-patient">
                    <i class="fas fa-edit"></i>
                    <span>ویرایش</span>
                </button>
                <button class="btn primary calc-gcs">
                    <i class="fas fa-calculator"></i>
                    <span>ارزیابی GCS</span>
                </button>
            </div>
        `;
        
        patientsList.insertBefore(patientCard, noPatientMessage);
        
        // Add event listeners to card buttons
        patientCard.querySelector('.edit-patient').addEventListener('click', function() {
            editPatient(patient);
        });
        
        patientCard.querySelector('.calc-gcs').addEventListener('click', function() {
            navigateTo('calculator');
            document.getElementById('selected-patient').value = patient.id;
            loadCalculator();
        });
    });
    
    // Update also the dashboard recent patients
    updateRecentPatients(patients.slice(0, 3));
}

// Format gender for display
function formatGender(gender) {
    return gender === 'male' ? 'مرد' : gender === 'female' ? 'زن' : 'سایر';
}

// Format department for display
function formatDepartment(department) {
    switch (department) {
        case 'emergency': return 'اورژانس';
        case 'neurology': return 'نورولوژی';
        case 'icu': return 'آی سی یو';
        default: return 'سایر';
    }
}

// Update recent patients on dashboard
function updateRecentPatients(patients) {
    const recentPatientsList = document.querySelector('.recent-patients-list');
    const noDataMessage = recentPatientsList?.querySelector('.no-data-message');
    
    if (!recentPatientsList) return;
    
    // Clear current list except no-data-message
    const itemsToRemove = [];
    for (let i = 0; i < recentPatientsList.children.length; i++) {
        if (!recentPatientsList.children[i].classList.contains('no-data-message')) {
            itemsToRemove.push(recentPatientsList.children[i]);
        }
    }
    
    itemsToRemove.forEach(item => item.remove());
    
    // Show message if no patients
    if (patients.length === 0) {
        if (noDataMessage) noDataMessage.style.display = 'flex';
        return;
    }
    
    // Hide message if there are patients
    if (noDataMessage) noDataMessage.style.display = 'none';
    
    // Add recent patient items
    patients.forEach(patient => {
        const admissionDate = new Date(patient.admission_date).toLocaleDateString('fa-IR');
        const patientItem = document.createElement('div');
        patientItem.className = 'recent-patient-item';
        
        patientItem.innerHTML = `
            <div class="recent-patient-name">${patient.name}</div>
            <div class="recent-patient-info">
                <span>${formatDepartment(patient.department)}</span>
                <span>•</span>
                <span>تخت ${patient.bed_number || '-'}</span>
                <span>•</span>
                <span>پذیرش: ${admissionDate}</span>
            </div>
        `;
        
        recentPatientsList.insertBefore(patientItem, noDataMessage);
    });
}

// Update dashboard statistics
function updateDashboardStats() {
    // Update total patients count
    const totalPatientsElement = document.getElementById('total-patients');
    if (totalPatientsElement) {
        totalPatientsElement.textContent = patientsList.length;
    }
    
    // Count today's assessments
    const todayAssessmentsElement = document.getElementById('today-assessments');
    if (todayAssessmentsElement) {
        const today = new Date().toISOString().split('T')[0];
        let todayAssessments = 0;
        
        if (mockDb.scores && mockDb.scores.length > 0) {
            todayAssessments = mockDb.scores.filter(score => {
                return score.timestamp.startsWith(today);
            }).length;
        }
        
        todayAssessmentsElement.textContent = todayAssessments;
    }
    
    // Count critical patients (GCS <= 8)
    const criticalPatientsElement = document.getElementById('critical-patients');
    if (criticalPatientsElement) {
        let criticalCount = 0;
        
        patientsList.forEach(patient => {
            const latestScore = getLatestGcsScore(patient.id);
            if (latestScore && latestScore.total_score <= 8) {
                criticalCount++;
            }
        });
        
        criticalPatientsElement.textContent = criticalCount;
    }
}

// Filter patients based on search term
function filterPatients(searchTerm) {
    const patientCards = document.querySelectorAll('.patient-card');
    
    patientCards.forEach(card => {
        const patientName = card.querySelector('.patient-name').textContent.toLowerCase();
        const patientDetails = card.querySelector('.patient-details').textContent.toLowerCase();
        
        if (patientName.includes(searchTerm) || patientDetails.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Populate patient dropdowns
function populatePatientDropdowns(patients) {
    const calculatorDropdown = document.getElementById('selected-patient');
    
    if (!calculatorDropdown) return;
    
    // Clear existing options except the placeholder
    while (calculatorDropdown.options.length > 1) {
        calculatorDropdown.remove(1);
    }
    
    // Add patient options
    patients.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.id;
        option.textContent = `${patient.name} (${patient.id})`;
        calculatorDropdown.appendChild(option);
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
    document.getElementById('patient-department').value = patient.department || 'emergency';
    document.getElementById('bed-number').value = patient.bed_number || '';
    document.getElementById('patient-history').value = patient.medical_history || '';
    document.getElementById('patient-diagnosis').value = patient.diagnosis || '';
    document.getElementById('admission-date').value = patient.admission_date || '';
    
    // Update modal title
    document.getElementById('modal-title').textContent = 'ویرایش بیمار';
    
    // Show modal
    document.getElementById('patient-modal').style.display = 'block';
}

// Load calculator based on selected patient
function loadCalculator() {
    const selectedPatient = document.getElementById('selected-patient');
    const selectedPatientInfo = document.getElementById('selected-patient-info');
    
    if (!selectedPatient || !selectedPatientInfo) return;
    
    if (selectedPatient.value) {
        const patientId = selectedPatient.value;
        const patient = patientsList.find(p => p.id == patientId);
        
        if (patient) {
            // Show patient info
            selectedPatientInfo.innerHTML = `
                <div><strong>${patient.name}</strong></div>
                <div>سن: ${patient.age || '-'} | بخش: ${formatDepartment(patient.department)} | تخت: ${patient.bed_number || '-'}</div>
            `;
            selectedPatientInfo.style.display = 'block';
        }
    } else {
        // Hide patient info if no patient selected
        selectedPatientInfo.style.display = 'none';
    }
    
    // Reset calculator
    resetGcsCalculator();
}

// Calculate total GCS score

function calculateTotalScore() {
    const eyeScore = getSelectedRadioValue('eye-score');
    const verbalScore = getSelectedRadioValue('verbal-score');
    const motorScore = getSelectedRadioValue('motor-score');

    if (eyeScore && verbalScore && motorScore) {
        const totalScore = parseInt(eyeScore) + parseInt(verbalScore) + parseInt(motorScore);
        document.getElementById('total-score').textContent = totalScore;
        updateInterpretation(totalScore);
        document.getElementById('save-gcs-btn').disabled = false;
    } else {
        document.getElementById('total-score').textContent = '--';
        document.getElementById('score-interpretation').textContent = '--';
        document.getElementById('save-gcs-btn').disabled = true;
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
    
    if (totalScore >= 13) {
        interpretationElement.textContent = 'آسیب مغزی خفیف';
        interpretationElement.style.color = 'var(--mild-color)';
    } else if (totalScore >= 9) {
        interpretationElement.textContent = 'آسیب مغزی متوسط';
        interpretationElement.style.color = 'var(--moderate-color)';
    } else {
        interpretationElement.textContent = 'آسیب مغزی شدید';
        interpretationElement.style.color = 'var(--severe-color)';
    }
}

// Save GCS score
async function saveGcsScore() {
    const patientId = document.getElementById('selected-patient').value;
    
    if (!patientId) {
        alert('لطفاً ابتدا یک بیمار را انتخاب کنید');
        return;
    }
    
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
        alert(`امتیاز GCS با موفقیت ذخیره شد: ${result.total_score}`);
        
        // Reset calculator
        resetGcsCalculator();
        
    } catch (error) {
        console.error('Error saving GCS score:', error);
        // For demo/development without server
        mockSaveGcsScore(patientId, scoreData);
    }
}

// Reset GCS calculator

function resetGcsCalculator() {
    document.querySelectorAll('input[type="radio"]').forEach(input => input.checked = false);
    document.querySelectorAll('.image-option').forEach(option => option.classList.remove('selected'));

    const scoreElements = ['eye-score', 'verbal-score', 'motor-score'];
    scoreElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '-';
    });

    document.getElementById('total-score').textContent = '--';
    document.getElementById('score-interpretation').textContent = '--';

    const notesField = document.getElementById('gcs-notes');
    if (notesField) notesField.value = '';

    const saveBtn = document.getElementById('save-gcs-btn');
    if (saveBtn) saveBtn.disabled = true;
}


// Generate reports
function generateReport() {
    alert('در حال تولید گزارش... این ویژگی در نسخه بعدی فعال خواهد شد.');
}

// Mock functions for offline development
function mockAddPatient(patientData) {
    // Generate ID for new patient
    const newId = mockPatientId++;
    
    // Create new patient with ID
    const newPatient = {
        id: newId,
        ...patientData
    };
    
    // Add to mock data
    mockDb.patients.push(newPatient);
    
    // Update UI
    patientsList = mockDb.patients;
    renderPatientsList(mockDb.patients);
    populatePatientDropdowns(mockDb.patients);
    updateDashboardStats();
    
    // Close modal
    document.getElementById('patient-modal').style.display = 'none';
    
    console.log('Added mock patient:', newPatient);
}

function mockUpdatePatient(patientId, patientData) {
    // Find patient index
    const index = mockDb.patients.findIndex(p => p.id == patientId);
    
    if (index !== -1) {
        // Update patient
        mockDb.patients[index] = {
            ...mockDb.patients[index],
            ...patientData
        };
        
        // Update UI
        patientsList = mockDb.patients;
        renderPatientsList(mockDb.patients);
        populatePatientDropdowns(mockDb.patients);
        updateDashboardStats();
        
        // Close modal
        document.getElementById('patient-modal').style.display = 'none';
        
        console.log('Updated mock patient:', mockDb.patients[index]);
    }
}

function mockSaveGcsScore(patientId, scoreData) {
    // Generate new score ID
    const newId = mockScoreId++;
    
    // Calculate total score
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
    mockDb.scores.push(newScore);
    
    // Update UI with success message
    alert(`امتیاز GCS با موفقیت ذخیره شد: ${totalScore}`);
    
    // Reset calculator
    resetGcsCalculator();
    
    // Update dashboard stats
    updateDashboardStats();
    
    // Refresh patient list (to update severity indicators)
    renderPatientsList(mockDb.patients);
    
    console.log('Saved mock GCS score:', newScore);
}

// Get latest GCS score for a patient
function getLatestGcsScore(patientId) {
    // Get scores for this patient
    let patientScores = [];
    
    if (mockDb.scores && mockDb.scores.length > 0) {
        patientScores = mockDb.scores.filter(score => score.patient_id == patientId);
    }
    
    if (patientScores.length === 0) {
        return null;
    }
    
    // Sort by timestamp (newest first)
    patientScores.sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    // Return latest score
    return patientScores[0];
}

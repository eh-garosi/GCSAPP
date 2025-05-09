// Log to verify script is loading
console.log("Script is loading...");

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    
    // Language toggle
    const enToggle = document.getElementById('en-toggle');
    const faToggle = document.getElementById('fa-toggle');
    
    if (enToggle && faToggle) {
        console.log("Language toggles found");
        
        enToggle.addEventListener('click', function() {
            console.log("English toggle clicked");
            document.body.classList.remove('lang-fa');
            document.body.classList.add('lang-en');
            enToggle.classList.add('active');
            faToggle.classList.remove('active');
        });
        
        faToggle.addEventListener('click', function() {
            console.log("Farsi toggle clicked");
            document.body.classList.remove('lang-en');
            document.body.classList.add('lang-fa');
            faToggle.classList.add('active');
            enToggle.classList.remove('active');
        });
    } else {
        console.log("Language toggles not found");
    }
    
    // Navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    console.log("Found " + navButtons.length + " navigation buttons");
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const pageName = this.getAttribute('data-page');
            console.log("Navigation button clicked: " + pageName);
            
            // Remove active class from all buttons
            navButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Hide all pages
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
                console.log("Hiding page: " + page.id);
            });
            
            // Show corresponding page
            const targetPage = document.getElementById(pageName + "-page");
            if (targetPage) {
                targetPage.classList.add('active');
                console.log("Showing page: " + targetPage.id);
            } else {
                console.log("Target page not found: " + pageName + "-page");
            }
        });
    });
    
    // Home page buttons
    const startCalculator = document.getElementById('start-calculator');
    const viewPatients = document.getElementById('view-patients');
    
    if (startCalculator) {
        startCalculator.addEventListener('click', function() {
            console.log("Start calculator button clicked");
            const calcNavBtn = document.querySelector('.nav-btn[data-page="calculator"]');
            if (calcNavBtn) calcNavBtn.click();
        });
    }
    
    if (viewPatients) {
        viewPatients.addEventListener('click', function() {
            console.log("View patients button clicked");
            const patientsNavBtn = document.querySelector('.nav-btn[data-page="patients"]');
            if (patientsNavBtn) patientsNavBtn.click();
        });
    }
});

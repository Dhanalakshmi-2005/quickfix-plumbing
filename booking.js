/**
 * Booking Form Handler
 * Form validation, submission, and Google Apps Script integration
 */

// ========================================
// CONFIGURATION - UPDATE WITH YOUR GOOGLE APPS SCRIPT URL
// ========================================
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwf8yWCYwPd77EvRnro4nCntyDqL1kBifuYaDeS4JBTbudrK-jB8bwHyhRmt-1bP0WTFA/exec';
// Replace above with your deployed Google Apps Script Web App URL
// Example: https://script.google.com/macros/d/SCRIPT_ID/useless?

// ========================================
// FORM INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('bookingForm');
    
    if (!bookingForm) return; // Not on booking page
    
    // Populate form with URL parameters if provided
    populateFormFromUrl();
    
    // Load emergency data if redirected from emergency page
    loadEmergencyData();
    
    // Set minimum date to today
    setMinimumDate();
    
    // Add form submission handler
    bookingForm.addEventListener('submit', handleFormSubmit);
    
    // Add real-time validation
    addRealTimeValidation();
});

/**
 * Handle form submission
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Collect form data
    const formData = collectFormData();
    
    // Show loading state
    const submitBtn = document.getElementById('submitBtn');
    setLoadingState(submitBtn, true);
    
    try {
        // Submit to Google Apps Script
        const response = await submitToGoogleAppsScript(formData);
        
        if (response && response.success) {
            // Show success message
            showSuccessMessage(response);
            
            // Hide form and show success
            document.getElementById('bookingForm').style.display = 'none';
            document.getElementById('successMessage').style.display = 'block';
        } else {
            // Show error
            showErrorMessage(response?.message || 'Failed to submit booking');
            setLoadingState(submitBtn, false);
        }
    } catch (error) {
        console.error('Submission error:', error);
        showErrorMessage('Unable to submit your request. Please check your connection and try again.');
        setLoadingState(submitBtn, false);
    }
}

/**
 * Validate entire form
 */
function validateForm() {
    clearAllErrors();
    let isValid = true;
    
    // Validate name
    const name = document.getElementById('customerName');
    if (!name.value.trim()) {
        showError('name', 'Full name is required');
        isValid = false;
    }
    
    // Validate phone
    const phone = document.getElementById('customerPhone');
    if (!phone.value.trim()) {
        showError('phone', 'Phone number is required');
        isValid = false;
    } else if (!isValidPhone(phone.value)) {
        showError('phone', 'Please enter a valid 10-digit phone number');
        isValid = false;
    }
    
    // Validate email (optional, but if provided must be valid)
    const email = document.getElementById('customerEmail');
    if (email.value.trim() && !isValidEmail(email.value)) {
        showError('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate service
    const service = document.getElementById('serviceType');
    if (!service.value) {
        showError('service', 'Please select a service');
        isValid = false;
    }
    
    // Validate problem description
    const problem = document.getElementById('problemDescription');
    if (!problem.value.trim()) {
        showError('problem', 'Please describe the problem');
        isValid = false;
    }
    
    // Validate address
    const address = document.getElementById('address');
    if (!address.value.trim()) {
        showError('address', 'Address is required');
        isValid = false;
    }
    
    // Validate city
    const city = document.getElementById('city');
    if (!city.value.trim()) {
        showError('city', 'City is required');
        isValid = false;
    }
    
    // Validate pincode
    const pincode = document.getElementById('pincode');
    if (!pincode.value.trim()) {
        showError('pincode', 'Pincode is required');
        isValid = false;
    } else if (!isValidPincode(pincode.value)) {
        showError('pincode', 'Please enter a valid 6-digit pincode');
        isValid = false;
    }
    
    // Validate preferred date
    const date = document.getElementById('preferredDate');
    if (!date.value) {
        showError('date', 'Please select a preferred date');
        isValid = false;
    }
    
    // Validate preferred time
    const time = document.getElementById('preferredTime');
    if (!time.value) {
        showError('time', 'Please select a preferred time');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Collect form data into object
 */
function collectFormData() {
    return {
        name: document.getElementById('customerName').value,
        phone: document.getElementById('customerPhone').value,
        email: document.getElementById('customerEmail').value || '',
        service: document.getElementById('serviceType').value,
        problem_description: document.getElementById('problemDescription').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        pincode: document.getElementById('pincode').value,
        preferred_date: document.getElementById('preferredDate').value,
        preferred_time: document.getElementById('preferredTime').value,
        service_type: document.querySelector('input[name="service_type"]:checked').value,
        timestamp: new Date().toISOString()
    };
}

/**
 * Submit data to Google Apps Script
 */
async function submitToGoogleAppsScript(formData) {
    if (!GOOGLE_APPS_SCRIPT_URL || GOOGLE_APPS_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
        // Development mode: simulate response
        console.warn('Google Apps Script URL not configured. Using mock response.');
        return generateMockResponse(formData);
    }
    
    try {
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        // Google Apps Script returns text, parse as JSON
        const text = await response.text();
        const data = JSON.parse(text);
        
        return data;
    } catch (error) {
        console.error('Error submitting form:', error);
        throw error;
    }
}

/**
 * Mock response for development (when Google Apps Script URL not configured)
 */
function generateMockResponse(formData) {
    const bookingId = `QFP-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
    return {
        success: true,
        bookingId: bookingId,
        message: 'Booking submitted successfully (demo mode)'
    };
}

/**
 * Show success message with booking details
 */
function showSuccessMessage(response) {
    const bookingId = response.bookingId || 'N/A';
    const service = document.getElementById('serviceType').value;
    const date = document.getElementById('preferredDate').value;
    const time = document.getElementById('preferredTime').value;
    const name = document.getElementById('customerName').value;
    
    document.getElementById('confirmBookingId').textContent = bookingId;
    document.getElementById('confirmService').textContent = getServiceLabel(service);
    document.getElementById('confirmDateTime').textContent = `${formatDate(date)} at ${time}`;
}

/**
 * Show error message
 */
function showErrorMessage(message) {
    const errorAlert = document.getElementById('errorAlert');
    document.getElementById('errorAlertText').textContent = message;
    errorAlert.style.display = 'block';
    
    // Scroll to error
    errorAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Show error for a specific field
 */
function showError(fieldName, message) {
    const errorElement = document.getElementById(`error-${fieldName}`);
    const inputElement = document.getElementById(fieldName === 'name' ? 'customerName' : 
                                                 fieldName === 'phone' ? 'customerPhone' :
                                                 fieldName === 'email' ? 'customerEmail' :
                                                 fieldName === 'service' ? 'serviceType' :
                                                 fieldName === 'problem' ? 'problemDescription' :
                                                 fieldName);
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
    
    if (inputElement) {
        inputElement.classList.add('error');
    }
}

/**
 * Clear all errors
 */
function clearAllErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
        el.classList.remove('show');
    });
    
    document.querySelectorAll('input, select, textarea').forEach(el => {
        el.classList.remove('error');
    });
    
    document.getElementById('errorAlert').style.display = 'none';
}

/**
 * Add real-time validation
 */
function addRealTimeValidation() {
    // Phone number validation
    document.getElementById('customerPhone')?.addEventListener('blur', function() {
        if (this.value && !isValidPhone(this.value)) {
            showError('phone', 'Please enter a valid 10-digit phone number');
        } else {
            this.classList.remove('error');
            document.getElementById('error-phone').classList.remove('show');
        }
    });
    
    // Email validation
    document.getElementById('customerEmail')?.addEventListener('blur', function() {
        if (this.value && !isValidEmail(this.value)) {
            showError('email', 'Please enter a valid email address');
        } else {
            this.classList.remove('error');
            document.getElementById('error-email').classList.remove('show');
        }
    });
    
    // Pincode validation
    document.getElementById('pincode')?.addEventListener('blur', function() {
        if (this.value && !isValidPincode(this.value)) {
            showError('pincode', 'Please enter a valid 6-digit pincode');
        } else {
            this.classList.remove('error');
            document.getElementById('error-pincode').classList.remove('show');
        }
    });
}

/**
 * Set minimum date to today
 */
function setMinimumDate() {
    const dateInput = document.getElementById('preferredDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
}

/**
 * Populate form with URL parameters
 */
function populateFormFromUrl() {
    const service = getUrlParam('service');
    if (service) {
        document.getElementById('serviceType').value = service;
    }
}

/**
 * Load emergency data from sessionStorage
 */
function loadEmergencyData() {
    const emergencyData = sessionStorage.getItem('emergencyData');
    if (emergencyData) {
        try {
            const data = JSON.parse(emergencyData);
            
            if (data.name) document.getElementById('customerName').value = data.name;
            if (data.phone) document.getElementById('customerPhone').value = data.phone;
            if (data.email) document.getElementById('customerEmail').value = data.email;
            if (data.issue) document.getElementById('problemDescription').value = data.issue;
            
            // Set emergency service type
            document.querySelector('input[name="service_type"][value="emergency"]').checked = true;
            document.getElementById('serviceType').value = 'emergency-dispatch';
            
            // Clear sessionStorage
            sessionStorage.removeItem('emergencyData');
        } catch (error) {
            console.error('Error loading emergency data:', error);
        }
    }
}

/**
 * Get service label from value
 */
function getServiceLabel(value) {
    const labels = {
        'pipe-leakage': 'Pipe Leakage Repair',
        'tap-repair': 'Tap Repair & Installation',
        'bathroom': 'Bathroom Plumbing',
        'drain-cleaning': 'Drain Cleaning',
        'water-tank-cleaning': 'Water Tank Cleaning',
        'water-heater': 'Water Heater / Geyser',
        'toilet-repair': 'Toilet Repair',
        'complete-plumbing': 'Complete Plumbing',
        'emergency-dispatch': 'Emergency Dispatch',
        'other': 'Other Service'
    };
    return labels[value] || value;
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Set loading state on button
 */
function setLoadingState(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = '<span>Submitting Request...</span>';
    } else {
        button.disabled = false;
        button.innerHTML = '<span>Submit Booking Request</span><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M1 8h14M9 1l7 7-7 7"/></svg>';
    }
}

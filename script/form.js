document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-btn');

    // Error message elements
    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const telError = document.getElementById('tel-error');
    const messageError = document.getElementById('message-error');

    // Form inputs
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const telInput = document.getElementById('tel');
    const messageInput = document.getElementById('message');

    // Validation functions
    function validateName(name) {
        if (name.trim().length < 2) {
            return 'Name must be at least 2 characters';
        }
        if (!/^[a-zA-Z\s'-]+$/.test(name)) {
            return 'Name contains invalid characters';
        }
        return '';
    }

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return 'Please enter a valid email address';
        }
        return '';
    }

    function validatePhone(phone) {
        if (phone.trim() === '') {
            return ''; // Phone is optional
        }

        // Check phone format
        if (!/^[0-9-+\s()]{6,16}$/.test(phone)) {
            return 'Please enter a valid phone number';
        }
        return '';
    }

    function validateMessage(message) {
        if (message.trim().length < 10) {
            return 'Message must be at least 10 characters';
        }
        return '';
    }

    // Input event listeners for real-time validation
    nameInput.addEventListener('input', function () {
        nameError.textContent = validateName(this.value);
    });

    emailInput.addEventListener('input', function () {
        emailError.textContent = validateEmail(this.value);
    });

    telInput.addEventListener('input', function () {
        telError.textContent = validatePhone(this.value);
    });

    messageInput.addEventListener('input', function () {
        messageError.textContent = validateMessage(this.value);
    });

    // Form submission
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Validate all fields
        const nameErrorMsg = validateName(nameInput.value);
        const emailErrorMsg = validateEmail(emailInput.value);
        const telErrorMsg = validatePhone(telInput.value);
        const messageErrorMsg = validateMessage(messageInput.value);

        // Update error messages
        nameError.textContent = nameErrorMsg;
        emailError.textContent = emailErrorMsg;
        telError.textContent = telErrorMsg;
        messageError.textContent = messageErrorMsg;

        // Check if there are any errors
        if (nameErrorMsg || emailErrorMsg || telErrorMsg || messageErrorMsg) {
            formStatus.textContent = 'Please fix the errors and try again.';
            formStatus.classList.add('error');
            formStatus.classList.remove('success');
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        formStatus.textContent = 'Sending message...';
        formStatus.classList.remove('error', 'success');

        // Simulate form submission (replace with actual form submission)
        setTimeout(function () {
            // Success simulation
            formStatus.textContent = 'Message sent successfully! I will get back to you soon.';
            formStatus.classList.add('success');
            formStatus.classList.remove('error');

            // Reset form
            contactForm.reset();
            submitBtn.disabled = false;

            // Clear error messages
            nameError.textContent = '';
            emailError.textContent = '';
            telError.textContent = '';
            messageError.textContent = '';

            // Clear success message after 5 seconds
            setTimeout(function () {
                formStatus.textContent = '';
                formStatus.classList.remove('success');
            }, 5000);
        }, 1500);
    });
}); 
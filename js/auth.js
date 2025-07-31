// Ma Che Serata - Authentication Module
class AuthManager {
    constructor() {
        this.isLoading = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupPasswordStrengthIndicator();
    }

    bindEvents() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Password visibility toggles
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => this.togglePasswordVisibility(e));
        });

        // Real-time validation
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.addEventListener('blur', (e) => this.validateEmail(e.target));
        });

        const passwordInputs = document.querySelectorAll('input[type="password"]');
        passwordInputs.forEach(input => {
            input.addEventListener('input', (e) => this.checkPasswordStrength(e.target));
        });

        // Role selection in registration
        const roleSelect = document.getElementById('role');
        if (roleSelect) {
            roleSelect.addEventListener('change', (e) => this.handleRoleChange(e));
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        if (this.isLoading) return;

        const form = e.target;
        const email = form.email.value.trim();
        const password = form.password.value;

        // Client-side validation
        if (!this.validateLoginForm(email, password)) {
            return;
        }

        this.setLoadingState(true, 'loginBtn');

        try {
            const response = await fetch('/api/auth-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Login successful
                this.handleLoginSuccess(data);
            } else {
                // Login failed
                this.showError('loginError', data.error || 'Credenziali non valide');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('loginError', 'Errore di connessione. Riprova più tardi.');
        } finally {
            this.setLoadingState(false, 'loginBtn');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        if (this.isLoading) return;

        const form = e.target;
        const formData = new FormData(form);
        const userData = Object.fromEntries(formData.entries());

        // Client-side validation
        if (!this.validateRegisterForm(userData)) {
            return;
        }
        // Remove confirmPassword before sending to backend
delete userData.confirmPassword;
delete userData.acceptTerms;

        this.setLoadingState(true, 'registerBtn');

        try {
            const response = await fetch('/api/register-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok) {
                // Registration successful
                this.handleRegisterSuccess(data);
            } else {
                // Registration failed
                this.showError('registerError', data.error || 'Errore durante la registrazione');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showError('registerError', 'Errore di connessione. Riprova più tardi.');
        } finally {
            this.setLoadingState(false, 'registerBtn');
        }
    }

    validateLoginForm(email, password) {
        let isValid = true;

        // Email validation
        if (!email) {
            this.showError('loginError', 'Email richiesta');
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            this.showError('loginError', 'Email non valida');
            isValid = false;
        }

        // Password validation
        if (!password) {
            this.showError('loginError', 'Password richiesta');
            isValid = false;
        }

        return isValid;
    }

    validateRegisterForm(userData) {
        let isValid = true;
        const errors = [];

        // Username validation
        if (!userData.username || userData.username.length < 3) {
            errors.push('Username deve avere almeno 3 caratteri');
            isValid = false;
        }

        // Email validation
        if (!userData.email) {
            errors.push('Email richiesta');
            isValid = false;
        } else if (!this.isValidEmail(userData.email)) {
            errors.push('Email non valida');
            isValid = false;
        }

        // Password validation
        if (!userData.password) {
            errors.push('Password richiesta');
            isValid = false;
        } else if (userData.password.length < 6) {
            errors.push('Password deve avere almeno 6 caratteri');
            isValid = false;
        }

        // Confirm password validation
        if (userData.password !== userData.confirmPassword) {
            errors.push('Le password non coincidono');
            isValid = false;
        }

        // Role validation
        if (!userData.role) {
            errors.push('Seleziona un ruolo');
            isValid = false;
        }

        // Terms validation
        if (!userData.acceptTerms) {
            errors.push('Devi accettare i termini e condizioni');
            isValid = false;
        }

        // Instagram validation for specific roles
        if (['pr', 'artist', 'venue'].includes(userData.role) && !userData.instagram) {
            errors.push('Instagram richiesto per questo ruolo');
            isValid = false;
        }

        if (!isValid) {
            this.showError('registerError', errors.join('<br>'));
        }

        return isValid;
    }

    handleLoginSuccess(data) {
        // Clear any previous errors
        this.clearError('loginError');
        
        // Show success message
        if (window.app) {
            window.app.showToast('Login effettuato con successo!', 'success');
            window.app.loginUser(data.user);
        }

        // Hide modal
        hideLoginModal();
        
        // Reset form
        document.getElementById('loginForm').reset();
    }

    handleRegisterSuccess(data) {
        // Clear any previous errors
        this.clearError('registerError');
        
        // Show success message
        const message = data.needsApproval 
            ? 'Registrazione completata! Il tuo account è in attesa di approvazione.'
            : 'Registrazione completata con successo!';
            
        if (window.app) {
            window.app.showToast(message, 'success');
        }

        // Hide modal
        hideRegisterModal();
        
        // Reset form
        document.getElementById('registerForm').reset();
        
        // If no approval needed, automatically log in
        if (!data.needsApproval && data.user) {
            setTimeout(() => {
                if (window.app) {
                    window.app.loginUser(data.user);
                }
            }, 1500);
        }
    }

    validateEmail(emailInput) {
        const email = emailInput.value.trim();
        const isValid = this.isValidEmail(email);
        
        if (email && !isValid) {
            emailInput.classList.add('invalid');
            this.showInputError(emailInput, 'Email non valida');
        } else {
            emailInput.classList.remove('invalid');
            this.clearInputError(emailInput);
        }
        
        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    setupPasswordStrengthIndicator() {
        const passwordInput = document.querySelector('#registerForm input[name="password"]');
        if (!passwordInput) return;

        // Create strength indicator if it doesn't exist
        let strengthIndicator = passwordInput.parentNode.querySelector('.password-strength');
        if (!strengthIndicator) {
            strengthIndicator = document.createElement('div');
            strengthIndicator.className = 'password-strength';
            strengthIndicator.innerHTML = `
                <div class="strength-bar">
                    <div class="strength-fill"></div>
                </div>
                <div class="strength-text">Forza password: <span></span></div>
            `;
            passwordInput.parentNode.appendChild(strengthIndicator);
        }
    }

    checkPasswordStrength(passwordInput) {
        const password = passwordInput.value;
        const strengthIndicator = passwordInput.parentNode.querySelector('.password-strength');
        
        if (!strengthIndicator || !password) {
            if (strengthIndicator) strengthIndicator.style.display = 'none';
            return;
        }

        strengthIndicator.style.display = 'block';
        
        let score = 0;
        let feedback = '';

        // Length check
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;

        // Character variety checks
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        // Determine strength
        const strengthLevels = [
            { min: 0, max: 2, text: 'Debole', class: 'weak', color: '#ef4444' },
            { min: 3, max: 4, text: 'Media', class: 'medium', color: '#f59e0b' },
            { min: 5, max: 6, text: 'Forte', class: 'strong', color: '#22c55e' }
        ];

        const currentLevel = strengthLevels.find(level => score >= level.min && score <= level.max);
        
        const strengthFill = strengthIndicator.querySelector('.strength-fill');
        const strengthText = strengthIndicator.querySelector('.strength-text span');
        
        if (strengthFill && strengthText && currentLevel) {
            strengthFill.style.width = `${(score / 6) * 100}%`;
            strengthFill.style.backgroundColor = currentLevel.color;
            strengthText.textContent = currentLevel.text;
            strengthText.style.color = currentLevel.color;
        }
    }

    handleRoleChange(e) {
        const role = e.target.value;
        const instagramField = document.querySelector('.instagram-field');
        const instagramInput = document.querySelector('input[name="instagram"]');
        
        if (!instagramField || !instagramInput) return;

        // Show Instagram field for specific roles
        if (['pr', 'artist', 'venue'].includes(role)) {
            instagramField.style.display = 'block';
            instagramInput.required = true;
            
            // Update placeholder based on role
            const placeholders = {
                pr: '@nomePR - per verifica identità',
                artist: '@nomeArtista - per verifica profilo',
                venue: '@nomeLocale - per verifica attività'
            };
            instagramInput.placeholder = placeholders[role] || '@username';
        } else {
            instagramField.style.display = 'none';
            instagramInput.required = false;
            instagramInput.value = '';
        }
    }

    togglePasswordVisibility(e) {
        const button = e.target.closest('.password-toggle');
        const input = button.parentNode.querySelector('input');
        
        if (input.type === 'password') {
            input.type = 'text';
            button.textContent = '🙈';
        } else {
            input.type = 'password';
            button.textContent = '👁️';
        }
    }

    setLoadingState(loading, buttonId) {
        this.isLoading = loading;
        const button = document.getElementById(buttonId);
        
        if (!button) return;
        
        if (loading) {
            button.disabled = true;
            button.classList.add('loading');
            button.innerHTML = `
                <span class="loading-spinner"></span>
                ${buttonId === 'loginBtn' ? 'Accesso...' : 'Registrazione...'}
            `;
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            button.innerHTML = buttonId === 'loginBtn' ? 'Accedi' : 'Registrati';
        }
    }

    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.innerHTML = message;
            errorElement.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                this.clearError(elementId);
            }, 5000);
        }
    }

    clearError(elementId) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.style.display = 'none';
            errorElement.innerHTML = '';
        }
    }

    showInputError(input, message) {
        let errorElement = input.parentNode.querySelector('.input-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'input-error';
            input.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    clearInputError(input) {
        const errorElement = input.parentNode.querySelector('.input-error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    // Social login methods (placeholder for future implementation)
    async loginWithGoogle() {
        if (window.app) {
            window.app.showToast('Login con Google disponibile prossimamente', 'info');
        }
    }

    async loginWithInstagram() {
        if (window.app) {
            window.app.showToast('Login con Instagram disponibile prossimamente', 'info');
        }
    }

    // Password reset (placeholder for future implementation)
    async requestPasswordReset(email) {
        try {
            const response = await fetch('/api/password-reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                if (window.app) {
                    window.app.showToast('Email di reset inviata!', 'success');
                }
            } else {
                if (window.app) {
                    window.app.showToast(data.error || 'Errore durante l\'invio', 'error');
                }
            }
        } catch (error) {
            console.error('Password reset error:', error);
            if (window.app) {
                window.app.showToast('Errore di connessione', 'error');
            }
        }
    }
}

// Utility functions for password reset modal
function showForgotPasswordModal() {
    const email = document.querySelector('#loginForm input[name="email"]').value;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>🔐 Reset Password</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <p>Inserisci la tua email per ricevere il link di reset:</p>
                <div class="form-group">
                    <input type="email" id="resetEmail" placeholder="La tua email" value="${email}" required>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">
                    Annulla
                </button>
                <button type="button" class="btn-primary" onclick="sendPasswordReset()">
                    Invia Reset
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Focus on email input
    setTimeout(() => {
        modal.querySelector('#resetEmail').focus();
    }, 100);
}

function sendPasswordReset() {
    const email = document.getElementById('resetEmail').value.trim();
    
    if (!email) {
        if (window.app) {
            window.app.showToast('Inserisci un indirizzo email', 'warning');
        }
        return;
    }
    
    if (window.authManager) {
        window.authManager.requestPasswordReset(email);
    }
    
    // Close modal
    document.querySelector('.modal').remove();
    document.body.style.overflow = '';
}

// Initialize authentication manager
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}

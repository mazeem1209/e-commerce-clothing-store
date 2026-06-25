// ─── LOGIN ────────────────────────────────────────────────
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!email || !password) {
        showNotification('Please fill in all fields!', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const text = await response.text();

        if (!response.ok) {
            showNotification(text || 'Invalid email or password!', 'error');
            return;
        }

        const data = JSON.parse(text);

        // Save token and user to localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        showNotification('Login successful!', 'success');

        // Redirect based on role
        setTimeout(() => {
            if (data.user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = '../index.html';
            }
        }, 1000);

    } catch (error) {
        showNotification('Server error. Please try again!', 'error');
        console.error('Login error:', error);
    }
}

// ─── REGISTER ─────────────────────────────────────────────
async function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value.trim();
    const confirmPassword = document.getElementById('register-confirm-password').value.trim();

    if (!name || !email || !password || !confirmPassword) {
        showNotification('Please fill in all fields!', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('Password must be at least 6 characters!', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showNotification(data || 'Registration failed!', 'error');
            return;
        }

        showNotification('Account created successfully!', 'success');

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);

    } catch (error) {
        showNotification('Server error. Please try again!', 'error');
        console.error('Register error:', error);
    }
}

// ─── TOGGLE PASSWORD VISIBILITY ───────────────────────────
function initTogglePassword() {
    const toggleLogin = document.getElementById('toggle-login-password');
    const toggleRegister = document.getElementById('toggle-register-password');

    if (toggleLogin) {
        toggleLogin.addEventListener('click', () => {
            const input = document.getElementById('login-password');
            input.type = input.type === 'password' ? 'text' : 'password';
            toggleLogin.classList.toggle('fa-eye');
            toggleLogin.classList.toggle('fa-eye-slash');
        });
    }

    if (toggleRegister) {
        toggleRegister.addEventListener('click', () => {
            const input = document.getElementById('register-password');
            input.type = input.type === 'password' ? 'text' : 'password';
            toggleRegister.classList.toggle('fa-eye');
            toggleRegister.classList.toggle('fa-eye-slash');
        });
    }
}

// ─── REDIRECT IF ALREADY LOGGED IN ────────────────────────
function checkAlreadyLoggedIn() {
    if (isLoggedIn()) {
        window.location.href = '../index.html';
    }
}

// ─── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    checkAlreadyLoggedIn();

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    initTogglePassword();
});
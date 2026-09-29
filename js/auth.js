/**
 * LifeOS Authentication Module
 * Handles login, registration, validation, password toggle, and profile state
 */

document.addEventListener('DOMContentLoaded', () => {
  // Password Visibility Toggle
  document.querySelectorAll('.password-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (input && input.type === 'password') {
        input.type = 'text';
        btn.textContent = '👁️‍🗨️';
      } else if (input) {
        input.type = 'password';
        btn.textContent = '👁️';
      }
    });
  });

  // Login Form Handler
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      if (!email || !password) {
        LifeOS_Common.showToast('Please enter both email and password.', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="loading-spinner"></span> Signing in...';

      try {
        const res = await LifeOS_API.auth.login(email, password);
        LifeOS_Common.showToast(`Welcome back, ${res.user.name}!`, 'success');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 600);
      } catch (err) {
        LifeOS_Common.showToast('Login failed. Please check credentials.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
      }
    });
  }

  // Register Form Handler
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('fullName').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const submitBtn = registerForm.querySelector('button[type="submit"]');

      if (!fullName || !email || !password) {
        LifeOS_Common.showToast('Please fill in all required fields.', 'error');
        return;
      }

      if (password !== confirmPassword) {
        LifeOS_Common.showToast('Passwords do not match.', 'error');
        return;
      }

      if (password.length < 6) {
        LifeOS_Common.showToast('Password must be at least 6 characters.', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="loading-spinner"></span> Creating account...';

      try {
        const res = await LifeOS_API.auth.register(fullName, email, password);
        LifeOS_Common.showToast('Account created successfully!', 'success');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 600);
      } catch (err) {
        LifeOS_Common.showToast('Registration failed. Try again.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
      }
    });
  }
});

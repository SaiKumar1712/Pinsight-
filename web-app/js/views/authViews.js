/* ==========================================
   AUTHENTICATION & ONBOARDING VIEWS
   ========================================== */

import { UIComponents } from '../components.js';
import { NetworkManager } from '../api.js';
import { AppState } from '../state.js';

export const AuthViews = {
  /**
   * Onboarding Screen (Onboardingscreen.swift)
   */
  OnboardingScreen() {
    return `
      <div class="screen" style="justify-content: space-between; text-align: center;">
        ${UIComponents.BackgroundBlobs()}
        
        <div class="screen-content" style="justify-content: space-between; align-items: center; padding-top: 80px; padding-bottom: 40px;">
          <!-- Hero Icon & Title -->
          <div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
            <div style="width: 140px; height: 140px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; box-shadow: 0 15px 35px rgba(89, 115, 242, 0.35);">
              <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path>
                <path d="M12 6a6 6 0 0 0-6 6c0 3 2 5 3 6h6c1-1 3-3 3-6a6 6 0 0 0-6-6z"></path>
              </svg>
            </div>
            
            <div>
              <h1 class="title-large" style="font-size: 48px; margin-bottom: 4px;">Pinsight</h1>
              <p class="tagline">ELEVATE YOUR TEACHING</p>
            </div>
          </div>
          
          <!-- Bottom Tagline & Button -->
          <div style="width: 100%; max-width: 360px; display: flex; flex-direction: column; gap: 30px;">
            <p class="subtitle" style="padding: 0 10px; font-weight: 600;">
              Pedagogical Innovations & Strategies for Insightful Guidance in Nurturing Teaching
            </p>
            
            ${UIComponents.PrimaryButton({
              title: 'Get Started',
              onClick: "AppState.navigate('signin')"
            })}
          </div>
          
          <!-- Footer -->
          <div style="font-size: 12px; font-weight: 700; color: #aaa;">
            Version 1.0 • Secure & Private
          </div>
        </div>
      </div>
    `;
  },

  /**
   * User Type View (UserTypeView.swift)
   */
  UserTypeView() {
    return this.SigninView();
  },

  /**
   * Sign In View (SigninView.swift)
   */
  SigninView() {
    setTimeout(() => {
      const form = document.getElementById('signin-form');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = document.getElementById('signin-email').value.trim();
          const password = document.getElementById('signin-password').value.trim();
          const errorAlert = document.getElementById('signin-error');
          const submitBtn = document.getElementById('signin-submit-btn');

          if (!email || !password) return;

          errorAlert.style.display = 'none';
          submitBtn.disabled = true;
          submitBtn.innerHTML = 'Signing In...';

          const res = await NetworkManager.postRequest('/auth/login.php', { email, password });
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Sign In';

          if (res.status === 'success' && res.user) {
            AppState.setSession(res.user);
            if (res.user.role === 'admin') {
              AppState.navigate('adminDashboard');
            } else {
              AppState.navigate('userDashboard');
            }
          } else {
            errorAlert.innerText = res.message || 'Invalid email or password';
            errorAlert.style.display = 'block';
          }
        });
      }
    }, 50);

    return `
      <div class="screen scrollable-content">
        ${UIComponents.BackgroundBlobs()}
        <div class="screen-content" style="max-width: 1100px;">
          ${UIComponents.WebsiteHeader({ showBack: true })}
          
          <div class="split-screen-container">
            <!-- Left Info Panel -->
            <div style="display: flex; flex-direction: column; gap: 20px;">
              <span style="font-size: 12px; font-weight: 900; letter-spacing: 3px; color: var(--primary); text-transform: uppercase;">MEMBER LOGIN</span>
              <h1 style="font-size: 48px; font-weight: 900; line-height: 1.1; color: var(--navy-text);">Welcome back to Pinsight</h1>
              <p style="font-size: 16px; color: #55657e; line-height: 1.5;">Access your personal dashboard, track assessment performance, and watch interactive video lessons.</p>
              
              <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
                <div style="display: flex; align-items: center; gap: 12px; font-size: 14px; color: #475569;">
                  <div style="width: 24px; height: 24px; border-radius: 50%; background: rgba(64,217,191,0.2); color: var(--accent); display: flex; align-items: center; justify-content: center; font-weight: 900;">✓</div>
                  <span>Secure SSL Encrypted Session</span>
                </div>
                <div style="display: flex; align-items: center; gap: 12px; font-size: 14px; color: #475569;">
                  <div style="width: 24px; height: 24px; border-radius: 50%; background: rgba(89,115,242,0.2); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 900;">✓</div>
                  <span>Automated Attempt History Tracking</span>
                </div>
              </div>
            </div>

            <!-- Right Form Container -->
            <div>
              <form id="signin-form" class="glass-card" style="padding: 36px;">
                <h3 style="font-size: 24px; font-weight: 800; color: var(--navy-text); margin-bottom: 20px;">Sign In to Account</h3>
                
                <div id="signin-error" style="display: none; background: rgba(255, 0, 0, 0.08); color: #d32f2f; padding: 12px; border-radius: 14px; font-size: 14px; font-weight: 600; margin-bottom: 16px; text-align: center;"></div>
                
                ${UIComponents.CustomTextField({ id: 'signin-email', placeholder: 'Email Address', type: 'email', required: true })}
                
                ${UIComponents.CustomSecureField({ id: 'signin-password', placeholder: 'Password' })}
                
                <div style="text-align: right; margin-bottom: 24px; margin-top: -6px;">
                  <a href="#" onclick="AppState.navigate('forgotPassword'); return false;" style="font-size: 14px; font-weight: 700; color: var(--primary); text-decoration: none;">
                    Forgot Password?
                  </a>
                </div>
                
                <button id="signin-submit-btn" type="submit" class="primary-btn" style="width: 100%;">Sign In</button>
                
                <div style="text-align: center; margin-top: 24px; font-size: 14px; color: #66778e;">
                  Don't have an account? 
                  <a href="#" onclick="AppState.navigate('signup'); return false;" style="font-weight: 800; color: var(--accent); text-decoration: none;">
                    Sign Up
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
  },



  /**
   * Create Account View (CreateAccountView.swift)
   */
  CreateAccountView() {
    setTimeout(() => {
      const form = document.getElementById('signup-form');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const name = document.getElementById('signup-name').value.trim();
          const email = document.getElementById('signup-email').value.trim();
          const password = document.getElementById('signup-password').value.trim();
          const mobile = document.getElementById('signup-mobile').value.trim();
          const adminCode = document.getElementById('signup-admincode').value.trim();
          const errorAlert = document.getElementById('signup-error');
          const submitBtn = document.getElementById('signup-submit-btn');

          if (!name || !email || !password) return;

          errorAlert.style.display = 'none';
          submitBtn.disabled = true;
          submitBtn.innerHTML = 'Creating Account...';

          const res = await NetworkManager.postRequest('/auth/signup.php', {
            name, email, password, mobile, admin_code: adminCode
          });
          
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Sign Up';

          if (res && (res.status === 'success' || res.success)) {
            const isPinsightAdmin = (adminCode.toUpperCase() === 'PINSIGHT');
            const userRole = (res.user && res.user.role) || (res.user_type === 'admin' || isPinsightAdmin ? 'admin' : 'user');
            
            const userData = {
              id: (res.user && res.user.id) || res.user_id || Date.now(),
              name: name,
              email: email,
              role: userRole
            };
            AppState.setSession(userData);

            if (userRole === 'admin') {
              AppState.navigate('adminDashboard');
            } else {
              AppState.navigate('userDashboard');
            }
          } else {
            errorAlert.innerText = res.message || 'Failed to create account';
            errorAlert.style.display = 'block';
          }
        });
      }
    }, 50);

    return `
      <div class="screen scrollable-content">
        ${UIComponents.BackgroundBlobs()}
        
        <div class="screen-content">
          ${UIComponents.BackButton()}
          
          <div style="text-align: center; margin-top: 10px; margin-bottom: 25px;">
            <h2 class="title-medium" style="font-size: 32px;">Create Account</h2>
            <p class="subtitle" style="margin-top: 4px;">Join us to start your journey</p>
          </div>
          
          <div class="form-container-centered">
            <form id="signup-form" class="glass-card">
              <div id="signup-error" style="display: none; background: rgba(255, 0, 0, 0.08); color: #d32f2f; padding: 12px; border-radius: 14px; font-size: 14px; font-weight: 600; margin-bottom: 16px; text-align: center;"></div>
              
              ${UIComponents.CustomTextField({ id: 'signup-name', placeholder: 'Full Name', required: true })}
              ${UIComponents.CustomSecureField({ id: 'signup-password', placeholder: 'Create Password' })}
              ${UIComponents.CustomTextField({ id: 'signup-email', placeholder: 'Email Address', type: 'email', required: true })}
              ${UIComponents.CustomTextField({ id: 'signup-mobile', placeholder: 'Mobile Number', type: 'tel' })}
              ${UIComponents.CustomSecureField({ id: 'signup-admincode', placeholder: 'Clinic Code (Optional)' })}
              
              <div style="margin-top: 15px;">
                <button id="signup-submit-btn" type="submit" class="primary-btn">Sign Up</button>
              </div>
              
              <div style="text-align: center; margin-top: 20px; font-size: 14px; color: #666;">
                Already have an account? 
                <a href="#" onclick="AppState.navigate('signin'); return false;" style="font-weight: 800; color: var(--accent); text-decoration: none;">
                  Sign In
                </a>
              </div>
            </form>
          </div>

        </div>
      </div>
    `;
  },

  /**
   * Forgot Password View (ForgetpasswordView.swift)
   */
  ForgotPasswordView() {
    setTimeout(() => {
      const form = document.getElementById('forgot-form');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = document.getElementById('forgot-email').value.trim();
          const submitBtn = document.getElementById('forgot-submit-btn');
          const errorAlert = document.getElementById('forgot-error');

          if (!email) return;
          submitBtn.disabled = true;
          submitBtn.innerText = 'Sending OTP...';

          const res = await NetworkManager.postRequest('/auth/forgot_password.php', { email });
          submitBtn.disabled = false;
          submitBtn.innerText = 'Send OTP';

          if (res.status === 'success') {
            AppState.navigate('otp', { email });
          } else {
            errorAlert.innerText = res.message || 'Error sending OTP';
            errorAlert.style.display = 'block';
          }
        });
      }
    }, 50);

    return `
      <div class="screen scrollable-content">
        ${UIComponents.BackgroundBlobs()}
        <div class="screen-content">
          ${UIComponents.BackButton()}
          
          <div style="text-align: center; margin-top: 20px; margin-bottom: 30px;">
            <h2 class="title-medium" style="font-size: 32px;">Forgot Password?</h2>
            <p class="subtitle" style="margin-top: 6px;">Enter your email address to receive an OTP code</p>
          </div>
          
          <form id="forgot-form" class="glass-card">
            <div id="forgot-error" style="display: none; background: rgba(255, 0, 0, 0.08); color: #d32f2f; padding: 12px; border-radius: 14px; font-size: 14px; font-weight: 600; margin-bottom: 16px; text-align: center;"></div>
            
            ${UIComponents.CustomTextField({ id: 'forgot-email', placeholder: 'Email Address', type: 'email', required: true })}
            
            <div style="margin-top: 20px;">
              <button id="forgot-submit-btn" type="submit" class="primary-btn">Send OTP</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  /**
   * OTP Verification View (OtpView.swift)
   */
  OtpView() {
    const email = AppState.navigationParams.email || '';
    setTimeout(() => {
      const form = document.getElementById('otp-form');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const otp = document.getElementById('otp-code').value.trim();
          const submitBtn = document.getElementById('otp-submit-btn');
          const errorAlert = document.getElementById('otp-error');

          if (!otp) return;
          submitBtn.disabled = true;
          submitBtn.innerText = 'Verifying...';

          const res = await NetworkManager.postRequest('/auth/verify_otp.php', { email, otp });
          submitBtn.disabled = false;
          submitBtn.innerText = 'Verify OTP';

          if (res.status === 'success') {
            AppState.navigate('resetPassword', { email, otp });
          } else {
            errorAlert.innerText = res.message || 'Invalid or expired OTP';
            errorAlert.style.display = 'block';
          }
        });
      }
    }, 50);

    return `
      <div class="screen scrollable-content">
        ${UIComponents.BackgroundBlobs()}
        <div class="screen-content">
          ${UIComponents.BackButton()}
          
          <div style="text-align: center; margin-top: 20px; margin-bottom: 30px;">
            <h2 class="title-medium" style="font-size: 32px;">Enter OTP</h2>
            <p class="subtitle" style="margin-top: 6px;">We sent a 6-digit code to <br/><b>${email}</b></p>
          </div>
          
          <form id="otp-form" class="glass-card">
            <div id="otp-error" style="display: none; background: rgba(255, 0, 0, 0.08); color: #d32f2f; padding: 12px; border-radius: 14px; font-size: 14px; font-weight: 600; margin-bottom: 16px; text-align: center;"></div>
            
            ${UIComponents.CustomTextField({ id: 'otp-code', placeholder: '6-digit OTP Code', type: 'number', required: true })}
            
            <div style="margin-top: 20px;">
              <button id="otp-submit-btn" type="submit" class="primary-btn">Verify OTP</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  /**
   * Reset Password View (ResetPasswordView.swift)
   */
  ResetPasswordView() {
    const { email, otp } = AppState.navigationParams;
    setTimeout(() => {
      const form = document.getElementById('reset-form');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const newPassword = document.getElementById('new-password').value.trim();
          const confirmPassword = document.getElementById('confirm-password').value.trim();
          const submitBtn = document.getElementById('reset-submit-btn');
          const errorAlert = document.getElementById('reset-error');

          if (!newPassword || newPassword !== confirmPassword) {
            errorAlert.innerText = 'Passwords do not match';
            errorAlert.style.display = 'block';
            return;
          }

          submitBtn.disabled = true;
          submitBtn.innerText = 'Resetting...';

          const res = await NetworkManager.postRequest('/auth/reset_password.php', {
            email, otp, new_password: newPassword
          });

          submitBtn.disabled = false;
          submitBtn.innerText = 'Reset Password';

          if (res.status === 'success') {
            alert('Password reset successfully! Please sign in.');
            AppState.navigate('signin');
          } else {
            errorAlert.innerText = res.message || 'Failed to reset password';
            errorAlert.style.display = 'block';
          }
        });
      }
    }, 50);

    return `
      <div class="screen scrollable-content">
        ${UIComponents.BackgroundBlobs()}
        <div class="screen-content">
          ${UIComponents.BackButton()}
          
          <div style="text-align: center; margin-top: 20px; margin-bottom: 30px;">
            <h2 class="title-medium" style="font-size: 32px;">Reset Password</h2>
            <p class="subtitle" style="margin-top: 6px;">Create a new password for your account</p>
          </div>
          
          <form id="reset-form" class="glass-card">
            <div id="reset-error" style="display: none; background: rgba(255, 0, 0, 0.08); color: #d32f2f; padding: 12px; border-radius: 14px; font-size: 14px; font-weight: 600; margin-bottom: 16px; text-align: center;"></div>
            
            ${UIComponents.CustomSecureField({ id: 'new-password', placeholder: 'New Password' })}
            ${UIComponents.CustomSecureField({ id: 'confirm-password', placeholder: 'Confirm New Password' })}
            
            <div style="margin-top: 20px;">
              <button id="reset-submit-btn" type="submit" class="primary-btn">Reset Password</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }
};

window.AuthViews = AuthViews;

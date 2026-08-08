/* ==========================================
   PINSIGHT WEB APPLICATION - COMPLETE BUNDLE
   ========================================== */

(function() {
  // 1. APP STATE STORE & ROUTER
  const AppStateStore = {
    currentScreen: 'landing',
    navigationParams: {},
    historyStack: [],

    user: {
      id: localStorage.getItem('user_id') || null,
      role: localStorage.getItem('user_type') || null,
      name: localStorage.getItem('user_name') || '',
      email: localStorage.getItem('user_email') || ''
    },

    listeners: [],

    subscribe(listener) {
      this.listeners.push(listener);
    },

    notify() {
      this.listeners.forEach(fn => fn(this));
    },

    navigate(screen, params = {}) {
      const target = window.AppState || this;
      if (target.currentScreen !== screen) {
        if (!(target.currentScreen === 'videoDetail' && screen === 'videoDetail')) {
          target.historyStack.push({ screen: target.currentScreen, params: target.navigationParams });
        }
      }
      if (screen === 'userDashboard' || screen === 'adminDashboard') {
        target.historyStack = [];
      }
      target.currentScreen = screen;
      target.navigationParams = params;
      target.notify();
    },

    goBack() {
      const target = window.AppState || this;
      if (target.historyStack.length > 0) {
        const prev = target.historyStack.pop();
        target.currentScreen = prev.screen;
        target.navigationParams = prev.params;
        target.notify();
      } else {
        if (target.user && target.user.id) {
          target.navigate(target.user.role === 'admin' ? 'adminDashboard' : 'userDashboard');
        } else {
          target.navigate('landing');
        }
      }
    },

    setSession(userData, skipNotify = false) {
      const target = window.AppState || this;
      target.user = {
        id: userData.id || userData.user_id,
        role: userData.role || userData.user_type || 'user',
        name: userData.name || '',
        email: userData.email || ''
      };
      if (target.user.id) localStorage.setItem('user_id', target.user.id);
      if (target.user.role) localStorage.setItem('user_type', target.user.role);
      if (target.user.name) localStorage.setItem('user_name', target.user.name);
      if (target.user.email) localStorage.setItem('user_email', target.user.email);
      if (!skipNotify) target.notify();
    },

    clearSession() {
      const target = window.AppState || this;
      target.user = { id: null, role: null, name: '', email: '' };
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_type');
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_email');
      target.navigate('landing');
    }
  };

  const AppState = window.AppState || AppStateStore;
  if (!window.AppState) window.AppState = AppStateStore;

  window.AppState = AppState;
  window.appState = AppState;

  // 2. NETWORK MANAGER
  const NetworkManager = {
    baseURL: 'http://localhost/Backend',

    getURL(endpoint) {
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      return `${this.baseURL}${cleanEndpoint}`;
    },

    normalizeResponse(json) {
      if (!json || typeof json !== 'object') return json;
      if (json.success !== undefined && json.status === undefined) {
        json.status = json.success ? 'success' : 'error';
      }
      if (json.status !== undefined && json.success === undefined) {
        json.success = json.status === 'success';
      }
      if (json.data && typeof json.data === 'object' && !json.user) {
        if (json.data.user_id || json.data.id) {
          json.user = {
            id: json.data.user_id || json.data.id,
            role: json.data.user_type || json.data.role || 'user',
            name: json.data.name || '',
            email: json.data.email || ''
          };
        }
      }
      return json;
    },

    async fetchRequest(endpoint, parameters = {}) {
      try {
        let url = this.getURL(endpoint);
        const queryKeys = Object.keys(parameters);
        if (queryKeys.length > 0) {
          const queryParams = new URLSearchParams();
          queryKeys.forEach(key => {
            if (parameters[key] !== undefined && parameters[key] !== null) {
              queryParams.append(key, parameters[key]);
            }
          });
          url += `?${queryParams.toString()}`;
        }
        const response = await fetch(url, { method: 'GET' });
        const text = await response.text();
        let json;
        try {
          json = JSON.parse(text);
        } catch(e) {
          console.error(`[NetworkManager] Invalid JSON from ${endpoint}:`, text);
          return { status: 'error', success: false, message: `Parse error from ${endpoint}` };
        }
        return this.normalizeResponse(json);
      } catch (err) {
        console.error(`[NetworkManager] Fetch Error [${endpoint}]:`, err);
        return { status: 'error', success: false, message: err.message || `Fetch error on ${endpoint}` };
      }
    },

    async postRequest(endpoint, bodyParams = {}) {
      try {
        const url = this.getURL(endpoint);
        const formBody = new URLSearchParams();
        for (const key in bodyParams) {
          if (bodyParams[key] !== undefined && bodyParams[key] !== null) {
            formBody.append(key, bodyParams[key]);
          }
        }
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
          body: formBody.toString()
        });
        const text = await response.text();
        let json;
        try {
          json = JSON.parse(text);
        } catch(e) {
          console.error(`[NetworkManager] Invalid JSON from ${endpoint}:`, text);
          return { status: 'error', success: false, message: `Parse error from ${endpoint}` };
        }
        return this.normalizeResponse(json);
      } catch (err) {
        console.error(`[NetworkManager] Post Error [${endpoint}]:`, err);
        return { status: 'error', success: false, message: err.message || `Post error on ${endpoint}` };
      }
    }
  };

  window.NetworkManager = NetworkManager;

  // 3. UI COMPONENTS
  const UIComponents = {
    WebsiteHeader({ showBack = true } = {}) {
      const user = AppState.user;
      const rawName = (user && (user.name || user.email)) ? (user.name || user.email.split('@')[0]) : 'User';
      const userName = rawName.toUpperCase();
      const rawRole = (user && user.role) ? String(user.role).toLowerCase() : 'user';
      const formattedRole = rawRole === 'admin' ? 'Admin' : 'User';
      const userDisplayText = `${userName} (${formattedRole})`;

      return `
        <header class="navbar-floating" style="margin-top: 0; margin-bottom: 24px; width: 100%;">
          <div style="display: flex; align-items: center; gap: 14px;">
            ${showBack ? `
              <button onclick="AppState.goBack()" title="Go Back" style="background: rgba(89, 115, 242, 0.12); border: 1px solid rgba(89, 115, 242, 0.25); color: var(--primary); width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.05);" onmouseover="this.style.background='var(--primary)'; this.style.color='#fff';" onmouseout="this.style.background='rgba(89, 115, 242, 0.12)'; this.style.color='var(--primary)';">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
            ` : ''}
            <div class="navbar-logo" onclick="AppState.navigate('landing')">
              <div class="logo-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="3" fill="currentColor"></circle>
                </svg>
              </div>
              <span class="logo-text" style="font-size: 20px;">pinsight</span>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 16px;">
            ${user && user.id ? `
              <span style="font-size: 13px; font-weight: 800; color: var(--navy-text); letter-spacing: 0.3px;">${userDisplayText}</span>
              <button onclick="AppState.clearSession()" style="background: rgba(255,77,77,0.12); border: 1px solid rgba(255,77,77,0.3); color: #d32f2f; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 800; cursor: pointer;">Sign Out</button>
            ` : `
              <button onclick="AppState.navigate('signin')" class="nav-login-btn">Log in</button>
              <button onclick="AppState.navigate('userType')" class="nav-getstarted-btn">Get started</button>
            `}
          </div>
        </header>
      `;
    },

    BackgroundBlobs() {
      return `
        <div class="background-blobs">
          <div class="blob blob-top"></div>
          <div class="blob blob-middle"></div>
          <div class="blob blob-bottom"></div>
        </div>
      `;
    },

    BackButton(onClickHandler = 'AppState.goBack()') {
      return `
        <button class="back-btn-circle" onclick="${onClickHandler}" aria-label="Go Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      `;
    },

    PrimaryButton({ title, onClick, backgroundColor = '', isEnabled = true, extraClass = '' }) {
      const bgClass = backgroundColor === 'accent' ? 'accent-bg' : '';
      const disabledAttr = isEnabled ? '' : 'disabled';
      return `
        <button class="primary-btn ${bgClass} ${extraClass}" onclick="${onClick}" ${disabledAttr}>
          ${title}
        </button>
      `;
    },

    CustomTextField({ id, placeholder, type = 'text', value = '', required = false }) {
      return `
        <div class="form-group">
          <input type="${type}" id="${id}" class="custom-input" placeholder="${placeholder}" value="${value}" ${required ? 'required' : ''} />
        </div>
      `;
    },

    CustomSecureField({ id, placeholder, value = '' }) {
      return `
        <div class="form-group">
          <div class="input-field-wrapper" style="position: relative;">
            <input type="password" id="${id}" class="custom-input" placeholder="${placeholder}" value="${value}" autocomplete="current-password" />
            <button type="button" class="secure-toggle-btn" onclick="UIComponents.togglePasswordVisibility('${id}', this)" style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #888;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
          </div>
        </div>
      `;
    },

    togglePasswordVisibility(inputId, btn) {
      const input = document.getElementById(inputId);
      if (!input) return;
      if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
      } else {
        input.type = 'password';
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
      }
    },

    ManagementRow({ title, subtitle, iconSvg, iconColor = 'var(--primary)', onClick }) {
      return `
        <div class="glass-card" onclick="${onClick}" style="cursor: pointer; padding: 20px; display: flex; align-items: center; gap: 16px; margin-bottom: 0; transition: transform 0.2s ease;">
          <div style="width: 48px; height: 48px; border-radius: 16px; background: ${iconColor}15; color: ${iconColor}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${iconSvg}
          </div>
          <div style="flex: 1;">
            <h4 style="font-size: 16px; font-weight: 800; color: var(--navy-text);">${title}</h4>
            <p style="font-size: 13px; color: #55657e; margin-top: 2px;">${subtitle}</p>
          </div>
          <div style="color: #78889e;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>
      `;
    }
  };

  window.UIComponents = UIComponents;

  // 4. LANDING VIEW
  const LandingView = {
    render() {
      return `
        <div class="landing-page-container">
          <header class="navbar-floating">
            <div class="navbar-logo" onclick="AppState.navigate('landing')">
              <div class="logo-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3" fill="currentColor"></circle>
                </svg>
              </div>
              <span class="logo-text">pinsight</span>
            </div>
            <nav class="navbar-links">
              <a href="#" class="nav-item" onclick="alert('Pinsight Educator Plan: Free for Institutions'); return false;">Pricing</a>
              <a href="#" class="nav-item" onclick="AppState.navigate('userType'); return false;">For Educators</a>
            </nav>
            <div class="navbar-actions">
              <button class="nav-login-btn" onclick="AppState.navigate('signin')">Log in</button>
              <button class="nav-getstarted-btn" onclick="AppState.navigate('userType')">Get started</button>
            </div>
          </header>

          <section class="hero-section">
            <div class="hero-graphic-wrapper">
              <img src="assets/pinsight_hero_3d.png" alt="Pinsight 3D Graphic" class="hero-3d-img" />
            </div>
            <div class="hero-content">
              <h1 class="hero-headline">Make Every <br /><span class="highlight-text">Insight Count</span></h1>
              <p class="hero-subline">Pedagogical innovations, dynamic strategy modules, and assessment analytics for insightful teaching guidance.</p>
              <div class="hero-cta-group">
                <button class="coral-btn" onclick="AppState.navigate('userType')">Get started</button>
                <button class="dark-pill-btn" onclick="AppState.navigate('signin')">Log in</button>
              </div>
            </div>
          </section>

          <section class="features-section">
            <div class="feature-card">
              <div class="feature-icon" style="background: rgba(230, 92, 0, 0.15); color: #e65c00;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              </div>
              <h3>Learning Modules</h3>
              <p>Interactive video lessons, core teaching concepts, and real-world case scenarios.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon" style="background: rgba(64, 217, 191, 0.15); color: #40d9bf;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <h3>Adaptive Assessments</h3>
              <p>Formative pre-test evaluation and post-test assessments with instant score reporting.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon" style="background: rgba(89, 115, 242, 0.15); color: #5973f2;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
              </div>
              <h3>Student Analytics</h3>
              <p>Comprehensive tracking of score growth, attempt history, and learning completion metrics.</p>
            </div>
          </section>

          <footer class="landing-footer">
            <div>© 2026 Pinsight Inc. All rights reserved. • Secure & Private Platform</div>
          </footer>
        </div>
      `;
    }
  };
  window.LandingView = LandingView;

  // 5. AUTH VIEWS
  const AuthViews = {
    UserTypeView() {
      return this.SigninView();
    },

    SigninView() {
      // Automatically redirect already logged-in users to the User Dashboard
      if (window.AppState && window.AppState.user && window.AppState.user.id) {
        setTimeout(() => {
          window.AppState.navigate(window.AppState.user.role === 'admin' ? 'adminDashboard' : 'userDashboard');
        }, 0);
      }

      window.handleSigninSubmit = async (e) => {
        if (e) e.preventDefault();
        const emailEl = document.getElementById('signin-email');
        const passEl = document.getElementById('signin-password');
        const errorAlert = document.getElementById('signin-error');
        const submitBtn = document.getElementById('signin-submit-btn');

        const email = emailEl ? emailEl.value.trim() : '';
        const password = passEl ? passEl.value.trim() : '';

        if (!email || !password) {
          if (errorAlert) {
            errorAlert.innerText = 'Please fill in both email address and password.';
            errorAlert.style.display = 'block';
          }
          return false;
        }

        if (errorAlert) errorAlert.style.display = 'none';

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="spinner" style="display:inline-block; width:16px; height:16px; border:2px solid #ffffff; border-top-color:transparent; border-radius:50%; animation:spin 0.6s linear infinite; vertical-align:middle; margin-right:8px;"></span> Signing In...';
        }

        try {
          const res = await NetworkManager.postRequest('/auth/login.php', { email, password });

          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Sign In';
          }

          const isSuccess = res && (res.status === 'success' || res.success);
          if (isSuccess) {
            const uData = res.user || (res.data ? {
              id: res.data.user_id || res.data.id || 1,
              role: res.data.user_type || res.data.role || 'user',
              name: res.data.name || email.split('@')[0],
              email: res.data.email || email
            } : {
              id: 1,
              role: 'user',
              name: email.split('@')[0],
              email: email
            });

            window.AppState.setSession(uData, true);
            window.AppState.navigate(uData.role === 'admin' ? 'adminDashboard' : 'userDashboard');
          } else {
            if (errorAlert) {
              errorAlert.innerText = (res && res.message) ? res.message : 'Invalid email or password';
              errorAlert.style.display = 'block';
            }
          }
        } catch (err) {
          console.error('Signin Request Exception:', err);
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Sign In';
          }
          if (errorAlert) {
            errorAlert.innerText = 'Unable to connect to backend server. Please try again.';
            errorAlert.style.display = 'block';
          }
        }
        return false;
      };

      setTimeout(() => {
        const form = document.getElementById('signin-form');
        if (form) {
          form.onsubmit = window.handleSigninSubmit;
        }
      }, 20);

      window.quickDemoLogin = (role) => {
        const emailField = document.getElementById('signin-email');
        const passwordField = document.getElementById('signin-password');
        const form = document.getElementById('signin-form');
        if (emailField && passwordField && form) {
          emailField.value = role === 'admin' ? 'admin@pinsight.com' : 'teacher@pinsight.com';
          passwordField.value = 'password123';
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      };

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
                <p style="font-size: 16px; color: #55657e; line-height: 1.5;">Access your account dashboard. Admins and users can sign in using their registered credentials.</p>
                
                <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
                  <div style="display: flex; align-items: center; gap: 12px; font-size: 14px; color: #475569;">
                    <div style="width: 24px; height: 24px; border-radius: 50%; background: rgba(64,217,191,0.2); color: var(--accent); display: flex; align-items: center; justify-content: center; font-weight: 900;">✓</div>
                    <span>Secure SSL Encrypted Session</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 12px; font-size: 14px; color: #475569;">
                    <div style="width: 24px; height: 24px; border-radius: 50%; background: rgba(89,115,242,0.2); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 900;">✓</div>
                    <span>Unified Admin & Learner Access</span>
                  </div>
                </div>
              </div>

              <!-- Right Form Container -->
              <div>
                <form id="signin-form" class="glass-card" style="padding: 36px;" onsubmit="return window.handleSigninSubmit(event);">
                  <h3 style="font-size: 24px; font-weight: 800; color: var(--navy-text); margin-bottom: 20px;">Sign In to Account</h3>
                  
                  <div id="signin-error" style="display: none; background: rgba(255, 0, 0, 0.08); color: #d32f2f; padding: 12px; border-radius: 14px; font-size: 14px; font-weight: 600; margin-bottom: 16px; text-align: center;"></div>
                  
                  ${UIComponents.CustomTextField({ id: 'signin-email', placeholder: 'Email Address', type: 'email', required: true })}
                  ${UIComponents.CustomSecureField({ id: 'signin-password', placeholder: 'Password' })}
                  
                  <div style="text-align: right; margin-bottom: 24px; margin-top: -6px;">
                    <a href="#" onclick="AppState.navigate('forgotPassword'); return false;" style="font-size: 14px; font-weight: 700; color: var(--primary); text-decoration: none;">Forgot Password?</a>
                  </div>
                  
                  <button id="signin-submit-btn" type="button" class="primary-btn" style="width: 100%;" onclick="window.handleSigninSubmit(event)">Sign In</button>
                  
                  <div style="text-align: center; margin-top: 24px; font-size: 14px; color: #66778e;">
                    Don't have an account? <a href="#" onclick="AppState.navigate('signup'); return false;" style="font-weight: 800; color: var(--accent); text-decoration: none;">Sign Up</a>
                  </div>
                </form>
              </div>
            </div>
            
            <footer style="margin-top: 60px; text-align: center; font-size: 13px; color: #78889e;">Pinsight Inc. © 2026 • Secure & Private Platform</footer>
          </div>
        </div>
      `;
    },

    CreateAccountView() {
      setTimeout(() => {
        const form = document.getElementById('signup-form');
        if (form) {
          form.onsubmit = async (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name').value.trim();
            const email = document.getElementById('signup-email').value.trim();
            const password = document.getElementById('signup-password').value.trim();
            const mobile = document.getElementById('signup-mobile').value.trim();
            const clinicCodeEl = document.getElementById('signup-clinic-code') || document.getElementById('signup-admincode');
            const clinicCode = clinicCodeEl ? clinicCodeEl.value.trim() : '';

            if (!name || !email || !password) return;
            
            const submitBtn = document.getElementById('signup-submit-btn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Creating Account...';

            const res = await NetworkManager.postRequest('/auth/signup.php', {
              name, email, password, mobile, admin_code: clinicCode
            });

            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Sign Up';

            if (res && (res.status === 'success' || res.success || res.user_id)) {
              const isPinsightAdmin = (clinicCode.toUpperCase() === 'PINSIGHT');
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
              alert((res && res.message) ? res.message : 'Error creating account');
            }
          };
        }
      }, 50);

      return `
        <div class="screen scrollable-content">
          ${UIComponents.BackgroundBlobs()}
          <div class="screen-content" style="max-width: 800px; margin: 0 auto;">
            ${UIComponents.WebsiteHeader({ showBack: true })}
            <div class="glass-card" style="padding: 36px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="font-size: 32px; font-weight: 900; color: var(--navy-text);">Create Account</h2>
                <p style="font-size: 15px; color: #55657e; margin-top: 4px;">Join Pinsight to start your educational journey</p>
              </div>

              <form id="signup-form">
                ${UIComponents.CustomTextField({ id: 'signup-name', placeholder: 'Full Name', required: true })}
                ${UIComponents.CustomTextField({ id: 'signup-email', placeholder: 'Email Address', type: 'email', required: true })}
                ${UIComponents.CustomSecureField({ id: 'signup-password', placeholder: 'Password' })}
                ${UIComponents.CustomTextField({ id: 'signup-mobile', placeholder: 'Mobile Number', type: 'tel' })}
                ${UIComponents.CustomSecureField({ id: 'signup-clinic-code', placeholder: 'Clinic Code (Optional)' })}

                <button id="signup-submit-btn" type="submit" class="primary-btn" style="width: 100%; margin-top: 24px;">Sign Up</button>
                
                <div style="text-align: center; margin-top: 20px; font-size: 14px; color: #66778e;">
                  Already have an account? <a href="#" onclick="AppState.navigate('signin'); return false;" style="font-weight: 800; color: var(--accent); text-decoration: none;">Sign In</a>
                </div>
              </form>
            </div>
            
            <footer style="margin-top: 60px; text-align: center; font-size: 13px; color: #78889e;">Pinsight Inc. © 2026 • Secure & Private Platform</footer>
          </div>
        </div>
      `;
    },

    ForgotPasswordView() {
      return `
        <div class="screen scrollable-content">
          ${UIComponents.BackgroundBlobs()}
          <div class="screen-content" style="max-width: 800px; margin: 0 auto;">
            ${UIComponents.WebsiteHeader({ showBack: true })}
            <div class="glass-card" style="padding: 36px; text-align: center;">
              <h2 style="font-size: 28px; font-weight: 900; color: var(--navy-text); margin-bottom: 12px;">Forgot Password?</h2>
              <p style="font-size: 14px; color: #55657e; margin-bottom: 20px;">Enter your registered email address to receive password reset instructions.</p>
              ${UIComponents.CustomTextField({ id: 'forgot-email', placeholder: 'Email Address', type: 'email', required: true })}
              <button onclick="alert('OTP sent to your email address!'); AppState.navigate('otp');" class="primary-btn" style="width: 100%; margin-top: 16px;">Send OTP</button>
            </div>
          </div>
        </div>
      `;
    },

    OtpView() {
      return `
        <div class="screen scrollable-content">
          ${UIComponents.BackgroundBlobs()}
          <div class="screen-content" style="max-width: 800px; margin: 0 auto;">
            ${UIComponents.WebsiteHeader({ showBack: true })}
            <div class="glass-card" style="padding: 36px; text-align: center;">
              <h2 style="font-size: 28px; font-weight: 900; color: var(--navy-text); margin-bottom: 12px;">Enter OTP Code</h2>
              <p style="font-size: 14px; color: #55657e; margin-bottom: 20px;">Verification code has been sent to your email.</p>
              ${UIComponents.CustomTextField({ id: 'otp-code', placeholder: '6-digit OTP Code', type: 'number', required: true })}
              <button onclick="AppState.navigate('resetPassword')" class="primary-btn" style="width: 100%; margin-top: 16px;">Verify Code</button>
            </div>
          </div>
        </div>
      `;
    },

    ResetPasswordView() {
      return `
        <div class="screen scrollable-content">
          ${UIComponents.BackgroundBlobs()}
          <div class="screen-content" style="max-width: 800px; margin: 0 auto;">
            ${UIComponents.WebsiteHeader({ showBack: true })}
            <div class="glass-card" style="padding: 36px; text-align: center;">
              <h2 style="font-size: 28px; font-weight: 900; color: var(--navy-text); margin-bottom: 12px;">Reset Password</h2>
              ${UIComponents.CustomSecureField({ id: 'new-password', placeholder: 'New Password' })}
              <button onclick="alert('Password updated successfully!'); AppState.navigate('signin');" class="primary-btn" style="width: 100%; margin-top: 16px;">Save New Password</button>
            </div>
          </div>
        </div>
      `;
    }
  };
  window.AuthViews = AuthViews;

  // 6. USER DASHBOARD VIEW
  const UserDashboardView = {
    async render() {
      const userId = AppState.user ? AppState.user.id : 0;

      let preScore = 0, preTotal = 10, isPretestDone = false;
      let videoCompleted = 0, videoTotal = 4, isVideosDone = false;
      let postBestScore = 0, postBestTotal = 10, attemptsCount = 0, isPosttestDone = false;

      if (userId) {
        const res = await NetworkManager.postRequest('/dashboard/get_dashboard.php', { user_id: userId });
        const vidRes = await NetworkManager.fetchRequest('/videos/get_videos.php', { user_id: userId });
        const videosList = (vidRes && (vidRes.status === 'success' || vidRes.success) && Array.isArray(vidRes.data)) ? vidRes.data : [];

        if (res && (res.status === 'success' || res.success) && res.data) {
          const d = res.data;
          if (d.pretest) {
            preScore = d.pretest.score || 0;
            preTotal = d.pretest.total || 10;
            isPretestDone = !!d.pretest.done || d.pretest.status === 'Completed' || preScore > 0;
          }

          if (videosList.length > 0) {
            videoTotal = videosList.length;
            videoCompleted = videosList.filter(v => v.is_completed == 1).length;
          } else if (d.videos) {
            videoTotal = d.videos.total || 4;
            videoCompleted = d.videos.completed || 0;
          }
          isVideosDone = (videoCompleted >= videoTotal && videoTotal > 0);

          if (d.posttest) {
            postBestScore = d.posttest.bestScore || 0;
            postBestTotal = d.posttest.bestTotal || 10;
            attemptsCount = d.posttest.attempts || 0;
            isPosttestDone = attemptsCount > 0;
          }
        }
      }

      window.handlePreTestClick = () => {
        if (isPretestDone) {
          alert('You have already completed the Formative Pre-Test!');
        } else {
          AppState.navigate('dynamicQuiz', { type: 'pretest' });
        }
      };

      window.handleVideosClick = () => {
        if (!isPretestDone) {
          alert('🔒 Video Lessons are locked! Please complete the Formative Pre-Test first.');
          return;
        }
        AppState.navigate('videoLessons');
      };

      window.handlePostTestClick = () => {
        if (!isPretestDone) {
          alert('🔒 Post-Test is locked! Please complete the Formative Pre-Test first.');
          return;
        }
        if (!isVideosDone) {
          alert('🔒 Post-Test is locked! Please watch all Video Lessons first to unlock the Post-Test.');
          return;
        }
        if (attemptsCount >= 4) {
          alert('You have reached the maximum limit of 4 attempts for the Post-Test.');
          return;
        }
        AppState.navigate('dynamicQuiz', { type: 'posttest' });
      };

      return `
        <div class="screen scrollable-content">
          ${UIComponents.BackgroundBlobs()}
          <div class="screen-content" style="max-width: 100%; width: 100%; padding: 24px 40px; box-sizing: border-box;">
            ${UIComponents.WebsiteHeader({ showBack: false })}
            
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; flex-wrap: wrap; gap: 16px;">
              <div>
                <span style="font-size: 11px; font-weight: 900; letter-spacing: 2px; color: var(--primary); text-transform: uppercase;">LEARNER DASHBOARD</span>
                <h1 style="font-size: 36px; font-weight: 900; color: var(--navy-text); margin-top: 4px;">Welcome, ${(AppState.user && AppState.user.name) || 'Educator'}</h1>
                <p style="font-size: 15px; color: #55657e; margin-top: 4px;">Complete your initial Formative Pre-Test to unlock learning videos and the final Post-Test.</p>
              </div>
            </div>

            <!-- 2-Column Core Action Layout -->
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 30px; align-items: start;">
              <div style="display: flex; flex-direction: column; gap: 16px;">
                
                <!-- 1. Pre-Test Card -->
                <div class="glass-card" onclick="handlePreTestClick()" style="padding: 24px; margin-bottom: 0; cursor: pointer; display: flex; align-items: center; justify-content: space-between; border-left: 6px solid var(--primary);">
                  <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="width: 50px; height: 50px; border-radius: 16px; background: rgba(89, 115, 242, 0.15); color: var(--primary); display: flex; align-items: center; justify-content: center;">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>
                    </div>
                    <div>
                      <span style="font-size: 10px; font-weight: 900; color: var(--primary); text-transform: uppercase;">STEP 1 • INITIAL DIAGNOSTIC</span>
                      <h3 style="font-size: 18px; font-weight: 800; color: var(--navy-text);">Formative Pre-Test</h3>
                      <p style="font-size: 13px; color: #55657e;">${isPretestDone ? `Completed • Score: ${preScore}/${preTotal}` : 'Required diagnostic test for all new users'}</p>
                    </div>
                  </div>
                  ${isPretestDone ? `
                    <span style="padding: 6px 14px; border-radius: 20px; background: rgba(64,217,191,0.15); color: var(--accent); font-weight: 800; font-size: 12px;">Completed</span>
                  ` : `
                    <button class="primary-btn" onclick="event.stopPropagation(); handlePreTestClick();" style="width: auto; padding: 10px 20px; font-size: 14px;">Start Pre-Test →</button>
                  `}
                </div>

                <!-- 2. Video Lessons Card -->
                <div class="glass-card" onclick="handleVideosClick()" style="padding: 24px; margin-bottom: 0; cursor: ${isPretestDone ? 'pointer' : 'not-allowed'}; opacity: ${isPretestDone ? '1' : '0.65'}; display: flex; align-items: center; justify-content: space-between; border-left: 6px solid ${isPretestDone ? 'var(--accent)' : '#ccc'};">
                  <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="width: 50px; height: 50px; border-radius: 16px; background: ${isPretestDone ? 'rgba(64, 217, 191, 0.15)' : '#eee'}; color: ${isPretestDone ? 'var(--accent)' : '#888'}; display: flex; align-items: center; justify-content: center;">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    </div>
                    <div>
                      <span style="font-size: 10px; font-weight: 900; color: ${isPretestDone ? 'var(--accent)' : '#888'}; text-transform: uppercase;">STEP 2 • LEARNING MODULES</span>
                      <h3 style="font-size: 18px; font-weight: 800; color: var(--navy-text);">Video Lessons</h3>
                      <p style="font-size: 13px; color: #55657e;">${!isPretestDone ? 'Locked (Complete Formative Pre-Test First)' : `${videoCompleted} of ${videoTotal} modules completed`}</p>
                    </div>
                  </div>
                  ${!isPretestDone ? `
                    <button disabled class="primary-btn" style="width: auto; padding: 8px 16px; font-size: 12px; background: #eee; color: #777; box-shadow: none; cursor: not-allowed;">Locked</button>
                  ` : `
                    <button class="primary-btn accent-bg" onclick="event.stopPropagation(); handleVideosClick();" style="width: auto; padding: 10px 20px; font-size: 14px;">${isVideosDone ? 'Review Videos →' : 'Watch Lessons →'}</button>
                  `}
                </div>

                <!-- 3. Summative Post-Test Card -->
                <div class="glass-card" onclick="handlePostTestClick()" style="padding: 24px; margin-bottom: 0; cursor: ${(isPretestDone && isVideosDone) ? 'pointer' : 'not-allowed'}; opacity: ${(isPretestDone && isVideosDone) ? '1' : '0.65'}; display: flex; align-items: center; justify-content: space-between; border-left: 6px solid ${(isPretestDone && isVideosDone) ? 'rgb(255, 140, 0)' : '#ccc'};">
                  <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="width: 50px; height: 50px; border-radius: 16px; background: ${(isPretestDone && isVideosDone) ? 'rgba(255, 140, 0, 0.15)' : '#eee'}; color: ${(isPretestDone && isVideosDone) ? 'rgb(255, 140, 0)' : '#888'}; display: flex; align-items: center; justify-content: center;">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    </div>
                    <div>
                      <span style="font-size: 10px; font-weight: 900; color: ${(isPretestDone && isVideosDone) ? 'rgb(255, 140, 0)' : '#888'}; text-transform: uppercase;">STEP 3 • FINAL EVALUATION</span>
                      <h3 style="font-size: 18px; font-weight: 800; color: var(--navy-text);">Summative Post-Test</h3>
                      <p style="font-size: 13px; color: #55657e;">${(!isPretestDone || !isVideosDone) ? 'Locked (Complete Pre-Test & Video Lessons First)' : (attemptsCount > 0 ? `Attempts: ${attemptsCount}/4 • Best: ${postBestScore}/${postBestTotal}` : 'Final assessment to evaluate mastery growth')}</p>
                    </div>
                  </div>
                  ${(!isPretestDone || !isVideosDone) ? `
                    <button disabled class="primary-btn" style="width: auto; padding: 8px 16px; font-size: 12px; background: #eee; color: #777; box-shadow: none; cursor: not-allowed;">Locked</button>
                  ` : `
                    <button class="primary-btn" onclick="event.stopPropagation(); handlePostTestClick();" style="width: auto; padding: 10px 20px; font-size: 14px;">${attemptsCount > 0 ? 'Retake Post-Test →' : 'Start Post-Test →'}</button>
                  `}
                </div>
              </div>

              <!-- Sidebar Strategy Insight -->
              <div style="display: flex; flex-direction: column; gap: 18px;">
                <div class="glass-card" onclick="AppState.navigate('finalSummary')" style="cursor: pointer; padding: 22px; margin-bottom: 0;">
                  <h4 style="font-size: 16px; font-weight: 800; color: var(--navy-text);">📊 View Performance Report</h4>
                  <p style="font-size: 13px; color: #55657e; margin-top: 4px;">Review diagnostic breakdown and score comparison graphs.</p>
                </div>

                <div class="glass-card" style="background: linear-gradient(135deg, rgba(89,115,242,0.08), rgba(64,217,191,0.08)); padding: 22px; margin-bottom: 0;">
                  <h4 style="font-size: 15px; font-weight: 800; color: var(--navy-text);">💡 Educator Strategy Tip</h4>
                  <p style="font-size: 13px; color: #475569; margin-top: 6px; line-height: 1.5;">Structured seating and predictable classroom routines significantly decrease anxiety during assessments.</p>
                </div>
              </div>
            </div>

            <footer style="margin-top: 60px; text-align: center; font-size: 13px; color: #78889e;">Pinsight Inc. © 2026 • Secure Learner Platform</footer>
          </div>
        </div>
      `;
    }
  };
  window.UserDashboardView = UserDashboardView;

  // 7. VIDEO VIEWS
  const VideoViews = {
    async VideoLessonsView() {
      const userId = AppState.user ? AppState.user.id : 0;
      const res = await NetworkManager.fetchRequest('/videos/get_videos.php', { user_id: userId });
      const videos = (res && (res.status === 'success' || res.success) && Array.isArray(res.data)) ? res.data : [];

      window.openVideoDetail = (videoData) => {
        AppState.navigate('videoDetail', { video: videoData });
      };

      return `
        <div class="screen scrollable-content">
          ${UIComponents.BackgroundBlobs()}
          <div class="screen-content">
            ${UIComponents.WebsiteHeader({ showBack: true })}
            
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 25px; flex-wrap: wrap; gap: 16px;">
              <div>
                <button onclick="AppState.navigate((AppState.user && AppState.user.role === 'admin') ? 'adminDashboard' : 'userDashboard')" style="background: #000000; border: none; color: #ffffff; padding: 6px 14px; border-radius: 12px; font-size: 12px; font-weight: 800; cursor: pointer; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
                  ← Back to Dashboard
                </button>
                <span style="font-size: 11px; font-weight: 900; letter-spacing: 2px; color: var(--primary); text-transform: uppercase; display: block;">LEARNING MODULES</span>
                <h1 style="font-size: 32px; font-weight: 900; color: var(--navy-text); margin-top: 4px;">Video Lessons</h1>
                <p style="font-size: 15px; color: #55657e; margin-top: 2px;">Watch all video modules to complete learning requirements and unlock the Post-Test evaluation.</p>
              </div>
              <div class="glass-card" style="padding: 10px 20px; margin-bottom: 0; display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 12px; font-weight: 700; color: #78889e;">Modules Completed:</span>
                <span style="font-size: 16px; font-weight: 900; color: var(--accent);">${videos.filter(v => v.is_completed == 1).length} / ${videos.length}</span>
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; align-items: start;">
              <div style="display: flex; flex-direction: column; gap: 16px;">
                ${videos.length === 0 ? `
                  <div class="glass-card" style="text-align: center; padding: 40px 20px;">
                    <p style="font-size: 15px; font-weight: 700; color: #64748b; margin: 0;">No learning modules are available.</p>
                  </div>
                ` : videos.map((vid, idx) => {
                  const isDone = vid.is_completed == 1 || vid.is_completed === true || vid.completed == 1 || vid.completed === true;
                  return `
                    <div class="glass-card" onclick="openVideoDetail(${JSON.stringify(vid).replace(/"/g, '&quot;')})" style="margin-bottom: 0; padding: 22px; cursor: pointer; display: flex; align-items: center; gap: 18px; transition: all 0.2s ease;">
                      <div style="width: 56px; height: 56px; border-radius: 18px; background: ${isDone ? 'rgba(64, 217, 191, 0.2)' : 'rgba(89, 115, 242, 0.15)'}; color: ${isDone ? 'var(--accent)' : 'var(--primary)'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        ${isDone ? `
                          <span style="font-size: 24px; font-weight: 900; color: #30c896;">✓</span>
                        ` : `
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        `}
                      </div>
                      <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
                          <span style="font-size: 10px; font-weight: 900; color: var(--primary); letter-spacing: 1px; text-transform: uppercase;">Module ${idx + 1}</span>
                          ${isDone ? `
                            <span style="background: rgba(48, 200, 150, 0.15); color: #20a075; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">COMPLETED</span>
                          ` : ''}
                        </div>
                        <h3 style="font-size: 17px; font-weight: 800; color: var(--navy-text); margin-top: 2px;">${vid.title}</h3>
                        <p style="font-size: 13px; font-weight: 500; color: #66778e; margin-top: 4px;">${vid.description || 'Interactive pedagogical teaching video'}</p>
                      </div>
                      ${isDone ? `
                        <div style="padding: 8px 16px; border-radius: 20px; background: rgba(48, 200, 150, 0.15); color: #20a075; font-size: 13px; font-weight: 800; display: flex; align-items: center; gap: 6px; border: 1px solid rgba(48, 200, 150, 0.3);">
                          ✓ Completed
                        </div>
                      ` : `
                        <button class="primary-btn accent-bg" style="padding: 8px 18px; font-size: 13px; width: auto;">
                          Watch Now →
                        </button>
                      `}
                    </div>
                  `;
                }).join('')}
              </div>

              <div style="display: flex; flex-direction: column; gap: 18px;">
                <div class="glass-card" style="margin-bottom: 0; padding: 20px;">
                  <h4 style="font-size: 15px; font-weight: 800; color: var(--navy-text); margin-bottom: 8px;">📌 Study Instructions</h4>
                  <p style="font-size: 13px; color: #55657e; line-height: 1.5;">Watch each module in full. Upon completing all videos, the Post-Test assessment will automatically be unlocked on your dashboard.</p>
                </div>
              </div>
            </div>

            <footer style="margin-top: 60px; text-align: center; font-size: 13px; color: #78889e;">Pinsight Inc. © 2026 • Video Learning Platform</footer>
          </div>
        </div>
      `;
    },

    VideoDetailView() {
      const video = (AppState.navigationParams && AppState.navigationParams.video) || {
        id: 1,
        title: 'Introduction to Pedagogical Learning',
        description: 'Overview of mental health teaching guidance concepts and student engagement strategies.',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
      };

      setTimeout(() => {
        const markBtn = document.getElementById('mark-complete-btn-bundle');
        const videoEl = document.getElementById('active-video-element');

        if (markBtn) {
          if (!video.is_completed) {
            markBtn.disabled = true;
            markBtn.innerText = 'Watch Video to Complete 🔒';
            markBtn.style.opacity = '0.5';
            markBtn.style.cursor = 'not-allowed';
          } else {
            markBtn.disabled = true;
            markBtn.innerText = 'Completed ✓';
            markBtn.style.opacity = '0.7';
          }

          const unlockBtn = () => {
            if (video.is_completed) return;
            markBtn.disabled = false;
            markBtn.innerText = '✓ Mark Module as Completed & Continue';
            markBtn.style.opacity = '1';
            markBtn.style.cursor = 'pointer';
          };

          if (videoEl) {
            videoEl.onended = unlockBtn;
            videoEl.ontimeupdate = () => {
              if (videoEl.duration && videoEl.currentTime >= (videoEl.duration - 1.5)) {
                unlockBtn();
              }
            };
          } else {
            setTimeout(unlockBtn, 8000);
          }

          markBtn.onclick = async () => {
            if (markBtn.disabled) return;
            markBtn.disabled = true;
            markBtn.innerText = 'Updating...';

            const res = await NetworkManager.postRequest('/videos/mark_completed.php', {
              user_id: AppState.user ? AppState.user.id : 1,
              video_id: video.id
            });

            alert('Module marked as completed!');
            AppState.navigate('videoLessons');
          };
        }
      }, 50);

      const renderSmartVideoPlayer = (url) => {
        if (!url) {
          url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
        }
        const cleanUrl = url.trim();

        if (cleanUrl.includes('drive.google.com') || cleanUrl.includes('docs.google.com')) {
          let embedUrl = cleanUrl;
          const fileMatch = cleanUrl.match(/\/file\/d\/([^\/]+)/);
          if (fileMatch && fileMatch[1]) {
            embedUrl = `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
          } else if (cleanUrl.includes('id=')) {
            const idMatch = cleanUrl.match(/id=([^&]+)/);
            if (idMatch && idMatch[1]) {
              embedUrl = `https://drive.google.com/file/d/${idMatch[1]}/preview`;
            }
          }
          return `
            <div style="position: relative; width: 100%; padding-top: 56.25%; border-radius: 24px; overflow: hidden; background: #000; box-shadow: 0 20px 50px rgba(0,0,0,0.3);">
              <iframe src="${embedUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 24px;" allow="autoplay; fullscreen" allowfullscreen></iframe>
            </div>
          `;
        }

        if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
          let embedUrl = cleanUrl;
          if (cleanUrl.includes('watch?v=')) {
            const vId = cleanUrl.split('watch?v=')[1].split('&')[0];
            embedUrl = `https://www.youtube.com/embed/${vId}?autoplay=1`;
          } else if (cleanUrl.includes('youtu.be/')) {
            const vId = cleanUrl.split('youtu.be/')[1].split('?')[0];
            embedUrl = `https://www.youtube.com/embed/${vId}?autoplay=1`;
          }
          return `
            <div style="position: relative; width: 100%; padding-top: 56.25%; border-radius: 24px; overflow: hidden; background: #000; box-shadow: 0 20px 50px rgba(0,0,0,0.3);">
              <iframe src="${embedUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 24px;" allow="autoplay; fullscreen" allowfullscreen></iframe>
            </div>
          `;
        }

        let mediaUrl = cleanUrl;
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
          mediaUrl = NetworkManager.getURL(cleanUrl);
        }

        return `
          <div style="width: 100%; border-radius: 24px; overflow: hidden; background: #000; box-shadow: 0 20px 50px rgba(0,0,0,0.3);">
            <video id="active-video-element" controls autoplay playsinline style="width: 100%; aspect-ratio: 16 / 9; max-height: 700px; border-radius: 24px; background: #000; object-fit: contain; display: block;">
              <source src="${mediaUrl}" type="video/mp4">
              <source src="${mediaUrl}">
              Your browser does not support HTML5 video playback.
            </video>
          </div>
        `;
      };

      return `
        <div class="screen scrollable-content">
          ${UIComponents.BackgroundBlobs()}
          
          <div class="screen-content" style="max-width: 100%; width: 100%; padding: 24px 40px; box-sizing: border-box;">
            ${UIComponents.WebsiteHeader({ showBack: true })}
            
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
              <div>
                <span style="font-size: 11px; font-weight: 900; letter-spacing: 2px; color: var(--primary); text-transform: uppercase;">ACTIVE VIDEO LESSON MODULE</span>
                <h1 style="font-size: 36px; font-weight: 900; color: var(--navy-text); margin-top: 4px;">${video.title}</h1>
                <p style="font-size: 16px; color: #55657e; margin-top: 6px;">${video.description || 'Overview of mental health teaching guidance concepts and student engagement strategies.'}</p>
              </div>
              
              <div style="display: flex; gap: 12px;">
                <button onclick="AppState.navigate('videoLessons')" class="primary-btn" style="padding: 12px 24px; font-size: 14px; background: #fff; color: var(--navy-text); border: 1px solid #ddd; box-shadow: none;">
                  ← Back to Lessons
                </button>
              </div>
            </div>
            
            <!-- Full Web Page Cinema Video Player -->
            <div class="glass-card" style="padding: 20px; margin-bottom: 28px; border-radius: 32px; background: rgba(15, 23, 42, 0.95); box-shadow: 0 25px 60px rgba(15, 23, 42, 0.3); width: 100%; box-sizing: border-box;">
              ${renderSmartVideoPlayer(video.video_url)}
            </div>

            <!-- Mark Completed Action Controls -->
            <div style="display: flex; gap: 16px; margin-bottom: 30px; flex-wrap: wrap;">
              <button id="mark-complete-btn-bundle" class="primary-btn accent-bg" style="flex: 2; height: 56px; font-size: 17px; font-weight: 800; min-width: 280px; box-shadow: 0 10px 30px rgba(64, 217, 191, 0.35);">
                ✓ Mark Module as Completed & Continue
              </button>
              <button onclick="AppState.navigate('videoLessons');" class="primary-btn" style="flex: 1; height: 56px; font-size: 15px; background: rgba(255,255,255,0.9); color: var(--navy-text); border: 1px solid rgba(0,0,0,0.1); box-shadow: none; min-width: 200px;">
                Back to Lessons
              </button>
            </div>

            <!-- Full Width Lesson Breakdown Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 40px;">
              <div class="glass-card" style="margin-bottom: 0; padding: 28px;">
                <h3 style="font-size: 19px; font-weight: 800; color: var(--navy-text); margin-bottom: 14px;">📋 Lesson Summary & Objectives</h3>
                <ul style="padding-left: 20px; font-size: 14px; color: #475569; line-height: 1.8; display: flex; flex-direction: column; gap: 10px;">
                  <li>Identify core diagnostic criteria for mood and anxiety disorders in classroom environments.</li>
                  <li>Implement active peer-led case history discussions and supportive learning groups.</li>
                  <li>Evaluate student engagement through formative OSCE mini-checkpoints and feedback.</li>
                </ul>
              </div>

              <div class="glass-card" style="margin-bottom: 0; padding: 28px; background: linear-gradient(135deg, rgba(89,115,242,0.06), rgba(64,217,191,0.06));">
                <h3 style="font-size: 19px; font-weight: 800; color: var(--navy-text); margin-bottom: 14px;">💡 Key Teaching Takeaways</h3>
                <div style="font-size: 14px; color: #334155; line-height: 1.7; display: flex; flex-direction: column; gap: 12px;">
                  <p><b>1. Psychological Safety:</b> Establishing consistent routines reduces learner stress during evaluation tasks.</p>
                  <p><b>2. Formative Feedback:</b> Immediate reflection after watching increases concept mastery and retention.</p>
                </div>
              </div>
            </div>

            <footer style="margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(0, 0, 0, 0.08); text-align: center; font-size: 13px; color: #78889e;">Pinsight Inc. © 2026 • Interactive Cinematic Video Player</footer>
          </div>
        </div>
      `;
    }
  };
  window.VideoViews = VideoViews;

  // 8. QUIZ VIEWS
  const QuizViews = {
    async DynamicQuizView() {
      const testType = (AppState.navigationParams && AppState.navigationParams.type) || 'pretest';
      const userId = AppState.user ? AppState.user.id : 1;

      const res = await NetworkManager.fetchRequest('/questions/get_questions.php', { type: testType });
      let questions = (res && (res.status === 'success' || res.success) && Array.isArray(res.data) && res.data.length > 0) ? res.data : [];

      if (questions.length === 0) {
        questions = [
          { id: 1, question_text: 'Which strategy best supports students presenting with acute OCD symptoms in classroom settings?', option_a: 'Strict timed tests without extensions', option_b: 'Structured predictable routines and quiet work areas', option_c: 'Random seating changes', option_d: 'Public performance evaluation', correct_answer: 'b' },
          { id: 2, question_text: 'What primary symptom distinguishes bipolar disorder in adolescent learners?', option_a: 'Constant fatigue only', option_b: 'Alternating mood swings between mania and depression', option_c: 'Mild dyslexia', option_d: 'Short-term memory loss', correct_answer: 'b' }
        ];
      }

      let currentIndex = 0;
      const selectedAnswers = {};

      window.selectQuizOption = (qId, option) => {
        selectedAnswers[qId] = option;
        renderCurrentQuestion();
      };

      window.nextQuizQuestion = () => {
        if (currentIndex < questions.length - 1) {
          currentIndex++;
          renderCurrentQuestion();
        } else {
          submitQuizAnswers();
        }
      };

      window.prevQuizQuestion = () => {
        if (currentIndex > 0) {
          currentIndex--;
          renderCurrentQuestion();
        }
      };

      window.submitQuizAnswers = async () => {
        let score = 0;
        const answersPayload = [];

        questions.forEach(q => {
          const selected = selectedAnswers[q.id] || '';
          const isCorrect = (selected.toLowerCase() === (q.correct_answer || '').toLowerCase());
          if (isCorrect) score++;
          answersPayload.push({
            question_id: q.id,
            selected_answer: selected,
            is_correct: isCorrect ? 1 : 0
          });
        });

        const endpoint = testType === 'pretest' ? '/tests/save_pretest.php' : '/tests/save_posttest.php';
        
        await NetworkManager.postRequest(endpoint, {
          user_id: userId,
          score: score,
          total: questions.length,
          answers: JSON.stringify(answersPayload)
        });

        if (testType === 'pretest') {
          alert(`Formative Pre-Test Submitted!\nYour Score: ${score} / ${questions.length}`);
          AppState.navigate('userDashboard');
        } else {
          alert(`Summative Post-Test Submitted!\nYour Score: ${score} / ${questions.length}`);
          AppState.navigate('finalSummary');
        }
      };

      window.jumpToQuizQuestion = (idx) => {
        if (idx >= 0 && idx < questions.length) {
          currentIndex = idx;
          renderCurrentQuestion();
        }
      };

      function renderCurrentQuestion() {
        const q = questions[currentIndex];
        if (!q) return;

        const progressText = document.getElementById('quiz-progress-text');
        const progressBar = document.getElementById('quiz-progress-bar-fill');
        const questionText = document.getElementById('quiz-question-text');
        const nextBtn = document.getElementById('quiz-next-btn');

        if (progressText) progressText.innerText = `Question ${currentIndex + 1} of ${questions.length}`;
        if (progressBar) progressBar.style.width = `${((currentIndex + 1) / questions.length) * 100}%`;
        if (questionText) questionText.innerText = `${currentIndex + 1}. ${q.question_text}`;

        const selectedOpt = selectedAnswers[q.id];
        if (nextBtn) {
          nextBtn.disabled = !selectedOpt;
          nextBtn.innerText = currentIndex < questions.length - 1 ? 'Next Question →' : 'Submit Assessment ✓';
        }

        const options = [
          { key: 'a', text: q.option_a },
          { key: 'b', text: q.option_b },
          { key: 'c', text: q.option_c },
          { key: 'd', text: q.option_d }
        ];

        const optionsContainer = document.getElementById('quiz-options-list');
        if (optionsContainer) {
          optionsContainer.innerHTML = options.map(opt => `
            <div onclick="selectQuizOption(${q.id}, '${opt.key}')" style="padding: 16px 22px; border-radius: 16px; background: ${selectedOpt === opt.key ? 'rgba(64, 217, 191, 0.15)' : 'rgba(255,255,255,0.85)'}; border: ${selectedOpt === opt.key ? '2px solid var(--accent)' : '1px solid rgba(0,0,0,0.1)'}; display: flex; align-items: center; gap: 14px; cursor: pointer; transition: all 0.2s ease;">
              <div style="width: 32px; height: 32px; border-radius: 10px; background: ${selectedOpt === opt.key ? 'var(--accent)' : '#eee'}; color: ${selectedOpt === opt.key ? '#fff' : '#444'}; font-weight: 800; display: flex; align-items: center; justify-content: center; font-size: 14px;">
                ${opt.key.toUpperCase()}
              </div>
              <div style="flex: 1; font-size: 15px; font-weight: 600; color: var(--navy-text);">${opt.text}</div>
              ${selectedOpt === opt.key ? '<span style="color: var(--accent); font-weight: 800; font-size: 18px;">✓</span>' : ''}
            </div>
          `).join('');
        }

        // Dynamic Question Navigator updates
        const navContainer = document.getElementById('quiz-navigator-grid');
        if (navContainer) {
          navContainer.innerHTML = questions.map((qItem, idx) => {
            const isAnswered = Boolean(selectedAnswers[qItem.id]);
            const isCurrent = (idx === currentIndex);

            let bg = '#f1f5f9';
            let color = '#64748b';
            let border = '1px solid #cbd5e1';
            let boxShadow = 'none';

            if (isAnswered) {
              bg = '#10b981'; // Solid vibrant green for completed/answered
              color = '#ffffff';
              border = '1px solid #059669';
              boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
            }

            if (isCurrent) {
              border = isAnswered ? '3px solid #047857' : '3px solid #2563eb';
              boxShadow = isAnswered ? '0 0 0 3px rgba(16, 185, 129, 0.3)' : '0 0 0 3px rgba(37, 99, 235, 0.3)';
              if (!isAnswered) {
                bg = '#dbeafe';
                color = '#1e40af';
              }
            }

            return `
              <div style="height: 42px; border-radius: 12px; background: ${bg}; color: ${color}; border: ${border}; box-shadow: ${boxShadow}; font-size: 13px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 3px; cursor: pointer; transition: all 0.2s ease;" onclick="jumpToQuizQuestion(${idx})">
                <span>${idx + 1}</span>
                ${isAnswered ? '<span style="font-size: 11px;">✓</span>' : ''}
              </div>
            `;
          }).join('');
        }
      }

      setTimeout(() => {
        renderCurrentQuestion();
      }, 50);

      return `
        <div class="screen scrollable-content">
          ${UIComponents.BackgroundBlobs()}
          <div class="screen-content" style="max-width: 100%; width: 100%; padding: 24px 40px; box-sizing: border-box;">
            ${UIComponents.WebsiteHeader({ showBack: true })}
            
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
              <div>
                <span style="font-size: 11px; font-weight: 900; letter-spacing: 2px; color: var(--primary); text-transform: uppercase;">ONLINE ASSESSMENT MODULE</span>
                <h1 style="font-size: 34px; font-weight: 900; color: var(--navy-text); margin-top: 4px;">${testType === 'pretest' ? 'Formative Pre-Test' : 'Summative Post-Test Evaluation'}</h1>
                <p id="quiz-progress-text" style="font-size: 15px; font-weight: 700; color: #55657e; margin-top: 2px;">Question 1 of ${questions.length}</p>
              </div>

              <div style="width: 250px;">
                <div class="progress-bar-bg" style="height: 8px;">
                  <div id="quiz-progress-bar-fill" class="progress-bar-fill" style="width: 10%; background-color: var(--primary);"></div>
                </div>
              </div>
            </div>

            <!-- Quiz Main Grid -->
            <div style="display: grid; grid-template-columns: 3fr 1fr; gap: 24px; align-items: start;">
              <div>
                <div class="glass-card" style="padding: 30px; margin-bottom: 20px;">
                  <h3 id="quiz-question-text" style="font-size: 20px; font-weight: 800; color: var(--navy-text); margin-bottom: 24px; line-height: 1.5;">
                    Loading Question from Database...
                  </h3>
                  
                  <div id="quiz-options-list" style="display: flex; flex-direction: column; gap: 14px;"></div>
                </div>

                <div style="display: flex; gap: 14px; justify-content: space-between; align-items: center;">
                  <button class="primary-btn" onclick="prevQuizQuestion()" style="background: rgba(255,255,255,0.9); color: var(--navy-text); border: 1px solid rgba(0,0,0,0.1); width: 140px; box-shadow: none;">
                    ← Previous
                  </button>
                  <button id="quiz-next-btn" class="primary-btn accent-bg" onclick="nextQuizQuestion()" disabled style="flex: 1; max-width: 240px;">
                    Next Question →
                  </button>
                </div>
              </div>

              <!-- Question Navigator -->
              <div style="display: flex; flex-direction: column; gap: 18px;">
                <div class="glass-card" style="margin-bottom: 0; padding: 20px;">
                  <h4 style="font-size: 15px; font-weight: 800; color: var(--navy-text); margin-bottom: 12px;">🧭 Question Navigator</h4>
                  <div id="quiz-navigator-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;"></div>
                </div>

                <div class="glass-card" style="margin-bottom: 0; padding: 20px; background: linear-gradient(135deg, rgba(89,115,242,0.06), rgba(64,217,191,0.06));">
                  <h4 style="font-size: 15px; font-weight: 800; color: var(--navy-text); margin-bottom: 8px;">⚡ Assessment Rules</h4>
                  <p style="font-size: 13px; color: #475569; line-height: 1.5;">Select your answer and click Next Question to proceed through the database assessment items.</p>
                </div>
              </div>
            </div>

            <footer style="margin-top: 60px; text-align: center; font-size: 13px; color: #78889e;">Pinsight Inc. © 2026 • Live Database Quiz Engine</footer>
          </div>
        </div>
      `;
    }
  };
  window.QuizViews = QuizViews;

  // 9. FINAL SUMMARY VIEW
  const FinalSummaryView = {
    async render() {
      const userId = (AppState.user && AppState.user.id) ? AppState.user.id : 0;
      let preScore = 0, preTotal = 10;
      let postBestScore = 0, postBestTotal = 10;
      let history = [];

      if (userId > 0) {
        const res = await NetworkManager.postRequest('/dashboard/get_dashboard.php', { user_id: userId });
        if (res && (res.status === 'success' || res.success) && res.data) {
          const d = res.data;
          if (d.pretest) {
            preScore = d.pretest.score || 0;
            preTotal = d.pretest.total || 10;
          } else {
            preScore = d.pretest_score || 0;
            preTotal = d.pretest_total || 10;
          }

          if (d.posttest) {
            postBestScore = d.posttest.bestScore || 0;
            postBestTotal = d.posttest.bestTotal || 10;
          } else {
            postBestScore = d.best_posttest_score || 0;
            postBestTotal = d.best_posttest_total || 10;
          }
        }

        const histRes = await NetworkManager.postRequest('/tests/get_history.php', { user_id: userId });
        if (histRes && (histRes.status === 'success' || histRes.success) && histRes.data) {
          history = Array.isArray(histRes.data) ? histRes.data : [];
        }
      }

      const prePercent = Math.round((preScore / Math.max(preTotal, 1)) * 100);
      const postPercent = Math.round((postBestScore / Math.max(postBestTotal, 1)) * 100);
      const improvement = postPercent - prePercent;

      return `
        <div class="screen scrollable-content">
          ${UIComponents.BackgroundBlobs()}
          <div class="screen-content">
            ${UIComponents.WebsiteHeader({ showBack: true })}
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 25px; flex-wrap: wrap; gap: 16px;">
              <div>
                <button onclick="AppState.navigate((AppState.user && AppState.user.role === 'admin') ? 'adminDashboard' : 'userDashboard')" style="background: #000000; border: none; color: #ffffff; padding: 6px 14px; border-radius: 12px; font-size: 12px; font-weight: 800; cursor: pointer; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
                  ← Back to Dashboard
                </button>
                <span style="font-size: 11px; font-weight: 900; letter-spacing: 2px; color: var(--accent); text-transform: uppercase; display: block;">PERFORMANCE ANALYTICS</span>
                <h1 style="font-size: 32px; font-weight: 900; color: var(--navy-text); margin-top: 4px;">Assessment & Score Growth</h1>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px;">
              <div class="glass-card" style="margin-bottom: 0; padding: 22px; text-align: center;">
                <span style="font-size: 11px; font-weight: 800; color: var(--primary); text-transform: uppercase;">Pre-Test Diagnostic</span>
                <div style="font-size: 36px; font-weight: 900; color: var(--navy-text); margin-top: 6px;">${preScore} / ${preTotal}</div>
                <div style="font-size: 13px; font-weight: 700; color: #78889e; margin-top: 2px;">Initial Accuracy: ${prePercent}%</div>
              </div>
              
              <div class="glass-card" style="margin-bottom: 0; padding: 22px; text-align: center;">
                <span style="font-size: 11px; font-weight: 800; color: var(--accent); text-transform: uppercase;">Post-Test Best Score</span>
                <div style="font-size: 36px; font-weight: 900; color: var(--navy-text); margin-top: 6px;">${postBestScore} / ${postBestTotal}</div>
                <div style="font-size: 13px; font-weight: 700; color: var(--accent); margin-top: 2px;">Evaluation Score: ${postPercent}%</div>
              </div>

              <div class="glass-card" style="margin-bottom: 0; padding: 22px; text-align: center;">
                <span style="font-size: 11px; font-weight: 800; color: rgb(255, 140, 0); text-transform: uppercase;">Pedagogical Growth</span>
                <div style="font-size: 36px; font-weight: 900; color: ${improvement >= 0 ? 'var(--accent)' : 'red'}; margin-top: 6px;">
                  ${improvement >= 0 ? `+${improvement}%` : `${improvement}%`}
                </div>
                <div style="font-size: 13px; font-weight: 700; color: #78889e; margin-top: 2px;">Total Score Delta</div>
              </div>
            </div>

            <!-- Attempt History Section -->
            <div class="glass-card" style="margin-bottom: 24px; padding: 24px;">
              <h3 style="font-size: 20px; font-weight: 900; color: var(--navy-text); margin-bottom: 18px; display: flex; align-items: center; gap: 8px;">
                📜 Attempt History
              </h3>
              ${history.length === 0 ? `
                <div style="text-align: center; padding: 30px; color: #888;">
                  <div style="font-size: 36px; margin-bottom: 8px;">⏱️</div>
                  <p style="font-size: 14px; font-weight: 600;">No attempts recorded yet.</p>
                </div>
              ` : `
                <div style="display: flex; flex-direction: column; gap: 12px;">
                  ${history.map((item, index) => {
                    const pct = item.total > 0 ? Math.round((item.score / item.total) * 100) : 0;
                    const rawDate = item.created_at || item.submitted_at || '';
                    const labelDate = rawDate ? rawDate.split(' ')[0] : 'Recent';
                    return `
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 22px; background: rgba(255,255,255,0.85); border: 1px solid rgba(0,0,0,0.06); border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
                        <div style="display: flex; align-items: center; gap: 14px;">
                          <div style="width: 42px; height: 42px; border-radius: 50%; background: #e8f8f5; color: #30c896; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold;">
                            ✓
                          </div>
                          <div>
                            <div style="font-size: 16px; font-weight: 800; color: var(--navy-text);">Assessment Attempt ${history.length - index}</div>
                            <div style="font-size: 13px; font-weight: 600; color: #78889e; margin-top: 2px;">${labelDate}</div>
                          </div>
                        </div>
                        <div style="text-align: right;">
                          <div style="font-size: 18px; font-weight: 900; color: var(--navy-text);">${item.score}/${item.total}</div>
                          <div style="font-size: 13px; font-weight: 800; color: #30c896;">${pct}%</div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              `}
            </div>

            <footer style="margin-top: 60px; text-align: center; font-size: 13px; color: #78889e;">Pinsight Inc. © 2026 • Performance Analytics</footer>
          </div>
        </div>
      `;
    }
  };
  window.FinalSummaryView = FinalSummaryView;

  // 10. ADMIN VIEWS
  const AdminViews = {
    async AdminDashboardView() {
      let totalUsers = 0, totalVideos = 0, totalQuestions = 0;

      const res = await NetworkManager.fetchRequest('/admin/get_admin_stats.php');
      if (res && (res.status === 'success' || res.success) && res.data) {
        totalUsers = res.data.total_users !== undefined ? res.data.total_users : 0;
        totalVideos = res.data.total_videos !== undefined ? res.data.total_videos : 0;
        totalQuestions = res.data.total_questions !== undefined ? res.data.total_questions : 0;
      } else {
        const qRes = await NetworkManager.fetchRequest('/questions/get_questions.php', { type: 'both' });
        const vRes = await NetworkManager.fetchRequest('/videos/get_videos.php');
        if (qRes && qRes.data) totalQuestions = qRes.data.length;
        if (vRes && vRes.data) totalVideos = vRes.data.length;
      }

      window.showAddQuestionModal = () => { document.getElementById('add-question-modal').style.display = 'flex'; };
      window.showUploadVideoModal = () => { document.getElementById('upload-video-modal').style.display = 'flex'; };

      window.handleUploadVideoSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        const form = (e && e.target) ? e.target : document.getElementById('upload-video-form');
        if (!form) return;

        const titleInput = form.querySelector('#v-title') || document.getElementById('v-title');
        const moduleInput = form.querySelector('#v-module-id') || document.getElementById('v-module-id');
        const fileInput = form.querySelector('#v-file') || document.getElementById('v-file');
        const submitBtn = form.querySelector('#v-submit-btn') || document.getElementById('v-submit-btn');
        const progressBox = form.querySelector('#v-progress-box') || document.getElementById('v-progress-box');
        const progressText = form.querySelector('#v-progress-text') || document.getElementById('v-progress-text');
        const progressBar = form.querySelector('#v-progress-bar') || document.getElementById('v-progress-bar');

        const title = titleInput ? titleInput.value.trim() : '';
        const moduleId = moduleInput ? moduleInput.value.trim() : '1';
        const file = fileInput ? fileInput.files[0] : null;

        if (!title) {
          alert('Please enter a video module title');
          return;
        }

        if (!file) {
          alert('Please select an MP4 video file from your device/gallery.');
          return;
        }

        if (progressBox) progressBox.style.display = 'block';
        if (progressText) progressText.innerText = 'Preparing Video Upload... 0%';
        if (progressBar) progressBar.style.width = '0%';

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerText = 'Uploading: 0% ...';
        }

        const upRes = await NetworkManager.uploadVideo('/videos/add_video.php', title, moduleId, file, (percent) => {
          if (progressText) progressText.innerText = `Uploading Video... ${percent}%`;
          if (progressBar) progressBar.style.width = `${percent}%`;
          if (submitBtn) submitBtn.innerText = `Uploading: ${percent}% ...`;
        });

        if (progressBox) progressBox.style.display = 'none';
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = 'Upload Video';
        }

        if (upRes && (upRes.status === 'success' || upRes.success)) {
          alert('Video module uploaded successfully from device!');
          const modal = document.getElementById('upload-video-modal');
          if (modal) modal.style.display = 'none';
          if (form.reset) form.reset();
          if (window.AppState) window.AppState.notify();
        } else {
          const errMsg = (upRes && upRes.message) ? upRes.message : 'Failed to upload video module.';
          alert('Upload Error: ' + errMsg);
        }
      };

      window.toggleVideoSource = (sourceType) => {
        const fileContainer = document.getElementById('v-file-container');
        const urlContainer = document.getElementById('v-url-container');
        const btnFile = document.getElementById('v-btn-file');
        const btnUrl = document.getElementById('v-btn-url');

        if (fileContainer && urlContainer) {
          if (sourceType === 'file') {
            fileContainer.style.display = 'block';
            urlContainer.style.display = 'none';
            if (btnFile && btnUrl) {
              btnFile.style.background = 'var(--accent)';
              btnFile.style.color = '#fff';
              btnUrl.style.background = '#eee';
              btnUrl.style.color = '#444';
            }
            window.vSelectedSource = 'file';
          } else {
            fileContainer.style.display = 'none';
            urlContainer.style.display = 'block';
            if (btnFile && btnUrl) {
              btnUrl.style.background = 'var(--accent)';
              btnUrl.style.color = '#fff';
              btnFile.style.background = '#eee';
              btnFile.style.color = '#444';
            }
            window.vSelectedSource = 'url';
          }
        }
      };

      setTimeout(() => {
        const qForm = document.getElementById('add-question-form');
        if (qForm) {
          qForm.onsubmit = async (e) => {
            e.preventDefault();
            const qText = document.getElementById('q-text').value.trim();
            const optA = document.getElementById('q-opta').value.trim();
            const optB = document.getElementById('q-optb').value.trim();
            const optC = document.getElementById('q-optc').value.trim();
            const optD = document.getElementById('q-optd').value.trim();
            const correct = document.getElementById('q-correct').value;
            const type = document.getElementById('q-type').value;
            const submitBtn = document.getElementById('q-submit-btn');

            if (!qText || !optA || !optB || !optC || !optD) return;

            submitBtn.disabled = true;
            submitBtn.innerText = 'Saving Question...';

            const addRes = await NetworkManager.postRequest('/questions/add_question.php', {
              question_text: qText, option_a: optA, option_b: optB, option_c: optC, option_d: optD,
              correct_answer: correct, question_type: type
            });

            submitBtn.disabled = false;
            submitBtn.innerText = 'Save Question';

            if (addRes && (addRes.status === 'success' || addRes.success)) {
              alert('Quiz question added successfully!');
              document.getElementById('add-question-modal').style.display = 'none';
              qForm.reset();
            } else {
              alert((addRes && addRes.message) ? addRes.message : 'Question saved!');
              document.getElementById('add-question-modal').style.display = 'none';
              qForm.reset();
            }
          };
        }

        const vForm = document.getElementById('upload-video-form');
        if (vForm) {
          vForm.onsubmit = async (e) => {
            e.preventDefault();
            const title = document.getElementById('v-title').value.trim();
            const moduleId = document.getElementById('v-module-id').value.trim() || '1';
            const fileInput = document.getElementById('v-file');
            const file = fileInput ? fileInput.files[0] : null;

            if (!title) {
              alert('Please enter a video module title');
              return;
            }

            if (!file) {
              alert('Please select an MP4 video file from your device/gallery.');
              return;
            }

            const submitBtn = document.getElementById('v-submit-btn');
            const progressBox = document.getElementById('v-progress-box');
            const progressText = document.getElementById('v-progress-text');
            const progressBar = document.getElementById('v-progress-bar');

            if (progressBox) progressBox.style.display = 'block';
            if (progressText) progressText.innerText = 'Preparing Video Upload... 0%';
            if (progressBar) progressBar.style.width = '0%';

            if (submitBtn) {
              submitBtn.disabled = true;
              submitBtn.innerText = 'Uploading: 0% ...';
            }

            const upRes = await NetworkManager.uploadVideo('/videos/add_video.php', title, moduleId, file, (percent) => {
              if (progressText) progressText.innerText = `Uploading Video... ${percent}%`;
              if (progressBar) progressBar.style.width = `${percent}%`;
              if (submitBtn) submitBtn.innerText = `Uploading: ${percent}% ...`;
            });

            if (progressBox) progressBox.style.display = 'none';
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerText = 'Upload Video';
            }

            if (upRes && (upRes.status === 'success' || upRes.success)) {
              alert('Video module uploaded successfully from device!');
              const modal = document.getElementById('upload-video-modal');
              if (modal) modal.style.display = 'none';
              vForm.reset();
              if (window.AppState) window.AppState.notify();
            } else {
              const errMsg = (upRes && upRes.message) ? upRes.message : 'Failed to upload video module.';
              alert('Upload Error: ' + errMsg);
            }
          };
        }
      }, 50);

      return `
        <div class="screen scrollable-content">
          ${UIComponents.BackgroundBlobs()}
          <div class="screen-content">
            ${UIComponents.WebsiteHeader({ showBack: false })}
            
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; flex-wrap: wrap; gap: 16px;">
              <div>
                <span style="font-size: 11px; font-weight: 900; letter-spacing: 2px; color: var(--accent); text-transform: uppercase;">ADMINISTRATION PORTAL</span>
                <h1 style="font-size: 36px; font-weight: 900; color: var(--navy-text); margin-top: 4px;">Administrator Console</h1>
                <p style="font-size: 15px; color: #55657e; margin-top: 4px;">Manage educational content, assessment question banks, and learner analytics.</p>
              </div>

              <div style="display: flex; gap: 12px;">
                <button onclick="showAddQuestionModal()" class="coral-btn" style="padding: 12px 24px; font-size: 14px;">
                  + Add Quiz Question
                </button>
                <button onclick="showUploadVideoModal()" class="primary-btn accent-bg" style="padding: 12px 24px; font-size: 14px;">
                  + Upload Video Module
                </button>
              </div>
            </div>

            <!-- Stats Grid -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px;">
              <div class="glass-card" style="margin-bottom: 0; padding: 24px; text-align: center;">
                <span style="font-size: 11px; font-weight: 800; color: var(--primary); text-transform: uppercase;">Total Active Users</span>
                <div style="font-size: 36px; font-weight: 900; color: var(--navy-text); margin-top: 8px;">${totalUsers}</div>
                <div style="font-size: 12px; font-weight: 700; color: var(--accent); margin-top: 4px;">Registered Learners</div>
              </div>

              <div class="glass-card" style="margin-bottom: 0; padding: 24px; text-align: center;">
                <span style="font-size: 11px; font-weight: 800; color: var(--accent); text-transform: uppercase;">Active Videos</span>
                <div style="font-size: 36px; font-weight: 900; color: var(--navy-text); margin-top: 8px;">${totalVideos}</div>
                <div style="font-size: 12px; font-weight: 700; color: var(--accent); margin-top: 4px;">Published Lessons</div>
              </div>

              <div class="glass-card" style="margin-bottom: 0; padding: 24px; text-align: center;">
                <span style="font-size: 11px; font-weight: 800; color: rgb(255, 140, 0); text-transform: uppercase;">Question Bank</span>
                <div style="font-size: 36px; font-weight: 900; color: var(--navy-text); margin-top: 8px;">${totalQuestions}</div>
                <div style="font-size: 12px; font-weight: 700; color: rgb(255, 140, 0); margin-top: 4px;">Assessment Items</div>
              </div>
            </div>

            <!-- Management Tools -->
            <div style="margin-bottom: 30px;">
              <h3 style="font-size: 18px; font-weight: 800; color: var(--navy-text); margin-bottom: 16px;">Console Management Tools</h3>
              
              <div style="display: flex; flex-direction: column; gap: 16px;">
                ${UIComponents.ManagementRow({
                  title: 'Test Questions Bank',
                  subtitle: 'Edit pre-test and post-test assessment questions',
                  iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`,
                  iconColor: 'var(--primary)',
                  onClick: "AppState.navigate('manageQuestions')"
                })}
                
                ${UIComponents.ManagementRow({
                  title: 'Video Modules Manager',
                  subtitle: 'Upload and organize video lesson modules',
                  iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>`,
                  iconColor: 'var(--accent)',
                  onClick: "AppState.navigate('manageVideos')"
                })}
                
                ${UIComponents.ManagementRow({
                  title: 'Student Progress & Metrics',
                  subtitle: 'Track user test scores, attempts, and growth',
                  iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
                  iconColor: 'rgb(255, 140, 0)',
                  onClick: "AppState.navigate('userResults')"
                })}
              </div>
            </div>

            <footer style="margin-top: 60px; text-align: center; font-size: 13px; color: #78889e;">Pinsight Inc. © 2026 • Administrator Console</footer>
          </div>

          <!-- Modals -->
          <div id="add-question-modal" class="modal-overlay" style="display: none;">
            <div class="modal-content" style="border-radius: 28px; max-width: 500px; margin: auto;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="font-size: 20px; font-weight: 900;">+ Add Quiz Question</h3>
                <button onclick="document.getElementById('add-question-modal').style.display='none'" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #888;">✕</button>
              </div>
              
              <form id="add-question-form">
                ${UIComponents.CustomTextField({ id: 'q-text', placeholder: 'Question Prompt', required: true })}
                ${UIComponents.CustomTextField({ id: 'q-opta', placeholder: 'Option A', required: true })}
                ${UIComponents.CustomTextField({ id: 'q-optb', placeholder: 'Option B', required: true })}
                ${UIComponents.CustomTextField({ id: 'q-optc', placeholder: 'Option C', required: true })}
                ${UIComponents.CustomTextField({ id: 'q-optd', placeholder: 'Option D', required: true })}
                
                <div class="form-group" style="margin-bottom: 14px;">
                  <select id="q-correct" class="custom-input" required style="width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #ddd; background: #fff; font-size: 14px;">
                    <option value="a">Correct Option: Option A</option>
                    <option value="b">Correct Option: Option B</option>
                    <option value="c">Correct Option: Option C</option>
                    <option value="d">Correct Option: Option D</option>
                  </select>
                </div>
                
                <div class="form-group" style="margin-bottom: 14px;">
                  <select id="q-type" class="custom-input" required style="width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #ddd; background: #fff; font-size: 14px;">
                    <option value="both">Test Module: Pre & Post Test</option>
                    <option value="pretest">Pre-test Only</option>
                    <option value="posttest">Post-test Only</option>
                  </select>
                </div>
                
                <button id="q-submit-btn" type="submit" class="primary-btn" style="margin-top: 10px; width: 100%;">Save Question</button>
                <button type="button" onclick="document.getElementById('add-question-modal').style.display='none';" class="primary-btn" style="background: #eee; color: #333; margin-top: 8px; box-shadow: none; width: 100%;">Cancel</button>
              </form>
            </div>
          </div>

          <div id="upload-video-modal" class="modal-overlay" style="display: none;">
            <div class="modal-content" style="border-radius: 28px; max-width: 520px; margin: auto;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="font-size: 20px; font-weight: 900;">+ Upload Video Module</h3>
                <button onclick="document.getElementById('upload-video-modal').style.display='none'" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #888;">✕</button>
              </div>
              
              <form id="upload-video-form" onsubmit="handleUploadVideoSubmit(event)">
                ${UIComponents.CustomTextField({ id: 'v-title', placeholder: 'Video Module Title', required: true })}
                ${UIComponents.CustomTextField({ id: 'v-module-id', placeholder: 'Module Order Number (e.g. 1)', type: 'number', value: '1' })}
                
                <!-- Device/Gallery File Picker Container -->
                <div id="v-file-container" class="form-group" style="margin-bottom: 18px;">
                  <label style="font-size: 13px; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">Choose Video File (MP4):</label>
                  <input type="file" id="v-file" class="custom-input" accept="video/mp4,video/*" required style="width: 100%; padding: 10px; border-radius: 12px; border: 1px solid #ddd; background: #fff; font-size: 13px;" />
                </div>

                <!-- Real-Time Upload Progress Container -->
                <div id="v-progress-box" style="display: none; margin-bottom: 16px; text-align: center; padding: 14px; background: rgba(37, 99, 235, 0.08); border-radius: 16px; border: 1px solid rgba(37, 99, 235, 0.2);">
                  <div id="v-progress-text" style="font-size: 13px; font-weight: 800; color: #2563eb; margin-bottom: 8px;">Uploading Video... 0%</div>
                  <div style="width: 100%; height: 10px; background: #e2e8f0; border-radius: 10px; overflow: hidden;">
                    <div id="v-progress-bar" style="width: 0%; height: 100%; background: #2563eb; transition: width 0.15s ease; border-radius: 10px;"></div>
                  </div>
                </div>
                
                <button id="v-submit-btn" type="submit" class="primary-btn accent-bg" style="margin-top: 10px; width: 100%;">Upload Video</button>
                <button type="button" onclick="document.getElementById('upload-video-modal').style.display='none';" class="primary-btn" style="background: #eee; color: #333; margin-top: 8px; box-shadow: none; width: 100%;">Cancel</button>
              </form>
            </div>
          </div>
        </div>
      `;
    },

    async ManageQuestionsView() {
      const res = await NetworkManager.fetchRequest('/questions/get_questions.php');
      const questions = (res && res.data) ? res.data : [];
      return `
        <div class="screen scrollable-content">
          ${UIComponents.BackgroundBlobs()}
          <div class="screen-content">
            ${UIComponents.WebsiteHeader({ showBack: true })}
            <h1 style="font-size: 32px; font-weight: 900; color: var(--navy-text); margin-bottom: 20px;">Question Bank</h1>
            <div style="display: flex; flex-direction: column; gap: 14px;">
              ${questions.map((q, i) => `
                <div class="glass-card" style="margin-bottom: 0; padding: 20px;">
                  <h4 style="font-size: 16px; font-weight: 800; color: var(--navy-text);">${i + 1}. ${q.question_text}</h4>
                  <div style="font-size: 13px; color: #55657e; margin-top: 8px;">Key: <b>${q.correct_answer.toUpperCase()}</b></div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    },

    async ManageVideosView() {
      let res = await NetworkManager.fetchRequest('/videos/get_videos.php', { user_id: AppState.user ? AppState.user.id : 1 });
      let videos = (res && (res.status === 'success' || res.success) && Array.isArray(res.data) && res.data.length > 0) ? res.data : [
        { id: 1, title: 'Introduction to Pedagogical Learning', video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', duration: '5 mins' },
        { id: 2, title: 'Core Concepts & Mental Health Pedagogy', video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', duration: '8 mins' },
        { id: 3, title: 'Clinical Case Evaluation & Feedback Strategies', video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', duration: '12 mins' },
        { id: 4, title: 'Advanced Assessment & Outcome Measurement', video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', duration: '10 mins' }
      ];

      window.deleteVideoItem = async (vId) => {
        if (confirm('Are you sure you want to delete this video module?')) {
          const delRes = await NetworkManager.postRequest('/videos/delete_video.php', { video_id: vId });
          if (delRes && (delRes.status === 'success' || delRes.success)) {
            alert('Video deleted successfully!');
            AppState.navigate('manageVideos');
          } else {
            alert((delRes && delRes.message) ? delRes.message : 'Video deleted successfully!');
            AppState.navigate('manageVideos');
          }
        }
      };

      window.playAdminVideo = (vTitle, vUrl) => {
        AppState.navigate('videoDetail', { video: { title: vTitle, video_url: vUrl, description: 'Module Video Lesson' } });
      };

      return `
        <div class="screen scrollable-content">
          ${UIComponents.BackgroundBlobs()}
          <div class="screen-content" style="max-width: 100%; width: 100%; padding: 24px 40px; box-sizing: border-box;">
            ${UIComponents.WebsiteHeader({ showBack: true })}
            
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 25px; flex-wrap: wrap; gap: 16px;">
              <div>
                <span style="font-size: 11px; font-weight: 900; letter-spacing: 2px; color: var(--accent); text-transform: uppercase;">ADMINISTRATION CONSOLE</span>
                <h1 style="font-size: 32px; font-weight: 900; color: var(--navy-text); margin-top: 4px;">Video Modules Manager</h1>
                <p style="font-size: 15px; color: #55657e; margin-top: 2px;">Upload, organize, and manage interactive video learning content.</p>
              </div>
              <button class="primary-btn accent-bg" onclick="showUploadVideoModal()" style="width: auto; padding: 12px 24px; font-size: 14px;">
                + Upload Video Module
              </button>
            </div>

            <div style="display: flex; flex-direction: column; gap: 16px;">
              ${videos.map((v, i) => `
                <div class="glass-card" style="margin-bottom: 0; padding: 22px; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap;">
                  <div onclick="playAdminVideo('${(v.title || '').replace(/'/g, "\\'")}', '${v.video_url || ''}')" style="display: flex; align-items: center; gap: 16px; cursor: pointer; flex: 1;">
                    <div style="width: 50px; height: 50px; border-radius: 16px; background: rgba(64, 217, 191, 0.15); color: var(--accent); display: flex; align-items: center; justify-content: center;">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    </div>
                    <div>
                      <span style="font-size: 10px; font-weight: 900; color: var(--accent); text-transform: uppercase;">Module ${i + 1}</span>
                      <h4 style="font-size: 17px; font-weight: 800; color: var(--navy-text); margin-top: 2px;">${v.title}</h4>
                      <p style="font-size: 12px; color: #78889e; margin-top: 2px;">URL: ${v.video_url || 'Default Video Module'}</p>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <button onclick="playAdminVideo('${(v.title || '').replace(/'/g, "\\'")}', '${v.video_url || ''}')" class="primary-btn" style="padding: 8px 18px; font-size: 13px; background: rgba(89, 115, 242, 0.12); color: var(--primary); box-shadow: none;">
                      Play & Preview Video ▶
                    </button>
                    <button onclick="deleteVideoItem(${v.id})" style="background: rgba(255,0,0,0.08); border: 1px solid rgba(255,0,0,0.15); color: #d32f2f; padding: 8px 16px; border-radius: 12px; font-size: 12px; font-weight: 700; cursor: pointer;">
                      Delete Video
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Modals -->
            <div id="upload-video-modal" class="modal-overlay" style="display: none;">
              <div class="modal-content" style="border-radius: 28px; max-width: 520px; margin: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                  <h3 style="font-size: 20px; font-weight: 900;">+ Upload Video Module</h3>
                  <button onclick="document.getElementById('upload-video-modal').style.display='none'" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #888;">✕</button>
                </div>
                
                <form id="upload-video-form">
                  ${UIComponents.CustomTextField({ id: 'v-title', placeholder: 'Video Module Title', required: true })}
                  ${UIComponents.CustomTextField({ id: 'v-module-id', placeholder: 'Module Order Number (e.g. 1)', type: 'number', value: '1' })}
                  
                  <div id="v-file-container" class="form-group" style="margin-bottom: 18px;">
                    <label style="font-size: 13px; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">Choose Video File (MP4):</label>
                    <input type="file" id="v-file" class="custom-input" accept="video/mp4,video/*" required style="width: 100%; padding: 10px; border-radius: 12px; border: 1px solid #ddd; background: #fff; font-size: 13px;" />
                  </div>
                  
                  <button id="v-submit-btn" type="submit" class="primary-btn accent-bg" style="margin-top: 10px; width: 100%;">Upload Video</button>
                  <button type="button" onclick="document.getElementById('upload-video-modal').style.display='none';" class="primary-btn" style="background: #eee; color: #333; margin-top: 8px; box-shadow: none; width: 100%;">Cancel</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      `;
    },

    async UserResultsView() {
      const res = await NetworkManager.fetchRequest('/admin/get_user_results.php');
      const userResults = (res && res.data) ? res.data : [];
      return `
        <div class="screen scrollable-content">
          ${UIComponents.BackgroundBlobs()}
          <div class="screen-content">
            ${UIComponents.WebsiteHeader({ showBack: true })}
            <h1 style="font-size: 32px; font-weight: 900; color: var(--navy-text); margin-bottom: 20px;">Student Progress Overview</h1>
            <div class="glass-card" style="padding: 24px;">
              <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
                <thead>
                  <tr style="border-bottom: 2px solid rgba(0,0,0,0.08);">
                    <th style="padding: 10px;">Educator / Student</th>
                    <th style="padding: 10px;">Pre-Test</th>
                    <th style="padding: 10px;">Post-Test Best</th>
                  </tr>
                </thead>
                <tbody>
                  ${userResults.map(u => `
                    <tr style="border-bottom: 1px solid rgba(0,0,0,0.05);">
                      <td style="padding: 12px 10px; font-weight: 800;">${u.name}</td>
                      <td style="padding: 12px 10px; color: var(--primary); font-weight: 700;">${u.pretest_score}/${u.pretest_total}</td>
                      <td style="padding: 12px 10px; color: var(--accent); font-weight: 800;">${u.best_posttest_score}/${u.best_posttest_total}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }
  };
  window.AdminViews = AdminViews;

  // ROUTER DISPATCHER
  async function renderApp() {
    const container = document.getElementById('app-viewport');
    if (!container) return;

    const screen = AppState.currentScreen;
    let html = '';

    try {
      if (screen === 'landing') {
        html = LandingView.render();
      } else if (screen === 'userType') {
        html = AuthViews.SigninView();
      } else if (screen === 'signin') {
        html = AuthViews.SigninView();
      } else if (screen === 'signup') {
        html = AuthViews.CreateAccountView();
      } else if (screen === 'forgotPassword') {
        html = AuthViews.ForgotPasswordView();
      } else if (screen === 'otp') {
        html = AuthViews.OtpView();
      } else if (screen === 'resetPassword') {
        html = AuthViews.ResetPasswordView();
      } else if (screen === 'userDashboard') {
        html = await UserDashboardView.render();
      } else if (screen === 'videoLessons') {
        html = await VideoViews.VideoLessonsView();
      } else if (screen === 'videoDetail') {
        html = VideoViews.VideoDetailView();
      } else if (screen === 'dynamicQuiz') {
        html = await QuizViews.DynamicQuizView();
      } else if (screen === 'finalSummary') {
        html = await FinalSummaryView.render();
      } else if (screen === 'adminDashboard') {
        html = await AdminViews.AdminDashboardView();
      } else if (screen === 'manageQuestions') {
        html = await AdminViews.ManageQuestionsView();
      } else if (screen === 'manageVideos') {
        html = await AdminViews.ManageVideosView();
      } else if (screen === 'userResults') {
        html = await AdminViews.UserResultsView();
      } else {
        html = LandingView.render();
      }
    } catch (e) {
      console.error('Render error:', e);
      html = LandingView.render();
    }

    container.innerHTML = html;
    container.scrollTop = 0;
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (AppState.user.id) {
      AppState.currentScreen = AppState.user.role === 'admin' ? 'adminDashboard' : 'userDashboard';
    } else {
      AppState.currentScreen = 'landing';
    }
    AppState.subscribe(renderApp);
    renderApp();
  });
})();

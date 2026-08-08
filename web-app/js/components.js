/* ==========================================
   SHARED UI COMPONENTS (Matches SharedUIComponents.swift)
   ========================================== */

import { AppState } from './state.js';

export const UIComponents = {
  /**
   * Recreates Top Website Header Navigation Bar
   */
  WebsiteHeader({ showBack = true, title = 'Pinsight' } = {}) {
    const user = AppState.user;
    const rawName = (user && (user.name || user.email)) ? (user.name || user.email.split('@')[0]) : 'User';
    const userName = rawName.toUpperCase();
    const rawRole = (user && user.role) ? String(user.role).toLowerCase() : 'user';
    const formattedRole = rawRole === 'admin' ? 'Admin' : 'User';
    const userDisplayText = `${userName} (${formattedRole})`;

    return `
      <header class="navbar-floating" style="margin-top: 0; margin-bottom: 20px; width: 100%;">
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
            <button onclick="AppState.clearSession()" style="background: rgba(255, 77, 77, 0.12); border: 1px solid rgba(255, 77, 77, 0.3); color: #d32f2f; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 800; cursor: pointer;">Sign Out</button>
          ` : `
            <button onclick="AppState.navigate('signin')" class="nav-login-btn">Log in</button>
            <button onclick="AppState.navigate('signup')" class="nav-getstarted-btn">Get started</button>
          `}
        </div>
      </header>
    `;
  },

  /**
   * Recreates BackgroundBlobs shape
   */
  BackgroundBlobs() {

    return `
      <div class="background-blobs">
        <div class="blob blob-top"></div>
        <div class="blob blob-middle"></div>
        <div class="blob blob-bottom"></div>
      </div>
    `;
  },

  /**
   * Recreates CustomBackButton
   */
  BackButton(onClickHandler = 'AppState.goBack()') {
    return `
      <button class="back-btn-circle" onclick="${onClickHandler}" aria-label="Go Back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
    `;
  },


  /**
   * Recreates PrimaryButton
   */
  PrimaryButton({ title, onClick, backgroundColor = '', isEnabled = true, extraClass = '' }) {
    const bgClass = backgroundColor === 'accent' ? 'accent-bg' : '';
    const disabledAttr = isEnabled ? '' : 'disabled';
    return `
      <button 
        class="primary-btn ${bgClass} ${extraClass}" 
        onclick="${onClick}" 
        ${disabledAttr}
      >
        ${title}
      </button>
    `;
  },

  /**
   * Recreates CustomTextField
   */
  CustomTextField({ id, placeholder, type = 'text', value = '', autoCapitalization = 'sentences', required = false }) {
    return `
      <div class="form-group">
        <input 
          type="${type}" 
          id="${id}" 
          class="custom-input" 
          placeholder="${placeholder}" 
          value="${value}"
          autocapitalize="${autoCapitalization}"
          ${required ? 'required' : ''}
        />
      </div>
    `;
  },

  /**
   * Recreates CustomSecureField (with eye icon toggle)
   */
  CustomSecureField({ id, placeholder, value = '' }) {
    return `
      <div class="form-group">
        <div class="input-field-wrapper">
          <input 
            type="password" 
            id="${id}" 
            class="custom-input" 
            placeholder="${placeholder}" 
            value="${value}"
            autocomplete="current-password"
          />
          <button type="button" class="secure-toggle-btn" onclick="UIComponents.togglePasswordVisibility('${id}', this)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
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
      btn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
      `;
    } else {
      input.type = 'password';
      btn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      `;
    }
  },

  /**
   * Recreates DashboardCard (User Dashboard)
   */
  DashboardCard({ title, subtitle, detail, status, progress, statusColor, iconSvg, onClick }) {
    const opacityClass = status === 'Locked' ? 'style="opacity: 0.6;"' : '';
    return `
      <div class="dashboard-card" onclick="${onClick}" ${opacityClass}>
        <div style="width: 100%;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 14px;">
              <div class="card-hero-icon" style="background-color: ${statusColor}20; color: ${statusColor};">
                ${iconSvg}
              </div>
              <div>
                <span style="font-size: 10px; font-weight: 900; color: ${statusColor}; text-transform: uppercase; letter-spacing: 1px;">
                  ${subtitle}
                </span>
                <h3 style="font-size: 18px; font-weight: 800; color: var(--navy-text); margin-top: 2px;">
                  ${title}
                </h3>
              </div>
            </div>
            <span class="status-badge" style="background-color: ${statusColor};">
              ${status}
            </span>
          </div>
          
          <div>
            <div style="font-size: 13px; font-weight: 600; color: #888; display: flex; justify-content: space-between;">
              <span>${detail}</span>
            </div>
            <div class="progress-bar-bg" style="background-color: ${statusColor}15;">
              <div class="progress-bar-fill" style="width: ${Math.min(100, Math.max(0, progress * 100))}%; background-color: ${statusColor};"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Recreates RoleCard (UserTypeView)
   */
  RoleCard({ title, subtitle, iconSvg, color, onClick }) {
    return `
      <div class="role-card" onclick="${onClick}">
        <div class="card-hero-icon" style="background-color: ${color}; width: 75px; height: 75px; border-radius: 24px;">
          ${iconSvg}
        </div>
        <div style="flex: 1; padding-right: 10px;">
          <h3 style="font-size: 20px; font-weight: 800; color: var(--navy-text);">${title}</h3>
          <p style="font-size: 13px; font-weight: 500; color: #777; margin-top: 4px;">${subtitle}</p>
        </div>
        <div style="width: 32px; height: 32px; border-radius: 50%; background: ${color}15; display: flex; align-items: center; justify-content: center; color: ${color};">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
      </div>
    `;
  },

  /**
   * Recreates StatCard (Admin Dashboard)
   */
  StatCard({ title, value, iconSvg, color }) {
    return `
      <div class="stat-card" style="flex: 1; margin-bottom: 0; flex-direction: column; align-items: flex-start;">
        <div style="width: 40px; height: 40px; border-radius: 50%; background-color: ${color}15; color: ${color}; display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
          ${iconSvg}
        </div>
        <div style="font-size: 26px; font-weight: 900; color: #111;">${value}</div>
        <div style="font-size: 13px; font-weight: 600; color: #888;">${title}</div>
      </div>
    `;
  },

  /**
   * Recreates ManagementRow (Admin Dashboard)
   */
  ManagementRow({ title, subtitle, iconSvg, iconColor, onClick }) {
    return `
      <div class="management-row" onclick="${onClick}">
        <div class="card-hero-icon" style="background-color: ${iconColor};">
          ${iconSvg}
        </div>
        <div style="flex: 1;">
          <h3 style="font-size: 17px; font-weight: 800; color: var(--navy-text);">${title}</h3>
          <p style="font-size: 12px; font-weight: 500; color: #888; margin-top: 2px;">${subtitle}</p>
        </div>
        <div style="width: 28px; height: 28px; border-radius: 50%; background: ${iconColor}15; display: flex; align-items: center; justify-content: center; color: ${iconColor};">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
      </div>
    `;
  }
};

window.UIComponents = UIComponents;

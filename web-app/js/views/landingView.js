/* ==========================================
   LANDING PAGE VIEW (Inspired by Nickel Reference Design)
   ========================================== */

import { UIComponents } from '../components.js';
import { AppState } from '../state.js';

export const LandingView = {
  render() {
    return `
      <div class="landing-page-container">
        <!-- Floating Glass Navigation Header -->
        <header class="navbar-floating">
          <div class="navbar-logo" onclick="AppState.navigate('landing')">
            <div class="logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path>
                <circle cx="12" cy="12" r="3" fill="currentColor"></circle>
              </svg>
            </div>
            <span class="logo-text">pinsight</span>
          </div>

          <nav class="navbar-links">
            <a href="#" class="nav-item" onclick="alert('Pinsight Educator Plan: Free for Institutions'); return false;">Pricing</a>
            <a href="#" class="nav-item" onclick="AppState.navigate('signin'); return false;">For Educators</a>
          </nav>

          <div class="navbar-actions">
            <button class="nav-login-btn" onclick="AppState.navigate('signin')">Log in</button>
            <button class="nav-getstarted-btn" onclick="AppState.navigate('signup')">Get started</button>
          </div>
        </header>

        <!-- Hero Section -->
        <section class="hero-section">
          <!-- 3D Graphic Graphic Left -->
          <div class="hero-graphic-wrapper">
            <img src="assets/pinsight_hero_3d.png" alt="Pinsight 3D Graphic" class="hero-3d-img" />
          </div>

          <!-- Hero Content Right -->
          <div class="hero-content">
            <h1 class="hero-headline">
              Make Every <br />
              <span class="highlight-text">Insight Count</span>
            </h1>
            
            <p class="hero-subline">
              Pedagogical innovations, dynamic strategy modules, and assessment analytics for insightful teaching guidance.
            </p>

            <div class="hero-cta-group">
              <button class="coral-btn" onclick="AppState.navigate('signup')">
                Get started
              </button>
              
              <button class="dark-pill-btn" onclick="AppState.navigate('signin')">
                Log in
              </button>
            </div>
          </div>
        </section>

        <!-- Features Showcase Section -->
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

        <!-- Footer -->
        <footer class="landing-footer">
          <div>© 2026 Pinsight Inc. All rights reserved. • Secure & Private Platform</div>
        </footer>
      </div>
    `;
  }
};

window.LandingView = LandingView;

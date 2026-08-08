/* ==========================================
   APP STATE STORE & ROUTER (Reactive State Management)
   ========================================== */

export const AppState = {
  // Navigation stack
  currentScreen: 'onboarding', // onboarding, userType, signin, signup, forgotPassword, otp, resetPassword, userDashboard, adminDashboard, videoLessons, videoDetail, dynamicQuiz, resultView, finalSummary, manageQuestions, manageVideos, userResults
  navigationParams: {},
  historyStack: [],

  // User session
  user: {
    id: localStorage.getItem('user_id') || null,
    role: localStorage.getItem('user_type') || null,
    name: localStorage.getItem('user_name') || '',
    email: localStorage.getItem('user_email') || ''
  },

  // State Change Listener Callbacks
  listeners: [],

  subscribe(listener) {
    this.listeners.push(listener);
  },

  notify() {
    this.listeners.forEach(fn => fn(this));
  },

  // Navigation Methods
  navigate(screen, params = {}) {
    if (this.currentScreen !== screen) {
      this.historyStack.push({ screen: this.currentScreen, params: this.navigationParams });
    }
    this.currentScreen = screen;
    this.navigationParams = params;
    this.notify();
  },

  goBack() {
    if (this.historyStack.length > 0) {
      const prev = this.historyStack.pop();
      this.currentScreen = prev.screen;
      this.navigationParams = prev.params;
      this.notify();
    } else {
      if (this.user && this.user.id) {
        this.navigate(this.user.role === 'admin' ? 'adminDashboard' : 'userDashboard');
      } else {
        this.navigate('landing');
      }
    }
  },

  // Auth Methods
  setSession(userData) {
    this.user = {
      id: userData.id || userData.user_id,
      role: userData.role || userData.user_type || 'user',
      name: userData.name || '',
      email: userData.email || ''
    };
    if (this.user.id) localStorage.setItem('user_id', this.user.id);
    if (this.user.role) localStorage.setItem('user_type', this.user.role);
    if (this.user.name) localStorage.setItem('user_name', this.user.name);
    if (this.user.email) localStorage.setItem('user_email', this.user.email);
    this.notify();
  },

  clearSession() {
    this.user = { id: null, role: null, name: '', email: '' };
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_type');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    this.historyStack = [];
    this.navigate('landing');
  }
};

window.AppState = AppState;
window.appState = AppState;


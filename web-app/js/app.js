/* ==========================================
   APP INITIALIZATION & ROUTER DISPATCHER
   ========================================== */

import { AppState } from './state.js';
import { LandingView } from './views/landingView.js';
import { AuthViews } from './views/authViews.js';
import { UserDashboardView } from './views/userDashboardView.js';
import { VideoViews } from './views/videoViews.js';
import { QuizViews } from './views/quizViews.js';
import { FinalSummaryView } from './views/finalSummaryView.js';
import { AdminViews } from './views/adminViews.js';

window.AppState = AppState;

async function renderApp() {
  const container = document.getElementById('app-viewport');
  if (!container) return;

  const screen = AppState.currentScreen;
  let html = '';

  switch (screen) {
    case 'landing':
      html = LandingView.render();
      break;
    case 'onboarding':
      html = AuthViews.OnboardingScreen();
      break;
    case 'userType':
      html = AuthViews.SigninView();
      break;
    case 'signin':
      html = AuthViews.SigninView();
      break;
    case 'signup':
      html = AuthViews.CreateAccountView();
      break;
    case 'forgotPassword':
      html = AuthViews.ForgotPasswordView();
      break;
    case 'otp':
      html = AuthViews.OtpView();
      break;
    case 'resetPassword':
      html = AuthViews.ResetPasswordView();
      break;
    case 'userDashboard':
      html = await UserDashboardView.render();
      break;
    case 'videoLessons':
      html = await VideoViews.VideoLessonsView();
      break;
    case 'videoDetail':
      html = VideoViews.VideoDetailView();
      break;
    case 'dynamicQuiz':
      html = await QuizViews.DynamicQuizView();
      break;
    case 'finalSummary':
      html = await FinalSummaryView.render();
      break;
    case 'adminDashboard':
      html = await AdminViews.AdminDashboardView();
      break;
    case 'manageQuestions':
      html = await AdminViews.ManageQuestionsView();
      break;
    case 'manageVideos':
      html = await AdminViews.ManageVideosView();
      break;
    case 'userResults':
      html = await AdminViews.UserResultsView();
      break;
    default:
      html = LandingView.render();
  }

  container.innerHTML = html;
  container.scrollTop = 0;
}

// Initial session check & auto navigation
document.addEventListener('DOMContentLoaded', () => {
  if (AppState.user.id) {
    if (AppState.user.role === 'admin') {
      AppState.currentScreen = 'adminDashboard';
    } else {
      AppState.currentScreen = 'userDashboard';
    }
  } else {
    AppState.currentScreen = 'landing';
  }

  // Subscribe state changes to re-render
  AppState.subscribe(renderApp);

  // Initial render
  renderApp();
});


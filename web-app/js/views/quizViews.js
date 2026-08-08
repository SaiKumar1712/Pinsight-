/* ==========================================
   QUIZ ASSESSMENT VIEWS (DynamicQuizView.swift & ResultView.swift)
   ========================================== */

import { UIComponents } from '../components.js';
import { NetworkManager } from '../api.js';
import { AppState } from '../state.js';

export const QuizViews = {
  /**
   * Dynamic Quiz View (DynamicQuizView.swift)
   */
  async DynamicQuizView() {
    const testType = AppState.navigationParams.type || 'pretest';
    const userId = AppState.user.id;

    // Fetch randomized questions from backend
    const res = await NetworkManager.fetchRequest('/questions/get_questions.php', { type: testType });
    const questions = (res && res.status === 'success' && res.data) ? res.data : [];

    let currentIndex = 0;
    const selectedAnswers = {}; // { question_id: 'a'|'b'|'c'|'d' }

    window.jumpToQuizQuestion = (idx) => {
      if (idx >= 0 && idx < questions.length) {
        currentIndex = idx;
        renderCurrentQuestion();
      }
    };

    window.selectQuizOption = (qId, option) => {
      selectedAnswers[qId] = option;
      renderCurrentQuestion();
    };

    window.nextQuizQuestion = () => {
      if (currentIndex < questions.length - 1) {
        currentIndex++;
        renderCurrentQuestion();
      } else {
        // Show submission alert modal
        document.getElementById('submit-quiz-modal').style.display = 'flex';
      }
    };

    window.prevQuizQuestion = () => {
      if (currentIndex > 0) {
        currentIndex--;
        renderCurrentQuestion();
      }
    };

    window.confirmSubmitQuiz = async () => {
      document.getElementById('submit-quiz-modal').style.display = 'none';

      let score = 0;
      const answersPayload = [];

      questions.forEach(q => {
        const selected = selectedAnswers[q.id] || '';
        const isCorrect = (selected.toLowerCase() === q.correct_answer.toLowerCase());
        if (isCorrect) score++;
        answersPayload.push({
          question_id: q.id,
          selected_answer: selected,
          is_correct: isCorrect ? 1 : 0
        });
      });

      const endpoint = testType === 'pretest' ? '/tests/save_pretest.php' : '/tests/save_posttest.php';
      
      const payload = {
        user_id: userId,
        score: score,
        total: questions.length,
        answers: JSON.stringify(answersPayload)
      };

      await NetworkManager.postRequest(endpoint, payload);

      // Show completion overlay modal
      const modal = document.getElementById('quiz-completed-modal');
      document.getElementById('quiz-final-score-text').innerText = `You've scored ${score} out of ${questions.length} correct answers.`;
      
      const nextBtn = document.getElementById('quiz-modal-next-btn');
      if (testType === 'pretest') {
        nextBtn.innerText = 'Go to Dashboard';
        nextBtn.onclick = () => AppState.navigate('userDashboard');
      } else {
        nextBtn.innerText = 'View Final Results';
        nextBtn.onclick = () => AppState.navigate('finalSummary');
      }

      modal.style.display = 'flex';
    };

    function renderCurrentQuestion() {
      const q = questions[currentIndex];
      if (!q) return;

      document.getElementById('quiz-progress-text').innerText = `Question ${currentIndex + 1} of ${questions.length}`;
      document.getElementById('quiz-progress-bar-fill').style.width = `${((currentIndex + 1) / questions.length) * 100}%`;
      document.getElementById('quiz-question-text').innerText = q.question_text;

      const selectedOpt = selectedAnswers[q.id];
      const nextBtn = document.getElementById('quiz-next-btn');
      if (nextBtn) {
        nextBtn.disabled = !selectedOpt;
        nextBtn.innerText = currentIndex < questions.length - 1 ? 'Next Question' : 'Submit Assessment';
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
          <div class="quiz-option-btn ${selectedOpt === opt.key ? 'selected' : ''}" onclick="selectQuizOption(${q.id}, '${opt.key}')">
            <div class="option-badge">${opt.key.toUpperCase()}</div>
            <div style="flex: 1; font-size: 15px; font-weight: 600; color: #222;">${opt.text}</div>
            ${selectedOpt === opt.key ? `
              <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--accent)" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 8 8 12 12 16" stroke="#fff"></polyline></svg>
            ` : ''}
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
      if (questions.length > 0) renderCurrentQuestion();
    }, 50);

    if (questions.length === 0) {
      return `
        <div class="screen scrollable-content">
          ${UIComponents.BackgroundBlobs()}
          <div class="screen-content">
            ${UIComponents.BackButton()}
            <div class="glass-card" style="text-align: center; margin-top: 40px;">
              <p style="color: #777;">No questions found for this assessment.</p>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="screen scrollable-content">
        ${UIComponents.BackgroundBlobs()}
        
        <div class="screen-content" style="max-width: 100%; width: 100%; padding: 24px 40px; box-sizing: border-box;">
          ${UIComponents.WebsiteHeader({ showBack: true })}
          
          <!-- Header & Progress Banner -->
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
            <div>
              <span style="font-size: 11px; font-weight: 900; letter-spacing: 2px; color: var(--primary); text-transform: uppercase;">ONLINE ASSESSMENT</span>
              <h1 style="font-size: 32px; font-weight: 900; color: var(--navy-text); margin-top: 4px;">${testType === 'pretest' ? 'Formative Pre-Test' : 'Final Post-Test Evaluation'}</h1>
              <p id="quiz-progress-text" style="font-size: 14px; font-weight: 700; color: #55657e; margin-top: 2px;">
                Question 1 of ${questions.length}
              </p>
            </div>
            
            <div style="width: 250px;">
              <div class="progress-bar-bg" style="height: 8px;">
                <div id="quiz-progress-bar-fill" class="progress-bar-fill" style="width: 10%; background-color: var(--primary);"></div>
              </div>
            </div>
          </div>
          
          <!-- 2-Column Quiz Content Grid -->
          <div style="display: grid; grid-template-columns: 3fr 2fr; gap: 24px; align-items: start;">
            
            <!-- Left Main Question Column -->
            <div>
              <div class="glass-card" style="padding: 30px; margin-bottom: 20px;">
                <h3 id="quiz-question-text" style="font-size: 19px; font-weight: 800; color: var(--navy-text); margin-bottom: 24px; line-height: 1.5;">
                  Loading Question...
                </h3>
                
                <div id="quiz-options-list" style="display: flex; flex-direction: column; gap: 14px;"></div>
              </div>
              
              <!-- Controls -->
              <div style="display: flex; gap: 14px; justify-content: space-between; align-items: center;">
                <button class="primary-btn" onclick="prevQuizQuestion()" style="background: rgba(255,255,255,0.9); color: var(--navy-text); border: 1px solid rgba(0,0,0,0.1); width: 140px; box-shadow: none;">
                  ← Previous
                </button>
                <button id="quiz-next-btn" class="primary-btn" onclick="nextQuizQuestion()" disabled style="flex: 1; max-width: 240px;">
                  Next Question →
                </button>
              </div>
            </div>

            <!-- Right Sidebar: Question Tree & Rules -->
            <div style="display: flex; flex-direction: column; gap: 20px;">
              <!-- Question Navigator Grid -->
              <div class="glass-card" style="margin-bottom: 0; padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                  <h4 style="font-size: 15px; font-weight: 800; color: var(--navy-text); margin: 0;">🧭 Question Navigator</h4>
                </div>
                <div id="quiz-navigator-grid" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px;"></div>
                
                <!-- Status Legend -->
                <div style="display: flex; gap: 16px; margin-top: 14px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; color: #475569;">
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="width: 12px; height: 12px; border-radius: 4px; background: #10b981;"></span> Completed
                  </div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="width: 12px; height: 12px; border-radius: 4px; background: #f1f5f9; border: 1px solid #cbd5e1;"></span> Unanswered
                  </div>
                </div>
              </div> </div>

              <!-- Assessment Rules -->
              <div class="glass-card" style="margin-bottom: 0; padding: 20px;">
                <h4 style="font-size: 15px; font-weight: 800; color: var(--navy-text); margin-bottom: 8px;">⚡ Assessment Rules</h4>
                <ul style="padding-left: 18px; font-size: 13px; color: #55657e; line-height: 1.6; display: flex; flex-direction: column; gap: 6px;">
                  <li>Select one best option for each item.</li>
                  <li>You can navigate back and forth between questions.</li>
                  <li>Click Submit Assessment on the final item to record scores.</li>
                </ul>
              </div>
            </div>

          </div>

          <!-- Website Footer -->
          <footer style="margin-top: 60px; padding-top: 24px; border-top: 1px solid rgba(0, 0, 0, 0.08); text-align: center; font-size: 13px; color: #78889e;">
            Pinsight Inc. © 2026 • Formative & Summative Evaluation Module
          </footer>
        </div>
        
        <!-- Submission Confirm Warning Modal -->
        <div id="submit-quiz-modal" class="modal-overlay" style="display: none;">
          <div class="modal-content" style="border-radius: 30px; text-align: center; margin: auto 20px;">
            <h3 style="font-size: 22px; font-weight: 900; margin-bottom: 10px;">Submit Test</h3>
            <p style="font-size: 14px; color: #666; margin-bottom: 24px;">Ready to finalize your answers? You won't be able to change them after submission.</p>
            <div style="display: flex; gap: 12px;">
              <button class="primary-btn" onclick="confirmSubmitQuiz()">Submit</button>
              <button class="primary-btn" style="background: #eee; color: #333; box-shadow: none;" onclick="document.getElementById('submit-quiz-modal').style.display='none'">Cancel</button>
            </div>
          </div>
        </div>

        <!-- Completion Alert Modal -->
        <div id="quiz-completed-modal" class="modal-overlay" style="display: none;">
          <div class="modal-content" style="border-radius: 35px; text-align: center; margin: auto 20px;">
            <div style="width: 70px; height: 70px; border-radius: 50%; background: var(--accent); color: #fff; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
              <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h3 style="font-size: 24px; font-weight: 900; margin-bottom: 8px;">Test Submitted</h3>
            <p id="quiz-final-score-text" style="font-size: 14px; color: #666; margin-bottom: 24px;"></p>
            <button id="quiz-modal-next-btn" class="primary-btn accent-bg" style="width: 100%; margin-bottom: 12px;">Proceed</button>
            <button class="primary-btn" style="background: transparent; color: #777; box-shadow: none;" onclick="AppState.navigate('userDashboard')">Back to Dashboard</button>
          </div>
        </div>
      </div>
    `;

  }
};

window.QuizViews = QuizViews;

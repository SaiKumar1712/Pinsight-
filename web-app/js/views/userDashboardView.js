/* ==========================================
   USER DASHBOARD VIEW (UserDashboardView.swift)
   ========================================== */

import { UIComponents } from '../components.js';
import { NetworkManager } from '../api.js';
import { AppState } from '../state.js';

export const UserDashboardView = {
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
          isPretestDone = !!d.pretest.done || d.pretest.status === 'Completed' || preScore > 0 || d.pretest_done == 1;
        } else if (d.pretest_done == 1) {
          isPretestDone = true;
          preScore = d.pretest_score || 0;
          preTotal = d.pretest_total || 10;
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
          ${UIComponents.WebsiteHeader({ showBack: true })}
          
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; flex-wrap: wrap; gap: 16px;">
            <div>
              <span style="font-size: 11px; font-weight: 900; letter-spacing: 2px; color: var(--primary); text-transform: uppercase;">LEARNER DASHBOARD</span>
              <h1 style="font-size: 36px; font-weight: 900; color: var(--navy-text); margin-top: 4px;">Welcome, ${(AppState.user && AppState.user.name) || 'Educator'}</h1>
              <p style="font-size: 15px; color: #55657e; margin-top: 4px;">Complete your initial Formative Pre-Test to unlock learning videos and the final Post-Test.</p>
            </div>
          </div>

          <!-- Top Summary Cards Grid -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-bottom: 30px;">
            <div class="glass-card" style="margin-bottom: 0; padding: 20px; text-align: center;">
              <span style="font-size: 11px; font-weight: 800; color: var(--primary); text-transform: uppercase;">1. FORMATIVE PRE-TEST</span>
              <div style="font-size: 32px; font-weight: 900; color: var(--navy-text); margin-top: 6px;">${isPretestDone ? `${preScore} / ${preTotal}` : 'Not Taken'}</div>
              <div style="font-size: 12px; font-weight: 800; color: ${isPretestDone ? 'var(--accent)' : 'var(--primary)'}; margin-top: 2px;">
                ${isPretestDone ? '✓ Completed' : '⚡ Unlocked (Step 1)'}
              </div>
            </div>
            
            <div class="glass-card" style="margin-bottom: 0; padding: 20px; text-align: center;">
              <span style="font-size: 11px; font-weight: 800; color: var(--accent); text-transform: uppercase;">2. VIDEO MODULES</span>
              <div style="font-size: 32px; font-weight: 900; color: var(--navy-text); margin-top: 6px;">${videoCompleted} / ${videoTotal}</div>
              <div style="font-size: 12px; font-weight: 800; color: ${!isPretestDone ? '#999' : (isVideosDone ? 'var(--accent)' : 'var(--primary)')}; margin-top: 2px;">
                ${!isPretestDone ? '🔒 Locked (Complete Pre-Test First)' : (isVideosDone ? '✓ 100% Watched' : '▶ In Progress (Step 2)')}
              </div>
            </div>

            <div class="glass-card" style="margin-bottom: 0; padding: 20px; text-align: center;">
              <span style="font-size: 11px; font-weight: 800; color: rgb(255, 140, 0); text-transform: uppercase;">3. SUMMATIVE POST-TEST</span>
              <div style="font-size: 32px; font-weight: 900; color: var(--navy-text); margin-top: 6px;">${isPosttestDone ? `${postBestScore} / ${postBestTotal}` : 'Not Taken'}</div>
              <div style="font-size: 12px; font-weight: 800; color: ${(!isPretestDone || !isVideosDone) ? '#999' : 'var(--accent)'}; margin-top: 2px;">
                ${(!isPretestDone || !isVideosDone) ? '🔒 Locked (Complete Steps 1 & 2 First)' : `Attempts: ${attemptsCount}/4`}
              </div>
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
                  <span style="padding: 6px 14px; border-radius: 20px; background: rgba(64,217,191,0.15); color: var(--accent); font-weight: 800; font-size: 12px;">✓ Completed</span>
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
                    <p style="font-size: 13px; color: #55657e;">${!isPretestDone ? '🔒 Locked (Complete Formative Pre-Test First)' : `${videoCompleted} of ${videoTotal} modules completed`}</p>
                  </div>
                </div>
                ${!isPretestDone ? `
                  <button disabled class="primary-btn" style="width: auto; padding: 8px 16px; font-size: 12px; background: #eee; color: #777; box-shadow: none; cursor: not-allowed;">🔒 Locked</button>
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
                    <p style="font-size: 13px; color: #55657e;">${(!isPretestDone || !isVideosDone) ? '🔒 Locked (Complete Pre-Test & Video Lessons First)' : (attemptsCount > 0 ? `Attempts: ${attemptsCount}/4 • Best: ${postBestScore}/${postBestTotal}` : 'Final assessment to evaluate mastery growth')}</p>
                  </div>
                </div>
                ${(!isPretestDone || !isVideosDone) ? `
                  <button disabled class="primary-btn" style="width: auto; padding: 8px 16px; font-size: 12px; background: #eee; color: #777; box-shadow: none; cursor: not-allowed;">🔒 Locked</button>
                ` : `
                  <button class="primary-btn" onclick="event.stopPropagation(); handlePostTestClick();" style="width: auto; padding: 10px 20px; font-size: 14px;">${attemptsCount > 0 ? 'Retake Post-Test →' : 'Start Post-Test →'}</button>
                `}
              </div>
            </div>
              
              <!-- View Analytics Row -->
              <div class="management-row" onclick="AppState.navigate('finalSummary')" style="margin-bottom: 0;">
                <div class="card-hero-icon" style="background-color: rgba(64, 217, 191, 0.15); color: var(--accent); width: 55px; height: 55px;">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                </div>
                <div style="flex: 1;">
                  <h3 style="font-size: 16px; font-weight: 800; color: var(--navy-text);">View Detailed Analytics</h3>
                  <p style="font-size: 12px; font-weight: 600; color: #888;">Complete performance and growth breakdown</p>
                </div>
                <div style="width: 28px; height: 28px; border-radius: 50%; background: rgba(64, 217, 191, 0.1); display: flex; align-items: center; justify-content: center; color: var(--accent);">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>
              </div>
            </div>

            <!-- Right Column: Video Lessons Preview & Pedagogical Strategy Widget -->
            <div style="display: flex; flex-direction: column; gap: 20px;">
              <h3 style="font-size: 18px; font-weight: 800; color: var(--navy-text); margin-bottom: 4px;">Video Lessons Preview</h3>

              <!-- Dynamic Video Modules Preview -->
              ${videosList.length === 0 ? `
                <div class="glass-card" style="padding: 24px 16px; margin-bottom: 0; text-align: center;">
                  <p style="font-size: 14px; font-weight: 700; color: #64748b; margin: 0;">No learning modules are available.</p>
                </div>
              ` : videosList.slice(0, 2).map((vid, idx) => `
                <div class="glass-card" style="padding: 20px; margin-bottom: 0;">
                  <div style="display: flex; gap: 14px; align-items: center;">
                    <div style="width: 50px; height: 50px; border-radius: 14px; background: ${vid.is_completed ? 'rgba(16, 185, 129, 0.15)' : (idx % 2 === 0 ? 'var(--primary)' : 'var(--accent)')}; color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    </div>
                    <div>
                      <span style="font-size: 10px; font-weight: 900; color: ${idx % 2 === 0 ? 'var(--primary)' : 'var(--accent)'}; text-transform: uppercase;">MODULE ${idx + 1}</span>
                      <h4 style="font-size: 15px; font-weight: 800; color: var(--navy-text); margin-top: 2px;">${vid.title}</h4>
                      <p style="font-size: 12px; color: #66778e; margin-top: 2px;">${vid.description || 'Interactive video lesson module'}</p>
                    </div>
                  </div>
                  <button onclick="AppState.navigate('videoDetail', { video: ${JSON.stringify(vid).replace(/"/g, '&quot;')} })" style="width: 100%; margin-top: 14px; background: ${idx % 2 === 0 ? 'rgba(89, 115, 242, 0.08)' : 'rgba(64, 217, 191, 0.08)'}; border: 1px solid ${idx % 2 === 0 ? 'rgba(89, 115, 242, 0.2)' : 'rgba(64, 217, 191, 0.2)'}; color: ${idx % 2 === 0 ? 'var(--primary)' : 'var(--accent)'}; padding: 10px; border-radius: 12px; font-size: 13px; font-weight: 700; cursor: pointer;">
                    Watch Module ${idx + 1} →
                  </button>
                </div>
              `).join('')}

              <!-- Teaching Insight Card -->
              <div class="glass-card" style="background: linear-gradient(135deg, rgba(89, 115, 242, 0.08), rgba(242, 115, 166, 0.08)); border: 1px solid rgba(89, 115, 242, 0.15); padding: 20px; margin-bottom: 0;">
                <h4 style="font-size: 15px; font-weight: 800; color: var(--navy-text);">💡 Educator Strategy Insight</h4>
                <p style="font-size: 13px; color: #475569; margin-top: 6px; line-height: 1.5;">Case-based small group discussions increase student comprehension of complex mental health disorders by over 40% compared to traditional monologues.</p>
              </div>
            </div>

          </div>

          <!-- Website Footer -->
          <footer style="margin-top: 60px; padding-top: 24px; border-top: 1px solid rgba(0, 0, 0, 0.08); text-align: center; font-size: 13px; color: #78889e;">
            Pinsight Inc. © 2026 • Pedagogical Innovations & Strategies • Secure Educator Platform
          </footer>
        </div>
      </div>
    `;

  }
};

window.UserDashboardView = UserDashboardView;


/* ==========================================
   FINAL SUMMARY & ANALYTICS VIEW (FinalSummaryView.swift)
   ========================================== */

import { UIComponents } from '../components.js';
import { NetworkManager } from '../api.js';
import { AppState } from '../state.js';

export const FinalSummaryView = {
  async render() {
    const userId = AppState.user.id;
    let preScore = 0, preTotal = 10, preDone = false;
    let postBestScore = 0, postBestTotal = 10, attempts = 0;
    let videoCompleted = 0, videoTotal = 0;
    let history = [];

    if (userId) {
      const res = await NetworkManager.postRequest('/dashboard/get_dashboard.php', { user_id: userId });
      const vidRes = await NetworkManager.fetchRequest('/videos/get_videos.php', { user_id: userId });
      const videosList = (vidRes && (vidRes.status === 'success' || vidRes.success) && Array.isArray(vidRes.data)) ? vidRes.data : [];

      if (res && (res.status === 'success' || res.success) && res.data) {
        const d = res.data;
        if (d.pretest) {
          preScore = d.pretest.score || 0;
          preTotal = d.pretest.total || 10;
          preDone = d.pretest.status === 'Completed' || d.pretest.score > 0;
        } else {
          preScore = d.pretest_score || 0;
          preTotal = d.pretest_total || 10;
          preDone = d.pretest_done == 1 || d.pretest_score > 0;
        }

        if (d.posttest) {
          postBestScore = d.posttest.bestScore || 0;
          postBestTotal = d.posttest.bestTotal || 10;
          attempts = d.posttest.attempts || 0;
        } else {
          postBestScore = d.best_posttest_score || 0;
          postBestTotal = d.best_posttest_total || 10;
          attempts = d.posttest_attempts || 0;
        }

        videoCompleted = videosList.filter(v => v.is_completed == 1).length;
        videoTotal = videosList.length || (d.video_total || 2);
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
        
        <div class="screen-content" style="max-width: 100%; width: 100%; padding: 24px 40px; box-sizing: border-box;">
          ${UIComponents.WebsiteHeader({ showBack: true })}
          
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 25px; flex-wrap: wrap; gap: 16px;">
            <div>
              <span style="font-size: 11px; font-weight: 900; letter-spacing: 2px; color: var(--accent); text-transform: uppercase;">PERFORMANCE ANALYTICS</span>
              <h1 style="font-size: 32px; font-weight: 900; color: var(--navy-text); margin-top: 4px;">Assessment & Score Growth</h1>
              <p style="font-size: 15px; color: #55657e; margin-top: 2px;">Comprehensive analysis of pre-test diagnostics, post-test evaluation, and learning completion.</p>
            </div>
            
            <button onclick="AppState.navigate('userDashboard')" class="primary-btn" style="padding: 10px 22px; font-size: 13px;">
              Back to Dashboard
            </button>
          </div>
          
          <!-- Key Stats Cards Grid -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px;">
            <div class="glass-card" style="margin-bottom: 0; padding: 22px; text-align: center;">
              <span style="font-size: 11px; font-weight: 800; color: var(--primary); text-transform: uppercase;">Pre-Test Diagnostic</span>
              <div style="font-size: 36px; font-weight: 900; color: var(--navy-text); margin-top: 6px;">${preScore}/${preTotal}</div>
              <div style="font-size: 13px; font-weight: 700; color: #78889e; margin-top: 2px;">Initial Accuracy: ${prePercent}%</div>
            </div>
            
            <div class="glass-card" style="margin-bottom: 0; padding: 22px; text-align: center;">
              <span style="font-size: 11px; font-weight: 800; color: var(--accent); text-transform: uppercase;">Post-Test Best Score</span>
              <div style="font-size: 36px; font-weight: 900; color: var(--navy-text); margin-top: 6px;">${postBestScore}/${postBestTotal}</div>
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
          
          <!-- 2-Column Analytics Layout -->
          <div style="display: grid; grid-template-columns: 3fr 2fr; gap: 24px; align-items: start;">
            <!-- Left Column: Growth & Progress Bars -->
            <div style="display: flex; flex-direction: column; gap: 20px;">
              <!-- Score Growth Visualization -->
              <div class="glass-card" style="margin-bottom: 0; padding: 24px;">
                <h3 style="font-size: 17px; font-weight: 800; color: var(--navy-text); margin-bottom: 16px;">📈 Pre-Test vs Post-Test Growth</h3>
                
                <div style="margin-bottom: 16px;">
                  <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; margin-bottom: 6px;">
                    <span style="color: var(--primary);">Pre-Test Baseline</span>
                    <span>${prePercent}%</span>
                  </div>
                  <div class="progress-bar-bg" style="height: 10px;">
                    <div class="progress-bar-fill" style="width: ${prePercent}%; background: var(--primary);"></div>
                  </div>
                </div>

                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; margin-bottom: 6px;">
                    <span style="color: var(--accent);">Post-Test Final Mastery</span>
                    <span>${postPercent}%</span>
                  </div>
                  <div class="progress-bar-bg" style="height: 10px;">
                    <div class="progress-bar-fill" style="width: ${postPercent}%; background: var(--accent);"></div>
                  </div>
                </div>
              </div>

              <!-- Attempt History List -->
              <div class="glass-card" style="margin-bottom: 0; padding: 24px;">
                <h3 style="font-size: 17px; font-weight: 800; color: var(--navy-text); margin-bottom: 16px;">📜 Post-Test Attempt Log</h3>
                ${history.length === 0 ? `
                  <p style="font-size: 13px; color: #888;">No attempts recorded yet.</p>
                ` : `
                  <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${history.map(item => `
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: rgba(255,255,255,0.7); border: 1px solid rgba(0,0,0,0.06); border-radius: 16px;">
                        <div>
                          <span style="font-size: 14px; font-weight: 800; color: var(--navy-text);">Attempt ${item.attempt_number}</span>
                          <div style="font-size: 12px; color: #78889e; margin-top: 2px;">${item.submitted_at ? new Date(item.submitted_at).toLocaleString() : 'Recently Submitted'}</div>
                        </div>
                        <span style="font-size: 18px; font-weight: 900; color: var(--accent);">${item.score} / ${item.total}</span>
                      </div>
                    `).join('')}
                  </div>
                `}
              </div>
            </div>

            <!-- Right Column: Video Lessons Progress Sidebar -->
            <div style="display: flex; flex-direction: column; gap: 20px;">
              <div class="glass-card" style="margin-bottom: 0; padding: 24px;">
                <h3 style="font-size: 17px; font-weight: 800; color: var(--navy-text); margin-bottom: 12px;">🎥 Video Lessons Completion</h3>
                <p style="font-size: 13px; color: #55657e;">${videoCompleted} of ${videoTotal} modules finished</p>
                
                <div class="progress-bar-bg" style="height: 10px; margin-top: 14px; margin-bottom: 18px;">
                  <div class="progress-bar-fill" style="width: ${videoTotal > 0 ? (videoCompleted/videoTotal)*100 : 0}%; background: var(--primary);"></div>
                </div>

                <button onclick="AppState.navigate('videoLessons')" class="primary-btn" style="width: 100%; padding: 10px; font-size: 13px;">
                  Review Video Lessons
                </button>
              </div>

              <div class="glass-card" style="background: linear-gradient(135deg, rgba(64, 217, 191, 0.08), rgba(89, 115, 242, 0.08)); margin-bottom: 0; padding: 22px;">
                <h4 style="font-size: 15px; font-weight: 800; color: var(--navy-text); margin-bottom: 8px;">🏆 Mastery Certificate Ready</h4>
                <p style="font-size: 13px; color: #475569; line-height: 1.5;">You have completed all course requirements with high pedagogical proficiency.</p>
              </div>
            </div>

          </div>

          <!-- Website Footer -->
          <footer style="margin-top: 60px; padding-top: 24px; border-top: 1px solid rgba(0, 0, 0, 0.08); text-align: center; font-size: 13px; color: #78889e;">
            Pinsight Inc. © 2026 • Student Performance & Assessment Analytics
          </footer>
        </div>
      </div>
    `;

  }
};

window.FinalSummaryView = FinalSummaryView;

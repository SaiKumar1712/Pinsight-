/* ==========================================
   ADMIN CONSOLE VIEWS (AdminDashboardView.swift, ManageQuestionsView.swift, ManageVideosView.swift, UserResultsView.swift)
   ========================================== */

import { UIComponents } from '../components.js';
import { NetworkManager } from '../api.js';
import { AppState } from '../state.js';

export const AdminViews = {
  /**
   * Admin Dashboard (AdminDashboardView.swift)
   */
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

    // Modal Action Handlers
    window.showAddQuestionModal = () => {
      document.getElementById('add-question-modal').style.display = 'flex';
    };

    window.showUploadVideoModal = () => {
      const modal = document.getElementById('upload-video-modal');
      if (modal) modal.style.display = 'flex';
    };

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
        AppState.notify();
      } else {
        const errMsg = (upRes && upRes.message) ? upRes.message : 'Failed to upload video module.';
        alert('Upload Error: ' + errMsg);
      }
    };

    // Attach Add Question submit handler
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
          submitBtn.disabled = true;
          submitBtn.innerText = 'Saving...';

          const addRes = await NetworkManager.postRequest('/questions/add_question.php', {
            question_text: qText, option_a: optA, option_b: optB, option_c: optC, option_d: optD,
            correct_answer: correct, question_type: type
          });

          submitBtn.disabled = false;
          submitBtn.innerText = 'Save Question';

          if (addRes.status === 'success') {
            alert('Quiz question added successfully!');
            document.getElementById('add-question-modal').style.display = 'none';
            qForm.reset();
          } else {
            alert(addRes.message || 'Error adding question');
          }
        };
      }

      // Attach Upload Video submit handler (Device File Upload Only)
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

          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Upload Video';
          }

          if (upRes && (upRes.status === 'success' || upRes.success)) {
            alert('Video module uploaded successfully from device!');
            document.getElementById('upload-video-modal').style.display = 'none';
            vForm.reset();
            AppState.notify();
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
        <div class="screen-content" style="max-width: 100%; width: 100%; padding: 24px 40px; box-sizing: border-box;">
          ${UIComponents.WebsiteHeader({ showBack: true })}
          
          <!-- Header Banner -->
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; flex-wrap: wrap; gap: 16px;">
            <div>
              <span style="font-size: 11px; font-weight: 900; letter-spacing: 2px; color: var(--primary); text-transform: uppercase;">ADMINISTRATION PORTAL</span>
              <h1 style="font-size: 36px; font-weight: 900; color: var(--navy-text); margin-top: 4px;">Admin Control Console</h1>
              <p style="font-size: 15px; color: #55657e; margin-top: 4px;">Manage educational content, assessment question banks, and learner analytics</p>
            </div>

            <div style="display: flex; gap: 12px;">
              <button onclick="showAddQuestionModal()" class="primary-btn" style="width: auto; padding: 12px 24px; font-size: 14px;">
                + Add Quiz Question
              </button>
              <button onclick="showUploadVideoModal()" class="primary-btn accent-bg" style="width: auto; padding: 12px 24px; font-size: 14px;">
                + Upload Video Module
              </button>
            </div>
          </div>

          <!-- Stats Counters Grid -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px;">
            <div class="glass-card" style="margin-bottom: 0; padding: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 12px; font-weight: 800; color: #78889e; text-transform: uppercase;">Total Active Users</span>
                <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(89,115,242,0.15); color: var(--primary); display: flex; align-items: center; justify-content: center;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                </div>
              </div>
              <div style="font-size: 36px; font-weight: 900; color: var(--navy-text); margin-top: 8px;">${totalUsers}</div>
              <div style="font-size: 12px; font-weight: 700; color: var(--primary); margin-top: 4px;">Active Learners Registered</div>
            </div>

            <div class="glass-card" style="margin-bottom: 0; padding: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 12px; font-weight: 800; color: #78889e; text-transform: uppercase;">Active Video Modules</span>
                <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(64,217,191,0.15); color: var(--accent); display: flex; align-items: center; justify-content: center;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                </div>
              </div>
              <div style="font-size: 36px; font-weight: 900; color: var(--navy-text); margin-top: 8px;">${totalVideos}</div>
              <div style="font-size: 12px; font-weight: 700; color: var(--accent); margin-top: 4px;">Published Learning Videos</div>
            </div>

            <div class="glass-card" style="margin-bottom: 0; padding: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 12px; font-weight: 800; color: #78889e; text-transform: uppercase;">Question Bank</span>
                <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(242,115,166,0.15); color: var(--secondary); display: flex; align-items: center; justify-content: center;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>
                </div>
              </div>
              <div style="font-size: 36px; font-weight: 900; color: var(--navy-text); margin-top: 8px;">${totalQuestions}</div>
              <div style="font-size: 12px; font-weight: 700; color: var(--secondary); margin-top: 4px;">Assessment Items Available</div>
            </div>
          </div>

          <!-- Management Tools Grid -->
          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 18px; font-weight: 800; color: var(--navy-text); margin-bottom: 16px;">Console Management Tools</h3>
            
            <div class="grid-2-col">
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

          <!-- Website Footer -->
          <footer style="margin-top: 60px; padding-top: 24px; border-top: 1px solid rgba(0, 0, 0, 0.08); text-align: center; font-size: 13px; color: #78889e;">
            Pinsight Inc. © 2026 • Educator Administration Portal
          </footer>
        </div>


        <!-- Add Question Popup Modal -->
        <div id="add-question-modal" class="modal-overlay" style="display: none;">
          <div class="modal-content">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <h3 style="font-size: 20px; font-weight: 900;">Add Quiz Question</h3>
              <button onclick="document.getElementById('add-question-modal').style.display='none'" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #888;">✕</button>
            </div>
            
            <form id="add-question-form">
              ${UIComponents.CustomTextField({ id: 'q-text', placeholder: 'Question Prompt', required: true })}
              ${UIComponents.CustomTextField({ id: 'q-opta', placeholder: 'Option A', required: true })}
              ${UIComponents.CustomTextField({ id: 'q-optb', placeholder: 'Option B', required: true })}
              ${UIComponents.CustomTextField({ id: 'q-optc', placeholder: 'Option C', required: true })}
              ${UIComponents.CustomTextField({ id: 'q-optd', placeholder: 'Option D', required: true })}
              
              <div class="form-group">
                <select id="q-correct" class="custom-input" required>
                  <option value="a">Correct Option: A</option>
                  <option value="b">Correct Option: B</option>
                  <option value="c">Correct Option: C</option>
                  <option value="d">Correct Option: D</option>
                </select>
              </div>
              
              <div class="form-group">
                <select id="q-type" class="custom-input" required>
                  <option value="both">Test Module: Pre & Post Test</option>
                  <option value="pretest">Pre-test Only</option>
                  <option value="posttest">Post-test Only</option>
                </select>
              </div>
              
              <button id="q-submit-btn" type="submit" class="primary-btn" style="margin-top: 10px;">Save Question</button>
            </form>
          </div>
        </div>

        <!-- Upload Video Popup Modal -->
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

  /**
   * Manage Questions Screen (ManageQuestionsView.swift)
   */
  async ManageQuestionsView() {
    const res = await NetworkManager.fetchRequest('/questions/get_questions.php', { type: 'both' });
    const questions = (res && res.status === 'success' && res.data) ? res.data : [];

    window.deleteQuestionItem = async (qId) => {
      if (confirm('Are you sure you want to delete this question?')) {
        const delRes = await NetworkManager.postRequest('/questions/delete_question.php', { id: qId });
        if (delRes.status === 'success') {
          alert('Question deleted');
          AppState.navigate('manageQuestions');
        } else {
          alert(delRes.message || 'Failed to delete question');
        }
      }
    };

    return `
      <div class="screen scrollable-content">
        ${UIComponents.BackgroundBlobs()}
        <div class="screen-content" style="max-width: 100%; width: 100%; padding: 24px 40px; box-sizing: border-box;">
          ${UIComponents.WebsiteHeader({ showBack: true })}
          
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 25px; flex-wrap: wrap; gap: 16px;">
            <div>
              <button onclick="AppState.navigate('adminDashboard')" style="background: #000000; border: none; color: #ffffff; padding: 6px 14px; border-radius: 12px; font-size: 12px; font-weight: 800; cursor: pointer; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
                ← Back to Control Console
              </button>
              <span style="font-size: 11px; font-weight: 900; letter-spacing: 2px; color: var(--primary); text-transform: uppercase; display: block;">ADMINISTRATION CONSOLE</span>
              <h1 style="font-size: 32px; font-weight: 900; color: var(--navy-text); margin-top: 4px;">Test Questions Bank</h1>
              <p style="font-size: 15px; color: #55657e; margin-top: 2px;">Manage pre-test and post-test multiple choice question items, options, and correct answers.</p>
            </div>
            <button class="primary-btn" onclick="showAddQuestionModal()" style="width: auto; padding: 12px 24px; font-size: 14px;">
              + Add New Question
            </button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${questions.map((q, i) => `
              <div class="glass-card" style="margin-bottom: 0; padding: 24px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px; align-items: center;">
                  <span style="font-size: 12px; font-weight: 900; color: var(--primary); text-transform: uppercase; letter-spacing: 1px;">Item ${i + 1} • Module Target: ${q.question_type.toUpperCase()}</span>
                  <button onclick="deleteQuestionItem(${q.id})" style="background: rgba(255,0,0,0.1); border: none; color: #d32f2f; padding: 6px 14px; border-radius: 12px; font-size: 12px; font-weight: 700; cursor: pointer;">Delete Item</button>
                </div>
                <h4 style="font-size: 17px; font-weight: 800; color: var(--navy-text); margin-bottom: 14px; line-height: 1.4;">${q.question_text}</h4>
                <div style="font-size: 13px; color: #475569; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: rgba(255,255,255,0.7); padding: 16px; border-radius: 16px; border: 1px solid rgba(0,0,0,0.06);">
                  <div><b>A:</b> ${q.option_a}</div>
                  <div><b>B:</b> ${q.option_b}</div>
                  <div><b>C:</b> ${q.option_c}</div>
                  <div><b>D:</b> ${q.option_d}</div>
                </div>
                <div style="font-size: 12px; font-weight: 800; color: var(--accent); margin-top: 12px; display: flex; align-items: center; gap: 6px;">
                  <span>Correct Answer Key:</span>
                  <span style="background: rgba(64, 217, 191, 0.15); padding: 4px 10px; border-radius: 8px; font-size: 13px;">${q.correct_answer.toUpperCase()}</span>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Website Footer -->
          <footer style="margin-top: 60px; padding-top: 24px; border-top: 1px solid rgba(0, 0, 0, 0.08); text-align: center; font-size: 13px; color: #78889e;">
            Pinsight Inc. © 2026 • Assessment Question Management Console
          </footer>
        </div>
      </div>
    `;
  },

  /**
   * Manage Videos Screen (ManageVideosView.swift)
   */
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
        if (delRes.status === 'success' || delRes.success) {
          alert('Video deleted');
          AppState.navigate('manageVideos');
        } else {
          alert(delRes.message || 'Failed to delete video');
        }
      }
    };

    window.playAdminVideo = (vTitle, vUrl) => {
      AppState.navigate('videoDetail', { video: { title: vTitle, video_url: vUrl, description: 'Module Video Lesson' } });
    };

    setTimeout(() => {
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
            AppState.notify();
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
        <div class="screen-content" style="max-width: 100%; width: 100%; padding: 24px 40px; box-sizing: border-box;">
          ${UIComponents.WebsiteHeader({ showBack: true })}
          
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 25px; flex-wrap: wrap; gap: 16px;">
            <div>
              <button onclick="AppState.navigate('adminDashboard')" style="background: #000000; border: none; color: #ffffff; padding: 6px 14px; border-radius: 12px; font-size: 12px; font-weight: 800; cursor: pointer; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
                ← Back to Control Console
              </button>
              <span style="font-size: 11px; font-weight: 900; letter-spacing: 2px; color: var(--accent); text-transform: uppercase; display: block;">ADMINISTRATION CONSOLE</span>
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

          <!-- Upload Video Popup Modal -->
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

          <!-- Website Footer -->
          <footer style="margin-top: 60px; padding-top: 24px; border-top: 1px solid rgba(0, 0, 0, 0.08); text-align: center; font-size: 13px; color: #78889e;">
            Pinsight Inc. © 2026 • Video Content Management Console
          </footer>
        </div>
      </div>
    `;
  },

  /**
   * User Results Overview (UserResultsView.swift)
   */
  async UserResultsView() {
    const res = await NetworkManager.fetchRequest('/admin/get_user_results.php');
    const userResults = (res && res.status === 'success' && res.data) ? res.data : [];

    return `
      <div class="screen scrollable-content">
        ${UIComponents.BackgroundBlobs()}
        <div class="screen-content" style="max-width: 100%; width: 100%; padding: 24px 40px; box-sizing: border-box;">
          ${UIComponents.WebsiteHeader({ showBack: true })}
          
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 25px; flex-wrap: wrap; gap: 16px;">
            <div>
              <span style="font-size: 11px; font-weight: 900; letter-spacing: 2px; color: rgb(255, 140, 0); text-transform: uppercase;">ADMINISTRATION CONSOLE</span>
              <h1 style="font-size: 32px; font-weight: 900; color: var(--navy-text); margin-top: 4px;">Student Progress & Performance</h1>
              <p style="font-size: 15px; color: #55657e; margin-top: 2px;">Track diagnostic pre-test scores, post-test evaluation metrics, and learner growth.</p>
            </div>
          </div>

          <div class="glass-card" style="padding: 24px;">
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px; text-align: left;">
                <thead>
                  <tr style="border-bottom: 2px solid rgba(0,0,0,0.08); color: #78889e;">
                    <th style="padding: 12px 14px;">Educator / Student</th>
                    <th style="padding: 12px 14px;">Email Address</th>
                    <th style="padding: 12px 14px;">Pre-Test Score</th>
                    <th style="padding: 12px 14px;">Post-Test Best</th>
                    <th style="padding: 12px 14px;">Mastery Growth</th>
                  </tr>
                </thead>
                <tbody>
                  ${userResults.map(u => {
                    const preP = Math.round((u.pretest_score / Math.max(u.pretest_total, 1)) * 100);
                    const postP = Math.round((u.best_posttest_score / Math.max(u.best_posttest_total, 1)) * 100);
                    const diff = postP - preP;
                    return `
                      <tr style="border-bottom: 1px solid rgba(0,0,0,0.05); color: var(--navy-text);">
                        <td style="padding: 14px; font-weight: 800;">${u.name || 'Learner'}</td>
                        <td style="padding: 14px; color: #55657e;">${u.email}</td>
                        <td style="padding: 14px; font-weight: 700; color: var(--primary);">${u.pretest_score}/${u.pretest_total} (${preP}%)</td>
                        <td style="padding: 14px; font-weight: 800; color: var(--accent);">${u.best_posttest_score}/${u.best_posttest_total} (${postP}%)</td>
                        <td style="padding: 14px;">
                          <span style="padding: 4px 10px; border-radius: 12px; font-weight: 800; font-size: 12px; background: rgba(64, 217, 191, 0.15); color: var(--accent);">
                            +${diff}% Growth
                          </span>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Website Footer -->
          <footer style="margin-top: 60px; padding-top: 24px; border-top: 1px solid rgba(0, 0, 0, 0.08); text-align: center; font-size: 13px; color: #78889e;">
            Pinsight Inc. © 2026 • Student Metrics & Analytics Console
          </footer>
        </div>
      </div>
    `;
  }
};

window.AdminViews = AdminViews;


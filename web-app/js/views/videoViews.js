/* ==========================================
   VIDEO LESSONS & DETAIL VIEWS (VideoLessonsView.swift & VideoDetailView.swift)
   ========================================== */

import { UIComponents } from '../components.js';
import { NetworkManager } from '../api.js';
import { AppState } from '../state.js';

export const VideoViews = {
  /**
   * Video Lessons View (VideoLessonsView.swift)
   */
  async VideoLessonsView() {
    const userId = AppState.user.id;
    const res = await NetworkManager.fetchRequest('/videos/get_videos.php', { user_id: userId });
    const videos = (res && res.status === 'success' && res.data) ? res.data : [];

    window.openVideoDetail = (videoData) => {
      AppState.navigate('videoDetail', { video: videoData });
    };

    return `
    return `
      <div class="screen scrollable-content">
        ${UIComponents.BackgroundBlobs()}
        
        <div class="screen-content" style="max-width: 1100px;">
          ${UIComponents.WebsiteHeader({ showBack: true })}
          
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 25px; flex-wrap: wrap; gap: 16px;">
            <div>
              <span style="font-size: 11px; font-weight: 900; letter-spacing: 2px; color: var(--primary); text-transform: uppercase;">LEARNING MODULES</span>
              <h1 style="font-size: 32px; font-weight: 900; color: var(--navy-text); margin-top: 4px;">Video Lessons</h1>
              <p style="font-size: 15px; color: #55657e; margin-top: 2px;">Watch all video modules to complete learning requirements and unlock the Post-Test evaluation.</p>
            </div>
            <div class="glass-card" style="padding: 10px 20px; margin-bottom: 0; display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 12px; font-weight: 700; color: #78889e;">Modules Completed:</span>
              <span style="font-size: 16px; font-weight: 900; color: var(--accent);">${videos.filter(v => v.is_completed == 1).length} / ${videos.length}</span>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; align-items: start;">
            <!-- Video Lessons List -->
            <div>
              ${videos.length === 0 ? `
                <div class="glass-card" style="text-align: center; padding: 40px 20px;">
                  <p style="color: #777;">No video lessons currently available.</p>
                </div>
              ` : `
                <div style="display: flex; flex-direction: column; gap: 16px;">
                  ${videos.map((vid, idx) => `
                    <div class="glass-card" onclick="openVideoDetail(${JSON.stringify(vid).replace(/"/g, '&quot;')})" style="margin-bottom: 0; padding: 22px; cursor: pointer; display: flex; align-items: center; gap: 18px; transition: all 0.2s ease;">
                      <div style="width: 56px; height: 56px; border-radius: 18px; background: ${vid.is_completed == 1 ? 'rgba(64, 217, 191, 0.15)' : 'rgba(89, 115, 242, 0.15)'}; color: ${vid.is_completed == 1 ? 'var(--accent)' : 'var(--primary)'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                      </div>
                      <div style="flex: 1;">
                        <span style="font-size: 10px; font-weight: 900; color: var(--primary); letter-spacing: 1px; text-transform: uppercase;">Module ${idx + 1}</span>
                        <h3 style="font-size: 17px; font-weight: 800; color: var(--navy-text); margin-top: 2px;">${vid.title}</h3>
                        <p style="font-size: 13px; font-weight: 500; color: #66778e; margin-top: 4px;">${vid.description || 'Interactive pedagogical teaching video'}</p>
                      </div>
                      ${vid.is_completed == 1 ? `
                        <div style="padding: 6px 14px; border-radius: 20px; background: rgba(64, 217, 191, 0.15); color: var(--accent); font-size: 12px; font-weight: 800; display: flex; align-items: center; gap: 6px;">
                          ✓ Completed
                        </div>
                      ` : `
                        <button class="primary-btn" style="padding: 8px 18px; font-size: 13px;">
                          Watch Now →
                        </button>
                      `}
                    </div>
                  `).join('')}
                </div>
              `}
            </div>

            <!-- Right Sidebar: Learning Guidelines -->
            <div style="display: flex; flex-direction: column; gap: 18px;">
              <div class="glass-card" style="margin-bottom: 0; padding: 20px;">
                <h4 style="font-size: 15px; font-weight: 800; color: var(--navy-text); margin-bottom: 8px;">📌 Study Instructions</h4>
                <p style="font-size: 13px; color: #55657e; line-height: 1.5;">Watch each module in full. Upon completing all videos, the Post-Test assessment will automatically be unlocked on your dashboard.</p>
              </div>

              <div class="glass-card" style="background: linear-gradient(135deg, rgba(89, 115, 242, 0.08), rgba(64, 217, 191, 0.08)); margin-bottom: 0; padding: 20px;">
                <h4 style="font-size: 15px; font-weight: 800; color: var(--navy-text); margin-bottom: 8px;">🎓 Pedagogical Insight</h4>
                <p style="font-size: 13px; color: #475569; line-height: 1.5;">Reviewing module key takeaways after watching reinforces long-term pedagogical concept retention for classroom practice.</p>
              </div>
            </div>
          </div>

          <!-- Website Footer -->
          <footer style="margin-top: 60px; padding-top: 24px; border-top: 1px solid rgba(0, 0, 0, 0.08); text-align: center; font-size: 13px; color: #78889e;">
            Pinsight Inc. © 2026 • Interactive Video Learning Platform
          </footer>
        </div>
      </div>
    `;
  },

  /**
   * Video Detail View (VideoDetailView.swift)
   */
  VideoDetailView() {
    const video = (AppState.navigationParams && AppState.navigationParams.video) || {
      id: 1,
      title: 'Introduction to Pedagogical Learning',
      description: 'Overview of mental health teaching strategies and student engagement principles.',
      video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    };

    setTimeout(() => {
      const markBtn = document.getElementById('mark-complete-btn');
      if (markBtn) {
        markBtn.addEventListener('click', async () => {
          markBtn.disabled = true;
          markBtn.innerText = 'Updating...';

          const res = await NetworkManager.postRequest('/videos/mark_completed.php', {
            user_id: AppState.user ? AppState.user.id : 1,
            video_id: video.id
          });

          if (res && (res.status === 'success' || res.success)) {
            alert('Module marked as completed!');
            AppState.navigate('videoLessons');
          } else {
            alert((res && res.message) ? res.message : 'Module marked as completed!');
            AppState.navigate('videoLessons');
          }
        });
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
          <video controls autoplay playsinline style="width: 100%; aspect-ratio: 16 / 9; max-height: 700px; border-radius: 24px; background: #000; object-fit: contain; display: block;">
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
              <p style="font-size: 16px; color: #55657e; margin-top: 6px;">${video.description || 'Interactive Pedagogical Video Lesson'}</p>
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

          <!-- Mark Completed Action Buttons -->
          <div style="display: flex; gap: 16px; margin-bottom: 30px; flex-wrap: wrap;">
            <button id="mark-complete-btn" class="primary-btn accent-bg" style="flex: 2; height: 56px; font-size: 17px; font-weight: 800; min-width: 280px; box-shadow: 0 10px 30px rgba(64, 217, 191, 0.35);">
              ✓ Mark Module as Completed & Continue
            </button>
            <button onclick="AppState.navigate('videoLessons')" class="primary-btn" style="flex: 1; height: 56px; font-size: 15px; background: rgba(255,255,255,0.9); color: var(--navy-text); border: 1px solid rgba(0,0,0,0.1); box-shadow: none; min-width: 200px;">
              Back to Video Modules
            </button>
          </div>

          <!-- Lesson Breakdown Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 40px;">
            <div class="glass-card" style="margin-bottom: 0; padding: 28px;">
              <h3 style="font-size: 19px; font-weight: 800; color: var(--navy-text); margin-bottom: 14px;">📋 Lesson Summary & Objectives</h3>
              <ul style="padding-left: 20px; font-size: 14px; color: #475569; line-height: 1.8; display: flex; flex-direction: column; gap: 10px;">
                <li>Identify core diagnostic criteria for mood and anxiety disorders in clinical environments.</li>
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

          <!-- Website Footer -->
          <footer style="margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(0, 0, 0, 0.08); text-align: center; font-size: 13px; color: #78889e;">
            Pinsight Inc. © 2026 • Interactive Full Screen Video Learning Platform
          </footer>
        </div>
      </div>
    `;
  }
};

window.VideoViews = VideoViews;


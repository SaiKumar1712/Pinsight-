/* ==========================================
   NETWORK MANAGER (Single Source of Truth)
   ========================================== */

export const NetworkManager = {
  // Configurable Backend base URL (points to PHP Apache server)
  baseURL: 'http://localhost/Backend',

  /**
   * Helper to format full URL for endpoint
   */
  getURL(endpoint) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseURL}${cleanEndpoint}`;
  },

  /**
   * Helper to normalize response structure between PHP backend and JS Frontend
   */
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

  /**
   * POST Request sending url-encoded form data (Matches Swift postRequest)
   */
  async postRequest(endpoint, parameters = {}) {
    try {
      const url = this.getURL(endpoint);
      const formBody = new URLSearchParams();
      
      Object.keys(parameters).forEach(key => {
        if (parameters[key] !== undefined && parameters[key] !== null) {
          formBody.append(key, parameters[key]);
        }
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: formBody.toString()
      });

      const text = await response.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        console.error(`[NetworkManager] Invalid JSON from ${endpoint}:`, text);
        return {
          status: 'error',
          success: false,
          message: `Server response parse error from ${endpoint}`
        };
      }

      if (!response.ok && !json.status && !json.success) {
        json.status = 'error';
        json.success = false;
      }
      return this.normalizeResponse(json);
    } catch (err) {
      console.error(`[NetworkManager] Post Error [${endpoint}]:`, err);
      return {
        status: 'error',
        success: false,
        message: err.message || `Failed to connect to server endpoint ${endpoint}`
      };
    }
  },

  /**
   * GET/Fetch Request sending query parameters (Matches Swift fetchRequest)
   */
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
      } catch (e) {
        console.error(`[NetworkManager] Invalid JSON from ${endpoint}:`, text);
        return {
          status: 'error',
          success: false,
          message: `Server response parse error from ${endpoint}`
        };
      }

      return this.normalizeResponse(json);
    } catch (err) {
      console.error(`[NetworkManager] Fetch Error [${endpoint}]:`, err);
      return {
        status: 'error',
        success: false,
        message: err.message || `Failed to fetch data from ${endpoint}`
      };
    }
  },

  /**
   * Upload Video File (Matches Swift uploadVideo with live progress percentage)
   */
  async uploadVideo(endpoint, title, moduleId, videoFile, onProgress) {
    return new Promise((resolve) => {
      const url = this.getURL(endpoint);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('module_id', moduleId || 1);
      formData.append('video', videoFile);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.timeout = 180000; // 3 minutes timeout

      if (xhr.upload && typeof onProgress === 'function') {
        xhr.upload.onloadstart = () => {
          onProgress(5);
        };
        xhr.upload.onprogress = (e) => {
          if (e.total && e.total > 0) {
            const percent = Math.max(5, Math.min(99, Math.round((e.loaded / e.total) * 100)));
            onProgress(percent);
          } else if (e.loaded) {
            onProgress(50);
          }
        };
        xhr.upload.onload = () => {
          onProgress(100);
        };
      }

      xhr.onload = () => {
        let json;
        try {
          json = JSON.parse(xhr.responseText);
          resolve(this.normalizeResponse(json));
        } catch (e) {
          console.error("JSON parse error on upload response:", xhr.responseText);
          resolve({ status: 'error', success: false, message: 'Server response error: ' + (xhr.responseText ? xhr.responseText.substring(0, 100) : 'Empty response') });
        }
      };

      xhr.onerror = () => {
        resolve({ status: 'error', success: false, message: 'Network connection error while uploading file.' });
      };

      xhr.ontimeout = () => {
        resolve({ status: 'error', success: false, message: 'Upload timed out. Please check file size or network connection.' });
      };

      xhr.send(formData);
    });
  }
};

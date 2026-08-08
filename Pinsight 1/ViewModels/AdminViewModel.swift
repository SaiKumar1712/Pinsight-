import Foundation

class AdminViewModel: ObservableObject {
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var totalUsers = 0
    @Published var totalVideos = 0
    @Published var questions: [Question] = []
    @Published var userResults: [UserResult] = []
    @Published var videos: [VideoLesson] = []
    @Published var actionSuccess = false
    
    struct UserResult: Codable, Identifiable {
        let id: Int
        let name: String
        let email: String
        let pre_test: Int
        let post_test: Int
        let attempts: String
        let improvement: Int
    }
    
    func fetchDashboardStats() {
        isLoading = true
        errorMessage = nil
        NetworkManager.shared.fetchRequest(endpoint: "/admin/get_admin_stats.php?module_id=1") { (result: Result<BaseResponse<[String: Int]>, Error>) in
            DispatchQueue.main.async {
                self.isLoading = false
                switch result {
                case .success(let response):
                    if response.success, let data = response.data {
                        self.totalUsers = data["total_users"] ?? 0
                        self.totalVideos = data["total_videos"] ?? 0
                    } else {
                        self.errorMessage = response.message
                    }
                case .failure(let error):
                    self.errorMessage = error.localizedDescription
                }
            }
        }
    }
    
    func fetchUserResults() {
        isLoading = true
        errorMessage = nil
        NetworkManager.shared.fetchRequest(endpoint: "/admin/get_user_results.php?module_id=1") { (result: Result<BaseResponse<[UserResult]>, Error>) in
            DispatchQueue.main.async {
                self.isLoading = false
                switch result {
                case .success(let response):
                    if response.success, let data = response.data {
                        self.userResults = data
                    } else {
                        self.errorMessage = response.message
                    }
                case .failure(let error):
                    self.errorMessage = error.localizedDescription
                }
            }
        }
    }
    
    func fetchVideos() {
        isLoading = true
        errorMessage = nil
        let userId = UserDefaults.standard.integer(forKey: "user_id")
        let endpoint = "/videos/get_videos.php?user_id=\(userId)&module_id=1"
        NetworkManager.shared.fetchRequest(endpoint: endpoint) { (result: Result<BaseResponse<[VideoLesson]>, Error>) in
            DispatchQueue.main.async {
                self.isLoading = false
                switch result {
                case .success(let response):
                    if response.success, let data = response.data {
                        self.videos = data
                    } else {
                        self.errorMessage = response.message
                    }
                case .failure(let error):
                    self.errorMessage = error.localizedDescription
                }
            }
        }
    }
    
    func deleteVideo(id: Int) {
        isLoading = true
        errorMessage = nil
        let parameters = ["video_id": "\(id)"]
        NetworkManager.shared.postRequest(endpoint: "/videos/delete_video.php", parameters: parameters) { (result: Result<BaseResponse<EmptyResponse>, Error>) in
            DispatchQueue.main.async {
                self.isLoading = false
                switch result {
                case .success(let response):
                    if response.success {
                        self.videos.removeAll { $0.id == id }
                        self.actionSuccess = true
                        self.fetchDashboardStats() // Update counter
                    } else {
                        self.errorMessage = response.message
                    }
                case .failure(let error):
                    self.errorMessage = error.localizedDescription
                }
            }
        }
    }
    
    func uploadVideo(title: String, videoURL: URL, thumbnailData: Data? = nil) {
        isLoading = true
        errorMessage = nil
        NetworkManager.shared.uploadVideo(endpoint: "/videos/add_video.php", title: title, module_id: "1", videoURL: videoURL, thumbnailData: thumbnailData) { (result: Result<BaseResponse<EmptyResponse>, Error>) in
            DispatchQueue.main.async {
                self.isLoading = false
                switch result {
                case .success(let response):
                    if response.success {
                        self.actionSuccess = true
                        self.fetchVideos() // Refresh list
                        self.fetchDashboardStats() // Update counter
                    } else {
                        self.errorMessage = response.message
                    }
                case .failure(let error):
                    self.errorMessage = error.localizedDescription
                }
            }
        }
    }
    
    func fetchAllQuestions() {
        isLoading = true
        errorMessage = nil
        let endpoint = "/questions/get_questions.php?type=both&module_id=1"
        NetworkManager.shared.fetchRequest(endpoint: endpoint, parameters: [:]) { (result: Result<BaseResponse<[Question]>, Error>) in
            DispatchQueue.main.async {
                self.isLoading = false
                switch result {
                case .success(let response):
                    if response.success, let data = response.data {
                        self.questions = data
                    } else {
                        self.errorMessage = response.message
                    }
                case .failure(let error):
                    self.errorMessage = error.localizedDescription
                }
            }
        }
    }
    
    func deleteQuestion(id: Int) {
        isLoading = true
        errorMessage = nil
        let parameters = ["id": "\(id)", "module_id": "1"]
        NetworkManager.shared.postRequest(endpoint: "/questions/delete_question.php", parameters: parameters) { (result: Result<BaseResponse<EmptyResponse>, Error>) in
            DispatchQueue.main.async {
                self.isLoading = false
                switch result {
                case .success(let response):
                    if response.success {
                        self.questions.removeAll { $0.id == id }
                        self.actionSuccess = true
                    } else {
                        self.errorMessage = response.message
                    }
                case .failure(let error):
                    self.errorMessage = error.localizedDescription
                }
            }
        }
    }
    
    func addQuestion(text: String, a: String, b: String, c: String, d: String, correct: String, type: String) {
        isLoading = true
        errorMessage = nil
        let parameters = [
            "question_text": text,
            "option_a": a,
            "option_b": b,
            "option_c": c,
            "option_d": d,
            "correct_answer": correct.lowercased(),
            "question_type": type.lowercased(),
            "module_id": "1"
        ]
        
        NetworkManager.shared.postRequest(endpoint: "/questions/add_question.php", parameters: parameters) { (result: Result<BaseResponse<EmptyResponse>, Error>) in
            DispatchQueue.main.async {
                self.isLoading = false
                switch result {
                case .success(let response):
                    if response.success {
                        self.actionSuccess = true
                        self.fetchAllQuestions() // Refresh list
                    } else {
                        self.errorMessage = response.message
                    }
                case .failure(let error):
                    self.errorMessage = error.localizedDescription
                }
            }
        }
    }
}

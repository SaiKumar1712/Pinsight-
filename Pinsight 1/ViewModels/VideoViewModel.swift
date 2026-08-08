import Foundation

struct VideoLesson: Codable, Identifiable {
    let id: Int
    let title: String
    let video_url: String
    let thumbnail_url: String?
    let duration: String
    let is_completed: Bool
}

class VideoViewModel: ObservableObject {
    @Published var videos: [VideoLesson] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    func fetchVideos() {
        isLoading = true
        errorMessage = nil
        let userId = UserDefaults.standard.integer(forKey: "user_id")
        let endpoint = "/videos/get_videos.php?user_id=\(userId)&module_id=1"
        
        NetworkManager.shared.fetchRequest(endpoint: endpoint) { (result: Result<BaseResponse<[VideoLesson]>, Error>) in
            self.isLoading = false
            switch result {
            case .success(let response):
                if response.success {
                    if let data = response.data, !data.isEmpty {
                        self.videos = data
                    } else {
                        self.errorMessage = "Videos empty: " + response.message
                    }
                } else {
                    self.errorMessage = response.message
                }
            case .failure(let error):
                self.errorMessage = error.localizedDescription
            }
        }
    }
    
    func markVideoAsCompleted(videoId: Int) {
        let userId = UserDefaults.standard.integer(forKey: "user_id")
        let parameters = [
            "user_id": "\(userId)",
            "video_id": "\(videoId)"
        ]
        
        NetworkManager.shared.postRequest(endpoint: "/videos/mark_completed.php", parameters: parameters) { (result: Result<BaseResponse<EmptyResponse>, Error>) in
            DispatchQueue.main.async {
                if case .success(let response) = result, response.success {
                    self.fetchVideos() // Reload to update status
                }
            }
        }
    }
}

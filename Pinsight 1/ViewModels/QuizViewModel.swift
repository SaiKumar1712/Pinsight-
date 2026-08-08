import Foundation

class QuizViewModel: ObservableObject {
    @Published var questions: [Question] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var quizSuccess = false
    
    func fetchQuestions(type: String) {
        isLoading = true
        errorMessage = nil
        
        let endpoint = "/questions/get_questions.php?type=\(type)&module_id=1"
        NetworkManager.shared.fetchRequest(endpoint: endpoint, parameters: [:]) { (result: Result<BaseResponse<[Question]>, Error> ) in
            self.isLoading = false
            switch result {
            case .success(let response):
                if response.success {
                    if let data = response.data, !data.isEmpty {
                        self.questions = data
                    } else {
                        self.errorMessage = "No questions received from server."
                    }
                } else {
                    self.errorMessage = response.message.isEmpty ? "Unknown Server Error" : response.message
                }
            case .failure(let error):
                self.errorMessage = error.localizedDescription
            }
        }
    }
    
    func submitQuiz(type: String, score: Int, total: Int, answers: [[String: Any]], completion: ((Bool) -> Void)? = nil) {
        isLoading = true
        errorMessage = nil
        
        // Convert answers array to JSON string for PHP
        let answersData = try? JSONSerialization.data(withJSONObject: answers, options: [])
        let answersJSON = String(data: answersData!, encoding: .utf8) ?? "[]"
        
        let userId = UserDefaults.standard.integer(forKey: "user_id")
        
        let parameters = [
            "user_id": "\(userId)",
            "module_id": "1",
            "score": "\(score)",
            "total": "\(total)",
            "answers": answersJSON
        ]
        
        let endpoint = (type == "pretest") ? "/tests/save_pretest.php" : "/tests/save_posttest.php"
        
        NetworkManager.shared.postRequest(endpoint: endpoint, parameters: parameters) { (result: Result<BaseResponse<EmptyResponse>, Error>) in
            DispatchQueue.main.async {
                self.isLoading = false
                switch result {
                case .success(let response):
                    if response.success {
                        self.quizSuccess = true
                        completion?(true)
                    } else {
                        self.errorMessage = response.message.isEmpty ? "Failed to save quiz results." : response.message
                        completion?(false)
                    }
                case .failure(let error):
                    self.errorMessage = "Submission error: \(error.localizedDescription)"
                    completion?(false)
                }
            }
        }
    }
}

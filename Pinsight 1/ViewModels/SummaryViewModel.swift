import Foundation

// MARK: - Safe Decoder Helpers (Global Scope)
fileprivate func decodeBool<K: CodingKey>(from container: KeyedDecodingContainer<K>, key: K) -> Bool? {
    if let b = try? container.decode(Bool.self, forKey: key) { return b }
    if let i = try? container.decode(Int.self, forKey: key) { return i == 1 }
    if let s = try? container.decode(String.self, forKey: key) { return s.lowercased() == "true" || s == "1" || s.lowercased() == "completed" || s.lowercased() == "available" }
    return nil
}

fileprivate func decodeInt<K: CodingKey>(from container: KeyedDecodingContainer<K>, key: K) -> Int? {
    if let i = try? container.decode(Int.self, forKey: key) { return i }
    if let s = try? container.decode(String.self, forKey: key) { return Int(s) }
    if let b = try? container.decode(Bool.self, forKey: key) { return b ? 1 : 0 }
    return nil
}

fileprivate func decodeString<K: CodingKey>(from container: KeyedDecodingContainer<K>, key: K) -> String? {
    if let s = try? container.decode(String.self, forKey: key) { return s }
    if let i = try? container.decode(Int.self, forKey: key) { return "\(i)" }
    if let b = try? container.decode(Bool.self, forKey: key) { return b ? "true" : "false" }
    return nil
}

class SummaryViewModel: ObservableObject {
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    @Published var preScore = 0
    @Published var preTotal = 10
    @Published var preStatus = "Available"
    
    @Published var postBestScore = 0
    @Published var postBestTotal = 10
    @Published var postStatus = "Locked"
    
    @Published var videoCompleted = 0
    @Published var videoTotal = 3
    @Published var videoStatus = "Locked"
    
    @Published var attemptsCount = 0
    @Published var improvement = 0
    @Published var history: [TestAttempt] = []
    
    struct TestAttempt: Identifiable, Codable {
        let id: Int
        let score: Int
        let total: Int
        let created_at: String
        
        var percentage: Int {
            total > 0 ? (score * 100) / total : 0
        }
    }

    struct DashboardData: Codable {
        let pretest_done: Int?
        let pretest_score: Int?
        let pretest_total: Int?
        let pretest: QuizSummary?
        let videos: VideoSummary?
        let posttest: PostTestSummary?
        
        enum CodingKeys: String, CodingKey {
            case pretest_done, pretest_score, pretest_total, pretest, videos, posttest
        }
        
        init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.pretest_done = decodeInt(from: container, key: .pretest_done)
            self.pretest_score = decodeInt(from: container, key: .pretest_score)
            self.pretest_total = decodeInt(from: container, key: .pretest_total)
            self.pretest = try? container.decodeIfPresent(QuizSummary.self, forKey: .pretest)
            self.videos = try? container.decodeIfPresent(VideoSummary.self, forKey: .videos)
            self.posttest = try? container.decodeIfPresent(PostTestSummary.self, forKey: .posttest)
        }
    }
    
    struct QuizSummary: Codable {
        let completed: Bool?
        let status: String?
        let score: Int?
        let total: Int?
        let done: Bool?
        
        enum CodingKeys: String, CodingKey {
            case completed, status, score, total, done
        }
        
        init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.completed = decodeBool(from: container, key: .completed)
            self.status = decodeString(from: container, key: .status)
            self.score = decodeInt(from: container, key: .score)
            self.total = decodeInt(from: container, key: .total)
            self.done = decodeBool(from: container, key: .done)
        }
    }
    
    struct VideoSummary: Codable {
        let unlocked: Bool?
        let status: String?
        let completed: Int?
        let total: Int?
        let done: Bool?
        
        enum CodingKeys: String, CodingKey {
            case unlocked, status, completed, total, done
        }
        
        init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.unlocked = decodeBool(from: container, key: .unlocked)
            self.status = decodeString(from: container, key: .status)
            self.completed = decodeInt(from: container, key: .completed)
            self.total = decodeInt(from: container, key: .total)
            self.done = decodeBool(from: container, key: .done)
        }
    }
    
    struct PostTestSummary: Codable {
        let unlocked: Bool?
        let status: String?
        let attempts: Int?
        let bestScore: Int?
        let best_score: Int?
        let bestTotal: Int?
        let done: Bool?
        
        enum CodingKeys: String, CodingKey {
            case unlocked, status, attempts, bestScore, best_score, bestTotal, done
        }
        
        init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.unlocked = decodeBool(from: container, key: .unlocked)
            self.status = decodeString(from: container, key: .status)
            self.attempts = decodeInt(from: container, key: .attempts)
            self.bestScore = decodeInt(from: container, key: .bestScore)
            self.best_score = decodeInt(from: container, key: .best_score)
            self.bestTotal = decodeInt(from: container, key: .bestTotal)
            self.done = decodeBool(from: container, key: .done)
        }
    }
    
    func fetchSummary() {
        isLoading = true
        errorMessage = nil
        var userId = UserDefaults.standard.integer(forKey: "user_id")
        if userId == 0, let strId = UserDefaults.standard.string(forKey: "user_id"), let parsed = Int(strId) {
            userId = parsed
        }
        
        guard userId > 0 else {
            self.isLoading = false
            self.errorMessage = "User ID missing. Please log in again."
            return
        }
        
        let parameters = ["user_id": "\(userId)"]
        NetworkManager.shared.postRequest(endpoint: "/dashboard/get_dashboard.php", parameters: parameters) { (result: Result<BaseResponse<DashboardData>, Error>) in
            DispatchQueue.main.async {
                self.isLoading = false
                switch result {
                case .success(let response):
                    if response.success, let data = response.data {
                        let pre = data.pretest
                        let vids = data.videos
                        let post = data.posttest
                        
                        let preDone = (pre?.completed == true || pre?.done == true || pre?.status == "Completed" || (pre?.score ?? 0) > 0 || data.pretest_done == 1)
                        self.preScore = pre?.score ?? (data.pretest_score ?? 0)
                        self.preTotal = (pre?.total ?? 0) > 0 ? (pre?.total ?? 10) : ((data.pretest_total ?? 0) > 0 ? (data.pretest_total ?? 10) : 10)
                        self.preStatus = preDone ? "Completed" : "Available"
                        
                        self.videoCompleted = vids?.completed ?? 0
                        self.videoTotal = (vids?.total ?? 0) > 0 ? (vids?.total ?? 3) : 3
                        let vidDone = (vids?.done == true || vids?.status == "Completed" || (self.videoTotal > 0 && self.videoCompleted >= self.videoTotal))
                        self.videoStatus = preDone ? (vidDone ? "Completed" : (vids?.status ?? "Available")) : "Locked"
                        
                        self.postBestScore = post?.bestScore ?? (post?.best_score ?? 0)
                        self.postBestTotal = (post?.bestTotal ?? 0) > 0 ? (post?.bestTotal ?? 10) : 10
                        self.attemptsCount = post?.attempts ?? 0
                        let postUnlocked = post?.unlocked ?? (preDone && vidDone)
                        self.postStatus = postUnlocked ? (self.attemptsCount > 0 ? "Completed" : "Available") : "Locked"
                        
                        let prePct = self.preTotal > 0 ? (self.preScore * 100) / self.preTotal : 0
                        let postPct = self.postBestTotal > 0 ? (self.postBestScore * 100) / self.postBestTotal : 0
                        self.improvement = postPct - prePct
                        
                        self.fetchHistory()
                    } else {
                        self.errorMessage = response.message.isEmpty ? "Failed to load dashboard data." : response.message
                    }
                case .failure(let error):
                    self.errorMessage = "Dashboard Error: \(error.localizedDescription)"
                }
            }
        }
    }
    
    func fetchHistory() {
        let userId = UserDefaults.standard.integer(forKey: "user_id")
        let parameters = ["user_id": "\(userId)"]
        
        NetworkManager.shared.postRequest(endpoint: "/tests/get_history.php", parameters: parameters) { (result: Result<BaseResponse<[TestAttempt]>, Error>) in
            DispatchQueue.main.async {
                self.isLoading = false
                switch result {
                case .success(let response):
                    if response.success, let data = response.data {
                        self.history = data
                    }
                case .failure(let error):
                    print("History fetch failed: \(error.localizedDescription)")
                }
            }
        }
    }
}

// Helper for Any Types in Codable
struct AnyCodable: Codable {
    let value: Any
    
    init(_ value: Any) {
        self.value = value
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let x = try? container.decode(Bool.self) { value = x }
        else if let x = try? container.decode(Int.self) { value = x }
        else if let x = try? container.decode(Double.self) { value = x }
        else if let x = try? container.decode(String.self) { value = x }
        else if let x = try? container.decode([String: AnyCodable].self) { value = x.mapValues { $0.value } }
        else if let x = try? container.decode([AnyCodable].self) { value = x.map { $0.value } }
        else { throw DecodingError.typeMismatch(AnyCodable.self, DecodingError.Context(codingPath: decoder.codingPath, debugDescription: "Wrong type")) }
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        if let x = value as? Bool { try container.encode(x) }
        else if let x = value as? Int { try container.encode(x) }
        else if let x = value as? Double { try container.encode(x) }
        else if let x = value as? String { try container.encode(x) }
        else if let x = value as? [String: Any] { try container.encode(x.mapValues { AnyCodable($0) }) }
        else if let x = value as? [Any] { try container.encode(x.map { AnyCodable($0) }) }
    }
}

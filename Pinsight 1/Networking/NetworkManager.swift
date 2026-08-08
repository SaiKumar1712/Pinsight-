import Foundation

class NetworkManager {
    static let shared = NetworkManager()
    
    // ADJUST THIS TO YOUR ACTUAL BACKEND URL (XAMPP LOCALHOST)
    #if targetEnvironment(simulator)
    let baseURL = "http://localhost/Backend"
    #else
    let baseURL = "http://172.25.81.10/Backend"
    #endif
    
    private init() {}
    
    func postRequest<T: Codable>(endpoint: String, parameters: [String: String], completion: @escaping (Result<T, Error>) -> Void) {
        let fullURLString = baseURL.appending(endpoint)
        guard let url = URL(string: fullURLString) else {
            completion(.failure(NSError(domain: "Invalid URL", code: 400, userInfo: nil)))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        
        var components = URLComponents()
        components.queryItems = parameters.map { URLQueryItem(name: $0.key, value: $0.value) }
        request.httpBody = components.query?.data(using: .utf8)
        request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                DispatchQueue.main.async { completion(.failure(error)) }
                return
            }
            
            let httpResponse = response as? HTTPURLResponse
            let statusCode = httpResponse?.statusCode ?? 0
            
            guard let data = data else {
                DispatchQueue.main.async {
                    completion(.failure(NSError(domain: "Network", code: statusCode, userInfo: [NSLocalizedDescriptionKey: "No data received (Status: \(statusCode))"])))
                }
                return
            }
            
            do {
                let decodedResponse = try JSONDecoder().decode(T.self, from: data)
                DispatchQueue.main.async {
                    completion(.success(decodedResponse))
                }
            } catch {
                let rawString = String(data: data, encoding: .utf8) ?? "Empty Body"
                print("RAW RESPONSE (\(statusCode)): \(rawString)")
                DispatchQueue.main.async { 
                    let errorMessage = rawString.isEmpty ? "Empty response from server (Status: \(statusCode))" : rawString
                    completion(.failure(NSError(domain: "Decoding", code: statusCode, userInfo: [NSLocalizedDescriptionKey: errorMessage])))
                }
            }
        }.resume()
    }
    
    func fetchRequest<T: Codable>(endpoint: String, parameters: [String: String] = [:], completion: @escaping (Result<T, Error>) -> Void) {
        let fullURLString = baseURL.appending(endpoint)
        guard var components = URLComponents(string: fullURLString) else {
            completion(.failure(NSError(domain: "Invalid URL", code: 400, userInfo: nil)))
            return
        }
        
        if !parameters.isEmpty {
            components.queryItems = parameters.map { URLQueryItem(name: $0.key, value: $0.value) }
        }
        
        guard let url = components.url else {
            completion(.failure(NSError(domain: "Invalid URL", code: 400, userInfo: nil)))
            return
        }
        
        URLSession.shared.dataTask(with: url) { data, response, error in
            if let error = error {
                DispatchQueue.main.async { completion(.failure(error)) }
                return
            }
            
            let httpResponse = response as? HTTPURLResponse
            let statusCode = httpResponse?.statusCode ?? 0
            
            guard let data = data else {
                DispatchQueue.main.async {
                    completion(.failure(NSError(domain: "Network", code: statusCode, userInfo: [NSLocalizedDescriptionKey: "No data received (Status: \(statusCode))"])))
                }
                return
            }
            
            do {
                let decodedResponse = try JSONDecoder().decode(T.self, from: data)
                DispatchQueue.main.async {
                    completion(.success(decodedResponse))
                }
            } catch {
                let rawString = String(data: data, encoding: .utf8) ?? "Empty Body"
                print("RAW RESPONSE (\(statusCode)): \(rawString)")
                DispatchQueue.main.async { 
                    let errorMessage = rawString.isEmpty ? "Empty response from server (Status: \(statusCode))" : rawString
                    completion(.failure(NSError(domain: "Decoding", code: statusCode, userInfo: [NSLocalizedDescriptionKey: errorMessage])))
                }
            }
        }.resume()
    }

    // MARK: - Raw streaming video upload (video never fully in RAM)
    /// Sends video as a raw octet-stream body; metadata travels as query parameters.
    /// On success, uploads the thumbnail in a lightweight separate POST.
    func uploadVideo<T: Codable>(
        endpoint: String,
        title: String,
        module_id: String,
        videoURL: URL,
        thumbnailData: Data? = nil,
        completion: @escaping (Result<T, Error>) -> Void
    ) {
        let ext = videoURL.pathExtension.isEmpty ? "mp4" : videoURL.pathExtension.lowercased()
        let encodedTitle = title.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? title
        let urlString = "\(baseURL)\(endpoint)?title=\(encodedTitle)&module_id=\(module_id)&ext=\(ext)"

        guard let url = URL(string: urlString) else {
            completion(.failure(NSError(domain: "InvalidURL", code: 400)))
            return
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/octet-stream", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 600

        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest  = 600
        config.timeoutIntervalForResource = 600
        let session = URLSession(configuration: config)

        // ─ Stream video file directly with no intermediate copy ─
        session.uploadTask(with: request, fromFile: videoURL) { [weak self] data, response, error in
            guard let self else { return }
            try? FileManager.default.removeItem(at: videoURL)  // cleanup temp

            if let error = error {
                DispatchQueue.main.async { completion(.failure(error)) }
                return
            }
            let statusCode = (response as? HTTPURLResponse)?.statusCode ?? 0
            guard let data = data else {
                DispatchQueue.main.async {
                    completion(.failure(NSError(domain: "Network", code: statusCode,
                        userInfo: [NSLocalizedDescriptionKey: "No data (status \(statusCode))"])))
                }
                return
            }

            do {
                let decoded = try JSONDecoder().decode(T.self, from: data)

                // ─ Upload thumbnail separately (small, fast) ─
                if let thumbData = thumbnailData,
                   let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let dataObj = json["data"] as? [String: Any],
                   let videoId = dataObj["video_id"] as? Int {
                    self.uploadThumbnail(videoId: videoId, thumbnailData: thumbData) { _ in
                        DispatchQueue.main.async { completion(.success(decoded)) }
                    }
                } else {
                    DispatchQueue.main.async { completion(.success(decoded)) }
                }
            } catch {
                let raw = String(data: data, encoding: .utf8) ?? "Empty"
                print("RAW RESPONSE (\(statusCode)): \(raw)")
                DispatchQueue.main.async {
                    completion(.failure(NSError(domain: "Decoding", code: statusCode,
                        userInfo: [NSLocalizedDescriptionKey: raw])))
                }
            }
        }.resume()
    }

    /// Lightweight POST to attach a thumbnail JPEG to an already-uploaded video.
    private func uploadThumbnail(videoId: Int, thumbnailData: Data, completion: @escaping (Bool) -> Void) {
        guard let url = URL(string: baseURL + "/videos/update_thumbnail.php") else {
            completion(false); return
        }
        let boundary = "ThumbBoundary-\(UUID().uuidString)"
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 30

        var body = Data()
        // video_id field
        body.append("--\(boundary)\r\nContent-Disposition: form-data; name=\"video_id\"\r\n\r\n\(videoId)\r\n".data(using: .utf8)!)
        // thumbnail file
        body.append("--\(boundary)\r\nContent-Disposition: form-data; name=\"thumbnail\"; filename=\"thumb.jpg\"\r\nContent-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
        body.append(thumbnailData)
        body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)
        request.httpBody = body

        URLSession.shared.dataTask(with: request) { _, _, _ in completion(true) }.resume()
    }
}


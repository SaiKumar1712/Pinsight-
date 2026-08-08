import Foundation

struct BaseResponse<T: Codable>: Codable {
    let success: Bool
    let message: String
    var data: T?

    private enum CodingKeys: String, CodingKey {
        case status, success, message, data
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        // 1. Decode Success/Status
        if let successBool = try? container.decode(Bool.self, forKey: .success) {
            self.success = successBool
        } else if let successInt = try? container.decode(Int.self, forKey: .success) {
            self.success = (successInt == 1)
        } else if let statusBool = try? container.decode(Bool.self, forKey: .status) {
            self.success = statusBool
        } else if let statusInt = try? container.decode(Int.self, forKey: .status) {
            self.success = (statusInt == 1)
        } else if let statusString = try? container.decode(String.self, forKey: .status) {
            let s = statusString.lowercased()
            self.success = (s == "success" || s == "true" || s == "1" || s == "ok")
        } else {
            self.success = false
        }
        
        // 2. Decode Message
        self.message = (try? container.decode(String.self, forKey: .message)) ?? ""
        
        // 3. Decode Data (Universal Unwrapper)
        // Try direct first
        if let direct = try? container.decodeIfPresent(T.self, forKey: .data) {
            self.data = direct
        } 
        // If that fails, try looking inside 'data' for ANY key that matches T
        else if let nested = try? container.nestedContainer(keyedBy: DynamicCodingKeys.self, forKey: .data) {
            for key in nested.allKeys {
                if let unwrapped = try? nested.decode(T.self, forKey: key) {
                    self.data = unwrapped
                    return
                }
            }
            self.data = nil
        } else {
            self.data = nil
        }
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(success, forKey: .success)
        try container.encode(message, forKey: .message)
        try container.encodeIfPresent(data, forKey: .data)
    }

    struct DynamicCodingKeys: CodingKey {
        var stringValue: String
        init?(stringValue: String) { self.stringValue = stringValue }
        var intValue: Int?
        init?(intValue: Int) { return nil }
    }
}

struct EmptyResponse: Codable {}

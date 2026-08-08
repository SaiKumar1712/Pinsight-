import Foundation

struct User: Codable {
    let user_id: Int
    let name: String
    let email: String
    let user_type: String // 'user' or 'admin'
}

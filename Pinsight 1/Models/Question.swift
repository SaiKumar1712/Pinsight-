import Foundation

struct Question: Codable, Identifiable {
    let id: Int
    let question_text: String
    let option_a: String
    let option_b: String
    let option_c: String
    let option_d: String
    let correct_answer: String
    let question_type: String // 'pretest', 'posttest', 'both'
    let module_id: Int?

    private enum CodingKeys: String, CodingKey {
        case id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_type, module_id
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        // Handle 'id' which might be String or Int
        if let idInt = try? container.decode(Int.self, forKey: .id) {
            self.id = idInt
        } else if let idString = try? container.decode(String.self, forKey: .id), let idInt = Int(idString) {
            self.id = idInt
        } else {
            self.id = 0
        }
        
        self.question_text = (try? container.decode(String.self, forKey: .question_text)) ?? ""
        self.option_a = (try? container.decode(String.self, forKey: .option_a)) ?? ""
        self.option_b = (try? container.decode(String.self, forKey: .option_b)) ?? ""
        self.option_c = (try? container.decode(String.self, forKey: .option_c)) ?? ""
        self.option_d = (try? container.decode(String.self, forKey: .option_d)) ?? ""
        self.correct_answer = (try? container.decode(String.self, forKey: .correct_answer)) ?? ""
        self.question_type = (try? container.decode(String.self, forKey: .question_type)) ?? ""
        
        // Handle 'module_id' which might be String or Int
        if let mIdInt = try? container.decode(Int.self, forKey: .module_id) {
            self.module_id = mIdInt
        } else if let mIdString = try? container.decode(String.self, forKey: .module_id) {
            self.module_id = Int(mIdString)
        } else {
            self.module_id = nil
        }
    }
}

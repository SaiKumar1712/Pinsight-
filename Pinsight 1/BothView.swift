import SwiftUI

// MARK: - MODEL
struct Questions: Identifiable {
    let id = UUID()
    let number: Int
    let type: String
    let text: String
    let correct: String
}

// MARK: - MAIN VIEW
struct ManageQuestionsUI: View {

    enum Tab: String, CaseIterable {
        case all = "All"
        case pre = "Pre-Test"
        case post = "Post-Test"
        case both = "Both"
    }

    @State private var selectedTab: Tab = .both

    // ✅ FIXED ARRAY TYPE
    private let questions: [Questions] = [
        Questions(number: 1, type: "Pre-Test", text: "Question text here...", correct: "A"),
        Questions(number: 2, type: "Pre-Test", text: "Question text here...", correct: "A"),
        Questions(number: 3, type: "Pre-Test", text: "Question text here...", correct: "A"),
        Questions(number: 4, type: "Pre-Test", text: "Question text here...", correct: "A")
    ]

    var body: some View {
        ZStack {
            Color(.systemGroupedBackground)
                .ignoresSafeArea()

            VStack(spacing: 16) {

                // MARK: Title
                Text("Manage Questions")
                    .font(.system(size: 22, weight: .semibold))
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal)

                // MARK: Tabs
                VStack(spacing: 6) {
                    HStack {
                        ForEach(Tab.allCases, id: \.self) { tab in
                            VStack(spacing: 6) {
                                Text(tab.rawValue)
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(
                                        selectedTab == tab ? .black : .gray
                                    )
                                    .onTapGesture {
                                        withAnimation(.easeInOut) {
                                            selectedTab = tab
                                        }
                                    }

                                Capsule()
                                    .fill(
                                        selectedTab == tab
                                        ? Color.purple
                                        : Color.clear
                                    )
                                    .frame(height: 3)
                            }
                            .frame(maxWidth: .infinity)
                        }
                    }

                    Divider()
                }
                .padding(.horizontal)

                // MARK: Add Button
                Button(action: {}) {
                    Text("+ Add New Question")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.green)
                        .cornerRadius(30)
                }
                .padding(.horizontal)

                // MARK: Question List
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 16) {
                        ForEach(questions) { question in
                            QuestionCardView(question: question)
                        }
                    }
                    .padding(.horizontal)
                    .padding(.top, 8)
                }

                Spacer()
            }
            .padding(.top, 8)
        }
    }
}

// MARK: - QUESTION CARD
struct QuestionCardView: View {

    let question: Questions   // ✅ Updated type

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {

            HStack {
                Text("Q\(question.number)")
                    .fontWeight(.semibold)

                Text(question.type)
                    .font(.caption)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 5)
                    .background(Color.green)
                    .foregroundColor(.white)
                    .cornerRadius(14)

                Spacer()

                Image(systemName: "pencil")
                    .foregroundColor(.gray)

                Image(systemName: "trash")
                    .foregroundColor(.red)
            }

            Text(question.text)
                .font(.body)

            Text("Correct: \(question.correct)")
                .font(.subheadline)
                .foregroundColor(.green)
        }
        .padding()
        .background(Color.white)
        .cornerRadius(18)
        .shadow(color: .black.opacity(0.08), radius: 6, x: 0, y: 3)
    }
}

// MARK: - PREVIEW
#Preview {
    ManageQuestionsUI()
}

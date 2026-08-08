import SwiftUI

// MARK: - MAIN VIEW
struct PretestView: View {

    enum Filter: String, CaseIterable {
        case all = "All"
        case pre = "Pre-Test"
        case post = "Post-Test"
        case both = "Both"
    }

    @State private var selectedFilter: Filter = .pre

    var body: some View {
        ZStack {
            Color(.systemGray6).ignoresSafeArea()

            VStack(spacing: 18) {

                // MARK: - TITLE
                Text("Manage Questions")
                    .font(.title2)
                    .fontWeight(.semibold)
                    .padding(.top, 12)

                // MARK: - FILTER TABS
                HStack {
                    ForEach(Filter.allCases, id: \.self) { filter in
                        VStack(spacing: 6) {
                            Text(filter.rawValue)
                                .font(.subheadline)
                                .foregroundColor(
                                    selectedFilter == filter ? .black : .gray
                                )
                                .onTapGesture {
                                    selectedFilter = filter
                                }

                            Capsule()
                                .fill(
                                    selectedFilter == filter
                                    ? Color.purple
                                    : Color.clear
                                )
                                .frame(height: 3)
                        }
                        .frame(maxWidth: .infinity)
                    }
                }
                .padding(.horizontal)

                Divider()

                // MARK: - ADD QUESTION BUTTON
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

                // MARK: - QUESTION CARD
                ScrollView(showsIndicators: false) {
                    VStack {
                        QuestionCardView(
                            question: Questions(
                                number: 1,
                                type: "Pre-Test",
                                text: "Question text here...",
                                correct: "A"
                            )
                        )
                    }
                    VStack {
                        QuestionCardView(
                            question: Questions(
                                number: 1,
                                type: "Pre-Test",
                                text: "Question text here...",
                                correct: "B"
                            )
                        )
                    }
                    VStack {
                        QuestionCardView(
                            question: Questions(
                                number: 1,
                                type: "Pre-Test",
                                text: "Question text here...",
                                correct: "C"
                            )
                        )
                    }
                    VStack {
                        QuestionCardView(
                            question: Questions(
                                number: 1,
                                type: "Pre-Test",
                                text: "Question text here...",
                                correct: "D"
                            )
                        )
                    }
                    .padding(.horizontal)
                    .padding(.top, 10)
                }

                Spacer()
            }
        }
    }
}

// MARK: - QUESTION CARD VIEW
struct questionCardView: View {

    var number: Int
    var tag: String
    var question: String
    var correct: String

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {

            HStack {
                Text("Q\(number)")
                    .fontWeight(.semibold)

                Text(tag)
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

            Text(question)
                .font(.body)
                .foregroundColor(.black)

            Text("Correct: \(correct)")
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
    PretestView()
}

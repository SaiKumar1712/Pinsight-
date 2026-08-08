import SwiftUI

// MARK: - Manage Questions View
struct ManageQuestionsView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = AdminViewModel()
    @State private var selectedTab = 0
    @State private var searchText = ""
    @State private var showAddPopup = false
    
    private let tabs = ["All", "Pre-Test", "Post-Test", "Both"]

    // Premium Colors
    private let mintGreenText = Color(red: 0.35, green: 0.8, blue: 0.65)
    private let darkNavy = Color(red: 0.1, green: 0.12, blue: 0.25)
    private let softMint = Color(red: 0.92, green: 0.98, blue: 0.97)

    private var filteredQuestions: [Question] {
        let all = viewModel.questions
        let filteredByType: [Question] = {
            switch selectedTab {
            case 1: return all.filter { $0.question_type == "pretest" }
            case 2: return all.filter { $0.question_type == "posttest" }
            case 3: return all.filter { $0.question_type == "both" }
            default: return all
            }
        }()
        
        if searchText.isEmpty {
            return filteredByType
        } else {
            return filteredByType.filter { $0.question_text.lowercased().contains(searchText.lowercased()) }
        }
    }

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(red: 0.96, green: 0.97, blue: 0.99), softMint],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 0) {
                // Back Button
                HStack {
                    Button(action: { dismiss() }) {
                        ZStack {
                            Circle()
                                .fill(Color.white)
                                .frame(width: 44, height: 44)
                                .shadow(color: .black.opacity(0.06), radius: 8, x: 0, y: 4)
                            Image(systemName: "chevron.left")
                                .font(.system(size: 15, weight: .bold))
                                .foregroundColor(darkNavy)
                        }
                    }
                    Spacer()
                }
                .padding(.horizontal, 24)
                .padding(.top, 56)
                .padding(.bottom, 12)

                ScrollView(showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 25) {
                        // Header
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Assessments")
                                .font(.system(size: 32, weight: .black))
                                .foregroundColor(darkNavy)
                            Text("Design and manage pre & post-test questions")
                                .font(.system(size: 15, weight: .medium))
                                .foregroundColor(Color.black.opacity(0.4))
                        }
                        .padding(.horizontal, 24)

                        // Search Bar
                        HStack(spacing: 12) {
                            Image(systemName: "magnifyingglass")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(darkNavy.opacity(0.3))
                            TextField("Search questions...", text: $searchText)
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(darkNavy)
                        }
                        .padding(.horizontal, 20)
                        .padding(.vertical, 16)
                        .background(Color.white)
                        .cornerRadius(25)
                        .shadow(color: .black.opacity(0.03), radius: 10, x: 0, y: 5)
                        .padding(.horizontal, 24)

                        // Tab Selector
                        HStack(spacing: 0) {
                            ForEach(0..<tabs.count, id: \.self) { i in
                                Button(action: { withAnimation(.easeInOut(duration: 0.2)) { selectedTab = i } }) {
                                    Text(tabs[i])
                                        .font(.system(size: 14, weight: .bold))
                                        .foregroundColor(selectedTab == i ? darkNavy : .gray.opacity(0.8))
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, 12)
                                        .background(selectedTab == i ? Color.white : Color.clear)
                                        .cornerRadius(30)
                                        .shadow(color: selectedTab == i ? .black.opacity(0.04) : .clear, radius: 6, x: 0, y: 2)
                                }
                            }
                        }
                        .padding(4)
                        .background(Color(white: 0.92).opacity(0.6))
                        .cornerRadius(35)
                        .padding(.horizontal, 24)

                        // Add Button
                        Button(action: { showAddPopup = true }) {
                            Text("Add New Question")
                                .font(.system(size: 17, weight: .bold))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 18)
                                .background(mintGreenText)
                                .cornerRadius(25)
                                .shadow(color: mintGreenText.opacity(0.2), radius: 10, y: 5)
                        }
                        .padding(.horizontal, 24)

                        if viewModel.isLoading {
                            ProgressView().padding().frame(maxWidth: .infinity)
                        }
                        if let error = viewModel.errorMessage {
                            Text(error).foregroundColor(.red).font(.caption).padding().frame(maxWidth: .infinity)
                        }

                        // List
                        VStack(spacing: 16) {
                            ForEach(Array(filteredQuestions.enumerated()), id: \.offset) { index, question in
                                QuestionCard(number: index + 1, question: question) {
                                    viewModel.deleteQuestion(id: question.id)
                                }
                            }
                        }
                        .padding(.horizontal, 24)

                        Spacer(minLength: 50)
                    }
                }
            }

            if showAddPopup {
                Color.black.opacity(0.3).ignoresSafeArea()
                    .transition(.opacity)
                    .onTapGesture { withAnimation { showAddPopup = false } }

                AddQuestionPopup(viewModel: viewModel, showPopup: $showAddPopup)
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                    .zIndex(1)
            }
        }
        .onAppear { viewModel.fetchAllQuestions() }
        .navigationBarHidden(true)
    }
}

// MARK: - Question Card
struct QuestionCard: View {
    let number: Int
    let question: Question
    var onDelete: () -> Void

    private let mintGreen = Color(red: 0.35, green: 0.8, blue: 0.65)
    private let darkNavy = Color(red: 0.1, green: 0.12, blue: 0.25)

    var body: some View {
        HStack(spacing: 16) {
            ZStack {
                RoundedRectangle(cornerRadius: 18)
                    .fill(mintGreen.opacity(0.1))
                    .frame(width: 58, height: 58)
                Text("Q\(number)")
                    .font(.system(size: 18, weight: .black))
                    .foregroundColor(mintGreen)
            }

            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text(question.question_type.uppercased())
                        .font(.system(size: 10, weight: .black))
                        .foregroundColor(.gray.opacity(0.6))
                        .tracking(1)
                    Spacer()
                    Button(action: onDelete) {
                        Image(systemName: "trash.fill")
                            .foregroundColor(.red.opacity(0.6))
                            .font(.system(size: 14))
                            .padding(8)
                            .background(Color.red.opacity(0.05))
                            .clipShape(Circle())
                    }
                }
                Text(question.question_text)
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(darkNavy)
                    .lineLimit(2)
                HStack(spacing: 5) {
                    Text("CORRECT:")
                        .font(.system(size: 10, weight: .black))
                        .foregroundColor(.gray.opacity(0.7))
                    Text(question.correct_answer.uppercased())
                        .font(.system(size: 13, weight: .black))
                        .foregroundColor(mintGreen)
                }
            }
        }
        .padding(18)
        .background(Color.white)
        .cornerRadius(28)
        .shadow(color: .black.opacity(0.03), radius: 10, x: 0, y: 5)
    }
}

// MARK: - Add Popup
struct AddQuestionPopup: View {
    @ObservedObject var viewModel: AdminViewModel
    @Binding var showPopup: Bool

    @State private var questionText = ""
    @State private var optionA = ""
    @State private var optionB = ""
    @State private var optionC = ""
    @State private var optionD = ""
    @State private var correctAnswer = ""
    @State private var questionType = "pretest"

    private let mintGreen = Color(red: 0.35, green: 0.8, blue: 0.65)
    private let darkNavy = Color(red: 0.1, green: 0.12, blue: 0.25)
    private let typeOptions: [(label: String, tag: String)] = [("Pre", "pretest"), ("Post", "posttest"), ("Both", "both")]

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 24) {
                Text("Create Question")
                    .font(.system(size: 24, weight: .black))
                    .foregroundColor(darkNavy)
                    .padding(.top, 5)

                VStack(alignment: .leading, spacing: 10) {
                    Text("QUESTION CONTENT")
                        .font(.system(size: 10, weight: .black))
                        .foregroundColor(.gray.opacity(0.8))
                        .tracking(1)
                    
                    TextField("What would you like to ask?", text: $questionText)
                        .font(.system(size: 16, weight: .medium))
                        .padding(.horizontal, 18)
                        .padding(.vertical, 16)
                        .background(Color(white: 0.96))
                        .cornerRadius(18)
                        .foregroundColor(darkNavy)
                }

                VStack(alignment: .leading, spacing: 12) {
                    Text("ANSWERS")
                        .font(.system(size: 10, weight: .black))
                        .foregroundColor(.gray.opacity(0.8))
                        .tracking(1)
                    
                    VStack(spacing: 12) {
                        OptionInputField(label: "A", text: $optionA, isSelected: correctAnswer == "A") { correctAnswer = "A" }
                        OptionInputField(label: "B", text: $optionB, isSelected: correctAnswer == "B") { correctAnswer = "B" }
                        OptionInputField(label: "C", text: $optionC, isSelected: correctAnswer == "C") { correctAnswer = "C" }
                        OptionInputField(label: "D", text: $optionD, isSelected: correctAnswer == "D") { correctAnswer = "D" }
                    }
                }

                VStack(alignment: .leading, spacing: 12) {
                    Text("TEST TYPE")
                        .font(.system(size: 10, weight: .black))
                        .foregroundColor(.gray.opacity(0.8))
                        .tracking(1)

                    HStack(spacing: 4) {
                        ForEach(typeOptions, id: \.tag) { opt in
                            Button(action: { questionType = opt.tag }) {
                                Text(opt.label)
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundColor(questionType == opt.tag ? darkNavy : .gray)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 12)
                                    .background(questionType == opt.tag ? Color.white : Color.clear)
                                    .cornerRadius(12)
                                    .shadow(color: questionType == opt.tag ? .black.opacity(0.04) : .clear, radius: 5)
                            }
                        }
                    }
                    .padding(4)
                    .background(Color(white: 0.93))
                    .cornerRadius(16)
                }

                HStack(spacing: 16) {
                    Button("Discard") { withAnimation { showPopup = false } }
                        .font(.system(size: 17, weight: .bold))
                        .foregroundColor(.red.opacity(0.8))
                        .frame(maxWidth: .infinity)

                    Button(action: {
                        viewModel.addQuestion(text: questionText, a: optionA, b: optionB, c: optionC, d: optionD, correct: correctAnswer, type: questionType)
                        withAnimation { showPopup = false }
                    }) {
                        Text("Save Question")
                            .font(.system(size: 17, weight: .bold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 18)
                            .background((!questionText.isEmpty && !optionA.isEmpty && !correctAnswer.isEmpty) ? darkNavy : Color.gray.opacity(0.3))
                            .cornerRadius(25)
                    }
                    .disabled(questionText.isEmpty || optionA.isEmpty || correctAnswer.isEmpty)
                }
            }
            .padding(28)
            .background(Color.white)
            .cornerRadius(35)
            .padding(.horizontal, 24)
            .padding(.top, 80)
        }
        .shadow(color: .black.opacity(0.12), radius: 30, x: 0, y: 15)
    }
}

// MARK: - Option Field
struct OptionInputField: View {
    let label: String
    @Binding var text: String
    let isSelected: Bool
    let onSelect: () -> Void

    private let mintGreen = Color(red: 0.35, green: 0.8, blue: 0.65)
    private let darkNavy = Color(red: 0.1, green: 0.12, blue: 0.25)

    var body: some View {
        HStack(spacing: 15) {
            Button(action: onSelect) {
                ZStack {
                    Circle()
                        .stroke(isSelected ? mintGreen : Color.gray.opacity(0.3), lineWidth: 2)
                        .frame(width: 24, height: 24)
                    if isSelected {
                        Circle().fill(mintGreen).frame(width: 14, height: 14)
                    }
                }
            }
            TextField("Option \(label)", text: $text)
                .font(.system(size: 15, weight: .medium))
                .padding(.vertical, 14)
                .padding(.horizontal, 16)
                .background(Color(white: 0.96))
                .cornerRadius(14)
                .foregroundColor(darkNavy)
        }
    }
}

#Preview {
    NavigationStack {
        ManageQuestionsView()
    }
}

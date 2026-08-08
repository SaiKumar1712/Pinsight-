import SwiftUI

struct DynamicQuizView: View {
    @StateObject private var viewModel = QuizViewModel()
    @Environment(\.dismiss) private var dismiss
    
    let type: String // "pretest" or "posttest"
    
    @State private var currentIndex = 0
    @State private var selectedOptions: [Int: String] = [:] // QuestionID: SelectedAnswer
    @State private var score = 0
    @State private var navigateToResult = false
    @State private var navigateToDashboard = false
    @State private var navigateToVideos = false
    @State private var navigateToSummary = false
    
    @State private var showSubmissionWarning = false
    @State private var showCompletionAlert = false
    @State private var showErrorAlert = false
    @State private var submissionError = ""

    // Updated accent colors to match the premium theme
    private let mint = Color(red: 0.35, green: 0.8, blue: 0.65)
    private let lightMint = Color(red: 0.92, green: 0.99, blue: 0.97)
    private let lightPurple = Color(red: 0.4, green: 0.45, blue: 0.95)

    var body: some View {
        ZStack {
            // Updated background gradient to match the soft premium style
            LinearGradient(
                colors: [
                    Color(red: 0.96, green: 0.97, blue: 0.99),
                    Color(red: 0.92, green: 0.98, blue: 0.97)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            VStack(spacing: 0) {
                CustomBackButton()
                
                if viewModel.isLoading && viewModel.questions.isEmpty {
                    VStack {
                        Spacer()
                        ProgressView()
                            .scaleEffect(1.2)
                            .padding()
                        Text("Preparing your assessment...")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(.black.opacity(0.6))
                        Spacer()
                    }
                } else if let error = viewModel.errorMessage, viewModel.questions.isEmpty {
                    VStack(spacing: 20) {
                        Spacer()
                        Image(systemName: "exclamationmark.circle.fill")
                            .font(.system(size: 50))
                            .foregroundColor(AppColors.secondary)
                        Text("Connection Error").font(.headline).foregroundColor(.black.opacity(0.8))
                        Text(error).font(.caption).foregroundColor(.black.opacity(0.6)).multilineTextAlignment(.center).padding(.horizontal, 40)
                        Button("Try Again") { viewModel.fetchQuestions(type: type) }
                            .font(.headline).foregroundColor(.black).padding(.horizontal, 40).padding(.vertical, 15).background(Color.white).cornerRadius(15)
                        Spacer()
                    }
                } else if viewModel.questions.isEmpty {
                    VStack {
                        Spacer()
                        Text("No questions found for this module")
                            .foregroundColor(.black.opacity(0.5))
                        Spacer()
                    }
                } else {
                    let currentQuestion = viewModel.questions[currentIndex]
                    
                    VStack(spacing: 0) {
                        Spacer()
                        
                        // Progress & Context
                        VStack(spacing: 12) {
                            Text(type == "pretest" ? "Pre-Test" : "Post-Test")
                                .font(.system(size: 32, weight: .black))
                                .foregroundColor(Color(red: 0.1, green: 0.12, blue: 0.2))
                            
                            HStack(spacing: 8) {
                                Text("Question \(currentIndex + 1)")
                                    .font(.system(size: 14, weight: .black))
                                    .foregroundColor(mint)
                                    .padding(.horizontal, 14)
                                    .padding(.vertical, 8)
                                    .background(Color.white)
                                    .cornerRadius(10)
                                    .shadow(color: .black.opacity(0.04), radius: 5, x: 0, y: 2)
                                
                                Text("of \(viewModel.questions.count)")
                                    .font(.system(size: 15, weight: .medium))
                                    .foregroundColor(.gray)
                            }
                            
                            ZStack(alignment: .leading) {
                                Capsule()
                                    .fill(Color.white.opacity(0.5))
                                    .frame(height: 6)
                                
                                Capsule()
                                    .fill(Color.white)
                                    .frame(width: CGFloat(currentIndex + 1) / CGFloat(viewModel.questions.count) * (UIScreen.main.bounds.width - 80), height: 6)
                            }
                            .padding(.horizontal, 40)
                            .padding(.top, 10)
                        }
                        
                        Spacer()
                        
                        // Question Card
                        VStack(alignment: .leading, spacing: 25) {
                            Text(currentQuestion.question_text)
                                .font(.system(size: 19, weight: .bold))
                                .foregroundColor(Color(red: 0.1, green: 0.12, blue: 0.2))
                                .fixedSize(horizontal: false, vertical: true)
                                .lineSpacing(4)
                            
                            VStack(spacing: 14) {
                                ForEach(["a", "b", "c", "d"], id: \.self) { option in
                                    let isSelected = selectedOptions[currentQuestion.id] == option
                                    Button {
                                        withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                                            selectedOptions[currentQuestion.id] = option
                                        }
                                    } label: {
                                        HStack(spacing: 15) {
                                            Text(option.uppercased())
                                                .font(.system(size: 14, weight: .black))
                                                .foregroundColor(isSelected ? .white : .gray)
                                                .frame(width: 32, height: 32)
                                                .background(isSelected ? mint : Color.gray.opacity(0.1))
                                                .clipShape(Circle())
                                            
                                            Text(getOptionText(for: option, from: currentQuestion))
                                                .font(.system(size: 15, weight: isSelected ? .bold : .medium))
                                                .foregroundColor(isSelected ? Color(red: 0.1, green: 0.12, blue: 0.2) : .gray)
                                                .multilineTextAlignment(.leading)
                                                .lineLimit(3)
                                                .minimumScaleFactor(0.8)
                                            
                                            Spacer()
                                            
                                            if isSelected {
                                                Image(systemName: "checkmark.circle.fill")
                                                    .font(.system(size: 20))
                                                    .foregroundColor(mint)
                                            }
                                        }
                                        .padding(16)
                                        .background(isSelected ? lightMint.opacity(0.2) : Color(red: 0.96, green: 0.96, blue: 0.98))
                                        .cornerRadius(20)
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 20)
                                                .stroke(isSelected ? mint : Color.clear, lineWidth: 1.5)
                                        )
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                        }
                        .padding(25)
                        .background(Color.white)
                        .cornerRadius(35)
                        .shadow(color: .black.opacity(0.04), radius: 25, x: 0, y: 10)
                        .padding(.horizontal, 24)
                        
                        Spacer()
                        
                        // Navigation Buttons
                        VStack(spacing: 20) {
                            PrimaryButton(
                                title: currentIndex < viewModel.questions.count - 1 ? "Next Question" : "Submit Assessment",
                                action: {
                                    if currentIndex < viewModel.questions.count - 1 {
                                        withAnimation { currentIndex += 1 }
                                    } else {
                                        showSubmissionWarning = true
                                    }
                                },
                                isEnabled: selectedOptions[currentQuestion.id] != nil,
                                backgroundColor: lightPurple
                            )
                        }
                        .padding(.horizontal, 40)
                        
                        Spacer()
                    }
                }
            }
            
            if showCompletionAlert {
                Color.black.opacity(0.5).ignoresSafeArea()
                    .transition(.opacity)
                
                VStack(spacing: 30) {
                    VStack(spacing: 15) {
                        Circle()
                            .fill(mint)
                            .frame(width: 80, height: 80)
                            .overlay(Image(systemName: "checkmark").font(.system(size: 35, weight: .black)).foregroundColor(.white))
                        
                        Text("Test Submitted").font(.title2).bold()
                        Text("You've scored \(score) out of \(viewModel.questions.count) correct answers.")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 20)
                    }
                    
                    VStack(spacing: 12) {
                        PrimaryButton(title: type == "pretest" ? "Unlock Lessons" : "View Final Results", action: {
                            showCompletionAlert = false
                            if type == "pretest" { navigateToVideos = true } else { navigateToSummary = true }
                        }, backgroundColor: lightPurple)
                        
                        Button {
                            showCompletionAlert = false
                            navigateToDashboard = true
                        } label: {
                            Text("Back to Dashboard")
                                .font(.headline)
                                .foregroundColor(.gray)
                                .padding(.vertical, 5)
                        }
                    }
                }
                .padding(35)
                .background(Color.white)
                .cornerRadius(35)
                .padding(.horizontal, 30)
                .shadow(radius: 25)
                .transition(.scale.combined(with: .opacity))
            }
        }
        .onAppear { viewModel.fetchQuestions(type: type) }
        .navigationBarHidden(true)
        .navigationDestination(isPresented: $navigateToResult) {
            ResultView(score: score, total: viewModel.questions.count, type: type)
        }
        .navigationDestination(isPresented: $navigateToDashboard) {
            UserDashboardView()
        }
        .navigationDestination(isPresented: $navigateToVideos) {
            VideoLessonsView()
        }
        .navigationDestination(isPresented: $navigateToSummary) {
            FinalSummaryView()
        }
        .alert("Submit Test", isPresented: $showSubmissionWarning) {
            Button("Submit", role: .none) { submitQuiz() }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("Ready to finalize your answers? You won't be able to change them after submission.")
        }
        .alert("Submission Error", isPresented: $showErrorAlert) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(submissionError)
        }
    }

    func submitQuiz() {
        var finalScore = 0
        var answers: [[String: Any]] = []
        for q in viewModel.questions {
            let selected = selectedOptions[q.id] ?? ""
            let isCorrect = (selected.lowercased() == q.correct_answer.lowercased())
            if isCorrect { finalScore += 1 }
            answers.append(["question_id": q.id, "selected_answer": selected.lowercased(), "is_correct": isCorrect ? 1 : 0])
        }
        self.score = finalScore
        viewModel.submitQuiz(type: type, score: finalScore, total: viewModel.questions.count, answers: answers) { success in
            if success {
                withAnimation(.spring()) {
                    showCompletionAlert = true
                }
            } else {
                submissionError = viewModel.errorMessage ?? "Failed to save assessment results."
                showErrorAlert = true
            }
        }
    }
    
    private func getOptionText(for key: String, from question: Question) -> String {
        switch key {
        case "a": return question.option_a
        case "b": return question.option_b
        case "c": return question.option_c
        case "d": return question.option_d
        default: return ""
        }
    }
}

struct ProgressBar: View {
    let current: Int
    let total: Int
    var body: some View {
        ZStack(alignment: .leading) {
            Capsule().fill(Color.gray.opacity(0.3)).frame(height: 6)
            Capsule().fill(Color.purple)
                .frame(width: total > 0 ? UIScreen.main.bounds.width * CGFloat(current) / CGFloat(total) : 0, height: 6)
        }.padding(.horizontal)
    }
}

struct ErrorView: View {
    let error: String
    let retryAction: () -> Void
    var body: some View {
        VStack(spacing: 15) {
            Image(systemName: "exclamationmark.triangle").font(.largeTitle).foregroundColor(.orange)
            Text("Error").font(.headline)
            Text(error).foregroundColor(.red).multilineTextAlignment(.center).padding(.horizontal)
            Button(action: retryAction) {
                Text("Retry").fontWeight(.semibold).padding(.horizontal, 40).padding(.vertical, 10).background(Color.blue).foregroundColor(.white).cornerRadius(20)
            }
        }.padding().background(Color.white.opacity(0.9)).cornerRadius(15).shadow(radius: 10).padding()
    }
}

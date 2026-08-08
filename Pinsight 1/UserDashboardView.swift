import SwiftUI

struct UserDashboardView: View {
    @StateObject private var viewModel = SummaryViewModel()
    @Environment(\.dismiss) private var dismiss

    @State private var navigateToPreTest  = false
    @State private var navigateToVideos   = false
    @State private var navigateToPostTest = false
    @State private var navigateToResults  = false
    @State private var showProfile        = false
    @State private var profileImage: UIImage? = nil

    @State private var showAlert   = false
    @State private var alertMessage = ""

    // Updated accent colors to match the premium mint theme
    private let mintGreen = Color(red: 0.35, green: 0.8, blue: 0.65)
    private let lightMint = Color(red: 0.9, green: 0.98, blue: 0.96)
    private let darkNavy  = Color(red: 0.1, green: 0.12, blue: 0.25)

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

                // ── Header ──
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Your Progress")
                            .font(.system(size: 34, weight: .black))
                            .foregroundColor(darkNavy)
                        Text("Complete modules to unlock post-test")
                            .font(.system(size: 15, weight: .medium))
                            .foregroundColor(Color.black.opacity(0.4))
                    }
                    
                    Spacer()
                    
                    // Profile Section
                    Button { showProfile = true } label: {
                        HStack(spacing: 12) {
                            VStack(alignment: .trailing, spacing: 2) {
                                Text("Welcome")
                                    .font(.system(size: 13, weight: .semibold))
                                    .foregroundColor(mintGreen)
                                
                                Text(UserDefaults.standard.string(forKey: "user_name") ?? "User")
                                    .font(.system(size: 16, weight: .bold))
                                    .foregroundColor(darkNavy)
                                    .lineLimit(1)
                            }
                            
                            ZStack {
                                Circle()
                                    .fill(LinearGradient(
                                        colors: [mintGreen, mintGreen.opacity(0.8)],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    ))
                                    .frame(width: 56, height: 56)
                                    .shadow(color: mintGreen.opacity(0.3), radius: 8, x: 0, y: 4)
                                
                                if let img = profileImage {
                                    Image(uiImage: img)
                                        .resizable()
                                        .scaledToFill()
                                        .frame(width: 56, height: 56)
                                        .clipShape(Circle())
                                } else {
                                    Image(systemName: "person.fill")
                                        .foregroundColor(.white)
                                        .font(.system(size: 26))
                                }
                            }
                        }
                    }
                    .buttonStyle(PlainButtonStyle())
                }
                .padding(.horizontal, 24)
                .padding(.top, 50)
                .padding(.bottom, 24)

                // ── Cards ──
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 18) {

                        // Pre-Test
                        DashboardCard2(
                            icon:        "doc.fill",
                            category:    "INITIAL ASSESSMENT",
                            title:       "Pre-Test",
                            detail:      "Score: \(viewModel.preScore)/\(viewModel.preTotal)",
                            status:      viewModel.preStatus,
                            progress:    viewModel.preStatus == "Completed"
                                            ? 1.0
                                            : Double(viewModel.preScore) / Double(max(viewModel.preTotal, 1)),
                            mint:        mintGreen,
                            lightMint:   lightMint
                        ) {
                            if viewModel.preStatus == "Completed" {
                                alertMessage = "You have already completed the Pre-Test."
                                showAlert = true
                            } else {
                                navigateToPreTest = true
                            }
                        }

                        // Video Lessons
                        DashboardCard2(
                            icon:        "play.fill",
                            category:    "LEARNING MODULES",
                            title:       "Video Lessons",
                            detail:      "\(viewModel.videoCompleted)/\(viewModel.videoTotal) completed",
                            status:      viewModel.videoStatus,
                            progress:    Double(viewModel.videoCompleted) / Double(max(viewModel.videoTotal, 1)),
                            mint:        mintGreen,
                            lightMint:   lightMint
                        ) {
                            if viewModel.videoStatus != "Locked" {
                                navigateToVideos = true
                            }
                        }

                        // Post-Test
                        let postProgress: Double = {
                            if viewModel.postStatus == "Completed" {
                                return 1.0
                            }
                            return Double(viewModel.postBestScore) / Double(max(viewModel.postBestTotal, 1))
                        }()

                        DashboardCard2(
                            icon:        "checkmark.shield.fill",
                            category:    "FINAL EVALUATION",
                            title:       "Post-Test",
                            detail:      "Attempts: \(viewModel.attemptsCount)/4 • Best: \(viewModel.postBestScore)/\(viewModel.postBestTotal)",
                            status:      viewModel.postStatus,
                            progress:    postProgress,
                            mint:        mintGreen,
                            lightMint:   lightMint
                        ) {
                            if viewModel.postStatus != "Locked" {
                                if viewModel.postBestScore == viewModel.postBestTotal && viewModel.postBestTotal > 0 {
                                    alertMessage = "You have already completed the Post-Test with a perfect score."
                                    showAlert = true
                                } else if viewModel.attemptsCount >= 4 {
                                    alertMessage = "Limit Complete! You have reached the maximum of 4 attempts."
                                    showAlert = true
                                } else {
                                    navigateToPostTest = true
                                }
                            }
                        }

                        // View Analytics
                        Button { navigateToResults = true } label: {
                            HStack(spacing: 16) {
                                ZStack {
                                    RoundedRectangle(cornerRadius: 12)
                                        .fill(lightMint)
                                        .frame(width: 44, height: 44)
                                    Image(systemName: "chart.bar.fill")
                                        .foregroundColor(mintGreen)
                                        .font(.system(size: 18))
                                }

                                VStack(alignment: .leading, spacing: 2) {
                                    Text("View Analytics")
                                        .font(.system(size: 17, weight: .bold))
                                        .foregroundColor(darkNavy)
                                    Text("Detailed performance breakdown")
                                        .font(.system(size: 13, weight: .regular))
                                        .foregroundColor(.gray)
                                }

                                Spacer()

                                Image(systemName: "chevron.right")
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundColor(mintGreen.opacity(0.3))
                            }
                            .padding(18)
                            .background(Color.white)
                            .cornerRadius(24)
                            .shadow(color: .black.opacity(0.04), radius: 10, x: 0, y: 5)
                        }
                        .buttonStyle(PlainButtonStyle())

                        Spacer(minLength: 40)
                    }
                    .padding(.horizontal, 24)
                }
                .refreshable {
                    viewModel.fetchSummary()
                }
            }
        }
        .onAppear { 
            viewModel.fetchSummary()
            profileImage = getProfileImage()
        }
        .onChange(of: viewModel.errorMessage) { _, error in
            if let err = error, !err.isEmpty {
                alertMessage = err
                showAlert = true
            }
        }
        .onChange(of: navigateToPreTest) { _, newValue in
            if !newValue {
                viewModel.fetchSummary()
            }
        }
        .onChange(of: navigateToVideos) { _, newValue in
            if !newValue {
                viewModel.fetchSummary()
            }
        }
        .navigationBarHidden(true)
        .navigationDestination(isPresented: $navigateToPreTest)  { StartQuizView(type: "pretest") }
        .navigationDestination(isPresented: $navigateToVideos)   { VideoLessonsView() }
        .navigationDestination(isPresented: $navigateToPostTest) { StartQuizView(type: "posttest") }
        .navigationDestination(isPresented: $navigateToResults)  { FinalSummaryView() }
        .sheet(isPresented: $showProfile, onDismiss: {
            profileImage = getProfileImage()
        }) {
            ProfileView()
        }
        .alert("Notice", isPresented: $showAlert) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(alertMessage)
        }
    }
}

// MARK: - Updated Dashboard Card

struct DashboardCard2: View {
    let icon:        String
    let category:    String
    let title:       String
    let detail:      String
    let status:      String
    let progress:    Double
    let mint:        Color
    let lightMint:   Color
    var action:      () -> Void

    @State private var animatedProgress: Double = 0

    private var isLocked: Bool { status == "Locked" }
    private var isAvailable: Bool { status == "Available" }

    private let vibrantBlue = Color(red: 0.0, green: 0.48, blue: 1.0)
    private let lightBlue   = Color(red: 0.88, green: 0.94, blue: 1.0)

    // Badge and icon background color
    private var badgeColor: Color {
        if isLocked { return Color(red: 0.78, green: 0.78, blue: 0.8) }
        if isAvailable { return vibrantBlue }
        return mint
    }
    
    private var iconBgColor: Color {
        if isLocked { return Color(red: 0.94, green: 0.94, blue: 0.95) }
        if isAvailable { return lightBlue }
        return lightMint
    }
    
    private var iconTintColor: Color {
        if isLocked { return Color(red: 0.65, green: 0.65, blue: 0.7) }
        if isAvailable { return vibrantBlue }
        return mint
    }

    private var categoryColor: Color {
        if isLocked { return .gray }
        if isAvailable { return vibrantBlue }
        return mint.opacity(0.8)
    }

    var body: some View {
        Button(action: {
            #if os(iOS)
            UIImpactFeedbackGenerator(style: .light).impactOccurred()
            #endif
            action()
        }) {
            VStack(alignment: .leading, spacing: 14) {

                // Top row: icon ─ info ─ badge
                HStack(spacing: 14) {
                    ZStack {
                        RoundedRectangle(cornerRadius: 12)
                            .fill(iconBgColor)
                            .frame(width: 44, height: 44)
                        Image(systemName: icon)
                            .foregroundColor(iconTintColor)
                            .font(.system(size: 18))
                    }

                    VStack(alignment: .leading, spacing: 3) {
                        Text(category)
                            .font(.system(size: 10, weight: .black))
                            .foregroundColor(categoryColor)
                            .tracking(0.5)

                        Text(title)
                            .font(.system(size: 19, weight: .bold))
                            .foregroundColor(isLocked
                                ? Color(red: 0.6, green: 0.6, blue: 0.65)
                                : Color(red: 0.1, green: 0.12, blue: 0.25))
                    }

                    Spacer()

                    Text(status)
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 7)
                        .background(badgeColor)
                        .clipShape(Capsule())
                }

                // Detail text
                Text(detail)
                    .font(.system(size: 14, weight: .regular))
                    .foregroundColor(Color.gray.opacity(isLocked ? 0.6 : 0.9))

                // Progress bar
                ZStack(alignment: .leading) {
                    Capsule()
                        .fill(Color(red: 0.93, green: 0.95, blue: 0.96))
                        .frame(height: 6)

                    GeometryReader { geo in
                        Capsule()
                            .fill(badgeColor)
                            .frame(width: max(0, min(1.0, animatedProgress)) * geo.size.width,
                                   height: 6)
                    }
                    .frame(height: 6)
                }
            }
            .padding(18)
            .background(Color.white)
            .cornerRadius(24)
            .shadow(color: .black.opacity(isLocked ? 0.02 : 0.04), radius: 10, x: 0, y: 5)
        }
        .buttonStyle(PlainButtonStyle())
        .onAppear {
            withAnimation(.spring(response: 1.0, dampingFraction: 0.75)) {
                animatedProgress = progress
            }
        }
        .onChange(of: progress) { _, newValue in
            withAnimation(.spring(response: 1.0, dampingFraction: 0.75)) {
                animatedProgress = newValue
            }
        }
    }
}

extension UserDashboardView {
    private func getProfileImage() -> UIImage? {
        let userId = UserDefaults.standard.integer(forKey: "user_id")
        let fileName = "profile_\(userId).jpg"
        let path = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0].appendingPathComponent(fileName)
        if let data = try? Data(contentsOf: path) {
            return UIImage(data: data)
        }
        return nil
    }
}

#Preview {
    NavigationStack {
        UserDashboardView()
    }
}

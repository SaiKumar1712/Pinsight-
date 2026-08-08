import SwiftUI

struct AdminDashboardView: View {
    @StateObject private var viewModel = AdminViewModel()
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var session: AppSession
    @State private var showAddQuestion = false
    @State private var showUploadVideo = false
    @State private var showWelcomeToast = false
    @State private var hasShownWelcomeToast = false
    @State private var showLogoutAlert = false

    // Premium Colors
    private let mintGreen = Color(red: 0.35, green: 0.8, blue: 0.65)
    private let lightPurple = Color(red: 0.4, green: 0.45, blue: 0.95)
    private let darkNavy = Color(red: 0.1, green: 0.12, blue: 0.25)
    private let lightMint = Color(red: 0.9, green: 0.98, blue: 0.96)

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

            ScrollView(showsIndicators: false) {
                VStack(spacing: 30) {
                    // Header
                    VStack(alignment: .leading, spacing: 6) {
                        HStack {
                            ZStack {
                                RoundedRectangle(cornerRadius: 14)
                                    .fill(lightPurple.opacity(0.12))
                                    .frame(width: 44, height: 44)
                                Image(systemName: "shield.lefthalf.filled")
                                    .foregroundColor(lightPurple)
                                    .font(.system(size: 20, weight: .bold))
                            }
                            
                            Spacer()
                            
                            Button(action: { 
                                #if os(iOS)
                                UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                                #endif
                                showLogoutAlert = true 
                            }) {
                                Image(systemName: "rectangle.portrait.and.arrow.right")
                                    .font(.system(size: 16, weight: .bold))
                                    .foregroundColor(.white)
                                    .padding(14)
                                    .background(Color(red: 0.95, green: 0.35, blue: 0.35))
                                    .clipShape(Circle())
                                    .shadow(color: Color.red.opacity(0.12), radius: 10, y: 5)
                            }
                            .buttonStyle(.plain)
                        }
                        
                        Text("Admin Console")
                            .font(.system(size: 32, weight: .black))
                            .foregroundColor(darkNavy)
                            .padding(.top, 10)
                        
                        Text("Manage your content and users")
                            .font(.system(size: 15, weight: .medium))
                            .foregroundColor(Color.black.opacity(0.4))
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, 60)

                    // Stats Grid
                    HStack(spacing: 16) {
                        NavigationLink(destination: UserResultsView()) {
                            StatCard(title: "Total Users", value: "\(viewModel.totalUsers)", icon: "person.2.fill", color: lightPurple)
                        }
                        .buttonStyle(.plain)

                        NavigationLink(destination: ManageVideosView()) {
                            StatCard(title: "Active Videos", value: "\(viewModel.totalVideos)", icon: "play.circle.fill", color: mintGreen)
                        }
                        .buttonStyle(.plain)
                    }
                    .padding(.horizontal, 24)
                    
                    if viewModel.isLoading {
                        ProgressView()
                            .padding()
                            .background(Color.white)
                            .cornerRadius(15)
                    }

                    // Management Section
                    VStack(alignment: .leading, spacing: 18) {
                        Text("Management")
                            .font(.system(size: 22, weight: .black))
                            .foregroundColor(darkNavy)
                            .padding(.horizontal, 24)

                        VStack(spacing: 14) {
                            NavigationLink(destination: ManageQuestionsView()) {
                                ManagementRow(
                                    icon: "doc.text.fill",
                                    iconColor: lightPurple,
                                    title: "Test Questions",
                                    subtitle: "Edit pre-test and post-test data"
                                )
                            }
                            .buttonStyle(.plain)

                            NavigationLink(destination: ManageVideosView()) {
                                ManagementRow(
                                    icon: "play.rectangle.fill",
                                    iconColor: mintGreen,
                                    title: "Video Lessons",
                                    subtitle: "Upload and organize video modules"
                                )
                            }
                            .buttonStyle(.plain)

                            NavigationLink(destination: UserResultsView()) {
                                ManagementRow(
                                    icon: "chart.line.uptrend.xyaxis",
                                    iconColor: Color.orange,
                                    title: "User Progress",
                                    subtitle: "Track test scores and completions"
                                )
                            }
                            .buttonStyle(.plain)
                        }
                    }

                    // Quick Actions
                    VStack(alignment: .leading, spacing: 18) {
                        Text("Quick Actions")
                            .font(.system(size: 22, weight: .black))
                            .foregroundColor(darkNavy)
                            .padding(.horizontal, 24)

                        HStack(spacing: 16) {
                            PrimaryButton(
                                title: "Add Quiz",
                                action: { 
                                    #if os(iOS)
                                    UIImpactFeedbackGenerator(style: .light).impactOccurred()
                                    #endif
                                    showAddQuestion = true 
                                },
                                backgroundColor: lightPurple
                            )
                            .frame(height: 54)
                            
                            PrimaryButton(
                                title: "Upload",
                                action: { 
                                    #if os(iOS)
                                    UIImpactFeedbackGenerator(style: .light).impactOccurred()
                                    #endif
                                    showUploadVideo = true 
                                },
                                backgroundColor: mintGreen
                            )
                            .frame(height: 54)
                        }
                        .padding(.horizontal, 24)
                    }

                    Spacer(minLength: 100)
                }
            }
        }
        .onAppear {
            viewModel.fetchDashboardStats()
            if !hasShownWelcomeToast {
                hasShownWelcomeToast = true
                withAnimation(.spring()) {
                    showWelcomeToast = true
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
                    withAnimation {
                        showWelcomeToast = false
                    }
                }
            }
        }
        .overlay(
            Group {
                if showWelcomeToast {
                    VStack {
                        Spacer()
                        HStack(spacing: 12) {
                            ZStack {
                                Circle().fill(Color.white.opacity(0.2)).frame(width: 28, height: 28)
                                Image(systemName: "bell.fill").font(.system(size: 14))
                            }
                            Text("Welcome Admin!")
                                .font(.system(size: 15, weight: .bold))
                        }
                        .foregroundColor(.white)
                        .padding(.horizontal, 30)
                        .padding(.vertical, 14)
                        .background(darkNavy.opacity(0.95))
                        .cornerRadius(25)
                        .shadow(color: .black.opacity(0.15), radius: 15, y: 8)
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                        .padding(.bottom, 100)
                    }
                }
            }
        )
        .overlay(
            Group {
                if showAddQuestion || showUploadVideo {
                    ZStack {
                        Color.black.opacity(0.3).ignoresSafeArea()
                            .transition(.opacity)
                            .onTapGesture {
                                withAnimation {
                                    showAddQuestion = false
                                    showUploadVideo = false
                                }
                            }
                        
                        if showAddQuestion {
                            AddQuestionPopup(viewModel: viewModel, showPopup: $showAddQuestion)
                                .transition(.move(edge: .bottom).combined(with: .opacity))
                        }
                        
                        if showUploadVideo {
                            UploadVideoPopup(viewModel: viewModel, showPopup: $showUploadVideo)
                                .transition(.move(edge: .bottom).combined(with: .opacity))
                        }
                    }
                }
            }
        )
        .alert("Sign Out", isPresented: $showLogoutAlert) {
            Button("Sign Out", role: .destructive) {
                session.logout()
            }
            Button("Cancel", role: .cancel) { }
        } message: {
            Text("Are you sure you want to sign out?")
        }
        .navigationBarHidden(true)
    }
}

// MARK: Components

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            ZStack {
                Circle()
                    .fill(color.opacity(0.1))
                    .frame(width: 44, height: 44)
                Image(systemName: icon)
                    .foregroundColor(color)
                    .font(.system(size: 18, weight: .bold))
            }
            
            VStack(alignment: .leading, spacing: 3) {
                Text(value)
                    .font(.system(size: 28, weight: .black))
                    .foregroundColor(Color(red: 0.1, green: 0.12, blue: 0.25))
                Text(title)
                    .font(.system(size: 13, weight: .black))
                    .foregroundColor(.gray.opacity(0.7))
                    .tracking(0.5)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(22)
        .background(Color.white)
        .cornerRadius(28)
        .shadow(color: .black.opacity(0.04), radius: 12, x: 0, y: 6)
    }
}

struct ManagementRow: View {
    let icon: String
    let iconColor: Color
    let title: String
    let subtitle: String

    var body: some View {
        HStack(spacing: 20) {
            ZStack {
                RoundedRectangle(cornerRadius: 18)
                    .fill(iconColor.opacity(0.1))
                    .frame(width: 65, height: 65)
                
                Image(systemName: icon)
                    .foregroundColor(iconColor)
                    .font(.system(size: 24, weight: .bold))
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.system(size: 17, weight: .bold))
                    .foregroundColor(Color(red: 0.1, green: 0.12, blue: 0.25))
                Text(subtitle)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.gray.opacity(0.7))
                    .lineLimit(2)
            }
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(iconColor.opacity(0.4))
                .padding(10)
                .background(iconColor.opacity(0.08))
                .clipShape(Circle())
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(28)
        .padding(.horizontal, 24)
        .shadow(color: .black.opacity(0.04), radius: 10, x: 0, y: 5)
    }
}
// MARK: - Preview
#Preview {
    NavigationStack {
        AdminDashboardView()
    }
    .environmentObject(AppSession())
}

import SwiftUI

// MARK: - MODEL
struct UserResult: Identifiable {
    let id = UUID()
    let name: String
    let email: String
    let preTest: Int
    let postTest: Int
    let attempts: String
    let improvement: Int
}

// MARK: - MAIN VIEW
struct UserResultsView: View {
    @StateObject private var viewModel = AdminViewModel()
    @Environment(\.dismiss) var dismiss
    @State private var searchText = ""

    var filteredUsers: [AdminViewModel.UserResult] {
        if searchText.isEmpty {
            return viewModel.userResults
        } else {
            return viewModel.userResults.filter {
                $0.name.lowercased().contains(searchText.lowercased()) ||
                $0.email.lowercased().contains(searchText.lowercased())
            }
        }
    }

    // Premium Colors
    private let mintGreen = Color(red: 0.35, green: 0.8, blue: 0.65)
    private let lightPurple = Color(red: 0.4, green: 0.45, blue: 0.95)
    private let darkNavy = Color(red: 0.1, green: 0.12, blue: 0.25)
    private let softMint = Color(red: 0.92, green: 0.98, blue: 0.97)

    var body: some View {
        ZStack {
            // Updated background gradient to match the soft premium style
            LinearGradient(
                colors: [
                    Color(red: 0.96, green: 0.97, blue: 0.99),
                    softMint
                ],
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
                        VStack(alignment: .leading, spacing: 8) {
                            Text("User Performance")
                                .font(.system(size: 32, weight: .black))
                                .foregroundColor(darkNavy)
                            
                            Text("Real-time progress and assessment tracking")
                                .font(.system(size: 15, weight: .medium))
                                .foregroundColor(Color.black.opacity(0.4))
                        }
                        .padding(.horizontal, 24)
                        
                        // Search Bar
                        HStack(spacing: 12) {
                            Image(systemName: "magnifyingglass")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(darkNavy.opacity(0.3))
                            TextField("Search students...", text: $searchText)
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(darkNavy)
                        }
                        .padding(.horizontal, 20)
                        .padding(.vertical, 16)
                        .background(Color.white)
                        .cornerRadius(25)
                        .shadow(color: .black.opacity(0.03), radius: 10, x: 0, y: 5)
                        .padding(.horizontal, 24)

                        if viewModel.isLoading {
                            ProgressView().padding().frame(maxWidth: .infinity)
                        }

                        if let error = viewModel.errorMessage {
                            Text(error).foregroundColor(.red).font(.caption).padding().frame(maxWidth: .infinity)
                        }

                        // Results List
                        VStack(spacing: 16) {
                            ForEach(filteredUsers) { user in
                                UserResultCard(user: user)
                            }
                        }
                        .padding(.horizontal, 24)
                        
                        Spacer(minLength: 50)
                    }
                }
            }
        }
        .onAppear { viewModel.fetchUserResults() }
        .navigationBarHidden(true)
    }
}

struct UserResultCard: View {
    let user: AdminViewModel.UserResult
    
    // Premium Colors local access
    private let mintGreen = Color(red: 0.35, green: 0.8, blue: 0.65)
    private let lightPurple = Color(red: 0.4, green: 0.45, blue: 0.95)
    private let darkNavy = Color(red: 0.1, green: 0.12, blue: 0.25)

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            HStack(spacing: 16) {
                // User Avatar as Hero Icon
                ZStack {
                    RoundedRectangle(cornerRadius: 18)
                        .fill(lightPurple.opacity(0.1))
                        .frame(width: 55, height: 55)
                    
                    Text(String(user.name.prefix(1)))
                        .font(.system(size: 20, weight: .black))
                        .foregroundColor(lightPurple)
                }
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(user.name)
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(darkNavy)
                    Text(user.email)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.gray.opacity(0.7))
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 2) {
                    Text("\(user.improvement)%")
                        .font(.system(size: 14, weight: .black))
                        .foregroundColor(mintGreen)
                    Text("IMPROVEMENT")
                        .font(.system(size: 8, weight: .black))
                        .foregroundColor(mintGreen.opacity(0.7))
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 8)
                .background(mintGreen.opacity(0.1))
                .cornerRadius(12)
            }
            
            Divider().background(Color.black.opacity(0.04))
            
            HStack(spacing: 0) {
                StatColumn(title: "PRE", value: "\(user.pre_test)%", color: darkNavy.opacity(0.7))
                StatColumn(title: "POST", value: "\(user.post_test)%", color: mintGreen)
                StatColumn(title: "ATTEMPTS", value: user.attempts, color: Color.orange.opacity(0.8))
            }
        }
        .padding(18)
        .background(Color.white)
        .cornerRadius(28)
        .shadow(color: .black.opacity(0.03), radius: 10, x: 0, y: 5)
    }
}

struct StatColumn: View {
    let title: String
    let value: String
    let color: Color

    var body: some View {
        VStack(spacing: 5) {
            Text(title)
                .font(.system(size: 9, weight: .black))
                .foregroundColor(.gray.opacity(0.6))
                .tracking(0.5)
            
            Text(value)
                .font(.system(size: 16, weight: .black))
                .foregroundColor(color)
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - PREVIEW
#Preview {
    UserResultsView()
}

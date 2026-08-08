import SwiftUI

// MARK: - USER TYPE SCREEN

struct UserTypeView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var selectedUserType: String? = nil
    @State private var navigateToLogin = false
    
    // Premium Colors
    private let mintGreen = Color(red: 0.35, green: 0.8, blue: 0.65)
    private let lightPurple = Color(red: 0.4, green: 0.45, blue: 0.95)
    private let darkNavy = Color(red: 0.1, green: 0.12, blue: 0.25)

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
                // Header / Logo Section
                VStack(spacing: 18) {
                    ZStack {
                        Circle()
                            .fill(darkNavy)
                            .frame(width: 110, height: 110)
                            .shadow(color: darkNavy.opacity(0.15), radius: 20, y: 10)
                        
                        Image(systemName: "brain.head.profile")
                            .font(.system(size: 55))
                            .foregroundColor(.white)
                    }
                    
                    Text("Pinsight")
                        .font(.system(size: 34, weight: .black))
                        .foregroundColor(darkNavy)
                }
                .padding(.top, 100)
                .padding(.bottom, 70)
                
                // Selection Options
                VStack(spacing: 24) {
                    RoleCard(
                        title: "Learner",
                        subtitle: "Access modules and assessments",
                        icon: "book.fill",
                        color: lightPurple
                    ) {
                        selectedUserType = "user"
                        navigateToLogin = true
                    }
                    
                    RoleCard(
                        title: "Administrator",
                        subtitle: "Manage content and view results",
                        icon: "shield.fill",
                        color: mintGreen
                    ) {
                        selectedUserType = "admin"
                        navigateToLogin = true
                    }
                }
                .padding(.horizontal, 24)
                
                Spacer()
                
                // Footer
                Text("Secure • Private • Performance Focused")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(darkNavy.opacity(0.2))
                    .padding(.bottom, 30)
            }
        }
        .navigationBarHidden(true)
        .navigationDestination(isPresented: $navigateToLogin) {
            SigninView()
        }
    }
}

struct RoleCard: View {
    let title: String
    let subtitle: String
    let icon: String
    let color: Color
    let action: () -> Void
    
    private let darkNavy = Color(red: 0.1, green: 0.12, blue: 0.25)

    var body: some View {
        Button(action: {
            #if os(iOS)
            UIImpactFeedbackGenerator(style: .medium).impactOccurred()
            #endif
            action()
        }) {
            HStack(spacing: 20) {
                // Large Colored Square for Icon
                ZStack {
                    RoundedRectangle(cornerRadius: 18)
                        .fill(color.opacity(0.1))
                        .frame(width: 75, height: 75)
                    
                    Image(systemName: icon)
                        .foregroundColor(color)
                        .font(.system(size: 28, weight: .bold))
                }
                
                VStack(alignment: .leading, spacing: 6) {
                    Text(title)
                        .font(.system(size: 19, weight: .black))
                        .foregroundColor(darkNavy)
                    Text(subtitle)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.gray.opacity(0.7))
                        .lineLimit(2)
                        .fixedSize(horizontal: false, vertical: true)
                }
                
                Spacer()
                
                // Small Chevron in Circle
                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(color.opacity(0.4))
                    .padding(10)
                    .background(color.opacity(0.06))
                    .clipShape(Circle())
            }
            .padding(18)
            .background(Color.white)
            .cornerRadius(35)
            .shadow(color: .black.opacity(0.04), radius: 12, x: 0, y: 8)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - PREVIEWS

#Preview("User Type Screen") {
    NavigationStack {
        UserTypeView()
    }
}

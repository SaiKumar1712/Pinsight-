import SwiftUI

// MARK: - Content View

struct Onboardingscreen: View {
    @State private var navigateToUserType = false
    
    // Premium Colors
    private let mintGreen = Color(red: 0.35, green: 0.8, blue: 0.65)
    private let lightPurple = Color(red: 0.4, green: 0.45, blue: 0.95)
    private let darkNavy = Color(red: 0.1, green: 0.12, blue: 0.25)
    private let softPink = Color(red: 0.95, green: 0.45, blue: 0.55)

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
                Spacer()
                
                // Hero Section
                VStack(spacing: 30) {
                    ZStack {
                        Circle()
                            .fill(lightPurple)
                            .frame(width: 150, height: 150)
                            .shadow(color: lightPurple.opacity(0.2), radius: 30, y: 15)
                        
                        Image(systemName: "brain.head.profile")
                            .font(.system(size: 75))
                            .foregroundColor(.white)
                    }
                    
                    VStack(spacing: 14) {
                        Text("Pinsight")
                            .font(.system(size: 56, weight: .black))
                            .foregroundColor(darkNavy)
                        
                        Text("ELEVATE YOUR TEACHING")
                            .font(.system(size: 14, weight: .black))
                            .foregroundColor(softPink)
                            .tracking(4)
                    }
                }
                
                Spacer()
                
                VStack(spacing: 45) {
                    Text("Pedagogical Innovations & Strategies for Insightful Guidance in Nurturing Teaching")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(darkNavy.opacity(0.6))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 40)
                        .lineSpacing(10)
                    
                    PrimaryButton(
                        title: "Get Started",
                        action: { navigateToUserType = true },
                        backgroundColor: lightPurple
                    )
                    .padding(.horizontal, 24)
                }
                
                Spacer(minLength: 60)
                
                // Footer
                Text("Version 1.0 • Secure & Private")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(darkNavy.opacity(0.2))
                    .padding(.bottom, 20)
            }
        }
        .navigationDestination(isPresented: $navigateToUserType) {
            SigninView()
        }
        .navigationBarHidden(true)
    }
}

// MARK: - Preview

#Preview {
    NavigationStack {
        Onboardingscreen()
    }
}

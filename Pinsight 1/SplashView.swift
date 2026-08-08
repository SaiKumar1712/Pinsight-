import SwiftUI

struct SplashView: View {
    @EnvironmentObject private var session: AppSession
    @State private var size = 0.8
    @State private var opacity = 0.5
    
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
            .scaleEffect(size)
            .opacity(opacity)
            .onAppear {
                withAnimation(.easeIn(duration: 1.0)) {
                    self.size = 1.0
                    self.opacity = 1.0
                }
            }

            VStack {
                Spacer()
                // Footer
                Text("Version 1.0 • Secure & Private")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(darkNavy.opacity(0.15))
                    .padding(.bottom, 20)
            }
        }
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                withAnimation(.easeInOut(duration: 0.5)) {
                    // Telling the root ContentView to switch to LandingView
                    session.hasSeenSplash = true
                }
            }
        }
    }
}

#Preview {
    SplashView()
        .environmentObject(AppSession())
}


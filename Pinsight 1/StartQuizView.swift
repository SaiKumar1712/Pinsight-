import SwiftUI

struct StartQuizView: View {
    var type: String = "pretest" // "pretest" or "posttest"
    @State private var navigateToTest = false
    @Environment(\.dismiss) var dismiss
    
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
                // Header Row
                HStack {
                    CustomBackButton()
                    Spacer()
                }
                .padding(.top, 10)
                
                VStack(spacing: 12) {
                    Text("Ready to Start?")
                        .font(.system(size: 38, weight: .black))
                        .foregroundColor(Color(red: 0.1, green: 0.12, blue: 0.2))
                    
                    Text(type == "pretest" ? "Pre-Course Assessment" : "Final Evaluation")
                        .font(.system(size: 19, weight: .bold))
                        .foregroundColor(Color(red: 0.95, green: 0.4, blue: 0.6)) // Pink/Rose subtitle
                }
                .padding(.top, 40)
                
                Spacer()
                
                // Illustration Card
                VStack(spacing: 25) {
                    ZStack {
                        Circle()
                            .fill(Color(red: 0.92, green: 0.99, blue: 0.97)) // Light Mint background
                            .frame(width: 160, height: 160)
                        
                        Image(systemName: type == "pretest" ? "pencil.and.outline" : "trophy.fill")
                            .font(.system(size: 70, weight: .medium))
                            .foregroundColor(Color(red: 0.3, green: 0.8, blue: 0.65)) // Mint Green icon
                    }
                    
                    Text(type == "pretest" ? "This helps us understand your current level." : "Show us what you've learned in the course.")
                        .font(.system(size: 18, weight: .medium))
                        .lineSpacing(4)
                        .multilineTextAlignment(.center)
                        .foregroundColor(.gray.opacity(0.8))
                        .padding(.horizontal, 40)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 50)
                .background(Color.white)
                .cornerRadius(35)
                .shadow(color: .black.opacity(0.04), radius: 20, x: 0, y: 10)
                .padding(.horizontal, 24)
                
                Spacer()
                
                // Action Area
                VStack(spacing: 24) {
                    PrimaryButton(
                        title: "Begin Assessment",
                        action: { navigateToTest = true },
                        backgroundColor: Color(red: 0.4, green: 0.45, blue: 0.95) // Light Purple button
                    )
                    
                    HStack(spacing: 6) {
                        Image(systemName: "clock.fill")
                            .font(.system(size: 12))
                        Text("Estimated time: 10 mins")
                            .font(.system(size: 13, weight: .medium))
                    }
                    .foregroundColor(.gray.opacity(0.7))
                }
                .padding(.horizontal, 30)
                .padding(.bottom, 50)
            }
        }
        .navigationDestination(isPresented: $navigateToTest) {
            DynamicQuizView(type: type)
        }
        .navigationBarHidden(true)
    }
}

#Preview {
    NavigationStack {
        StartQuizView()
    }
}

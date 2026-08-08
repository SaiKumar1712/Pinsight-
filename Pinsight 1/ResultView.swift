import SwiftUI

struct ResultView: View {
    @Environment(\.dismiss) var dismiss
    var score: Int = 0
    var total: Int = 0
    var type: String = "pretest" // "pretest" or "posttest"
    
    @State private var navigateToVideos = false
    @State private var navigateToHome = false
    
    // Premium Colors
    private let mintGreen = Color(red: 0.35, green: 0.8, blue: 0.65)
    private let lightPurple = Color(red: 0.4, green: 0.45, blue: 0.95)
    private let darkNavy = Color(red: 0.1, green: 0.12, blue: 0.25)
    private let softMint = Color(red: 0.92, green: 0.98, blue: 0.97)

    var percentage: Int {
        total > 0 ? (score * 100) / total : 0
    }
    
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
                CustomBackButton()
                
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 30) {
                        // Header
                        VStack(spacing: 8) {
                            Text(type == "pretest" ? "Pre-Test Results" : "Post-Test Results")
                                .font(.system(size: 32, weight: .black))
                                .foregroundColor(darkNavy)
                            
                            Text("Assessment completed successfully")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(darkNavy.opacity(0.4))
                        }
                        .padding(.top, 20)
                        
                        // Result Hero Card
                        VStack(spacing: 25) {
                            ZStack {
                                Circle()
                                    .stroke(Color.white.opacity(0.15), lineWidth: 18)
                                    .frame(width: 200, height: 200)
                                
                                Circle()
                                    .trim(from: 0, to: CGFloat(percentage) / 100.0)
                                    .stroke(
                                        LinearGradient(colors: [.white, .white.opacity(0.7)], startPoint: .top, endPoint: .bottom),
                                        style: StrokeStyle(lineWidth: 18, lineCap: .round)
                                    )
                                    .frame(width: 200, height: 200)
                                    .rotationEffect(.degrees(-90))
                                
                                VStack(spacing: 2) {
                                    Text("\(percentage)%")
                                        .font(.system(size: 56, weight: .black))
                                        .foregroundColor(.white)
                                    Text("ACCURACY")
                                        .font(.system(size: 12, weight: .black))
                                        .foregroundColor(.white.opacity(0.7))
                                        .tracking(2)
                                }
                            }
                            .padding(.top, 10)
                            .shadow(color: .black.opacity(0.1), radius: 20)
                            
                            VStack(spacing: 8) {
                                Text("\(score) / \(total) Correct")
                                    .font(.system(size: 24, weight: .black))
                                    .foregroundColor(.white)
                                
                                Text(percentage >= 70 ? "Excellent Work!" : "Keep Learning!")
                                    .font(.system(size: 16, weight: .bold))
                                    .foregroundColor(.white.opacity(0.9))
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 50)
                        .background(lightPurple)
                        .cornerRadius(35)
                        .shadow(color: lightPurple.opacity(0.25), radius: 25, x: 0, y: 15)
                        .padding(.horizontal, 24)
                        
                        // Action Buttons
                        VStack(spacing: 16) {
                            if type == "pretest" {
                                PrimaryButton(title: "Unlock Lessons", action: {
                                    navigateToVideos = true
                                }, backgroundColor: mintGreen)
                            } else {
                                PrimaryButton(title: "Finish & Exit", action: {
                                    navigateToHome = true
                                }, backgroundColor: mintGreen)
                            }
                            
                            Button(action: { dismiss() }) {
                                Text("Review Answers")
                                    .font(.system(size: 17, weight: .bold))
                                    .foregroundColor(darkNavy)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 18)
                                    .background(Color.white)
                                    .cornerRadius(25)
                                    .shadow(color: .black.opacity(0.04), radius: 10, y: 5)
                            }
                        }
                        .padding(.horizontal, 24)
                        
                        Spacer(minLength: 50)
                    }
                }
            }
        }
        .navigationDestination(isPresented: $navigateToVideos) {
            VideoLessonsView()
        }
        .navigationDestination(isPresented: $navigateToHome) {
            UserDashboardView()
        }
        .navigationBarHidden(true)
    }
}

//////////////////////////////////////////////////////////////
// Result Card
//////////////////////////////////////////////////////////////

struct ResultCard: View {
    
    var title: String
    var subtitle: String? = nil
    var score: String
    var percentage: String
    var highlight: Bool = false
    
    var body: some View {
        
        VStack(alignment: .leading, spacing: 12) {
            
            Text(title)
                .font(.headline)
            
            if let subtitle = subtitle {
                Text(subtitle)
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }
            
            HStack {
                VStack(alignment: .leading) {
                    Text("Score")
                        .foregroundColor(.gray)
                    Text(score)
                        .font(.title3)
                        .fontWeight(.bold)
                        .foregroundColor(highlight ? .green : .black)
                }
                
                Spacer()
                
                VStack(alignment: .leading) {
                    Text("Percentage")
                        .foregroundColor(.gray)
                    Text(percentage)
                        .font(.title3)
                        .fontWeight(.bold)
                        .foregroundColor(highlight ? .green : .black)
                }
                
                Spacer()
                
                Button {
                    
                } label: {
                    Text("View Details")
                        .foregroundColor(.white)
                        .padding(.horizontal,20)
                        .padding(.vertical,10)
                        .background(Color.black)
                        .cornerRadius(20)
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.08), radius: 6)
        .padding(.horizontal)
    }
}

#Preview {
    ResultView(score: 7, total: 10, type: "pretest")
}

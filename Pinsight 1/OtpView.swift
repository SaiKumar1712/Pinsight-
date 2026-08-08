import SwiftUI

struct OTPVerificationView: View {
    let isAdmin: Bool
    let email: String
    @StateObject private var viewModel = AuthViewModel()
    @Environment(\.dismiss) var dismiss
    @State private var timeRemaining = 120
    @State private var timer: Timer? = nil
    @State private var otp: [String] = Array(repeating: "", count: 4)
    @FocusState private var activeField: Int?
    @State private var navigateToReset = false
    
    // Premium colors
    private let mintGreen = Color(red: 0.35, green: 0.8, blue: 0.65)
    private let lightPurple = Color(red: 0.4, green: 0.45, blue: 0.95)
    private let darkNavy = Color(red: 0.1, green: 0.12, blue: 0.25)
    
    func startTimer() {
        timer?.invalidate()
        timeRemaining = 120
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            if timeRemaining > 0 { timeRemaining -= 1 } else { timer?.invalidate() }
        }
    }
    
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
                
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 40) {
                        // Header Area
                        VStack(spacing: 15) {
                            Text("Account Verification")
                                .font(.system(size: 36, weight: .black))
                                .foregroundColor(darkNavy)
                            
                            Text("Please enter the 4-digit code sent to\n\(email)")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(Color.black.opacity(0.4))
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, 40)
                        }
                        .padding(.top, 20)
                        
                        // Form Card
                        VStack(spacing: 30) {
                            if let error = viewModel.errorMessage {
                                Text(error)
                                    .font(.system(size: 13, weight: .medium))
                                    .foregroundColor(.red)
                                    .padding()
                                    .frame(maxWidth: .infinity)
                                    .background(Color.red.opacity(0.05))
                                    .cornerRadius(15)
                            }
                            
                            HStack(spacing: 15) {
                                ForEach(0..<4, id: \.self) { index in
                                    TextField("", text: $otp[index])
                                        .keyboardType(.numberPad)
                                        .multilineTextAlignment(.center)
                                        .frame(width: 65, height: 65)
                                        .background(Color(red: 0.95, green: 0.96, blue: 0.97))
                                        .cornerRadius(18)
                                        .font(.system(size: 26, weight: .bold))
                                        .foregroundColor(darkNavy)
                                        .focused($activeField, equals: index)
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 18)
                                                .stroke(activeField == index ? mintGreen : Color.clear, lineWidth: 2)
                                        )
                                        .onChange(of: otp[index]) { oldValue, newValue in
                                            if newValue.count > 1 { otp[index] = String(newValue.last!) }
                                            if !newValue.isEmpty {
                                                if index < 3 { activeField = index + 1 }
                                            } else {
                                                if index > 0 { activeField = index - 1 }
                                            }
                                        }
                                }
                            }
                            
                            VStack(spacing: 10) {
                                Text(String(format: "%02d:%02d", timeRemaining / 60, timeRemaining % 60))
                                    .font(.system(size: 15, weight: .bold))
                                    .foregroundColor(.gray.opacity(0.8))
                                
                                HStack(spacing: 6) {
                                    Text("Didn't receive the code?")
                                        .foregroundColor(.gray)
                                    Button("Resend") {
                                        viewModel.forgotPassword(email: email)
                                        startTimer()
                                    }
                                    .foregroundColor(mintGreen)
                                    .fontWeight(.bold)
                                }
                                .font(.system(size: 14))
                                .disabled(timeRemaining > 0)
                                .opacity(timeRemaining > 0 ? 0.4 : 1.0)
                            }
                            
                            PrimaryButton(
                                title: "Verify Account",
                                action: {
                                    let fullOtp = otp.joined()
                                    viewModel.verifyOTP(email: email, otp: fullOtp)
                                },
                                isEnabled: !viewModel.isLoading && otp.joined().count == 4,
                                backgroundColor: lightPurple
                            )
                        }
                        .padding(32)
                        .background(Color.white)
                        .cornerRadius(35)
                        .shadow(color: .black.opacity(0.04), radius: 25, x: 0, y: 10)
                        .padding(.horizontal, 24)
                        
                        Spacer(minLength: 50)
                    }
                }
            }
            
            if viewModel.isLoading {
                Color.black.opacity(0.2).ignoresSafeArea()
                ProgressView()
                    .padding(30)
                    .background(Color.white)
                    .cornerRadius(20)
                    .shadow(radius: 10)
            }
        }
        .onChange(of: viewModel.otpVerified) { oldValue, newValue in
            if newValue { navigateToReset = true }
        }
        .navigationDestination(isPresented: $navigateToReset) {
            ResetPasswordView(email: email, isAdmin: isAdmin)
        }
        .navigationBarHidden(true)
        .onAppear { 
            startTimer()
            activeField = 0
        }
    }
}

///////////////////////////////////////////////////////////////
/// PREVIEW
///////////////////////////////////////////////////////////////

#Preview {
    NavigationStack {
        OTPVerificationView(isAdmin: true, email: "test@example.com")
    }
}

import SwiftUI

struct ForgotPasswordView: View {
    let isAdmin: Bool
    @StateObject private var viewModel = AuthViewModel()
    @Environment(\.dismiss) var dismiss
    @State private var email = ""
    @State private var navigateToOtp = false

    // Premium colors
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
                CustomBackButton()
                
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 40) {
                        // Header Area
                        VStack(spacing: 15) {
                            Image(systemName: "lock.shield.fill")
                                .font(.system(size: 70))
                                .foregroundColor(lightPurple)
                                .padding(.bottom, 10)
                                .shadow(color: lightPurple.opacity(0.1), radius: 10, y: 5)
                            
                            Text("Forgot Password?")
                                .font(.system(size: 36, weight: .black))
                                .foregroundColor(darkNavy)
                            
                            Text("Enter your email address to receive a recovery code.")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(Color.black.opacity(0.4))
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, 40)
                        }
                        .padding(.top, 20)
                        
                        // Form Card
                        VStack(spacing: 25) {
                            if let error = viewModel.errorMessage {
                                Text(error)
                                    .font(.system(size: 13, weight: .medium))
                                    .foregroundColor(.red)
                                    .padding()
                                    .frame(maxWidth: .infinity)
                                    .background(Color.red.opacity(0.05))
                                    .cornerRadius(15)
                            }
                            
                            CustomTextField(placeholder: "Email Address", text: $email, keyboardType: .emailAddress, autoCapitalization: .never)
                            
                            PrimaryButton(
                                title: "Send Reset Link",
                                action: {
                                    viewModel.forgotPassword(email: email)
                                },
                                isEnabled: !viewModel.isLoading && !email.isEmpty,
                                backgroundColor: lightPurple
                            )
                            
                            Button {
                                dismiss()
                            } label: {
                                Text("Back to Sign In")
                                    .font(.system(size: 15, weight: .bold))
                                    .foregroundColor(mintGreen)
                            }
                        }
                        .padding(30)
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
        .onChange(of: viewModel.otpSent) { oldValue, newValue in
            if newValue { navigateToOtp = true }
        }
        .navigationDestination(isPresented: $navigateToOtp) {
            OTPVerificationView(isAdmin: isAdmin, email: email)
        }
        .navigationBarHidden(true)
    }
}

///////////////////////////////////////////////////////////////
/// Preview
///////////////////////////////////////////////////////////////

#Preview {
    NavigationStack {
        ForgotPasswordView(isAdmin: true)
    }
}

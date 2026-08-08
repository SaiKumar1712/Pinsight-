import SwiftUI

// MARK: - SCREEN 3 (SIGN UP)
struct CreateAccountView: View {
    @StateObject private var viewModel = AuthViewModel()
    @State private var name = ""
    @State private var password = ""
    @State private var email = ""
    @State private var mobile = ""
    @State private var adminCode = ""
    @State private var navigateToLogin = false
    @Environment(\.dismiss) var dismiss

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
                    VStack(spacing: 35) {
                        // Header Area
                        VStack(spacing: 10) {
                            Text("Create Account")
                                .font(.system(size: 36, weight: .black))
                                .foregroundColor(darkNavy)
                            
                            Text("Join us to start your journey")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(Color.black.opacity(0.4))
                        }
                        .padding(.top, 20)
                        
                        // Form Area
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
                            
                            VStack(spacing: 20) {
                                CustomTextField(placeholder: "Full Name", text: $name)
                                CustomSecureField(placeholder: "Create Password", text: $password)
                                CustomTextField(placeholder: "Email Address", text: $email, keyboardType: .emailAddress, autoCapitalization: .never)
                                CustomTextField(placeholder: "Mobile Number", text: $mobile, keyboardType: .phonePad)
                                CustomSecureField(placeholder: "Clinic Code (Optional)", text: $adminCode)
                            }
                            
                            PrimaryButton(
                                title: "Sign Up",
                                action: {
                                    viewModel.signup(name: name, email: email, password: password, mobile: mobile, adminCode: adminCode)
                                },
                                isEnabled: !viewModel.isLoading,
                                backgroundColor: lightPurple
                            )
                            
                            Button {
                                dismiss()
                            } label: {
                                HStack(spacing: 6) {
                                    Text("Already have an account?")
                                        .foregroundColor(.gray)
                                    Text("Sign In")
                                        .fontWeight(.bold)
                                        .foregroundColor(mintGreen)
                                }
                                .font(.system(size: 15))
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
        .onChange(of: viewModel.signupSuccess) { oldValue, newValue in
            if newValue { navigateToLogin = true }
        }
        .navigationDestination(isPresented: $navigateToLogin) {
            SigninView()
        }
        .navigationBarHidden(true)
    }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        CreateAccountView()
    }
}

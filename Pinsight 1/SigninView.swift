import SwiftUI

// MARK: - LOGIN VIEW
struct SigninView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = AuthViewModel()
    @State private var navigateToforgotpassword = false
    @State private var navigateToAdmin = false
    @State private var navigateToUser = false
    
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
                CustomBackButton()
                
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 25) {
                        // Logo/Header Area
                        VStack(spacing: 20) {
                            ZStack {
                                Circle()
                                    .fill(lightPurple)
                                    .frame(width: 100, height: 100)
                                    .shadow(color: lightPurple.opacity(0.15), radius: 20, y: 10)
                                
                                Image(systemName: "person.fill.viewfinder")
                                    .font(.system(size: 45))
                                    .foregroundColor(.white)
                            }
                            
                            VStack(spacing: 8) {
                                Text("Welcome Back")
                                    .font(.system(size: 36, weight: .black))
                                    .foregroundColor(darkNavy)
                                
                                Text("Sign in to continue your progress")
                                    .font(.system(size: 16, weight: .medium))
                                    .foregroundColor(darkNavy.opacity(0.4))
                                    .multilineTextAlignment(.center)
                            }
                        }
                        .padding(.top, 30)
                        
                        // Form Area
                        VStack(spacing: 28) {
                            if let error = viewModel.errorMessage {
                                HStack(spacing: 8) {
                                    Image(systemName: "exclamationmark.circle.fill")
                                    Text(error)
                                }
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(.red.opacity(0.8))
                                .padding(.vertical, 14)
                                .frame(maxWidth: .infinity)
                                .background(Color.red.opacity(0.05))
                                .cornerRadius(15)
                                .padding(.horizontal, 4)
                            }
                            
                            VStack(alignment: .leading, spacing: 18) {
                                CustomTextField(placeholder: "Email Address", text: $viewModel.email, keyboardType: .emailAddress, autoCapitalization: .never)
                                
                                VStack(alignment: .trailing, spacing: 12) {
                                    CustomSecureField(placeholder: "Password", text: $viewModel.password)
                                    
                                    Button("Forgot Password?") {
                                        navigateToforgotpassword = true
                                    }
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundColor(lightPurple)
                                }
                            }
                            
                            PrimaryButton(title: "Sign In", action: {
                                viewModel.login(email: viewModel.email, password: viewModel.password)
                            }, isEnabled: !viewModel.isLoading, backgroundColor: lightPurple)
                            
                            HStack(spacing: 6) {
                                Text("Don't have an account?")
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundColor(darkNavy.opacity(0.3))
                                
                                NavigationLink(destination: CreateAccountView()) {
                                    Text("Sign Up")
                                        .font(.system(size: 14, weight: .bold))
                                        .foregroundColor(mintGreen)
                                }
                            }
                        }
                        .padding(28)
                        .background(Color.white)
                        .cornerRadius(35)
                        .shadow(color: .black.opacity(0.03), radius: 20, x: 0, y: 10)
                        .padding(.horizontal, 24)
                        
                        Spacer(minLength: 50)
                    }
                }
            }
            
            if viewModel.isLoading {
                Color.black.opacity(0.15).ignoresSafeArea()
                ZStack {
                    RoundedRectangle(cornerRadius: 25)
                        .fill(Color.white)
                        .frame(width: 100, height: 100)
         
                        .shadow(color: .black.opacity(0.05), radius: 15)
                    ProgressView()
                        .scaleEffect(1.2)
                }
            }
        }
        
        .navigationDestination(isPresented: $navigateToforgotpassword) {
            ForgotPasswordView(isAdmin: false)
        }
        .navigationDestination(isPresented: $navigateToAdmin) {
            AdminDashboardView()
        }
        .navigationDestination(isPresented: $navigateToUser) {
            UserDashboardView()
        }
        .onChange(of: viewModel.loginSuccess) { _, success in
            guard success else { return }
            if viewModel.currentUser?.user_type == "admin" {
                navigateToAdmin = true
            } else {
                navigateToUser = true
            }
        }
        .navigationBarHidden(true)
        .onTapGesture {
            UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
        }
    }
}


///////////////////////////////////////////////////////////////
// MARK: - Preview
///////////////////////////////////////////////////////////////

#Preview {
    NavigationStack {
        SigninView()
    }
}

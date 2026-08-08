import SwiftUI

struct ContentView: View {
    @StateObject private var session = AppSession()

    var body: some View {
        NavigationStack {
            // Show splash only on the very first launch.
            // After logout (or on any re-open) go straight to LandingView.
            if session.hasSeenSplash {
                if session.showLoginScreen {
                    SigninView()
                } else {
                    LandingView()
                }
            } else {
                SplashView()
            }
        }
        .id(session.navigationId)
        .environmentObject(session)
    }
}


#Preview {
    ContentView()
}

// MARK: - SHARED UI COMPONENTS

struct AppColors {
    static let primary = Color(red: 0.4, green: 0.45, blue: 0.95) // lightPurple
    static let secondary = Color(red: 0.35, green: 0.8, blue: 0.65) // mintGreen
    static let accent = Color(red: 0.95, green: 0.45, blue: 0.55) // softPink
    static let darkNavy = Color(red: 0.1, green: 0.12, blue: 0.25)
    static let softMint = Color(red: 0.92, green: 0.98, blue: 0.97)
    static let mainGradient = LinearGradient(
        colors: [Color(red: 0.96, green: 0.97, blue: 0.99), softMint],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}

struct BackgroundBlobs: View {
    let topHeight: CGFloat
    let bottomHeight: CGFloat
    
    var body: some View {
        ZStack {
            Circle()
                .fill(LinearGradient(colors: [AppColors.primary.opacity(0.15), Color.white.opacity(0)], startPoint: .topLeading, endPoint: .bottomTrailing))
                .frame(width: topHeight, height: topHeight)
                .offset(x: 120, y: -topHeight/2.5)
                .blur(radius: 60)
            
            Circle()
                .fill(LinearGradient(colors: [AppColors.secondary.opacity(0.12), Color.white.opacity(0)], startPoint: .bottomTrailing, endPoint: .topLeading))
                .frame(width: bottomHeight, height: bottomHeight)
                .offset(x: -120, y: UIScreen.main.bounds.height/2 - bottomHeight/2.5)
                .blur(radius: 70)
        }
    }
}

struct CustomBackButton: View {
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        HStack {
            Button(action: {
                dismiss()
            }) {
                ZStack {
                    Circle()
                        .fill(Color.white)
                        .frame(width: 44, height: 44)
                        .shadow(color: .black.opacity(0.06), radius: 8, x: 0, y: 4)
                    Image(systemName: "chevron.left")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(AppColors.darkNavy)
                }
            }
            Spacer()
        }
        .padding(.horizontal, 24)
        .padding(.top, 10)
    }
}

struct CustomTextField: View {
    var placeholder: String
    @Binding var text: String
    var keyboardType: UIKeyboardType = .default
    var autoCapitalization: TextInputAutocapitalization = .sentences
    
    var body: some View {
        TextField(placeholder, text: $text)
            .font(.system(size: 16, weight: .medium))
            .keyboardType(keyboardType)
            .textInputAutocapitalization(autoCapitalization)
            .padding(.horizontal, 18)
            .padding(.vertical, 16)
            .background(Color.white)
            .cornerRadius(18)
            .shadow(color: .black.opacity(0.03), radius: 10, y: 5)
    }
}

struct CustomSecureField: View {
    var placeholder: String
    @Binding var text: String
    @State private var isVisible = false
    
    var body: some View {
        HStack {
            if isVisible {
                TextField(placeholder, text: $text)
            } else {
                SecureField(placeholder, text: $text)
            }
            
            Button(action: {
                isVisible.toggle()
            }) {
                Image(systemName: isVisible ? "eye.slash.fill" : "eye.fill")
                    .foregroundColor(AppColors.darkNavy.opacity(0.3))
            }
        }
        .font(.system(size: 16, weight: .medium))
        .padding(.horizontal, 18)
        .padding(.vertical, 16)
        .background(Color.white)
        .cornerRadius(18)
        .shadow(color: .black.opacity(0.03), radius: 10, y: 5)
    }
}

struct PrimaryButton: View {
    var title: String
    var action: () -> Void
    var isEnabled: Bool = true
    var backgroundColor: Color? = nil
    
    var body: some View {
        Button(action: {
            #if os(iOS)
            UIImpactFeedbackGenerator(style: .medium).impactOccurred()
            #endif
            action()
        }) {
            Text(title)
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 18)
                .background(isEnabled ? (backgroundColor ?? AppColors.primary) : Color.gray.opacity(0.3))
                .cornerRadius(25)
                .shadow(color: isEnabled ? (backgroundColor ?? AppColors.primary).opacity(0.2) : .clear, radius: 15, y: 8)
        }
        .disabled(!isEnabled)
    }
}

extension View {
    func glassCard() -> some View {
        self
            .background(Color.white)
            .cornerRadius(35)
            .shadow(color: .black.opacity(0.03), radius: 15, x: 0, y: 10)
    }
}

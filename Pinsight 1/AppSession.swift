import SwiftUI

/// Shared app session – injected as an EnvironmentObject from the root.
/// Setting `isLoggedIn = false` (via `logout()`) from any view forces the
/// NavigationStack back to LandingView without needing to pop individual screens.
final class AppSession: ObservableObject {
    /// True once the splash animation has completed (persisted across logout).
    @Published var hasSeenSplash: Bool = false
    /// True while a user is logged in.
    @Published var isLoggedIn: Bool = false
    
    /// Used to force the NavigationStack to reset completely.
    @Published var navigationId = UUID()
    /// Controls whether the root view skips the landing page and shows the login screen.
    @Published var showLoginScreen: Bool = false

    /// Call this to sign the user out and return to LandingView.
    func logout() {
        UserDefaults.standard.set(0, forKey: "user_id")
        UserDefaults.standard.set("", forKey: "user_type")
        isLoggedIn = false
        showLoginScreen = true
        navigationId = UUID()
    }
}

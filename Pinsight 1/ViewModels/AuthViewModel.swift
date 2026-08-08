import Foundation

class AuthViewModel: ObservableObject {
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var currentUser: User?
    @Published var email = ""
    @Published var password = ""
    @Published var loginSuccess = false
    @Published var signupSuccess = false
    @Published var otpSent = false
    @Published var otpVerified = false
    @Published var resetSuccess = false

    func login(email: String, password: String) {
        isLoading = true
        errorMessage = nil
        
        let parameters = ["email": email, "password": password, "action": "login"]
        
        NetworkManager.shared.postRequest(endpoint: "/auth/login.php", parameters: parameters) { (result: Result<BaseResponse<User>, Error>) in
            DispatchQueue.main.async {
                self.isLoading = false
                switch result {
                case .success(let response):
                    if response.success, let user = response.data {
                        self.currentUser = user
                        self.loginSuccess = true
                        // Store user ID in UserDefaults for easy access elsewhere
                        UserDefaults.standard.set(user.user_id, forKey: "user_id")
                        UserDefaults.standard.set(user.user_type, forKey: "user_type")
                        UserDefaults.standard.set(user.email, forKey: "user_email")
                        UserDefaults.standard.set(user.name, forKey: "user_name")
                    } else {
                        self.errorMessage = response.message
                    }
                case .failure(let error):
                    self.errorMessage = error.localizedDescription
                }
            }
        }
    }
    
    func signup(name: String, email: String, password: String, mobile: String, adminCode: String = "") {
        isLoading = true
        errorMessage = nil
        
        if name.trimmingCharacters(in: .whitespaces).isEmpty || email.trimmingCharacters(in: .whitespaces).isEmpty || password.isEmpty || mobile.trimmingCharacters(in: .whitespaces).isEmpty {
            self.errorMessage = "Please fill in all required fields."
            self.isLoading = false
            return
        }
        
        let emailRegex = "^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+@(gmail|outlook)\\.com$"
        if !NSPredicate(format:"SELF MATCHES %@", emailRegex).evaluate(with: email) {
            self.errorMessage = "Email must contain letters & numbers, and end with @gmail.com or @outlook.com."
            self.isLoading = false
            return
        }
        
        let mobileRegex = "^[6-9][0-9]{9}$"
        if !NSPredicate(format:"SELF MATCHES %@", mobileRegex).evaluate(with: mobile) {
            self.errorMessage = "Mobile number must be exactly 10 digits and start with 6, 7, 8, or 9."
            self.isLoading = false
            return
        }
        
        let parameters = [
            "name": name,
            "email": email,
            "password": password,
            "mobile": mobile,
            "admin_code": adminCode
        ]
        
        NetworkManager.shared.postRequest(endpoint: "/auth/signup.php", parameters: parameters) { (result: Result<BaseResponse<User>, Error>) in
            self.isLoading = false
            switch result {
            case .success(let response):
                if response.success {
                    self.signupSuccess = true
                } else {
                    self.errorMessage = response.message
                }
            case .failure(let error):
                self.errorMessage = error.localizedDescription
            }
        }
    }
    
    func forgotPassword(email: String) {
        isLoading = true
        errorMessage = nil
        let parameters = ["email": email]
        NetworkManager.shared.postRequest(endpoint: "/auth/forgot_password.php", parameters: parameters) { (result: Result<BaseResponse<EmptyResponse>, Error>) in
            self.isLoading = false
            switch result {
            case .success(let response):
                if response.success {
                    self.otpSent = true
                } else {
                    self.errorMessage = response.message
                }
            case .failure(let error):
                self.errorMessage = error.localizedDescription
            }
        }
    }
    
    func verifyOTP(email: String, otp: String) {
        isLoading = true
        errorMessage = nil
        let parameters = ["email": email, "otp": otp]
        NetworkManager.shared.postRequest(endpoint: "/auth/verify_otp.php", parameters: parameters) { (result: Result<BaseResponse<EmptyResponse>, Error>) in
            self.isLoading = false
            switch result {
            case .success(let response):
                if response.success {
                    self.otpVerified = true
                } else {
                    self.errorMessage = response.message
                }
            case .failure(let error):
                self.errorMessage = error.localizedDescription
            }
        }
    }
    
    func resetPassword(email: String, newPass: String) {
        isLoading = true
        errorMessage = nil
        let parameters = ["email": email, "password": newPass]
        NetworkManager.shared.postRequest(endpoint: "/auth/reset_password.php", parameters: parameters) { (result: Result<BaseResponse<EmptyResponse>, Error>) in
            self.isLoading = false
            switch result {
            case .success(let response):
                if response.success {
                    self.resetSuccess = true
                } else {
                    self.errorMessage = response.message
                }
            case .failure(let error):
                self.errorMessage = error.localizedDescription
            }
        }
    }
}

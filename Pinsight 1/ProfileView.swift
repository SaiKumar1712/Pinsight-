import SwiftUI
import PhotosUI

struct ProfileView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var session: AppSession
    
    @State private var userName: String = ""
    @State private var userEmail: String = ""
    @State private var userId: Int = 0
    
    @State private var selectedItem: PhotosPickerItem? = nil
    @State private var profileImage: UIImage? = nil
    @State private var showDeleteAlert = false
    
    // Premium Colors
    private let mintGreen = Color(red: 0.35, green: 0.8, blue: 0.65)
    private let lightMint = Color(red: 0.9, green: 0.98, blue: 0.96)
    private let darkNavy  = Color(red: 0.1, green: 0.12, blue: 0.25)
    private let softRed   = Color(red: 0.95, green: 0.35, blue: 0.35)
    
    var body: some View {
        NavigationStack {
            ZStack {
                // Background
                LinearGradient(
                    colors: [
                        Color(red: 0.96, green: 0.97, blue: 0.99),
                        Color(red: 0.92, green: 0.98, blue: 0.97)
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 32) {
                        
                        // ── Profile Photo Section ──
                        VStack(spacing: 16) {
                            ZStack {
                                Circle()
                                    .fill(Color.white)
                                    .frame(width: 140, height: 140)
                                    .shadow(color: .black.opacity(0.08), radius: 15, x: 0, y: 10)
                                
                                if let image = profileImage {
                                    Image(uiImage: image)
                                        .resizable()
                                        .scaledToFill()
                                        .frame(width: 130, height: 130)
                                        .clipShape(Circle())
                                } else {
                                    ZStack {
                                        Circle()
                                            .fill(lightMint)
                                            .frame(width: 130, height: 130)
                                        
                                        Image(systemName: "person.fill")
                                            .font(.system(size: 60))
                                            .foregroundColor(mintGreen)
                                    }
                                }
                                
                                // Edit Overlay
                                PhotosPicker(selection: $selectedItem, matching: .images) {
                                    ZStack {
                                        Circle()
                                            .fill(mintGreen)
                                            .frame(width: 38, height: 38)
                                            .shadow(color: mintGreen.opacity(0.3), radius: 5, x: 0, y: 3)
                                        
                                        Image(systemName: "camera.fill")
                                            .font(.system(size: 16, weight: .bold))
                                            .foregroundColor(.white)
                                    }
                                }
                                .offset(x: 45, y: 45)
                            }
                            
                            if profileImage != nil {
                                Button(action: { showDeleteAlert = true }) {
                                    Text("Remove Photo")
                                        .font(.system(size: 14, weight: .bold))
                                        .foregroundColor(softRed)
                                }
                                .padding(.top, 4)
                            }
                        }
                        .padding(.top, 40)
                        
                        // ── User Details Section ──
                        VStack(spacing: 20) {
                            DetailRow(icon: "person.text.rectangle", title: "Full Name", value: userName)
                            DetailRow(icon: "envelope.fill", title: "Email Address", value: userEmail)
                            DetailRow(icon: "number", title: "User ID", value: "#\(userId)")
                        }
                        .padding(24)
                        .background(Color.white)
                        .cornerRadius(30)
                        .shadow(color: .black.opacity(0.03), radius: 15, x: 0, y: 8)
                        .padding(.horizontal, 24)
                        
                        // ── Actions Section ──
                        VStack(spacing: 16) {
                            Button(action: {
                                session.logout()
                                dismiss()
                            }) {
                                HStack {
                                    Image(systemName: "rectangle.portrait.and.arrow.right")
                                    Text("Sign Out")
                                }
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .frame(height: 56)
                                .background(softRed)
                                .cornerRadius(20)
                                .shadow(color: softRed.opacity(0.2), radius: 10, y: 5)
                            }
                        }
                        .padding(.horizontal, 24)
                        .padding(.top, 10)
                        
                        Spacer(minLength: 40)
                    }
                }
            }
            .navigationTitle("Profile Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(mintGreen)
                }
            }
            .onAppear(perform: loadUserData)
            .onChange(of: selectedItem) { _, newItem in
                if let newItem = newItem {
                    Task {
                        if let data = try? await newItem.loadTransferable(type: Data.self),
                           let image = UIImage(data: data) {
                            saveProfileImage(image)
                            profileImage = image
                        }
                    }
                }
            }
            .alert("Remove Photo", isPresented: $showDeleteAlert) {
                Button("Cancel", role: .cancel) { }
                Button("Remove", role: .destructive) {
                    deleteProfileImage()
                    profileImage = nil
                }
            } message: {
                Text("Are you sure you want to remove your profile photo?")
            }
        }
    }
    
    private func loadUserData() {
        userName = UserDefaults.standard.string(forKey: "user_name") ?? "Not Available"
        userEmail = UserDefaults.standard.string(forKey: "user_email") ?? "Not Available"
        userId = UserDefaults.standard.integer(forKey: "user_id")
        profileImage = getProfileImage()
    }
    
    private func saveProfileImage(_ image: UIImage) {
        guard let data = image.jpegData(compressionQuality: 0.7) else { return }
        let fileName = "profile_\(userId).jpg"
        let path = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0].appendingPathComponent(fileName)
        try? data.write(to: path)
    }
    
    private func deleteProfileImage() {
        let fileName = "profile_\(userId).jpg"
        let path = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0].appendingPathComponent(fileName)
        try? FileManager.default.removeItem(at: path)
    }
    
    private func getProfileImage() -> UIImage? {
        let fileName = "profile_\(userId).jpg"
        let path = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0].appendingPathComponent(fileName)
        if let data = try? Data(contentsOf: path) {
            return UIImage(data: data)
        }
        return nil
    }
}

struct DetailRow: View {
    let icon: String
    let title: String
    let value: String
    
    private let mintGreen = Color(red: 0.35, green: 0.8, blue: 0.65)
    private let darkNavy  = Color(red: 0.1, green: 0.12, blue: 0.25)
    
    var body: some View {
        HStack(spacing: 16) {
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .fill(mintGreen.opacity(0.1))
                    .frame(width: 40, height: 40)
                Image(systemName: icon)
                    .foregroundColor(mintGreen)
                    .font(.system(size: 16, weight: .bold))
            }
            
            VStack(alignment: .leading, spacing: 3) {
                Text(title)
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(.gray.opacity(0.8))
                    .textCase(.uppercase)
                    .tracking(0.5)
                
                Text(value)
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(darkNavy)
            }
            Spacer()
        }
    }
}

#Preview {
    ProfileView()
        .environmentObject(AppSession())
}

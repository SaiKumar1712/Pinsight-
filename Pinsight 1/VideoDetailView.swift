import SwiftUI
import AVKit

struct VideoDetailView: View {
    let video: VideoLesson
    @StateObject private var viewModel = VideoViewModel()
    @Environment(\.dismiss) private var dismiss
    
    @State private var rating: Int = 0
    @State private var commentText: String = ""
    @State private var showMarkedComplete = false
    @State private var player: AVPlayer?
    @State private var hasMarkedComplete = false
    @State private var comments: [CommentData] = [
        CommentData(user: "Admin Team", text: "Welcome to the first module! Focus on the core principles."),
        CommentData(user: "Learning Expert", text: "Great start, the visual aids are very helpful.")
    ]
    
    struct CommentData: Identifiable {
        let id = UUID()
        let user: String
        let text: String
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
                // Video Player Area
                ZStack(alignment: .topLeading) {
                    if let url = URL(string: NetworkManager.shared.baseURL + video.video_url) {
                        VideoPlayer(player: player ?? AVPlayer())
                            .frame(height: 250)
                            .onAppear {
                                if player == nil {
                                    player = AVPlayer(url: url)
                                    NotificationCenter.default.addObserver(forName: .AVPlayerItemDidPlayToEndTime, object: player?.currentItem, queue: .main) { _ in
                                        markComplete()
                                    }
                                }
                                player?.play()
                            }
                            .onDisappear { player?.pause() }
                    } else {
                        Rectangle()
                            .fill(Color.black)
                            .frame(height: 250)
                            .overlay(Text("Invalid Video URL").foregroundColor(.white))
                    }
                    
                    Button { dismiss() } label: {
                        Image(systemName: "chevron.left")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.black)
                            .padding(10)
                            .background(Color.white.opacity(0.9))
                            .clipShape(Circle())
                    }
                    .padding(20)
                }
                
                ScrollView(showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 25) {
                        // Title Area
                        VStack(alignment: .leading, spacing: 14) {
                            HStack {
                                Text("Module \(video.id)")
                                    .font(.system(size: 13, weight: .bold))
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 6)
                                    .background(Color(red: 0.9, green: 0.98, blue: 0.96))
                                    .foregroundColor(Color(red: 0.35, green: 0.8, blue: 0.65)) // Mint Green
                                    .cornerRadius(8)
                                
                                Spacer()
                                
                                HStack(spacing: 4) {
                                    Image(systemName: "clock")
                                    Text(video.duration + " mins")
                                }
                                .font(.system(size: 13, weight: .medium))
                                .foregroundColor(.gray)
                            }
                            
                            Text(video.title)
                                .font(.system(size: 30, weight: .black))
                                .foregroundColor(Color(red: 0.1, green: 0.12, blue: 0.2))
                            
                            Text("Deep dive into the core concepts of this module.")
                                .font(.system(size: 15, weight: .medium))
                                .foregroundColor(.gray.opacity(0.8))
                        }
                        .padding(30)
                        .background(Color.white)
                        .cornerRadius(35, corners: [.bottomLeft, .bottomRight])
                        .shadow(color: .black.opacity(0.04), radius: 10, y: 5)
                        
                        // Interaction Section
                        VStack(spacing: 25) {
                            // Rating
                            VStack(alignment: .leading, spacing: 18) {
                                Text("What did you think?")
                                    .font(.system(size: 18, weight: .bold))
                                    .foregroundColor(Color(red: 0.1, green: 0.12, blue: 0.2))
                                
                                HStack(spacing: 15) {
                                    ForEach(1...5, id: \.self) { star in
                                        Image(systemName: star <= rating ? "star.fill" : "star")
                                            .font(.system(size: 28))
                                            .foregroundColor(star <= rating ? .yellow : .gray.opacity(0.2))
                                            .scaleEffect(star <= rating ? 1.1 : 1.0)
                                            .onTapGesture {
                                                withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) { rating = star }
                                            }
                                    }
                                }
                            }
                            .padding(25)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color.white)
                            .cornerRadius(30)
                            .shadow(color: .black.opacity(0.03), radius: 10, y: 5)
                            
                            // Actions
                            HStack(spacing: 15) {
                                PrimaryButton(
                                    title: "Complete",
                                    action: { markComplete() },
                                    backgroundColor: Color(red: 0.35, green: 0.8, blue: 0.65) // Mint Green
                                )
                                .opacity(hasMarkedComplete ? 0.6 : 1.0)
                                .disabled(hasMarkedComplete)
                                
                                Button { dismiss() } label: {
                                    ZStack {
                                        Circle()
                                            .fill(Color.white)
                                            .frame(width: 56, height: 56)
                                            .shadow(color: .black.opacity(0.05), radius: 10)
                                        
                                        Image(systemName: "checkmark.circle.fill")
                                            .font(.system(size: 24))
                                            .foregroundColor(Color(red: 0.35, green: 0.8, blue: 0.65))
                                    }
                                }
                            }
                        }
                        .padding(.horizontal, 24)
                        
                        // Comments
                        VStack(alignment: .leading, spacing: 20) {
                            Text("Student Community")
                                .font(.system(size: 18, weight: .bold))
                                .padding(.horizontal, 24)
                            
                            VStack(spacing: 15) {
                                HStack {
                                    TextField("Add a public comment...", text: $commentText)
                                        .font(.system(size: 15))
                                    
                                    Button {
                                        if !commentText.isEmpty {
                                            withAnimation(.spring()) {
                                                comments.insert(CommentData(user: "You", text: commentText), at: 0)
                                                commentText = ""
                                            }
                                        }
                                    } label: {
                                        Image(systemName: "paperplane.fill")
                                            .foregroundColor(commentText.isEmpty ? .gray : Color(red: 0.0, green: 0.48, blue: 1.0))
                                            .font(.system(size: 20))
                                    }
                                }
                                .padding(16)
                                .background(Color.white)
                                .cornerRadius(15)
                                .padding(.horizontal, 24)
                                .shadow(color: .black.opacity(0.02), radius: 5, y: 2)
                                
                                VStack(spacing: 12) {
                                    ForEach(comments) { comment in
                                        CommentRow(user: comment.user, text: comment.text)
                                    }
                                }
                                .padding(.horizontal, 24)
                            }
                        }
                        
                        Spacer(minLength: 100)
                    }
                }
            }
        }
        .overlay(
            Group {
                if showMarkedComplete {
                    VStack {
                        HStack(spacing: 10) {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(Color(red: 0.35, green: 0.8, blue: 0.65))
                            Text("Progress Updated!")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(.white)
                        }
                        .padding(.horizontal, 24)
                        .padding(.vertical, 14)
                        .background(Color.black.opacity(0.9))
                        .cornerRadius(25)
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                        .padding(.bottom, 50)
                        .shadow(color: .black.opacity(0.1), radius: 10, y: 5)
                    }
                    .frame(maxHeight: .infinity, alignment: .bottom)
                }
            }
        )
        .navigationBarHidden(true)
    }
    
    private func markComplete() {
        guard !hasMarkedComplete else { return }
        viewModel.markVideoAsCompleted(videoId: video.id)
        hasMarkedComplete = true
        withAnimation(.spring()) { showMarkedComplete = true }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            withAnimation { showMarkedComplete = false }
        }
    }
}

struct CommentRow: View {
    let user: String
    let text: String
    
    var body: some View {
        HStack(alignment: .top, spacing: 14) {
            Circle()
                .fill(Color(red: 0.5, green: 0.45, blue: 0.95)) // Purple Avatar
                .frame(width: 40, height: 40)
                .overlay(Text(String(user.prefix(1))).foregroundColor(.white).font(.system(size: 14, weight: .bold)))
            
            VStack(alignment: .leading, spacing: 4) {
                Text(user)
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(Color(red: 0.1, green: 0.12, blue: 0.2))
                
                Text(text)
                    .font(.system(size: 14, weight: .regular))
                    .foregroundColor(.gray.opacity(0.9))
                    .fixedSize(horizontal: false, vertical: true)
            }
            Spacer()
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(20)
        .shadow(color: .black.opacity(0.02), radius: 5, y: 2)
    }
}

extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners
    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(roundedRect: rect, byRoundingCorners: corners, cornerRadii: CGSize(width: radius, height: radius))
        return Path(path.cgPath)
    }
}

#Preview {
    VideoDetailView(video: VideoLesson(id: 1, title: "Introduction to Learning", video_url: "/uploads/videos/VIDEO.mp4", thumbnail_url: nil, duration: "10 mins", is_completed: false))
}

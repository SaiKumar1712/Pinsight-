import SwiftUI
import AVKit

struct VideoLessonsView: View {
    @Environment(\.dismiss) var dismiss
    @StateObject private var viewModel     = VideoViewModel()
    @StateObject private var summaryVM     = SummaryViewModel()  // for attempt-limit check
    @State private var navigateToPosttestq = false
    @State private var selectedVideo: VideoLesson? = nil
    @State private var showAlert    = false
    @State private var alertMessage = ""

    // Updated accent colors to match the premium theme
    private let mint = Color(red: 0.35, green: 0.8, blue: 0.65)
    private let lightPurple = Color(red: 0.4, green: 0.45, blue: 0.95)

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
            
            VStack(alignment: .leading, spacing: 0) {
                CustomBackButton()
                
                ScrollView(showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 25) {
                        // Header
                        VStack(alignment: .leading, spacing: 14) {
                            Text("Video Lessons")
                                .font(.system(size: 34, weight: .black))
                                .foregroundColor(Color(red: 0.1, green: 0.12, blue: 0.2))
                            
                            let completedCount = viewModel.videos.filter { $0.is_completed }.count
                            HStack(spacing: 12) {
                                ZStack(alignment: .leading) {
                                    Capsule()
                                        .fill(Color.gray.opacity(0.12))
                                        .frame(height: 6)
                                    
                                    Capsule()
                                        .fill(mint)
                                        .frame(width: CGFloat(completedCount) / CGFloat(max(1, viewModel.videos.count)) * 260, height: 6)
                                }
                                
                                Text("\(completedCount)/\(viewModel.videos.count)")
                                    .font(.system(size: 15, weight: .black))
                                    .foregroundColor(.gray.opacity(0.8))
                            }
                        }
                        .padding(.horizontal, 24)
                        .padding(.top, 24)

                        VStack(spacing: 18) {
                            if viewModel.isLoading {
                                ProgressView().padding()
                            }
                            
                            if let error = viewModel.errorMessage {
                                Text(error).foregroundColor(.red).font(.caption).padding()
                            }

                            ForEach(viewModel.videos) { video in
                                Button {
                                    selectedVideo = video
                                } label: {
                                    LessonCard(
                                        title: video.title,
                                        duration: video.duration,
                                        isCompleted: video.is_completed,
                                        thumbnailUrl: video.thumbnail_url,
                                        mint: mint
                                    )
                                }
                                .buttonStyle(PlainButtonStyle())
                            }
                        }
                        .padding(.horizontal, 24)
                        
                        Spacer(minLength: 50)
                    }
                }
            }
        }
        .onAppear {
            viewModel.fetchVideos()
            summaryVM.fetchSummary()   // load attempts count
        }
        .navigationBarHidden(true)
        .navigationDestination(isPresented: $navigateToPosttestq) {
            StartQuizView(type: "posttest")
        }
        .fullScreenCover(item: $selectedVideo) { video in
            VideoDetailView(video: video)
        }
        .alert("Notice", isPresented: $showAlert) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(alertMessage)
        }
    }
}

struct LessonCard: View {
    var title: String
    var duration: String
    var isCompleted: Bool
    var thumbnailUrl: String?
    let mint: Color
    
    var body: some View {
        HStack(spacing: 18) {
            ZStack(alignment: .center) {
                if let thumb = thumbnailUrl, let url = URL(string: NetworkManager.shared.baseURL + thumb) {
                    AsyncImage(url: url) { image in
                        image.resizable().scaledToFill()
                    } placeholder: {
                        Rectangle().fill(Color.gray.opacity(0.05))
                    }
                } else {
                    Rectangle().fill(Color(red: 0.95, green: 0.96, blue: 0.98))
                }
                
                ZStack {
                    Circle()
                        .fill(isCompleted ? mint : Color.white)
                        .frame(width: 32, height: 32)
                        .shadow(color: .black.opacity(0.1), radius: 5)
                    
                    Image(systemName: isCompleted ? "checkmark" : "play.fill")
                        .foregroundColor(isCompleted ? .white : Color(red: 0.1, green: 0.12, blue: 0.2))
                        .font(.system(size: 13, weight: .bold))
                }
            }
            .frame(width: 105, height: 80)
            .cornerRadius(18)
            .clipped()
            
            VStack(alignment: .leading, spacing: 6) {
                Text(title)
                    .font(.system(size: 17, weight: .bold))
                    .foregroundColor(Color(red: 0.1, green: 0.12, blue: 0.2))
                    .lineLimit(2)
                
                HStack(spacing: 12) {
                    HStack(spacing: 4) {
                        Image(systemName: "clock")
                        Text(duration + " mins")
                    }
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.gray)
                    
                    if isCompleted {
                        Text("COMPLETED")
                            .font(.system(size: 9, weight: .black))
                            .foregroundColor(mint)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(mint.opacity(0.1))
                            .cornerRadius(6)
                    }
                }
            }
            Spacer()
            
            Image(systemName: "chevron.right")
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(Color(red: 0.0, green: 0.48, blue: 1.0).opacity(0.25))
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(24)
        .shadow(color: .black.opacity(0.04), radius: 10, x: 0, y: 5)
        .overlay(
            RoundedRectangle(cornerRadius: 24)
                .stroke(isCompleted ? mint.opacity(0.1) : Color.clear, lineWidth: 1)
        )
    }
}

#Preview {
    VideoLessonsView()
}

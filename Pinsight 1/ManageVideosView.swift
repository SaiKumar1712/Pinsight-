import SwiftUI
import PhotosUI
import AVFoundation

// MARK: - Manage Videos View
struct ManageVideosView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = AdminViewModel()
    @State private var showUploadSheet = false

    // Premium Colors
    private let mintGreen = Color(red: 0.35, green: 0.8, blue: 0.65)
    private let lightPurple = Color(red: 0.4, green: 0.45, blue: 0.95)
    private let darkNavy = Color(red: 0.1, green: 0.12, blue: 0.25)
    private let softMint = Color(red: 0.92, green: 0.98, blue: 0.97)

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [Color(red: 0.96, green: 0.97, blue: 0.99), softMint],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 0) {
                // Back Button
                HStack {
                    Button(action: { dismiss() }) {
                        ZStack {
                            Circle()
                                .fill(Color.white)
                                .frame(width: 44, height: 44)
                                .shadow(color: .black.opacity(0.06), radius: 8, x: 0, y: 4)
                            Image(systemName: "chevron.left")
                                .font(.system(size: 15, weight: .bold))
                                .foregroundColor(darkNavy)
                        }
                    }
                    Spacer()
                }
                .padding(.horizontal, 24)
                .padding(.top, 56)
                .padding(.bottom, 12)

                ScrollView(showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 25) {
                        // Header
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Content Manager")
                                .font(.system(size: 32, weight: .black))
                                .foregroundColor(darkNavy)
                            Text("Upload and organize your educational videos")
                                .font(.system(size: 15, weight: .medium))
                                .foregroundColor(Color.black.opacity(0.4))
                        }
                        .padding(.horizontal, 24)

                        // Upload button
                        Button(action: { showUploadSheet = true }) {
                            Text("Upload New Module")
                                .font(.system(size: 17, weight: .bold))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 18)
                                .background(mintGreen)
                                .cornerRadius(25)
                                .shadow(color: mintGreen.opacity(0.2), radius: 10, y: 5)
                        }
                        .padding(.horizontal, 24)

                        if viewModel.isLoading {
                            ProgressView().padding().frame(maxWidth: .infinity)
                        }
                        if let error = viewModel.errorMessage {
                            Text(error).foregroundColor(.red).font(.caption)
                                .padding().frame(maxWidth: .infinity)
                        }

                        // Video List
                        VStack(spacing: 16) {
                            if viewModel.videos.isEmpty && !viewModel.isLoading {
                                VStack(spacing: 20) {
                                    ZStack {
                                        Circle()
                                            .fill(darkNavy.opacity(0.05))
                                            .frame(width: 100, height: 100)
                                        Image(systemName: "video.badge.plus")
                                            .font(.system(size: 40))
                                            .foregroundColor(darkNavy.opacity(0.2))
                                    }
                                    Text("No modules available")
                                        .font(.system(size: 17, weight: .bold))
                                        .foregroundColor(darkNavy.opacity(0.3))
                                }
                                .frame(maxWidth: .infinity).padding(.top, 60)
                            } else {
                                ForEach(viewModel.videos) { video in
                                    AdminVideoCard(video: video) {
                                        viewModel.deleteVideo(id: video.id)
                                    }
                                }
                            }
                        }
                        .padding(.horizontal, 24)

                        Spacer(minLength: 50)
                    }
                }
            }

            // Popup overlay
            if showUploadSheet {
                Color.black.opacity(0.3).ignoresSafeArea()
                    .transition(.opacity)
                    .onTapGesture { withAnimation { showUploadSheet = false } }

                UploadVideoPopup(viewModel: viewModel, showPopup: $showUploadSheet)
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                    .zIndex(1)
            }
        }
        .onAppear { viewModel.fetchVideos() }
        .onChange(of: viewModel.actionSuccess) { _, newValue in
            if newValue {
                withAnimation { showUploadSheet = false }
                viewModel.actionSuccess = false
            }
        }
        .navigationBarHidden(true)
        .animation(.easeInOut(duration: 0.25), value: showUploadSheet)
    }
}

// MARK: - Admin Video Card
struct AdminVideoCard: View {
    let video: VideoLesson
    var onDelete: () -> Void

    private let mintGreen = Color(red: 0.35, green: 0.8, blue: 0.65)
    private let darkNavy = Color(red: 0.1, green: 0.12, blue: 0.25)

    var body: some View {
        HStack(spacing: 16) {
            ZStack {
                RoundedRectangle(cornerRadius: 18)
                    .fill(Color.black.opacity(0.04))
                    .frame(width: 85, height: 65)
                
                if let thumb = video.thumbnail_url,
                   let url = URL(string: NetworkManager.shared.baseURL + "/" + thumb) {
                    AsyncImage(url: url) { image in
                        image.resizable().scaledToFill()
                    } placeholder: {
                        ProgressView().scaleEffect(0.5)
                    }
                    .frame(width: 85, height: 65)
                    .cornerRadius(18).clipped()
                } else {
                    Image(systemName: "play.rectangle.fill")
                        .foregroundColor(mintGreen.opacity(0.4))
                        .font(.system(size: 24))
                }
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(video.title)
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(darkNavy)
                    .lineLimit(2)
                
                HStack(spacing: 4) {
                    Image(systemName: "clock")
                        .font(.system(size: 10))
                    Text(video.duration)
                        .font(.system(size: 12, weight: .bold))
                }
                .foregroundColor(.gray.opacity(0.7))
            }
            Spacer()

            Button(action: onDelete) {
                Image(systemName: "trash.fill")
                    .foregroundColor(.red.opacity(0.6))
                    .font(.system(size: 14))
                    .padding(10)
                    .background(Color.red.opacity(0.05))
                    .clipShape(Circle())
            }
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(28)
        .shadow(color: .black.opacity(0.03), radius: 10, x: 0, y: 5)
    }
}

// MARK: - Video Picker
struct VideoPHPicker: UIViewControllerRepresentable {
    var onPick: (URL?, Data?) -> Void

    func makeCoordinator() -> Coordinator { Coordinator(self) }

    func makeUIViewController(context: Context) -> PHPickerViewController {
        var config = PHPickerConfiguration(photoLibrary: .shared())
        config.filter = .videos
        config.selectionLimit = 1
        let picker = PHPickerViewController(configuration: config)
        picker.delegate = context.coordinator
        return picker
    }
    func updateUIViewController(_ vc: PHPickerViewController, context: Context) {}

    class Coordinator: NSObject, PHPickerViewControllerDelegate {
        let parent: VideoPHPicker
        init(_ p: VideoPHPicker) { parent = p }

        func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
            picker.dismiss(animated: true)
            guard let result = results.first else { parent.onPick(nil, nil); return }
            result.itemProvider.loadFileRepresentation(forTypeIdentifier: "public.movie") { url, error in
                guard let src = url else { DispatchQueue.main.async { self.parent.onPick(nil, nil) }; return }
                let dest = FileManager.default.temporaryDirectory
                    .appendingPathComponent(UUID().uuidString)
                    .appendingPathExtension(src.pathExtension)
                do {
                    try FileManager.default.copyItem(at: src, to: dest)
                } catch {
                    DispatchQueue.main.async { self.parent.onPick(nil, nil) }
                    return
                }
                Task {
                    let thumb = await Self.generateThumbnailAsync(from: dest)
                    DispatchQueue.main.async { self.parent.onPick(dest, thumb) }
                }
            }
        }

        static func generateThumbnailAsync(from url: URL) async -> Data? {
            let asset = AVURLAsset(url: url, options: [AVURLAssetPreferPreciseDurationAndTimingKey: false])
            let gen = AVAssetImageGenerator(asset: asset)
            gen.appliesPreferredTrackTransform = true
            gen.maximumSize = CGSize(width: 480, height: 270)
            gen.requestedTimeToleranceBefore = .positiveInfinity
            gen.requestedTimeToleranceAfter = .positiveInfinity
            for secs in [2.0, 1.0, 0.0] {
                if let (img, _) = try? await gen.image(at: CMTime(seconds: secs, preferredTimescale: 600)) {
                    return UIImage(cgImage: img).jpegData(compressionQuality: 0.7)
                }
            }
            return nil
        }
    }
}

// MARK: - Upload Popup
struct UploadVideoPopup: View {
    @ObservedObject var viewModel: AdminViewModel
    @Binding var showPopup: Bool

    @State private var videoTitle = ""
    @State private var selectedVideoURL: URL? = nil
    @State private var selectedThumbData: Data? = nil
    @State private var isUploading = false
    @State private var isPreparing = false
    @State private var showPicker = false

    private let mintGreen = Color(red: 0.35, green: 0.8, blue: 0.65)
    private let darkNavy = Color(red: 0.1, green: 0.12, blue: 0.25)

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 24) {
                Text("New Module")
                    .font(.system(size: 24, weight: .black))
                    .foregroundColor(darkNavy)
                    .padding(.top, 5)

                VStack(alignment: .leading, spacing: 10) {
                    Text("MODULE TITLE")
                        .font(.system(size: 10, weight: .black))
                        .foregroundColor(.gray.opacity(0.8))
                        .tracking(1)
                    
                    TextField("Enter video title...", text: $videoTitle)
                        .font(.system(size: 16, weight: .medium))
                        .padding(.horizontal, 18)
                        .padding(.vertical, 16)
                        .background(Color(white: 0.96))
                        .cornerRadius(18)
                        .foregroundColor(darkNavy)
                }

                VStack(alignment: .leading, spacing: 10) {
                    Text("VIDEO FILE")
                        .font(.system(size: 10, weight: .black))
                        .foregroundColor(.gray.opacity(0.8))
                        .tracking(1)
                    
                    Button { showPicker = true } label: {
                        HStack(spacing: 15) {
                            if let thumbData = selectedThumbData, let uiImg = UIImage(data: thumbData) {
                                Image(uiImage: uiImg)
                                    .resizable().scaledToFill()
                                    .frame(width: 44, height: 32)
                                    .cornerRadius(8).clipped()
                            } else if isPreparing {
                                ProgressView().scaleEffect(0.8)
                            } else {
                                Image(systemName: selectedVideoURL == nil ? "video.circle.fill" : "video.fill")
                                    .font(.system(size: 20))
                                    .foregroundColor(selectedVideoURL == nil ? .gray.opacity(0.4) : mintGreen)
                            }

                            Text(selectedVideoURL == nil ? (isPreparing ? "Loading video…" : "Select Video Content") : "Content Selected \u{2713}")
                                .font(.system(size: 15, weight: .bold))
                                .foregroundColor(selectedVideoURL == nil ? .gray.opacity(0.6) : darkNavy)
                            
                            Spacer()
                            Image(systemName: "plus.circle.fill")
                                .font(.system(size: 20))
                                .foregroundColor(mintGreen.opacity(0.5))
                        }
                        .padding(.horizontal, 18)
                        .padding(.vertical, 16)
                        .background(Color(white: 0.96))
                        .cornerRadius(18)
                    }
                }
                .sheet(isPresented: $showPicker) {
                    VideoPHPicker { url, thumb in
                        if let url {
                            if let old = selectedVideoURL { try? FileManager.default.removeItem(at: old) }
                            selectedVideoURL = url
                            selectedThumbData = thumb
                        }
                        isPreparing = false
                    }
                }

                if let error = viewModel.errorMessage {
                    Text(error).font(.caption).foregroundColor(.red).multilineTextAlignment(.center)
                }

                if isUploading {
                    VStack(spacing: 12) {
                        ProgressView().scaleEffect(1.2)
                        Text("Uploading Content…")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(darkNavy.opacity(0.6))
                    }
                } else {
                    HStack(spacing: 16) {
                        Button("Cancel") {
                            if let u = selectedVideoURL { try? FileManager.default.removeItem(at: u) }
                            selectedVideoURL = nil
                            selectedThumbData = nil
                            withAnimation { showPopup = false }
                        }
                        .font(.system(size: 17, weight: .bold))
                        .foregroundColor(.red.opacity(0.8))
                        .frame(maxWidth: .infinity)

                        Button(action: {
                            guard let url = selectedVideoURL else { return }
                            isUploading = true
                            viewModel.uploadVideo(title: videoTitle, videoURL: url, thumbnailData: selectedThumbData)
                        }) {
                            Text("Publish")
                                .font(.system(size: 17, weight: .bold))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 18)
                                .background((!videoTitle.isEmpty && selectedVideoURL != nil && !isPreparing) ? darkNavy : Color.gray.opacity(0.3))
                                .cornerRadius(25)
                        }
                        .disabled(videoTitle.isEmpty || selectedVideoURL == nil || isPreparing)
                    }
                }
            }
            .padding(28)
            .background(Color.white)
            .cornerRadius(35)
            .padding(.horizontal, 24)
            .padding(.top, 120)
        }
        .shadow(color: .black.opacity(0.12), radius: 30, x: 0, y: 15)
        .onChange(of: viewModel.actionSuccess) { _, newValue in
            if newValue {
                if let u = selectedVideoURL { try? FileManager.default.removeItem(at: u) }
                selectedVideoURL = nil
                selectedThumbData = nil
                videoTitle = ""
                isUploading = false
                isPreparing = false
                viewModel.actionSuccess = false
                withAnimation { showPopup = false }
            }
        }
    }
}

#Preview { ManageVideosView() }

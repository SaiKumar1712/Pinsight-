import SwiftUI

struct FinalSummaryView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject private var session: AppSession
    @StateObject private var viewModel = SummaryViewModel()
    @State private var showLogoutAlert  = false

    // Premium Colors
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
                // ── Back button row ──
                HStack {
                    Button { dismiss() } label: {
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

                // ── Main scrollable content ──
                if viewModel.isLoading && viewModel.history.isEmpty {
                    Spacer()
                    ProgressView().scaleEffect(1.2)
                    Text("Calculating your achievements…")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(darkNavy.opacity(0.6))
                        .padding(.top, 15)
                    Spacer()
                } else if let error = viewModel.errorMessage {
                    Spacer()
                    Image(systemName: "exclamationmark.circle.fill")
                        .font(.system(size: 55))
                        .foregroundColor(.red.opacity(0.7))
                    Text("Oops! Something went wrong")
                        .font(.system(size: 30, weight: .bold))
                        .foregroundColor(darkNavy)
                        .padding(.top, 10)
                    Text(error)
                        .font(.system(size: 14))
                        .foregroundColor(.gray)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 40)
                    Button("Retry") { viewModel.fetchSummary() }
                        .foregroundColor(mintGreen)
                        .padding(.top, 15)
                    Spacer()
                } else {
                    ScrollView(showsIndicators: false) {
                        VStack(spacing: 25) {

                            // ── Header ──
                            VStack(spacing: 6) {
                                Text("Achievement Summary")
                                    .font(.system(size: 32, weight: .black))
                                    .foregroundColor(darkNavy)
                                    .frame(maxWidth: .infinity, alignment: .leading)

                                Text("Track your growth and learning milestones")
                                    .font(.system(size: 15, weight: .medium))
                                    .foregroundColor(Color.black.opacity(0.4))
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            }
                            .padding(.horizontal, 24)

                            // ── Hero Card (Updated colors) ──
                            VStack(spacing: 16) {
                                Text("OVERALL IMPROVEMENT")
                                    .font(.system(size: 11, weight: .black))
                                    .foregroundColor(.white.opacity(0.85))
                                    .tracking(2.5)

                                Text("\(viewModel.improvement >= 0 ? "+" : "")\(viewModel.improvement)%")
                                    .font(.system(size: 78, weight: .black))
                                    .foregroundColor(.white)
                                    .shadow(color: .black.opacity(0.12), radius: 10, y: 5)

                                Text(viewModel.improvement >= 0 ? "EXCELLENT PERFORMANCE" : "PRACTICE MAKES PERFECT")
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundColor(.white)
                                    .tracking(1)
                                    .padding(.horizontal, 24)
                                    .padding(.vertical, 10)
                                    .background(Color.black.opacity(0.12))
                                    .cornerRadius(16)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 40)
                            .background(
                                LinearGradient(
                                    colors: [lightPurple, Color(red: 0.35, green: 0.45, blue: 0.9)],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .cornerRadius(35)
                            .shadow(color: lightPurple.opacity(0.3), radius: 20, x: 0, y: 12)
                            .padding(.horizontal, 24)

                            // ── Mini Score Cards ──
                            HStack(spacing: 16) {
                                MiniStatsCard2(
                                    title: "PRE-TEST",
                                    score: viewModel.preScore,
                                    total: viewModel.preTotal,
                                    accentColor: mintGreen
                                )
                                MiniStatsCard2(
                                    title: "POST-TEST",
                                    score: viewModel.postBestScore,
                                    total: viewModel.postBestTotal,
                                    accentColor: mintGreen
                                )
                            }
                            .padding(.horizontal, 24)

                            // ── Attempt History ──
                            VStack(alignment: .leading, spacing: 18) {
                                Text("Attempt History")
                                    .font(.system(size: 24, weight: .black))
                                    .foregroundColor(darkNavy)
                                    .padding(.horizontal, 24)

                                if viewModel.history.isEmpty {
                                    VStack(spacing: 15) {
                                        Image(systemName: "clock.badge.exclamationmark")
                                            .font(.system(size: 50))
                                            .foregroundColor(.gray.opacity(0.2))
                                        Text("No attempts recorded yet")
                                            .font(.system(size: 16, weight: .medium))
                                            .foregroundColor(.gray)
                                    }
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 60)
                                } else {
                                    VStack(spacing: 16) {
                                        ForEach(Array(viewModel.history.enumerated()), id: \.element.id) { index, attempt in
                                            HistoryRow2(
                                                label:      "Assessment Attempt \(viewModel.history.count - index)",
                                                score:      attempt.score,
                                                total:      attempt.total,
                                                percentage: attempt.percentage,
                                                date:       formatDate(attempt.created_at),
                                                accentColor: mintGreen
                                            )
                                        }
                                    }
                                    .padding(.horizontal, 24)
                                }
                            }

                            // ── Sign Out Button ──
                            Button {
                                showLogoutAlert = true
                            } label: {
                                Text("Sign Out")
                                    .font(.system(size: 18, weight: .bold))
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 18)
                                    .background(Color(red: 0.95, green: 0.35, blue: 0.35))
                                    .cornerRadius(22)
                                    .shadow(color: .red.opacity(0.15), radius: 10, y: 5)
                            }
                            .padding(.horizontal, 24)
                            .padding(.bottom, 50)
                        }
                    }
                }
            }
        }
        .onAppear { viewModel.fetchSummary() }
        .navigationBarHidden(true)
        .alert("Sign Out", isPresented: $showLogoutAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Sign Out", role: .destructive) {
                session.logout()
            }
        } message: {
            Text("Are you sure you want to sign out from user?")
        }
    }

    private func formatDate(_ dateString: String) -> String {
        let parts = dateString.split(separator: " ")
        return parts.count >= 2 ? String(parts[0]) : dateString
    }
}

// MARK: - Mini Stats Card

struct MiniStatsCard2: View {
    let title:       String
    let score:       Int
    let total:       Int
    let accentColor: Color

    var pct: Int { total > 0 ? (score * 100) / total : 0 }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.system(size: 11, weight: .black))
                .foregroundColor(.gray.opacity(0.8))
                .tracking(1.5)

            HStack(alignment: .bottom, spacing: 3) {
                Text("\(score)")
                    .font(.system(size: 34, weight: .bold))
                    .foregroundColor(Color(red: 0.1, green: 0.12, blue: 0.25))
                Text("/\(total)")
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(.gray.opacity(0.6))
                    .padding(.bottom, 6)
                Spacer()
                Text("\(pct)%")
                    .font(.system(size: 12, weight: .black))
                    .foregroundColor(accentColor)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(accentColor.opacity(0.1))
                    .cornerRadius(10)
            }
        }
        .padding(20)
        .frame(maxWidth: .infinity)
        .background(Color.white)
        .cornerRadius(28)
        .shadow(color: .black.opacity(0.04), radius: 10, x: 0, y: 5)
    }
}

// MARK: - History Row

struct HistoryRow2: View {
    let label:       String
    let score:       Int
    let total:       Int
    let percentage:  Int
    let date:        String
    let accentColor: Color

    var body: some View {
        HStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(accentColor.opacity(0.1))
                    .frame(width: 48, height: 48)
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 24))
                    .foregroundColor(accentColor)
            }

            VStack(alignment: .leading, spacing: 3) {
                Text(label)
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(Color(red: 0.1, green: 0.12, blue: 0.25))
                Text(date)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.gray.opacity(0.7))
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 3) {
                Text("\(score)/\(total)")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(Color(red: 0.1, green: 0.12, blue: 0.25))
                Text("\(percentage)%")
                    .font(.system(size: 13, weight: .black))
                    .foregroundColor(accentColor)
            }
        }
        .padding(18)
        .background(Color.white)
        .cornerRadius(24)
        .shadow(color: .black.opacity(0.04), radius: 8, x: 0, y: 4)
    }
}

#Preview {
    NavigationStack {
        FinalSummaryView()
    }
}

import SwiftUI

struct ManageQuestionsFrameView: View {

    enum Tab: String, CaseIterable {
        case all = "All"
        case pre = "Pre-Test"
        case post = "Post-Test"
        case both = "Both"
    }

    @State private var selectedTab: Tab = .post

    var body: some View {
        ZStack {
            Color(.systemGroupedBackground)
                .ignoresSafeArea()

            VStack(spacing: 20) {

                // MARK: Title
                Text("Manage Questions")
                    .font(.system(size: 22, weight: .semibold))
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal)

                // MARK: Tabs
                VStack(spacing: 6) {
                    HStack {
                        ForEach(Tab.allCases, id: \.self) { tab in
                            VStack(spacing: 6) {
                                Text(tab.rawValue)
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(
                                        selectedTab == tab ? .black : .gray
                                    )
                                    .onTapGesture {
                                        withAnimation(.easeInOut) {
                                            selectedTab = tab
                                        }
                                    }

                                Capsule()
                                    .fill(
                                        selectedTab == tab
                                        ? Color.purple
                                        : Color.clear
                                    )
                                    .frame(height: 3)
                            }
                            .frame(maxWidth: .infinity)
                        }
                    }

                    Divider()
                }
                .padding(.horizontal)

                // MARK: Add Button
                Button(action: {}) {
                    Text("+ Add New Question")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.green)
                        .cornerRadius(28)
                }
                .padding(.horizontal)

                Spacer()
            }
            .padding(.top, 8)
        }
    }
}

#Preview {
    ManageQuestionsFrameView()
}

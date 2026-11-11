import SwiftUI

@main
struct CribSwipeApp: App {
    @State private var model = AppModel()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(model)
                .tint(Theme.brand)
                .task { await model.restore() }
        }
    }
}

struct RootView: View {
    @Environment(AppModel.self) private var model

    var body: some View {
        TabView {
            NavigationStack {
                DiscoverView()
            }
            .tabItem {
                Label("Discover", systemImage: "square.stack.3d.up")
            }
            NavigationStack {
                ShortlistView()
            }
            .tabItem {
                Label("Saved", systemImage: "heart")
            }
            NavigationStack {
                if model.isSignedIn {
                    SettingsView()
                } else {
                    LoginView()
                }
            }
            .tabItem {
                Label("Profile", systemImage: "person")
            }
        }
    }
}

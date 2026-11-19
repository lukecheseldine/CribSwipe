import SwiftUI

struct LoginView: View {
    @Environment(AppModel.self) private var model
    @State private var identifier = ""
    @State private var password = ""
    @State private var hidden = true
    @State private var busy = false
    @State private var error: String?
    @State private var notice: String?
    @State private var showSignup = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                ZStack(alignment: .bottomLeading) {
                    ListingPhoto(url: model.deck.first?.photoURLs.first ?? model.listings.first?.photoURLs.first, cornerRadius: Theme.cardRadius)
                        .frame(height: 180)
                    Text("Find your place.")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundStyle(Theme.brand)
                        .padding(.horizontal, 13)
                        .padding(.vertical, 9)
                        .background(.white, in: Capsule())
                        .padding(16)
                }
                ScreenTitle(title: "Welcome home.", subtitle: "Your next chapter is just a swipe away.")
                VStack(alignment: .leading, spacing: 16) {
                    TextEntry(
                        title: "Email or mobile number",
                        placeholder: "you@example.com",
                        text: $identifier,
                        systemImage: "envelope",
                        keyboard: .emailAddress,
                        textContent: .username
                    )
                    TextEntry(
                        title: "Password",
                        placeholder: "Enter your password",
                        text: $password,
                        systemImage: hidden ? "eye.slash" : "eye",
                        secure: hidden,
                        textContent: .password,
                        onIcon: { hidden.toggle() }
                    )
                    Button("Forgot password?") { notice = "This isn’t available yet." }
                        .font(.system(size: 12, weight: .medium))
                        .foregroundStyle(Theme.brand)
                        .frame(maxWidth: .infinity, alignment: .trailing)
                    if let error {
                        Text(error)
                            .font(.system(size: 12))
                            .foregroundStyle(Theme.pass)
                    }
                    PrimaryButton(title: "Log in", enabled: !busy) {
                        Task { await submit() }
                    }
                }
                social
                signupLink
            }
            .padding(.horizontal, Theme.screenPadding)
            .padding(.top, 12)
            .padding(.bottom, 28)
        }
        .background(Theme.paper)
        .toolbar(.hidden, for: .navigationBar)
        .toolbar(.hidden, for: .tabBar)
        .navigationDestination(isPresented: $showSignup) {
            SignupView()
        }
        .alert("CribSwipe", isPresented: Binding(
            get: { notice != nil },
            set: { if !$0 { notice = nil } }
        )) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(notice ?? "")
        }
    }

    private var social: some View {
        VStack(spacing: 14) {
            HStack(spacing: 12) {
                line
                Text("or continue with")
                    .font(.system(size: 11))
                    .foregroundStyle(Theme.muted)
                line
            }
            HStack(spacing: 12) {
                socialButton("apple.logo", "Apple")
                socialButton(nil, "Google")
            }
        }
    }

    private var line: some View {
        Rectangle().fill(Theme.line).frame(height: 1)
    }

    private func socialButton(_ symbol: String?, _ title: String) -> some View {
        Button {
            notice = "This isn’t connected yet."
        } label: {
            HStack(spacing: 9) {
                if let symbol {
                    Image(systemName: symbol)
                } else {
                    Text("G").font(.system(size: 17, weight: .semibold))
                }
                Text(title)
                    .font(.system(size: 13, weight: .medium))
            }
            .foregroundStyle(Theme.ink)
            .frame(maxWidth: .infinity)
            .frame(height: 50)
            .background(Color.white, in: Capsule())
            .overlay { Capsule().stroke(Theme.line, lineWidth: 1) }
        }
        .buttonStyle(.plain)
    }

    private var signupLink: some View {
        Button {
            showSignup = true
        } label: {
            (Text("New around here? ").foregroundStyle(Theme.muted)
                + Text("Sign up").fontWeight(.semibold).foregroundStyle(Theme.brand))
            .font(.system(size: 12))
        }
        .buttonStyle(.plain)
        .frame(maxWidth: .infinity)
        .padding(.top, 12)
    }

    private func submit() async {
        let id = identifier.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !id.isEmpty, !password.isEmpty else {
            error = "Enter your email or mobile number and password."
            return
        }
        busy = true
        error = nil
        defer { busy = false }
        do {
            try await model.login(identifier: id, password: password)
        } catch {
            self.error = error.localizedDescription
        }
    }
}

struct SignupView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss
    @State private var name = ""
    @State private var identifier = ""
    @State private var password = ""
    @State private var hidden = true
    @State private var busy = false
    @State private var error: String?
    @State private var notice: String?
    @State private var legal: LegalPage?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                Image(systemName: "house")
                    .font(.system(size: 24, weight: .medium))
                    .foregroundStyle(Theme.brand)
                    .frame(width: 56, height: 56)
                    .background(Theme.brandSoft, in: Circle())
                ScreenTitle(
                    title: "A place to begin.",
                    subtitle: "Create an account. Find a home that feels like you."
                )
                VStack(alignment: .leading, spacing: 16) {
                    TextEntry(
                        title: "Full name",
                        placeholder: "Your first and last name",
                        text: $name,
                        textContent: .name
                    )
                    TextEntry(
                        title: "Email or mobile number",
                        placeholder: "you@example.com",
                        text: $identifier,
                        systemImage: "envelope",
                        keyboard: .emailAddress,
                        textContent: .username
                    )
                    TextEntry(
                        title: "Password",
                        placeholder: "Create a password",
                        text: $password,
                        systemImage: hidden ? "eye.slash" : "eye",
                        secure: hidden,
                        textContent: .newPassword,
                        onIcon: { hidden.toggle() }
                    )
                    Text("Use at least 8 characters, including a number.")
                        .font(.system(size: 11))
                        .foregroundStyle(Theme.muted)
                    legalLine
                    if let error {
                        Text(error)
                            .font(.system(size: 12))
                            .foregroundStyle(Theme.pass)
                    }
                    PrimaryButton(title: "Create account", enabled: !busy) {
                        Task { await submit() }
                    }
                }
                LoginViewSocial { notice = "This isn’t connected yet." }
                Button {
                    dismiss()
                } label: {
                    (Text("Already have an account? ").foregroundStyle(Theme.muted)
                        + Text("Log in").fontWeight(.semibold).foregroundStyle(Theme.brand))
                    .font(.system(size: 12))
                }
                .buttonStyle(.plain)
                .frame(maxWidth: .infinity)
            }
            .padding(.horizontal, Theme.screenPadding)
            .padding(.top, 16)
            .padding(.bottom, 28)
        }
        .background(Theme.paper)
        .navigationTitle("Sign up")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(.visible, for: .navigationBar)
        .toolbar(.hidden, for: .tabBar)
        .navigationDestination(item: $legal) { page in
            LegalTextView(page: page)
        }
        .alert("CribSwipe", isPresented: Binding(
            get: { notice != nil },
            set: { if !$0 { notice = nil } }
        )) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(notice ?? "")
        }
    }

    private var legalLine: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("By signing up, you agree to our")
                .foregroundStyle(Theme.muted)
            HStack(spacing: 4) {
                Button("Terms of service") { legal = .terms }
                Text("and").foregroundStyle(Theme.muted)
                Button("Privacy policy.") { legal = .privacy }
            }
        }
        .font(.system(size: 11))
        .foregroundStyle(Theme.brand)
        .buttonStyle(.plain)
    }

    private func submit() async {
        let trimmedName = name.trimmingCharacters(in: .whitespacesAndNewlines)
        let parts = trimmedName.split(separator: " ")
        let id = identifier.trimmingCharacters(in: .whitespacesAndNewlines)
        guard parts.count >= 2 else {
            error = "Enter your first and last name."
            return
        }
        guard !id.isEmpty else {
            error = "Enter an email or mobile number."
            return
        }
        guard password.count >= 8, password.contains(where: \.isNumber) else {
            error = "Use at least 8 characters, including a number."
            return
        }
        busy = true
        error = nil
        defer { busy = false }
        do {
            try await model.signup(name: trimmedName, identifier: id, password: password)
        } catch {
            self.error = error.localizedDescription
        }
    }
}

struct LoginViewSocial: View {
    let unavailable: () -> Void

    var body: some View {
        VStack(spacing: 14) {
            HStack(spacing: 12) {
                Rectangle().fill(Theme.line).frame(height: 1)
                Text("or continue with")
                    .font(.system(size: 11))
                    .foregroundStyle(Theme.muted)
                Rectangle().fill(Theme.line).frame(height: 1)
            }
            HStack(spacing: 12) {
                provider("apple.logo", "Apple")
                provider(nil, "Google")
            }
        }
    }

    private func provider(_ symbol: String?, _ title: String) -> some View {
        Button(action: unavailable) {
            HStack(spacing: 9) {
                if let symbol {
                    Image(systemName: symbol)
                } else {
                    Text("G").font(.system(size: 17, weight: .semibold))
                }
                Text(title).font(.system(size: 13, weight: .medium))
            }
            .foregroundStyle(Theme.ink)
            .frame(maxWidth: .infinity)
            .frame(height: 50)
            .background(Color.white, in: Capsule())
            .overlay { Capsule().stroke(Theme.line, lineWidth: 1) }
        }
        .buttonStyle(.plain)
    }
}

enum LegalPage: String, Identifiable, Hashable {
    case terms
    case privacy

    var id: String { rawValue }

    var title: String {
        switch self {
        case .terms: "Terms of service"
        case .privacy: "Privacy policy"
        }
    }

    var body: String {
        switch self {
        case .terms:
            "The terms for using CribSwipe will live here."
        case .privacy:
            "Your name, email, phone number, and photo stay on your account and are never shown on a listing. Password changes and texted verification codes are not available yet."
        }
    }
}

struct LegalTextView: View {
    let page: LegalPage

    var body: some View {
        ScrollView {
            Text(page.body)
                .font(.system(size: 15))
                .foregroundStyle(Theme.ink)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(Theme.screenPadding)
        }
        .background(Theme.paper)
        .navigationTitle(page.title)
        .navigationBarTitleDisplayMode(.inline)
    }
}

import PhotosUI
import SwiftUI
import UIKit

struct SettingsView: View {
    @Environment(AppModel.self) private var model
    @State private var showProfile = false
    @State private var showFilters = false
    @State private var showPrivacy = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                Text("Make it yours.")
                    .font(.system(size: 30))
                    .foregroundStyle(Theme.ink)
                if let account = model.account {
                    Button { showProfile = true } label: {
                        HStack(spacing: 12) {
                            avatar(account, size: 44, font: 16)
                            VStack(alignment: .leading, spacing: 5) {
                                Text(account.name)
                                    .font(.system(size: 15, weight: .semibold))
                                    .foregroundStyle(Theme.ink)
                                Text(account.email.isEmpty ? account.phone : account.email)
                                    .font(.system(size: 11))
                                    .foregroundStyle(Theme.brand)
                            }
                            Spacer()
                            Image(systemName: "chevron.right")
                                .foregroundStyle(Theme.brand)
                        }
                        .padding(16)
                        .background(Theme.brandSoft, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
                    }
                    .buttonStyle(.plain)
                }
                group("ACCOUNT") {
                    row("person", "Edit profile") { showProfile = true }
                    row("slider.horizontal.3", "Search filters") { showFilters = true }
                }
                group("PREFERENCES & SECURITY") {
                    row("checkmark.shield", "Privacy & security") { showPrivacy = true }
                }
                Button {
                    Task { await model.signOut() }
                } label: {
                    HStack(spacing: 10) {
                        Image(systemName: "rectangle.portrait.and.arrow.right")
                        Text("Sign out")
                    }
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(Theme.pass)
                    .frame(maxWidth: .infinity)
                    .frame(height: 36)
                }
                .buttonStyle(.plain)
                Text("Made for your next chapter · Version 1.0.0")
                    .font(.system(size: 10))
                    .foregroundStyle(Theme.muted)
                    .frame(maxWidth: .infinity)
            }
            .padding(.horizontal, Theme.screenPadding)
            .padding(.top, 8)
            .padding(.bottom, 18)
        }
        .background(Theme.paper)
        .navigationTitle("Settings")
        .navigationBarTitleDisplayMode(.inline)
        .navigationDestination(isPresented: $showProfile) {
            EditProfileView()
        }
        .navigationDestination(isPresented: $showFilters) {
            FiltersView(purpose: .defaults)
        }
        .navigationDestination(isPresented: $showPrivacy) {
            LegalTextView(page: .privacy)
        }
    }

    private func group(_ title: String, @ViewBuilder rows: () -> some View) -> some View {
        VStack(alignment: .leading, spacing: 9) {
            Text(title)
                .font(.system(size: 11, weight: .semibold))
                .foregroundStyle(Theme.muted)
            VStack(spacing: 0) { rows() }
                .background(Color.white, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
                .overlay {
                    RoundedRectangle(cornerRadius: 18, style: .continuous).stroke(Theme.line, lineWidth: 1)
                }
        }
    }

    private func row(_ symbol: String, _ title: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: symbol)
                    .frame(width: 18)
                    .foregroundStyle(Theme.ink)
                Text(title)
                    .font(.system(size: 13))
                    .foregroundStyle(Theme.ink)
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.system(size: 13))
                    .foregroundStyle(Theme.muted)
            }
            .padding(.horizontal, 14)
            .frame(height: 48)
        }
        .buttonStyle(.plain)
    }

    private func avatar(_ account: Account, size: CGFloat, font: CGFloat) -> some View {
        ZStack {
            if let image = ProfileImage.image(from: account.photo) {
                Image(uiImage: image).resizable().scaledToFill()
            } else {
                Text(account.initials)
                    .font(.system(size: font, weight: .medium))
                    .foregroundStyle(Theme.brand)
            }
        }
        .frame(width: size, height: size)
        .background(Color.white, in: Circle())
        .clipShape(Circle())
    }
}

struct EditProfileView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss
    @State private var name = ""
    @State private var email = ""
    @State private var phone = ""
    @State private var photo: String?
    @State private var picker: PhotosPickerItem?
    @State private var busy = false
    @State private var error: String?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                ScreenTitle(
                    title: "A little about you.",
                    subtitle: "Give your next chapter a familiar face."
                )
                VStack(spacing: 10) {
                    ZStack(alignment: .bottomTrailing) {
                        avatar
                        Image(systemName: "camera.fill")
                            .font(.system(size: 11))
                            .foregroundStyle(.white)
                            .frame(width: 26, height: 26)
                            .background(Theme.brand, in: Circle())
                            .offset(x: 2)
                    }
                    PhotosPicker(selection: $picker, matching: .images) {
                        Text("Change photo")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundStyle(Theme.brand)
                    }
                }
                .frame(maxWidth: .infinity)
                TextEntry(title: "Full name", placeholder: "Your first and last name", text: $name, textContent: .name)
                TextEntry(
                    title: "Email address",
                    placeholder: "you@example.com",
                    text: $email,
                    systemImage: "envelope",
                    keyboard: .emailAddress,
                    textContent: .emailAddress
                )
                TextEntry(
                    title: "Phone number",
                    placeholder: "Mobile number",
                    text: $phone,
                    systemImage: "phone",
                    keyboard: .phonePad,
                    textContent: .telephoneNumber
                )
                VStack(alignment: .leading, spacing: 8) {
                    FieldLabel(title: "Current city")
                    HStack {
                        Text("Vancouver, BC")
                            .font(.system(size: 13))
                            .foregroundStyle(Theme.ink)
                        Spacer()
                        Image(systemName: "mappin").foregroundStyle(Theme.muted)
                    }
                    .padding(.horizontal, 16)
                    .frame(height: 52)
                    .background(Color.white, in: RoundedRectangle(cornerRadius: Theme.fieldRadius, style: .continuous))
                    .overlay {
                        RoundedRectangle(cornerRadius: Theme.fieldRadius, style: .continuous).stroke(Theme.line, lineWidth: 1)
                    }
                }
                VStack(spacing: 10) {
                    if let error {
                        Text(error)
                            .font(.system(size: 12))
                            .foregroundStyle(Theme.pass)
                    }
                    PrimaryButton(title: "Save changes", systemImage: nil, enabled: !busy) {
                        Task { await save() }
                    }
                    Text("Your contact details are never shown publicly.")
                        .font(.system(size: 10))
                        .foregroundStyle(Theme.muted)
                }
                .padding(.top, 8)
            }
            .padding(.horizontal, Theme.screenPadding)
            .padding(.bottom, 20)
        }
        .background(Theme.paper)
        .navigationTitle("Edit profile")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            guard let account = model.account else { return }
            name = account.name
            email = account.email
            phone = account.phone
            photo = account.photo
        }
        .onChange(of: picker) { _, item in
            guard let item else { return }
            Task { await loadPhoto(item) }
        }
    }

    private var avatar: some View {
        ZStack {
            if let image = ProfileImage.image(from: photo) {
                Image(uiImage: image).resizable().scaledToFill()
            } else {
                Text(initials)
                    .font(.system(size: 26))
                    .foregroundStyle(Theme.brand)
            }
        }
        .frame(width: 72, height: 72)
        .background(Theme.brandSoft, in: Circle())
        .clipShape(Circle())
    }

    private var initials: String {
        let parts = name.split(separator: " ").prefix(2)
        let letters = parts.compactMap(\.first)
        return letters.isEmpty ? "?" : String(letters).uppercased()
    }

    private func loadPhoto(_ item: PhotosPickerItem) async {
        guard let data = try? await item.loadTransferable(type: Data.self),
              let image = UIImage(data: data),
              let encoded = ProfileImage.dataURL(from: image)
        else {
            error = "Choose a smaller photo."
            return
        }
        photo = encoded
        error = nil
    }

    private func save() async {
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard trimmed.split(separator: " ").count >= 2 else {
            error = "Enter your first and last name."
            return
        }
        busy = true
        error = nil
        defer { busy = false }
        do {
            try await model.saveProfile(
                name: trimmed,
                email: email.trimmingCharacters(in: .whitespacesAndNewlines),
                phone: phone.trimmingCharacters(in: .whitespacesAndNewlines),
                photo: photo
            )
            dismiss()
        } catch {
            self.error = error.localizedDescription
        }
    }
}

enum ProfileImage {
    static func image(from value: String?) -> UIImage? {
        guard let value, let comma = value.firstIndex(of: ",") else { return nil }
        let encoded = String(value[value.index(after: comma)...])
        guard let data = Data(base64Encoded: encoded) else { return nil }
        return UIImage(data: data)
    }

    static func dataURL(from image: UIImage) -> String? {
        var quality: CGFloat = 0.7
        var data = image.jpegData(compressionQuality: quality)
        while let current = data, current.base64EncodedString().count > 380_000, quality > 0.2 {
            quality -= 0.15
            data = image.jpegData(compressionQuality: quality)
        }
        guard let data, data.base64EncodedString().count <= 380_000 else { return nil }
        return "data:image/jpeg;base64,\(data.base64EncodedString())"
    }
}

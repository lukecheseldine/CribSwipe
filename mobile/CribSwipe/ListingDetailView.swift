import SwiftUI

struct ListingDetailView: View {
    @Environment(AppModel.self) private var model
    let listing: Listing
    @State private var showViewer = false

    private var saved: Bool {
        model.savedIDs.contains(listing.id)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                photo
                identity
                specs
                if let description = listing.description, !description.isEmpty {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Room to make it yours.")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundStyle(Theme.ink)
                        Text(description)
                            .font(.system(size: 13))
                            .foregroundStyle(Theme.muted)
                            .lineSpacing(6)
                    }
                }
                Button {
                    showViewer = true
                } label: {
                    HStack(alignment: .top, spacing: 12) {
                        Image(systemName: "photo.on.rectangle")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundStyle(Theme.brand)
                            .frame(width: 36, height: 36)
                            .background(Theme.brandSoft, in: Circle())
                        VStack(alignment: .leading, spacing: 5) {
                            Text("See every photo")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundStyle(Theme.ink)
                            Text("Open the full-screen viewer to explore all \(max(listing.photos.count, 1)) photos in detail.")
                                .font(.system(size: 11))
                                .foregroundStyle(Theme.muted)
                                .lineSpacing(3)
                        }
                    }
                    .padding(16)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.white, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
                    .overlay {
                        RoundedRectangle(cornerRadius: 18, style: .continuous).stroke(Theme.line, lineWidth: 1)
                    }
                }
                .buttonStyle(.plain)
                .disabled(listing.photos.isEmpty)
            }
            .padding(Theme.screenPadding)
        }
        .background(Theme.paper)
        .safeAreaInset(edge: .bottom) {
            VStack(spacing: 10) {
                if let url = URL(string: listing.url) {
                    Link(destination: url) {
                        HStack(spacing: 12) {
                            Text("View original listing")
                                .font(.system(size: 14, weight: .semibold))
                            Image(systemName: "arrow.right")
                        }
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 52)
                        .background(Theme.brand, in: Capsule())
                    }
                }
                Text("Opens the source listing in its original place.")
                    .font(.system(size: 10))
                    .foregroundStyle(Theme.muted)
            }
            .padding(.horizontal, Theme.screenPadding)
            .padding(.top, 16)
            .padding(.bottom, 8)
            .background(Color.white)
            .overlay(alignment: .top) { Rectangle().fill(Theme.line).frame(height: 1) }
        }
        .navigationTitle("Your next chapter")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(.visible, for: .navigationBar)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                if let url = URL(string: listing.url) {
                    ShareLink(item: url) {
                        Image(systemName: "square.and.arrow.up")
                            .foregroundStyle(Theme.ink)
                    }
                    .accessibilityLabel("Share listing")
                }
            }
        }
        .fullScreenCover(isPresented: $showViewer) {
            PhotoViewer(listing: listing)
        }
    }

    private var photo: some View {
        ZStack(alignment: .bottomTrailing) {
            ListingPhoto(url: listing.photoURLs.first, cornerRadius: Theme.cardRadius)
                .frame(height: 312)
            Button {
                showViewer = true
            } label: {
                HStack(spacing: 7) {
                    Image(systemName: "photo.on.rectangle")
                    Text("Full-screen · \(listing.photos.count) photos")
                }
                .font(.system(size: 11, weight: .medium))
                .foregroundStyle(Theme.ink)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(.white, in: Capsule())
            }
            .buttonStyle(.plain)
            .padding(16)
            .disabled(listing.photos.isEmpty)
            Button {
                Task {
                    if saved {
                        await model.removeSaved(listing.id)
                    } else {
                        await model.like(listing)
                    }
                }
            } label: {
                Image(systemName: saved ? "heart.fill" : "heart")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundStyle(.white)
                    .frame(width: 44, height: 44)
                    .background(Theme.brand, in: Circle())
            }
            .buttonStyle(.plain)
            .accessibilityLabel(saved ? "Remove from shortlist" : "Save")
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing)
            .padding(16)
        }
    }

    private var identity: some View {
        VStack(alignment: .leading, spacing: 10) {
            if listing.justListed {
                Text("Just listed")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(Theme.brand)
                    .padding(.horizontal, 13)
                    .padding(.vertical, 9)
                    .background(Theme.brandSoft, in: Capsule())
            }
            Text(listing.title)
                .font(.system(size: 30))
                .foregroundStyle(Theme.ink)
            Text(addressLine)
                .font(.system(size: 12))
                .foregroundStyle(Theme.muted)
            (Text(listing.priceText).font(.system(size: 28)).foregroundStyle(Theme.ink)
                + Text(" / month").font(.system(size: 13)).foregroundStyle(Theme.muted))
        }
    }

    private var addressLine: String {
        var parts = [listing.address, listing.city, listing.postalCode].compactMap { $0 }
        if parts.isEmpty { parts = ["Vancouver, BC"] }
        return parts.joined(separator: " · ")
    }

    private var specs: some View {
        HStack {
            spec("bed.double", listing.bedrooms.map { $0 == 0 ? "Studio" : String($0) } ?? "—", listing.bedrooms == 0 ? "Home" : "Bedroom")
            spec("shower", listing.bathrooms.map { $0.rounded() == $0 ? String(Int($0)) : String($0) } ?? "—", "Bathroom")
            spec("square.dashed", listing.sqft.map { $0.formatted() } ?? "—", "Square feet")
        }
        .padding(16)
        .background(Color.white, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 18, style: .continuous).stroke(Theme.line, lineWidth: 1)
        }
    }

    private func spec(_ symbol: String, _ value: String, _ label: String) -> some View {
        VStack(spacing: 6) {
            Image(systemName: symbol)
                .font(.system(size: 18))
                .foregroundStyle(Theme.brand)
            Text(value)
                .font(.system(size: 20, weight: .semibold))
                .foregroundStyle(Theme.ink)
            Text(label)
                .font(.system(size: 10))
                .foregroundStyle(Theme.muted)
        }
        .frame(maxWidth: .infinity)
    }
}

struct PhotoViewer: View {
    let listing: Listing
    @Environment(\.dismiss) private var dismiss
    @State private var index = 0

    var body: some View {
        VStack(spacing: 0) {
            HStack(alignment: .center) {
                VStack(alignment: .leading, spacing: 5) {
                    Text(listing.title)
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundStyle(.white)
                        .lineLimit(1)
                    Text(listing.placeLine.isEmpty ? "Vancouver, BC" : listing.placeLine)
                        .font(.system(size: 11))
                        .foregroundStyle(Theme.viewerMuted)
                        .lineLimit(2)
                }
                Spacer()
                Button { dismiss() } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(.white)
                        .frame(width: 44, height: 44)
                        .background(Theme.viewerButton, in: Circle())
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Close")
            }
            .padding(.horizontal, 24)
            .padding(.top, 8)
            .frame(height: 78)

            ZStack {
                TabView(selection: $index) {
                    ForEach(Array(listing.photoURLs.enumerated()), id: \.offset) { offset, url in
                        ListingPhoto(url: url)
                            .tag(offset)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                HStack {
                    pagerButton("chevron.left", delta: -1).accessibilityLabel("Previous photo")
                    Spacer()
                    pagerButton("chevron.right", delta: 1).accessibilityLabel("Next photo")
                }
                .padding(.horizontal, 16)
                Text("\(shownIndex) / \(max(listing.photos.count, 1)) photos")
                    .font(.system(size: 12))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 8)
                    .background(Theme.viewerButton, in: Capsule())
                    .frame(maxHeight: .infinity, alignment: .bottom)
                    .padding(.bottom, 18)
            }
            .frame(maxHeight: .infinity)

            VStack(spacing: 18) {
                HStack(spacing: 6) {
                    ForEach(0..<min(listing.photos.count, 8), id: \.self) { dot in
                        Circle()
                            .fill(dot == index ? Color.white : Color.white.opacity(0.35))
                            .frame(width: 6, height: 6)
                    }
                }
                VStack(spacing: 5) {
                    Text("Swipe left or right to browse photos.")
                        .font(.system(size: 13))
                        .foregroundStyle(.white)
                    Text("A closer look at every room.")
                        .font(.system(size: 11))
                        .foregroundStyle(Theme.viewerMuted)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.top, 22)
            .padding(.bottom, 16)
        }
        .background(Theme.viewer.ignoresSafeArea())
        .preferredColorScheme(.dark)
    }

    private var shownIndex: Int {
        listing.photos.isEmpty ? 0 : index + 1
    }

    private func pagerButton(_ symbol: String, delta: Int) -> some View {
        Button {
            let next = index + delta
            guard listing.photoURLs.indices.contains(next) else { return }
            index = next
        } label: {
            Image(systemName: symbol)
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(.white)
                .frame(width: 44, height: 44)
                .background(Theme.viewerButton, in: Circle())
        }
        .buttonStyle(.plain)
    }
}

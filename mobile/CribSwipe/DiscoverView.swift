import SwiftUI

struct DiscoverView: View {
    @Environment(AppModel.self) private var model
    @State private var drag = CGSize.zero
    @State private var showFilters = false
    @State private var detail: Listing?
    @State private var viewer: Listing?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                header
                deck
                controls
                if let current = model.deck.first {
                    photoAffordance(current)
                }
            }
            .padding(.horizontal, Theme.screenPadding)
            .padding(.top, 12)
            .padding(.bottom, 18)
        }
        .background(Theme.paper)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(.hidden, for: .navigationBar)
        .navigationDestination(isPresented: Binding(
            get: { detail != nil },
            set: { if !$0 { detail = nil } }
        )) {
            if let detail {
                ListingDetailView(listing: detail)
            }
        }
        .navigationDestination(isPresented: $showFilters) {
            FiltersView(purpose: .search)
        }
        .fullScreenCover(item: $viewer) { listing in
            PhotoViewer(listing: listing)
        }
        .alert("CribSwipe", isPresented: noticeShown) {
            Button("OK", role: .cancel) { model.notice = nil }
        } message: {
            Text(model.notice ?? "")
        }
    }

    private var noticeShown: Binding<Bool> {
        Binding(get: { model.notice != nil }, set: { if !$0 { model.notice = nil } })
    }

    private var header: some View {
        HStack(alignment: .center) {
            VStack(alignment: .leading, spacing: 5) {
                HStack(spacing: 5) {
                    Image(systemName: "mappin")
                        .font(.system(size: 12, weight: .medium))
                    Text("Vancouver, BC")
                        .font(.system(size: 12, weight: .medium))
                }
                .foregroundStyle(Theme.muted)
                Text("Find your place.")
                    .font(.system(size: 28))
                    .foregroundStyle(Theme.ink)
            }
            Spacer()
            CircleIconButton(systemImage: "slider.horizontal.3", iconSize: 18) {
                showFilters = true
            }
            .accessibilityLabel("Search filters")
        }
    }

    @ViewBuilder
    private var deck: some View {
        if model.isLoading && model.listings.isEmpty {
            ProgressView()
                .frame(maxWidth: .infinity)
                .frame(height: 460)
        } else if let current = model.deck.first {
            ZStack {
                if model.deck.count > 1 {
                    RoundedRectangle(cornerRadius: Theme.cardRadius, style: .continuous)
                        .fill(Color(red: 239 / 255, green: 235 / 255, blue: 227 / 255))
                        .overlay {
                            RoundedRectangle(cornerRadius: Theme.cardRadius, style: .continuous)
                                .stroke(Theme.line, lineWidth: 1)
                        }
                        .padding(.horizontal, 12)
                        .padding(.top, 15)
                        .frame(height: 450)
                }
                card(current)
                    .offset(drag)
                    .rotationEffect(.degrees(Double(drag.width / 18)))
                    .gesture(dragGesture(for: current))
            }
            .frame(maxWidth: .infinity)
            .frame(height: 466)
        } else {
            VStack(spacing: 12) {
                Text("That’s the end of this search.")
                    .font(.system(size: 20))
                    .foregroundStyle(Theme.ink)
                Text("Change the filters, or bring back the last place you passed.")
                    .font(.system(size: 13))
                    .foregroundStyle(Theme.muted)
                    .multilineTextAlignment(.center)
                if !model.passed.isEmpty {
                    Button("Undo last pass") { model.undoPass() }
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(Theme.brand)
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 360)
        }
    }

    private func card(_ listing: Listing) -> some View {
        ZStack(alignment: .bottomLeading) {
            ListingPhoto(url: listing.photoURLs.first, cornerRadius: Theme.cardRadius)
            LinearGradient(
                stops: [
                    .init(color: .clear, location: 0.25),
                    .init(color: Color(red: 20 / 255, green: 37 / 255, blue: 29 / 255).opacity(0.25), location: 0.74),
                    .init(color: Color(red: 19 / 255, green: 36 / 255, blue: 29 / 255).opacity(0.8), location: 1),
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            .clipShape(RoundedRectangle(cornerRadius: Theme.cardRadius, style: .continuous))
            VStack(alignment: .leading, spacing: 9) {
                Text(listing.priceText)
                    .font(.system(size: 30))
                    .foregroundStyle(.white)
                + Text(" / month")
                    .font(.system(size: 14))
                    .foregroundStyle(.white.opacity(0.9))
                Text(listing.title)
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundStyle(.white)
                Text(listing.placeLine.isEmpty ? "Vancouver, BC" : listing.placeLine)
                    .font(.system(size: 13))
                    .foregroundStyle(.white.opacity(0.8))
                HStack(spacing: 15) {
                    fact("bed.double", listing.bedroomText)
                    fact("shower", listing.bathroomText)
                    fact("square.dashed", listing.sizeText)
                }
            }
            .padding(22)
            if listing.justListed {
                HStack(spacing: 5) {
                    Image(systemName: "sparkles")
                        .font(.system(size: 11, weight: .semibold))
                    Text("Just listed")
                        .font(.system(size: 11, weight: .semibold))
                }
                .foregroundStyle(Theme.brand)
                .padding(.horizontal, 11)
                .padding(.vertical, 7)
                .background(.white, in: Capsule())
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                .padding(18)
            }
            if listing.photos.count > 1 {
                Text("1 / \(listing.photos.count)")
                    .font(.system(size: 11))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 9)
                    .padding(.vertical, 5)
                    .background(Theme.ink.opacity(0.4), in: Capsule())
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing)
                    .padding(18)
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: Theme.cardRadius, style: .continuous))
        .shadow(color: Color(red: 33 / 255, green: 56 / 255, blue: 45 / 255).opacity(0.07), radius: 12, y: 8)
    }

    private func fact(_ symbol: String, _ text: String) -> some View {
        HStack(spacing: 5) {
            Image(systemName: symbol)
                .font(.system(size: 13))
            Text(text)
                .font(.system(size: 12))
        }
        .foregroundStyle(.white)
    }

    private var controls: some View {
        VStack(spacing: 12) {
            HStack(spacing: 28) {
                CircleIconButton(systemImage: "arrow.uturn.backward", size: 42, iconSize: 18) {
                    model.undoPass()
                }
                .disabled(model.passed.isEmpty)
                .accessibilityLabel("Undo")
                CircleIconButton(systemImage: "xmark", size: 62, iconSize: 26) {
                    guard let current = model.deck.first else { return }
                    withAnimation { model.pass(current) }
                }
                .accessibilityLabel("Pass")
                CircleIconButton(systemImage: "heart", size: 70, iconSize: 28, filled: true) {
                    guard let current = model.deck.first else { return }
                    Task { await model.like(current) }
                }
                .accessibilityLabel("Save")
                CircleIconButton(systemImage: "info.circle", size: 42, iconSize: 18) {
                    detail = model.deck.first
                }
                .accessibilityLabel("Listing details")
            }
            Text("Swipe left to pass · right to make it a favorite")
                .font(.system(size: 11))
                .foregroundStyle(Theme.muted)
        }
        .frame(maxWidth: .infinity)
    }

    private func photoAffordance(_ listing: Listing) -> some View {
        Button {
            viewer = listing
        } label: {
            VStack(spacing: 6) {
                HStack(spacing: 8) {
                    Text("\(listing.photos.count) photos")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(Theme.brand)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(Theme.brandSoft, in: Capsule())
                    Text("Browse full-screen")
                        .font(.system(size: 11))
                        .foregroundStyle(Theme.muted)
                }
                Text("Swipe through every room without leaving discovery")
                    .font(.system(size: 11))
                    .foregroundStyle(Theme.muted)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .padding(.horizontal, 16)
            .background(Color.white, in: Capsule())
            .overlay { Capsule().stroke(Theme.line, lineWidth: 1) }
        }
        .buttonStyle(.plain)
        .disabled(listing.photos.isEmpty)
        .opacity(listing.photos.isEmpty ? 0.45 : 1)
    }

    private func dragGesture(for listing: Listing) -> some Gesture {
        DragGesture()
            .onChanged { drag = $0.translation }
            .onEnded { value in
                if value.translation.width > 90 {
                    drag = .zero
                    Task { await model.like(listing) }
                } else if value.translation.width < -90 {
                    drag = .zero
                    withAnimation { model.pass(listing) }
                } else {
                    withAnimation { drag = .zero }
                }
            }
    }
}

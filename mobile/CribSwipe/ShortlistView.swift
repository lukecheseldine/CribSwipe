import SwiftUI

struct ShortlistView: View {
    @Environment(AppModel.self) private var model
    @State private var detail: Listing?

    var body: some View {
        @Bindable var model = model
        return ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                VStack(alignment: .leading, spacing: 7) {
                    Text("Your shortlist.")
                        .font(.system(size: 30))
                        .foregroundStyle(Theme.ink)
                    Text(subtitle)
                        .font(.system(size: 12))
                        .foregroundStyle(Theme.muted)
                }
                HStack {
                    Text("All saved · \(model.shortlist.count)")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundStyle(Theme.brand)
                        .padding(.horizontal, 13)
                        .padding(.vertical, 9)
                        .background(Theme.brandSoft, in: Capsule())
                    Spacer()
                    Menu {
                        Picker("Sort", selection: $model.sort) {
                            ForEach(ShortlistSort.allCases) { sort in
                                Text(sort.label).tag(sort)
                            }
                        }
                    } label: {
                        HStack(spacing: 4) {
                            Image(systemName: "arrow.up.arrow.down")
                            Text(model.sort.label)
                        }
                        .font(.system(size: 11))
                        .foregroundStyle(Theme.muted)
                    }
                }
                if model.sortedShortlist.isEmpty {
                    Text("Homes you save will wait here.")
                        .font(.system(size: 13))
                        .foregroundStyle(Theme.muted)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.top, 24)
                } else {
                    ForEach(model.sortedShortlist) { item in
                        Button {
                            detail = item.listing
                        } label: {
                            ShortlistCard(listing: item.listing) {
                                Task { await model.removeSaved(item.listing.id) }
                            }
                        }
                        .buttonStyle(.plain)
                    }
                    HStack(spacing: 8) {
                        Image(systemName: "heart")
                        Text("Good things are worth coming back to.")
                    }
                    .font(.system(size: 11))
                    .foregroundStyle(Theme.muted)
                    .frame(maxWidth: .infinity)
                }
            }
            .padding(.horizontal, Theme.screenPadding)
            .padding(.top, 12)
            .padding(.bottom, 18)
        }
        .background(Theme.paper)
        .toolbar(.hidden, for: .navigationBar)
        .navigationDestination(item: $detail) { listing in
            ListingDetailView(listing: listing)
        }
    }

    private var subtitle: String {
        let count = model.shortlist.count
        if count == 1 { return "1 place that feels like you." }
        return "\(count) places that feel like you."
    }
}

private struct ShortlistCard: View {
    let listing: Listing
    let remove: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            ZStack(alignment: .topLeading) {
                ListingPhoto(url: listing.photoURLs.first)
                    .frame(height: 179)
                if listing.justListed {
                    Text("Just listed")
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundStyle(Theme.brand)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(.white, in: Capsule())
                        .padding(14)
                }
                Button(action: remove) {
                    Image(systemName: "heart.fill")
                        .font(.system(size: 15))
                        .foregroundStyle(.white)
                        .frame(width: 32, height: 32)
                        .background(Theme.brand, in: Circle())
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Remove from shortlist")
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing)
                .padding(14)
            }
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text(listing.title)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(Theme.ink)
                        .lineLimit(1)
                    Spacer()
                    (Text(listing.priceText).font(.system(size: 17))
                        + Text(" /mo").font(.system(size: 10)).foregroundStyle(Theme.muted))
                    .foregroundStyle(Theme.ink)
                }
                Text(listing.address ?? listing.city ?? "Vancouver")
                    .font(.system(size: 11))
                    .foregroundStyle(Theme.muted)
                HStack(spacing: 15) {
                    label("bed.double", listing.bedroomText)
                    label("shower", listing.bathroomText)
                    label("square.dashed", listing.sizeText)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 13)
        }
        .background(Color.white, in: RoundedRectangle(cornerRadius: Theme.cardRadius, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: Theme.cardRadius, style: .continuous)
                .stroke(Theme.line, lineWidth: 1)
        }
    }

    private func label(_ symbol: String, _ text: String) -> some View {
        HStack(spacing: 5) {
            Image(systemName: symbol)
            Text(text)
        }
        .font(.system(size: 12))
        .foregroundStyle(Theme.muted)
    }
}

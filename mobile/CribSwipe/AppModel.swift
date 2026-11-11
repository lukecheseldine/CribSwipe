import Foundation
import Observation

@MainActor
@Observable
final class AppModel {
    private let api = APIClient()
    private let guestKey = "cribswipe.shortlist.v1"

    var account: Account?
    var guestShortlist: [SavedListing] = []
    var listings: [Listing] = []
    var filters = ListingFilters.empty
    /// Session-only floor. The listings API only accepts a maximum rent.
    var minPrice: Int?
    var passed: [String] = []
    var skippedDefaults = false
    var isLoading = false
    var notice: String?
    var sort: ShortlistSort = .newest

    var isSignedIn: Bool { account != nil }

    var shortlist: [SavedListing] {
        account?.shortlist ?? guestShortlist
    }

    var savedIDs: Set<String> {
        Set(shortlist.map(\.listing.id))
    }

    var deck: [Listing] {
        listings.filter { listing in
            if passed.contains(listing.id) || savedIDs.contains(listing.id) { return false }
            if let minPrice {
                guard let price = listing.priceCad, price >= minPrice else { return false }
            }
            return true
        }
    }

    var sortedShortlist: [SavedListing] {
        shortlist.sorted { lhs, rhs in
            switch sort {
            case .newest:
                return lhs.savedAt > rhs.savedAt
            case .oldest:
                return lhs.savedAt < rhs.savedAt
            case .priceLow:
                return (lhs.listing.priceCad ?? Int.max) < (rhs.listing.priceCad ?? Int.max)
            case .priceHigh:
                return (lhs.listing.priceCad ?? -1) > (rhs.listing.priceCad ?? -1)
            }
        }
    }

    func restore() async {
        guestShortlist = Self.loadGuest(guestKey)
        isLoading = true
        defer { isLoading = false }
        do {
            guard var current = try await api.account() else {
                account = nil
                try await reloadListings()
                return
            }
            if !guestShortlist.isEmpty {
                for item in guestShortlist {
                    if let updated = try? await api.addShortlist(item.listing) {
                        current = updated
                    }
                }
                guestShortlist = []
                Self.saveGuest([], key: guestKey)
                if let refreshed = try? await api.account() {
                    current = refreshed
                }
            }
            account = current
            if !skippedDefaults, current.defaultFilters.affectsResults || current.defaultFilters.petFriendly || current.defaultFilters.moveInDate != nil || !current.defaultFilters.amenities.isEmpty {
                filters = current.defaultFilters
            }
            try await reloadListings()
        } catch {
            notice = error.localizedDescription
        }
    }

    func reloadListings() async throws {
        listings = try await api.listings(filters: filters)
    }

    func signup(name: String, identifier: String, password: String) async throws {
        account = try await api.signup(name: name, identifier: identifier, password: password)
        try await absorbGuestLikes()
        if let defaults = account?.defaultFilters {
            filters = defaults
        }
        try await reloadListings()
    }

    func login(identifier: String, password: String) async throws {
        account = try await api.login(identifier: identifier, password: password)
        try await absorbGuestLikes()
        if let defaults = account?.defaultFilters, defaults.affectsResults {
            filters = defaults
            skippedDefaults = false
        }
        try await reloadListings()
    }

    func signOut() async {
        try? await api.logout()
        account = nil
        filters = .empty
        minPrice = nil
        skippedDefaults = false
        try? await reloadListings()
    }

    func like(_ listing: Listing) async {
        if isSignedIn {
            do {
                account = try await api.addShortlist(listing)
            } catch {
                notice = error.localizedDescription
            }
        } else {
            guestShortlist.removeAll { $0.listing.id == listing.id }
            guestShortlist.insert(SavedListing(savedAt: ISO8601DateFormatter().string(from: Date()), listing: listing), at: 0)
            Self.saveGuest(guestShortlist, key: guestKey)
        }
    }

    func removeSaved(_ listingID: String) async {
        if isSignedIn {
            do {
                account = try await api.removeShortlist(id: listingID)
            } catch {
                notice = error.localizedDescription
            }
        } else {
            guestShortlist.removeAll { $0.listing.id == listingID }
            Self.saveGuest(guestShortlist, key: guestKey)
        }
    }

    func pass(_ listing: Listing) {
        passed.append(listing.id)
    }

    func undoPass() {
        _ = passed.popLast()
    }

    func applySearch(filters: ListingFilters, minPrice: Int?) async {
        self.filters = filters
        self.minPrice = minPrice
        skippedDefaults = !filters.affectsResults && minPrice == nil
        do {
            try await reloadListings()
        } catch {
            notice = error.localizedDescription
        }
    }

    func saveDefaultFilters(_ filters: ListingFilters) async throws {
        account = try await api.updateFilters(filters)
        self.filters = filters
        skippedDefaults = false
        try await reloadListings()
    }

    func saveProfile(name: String, email: String, phone: String, photo: String?) async throws {
        account = try await api.updateProfile(name: name, email: email, phone: phone, photo: photo)
    }

    func count(filters: ListingFilters) async -> Int? {
        try? await api.listingCount(filters: filters)
    }

    private func absorbGuestLikes() async throws {
        guard !guestShortlist.isEmpty else { return }
        for item in guestShortlist {
            if let updated = try? await api.addShortlist(item.listing) {
                account = updated
            }
        }
        guestShortlist = []
        Self.saveGuest([], key: guestKey)
        account = try await api.account() ?? account
    }

    private static func loadGuest(_ key: String) -> [SavedListing] {
        guard let data = UserDefaults.standard.data(forKey: key) else { return [] }
        return (try? JSONDecoder().decode([SavedListing].self, from: data)) ?? []
    }

    private static func saveGuest(_ items: [SavedListing], key: String) {
        let data = try? JSONEncoder().encode(items)
        UserDefaults.standard.set(data, forKey: key)
    }
}

import Foundation

struct Listing: Codable, Equatable, Identifiable, Hashable {
    var id: String
    var title: String
    var url: String
    var priceCad: Int?
    var bedrooms: Int?
    var bathrooms: Double?
    var sqft: Int?
    var propertyType: String?
    var address: String?
    var city: String?
    var postalCode: String?
    var description: String?
    var postedAt: String?
    var photos: [String]

    var photoURLs: [URL] {
        photos.compactMap(URL.init(string:))
    }

    var placeLine: String {
        [address, city].compactMap { $0 }.filter { !$0.isEmpty }.joined(separator: ", ")
    }

    var priceText: String {
        guard let priceCad else { return "Price on request" }
        return priceCad.formatted(.currency(code: "CAD").precision(.fractionLength(0)))
    }

    var bedroomText: String {
        guard let bedrooms else { return "Beds n/a" }
        if bedrooms == 0 { return "Studio" }
        return bedrooms == 1 ? "1 bed" : "\(bedrooms) beds"
    }

    var bathroomText: String {
        guard let bathrooms else { return "Baths n/a" }
        let value = bathrooms.rounded() == bathrooms ? String(Int(bathrooms)) : String(bathrooms)
        return bathrooms == 1 ? "\(value) bath" : "\(value) baths"
    }

    var sizeText: String {
        guard let sqft else { return "Size n/a" }
        return "\(sqft.formatted()) sq ft"
    }

    var justListed: Bool {
        guard let postedAt, let date = Listing.parseDate(postedAt) else { return false }
        return Date().timeIntervalSince(date) < 60 * 60 * 24 * 7
    }

    static func parseDate(_ value: String) -> Date? {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date = formatter.date(from: value) { return date }
        formatter.formatOptions = [.withInternetDateTime]
        if let date = formatter.date(from: value) { return date }
        let day = DateFormatter()
        day.locale = Locale(identifier: "en_US_POSIX")
        day.dateFormat = "yyyy-MM-dd"
        return day.date(from: String(value.prefix(10)))
    }
}

struct ListingFilters: Codable, Equatable {
    var maxPrice: Int?
    var bedrooms: [Int] = []
    var bathrooms: [Double] = []
    var minSqft: Int?
    var cities: [String] = []
    var propertyTypes: [String] = []
    var moveInDate: String?
    var petFriendly: Bool = false
    var amenities: [String] = []

    static let empty = ListingFilters()

    var affectsResults: Bool {
        maxPrice != nil || !bedrooms.isEmpty || !bathrooms.isEmpty || minSqft != nil || !cities.isEmpty || !propertyTypes.isEmpty
    }

    /// Query string for the listings API. Move-in date, pets, and amenities are kept on the
    /// account and left out until the scraper collects them.
    func queryItems(minPrice: Int? = nil) -> [URLQueryItem] {
        var items: [URLQueryItem] = []
        if let maxPrice { items.append(URLQueryItem(name: "max_price", value: String(maxPrice))) }
        if let minSqft { items.append(URLQueryItem(name: "min_sqft", value: String(minSqft))) }
        items += bedrooms.map { URLQueryItem(name: "bedrooms", value: String($0)) }
        items += bathrooms.map { URLQueryItem(name: "bathrooms", value: String($0)) }
        items += cities.map { URLQueryItem(name: "city", value: $0) }
        items += propertyTypes.map { URLQueryItem(name: "property_type", value: $0) }
        _ = minPrice
        return items
    }
}

struct SavedListing: Codable, Equatable, Identifiable {
    var savedAt: String
    var listing: Listing
    var id: String { listing.id }
}

struct Account: Codable, Equatable {
    var id: String
    var name: String
    var email: String
    var phone: String
    var photo: String?
    var defaultFilters: ListingFilters
    var shortlist: [SavedListing]

    var initials: String {
        let parts = name.split(separator: " ").prefix(2)
        let letters = parts.compactMap(\.first)
        return letters.isEmpty ? "?" : String(letters).uppercased()
    }
}

enum Amenity: String, CaseIterable, Identifiable {
    case laundry
    case dishwasher
    case elevator
    case outdoor
    case parking
    case gym

    var id: String { rawValue }

    var label: String {
        switch self {
        case .laundry: "In-unit laundry"
        case .dishwasher: "Dishwasher"
        case .elevator: "Elevator"
        case .outdoor: "Outdoor space"
        case .parking: "Parking"
        case .gym: "Gym"
        }
    }

    var systemImage: String {
        switch self {
        case .laundry: "washer"
        case .dishwasher: "fork.knife"
        case .elevator: "arrow.up.and.down"
        case .outdoor: "tree"
        case .parking: "car"
        case .gym: "dumbbell"
        }
    }
}

enum ShortlistSort: String, CaseIterable, Identifiable {
    case newest
    case oldest
    case priceLow
    case priceHigh

    var id: String { rawValue }

    var label: String {
        switch self {
        case .newest: "Newest"
        case .oldest: "Oldest"
        case .priceLow: "Price: low to high"
        case .priceHigh: "Price: high to low"
        }
    }
}

enum FilterBounds {
    static let priceMin = 100
    static let priceMax = 15_000
    static let priceStep = 50
    static let sizeMin = 200
    static let sizeMax = 6_000
    static let bedroomCounts = [0, 1, 2, 3, 4, 5, 6]
    static let bathroomCounts = [1, 2, 3, 4, 5]
    static let sizeChoices = [200, 400, 600, 800, 1_000, 1_500, 2_000, 3_000, 4_500, 6_000]
}

import Foundation

enum APIError: LocalizedError {
    case message(String)

    var errorDescription: String? {
        switch self {
        case .message(let message): message
        }
    }
}

struct APIClient {
    static let baseURL = URL(string: "http://127.0.0.1:8000")!

    private let session: URLSession
    private let decoder: JSONDecoder
    private let snakeEncoder: JSONEncoder
    private let camelEncoder: JSONEncoder

    init(session: URLSession = .shared) {
        self.session = session
        decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        snakeEncoder = JSONEncoder()
        snakeEncoder.keyEncodingStrategy = .convertToSnakeCase
        camelEncoder = JSONEncoder()
    }

    func listings(filters: ListingFilters) async throws -> [Listing] {
        let body: ListingsResponse = try await send(path: "/api/listings", query: filters.queryItems())
        return body.listings.map(Self.listing(from:))
    }

    func listingCount(filters: ListingFilters) async throws -> Int {
        let body: CountResponse = try await send(path: "/api/listings/count", query: filters.queryItems())
        return body.count
    }

    func listing(id: String) async throws -> Listing? {
        do {
            let row: ApiListing = try await send(path: "/api/listings/\(id.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? id)")
            return Self.listing(from: row)
        } catch let error as APIError {
            if case .message(let message) = error, message == "missing" { return nil }
            throw error
        }
    }

    func account() async throws -> Account? {
        do {
            return try await send(path: "/api/account")
        } catch let error as APIError {
            if case .message(let message) = error, message == "unauthorized" { return nil }
            throw error
        }
    }

    func signup(name: String, identifier: String, password: String) async throws -> Account {
        try await send(
            path: "/api/auth/signup",
            method: "POST",
            body: SignupBody(name: name, identifier: identifier, password: password)
        )
    }

    func login(identifier: String, password: String) async throws -> Account {
        try await send(
            path: "/api/auth/login",
            method: "POST",
            body: LoginBody(identifier: identifier, password: password)
        )
    }

    func logout() async throws {
        let _: EmptyResponse? = try? await send(path: "/api/auth/logout", method: "POST")
    }

    func updateProfile(name: String, email: String, phone: String, photo: String?) async throws -> Account {
        try await send(
            path: "/api/account/profile",
            method: "PUT",
            body: ProfileBody(name: name, email: email, phone: phone, photo: photo)
        )
    }

    func updateFilters(_ filters: ListingFilters) async throws -> Account {
        try await send(path: "/api/account/filters", method: "PUT", json: try snakeEncoder.encode(filters))
    }

    func addShortlist(_ listing: Listing) async throws -> Account {
        try await send(
            path: "/api/account/shortlist",
            method: "POST",
            json: try camelEncoder.encode(ShortlistBody(listing: listing))
        )
    }

    func removeShortlist(id: String) async throws -> Account {
        try await send(
            path: "/api/account/shortlist/\(id.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? id)",
            method: "DELETE"
        )
    }

    private func send<Response: Decodable>(
        path: String,
        method: String = "GET",
        query: [URLQueryItem] = [],
        body: (any Encodable)? = nil
    ) async throws -> Response {
        let json = try body.map { try camelEncoder.encode($0) }
        return try await send(path: path, method: method, query: query, json: json)
    }

    private func send<Response: Decodable>(
        path: String,
        method: String = "GET",
        query: [URLQueryItem] = [],
        json: Data? = nil
    ) async throws -> Response {
        guard var components = URLComponents(url: Self.baseURL, resolvingAgainstBaseURL: false) else {
            throw APIError.message("Something went wrong. Try again.")
        }
        components.path = path.hasPrefix("/") ? path : "/" + path
        let kept = query.filter { $0.value?.isEmpty == false }
        if !kept.isEmpty { components.queryItems = kept }
        guard let url = components.url else { throw APIError.message("Something went wrong. Try again.") }

        var request = URLRequest(url: url)
        request.httpMethod = method
        if let json {
            request.httpBody = json
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }

        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await session.data(for: request)
        } catch {
            throw APIError.message("We couldn’t reach CribSwipe. Is the API running?")
        }
        guard let http = response as? HTTPURLResponse else {
            throw APIError.message("Something went wrong. Try again.")
        }
        if http.statusCode == 401 { throw APIError.message("unauthorized") }
        if http.statusCode == 404 { throw APIError.message("missing") }
        if http.statusCode == 204, Response.self == EmptyResponse.self {
            return EmptyResponse() as! Response
        }
        if !(200..<300).contains(http.statusCode) {
            throw APIError.message(Self.message(from: data))
        }
        if Response.self == EmptyResponse.self {
            return EmptyResponse() as! Response
        }
        do {
            return try decoder.decode(Response.self, from: data)
        } catch {
            throw APIError.message("Something went wrong. Try again.")
        }
    }

    private static func message(from data: Data) -> String {
        if let payload = try? JSONDecoder().decode(ErrorBody.self, from: data), let detail = payload.detail {
            return detail
        }
        return "Something went wrong. Try again."
    }

    private static func listing(from row: ApiListing) -> Listing {
        Listing(
            id: row.id,
            title: blank(row.title) ?? "Untitled listing",
            url: row.url,
            priceCad: row.priceCad,
            bedrooms: bedrooms(row.bedrooms),
            bathrooms: row.bathrooms,
            sqft: row.sqft,
            propertyType: blank(row.propertyType),
            address: blank(row.address),
            city: blank(row.city),
            postalCode: blank(row.postalCode),
            description: blank(row.body),
            postedAt: row.postedAt,
            photos: row.photos ?? []
        )
    }

    private static func blank(_ value: String?) -> String? {
        let trimmed = value?.trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed?.isEmpty == false ? trimmed : nil
    }

    private static func bedrooms(_ value: String?) -> Int? {
        guard let value else { return nil }
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        if trimmed.contains("studio") { return 0 }
        let digits = trimmed.prefix { $0.isNumber }
        return Int(digits)
    }
}

private struct ApiListing: Decodable {
    var id: String
    var url: String
    var title: String?
    var priceCad: Int?
    var bedrooms: String?
    var bathrooms: Double?
    var sqft: Int?
    var propertyType: String?
    var address: String?
    var city: String?
    var postalCode: String?
    var body: String?
    var postedAt: String?
    var photos: [String]?
}

private struct ListingsResponse: Decodable {
    var listings: [ApiListing]
}

private struct CountResponse: Decodable {
    var count: Int
}

private struct ErrorBody: Decodable {
    var detail: String?
}

private struct EmptyResponse: Decodable {}

private struct LoginBody: Encodable {
    var identifier: String
    var password: String
}

private struct SignupBody: Encodable {
    var name: String
    var identifier: String
    var password: String
}

private struct ProfileBody: Encodable {
    var name: String
    var email: String
    var phone: String
    var photo: String?
}

private struct ShortlistBody: Encodable {
    var listing: Listing
}

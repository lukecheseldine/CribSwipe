import SwiftUI

enum FilterPurpose {
    case search
    case defaults
}

struct FiltersView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss
    let purpose: FilterPurpose

    @State private var draft = ListingFilters.empty
    @State private var minRent = FilterBounds.priceMin
    @State private var maxRent = FilterBounds.priceMax
    @State private var moveIn = Date()
    @State private var hasMoveIn = false
    @State private var count: Int?
    @State private var saving = false
    @State private var error: String?
    @State private var ready = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                ScreenTitle(
                    title: "Your kind of place.",
                    subtitle: "Keep the things that matter. We'll do the looking."
                )
                location
                rent
                bedrooms
                bathrooms
                sizeAndDate
                pets
                amenities
            }
            .padding(.horizontal, Theme.screenPadding)
            .padding(.bottom, 24)
        }
        .background(Theme.paper)
        .safeAreaInset(edge: .bottom) {
            VStack(spacing: 10) {
                PrimaryButton(title: applyTitle, enabled: !saving) {
                    Task { await apply() }
                }
                Text("More of what you're looking for.")
                    .font(.system(size: 10))
                    .foregroundStyle(Theme.muted)
            }
            .padding(.horizontal, Theme.screenPadding)
            .padding(.top, 16)
            .padding(.bottom, 8)
            .background(Color.white)
            .overlay(alignment: .top) { Rectangle().fill(Theme.line).frame(height: 1) }
        }
        .navigationTitle("Search filters")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Reset") { reset() }
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(Theme.brand)
            }
        }
        .task {
            loadDraft()
            try? await Task.sleep(for: .milliseconds(150))
            ready = true
        }
        .task(id: queryKey) { await refreshCount() }
        .alert("Couldn’t save", isPresented: Binding(
            get: { error != nil },
            set: { if !$0 { error = nil } }
        )) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(error ?? "")
        }
    }

    private var applyTitle: String {
        if let count { return "Apply filters · Show \(count) places" }
        return "Apply filters"
    }

    private var queryKey: String {
        let filters = currentFilters()
        return filters.queryItems().map { "\($0.name)=\($0.value ?? "")" }.joined(separator: "&")
    }

    private var location: some View {
        VStack(alignment: .leading, spacing: 8) {
            FieldLabel(title: "Location")
            HStack {
                Text("Vancouver, BC")
                    .font(.system(size: 13))
                    .foregroundStyle(Theme.ink)
                Spacer()
                Image(systemName: "mappin")
                    .foregroundStyle(Theme.muted)
            }
            .padding(.horizontal, 16)
            .frame(height: 52)
            .background(Color.white, in: RoundedRectangle(cornerRadius: Theme.fieldRadius, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: Theme.fieldRadius, style: .continuous).stroke(Theme.line, lineWidth: 1)
            }
        }
    }

    private var rent: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Monthly rent")
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(Theme.ink)
            HStack(spacing: 12) {
                moneyField("Minimum", minRent == FilterBounds.priceMin ? "Any" : money(minRent))
                moneyField("Maximum", maxRent == FilterBounds.priceMax ? "Any" : money(maxRent))
            }
            VStack(spacing: 8) {
                Slider(
                    value: Binding(
                        get: { Double(minRent) },
                        set: { minRent = min(Int($0), maxRent) }
                    ),
                    in: Double(FilterBounds.priceMin)...Double(FilterBounds.priceMax),
                    step: Double(FilterBounds.priceStep)
                )
                Slider(
                    value: Binding(
                        get: { Double(maxRent) },
                        set: { maxRent = max(Int($0), minRent) }
                    ),
                    in: Double(FilterBounds.priceMin)...Double(FilterBounds.priceMax),
                    step: Double(FilterBounds.priceStep)
                )
            }
            .tint(Theme.brand)
        }
    }

    private var bedrooms: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Bedrooms")
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(Theme.ink)
            FlowLayout {
                ChoiceChip(title: "Any", selected: draft.bedrooms.isEmpty) { draft.bedrooms = [] }
                ChoiceChip(title: "Studio", selected: draft.bedrooms.contains(0)) { toggleBedroom(0) }
                ChoiceChip(title: "1", selected: draft.bedrooms.contains(1)) { toggleBedroom(1) }
                ChoiceChip(title: "2", selected: draft.bedrooms.contains(2)) { toggleBedroom(2) }
                ChoiceChip(title: "3+", selected: [3, 4, 5, 6].allSatisfy(draft.bedrooms.contains)) {
                    let extra = [3, 4, 5, 6]
                    if extra.allSatisfy(draft.bedrooms.contains) {
                        draft.bedrooms.removeAll { extra.contains($0) }
                    } else {
                        for value in extra where !draft.bedrooms.contains(value) {
                            draft.bedrooms.append(value)
                        }
                    }
                }
            }
        }
    }

    private var bathrooms: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Bathrooms")
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(Theme.ink)
            FlowLayout {
                ChoiceChip(title: "Any", selected: draft.bathrooms.isEmpty) { draft.bathrooms = [] }
                ChoiceChip(title: "1+", selected: isBath(1)) { setBath(1) }
                ChoiceChip(title: "2+", selected: isBath(2)) { setBath(2) }
                ChoiceChip(title: "3+", selected: isBath(3)) { setBath(3) }
            }
        }
    }

    private var sizeAndDate: some View {
        HStack(alignment: .top, spacing: 12) {
            VStack(alignment: .leading, spacing: 8) {
                FieldLabel(title: "Minimum size")
                Menu {
                    Button("Any") { draft.minSqft = nil }
                    ForEach(sizeOptions, id: \.self) { size in
                        Button("\(size.formatted()) sq ft") { draft.minSqft = size }
                    }
                } label: {
                    fieldChrome(draft.minSqft.map { "\($0.formatted()) sq ft" } ?? "Any", symbol: "chevron.down")
                }
            }
            VStack(alignment: .leading, spacing: 8) {
                FieldLabel(title: "Move-in date")
                DatePicker(
                    "Move-in date",
                    selection: $moveIn,
                    displayedComponents: .date
                )
                .labelsHidden()
                .datePickerStyle(.compact)
                .padding(.horizontal, 12)
                .frame(maxWidth: .infinity, alignment: .leading)
                .frame(height: 52)
                .background(Color.white, in: RoundedRectangle(cornerRadius: Theme.fieldRadius, style: .continuous))
                .overlay {
                    RoundedRectangle(cornerRadius: Theme.fieldRadius, style: .continuous).stroke(Theme.line, lineWidth: 1)
                }
                .onChange(of: moveIn) { _, _ in
                    if ready { hasMoveIn = true }
                }
            }
        }
    }

    private var pets: some View {
        HStack(spacing: 12) {
            Image(systemName: "pawprint")
                .font(.system(size: 18))
                .foregroundStyle(Theme.brand)
            VStack(alignment: .leading, spacing: 5) {
                Text("Pet friendly")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(Theme.ink)
                Text("A home for your best friend, too.")
                    .font(.system(size: 11))
                    .foregroundStyle(Theme.muted)
            }
            Spacer()
            Toggle("Pet friendly", isOn: $draft.petFriendly)
                .labelsHidden()
                .tint(Theme.brand)
        }
        .padding(16)
        .background(Color.white, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 18, style: .continuous).stroke(Theme.line, lineWidth: 1)
        }
    }

    private var amenities: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("The everyday extras")
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(Theme.ink)
            FlowLayout {
                ForEach(Amenity.allCases) { amenity in
                    ChoiceChip(
                        title: amenity.label,
                        systemImage: amenity.systemImage,
                        selected: draft.amenities.contains(amenity.rawValue)
                    ) {
                        if let index = draft.amenities.firstIndex(of: amenity.rawValue) {
                            draft.amenities.remove(at: index)
                        } else {
                            draft.amenities.append(amenity.rawValue)
                        }
                    }
                }
            }
        }
    }

    private var sizeOptions: [Int] {
        var options = FilterBounds.sizeChoices
        if let minSqft = draft.minSqft, !options.contains(minSqft) {
            options.append(minSqft)
            options.sort()
        }
        return options
    }

    private func moneyField(_ title: String, _ value: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            FieldLabel(title: title)
            Text(value)
                .font(.system(size: 13))
                .foregroundStyle(Theme.ink)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 16)
                .frame(height: 52)
                .background(Color.white, in: RoundedRectangle(cornerRadius: Theme.fieldRadius, style: .continuous))
                .overlay {
                    RoundedRectangle(cornerRadius: Theme.fieldRadius, style: .continuous).stroke(Theme.line, lineWidth: 1)
                }
        }
    }

    private func fieldChrome(_ title: String, symbol: String) -> some View {
        HStack {
            Text(title)
                .font(.system(size: 13))
                .foregroundStyle(Theme.ink)
            Spacer()
            Image(systemName: symbol)
                .foregroundStyle(Theme.muted)
        }
        .padding(.horizontal, 16)
        .frame(height: 52)
        .background(Color.white, in: RoundedRectangle(cornerRadius: Theme.fieldRadius, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: Theme.fieldRadius, style: .continuous).stroke(Theme.line, lineWidth: 1)
        }
    }

    private func toggleBedroom(_ value: Int) {
        if let index = draft.bedrooms.firstIndex(of: value) {
            draft.bedrooms.remove(at: index)
        } else {
            draft.bedrooms.append(value)
        }
    }

    private func isBath(_ minimum: Int) -> Bool {
        draft.bathrooms == Self.bathSet(minimum)
    }

    private func setBath(_ minimum: Int) {
        draft.bathrooms = isBath(minimum) ? [] : Self.bathSet(minimum)
    }

    private static func bathSet(_ minimum: Int) -> [Double] {
        FilterBounds.bathroomCounts.filter { $0 >= minimum }.map(Double.init)
    }

    private func money(_ amount: Int) -> String {
        amount.formatted(.currency(code: "CAD").precision(.fractionLength(0)))
    }

    private func loadDraft() {
        draft = model.filters
        minRent = model.minPrice ?? FilterBounds.priceMin
        maxRent = model.filters.maxPrice ?? FilterBounds.priceMax
        if let moveInDate = model.filters.moveInDate, let date = Listing.parseDate(moveInDate) {
            moveIn = date
            hasMoveIn = true
        }
    }

    private func reset() {
        draft = .empty
        minRent = FilterBounds.priceMin
        maxRent = FilterBounds.priceMax
        hasMoveIn = false
    }

    private func currentFilters() -> ListingFilters {
        var next = draft
        next.maxPrice = maxRent >= FilterBounds.priceMax ? nil : maxRent
        next.cities = model.filters.cities
        next.propertyTypes = model.filters.propertyTypes
        if hasMoveIn {
            let formatter = DateFormatter()
            formatter.locale = Locale(identifier: "en_US_POSIX")
            formatter.dateFormat = "yyyy-MM-dd"
            next.moveInDate = formatter.string(from: moveIn)
        } else {
            next.moveInDate = draft.moveInDate
        }
        return next
    }

    private func refreshCount() async {
        count = await model.count(filters: currentFilters())
    }

    private func apply() async {
        let next = currentFilters()
        let floor = minRent <= FilterBounds.priceMin ? nil : minRent
        saving = true
        defer { saving = false }
        switch purpose {
        case .search:
            await model.applySearch(filters: next, minPrice: floor)
            dismiss()
        case .defaults:
            guard model.isSignedIn else {
                error = "Log in to save a default search."
                return
            }
            do {
                try await model.saveDefaultFilters(next)
                model.minPrice = floor
                dismiss()
            } catch {
                self.error = error.localizedDescription
            }
        }
    }
}

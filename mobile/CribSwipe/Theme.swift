import SwiftUI
import UIKit

/// Colors from the mobile frames. The frames are set in Inter; the app uses SF
/// so text still follows the system size settings.
enum Theme {
    static let brand = Color(red: 36 / 255, green: 118 / 255, blue: 92 / 255)
    static let brandSoft = Color(red: 231 / 255, green: 240 / 255, blue: 233 / 255)
    static let ink = Color(red: 36 / 255, green: 43 / 255, blue: 40 / 255)
    static let muted = Color(red: 121 / 255, green: 128 / 255, blue: 122 / 255)
    static let paper = Color(red: 248 / 255, green: 247 / 255, blue: 243 / 255)
    static let line = Color(red: 230 / 255, green: 232 / 255, blue: 225 / 255)
    static let pass = Color(red: 138 / 255, green: 98 / 255, blue: 88 / 255)
    static let viewer = Color(red: 25 / 255, green: 35 / 255, blue: 30 / 255)
    static let viewerButton = Color(red: 41 / 255, green: 53 / 255, blue: 46 / 255)
    static let viewerMuted = Color(red: 192 / 255, green: 203 / 255, blue: 195 / 255)

    static let cardRadius: CGFloat = 24
    static let fieldRadius: CGFloat = 14
    static let screenPadding: CGFloat = 24
}

struct ScreenTitle: View {
    let title: String
    var subtitle: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.system(size: 30, weight: .regular))
                .foregroundStyle(Theme.ink)
                .fixedSize(horizontal: false, vertical: true)
            if let subtitle {
                Text(subtitle)
                    .font(.system(size: 13))
                    .foregroundStyle(Theme.muted)
                    .lineSpacing(4)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct CircleIconButton: View {
    let systemImage: String
    var size: CGFloat = 44
    var iconSize: CGFloat = 20
    var filled = false
    var iconColor: Color = Theme.ink
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: systemImage)
                .font(.system(size: iconSize, weight: .medium))
                .foregroundStyle(filled ? Color.white : iconColor)
                .frame(width: size, height: size)
                .background(filled ? Theme.brand : Color.white, in: Circle())
                .overlay {
                    if !filled {
                        Circle().stroke(Theme.line, lineWidth: 1)
                    }
                }
        }
        .buttonStyle(.plain)
    }
}

struct PrimaryButton: View {
    let title: String
    var systemImage: String? = "arrow.right"
    var enabled = true
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Text(title)
                    .font(.system(size: 14, weight: .semibold))
                if let systemImage {
                    Image(systemName: systemImage)
                        .font(.system(size: 16, weight: .semibold))
                }
            }
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .frame(height: 52)
            .background(Theme.brand, in: Capsule())
        }
        .buttonStyle(.plain)
        .disabled(!enabled)
        .opacity(enabled ? 1 : 0.55)
    }
}

struct FieldLabel: View {
    let title: String

    var body: some View {
        Text(title)
            .font(.system(size: 12, weight: .medium))
            .foregroundStyle(Theme.ink)
            .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct TextEntry: View {
    let title: String
    let placeholder: String
    @Binding var text: String
    var systemImage: String?
    var secure = false
    var keyboard: UIKeyboardType = .default
    var textContent: UITextContentType?
    var onIcon: (() -> Void)?

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            FieldLabel(title: title)
            HStack(spacing: 10) {
                Group {
                    if secure {
                        SecureField(placeholder, text: $text)
                    } else {
                        TextField(placeholder, text: $text)
                    }
                }
                .font(.system(size: 13))
                .foregroundStyle(Theme.ink)
                .textInputAutocapitalization(keyboard == .emailAddress ? .never : .words)
                .autocorrectionDisabled()
                .keyboardType(keyboard)
                .textContentType(textContent)
                if let systemImage {
                    Button {
                        onIcon?()
                    } label: {
                        Image(systemName: systemImage)
                            .font(.system(size: 16))
                            .foregroundStyle(Theme.muted)
                    }
                    .buttonStyle(.plain)
                    .disabled(onIcon == nil)
                }
            }
            .padding(.horizontal, 16)
            .frame(height: 52)
            .background(Color.white, in: RoundedRectangle(cornerRadius: Theme.fieldRadius, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: Theme.fieldRadius, style: .continuous)
                    .stroke(Theme.line, lineWidth: 1)
            }
        }
    }
}

struct ChoiceChip: View {
    let title: String
    var systemImage: String?
    let selected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                if let systemImage {
                    Image(systemName: systemImage)
                        .font(.system(size: 12, weight: .medium))
                }
                Text(title)
                    .font(.system(size: 12, weight: .medium))
            }
            .foregroundStyle(selected ? Theme.brand : Theme.ink)
            .padding(.horizontal, 13)
            .padding(.vertical, 9)
            .background(selected ? Theme.brandSoft : Color.white, in: Capsule())
            .overlay {
                Capsule().stroke(selected ? Theme.brandSoft : Theme.line, lineWidth: 1)
            }
        }
        .buttonStyle(.plain)
    }
}

struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let width = proposal.width ?? 0
        let rows = rows(for: subviews, maxWidth: width)
        let height = rows.reduce(0) { $0 + $1.height } + spacing * CGFloat(max(rows.count - 1, 0))
        return CGSize(width: width, height: height)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var y = bounds.minY
        for row in rows(for: subviews, maxWidth: bounds.width) {
            var x = bounds.minX
            for item in row.items {
                item.view.place(
                    at: CGPoint(x: x, y: y),
                    proposal: ProposedViewSize(item.size)
                )
                x += item.size.width + spacing
            }
            y += row.height + spacing
        }
    }

    private struct Item {
        let view: LayoutSubview
        let size: CGSize
    }

    private struct Row {
        var items: [Item] = []
        var height: CGFloat = 0
    }

    private func rows(for subviews: Subviews, maxWidth: CGFloat) -> [Row] {
        var rows: [Row] = []
        var current = Row()
        var x: CGFloat = 0
        for view in subviews {
            let size = view.sizeThatFits(.unspecified)
            if x + size.width > maxWidth, !current.items.isEmpty {
                rows.append(current)
                current = Row()
                x = 0
            }
            current.items.append(Item(view: view, size: size))
            current.height = max(current.height, size.height)
            x += size.width + spacing
        }
        if !current.items.isEmpty {
            rows.append(current)
        }
        return rows
    }
}

struct ListingPhoto: View {
    let url: URL?
    var cornerRadius: CGFloat = 0

    var body: some View {
        Color.clear
            .overlay {
                if let url {
                    AsyncImage(url: url) { phase in
                        switch phase {
                        case .success(let image):
                            image.resizable().scaledToFill()
                        default:
                            placeholder
                        }
                    }
                } else {
                    placeholder
                }
            }
            .clipped()
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
    }

    private var placeholder: some View {
        Theme.brandSoft
            .overlay {
                Image(systemName: "photo")
                    .font(.system(size: 28))
                    .foregroundStyle(Theme.brand)
            }
    }
}

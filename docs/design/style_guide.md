# Visual Style Guide - Laundry & Dry Cleaning (Luxury & Modern)

## 1. Core Brand Identity (Public Portal)
**Overall Mood:** Modern, Luxury, Trustworthy.
**Visual Style:** High whitespace, crisp photography, subtle glassmorphism for the e-commerce elements.

### Color Palette
- **Primary (Luxury Blue):** `#1A365D` (Deep, trustworthy navy)
- **Secondary (Clean Aqua):** `#EBF8FF` (Refreshing, water-like background)
- **Accent (Gold/Champagne):** `#D4AF37` (For luxury service highlights)
- **Success:** `#38A169` (Order confirmed)
- **Text (Off-Black):** `#2D3748`

### Typography (FOSS - Google Fonts)
- **Headings:** `Playfair Display` (Serif) - Evokes high-end fashion and luxury.
- **Body Text:** `Inter` (Sans-Serif) - Modern, highly readable, especially on mobile.
- **Pairing Rule:** Use Playfair for H1/H2 to show elegance; Inter for H3 and all body text for clarity.

---

## 2. Shared Component Styles
- **Buttons:**
  - *Primary:* Solid `#1A365D`, white text, 8px border-radius (soft professional).
  - *Hover:* Lighten by 10% + 2px upward lift (shadow).
- **Cards:** White background, `0 4px 6px -1px rgba(0,0,0,0.1)` shadow, 12px radius.
- **Spacing:** Base unit of 8px. Use 64px (8x8) for section gaps to ensure a "luxury" airy feel.

---

## 3. Internal Portal Theming System (Isolation Logic)
The 15 internal portals will use the **same spacing and component physics** but different color logic to distinguish departments instantly.

| Portal | Theme Name | Primary Color | Secondary / BG | Style Pattern |
| :--- | :--- | :--- | :--- | :--- |
| **Administration** | *Executive* | `#2C3E50` | `#F4F7F6` | Solid, thick borders, structured. |
| **IT** | *Cyber/Sci-Fi* | `#00FF41` | `#0D0D0D` | Matrix-green, glow effects, terminal fonts. |
| **Marketing** | *Vibrant* | `#FF0080` | `#FFFFFF` | Gradients, organic shapes, bold imagery. |
| **Finance** | *Audit* | `#1B5E20` | `#F1F8E9` | Crisp, narrow gutters, green tints. |
| **Transport** | *NightDrive* | `#FFD600` | `#121212` | High-visibility yellow on dark grey. |

### Image Direction
- **B2C:** Lifestyle shots of people enjoying their time, crisp close-ups of fabric textures (silk, wool).
- **B2B:** Clean warehouse shots, professional fleet of vans, high-volume ironing machines.
- **Tone:** Bright, high-key lighting, "clean" white balance.

---

## 4. Beginner Implementation Tips
1.  **Uniformity:** Always keep your `8px` grid. If something looks wrong, check if the margin is a multiple of 8.
2.  **Contrast:** Never put dark blue text on a black background. Keep accessibility high.
3.  **Icons:** Use `Lucide React` (FOSS). Keep icon stroke width at `1.5px` for a refined look.

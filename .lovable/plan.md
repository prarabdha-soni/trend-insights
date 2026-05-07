## Goal
Replace the dynamic per-cycle color theming with a single, fixed Flo-inspired color system, and polish the main screens to match Flo's clean, friendly look.

## Flo-inspired Color System (fixed, no phase swap)
- Background: soft warm pink `#FFF1F2` / card `#FFFFFF`
- Primary (CTA / accents): Flo coral-pink `#FF5C8A`
- Primary deep (headings/icons): `#1A1A40` (deep indigo)
- Secondary surface: `#FFE4E9`
- Muted text: `#6B6B80`
- Border: `#F2D9DE`
- Success: `#3BB273`, Warning: `#F4A261`

## Approach

### 1. Centralize theme
- Update `services/ThemeService.ts` so `themes[phaseKey]` returns the SAME Flo palette for every phase (Menstrual / Follicular / Ovulation / Luteal all map to one object). This way no component needs refactoring — they all keep calling `themes[phaseKey]` but get a consistent look.
- Keep phase-name labels (still shown in copy), only colors become uniform.

### 2. Polish key screens
Apply consistent Flo styling (rounded 20px cards, soft shadows, generous spacing, deep indigo headings, coral accents):
- `app/(tabs)/index.tsx` — Home: cleaner hero, simplified cycle ring colors, Flo-style quick action cards
- `app/(tabs)/_layout.tsx` — Bottom tab bar: white bg, coral active, deep indigo inactive
- `app/store/index.tsx` — Products grid: lighter cards, coral price + button
- `app/(tabs)/pcos.tsx` — Education list: Flo-style article cards
- `app/(tabs)/treatments.tsx` & `nutrition.tsx` — Apply same surface/card tokens
- `app/(tabs)/profile.tsx` — Clean list rows

### 3. Typography & spacing
- Headings: 700 weight, deep indigo `#1A1A40`
- Body: 400/500, `#4A4A5E`
- Card radius: 20px, padding: 16–20px, soft shadow `0 4px 12px rgba(26,26,64,0.06)`

## Out of Scope
- No new features, no logic changes, no new tabs.
- Onboarding screens left untouched unless they share components already updated.

## Technical Notes
- Single source-of-truth edit in `ThemeService.ts` flips the entire app's palette instantly.
- Per-screen passes only adjust spacing, radii, font weights, and replace hard-coded grays with the new tokens where needed.

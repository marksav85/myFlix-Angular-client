---
name: myFlix Angular Design System
status: approved
source: existing myFlix application + approved Stitch Warm Editorial exploration
design_direction: warm-editorial
framework: Angular
theme: warm-editorial
---

# myFlix Angular Design System

## 1. Purpose

This document defines the canonical visual and interaction system for the
Angular implementation of myFlix.

The Angular and React applications represent implementations of substantially
the same product using different frontend frameworks.

They should therefore remain approximately 95% equivalent in:

- page structure
- information hierarchy
- component geometry
- spacing
- typography
- functionality
- interactions
- responsive behaviour
- accessibility behaviour

Their principal visual distinction comes from their colour themes and limited
theme-specific decorative treatment.

The Angular application uses the **Warm Editorial** theme.

A visitor comparing the applications should immediately understand that they
implement the same product while still perceiving them as visually distinct
portfolio projects.

This document is the authority for the Angular application's UI structure and
visual treatment.

Framework-specific implementation details must not alter the intended design
unless required by a genuine technical constraint.

---

# 2. Design Principles

## 2.1 Character

The Angular design should feel:

- contemporary
- editorial
- cinematic
- warm
- polished
- restrained
- approachable
- image-led
- portfolio-quality

The visual direction takes inspiration from sophisticated film editorial and
independent cinema presentation rather than streaming-service interfaces.

myFlix is a movie-library application, not a streaming service.

The design must never imply unsupported playback, subscription, archive,
membership, rating, or technical-media functionality.

## 2.2 Warm Editorial Identity

The Warm Editorial theme is based on:

- a warm parchment / sand / pale-clay page canvas
- warm ivory / cream content surfaces
- deep wine / burgundy primary actions and branding
- dark warm-neutral typography
- subtle warm borders
- restrained shadows
- a separate brighter destructive colour family
- strong movie-poster imagery

The page canvas and card surfaces must remain visibly distinct.

The application should not collapse into:

- pure white page + pure white cards
- generic black buttons
- dark navy backgrounds
- default Angular Material styling
- generic corporate dashboard styling

## 2.3 Content First

Movie artwork is the strongest visual element.

Decoration should support rather than compete with:

- movie posters
- movie titles
- descriptions
- genres
- directors
- account information
- application actions

Avoid excessive gradients, glass effects, animation, shadows, badges, or
decorative elements.

## 2.4 Honest Product Representation

Only represent functionality and data that the application actually supports.

Do not introduce fictional:

- streaming/playback controls
- trailers
- ratings
- runtime
- release year
- cast
- awards
- multiple genres
- 4K/HDR/Dolby metadata
- subscription plans
- membership tiers
- user avatars
- account statistics
- watch history
- archive identifiers
- password recovery
- remember-device functionality
- genre filters
- sorting controls
- editorial or curation features

Future functionality may extend this specification deliberately, but visual
design must not invent it.

---

# 3. Colour System

## 3.1 Semantic Tokens

Components should consume semantic colour tokens rather than scattering raw
colour values throughout the application.

Required semantic roles:

- `canvas`
- `surface-1`
- `surface-2`
- `surface-elevated`
- `border-subtle`
- `border-strong`
- `text-primary`
- `text-secondary`
- `text-muted`
- `primary`
- `primary-hover`
- `primary-subtle`
- `on-primary`
- `secondary`
- `secondary-subtle`
- `focus`
- `danger`
- `danger-hover`
- `danger-subtle`
- `on-danger`

## 3.2 Warm Editorial Palette

The approved Stitch screens establish the visual relationship between colours.

The implementation should use the following normalized palette as its starting
point.

### Foundation

- `canvas`: `#EDE4D3`
- `surface-1`: `#F8F3E9`
- `surface-2`: `#FFFDF8`
- `surface-elevated`: `#FFFFFF`

The canvas should read as warm parchment rather than white.

Cards and panels should be visibly lighter than the page canvas without
creating harsh pure-white contrast throughout the interface.

### Borders

- `border-subtle`: `#D8CCB8`
- `border-strong`: `#BFAF98`

Borders should have a warm tint rather than generic cool grey.

### Text

- `text-primary`: `#2B211D`
- `text-secondary`: `#62554D`
- `text-muted`: `#81736A`

Text should read as dark warm charcoal rather than absolute black.

### Primary

- `primary`: `#8F1D2C`
- `primary-hover`: `#741724`
- `primary-subtle`: `#F2DDE0`
- `on-primary`: `#FFFFFF`

Primary is a deep wine / burgundy.

Use it for:

- principal actions
- active navigation emphasis
- selected states
- important interactive accents
- restrained brand emphasis

Do not overuse burgundy on large background areas.

### Secondary

- `secondary`: `#496F6A`
- `secondary-subtle`: `#DDE9E5`

The secondary accent is a restrained muted teal/green.

Use it sparingly for supporting states and subtle contrast.

It should never compete with the primary burgundy or movie artwork.

### Focus

- `focus`: `#496F6A`

Focus treatment should be clearly visible against both parchment and ivory
surfaces.

A focus ring may use the secondary colour with sufficient offset and contrast.

### Danger

Destructive actions must remain visually distinguishable from the burgundy
brand colour.

- `danger`: `#C9364F`
- `danger-hover`: `#A92840`
- `danger-subtle`: `#FBE7EA`
- `on-danger`: `#FFFFFF`

The distinction between `primary` and `danger` must be reinforced through:

- tone
- surrounding context
- border treatment
- labels
- destructive section styling

Do not rely on colour alone.

---

# 4. Typography

The intended primary typeface is **Plus Jakarta Sans**. The current runtime
declares the stack below but bundles and downloads no font files. It therefore
uses the system fallback unless Plus Jakarta Sans is already installed.

Fallback:

`"Plus Jakarta Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

## 4.1 Type Scale

### Display

- Desktop: 56px / 64px
- Mobile: 36px / 44px
- Weight: 800
- Tracking: approximately -0.03em

Use sparingly. Most application screens do not require display-sized text.

### Heading Large

- Desktop: 32px / 40px
- Mobile: 26px / 34px
- Weight: 700

### Heading Medium

- 24px / 32px
- Weight: 600–700

### Heading Small

- 18px / 26px
- Weight: 600

### Body Large

- 16px / 26px
- Weight: 400

### Body

- 14px / 22px
- Weight: 400

### Body Small

- 13px / 18px
- Weight: 400

### Label

- 14px / 20px
- Weight: 600

### Small Label

- 12px / 16px
- Weight: 600

Avoid very small text for important content.

---

# 5. Spacing

Use an 8px-oriented spacing rhythm with a 4px micro-step.

Recommended tokens:

- `space-1`: 4px
- `space-2`: 8px
- `space-3`: 12px
- `space-4`: 16px
- `space-5`: 24px
- `space-6`: 32px
- `space-7`: 40px
- `space-8`: 56px
- `space-9`: 72px

## Page Margins

### Mobile

16px

### Tablet

24–32px

### Desktop

48–56px

Use a centered maximum-width content container on large displays.

Recommended maximum:

`1440–1600px`

Do not allow content to expand indefinitely on ultrawide displays.

---

# 6. Shape

The system should use restrained rounded geometry.

- Small: 4px
- Default: 8px
- Medium: 12px
- Large: 16px
- Full: 9999px

Use 8px as the normal control/card radius.

Avoid excessive pill-shaped UI.

Pills are appropriate only for compact tags or deliberately compact controls.

---

# 7. Elevation and Surfaces

Warm Editorial should feel layered but relatively flat and editorial rather
than glossy.

Depth should primarily come from:

- difference between parchment canvas and ivory surfaces
- warm borders
- restrained shadows
- interaction emphasis

Avoid large generic box shadows.

## Resting Surface

- `surface-1`
- 1px `border-subtle`
- little or no shadow

## Elevated Surface

- `surface-elevated`
- stronger border or restrained soft shadow

## Focused/Floating Surface

Use only where genuine elevation is needed, such as menus or dialogs.

Avoid glassmorphism.

The Warm Editorial identity depends on tactile paper-like surface separation,
not translucent dark surfaces.

---

# 8. Global Application Shell

All screens share the same application shell.

## Header

Desktop layout:

- myFlix brand/logo aligned left
- navigation aligned right
- consistent content width with page body
- visually separated from page content
- sticky behaviour is permitted if unobtrusive

The header should participate in the Warm Editorial identity.

It may use:

- a light warm surface with a subtle bottom border
- stronger burgundy brand emphasis
- restrained active-navigation treatment

Do not introduce a dark navy application bar.

### Logged-Out Navigation

- Login
- Signup

### Logged-In Navigation

- Movies/Home
- My Profile
- Logout

Do not display:

- user avatar
- global search icon
- fictional account controls

Search belongs to the movie library page.

## Navigation States

Every navigation item must have:

- default
- hover
- keyboard focus
- active/current
- disabled where applicable

Logout should use a neutral outlined or secondary treatment rather than
destructive red.

Logout is not equivalent to deleting an account.

It must always remain readable in default, hover and focus states.

---

# 9. Branding

Use the product name:

**myFlix**

Do not introduce a secondary product identity.

Do not rename the application:

- Cinema Archive
- Cinéma Archive
- Movie Archive
- Curated Cinema
- or similar invented identities

The wordmark may use burgundy emphasis but should remain restrained.

Avoid Netflix-derived wordmarks or styling.

The canonical runtime favicon is `src/favicon.svg`: an ivory tile with a
geometric M and burgundy/wine facets. Its unchanged source/reference artwork
is [assets/myflix-icon-source.png](assets/myflix-icon-source.png). The raster
is design reference only; the application serves the SVG.

---

# 10. Buttons

All buttons require:

- default
- hover
- focus-visible
- active
- disabled
- pending/loading where relevant

Minimum interactive target should be approximately 44px where practical.

## Primary

Used for the principal action on a screen or form.

Examples:

- Login
- Signup
- Save Changes
- Add to Favorites

Use:

- `primary`
- `primary-hover`
- `on-primary`

The result should read as deep wine/burgundy rather than bright generic red.

## Secondary

Used for less prominent actions.

Examples:

- Back to Movies
- View Details where primary emphasis is unnecessary
- Logout

Use:

- light warm surface
- `text-primary` or `primary`
- visible warm border
- clear hover state

Avoid generic black secondary buttons.

## Destructive

Used only for destructive operations.

Examples:

- Delete Account
- destructive confirmation action

Use:

- `danger`
- `danger-hover`
- `danger-subtle`
- `on-danger`

Because the normal brand colour is already burgundy/red-derived, destructive
actions must not rely on hue alone.

Danger actions should also use:

- explicit destructive wording
- clearly separated Danger Zone context
- stronger warning treatment
- distinct border/surface treatment where appropriate

---

# 11. Form Controls

All forms share a common visual language.

Inputs should provide:

- persistent visible labels
- readable placeholders where useful
- clear boundaries against the warm background
- hover feedback
- strong focus-visible state
- validation/error state
- disabled state
- sufficient vertical height

Recommended input height:

48px

Typical input treatment:

- ivory/light surface
- warm border
- dark warm text
- secondary-coloured or otherwise clearly visible focus ring

Do not rely on placeholder text as the only label.

Password fields may use normal browser/password-manager functionality.

---

# 12. Authentication Screens

Login and Signup use the same shared authentication layout.

## Desktop

Use a focused authentication card/panel against the parchment canvas.

The panel contains:

- myFlix branding or clear application context
- concise page heading
- optional short neutral supporting sentence
- labelled form controls
- primary submission action
- link to the alternative authentication route

The contrast between parchment canvas and ivory authentication surface should
provide the primary visual separation.

### Login

Contains only:

- Username
- Password
- Login
- Signup link

Do not add:

- password recovery
- remember-device controls
- demo credentials
- subscription marketing
- security marketing claims

### Signup

Contains the fields actually required by the application:

- Username
- Password
- Email
- Birthday where applicable
- Signup
- Login link

Authentication screens should remain visually focused and uncluttered.

Login and Signup are routed pages at `/login` and `/signup`, with reciprocal
links. `/` and the historical `/welcome` URL redirect to `/login`; there is no
separate Welcome screen. The guest wordmark and Logout also lead to `/login`.
Login stores the returned user, username selector, and Bearer token in
localStorage before navigating to `/movies`. Signup reports success without
automatic login. Username, Password, and Email are required on Signup;
Birthday is optional. Forms use persistent feedback and pending guards.

---

# 13. Movie Library

The movie library is the primary authenticated screen.

## Structure

1. Global header
2. Page heading/context where appropriate
3. Search field
4. Responsive movie grid
5. Empty/error/loading states

The search control remains a single search/filter input.

Do not introduce sorting or genre filtering unless those features are later
implemented deliberately.

The page canvas should remain visibly warm and distinct from the movie cards.

---

# 14. Movie Grid

The grid should emphasize posters rather than large blocks of text.

Recommended desktop behaviour:

- approximately 4 columns at common desktop widths
- expand carefully on wider displays if card readability remains strong

Tablet:

- approximately 2–3 columns

Mobile:

- 1–2 columns depending on viewport width

Use normal wrapping grid behaviour rather than horizontal movie carousels.

---

# 15. Movie Cards

Movie cards use a consistent poster-led composition.

Available content:

- poster
- title
- description
- genre
- director
- favourite state/action
- View Details

Do not display metadata that does not exist in the backend.

## Card Surface

Use a warm ivory/cream surface visibly separated from the parchment canvas.

Cards should feel like editorial objects placed on the page rather than dark
streaming tiles.

Use:

- subtle warm border
- restrained shadow where useful
- consistent radius
- generous but controlled internal spacing

## Poster

Use a consistent approximately 2:3 movie-poster presentation.

Use `object-fit: cover` or equivalent where necessary while avoiding obvious
distortion.

Actual application poster imagery must be used.

Do not reproduce fictional poster UI or generated playback controls appearing
inside Stitch reference artwork.

## Card Information Hierarchy

Recommended order:

1. poster
2. title
3. genre
4. director
5. short description where space permits
6. actions

Descriptions may be visually truncated on library cards to maintain consistent
card proportions.

The complete description remains available on the detail screen.

## Card Actions

Provide:

- View Details
- favourite toggle where appropriate

Favourite state must not rely solely on colour.

Provide an accessible label such as:

- Add to Favorites
- Remove from Favorites

## Hover

Hover may introduce:

- slight elevation
- subtle border emphasis
- restrained tonal change
- very small transform if appropriate

Avoid large zoom effects that cause layout collision.

---

# 16. Movie Detail

Desktop uses a strong two-column composition.

## Left

- prominent poster

## Right

- movie title
- description
- genre
- director
- favourite action

The content panel should use the Warm Editorial surface hierarchy rather than
inventing metadata to fill space.

Do not add:

- playback
- trailers
- ratings
- cast
- technical badges
- awards
- runtime
- release year
- multiple genres unless supported by the data model

The application currently represents one genre per movie.

Movie Detail is routed at `/movies/:movieId`, resolved from the movie catalog
by ID. View Details links do not open a dialog. When available, the full genre
description and director biography appear inline beneath the primary metadata.
Back to Movies appears above the detail composition and routes to `/movies`.

## Mobile

Stack:

1. poster
2. title/content
3. actions

Poster dimensions must not overwhelm the viewport.

---

# 17. Profile

The profile page should clearly separate:

1. account information
2. account editing
3. favourite movies
4. destructive account actions

## Account Information

Display actual stored user information only.

Examples:

- Username
- Email
- Birthday where available

Do not introduce:

- avatar
- membership date
- account tier
- statistics
- viewing history
- archive terminology

## Update Account

Fields:

- Username
- Password (required for every Angular account update)
- Email
- Birthday

Primary action:

- Save Changes

The current Angular/backend contract requires a non-empty Password for every
update; the Angular form retains its minimum of 5 characters. Users may enter
the current password to keep it or a new password to replace it. This differs
from the React reference's optional-password behavior. Username, Email, and
Birthday retain the existing Angular form requirements.

Account Information and the always-visible Update Account panel sit side by
side from 1024px and stack below that width. Favorite Movies spans the full
width beneath them, followed by Danger Zone. User and catalog loading are
independent, so catalog failure does not hide account information. Returned
server users are authoritative and persisted; username changes retain the
valid token rather than forcing logout.

## Favorites

Display favourite movies using the shared movie-card language.

Profile reuses the same MovieCard as Library, with h3 card titles beneath the
Favorite Movies h2. Loading, account/catalog errors, no favorites, and unresolved
favorite IDs have distinct states. Successful removal immediately reflects the
returned membership; failed removal preserves the movie and offers inline
feedback. Page-scoped favorite services fetch fresh membership on entry.

Use simple product language such as:

**Favorite Movies**

Optional supporting copy may say:

**Movies you've added to your favorites.**

Do not use phrases such as:

- archival collection
- curated collection
- high-priority collection

Do not invent favourite statistics or saved-title counts unless deliberately
required by the application.

## Danger Zone

Delete Account belongs in a clearly separated destructive section.

This section should use:

- `danger-subtle` background or equivalent warning surface
- danger-coloured border/accent
- explicit heading
- brief neutral explanation
- clearly destructive button

The destructive action must be visually distinct from the burgundy
**Save Changes** action.

Delete Account opens a named/described Angular Material confirmation dialog
with Cancel-first focus, trapped keyboard focus, safe Escape cancellation,
and focus restoration on cancellation. While deletion is pending, duplicate
requests and dismissal are blocked. Only successful API deletion clears the
application session keys and navigates to `/login`. Failure retains the
session and dialog with persistent safe feedback and retry.

---

# 18. Application States

Every data-driven screen must account for:

## Loading

Use restrained loading indicators or skeletons appropriate to the content.

Avoid layout shifts where practical.

## Empty

Examples:

- no movies match search
- no favourite movies

Explain the state and, where useful, provide a relevant next action.

## Error

Provide a concise user-facing message.

Do not expose raw server/database errors.

## Pending Actions

Disable or otherwise guard repeated submissions while requests are pending.

---

# 19. Accessibility

Accessibility is part of the design system, not a later styling pass.

Requirements:

- WCAG-conscious text contrast
- keyboard-operable navigation
- visible `focus-visible` treatment
- semantic headings
- persistent form labels
- accessible error associations
- descriptive button labels
- minimum practical target sizes
- meaningful favourite-state labels
- colour must not be the sole indicator of state
- destructive actions must be clearly identifiable
- reduced-motion preferences must be respected

Warm, muted colours must not be allowed to reduce functional contrast.

Hover-only information must never be required to understand or operate the
interface.

---

# 20. Motion

Motion should be restrained.

Recommended:

- 150–250ms interface transitions
- subtle elevation/transform on movie cards
- colour/border transitions on controls
- no large page animations
- no autoplay visual effects

Respect:

`prefers-reduced-motion`

Functionality must remain understandable without animation.

---

# 21. Responsive Behaviour

Current layout values:

- shared content cap: 1440px
- page gutters: 16px; 32px from 640px; 48px from 1024px
- mobile navigation disclosure below 640px
- movie grid: 1 column; 2 from 480px; 3 from 768px; 4 from 1024px
- detail columns from 768px; poster cap 320px stacked and 420px desktop
- Profile account panels split from 1024px
- auth panel cap: 448px; dialog cap: 448px with 16px viewport gutters
- card title clamp: 2 lines; synopsis excerpt clamp: 3 lines

## Mobile

- compact header/navigation
- authentication card becomes near-full-width
- movie grid reduces appropriately
- detail page stacks
- profile sections stack
- forms use full available width
- buttons remain easily tappable

## Tablet

- intermediate movie grid
- detail may remain two-column where space permits
- profile can transition between stacked and split layouts

## Desktop

- full navigation
- multi-column movie grid
- two-column detail
- structured profile layout

The Angular implementation should remain structurally equivalent to the React
implementation at equivalent breakpoints even though their styling
implementations may differ.

---

# 22. Angular Implementation

Implement the design idiomatically within the existing Angular application.

Preserve the technically refactored Angular architecture unless a change is
genuinely required for the UI implementation.

Do not rewrite application functionality merely to accommodate the design.

## Angular Material

Angular Material may continue to provide:

- accessible interaction primitives
- form behaviour
- dialog behaviour
- controls already appropriately used by the application

However, default Angular Material appearance is not the visual authority.

Material components should be themed or wrapped as necessary to express the
Warm Editorial design system.

Avoid producing a UI that looks like an unmodified Angular Material demo.

## Styling

Prefer reusable design tokens and shared component styles over repeated raw
values.

Where practical, expose the semantic palette through CSS custom properties or
the application's established theme architecture.

Example:

    --color-canvas
    --color-surface-1
    --color-surface-2
    --color-text-primary
    --color-text-secondary
    --color-primary
    --color-primary-hover
    --color-focus
    --color-danger

Component styling should consume semantic roles rather than duplicate hex
values.

Do not introduce an unnecessarily complex theming framework solely for this
portfolio project.

---

# 23. Relationship to the React Design

The Angular and React applications intentionally share:

- information architecture
- page layouts
- typography
- spacing
- card geometry
- poster proportions
- responsive behaviour
- interaction patterns
- functionality

They intentionally differ in visual identity.

The Angular implementation uses:

**Warm Editorial**

The React implementation uses:

**Cinematic Obsidian**

The distinction should be immediately visible in screenshots while the shared
product architecture remains obvious on closer comparison.

Do not introduce structural differences merely to make the Angular application
look different.

---

# 24. Stitch Reference Guidance

The approved Warm Editorial Stitch screens are visual references, not
production specifications or production code.

Useful reference qualities include:

- parchment canvas
- ivory cards
- burgundy primary actions
- warm surface separation
- dark warm typography
- restrained editorial character
- movie-poster emphasis
- profile Danger Zone treatment

Ignore unsupported content generated by Stitch.

In particular, do not reproduce:

- Cinéma Archive or similar alternate branding
- archive terminology
- fictional footer/company copy
- multiple genres
- avatars
- playback controls
- metadata not supplied by the backend
- generated poster UI
- saved-title statistics
- fictional collection descriptions

Stitch-generated HTML must not be transplanted wholesale into the Angular
application.

Implement the approved design using the application's existing Angular
architecture.

---

# 25. Source-of-Truth Priority

When implementation sources disagree, use this priority:

1. actual supported application functionality and backend contract
2. this `DESIGN.md`
3. approved Warm Editorial Stitch screens
4. original application screenshots
5. Stitch-generated HTML or CSS
6. exploratory Stitch output

Unsupported functionality appearing in a Stitch mock-up must not be
implemented merely because it appears visually.

---

# 26. Approved Screen Set

The Warm Editorial system covers:

- Login
- Signup through the shared authentication system
- Movie Library
- Movie Detail
- User Profile

Additional application states should derive from the same components and
tokens rather than introduce independent visual systems.

---

# 27. Implementation Acceptance Criteria

The Angular UI implementation is complete when:

- the Warm Editorial palette is consistently applied
- page canvas and card surfaces are visibly distinct
- no major area falls back to default Angular Material styling
- Login follows the approved authentication composition
- Movie Library uses the approved poster-led responsive grid
- Movie Detail uses the approved two-column desktop composition
- Profile clearly separates details, editing, favorites and Danger Zone
- navigation is consistent across authenticated screens
- Logout is readable in all states
- primary and destructive actions are clearly distinguishable
- only backend-supported movie and user data is displayed
- no Stitch-invented functionality is introduced
- keyboard focus is clearly visible
- responsive layouts work at mobile, tablet and desktop widths
- loading, empty, error and pending states remain usable
- existing application functionality continues to work
- the implementation remains recognizably equivalent in structure to the React
  application while being immediately distinguishable through its Warm
  Editorial visual identity

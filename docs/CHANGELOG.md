# Changelog

## 2026-09-20 - Minimal-Footprint App Upscale Pass
- Replaced the session summary stroke score ring with a local editorial slosh gauge that preserves the 12-point score while using rose liquid fill, hard hairline vessel styling, and no shadow.
- Restyled dashboard stat cards to flat `#1A1220` panels with `#3A2E42` hairline borders, borderless muted glyphs, and value-only accent color.
- Converted difficulty, session score, and insight rating pills from filled rounded badges into tracked uppercase labels with single hairline underlines.

## 2026-09-20 - Warm-Noir Editorial Auth Screens
- Rebuilt sign-in and create-account screens around the landing page's therapeutic editorial direction: asymmetric left-column layout, hard-corner printed panel, hairline borders, grain/depth background, and left-aligned caption footer.
- Added shared `AuthPracticePass` strip with rotating type-in reassurance copy under the auth tagline.
- Reused the landing `GlareButton` for auth CTAs and replaced rounded-card/shadow styling with flat rose CTA treatment.
- Restyled inputs with flat fills, no default focus glow, and a restrained rose underline focus state.
- Converted signup password requirements into a vertical dash-led checklist with muted blue-grey satisfied state and enforced the uppercase rule in validation.

## 2026-09-20 - Warm-Noir Literary Editorial Landing Page Redesign
- **Therapeutic Editorial Aesthetic**: Completely reimagined the landing page as a literary publication / print psychology journal experience (referencing *Granta*, *The Believer*, and dark-academia mastheads).
- **Asymmetric 12-Column Hero Grid**: Replaced centered hero layout with a 12-column asymmetric grid pairing 76px tight-leading `Fraunces` serif headlines with a bespoke overlapping **Rehearsal Ticket** component (columns 8–12).
- **Bespoke Rehearsal Ticket**: Crafted a cream cardstock (`#F2EBDD` / `#14111C`) perforated index card with jagged torn edges, scenario tabs (Executive Interview, Workplace Tension, Boundary Negotiation), and live organic typing preview with blinking cursor.
- **Marquee Clipping Strip**: Built an infinite dialogue texture band of real rehearsal dialogue fragments styled as vintage torn newspaper clippings.
- **Case Index (Methodology)**: Replaced generic 3-column feature cards with a single-column numbered Case Index (01, 02, 03) featuring serif sub-headlines, detailed rationale, and hairline dividers.
- **Full-Bleed Pull-Quote**: Added large italic `Fraunces` philosophical quotation section with accent hairlines and department citation.
- **Readiness Gauge**: Integrated an interactive printed instrument dial with fluid/liquid horizontal slosh meter, calibrated tick marks (0 to 100%), and 3-stage rehearsal milestone progression (Initial Take, Second Pass, Rehearsed State).
- **Restrained Motion & GlareHover**: Added subtle glare sheen hover interaction on primary buttons, background paper/film grain texture overlay, and line-staggered scroll reveals.
- **Design Tokens & Colors**: Preserved the exact Quiet Night warm charcoal `#16151A` base, plum `#A85C8C`, cream ink `#EDEAE4`, and hairline `#2E2D34` border tokens.

## 2026-09-20 - Round 4 UI Polish & Responsiveness Fixes
- **Item 1 (Comfort Controls in Settings & Navigation Cleanup)**:
  - Moved Comfort controls fully into SettingsView (`Text Size`, `High Contrast`, `Reduced Motion`, `Conversation Pacing`).
  - Added early inline pre-paint initializer in `index.html` to prevent theme flash on initial load.
  - Defaulted Motion to Reduced on first launch if OS reports `prefers-reduced-motion`.
  - Cleaned sidebar and top-bar navigation to exactly 4 fixed tabs (`Dashboard`, `Scenarios`, `Progress`, `Settings`), highlighting Scenarios during Practice.
  - Added visible 12px text labels, `aria-label`, and `aria-current` to all navigation items.
  - Removed deprecated floating `ComfortPanel.tsx` and unstyled comfort modal buttons.
- **Item 2 (Remove Quiet Space Card)**:
  - Removed Quiet Space card from sidebar across desktop, tablet, and mobile views.
- **Item 3 (Scenarios "Good Place to Start" Card & 2-Column Grid)**:
  - Converted the recommendation banner into a cohesive card container with icon medallion, title, duration, description, and primary gradient CTA.
  - Responsive scenario list: 2 columns on >=1024px and 1 column below, with full keyboard focus-visible outlines.
  - Changed empty practice redirect to `?redirect=no_session`, displaying a calm line-icon notice instead of emojis.
- **Item 4 (Unfinished Practice Sessions Recovery & Logbook)**:
  - Implemented client-side unfinished session tracking per Cognito user ID with 3-session cap.
  - Added slim top banner on Scenarios view when an unfinished session is pending.
  - Added logbook section on Scenarios view with "Started [Date] · Turn X of 30", primary "Resume" button, and secondary "Discard" button with confirmation modal.
  - Featured Dashboard card dynamically switches to "Continue practice" when an unfinished session exists.
  - Added graceful inline error notice with "Remove it" button if backend session restore fails.
- **Item 5 (Progress Rhythm & Shared SessionRow Component)**:
  - Standardized page rhythm across views: 24px below header blocks, 16px between cards, 48px between sections.
  - Created shared responsive `SessionRow.tsx` component: table-like 4-column layout on wide screens, stacked card with full-width secondary "Practice again" button on mobile (<768px).
  - Fixed pluralization for streak ("1 day" vs "2 days"), removed "+N total" pill, and updated subtitle copy to "Your most recent practice sessions."
- **Item 6 (Unified StatCard Family & Local XP Calculation)**:
  - Unified all stat cards (`Practice streak`, `Sessions completed`, `Practice XP`) into a single component family with circular icon medallions, faint dashed rings, tinted gradient surfaces, large serif numbers, labels, and clean helper lines without empty pills.
  - Layout: 3 cards in a row from 640px, compact stacked below 640px. Hidden with friendly first-run welcome card when 0 sessions are completed.
  - Computed "XP today" and streak strictly by user's local calendar dates.
  - Cleaned Dashboard order: greeting & level widget → stat strip → single featured card → recent session row with "View all sessions". Removed duplicate "Start Practicing" button from header.
- **Item 7 (UI Bug Fixes & Encoding Consistency)**:
  - Fixed middle dot encoding in PracticeView header (`· {persona.role}`).
  - Fixed listening notice bullet encoding (`● Listening...`).
  - Removed duplicate "Rehearsal Insights" header from Insights screen.
  - Verified Settings display name Save button with 30-char limit, plain text rendering, and true storage disclosure.
  - Positioned completion notice below chat container to prevent message overlapping on 390px mobile screens.
- **Settings Buttons Styling Fix**:
  - Implemented shared global `.dashboard-btn`, `.dashboard-btn--primary`, and `.dashboard-btn--secondary` button styling matching design tokens (radius, borders, primary plum, secondary transparent/subtle, focus-visible rings) for the "Save" and "Reset to defaults" buttons in the Settings Tab.
- **Practice Confirmation Popup Modal Fix**:
  - Restored `.comfort-modal-overlay`, `.comfort-modal-card`, `.comfort-modal-header`, `.comfort-modal-title`, `.comfort-modal-close-btn`, `.comfort-modal-desc`, and `.comfort-modal-footer` CSS classes in `Dashboard.css`.
  - Fixed "Finish & get feedback" confirmation dialog so it renders as a centered popup modal with dark blur backdrop (`position: fixed`, `inset: 0`, `z-index: 1000`, `backdrop-filter: blur(6px)`) rather than inlining at the top of the chat view.
  - Aligned close button and title in the modal header and updated action buttons to shared `.dashboard-btn--secondary` and `.dashboard-btn--primary`.
- **Insights & Summary "Back to Dashboard" Navigation Fix**:
  - Fixed route resolution in `App.tsx` and tab normalization in `Dashboard.tsx` (`handleTabNavigate`) so path strings (`/app`, `/app/scenarios`, `/app/progress`, `/app/settings`, `/app/practice/:id`) correctly map to internal tab states without corrupted target paths or stale session restore overrides.
  - Added fallback popstate dispatch to "Back to Dashboard" buttons in `PracticeView.tsx` and added quick return button to the session Summary view.

## 2026-09-19 - "Quiet Night" UI Redesign
- **Landing Page**: Completely revamped the public landing page to use the Quiet Night theme (charcoal, plum, sage). Removed all legacy blue/navy colors. Updated copy to reflect the app's true mechanics (no pressure practice, structured feedback). Added a 3D tilted preview card on desktop to demonstrate the AI conversation interface.
- **Auth Screens**: Unified logo with app sidebar, improved accessibility (aria-pressed), styled browser autofill to retain dark theme, added optional display name to signup, and removed non-functional forgot password links.
- **Auth Screens**: Removed disabled Google button for cleaner UI.
- **Distinctive UI**: Added soft gradient tokens, unified card border radii to a single scale, and implemented a CSS 3D tilted hero card on the desktop dashboard for Hackathon UI Prize Track.
- **Design System**: Established "Quiet Night" foundation with warm charcoal `#16151A`, subtle elevated surfaces `#1F1E24`/`#232228`, jewel-tone plum `#A85C8C`, sage green `#6E9B7D`/`#79D193`, and editorial `Fraunces` serif headings.
- **Practice View**:
  - Persona header badge with character initials, character name & professional role.
  - "Your Goal" focus prompt and collapsible "Scenario Tips & Guidance" accordion.
  - Scenario switcher modal replacing raw `<select>` dropdown.
  - Conversational pacing delay (relaxed 1.2s, moderate 0.6s, instant 0s) integrated into message delivery with "{Character} is thinking..." indicator.
  - Session turn counter ("Turn X of 30").
  - Confirmation dialog on "Finish and get feedback" to prevent accidental early session termination.
  - Complete Rehearsal Insights breakdown with 4 dimension cards (Clarity, Tone, Responsiveness, Composure) and executive summary.
- **Sensory Comfort Mode**: Added persistent `data-text-size="large"`, `data-contrast="high"`, and `data-motion="reduced"` attributes applied directly to `<html>`.
- **Scenario Cards & Icons**: Hand-drawn bespoke SVG icons for all 7 scenarios with 2-line title wrapping and WCAG AA compliant difficulty badge contrast.
- **Settings View**: Redesigned with grouped cards, conversational pacing explanations, accessibility toggles, and default reset.

## 2026-09-19 - Multi-dimension qualitative feedback redesign
- Replaced numeric score ("Score: X/10") with a 4-dimension qualitative breakdown (`clarity`, `tone`, `responsiveness`, `composure` with ratings `strong` | `developing` | `needs practice` and transcript-specific notes) in `backend/lambdas/generate-feedback/index.ts`.
- Structured feedback into "What Went Well", "Practice Focus", and a warm "Encouragement" closing sentence.
- Instructed Bedrock to provide constructive, non-judgmental coaching even on rude/hostile dialogue.
- Redesigned session completion UI in `PracticeView.tsx` with bespoke cards, badges, and neutral tone-shift colors matching the charcoal/plum aesthetic without judgmental red/green grading.

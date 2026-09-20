# Reference study: shwn.design

Inspected 2026-09-20 at https://www.shwn.design/ and https://www.shwn.design/projects using the Codex browser and public deployed HTML/CSS/JavaScript. This is research for an original portfolio, not a source-code clone.

Evidence labels: SOURCE = confirmed in deployed code or measured DOM; PARTIAL = visible behavior confirmed but complete implementation or provenance unverified; GUESS = proposal or inference.

## Confirmed direction

- Start over from the current cinematic laptop concept.
- Audience: opportunities combining design and engineering.
- User particularly likes the reference's compact navigation, arrangement of work, sound effects, and koi pond, and wants the overall combination with a personal twist.
- Signature scene, personal identity, and featured projects remain open questions.

## Visual system

- SOURCE: body background is rgb(251, 251, 251). Intro paragraphs and heading use Public Sans, 15px, weight 500, 22.5px line-height. Prototype labels use 15px/20.625px. The heading is deliberately the same scale as prose.
- SOURCE: a desktop site-scale function uses viewport width / 1710, clamped to 0.8–1.5, on fine-pointer viewports at least 1024px wide; otherwise 1. At the inspected 1390px viewport this scales the design to about 81%, making nominal 15px type appear about 12.2px.
- SOURCE: the highlighted role has an interactive type toolbar with Public Sans, Caveat, and Playfair Display options, bold/italic controls, and a style picker. Other embedded demos use their own fonts, including Figtree and Geist Mono.
- PARTIAL: narrow centered introduction, extensive vertical whitespace, softened pond boundary, gray prototype stages, realistic material surfaces, and soft contact shadows. Personality comes from interactive objects and small details.
- PARTIAL: desktop home prototype gallery is a horizontal shelf, with arrow navigation and interactive demos. Gallery progressed during scrolling; precise wheel arbitration was not fully tested.

## Structure and behavior

- PARTIAL: floating icon navigation switches Home and Projects; active icon sits in a larger white circular surface. Deployed code contains SVG goo filters and spring parameters for navigation.
- PARTIAL: Home contains pond, compact personal introduction/contact, 13 prototype examples, and a quiet footer with a live clock.
- PARTIAL: Projects initially shows three overlapping, slightly rotated textured cards with pin/clip/cursor decoration. Selecting Dot Matrix brings its card forward and expands a centered detail view; other navigation disappears while focused. Back restores the card overview.
- PARTIAL: detail view includes title, external link, metadata chips, a short account of motivation and implementation, reported usage, and a collage of screenshots/handwritten annotations.
- PARTIAL: checked a narrow viewport, but the browser override produced inconsistent viewport/screenshot sizing. Do not treat this as complete mobile validation.

## Implementation and motion

- SOURCE: Next.js/React deployment with Turbopack chunks and Next image/font resources. Motion animation runtime and motion components appear in bundles. Tailwind-style utility output and Base UI identifiers appear; exact package versions and original dependency manifest remain unverified.
- SOURCE: motion system includes staggered reveal slots, opacity/blur/translation, spring transitions, shared layout identifiers, measured-size animation, and reduced-motion hooks.
- SOURCE: navigation springs include stiffness 355–380 / damping 38. Some menus use lower stiffness and 3D rotation with blur. These are reference observations, not values to copy blindly.
- SOURCE: the pond explicitly requests WebGL2 and floating-point color-buffer support. Shader code includes ripple simulation, caustic lighting, fish rendering, stone occlusion, and shadow computation. This is a custom graphics component, not simply a looping video.
- PARTIAL: fish animate visibly. Accessible canvas description identifies tap-water ripples and tap-fish startle behavior; those reactions have not yet been individually verified.
- SOURCE (follow-up code inspection): pointerdown maps viewport coordinates into pond coordinates and hit-tests fish. A fish hit invokes scare and splash; water hits invoke splash, drop, and disturbance of nearby fish. Pointermove emits smaller splashes/disturbance only during a press/drag and after at least 8 pond-coordinate pixels of travel. Pointerup/cancel ends the drag. Ordinary unpressed hover is not the trigger in the inspected code.
- SOURCE: pointer-linked transforms and radial-gradient glare appear in the introductory effects. Paper texture is preloaded. Visual depth combines rendering, textures, shadows, transforms, and overlapping elements.

## Sound

- SOURCE: custom Web Audio synthesis using oscillators, filtered noise, gain envelopes, delay/feedback, and a dynamics compressor. Cue definitions include tick, press, release, toggle, success, error, page, droplet, chime, and other tonal variants.
- SOURCE: interaction hooks support pointer and keyboard activation, with a user-activation gate and AudioContext resume. Controls can select cues through data attributes.
- PARTIAL: sound implementation and triggering logic verified from deployed code. Exact perceived loudness/timbre was not audited by listening; embedded music/media playback is separate and not fully inspected.

## Source and reuse

- No authentic repository or reuse license was located in this bounded inspection. Public deployed assets were inspected for learning only, in temporary storage outside the project.
- Build original components, assets, audio cues, and artwork. No reference code or media has been added to the application.
- Detailed deployed evidence: /_next/static/chunks/0eakge4f1zjt..js (scale/reveals), 0ywjcqht62w9t.js (audio/navigation), 0intq8qychnb7.js (intro/pond/gallery), 0w81-eaxid~sr.css (styles/fonts). Chunk names may change on redeployment.

## Current workspace

- React 19 + TypeScript + Vite, procedural Three.js laptop hero, Instrument Sans and Playwrite Tanzania fonts.
- Current files are untracked in Git; a Git branch alone would not preserve them. Before replacement, archive the existing source, configuration, documentation, and license files outside the active app build.
- No existing implementation was removed or changed during this research.

## Microinteraction reference — September 20, 2026

User-selected reference for small interactions going forward: https://github.com/fayazara/portfolio-site-template (resolved from https://t.co/LrTSaaKnCF).

Reviewed `src/components/Folder.astro`: spring-driven card fans, restrained press scaling, quicker closing than opening, individual card focus with neighboring cards yielding, and transitions continuing from the current visual position. Use these techniques as inspiration for this portfolio's small interactions while preserving its linen scene, understated styling, keyboard/touch support, and reduced-motion behavior. Shawn's site remains the reference for inline dotted cues and subtle hover previews. This reference selection does not request a framework migration or a replacement of the current layout.

## Corner treatment — September 20, 2026

User requests https://corne.rs for curves going forward. The site provides Lisse, a continuous squircle corner library with React bindings (`@lisse/react`), per-corner control, borders, and shadows. Use Lisse for rounded interface surfaces when implementing or revising them; preserve intentional circles and the physical geometry of the linen scene. Documentation: https://github.com/JaceThings/Lisse/wiki. This records the chosen tool; it has not yet been installed or applied to existing components.

Lisse is now installed and applied through `src/components/SmoothSurface.tsx` to hover photo frames, the question popover, work cards, and project hero images. Smoothing is shared at 0.6 with modest surface-specific radii. Clipping is on inner visual surfaces so outer controls retain focus outlines and silhouette shadows. Verified generated paths and card dimensions in the browser; build and lint pass.

## Project shared-element transition — September 20, 2026

- SOURCE: frame sampling in the Codex browser confirmed that selecting a project straightens and lifts the chosen card while the rest of the pile recedes, then expands the same card into the detail hero. The write-up and back control resolve from blur beneath it; closing runs the spatial move in reverse.
- SOURCE: the deployed project bundle uses a shared `layoutId` in the form `project-picture-${slug}` for the stack card and detail hero. Its layout transition is a spring with a nominal 0.8 second duration. The backdrop enters over 0.3 seconds, the write-up exits over 0.15 seconds with blur, and reduced-motion hooks remove the spatial animation.
- SOURCE: the back control is part of the revealed detail article, while the large hero itself remains a close target in the reference. The local version keeps a single explicit back control to match this portfolio's page model and avoid a hidden full-hero close affordance.
- PARTIAL: precise spring physics can vary with frame rate and browser timing. The local implementation matches the observed sequence and spatial relationship with the native View Transitions API and a 720ms ease-out-quint-style curve rather than copying the reference's proprietary component code.
- The local implementation now gives all three project covers a shared transition into a consistent detail hero, staggers the back/copy/body reveal, reverses into the exact originating card, keeps the navigation stable, restores focus, supports direct hash URLs, and bypasses motion when `prefers-reduced-motion` is active.
- Verification: sampled open/close frames on desktop, checked each of Lyra Plus, Legensy, and A little room to breathe, repeated the reverse transition at a 390 × 844 viewport, confirmed no horizontal overflow, confirmed focus restoration, and found no browser console warnings or errors. Typecheck, lint, and production build pass.

## Project information hierarchy — September 20, 2026

- SOURCE: the reference detail order is selected visual, a narrow back rail beside a compact project identity, a short metadata-chip list, one concise narrative, then annotated project imagery. The project identity contains a small visual mark, title, and destination URL when one exists.
- The portfolio now follows that hierarchy with original content: shared project hero, back rail, numbered chapter marker, project name and category, note chips, then a combined lead and narrative followed by the project's available media or action.
- No dates, external URLs, usage claims, or other missing metadata were invented. The numbered markers communicate sequence without pretending to be project dates.
- Verification: inspected Lyra Plus and Legensy at the desktop breakpoint and Lyra Plus at 390 × 844, confirmed semantic heading/list/paragraph order, three metadata chips per project, retained Legensy gallery and film, no horizontal overflow, and no browser warnings or errors. Typecheck, lint, and production build pass.

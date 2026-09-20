## Story / Work update

The full user-supplied story, interactive words, three-image Legacy fan, Work collection/detail views, and personal footer are implemented. Awaiting real Legacy photographs and verified project/open-source URLs; do not treat preview illustrations or the empty repository section as completed content. See STORY-WORK-CHECKS.md.

# Jordi portfolio — working direction

Status: Linen-window concept implemented as a new study; the user is still evaluating the signature concept. Project content and further personal details remain open.

## Current study: linen window

A real 3D brass pole and wall-mounted brackets, two simulated linen panels, and a slightly open window. Shared scene lighting and shadows establish depth; a final pass adds grain, highlight glow, edge blur, and feathering. Wind depends on the window angle; dragging deforms the cloth. Reduced motion, pause, offscreen suspension, keyboard breeze, and a WebGL fallback are implemented. See LINEN-VERIFICATION.md for evidence and limits. The bloom source and complete prior snapshot are archived outside the project.

## Superseded exploration: Jellyfish Bloom

Previous decision: the user requested a jellyfish bloom with the aesthetic of the reference koi pond and constant autonomous movement. Implement a compact, softly feathered rectangular underwater scene: green water, moving sun caustics, six translucent jellyfish with pulsing bells and trailing tentacles, pointer-driven avoidance, and tap ripples. Retain the header/footer blur and compact navigation. Original WebGL2 water shader plus Canvas 2D jellyfish rendering; WebGL failure falls back to a gradient while jellyfish remain animated. Night Flight is archived outside the active source tree.

### Superseded exploration: Night Flight

The user selected Night Flight: rain on an airplane window, distant city lights, a blinking wing light, and occasional cloud breaks. The initial implementation includes an original procedural Canvas 2D scene, CSS window frame, pointer parallax, draggable/keyboard-operated shade, optional synthesized cabin sound and chimes, and a pause control. The prototype uses a home/focused-scene navigation and graduated header/footer blur. The introduction is draft copy for review, not a finalized biography.

Canvas 2D was chosen for this layered scene instead of the previously proposed Three.js/WebGL approach. It supports the required depth and motion without shipping the former 3D runtime. City and cloud textures are generated locally once per renderer instance. The archived laptop is outside the active project.

## Experience

A quiet personal portfolio with a compact floating navigation, one original interactive scene, and tactile layered project cards. Emphasize both design judgment and engineering execution. Keep the reference's restraint and sense of physical interaction while creating an identifiable personal visual language.

User refinement: the soft blur at both the header and footer is an explicit priority. Include graduated edge blur in the visual direction, with clear navigation and content readability preserved.

## Proposed structure

1. Home: compact navigation; signature scene; short introduction; selected work preview; contact and understated footer.
2. Work: a composition of 2–4 layered project cards. Each opens a readable case study with problem, role, key design decisions, engineering choices, and evidence of the result.
3. Optional small experiments shelf, only when there is real work to show. Do not invent projects to fill space.

## Decisions to resolve with the user

- Evaluate the linen-window study before committing to the signature concept.
- Name, professional title, palette, and interests to ground the personal twist.
- Which projects to feature and available screenshots, demos, and outcomes.
- Sound palette and default preference; proposed baseline is subtle interaction sounds, a visible mute control, remembered preference, and no automatic background music.
- Whether the first release needs separate About/contact sections or a concise introduction and contact link suffice.

## Build sequence

1. Archive the previous implementation, including untracked work, before replacement.
2. Define typography, content width, spacing, materials, lighting direction, and a restrained accent palette. Start at 15–16px readable body type without scaling the entire document.
3. Build one vertical slice: navigation, introduction, one working project card, its detail view, and a small sound vocabulary. Check the whole interaction at desktop and phone sizes before expanding.
4. Implement the signature scene independently with an inexpensive static fallback, reduced-motion state, and offscreen pause. Choose Canvas/WebGL only if the chosen concept requires it.
5. Populate real projects and optional experiments. Tune card layering, focus transitions, shadows, and responsive arrangements around content.
6. Verify keyboard navigation, visible focus, reduced motion, sound preferences, mobile touch behavior, direct access to project details, loading/fallback states, and runtime performance.

## Tooling proposal

Retain the existing React + TypeScript + Vite foundation unless publishing/content needs justify changing frameworks. Add Motion for coordinated spring/layout transitions. Use CSS/SVG for navigation and physical card surfaces, native Web Audio for original sound effects, and an isolated renderer for the signature scene. Next.js is used by the reference but is not required to achieve its visual or interaction design.

These are architectural proposals, not finalized dependencies or promises of identical effects. All artwork, component code, and sound design should be original or appropriately licensed.

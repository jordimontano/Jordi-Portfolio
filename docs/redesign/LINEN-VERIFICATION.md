# Linen-window study — verification, 2026-09-20

## Requirement audit

| Request | Implementation and evidence |
| --- | --- |
| A 3D pole attached to the wall | Brass cylinder, finials, rings, clips, wall plates, screws, and projecting brackets; visually inspected in desktop and focus views. |
| Linen covering a slightly open window | Two deforming mesh panels and a hinged casement, initially 18 degrees open. Window slider changes the actual hinge angle and wind strength. |
| Continuous breeze | Fixed-step damped cloth simulation; DOM frame count advanced 393 → 486 and sampled cloth depth changed .920 → 1.685 during a drag. Separate solver tests verify sustained autonomous motion. |
| Interaction | Browser drag registered against the cloth mesh and released cleanly; Space registered one gust. Slider Home closed the window to 0 degrees. |
| Sunlight, lighting, and depth | Shared 3D aperture, sill, wall, floor, two shadow-casting lights, environment reflection, translucent linen, and subtle dust. Desktop screenshot reviewed after the final lighting/curvature changes. |
| Edge blur and grain | Full-scene finishing shader applies progressive blur, irregular feathering, fine grain, and restrained highlight glow. Existing progressive header/footer blur retained. |
| Self-verification | Build, lint, numerical cloth checks, browser interaction checks, reduced motion, fallback, and narrow-layout inspection completed. |

## Automated checks

`npm run lint`, `npm run test:cloth`, and `npm run build` pass. Build includes TypeScript checking. Cloth results: idle depth excursion 1.026 scene units; closed depth .550; maximum structural stretch after extreme drag/recovery 1.150; heading anchors stable; all positions finite and bounded. A second run after optimizing constraint distance calculations produced identical results.

Vite reports a size advisory for the lazy-loaded Three.js scene: approximately 552 kB minified / 140 kB gzip. The main React entry is approximately 201 kB / 63 kB gzip. The advisory is retained rather than hidden.

## Browser evidence

- Pause: frame counter remained 630 across separate observations; cloth depth stayed .9884. Changing the slider while paused rendered exactly one update (631), set hinge angle to 0, and left cloth frozen.
- Reduced motion: development override exercises the same stationary branch as the system preference. Frame counter stayed 5 across separate observations; breeze control disabled and static-state explanation visible.
- WebGL fallback: development override displayed the static window, disabled unavailable scene controls, and retained the page/navigation.
- Keyboard: focusing the canvas and pressing Space recorded one breeze. Slider Home set its value and rendered angle to 0.
- Audio: enabling and muting updated the accessible state without an error. Actual listening quality was not assessed through the tool.
- Narrow layout: requested a 390 × 844 viewport; browser reported a 433 CSS-pixel viewport due its current scaling. Document width also 433 (no horizontal overflow); scene width 417, controls 360, introduction 320. The pole and panels fit. Screenshot capture showed a browser compositing artifact outside the content; DOM bounds independently confirmed layout. Physical-phone touch and GPU performance were not tested.
- Desktop focus mode enlarged the scene and hid the introduction; screenshot visually inspected. Viewport override reset afterward. Sound left muted.
- Runtime logs contain only warnings from the earlier renderer at 14:57:11, before the final shadow/environment fixes. No newer warnings or errors were reported during the final interaction pass.

## Limits

This remains a concept study for the user to evaluate. It is not claimed to match the reference’s realism. Thin-fabric lighting is an artistic approximation, not spectral transmission. Cloth has bounded movement and drag reach, but no full self-collision or complete collision against the hinged window. CPU-side frame timing varied by viewport and concurrent work; it is not a GPU or cross-device benchmark. Selected work and contact content are outside this scene iteration.

## City / seamless-background refinement

The beige room rectangle has been removed. Unshadowed wall/floor radiance is inverse-mapped through the renderer's ACES curve to the exact page paper color. Only the room-facing light supplies these receivers' soft shadows, avoiding the large dark wall caused by sunlight behind it. The city view is an original illustrated panorama with atmospheric building layers, fine window details, a stepped spire, and rooftop water tanks. No specific city was confirmed during this pass, so this is an evocative city view rather than an exact place.

Edge blur now increases over a wider border (up to 12 render pixels), with a wider irregular feather. Grain amplitude increased from .017 to .035 and its sampling is stationary, avoiding the earlier 12 Hz noise flicker. The static fallback also uses a city palette.

Display geometry now interpolates between the fixed 60 Hz cloth states; a dedicated 120 Hz test verifies intermediate movement and no overshoot. A conservative fixed bounding sphere replaces the repeated per-frame sphere calculation without removing pointer raycasting. Browser samples after these changes: frame interval 11.6–12.0 ms; CPU work 3.3–3.6 ms. These are observations on this machine, not cross-device/GPU performance claims.

Verified in the browser: city and seamless background visually inspected; slider reaches 32 degrees open and 0 closed; paused frame count remained 4364 across observations; reduced-motion count remained 5; fallback rendered; narrow viewport content width equaled viewport width (433 CSS px under browser scaling); viewport override restored. Console warning/error list was empty in the refinement pass. Full cloth stability and interpolation checks, lint, TypeScript and production build pass. The existing lazy scene chunk-size advisory remains.

## Sunnier city and latch correction

The dark mark identified in the supplied screenshot was the sash latch: its previous local x=-1.19 placed it inside the glass beside the stile. It now sits at x=-1.30, centered on the actual stile, uses the light frame material, and has a smaller profile. City artwork now uses a brighter blue sky, broad sun halo, warm illuminated building faces, cooler shaded sides, less harsh window detail, and afternoon atmospheric light. Glass opacity reduced from .11 to .055. The static fallback uses the corresponding sunnier palette.

Verified: live screenshots at the default angle, fully open, and closed; slider reaches 32 and 0 degrees; console error/warning list empty; lint and production build pass. Existing lazy scene chunk advisory remains. No changes to cloth physics or audio.

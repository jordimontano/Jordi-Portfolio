# Responsive layout audit — September 20, 2026

Scope: home, work gallery, and all three project pages, using the supplied mobile screenshots as the proportion and spacing reference.

## Design verdict

The existing linen illustration, restrained typography, photography, and compact navigation remain coherent. No broad redesign was needed. This pass focused on alignment, readable metadata, and behavior at narrow and short viewport sizes.

## Findings corrected

| Severity | Location | Finding and correction |
| --- | --- | --- |
| Medium | RolePicker.tsx | Menu placement assumed a 172px height although mobile options make it 209px tall. Measure the rendered menu before paint, choose above/below placement, and constrain it to the viewport. |
| Medium | Story.tsx | The identity preview extended below a landscape viewport. Measure previews and clamp placement to available screen space. |
| Medium | story.css | Expanded inline text could paint over its overlapping preview. Place preview surfaces above their triggers. |
| Medium | mobile.css | Fixed edge blur consumed too much of short landscape screens. Reduce the top and bottom overlays and retain 44px navigation/social controls. |
| Low | mobile.css | Window controls capped at 400px while the introduction capped at 440px. Use the same maximum width and allow controls to wrap for enlarged text. |
| Medium | story.css | Project category/status and role-menu label were faint. Darken these secondary labels while preserving the hierarchy. |

## Verification

- Chromium layout sweep: five views at 320×740, 390×844, 430×932, 600×900, 760×900, 768×1024, 1024×768, 1440×1000, and 844×390.
- All 45 combinations: no document overflow, no offscreen content outside the intentional project carousel, and no uncaught browser errors.
- Keyboard and interaction checks: role menu navigation and selection, focus restoration, identity/question/photo previews, carousel navigation, every project’s open/back flow, and footer visibility.
- Enlarged home text at 320px: controls wrap and document width stays within the viewport.
- Normal-motion project transition: completed successfully, with the expected project displayed.
- Production build and lint pass. Vite still reports the existing size advisory for the dynamically imported Three.js scene bundle.

## Limits

Checks use desktop Chromium with resized viewports, including reduced-motion and normal-motion paths. This is not a physical iPhone/Safari certification. The site retains its fixed edge-blur treatment, which intentionally softens content entering/leaving the viewport.

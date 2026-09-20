# Jordi’s portfolio — A little room to breathe

An original interactive 3D linen-window study. Two curtains hang from a wall-mounted brass pole, billow in air from a slightly open casement, and respond to dragging. The quiet portfolio shell retains compact navigation and graduated header/footer blur.

## Run locally

Node.js 22.13 or newer.

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000.

## Interactions

- Curtains move continuously. Drag a panel and release to let it settle.
- Adjust the window slider to change the casement angle and wind strength.
- Press “A little breeze,” or focus the scene and press Space/Enter, for a gust.
- The Work navigation button opens the project collection.
- The gray profile silhouette in the navigation jumps to Jordi’s introduction. Room audio is disabled.

## Implementation

React, TypeScript, Vite, and a dynamically loaded Three.js renderer. Display positions interpolate between physics updates for smooth high-refresh rendering. Both cloth panels use fixed-step Verlet integration with structural, shear, and bend constraints, pinned headings, damped motion, and bounded pointer pulls. The window, pole, brackets, rings, sill, wall opening, and floor are geometry in one lit scene. Linen has procedural weave, bump, sheen, and approximate thin-fabric backscatter. Shared shadows, tone mapping, gentle highlight glow, page-matched shadow receivers, wider edge blur/feathering, and steady fine grain finish the rendered scene.

This is an art-directed real-time study, not a physically exact textile or airflow model. Fabric translucency and backscatter are approximations; the solver uses scene bounds rather than complete self-collision or casement collision. The city panorama is an original procedural texture with atmospheric towers, detailed façades, nearby rooftops, and water tanks. It evokes a city rather than claiming an exact geographic view.

The scene animates automatically. Rendering stops while hidden, offscreen, in Work, or when reduced motion is requested. A static CSS illustration handles unavailable WebGL. Resolution is capped at 1.75×. The Three.js scene is a separate lazy-loaded chunk (about 140 kB gzip); Vite flags its uncompressed size above 500 kB.

## Verification

```sh
npm run lint
npm run typecheck
npm run test:cloth
npm run test:audio
npm run build
```

The cloth check exercises continuous idle motion, open/closed wind response, fixed anchors, extreme dragging, release stability, bounds, and excessive stretch. Browser checks and limitations are recorded in `docs/redesign/LINEN-VERIFICATION.md`. Development-only `?motion=reduce` and `?webgl=off` exercise reduced-motion and fallback branches without changing system settings.

Earlier concepts are preserved outside the active project in `../Portfolio-archives/`, including the complete pre-curtain snapshot `before-linen-curtains-20260920-104909.tar.gz` and `jellyfish-bloom-source/`.

The story now follows Jordi’s supplied account of sneaker reselling, Legacy, his focus on why, and Lyra Plus. Interactive Legacy/why words and the Work tab are implemented. Work contains truthful descriptions of Lyra Plus, Legacy, this window study, and the open-source Claudex project, with deep links and responsive layered cards. See `docs/redesign/STORY-WORK-CHECKS.md`.

On page load, an intro on the site’s off-white background renders Jordi Montano in the site’s soft charcoal using self-hosted Pixelify Sans. One shared animation clock unfolds adjacent letters into pixel bonds, moves through 2–4 contour poses, and folds the name home before revealing the portfolio (roughly 3–4 seconds). Skip intro opens the page immediately; reduced motion shows the still name briefly. The canvas pauses while hidden or offscreen, adapts both lines to the viewport, and cleans up when dismissed.

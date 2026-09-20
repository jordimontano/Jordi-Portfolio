# Reference execution review

Reference: https://www.shwn.design/ — revisited in the browser and compared with the current local bloom on 2026-09-20. Reference implementation findings come from its public deployed `0intq8qychnb7.js` bundle; no original repository was located. SOURCE means code verified; PARTIAL means a visual interpretation supported by browser observation.

## Verdict

The current bloom is an effect prototype, below the reference's finish. Its patterned background, bright outlines, and repeated bell silhouettes read as a procedural illustration. The reference reads as a coherent miniature environment. The layout, autonomous movement, and interaction entry points are useful foundations, but superficial polish cannot close the rendering gap.

## What the reference does particularly well

1. SOURCE: shared water state. It maintains water-height/velocity textures, advances them from neighboring samples, damps waves, and accepts both touch disturbances and fish pushes. Motion changes the water rather than merely playing over it.
2. SOURCE: caustic light comes from the area compression of a grid displaced by the water surface. The ratio of original to displaced area determines light concentration. Our shader instead draws warped Voronoi cell boundaries.
3. SOURCE: coherent compositing. Floor, relief, plants, fish, shadows, and water surface are sampled in a common composition pass. Surface slopes distort the floor and fish differently; the fish also sample softened caustic illumination.
4. SOURCE: substantial body/material detail. Fish shading includes surface normals, directional highlights, scale patterns, metallic sheen, thin-fin translucency, and detailed head features. Their bodies bend along a spine constructed from movement history.
5. SOURCE: deliberate finishing. A final pass introduces irregular edge feathering, progressively sampled blur near the boundary, and grain across the entire scene. Exposure/tone mapping helps unify the materials.
6. PARTIAL: composed visual anchors. Stones, plants, cast shadows, and bright fish distribute weight around the frame. Contrast makes the subjects legible immediately; the quiet surrounding page lets the pond carry the personality.

## Priority gaps in our bloom

### 1. The animals are outside the optical system

`src/bloom/simulation.ts` draws jellyfish in a transparent Canvas 2D layer above the water canvas. The shader has no jellyfish texture input, so neither surface refraction nor caustics can affect the animals. The current use of “depth” changes draw order/opacity, not their actual optical depth.

Fix: render the creatures into an offscreen texture and composite them through a shared water surface, with depth-aware distortion and light. This is the first architectural correction.

### 2. Bright linework substitutes for translucent volume

Repeated Bézier domes, outlines, and sine-wave tentacles are visually obvious. The radial gradients do not model tissue thickness, scattering, or view-dependent highlights.

Fix: develop one convincing jellyfish before multiplying it. Use a deformable bell with thickness-dependent transmission, soft internal structures, restrained edge highlights, and different orientations. Preserve recognizability without outlining every part.

### 3. Water reads as a moving cellular pattern

`src/bloom/water.ts` constructs the bright network from nearest/second-nearest Voronoi distances. Ripple positions warp that network but do not propagate through a persistent water-height field. The resulting light is too uniform and visibly geometric relative to the reference.

Fix: introduce a persistent damped surface simulation and derive moving light concentration from that surface. The water can remain an artistic approximation; it must have coherent cause and effect.

### 4. Tentacles do not preserve motion history

They are redrawn from sine functions in the creature's rotated local space. They wave but do not retain inertia when the bell changes direction. The reference fish uses its trail history to construct body curvature.

Fix: use connected tentacle segments with damping/constraints and drag, driven by bell movement and a shared current. Couple the bell contraction, thrust, tentacle lag, and a subtle local water disturbance.

### 5. The scene and page need stronger composition

PARTIAL: our larger field has long stretches of low-contrast emptiness, and the creatures can cluster. Symmetric CSS edge masks resemble a uniformly softened card. The title, subtitle, hint, and extra vertical spacing separate the scene from the introduction more than in the reference.

Fix: art-direct a few depth layers and a clear focal creature, create an irregular optical boundary over the complete scene, and tighten the scene-to-introduction relationship. Keep pause and sound controls accessible while reducing explanatory chrome.

## Recommended next implementation order

1. One convincing jellyfish, judged in a still frame.
2. Shared lighting/refraction and depth-aware composition.
3. Bell propulsion and tentacle inertia.
4. Persistent water disturbances and derived caustics.
5. Small varied bloom, organic boundary, unified grain, and restrained page spacing.

Relevant follow-up skills: frontend-design for the scene/composition, animate for coupled movement, polish for the final integration. A palette change or additional particles alone will not solve the first four problems.

This pass changed documentation only. The existing app remains available for comparison.

# Jellyfish Bloom — prototype verification

Replaces Night Flight at the user's request. Original water shader and jellyfish artwork; the reference site's implementation and assets were not copied.

## Verified

- TypeScript, Oxlint, and production build passed.
- Desktop scene inspected: feathered rectangle, green water, moving caustics, translucent pulsing jellyfish, and tentacles.
- Pause/resume labels and state changed correctly. Successive paused screenshots showed the same creature positions and water pattern; byte-for-byte screenshot equality was not established.
- Scene click and keyboard-accessible button activate the ripple handler. Hover coordinates steer nearby jellyfish through the simulation.
- Focus navigation enlarges the scene and hides the introduction. Home restores the introduction.
- Sound enable succeeded and its control switched to the mute state.
- Narrow viewport check: actual reported viewport and document widths were both 433px, with no horizontal overflow. The requested 390px browser override produced inconsistent screenshot scaling; physical phone testing remains outstanding.
- No browser warnings or errors were reported during the final inspection.
- Prior flight files and UI text are absent from active source; backups are under `../Portfolio-archives/`.

## Source-reviewed behavior / remaining limits

- Reduced-motion mode, offscreen/background pause, shader failure fallback, and WebGL context restoration are implemented; these conditions were not emulated during this pass.
- The scene is a stylized visual simulation using periodic swimming/steering and procedural optics, not a biological or full fluid-dynamics model.
- Final biography, case studies, and contact information remain content work for the full portfolio.

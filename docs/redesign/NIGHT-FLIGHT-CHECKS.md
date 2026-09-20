# Night Flight — first prototype verification

- Production build, TypeScript check, and Oxlint passed after the replacement.
- Browser: desktop scene, materials, progressive edge blur, and mobile focus mode inspected visually.
- At a 390px viewport, document scroll width was also 390px: no horizontal overflow.
- Dragging the physical shade handle changed it from open to 64% closed, with the visible shade tracking the pointer.
- Keyboard Home/End opened/closed the shade; accessible values reflected 0 and 100.
- Pause/resume and sound on/off controls changed their labels and pressed states correctly.
- Home/focus navigation correctly showed/removed the introduction. Focus mode retains the scene controls.
- Browser console inspection returned no warnings or errors during the interaction checks.
- Reduced-motion, offscreen, background-tab, and fully closed shade scheduling were reviewed in source. Reduced-motion emulation and physical touch-device testing were not performed.
- Sound initialization and toggling succeeded; perceived audio balance should still be reviewed by the user on their normal speakers/headphones.

This verifies the scene prototype, not a completed portfolio. Case studies and final personal content remain outstanding.

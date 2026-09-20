# Window scene audit — 2026-09-20

## Anti-pattern verdict

The page avoids template cards, oversized marketing headings, neon gradients, and unnecessary UI. The original scene gives it a clear identity. The city remains visibly procedural, and uniform curtain pleats still read as a rendered study rather than a photographic interior. That is a visual limit, not a claim of reference-level realism.

## Summary

Nine findings: one high, five medium, three low. Five addressed in this pass; four remain recommendations. No critical blocker found in the reviewed flow. Scope: scene, controls, audio, responsive source rules, and runtime behavior. This is not a complete WCAG certification or physical-device audit.

| Severity | Location | Finding / impact | Resolution or recommendation |
| --- | --- | --- | --- |
| High | `src/linen/linen.css`, instruction and opening text | Instruction contrast was 3.23:1 on the page, below WCAG 1.4.3's 4.5:1 for normal text. | **Fixed:** darker neutral, measured 4.71:1. |
| Medium | `src/linen/audio.ts`, `App.tsx` | Constant audio had no connection to the window; sound contradicted the interaction. | **Fixed:** opening is shared state; gain and low-pass cutoff respond smoothly to it. Closed wind gain .008 / city .025 / cutoff 240 Hz; fully open .228 / .215 / 3200 Hz. No claim that gain ratios equal perceived loudness. |
| Medium | `src/linen/audio.ts` | Single constant mono noise loop sounded like hiss, not changing outdoor weather. | **Reworked:** independent stereo gust and traffic beds, slower turbulent motion, changing road pass-bys, softer engine harmonics, unequal loop lengths and faded boundaries. Procedural sound, not recorded ambience; perceptual quality still needs listening feedback. |
| Medium | `src/linen/scene.ts`, camera | Pole was geometrically straight, but horizontal camera offset combined with downward view made its projection tilt. | **Fixed:** centered camera. Projected endpoints have exactly equal screen Y, and screenshot inspected. |
| Medium | `src/linen/cloth.ts` | Bounds and constraints do not provide full cloth self-collision or casement collision; extreme drags can produce implausible folds. | **Open:** add panel/window collision constraints before increasing wind amplitude. Suggested `/harden`; verify with adversarial drags. |
| Medium | `src/App.tsx`, playback control | Pause remains interactive in reduced-motion/fallback states even though there is no ongoing motion. | **Open:** lift availability state and hide or disable this control with an appropriate explanation. Suggested `/clarify`. |
| Low | `src/App.tsx`, focus tooltip | “Open window” named the focus-view button, competing with the real window control. | **Fixed:** tooltip now “Focus view.” |
| Low | `src/styles.css`, nav/playback | 39–40 px nav buttons and 38 px desktop playback are below a comfortable 44 px target. This alone does not establish a WCAG 2.5.8 violation, whose minimum/spacing rules differ. | **Open:** enlarge invisible hit areas or button bounds while preserving compact appearance. Suggested `/adapt`. |
| Low | lazy Three.js scene | Production scene chunk is about 556 kB minified / 142 kB gzip; Vite flags its uncompressed size. | **Open:** profile on a physical low-end phone before trading away shading detail. Keep lazy loading and offscreen suspension. Suggested `/optimize`. |

## Changes beyond findings

Home scene width increased from 650 to 700 px (about 8%); focus width increased from 740 to 780 px. Responsive max-width remains 100%.

Audio generation runs once after opting in, at 22.05 kHz. Two stereo beds use approximately 11.6 MB of sample data, with no recurring JS scheduling timer. The graph handles continuous gain/filter ramps, tab hiding, mute, and cleanup. Closing during a gust cancels its future gain event so the scene cannot audibly reopen itself.

## Validation

- `npm run test:audio`: levels/cutoff rise monotonically with opening; gust and traffic RMS vary by 9.95× and 7.81× across sampled seconds; samples finite and below clipping; stereo differs; loop endpoints near zero. Mock graph checks opening, muffling, future-gust cancellation, mute, and disposal.
- `npm run lint` and `npm run build` pass; the known scene-size advisory remains.
- Browser: activated sound, closed window, reopened to 32 degrees, triggered gust; no warning/error logs. This verifies wiring and runtime health, not a subjective listening evaluation.
- Screenshot: larger scene and level pole verified. Three.js endpoint projection independently gives zero screen-Y difference.
- Existing protections preserved: sound opt-in, keyboard range/breeze controls, pause, reduced motion, WebGL fallback, offscreen rendering suspension, capped pixel ratio, and interpolated motion.

## Priority

Next: cloth collision and truthful static-state controls. Then larger hit targets and a real-phone performance/listening pass. Keep the calm typography, page-matched background, and original city/linen direction; avoid adding more controls or decorative labels.

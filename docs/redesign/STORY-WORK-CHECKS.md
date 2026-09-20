# Story and Work — implementation / verification

Reference revisited in the Codex browser on 2026-09-20: shwn.design home and projects. Observed quiet prose with embedded interactions, three overlapping project cards, focused descriptions with back navigation, and a spare footer. This implementation uses original copy/artwork and does not include reference assets or code.

## Implemented

- Story preserves the supplied milestones: sneaker reselling at 14 and first $3,000; Legacy started at 16, three years of building, college-year launch, roughly $5,000 revenue; closing Legacy for consumer tech; interest in technology, AI, design; questioning why as a way to remain a student; current Lyra Plus direction in event ticketing/gamification/social life.
- Legacy opens three small images above the word, with staggered unfolding and a brief exit transition. Mouse hover, click, keyboard focus, Escape, outside click, scroll dismissal, and reduced-motion CSS are supported. Images are explicitly marked ORIGINAL PREVIEW ARTWORK, not actual clothing-brand photography.
- “Why” opens a question note. Lyra Plus opens the corresponding project detail.
- Work replaces Focus view. Three original paper-like covers lead to Lyra Plus, Legacy, and this portfolio’s window experiment. Detail pages have back navigation, metadata, truthful descriptions, and deep links (`#work/lyra`, `#work/legacy`, `#work/window`). Browser Back restores the overview and card focus.
- Open-source content is configurable but intentionally unpopulated until actual repository links arrive. No invented repositories, project results, product screenshots, or contact links.
- Footer has a personal sign-off and functioning back-to-top control. No copied reference footer text.
- Hidden home scene pauses in Work. Enabling sound while in Work now keeps room audio suspended; returning Home resumes enabled sound.

## Verification evidence

- `npm run lint`, `npm run build`, `npm run test:audio` pass. Existing Three.js size advisory remains.
- Browser: Legacy expanded into exactly 3 image elements; Escape dismissed it. Tab moved to “why” and opened its note. Inline Lyra Plus reached `#work/lyra` and focused the project heading. Reload retained the project; browser Back and All work restored overview and card focus.
- Desktop screenshots inspected for prose, fully unfolded fan, card collection, and Lyra detail. Card titles visible after responsive stack adjustment.
- Narrow viewport: browser reported 433 CSS px under its scaling, and document scrollWidth matched. Legacy preview width 320 px, x=23.4 to 343.4, with 3 images. Work cards remained inside viewport. Viewport override reset. This is responsive desktop-browser verification, not physical-phone touch testing.
- Reduced-motion animation suppression is present in CSS; an actual OS reduced-motion preference was not changed for this pass.
- Existing numerical audio checks pass, including added hidden-view startup/resume checks. Visual scene physics were not modified.

## Required content to finish

1. Three actual Legacy photographs (local paths or attachments), plus preferred alt descriptions if needed.
2. Project/demo and open-source repository links to showcase, with brief descriptions/roles where not obvious. Current project descriptions use only user-provided facts or the locally built window experiment.
3. Optional contact/social destinations for the footer. The current footer works without them.

The goal remains incomplete while the Legacy imagery and open-source portfolio content are unconfirmed. Layout/interactions are ready for those assets.

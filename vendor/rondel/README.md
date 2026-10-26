# RONDEL original shared template

Source: https://rondel-one.aura.build/ by the original template author.
The public Aura shared template explicitly exposes its source (`private: false`, `share_source_code: true`). `original.html` is retained unmodified for comparison. Original attribution remains in the template footer.

`node scripts/prepare-rondel.mjs` generates an editable standalone document. It retains the original Three.js model, camera paths, exploded view, record choreography, shaders, OGL lens carousel, audio and timing. Only local asset paths, editable content hooks, and removal of Aura's preview performance bridge differ. The original fixed sixth-record scroll target uses a stable index so editing its title cannot break the animation.

Content is stored in D1 with optimistic revision checks. Photos are stored in R2. `/rondel` is the standalone experience; `/admin/rondel` uses the portfolio's existing owner authentication. The homepage is based on version 8 plus a single entry link.

# Model Notes

## Models tested
- gemini-4-hydrogen
- gemini-3.8-flash

## Results (20 Nov 2026, evening IST)
| Model | Temp | Chars | Hashtags | Notes |
| --- | --- | --- | --- | --- |
| gemini-4-hydrogen | 0.2 | 144 | 3 | Clear and on-brand, fits limit |
| gemini-4-hydrogen | 0.9 | 125 | 3 | Slightly more generic, fits limit |
| gemini-3.8-flash | 0.2 | 121 | 3 | Shorter, uses an emoji, fits limit |
| gemini-3.8-flash | 0.9 | (add result) | | |

## Observations
- Both models followed the 150-character and 3-hashtag instructions.
- The runs hit repeated 503 errors, so reliability matters as much as quality. Timings include retries and are not a true speed measure.
- Temperature 0.2 gave steadier output; 0.9 gave more varied wording.

## Decision
Default: gemini-3.8-flash, with gemini-4-hydrogen as the fallback (or the other way round, depending on which one was more available over the next few days).

## Decision
Default model: gemini-3.8-flash (a Flash model is the usual choice for fast, free-tier use). Revisit after a successful comparison.

## Next
Re-run `node scripts/model-compare.js` when the models are available.   
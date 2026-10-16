# QA report

Verified on 16 October 2026 using Node/Vite and the Codex in-app Chromium browser. Use fictional or non-sensitive fixtures.

## Automated local checks

- 28 Vitest tests: all drag directions, clamping, fractional pixel coverage, zoom conversion, hit testing, immutable history, alternating undo/redo, reset/deletion history, redo invalidation, history bounds, file limits/formats, dimensions, and PNG/JPEG header parsing.
- Strict TypeScript, ESLint, Vite production build: pass.
- Dependency audit after updating Vitest: zero known vulnerabilities at the time of verification.

## Real-browser image checks

`/tests/browser.html`: 12 checks pass.

- PNG, JPEG, and WebP decode at 1920 × 1080.
- Corrupt input receives a friendly error.
- Every solid-covered pixel is opaque black.
- Overlapping blur/pixelation does not expose solid regions.
- White and custom colors remain opaque; invalid alpha colors fall back to black.
- Blur and pixelation produce distinct output.
- Blur fallback works with native filter support removed for the test.
- Removing a region restores original pixels; the original bitmap is unchanged.
- A freshly encoded PNG independently decodes at original dimensions with covered pixels preserved and no UI outlines.
- An injected synthetic EXIF/GPS-bearing PNG chunk is not copied to output. This does not test every EXIF layout or real-camera GPS fixture.

## Interactive checks

Desktop: sample image, solid drawing, corner resize, multiple masks, undo/redo through buttons and keyboard, original comparison, and a successful download action.

Mobile: a 390-pixel iframe confirms responsive landing/editor layouts, the compact header, mobile toolbar, settings drawer, and pointer drawing. This is a CSS viewport check, not physical touch hardware testing. The mobile image replacement control received an explicit accessible name after this review.

Image processing code has no network submission or persistent-storage calls. Fonts are self-hosted. Source inspection confirms the privacy architecture; no external penetration test is claimed.

## Still requiring manual device verification

- Physical touch/pen devices, including pointer cancellation and scrolling around the image.
- Clipboard image paste across OS/browser combinations, EXIF orientation from real cameras, unusual WebP/JPEG headers, and browser memory-pressure behavior.
- Safari/Firefox image-decoder behavior. The portable blur algorithm was exercised in Chromium with Canvas filters removed.
- The hosted Vercel upload/download workflow, once the repository is imported there. The local full-resolution export engine has passed browser pixel checks.

# Third-party notices

The catalog names and links to third-party open-source repositories for research and attribution. Those projects, names, trademarks, content, and licenses remain the property of their respective owners. This repository does not redistribute their source code.

## Bundled font

The interface self-hosts one font file. Nothing is fetched from a font service at runtime.

| File | Family | License | Source |
| --- | --- | --- | --- |
| `assets/fonts/SchibstedGrotesk.woff2` | Schibsted Grotesk, Copyright 2023 The Schibsted-Grotesk Project Authors | SIL Open Font License 1.1, [`assets/fonts/SchibstedGrotesk-OFL.txt`](assets/fonts/SchibstedGrotesk-OFL.txt) | Google Fonts Latin subset `schibstedgrotesk/v7`, from the upstream [schibsted/schibsted-grotesk](https://github.com/schibsted/schibsted-grotesk) project |

The license declares no Reserved Font Name, so the unmodified Latin subset may be redistributed under its original name. The file is bundled as published and not modified.

## Development tools

Development-only browser checks and the README image renderer use **Playwright Core 1.62.1**, licensed under Apache-2.0. It is excluded from the release ZIP. The demo GIF and MP4 are encoded with FFmpeg, which is not bundled. Runtime motion uses the browser Web Animations API; no GSAP runtime or other third-party JavaScript is shipped.

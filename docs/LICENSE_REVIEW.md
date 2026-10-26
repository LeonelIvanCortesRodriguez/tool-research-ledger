# License review

On 2026-10-23, the owner authorized MIT for Leonel's original application code and documentation. That decision applies to the publication candidate and does not publish it. The catalog links to third-party repositories without copying their code. Each project keeps its own license and trademarks.

An earlier internal prototype used a local GSAP runtime. The public candidate uses the browser Web Animations API instead and ships no GSAP runtime. Playwright Core 1.62.1 uses Apache-2.0 and appears only in development. The release excludes `node_modules`.

This is a packaging review, not legal advice. The final integrator must preserve the authorized `Leonel` copyright line and must not infer rights over third-party repositories from this license.

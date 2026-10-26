(() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const animate = (element, keyframes, options) => {
    if (!element || reduce.matches || typeof element.animate !== "function") return null;
    return element.animate(keyframes, { fill: "both", ...options });
  };
  const api = {
    revealRecommendations(cards) {
      if (!cards || reduce.matches) return;
      [...cards].forEach((card, index) => animate(card,
        [{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: 240, delay: index * 45, easing: "cubic-bezier(.22,1,.36,1)" }));
    },
    openDialog(dialog) {
      animate(dialog?.querySelector(".dialog-shell"),
        [{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: 200, easing: "cubic-bezier(.22,1,.36,1)" });
    },
    closeDialog(dialog, done) {
      const animation = animate(dialog?.querySelector(".dialog-shell"),
        [{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(8px)" }],
        { duration: 140, easing: "ease-in" });
      if (!animation) return done();
      animation.finished.then(done, done);
    }
  };
  window.FinalMotion = api;
  document.documentElement.dataset.motion = reduce.matches ? "reduced" : "ready";
})();

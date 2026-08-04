window.initHeroMaskScroll = () => {
    if (window.__heroMaskMedia || ScrollTrigger.getById("hero-mask-reveal")) return;

    const stage = document.querySelector("[data-hero-mask-stage]");
    const scene = document.querySelector("[data-hero-mask-scene]");
    const hero = document.querySelector("#inicio");
    const overlay = document.querySelector("[data-hero-mask]");
    const maskZoom = overlay?.querySelector("[data-hero-mask-zoom]");
    const maskWord = overlay?.querySelector("[data-hero-mask-word]");
    const maskWordMobile = overlay?.querySelector("[data-hero-mask-word-mobile]");
    const labels = overlay?.querySelectorAll(".hero-mask-intro__label, .hero-mask-intro__scroll-cue");
    const navReveal = document.querySelector("[data-site-nav]");
    const revealItems = [
        ...gsap.utils.toArray("[data-hero-reveal]", scene),
        ...(navReveal ? [navReveal] : [])
    ];
    const revealMotionItems = revealItems.filter((item) => !["right-panel", "nav"].includes(item.dataset.heroReveal));
    const revealRightPanel = revealItems.filter((item) => item.dataset.heroReveal === "right-panel");
    const revealNav = revealItems.filter((item) => item.dataset.heroReveal === "nav");

    if (!stage || !scene || !hero || !overlay || !maskZoom || !maskWord || !labels?.length) return;

    maskWord.textContent = overlay.dataset.maskText?.trim() || "DEVCLUB";
    if (maskWordMobile) maskWordMobile.textContent = overlay.dataset.maskMobileText?.trim() || "ENTRE";

    const media = gsap.matchMedia();
    window.__heroMaskMedia = media;

    media.add({
        reduceMotion: "(prefers-reduced-motion: reduce)",
        mobile: "(max-width: 767px)"
    }, (context) => {
        const { reduceMotion, mobile } = context.conditions;
        const finalScale = mobile ? 30 : 32;
        const scrollScreens = mobile ? 2.25 : 2.6;

        if (reduceMotion) {
            document.documentElement.classList.add("gsap-ready", "hero-mask-reduced-motion");
            gsap.set(overlay, { display: "none" });
            gsap.set(revealItems, { autoAlpha: 1, x: 0, y: 0 });
            gsap.set(scene, { clearProps: "pointerEvents" });
            return;
        }

        document.documentElement.classList.remove("hero-mask-reduced-motion");
        document.documentElement.classList.add("gsap-ready");

        /* Estado inicial: overlay visível cobrindo tudo, hero por baixo em escala normal */
        gsap.set(overlay, { autoAlpha: 1, display: "block" });
        gsap.set(maskZoom, {
            scale: 1,
            x: 0,
            y: 0,
            svgOrigin: "500 500"
        });
        gsap.set(labels, { autoAlpha: 1, y: 0 });
        gsap.set(revealItems, { autoAlpha: 0 });
        gsap.set(revealMotionItems, { y: mobile ? 14 : 20 });
        gsap.set(revealRightPanel, { x: mobile ? 0 : 28 });
        gsap.set(revealNav, { y: -14 });
        gsap.set(scene, { pointerEvents: "none" });

        const holdState = { progress: 0 };

        const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
                id: "hero-mask-reveal",
                trigger: stage,
                start: "top top",
                end: () => `+=${Math.round(window.innerHeight * scrollScreens)}`,
                pin: scene,
                pinSpacing: true,
                scrub: 0.6,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                refreshPriority: -100
            }
        });

        /*
         * Sequência sem sobreposição:
         * zoom completo -> máscara some -> conteúdo entra -> Hero permanece montada.
         */
        tl.addLabel("start", 0)
          .to(labels, {
              autoAlpha: 0,
              y: -24,
              duration: 0.18,
              ease: "power2.out"
          }, "start")
          .to(maskZoom, {
              scale: finalScale,
              x: mobile ? -84 : 0,
              duration: 1,
              ease: "none"
          }, "start")
          .addLabel("zoomComplete", 1)
          .to(overlay, {
              autoAlpha: 0,
              duration: 0.16,
              ease: "power2.out"
          }, "zoomComplete+=0.02")
          .addLabel("maskGone", 1.18)
          .set(scene, { pointerEvents: "auto" }, "maskGone")
          .addLabel("contentIn", 1.18)
          .to(revealNav, {
              autoAlpha: 1,
              y: 0,
              duration: 0.32,
              ease: "power2.out"
          }, "contentIn")
          .to(revealMotionItems, {
              autoAlpha: 1,
              y: 0,
              duration: 0.32,
              stagger: 0.07,
              ease: "power2.out"
          }, "contentIn")
          .to(revealRightPanel, {
              autoAlpha: 1,
              x: 0,
              duration: 0.42,
              ease: "power3.out"
          }, "contentIn+=0.08")
          .addLabel("heroMounted", 1.8)
          .to(holdState, {
              progress: 1,
              duration: 0.38,
              ease: "none"
          }, "heroMounted");
        requestAnimationFrame(() => ScrollTrigger.refresh());
    });

    window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener("pagehide", () => {
        media.revert();
        window.__heroMaskMedia = null;
    }, { once: true });
};

if (typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    window.initHeroMaskScroll();
} else {
    document.documentElement.classList.add("motion-unavailable");
}

document.addEventListener("DOMContentLoaded", () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);
    }

    initLenisScroll(reduceMotion);
});

function initLenisScroll(reduceMotion) {
    if (reduceMotion || typeof Lenis === "undefined") {
        window.devclubScroll = {
            instance: null,
            pause() {},
            resume() {},
            resize() {}
        };
        return;
    }

    const lenis = new Lenis({
        duration: 1.05,
        smoothWheel: true,
        syncTouch: false,
        stopInertiaOnNavigate: true,
        anchors: {
            offset: -104,
            duration: 1.05
        },
        autoRaf: false
    });

    const updateLenis = (time) => lenis.raf(time * 1000);
    const canSyncGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";

    let nativeRafId;

    if (canSyncGsap) {
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(updateLenis);
        gsap.ticker.lagSmoothing(0);
    } else {
        const raf = (time) => {
            lenis.raf(time);
            nativeRafId = window.requestAnimationFrame(raf);
        };
        nativeRafId = window.requestAnimationFrame(raf);
    }

    const controller = {
        instance: lenis,
        pause: () => lenis.stop(),
        resume: () => lenis.start(),
        resize: () => lenis.resize()
    };

    window.devclubScroll = controller;

    if (document.body.classList.contains("intro-active")) {
        controller.pause();
    }

    window.addEventListener("load", () => {
        controller.resize();
        if (typeof ScrollTrigger !== "undefined") {
            ScrollTrigger.refresh();
        }
    }, { once: true });

    window.addEventListener("pagehide", (event) => {
        if (event.persisted) {
            lenis.stop();
            return;
        }

        if (canSyncGsap) {
            gsap.ticker.remove(updateLenis);
        } else if (nativeRafId) {
            window.cancelAnimationFrame(nativeRafId);
        }
        lenis.destroy();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initEntryIntro();
    // Registra o plugin ScrollTrigger no GSAP
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);
        initFormationsAnimation();
        initAboutAnimation();
        initFacultyAnimation();
        initTestimonialsAnimation();
    } else {
        console.warn("GSAP ou ScrollTrigger não carregados na página. Lógica de animação desativada.");
    }
});

function initEntryIntro() {
    const intro = document.querySelector("[data-entry-intro]");
    const word = document.querySelector("[data-entry-word]");

    if (!intro || !word) {
        document.body.classList.remove("intro-active");
        return;
    }

    const eyebrow = intro.querySelector(".entry-intro__eyebrow");
    const line = intro.querySelector(".entry-intro__line");
    const wash = intro.querySelector(".entry-intro__wash");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let isFinished = false;

    const unlockSite = () => {
        if (isFinished) return;
        isFinished = true;
        document.body.classList.remove("intro-active");
        intro.style.display = "none";

        if (typeof ScrollTrigger !== "undefined") {
            ScrollTrigger.refresh();
        }
    };

    if (typeof gsap === "undefined") {
        unlockSite();
        return;
    }

    if (reduceMotion) {
        gsap.to(intro, {
            autoAlpha: 0,
            duration: 0.18,
            onComplete: unlockSite
        });
        return;
    }

    gsap.set(eyebrow, { autoAlpha: 0, y: 14 });
    gsap.set(word, { autoAlpha: 0, scale: 0.86, transformOrigin: "50% 50%" });
    gsap.set(line, { autoAlpha: 0, scaleX: 0 });
    gsap.set(wash, { autoAlpha: 0, scale: 1.16 });

    const zoomScale = window.innerWidth < 640 ? 12 : 9;
    const introTimeline = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: unlockSite
    });

    introTimeline
        .addLabel("reveal")
        .to(eyebrow, {
            autoAlpha: 1,
            y: 0,
            duration: 0.55
        }, "reveal")
        .to(word, {
            autoAlpha: 1,
            scale: 1,
            duration: 0.9,
            ease: "power4.out"
        }, "reveal+=0.08")
        .to(line, {
            autoAlpha: 1,
            scaleX: 1,
            duration: 0.75
        }, "reveal+=0.28")
        .addLabel("zoom", "+=0.24")
        .to([eyebrow, line], {
            autoAlpha: 0,
            duration: 0.3
        }, "zoom")
        .to(word, {
            scale: zoomScale,
            duration: 1.45,
            ease: "power4.inOut"
        }, "zoom")
        .to(wash, {
            autoAlpha: 1,
            scale: 1,
            duration: 0.9,
            ease: "power3.inOut"
        }, "zoom+=0.58")
        .to(word, {
            autoAlpha: 0,
            duration: 0.42
        }, "zoom+=0.72")
        .to(intro, {
            autoAlpha: 0,
            duration: 0.7,
            ease: "power2.inOut"
        }, "zoom+=1.16");
}

function initFormationsAnimation() {
    let mm = gsap.matchMedia();

    // Lógica para desktop (split screen com sticky e swapping)
    mm.add("(min-width: 1024px)", () => {
        const textBlocks = gsap.utils.toArray(".formation-text-block");
        const images = gsap.utils.toArray(".formation-image-item");

        if (textBlocks.length === 0 || images.length === 0) return;

        // Configura a primeira imagem como ativa por padrão
        gsap.set(images[0], { opacity: 1, scale: 1 });

        textBlocks.forEach((block, index) => {
            // Cria um trigger para cada seção de texto da esquerda
            ScrollTrigger.create({
                trigger: block,
                start: "top 45%", // Dispara quando o topo do bloco atinge 45% da altura da tela
                end: "bottom 45%",
                onEnter: () => swapImage(index),
                onEnterBack: () => swapImage(index),
                invalidateOnRefresh: true
            });
        });

        // Função responsável por trocar as imagens com transição suave (GPU-accelerated)
        function swapImage(activeIndex) {
            images.forEach((img, i) => {
                if (i === activeIndex) {
                    // Revela a imagem ativa atual com fade-in e scale para 100%
                    gsap.to(img, {
                        opacity: 1,
                        scale: 1,
                        duration: 0.55,
                        ease: "power3.out",
                        overwrite: "auto"
                    });
                } else {
                    // Esconde as outras imagens com fade-out e scale-down para 95%
                    gsap.to(img, {
                        opacity: 0,
                        scale: 0.95,
                        duration: 0.55,
                        ease: "power3.out",
                        overwrite: "auto"
                    });
                }
            });
        }
    });

    // Lógica para mobile (todas as imagens fluem normalmente no fluxo do documento, sem scroll-trigger swap)
    mm.add("(max-width: 1023px)", () => {
        const images = gsap.utils.toArray(".formation-image-item");
        // No mobile, removemos transformações absolutas e forçamos opacidade 1
        images.forEach(img => {
            gsap.set(img, { opacity: 1, scale: 1, clearProps: "all" });
        });
    });

}

function initAboutAnimation() {
    const section = document.querySelector(".about-premium");
    if (!section) return;

    const mm = gsap.matchMedia();

    mm.add(
        {
            reduceMotion: "(prefers-reduced-motion: reduce)",
            isMobile: "(max-width: 767px)"
        },
        (context) => {
            const { reduceMotion, isMobile } = context.conditions;
            const reveals = section.querySelectorAll(".about-reveal");
            const cards = section.querySelectorAll(".about-card-reveal");
            const timelineItems = section.querySelectorAll(".timeline-item");
            const processSteps = section.querySelectorAll(".process-step");
            const devPathProgress = section.querySelector(".devpath__progress");
            const processProgress = section.querySelector(".process-line span");

            if (reduceMotion) {
                gsap.set([reveals, cards, timelineItems, processSteps], { clearProps: "all" });
                gsap.set([devPathProgress, processProgress], { scaleX: 1, scaleY: 1 });
                timelineItems.forEach((item) => item.classList.add("is-active"));
                processSteps.forEach((step) => step.classList.add("is-active"));
                return;
            }

            gsap.set(reveals, { autoAlpha: 0, y: 28 });
            gsap.set(cards, { autoAlpha: 0, y: 24 });
            gsap.set(processSteps, { autoAlpha: 0, y: isMobile ? 18 : 22 });

            ScrollTrigger.batch(reveals, {
                start: "top 86%",
                once: true,
                interval: 0.08,
                batchMax: 3,
                onEnter: (batch) => gsap.to(batch, {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: "power3.out",
                    overwrite: "auto"
                })
            });

            ScrollTrigger.batch(cards, {
                start: "top 88%",
                once: true,
                interval: 0.1,
                batchMax: isMobile ? 1 : 3,
                onEnter: (batch) => gsap.to(batch, {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.72,
                    stagger: 0.1,
                    ease: "power3.out",
                    overwrite: "auto"
                })
            });

            if (devPathProgress) {
                gsap.to(devPathProgress, {
                    scaleY: 1,
                    ease: "none",
                    scrollTrigger: {
                        trigger: section.querySelector(".devpath"),
                        start: "top 68%",
                        end: "bottom 55%",
                        scrub: 0.6
                    }
                });
            }

            timelineItems.forEach((item) => {
                ScrollTrigger.create({
                    trigger: item,
                    start: "top 58%",
                    end: "bottom 42%",
                    onEnter: () => item.classList.add("is-active"),
                    onEnterBack: () => item.classList.add("is-active"),
                    onLeave: () => item.classList.remove("is-active"),
                    onLeaveBack: () => item.classList.remove("is-active")
                });
            });

            if (processProgress && !isMobile) {
                gsap.to(processProgress, {
                    scaleX: 1,
                    ease: "none",
                    scrollTrigger: {
                        trigger: section.querySelector(".process-flow"),
                        start: "top 78%",
                        end: "bottom 60%",
                        scrub: 0.7
                    }
                });
            }

            ScrollTrigger.batch(processSteps, {
                start: "top 86%",
                once: true,
                interval: 0.12,
                batchMax: isMobile ? 1 : 5,
                onEnter: (batch) => {
                    batch.forEach((step) => step.classList.add("is-active"));
                    gsap.to(batch, {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.65,
                        stagger: 0.12,
                        ease: "power3.out",
                        overwrite: "auto"
                    });
                }
            });

            return () => {
                timelineItems.forEach((item) => item.classList.remove("is-active"));
                processSteps.forEach((step) => step.classList.remove("is-active"));
            };
        },
        section
    );

    window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
}
function initFacultyAnimation() {
    const section = document.querySelector(".faculty-showcase");
    if (!section) return;

    const cards = gsap.utils.toArray(".faculty-card", section);
    const captions = gsap.utils.toArray(".faculty-card__caption", section);
    const stage = section.querySelector(".faculty-stage");
    const pin = section.querySelector(".faculty-pin");
    const cue = section.querySelector(".faculty-scroll-cue");
    const mm = gsap.matchMedia();

    mm.add(
        {
            desktop: "(min-width: 768px)",
            reduceMotion: "(prefers-reduced-motion: reduce)"
        },
        (context) => {
            const { desktop, reduceMotion } = context.conditions;
            if (!desktop || reduceMotion || cards.length < 2) return;

            section.classList.add("is-motion-ready");

            const maxTravel = () => Math.max(0, stage.clientWidth - cards[0].offsetWidth);
            const finalY = [0, -18, 20, -10];

            const timeline = gsap.timeline({
                defaults: { ease: "none" },
                scrollTrigger: {
                    trigger: section,
                    start: "top top",
                    end: "+=180%",
                    pin,
                    scrub: 0.8,
                    anticipatePin: 1,
                    invalidateOnRefresh: true
                }
            });

            timeline
                .addLabel("stacked", 0)
                .fromTo(
                    cards,
                    {
                        x: (index) => -54 + index * 14,
                        y: (index) => index * 7,
                        scale: 0.82,
                        rotation: (index) => (index - 1.5) * -2.6,
                        transformOrigin: "center center"
                    },
                    {
                        x: (index) => maxTravel() * (index / (cards.length - 1)),
                        y: (index) => finalY[index] || 0,
                        scale: 1,
                        rotation: 0,
                        duration: 1.4,
                        stagger: 0.03
                    },
                    "stacked"
                )
                .fromTo(
                    captions,
                    { autoAlpha: 0, y: 18 },
                    { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.04 },
                    1.05
                )
                .to(cue, { autoAlpha: 0, x: 24, duration: 0.25 }, 1.15);

            return () => {
                timeline.kill();
                section.classList.remove("is-motion-ready");
                gsap.set([...cards, ...captions, cue], { clearProps: "all" });
            };
        },
        section
    );
}
function initTestimonialsAnimation() {
    const section = document.querySelector(".testimonials-showcase");
    if (!section) return;

    const introItems = gsap.utils.toArray(".testimonials-intro > *", section);
    const cards = gsap.utils.toArray(".testimonial-card", section);
    const list = section.querySelector(".testimonials-list");
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([...introItems, ...cards], { clearProps: "all" });
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
            introItems,
            { autoAlpha: 0, y: 24 },
            {
                autoAlpha: 1,
                y: 0,
                duration: 0.65,
                stagger: 0.08,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: section,
                    start: "top 78%",
                    once: true
                }
            }
        );

        gsap.fromTo(
            cards,
            { autoAlpha: 0, y: 42 },
            {
                autoAlpha: 1,
                y: 0,
                duration: 0.72,
                stagger: 0.12,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: list,
                    start: "top 82%",
                    once: true
                }
            }
        );
    }, section);
}

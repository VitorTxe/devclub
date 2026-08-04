document.addEventListener("DOMContentLoaded", () => {
    // Registra o plugin ScrollTrigger no GSAP
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);
        window.initHeroMaskScroll?.();
        initMetricsAnimation();
        initFormationsAnimation();
        initAboutAnimation();
        initFacultyAnimation();
        initTestimonialsAnimation();
    } else {
        console.warn("GSAP ou ScrollTrigger não carregados na página. Lógica de animação desativada.");
    }
});

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
            isMobile: "(max-width: 767px)",
            isDesktop: "(min-width: 768px)"
        },
        (context) => {
            const { reduceMotion, isMobile } = context.conditions;

            // ── Coleta de elementos ──
            const intro = section.querySelector(".about-intro");
            const introCopy = gsap.utils.toArray(".about-intro__copy > *", section);
            const founderFigure = section.querySelector(".founder-figure");
            const founderFrame = section.querySelector(".founder-frame");
            const founderPhoto = section.querySelector(".founder-photo");
            const founderMeta = gsap.utils.toArray(".founder-caption > span, .founder-tag", section);
            const founderIndex = section.querySelector(".founder-index");
            const sectionHeadings = gsap.utils.toArray(".about-section-heading, .process-heading", section);
            const cards = gsap.utils.toArray(".about-card-reveal", section);
            const cardIcons = gsap.utils.toArray(".method-card .icon-container", section);
            const timelineItems = gsap.utils.toArray(".timeline-item", section);
            const processSteps = gsap.utils.toArray(".process-step", section);
            const processIcons = gsap.utils.toArray(".process-step__icon", section);
            const orbs = gsap.utils.toArray(".about-orb", section);
            const devPath = section.querySelector(".devpath");
            const devPathProgress = section.querySelector(".devpath__progress");
            const processFlow = section.querySelector(".process-flow");
            const processProgress = section.querySelector(".process-line span");

            const allAnimated = [
                ...introCopy,
                founderFigure,
                founderFrame,
                ...founderMeta,
                founderIndex,
                ...sectionHeadings.flatMap((h) => gsap.utils.toArray(h.children)),
                ...cards,
                ...cardIcons,
                ...timelineItems,
                ...processSteps,
                ...processIcons,
                founderPhoto,
                ...orbs
            ].filter(Boolean);

            // ── Reduzir movimento: limpa tudo e retorna ──
            if (reduceMotion) {
                gsap.set(allAnimated, { clearProps: "all" });
                gsap.set([devPathProgress, processProgress].filter(Boolean), { scaleX: 1, scaleY: 1 });
                timelineItems.forEach((item) => item.classList.add("is-active"));
                processSteps.forEach((step) => step.classList.add("is-active"));

                return () => {
                    timelineItems.forEach((item) => item.classList.remove("is-active"));
                    processSteps.forEach((step) => step.classList.remove("is-active"));
                };
            }

            // ══════════════════════════════════════════════════════
            // 1. INTRO — Reveal cinematográfico (copy + founder)
            // ══════════════════════════════════════════════════════

            gsap.set(introCopy, { autoAlpha: 0, y: isMobile ? 26 : 38 });
            gsap.set(founderFigure, {
                autoAlpha: 0,
                y: isMobile ? 40 : 64,
                scale: 0.94,
                transformOrigin: "50% 65%"
            });

            // Founder frame: clip-path reveal (desktop) ou fade simples (mobile)
            if (founderFrame && !isMobile) {
                gsap.set(founderFrame, {
                    clipPath: "inset(6% 6% 6% 6% round 24px)",
                    scale: 1.04
                });
            }

            gsap.set(founderMeta, { autoAlpha: 0, y: 16 });
            if (founderIndex) gsap.set(founderIndex, { autoAlpha: 0 });

            const introTl = gsap.timeline({
                defaults: { ease: "power3.out" },
                scrollTrigger: {
                    id: "about-intro",
                    trigger: intro,
                    start: "top 78%",
                    once: true
                },
                onComplete: () => {
                    gsap.set([...introCopy, founderFigure, ...founderMeta], {
                        clearProps: "transform,opacity,visibility"
                    });
                    if (founderFrame && !isMobile) {
                        gsap.set(founderFrame, { clearProps: "clipPath,transform" });
                    }
                    if (founderIndex) gsap.set(founderIndex, { clearProps: "all" });
                }
            });

            introTl
                .addLabel("copy")
                .to(introCopy, {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.85,
                    stagger: 0.1
                }, "copy")
                .addLabel("founder", "copy+=0.12")
                .to(founderFigure, {
                    autoAlpha: 1,
                    y: 0,
                    scale: 1,
                    duration: 1.1,
                    ease: "power4.out"
                }, "founder");

            // Clip-path reveal cinematográfico do frame (desktop)
            if (founderFrame && !isMobile) {
                introTl.to(founderFrame, {
                    clipPath: "inset(0% 0% 0% 0% round 24px)",
                    scale: 1,
                    duration: 1.3,
                    ease: "power4.out"
                }, "founder+=0.06");
            }

            introTl
                .to(founderMeta, {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.58,
                    stagger: 0.09
                }, "founder+=0.55");

            if (founderIndex) {
                introTl.to(founderIndex, {
                    autoAlpha: 1,
                    duration: 0.45
                }, "founder+=0.7");
            }

            // ── Parallax interno da foto (desktop) ──
            if (founderPhoto && founderFrame && !isMobile) {
                gsap.fromTo(
                    founderPhoto,
                    { scale: 1.1, yPercent: -4 },
                    {
                        scale: 1.1,
                        yPercent: 5,
                        ease: "none",
                        scrollTrigger: {
                            id: "about-founder-parallax",
                            trigger: founderFrame,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: 0.9
                        }
                    }
                );
            }

            // ══════════════════════════════════════════════════════
            // 2. ORBS — Parallax profundo com scale progressivo
            // ══════════════════════════════════════════════════════

            if (orbs.length) {
                gsap.set(orbs, { scale: 0.6 });

                gsap.to(orbs, {
                    scale: 1,
                    xPercent: (index) => index === 0 ? -14 : 12,
                    yPercent: (index) => index === 0 ? 30 : -24,
                    ease: "none",
                    scrollTrigger: {
                        id: "about-orbs",
                        trigger: section,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 1.4
                    }
                });
            }

            // ══════════════════════════════════════════════════════
            // 3. SECTION HEADINGS — Reveal sequencial elegante
            // ══════════════════════════════════════════════════════

            sectionHeadings.forEach((heading, index) => {
                const children = gsap.utils.toArray(heading.children);
                gsap.set(children, { autoAlpha: 0, y: isMobile ? 22 : 30 });

                const headingTl = gsap.timeline({
                    defaults: { ease: "power3.out" },
                    scrollTrigger: {
                        id: `about-heading-${index + 1}`,
                        trigger: heading,
                        start: "top 84%",
                        once: true
                    },
                    onComplete: () => gsap.set(children, {
                        clearProps: "transform,opacity,visibility"
                    })
                });

                headingTl.to(children, {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.75,
                    stagger: 0.12
                });
            });

            // ══════════════════════════════════════════════════════
            // 4. DEVPATH PROGRESS — Barra vertical scrub
            // ══════════════════════════════════════════════════════

            if (devPathProgress && devPath) {
                gsap.fromTo(
                    devPathProgress,
                    { scaleY: 0, transformOrigin: "center top" },
                    {
                        scaleY: 1,
                        ease: "none",
                        scrollTrigger: {
                            id: "about-path-progress",
                            trigger: devPath,
                            start: "top 72%",
                            end: "bottom 48%",
                            scrub: 0.65
                        }
                    }
                );
            }

            // ══════════════════════════════════════════════════════
            // 5. TIMELINE ITEMS — Reveal com slide + glow no marker
            // ══════════════════════════════════════════════════════

            gsap.set(timelineItems, { x: isMobile ? 18 : 30 });

            timelineItems.forEach((item, index) => {
                const marker = item.querySelector(".timeline-item__marker");

                ScrollTrigger.create({
                    id: `about-timeline-${index + 1}`,
                    trigger: item,
                    start: "top 64%",
                    end: "bottom 40%",
                    onEnter: () => {
                        item.classList.add("is-active");
                        const tl = gsap.timeline({ defaults: { ease: "power3.out", overwrite: "auto" } });
                        tl.to(item, {
                            x: 0,
                            duration: 0.65,
                            onComplete: () => gsap.set(item, { clearProps: "transform" })
                        });
                        if (marker) {
                            tl.fromTo(marker, {
                                scale: 0.6,
                                rotation: -12
                            }, {
                                scale: 1,
                                rotation: 0,
                                duration: 0.5,
                                ease: "back.out(2.5)"
                            }, 0);
                        }
                    },
                    onEnterBack: () => item.classList.add("is-active"),
                    onLeave: () => item.classList.remove("is-active"),
                    onLeaveBack: () => item.classList.remove("is-active")
                });
            });

            // ══════════════════════════════════════════════════════
            // 6. METHOD CARDS — Stagger profundo + micro-animação ícones
            // ══════════════════════════════════════════════════════

            gsap.set(cards, {
                autoAlpha: 0,
                y: isMobile ? 34 : 48,
                scale: 0.94
            });

            gsap.set(cardIcons, {
                scale: 0.65,
                rotation: -10,
                transformOrigin: "center center"
            });

            ScrollTrigger.batch(cards, {
                start: "top 88%",
                once: true,
                interval: 0.1,
                batchMax: isMobile ? 1 : 2,
                onEnter: (batch) => {
                    gsap.to(batch, {
                        autoAlpha: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.85,
                        stagger: 0.14,
                        ease: "power3.out",
                        overwrite: "auto",
                        onComplete: () => gsap.set(batch, {
                            clearProps: "transform,opacity,visibility"
                        })
                    });

                    // Ícones dos cards visíveis neste batch
                    const batchIcons = batch.map((card) => card.querySelector(".icon-container")).filter(Boolean);
                    gsap.to(batchIcons, {
                        scale: 1,
                        rotation: 0,
                        duration: 0.6,
                        stagger: 0.1,
                        delay: 0.2,
                        ease: "back.out(3)",
                        overwrite: "auto",
                        onComplete: () => gsap.set(batchIcons, { clearProps: "transform" })
                    });
                }
            });

            // ══════════════════════════════════════════════════════
            // 7. PROCESS LINE — Barra horizontal scrub (desktop)
            // ══════════════════════════════════════════════════════

            if (processProgress && processFlow && !isMobile) {
                gsap.fromTo(
                    processProgress,
                    { scaleX: 0, transformOrigin: "left center" },
                    {
                        scaleX: 1,
                        ease: "none",
                        scrollTrigger: {
                            id: "about-process-progress",
                            trigger: processFlow,
                            start: "top 78%",
                            end: "bottom 58%",
                            scrub: 0.7
                        }
                    }
                );
            }

            // ══════════════════════════════════════════════════════
            // 8. PROCESS STEPS — Reveal com ícone rotacional + glow
            // ══════════════════════════════════════════════════════

            gsap.set(processSteps, { autoAlpha: 0, y: isMobile ? 26 : 36 });
            gsap.set(processIcons, {
                scale: 0,
                rotation: -90,
                transformOrigin: "center center"
            });

            ScrollTrigger.batch(processSteps, {
                start: "top 87%",
                once: true,
                interval: 0.12,
                batchMax: isMobile ? 1 : 5,
                onEnter: (batch) => {
                    batch.forEach((step) => step.classList.add("is-active"));

                    gsap.to(batch, {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.72,
                        stagger: 0.12,
                        ease: "power3.out",
                        overwrite: "auto",
                        onComplete: () => gsap.set(batch, {
                            clearProps: "transform,opacity,visibility"
                        })
                    });

                    // Ícones dos steps: reveal rotacional elástico
                    const batchIcons = batch.map((step) => step.querySelector(".process-step__icon")).filter(Boolean);
                    gsap.to(batchIcons, {
                        scale: 1,
                        rotation: 0,
                        duration: 0.7,
                        stagger: 0.1,
                        delay: 0.12,
                        ease: "back.out(2.8)",
                        overwrite: "auto",
                        onComplete: () => gsap.set(batchIcons, { clearProps: "transform" })
                    });
                }
            });

            // ── Cleanup ──
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
    const section = document.querySelector("[data-testimonials-scene]");
    if (!section) return;

    const sticky = section.querySelector(".testimonials-sticky");
    const headingItems = gsap.utils.toArray(".testimonials-heading > *", section);
    const cards = gsap.utils.toArray("[data-testimonial]", section);
    const current = section.querySelector("[data-testimonials-current]");
    const progressFill = section.querySelector("[data-testimonials-progress-fill]");
    const cue = section.querySelector(".testimonials-scroll-cue");

    if (!sticky || !headingItems.length || cards.length !== 4 || !current || !progressFill || !cue) return;

    const setCurrent = (value) => {
        current.textContent = String(value).padStart(2, "0");
    };

    const mm = gsap.matchMedia();

    mm.add(
        {
            desktop: "(min-width: 1024px)",
            mobile: "(max-width: 1023px)",
            reduceMotion: "(prefers-reduced-motion: reduce)"
        },
        (context) => {
            const { desktop, reduceMotion } = context.conditions;
            section.classList.add("is-motion-ready");

            if (reduceMotion) {
                setCurrent(cards.length);
                gsap.set([...headingItems, ...cards, progressFill], { clearProps: "all" });
                gsap.set(progressFill, { scaleX: 1 });
                return () => section.classList.remove("is-motion-ready");
            }

            setCurrent(1);
            gsap.set(progressFill, { scaleX: 0, transformOrigin: "left center" });

            if (desktop) {
                const startStates = [
                    { xPercent: -145, yPercent: -22, rotation: -2.2 },
                    { xPercent: 145, yPercent: -18, rotation: 1.8 },
                    { xPercent: -150, yPercent: 24, rotation: 1.4 },
                    { xPercent: 145, yPercent: 28, rotation: -1.6 }
                ];
                const entryPositions = [0.18, 0.4, 0.62, 0.84];
                const progressThresholds = [0.14, 0.3, 0.47, 0.63];
                let visibleIndex = 1;
                const holdState = { progress: 0 };

                gsap.set(headingItems, { autoAlpha: 0, y: 30 });
                gsap.set(cards, { autoAlpha: 0, scale: 0.9, transformOrigin: "center center" });
                cards.forEach((card, index) => gsap.set(card, startStates[index]));

                const timeline = gsap.timeline({
                    defaults: { ease: "none" },
                    scrollTrigger: {
                        id: "testimonials-editorial-scene",
                        trigger: section,
                        start: "top top",
                        end: () => `+=${Math.max(Math.round(window.innerHeight * 3.2), 2600)}`,
                        pin: sticky,
                        pinSpacing: true,
                        scrub: 0.75,
                        anticipatePin: 1,
                        invalidateOnRefresh: true,
                        onUpdate: (self) => {
                            const nextIndex = Math.min(
                                cards.length,
                                Math.max(1, progressThresholds.filter((point) => self.progress >= point).length)
                            );
                            if (nextIndex !== visibleIndex) {
                                visibleIndex = nextIndex;
                                setCurrent(visibleIndex);
                            }
                        }
                    }
                });

                timeline
                    .addLabel("headingIn", 0)
                    .to(headingItems, {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.2,
                        stagger: 0.035,
                        ease: "power2.out"
                    }, "headingIn")
                    .to(cue, { autoAlpha: 0, y: 8, duration: 0.14, ease: "power2.out" }, 0.1)
                    .to(progressFill, { scaleX: 1, duration: 1.04 }, 0.14);

                cards.forEach((card, index) => {
                    timeline.to(card, {
                        autoAlpha: 1,
                        xPercent: 0,
                        yPercent: 0,
                        scale: 1,
                        rotation: 0,
                        duration: 0.28,
                        ease: "power2.out"
                    }, entryPositions[index]);
                });

                timeline.to(holdState, { progress: 1, duration: 0.22 }, 1.13);

                requestAnimationFrame(() => ScrollTrigger.refresh());

                return () => {
                    section.classList.remove("is-motion-ready");
                    setCurrent(1);
                };
            }

            gsap.fromTo(
                headingItems,
                { autoAlpha: 0, y: 28 },
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.65,
                    stagger: 0.07,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: section,
                        start: "top 78%",
                        once: true
                    }
                }
            );

            cards.forEach((card, index) => {
                gsap.fromTo(
                    card,
                    {
                        autoAlpha: 0,
                        xPercent: index % 2 === 0 ? -8 : 8,
                        y: 56,
                        scale: 0.96
                    },
                    {
                        autoAlpha: 1,
                        xPercent: 0,
                        y: 0,
                        scale: 1,
                        duration: 0.72,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: card,
                            start: "top 88%",
                            once: true,
                            onEnter: () => {
                                setCurrent(index + 1);
                                gsap.to(progressFill, {
                                    scaleX: (index + 1) / cards.length,
                                    duration: 0.3,
                                    ease: "power2.out",
                                    overwrite: true
                                });
                            }
                        }
                    }
                );
            });

            requestAnimationFrame(() => ScrollTrigger.refresh());

            return () => {
                section.classList.remove("is-motion-ready");
                setCurrent(1);
            };
        },
        section
    );
}
function initMetricsAnimation() {
    const section = document.querySelector(".metrics-section");
    if (!section) return;

    const metricItems = gsap.utils.toArray(".metric-item", section);
    const metricNumbers = gsap.utils.toArray(".metric-number", section);
    const marqueeWrapper = section.querySelector(".metrics-marquee-wrapper");
    const revealOwnedByHeroMask = Boolean(section.closest("[data-hero-mask-scene]"));

    /**
     * Formata o número de acordo com os data-attributes:
     * prefix, suffix e separator (milhares)
     */
    function formatMetric(value, el) {
        const prefix = el.dataset.countPrefix || "";
        const suffix = el.dataset.countSuffix || "";
        const separator = el.dataset.countSeparator;
        const decimals = parseInt(el.dataset.countDecimals || "0", 10);

        let formatted;
        if (decimals > 0) {
            formatted = value.toFixed(decimals);
        } else {
            formatted = String(Math.round(value));
        }

        if (separator && decimals === 0) {
            formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
        }

        return prefix + formatted + suffix;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
        metricNumbers.forEach((el) => {
            const target = parseFloat(el.dataset.countTarget);
            el.textContent = formatMetric(target, el);
        });
        return;
    }

    const isMobile = window.innerWidth < 768;

    // ── Estado inicial via GSAP ──
    if (!revealOwnedByHeroMask) {
        gsap.set(metricItems, { autoAlpha: 0, y: isMobile ? 20 : 30 });
        if (marqueeWrapper) gsap.set(marqueeWrapper, { autoAlpha: 0, y: 16 });
    }

    // Seta os textos para zero (o HTML mostra os valores finais como fallback)
    metricNumbers.forEach((el) => {
        el.textContent = formatMetric(0, el);
    });

    // ── ScrollTrigger separado com onEnter ──
    ScrollTrigger.create({
        id: "metrics-countup",
        trigger: section,
        start: "top 85%",
        once: true,
        onEnter: () => {
            // 1. Reveal dos items com stagger
            if (!revealOwnedByHeroMask) {
                gsap.to(metricItems, {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.7,
                    stagger: 0.1,
                    ease: "power3.out",
                    onComplete: () => gsap.set(metricItems, {
                        clearProps: "transform,opacity,visibility"
                    })
                });
            }

            // 2. CountUp de cada número com proxy independente
            metricNumbers.forEach((el, index) => {
                const target = parseFloat(el.dataset.countTarget);
                const decimals = parseInt(el.dataset.countDecimals || "0", 10);
                const proxy = { value: 0 };

                gsap.to(proxy, {
                    value: target,
                    duration: 2.2,
                    delay: index * 0.1,
                    ease: "power2.out",
                    onUpdate: () => {
                        const current = decimals > 0
                            ? parseFloat(proxy.value.toFixed(decimals))
                            : Math.round(proxy.value);
                        el.textContent = formatMetric(current, el);
                    }
                });
            });

            // 3. Reveal do marquee
            if (marqueeWrapper && !revealOwnedByHeroMask) {
                gsap.to(marqueeWrapper, {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.6,
                    delay: 0.35,
                    ease: "power3.out"
                });
            }
        }
    });
}

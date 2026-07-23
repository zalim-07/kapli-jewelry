import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initJourneySections() {
    const sections = document.querySelectorAll('[data-journey]');

    sections.forEach((section) => {
        const stickyElement = section.querySelector(
            '[data-journey-sticky]',
        );

        const progressElement = section.querySelector(
            '[data-journey-progress]',
        );

        const steps = [
            ...section.querySelectorAll('[data-journey-step]'),
        ];

        const images = [
            ...section.querySelectorAll('[data-journey-image]'),
        ];

        if (
            !stickyElement ||
            !progressElement ||
            steps.length === 0
        ) {
            return;
        }

        const lastIndex = steps.length - 1;
        let activeIndex = -1;

        function getStepIndex(animationProgress, scrollProgress) {
            if (lastIndex <= 0) {
                return 0;
            }

            const clampedScroll = Math.min(
                1,
                Math.max(0, scrollProgress),
            );

            if (clampedScroll >= 1 - 1e-4) {
                return lastIndex;
            }

            if (
                clampedScroll >=
                (lastIndex - 0.5) / lastIndex
            ) {
                return lastIndex;
            }

            return Math.min(
                lastIndex,
                Math.floor(
                    animationProgress * lastIndex + 1e-6,
                ),
            );
        }

        function setActiveStep(index) {
            const safeIndex = Math.max(
                0,
                Math.min(lastIndex, index),
            );

            if (safeIndex === activeIndex) {
                return;
            }

            activeIndex = safeIndex;

            section.classList.toggle(
                'is-last-step',
                safeIndex === lastIndex,
            );

            steps.forEach((step, stepIndex) => {
                const isActive = stepIndex === safeIndex;
                const isComplete =
                    stepIndex < safeIndex ||
                    (safeIndex === lastIndex &&
                        stepIndex === lastIndex);

                step.classList.toggle('is-active', isActive);
                step.classList.toggle('is-complete', isComplete);
            });

            images.forEach((image, imageIndex) => {
                const isActive = imageIndex === safeIndex;

                image.classList.toggle('is-active', isActive);

                image.setAttribute(
                    'aria-hidden',
                    String(!isActive),
                );
            });
        }

        setActiveStep(0);

        const media = gsap.matchMedia();

        media.add(
            '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
            () => {
                /*
                 * Для пяти этапов секция остаётся закреплённой
                 * примерно на четыре высоты экрана.
                 *
                 * Умножитель можно уменьшить до 0.7–0.8,
                 * если переключение кажется слишком долгим.
                 */
                const getScrollDistance = () =>
                    window.innerHeight * lastIndex;

                const progressAnimation = gsap.fromTo(
                    progressElement,
                    {
                        scaleY: 0,
                    },
                    {
                        scaleY: 1,
                        ease: 'none',
                    },
                );

                const scrollTrigger = ScrollTrigger.create({
                    trigger: section,
                    pin: stickyElement,

                    start: 'top top',

                    end: () => `+=${getScrollDistance()}`,

                    animation: progressAnimation,

                    scrub: 0.35,

                    /*
                     * Плавно доводит прокрутку до ближайшего этапа.
                     * Этот блок можно удалить, если snap не нужен.
                     */
                    snap:
                        lastIndex > 0
                            ? {
                                snapTo: 1 / lastIndex,
                                duration: {
                                    min: 0.15,
                                    max: 0.4,
                                },
                                delay: 0.08,
                                ease: 'power1.inOut',
                            }
                            : false,

                    pinSpacing: true,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,

                    onUpdate(self) {
                        setActiveStep(
                            getStepIndex(
                                progressAnimation.progress(),
                                self.progress,
                            ),
                        );
                    },

                    onLeave: () => {
                        setActiveStep(lastIndex);
                    },
                });

                return () => {
                    scrollTrigger.kill();
                    progressAnimation.kill();

                    gsap.set(progressElement, {
                        clearProps: 'transform',
                    });

                    setActiveStep(0);
                };
            },
        );
    });
}
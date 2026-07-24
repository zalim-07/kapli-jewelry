import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initJourneySections() {
    const sections = document.querySelectorAll('[data-journey]');

    sections.forEach((section) => {
        const scrollerElement = section.querySelector(
            '[data-journey-scroller]',
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
            !scrollerElement ||
            !progressElement ||
            steps.length === 0
        ) {
            return;
        }

        const lastIndex = steps.length - 1;
        const BUFFER_RATIO = 0.035;
        let activeIndex = -1;

        function getScrollMetrics() {
            return {
                stepsStart: BUFFER_RATIO,
                stepsEnd: 1 - BUFFER_RATIO,
                stepsRange: 1 - BUFFER_RATIO * 2,
            };
        }

        function getStepsProgress(scrollProgress) {
            if (lastIndex <= 0) {
                return 0;
            }

            const clampedScroll = Math.min(
                1,
                Math.max(0, scrollProgress),
            );
            const { stepsStart, stepsEnd, stepsRange } =
                getScrollMetrics();

            if (clampedScroll <= stepsStart) {
                return 0;
            }

            if (clampedScroll >= stepsEnd) {
                return 1;
            }

            return (clampedScroll - stepsStart) / stepsRange;
        }

        function getStepIndex(scrollProgress) {
            if (lastIndex <= 0) {
                return 0;
            }

            const stepsProgress = getStepsProgress(scrollProgress);

            return Math.min(
                lastIndex,
                Math.floor(stepsProgress * lastIndex + 1e-6),
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

        function updateScrollState(scrollProgress) {
            gsap.set(progressElement, {
                scaleY: getStepsProgress(scrollProgress),
            });

            setActiveStep(getStepIndex(scrollProgress));
        }

        setActiveStep(0);

        const media = gsap.matchMedia();

        media.add(
            '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
            () => {
                section.classList.add('is-scroll-active');

                function setScrollerHeight() {
                    scrollerElement.style.height = `${window.innerHeight * (lastIndex + 1)}px`;
                }

                setScrollerHeight();

                const scrollTrigger = ScrollTrigger.create({
                    trigger: scrollerElement,
                    start: 'top top',
                    end: 'bottom bottom',
                    invalidateOnRefresh: true,

                    onUpdate(self) {
                        updateScrollState(self.progress);
                    },

                    onLeave: () => {
                        updateScrollState(1);
                    },

                    onLeaveBack: () => {
                        updateScrollState(0);
                    },
                });

                const onRefreshInit = () => {
                    setScrollerHeight();
                };

                ScrollTrigger.addEventListener(
                    'refreshInit',
                    onRefreshInit,
                );

                ScrollTrigger.refresh();

                return () => {
                    ScrollTrigger.removeEventListener(
                        'refreshInit',
                        onRefreshInit,
                    );

                    scrollTrigger.kill();
                    section.classList.remove('is-scroll-active');
                    scrollerElement.style.removeProperty('height');

                    gsap.set(progressElement, {
                        clearProps: 'transform',
                    });

                    setActiveStep(0);
                };
            },
        );
    });
}

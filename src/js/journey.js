import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scheduleScrollTriggerRefresh } from './scroll-trigger-refresh.js';

gsap.registerPlugin(ScrollTrigger);

const DESKTOP_MAX = 1439;

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

        function setActiveStep(index, { withComplete = true } = {}) {
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
                const isAccordion = section.classList.contains(
                    'is-accordion-active',
                );
                const isComplete = isAccordion
                    ? stepIndex < safeIndex
                    : withComplete && (
                        stepIndex < safeIndex ||
                        (safeIndex === lastIndex &&
                            stepIndex === lastIndex)
                    );

                step.classList.toggle('is-active', isActive);
                step.classList.toggle('is-complete', isComplete);

                const trigger = step.querySelector('.journey__trigger');

                trigger?.setAttribute(
                    'aria-expanded',
                    String(isActive),
                );
            });

            images.forEach((image, imageIndex) => {
                const isActive = imageIndex === safeIndex;

                image.classList.toggle('is-active', isActive);

                image.setAttribute(
                    'aria-hidden',
                    String(!isActive),
                );
            });

            if (section.classList.contains('is-accordion-active')) {
                requestAnimationFrame(() => {
                    updateAccordionProgress({ animate: true });
                });
            }
        }

        function updateAccordionProgress({ animate = false } = {}) {
            if (!section.classList.contains('is-accordion-active')) {
                return;
            }

            const stepsWrap = section.querySelector('.journey__steps-wrap');
            const stepsList = section.querySelector('.journey__steps');
            const activeStep = steps[activeIndex];
            const activeNumber = activeStep?.querySelector('.journey__number');
            const progressHeight = progressElement.offsetHeight;
            const railTop = 20;
            const shouldAnimate =
                animate &&
                !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            if (
                !stepsWrap ||
                !stepsList ||
                !activeStep ||
                !activeNumber ||
                activeIndex < 0 ||
                progressHeight <= 0
            ) {
                section.classList.remove('is-progress-animated');
                gsap.set(progressElement, { scaleY: 0 });
                return;
            }

            let progressEnd = stepsList.offsetTop;

            for (let index = 0; index < activeIndex; index += 1) {
                const step = steps[index];
                const trigger = step.querySelector('.journey__trigger');
                const paddingBottom =
                    Number.parseFloat(getComputedStyle(step).paddingBottom) || 0;

                progressEnd += (trigger?.offsetHeight ?? 0) + paddingBottom;
            }

            let numberOffset = 0;
            let node = activeNumber;

            while (node && node !== activeStep) {
                numberOffset += node.offsetTop;
                node = node.offsetParent;
            }

            progressEnd += numberOffset + activeNumber.offsetHeight / 2;

            const scale = Math.min(
                1,
                Math.max(0, (progressEnd - railTop) / progressHeight),
            );

            if (shouldAnimate) {
                section.classList.add('is-progress-animated');
                requestAnimationFrame(() => {
                    gsap.set(progressElement, { scaleY: scale });
                });
                return;
            }

            section.classList.remove('is-progress-animated');
            progressElement.style.transition = 'none';
            gsap.set(progressElement, { scaleY: scale });
            progressElement.offsetHeight;
            progressElement.style.removeProperty('transition');
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
            `(min-width: ${DESKTOP_MAX + 1}px) and (prefers-reduced-motion: no-preference)`,
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

                scheduleScrollTriggerRefresh();

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

        media.add(`(max-width: ${DESKTOP_MAX}px)`, () => {
            section.classList.add('is-accordion-active');
            setActiveStep(0);

            const stepsWrap = section.querySelector('.journey__steps-wrap');

            function updateStepsMinHeight() {
                if (!stepsWrap) {
                    return;
                }

                const wrapStyles = getComputedStyle(stepsWrap);
                let height = Number.parseFloat(wrapStyles.paddingTop) || 0;
                let maxAnswerHeight = 0;

                steps.forEach((step) => {
                    const trigger = step.querySelector('.journey__trigger');
                    const answerInner = step.querySelector(
                        '.journey__answer-inner',
                    );
                    const stepStyles = getComputedStyle(step);

                    height += trigger?.offsetHeight ?? 0;
                    height += Number.parseFloat(stepStyles.paddingBottom) || 0;

                    if (answerInner) {
                        maxAnswerHeight = Math.max(
                            maxAnswerHeight,
                            answerInner.scrollHeight,
                        );
                    }
                });

                stepsWrap.style.minHeight = `${height + maxAnswerHeight}px`;
                updateAccordionProgress();
            }

            updateStepsMinHeight();

            window.addEventListener('resize', updateStepsMinHeight, {
                passive: true,
            });

            document.fonts?.ready.then(updateStepsMinHeight);

            const handlers = steps.map((step, index) => {
                const trigger = step.querySelector('.journey__trigger');

                const handler = () => {
                    setActiveStep(index);
                };

                trigger?.addEventListener('click', handler);

                return { trigger, handler };
            });

            return () => {
                section.classList.remove('is-accordion-active');
                section.classList.remove('is-progress-animated');

                window.removeEventListener('resize', updateStepsMinHeight);

                stepsWrap?.style.removeProperty('min-height');

                gsap.set(progressElement, {
                    clearProps: 'transform',
                });

                handlers.forEach(({ trigger, handler }) => {
                    trigger?.removeEventListener('click', handler);
                });

                setActiveStep(0);
            };
        });
    });
}

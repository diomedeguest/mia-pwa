/* Diomede Luxury - funzioni comuni + WOW Pack */
(function () {
    'use strict';

    const scriptUrl = document.currentScript && document.currentScript.src;
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function appRootUrl() {
        try { return scriptUrl ? new URL('../../', scriptUrl) : new URL('/', location.href); }
        catch (_) { return null; }
    }

    function transitionVeil() {
        let veil = document.querySelector('.diomede-transition-veil');
        if (!veil) {
            veil = document.createElement('div');
            veil.className = 'diomede-transition-veil';
            document.body.appendChild(veil);
        }
        return veil;
    }

    function rememberDirection(direction) {
        try { sessionStorage.setItem('diomede-transition-direction', direction); } catch (_) {}
    }

    function playExit(direction, action) {
        if (reduceMotion) { action(); return; }

        rememberDirection(direction);
        document.body.classList.remove(
            'diomede-page-enter',
            'diomede-page-enter-forward',
            'diomede-page-enter-back'
        );
        document.body.classList.add(direction === 'back' ? 'diomede-page-leave-back' : 'diomede-page-leave');

        const veil = transitionVeil();
        veil.classList.remove('diomede-veil-in');
        veil.classList.add('diomede-veil-out');

        window.setTimeout(action, 405);
    }

    window.diomedeGoBack = function () {
        playExit('back', function () {
            if (window.history.length > 1) {
                window.history.back();
                return;
            }
            const path = window.location.pathname;
            if (path.includes('/pages/istruzioni/')) {
                window.location.href = '../istruzioni.html';
            } else if (path.includes('/pages/partners/')) {
                window.location.href = '../convenzioni.html';
            } else if (path.includes('/pages/')) {
                window.location.href = 'menu.html';
            } else {
                window.location.href = 'pages/menu.html';
            }
        });
    };

    function unlockOrientation() {
        try {
            if (screen.orientation && typeof screen.orientation.unlock === 'function') {
                screen.orientation.unlock();
            }
        } catch (_) {}
    }

    function pulseHaptic() {
        try {
            if (navigator.vibrate) navigator.vibrate(7);
        } catch (_) {}
    }

    function enhanceLanguageControls() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.setAttribute('role', 'button');
            btn.setAttribute('tabindex', '0');
            btn.setAttribute('aria-label', btn.textContent.trim() === 'ITA' ? 'Italiano' : 'English');
            const updateState = () => btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
            updateState();
            btn.addEventListener('click', () => {
                pulseHaptic();
                setTimeout(() => {
                    updateState();
                    updateMenuGreeting();
                }, 0);
            });
            btn.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    btn.click();
                }
            });
            new MutationObserver(updateState).observe(btn, { attributes: true, attributeFilter: ['class'] });
        });
    }

    function updateMenuGreeting() {
        const el = document.querySelector('.welcome-text');
        if (!el || !document.body.classList.contains('diomede-menu-page')) return;
        const lang = localStorage.getItem('preferredLang') || 'it';
        const hour = new Date().getHours();
        let text;
        if (lang === 'en') {
            text = hour < 12 ? 'Good morning' : (hour < 18 ? 'Good afternoon' : 'Good evening');
        } else {
            text = hour < 12 ? 'Buongiorno' : (hour < 18 ? 'Buon pomeriggio' : 'Buonasera');
        }
        el.textContent = text;
    }

    function classifyPage() {
        const path = window.location.pathname;
        if (path.endsWith('/menu.html')) document.body.classList.add('diomede-menu-page');
        if (path.includes('/pages/istruzioni/')) document.body.classList.add('diomede-instruction-detail');
    }

    function setupPageEntrance() {
        if (reduceMotion) return;

        let direction = 'forward';
        try {
            direction = sessionStorage.getItem('diomede-transition-direction') || 'forward';
            sessionStorage.removeItem('diomede-transition-direction');
        } catch (_) {}

        const enterClass = direction === 'back' ? 'diomede-page-enter-back' : 'diomede-page-enter-forward';
        document.body.classList.add(enterClass);

        const veil = transitionVeil();
        veil.classList.remove('diomede-veil-out');
        veil.classList.add('diomede-veil-in');

        window.setTimeout(() => {
            document.body.classList.remove(enterClass);
            veil.classList.remove('diomede-veil-in');
        }, 620);
    }

    function isNavigableInternalLink(a) {
        if (!a || !a.href) return false;
        if (a.target && a.target !== '_self') return false;
        if (a.hasAttribute('download')) return false;
        const raw = (a.getAttribute('href') || '').trim();
        if (!raw || raw === '#' || raw.startsWith('#') || /^(mailto:|tel:|sms:|javascript:)/i.test(raw)) return false;
        try {
            const u = new URL(a.href, window.location.href);
            if (u.origin !== window.location.origin) return false;
            if (u.pathname === window.location.pathname && u.search === window.location.search && u.hash) return false;
            return true;
        } catch (_) { return false; }
    }

    function setupPageTransitions() {
        document.addEventListener('click', event => {
            if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            const a = event.target.closest && event.target.closest('a');
            if (!isNavigableInternalLink(a)) return;
            event.preventDefault();
            pulseHaptic();
            const href = a.href;
            playExit('forward', () => { window.location.href = href; });
        });
    }

    function setupReveal() {
        const selectors = [
            '.instruction-section > .instruction-card', '.instruction-section > .step-card',
            '.info-card', '.contact-card', '.category-card', '.destination-card',
            '.promo-card', '.wifi-card', '.qr-card', '.video-guide-card', '.tip-note',
            '.info-section', '.category-section'
        ];
        const nodes = Array.from(document.querySelectorAll(selectors.join(',')));
        if (!nodes.length) return;

        if (reduceMotion || !('IntersectionObserver' in window)) {
            nodes.forEach(el => el.classList.add('diomede-visible'));
            return;
        }

        nodes.forEach((el, index) => {
            el.classList.add('diomede-reveal');
            el.style.transitionDelay = Math.min(index % 4, 3) * 45 + 'ms';
        });

        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('diomede-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.09, rootMargin: '0px 0px -18px 0px' });
        nodes.forEach(el => io.observe(el));
    }

    function setupInstructionHeader() {
        if (!document.body.classList.contains('instruction-page')) return;
        let ticking = false;
        const update = () => {
            document.body.classList.toggle('diomede-scrolled', window.scrollY > 56);
            ticking = false;
        };
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        }, { passive: true });
        update();
    }

    function setupHaptics() {
        const selector = '.back-btn,.action-btn,.maps-btn,.confirm-btn,.diomede-global-back,.diomede-home-btn,.btn,.water-controls-trigger,.idro-legend-trigger';
        document.addEventListener('pointerdown', event => {
            if (event.target.closest && event.target.closest(selector)) pulseHaptic();
        }, { passive: true });
    }

    function registerServiceWorker() {
        if (!('serviceWorker' in navigator) || !scriptUrl) return;
        try {
            const appRoot = new URL('../../', scriptUrl);
            const swUrl = new URL('sw.js', appRoot);
            navigator.serviceWorker.register(swUrl.href, { scope: appRoot.pathname }).catch(() => {});
        } catch (_) {}
    }

    document.addEventListener('DOMContentLoaded', () => {
        unlockOrientation();
        classifyPage();
        enhanceLanguageControls();
        updateMenuGreeting();
        setupPageEntrance();
        setupPageTransitions();
        setupReveal();
        setupInstructionHeader();
        setupHaptics();
    });
    window.addEventListener('pageshow', event => {
        unlockOrientation();
        document.body.classList.remove(
            'diomede-page-leave',
            'diomede-page-leave-back',
            'diomede-page-enter-forward',
            'diomede-page-enter-back'
        );
        if (event.persisted && !reduceMotion) setupPageEntrance();
        updateMenuGreeting();
    });
    window.addEventListener('load', registerServiceWorker);
})();

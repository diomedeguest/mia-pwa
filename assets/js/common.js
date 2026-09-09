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
        if (path.endsWith('/menu.html')) {
            document.body.classList.add('diomede-menu-page');
        } else if (/\/pages\/[^/]+\.html$/.test(path)) {
            document.body.classList.add('diomede-menu-child-page');
        }
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
            '.instruction-section > .instruction-card',
            '.instruction-section > .step-card',
            '.instruction-card', '.info-card', '.info-row',
            '.contact-card', '.contact-group', '.emergency-item',
            '.category-card', '.category-section', '.category-header',
            '.destination-card', '.promo-card',
            '.wifi-card', '.qr-card', '.info-box',
            '.video-guide-card', '.tip-note',
            '.info-section', '.checkout-time', '.thanks-message',
            '.confirm-section', '.back-btn-container',
            '.container > .back-btn'
        ];

        function collect(rootNode) {
            const scope = rootNode && rootNode.querySelectorAll ? rootNode : document;
            return Array.from(scope.querySelectorAll(selectors.join(',')));
        }

        function prepare(nodes) {
            let prepared = 0;
            nodes.forEach(el => {
                if (el.dataset.diomedeRevealReady === '1') return;
                el.dataset.diomedeRevealReady = '1';
                el.classList.add('diomede-reveal');

                const index = document.querySelectorAll('[data-diomede-reveal-ready="1"]').length - 1;
                const delay = Math.min(index % 7, 6) * 82;
                el.style.transitionDelay = delay + 'ms';

                if (document.body.classList.contains('diomede-menu-child-page')) {
                    if (index % 3 === 1) el.classList.add('diomede-from-left');
                    if (index % 3 === 2) el.classList.add('diomede-from-right');
                }

                if (reduceMotion || !('IntersectionObserver' in window)) {
                    el.classList.add('diomede-visible');
                } else {
                    revealObserver.observe(el);
                }
                prepared++;
            });
            return prepared;
        }

        const revealObserver = (!reduceMotion && 'IntersectionObserver' in window)
            ? new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('diomede-visible');
                        revealObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.08, rootMargin: '0px 0px -12px 0px' })
            : null;

        prepare(collect(document));

        /* Alcune pagine (es. Territorio) costruiscono le card dopo il DOMContentLoaded. */
        const mutationObserver = new MutationObserver(mutations => {
            const added = [];
            mutations.forEach(m => {
                m.addedNodes.forEach(node => {
                    if (!node || node.nodeType !== 1) return;
                    if (node.matches && node.matches(selectors.join(','))) added.push(node);
                    if (node.querySelectorAll) added.push(...collect(node));
                });
            });
            if (added.length) {
                prepare([...new Set(added)]);
            }
        });
        mutationObserver.observe(document.body, { childList:true, subtree:true });
    }

    function setupMenuMotion() {
        if (!document.body.classList.contains('diomede-menu-page') || reduceMotion) return;

        const applyIndexes = () => {
            document.querySelectorAll('#main-grid .btn').forEach((btn, index) => {
                btn.style.setProperty('--diomede-menu-index', index);
            });
        };

        applyIndexes();

        const grid = document.getElementById('main-grid');
        if (grid) {
            new MutationObserver(applyIndexes).observe(grid, { childList:true });
        }
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
        setupMenuMotion();
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

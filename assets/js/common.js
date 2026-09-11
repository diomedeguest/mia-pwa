/* Diomede Luxury - funzioni comuni + WOW Pack */
(function () {
    'use strict';

    const scriptUrl = document.currentScript && document.currentScript.src;
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function appRootUrl() {
        try { return scriptUrl ? new URL('../../', scriptUrl) : new URL('/', location.href); }
        catch (_) { return null; }
    }


    /* ----------------------------------------------------------
       DUE MODALITÀ DELLA PWA
       - guest: smartphone personale, link esterni normali
       - kiosk: tablet fisso, link esterni trasformati in QR
       ---------------------------------------------------------- */
    function resolveDiomedeMode() {
        let mode = 'guest';
        try {
            const params = new URLSearchParams(window.location.search);
            const requested = (params.get('mode') || '').toLowerCase();
            if (requested === 'kiosk') localStorage.setItem('diomedeMode', 'kiosk');
            if (requested === 'guest') localStorage.removeItem('diomedeMode');
            mode = localStorage.getItem('diomedeMode') === 'kiosk' ? 'kiosk' : 'guest';
        } catch (_) {}
        return mode;
    }

    const diomedeMode = resolveDiomedeMode();
    const isKioskMode = diomedeMode === 'kiosk';
    window.DiomedeMode = diomedeMode;

    function applyModeClass() {
        document.documentElement.classList.toggle('diomede-kiosk-mode', isKioskMode);
        if (document.body) document.body.classList.toggle('diomede-kiosk-mode', isKioskMode);
    }
    applyModeClass();

    function preserveModeInInternalLink(a) {
        if (!a || !isKioskMode) return;
        const raw = (a.getAttribute('href') || '').trim();
        if (!raw || raw === '#' || raw.startsWith('#') || /^(javascript:|mailto:|tel:|sms:|geo:|whatsapp:)/i.test(raw)) return;
        try {
            const u = new URL(raw, window.location.href);
            if (u.origin !== window.location.origin) return;
            u.searchParams.set('mode', 'kiosk');
            a.href = u.href;
        } catch (_) {}
    }

    function preserveModeOnInternalLinks(rootNode) {
        if (!isKioskMode) return;
        const root = rootNode && rootNode.querySelectorAll ? rootNode : document;
        root.querySelectorAll('a[href]').forEach(preserveModeInInternalLink);
    }

    function isExternalActionHref(rawHref) {
        const raw = (rawHref || '').trim();
        if (!raw || raw === '#' || raw.startsWith('#') || /^javascript:/i.test(raw)) return false;
        if (/^(tel:|mailto:|sms:|geo:|whatsapp:)/i.test(raw)) return true;
        try {
            const url = new URL(raw, window.location.href);
            return /^https?:$/i.test(url.protocol) && url.origin !== window.location.origin;
        } catch (_) {
            return false;
        }
    }

    function kioskActionInfo(rawHref) {
        const href = (rawHref || '').trim();
        const lang = (() => {
            try { return localStorage.getItem('preferredLang') === 'en' ? 'en' : 'it'; }
            catch (_) { return 'it'; }
        })();
        const lower = href.toLowerCase();
        let type = 'web';
        if (lower.startsWith('tel:')) type = 'phone';
        else if (lower.startsWith('mailto:')) type = 'email';
        else if (lower.startsWith('sms:')) type = 'sms';
        else if (lower.startsWith('geo:') || /google\.[^/]+\/maps|maps\.google|maps\.apple|\/maps\//i.test(lower)) type = 'maps';
        else if (/wa\.me|whatsapp\.com|whatsapp:/i.test(lower)) type = 'whatsapp';

        const copy = {
            it: {
                web: ['Continua sul tuo smartphone', 'Scansiona il QR code per aprire questo sito sul tuo telefono.'],
                maps: ['Apri la posizione sul telefono', 'Scansiona il QR code per aprire la mappa sul tuo smartphone.'],
                whatsapp: ['Continua su WhatsApp', 'Scansiona il QR code per aprire WhatsApp sul tuo telefono.'],
                phone: ['Chiama dal tuo telefono', 'Scansiona il QR code oppure usa il numero indicato.'],
                email: ['Invia l’email dal tuo telefono', 'Scansiona il QR code per aprire la tua app email.'],
                sms: ['Continua dal tuo telefono', 'Scansiona il QR code per aprire i messaggi sul tuo smartphone.']
            },
            en: {
                web: ['Continue on your smartphone', 'Scan the QR code to open this website on your phone.'],
                maps: ['Open the location on your phone', 'Scan the QR code to open the map on your smartphone.'],
                whatsapp: ['Continue on WhatsApp', 'Scan the QR code to open WhatsApp on your phone.'],
                phone: ['Call from your phone', 'Scan the QR code or use the number shown below.'],
                email: ['Send the email from your phone', 'Scan the QR code to open your email app.'],
                sms: ['Continue on your phone', 'Scan the QR code to open messages on your smartphone.']
            }
        };
        return { type, lang, title: copy[lang][type][0], subtitle: copy[lang][type][1] };
    }

    function prettyKioskDestination(rawHref) {
        const href = (rawHref || '').trim();
        if (/^tel:/i.test(href)) return href.replace(/^tel:/i, '').replace(/^(\+39)(\d{3})(\d+)/, '$1 $2 $3');
        if (/^mailto:/i.test(href)) return decodeURIComponent(href.replace(/^mailto:/i, '').split('?')[0]);
        if (/^sms:/i.test(href)) return href.replace(/^sms:/i, '').split('?')[0];
        if (/wa\.me\//i.test(href)) {
            const m = href.match(/wa\.me\/([0-9]+)/i);
            if (m) return 'WhatsApp · +' + m[1];
        }
        try {
            const u = new URL(href, window.location.href);
            return u.hostname.replace(/^www\./, '') + (u.pathname !== '/' ? u.pathname : '');
        } catch (_) { return href; }
    }

    let kioskQrPromise = null;
    function ensureKioskQrLibrary() {
        if (window.DiomedeQR) return Promise.resolve(window.DiomedeQR);
        if (kioskQrPromise) return kioskQrPromise;
        kioskQrPromise = new Promise((resolve, reject) => {
            const root = appRootUrl();
            if (!root) { reject(new Error('App root unavailable')); return; }
            const script = document.createElement('script');
            script.src = new URL('assets/js/qrcode-local.js', root).href;
            script.async = true;
            script.onload = () => window.DiomedeQR ? resolve(window.DiomedeQR) : reject(new Error('QR library unavailable'));
            script.onerror = () => reject(new Error('QR library failed to load'));
            document.head.appendChild(script);
        });
        return kioskQrPromise;
    }

    function getKioskModal() {
        let overlay = document.getElementById('diomede-kiosk-overlay');
        if (overlay) return overlay;

        overlay = document.createElement('div');
        overlay.id = 'diomede-kiosk-overlay';
        overlay.className = 'diomede-kiosk-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        overlay.innerHTML = `
            <div class="diomede-kiosk-modal" role="dialog" aria-modal="true" aria-labelledby="diomede-kiosk-title">
                <button type="button" class="diomede-kiosk-close" aria-label="Chiudi">×</button>
                <div class="diomede-kiosk-symbol" aria-hidden="true"><span class="material-symbols-outlined">qr_code_2</span></div>
                <h2 id="diomede-kiosk-title"></h2>
                <p class="diomede-kiosk-subtitle"></p>
                <div class="diomede-kiosk-qr"><span class="diomede-kiosk-loading">QR…</span></div>
                <div class="diomede-kiosk-destination"></div>
                <button type="button" class="diomede-kiosk-done">Chiudi</button>
            </div>`;
        document.body.appendChild(overlay);

        const close = () => {
            overlay.classList.remove('is-open');
            overlay.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('diomede-kiosk-modal-open');
        };
        overlay.querySelector('.diomede-kiosk-close').addEventListener('click', close);
        overlay.querySelector('.diomede-kiosk-done').addEventListener('click', close);
        overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
        document.addEventListener('keydown', event => { if (event.key === 'Escape' && overlay.classList.contains('is-open')) close(); });
        return overlay;
    }

    async function showKioskQr(rawHref) {
        const overlay = getKioskModal();
        const info = kioskActionInfo(rawHref);
        const modal = overlay.querySelector('.diomede-kiosk-modal');
        const qrHolder = overlay.querySelector('.diomede-kiosk-qr');
        overlay.querySelector('#diomede-kiosk-title').textContent = info.title;
        overlay.querySelector('.diomede-kiosk-subtitle').textContent = info.subtitle;
        overlay.querySelector('.diomede-kiosk-destination').textContent = prettyKioskDestination(rawHref);
        overlay.querySelector('.diomede-kiosk-done').textContent = info.lang === 'en' ? 'Close' : 'Chiudi';
        overlay.querySelector('.diomede-kiosk-close').setAttribute('aria-label', info.lang === 'en' ? 'Close' : 'Chiudi');
        modal.dataset.kioskType = info.type;
        qrHolder.innerHTML = '<span class="diomede-kiosk-loading">QR…</span>';
        overlay.classList.add('is-open');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('diomede-kiosk-modal-open');
        pulseHaptic();

        try {
            const qr = await ensureKioskQrLibrary();
            qrHolder.innerHTML = qr.createSvg(rawHref, { quiet: 4 });
        } catch (_) {
            qrHolder.innerHTML = '<span class="diomede-kiosk-loading">QR non disponibile</span>';
        }
    }

    function markKioskLinks() {
        if (!isKioskMode) return;
        document.querySelectorAll('a[href]').forEach(a => {
            const raw = a.getAttribute('href') || '';
            if (!isExternalActionHref(raw)) return;
            a.classList.add('diomede-kiosk-external');
            a.setAttribute('data-diomede-kiosk-link', '1');
            a.setAttribute('aria-haspopup', 'dialog');
            a.removeAttribute('target');
        });
    }

    function setupKioskMode() {
        applyModeClass();
        if (!isKioskMode) return;
        preserveModeOnInternalLinks(document);
        markKioskLinks();

        /* Pagine come Territorio possono creare i link dopo il caricamento. */
        new MutationObserver(mutations => {
            mutations.forEach(m => m.addedNodes.forEach(node => {
                if (!node || node.nodeType !== 1) return;
                if (node.matches && node.matches('a[href]')) preserveModeInInternalLink(node);
                preserveModeOnInternalLinks(node);
            }));
            markKioskLinks();
        }).observe(document.body, { childList: true, subtree: true });

        /* Capture: nessun link esterno può sfuggire al kiosk. */
        document.addEventListener('click', event => {
            const a = event.target.closest && event.target.closest('a[href]');
            if (!a) return;
            const raw = a.getAttribute('href') || '';
            if (!isExternalActionHref(raw)) return;
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            showKioskQr(a.href || raw);
        }, true);
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
                el.classList.remove('diomede-from-left','diomede-from-right');

                const index = document.querySelectorAll('[data-diomede-reveal-ready="1"]').length - 1;
                const delay = Math.min(index % 7, 6) * 82;
                el.style.transitionDelay = delay + 'ms';

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


    function setupKioskInactivityReturn() {
        if (!isKioskMode) return;

        const INACTIVITY_MS = 10 * 60 * 1000;
        let lastActivity = Date.now();
        let inactivityTimer = null;
        let redirecting = false;

        function indexUrl() {
            const root = appRootUrl();
            if (!root) return null;
            const url = new URL('index.html', root);
            url.searchParams.set('mode', 'kiosk');
            return url.href;
        }

        function goToIndexIfInactive() {
            if (redirecting) return;
            const elapsed = Date.now() - lastActivity;
            if (elapsed < INACTIVITY_MS) {
                scheduleCheck(INACTIVITY_MS - elapsed);
                return;
            }

            const target = indexUrl();
            if (!target) return;
            redirecting = true;
            window.location.replace(target);
        }

        function scheduleCheck(delay = INACTIVITY_MS) {
            window.clearTimeout(inactivityTimer);
            inactivityTimer = window.setTimeout(goToIndexIfInactive, Math.max(250, delay));
        }

        function markActivity() {
            if (redirecting) return;
            lastActivity = Date.now();
            scheduleCheck();
        }

        /* Solo interazioni reali dell'ospite: niente eventi sintetici. */
        ['pointerdown', 'touchstart', 'touchmove', 'keydown', 'wheel'].forEach(type => {
            window.addEventListener(type, markActivity, { passive: true, capture: true });
        });
        window.addEventListener('scroll', markActivity, { passive: true, capture: true });

        /* Android può sospendere i timer a schermo spento/in background.
           Quando la pagina torna visibile controlliamo il tempo realmente trascorso. */
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) goToIndexIfInactive();
        });
        window.addEventListener('pageshow', goToIndexIfInactive);

        scheduleCheck();
    }

    function setupKioskToolbarNudge() {
        if (!isKioskMode || !document.body.classList.contains('diomede-menu-page')) return;

        /* Alcuni WebView Android nascondono la toolbar solo dopo che la pagina
           entra in uno stato realmente scrollabile. Il layout resta immobile:
           scrolliamo soltanto di 1-2 px, una volta per apertura della pagina. */
        const nudge = () => {
            try {
                const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
                if (maxScroll > 0) window.scrollTo(0, Math.min(2, maxScroll));
            } catch (_) {}
        };

        requestAnimationFrame(() => requestAnimationFrame(nudge));
        window.setTimeout(nudge, 220);
        window.setTimeout(nudge, 700);
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
        setupKioskMode();
        enhanceLanguageControls();
        updateMenuGreeting();
        setupPageEntrance();
        setupPageTransitions();
        setupReveal();
        setupMenuMotion();
        setupKioskInactivityReturn();
        setupKioskToolbarNudge();
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

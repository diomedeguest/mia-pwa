/* Diomede Luxury - funzioni comuni */
(function () {
    'use strict';

    const scriptUrl = document.currentScript && document.currentScript.src;

    window.diomedeGoBack = function () {
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
    };

    function unlockOrientation() {
        try {
            if (screen.orientation && typeof screen.orientation.unlock === 'function') {
                screen.orientation.unlock();
            }
        } catch (_) {}
    }

    function enhanceLanguageControls() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.setAttribute('role', 'button');
            btn.setAttribute('tabindex', '0');
            btn.setAttribute('aria-label', btn.textContent.trim() === 'ITA' ? 'Italiano' : 'English');
            const updateState = () => btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
            updateState();
            btn.addEventListener('click', () => setTimeout(updateState, 0));
            btn.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    btn.click();
                }
            });
            new MutationObserver(updateState).observe(btn, { attributes: true, attributeFilter: ['class'] });
        });
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
        enhanceLanguageControls();
    });
    window.addEventListener('pageshow', unlockOrientation);
    window.addEventListener('load', registerServiceWorker);
})();

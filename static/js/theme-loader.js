(function () {
    let themeInUse = 'auto';
    const appwrite = localStorage.getItem('appwrite');

    if (appwrite) {
        try {
            const localPrefs = JSON.parse(appwrite);
            if (localPrefs) themeInUse = localPrefs.theme;
        } catch (ignore) {
            // Ignore any errors during JSON parsing
        }
    }

    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    themeInUse = themeInUse === 'auto' ? (systemPrefersDark ? 'dark' : 'light') : themeInUse;

    document.body.setAttribute('class', `theme-${themeInUse}`);
})();

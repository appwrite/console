export function getReferrerAndUtmSource() {
    if (sessionStorage) {
        let values = {};
        if (sessionStorage.getItem('utmReferral')) {
            values = { ...values, utmReferral: sessionStorage.getItem('utmReferral') };
        }
        if (sessionStorage.getItem('utmSource')) {
            values = { ...values, utmSource: sessionStorage.getItem('utmSource') };
        }
        if (sessionStorage.getItem('utmMedium')) {
            values = { ...values, utmMedium: sessionStorage.getItem('utmMedium') };
        }

        return values;
    }
    return {};
}

export function getAllQueryParams() {
    if (typeof window !== 'undefined' && window.location) {
        const urlParams = new URLSearchParams(window.location.search);
        const params = {};

        const utmParams = new Set([
            'utm_source',
            'utm_medium',
            'utm_campaign',
            'utm_term',
            'utm_content'
        ]);

        for (const [key, value] of urlParams.entries()) {
            if (!utmParams.has(key.toLowerCase())) {
                params[key] = value;
            }
        }

        return params;
    }
    return {};
}

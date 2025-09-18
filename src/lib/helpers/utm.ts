const LINKEDIN_TRACKING_ID = 'li_fat_id';
const GOOGLE_TRACKING_ID = 'gclid';
const TWITTER_TRACKING_ID = 'twclid';
const REDDIT_TRACKING_ID = 'rdt_cid';

const TRACKED_QUERY_PARAMS = [
    LINKEDIN_TRACKING_ID,
    GOOGLE_TRACKING_ID,
    TWITTER_TRACKING_ID,
    REDDIT_TRACKING_ID
] as const;

type TrackedParams = Record<(typeof TRACKED_QUERY_PARAMS)[number], string>;

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

export function getTrackedQueryParams(): Partial<TrackedParams> {
    if (typeof window === 'undefined' || !window.location) {
        return {};
    }

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const params: Partial<TrackedParams> = {};

        for (const paramName of TRACKED_QUERY_PARAMS) {
            const value = urlParams.get(paramName);
            if (value) {
                params[paramName] = value;
            }
        }

        return params;
    } catch (error) {
        console.warn('Failed to parse URL search parameters:', error);
        return {};
    }
}

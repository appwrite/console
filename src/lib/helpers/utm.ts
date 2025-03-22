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

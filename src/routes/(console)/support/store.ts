export function isSupportOnline() {
    const currentDate = new Date();
    const day = currentDate.getUTCDay();
    const hour = currentDate.getUTCHours();

    if (day === 1 || day === 6) {
        return false;
    }

    if (hour < 14) {
        return false;
    }

    return true;
}

export function calculateTime(time: number) {
    const milliseconds = Math.floor(time * 1000);
    const seconds = Math.floor(time);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (milliseconds < 1000) {
        return milliseconds + 'ms';
    } else if (seconds < 60) {
        return `${seconds} s`;
    } else if (minutes < 60) {
        return `${minutes} m`;
    } else if (hours < 24) {
        return `${hours} h`;
    } else if (days < 30) {
        return `${days} d`;
    } else if (months < 12) {
        return `${months} M`;
    } else {
        return `${years} y`;
    }
}

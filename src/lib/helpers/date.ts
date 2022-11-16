export const toLocaleDate = (datetime: string) => {
    const date = new Date(datetime);
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hourCycle: 'h23'
    };

    return date.toLocaleDateString('en', options);
};

export const toLocaleDateTime = (datetime: string | number) => {
    const date = new Date(datetime);
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hourCycle: 'h23'
    };

    return date.toLocaleDateString('en', options);
};

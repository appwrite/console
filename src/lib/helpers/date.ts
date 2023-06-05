export const toLocaleDate = (datetime: string | number) => {
    const date = new Date(datetime);
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
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

export const isSameDay = (date1: Date, date2: Date) => {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
};

export const isValidDate = (date: string) => {
    return !isNaN(new Date(date).getTime());
};

export const diffDays = (date1: Date, date2: Date, absoluteValue = true) => {
    const diffTime = absoluteValue
        ? Math.abs(date2.getTime() - date1.getTime())
        : date2.getTime() - date1.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const readableDateString = (datetime: string | number) => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const date = new Date(datetime);
    if (isSameDay(today, date)) {
        return 'Today';
    } else if (isSameDay(yesterday, date)) {
        return 'Yesterday';
    } else {
        return toLocaleDate(datetime);
    }
};
